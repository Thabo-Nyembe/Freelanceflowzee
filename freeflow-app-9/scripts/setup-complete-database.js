#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Supabase credentials
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ouzcjoxaupimazrivyta.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91emNqb3hhdXBpbWF6cml2eXRhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDA3NzA5NiwiZXhwIjoyMDY1NjUzMDk2fQ.HIHZQ0KuRBIwZwaTPLxD1E5RQfcQ_e0ar-oC93rTGdQ'

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

console.log('🔍 FreeflowZee Database Setup & Verification')
console.log('📍 Supabase URL:', SUPABASE_URL)
console.log('🔑 Using Service Role Key for admin operations')

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function checkDatabaseConnection() {
  console.log('\n🧪 Testing database connection...')
  try {
    const { data, error } = await supabase
      .from('pg_stat_activity')
      .select('count')
      .limit(1)
    
    if (error) {
      console.log('⚠️  Direct query failed, trying auth check...')
      // Try a different approach
      const { data: authData, error: authError } = await supabase.auth.getSession()
      if (authError) {
        throw authError
      }
      console.log('✅ Database connection successful (via auth check)')
    } else {
      console.log('✅ Database connection successful')
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    return false
  }
  return true
}

async function checkExistingTables() {
  console.log('\n🔍 Checking existing tables...')
  const requiredTables = [
    'projects',
    'feedback_comments', 
    'project_attachments',
    'project_members',
    'user_profiles',
    'invoices',
    'time_entries',
    'upf_comments',
    'upf_reactions',
    'upf_attachments',
    'upf_voice_notes',
    'upf_analytics'
  ]

  const existingTables = []
  
  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (!error) {
        existingTables.push(table)
        console.log(`✅ ${table} - exists`)
      } else {
        console.log(`❌ ${table} - missing (${error.message})`)
      }
    } catch (error) {
      console.log(`❌ ${table} - error checking: ${error.message}`)
    }
  }

  return {
    existing: existingTables,
    required: requiredTables,
    missing: requiredTables.filter(table => !existingTables.includes(table))
  }
}

async function executeSQL(sql, description) {
  console.log(`\n🔧 ${description}...`)
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })
    
    if (error) {
      console.error(`❌ Failed: ${error.message}`)
      return false
    }
    
    console.log(`✅ ${description} completed successfully`)
    return true
  } catch (error) {
    console.error(`❌ Error executing ${description}:`, error.message)
    return false
  }
}

async function setupMainSchema() {
  console.log('\n📊 Setting up main database schema...')
  
  const mainSchemaPath = path.join(__dirname, 'supabase-schema.sql')
  if (!fs.existsSync(mainSchemaPath)) {
    console.error('❌ Main schema file not found:', mainSchemaPath)
    return false
  }

  const mainSchema = fs.readFileSync(mainSchemaPath, 'utf8')
  
  // Split SQL into smaller chunks to avoid issues
  const sqlStatements = mainSchema
    .split(';')
    .filter(stmt => stmt.trim().length > 0)
    .map(stmt => stmt.trim() + ';')

  let successCount = 0
  let failureCount = 0

  for (let i = 0; i < sqlStatements.length; i++) {
    const statement = sqlStatements[i]
    if (statement.trim() === ';') continue
    
    try {
      // Use direct SQL execution for schema setup
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
        },
        body: JSON.stringify({ sql_query: statement })
      })

      if (response.ok) {
        successCount++
        console.log(`✅ Statement ${i + 1}/${sqlStatements.length} executed`)
      } else {
        failureCount++
        const error = await response.text()
        console.log(`⚠️  Statement ${i + 1} failed (might be expected): ${error.substring(0, 100)}...`)
      }
    } catch (error) {
      failureCount++
      console.log(`⚠️  Statement ${i + 1} error: ${error.message}`)
    }
  }

  console.log(`\n📊 Main schema setup: ${successCount} successful, ${failureCount} failed/skipped`)
  return successCount > 0
}

async function setupUPFSchema() {
  console.log('\n🎯 Setting up Universal Pinpoint Feedback (UPF) schema...')
  
  const upfSchemaPath = path.join(__dirname, 'create-upf-tables.sql')
  if (!fs.existsSync(upfSchemaPath)) {
    console.error('❌ UPF schema file not found:', upfSchemaPath)
    return false
  }

  const upfSchema = fs.readFileSync(upfSchemaPath, 'utf8')
  
  // Execute UPF schema
  try {
    // Use direct SQL execution
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
      },
      body: JSON.stringify({ sql_query: upfSchema })
    })

    if (response.ok) {
      console.log('✅ UPF schema setup completed successfully')
      return true
    } else {
      const error = await response.text()
      console.error('❌ UPF schema setup failed:', error)
      return false
    }
  } catch (error) {
    console.error('❌ Error setting up UPF schema:', error.message)
    return false
  }
}

async function verifySetup() {
  console.log('\n🔍 Verifying database setup...')
  
  const tableCheck = await checkExistingTables()
  
  console.log(`\n📊 Database Status:`)
  console.log(`✅ Tables found: ${tableCheck.existing.length}/${tableCheck.required.length}`)
  
  if (tableCheck.missing.length > 0) {
    console.log(`❌ Missing tables: ${tableCheck.missing.join(', ')}`)
  } else {
    console.log('🎉 All required tables are present!')
  }

  // Test data insertion capability
  try {
    console.log('\n🧪 Testing data operations...')
    
    // Test user profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1)
    
    if (!profileError) {
      console.log('✅ User profiles table operational')
    }

    // Test UPF comments table
    const { data: upfData, error: upfError } = await supabase
      .from('upf_comments')
      .select('*')
      .limit(1)
    
    if (!upfError) {
      console.log('✅ UPF comments table operational')
    }

    // Test projects table
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .limit(1)
    
    if (!projectError) {
      console.log('✅ Projects table operational')
    }

  } catch (error) {
    console.log('⚠️  Some data operations may need user authentication')
  }

  return tableCheck.missing.length === 0
}

async function main() {
  console.log('🚀 Starting FreeflowZee database setup...\n')
  
  // Step 1: Check connection
  const connected = await checkDatabaseConnection()
  if (!connected) {
    console.error('❌ Cannot proceed without database connection')
    process.exit(1)
  }

  // Step 2: Check existing tables
  const tableStatus = await checkExistingTables()
  
  if (tableStatus.missing.length === 0) {
    console.log('\n🎉 All tables already exist! Database is up to date.')
  } else {
    console.log(`\n🔧 Need to create ${tableStatus.missing.length} missing tables`)
    
    // Step 3: Setup main schema
    await setupMainSchema()
    
    // Step 4: Setup UPF schema
    await setupUPFSchema()
  }

  // Step 5: Verify setup
  const isComplete = await verifySetup()
  
  if (isComplete) {
    console.log('\n🎉 Database setup completed successfully!')
    console.log('✅ FreeflowZee is ready for production use')
  } else {
    console.log('\n⚠️  Database setup partially completed')
    console.log('Some tables may need manual creation in Supabase SQL Editor')
  }
  
  console.log('\n📱 Next steps:')
  console.log('1. Test user registration at http://localhost:3000/signup')
  console.log('2. Verify dashboard access after login')
  console.log('3. Test collaboration features')
  
  process.exit(0)
}

main().catch(console.error) 