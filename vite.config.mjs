import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: Number(process.env.EXPO_PORT ?? 8081),
    strictPort: true,
    proxy: {
      "/api": "http://127.0.0.1:3000",
    },
  },
  preview: {
    host: "0.0.0.0",
  },
});
