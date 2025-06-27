#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

// Use environment variables or fallback to the provided credentials
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ouzcjoxaupimazrivyta.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91emNqb3hhdXBpbWF6cml2eXRhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDA3NzA5NiwiZXhwIjoyMDY1NjUzMDk2fQ.HIHZQ0KuRBIwZwaTPLxD1E5RQfcQ_e0ar-oC93rTGdQ'

console.log('🔍 FreeflowZee Database Status Check')
console.log('📍 Supabase URL: ', SUPABASE_URL)
console.log('🔑 Using Service Role for comprehensive access\n')

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkTableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')'
      .limit(1)
    
    if (error) {
      return { exists: false, error: error.message, rowCount: 0 }
    }
    
    // Get row count
    const { count, error: countError } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })'
    
    return { 
      exists: true, 
      error: null, 
      rowCount: countError ? 'unknown' : count 
    }
  } catch (error) {
    return { exists: false, error: error.message, rowCount: 0 }
  }
}

async function checkStorageBuckets() {
  try {
    const { data, error } = await supabase.storage.listBuckets()
    
    if (error) {
      return { exists: false, buckets: [], error: error.message }
    }
    
    return { 
      exists: true, 
      buckets: data.map(bucket => bucket.name), 
      error: null 
    }
  } catch (error) {
    return { exists: false, buckets: [], error: error.message }
  }
}

async function checkAuthUsers() {
  try {
    // Try to get user count using admin API
    const { data, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      return { accessible: false, count: 0, error: error.message }
    }
    
    return { 
      accessible: true, 
      count: data.users ? data.users.length : 0, 
      error: null 
    }
  } catch (error) {
    return { accessible: false, count: 0, error: error.message }
  }
}

async function main() {
  console.log('🚀 Starting comprehensive database check...\n')
  
  // Define all required tables
  const requiredTables = [
    // Main FreeflowZee tables
    { name: 'projects', critical: true },
    { name: 'user_profiles', critical: true },
    { name: 'feedback_comments', critical: true },
    { name: 'project_attachments', critical: false },
    { name: 'project_members', critical: false },
    { name: 'invoices', critical: false },
    { name: 'time_entries', critical: false },
    
    // Universal Pinpoint Feedback (UPF) tables
    { name: 'upf_comments', critical: true },
    { name: 'upf_reactions', critical: false },
    { name: 'upf_attachments', critical: false },
    { name: 'upf_voice_notes', critical: false },
    { name: 'upf_analytics', critical: false }
  ]

  let totalTables = requiredTables.length
  let existingTables = 0
  let criticalMissing = 0
  
  console.log('📊 Database Tables Status:')
  console.log('=' .repeat(60))'
  
  for (const table of requiredTables) {
    const status = await checkTableExists(table.name)
    const criticalIcon = table.critical ? '🔴' : '🟡'
    
    if (status.exists) {
      existingTables++
      console.log(`✅ ${table.name.padEnd(20)} | Rows: ${status.rowCount}`)
    } else {
      if (table.critical) criticalMissing++
      console.log(`❌ ${table.name.padEnd(20)} | ${criticalIcon} ${table.critical ? 'CRITICAL' : 'Optional'} | Error: ${status.error}`)
    }
  }
  
  console.log('\n📦 Storage Buckets Status:')
  console.log('=' .repeat(60))'
  
  const storageStatus = await checkStorageBuckets()
  if (storageStatus.exists) {
    console.log(`✅ Storage accessible | Buckets: ${storageStatus.buckets.join(', ') || 'None'}`)
  } else {
    console.log(`❌ Storage error: ${storageStatus.error}`)
  }
  
  console.log('\n👤 Authentication Status: ')
  console.log('=' .repeat(60))'
  
  const authStatus = await checkAuthUsers()
  if (authStatus.accessible) {
    console.log(`✅ Auth system accessible | Users: ${authStatus.count}`)
  } else {
    console.log(`⚠️  Auth check: ${authStatus.error}`)
  }
  
  // Summary
  console.log('\n📋 SUMMARY: ')
  console.log('=' .repeat(60))'
  
  const completionRate = Math.round((existingTables / totalTables) * 100)
  console.log(`📊 Tables: ${existingTables}/${totalTables} (${completionRate}%)`)
  
  if (criticalMissing === 0) {
    console.log('✅ All critical tables are present')
  } else {
    console.log(`❌ ${criticalMissing} critical tables missing`)
  }
  
  if (completionRate === 100) {
    console.log('🎉 DATABASE IS FULLY UP TO DATE!')
    console.log('✅ FreeflowZee is ready for production')
  } else if (completionRate >= 80 && criticalMissing === 0) {
    console.log('🟡 Database is mostly complete')
    console.log('✅ Core functionality available')
    console.log('⚠️  Some optional features may be limited')
  } else {
    console.log('🔴 Database setup incomplete')
    console.log('❌ Manual setup required')
    
    console.log('\n🔧 NEXT STEPS: ')
    console.log('1. Run SQL scripts in Supabase SQL Editor:')
    console.log('   - scripts/supabase-schema.sql (main tables)')
    console.log('   - scripts/create-upf-tables.sql (UPF system)')
    console.log('2. Restart application after setup')
  }
  
  console.log('\n🌐 Application Status:')
  console.log(`📍 Frontend: http://localhost:3000`)
  console.log(`🔐 Authentication: ${authStatus.accessible ? 'Ready' : 'Needs Setup'}`)
  console.log(`💾 Database: ${completionRate}% Complete`)
  console.log(`📁 Storage: ${storageStatus.exists ? 'Ready' : 'Needs Setup'}`)
  
  process.exit(completionRate >= 80 ? 0 : 1)
}

main().catch(error => {
  console.error('\n❌ Database check failed:', error.message)
  process.exit(1)
}) 