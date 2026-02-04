#!/usr/bin/env node
/**
 * Direct Demo Test - No browser needed
 * Tests API endpoints and data directly
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const DEMO_EMAIL = 'alex@freeflow.io'

console.log('\n╔═══════════════════════════════════════════════════════════╗')
console.log('║  🎯 KAZI Direct Demo Verification                        ║')
console.log('║  Testing alex@freeflow.io data without browser          ║')
console.log('╚═══════════════════════════════════════════════════════════╝\n')

async function main() {
  let passCount = 0
  let totalTests = 0

  // Test 1: Demo user exists
  totalTests++
  console.log('1️⃣  Verifying Demo User')
  console.log('─'.repeat(65))
  const { data: users } = await supabase.auth.admin.listUsers()
  const demoUser = users?.users.find(u => u.email === DEMO_EMAIL)

  if (demoUser) {
    console.log('✅ Demo user exists:', DEMO_EMAIL)
    console.log('   User ID:', demoUser.id)
    console.log('   Email verified:', demoUser.email_confirmed_at ? 'Yes' : 'No')
    passCount++
  } else {
    console.log('❌ Demo user not found')
    return
  }

  const userId = demoUser.id

  // Test 2: Clients
  totalTests++
  console.log('\n2️⃣  Checking Clients Data')
  console.log('─'.repeat(65))
  const { data: clients, count: clientCount } = await supabase
    .from('clients')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)

  if (clientCount && clientCount > 0) {
    console.log(`✅ Found ${clientCount} clients`)
    if (clients && clients.length > 0) {
      console.log('   Sample clients:', clients.slice(0, 3).map(c => c.name || c.company_name).join(', '))
    }
    passCount++
  } else {
    console.log('❌ No clients found')
  }

  // Test 3: Projects
  totalTests++
  console.log('\n3️⃣  Checking Projects Data')
  console.log('─'.repeat(65))
  const { data: projects, count: projectCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)

  if (projectCount && projectCount > 0) {
    console.log(`✅ Found ${projectCount} projects`)
    if (projects && projects.length > 0) {
      console.log('   Sample projects:', projects.slice(0, 3).map(p => p.name).join(', '))
    }
    passCount++
  } else {
    console.log('❌ No projects found')
  }

  // Test 4: Invoices
  totalTests++
  console.log('\n4️⃣  Checking Invoices Data')
  console.log('─'.repeat(65))
  const { data: invoices, count: invoiceCount } = await supabase
    .from('invoices')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)

  if (invoiceCount && invoiceCount > 0) {
    console.log(`✅ Found ${invoiceCount} invoices`)
    const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0
    console.log(`   Total invoice value: $${totalRevenue.toLocaleString()}`)
    passCount++
  } else {
    console.log('❌ No invoices found')
  }

  // Test 5: AI Conversations
  totalTests++
  console.log('\n5️⃣  Checking AI Usage')
  console.log('─'.repeat(65))
  const { count: aiCount } = await supabase
    .from('ai_conversations')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)

  if (aiCount && aiCount > 0) {
    console.log(`✅ Found ${aiCount} AI conversations`)
    passCount++
  } else {
    console.log('⚠️  No AI conversations (optional)')
  }

  // Test 6: Time Tracking
  totalTests++
  console.log('\n6️⃣  Checking Time Tracking')
  console.log('─'.repeat(65))
  const { count: timeCount } = await supabase
    .from('time_entries')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)

  if (timeCount && timeCount > 0) {
    console.log(`✅ Found ${timeCount} time entries`)
    passCount++
  } else {
    console.log('⚠️  No time entries (optional)')
  }

  // Test 7: Tasks
  totalTests++
  console.log('\n7️⃣  Checking Tasks')
  console.log('─'.repeat(65))
  const { count: taskCount } = await supabase
    .from('tasks')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)

  if (taskCount && taskCount > 0) {
    console.log(`✅ Found ${taskCount} tasks`)
    passCount++
  } else {
    console.log('⚠️  No tasks (optional)')
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════')
  console.log('📊 VERIFICATION SUMMARY')
  console.log('═══════════════════════════════════════════════════════════')
  console.log(`✅ Tests Passed: ${passCount}/${totalTests}`)
  const successRate = ((passCount / totalTests) * 100).toFixed(1)
  console.log(`🎯 Success Rate: ${successRate}%`)

  if (successRate >= 80) {
    console.log('\n🚀 STATUS: DEMO DATA READY! ✨')
    console.log('   Your demo user has comprehensive data.')
  } else if (successRate >= 60) {
    console.log('\n⚡ STATUS: MOSTLY READY')
    console.log('   Core data present, some optional data missing.')
  } else {
    console.log('\n⚠️  STATUS: NEEDS MORE DATA')
    console.log('   Run: npx tsx scripts/seed-complete-investor-story.ts')
  }

  console.log('\n📝 DEMO ACCESS:')
  console.log('   URL:      http://localhost:9323')
  console.log('   Email:    alex@freeflow.io')
  console.log('   Password: investor2026')
  console.log('\n═══════════════════════════════════════════════════════════\n')
}

main().catch(console.error)
