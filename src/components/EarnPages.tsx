import { useState } from "react";
import { formatUsd } from "../lib/format";
import { STAKE_APR, publicConfig } from "../sdk/config";
import { useProtocol } from "../state/protocol";

export function StakePage() {
  const { ledger, stake, unstake } = useProtocol();
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<"stake" | "unstake">("stake");
  const parsed = Number(amount);
  const valid = Number.isFinite(parsed) && parsed > 0;
  const receive = mode === "stake" ? (valid ? parsed / ledger.rate : 0) : valid ? parsed * ledger.rate : 0;
  const rewards = Math.max(0, ledger.staked - ledger.principal);

  return (
    <div className="page earn">
      <div className="earn-copy">
        <p className="kicker">Staking</p>
        <h1>HOOD in. xHOOD out.</h1>
        <p>
          The pool mints xHOOD at the live rate. Rewards are not a second token. They stay in the pool,
          so each xHOOD claims more HOOD. APR is {(STAKE_APR * 100).toFixed(1)}%.
        </p>
        <div className="dash">
          <article><span>Rate</span><b>{ledger.rate.toFixed(4)}</b><small>HOOD per xHOOD</small></article>
          <article><span>Your HOOD</span><b>{ledger.hood.toLocaleString("en-US", { maximumFractionDigits: 2 })}</b></article>
          <article><span>Your xHOOD</span><b>{ledger.xHood.toLocaleString("en-US", { maximumFractionDigits: 4 })}</b></article>
          <article><span>Rewards in pool</span><b className="up">{rewards.toLocaleString("en-US", { maximumFractionDigits: 4 })}</b></article>
        </div>
      </div>
      <form
        className="earn-card"
        onSubmit={(event) => {
          event.preventDefault();
          if (!valid) return;
          if (mode === "stake") stake(parsed);
          else unstake(parsed);
          setAmount("");
        }}
      >
        <div className="sides">
          <button className={mode === "stake" ? "buy on" : "buy"} type="button" onClick={() => setMode("stake")}>Stake</button>
          <button className={mode === "unstake" ? "sell on" : "sell"} type="button" onClick={() => setMode("unstake")}>Unstake</button>
        </div>
        <label className="field">
          <span>{mode === "stake" ? "HOOD" : "xHOOD"}</span>
          <input inputMode="decimal" value={amount} placeholder="0.00" onChange={(event) => setAmount(event.target.value)} />
        </label>
        <div className="avail">
          <span>You receive</span>
          <b>{receive.toLocaleString("en-US", { maximumFractionDigits: 4 })} {mode === "stake" ? "xHOOD" : "HOOD"}</b>
        </div>
        <button className="submit buy" type="submit">{mode === "stake" ? "Stake HOOD" : "Unstake xHOOD"}</button>
        <p className="fine">
          {publicConfig.staking
            ? `On-chain staking is configured at ${publicConfig.staking}.`
            : "The Hood SDK settles this pool in the desk ledger until VITE_STAKING_ADDRESS is set. The API key never reaches the browser."}
        </p>
      </form>
    </div>
  );
}

export function VaultPage() {
  const { ledger, deposit, withdraw } = useProtocol();
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");
  const parsed = Number(amount);
  const valid = Number.isFinite(parsed) && parsed > 0;
  const preview = mode === "deposit"
    ? valid ? parsed / ledger.vaultRate : 0
    : valid ? parsed * ledger.vaultRate : 0;
  const yieldEarned = Math.max(0, ledger.vaultAssets - ledger.vaultPrincipal);

  return (
    <div className="page earn">
      <div className="earn-copy">
        <p className="kicker">Vault</p>
        <h1>USDG shares.</h1>
        <p>
          A deposit leaves your perps balance and becomes vault shares. The share price accrues on its own,
          apart from open positions.
        </p>
        <div className="dash">
          <article><span>Share price</span><b>{formatUsd(ledger.vaultRate, 4)}</b></article>
          <article><span>Your shares</span><b>{ledger.vaultShares.toLocaleString("en-US", { maximumFractionDigits: 4 })}</b></article>
          <article><span>Claim</span><b>{formatUsd(ledger.vaultAssets, 2)}</b></article>
          <article><span>Accrued</span><b className="up">{formatUsd(yieldEarned, 2)}</b></article>
        </div>
      </div>
      <form
        className="earn-card"
        onSubmit={(event) => {
          event.preventDefault();
          if (!valid) return;
          if (mode === "deposit") deposit(parsed);
          else withdraw(parsed);
          setAmount("");
        }}
      >
        <div className="sides">
          <button className={mode === "deposit" ? "buy on" : "buy"} type="button" onClick={() => setMode("deposit")}>Deposit</button>
          <button className={mode === "withdraw" ? "sell on" : "sell"} type="button" onClick={() => setMode("withdraw")}>Withdraw</button>
        </div>
        <label className="field">
          <span>{mode === "deposit" ? "USDG" : "Shares"}</span>
          <input inputMode="decimal" value={amount} placeholder="0.00" onChange={(event) => setAmount(event.target.value)} />
        </label>
        <div className="avail">
          <span>{mode === "deposit" ? "Shares minted" : "USDG out"}</span>
          <b>{mode === "deposit" ? preview.toLocaleString("en-US", { maximumFractionDigits: 4 }) : formatUsd(preview, 2)}</b>
        </div>
        <button className="submit buy" type="submit">{mode === "deposit" ? "Deposit USDG" : "Withdraw shares"}</button>
        <p className="fine">
          {publicConfig.vault
            ? `Vault contract ${publicConfig.vault}.`
            : "Share accounting runs through the SDK ledger until VITE_VAULT_ADDRESS is set."}
        </p>
      </form>
    </div>
  );
}
