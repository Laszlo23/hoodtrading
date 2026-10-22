import { formatCompact, formatUsd } from "../lib/format";
import { useProtocol } from "../state/protocol";
import { PixelCard } from "./PixelCard";
import { PixelHood } from "./PixelHood";
import { ShareCard } from "./ShareCard";

export function RewardsPage() {
  const { ledger, claim, useReferral } = useProtocol();
  const hoodReady = Math.floor(ledger.points / 100);

  return (
    <div className="page">
      <p className="kicker">Rewards</p>
      <h1 className="page-title">Points become HOOD.</h1>
      <div className="dash">
        <article>
          <span>Points</span>
          <b>{ledger.points.toLocaleString("en-US", { maximumFractionDigits: 0 })}</b>
          <small>{hoodReady} HOOD ready</small>
        </article>
        <article>
          <span>Perps volume</span>
          <b>{formatUsd(ledger.creditedVolume, 0)}</b>
          <small>0.001 point per USDG</small>
        </article>
        <article>
          <span>Your code</span>
          <b>{ledger.referral}</b>
          <small>{ledger.referredBy ? `Joined with ${ledger.referredBy}` : "No referrer yet"}</small>
        </article>
        <article>
          <span>HOOD wallet</span>
          <b>{ledger.hood.toLocaleString("en-US", { maximumFractionDigits: 2 })}</b>
          <small>Claim adds HOOD here</small>
        </article>
      </div>
      <div className="reward-row">
        <button className="btn cyan" type="button" disabled={hoodReady < 1} onClick={claim}>
          {hoodReady < 1 ? "Need 100 points" : `Claim ${hoodReady} HOOD`}
        </button>
      </div>
      <ShareCard />
      <form
        className="ref-form"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const code = String(data.get("code") ?? "");
          useReferral(code);
          event.currentTarget.reset();
        }}
      >
        <label className="field">
          <span>Code</span>
          <input name="code" placeholder="NORTH" />
        </label>
        <button className="btn cyan" type="submit">Apply</button>
      </form>
      <p className="lede">
        Stake weight, vault deposits, filled perps, and a referral each add points. One hundred points claim one HOOD,
        which you can stake into xHOOD.
      </p>
      <PixelCard />
    </div>
  );
}

export function BoardPage() {
  const { board, ledger } = useProtocol();
  const rank = board.findIndex((row) => row.you) + 1;

  return (
    <div className="page">
      <p className="kicker">Leaderboard</p>
      <h1 className="page-title">You are #{rank || "—"}.</h1>
      <p className="lede">Project desks from the blog sit next to your account. Points are stake, vault size, and perps volume. Your code is {ledger.referral}.</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th><th>Desk</th><th>Staked HOOD</th><th>Vault</th><th>Volume</th><th>Points</th><th>Code</th>
            </tr>
          </thead>
          <tbody>
            {board.map((row, index) => (
              <tr key={row.id} className={row.you ? "you" : ""}>
                <td>{index + 1}</td>
                <td>
                  {row.you && row.wearing ? <PixelHood className="board" /> : null}
                  {row.name}
                </td>
                <td>{formatCompact(row.stake, false)}</td>
                <td>{formatCompact(row.vault)}</td>
                <td>{formatCompact(row.volume)}</td>
                <td>{row.points.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                <td>{row.referral}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
