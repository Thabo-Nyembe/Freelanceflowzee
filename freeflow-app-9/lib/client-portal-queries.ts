/**
 * Client Portal System - Database Queries
 *
 * Comprehensive query library for client relationship management with portal access.
 *
 * Database Schema: 11 tables
 * - portal_clients: Client company records with health scoring
 * - portal_projects: Client projects with budget tracking
 * - portal_project_milestones: Project milestones and progress
 * - portal_project_risks: Project risk management
 * - portal_communications: Client communication logs
 * - portal_files: File management with versioning
 * - portal_file_versions: File version history
 * - portal_invoices: Invoice management
 * - portal_invoice_items: Invoice line items
 * - portal_client_activities: Activity tracking
 * - portal_client_metrics: Client performance metrics
 */

import { createClient } from '@/lib/supabase/client'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type ClientStatus = 'active' | 'onboarding' | 'inactive' | 'churned'
export type ClientTier = 'basic' | 'standard' | 'premium' | 'enterprise'
export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled'
export type CommunicationType = 'email' | 'call' | 'meeting' | 'message' | 'note'
export type FileCategory = 'contract' | 'invoice' | 'proposal' | 'report' | 'deliverable' | 'other'
export type AccessLevel = 'view' | 'comment' | 'edit' | 'admin'
export type HealthStatus = 'excellent' | 'good' | 'warning' | 'critical'
export type RiskType = 'budget' | 'timeline' | 'scope' | 'quality' | 'resource'
export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

export interface PortalClient {
  id: string
  user_id: string
  company_name: string
  contact_person: string
  email: string
  phone?: string
  website?: string
  status: ClientStatus
  tier: ClientTier
  active_projects: number
  completed_projects: number
  total_revenue: number
  monthly_revenue: number
  health_score: number
  health_status: HealthStatus
  last_contact: string
  next_follow_up?: string
  tags?: string[]
  notes?: string
  address?: string
  industry?: string
  company_size?: string
  timezone: string
  preferred_contact: CommunicationType
  nps_score?: number
  satisfaction_rating?: number
  contract_start_date?: string
  contract_end_date?: string
  created_at: string
  updated_at: string
}

export interface PortalProject {
  id: string
  client_id: string
  user_id: string
  name: string
  description?: string
  status: ProjectStatus
  budget: number
  spent: number
  remaining: number
  progress: number
  start_date: string
  end_date: string
  deadline: string
  team?: string[]
  deliverables?: string[]
  priority: string
  category?: string
  tags?: string[]
  is_starred: boolean
  created_at: string
  updated_at: string
}

export interface ProjectMilestone {
  id: string
  project_id: string
  title: string
  description?: string
  due_date: string
  completed: boolean
  completed_at?: string
  progress: number
  created_at: string
}

export interface ProjectRisk {
  id: string
  project_id: string
  type: RiskType
  severity: RiskSeverity
  description: string
  mitigation?: string
  status: 'open' | 'mitigated' | 'closed'
  created_at: string
  updated_at: string
}

export interface Communication {
  id: string
  client_id: string
  user_id: string
  type: CommunicationType
  subject: string
  content: string
  summary?: string
  outcome?: string
  follow_up_required: boolean
  follow_up_date?: string
  attendees?: string[]
  duration_minutes?: number
  attachments?: string[]
  created_at: string
  updated_at: string
}

export interface PortalFile {
  id: string
  client_id: string
  user_id: string
  name: string
  size: number
  type: string
  category: FileCategory
  url: string
  access_level: AccessLevel
  description?: string
  tags?: string[]
  version: number
  is_latest: boolean
  shared_with?: string[]
  downloaded_count: number
  last_accessed?: string
  created_at: string
  updated_at: string
}

export interface FileVersion {
  id: string
  file_id: string
  version: number
  url: string
  size: number
  uploaded_by: string
  change_notes?: string
  created_at: string
}

export interface PortalInvoice {
  id: string
  client_id: string
  user_id: string
  invoice_number: string
  status: InvoiceStatus
  issue_date: string
  due_date: string
  paid_date?: string
  subtotal: number
  tax: number
  discount: number
  total: number
  currency: string
  notes?: string
  terms?: string
  created_at: string
  updated_at: string
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price: number
  amount: number
  created_at: string
}

export interface ClientActivity {
  id: string
  client_id: string
  user_id: string
  activity_type: string
  description: string
  metadata?: Record<string, any>
  created_at: string
}

export interface ClientMetrics {
  id: string
  client_id: string
  metric_date: string
  revenue: number
  projects_completed: number
  communications_count: number
  satisfaction_score?: number
  health_score: number
  created_at: string
}

// ============================================================================
// CLIENT QUERIES (12 functions)
// ============================================================================

/**
 * Get all clients for current user
 */
export async function getClients(filters?: {
  status?: ClientStatus
  tier?: ClientTier
  search?: string
  limit?: number
  offset?: number
}): Promise<PortalClient[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  let query = supabase
    .from('portal_clients')
    .select('*')
    .eq('user_id', user.id)
    .order('company_name', { ascending: true })

  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.tier) query = query.eq('tier', filters.tier)
  if (filters?.search) {
    query = query.or(`company_name.ilike.%${filters.search}%,contact_person.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
  }
  if (filters?.limit) query = query.limit(filters.limit)
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

/**
 * Get single client by ID
 */
export async function getClient(clientId: string): Promise<PortalClient | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('portal_clients')
    .select('*')
    .eq('id', clientId)
    .eq('user_id', user.id)
    .single()

  if (error) throw error
  return data
}

/**
 * Create new client
 */
export async function createClient(clientData: {
  company_name: string
  contact_person: string
  email: string
  phone?: string
  website?: string
  tier?: ClientTier
  industry?: string
  company_size?: string
  address?: string
  notes?: string
  tags?: string[]
}): Promise<PortalClient> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('portal_clients')
    .insert({
      ...clientData,
      user_id: user.id,
      tier: clientData.tier || 'basic',
      status: 'onboarding'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update client
 */
export async function updateClient(
  clientId: string,
  updates: Partial<Omit<PortalClient, 'id' | 'user_id' | 'created_at'>>
): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('portal_clients')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', clientId)
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Delete client
 */
export async function deleteClient(clientId: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('portal_clients')
    .delete()
    .eq('id', clientId)
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Update client health score
 */
export async function updateClientHealthScore(
  clientId: string,
  healthScore: number
): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  let healthStatus: HealthStatus = 'good'
  if (healthScore >= 90) healthStatus = 'excellent'
  else if (healthScore >= 70) healthStatus = 'good'
  else if (healthScore >= 50) healthStatus = 'warning'
  else healthStatus = 'critical'

  const { error } = await supabase
    .from('portal_clients')
    .update({
      health_score: healthScore,
      health_status: healthStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', clientId)
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Get clients by health status
 */
export async function getClientsByHealthStatus(
  healthStatus: HealthStatus
): Promise<PortalClient[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('portal_clients')
    .select('*')
    .eq('user_id', user.id)
    .eq('health_status', healthStatus)
    .order('health_score', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Get clients needing follow-up
 */
export async function getClientsNeedingFollowUp(): Promise<PortalClient[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const today = new Date().toISOString()

  const { data, error } = await supabase
    .from('portal_clients')
    .select('*')
    .eq('user_id', user.id)
    .lte('next_follow_up', today)
    .order('next_follow_up', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Get client statistics
 */
export async function getClientStatistics(): Promise<{
  total: number
  active: number
  onboarding: number
  inactive: number
  churned: number
  total_revenue: number
  monthly_revenue: number
  avg_health_score: number
}> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('portal_clients')
    .select('status, total_revenue, monthly_revenue, health_score')
    .eq('user_id', user.id)

  if (error) throw error

  const total = data?.length || 0
  const active = data?.filter(c => c.status === 'active').length || 0
  const onboarding = data?.filter(c => c.status === 'onboarding').length || 0
  const inactive = data?.filter(c => c.status === 'inactive').length || 0
  const churned = data?.filter(c => c.status === 'churned').length || 0
  const total_revenue = data?.reduce((sum, c) => sum + Number(c.total_revenue), 0) || 0
  const monthly_revenue = data?.reduce((sum, c) => sum + Number(c.monthly_revenue), 0) || 0
  const avg_health_score = total > 0
    ? data.reduce((sum, c) => sum + Number(c.health_score), 0) / total
    : 0

  return {
    total,
    active,
    onboarding,
    inactive,
    churned,
    total_revenue,
    monthly_revenue,
    avg_health_score: Math.round(avg_health_score)
  }
}

/**
 * Search clients
 */
export async function searchClients(searchTerm: string): Promise<PortalClient[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('portal_clients')
    .select('*')
    .eq('user_id', user.id)
    .or(`company_name.ilike.%${searchTerm}%,contact_person.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,industry.ilike.%${searchTerm}%`)
    .order('company_name', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Get clients by tier
 */
export async function getClientsByTier(tier: ClientTier): Promise<PortalClient[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('portal_clients')
    .select('*')
    .eq('user_id', user.id)
    .eq('tier', tier)
    .order('total_revenue', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Update last contact date
 */
export async function updateLastContact(clientId: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('portal_clients')
    .update({
      last_contact: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', clientId)
    .eq('user_id', user.id)

  if (error) throw error
}

// ============================================================================
// PROJECT QUERIES (10 functions)
// ============================================================================

/**
 * Get all projects for a client
 */
export async function getClientProjects(clientId: string): Promise<PortalProject[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('portal_projects')
    .select('*')
    .eq('client_id', clientId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get all projects
 */
export async function getProjects(filters?: {
  status?: ProjectStatus
  client_id?: string
  limit?: number
}): Promise<PortalProject[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  let query = supabase
    .from('portal_projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.client_id) query = query.eq('client_id', filters.client_id)
  if (filters?.limit) query = query.limit(filters.limit)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

/**
 * Get single project
 */
export async function getProject(projectId: string): Promise<PortalProject | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('portal_projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single()

  if (error) throw error
  return data
}

/**
 * Create project
 */
export async function createProject(projectData: {
  client_id: string
  name: string
  description?: string
  budget: number
  start_date: string
  end_date: string
  deadline: string
  priority?: string
  category?: string
  tags?: string[]
}): Promise<PortalProject> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('portal_projects')
    .insert({
      ...projectData,
      user_id: user.id,
      status: 'planning',
      remaining: projectData.budget,
      priority: projectData.priority || 'medium'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update project
 */
export async function updateProject(
  projectId: string,
  updates: Partial<Omit<PortalProject, 'id' | 'client_id' | 'user_id' | 'created_at'>>
): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('portal_projects')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', projectId)
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Delete project
 */
export async function deleteProject(projectId: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('portal_projects')
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

  const updates: any = {
    progress,
    updated_at: new Date().toISOString()
  }

  if (progress === 100) {
    updates.status = 'completed'
  }

  const { error } = await supabase
    .from('portal_projects')
    .update(updates)
    .eq('id', projectId)
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Update project budget
 */
export async function updateProjectBudget(
  projectId: string,
  spent: number
): Promise<void> {
  const supabase = createClient()

  const project = await getProject(projectId)
  if (!project) throw new Error('Project not found')

  const remaining = project.budget - spent

  const { error } = await supabase
    .from('portal_projects')
    .update({
      spent,
      remaining,
      updated_at: new Date().toISOString()
    })
    .eq('id', projectId)

  if (error) throw error
}

/**
 * Toggle project star
 */
export async function toggleProjectStar(projectId: string): Promise<boolean> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const project = await getProject(projectId)
  if (!project) throw new Error('Project not found')

  const newStarredState = !project.is_starred

  const { error } = await supabase
    .from('portal_projects')
    .update({
      is_starred: newStarredState,
      updated_at: new Date().toISOString()
    })
    .eq('id', projectId)
    .eq('user_id', user.id)

  if (error) throw error
  return newStarredState
}

/**
 * Get overdue projects
 */
export async function getOverdueProjects(): Promise<PortalProject[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const today = new Date().toISOString()

  const { data, error } = await supabase
    .from('portal_projects')
    .select('*')
    .eq('user_id', user.id)
    .in('status', ['planning', 'active'])
    .lt('deadline', today)
    .order('deadline', { ascending: true })

  if (error) throw error
  return data || []
}

// ============================================================================
// MILESTONE QUERIES (5 functions)
// ============================================================================

/**
 * Get project milestones
 */
export async function getProjectMilestones(projectId: string): Promise<ProjectMilestone[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('portal_project_milestones')
    .select('*')
    .eq('project_id', projectId)
    .order('due_date', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Create milestone
 */
export async function createMilestone(milestoneData: {
  project_id: string
  title: string
  description?: string
  due_date: string
  progress?: number
}): Promise<ProjectMilestone> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('portal_project_milestones')
    .insert({
      ...milestoneData,
      progress: milestoneData.progress || 0
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update milestone
 */
export async function updateMilestone(
  milestoneId: string,
  updates: Partial<Omit<ProjectMilestone, 'id' | 'project_id' | 'created_at'>>
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('portal_project_milestones')
    .update(updates)
    .eq('id', milestoneId)

  if (error) throw error
}

/**
 * Complete milestone
 */
export async function completeMilestone(milestoneId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('portal_project_milestones')
    .update({
      completed: true,
      completed_at: new Date().toISOString(),
      progress: 100
    })
    .eq('id', milestoneId)

  if (error) throw error
}

/**
 * Delete milestone
 */
export async function deleteMilestone(milestoneId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('portal_project_milestones')
    .delete()
    .eq('id', milestoneId)

  if (error) throw error
}

// ============================================================================
// RISK QUERIES (5 functions)
// ============================================================================

/**
 * Get project risks
 */
export async function getProjectRisks(projectId: string): Promise<ProjectRisk[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('portal_project_risks')
    .select('*')
    .eq('project_id', projectId)
    .order('severity', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Create risk
 */
export async function createRisk(riskData: {
  project_id: string
  type: RiskType
  severity: RiskSeverity
  description: string
  mitigation?: string
}): Promise<ProjectRisk> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('portal_project_risks')
    .insert({
      ...riskData,
      status: 'open'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update risk
 */
export async function updateRisk(
  riskId: string,
  updates: Partial<Omit<ProjectRisk, 'id' | 'project_id' | 'created_at'>>
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('portal_project_risks')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', riskId)

  if (error) throw error
}

/**
 * Close risk
 */
export async function closeRisk(riskId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('portal_project_risks')
    .update({
      status: 'closed',
      updated_at: new Date().toISOString()
    })
    .eq('id', riskId)

  if (error) throw error
}

/**
 * Delete risk
 */
export async function deleteRisk(riskId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('portal_project_risks')
    .delete()
    .eq('id', riskId)

  if (error) throw error
}

// ============================================================================
// COMMUNICATION QUERIES (6 functions)
// ============================================================================

/**
 * Get client communications
 */
export async function getClientCommunications(clientId: string): Promise<Communication[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('portal_communications')
    .select('*')
    .eq('client_id', clientId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get all communications
 */
export async function getCommunications(filters?: {
  type?: CommunicationType
  client_id?: string
  limit?: number
}): Promise<Communication[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  let query = supabase
    .from('portal_communications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (filters?.type) query = query.eq('type', filters.type)
  if (filters?.client_id) query = query.eq('client_id', filters.client_id)
  if (filters?.limit) query = query.limit(filters.limit)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

/**
 * Create communication
 */
export async function createCommunication(commData: {
  client_id: string
  type: CommunicationType
  subject: string
  content: string
  summary?: string
  outcome?: string
  follow_up_required?: boolean
  follow_up_date?: string
  attendees?: string[]
  duration_minutes?: number
  attachments?: string[]
}): Promise<Communication> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('portal_communications')
    .insert({
      ...commData,
      user_id: user.id,
      follow_up_required: commData.follow_up_required || false
    })
    .select()
    .single()

  if (error) throw error

  // Update last contact on client
  await updateLastContact(commData.client_id)

  return data
}

/**
 * Update communication
 */
export async function updateCommunication(
  commId: string,
  updates: Partial<Omit<Communication, 'id' | 'client_id' | 'user_id' | 'created_at'>>
): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('portal_communications')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', commId)
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Delete communication
 */
export async function deleteCommunication(commId: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('portal_communications')
    .delete()
    .eq('id', commId)
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Get communications requiring follow-up
 */
export async function getCommunicationsNeedingFollowUp(): Promise<Communication[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const today = new Date().toISOString()

  const { data, error } = await supabase
    .from('portal_communications')
    .select('*')
    .eq('user_id', user.id)
    .eq('follow_up_required', true)
    .lte('follow_up_date', today)
    .order('follow_up_date', { ascending: true })

  if (error) throw error
  return data || []
}

// ============================================================================
// FILE QUERIES (7 functions)
// ============================================================================

/**
 * Get client files
 */
export async function getClientFiles(clientId: string): Promise<PortalFile[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('portal_files')
    .select('*')
    .eq('client_id', clientId)
    .eq('user_id', user.id)
    .eq('is_latest', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get all files
 */
export async function getFiles(filters?: {
  category?: FileCategory
  client_id?: string
  limit?: number
}): Promise<PortalFile[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  let query = supabase
    .from('portal_files')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_latest', true)
    .order('created_at', { ascending: false })

  if (filters?.category) query = query.eq('category', filters.category)
  if (filters?.client_id) query = query.eq('client_id', filters.client_id)
  if (filters?.limit) query = query.limit(filters.limit)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

/**
 * Upload file
 */
export async function uploadFile(fileData: {
  client_id: string
  name: string
  size: number
  type: string
  category: FileCategory
  url: string
  access_level?: AccessLevel
  description?: string
  tags?: string[]
}): Promise<PortalFile> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('portal_files')
    .insert({
      ...fileData,
      user_id: user.id,
      access_level: fileData.access_level || 'view',
      version: 1,
      is_latest: true
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update file
 */
export async function updateFile(
  fileId: string,
  updates: Partial<Omit<PortalFile, 'id' | 'client_id' | 'user_id' | 'created_at'>>
): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('portal_files')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', fileId)
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Delete file
 */
export async function deleteFile(fileId: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('portal_files')
    .delete()
    .eq('id', fileId)
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Get file versions
 */
export async function getFileVersions(fileId: string): Promise<FileVersion[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('portal_file_versions')
    .select('*')
    .eq('file_id', fileId)
    .order('version', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Increment file download count
 */
export async function incrementFileDownloadCount(fileId: string): Promise<void> {
  const supabase = createClient()

  const { data: file } = await supabase
    .from('portal_files')
    .select('downloaded_count')
    .eq('id', fileId)
    .single()

  if (file) {
    const { error } = await supabase
      .from('portal_files')
      .update({
        downloaded_count: file.downloaded_count + 1,
        last_accessed: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', fileId)

    if (error) throw error
  }
}

// ============================================================================
// INVOICE QUERIES (6 functions)
// ============================================================================

/**
 * Get client invoices
 */
export async function getClientInvoices(clientId: string): Promise<PortalInvoice[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('portal_invoices')
    .select('*')
    .eq('client_id', clientId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get all invoices
 */
export async function getInvoices(filters?: {
  status?: InvoiceStatus
  client_id?: string
  limit?: number
}): Promise<PortalInvoice[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  let query = supabase
    .from('portal_invoices')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.client_id) query = query.eq('client_id', filters.client_id)
  if (filters?.limit) query = query.limit(filters.limit)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

/**
 * Create invoice
 */
export async function createInvoice(invoiceData: {
  client_id: string
  invoice_number: string
  issue_date: string
  due_date: string
  currency?: string
  notes?: string
  terms?: string
}): Promise<PortalInvoice> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('portal_invoices')
    .insert({
      ...invoiceData,
      user_id: user.id,
      status: 'draft',
      currency: invoiceData.currency || 'USD',
      subtotal: 0,
      tax: 0,
      discount: 0,
      total: 0
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update invoice
 */
export async function updateInvoice(
  invoiceId: string,
  updates: Partial<Omit<PortalInvoice, 'id' | 'client_id' | 'user_id' | 'created_at'>>
): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('portal_invoices')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', invoiceId)
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Delete invoice
 */
export async function deleteInvoice(invoiceId: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('portal_invoices')
    .delete()
    .eq('id', invoiceId)
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Mark invoice as paid
 */
export async function markInvoiceAsPaid(invoiceId: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('portal_invoices')
    .update({
      status: 'paid',
      paid_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', invoiceId)
    .eq('user_id', user.id)

  if (error) throw error
}

// ============================================================================
// ACTIVITY QUERIES (3 functions)
// ============================================================================

/**
 * Log client activity
 */
export async function logClientActivity(activityData: {
  client_id: string
  activity_type: string
  description: string
  metadata?: Record<string, any>
}): Promise<ClientActivity> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('portal_client_activities')
    .insert({
      ...activityData,
      user_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get client activities
 */
export async function getClientActivities(
  clientId: string,
  limit?: number
): Promise<ClientActivity[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  let query = supabase
    .from('portal_client_activities')
    .select('*')
    .eq('client_id', clientId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (limit) query = query.limit(limit)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

/**
 * Get recent activities
 */
export async function getRecentActivities(limit: number = 20): Promise<ClientActivity[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('portal_client_activities')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

// ============================================================================
// ANALYTICS & REPORTING (5 functions)
// ============================================================================

/**
 * Get portal statistics
 */
export async function getPortalStatistics(): Promise<{
  clients: number
  active_projects: number
  total_revenue: number
  pending_invoices: number
  overdue_projects: number
  communications_this_month: number
  avg_health_score: number
}> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const [clientStats, projects, invoices, communications, overdueProjects] = await Promise.all([
    getClientStatistics(),
    getProjects({ status: 'active' }),
    getInvoices({ status: 'sent' }),
    getCommunications({ limit: 100 }),
    getOverdueProjects()
  ])

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const commsThisMonth = communications.filter(c =>
    new Date(c.created_at) >= thirtyDaysAgo
  ).length

  return {
    clients: clientStats.total,
    active_projects: projects.length,
    total_revenue: clientStats.total_revenue,
    pending_invoices: invoices.length,
    overdue_projects: overdueProjects.length,
    communications_this_month: commsThisMonth,
    avg_health_score: clientStats.avg_health_score
  }
}

/**
 * Get client metrics
 */
export async function getClientMetrics(
  clientId: string,
  days: number = 30
): Promise<ClientMetrics[]> {
  const supabase = createClient()

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('portal_client_metrics')
    .select('*')
    .eq('client_id', clientId)
    .gte('metric_date', startDate.toISOString())
    .order('metric_date', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Record client metrics
 */
export async function recordClientMetrics(metricsData: {
  client_id: string
  metric_date: string
  revenue: number
  projects_completed: number
  communications_count: number
  satisfaction_score?: number
  health_score: number
}): Promise<ClientMetrics> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('portal_client_metrics')
    .insert(metricsData)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Export client data to CSV
 */
export async function exportClientDataToCSV(clientId: string): Promise<string> {
  const [client, projects, communications, invoices] = await Promise.all([
    getClient(clientId),
    getClientProjects(clientId),
    getClientCommunications(clientId),
    getClientInvoices(clientId)
  ])

  if (!client) throw new Error('Client not found')

  const csvData = []

  // Client header
  csvData.push('CLIENT INFORMATION')
  csvData.push(`Company,${client.company_name}`)
  csvData.push(`Contact,${client.contact_person}`)
  csvData.push(`Email,${client.email}`)
  csvData.push(`Status,${client.status}`)
  csvData.push(`Tier,${client.tier}`)
  csvData.push(`Health Score,${client.health_score}`)
  csvData.push('')

  // Projects
  csvData.push('PROJECTS')
  csvData.push('Name,Status,Budget,Spent,Progress,Deadline')
  projects.forEach(p => {
    csvData.push(`${p.name},${p.status},${p.budget},${p.spent},${p.progress}%,${new Date(p.deadline).toLocaleDateString()}`)
  })
  csvData.push('')

  // Communications
  csvData.push('COMMUNICATIONS')
  csvData.push('Date,Type,Subject,Outcome')
  communications.forEach(c => {
    csvData.push(`${new Date(c.created_at).toLocaleDateString()},${c.type},${c.subject},${c.outcome || 'N/A'}`)
  })
  csvData.push('')

  // Invoices
  csvData.push('INVOICES')
  csvData.push('Invoice #,Date,Due Date,Total,Status')
  invoices.forEach(i => {
    csvData.push(`${i.invoice_number},${new Date(i.issue_date).toLocaleDateString()},${new Date(i.due_date).toLocaleDateString()},${i.total},${i.status}`)
  })

  return csvData.join('\n')
}

/**
 * Get dashboard overview
 */
export async function getDashboardOverview(): Promise<{
  stats: Awaited<ReturnType<typeof getPortalStatistics>>
  recentClients: PortalClient[]
  activeProjects: PortalProject[]
  recentCommunications: Communication[]
  pendingInvoices: PortalInvoice[]
  clientsNeedingFollowUp: PortalClient[]
}> {
  const [stats, recentClients, activeProjects, recentCommunications, pendingInvoices, clientsNeedingFollowUp] = await Promise.all([
    getPortalStatistics(),
    getClients({ limit: 5 }),
    getProjects({ status: 'active', limit: 5 }),
    getCommunications({ limit: 5 }),
    getInvoices({ status: 'sent', limit: 5 }),
    getClientsNeedingFollowUp()
  ])

  return {
    stats,
    recentClients,
    activeProjects,
    recentCommunications,
    pendingInvoices,
    clientsNeedingFollowUp
  }
}
