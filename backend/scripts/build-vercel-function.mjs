/**
 * Scholnexa — Vercel function bundler.
 *
 * Bundles `src/serverless.ts` (the Fastify app entry) into a single
 * self-contained `api/[...path].js` file that Vercel executes directly.
 *
 * Why pre-bundle?
 * - The platform's TypeScript compiler does not resolve the `@/*` tsconfig
 *   path alias used across `src/`; esbuild does.
 * - Producing a plain `.js` function avoids recompilation surprises and
 *   keeps the deploy deterministic.
 *
 * `bcrypt` is kept external: it is a native addon and cannot be bundled; its
 * prebuilt binaries are shipped with `node_modules`, which Vercel includes
 * via dependency tracing.
 */

import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const entry = path.join(root, "src", "serverless.ts");
const outfile = path.join(root, "api", "[...path].js");

console.log(
  `[vercel-function] bundling ${path.relative(root, entry)} → ${path.relative(root, outfile)}`,
);

await build({
  entryPoints: [entry],
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  external: ["bcrypt"],
  outfile,
  logLevel: "warning",
  // Several CJS dependencies (e.g. avvio/fastify internals) perform dynamic
  // `require()` of Node builtins at runtime. Pure-ESM output has no global
  // `require`, so provide one backed by createRequire. (esbuild already
  // generates its own `__dirname`/`__filename` shims for ESM output, so only
  // `require` is needed here.) The import uses a unique alias so it cannot
  // collide with esbuild's own hoisted imports.
  banner: {
    js: `import { createRequire as __createRequire } from "module";\nconst require = __createRequire(import.meta.url);`,
  },
});

console.log("[vercel-function] done");
