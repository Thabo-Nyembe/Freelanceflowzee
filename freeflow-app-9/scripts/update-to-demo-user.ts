/**
 * Update Existing User to Demo Account
 * 
 * Changes alex@freeflow.io to demo@kazi.io (keeps same UUID for seed data compatibility)
 * 
 * Usage: npx tsx scripts/update-to-demo-user.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const DEMO_EMAIL = 'demo@kazi.io'
const DEMO_PASSWORD = 'demo2026'
const EXPECTED_USER_ID = '00000000-0000-0000-0000-000000000001'

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function updateToDemoUser() {
    console.log('========================================')
    console.log('Updating User to Demo Account')
    console.log('========================================')
    console.log('')

    try {
        // List existing users
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

        if (listError) {
            console.error('❌ Error listing users:', listError.message)
            return
        }

        console.log(`📋 Found ${users?.length || 0} user(s)`)
        users?.forEach(u => console.log(`  - ${u.email} (${u.id})`))
        console.log('')

        // Find user with expected ID
        const targetUser = users?.find(u => u.id === EXPECTED_USER_ID)

        if (!targetUser) {
            console.error(`❌ User with ID ${EXPECTED_USER_ID} not found`)
            return
        }

        console.log(`✓ Found user: ${targetUser.email}`)
        console.log(`  Updating to: ${DEMO_EMAIL}`)
        console.log('')

        // Update the user
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            targetUser.id,
            {
                email: DEMO_EMAIL,
                password: DEMO_PASSWORD,
                email_confirm: true,
                user_metadata: {
                    name: 'Alex Thompson',
                    role: 'Product Manager',
                    company: 'KAZI Technologies'
                }
            }
        )

        if (updateError) {
            console.error('❌ Error updating user:', updateError.message)
            return
        }

        console.log('✅ User updated successfully!')
        console.log('')

        // Delete the newly created demo user if exists
        const newDemoUser = users?.find(u => u.email === DEMO_EMAIL && u.id !== EXPECTED_USER_ID)
        if (newDemoUser) {
            console.log('🗑️  Removing duplicate demo user...')
            const { error: deleteError } = await supabase.auth.admin.deleteUser(newDemoUser.id)
            if (!deleteError) {
                console.log('✓ Removed duplicate')
            }
            console.log('')
        }

        console.log('========================================')
        console.log('Demo User Ready!')
        console.log('========================================')
        console.log('')
        console.log('📧 Email:    demo@kazi.io')
        console.log('🔑 Password: demo2026')
        console.log(`👤 User ID:  ${EXPECTED_USER_ID}`)
        console.log('')
        console.log('✅ All seed data will work with this user!')
        console.log('')

    } catch (error) {
        console.error('❌ Error:', error)
        process.exit(1)
    }
}

updateToDemoUser()
