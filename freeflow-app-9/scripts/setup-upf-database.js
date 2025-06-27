const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

console.log('🚀 Setting up Universal Pinpoint Feedback database...');
console.log('📍 Supabase URL:', SUPABASE_URL);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function setupDatabase() {
  console.log('\n🔧 MANUAL DATABASE SETUP REQUIRED');
  console.log('══════════════════════════════════════════════════════════');
  console.log('Due to Supabase security restrictions, please follow these steps:');
  console.log('');'
  console.log('1. 🌐 Open your Supabase dashboard: ');
  console.log('   https://supabase.com/dashboard/project/zozfeysmzonzvrelyhjf');
  console.log('');'
  console.log('2. 📊 Go to "SQL Editor" in the left sidebar');
  console.log('');'
  console.log('3. 📋 Copy and paste the SQL from: scripts/create-upf-tables.sql');
  console.log('');'
  console.log('4. ▶️  Click "Run" to execute the SQL script');
  console.log('');'
  console.log('5. ✅ Verify tables are created in the "Database" section');
  console.log('');'
  console.log('══════════════════════════════════════════════════════════');

  // Test connection to verify credentials work
  console.log('\n🧪 Testing Supabase connection...');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "relation does not exist" which is expected for new projects
      console.log('❌ Connection test failed: ', error.message);
      console.log('   Please check your Supabase credentials in .env.local');
    } else {
      console.log('✅ Supabase connection successful!');
      console.log('   Your credentials are working correctly.');
    }
  } catch (err) {
    console.log('❌ Connection test failed:', err.message);
  }

  console.log('\n🎯 WHAT HAPPENS NEXT:');
  console.log('1. Complete the manual SQL setup above');
  console.log('2. Restart your development server: npm run dev');
  console.log('3. Visit: http://localhost:3000/dashboard/collaboration');
  console.log('4. Click on the "Universal Pinpoint Feedback" tab');
  console.log('5. Start adding comments to your files!');
  console.log('');'
  console.log('📖 For detailed usage instructions, see: ');
  console.log('   UNIVERSAL_PINPOINT_FEEDBACK_DOCUMENTATION.md');
}

// Run the setup
setupDatabase().catch(error => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
}); 