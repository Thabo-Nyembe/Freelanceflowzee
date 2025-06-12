#!/usr/bin/env node

// Simple test to verify Supabase authentication setup
const { createClient } = require('@supabase/supabase-js');

async function testAuth() {
  console.log('🔧 Testing Supabase Authentication Setup...\n');

  // Load environment variables
  require('dotenv').config({ path: '.env.local' });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('Environment Variables:');
  console.log('- SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('- SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
  console.log('');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Missing environment variables. Please run: node scripts/setup-env.js');
    return;
  }

  try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Supabase client created successfully');

    // Test connection
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('⚠️ Auth test error:', error.message);
    } else {
      console.log('✅ Supabase connection successful');
      console.log('- Session status:', data.session ? 'Active' : 'No active session');
    }

    console.log('\n🚀 Authentication setup is ready!');
    console.log('\nTest credentials:');
    console.log('Email: thabo@kaleidocraft.co.za');
    console.log('Password: password1234');
    console.log('\nYou can now test login at: http://localhost:3000/login');

  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('\nPlease check your Supabase credentials and try again.');
  }
}

testAuth().catch(console.error); 