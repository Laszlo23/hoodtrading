import { useEffect, useRef, useState } from "react";
import { farcasterShareUrl, joinUrl, xShareUrl } from "../lib/share";
import { useProtocol } from "../state/protocol";
import { useStore } from "../state/store";

export function ShareCard() {
  const { ledger } = useProtocol();
  const store = useStore();
  const url = joinUrl(ledger.referral);

  const copy = () => {
    void navigator.clipboard.writeText(url);
    store.toast("Copied", url, "ok");
  };

  return (
    <section className="share-card">
      <div>
        <p className="kicker">Bring a desk</p>
        <h2>Your code on the street.</h2>
        <p className="lede">
          Share the link. A desk that arrives with {ledger.referral} picks up 50 points.
          One hundred points claim one HOOD.
        </p>
      </div>
      <div className="share-actions">
        <code>{ledger.referral}</code>
        <button className="btn cyan" type="button" onClick={copy}>Copy link</button>
        <a className="btn ghost" href={xShareUrl(ledger.referral)} target="_blank" rel="noreferrer">Post on X</a>
        <a className="btn ghost" href={farcasterShareUrl(ledger.referral)} target="_blank" rel="noreferrer">Farcaster</a>
      </div>
      <p className="fine">{url}</p>
    </section>
  );
}

export function ShareButton() {
  const { ledger } = useProtocol();
  const store = useStore();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const url = joinUrl(ledger.referral);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!box.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    return () => window.removeEventListener("mousedown", onPointer);
  }, [open]);

  return (
    <div className="more-wrap" ref={box}>
      <button className="btn ghost" type="button" onClick={() => setOpen((value) => !value)}>Share</button>
      {open ? (
        <div className="menu right share-menu">
          <div className="menu-note">{ledger.referral}</div>
          <button type="button" onClick={() => { void navigator.clipboard.writeText(url); store.toast("Copied", url, "ok"); setOpen(false); }}>
            Copy link
          </button>
          <a href={xShareUrl(ledger.referral)} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>Post on X</a>
          <a href={farcasterShareUrl(ledger.referral)} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>Farcaster</a>
        </div>
      ) : null}
    </div>
  );
}
