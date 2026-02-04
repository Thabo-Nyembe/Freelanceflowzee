#!/usr/bin/env tsx
/**
 * Make alex@freeflow.io an admin user
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
})

const DEMO_EMAIL = 'alex@freeflow.io'

async function makeAdmin() {
  console.log('\n🔧 Making alex@freeflow.io an admin...\n')

  // Update role in users table
  const { data: user, error: updateError } = await supabase
    .from('users')
    .update({ role: 'admin' })
    .eq('email', DEMO_EMAIL)
    .select()
    .single()

  if (updateError) {
    console.error('❌ Error updating user role:', updateError.message)
    process.exit(1)
  }

  console.log('✅ Updated user role to admin')
  console.log('   Email:', user.email)
  console.log('   Role:', user.role)
  console.log('   ID:', user.id)

  // Also update in auth.users metadata if it exists
  const { data: authUser } = await supabase.auth.admin.listUsers()

  if (authUser?.users) {
    const alexAuthUser = authUser.users.find(u => u.email === DEMO_EMAIL)

    if (alexAuthUser) {
      const { error: metadataError } = await supabase.auth.admin.updateUserById(
        alexAuthUser.id,
        {
          user_metadata: {
            ...alexAuthUser.user_metadata,
            role: 'admin'
          }
        }
      )

      if (metadataError) {
        console.warn('⚠️  Could not update auth metadata:', metadataError.message)
      } else {
        console.log('✅ Updated auth metadata with admin role')
      }
    }
  }

  console.log('\n✅ Alex is now an admin!\n')
}

makeAdmin().catch(console.error)
