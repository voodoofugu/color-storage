import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // open: true, // автоматически откроет браузер
    proxy: {
      // для разработки локально
      "/api": {
        target: "https://color-storage.vercel.app",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        popup: "index.html",
        background: "src/extension/background.ts",
        messageListener: "src/extension/messageListener.ts",
        themeWatcher: "src/extension/themeWatcher.ts",
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name][extname]",
      },
    },
  },
});
