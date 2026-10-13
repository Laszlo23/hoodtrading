export interface Post {
  slug: string;
  title: string;
  kicker: string;
  date: string;
  excerpt: string;
  referral: string;
  body: string[];
}

export const POSTS: Post[] = [
  {
    slug: "xhood-receipt",
    title: "Stake HOOD, hold xHOOD",
    kicker: "Staking",
    date: "13 Oct 2026",
    excerpt: "xHOOD is the receipt. Rewards stay in the pool, so one xHOOD claims more HOOD as the rate climbs.",
    referral: "XHOOD",
    body: [
      "HOOD locked in staking is not a wrapped balance you have to claim by hand. The pool mints xHOOD at the current exchange rate, and emissions stay inside the pool.",
      "If the rate is 1.00, 100 HOOD mints 100 xHOOD. After rewards accrue, that same 100 xHOOD unwraps to more than 100 HOOD. Unstaking burns the receipt and returns the claim.",
      "The desk agent can quote the live rate. The SDK reads it the same way the stake page does, and an on-chain staking address takes over the moment VITE_STAKING_ADDRESS is set.",
    ],
  },
  {
    slug: "usdg-vault",
    title: "The USDG vault",
    kicker: "Vault",
    date: "12 Oct 2026",
    excerpt: "Trading margin and vault deposits are separate. Shares accrue the vault APR without touching open perps.",
    referral: "VAULT",
    body: [
      "USDG in the vault is not free margin. A deposit moves it out of the perps balance and into shares. The share price rises with the vault APR.",
      "Withdrawing burns shares and returns the USDG they claim, including accrual since you entered. Open positions keep their own margin.",
      "Use referral VAULT when you write up a vault integration. The board credits the code on the rewards page.",
    ],
  },
  {
    slug: "north-vault",
    title: "Project: North vault",
    kicker: "Builders",
    date: "11 Oct 2026",
    excerpt: "North routes idle USDG into the HOOD vault and publishes a weekly share-price note. Their code is NORTH.",
    referral: "NORTH",
    body: [
      "North is a builder desk on the board. They deposit USDG, publish the share price, and send readers here with the NORTH code.",
      "A referral does not change the xHOOD rate. It adds points for the desk that shared the link and for the account that arrives with it.",
      "If you ship a project on the desk, send the note and a code. Posts on this blog are how the board finds new lanes.",
    ],
  },
  {
    slug: "tape-desk",
    title: "Project: Tape desk",
    kicker: "Builders",
    date: "9 Oct 2026",
    excerpt: "Tape watches tokenized-stock perps and stakes the HOOD it earns. Referral code TAPE.",
    referral: "TAPE",
    body: [
      "Tape trades the stock perps and stakes HOOD on the side, so their board row shows both volume and xHOOD.",
      "Their write-ups use the TAPE code. Open the desk with that referral and the points land on both accounts.",
      "The agent can explain a fill, a funding rate, or the difference between vault shares and xHOOD if you paste a question from one of their notes.",
    ],
  },
];
