const LIME = "#ccff00";
const FACE = "#1a2a14";
const WALLET = "#f4f6f0";
const W = 24;

const STAND = [
  "........................",
  "...........#............",
  "..........###...........",
  ".........#####..........",
  "........#######.........",
  ".......##@@@@@##........",
  ".......#o@@@@@o#........",
  ".......##@@@@@##........",
  "........#######.........",
  ".........#####..........",
  "........#######.........",
  ".......#########........",
  "......###########.......",
  ".....#############......",
  "....#####.....#####.....",
  "...###.........WWWWW....",
  "....##.........W===W....",
  "....##.........WWWWW....",
  "...............WWWWW....",
  ".......##....##.........",
  ".......##....##.........",
  "......###....###........",
  "......###....###........",
  "........................",
];

function slide(row: string, dx: number): string {
  if (dx === 0) return row;
  if (dx > 0) return `${".".repeat(dx)}${row.slice(0, W - dx)}`;
  return `${row.slice(-dx)}${".".repeat(-dx)}`;
}

function clearFoot(row: string, side: "left" | "right"): string {
  const chars = [...row];
  const marks = chars.flatMap((cell, index) => (cell === "#" ? [index] : []));
  if (marks.length === 0) return row;
  const start = side === "left" ? Math.min(...marks) : Math.max(...marks);
  const step = side === "left" ? 1 : -1;
  for (let index = start; index >= 0 && index < W && chars[index] === "#"; index += step) {
    chars[index] = ".";
  }
  return chars.join("");
}

function pose(bodyDx: number, handDx: number, lift: "left" | "right" | "both" | "none", blink: boolean): string[] {
  const rows = STAND.map((row, y) => {
    const dx = y >= 15 && y <= 18 ? bodyDx + handDx : bodyDx;
    const next = slide(row, dx);
    return blink ? next.replaceAll("o", "@") : next;
  });
  if (lift === "left" || lift === "both") {
    rows[21] = clearFoot(rows[21], "left");
    rows[22] = clearFoot(rows[22], "left");
  }
  if (lift === "right" || lift === "both") {
    rows[21] = clearFoot(rows[21], "right");
    rows[22] = clearFoot(rows[22], "right");
  }
  if (lift !== "both") return rows;
  const hopped = [...rows.slice(1), ".".repeat(W)];
  const tip = [...hopped[0]];
  const note = [..."....................+#.."];
  for (let index = 0; index < W; index += 1) {
    if (note[index] !== "." && tip[index] === ".") tip[index] = note[index];
  }
  hopped[0] = tip.join("");
  return hopped;
}

const FRAMES = [
  pose(-1, 2, "left", true),
  pose(0, 0, "none", false),
  pose(1, -2, "right", false),
  pose(0, 1, "both", false),
];

function fillFor(cell: string): string | null {
  if (cell === "#" || cell === "o" || cell === "+" || cell === "=") return LIME;
  if (cell === "@") return FACE;
  if (cell === "W") return WALLET;
  return null;
}

export function PixelHood({ className, label, stage }: { className?: string; label?: string; stage?: boolean }) {
  return (
    <svg
      className={className ? `pixel-hood ${className}` : "pixel-hood"}
      viewBox={`0 0 ${W} ${W}`}
      role={label ? "img" : "presentation"}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {stage ? null : <rect width={W} height={W} fill="#11180a" />}
      {FRAMES.map((frame, index) => (
        <g key={index} className={`pose pose-${index}`}>
          {frame.flatMap((row, y) =>
            [...row].flatMap((cell, x) => {
              const fill = fillFor(cell);
              if (!fill) return [];
              return [<rect key={`${index}-${x}-${y}`} x={x} y={y} width="1" height="1" fill={fill} />];
            }),
          )}
        </g>
      ))}
    </svg>
  );
}
