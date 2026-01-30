/**
 * Create a user in the app's users table (not auth.users)
 */

import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const TEST_EMAIL = 'investor-demo@kazi.dev'
const TEST_PASSWORD = 'InvestorDemo123!'

async function createUser() {
  console.log('Creating user in app users table...')

  // Check users table structure
  const { data: cols, error: colsError } = await supabase
    .from('users')
    .select('*')
    .limit(0)

  if (colsError) {
    console.log('Users table error:', colsError.message)

    // Check if users table exists
    console.log('\nChecking if users table exists...')
    const { error: testError } = await supabase.from('users').select('id').limit(1)
    if (testError) {
      console.log('Users table does not exist or is not accessible')
      console.log('The app may need a users table migration.')
      return
    }
  }

  // Hash password
  const password_hash = await bcrypt.hash(TEST_PASSWORD, 12)
  console.log('Password hashed')

  // Check if user exists
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', TEST_EMAIL)
    .single()

  if (existing) {
    console.log('User exists, updating password...')
    const { error } = await supabase
      .from('users')
      .update({ password_hash, email_verified: true })
      .eq('email', TEST_EMAIL)

    if (error) {
      console.log('Update error:', error.message)
    } else {
      console.log('✅ Password updated!')
    }
  } else {
    console.log('Creating new user...')
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: TEST_EMAIL,
        name: 'Investor Demo',
        password_hash,
        email_verified: true,
        role: 'user',
        created_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.log('Create error:', error.message)
      console.log('\nTrying with fewer fields...')

      // Try minimal insert
      const { error: err2 } = await supabase
        .from('users')
        .insert({ email: TEST_EMAIL, password_hash })
        .select()

      if (err2) {
        console.log('Minimal create error:', err2.message)
      } else {
        console.log('✅ User created with minimal fields')
      }
    } else {
      console.log('✅ User created:', data)
    }
  }

  // Also create/update test@kazi.dev
  console.log('\nCreating test@kazi.dev user...')
  const testHash = await bcrypt.hash('test12345', 12)

  const { data: testUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'test@kazi.dev')
    .single()

  if (testUser) {
    await supabase
      .from('users')
      .update({ password_hash: testHash, email_verified: true })
      .eq('email', 'test@kazi.dev')
    console.log('✅ test@kazi.dev password updated')
  } else {
    const { error } = await supabase
      .from('users')
      .insert({
        email: 'test@kazi.dev',
        name: 'Test User',
        password_hash: testHash,
        email_verified: true,
        role: 'user'
      })

    if (error) {
      console.log('test@kazi.dev create error:', error.message)
    } else {
      console.log('✅ test@kazi.dev created')
    }
  }

  console.log('\n========================================')
  console.log('LOGIN CREDENTIALS:')
  console.log('========================================')
  console.log(`1. Email: ${TEST_EMAIL}`)
  console.log(`   Password: ${TEST_PASSWORD}`)
  console.log('')
  console.log('2. Email: test@kazi.dev')
  console.log('   Password: test12345')
  console.log('========================================')
}

createUser()
