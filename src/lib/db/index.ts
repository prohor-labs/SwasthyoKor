import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_xUM3YDqIZfv9@ep-plain-scene-b4jmdszk-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

// Disable prefetch as it is not supported for "Transaction" pool mode
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const client =
  globalForDb.conn ??
  postgres(connectionString, {
    prepare: false,
    ssl: "require",
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = client;
}

export const db = drizzle(client, { schema });
export { schema };
export * from "./schema";
