import { useEffect, useState } from "react";
import { FIRST_STEPS, INTRO, type IntroGo } from "../data/intro";
import { takeChapter } from "../state/chapter";
import { useStore } from "../state/store";

export function IntroPage() {
  const store = useStore();
  const [start] = useState(takeChapter);

  useEffect(() => {
    if (!start) return;
    document.getElementById(start)?.scrollIntoView({ block: "start" });
  }, [start]);

  const show = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="page intro">
      <nav className="intro-nav" aria-label="The story">
        {INTRO.map((beat) => (
          <button key={beat.id} type="button" onClick={() => show(beat.id)}>
            <span>{beat.numeral}</span>
            {beat.kicker}
          </button>
        ))}
      </nav>
      <div>
        <p className="kicker">aibusiness.fun</p>
        <h1 className="page-title">The night, then the desk.</h1>
        <p className="lede">
          aibusiness.fun is the domain. Aura OS is the company at the root. HOOD Desk is the exchange on this subdomain. The story below is the whole night, in order.
        </p>
        {INTRO.map((beat) => (
          <article key={beat.id} id={beat.id} className="beat">
            <p className="kicker">{beat.numeral} · {beat.kicker}</p>
            <h2>{beat.title}</h2>
            <div className={beat.image ? "beat-grid" : "beat-copy"}>
              <div>
                {beat.body.map((paragraph) => <p key={paragraph.slice(0, 32)}>{paragraph}</p>)}
                {beat.id === "first" ? (
                  <ol className="steps">
                    {FIRST_STEPS.map((step) => (
                      <li key={step.n}>
                        <span>{step.n}</span>
                        <div>
                          <b>{step.title}</b>
                          <p>{step.line}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : null}
                <div className="door-row">
                  {beat.doors.map((door, index) => (
                    <Door key={door.label} door={door} primary={index === 0} show={show} />
                  ))}
                </div>
              </div>
              {beat.image ? <img src={beat.image.src} alt={beat.image.alt} /> : null}
            </div>
          </article>
        ))}
        <button className="text-btn" type="button" onClick={() => store.setPage("home")}>Back to the desk</button>
      </div>
    </div>
  );
}

function Door({ door, primary, show }: { door: IntroGo; primary: boolean; show: (id: string) => void }) {
  const store = useStore();
  const className = primary ? "btn cyan" : "btn ghost";

  switch (door.kind) {
    case "page":
      return (
        <button className={className} type="button" onClick={() => store.setPage(door.page)}>
          {door.label}
        </button>
      );
    case "href":
      return (
        <a className={className} href={door.href} target="_blank" rel="noreferrer">
          {door.label}
        </a>
      );
    case "chapter":
      return (
        <button className={className} type="button" onClick={() => show(door.id)}>
          {door.label}
        </button>
      );
    default: {
      const unreachable: never = door;
      return unreachable;
    }
  }
}
