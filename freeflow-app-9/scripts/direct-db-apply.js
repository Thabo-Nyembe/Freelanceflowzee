const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function applyDatabaseUpdate() {
  console.log('🚀 Applying Database Update to Supabase...\n');
  
  // Extract connection details from Supabase URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL not found');
    return;
  }
  
  // Extract the project reference from URL
  const urlMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  if (!urlMatch) {
    console.error('❌ Could not parse Supabase URL');
    return;
  }
  
  const projectRef = urlMatch[1];
  
  const client = new Client({
    host: `db.${projectRef}.supabase.co`,
    port: 5432,
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD || 'your-database-password',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('🔌 Connecting to Supabase database...');
    await client.connect();
    console.log('✅ Connected successfully');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'database-update-new-features.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 Executing SQL script...\n');
    
    // Execute the SQL
    const result = await client.query(sqlContent);
    
    console.log('✅ Database update completed successfully!');
    console.log('\n🎉 New Features Available:');
    console.log('   ✅ Community Posts & Social Wall');
    console.log('   ✅ Post Interactions (likes, shares, bookmarks)');
    console.log('   ✅ Threaded Comments System');
    console.log('   ✅ Enhanced Sharing Analytics');
    console.log('   ✅ Creator Profiles & Marketplace');
    console.log('   ✅ Row Level Security Policies');
    
    // Test the new tables
    console.log('\n🔍 Verifying new tables...');
    
    const tables = ['community_posts', 'post_interactions', 'post_comments', 'sharing_analytics', 'creator_profiles',
      'creator_reviews'];
    
    for (const table of tables) {
      try {
        const { rows } = await client.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`✅ ${table}: Ready (${rows[0].count} records)`);
      } catch (err) {
        console.log(`❌ ${table}: Error - ${err.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📝 Manual Instructions:');
    console.log('1. Open your Supabase dashboard');
    console.log('2. Go to SQL Editor');
    console.log('3. Copy and paste the contents of scripts/database-update-new-features.sql');
    console.log('4. Run the script');
    console.log('\nOr use the Supabase CLI:');
    console.log('supabase db reset');
  } finally {
    await client.end();
  }
}

// Alternative method using Supabase SQL Editor format
async function generateSupabaseInstructions() {
  console.log('\n📋 MANUAL SUPABASE SETUP INSTRUCTIONS:');
  console.log('===================================== ');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Go to SQL Editor');
  console.log('4. Click "New Query"');
  console.log('5. Copy and paste the following SQL:');
  console.log('');'
  
  const sqlPath = path.join(__dirname, 'database-update-new-features.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');
  
  console.log('--- START SQL ---');
  console.log(sqlContent);
  console.log('--- END SQL ---');
  console.log('');'
  console.log('6. Click "Run" to execute');
  console.log('7. Verify all tables were created successfully');
}

if (require.main === module) {
  applyDatabaseUpdate().catch(() => {
    generateSupabaseInstructions();
  });
}

module.exports = { applyDatabaseUpdate }; 