import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { leaderboard } from "@/lib/mockData";
import { TrendingUp, TrendingDown, Minus, Crown, Medal } from "lucide-react";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — NOVA" },
      { name: "description", content: "Global player rankings across all NOVA games. Updated in real time." },
    ],
  }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold md:text-4xl">Global Leaderboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Top operators across the entire NOVA play network · Season 4
        </p>
      </div>

      {/* Podium */}
      <div className="mb-10 grid gap-4 md:grid-cols-3">
        {leaderboard.slice(0, 3).map((p, i) => (
          <Card
            key={p.handle}
            className={`relative overflow-hidden border-border bg-gradient-card p-6 ${
              i === 0 ? "md:order-2 md:-mt-4 border-neon/40 shadow-neon" : i === 1 ? "md:order-1" : "md:order-3"
            }`}
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-neon/10 blur-3xl" />
            <div className="flex items-center justify-between">
              {i === 0 ? <Crown className="h-6 w-6 text-warning" /> : <Medal className="h-6 w-6 text-muted-foreground" />}
              <span className="font-display text-4xl font-black text-muted-foreground/40">#{p.rank}</span>
            </div>
            <div className="mt-4 font-mono text-lg font-semibold">{p.handle}</div>
            <div className="text-xs text-muted-foreground">{p.country}</div>
            <div className="mt-4 flex items-end justify-between">
              <div className="font-display text-3xl font-bold text-gradient-neon">{p.rating}</div>
              <div className="text-right text-xs">
                <div className="text-success">{p.wins}W</div>
                <div className="text-muted-foreground">{p.losses}L</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="global">
        <TabsList className="bg-surface">
          <TabsTrigger value="global">Global</TabsTrigger>
          <TabsTrigger value="regional">Regional</TabsTrigger>
          <TabsTrigger value="friends">Friends</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="mt-4">
          <Card className="border-border bg-gradient-card p-0">
            <div className="grid grid-cols-12 border-b border-border px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              <div className="col-span-1">#</div>
              <div className="col-span-4">Player</div>
              <div className="col-span-2 text-right">Rating</div>
              <div className="col-span-2 text-right">W / L</div>
              <div className="col-span-2 text-right">Winrate</div>
              <div className="col-span-1 text-right">Trend</div>
            </div>
            {leaderboard.map((p) => (
              <div key={p.handle} className="grid grid-cols-12 items-center px-5 py-3.5 text-sm hover:bg-surface-2/50 border-b border-border last:border-0">
                <div className="col-span-1 font-display font-bold text-muted-foreground">{p.rank}</div>
                <div className="col-span-4 flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-md bg-surface-2 font-mono text-xs">
                    {p.handle.slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-mono">{p.handle}</div>
                    <div className="text-xs text-muted-foreground">{p.country}</div>
                  </div>
                </div>
                <div className="col-span-2 text-right font-display font-bold text-neon">{p.rating}</div>
                <div className="col-span-2 text-right font-mono text-xs">
                  <span className="text-success">{p.wins}</span> / <span className="text-muted-foreground">{p.losses}</span>
                </div>
                <div className="col-span-2 text-right font-mono">{p.winrate}%</div>
                <div className="col-span-1 flex justify-end">
                  {p.trend === "up" && <Badge variant="outline" className="border-success/40 text-success"><TrendingUp className="h-3 w-3" /></Badge>}
                  {p.trend === "down" && <Badge variant="outline" className="border-destructive/40 text-destructive"><TrendingDown className="h-3 w-3" /></Badge>}
                  {p.trend === "flat" && <Badge variant="outline" className="border-border text-muted-foreground"><Minus className="h-3 w-3" /></Badge>}
                </div>
              </div>
            ))}
          </Card>
        </TabsContent>

        <TabsContent value="regional" className="mt-4">
          <Card className="border-border bg-gradient-card p-10 text-center text-sm text-muted-foreground">
            Regional rankings sync from the matchmaker every 60s. Connect your account to filter by region.
          </Card>
        </TabsContent>
        <TabsContent value="friends" className="mt-4">
          <Card className="border-border bg-gradient-card p-10 text-center text-sm text-muted-foreground">
            Sign in to see how you stack up against your crew.
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
