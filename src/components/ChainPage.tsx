import { useState } from "react";
import { EXPLORER, MARKETS } from "../data/markets";
import { formatCompact, formatPrice } from "../lib/format";
import { useStore } from "../state/store";

const POOLS = [
  ["USDG / WETH 0.01%", 294_791_456, 20_317_606, "uniswap-v3"],
  ["WETH / USDG", 74_987_908, 24_060_647, "uniswap-v4"],
  ["PONS / SUSD", 63_714_398, 14_070_953, "uniswap-v4"],
  ["AI / USDG", 25_519_678, 13_984_531, "uniswap-v4"],
  ["NVDA / SUSD", 23_713_973, 4_696_194, "uniswap-v4"],
  ["MOW / WETH", 15_237_900, 10_694_888, "uniswap-v4"],
  ["STANDARD / USDG", 14_175_407, 4_950_907, "uniswap-v4"],
  ["META / USDG", 2_740_373, 3_346_342, "uniswap-v4"],
] as const;

export function ChainPage() {
  const store = useStore();
  const [status, setStatus] = useState("Pool prints are live from the last chain read, then marked on this desk.");

  const refresh = async () => {
    setStatus("Refreshing GeckoTerminal prints…");
    try {
      const response = await fetch("/gt/api/v2/networks/robinhood/pools?page=1");
      if (!response.ok) {
        setStatus(`Print refresh unavailable (${response.status}). Marks keep moving from the last seed.`);
        return;
      }
      const json = (await response.json()) as {
        data?: { attributes?: { name?: string; base_token_price_usd?: string } }[];
      };
      let hits = 0;
      for (const row of json.data ?? []) {
        const name = row.attributes?.name ?? "";
        const symbol = name.split(/[/\s]/)[0]?.toUpperCase();
        const alias = symbol === "WETH" ? "ETH" : symbol;
        const price = Number(row.attributes?.base_token_price_usd);
        const market = MARKETS.find((item) => item.base === alias);
        if (!market || !Number.isFinite(price) || price <= 0) continue;
        const seed = market.price;
        if (price > seed * 1.8 || price < seed * 0.45) continue;
        store.applyPoolPrint(alias, price);
        hits += 1;
      }
      setStatus(hits ? `Updated ${hits} marks from Robinhood pools.` : "No matching pool prints on this page.");
    } catch {
      setStatus("Could not reach the pool index. Local marks are still running.");
    }
  };

  return (
    <div className="page">
      <div className="dash">
        <article>
          <span>Block</span>
          <b>{store.chain.blockNumber?.toLocaleString("en-US") ?? "—"}</b>
          <small>{store.chain.updatedAt ? "Live RPC" : "Last known"}</small>
        </article>
        <article>
          <span>Gas</span>
          <b>{store.chain.gasGwei?.toFixed(4) ?? "—"} gwei</b>
          <small>~{store.chain.blocksPerSecond.toFixed(2)} blocks/s</small>
        </article>
        <article>
          <span>USDG supply</span>
          <b>{formatCompact(store.chain.usdgSupply)}</b>
          <small>Transfer ~${store.chain.transferFeeUsd.toFixed(4)}</small>
        </article>
        <article>
          <span>ETH</span>
          <b>{formatPrice(store.chain.ethPrice)}</b>
          <small>Chain id 4663</small>
        </article>
      </div>
      <div className="section-head">
        <h2>Top pools</h2>
        <button className="btn cyan tiny" type="button" onClick={() => void refresh()}>Refresh prints</button>
      </div>
      <p className="lede">{status}</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Pool</th><th>24h Volume</th><th>Liquidity</th><th>DEX</th></tr>
          </thead>
          <tbody>
            {POOLS.map((pool) => (
              <tr key={pool[0]}>
                <td>{pool[0]}</td>
                <td>{formatCompact(pool[1])}</td>
                <td>{formatCompact(pool[2])}</td>
                <td>{pool[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="lede">
        Robinhood Chain settles in about {store.chain.avgBlockMs} ms. Explorer:{" "}
        <a href={EXPLORER} target="_blank" rel="noreferrer">{EXPLORER.replace("https://", "")}</a>
      </p>
    </div>
  );
}
