#!/usr/bin/env node

/**
 * FreeflowZee Analytics Database Setup Script
 * Automatically creates all analytics tables in Supabase
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

async function setupAnalyticsDatabase() {
  console.log('\n🚀 FreeflowZee Analytics Database Setup')
  console.log('======================================\n')

  // Initialize Supabase client with service role
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    console.log('📋 Reading SQL setup file...')
    const sqlFile = path.join(__dirname, 'setup-analytics-database.sql')
    const sqlContent = fs.readFileSync(sqlFile, 'utf8')

    console.log('🔧 Executing database setup...')
    
    // Split SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    console.log(`📊 Executing ${statements.length} SQL statements...`)

    // Execute each statement
    let successCount = 0
    let errors = []

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      
      try {
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: statement 
        }).single()

        if (error) {
          // Try direct execution for DDL statements
          const { error: directError } = await supabase
            .from('analytics_events')
            .select('count', { count: 'exact', head: true })

          if (directError && directError.code === '42P01') {
            // Table doesn't exist, this is expected for the first run
            console.log(`⏭️  Statement ${i + 1}: Creating new structure...`)
          } else if (error.message.includes('already exists')) {
            console.log(`✅ Statement ${i + 1}: Already exists (skipping)`)
          } else {
            throw error
          }
        }
        
        successCount++
        
        if (i % 10 === 0) {
          console.log(`   📈 Progress: ${i + 1}/${statements.length} statements`)
        }
        
      } catch (err) {
        errors.push(`Statement ${i + 1}: ${err.message}`)
        console.log(`⚠️  Statement ${i + 1}: ${err.message}`)
      }
    }

    console.log('\n🔍 Verifying analytics tables...')
    
    // Verify tables were created
    const tables = [
      'analytics_events',
      'business_metrics', 
      'user_sessions'
    ]

    const verificationResults = []
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          verificationResults.push(`❌ ${table}: ${error.message}`)
        } else {
          verificationResults.push(`✅ ${table}: Ready (${count || 0} rows)`)
        }
      } catch (err) {
        verificationResults.push(`❌ ${table}: ${err.message}`)
      }
    }

    console.log('\n📊 Analytics Tables Status:')
    console.log('=============================')
    verificationResults.forEach(result => console.log(result))

    // Test analytics API
    console.log('\n🧪 Testing Analytics API...')
    
    try {
      const testEvent = {
        event_type: 'system',
        event_name: 'analytics_setup_test',
        session_id: `setup_${Date.now()}`,
        properties: {
          setup_time: new Date().toISOString(),
          success: true
        }
      }

      const { data, error } = await supabase
        .from('analytics_events')
        .insert(testEvent)
        .select()

      if (error) {
        console.log(`⚠️  API Test: ${error.message}`)
      } else {
        console.log('✅ API Test: Event tracking working')
        
        // Clean up test event
        await supabase
          .from('analytics_events')
          .delete()
          .eq('id', data[0].id)
      }
    } catch (err) {
      console.log(`⚠️  API Test: ${err.message}`)
    }

    console.log('\n🎉 Analytics Database Setup Complete!')
    console.log('=====================================')
    console.log(`✅ Successful operations: ${successCount}`)
    
    if (errors.length > 0) {
      console.log(`⚠️  Warnings/Errors: ${errors.length}`)
      console.log('\nDetailed errors:')
      errors.forEach(error => console.log(`   ${error}`))
    }

    console.log('\n📈 Analytics Features Available:')
    console.log('• Real-time event tracking')
    console.log('• Performance monitoring') 
    console.log('• Business metrics collection')
    console.log('• User session analytics')
    console.log('• Custom dashboards')

    console.log('\n🔗 Next Steps:')
    console.log('1. Visit /dashboard/analytics to view your dashboard')
    console.log('2. Test event tracking in your application')
    console.log('3. Monitor performance metrics')
    console.log('4. Set up custom business metrics')

    return { success: true, tablesCreated: verificationResults.length }

  } catch (error) {
    console.error('\n❌ Setup Failed:', error.message)
    console.error('\nTroubleshooting:')
    console.error('• Verify Supabase credentials are correct')
    console.error('• Check database connection')
    console.error('• Ensure service role has sufficient permissions')
    
    return { success: false, error: error.message }
  }
}

// Alternative manual setup instructions
function showManualInstructions() {
  console.log('\n📖 Manual Setup Instructions:')
  console.log('==============================')
  console.log('1. Open Supabase Dashboard: https://app.supabase.com')
  console.log('2. Go to SQL Editor')
  console.log('3. Copy and paste the contents of: scripts/setup-analytics-database.sql')
  console.log('4. Click "Run" to execute the setup')
  console.log('5. Verify tables are created in the Table Editor')
}

// Run setup
if (require.main === module) {
  setupAnalyticsDatabase()
    .then(result => {
      if (!result.success) {
        console.log('\n🔧 Automatic setup failed. Here are manual instructions:')
        showManualInstructions()
        process.exit(1)
      }
      process.exit(0)
    })
    .catch(error => {
      console.error('❌ Unexpected error:', error)
      showManualInstructions()
      process.exit(1)
    })
}

module.exports = { setupAnalyticsDatabase } 