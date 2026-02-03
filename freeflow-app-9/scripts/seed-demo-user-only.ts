/**
 * Seed Demo Data ONLY for alex@freeflow.io
 *
 * This script populates comprehensive demo data exclusively for the investor demo user.
 * All other users will have a clean, empty experience.
 *
 * Usage: npx tsx scripts/seed-demo-user-only.ts
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

async function seedDemoUserData() {
    console.log('========================================')
    console.log('Seeding Demo Data for alex@freeflow.io')
    console.log('========================================\n')

    try {
        // Step 1: Find the demo user
        console.log('🔍 Finding demo user...')
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

        if (listError) {
            console.error('❌ Error listing users:', listError.message)
            return
        }

        const demoUser = users?.find(u => u.email === DEMO_EMAIL)

        if (!demoUser) {
            console.error(`❌ Demo user ${DEMO_EMAIL} not found!`)
            console.log('\nPlease create the demo user first:')
            console.log('npx tsx scripts/create-demo-user.ts')
            return
        }

        const userId = demoUser.id
        console.log(`✓ Found demo user: ${demoUser.email}`)
        console.log(`  User ID: ${userId}\n`)

        // Step 2: Clear existing demo data for this user
        console.log('🗑️  Clearing existing demo data...')

        const tables = [
            'clients', 'projects', 'tasks', 'invoices', 'expenses',
            'time_entries', 'team_members', 'deals', 'contacts',
            'campaigns', 'content_items', 'documents'
        ]

        for (const table of tables) {
            const { error } = await supabase
                .from(table)
                .delete()
                .eq('user_id', userId)

            if (error && error.code !== '42P01') { // Ignore table doesn't exist
                console.log(`  ⚠️  Could not clear ${table}: ${error.message}`)
            } else if (!error) {
                console.log(`  ✓ Cleared ${table}`)
            }
        }

        console.log('\n📊 Seeding comprehensive demo data...\n')

        // Step 3: Seed CRM Data
        console.log('👥 Seeding CRM data...')

        const clients = [
            {
                user_id: userId,
                name: 'Acme Corporation',
                email: 'contact@acmecorp.com',
                company: 'Acme Corp',
                status: 'active',
                industry: 'Technology',
                revenue: 500000,
                created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                user_id: userId,
                name: 'TechStart Inc',
                email: 'hello@techstart.io',
                company: 'TechStart',
                status: 'active',
                industry: 'Software',
                revenue: 250000,
                created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                user_id: userId,
                name: 'Creative Studios',
                email: 'info@creativestudios.com',
                company: 'Creative Studios',
                status: 'active',
                industry: 'Media',
                revenue: 350000,
                created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                user_id: userId,
                name: 'Global Ventures',
                email: 'partnerships@globalventures.com',
                company: 'Global Ventures',
                status: 'lead',
                industry: 'Consulting',
                revenue: 750000,
                created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                user_id: userId,
                name: 'Innovate Labs',
                email: 'contact@innovatelabs.io',
                company: 'Innovate Labs',
                status: 'active',
                industry: 'Research',
                revenue: 425000,
                created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
            }
        ]

        const { data: insertedClients, error: clientsError } = await supabase
            .from('clients')
            .insert(clients)
            .select()

        if (clientsError) {
            console.log(`  ⚠️  Could not seed clients: ${clientsError.message}`)
        } else {
            console.log(`  ✓ Created ${insertedClients?.length || 0} clients`)
        }

        // Step 4: Seed Projects
        console.log('📁 Seeding projects...')

        const projects = [
            {
                user_id: userId,
                name: 'Website Redesign',
                description: 'Complete website overhaul with modern design',
                status: 'in_progress',
                priority: 'high',
                start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                budget: 50000,
                progress: 65
            },
            {
                user_id: userId,
                name: 'Mobile App Development',
                description: 'Native iOS and Android apps',
                status: 'in_progress',
                priority: 'high',
                start_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
                budget: 120000,
                progress: 45
            },
            {
                user_id: userId,
                name: 'Brand Identity Package',
                description: 'Logo, style guide, and brand assets',
                status: 'completed',
                priority: 'medium',
                start_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
                end_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                budget: 25000,
                progress: 100
            },
            {
                user_id: userId,
                name: 'Video Production',
                description: 'Corporate video series (6 episodes)',
                status: 'planning',
                priority: 'medium',
                start_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
                end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
                budget: 75000,
                progress: 10
            }
        ]

        const { data: insertedProjects, error: projectsError } = await supabase
            .from('projects')
            .insert(projects)
            .select()

        if (projectsError) {
            console.log(`  ⚠️  Could not seed projects: ${projectsError.message}`)
        } else {
            console.log(`  ✓ Created ${insertedProjects?.length || 0} projects`)
        }

        // Step 5: Seed Invoices
        console.log('💰 Seeding invoices...')

        const invoices = [
            {
                user_id: userId,
                invoice_number: 'INV-2026-001',
                amount: 15000,
                status: 'paid',
                due_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                paid_date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
                description: 'Website Redesign - Phase 1'
            },
            {
                user_id: userId,
                invoice_number: 'INV-2026-002',
                amount: 30000,
                status: 'paid',
                due_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                paid_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                description: 'Mobile App Development - Milestone 1'
            },
            {
                user_id: userId,
                invoice_number: 'INV-2026-003',
                amount: 25000,
                status: 'sent',
                due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
                description: 'Website Redesign - Phase 2'
            },
            {
                user_id: userId,
                invoice_number: 'INV-2026-004',
                amount: 45000,
                status: 'draft',
                due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                description: 'Mobile App Development - Milestone 2'
            }
        ]

        const { data: insertedInvoices, error: invoicesError } = await supabase
            .from('invoices')
            .insert(invoices)
            .select()

        if (invoicesError) {
            console.log(`  ⚠️  Could not seed invoices: ${invoicesError.message}`)
        } else {
            console.log(`  ✓ Created ${insertedInvoices?.length || 0} invoices`)
        }

        // Step 6: Seed Team Members
        console.log('👨‍💼 Seeding team members...')

        const teamMembers = [
            {
                user_id: userId,
                name: 'Sarah Johnson',
                email: 'sarah@freeflow.io',
                role: 'Lead Designer',
                status: 'active',
                hourly_rate: 125
            },
            {
                user_id: userId,
                name: 'Michael Chen',
                email: 'michael@freeflow.io',
                role: 'Senior Developer',
                status: 'active',
                hourly_rate: 150
            },
            {
                user_id: userId,
                name: 'Emily Rodriguez',
                email: 'emily@freeflow.io',
                role: 'Project Manager',
                status: 'active',
                hourly_rate: 100
            },
            {
                user_id: userId,
                name: 'David Kim',
                email: 'david@freeflow.io',
                role: 'Marketing Specialist',
                status: 'active',
                hourly_rate: 90
            }
        ]

        const { data: insertedTeam, error: teamError } = await supabase
            .from('team_members')
            .insert(teamMembers)
            .select()

        if (teamError) {
            console.log(`  ⚠️  Could not seed team: ${teamError.message}`)
        } else {
            console.log(`  ✓ Created ${insertedTeam?.length || 0} team members`)
        }

        // Step 7: Seed Deals/Opportunities
        console.log('🤝 Seeding deals...')

        const deals = [
            {
                user_id: userId,
                title: 'Enterprise SaaS Integration',
                value: 150000,
                stage: 'negotiation',
                probability: 75,
                expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                user_id: userId,
                title: 'E-commerce Platform Build',
                value: 85000,
                stage: 'proposal',
                probability: 60,
                expected_close_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                user_id: userId,
                title: 'Brand Refresh Campaign',
                value: 45000,
                stage: 'discovery',
                probability: 40,
                expected_close_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
            }
        ]

        const { data: insertedDeals, error: dealsError } = await supabase
            .from('deals')
            .insert(deals)
            .select()

        if (dealsError) {
            console.log(`  ⚠️  Could not seed deals: ${dealsError.message}`)
        } else {
            console.log(`  ✓ Created ${insertedDeals?.length || 0} deals`)
        }

        console.log('\n========================================')
        console.log('✅ Demo Data Seeded Successfully!')
        console.log('========================================\n')

        console.log('Summary:')
        console.log(`✓ ${insertedClients?.length || 0} Clients`)
        console.log(`✓ ${insertedProjects?.length || 0} Projects`)
        console.log(`✓ ${insertedInvoices?.length || 0} Invoices`)
        console.log(`✓ ${insertedTeam?.length || 0} Team Members`)
        console.log(`✓ ${insertedDeals?.length || 0} Deals`)
        console.log('\n🎯 Demo user ready for investor showcase!')
        console.log('🔒 All other users have clean, empty experience\n')

    } catch (error) {
        console.error('❌ Unexpected error:', error)
        process.exit(1)
    }
}

seedDemoUserData()
