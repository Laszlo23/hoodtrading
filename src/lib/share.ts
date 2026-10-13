export const SITE_ORIGIN = "https://hoodtrading.aibusiness.fun";

export function joinUrl(code: string): string {
  return `${SITE_ORIGIN}/join/${encodeURIComponent(code)}`;
}

export function shareBlurb(code: string): string {
  return `HOOD Desk on Robinhood Chain. Stake HOOD, hold xHOOD. Open with ${code}.`;
}

export function xShareUrl(code: string): string {
  const text = `${shareBlurb(code)} ${joinUrl(code)}`;
  return `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
}

export function farcasterShareUrl(code: string): string {
  const params = new URLSearchParams();
  params.set("text", shareBlurb(code));
  params.append("embeds[]", joinUrl(code));
  return `https://warpcast.com/~/compose?${params.toString()}`;
}
