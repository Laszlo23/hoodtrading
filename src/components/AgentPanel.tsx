import { useEffect, useState } from "react";
import { STAKE_APR, VAULT_APR } from "../sdk/config";
import { hood } from "../sdk/client";
import type { AgentReply } from "../sdk/client";
import { useProtocol } from "../state/protocol";
import { useStore } from "../state/store";

interface Turn {
  role: "you" | "agent";
  text: string;
  source?: AgentReply["source"];
}

const PROMPTS = ["What is xHOOD?", "Vault APR", "My points", "How do referrals work?"];

export function AgentPanel() {
  const store = useStore();
  const { ledger } = useProtocol();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [live, setLive] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([
    { role: "agent", text: "Ask about xHOOD, the vault, a perp, or your points.", source: "desk" },
  ]);

  useEffect(() => {
    void hood.status().then((status) => setLive(status.agent)).catch(() => setLive(false));
  }, []);

  const send = async (message: string) => {
    const trimmed = message.trim();
    if (!trimmed || pending) return;
    setText("");
    setTurns((current) => [...current, { role: "you", text: trimmed }]);
    setPending(true);
    try {
      const reply = await hood.ask(trimmed, {
        rate: ledger.rate,
        vaultRate: ledger.vaultRate,
        stakeApr: STAKE_APR,
        vaultApr: VAULT_APR,
        hood: ledger.hood,
        xHood: ledger.xHood,
        vaultUsdg: ledger.vaultAssets,
        points: ledger.points,
        equity: store.equity,
        referral: ledger.referral,
        page: store.page,
      });
      setTurns((current) => [...current, { role: "agent", text: reply.reply, source: reply.source }]);
      if (reply.source === "model") setLive(true);
    } catch {
      setTurns((current) => [...current, { role: "agent", text: "The agent could not answer that. Try the stake rate or the vault.", source: "desk" }]);
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <button className="agent-fab" type="button" onClick={() => setOpen((value) => !value)}>
        Agent
      </button>
      {open ? (
        <aside className="agent-panel">
          <header>
            <b>Desk agent</b>
            <span>{live ? "Model" : "SDK desk"}</span>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close agent">×</button>
          </header>
          <div className="agent-log">
            {turns.map((turn, index) => (
              <p key={`${turn.role}-${index}`} className={turn.role}>
                {turn.text}
                {turn.source ? <small>{turn.source}</small> : null}
              </p>
            ))}
          </div>
          <div className="agent-prompts">
            {PROMPTS.map((prompt) => (
              <button key={prompt} type="button" onClick={() => void send(prompt)}>{prompt}</button>
            ))}
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void send(text);
            }}
          >
            <input value={text} placeholder="Ask the desk" onChange={(event) => setText(event.target.value)} />
            <button className="btn cyan" type="submit" disabled={pending}>{pending ? "…" : "Send"}</button>
          </form>
        </aside>
      ) : null}
    </>
  );
}
