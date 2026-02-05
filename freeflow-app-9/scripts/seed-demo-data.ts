/**
 * Comprehensive Demo Data Seeder for KAZI Platform
 *
 * Creates realistic demo data for investor presentations including:
 * - Projects with milestones and tasks
 * - Time tracking entries
 * - Team members
 * - Calendar events
 * - Analytics data
 *
 * Usage: npx tsx scripts/seed-demo-data.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { DEMO_USER_ID } from '../lib/utils/demo-mode'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// ============================================================================
// SAMPLE PROJECTS
// ============================================================================

const sampleProjects = [
  {
    id: '40000000-0000-0000-0000-000000000001',
    user_id: DEMO_USER_ID,
    name: 'TechStartup Website Redesign',
    description: 'Complete website redesign with modern UI/UX, responsive design, and improved performance.',
    status: 'in_progress',
    priority: 'high',
    client_id: '10000000-0000-0000-0000-000000000001',
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    budget: 15000,
    budget_used: 8500,
    progress: 65,
    tags: ['web-design', 'react', 'ui-ux'],
  },
  {
    id: '40000000-0000-0000-0000-000000000002',
    user_id: DEMO_USER_ID,
    name: 'Creative Agency Brand Package',
    description: 'Full branding package including logo, brand guidelines, and marketing materials.',
    status: 'in_progress',
    priority: 'medium',
    client_id: '10000000-0000-0000-0000-000000000002',
    start_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    budget: 8000,
    budget_used: 2400,
    progress: 30,
    tags: ['branding', 'design', 'marketing'],
  },
  {
    id: '40000000-0000-0000-0000-000000000003',
    user_id: DEMO_USER_ID,
    name: 'HealthTech Patient Portal',
    description: 'HIPAA-compliant patient portal with appointment scheduling, records access, and messaging.',
    status: 'planning',
    priority: 'high',
    client_id: '10000000-0000-0000-0000-000000000005',
    start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    budget: 45000,
    budget_used: 0,
    progress: 5,
    tags: ['healthcare', 'portal', 'hipaa'],
  },
  {
    id: '40000000-0000-0000-0000-000000000004',
    user_id: DEMO_USER_ID,
    name: 'Local Cafe Mobile App',
    description: 'Mobile ordering app with menu, payments, and loyalty rewards.',
    status: 'completed',
    priority: 'medium',
    client_id: '10000000-0000-0000-0000-000000000004',
    start_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    budget: 12000,
    budget_used: 11200,
    progress: 100,
    tags: ['mobile', 'food', 'react-native'],
  },
  {
    id: '40000000-0000-0000-0000-000000000005',
    user_id: DEMO_USER_ID,
    name: 'Nonprofit Donation Platform',
    description: 'Donation management system with recurring gifts, campaigns, and donor CRM.',
    status: 'in_progress',
    priority: 'medium',
    client_id: '10000000-0000-0000-0000-000000000006',
    start_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    budget: 6500,
    budget_used: 5200,
    progress: 80,
    tags: ['nonprofit', 'donations', 'crm'],
  },
  {
    id: '40000000-0000-0000-0000-000000000006',
    user_id: DEMO_USER_ID,
    name: 'Global Corp Enterprise Dashboard',
    description: 'Executive dashboard with real-time analytics, reporting, and KPI tracking.',
    status: 'in_progress',
    priority: 'high',
    client_id: '10000000-0000-0000-0000-000000000003',
    start_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    budget: 75000,
    budget_used: 35000,
    progress: 45,
    tags: ['enterprise', 'analytics', 'dashboard'],
  },
]

// ============================================================================
// SAMPLE TASKS
// ============================================================================

const generateTasks = () => {
  const tasks = [
    // TechStartup Website tasks
    { id: '50000000-0000-0000-0000-000000000001', project_id: '40000000-0000-0000-0000-000000000001', title: 'Design homepage mockup', status: 'completed', priority: 'high', due_date: -20 },
    { id: '50000000-0000-0000-0000-000000000002', project_id: '40000000-0000-0000-0000-000000000001', title: 'Develop navigation component', status: 'completed', priority: 'high', due_date: -15 },
    { id: '50000000-0000-0000-0000-000000000003', project_id: '40000000-0000-0000-0000-000000000001', title: 'Build contact form with validation', status: 'completed', priority: 'medium', due_date: -10 },
    { id: '50000000-0000-0000-0000-000000000004', project_id: '40000000-0000-0000-0000-000000000001', title: 'Implement responsive design', status: 'in_progress', priority: 'high', due_date: 5 },
    { id: '50000000-0000-0000-0000-000000000005', project_id: '40000000-0000-0000-0000-000000000001', title: 'Integrate analytics tracking', status: 'todo', priority: 'medium', due_date: 15 },
    { id: '50000000-0000-0000-0000-000000000006', project_id: '40000000-0000-0000-0000-000000000001', title: 'Performance optimization', status: 'todo', priority: 'medium', due_date: 25 },

    // Creative Agency Brand tasks
    { id: '50000000-0000-0000-0000-000000000007', project_id: '40000000-0000-0000-0000-000000000002', title: 'Logo concept sketches', status: 'completed', priority: 'high', due_date: -10 },
    { id: '50000000-0000-0000-0000-000000000008', project_id: '40000000-0000-0000-0000-000000000002', title: 'Digital logo finalization', status: 'in_progress', priority: 'high', due_date: 3 },
    { id: '50000000-0000-0000-0000-000000000009', project_id: '40000000-0000-0000-0000-000000000002', title: 'Brand color palette', status: 'todo', priority: 'medium', due_date: 10 },
    { id: '50000000-0000-0000-0000-000000000010', project_id: '40000000-0000-0000-0000-000000000002', title: 'Brand guidelines document', status: 'todo', priority: 'high', due_date: 30 },

    // HealthTech tasks
    { id: '50000000-0000-0000-0000-000000000011', project_id: '40000000-0000-0000-0000-000000000003', title: 'Requirements gathering', status: 'in_progress', priority: 'high', due_date: 10 },
    { id: '50000000-0000-0000-0000-000000000012', project_id: '40000000-0000-0000-0000-000000000003', title: 'HIPAA compliance review', status: 'todo', priority: 'high', due_date: 20 },
    { id: '50000000-0000-0000-0000-000000000013', project_id: '40000000-0000-0000-0000-000000000003', title: 'System architecture design', status: 'todo', priority: 'high', due_date: 25 },

    // Nonprofit tasks
    { id: '50000000-0000-0000-0000-000000000014', project_id: '40000000-0000-0000-0000-000000000005', title: 'Donation form design', status: 'completed', priority: 'high', due_date: -30 },
    { id: '50000000-0000-0000-0000-000000000015', project_id: '40000000-0000-0000-0000-000000000005', title: 'Payment gateway integration', status: 'completed', priority: 'high', due_date: -20 },
    { id: '50000000-0000-0000-0000-000000000016', project_id: '40000000-0000-0000-0000-000000000005', title: 'Recurring donations feature', status: 'in_progress', priority: 'high', due_date: 5 },
    { id: '50000000-0000-0000-0000-000000000017', project_id: '40000000-0000-0000-0000-000000000005', title: 'Email receipt automation', status: 'todo', priority: 'medium', due_date: 10 },

    // Global Corp tasks
    { id: '50000000-0000-0000-0000-000000000018', project_id: '40000000-0000-0000-0000-000000000006', title: 'Data warehouse setup', status: 'completed', priority: 'high', due_date: -40 },
    { id: '50000000-0000-0000-0000-000000000019', project_id: '40000000-0000-0000-0000-000000000006', title: 'KPI dashboard wireframes', status: 'completed', priority: 'high', due_date: -30 },
    { id: '50000000-0000-0000-0000-000000000020', project_id: '40000000-0000-0000-0000-000000000006', title: 'Real-time data pipeline', status: 'in_progress', priority: 'high', due_date: 10 },
    { id: '50000000-0000-0000-0000-000000000021', project_id: '40000000-0000-0000-0000-000000000006', title: 'Executive report templates', status: 'todo', priority: 'medium', due_date: 30 },
    { id: '50000000-0000-0000-0000-000000000022', project_id: '40000000-0000-0000-0000-000000000006', title: 'SSO integration', status: 'todo', priority: 'high', due_date: 45 },
  ]

  return tasks.map(task => ({
    ...task,
    user_id: DEMO_USER_ID,
    due_date: new Date(Date.now() + task.due_date * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: `Task for ${task.title.toLowerCase()}`,
    estimated_hours: Math.floor(Math.random() * 16) + 4,
  }))
}

// ============================================================================
// SAMPLE TIME ENTRIES
// ============================================================================

const generateTimeEntries = () => {
  const entries = []
  const tasks = [
    { task_id: '50000000-0000-0000-0000-000000000001', project_id: '40000000-0000-0000-0000-000000000001', description: 'Homepage mockup design' },
    { task_id: '50000000-0000-0000-0000-000000000002', project_id: '40000000-0000-0000-0000-000000000001', description: 'Navigation development' },
    { task_id: '50000000-0000-0000-0000-000000000003', project_id: '40000000-0000-0000-0000-000000000001', description: 'Contact form implementation' },
    { task_id: '50000000-0000-0000-0000-000000000007', project_id: '40000000-0000-0000-0000-000000000002', description: 'Logo sketching session' },
    { task_id: '50000000-0000-0000-0000-000000000014', project_id: '40000000-0000-0000-0000-000000000005', description: 'Donation form UI' },
    { task_id: '50000000-0000-0000-0000-000000000018', project_id: '40000000-0000-0000-0000-000000000006', description: 'Data warehouse configuration' },
    { task_id: '50000000-0000-0000-0000-000000000019', project_id: '40000000-0000-0000-0000-000000000006', description: 'Dashboard wireframes' },
  ]

  for (let i = 0; i < 50; i++) {
    const task = tasks[i % tasks.length]
    const daysAgo = Math.floor(Math.random() * 30)
    const hours = Math.floor(Math.random() * 6) + 1
    const hourlyRate = 125 + Math.floor(Math.random() * 50)

    entries.push({
      id: `60000000-0000-0000-0000-${String(i + 1).padStart(12, '0')}`,
      user_id: DEMO_USER_ID,
      project_id: task.project_id,
      task_id: task.task_id,
      description: task.description,
      start_time: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 + (9 + hours) * 60 * 60 * 1000).toISOString(),
      duration: hours * 60,
      billable: Math.random() > 0.2,
      hourly_rate: hourlyRate,
      total_amount: hours * hourlyRate,
    })
  }

  return entries
}

// ============================================================================
// SAMPLE TEAM MEMBERS
// ============================================================================

const sampleTeamMembers = [
  {
    id: '70000000-0000-0000-0000-000000000001',
    user_id: DEMO_USER_ID,
    name: 'Alex Thompson',
    email: 'alex@kazi.io',
    role: 'Founder & Lead Developer',
    avatar: '/avatars/alex.png',
    status: 'active',
    department: 'Engineering',
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
  },
  {
    id: '70000000-0000-0000-0000-000000000002',
    user_id: DEMO_USER_ID,
    name: 'Jordan Rivera',
    email: 'jordan@kazi.io',
    role: 'Senior Designer',
    avatar: '/avatars/jordan.png',
    status: 'active',
    department: 'Design',
    skills: ['UI/UX', 'Figma', 'Branding', 'Motion Design'],
  },
  {
    id: '70000000-0000-0000-0000-000000000003',
    user_id: DEMO_USER_ID,
    name: 'Sam Martinez',
    email: 'sam@kazi.io',
    role: 'Full Stack Developer',
    avatar: '/avatars/sam.png',
    status: 'active',
    department: 'Engineering',
    skills: ['Next.js', 'Python', 'AWS', 'GraphQL'],
  },
  {
    id: '70000000-0000-0000-0000-000000000004',
    user_id: DEMO_USER_ID,
    name: 'Taylor Chen',
    email: 'taylor@kazi.io',
    role: 'Project Manager',
    avatar: '/avatars/taylor.png',
    status: 'active',
    department: 'Operations',
    skills: ['Agile', 'Client Relations', 'Budgeting', 'Risk Management'],
  },
]

// ============================================================================
// SAMPLE CALENDAR EVENTS
// ============================================================================

const generateCalendarEvents = () => {
  const events = [
    { title: 'TechStartup Weekly Sync', client: 'TechStartup Inc.', type: 'meeting', daysOffset: 1, duration: 60 },
    { title: 'Design Review - Brand Package', client: 'Creative Design Agency', type: 'review', daysOffset: 2, duration: 90 },
    { title: 'HealthTech Kickoff Call', client: 'HealthTech Solutions', type: 'meeting', daysOffset: 7, duration: 120 },
    { title: 'Sprint Planning', client: null, type: 'internal', daysOffset: 3, duration: 60 },
    { title: 'Nonprofit Demo Presentation', client: 'Community Impact Foundation', type: 'demo', daysOffset: 5, duration: 45 },
    { title: 'Global Corp Stakeholder Meeting', client: 'Global Corporation Ltd', type: 'meeting', daysOffset: 10, duration: 90 },
    { title: 'Team Retrospective', client: null, type: 'internal', daysOffset: 4, duration: 60 },
    { title: 'Code Review Session', client: null, type: 'internal', daysOffset: 2, duration: 60 },
    { title: 'Client Invoice Review', client: null, type: 'internal', daysOffset: 6, duration: 30 },
    { title: 'Platform Training Webinar', client: null, type: 'webinar', daysOffset: 14, duration: 120 },
  ]

  return events.map((event, index) => {
    const eventDate = new Date(Date.now() + event.daysOffset * 24 * 60 * 60 * 1000)
    eventDate.setHours(10 + (index % 6), 0, 0, 0)

    return {
      id: `80000000-0000-0000-0000-${String(index + 1).padStart(12, '0')}`,
      user_id: DEMO_USER_ID,
      title: event.title,
      description: event.client ? `Meeting with ${event.client}` : event.title,
      start_time: eventDate.toISOString(),
      end_time: new Date(eventDate.getTime() + event.duration * 60 * 1000).toISOString(),
      type: event.type,
      location: event.type === 'meeting' ? 'Zoom' : 'Office',
      attendees: event.client ? [event.client] : ['Team'],
      color: event.type === 'meeting' ? '#3B82F6' : event.type === 'demo' ? '#10B981' : '#8B5CF6',
    }
  })
}

// ============================================================================
// MAIN SEEDING FUNCTION
// ============================================================================

async function seedDemoData() {
  console.log('========================================')
  console.log('KAZI Demo Data Seeder')
  console.log('========================================')
  console.log('')

  try {
    // Seed Projects
    console.log('Seeding projects...')
    const { error: projectError } = await supabase
      .from('projects')
      .upsert(sampleProjects, { onConflict: 'id' })

    if (projectError) {
      console.log('Projects table may not exist or error:', projectError.message)
    } else {
      console.log(`✓ Inserted ${sampleProjects.length} projects`)
    }

    // Seed Tasks
    console.log('Seeding tasks...')
    const tasks = generateTasks()
    const { error: taskError } = await supabase
      .from('tasks')
      .upsert(tasks, { onConflict: 'id' })

    if (taskError) {
      console.log('Tasks table may not exist or error:', taskError.message)
    } else {
      console.log(`✓ Inserted ${tasks.length} tasks`)
    }

    // Seed Time Entries
    console.log('Seeding time entries...')
    const timeEntries = generateTimeEntries()
    const { error: timeError } = await supabase
      .from('time_entries')
      .upsert(timeEntries, { onConflict: 'id' })

    if (timeError) {
      console.log('Time entries table may not exist or error:', timeError.message)
    } else {
      console.log(`✓ Inserted ${timeEntries.length} time entries`)
    }

    // Seed Team Members
    console.log('Seeding team members...')
    const { error: teamError } = await supabase
      .from('team_members')
      .upsert(sampleTeamMembers, { onConflict: 'id' })

    if (teamError) {
      console.log('Team members table may not exist or error:', teamError.message)
    } else {
      console.log(`✓ Inserted ${sampleTeamMembers.length} team members`)
    }

    // Seed Calendar Events
    console.log('Seeding calendar events...')
    const calendarEvents = generateCalendarEvents()
    const { error: calendarError } = await supabase
      .from('calendar_events')
      .upsert(calendarEvents, { onConflict: 'id' })

    if (calendarError) {
      console.log('Calendar events table may not exist or error:', calendarError.message)
    } else {
      console.log(`✓ Inserted ${calendarEvents.length} calendar events`)
    }

    // Summary
    console.log('')
    console.log('========================================')
    console.log('Demo Data Summary')
    console.log('========================================')
    console.log('')
    console.log('Projects:', sampleProjects.length)
    console.log('  - In Progress:', sampleProjects.filter(p => p.status === 'in_progress').length)
    console.log('  - Planning:', sampleProjects.filter(p => p.status === 'planning').length)
    console.log('  - Completed:', sampleProjects.filter(p => p.status === 'completed').length)
    console.log('')
    console.log('Tasks:', tasks.length)
    console.log('  - Completed:', tasks.filter(t => t.status === 'completed').length)
    console.log('  - In Progress:', tasks.filter(t => t.status === 'in_progress').length)
    console.log('  - Todo:', tasks.filter(t => t.status === 'todo').length)
    console.log('')
    console.log('Time Entries:', timeEntries.length)
    const totalHours = timeEntries.reduce((sum, e) => sum + e.duration / 60, 0)
    const totalBillable = timeEntries.filter(e => e.billable).reduce((sum, e) => sum + e.total_amount, 0)
    console.log('  - Total Hours:', totalHours.toFixed(1))
    console.log('  - Billable Amount: $' + totalBillable.toLocaleString())
    console.log('')
    console.log('Team Members:', sampleTeamMembers.length)
    console.log('Calendar Events:', calendarEvents.length)
    console.log('')
    console.log('Demo data seeding complete!')
    console.log('')
    console.log('Next steps:')
    console.log('1. Run: npx tsx scripts/seed-clients-invoices.ts')
    console.log('2. Login as demo user to see all data')
    console.log('')

  } catch (error) {
    console.error('Seed failed:', error)
    process.exit(1)
  }
}

// Run the seed function
seedDemoData()
