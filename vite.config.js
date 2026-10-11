import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
