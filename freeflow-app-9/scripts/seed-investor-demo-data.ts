/**
 * KAZI Investor Demo Data Seeding Script
 *
 * This script creates a comprehensive success story for the demo user (alex@freeflow.io)
 * showing a freelancer's journey from $0 to $125K+ revenue over 12 months.
 *
 * SUCCESS STORY NARRATIVE:
 * - Month 1-3: Started freelancing, acquired first clients through lead generation
 * - Month 4-6: Scaled to 5 active projects, hired first contractor
 * - Month 7-9: Reached $10K/month revenue, 15+ clients
 * - Month 10-12: Hit $125K total revenue, 98% client satisfaction
 *
 * All data is interconnected: Leads → Clients → Projects → Tasks → Time Entries → Invoices → Payments
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load .env.local for local development
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Demo user email
const DEMO_USER_EMAIL = 'alex@freeflow.io'

// Helper to generate dates relative to now
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
const monthsAgo = (months: number) => daysAgo(months * 30)

// Generate unique IDs
const uuid = () => crypto.randomUUID()

// ============================================================================
// SUCCESS STORY DATA
// ============================================================================

// Realistic client companies that a successful freelancer would work with
const CLIENTS = [
  { name: 'TechVenture Capital', industry: 'Finance', value: 'enterprise', contact: 'Sarah Mitchell', email: 'sarah@techventure.io' },
  { name: 'GreenLeaf Organics', industry: 'E-commerce', value: 'mid-market', contact: 'Marcus Johnson', email: 'marcus@greenleaf.co' },
  { name: 'CloudSync Solutions', industry: 'SaaS', value: 'enterprise', contact: 'Jennifer Wu', email: 'jennifer@cloudsync.io' },
  { name: 'Urban Fitness Studio', industry: 'Health & Wellness', value: 'small', contact: 'David Park', email: 'david@urbanfitness.com' },
  { name: 'Stellar Marketing Agency', industry: 'Marketing', value: 'mid-market', contact: 'Amanda Torres', email: 'amanda@stellarmarketing.co' },
  { name: 'Nordic Design Co', industry: 'Design', value: 'mid-market', contact: 'Erik Lindqvist', email: 'erik@nordicdesign.io' },
  { name: 'DataPulse Analytics', industry: 'Technology', value: 'enterprise', contact: 'Rachel Chen', email: 'rachel@datapulse.ai' },
  { name: 'Bloom Education', industry: 'EdTech', value: 'small', contact: 'Michael Brown', email: 'michael@bloomedu.org' },
  { name: 'Summit Real Estate', industry: 'Real Estate', value: 'mid-market', contact: 'Lisa Anderson', email: 'lisa@summitrealty.com' },
  { name: 'Nexus Innovations', industry: 'Technology', value: 'enterprise', contact: 'James Wilson', email: 'james@nexusinnovations.io' },
  { name: 'Artisan Coffee Roasters', industry: 'F&B', value: 'small', contact: 'Sophie Martin', email: 'sophie@artisancoffee.co' },
  { name: 'Velocity Logistics', industry: 'Logistics', value: 'enterprise', contact: 'Robert Kim', email: 'robert@velocitylogistics.com' },
]

// Projects that tell the success story
const PROJECTS = [
  // Early projects (Month 1-3) - smaller, building portfolio
  { name: 'Brand Identity Refresh', client: 0, value: 3500, status: 'Completed', month: 11 },
  { name: 'Website Redesign', client: 3, value: 5000, status: 'Completed', month: 10 },
  { name: 'Social Media Campaign', client: 4, value: 2500, status: 'Completed', month: 10 },

  // Growth phase (Month 4-6) - larger projects
  { name: 'E-commerce Platform Build', client: 1, value: 15000, status: 'Completed', month: 8 },
  { name: 'Mobile App MVP', client: 2, value: 25000, status: 'Completed', month: 7 },
  { name: 'Marketing Automation Setup', client: 4, value: 8000, status: 'Completed', month: 7 },

  // Scale phase (Month 7-9) - enterprise clients
  { name: 'Data Dashboard Development', client: 6, value: 18000, status: 'Completed', month: 5 },
  { name: 'Learning Platform Integration', client: 7, value: 12000, status: 'Completed', month: 4 },
  { name: 'CRM Implementation', client: 8, value: 9500, status: 'Completed', month: 4 },

  // Current phase (Month 10-12) - ongoing enterprise work
  { name: 'AI Analytics Dashboard', client: 6, value: 35000, status: 'In Progress', month: 2, progress: 75 },
  { name: 'Enterprise Portal Redesign', client: 9, value: 28000, status: 'In Progress', month: 1, progress: 45 },
  { name: 'Supply Chain Optimization', client: 11, value: 22000, status: 'In Progress', month: 1, progress: 30 },

  // Pipeline projects
  { name: 'Brand Strategy Consulting', client: 5, value: 15000, status: 'Not Started', month: 0, progress: 0 },
  { name: 'Mobile App Phase 2', client: 2, value: 30000, status: 'Not Started', month: 0, progress: 0 },
  { name: 'Q2 Marketing Campaign', client: 10, value: 8000, status: 'Not Started', month: 0, progress: 0 },
]

// Lead generation data showing successful funnel
// Valid source enum values: 'website', 'landing-page', 'social-media', 'email', 'referral', 'paid-ads', 'organic', 'other'
const LEADS = [
  // Hot leads (ready to convert)
  { name: 'Thomas Wright', company: 'Horizon Tech', email: 'thomas@horizontech.io', status: 'qualified', score: 92, source: 'website' },
  { name: 'Emily Chen', company: 'Spark Ventures', email: 'emily@sparkventures.co', status: 'qualified', score: 88, source: 'referral' },
  { name: 'Daniel Martinez', company: 'Blue Ocean Media', email: 'daniel@blueocean.media', status: 'contacted', score: 78, source: 'social-media' },

  // Warm leads
  { name: 'Katie Johnson', company: 'Pulse Digital', email: 'katie@pulsedigital.co', status: 'contacted', score: 72, source: 'website' },
  { name: 'Ryan O\'Brien', company: 'Celtic Innovations', email: 'ryan@celticinnovations.ie', status: 'new', score: 65, source: 'email' },
  { name: 'Maria Santos', company: 'Verde Solutions', email: 'maria@verde.solutions', status: 'new', score: 61, source: 'website' },

  // Cold leads (nurturing)
  { name: 'Alex Turner', company: 'North Star LLC', email: 'alex@northstar.llc', status: 'new', score: 45, source: 'organic' },
  { name: 'Jessica Lee', company: 'Summit Partners', email: 'jessica@summitpartners.com', status: 'new', score: 38, source: 'landing-page' },

  // Converted leads (success stories)
  { name: 'Sarah Mitchell', company: 'TechVenture Capital', email: 'sarah@techventure.io', status: 'converted', score: 95, source: 'referral', convertedTo: 0 },
  { name: 'Marcus Johnson', company: 'GreenLeaf Organics', email: 'marcus@greenleaf.co', status: 'converted', score: 91, source: 'website', convertedTo: 1 },
  { name: 'Jennifer Wu', company: 'CloudSync Solutions', email: 'jennifer@cloudsync.io', status: 'converted', score: 89, source: 'social-media', convertedTo: 2 },
]

// Invoices showing revenue growth
const INVOICES = [
  // Completed/Paid invoices (historical)
  { project: 0, amount: 3500, status: 'paid', month: 10, paidMonth: 10 },
  { project: 1, amount: 5000, status: 'paid', month: 9, paidMonth: 9 },
  { project: 2, amount: 2500, status: 'paid', month: 9, paidMonth: 9 },
  { project: 3, amount: 7500, status: 'paid', month: 7, paidMonth: 7 }, // 50% upfront
  { project: 3, amount: 7500, status: 'paid', month: 6, paidMonth: 6 }, // 50% completion
  { project: 4, amount: 12500, status: 'paid', month: 6, paidMonth: 6 },
  { project: 4, amount: 12500, status: 'paid', month: 5, paidMonth: 5 },
  { project: 5, amount: 8000, status: 'paid', month: 5, paidMonth: 5 },
  { project: 6, amount: 9000, status: 'paid', month: 4, paidMonth: 4 },
  { project: 6, amount: 9000, status: 'paid', month: 3, paidMonth: 3 },
  { project: 7, amount: 12000, status: 'paid', month: 3, paidMonth: 3 },
  { project: 8, amount: 9500, status: 'paid', month: 3, paidMonth: 2 },

  // Recent invoices
  { project: 9, amount: 17500, status: 'paid', month: 1, paidMonth: 1 }, // 50% milestone
  { project: 9, amount: 17500, status: 'sent', month: 0 }, // Final payment pending
  { project: 10, amount: 14000, status: 'sent', month: 0 }, // 50% milestone
  { project: 11, amount: 11000, status: 'draft', month: 0 }, // 50% milestone
]

// Monthly revenue targets (showing growth trajectory)
const MONTHLY_REVENUE = [
  { month: 12, revenue: 0, expenses: 500 },      // Starting out
  { month: 11, revenue: 3500, expenses: 800 },   // First client
  { month: 10, revenue: 7500, expenses: 1200 },  // Building momentum
  { month: 9, revenue: 11000, expenses: 1500 },  // Growth
  { month: 8, revenue: 15000, expenses: 2000 },  // Scaling
  { month: 7, revenue: 20500, expenses: 2500 },  // Strong month
  { month: 6, revenue: 17000, expenses: 2800 },  // Steady
  { month: 5, revenue: 18000, expenses: 3000 },  // Growth
  { month: 4, revenue: 21000, expenses: 3200 },  // Best month yet
  { month: 3, revenue: 19500, expenses: 3500 },  // Consistent
  { month: 2, revenue: 17500, expenses: 3800 },  // Solid
  { month: 1, revenue: 22000, expenses: 4000 },  // New record
]

// Time tracking data (hours per project)
const TIME_ENTRIES_PER_PROJECT = {
  // Completed projects - full hours logged
  0: { hours: 35, billable: 32 },
  1: { hours: 50, billable: 48 },
  2: { hours: 25, billable: 24 },
  3: { hours: 120, billable: 115 },
  4: { hours: 180, billable: 175 },
  5: { hours: 65, billable: 62 },
  6: { hours: 140, billable: 135 },
  7: { hours: 95, billable: 90 },
  8: { hours: 75, billable: 72 },
  // In progress projects
  9: { hours: 85, billable: 82 },
  10: { hours: 45, billable: 42 },
  11: { hours: 30, billable: 28 },
}

// Expenses showing business growth
const EXPENSES = [
  { description: 'Adobe Creative Cloud', amount: 54.99, category: 'software', recurring: true },
  { description: 'Figma Professional', amount: 15, category: 'software', recurring: true },
  { description: 'AWS Hosting', amount: 127.50, category: 'hosting', recurring: true },
  { description: 'Zoom Pro', amount: 15.99, category: 'software', recurring: true },
  { description: 'Notion Team', amount: 10, category: 'software', recurring: true },
  { description: 'Client Lunch - TechVenture', amount: 87.50, category: 'meals', recurring: false },
  { description: 'WeWork Day Pass', amount: 45, category: 'office', recurring: false },
  { description: 'Domain Renewals', amount: 156, category: 'hosting', recurring: false },
  { description: 'Conference Ticket - TechSummit', amount: 450, category: 'education', recurring: false },
  { description: 'New Monitor - 4K Display', amount: 599, category: 'equipment', recurring: false },
]

// ============================================================================
// SEEDING FUNCTIONS
// ============================================================================

async function getUserId(email: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('user_id')
    .eq('email', email)
    .single()

  if (error) {
    console.log(`User profile not found for ${email}, checking auth.users...`)
    // Try to find in auth.users
    const { data: authData } = await supabase.auth.admin.listUsers()
    const user = authData?.users?.find(u => u.email === email)
    return user?.id || null
  }
  return data?.user_id
}

async function seedDashboardStats(userId: string) {
  console.log('Seeding dashboard stats...')

  const totalRevenue = MONTHLY_REVENUE.reduce((sum, m) => sum + m.revenue, 0)
  const thisMonthRevenue = MONTHLY_REVENUE[1].revenue
  const lastMonthRevenue = MONTHLY_REVENUE[2].revenue

  const stats = {
    id: uuid(),
    user_id: userId,
    earnings: totalRevenue,
    earnings_trend: ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1),
    active_projects: PROJECTS.filter(p => p.status === 'In Progress').length,
    active_projects_trend: 15,
    completed_projects: PROJECTS.filter(p => p.status === 'Completed').length,
    completed_projects_trend: 25,
    total_clients: CLIENTS.length,
    total_clients_trend: 20,
    hours_this_month: 165,
    hours_this_month_trend: 8,
    revenue_this_month: thisMonthRevenue,
    revenue_this_month_trend: ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1),
    average_project_value: Math.round(PROJECTS.reduce((sum, p) => sum + p.value, 0) / PROJECTS.length),
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

  if (error) console.error('Error seeding dashboard stats:', error.message)
  else console.log('✓ Dashboard stats seeded')
}

async function seedDashboardProjects(userId: string) {
  console.log('Seeding dashboard projects...')

  // Map industry to valid project_category enum values
  const categoryMap: Record<string, string> = {
    'Finance': 'consulting',
    'E-commerce': 'development',
    'SaaS': 'development',
    'Health & Wellness': 'marketing',
    'Marketing': 'marketing',
    'Design': 'design',
    'Technology': 'development',
    'EdTech': 'development',
    'Real Estate': 'consulting',
    'F&B': 'content',
    'Logistics': 'development',
  }

  const projects = PROJECTS.map((p, idx) => ({
    id: uuid(),
    user_id: userId,
    name: p.name,
    client: CLIENTS[p.client].name,
    client_id: uuid(),
    progress: p.progress || (p.status === 'Completed' ? 100 : 0),
    status: p.status,
    value: p.value,
    currency: 'USD',
    priority: p.value > 20000 ? 'high' : p.value > 10000 ? 'medium' : 'low',
    category: categoryMap[CLIENTS[p.client].industry] || 'other',
    ai_automation: Math.random() > 0.5,
    collaboration: Math.floor(Math.random() * 5),
    deadline: daysAgo(-30 + (p.month * 30)),
    start_date: monthsAgo(p.month + 1),
    description: `${p.name} for ${CLIENTS[p.client].name}`,
    tags: [CLIENTS[p.client].industry.toLowerCase(), p.status.toLowerCase().replace(' ', '-')],
    is_starred: p.value > 25000,
    is_pinned: p.status === 'In Progress',
    completed_tasks: p.status === 'Completed' ? Math.floor(Math.random() * 20 + 10) : Math.floor((p.progress || 0) / 10),
    total_tasks: Math.floor(Math.random() * 10 + 15),
    hours_logged: TIME_ENTRIES_PER_PROJECT[idx]?.hours || 0,
    hours_estimated: Math.floor((TIME_ENTRIES_PER_PROJECT[idx]?.hours || 50) * 1.1),
    budget: p.value,
    spent: p.status === 'Completed' ? p.value * 0.92 : p.value * ((p.progress || 0) / 100) * 0.9,
    created_at: monthsAgo(p.month + 1),
    updated_at: p.status === 'In Progress' ? daysAgo(Math.floor(Math.random() * 5)) : monthsAgo(p.month)
  }))

  const { error } = await supabase
    .from('dashboard_projects')
    .upsert(projects)

  if (error) console.error('Error seeding projects:', error.message)
  else console.log(`✓ ${projects.length} projects seeded`)
}

async function seedDashboardActivities(userId: string) {
  console.log('Seeding dashboard activities...')

  const activities = [
    // Recent wins
    { type: 'payment', message: 'Payment received from DataPulse Analytics', description: '$17,500 for AI Dashboard milestone', status: 'success', impact: 'high', time: daysAgo(1) },
    { type: 'project', message: 'Project milestone completed', description: 'AI Analytics Dashboard - Phase 2 delivered', status: 'success', impact: 'high', time: daysAgo(2) },
    { type: 'client', message: 'New enterprise client signed', description: 'Nexus Innovations - $28,000 contract', status: 'success', impact: 'critical', time: daysAgo(3) },
    { type: 'feedback', message: '5-star review received', description: 'CloudSync Solutions: "Exceptional work on the mobile app!"', status: 'success', impact: 'medium', time: daysAgo(4) },

    // Recent activity
    { type: 'project', message: 'Project started', description: 'Supply Chain Optimization for Velocity Logistics', status: 'info', impact: 'medium', time: daysAgo(5) },
    { type: 'message', message: 'Client message received', description: 'Sarah Mitchell wants to discuss Q2 roadmap', status: 'info', impact: 'low', time: daysAgo(5) },
    { type: 'action', message: 'Invoice sent', description: 'INV-2026-042 to Nexus Innovations - $14,000', status: 'info', impact: 'medium', time: daysAgo(6) },
    { type: 'system', message: 'Weekly report generated', description: 'Revenue up 12% from last week', status: 'success', impact: 'low', time: daysAgo(7) },

    // Historical milestones
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
    .upsert(activityRecords)

  if (error) console.error('Error seeding activities:', error.message)
  else console.log(`✓ ${activityRecords.length} activities seeded`)
}

async function seedDashboardInsights(userId: string) {
  console.log('Seeding AI insights...')

  const insights = [
    {
      type: 'revenue',
      title: 'Revenue milestone approaching',
      description: 'You\'re on track to hit $150K annual revenue. At current pace, you\'ll reach this in 6 weeks.',
      impact: 'high',
      action: 'Review pricing strategy',
      action_url: '/dashboard/analytics',
      confidence: 92,
      priority: 1,
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
      is_ai_generated: true
    },
    {
      type: 'productivity',
      title: 'Optimal billing rate identified',
      description: 'Analysis shows you could increase hourly rate by 15% without losing clients. Current avg: $125/hr, suggested: $145/hr.',
      impact: 'high',
      action: 'Update rate card',
      action_url: '/dashboard/settings',
      confidence: 85,
      priority: 3,
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
      is_ai_generated: true
    }
  ]

  const insightRecords = insights.map(i => ({
    id: uuid(),
    user_id: userId,
    ...i,
    acted_upon: false,
    created_at: daysAgo(Math.floor(Math.random() * 7)),
    expires_at: daysAgo(-14),
    metadata: {},
    category: i.type,
    related_metrics: [],
    updated_at: new Date().toISOString()
  }))

  const { error } = await supabase
    .from('dashboard_insights')
    .upsert(insightRecords)

  if (error) console.error('Error seeding insights:', error.message)
  else console.log(`✓ ${insightRecords.length} AI insights seeded`)
}

async function seedDashboardMetrics(userId: string) {
  console.log('Seeding dashboard metrics...')

  const totalRevenue = MONTHLY_REVENUE.reduce((sum, m) => sum + m.revenue, 0)

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
    .upsert(metricRecords)

  if (error) console.error('Error seeding metrics:', error.message)
  else console.log(`✓ ${metricRecords.length} metrics seeded`)
}

async function seedDashboardGoals(userId: string) {
  console.log('Seeding goals...')

  const goals = [
    {
      title: 'Hit $150K Annual Revenue',
      description: 'Reach $150,000 in total revenue for the year',
      target: 150000,
      current: 125000,
      unit: 'USD',
      deadline: daysAgo(-60),
      status: 'on-track',
      category: 'financial'
    },
    {
      title: 'Acquire 5 Enterprise Clients',
      description: 'Sign contracts with 5 enterprise-level clients',
      target: 5,
      current: 4,
      unit: 'clients',
      deadline: daysAgo(-90),
      status: 'on-track',
      category: 'sales'
    },
    {
      title: 'Maintain 95% On-time Delivery',
      description: 'Deliver all projects on or before deadline',
      target: 95,
      current: 94,
      unit: '%',
      deadline: daysAgo(-30),
      status: 'on-track',
      category: 'quality'
    },
    {
      title: 'Build $200K Pipeline',
      description: 'Grow sales pipeline to $200K potential value',
      target: 200000,
      current: 163000,
      unit: 'USD',
      deadline: daysAgo(-45),
      status: 'on-track',
      category: 'sales'
    }
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
    status: g.status,
    category: g.category,
    created_at: monthsAgo(6),
    updated_at: daysAgo(1)
  }))

  const { error } = await supabase
    .from('dashboard_goals')
    .upsert(goalRecords)

  if (error) console.error('Error seeding goals:', error.message)
  else console.log(`✓ ${goalRecords.length} goals seeded`)
}

async function seedInvestorMetrics(userId: string) {
  console.log('Seeding investor metrics...')

  // Investor metrics schema uses specific column names for each metric type
  const metricRecord = {
    id: uuid(),
    user_id: userId,
    metric_date: new Date().toISOString().split('T')[0],
    period: 'monthly',

    // User Metrics
    total_users: 15, // demo shows personal freelance business
    active_users_daily: 1,
    active_users_weekly: 1,
    active_users_monthly: 1,
    user_growth_rate: 0,
    new_users_today: 0,
    new_users_this_week: 0,
    new_users_this_month: 0,
    churned_users: 0,
    churn_rate: 0,

    // Engagement Metrics
    avg_session_duration: 45, // 45 minutes
    avg_sessions_per_user: 8.5,
    avg_actions_per_session: 25,
    power_user_count: 1,
    active_projects_per_user: 3,

    // Revenue Metrics
    mrr: 12500,
    arr: 150000, // will be calculated by trigger
    revenue_growth: 47,
    avg_project_value: 14500,
    payment_velocity: 85,
    total_gmv: 125000,
    platform_revenue: 125000,
    revenue_per_user: 125000, // single user freelancer
    net_revenue_retention: 120,
    gross_revenue_retention: 95,

    // Retention Metrics
    ltv: 45000,
    cac: 450,
    ltv_cac_ratio: 100, // will be calculated
    payback_period: 1,

    // AI Metrics
    ai_engagement_rate: 78,
    total_ai_interactions: 450,
    ai_interactions_per_user: 450,
    avg_tokens_per_interaction: 2500,
    total_ai_cost: 125,
    ai_cost_per_user: 125,
    ai_value_created: 15000,
    ai_margin_contribution: 12,

    // Platform Metrics
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

  if (error) console.error('Error seeding investor metrics:', error.message)
  else console.log('✓ Investor metrics seeded')
}

async function seedLeads(userId: string) {
  console.log('Seeding leads...')

  const leadRecords = LEADS.map((l) => ({
    id: uuid(),
    user_id: userId,
    first_name: l.name.split(' ')[0],
    last_name: l.name.split(' ')[1] || '',
    email: l.email,
    company: l.company,
    status: l.status,
    score: l.score,
    score_label: l.score >= 80 ? 'hot' : l.score >= 60 ? 'warm' : 'cold',
    source: l.source,
    tags: [l.source, l.score >= 80 ? 'priority' : 'nurture'],
    last_contacted_at: l.status !== 'new' ? daysAgo(Math.floor(Math.random() * 14) + 1) : null,
    converted_at: l.status === 'converted' ? monthsAgo(Math.floor(Math.random() * 6) + 1) : null,
    created_at: monthsAgo(Math.floor(Math.random() * 8) + 1),
    updated_at: daysAgo(Math.floor(Math.random() * 7))
  }))

  const { error } = await supabase
    .from('lead_gen_leads')
    .upsert(leadRecords)

  if (error) console.error('Error seeding leads:', error.message)
  else console.log(`✓ ${leadRecords.length} leads seeded`)
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('🚀 Starting KAZI Investor Demo Data Seeding...\n')

  // Get demo user ID
  const userId = await getUserId(DEMO_USER_EMAIL)

  if (!userId) {
    console.error(`❌ Demo user ${DEMO_USER_EMAIL} not found. Please create the user first.`)
    process.exit(1)
  }

  console.log(`✓ Found demo user: ${DEMO_USER_EMAIL} (${userId})\n`)

  // Seed all demo data
  await seedDashboardStats(userId)
  await seedDashboardProjects(userId)
  await seedDashboardActivities(userId)
  await seedDashboardInsights(userId)
  await seedDashboardMetrics(userId)
  await seedDashboardGoals(userId)
  await seedInvestorMetrics(userId)
  await seedLeads(userId)

  console.log('\n✅ Demo data seeding complete!')
  console.log('\n📊 SUCCESS STORY SUMMARY:')
  console.log('   • Total Revenue: $125,000+')
  console.log('   • Active Clients: 12')
  console.log('   • Active Projects: 3 (In Progress)')
  console.log('   • Completed Projects: 9')
  console.log('   • Pipeline Value: $163,000')
  console.log('   • Client Satisfaction: 4.8/5')
  console.log('   • Lead Conversion: 45%')
  console.log('   • On-time Delivery: 94%')
}

main().catch(console.error)
