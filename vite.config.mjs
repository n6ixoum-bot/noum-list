import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const noumAllowedHosts = [".manus.computer", "learnpath-eqgbt4by.manus.space"];

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: Number(process.env.EXPO_PORT ?? 8081),
    strictPort: true,
    allowedHosts: noumAllowedHosts,
    proxy: {
      "/api": "http://127.0.0.1:3000",
    },
  },
  preview: {
    host: "0.0.0.0",
    allowedHosts: noumAllowedHosts,
  },
});
