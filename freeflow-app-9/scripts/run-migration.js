/**
 * Run Engagement Tables Migration
 *
 * Usage: SUPABASE_DB_PASSWORD="your-password" node scripts/run-migration.js
 *
 * Get your database password from:
 * https://supabase.com/dashboard/project/gcinvwprtlnwuwuvmrux/settings/database
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const PROJECT_REF = 'gcinvwprtlnwuwuvmrux';
const DB_HOST = `aws-0-eu-north-1.pooler.supabase.com`;
const DB_PORT = 6543;
const DB_NAME = 'postgres';
const DB_USER = `postgres.${PROJECT_REF}`;

async function runMigration() {
  const password = process.env.SUPABASE_DB_PASSWORD;

  if (!password) {
    console.log('='.repeat(60));
    console.log('SUPABASE_DB_PASSWORD not set!');
    console.log('='.repeat(60));
    console.log('\nGet your password from Supabase Dashboard:');
    console.log('https://supabase.com/dashboard/project/gcinvwprtlnwuwuvmrux/settings/database');
    console.log('\nThen run:');
    console.log('SUPABASE_DB_PASSWORD="your-password" node scripts/run-migration.js');
    console.log('='.repeat(60));
    process.exit(1);
  }

  const connectionString = `postgresql://${DB_USER}:${password}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

  console.log('Connecting to Supabase PostgreSQL...');
  console.log(`Host: ${DB_HOST}`);
  console.log(`Database: ${DB_NAME}`);
  console.log(`User: ${DB_USER}`);

  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('Connected!\n');

    // Read migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20251231000003_safe_engagement_tables.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Running migration...\n');

    // Split by semicolons and run each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      try {
        // Skip SELECT statements (they're just for output)
        if (statement.toUpperCase().startsWith('SELECT')) {
          const result = await client.query(statement);
          if (result.rows && result.rows.length > 0) {
            console.log('Result:', result.rows[0]);
          }
          continue;
        }

        await client.query(statement);

        // Log what was done
        const action = statement.split(' ').slice(0, 4).join(' ');
        if (action.includes('CREATE TABLE')) {
          const tableName = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/i)?.[1];
          console.log(`✓ Created table: ${tableName}`);
        } else if (action.includes('CREATE INDEX')) {
          const indexName = statement.match(/CREATE INDEX IF NOT EXISTS (\w+)/i)?.[1];
          console.log(`✓ Created index: ${indexName}`);
        } else if (action.includes('ALTER TABLE')) {
          console.log(`✓ ${action.substring(0, 50)}...`);
        } else if (action.includes('DROP POLICY')) {
          console.log(`✓ Dropped old policy`);
        } else if (action.includes('CREATE POLICY')) {
          console.log(`✓ Created policy`);
        } else if (action.includes('INSERT INTO')) {
          console.log(`✓ Inserted data`);
        }

        successCount++;
      } catch (err) {
        // Ignore "already exists" errors
        if (err.message.includes('already exists')) {
          console.log(`○ Already exists, skipping`);
        } else {
          console.log(`✗ Error: ${err.message.substring(0, 100)}`);
          errorCount++;
        }
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`Migration complete!`);
    console.log(`Successful: ${successCount} | Errors: ${errorCount}`);
    console.log(`${'='.repeat(60)}`);

    // Refresh PostgREST schema cache
    console.log('\nRefreshing PostgREST schema cache...');
    await client.query("NOTIFY pgrst, 'reload schema'");
    console.log('✓ Schema cache refresh requested');

    // Verify tables
    console.log('\nVerifying tables...');
    const tablesQuery = `
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename IN ('user_analytics', 'user_sessions', 'user_activity_log',
                        'user_preferences', 'engagement_recommendations',
                        'investor_metrics', 'user_milestones')
      ORDER BY tablename
    `;
    const tables = await client.query(tablesQuery);
    console.log('Found tables:', tables.rows.map(r => r.tablename).join(', '));

  } catch (err) {
    console.error('Connection error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
