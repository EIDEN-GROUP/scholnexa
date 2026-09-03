import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

/**
 * Injects `<meta name="google-site-verification">` into dist/index.html at
 * build time from GOOGLE_SITE_VERIFICATION (or VITE_GOOGLE_SITE_VERIFICATION).
 * GSC verification fetches raw HTML, so a JS-injected tag is unreliable —
 * this bakes it into the static file instead. No token => no tag emitted.
 */
function googleSiteVerification() {
  const raw =
    process.env.GOOGLE_SITE_VERIFICATION ??
    process.env.VITE_GOOGLE_SITE_VERIFICATION ??
    "";
  const token = raw.trim().replace(/"/g, "&quot;");
  return {
    name: "google-site-verification",
    transformIndexHtml(html: string) {
      const marker = "<!--google-site-verification-->";
      if (!html.includes(marker)) return html;
      return html.replace(
        marker,
        token ? `<meta name="google-site-verification" content="${token}" />` : "",
      );
    },
  };
}

export default defineConfig({
  plugins: [
    googleSiteVerification(),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
      quoteStyle: "single",
      semicolons: true,
    }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  server: {
    port: 3000,
  },
});