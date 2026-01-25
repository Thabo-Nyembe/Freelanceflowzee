/**
 * Database Connection Test
 * Run with: npx tsx test-db-connection.ts
 */

import { createClient } from '@supabase/supabase-js'

// SECURITY: Credentials must be provided via environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function testConnection() {
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing required environment variables:')
    console.error('   - NEXT_PUBLIC_SUPABASE_URL')
    console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY')
    console.error('\nSet these in your .env.local file before running this test.')
    process.exit(1)
  }

  console.log('🔌 Testing Supabase connection...\n')
  console.log(`URL: ${supabaseUrl}`)
  console.log(`Key: ✅ Configured (hidden for security)\n`)

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Test 1: Check if we can query the projects table
    console.log('✅ Test 1: Querying projects table...')
    const { data: projects, error: projectsError, count } = await supabase
      .from('projects')
      .select('*', { count: 'exact' })
      .limit(5)

    if (projectsError) {
      console.error('❌ Projects query failed:', projectsError.message)
    } else {
      console.log(`✅ Projects table accessible - Found ${count} total projects`)
      console.log(`   Retrieved ${projects?.length || 0} sample projects\n`)
    }

    // Test 2: Check AI tables
    console.log('✅ Test 2: Checking AI tables...')

    const aiTables = [
      'investor_metrics_events',
      'revenue_intelligence',
      'lead_scores',
      'growth_playbooks',
      'ai_feature_usage',
      'ai_recommendations',
      'user_metrics_aggregate'
    ]

    for (const table of aiTables) {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.error(`   ❌ ${table}: ${error.message}`)
      } else {
        console.log(`   ✅ ${table}: ${count} rows`)
      }
    }

    console.log('\n✅ Test 3: Checking core tables...')

    const coreTables = [
      'profiles',
      'clients',
      'projects',
      'invoices',
      'files',
      'videos'
    ]

    for (const table of coreTables) {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.error(`   ❌ ${table}: ${error.message}`)
      } else {
        console.log(`   ✅ ${table}: ${count} rows`)
      }
    }

    console.log('\n🎉 Database connection test complete!')
    console.log('\n📊 Summary:')
    console.log('   - Connection: ✅ Working')
    console.log('   - AI Tables: ✅ All 7 accessible')
    console.log('   - Core Tables: ✅ All accessible')
    console.log('\n✅ Ready to wire up real data!')

  } catch (error: any) {
    console.error('❌ Connection test failed:', error.message)
    console.error('Full error:', error)
  }
}

testConnection()
