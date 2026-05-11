# NOVA — Multiplayer Gaming Platform

A scalable, real-time multiplayer gaming platform with matchmaking, leaderboards, tournaments, voice & chat, and analytics. Built as a polished frontend shell ready to plug into a FastAPI + Redis + Postgres backend (provided separately as `nova-backend.zip`).

---

## ✨ Features

- **Real-time matchmaking** — WebSocket-driven queue with MMR sliding window, position/pool/ETA updates, reconnect tickets, and exponential backoff.
- **Demo fallback** — If no backend is reachable, matchmaking automatically simulates a match so the UI is fully demoable.
- **Leaderboards** — Global rankings with rating, win/loss, winrate, country, and trend.
- **Tournament management** — Live, upcoming, registration, and ended brackets with prize pools and capacity.
- **Chat system** — Multi-channel chat UI (general, LFG, tournaments, dev, trash-talk).
- **Voice (LiveKit-ready)** — Token endpoint stubbed in backend; frontend ready to wire LiveKit rooms.
- **Analytics dashboard** — DAU, matches/hour, game distribution, peak concurrents, revenue.
- **JWT auth** — Login route + backend `/auth/login` issuing JWTs.
- **Event-driven** — Redis Pub/Sub for chat, ZSETs for matchmaking, async workers for analytics rollups.
- **Dockerized microservices** — `docker compose up --build` for the full backend stack.

---

## 🧱 Stack

**Frontend**
- React 19 + TanStack Start v1 (SSR + file-based routing)
- Vite 7, TypeScript (strict)
- Tailwind v4 (semantic tokens in `src/styles.css`)
- shadcn/ui, lucide-react, framer-motion, recharts

**Backend** (in `nova-backend.zip`)
- FastAPI (API, matchmaking, chat, analytics services)
- Redis (queues, pub/sub, reconnect tickets)
- PostgreSQL (users, matches, tournaments, leaderboards, analytics rollups)
- Nginx reverse proxy (`/api`, `/ws`)
- Docker Compose orchestration
- LiveKit token issuer (voice)

---

## 🚀 Getting Started

### 1. Frontend

```bash
bun install
bun run dev
```

Open http://localhost:5173

### 2. Backend (optional — demo mode works without it)

```bash
unzip nova-backend.zip
cd nova-backend
docker compose up --build
```

Services:
- Nginx gateway → `http://localhost`
- API → `http://localhost/api`
- Matchmaking WS → `ws://localhost/ws/matchmaking`
- Chat WS → `ws://localhost/ws/chat`

### 3. Connect frontend to backend

Create `.env` at the project root:

```env
VITE_MATCHMAKING_WS_URL=ws://localhost/ws/matchmaking
VITE_CHAT_WS_URL=ws://localhost/ws/chat
VITE_API_URL=http://localhost/api
VITE_LIVEKIT_URL=wss://your-livekit-host
```

Restart the dev server.

---

## 🎮 Matchmaking Flow

1. Click **Queue up** on a game card.
2. Frontend opens a WebSocket to `VITE_MATCHMAKING_WS_URL` and sends `{ type: "join", game, mode }`.
3. Server places the user in a Redis ZSET keyed by MMR; replies with periodic `queue_update` (position, pool size, MMR band, ETA).
4. When two compatible tickets are found, server sends `match_found` with players and game server info.
5. On disconnect, the client stores a reconnect ticket and resumes its slot on reconnect (Redis-backed).
6. **Demo mode**: after 2 failed connection attempts, a simulated queue fires a `match_found` event in ~6s.

---

## 📁 Project Structure

```
src/
├── components/        # AppSidebar, TopBar, shadcn/ui
├── hooks/
│   └── useMatchmaking.ts   # WebSocket lifecycle + demo fallback
├── lib/
│   └── mockData.ts          # Games, leaderboard, tournaments, chat, analytics
├── routes/
│   ├── __root.tsx
│   ├── index.tsx            # Landing
│   ├── play.tsx             # Lobby + matchmaking
│   ├── leaderboard.tsx
│   ├── tournaments.tsx
│   ├── chat.tsx
│   ├── analytics.tsx
│   └── login.tsx
├── styles.css         # Design tokens (oklch)
└── router.tsx
```

---

## 🎨 Design System

All colors live as semantic tokens in `src/styles.css` (oklch). Use Tailwind classes like `bg-neon`, `text-magenta`, `bg-gradient-card`, `shadow-neon`. Never hard-code hex values in components.

---

## 🔐 Environment Variables

| Var | Purpose | Default |
|---|---|---|
| `VITE_MATCHMAKING_WS_URL` | Matchmaking WebSocket | `ws://localhost:8000/ws/matchmaking` |
| `VITE_CHAT_WS_URL` | Chat WebSocket | — |
| `VITE_API_URL` | REST API base | — |
| `VITE_LIVEKIT_URL` | LiveKit signaling | — |

Backend secrets (in `nova-backend/.env`): `JWT_SECRET`, `POSTGRES_*`, `REDIS_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`.

---

## 🛣️ Roadmap

- [ ] Wire LiveKit rooms in `chat.tsx` voice panel
- [ ] Tournament bracket visualizer
- [ ] Friends + party system
- [ ] Per-game leaderboard filters
- [ ] Anti-cheat hooks in match results pipeline

---

## 📄 License

MIT
