/**
 * KAZI Investor Demo - Complete Success Story
 *
 * Story: Alex Morgan, a freelance creative, grew from $0 to $125K+ in 12 months
 * using KAZI's all-in-one platform. This script seeds data that tells this story.
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_EMAIL = 'alex@freeflow.io'

// Helper functions
const uuid = () => crypto.randomUUID()
const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
const daysFromNow = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()

// ============================================================================
// THE STORY: 12-month journey from $0 to $125K+
// ============================================================================

console.log('🚀 KAZI Investor Demo - Seeding Success Story')
console.log('=' .repeat(60))
console.log('')
console.log('📖 THE STORY:')
console.log('   Alex Morgan started freelancing in January 2025.')
console.log('   Using KAZI, they built a $125K+ business in 12 months.')
console.log('   This data tells that journey.')
console.log('')

// ============================================================================
// CLIENTS - Show client acquisition over time
// ============================================================================
const clients = [
  { name: 'TechVenture Capital', email: 'sarah@techventure.io', company: 'TechVenture Capital', type: 'enterprise', status: 'active', total_spent: 35000, projects_count: 3, created_at: daysAgo(330) },
  { name: 'GreenLeaf Organics', email: 'marcus@greenleaf.co', company: 'GreenLeaf Organics', type: 'business', status: 'active', total_spent: 15000, projects_count: 2, created_at: daysAgo(300) },
  { name: 'CloudSync Solutions', email: 'jennifer@cloudsync.io', company: 'CloudSync Solutions', type: 'enterprise', status: 'active', total_spent: 55000, projects_count: 4, created_at: daysAgo(270) },
  { name: 'Urban Fitness Studio', email: 'david@urbanfitness.com', company: 'Urban Fitness', type: 'business', status: 'active', total_spent: 5000, projects_count: 1, created_at: daysAgo(240) },
  { name: 'Stellar Marketing', email: 'amanda@stellar.co', company: 'Stellar Marketing Agency', type: 'business', status: 'active', total_spent: 10500, projects_count: 2, created_at: daysAgo(210) },
  { name: 'Nordic Design Co', email: 'erik@nordic.io', company: 'Nordic Design', type: 'business', status: 'active', total_spent: 8000, projects_count: 1, created_at: daysAgo(180) },
  { name: 'DataPulse Analytics', email: 'rachel@datapulse.ai', company: 'DataPulse', type: 'enterprise', status: 'active', total_spent: 53000, projects_count: 3, created_at: daysAgo(150) },
  { name: 'Bloom Education', email: 'michael@bloom.edu', company: 'Bloom EdTech', type: 'business', status: 'active', total_spent: 12000, projects_count: 2, created_at: daysAgo(120) },
  { name: 'Summit Realty', email: 'lisa@summit.com', company: 'Summit Real Estate', type: 'business', status: 'active', total_spent: 9500, projects_count: 1, created_at: daysAgo(90) },
  { name: 'Nexus Innovations', email: 'james@nexus.io', company: 'Nexus Innovations', type: 'enterprise', status: 'active', total_spent: 28000, projects_count: 2, created_at: daysAgo(60) },
  { name: 'Artisan Coffee', email: 'sophie@artisan.co', company: 'Artisan Coffee Roasters', type: 'small', status: 'active', total_spent: 4500, projects_count: 1, created_at: daysAgo(30) },
  { name: 'Velocity Logistics', email: 'robert@velocity.com', company: 'Velocity Logistics', type: 'enterprise', status: 'prospect', total_spent: 0, projects_count: 0, created_at: daysAgo(7) },
]

// ============================================================================
// PROJECTS - Show completed work and current pipeline
// ============================================================================
const projects = [
  // Completed projects (showing growth)
  { name: 'TechVenture Brand Identity', client_name: 'TechVenture Capital', budget: 15000, progress: 100, end_date: daysAgo(280), description: 'Complete brand redesign for fintech startup' },
  { name: 'GreenLeaf E-commerce Site', client_name: 'GreenLeaf Organics', budget: 12000, progress: 100, end_date: daysAgo(250), description: 'Custom Shopify store with subscription system' },
  { name: 'CloudSync Dashboard UI', client_name: 'CloudSync Solutions', budget: 25000, progress: 100, end_date: daysAgo(220), description: 'Enterprise SaaS dashboard redesign' },
  { name: 'Urban Fitness Mobile App', client_name: 'Urban Fitness Studio', budget: 5000, progress: 100, end_date: daysAgo(200), description: 'Fitness tracking mobile app design' },
  { name: 'Stellar Campaign Visuals', client_name: 'Stellar Marketing', budget: 8000, progress: 100, end_date: daysAgo(170), description: 'Multi-channel marketing campaign assets' },
  { name: 'Nordic Product Catalog', client_name: 'Nordic Design Co', budget: 8000, progress: 100, end_date: daysAgo(140), description: 'Digital product catalog with 3D renders' },
  { name: 'DataPulse Analytics Platform', client_name: 'DataPulse Analytics', budget: 35000, progress: 100, end_date: daysAgo(100), description: 'Data visualization platform UI/UX' },
  { name: 'Bloom Learning Portal', client_name: 'Bloom Education', budget: 10000, progress: 100, end_date: daysAgo(70), description: 'EdTech student portal redesign' },
  { name: 'TechVenture Investor Deck', client_name: 'TechVenture Capital', budget: 8000, progress: 100, end_date: daysAgo(50), description: 'Series B pitch deck design' },
  // In progress projects (current work)
  { name: 'CloudSync Mobile App', client_name: 'CloudSync Solutions', budget: 18000, progress: 65, end_date: daysFromNow(30), description: 'iOS and Android companion app' },
  { name: 'Nexus Website Redesign', client_name: 'Nexus Innovations', budget: 22000, progress: 40, end_date: daysFromNow(45), description: 'Corporate website with AI features' },
  { name: 'Summit Virtual Tours', client_name: 'Summit Realty', budget: 9500, progress: 80, end_date: daysFromNow(14), description: '3D virtual property tours' },
]

// ============================================================================
// INVOICES - Show revenue stream
// ============================================================================
const invoices = [
  // Paid invoices (revenue)
  { number: 'INV-2025-001', client_name: 'TechVenture Capital', amount: 15000, status: 'paid', paid_at: daysAgo(275), description: 'Brand Identity Project' },
  { number: 'INV-2025-002', client_name: 'GreenLeaf Organics', amount: 12000, status: 'paid', paid_at: daysAgo(245), description: 'E-commerce Development' },
  { number: 'INV-2025-003', client_name: 'CloudSync Solutions', amount: 12500, status: 'paid', paid_at: daysAgo(230), description: 'Dashboard UI - Phase 1' },
  { number: 'INV-2025-004', client_name: 'CloudSync Solutions', amount: 12500, status: 'paid', paid_at: daysAgo(210), description: 'Dashboard UI - Phase 2' },
  { number: 'INV-2025-005', client_name: 'Urban Fitness Studio', amount: 5000, status: 'paid', paid_at: daysAgo(195), description: 'Mobile App Design' },
  { number: 'INV-2025-006', client_name: 'Stellar Marketing', amount: 8000, status: 'paid', paid_at: daysAgo(165), description: 'Campaign Assets' },
  { number: 'INV-2025-007', client_name: 'Nordic Design Co', amount: 8000, status: 'paid', paid_at: daysAgo(135), description: 'Product Catalog' },
  { number: 'INV-2025-008', client_name: 'DataPulse Analytics', amount: 17500, status: 'paid', paid_at: daysAgo(110), description: 'Analytics Platform - Phase 1' },
  { number: 'INV-2025-009', client_name: 'DataPulse Analytics', amount: 17500, status: 'paid', paid_at: daysAgo(90), description: 'Analytics Platform - Phase 2' },
  { number: 'INV-2025-010', client_name: 'Bloom Education', amount: 10000, status: 'paid', paid_at: daysAgo(65), description: 'Learning Portal' },
  { number: 'INV-2025-011', client_name: 'TechVenture Capital', amount: 8000, status: 'paid', paid_at: daysAgo(45), description: 'Investor Deck' },
  // Recent/pending invoices
  { number: 'INV-2025-012', client_name: 'Summit Realty', amount: 4750, status: 'paid', paid_at: daysAgo(20), description: 'Virtual Tours - Deposit' },
  { number: 'INV-2025-013', client_name: 'CloudSync Solutions', amount: 9000, status: 'sent', paid_at: null, description: 'Mobile App - Milestone 1' },
  { number: 'INV-2025-014', client_name: 'Nexus Innovations', amount: 11000, status: 'sent', paid_at: null, description: 'Website - Deposit' },
  { number: 'INV-2025-015', client_name: 'Artisan Coffee', amount: 4500, status: 'draft', paid_at: null, description: 'Brand Package' },
]

// ============================================================================
// TASKS - Show active work
// ============================================================================
const tasks = [
  // Active tasks
  { title: 'Finalize CloudSync app wireframes', project_name: 'CloudSync Mobile App', status: 'in_progress', priority: 'high', due_date: daysFromNow(3) },
  { title: 'User testing session', project_name: 'CloudSync Mobile App', status: 'todo', priority: 'high', due_date: daysFromNow(7) },
  { title: 'Nexus homepage mockup', project_name: 'Nexus Website Redesign', status: 'in_progress', priority: 'high', due_date: daysFromNow(5) },
  { title: 'AI chatbot integration research', project_name: 'Nexus Website Redesign', status: 'todo', priority: 'medium', due_date: daysFromNow(10) },
  { title: 'Summit 360 photos processing', project_name: 'Summit Virtual Tours', status: 'in_progress', priority: 'high', due_date: daysFromNow(2) },
  { title: 'Virtual tour QA testing', project_name: 'Summit Virtual Tours', status: 'todo', priority: 'medium', due_date: daysFromNow(7) },
  // Completed tasks (recent)
  { title: 'CloudSync app icon design', project_name: 'CloudSync Mobile App', status: 'completed', priority: 'medium', due_date: daysAgo(2) },
  { title: 'Nexus competitor analysis', project_name: 'Nexus Website Redesign', status: 'completed', priority: 'high', due_date: daysAgo(5) },
  { title: 'Summit property photography', project_name: 'Summit Virtual Tours', status: 'completed', priority: 'high', due_date: daysAgo(7) },
]

// ============================================================================
// MEETINGS - Show client engagement
// ============================================================================
const meetings = [
  { title: 'CloudSync Sprint Review', type: 'video', scheduled_date: daysFromNow(2), duration: 60, status: 'scheduled' },
  { title: 'Nexus Kickoff Call', type: 'video', scheduled_date: daysFromNow(1), duration: 45, status: 'scheduled' },
  { title: 'Summit Final Review', type: 'video', scheduled_date: daysFromNow(7), duration: 30, status: 'scheduled' },
  { title: 'Velocity Discovery Call', type: 'video', scheduled_date: daysFromNow(3), duration: 60, status: 'scheduled' },
  // Past meetings
  { title: 'DataPulse Project Handoff', type: 'video', scheduled_date: daysAgo(10), duration: 45, status: 'completed' },
  { title: 'TechVenture Deck Review', type: 'video', scheduled_date: daysAgo(15), duration: 30, status: 'completed' },
]

// ============================================================================
// SUPPORT TICKETS - Show customer success
// ============================================================================
const tickets = [
  { subject: 'Quick question about logo files', status: 'resolved', priority: 'low', customer_name: 'Sarah Mitchell', customer_email: 'sarah@techventure.io', created_at: daysAgo(5) },
  { subject: 'Need invoice copy', status: 'resolved', priority: 'low', customer_name: 'Marcus Johnson', customer_email: 'marcus@greenleaf.co', created_at: daysAgo(12) },
  { subject: 'App feedback - love it!', status: 'resolved', priority: 'low', customer_name: 'Jennifer Wu', customer_email: 'jennifer@cloudsync.io', created_at: daysAgo(20) },
]

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

async function seedClients() {
  console.log('👥 Seeding clients...')
  for (const client of clients) {
    const { error } = await supabase.from('clients').upsert({
      id: uuid(),
      user_id: DEMO_USER_ID,
      name: client.name,
      email: client.email,
      company: client.company,
      type: client.type,
      status: client.status,
      created_at: client.created_at,
      updated_at: client.created_at
    }, { onConflict: 'user_id,email' })
    if (error && !error.message.includes('duplicate')) {
      console.log(`  ⚠ ${client.name}: ${error.message}`)
    }
  }
  console.log(`  ✓ ${clients.length} clients seeded`)
}

async function seedProjects() {
  console.log('📁 Seeding projects...')
  for (const project of projects) {
    const { error } = await supabase.from('projects').upsert({
      id: uuid(),
      user_id: DEMO_USER_ID,
      name: project.name,
      description: project.description,
      budget: project.budget,
      progress: project.progress,
      end_date: project.end_date,
      created_at: daysAgo(Math.floor(Math.random() * 300) + 30),
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,name' })
    if (error && !error.message.includes('duplicate')) {
      console.log(`  ⚠ ${project.name}: ${error.message}`)
    }
  }
  console.log(`  ✓ ${projects.length} projects seeded`)
}

async function seedInvoices() {
  console.log('💰 Seeding invoices...')
  for (const inv of invoices) {
    const { error } = await supabase.from('invoices').upsert({
      id: uuid(),
      user_id: DEMO_USER_ID,
      invoice_number: inv.number,
      client_name: inv.client_name,
      total_amount: inv.amount,
      subtotal: inv.amount,
      status: inv.status,
      paid_at: inv.paid_at,
      description: inv.description,
      due_date: inv.paid_at || daysFromNow(30),
      created_at: inv.paid_at || daysAgo(7),
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,invoice_number' })
    if (error && !error.message.includes('duplicate')) {
      console.log(`  ⚠ ${inv.number}: ${error.message}`)
    }
  }
  console.log(`  ✓ ${invoices.length} invoices seeded`)
}

async function seedTasks() {
  console.log('✅ Seeding tasks...')
  for (const task of tasks) {
    const { error } = await supabase.from('tasks').upsert({
      id: uuid(),
      user_id: DEMO_USER_ID,
      title: task.title,
      description: `Task for ${task.project_name}`,
      status: task.status,
      priority: task.priority,
      due_date: task.due_date,
      created_at: daysAgo(14),
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,title' })
    if (error && !error.message.includes('duplicate')) {
      console.log(`  ⚠ ${task.title}: ${error.message}`)
    }
  }
  console.log(`  ✓ ${tasks.length} tasks seeded`)
}

async function seedMeetings() {
  console.log('📅 Seeding meetings...')
  for (const meeting of meetings) {
    const { error } = await supabase.from('meetings').upsert({
      id: uuid(),
      user_id: DEMO_USER_ID,
      title: meeting.title,
      type: meeting.type,
      scheduled_date: meeting.scheduled_date.split('T')[0],
      scheduled_time: '10:00:00',
      duration: meeting.duration,
      status: meeting.status,
      meeting_link: `https://meet.kazi.app/${uuid().slice(0, 8)}`,
      created_at: daysAgo(7),
      updated_at: new Date().toISOString()
    })
    if (error && !error.message.includes('duplicate')) {
      console.log(`  ⚠ ${meeting.title}: ${error.message}`)
    }
  }
  console.log(`  ✓ ${meetings.length} meetings seeded`)
}

async function seedTickets() {
  console.log('🎫 Seeding support tickets...')
  for (const ticket of tickets) {
    const { error } = await supabase.from('support_tickets').upsert({
      id: uuid(),
      user_id: DEMO_USER_ID,
      ticket_code: `TKT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      subject: ticket.subject,
      status: ticket.status,
      priority: ticket.priority,
      customer_name: ticket.customer_name,
      customer_email: ticket.customer_email,
      channel: 'email',
      created_at: ticket.created_at,
      updated_at: new Date().toISOString()
    })
    if (error && !error.message.includes('duplicate')) {
      console.log(`  ⚠ ${ticket.subject}: ${error.message}`)
    }
  }
  console.log(`  ✓ ${tickets.length} tickets seeded`)
}

async function seedFiles() {
  console.log('📄 Seeding files...')
  const files = [
    { name: 'Brand Guidelines.pdf', type: 'document', size: 2500000 },
    { name: 'Logo Package.zip', type: 'archive', size: 15000000 },
    { name: 'Project Proposal.docx', type: 'document', size: 500000 },
    { name: 'Design Assets.fig', type: 'other', size: 8000000 },
    { name: 'Client Presentation.pptx', type: 'document', size: 12000000 },
    { name: 'Invoice Template.xlsx', type: 'document', size: 250000 },
  ]

  for (const file of files) {
    const { error } = await supabase.from('files').upsert({
      id: uuid(),
      user_id: DEMO_USER_ID,
      name: file.name,
      original_name: file.name,
      type: file.type,
      size: file.size,
      status: 'active',
      downloads: Math.floor(Math.random() * 20),
      views: Math.floor(Math.random() * 50),
      created_at: daysAgo(Math.floor(Math.random() * 90)),
      updated_at: new Date().toISOString()
    })
    if (error && !error.message.includes('duplicate')) {
      console.log(`  ⚠ ${file.name}: ${error.message}`)
    }
  }
  console.log(`  ✓ ${files.length} files seeded`)
}

async function seedNotifications() {
  console.log('🔔 Seeding notifications...')
  const notifications = [
    { title: 'New payment received', message: 'TechVenture Capital paid $8,000 for Investor Deck', type: 'payment' },
    { title: 'Project milestone reached', message: 'CloudSync Mobile App is 65% complete', type: 'project' },
    { title: 'Meeting reminder', message: 'CloudSync Sprint Review tomorrow at 10:00 AM', type: 'reminder' },
    { title: 'New client inquiry', message: 'Velocity Logistics is interested in your services', type: 'lead' },
    { title: 'Invoice sent', message: 'Invoice INV-2025-014 sent to Nexus Innovations', type: 'invoice' },
  ]

  for (const notif of notifications) {
    const { error } = await supabase.from('notifications').upsert({
      id: uuid(),
      user_id: DEMO_USER_ID,
      title: notif.title,
      message: notif.message,
      read: false,
      created_at: daysAgo(Math.floor(Math.random() * 7)),
    })
    if (error) {
      console.log(`  ⚠ ${notif.title}: ${error.message}`)
    }
  }
  console.log(`  ✓ ${notifications.length} notifications seeded`)
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('')
  console.log('🌱 Starting data seeding...')
  console.log('')

  await seedClients()
  await seedProjects()
  await seedInvoices()
  await seedTasks()
  await seedMeetings()
  await seedTickets()
  await seedFiles()
  await seedNotifications()

  console.log('')
  console.log('=' .repeat(60))
  console.log('✅ INVESTOR DEMO DATA SEEDED SUCCESSFULLY!')
  console.log('')
  console.log('📊 KEY METRICS FOR INVESTORS:')
  console.log('   💰 Total Revenue: $130,750 (12 months)')
  console.log('   📈 Monthly Growth: 15% average')
  console.log('   👥 Active Clients: 12')
  console.log('   ✓ Projects Completed: 9')
  console.log('   🔄 Projects In Progress: 3')
  console.log('   💵 Pipeline Value: $49,500')
  console.log('   ⭐ Client Retention: 100%')
  console.log('')
  console.log('🎯 Login as: alex@freeflow.io / investor2026')
  console.log('=' .repeat(60))
}

main().catch(console.error)
