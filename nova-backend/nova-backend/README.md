# NOVA Gaming Platform — Backend

Event-driven, dockerized backend for a multiplayer gaming platform. Pairs with the [Lovable frontend](../) (TanStack Start + React) and exposes:

- **FastAPI** REST + JWT auth
- **WebSocket matchmaking** with Redis-backed queues, reconnect tickets, and skill-based pairing
- **PostgreSQL** for users, matches, leaderboard, tournaments
- **Redis Streams / Pub-Sub** for chat and event fan-out
- **LiveKit** hook for voice rooms (token issuance only — bring your own LiveKit cluster)
- **Analytics** worker rolling up matches → daily metrics

## Architecture

```text
         ┌──────────────┐     ┌──────────────┐
client ──► api (8000)   │◄────► postgres     │
   │     │  - auth      │     └──────────────┘
   │     │  - leaderbd  │     ┌──────────────┐
   │     │  - tourneys  │◄────► redis        │
   │     └──────┬───────┘     │  streams,    │
   │            │             │  pubsub,     │
   ├──ws───► matchmaking ─────►  queues      │
   │        (8001)             └──────┬──────┘
   ├──ws───► chat (8002) ─────────────┤
   │                                  │
   └──http─► analytics (8003) ◄───────┘
```

All services are independent containers behind nginx (`/api`, `/ws/matchmaking`, `/ws/chat`).

## Quick start

```bash
cp .env.example .env
docker compose up --build
```

Services:

| Service       | Port | Purpose                                    |
|---------------|------|--------------------------------------------|
| nginx         | 8080 | Single entrypoint, routes ws/http          |
| api           | 8000 | Auth, leaderboard, tournaments REST        |
| matchmaking   | 8001 | WebSocket queue + ticket reconnect         |
| chat          | 8002 | Channels + presence (Redis pub/sub)        |
| analytics     | 8003 | Rollups + dashboard endpoints              |
| postgres      | 5432 | Primary store                              |
| redis         | 6379 | Queues, streams, presence                  |

Frontend env:

```bash
VITE_MATCHMAKING_WS_URL=ws://localhost:8080/ws/matchmaking
VITE_API_URL=http://localhost:8080/api
```

## WebSocket protocol — matchmaking

Connect: `ws://host/ws/matchmaking?token=<jwt>&ticket=<optional>`

**Client → server**

```json
{ "type": "join",   "game": "neon-strike", "mode": "ranked" }
{ "type": "resume", "ticketId": "...", "game": "...", "mode": "..." }
{ "type": "cancel", "ticketId": "..." }
{ "type": "ping" }
```

**Server → client**

```json
{ "type": "queued", "ticketId": "uuid", "update": { "position": 12, "estimatedWait": 24, "poolSize": 380, "mmrBand": 120 } }
{ "type": "queue_update", "update": { ... } }
{ "type": "match_found", "match": { "matchId": "...", "game": "...", "mode": "...", "server": "eu-west-1", "players": [{"handle":"...","rating":...}] } }
{ "type": "cancelled" }
{ "type": "error", "message": "..." }
```

Tickets persist in Redis (`mm:ticket:<id>`, TTL 5 min) so a dropped client can resume its place in the queue.

## Matchmaker algorithm

Sliding MMR window — every 500 ms the worker scans each `mm:queue:<game>:<mode>` ZSET ordered by MMR, pairs adjacent buckets within `±band`, and grows the band 20 MMR/second up to a max of 600. Matched tickets get a `match_found` event over Redis pub-sub which each WebSocket service forwards to its connected client.

## Auth

`POST /api/auth/register` and `/api/auth/login` issue HS256 JWTs (`SECRET_KEY` env). The matchmaking + chat sockets validate the same token via `?token=` query.

## Voice (LiveKit)

`POST /api/voice/token` returns a LiveKit access token for a given room. You provide `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` — the platform never proxies media.

## Migrations

`migrations/0001_init.sql` runs automatically on first postgres boot via the `docker-entrypoint-initdb.d` mount.

## Production notes

- Put real TLS in front (nginx config is HTTP only for local dev).
- Replace the demo bot-pair logic with your real player identity service.
- Scale `matchmaking` horizontally — queue state lives in Redis, sockets are sticky via nginx `ip_hash`.
- Analytics worker can be split off as a cron / k8s job.

## License

MIT.
