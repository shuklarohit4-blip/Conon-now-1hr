import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

function getDatabaseUrl() {
  const configuredUrl = process.env.DATABASE_URL?.trim();
  if (configuredUrl) {
    return configuredUrl;
  }

  const host = process.env.PGHOST ?? "127.0.0.1";
  const port = process.env.PGPORT ?? "5432";
  const user = process.env.PGUSER ?? "postgres";
  const database = process.env.PGDATABASE ?? "postgres";
  const password = process.env.PGPASSWORD;

  if (!process.env.PGHOST && !process.env.PGPORT && !process.env.PGUSER && !process.env.PGDATABASE && !process.env.PGPASSWORD) {
    return undefined;
  }

  const auth = password
    ? `${encodeURIComponent(user)}:${encodeURIComponent(password)}`
    : encodeURIComponent(user);

  return `postgresql://${auth}@${host}:${port}/${database}`;
}

export const databaseUrl = getDatabaseUrl();

if (!databaseUrl) {
  console.warn(
    "No PostgreSQL connection config found. Set DATABASE_URL or PGHOST/PGUSER/PGDATABASE (and optionally PGPASSWORD) before hitting DB-backed routes.",
  );
}

export const pool = new Pool({
  connectionString: databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

export async function pingDatabase() {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

export const db = drizzle(pool, { schema });

export * from "./schema";
