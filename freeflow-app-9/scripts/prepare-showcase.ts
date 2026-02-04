/**
 * KAZI Showcase Preparation Script
 *
 * One-command setup to prepare alex@freeflow.io for demos/showcases.
 * This script:
 * 1. Verifies demo user exists
 * 2. Seeds all necessary demo data
 * 3. Validates data integrity
 * 4. Generates readiness report
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { execSync } from 'child_process'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const DEMO_USER_EMAIL = 'alex@freeflow.io'
const DEMO_PASSWORD = 'investor2026'

async function step(num: number, title: string) {
  console.log(`\n${'='.repeat(65)}`)
  console.log(`${num}️⃣  ${title}`)
  console.log('─'.repeat(65))
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗')
  console.log('║  🎯 KAZI SHOWCASE PREPARATION                             ║')
  console.log('║  Preparing alex@freeflow.io for investor demos            ║')
  console.log('╚═══════════════════════════════════════════════════════════╝')

  // ============================================================================
  // STEP 1: Verify Demo User
  // ============================================================================
  await step(1, 'VERIFYING DEMO USER')

  const { data: users } = await supabase.auth.admin.listUsers()
  const demoUser = users?.users.find(u => u.email === DEMO_USER_EMAIL)

  if (demoUser) {
    console.log('✅ Demo user exists:', DEMO_USER_EMAIL)
    console.log('   User ID:', demoUser.id)
  } else {
    console.log('⚠️  Demo user not found. Creating...')

    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: DEMO_USER_EMAIL,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: 'Alex Freeman',
          role: 'demo',
          showcase: true
        }
      })

      if (error) throw error
      console.log('✅ Demo user created:', data.user?.email)
      console.log('   User ID:', data.user?.id)
    } catch (error: any) {
      console.error('❌ Failed to create demo user:', error.message)
      process.exit(1)
    }
  }

  // ============================================================================
  // STEP 2: Clear Old Demo Data (Optional)
  // ============================================================================
  await step(2, 'CLEARING OLD DEMO DATA (Optional)')

  console.log('ℹ️  Keeping existing data. To clear, run:')
  console.log('   npx tsx scripts/clear-demo-data.ts')

  // ============================================================================
  // STEP 3: Seed Complete Investor Story
  // ============================================================================
  await step(3, 'SEEDING INVESTOR DEMO DATA')

  console.log('📦 Running: seed-complete-investor-story.ts')
  console.log('   This creates the compelling $0 → $125K growth story...\n')

  try {
    execSync('npx tsx scripts/seed-complete-investor-story.ts', {
      stdio: 'inherit',
      cwd: process.cwd()
    })
    console.log('\n✅ Investor story data seeded successfully')
  } catch (error) {
    console.log('\n⚠️  Investor story seeding encountered issues')
    console.log('   Continuing with next steps...')
  }

  // ============================================================================
  // STEP 4: Seed All Business Modules
  // ============================================================================
  await step(4, 'SEEDING ALL BUSINESS MODULES')

  console.log('📦 Running: seed-all-modules-complete.ts')
  console.log('   This populates CRM, Projects, Finance, Team, etc...\n')

  try {
    execSync('npx tsx scripts/seed-all-modules-complete.ts', {
      stdio: 'inherit',
      cwd: process.cwd()
    })
    console.log('\n✅ All business modules seeded successfully')
  } catch (error) {
    console.log('\n⚠️  Some modules may have seeding issues')
    console.log('   Check the output above for details')
  }

  // ============================================================================
  // STEP 5: Verify Showcase Readiness
  // ============================================================================
  await step(5, 'VERIFYING SHOWCASE READINESS')

  console.log('🔍 Running readiness verification...\n')

  try {
    execSync('npx tsx scripts/verify-showcase-ready.ts', {
      stdio: 'inherit',
      cwd: process.cwd()
    })
  } catch (error) {
    console.log('\n⚠️  Verification completed with warnings')
  }

  // ============================================================================
  // FINAL INSTRUCTIONS
  // ============================================================================
  console.log('\n╔═══════════════════════════════════════════════════════════╗')
  console.log('║  ✅ SHOWCASE PREPARATION COMPLETE!                        ║')
  console.log('╚═══════════════════════════════════════════════════════════╝')

  console.log('\n🎬 TO ACCESS DEMO:')
  console.log('─'.repeat(65))
  console.log('1. Ensure app is running:')
  console.log('   npm run dev -- -p 9323')
  console.log('')
  console.log('2. Login with:')
  console.log('   URL:      http://localhost:9323')
  console.log('   Email:    alex@freeflow.io')
  console.log('   Password: investor2026')
  console.log('')
  console.log('3. Or use automated login test:')
  console.log('   node test-investor-login.mjs')

  console.log('\n📚 DEMO RESOURCES:')
  console.log('─'.repeat(65))
  console.log('• INVESTOR_DEMO_SETUP_GUIDE.md - Complete demo story')
  console.log('• DEMO_QUICK_START.md - 15-min quick guide')
  console.log('• PRE_DEMO_TEST_CHECKLIST.md - Pre-show checklist')
  console.log('• SEED_FUNDING_CONTEXT.md - Investor context')

  console.log('\n🎯 DEMO HIGHLIGHTS:')
  console.log('─'.repeat(65))
  console.log('✨ $0 → $125K revenue growth story')
  console.log('✨ 12 clients, 45% conversion rate')
  console.log('✨ 9+ completed projects')
  console.log('✨ Full business metrics (MRR, ARR, LTV, CAC)')
  console.log('✨ Team scaling (0 → 3 contractors)')
  console.log('✨ AI-native features throughout')

  console.log('\n🚀 NEXT STEPS:')
  console.log('─'.repeat(65))
  console.log('1. Review demo guides above')
  console.log('2. Practice demo flow (15-20 min)')
  console.log('3. Run: node test-investor-login.mjs')
  console.log('4. Check key pages for data')
  console.log('5. You\'re ready to showcase! 💪')

  console.log('\n═══════════════════════════════════════════════════════════\n')
}

main().catch(console.error)
