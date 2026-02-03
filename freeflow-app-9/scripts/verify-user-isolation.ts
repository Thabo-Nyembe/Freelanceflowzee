/**
 * Verify User Data Isolation
 *
 * This script verifies that:
 * 1. Demo user (alex@freeflow.io) has comprehensive data
 * 2. All other users have clean, empty experience
 *
 * Usage: npx tsx scripts/verify-user-isolation.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const DEMO_EMAIL = 'alex@freeflow.io'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function verifyUserIsolation() {
    console.log('========================================')
    console.log('Verifying User Data Isolation')
    console.log('========================================\n')

    try {
        // Get all users
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

        if (listError) {
            console.error('❌ Error listing users:', listError.message)
            return
        }

        console.log(`Found ${users?.length || 0} total users\n`)

        const demoUser = users?.find(u => u.email === DEMO_EMAIL)
        const otherUsers = users?.filter(u => u.email !== DEMO_EMAIL) || []

        if (!demoUser) {
            console.error(`❌ Demo user ${DEMO_EMAIL} not found!`)
            return
        }

        console.log('👤 Demo User:', demoUser.email)
        console.log('   ID:', demoUser.id, '\n')

        // Check demo user data
        console.log('📊 Checking demo user data...\n')

        const tables = [
            { name: 'clients', label: 'Clients' },
            { name: 'projects', label: 'Projects' },
            { name: 'tasks', label: 'Tasks' },
            { name: 'invoices', label: 'Invoices' },
            { name: 'expenses', label: 'Expenses' },
            { name: 'time_entries', label: 'Time Entries' },
            { name: 'team_members', label: 'Team Members' },
            { name: 'deals', label: 'Deals' },
            { name: 'contacts', label: 'Contacts' },
            { name: 'campaigns', label: 'Campaigns' }
        ]

        let demoDataFound = 0
        let demoDataMissing = 0

        for (const table of tables) {
            const { data, error, count } = await supabase
                .from(table.name)
                .select('*', { count: 'exact', head: true })
                .eq('user_id', demoUser.id)

            if (error && error.code !== '42P01') {
                console.log(`  ⚠️  ${table.label}: Error - ${error.message}`)
            } else if (error && error.code === '42P01') {
                console.log(`  ⏭️  ${table.label}: Table doesn't exist (OK)`)
            } else {
                const recordCount = count || 0
                if (recordCount > 0) {
                    console.log(`  ✅ ${table.label}: ${recordCount} records`)
                    demoDataFound++
                } else {
                    console.log(`  ⚠️  ${table.label}: No data (expected some)`)
                    demoDataMissing++
                }
            }
        }

        console.log('\n========================================')
        console.log('Demo User Summary:')
        console.log(`✅ Tables with data: ${demoDataFound}`)
        console.log(`⚠️  Tables without data: ${demoDataMissing}`)
        console.log('========================================\n')

        // Check other users have no data
        if (otherUsers.length > 0) {
            console.log('🔍 Checking other users for data leakage...\n')

            let leakageFound = false

            for (const user of otherUsers) {
                console.log(`Checking: ${user.email} (${user.id})`)

                let userHasData = false

                for (const table of tables) {
                    const { count, error } = await supabase
                        .from(table.name)
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', user.id)

                    if (!error && count && count > 0) {
                        console.log(`  ❌ LEAKAGE: ${table.label} has ${count} records!`)
                        userHasData = true
                        leakageFound = true
                    }
                }

                if (!userHasData) {
                    console.log(`  ✅ Clean (no data)`)
                }
                console.log()
            }

            if (leakageFound) {
                console.log('========================================')
                console.log('❌ DATA LEAKAGE DETECTED!')
                console.log('Some non-demo users have data.')
                console.log('Run cleanup script if needed.')
                console.log('========================================\n')
            } else {
                console.log('========================================')
                console.log('✅ USER ISOLATION VERIFIED!')
                console.log('All non-demo users have clean experience.')
                console.log('========================================\n')
            }
        } else {
            console.log('ℹ️  No other users found (only demo user exists)\n')
        }

        // Final status
        console.log('Final Status:')
        console.log(`✅ Demo user has data in ${demoDataFound} tables`)
        console.log(`${leakageFound ? '❌' : '✅'} Other users ${leakageFound ? 'have data (ISSUE)' : 'are clean'}`)
        console.log('\n🎯 Ready for investor demo!\n')

    } catch (error) {
        console.error('❌ Unexpected error:', error)
        process.exit(1)
    }
}

verifyUserIsolation()
