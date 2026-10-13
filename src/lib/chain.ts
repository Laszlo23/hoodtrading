import { CHAIN_HEX, EXPLORER, RPC_URL } from "../data/markets";
import type { ChainVitals } from "../types";

const USDG_SUPPLY = 708_690_621.15;

async function rpc<T>(method: string, params: unknown[] = []): Promise<T> {
  const targets = ["/rpc", RPC_URL];
  let last = "RPC unavailable";
  for (const url of targets) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
      });
      if (!response.ok) {
        last = `RPC ${response.status}`;
        continue;
      }
      const json = (await response.json()) as { result?: T; error?: { message: string } };
      if (json.error) {
        last = json.error.message;
        continue;
      }
      if (json.result === undefined) {
        last = "Empty RPC result";
        continue;
      }
      return json.result;
    } catch (error) {
      last = error instanceof Error ? error.message : "RPC failed";
    }
  }
  throw new Error(last);
}

export async function readVitals(previous: ChainVitals): Promise<ChainVitals> {
  const [blockHex, gasHex] = await Promise.all([
    rpc<string>("eth_blockNumber"),
    rpc<string>("eth_gasPrice"),
  ]);
  const blockNumber = Number.parseInt(blockHex, 16);
  const gasWei = Number.parseInt(gasHex, 16);
  return {
    ...previous,
    blockNumber: Number.isFinite(blockNumber) ? blockNumber : previous.blockNumber,
    gasGwei: Number.isFinite(gasWei) ? gasWei / 1e9 : previous.gasGwei,
    updatedAt: Date.now(),
  };
}

export function initialVitals(): ChainVitals {
  return {
    blockNumber: 87_622_469,
    gasGwei: 0.0207,
    usdgSupply: USDG_SUPPLY,
    blocksPerSecond: 9.95,
    avgBlockMs: 101,
    ethPrice: 2515.22,
    transferFeeUsd: 0.00153,
    updatedAt: null,
  };
}

export async function connectWallet(): Promise<{ address: string; eth: number | null }> {
  const ethereum = window.ethereum;
  if (!ethereum) throw new Error("No injected wallet found");
  const accounts = (await ethereum.request({ method: "eth_requestAccounts" })) as string[];
  const address = accounts[0];
  if (!address) throw new Error("Wallet returned no account");
  const chainId = (await ethereum.request({ method: "eth_chainId" })) as string;
  if (chainId.toLowerCase() !== CHAIN_HEX) {
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: CHAIN_HEX }],
      });
    } catch {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: CHAIN_HEX,
            chainName: "Robinhood Chain",
            nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
            rpcUrls: [RPC_URL],
            blockExplorerUrls: [EXPLORER],
          },
        ],
      });
    }
  }
  const balanceHex = (await ethereum.request({
    method: "eth_getBalance",
    params: [address, "latest"],
  })) as string;
  const eth = Number.parseInt(balanceHex, 16) / 1e18;
  return { address, eth: Number.isFinite(eth) ? eth : null };
}

export function explorerAddress(address: string): string {
  return `${EXPLORER}/address/${address}`;
}

export function explorerToken(address: string): string {
  return `${EXPLORER}/token/${address}`;
}
