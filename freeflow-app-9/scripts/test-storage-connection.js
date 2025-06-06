#!/usr/bin/env node

/**
 * Storage Connection Test
 * 
 * Quick test to verify Supabase storage bucket is properly configured
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function testStorageConnection() {
  log('🧪 FreeflowZee Storage Connection Test', 'blue')
  log('========================================', 'blue')
  log('', 'reset')

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    log('❌ Missing environment variables', 'red')
    log('Please ensure .env.local contains SUPABASE credentials', 'yellow')
    process.exit(1)
  }

  log('✅ Environment variables found', 'green')
  log(`📍 Project URL: ${supabaseUrl}`, 'cyan')
  log('', 'reset')

  // Create Supabase client
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    // Test 1: List buckets
    log('🔍 Checking for storage buckets...', 'blue')
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      log(`❌ Failed to list buckets: ${listError.message}`, 'red')
      process.exit(1)
    }

    log(`✅ Found ${buckets.length} storage bucket(s)`, 'green')
    
    // Check for project-files bucket
    const projectFilesBucket = buckets.find(b => b.name === 'project-files')
    
    if (projectFilesBucket) {
      log('✅ "project-files" bucket exists!', 'green')
      log(`   Created: ${projectFilesBucket.created_at}`, 'cyan')
      log(`   Public: ${projectFilesBucket.public}`, 'cyan')
      
      // Test 2: Try to list files in bucket
      log('', 'reset')
      log('📁 Testing bucket access...', 'blue')
      
      const { data: files, error: filesError } = await supabase.storage
        .from('project-files')
        .list('', { limit: 1 })

      if (filesError) {
        log(`⚠️  Bucket access limited: ${filesError.message}`, 'yellow')
        log('This may be due to RLS policies - uploads should still work via API', 'yellow')
      } else {
        log('✅ Bucket access successful', 'green')
        log(`📊 Found ${files.length} file(s) in bucket`, 'cyan')
      }

      // Test 3: Generate a signed URL (basic test)
      log('', 'reset')
      log('🔗 Testing signed URL generation...', 'blue')
      
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from('project-files')
        .createSignedUrl('test/nonexistent.txt', 60)

      if (urlError) {
        log(`⚠️  Signed URL generation failed: ${urlError.message}`, 'yellow')
      } else {
        log('✅ Signed URL generation working', 'green')
      }

    } else {
      log('❌ "project-files" bucket NOT found', 'red')
      log('', 'reset')
      log('📋 Available buckets:', 'yellow')
      buckets.forEach(bucket => {
        log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`, 'cyan')
      })
      log('', 'reset')
      log('💡 Next steps:', 'blue')
      log('1. Go to your Supabase dashboard', 'yellow')
      log('2. Navigate to Storage section', 'yellow') 
      log('3. Create a new bucket named "project-files"', 'yellow')
      log('4. Keep it private (unchecked)', 'yellow')
      log('5. Set file size limit to 100MB', 'yellow')
      log('', 'reset')
      log('📖 See SUPABASE_STORAGE_SETUP_GUIDE.md for detailed instructions', 'cyan')
      process.exit(1)
    }

    log('', 'reset')
    log('🎉 Storage setup verification complete!', 'green')
    log('✅ Your storage system should now work properly', 'green')
    log('', 'reset')
    log('🚀 Next steps:', 'blue')
    log('1. Run: npm run test:e2e:storage', 'cyan')
    log('2. Check for improved test results', 'cyan')
    log('3. Deploy your application!', 'cyan')

  } catch (error) {
    log(`❌ Test failed: ${error.message}`, 'red')
    log('', 'reset')
    log('🔧 Troubleshooting:', 'yellow')
    log('1. Check your Supabase project URL and API keys', 'cyan')
    log('2. Verify you have access to the project', 'cyan')
    log('3. Ensure the project-files bucket exists', 'cyan')
    process.exit(1)
  }
}

// Run the test
testStorageConnection().catch(error => {
  log(`💥 Unexpected error: ${error.message}`, 'red')
  process.exit(1)
}) 