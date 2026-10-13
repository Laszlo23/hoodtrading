import { useEffect, useRef, useState } from "react";
import { EXPLORER } from "../data/markets";
import { PROJECTS } from "../data/projects";
import { explorerAddress } from "../lib/chain";
import { formatCompact, shortAddr } from "../lib/format";
import { useStore } from "../state/store";
import type { Page } from "../types";
import { ShareButton } from "./ShareCard";

const LINKS: { id: Page; label: string }[] = [
  { id: "perps", label: "Trade" },
  { id: "vault", label: "Vault" },
  { id: "stake", label: "Stake" },
  { id: "board", label: "Board" },
  { id: "blog", label: "Notes" },
];

const DESK: { id: Page; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "rewards", label: "Rewards" },
  { id: "markets", label: "Markets" },
  { id: "portfolio", label: "Portfolio" },
  { id: "chain", label: "Chain" },
];

export function Header() {
  const store = useStore();
  const [street, setStreet] = useState(false);
  const [desk, setDesk] = useState(false);
  const [menu, setMenu] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const streetRef = useRef<HTMLDivElement>(null);
  const deskRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const walletRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!streetRef.current?.contains(target)) setStreet(false);
      if (!deskRef.current?.contains(target)) setDesk(false);
      if (!menuRef.current?.contains(target)) setMenu(false);
      if (!walletRef.current?.contains(target)) setWalletOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    return () => window.removeEventListener("mousedown", onPointer);
  }, []);

  const go = (id: Page) => {
    store.setPage(id);
    setDesk(false);
    setMenu(false);
    setStreet(false);
  };

  return (
    <header className="hood-bar">
      <div className="hood-pill">
        <button className="logo" type="button" onClick={() => go("home")}>
          <span className="logo-mark" aria-hidden>H</span>
          <span className="logo-words">
            <b>HOOD</b>
            <small>Desk</small>
          </span>
        </button>

        <nav className="hood-links" aria-label="Primary">
          {LINKS.map((item) => (
            <button key={item.id} className={store.page === item.id ? "on" : ""} type="button" onClick={() => go(item.id)}>
              {item.label}
            </button>
          ))}
          <div className="more-wrap" ref={streetRef}>
            <button className={street ? "street-btn on" : "street-btn"} type="button" onClick={() => setStreet((open) => !open)}>
              Street
              <Caret />
            </button>
            {street ? <StreetMenu onPick={() => setStreet(false)} /> : null}
          </div>
          <div className="more-wrap" ref={deskRef}>
            <button className={desk ? "on" : ""} type="button" onClick={() => setDesk((open) => !open)}>
              Desk
              <Caret />
            </button>
            {desk ? (
              <div className="menu">
                {DESK.map((item) => (
                  <button key={item.id} type="button" onClick={() => go(item.id)}>{item.label}</button>
                ))}
                <a href={EXPLORER} target="_blank" rel="noreferrer">Explorer</a>
                <button type="button" onClick={() => { store.resetAccount(); setDesk(false); }}>Reset paper account</button>
              </div>
            ) : null}
          </div>
        </nav>

        <div className="hood-end">
        <span className="live-chip" title="Robinhood Chain">
          <i />
          {store.chain.blockNumber ? store.chain.blockNumber.toLocaleString("en-US") : "4663"}
        </span>

        <div className="more-wrap nav-toggle-wrap" ref={menuRef}>
          <button className="nav-toggle" type="button" onClick={() => setMenu((open) => !open)}>
            Menu
          </button>
          {menu ? (
            <div className="menu hood-drawer">
              {LINKS.map((item) => (
                <button key={item.id} type="button" onClick={() => go(item.id)}>{item.label}</button>
              ))}
              {DESK.map((item) => (
                <button key={item.id} type="button" onClick={() => go(item.id)}>{item.label}</button>
              ))}
              <a href={EXPLORER} target="_blank" rel="noreferrer">Explorer</a>
            </div>
          ) : null}
        </div>

        <ShareButton />
        <div className="more-wrap" ref={walletRef}>
          {store.wallet ? (
            <button className="btn ghost" type="button" onClick={() => setWalletOpen((open) => !open)}>
              {shortAddr(store.wallet)}
            </button>
          ) : (
            <button className="btn cyan" type="button" onClick={() => void store.connect()}>
              Connect
            </button>
          )}
          {walletOpen && store.wallet ? (
            <div className="menu right">
              <div className="menu-note">{formatCompact(store.ethBalance ?? 0, false)} ETH</div>
              <a href={explorerAddress(store.wallet)} target="_blank" rel="noreferrer">View on explorer</a>
              <button type="button" onClick={() => { store.disconnect(); setWalletOpen(false); }}>Disconnect</button>
            </div>
          ) : null}
        </div>
        </div>
      </div>
    </header>
  );
}

function StreetMenu({ onPick }: { onPick: () => void }) {
  return (
    <div className="menu street-menu">
      <p>Hood Street</p>
      {PROJECTS.map((project) => (
        <a key={project.href} href={project.href} target="_blank" rel="noreferrer" onClick={onPick}>
          <span>{project.mark}</span>
          {project.name}
        </a>
      ))}
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
