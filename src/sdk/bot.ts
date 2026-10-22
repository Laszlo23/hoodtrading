export type BotSymbol = "BTCUSDT" | "ETHUSDT";
export type BotSignal = "buy" | "sell" | "hold";

export interface BotFill {
  time: number;
  side: "buy" | "sell";
  qty: number;
  price: number;
  quote: number;
}

export interface BotBalance {
  asset: string;
  free: number;
  locked: number;
}

export interface BotView {
  connected: boolean;
  testnet: boolean;
  armed: boolean;
  keyTail: string;
  symbol: BotSymbol;
  balances: BotBalance[];
  price: number | null;
  fast: number | null;
  slow: number | null;
  signal: BotSignal;
  baseFree: number;
  entry: number | null;
  stop: number | null;
  lastError: string | null;
  fills: BotFill[];
  rule: string;
}

const SESSION = "hood-bot-session";

export function savedBotSession(): string {
  try {
    return sessionStorage.getItem(SESSION) ?? "";
  } catch {
    return "";
  }
}

export function rememberBotSession(token: string): void {
  if (token) sessionStorage.setItem(SESSION, token);
  else sessionStorage.removeItem(SESSION);
}

async function botFetch<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const response = await fetch(path, {
    method: init?.method ?? "GET",
    headers: {
      "content-type": "application/json",
      "x-hood-bot": savedBotSession(),
    },
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const json = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(json.error || "The bot did not answer");
  return json;
}

export function loadBot(): Promise<BotView> {
  return botFetch<BotView>("/api/bot");
}

export async function connectBot(apiKey: string, apiSecret: string, testnet: boolean): Promise<BotView> {
  const result = await botFetch<{ token: string; view: BotView }>("/api/bot/connect", {
    method: "POST",
    body: { apiKey, apiSecret, testnet },
  });
  rememberBotSession(result.token);
  return result.view;
}

export async function disconnectBot(): Promise<BotView> {
  const view = await botFetch<BotView>("/api/bot/disconnect", { method: "POST", body: {} });
  rememberBotSession("");
  return view;
}

export function armBot(armed: boolean, symbol: BotSymbol): Promise<BotView> {
  return botFetch<BotView>("/api/bot/arm", { method: "POST", body: { armed, symbol } });
}
