import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        popup: "./index.html",
        background: "./src/extension/background.ts",
        messageListener: "./src/extension/messageListener.ts",
        themeWatcher: "./src/extension/themeWatcher.ts",
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name][extname]",
      },
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:4000", // proxy что бы не делать CORS запросы для Dev
    },
  },
});
