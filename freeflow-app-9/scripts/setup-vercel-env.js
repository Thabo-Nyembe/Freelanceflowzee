#!/usr/bin/env node

/**
 * Vercel Environment Variables Setup Script
 * Automatically configures all production environment variables for FreeflowZee
 */

const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Production environment variables for FreeflowZee
const envVars = {
  // Supabase Configuration
  'NEXT_PUBLIC_SUPABASE_URL': 'https://ouzcjoxaupimazrivyta.supabase.co', 'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91emNqb3hhdXBpbWF6cml2eXRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNzcwOTYsImV4cCI6MjA2NTY1MzA5Nn0.zkCMU6d3PCgiakNSGxWv1SkB8VW0sBhzMw8lZfRTeUI', 'SUPABASE_SERVICE_ROLE_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91emNqb3hhdXBpbWF6cml2eXRhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDA3NzA5NiwiZXhwIjoyMDY1NjUzMDk2fQ.HIHZQ0KuRBIwZwaTPLxD1E5RQfcQ_e0ar-oC93rTGdQ',
  
  // Stripe Configuration
  'STRIPE_PUBLISHABLE_KEY': 'pk_test_51RWPSSGfWWV489qXBWw1gbD9EDs5Yrq7eItvH6hGpL5l6VAsMqumnGzIolOyiMy11Ngu09awFmEfYSJvlzqPQPeU00Ut2KiWK2', 'STRIPE_SECRET_KEY': 'sk_test_51RWPSSGfWWV489qXu79OQRwaQjakiSmYLTmmpC7uDrHGhk30Nrb7gMC1B8UvR8Ko7f1JCF2jSy0ipeQac4rr5XZ300hDheaIha',
  
  // Wasabi S3 Configuration
  'WASABI_SECRET_ACCESS_KEY': 'or6eeDNUCo7UDDhwrcAYfvBVcAMaslZIMAzqzla8', 'WASABI_BUCKET_NAME': 'freeflowzee-storage', 'WASABI_REGION': 'us-east-1', 'WASABI_ENDPOINT': 'https://s3.wasabisys.com',
  
  // AWS/Supabase S3 Configuration
  'AWS_ACCESS_KEY_ID': '2104d5d3ee2049555e1b79d103f9c40a', 'AWS_SECRET_ACCESS_KEY': 'bb755e01bb140b43e53e447240253791834f5f72df554938a8a77947a46a3ed5', 'AWS_S3_ENDPOINT': 'https://ouzcjoxaupimazrivyta.supabase.co/storage/v1/s3', 'SUPABASE_ACCESS_TOKEN': 'sbp_784f9ceb961b5c7098d2ef74c59c472b412cb39a',
  
  // Application Configuration
  'NEXTAUTH_SECRET': 'TTZuKZVSj58DFeHQxZfT2KvuITgFfSOIdxf4/kFkXy0= ',
  'NEXTAUTH_URL': 'https://freeflow-app-9.vercel.app', 'STORAGE_PROVIDER': 'hybrid', 'VERCEL_TOKEN': 'NweM6XrtOYtrLCkyygMK2uo9'
};

async function setupVercelEnvironment() {
  log('🚀 Setting up FreeflowZee Environment Variables in Vercel...', 'cyan');
  log('', 'reset');'

  let successCount = 0;
  let errorCount = 0;

  for (const [key, value] of Object.entries(envVars)) {
    try {
      log(`📝 Setting ${key}...`, 'blue');
      
      // Run vercel env add command
      const command = `echo "${value}" | npx vercel env add ${key} production --token ${envVars.VERCEL_TOKEN}`;
      execSync(command, { stdio: 'pipe' });
      
      log(`✅ ${key} set successfully`, 'green');
      successCount++;
      
    } catch (error) {
      log(`❌ Failed to set ${key}: ${error.message}`, 'red');
      errorCount++;
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  log('', 'reset');'
  log('📊 Environment Variables Setup Summary: ', 'cyan');
  log(`✅ Successfully set: ${successCount}`, 'green');
  log(`❌ Failed to set: ${errorCount}`, errorCount > 0 ? 'red' : 'green');
  log('', 'reset');'

  if (successCount > 0) {
    log('🎉 FreeflowZee environment variables configured!', 'green');
    log('🚀 Ready for production deployment!', 'green');
    log('', 'reset');'
    log('📋 Next steps: ', 'cyan');
    log('1. Run: npx vercel --prod', 'blue');
    log('2. Visit your deployed application', 'blue');
    log('3. Verify all features are working', 'blue');
  }
}

// Run the setup
setupVercelEnvironment().catch(console.error); 