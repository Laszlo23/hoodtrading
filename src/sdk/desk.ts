export interface AgentContext {
  rate: number;
  vaultRate: number;
  stakeApr: number;
  vaultApr: number;
  hood: number;
  xHood: number;
  vaultUsdg: number;
  points: number;
  equity: number;
  referral: string;
  page: string;
}

export function deskReply(message: string, ctx: AgentContext): string {
  const q = message.toLowerCase();
  if (q.includes("xhood") || q.includes("stake") || q.includes("hood token")) {
    return `Stake HOOD and the pool mints xHOOD at ${ctx.rate.toFixed(4)} HOOD per xHOOD. Rewards stay in the pool, so the rate climbs at ${(ctx.stakeApr * 100).toFixed(1)}% APR instead of paying a separate token. You hold ${ctx.xHood.toFixed(4)} xHOOD. Unstaking burns xHOOD and returns the HOOD it claims.`;
  }
  if (q.includes("vault") || q.includes("usdg")) {
    return `The vault takes USDG and issues shares. One share currently claims ${ctx.vaultRate.toFixed(4)} USDG, and the share price accrues at ${(ctx.vaultApr * 100).toFixed(1)}% APR. Your vault balance is ${ctx.vaultUsdg.toFixed(2)} USDG. Free trading margin stays outside the vault.`;
  }
  if (q.includes("reward") || q.includes("point")) {
    return `You have ${ctx.points.toFixed(0)} points. Points come from staking, vault deposits, perps volume, and referrals. Claiming converts 100 points into 1 HOOD, which you can stake for more xHOOD. Your code is ${ctx.referral}.`;
  }
  if (q.includes("referr") || q.includes("blog")) {
    return `Share ${ctx.referral}. When someone opens the desk with that code, you both pick up referral points. The blog posts carry project codes too — use one from a post when you write about a build.`;
  }
  if (q.includes("leader") || q.includes("board") || q.includes("rank")) {
    return "The board ranks desks by points: stake, vault size, and perps volume. Your row updates as soon as you stake, deposit, or fill.";
  }
  if (q.includes("liquid") || q.includes("perp") || q.includes("long") || q.includes("short")) {
    return `The perps desk is cross margin in USDG. Equity is ${ctx.equity.toFixed(2)} USDG. Longs pay the funding rate when it is positive. Liquidation sits near entry times (1 − 1/leverage).`;
  }
  if (q.includes("api") || q.includes("key") || q.includes("sdk")) {
    return "The browser talks to the Hood SDK. Chain reads use viem. The agent key, if you set HOOD_API_KEY, is read only by the dev server and is never shipped to the page. Contract addresses belong in VITE_STAKING_ADDRESS and VITE_VAULT_ADDRESS.";
  }
  return `Ask me about xHOOD, the vault, rewards, or a trade. Rate is ${ctx.rate.toFixed(4)} HOOD per xHOOD, vault APR is ${(ctx.vaultApr * 100).toFixed(1)}%, and you have ${ctx.points.toFixed(0)} points.`;
}
