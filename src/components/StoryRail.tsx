import { STORY } from "../data/story";

export function StoryRail({ compact = false, onOpen }: { compact?: boolean; onOpen?: (id: string) => void }) {
  return (
    <section className={compact ? "story-rail compact" : "story-rail"} aria-label="The story">
      {compact ? null : <p className="kicker">The story</p>}
      <div>
        {STORY.map((frame, index) => {
          const body = (
            <>
              <img src={frame.src} alt={frame.title} />
              <span>{String(index + 1).padStart(2, "0")}</span>
              <b>{frame.title}</b>
              {compact ? null : <small>{frame.line}</small>}
            </>
          );
          if (onOpen) {
            return (
              <button key={frame.id} type="button" onClick={() => onOpen(frame.id)}>
                {body}
              </button>
            );
          }
          return (
            <a key={frame.id} href={frame.href} target="_blank" rel="noreferrer">
              {body}
            </a>
          );
        })}
      </div>
    </section>
  );
}
