import pg from "pg";

const { Pool } = pg;

function isRemoteHost(url: string): boolean {
  if (!url) return false;
  return (
    url.includes("supabase.co") ||
    url.includes("neon.tech") ||
    url.includes("pooler.supabase.com") ||
    url.includes("render.com") ||
    url.includes("rds.amazonaws.com") ||
    url.includes("aivencloud.com") ||
    process.env.NODE_ENV === "production"
  );
}

const rawDbUrl = process.env.DATABASE_URL || "";
const connectionString =
  process.env.POSTGRES_URL ||
  process.env.PGURI ||
  (rawDbUrl.startsWith("postgres://") || rawDbUrl.startsWith("postgresql://") ? rawDbUrl : "");

const needsSsl = isRemoteHost(connectionString);

export const pool = new Pool({
  connectionString: connectionString || undefined,
  ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on("error", (err) => {
  console.error("[PostgreSQL Pool Error]", err.message);
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.DEBUG_SQL === "true") {
    console.log(`[SQL] Executed query in ${duration}ms:`, { text, rows: res.rowCount });
  }
  return res;
}

export async function pingPostgres(): Promise<boolean> {
  if (!connectionString) return false;
  try {
    const res = await pool.query("SELECT 1 AS alive");
    return res.rows?.[0]?.alive === 1;
  } catch (err: any) {
    console.warn("[PostgreSQL Ping Failed]", err.message);
    return false;
  }
}

export default pool;
