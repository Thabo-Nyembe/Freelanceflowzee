#!/usr/bin/env node
/**
 * Create remaining storage buckets with correct size limits
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function createBucket(name, isPublic, fileSizeLimit) {
  console.log(`\n📦 Creating bucket: ${name}`)

  try {
    // Try to create with no file size limit (let Supabase use default)
    const { data, error } = await supabase.storage.createBucket(name, {
      public: isPublic,
      fileSizeLimit: null // Use Supabase default
    })

    if (error) {
      if (error.message.includes('already exists')) {
        console.log(`   ✅ Already exists: ${name}`)
        return true
      }
      console.log(`   ❌ Error: ${error.message}`)
      return false
    }

    const visibility = isPublic ? '🌐 public' : '🔒 private'
    console.log(`   ✅ Created: ${name} (${visibility})`)
    return true

  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
    return false
  }
}

async function main() {
  console.log('📦 Creating Remaining Storage Buckets')
  console.log('='.repeat(60))
  console.log('')

  const buckets = [
    { name: 'videos', public: false },
    { name: 'exports', public: false }
  ]

  let successCount = 0

  for (const bucket of buckets) {
    const success = await createBucket(bucket.name, bucket.public, null)
    if (success) successCount++
  }

  console.log('')
  console.log('='.repeat(60))
  console.log(`✅ Created: ${successCount}/${buckets.length} buckets`)
  console.log('='.repeat(60))
  console.log('')

  if (successCount === buckets.length) {
    console.log('🎉 All storage buckets configured!')
    console.log('')
    console.log('Running verification...')
    console.log('')

    // Run verification
    require('child_process').execSync('node scripts/verify-database.js', { stdio: 'inherit' })
  } else {
    console.log('⚠️  Some buckets need manual creation')
    console.log('Visit: https://supabase.com/dashboard/project/gcinvwprtlnwuwuvmrux/storage/buckets')
  }
}

main().catch(console.error)
