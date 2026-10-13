import { useEffect, useRef, useState } from "react";
import { EXPLORER, MARKET_MAP } from "../data/markets";
import { formatFunding, formatPrice, formatTime, groupingsFor } from "../lib/format";
import { TIMEFRAMES, buildBook, depthSeries, getCandles, getLast, getTrades } from "../lib/series";
import { useStore } from "../state/store";
import type { Candle } from "../types";

interface Plot {
  left: number;
  top: number;
  width: number;
  height: number;
  count: number;
}

export function ChartPanel() {
  const store = useStore();
  const market = MARKET_MAP[store.marketId];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const plotRef = useRef<Plot>({ left: 0, top: 0, width: 1, height: 1, count: 1 });
  const [hover, setHover] = useState<number | null>(null);
  const candles = getCandles(store.marketId, store.timeframe);
  const active = hover != null ? candles[hover] : candles[candles.length - 1];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || store.chartTab !== "chart") return;
    drawCandles(canvas, candles, plotRef.current, {
      sma: store.showSma,
      volume: store.showVolume,
      hover,
    });
  }, [candles, hover, store.chartTab, store.rev, store.showSma, store.showVolume]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || store.chartTab !== "depth") return;
    const groups = groupingsFor(getLast(store.marketId));
    const tick = groups[Math.min(store.groupIndex, groups.length - 1)] ?? groups[0];
    drawDepth(canvas, buildBook(store.marketId, tick, 18));
  }, [store.chartTab, store.groupIndex, store.marketId, store.rev]);

  if (!market) return null;

  return (
    <section className="chart-pane">
      <div className="tabs">
        <Tab id="chart" label="Price Charts" />
        <Tab id="depth" label="Depth" />
        <Tab id="funding" label="Funding" />
        <Tab id="asset" label="Asset Details" />
        <Tab id="tape" label="Chain Tape" />
      </div>
      {store.chartTab === "chart" ? (
        <>
          <div className="chart-toolbar">
            <div className="tf">
              {TIMEFRAMES.map((tf) => (
                <button key={tf} className={store.timeframe === tf ? "on" : ""} onClick={() => store.setTimeframe(tf)}>
                  {tf}
                </button>
              ))}
            </div>
            <button className={store.showSma ? "tool on" : "tool"} onClick={() => store.setShowSma(!store.showSma)}>
              SMA 20
            </button>
            <button className={store.showVolume ? "tool on" : "tool"} onClick={() => store.setShowVolume(!store.showVolume)}>
              Volume
            </button>
            <span className="clock">{formatTime(Date.now())}</span>
          </div>
          <div className="legend">
            <b>{market.base}-USDG</b>
            <span>{store.timeframe}</span>
            {active ? <Ohlc candle={active} /> : null}
          </div>
          <div
            className="canvas-wrap"
            onMouseLeave={() => setHover(null)}
            onMouseMove={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              const x = event.clientX - rect.left;
              const plot = plotRef.current;
              if (x < plot.left || x > plot.left + plot.width) {
                setHover(null);
                return;
              }
              const index = Math.round(((x - plot.left) / plot.width) * (plot.count - 1));
              setHover(Math.max(0, Math.min(plot.count - 1, index)));
            }}
          >
            <canvas ref={canvasRef} />
          </div>
        </>
      ) : null}
      {store.chartTab === "depth" ? (
        <div className="canvas-wrap depth-wrap">
          <canvas ref={canvasRef} />
        </div>
      ) : null}
      {store.chartTab === "funding" ? <FundingView marketId={market.id} rate={market.fundingHourly} /> : null}
      {store.chartTab === "asset" ? (
        <div className="asset">
          <div>
            <span>Market</span>
            <b>{market.name}</b>
          </div>
          <div>
            <span>Contract</span>
            <b>{market.address ? <a href={`${EXPLORER}/token/${market.address}`} target="_blank" rel="noreferrer">{market.address}</a> : "Pool priced"}</b>
          </div>
          <div>
            <span>Pool</span>
            <b className="break">{market.pool ?? "—"}</b>
          </div>
          <div>
            <span>Venue</span>
            <b>{market.dex ?? "Robinhood Chain"}</b>
          </div>
          <div>
            <span>Max leverage</span>
            <b>{market.maxLev}x</b>
          </div>
          <div>
            <span>Fees</span>
            <b>0.050% taker / 0.020% maker</b>
          </div>
          <div>
            <span>Maintenance</span>
            <b>0.50%</b>
          </div>
          <div>
            <span>Collateral</span>
            <b>USDG · cross</b>
          </div>
          <p>
            Marks start from Robinhood Chain pool prints and then move on this paper desk.
            Orders stay in the browser. They are not sent to a perps contract.
          </p>
        </div>
      ) : null}
      {store.chartTab === "tape" ? (
        <div className="tape-list">
          {getTrades(store.marketId).map((trade) => (
            <div key={trade.id} className={trade.side === "buy" ? "up" : "down"}>
              <span>{formatPrice(trade.price)}</span>
              <span>{formatTime(trade.time)}</span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function Tab({ id, label }: { id: "chart" | "depth" | "funding" | "asset" | "tape"; label: string }) {
  const store = useStore();
  return (
    <button className={store.chartTab === id ? "tab on" : "tab"} onClick={() => store.setChartTab(id)}>
      {label}
    </button>
  );
}

function Ohlc({ candle }: { candle: Candle }) {
  const up = candle.c >= candle.o;
  return (
    <span className={up ? "ohlc up" : "ohlc down"}>
      O {formatPrice(candle.o)} H {formatPrice(candle.h)} L {formatPrice(candle.l)} C {formatPrice(candle.c)}
    </span>
  );
}

function FundingView({ marketId, rate }: { marketId: string; rate: number }) {
  const bars = Array.from({ length: 24 }, (_, index) => {
    const wave = Math.sin(index / 3 + marketId.length) * rate * 0.35;
    return rate + wave;
  });
  const max = Math.max(...bars.map((bar) => Math.abs(bar)), 1e-8);
  return (
    <div className="funding-view">
      <div className="funding-now">
        <span>1hr avg. funding</span>
        <b className={rate >= 0 ? "up" : "down"}>{formatFunding(rate)}</b>
        <small>Longs pay when the rate is positive. Accrues on open paper positions.</small>
      </div>
      <div className="funding-bars">
        {bars.map((bar, index) => (
          <i
            key={`${marketId}-${index}`}
            className={bar >= 0 ? "up" : "down"}
            style={{ height: `${Math.max(8, (Math.abs(bar) / max) * 100)}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function drawCandles(
  canvas: HTMLCanvasElement,
  candles: Candle[],
  plot: Plot,
  opts: { sma: boolean; volume: boolean; hover: number | null },
) {
  const parent = canvas.parentElement;
  if (!parent) return;
  const dpr = window.devicePixelRatio || 1;
  const width = parent.clientWidth;
  const height = parent.clientHeight;
  canvas.width = Math.max(1, Math.floor(width * dpr));
  canvas.height = Math.max(1, Math.floor(height * dpr));
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext("2d");
  if (!ctx || width < 20 || height < 20) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#07120c";
  ctx.fillRect(0, 0, width, height);

  const axis = 68;
  const top = 12;
  const volumeH = opts.volume ? Math.max(36, height * 0.2) : 0;
  const bottom = 22 + volumeH;
  const plotW = width - axis - 8;
  const plotH = height - top - bottom;
  plot.left = 8;
  plot.top = top;
  plot.width = plotW;
  plot.height = plotH;
  plot.count = Math.max(candles.length, 1);
  if (!candles.length) return;

  let min = Infinity;
  let max = -Infinity;
  for (const candle of candles) {
    min = Math.min(min, candle.l);
    max = Math.max(max, candle.h);
  }
  const pad = (max - min) * 0.08 || max * 0.01;
  min -= pad;
  max += pad;
  const yOf = (price: number) => top + ((max - price) / (max - min)) * plotH;
  const slot = plotW / candles.length;

  ctx.strokeStyle = "rgba(255,255,255,0.045)";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#8a9278";
  ctx.font = "11px Inter, sans-serif";
  ctx.textAlign = "right";
  for (let i = 0; i <= 4; i += 1) {
    const price = max - ((max - min) * i) / 4;
    const y = yOf(price);
    ctx.beginPath();
    ctx.moveTo(8, y);
    ctx.lineTo(width - axis, y);
    ctx.stroke();
    ctx.fillText(formatPrice(price), width - 8, y + 4);
  }

  candles.forEach((candle, index) => {
    const x = 8 + index * slot + slot / 2;
    const up = candle.c >= candle.o;
    ctx.strokeStyle = up ? "#10b77f" : "#ef4343";
    ctx.fillStyle = up ? "#10b77f" : "#ef4343";
    ctx.beginPath();
    ctx.moveTo(x, yOf(candle.h));
    ctx.lineTo(x, yOf(candle.l));
    ctx.stroke();
    const bodyTop = yOf(Math.max(candle.o, candle.c));
    const bodyBot = yOf(Math.min(candle.o, candle.c));
    const bodyH = Math.max(1, bodyBot - bodyTop);
    ctx.fillRect(x - Math.max(1, slot * 0.32), bodyTop, Math.max(2, slot * 0.64), bodyH);
  });

  if (opts.sma) {
    ctx.beginPath();
    ctx.strokeStyle = "#ccff00";
    ctx.lineWidth = 1.4;
    let started = false;
    candles.forEach((_, index) => {
      if (index < 19) return;
      let sum = 0;
      for (let k = 0; k < 20; k += 1) sum += candles[index - k].c;
      const x = 8 + index * slot + slot / 2;
      const y = yOf(sum / 20);
      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  const last = candles[candles.length - 1];
  if (last) {
    const y = yOf(last.c);
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = last.c >= last.o ? "#10b77f" : "#ef4343";
    ctx.beginPath();
    ctx.moveTo(8, y);
    ctx.lineTo(width - axis, y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = last.c >= last.o ? "#10b77f" : "#ef4343";
    roundRect(ctx, width - axis + 2, y - 9, axis - 10, 18, 3);
    ctx.fill();
    ctx.fillStyle = "#07120c";
    ctx.textAlign = "center";
    ctx.font = "600 11px Inter, sans-serif";
    ctx.fillText(formatPrice(last.c), width - axis / 2 - 2, y + 4);
  }

  if (opts.hover != null && candles[opts.hover]) {
    const x = 8 + opts.hover * slot + slot / 2;
    ctx.strokeStyle = "rgba(244,244,245,0.35)";
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, top + plotH);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  if (opts.volume) {
    const maxV = Math.max(...candles.map((candle) => candle.v), 1);
    const base = height - 18;
    candles.forEach((candle, index) => {
      const h = (candle.v / maxV) * (volumeH - 8);
      ctx.fillStyle = candle.c >= candle.o ? "rgba(16,183,127,0.45)" : "rgba(239,67,67,0.45)";
      ctx.fillRect(8 + index * slot + 1, base - h, Math.max(1, slot - 2), h);
    });
  }

  ctx.fillStyle = "#8a9278";
  ctx.font = "11px Inter, sans-serif";
  ctx.textAlign = "center";
  const step = Math.max(1, Math.floor(candles.length / 5));
  for (let i = 0; i < candles.length; i += step) {
    const stamp = new Date(candles[i].t);
    const label = storeLabel(stamp, candles[0]?.t ?? 0, candles[candles.length - 1]?.t ?? 0);
    ctx.fillText(label, 8 + i * slot, height - 4);
  }
}

function storeLabel(date: Date, start: number, end: number): string {
  const span = end - start;
  if (span > 20 * 24 * 3600 * 1000) return `${date.getMonth() + 1}/${date.getDate()}`;
  if (span > 2 * 24 * 3600 * 1000) return `${date.getMonth() + 1}/${date.getDate()}`;
  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawDepth(canvas: HTMLCanvasElement, book: ReturnType<typeof buildBook>) {
  const parent = canvas.parentElement;
  if (!parent) return;
  const dpr = window.devicePixelRatio || 1;
  const width = parent.clientWidth;
  const height = parent.clientHeight;
  canvas.width = Math.max(1, Math.floor(width * dpr));
  canvas.height = Math.max(1, Math.floor(height * dpr));
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = "#07120c";
  ctx.fillRect(0, 0, width, height);
  const { bids, asks } = depthSeries(book);
  const max = Math.max(bids[bids.length - 1]?.total ?? 1, asks[asks.length - 1]?.total ?? 1);
  const mid = width / 2;
  const drawSide = (levels: typeof bids, color: string, dir: number) => {
    ctx.beginPath();
    ctx.moveTo(mid, height - 24);
    levels.forEach((level, index) => {
      const x = mid + dir * ((index + 1) / levels.length) * (mid - 24);
      const y = height - 24 - (level.total / max) * (height - 64);
      ctx.lineTo(x, y);
    });
    ctx.lineTo(mid + dir * (mid - 24), height - 24);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  };
  drawSide(bids, "rgba(16,183,127,0.25)", -1);
  drawSide(asks, "rgba(239,67,67,0.25)", 1);
  ctx.fillStyle = "#f4f6f0";
  ctx.font = "600 13px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Cumulative depth", mid, 28);
}
