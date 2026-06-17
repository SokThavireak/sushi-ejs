import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/login": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/register": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/logout": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/auth": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/profile": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
