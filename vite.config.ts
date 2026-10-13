import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { hoodApi } from "./server/api";

export default defineConfig({
  plugins: [react(), hoodApi()],
  server: {
    port: 5173,
    proxy: {
      "/rpc": {
        target: "https://rpc.mainnet.chain.robinhood.com",
        changeOrigin: true,
        rewrite: () => "/",
      },
      "/gt": {
        target: "https://api.geckoterminal.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gt/, ""),
      },
    },
  },
});
