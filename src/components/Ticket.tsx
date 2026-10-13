import { useState } from "react";
import { MAKER_FEE, MARKET_MAP, TAKER_FEE } from "../data/markets";
import { formatPrice, formatUsd } from "../lib/format";
import { getLast } from "../lib/series";
import { liqPrice, positionSide, slippageOf } from "../lib/trading";
import { useStore } from "../state/store";

export function Ticket() {
  const store = useStore();
  const market = MARKET_MAP[store.marketId];
  const [levOpen, setLevOpen] = useState(false);
  if (!market) return null;
  const last = getLast(market.id);
  const parsed = Number(store.size);
  const notional = Number.isFinite(parsed) && parsed > 0 ? (store.sizeMode === "usd" ? parsed : parsed * last) : 0;
  const maxNotional = store.available * store.leverage;
  const margin = notional / store.leverage;
  const feeRate = store.orderType === "market" ? TAKER_FEE : MAKER_FEE;
  const slip = store.orderType === "market" ? slippageOf(notional, market.liquidity) : 0;
  const entry = store.orderType === "market" ? last * (1 + (store.side === "buy" ? slip : -slip)) : Number(store.limitPrice) || last;
  const preview = liqPrice({
    id: "preview",
    marketId: market.id,
    side: positionSide(store.side),
    qty: notional / Math.max(entry, 1e-12),
    entry,
    leverage: store.leverage,
    margin,
    openedAt: 0,
    fundingPaid: 0,
  });

  const setPortion = (portion: number) => {
    const next = maxNotional * portion;
    if (store.sizeMode === "usd") store.setSize(next > 0 ? next.toFixed(2) : "");
    else store.setSize(last > 0 ? (next / last).toPrecision(4) : "");
  };

  return (
    <section className="ticket-pane">
      <div className="ticket-top">
        <div className="seg">
          <button className="on" type="button">Cross</button>
          <button type="button" disabled title="Cross margin only">Isolated</button>
        </div>
        <div className="lev-wrap">
          <button className="lev" type="button" onClick={() => setLevOpen((open) => !open)}>
            {store.leverage}x
          </button>
          {levOpen ? (
            <div className="lev-pop">
              <div className="lev-presets">
                {[1, 2, 5, 10, market.maxLev].filter((value, index, list) => list.indexOf(value) === index && value <= market.maxLev).map((value) => (
                  <button key={value} className={store.leverage === value ? "on" : ""} type="button" onClick={() => store.setLeverage(value)}>
                    {value}x
                  </button>
                ))}
              </div>
              <input
                type="range"
                min={1}
                max={market.maxLev}
                value={store.leverage}
                onChange={(event) => store.setLeverage(Number(event.target.value))}
              />
            </div>
          ) : null}
        </div>
      </div>
      <div className="sides">
        <button className={store.side === "buy" ? "buy on" : "buy"} type="button" onClick={() => store.setSide("buy")}>Buy</button>
        <button className={store.side === "sell" ? "sell on" : "sell"} type="button" onClick={() => store.setSide("sell")}>Sell</button>
      </div>
      <div className="order-types">
        <button className={store.orderType === "market" ? "on" : ""} type="button" onClick={() => store.setOrderType("market")}>Market</button>
        <button className={store.orderType === "limit" ? "on" : ""} type="button" onClick={() => store.setOrderType("limit")}>Limit</button>
        <button className={store.orderType === "stop" ? "on" : ""} type="button" onClick={() => store.setOrderType("stop")}>Stop Market</button>
      </div>
      <div className="avail">
        <span>Available</span>
        <b>{formatUsd(store.available, 2)}</b>
      </div>
      {store.orderType !== "market" ? (
        <label className="field">
          <span>{store.orderType === "limit" ? "Limit price" : "Stop price"}</span>
          <input
            inputMode="decimal"
            value={store.limitPrice}
            placeholder={formatPrice(last)}
            onChange={(event) => store.setLimitPrice(event.target.value)}
          />
        </label>
      ) : (
        <div className="field static">
          <span>Market price</span>
          <b>Market</b>
        </div>
      )}
      <label className="field">
        <span>Value</span>
        <input
          inputMode="decimal"
          value={store.size}
          placeholder="0.00"
          onChange={(event) => store.setSize(event.target.value)}
        />
        <button type="button" className="unit" onClick={() => store.setSizeMode(store.sizeMode === "usd" ? "base" : "usd")}>
          {store.sizeMode === "usd" ? "USD" : market.base}
        </button>
      </label>
      <input
        className="slider"
        type="range"
        min={0}
        max={100}
        value={maxNotional > 0 ? Math.min(100, (notional / maxNotional) * 100) : 0}
        onChange={(event) => setPortion(Number(event.target.value) / 100)}
        aria-label="Size"
      />
      <div className="portions">
        {[0.25, 0.5, 0.75, 1].map((portion) => (
          <button key={portion} type="button" onClick={() => setPortion(portion)}>{portion * 100}%</button>
        ))}
      </div>
      <label className="check">
        <input type="checkbox" checked={store.reduceOnly} onChange={(event) => store.setReduceOnly(event.target.checked)} />
        Reduce Only
      </label>
      <label className="check">
        <input type="checkbox" checked={store.tpSl} onChange={(event) => store.setTpSl(event.target.checked)} />
        TP/SL
      </label>
      {store.tpSl ? (
        <div className="tp-row">
          <label className="field">
            <span>Take profit</span>
            <input inputMode="decimal" value={store.tp} onChange={(event) => store.setTp(event.target.value)} />
          </label>
          <label className="field">
            <span>Stop loss</span>
            <input inputMode="decimal" value={store.sl} onChange={(event) => store.setSl(event.target.value)} />
          </label>
        </div>
      ) : null}
      <button
        className={store.side === "buy" ? "submit buy" : "submit sell"}
        type="button"
        onClick={store.requestOrder}
      >
        {store.side === "buy" ? "Buy / Long" : "Sell / Short"}
      </button>
      <dl className="est">
        <div><dt>Est. Liq</dt><dd>{notional > 0 ? formatUsd(preview) : "—"}</dd></div>
        <div><dt>Margin</dt><dd>{formatUsd(margin, 2)}</dd></div>
        <div><dt>Max</dt><dd>{formatUsd(maxNotional, 2)}</dd></div>
        <div><dt>Est. Slippage</dt><dd>{(slip * 100).toFixed(3)}%</dd></div>
        <div><dt>Fees</dt><dd>{(TAKER_FEE * 100).toFixed(3)}% / {(MAKER_FEE * 100).toFixed(3)}%</dd></div>
        <div><dt>Order fee</dt><dd>{formatUsd(notional * feeRate, 2)}</dd></div>
      </dl>
    </section>
  );
}
