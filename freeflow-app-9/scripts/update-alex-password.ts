/**
 * Update alex@freeflow.io password to demo2026
 */

import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const DEMO_EMAIL = 'alex@freeflow.io'
const DEMO_PASSWORD = 'demo2026'
const PASSWORD_HASH = bcrypt.hashSync(DEMO_PASSWORD, 10)

async function updatePassword() {
  console.log('🔧 Updating alex@freeflow.io password\n')

  // Update password in public.users
  const { error: updateError } = await supabase
    .from('users')
    .update({
      password_hash: PASSWORD_HASH,
      email_verified: true
    })
    .eq('email', DEMO_EMAIL)

  if (updateError) {
    console.error('❌ Error updating password:', updateError.message)
    return
  }

  console.log('✅ Password updated in public.users')

  // Also try to update in Supabase Auth if user exists there
  const { data: { users } } = await supabase.auth.admin.listUsers()
  const authUser = users.find(u => u.email === DEMO_EMAIL)

  if (authUser) {
    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
      authUser.id,
      { password: DEMO_PASSWORD }
    )

    if (authUpdateError) {
      console.log('⚠️  Could not update Supabase Auth password:', authUpdateError.message)
    } else {
      console.log('✅ Password updated in Supabase Auth')
    }
  } else {
    console.log('ℹ️  User not found in Supabase Auth (only in public.users)')
  }

  console.log('\n========================================')
  console.log('✅ Demo Login Ready!')
  console.log('========================================')
  console.log('\n📧 Email:    alex@freeflow.io')
  console.log('🔑 Password: demo2026')
  console.log('\n📊 This account has:')
  console.log('   - 20 Projects')
  console.log('   - 15 Clients')
  console.log('   - Full demo data')
  console.log('\nTest at: http://localhost:9323/login\n')
}

updatePassword()
