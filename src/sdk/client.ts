import { createPublicClient, http } from "viem";
import type { AgentContext } from "./desk";
import { publicConfig, robinhood } from "./config";

export interface AgentReply {
  reply: string;
  source: "model" | "desk";
}

export interface SdkStatus {
  agent: boolean;
  staking: boolean;
  vault: boolean;
}

export function createHoodClient() {
  const publicClient = createPublicClient({
    chain: robinhood,
    transport: http(import.meta.env.VITE_RPC_URL || "/rpc"),
  });

  return {
    publicClient,
    config: publicConfig,
    async blockNumber(): Promise<bigint> {
      return publicClient.getBlockNumber();
    },
    async status(): Promise<SdkStatus> {
      const response = await fetch("/api/status");
      if (!response.ok) {
        return { agent: false, staking: Boolean(publicConfig.staking), vault: Boolean(publicConfig.vault) };
      }
      return (await response.json()) as SdkStatus;
    },
    async ask(message: string, context: AgentContext): Promise<AgentReply> {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message, context }),
      });
      if (!response.ok) throw new Error("Agent request failed");
      return (await response.json()) as AgentReply;
    },
  };
}

export const hood = createHoodClient();
