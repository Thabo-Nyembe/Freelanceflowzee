/**
 * Run database migration using pg (postgres) driver
 */

import { Pool } from 'pg'
import * as fs from 'fs'

const password = 'qUCPaWXy1jpgakyE'

// Try different connection formats for Supabase
const connectionStrings = [
  // Session mode pooler (from CLI error message format)
  {
    name: 'Session pooler (aws-1)',
    url: `postgres://postgres.gcinvwprtlnwuwuvmrux:${password}@aws-1-eu-north-1.pooler.supabase.com:5432/postgres`
  },
  // Transaction mode pooler
  {
    name: 'Transaction pooler (aws-0, port 6543)',
    url: `postgres://postgres.gcinvwprtlnwuwuvmrux:${password}@aws-0-eu-north-1.pooler.supabase.com:6543/postgres`
  },
  // Direct with different user format
  {
    name: 'Direct postgres user',
    url: `postgres://postgres:${password}@aws-0-eu-north-1.pooler.supabase.com:5432/postgres`
  },
]

async function tryConnection(connStr: string, name: string): Promise<Pool | null> {
  const pool = new Pool({
    connectionString: connStr,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
  })

  try {
    const client = await pool.connect()
    console.log(`✅ Connected using: ${name}`)
    client.release()
    return pool
  } catch (err: any) {
    console.log(`❌ ${name}: ${err.message}`)
    await pool.end().catch(() => {})
    return null
  }
}

async function runMigration() {
  console.log('========================================')
  console.log('Running Database Migration')
  console.log('========================================\n')

  // Try each connection string
  let pool: Pool | null = null

  console.log('Testing connection strings...\n')

  for (const conn of connectionStrings) {
    pool = await tryConnection(conn.url, conn.name)
    if (pool) break
  }

  if (!pool) {
    console.log('\n❌ All connection attempts failed.')
    console.log('\nPlease run the migration manually:')
    console.log('1. Go to: https://supabase.com/dashboard/project/gcinvwprtlnwuwuvmrux/sql')
    console.log('2. Copy contents of: supabase/migrations/20260127_add_missing_columns.sql')
    console.log('3. Paste and click "Run"')
    process.exit(1)
  }

  const client = await pool.connect()

  try {
    // Read the migration file
    const migrationPath = 'supabase/migrations/20260127_add_missing_columns.sql'
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

    console.log('\nRunning migration:', migrationPath)
    console.log('Size:', migrationSQL.length, 'characters\n')

    // Execute the migration
    console.log('Executing SQL...\n')
    await client.query(migrationSQL)

    console.log('✅ Migration completed successfully!\n')

    // Verify by checking columns
    console.log('Verifying schema changes...\n')

    const invoicesResult = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'invoices' ORDER BY ordinal_position
    `)
    console.log('INVOICES columns:', invoicesResult.rows.map(r => r.column_name).join(', '))

    const projectsResult = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'projects' ORDER BY ordinal_position
    `)
    console.log('PROJECTS columns:', projectsResult.rows.map(r => r.column_name).join(', '))

    console.log('\n========================================')
    console.log('Migration Complete!')
    console.log('========================================')

  } catch (err) {
    console.error('Migration failed:', err)
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

runMigration().catch(console.error)
