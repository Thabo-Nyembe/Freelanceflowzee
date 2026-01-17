#!/usr/bin/env node

/**
 * KAZI - Seed Projects, Tasks, Milestones, and Time Entries
 *
 * This script populates the database with realistic demo data for:
 * - Projects (5-10 with different statuses)
 * - Tasks (20-30 across projects)
 * - Milestones (for each project)
 * - Time entries (for demo purposes)
 *
 * Usage: node scripts/seed-projects.js
 *
 * @copyright Copyright (c) 2025 KAZI. All rights reserved.
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Demo user ID
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables.')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Helper to generate UUIDs
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Helper to get random date in range
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Helper to format date as ISO string
function formatDate(date) {
  return date.toISOString()
}

// Helper to format date as date only
function formatDateOnly(date) {
  return date.toISOString().split('T')[0]
}

// ============================================
// SAMPLE DATA
// ============================================

const sampleProjects = [
  {
    id: generateUUID(),
    title: 'E-Commerce Platform Redesign',
    description: 'Complete redesign of the company e-commerce platform with modern UI/UX, improved performance, and mobile-first approach.',
    status: 'active',
    priority: 'high',
    budget: 75000,
    spent: 32500,
    progress: 45,
  },
  {
    id: generateUUID(),
    title: 'Mobile Banking App Development',
    description: 'Native iOS and Android mobile banking application with biometric authentication, real-time notifications, and seamless transactions.',
    status: 'active',
    priority: 'urgent',
    budget: 150000,
    spent: 89000,
    progress: 62,
  },
  {
    id: generateUUID(),
    title: 'Corporate Website Refresh',
    description: 'Modernizing the corporate website with updated branding, improved SEO, and enhanced user engagement features.',
    status: 'completed',
    priority: 'medium',
    budget: 25000,
    spent: 23500,
    progress: 100,
  },
  {
    id: generateUUID(),
    title: 'CRM Integration Project',
    description: 'Integrating Salesforce CRM with internal systems for unified customer data management and automated workflows.',
    status: 'active',
    priority: 'high',
    budget: 45000,
    spent: 15000,
    progress: 35,
  },
  {
    id: generateUUID(),
    title: 'Data Analytics Dashboard',
    description: 'Building a comprehensive analytics dashboard for business intelligence, featuring real-time metrics and predictive insights.',
    status: 'on-hold',
    priority: 'medium',
    budget: 35000,
    spent: 8500,
    progress: 25,
  },
  {
    id: generateUUID(),
    title: 'Cloud Migration Initiative',
    description: 'Migrating legacy on-premise infrastructure to AWS cloud with improved scalability, security, and cost optimization.',
    status: 'active',
    priority: 'high',
    budget: 120000,
    spent: 45000,
    progress: 40,
  },
  {
    id: generateUUID(),
    title: 'API Gateway Implementation',
    description: 'Implementing a unified API gateway for microservices architecture with rate limiting, authentication, and monitoring.',
    status: 'active',
    priority: 'medium',
    budget: 30000,
    spent: 12000,
    progress: 55,
  },
  {
    id: generateUUID(),
    title: 'Customer Support Portal',
    description: 'Building a self-service customer support portal with knowledge base, ticketing system, and live chat integration.',
    status: 'cancelled',
    priority: 'low',
    budget: 40000,
    spent: 5000,
    progress: 15,
  },
]

// Task templates for each project
const taskTemplates = [
  // E-Commerce Platform tasks
  { title: 'Design system and component library', status: 'completed', priority: 'high', category: 'Design', estimated_hours: 40 },
  { title: 'Homepage redesign mockups', status: 'completed', priority: 'high', category: 'Design', estimated_hours: 24 },
  { title: 'Product listing page development', status: 'in_progress', priority: 'high', category: 'Development', estimated_hours: 32 },
  { title: 'Shopping cart implementation', status: 'in_progress', priority: 'urgent', category: 'Development', estimated_hours: 28 },
  { title: 'Checkout flow optimization', status: 'todo', priority: 'high', category: 'Development', estimated_hours: 36 },
  { title: 'Payment gateway integration', status: 'todo', priority: 'urgent', category: 'Development', estimated_hours: 20 },
  { title: 'Mobile responsiveness testing', status: 'todo', priority: 'medium', category: 'QA', estimated_hours: 16 },

  // Mobile Banking tasks
  { title: 'User authentication module', status: 'completed', priority: 'urgent', category: 'Security', estimated_hours: 48 },
  { title: 'Biometric login implementation', status: 'completed', priority: 'high', category: 'Development', estimated_hours: 32 },
  { title: 'Account dashboard UI', status: 'in_progress', priority: 'high', category: 'Design', estimated_hours: 24 },
  { title: 'Transaction history feature', status: 'in_progress', priority: 'medium', category: 'Development', estimated_hours: 20 },
  { title: 'Push notification system', status: 'in_review', priority: 'medium', category: 'Development', estimated_hours: 16 },
  { title: 'Bill payment integration', status: 'todo', priority: 'high', category: 'Development', estimated_hours: 40 },

  // CRM Integration tasks
  { title: 'Salesforce API analysis', status: 'completed', priority: 'high', category: 'Research', estimated_hours: 16 },
  { title: 'Data mapping documentation', status: 'completed', priority: 'medium', category: 'Documentation', estimated_hours: 12 },
  { title: 'Contact sync implementation', status: 'in_progress', priority: 'high', category: 'Development', estimated_hours: 24 },
  { title: 'Lead management workflow', status: 'todo', priority: 'medium', category: 'Development', estimated_hours: 28 },
  { title: 'Reporting dashboard', status: 'todo', priority: 'low', category: 'Development', estimated_hours: 20 },

  // Cloud Migration tasks
  { title: 'Infrastructure assessment', status: 'completed', priority: 'high', category: 'Planning', estimated_hours: 32 },
  { title: 'AWS architecture design', status: 'completed', priority: 'high', category: 'Architecture', estimated_hours: 40 },
  { title: 'Database migration script', status: 'in_progress', priority: 'urgent', category: 'Development', estimated_hours: 48 },
  { title: 'Application containerization', status: 'in_progress', priority: 'high', category: 'DevOps', estimated_hours: 36 },
  { title: 'Load balancer configuration', status: 'todo', priority: 'medium', category: 'DevOps', estimated_hours: 16 },
  { title: 'Security compliance audit', status: 'todo', priority: 'high', category: 'Security', estimated_hours: 24 },

  // API Gateway tasks
  { title: 'Gateway architecture design', status: 'completed', priority: 'high', category: 'Architecture', estimated_hours: 20 },
  { title: 'Authentication middleware', status: 'in_progress', priority: 'high', category: 'Security', estimated_hours: 24 },
  { title: 'Rate limiting implementation', status: 'in_progress', priority: 'medium', category: 'Development', estimated_hours: 16 },
  { title: 'API documentation', status: 'todo', priority: 'medium', category: 'Documentation', estimated_hours: 12 },
  { title: 'Monitoring and logging', status: 'todo', priority: 'medium', category: 'DevOps', estimated_hours: 20 },
]

// Milestone templates
const milestoneTemplates = [
  { name: 'Project Kickoff', type: 'project', priority: 'high', progress: 100, status: 'completed' },
  { name: 'Design Phase Completion', type: 'project', priority: 'high', progress: 100, status: 'completed' },
  { name: 'Alpha Release', type: 'product', priority: 'high', progress: 65, status: 'in-progress' },
  { name: 'Beta Testing', type: 'product', priority: 'medium', progress: 30, status: 'in-progress' },
  { name: 'Production Deployment', type: 'product', priority: 'critical', progress: 0, status: 'upcoming' },
  { name: 'Security Audit', type: 'compliance', priority: 'high', progress: 45, status: 'in-progress' },
  { name: 'Performance Optimization', type: 'technical', priority: 'medium', progress: 20, status: 'in-progress' },
  { name: 'User Acceptance Testing', type: 'product', priority: 'high', progress: 0, status: 'upcoming' },
]

// ============================================
// SEED FUNCTIONS
// ============================================

async function checkExistingData() {
  console.log('Checking for existing data...')

  const { data: projects, error } = await supabase
    .from('projects')
    .select('id')
    .eq('user_id', DEMO_USER_ID)
    .limit(1)

  if (error) {
    console.error('Error checking existing data:', error.message)
    return false
  }

  if (projects && projects.length > 0) {
    console.log('Demo data already exists. Skipping seed.')
    console.log('To re-seed, first delete existing demo data.')
    return true
  }

  return false
}

async function seedProjects() {
  console.log('\nSeeding projects...')

  const now = new Date()
  const projectsToInsert = sampleProjects.map(project => ({
    ...project,
    user_id: DEMO_USER_ID,
    client_id: null,
    start_date: formatDate(randomDate(new Date(now.getFullYear(), now.getMonth() - 3, 1), new Date(now.getFullYear(), now.getMonth() - 1, 1))),
    end_date: formatDate(randomDate(new Date(now.getFullYear(), now.getMonth() + 1, 1), new Date(now.getFullYear(), now.getMonth() + 4, 1))),
    deadline: formatDate(randomDate(new Date(now.getFullYear(), now.getMonth() + 1, 1), new Date(now.getFullYear(), now.getMonth() + 3, 1))),
    created_at: formatDate(new Date()),
    updated_at: formatDate(new Date()),
    metadata: {
      team_size: Math.floor(Math.random() * 8) + 3,
      department: ['Engineering', 'Product', 'Design', 'Operations'][Math.floor(Math.random() * 4)],
      seeded: true
    }
  }))

  const { data, error } = await supabase
    .from('projects')
    .insert(projectsToInsert)
    .select()

  if (error) {
    console.error('Error seeding projects:', error.message)
    return null
  }

  console.log(`Successfully seeded ${data.length} projects`)
  return data
}

async function seedTasks(projects) {
  console.log('\nSeeding tasks...')

  const now = new Date()
  const tasksToInsert = []

  // Distribute tasks across projects
  const activeProjects = projects.filter(p => p.status !== 'cancelled')
  let taskIndex = 0

  activeProjects.forEach((project, projectIndex) => {
    // Assign 3-5 tasks per project
    const tasksForProject = Math.floor(Math.random() * 3) + 3

    for (let i = 0; i < tasksForProject && taskIndex < taskTemplates.length; i++) {
      const template = taskTemplates[taskIndex]
      const startDate = randomDate(new Date(now.getFullYear(), now.getMonth() - 2, 1), now)
      const dueDate = randomDate(now, new Date(now.getFullYear(), now.getMonth() + 2, 1))

      tasksToInsert.push({
        id: generateUUID(),
        user_id: DEMO_USER_ID,
        project_id: project.id,
        assigned_to: DEMO_USER_ID,
        title: template.title,
        description: `Task for ${project.title}: ${template.title}`,
        status: template.status,
        priority: template.priority,
        category: template.category,
        tags: [template.category.toLowerCase(), project.status],
        start_date: formatDate(startDate),
        due_date: formatDate(dueDate),
        completed_at: template.status === 'completed' ? formatDate(randomDate(startDate, now)) : null,
        estimated_hours: template.estimated_hours,
        actual_hours: template.status === 'completed' ? template.estimated_hours + Math.floor(Math.random() * 10) - 5 : Math.floor(template.estimated_hours * Math.random() * 0.7),
        progress: template.status === 'completed' ? 100 : template.status === 'in_progress' ? Math.floor(Math.random() * 50) + 30 : template.status === 'in_review' ? Math.floor(Math.random() * 20) + 75 : 0,
        parent_task_id: null,
        subtasks: null,
        attachments: null,
        comments: null,
        checklist: [
          { id: generateUUID(), text: 'Initial research', completed: true },
          { id: generateUUID(), text: 'Create draft', completed: template.status !== 'todo' },
          { id: generateUUID(), text: 'Review and iterate', completed: template.status === 'completed' || template.status === 'in_review' },
          { id: generateUUID(), text: 'Final approval', completed: template.status === 'completed' }
        ],
        created_at: formatDate(startDate),
        updated_at: formatDate(new Date()),
        created_by: DEMO_USER_ID
      })

      taskIndex++
    }
  })

  const { data, error } = await supabase
    .from('tasks')
    .insert(tasksToInsert)
    .select()

  if (error) {
    console.error('Error seeding tasks:', error.message)
    return null
  }

  console.log(`Successfully seeded ${data.length} tasks`)
  return data
}

async function seedMilestones(projects) {
  console.log('\nSeeding milestones...')

  const now = new Date()
  const milestonesToInsert = []

  // Assign 2-4 milestones per active project
  const activeProjects = projects.filter(p => p.status !== 'cancelled')

  activeProjects.forEach((project, projectIndex) => {
    const milestonesForProject = Math.floor(Math.random() * 3) + 2
    const shuffled = [...milestoneTemplates].sort(() => 0.5 - Math.random())

    for (let i = 0; i < milestonesForProject; i++) {
      const template = shuffled[i]
      const dueDate = randomDate(now, new Date(now.getFullYear(), now.getMonth() + 3, 1))
      const daysRemaining = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      milestonesToInsert.push({
        id: generateUUID(),
        user_id: DEMO_USER_ID,
        milestone_code: `MLS-${Date.now().toString(36).toUpperCase()}-${i}`,
        name: `${template.name} - ${project.title.split(' ')[0]}`,
        description: `Milestone for ${project.title}: ${template.name}`,
        type: template.type,
        status: template.status,
        priority: template.priority,
        due_date: formatDate(dueDate),
        days_remaining: daysRemaining,
        progress: template.progress,
        owner_name: 'Demo User',
        owner_email: 'demo@kazi.com',
        team_name: 'Development Team',
        deliverables: Math.floor(Math.random() * 5) + 3,
        completed_deliverables: Math.floor((template.progress / 100) * (Math.floor(Math.random() * 5) + 3)),
        budget: Math.floor(Math.random() * 20000) + 5000,
        spent: Math.floor((template.progress / 100) * (Math.floor(Math.random() * 20000) + 5000)),
        currency: 'USD',
        dependencies: Math.floor(Math.random() * 3),
        stakeholders: ['Product Manager', 'Tech Lead', 'Designer'].slice(0, Math.floor(Math.random() * 3) + 1),
        tags: [template.type, template.priority],
        configuration: { project_id: project.id },
        created_at: formatDate(new Date()),
        updated_at: formatDate(new Date()),
        deleted_at: null
      })
    }
  })

  const { data, error } = await supabase
    .from('milestones')
    .insert(milestonesToInsert)
    .select()

  if (error) {
    console.error('Error seeding milestones:', error.message)
    return null
  }

  console.log(`Successfully seeded ${data.length} milestones`)
  return data
}

async function seedTimeEntries(projects, tasks) {
  console.log('\nSeeding time entries...')

  const now = new Date()
  const timeEntriesToInsert = []

  // Create time entries for the past 14 days
  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const entryDate = new Date(now)
    entryDate.setDate(entryDate.getDate() - dayOffset)

    // Skip weekends
    if (entryDate.getDay() === 0 || entryDate.getDay() === 6) continue

    // 2-5 entries per day
    const entriesPerDay = Math.floor(Math.random() * 4) + 2

    for (let i = 0; i < entriesPerDay; i++) {
      const randomTask = tasks[Math.floor(Math.random() * tasks.length)]
      const project = projects.find(p => p.id === randomTask?.project_id) || projects[0]

      const startHour = 8 + Math.floor(Math.random() * 8) // 8 AM to 4 PM
      const duration = Math.floor(Math.random() * 180) + 30 // 30 min to 3.5 hours

      const startTime = new Date(entryDate)
      startTime.setHours(startHour, Math.floor(Math.random() * 60), 0, 0)

      const endTime = new Date(startTime)
      endTime.setMinutes(endTime.getMinutes() + duration)

      const hourlyRate = [75, 100, 125, 150][Math.floor(Math.random() * 4)]
      const isBillable = Math.random() > 0.2

      timeEntriesToInsert.push({
        id: generateUUID(),
        user_id: DEMO_USER_ID,
        project_id: project.id,
        project_name: project.title,
        task_id: randomTask?.id || null,
        task_name: randomTask?.title || null,
        description: `Working on ${randomTask?.title || project.title}`,
        start_time: formatDate(startTime),
        end_time: formatDate(endTime),
        duration: duration * 60, // Convert to seconds
        status: 'completed',
        is_billable: isBillable,
        hourly_rate: hourlyRate,
        total_amount: isBillable ? (duration / 60) * hourlyRate : 0,
        entry_date: formatDateOnly(entryDate),
        tags: [randomTask?.category?.toLowerCase() || 'general'],
        notes: null,
        metadata: { seeded: true },
        created_at: formatDate(new Date()),
        updated_at: formatDate(new Date())
      })
    }
  }

  const { data, error } = await supabase
    .from('time_entries')
    .insert(timeEntriesToInsert)
    .select()

  if (error) {
    console.error('Error seeding time entries:', error.message)
    return null
  }

  console.log(`Successfully seeded ${data.length} time entries`)
  return data
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  console.log('===========================================')
  console.log('KAZI - Seed Projects & Tasks')
  console.log('===========================================')
  console.log(`Demo User ID: ${DEMO_USER_ID}`)
  console.log(`Supabase URL: ${supabaseUrl}`)
  console.log('===========================================\n')

  try {
    // Check if data already exists
    const exists = await checkExistingData()
    if (exists) {
      process.exit(0)
    }

    // Seed projects
    const projects = await seedProjects()
    if (!projects) {
      console.error('Failed to seed projects. Aborting.')
      process.exit(1)
    }

    // Seed tasks
    const tasks = await seedTasks(projects)
    if (!tasks) {
      console.error('Failed to seed tasks. Continuing with other seeds...')
    }

    // Seed milestones
    const milestones = await seedMilestones(projects)
    if (!milestones) {
      console.error('Failed to seed milestones. Continuing with other seeds...')
    }

    // Seed time entries
    const timeEntries = await seedTimeEntries(projects, tasks || [])
    if (!timeEntries) {
      console.error('Failed to seed time entries.')
    }

    // Summary
    console.log('\n===========================================')
    console.log('SEED COMPLETE')
    console.log('===========================================')
    console.log(`Projects: ${projects?.length || 0}`)
    console.log(`Tasks: ${tasks?.length || 0}`)
    console.log(`Milestones: ${milestones?.length || 0}`)
    console.log(`Time Entries: ${timeEntries?.length || 0}`)
    console.log('===========================================\n')

  } catch (error) {
    console.error('Unexpected error during seeding:', error)
    process.exit(1)
  }
}

// Run the script
main()
