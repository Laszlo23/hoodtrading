import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
  stake: (amount: number) => boolean;
  unstake: (xAmount: number) => boolean;
  deposit: (usdg: number) => boolean;
  withdraw: (shares: number) => boolean;
  claim: () => boolean;
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
  const ledgerRef = useRef(ledger);
  ledgerRef.current = ledger;

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(ledger));
  }, [ledger]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLedger((current) => {
        const next = accrue(current);
        ledgerRef.current = next;
        return next;
      });
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

  const commit = (apply: (current: Ledger) => Ledger): boolean => {
    let preview: Ledger;
    try {
      preview = apply(ledgerRef.current);
    } catch (error) {
      store.toast("Desk", error instanceof Error ? error.message : "Could not update the desk", "bad");
      return false;
    }
    ledgerRef.current = preview;
    setLedger((current) => {
      try {
        const next = apply(current);
        ledgerRef.current = next;
        return next;
      } catch {
        ledgerRef.current = current;
        return current;
      }
    });
    return true;
  };

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
        const ok = commit((current) => stakeHood(current, amount));
        if (ok) store.toast("Staked", `${amount.toLocaleString("en-US")} HOOD minted xHOOD.`, "ok");
        return ok;
      },
      unstake: (xAmount: number) => {
        const ok = commit((current) => unstakeHood(current, xAmount));
        if (ok) store.toast("Unstaked", "xHOOD burned for HOOD at the pool rate.", "ok");
        return ok;
      },
      deposit: (usdg: number) => {
        const error = store.transferUsdg(-usdg);
        if (error) {
          store.toast("Vault", error, "bad");
          return false;
        }
        try {
          depositVault(ledgerRef.current, usdg);
        } catch (caught) {
          store.transferUsdg(usdg);
          store.toast("Vault", caught instanceof Error ? caught.message : "Deposit failed", "bad");
          return false;
        }
        ledgerRef.current = depositVault(ledgerRef.current, usdg);
        let refunded = false;
        setLedger((current) => {
          try {
            const next = depositVault(current, usdg);
            ledgerRef.current = next;
            return next;
          } catch {
            ledgerRef.current = current;
            if (!refunded) {
              refunded = true;
              store.transferUsdg(usdg);
            }
            return current;
          }
        });
        store.toast("Deposited", `${usdg.toLocaleString("en-US")} USDG moved into the vault.`, "ok");
        return true;
      },
      withdraw: (shares: number) => {
        let usdg = 0;
        try {
          usdg = withdrawVault(ledgerRef.current, shares).usdg;
        } catch (caught) {
          store.toast("Vault", caught instanceof Error ? caught.message : "Withdraw failed", "bad");
          return false;
        }
        const error = store.transferUsdg(usdg);
        if (error) {
          store.toast("Vault", error, "bad");
          return false;
        }
        ledgerRef.current = withdrawVault(ledgerRef.current, shares).ledger;
        let returned = false;
        setLedger((current) => {
          try {
            const next = withdrawVault(current, shares);
            ledgerRef.current = next.ledger;
            return next.ledger;
          } catch {
            ledgerRef.current = current;
            if (!returned) {
              returned = true;
              store.transferUsdg(-usdg);
            }
            return current;
          }
        });
        store.toast("Withdrawn", "Vault shares burned for USDG.", "ok");
        return true;
      },
      claim: () => {
        const ok = commit((current) => claimPoints(current));
        if (ok) store.toast("Rewards claimed", "Points converted into HOOD.", "ok");
        return ok;
      },
      wear: (on: boolean) => {
        const ok = commit((current) => wearPixel(current, on));
        if (ok) store.toast(on ? "Pixel on" : "Pixel off", on ? "The hood is on your desk." : "The plain mark is back.", "ok");
      },
      flash: () => {
        if (!canFlash(ledgerRef.current)) {
          store.toast("Flash", ledgerRef.current.wearing ? "Already flashed today." : "Wear the pixel first.", "info");
          return;
        }
        const ok = commit((current) => flashPixel(current));
        if (ok) store.toast("Flashed", "25 points landed on the desk.", "ok");
      },
      useReferral: (code: string) => {
        const current = ledgerRef.current;
        const next = acceptReferral(current, code);
        if (next === current) {
          store.toast("Referral", "That code is already on this account.", "info");
          return;
        }
        ledgerRef.current = next;
        setLedger((latest) => {
          const applied = acceptReferral(latest, code);
          ledgerRef.current = applied;
          return applied;
        });
        store.toast("Referral", `${code.trim().toUpperCase()} credited.`, "ok");
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
