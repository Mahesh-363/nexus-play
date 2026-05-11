"""WebSocket matchmaking service.

Protocol (see ../README.md):
  client → server: join | resume | cancel | ping
  server → client: queued | queue_update | match_found | cancelled | error | pong

Queue state lives entirely in Redis so the service is horizontally scalable.
A background worker pairs adjacent MMR buckets every 500 ms.
"""
from __future__ import annotations

import asyncio
import json
import os
import time
import uuid
from contextlib import asynccontextmanager
from typing import Optional

import redis.asyncio as redis
from fastapi import FastAPI, Query, WebSocket, WebSocketDisconnect
from jose import jwt, JWTError

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
SECRET = os.getenv("SECRET_KEY", "dev")
ALG = os.getenv("JWT_ALG", "HS256")

TICKET_TTL = 300        # seconds — how long we hold a queue ticket for reconnect
PAIR_INTERVAL = 0.5     # seconds between matcher passes
BAND_START = 80
BAND_GROWTH = 20        # MMR per second of waiting
BAND_MAX = 600

r: redis.Redis = redis.from_url(REDIS_URL, decode_responses=True)
MATCH_CHANNEL = "mm:match"   # pubsub channel for "your ticket matched"


def queue_key(game: str, mode: str) -> str:
    return f"mm:queue:{game}:{mode}"


def ticket_key(tid: str) -> str:
    return f"mm:ticket:{tid}"


def decode_user(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET, algorithms=[ALG])
    except JWTError as e:
        raise ValueError(str(e))


# ───────────── matcher worker ─────────────
async def matcher_loop():
    """Scan every queue and pair players within an expanding MMR band."""
    while True:
        try:
            cursor = 0
            keys: list[str] = []
            while True:
                cursor, batch = await r.scan(cursor, match="mm:queue:*", count=200)
                keys.extend(batch)
                if cursor == 0:
                    break
            for key in keys:
                await pair_in_queue(key)
        except Exception as e:
            print(f"[matcher] error: {e}")
        await asyncio.sleep(PAIR_INTERVAL)


async def pair_in_queue(key: str):
    members = await r.zrange(key, 0, -1, withscores=True)
    if len(members) < 2:
        return
    now = time.time()
    used: set[str] = set()
    pairs: list[tuple[str, str]] = []

    # Each member is "ticket_id"; score is mmr. Pair sequentially.
    for i in range(len(members)):
        tid_a, mmr_a = members[i]
        if tid_a in used:
            continue
        ticket_a = await r.hgetall(ticket_key(tid_a))
        if not ticket_a:
            await r.zrem(key, tid_a)
            continue
        wait_a = now - float(ticket_a.get("joined_at", now))
        band_a = min(BAND_START + wait_a * BAND_GROWTH, BAND_MAX)
        for j in range(i + 1, len(members)):
            tid_b, mmr_b = members[j]
            if tid_b in used:
                continue
            if abs(mmr_a - mmr_b) > band_a:
                continue
            used.add(tid_a)
            used.add(tid_b)
            pairs.append((tid_a, tid_b))
            break

    for tid_a, tid_b in pairs:
        a = await r.hgetall(ticket_key(tid_a))
        b = await r.hgetall(ticket_key(tid_b))
        if not a or not b:
            continue
        match_id = str(uuid.uuid4())
        match = {
            "matchId": match_id,
            "game": a["game"],
            "mode": a["mode"],
            "server": "eu-west-1",
            "players": [
                {"handle": a.get("handle", a["user_id"][:8]), "rating": int(a["mmr"])},
                {"handle": b.get("handle", b["user_id"][:8]), "rating": int(b["mmr"])},
            ],
        }
        await r.zrem(key, tid_a, tid_b)
        await r.delete(ticket_key(tid_a), ticket_key(tid_b))
        for tid in (tid_a, tid_b):
            await r.publish(MATCH_CHANNEL, json.dumps({"ticketId": tid, "match": match}))


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(matcher_loop())
    yield
    task.cancel()


app = FastAPI(lifespan=lifespan)


# ───────────── WebSocket endpoint ─────────────
@app.websocket("/ws/matchmaking")
async def ws_matchmaking(
    ws: WebSocket,
    token: Optional[str] = Query(default=None),
    ticket: Optional[str] = Query(default=None),
):
    await ws.accept()
    user_id = "anon-" + uuid.uuid4().hex[:8]
    handle = "guest"
    mmr = 1500
    if token:
        try:
            claims = decode_user(token)
            user_id = claims["sub"]
            handle = claims.get("handle", handle)
            mmr = int(claims.get("rating", 1500))
        except ValueError:
            await ws.send_json({"type": "error", "message": "invalid token"})
            await ws.close()
            return

    state: dict = {"ticket": ticket, "game": None, "mode": None}
    pubsub = r.pubsub()
    await pubsub.subscribe(MATCH_CHANNEL)
    listener = asyncio.create_task(forward_match(ws, pubsub, state))
    updater = asyncio.create_task(send_queue_updates(ws, state))

    try:
        while True:
            msg = await ws.receive_json()
            t = msg.get("type")
            if t == "ping":
                await ws.send_json({"type": "pong"})
            elif t == "join":
                game, mode = msg["game"], msg["mode"]
                tid = str(uuid.uuid4())
                state.update({"ticket": tid, "game": game, "mode": mode})
                await r.hset(
                    ticket_key(tid),
                    mapping={
                        "user_id": user_id,
                        "handle": handle,
                        "mmr": mmr,
                        "game": game,
                        "mode": mode,
                        "joined_at": time.time(),
                    },
                )
                await r.expire(ticket_key(tid), TICKET_TTL)
                await r.zadd(queue_key(game, mode), {tid: mmr})
                update = await build_update(game, mode, tid)
                await ws.send_json({"type": "queued", "ticketId": tid, "update": update})
            elif t == "resume":
                tid = msg.get("ticketId")
                game, mode = msg.get("game"), msg.get("mode")
                if tid and await r.exists(ticket_key(tid)):
                    await r.expire(ticket_key(tid), TICKET_TTL)
                    state.update({"ticket": tid, "game": game, "mode": mode})
                    update = await build_update(game, mode, tid)
                    await ws.send_json({"type": "queued", "ticketId": tid, "update": update})
                else:
                    await ws.send_json({"type": "cancelled"})
            elif t == "cancel":
                tid = msg.get("ticketId") or state.get("ticket")
                if tid:
                    info = await r.hgetall(ticket_key(tid))
                    if info:
                        await r.zrem(queue_key(info["game"], info["mode"]), tid)
                    await r.delete(ticket_key(tid))
                state.update({"ticket": None, "game": None, "mode": None})
                await ws.send_json({"type": "cancelled"})
    except WebSocketDisconnect:
        pass
    finally:
        listener.cancel()
        updater.cancel()
        await pubsub.unsubscribe(MATCH_CHANNEL)
        # Don't drop the ticket — let the client reconnect within TTL.


async def build_update(game: str, mode: str, tid: str) -> dict:
    qkey = queue_key(game, mode)
    pool = await r.zcard(qkey)
    rank = await r.zrank(qkey, tid)
    pos = (rank or 0) + 1
    info = await r.hgetall(ticket_key(tid))
    wait = time.time() - float(info.get("joined_at", time.time())) if info else 0
    band = int(min(BAND_START + wait * BAND_GROWTH, BAND_MAX))
    eta = max(2, int(pool / 4))
    return {"position": pos, "estimatedWait": eta, "poolSize": pool, "mmrBand": band}


async def send_queue_updates(ws: WebSocket, state: dict):
    try:
        while True:
            await asyncio.sleep(2)
            tid = state.get("ticket")
            game, mode = state.get("game"), state.get("mode")
            if not tid or not game or not mode:
                continue
            if not await r.exists(ticket_key(tid)):
                continue
            update = await build_update(game, mode, tid)
            await ws.send_json({"type": "queue_update", "update": update})
    except (WebSocketDisconnect, RuntimeError):
        return


async def forward_match(ws: WebSocket, pubsub, state: dict):
    try:
        async for raw in pubsub.listen():
            if raw is None or raw.get("type") != "message":
                continue
            data = json.loads(raw["data"])
            if data["ticketId"] == state.get("ticket"):
                await ws.send_json({"type": "match_found", "match": data["match"]})
                state.update({"ticket": None, "game": None, "mode": None})
    except (WebSocketDisconnect, RuntimeError):
        return


@app.get("/health")
async def health():
    return {"ok": True}
