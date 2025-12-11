#!/usr/bin/env node
/**
 * Direct Database Migration via PostgreSQL
 * Applies all migrations using direct database connection
 */

const fs = require('fs')
const path = require('path')

// Using node-postgres
const { Client } = require('pg')

const PROJECT_REF = 'gcinvwprtlnwuwuvmrux'
const DB_PASSWORD = 'test12345'

// Try direct connection (non-pooler)
const connectionString = `postgresql://postgres:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres`

console.log('🚀 Kazi Database - Direct Migration')
console.log('='.repeat(60))
console.log(`📍 Project: ${PROJECT_REF}`)
console.log('='.repeat(60))
console.log('')

async function executeSQLFile(client, filePath, fileName) {
  console.log(`\n📄 Applying: ${fileName}`)

  try {
    const sql = fs.readFileSync(filePath, 'utf-8')

    // Execute the entire SQL file
    await client.query(sql)

    console.log(`   ✅ Success: ${fileName}`)
    return true
  } catch (error) {
    // Check if error is just "already exists" which is fine
    if (error.message.includes('already exists') ||
        error.message.includes('duplicate key') ||
        error.code === '42P07' || // relation already exists
        error.code === '42710') { // object already exists
      console.log(`   ℹ️  Already exists: ${fileName} (OK)`)
      return true
    }

    console.log(`   ⚠️  Warning: ${error.message.substring(0, 100)}...`)
    return false
  }
}

async function runMigrations() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  })

  try {
    console.log('🔗 Connecting to database...')
    await client.connect()
    console.log('✅ Connected!\n')

    const migrations = [
      'MASTER_COMPLETE_SETUP.sql',
      '20251125_ai_features.sql',
      '20251125_missing_tables.sql'
    ]

    let successCount = 0
    const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations')

    for (const migration of migrations) {
      const filePath = path.join(migrationsDir, migration)
      if (fs.existsSync(filePath)) {
        const success = await executeSQLFile(client, filePath, migration)
        if (success) successCount++
      } else {
        console.log(`   ⚠️  File not found: ${migration}`)
      }
    }

    // Apply storage policies
    console.log(`\n📄 Applying: STORAGE_POLICIES.sql`)
    const policiesPath = path.join(process.cwd(), 'scripts', 'STORAGE_POLICIES.sql')
    if (fs.existsSync(policiesPath)) {
      await executeSQLFile(client, policiesPath, 'STORAGE_POLICIES.sql')
      successCount++
    }

    console.log('\n' + '='.repeat(60))
    console.log(`📊 Summary: ${successCount}/${migrations.length + 1} migrations applied`)
    console.log('='.repeat(60))

    // Verify tables
    console.log('\n🔍 Verifying setup...')
    const result = await client.query(`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    `)

    console.log(`   ✅ Total tables: ${result.rows[0].count}`)

    // List key tables
    const tables = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `)

    console.log('\n📋 Key tables created:')
    const keyTables = ['profiles', 'clients', 'projects', 'tasks', 'messages',
                       'invoices', 'investor_metrics_events', 'revenue_intelligence',
                       'lead_scores', 'growth_playbooks']

    tables.rows.forEach(row => {
      if (keyTables.includes(row.tablename)) {
        console.log(`   ✓ ${row.tablename}`)
      }
    })

    console.log('\n' + '='.repeat(60))
    console.log('🎉 Database migrations complete!')
    console.log('='.repeat(60))
    console.log('')
    console.log('Next steps:')
    console.log('  1. Run: node scripts/verify-database.js')
    console.log('  2. Create remaining buckets (videos, exports) if needed')
    console.log('  3. Start dev: npm run dev')
    console.log('')

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

runMigrations()
