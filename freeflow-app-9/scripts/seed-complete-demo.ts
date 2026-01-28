/**
 * KAZI Complete Demo Data Seeding Script
 * ========================================
 * Creates a fully interconnected demo dataset for investor presentations.
 * All data correlates across the entire app with logical relationships.
 *
 * Business Story:
 * - Alex Thompson started freelancing 18 months ago
 * - Built from 0 to $125K revenue
 * - 12 clients, 5 completed projects, 3 active
 * - Strong pipeline with qualified leads
 *
 * User: alex@freeflow.io
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_EMAIL = 'alex@freeflow.io'

// ============================================================================
// HELPERS
// ============================================================================
const uuid = () => crypto.randomUUID()
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString()
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000).toISOString()
const daysFromNow = (d: number) => new Date(Date.now() + d * 86400000).toISOString()
// Date-only helpers (for DATE columns that don't accept timestamps)
const dateAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString().split('T')[0]
const dateFromNow = (d: number) => new Date(Date.now() + d * 86400000).toISOString().split('T')[0]

// Track results
const results: { table: string; status: 'success' | 'error'; message: string }[] = []

async function seed(table: string, data: unknown) {
  const records = Array.isArray(data) ? data : [data]
  try {
    const { error } = await supabase.from(table).upsert(records)
    if (error) {
      results.push({ table, status: 'error', message: error.message })
      return false
    }
    results.push({ table, status: 'success', message: `${records.length} records` })
    return true
  } catch (e) {
    results.push({ table, status: 'error', message: String(e) })
    return false
  }
}

async function deleteExisting(table: string, column: string = 'user_id') {
  try {
    await supabase.from(table).delete().eq(column, DEMO_USER_ID)
  } catch (e) {
    // Ignore errors - table might not exist
  }
}

// ============================================================================
// SHARED IDS - Generated once for consistency
// ============================================================================
const TEAM_ID = uuid()
const COMMUNITY_MEMBER_ID = uuid()

// Client IDs - stable for FK references
const CLIENT_IDS = {
  techventure: uuid(),
  greenleaf: uuid(),
  cloudsync: uuid(),
  urbanfitness: uuid(),
  stellar: uuid(),
  nordic: uuid(),
  datapulse: uuid(),
  bloom: uuid(),
  summit: uuid(),
  nexus: uuid(),
  artisan: uuid(),
  velocity: uuid(),
}

// Project IDs - linked to clients
const PROJECT_IDS = {
  cloudsync_mobile: uuid(),
  datapulse_dashboard: uuid(),
  urbanfitness_website: uuid(),
  techventure_portal: uuid(),
  greenleaf_ecommerce: uuid(),
  stellar_rebrand: uuid(),
  nordic_design: uuid(),
  bloom_lms: uuid(),
}

// Invoice IDs for references
const INVOICE_IDS = Array.from({ length: 25 }, () => uuid())

// Booking Type IDs
const BOOKING_TYPE_IDS = {
  consultation: uuid(),
  strategy: uuid(),
  review: uuid(),
  kickoff: uuid(),
}

// Escrow IDs
const ESCROW_IDS = {
  cloudsync: uuid(),
  datapulse: uuid(),
  urbanfitness: uuid(),
  completed_techventure: uuid(),
  completed_greenleaf: uuid(),
}

// Milestone IDs for escrow
const MILESTONE_IDS = {
  cloudsync_design: uuid(),
  cloudsync_dev: uuid(),
  cloudsync_testing: uuid(),
  cloudsync_launch: uuid(),
  datapulse_phase1: uuid(),
  datapulse_phase2: uuid(),
  datapulse_phase3: uuid(),
  urbanfitness_design: uuid(),
  urbanfitness_dev: uuid(),
}

// Gallery IDs
const GALLERY_ALBUM_IDS = {
  portfolio: uuid(),
  projects: uuid(),
  assets: uuid(),
  ai_generated: uuid(),
}

const GALLERY_IMAGE_IDS = Array.from({ length: 20 }, () => uuid())
const GALLERY_COLLECTION_IDS = { featured: uuid(), recent: uuid() }
const GALLERY_TAG_IDS = { design: uuid(), development: uuid(), branding: uuid(), ui: uuid(), mobile: uuid() }

// Portfolio ID
const PORTFOLIO_ID = uuid()

// Storage IDs
const STORAGE_FOLDER_IDS = {
  root: uuid(),
  projects: uuid(),
  contracts: uuid(),
  invoices: uuid(),
  assets: uuid(),
}

const STORAGE_FILE_IDS = Array.from({ length: 15 }, () => uuid())

// Contract IDs
const CONTRACT_IDS = {
  cloudsync: uuid(),
  datapulse: uuid(),
  urbanfitness: uuid(),
  template_standard: uuid(),
  template_enterprise: uuid(),
}

// Proposal IDs
const PROPOSAL_IDS = {
  nexus: uuid(),
  summit: uuid(),
  artisan: uuid(),
}

// ============================================================================
// CLIENT DATA - The foundation of all relationships
// ============================================================================
const CLIENTS = [
  {
    id: CLIENT_IDS.techventure,
    name: 'TechVenture Capital',
    industry: 'Finance',
    email: 'sarah@techventure.io',
    contact: 'Sarah Mitchell',
    phone: '+1 (555) 100-1001',
    status: 'active',
    totalRevenue: 75000,
    projectsCount: 1,
    signedDate: daysAgo(420), // 14 months ago
  },
  {
    id: CLIENT_IDS.greenleaf,
    name: 'GreenLeaf Organics',
    industry: 'E-commerce',
    email: 'marcus@greenleaf.co',
    contact: 'Marcus Johnson',
    phone: '+1 (555) 100-1002',
    status: 'active',
    totalRevenue: 52000,
    projectsCount: 1,
    signedDate: daysAgo(390), // 13 months ago
  },
  {
    id: CLIENT_IDS.cloudsync,
    name: 'CloudSync Solutions',
    industry: 'SaaS',
    email: 'jennifer@cloudsync.io',
    contact: 'Jennifer Wu',
    phone: '+1 (555) 100-1003',
    status: 'active',
    totalRevenue: 45000,
    projectsCount: 1,
    signedDate: daysAgo(120), // 4 months ago - active project
  },
  {
    id: CLIENT_IDS.urbanfitness,
    name: 'Urban Fitness Studio',
    industry: 'Health',
    email: 'david@urbanfitness.com',
    contact: 'David Park',
    phone: '+1 (555) 100-1004',
    status: 'active',
    totalRevenue: 18000,
    projectsCount: 1,
    signedDate: daysAgo(90), // 3 months ago - active project
  },
  {
    id: CLIENT_IDS.stellar,
    name: 'Stellar Marketing',
    industry: 'Marketing',
    email: 'amanda@stellar.co',
    contact: 'Amanda Torres',
    phone: '+1 (555) 100-1005',
    status: 'active',
    totalRevenue: 28000,
    projectsCount: 1,
    signedDate: daysAgo(300),
  },
  {
    id: CLIENT_IDS.nordic,
    name: 'Nordic Design Co',
    industry: 'Design',
    email: 'erik@nordicdesign.io',
    contact: 'Erik Lindqvist',
    phone: '+1 (555) 100-1006',
    status: 'active',
    totalRevenue: 35000,
    projectsCount: 1,
    signedDate: daysAgo(270),
  },
  {
    id: CLIENT_IDS.datapulse,
    name: 'DataPulse Analytics',
    industry: 'Technology',
    email: 'rachel@datapulse.ai',
    contact: 'Rachel Chen',
    phone: '+1 (555) 100-1007',
    status: 'active',
    totalRevenue: 32000,
    projectsCount: 1,
    signedDate: daysAgo(75), // Active project
  },
  {
    id: CLIENT_IDS.bloom,
    name: 'Bloom Education',
    industry: 'EdTech',
    email: 'michael@bloomedu.org',
    contact: 'Michael Brown',
    phone: '+1 (555) 100-1008',
    status: 'active',
    totalRevenue: 68000,
    projectsCount: 1,
    signedDate: daysAgo(240),
  },
  {
    id: CLIENT_IDS.summit,
    name: 'Summit Real Estate',
    industry: 'Real Estate',
    email: 'lisa@summitrealty.com',
    contact: 'Lisa Anderson',
    phone: '+1 (555) 100-1009',
    status: 'prospect',
    totalRevenue: 0,
    projectsCount: 0,
    signedDate: daysAgo(14), // Recent lead
  },
  {
    id: CLIENT_IDS.nexus,
    name: 'Nexus Innovations',
    industry: 'Technology',
    email: 'james@nexusinnovations.io',
    contact: 'James Wilson',
    phone: '+1 (555) 100-1010',
    status: 'prospect',
    totalRevenue: 0,
    projectsCount: 0,
    signedDate: daysAgo(7), // Very recent lead
  },
  {
    id: CLIENT_IDS.artisan,
    name: 'Artisan Coffee',
    industry: 'F&B',
    email: 'sophie@artisancoffee.co',
    contact: 'Sophie Martin',
    phone: '+1 (555) 100-1011',
    status: 'prospect',
    totalRevenue: 0,
    projectsCount: 0,
    signedDate: daysAgo(21),
  },
  {
    id: CLIENT_IDS.velocity,
    name: 'Velocity Logistics',
    industry: 'Logistics',
    email: 'robert@velocitylogistics.com',
    contact: 'Robert Kim',
    phone: '+1 (555) 100-1012',
    status: 'inactive',
    totalRevenue: 15000,
    projectsCount: 1,
    signedDate: daysAgo(480), // Old client, project completed
  },
]

// ============================================================================
// PROJECT DATA - Linked to clients with realistic details
// ============================================================================
const PROJECTS = [
  // ACTIVE PROJECTS (3)
  {
    id: PROJECT_IDS.cloudsync_mobile,
    clientId: CLIENT_IDS.cloudsync,
    title: 'CloudSync Mobile App',
    description: 'Native mobile application for iOS and Android with real-time sync capabilities, offline mode, and push notifications.',
    status: 'active',
    priority: 'high',
    budget: 45000,
    spent: 27000,
    progress: 60,
    startDate: daysAgo(90),
    endDate: daysFromNow(30),
  },
  {
    id: PROJECT_IDS.datapulse_dashboard,
    clientId: CLIENT_IDS.datapulse,
    title: 'DataPulse Analytics Dashboard',
    description: 'Real-time analytics dashboard with customizable widgets, data visualization, and automated reporting.',
    status: 'active',
    priority: 'high',
    budget: 32000,
    spent: 16000,
    progress: 50,
    startDate: daysAgo(60),
    endDate: daysFromNow(45),
  },
  {
    id: PROJECT_IDS.urbanfitness_website,
    clientId: CLIENT_IDS.urbanfitness,
    title: 'Urban Fitness Website Redesign',
    description: 'Modern responsive website with class booking system, member portal, and payment integration.',
    status: 'active',
    priority: 'medium',
    budget: 18000,
    spent: 5400,
    progress: 30,
    startDate: daysAgo(45),
    endDate: daysFromNow(60),
  },
  // COMPLETED PROJECTS (5)
  {
    id: PROJECT_IDS.techventure_portal,
    clientId: CLIENT_IDS.techventure,
    title: 'TechVenture Investor Portal',
    description: 'Secure investor portal with portfolio tracking, document management, and real-time valuations.',
    status: 'completed',
    priority: 'high',
    budget: 75000,
    spent: 75000,
    progress: 100,
    startDate: daysAgo(420),
    endDate: daysAgo(300),
  },
  {
    id: PROJECT_IDS.greenleaf_ecommerce,
    clientId: CLIENT_IDS.greenleaf,
    title: 'GreenLeaf E-commerce Platform',
    description: 'Full e-commerce solution with subscription management, inventory sync, and wholesale ordering.',
    status: 'completed',
    priority: 'high',
    budget: 52000,
    spent: 52000,
    progress: 100,
    startDate: daysAgo(390),
    endDate: daysAgo(270),
  },
  {
    id: PROJECT_IDS.stellar_rebrand,
    clientId: CLIENT_IDS.stellar,
    title: 'Stellar Marketing Rebrand',
    description: 'Complete brand identity refresh including logo, website, and marketing collateral design.',
    status: 'completed',
    priority: 'medium',
    budget: 28000,
    spent: 28000,
    progress: 100,
    startDate: daysAgo(300),
    endDate: daysAgo(210),
  },
  {
    id: PROJECT_IDS.nordic_design,
    clientId: CLIENT_IDS.nordic,
    title: 'Nordic Design System',
    description: 'Comprehensive design system with component library, documentation, and Figma templates.',
    status: 'completed',
    priority: 'medium',
    budget: 35000,
    spent: 35000,
    progress: 100,
    startDate: daysAgo(270),
    endDate: daysAgo(180),
  },
  {
    id: PROJECT_IDS.bloom_lms,
    clientId: CLIENT_IDS.bloom,
    title: 'Bloom Learning Management System',
    description: 'Custom LMS with course builder, student tracking, certifications, and video hosting.',
    status: 'completed',
    priority: 'high',
    budget: 68000,
    spent: 68000,
    progress: 100,
    startDate: daysAgo(240),
    endDate: daysAgo(120),
  },
]

// Calculate totals for consistency
const TOTAL_REVENUE = CLIENTS.reduce((sum, c) => sum + c.totalRevenue, 0) // 368,000
const ACTIVE_PROJECTS = PROJECTS.filter(p => p.status === 'active').length // 3
const COMPLETED_PROJECTS = PROJECTS.filter(p => p.status === 'completed').length // 5
const TOTAL_CLIENTS = CLIENTS.filter(c => c.status === 'active' || c.totalRevenue > 0).length // 9

// ============================================================================
// SEEDING FUNCTIONS
// ============================================================================

async function seedClients() {
  console.log('\n👥 Clients...')
  await deleteExisting('clients')

  await seed('clients', CLIENTS.map(c => ({
    id: c.id,
    user_id: DEMO_USER_ID,
    name: c.name,
    email: c.email,
    phone: c.phone,
    company: c.name,
    status: c.status,
    industry: c.industry,
    total_revenue: c.totalRevenue,
    projects_count: c.projectsCount,
    tags: [c.industry.toLowerCase()],
    created_at: c.signedDate,
    updated_at: daysAgo(Math.floor(Math.random() * 7))
  })))
}

async function seedProjects() {
  console.log('\n📁 Projects...')
  await deleteExisting('projects')

  await seed('projects', PROJECTS.map(p => ({
    id: p.id,
    user_id: DEMO_USER_ID,
    client_id: p.clientId,
    title: p.title,
    description: p.description,
    status: p.status,
    priority: p.priority,
    budget: p.budget,
    spent: p.spent,
    progress: p.progress,
    start_date: p.startDate.split('T')[0],
    end_date: p.endDate.split('T')[0],
    created_at: p.startDate,
    updated_at: daysAgo(Math.floor(Math.random() * 3))
  })))
}

async function seedTasks() {
  console.log('\n✅ Tasks...')
  await deleteExisting('tasks')

  // Tasks for each active project
  const tasks = [
    // CloudSync Mobile App tasks
    { projectId: PROJECT_IDS.cloudsync_mobile, title: 'UI/UX Design Review', status: 'completed', priority: 'high', daysAgo: 80 },
    { projectId: PROJECT_IDS.cloudsync_mobile, title: 'Setup React Native project', status: 'completed', priority: 'high', daysAgo: 75 },
    { projectId: PROJECT_IDS.cloudsync_mobile, title: 'Implement authentication flow', status: 'completed', priority: 'high', daysAgo: 60 },
    { projectId: PROJECT_IDS.cloudsync_mobile, title: 'Build sync engine', status: 'completed', priority: 'high', daysAgo: 45 },
    { projectId: PROJECT_IDS.cloudsync_mobile, title: 'Offline mode implementation', status: 'in_progress', priority: 'high', daysAgo: 20 },
    { projectId: PROJECT_IDS.cloudsync_mobile, title: 'Push notification system', status: 'in_progress', priority: 'medium', daysAgo: 10 },
    { projectId: PROJECT_IDS.cloudsync_mobile, title: 'Beta testing', status: 'todo', priority: 'high', daysAgo: 5 },
    { projectId: PROJECT_IDS.cloudsync_mobile, title: 'App store submission', status: 'todo', priority: 'urgent', daysAgo: 2 },

    // DataPulse Dashboard tasks
    { projectId: PROJECT_IDS.datapulse_dashboard, title: 'Dashboard wireframes', status: 'completed', priority: 'high', daysAgo: 55 },
    { projectId: PROJECT_IDS.datapulse_dashboard, title: 'Data API integration', status: 'completed', priority: 'high', daysAgo: 45 },
    { projectId: PROJECT_IDS.datapulse_dashboard, title: 'Chart components', status: 'in_progress', priority: 'high', daysAgo: 30 },
    { projectId: PROJECT_IDS.datapulse_dashboard, title: 'Real-time updates', status: 'in_progress', priority: 'medium', daysAgo: 15 },
    { projectId: PROJECT_IDS.datapulse_dashboard, title: 'Export functionality', status: 'todo', priority: 'medium', daysAgo: 7 },
    { projectId: PROJECT_IDS.datapulse_dashboard, title: 'User preferences', status: 'todo', priority: 'low', daysAgo: 3 },

    // Urban Fitness Website tasks
    { projectId: PROJECT_IDS.urbanfitness_website, title: 'Sitemap and wireframes', status: 'completed', priority: 'high', daysAgo: 40 },
    { projectId: PROJECT_IDS.urbanfitness_website, title: 'Homepage design', status: 'completed', priority: 'high', daysAgo: 30 },
    { projectId: PROJECT_IDS.urbanfitness_website, title: 'Class booking system', status: 'in_progress', priority: 'high', daysAgo: 20 },
    { projectId: PROJECT_IDS.urbanfitness_website, title: 'Member portal', status: 'todo', priority: 'high', daysAgo: 10 },
    { projectId: PROJECT_IDS.urbanfitness_website, title: 'Payment integration', status: 'todo', priority: 'high', daysAgo: 5 },
    { projectId: PROJECT_IDS.urbanfitness_website, title: 'Mobile optimization', status: 'todo', priority: 'medium', daysAgo: 2 },
  ]

  await seed('tasks', tasks.map((t, i) => ({
    id: uuid(),
    user_id: DEMO_USER_ID,
    project_id: t.projectId,
    title: t.title,
    description: `Task: ${t.title}`,
    status: t.status,
    priority: t.priority,
    due_date: t.status === 'todo' ? daysFromNow(t.daysAgo * 2) : null,
    completed_at: t.status === 'completed' ? daysAgo(t.daysAgo - 5) : null,
    created_at: daysAgo(t.daysAgo),
    updated_at: daysAgo(Math.min(t.daysAgo, 1))
  })))
}

async function seedInvoices() {
  console.log('\n💰 Invoices...')
  await deleteExisting('invoices')

  const invoices: any[] = []
  let invoiceNum = 1

  // Create invoices for completed projects (fully paid)
  PROJECTS.filter(p => p.status === 'completed').forEach(project => {
    const client = CLIENTS.find(c => c.id === project.clientId)!

    // Split into 2-3 invoices per project
    const invoiceCount = project.budget > 50000 ? 3 : 2
    const amounts = invoiceCount === 3
      ? [project.budget * 0.3, project.budget * 0.4, project.budget * 0.3]
      : [project.budget * 0.5, project.budget * 0.5]

    amounts.forEach((amount, idx) => {
      invoices.push({
        id: INVOICE_IDS[invoiceNum - 1],
        user_id: DEMO_USER_ID,
        invoice_number: `INV-2025-${String(invoiceNum).padStart(3, '0')}`,
        client_name: client.name,
        client_email: client.email,
        total: amount,
        subtotal: amount,
        currency: 'USD',
        status: 'paid',
        due_date: dateAgo(180 - invoiceNum * 10),
        created_at: daysAgo(190 - invoiceNum * 10),
        updated_at: daysAgo(180 - invoiceNum * 10)
      })
      invoiceNum++
    })
  })

  // Create invoices for active projects (mix of paid, sent, draft)
  PROJECTS.filter(p => p.status === 'active').forEach(project => {
    const client = CLIENTS.find(c => c.id === project.clientId)!

    // First invoice - paid (deposit)
    invoices.push({
      id: INVOICE_IDS[invoiceNum - 1],
      user_id: DEMO_USER_ID,
      invoice_number: `INV-2026-${String(invoiceNum).padStart(3, '0')}`,
      client_name: client.name,
      client_email: client.email,
      total: project.budget * 0.3,
      subtotal: project.budget * 0.3,
      currency: 'USD',
      status: 'paid',
      due_date: dateAgo(60),
      created_at: daysAgo(70),
      updated_at: daysAgo(55)
    })
    invoiceNum++

    // Second invoice - sent (progress payment)
    invoices.push({
      id: INVOICE_IDS[invoiceNum - 1],
      user_id: DEMO_USER_ID,
      invoice_number: `INV-2026-${String(invoiceNum).padStart(3, '0')}`,
      client_name: client.name,
      client_email: client.email,
      total: project.budget * 0.3,
      subtotal: project.budget * 0.3,
      currency: 'USD',
      status: 'sent',
      due_date: dateFromNow(15),
      created_at: daysAgo(5),
      updated_at: daysAgo(5)
    })
    invoiceNum++
  })

  await seed('invoices', invoices)
}

async function seedTimeEntries() {
  console.log('\n⏱️ Time Entries...')
  await deleteExisting('time_entries')

  const entries: any[] = []

  // Generate realistic time entries for the past 90 days
  for (let day = 0; day < 90; day++) {
    // Skip some weekends
    const date = new Date(Date.now() - day * 86400000)
    if (date.getDay() === 0 || (date.getDay() === 6 && Math.random() > 0.3)) continue

    // 2-4 entries per working day
    const entriesPerDay = 2 + Math.floor(Math.random() * 3)

    for (let e = 0; e < entriesPerDay; e++) {
      const availableProjects = PROJECTS.filter(p => p.status === 'active' || day > 30)
      const project = availableProjects[Math.floor(Math.random() * availableProjects.length)]
      const client = CLIENTS.find(c => c.id === project.clientId)!

      const duration = (1 + Math.floor(Math.random() * 4)) * 3600 // 1-4 hours in seconds
      const descriptions = [
        'Development work',
        'Code review and testing',
        'Client meeting',
        'Design implementation',
        'Bug fixes',
        'API integration',
        'Documentation',
        'Planning session'
      ]

      entries.push({
        id: uuid(),
        user_id: DEMO_USER_ID,
        project_id: project.id,
        project_name: `${client.name} - ${project.title}`,
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        start_time: daysAgo(day),
        end_time: hoursAgo(day * 24 - duration / 3600),
        duration: duration,
        billable: true,
        created_at: daysAgo(day),
        updated_at: daysAgo(day)
      })
    }
  }

  await seed('time_entries', entries.slice(0, 200)) // Limit to 200 entries
}

async function seedExpenses() {
  console.log('\n💳 Expenses...')
  await deleteExisting('expenses')

  const expenses = [
    // Software subscriptions
    { desc: 'Adobe Creative Cloud - Annual', amount: 599.88, category: 'software', days: 365 },
    { desc: 'Figma Professional - Monthly', amount: 15, category: 'software', days: 30 },
    { desc: 'Figma Professional - Monthly', amount: 15, category: 'software', days: 60 },
    { desc: 'Figma Professional - Monthly', amount: 15, category: 'software', days: 90 },
    { desc: 'GitHub Team - Monthly', amount: 44, category: 'software', days: 30 },
    { desc: 'Vercel Pro - Monthly', amount: 20, category: 'software', days: 30 },
    { desc: 'AWS Services - Monthly', amount: 245.50, category: 'software', days: 30 },
    { desc: 'AWS Services - Monthly', amount: 312.80, category: 'software', days: 60 },
    { desc: 'Slack Business+ - Monthly', amount: 15, category: 'software', days: 30 },

    // Equipment
    { desc: 'MacBook Pro M3 Max', amount: 3499, category: 'equipment', days: 180 },
    { desc: 'Studio Display 27"', amount: 1599, category: 'equipment', days: 180 },
    { desc: 'Logitech MX Master 3', amount: 99, category: 'equipment', days: 120 },

    // Office
    { desc: 'WeWork Hot Desk - Monthly', amount: 350, category: 'office', days: 30 },
    { desc: 'WeWork Hot Desk - Monthly', amount: 350, category: 'office', days: 60 },

    // Client entertainment
    { desc: 'Client Lunch - TechVenture', amount: 125.40, category: 'meals', days: 45 },
    { desc: 'Client Dinner - CloudSync', amount: 189.00, category: 'meals', days: 20 },

    // Professional development
    { desc: 'React Conf 2025 Ticket', amount: 799, category: 'training', days: 90 },
    { desc: 'Design Systems Course', amount: 299, category: 'training', days: 120 },

    // Travel
    { desc: 'Flight to TechVenture HQ', amount: 458, category: 'travel', days: 60 },
    { desc: 'Hotel - TechVenture Visit', amount: 312, category: 'travel', days: 60 },
  ]

  await seed('expenses', expenses.map((e, i) => ({
    id: uuid(),
    user_id: DEMO_USER_ID,
    description: e.desc,
    amount: e.amount,
    category: e.category,
    currency: 'USD',
    date: daysAgo(e.days).split('T')[0],
    is_reimbursable: ['travel', 'meals'].includes(e.category),
    is_reimbursed: false,
    created_at: daysAgo(e.days),
    updated_at: daysAgo(e.days)
  })))
}

async function seedCalendarEvents() {
  console.log('\n📅 Calendar Events...')
  await deleteExisting('calendar_events')

  const events = [
    // Past events
    { title: 'TechVenture - Project Kickoff', client: 'TechVenture Capital', hoursAgo: 168 * 2 },
    { title: 'CloudSync - Requirements Review', client: 'CloudSync Solutions', hoursAgo: 168 },
    { title: 'DataPulse - Sprint Planning', client: 'DataPulse Analytics', hoursAgo: 72 },
    { title: 'Urban Fitness - Design Review', client: 'Urban Fitness Studio', hoursAgo: 48 },
    { title: 'Team Weekly Sync', client: null, hoursAgo: 24 },

    // Today/upcoming
    { title: 'CloudSync - Progress Update', client: 'CloudSync Solutions', hoursAgo: -2 },
    { title: 'DataPulse - Demo Presentation', client: 'DataPulse Analytics', hoursAgo: -26 },
    { title: 'Urban Fitness - Milestone Review', client: 'Urban Fitness Studio', hoursAgo: -50 },
    { title: 'Nexus Innovations - Discovery Call', client: 'Nexus Innovations', hoursAgo: -74 },
    { title: 'Summit Real Estate - Proposal Review', client: 'Summit Real Estate', hoursAgo: -120 },
    { title: 'Weekly Planning Session', client: null, hoursAgo: -168 },
  ]

  await seed('calendar_events', events.map((e, i) => ({
    id: uuid(),
    user_id: DEMO_USER_ID,
    title: e.title,
    description: e.client ? `Meeting with ${e.client}` : 'Internal meeting',
    start_time: hoursAgo(e.hoursAgo),
    end_time: hoursAgo(e.hoursAgo - 1),
    created_at: daysAgo(30),
    updated_at: daysAgo(1)
  })))
}

async function seedBookings() {
  console.log('\n📆 Bookings...')
  await deleteExisting('bookings')
  await deleteExisting('booking_types')

  // Booking types
  await seed('booking_types', [
    { id: BOOKING_TYPE_IDS.consultation, name: 'Free Consultation', slug: 'consultation', duration: 30 },
    { id: BOOKING_TYPE_IDS.strategy, name: 'Strategy Session', slug: 'strategy-session', duration: 60 },
    { id: BOOKING_TYPE_IDS.review, name: 'Project Review', slug: 'project-review', duration: 45 },
    { id: BOOKING_TYPE_IDS.kickoff, name: 'Project Kickoff', slug: 'kickoff-meeting', duration: 90 },
  ].map(bt => ({
    id: bt.id,
    user_id: DEMO_USER_ID,
    name: bt.name,
    slug: bt.slug,
    description: `${bt.name} - ${bt.duration} minutes`,
    duration_minutes: bt.duration,
    is_active: true,
    is_public: true,
    created_at: daysAgo(365),
    updated_at: daysAgo(1)
  })))

  // Upcoming bookings with leads
  const bookings = [
    { typeId: BOOKING_TYPE_IDS.consultation, client: CLIENTS.find(c => c.id === CLIENT_IDS.nexus)!, hoursFromNow: 24, status: 'confirmed' },
    { typeId: BOOKING_TYPE_IDS.strategy, client: CLIENTS.find(c => c.id === CLIENT_IDS.summit)!, hoursFromNow: 72, status: 'confirmed' },
    { typeId: BOOKING_TYPE_IDS.consultation, client: CLIENTS.find(c => c.id === CLIENT_IDS.artisan)!, hoursFromNow: 120, status: 'pending' },
    { typeId: BOOKING_TYPE_IDS.review, client: CLIENTS.find(c => c.id === CLIENT_IDS.cloudsync)!, hoursFromNow: 48, status: 'confirmed' },
    { typeId: BOOKING_TYPE_IDS.review, client: CLIENTS.find(c => c.id === CLIENT_IDS.datapulse)!, hoursFromNow: 96, status: 'confirmed' },
  ]

  await seed('bookings', bookings.map((b, i) => {
    const bt = [30, 60, 45, 90][[BOOKING_TYPE_IDS.consultation, BOOKING_TYPE_IDS.strategy, BOOKING_TYPE_IDS.review, BOOKING_TYPE_IDS.kickoff].indexOf(b.typeId)]
    return {
      id: uuid(),
      user_id: DEMO_USER_ID,
      booking_type_id: b.typeId,
      client_name: b.client.contact,
      client_email: b.client.email,
      start_time: hoursAgo(-b.hoursFromNow),
      end_time: hoursAgo(-b.hoursFromNow - (bt / 60)),
      status: b.status,
      notes: `Meeting with ${b.client.name}`,
      created_at: daysAgo(7 - i),
      updated_at: daysAgo(1)
    }
  }))
}

async function seedNotifications() {
  console.log('\n🔔 Notifications...')
  await deleteExisting('notifications')

  const notifications = [
    { title: 'Payment Received', message: '$22,500 from TechVenture Capital', type: 'payment', priority: 'high', read: false, hours: 2 },
    { title: 'New Lead', message: 'James Wilson from Nexus Innovations submitted an inquiry', type: 'lead', priority: 'high', read: false, hours: 8 },
    { title: 'Project Update', message: 'CloudSync Mobile App: Offline mode implementation in progress', type: 'project', priority: 'normal', read: false, hours: 12 },
    { title: 'Booking Confirmed', message: 'Strategy session with Summit Real Estate in 3 days', type: 'reminder', priority: 'normal', read: false, hours: 24 },
    { title: 'Invoice Sent', message: 'INV-2026-019 sent to DataPulse Analytics ($9,600)', type: 'invoice', priority: 'normal', read: true, hours: 48 },
    { title: 'Task Completed', message: 'Build sync engine - CloudSync Mobile App', type: 'task', priority: 'normal', read: true, hours: 72 },
    { title: 'New Review', message: '5-star review from Jennifer Wu (CloudSync)', type: 'review', priority: 'normal', read: true, hours: 120 },
    { title: 'Weekly Report Ready', message: 'Your weekly analytics report is available', type: 'report', priority: 'low', read: true, hours: 168 },
  ]

  await seed('notifications', notifications.map((n, i) => ({
    id: uuid(),
    user_id: DEMO_USER_ID,
    title: n.title,
    message: n.message,
    type: n.type,
    priority: n.priority,
    is_read: n.read,
    created_at: hoursAgo(n.hours),
    updated_at: hoursAgo(n.hours)
  })))
}

async function seedLeads() {
  console.log('\n🎯 Leads...')
  await deleteExisting('lead_gen_leads')

  const leads = [
    // Converted leads (now clients)
    { firstName: 'Sarah', lastName: 'Mitchell', company: 'TechVenture Capital', status: 'converted', score: 98, source: 'referral', days: 450 },
    { firstName: 'Marcus', lastName: 'Johnson', company: 'GreenLeaf Organics', status: 'converted', score: 95, source: 'website', days: 420 },
    { firstName: 'Jennifer', lastName: 'Wu', company: 'CloudSync Solutions', status: 'converted', score: 92, source: 'referral', days: 150 },

    // Qualified leads (hot prospects)
    { firstName: 'James', lastName: 'Wilson', company: 'Nexus Innovations', status: 'qualified', score: 88, source: 'website', days: 7 },
    { firstName: 'Lisa', lastName: 'Anderson', company: 'Summit Real Estate', status: 'qualified', score: 85, source: 'social-media', days: 14 },

    // Contacted leads
    { firstName: 'Sophie', lastName: 'Martin', company: 'Artisan Coffee', status: 'contacted', score: 72, source: 'email', days: 21 },
    { firstName: 'Daniel', lastName: 'Martinez', company: 'Blue Ocean Media', status: 'contacted', score: 68, source: 'referral', days: 28 },

    // New leads
    { firstName: 'Thomas', lastName: 'Wright', company: 'Horizon Tech', status: 'new', score: 55, source: 'website', days: 3 },
    { firstName: 'Emily', lastName: 'Chen', company: 'Spark Ventures', status: 'new', score: 48, source: 'social-media', days: 2 },
    { firstName: 'Ryan', lastName: 'OBrien', company: 'Celtic Innovations', status: 'new', score: 42, source: 'website', days: 1 },
  ]

  await seed('lead_gen_leads', leads.map(l => ({
    id: uuid(),
    user_id: DEMO_USER_ID,
    first_name: l.firstName,
    last_name: l.lastName,
    email: `${l.firstName.toLowerCase()}@${l.company.toLowerCase().replace(/\s+/g, '')}.com`,
    company: l.company,
    status: l.status,
    score: l.score,
    score_label: l.score >= 80 ? 'hot' : l.score >= 60 ? 'warm' : 'cold',
    source: l.source,
    tags: [l.score >= 80 ? 'priority' : 'nurture'],
    created_at: daysAgo(l.days),
    updated_at: daysAgo(Math.min(l.days, 1))
  })))
}

async function seedTeamMembers() {
  console.log('\n👥 Team...')
  await deleteExisting('team_members')
  await supabase.from('teams').delete().eq('owner_id', DEMO_USER_ID)

  await seed('teams', {
    id: TEAM_ID,
    owner_id: DEMO_USER_ID,
    name: 'FreeFlow Studio',
    description: 'Boutique design and development studio specializing in SaaS and enterprise solutions.',
    industry: 'Technology',
    size: '1-10',
    max_members: 10,
    is_active: true,
    created_at: daysAgo(540), // Started 18 months ago
    updated_at: daysAgo(1)
  })

  await seed('team_members', {
    id: uuid(),
    team_id: TEAM_ID,
    user_id: DEMO_USER_ID,
    role: 'owner',
    title: 'Founder & Lead Developer',
    department: 'Leadership',
    is_active: true,
    joined_at: daysAgo(540),
    last_active_at: hoursAgo(1),
    created_at: daysAgo(540),
    updated_at: daysAgo(1)
  })
}

async function seedWorkflows() {
  console.log('\n⚡ Workflows...')
  await deleteExisting('workflow_templates')

  const workflows = [
    { name: 'New Client Onboarding', trigger: 'client_created', category: 'onboarding', runs: 12 },
    { name: 'Invoice Overdue Reminder', trigger: 'invoice_overdue', category: 'billing', runs: 8 },
    { name: 'Project Milestone Completed', trigger: 'milestone_completed', category: 'projects', runs: 24 },
    { name: 'Weekly Progress Report', trigger: 'schedule', category: 'reports', runs: 78 },
    { name: 'Lead Follow-up Sequence', trigger: 'lead_created', category: 'sales', runs: 45 },
    { name: 'Client Review Request', trigger: 'project_completed', category: 'feedback', runs: 8 },
  ]

  await seed('workflow_templates', workflows.map((w, i) => ({
    id: uuid(),
    user_id: DEMO_USER_ID,
    name: w.name,
    description: `Automated ${w.name.toLowerCase()} workflow`,
    category: w.category,
    trigger_type: w.trigger,
    trigger_config: {},
    actions: [],
    is_active: true,
    run_count: w.runs,
    last_run_at: daysAgo(Math.floor(Math.random() * 7)),
    tags: [w.category],
    created_at: daysAgo(400),
    updated_at: daysAgo(i)
  })))
}

async function seedCommunityPosts() {
  console.log('\n🌐 Community...')
  await supabase.from('community_posts').delete().eq('author_id', COMMUNITY_MEMBER_ID)
  await deleteExisting('community_members')

  await seed('community_members', {
    id: COMMUNITY_MEMBER_ID,
    user_id: DEMO_USER_ID,
    name: 'Alex Thompson',
    title: 'Full-Stack Developer & Designer',
    location: 'San Francisco, CA',
    bio: 'Building beautiful products for amazing clients. 8+ years in web development. React, Node.js, TypeScript enthusiast.',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'UI/UX Design', 'System Architecture'],
    rating: 4.9,
    is_online: true,
    total_projects: COMPLETED_PROJECTS + ACTIVE_PROJECTS,
    total_earnings: TOTAL_REVENUE,
    completion_rate: 98,
    response_time: '< 2 hours',
    languages: ['English', 'Spanish'],
    is_premium: true,
    is_verified: true,
    followers: 1250,
    following: 340,
    posts_count: 24,
    created_at: daysAgo(540),
    updated_at: daysAgo(1)
  })

  await seed('community_posts', [
    { content: 'Just shipped the TechVenture Investor Portal! 🚀 6 months of work and incredibly proud of what we built. The team at TechVenture has been amazing to work with. #ProductLaunch #React #TypeScript', type: 'showcase', likes: 256 },
    { content: 'How I went from $0 to $125K in 18 months of freelancing - a thread 🧵\n\n1. Started with one client referral\n2. Focused on quality over quantity\n3. Built strong relationships\n4. Invested in tools and learning\n5. Never stopped networking', type: 'text', likes: 892 },
    { content: 'Looking for a Senior React developer to collaborate on a SaaS project. Must have experience with real-time features and data visualization. Remote OK, US timezone preferred.', type: 'job', likes: 45 },
    { content: 'Just crossed $100K in total revenue! 🎉 Grateful for every client who trusted me with their vision. Here\'s to the next milestone! #FreelanceLife #Milestone', type: 'text', likes: 523 },
  ].map((p, i) => ({
    id: uuid(),
    author_id: COMMUNITY_MEMBER_ID,
    content: p.content,
    type: p.type,
    visibility: 'public',
    likes_count: p.likes,
    comments_count: Math.floor(p.likes / 8),
    shares_count: Math.floor(p.likes / 15),
    views_count: p.likes * 12,
    is_pinned: i === 1, // Pin the growth story
    created_at: daysAgo([300, 180, 90, 60][i]),
    updated_at: daysAgo([280, 170, 85, 55][i])
  })))
}

async function seedAnnouncements() {
  console.log('\n📢 Announcements...')
  await deleteExisting('announcements')

  await seed('announcements', [
    { title: 'New AI-Powered Project Insights', priority: 'high', status: 'published', days: 7 },
    { title: 'Scheduled Maintenance - Feb 15, 2am-4am PST', priority: 'normal', status: 'scheduled', days: 14 },
    { title: 'Referral Program: Earn $500 per referral', priority: 'high', status: 'published', days: 30 },
    { title: 'New Integration: Connect with Slack', priority: 'normal', status: 'published', days: 45 },
  ].map((a, i) => ({
    id: uuid(),
    user_id: DEMO_USER_ID,
    author_id: DEMO_USER_ID,
    title: a.title,
    content: `${a.title}. Check out the documentation for more details.`,
    status: a.status,
    priority: a.priority,
    created_at: daysAgo(a.days),
    updated_at: daysAgo(a.days - 2)
  })))
}

async function seedCompliance() {
  console.log('\n🔒 Compliance...')
  await deleteExisting('compliance')

  await seed('compliance', [
    { name: 'GDPR Data Protection', framework: 'GDPR', status: 'compliant', score: 98 },
    { name: 'SOC 2 Type II', framework: 'SOC2', status: 'compliant', score: 96 },
    { name: 'ISO 27001 Certification', framework: 'ISO', status: 'in_progress', score: 82 },
    { name: 'CCPA Compliance', framework: 'CCPA', status: 'compliant', score: 94 },
    { name: 'HIPAA (Healthcare)', framework: 'HIPAA', status: 'pending', score: 0 },
  ].map((c, i) => ({
    id: uuid(),
    user_id: DEMO_USER_ID,
    compliance_name: c.name,
    description: `${c.name} requirements and controls`,
    compliance_type: 'regulatory',
    framework: c.framework,
    status: c.status,
    compliance_status: c.status,
    is_compliant: c.status === 'compliant',
    compliance_score: c.score,
    compliance_percentage: c.score,
    last_audit_date: c.score > 0 ? daysAgo(45 + i * 30) : null,
    next_audit_date: c.score > 0 ? daysFromNow(180 - i * 30) : null,
    priority: c.score === 0 ? 'low' : c.score < 90 ? 'high' : 'medium',
    category: 'security',
    tags: [c.framework.toLowerCase()],
    created_at: daysAgo(365),
    updated_at: daysAgo(i * 10)
  })))
}

async function seedAIConversations() {
  console.log('\n🤖 AI Conversations...')
  await deleteExisting('ai_conversations')

  await seed('ai_conversations', [
    { title: 'Project Timeline Planning - CloudSync', preview: 'Help me plan the timeline for the CloudSync mobile app...', days: 7 },
    { title: 'Proposal Generator - Nexus Innovations', preview: 'Generate a proposal for a web application...', days: 14 },
    { title: 'Budget Estimation - E-commerce Platform', preview: 'What would be a reasonable budget for...', days: 30 },
    { title: 'Tech Stack Recommendation', preview: 'Recommend a tech stack for a real-time analytics...', days: 45 },
  ].map((c, i) => ({
    id: uuid(),
    user_id: DEMO_USER_ID,
    title: c.title,
    preview: c.preview,
    created_at: daysAgo(c.days),
    updated_at: daysAgo(c.days - 2)
  })))
}

async function seedNotificationSettings() {
  console.log('\n⚙️ Settings...')
  await deleteExisting('notification_settings')

  await seed('notification_settings', {
    id: uuid(),
    user_id: DEMO_USER_ID,
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    in_app_notifications: true,
    project_updates: true,
    client_messages: true,
    team_mentions: true,
    task_assignments: true,
    deadline_reminders: true,
    payment_alerts: true,
    invoice_reminders: true,
    payment_confirmations: true,
    marketing_emails: false,
    product_updates: true,
    weekly_digest: true,
    monthly_reports: true,
    digest_frequency: 'weekly',
    quiet_hours_enabled: true,
    created_at: daysAgo(540),
    updated_at: daysAgo(7)
  })
}

async function seedDashboardStats() {
  console.log('\n📊 Dashboard Stats...')
  await deleteExisting('dashboard_stats')

  // Calculate actual values from our data
  const activeProjects = PROJECTS.filter(p => p.status === 'active')
  const completedProjects = PROJECTS.filter(p => p.status === 'completed')
  const totalSpent = PROJECTS.reduce((sum, p) => sum + p.spent, 0)

  await seed('dashboard_stats', {
    id: uuid(),
    user_id: DEMO_USER_ID,
    earnings: TOTAL_REVENUE,
    earnings_trend: 23,
    active_projects: activeProjects.length,
    active_projects_trend: 50, // Up from 2 to 3
    completed_projects: completedProjects.length,
    completed_projects_trend: 25,
    total_clients: TOTAL_CLIENTS,
    total_clients_trend: 33,
    hours_this_month: 168,
    hours_this_month_trend: 12,
    revenue_this_month: 28500,
    revenue_this_month_trend: 18,
    average_project_value: Math.round(totalSpent / PROJECTS.length),
    average_project_value_trend: 15,
    client_satisfaction: 4.9,
    client_satisfaction_trend: 0.1,
    productivity_score: 94,
    productivity_score_trend: 3,
    pending_tasks: 8,
    overdue_tasks: 0,
    upcoming_meetings: 5,
    unread_messages: 4,
    last_updated: new Date().toISOString(),
    created_at: daysAgo(540)
  })
}

async function seedDashboardMetrics() {
  console.log('\n📈 Dashboard Metrics...')
  await deleteExisting('dashboard_metrics')

  const activeProjects = PROJECTS.filter(p => p.status === 'active')
  const pipelineValue = activeProjects.reduce((sum, p) => sum + (p.budget - p.spent), 0)

  await seed('dashboard_metrics', [
    { name: 'Total Revenue', value: TOTAL_REVENUE, unit: 'USD', category: 'financial', color: 'green', trend: 23 },
    { name: 'Active Projects', value: ACTIVE_PROJECTS, unit: 'count', category: 'projects', color: 'blue', trend: 50 },
    { name: 'Pipeline Value', value: pipelineValue, unit: 'USD', category: 'sales', color: 'purple', trend: 15 },
    { name: 'Billable Hours (MTD)', value: 168, unit: 'hours', category: 'time', color: 'orange', trend: 12 },
    { name: 'Client Satisfaction', value: 4.9, unit: 'rating', category: 'quality', color: 'yellow', trend: 2 },
    { name: 'Lead Conversion', value: 38, unit: '%', category: 'sales', color: 'teal', trend: 8 },
    { name: 'Avg Project Value', value: 42000, unit: 'USD', category: 'financial', color: 'indigo', trend: 15 },
    { name: 'On-time Delivery', value: 100, unit: '%', category: 'quality', color: 'green', trend: 5 },
  ].map((m, i) => ({
    id: uuid(),
    user_id: DEMO_USER_ID,
    name: m.name,
    value: m.value,
    previous_value: m.value * (1 - m.trend / 100),
    change: m.value * (m.trend / 100),
    change_percent: m.trend,
    trend: 'up',
    unit: m.unit,
    icon: m.name.toLowerCase().replace(/\s+/g, '-'),
    color: m.color,
    is_positive: true,
    category: m.category,
    last_updated: new Date().toISOString(),
    created_at: daysAgo(540)
  })))
}

async function seedInvestorMetrics() {
  console.log('\n💹 Investor Metrics...')
  await deleteExisting('investor_metrics')

  await seed('investor_metrics', {
    id: uuid(),
    user_id: DEMO_USER_ID,
    metric_date: new Date().toISOString().split('T')[0],
    period: 'monthly',
    total_users: TOTAL_CLIENTS + 3, // Clients + leads
    active_users_daily: 1,
    active_users_weekly: 1,
    active_users_monthly: 1,
    mrr: 12500,
    arr: 150000,
    revenue_growth: 47,
    avg_project_value: 42000,
    total_gmv: TOTAL_REVENUE,
    platform_revenue: TOTAL_REVENUE,
    ltv: 65000,
    cac: 450,
    ltv_cac_ratio: 144,
    ai_engagement_rate: 82,
    total_ai_interactions: 450,
    uptime: 99.98,
    avg_response_time: 85,
    error_rate: 0.02,
    created_at: daysAgo(540),
    updated_at: new Date().toISOString()
  })
}

// ============================================================================
// ESCROW SYSTEM - Secure payment management for projects
// ============================================================================

async function seedEscrowDeposits() {
  console.log('\n🔒 Escrow Deposits...')
  await deleteExisting('escrow_deposits')

  const escrowDeposits = [
    // Active projects with escrow
    {
      id: ESCROW_IDS.cloudsync,
      project_title: 'CloudSync Mobile App',
      project_description: 'Native mobile application with real-time sync capabilities',
      client_name: 'CloudSync Solutions',
      client_email: 'jennifer@cloudsync.io',
      amount: 45000,
      status: 'active',
      progress_percentage: 60,
      payment_method: 'stripe', // Use stripe for all - most likely to be valid in DB
      days: 90,
    },
    {
      id: ESCROW_IDS.datapulse,
      project_title: 'DataPulse Analytics Dashboard',
      project_description: 'Real-time analytics dashboard with customizable widgets',
      client_name: 'DataPulse Analytics',
      client_email: 'rachel@datapulse.ai',
      amount: 32000,
      status: 'active',
      progress_percentage: 50,
      payment_method: 'stripe',
      days: 60,
    },
    {
      id: ESCROW_IDS.urbanfitness,
      project_title: 'Urban Fitness Website Redesign',
      project_description: 'Modern responsive website with class booking system',
      client_name: 'Urban Fitness Studio',
      client_email: 'david@urbanfitness.com',
      amount: 18000,
      status: 'active',
      progress_percentage: 30,
      payment_method: 'stripe',
      days: 45,
    },
    // Completed escrows
    {
      id: ESCROW_IDS.completed_techventure,
      project_title: 'TechVenture Investor Portal',
      project_description: 'Secure investor portal with portfolio tracking',
      client_name: 'TechVenture Capital',
      client_email: 'sarah@techventure.io',
      amount: 75000,
      status: 'completed',
      progress_percentage: 100,
      payment_method: 'stripe',
      days: 420,
    },
    {
      id: ESCROW_IDS.completed_greenleaf,
      project_title: 'GreenLeaf E-commerce Platform',
      project_description: 'Full e-commerce solution with subscription management',
      client_name: 'GreenLeaf Organics',
      client_email: 'marcus@greenleaf.co',
      amount: 52000,
      status: 'completed',
      progress_percentage: 100,
      payment_method: 'stripe',
      days: 390,
    },
  ]

  await seed('escrow_deposits', escrowDeposits.map(e => ({
    id: e.id,
    user_id: DEMO_USER_ID,
    project_title: e.project_title,
    project_description: e.project_description,
    client_name: e.client_name,
    client_email: e.client_email,
    amount: e.amount,
    currency: 'USD',
    status: e.status,
    progress_percentage: e.progress_percentage,
    payment_method: e.payment_method,
    completion_password: `ESCROW-${Date.now().toString(36).toUpperCase()}-${e.id.slice(0, 8)}`, // Required NOT NULL
    created_at: daysAgo(e.days),
    updated_at: daysAgo(Math.min(e.days - 10, 1)),
  })))
}

async function seedEscrowMilestones() {
  console.log('\n📋 Escrow Milestones...')
  await deleteExisting('escrow_milestones')

  const milestones = [
    // CloudSync milestones
    { id: MILESTONE_IDS.cloudsync_design, deposit_id: ESCROW_IDS.cloudsync, title: 'UI/UX Design', amount: 9000, percentage: 20, status: 'approved', due_days: 70 },
    { id: MILESTONE_IDS.cloudsync_dev, deposit_id: ESCROW_IDS.cloudsync, title: 'Core Development', amount: 18000, percentage: 40, status: 'in_progress', due_days: 14 },
    { id: MILESTONE_IDS.cloudsync_testing, deposit_id: ESCROW_IDS.cloudsync, title: 'Testing & QA', amount: 9000, percentage: 20, status: 'pending', due_days: -7 },
    { id: MILESTONE_IDS.cloudsync_launch, deposit_id: ESCROW_IDS.cloudsync, title: 'Launch & Deployment', amount: 9000, percentage: 20, status: 'pending', due_days: -21 },
    // DataPulse milestones
    { id: MILESTONE_IDS.datapulse_phase1, deposit_id: ESCROW_IDS.datapulse, title: 'Phase 1: Foundation', amount: 9600, percentage: 30, status: 'approved', due_days: 45 },
    { id: MILESTONE_IDS.datapulse_phase2, deposit_id: ESCROW_IDS.datapulse, title: 'Phase 2: Features', amount: 12800, percentage: 40, status: 'in_progress', due_days: 7 },
    { id: MILESTONE_IDS.datapulse_phase3, deposit_id: ESCROW_IDS.datapulse, title: 'Phase 3: Polish & Launch', amount: 9600, percentage: 30, status: 'pending', due_days: -30 },
    // Urban Fitness milestones
    { id: MILESTONE_IDS.urbanfitness_design, deposit_id: ESCROW_IDS.urbanfitness, title: 'Design Phase', amount: 7200, percentage: 40, status: 'in_progress', due_days: 30 },
    { id: MILESTONE_IDS.urbanfitness_dev, deposit_id: ESCROW_IDS.urbanfitness, title: 'Development & Launch', amount: 10800, percentage: 60, status: 'pending', due_days: -45 },
  ]

  await seed('escrow_milestones', milestones.map(m => ({
    id: m.id,
    deposit_id: m.deposit_id,
    title: m.title,
    description: `Milestone: ${m.title}`,
    amount: m.amount,
    percentage: m.percentage,
    status: m.status,
    due_date: m.due_days > 0 ? daysAgo(m.due_days) : daysFromNow(-m.due_days),
    created_at: daysAgo(90),
    updated_at: daysAgo(Math.floor(Math.random() * 7)),
  })))
}

async function seedEscrowTransactions() {
  console.log('\n💸 Escrow Transactions...')
  // Skip if table schema is incompatible - transactions can be tracked via escrow_deposits
  console.log('   ⏭️  Skipping escrow_transactions (schema incompatible - use escrow_deposits for demo)')
}

async function seedEscrowContracts() {
  console.log('\n📜 Escrow Contracts...')
  await deleteExisting('escrow_contracts')

  const contracts = [
    { deposit_id: ESCROW_IDS.cloudsync, title: 'CloudSync Mobile App Development Agreement', signed_client: true, signed_freelancer: true },
    { deposit_id: ESCROW_IDS.datapulse, title: 'DataPulse Dashboard Development Contract', signed_client: true, signed_freelancer: true },
    { deposit_id: ESCROW_IDS.urbanfitness, title: 'Urban Fitness Website Redesign Agreement', signed_client: true, signed_freelancer: true },
    { deposit_id: ESCROW_IDS.completed_techventure, title: 'TechVenture Investor Portal Contract', signed_client: true, signed_freelancer: true },
    { deposit_id: ESCROW_IDS.completed_greenleaf, title: 'GreenLeaf E-commerce Development Agreement', signed_client: true, signed_freelancer: true },
  ]

  await seed('escrow_contracts', contracts.map((c, i) => ({
    id: uuid(),
    deposit_id: c.deposit_id,
    title: c.title,
    content: `This agreement is entered into between the parties for ${c.title}. Standard terms and conditions apply.`,
    signed_by_client: c.signed_client,
    signed_by_freelancer: c.signed_freelancer,
    client_signed_at: daysAgo(80 + i * 30),
    freelancer_signed_at: daysAgo(80 + i * 30),
    version: 1,
    created_at: daysAgo(90 + i * 30),
    updated_at: daysAgo(80 + i * 30),
  })))
}

// ============================================================================
// TAX SYSTEM - Tax calculations and compliance
// ============================================================================

async function seedUserTaxProfile() {
  console.log('\n📋 Tax Profile...')
  await deleteExisting('user_tax_profiles')

  await seed('user_tax_profiles', {
    id: uuid(),
    user_id: DEMO_USER_ID,
    business_structure: 'sole_proprietor',
    business_name: 'FreeFlow Studio',
    tax_id_number: '12-3456789',
    tax_id_type: 'ein',
    tax_id_country: 'US',
    primary_country: 'US',
    primary_state: 'CA',
    primary_city: 'San Francisco',
    postal_code: '94105',
    nexus_states: ['CA', 'NY', 'TX', 'FL'],
    auto_calculate_tax: true,
    include_tax_in_prices: false,
    tax_filing_frequency: 'quarterly',
    estimated_annual_income: 150000,
    created_at: daysAgo(540),
    updated_at: daysAgo(30),
  })
}

async function seedTaxCalculations() {
  console.log('\n🧮 Tax Calculations...')
  await deleteExisting('tax_calculations')

  const calculations = INVOICE_IDS.slice(0, 15).map((invoiceId, i) => ({
    id: uuid(),
    user_id: DEMO_USER_ID,
    transaction_id: invoiceId,
    transaction_type: 'invoice',
    transaction_date: dateAgo(180 - i * 10),
    origin_country: 'US',
    origin_state: 'CA',
    destination_country: 'US',
    destination_state: ['CA', 'NY', 'TX', 'FL'][i % 4],
    subtotal: 5000 + i * 2000,
    tax_type: 'sales', // Required NOT NULL - valid: 'sales', 'vat', 'gst', etc.
    tax_amount: (5000 + i * 2000) * 0.0825,
    tax_rate: 8.25,
    total_amount: (5000 + i * 2000) * 1.0825,
    is_taxable: true,
    has_nexus: true,
    status: 'calculated',
    calculated_at: daysAgo(180 - i * 10),
    created_at: daysAgo(180 - i * 10),
    updated_at: daysAgo(180 - i * 10),
  }))

  await seed('tax_calculations', calculations)
}

async function seedTaxDeductions() {
  console.log('\n💵 Tax Deductions...')
  await deleteExisting('tax_deductions')

  const deductions = [
    { category: 'office_supplies', subcategory: 'equipment', amount: 3499, desc: 'MacBook Pro M3 Max' },
    { category: 'office_supplies', subcategory: 'equipment', amount: 1599, desc: 'Studio Display 27"' },
    { category: 'software', subcategory: 'subscriptions', amount: 599.88, desc: 'Adobe Creative Cloud Annual' },
    { category: 'software', subcategory: 'subscriptions', amount: 180, desc: 'Figma Professional (12 months)' },
    { category: 'software', subcategory: 'cloud_services', amount: 2500, desc: 'AWS Services Annual' },
    { category: 'professional_development', subcategory: 'conferences', amount: 799, desc: 'React Conf 2025 Ticket' },
    { category: 'professional_development', subcategory: 'courses', amount: 299, desc: 'Design Systems Course' },
    { category: 'travel', subcategory: 'business_travel', amount: 770, desc: 'TechVenture Client Visit' },
    { category: 'office', subcategory: 'coworking', amount: 4200, desc: 'WeWork Hot Desk (12 months)' },
    { category: 'meals', subcategory: 'client_entertainment', amount: 314.40, desc: 'Client Meetings (50% deductible)' },
    { category: 'insurance', subcategory: 'liability', amount: 1200, desc: 'Professional Liability Insurance' },
    { category: 'marketing', subcategory: 'advertising', amount: 500, desc: 'LinkedIn Premium + Ads' },
  ]

  await seed('tax_deductions', deductions.map((d, i) => ({
    id: uuid(),
    user_id: DEMO_USER_ID,
    tax_year: 2025,
    category: d.category,
    subcategory: d.subcategory,
    description: d.desc,
    expense_amount: d.amount,
    expense_date: dateAgo(365 - i * 30),
    deduction_percentage: d.category === 'meals' ? 50 : 100,
    deductible_amount: d.category === 'meals' ? d.amount * 0.5 : d.amount,
    status: 'approved',
    is_approved: true,
    created_at: daysAgo(365 - i * 30),
    updated_at: daysAgo(365 - i * 30),
  })))
}

async function seedTaxFilings() {
  console.log('\n📄 Tax Filings...')
  await deleteExisting('tax_filings')

  const filings = [
    { year: 2024, period: 'Q4', status: 'filed', gross: 95000, owed: 7837.50, startDays: 365, endDays: 275 },
    { year: 2024, period: 'Q3', status: 'filed', gross: 82000, owed: 6765.00, startDays: 456, endDays: 366 },
    { year: 2024, period: 'Q2', status: 'filed', gross: 78000, owed: 6435.00, startDays: 547, endDays: 457 },
    { year: 2024, period: 'Q1', status: 'filed', gross: 65000, owed: 5362.50, startDays: 638, endDays: 548 },
    { year: 2024, period: 'Annual', status: 'filed', gross: 320000, owed: 26400.00, startDays: 638, endDays: 275 },
    { year: 2025, period: 'Q1', status: 'draft', gross: 98000, owed: 8085.00, startDays: 90, endDays: 1 },
  ]

  await seed('tax_filings', filings.map((f, i) => ({
    id: uuid(),
    user_id: DEMO_USER_ID,
    tax_year: f.year,
    filing_period: f.period,
    period_start: dateAgo(f.startDays),
    period_end: dateAgo(f.endDays),
    total_revenue: f.gross,
    total_tax_owed: f.owed,
    status: f.status,
    filed_date: f.status === 'filed' ? dateAgo(30 + i * 90) : null,
    due_date: dateFromNow(90 - i * 30),
    filing_method: 'electronic',
    created_at: daysAgo(60 + i * 90),
    updated_at: daysAgo(30 + i * 90),
  })))
}

// ============================================================================
// GALLERY SYSTEM - Image and media management
// ============================================================================

async function seedGalleryAlbums() {
  console.log('\n🖼️ Gallery Albums...')
  await deleteExisting('gallery_albums')

  const albums = [
    { id: GALLERY_ALBUM_IDS.portfolio, name: 'Portfolio Showcase', desc: 'Best work samples for client presentations', privacy: 'public', images: 8 },
    { id: GALLERY_ALBUM_IDS.projects, name: 'Project Screenshots', desc: 'Screenshots from completed projects', privacy: 'private', images: 12 },
    { id: GALLERY_ALBUM_IDS.assets, name: 'Design Assets', desc: 'Icons, illustrations, and design elements', privacy: 'private', images: 25 },
    { id: GALLERY_ALBUM_IDS.ai_generated, name: 'AI Generated', desc: 'AI-generated images and concepts', privacy: 'private', images: 15 },
  ]

  await seed('gallery_albums', albums.map(a => ({
    id: a.id,
    user_id: DEMO_USER_ID,
    name: a.name,
    description: a.desc,
    privacy: a.privacy,
    image_count: a.images,
    total_size: a.images * 2500000, // ~2.5MB per image avg
    views: Math.floor(Math.random() * 500) + 100,
    created_at: daysAgo(365),
    updated_at: daysAgo(Math.floor(Math.random() * 30)),
  })))
}

async function seedGalleryImages() {
  console.log('\n📸 Gallery Images...')
  await deleteExisting('gallery_images')

  // Valid types: 'image', 'video', 'audio', 'document'
  // Valid categories: branding, web-design, mobile, social, print, video, photography, illustration, 3d, animation, ai-generated, other
  const imageData = [
    { title: 'TechVenture Dashboard Overview', album: GALLERY_ALBUM_IDS.portfolio, category: 'web-design', type: 'image' },
    { title: 'CloudSync Mobile App UI', album: GALLERY_ALBUM_IDS.portfolio, category: 'mobile', type: 'image' },
    { title: 'GreenLeaf E-commerce Homepage', album: GALLERY_ALBUM_IDS.portfolio, category: 'web-design', type: 'image' },
    { title: 'DataPulse Analytics Charts', album: GALLERY_ALBUM_IDS.portfolio, category: 'web-design', type: 'image' },
    { title: 'Nordic Design System Components', album: GALLERY_ALBUM_IDS.portfolio, category: 'web-design', type: 'image' },
    { title: 'Stellar Marketing Brand Guide', album: GALLERY_ALBUM_IDS.portfolio, category: 'branding', type: 'image' },
    { title: 'Bloom LMS Course Interface', album: GALLERY_ALBUM_IDS.portfolio, category: 'web-design', type: 'image' },
    { title: 'Urban Fitness Wireframes', album: GALLERY_ALBUM_IDS.projects, category: 'web-design', type: 'image' },
    { title: 'Mobile App Icon Set', album: GALLERY_ALBUM_IDS.assets, category: 'illustration', type: 'image' },
    { title: 'Brand Color Palette', album: GALLERY_ALBUM_IDS.assets, category: 'branding', type: 'image' },
    { title: 'UI Component Library', album: GALLERY_ALBUM_IDS.assets, category: 'web-design', type: 'image' },
    { title: 'AI Generated Logo Concepts', album: GALLERY_ALBUM_IDS.ai_generated, category: 'ai-generated', type: 'image', ai: true },
    { title: 'AI Abstract Backgrounds', album: GALLERY_ALBUM_IDS.ai_generated, category: 'ai-generated', type: 'image', ai: true },
    { title: 'AI App Mockup Concepts', album: GALLERY_ALBUM_IDS.ai_generated, category: 'ai-generated', type: 'image', ai: true },
  ]

  await seed('gallery_images', imageData.map((img, i) => ({
    id: GALLERY_IMAGE_IDS[i],
    user_id: DEMO_USER_ID,
    title: img.title,
    description: `${img.title} - High quality asset`,
    file_name: `${img.title.toLowerCase().replace(/\s+/g, '-')}.png`,
    file_size: 1500000 + Math.floor(Math.random() * 3000000),
    width: 1920,
    height: 1080,
    format: 'png',
    url: `/images/${img.title.toLowerCase().replace(/\s+/g, '-')}.png`,
    thumbnail: `/thumbnails/${img.title.toLowerCase().replace(/\s+/g, '-')}-thumb.png`,
    type: img.type,
    category: img.category,
    album_id: img.album,
    tags: [img.category, 'portfolio'],
    views: Math.floor(Math.random() * 200) + 50,
    likes: Math.floor(Math.random() * 50) + 10,
    downloads: Math.floor(Math.random() * 30) + 5,
    ai_generated: img.ai || false,
    created_at: daysAgo(300 - i * 20),
    updated_at: daysAgo(Math.floor(Math.random() * 60)),
  })))
}

async function seedGalleryTags() {
  console.log('\n🏷️ Gallery Tags...')
  await deleteExisting('gallery_tags')

  const tags = [
    { id: GALLERY_TAG_IDS.design, name: 'Design', color: '#3B82F6', category: 'type' },
    { id: GALLERY_TAG_IDS.development, name: 'Development', color: '#10B981', category: 'type' },
    { id: GALLERY_TAG_IDS.branding, name: 'Branding', color: '#8B5CF6', category: 'type' },
    { id: GALLERY_TAG_IDS.ui, name: 'UI/UX', color: '#F59E0B', category: 'type' },
    { id: GALLERY_TAG_IDS.mobile, name: 'Mobile', color: '#EF4444', category: 'platform' },
  ]

  await seed('gallery_tags', tags.map(t => ({
    id: t.id,
    user_id: DEMO_USER_ID,
    name: t.name,
    color: t.color,
    category: t.category,
    usage_count: Math.floor(Math.random() * 20) + 5,
    created_at: daysAgo(365),
  })))
}

async function seedGalleryCollections() {
  console.log('\n📚 Gallery Collections...')
  await deleteExisting('gallery_collections')

  // Note: DB might use 'owner_id' instead of 'user_id'
  await seed('gallery_collections', [
    {
      id: GALLERY_COLLECTION_IDS.featured,
      owner_id: DEMO_USER_ID,
      title: 'Featured Work',
      description: 'Hand-picked best work samples',
      created_at: daysAgo(300),
      updated_at: daysAgo(7),
    },
    {
      id: GALLERY_COLLECTION_IDS.recent,
      owner_id: DEMO_USER_ID,
      title: 'Recent Uploads',
      description: 'Automatically updated with recent work',
      created_at: daysAgo(180),
      updated_at: daysAgo(1),
    },
  ])
}

// ============================================================================
// PORTFOLIO SYSTEM - Professional portfolio and CV
// ============================================================================

async function seedPortfolio() {
  console.log('\n👤 Portfolio...')
  await deleteExisting('portfolios')

  // Note: Simplified schema - only using columns that exist in actual DB
  await seed('portfolios', {
    id: PORTFOLIO_ID,
    user_id: DEMO_USER_ID,
    slug: 'alex-thompson',
    title: 'Alex Thompson',
    subtitle: 'Full-Stack Developer & Product Designer',
    bio: 'I help startups and enterprises build beautiful, functional products. With 8+ years of experience in full-stack development and UI/UX design, I specialize in React, Node.js, and TypeScript. From $0 to $368K in freelance revenue in 18 months.',
    avatar_url: '/avatars/alex-thompson.jpg',
    cover_image_url: '/covers/portfolio-cover.jpg',
    email: 'alex@freeflow.io',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    website: 'https://alexthompson.dev',
    timezone: 'America/Los_Angeles',
    preferred_contact: 'email',
    github_url: 'https://github.com/alexthompson',
    linkedin_url: 'https://linkedin.com/in/alexthompson',
    twitter_url: 'https://twitter.com/alexthompson',
    is_public: true,
    show_contact: true,
    show_social: true,
    allow_download: true,
    allow_share: true,
    created_at: daysAgo(540),
    updated_at: daysAgo(1),
  })
}

async function seedPortfolioProjects() {
  console.log('\n🎨 Portfolio Projects...')
  await deleteExisting('portfolio_projects')

  // Note: Simplified schema - removed 'status' column that may not exist
  const portfolioProjects = PROJECTS.filter(p => p.status === 'completed').map((p, i) => ({
    id: uuid(),
    portfolio_id: PORTFOLIO_ID,
    title: p.title,
    description: p.description,
    image_url: `/projects/${p.title.toLowerCase().replace(/\s+/g, '-')}.jpg`,
    category: p.priority === 'high' ? 'featured' : 'work',
    // Note: 'status' column may not exist in all DB versions
    live_url: `https://${p.title.toLowerCase().replace(/\s+/g, '')}.com`,
    technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'].slice(0, 3 + (i % 3)),
    duration: `${Math.ceil((new Date(p.endDate).getTime() - new Date(p.startDate).getTime()) / (30 * 86400000))} months`,
    role: 'Lead Developer & Designer',
    team_size: 1 + (i % 3),
    views: 150 + Math.floor(Math.random() * 500),
    likes: 30 + Math.floor(Math.random() * 100),
    featured: i < 3,
    display_order: i,
    created_at: p.endDate,
    updated_at: daysAgo(Math.floor(Math.random() * 60)),
  }))

  await seed('portfolio_projects', portfolioProjects)
}

async function seedPortfolioSkills() {
  console.log('\n🛠️ Portfolio Skills...')
  await deleteExisting('portfolio_skills')

  // Valid skill_category enum values: 'Technical', 'Soft', 'Languages', 'Tools'
  const skills = [
    { name: 'React', category: 'Technical', proficiency: 5, years: 6 },
    { name: 'TypeScript', category: 'Technical', proficiency: 5, years: 5 },
    { name: 'Node.js', category: 'Technical', proficiency: 5, years: 6 },
    { name: 'PostgreSQL', category: 'Tools', proficiency: 4, years: 5 },
    { name: 'Next.js', category: 'Technical', proficiency: 5, years: 4 },
    { name: 'Tailwind CSS', category: 'Tools', proficiency: 5, years: 3 },
    { name: 'Python', category: 'Technical', proficiency: 4, years: 4 },
    { name: 'AWS', category: 'Tools', proficiency: 4, years: 4 },
    { name: 'Docker', category: 'Tools', proficiency: 4, years: 3 },
    { name: 'Communication', category: 'Soft', proficiency: 5, years: 8 },
    { name: 'Problem Solving', category: 'Soft', proficiency: 5, years: 8 },
    { name: 'English', category: 'Languages', proficiency: 5, years: 20 },
  ]

  // Note: Simplified - only using columns that exist in actual DB
  await seed('portfolio_skills', skills.map((s, i) => ({
    id: uuid(),
    portfolio_id: PORTFOLIO_ID,
    name: s.name,
    proficiency: s.proficiency,
    years_of_experience: s.years,
    endorsed: i < 6,
    endorsement_count: i < 6 ? 10 + Math.floor(Math.random() * 30) : 0,
    trending: i < 3,
    created_at: daysAgo(540),
    updated_at: daysAgo(30),
  })))
}

async function seedPortfolioExperience() {
  console.log('\n💼 Portfolio Experience...')
  await deleteExisting('portfolio_experience')

  // Valid employment_type values: full-time, part-time, contract, freelance
  const experiences = [
    { company: 'FreeFlow Studio', position: 'Founder & Lead Developer', type: 'freelance', start: 540, end: null, current: true },
    { company: 'TechCorp Inc.', position: 'Senior Full-Stack Developer', type: 'full-time', start: 1200, end: 540, current: false },
    { company: 'StartupXYZ', position: 'Full-Stack Developer', type: 'full-time', start: 1800, end: 1200, current: false },
    { company: 'WebAgency', position: 'Junior Developer', type: 'full-time', start: 2400, end: 1800, current: false },
  ]

  await seed('portfolio_experience', experiences.map((e, i) => ({
    id: uuid(),
    portfolio_id: PORTFOLIO_ID,
    company_name: e.company,
    position: e.position,
    employment_type: e.type,
    location: 'San Francisco, CA',
    start_date: daysAgo(e.start).split('T')[0],
    end_date: e.end ? daysAgo(e.end).split('T')[0] : null,
    is_current: e.current,
    description: `${e.position} at ${e.company}. Worked on various projects and initiatives.`,
    technologies: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
    display_order: i,
    created_at: daysAgo(540),
    updated_at: daysAgo(30),
  })))
}

async function seedPortfolioEducation() {
  console.log('\n🎓 Portfolio Education...')
  await deleteExisting('portfolio_education')

  await seed('portfolio_education', [
    {
      id: uuid(),
      portfolio_id: PORTFOLIO_ID,
      institution_name: 'Stanford University',
      location: 'Stanford, CA',
      degree: 'Bachelor of Science',
      field_of_study: 'Computer Science',
      start_date: '2012-09-01',
      end_date: '2016-06-15',
      is_current: false,
      gpa: 3.8,
      honors: ['Cum Laude', 'Dean\'s List'],
      coursework: ['Data Structures', 'Algorithms', 'Web Development', 'Database Systems'],
      display_order: 0,
      created_at: daysAgo(3000),
      updated_at: daysAgo(365),
    },
  ])
}

async function seedPortfolioCertifications() {
  console.log('\n📜 Portfolio Certifications...')
  await deleteExisting('portfolio_certifications')

  const certs = [
    { title: 'AWS Solutions Architect', issuer: 'Amazon Web Services', date: 180, expires: false },
    { title: 'Professional Scrum Master I', issuer: 'Scrum.org', date: 365, expires: false },
    { title: 'Google UX Design Certificate', issuer: 'Google', date: 540, expires: false },
    { title: 'Meta Front-End Developer', issuer: 'Meta', date: 300, expires: false },
  ]

  await seed('portfolio_certifications', certs.map((c, i) => ({
    id: uuid(),
    portfolio_id: PORTFOLIO_ID,
    title: c.title,
    issuer: c.issuer,
    issue_date: daysAgo(c.date).split('T')[0],
    expiry_date: c.expires ? daysFromNow(730).split('T')[0] : null,
    credential_id: `CERT-${Date.now()}-${i}`,
    verified: true,
    display_order: i,
    created_at: daysAgo(c.date),
    updated_at: daysAgo(c.date),
  })))
}

async function seedPortfolioTestimonials() {
  console.log('\n💬 Portfolio Testimonials...')
  await deleteExisting('portfolio_testimonials')

  const testimonials = [
    { author: 'Sarah Mitchell', title: 'CEO', company: 'TechVenture Capital', content: 'Alex delivered an exceptional investor portal that exceeded our expectations. His technical skills and attention to detail are outstanding. The project was completed on time and within budget.', rating: 5 },
    { author: 'Marcus Johnson', title: 'Founder', company: 'GreenLeaf Organics', content: 'Working with Alex transformed our online presence. The e-commerce platform he built has significantly increased our sales and customer satisfaction. Highly recommended!', rating: 5 },
    { author: 'Jennifer Wu', title: 'CTO', company: 'CloudSync Solutions', content: 'Alex is a rare find - a developer who truly understands both the technical and business sides. His work on our mobile app has been invaluable.', rating: 5 },
    { author: 'Michael Brown', title: 'Director of Education', company: 'Bloom Education', content: 'The LMS Alex built for us is intuitive, powerful, and exactly what we needed. His communication throughout the project was excellent.', rating: 5 },
  ]

  await seed('portfolio_testimonials', testimonials.map((t, i) => ({
    id: uuid(),
    portfolio_id: PORTFOLIO_ID,
    author_name: t.author,
    author_title: t.title,
    author_company: t.company,
    content: t.content,
    rating: t.rating,
    relationship: 'client',
    featured: i < 2,
    approved: true,
    display_order: i,
    created_at: daysAgo(300 - i * 60),
    updated_at: daysAgo(300 - i * 60),
  })))
}

// ============================================================================
// STORAGE SYSTEM - File management
// ============================================================================

async function seedStorageFolders() {
  console.log('\n📁 Storage Folders...')
  await deleteExisting('storage_folders')

  const folders = [
    { id: STORAGE_FOLDER_IDS.root, name: 'My Files', path: '/', parent: null },
    { id: STORAGE_FOLDER_IDS.projects, name: 'Projects', path: '/Projects', parent: STORAGE_FOLDER_IDS.root },
    { id: STORAGE_FOLDER_IDS.contracts, name: 'Contracts', path: '/Contracts', parent: STORAGE_FOLDER_IDS.root },
    { id: STORAGE_FOLDER_IDS.invoices, name: 'Invoices', path: '/Invoices', parent: STORAGE_FOLDER_IDS.root },
    { id: STORAGE_FOLDER_IDS.assets, name: 'Assets', path: '/Assets', parent: STORAGE_FOLDER_IDS.root },
  ]

  // Note: Minimal columns - removed provider and path
  await seed('storage_folders', folders.map(f => ({
    id: f.id,
    user_id: DEMO_USER_ID,
    name: f.name,
    parent_id: f.parent,
    created_at: daysAgo(365),
    updated_at: daysAgo(Math.floor(Math.random() * 30)),
  })))
}

async function seedStorageFiles() {
  console.log('\n📄 Storage Files...')
  // Skip if table schema is incompatible - files can be represented via gallery_images
  console.log('   ⏭️  Skipping storage_files (schema incompatible - use gallery_images for demo)')
}

async function seedStorageQuotas() {
  console.log('\n💾 Storage Quotas...')
  await deleteExisting('storage_quotas')

  // Note: Simplified schema - using columns that exist in all DB versions
  await seed('storage_quotas', {
    id: uuid(),
    user_id: DEMO_USER_ID,
    total_quota: 10737418240, // 10 GB
    used_space: 156000000, // 156 MB
    file_count: 45,
    // Note: last_updated column may not exist in all DB versions
    created_at: daysAgo(540),
    updated_at: new Date().toISOString(),
  })
}

// ============================================================================
// CONTRACTS & PROPOSALS SYSTEM
// ============================================================================

async function seedContracts() {
  console.log('\n📝 Contracts...')
  await deleteExisting('contracts')

  const contracts = [
    { id: CONTRACT_IDS.cloudsync, client: CLIENTS.find(c => c.id === CLIENT_IDS.cloudsync)!, project: 'CloudSync Mobile App', value: 45000, status: 'active' },
    { id: CONTRACT_IDS.datapulse, client: CLIENTS.find(c => c.id === CLIENT_IDS.datapulse)!, project: 'DataPulse Analytics Dashboard', value: 32000, status: 'active' },
    { id: CONTRACT_IDS.urbanfitness, client: CLIENTS.find(c => c.id === CLIENT_IDS.urbanfitness)!, project: 'Urban Fitness Website Redesign', value: 18000, status: 'active' },
  ]

  await seed('contracts', contracts.map((c, i) => ({
    id: c.id,
    user_id: DEMO_USER_ID,
    client_id: c.client.id,
    contract_number: `CTR-2025-${String(i + 1).padStart(4, '0')}`,
    title: `${c.project} - Service Agreement`,
    description: `Professional services agreement for ${c.project}`,
    terms: `Standard terms and conditions apply. Payment due within 30 days. Full scope of work detailed in attached SOW for ${c.project}.`, // Required NOT NULL
    contract_type: 'service',
    contract_value: c.value,
    currency: 'USD',
    status: c.status,
    start_date: dateAgo(90 - i * 30),
    end_date: dateFromNow(90 - i * 30),
    party_a_name: 'Alex Thompson - FreeFlow Studio',
    party_a_email: 'alex@freeflow.io',
    party_b_name: c.client.name,
    party_b_email: c.client.email,
    party_a_signed_at: daysAgo(85 - i * 30),
    party_b_signed_at: daysAgo(85 - i * 30),
    signed_date: dateAgo(85 - i * 30),
    version: 1,
    created_at: daysAgo(90 - i * 30),
    updated_at: daysAgo(30),
  })))
}

async function seedContractTemplates() {
  console.log('\n📋 Contract Templates...')
  await deleteExisting('contract_templates')

  await seed('contract_templates', [
    {
      id: CONTRACT_IDS.template_standard,
      user_id: DEMO_USER_ID,
      name: 'Standard Service Agreement',
      description: 'Standard contract template for most projects',
      content: 'This Service Agreement is entered into between the Service Provider and Client...',
      category: 'service',
      is_default: true,
      usage_count: 8,
      created_at: daysAgo(540),
      updated_at: daysAgo(60),
    },
    {
      id: CONTRACT_IDS.template_enterprise,
      user_id: DEMO_USER_ID,
      name: 'Enterprise Development Agreement',
      description: 'Comprehensive contract for large enterprise projects',
      content: 'This Enterprise Development Agreement is entered into between the Parties...',
      category: 'enterprise',
      is_default: false,
      usage_count: 3,
      created_at: daysAgo(365),
      updated_at: daysAgo(90),
    },
  ])
}

async function seedProposals() {
  console.log('\n📨 Proposals...')
  await deleteExisting('proposals')

  const proposals = [
    { id: PROPOSAL_IDS.nexus, client: CLIENTS.find(c => c.id === CLIENT_IDS.nexus)!, title: 'Web Application Development', value: 65000, status: 'sent' },
    { id: PROPOSAL_IDS.summit, client: CLIENTS.find(c => c.id === CLIENT_IDS.summit)!, title: 'Real Estate Platform', value: 48000, status: 'sent' },
    { id: PROPOSAL_IDS.artisan, client: CLIENTS.find(c => c.id === CLIENT_IDS.artisan)!, title: 'E-commerce Website', value: 28000, status: 'draft' },
  ]

  await seed('proposals', proposals.map((p, i) => ({
    id: p.id,
    user_id: DEMO_USER_ID,
    client_id: p.client.id,
    client_name: p.client.name,
    client_email: p.client.email,
    title: p.title,
    description: `Proposal for ${p.title} project`,
    value: p.value,
    currency: 'USD',
    status: p.status,
    valid_until: daysFromNow(30 - i * 10).split('T')[0],
    sent_at: p.status === 'sent' ? daysAgo(7 - i * 3) : null,
    viewed_at: p.status === 'sent' && i === 0 ? daysAgo(5) : null,
    created_at: daysAgo(14 - i * 5),
    updated_at: daysAgo(7 - i * 3),
  })))
}

// ============================================================================
// PAYMENTS SYSTEM
// ============================================================================

async function seedBilling() {
  console.log('\n💳 Billing Records...')
  // Billing data managed by payment providers - seed billing_stats instead
  await deleteExisting('billing_stats')

  await seed('billing_stats', {
    id: uuid(),
    user_id: DEMO_USER_ID,
    total_revenue: TOTAL_REVENUE,
    pending_amount: 28500,
    overdue_amount: 0,
    average_invoice_value: 18000,
    total_invoices: 19,
    paid_invoices: 15,
    pending_invoices: 4,
    overdue_invoices: 0,
    cancelled_invoices: 0,
    updated_at: new Date().toISOString(),
  })
}

// ============================================================================
// API KEYS SYSTEM
// ============================================================================

async function seedApiKeys() {
  console.log('\n🔑 API Keys...')
  await deleteExisting('api_keys')

  // Schema: id, user_id, name, key_prefix, key_hash, scopes, last_used_at, usage_count, rate_limit, expires_at, is_active, created_at
  await seed('api_keys', [
    {
      id: uuid(),
      user_id: DEMO_USER_ID,
      name: 'Production API Key',
      key_prefix: 'sk_live_',
      key_hash: 'hashed_key_production_' + Date.now(),
      scopes: ['read', 'write'],
      rate_limit: 1000,
      is_active: true,
      last_used_at: hoursAgo(2),
      usage_count: 15420,
      created_at: daysAgo(365),
    },
    {
      id: uuid(),
      user_id: DEMO_USER_ID,
      name: 'Development API Key',
      key_prefix: 'sk_test_',
      key_hash: 'hashed_key_development_' + Date.now(),
      scopes: ['read', 'write'],
      rate_limit: 100,
      is_active: true,
      last_used_at: hoursAgo(12),
      usage_count: 8750,
      created_at: daysAgo(300),
    },
    {
      id: uuid(),
      user_id: DEMO_USER_ID,
      name: 'Webhook Integration Key',
      key_prefix: 'whk_',
      key_hash: 'hashed_key_webhook_' + Date.now(),
      scopes: ['webhook'],
      rate_limit: 500,
      is_active: true,
      last_used_at: daysAgo(1),
      usage_count: 3200,
      created_at: daysAgo(180),
    },
  ])
}

// ============================================================================
// CHATS & MESSAGES - Collaboration
// ============================================================================

const CHAT_IDS = {
  cloudsync: uuid(),
  datapulse: uuid(),
  general: uuid(),
}

async function seedChats() {
  console.log('\n💬 Chats...')
  await deleteExisting('chats')

  await seed('chats', [
    {
      id: CHAT_IDS.cloudsync,
      user_id: DEMO_USER_ID,
      name: 'CloudSync Project',
      description: 'Discussion for CloudSync Mobile App development',
      type: 'group',
      is_pinned: true,
      last_message_at: hoursAgo(2),
      created_at: daysAgo(90),
      updated_at: hoursAgo(2),
    },
    {
      id: CHAT_IDS.datapulse,
      user_id: DEMO_USER_ID,
      name: 'DataPulse Team',
      description: 'Analytics dashboard project communication',
      type: 'group',
      is_pinned: false,
      last_message_at: hoursAgo(6),
      created_at: daysAgo(60),
      updated_at: hoursAgo(6),
    },
    {
      id: CHAT_IDS.general,
      user_id: DEMO_USER_ID,
      name: 'General Updates',
      description: 'Business announcements and updates',
      type: 'channel',
      is_pinned: true,
      last_message_at: daysAgo(1),
      created_at: daysAgo(365),
      updated_at: daysAgo(1),
    },
  ])
}

async function seedMessages() {
  console.log('\n📨 Messages...')
  await deleteExisting('messages')

  const messages = [
    // CloudSync project messages
    { chat_id: CHAT_IDS.cloudsync, text: 'The UI mockups are looking great! Jennifer approved the designs.', hours: 48 },
    { chat_id: CHAT_IDS.cloudsync, text: 'Starting work on the real-time sync feature today.', hours: 36 },
    { chat_id: CHAT_IDS.cloudsync, text: 'Push notifications are now working on both iOS and Android.', hours: 24 },
    { chat_id: CHAT_IDS.cloudsync, text: 'Client meeting scheduled for tomorrow at 2 PM to review progress.', hours: 12 },
    { chat_id: CHAT_IDS.cloudsync, text: 'Milestone 2 completed - 40% of project done! 🎉', hours: 2 },
    // DataPulse messages
    { chat_id: CHAT_IDS.datapulse, text: 'Dashboard wireframes are ready for review.', hours: 72 },
    { chat_id: CHAT_IDS.datapulse, text: 'API integration with their data warehouse is complete.', hours: 48 },
    { chat_id: CHAT_IDS.datapulse, text: 'Rachel asked for custom export functionality - adding to scope.', hours: 24 },
    { chat_id: CHAT_IDS.datapulse, text: 'Performance optimizations reduced load time by 60%!', hours: 6 },
    // General messages
    { chat_id: CHAT_IDS.general, text: 'Q1 revenue exceeded projections by 15%! Great work team.', hours: 168 },
    { chat_id: CHAT_IDS.general, text: 'New client onboarding: Urban Fitness Studio signed yesterday.', hours: 120 },
    { chat_id: CHAT_IDS.general, text: 'Reminder: Tax filing deadline is next month - documents ready.', hours: 24 },
  ]

  // Schema uses sender_id, minimal columns
  await seed('messages', messages.map((m, i) => ({
    id: uuid(),
    chat_id: m.chat_id,
    sender_id: DEMO_USER_ID,
    text: m.text,
    is_edited: false,
    is_pinned: i === 4 || i === 8, // Pin milestone messages
    is_deleted: false,
    created_at: hoursAgo(m.hours),
  })))
}

async function seedComments() {
  console.log('\n💭 Comments...')
  // Comments table may not exist in DB - skip
  console.log('   ⏭️  Skipping comments (table may not exist)')
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('🚀 KAZI Complete Demo Data Seeding')
  console.log('=' .repeat(60))
  console.log(`User: ${DEMO_EMAIL}`)
  console.log(`ID: ${DEMO_USER_ID}`)
  console.log('')
  console.log('📊 Business Story:')
  console.log(`   • Started: 18 months ago`)
  console.log(`   • Total Revenue: $${TOTAL_REVENUE.toLocaleString()}`)
  console.log(`   • Active Projects: ${ACTIVE_PROJECTS}`)
  console.log(`   • Completed Projects: ${COMPLETED_PROJECTS}`)
  console.log(`   • Total Clients: ${TOTAL_CLIENTS}`)
  console.log('')

  // ============ PHASE 1: Foundation Data ============
  console.log('\n🏗️  PHASE 1: Foundation Data')
  await seedClients()
  await seedProjects()
  await seedTasks()

  // ============ PHASE 2: Financial ============
  console.log('\n💰 PHASE 2: Financial')
  await seedInvoices()
  await seedExpenses()
  await seedBilling()

  // ============ PHASE 3: Time & Scheduling ============
  console.log('\n⏰ PHASE 3: Time & Scheduling')
  await seedTimeEntries()
  await seedCalendarEvents()
  await seedBookings()

  // ============ PHASE 4: Team & Communication ============
  console.log('\n👥 PHASE 4: Team & Communication')
  await seedTeamMembers()
  await seedNotifications()
  await seedLeads()
  await seedChats()
  await seedMessages()
  await seedComments()

  // ============ PHASE 5: Escrow System ============
  console.log('\n🔒 PHASE 5: Escrow System')
  await seedEscrowDeposits()
  await seedEscrowMilestones()
  await seedEscrowTransactions()
  await seedEscrowContracts()

  // ============ PHASE 6: Tax System ============
  console.log('\n📋 PHASE 6: Tax System')
  await seedUserTaxProfile()
  await seedTaxCalculations()
  await seedTaxDeductions()
  await seedTaxFilings()

  // ============ PHASE 7: Gallery & Media ============
  console.log('\n🖼️  PHASE 7: Gallery & Media')
  await seedGalleryAlbums()
  await seedGalleryImages()
  await seedGalleryTags()
  await seedGalleryCollections()

  // ============ PHASE 8: Portfolio & CV ============
  console.log('\n👤 PHASE 8: Portfolio & CV')
  await seedPortfolio()
  await seedPortfolioProjects()
  await seedPortfolioSkills()
  await seedPortfolioExperience()
  await seedPortfolioEducation()
  await seedPortfolioCertifications()
  await seedPortfolioTestimonials()

  // ============ PHASE 9: Storage & Files ============
  console.log('\n📁 PHASE 9: Storage & Files')
  await seedStorageFolders()
  await seedStorageFiles()
  await seedStorageQuotas()

  // ============ PHASE 10: Contracts ============
  console.log('\n📝 PHASE 10: Contracts')
  await seedContracts()

  // ============ PHASE 11: API & Automation ============
  console.log('\n⚡ PHASE 11: API & Automation')
  await seedApiKeys()
  await seedWorkflows()

  // ============ PHASE 12: Community ============
  console.log('\n🌐 PHASE 12: Community')
  await seedCommunityPosts()

  // ============ PHASE 13: AI ============
  console.log('\n🤖 PHASE 13: AI')
  await seedAIConversations()

  // ============ PHASE 14: Admin ============
  console.log('\n🔧 PHASE 14: Admin')
  await seedAnnouncements()
  await seedCompliance()

  // ============ PHASE 15: Settings ============
  console.log('\n⚙️  PHASE 15: Settings')
  await seedNotificationSettings()

  // ============ PHASE 16: Dashboard & Metrics ============
  console.log('\n📊 PHASE 16: Dashboard & Metrics')
  await seedDashboardStats()
  await seedDashboardMetrics()
  await seedInvestorMetrics()

  // Summary
  console.log('\n' + '=' .repeat(60))
  console.log('\n📋 RESULTS SUMMARY:\n')

  const successful = results.filter(r => r.status === 'success')
  const failed = results.filter(r => r.status === 'error')

  console.log(`✅ Successful: ${successful.length}`)
  successful.forEach(r => console.log(`   ${r.table}: ${r.message}`))

  if (failed.length > 0) {
    console.log(`\n❌ Failed: ${failed.length}`)
    failed.forEach(r => console.log(`   ${r.table}: ${r.message}`))
  }

  // Total records
  const totalRecords = successful.reduce((sum, r) => {
    const match = r.message.match(/(\d+) records/)
    return sum + (match ? parseInt(match[1]) : 0)
  }, 0)

  console.log(`\n📦 Total Records Created: ${totalRecords}`)
  console.log(`\n🎯 Features Covered:`)
  console.log(`   • Clients & Projects`)
  console.log(`   • Invoices & Payments`)
  console.log(`   • Time Tracking`)
  console.log(`   • Escrow System`)
  console.log(`   • Tax Intelligence`)
  console.log(`   • Gallery & Media`)
  console.log(`   • Portfolio & CV`)
  console.log(`   • Storage & Files`)
  console.log(`   • Contracts & Proposals`)
  console.log(`   • API Keys`)
  console.log(`   • Workflows & Automation`)
  console.log(`   • Community Hub`)
  console.log(`   • AI Conversations`)
  console.log(`   • Compliance`)
  console.log(`   • Dashboard Metrics`)
  console.log('\n' + '=' .repeat(60))
  console.log('Done!')
}

main().catch(console.error)
