import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:6432/swasthyokor";

// Cache connection globally to prevent exhausting pool on hot reload and parallel build workers
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn =
  globalForDb.conn ??
  postgres(connectionString, {
    max: Number(process.env.DB_POOL_MAX || 20),
    idle_timeout: 30,
    connect_timeout: 10,
    prepare: false, // Required for PgBouncer transaction pooling mode (disables prepared statements)
    ssl: "prefer", // Prevents timeout when connecting to PgBouncer in plain TCP mode
    transform: {
      undefined: null,
    },
  });

globalForDb.conn = conn;

export const db = drizzle(conn, { schema });
