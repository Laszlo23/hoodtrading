import { MAKER_FEE, MARKET_MAP, MMR, TAKER_FEE } from "../data/markets";
import { getLast } from "./series";
import type { Draft, Fill, OpenOrder, Position, PositionSide, Side } from "../types";

export interface Account {
  balance: number;
  positions: Position[];
  orders: OpenOrder[];
  fills: Fill[];
  sessionEquity: number;
}

let seq = 1;

function nextId(prefix: string): string {
  seq += 1;
  return `${prefix}${seq.toString(36)}`;
}

export function positionSide(side: Side): PositionSide {
  return side === "buy" ? "long" : "short";
}

export function pnl(position: Position, mark: number): number {
  const diff = position.side === "long" ? mark - position.entry : position.entry - mark;
  return diff * position.qty;
}

export function liqPrice(position: Position): number {
  if (position.side === "long") {
    return position.entry * (1 - 1 / position.leverage + MMR);
  }
  return position.entry * (1 + 1 / position.leverage - MMR);
}

export function usedMargin(account: Account): number {
  return account.positions.reduce((sum, position) => sum + position.margin, 0);
}

export function unrealized(account: Account): number {
  return account.positions.reduce((sum, position) => sum + pnl(position, getLast(position.marketId)), 0);
}

export function equityOf(account: Account): number {
  return account.balance + usedMargin(account) + unrealized(account);
}

export function availableOf(account: Account): number {
  return Math.max(0, account.balance + Math.min(0, unrealized(account)));
}

export function slippageOf(notional: number, liquidity: number): number {
  if (liquidity <= 0) return 0.01;
  return Math.min(0.02, (notional / liquidity) * 0.35);
}

function pushFill(account: Account, fill: Omit<Fill, "id" | "time"> & { time?: number }): void {
  account.fills.unshift({ ...fill, id: nextId("f"), time: fill.time ?? Date.now() });
  if (account.fills.length > 180) account.fills.length = 180;
}

function openPosition(
  account: Account,
  draft: Draft,
  fillPrice: number,
  notional: number,
  feeRate: number,
): string | null {
  const market = MARKET_MAP[draft.marketId];
  if (!market) return "Unknown market";
  const fee = notional * feeRate;
  const margin = notional / draft.leverage;
  if (margin + fee > availableOf(account) + 1e-8) return "Not enough free margin";
  const qty = notional / fillPrice;
  account.balance -= margin + fee;
  const existing = account.positions.find(
    (position) => position.marketId === draft.marketId && position.side === positionSide(draft.side),
  );
  if (existing) {
    const nextQty = existing.qty + qty;
    existing.entry = (existing.entry * existing.qty + fillPrice * qty) / nextQty;
    existing.qty = nextQty;
    existing.margin += margin;
    existing.leverage = draft.leverage;
    if (draft.tp) existing.tp = draft.tp;
    if (draft.sl) existing.sl = draft.sl;
  } else {
    account.positions.unshift({
      id: nextId("p"),
      marketId: draft.marketId,
      side: positionSide(draft.side),
      qty,
      entry: fillPrice,
      leverage: draft.leverage,
      margin,
      tp: draft.tp,
      sl: draft.sl,
      openedAt: Date.now(),
      fundingPaid: 0,
    });
  }
  pushFill(account, {
    marketId: draft.marketId,
    side: draft.side,
    price: fillPrice,
    qty,
    notional,
    fee,
    pnl: 0,
    kind: "open",
  });
  return null;
}

function closeQty(
  account: Account,
  position: Position,
  qty: number,
  price: number,
  feeRate: number,
  kind: Fill["kind"],
): void {
  const portion = Math.min(1, qty / position.qty);
  const closeQtyExact = position.qty * portion;
  const marginBack = position.margin * portion;
  const realized = pnl({ ...position, qty: closeQtyExact }, price);
  const fee = kind === "liq" ? position.margin * portion : closeQtyExact * price * feeRate;
  if (kind === "liq") {
    account.balance += Math.max(0, marginBack + realized);
  } else {
    account.balance += marginBack + realized - fee;
  }
  pushFill(account, {
    marketId: position.marketId,
    side: position.side === "long" ? "sell" : "buy",
    price,
    qty: closeQtyExact,
    notional: closeQtyExact * price,
    fee: kind === "liq" ? 0 : fee,
    pnl: realized - (kind === "liq" ? marginBack : fee),
    kind,
  });
  position.qty -= closeQtyExact;
  position.margin -= marginBack;
  if (position.qty <= 1e-10 || position.margin <= 1e-6) {
    account.positions = account.positions.filter((item) => item.id !== position.id);
  }
}

export function applyDraft(account: Account, draft: Draft, asMaker = false): string | null {
  const market = MARKET_MAP[draft.marketId];
  if (!market) return "Unknown market";
  if (draft.leverage < 1 || draft.leverage > market.maxLev) return `Max leverage is ${market.maxLev}x`;
  if (draft.notional <= 0) return "Enter a size";
  const mark = draft.type === "market" ? getLast(draft.marketId) : draft.price;
  if (!Number.isFinite(mark) || mark <= 0) return "No price";
  const feeRate = asMaker || draft.type !== "market" ? MAKER_FEE : TAKER_FEE;
  const slip = draft.type === "market" ? slippageOf(draft.notional, market.liquidity) : 0;
  const fillPrice = draft.type === "market" ? mark * (1 + (draft.side === "buy" ? slip : -slip)) : mark;

  const opposite = account.positions.find(
    (position) => position.marketId === draft.marketId && position.side !== positionSide(draft.side),
  );
  if (draft.reduceOnly && !opposite) return "Nothing to reduce";

  let notional = draft.notional;
  if (opposite) {
    const closable = opposite.qty * fillPrice;
    const closing = Math.min(notional, closable);
    closeQty(account, opposite, (closing / fillPrice), fillPrice, feeRate, "close");
    notional -= closing;
    if (draft.reduceOnly || notional <= 1) return null;
  }

  return openPosition(account, draft, fillPrice, notional, asMaker ? MAKER_FEE : feeRate);
}

export function closePosition(account: Account, id: string): string | null {
  const position = account.positions.find((item) => item.id === id);
  if (!position) return "Position already closed";
  const mark = getLast(position.marketId);
  closeQty(account, position, position.qty, mark, TAKER_FEE, "close");
  return null;
}

export function closeAll(account: Account, marketId?: string): void {
  const ids = account.positions
    .filter((position) => !marketId || position.marketId === marketId)
    .map((position) => position.id);
  ids.forEach((id) => closePosition(account, id));
}

function triggers(order: OpenOrder, mark: number): boolean {
  if (order.type === "limit") {
    return order.side === "buy" ? mark <= order.price : mark >= order.price;
  }
  return order.side === "buy" ? mark >= order.price : mark <= order.price;
}

export function settle(account: Account, dtMs: number): string[] {
  const notes: string[] = [];
  const hours = dtMs / 3_600_000;

  for (const position of [...account.positions]) {
    const market = MARKET_MAP[position.marketId];
    const mark = getLast(position.marketId);
    if (!market || mark <= 0) continue;
    const payment = position.qty * mark * (market.fundingHourly / 100) * hours;
    const signed = position.side === "long" ? payment : -payment;
    account.balance -= signed;
    position.fundingPaid += signed;

    const liq = liqPrice(position);
    const liquidated = position.side === "long" ? mark <= liq : mark >= liq;
    if (liquidated) {
      closeQty(account, position, position.qty, mark, TAKER_FEE, "liq");
      notes.push(`${market.base} liquidated`);
      continue;
    }
    if (position.tp && (position.side === "long" ? mark >= position.tp : mark <= position.tp)) {
      closeQty(account, position, position.qty, mark, TAKER_FEE, "close");
      notes.push(`${market.base} take profit`);
      continue;
    }
    if (position.sl && (position.side === "long" ? mark <= position.sl : mark >= position.sl)) {
      closeQty(account, position, position.qty, mark, TAKER_FEE, "close");
      notes.push(`${market.base} stop loss`);
    }
  }

  const resting = [...account.orders];
  account.orders = [];
  for (const order of resting) {
    const mark = getLast(order.marketId);
    if (!triggers(order, mark)) {
      account.orders.push(order);
      continue;
    }
    const error = applyDraft(
      account,
      {
        marketId: order.marketId,
        side: order.side,
        type: order.type === "limit" ? "limit" : "market",
        leverage: order.leverage,
        notional: order.notional,
        price: order.type === "limit" ? order.price : mark,
        reduceOnly: order.reduceOnly,
        tp: order.tp,
        sl: order.sl,
      },
      order.type === "limit",
    );
    const market = MARKET_MAP[order.marketId];
    notes.push(error ? `${market?.base ?? "Order"} failed: ${error}` : `${market?.base ?? "Order"} filled`);
  }

  return notes;
}

export function queueOrder(account: Account, draft: Draft): string | null {
  if (draft.type === "market") return applyDraft(account, draft);
  if (draft.price <= 0) return "Enter a price";
  const market = MARKET_MAP[draft.marketId];
  if (!market) return "Unknown market";
  if (draft.leverage < 1 || draft.leverage > market.maxLev) return `Max leverage is ${market.maxLev}x`;
  if (draft.notional <= 0) return "Enter a size";
  const margin = draft.notional / draft.leverage;
  if (!draft.reduceOnly && margin > availableOf(account)) return "Not enough free margin";
  account.orders.unshift({
    id: nextId("o"),
    marketId: draft.marketId,
    side: draft.side,
    type: draft.type,
    price: draft.price,
    notional: draft.notional,
    leverage: draft.leverage,
    reduceOnly: draft.reduceOnly,
    tp: draft.tp,
    sl: draft.sl,
    createdAt: Date.now(),
  });
  return null;
}
