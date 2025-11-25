#!/usr/bin/env tsx
/**
 * Database Migration Script
 * Applies all pending migrations to Supabase database
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials!')
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function applyMigration(filePath: string, fileName: string) {
  console.log(`\n📄 Applying migration: ${fileName}`)

  try {
    const sql = readFileSync(filePath, 'utf-8')

    // Skip if file is empty or only has comments
    const cleanSQL = sql.replace(/--.*$/gm, '').trim()
    if (!cleanSQL) {
      console.log(`⏭️  Skipped (empty file)`)
      return
    }

    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql })

    if (error) {
      console.error(`❌ Error applying ${fileName}:`, error.message)
      return false
    }

    console.log(`✅ Successfully applied ${fileName}`)
    return true
  } catch (error: any) {
    console.error(`❌ Error reading ${fileName}:`, error.message)
    return false
  }
}

async function applyAllMigrations() {
  console.log('🚀 Starting database migration...\n')
  console.log(`📍 Target: ${SUPABASE_URL}`)

  const migrationsDir = join(process.cwd(), 'supabase', 'migrations')

  try {
    const files = readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort() // Apply in alphabetical order

    console.log(`\n📦 Found ${files.length} migration files\n`)

    let successCount = 0
    let failCount = 0

    // Priority migrations first
    const priorityFiles = [
      'MASTER_COMPLETE_SETUP.sql',
      '00000000000000_init_schema.sql',
      '20251125_ai_features.sql'
    ]

    // Apply priority migrations
    for (const fileName of priorityFiles) {
      if (files.includes(fileName)) {
        const filePath = join(migrationsDir, fileName)
        const result = await applyMigration(filePath, fileName)
        result ? successCount++ : failCount++
      }
    }

    // Apply remaining migrations
    const remainingFiles = files.filter(f => !priorityFiles.includes(f))
    for (const fileName of remainingFiles) {
      const filePath = join(migrationsDir, fileName)
      const result = await applyMigration(filePath, fileName)
      result ? successCount++ : failCount++
    }

    console.log('\n' + '='.repeat(60))
    console.log(`📊 Migration Summary:`)
    console.log(`   ✅ Successful: ${successCount}`)
    console.log(`   ❌ Failed: ${failCount}`)
    console.log(`   📦 Total: ${files.length}`)
    console.log('='.repeat(60) + '\n')

    if (failCount === 0) {
      console.log('🎉 All migrations applied successfully!')
    } else {
      console.log('⚠️  Some migrations failed. Check errors above.')
    }

  } catch (error: any) {
    console.error('❌ Fatal error:', error.message)
    process.exit(1)
  }
}

// Run migrations
applyAllMigrations()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
