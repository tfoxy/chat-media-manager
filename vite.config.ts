import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  base:
    process.env.ELECTRON == "true"
      ? "./"
      : process.env.GITHUB_PAGES == "true"
      ? "/chat-media-manager/"
      : "",
  plugins: [tsconfigPaths(), vue()],
});
