export interface Subdomain {
  host: string;
  name: string;
  line: string;
}

/** Live hosts from the Caddy sites on aibusiness.fun. */
export const SUBDOMAINS: Subdomain[] = [
  {
    host: "aibusiness.fun",
    name: "Aura OS",
    line: "The root. Own a company. Let AI make money.",
  },
  {
    host: "doghood.aibusiness.fun",
    name: "Night Ledger",
    line: "The member’s book. $HOOD, one pool, Hood Street.",
  },
  {
    host: "hoodtrading.aibusiness.fun",
    name: "HOOD Desk",
    line: "Stake HOOD, hold xHOOD. Perps and the USDG vault.",
  },
  {
    host: "dex.aibusiness.fun",
    name: "Dex",
    line: "Swaps and NFTs on Robinhood Chain.",
  },
  {
    host: "nft.aibusiness.fun",
    name: "Tickpix",
    line: "Public pixel mint. Seats on the chain.",
  },
  {
    host: "gm.aibusiness.fun",
    name: "Robin GM",
    line: "On-chain GM streaks and the leaderboard.",
  },
  {
    host: "mine.aibusiness.fun",
    name: "HOOD//MINE",
    line: "A field on the chain. Three free cuts.",
  },
  {
    host: "founder.aibusiness.fun",
    name: "Founder",
    line: "Laszlo Bihary. Culture Chronicle.",
  },
  {
    host: "review.aibusiness.fun",
    name: "Aura Local",
    line: "Review requests after real visits.",
  },
];
