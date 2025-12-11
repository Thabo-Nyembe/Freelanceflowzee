import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

console.log('Environment check:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing')
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing')
console.log('')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function createTestUser() {
  const testEmail = 'test@kazi.dev'
  const testPassword = 'test12345'
  const testName = 'Test User'

  console.log('🔧 Creating test user...')
  console.log('📧 Email:', testEmail)
  console.log('🔑 Password:', testPassword)

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', testEmail.toLowerCase())
    .single()

  if (existingUser) {
    console.log('✅ User already exists!')
    console.log('User ID:', existingUser.id)
    console.log('\nYou can now login at: http://localhost:9323/login')
    console.log('Email:', testEmail)
    console.log('Password:', testPassword)
    return
  }

  // Hash password
  const passwordHash = await bcrypt.hash(testPassword, 12)

  // Create user
  const { data: newUser, error } = await supabase
    .from('users')
    .insert({
      email: testEmail.toLowerCase(),
      password_hash: passwordHash,
      name: testName,
      role: 'user',
      email_verified: true, // Set to true so they can login immediately
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select('id, email, name, role')
    .single()

  if (error) {
    console.error('❌ Error creating user:', error)
    process.exit(1)
  }

  console.log('\n✅ Test user created successfully!')
  console.log('User ID:', newUser.id)
  console.log('Email:', newUser.email)
  console.log('Name:', newUser.name)
  console.log('Role:', newUser.role)
  console.log('\n🎉 You can now login at: http://localhost:9323/login')
  console.log('Email:', testEmail)
  console.log('Password:', testPassword)
}

createTestUser().catch(console.error)
