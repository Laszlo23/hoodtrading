import { STAKE_APR, VAULT_APR } from "./config";

const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export interface Ledger {
  hood: number;
  xHood: number;
  principal: number;
  staked: number;
  rate: number;
  vaultPrincipal: number;
  vaultAssets: number;
  vaultShares: number;
  vaultRate: number;
  points: number;
  creditedVolume: number;
  referral: string;
  referredBy: string | null;
  referralCredits: number;
  wearing: boolean;
  lastFlashDay: string | null;
  flashes: number;
  lastAccrual: number;
}

export function freshLedger(now = Date.now()): Ledger {
  return {
    hood: 2_500,
    xHood: 0,
    principal: 0,
    staked: 0,
    rate: 1,
    vaultPrincipal: 0,
    vaultAssets: 0,
    vaultShares: 0,
    vaultRate: 1,
    points: 0,
    creditedVolume: 0,
    referral: makeCode(),
    referredBy: null,
    referralCredits: 0,
    wearing: false,
    lastFlashDay: null,
    flashes: 0,
    lastAccrual: now,
  };
}

export function accrue(ledger: Ledger, now = Date.now()): Ledger {
  const dt = Math.max(0, now - ledger.lastAccrual) / YEAR_MS;
  const next: Ledger = { ...ledger, lastAccrual: now };
  if (next.staked > 0) next.staked += next.staked * STAKE_APR * dt;
  if (next.vaultAssets > 0) next.vaultAssets += next.vaultAssets * VAULT_APR * dt;
  next.rate = next.xHood > 0 ? next.staked / next.xHood : 1;
  next.vaultRate = next.vaultShares > 0 ? next.vaultAssets / next.vaultShares : 1;
  return next;
}

export function stakeHood(ledger: Ledger, amount: number, now = Date.now()): Ledger {
  const current = accrue(ledger, now);
  if (amount <= 0) throw new Error("Enter an amount");
  if (amount > current.hood + 1e-9) throw new Error("Not enough HOOD");
  const minted = amount / current.rate;
  const next: Ledger = {
    ...current,
    hood: current.hood - amount,
    principal: current.principal + amount,
    staked: current.staked + amount,
    xHood: current.xHood + minted,
    points: current.points + amount * 0.25,
  };
  next.rate = next.xHood > 0 ? next.staked / next.xHood : 1;
  return next;
}

export function unstakeHood(ledger: Ledger, xAmount: number, now = Date.now()): Ledger {
  const current = accrue(ledger, now);
  if (xAmount <= 0) throw new Error("Enter an amount");
  if (xAmount > current.xHood + 1e-9) throw new Error("Not enough xHOOD");
  const portion = Math.min(1, xAmount / current.xHood);
  const hoodOut = xAmount * current.rate;
  const next: Ledger = {
    ...current,
    hood: current.hood + hoodOut,
    xHood: current.xHood - xAmount,
    staked: Math.max(0, current.staked - hoodOut),
    principal: Math.max(0, current.principal * (1 - portion)),
  };
  next.rate = next.xHood > 0 ? next.staked / next.xHood : 1;
  return next;
}

export function depositVault(ledger: Ledger, usdg: number, now = Date.now()): Ledger {
  const current = accrue(ledger, now);
  if (usdg <= 0) throw new Error("Enter an amount");
  const shares = usdg / current.vaultRate;
  const next: Ledger = {
    ...current,
    vaultPrincipal: current.vaultPrincipal + usdg,
    vaultAssets: current.vaultAssets + usdg,
    vaultShares: current.vaultShares + shares,
    points: current.points + usdg * 0.02,
  };
  next.vaultRate = next.vaultShares > 0 ? next.vaultAssets / next.vaultShares : 1;
  return next;
}

export function withdrawVault(ledger: Ledger, shares: number, now = Date.now()): { ledger: Ledger; usdg: number } {
  const current = accrue(ledger, now);
  if (shares <= 0) throw new Error("Enter an amount");
  if (shares > current.vaultShares + 1e-9) throw new Error("Not enough vault shares");
  const portion = Math.min(1, shares / current.vaultShares);
  const usdg = shares * current.vaultRate;
  const next: Ledger = {
    ...current,
    vaultShares: current.vaultShares - shares,
    vaultAssets: Math.max(0, current.vaultAssets - usdg),
    vaultPrincipal: Math.max(0, current.vaultPrincipal * (1 - portion)),
  };
  next.vaultRate = next.vaultShares > 0 ? next.vaultAssets / next.vaultShares : 1;
  return { ledger: next, usdg };
}

export function claimPoints(ledger: Ledger, now = Date.now()): Ledger {
  const current = accrue(ledger, now);
  const hoodOut = Math.floor(current.points / 100);
  if (hoodOut <= 0) throw new Error("Need 100 points to claim 1 HOOD");
  return {
    ...current,
    hood: current.hood + hoodOut,
    points: current.points - hoodOut * 100,
  };
}

export function creditVolume(ledger: Ledger, volume: number): Ledger {
  const delta = Math.max(0, volume - ledger.creditedVolume);
  if (delta <= 0) return ledger;
  return {
    ...ledger,
    creditedVolume: volume,
    points: ledger.points + delta * 0.001,
  };
}

export const FLASH_POINTS = 25;

export function dayKey(now = Date.now()): string {
  return new Date(now).toISOString().slice(0, 10);
}

export function canFlash(ledger: Ledger, now = Date.now()): boolean {
  return ledger.wearing && ledger.lastFlashDay !== dayKey(now);
}

export function wearPixel(ledger: Ledger, wearing: boolean): Ledger {
  return { ...ledger, wearing };
}

export function flashPixel(ledger: Ledger, now = Date.now()): Ledger {
  if (!ledger.wearing) throw new Error("Wear the pixel first");
  if (ledger.lastFlashDay === dayKey(now)) throw new Error("Already flashed today");
  return {
    ...ledger,
    lastFlashDay: dayKey(now),
    flashes: ledger.flashes + 1,
    points: ledger.points + FLASH_POINTS,
  };
}

export function acceptReferral(ledger: Ledger, code: string): Ledger {
  if (!code || ledger.referredBy || code === ledger.referral) return ledger;
  return {
    ...ledger,
    referredBy: code.toUpperCase(),
    points: ledger.points + 50,
    referralCredits: ledger.referralCredits + 1,
  };
}

export interface BoardRow {
  id: string;
  name: string;
  stake: number;
  vault: number;
  volume: number;
  points: number;
  referral: string;
  wearing?: boolean;
  you?: boolean;
}

export const PROJECT_DESKS: BoardRow[] = [
  { id: "north", name: "North vault", stake: 1_240_000, vault: 4_800_000, volume: 18_400_000, points: 88_210, referral: "NORTH" },
  { id: "tape", name: "Tape desk", stake: 640_000, vault: 1_120_000, volume: 9_450_000, points: 41_880, referral: "TAPE" },
  { id: "rialto", name: "Rialto lane", stake: 220_000, vault: 860_000, volume: 3_200_000, points: 19_440, referral: "RIALTO" },
  { id: "spy", name: "SPY book", stake: 90_000, vault: 2_400_000, volume: 6_100_000, points: 15_220, referral: "SPYBK" },
];

export function rankedBoard(you: BoardRow): BoardRow[] {
  return [...PROJECT_DESKS, you].sort((a, b) => b.points - a.points);
}

function makeCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i += 1) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `HOOD-${code}`;
}
