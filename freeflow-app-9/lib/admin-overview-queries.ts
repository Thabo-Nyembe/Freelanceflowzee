// Admin Overview System - Supabase Queries
// Comprehensive queries for business admin intelligence dashboard
// Modules: Analytics, CRM, Invoicing, Marketing, Operations, Automation

import { createClient } from '@/lib/supabase/client'

// ============================================================================
// TYPES
// ============================================================================

// Analytics Module
export interface AdminAnalyticsEvent {
  id: string
  user_id: string
  event_type: 'page_view' | 'conversion' | 'purchase' | 'signup' | 'custom'
  event_name: string
  event_value: number
  properties: Record<string, any>
  source?: string
  medium?: string
  campaign?: string
  referrer?: string
  user_agent?: string
  ip_address?: string
  session_id?: string
  timestamp: string
  created_at: string
}

export interface AdminAnalyticsReport {
  id: string
  user_id: string
  report_name: string
  report_type: 'revenue' | 'traffic' | 'conversion' | 'custom'
  date_from: string
  date_to: string
  format: 'csv' | 'pdf' | 'json'
  data: Record<string, any>
  file_url?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
  completed_at?: string
}

export interface AdminAnalyticsGoal {
  id: string
  user_id: string
  goal_name: string
  goal_type: 'revenue' | 'conversions' | 'traffic' | 'custom'
  target_value: number
  current_value: number
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  start_date: string
  end_date: string
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  created_at: string
  updated_at: string
}

// CRM Module
export interface AdminCrmDeal {
  id: string
  user_id: string
  company_name: string
  contact_id?: string
  deal_value: number
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
  priority: 'hot' | 'warm' | 'cold'
  probability: number
  expected_close_date?: string
  actual_close_date?: string
  lost_reason?: string
  notes?: string
  tags: string[]
  custom_fields: Record<string, any>
  created_at: string
  updated_at: string
  last_activity_at: string
}

export interface AdminCrmContact {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  company?: string
  position?: string
  website?: string
  linkedin?: string
  lead_score: number
  status: 'new' | 'contacted' | 'qualified' | 'customer' | 'inactive'
  tags: string[]
  notes?: string
  custom_fields: Record<string, any>
  created_at: string
  updated_at: string
  last_contact_at?: string
}

export interface AdminCrmActivity {
  id: string
  user_id: string
  contact_id?: string
  deal_id?: string
  activity_type: 'call' | 'email' | 'meeting' | 'task' | 'note' | 'other'
  title: string
  description?: string
  status: 'scheduled' | 'completed' | 'cancelled'
  due_date?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

// Invoicing Module
export interface AdminInvoice {
  id: string
  user_id: string
  invoice_number: string
  client_id?: string
  client_name: string
  client_email: string
  amount_total: number
  amount_paid: number
  amount_due: number
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled'
  issue_date: string
  due_date: string
  paid_date?: string
  items: Record<string, any>[]
  notes?: string
  terms?: string
  created_at: string
  updated_at: string
}

export interface AdminInvoiceReminder {
  id: string
  invoice_id: string
  reminder_type: 'before_due' | 'on_due' | 'after_due'
  days_offset: number
  sent_at?: string
  status: 'pending' | 'sent' | 'failed'
  created_at: string
}

export interface AdminPayment {
  id: string
  invoice_id: string
  user_id: string
  amount: number
  payment_method: 'card' | 'bank_transfer' | 'paypal' | 'stripe' | 'cash' | 'other'
  transaction_id?: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  paid_at?: string
  notes?: string
  created_at: string
}

// Marketing Module
export interface AdminMarketingLead {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  company?: string
  source: string
  campaign?: string
  lead_score: number
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
  tags: string[]
  custom_fields: Record<string, any>
  created_at: string
  updated_at: string
  last_contact_at?: string
}

export interface AdminEmailCampaign {
  id: string
  user_id: string
  campaign_name: string
  subject: string
  content: string
  from_email: string
  from_name: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused'
  scheduled_at?: string
  sent_at?: string
  total_recipients: number
  total_sent: number
  total_delivered: number
  total_opened: number
  total_clicked: number
  total_bounced: number
  total_unsubscribed: number
  created_at: string
  updated_at: string
}

export interface AdminCampaignSubscriber {
  id: string
  campaign_id: string
  email: string
  first_name?: string
  last_name?: string
  status: 'subscribed' | 'unsubscribed' | 'bounced'
  sent_at?: string
  delivered_at?: string
  opened_at?: string
  clicked_at?: string
  bounced_at?: string
  unsubscribed_at?: string
  created_at: string
}

// Operations Module
export interface AdminTeamMember {
  id: string
  user_id: string
  full_name: string
  email: string
  role: string
  department?: string
  status: 'active' | 'inactive' | 'pending'
  avatar_url?: string
  permissions: string[]
  created_at: string
  updated_at: string
  last_login_at?: string
}

export interface AdminRolePermission {
  id: string
  role_name: string
  permissions: string[]
  description?: string
  created_at: string
  updated_at: string
}

export interface AdminActivityLog {
  id: string
  user_id: string
  action: string
  entity_type: string
  entity_id?: string
  changes: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
}

// Automation Module
export interface AdminWorkflow {
  id: string
  user_id: string
  workflow_name: string
  description?: string
  trigger_type: 'manual' | 'scheduled' | 'webhook' | 'event'
  trigger_config: Record<string, any>
  actions: Record<string, any>[]
  status: 'active' | 'inactive' | 'draft'
  total_runs: number
  successful_runs: number
  failed_runs: number
  last_run_at?: string
  created_at: string
  updated_at: string
}

export interface AdminWorkflowExecution {
  id: string
  workflow_id: string
  status: 'running' | 'completed' | 'failed'
  started_at: string
  completed_at?: string
  duration_ms?: number
  error_message?: string
  logs: Record<string, any>[]
  created_at: string
}

export interface AdminIntegration {
  id: string
  user_id: string
  integration_name: string
  integration_type: string
  config: Record<string, any>
  status: 'connected' | 'disconnected' | 'error'
  last_sync_at?: string
  error_message?: string
  created_at: string
  updated_at: string
}

export interface AdminWebhook {
  id: string
  user_id: string
  webhook_name: string
  url: string
  events: string[]
  secret?: string
  status: 'active' | 'inactive'
  last_triggered_at?: string
  total_triggers: number
  created_at: string
  updated_at: string
}

// ============================================================================
// ANALYTICS MODULE - CRUD & QUERIES
// ============================================================================

export async function trackAnalyticsEvent(userId: string, eventData: Partial<AdminAnalyticsEvent>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_analytics_events')
    .insert({
      user_id: userId,
      timestamp: new Date().toISOString(),
      ...eventData
    })
    .select()
    .single()

  if (error) throw error
  return data as AdminAnalyticsEvent
}

export async function getAnalyticsEvents(userId: string, days: number = 30) {
  const supabase = createClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('admin_analytics_events')
    .select('*')
    .eq('user_id', userId)
    .gte('timestamp', startDate.toISOString())
    .order('timestamp', { ascending: false })

  if (error) throw error
  return data as AdminAnalyticsEvent[]
}

export async function generateAnalyticsReport(userId: string, reportData: Partial<AdminAnalyticsReport>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_analytics_reports')
    .insert({
      user_id: userId,
      status: 'pending',
      ...reportData
    })
    .select()
    .single()

  if (error) throw error
  return data as AdminAnalyticsReport
}

export async function getAnalyticsReports(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_analytics_reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as AdminAnalyticsReport[]
}

export async function createAnalyticsGoal(userId: string, goalData: Partial<AdminAnalyticsGoal>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_analytics_goals')
    .insert({
      user_id: userId,
      current_value: 0,
      status: 'active',
      ...goalData
    })
    .select()
    .single()

  if (error) throw error
  return data as AdminAnalyticsGoal
}

export async function getActiveAnalyticsGoals(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_analytics_goals')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as AdminAnalyticsGoal[]
}

export async function updateGoalProgress(goalId: string, currentValue: number) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_analytics_goals')
    .update({ current_value: currentValue })
    .eq('id', goalId)
    .select()
    .single()

  if (error) throw error
  return data as AdminAnalyticsGoal
}

// ============================================================================
// CRM MODULE - CRUD & QUERIES
// ============================================================================

export async function createDeal(userId: string, dealData: Partial<AdminCrmDeal>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_crm_deals')
    .insert({
      user_id: userId,
      stage: 'lead',
      priority: 'warm',
      probability: 50,
      tags: [],
      custom_fields: {},
      ...dealData
    })
    .select()
    .single()

  if (error) throw error
  return data as AdminCrmDeal
}

export async function getDeals(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_crm_deals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as AdminCrmDeal[]
}

export async function getDealsByStage(userId: string, stage: AdminCrmDeal['stage']) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_crm_deals')
    .select('*')
    .eq('user_id', userId)
    .eq('stage', stage)
    .order('deal_value', { ascending: false })

  if (error) throw error
  return data as AdminCrmDeal[]
}

export async function getHighValueDeals(userId: string, minValue: number) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_crm_deals')
    .select('*')
    .eq('user_id', userId)
    .gte('deal_value', minValue)
    .in('stage', ['proposal', 'negotiation'])
    .order('deal_value', { ascending: false })

  if (error) throw error
  return data as AdminCrmDeal[]
}

export async function updateDealStage(dealId: string, stage: AdminCrmDeal['stage']) {
  const supabase = createClient()
  const updates: any = {
    stage,
    last_activity_at: new Date().toISOString()
  }

  if (stage === 'won' || stage === 'lost') {
    updates.actual_close_date = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('admin_crm_deals')
    .update(updates)
    .eq('id', dealId)
    .select()
    .single()

  if (error) throw error
  return data as AdminCrmDeal
}

export async function createContact(userId: string, contactData: Partial<AdminCrmContact>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_crm_contacts')
    .insert({
      user_id: userId,
      lead_score: 0,
      status: 'new',
      tags: [],
      custom_fields: {},
      ...contactData
    })
    .select()
    .single()

  if (error) throw error
  return data as AdminCrmContact
}

export async function getContacts(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_crm_contacts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as AdminCrmContact[]
}

export async function getHotContacts(userId: string, minScore: number = 70) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_crm_contacts')
    .select('*')
    .eq('user_id', userId)
    .gte('lead_score', minScore)
    .order('lead_score', { ascending: false })

  if (error) throw error
  return data as AdminCrmContact[]
}

export async function logActivity(userId: string, activityData: Partial<AdminCrmActivity>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_crm_activities')
    .insert({
      user_id: userId,
      status: 'completed',
      ...activityData
    })
    .select()
    .single()

  if (error) throw error
  return data as AdminCrmActivity
}

// ============================================================================
// INVOICING MODULE - CRUD & QUERIES
// ============================================================================

export async function createInvoice(userId: string, invoiceData: Partial<AdminInvoice>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_invoices')
    .insert({
      user_id: userId,
      status: 'draft',
      amount_paid: 0,
      items: [],
      ...invoiceData
    })
    .select()
    .single()

  if (error) throw error
  return data as AdminInvoice
}

export async function getInvoices(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_invoices')
    .select('*')
    .eq('user_id', userId)
    .order('issue_date', { ascending: false })

  if (error) throw error
  return data as AdminInvoice[]
}

export async function getOverdueInvoices(userId: string) {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('admin_invoices')
    .select('*')
    .eq('user_id', userId)
    .lt('due_date', today)
    .neq('status', 'paid')
    .neq('status', 'cancelled')
    .order('due_date', { ascending: true })

  if (error) throw error
  return data as AdminInvoice[]
}

export async function updateInvoice(invoiceId: string, updates: Partial<AdminInvoice>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_invoices')
    .update(updates)
    .eq('id', invoiceId)
    .select()
    .single()

  if (error) throw error
  return data as AdminInvoice
}

export async function deleteInvoice(invoiceId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('admin_invoices')
    .delete()
    .eq('id', invoiceId)

  if (error) throw error
  return { success: true }
}

export async function updateInvoiceStatus(invoiceId: string, status: AdminInvoice['status']) {
  const supabase = createClient()
  const updates: any = { status }

  if (status === 'paid') {
    updates.paid_date = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('admin_invoices')
    .update(updates)
    .eq('id', invoiceId)
    .select()
    .single()

  if (error) throw error
  return data as AdminInvoice
}

export async function recordPayment(userId: string, paymentData: Partial<AdminPayment>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_payments')
    .insert({
      user_id: userId,
      status: 'completed',
      paid_at: new Date().toISOString(),
      ...paymentData
    })
    .select()
    .single()

  if (error) throw error

  // Update invoice amount_paid
  if (paymentData.invoice_id && paymentData.amount) {
    const invoice = await getInvoice(paymentData.invoice_id)
    const newAmountPaid = invoice.amount_paid + paymentData.amount
    const newAmountDue = invoice.amount_total - newAmountPaid

    await supabase
      .from('admin_invoices')
      .update({
        amount_paid: newAmountPaid,
        amount_due: newAmountDue,
        status: newAmountDue <= 0 ? 'paid' : 'sent'
      })
      .eq('id', paymentData.invoice_id)
  }

  return data as AdminPayment
}

async function getInvoice(invoiceId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_invoices')
    .select('*')
    .eq('id', invoiceId)
    .single()

  if (error) throw error
  return data as AdminInvoice
}

// ============================================================================
// MARKETING MODULE - CRUD & QUERIES
// ============================================================================

export async function createLead(userId: string, leadData: Partial<AdminMarketingLead>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_marketing_leads')
    .insert({
      user_id: userId,
      lead_score: 0,
      status: 'new',
      tags: [],
      custom_fields: {},
      ...leadData
    })
    .select()
    .single()

  if (error) throw error
  return data as AdminMarketingLead
}

export async function getLeads(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_marketing_leads')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as AdminMarketingLead[]
}

export async function getHotLeads(userId: string, minScore: number = 70) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_marketing_leads')
    .select('*')
    .eq('user_id', userId)
    .gte('lead_score', minScore)
    .eq('status', 'qualified')
    .order('lead_score', { ascending: false })

  if (error) throw error
  return data as AdminMarketingLead[]
}

export async function createEmailCampaign(userId: string, campaignData: Partial<AdminEmailCampaign>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_email_campaigns')
    .insert({
      user_id: userId,
      status: 'draft',
      total_recipients: 0,
      total_sent: 0,
      total_delivered: 0,
      total_opened: 0,
      total_clicked: 0,
      total_bounced: 0,
      total_unsubscribed: 0,
      ...campaignData
    })
    .select()
    .single()

  if (error) throw error
  return data as AdminEmailCampaign
}

export async function getCampaigns(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_email_campaigns')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as AdminEmailCampaign[]
}

export async function getActiveCampaigns(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_email_campaigns')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['sending', 'sent'])
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as AdminEmailCampaign[]
}

// ============================================================================
// OPERATIONS MODULE - CRUD & QUERIES
// ============================================================================

export async function createTeamMember(userId: string, memberData: Partial<AdminTeamMember>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_team_members')
    .insert({
      user_id: userId,
      status: 'active',
      permissions: [],
      ...memberData
    })
    .select()
    .single()

  if (error) throw error
  return data as AdminTeamMember
}

export async function getTeamMembers(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_team_members')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as AdminTeamMember[]
}

export async function logAdminActivity(userId: string, activityData: Partial<AdminActivityLog>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_activity_log')
    .insert({
      user_id: userId,
      changes: {},
      ...activityData
    })
    .select()
    .single()

  if (error) throw error
  return data as AdminActivityLog
}

export async function getActivityLog(userId: string, days: number = 30) {
  const supabase = createClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('admin_activity_log')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as AdminActivityLog[]
}

// ============================================================================
// AUTOMATION MODULE - CRUD & QUERIES
// ============================================================================

export async function createWorkflow(userId: string, workflowData: Partial<AdminWorkflow>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_workflows')
    .insert({
      user_id: userId,
      status: 'draft',
      trigger_config: {},
      actions: [],
      total_runs: 0,
      successful_runs: 0,
      failed_runs: 0,
      ...workflowData
    })
    .select()
    .single()

  if (error) throw error
  return data as AdminWorkflow
}

export async function getWorkflows(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_workflows')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as AdminWorkflow[]
}

export async function getActiveWorkflows(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_workflows')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('last_run_at', { ascending: false })

  if (error) throw error
  return data as AdminWorkflow[]
}

export async function executeWorkflow(workflowId: string) {
  const supabase = createClient()

  // Create execution record
  const { data: execution, error: execError } = await supabase
    .from('admin_workflow_executions')
    .insert({
      workflow_id: workflowId,
      status: 'running',
      started_at: new Date().toISOString(),
      logs: []
    })
    .select()
    .single()

  if (execError) throw execError

  // Update workflow last_run_at
  await supabase
    .from('admin_workflows')
    .update({
      last_run_at: new Date().toISOString(),
      total_runs: supabase.raw('total_runs + 1')
    })
    .eq('id', workflowId)

  return execution as AdminWorkflowExecution
}

export async function createIntegration(userId: string, integrationData: Partial<AdminIntegration>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_integrations')
    .insert({
      user_id: userId,
      status: 'connected',
      config: {},
      ...integrationData
    })
    .select()
    .single()

  if (error) throw error
  return data as AdminIntegration
}

export async function getIntegrations(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_integrations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as AdminIntegration[]
}

// ============================================================================
// DASHBOARD STATISTICS - COMPREHENSIVE QUERIES
// ============================================================================

export async function getDashboardStats(userId: string) {
  const supabase = createClient()

  const [
    dealsResult,
    invoicesResult,
    leadsResult,
    campaignsResult,
    workflowsResult,
    teamResult
  ] = await Promise.all([
    supabase.from('admin_crm_deals').select('deal_value, stage').eq('user_id', userId),
    supabase.from('admin_invoices').select('amount_total, amount_due, status, due_date').eq('user_id', userId),
    supabase.from('admin_marketing_leads').select('lead_score, status').eq('user_id', userId),
    supabase.from('admin_email_campaigns').select('status, total_opened, total_clicked, total_sent').eq('user_id', userId),
    supabase.from('admin_workflows').select('status, total_runs, successful_runs').eq('user_id', userId),
    supabase.from('admin_team_members').select('status').eq('user_id', userId)
  ])

  const deals = dealsResult.data || []
  const invoices = invoicesResult.data || []
  const leads = leadsResult.data || []
  const campaigns = campaignsResult.data || []
  const workflows = workflowsResult.data || []
  const team = teamResult.data || []

  // Calculate metrics
  const totalPipelineValue = deals.reduce((sum, d) => sum + Number(d.deal_value || 0), 0)
  const activeDeals = deals.filter(d => !['won', 'lost'].includes(d.stage)).length
  const wonDeals = deals.filter(d => d.stage === 'won').length

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + Number(i.amount_total || 0), 0)
  const totalOutstanding = invoices.reduce((sum, i) => sum + Number(i.amount_due || 0), 0)
  const overdueInvoices = invoices.filter(i => {
    if (i.status === 'paid' || i.status === 'cancelled') return false
    return new Date(i.due_date) < new Date()
  }).length

  const hotLeads = leads.filter(l => Number(l.lead_score || 0) >= 70).length
  const totalLeads = leads.length

  const activeCampaigns = campaigns.filter(c => ['sending', 'sent'].includes(c.status)).length
  const totalEmailsSent = campaigns.reduce((sum, c) => sum + Number(c.total_sent || 0), 0)
  const totalOpened = campaigns.reduce((sum, c) => sum + Number(c.total_opened || 0), 0)
  const openRate = totalEmailsSent > 0 ? (totalOpened / totalEmailsSent) * 100 : 0

  const activeWorkflows = workflows.filter(w => w.status === 'active').length
  const totalWorkflowRuns = workflows.reduce((sum, w) => sum + Number(w.total_runs || 0), 0)
  const successfulRuns = workflows.reduce((sum, w) => sum + Number(w.successful_runs || 0), 0)
  const successRate = totalWorkflowRuns > 0 ? (successfulRuns / totalWorkflowRuns) * 100 : 0

  const activeTeamMembers = team.filter(t => t.status === 'active').length
  const totalTeamMembers = team.length

  return {
    // CRM
    totalPipelineValue,
    activeDeals,
    wonDeals,
    dealWinRate: activeDeals > 0 ? (wonDeals / (activeDeals + wonDeals)) * 100 : 0,

    // Invoicing
    totalRevenue,
    totalOutstanding,
    overdueInvoices,
    totalInvoices: invoices.length,

    // Marketing
    hotLeads,
    totalLeads,
    leadConversionRate: totalLeads > 0 ? (hotLeads / totalLeads) * 100 : 0,
    activeCampaigns,
    totalEmailsSent,
    emailOpenRate: openRate,

    // Automation
    activeWorkflows,
    totalWorkflowRuns,
    workflowSuccessRate: successRate,

    // Operations
    activeTeamMembers,
    totalTeamMembers,
    teamProductivity: activeTeamMembers > 0 ? 90.2 : 0 // Placeholder
  }
}

export async function getRevenueAnalytics(userId: string, days: number = 30) {
  const supabase = createClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('admin_analytics_events')
    .select('event_value, timestamp')
    .eq('user_id', userId)
    .eq('event_type', 'purchase')
    .gte('timestamp', startDate.toISOString())
    .order('timestamp', { ascending: true })

  if (error) throw error

  return {
    totalRevenue: data.reduce((sum, e) => sum + Number(e.event_value || 0), 0),
    events: data
  }
}

export async function getPipelineMetrics(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_crm_deals')
    .select('deal_value, stage, probability')
    .eq('user_id', userId)

  if (error) throw error

  const deals = data || []
  const byStage = deals.reduce((acc, deal) => {
    acc[deal.stage] = (acc[deal.stage] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const weightedValue = deals.reduce((sum, deal) => {
    return sum + (Number(deal.deal_value || 0) * (Number(deal.probability || 0) / 100))
  }, 0)

  return {
    totalDeals: deals.length,
    byStage,
    totalValue: deals.reduce((sum, d) => sum + Number(d.deal_value || 0), 0),
    weightedValue
  }
}
