import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { games } from "@/lib/mockData";
import { Loader2, Users, X, Zap } from "lucide-react";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "Play — NOVA" },
      { name: "description", content: "Pick a game and queue up. Real-time matchmaking with skill-based pairing." },
    ],
  }),
  component: PlayPage,
});

function PlayPage() {
  const [queueing, setQueueing] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [mode, setMode] = useState<"ranked" | "casual" | "private">("ranked");

  useEffect(() => {
    if (!queueing) return;
    const i = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(i);
  }, [queueing]);

  const start = (id: string) => { setQueueing(id); setSeconds(0); };
  const cancel = () => { setQueueing(null); setSeconds(0); };
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Lobby</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick a title — our matchmaker pairs you within 2× your MMR band.
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
          {(["ranked", "casual", "private"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-md px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                mode === m ? "bg-gradient-neon text-neon-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {queueing && (
        <Card className="mb-8 flex flex-col items-center gap-4 border-neon/40 bg-gradient-card p-8 shadow-neon md:flex-row md:justify-between">
          <div className="flex items-center gap-5">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-neon/10 animate-pulse-neon">
              <Loader2 className="h-7 w-7 animate-spin text-neon" />
            </div>
            <div>
              <Badge className="bg-neon/15 text-neon hover:bg-neon/15">{mode.toUpperCase()}</Badge>
              <h3 className="mt-2 font-display text-xl font-bold">
                Searching for opponents…
              </h3>
              <p className="text-sm text-muted-foreground">
                {games.find((g) => g.id === queueing)?.name} · MMR band ±120
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-mono text-3xl font-bold text-neon">{fmt(seconds)}</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">in queue</div>
            </div>
            <Button variant="outline" onClick={cancel} className="border-destructive/40 text-destructive hover:bg-destructive/10">
              <X className="mr-1 h-4 w-4" /> Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((g) => (
          <Card key={g.id} className="group flex flex-col overflow-hidden border-border bg-gradient-card p-5 transition hover:border-neon/40">
            <div className="flex items-start justify-between">
              <div className="text-5xl">{g.emoji}</div>
              <Badge variant="outline" className="text-xs uppercase tracking-wider">{g.genre}</Badge>
            </div>
            <h3 className="mt-4 font-display text-xl font-bold">{g.name}</h3>
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {g.players.toLocaleString()}</span>
              <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-neon" /> ~{Math.floor(Math.random() * 30 + 10)}s wait</span>
            </div>
            <Button
              onClick={() => start(g.id)}
              disabled={!!queueing}
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
