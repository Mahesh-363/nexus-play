"""Analytics service — daily rollups + dashboard endpoints.

Consumes the `mm:match` Redis pub/sub stream to count matches in real time,
and rolls totals into `analytics_daily` once a minute.
"""
from __future__ import annotations

import asyncio
import json
import os
from contextlib import asynccontextmanager
from datetime import date

import redis.asyncio as redis
from fastapi import FastAPI
from sqlalchemy import text
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

DATABASE_URL = os.getenv("DATABASE_URL")
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

engine = create_async_engine(DATABASE_URL, pool_pre_ping=True)
Session = async_sessionmaker(engine, expire_on_commit=False)
r = redis.from_url(REDIS_URL, decode_responses=True)

LIVE_KEY = "analytics:live"


async def consume_matches():
    pubsub = r.pubsub()
    await pubsub.subscribe("mm:match")
    seen: set[str] = set()
    async for raw in pubsub.listen():
        if raw is None or raw.get("type") != "message":
            continue
        try:
            data = json.loads(raw["data"])
            mid = data["match"]["matchId"]
            if mid in seen:
                continue
            seen.add(mid)
            await r.hincrby(LIVE_KEY, "matches", 1)
            await r.hincrby(LIVE_KEY, f"game:{data['match']['game']}", 1)
        except Exception as e:
            print(f"[analytics] consume err: {e}")


async def rollup_loop():
    while True:
        await asyncio.sleep(60)
        try:
            data = await r.hgetall(LIVE_KEY)
            matches = int(data.get("matches", 0))
            today = date.today().isoformat()
            async with Session() as s:
                await s.execute(
                    text(
                        "INSERT INTO analytics_daily(day, matches_played) VALUES(:d,:m) "
                        "ON CONFLICT (day) DO UPDATE SET matches_played = analytics_daily.matches_played + :m"
                    ),
                    {"d": today, "m": matches},
                )
                await s.commit()
            await r.hset(LIVE_KEY, mapping={"matches": 0})
        except Exception as e:
            print(f"[analytics] rollup err: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    t1 = asyncio.create_task(consume_matches())
    t2 = asyncio.create_task(rollup_loop())
    yield
    t1.cancel()
    t2.cancel()


app = FastAPI(lifespan=lifespan)


@app.get("/dashboard")
async def dashboard():
    live = await r.hgetall(LIVE_KEY)
    async with Session() as s:
        rows = (await s.execute(text(
            "SELECT day, matches_played, dau FROM analytics_daily ORDER BY day DESC LIMIT 14"
        ))).all()
    return {
        "live": {k: int(v) for k, v in live.items() if v.isdigit()},
        "history": [dict(row._mapping) for row in rows],
    }


@app.get("/health")
async def health():
    return {"ok": True}
