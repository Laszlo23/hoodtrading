import { STORY } from "../data/story";

export function StoryRail({ compact = false }: { compact?: boolean }) {
  return (
    <section className={compact ? "story-rail compact" : "story-rail"} aria-label="The story">
      {compact ? null : <p className="kicker">The story</p>}
      <div>
        {STORY.map((frame, index) => (
          <a key={frame.title} href={frame.href} target="_blank" rel="noreferrer">
            <img src={frame.src} alt={frame.title} />
            <span>{String(index + 1).padStart(2, "0")}</span>
            <b>{frame.title}</b>
            {compact ? null : <small>{frame.line}</small>}
          </a>
        ))}
      </div>
    </section>
  );
}
