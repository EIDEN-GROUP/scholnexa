import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [TanStackRouterVite(), react(), tailwindcss(), tsconfigPaths()],
  // Read the merged monorepo-root .env (backend + frontend in one file) so
  // a single env powers both apps. Vercel injects its dashboard env vars
  // regardless of this setting.
  envDir: "..",
  server: {
    port: 5173,
  },
});
