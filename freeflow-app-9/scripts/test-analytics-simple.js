#!/usr/bin/env node

/**
 * Simple Analytics Test - Testing each component individually
 */

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🧪 Step-by-Step Analytics Test')
console.log('===============================\n')

async function test() {
  // Step 1: Test environment variables
  console.log('🔧 Step 1: Testing Environment Variables')
  console.log(`✅ Supabase URL: ${supabaseUrl ? 'EXISTS' : 'MISSING'}`)
  console.log(`✅ Service Key: ${supabaseServiceKey ? 'EXISTS' : 'MISSING'}\n`)
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('❌ Missing environment variables')
    return
  }
  
  // Step 2: Test Supabase connection
  console.log('🔧 Step 2: Testing Supabase Connection')
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  try {
    const { data, error } = await supabase.from('analytics_events').select('count').limit(1)
    if (error) {
      console.log('❌ Supabase connection failed:', error.message)
      return
    }
    console.log('✅ Supabase connection successful\n')
  } catch (e) {
    console.log('❌ Supabase connection error:', e.message)
    return
  }
  
  // Step 3: Test table structure
  console.log('🔧 Step 3: Testing Table Structure')
  try {
    const { data, error } = await supabase.from('analytics_events').select('*').limit(1)'
    if (error) {
      console.log('❌ Table query failed: ', error.message)
      return
    }
    console.log('✅ Analytics events table accessible')
    
    const { data: metricsData, error: metricsError } = await supabase.from('business_metrics').select('*').limit(1)'
    if (metricsError) {
      console.log('❌ Business metrics table failed: ', metricsError.message)
      return
    }
    console.log('✅ Business metrics table accessible\n')
  } catch (e) {
    console.log('❌ Table structure error:', e.message)
    return
  }
  
  // Step 4: Test simple insert
  console.log('🔧 Step 4: Testing Simple Insert')
  try {
    const testEvent = {
      event_type: 'test',
      event_name: 'simple_test',
      session_id: 'test_session_' + Date.now(),
      timestamp: new Date().toISOString(),
      properties: { test: true },
      page_url: '/test',
      user_agent: 'test-agent',
      ip_address: '127.0.0.1'
    }
    
    const { data, error } = await supabase
      .from('analytics_events')
      .insert(testEvent)
      .select()
    
    if (error) {
      console.log('❌ Insert failed:', error.message)
      return
    }
    
    console.log('✅ Insert successful!')
    console.log(`   Event ID: ${data[0]?.id}`)
    console.log(`   Event Type: ${data[0]?.event_type}\n`)
  } catch (e) {
    console.log('❌ Insert error:', e.message)
    return
  }
  
  // Step 5: Test API endpoint (if server is running)
  console.log('🔧 Step 5: Testing API Endpoint')
  try {
    const response = await fetch('http://localhost:3000/api/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'test',
        event_name: 'api_test',
        session_id: 'api_test_session_' + Date.now()
      })
    })
    
    const result = await response.json()
    
    if (result.success) {
      console.log('✅ API endpoint working!')
      console.log(`   Response: ${JSON.stringify(result)}`)
    } else {
      console.log('❌ API endpoint failed:', result.error)
    }
  } catch (e) {
    console.log('⚠️  API endpoint test skipped (server may not be running)')
    console.log(`   Error: ${e.message}`)
  }
  
  console.log('\n🎉 Test Complete!')
}

test().catch(console.error) 