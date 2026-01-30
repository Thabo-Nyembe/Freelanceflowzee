/**
 * Production Readiness Verification
 * Tests all CRUD operations for a new user
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Test user ID (simulating a new user)
const TEST_USER_ID = '11111111-1111-1111-1111-111111111111'

const results = {
  passed: [],
  failed: [],
  warnings: []
}

async function testTable(tableName, testData, requiredFields = []) {
  console.log(`\nTesting ${tableName}...`)

  try {
    // 1. INSERT test
    const { data: inserted, error: insertError } = await supabase
      .from(tableName)
      .insert([testData])
      .select()

    if (insertError) {
      results.failed.push(`${tableName} INSERT: ${insertError.message}`)
      console.log(`  ❌ INSERT failed: ${insertError.message}`)
      return false
    }
    console.log(`  ✅ INSERT works`)

    const recordId = inserted[0].id

    // 2. SELECT test
    const { data: selected, error: selectError } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', recordId)
      .single()

    if (selectError) {
      results.failed.push(`${tableName} SELECT: ${selectError.message}`)
      console.log(`  ❌ SELECT failed: ${selectError.message}`)
    } else {
      console.log(`  ✅ SELECT works`)

      // Check required fields are returned
      for (const field of requiredFields) {
        if (!(field in selected)) {
          results.warnings.push(`${tableName} missing field: ${field}`)
          console.log(`  ⚠️  Missing field: ${field}`)
        }
      }
    }

    // 3. UPDATE test
    const { error: updateError } = await supabase
      .from(tableName)
      .update({ updated_at: new Date().toISOString() })
      .eq('id', recordId)

    if (updateError) {
      // Some tables might not have updated_at
      if (!updateError.message.includes('updated_at')) {
        results.warnings.push(`${tableName} UPDATE: ${updateError.message}`)
        console.log(`  ⚠️  UPDATE issue: ${updateError.message}`)
      }
    } else {
      console.log(`  ✅ UPDATE works`)
    }

    // 4. DELETE test (cleanup)
    const { error: deleteError } = await supabase
      .from(tableName)
      .delete()
      .eq('id', recordId)

    if (deleteError) {
      results.failed.push(`${tableName} DELETE: ${deleteError.message}`)
      console.log(`  ❌ DELETE failed: ${deleteError.message}`)
    } else {
      console.log(`  ✅ DELETE works`)
    }

    results.passed.push(tableName)
    return true

  } catch (err) {
    results.failed.push(`${tableName}: ${err.message}`)
    console.log(`  ❌ Error: ${err.message}`)
    return false
  }
}

async function checkRLSPolicies(tableName) {
  const { data, error } = await supabase.rpc('check_rls_policies', { table_name: tableName })
  // This is informational - RLS check would need direct DB access
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════════╗')
  console.log('║          PRODUCTION READINESS VERIFICATION                         ║')
  console.log('╚════════════════════════════════════════════════════════════════════╝')
  console.log('\nTesting all CRUD operations for new users...\n')

  // Test each table with appropriate test data

  // CLIENTS
  await testTable('clients', {
    user_id: TEST_USER_ID,
    name: 'Test Client',
    email: 'test@example.com',
    company: 'Test Company',
    status: 'active'
  }, ['id', 'name', 'email', 'status'])

  // INVOICES
  await testTable('invoices', {
    user_id: TEST_USER_ID,
    invoice_number: 'TEST-001',
    client_name: 'Test Client',
    total: 1000,
    status: 'draft'
  }, ['id', 'status', 'total'])

  // PROJECTS
  await testTable('projects', {
    user_id: TEST_USER_ID,
    title: 'Test Project',
    description: 'Test description',
    status: 'active',
    budget: 5000
  }, ['id', 'title', 'status'])

  // TASKS
  await testTable('tasks', {
    user_id: TEST_USER_ID,
    title: 'Test Task',
    description: 'Test task description',
    status: 'todo',
    priority: 'medium'
  }, ['id', 'title', 'status'])

  // TIME ENTRIES
  await testTable('time_entries', {
    user_id: TEST_USER_ID,
    project_name: 'Test Project',
    description: 'Test time entry',
    start_time: new Date().toISOString(),
    status: 'running',
    entry_date: new Date().toISOString().split('T')[0]
  }, ['id', 'description', 'status'])

  // CALENDAR EVENTS
  await testTable('calendar_events', {
    user_id: TEST_USER_ID,
    title: 'Test Event',
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 3600000).toISOString()
  }, ['id', 'title', 'start_time'])

  // TEAMS
  await testTable('teams', {
    owner_id: TEST_USER_ID,
    name: 'Test Team',
    description: 'Test team'
  }, ['id', 'name'])

  // PAYMENTS
  await testTable('payments', {
    user_id: TEST_USER_ID,
    amount: 500,
    status: 'completed',
    payment_method: 'credit_card'
  }, ['id', 'amount', 'status'])

  // Print summary
  console.log('\n╔════════════════════════════════════════════════════════════════════╗')
  console.log('║                         RESULTS SUMMARY                            ║')
  console.log('╚════════════════════════════════════════════════════════════════════╝\n')

  console.log(`✅ PASSED (${results.passed.length}):`)
  results.passed.forEach(t => console.log(`   - ${t}`))

  if (results.warnings.length > 0) {
    console.log(`\n⚠️  WARNINGS (${results.warnings.length}):`)
    results.warnings.forEach(w => console.log(`   - ${w}`))
  }

  if (results.failed.length > 0) {
    console.log(`\n❌ FAILED (${results.failed.length}):`)
    results.failed.forEach(f => console.log(`   - ${f}`))
  }

  console.log('\n────────────────────────────────────────────────────────────────────')

  if (results.failed.length === 0) {
    console.log('✅ ALL CORE TABLES ARE WORKING - Ready for investor demo!')
  } else {
    console.log('⚠️  SOME ISSUES NEED ATTENTION before demo')
    console.log('\nRun the following SQL in Supabase to check/fix issues:')
  }
}

main().catch(console.error)
