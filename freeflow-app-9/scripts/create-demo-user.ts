/**
 * Create Demo User for Investor Presentations
 * 
 * This script creates the demo@kazi.io user in Supabase auth
 * and removes any other test users to avoid confusion.
 * 
 * Usage: npx tsx scripts/create-demo-user.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { DEMO_USER_ID } from '../lib/utils/demo-mode'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Demo user constants
const DEMO_EMAIL = 'demo@kazi.io'
const DEMO_PASSWORD = 'demo2026'  // Simple password for demos

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables')
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function createDemoUser() {
    console.log('========================================')
    console.log('Creating Demo User for KAZI Platform')
    console.log('========================================')
    console.log('')

    try {
        // Step 1: List all existing users
        console.log('📋 Listing existing users...')
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

        if (listError) {
            console.error('❌ Error listing users:', listError.message)
            return
        }

        console.log(`Found ${users?.length || 0} existing users`)
        users?.forEach(user => {
            console.log(`  - ${user.email} (ID: ${user.id})`)
        })
        console.log('')

        // Step 2: Delete all non-demo users
        console.log('🗑️  Removing test users...')
        let deletedCount = 0

        for (const user of users || []) {
            if (user.email !== DEMO_EMAIL) {
                const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)
                if (deleteError) {
                    console.log(`  ⚠️  Could not delete ${user.email}: ${deleteError.message}`)
                } else {
                    console.log(`  ✓ Deleted ${user.email}`)
                    deletedCount++
                }
            }
        }

        console.log(`✓ Removed ${deletedCount} test user(s)`)
        console.log('')

        // Step 3: Check if demo user exists
        const demoUserExists = users?.some(u => u.email === DEMO_EMAIL)

        if (demoUserExists) {
            console.log('ℹ️  Demo user already exists. Updating password...')

            // Find the demo user
            const demoUser = users?.find(u => u.email === DEMO_EMAIL)

            if (demoUser) {
                // Update password
                const { error: updateError } = await supabase.auth.admin.updateUserById(
                    demoUser.id,
                    { password: DEMO_PASSWORD }
                )

                if (updateError) {
                    console.error('❌ Error updating password:', updateError.message)
                } else {
                    console.log('✓ Password updated')
                }
            }
        } else {
            console.log('👤 Creating demo user...')

            // Create the demo user with specific UUID
            const { data, error: createError } = await supabase.auth.admin.createUser({
                email: DEMO_EMAIL,
                password: DEMO_PASSWORD,
                email_confirm: true,
                user_metadata: {
                    name: 'Alex Thompson',
                    role: 'Product Manager',
                    company: 'KAZI Technologies'
                }
            })

            if (createError) {
                console.error('❌ Error creating user:', createError.message)
                return
            }

            console.log('✓ Demo user created successfully!')
            console.log(`  ID: ${data.user?.id}`)
            console.log(`  Email: ${data.user?.email}`)
        }

        console.log('')
        console.log('========================================')
        console.log('Demo User Ready!')
        console.log('========================================')
        console.log('')
        console.log('📧 Email:    demo@kazi.io')
        console.log('🔑 Password: demo2026')
        console.log('')
        console.log('Next steps:')
        console.log('1. Navigate to http://localhost:9323/login')
        console.log('2. Login with above credentials')
        console.log('3. Verify demo data is visible')
        console.log('')
        console.log('⚠️  IMPORTANT: Update seed scripts if user ID differs from expected:')
        console.log(`   Expected: ${DEMO_USER_ID}`)
        console.log(`   Actual:   ${users?.find(u => u.email === DEMO_EMAIL)?.id || 'TBD'}`)
        console.log('')

    } catch (error) {
        console.error('❌ Unexpected error:', error)
        process.exit(1)
    }
}

// Run the function
createDemoUser()
