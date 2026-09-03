/**
 * Essor | Vercel health-check function.
 *
 * Kept deliberately separate from the catch-all so load balancers and
 * uptime monitors can probe `/health` without paying a cold-start of the
 * whole Fastify application.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(
  _req: VercelRequest,
  res: VercelResponse,
): void {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
