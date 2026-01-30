/**
 * Create a verified test user via Supabase Admin API
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const TEST_EMAIL = 'investor-demo@kazi.dev'
const TEST_PASSWORD = 'InvestorDemo123!'

async function createUser() {
  console.log('Creating verified test user...')
  console.log('Email:', TEST_EMAIL)
  console.log('Password:', TEST_PASSWORD)

  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const existing = existingUsers?.users?.find(u => u.email === TEST_EMAIL)

  if (existing) {
    console.log('\nUser already exists, updating password...')
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      password: TEST_PASSWORD,
      email_confirm: true
    })
    if (error) {
      console.log('Update error:', error.message)
    } else {
      console.log('✅ Password updated and email confirmed!')
    }
  } else {
    // Create new user
    const { data, error } = await supabase.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,  // Auto-confirm email
      user_metadata: {
        name: 'Investor Demo',
        full_name: 'Investor Demo'
      }
    })

    if (error) {
      console.log('Create error:', error.message)
    } else {
      console.log('✅ User created:', data.user.id)
    }
  }

  console.log('\n========================================')
  console.log('LOGIN CREDENTIALS FOR INVESTOR DEMO:')
  console.log('========================================')
  console.log(`Email:    ${TEST_EMAIL}`)
  console.log(`Password: ${TEST_PASSWORD}`)
  console.log('========================================')
}

createUser()
