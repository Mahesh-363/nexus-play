"""Chat service — channel-based pub/sub over WebSockets.

Client → server: { "type": "send", "channel": "#general", "message": "..." }
                 { "type": "join", "channel": "#general" }
Server → client: { "type": "message", "channel": "...", "user": "...", "message": "...", "ts": iso }
                 { "type": "presence", "channel": "...", "users": N }
"""
from __future__ import annotations

import asyncio
import json
import os
import uuid
from datetime import datetime, timezone
from typing import Optional

import redis.asyncio as redis
from fastapi import FastAPI, Query, WebSocket, WebSocketDisconnect
from jose import jwt, JWTError

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
SECRET = os.getenv("SECRET_KEY", "dev")
ALG = os.getenv("JWT_ALG", "HS256")

r = redis.from_url(REDIS_URL, decode_responses=True)
app = FastAPI()


def chan_topic(channel: str) -> str:
    return f"chat:{channel}"


def chan_presence(channel: str) -> str:
    return f"chat:presence:{channel}"


@app.websocket("/ws/chat")
async def ws_chat(ws: WebSocket, token: Optional[str] = Query(default=None)):
    await ws.accept()
    handle = "guest-" + uuid.uuid4().hex[:6]
    if token:
        try:
            claims = jwt.decode(token, SECRET, algorithms=[ALG])
            handle = claims.get("handle", handle)
        except JWTError:
            await ws.send_json({"type": "error", "message": "invalid token"})
            await ws.close()
            return

    pubsub = r.pubsub()
    joined: set[str] = set()

    async def reader():
        async for raw in pubsub.listen():
            if raw is None or raw.get("type") != "message":
                continue
            await ws.send_text(raw["data"])

    listener = asyncio.create_task(reader())

    try:
        while True:
            msg = await ws.receive_json()
            t = msg.get("type")
            if t == "join":
                channel = msg["channel"]
                if channel not in joined:
                    await pubsub.subscribe(chan_topic(channel))
                    await r.sadd(chan_presence(channel), handle)
                    joined.add(channel)
                    users = await r.scard(chan_presence(channel))
                    await ws.send_json({"type": "presence", "channel": channel, "users": users})
            elif t == "send":
                payload = json.dumps({
                    "type": "message",
                    "channel": msg["channel"],
                    "user": handle,
                    "message": msg["message"][:1000],
                    "ts": datetime.now(timezone.utc).isoformat(),
                })
                await r.publish(chan_topic(msg["channel"]), payload)
                # Persist to a stream for history (capped).
                await r.xadd(f"chat:hist:{msg['channel']}", {"data": payload}, maxlen=500, approximate=True)
    except WebSocketDisconnect:
        pass
    finally:
        listener.cancel()
        for c in joined:
            await r.srem(chan_presence(c), handle)
        await pubsub.unsubscribe()


@app.get("/history/{channel}")
async def history(channel: str, limit: int = 50):
    entries = await r.xrevrange(f"chat:hist:{channel}", count=limit)
    return [json.loads(e[1]["data"]) for e in entries][::-1]


@app.get("/health")
async def health():
    return {"ok": True}
