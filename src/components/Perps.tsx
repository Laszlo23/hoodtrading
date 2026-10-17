import { useEffect, useMemo, useRef, useState } from "react";
import { MARKETS } from "../data/markets";
import { formatCompact, formatPct, formatPrice, formatUsd, fundingCountdown } from "../lib/format";
import { getChange, getLast, getMark } from "../lib/series";
import { useStore } from "../state/store";
import { armChapter } from "../state/chapter";
import { Book } from "./Book";
import { ChartPanel } from "./ChartPanel";
import { Dock } from "./Dock";
import { Mark } from "./Mark";
import { StoryRail } from "./StoryRail";
import { Ticket } from "./Ticket";

export function Perps() {
  const store = useStore();
  const market = MARKETS.find((item) => item.id === store.marketId);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const box = useRef<HTMLDivElement>(null);
  const last = market ? getLast(market.id) : 0;
  const change = market ? getChange(market.id) : 0;

  useEffect(() => {
    const onPointer = (event: MouseEvent) => {
      if (!box.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    return () => window.removeEventListener("mousedown", onPointer);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MARKETS.filter((item) => !q || item.base.toLowerCase().includes(q) || item.name.toLowerCase().includes(q))
      .slice()
      .sort((a, b) => b.volume24h - a.volume24h);
  }, [query, store.rev]);

  if (!market) return null;

  return (
    <>
    <StoryRail compact onOpen={(id) => { armChapter(id); store.setPage("intro"); }} />
    <div className="perps">
      <div className="subhead">
        <div className="pair-wrap" ref={box}>
          <button className="pair" type="button" onClick={() => setOpen((value) => !value)}>
            <Mark symbol={market.base} />
            <span>
              <strong>{market.base}-USDG</strong>
              <small>{market.maxLev}x</small>
            </span>
            <Caret />
          </button>
          {open ? (
            <div className="market-pop">
              <input
                autoFocus
                placeholder="Search markets"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <div className="market-list">
                {filtered.map((item) => {
                  const itemChange = getChange(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={item.id === market.id ? "on" : ""}
                      onClick={() => {
                        store.selectMarket(item.id);
                        setOpen(false);
                      }}
                    >
                      <i
                        className={store.favorites.includes(item.id) ? "star on" : "star"}
                        onClick={(event) => {
                          event.stopPropagation();
                          store.toggleFavorite(item.id);
                        }}
                      >
                        ★
                      </i>
                      <Mark symbol={item.base} />
                      <span className="m-name">
                        <b>{item.base}-USDG</b>
                        <small>{item.name}</small>
                      </span>
                      <span className="m-lev">{item.maxLev}x</span>
                      <span>{formatPrice(getLast(item.id))}</span>
                      <span className={itemChange >= 0 ? "up" : "down"}>{formatPct(itemChange)}</span>
                      <span className="dim">{formatCompact(item.volume24h)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
        <div className="last-price">
          <b className={change >= 0 ? "up" : "down"}>{formatUsd(last)}</b>
        </div>
        <Stat label="Mark Price" value={formatUsd(getMark(market.id))} />
        <Stat label="24h Change" value={formatPct(change)} tone={change >= 0 ? "up" : "down"} />
        <Stat label="24h Volume" value={formatCompact(market.volume24h)} />
        <Stat label="Liquidity" value={formatCompact(market.liquidity)} />
        <Stat label="1hr Funding" value={`${market.fundingHourly.toFixed(7)}%`} />
        <Stat label="Next Funding" value={fundingCountdown()} />
      </div>
      <ChartPanel />
      <Book />
      <Ticket />
      <Dock />
    </div>
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <b className={tone}>{value}</b>
    </div>
  );
}

function Caret() {
  return (
    <svg viewBox="0 0 12 12" className="caret" aria-hidden>
      <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
