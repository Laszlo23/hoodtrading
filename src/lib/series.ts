import { MARKETS } from "../data/markets";
import type { Book, BookLevel, Candle, Market, Side, TapePrint, Timeframe } from "../types";

export const TIMEFRAMES: Timeframe[] = ["5m", "15m", "1h", "4h", "1D"];

const TF_MS: Record<Timeframe, number> = {
  "5m": 5 * 60 * 1000,
  "15m": 15 * 60 * 1000,
  "1h": 60 * 60 * 1000,
  "4h": 4 * 60 * 60 * 1000,
  "1D": 24 * 60 * 60 * 1000,
};

interface Live {
  market: Market;
  last: number;
  dayOpen: number;
  candles: Record<Timeframe, Candle[]>;
  trades: TapePrint[];
}

const live = new Map<string, Live>();
let printSeq = 1;

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function bucket(ts: number, tf: Timeframe): number {
  const ms = TF_MS[tf];
  return Math.floor(ts / ms) * ms;
}

function buildHistory(market: Market, tf: Timeframe, dayOpen: number, now: number): Candle[] {
  const rnd = mulberry32(hash(`${market.id}:${tf}`));
  const count = tf === "1D" ? 120 : 180;
  const end = bucket(now, tf);
  const ms = TF_MS[tf];
  const scale = ms / 3_600_000;
  const sigma = market.sigma * Math.sqrt(scale) * 1.15;
  const candles: Candle[] = [];
  let price = dayOpen;
  for (let i = 0; i < count; i += 1) {
    const remain = count - i;
    const gap = Math.log(market.price) - Math.log(Math.max(price, 1e-12));
    const drift = gap / remain;
    const shock = (rnd() - 0.5) * sigma * 2;
    const open = price;
    const close = price * Math.exp(drift + shock);
    const wick = Math.max(open, close) * rnd() * sigma;
    const tail = Math.min(open, close) * rnd() * sigma;
    const high = Math.max(open, close) + wick;
    const low = Math.max(1e-12, Math.min(open, close) - tail);
    const volume = market.volume24h * (0.002 + rnd() * 0.01) * scale;
    candles.push({ t: end - (count - 1 - i) * ms, o: open, h: high, l: low, c: close, v: volume });
    price = close;
  }
  const last = candles[candles.length - 1];
  if (last) {
    const ratio = market.price / last.c;
    last.c = market.price;
    last.h = Math.max(last.h * ratio, last.c, last.o);
    last.l = Math.min(last.l * ratio, last.c, last.o);
  }
  return candles;
}

function ensure(market: Market): Live {
  const existing = live.get(market.id);
  if (existing) return existing;
  const rnd = mulberry32(hash(market.id));
  const span = market.kind === "chain" ? 0.16 : market.kind === "crypto" ? 0.035 : 0.028;
  const change = (rnd() - 0.47) * span;
  const dayOpen = market.price / (1 + change);
  const now = Date.now();
  const candles = {
    "5m": buildHistory(market, "5m", dayOpen, now),
    "15m": buildHistory(market, "15m", dayOpen, now),
    "1h": buildHistory(market, "1h", dayOpen, now),
    "4h": buildHistory(market, "4h", dayOpen, now),
    "1D": buildHistory(market, "1D", dayOpen, now),
  } satisfies Record<Timeframe, Candle[]>;
  const created: Live = { market, last: market.price, dayOpen, candles, trades: [] };
  live.set(market.id, created);
  for (let i = 12; i >= 0; i -= 1) {
    const drift = (mulberry32(hash(market.id) + i)() - 0.5) * market.price * 0.0008;
    pushTrade(created, market.price + drift, drift >= 0 ? "buy" : "sell", now - i * 17_000);
  }
  return created;
}

export function bootSeries(): void {
  for (const market of MARKETS) ensure(market);
}

export function getLast(id: string): number {
  const market = MARKETS.find((item) => item.id === id);
  if (!market) return 0;
  return ensure(market).last;
}

export function getMark(id: string): number {
  return getLast(id) * 0.99984;
}

export function getChange(id: string): number {
  const market = MARKETS.find((item) => item.id === id);
  if (!market) return 0;
  const row = ensure(market);
  return ((row.last - row.dayOpen) / row.dayOpen) * 100;
}

export function getCandles(id: string, tf: Timeframe): Candle[] {
  const market = MARKETS.find((item) => item.id === id);
  if (!market) return [];
  return ensure(market).candles[tf];
}

export function getTrades(id: string): TapePrint[] {
  const market = MARKETS.find((item) => item.id === id);
  if (!market) return [];
  return ensure(market).trades;
}

export function setPrint(id: string, price: number): void {
  const market = MARKETS.find((item) => item.id === id);
  if (!market || !Number.isFinite(price) || price <= 0) return;
  const row = ensure(market);
  row.last = price;
  const now = Date.now();
  (Object.keys(row.candles) as Timeframe[]).forEach((tf) => {
    const series = row.candles[tf];
    const last = series[series.length - 1];
    if (!last) return;
    last.c = price;
    last.h = Math.max(last.h, price);
    last.l = Math.min(last.l, price);
    if (bucket(now, tf) !== last.t) {
      series.push({ t: bucket(now, tf), o: price, h: price, l: price, c: price, v: 0 });
      if (series.length > 220) series.shift();
    }
  });
}

function pushTrade(row: Live, price: number, side: Side, time = Date.now()): void {
  const qty = (row.market.liquidity / Math.max(price, 1e-12)) * (0.0000015 + Math.random() * 0.000012);
  row.trades.unshift({
    id: `t${printSeq}`,
    time,
    price,
    qty,
    side,
  });
  printSeq += 1;
  if (row.trades.length > 48) row.trades.pop();
}

export function stepSeries(): void {
  const now = Date.now();
  for (const market of MARKETS) {
    const row = ensure(market);
    const shock = (Math.random() - 0.498) * market.sigma * 0.02;
    row.last = Math.max(1e-12, row.last * Math.exp(shock));
    (Object.keys(row.candles) as Timeframe[]).forEach((tf) => {
      const series = row.candles[tf];
      const last = series[series.length - 1];
      if (!last) return;
      const nextBucket = bucket(now, tf);
      if (nextBucket !== last.t) {
        series.push({
          t: nextBucket,
          o: row.last,
          h: row.last,
          l: row.last,
          c: row.last,
          v: 0,
        });
        if (series.length > 220) series.shift();
        return;
      }
      last.c = row.last;
      last.h = Math.max(last.h, row.last);
      last.l = Math.min(last.l, row.last);
      last.v += market.volume24h * 0.000002;
    });
    if (Math.random() < 0.45) {
      pushTrade(row, row.last, shock >= 0 ? "buy" : "sell");
    }
  }
}

function roundTo(price: number, tick: number): number {
  return Math.round(price / tick) * tick;
}

export function buildBook(id: string, tick: number, levels = 12): Book {
  const market = MARKETS.find((item) => item.id === id);
  if (!market) return { asks: [], bids: [], bidPct: 50 };
  const row = ensure(market);
  const mid = roundTo(row.last, tick);
  const seed = hash(market.id) % 997;
  const asks: BookLevel[] = [];
  const bids: BookLevel[] = [];
  let askTotal = 0;
  let bidTotal = 0;
  const baseQty = Math.max(market.liquidity / row.last / 8000, row.last > 1 ? 0.02 : 1000);
  for (let i = 1; i <= levels; i += 1) {
    const wave = 0.65 + ((Math.sin(Date.now() / 900 + seed + i) + 1) / 2) * 1.1;
    const askQty = baseQty * (0.35 + ((i * 17 + seed) % 11) / 7) * wave;
    const bidQty = baseQty * (0.35 + ((i * 13 + seed) % 10) / 6.5) * (2.1 - wave * 0.35);
    askTotal += askQty * (mid + i * tick);
    bidTotal += bidQty * (mid - i * tick);
    asks.push({ price: mid + i * tick, qty: askQty, total: askTotal });
    bids.push({ price: Math.max(tick, mid - i * tick), qty: bidQty, total: bidTotal });
  }
  const bidPct = (bidTotal / (bidTotal + askTotal)) * 100;
  return { asks: asks.reverse(), bids, bidPct };
}

export function depthSeries(book: Book): { bids: BookLevel[]; asks: BookLevel[] } {
  return { bids: book.bids, asks: [...book.asks].reverse() };
}
