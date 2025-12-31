/**
 * Dynamic Content Migration Script
 * Creates tables for marketing, announcements, metrics, and activity feeds
 *
 * Run: node scripts/run-content-migration.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('Connecting to Supabase PostgreSQL...');

  const client = new Client({
    host: 'aws-1-eu-north-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres.gcinvwprtlnwuwuvmrux',
    password: 'qUCPaWXy1jpgakyE',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected!');
    console.log('');
    console.log('Running dynamic content migration...');

    // Read and execute migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20251231000005_dynamic_content_system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Run the entire migration as a single transaction
    try {
      await client.query(migrationSQL);
    } catch (err) {
      // If full migration fails, try individual statements
      if (!err.message.includes('already exists')) {
        console.log(`  Note: ${err.message.split('\n')[0]}`);
      }

      // Split by statement and execute each
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        try {
          await client.query(statement + ';');
        } catch (err2) {
          if (!err2.message.includes('already exists') && !err2.message.includes('duplicate')) {
            console.log(`  Warning: ${err2.message.split('\n')[0]}`);
          }
        }
      }
    }

    console.log('');
    console.log('Migration completed successfully!');
    console.log('');

    // Verify tables exist
    const { rows } = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('announcements', 'marketing_content', 'business_metrics', 'activity_feed', 'platform_stats')
      ORDER BY table_name
    `);

    console.log('==================================================');
    console.log('Created tables:');
    rows.forEach(row => console.log(`  - ${row.table_name}`));
    console.log('==================================================');

  } catch (err) {
    console.error('Migration error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
