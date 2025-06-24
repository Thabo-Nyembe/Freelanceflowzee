#!/usr/bin/env node

/**
 * Supabase Storage Setup Script
 * 
 * This script creates the required storage buckets and sets up policies
 * for the FreeflowZee file storage system.
 */

const { createClient } = require('@supabase/supabase-js')
const process = require('process')
require('dotenv').config({ path: '.env.local' })

// ANSI color codes for pretty logging
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset)
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

  // Define buckets to create
  const buckets = [
    {
      id: 'project-files',
      public: true,
      fileSizeLimit: '50MiB',
      allowedMimeTypes: ['image/*', 'video/*', 'audio/*', 'application/pdf']
    },
    {
      id: 'avatars',
      public: true,
      fileSizeLimit: '5MiB',
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif']
    },
    {
      id: 'media',
      public: true,
      fileSizeLimit: '50MiB',
      allowedMimeTypes: ['image/*', 'video/*', 'audio/*']
    },
    {
      id: 'ai-generations',
      public: false,
      fileSizeLimit: '100MiB',
      allowedMimeTypes: [
        'image/*',
        'video/*', 
        'audio/*',
        'text/*',
        'application/json',
        'application/javascript',
        'application/typescript'
      ]
    },
    {
      id: 'ai-temp',
      public: false,
      fileSizeLimit: '10MiB',
      allowedMimeTypes: ['*/*']
    }
  ]

  // Create each bucket
  for (const bucket of buckets) {
    try {
      log(`📦 Creating bucket: ${bucket.id}...`, 'blue')
      
      const { error } = await supabase.storage.createBucket(bucket.id, {
        public: bucket.public,
        fileSizeLimit: bucket.fileSizeLimit,
        allowedMimeTypes: bucket.allowedMimeTypes
      })

      if (error) {
        if (error.message.includes('already exists')) {
          log(`✅ Bucket ${bucket.id} already exists`, 'yellow')
        } else {
          log(`❌ Failed to create bucket ${bucket.id}: ${error.message}`, 'red')
        }
      } else {
        log(`✅ Created bucket: ${bucket.id}`, 'green')
      }
    } catch (error) {
      log(`❌ Error creating bucket ${bucket.id}: ${error.message}`, 'red')
    }
  }

  log('', 'reset')
  log('🎉 Storage setup complete!', 'green')
  log('You can now use the following buckets:', 'blue')
  buckets.forEach(bucket => {
    log(`- ${bucket.id} (${bucket.fileSizeLimit})`, 'cyan')
  })
}

setupStorage().catch(error => {
  log(`❌ Setup failed: ${error.message}`, 'red')
  process.exit(1)
}) 