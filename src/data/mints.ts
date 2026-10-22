export type MintState = "open" | "member" | "closed" | "tape";

export interface MintDrop {
  id: string;
  state: MintState;
  name: string;
  count: string;
  price: string;
  line: string;
  href: string;
  action: string;
  taken?: number;
  supply?: number;
}

export const MINT_LEAD: MintDrop = {
  id: "tickpix",
  state: "open",
  name: "Tickpix",
  count: "18 / 4,663",
  price: "0.0001 ETH",
  line: "Public mint is on. Five seats a wallet. The ticker on the pixel is a personality, not a stock. You can lose the ETH you spend on the mint and on gas.",
  href: "https://nft.aibusiness.fun/",
  action: "Take a seat",
  taken: 18,
  supply: 4663,
};

export const MINTS: MintDrop[] = [
  {
    id: "ccff00",
    state: "member",
    name: "CCFF00",
    count: "10,000 squares",
    price: "Proof of Neon",
    line: "HoodStreet membership. Each square is an ERC-721 with its own wallet. Open it on their page, and match the contract there.",
    href: "https://hoodstreet.capital",
    action: "Open CCFF00",
  },
  {
    id: "dogs",
    state: "closed",
    name: "DogiHood",
    count: "5,000 / 5,000",
    price: "Mint closed",
    line: "The official pixel doges. The mint is finished. The dogs live at dogihood.com.",
    href: "https://dogihood.com/",
    action: "See the dogs",
    taken: 5000,
    supply: 5000,
  },
  {
    id: "tape",
    state: "tape",
    name: "The scanner",
    count: "Robinhood Chain",
    price: "One check free",
    line: "Stray Cucks reads which lists a wallet is on. Alerts need a Stray Cuck or a CCFF00 square. A card there is not this street.",
    href: "https://allowlist.straycucks.com/",
    action: "Read the tape",
  },
];
