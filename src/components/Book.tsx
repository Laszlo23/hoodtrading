import { MARKET_MAP } from "../data/markets";
import { formatPrice, formatQty, groupingsFor } from "../lib/format";
import { buildBook, getLast, getMark, getTrades } from "../lib/series";
import { useStore } from "../state/store";

export function Book() {
  const store = useStore();
  const market = MARKET_MAP[store.marketId];
  if (!market) return null;
  const groups = groupingsFor(getLast(market.id));
  const tick = groups[Math.min(store.groupIndex, groups.length - 1)] ?? groups[0];
  const book = buildBook(market.id, tick, 14);
  const maxTotal = Math.max(book.asks[0]?.total ?? 1, book.bids[book.bids.length - 1]?.total ?? 1);
  const last = getLast(market.id);
  const mark = getMark(market.id);
  const spread = book.asks[book.asks.length - 1] && book.bids[0]
    ? book.asks[book.asks.length - 1].price - book.bids[0].price
    : 0;

  return (
    <section className="book-pane">
      <div className="book-head">
        <b>Order Book</b>
        <select
          value={store.groupIndex}
          onChange={(event) => store.setGroupIndex(Number(event.target.value))}
          aria-label="Grouping"
        >
          {groups.map((group, index) => (
            <option key={group} value={index}>
              {formatPrice(group)}
            </option>
          ))}
        </select>
      </div>
      <div className="book-cols">
        <span>Price (USD)</span>
        <span>Qty ({market.base})</span>
        <span>Total (USD)</span>
      </div>
      <div className="asks">
        {book.asks.map((level) => (
          <BookRow key={`a-${level.price}`} price={level.price} qty={level.qty} total={level.total} max={maxTotal} side="ask" onPick={store.setLimitPrice} />
        ))}
      </div>
      <button className="mid" onClick={() => store.setLimitPrice(last.toString())}>
        <strong>{formatPrice(last)}</strong>
        <small>Mark {formatPrice(mark)} · Spread {formatPrice(spread)}</small>
      </button>
      <div className="bids">
        {book.bids.map((level) => (
          <BookRow key={`b-${level.price}`} price={level.price} qty={level.qty} total={level.total} max={maxTotal} side="bid" onPick={store.setLimitPrice} />
        ))}
      </div>
      <div className="ratio" aria-hidden>
        <span className="bid" style={{ width: `${book.bidPct}%` }}>B {book.bidPct.toFixed(1)}%</span>
        <span className="ask" style={{ width: `${100 - book.bidPct}%` }}>S {(100 - book.bidPct).toFixed(1)}%</span>
      </div>
      <div className="trades-head">Recent Trades</div>
      <div className="trades">
        {getTrades(market.id).slice(0, 18).map((trade) => (
          <div key={trade.id} className={trade.side === "buy" ? "up" : "down"}>
            <span>{formatPrice(trade.price)}</span>
            <span>{formatQty(trade.qty)}</span>
            <span>{new Date(trade.time).toLocaleTimeString("en-US", { hour12: false })}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function BookRow({
  price,
  qty,
  total,
  max,
  side,
  onPick,
}: {
  price: number;
  qty: number;
  total: number;
  max: number;
  side: "ask" | "bid";
  onPick: (price: string) => void;
}) {
  return (
    <button className={`book-row ${side}`} onClick={() => onPick(price.toString())}>
      <i style={{ width: `${Math.min(100, (total / max) * 100)}%` }} />
      <span>{formatPrice(price)}</span>
      <span>{formatQty(qty)}</span>
      <span>{formatQty(total)}</span>
    </button>
  );
}
