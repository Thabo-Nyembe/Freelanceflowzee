/**
 * Test Wasabi S3 Connection
 * Run with: npx tsx scripts/test-wasabi.ts
 */

import { createWasabiClient, calculateWasabiCost } from '../lib/storage/wasabi-client'

async function testWasabiConnection() {
  console.log('🧪 Testing Wasabi S3 Connection...\n')

  try {
    // Create client
    console.log('1️⃣  Creating Wasabi client...')
    const wasabi = createWasabiClient()
    console.log('   ✅ Client created successfully\n')

    // Test upload
    console.log('2️⃣  Uploading test file...')
    const testContent = Buffer.from(`Hello from Kazi FreeFlow! Timestamp: ${new Date().toISOString()}`)
    const uploadResult = await wasabi.uploadFile({
      key: 'test/connection-test.txt',
      file: testContent,
      contentType: 'text/plain',
      metadata: {
        purpose: 'connection-test',
        timestamp: new Date().toISOString()
      }
    })
    console.log('   ✅ Upload successful!')
    console.log('   📄 Key:', uploadResult.key)
    console.log('   📦 Size:', uploadResult.size, 'bytes')
    console.log('   🏷️  ETag:', uploadResult.etag, '\n')

    // Test signed URL
    console.log('3️⃣  Generating signed URL...')
    const signedUrl = await wasabi.getSignedUrl('test/connection-test.txt', 300) // 5 minutes
    console.log('   ✅ Signed URL generated!')
    console.log('   🔗 URL:', signedUrl.substring(0, 100) + '...\n')

    // Test file exists
    console.log('4️⃣  Checking if file exists...')
    const exists = await wasabi.fileExists('test/connection-test.txt')
    console.log('   ✅ File exists:', exists, '\n')

    // Test metadata
    console.log('5️⃣  Getting file metadata...')
    const metadata = await wasabi.getFileMetadata('test/connection-test.txt')
    console.log('   ✅ Metadata retrieved!')
    console.log('   📊 Size:', metadata.size, 'bytes')
    console.log('   📅 Last Modified:', metadata.lastModified)
    console.log('   📝 Content Type:', metadata.contentType, '\n')

    // Test download
    console.log('6️⃣  Downloading file...')
    const downloaded = await wasabi.downloadFile('test/connection-test.txt')
    console.log('   ✅ Download successful!')
    console.log('   📄 Content:', downloaded.toString(), '\n')

    // Test list files
    console.log('7️⃣  Listing files in test/ folder...')
    const files = await wasabi.listFiles('test/')
    console.log('   ✅ Files listed!')
    console.log('   📁 Found', files.length, 'file(s)')
    files.forEach(file => {
      console.log('      -', file.key, `(${file.size} bytes)`)
    })
    console.log('')

    // Test storage stats
    console.log('8️⃣  Getting storage statistics...')
    const stats = await wasabi.getStorageStats('test/')
    console.log('   ✅ Stats retrieved!')
    console.log('   💾 Total Size:', stats.totalSize, 'bytes')
    console.log('   📊 File Count:', stats.fileCount)
    console.log('   💰 Monthly Cost:', `$${calculateWasabiCost(stats.totalSize).toFixed(4)}\n`)

    // Test presigned upload URL
    console.log('9️⃣  Generating presigned upload URL...')
    const uploadUrl = await wasabi.getPresignedUploadUrl(
      'test/presigned-upload.txt',
      'text/plain',
      300
    )
    console.log('   ✅ Presigned upload URL generated!')
    console.log('   🔗 URL:', uploadUrl.substring(0, 100) + '...\n')

    // Success summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ ALL TESTS PASSED!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('')
    console.log('🎉 Wasabi S3 connection is working perfectly!')
    console.log('📊 Your secure file delivery system is ready to go!')
    console.log('')
    console.log('Next steps:')
    console.log('  • Build file upload API')
    console.log('  • Create delivery system')
    console.log('  • Implement gallery interface')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  } catch (error: any) {
    console.error('\n❌ TEST FAILED!')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('Error:', error.message)
    if (error.code) console.error('Code:', error.code)
    if (error.statusCode) console.error('Status:', error.statusCode)
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('\nTroubleshooting:')
    console.error('  1. Check your Wasabi credentials in .env.local')
    console.error('  2. Ensure bucket "kazi-secure-files" exists in Wasabi')
    console.error('  3. Verify your Wasabi access key has proper permissions')
    console.error('  4. Check network connectivity to Wasabi')
    process.exit(1)
  }
}

// Run the test
testWasabiConnection()
