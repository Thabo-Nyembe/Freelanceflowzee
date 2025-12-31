const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function run() {
  // Use the correct pooler host (aws-1, not aws-0)
  const client = new Client({
    host: 'aws-1-eu-north-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres.gcinvwprtlnwuwuvmrux',
    password: 'qUCPaWXy1jpgakyE',
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
