import { useCallback, useEffect, useRef, useState } from "react";

export type MMStatus =
  | "idle"
  | "connecting"
  | "queued"
  | "matched"
  | "reconnecting"
  | "error"
  | "disconnected";

export type MatchFound = {
  matchId: string;
  game: string;
  mode: string;
  players: { handle: string; rating: number }[];
  server: string;
};

export type QueueUpdate = {
  position: number;
  estimatedWait: number; // seconds
  poolSize: number;
  mmrBand: number;
};

type ServerMsg =
  | { type: "queued"; ticketId: string; update: QueueUpdate }
  | { type: "queue_update"; update: QueueUpdate }
  | { type: "match_found"; match: MatchFound }
  | { type: "cancelled" }
  | { type: "error"; message: string }
  | { type: "pong" };

export type MatchmakingOptions = {
  url?: string; // WS URL override
  token?: string; // JWT
  maxRetries?: number;
};

const DEFAULT_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_MATCHMAKING_WS_URL) ||
  "ws://localhost:8000/ws/matchmaking";

export function useMatchmaking(opts: MatchmakingOptions = {}) {
  const { url = DEFAULT_URL, token, maxRetries = 6 } = opts;
  const [status, setStatus] = useState<MMStatus>("idle");
  const [queue, setQueue] = useState<QueueUpdate | null>(null);
  const [match, setMatch] = useState<MatchFound | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const ticketRef = useRef<string | null>(null);
  const lastJoinRef = useRef<{ game: string; mode: string } | null>(null);
  const retriesRef = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeat = useRef<ReturnType<typeof setInterval> | null>(null);
  const intentionalCloseRef = useRef(false);

  const cleanupTimers = () => {
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    if (heartbeat.current) clearInterval(heartbeat.current);
    reconnectTimer.current = null;
    heartbeat.current = null;
  };

  const connect = useCallback(() => {
    intentionalCloseRef.current = false;
    setStatus((s) => (s === "idle" ? "connecting" : "reconnecting"));
    setError(null);

    const qs = new URLSearchParams();
    if (token) qs.set("token", token);
    if (ticketRef.current) qs.set("ticket", ticketRef.current);
    const fullUrl = `${url}${qs.toString() ? `?${qs}` : ""}`;

    let ws: WebSocket;
    try {
      ws = new WebSocket(fullUrl);
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "WebSocket failed");
      return;
    }
    wsRef.current = ws;

    ws.onopen = () => {
      retriesRef.current = 0;
      setRetryAttempt(0);

      // Re-join queue automatically on reconnect
      if (lastJoinRef.current && ticketRef.current) {
        ws.send(
          JSON.stringify({
            type: "resume",
            ticketId: ticketRef.current,
            ...lastJoinRef.current,
          }),
        );
        setStatus("queued");
      } else if (lastJoinRef.current) {
        ws.send(JSON.stringify({ type: "join", ...lastJoinRef.current }));
        setStatus("queued");
      } else {
        setStatus("idle");
      }

      heartbeat.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, 15000);
    };

    ws.onmessage = (ev) => {
      let msg: ServerMsg;
      try {
        msg = JSON.parse(ev.data);
      } catch {
        return;
      }
      switch (msg.type) {
        case "queued":
          ticketRef.current = msg.ticketId;
          setQueue(msg.update);
          setStatus("queued");
          break;
        case "queue_update":
          setQueue(msg.update);
          break;
        case "match_found":
          setMatch(msg.match);
          setStatus("matched");
          ticketRef.current = null;
          break;
        case "cancelled":
          ticketRef.current = null;
          setQueue(null);
          setStatus("idle");
          break;
        case "error":
          setError(msg.message);
          setStatus("error");
          break;
      }
    };

    ws.onerror = () => {
      setError("WebSocket error");
    };

    ws.onclose = () => {
      cleanupTimers();
      if (intentionalCloseRef.current) {
        setStatus("disconnected");
        return;
      }
      // Reconnect with backoff if we were queued or connecting
      if (retriesRef.current < maxRetries) {
        const attempt = retriesRef.current + 1;
        retriesRef.current = attempt;
        setRetryAttempt(attempt);
        setStatus("reconnecting");
        const delay = Math.min(1000 * 2 ** (attempt - 1), 15000);
        reconnectTimer.current = setTimeout(connect, delay);
      } else {
        setStatus("disconnected");
        setError("Connection lost. Please retry.");
      }
    };
  }, [url, token, maxRetries]);

  const join = useCallback(
    (game: string, mode: string) => {
      lastJoinRef.current = { game, mode };
      setMatch(null);
      setError(null);
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "join", game, mode }));
        setStatus("queued");
      } else {
        connect();
      }
    },
    [connect],
  );

  const cancel = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && ticketRef.current) {
      wsRef.current.send(
        JSON.stringify({ type: "cancel", ticketId: ticketRef.current }),
      );
    }
    lastJoinRef.current = null;
    ticketRef.current = null;
    setQueue(null);
    setStatus("idle");
  }, []);

  const disconnect = useCallback(() => {
    intentionalCloseRef.current = true;
    cleanupTimers();
    wsRef.current?.close();
    wsRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      intentionalCloseRef.current = true;
      cleanupTimers();
      wsRef.current?.close();
    };
  }, []);

  return {
    status,
    queue,
    match,
    error,
    retryAttempt,
    join,
    cancel,
    disconnect,
    reconnect: connect,
  };
}
