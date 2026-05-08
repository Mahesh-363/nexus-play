export type Game = {
  id: string;
  name: string;
  genre: string;
  players: number;
  emoji: string;
  accent: "neon" | "magenta" | "success" | "warning";
};

export const games: Game[] = [
  { id: "neon-strike", name: "Neon Strike", genre: "FPS", players: 12483, emoji: "🎯", accent: "neon" },
  { id: "void-arena", name: "Void Arena", genre: "MOBA", players: 8721, emoji: "⚔️", accent: "magenta" },
  { id: "chrono-chess", name: "Chrono Chess", genre: "Strategy", players: 3105, emoji: "♟️", accent: "success" },
  { id: "hyperdrift", name: "Hyperdrift", genre: "Racing", players: 5612, emoji: "🏎️", accent: "warning" },
  { id: "stellar-poker", name: "Stellar Poker", genre: "Cards", players: 2247, emoji: "🃏", accent: "neon" },
  { id: "cube-clash", name: "Cube Clash", genre: "Puzzle", players: 1893, emoji: "🧊", accent: "magenta" },
];

export type Player = {
  rank: number;
  handle: string;
  rating: number;
  wins: number;
  losses: number;
  winrate: number;
  country: string;
  trend: "up" | "down" | "flat";
};

export const leaderboard: Player[] = [
  { rank: 1, handle: "VOID_REAPER", rating: 3284, wins: 1892, losses: 412, winrate: 82.1, country: "🇯🇵", trend: "up" },
  { rank: 2, handle: "nyx.exe", rating: 3217, wins: 1654, losses: 387, winrate: 81.0, country: "🇰🇷", trend: "up" },
  { rank: 3, handle: "QuantumGhost", rating: 3198, wins: 1721, losses: 502, winrate: 77.4, country: "🇺🇸", trend: "down" },
  { rank: 4, handle: "Aurora_77", rating: 3150, wins: 1488, losses: 391, winrate: 79.2, country: "🇸🇪", trend: "up" },
  { rank: 5, handle: "kibou", rating: 3102, wins: 1395, losses: 421, winrate: 76.8, country: "🇯🇵", trend: "flat" },
  { rank: 6, handle: "Nebula.Knight", rating: 3088, wins: 1278, losses: 366, winrate: 77.7, country: "🇧🇷", trend: "up" },
  { rank: 7, handle: "0xPHANTOM", rating: 3041, wins: 1602, losses: 521, winrate: 75.5, country: "🇩🇪", trend: "down" },
  { rank: 8, handle: "Solene", rating: 3019, wins: 1147, losses: 358, winrate: 76.2, country: "🇫🇷", trend: "up" },
  { rank: 9, handle: "Iceveil", rating: 2998, wins: 1389, losses: 482, winrate: 74.2, country: "🇨🇦", trend: "flat" },
  { rank: 10, handle: "rune.byte", rating: 2974, wins: 1102, losses: 388, winrate: 73.9, country: "🇬🇧", trend: "up" },
];

export type Tournament = {
  id: string;
  name: string;
  game: string;
  status: "live" | "upcoming" | "registration" | "ended";
  prize: string;
  participants: number;
  capacity: number;
  startsIn: string;
  region: string;
};

export const tournaments: Tournament[] = [
  { id: "t1", name: "Neon Open Season 4", game: "Neon Strike", status: "live", prize: "$120,000", participants: 256, capacity: 256, startsIn: "Live", region: "Global" },
  { id: "t2", name: "Void Champions Cup", game: "Void Arena", status: "registration", prize: "$80,000", participants: 89, capacity: 128, startsIn: "2d 14h", region: "EU/NA" },
  { id: "t3", name: "Chrono Grand Prix", game: "Chrono Chess", status: "upcoming", prize: "$25,000", participants: 64, capacity: 64, startsIn: "5d 02h", region: "APAC" },
  { id: "t4", name: "Hyperdrift Masters", game: "Hyperdrift", status: "registration", prize: "$45,000", participants: 142, capacity: 200, startsIn: "1d 06h", region: "Global" },
  { id: "t5", name: "Stellar High Stakes", game: "Stellar Poker", status: "ended", prize: "$60,000", participants: 512, capacity: 512, startsIn: "Ended", region: "Global" },
];

export type ChatMessage = {
  id: string;
  user: string;
  message: string;
  ts: string;
  color: "neon" | "magenta" | "success" | "warning" | "muted";
};

export const chatChannels = ["#general", "#looking-for-team", "#tournaments", "#dev-talk", "#trash-talk"];

export const chatMessages: Record<string, ChatMessage[]> = {
  "#general": [
    { id: "1", user: "VOID_REAPER", message: "GG everyone, see you in ranked tonight 🎮", ts: "12:42", color: "neon" },
    { id: "2", user: "Aurora_77", message: "anyone down for Void Arena 5v5?", ts: "12:44", color: "magenta" },
    { id: "3", user: "kibou", message: "+1, queueing now", ts: "12:45", color: "success" },
    { id: "4", user: "Nebula.Knight", message: "the new map is insane btw", ts: "12:47", color: "warning" },
    { id: "5", user: "rune.byte", message: "anyone got the patch notes?", ts: "12:50", color: "muted" },
    { id: "6", user: "VOID_REAPER", message: "dropped 30 mins ago, check the news tab", ts: "12:51", color: "neon" },
  ],
  "#looking-for-team": [
    { id: "1", user: "Solene", message: "LF duo for Hyperdrift, plat+", ts: "12:30", color: "magenta" },
    { id: "2", user: "Iceveil", message: "i'll join, dm'ing", ts: "12:31", color: "neon" },
  ],
  "#tournaments": [
    { id: "1", user: "QuantumGhost", message: "Neon Open finals starting in 20 min!", ts: "12:15", color: "warning" },
  ],
  "#dev-talk": [],
  "#trash-talk": [
    { id: "1", user: "0xPHANTOM", message: "EZ", ts: "12:01", color: "magenta" },
  ],
};

export const analytics = {
  dau: 184293,
  matchesPlayed: 1284039,
  avgMatchTime: "8m 42s",
  peakConcurrent: 42891,
  revenue: 184320,
  signups: 12483,
  matchesPerHour: [
    { h: "00", v: 32 }, { h: "02", v: 28 }, { h: "04", v: 21 }, { h: "06", v: 24 },
    { h: "08", v: 38 }, { h: "10", v: 52 }, { h: "12", v: 68 }, { h: "14", v: 74 },
    { h: "16", v: 82 }, { h: "18", v: 96 }, { h: "20", v: 100 }, { h: "22", v: 78 },
  ],
  gameDistribution: [
    { name: "Neon Strike", value: 38 },
    { name: "Void Arena", value: 27 },
    { name: "Hyperdrift", value: 17 },
    { name: "Chrono Chess", value: 10 },
    { name: "Other", value: 8 },
  ],
};
