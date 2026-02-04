/**
 * KAZI Showcase Readiness Verification
 *
 * This script verifies that the demo user (alex@freeflow.io) is ready
 * for investor/showcase presentations with all necessary data populated.
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const DEMO_USER_EMAIL = 'alex@freeflow.io'

interface VerificationResult {
  section: string
  status: 'PASS' | 'FAIL' | 'WARN'
  message: string
  count?: number
  details?: string[]
}

const results: VerificationResult[] = []

async function log(section: string, status: 'PASS' | 'FAIL' | 'WARN', message: string, count?: number, details?: string[]) {
  const emoji = status === 'PASS' ? '✅' : status === 'WARN' ? '⚠️' : '❌'
  const countStr = count !== undefined ? ` (${count})` : ''
  console.log(`${emoji} ${section}: ${message}${countStr}`)
  if (details && details.length > 0) {
    details.forEach(d => console.log(`   - ${d}`))
  }
  results.push({ section, status, message, count, details })
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════')
  console.log('🎯 KAZI SHOWCASE READINESS VERIFICATION')
  console.log('   Demo User: alex@freeflow.io')
  console.log('   Date:', new Date().toLocaleString())
  console.log('═══════════════════════════════════════════════════════════\n')

  // ============================================================================
  // 1. USER AUTHENTICATION
  // ============================================================================
  console.log('1️⃣  USER AUTHENTICATION')
  console.log('─────────────────────────────────────────────────────────────')

  const { data: user, error: userError } = await supabase.auth.admin.listUsers()
  const demoUser = user?.users.find(u => u.email === DEMO_USER_EMAIL)

  if (demoUser) {
    await log('User Exists', 'PASS', 'Demo user found in auth system')
    await log('User ID', 'PASS', demoUser.id)
    await log('Email Verified', demoUser.email_confirmed_at ? 'PASS' : 'WARN',
      demoUser.email_confirmed_at ? 'Email confirmed' : 'Email not confirmed')
  } else {
    await log('User Exists', 'FAIL', 'Demo user NOT found - needs creation')
    console.log('\n🔧 To create demo user, run:')
    console.log('   npx tsx scripts/seed-demo-user-only.ts\n')
    return
  }

  const userId = demoUser.id

  // ============================================================================
  // 2. CORE BUSINESS DATA
  // ============================================================================
  console.log('\n2️⃣  CORE BUSINESS DATA')
  console.log('─────────────────────────────────────────────────────────────')

  // Check clients
  const { data: clients, count: clientCount } = await supabase
    .from('clients')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)

  if (clientCount && clientCount >= 5) {
    await log('Clients', 'PASS', 'Sufficient client data', clientCount)
  } else {
    await log('Clients', 'WARN', 'Limited client data', clientCount || 0,
      ['Recommended: 8-12 clients for compelling story'])
  }

  // Check projects
  const { data: projects, count: projectCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)

  if (projectCount && projectCount >= 5) {
    await log('Projects', 'PASS', 'Sufficient project data', projectCount)
  } else {
    await log('Projects', 'WARN', 'Limited project data', projectCount || 0,
      ['Recommended: 8-12 projects showing progression'])
  }

  // Check invoices
  const { data: invoices, count: invoiceCount } = await supabase
    .from('invoices')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)

  if (invoiceCount && invoiceCount >= 5) {
    await log('Invoices', 'PASS', 'Sufficient invoice data', invoiceCount)

    // Calculate total revenue
    const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0
    if (totalRevenue > 50000) {
      await log('Revenue', 'PASS', `Strong revenue story: $${totalRevenue.toLocaleString()}`)
    } else {
      await log('Revenue', 'WARN', `Moderate revenue: $${totalRevenue.toLocaleString()}`,
        undefined, ['Recommended: $100K+ for compelling investor narrative'])
    }
  } else {
    await log('Invoices', 'WARN', 'Limited invoice data', invoiceCount || 0,
      ['Recommended: 8-15 invoices showing growth'])
  }

  // Check team members
  const { count: teamCount } = await supabase
    .from('team_members')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)

  if (teamCount && teamCount >= 2) {
    await log('Team', 'PASS', 'Team data present', teamCount)
  } else {
    await log('Team', 'WARN', 'Limited team data', teamCount || 0,
      ['Shows scaling: 0 → 3+ team members'])
  }

  // ============================================================================
  // 3. DASHBOARD METRICS
  // ============================================================================
  console.log('\n3️⃣  DASHBOARD METRICS')
  console.log('─────────────────────────────────────────────────────────────')

  // Dashboard stats
  const { data: stats, count: statsCount } = await supabase
    .from('dashboard_stats')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)

  await log('Dashboard Stats', statsCount && statsCount > 0 ? 'PASS' : 'WARN',
    'Overview statistics', statsCount || 0)

  // Dashboard metrics (KPIs)
  const { data: metrics, count: metricsCount } = await supabase
    .from('dashboard_metrics')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)

  if (metricsCount && metricsCount >= 6) {
    await log('KPI Metrics', 'PASS', 'Key performance indicators', metricsCount)
  } else {
    await log('KPI Metrics', 'WARN', 'Limited KPI data', metricsCount || 0,
      ['Recommended: 8-10 KPIs for comprehensive dashboard'])
  }

  // Investor metrics
  const { data: investorMetrics, count: investorCount } = await supabase
    .from('investor_metrics')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)

  if (investorCount && investorCount >= 5) {
    await log('Investor Metrics', 'PASS', 'MRR, ARR, LTV, CAC present', investorCount)
  } else {
    await log('Investor Metrics', 'WARN', 'Limited investor metrics', investorCount || 0,
      ['Critical for investor demos'])
  }

  // ============================================================================
  // 4. CRM & SALES DATA
  // ============================================================================
  console.log('\n4️⃣  CRM & SALES DATA')
  console.log('─────────────────────────────────────────────────────────────')

  // Leads
  const { count: leadsCount } = await supabase
    .from('leads')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)

  if (leadsCount && leadsCount >= 8) {
    await log('Leads', 'PASS', 'Lead generation data', leadsCount)
  } else {
    await log('Leads', 'WARN', 'Limited leads data', leadsCount || 0,
      ['Shows 45% conversion vs 2% industry avg'])
  }

  // Deals/Opportunities
  const { count: dealsCount } = await supabase
    .from('deals')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)

  await log('Deals', dealsCount && dealsCount >= 3 ? 'PASS' : 'WARN',
    'Sales pipeline data', dealsCount || 0)

  // ============================================================================
  // 5. CONTENT & CREATIVE
  // ============================================================================
  console.log('\n5️⃣  CONTENT & CREATIVE')
  console.log('─────────────────────────────────────────────────────────────')

  // AI conversations
  const { count: aiCount } = await supabase
    .from('ai_conversations')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)

  await log('AI Conversations', aiCount && aiCount >= 5 ? 'PASS' : 'WARN',
    'AI usage data', aiCount || 0,
    aiCount && aiCount < 5 ? ['Shows AI-native platform value'] : undefined)

  // Files/Gallery
  const { count: filesCount } = await supabase
    .from('files')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)

  await log('Files/Gallery', filesCount && filesCount >= 3 ? 'PASS' : 'WARN',
    'Creative assets', filesCount || 0)

  // ============================================================================
  // 6. ACTIVITY & ENGAGEMENT
  // ============================================================================
  console.log('\n6️⃣  ACTIVITY & ENGAGEMENT')
  console.log('─────────────────────────────────────────────────────────────')

  // Dashboard activities
  const { count: activitiesCount } = await supabase
    .from('dashboard_activities')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)

  await log('Activities', activitiesCount && activitiesCount >= 10 ? 'PASS' : 'WARN',
    'User activity timeline', activitiesCount || 0)

  // Tasks
  const { count: tasksCount } = await supabase
    .from('tasks')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)

  await log('Tasks', tasksCount && tasksCount >= 5 ? 'PASS' : 'WARN',
    'Task management data', tasksCount || 0)

  // ============================================================================
  // 7. FINANCIAL REPORTS
  // ============================================================================
  console.log('\n7️⃣  FINANCIAL REPORTS')
  console.log('─────────────────────────────────────────────────────────────')

  // Expenses
  const { count: expensesCount } = await supabase
    .from('expenses')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)

  await log('Expenses', expensesCount && expensesCount >= 5 ? 'PASS' : 'WARN',
    'Expense tracking', expensesCount || 0)

  // Time tracking
  const { count: timeCount } = await supabase
    .from('time_entries')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)

  await log('Time Tracking', timeCount && timeCount >= 10 ? 'PASS' : 'WARN',
    'Billable hours data', timeCount || 0)

  // ============================================================================
  // FINAL SUMMARY
  // ============================================================================
  console.log('\n═══════════════════════════════════════════════════════════')
  console.log('📊 SUMMARY')
  console.log('═══════════════════════════════════════════════════════════')

  const passCount = results.filter(r => r.status === 'PASS').length
  const warnCount = results.filter(r => r.status === 'WARN').length
  const failCount = results.filter(r => r.status === 'FAIL').length
  const total = results.length

  console.log(`✅ PASS: ${passCount}/${total}`)
  console.log(`⚠️  WARN: ${warnCount}/${total}`)
  console.log(`❌ FAIL: ${failCount}/${total}`)

  const score = (passCount / total) * 100
  console.log(`\n🎯 Readiness Score: ${score.toFixed(1)}%`)

  if (score >= 80) {
    console.log('\n🚀 STATUS: SHOWCASE READY! ✨')
    console.log('   Your demo is well-prepared for investor presentations.')
  } else if (score >= 60) {
    console.log('\n⚡ STATUS: MOSTLY READY')
    console.log('   Demo is functional but could benefit from more data.')
  } else {
    console.log('\n⚠️  STATUS: NEEDS PREPARATION')
    console.log('   Run data seeding scripts to improve demo quality.')
  }

  // ============================================================================
  // RECOMMENDATIONS
  // ============================================================================
  if (warnCount > 0 || failCount > 0) {
    console.log('\n═══════════════════════════════════════════════════════════')
    console.log('🔧 RECOMMENDED ACTIONS')
    console.log('═══════════════════════════════════════════════════════════')

    if (failCount > 0) {
      console.log('\n❌ CRITICAL (Must Fix):')
      results.filter(r => r.status === 'FAIL').forEach(r => {
        console.log(`   • ${r.section}: ${r.message}`)
      })
    }

    if (warnCount > 0) {
      console.log('\n⚠️  IMPROVEMENTS (Recommended):')
      const warns = results.filter(r => r.status === 'WARN')
      warns.slice(0, 5).forEach(r => {
        console.log(`   • ${r.section}: ${r.message}`)
      })

      if (warns.length > 5) {
        console.log(`   ... and ${warns.length - 5} more`)
      }
    }

    console.log('\n📝 Quick Fix Commands:')
    console.log('   # Seed complete investor story:')
    console.log('   npx tsx scripts/seed-complete-investor-story.ts')
    console.log('')
    console.log('   # Seed all modules (comprehensive):')
    console.log('   npx tsx scripts/seed-all-modules-complete.ts')
    console.log('')
    console.log('   # Verify after seeding:')
    console.log('   npx tsx scripts/verify-showcase-ready.ts')
  }

  console.log('\n═══════════════════════════════════════════════════════════')
  console.log('🎬 DEMO ACCESS')
  console.log('═══════════════════════════════════════════════════════════')
  console.log('URL:      http://localhost:9323')
  console.log('Email:    alex@freeflow.io')
  console.log('Password: investor2026')
  console.log('\n📚 Demo Guides:')
  console.log('   • INVESTOR_DEMO_SETUP_GUIDE.md')
  console.log('   • DEMO_QUICK_START.md')
  console.log('   • PRE_DEMO_TEST_CHECKLIST.md')
  console.log('═══════════════════════════════════════════════════════════\n')
}

main().catch(console.error)
