import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Activity, Users, Trophy, Zap, Radio, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { games, leaderboard, tournaments } from "@/lib/mockData";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NOVA — Play. Compete. Ascend." },
      { name: "description", content: "Jump into real-time multiplayer matches, climb global leaderboards, and compete in live tournaments on NOVA." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const liveTournament = tournaments.find((t) => t.status === "live");
  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-neon/20 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-magenta/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24">
          <Badge variant="outline" className="mb-6 gap-2 border-neon/40 bg-neon/5 px-3 py-1 text-neon">
            <Radio className="h-3 w-3 animate-pulse" /> 184,293 players online now
          </Badge>
          <h1 className="font-display text-5xl font-black uppercase tracking-tight md:text-7xl">
            <span className="block">Enter the</span>
            <span className="block text-gradient-neon">Play Network</span>
          </h1>
          <p className="mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
            Sub-30ms matchmaking, ranked tournaments with real prize pools, voice
            comms, and a global leaderboard. Built for competitors.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-gradient-neon font-semibold text-neon-foreground shadow-neon hover:opacity-90">
              <Link to="/play">
                <Gamepad2 className="mr-2 h-4 w-4" /> Quick Match
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-border bg-surface/50 backdrop-blur">
              <Link to="/tournaments">
                Browse tournaments <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-4">
            {[
              { label: "Daily players", value: "184K", icon: Users },
              { label: "Matches today", value: "1.28M", icon: Activity },
              { label: "Prize pool live", value: "$2.4M", icon: Trophy },
              { label: "Avg. latency", value: "28ms", icon: Zap },
            ].map((s) => (
              <div key={s.label} className="bg-surface p-5">
                <s.icon className="h-4 w-4 text-neon" />
                <div className="mt-3 font-display text-2xl font-bold md:text-3xl">{s.value}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">Featured Games</h2>
            <p className="text-sm text-muted-foreground">Trending titles right now</p>
          </div>
          <Link to="/play" className="text-sm text-neon hover:underline">View all →</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {games.slice(0, 6).map((g) => (
            <Card key={g.id} className="group relative overflow-hidden border-border bg-gradient-card p-5 transition hover:border-neon/40 hover:shadow-neon">
              <div className="flex items-start justify-between">
                <div className="text-4xl">{g.emoji}</div>
                <Badge variant="outline" className="border-border text-xs uppercase tracking-wider">
                  {g.genre}
                </Badge>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">{g.name}</h3>
              <div className="mt-1 font-mono text-xs text-muted-foreground">
                {g.players.toLocaleString()} in queue
              </div>
              <Button asChild variant="ghost" size="sm" className="mt-4 -ml-2 text-neon hover:bg-neon/10 hover:text-neon">
                <Link to="/play">Queue up <ArrowRight className="ml-1 h-3 w-3" /></Link>
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-16 lg:grid-cols-3">
        <Card className="border-border bg-gradient-card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">Top of the Ladder</h3>
            <Link to="/leaderboard" className="text-xs text-neon hover:underline">Full ranks →</Link>
          </div>
          <div className="divide-y divide-border">
            {leaderboard.slice(0, 5).map((p) => (
              <div key={p.handle} className="flex items-center gap-4 py-3">
                <div className={`grid h-8 w-8 place-items-center rounded-md font-display text-sm font-bold ${p.rank === 1 ? "bg-gradient-neon text-neon-foreground" : "bg-surface-2"}`}>
                  {p.rank}
                </div>
                <div className="flex-1">
                  <div className="font-mono text-sm">{p.handle}</div>
                  <div className="text-xs text-muted-foreground">{p.country} · {p.winrate}% winrate</div>
                </div>
                <div className="font-display text-lg font-bold text-neon">{p.rating}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="relative overflow-hidden border-magenta/30 bg-gradient-card p-6 shadow-magenta">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-magenta/20 blur-3xl" />
          <Badge className="bg-magenta text-magenta-foreground hover:bg-magenta">● LIVE NOW</Badge>
          <h3 className="mt-4 font-display text-xl font-bold">{liveTournament?.name}</h3>
          <div className="mt-1 text-sm text-muted-foreground">{liveTournament?.game} · {liveTournament?.region}</div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-md bg-surface-2 p-3">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Prize</div>
              <div className="font-display text-xl font-bold text-gradient-neon">{liveTournament?.prize}</div>
            </div>
            <div className="rounded-md bg-surface-2 p-3">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Players</div>
              <div className="font-display text-xl font-bold">{liveTournament?.participants}</div>
            </div>
          </div>
          <Button asChild className="mt-6 w-full bg-magenta text-magenta-foreground hover:bg-magenta/90">
            <Link to="/tournaments">Spectate live</Link>
          </Button>
        </Card>
      </section>
    </div>
  );
}
