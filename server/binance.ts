import { createHmac } from "node:crypto";

export interface BinanceCreds {
  key: string;
  secret: string;
  testnet: boolean;
}

export interface SpotBalance {
  asset: string;
  free: number;
  locked: number;
}

export interface SpotFill {
  time: number;
  side: "buy" | "sell";
  qty: number;
  price: number;
  quote: number;
}

export interface SymbolFilters {
  stepSize: number;
  minQty: number;
  minNotional: number;
  quotePrecision: number;
}

interface BinanceFailure {
  code?: number;
  msg?: string;
}

export class BinanceFailureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BinanceFailureError";
  }
}

export function spotBase(testnet: boolean): string {
  return testnet ? "https://testnet.binance.vision" : "https://api.binance.com";
}

function signedQuery(secret: string, params: Record<string, string>): string {
  const query = new URLSearchParams({ ...params, timestamp: String(Date.now()), recvWindow: "5000" });
  const signature = createHmac("sha256", secret).update(query.toString()).digest("hex");
  query.set("signature", signature);
  return query.toString();
}

async function call<T>(
  creds: BinanceCreds | null,
  method: "GET" | "POST" | "DELETE",
  path: string,
  params: Record<string, string>,
  signed: boolean,
): Promise<T> {
  const query = signed
    ? signedQuery(creds?.secret ?? "", params)
    : new URLSearchParams(params).toString();
  const origin = spotBase(creds?.testnet ?? false);
  const response = await fetch(`${origin}${path}?${query}`, {
    method,
    headers: creds ? { "X-MBX-APIKEY": creds.key } : {},
    signal: AbortSignal.timeout(12000),
  });
  const json = (await response.json()) as T & BinanceFailure;
  if (!response.ok || (typeof json.code === "number" && json.code < 0)) {
    throw new BinanceFailureError(json.msg || `Binance refused the request (${response.status})`);
  }
  return json;
}

export async function accountBalances(creds: BinanceCreds): Promise<SpotBalance[]> {
  const json = await call<{ balances: { asset: string; free: string; locked: string }[] }>(
    creds,
    "GET",
    "/api/v3/account",
    {},
    true,
  );
  return json.balances
    .map((row) => ({ asset: row.asset, free: Number(row.free), locked: Number(row.locked) }))
    .filter((row) => row.free > 0 || row.locked > 0)
    .sort((a, b) => b.free + b.locked - (a.free + a.locked));
}

export async function klines(creds: BinanceCreds, symbol: string): Promise<{ openTime: number; close: number }[]> {
  const rows = await call<(number | string)[][]>(creds, "GET", "/api/v3/klines", {
    symbol,
    interval: "1h",
    limit: "120",
  }, false);
  return rows.map((row) => ({ openTime: Number(row[0]), close: Number(row[4]) }));
}

export async function lastPrice(creds: BinanceCreds, symbol: string): Promise<number> {
  const json = await call<{ price: string }>(creds, "GET", "/api/v3/ticker/price", { symbol }, false);
  return Number(json.price);
}

export async function symbolFilters(creds: BinanceCreds, symbol: string): Promise<SymbolFilters> {
  const json = await call<{
    symbols: {
      quoteAssetPrecision?: number;
      quotePrecision?: number;
      filters: { filterType: string; stepSize?: string; minQty?: string; minNotional?: string }[];
    }[];
  }>(creds, "GET", "/api/v3/exchangeInfo", { symbol }, false);
  const info = json.symbols[0];
  if (!info) throw new BinanceFailureError("Binance has no market for that pair");
  const lot = info.filters.find((filter) => filter.filterType === "LOT_SIZE");
  const notional = info.filters.find((filter) => filter.filterType === "NOTIONAL" || filter.filterType === "MIN_NOTIONAL");
  return {
    stepSize: Number(lot?.stepSize ?? "0.000001"),
    minQty: Number(lot?.minQty ?? "0"),
    minNotional: Number(notional?.minNotional ?? "5"),
    quotePrecision: info.quoteAssetPrecision ?? info.quotePrecision ?? 2,
  };
}

export async function recentFills(creds: BinanceCreds, symbol: string): Promise<SpotFill[]> {
  const rows = await call<{ time: number; isBuyer: boolean; qty: string; price: string; quoteQty: string }[]>(
    creds,
    "GET",
    "/api/v3/myTrades",
    { symbol, limit: "12" },
    true,
  );
  return rows
    .map((row) => ({
      time: row.time,
      side: row.isBuyer ? "buy" as const : "sell" as const,
      qty: Number(row.qty),
      price: Number(row.price),
      quote: Number(row.quoteQty),
    }))
    .reverse();
}

export async function marketBuy(creds: BinanceCreds, symbol: string, quote: string): Promise<void> {
  await call(creds, "POST", "/api/v3/order", {
    symbol,
    side: "BUY",
    type: "MARKET",
    quoteOrderQty: quote,
  }, true);
}

export async function marketSell(creds: BinanceCreds, symbol: string, quantity: string): Promise<void> {
  await call(creds, "POST", "/api/v3/order", {
    symbol,
    side: "SELL",
    type: "MARKET",
    quantity,
  }, true);
}
