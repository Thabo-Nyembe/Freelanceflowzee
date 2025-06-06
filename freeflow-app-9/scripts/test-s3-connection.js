#!/usr/bin/env node

/**
 * Test script to verify S3 connection with Supabase credentials
 */

require('dotenv').config({ path: '.env.local' })

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// Import AWS SDK
const { S3Client, ListObjectsV2Command, CreateBucketCommand, HeadBucketCommand, PutObjectCommand } = require('@aws-sdk/client-s3')

async function testS3Connection() {
  log('\n🔬 Testing S3 Connection with Supabase Storage...', 'cyan')
  log('═'.repeat(60), 'cyan')

  // Environment check
  log('\n📋 Environment Configuration:', 'blue')
  log(`S3_ACCESS_KEY_ID: ${process.env.S3_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing'}`)
  log(`S3_SECRET_ACCESS_KEY: ${process.env.S3_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing'}`)
  log(`S3_ENDPOINT: ${process.env.S3_ENDPOINT || '❌ Missing'}`)
  log(`S3_REGION: ${process.env.S3_REGION || '❌ Missing'}`)
  log(`S3_BUCKET_NAME: ${process.env.S3_BUCKET_NAME || '❌ Missing'}`)

  if (!process.env.S3_ACCESS_KEY_ID || !process.env.S3_SECRET_ACCESS_KEY || !process.env.S3_ENDPOINT) {
    log('\n❌ Missing required S3 credentials in .env.local', 'red')
    process.exit(1)
  }

  // Initialize S3 client
  const s3Client = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true, // Required for Supabase S3 compatibility
  })

  const bucketName = process.env.S3_BUCKET_NAME || 'freeflowzee-storage'

  try {
    log('\n🔍 Testing S3 Connection...', 'yellow')

    // Test 1: Check if bucket exists
    try {
      const headCommand = new HeadBucketCommand({ Bucket: bucketName })
      await s3Client.send(headCommand)
      log(`✅ Bucket '${bucketName}' exists and is accessible`, 'green')
    } catch (error) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        log(`⚠️  Bucket '${bucketName}' not found. Attempting to create...`, 'yellow')
        
        try {
          const createCommand = new CreateBucketCommand({ Bucket: bucketName })
          await s3Client.send(createCommand)
          log(`✅ Successfully created bucket '${bucketName}'`, 'green')
        } catch (createError) {
          log(`❌ Failed to create bucket: ${createError.message}`, 'red')
          throw createError
        }
      } else {
        throw error
      }
    }

    // Test 2: List objects in bucket
    log('\n📂 Testing bucket access...', 'yellow')
    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      MaxKeys: 5
    })
    
    const listResponse = await s3Client.send(listCommand)
    log(`✅ Successfully listed objects in bucket`, 'green')
    log(`   Found ${listResponse.KeyCount || 0} objects`, 'cyan')

    // Test 3: Upload a test file
    log('\n📤 Testing file upload...', 'yellow')
    const testContent = JSON.stringify({
      message: 'S3 connection test successful',
      timestamp: new Date().toISOString(),
      bucket: bucketName
    }, null, 2)

    const uploadCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: 'test/connection-test.json',
      Body: testContent,
      ContentType: 'application/json',
      Metadata: {
        'test-type': 'connection-verification',
        'created-by': 'freeflowzee-test-script'
      }
    })

    await s3Client.send(uploadCommand)
    log(`✅ Successfully uploaded test file to 'test/connection-test.json'`, 'green')

    // Success summary
    log('\n🎉 S3 Connection Test Results:', 'green')
    log('═'.repeat(40), 'green')
    log('✅ Credentials authenticated successfully', 'green')
    log('✅ Bucket access confirmed', 'green')
    log('✅ File upload capability verified', 'green')
    log('✅ S3 integration ready for FreeflowZee!', 'green')

    log('\n📋 Next Steps:', 'blue')
    log('1. Your S3 credentials are properly configured', 'cyan')
    log('2. You can now use the S3 client in your application', 'cyan')
    log('3. Import from: lib/s3-client.ts', 'cyan')
    log('4. Consider creating storage buckets for different file types', 'cyan')

  } catch (error) {
    log('\n❌ S3 Connection Test Failed:', 'red')
    log('═'.repeat(40), 'red')
    log(`Error: ${error.message}`, 'red')
    
    if (error.$metadata) {
      log(`HTTP Status: ${error.$metadata.httpStatusCode}`, 'red')
      log(`Request ID: ${error.$metadata.requestId}`, 'red')
    }

    log('\n🔧 Troubleshooting Tips:', 'yellow')
    log('1. Verify your S3 credentials are correct', 'yellow')
    log('2. Check if Supabase S3 is enabled in your project', 'yellow')
    log('3. Ensure the bucket name is valid (lowercase, no spaces)', 'yellow')
    log('4. Verify your Supabase project has storage enabled', 'yellow')
    
    process.exit(1)
  }
}

// Run the test
testS3Connection().catch(console.error) 