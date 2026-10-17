const LORE = "https://doghood.aibusiness.fun/lore";

export interface StoryFrame {
  id: string;
  title: string;
  line: string;
  src: string;
  href: string;
}

export const STORY: StoryFrame[] = [
  {
    id: "wood",
    title: "The wood",
    line: "The forest is the name.",
    src: `${LORE}/hood-forest.webp`,
    href: "https://doghood.aibusiness.fun/#/lore",
  },
  {
    id: "coin",
    title: "The coin",
    line: "Minted once. One billion.",
    src: `${LORE}/hood-coin.webp`,
    href: "https://doghood.aibusiness.fun/#/hood",
  },
  {
    id: "bow",
    title: "The bow",
    line: "The wallet signs the swap.",
    src: `${LORE}/hood-bow.webp`,
    href: "https://doghood.aibusiness.fun/#/trade",
  },
  {
    id: "pool",
    title: "The pool",
    line: "One market. The fee stays.",
    src: `${LORE}/hood-pool.webp`,
    href: "https://doghood.aibusiness.fun/#/community",
  },
  {
    id: "seed",
    title: "The seed",
    line: "ETH meets treasury $HOOD.",
    src: `${LORE}/hood-seed.webp`,
    href: "https://doghood.aibusiness.fun/#/lore",
  },
  {
    id: "book",
    title: "The book",
    line: "Every swap the chain wrote.",
    src: `${LORE}/hood-council.webp`,
    href: "https://doghood.aibusiness.fun/#/rewards",
  },
  {
    id: "street",
    title: "The street",
    line: "Notes from Hood Street.",
    src: `${LORE}/hood-street.webp`,
    href: "https://doghood.aibusiness.fun/#/street",
  },
  {
    id: "pack",
    title: "The pack",
    line: "DogiHood and CCFF00.",
    src: `${LORE}/hood-seal.webp`,
    href: "https://dogihood.com/",
  },
];
