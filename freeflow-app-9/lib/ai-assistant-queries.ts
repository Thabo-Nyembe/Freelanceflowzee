/**
 * AI Assistant Query Library
 *
 * Comprehensive CRUD operations for AI Assistant feature:
 * - Conversations (create, read, update, delete, archive, pin)
 * - Messages (create, read, rate, update)
 * - Attachments (create, read, delete)
 * - Insights (create, read, update, dismiss, implement)
 * - Project Analyses (create, read, delete)
 * - Quick Actions (create, read, update, increment usage)
 */

import { createClient } from '@/lib/supabase/client'

// ============================================================================
// TYPES
// ============================================================================

export type MessageType = 'user' | 'assistant' | 'system'
export type AIProvider = 'anthropic' | 'openai' | 'google'
export type TaskType = 'chat' | 'analysis' | 'creative' | 'strategic' | 'operational'
export type MessageRating = 'up' | 'down'
export type InsightCategory = 'productivity' | 'business' | 'optimization' | 'opportunity' | 'growth'
export type InsightPriority = 'high' | 'medium' | 'low'
export type ConversationStatus = 'active' | 'archived' | 'pinned' | 'deleted'
export type AttachmentType = 'file' | 'image' | 'document' | 'link'
export type InsightStatus = 'active' | 'dismissed' | 'implemented'

export interface AIConversation {
  id: string
  user_id: string
  title: string
  preview: string | null
  status: ConversationStatus
  is_pinned: boolean
  is_archived: boolean
  model: AIProvider | null
  message_count: number
  total_tokens: number
  avg_response_time: number | null
  user_message_count: number
  assistant_message_count: number
  avg_rating: number | null
  last_message_at: string | null
  tags: string[]
  metadata: any
  created_at: string
  updated_at: string
}

export interface AIMessage {
  id: string
  conversation_id: string
  content: string
  type: MessageType
  rating: MessageRating | null
  tokens: number | null
  provider: AIProvider | null
  cached: boolean
  is_loading: boolean
  model: string | null
  temperature: number | null
  max_tokens: number | null
  response_time: number | null
  context_length: number | null
  suggestions: string[]
  metadata: any
  created_at: string
  updated_at: string
}

export interface MessageAttachment {
  id: string
  message_id: string
  type: AttachmentType
  name: string
  size: number
  url: string
  mime_type: string | null
  metadata: any
  created_at: string
}

export interface AIInsight {
  id: string
  user_id: string
  title: string
  description: string
  category: InsightCategory
  priority: InsightPriority
  action: string
  action_url: string | null
  icon: string | null
  status: InsightStatus
  metric: string | null
  value: number | null
  change_percent: number | null
  comparison: string | null
  confidence: number | null
  data_source: string | null
  metadata: any
  dismissed_at: string | null
  implemented_at: string | null
  created_at: string
  updated_at: string
}

export interface ProjectAnalysis {
  id: string
  user_id: string
  project_id: string | null
  project_name: string
  status: string
  completion: number
  insights: string[]
  recommendations: string[]
  next_actions: string[]
  timeline_adherence: number | null
  client_approval_rate: number | null
  revision_count: number | null
  profit_margin: number | null
  efficiency: number | null
  risk_level: 'low' | 'medium' | 'high' | null
  metadata: any
  generated_at: string
  created_at: string
}

export interface QuickAction {
  id: string
  label: string
  description: string
  icon: string | null
  prompt: string
  category: string
  is_default: boolean
  usage_count: number
  metadata: any
  created_at: string
  updated_at: string
}

// ============================================================================
// CONVERSATION OPERATIONS
// ============================================================================

/**
 * Get all conversations for a user
 */
export async function getConversations(
  userId: string,
  filters?: {
    status?: ConversationStatus
    is_pinned?: boolean
    is_archived?: boolean
    search?: string
  }
): Promise<{ data: AIConversation[] | null; error: any }> {
  const supabase = createClient()
  let query = supabase
    .from('ai_conversations')
    .select('*')
    .eq('user_id', userId)
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.is_pinned !== undefined) {
    query = query.eq('is_pinned', filters.is_pinned)
  }

  if (filters?.is_archived !== undefined) {
    query = query.eq('is_archived', filters.is_archived)
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,preview.ilike.%${filters.search}%`)
  }

  const { data, error } = await query

  return { data, error }
}

/**
 * Get a single conversation by ID
 */
export async function getConversation(
  conversationId: string
): Promise<{ data: AIConversation | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_conversations')
    .select('*')
    .eq('id', conversationId)
    .single()

  return { data, error }
}

/**
 * Create a new conversation
 */
export async function createConversation(
  userId: string,
  title: string,
  options?: {
    model?: AIProvider
    tags?: string[]
    metadata?: any
  }
): Promise<{ data: AIConversation | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_conversations')
    .insert({
      user_id: userId,
      title,
      model: options?.model,
      tags: options?.tags || [],
      metadata: options?.metadata || {}
    })
    .select()
    .single()

  return { data, error }
}

/**
 * Update a conversation
 */
export async function updateConversation(
  conversationId: string,
  updates: Partial<Pick<AIConversation, 'title' | 'status' | 'is_pinned' | 'is_archived' | 'tags' | 'metadata'>>
): Promise<{ data: AIConversation | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_conversations')
    .update(updates)
    .eq('id', conversationId)
    .select()
    .single()

  return { data, error }
}

/**
 * Delete a conversation
 */
export async function deleteConversation(
  conversationId: string
): Promise<{ error: any }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('ai_conversations')
    .delete()
    .eq('id', conversationId)

  return { error }
}

/**
 * Archive a conversation
 */
export async function archiveConversation(
  conversationId: string
): Promise<{ data: AIConversation | null; error: any }> {
  return updateConversation(conversationId, { is_archived: true, status: 'archived' })
}

/**
 * Pin/unpin a conversation
 */
export async function togglePinConversation(
  conversationId: string,
  isPinned: boolean
): Promise<{ data: AIConversation | null; error: any }> {
  return updateConversation(conversationId, {
    is_pinned: isPinned,
    status: isPinned ? 'pinned' : 'active'
  })
}

// ============================================================================
// MESSAGE OPERATIONS
// ============================================================================

/**
 * Get messages for a conversation
 */
export async function getMessages(
  conversationId: string,
  options?: {
    limit?: number
    offset?: number
  }
): Promise<{ data: AIMessage[] | null; error: any }> {
  const supabase = createClient()
  let query = supabase
    .from('ai_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 50) - 1)
  }

  const { data, error } = await query

  return { data, error }
}

/**
 * Create a new message
 */
export async function createMessage(
  conversationId: string,
  content: string,
  type: MessageType,
  options?: {
    provider?: AIProvider
    model?: string
    tokens?: number
    temperature?: number
    max_tokens?: number
    response_time?: number
    context_length?: number
    suggestions?: string[]
    metadata?: any
  }
): Promise<{ data: AIMessage | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_messages')
    .insert({
      conversation_id: conversationId,
      content,
      type,
      provider: options?.provider,
      model: options?.model,
      tokens: options?.tokens,
      temperature: options?.temperature,
      max_tokens: options?.max_tokens,
      response_time: options?.response_time,
      context_length: options?.context_length,
      suggestions: options?.suggestions || [],
      metadata: options?.metadata || {}
    })
    .select()
    .single()

  return { data, error }
}

/**
 * Rate a message
 */
export async function rateMessage(
  messageId: string,
  rating: MessageRating | null
): Promise<{ data: AIMessage | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_messages')
    .update({ rating })
    .eq('id', messageId)
    .select()
    .single()

  return { data, error }
}

/**
 * Update message loading state
 */
export async function updateMessageLoading(
  messageId: string,
  isLoading: boolean
): Promise<{ data: AIMessage | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_messages')
    .update({ is_loading: isLoading })
    .eq('id', messageId)
    .select()
    .single()

  return { data, error }
}

// ============================================================================
// ATTACHMENT OPERATIONS
// ============================================================================

/**
 * Get attachments for a message
 */
export async function getMessageAttachments(
  messageId: string
): Promise<{ data: MessageAttachment[] | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_message_attachments')
    .select('*')
    .eq('message_id', messageId)
    .order('created_at', { ascending: true })

  return { data, error }
}

/**
 * Create an attachment
 */
export async function createAttachment(
  messageId: string,
  attachment: {
    type: AttachmentType
    name: string
    size: number
    url: string
    mime_type?: string
    metadata?: any
  }
): Promise<{ data: MessageAttachment | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_message_attachments')
    .insert({
      message_id: messageId,
      type: attachment.type,
      name: attachment.name,
      size: attachment.size,
      url: attachment.url,
      mime_type: attachment.mime_type,
      metadata: attachment.metadata || {}
    })
    .select()
    .single()

  return { data, error }
}

/**
 * Delete an attachment
 */
export async function deleteAttachment(
  attachmentId: string
): Promise<{ error: any }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('ai_message_attachments')
    .delete()
    .eq('id', attachmentId)

  return { error }
}

// ============================================================================
// INSIGHT OPERATIONS
// ============================================================================

/**
 * Get insights for a user
 */
export async function getInsights(
  userId: string,
  filters?: {
    category?: InsightCategory
    priority?: InsightPriority
    status?: InsightStatus
  }
): Promise<{ data: AIInsight[] | null; error: any }> {
  const supabase = createClient()
  let query = supabase
    .from('ai_insights')
    .select('*')
    .eq('user_id', userId)
    .order('priority', { ascending: true }) // high, medium, low
    .order('created_at', { ascending: false })

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  if (filters?.priority) {
    query = query.eq('priority', filters.priority)
  }

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query

  return { data, error }
}

/**
 * Create an insight
 */
export async function createInsight(
  userId: string,
  insight: {
    title: string
    description: string
    category: InsightCategory
    priority: InsightPriority
    action: string
    action_url?: string
    icon?: string
    metric?: string
    value?: number
    change_percent?: number
    comparison?: string
    confidence?: number
    data_source?: string
    metadata?: any
  }
): Promise<{ data: AIInsight | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_insights')
    .insert({
      user_id: userId,
      ...insight,
      metadata: insight.metadata || {}
    })
    .select()
    .single()

  return { data, error }
}

/**
 * Dismiss an insight
 */
export async function dismissInsight(
  insightId: string
): Promise<{ data: AIInsight | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_insights')
    .update({
      status: 'dismissed',
      dismissed_at: new Date().toISOString()
    })
    .eq('id', insightId)
    .select()
    .single()

  return { data, error }
}

/**
 * Mark insight as implemented
 */
export async function implementInsight(
  insightId: string
): Promise<{ data: AIInsight | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_insights')
    .update({
      status: 'implemented',
      implemented_at: new Date().toISOString()
    })
    .eq('id', insightId)
    .select()
    .single()

  return { data, error }
}

// ============================================================================
// PROJECT ANALYSIS OPERATIONS
// ============================================================================

/**
 * Get project analyses for a user
 */
export async function getProjectAnalyses(
  userId: string,
  filters?: {
    project_id?: string
    status?: string
    risk_level?: 'low' | 'medium' | 'high'
  }
): Promise<{ data: ProjectAnalysis[] | null; error: any }> {
  const supabase = createClient()
  let query = supabase
    .from('ai_project_analyses')
    .select('*')
    .eq('user_id', userId)
    .order('generated_at', { ascending: false })

  if (filters?.project_id) {
    query = query.eq('project_id', filters.project_id)
  }

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.risk_level) {
    query = query.eq('risk_level', filters.risk_level)
  }

  const { data, error } = await query

  return { data, error }
}

/**
 * Create a project analysis
 */
export async function createProjectAnalysis(
  userId: string,
  analysis: {
    project_id?: string
    project_name: string
    status: string
    completion: number
    insights?: string[]
    recommendations?: string[]
    next_actions?: string[]
    timeline_adherence?: number
    client_approval_rate?: number
    revision_count?: number
    profit_margin?: number
    efficiency?: number
    risk_level?: 'low' | 'medium' | 'high'
    metadata?: any
  }
): Promise<{ data: ProjectAnalysis | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_project_analyses')
    .insert({
      user_id: userId,
      project_id: analysis.project_id,
      project_name: analysis.project_name,
      status: analysis.status,
      completion: analysis.completion,
      insights: analysis.insights || [],
      recommendations: analysis.recommendations || [],
      next_actions: analysis.next_actions || [],
      timeline_adherence: analysis.timeline_adherence,
      client_approval_rate: analysis.client_approval_rate,
      revision_count: analysis.revision_count,
      profit_margin: analysis.profit_margin,
      efficiency: analysis.efficiency,
      risk_level: analysis.risk_level,
      metadata: analysis.metadata || {}
    })
    .select()
    .single()

  return { data, error }
}

/**
 * Delete a project analysis
 */
export async function deleteProjectAnalysis(
  analysisId: string
): Promise<{ error: any }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('ai_project_analyses')
    .delete()
    .eq('id', analysisId)

  return { error }
}

// ============================================================================
// QUICK ACTION OPERATIONS
// ============================================================================

/**
 * Get all quick actions
 */
export async function getQuickActions(
  filters?: {
    category?: string
    is_default?: boolean
  }
): Promise<{ data: QuickAction[] | null; error: any }> {
  const supabase = createClient()
  let query = supabase
    .from('ai_quick_actions')
    .select('*')
    .order('usage_count', { ascending: false })
    .order('created_at', { ascending: false })

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  if (filters?.is_default !== undefined) {
    query = query.eq('is_default', filters.is_default)
  }

  const { data, error } = await query

  return { data, error }
}

/**
 * Create a quick action
 */
export async function createQuickAction(
  action: {
    label: string
    description: string
    icon?: string
    prompt: string
    category: string
    is_default?: boolean
    metadata?: any
  }
): Promise<{ data: QuickAction | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_quick_actions')
    .insert({
      label: action.label,
      description: action.description,
      icon: action.icon,
      prompt: action.prompt,
      category: action.category,
      is_default: action.is_default ?? true,
      metadata: action.metadata || {}
    })
    .select()
    .single()

  return { data, error }
}

/**
 * Increment quick action usage count
 */
export async function incrementQuickActionUsage(
  actionId: string
): Promise<{ data: QuickAction | null; error: any }> {
  const supabase = createClient()

  // Get current usage count
  const { data: currentAction } = await supabase
    .from('ai_quick_actions')
    .select('usage_count')
    .eq('id', actionId)
    .single()

  if (!currentAction) {
    return { data: null, error: new Error('Quick action not found') }
  }

  // Increment usage count
  const { data, error } = await supabase
    .from('ai_quick_actions')
    .update({ usage_count: currentAction.usage_count + 1 })
    .eq('id', actionId)
    .select()
    .single()

  return { data, error }
}

/**
 * Update a quick action
 */
export async function updateQuickAction(
  actionId: string,
  updates: Partial<Pick<QuickAction, 'label' | 'description' | 'icon' | 'prompt' | 'category' | 'metadata'>>
): Promise<{ data: QuickAction | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_quick_actions')
    .update(updates)
    .eq('id', actionId)
    .select()
    .single()

  return { data, error }
}

/**
 * Delete a quick action
 */
export async function deleteQuickAction(
  actionId: string
): Promise<{ error: any }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('ai_quick_actions')
    .delete()
    .eq('id', actionId)

  return { error }
}

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Get conversation statistics for a user
 */
export async function getConversationStats(
  userId: string
): Promise<{
  data: {
    total_conversations: number
    active_conversations: number
    pinned_conversations: number
    archived_conversations: number
    total_messages: number
    total_tokens: number
    avg_rating: number | null
  } | null
  error: any
}> {
  const supabase = createClient()

  const { data: conversations, error } = await supabase
    .from('ai_conversations')
    .select('message_count, total_tokens, avg_rating, status, is_pinned, is_archived')
    .eq('user_id', userId)

  if (error || !conversations) {
    return { data: null, error }
  }

  const stats = {
    total_conversations: conversations.length,
    active_conversations: conversations.filter(c => c.status === 'active').length,
    pinned_conversations: conversations.filter(c => c.is_pinned).length,
    archived_conversations: conversations.filter(c => c.is_archived).length,
    total_messages: conversations.reduce((sum, c) => sum + c.message_count, 0),
    total_tokens: conversations.reduce((sum, c) => sum + c.total_tokens, 0),
    avg_rating: conversations.length > 0
      ? conversations.reduce((sum, c) => sum + (c.avg_rating || 0), 0) / conversations.length
      : null
  }

  return { data: stats, error: null }
}

/**
 * Get insight statistics for a user
 */
export async function getInsightStats(
  userId: string
): Promise<{
  data: {
    total_insights: number
    active_insights: number
    dismissed_insights: number
    implemented_insights: number
    high_priority: number
    medium_priority: number
    low_priority: number
  } | null
  error: any
}> {
  const supabase = createClient()

  const { data: insights, error } = await supabase
    .from('ai_insights')
    .select('status, priority')
    .eq('user_id', userId)

  if (error || !insights) {
    return { data: null, error }
  }

  const stats = {
    total_insights: insights.length,
    active_insights: insights.filter(i => i.status === 'active').length,
    dismissed_insights: insights.filter(i => i.status === 'dismissed').length,
    implemented_insights: insights.filter(i => i.status === 'implemented').length,
    high_priority: insights.filter(i => i.priority === 'high').length,
    medium_priority: insights.filter(i => i.priority === 'medium').length,
    low_priority: insights.filter(i => i.priority === 'low').length
  }

  return { data: stats, error: null }
}
