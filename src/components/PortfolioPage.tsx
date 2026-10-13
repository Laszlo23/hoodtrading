import { useEffect, useRef } from "react";
import { MARKET_MAP } from "../data/markets";
import { formatPct, formatSignedUsd, formatUsd } from "../lib/format";
import { pnl } from "../lib/trading";
import { getLast } from "../lib/series";
import { useStore } from "../state/store";

export function PortfolioPage() {
  const store = useStore();
  const samples = useRef<number[]>([store.equity]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const day = ((store.equity - store.account.sessionEquity) / Math.max(store.account.sessionEquity, 1)) * 100;

  useEffect(() => {
    const last = samples.current[samples.current.length - 1];
    if (last !== store.equity) samples.current.push(store.equity);
    if (samples.current.length > 180) samples.current.shift();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const dpr = window.devicePixelRatio || 1;
    const width = parent.clientWidth;
    const height = 180;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const data = samples.current;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = max - min || 1;
    ctx.beginPath();
    data.forEach((value, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * (width - 8) + 4;
      const y = height - 16 - ((value - min) / span) * (height - 32);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = day >= 0 ? "#10b77f" : "#ef4343";
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }, [day, store.equity, store.rev]);

  return (
    <div className="page">
      <div className="portfolio-hero">
        <div>
          <span>Account equity</span>
          <strong>{formatUsd(store.equity, 2)}</strong>
          <em className={day >= 0 ? "up" : "down"}>{formatPct(day)} session</em>
        </div>
        <div className="equity-chart">
          <canvas ref={canvasRef} />
        </div>
      </div>
      <div className="dash four">
        <article><span>Available</span><b>{formatUsd(store.available, 2)}</b></article>
        <article><span>Margin used</span><b>{formatUsd(store.margin, 2)}</b></article>
        <article><span>Unrealized PnL</span><b className={store.upnl >= 0 ? "up" : "down"}>{formatSignedUsd(store.upnl)}</b></article>
        <article><span>Free USDG</span><b>{formatUsd(store.account.balance, 2)}</b></article>
      </div>
      <div className="section-head">
        <h2>Positions</h2>
        <button className="text-btn" type="button" onClick={store.resetAccount}>Reset paper account</button>
      </div>
      {store.account.positions.length === 0 ? <div className="empty">No open positions. Trade from Perps.</div> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Market</th><th>Side</th><th>Entry</th><th>Mark</th><th>PnL</th><th></th></tr>
            </thead>
            <tbody>
              {store.account.positions.map((position) => {
                const profit = pnl(position, getLast(position.marketId));
                return (
                  <tr key={position.id}>
                    <td>{MARKET_MAP[position.marketId]?.base}-USDG</td>
                    <td className={position.side === "long" ? "up" : "down"}>{position.side} {position.leverage}x</td>
                    <td>{formatUsd(position.entry)}</td>
                    <td>{formatUsd(getLast(position.marketId))}</td>
                    <td className={profit >= 0 ? "up" : "down"}>{formatSignedUsd(profit)}</td>
                    <td><button className="text-btn" type="button" onClick={() => store.closeOne(position.id)}>Close</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
