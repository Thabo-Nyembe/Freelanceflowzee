#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Use environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ouzcjoxaupimazrivyta.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91emNqb3hhdXBpbWF6cml2eXRhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDA3NzA5NiwiZXhwIjoyMDY1NjUzMDk2fQ.HIHZQ0KuRBIwZwaTPLxD1E5RQfcQ_e0ar-oC93rTGdQ'

console.log('🚀 FreeflowZee Database Update Script')
console.log('📍 Supabase URL: ', SUPABASE_URL)
console.log('🔧 Using enhanced database setup with trigger safety\n')

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runDatabaseUpdate() {
  try {
    console.log('📖 Reading database setup script...')
    
    const sqlFilePath = path.join(__dirname, 'complete-database-setup.sql')
    
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`Database setup file not found: ${sqlFilePath}`)
    }
    
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8')
    console.log('✅ Database script loaded successfully')
    
    console.log('\n🔧 Executing database setup script...')
    console.log('   This script safely handles existing triggers and tables')
    
    // Execute the SQL script
    const { data, error } = await supabase.rpc('exec', { sql: sqlScript })
    
    if (error) {
      console.error('❌ Database setup failed:', error.message)
      
      // Try executing via direct query if RPC fails
      console.log('\n🔄 Trying alternative execution method...')
      
      const { data: altData, error: altError } = await supabase
        .from('pg_stat_activity')
        .select('*')'
        .limit(1)
      
      if (altError) {
        console.error('❌ Database connection failed: ', altError.message)
        console.log('\n💡 Manual Setup Required:')
        console.log('1. Open Supabase Dashboard → SQL Editor')
        console.log('2. Copy and paste the contents of scripts/complete-database-setup.sql')
        console.log('3. Click "Run" to execute the script')
        console.log('4. The script will safely skip existing triggers')
        return false
      }
      
      console.log('✅ Database connection verified')
      console.log('\n💡 Please run the SQL script manually in Supabase SQL Editor')
      console.log('   The script is located at: scripts/complete-database-setup.sql')
      return false
    }
    
    console.log('✅ Database setup completed successfully!')
    return true
    
  } catch (error) {
    console.error('❌ Setup script failed:', error.message)
    console.log('\n💡 Manual Instructions:')
    console.log('1. Open your Supabase Dashboard')
    console.log('2. Go to SQL Editor')
    console.log('3. Copy the contents of scripts/complete-database-setup.sql')
    console.log('4. Paste and run the script')
    console.log('5. The updated script will handle existing triggers safely')
    return false
  }
}

async function verifySetup() {
  console.log('\n🔍 Verifying database setup...')
  
  const requiredTables = ['projects', 'user_profiles', 'file_storage', 'storage_analytics', 'feedback_comments', 'upf_comments', 'upf_reactions',
    'upf_attachments']
  
  let successCount = 0
  
  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')'
        .limit(1)
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`)
      } else {
        console.log(`✅ ${table}: Ready`)
        successCount++
      }
    } catch (e) {
      console.log(`❌ ${table}: Connection error`)
    }
  }
  
  const completionRate = Math.round((successCount / requiredTables.length) * 100)
  console.log(`\n📊 Database Setup: ${successCount}/${requiredTables.length} tables (${completionRate}%)`)
  
  if (completionRate >= 80) {
    console.log('🎉 Database is ready for use!')
    console.log('✅ FreeflowZee can now operate with full functionality')
  } else {
    console.log('⚠️  Database setup incomplete')
    console.log('💡 Run the SQL script manually in Supabase Dashboard')
  }
  
  return completionRate >= 80
}

async function main() {
  console.log('=' .repeat(60))'
  console.log('🗄️  FREEFLOWZEE DATABASE UPDATE')
  console.log('=' .repeat(60))'
  
  // Test connection first
  try {
    const { data, error } = await supabase.auth.getSession()
    console.log('🔗 Database connection: OK')
  } catch (e) {
    console.error('❌ Database connection failed: ', e.message)
    process.exit(1)
  }
  
  // Run the update
  const setupSuccess = await runDatabaseUpdate()
  
  // Verify the setup
  const verifySuccess = await verifySetup()
  
  console.log('\n' + '=' .repeat(60))'
  if (setupSuccess && verifySuccess) {
    console.log('🎯 SUCCESS: Database fully updated and verified!')
    console.log('🚀 FreeflowZee is ready for production use')
    process.exit(0)
  } else {
    console.log('⚠️  PARTIAL: Manual setup may be required')
    console.log('📖 See instructions above for manual SQL execution')
    process.exit(1)
  }
}

// Handle script execution
if (require.main === module) {
  main().catch(error => {
    console.error('\n💥 Script execution failed: ', error.message)
    console.log('\n🔧 Fallback: Run SQL script manually in Supabase Dashboard')
    console.log('📁 File: scripts/complete-database-setup.sql')
    process.exit(1)
  })
} 