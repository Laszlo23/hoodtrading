import { MINTS, MINT_LEAD, type MintState } from "../data/mints";

function mark(state: MintState): string {
  switch (state) {
    case "open":
      return "Open";
    case "member":
      return "Membership";
    case "closed":
      return "Closed";
    case "tape":
      return "The rest";
    default: {
      const unreachable: never = state;
      return unreachable;
    }
  }
}

function fill(taken: number, supply: number): string {
  if (supply <= 0) return "0%";
  return `${Math.max(0.4, (taken / supply) * 100).toFixed(1)}%`;
}

export function MintBoard() {
  const lead = MINT_LEAD;
  return (
    <section className="mint-block" aria-label="Minting">
      <header>
        <div>
          <p className="kicker">Minting</p>
          <h2>What is on.</h2>
        </div>
        <a href={lead.href} target="_blank" rel="noreferrer">Take a seat</a>
      </header>
      <a className="mint-lead" href={lead.href} target="_blank" rel="noreferrer">
        <span>{mark(lead.state)}</span>
        <b>{lead.name}</b>
        <strong>{lead.count}</strong>
        {lead.taken !== undefined && lead.supply !== undefined ? (
          <i className="mint-bar" aria-hidden="true"><em style={{ width: fill(lead.taken, lead.supply) }} /></i>
        ) : null}
        <p>{lead.price}. {lead.line}</p>
        <small>{lead.action}</small>
      </a>
      <div className="keys mints">
        {MINTS.map((drop) => (
          <a key={drop.id} className="key-card" href={drop.href} target="_blank" rel="noreferrer">
            <span>{mark(drop.state)}</span>
            <b>{drop.name}</b>
            <strong>{drop.count}<small>{drop.price}</small></strong>
            {drop.taken !== undefined && drop.supply !== undefined ? (
              <i className="mint-bar" aria-hidden="true"><em style={{ width: fill(drop.taken, drop.supply) }} /></i>
            ) : null}
            <small>{drop.line}</small>
          </a>
        ))}
      </div>
      <p className="fine">Tickpix count is the mint page’s own figure from this sitting, 18 of 4,663. The scanner is where the other cards live.</p>
    </section>
  );
}
