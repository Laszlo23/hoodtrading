import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/geist-sans/400.css";
import "@fontsource/geist-sans/500.css";
import "@fontsource/geist-sans/600.css";
import "@fontsource/geist-sans/700.css";
import { App } from "./App";
import { bootSeries } from "./lib/series";
import { ProtocolProvider } from "./state/protocol";
import { StoreProvider } from "./state/store";
import "./styles.css";

bootSeries();

const root = document.getElementById("root");
if (!root) throw new Error("Root missing");

createRoot(root).render(
  <StrictMode>
    <StoreProvider>
      <ProtocolProvider>
        <App />
      </ProtocolProvider>
    </StoreProvider>
  </StrictMode>,
);
