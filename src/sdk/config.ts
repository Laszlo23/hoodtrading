import { defineChain } from "viem";
import { EXPLORER } from "../data/markets";

export const robinhood = defineChain({
  id: 4663,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: [import.meta.env.VITE_RPC_URL || "/rpc"] },
  },
  blockExplorers: {
    default: { name: "Blockscout", url: EXPLORER },
  },
});

export const publicConfig = {
  hoodToken: import.meta.env.VITE_HOOD_TOKEN ?? "",
  xHoodToken: import.meta.env.VITE_XHOOD_TOKEN ?? "",
  staking: import.meta.env.VITE_STAKING_ADDRESS ?? "",
  vault: import.meta.env.VITE_VAULT_ADDRESS ?? "",
};

export const STAKE_APR = 0.12;
export const VAULT_APR = 0.064;
