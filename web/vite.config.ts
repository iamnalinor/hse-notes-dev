import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // GitHub Pages serves the project site from /<repo>/ (the deploy workflow sets BASE_PATH).
  base: process.env["BASE_PATH"] ?? "/",
  build: { chunkSizeWarningLimit: 700, sourcemap: false },
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "#web": new URL("src", import.meta.url).pathname } },
  test: {
    css: false,
    environment: "jsdom",
    globals: false,
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["src/test/setup.ts"],
  },
});
