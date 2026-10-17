import { MARKETS } from "../data/markets";
import { POSTS } from "../data/blog";
import { formatCompact, formatPct } from "../lib/format";
import { getChange, getLast } from "../lib/series";
import { STAKE_APR, VAULT_APR } from "../sdk/config";
import { useProtocol } from "../state/protocol";
import { useStore } from "../state/store";
import { armChapter } from "../state/chapter";
import { armNote } from "../state/note";
import { Footer } from "./Footer";
import { PixelCard } from "./PixelCard";
import { Projects } from "./Projects";
import { ShareCard } from "./ShareCard";
import { StoryRail } from "./StoryRail";

function isoWeek(date: Date): number {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  return Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function Landing() {
  const store = useStore();
  const { ledger } = useProtocol();
  void store.rev;
  const tape = MARKETS.slice(0, 8);
  const week = isoWeek(new Date());
  const year = new Date().getFullYear();

  return (
    <div className="site">
      <div className="week-banner">
        <span>Week of {year} · W{week}</span>
        Stake HOOD and the pool mints xHOOD. The rate is the receipt.
      </div>

      <section className="hero-card">
        <PixelCard hero />
        <div>
          <p className="kicker">aibusiness.fun</p>
          <h1>HOOD Desk</h1>
          <p className="lede wide">
            aibusiness.fun is the night. Aura OS sits at the root: you own a company, and AI employees do the work.
            The hood lives on the subdomains. This page is the exchange.
          </p>
          <p className="fine">Night Ledger keeps the coin. DogiHood keeps the dogs. Hood Street is the membership. Start with the story, then open a desk.</p>
          <div className="live-row">
            <span><i /> Online</span>
            <span>Community desk</span>
            <span>Live</span>
          </div>
        </div>
      </section>

      <div className="hero-actions">
        <button className="btn cyan lg" type="button" onClick={() => store.setPage("intro")}>Start here</button>
        <button className="text-link" type="button" onClick={() => store.setPage("perps")}>Trade perps</button>
      </div>

      <StoryRail onOpen={(id) => { armChapter(id); store.setPage("intro"); }} />

      <section className="lanes">
        <button type="button" onClick={() => store.setPage("perps")}>
          <span>The book</span>
          <b>Perps</b>
          <p>ETH and tokenized stocks, quoted in USDG. Chart, book, and ticket on one screen.</p>
        </button>
        <button type="button" onClick={() => store.setPage("stake")}>
          <span>The receipt</span>
          <b>xHOOD</b>
          <p>Stake HOOD. The pool mints xHOOD at the live rate. Rewards stay in the pool.</p>
        </button>
        <button type="button" onClick={() => store.setPage("vault")}>
          <span>The vault</span>
          <b>USDG shares</b>
          <p>A deposit leaves the trading balance. Shares accrue {(VAULT_APR * 100).toFixed(1)}% on their own.</p>
        </button>
        <button type="button" onClick={() => store.setPage("rewards")}>
          <span>The board</span>
          <b>Points</b>
          <p>Stake, vault, volume, and a referral code. One hundred points claim one HOOD.</p>
        </button>
      </section>

      <div className="hero-actions">
        <button className="text-link" type="button" onClick={() => store.setPage("perps")}>Trade perps</button>
        <button className="text-link" type="button" onClick={() => store.setPage("stake")}>Stake HOOD</button>
        <button className="text-link" type="button" onClick={() => store.setPage("vault")}>The vault</button>
        <button className="text-link" type="button" onClick={() => store.setPage("blog")}>Notes</button>
      </div>

      <section className="status-strip">
        <header>
          <b><i /> Desk online</b>
          <button type="button" onClick={() => store.setPage("chain")}>Chain →</button>
        </header>
        <div>
          <article>
            <span>Chain</span>
            <b>RH 4663</b>
          </article>
          <article>
            <span>Block</span>
            <b>{store.chain.blockNumber?.toLocaleString("en-US") ?? "—"}</b>
          </article>
          <article>
            <span>xHOOD rate</span>
            <b>{ledger.rate.toFixed(4)}</b>
          </article>
          <article>
            <span>Stake</span>
            <b className="up">{(STAKE_APR * 100).toFixed(1)}%</b>
          </article>
          <article>
            <span>Vault</span>
            <b>{(VAULT_APR * 100).toFixed(1)}%</b>
          </article>
          <article>
            <span>USDG</span>
            <b>{formatCompact(store.chain.usdgSupply)}</b>
          </article>
        </div>
      </section>

      <div className="tape" aria-label="Markets">
        {tape.map((market) => {
          const change = getChange(market.id);
          return (
            <button key={market.id} type="button" onClick={() => store.selectMarket(market.id)}>
              <b>{market.base}</b>
              <span>{getLast(market.id).toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
              <em className={change >= 0 ? "up" : "down"}>{formatPct(change)}</em>
            </button>
          );
        })}
      </div>

      <Projects />
      <div className="hero-actions">
        <button className="btn cyan lg" type="button" onClick={() => store.setPage("network")}>All subdomains</button>
        <button className="text-link" type="button" onClick={() => store.setPage("blog")}>Notes</button>
      </div>

      <section className="site-split">
        <div>
          <p className="kicker">Notes</p>
          <h2>From the desk.</h2>
        </div>
        <div className="post-grid">
          {POSTS.slice(0, 3).map((post) => (
            <button key={post.slug} type="button" className="post-card" onClick={() => { armNote(post.slug); store.setPage("blog"); }}>
              <span>{post.kicker} · {post.date}</span>
              <b>{post.title}</b>
              <p>{post.excerpt}</p>
              <em>Ref {post.referral}</em>
            </button>
          ))}
        </div>
      </section>

      <ShareCard />
      <Footer />
    </div>
  );
}
