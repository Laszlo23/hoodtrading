export function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export function priceDigits(price: number): number {
  const abs = Math.abs(price);
  if (abs >= 1000) return 1;
  if (abs >= 100) return 2;
  if (abs >= 1) return 3;
  if (abs >= 0.01) return 4;
  if (abs >= 0.0001) return 6;
  return 8;
}

export function formatPrice(price: number): string {
  if (!Number.isFinite(price)) return "—";
  const digits = priceDigits(price);
  return price.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatUsd(price: number, digits?: number): string {
  if (!Number.isFinite(price)) return "—";
  const d = digits ?? priceDigits(price);
  return price.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}

export function formatCompact(n: number, withDollar = true): string {
  if (!Number.isFinite(n)) return "—";
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  const prefix = withDollar ? "$" : "";
  if (abs >= 1_000_000_000) return `${sign}${prefix}${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${sign}${prefix}${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 10_000) return `${sign}${prefix}${(abs / 1_000).toFixed(2)}K`;
  if (abs >= 1000) return `${sign}${prefix}${abs.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  return `${sign}${prefix}${abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatQty(qty: number): string {
  if (!Number.isFinite(qty)) return "—";
  const abs = Math.abs(qty);
  if (abs >= 1_000_000) return `${(qty / 1_000_000).toFixed(2)}M`;
  if (abs >= 10_000) return `${(qty / 1_000).toFixed(2)}K`;
  if (abs >= 100) return qty.toFixed(2);
  if (abs >= 1) return qty.toFixed(4);
  if (abs >= 0.0001) return qty.toFixed(6);
  return qty.toPrecision(3);
}

export function formatPct(pct: number, digits = 2): string {
  if (!Number.isFinite(pct)) return "—";
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(digits)}%`;
}

export function formatFunding(rate: number): string {
  return `${rate.toFixed(7)}%`;
}

export function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function formatClock(ts = Date.now()): string {
  return formatTime(ts);
}

export function fundingCountdown(ts = Date.now()): string {
  const hour = 60 * 60 * 1000;
  const ms = Math.ceil(ts / hour) * hour - ts;
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function shortAddr(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function formatSignedUsd(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${formatUsd(Math.abs(n), 2)}`;
}

export function groupingsFor(price: number): number[] {
  if (price >= 500) return [0.1, 1, 5];
  if (price >= 50) return [0.01, 0.1, 1];
  if (price >= 1) return [0.001, 0.01, 0.1];
  if (price >= 0.01) return [0.0001, 0.001, 0.01];
  const tick = price * 0.001;
  return [tick, tick * 10, tick * 100];
}
