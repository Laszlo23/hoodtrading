import { useEffect, useState } from "react";
import { canFlash, dayKey, FLASH_POINTS } from "../sdk/ledger";
import { useProtocol } from "../state/protocol";
import { PixelHood } from "./PixelHood";

function nextFlashLabel(now = Date.now()): string {
  const start = new Date(now);
  const next = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + 1);
  return new Date(next).toLocaleString("en-US", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function PixelCard({ hero = false }: { hero?: boolean }) {
  const { ledger, wear, flash } = useProtocol();
  const ready = canFlash(ledger);
  const usedToday = ledger.lastFlashDay === dayKey();
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!live) return undefined;
    const timer = window.setTimeout(() => setLive(false), 900);
    return () => window.clearTimeout(timer);
  }, [live]);

  const stageClass = `pixel-stage${live ? " live" : ""}${ledger.wearing ? " worn" : ""}`;
  const stage = (
    <div className={stageClass}>
      <PixelHood stage className={live ? "live" : undefined} label="Pixel Robinhood" />
    </div>
  );
  const actions = (
    <div className="row">
      <button className={ledger.wearing ? "btn ghost" : "btn cyan"} type="button" onClick={() => wear(!ledger.wearing)}>
        {ledger.wearing ? "Take off" : "Wear"}
      </button>
      <button
        className="btn cyan"
        type="button"
        onClick={() => {
          flash();
          if (ready) setLive(true);
        }}
        disabled={!ready}
      >
        Flash
      </button>
    </div>
  );

  if (hero) {
    return (
      <div className="hero-hood">
        {stage}
        {actions}
        {usedToday ? <p className="fine">Next flash {nextFlashLabel()}.</p> : null}
      </div>
    );
  }

  return (
    <section className="pixel-card">
      {stage}
      <div>
        <p className="kicker">The pixel</p>
        <h2>Wear it. Flash it.</h2>
        <p>
          Put the hood on the desk. A flash pays {FLASH_POINTS} points, once a day, and only while it is worn.
          One hundred points still claim 1 HOOD.
        </p>
        {actions}
        {usedToday ? <p className="fine">Next flash {nextFlashLabel()}.</p> : null}
      </div>
    </section>
  );
}
