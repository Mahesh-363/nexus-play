import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Search, Wifi } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/70 px-3 backdrop-blur-md md:px-5">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
      <div className="hidden items-center gap-2 md:flex">
        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          edge online · 28ms
        </span>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search players, matches…"
            className="h-9 w-64 border-border bg-surface pl-9 text-sm"
          />
        </div>
        <Badge variant="outline" className="hidden gap-1.5 border-neon/40 text-neon md:flex">
          <Wifi className="h-3 w-3" /> 184k online
        </Badge>
        <button className="relative grid h-9 w-9 place-items-center rounded-md border border-border bg-surface text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-magenta" />
        </button>
        <div className="grid h-9 w-9 place-items-center rounded-md bg-gradient-neon font-display text-sm font-bold text-neon-foreground">
          Y
        </div>
      </div>
    </header>
  );
}
