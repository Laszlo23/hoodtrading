export interface SpaceRoom {
  id: string;
  state: "live" | "scheduled" | "ended";
  title: string;
  when: string;
  host: string;
  line: string;
  href: string;
}

export const SPACES: SpaceRoom[] = [
  {
    id: "1yxBePgOWAkJN",
    state: "live",
    title: "StreetHood Media 24/7",
    when: "On since 22 Oct, 11:32 UTC",
    host: "@RealCashpig",
    line: "Robinhood NFTs, memes, and news. The title names $CANNACAT. A number shouted in the room is not a desk quote.",
    href: "https://x.com/i/spaces/1yxBePgOWAkJN",
  },
  {
    id: "1pKkOXlmLZrKj",
    state: "scheduled",
    title: "Hood Morning",
    when: "23 Oct, 15:00 UTC",
    host: "@RoaringPiggy",
    line: "HoodStreet Media. Robinhood NFTs, Cash Grab, and a shill. The title is the bill. This desk does not vouch for a mint.",
    href: "https://x.com/i/spaces/1pKkOXlmLZrKj",
  },
  {
    id: "1DxLdZLkDAwxm",
    state: "ended",
    title: "Hood Morning",
    when: "13 Oct, 15:00–17:32 UTC",
    host: "@RoaringPiggy",
    line: "501 in the room. Two hours and thirty-two minutes. Robinhood NFTs, news, and talk.",
    href: "https://x.com/i/spaces/1DxLdZLkDAwxm",
  },
];
