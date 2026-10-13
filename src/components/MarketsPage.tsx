import { useMemo, useState } from "react";
import { MARKETS } from "../data/markets";
import { formatCompact, formatPct, formatPrice } from "../lib/format";
import { getChange, getLast } from "../lib/series";
import { useStore } from "../state/store";
import { Mark } from "./Mark";
import type { MarketKind } from "../types";

type Filter = "all" | MarketKind | "fav";

export function MarketsPage() {
  const store = useStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [view, setView] = useState<"both" | "heat" | "list">("both");

  const rows = useMemo(() => {
    return MARKETS.map((market) => ({ market, change: getChange(market.id), last: getLast(market.id) }))
      .filter(({ market }) => {
        if (filter === "fav") return store.favorites.includes(market.id);
        if (filter === "all") return true;
        return market.kind === filter;
      })
      .filter(({ market }) => {
        const q = query.trim().toLowerCase();
        return !q || market.base.toLowerCase().includes(q) || market.name.toLowerCase().includes(q);
      })
      .sort((a, b) => b.market.volume24h - a.market.volume24h);
  }, [filter, query, store.favorites, store.rev]);

  const volume = rows.reduce((sum, row) => sum + row.market.volume24h, 0);
  const liquidity = rows.reduce((sum, row) => sum + row.market.liquidity, 0);
  const green = rows.filter((row) => row.change >= 0).length;
  const sentiment = rows.length ? (green / rows.length) * 100 : 0;
  const ranked = [...rows].sort((a, b) => b.change - a.change);
  const gainer = ranked[0];
  const loser = ranked[ranked.length - 1];

  return (
    <div className="page">
      <div className="dash">
        <article>
          <span>Sentiment</span>
          <b className={sentiment >= 50 ? "up" : "down"}>{sentiment.toFixed(0)}% bid</b>
          <small>{green} of {rows.length} markets higher</small>
        </article>
        <article>
          <span>24h Volume</span>
          <b>{formatCompact(volume)}</b>
          <small>Listed pool volume</small>
        </article>
        <article>
          <span>Liquidity</span>
          <b>{formatCompact(liquidity)}</b>
          <small>Pool reserves</small>
        </article>
        <article>
          <span>Top mover</span>
          <b className="up">{gainer ? `${gainer.market.base} ${formatPct(gainer.change)}` : "—"}</b>
          <small className="down">{loser ? `${loser.market.base} ${formatPct(loser.change)}` : ""}</small>
        </article>
      </div>
      <div className="page-tools">
        <input placeholder="Search markets" value={query} onChange={(event) => setQuery(event.target.value)} />
        <div className="chips">
          {(["all", "fav", "stock", "crypto", "chain"] as Filter[]).map((item) => (
            <button key={item} className={filter === item ? "on" : ""} type="button" onClick={() => setFilter(item)}>
              {item === "all" ? "All" : item === "fav" ? "Favorites" : item === "stock" ? "Stocks" : item === "crypto" ? "Crypto" : "Chain"}
            </button>
          ))}
        </div>
        <div className="chips">
          <button className={view !== "list" ? "on" : ""} type="button" onClick={() => setView(view === "heat" ? "both" : "heat")}>Heatmap</button>
          <button className={view !== "heat" ? "on" : ""} type="button" onClick={() => setView(view === "list" ? "both" : "list")}>List</button>
        </div>
      </div>
      {view !== "list" ? (
        <div className="heat">
          {rows.map(({ market, change, last }) => (
            <button
              key={market.id}
              type="button"
              style={{
                gridColumn: market.volume24h > 20_000_000 ? "span 2" : undefined,
                background: heat(change),
              }}
              onClick={() => store.selectMarket(market.id)}
            >
              <b>{market.base}</b>
              <span>{formatPrice(last)}</span>
              <em className={change >= 0 ? "up" : "down"}>{formatPct(change)}</em>
            </button>
          ))}
        </div>
      ) : null}
      {view !== "heat" ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th></th><th>Market</th><th>Price</th><th>24h</th><th>Funding</th><th>Volume</th><th>Liquidity</th><th>Max</th><th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ market, change, last }) => (
                <tr key={market.id}>
                  <td>
                    <button className={store.favorites.includes(market.id) ? "star on" : "star"} type="button" onClick={() => store.toggleFavorite(market.id)}>★</button>
                  </td>
                  <td>
                    <span className="cell-market"><Mark symbol={market.base} /> {market.base}-USDG <small>{market.name}</small></span>
                  </td>
                  <td>{formatPrice(last)}</td>
                  <td className={change >= 0 ? "up" : "down"}>{formatPct(change)}</td>
                  <td>{market.fundingHourly.toFixed(4)}%</td>
                  <td>{formatCompact(market.volume24h)}</td>
                  <td>{formatCompact(market.liquidity)}</td>
                  <td>{market.maxLev}x</td>
                  <td><button className="btn cyan tiny" type="button" onClick={() => store.selectMarket(market.id)}>Trade</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

function heat(change: number): string {
  const mag = Math.min(1, Math.abs(change) / 8);
  if (change >= 0) return `rgba(16, 183, 127, ${0.18 + mag * 0.55})`;
  return `rgba(239, 67, 67, ${0.18 + mag * 0.55})`;
}
