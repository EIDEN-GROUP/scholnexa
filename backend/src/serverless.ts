/**
 * Scholnexa — Vercel serverless entry point (source).
 *
 * This file is bundled by `scripts/build-vercel-function.mjs` (run from the
 * `vercel-build` script) into the self-contained function `api/[...path].js`
 * that Vercel executes. We pre-bundle with esbuild because the platform's
 * own TypeScript compiler does not resolve the `@/*` tsconfig path alias
 * used throughout `src/`, while esbuild does.
 *
 * Serves the entire Fastify API as a single Vercel Node function. Vercel
 * routes every request under `/api/*` to it; the Fastify router is driven by
 * emitting the incoming request into the app's HTTP server — the same
 * mechanism used by the official `@fastify/vercel` adapter.
 *
 * Deployment model:
 * - VPS (default): `src/index.ts` calls `app.listen()` — persistent process.
 * - Vercel: the bundled function — each invocation is ephemeral; the app
 *   instance is built once and reused across warm invocations.
 *
 * What cannot run serverless (and therefore stays on the VPS or on managed
 * infrastructure):
 * - The BullMQ background worker (`src/jobs/worker.ts`) — a long-lived
 *   process that must keep running on an always-on host. The API can still
 *   enqueue jobs; the VPS worker consumes them.
 * - PostgreSQL, Redis, MinIO/S3 — reachable network services (exposed from
 *   the VPS or managed providers).
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { buildApp } from "@/app";

let appPromise: Promise<import("fastify").FastifyInstance> | undefined;

/**
 * Build and fully initialize the Fastify app once per warm instance.
 * `app.ready()` finalizes plugin encapsulation (route contexts, hooks), which
 * is required before driving the router through `server.emit()` — the same
 * sequence used by the official `@fastify/vercel` adapter.
 */
function getApp(): Promise<import("fastify").FastifyInstance> {
  if (!appPromise) {
    appPromise = buildApp().then((app) => app.ready().then(() => app));
    // Reset on failure so a transient cold-start error can be retried.
    appPromise.catch(() => {
      appPromise = undefined;
    });
  }
  return appPromise;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const app = await getApp();

  // Drive the Fastify router with the raw Node request/response objects.
  // Fastify writes the reply to `res` asynchronously; Vercel finalizes it.
  app.server.emit("request", req, res);
}
