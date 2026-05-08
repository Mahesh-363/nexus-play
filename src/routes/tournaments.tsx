import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { tournaments } from "@/lib/mockData";
import { Calendar, Globe, Trophy, Users } from "lucide-react";

export const Route = createFileRoute("/tournaments")({
  head: () => ({
    meta: [
      { title: "Tournaments — NOVA" },
      { name: "description", content: "Live and upcoming NOVA tournaments with real prize pools. Register, spectate and compete." },
    ],
  }),
  component: TournamentsPage,
});

const statusStyle: Record<string, string> = {
  live: "bg-magenta text-magenta-foreground",
  registration: "bg-neon/15 text-neon border border-neon/40",
  upcoming: "bg-surface-2 text-foreground border border-border",
  ended: "bg-surface text-muted-foreground border border-border",
};

function TournamentsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold md:text-4xl">Tournaments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Compete for prize pools, climb brackets, broadcast your runs.
        </p>
      </div>

      {/* Featured live */}
      {tournaments.filter((t) => t.status === "live").map((t) => (
        <Card key={t.id} className="relative mb-8 overflow-hidden border-magenta/40 bg-gradient-card p-8 shadow-magenta">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-magenta/20 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-neon/15 blur-3xl" />
          <div className="relative grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Badge className="bg-magenta text-magenta-foreground hover:bg-magenta">● LIVE FINALS</Badge>
              <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">{t.name}</h2>
              <p className="mt-2 text-muted-foreground">{t.game}</p>
              <div className="mt-6 flex flex-wrap gap-5 text-sm">
                <div className="flex items-center gap-2"><Trophy className="h-4 w-4 text-warning" /> <span className="font-display text-lg font-bold text-gradient-neon">{t.prize}</span></div>
                <div className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" /> {t.participants} / {t.capacity}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><Globe className="h-4 w-4" /> {t.region}</div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button className="bg-magenta text-magenta-foreground hover:bg-magenta/90">Spectate live</Button>
                <Button variant="outline" className="border-border bg-surface/50">Bracket</Button>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-surface/60 p-5">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Now playing</div>
              <div className="mt-3 space-y-3">
                {[
                  { a: "VOID_REAPER", b: "nyx.exe", sa: 2, sb: 1 },
                  { a: "Aurora_77", b: "kibou", sa: 0, sb: 0 },
                ].map((m, i) => (
                  <div key={i} className="rounded-md bg-surface-2 p-3 font-mono text-sm">
                    <div className="flex items-center justify-between">
                      <span>{m.a}</span><span className="text-neon">{m.sa}</span>
                    </div>
                    <div className="my-1 h-px bg-border" />
                    <div className="flex items-center justify-between">
                      <span>{m.b}</span><span className="text-neon">{m.sb}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      ))}

      <div className="grid gap-4 md:grid-cols-2">
        {tournaments.filter((t) => t.status !== "live").map((t) => {
          const fill = (t.participants / t.capacity) * 100;
          return (
            <Card key={t.id} className="border-border bg-gradient-card p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge className={`${statusStyle[t.status]} hover:${statusStyle[t.status]}`}>
                    {t.status.toUpperCase()}
                  </Badge>
                  <h3 className="mt-3 font-display text-xl font-bold">{t.name}</h3>
                  <p className="text-sm text-muted-foreground">{t.game} · {t.region}</p>
                </div>
                <div className="text-right">
                  <div className="font-display text-2xl font-bold text-gradient-neon">{t.prize}</div>
                  <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" /> {t.startsIn}
                  </div>
                </div>
              </div>
              <div className="mt-5">
                <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                  <span>Registration</span>
                  <span className="font-mono">{t.participants} / {t.capacity}</span>
                </div>
                <Progress value={fill} className="h-1.5" />
              </div>
              <Button
                disabled={t.status === "ended"}
                className="mt-5 w-full bg-gradient-neon font-semibold text-neon-foreground hover:opacity-90 disabled:opacity-40"
              >
                {t.status === "registration" ? "Register" : t.status === "upcoming" ? "Notify me" : "View results"}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
