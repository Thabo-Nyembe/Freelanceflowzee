'use server'

/**
 * Extended Admin Server Actions - Covers all 24 Admin-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getAdminActivityLog(limit = 100) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_activity_log').select('*').order('created_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function logAdminActivity(userId: string, action: string, resource: string, details?: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_activity_log').insert({ user_id: userId, action, resource, details }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAdminAgents() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_agents').select('*').order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAdminAgent(input: { name: string; type: string; config: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_agents').insert(input).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateAdminAgent(agentId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_agents').update(updates).eq('id', agentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteAdminAgent(agentId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('admin_agents').delete().eq('id', agentId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAdminAnalyticsEvents(limit = 100) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_analytics_events').select('*').order('created_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function trackAdminAnalyticsEvent(eventType: string, metadata?: any) {
  try { const supabase = await createClient(); const { error } = await supabase.from('admin_analytics_events').insert({ event_type: eventType, metadata }); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAdminAnalyticsGoals() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_analytics_goals').select('*').order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAdminAnalyticsGoal(input: { name: string; target: number; metric: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_analytics_goals').insert(input).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAdminAnalyticsReports() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_analytics_reports').select('*').order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAdminAnalyticsReport(input: { name: string; type: string; config: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_analytics_reports').insert(input).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAdminCampaignSubscribers(campaignId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_campaign_subscribers').select('*').eq('campaign_id', campaignId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addAdminCampaignSubscriber(campaignId: string, email: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_campaign_subscribers').insert({ campaign_id: campaignId, email }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAdminCrmActivities(contactId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('admin_crm_activities').select('*').order('created_at', { ascending: false }); if (contactId) query = query.eq('contact_id', contactId); const { data, error } = await query.limit(100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAdminCrmActivity(contactId: string, type: string, description: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_crm_activities').insert({ contact_id: contactId, type, description }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAdminCrmContacts() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_crm_contacts').select('*').order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAdminCrmContact(input: { name: string; email: string; phone?: string; company?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_crm_contacts').insert(input).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateAdminCrmContact(contactId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_crm_contacts').update(updates).eq('id', contactId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAdminCrmDeals() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_crm_deals').select('*').order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAdminCrmDeal(input: { name: string; value: number; stage: string; contact_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_crm_deals').insert(input).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateAdminCrmDeal(dealId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_crm_deals').update(updates).eq('id', dealId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAdminEmailCampaigns() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_email_campaigns').select('*').order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAdminEmailCampaign(input: { name: string; subject: string; content: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_email_campaigns').insert({ ...input, status: 'draft' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAdminIntegrations() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_integrations').select('*').order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAdminIntegration(input: { name: string; type: string; config: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_integrations').insert({ ...input, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleAdminIntegration(integrationId: string, isActive: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_integrations').update({ is_active: isActive }).eq('id', integrationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAdminInvoiceReminders() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_invoice_reminders').select('*').order('reminder_date', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAdminInvoiceReminder(invoiceId: string, reminderDate: string, message?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_invoice_reminders').insert({ invoice_id: invoiceId, reminder_date: reminderDate, message }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAdminInvoices() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_invoices').select('*').order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAdminInvoice(input: { client_id: string; amount: number; due_date: string; items: any[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_invoices').insert({ ...input, status: 'pending' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateAdminInvoiceStatus(invoiceId: string, status: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_invoices').update({ status }).eq('id', invoiceId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAdminMarketingLeads() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_marketing_leads').select('*').order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAdminMarketingLead(input: { name: string; email: string; source?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_marketing_leads').insert({ ...input, status: 'new' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAdminPayments() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_payments').select('*').order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAdminPayment(input: { invoice_id: string; amount: number; method: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_payments').insert({ ...input, status: 'completed' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAdminRolePermissions(roleId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('admin_role_permissions').select('*'); if (roleId) query = query.eq('role_id', roleId); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setAdminRolePermission(roleId: string, permission: string, allowed: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_role_permissions').upsert({ role_id: roleId, permission, allowed }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAdminTeamMembers() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_team_members').select('*').order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAdminTeamMember(input: { user_id: string; role: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_team_members').insert(input).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateAdminTeamMemberRole(memberId: string, role: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_team_members').update({ role }).eq('id', memberId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeAdminTeamMember(memberId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('admin_team_members').delete().eq('id', memberId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAdminWebhooks() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_webhooks').select('*').order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAdminWebhook(input: { name: string; url: string; events: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_webhooks').insert({ ...input, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleAdminWebhook(webhookId: string, isActive: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_webhooks').update({ is_active: isActive }).eq('id', webhookId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteAdminWebhook(webhookId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('admin_webhooks').delete().eq('id', webhookId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAdminWorkflowExecutions(workflowId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('admin_workflow_executions').select('*').order('started_at', { ascending: false }); if (workflowId) query = query.eq('workflow_id', workflowId); const { data, error } = await query.limit(100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAdminWorkflows() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_workflows').select('*').order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAdminWorkflow(input: { name: string; trigger: string; actions: any[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_workflows').insert({ ...input, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleAdminWorkflow(workflowId: string, isActive: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('admin_workflows').update({ is_active: isActive }).eq('id', workflowId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
