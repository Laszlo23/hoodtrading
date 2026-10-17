import { PROJECTS } from "../data/projects";
import { useStore } from "../state/store";
import type { Page } from "../types";

const DESK: { id: Page; label: string }[] = [
  { id: "intro", label: "Start" },
  { id: "perps", label: "Trade" },
  { id: "stake", label: "Stake" },
  { id: "vault", label: "Vault" },
  { id: "network", label: "Network" },
  { id: "rewards", label: "Rewards" },
  { id: "board", label: "Board" },
  { id: "blog", label: "Notes" },
];

export function Footer({ compact = false }: { compact?: boolean }) {
  const store = useStore();

  if (compact) {
    return (
      <footer className="street-strip">
        <span>HOOD Desk</span>
        <a className="here" href="#desk" onClick={(event) => { event.preventDefault(); store.setPage("home"); }}>Desk</a>
        {PROJECTS.map((project) => (
          <a key={project.href} href={project.href} target="_blank" rel="noreferrer">{shortName(project.name)}</a>
        ))}
        <span className="strip-chain">Robinhood Chain · 4663</span>
      </footer>
    );
  }

  return (
    <footer className="street-foot">
      <div className="street-foot-top">
        <div>
          <p className="kicker">Hood Street</p>
          <h2>HOOD Desk</h2>
          <p className="lede">The exchange on the same night. Night Ledger keeps the coin. DogiHood keeps the dogs. This page keeps the book.</p>
        </div>
        <nav aria-label="The desk">
          <p className="kicker">The desk</p>
          {DESK.map((item) => (
            <button key={item.id} type="button" onClick={() => store.setPage(item.id)}>{item.label}</button>
          ))}
        </nav>
        <nav aria-label="The street">
          <p className="kicker">The street</p>
          {PROJECTS.slice(0, 5).map((project) => (
            <a key={project.href} href={project.href} target="_blank" rel="noreferrer">{project.name}</a>
          ))}
        </nav>
        <nav aria-label="Find the street">
          <p className="kicker">Find us</p>
          <a href="https://discord.gg/hoodstreet" target="_blank" rel="noreferrer">Discord</a>
          <a href="https://x.com/bihary41418" target="_blank" rel="noreferrer">X</a>
          <a href="https://doghood.aibusiness.fun/" target="_blank" rel="noreferrer">Night Ledger</a>
          <a href="https://dogihood.com/" target="_blank" rel="noreferrer">DogiHood</a>
          <a href="https://github.com/Laszlo23/hood-desk" target="_blank" rel="noreferrer">GitHub</a>
        </nav>
      </div>
      <div className="street-games" aria-label="The street">
        <button className="here" type="button" onClick={() => store.setPage("home")}>Desk</button>
        {PROJECTS.map((project) => (
          <a key={project.href} href={project.href} target="_blank" rel="noreferrer">
            {shortName(project.name)}
          </a>
        ))}
        <span>Robinhood Chain · 4663</span>
      </div>
    </footer>
  );
}

function shortName(name: string): string {
  if (name === "Night Ledger") return "Book";
  if (name === "DogiHood") return "Dogs";
  if (name === "Hood Street") return "Street";
  if (name === "Greeting") return "GM";
  return name;
}
