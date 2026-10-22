import { useEffect, useState } from "react";
import { formatUsd } from "../lib/format";
import { armBot, connectBot, disconnectBot, loadBot, type BotSymbol, type BotView } from "../sdk/bot";

const EMPTY: BotView = {
  connected: false,
  testnet: false,
  armed: false,
  keyTail: "",
  symbol: "BTCUSDT",
  balances: [],
  price: null,
  fast: null,
  slow: null,
  signal: "hold",
  baseFree: 0,
  entry: null,
  stop: null,
  lastError: null,
  fills: [],
  rule: "Connect a Binance spot key. Withdrawals on that key should stay off. The bot stays idle until you arm it.",
};

function money(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return formatUsd(value, value >= 100 ? 2 : 4);
}

export function BotPage() {
  const [view, setView] = useState<BotView>(EMPTY);
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [testnet, setTestnet] = useState(false);
  const [symbol, setSymbol] = useState<BotSymbol>("BTCUSDT");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let stop = false;
    const pull = () => {
      loadBot()
        .then((next) => {
          if (stop) return;
          setView(next);
          if (next.connected) setSymbol(next.symbol);
        })
        .catch(() => {
          if (!stop) setError("The bot desk did not answer");
        });
    };
    pull();
    const timer = window.setInterval(pull, 15000);
    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, []);

  const usdt = view.balances.find((row) => row.asset === "USDT");

  return (
    <div className="page earn">
      <div className="earn-copy">
        <p className="kicker">Binance</p>
        <h1>Spot bot.</h1>
        <p>
          The key connects to Binance spot. The bot trades BTC or ETH against USDT with a one-hour trend
          and a hard stop. It does not promise a profit. Fills on this page are Binance fills.
        </p>
        <div className="dash">
          <article>
            <span>USDT free</span>
            <b>{usdt ? formatUsd(usdt.free, 2) : "—"}</b>
            <small>{view.connected ? `Key ···${view.keyTail}` : "Not connected"}</small>
          </article>
          <article>
            <span>{view.symbol.replace("USDT", "")}</span>
            <b>{view.baseFree.toLocaleString("en-US", { maximumFractionDigits: 6 })}</b>
            <small>{view.testnet ? "Testnet" : view.connected ? "Live spot" : "Waiting"}</small>
          </article>
          <article>
            <span>Price</span>
            <b>{money(view.price)}</b>
            <small>{view.signal === "buy" ? "Trend up" : view.signal === "sell" ? "Trend down" : "No trend"}</small>
          </article>
          <article>
            <span>Stop</span>
            <b>{money(view.stop)}</b>
            <small>{view.armed ? "Armed" : "Idle"}</small>
          </article>
        </div>
      </div>
      {view.connected ? (
        <form
          className="earn-card"
          onSubmit={(event) => {
            event.preventDefault();
            setBusy(true);
            setError("");
            armBot(!view.armed, symbol)
              .then(setView)
              .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "The bot did not arm"))
              .finally(() => setBusy(false));
          }}
        >
          <div className="sides">
            <button className={symbol === "BTCUSDT" ? "buy on" : "buy"} type="button" onClick={() => setSymbol("BTCUSDT")} disabled={view.armed}>BTC</button>
            <button className={symbol === "ETHUSDT" ? "buy on" : "buy"} type="button" onClick={() => setSymbol("ETHUSDT")} disabled={view.armed}>ETH</button>
          </div>
          <div className="avail">
            <span>Fast / slow</span>
            <b>{view.fast === null || view.slow === null ? "—" : `${money(view.fast)} / ${money(view.slow)}`}</b>
          </div>
          <button className={view.armed ? "submit sell" : "submit buy"} type="submit" disabled={busy}>
            {view.armed ? "Stop the bot" : "Arm the bot"}
          </button>
          <button
            className="btn ghost"
            type="button"
            onClick={() => {
              setBusy(true);
              disconnectBot()
                .then((next) => {
                  setView(next);
                  setApiSecret("");
                })
                .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "Disconnect failed"))
                .finally(() => setBusy(false));
            }}
          >
            Disconnect
          </button>
          {error || view.lastError ? <p className="fine">{error || view.lastError}</p> : null}
          <p className="fine">{view.rule}</p>
          {view.fills.length > 0 ? (
            <table>
              <thead>
                <tr><th>Time</th><th>Side</th><th>Qty</th><th>Price</th></tr>
              </thead>
              <tbody>
                {view.fills.map((fill) => (
                  <tr key={`${fill.time}-${fill.side}-${fill.qty}`}>
                    <td>{new Date(fill.time).toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}</td>
                    <td className={fill.side === "buy" ? "up" : "down"}>{fill.side}</td>
                    <td>{fill.qty.toLocaleString("en-US", { maximumFractionDigits: 6 })}</td>
                    <td>{money(fill.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </form>
      ) : (
        <form
          className="earn-card"
          onSubmit={(event) => {
            event.preventDefault();
            setBusy(true);
            setError("");
            connectBot(apiKey, apiSecret, testnet)
              .then((next) => {
                setView(next);
                setApiSecret("");
                setSymbol(next.symbol);
              })
              .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "Binance refused the key"))
              .finally(() => setBusy(false));
          }}
        >
          <label className="field">
            <span>API key</span>
            <input value={apiKey} autoComplete="off" spellCheck={false} onChange={(event) => setApiKey(event.target.value)} />
          </label>
          <label className="field">
            <span>Secret</span>
            <input type="password" value={apiSecret} autoComplete="off" onChange={(event) => setApiSecret(event.target.value)} />
          </label>
          <label className="check">
            <input type="checkbox" checked={testnet} onChange={(event) => setTestnet(event.target.checked)} />
            <span>Use the Binance spot testnet</span>
          </label>
          <button className="submit buy" type="submit" disabled={busy || apiKey.trim().length < 16 || apiSecret.trim().length < 16}>Connect</button>
          {error ? <p className="fine">{error}</p> : null}
          <p className="fine">
            Create the key at Binance with reading and spot trading on, and withdrawals off. The secret is sent once to this desk and kept in server memory for the session. It is not written into the browser.
          </p>
        </form>
      )}
    </div>
  );
}
