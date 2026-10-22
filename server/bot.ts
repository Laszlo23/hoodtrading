import { randomBytes } from "node:crypto";
import {
  accountBalances,
  BinanceFailureError,
  klines,
  lastPrice,
  marketBuy,
  marketSell,
  recentFills,
  symbolFilters,
  type BinanceCreds,
  type SpotBalance,
  type SpotFill,
} from "./binance";

export const BOT_SYMBOLS = ["BTCUSDT", "ETHUSDT"] as const;
export type BotSymbol = (typeof BOT_SYMBOLS)[number];
export type BotSignal = "buy" | "sell" | "hold";

const FAST = 12;
const SLOW = 26;
const STOP = 0.02;
const QUOTE_FRACTION = 0.1;
const TICK_MS = 60_000;

export interface BotView {
  connected: boolean;
  testnet: boolean;
  armed: boolean;
  keyTail: string;
  symbol: BotSymbol;
  balances: SpotBalance[];
  price: number | null;
  fast: number | null;
  slow: number | null;
  signal: BotSignal;
  baseFree: number;
  entry: number | null;
  stop: number | null;
  lastError: string | null;
  fills: SpotFill[];
  rule: string;
}

interface Session {
  id: string;
  creds: BinanceCreds;
  keyTail: string;
  armed: boolean;
  symbol: BotSymbol;
  entry: number | null;
  lastBar: number;
  created: number;
  lastError: string | null;
  price: number | null;
  fast: number | null;
  slow: number | null;
  signal: BotSignal;
  balances: SpotBalance[];
  fills: SpotFill[];
  timer: ReturnType<typeof setInterval> | null;
  ticking: boolean;
}

const sessions = new Map<string, Session>();

export function trendSignal(closes: number[]): { signal: BotSignal; fast: number; slow: number } {
  const closed = closes.slice(0, -1);
  const fast = ema(closed, FAST);
  const slow = ema(closed, SLOW);
  if (![fast, slow].every((value) => Number.isFinite(value)) || fast === slow) {
    return { signal: "hold", fast, slow };
  }
  return { signal: fast > slow ? "buy" : "sell", fast, slow };
}

function ema(values: number[], period: number): number {
  if (values.length < period) return Number.NaN;
  const weight = 2 / (period + 1);
  let value = values.slice(0, period).reduce((sum, item) => sum + item, 0) / period;
  for (let index = period; index < values.length; index += 1) {
    value = values[index] * weight + value * (1 - weight);
  }
  return value;
}

function isSymbol(value: string): value is BotSymbol {
  return (BOT_SYMBOLS as readonly string[]).includes(value);
}

function baseAsset(symbol: BotSymbol): string {
  return symbol.replace("USDT", "");
}

function floorToStep(qty: number, step: number): string {
  if (!(step > 0)) return "0";
  const decimals = Math.max(0, (step.toString().split(".")[1] ?? "").replace(/0+$/, "").length);
  const floored = Math.floor(qty / step + 1e-9) * step;
  return floored.toFixed(decimals);
}

function floorQuote(amount: number, decimals: number): string {
  const factor = 10 ** decimals;
  return (Math.floor(amount * factor + 1e-9) / factor).toFixed(decimals);
}

function viewOf(session: Session): BotView {
  const base = session.balances.find((row) => row.asset === baseAsset(session.symbol));
  const baseFree = (base?.free ?? 0) + (base?.locked ?? 0);
  return {
    connected: true,
    testnet: session.creds.testnet,
    armed: session.armed,
    keyTail: session.keyTail,
    symbol: session.symbol,
    balances: session.balances.slice(0, 8),
    price: session.price,
    fast: session.fast,
    slow: session.slow,
    signal: session.signal,
    baseFree,
    entry: session.entry,
    stop: session.entry === null ? null : session.entry * (1 - STOP),
    lastError: session.lastError,
    fills: session.fills,
    rule: "One-hour trend on the pair. While the fast average is above the slow one, the bot buys 10% of free USDT, once each hour. It sells when the trend flips, or when price drops 2% from the entry. The bot can lose.",
  };
}

export function emptyView(): BotView {
  return {
    connected: false,
    testnet: false,
    armed: false,
    keyTail: "",
    symbol: "BTCUSDT",
    balances: [],
    price: null,
    fast: null,
    slow: null,
    signal: "hold",
    baseFree: 0,
    entry: null,
    stop: null,
    lastError: null,
    fills: [],
    rule: "Connect a Binance spot key. Withdrawals on that key should stay off. The bot stays idle until you arm it.",
  };
}

function requireSession(token: string): Session {
  const session = sessions.get(token);
  if (!session) throw new BinanceFailureError("Connect the bot again");
  return session;
}

export async function connectBot(apiKey: string, apiSecret: string, testnet: boolean): Promise<{ token: string; view: BotView }> {
  const key = apiKey.trim();
  const secret = apiSecret.trim();
  if (key.length < 16 || secret.length < 16) throw new BinanceFailureError("Paste the API key and the secret");
  const creds: BinanceCreds = { key, secret, testnet };
  const balances = await accountBalances(creds);
  if (sessions.size > 20) {
    const oldest = [...sessions.values()].sort((a, b) => a.created - b.created)[0];
    if (oldest) disconnectBot(oldest.id);
  }
  const token = randomBytes(24).toString("hex");
  const session: Session = {
    id: token,
    creds,
    keyTail: key.slice(-4),
    armed: false,
    symbol: "BTCUSDT",
    entry: null,
    lastBar: 0,
    created: Date.now(),
    lastError: null,
    price: null,
    fast: null,
    slow: null,
    signal: "hold",
    balances,
    fills: [],
    timer: null,
    ticking: false,
  };
  sessions.set(token, session);
  await refresh(session);
  return { token, view: viewOf(session) };
}

export function disconnectBot(token: string): BotView {
  const session = sessions.get(token);
  if (session?.timer) clearInterval(session.timer);
  sessions.delete(token);
  return emptyView();
}

export function botView(token: string): BotView {
  if (!token) return emptyView();
  const session = sessions.get(token);
  return session ? viewOf(session) : emptyView();
}

export async function armBot(token: string, armed: boolean, symbol: string): Promise<BotView> {
  const session = requireSession(token);
  if (!armed) {
    session.armed = false;
    if (session.timer) clearInterval(session.timer);
    session.timer = null;
    return viewOf(session);
  }
  if (!isSymbol(symbol)) throw new BinanceFailureError("The bot trades BTC or ETH against USDT");
  session.symbol = symbol;
  session.armed = true;
  session.lastError = null;
  if (session.timer) clearInterval(session.timer);
  session.timer = setInterval(() => {
    void tick(session);
  }, TICK_MS);
  await tick(session);
  return viewOf(session);
}

async function refresh(session: Session): Promise<void> {
  const [balances, price, bars, fills] = await Promise.all([
    accountBalances(session.creds),
    lastPrice(session.creds, session.symbol),
    klines(session.creds, session.symbol),
    recentFills(session.creds, session.symbol).catch(() => session.fills),
  ]);
  const trend = trendSignal(bars.map((bar) => bar.close));
  session.balances = balances;
  session.price = Number.isFinite(price) ? price : null;
  session.fast = Number.isFinite(trend.fast) ? trend.fast : null;
  session.slow = Number.isFinite(trend.slow) ? trend.slow : null;
  session.signal = trend.signal;
  session.fills = fills;
  const base = balances.find((row) => row.asset === baseAsset(session.symbol));
  const held = (base?.free ?? 0) + (base?.locked ?? 0);
  if (held <= 0) session.entry = null;
  else if (session.entry === null) {
    const lastBuy = fills.find((fill) => fill.side === "buy");
    session.entry = lastBuy?.price ?? price;
  }
}

async function tick(session: Session): Promise<void> {
  if (!session.armed || session.ticking) return;
  session.ticking = true;
  try {
    const bars = await klines(session.creds, session.symbol);
    const closedBar = bars[bars.length - 2]?.openTime ?? 0;
    const trend = trendSignal(bars.map((bar) => bar.close));
    const price = await lastPrice(session.creds, session.symbol);
    session.price = price;
    session.fast = trend.fast;
    session.slow = trend.slow;
    session.signal = trend.signal;
    const balances = await accountBalances(session.creds);
    session.balances = balances;
    const filters = await symbolFilters(session.creds, session.symbol);
    const base = balances.find((row) => row.asset === baseAsset(session.symbol));
    const quote = balances.find((row) => row.asset === "USDT");
    const held = base?.free ?? 0;
    const stopped = session.entry !== null && price <= session.entry * (1 - STOP);
    const sameBar = closedBar === session.lastBar;
    if (held >= filters.minQty && (trend.signal === "sell" || stopped) && (!sameBar || stopped)) {
      const quantity = floorToStep(held, filters.stepSize);
      if (Number(quantity) >= filters.minQty && Number(quantity) * price >= filters.minNotional) {
        await marketSell(session.creds, session.symbol, quantity);
        session.entry = null;
        session.lastBar = closedBar;
        session.lastError = null;
      }
    } else if (held < filters.minQty && trend.signal === "buy" && !sameBar) {
      const spend = (quote?.free ?? 0) * QUOTE_FRACTION;
      const quoteQty = floorQuote(spend, filters.quotePrecision);
      if (Number(quoteQty) >= filters.minNotional) {
        await marketBuy(session.creds, session.symbol, quoteQty);
        session.entry = price;
        session.lastBar = closedBar;
        session.lastError = null;
      } else {
        session.lastError = "Free USDT is below the Binance minimum for this pair.";
      }
    }
    session.fills = await recentFills(session.creds, session.symbol).catch(() => session.fills);
    session.balances = await accountBalances(session.creds);
    if (session.lastError === "Free USDT is below the Binance minimum for this pair." && trend.signal !== "buy") {
      session.lastError = null;
    }
  } catch (error) {
    session.lastError = error instanceof Error ? error.message : "The bot missed this check";
  } finally {
    session.ticking = false;
  }
}
