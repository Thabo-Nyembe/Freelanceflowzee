/**
 * Client Zone System - Database Queries
 *
 * Comprehensive query library for client-facing portal functionality
 * with projects, deliverables, messages, files, invoices, and analytics.
 *
 * Database Schema: 12 tables
 * - client_projects: Client projects with progress tracking
 * - project_deliverables: Individual deliverables within projects
 * - revision_requests: Revision requests for deliverables
 * - client_messages: Messages between clients and freelancers
 * - client_files: File management and storage
 * - client_invoices: Invoice management
 * - milestone_payments: Milestone-based payments
 * - client_feedback: Client feedback and ratings
 * - client_analytics: Analytics and tracking
 * - client_schedules: Schedule management
 * - client_notifications: Notification system
 * - ai_collaboration: AI-powered collaboration features
 */

import { createClient } from '@/lib/supabase/client'
import { DatabaseError, toDbError, JsonValue } from '@/lib/types/database'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type ProjectStatus = 'pending' | 'in-progress' | 'review' | 'completed' | 'cancelled'
export type DeliverableStatus = 'pending' | 'in-progress' | 'review' | 'completed' | 'revision-requested'
export type RevisionStatus = 'open' | 'in-progress' | 'completed' | 'rejected'
export type MessageType = 'text' | 'system' | 'notification'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'disputed'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type NotificationType = 'project' | 'message' | 'invoice' | 'payment' | 'system'
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface MessageAttachment {
  id: string
  name: string
  url: string
  type: string
  size: number
}

export interface ClientProject {
  id: string
  user_id: string
  client_id: string
  name: string
  description: string | null
  status: ProjectStatus
  phase: string | null
  progress: number
  budget: number
  spent: number
  start_date: string
  due_date: string | null
  completed_date: string | null
  team_members: string[]
  tags: string[]
  last_update: string
  created_at: string
  updated_at: string
}

export interface ProjectDeliverable {
  id: string
  project_id: string
  name: string
  description: string | null
  status: DeliverableStatus
  due_date: string | null
  completed_date: string | null
  requires_approval: boolean
  approved_by: string | null
  approved_at: string | null
  file_urls: string[]
  created_at: string
  updated_at: string
}

export interface RevisionRequest {
  id: string
  deliverable_id: string
  project_id: string
  requested_by: string
  notes: string
  status: RevisionStatus
  resolved_by: string | null
  resolved_at: string | null
  resolution_notes: string | null
  created_at: string
  updated_at: string
}

export interface ClientMessage {
  id: string
  project_id: string
  sender_id: string
  recipient_id: string
  message: string
  message_type: MessageType
  read: boolean
  read_at: string | null
  attachments: MessageAttachment[]
  reply_to: string | null
  created_at: string
  updated_at: string
}

export interface ClientFile {
  id: string
  project_id: string
  uploaded_by: string
  name: string
  original_name: string
  file_type: string
  file_size: number
  mime_type: string | null
  storage_path: string
  storage_bucket: string
  description: string | null
  tags: string[]
  version: number
  is_public: boolean
  download_count: number
  created_at: string
  updated_at: string
}

export interface ClientInvoice {
  id: string
  project_id: string
  client_id: string
  invoice_number: string
  status: InvoiceStatus
  issue_date: string
  due_date: string
  paid_date: string | null
  subtotal: number
  tax: number
  discount: number
  total: number
  notes: string | null
  payment_method: string | null
  payment_reference: string | null
  created_at: string
  updated_at: string
}

export interface MilestonePayment {
  id: string
  project_id: string
  invoice_id: string | null
  milestone_name: string
  description: string | null
  amount: number
  status: PaymentStatus
  due_date: string
  paid_date: string | null
  payment_method: string | null
  transaction_id: string | null
  created_at: string
  updated_at: string
}

export interface ClientFeedback {
  id: string
  project_id: string
  client_id: string
  rating: number
  feedback_text: string | null
  areas_of_satisfaction: string[]
  areas_of_improvement: string[]
  would_recommend: boolean
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface ClientNotification {
  id: string
  user_id: string
  type: NotificationType
  priority: NotificationPriority
  title: string
  message: string
  link: string | null
  read: boolean
  read_at: string | null
  metadata: Record<string, JsonValue>
  created_at: string
  updated_at: string
}

// ============================================================================
// PROJECT QUERIES
// ============================================================================

/**
 * Get all client projects with optional filtering
 */
export async function getClientProjects(filters?: {
  status?: ProjectStatus
  client_id?: string
  search?: string
  limit?: number
  offset?: number
}): Promise<ClientProject[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  let query = supabase
    .from('client_projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.client_id) {
    query = query.eq('client_id', filters.client_id)
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Get a single project by ID
 */
export async function getClientProject(projectId: string): Promise<ClientProject | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('client_projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single()

  if (error) throw error
  return data
}

/**
 * Create a new client project
 */
export async function createClientProject(project: {
  client_id: string
  name: string
  description?: string
  budget?: number
  due_date?: string
  phase?: string
  team_members?: string[]
  tags?: string[]
}): Promise<ClientProject> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('client_projects')
    .insert({
      user_id: user.id,
      ...project,
      status: 'pending',
      progress: 0
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update a client project
 */
export async function updateClientProject(
  projectId: string,
  updates: Partial<Omit<ClientProject, 'id' | 'user_id' | 'created_at'>>
): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('client_projects')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', projectId)
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Delete a client project
 */
export async function deleteClientProject(projectId: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('client_projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Update project progress
 */
export async function updateProjectProgress(
  projectId: string,
  progress: number
): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('client_projects')
    .update({
      progress,
      last_update: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', projectId)
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Get project statistics
 */
export async function getProjectStatistics(): Promise<{
  total: number
  active: number
  completed: number
  inReview: number
  totalBudget: number
  totalSpent: number
}> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('client_projects')
    .select('status, budget, spent')
    .eq('user_id', user.id)

  if (error) throw error

  const stats = {
    total: data?.length || 0,
    active: data?.filter(p => p.status === 'in-progress').length || 0,
    completed: data?.filter(p => p.status === 'completed').length || 0,
    inReview: data?.filter(p => p.status === 'review').length || 0,
    totalBudget: data?.reduce((sum, p) => sum + (p.budget || 0), 0) || 0,
    totalSpent: data?.reduce((sum, p) => sum + (p.spent || 0), 0) || 0
  }

  return stats
}

// ============================================================================
// DELIVERABLE QUERIES
// ============================================================================

/**
 * Get deliverables for a project
 */
export async function getProjectDeliverables(projectId: string): Promise<ProjectDeliverable[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('project_deliverables')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Create a deliverable
 */
export async function createDeliverable(deliverable: {
  project_id: string
  name: string
  description?: string
  due_date?: string
  requires_approval?: boolean
}): Promise<ProjectDeliverable> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('project_deliverables')
    .insert({
      ...deliverable,
      status: 'pending'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update a deliverable
 */
export async function updateDeliverable(
  deliverableId: string,
  updates: Partial<Omit<ProjectDeliverable, 'id' | 'project_id' | 'created_at'>>
): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('project_deliverables')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', deliverableId)

  if (error) throw error
}

/**
 * Approve a deliverable
 */
export async function approveDeliverable(deliverableId: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('project_deliverables')
    .update({
      status: 'completed',
      approved_by: user.id,
      approved_at: new Date().toISOString(),
      completed_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', deliverableId)

  if (error) throw error
}

/**
 * Delete a deliverable
 */
export async function deleteDeliverable(deliverableId: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('project_deliverables')
    .delete()
    .eq('id', deliverableId)

  if (error) throw error
}

// ============================================================================
// REVISION REQUEST QUERIES
// ============================================================================

/**
 * Get revision requests for a deliverable
 */
export async function getRevisionRequests(deliverableId: string): Promise<RevisionRequest[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('revision_requests')
    .select('*')
    .eq('deliverable_id', deliverableId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Create a revision request
 */
export async function createRevisionRequest(request: {
  deliverable_id: string
  project_id: string
  notes: string
}): Promise<RevisionRequest> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('revision_requests')
    .insert({
      ...request,
      requested_by: user.id,
      status: 'open'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Resolve a revision request
 */
export async function resolveRevisionRequest(
  requestId: string,
  resolutionNotes: string
): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('revision_requests')
    .update({
      status: 'completed',
      resolved_by: user.id,
      resolved_at: new Date().toISOString(),
      resolution_notes: resolutionNotes,
      updated_at: new Date().toISOString()
    })
    .eq('id', requestId)

  if (error) throw error
}

/**
 * Get open revision requests for a project
 */
export async function getOpenRevisionRequests(projectId: string): Promise<RevisionRequest[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('revision_requests')
    .select('*')
    .eq('project_id', projectId)
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// ============================================================================
// MESSAGE QUERIES
// ============================================================================

/**
 * Get messages for a project
 */
export async function getProjectMessages(projectId: string): Promise<ClientMessage[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('client_messages')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Send a message
 */
export async function sendMessage(message: {
  project_id: string
  recipient_id: string
  message: string
  message_type?: MessageType
  attachments?: MessageAttachment[]
  reply_to?: string
}): Promise<ClientMessage> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('client_messages')
    .insert({
      ...message,
      sender_id: user.id,
      message_type: message.message_type || 'text'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Mark message as read
 */
export async function markMessageAsRead(messageId: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('client_messages')
    .update({
      read: true,
      read_at: new Date().toISOString()
    })
    .eq('id', messageId)
    .eq('recipient_id', user.id)

  if (error) throw error
}

/**
 * Get unread message count
 */
export async function getUnreadMessageCount(): Promise<number> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { count, error } = await supabase
    .from('client_messages')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', user.id)
    .eq('read', false)

  if (error) throw error
  return count || 0
}

/**
 * Delete a message
 */
export async function deleteMessage(messageId: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('client_messages')
    .delete()
    .eq('id', messageId)
    .eq('sender_id', user.id)

  if (error) throw error
}

// ============================================================================
// FILE QUERIES
// ============================================================================

/**
 * Get files for a project
 */
export async function getProjectFiles(projectId: string): Promise<ClientFile[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('client_files')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Upload a file
 */
export async function uploadFile(file: {
  project_id: string
  name: string
  original_name: string
  file_type: string
  file_size: number
  mime_type: string
  storage_path: string
  description?: string
  tags?: string[]
  is_public?: boolean
}): Promise<ClientFile> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('client_files')
    .insert({
      ...file,
      uploaded_by: user.id,
      version: 1,
      download_count: 0
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update file metadata
 */
export async function updateFile(
  fileId: string,
  updates: Partial<Pick<ClientFile, 'name' | 'description' | 'tags' | 'is_public'>>
): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('client_files')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', fileId)
    .eq('uploaded_by', user.id)

  if (error) throw error
}

/**
 * Delete a file
 */
export async function deleteFile(fileId: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('client_files')
    .delete()
    .eq('id', fileId)
    .eq('uploaded_by', user.id)

  if (error) throw error
}

/**
 * Increment file download count
 */
export async function incrementFileDownloadCount(fileId: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.rpc('increment_file_download', {
    file_id: fileId
  })

  if (error) {
    // Fallback if RPC doesn't exist
    const { data: file } = await supabase
      .from('client_files')
      .select('download_count')
      .eq('id', fileId)
      .single()

    if (file) {
      await supabase
        .from('client_files')
        .update({ download_count: file.download_count + 1 })
        .eq('id', fileId)
    }
  }
}

// ============================================================================
// INVOICE QUERIES
// ============================================================================

/**
 * Get invoices for a project
 */
export async function getProjectInvoices(projectId: string): Promise<ClientInvoice[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('client_invoices')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get all client invoices
 */
export async function getClientInvoices(filters?: {
  status?: InvoiceStatus
  limit?: number
}): Promise<ClientInvoice[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  let query = supabase
    .from('client_invoices')
    .select('*')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Create an invoice
 */
export async function createInvoice(invoice: {
  project_id: string
  client_id: string
  invoice_number: string
  issue_date: string
  due_date: string
  subtotal: number
  tax?: number
  discount?: number
  notes?: string
}): Promise<ClientInvoice> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const total = invoice.subtotal + (invoice.tax || 0) - (invoice.discount || 0)

  const { data, error } = await supabase
    .from('client_invoices')
    .insert({
      ...invoice,
      total,
      status: 'draft'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update an invoice
 */
export async function updateInvoice(
  invoiceId: string,
  updates: Partial<Omit<ClientInvoice, 'id' | 'created_at'>>
): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('client_invoices')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', invoiceId)

  if (error) throw error
}

/**
 * Mark invoice as paid
 */
export async function markInvoiceAsPaid(
  invoiceId: string,
  paymentMethod: string,
  paymentReference?: string
): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('client_invoices')
    .update({
      status: 'paid',
      paid_date: new Date().toISOString(),
      payment_method: paymentMethod,
      payment_reference: paymentReference,
      updated_at: new Date().toISOString()
    })
    .eq('id', invoiceId)

  if (error) throw error
}

/**
 * Dispute an invoice
 */
export async function disputeInvoice(
  invoiceId: string,
  reason: string
): Promise<{ data: ClientInvoice | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: toDbError(new Error('Not authenticated')) }

  try {
    // Update invoice status to disputed
    const { data, error } = await supabase
      .from('client_invoices')
      .update({
        status: 'disputed',
        dispute_reason: reason,
        disputed_at: new Date().toISOString(),
        disputed_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', invoiceId)
      .select()
      .single()

    if (error) return { data: null, error: toDbError(error) }

    // Create a notification for the freelancer
    await supabase.from('client_notifications').insert({
      user_id: data.user_id, // The freelancer
      title: 'Invoice Disputed',
      message: `Invoice ${data.invoice_number} has been disputed. Reason: ${reason}`,
      type: 'invoice',
      priority: 'high',
      link: `/dashboard/invoices/${invoiceId}`,
      metadata: {
        invoice_id: invoiceId,
        invoice_number: data.invoice_number,
        dispute_reason: reason
      }
    })

    return { data, error: null }
  } catch (error: unknown) {
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Resolve an invoice dispute
 */
export async function resolveInvoiceDispute(
  invoiceId: string,
  resolution: 'accepted' | 'rejected',
  notes?: string
): Promise<{ data: ClientInvoice | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: toDbError(new Error('Not authenticated')) }

  try {
    const newStatus = resolution === 'accepted' ? 'cancelled' : 'sent'

    const { data, error } = await supabase
      .from('client_invoices')
      .update({
        status: newStatus,
        dispute_resolution: resolution,
        dispute_resolved_at: new Date().toISOString(),
        dispute_resolved_by: user.id,
        dispute_resolution_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', invoiceId)
      .select()
      .single()

    if (error) return { data: null, error: toDbError(error) }
    return { data, error: null }
  } catch (error: unknown) {
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Get disputed invoices
 */
export async function getDisputedInvoices(limit?: number): Promise<ClientInvoice[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  let query = supabase
    .from('client_invoices')
    .select('*')
    .eq('status', 'disputed')
    .order('disputed_at', { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

// ============================================================================
// MILESTONE PAYMENT QUERIES
// ============================================================================

/**
 * Get milestone payments for a project
 */
export async function getMilestonePayments(projectId: string): Promise<MilestonePayment[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('milestone_payments')
    .select('*')
    .eq('project_id', projectId)
    .order('due_date', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Create a milestone payment
 */
export async function createMilestonePayment(payment: {
  project_id: string
  milestone_name: string
  description?: string
  amount: number
  due_date: string
}): Promise<MilestonePayment> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('milestone_payments')
    .insert({
      ...payment,
      status: 'pending'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Mark milestone payment as paid
 */
export async function markMilestonePaymentAsPaid(
  paymentId: string,
  paymentMethod: string,
  transactionId?: string
): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('milestone_payments')
    .update({
      status: 'paid',
      paid_date: new Date().toISOString(),
      payment_method: paymentMethod,
      transaction_id: transactionId,
      updated_at: new Date().toISOString()
    })
    .eq('id', paymentId)

  if (error) throw error
}

// ============================================================================
// FEEDBACK QUERIES
// ============================================================================

/**
 * Get feedback for a project
 */
export async function getProjectFeedback(projectId: string): Promise<ClientFeedback[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('client_feedback')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Submit client feedback
 */
export async function submitFeedback(feedback: {
  project_id: string
  rating: number
  feedback_text?: string
  areas_of_satisfaction?: string[]
  areas_of_improvement?: string[]
  would_recommend?: boolean
  is_public?: boolean
}): Promise<ClientFeedback> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('client_feedback')
    .insert({
      ...feedback,
      client_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get average rating for user's projects
 */
export async function getAverageRating(): Promise<number> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('client_feedback')
    .select('rating')
    .eq('client_id', user.id)

  if (error) throw error

  if (!data || data.length === 0) return 0

  const sum = data.reduce((acc, f) => acc + f.rating, 0)
  return sum / data.length
}

// ============================================================================
// NOTIFICATION QUERIES
// ============================================================================

/**
 * Get user notifications
 */
export async function getNotifications(filters?: {
  unread_only?: boolean
  type?: NotificationType
  limit?: number
}): Promise<ClientNotification[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  let query = supabase
    .from('client_notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (filters?.unread_only) {
    query = query.eq('read', false)
  }

  if (filters?.type) {
    query = query.eq('type', filters.type)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Create a notification
 */
export async function createNotification(notification: {
  type: NotificationType
  priority: NotificationPriority
  title: string
  message: string
  link?: string
  metadata?: Record<string, JsonValue>
}): Promise<ClientNotification> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('client_notifications')
    .insert({
      ...notification,
      user_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('client_notifications')
    .update({
      read: true,
      read_at: new Date().toISOString()
    })
    .eq('id', notificationId)
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('client_notifications')
    .update({
      read: true,
      read_at: new Date().toISOString()
    })
    .eq('user_id', user.id)
    .eq('read', false)

  if (error) throw error
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(): Promise<number> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { count, error } = await supabase
    .from('client_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('read', false)

  if (error) throw error
  return count || 0
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('client_notifications')
    .delete()
    .eq('id', notificationId)
    .eq('user_id', user.id)

  if (error) throw error
}

// ============================================================================
// ANALYTICS & DASHBOARD QUERIES
// ============================================================================

/**
 * Get client zone dashboard overview
 */
export async function getClientZoneDashboard(): Promise<{
  projectStats: Awaited<ReturnType<typeof getProjectStatistics>>
  recentProjects: ClientProject[]
  recentMessages: ClientMessage[]
  pendingInvoices: ClientInvoice[]
  upcomingMilestones: MilestonePayment[]
  unreadNotifications: number
  openRevisions: number
  averageRating: number
}> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const [
    projectStats,
    recentProjects,
    recentMessagesData,
    pendingInvoices,
    upcomingMilestones,
    unreadNotifications,
    averageRating
  ] = await Promise.all([
    getProjectStatistics(),
    getClientProjects({ limit: 5 }),
    supabase
      .from('client_messages')
      .select('*')
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(5),
    getClientInvoices({ status: 'sent', limit: 5 }),
    supabase
      .from('milestone_payments')
      .select('*')
      .eq('status', 'pending')
      .order('due_date', { ascending: true })
      .limit(5),
    getUnreadNotificationCount(),
    getAverageRating()
  ])

  // Get count of open revisions
  const { count: openRevisions } = await supabase
    .from('revision_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'open')

  return {
    projectStats,
    recentProjects,
    recentMessages: recentMessagesData.data || [],
    pendingInvoices,
    upcomingMilestones: upcomingMilestones.data || [],
    unreadNotifications,
    openRevisions: openRevisions || 0,
    averageRating
  }
}

/**
 * Export client data to CSV
 */
export async function exportClientDataToCSV(): Promise<string> {
  const projects = await getClientProjects()

  const headers = ['Project Name', 'Status', 'Progress', 'Budget', 'Spent', 'Start Date', 'Due Date']
  const rows = projects.map(p => [
    p.name,
    p.status,
    `${p.progress}%`,
    `$${p.budget.toFixed(2)}`,
    `$${p.spent.toFixed(2)}`,
    new Date(p.start_date).toLocaleDateString(),
    p.due_date ? new Date(p.due_date).toLocaleDateString() : 'N/A'
  ])

  const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
  return csv
}

/**
 * Search across all client zone content
 */
export async function searchClientZone(query: string): Promise<{
  projects: ClientProject[]
  messages: ClientMessage[]
  files: ClientFile[]
}> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const [projectsData, messagesData, filesData] = await Promise.all([
    supabase
      .from('client_projects')
      .select('*')
      .eq('user_id', user.id)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(10),
    supabase
      .from('client_messages')
      .select('*')
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .ilike('message', `%${query}%`)
      .limit(10),
    supabase
      .from('client_files')
      .select('*')
      .eq('uploaded_by', user.id)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(10)
  ])

  return {
    projects: projectsData.data || [],
    messages: messagesData.data || [],
    files: filesData.data || []
  }
}

// ============================================================================
// FREELANCER DASHBOARD QUERIES
// ============================================================================

export interface FreelancerStats {
  totalClients: number
  activeClients: number
  totalDeliverables: number
  pendingApprovals: number
  totalRevenue: number
  pendingRevenue: number
  monthlyGrowth: number
}

export interface ActiveClient {
  id: string
  name: string
  email: string
  projectCount: number
  status: 'active' | 'review' | 'completed'
  avatar?: string
}

export interface PendingApproval {
  id: string
  projectName: string
  clientName: string
  deliverableType: string
  amount: number
  dueDate: string
}

/**
 * Get freelancer dashboard statistics
 */
export async function getFreelancerStats(): Promise<FreelancerStats> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get all projects for this freelancer
  const { data: projects, error: projectsError } = await supabase
    .from('client_projects')
    .select('id, client_id, status, budget, spent')
    .eq('user_id', user.id)

  if (projectsError) throw projectsError

  // Get unique clients
  const clientIds = [...new Set((projects || []).map(p => p.client_id))]
  const activeClientIds = [...new Set((projects || [])
    .filter(p => p.status === 'in-progress' || p.status === 'review')
    .map(p => p.client_id))]

  // Get deliverables count
  const projectIds = (projects || []).map(p => p.id)
  const { count: deliverablesCount, error: deliverablesError } = await supabase
    .from('project_deliverables')
    .select('*', { count: 'exact', head: true })
    .in('project_id', projectIds.length > 0 ? projectIds : [''])

  if (deliverablesError) throw deliverablesError

  // Get pending approvals count
  const { count: pendingCount, error: pendingError } = await supabase
    .from('project_deliverables')
    .select('*', { count: 'exact', head: true })
    .in('project_id', projectIds.length > 0 ? projectIds : [''])
    .eq('requires_approval', true)
    .is('approved_by', null)
    .neq('status', 'completed')

  if (pendingError) throw pendingError

  // Calculate revenue from paid invoices
  const { data: paidInvoices, error: paidError } = await supabase
    .from('client_invoices')
    .select('total')
    .in('project_id', projectIds.length > 0 ? projectIds : [''])
    .eq('status', 'paid')

  if (paidError) throw paidError

  // Calculate pending revenue from unpaid invoices
  const { data: pendingInvoices, error: unpaidError } = await supabase
    .from('client_invoices')
    .select('total')
    .in('project_id', projectIds.length > 0 ? projectIds : [''])
    .in('status', ['sent', 'draft'])

  if (unpaidError) throw unpaidError

  const totalRevenue = (paidInvoices || []).reduce((sum, inv) => sum + (inv.total || 0), 0)
  const pendingRevenue = (pendingInvoices || []).reduce((sum, inv) => sum + (inv.total || 0), 0)

  // Calculate monthly growth (compare this month vs last month)
  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

  const { data: thisMonthInvoices } = await supabase
    .from('client_invoices')
    .select('total')
    .in('project_id', projectIds.length > 0 ? projectIds : [''])
    .eq('status', 'paid')
    .gte('paid_date', thisMonthStart.toISOString())

  const { data: lastMonthInvoices } = await supabase
    .from('client_invoices')
    .select('total')
    .in('project_id', projectIds.length > 0 ? projectIds : [''])
    .eq('status', 'paid')
    .gte('paid_date', lastMonthStart.toISOString())
    .lte('paid_date', lastMonthEnd.toISOString())

  const thisMonthRevenue = (thisMonthInvoices || []).reduce((sum, inv) => sum + (inv.total || 0), 0)
  const lastMonthRevenue = (lastMonthInvoices || []).reduce((sum, inv) => sum + (inv.total || 0), 0)
  const monthlyGrowth = lastMonthRevenue > 0
    ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
    : (thisMonthRevenue > 0 ? 100 : 0)

  return {
    totalClients: clientIds.length,
    activeClients: activeClientIds.length,
    totalDeliverables: deliverablesCount || 0,
    pendingApprovals: pendingCount || 0,
    totalRevenue,
    pendingRevenue,
    monthlyGrowth: Math.round(monthlyGrowth)
  }
}

/**
 * Get active clients for freelancer dashboard
 */
export async function getActiveClients(limit: number = 5): Promise<ActiveClient[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get projects grouped by client
  const { data: projects, error: projectsError } = await supabase
    .from('client_projects')
    .select('client_id, status')
    .eq('user_id', user.id)

  if (projectsError) throw projectsError

  // Group projects by client
  const clientMap = new Map<string, { projectCount: number; statuses: Set<string> }>()
  for (const project of projects || []) {
    if (!clientMap.has(project.client_id)) {
      clientMap.set(project.client_id, { projectCount: 0, statuses: new Set() })
    }
    const client = clientMap.get(project.client_id)!
    client.projectCount++
    client.statuses.add(project.status)
  }

  // Get client details from profiles
  const clientIds = [...clientMap.keys()].slice(0, limit)
  if (clientIds.length === 0) return []

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, email, avatar_url')
    .in('id', clientIds)

  if (profilesError) throw profilesError

  return (profiles || []).map(profile => {
    const clientData = clientMap.get(profile.id)!
    let status: 'active' | 'review' | 'completed' = 'completed'
    if (clientData.statuses.has('in-progress')) status = 'active'
    else if (clientData.statuses.has('review')) status = 'review'

    return {
      id: profile.id,
      name: profile.full_name || profile.email || 'Unknown Client',
      email: profile.email || '',
      projectCount: clientData.projectCount,
      status,
      avatar: profile.avatar_url
    }
  })
}

/**
 * Get pending approvals for freelancer dashboard
 */
export async function getPendingApprovals(limit: number = 5): Promise<PendingApproval[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get user's projects
  const { data: projects, error: projectsError } = await supabase
    .from('client_projects')
    .select('id, name, client_id')
    .eq('user_id', user.id)

  if (projectsError) throw projectsError

  const projectIds = (projects || []).map(p => p.id)
  if (projectIds.length === 0) return []

  // Get pending deliverables
  const { data: deliverables, error: deliverablesError } = await supabase
    .from('project_deliverables')
    .select('id, project_id, name, due_date')
    .in('project_id', projectIds)
    .eq('requires_approval', true)
    .is('approved_by', null)
    .neq('status', 'completed')
    .order('due_date', { ascending: true })
    .limit(limit)

  if (deliverablesError) throw deliverablesError

  // Get milestone payments for amounts
  const deliverableIds = (deliverables || []).map(d => d.id)
  const { data: milestones } = await supabase
    .from('milestone_payments')
    .select('id, amount, milestone_name')
    .in('id', deliverableIds.length > 0 ? deliverableIds : [''])
    .eq('status', 'pending')

  const milestoneMap = new Map((milestones || []).map(m => [m.id, m]))

  // Get client names
  const clientIds = [...new Set((projects || []).map(p => p.client_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('id', clientIds.length > 0 ? clientIds : [''])

  const profileMap = new Map((profiles || []).map(p => [p.id, p]))
  const projectMap = new Map((projects || []).map(p => [p.id, p]))

  return (deliverables || []).map(deliverable => {
    const project = projectMap.get(deliverable.project_id)
    const client = project ? profileMap.get(project.client_id) : null
    const milestone = milestoneMap.get(deliverable.id)

    return {
      id: deliverable.id,
      projectName: project?.name || 'Unknown Project',
      clientName: client?.full_name || client?.email || 'Unknown Client',
      deliverableType: deliverable.name,
      amount: milestone?.amount || 0,
      dueDate: deliverable.due_date || new Date().toISOString()
    }
  })
}
