import fs from "fs";
import path from "path";

async function main() {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.PGURI;

  if (!connectionString) {
    console.log("ℹ️  [Notice] DATABASE_URL or POSTGRES_URL environment variable is not set.");
    console.log("   To run cloud migrations against Supabase (Mumbai) or Neon:");
    console.log("   DATABASE_URL=\"postgres://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres\" pnpm db:deploy\n");
    console.log("   The idempotent SQL schema is ready at: scripts/deploy-db.sql");
    return;
  }

  const isRemote =
    connectionString.includes("supabase.co") ||
    connectionString.includes("pooler.supabase.com") ||
    connectionString.includes("neon.tech") ||
    connectionString.includes("render.com") ||
    connectionString.includes("rds.amazonaws.com") ||
    connectionString.includes("aivencloud.com") ||
    connectionString.includes("railway") ||
    process.env.NODE_ENV === "production";

  console.log(`🔌 Connecting to PostgreSQL at ${connectionString.split("@")[1] || "database"} (SSL: ${isRemote ? "ENABLED" : "OFF"})...`);

  let pgModule: any;
  try {
    pgModule = await import("pg");
  } catch {
    try {
      pgModule = await import("../node_modules/.pnpm/pg@8.23.1/node_modules/pg/lib/index.js");
    } catch {
      pgModule = await import("../lib/db/src/postgres.js");
    }
  }

  const PoolClass = pgModule.default?.Pool || pgModule.Pool;
  const pool = new PoolClass({
    connectionString,
    ssl: isRemote ? { rejectUnauthorized: false } : undefined,
  });

  try {
    const client = await pool.connect();
    console.log("✅ Successfully connected to PostgreSQL!");

    const sqlPath = path.resolve(process.cwd(), "scripts/deploy-db.sql");
    const sqlContent = fs.readFileSync(sqlPath, "utf-8");

    console.log("🚀 Executing idempotent bootstrap migration (scripts/deploy-db.sql)...");
    await client.query(sqlContent);

    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    const tableNames = tablesRes.rows.map((r: any) => r.table_name);
    console.log(`\n🎉 Database migration complete! Verified ${tableNames.length} tables in public schema:`);
    tableNames.forEach((name: string) => console.log(`   - ${name}`));

    const mandiCountRes = await client.query("SELECT COUNT(*) FROM mandi_rates;");
    console.log(`\n📈 Seeded Lucknow Mandi Rates: ${mandiCountRes.rows[0].count} commodities active.`);

    const hubsCountRes = await client.query("SELECT COUNT(*) FROM vendor_hubs;");
    const driversCountRes = await client.query("SELECT COUNT(*) FROM drivers;");
    const kycCountRes = await client.query("SELECT COUNT(*) FROM partner_kyc_applications;");
    console.log(`🏬 Seeded Lucknow Vendor Hubs: ${hubsCountRes.rows[0].count} active hubs.`);
    console.log(`🚚 Seeded Lucknow Relay Drivers: ${driversCountRes.rows[0].count} active drivers.`);
    console.log(`📋 Seeded Partner KYC Applications: ${kycCountRes.rows[0].count} pending applications active in War Room.\n`);

    client.release();
    await pool.end();
  } catch (err: any) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  }
}

main();
