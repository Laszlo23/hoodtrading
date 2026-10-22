import { SPACES, type SpaceRoom } from "../data/spaces";

function mark(state: SpaceRoom["state"]): string {
  switch (state) {
    case "live":
      return "Live";
    case "scheduled":
      return "Next";
    case "ended":
      return "Ended";
    default: {
      const unreachable: never = state;
      return unreachable;
    }
  }
}

export function SpacesTape() {
  return (
    <section className="keys-block" aria-label="HoodStreet Media">
      <header>
        <p className="kicker">HoodStreet Media</p>
        <a href="https://x.com/i/spaces/1yxBePgOWAkJN" target="_blank" rel="noreferrer">Open the live room</a>
      </header>
      <div className="keys spaces">
        {SPACES.map((room) => (
          <a key={room.id} className="key-card" href={room.href} target="_blank" rel="noreferrer">
            <span>{mark(room.state)}</span>
            <b>{room.title}</b>
            <strong>{room.when}</strong>
            <p>{room.host}</p>
            <small>{room.line}</small>
          </a>
        ))}
      </div>
    </section>
  );
}
