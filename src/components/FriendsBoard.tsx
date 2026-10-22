import { useEffect, useState } from "react";
import { loadFriends, type FriendKey, type FriendsBoard } from "../sdk/friends";
import { useStore } from "../state/store";

function tone(change: string): "up" | "down" {
  return change.startsWith("-") ? "down" : "up";
}

export function FriendsTape() {
  const store = useStore();
  const { board, quiet } = useFriends();

  return (
    <section className="keys-block">
      <header>
        <p className="kicker">BaseFriend · Base · DEGEN</p>
        <button className="text-link" type="button" onClick={() => store.setPage("friends")}>All keys</button>
      </header>
      {board?.keys.length ? (
        <div className="keys">
          {board.keys.slice(0, 4).map((key) => <KeyCard key={key.id} item={key} />)}
        </div>
      ) : (
        <p className="fine">{quiet ? "The keys board did not answer." : "Reading the keys board."}</p>
      )}
    </section>
  );
}

export function FriendsPage() {
  const { board, quiet } = useFriends();

  return (
    <div className="page">
      <p className="kicker">BaseFriend</p>
      <h1 className="page-title">Keys on Base.</h1>
      <p className="lede">
        BaseFriend sells a key to a creator or a club. The price is DEGEN, on Base. This desk reads the live board. The buy, the chat, and the holding stay on their page.
      </p>
      <div className="hero-actions">
        <a className="btn cyan" href="https://basefriend.tech/" target="_blank" rel="noreferrer">Open BaseFriend</a>
      </div>
      <section>
        <p className="kicker">Top volume</p>
        {board?.keys.length ? (
          <div className="keys">
            {board.keys.map((key) => <KeyCard key={key.id} item={key} />)}
          </div>
        ) : (
          <p className="fine">{quiet ? "The keys board did not answer." : board ? "The keys board is empty." : "Reading the keys board."}</p>
        )}
      </section>
      <section className="friend-trades">
        <p className="kicker">Just traded</p>
        {board?.trades.length ? (
          <ul>
            {board.trades.map((trade) => (
              <li key={trade.id}>
                <a href={trade.href} target="_blank" rel="noreferrer">
                  <b>{trade.name}</b>
                  <span>{trade.handle}</span>
                  <em className={trade.side === "buy" ? "up" : "down"}>{trade.side} {trade.keys}</em>
                  <small>{trade.spent} DEGEN · {trade.trader}</small>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="fine">{quiet ? "The tape did not answer." : board ? "No trades in this reading." : "Reading the tape."}</p>
        )}
      </section>
    </div>
  );
}

function KeyCard({ item }: { item: FriendKey }) {
  return (
    <a className="key-card" href={item.href} target="_blank" rel="noreferrer">
      <span>{item.room}</span>
      <b>{item.name}</b>
      <p>{item.handle || "BaseFriend"}</p>
      <strong>{item.price} <small>DEGEN</small></strong>
      <em className={tone(item.change)}>{item.change}</em>
      <small>{item.holders} holders · {item.supply} supply · {item.volume} 7d</small>
    </a>
  );
}

function useFriends(): { board: FriendsBoard | null; quiet: boolean } {
  const [board, setBoard] = useState<FriendsBoard | null>(null);
  const [quiet, setQuiet] = useState(false);

  useEffect(() => {
    let stop = false;
    const pull = () => {
      loadFriends()
        .then((next) => {
          if (stop) return;
          setBoard(next);
          setQuiet(false);
        })
        .catch(() => {
          if (!stop) setQuiet(true);
        });
    };
    pull();
    const timer = window.setInterval(pull, 30_000);
    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, []);

  return { board, quiet };
}
