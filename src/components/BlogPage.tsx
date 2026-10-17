import { useState } from "react";
import { POSTS } from "../data/blog";
import { Projects } from "./Projects";
import { takeNote } from "../state/note";
import { useProtocol } from "../state/protocol";
import { useStore } from "../state/store";

export function BlogPage() {
  const store = useStore();
  const { useReferral } = useProtocol();
  const [slug, setSlug] = useState(takeNote);
  const post = POSTS.find((item) => item.slug === slug) ?? null;

  if (post) {
    return (
      <article className="page blog-read">
        <button className="text-btn" type="button" onClick={() => setSlug(null)}>All posts</button>
        <p className="kicker">{post.kicker} · {post.date}</p>
        <h1 className="page-title">{post.title}</h1>
        {post.body.map((paragraph) => <p key={paragraph.slice(0, 24)} className="lede">{paragraph}</p>)}
        {post.links && post.links.length > 0 ? (
          <div className="note-links">
            {post.links.map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label}</a>
            ))}
          </div>
        ) : null}
        <div className="reward-row">
          <button className="btn cyan" type="button" onClick={() => useReferral(post.referral)}>
            Use {post.referral}
          </button>
          <button className="btn ghost" type="button" onClick={() => store.setPage("stake")}>Stake HOOD</button>
        </div>
      </article>
    );
  }

  return (
    <div className="page">
      <p className="kicker">Blog</p>
      <h1 className="page-title">Notes from the desk.</h1>
      <p className="lede">Project posts carry a referral code. Apply it and the points land on your rewards balance.</p>
      <div className="post-grid">
        {POSTS.map((item) => (
          <button key={item.slug} type="button" className="post-card" onClick={() => setSlug(item.slug)}>
            <span>{item.kicker} · {item.date}</span>
            <b>{item.title}</b>
            <p>{item.excerpt}</p>
            <em>Ref {item.referral}</em>
          </button>
        ))}
      </div>
      <Projects />
    </div>
  );
}
