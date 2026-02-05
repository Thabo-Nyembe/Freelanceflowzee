/**
 * Check User Session and Data
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function checkUserSession() {
  console.log('🔍 Checking User and Data Setup\n')

  // Check demo@kazi.io user
  console.log('1️⃣  Checking demo@kazi.io user...')
  const { data: demoKaziUser } = await supabase
    .from('users')
    .select('id, email, name')
    .eq('email', 'demo@kazi.io')
    .single()

  if (demoKaziUser) {
    console.log('   ✅ demo@kazi.io found in public.users')
    console.log(`      ID: ${demoKaziUser.id}`)
    console.log(`      Name: ${demoKaziUser.name}`)

    // Check if this user has any data
    const { count: projectCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', demoKaziUser.id)

    const { count: clientCount } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', demoKaziUser.id)

    console.log(`      Projects: ${projectCount || 0}`)
    console.log(`      Clients: ${clientCount || 0}`)
  } else {
    console.log('   ❌ demo@kazi.io not found')
  }

  // Check alex@freeflow.io user (the expected demo user)
  console.log('\n2️⃣  Checking alex@freeflow.io user...')
  const { data: alexUser } = await supabase
    .from('users')
    .select('id, email, name')
    .eq('email', 'alex@freeflow.io')
    .single()

  if (alexUser) {
    console.log('   ✅ alex@freeflow.io found in public.users')
    console.log(`      ID: ${alexUser.id}`)
    console.log(`      Name: ${alexUser.name}`)

    // Check if this user has data
    const { count: projectCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', alexUser.id)

    const { count: clientCount } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', alexUser.id)

    console.log(`      Projects: ${projectCount || 0}`)
    console.log(`      Clients: ${clientCount || 0}`)
  } else {
    console.log('   ❌ alex@freeflow.io not found')
  }

  // Check the expected demo user ID
  console.log('\n3️⃣  Checking expected demo user ID (00000000-0000-0000-0000-000000000001)...')
  const { data: expectedUser } = await supabase
    .from('users')
    .select('id, email, name')
    .eq('id', '00000000-0000-0000-0000-000000000001')
    .single()

  if (expectedUser) {
    console.log('   ✅ User with expected ID found')
    console.log(`      Email: ${expectedUser.email}`)
    console.log(`      Name: ${expectedUser.name}`)

    const { count: projectCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', expectedUser.id)

    const { count: clientCount } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', expectedUser.id)

    console.log(`      Projects: ${projectCount || 0}`)
    console.log(`      Clients: ${clientCount || 0}`)
  } else {
    console.log('   ❌ No user with expected demo ID')
  }

  console.log('\n' + '='.repeat(50))
  console.log('💡 Recommendation:')
  console.log('='.repeat(50))

  if (alexUser && (alexUser.id === '00000000-0000-0000-0000-000000000001')) {
    console.log('✅ alex@freeflow.io has correct ID - update demo@kazi.io')
    console.log('   to link to alex@freeflow.io account OR')
    console.log('   update password for alex@freeflow.io to demo2026')
  } else {
    console.log('⚠️  Need to align user accounts:')
    console.log('   Option 1: Update demo@kazi.io ID to match demo data')
    console.log('   Option 2: Update alex@freeflow.io password to demo2026')
    console.log('   Option 3: Transfer all data to demo@kazi.io user')
  }
  console.log('')
}

checkUserSession()
