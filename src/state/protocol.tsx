import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  acceptReferral,
  accrue,
  canFlash,
  claimPoints,
  creditVolume,
  depositVault,
  flashPixel,
  freshLedger,
  rankedBoard,
  stakeHood,
  unstakeHood,
  wearPixel,
  withdrawVault,
  type BoardRow,
  type Ledger,
} from "../sdk/ledger";
import { useStore } from "./store";

const KEY = "hood-protocol-v1";

interface ProtocolValue {
  ledger: Ledger;
  board: BoardRow[];
  stake: (amount: number) => void;
  unstake: (xAmount: number) => void;
  deposit: (usdg: number) => void;
  withdraw: (shares: number) => void;
  claim: () => void;
  wear: (on: boolean) => void;
  flash: () => void;
  useReferral: (code: string) => void;
}

const ProtocolContext = createContext<ProtocolValue | null>(null);

function loadLedger(): Ledger {
  const fallback = freshLedger();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<Ledger>;
    if (!parsed.referral || !Number.isFinite(parsed.hood)) return fallback;
    return accrue({ ...fallback, ...parsed, lastAccrual: parsed.lastAccrual ?? Date.now() });
  } catch {
    return fallback;
  }
}

export function ProtocolProvider({ children }: { children: ReactNode }) {
  const store = useStore();
  const [ledger, setLedger] = useState<Ledger>(loadLedger);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(ledger));
  }, [ledger]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLedger((current) => accrue(current));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (!ref) return;
    setLedger((current) => acceptReferral(current, ref));
  }, []);

  useEffect(() => {
    const volume = store.account.fills
      .filter((fill) => fill.kind === "open" || fill.kind === "close")
      .reduce((sum, fill) => sum + fill.notional, 0);
    setLedger((current) => creditVolume(current, volume));
  }, [store.account.fills]);

  const value = useMemo<ProtocolValue>(() => {
    const you: BoardRow = {
      id: "you",
      name: store.wallet ? `${store.wallet.slice(0, 6)}…${store.wallet.slice(-4)}` : "You",
      stake: ledger.staked,
      vault: ledger.vaultAssets,
      volume: ledger.creditedVolume,
      points: ledger.points,
      referral: ledger.referral,
      wearing: ledger.wearing,
      you: true,
    };
    return {
      ledger,
      board: rankedBoard(you),
      stake: (amount: number) => {
        try {
          setLedger(stakeHood(ledger, amount));
          store.toast("Staked", `${amount.toLocaleString("en-US")} HOOD minted xHOOD.`, "ok");
        } catch (error) {
          store.toast("Stake", error instanceof Error ? error.message : "Stake failed", "bad");
        }
      },
      unstake: (xAmount: number) => {
        try {
          setLedger(unstakeHood(ledger, xAmount));
          store.toast("Unstaked", "xHOOD burned for HOOD at the pool rate.", "ok");
        } catch (error) {
          store.toast("Unstake", error instanceof Error ? error.message : "Unstake failed", "bad");
        }
      },
      deposit: (usdg: number) => {
        const error = store.transferUsdg(-usdg);
        if (error) {
          store.toast("Vault", error, "bad");
          return;
        }
        try {
          setLedger(depositVault(ledger, usdg));
          store.toast("Deposited", `${usdg.toLocaleString("en-US")} USDG moved into the vault.`, "ok");
        } catch (caught) {
          store.transferUsdg(usdg);
          store.toast("Vault", caught instanceof Error ? caught.message : "Deposit failed", "bad");
        }
      },
      withdraw: (shares: number) => {
        try {
          const result = withdrawVault(ledger, shares);
          const error = store.transferUsdg(result.usdg);
          if (error) {
            store.toast("Vault", error, "bad");
            return;
          }
          setLedger(result.ledger);
          store.toast("Withdrawn", "Vault shares burned for USDG.", "ok");
        } catch (caught) {
          store.toast("Vault", caught instanceof Error ? caught.message : "Withdraw failed", "bad");
        }
      },
      claim: () => {
        try {
          setLedger(claimPoints(ledger));
          store.toast("Rewards claimed", "Points converted into HOOD.", "ok");
        } catch (error) {
          store.toast("Rewards", error instanceof Error ? error.message : "Claim failed", "bad");
        }
      },
      wear: (on: boolean) => {
        setLedger(wearPixel(ledger, on));
        store.toast(on ? "Pixel on" : "Pixel off", on ? "The hood is on your desk." : "The plain mark is back.", "ok");
      },
      flash: () => {
        if (!canFlash(ledger)) {
          store.toast("Flash", ledger.wearing ? "Already flashed today." : "Wear the pixel first.", "info");
          return;
        }
        try {
          setLedger(flashPixel(ledger));
          store.toast("Flashed", "25 points landed on the desk.", "ok");
        } catch (error) {
          store.toast("Flash", error instanceof Error ? error.message : "Flash failed", "bad");
        }
      },
      useReferral: (code: string) => {
        const next = acceptReferral(ledger, code);
        if (next === ledger) {
          store.toast("Referral", "That code is already on this account.", "info");
          return;
        }
        setLedger(next);
        store.toast("Referral", `${code.toUpperCase()} credited.`, "ok");
      },
    };
  }, [ledger, store]);

  return <ProtocolContext.Provider value={value}>{children}</ProtocolContext.Provider>;
}

export function useProtocol(): ProtocolValue {
  const ctx = useContext(ProtocolContext);
  if (!ctx) throw new Error("Protocol missing");
  return ctx;
}
