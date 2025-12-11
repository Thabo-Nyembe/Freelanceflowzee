import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function updatePassword() {
  const testEmail = 'test@kazi.dev'
  const newPassword = 'test12345'

  console.log('🔧 Updating password for:', testEmail)
  console.log('🔑 New password:', newPassword)

  // Hash the new password
  const passwordHash = await bcrypt.hash(newPassword, 12)

  // Update user password
  const { data, error } = await supabase
    .from('users')
    .update({ password_hash: passwordHash })
    .eq('email', testEmail.toLowerCase())
    .select('id, email')
    .single()

  if (error) {
    console.error('❌ Error updating password:', error)
    process.exit(1)
  }

  console.log('\n✅ Password updated successfully!')
  console.log('User ID:', data.id)
  console.log('Email:', data.email)
  console.log('\n🎉 You can now login with:')
  console.log('Email:', testEmail)
  console.log('Password:', newPassword)
}

updatePassword().catch(console.error)
