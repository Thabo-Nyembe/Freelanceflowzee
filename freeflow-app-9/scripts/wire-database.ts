#!/usr/bin/env node
/**
 * Database Wiring Script - Applies migrations via Supabase Management API
 * This script wires up all database features for Kazi
 */

import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gcinvwprtlnwuwuvmrux.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const PROJECT_REF = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'gcinvwprtlnwuwuvmrux'

console.log('🔧 Kazi Database Wiring Tool')
console.log('='.repeat(60))
console.log(`📍 Project: ${PROJECT_REF}`)
console.log(`🌐 URL: ${SUPABASE_URL}`)
console.log('='.repeat(60))
console.log('')

// Read migration files
const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations')
const migrations = [
  'MASTER_COMPLETE_SETUP.sql',
  '20251125_ai_features.sql'
]

console.log('📋 Migration Plan:')
migrations.forEach((file, idx) => {
  const filePath = path.join(migrationsDir, file)
  const exists = fs.existsSync(filePath)
  console.log(`  ${idx + 1}. ${file} ${exists ? '✅' : '❌ NOT FOUND'}`)
})
console.log('')

console.log('📝 Instructions to Wire Database:')
console.log('')
console.log('OPTION 1: Via Supabase Dashboard (Recommended)')
console.log('─'.repeat(60))
console.log('1. Open Supabase SQL Editor:')
console.log(`   https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`)
console.log('')
console.log('2. Copy and run MASTER_COMPLETE_SETUP.sql:')
console.log(`   File: ${path.join(migrationsDir, 'MASTER_COMPLETE_SETUP.sql')}`)
console.log('')
console.log('3. Copy and run 20251125_ai_features.sql:')
console.log(`   File: ${path.join(migrationsDir, '20251125_ai_features.sql')}`)
console.log('')
console.log('4. Verify tables created:')
console.log(`   https://supabase.com/dashboard/project/${PROJECT_REF}/editor`)
console.log('')

console.log('OPTION 2: Via CLI (If you have database password)')
console.log('─'.repeat(60))
console.log('Run this command in your terminal:')
console.log('')
console.log(`psql "postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres" -f supabase/migrations/MASTER_COMPLETE_SETUP.sql`)
console.log('')

console.log('OPTION 3: Auto-wire (macOS with clipboard)')
console.log('─'.repeat(60))

// Check if on macOS
if (process.platform === 'darwin') {
  console.log('✅ macOS detected! Running auto-wire...')
  console.log('')

  // Copy first migration to clipboard
  const masterSQL = fs.readFileSync(path.join(migrationsDir, 'MASTER_COMPLETE_SETUP.sql'), 'utf-8')

  // Use pbcopy to copy to clipboard
  try {
    execSync('pbcopy', { input: masterSQL })
    console.log('✅ MASTER_COMPLETE_SETUP.sql copied to clipboard!')
    console.log('')
    console.log('Opening Supabase SQL Editor...')
    execSync(`open "https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new"`)
    console.log('')
    console.log('📌 NEXT STEPS:')
    console.log('  1. Paste the SQL (Cmd+V) in the editor that just opened')
    console.log('  2. Click "Run" or press Cmd+Enter')
    console.log('  3. Wait for success message')
    console.log('  4. Run this script again for the next migration')
    console.log('')
  } catch (error) {
    console.error('❌ Error copying to clipboard:', error)
  }
} else {
  console.log('Manual copy required (not on macOS)')
}

console.log('')
console.log('📦 Storage Buckets Needed:')
console.log('─'.repeat(60))
console.log('Create these buckets in Supabase Storage:')
console.log(`  https://supabase.com/dashboard/project/${PROJECT_REF}/storage/buckets`)
console.log('')
console.log('  1. avatars      (public)  - User profile pictures')
console.log('  2. files        (private) - User uploaded files')
console.log('  3. videos       (private) - Video projects')
console.log('  4. images       (public)  - Public images')
console.log('  5. documents    (private) - Documents and PDFs')
console.log('  6. exports      (private) - Exported files')
console.log('')

console.log('🔐 Storage Policies to Add:')
console.log('─'.repeat(60))
console.log('For each bucket, add this policy:')
console.log('')
console.log('Policy Name: "Users can upload their own files"')
console.log('Definition:')
console.log('  (bucket_id = \'BUCKET_NAME\' AND auth.uid() = owner)')
console.log('')

console.log('')
console.log('✅ Database wiring guide generated!')
console.log('Follow the instructions above to complete the setup.')
console.log('')
