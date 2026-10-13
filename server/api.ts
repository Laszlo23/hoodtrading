import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import type { AgentContext } from "../src/sdk/desk";
import { deskReply } from "../src/sdk/desk";

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify(body));
}

export async function handle(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = req.url?.split("?")[0] ?? "";
  if (!url.startsWith("/api/")) return false;

  if (url === "/api/status" && req.method === "GET") {
    send(res, 200, {
      agent: Boolean(process.env.HOOD_API_KEY && process.env.HOOD_AGENT_URL),
      staking: Boolean(process.env.VITE_STAKING_ADDRESS),
      vault: Boolean(process.env.VITE_VAULT_ADDRESS),
    });
    return true;
  }

  if (url === "/api/agent" && req.method === "POST") {
    const raw = await readBody(req);
    const parsed = JSON.parse(raw || "{}") as { message?: string; context?: AgentContext };
    const message = parsed.message?.trim() ?? "";
    const context = parsed.context;
    if (!message || !context) {
      send(res, 400, { error: "Message and context are required" });
      return true;
    }
    const key = process.env.HOOD_API_KEY;
    const endpoint = process.env.HOOD_AGENT_URL;
    if (key && endpoint) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: process.env.HOOD_AGENT_MODEL || "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "You are the HOOD desk agent. Explain xHOOD staking, the USDG vault, perps, rewards, and referrals. Be brief and concrete. Never invent a liquidation price or a balance that is not in the user context.",
              },
              {
                role: "user",
                content: `${message}\n\nContext: ${JSON.stringify(context)}`,
              },
            ],
          }),
        });
        if (!response.ok) {
          send(res, 200, { reply: deskReply(message, context), source: "desk" });
          return true;
        }
        const json = (await response.json()) as { choices?: { message?: { content?: string } }[] };
        const reply = json.choices?.[0]?.message?.content?.trim();
        send(res, 200, { reply: reply || deskReply(message, context), source: reply ? "model" : "desk" });
        return true;
      } catch {
        send(res, 200, { reply: deskReply(message, context), source: "desk" });
        return true;
      }
    }
    send(res, 200, { reply: deskReply(message, context), source: "desk" });
    return true;
  }

  send(res, 404, { error: "Not found" });
  return true;
}

export function hoodApi(): Plugin {
  const attach = (middlewares: { use: (fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void }) => {
    middlewares.use((req, res, next) => {
      void handle(req, res).then((done) => {
        if (!done) next();
      }).catch(() => {
        send(res, 500, { error: "API error" });
      });
    });
  };
  return {
    name: "hood-api",
    configureServer(server) {
      attach(server.middlewares);
    },
    configurePreviewServer(server) {
      attach(server.middlewares);
    },
  };
}
