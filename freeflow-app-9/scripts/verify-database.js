#!/usr/bin/env node
/**
 * Kazi Database Verification Script
 * Checks if all tables and storage buckets are properly configured
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const REQUIRED_TABLES = [
  'profiles',
  'clients',
  'projects',
  'invoices',
  'files',
  'tasks',
  'messages',
  'notifications',
  'investor_metrics_events',
  'revenue_intelligence',
  'lead_scores',
  'growth_playbooks',
  'ai_feature_usage',
  'ai_recommendations',
  'user_metrics_aggregate'
]

const REQUIRED_BUCKETS = [
  'avatars',
  'files',
  'videos',
  'images',
  'documents',
  'exports'
]

async function verifyDatabase() {
  console.log('🔍 Kazi Database Verification')
  console.log('='.repeat(60))
  console.log(`📍 URL: ${SUPABASE_URL}`)
  console.log('='.repeat(60))
  console.log('')

  let allGood = true

  // Check connection
  console.log('📡 Checking connection...')
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(0)
    if (error && error.code === '42P01') {
      console.log('   ⚠️  Profiles table not found - migrations may not be applied')
      allGood = false
    } else {
      console.log('   ✅ Connection successful!')
    }
  } catch (error) {
    console.log(`   ❌ Connection failed: ${error.message}`)
    allGood = false
  }

  console.log('')

  // Check tables
  console.log('📋 Checking tables...')
  let tablesFound = 0

  for (const table of REQUIRED_TABLES) {
    try {
      const { error } = await supabase.from(table).select('count').limit(0)

      if (error) {
        if (error.code === '42P01') {
          console.log(`   ❌ ${table} - NOT FOUND`)
          allGood = false
        } else if (error.code === 'PGRST116') {
          console.log(`   ⚠️  ${table} - No RLS policy (normal for empty table)`)
          tablesFound++
        } else {
          console.log(`   ⚠️  ${table} - ${error.message}`)
        }
      } else {
        console.log(`   ✅ ${table}`)
        tablesFound++
      }
    } catch (error) {
      console.log(`   ❌ ${table} - Error: ${error.message}`)
      allGood = false
    }
  }

  console.log(`\n   📊 Tables found: ${tablesFound}/${REQUIRED_TABLES.length}`)

  if (tablesFound < REQUIRED_TABLES.length) {
    console.log('\n   💡 Missing tables? Run migrations:')
    console.log('      node scripts/wire-database.ts')
    allGood = false
  }

  console.log('')

  // Check storage buckets
  console.log('📦 Checking storage buckets...')
  let bucketsFound = 0

  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      console.log(`   ❌ Could not list buckets: ${error.message}`)
      allGood = false
    } else {
      const bucketNames = buckets.map(b => b.name)

      for (const bucket of REQUIRED_BUCKETS) {
        if (bucketNames.includes(bucket)) {
          const bucketInfo = buckets.find(b => b.name === bucket)
          const visibility = bucketInfo.public ? '🌐 public' : '🔒 private'
          console.log(`   ✅ ${bucket} (${visibility})`)
          bucketsFound++
        } else {
          console.log(`   ❌ ${bucket} - NOT FOUND`)
          allGood = false
        }
      }

      console.log(`\n   📊 Buckets found: ${bucketsFound}/${REQUIRED_BUCKETS.length}`)

      if (bucketsFound < REQUIRED_BUCKETS.length) {
        console.log('\n   💡 Create missing buckets at:')
        const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
        console.log(`      https://supabase.com/dashboard/project/${projectRef}/storage/buckets`)
        allGood = false
      }
    }
  } catch (error) {
    console.log(`   ❌ Error checking buckets: ${error.message}`)
    allGood = false
  }

  console.log('')

  // Check auth
  console.log('🔐 Checking authentication...')
  try {
    const { data: { users }, error } = await supabase.auth.admin.listUsers()

    if (error) {
      console.log(`   ⚠️  Cannot list users (need service key): ${error.message}`)
    } else {
      console.log(`   ✅ Auth working! ${users.length} users registered`)
    }
  } catch (error) {
    console.log(`   ⚠️  Auth check skipped: ${error.message}`)
  }

  console.log('')
  console.log('='.repeat(60))

  if (allGood && tablesFound === REQUIRED_TABLES.length && bucketsFound === REQUIRED_BUCKETS.length) {
    console.log('🎉 DATABASE FULLY WIRED!')
    console.log('✅ All systems operational')
    console.log('')
    console.log('Next steps:')
    console.log('  1. Start dev server: npm run dev')
    console.log('  2. Visit: http://localhost:9323')
    console.log('  3. Sign up and test features!')
    console.log('')
  } else {
    console.log('⚠️  DATABASE PARTIALLY CONFIGURED')
    console.log('')
    console.log('Required actions:')

    if (tablesFound < REQUIRED_TABLES.length) {
      console.log('  1. Apply database migrations')
      console.log('     → node scripts/wire-database.ts')
    }

    if (bucketsFound < REQUIRED_BUCKETS.length) {
      console.log('  2. Create storage buckets')
      const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
      console.log(`     → https://supabase.com/dashboard/project/${projectRef}/storage/buckets`)
    }

    console.log('')
    console.log('See DATABASE_WIRING_GUIDE.md for detailed instructions')
    console.log('')
  }

  console.log('='.repeat(60))
}

verifyDatabase().catch(console.error)
