function hue(symbol: string): number {
  let hash = 0;
  for (let i = 0; i < symbol.length; i += 1) hash = (hash * 33 + symbol.charCodeAt(i)) >>> 0;
  return hash % 360;
}

export function Mark({ symbol }: { symbol: string }) {
  if (symbol === "ETH") {
    return (
      <span className="mark eth" aria-hidden>
        <svg viewBox="0 0 16 16">
          <path d="M8 1.5 12.5 8 8 10.4 3.5 8 8 1.5Z" />
          <path d="M8 11.2 12.5 8.8 8 14.5 3.5 8.8 8 11.2Z" opacity="0.7" />
        </svg>
      </span>
    );
  }
  const color = hue(symbol);
  return (
    <span
      className="mark"
      style={{ background: `linear-gradient(160deg, hsl(${color} 62% 58%), hsl(${(color + 36) % 360} 55% 32%))` }}
      aria-hidden
    >
      {symbol.slice(0, 1)}
    </span>
  );
}
