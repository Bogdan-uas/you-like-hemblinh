import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { rubberJsx, rubberPostcss } from "./vite.rubber.js";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), rubberJsx()],
  css: {
    postcss: {
      plugins: [rubberPostcss()],
    },
  },
  server: {
    watch: {
      awaitWriteFinish: {
        stabilityThreshold: 250,
        pollInterval: 50,
      },
    },
  },
  build: {
    sourcemap: true,
  }
});
