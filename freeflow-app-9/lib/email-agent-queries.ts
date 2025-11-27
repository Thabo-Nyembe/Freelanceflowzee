/**
 * Email Agent Query Library
 */

import { createClient } from '@/lib/supabase/client'

export type EmailIntent = 'inquiry' | 'quotation-request' | 'booking' | 'complaint' | 'support' | 'general'
export type EmailSentiment = 'positive' | 'neutral' | 'negative'
export type EmailPriority = 'low' | 'medium' | 'high' | 'urgent'
export type EmailStatus = 'pending' | 'analyzed' | 'responded' | 'archived'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'
export type ResponseType = 'auto' | 'template' | 'manual' | 'ai-generated'

export interface EmailAgentConfig {
  id: string
  user_id: string
  is_enabled: boolean
  auto_respond: boolean
  require_approval: boolean
  response_tone: string
  signature?: string
  working_hours: Record<string, any>
  email_provider?: string
  ai_provider?: string
  created_at: string
  updated_at: string
}

export interface EmailAgentMessage {
  id: string
  user_id: string
  from_email: string
  to_email: string
  subject: string
  body: string
  received_at: string
  status: EmailStatus
  intent?: EmailIntent
  sentiment?: EmailSentiment
  priority: EmailPriority
  category?: string
  summary?: string
  requires_quotation: boolean
  requires_human_review: boolean
  analyzed_at?: string
  responded_at?: string
  created_at: string
  updated_at: string
}

export interface EmailAgentResponse {
  id: string
  message_id: string
  user_id: string
  type: ResponseType
  subject: string
  body: string
  sent_at?: string
  is_draft: boolean
  created_at: string
  updated_at: string
}

export interface EmailAgentApproval {
  id: string
  user_id: string
  response_id?: string
  message_id?: string
  approval_type: string
  status: ApprovalStatus
  priority: EmailPriority
  notes?: string
  approved_by?: string
  approved_at?: string
  created_at: string
  updated_at: string
}

// CONFIG
export async function getEmailAgentConfig(userId: string) {
  const supabase = createClient()
  return await supabase.from('email_agent_config').select('*').eq('user_id', userId).single()
}

export async function createEmailAgentConfig(userId: string, config: Partial<EmailAgentConfig>) {
  const supabase = createClient()
  return await supabase.from('email_agent_config').insert({ user_id: userId, ...config }).select().single()
}

export async function updateEmailAgentConfig(userId: string, updates: Partial<EmailAgentConfig>) {
  const supabase = createClient()
  return await supabase.from('email_agent_config').update(updates).eq('user_id', userId).select().single()
}

// MESSAGES
export async function getEmailAgentMessages(userId: string, filters?: { status?: EmailStatus; priority?: EmailPriority }) {
  const supabase = createClient()
  let query = supabase.from('email_agent_messages').select('*').eq('user_id', userId).order('received_at', { ascending: false })
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.priority) query = query.eq('priority', filters.priority)
  return await query
}

export async function getEmailAgentMessage(messageId: string) {
  const supabase = createClient()
  return await supabase.from('email_agent_messages').select('*').eq('id', messageId).single()
}

export async function createEmailAgentMessage(userId: string, message: Partial<EmailAgentMessage>) {
  const supabase = createClient()
  return await supabase.from('email_agent_messages').insert({ user_id: userId, ...message }).select().single()
}

export async function updateEmailAgentMessage(messageId: string, updates: Partial<EmailAgentMessage>) {
  const supabase = createClient()
  return await supabase.from('email_agent_messages').update(updates).eq('id', messageId).select().single()
}

export async function analyzeMessage(messageId: string, analysis: { intent?: EmailIntent; sentiment?: EmailSentiment; priority?: EmailPriority; category?: string; summary?: string; requires_quotation?: boolean; requires_human_review?: boolean }) {
  const supabase = createClient()
  return await supabase.from('email_agent_messages').update({ ...analysis, status: 'analyzed' }).eq('id', messageId).select().single()
}

export async function archiveMessage(messageId: string) {
  const supabase = createClient()
  return await supabase.from('email_agent_messages').update({ status: 'archived' }).eq('id', messageId).select().single()
}

export async function deleteEmailAgentMessage(messageId: string) {
  const supabase = createClient()
  return await supabase.from('email_agent_messages').delete().eq('id', messageId)
}

// RESPONSES
export async function getEmailAgentResponses(userId: string, filters?: { message_id?: string }) {
  const supabase = createClient()
  let query = supabase.from('email_agent_responses').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.message_id) query = query.eq('message_id', filters.message_id)
  return await query
}

export async function createEmailAgentResponse(userId: string, messageId: string, response: Partial<EmailAgentResponse>) {
  const supabase = createClient()
  return await supabase.from('email_agent_responses').insert({ user_id: userId, message_id: messageId, ...response }).select().single()
}

export async function updateEmailAgentResponse(responseId: string, updates: Partial<EmailAgentResponse>) {
  const supabase = createClient()
  return await supabase.from('email_agent_responses').update(updates).eq('id', responseId).select().single()
}

export async function sendResponse(responseId: string) {
  const supabase = createClient()
  return await supabase.from('email_agent_responses').update({ is_draft: false, sent_at: new Date().toISOString() }).eq('id', responseId).select().single()
}

export async function deleteEmailAgentResponse(responseId: string) {
  const supabase = createClient()
  return await supabase.from('email_agent_responses').delete().eq('id', responseId)
}

// APPROVALS
export async function getEmailAgentApprovals(userId: string, filters?: { status?: ApprovalStatus; priority?: EmailPriority }) {
  const supabase = createClient()
  let query = supabase.from('email_agent_approvals').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.priority) query = query.eq('priority', filters.priority)
  return await query
}

export async function createEmailAgentApproval(userId: string, approval: Partial<EmailAgentApproval>) {
  const supabase = createClient()
  return await supabase.from('email_agent_approvals').insert({ user_id: userId, ...approval }).select().single()
}

export async function approveItem(approvalId: string, approvedBy: string, notes?: string) {
  const supabase = createClient()
  return await supabase.from('email_agent_approvals').update({ status: 'approved', approved_by: approvedBy, notes }).eq('id', approvalId).select().single()
}

export async function rejectItem(approvalId: string, approvedBy: string, notes?: string) {
  const supabase = createClient()
  return await supabase.from('email_agent_approvals').update({ status: 'rejected', approved_by: approvedBy, notes }).eq('id', approvalId).select().single()
}

export async function deleteEmailAgentApproval(approvalId: string) {
  const supabase = createClient()
  return await supabase.from('email_agent_approvals').delete().eq('id', approvalId)
}

// STATS
export async function getEmailAgentStats(userId: string) {
  const supabase = createClient()
  const [messagesResult, responsesResult, approvalsResult] = await Promise.all([
    supabase.from('email_agent_messages').select('id, status, analyzed_at, responded_at').eq('user_id', userId),
    supabase.from('email_agent_responses').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('email_agent_approvals').select('id, status').eq('user_id', userId)
  ])

  const totalProcessed = messagesResult.count || 0
  const analyzedMessages = messagesResult.data?.filter(m => m.status !== 'pending').length || 0
  const respondedMessages = messagesResult.data?.filter(m => m.status === 'responded').length || 0
  const pendingApprovals = approvalsResult.data?.filter(a => a.status === 'pending').length || 0
  const completedApprovals = approvalsResult.data?.filter(a => a.status === 'approved' || a.status === 'rejected').length || 0

  // Calculate average response time
  const responseTimes = messagesResult.data
    ?.filter(m => m.analyzed_at && m.responded_at)
    .map(m => new Date(m.responded_at!).getTime() - new Date(m.analyzed_at!).getTime()) || []
  const avgResponseTime = responseTimes.length > 0 ? responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length / 1000 / 60 : 0

  return {
    data: {
      total_emails_processed: totalProcessed,
      analyzed_messages: analyzedMessages,
      responded_messages: respondedMessages,
      responses_generated: responsesResult.count || 0,
      approvals_pending: pendingApprovals,
      approvals_completed: completedApprovals,
      average_response_time: Math.round(avgResponseTime)
    },
    error: messagesResult.error || responsesResult.error || approvalsResult.error
  }
}
