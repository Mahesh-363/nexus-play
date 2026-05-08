import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { analytics } from "@/lib/mockData";
import { Activity, DollarSign, TrendingUp, UserPlus, Users, Zap } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — NOVA" },
      { name: "description", content: "Real-time analytics for the NOVA play network: DAU, matches, revenue and infra health." },
    ],
  }),
  component: AnalyticsPage,
});

const kpis = [
  { label: "Daily Active", value: analytics.dau.toLocaleString(), delta: "+8.2%", icon: Users, accent: "neon" },
  { label: "Matches Played", value: analytics.matchesPlayed.toLocaleString(), delta: "+12.1%", icon: Activity, accent: "magenta" },
  { label: "Avg. Match", value: analytics.avgMatchTime, delta: "−4s", icon: Zap, accent: "neon" },
  { label: "Peak Concurrent", value: analytics.peakConcurrent.toLocaleString(), delta: "+18%", icon: TrendingUp, accent: "magenta" },
  { label: "Revenue (24h)", value: `$${analytics.revenue.toLocaleString()}`, delta: "+5.6%", icon: DollarSign, accent: "neon" },
  { label: "New Signups", value: analytics.signups.toLocaleString(), delta: "+22%", icon: UserPlus, accent: "magenta" },
];

function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Live ops dashboard · refreshes every 30s</p>
        </div>
        <Badge variant="outline" className="gap-2 border-neon/40 text-neon">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon" /> Streaming
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {kpis.map((k) => (
          <Card key={k.label} className="border-border bg-gradient-card p-4">
            <div className="flex items-center justify-between">
              <k.icon className={`h-4 w-4 ${k.accent === "neon" ? "text-neon" : "text-magenta"}`} />
              <span className="text-[10px] font-mono text-success">{k.delta}</span>
            </div>
            <div className="mt-3 font-display text-2xl font-bold">{k.value}</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{k.label}</div>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="border-border bg-gradient-card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold">Matches per hour</h3>
              <p className="text-xs text-muted-foreground">Last 24 hours · all games</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.matchesPerHour}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.85 0.18 195)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="oklch(0.85 0.18 195)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.04 275 / 0.3)" />
                <XAxis dataKey="h" stroke="oklch(0.72 0.03 260)" fontSize={11} />
                <YAxis stroke="oklch(0.72 0.03 260)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.21 0.04 270)",
                    border: "1px solid oklch(0.32 0.04 275)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="v" stroke="oklch(0.85 0.18 195)" strokeWidth={2} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-border bg-gradient-card p-6">
          <h3 className="font-display text-lg font-bold">Game share</h3>
          <p className="text-xs text-muted-foreground">% of total matches</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.gameDistribution} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.04 275 / 0.3)" horizontal={false} />
                <XAxis type="number" stroke="oklch(0.72 0.03 260)" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="oklch(0.72 0.03 260)" fontSize={11} width={90} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.21 0.04 270)",
                    border: "1px solid oklch(0.32 0.04 275)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" fill="oklch(0.72 0.27 340)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          { name: "Matchmaker", lat: "12ms", status: "healthy" },
          { name: "Game servers (us-east)", lat: "28ms", status: "healthy" },
          { name: "Voice mesh (LiveKit)", lat: "41ms", status: "degraded" },
        ].map((s) => (
          <Card key={s.name} className="border-border bg-gradient-card p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">{s.name}</div>
              <span className={`h-2 w-2 rounded-full ${s.status === "healthy" ? "bg-success" : "bg-warning"} animate-pulse`} />
            </div>
            <div className="mt-3 font-display text-2xl font-bold text-neon">{s.lat}</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">p50 latency</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
