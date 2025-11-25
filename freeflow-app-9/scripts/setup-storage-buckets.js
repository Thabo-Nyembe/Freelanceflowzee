#!/usr/bin/env node
/**
 * Kazi Storage Buckets Setup
 * Creates all required storage buckets
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

const BUCKETS = [
  {
    name: 'avatars',
    public: true,
    fileSizeLimit: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
  },
  {
    name: 'files',
    public: false,
    fileSizeLimit: 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: null
  },
  {
    name: 'videos',
    public: false,
    fileSizeLimit: 500 * 1024 * 1024, // 500MB
    allowedMimeTypes: ['video/mp4', 'video/webm', 'video/mov', 'video/avi']
  },
  {
    name: 'images',
    public: true,
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml']
  },
  {
    name: 'documents',
    public: false,
    fileSizeLimit: 25 * 1024 * 1024, // 25MB
    allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  },
  {
    name: 'exports',
    public: false,
    fileSizeLimit: 100 * 1024 * 1024, // 100MB
    allowedMimeTypes: null
  }
]

async function createBucket(bucket) {
  console.log(`\n📦 Creating bucket: ${bucket.name}`)

  try {
    // Check if bucket already exists
    const { data: existing } = await supabase.storage.getBucket(bucket.name)

    if (existing) {
      console.log(`   ℹ️  Bucket already exists: ${bucket.name}`)
      return true
    }

    // Create bucket
    const { data, error } = await supabase.storage.createBucket(bucket.name, {
      public: bucket.public,
      fileSizeLimit: bucket.fileSizeLimit,
      allowedMimeTypes: bucket.allowedMimeTypes
    })

    if (error) {
      console.log(`   ❌ Error: ${error.message}`)
      return false
    }

    const visibility = bucket.public ? '🌐 public' : '🔒 private'
    console.log(`   ✅ Created: ${bucket.name} (${visibility})`)

    // Add storage policy for private buckets
    if (!bucket.public) {
      console.log(`   🔐 Adding RLS policy for ${bucket.name}...`)

      const policySQL = `
        CREATE POLICY "Users can manage their own ${bucket.name}"
        ON storage.objects
        FOR ALL
        USING (bucket_id = '${bucket.name}' AND auth.uid()::text = (storage.foldername(name))[1])
        WITH CHECK (bucket_id = '${bucket.name}' AND auth.uid()::text = (storage.foldername(name))[1]);
      `

      // Note: This would need to be run via SQL editor
      console.log(`   💡 Run this SQL to add policy:`)
      console.log(`      ${policySQL.trim()}`)
    }

    return true

  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
    return false
  }
}

async function setupStorageBuckets() {
  console.log('📦 Kazi Storage Buckets Setup')
  console.log('='.repeat(60))
  console.log(`📍 URL: ${SUPABASE_URL}`)
  console.log('='.repeat(60))

  let successCount = 0

  for (const bucket of BUCKETS) {
    const success = await createBucket(bucket)
    if (success) successCount++
  }

  console.log('')
  console.log('='.repeat(60))
  console.log(`📊 Summary: ${successCount}/${BUCKETS.length} buckets configured`)
  console.log('='.repeat(60))

  if (successCount === BUCKETS.length) {
    console.log('✅ All storage buckets configured!')
  } else {
    console.log('⚠️  Some buckets need manual configuration')
    console.log('')
    console.log('💡 Alternative: Create buckets manually at:')
    const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
    console.log(`   https://supabase.com/dashboard/project/${projectRef}/storage/buckets`)
  }

  console.log('')
}

setupStorageBuckets().catch(console.error)
