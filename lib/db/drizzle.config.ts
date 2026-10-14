import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import path from "path";

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

const databaseUrl = getDatabaseUrl();

if (!databaseUrl) {
  console.warn(
    "No PostgreSQL connection config found for Drizzle. Set DATABASE_URL or PG* variables before running migrations.",
  );
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
