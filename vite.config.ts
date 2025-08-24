import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // open: true, // автоматически откроет браузер
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        popup: "index.html",
        background: "src/helpers/background.ts",
        // offscreen: "offscreen.html",
        "theme-watcher": "src/helpers/theme-watcher.ts",
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name][extname]",
      },
    },
  },
});

