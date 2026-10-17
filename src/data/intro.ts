import type { Page } from "../types";
import { STORY } from "./story";

export type IntroGo =
  | { kind: "page"; page: Page; label: string }
  | { kind: "href"; href: string; label: string }
  | { kind: "chapter"; id: string; label: string };

export interface IntroBeat {
  id: string;
  numeral: string;
  kicker: string;
  title: string;
  body: string[];
  image?: { src: string; alt: string };
  doors: IntroGo[];
}

function frame(id: string): { src: string; alt: string } {
  const found = STORY.find((item) => item.id === id);
  return { src: found?.src ?? "", alt: found?.title ?? id };
}

function next(id: string, label: string): IntroGo {
  return { kind: "chapter", id, label };
}

export const INTRO: IntroBeat[] = [
  {
    id: "wood",
    numeral: "01",
    kicker: "The wood",
    title: "The forest is the name.",
    body: [
      "aibusiness.fun is the night. The root is Aura OS: you own a company, and AI employees do the work. Strategy, sales, and growth sit there.",
      "The hood lives on the names underneath. This page, hoodtrading.aibusiness.fun, is the exchange. The story from here follows the night in the order it was told: wood, coin, bow, pool, seed, book, street, pack.",
    ],
    image: frame("wood"),
    doors: [
      next("coin", "The coin"),
      { kind: "href", href: "https://aibusiness.fun/", label: "Open Aura OS" },
    ],
  },
  {
    id: "coin",
    numeral: "02",
    kicker: "The coin",
    title: "Minted once. One billion.",
    body: [
      "$HOOD was minted once. One billion. No second mint, and no tax on the mint.",
      "Night Ledger is the book anyone can read. The coin’s page is doghood.aibusiness.fun. This desk came after the coin. It does not mint another one.",
    ],
    image: frame("coin"),
    doors: [
      next("bow", "The bow"),
      { kind: "href", href: "https://doghood.aibusiness.fun/#/hood", label: "The coin" },
    ],
  },
  {
    id: "bow",
    numeral: "03",
    kicker: "The bow",
    title: "The wallet signs the swap.",
    body: [
      "The bow is the wallet. It signs the swap on the street. The desk does not place that order.",
      "On this page a connected wallet can read the chain. The perps ticket still stays in the browser until a perps contract is set.",
    ],
    image: frame("bow"),
    doors: [next("pool", "The pool")],
  },
  {
    id: "pool",
    numeral: "04",
    kicker: "The pool",
    title: "One market. The fee stays.",
    body: [
      "The pool is one market, $HOOD for WETH. Each swap pays 1%, and the fee stays in the position.",
      "There is one pool. The book writes down what the chain already did.",
    ],
    image: frame("pool"),
    doors: [next("seed", "The seed")],
  },
  {
    id: "seed",
    numeral: "05",
    kicker: "The seed",
    title: "ETH meets treasury $HOOD.",
    body: [
      "Bring ETH and the treasury meets you in the pool. 2% of that ETH goes to the cause.",
      "The seed is how the night is fed. It is not a second mint.",
    ],
    image: frame("seed"),
    doors: [next("book", "The book")],
  },
  {
    id: "book",
    numeral: "06",
    kicker: "The book",
    title: "Every swap the chain wrote.",
    body: [
      "Night Ledger is the member’s book. $HOOD, the pool, the seed, and the notes live there.",
      "Floor, on the same host, keeps names, stock, keys, members, and the journal. Read the book before you use this desk.",
    ],
    image: frame("book"),
    doors: [
      next("street", "The street"),
      { kind: "href", href: "https://doghood.aibusiness.fun/", label: "Open the book" },
    ],
  },
  {
    id: "street",
    numeral: "07",
    kicker: "The street",
    title: "Notes from Hood Street.",
    body: [
      "Hood Street is the founding membership: CCFF00, Proof of Neon. The NFT is the wallet.",
      "A mint card somewhere else that borrows the word Hood is someone else’s drop. The square on this street is the membership.",
    ],
    image: frame("street"),
    doors: [
      next("pack", "The pack"),
      { kind: "href", href: "https://doghood.aibusiness.fun/#/street", label: "Hood Street" },
    ],
  },
  {
    id: "pack",
    numeral: "08",
    kicker: "The pack",
    title: "DogiHood and CCFF00.",
    body: [
      "DogiHood is 5,000 pixel doges, the official collection. The mint is closed. They live at dogihood.com.",
      "Seeder and Inner Circle stay in the Night Ledger book. The dogs, the square, and the coin are the finished objects. The desks around them are tools.",
    ],
    image: frame("pack"),
    doors: [
      next("desk", "This desk"),
      { kind: "href", href: "https://dogihood.com/", label: "DogiHood" },
    ],
  },
  {
    id: "desk",
    numeral: "09",
    kicker: "HOOD Desk",
    title: "Then the exchange.",
    body: [
      "This page quotes live pool prints in USDG: ETH and tokenized stocks, chart and ticket on one screen. The ticket stays in this browser until a perps contract is set.",
      "Stake HOOD and the pool mints xHOOD at the live rate. Rewards stay in the pool, so one xHOOD claims more HOOD as the rate climbs. The USDG vault takes a deposit out of the trading balance, and the shares accrue on their own.",
      "Stake and the vault run on the desk ledger until their contract addresses are set. Points come from stake, vault, volume, and a code. One hundred points claim 1 HOOD on that ledger. Wear the pixel and flash it: 25 points, once each UTC day, while he is worn.",
    ],
    doors: [
      { kind: "page", page: "perps", label: "Trade" },
      { kind: "page", page: "stake", label: "Stake HOOD" },
      { kind: "page", page: "vault", label: "The vault" },
      next("first", "Your first move"),
    ],
  },
  {
    id: "first",
    numeral: "10",
    kicker: "Onboarding",
    title: "Six steps, then the desk.",
    body: [
      "The night is told. The coin, the book, the street, and the dogs are in place. This page is the tool beside them.",
    ],
    doors: [
      { kind: "page", page: "home", label: "Enter the desk" },
      { kind: "page", page: "perps", label: "Read a market" },
      { kind: "page", page: "network", label: "Every subdomain" },
      { kind: "page", page: "blog", label: "Notes" },
    ],
  },
];

export const FIRST_STEPS: { n: string; title: string; line: string }[] = [
  { n: "1", title: "Read the night", line: "Wood, coin, bow, pool, seed, book, street, pack. You just did." },
  { n: "2", title: "Wear the pixel", line: "He stands on the home page. Flash pays 25 points, once a UTC day, while he is worn." },
  { n: "3", title: "Open one market", line: "Trade shows ETH and the stock tokens from live pools. The ticket stays in this browser." },
  { n: "4", title: "Stake if you hold HOOD", line: "xHOOD is the receipt. The rate is how much HOOD one receipt claims." },
  { n: "5", title: "Walk the subdomains", line: "Root, book, this desk, then the swap, the seats, the greeting, and the field." },
  { n: "6", title: "Bring a code", line: "A note can carry a code. The desk that arrives with it picks up 50 points." },
];
