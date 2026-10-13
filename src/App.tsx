import { useEffect } from "react";
import { MAKER_FEE, MARKET_MAP, TAKER_FEE } from "./data/markets";
import { AgentPanel } from "./components/AgentPanel";
import { BlogPage } from "./components/BlogPage";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { ChainPage } from "./components/ChainPage";
import { StakePage, VaultPage } from "./components/EarnPages";
import { Landing } from "./components/Landing";
import { MarketsPage } from "./components/MarketsPage";
import { Perps } from "./components/Perps";
import { PortfolioPage } from "./components/PortfolioPage";
import { BoardPage, RewardsPage } from "./components/RewardsBoard";
import { formatUsd } from "./lib/format";
import { liqPrice, positionSide } from "./lib/trading";
import { useStore } from "./state/store";
import type { Page } from "./types";

export function App() {
  const store = useStore();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (store.page !== "perps") return;
      if (event.key.toLowerCase() === "b") store.setSide("buy");
      if (event.key.toLowerCase() === "s") store.setSide("sell");
      if (event.key === "Escape") store.cancelDraft();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [store]);

  const desk = store.page === "perps";

  return (
    <div className={desk ? "app" : "shell"}>
      <Header />
      <main>
        <PageSwitch page={store.page} />
        {desk || store.page === "home" ? null : <Footer />}
      </main>
      {desk ? <Footer compact /> : null}
      {store.whatsNew && store.page === "perps" ? <WhatsNew /> : null}
      {store.draft ? <Confirm /> : null}
      <AgentPanel />
      <div className="toasts">
        {store.toasts.map((item) => (
          <div key={item.id} className={`toast ${item.tone}`}>
            <b>{item.title}</b>
            <span>{item.body}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PageSwitch({ page }: { page: Page }) {
  switch (page) {
    case "home":
      return <Landing />;
    case "perps":
      return <Perps />;
    case "markets":
      return <MarketsPage />;
    case "portfolio":
      return <PortfolioPage />;
    case "chain":
      return <ChainPage />;
    case "vault":
      return <VaultPage />;
    case "stake":
      return <StakePage />;
    case "rewards":
      return <RewardsPage />;
    case "board":
      return <BoardPage />;
    case "blog":
      return <BlogPage />;
    default: {
      const unreachable: never = page;
      return unreachable;
    }
  }
}

function WhatsNew() {
  const store = useStore();
  return (
    <aside className="whats-new">
      <div>
        <span className="spark">✦ What's New</span>
        <button type="button" onClick={store.dismissWhatsNew} aria-label="Dismiss">×</button>
      </div>
      <b>Perps on Robinhood Chain</b>
      <p>
        Tokenized stocks, ETH, and chain markets margined in USDG. Prints start from live pools.
        This desk is paper — fills stay in your browser.
      </p>
    </aside>
  );
}

function Confirm() {
  const store = useStore();
  const draft = store.draft;
  if (!draft) return null;
  const market = MARKET_MAP[draft.marketId];
  const fee = draft.notional * (draft.type === "market" ? TAKER_FEE : MAKER_FEE);
  const margin = draft.notional / draft.leverage;
  const liq = liqPrice({
    id: "preview",
    marketId: draft.marketId,
    side: positionSide(draft.side),
    qty: draft.notional / Math.max(draft.price, 1e-12),
    entry: draft.price,
    leverage: draft.leverage,
    margin,
    openedAt: 0,
    fundingPaid: 0,
  });
  return (
    <div className="modal-back" onClick={store.cancelDraft}>
      <div className="modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal>
        <h2>{draft.side === "buy" ? "Buy / Long" : "Sell / Short"} {market?.base}-USDG</h2>
        <dl>
          <div><dt>Type</dt><dd>{draft.type}</dd></div>
          <div><dt>Size</dt><dd>{formatUsd(draft.notional, 2)}</dd></div>
          <div><dt>Leverage</dt><dd>{draft.leverage}x cross</dd></div>
          <div><dt>Price</dt><dd>{formatUsd(draft.price)}</dd></div>
          <div><dt>Margin</dt><dd>{formatUsd(margin, 2)}</dd></div>
          <div><dt>Est. liquidation</dt><dd>{formatUsd(liq)}</dd></div>
          <div><dt>Fee</dt><dd>{formatUsd(fee, 2)}</dd></div>
        </dl>
        <label className="check">
          <input type="checkbox" checked={store.skipConfirm} onChange={(event) => store.setSkipConfirm(event.target.checked)} />
          Don't ask again
        </label>
        <div className="modal-actions">
          <button type="button" className="btn ghost" onClick={store.cancelDraft}>Cancel</button>
          <button type="button" className={draft.side === "buy" ? "submit buy" : "submit sell"} onClick={store.confirmOrder}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
