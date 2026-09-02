import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectDirectory = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "dist-income-standalone",
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(projectDirectory, "income-standalone-entry.html"),
    },
  },
});
