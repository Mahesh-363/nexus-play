import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy import text

DATABASE_URL = os.getenv("DATABASE_URL")
SECRET = os.getenv("SECRET_KEY", "dev")
ALG = os.getenv("JWT_ALG", "HS256")

engine = create_async_engine(DATABASE_URL, pool_pre_ping=True)
Session = async_sessionmaker(engine, expire_on_commit=False)
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2 = OAuth2PasswordBearer(tokenUrl="/auth/login")

app = FastAPI(title="NOVA API")
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)


async def db():
    async with Session() as s:
        yield s


def make_token(sub: str) -> str:
    return jwt.encode(
        {"sub": sub, "exp": datetime.utcnow() + timedelta(days=7)}, SECRET, ALG
    )


async def current_user(token: str = Depends(oauth2), s: AsyncSession = Depends(db)):
    try:
        payload = jwt.decode(token, SECRET, algorithms=[ALG])
        uid = payload["sub"]
    except (JWTError, KeyError):
        raise HTTPException(401, "invalid token")
    row = (await s.execute(text("SELECT id, handle, rating FROM users WHERE id=:i"), {"i": uid})).first()
    if not row:
        raise HTTPException(401, "user gone")
    return dict(row._mapping)


# ───── auth ─────
class RegisterIn(BaseModel):
    handle: str
    email: EmailStr
    password: str


class LoginIn(BaseModel):
    email: EmailStr
    password: str


@app.post("/auth/register")
async def register(body: RegisterIn, s: AsyncSession = Depends(db)):
    h = pwd.hash(body.password)
    try:
        row = (
            await s.execute(
                text(
                    "INSERT INTO users(handle,email,password) VALUES(:h,:e,:p) RETURNING id"
                ),
                {"h": body.handle, "e": body.email, "p": h},
            )
        ).first()
        await s.commit()
    except Exception:
        raise HTTPException(409, "handle/email taken")
    return {"token": make_token(str(row.id))}


@app.post("/auth/login")
async def login(body: LoginIn, s: AsyncSession = Depends(db)):
    row = (
        await s.execute(
            text("SELECT id, password FROM users WHERE email=:e"), {"e": body.email}
        )
    ).first()
    if not row or not pwd.verify(body.password, row.password):
        raise HTTPException(401, "bad creds")
    return {"token": make_token(str(row.id)), "token_type": "bearer"}


@app.get("/me")
async def me(u=Depends(current_user)):
    return u


# ───── leaderboard ─────
@app.get("/leaderboard")
async def leaderboard(limit: int = 50, s: AsyncSession = Depends(db)):
    rows = (
        await s.execute(
            text(
                "SELECT handle, rating, country FROM users ORDER BY rating DESC LIMIT :l"
            ),
            {"l": limit},
        )
    ).all()
    return [dict(r._mapping) for r in rows]


# ───── tournaments ─────
@app.get("/tournaments")
async def tournaments(s: AsyncSession = Depends(db)):
    rows = (
        await s.execute(
            text(
                "SELECT t.*, COUNT(e.user_id) AS participants "
                "FROM tournaments t LEFT JOIN tournament_entries e ON e.tournament_id=t.id "
                "GROUP BY t.id ORDER BY starts_at"
            )
        )
    ).all()
    return [dict(r._mapping) for r in rows]


@app.post("/tournaments/{tid}/register")
async def register_tournament(tid: str, u=Depends(current_user), s: AsyncSession = Depends(db)):
    await s.execute(
        text(
            "INSERT INTO tournament_entries(tournament_id,user_id) VALUES(:t,:u) ON CONFLICT DO NOTHING"
        ),
        {"t": tid, "u": u["id"]},
    )
    await s.commit()
    return {"ok": True}


# ───── voice (LiveKit) ─────
@app.post("/voice/token")
async def voice_token(room: str, u=Depends(current_user)):
    api_key = os.getenv("LIVEKIT_API_KEY")
    api_secret = os.getenv("LIVEKIT_API_SECRET")
    url = os.getenv("LIVEKIT_URL")
    if not (api_key and api_secret and url):
        raise HTTPException(503, "LiveKit not configured")
    from livekit import api  # type: ignore

    token = (
        api.AccessToken(api_key, api_secret)
        .with_identity(str(u["id"]))
        .with_name(u["handle"])
        .with_grants(api.VideoGrants(room=room, room_join=True))
        .to_jwt()
    )
    return {"url": url, "token": token}


@app.get("/health")
async def health():
    return {"ok": True}
