export interface FriendKey {
  id: string;
  name: string;
  handle: string;
  room: "Club" | "Creator" | "Key";
  price: string;
  change: string;
  holders: number;
  supply: string;
  volume: string;
  href: string;
}

export interface FriendTrade {
  id: string;
  name: string;
  handle: string;
  side: "buy" | "sell";
  keys: string;
  spent: string;
  trader: string;
  href: string;
}

export interface FriendsBoard {
  keys: FriendKey[];
  trades: FriendTrade[];
  readAt: string;
}

export async function loadFriends(): Promise<FriendsBoard> {
  const response = await fetch("/api/friends");
  if (!response.ok) throw new Error("keys");
  return await response.json() as FriendsBoard;
}
