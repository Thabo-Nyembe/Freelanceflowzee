/**
 * Fix Alex Demo User Password in public.users table
 */

import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const DEMO_EMAIL = 'alex@freeflow.io'
const DEMO_PASSWORD = 'investor2026'
const PASSWORD_HASH = bcrypt.hashSync(DEMO_PASSWORD, 10)

async function fixAlexUser() {
    console.log('🔧 Fixing Alex Demo User Password in public.users\n')

    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id, email, password_hash')
        .eq('email', DEMO_EMAIL)
        .single()

    if (checkError) {
        console.log('❌ User not found in public.users:', checkError.message)
        console.log('\n📝 Creating user in public.users...')

        // Create the user
        const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
                id: '00000000-0000-0000-0000-000000000001', // Demo user ID
                email: DEMO_EMAIL,
                password_hash: PASSWORD_HASH,
                name: 'Alex Thompson',
                email_verified: true,
                role: 'user',
                created_at: new Date().toISOString()
            })
            .select()
            .single()

        if (createError) {
            console.error('❌ Error creating user:', createError.message)
            console.error('   Details:', createError)
            return
        }

        console.log('✅ User created in public.users')
    } else {
        console.log('✅ User exists in public.users')
        console.log('   ID:', existingUser.id)
        console.log('   Email:', existingUser.email)

        // Update password hash
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

        console.log('✅ Password hash updated')
        console.log('✅ Email verified')
    }

    // Verify the password works
    console.log('\n🔍 Verifying password...')
    const { data: verifyUser } = await supabase
        .from('users')
        .select('password_hash')
        .eq('email', DEMO_EMAIL)
        .single()

    if (verifyUser) {
        const isValid = bcrypt.compareSync(DEMO_PASSWORD, verifyUser.password_hash)
        if (isValid) {
            console.log('✅ Password verification successful!')
        } else {
            console.log('❌ Password verification failed')
        }
    }

    console.log('\n========================================')
    console.log('✅ Alex Demo User Ready for Login!')
    console.log('========================================')
    console.log('\n📧 Email:    alex@freeflow.io')
    console.log('🔑 Password: investor2026')
    console.log('\nTest at: http://localhost:9323/login\n')
}

fixAlexUser()
