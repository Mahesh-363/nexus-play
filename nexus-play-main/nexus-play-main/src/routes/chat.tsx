import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { chatChannels, chatMessages } from "@/lib/mockData";
import { Hash, Mic, MicOff, Send, Volume2, Headphones } from "lucide-react";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat & Voice — NOVA" },
      { name: "description", content: "Text channels and voice rooms for the NOVA community. Voice powered by LiveKit." },
    ],
  }),
  component: ChatPage,
});

const colorMap = {
  neon: "text-neon",
  magenta: "text-magenta",
  success: "text-success",
  warning: "text-warning",
  muted: "text-muted-foreground",
};

const voiceRooms = [
  { name: "Tournament Lobby", users: ["VOID_REAPER", "nyx.exe", "QuantumGhost"], live: true },
  { name: "Squad Up — EU", users: ["Aurora_77", "Solene"], live: true },
  { name: "Coaching · Void Arena", users: ["Nebula.Knight"], live: false },
];

function ChatPage() {
  const [channel, setChannel] = useState(chatChannels[0]);
  const [draft, setDraft] = useState("");
  const [muted, setMuted] = useState(false);
  const messages = chatMessages[channel] ?? [];

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Comms</h1>
          <p className="text-sm text-muted-foreground">Text channels and voice rooms · LiveKit edge mesh</p>
        </div>
        <Badge variant="outline" className="gap-2 border-success/40 text-success">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" /> Voice gateway online
        </Badge>
      </div>

      <div className="grid h-[calc(100vh-220px)] grid-cols-12 gap-4">
        {/* Channels */}
        <Card className="col-span-12 border-border bg-gradient-card p-3 md:col-span-3">
          <div className="px-2 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Text channels
          </div>
          <div className="space-y-0.5">
            {chatChannels.map((c) => (
              <button
                key={c}
                onClick={() => setChannel(c)}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
                  channel === c ? "bg-neon/10 text-neon" : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                }`}
              >
                <Hash className="h-3.5 w-3.5" />
                {c.replace("#", "")}
              </button>
            ))}
          </div>
          <div className="mt-5 px-2 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Voice rooms
          </div>
          <div className="space-y-2">
            {voiceRooms.map((r) => (
              <div key={r.name} className="rounded-md border border-border bg-surface-2 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Volume2 className="h-3.5 w-3.5 text-neon" />
                    {r.name}
                  </div>
                  {r.live && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-magenta" />}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{r.users.length} connected</div>
                <div className="mt-2 flex -space-x-1.5">
                  {r.users.map((u) => (
                    <div key={u} className="grid h-5 w-5 place-items-center rounded-full bg-gradient-neon text-[9px] font-bold text-neon-foreground ring-2 ring-card">
                      {u[0]}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Chat */}
        <Card className="col-span-12 flex flex-col border-border bg-gradient-card md:col-span-9">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span className="font-display font-semibold">{channel.replace("#", "")}</span>
              <span className="ml-3 text-xs text-muted-foreground">{messages.length} messages today</span>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={muted ? "outline" : "default"}
                onClick={() => setMuted((m) => !m)}
                className={muted ? "border-destructive/40 text-destructive" : "bg-neon/15 text-neon hover:bg-neon/25"}
              >
                {muted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
              </Button>
              <Button size="sm" variant="outline">
                <Headphones className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
            {messages.length === 0 && (
              <div className="grid h-full place-items-center text-center text-sm text-muted-foreground">
                No messages yet. Say hi 👋
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className="flex gap-3">
                <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-md bg-surface-2 font-mono text-xs ${colorMap[m.color]}`}>
                  {m.user.slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className={`font-mono text-sm font-semibold ${colorMap[m.color]}`}>{m.user}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{m.ts}</span>
                  </div>
                  <div className="text-sm">{m.message}</div>
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); setDraft(""); }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`Message ${channel}`}
              className="border-border bg-surface"
            />
            <Button type="submit" className="bg-gradient-neon text-neon-foreground hover:opacity-90">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
