/**
 * KAZI Comprehensive Demo Data Seeding Script
 * Seeds ALL features with realistic demo data for investor demos
 *
 * Success Story: Freelancer grows from $0 to $125K+ in 12 months
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { DEMO_USER_ID } from '../lib/utils/demo-mode'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const DEMO_USER_EMAIL = 'alex@freeflow.io'

// Helper functions
const uuid = () => crypto.randomUUID()
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
const monthsAgo = (months: number) => daysAgo(months * 30)
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

// Seed function with error handling
async function seedTable(tableName: string, data: Record<string, unknown> | Record<string, unknown>[]) {
  const records = Array.isArray(data) ? data : [data]
  const { error } = await supabase.from(tableName).upsert(records)
  if (error) {
    console.log(`  ⚠ ${tableName}: ${error.message}`)
    return false
  }
  console.log(`  ✓ ${tableName}: ${records.length} records`)
  return true
}

// ============================================================================
// CLIENT DATA
// ============================================================================
const CLIENTS = [
  { id: uuid(), name: 'TechVenture Capital', industry: 'Finance', email: 'sarah@techventure.io', contact: 'Sarah Mitchell', value: 35000, status: 'active' },
  { id: uuid(), name: 'GreenLeaf Organics', industry: 'E-commerce', email: 'marcus@greenleaf.co', contact: 'Marcus Johnson', value: 15000, status: 'active' },
  { id: uuid(), name: 'CloudSync Solutions', industry: 'SaaS', email: 'jennifer@cloudsync.io', contact: 'Jennifer Wu', value: 55000, status: 'active' },
  { id: uuid(), name: 'Urban Fitness Studio', industry: 'Health', email: 'david@urbanfitness.com', contact: 'David Park', value: 5000, status: 'active' },
  { id: uuid(), name: 'Stellar Marketing Agency', industry: 'Marketing', email: 'amanda@stellarmarketing.co', contact: 'Amanda Torres', value: 10500, status: 'active' },
  { id: uuid(), name: 'Nordic Design Co', industry: 'Design', email: 'erik@nordicdesign.io', contact: 'Erik Lindqvist', value: 8000, status: 'active' },
  { id: uuid(), name: 'DataPulse Analytics', industry: 'Technology', email: 'rachel@datapulse.ai', contact: 'Rachel Chen', value: 53000, status: 'active' },
  { id: uuid(), name: 'Bloom Education', industry: 'EdTech', email: 'michael@bloomedu.org', contact: 'Michael Brown', value: 12000, status: 'active' },
  { id: uuid(), name: 'Summit Real Estate', industry: 'Real Estate', email: 'lisa@summitrealty.com', contact: 'Lisa Anderson', value: 9500, status: 'active' },
  { id: uuid(), name: 'Nexus Innovations', industry: 'Technology', email: 'james@nexusinnovations.io', contact: 'James Wilson', value: 28000, status: 'active' },
  { id: uuid(), name: 'Artisan Coffee Roasters', industry: 'F&B', email: 'sophie@artisancoffee.co', contact: 'Sophie Martin', value: 4500, status: 'active' },
  { id: uuid(), name: 'Velocity Logistics', industry: 'Logistics', email: 'robert@velocitylogistics.com', contact: 'Robert Kim', value: 22000, status: 'active' },
]

// ============================================================================
// SEEDING FUNCTIONS BY FEATURE AREA
// ============================================================================

async function seedCRM(userId: string) {
  console.log('\n📊 Seeding CRM & Sales...')

  // CRM Contacts
  await seedTable('crm_contacts', CLIENTS.map((c, i) => ({
    id: uuid(),
    user_id: userId,
    first_name: c.contact.split(' ')[0],
    last_name: c.contact.split(' ')[1] || '',
    email: c.email,
    company: c.name,
    job_title: ['CEO', 'CTO', 'Marketing Director', 'Founder', 'VP Operations'][i % 5],
    phone: `+1555${String(1000 + i).padStart(4, '0')}`,
    status: 'active',
    lead_score: 70 + Math.floor(Math.random() * 30),
    tags: [c.industry.toLowerCase()],
    created_at: monthsAgo(12 - i),
    updated_at: daysAgo(i)
  })))

  // CRM Deals
  await seedTable('crm_deals', CLIENTS.slice(0, 8).map((c, i) => ({
    id: uuid(),
    user_id: userId,
    name: `${c.name} - ${['Website Redesign', 'Mobile App', 'Marketing Campaign', 'Brand Strategy'][i % 4]}`,
    value: c.value,
    stage: ['won', 'won', 'won', 'won', 'negotiation', 'proposal', 'qualified', 'discovery'][i],
    probability: [100, 100, 100, 100, 80, 60, 40, 20][i],
    expected_close_date: daysAgo(-30 + i * 10),
    created_at: monthsAgo(10 - i),
    updated_at: daysAgo(i * 2)
  })))

  // Clients table
  await seedTable('clients', CLIENTS.map(c => ({
    id: c.id,
    user_id: userId,
    name: c.name,
    email: c.email,
    contact_name: c.contact,
    industry: c.industry,
    status: c.status,
    total_revenue: c.value,
    created_at: monthsAgo(12),
    updated_at: daysAgo(1)
  })))
}

async function seedInvoicing(userId: string) {
  console.log('\n💰 Seeding Invoicing & Payments...')

  const invoices = CLIENTS.slice(0, 10).flatMap((c, clientIdx) =>
    Array.from({ length: Math.min(3, clientIdx + 1) }, (_, invoiceIdx) => ({
      id: uuid(),
      user_id: userId,
      client_id: c.id,
      invoice_number: `INV-2026-${String(clientIdx * 3 + invoiceIdx + 1).padStart(3, '0')}`,
      status: invoiceIdx === 0 ? 'paid' : clientIdx < 5 ? 'paid' : ['sent', 'draft'][invoiceIdx % 2],
      subtotal: c.value / (clientIdx + 1),
      tax: c.value / (clientIdx + 1) * 0.1,
      total: c.value / (clientIdx + 1) * 1.1,
      due_date: daysAgo(-30 + invoiceIdx * 15),
      paid_at: invoiceIdx === 0 || clientIdx < 5 ? daysAgo(invoiceIdx * 5) : null,
      created_at: monthsAgo(10 - clientIdx),
      updated_at: daysAgo(invoiceIdx)
    }))
  )

  await seedTable('invoices', invoices)

  // Payments
  const payments = invoices.filter(i => i.status === 'paid').map(inv => ({
    id: uuid(),
    user_id: userId,
    invoice_id: inv.id,
    amount: inv.total,
    payment_method: ['stripe', 'bank_transfer', 'paypal'][Math.floor(Math.random() * 3)],
    status: 'completed',
    paid_at: inv.paid_at,
    created_at: inv.paid_at
  }))

  await seedTable('payments', payments)
}

async function seedTimeTracking(userId: string) {
  console.log('\n⏱️ Seeding Time Tracking...')

  // Projects for time tracking
  const projects = CLIENTS.slice(0, 8).map((c, i) => ({
    id: uuid(),
    user_id: userId,
    name: `${c.name} Project`,
    client_id: c.id,
    status: i < 3 ? 'active' : 'completed',
    billable_rate: 125 + i * 10,
    budget_hours: 40 + i * 20,
    created_at: monthsAgo(10 - i),
    updated_at: daysAgo(i)
  }))

  await seedTable('time_tracking_projects', projects)

  // Time entries
  const entries = projects.flatMap((p, pIdx) =>
    Array.from({ length: 20 }, (_, i) => ({
      id: uuid(),
      user_id: userId,
      project_id: p.id,
      description: ['Development', 'Design', 'Meeting', 'Research', 'Testing'][i % 5],
      start_time: daysAgo(i + pIdx * 5),
      end_time: daysAgo(i + pIdx * 5 - 0.25),
      duration: (2 + Math.random() * 4) * 3600,
      billable: true,
      created_at: daysAgo(i + pIdx * 5)
    }))
  )

  await seedTable('time_entries', entries)
}

async function seedTeamManagement(userId: string) {
  console.log('\n👥 Seeding Team Management...')

  const teamMembers = [
    { name: 'Alex Thompson', email: 'alex@freeflow.io', role: 'owner', rate: 150 },
    { name: 'Emma Davis', email: 'emma@freeflow.io', role: 'designer', rate: 95 },
    { name: 'Marcus Chen', email: 'marcus@freeflow.io', role: 'developer', rate: 125 },
    { name: 'Sofia Rodriguez', email: 'sofia@freeflow.io', role: 'project_manager', rate: 85 },
  ].map((m, i) => ({
    id: uuid(),
    user_id: userId,
    name: m.name,
    email: m.email,
    role: m.role,
    hourly_rate: m.rate,
    status: 'active',
    hours_this_month: 120 + Math.floor(Math.random() * 40),
    projects_count: 2 + i,
    created_at: monthsAgo(12 - i * 2),
    updated_at: daysAgo(1)
  }))

  await seedTable('team_members', teamMembers)

  // Team projects
  await seedTable('team_projects', CLIENTS.slice(0, 5).map((c, i) => ({
    id: uuid(),
    user_id: userId,
    name: `${c.name} - Q1 2026`,
    description: `Full project for ${c.name}`,
    status: i < 2 ? 'active' : 'completed',
    progress: i < 2 ? 45 + i * 20 : 100,
    budget: c.value,
    spent: c.value * (i < 2 ? 0.5 : 0.92),
    deadline: daysAgo(-30 + i * 15),
    created_at: monthsAgo(8 - i),
    updated_at: daysAgo(i)
  })))
}

async function seedCalendar(userId: string) {
  console.log('\n📅 Seeding Calendar & Bookings...')

  // Calendar events
  const events = [
    { title: 'Client Call - TechVenture', type: 'meeting', start: hoursAgo(-2), duration: 60 },
    { title: 'Design Review', type: 'meeting', start: hoursAgo(-26), duration: 45 },
    { title: 'Sprint Planning', type: 'meeting', start: hoursAgo(-50), duration: 90 },
    { title: 'Project Deadline - CloudSync', type: 'deadline', start: hoursAgo(-72), duration: 0 },
    { title: 'Weekly Team Sync', type: 'meeting', start: hoursAgo(-168), duration: 30 },
    { title: 'Client Presentation', type: 'meeting', start: hoursAgo(24), duration: 60 },
    { title: 'Code Review Session', type: 'meeting', start: hoursAgo(48), duration: 45 },
  ].map(e => ({
    id: uuid(),
    user_id: userId,
    title: e.title,
    event_type: e.type,
    start_time: e.start,
    end_time: new Date(new Date(e.start).getTime() + e.duration * 60000).toISOString(),
    all_day: false,
    created_at: monthsAgo(1)
  }))

  await seedTable('calendar_events', events)

  // Bookings
  await seedTable('bookings', Array.from({ length: 8 }, (_, i) => ({
    id: uuid(),
    user_id: userId,
    client_name: CLIENTS[i % CLIENTS.length].contact,
    client_email: CLIENTS[i % CLIENTS.length].email,
    service_type: ['consultation', 'strategy_session', 'project_kickoff', 'review'][i % 4],
    status: i < 3 ? 'completed' : i < 6 ? 'confirmed' : 'pending',
    scheduled_at: daysAgo(i < 3 ? i * 7 : -7 - i * 3),
    duration: 30 + (i % 3) * 15,
    notes: `Booking with ${CLIENTS[i % CLIENTS.length].name}`,
    created_at: monthsAgo(2)
  })))
}

async function seedDocuments(userId: string) {
  console.log('\n📄 Seeding Documents & Files...')

  await seedTable('documents', [
    { name: 'Master Services Agreement', type: 'contract', status: 'active', size: 245000 },
    { name: 'Project Proposal Template', type: 'template', status: 'active', size: 128000 },
    { name: 'Q1 2026 Financial Report', type: 'report', status: 'final', size: 892000 },
    { name: 'Brand Guidelines - CloudSync', type: 'deliverable', status: 'delivered', size: 4500000 },
    { name: 'Client Onboarding Checklist', type: 'template', status: 'active', size: 56000 },
    { name: 'NDA Template', type: 'contract', status: 'active', size: 145000 },
    { name: 'Invoice Archive 2025', type: 'archive', status: 'archived', size: 12000000 },
    { name: 'Project Requirements - Nexus', type: 'spec', status: 'draft', size: 340000 },
  ].map((d, i) => ({
    id: uuid(),
    user_id: userId,
    name: d.name,
    document_type: d.type,
    status: d.status,
    file_size: d.size,
    file_type: 'application/pdf',
    version: 1,
    downloads: Math.floor(Math.random() * 20),
    created_at: monthsAgo(12 - i),
    updated_at: daysAgo(i * 3)
  })))
}

async function seedNotifications(userId: string) {
  console.log('\n🔔 Seeding Notifications...')

  await seedTable('notifications', [
    { title: 'Payment Received', message: '$17,500 received from DataPulse Analytics', type: 'payment', priority: 'high' },
    { title: 'New Lead', message: 'Thomas Wright from Horizon Tech submitted inquiry', type: 'lead', priority: 'high' },
    { title: 'Project Milestone', message: 'AI Dashboard Phase 2 completed', type: 'project', priority: 'normal' },
    { title: 'Meeting Reminder', message: 'Client call with TechVenture in 30 minutes', type: 'reminder', priority: 'normal' },
    { title: 'Invoice Overdue', message: 'INV-2026-008 is 5 days overdue', type: 'alert', priority: 'high' },
    { title: 'New Review', message: '5-star review from CloudSync Solutions', type: 'review', priority: 'normal' },
    { title: 'Task Assigned', message: 'New task: Design homepage mockup', type: 'task', priority: 'normal' },
    { title: 'Weekly Report', message: 'Your weekly analytics report is ready', type: 'report', priority: 'low' },
  ].map((n, i) => ({
    id: uuid(),
    user_id: userId,
    title: n.title,
    message: n.message,
    notification_type: n.type,
    priority: n.priority,
    is_read: i > 3,
    created_at: hoursAgo(i * 4)
  })))
}

async function seedAIFeatures(userId: string) {
  console.log('\n🤖 Seeding AI Features...')

  // AI Conversations
  const conversationId = uuid()
  await seedTable('ai_conversations', {
    id: conversationId,
    user_id: userId,
    title: 'Project Planning Assistant',
    model: 'claude-3-opus',
    message_count: 12,
    total_tokens: 4500,
    created_at: daysAgo(7),
    updated_at: hoursAgo(2)
  })

  // AI Messages
  await seedTable('ai_messages', [
    { role: 'user', content: 'Help me plan the timeline for the CloudSync mobile app project' },
    { role: 'assistant', content: 'Based on the project scope, I recommend a 12-week timeline...' },
    { role: 'user', content: 'What about resource allocation?' },
    { role: 'assistant', content: 'For optimal efficiency, I suggest allocating 2 developers full-time...' },
  ].map((m, i) => ({
    id: uuid(),
    conversation_id: conversationId,
    role: m.role,
    content: m.content,
    tokens: 200 + Math.floor(Math.random() * 300),
    created_at: hoursAgo(48 - i * 2)
  })))

  // AI Generated Assets
  await seedTable('ai_generated_assets', [
    { name: 'CloudSync Logo Concepts', type: 'image', status: 'completed', downloads: 5 },
    { name: 'Marketing Copy - Q1 Campaign', type: 'text', status: 'completed', downloads: 3 },
    { name: 'Product Description Generator', type: 'text', status: 'completed', downloads: 8 },
    { name: 'Social Media Graphics Pack', type: 'image', status: 'completed', downloads: 12 },
  ].map((a, i) => ({
    id: uuid(),
    user_id: userId,
    name: a.name,
    asset_type: a.type,
    status: a.status,
    download_count: a.downloads,
    created_at: monthsAgo(6 - i),
    updated_at: daysAgo(i * 5)
  })))
}

async function seedAnalytics(userId: string) {
  console.log('\n📈 Seeding Analytics & Reports...')

  // Performance metrics
  await seedTable('performance_metrics', Array.from({ length: 30 }, (_, i) => ({
    id: uuid(),
    user_id: userId,
    metric_type: ['revenue', 'projects', 'clients', 'hours'][i % 4],
    value: 1000 + Math.floor(Math.random() * 5000),
    date: daysAgo(i),
    created_at: daysAgo(i)
  })))

  // Business metrics
  await seedTable('business_metrics', {
    id: uuid(),
    user_id: userId,
    total_revenue: 125000,
    total_clients: 12,
    active_projects: 3,
    completed_projects: 9,
    avg_project_value: 14500,
    client_satisfaction: 4.8,
    on_time_delivery: 94,
    billable_hours: 1650,
    period: 'yearly',
    year: 2026,
    created_at: daysAgo(1)
  })

  // Revenue forecasts
  await seedTable('revenue_forecasts', Array.from({ length: 6 }, (_, i) => ({
    id: uuid(),
    user_id: userId,
    period: `2026-${String(i + 1).padStart(2, '0')}`,
    projected_revenue: 12000 + i * 2000,
    actual_revenue: i < 2 ? 13000 + i * 2500 : null,
    confidence: 85 - i * 5,
    created_at: monthsAgo(6 - i)
  })))
}

async function seedExpenses(userId: string) {
  console.log('\n💳 Seeding Expenses...')

  await seedTable('expenses', [
    { description: 'Adobe Creative Cloud', category: 'software', amount: 599.88, recurring: true },
    { description: 'Figma Pro', category: 'software', amount: 180, recurring: true },
    { description: 'AWS Hosting', category: 'infrastructure', amount: 245.50, recurring: true },
    { description: 'WeWork Membership', category: 'office', amount: 450, recurring: true },
    { description: 'MacBook Pro M3', category: 'equipment', amount: 3499, recurring: false },
    { description: 'Ergonomic Chair', category: 'equipment', amount: 899, recurring: false },
    { description: 'Client Lunch - TechVenture', category: 'meals', amount: 125.40, recurring: false },
    { description: 'Conference Ticket - TechCrunch', category: 'professional_development', amount: 799, recurring: false },
  ].map((e, i) => ({
    id: uuid(),
    user_id: userId,
    description: e.description,
    category: e.category,
    amount: e.amount,
    is_recurring: e.recurring,
    status: 'approved',
    date: daysAgo(i * 5),
    created_at: daysAgo(i * 5)
  })))
}

async function seedWorkflows(userId: string) {
  console.log('\n⚡ Seeding Workflows & Automation...')

  await seedTable('workflow_templates', [
    { name: 'New Client Onboarding', trigger: 'client_created', steps: 5, enabled: true },
    { name: 'Invoice Reminder', trigger: 'invoice_overdue', steps: 3, enabled: true },
    { name: 'Project Completion', trigger: 'project_completed', steps: 4, enabled: true },
    { name: 'Weekly Report Generation', trigger: 'schedule_weekly', steps: 2, enabled: true },
    { name: 'Lead Follow-up', trigger: 'lead_created', steps: 3, enabled: true },
  ].map((w, i) => ({
    id: uuid(),
    user_id: userId,
    name: w.name,
    trigger_type: w.trigger,
    step_count: w.steps,
    is_enabled: w.enabled,
    run_count: 10 + i * 5,
    last_run_at: daysAgo(i),
    created_at: monthsAgo(8)
  })))
}

async function seedCommunity(userId: string) {
  console.log('\n🌐 Seeding Community...')

  // Community posts
  await seedTable('community_posts', [
    { title: 'How I grew my freelance business 10x in 12 months', type: 'story', likes: 142, comments: 28 },
    { title: 'Best practices for client communication', type: 'tip', likes: 89, comments: 15 },
    { title: 'Looking for React developer collaborator', type: 'collaboration', likes: 34, comments: 12 },
    { title: 'Free invoice template I created', type: 'resource', likes: 256, comments: 41 },
  ].map((p, i) => ({
    id: uuid(),
    user_id: userId,
    title: p.title,
    post_type: p.type,
    like_count: p.likes,
    comment_count: p.comments,
    status: 'published',
    created_at: monthsAgo(6 - i),
    updated_at: daysAgo(i * 7)
  })))
}

async function seedMilestones(userId: string) {
  console.log('\n🎯 Seeding Milestones & Goals...')

  await seedTable('milestones', [
    { name: 'First $10K Month', target: 10000, achieved: 12500, status: 'achieved', date: monthsAgo(8) },
    { name: 'Sign 10 Clients', target: 10, achieved: 12, status: 'achieved', date: monthsAgo(5) },
    { name: 'Launch Portfolio Site', target: 1, achieved: 1, status: 'achieved', date: monthsAgo(10) },
    { name: '$100K Total Revenue', target: 100000, achieved: 125000, status: 'achieved', date: monthsAgo(2) },
    { name: 'Hire First Team Member', target: 1, achieved: 1, status: 'achieved', date: monthsAgo(4) },
    { name: '$150K Annual Revenue', target: 150000, achieved: 125000, status: 'in_progress', date: daysAgo(-60) },
    { name: '5 Enterprise Clients', target: 5, achieved: 4, status: 'in_progress', date: daysAgo(-45) },
  ].map(m => ({
    id: uuid(),
    user_id: userId,
    name: m.name,
    target_value: m.target,
    achieved_value: m.achieved,
    status: m.status,
    target_date: m.date,
    created_at: monthsAgo(12),
    updated_at: daysAgo(1)
  })))
}

async function seedAnnouncements(userId: string) {
  console.log('\n📢 Seeding Announcements...')

  await seedTable('announcements', [
    { title: 'New AI Features Released', type: 'feature', priority: 'high', status: 'active' },
    { title: 'Scheduled Maintenance - Feb 15', type: 'maintenance', priority: 'normal', status: 'scheduled' },
    { title: 'Referral Program Launch', type: 'promotion', priority: 'high', status: 'active' },
    { title: 'Security Update Complete', type: 'security', priority: 'normal', status: 'completed' },
  ].map((a, i) => ({
    id: uuid(),
    user_id: userId,
    title: a.title,
    content: `Details about: ${a.title}`,
    announcement_type: a.type,
    priority: a.priority,
    status: a.status,
    publish_at: daysAgo(i * 7),
    created_at: daysAgo(i * 7 + 1)
  })))
}

async function seedCompliance(userId: string) {
  console.log('\n🔒 Seeding Compliance...')

  await seedTable('compliance', [
    { requirement: 'GDPR Data Protection', status: 'compliant', last_audit: daysAgo(30) },
    { requirement: 'SOC 2 Type II', status: 'compliant', last_audit: daysAgo(60) },
    { requirement: 'ISO 27001', status: 'in_progress', last_audit: daysAgo(90) },
    { requirement: 'CCPA Compliance', status: 'compliant', last_audit: daysAgo(45) },
    { requirement: 'PCI DSS', status: 'compliant', last_audit: daysAgo(75) },
  ].map((c, i) => ({
    id: uuid(),
    user_id: userId,
    requirement: c.requirement,
    status: c.status,
    last_audit_date: c.last_audit,
    next_audit_date: daysAgo(-180 + i * 30),
    compliance_score: c.status === 'compliant' ? 95 + Math.floor(Math.random() * 5) : 75,
    created_at: monthsAgo(12)
  })))
}

async function seedMaintenance(userId: string) {
  console.log('\n🔧 Seeding Maintenance...')

  await seedTable('maintenance', [
    { title: 'Database Optimization', type: 'scheduled', status: 'completed', impact: 'low' },
    { title: 'Security Patch Update', type: 'security', status: 'completed', impact: 'medium' },
    { title: 'API Version Upgrade', type: 'scheduled', status: 'scheduled', impact: 'high' },
    { title: 'Storage Migration', type: 'scheduled', status: 'in_progress', impact: 'medium' },
  ].map((m, i) => ({
    id: uuid(),
    user_id: userId,
    title: m.title,
    maintenance_type: m.type,
    status: m.status,
    impact_level: m.impact,
    scheduled_start: daysAgo(i < 2 ? i * 14 : -7 - i * 7),
    scheduled_end: daysAgo(i < 2 ? i * 14 - 0.25 : -7 - i * 7 - 0.25),
    created_at: daysAgo(i * 14 + 7)
  })))
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('🚀 KAZI Comprehensive Demo Data Seeding')
  console.log('=' .repeat(50))

  const userId = DEMO_USER_ID
  console.log(`\nSeeding data for: ${DEMO_USER_EMAIL} (${userId})`)

  // Seed all feature areas
  await seedCRM(userId)
  await seedInvoicing(userId)
  await seedTimeTracking(userId)
  await seedTeamManagement(userId)
  await seedCalendar(userId)
  await seedDocuments(userId)
  await seedNotifications(userId)
  await seedAIFeatures(userId)
  await seedAnalytics(userId)
  await seedExpenses(userId)
  await seedWorkflows(userId)
  await seedCommunity(userId)
  await seedMilestones(userId)
  await seedAnnouncements(userId)
  await seedCompliance(userId)
  await seedMaintenance(userId)

  console.log('\n' + '=' .repeat(50))
  console.log('✅ Comprehensive demo data seeding complete!')
  console.log('\n📊 SUCCESS STORY METRICS:')
  console.log('   • Total Revenue: $125,000+')
  console.log('   • Active Clients: 12')
  console.log('   • Projects Completed: 9')
  console.log('   • Team Members: 4')
  console.log('   • AI Conversations: Active')
  console.log('   • Workflows: 5 automated')
  console.log('   • Documents: 8 templates/files')
  console.log('   • Compliance: 5/5 requirements')
}

main().catch(console.error)
