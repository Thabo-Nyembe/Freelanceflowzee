/**
 * Seed Demo Data for Logged-in User
 * Updated to match actual database schema
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Use AUTH_USER_ID for all FK constraints (auth.users)
const USER_ID = '68aed33b-5b77-442c-bb9b-f7f12628a6ab'

async function seedDemoData() {
  console.log('Seeding demo data for user:', USER_ID)
  console.log('==========================================\n')

  // Generate IDs upfront
  const clientIds = [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()]
  const projectIds = [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()]
  const taskIds = [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID(),
                   crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()]

  // 1. CLIENTS
  console.log('1. Creating clients...')
  const clients = [
    {
      id: clientIds[0],
      user_id: USER_ID,
      name: 'TechCorp Industries',
      email: 'contact@techcorp.com',
      phone: '+1 (555) 123-4567',
      company: 'TechCorp Industries',
      status: 'active',
      total_revenue: 45000,
      notes: 'Premium enterprise client - web development and branding',
      created_at: new Date().toISOString()
    },
    {
      id: clientIds[1],
      user_id: USER_ID,
      name: 'Sarah Johnson',
      email: 'sarah@designstudio.com',
      phone: '+1 (555) 234-5678',
      company: 'Design Studio Pro',
      status: 'active',
      total_revenue: 28500,
      notes: 'Recurring monthly retainer for UI/UX work',
      created_at: new Date().toISOString()
    },
    {
      id: clientIds[2],
      user_id: USER_ID,
      name: 'Michael Chen',
      email: 'mchen@startupxyz.io',
      phone: '+1 (555) 345-6789',
      company: 'StartupXYZ',
      status: 'active',
      total_revenue: 15750,
      notes: 'Fast-growing startup, potential for larger projects',
      created_at: new Date().toISOString()
    },
    {
      id: clientIds[3],
      user_id: USER_ID,
      name: 'Creative Agency Ltd',
      email: 'projects@creativeagency.co',
      phone: '+1 (555) 456-7890',
      company: 'Creative Agency Ltd',
      status: 'lead',
      total_revenue: 0,
      notes: 'New lead from referral - interested in brand identity',
      created_at: new Date().toISOString()
    }
  ]

  const { error: clientsError } = await supabase.from('clients').insert(clients)
  if (clientsError) {
    console.log('   Clients error:', clientsError.message)
    // Try without user_id FK constraint
    console.log('   Trying alternate approach...')
    for (const client of clients) {
      const { error } = await supabase.from('clients').insert({
        ...client,
        user_id: USER_ID
      })
      if (!error) console.log('   + Added:', client.name)
    }
  } else {
    console.log('   ✅ Created', clients.length, 'clients')
  }

  // 2. PROJECTS (using correct schema)
  console.log('\n2. Creating projects...')
  const projects = [
    {
      id: projectIds[0],
      user_id: USER_ID,
      client_id: clientIds[0],
      title: 'TechCorp Website Redesign',
      name: 'TechCorp Website Redesign',
      description: 'Complete website redesign with modern UI/UX, responsive design, and CMS integration',
      status: 'active',
      priority: 'high',
      budget: 25000,
      spent: 13750,
      progress: 65,
      client_name: 'TechCorp Industries',
      client_email: 'contact@techcorp.com',
      start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: projectIds[1],
      user_id: USER_ID,
      client_id: clientIds[1],
      title: 'Design Studio Brand Refresh',
      name: 'Design Studio Brand Refresh',
      description: 'Logo redesign, brand guidelines, and marketing collateral',
      status: 'active',
      priority: 'medium',
      budget: 8500,
      spent: 4950,
      progress: 40,
      client_name: 'Sarah Johnson',
      client_email: 'sarah@designstudio.com',
      start_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: projectIds[2],
      user_id: USER_ID,
      client_id: clientIds[2],
      title: 'StartupXYZ Mobile App UI',
      name: 'StartupXYZ Mobile App UI',
      description: 'iOS and Android app UI design with prototypes',
      status: 'draft',
      priority: 'high',
      budget: 15000,
      spent: 0,
      progress: 10,
      client_name: 'Michael Chen',
      client_email: 'mchen@startupxyz.io',
      start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      due_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: projectIds[3],
      user_id: USER_ID,
      client_id: clientIds[0],
      title: 'TechCorp Marketing Campaign',
      name: 'TechCorp Marketing Campaign',
      description: 'Digital marketing assets and social media graphics',
      status: 'completed',
      priority: 'medium',
      budget: 5000,
      spent: 5500,
      progress: 100,
      client_name: 'TechCorp Industries',
      client_email: 'contact@techcorp.com',
      start_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      due_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString()
    }
  ]

  const { error: projectsError } = await supabase.from('projects').insert(projects)
  if (projectsError) {
    console.log('   Projects error:', projectsError.message)
  } else {
    console.log('   ✅ Created', projects.length, 'projects')
  }

  // 3. TASKS (using correct schema - estimated_hours not minutes)
  console.log('\n3. Creating tasks...')
  const tasks = [
    {
      id: taskIds[0],
      user_id: USER_ID,
      project_id: projectIds[0],
      title: 'Design homepage wireframes',
      description: 'Create low-fidelity wireframes for the new homepage layout',
      status: 'completed',
      priority: 'high',
      estimated_hours: 3,
      actual_hours: 2.75,
      due_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      completed_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['design', 'wireframe'],
      created_at: new Date().toISOString()
    },
    {
      id: taskIds[1],
      user_id: USER_ID,
      project_id: projectIds[0],
      title: 'Develop responsive navigation',
      description: 'Implement mobile-first responsive navigation component',
      status: 'in_progress',
      priority: 'high',
      estimated_hours: 4,
      actual_hours: 1.5,
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['development', 'frontend'],
      created_at: new Date().toISOString()
    },
    {
      id: taskIds[2],
      user_id: USER_ID,
      project_id: projectIds[0],
      title: 'Client review meeting',
      description: 'Present progress and gather feedback from TechCorp team',
      status: 'todo',
      priority: 'urgent',
      estimated_hours: 1,
      actual_hours: 0,
      due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['meeting', 'client'],
      created_at: new Date().toISOString()
    },
    {
      id: taskIds[3],
      user_id: USER_ID,
      project_id: projectIds[1],
      title: 'Create logo variations',
      description: 'Design 3 distinct logo concepts for client presentation',
      status: 'in_progress',
      priority: 'high',
      estimated_hours: 5,
      actual_hours: 2,
      due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['design', 'branding', 'logo'],
      created_at: new Date().toISOString()
    },
    {
      id: taskIds[4],
      user_id: USER_ID,
      project_id: projectIds[1],
      title: 'Prepare brand guidelines document',
      description: 'Document color palette, typography, and usage guidelines',
      status: 'todo',
      priority: 'medium',
      estimated_hours: 3,
      actual_hours: 0,
      due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['documentation', 'branding'],
      created_at: new Date().toISOString()
    },
    {
      id: taskIds[5],
      user_id: USER_ID,
      title: 'Send weekly invoices',
      description: 'Process and send invoices for completed work this week',
      status: 'todo',
      priority: 'medium',
      estimated_hours: 0.5,
      actual_hours: 0,
      due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['admin', 'billing'],
      created_at: new Date().toISOString()
    },
    {
      id: taskIds[6],
      user_id: USER_ID,
      title: 'Update portfolio with recent work',
      description: 'Add TechCorp and Design Studio projects to portfolio',
      status: 'todo',
      priority: 'low',
      estimated_hours: 1.5,
      actual_hours: 0,
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['portfolio', 'marketing'],
      created_at: new Date().toISOString()
    },
    {
      id: taskIds[7],
      user_id: USER_ID,
      project_id: projectIds[2],
      title: 'Research competitor apps',
      description: 'Analyze top 5 competitor apps for UI/UX inspiration',
      status: 'completed',
      priority: 'medium',
      estimated_hours: 2,
      actual_hours: 1.6,
      due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      completed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['research', 'mobile'],
      created_at: new Date().toISOString()
    }
  ]

  const { error: tasksError } = await supabase.from('tasks').insert(tasks)
  if (tasksError) {
    console.log('   Tasks error:', tasksError.message)
  } else {
    console.log('   ✅ Created', tasks.length, 'tasks')
  }

  // 4. INVOICES (using correct schema)
  console.log('\n4. Creating invoices...')
  const invoices = [
    {
      id: crypto.randomUUID(),
      user_id: USER_ID,
      client_id: clientIds[0],
      client_name: 'TechCorp Industries',
      client_email: 'contact@techcorp.com',
      invoice_number: 'INV-2026-001',
      status: 'paid',
      items: JSON.stringify([
        { description: 'Website Development - Milestone 1', quantity: 1, rate: 12500, amount: 12500 }
      ]),
      subtotal: 12500,
      tax_rate: 10,
      tax_amount: 1250,
      discount: 0,
      total: 13750,
      amount_paid: 13750,
      amount_due: 0,
      currency: 'USD',
      due_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      paid_at: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
      paid_date: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Website development milestone 1 - Thank you for your business!',
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: crypto.randomUUID(),
      user_id: USER_ID,
      client_id: clientIds[0],
      client_name: 'TechCorp Industries',
      client_email: 'contact@techcorp.com',
      invoice_number: 'INV-2026-002',
      status: 'sent',
      items: JSON.stringify([
        { description: 'Website Development - Milestone 2', quantity: 1, rate: 8500, amount: 8500 }
      ]),
      subtotal: 8500,
      tax_rate: 10,
      tax_amount: 850,
      discount: 0,
      total: 9350,
      amount_paid: 0,
      amount_due: 9350,
      currency: 'USD',
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Website development milestone 2',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: crypto.randomUUID(),
      user_id: USER_ID,
      client_id: clientIds[1],
      client_name: 'Sarah Johnson',
      client_email: 'sarah@designstudio.com',
      invoice_number: 'INV-2026-003',
      status: 'paid',
      items: JSON.stringify([
        { description: 'January Retainer - UI/UX Services', quantity: 1, rate: 4500, amount: 4500 }
      ]),
      subtotal: 4500,
      tax_rate: 10,
      tax_amount: 450,
      discount: 0,
      total: 4950,
      amount_paid: 4950,
      amount_due: 0,
      currency: 'USD',
      due_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      paid_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      paid_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Monthly retainer payment',
      created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: crypto.randomUUID(),
      user_id: USER_ID,
      client_id: clientIds[2],
      client_name: 'Michael Chen',
      client_email: 'mchen@startupxyz.io',
      invoice_number: 'INV-2026-004',
      status: 'draft',
      items: JSON.stringify([
        { description: 'Mobile App UI - Initial Deposit (20%)', quantity: 1, rate: 3000, amount: 3000 }
      ]),
      subtotal: 3000,
      tax_rate: 10,
      tax_amount: 300,
      discount: 0,
      total: 3300,
      amount_paid: 0,
      amount_due: 3300,
      currency: 'USD',
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Project kickoff deposit',
      created_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      user_id: USER_ID,
      client_id: clientIds[0],
      client_name: 'TechCorp Industries',
      client_email: 'contact@techcorp.com',
      invoice_number: 'INV-2025-047',
      status: 'paid',
      items: JSON.stringify([
        { description: 'Marketing Campaign Assets', quantity: 1, rate: 5000, amount: 5000 }
      ]),
      subtotal: 5000,
      tax_rate: 10,
      tax_amount: 500,
      discount: 0,
      total: 5500,
      amount_paid: 5500,
      amount_due: 0,
      currency: 'USD',
      due_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      paid_at: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString(),
      paid_date: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Marketing campaign completion',
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]

  const { error: invoicesError } = await supabase.from('invoices').insert(invoices)
  if (invoicesError) {
    console.log('   Invoices error:', invoicesError.message)
  } else {
    console.log('   ✅ Created', invoices.length, 'invoices')
  }

  // 5. TIME ENTRIES (with required project_name)
  console.log('\n5. Creating time entries...')
  const timeEntries = [
    {
      id: crypto.randomUUID(),
      user_id: USER_ID,
      project_id: projectIds[0],
      project_name: 'TechCorp Website Redesign',
      task_id: taskIds[0],
      task_name: 'Design homepage wireframes',
      description: 'Homepage wireframe design session',
      entry_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      start_time: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000 + 165 * 60 * 1000).toISOString(),
      duration: 165,
      duration_minutes: 165,
      billable: true,
      is_billable: true,
      hourly_rate: 150,
      total_amount: 412.50,
      status: 'completed',
      created_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      user_id: USER_ID,
      project_id: projectIds[0],
      project_name: 'TechCorp Website Redesign',
      task_id: taskIds[1],
      task_name: 'Develop responsive navigation',
      description: 'Navigation component development',
      entry_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      start_time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
      duration: 90,
      duration_minutes: 90,
      billable: true,
      is_billable: true,
      hourly_rate: 150,
      total_amount: 225,
      status: 'completed',
      created_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      user_id: USER_ID,
      project_id: projectIds[1],
      project_name: 'Design Studio Brand Refresh',
      task_id: taskIds[3],
      task_name: 'Create logo variations',
      description: 'Logo concept sketching and digital exploration',
      entry_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      start_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000).toISOString(),
      duration: 120,
      duration_minutes: 120,
      billable: true,
      is_billable: true,
      hourly_rate: 125,
      total_amount: 250,
      status: 'completed',
      created_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      user_id: USER_ID,
      project_id: projectIds[2],
      project_name: 'StartupXYZ Mobile App UI',
      task_id: taskIds[7],
      task_name: 'Research competitor apps',
      description: 'Competitor app analysis and documentation',
      entry_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      start_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 95 * 60 * 1000).toISOString(),
      duration: 95,
      duration_minutes: 95,
      billable: true,
      is_billable: true,
      hourly_rate: 125,
      total_amount: 198,
      status: 'completed',
      created_at: new Date().toISOString()
    }
  ]

  const { error: timeError } = await supabase.from('time_entries').insert(timeEntries)
  if (timeError) {
    console.log('   Time entries error:', timeError.message)
  } else {
    console.log('   ✅ Created', timeEntries.length, 'time entries')
  }

  // 6. CALENDAR EVENTS
  console.log('\n6. Creating calendar events...')
  const events = [
    {
      id: crypto.randomUUID(),
      user_id: USER_ID,
      title: 'TechCorp Review Meeting',
      description: 'Weekly progress review with TechCorp stakeholders',
      start_time: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000).toISOString(),
      type: 'meeting',
      status: 'confirmed',
      location: 'Google Meet',
      location_type: 'virtual',
      color: '#4285F4',
      all_day: false,
      client_id: clientIds[0],
      project_id: projectIds[0],
      created_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      user_id: USER_ID,
      title: 'Design Studio Brand Presentation',
      description: 'Present logo concepts to Sarah',
      start_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000).toISOString(),
      type: 'meeting',
      status: 'confirmed',
      location: 'Zoom',
      location_type: 'virtual',
      color: '#0B5CFF',
      all_day: false,
      client_id: clientIds[1],
      project_id: projectIds[1],
      created_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      user_id: USER_ID,
      title: 'StartupXYZ Kickoff Call',
      description: 'Initial project kickoff with Michael',
      start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000).toISOString(),
      type: 'meeting',
      status: 'pending',
      location: 'TBD',
      location_type: 'virtual',
      color: '#EA4335',
      all_day: false,
      client_id: clientIds[2],
      project_id: projectIds[2],
      created_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      user_id: USER_ID,
      title: 'Website Development Sprint',
      description: 'Focused work on TechCorp navigation and hero section',
      start_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000).toISOString(),
      type: 'focus',
      status: 'confirmed',
      color: '#34A853',
      all_day: false,
      project_id: projectIds[0],
      created_at: new Date().toISOString()
    }
  ]

  const { error: eventsError } = await supabase.from('calendar_events').insert(events)
  if (eventsError) {
    console.log('   Calendar events error:', eventsError.message)
    // Try without FK constraints - the user_id might need to be auth user
    console.log('   Note: Calendar events may require auth.users FK')
  } else {
    console.log('   ✅ Created', events.length, 'calendar events')
  }

  console.log('\n==========================================')
  console.log('Demo data seeding complete!')
  console.log('==========================================')
  console.log('\nData summary:')
  console.log('- 4 Clients (3 active, 1 lead)')
  console.log('- 4 Projects (2 in progress, 1 planning, 1 completed)')
  console.log('- 8 Tasks (2 completed, 2 in progress, 4 todo)')
  console.log('- 5 Invoices (3 paid, 1 sent, 1 draft)')
  console.log('- 4 Time entries')
  console.log('- 4 Calendar events')
  console.log('\nTotal Revenue: $89,250')
  console.log('Outstanding: $12,650')
}

seedDemoData()
