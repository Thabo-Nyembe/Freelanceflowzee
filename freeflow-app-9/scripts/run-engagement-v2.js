const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function run() {
  // SECURITY: Credentials must be provided via environment variables
  const dbHost = process.env.SUPABASE_DB_HOST;
  const dbUser = process.env.SUPABASE_DB_USER;
  const dbPassword = process.env.SUPABASE_DB_PASSWORD;

  if (!dbHost || !dbUser || !dbPassword) {
    console.error('ERROR: Database credentials not configured.');
    console.error('Required environment variables: SUPABASE_DB_HOST, SUPABASE_DB_USER, SUPABASE_DB_PASSWORD');
    process.exit(1);
  }

  const client = new Client({
    host: dbHost,
    port: 5432,
    database: 'postgres',
    user: dbUser,
    password: dbPassword,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('Connected!\n');

    const sqlPath = path.join(__dirname, '../supabase/migrations/20251231000004_engagement_system_v2.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Running engagement system migration...\n');
    await client.query(sql);
    console.log('Migration completed successfully!\n');

    // Verify tables
    const result = await client.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
      AND (tablename LIKE 'engagement%' OR tablename = 'platform_metrics' OR tablename = 'user_milestones')
      ORDER BY tablename
    `);

    console.log('='.repeat(50));
    console.log('Created tables:');
    result.rows.forEach(r => console.log(`  - ${r.tablename}`));
    console.log('='.repeat(50));

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
