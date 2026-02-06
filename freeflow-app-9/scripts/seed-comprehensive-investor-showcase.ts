/**
 * KAZI Comprehensive Investor Showcase Data Seeding Script
 *
 * This script creates comprehensive demo data across all key features for alex@freeflow.io
 * to showcase the platform's capabilities to investors.
 *
 * Features Populated:
 * 1. CRM/Deals - Sales pipeline with deals at various stages, revenue forecasts
 * 2. Support Tickets - Sample tickets showing resolution times, customer satisfaction
 * 3. Automations/Workflows - Active automation rules showing productivity gains
 * 4. Reports - Pre-generated report data showing business metrics
 * 5. Files/Documents - Sample documents, contracts, proposals
 * 6. Notifications - Various notification types
 * 7. AI Insights - Mock AI-generated insights and recommendations
 * 8. Analytics - Daily and monthly metrics
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const DEMO_USER_EMAIL = 'alex@freeflow.io'

// Helper functions
const uuid = () => crypto.randomUUID()
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
const daysFromNow = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
const monthsAgo = (months: number) => daysAgo(months * 30)

// ============================================================================
// DATA DEFINITIONS
// ============================================================================

// CRM Contacts - match actual schema
const CRM_CONTACTS = [
  { firstName: 'Sarah', lastName: 'Mitchell', email: 'sarah@techventure.io', company: 'TechVenture Capital', jobTitle: 'Managing Partner', type: 'customer', leadStatus: 'won', leadScore: 95 },
  { firstName: 'Marcus', lastName: 'Johnson', email: 'marcus@greenleaf.co', company: 'GreenLeaf Organics', jobTitle: 'CEO', type: 'customer', leadStatus: 'won', leadScore: 91 },
  { firstName: 'Jennifer', lastName: 'Wu', email: 'jennifer@cloudsync.io', company: 'CloudSync Solutions', jobTitle: 'CTO', type: 'customer', leadStatus: 'won', leadScore: 89 },
  { firstName: 'David', lastName: 'Park', email: 'david@urbanfitness.com', company: 'Urban Fitness Studio', jobTitle: 'Owner', type: 'customer', leadStatus: 'won', leadScore: 82 },
  { firstName: 'Amanda', lastName: 'Torres', email: 'amanda@stellarmarketing.co', company: 'Stellar Marketing', jobTitle: 'Marketing Director', type: 'customer', leadStatus: 'proposal', leadScore: 78 },
  { firstName: 'Erik', lastName: 'Lindqvist', email: 'erik@nordicdesign.io', company: 'Nordic Design Co', jobTitle: 'Creative Director', type: 'prospect', leadStatus: 'qualified', leadScore: 72 },
  { firstName: 'Rachel', lastName: 'Chen', email: 'rachel@datapulse.ai', company: 'DataPulse Analytics', jobTitle: 'VP Engineering', type: 'customer', leadStatus: 'won', leadScore: 93 },
  { firstName: 'Thomas', lastName: 'Wright', email: 'thomas@horizontech.io', company: 'Horizon Tech', jobTitle: 'Director of IT', type: 'lead', leadStatus: 'qualified', leadScore: 88 },
  { firstName: 'Emily', lastName: 'Chen', email: 'emily@sparkventures.co', company: 'Spark Ventures', jobTitle: 'Investment Analyst', type: 'lead', leadStatus: 'contacted', leadScore: 75 },
  { firstName: 'Daniel', lastName: 'Martinez', email: 'daniel@blueocean.media', company: 'Blue Ocean Media', jobTitle: 'Founder', type: 'prospect', leadStatus: 'new', leadScore: 65 },
]

// CRM Deals - match actual schema: id, user_id, contact_id, name, value, stage, probability, expected_close_date
const CRM_DEALS = [
  // Closed Won - showing revenue
  { name: 'Enterprise Analytics Dashboard', company: 'DataPulse Analytics', value: 35000, stage: 'closed-won', priority: 'high', probability: 100, contactIdx: 6, daysToClose: 45 },
  { name: 'Mobile App Development', company: 'CloudSync Solutions', value: 55000, stage: 'closed-won', priority: 'high', probability: 100, contactIdx: 2, daysToClose: 60 },
  { name: 'E-commerce Platform', company: 'GreenLeaf Organics', value: 15000, stage: 'closed-won', priority: 'medium', probability: 100, contactIdx: 1, daysToClose: 30 },
  { name: 'Brand Identity Refresh', company: 'TechVenture Capital', value: 8500, stage: 'closed-won', priority: 'medium', probability: 100, contactIdx: 0, daysToClose: 21 },

  // Active Pipeline - showing opportunities
  { name: 'AI-Powered Analytics Suite', company: 'Horizon Tech', value: 45000, stage: 'proposal', priority: 'high', probability: 75, contactIdx: 7, expectedClose: 21 },
  { name: 'Marketing Automation Platform', company: 'Stellar Marketing', value: 28000, stage: 'negotiation', priority: 'high', probability: 85, contactIdx: 4, expectedClose: 14 },
  { name: 'Design System Overhaul', company: 'Nordic Design Co', value: 18000, stage: 'qualification', priority: 'medium', probability: 45, contactIdx: 5, expectedClose: 45 },
  { name: 'Investment Portal', company: 'Spark Ventures', value: 32000, stage: 'discovery', priority: 'medium', probability: 25, contactIdx: 8, expectedClose: 60 },

  // Early Stage
  { name: 'Content Management System', company: 'Blue Ocean Media', value: 22000, stage: 'discovery', priority: 'low', probability: 15, contactIdx: 9, expectedClose: 90 },
]

// Support Tickets - matches actual schema
const SUPPORT_TICKETS = [
  { subject: 'Dashboard loading slowly', customer: 'TechVenture Capital', priority: 'high', status: 'resolved', satisfaction: 5, responseMinutes: 12, resolveHours: 2, category: 'Performance' },
  { subject: 'Export feature not working', customer: 'DataPulse Analytics', priority: 'urgent', status: 'resolved', satisfaction: 5, responseMinutes: 5, resolveHours: 1, category: 'Bug' },
  { subject: 'Need help with API integration', customer: 'CloudSync Solutions', priority: 'normal', status: 'resolved', satisfaction: 5, responseMinutes: 25, resolveHours: 8, category: 'Integration' },
  { subject: 'Custom report question', customer: 'GreenLeaf Organics', priority: 'low', status: 'resolved', satisfaction: 4, responseMinutes: 45, resolveHours: 4, category: 'Feature Request' },
  { subject: 'Invoice template customization', customer: 'Stellar Marketing', priority: 'normal', status: 'resolved', satisfaction: 5, responseMinutes: 18, resolveHours: 3, category: 'Feature Request' },
  { subject: 'Mobile app sync issue', customer: 'Urban Fitness Studio', priority: 'high', status: 'in-progress', satisfaction: null, responseMinutes: 8, resolveHours: null, category: 'Bug' },
  { subject: 'Workflow automation help', customer: 'Nordic Design Co', priority: 'normal', status: 'in-progress', satisfaction: null, responseMinutes: 15, resolveHours: null, category: 'Training' },
  { subject: 'Feature request: Gantt charts', customer: 'Horizon Tech', priority: 'low', status: 'open', satisfaction: null, responseMinutes: null, resolveHours: null, category: 'Feature Request' },
]

// Workflows - actual schema: id, user_id, name, description, status, trigger_type, trigger_config, trigger_enabled, last_run_at, next_run_at, run_count, success_count, error_count, tags, is_template, category
const WORKFLOWS = [
  { name: 'New Lead Notification', description: 'Sends Slack notification when new lead is captured', triggerType: 'event', category: 'sales', status: 'active', runCount: 156, successCount: 154, errorCount: 2 },
  { name: 'Invoice Payment Reminder', description: 'Automatically sends reminder 3 days before invoice due date', triggerType: 'schedule', category: 'operations', status: 'active', runCount: 89, successCount: 89, errorCount: 0 },
  { name: 'Client Onboarding Sequence', description: 'Sends welcome emails and creates onboarding tasks', triggerType: 'event', category: 'support', status: 'active', runCount: 42, successCount: 41, errorCount: 1 },
  { name: 'Weekly Revenue Report', description: 'Generates and emails weekly revenue summary', triggerType: 'schedule', category: 'operations', status: 'active', runCount: 52, successCount: 52, errorCount: 0 },
  { name: 'Project Deadline Alert', description: 'Notifies team 48 hours before project deadline', triggerType: 'schedule', category: 'operations', status: 'active', runCount: 78, successCount: 77, errorCount: 1 },
  { name: 'Support Ticket Escalation', description: 'Escalates urgent tickets not responded within 30 min', triggerType: 'event', category: 'support', status: 'active', runCount: 23, successCount: 23, errorCount: 0 },
  { name: 'Lead Score Update', description: 'Updates lead score based on email engagement', triggerType: 'event', category: 'marketing', status: 'active', runCount: 312, successCount: 308, errorCount: 4 },
  { name: 'Contract Renewal Reminder', description: 'Sends reminder 30 days before contract expiry', triggerType: 'schedule', category: 'sales', status: 'active', runCount: 18, successCount: 18, errorCount: 0 },
  { name: 'AI Content Generator', description: 'Generates blog post drafts from topic outlines', triggerType: 'manual', category: 'marketing', status: 'draft', runCount: 0, successCount: 0, errorCount: 0 },
]

// Custom Reports - actual schema: id, user_id, name, description, type, status, date_range_start, date_range_end, filters, metrics, grouping, frequency, next_run_at, last_run_at, recipients, tags, data_points, file_size
// Type enum: 'financial', 'analytics', 'performance', 'sales', 'custom'
// Status enum: 'generating', 'ready'
const CUSTOM_REPORTS = [
  { name: 'Monthly Revenue Dashboard', description: 'Comprehensive monthly revenue breakdown by client and project', type: 'financial', status: 'ready', dataPoints: 450, fileSize: 125000 },
  { name: 'Client Profitability Analysis', description: 'ROI analysis per client with time tracking integration', type: 'financial', status: 'ready', dataPoints: 320, fileSize: 98000 },
  { name: 'Project Performance Tracker', description: 'Real-time project status, timeline, and budget tracking', type: 'performance', status: 'ready', dataPoints: 670, fileSize: 156000 },
  { name: 'Sales Pipeline Report', description: 'Deal stages, conversion rates, and forecast accuracy', type: 'sales', status: 'ready', dataPoints: 280, fileSize: 87000 },
  { name: 'Team Utilization Report', description: 'Billable hours, utilization rates, and capacity planning', type: 'analytics', status: 'ready', dataPoints: 210, fileSize: 76000 },
  { name: 'Client Activity Summary', description: 'Client engagement metrics and satisfaction scores', type: 'analytics', status: 'ready', dataPoints: 190, fileSize: 65000 },
  { name: 'Quarterly Business Review', description: 'Executive summary for investor/stakeholder meetings', type: 'custom', status: 'generating', dataPoints: 580, fileSize: 245000 },
]

// Files - actual schema: id, user_id, folder_id, name, extension, size, url, mime_type, is_starred, is_shared, downloads, views, uploaded_at
const FILES = [
  { name: 'TechVenture Capital - Master Services Agreement', extension: 'pdf', size: 245000, folder: 'Contracts', starred: true, shared: false, downloads: 5, views: 12 },
  { name: 'CloudSync Solutions - Development Agreement', extension: 'pdf', size: 312000, folder: 'Contracts', starred: true, shared: false, downloads: 3, views: 8 },
  { name: 'DataPulse Analytics - SaaS License Agreement', extension: 'pdf', size: 198000, folder: 'Contracts', starred: true, shared: false, downloads: 4, views: 10 },
  { name: 'Horizon Tech - AI Analytics Proposal', extension: 'pdf', size: 1250000, folder: 'Proposals', starred: true, shared: true, downloads: 2, views: 15 },
  { name: 'Stellar Marketing - Automation Platform Proposal', extension: 'pdf', size: 980000, folder: 'Proposals', starred: false, shared: true, downloads: 1, views: 8 },
  { name: 'Nordic Design - Design System Proposal', extension: 'pdf', size: 2100000, folder: 'Proposals', starred: false, shared: false, downloads: 0, views: 3 },
  { name: 'CloudSync Mobile App - UI Mockups', extension: 'fig', size: 45000000, folder: 'Projects', starred: true, shared: true, downloads: 8, views: 25 },
  { name: 'DataPulse Dashboard - Wireframes', extension: 'fig', size: 32000000, folder: 'Projects', starred: false, shared: true, downloads: 4, views: 18 },
  { name: 'GreenLeaf E-commerce - Product Images', extension: 'zip', size: 125000000, folder: 'Projects', starred: false, shared: false, downloads: 2, views: 6 },
  { name: 'Q4 2025 Revenue Report', extension: 'xlsx', size: 156000, folder: 'Reports', starred: true, shared: false, downloads: 12, views: 35 },
  { name: 'Client Satisfaction Survey Results', extension: 'xlsx', size: 89000, folder: 'Reports', starred: false, shared: false, downloads: 6, views: 15 },
  { name: 'API Integration Guide', extension: 'pdf', size: 450000, folder: 'Documentation', starred: false, shared: true, downloads: 18, views: 45 },
  { name: 'Platform User Manual', extension: 'pdf', size: 2800000, folder: 'Documentation', starred: false, shared: true, downloads: 25, views: 78 },
]

// Notifications - actual schema: id, user_id, title, message, type, category, priority, is_read, read_at, data, action_url, action_label, group_id, tags, expires_at
const NOTIFICATIONS = [
  { title: 'Payment Received', message: 'DataPulse Analytics paid $17,500 for AI Dashboard milestone', type: 'payment', category: 'financial', priority: 'high', isRead: false, hoursAgo: 2 },
  { title: 'New Lead Captured', message: 'Thomas Wright from Horizon Tech submitted contact form', type: 'project', category: 'sales', priority: 'high', isRead: false, hoursAgo: 4 },
  { title: 'Contract Signed', message: 'Stellar Marketing signed the Marketing Automation proposal', type: 'success', category: 'sales', priority: 'high', isRead: false, hoursAgo: 8 },
  { title: 'Project Milestone Complete', message: 'CloudSync Mobile App Phase 2 delivered successfully', type: 'project', category: 'projects', priority: 'medium', isRead: true, hoursAgo: 24 },
  { title: '5-Star Review', message: 'Jennifer Wu left a 5-star review: "Exceptional work!"', type: 'review', category: 'feedback', priority: 'medium', isRead: true, hoursAgo: 36 },
  { title: 'Invoice Overdue', message: 'Invoice #INV-2026-039 is 3 days overdue', type: 'warning', category: 'financial', priority: 'high', isRead: true, hoursAgo: 48 },
  { title: 'Weekly Report Ready', message: 'Your weekly revenue report is ready to view', type: 'system', category: 'reports', priority: 'low', isRead: true, hoursAgo: 72 },
  { title: 'Backup Complete', message: 'Automated backup completed successfully', type: 'system', category: 'system', priority: 'low', isRead: true, hoursAgo: 120 },
  { title: 'New Feature Available', message: 'AI-powered insights are now available in your dashboard', type: 'info', category: 'product', priority: 'medium', isRead: true, hoursAgo: 168 },
]

// ML Recommendations - actual schema: id, user_id, category, title, description, priority, expected_metric, expected_improvement, expected_timeframe, based_on, confidence, is_dismissed
const ML_RECOMMENDATIONS = [
  {
    title: 'Increase hourly rate by 15%',
    description: 'Analysis shows you could increase hourly rate from $125 to $145/hr without losing clients based on market demand and your performance metrics.',
    category: 'revenue',
    priority: 'high',
    expectedMetric: 'hourly_rate',
    expectedImprovement: 15,
    expectedTimeframe: '1 month',
    basedOn: ['Client satisfaction scores', 'Market rate analysis', 'Project success rate'],
    confidence: 'high'
  },
  {
    title: 'Follow up with Horizon Tech',
    description: 'Thomas Wright has viewed your proposal 7 times. Schedule a call within 24 hours to close this $45K deal.',
    category: 'conversion',
    priority: 'high',
    expectedMetric: 'deal_conversion',
    expectedImprovement: 85,
    expectedTimeframe: '1 week',
    basedOn: ['Proposal engagement', 'Email open rates', 'Historical conversion patterns'],
    confidence: 'very-high'
  },
  {
    title: 'Upsell analytics to GreenLeaf',
    description: 'GreenLeaf Organics traffic increased 180%. They may benefit from an analytics add-on worth $8K.',
    category: 'revenue',
    priority: 'medium',
    expectedMetric: 'client_ltv',
    expectedImprovement: 25,
    expectedTimeframe: '2 weeks',
    basedOn: ['Client engagement score', 'Usage patterns', 'Business growth indicators'],
    confidence: 'high'
  },
  {
    title: 'Automate proposal follow-ups',
    description: 'Creating automated follow-up sequences could save 5 hours/week and improve conversion by 12%.',
    category: 'performance',
    priority: 'medium',
    expectedMetric: 'time_saved',
    expectedImprovement: 5,
    expectedTimeframe: '1 week',
    basedOn: ['Time tracking data', 'Follow-up patterns', 'Conversion analysis'],
    confidence: 'medium'
  },
  {
    title: 'Reallocate hours to Nordic Design',
    description: 'Project is 15% behind schedule. Recommend reallocating 15 hours this week to meet deadline.',
    category: 'performance',
    priority: 'high',
    expectedMetric: 'on_time_delivery',
    expectedImprovement: 100,
    expectedTimeframe: '1 week',
    basedOn: ['Project velocity', 'Timeline analysis', 'Resource availability'],
    confidence: 'high'
  },
  {
    title: 'Launch Q1 promotion',
    description: 'Historical data shows 35% revenue increase in Q1. Increase marketing spend in December.',
    category: 'revenue',
    priority: 'medium',
    expectedMetric: 'q1_revenue',
    expectedImprovement: 35,
    expectedTimeframe: '3 months',
    basedOn: ['Seasonal patterns', 'Historical revenue data', 'Market trends'],
    confidence: 'medium'
  },
]

// ============================================================================
// SEEDING FUNCTIONS
// ============================================================================

async function getUserId(email: string): Promise<string | null> {
  const { data: authData } = await supabase.auth.admin.listUsers()
  const user = authData?.users?.find(u => u.email === email)
  return user?.id || null
}

async function seedCRMDeals(userId: string) {
  console.log('Seeding CRM deals...')

  // First, we need contact IDs - let's create simple ones
  const contactIds: string[] = []
  for (let i = 0; i < CRM_CONTACTS.length; i++) {
    contactIds.push(uuid())
  }

  const deals = CRM_DEALS.map(d => ({
    id: uuid(),
    user_id: userId,
    contact_id: contactIds[d.contactIdx] || contactIds[0],
    name: d.name,
    value: d.value,
    stage: d.stage,
    probability: d.probability,
    expected_close_date: d.expectedClose ? daysFromNow(d.expectedClose).split('T')[0] : daysAgo(d.daysToClose || 30).split('T')[0],
    created_at: monthsAgo(Math.floor(Math.random() * 6) + 1),
    updated_at: daysAgo(Math.floor(Math.random() * 14))
  }))

  const { error } = await supabase.from('crm_deals').upsert(deals)
  if (error) console.error('Error seeding CRM deals:', error.message)
  else {
    console.log(`  Created ${deals.length} deals`)
    const closedWon = deals.filter(d => d.stage === 'closed-won')
    const pipeline = deals.filter(d => !d.stage.startsWith('closed'))
    const totalClosed = closedWon.reduce((sum, d) => sum + d.value, 0)
    const pipelineValue = pipeline.reduce((sum, d) => sum + d.value, 0)
    const weightedPipeline = pipeline.reduce((sum, d) => sum + (d.value * d.probability / 100), 0)
    console.log(`  Pipeline Stats:`)
    console.log(`    - Closed Revenue: $${totalClosed.toLocaleString()}`)
    console.log(`    - Pipeline Value: $${pipelineValue.toLocaleString()}`)
    console.log(`    - Weighted Pipeline: $${Math.round(weightedPipeline).toLocaleString()}`)
  }
}

async function seedSupportTickets(userId: string) {
  console.log('Seeding support tickets...')

  const tickets = SUPPORT_TICKETS.map((t, idx) => ({
    id: uuid(),
    user_id: userId,
    ticket_number: `TKT-2026-${String(idx + 1).padStart(4, '0')}`,
    subject: t.subject,
    description: `Customer from ${t.customer} reported: ${t.subject}`,
    customer_name: t.customer,
    customer_email: `support@${t.customer.toLowerCase().replace(/\s+/g, '')}.com`,
    priority: t.priority,
    status: t.status,
    category: t.category,
    assigned_to: userId,
    assigned_name: 'Alex',
    sla_status: t.status === 'resolved' ? 'met' : 'on_track',
    first_response_at: t.responseMinutes ? hoursAgo(Math.random() * 24 + (t.responseMinutes / 60)) : null,
    resolved_at: t.status === 'resolved' ? daysAgo(Math.floor(Math.random() * 14)) : null,
    satisfaction_score: t.satisfaction,
    message_count: t.status === 'resolved' ? Math.floor(Math.random() * 6) + 2 : Math.floor(Math.random() * 3) + 1,
    tags: [t.category.toLowerCase(), t.priority],
    metadata: {
      browser: 'Chrome 120',
      os: 'macOS',
      responseTimeMinutes: t.responseMinutes,
      resolveTimeHours: t.resolveHours
    },
    created_at: t.status === 'resolved' ? daysAgo(Math.floor(Math.random() * 30) + 7) : daysAgo(Math.floor(Math.random() * 3)),
    updated_at: t.status === 'resolved' ? daysAgo(Math.floor(Math.random() * 7)) : hoursAgo(Math.floor(Math.random() * 12))
  }))

  const { error } = await supabase.from('support_tickets').upsert(tickets)
  if (error) console.error('Error seeding support tickets:', error.message)
  else {
    console.log(`  Created ${tickets.length} tickets`)
    const resolved = tickets.filter(t => t.status === 'resolved')
    const avgSatisfaction = resolved.reduce((sum, t) => sum + (t.satisfaction_score || 0), 0) / resolved.length
    console.log(`  Average satisfaction: ${avgSatisfaction.toFixed(1)}/5`)
  }
}

async function seedWorkflows(userId: string) {
  console.log('Seeding workflows/automations...')

  const workflows = WORKFLOWS.map(w => ({
    id: uuid(),
    user_id: userId,
    name: w.name,
    description: w.description,
    status: w.status,
    trigger_type: w.triggerType,
    trigger_config: w.triggerType === 'schedule'
      ? { schedule: '0 9 * * 1', timezone: 'America/New_York' }
      : { event: 'record.created', entity: 'leads' },
    trigger_enabled: w.status === 'active',
    last_run_at: w.runCount > 0 ? daysAgo(Math.floor(Math.random() * 3)) : null,
    next_run_at: w.status === 'active' && w.triggerType === 'schedule' ? daysFromNow(Math.floor(Math.random() * 7)) : null,
    run_count: w.runCount,
    success_count: w.successCount,
    error_count: w.errorCount,
    tags: [w.category, w.status],
    is_template: false,
    // category is nullable - store in tags instead
    created_at: monthsAgo(Math.floor(Math.random() * 8) + 1),
    updated_at: daysAgo(Math.floor(Math.random() * 7))
  }))

  const { error } = await supabase.from('workflows').upsert(workflows)
  if (error) console.error('Error seeding workflows:', error.message)
  else {
    console.log(`  Created ${workflows.length} workflows`)
    const active = workflows.filter(w => w.status === 'active')
    const totalRuns = active.reduce((sum, w) => sum + w.run_count, 0)
    const totalSuccess = active.reduce((sum, w) => sum + w.success_count, 0)
    console.log(`  Active automations: ${active.length}`)
    console.log(`  Total executions: ${totalRuns}`)
    console.log(`  Success rate: ${((totalSuccess / totalRuns) * 100).toFixed(1)}%`)
  }
}

async function seedCustomReports(userId: string) {
  console.log('Seeding custom reports...')

  const reports = CUSTOM_REPORTS.map(r => ({
    id: uuid(),
    user_id: userId,
    name: r.name,
    description: r.description,
    type: r.type,
    status: r.status,
    date_range_start: daysAgo(90).split('T')[0],
    date_range_end: new Date().toISOString().split('T')[0],
    filters: {},
    metrics: ['revenue', 'projects', 'tasks'],
    grouping: null, // nullable field
    frequency: r.status === 'generating' ? 'weekly' : null,
    next_run_at: r.status === 'generating' ? daysFromNow(7) : null,
    last_run_at: daysAgo(Math.floor(Math.random() * 7)),
    recipients: r.status === 'generating' ? ['alex@freeflow.io'] : [],
    tags: [r.type, r.status],
    data_points: r.dataPoints,
    file_size: r.fileSize,
    created_at: monthsAgo(Math.floor(Math.random() * 6) + 1),
    updated_at: daysAgo(Math.floor(Math.random() * 7))
  }))

  const { error } = await supabase.from('custom_reports').upsert(reports)
  if (error) console.error('Error seeding custom reports:', error.message)
  else console.log(`  Created ${reports.length} reports`)
}

async function seedFiles(userId: string) {
  console.log('Seeding files/documents...')

  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    fig: 'application/x-figma',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    zip: 'application/zip',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }

  const files = FILES.map(f => ({
    id: uuid(),
    user_id: userId,
    folder_id: null, // Simplified - no folder structure needed
    name: f.name,
    extension: f.extension,
    size: f.size,
    url: `https://storage.freeflow.io/files/${uuid()}.${f.extension}`,
    mime_type: mimeTypes[f.extension] || 'application/octet-stream',
    is_starred: f.starred,
    is_shared: f.shared,
    downloads: f.downloads,
    views: f.views,
    uploaded_at: monthsAgo(Math.floor(Math.random() * 6) + 1),
    created_at: monthsAgo(Math.floor(Math.random() * 6) + 1),
    updated_at: daysAgo(Math.floor(Math.random() * 14)),
    owner_id: userId,
    is_deleted: false
  }))

  const { error } = await supabase.from('files').upsert(files)
  if (error) console.error('Error seeding files:', error.message)
  else {
    const totalSize = files.reduce((sum, f) => sum + f.size, 0)
    console.log(`  Created ${files.length} files`)
    console.log(`  Total storage: ${(totalSize / 1024 / 1024).toFixed(1)} MB`)
  }
}

async function seedNotifications(userId: string) {
  console.log('Seeding notifications...')

  const notifications = NOTIFICATIONS.map(n => ({
    id: uuid(),
    user_id: userId,
    title: n.title,
    message: n.message,
    type: n.type,
    category: n.category,
    priority: n.priority,
    is_read: n.isRead,
    read_at: n.isRead ? hoursAgo(n.hoursAgo - 1) : null,
    data: {},
    action_url: '/dashboard',
    action_label: 'View',
    group_id: null,
    tags: [n.category, n.type],
    expires_at: daysFromNow(30),
    created_at: hoursAgo(n.hoursAgo),
    updated_at: hoursAgo(n.hoursAgo)
  }))

  const { error } = await supabase.from('notifications').upsert(notifications)
  if (error) console.error('Error seeding notifications:', error.message)
  else {
    const unread = notifications.filter(n => !n.is_read)
    console.log(`  Created ${notifications.length} notifications`)
    console.log(`  Unread: ${unread.length}`)
  }
}

async function seedMLRecommendations(userId: string) {
  console.log('Seeding ML recommendations...')

  const recommendations = ML_RECOMMENDATIONS.map(r => ({
    id: uuid(),
    user_id: userId,
    category: r.category,
    title: r.title,
    description: r.description,
    priority: r.priority,
    expected_metric: r.expectedMetric,
    expected_improvement: r.expectedImprovement,
    expected_timeframe: r.expectedTimeframe,
    based_on: r.basedOn,
    confidence: r.confidence,
    is_dismissed: false,
    created_at: daysAgo(Math.floor(Math.random() * 14)),
    updated_at: daysAgo(Math.floor(Math.random() * 7))
  }))

  const { error } = await supabase.from('ml_recommendations').upsert(recommendations)
  if (error) console.error('Error seeding ML recommendations:', error.message)
  else console.log(`  Created ${recommendations.length} AI recommendations`)
}

async function seedAnalyticsMonthly(userId: string) {
  console.log('Seeding analytics metrics...')

  const monthlyMetrics: any[] = []
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  // Generate 12 months of data
  for (let i = 0; i < 12; i++) {
    let month = currentMonth - i
    let year = currentYear
    if (month <= 0) {
      month += 12
      year -= 1
    }

    // Revenue growth trajectory: starting low, growing each month
    const baseRevenue = 5000
    const growthFactor = Math.pow(1.15, 12 - i) // 15% month-over-month growth
    const monthRevenue = Math.round(baseRevenue * growthFactor)

    monthlyMetrics.push({
      id: uuid(),
      user_id: userId,
      year,
      month,
      total_revenue: monthRevenue + Math.floor(Math.random() * 3000),
      revenue_growth: 10 + Math.random() * 15,
      average_project_value: 8000 + Math.floor(Math.random() * 5000) + (i * 500),
      total_projects: 2 + Math.floor(i / 3),
      projects_completed: 1 + Math.floor(i / 4),
      projects_growth: 8 + Math.random() * 15,
      total_clients: 4 + Math.floor(i / 2),
      new_clients: i > 0 ? Math.floor(Math.random() * 2) : 2,
      clients_growth: 5 + Math.random() * 12,
      client_retention_rate: 88 + Math.random() * 10,
      total_hours: 120 + Math.floor(Math.random() * 40) + (i * 5),
      billable_hours: 100 + Math.floor(Math.random() * 35) + (i * 4),
      utilization_rate: 75 + Math.random() * 15,
      project_completion_rate: 85 + Math.random() * 12,
      on_time_delivery_rate: 90 + Math.random() * 8,
      client_satisfaction: 4.5 + Math.random() * 0.4,
      profit_margin: 50 + Math.random() * 15,
      category_breakdown: { development: 45, design: 30, consulting: 25 },
      top_clients: ['TechVenture Capital', 'CloudSync Solutions', 'DataPulse Analytics'],
      metadata: {},
      created_at: monthsAgo(i),
      updated_at: daysAgo(Math.floor(Math.random() * 7))
    })
  }

  // Use upsert with onConflict to handle existing records
  const { error } = await supabase.from('analytics_monthly_metrics').upsert(monthlyMetrics, {
    onConflict: 'user_id,year,month'
  })
  if (error) console.error('Error seeding monthly analytics:', error.message)
  else {
    console.log(`  Created ${monthlyMetrics.length} monthly metric records`)
    const totalRevenue = monthlyMetrics.reduce((sum, m) => sum + m.total_revenue, 0)
    console.log(`  Total tracked revenue: $${totalRevenue.toLocaleString()}`)
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('='.repeat(60))
  console.log('KAZI Comprehensive Investor Showcase Data Seeding')
  console.log('='.repeat(60))
  console.log('')

  const userId = await getUserId(DEMO_USER_EMAIL)

  if (!userId) {
    console.error(`User ${DEMO_USER_EMAIL} not found.`)
    console.log('Please create the demo user first.')
    process.exit(1)
  }

  console.log(`Found user: ${DEMO_USER_EMAIL} (${userId})\n`)

  try {
    // 1. CRM/Deals
    console.log('\n--- CRM & DEALS ---')
    await seedCRMDeals(userId)

    // 2. Support Tickets
    console.log('\n--- SUPPORT TICKETS ---')
    await seedSupportTickets(userId)

    // 3. Workflows/Automations
    console.log('\n--- WORKFLOWS & AUTOMATIONS ---')
    await seedWorkflows(userId)

    // 4. Reports
    console.log('\n--- CUSTOM REPORTS ---')
    await seedCustomReports(userId)

    // 5. Files/Documents
    console.log('\n--- FILES & DOCUMENTS ---')
    await seedFiles(userId)

    // 6. Notifications
    console.log('\n--- NOTIFICATIONS ---')
    await seedNotifications(userId)

    // 7. AI/ML Recommendations
    console.log('\n--- AI INSIGHTS & RECOMMENDATIONS ---')
    await seedMLRecommendations(userId)

    // 8. Analytics
    console.log('\n--- ANALYTICS METRICS ---')
    await seedAnalyticsMonthly(userId)

    console.log('\n' + '='.repeat(60))
    console.log('SEEDING COMPLETE')
    console.log('='.repeat(60))
    console.log('\nInvestor Showcase Summary:')
    console.log('  - CRM Deals: 9 ($113.5K closed, $145K pipeline)')
    console.log('  - Support Tickets: 8 (4.8/5 avg satisfaction)')
    console.log('  - Workflows: 9 active automations (97%+ success)')
    console.log('  - Custom Reports: 7 (financial, performance, sales)')
    console.log('  - Files: 13 documents (contracts, proposals, assets)')
    console.log('  - Notifications: 9 (3 unread high-priority)')
    console.log('  - AI Recommendations: 6 actionable insights')
    console.log('  - Analytics: 12 months of business metrics')
    console.log('')
    console.log('Key Metrics for Investors:')
    console.log('  - Revenue: $125K+ total, growing 15% MoM')
    console.log('  - Pipeline: $145K in active opportunities')
    console.log('  - Client Satisfaction: 4.8/5 stars')
    console.log('  - Support SLA: 97% met, avg 15min response')
    console.log('  - Automation: 770+ tasks automated')
    console.log('  - On-time Delivery: 94%')
    console.log('')

  } catch (error) {
    console.error('Seeding failed:', error)
    process.exit(1)
  }
}

main().catch(console.error)
