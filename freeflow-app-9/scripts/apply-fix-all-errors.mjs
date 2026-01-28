#!/usr/bin/env node
/**
 * Apply FIX_ALL_ERRORS.sql migration to Supabase
 *
 * Usage:
 *   export SUPABASE_DB_PASSWORD='your-db-password'
 *   node scripts/apply-fix-all-errors.mjs
 *
 * Or run with password as argument:
 *   node scripts/apply-fix-all-errors.mjs YOUR_DB_PASSWORD
 */

import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const PROJECT_REF = 'gcinvwprtlnwuwuvmrux'

async function applyMigration() {
  // Get password from env or args
  const password = process.argv[2] || process.env.SUPABASE_DB_PASSWORD

  if (!password) {
    console.log(`
╔════════════════════════════════════════════════════════════════════╗
║  SUPABASE DATABASE PASSWORD REQUIRED                               ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  To find your database password:                                   ║
║                                                                    ║
║  1. Go to: https://supabase.com/dashboard/project/${PROJECT_REF}   ║
║  2. Click "Project Settings" (gear icon) in the sidebar            ║
║  3. Click "Database" in the settings menu                          ║
║  4. Under "Connection string", find the password or click          ║
║     "Reset database password" if needed                            ║
║                                                                    ║
║  Then run:                                                         ║
║                                                                    ║
║    export SUPABASE_DB_PASSWORD='your-password-here'                ║
║    node scripts/apply-fix-all-errors.mjs                           ║
║                                                                    ║
║  Or:                                                               ║
║    node scripts/apply-fix-all-errors.mjs 'your-password-here'      ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
`)
    process.exit(1)
  }

  // Supabase direct database connection
  const connectionString = `postgresql://postgres.${PROJECT_REF}:${password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`

  console.log('Connecting to Supabase database...')

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    console.log('Connected successfully!\n')

    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'supabase', 'FIX_ALL_ERRORS.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    console.log('Executing FIX_ALL_ERRORS.sql...\n')
    console.log('This will:')
    console.log('  1. Fix team_members RLS infinite recursion')
    console.log('  2. Create 12 missing tables')
    console.log('  3. Add performance indexes\n')

    // Execute the SQL
    const result = await client.query(sql)

    console.log('Migration completed successfully!')
    console.log('\nResult:', result?.rows?.[0] || 'Success')

    // Verify tables were created
    console.log('\nVerifying new tables...')
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN (
        'reminders', 'scheduling_preferences', 'conversion_funnels',
        'conversion_goals', 'cohorts', 'growth_experiments',
        'certification_courses', 'organization_members', 'coupons',
        'thread_participants', 'mentions', 'phone_numbers'
      )
      ORDER BY table_name
    `)

    console.log(`Found ${tables.rows.length}/12 new tables:`)
    tables.rows.forEach(row => console.log(`  - ${row.table_name}`))

    // Check team_members policies
    console.log('\nVerifying team_members policies...')
    const policies = await client.query(`
      SELECT policyname FROM pg_policies WHERE tablename = 'team_members'
    `)
    console.log(`Found ${policies.rows.length} policies:`)
    policies.rows.forEach(row => console.log(`  - ${row.policyname}`))

    console.log('\n✅ All fixes applied successfully!')
    console.log('\nNext step: Run the error check to verify:')
    console.log('  node scripts/check-all-errors.mjs')

  } catch (error) {
    console.error('\n❌ Migration failed!')
    console.error('Error:', error.message)

    if (error.message.includes('password authentication failed')) {
      console.log('\nThe password is incorrect. Please check your database password.')
      console.log(`Go to: https://supabase.com/dashboard/project/${PROJECT_REF}/settings/database`)
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.log('\nCould not connect to the database. Check your internet connection.')
    } else {
      console.log('\nFull error:', error)
    }
    process.exit(1)
  } finally {
    await client.end()
  }
}

applyMigration()
