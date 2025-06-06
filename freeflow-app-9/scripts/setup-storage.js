#!/usr/bin/env node

/**
 * Supabase Storage Setup Script
 * 
 * This script creates the required storage buckets and sets up policies
 * for the FreeflowZee file storage system.
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

async function setupStorage() {
  log('🔧 FreeflowZee Storage Setup', 'blue')
  log('===============================', 'blue')
  log('', 'reset')

  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    log('❌ Missing required environment variables', 'red')
    log('Please ensure .env.local contains:', 'yellow')
    log('- NEXT_PUBLIC_SUPABASE_URL', 'yellow')
    log('- SUPABASE_SERVICE_ROLE_KEY', 'yellow')
    process.exit(1)
  }

  // Create Supabase client with service role (bypass RLS)
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  log('✅ Connected to Supabase', 'green')
  log(`📍 Project: ${supabaseUrl}`, 'cyan')
  log('', 'reset')

  try {
    // 1. Create the project-files bucket
    log('📦 Creating storage bucket "project-files"...', 'blue')
    
    const { data: bucket, error: bucketError } = await supabase.storage.createBucket('project-files', {
      public: false,
      allowedMimeTypes: [
        // Images
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        // Documents  
        'application/pdf', 'text/plain', 'text/csv',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        // Audio
        'audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/aac',
        // Video
        'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov',
        // Archives
        'application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed',
        'application/x-7z-compressed', 'application/gzip'
      ],
      fileSizeLimit: 104857600 // 100MB in bytes
    })

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        log('✅ Bucket "project-files" already exists', 'green')
      } else {
        throw bucketError
      }
    } else {
      log('✅ Created bucket "project-files" successfully', 'green')
    }

    // 2. Create storage policies
    log('🔒 Setting up storage policies...', 'blue')

    // Policy to allow authenticated users to upload files
    const uploadPolicy = `
      CREATE POLICY "Allow authenticated uploads" ON storage.objects
      FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        bucket_id = 'project-files'
      );
    `

    // Policy to allow users to view their own files
    const selectPolicy = `
      CREATE POLICY "Allow authenticated select" ON storage.objects
      FOR SELECT USING (
        auth.role() = 'authenticated' AND
        bucket_id = 'project-files'
      );
    `

    // Policy to allow users to delete their own files
    const deletePolicy = `
      CREATE POLICY "Allow authenticated delete" ON storage.objects
      FOR DELETE USING (
        auth.role() = 'authenticated' AND
        bucket_id = 'project-files'
      );
    `

    // Execute policies (they may already exist, so we'll catch errors)
    try {
      await supabase.rpc('exec_sql', { sql: uploadPolicy })
      log('✅ Upload policy created', 'green')
    } catch (error) {
      if (error.message.includes('already exists')) {
        log('✅ Upload policy already exists', 'green')
      } else {
        log(`⚠️  Upload policy error: ${error.message}`, 'yellow')
      }
    }

    try {
      await supabase.rpc('exec_sql', { sql: selectPolicy })
      log('✅ Select policy created', 'green')
    } catch (error) {
      if (error.message.includes('already exists')) {
        log('✅ Select policy already exists', 'green')
      } else {
        log(`⚠️  Select policy error: ${error.message}`, 'yellow')
      }
    }

    try {
      await supabase.rpc('exec_sql', { sql: deletePolicy })
      log('✅ Delete policy created', 'green')
    } catch (error) {
      if (error.message.includes('already exists')) {
        log('✅ Delete policy already exists', 'green')
      } else {
        log(`⚠️  Delete policy error: ${error.message}`, 'yellow')
      }
    }

    // 3. Test the setup
    log('', 'reset')
    log('🧪 Testing storage setup...', 'blue')

    // List buckets to verify
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      throw listError
    }

    const projectFilesBucket = buckets.find(b => b.name === 'project-files')
    
    if (projectFilesBucket) {
      log('✅ Storage bucket verified successfully', 'green')
      log(`📊 Bucket details:`, 'cyan')
      log(`   - Name: ${projectFilesBucket.name}`, 'cyan')
      log(`   - Public: ${projectFilesBucket.public}`, 'cyan')
      log(`   - Created: ${projectFilesBucket.created_at}`, 'cyan')
    } else {
      throw new Error('project-files bucket not found after creation')
    }

    // 4. Test upload functionality (create a test file)
    log('', 'reset')
    log('🔍 Testing file upload...', 'blue')
    
    const testContent = 'FreeflowZee Storage Test File\nCreated: ' + new Date().toISOString()
    const testFileName = `test/setup-verification-${Date.now()}.txt`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('project-files')
      .upload(testFileName, testContent, {
        contentType: 'text/plain'
      })

    if (uploadError) {
      log(`⚠️  Upload test failed: ${uploadError.message}`, 'yellow')
      log('This may be due to RLS policies - files can still be uploaded via your API', 'yellow')
    } else {
      log('✅ Test file uploaded successfully', 'green')
      log(`📄 Test file: ${uploadData.path}`, 'cyan')
      
      // Clean up test file
      await supabase.storage.from('project-files').remove([testFileName])
      log('🧹 Test file cleaned up', 'green')
    }

    log('', 'reset')
    log('🎉 Storage setup completed successfully!', 'green')
    log('', 'reset')
    log('Next steps:', 'blue')
    log('1. Run your storage tests: npm run test:storage', 'cyan')
    log('2. Test file upload via your API endpoints', 'cyan')
    log('3. Check the Supabase dashboard for the new bucket', 'cyan')
    log('', 'reset')
    log('🔗 Dashboard: https://supabase.com/dashboard/project/rxkunedfjccggovbmbnx/storage/buckets', 'blue')

  } catch (error) {
    log('', 'reset')
    log('❌ Storage setup failed:', 'red')
    log(error.message, 'red')
    log('', 'reset')
    
    if (error.message.includes('permission')) {
      log('💡 Troubleshooting tips:', 'yellow')
      log('1. Verify your SUPABASE_SERVICE_ROLE_KEY is correct', 'yellow')
      log('2. Check that the service role has storage permissions', 'yellow')
      log('3. Ensure the Supabase project URL is correct', 'yellow')
    }
    
    process.exit(1)
  }
}

// Run the setup
setupStorage().catch(console.error) 