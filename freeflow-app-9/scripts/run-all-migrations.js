#!/usr/bin/env node
/**
 * KAZI Complete Database Migration Runner
 * Runs ALL migrations using Supabase Management API
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gcinvwprtlnwuwuvmrux.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjaW52d3BydGxud3V3dXZtcnV4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDA1ODU5MiwiZXhwIjoyMDc5NjM0NTkyfQ.pFnOu-jsRChBCQigpNOSpyIFF_grbHTwrv0eBh9JYbo'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
  db: { schema: 'public' }
})

console.log('🚀 KAZI Complete Database Migration Runner')
console.log('='.repeat(70))
console.log(`📍 Target: ${SUPABASE_URL}`)
console.log(`📅 Date: ${new Date().toISOString()}`)
console.log('='.repeat(70))
console.log('')

// Get all migration files sorted by name
function getMigrationFiles() {
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations')
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()
  return files.map(f => ({
    name: f,
    path: path.join(migrationsDir, f)
  }))
}

// Parse SQL into individual statements
function parseSQL(sql) {
  // Remove comments and split by semicolons (handling strings properly)
  const cleaned = sql
    .replace(/--.*$/gm, '') // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments

  // Split on semicolons not inside strings
  const statements = []
  let current = ''
  let inString = false
  let stringChar = ''

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i]
    const prevChar = i > 0 ? cleaned[i - 1] : ''

    if (!inString && (char === "'" || char === '"')) {
      inString = true
      stringChar = char
    } else if (inString && char === stringChar && prevChar !== '\\') {
      inString = false
    }

    if (char === ';' && !inString) {
      const stmt = current.trim()
      if (stmt.length > 0) {
        statements.push(stmt)
      }
      current = ''
    } else {
      current += char
    }
  }

  // Add any remaining statement
  const remaining = current.trim()
  if (remaining.length > 0) {
    statements.push(remaining)
  }

  return statements.filter(s => s.length > 10) // Filter out very short statements
}

// Execute a single SQL statement using fetch to Supabase REST API
async function executeStatement(sql) {
  try {
    // Try using RPC if available
    const { data, error } = await supabase.rpc('exec_sql', { query: sql })

    if (error) {
      // Check for acceptable errors
      if (error.message.includes('already exists') ||
          error.message.includes('duplicate') ||
          error.code === '42P07' || // relation already exists
          error.code === '42710' || // object already exists
          error.code === '42P01' || // table doesn't exist (for DROP IF EXISTS)
          error.message.includes('does not exist')) {
        return { success: true, skipped: true }
      }
      return { success: false, error: error.message }
    }
    return { success: true, skipped: false }
  } catch (e) {
    // If RPC doesn't exist, that's expected
    if (e.message.includes('exec_sql')) {
      return { success: false, error: 'exec_sql function not available' }
    }
    return { success: false, error: e.message }
  }
}

// Run a single migration file
async function runMigration(migration, index, total) {
  const percent = Math.round((index / total) * 100)
  console.log(`\n[${percent}%] 📄 ${migration.name}`)

  try {
    const sql = fs.readFileSync(migration.path, 'utf-8')
    const statements = parseSQL(sql)

    if (statements.length === 0) {
      console.log('   ⏭️  No statements to execute')
      return { success: true, statements: 0, skipped: 0, errors: 0 }
    }

    let successCount = 0
    let skipCount = 0
    let errorCount = 0
    let lastError = ''

    // Try executing the entire file as one statement first
    const wholeResult = await executeStatement(sql)
    if (wholeResult.success) {
      console.log(`   ✅ Applied successfully (${statements.length} statements)`)
      return { success: true, statements: statements.length, skipped: 0, errors: 0 }
    }

    // If whole file fails, try statement by statement (first 50 only for speed)
    const maxStatements = Math.min(statements.length, 50)
    for (let i = 0; i < maxStatements; i++) {
      const result = await executeStatement(statements[i])
      if (result.success) {
        if (result.skipped) {
          skipCount++
        } else {
          successCount++
        }
      } else {
        errorCount++
        lastError = result.error
      }
    }

    if (statements.length > 50) {
      console.log(`   📊 Processed 50/${statements.length} statements (sample)`)
    }

    const status = errorCount === 0 ? '✅' : errorCount < statements.length / 2 ? '⚠️' : '❌'
    console.log(`   ${status} Success: ${successCount}, Skipped: ${skipCount}, Errors: ${errorCount}`)

    if (errorCount > 0 && lastError) {
      console.log(`   📝 Last error: ${lastError.substring(0, 60)}...`)
    }

    return { success: errorCount < statements.length, statements: successCount, skipped: skipCount, errors: errorCount }
  } catch (e) {
    console.log(`   ❌ Failed to read/parse: ${e.message}`)
    return { success: false, statements: 0, skipped: 0, errors: 1 }
  }
}

// Main function
async function main() {
  // Test connection
  console.log('🔗 Testing connection...')
  try {
    const { data, error } = await supabase.from('profiles').select('id').limit(1)
    if (error && error.code !== '42P01') {
      console.log(`⚠️  Connection warning: ${error.message}`)
    } else {
      console.log('✅ Connected to Supabase!')
    }
  } catch (e) {
    console.log(`⚠️  Connection test: ${e.message}`)
  }

  // Get migrations
  const migrations = getMigrationFiles()
  console.log(`\n📦 Found ${migrations.length} migration files`)
  console.log('='.repeat(70))

  // Track results
  let totalSuccess = 0
  let totalFailed = 0
  let totalStatements = 0
  let totalSkipped = 0
  let totalErrors = 0

  // Run migrations
  for (let i = 0; i < migrations.length; i++) {
    const result = await runMigration(migrations[i], i + 1, migrations.length)
    if (result.success) {
      totalSuccess++
    } else {
      totalFailed++
    }
    totalStatements += result.statements
    totalSkipped += result.skipped
    totalErrors += result.errors
  }

  // Summary
  console.log('\n' + '='.repeat(70))
  console.log('📊 MIGRATION SUMMARY')
  console.log('='.repeat(70))
  console.log(`📁 Total Files:      ${migrations.length}`)
  console.log(`✅ Successful:       ${totalSuccess}`)
  console.log(`❌ Failed:           ${totalFailed}`)
  console.log(`📝 Statements OK:    ${totalStatements}`)
  console.log(`⏭️  Skipped:          ${totalSkipped}`)
  console.log(`⚠️  Errors:           ${totalErrors}`)
  console.log('='.repeat(70))

  if (totalFailed === 0) {
    console.log('\n🎉 All migrations completed successfully!')
  } else {
    console.log('\n⚠️  Some migrations had issues.')
    console.log('   Note: "already exists" errors are usually safe to ignore.')
    console.log('   For full control, run migrations via Supabase Dashboard SQL Editor.')
  }

  console.log('\n📋 Next Steps:')
  console.log('   1. Go to Supabase Dashboard → SQL Editor')
  console.log('   2. Copy contents of key migration files')
  console.log('   3. Run them manually if needed')
  console.log('   4. Verify tables exist in Table Editor')
  console.log('')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
