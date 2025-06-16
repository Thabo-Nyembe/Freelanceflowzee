#!/usr/bin/env node

const { execSync } = require('child_process');

// Environment variables to set in Vercel
const envVars = {
  'NEXT_PUBLIC_SUPABASE_URL': 'https://ouzcjoxaupimazrivyta.supabase.co',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91emNqb3hhdXBpbWF6cml2eXRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNzcwOTYsImV4cCI6MjA2NTY1MzA5Nn0.zkCMU6d3PCgiakNSGxWv1SkB8VW0sBhzMw8lZfRTeUI',
  'SUPABASE_SERVICE_ROLE_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91emNqb3hhdXBpbWF6cml2eXRhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDA3NzA5NiwiZXhwIjoyMDY1NjUzMDk2fQ.HIHZQ0KuRBIwZwaTPLxD1E5RQfcQ_e0ar-oC93rTGdQ',
  'STRIPE_PUBLISHABLE_KEY': 'pk_test_51RWPSSGfWWV489qXBWw1gbD9EDs5Yrq7eItvH6hGpL5l6VAsMqumnGzIolOyiMy11Ngu09awFmEfYSJvlzqPQPeU00Ut2KiWK2',
  'STRIPE_SECRET_KEY': 'sk_test_51RWPSSGfWWV489qXu79OQRwaQjakiSmYLTmmpC7uDrHGhk30Nrb7gMC1B8UvR8Ko7f1JCF2jSy0ipeQac4rr5XZ300hDheaIha',
  'WASABI_SECRET_ACCESS_KEY': 'or6eeDNUCo7UDDhwrcAYfvBVcAMaslZIMAzqzla8',
  'WASABI_BUCKET_NAME': 'freeflowzee-storage',
  'WASABI_REGION': 'us-east-1',
  'WASABI_ENDPOINT': 'https://s3.wasabisys.com',
  'NEXTAUTH_SECRET': 'TTZuKZVSj58DFeHQxZfT2KvuITgFfSOIdxf4/kFkXy0=',
  'NEXTAUTH_URL': 'https://freeflow-app-9.vercel.app',
  'AWS_ACCESS_KEY_ID': '2104d5d3ee2049555e1b79d103f9c40a',
  'AWS_SECRET_ACCESS_KEY': 'bb755e01bb140b43e53e447240253791834f5f72df554938a8a77947a46a3ed5',
  'AWS_S3_ENDPOINT': 'https://ouzcjoxaupimazrivyta.supabase.co/storage/v1/s3',
  'SUPABASE_ACCESS_TOKEN': 'sbp_784f9ceb961b5c7098d2ef74c59c472b412cb39a',
  'STORAGE_PROVIDER': 'hybrid'
};

console.log('🚀 Setting up Vercel environment variables...');

for (const [key, value] of Object.entries(envVars)) {
  try {
    console.log(`⚙️  Setting ${key}...`);
    execSync(`npx vercel env add ${key} production --yes`, {
      input: `${value}\n`,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    console.log(`✅ ${key} set successfully`);
  } catch (error) {
    console.log(`⚠️  ${key} might already exist or failed to set`);
  }
}

console.log('✅ Vercel environment setup complete!');
console.log('🔄 Now triggering a new deployment...');

try {
  execSync('npx vercel --prod --yes', { stdio: 'inherit' });
  console.log('🎉 Deployment triggered successfully!');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
} 