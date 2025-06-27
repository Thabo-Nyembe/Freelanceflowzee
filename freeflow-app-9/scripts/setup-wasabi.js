const { S3Client, CreateBucketCommand, HeadBucketCommand, PutBucketPolicyCommand } = require('@aws-sdk/client-s3');
require('dotenv').config({ path: '.env.local' });

const wasabiClient = new S3Client({
  endpoint: process.env.WASABI_ENDPOINT || 'https://s3.wasabisys.com',
  region: process.env.WASABI_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.WASABI_ACCESS_KEY_ID,
    secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

const bucketName = process.env.WASABI_BUCKET_NAME || 'freeflowzee-storage';

async function setupWasabi() {
  console.log('🚀 Setting up Wasabi S3-Compatible Storage...\n');
  
  try {
    // Check if bucket exists
    console.log(`📍 Checking if bucket '${bucketName}' exists...`);
    
    try {
      await wasabiClient.send(new HeadBucketCommand({ Bucket: bucketName }));
      console.log('✅ Bucket already exists and is accessible!\n');
    } catch (error) {
      if (error.name === 'NotFound') {
        console.log('📦 Bucket not found. Creating new bucket...');
        
        // Create bucket
        await wasabiClient.send(new CreateBucketCommand({
          Bucket: bucketName,
          CreateBucketConfiguration: {
            LocationConstraint: process.env.WASABI_REGION || 'us-east-1'
          }
        }));
        
        console.log('✅ Bucket created successfully!\n');
        
        // Set bucket policy for proper access
        const bucketPolicy = {
          Version: '2012-10-17',
          Statement: [
            {
              Sid: 'AllowFreeflowzeeAccess',
              Effect: 'Allow',
              Principal: {
                AWS: `arn:aws:iam::*:user/*`
              },
              Action: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject',
                's3:GetObjectVersion'],
              Resource: `arn:aws:s3:::${bucketName}/*`
            }
          ]
        };
        
        try {
          await wasabiClient.send(new PutBucketPolicyCommand({
            Bucket: bucketName,
            Policy: JSON.stringify(bucketPolicy)
          }));
          console.log('✅ Bucket policy configured for FreeflowZee access\n');
        } catch (policyError) {
          console.log('⚠️  Bucket policy setup skipped (may require additional permissions)\n');
        }
      } else {
        throw error;
      }
    }

    // Test connection and credentials
    console.log('🔍 Testing Wasabi connection and credentials...');
    const testResult = await wasabiClient.send(new HeadBucketCommand({ Bucket: bucketName }));
    console.log('✅ Connection test successful!\n');

    // Cost savings calculation
    console.log('💰 COST SAVINGS ANALYSIS:');
    console.log('┌─────────────────────────────────────────────┐');
    console.log('│ Wasabi vs Traditional Cloud Storage Costs  │');
    console.log('├─────────────────────────────────────────────┤');
    console.log('│ Wasabi:     $0.0059/GB/month (80% cheaper) │');
    console.log('│ AWS S3:     $0.023/GB/month (standard)     │');
    console.log('│ Supabase:   $0.021/GB/month (standard)     │');
    console.log('└─────────────────────────────────────────────┘');
    console.log('');'
    console.log('📊 For 100GB of storage: ');
    console.log('   • Wasabi:     $0.59/month');
    console.log('   • Traditional: $2.30/month');
    console.log('   • Monthly Savings: $1.71 (74% cost reduction)');
    console.log('   • Annual Savings: $20.52');
    console.log('');'

    console.log('🎉 WASABI SETUP COMPLETE!');
    console.log('');'
    console.log('📋 Configuration Summary: ');
    console.log(`   • Bucket Name: ${bucketName}`);
    console.log(`   • Region: ${process.env.WASABI_REGION || 'us-east-1'}`);
    console.log(`   • Endpoint: ${process.env.WASABI_ENDPOINT || 'https://s3.wasabisys.com'}`);
    console.log(`   • Access Key: ${process.env.WASABI_ACCESS_KEY_ID?.substring(0, 8)}...`);
    console.log('');'
    console.log('🚀 Your FreeflowZee application is now ready for multi-cloud storage!');
    console.log('   • Large files will automatically route to Wasabi for cost savings');
    console.log('   • Small frequently accessed files stay on Supabase for speed');
    console.log('   • Hybrid storage provides optimal cost and performance');

  } catch (error) {
    console.error('❌ Wasabi setup failed:', error.message);
    console.log('');'
    console.log('🔧 Troubleshooting Tips: ');
    console.log('   1. Verify your Wasabi credentials in .env.local');
    console.log('   2. Check that your Wasabi account has bucket creation permissions');
    console.log('   3. Ensure the region is correctly configured');
    console.log('   4. Try accessing the Wasabi console to verify account status');
    process.exit(1);
  }
}

// Run setup
setupWasabi().catch(console.error); 