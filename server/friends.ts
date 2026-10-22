const BOARD = "https://basefriend.tech";

export interface FriendKey {
  id: string;
  name: string;
  handle: string;
  room: "Club" | "Creator" | "Key";
  price: string;
  change: string;
  holders: number;
  supply: string;
  volume: string;
  href: string;
}

export interface FriendTrade {
  id: string;
  name: string;
  handle: string;
  side: "buy" | "sell";
  keys: string;
  spent: string;
  trader: string;
  href: string;
}

export interface FriendsBoard {
  keys: FriendKey[];
  trades: FriendTrade[];
  readAt: string;
}

interface RawKey {
  id?: unknown;
  display_name?: unknown;
  username?: unknown;
  type?: unknown;
  price_formatted?: unknown;
  change_24h_formatted?: unknown;
  holder_count?: unknown;
  supply?: unknown;
  volume_7d_formatted?: unknown;
}

interface RawTrade {
  id?: unknown;
  entity_id?: unknown;
  kind?: unknown;
  side?: unknown;
  display_name?: unknown;
  username?: unknown;
  key_amount_formatted?: unknown;
  key_amount?: unknown;
  reserve_amount_formatted?: unknown;
  trader_name?: unknown;
}

let cache: { at: number; body: FriendsBoard } | null = null;

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function roomOf(type: unknown): FriendKey["room"] {
  if (type === "channel") return "Club";
  if (type === "creator") return "Creator";
  return "Key";
}

function keyOf(raw: RawKey): FriendKey | null {
  const id = text(raw.id);
  const name = text(raw.display_name);
  if (!id || !name) return null;
  const handle = text(raw.username);
  return {
    id,
    name,
    handle: handle ? `@${handle}` : "",
    room: roomOf(raw.type),
    price: text(raw.price_formatted, "—"),
    change: text(raw.change_24h_formatted, "—"),
    holders: typeof raw.holder_count === "number" ? raw.holder_count : 0,
    supply: text(raw.supply, "—"),
    volume: text(raw.volume_7d_formatted, "—"),
    href: `${BOARD}/share/markets/${id}`,
  };
}

function tradeOf(raw: RawTrade): FriendTrade | null {
  if (raw.kind !== "trade") return null;
  if (raw.side !== "buy" && raw.side !== "sell") return null;
  const id = text(raw.entity_id);
  const name = text(raw.display_name);
  if (!id || !name) return null;
  const handle = text(raw.username);
  return {
    id: text(raw.id, id),
    name,
    handle: handle ? `@${handle}` : "",
    side: raw.side,
    keys: text(raw.key_amount_formatted, text(raw.key_amount, "1")),
    spent: text(raw.reserve_amount_formatted, "—"),
    trader: text(raw.trader_name, "a wallet"),
    href: `${BOARD}/share/markets/${id}`,
  };
}

async function pull<T>(path: string): Promise<T> {
  const response = await fetch(`${BOARD}${path}`, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`basefriend ${response.status}`);
  return await response.json() as T;
}

export async function friendsBoard(): Promise<FriendsBoard> {
  if (cache && Date.now() - cache.at < 20_000) return cache.body;
  const [volume, activity] = await Promise.all([
    pull<{ items?: RawKey[] }>("/api/leaderboard?sort=volume&limit=12"),
    pull<{ items?: RawTrade[] }>("/api/activity/global?limit=24"),
  ]);
  const keys = (volume.items ?? []).map(keyOf).filter((item): item is FriendKey => item !== null).slice(0, 8);
  const trades = (activity.items ?? []).map(tradeOf).filter((item): item is FriendTrade => item !== null).slice(0, 8);
  const body: FriendsBoard = { keys, trades, readAt: new Date().toISOString() };
  cache = { at: Date.now(), body };
  return body;
}
