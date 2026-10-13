import { MARKET_MAP } from "../data/markets";
import { formatPrice, formatQty, formatSignedUsd, formatTime, formatUsd } from "../lib/format";
import { getLast } from "../lib/series";
import { liqPrice, pnl } from "../lib/trading";
import { useStore } from "../state/store";
import type { DockTab } from "../types";

const TABS: { id: DockTab; label: string }[] = [
  { id: "positions", label: "Positions" },
  { id: "orders", label: "Open Orders" },
  { id: "history", label: "Trade History" },
  { id: "funding", label: "Funding" },
  { id: "balances", label: "Balances" },
];

export function Dock() {
  const store = useStore();
  const positions = store.account.positions.filter((position) => !store.hideOther || position.marketId === store.marketId);
  const orders = store.account.orders.filter((order) => !store.hideOther || order.marketId === store.marketId);

  return (
    <section className="dock">
      <div className="dock-bar">
        <div className="tabs">
          {TABS.map((tab) => (
            <button key={tab.id} className={store.dockTab === tab.id ? "tab on" : "tab"} onClick={() => store.setDockTab(tab.id)}>
              {tab.label}
              {tab.id === "positions" ? <em>{positions.length}</em> : null}
              {tab.id === "orders" ? <em>{orders.length}</em> : null}
            </button>
          ))}
        </div>
        <label className="check slim">
          <input type="checkbox" checked={store.hideOther} onChange={(event) => store.setHideOther(event.target.checked)} />
          Hide other pairs
        </label>
        <button className="text-btn" type="button" onClick={store.closeEverything}>Close All</button>
      </div>
      <div className="dock-body">
        {store.dockTab === "positions" ? (
          positions.length === 0 ? <Empty>You have no open positions</Empty> : (
            <table>
              <thead>
                <tr>
                  <th>Market</th><th>Side</th><th>Size</th><th>Entry</th><th>Mark</th><th>Liq</th><th>Margin</th><th>PnL</th><th></th>
                </tr>
              </thead>
              <tbody>
                {positions.map((position) => {
                  const market = MARKET_MAP[position.marketId];
                  const mark = getLast(position.marketId);
                  const profit = pnl(position, mark);
                  return (
                    <tr key={position.id} onClick={() => store.selectMarket(position.marketId)}>
                      <td>{market?.base}-USDG <small>{position.leverage}x</small></td>
                      <td className={position.side === "long" ? "up" : "down"}>{position.side}</td>
                      <td>{formatQty(position.qty)}</td>
                      <td>{formatPrice(position.entry)}</td>
                      <td>{formatPrice(mark)}</td>
                      <td>{formatPrice(liqPrice(position))}</td>
                      <td>{formatUsd(position.margin, 2)}</td>
                      <td className={profit >= 0 ? "up" : "down"}>{formatSignedUsd(profit)}</td>
                      <td><button type="button" className="text-btn" onClick={(event) => { event.stopPropagation(); store.closeOne(position.id); }}>Close</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        ) : null}
        {store.dockTab === "orders" ? (
          orders.length === 0 ? <Empty>You have no open orders</Empty> : (
            <table>
              <thead>
                <tr><th>Market</th><th>Type</th><th>Side</th><th>Price</th><th>Value</th><th></th></tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{MARKET_MAP[order.marketId]?.base}-USDG</td>
                    <td>{order.type}</td>
                    <td className={order.side === "buy" ? "up" : "down"}>{order.side}</td>
                    <td>{formatPrice(order.price)}</td>
                    <td>{formatUsd(order.notional, 2)}</td>
                    <td><button type="button" className="text-btn" onClick={() => store.cancelOrder(order.id)}>Cancel</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : null}
        {store.dockTab === "history" ? (
          store.account.fills.length === 0 ? <Empty>No fills yet</Empty> : (
            <table>
              <thead>
                <tr><th>Time</th><th>Market</th><th>Kind</th><th>Side</th><th>Price</th><th>Qty</th><th>Fee</th><th>PnL</th></tr>
              </thead>
              <tbody>
                {store.account.fills.map((fill) => (
                  <tr key={fill.id}>
                    <td>{formatTime(fill.time)}</td>
                    <td>{MARKET_MAP[fill.marketId]?.base}</td>
                    <td>{fill.kind}</td>
                    <td className={fill.side === "buy" ? "up" : "down"}>{fill.side}</td>
                    <td>{formatPrice(fill.price)}</td>
                    <td>{formatQty(fill.qty)}</td>
                    <td>{formatUsd(fill.fee, 2)}</td>
                    <td className={fill.pnl >= 0 ? "up" : "down"}>{formatSignedUsd(fill.pnl)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : null}
        {store.dockTab === "funding" ? (
          store.account.positions.length === 0 ? <Empty>Funding accrues on open positions</Empty> : (
            <table>
              <thead>
                <tr><th>Market</th><th>Side</th><th>Rate</th><th>Accrued</th></tr>
              </thead>
              <tbody>
                {store.account.positions.map((position) => {
                  const market = MARKET_MAP[position.marketId];
                  return (
                    <tr key={position.id}>
                      <td>{market?.base}</td>
                      <td className={position.side === "long" ? "up" : "down"}>{position.side}</td>
                      <td>{market?.fundingHourly.toFixed(7)}%</td>
                      <td className={position.fundingPaid <= 0 ? "up" : "down"}>{formatSignedUsd(-position.fundingPaid)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        ) : null}
        {store.dockTab === "balances" ? (
          <table>
            <thead>
              <tr><th>Asset</th><th>Wallet</th><th>Amount</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>USDG</td>
                <td>Paper</td>
                <td>{formatUsd(store.account.balance, 2)} free · {formatUsd(store.equity, 2)} equity</td>
              </tr>
              <tr>
                <td>ETH</td>
                <td>{store.wallet ? "Connected" : "—"}</td>
                <td>{store.ethBalance == null ? "—" : `${store.ethBalance.toFixed(6)} ETH`}</td>
              </tr>
            </tbody>
          </table>
        ) : null}
      </div>
    </section>
  );
}

function Empty({ children }: { children: string }) {
  return <div className="empty">{children}</div>;
}
