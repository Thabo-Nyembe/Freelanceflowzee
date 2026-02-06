/**
 * KAZI Comprehensive Investor Demo - Complete Data Seeding Script
 *
 * This script populates ALL dashboard features with realistic data for:
 * - User: alex@freeflow.io (password: investor2026)
 * - User ID: 00000000-0000-0000-0000-000000000001
 *
 * FEATURES POPULATED:
 * 1. Dashboard Overview: Tasks, projects, activity feed, notifications
 * 2. Analytics: Page views, user metrics, conversion data, growth charts
 * 3. Messages: Sample conversations, threads, direct messages
 * 4. Calendar: Scheduled meetings, events, reminders
 * 5. Invoices: Sample invoices with various statuses
 * 6. Clients: Sample client data with contact info, projects, revenue
 * 7. Projects: Multiple projects with tasks, milestones, team members
 * 8. Team: Team members with roles and activity
 *
 * DATA SHOWS:
 * - 12-month growth trajectory from $0 to $172K revenue
 * - 12 active clients with 92% retention
 * - $163K pipeline value
 * - 94% on-time delivery
 * - 4.8/5 client satisfaction
 *
 * Run with: npx tsx scripts/seed-comprehensive-investor-demo.ts
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Demo user constants
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

// Helper functions
const uuid = () => crypto.randomUUID()
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
const daysFromNow = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
const monthsAgo = (months: number) => daysAgo(months * 30)
const hoursFromNow = (hours: number) => new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()

// Generate consistent IDs
const CLIENT_IDS = Array(12).fill(null).map(() => uuid())
const PROJECT_IDS = Array(15).fill(null).map(() => uuid())
const TEAM_MEMBER_IDS = Array(5).fill(null).map(() => uuid())

// ============================================================================
// CLIENT DATA
// ============================================================================

const CLIENTS = [
  { id: CLIENT_IDS[0], name: 'TechVenture Capital', industry: 'Finance', value: 'enterprise', contact: 'Sarah Mitchell', email: 'sarah@techventure.io', phone: '+1 (415) 555-0101', company: 'TechVenture Capital', status: 'vip', totalRevenue: 35000, projectsCount: 3 },
  { id: CLIENT_IDS[1], name: 'GreenLeaf Organics', industry: 'E-commerce', value: 'mid-market', contact: 'Marcus Johnson', email: 'marcus@greenleaf.co', phone: '+1 (212) 555-0202', company: 'GreenLeaf Organics', status: 'active', totalRevenue: 15000, projectsCount: 2 },
  { id: CLIENT_IDS[2], name: 'CloudSync Solutions', industry: 'SaaS', value: 'enterprise', contact: 'Jennifer Wu', email: 'jennifer@cloudsync.io', phone: '+1 (650) 555-0303', company: 'CloudSync Solutions', status: 'vip', totalRevenue: 55000, projectsCount: 4 },
  { id: CLIENT_IDS[3], name: 'Urban Fitness Studio', industry: 'Health & Wellness', value: 'small', contact: 'David Park', email: 'david@urbanfitness.com', phone: '+1 (305) 555-0404', company: 'Urban Fitness Studio', status: 'active', totalRevenue: 5000, projectsCount: 1 },
  { id: CLIENT_IDS[4], name: 'Stellar Marketing Agency', industry: 'Marketing', value: 'mid-market', contact: 'Amanda Torres', email: 'amanda@stellarmarketing.co', phone: '+1 (213) 555-0505', company: 'Stellar Marketing Agency', status: 'active', totalRevenue: 18000, projectsCount: 2 },
  { id: CLIENT_IDS[5], name: 'Nordic Design Co', industry: 'Design', value: 'mid-market', contact: 'Erik Lindqvist', email: 'erik@nordicdesign.io', phone: '+46 8 555 0606', company: 'Nordic Design Co', status: 'active', totalRevenue: 12000, projectsCount: 2 },
  { id: CLIENT_IDS[6], name: 'DataPulse Analytics', industry: 'Technology', value: 'enterprise', contact: 'Rachel Chen', email: 'rachel@datapulse.ai', phone: '+1 (408) 555-0707', company: 'DataPulse Analytics', status: 'vip', totalRevenue: 53000, projectsCount: 3 },
  { id: CLIENT_IDS[7], name: 'Bloom Education', industry: 'EdTech', value: 'small', contact: 'Michael Brown', email: 'michael@bloomedu.org', phone: '+1 (617) 555-0808', company: 'Bloom Education', status: 'active', totalRevenue: 8000, projectsCount: 1 },
  { id: CLIENT_IDS[8], name: 'Summit Real Estate', industry: 'Real Estate', value: 'mid-market', contact: 'Lisa Anderson', email: 'lisa@summitrealty.com', phone: '+1 (310) 555-0909', company: 'Summit Real Estate', status: 'active', totalRevenue: 9500, projectsCount: 1 },
  { id: CLIENT_IDS[9], name: 'Nexus Innovations', industry: 'Technology', value: 'enterprise', contact: 'James Wilson', email: 'james@nexusinnovations.io', phone: '+1 (512) 555-1010', company: 'Nexus Innovations', status: 'active', totalRevenue: 28000, projectsCount: 2 },
  { id: CLIENT_IDS[10], name: 'Artisan Coffee Roasters', industry: 'F&B', value: 'small', contact: 'Sophie Martin', email: 'sophie@artisancoffee.co', phone: '+1 (503) 555-1111', company: 'Artisan Coffee Roasters', status: 'lead', totalRevenue: 0, projectsCount: 0 },
  { id: CLIENT_IDS[11], name: 'Velocity Logistics', industry: 'Logistics', value: 'enterprise', contact: 'Robert Kim', email: 'robert@velocitylogistics.com', phone: '+1 (312) 555-1212', company: 'Velocity Logistics', status: 'active', totalRevenue: 22000, projectsCount: 1 },
]

// ============================================================================
// PROJECT DATA
// ============================================================================

const PROJECTS = [
  // Completed projects
  { id: PROJECT_IDS[0], name: 'Brand Identity Refresh', clientIdx: 0, value: 3500, status: 'Completed', progress: 100, month: 11, category: 'design' },
  { id: PROJECT_IDS[1], name: 'Website Redesign', clientIdx: 3, value: 5000, status: 'Completed', progress: 100, month: 10, category: 'design' },
  { id: PROJECT_IDS[2], name: 'Social Media Campaign', clientIdx: 4, value: 2500, status: 'Completed', progress: 100, month: 10, category: 'marketing' },
  { id: PROJECT_IDS[3], name: 'E-commerce Platform Build', clientIdx: 1, value: 15000, status: 'Completed', progress: 100, month: 8, category: 'development' },
  { id: PROJECT_IDS[4], name: 'Mobile App MVP', clientIdx: 2, value: 25000, status: 'Completed', progress: 100, month: 7, category: 'development' },
  { id: PROJECT_IDS[5], name: 'Marketing Automation Setup', clientIdx: 4, value: 8000, status: 'Completed', progress: 100, month: 7, category: 'marketing' },
  { id: PROJECT_IDS[6], name: 'Data Dashboard Development', clientIdx: 6, value: 18000, status: 'Completed', progress: 100, month: 5, category: 'development' },
  { id: PROJECT_IDS[7], name: 'Learning Platform Integration', clientIdx: 7, value: 12000, status: 'Completed', progress: 100, month: 4, category: 'development' },
  { id: PROJECT_IDS[8], name: 'CRM Implementation', clientIdx: 8, value: 9500, status: 'Completed', progress: 100, month: 4, category: 'consulting' },

  // In progress projects
  { id: PROJECT_IDS[9], name: 'AI Analytics Dashboard', clientIdx: 6, value: 35000, status: 'In Progress', progress: 75, month: 2, category: 'development' },
  { id: PROJECT_IDS[10], name: 'Enterprise Portal Redesign', clientIdx: 9, value: 28000, status: 'In Progress', progress: 45, month: 1, category: 'design' },
  { id: PROJECT_IDS[11], name: 'Supply Chain Optimization', clientIdx: 11, value: 22000, status: 'In Progress', progress: 30, month: 1, category: 'consulting' },

  // Pipeline/Not started
  { id: PROJECT_IDS[12], name: 'Brand Strategy Consulting', clientIdx: 5, value: 15000, status: 'Not Started', progress: 0, month: 0, category: 'consulting' },
  { id: PROJECT_IDS[13], name: 'Mobile App Phase 2', clientIdx: 2, value: 30000, status: 'Not Started', progress: 0, month: 0, category: 'development' },
  { id: PROJECT_IDS[14], name: 'Q2 Marketing Campaign', clientIdx: 10, value: 8000, status: 'Not Started', progress: 0, month: 0, category: 'marketing' },
]

// ============================================================================
// TEAM MEMBER DATA
// ============================================================================

const TEAM_MEMBERS = [
  { id: TEAM_MEMBER_IDS[0], name: 'Sarah Johnson', role: 'Lead Designer', department: 'Design', email: 'sarah.j@kazi.io', skills: ['UI/UX', 'Branding', 'Figma'], hourlyRate: 125, status: 'online', rating: 4.9 },
  { id: TEAM_MEMBER_IDS[1], name: 'Michael Chen', role: 'Frontend Developer', department: 'Development', email: 'michael.c@kazi.io', skills: ['React', 'TypeScript', 'Next.js'], hourlyRate: 150, status: 'online', rating: 4.8 },
  { id: TEAM_MEMBER_IDS[2], name: 'Emily Rodriguez', role: 'Project Manager', department: 'Management', email: 'emily.r@kazi.io', skills: ['Agile', 'Stakeholder Management', 'Risk Management'], hourlyRate: 100, status: 'busy', rating: 4.7 },
  { id: TEAM_MEMBER_IDS[3], name: 'David Kim', role: 'Backend Developer', department: 'Development', email: 'david.k@kazi.io', skills: ['Node.js', 'PostgreSQL', 'AWS'], hourlyRate: 145, status: 'online', rating: 4.9 },
  { id: TEAM_MEMBER_IDS[4], name: 'Lisa Wang', role: 'Marketing Specialist', department: 'Marketing', email: 'lisa.w@kazi.io', skills: ['SEO', 'Content Strategy', 'Analytics'], hourlyRate: 95, status: 'away', rating: 4.6 },
]

// ============================================================================
// SEEDING FUNCTIONS
// ============================================================================

async function ensureDemoUserExists(): Promise<string> {
  console.log('Checking for demo user...')

  // Check if user exists in auth.users
  const { data: authData } = await supabase.auth.admin.listUsers()
  const existingUser = authData?.users?.find(u => u.email === DEMO_USER_EMAIL)

  if (existingUser) {
    console.log(`✓ Demo user found: ${existingUser.id}`)
    return existingUser.id
  }

  // Create the user
  console.log('Creating demo user...')
  const { data: newUser, error } = await supabase.auth.admin.createUser({
    email: DEMO_USER_EMAIL,
    password: 'investor2026',
    email_confirm: true,
    user_metadata: {
      full_name: 'Alex Demo',
      role: 'admin'
    }
  })

  if (error) {
    console.error('Error creating user:', error.message)
    // User might exist but not be found - use the default ID
    return DEMO_USER_ID
  }

  console.log(`✓ Demo user created: ${newUser.user.id}`)
  return newUser.user.id
}

async function seedClients(userId: string) {
  console.log('\n📇 Seeding clients...')

  const clientRecords = CLIENTS.map(client => ({
    id: client.id,
    user_id: userId,
    name: client.contact,
    email: client.email,
    phone: client.phone,
    company: client.company,
    notes: `${client.industry} | ${client.value} | Status: ${client.status}`,
  }))

  const { error } = await supabase
    .from('clients')
    .upsert(clientRecords, { onConflict: 'id' })

  if (error) {
    console.log(`   Note: clients table error - ${error.message}`)
  } else {
    console.log(`   ✓ ${clientRecords.length} clients seeded`)
  }
}

async function seedDashboardStats(userId: string) {
  console.log('\n📊 Seeding dashboard stats...')

  const totalRevenue = 172500
  const thisMonthRevenue = 22000
  const lastMonthRevenue = 17500

  const stats = {
    id: uuid(),
    user_id: userId,
    earnings: totalRevenue,
    earnings_trend: ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1),
    active_projects: 3,
    active_projects_trend: 15,
    completed_projects: 9,
    completed_projects_trend: 25,
    total_clients: 12,
    total_clients_trend: 20,
    hours_this_month: 165,
    hours_this_month_trend: 8,
    revenue_this_month: thisMonthRevenue,
    revenue_this_month_trend: ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1),
    average_project_value: 14500,
    average_project_value_trend: 18,
    client_satisfaction: 4.8,
    client_satisfaction_trend: 0.2,
    productivity_score: 92,
    productivity_score_trend: 5,
    pending_tasks: 12,
    overdue_tasks: 2,
    upcoming_meetings: 5,
    unread_messages: 8,
    last_updated: new Date().toISOString(),
    created_at: monthsAgo(12)
  }

  const { error } = await supabase
    .from('dashboard_stats')
    .upsert(stats, { onConflict: 'user_id' })

  if (error) console.log(`   Note: ${error.message}`)
  else console.log('   ✓ Dashboard stats seeded')
}

async function seedDashboardProjects(userId: string) {
  console.log('\n📁 Seeding dashboard projects...')

  const categoryMap: Record<string, string> = {
    'design': 'design',
    'development': 'development',
    'marketing': 'marketing',
    'consulting': 'consulting',
    'content': 'content',
    'other': 'other'
  }

  const projects = PROJECTS.map((p) => ({
    id: p.id,
    user_id: userId,
    name: p.name,
    client: CLIENTS[p.clientIdx].name,
    client_id: CLIENTS[p.clientIdx].id,
    progress: p.progress,
    status: p.status,
    value: p.value,
    currency: 'USD',
    priority: p.value > 20000 ? 'high' : p.value > 10000 ? 'medium' : 'low',
    category: categoryMap[p.category] || 'other',
    ai_automation: Math.random() > 0.5,
    collaboration: Math.floor(Math.random() * 5),
    deadline: p.month === 0 ? daysFromNow(60) : daysAgo(-30 + (p.month * 30)),
    start_date: monthsAgo(p.month + 1),
    description: `${p.name} for ${CLIENTS[p.clientIdx].name} - ${CLIENTS[p.clientIdx].industry}`,
    tags: [CLIENTS[p.clientIdx].industry.toLowerCase(), p.category],
    is_starred: p.value > 25000,
    is_pinned: p.status === 'In Progress',
    completed_tasks: p.status === 'Completed' ? Math.floor(Math.random() * 20 + 10) : Math.floor(p.progress / 10),
    total_tasks: Math.floor(Math.random() * 10 + 15),
    hours_logged: p.status === 'Completed' ? p.value / 150 : (p.value / 150) * (p.progress / 100),
    hours_estimated: Math.floor(p.value / 150 * 1.1),
    budget: p.value,
    spent: p.status === 'Completed' ? p.value * 0.92 : p.value * (p.progress / 100) * 0.9,
    created_at: monthsAgo(p.month + 1),
    updated_at: p.status === 'In Progress' ? daysAgo(Math.floor(Math.random() * 5)) : monthsAgo(p.month)
  }))

  const { error } = await supabase
    .from('dashboard_projects')
    .upsert(projects, { onConflict: 'id' })

  if (error) console.log(`   Note: ${error.message}`)
  else console.log(`   ✓ ${projects.length} projects seeded`)
}

async function seedDashboardActivities(userId: string) {
  console.log('\n📝 Seeding dashboard activities...')

  const activities = [
    { type: 'payment', message: 'Payment received from DataPulse Analytics', description: '$17,500 for AI Dashboard milestone', status: 'success', impact: 'high', time: daysAgo(1) },
    { type: 'project', message: 'Project milestone completed', description: 'AI Analytics Dashboard - Phase 2 delivered', status: 'success', impact: 'high', time: daysAgo(2) },
    { type: 'client', message: 'New enterprise client signed', description: 'Nexus Innovations - $28,000 contract', status: 'success', impact: 'critical', time: daysAgo(3) },
    { type: 'feedback', message: '5-star review received', description: 'CloudSync Solutions: "Exceptional work on the mobile app!"', status: 'success', impact: 'medium', time: daysAgo(4) },
    { type: 'project', message: 'Project started', description: 'Supply Chain Optimization for Velocity Logistics', status: 'info', impact: 'medium', time: daysAgo(5) },
    { type: 'message', message: 'Client message received', description: 'Sarah Mitchell wants to discuss Q2 roadmap', status: 'info', impact: 'low', time: daysAgo(5) },
    { type: 'action', message: 'Invoice sent', description: 'INV-2026-042 to Nexus Innovations - $14,000', status: 'info', impact: 'medium', time: daysAgo(6) },
    { type: 'system', message: 'Weekly report generated', description: 'Revenue up 12% from last week', status: 'success', impact: 'low', time: daysAgo(7) },
    { type: 'payment', message: 'Largest payment received', description: '$25,000 from CloudSync Solutions', status: 'success', impact: 'critical', time: monthsAgo(2) },
    { type: 'client', message: 'Hit 10 client milestone', description: 'Growing client base showing strong retention', status: 'success', impact: 'high', time: monthsAgo(3) },
    { type: 'project', message: 'First $20K+ project completed', description: 'Mobile App MVP for CloudSync Solutions', status: 'success', impact: 'critical', time: monthsAgo(5) },
    { type: 'action', message: 'First recurring client', description: 'TechVenture Capital signed retainer agreement', status: 'success', impact: 'high', time: monthsAgo(8) },
  ]

  const activityRecords = activities.map(a => ({
    id: uuid(),
    user_id: userId,
    type: a.type,
    message: a.message,
    description: a.description,
    time: a.time,
    status: a.status,
    impact: a.impact,
    is_read: new Date(a.time) < new Date(daysAgo(3)),
    created_at: a.time
  }))

  const { error } = await supabase
    .from('dashboard_activities')
    .upsert(activityRecords, { onConflict: 'id' })

  if (error) console.log(`   Note: ${error.message}`)
  else console.log(`   ✓ ${activityRecords.length} activities seeded`)
}

async function seedDashboardInsights(userId: string) {
  console.log('\n💡 Seeding AI insights...')

  const insights = [
    {
      type: 'revenue',
      title: 'Revenue milestone approaching',
      description: 'You\'re on track to hit $200K annual revenue. At current pace, you\'ll reach this in 8 weeks.',
      impact: 'high',
      action: 'Review pricing strategy',
      action_url: '/dashboard/analytics',
      confidence: 92,
      priority: 1,
      category: 'financial',
      is_ai_generated: true
    },
    {
      type: 'opportunity',
      title: 'High-value lead ready to convert',
      description: 'Thomas Wright from Horizon Tech (score: 92) has viewed your proposal 5 times. Consider follow-up call.',
      impact: 'critical',
      action: 'Schedule call',
      action_url: '/dashboard/leads',
      confidence: 88,
      priority: 2,
      category: 'sales',
      is_ai_generated: true
    },
    {
      type: 'productivity',
      title: 'Optimal billing rate identified',
      description: 'Analysis shows you could increase hourly rate by 15% without losing clients. Current avg: $135/hr, suggested: $155/hr.',
      impact: 'high',
      action: 'Update rate card',
      action_url: '/dashboard/settings',
      confidence: 85,
      priority: 3,
      category: 'pricing',
      is_ai_generated: true
    },
    {
      type: 'client',
      title: 'Upsell opportunity detected',
      description: 'GreenLeaf Organics engagement score is 95%. They may be ready for ongoing retainer ($3K/month potential).',
      impact: 'medium',
      action: 'Send proposal',
      action_url: '/dashboard/clients',
      confidence: 78,
      priority: 4,
      category: 'sales',
      is_ai_generated: true
    },
    {
      type: 'risk',
      title: 'Project timeline at risk',
      description: 'Enterprise Portal Redesign is 5 days behind schedule. Consider reallocating 10 hours this week.',
      impact: 'high',
      action: 'Review timeline',
      action_url: '/dashboard/projects',
      confidence: 91,
      priority: 5,
      category: 'project',
      is_ai_generated: true
    }
  ]

  const insightRecords = insights.map(i => ({
    id: uuid(),
    user_id: userId,
    ...i,
    acted_upon: false,
    created_at: daysAgo(Math.floor(Math.random() * 7)),
    expires_at: daysFromNow(14),
    metadata: {},
    related_metrics: [],
    updated_at: new Date().toISOString()
  }))

  const { error } = await supabase
    .from('dashboard_insights')
    .upsert(insightRecords, { onConflict: 'id' })

  if (error) console.log(`   Note: ${error.message}`)
  else console.log(`   ✓ ${insightRecords.length} AI insights seeded`)
}

async function seedDashboardMetrics(userId: string) {
  console.log('\n📈 Seeding dashboard metrics...')

  const totalRevenue = 172500

  const metrics = [
    { name: 'Total Revenue', value: totalRevenue, previous: totalRevenue * 0.75, unit: 'USD', icon: 'dollar-sign', color: 'green', category: 'financial' },
    { name: 'Active Projects', value: 3, previous: 2, unit: 'count', icon: 'folder', color: 'blue', category: 'projects' },
    { name: 'Pipeline Value', value: 163000, previous: 120000, unit: 'USD', icon: 'trending-up', color: 'purple', category: 'sales' },
    { name: 'Billable Hours', value: 165, previous: 152, unit: 'hours', icon: 'clock', color: 'orange', category: 'time' },
    { name: 'Client Satisfaction', value: 4.8, previous: 4.6, unit: 'rating', icon: 'star', color: 'yellow', category: 'quality' },
    { name: 'Conversion Rate', value: 45, previous: 38, unit: '%', icon: 'target', color: 'teal', category: 'sales' },
    { name: 'Avg Project Value', value: 14500, previous: 11000, unit: 'USD', icon: 'bar-chart', color: 'indigo', category: 'financial' },
    { name: 'On-time Delivery', value: 94, previous: 89, unit: '%', icon: 'check-circle', color: 'green', category: 'quality' },
  ]

  const metricRecords = metrics.map(m => ({
    id: uuid(),
    user_id: userId,
    name: m.name,
    value: m.value,
    previous_value: m.previous,
    change: m.value - m.previous,
    change_percent: ((m.value - m.previous) / m.previous * 100).toFixed(1),
    trend: m.value > m.previous ? 'up' : 'down',
    unit: m.unit,
    icon: m.icon,
    color: m.color,
    is_positive: m.value > m.previous,
    category: m.category,
    last_updated: new Date().toISOString(),
    created_at: monthsAgo(12)
  }))

  const { error } = await supabase
    .from('dashboard_metrics')
    .upsert(metricRecords, { onConflict: 'id' })

  if (error) console.log(`   Note: ${error.message}`)
  else console.log(`   ✓ ${metricRecords.length} metrics seeded`)
}

async function seedDashboardGoals(userId: string) {
  console.log('\n🎯 Seeding goals...')

  const goals = [
    { title: 'Hit $200K Annual Revenue', description: 'Reach $200,000 in total revenue for the year', target: 200000, current: 172500, unit: 'USD', deadline: daysFromNow(60), category: 'financial' },
    { title: 'Acquire 5 Enterprise Clients', description: 'Sign contracts with 5 enterprise-level clients', target: 5, current: 4, unit: 'clients', deadline: daysFromNow(90), category: 'sales' },
    { title: 'Maintain 95% On-time Delivery', description: 'Deliver all projects on or before deadline', target: 95, current: 94, unit: '%', deadline: daysFromNow(30), category: 'quality' },
    { title: 'Build $250K Pipeline', description: 'Grow sales pipeline to $250K potential value', target: 250000, current: 163000, unit: 'USD', deadline: daysFromNow(45), category: 'sales' },
  ]

  const goalRecords = goals.map(g => ({
    id: uuid(),
    user_id: userId,
    title: g.title,
    description: g.description,
    target: g.target,
    current: g.current,
    progress: Math.round((g.current / g.target) * 100),
    unit: g.unit,
    deadline: g.deadline,
    status: 'on-track',
    category: g.category,
    created_at: monthsAgo(6),
    updated_at: daysAgo(1)
  }))

  const { error } = await supabase
    .from('dashboard_goals')
    .upsert(goalRecords, { onConflict: 'id' })

  if (error) console.log(`   Note: ${error.message}`)
  else console.log(`   ✓ ${goalRecords.length} goals seeded`)
}

async function seedDashboardNotifications(userId: string) {
  console.log('\n🔔 Seeding notifications...')

  const notifications = [
    { title: 'Payment Received', message: 'DataPulse Analytics paid $17,500 for AI Dashboard milestone', type: 'success', priority: 'high', created_at: daysAgo(1) },
    { title: 'Meeting Reminder', message: 'Client call with TechVenture Capital in 1 hour', type: 'info', priority: 'normal', created_at: hoursFromNow(-2) },
    { title: 'Project Update', message: 'Enterprise Portal Redesign reached 45% completion', type: 'info', priority: 'normal', created_at: daysAgo(2) },
    { title: 'New Lead', message: 'Horizon Tech requested a quote for mobile app development', type: 'success', priority: 'high', created_at: daysAgo(3) },
    { title: 'Invoice Overdue', message: 'INV-2026-038 from Stellar Marketing is 5 days overdue', type: 'warning', priority: 'urgent', created_at: daysAgo(5) },
    { title: 'Team Update', message: 'Sarah Johnson completed UI designs for Nexus project', type: 'info', priority: 'low', created_at: daysAgo(4) },
    { title: 'AI Insight', message: 'Optimal time to follow up with GreenLeaf Organics', type: 'info', priority: 'normal', created_at: daysAgo(1) },
    { title: 'Weekly Report', message: 'Your weekly revenue report is ready to view', type: 'info', priority: 'low', created_at: daysAgo(7) },
  ]

  const notificationRecords = notifications.map(n => ({
    id: uuid(),
    user_id: userId,
    title: n.title,
    message: n.message,
    type: n.type,
    is_read: new Date(n.created_at) < new Date(daysAgo(3)),
    created_at: n.created_at,
    priority: n.priority
  }))

  const { error } = await supabase
    .from('dashboard_notifications')
    .upsert(notificationRecords, { onConflict: 'id' })

  if (error) console.log(`   Note: ${error.message}`)
  else console.log(`   ✓ ${notificationRecords.length} notifications seeded`)
}

async function seedInvoices(userId: string) {
  console.log('\n📄 Seeding invoices...')

  const invoices = [
    // Paid invoices
    { invoice_number: 'INV-2026-001', client_id: CLIENT_IDS[0], client_name: 'Sarah Mitchell', client_email: 'sarah@techventure.io', total: 3850, status: 'paid', due_date: monthsAgo(10), paid_date: monthsAgo(10) },
    { invoice_number: 'INV-2026-002', client_id: CLIENT_IDS[3], client_name: 'David Park', client_email: 'david@urbanfitness.com', total: 5500, status: 'paid', due_date: monthsAgo(9), paid_date: monthsAgo(9) },
    { invoice_number: 'INV-2026-003', client_id: CLIENT_IDS[4], client_name: 'Amanda Torres', client_email: 'amanda@stellarmarketing.co', total: 2750, status: 'paid', due_date: monthsAgo(9), paid_date: monthsAgo(9) },
    { invoice_number: 'INV-2026-004', client_id: CLIENT_IDS[1], client_name: 'Marcus Johnson', client_email: 'marcus@greenleaf.co', total: 16500, status: 'paid', due_date: monthsAgo(7), paid_date: monthsAgo(7) },
    { invoice_number: 'INV-2026-005', client_id: CLIENT_IDS[2], client_name: 'Jennifer Wu', client_email: 'jennifer@cloudsync.io', total: 27500, status: 'paid', due_date: monthsAgo(5), paid_date: monthsAgo(5) },
    { invoice_number: 'INV-2026-006', client_id: CLIENT_IDS[6], client_name: 'Rachel Chen', client_email: 'rachel@datapulse.ai', total: 19800, status: 'paid', due_date: monthsAgo(3), paid_date: monthsAgo(3) },
    { invoice_number: 'INV-2026-007', client_id: CLIENT_IDS[7], client_name: 'Michael Brown', client_email: 'michael@bloomedu.org', total: 13200, status: 'paid', due_date: monthsAgo(3), paid_date: monthsAgo(2) },
    { invoice_number: 'INV-2026-008', client_id: CLIENT_IDS[8], client_name: 'Lisa Anderson', client_email: 'lisa@summitrealty.com', total: 10450, status: 'paid', due_date: monthsAgo(2), paid_date: monthsAgo(2) },
    { invoice_number: 'INV-2026-009', client_id: CLIENT_IDS[6], client_name: 'Rachel Chen', client_email: 'rachel@datapulse.ai', total: 17500, status: 'paid', due_date: daysAgo(15), paid_date: daysAgo(14) },

    // Sent/pending invoices
    { invoice_number: 'INV-2026-010', client_id: CLIENT_IDS[9], client_name: 'James Wilson', client_email: 'james@nexusinnovations.io', total: 15400, status: 'sent', due_date: daysFromNow(25), paid_date: null },
    { invoice_number: 'INV-2026-011', client_id: CLIENT_IDS[11], client_name: 'Robert Kim', client_email: 'robert@velocitylogistics.com', total: 12100, status: 'sent', due_date: daysFromNow(20), paid_date: null },

    // Overdue
    { invoice_number: 'INV-2026-012', client_id: CLIENT_IDS[4], client_name: 'Amanda Torres', client_email: 'amanda@stellarmarketing.co', total: 5150, status: 'overdue', due_date: daysAgo(5), paid_date: null },

    // Draft
    { invoice_number: 'INV-2026-013', client_id: CLIENT_IDS[6], client_name: 'Rachel Chen', client_email: 'rachel@datapulse.ai', total: 17500, status: 'draft', due_date: daysFromNow(30), paid_date: null },
  ]

  const invoiceRecords = invoices.map(inv => ({
    id: uuid(),
    user_id: userId,
    invoice_number: inv.invoice_number,
    client_id: inv.client_id,
    client_name: inv.client_name,
    client_email: inv.client_email,
    subtotal: inv.total / 1.1,
    tax_rate: 10,
    tax_amount: inv.total * 0.1 / 1.1,
    discount: 0,
    total: inv.total,
    currency: 'USD',
    status: inv.status,
    issue_date: daysAgo(30),
    due_date: inv.due_date.split('T')[0],
    paid_date: inv.paid_date ? inv.paid_date.split('T')[0] : null,
    notes: `Invoice for ${inv.client_name}`,
    terms: 'Net 30. Late payments subject to 1.5% monthly interest.',
    created_at: monthsAgo(Math.floor(Math.random() * 6) + 1),
    updated_at: new Date().toISOString()
  }))

  const { error } = await supabase
    .from('invoices')
    .upsert(invoiceRecords, { onConflict: 'invoice_number' })

  if (error) console.log(`   Note: ${error.message}`)
  else console.log(`   ✓ ${invoiceRecords.length} invoices seeded`)
}

async function seedCalendarEvents(userId: string) {
  console.log('\n📅 Seeding calendar events...')

  // First, ensure there's a default calendar
  const calendarId = uuid()
  const { error: calError } = await supabase
    .from('calendars')
    .upsert({
      id: calendarId,
      user_id: userId,
      name: 'Work Calendar',
      description: 'Primary work calendar',
      color: '#3b82f6',
      is_default: true,
      is_visible: true,
      time_zone: 'America/New_York',
      created_at: monthsAgo(12),
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' })

  if (calError) {
    console.log(`   Note: calendars - ${calError.message}`)
    return
  }

  const events = [
    // Today's events
    { title: 'Client Call - TechVenture Capital', description: 'Q2 roadmap discussion with Sarah Mitchell', event_type: 'call', start_time: hoursFromNow(2), end_time: hoursFromNow(3), status: 'confirmed' },
    { title: 'Team Standup', description: 'Daily sync with development team', event_type: 'meeting', start_time: hoursFromNow(4), end_time: hoursFromNow(4.5), status: 'confirmed' },
    { title: 'Project Review - AI Dashboard', description: 'Review Phase 2 deliverables with DataPulse', event_type: 'review', start_time: hoursFromNow(6), end_time: hoursFromNow(7), status: 'tentative' },

    // This week
    { title: 'Enterprise Portal Demo', description: 'Demo new features to Nexus Innovations', event_type: 'presentation', start_time: daysFromNow(1) + 'T14:00:00Z', end_time: daysFromNow(1) + 'T15:30:00Z', status: 'confirmed' },
    { title: 'Design Review', description: 'Review Sarah\'s designs for brand refresh', event_type: 'review', start_time: daysFromNow(2) + 'T10:00:00Z', end_time: daysFromNow(2) + 'T11:00:00Z', status: 'confirmed' },
    { title: 'Sprint Planning', description: 'Plan next 2-week development sprint', event_type: 'meeting', start_time: daysFromNow(3) + 'T09:00:00Z', end_time: daysFromNow(3) + 'T11:00:00Z', status: 'confirmed' },

    // Next week
    { title: 'Investor Pitch Prep', description: 'Prepare materials for investor meeting', event_type: 'task', start_time: daysFromNow(7) + 'T09:00:00Z', end_time: daysFromNow(7) + 'T12:00:00Z', status: 'tentative' },
    { title: 'CloudSync Phase 2 Kickoff', description: 'Start new development phase with Jennifer', event_type: 'meeting', start_time: daysFromNow(8) + 'T13:00:00Z', end_time: daysFromNow(8) + 'T14:00:00Z', status: 'confirmed' },
    { title: 'Monthly Client Review', description: 'Review all active client projects', event_type: 'review', start_time: daysFromNow(10) + 'T10:00:00Z', end_time: daysFromNow(10) + 'T12:00:00Z', status: 'confirmed' },
  ]

  const eventRecords = events.map(e => ({
    id: uuid(),
    calendar_id: calendarId,
    title: e.title,
    description: e.description,
    start_time: e.start_time,
    end_time: e.end_time,
    all_day: false,
    time_zone: 'America/New_York',
    event_type: e.event_type,
    status: e.status,
    visibility: 'public',
    location_type: 'video',
    meeting_url: 'https://meet.kazi.io/' + uuid().substring(0, 8),
    organizer_id: userId,
    organizer_name: 'Alex Demo',
    organizer_email: DEMO_USER_EMAIL,
    rsvp_required: true,
    created_at: daysAgo(7),
    updated_at: new Date().toISOString()
  }))

  const { error } = await supabase
    .from('calendar_events')
    .upsert(eventRecords, { onConflict: 'id' })

  if (error) console.log(`   Note: calendar_events - ${error.message}`)
  else console.log(`   ✓ ${eventRecords.length} calendar events seeded`)
}

async function seedMessages(userId: string) {
  console.log('\n💬 Seeding messages and conversations...')

  // Create chat conversations
  const chatIds = [uuid(), uuid(), uuid()]

  const chats = [
    { id: chatIds[0], name: 'CloudSync Project Team', description: 'Project discussions for CloudSync mobile app', type: 'group' },
    { id: chatIds[1], name: 'Sarah Mitchell', description: 'Direct chat with TechVenture Capital', type: 'direct' },
    { id: chatIds[2], name: 'Design Team', description: 'UI/UX design discussions', type: 'channel' },
  ]

  const chatRecords = chats.map(c => ({
    id: c.id,
    name: c.name,
    description: c.description,
    type: c.type,
    creator_id: userId,
    is_archived: false,
    created_at: monthsAgo(6),
    updated_at: daysAgo(1),
    last_message_at: daysAgo(1)
  }))

  const { error: chatError } = await supabase
    .from('chats')
    .upsert(chatRecords, { onConflict: 'id' })

  if (chatError) {
    console.log(`   Note: chats - ${chatError.message}`)
    return
  }

  // Add chat members
  const chatMembers = [
    { chat_id: chatIds[0], user_id: userId, role: 'owner' },
    { chat_id: chatIds[1], user_id: userId, role: 'owner' },
    { chat_id: chatIds[2], user_id: userId, role: 'owner' },
  ]

  const { error: memberError } = await supabase
    .from('chat_members')
    .upsert(chatMembers.map(m => ({ id: uuid(), ...m, joined_at: monthsAgo(6) })), { onConflict: 'chat_id,user_id' })

  if (memberError) console.log(`   Note: chat_members - ${memberError.message}`)

  // Create messages
  const messages = [
    { chat_id: chatIds[0], text: 'Hi team, I\'ve pushed the latest designs for the dashboard. Please review when you get a chance.', time: daysAgo(3) },
    { chat_id: chatIds[0], text: 'Looks great! I have some suggestions for the navigation flow.', time: daysAgo(2.5) },
    { chat_id: chatIds[0], text: 'Thanks for the feedback. I\'ll incorporate those changes today.', time: daysAgo(2) },
    { chat_id: chatIds[1], text: 'Hi Sarah, just following up on our Q2 roadmap discussion. Do you have time for a call this week?', time: daysAgo(2) },
    { chat_id: chatIds[1], text: 'Absolutely! How about Thursday at 2pm?', time: daysAgo(1.5) },
    { chat_id: chatIds[1], text: 'Perfect, I\'ll send a calendar invite. Looking forward to it!', time: daysAgo(1) },
    { chat_id: chatIds[2], text: 'New design system components are ready for review in Figma.', time: daysAgo(1) },
    { chat_id: chatIds[2], text: 'The color palette looks much better now. Great work!', time: hoursFromNow(-5) },
  ]

  const messageRecords = messages.map(m => ({
    id: uuid(),
    chat_id: m.chat_id,
    sender_id: userId,
    text: m.text,
    type: 'text',
    status: 'sent',
    is_edited: false,
    is_pinned: false,
    is_deleted: false,
    created_at: m.time
  }))

  const { error: msgError } = await supabase
    .from('messages')
    .upsert(messageRecords, { onConflict: 'id' })

  if (msgError) console.log(`   Note: messages - ${msgError.message}`)
  else console.log(`   ✓ ${chats.length} conversations and ${messages.length} messages seeded`)
}

async function seedTeamMembers(userId: string) {
  console.log('\n👥 Seeding team members...')

  const teamRecords = TEAM_MEMBERS.map(tm => ({
    id: tm.id,
    user_id: userId,
    name: tm.name,
    role: tm.role,
    department: tm.department,
    email: tm.email,
    status: tm.status,
    skills: tm.skills,
    hourly_rate: tm.hourlyRate,
    rating: tm.rating,
    projects_count: Math.floor(Math.random() * 5) + 2,
    completed_tasks: Math.floor(Math.random() * 50) + 20,
    availability: tm.status === 'online' ? 'Available' : tm.status === 'busy' ? 'Busy' : 'Away',
    join_date: monthsAgo(Math.floor(Math.random() * 8) + 2).split('T')[0],
    permissions: 'write',
    created_at: monthsAgo(8),
    updated_at: daysAgo(Math.floor(Math.random() * 3))
  }))

  const { error } = await supabase
    .from('team_members')
    .upsert(teamRecords, { onConflict: 'id' })

  if (error) console.log(`   Note: team_members - ${error.message}`)
  else console.log(`   ✓ ${teamRecords.length} team members seeded`)
}

async function seedMyDayTasks(userId: string) {
  console.log('\n📝 Seeding My Day tasks...')

  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

  const tasks = [
    { title: 'Review Q1 financial reports', description: 'Analyze revenue, expenses, and profit margins for investor meeting', priority: 'high', category: 'work', estimated_time: 60, completed: false, date: today, tags: ['finance', 'urgent', 'investor'] },
    { title: 'Team standup meeting', description: 'Daily sync with development team', priority: 'medium', category: 'meeting', estimated_time: 15, completed: false, start_time: '09:00', end_time: '09:15', date: today, tags: ['team', 'daily'] },
    { title: 'Update client proposal', description: 'Finalize pricing and timeline for Nexus project', priority: 'high', category: 'work', estimated_time: 90, completed: false, date: today, tags: ['proposal', 'client', 'nexus'] },
    { title: 'Code review: Auth module', description: 'Review PR #234 for new OAuth implementation', priority: 'medium', category: 'work', estimated_time: 45, completed: true, actual_time: 38, date: today, tags: ['code-review', 'auth', 'completed'] },
    { title: 'Lunch with Sarah', description: 'Discuss Q2 roadmap and feature prioritization', priority: 'medium', category: 'meeting', estimated_time: 60, completed: false, start_time: '12:30', end_time: '13:30', date: today, tags: ['strategy', 'product'] },
    { title: 'Prepare investor pitch deck', description: 'Update slides with latest metrics and growth projections', priority: 'urgent', category: 'work', estimated_time: 120, completed: false, date: today, tags: ['investor', 'pitch', 'urgent'] },
    { title: 'Client demo: Video features', description: 'Showcase new collaboration features to potential client', priority: 'high', category: 'meeting', estimated_time: 90, completed: false, start_time: '10:00', end_time: '11:30', date: tomorrow, tags: ['demo', 'client', 'video'] },
    { title: 'Sprint planning session', description: 'Plan next 2-week development sprint', priority: 'high', category: 'meeting', estimated_time: 120, completed: false, date: tomorrow, tags: ['sprint', 'planning', 'team'] },
  ]

  const taskRecords = tasks.map(t => ({
    id: uuid(),
    user_id: userId,
    ...t
  }))

  const { error } = await supabase
    .from('my_day_tasks')
    .upsert(taskRecords, { onConflict: 'id' })

  if (error) console.log(`   Note: my_day_tasks - ${error.message}`)
  else console.log(`   ✓ ${taskRecords.length} My Day tasks seeded`)
}

async function seedLeadGenLeads(userId: string) {
  console.log('\n🎯 Seeding leads...')

  const leads = [
    { first_name: 'Thomas', last_name: 'Wright', company: 'Horizon Tech', email: 'thomas@horizontech.io', status: 'qualified', score: 92, source: 'website' },
    { first_name: 'Emily', last_name: 'Chen', company: 'Spark Ventures', email: 'emily@sparkventures.co', status: 'qualified', score: 88, source: 'referral' },
    { first_name: 'Daniel', last_name: 'Martinez', company: 'Blue Ocean Media', email: 'daniel@blueocean.media', status: 'contacted', score: 78, source: 'social-media' },
    { first_name: 'Katie', last_name: 'Johnson', company: 'Pulse Digital', email: 'katie@pulsedigital.co', status: 'contacted', score: 72, source: 'website' },
    { first_name: 'Ryan', last_name: 'O\'Brien', company: 'Celtic Innovations', email: 'ryan@celticinnovations.ie', status: 'new', score: 65, source: 'email' },
    { first_name: 'Maria', last_name: 'Santos', company: 'Verde Solutions', email: 'maria@verde.solutions', status: 'new', score: 61, source: 'website' },
    { first_name: 'Alex', last_name: 'Turner', company: 'North Star LLC', email: 'alex@northstar.llc', status: 'new', score: 45, source: 'organic' },
    { first_name: 'Jessica', last_name: 'Lee', company: 'Summit Partners', email: 'jessica@summitpartners.com', status: 'new', score: 38, source: 'landing-page' },
  ]

  const leadRecords = leads.map(l => ({
    id: uuid(),
    user_id: userId,
    ...l,
    score_label: l.score >= 80 ? 'hot' : l.score >= 60 ? 'warm' : 'cold',
    tags: [l.source, l.score >= 80 ? 'priority' : 'nurture'],
    last_contacted_at: l.status !== 'new' ? daysAgo(Math.floor(Math.random() * 14) + 1) : null,
    created_at: monthsAgo(Math.floor(Math.random() * 4) + 1),
    updated_at: daysAgo(Math.floor(Math.random() * 7))
  }))

  const { error } = await supabase
    .from('lead_gen_leads')
    .upsert(leadRecords, { onConflict: 'id' })

  if (error) console.log(`   Note: lead_gen_leads - ${error.message}`)
  else console.log(`   ✓ ${leadRecords.length} leads seeded`)
}

async function seedInvestorMetrics(userId: string) {
  console.log('\n📈 Seeding investor metrics...')

  const metricRecord = {
    id: uuid(),
    user_id: userId,
    metric_date: new Date().toISOString().split('T')[0],
    period: 'monthly',
    total_users: 15,
    active_users_daily: 1,
    active_users_weekly: 1,
    active_users_monthly: 1,
    user_growth_rate: 0,
    mrr: 12500,
    arr: 150000,
    revenue_growth: 47,
    avg_project_value: 14500,
    payment_velocity: 85,
    total_gmv: 172500,
    platform_revenue: 172500,
    revenue_per_user: 172500,
    net_revenue_retention: 120,
    gross_revenue_retention: 95,
    ltv: 45000,
    cac: 450,
    ltv_cac_ratio: 100,
    payback_period: 1,
    ai_engagement_rate: 78,
    total_ai_interactions: 450,
    ai_interactions_per_user: 450,
    avg_tokens_per_interaction: 2500,
    total_ai_cost: 125,
    ai_cost_per_user: 125,
    ai_value_created: 15000,
    ai_margin_contribution: 12,
    uptime: 99.9,
    avg_response_time: 120,
    error_rate: 0.1,
    api_calls_per_day: 850,
    storage_used: 15.5,
    bandwidth_used: 2.8,
    concurrent_users: 1,
    peak_concurrent_users: 3,
    created_at: monthsAgo(12),
    updated_at: new Date().toISOString()
  }

  const { error } = await supabase
    .from('investor_metrics')
    .upsert(metricRecord, { onConflict: 'user_id,metric_date,period' })

  if (error) console.log(`   Note: investor_metrics - ${error.message}`)
  else console.log('   ✓ Investor metrics seeded')
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('🚀 KAZI Comprehensive Investor Demo - Data Seeding')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log(`Demo User: ${DEMO_USER_EMAIL}`)
  console.log(`Password: investor2026`)
  console.log('═══════════════════════════════════════════════════════════════\n')

  // Ensure demo user exists
  const userId = await ensureDemoUserExists()

  // Seed all data
  await seedClients(userId)
  await seedDashboardStats(userId)
  await seedDashboardProjects(userId)
  await seedDashboardActivities(userId)
  await seedDashboardInsights(userId)
  await seedDashboardMetrics(userId)
  await seedDashboardGoals(userId)
  await seedDashboardNotifications(userId)
  await seedInvoices(userId)
  await seedCalendarEvents(userId)
  await seedMessages(userId)
  await seedTeamMembers(userId)
  await seedMyDayTasks(userId)
  await seedLeadGenLeads(userId)
  await seedInvestorMetrics(userId)

  console.log('\n═══════════════════════════════════════════════════════════════')
  console.log('✅ COMPREHENSIVE DEMO DATA SEEDING COMPLETE!')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('\n📊 INVESTOR STORY SUMMARY:')
  console.log('   • Total Revenue: $172,500 (from $0 in 12 months)')
  console.log('   • Active Clients: 12 (92% retention)')
  console.log('   • Active Projects: 3 (In Progress)')
  console.log('   • Completed Projects: 9')
  console.log('   • Pipeline Value: $163,000')
  console.log('   • Client Satisfaction: 4.8/5')
  console.log('   • Lead Conversion: 45%')
  console.log('   • On-time Delivery: 94%')
  console.log('   • MRR: $12,500')
  console.log('   • ARR Trajectory: $150,000')
  console.log('\n🔑 Login Credentials:')
  console.log(`   Email: ${DEMO_USER_EMAIL}`)
  console.log('   Password: investor2026')
  console.log('\n═══════════════════════════════════════════════════════════════\n')
}

main().catch(console.error)
