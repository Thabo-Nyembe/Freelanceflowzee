#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

console.log('\n╔═══════════════════════════════════════════════════════════╗')
console.log('║  🔍 COMPREHENSIVE DATA VERIFICATION                      ║')
console.log('║  Checking ALL demo data for alex@freeflow.io             ║')
console.log('╚═══════════════════════════════════════════════════════════╝\n')

const tables = [
  { name: 'clients', description: 'Client/CRM data' },
  { name: 'projects', description: 'Project management' },
  { name: 'invoices', description: 'Financial invoices' },
  { name: 'tasks', description: 'Task management' },
  { name: 'time_entries', description: 'Time tracking' },
  { name: 'expenses', description: 'Expense tracking' },
  { name: 'deals', description: 'Sales pipeline' },
  { name: 'leads', description: 'Lead generation' },
  { name: 'team_members', description: 'Team management' },
  { name: 'ai_conversations', description: 'AI usage' },
  { name: 'files', description: 'File storage' },
  { name: 'dashboard_stats', description: 'Dashboard overview' },
  { name: 'dashboard_metrics', description: 'KPI metrics' },
  { name: 'investor_metrics', description: 'Investor KPIs' },
  { name: 'dashboard_activities', description: 'Activity feed' },
  { name: 'dashboard_insights', description: 'Business insights' },
  { name: 'dashboard_goals', description: 'Goal tracking' },
  { name: 'contracts', description: 'Contract management' },
  { name: 'proposals', description: 'Proposals' },
  { name: 'meetings', description: 'Meeting scheduling' },
]

let totalCount = 0
let tablesWithData = 0
let tablesEmpty = 0

console.log('📊 Querying all tables...\n')

for (const table of tables) {
  try {
    const { data, count, error } = await supabase
      .from(table.name)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', DEMO_USER_ID)

    if (error) {
      console.log(`⚠️  ${table.name.padEnd(25)} - Error: ${error.message}`)
    } else {
      const displayCount = count || 0
      totalCount += displayCount

      if (displayCount > 0) {
        console.log(`✅ ${table.name.padEnd(25)} - ${displayCount.toString().padStart(4)} records - ${table.description}`)
        tablesWithData++
      } else {
        console.log(`⚪ ${table.name.padEnd(25)} -    0 records - ${table.description}`)
        tablesEmpty++
      }
    }
  } catch (error) {
    console.log(`❌ ${table.name.padEnd(25)} - Exception: ${error.message}`)
  }
}

console.log('\n═══════════════════════════════════════════════════════════')
console.log('📈 SUMMARY')
console.log('═══════════════════════════════════════════════════════════')
console.log(`Total Records:        ${totalCount.toLocaleString()}`)
console.log(`Tables With Data:     ${tablesWithData}/${tables.length}`)
console.log(`Empty Tables:         ${tablesEmpty}/${tables.length}`)
console.log(`Coverage:             ${((tablesWithData / tables.length) * 100).toFixed(1)}%`)

console.log('\n🎯 KEY DEMO DATA:')
console.log('═══════════════════════════════════════════════════════════')

// Get sample data from key tables
const { data: clients } = await supabase
  .from('clients')
  .select('name, company_name, email')
  .eq('user_id', DEMO_USER_ID)
  .limit(3)

if (clients && clients.length > 0) {
  console.log('\n📋 Sample Clients:')
  clients.forEach((c, i) => {
    console.log(`   ${i + 1}. ${c.name || c.company_name || 'Unnamed'} ${c.email ? `(${c.email})` : ''}`)
  })
}

const { data: projects } = await supabase
  .from('projects')
  .select('name, status')
  .eq('user_id', DEMO_USER_ID)
  .limit(3)

if (projects && projects.length > 0) {
  console.log('\n📂 Sample Projects:')
  projects.forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.name} (${p.status || 'Active'})`)
  })
}

const { data: invoices } = await supabase
  .from('invoices')
  .select('invoice_number, amount, status')
  .eq('user_id', DEMO_USER_ID)
  .limit(3)

if (invoices && invoices.length > 0) {
  console.log('\n💰 Sample Invoices:')
  invoices.forEach((inv, i) => {
    const amount = inv.amount ? `$${inv.amount.toLocaleString()}` : 'N/A'
    console.log(`   ${i + 1}. ${inv.invoice_number || 'N/A'} - ${amount} (${inv.status || 'Pending'})`)
  })
}

console.log('\n═══════════════════════════════════════════════════════════')

if (tablesWithData >= 10) {
  console.log('🎉 EXCELLENT: Comprehensive demo data ready!')
  console.log('   Your platform has data across multiple modules.')
} else if (tablesWithData >= 5) {
  console.log('✅ GOOD: Core demo data ready!')
  console.log('   Essential tables have data for showcase.')
} else {
  console.log('⚠️  LIMITED: Some demo data present.')
  console.log('   Consider seeding more data for comprehensive demo.')
}

console.log('═══════════════════════════════════════════════════════════\n')
