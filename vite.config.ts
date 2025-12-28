import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts:
      mode === "e2e" || process.env.CI
        ? true
        : ["collector.shop", "localhost", "frontend-e2e"],
  },
}));
