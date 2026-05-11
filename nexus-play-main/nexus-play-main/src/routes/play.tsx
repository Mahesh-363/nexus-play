import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { games } from "@/lib/mockData";
import { useMatchmaking } from "@/hooks/useMatchmaking";
import {
  Loader2,
  Users,
  X,
  Zap,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "Play — NOVA" },
      {
        name: "description",
        content:
          "Real-time WebSocket matchmaking with skill-based pairing and reconnect.",
      },
    ],
  }),
  component: PlayPage,
});

function PlayPage() {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [mode, setMode] = useState<"ranked" | "casual" | "private">("ranked");
  const mm = useMatchmaking();

  const start = (id: string) => {
    setActiveGame(id);
    mm.join(id, mode);
  };
  const cancel = () => {
    setActiveGame(null);
    mm.cancel();
  };

  const queueing =
    mm.status === "queued" ||
    mm.status === "connecting" ||
    mm.status === "reconnecting";
  const game = games.find((g) => g.id === activeGame);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Lobby</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live WebSocket matchmaking — pairs you within ±MMR band.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ConnectionPill status={mm.status} retry={mm.retryAttempt} />
          <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
            {(["ranked", "casual", "private"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                disabled={queueing}
                className={`rounded-md px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition disabled:opacity-50 ${
                  mode === m
                    ? "bg-gradient-neon text-neon-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {mm.status === "matched" && mm.match && (
        <Card className="mb-8 border-success/50 bg-gradient-card p-8 shadow-neon">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-success/15">
                <CheckCircle2 className="h-7 w-7 text-success" />
              </div>
              <div>
                <Badge className="bg-success/15 text-success hover:bg-success/15">
                  MATCH FOUND
                </Badge>
                <h3 className="mt-2 font-display text-xl font-bold">
                  {mm.match.game} · {mm.match.mode}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Server: {mm.match.server} · {mm.match.players.length} players
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {mm.match.players.map((p) => (
                <Badge key={p.handle} variant="outline" className="font-mono">
                  {p.handle} · {p.rating}
                </Badge>
              ))}
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            <Button className="bg-gradient-neon font-semibold text-neon-foreground">
              Accept & launch
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                cancel();
              }}
            >
              Dismiss
            </Button>
          </div>
        </Card>
      )}

      {queueing && game && (
        <Card className="mb-8 flex flex-col items-center gap-4 border-neon/40 bg-gradient-card p-8 shadow-neon md:flex-row md:justify-between">
          <div className="flex items-center gap-5">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-neon/10 animate-pulse-neon">
              <Loader2 className="h-7 w-7 animate-spin text-neon" />
            </div>
            <div>
              <Badge className="bg-neon/15 text-neon hover:bg-neon/15">
                {mm.status === "reconnecting"
                  ? `RECONNECTING · attempt ${mm.retryAttempt}`
                  : mode.toUpperCase()}
              </Badge>
              <h3 className="mt-2 font-display text-xl font-bold">
                {mm.status === "connecting"
                  ? "Opening WebSocket…"
                  : mm.status === "reconnecting"
                    ? "Restoring queue ticket…"
                    : "Searching for opponents…"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {game.name}
                {mm.queue && (
                  <>
                    {" · "}position #{mm.queue.position}
                    {" · pool "}
                    {mm.queue.poolSize}
                    {" · MMR ±"}
                    {mm.queue.mmrBand}
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-mono text-3xl font-bold text-neon">
                {mm.queue ? `~${mm.queue.estimatedWait}s` : "—"}
              </div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                est. wait
              </div>
            </div>
            <Button
              variant="outline"
              onClick={cancel}
              className="border-destructive/40 text-destructive hover:bg-destructive/10"
            >
              <X className="mr-1 h-4 w-4" /> Cancel
            </Button>
          </div>
        </Card>
      )}

      {(mm.status === "error" || mm.status === "disconnected") && (
        <Card className="mb-8 flex items-center justify-between gap-4 border-destructive/40 bg-gradient-card p-5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <div className="font-semibold">Matchmaking offline</div>
              <div className="text-xs text-muted-foreground">
                {mm.error ?? "WebSocket disconnected."} Set
                <code className="mx-1 rounded bg-surface px-1">
                  VITE_MATCHMAKING_WS_URL
                </code>
                to your backend.
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={() => mm.reconnect()}>
            <RefreshCw className="mr-1 h-4 w-4" /> Retry
          </Button>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((g) => (
          <Card
            key={g.id}
            className="group flex flex-col overflow-hidden border-border bg-gradient-card p-5 transition hover:border-neon/40"
          >
            <div className="flex items-start justify-between">
              <div className="text-5xl">{g.emoji}</div>
              <Badge variant="outline" className="text-xs uppercase tracking-wider">
                {g.genre}
              </Badge>
            </div>
            <h3 className="mt-4 font-display text-xl font-bold">{g.name}</h3>
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" /> {g.players.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-neon" /> live queue
              </span>
            </div>
            <Button
              onClick={() => start(g.id)}
              disabled={queueing}
              className="mt-5 bg-gradient-neon font-semibold text-neon-foreground hover:opacity-90"
            >
              Queue up
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ConnectionPill({
  status,
  retry,
}: {
  status: ReturnType<typeof useMatchmaking>["status"];
  retry: number;
}) {
  const map = {
    idle: { color: "text-muted-foreground", icon: WifiOff, label: "Idle" },
    connecting: { color: "text-warning", icon: Loader2, label: "Connecting" },
    queued: { color: "text-neon", icon: Wifi, label: "Live" },
    matched: { color: "text-success", icon: CheckCircle2, label: "Matched" },
    reconnecting: {
      color: "text-warning",
      icon: RefreshCw,
      label: `Reconnect ${retry}`,
    },
    error: { color: "text-destructive", icon: AlertTriangle, label: "Error" },
    disconnected: { color: "text-destructive", icon: WifiOff, label: "Offline" },
  } as const;
  const s = map[status];
  const Icon = s.icon;
  return (
    <div
      className={`flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-wider ${s.color}`}
    >
      <Icon
        className={`h-3 w-3 ${
          status === "connecting" || status === "reconnecting"
            ? "animate-spin"
            : ""
        }`}
      />
      {s.label}
    </div>
  );
}
