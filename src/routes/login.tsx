import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — NOVA" },
      { name: "description", content: "Sign in to NOVA to play ranked, join tournaments and chat with your crew." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="relative grid min-h-[calc(100vh-56px)] place-items-center px-6 py-10">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <Card className="relative w-full max-w-md border-border bg-gradient-card p-8 shadow-elevated">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-gradient-neon shadow-neon">
            <Zap className="h-5 w-5 text-neon-foreground" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-display text-xl font-bold tracking-wider">NOVA</div>
            <div className="text-xs text-muted-foreground">Operator login</div>
          </div>
        </div>

        <h1 className="font-display text-2xl font-bold">Welcome back, operator.</h1>
        <p className="mt-1 text-sm text-muted-foreground">JWT session · 24h refresh window</p>

        <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-1.5">
            <Label htmlFor="handle">Handle or email</Label>
            <Input id="handle" placeholder="VOID_REAPER" className="border-border bg-surface" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" className="border-border bg-surface" />
          </div>
          <Button className="w-full bg-gradient-neon font-semibold text-neon-foreground shadow-neon hover:opacity-90">
            Authenticate
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="border-border bg-surface/50">Discord</Button>
          <Button variant="outline" className="border-border bg-surface/50">Steam</Button>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          New here? <Link to="/" className="text-neon hover:underline">Create an operator profile</Link>
        </p>
      </Card>
    </div>
  );
}
