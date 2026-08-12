import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { getEnv, IS_SERVERLESS } from "@/config/env";
import * as schema from "./schema/index";

let _db: ReturnType<typeof drizzle> | undefined;
let _pool: pg.Pool | undefined;

export function getDb() {
  if (!_db) {
    const env = getEnv();
    _pool = new pg.Pool({
      connectionString: env.DATABASE_URL,
      // On serverless platforms every warm function instance owns a pool, so
      // cap connections tightly to avoid exhausting the database. On a VPS
      // the app is a single long-lived process and can use a larger pool.
      max: IS_SERVERLESS ? 1 : 10,
      connectionTimeoutMillis: 10_000,
      idleTimeoutMillis: 30_000,
    });
    // Unhandled pool 'error' events crash the process; idle-client failures
    // must be logged instead (critical on serverless where an instance is
    // recycled on crash).
    _pool.on("error", (err: Error) => {
      console.error("PostgreSQL pool error:", err.message);
    });
    _db = drizzle(_pool, { schema });
  }
  return _db;
}

export function getPool() {
  if (!_pool) {
    getDb();
  }
  return _pool!;
}

export async function closeDb() {
  if (_pool) {
    await _pool.end();
    _pool = undefined;
    _db = undefined;
  }
}
