export interface PostLink {
  label: string;
  href: string;
}

export interface Post {
  slug: string;
  title: string;
  kicker: string;
  date: string;
  excerpt: string;
  referral: string;
  body: string[];
  links?: PostLink[];
}

export const POSTS: Post[] = [
  {
    slug: "media-rooms",
    title: "The rooms are on",
    kicker: "Media",
    date: "22 Oct 2026",
    excerpt: "StreetHood Media is live. Hood Morning sits tomorrow at 15:00 UTC. The last morning, on 13 Oct, held 501 people.",
    referral: "ROOMS",
    links: [
      { label: "Live room", href: "https://x.com/i/spaces/1yxBePgOWAkJN" },
      { label: "Hood Morning, 23 Oct", href: "https://x.com/i/spaces/1pKkOXlmLZrKj" },
      { label: "Hood Morning, 13 Oct", href: "https://x.com/i/spaces/1DxLdZLkDAwxm" },
      { label: "HoodStreet", href: "https://hoodstreet.capital" },
    ],
    body: [
      "This note is a reading of the HoodStreet Media rooms, taken on 22 October 2026. StreetHood Media 24/7 was still open. The host on the room card is CashPixel, @RealCashpig. It started at 11:32 UTC. The title is Robinhood NFTs, memes, and news, and it names $CANNACAT. Co-hosts on that card were Scratch, Lady_Blue, Katy Caterpillar, Jeffie, Amazing G, and KRONIK CRUZ. A price called out in the chat is someone talking. It is not a quote from this desk.",
      "Hood Morning is scheduled for 23 October at 15:00 UTC. The host is Roaring Piggy, @RoaringPiggy, under HoodStreet Media. The title names Robinhood NFTs, Cash Grab, and a shill. The title is the bill for the hour. This desk does not check the mint and does not vouch for it.",
      "The morning before that ran on 13 October, 15:00 to 17:32 UTC, two hours and thirty-two minutes, with 501 people in the room. Same host. The title that day was Robinhood NFTs, news, and talk. Co-hosts on the card were Glitchy and Spinna.",
      "HoodStreet, on its own page, is the membership around these rooms. CCFF00 is the founding collection: 10,000 squares on Robinhood Chain, each an ERC-721 with an ERC-6551 wallet. My Neon opens that wallet. Bringing an agent is marked experimental beta, and the member still signs. The code on this note is ROOMS. A desk that arrives with it picks up 50 points.",
    ],
  },
  {
    slug: "mint-tape",
    title: "The mint tape, read once",
    kicker: "Mints",
    date: "17 Oct 2026",
    excerpt: "A 23:10 UTC reading of the Stray Cucks scanner. Most open cards are unverified. A few have buyers. CCFF00 in a stage name is a label.",
    referral: "MINTS",
    links: [
      { label: "Stray Cucks scanner", href: "https://allowlist.straycucks.com/" },
      { label: "How the check works", href: "https://allowlist.straycucks.com/guide" },
      { label: "Reefers", href: "https://allowlist.straycucks.com/c/0x9816dafa1fecf52087714a29e7d9762eeebdacb4" },
      { label: "Robin Frens", href: "https://allowlist.straycucks.com/c/0xd491da50f7ac02a4f8fe02e92d8f399239d331e5" },
      { label: "CCFF00:Ascension", href: "https://allowlist.straycucks.com/c/0x2cae6e106e2f75e7b7dfa6d6b69b6951d755b897" },
    ],
    body: [
      "The live mint list on this street is the Stray Cucks scanner at allowlist.straycucks.com. It asks OpenSea whether a wallet may mint the list stage that is open now, and it reads on-chain token gates. A check needs nothing to sign. One wallet stays free. From 14 October 2026, checking several wallets at once, and push alerts, need one Stray Cuck or one CCFF00 Square for each wallet you track. The scanner says a label is a fact, and a drop with no mark is simply unreviewed.",
      "This note is one reading, taken at 23:10 UTC on 16 October 2026. The feed held 189 drops: 181 marked live, 8 still upcoming. Verdicts on that reading were 179 unverified, 8 likely junk, and 2 marked trading observed. The site’s own Established count, a person reviewing a drop against public rules, sat at 13. Established remains a review mark. Minting stays on OpenSea, or on the collection’s own page. This desk only reads the tape.",
      "Six drops on that reading had already found buyers, by the scanner’s own bar. Reefers, 555 of 555, a free FCFS, listed floor about 0.0182 ETH, near $44. Robin Frens, 4455 of 4455, free, listed floor about $1.09, and marked trading observed. PRINTERS, 6000 of 6000, mint near $2.91 and a listed floor near $3.03. RuneKai, 222 of 300, mint near $18 and a listed floor near $18. Tree of Life and Midnight Puppets were minted out, with listed floors near $0.59 and $0.30. A floor here is the cheapest listing, not a sale.",
      "Thirteen cards carried a stage whose name mentions CCFF00. The scanner marks those as implied by the label. On this reading the open stage for Pixel Hoodies, DogByte, Brainless Apes, CCFF00:Ascension, and the rest of that set was already a public stage, so the CCFF00 window is the name of an earlier or parallel stage. CCFF00:Ascension was the loud listing: mint near $0.53, cheapest listing near $24. A square is membership. The list check is OpenSea’s answer, and a public permit is open to all.",
      "The rest of the tape is a crowd of public stages, many of them named Hood, many of them opened today, many with no site. Hood in the title is a word on someone else’s card. Night Ledger, DogiHood, and Hood Street keep their own contracts. Likely junk and copies stay folded on the scanner. Paste a wallet there if you want the list check. The code on this note is MINTS. The desk that arrives with it picks up 50 points.",
    ],
  },
  {
    slug: "desk-thoughts",
    title: "What each desk is for",
    kicker: "Street",
    date: "17 Oct 2026",
    excerpt: "A plain reading of the street: the book, the dogs, the square, the desks that trade, and the two that are not the chain.",
    referral: "DESKS",
    links: [
      { label: "Night Ledger", href: "https://doghood.aibusiness.fun/" },
      { label: "DogiHood", href: "https://dogihood.com/" },
      { label: "Hood Street", href: "https://doghood.aibusiness.fun/#/street" },
      { label: "Floor", href: "https://doghood.aibusiness.fun/floor" },
      { label: "HOOD Desk", href: "https://hoodtrading.aibusiness.fun/" },
      { label: "Dex", href: "https://dex.aibusiness.fun/" },
      { label: "Hood game", href: "https://dex.aibusiness.fun/rfgame" },
      { label: "Tickpix", href: "https://nft.aibusiness.fun/" },
      { label: "Robin GM", href: "https://gm.aibusiness.fun/" },
      { label: "HOOD//MINE", href: "https://mine.aibusiness.fun/" },
      { label: "Whale", href: "https://playwhale.io/" },
      { label: "Aura OS", href: "https://aibusiness.fun/" },
      { label: "Founder", href: "https://founder.aibusiness.fun/" },
      { label: "Aura Local", href: "https://review.aibusiness.fun/" },
    ],
    body: [
      "Night Ledger is the book. $HOOD was minted once, one billion, one pool against WETH, and the 1% fee stays in the position. The page is for reading the street, not for a second mint. DogiHood is the dogs: 5,000 pixel doges, mint closed, living at dogihood.com. Hood Street is the membership, CCFF00, Proof of Neon, and the NFT is the wallet. Floor, on the same book, is where names, stock, keys, members, and the journal sit. Those four are the night. The rest are desks that grew beside it.",
      "This HOOD Desk is the exchange page. The book of perps quotes live pool prints and keeps the order in the browser until a perps contract is set. Stake and the USDG vault accrue on the desk ledger until their contract addresses are set. The pixel you can wear pays 25 desk points a day. One hundred points claim 1 HOOD on that same ledger. Dex is the swap: ETH, USDG, tokenized stocks, and Rare Friends, with the hood game living on that host. Tickpix is a public pixel mint, 0.0001 ETH a seat, five to a wallet. Robin GM is a streak you can keep, with an optional NFT. HOOD//MINE is a field with three free cuts, and you choose the block.",
      "Three hosts on aibusiness.fun are a different kind of work. Aura OS, at the root, is the company operating system: you own the company, and AI employees do the work. Founder is Laszlo Bihary’s chronicle, twenty-six years of building for the web, written as a record rather than a product. Aura Local asks for a review after a real visit. The guest writes first in the app, and Google is optional. Whale sits at playwhale.io, off this domain, and belongs to the same night as a game rather than as a subdomain.",
      "The thought that ties them is simple. The coin, the dogs, and the square are finished objects with a job. The desks around them are tools: a book of quotes, a swap, a seat, a greeting, a field. A mint card on someone else’s scanner that borrows the word Hood is a third thing, and the scanner is the right place to read it. The code on this note is DESKS. A desk that arrives with it picks up 50 points.",
    ],
  },
  {
    slug: "robinhood-nft-tape",
    title: "NFTs on Robinhood Chain",
    kicker: "News",
    date: "14 Oct 2026",
    excerpt: "Rarible opened the chain on 5 October. OpenSea already lists collections. DogiHood and Hood Street were already here.",
    referral: "NFTS",
    body: [
      "On 5 October 2026 Rarible said Robinhood Chain collections can be explored on its marketplace. The note came from Rarible. It does not yet say whether minting, listing, bids, fees, or royalties are live, so the desk treats it as a door for looking, and waits for the rest.",
      "OpenSea added the chain in July, just after public mainnet on 1 July 2026. Collections there can be browsed, bought, and sold, with offers and floors. OpenSea is self-custody. A Robinhood brokerage account is not required.",
      "StonkBrokers minted on 17 July: 4,444 pixel pictures, each with its own token-bound wallet. Selling the picture moves the wallet, and the tokenized stock exposure inside it. CryptoBriefing wrote on 1 September that holders had received more than $405,000 of stock tokens, and that the floor had run from about 0.20 ETH to above 13 ETH before sitting near 4–5 ETH in late August. That is a September report, not a live quote.",
      "On this street the pictures were already out. DogiHood is 5,000 pixel doges, mint complete, at dogihood.com. Hood Street is CCFF00, Proof of Neon, and the NFT is the wallet. Stock tokens are a different object: by 12 October Robinhood put their volume near $15 billion and holders near 200,000. They are debt securities from Robinhood Assets (Jersey) Limited, closed to US persons, and they are not the NFTs.",
    ],
  },
  {
    slug: "founders-wood",
    title: "The founders, from the wood",
    kicker: "Story",
    date: "14 Oct 2026",
    excerpt: "The Robin Hood name is borrowed. The street kept the coin, the dogs, and the membership.",
    referral: "WOOD",
    body: [
      "The Robin Hood story is a name this street borrowed. The founders did not start a brokerage. They started a night: one coin, one pool, and a ledger anyone can read. Night Ledger is that book. This desk is the exchange that came after it.",
      "The coin was minted once. One billion $HOOD. No tax, and no second mint. The bow is the wallet: it signs the swap, and the desk does not place the order. The pool is one market, $HOOD for WETH. Each swap pays 1%, and the fee stays in the position. Bring ETH and the treasury meets you there. 2% of that ETH goes to the cause.",
      "Then the pack. DogiHood is 5,000 pixel doges, the official collection, mint already closed. Hood Street is the founding membership, CCFF00, Proof of Neon. The NFT is the wallet. Seeder and Inner Circle stay in the Night Ledger book. The stills of the wood, the coin, the bow, and the street hang on the home page.",
      "The pixel on this desk is the latest hood. Wear it and it replaces the mark in the nav. Flash it and the desk pays 25 points, once a day. One hundred points still claim 1 HOOD. The code on this note is WOOD.",
    ],
  },
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
      "The desk agent can quote the live rate. The stake page reads the same desk pool, and xHOOD is the receipt in this browser.",
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
