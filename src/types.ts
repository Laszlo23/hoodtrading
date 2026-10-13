export type Page = "home" | "perps" | "markets" | "portfolio" | "chain" | "vault" | "stake" | "rewards" | "board" | "blog";

export type MarketKind = "stock" | "crypto" | "chain";

export type Side = "buy" | "sell";

export type PositionSide = "long" | "short";

export type OrderType = "market" | "limit" | "stop";

export type Timeframe = "5m" | "15m" | "1h" | "4h" | "1D";

export type ChartTab = "chart" | "depth" | "funding" | "asset" | "tape";

export type DockTab = "positions" | "orders" | "history" | "funding" | "balances";

export type SizeMode = "usd" | "base";

export interface Market {
  id: string;
  base: string;
  quote: "USDG";
  name: string;
  kind: MarketKind;
  price: number;
  volume24h: number;
  liquidity: number;
  maxLev: number;
  fundingHourly: number;
  sigma: number;
  address?: string;
  pool?: string;
  dex?: string;
}

export interface Candle {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export interface BookLevel {
  price: number;
  qty: number;
  total: number;
}

export interface Book {
  asks: BookLevel[];
  bids: BookLevel[];
  bidPct: number;
}

export interface TapePrint {
  id: string;
  time: number;
  price: number;
  qty: number;
  side: Side;
}

export interface Position {
  id: string;
  marketId: string;
  side: PositionSide;
  qty: number;
  entry: number;
  leverage: number;
  margin: number;
  tp?: number;
  sl?: number;
  openedAt: number;
  fundingPaid: number;
}

export interface OpenOrder {
  id: string;
  marketId: string;
  side: Side;
  type: "limit" | "stop";
  price: number;
  notional: number;
  leverage: number;
  reduceOnly: boolean;
  tp?: number;
  sl?: number;
  createdAt: number;
}

export interface Fill {
  id: string;
  time: number;
  marketId: string;
  side: Side;
  price: number;
  qty: number;
  notional: number;
  fee: number;
  pnl: number;
  kind: "open" | "close" | "liq" | "funding";
}

export interface Toast {
  id: string;
  title: string;
  body: string;
  tone: "ok" | "bad" | "info";
}

export interface Draft {
  marketId: string;
  side: Side;
  type: OrderType;
  leverage: number;
  notional: number;
  price: number;
  reduceOnly: boolean;
  tp?: number;
  sl?: number;
}

export interface ChainVitals {
  blockNumber: number | null;
  gasGwei: number | null;
  usdgSupply: number;
  blocksPerSecond: number;
  avgBlockMs: number;
  ethPrice: number;
  transferFeeUsd: number;
  updatedAt: number | null;
}
