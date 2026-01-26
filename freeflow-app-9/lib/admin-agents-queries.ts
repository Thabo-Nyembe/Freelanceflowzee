// Admin Agents System - Supabase Queries
// Comprehensive queries for agent management, coordination, monitoring, and reporting

import { createClient } from '@/lib/supabase/client'
import type { JsonValue } from '@/lib/types/database'

// ============================================================================
// TYPES
// ============================================================================

export type AgentType = 'ai_update' | 'bug_testing' | 'coordinator' | 'optimizer' | 'test_runner' | 'custom'
export type AgentStatus = 'active' | 'paused' | 'stopped' | 'error' | 'initializing'
export type ExecutionStatus = 'running' | 'completed' | 'failed' | 'cancelled' | 'pending'
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical'

export interface AdminAgent {
  id: string
  user_id: string
  agent_name: string
  agent_type: AgentType
  display_name: string
  description?: string
  version: string
  status: AgentStatus
  is_enabled: boolean
  is_critical: boolean
  config: Record<string, JsonValue>
  execution_interval?: number
  max_concurrent_executions: number
  timeout_seconds: number
  retry_count: number
  health_score: number
  last_health_check_at?: string
  error_message?: string
  total_executions: number
  successful_executions: number
  failed_executions: number
  average_duration_ms: number
  next_execution_at?: string
  last_execution_at?: string
  last_success_at?: string
  last_failure_at?: string
  tags: string[]
  metadata: Record<string, JsonValue>
  created_at: string
  updated_at: string
}

export interface AgentExecution {
  id: string
  agent_id: string
  user_id: string
  execution_status: ExecutionStatus
  trigger_type: string
  triggered_by?: string
  started_at?: string
  completed_at?: string
  duration_ms?: number
  result: Record<string, JsonValue>
  output_data: Record<string, JsonValue>
  error_message?: string
  stack_trace?: string
  cpu_usage_percent?: number
  memory_usage_mb?: number
  context: Record<string, JsonValue>
  metadata: Record<string, JsonValue>
  created_at: string
  updated_at: string
}

export interface AgentLog {
  id: string
  agent_id: string
  execution_id?: string
  user_id: string
  log_level: LogLevel
  message: string
  details: Record<string, JsonValue>
  function_name?: string
  line_number?: number
  file_path?: string
  stack_trace?: string
  tags: string[]
  metadata: Record<string, JsonValue>
  timestamp: string
  created_at: string
}

export interface AgentMetric {
  id: string
  agent_id: string
  user_id: string
  metric_name: string
  metric_value: number
  metric_unit?: string
  metric_type: string
  dimensions: Record<string, JsonValue>
  tags: string[]
  metadata: Record<string, JsonValue>
  timestamp: string
  created_at: string
}

export interface AgentConfiguration {
  id: string
  agent_id: string
  user_id: string
  config_key: string
  config_value: JsonValue
  config_type: string
  is_secret: boolean
  is_required: boolean
  default_value?: JsonValue
  validation_schema?: Record<string, JsonValue>
  version: number
  previous_value?: JsonValue
  changed_by?: string
  changed_at?: string
  description?: string
  tags: string[]
  metadata: Record<string, JsonValue>
  created_at: string
  updated_at: string
}

// ============================================================================
// ADMIN AGENTS - CRUD
// ============================================================================

export async function createAgent(userId: string, agentData: Partial<AdminAgent>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_agents')
    .insert({
      user_id: userId,
      status: 'initializing',
      is_enabled: true,
      is_critical: false,
      config: {},
      max_concurrent_executions: 1,
      timeout_seconds: 300,
      retry_count: 3,
      health_score: 100,
      total_executions: 0,
      successful_executions: 0,
      failed_executions: 0,
      average_duration_ms: 0,
      tags: [],
      metadata: {},
      ...agentData
    })
    .select()
    .single()

  if (error) throw error
  return data as AdminAgent
}

export async function getAgent(agentId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_agents')
    .select('*')
    .eq('id', agentId)
    .single()

  if (error) throw error
  return data as AdminAgent
}

export async function getAgentByName(userId: string, agentName: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_agents')
    .select('*')
    .eq('user_id', userId)
    .eq('agent_name', agentName)
    .single()

  if (error) throw error
  return data as AdminAgent
}

export async function getAgents(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_agents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as AdminAgent[]
}

export async function updateAgent(agentId: string, updates: Partial<AdminAgent>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_agents')
    .update(updates)
    .eq('id', agentId)
    .select()
    .single()

  if (error) throw error
  return data as AdminAgent
}

export async function deleteAgent(agentId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('admin_agents')
    .delete()
    .eq('id', agentId)

  if (error) throw error
  return true
}

// ============================================================================
// ADMIN AGENTS - FILTERS & QUERIES
// ============================================================================

export async function getActiveAgents(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_agents')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .eq('is_enabled', true)
    .order('agent_name', { ascending: true })

  if (error) throw error
  return data as AdminAgent[]
}

export async function getAgentsByType(userId: string, agentType: AgentType) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_agents')
    .select('*')
    .eq('user_id', userId)
    .eq('agent_type', agentType)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as AdminAgent[]
}

export async function getAgentsByStatus(userId: string, status: AgentStatus) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_agents')
    .select('*')
    .eq('user_id', userId)
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as AdminAgent[]
}

export async function getCriticalAgents(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_agents')
    .select('*')
    .eq('user_id', userId)
    .eq('is_critical', true)
    .order('health_score', { ascending: true })

  if (error) throw error
  return data as AdminAgent[]
}

export async function getUnhealthyAgents(userId: string, maxHealthScore: number = 70) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_agents')
    .select('*')
    .eq('user_id', userId)
    .lte('health_score', maxHealthScore)
    .order('health_score', { ascending: true })

  if (error) throw error
  return data as AdminAgent[]
}

export async function getAgentsDueForExecution(userId: string) {
  const supabase = createClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('admin_agents')
    .select('*')
    .eq('user_id', userId)
    .eq('is_enabled', true)
    .lte('next_execution_at', now)
    .order('next_execution_at', { ascending: true })

  if (error) throw error
  return data as AdminAgent[]
}

export async function enableAgent(agentId: string) {
  return updateAgent(agentId, { is_enabled: true })
}

export async function disableAgent(agentId: string) {
  return updateAgent(agentId, { is_enabled: false })
}

export async function pauseAgent(agentId: string) {
  return updateAgent(agentId, { status: 'paused' })
}

export async function resumeAgent(agentId: string) {
  return updateAgent(agentId, { status: 'active' })
}

export async function stopAgent(agentId: string) {
  return updateAgent(agentId, { status: 'stopped', is_enabled: false })
}

// ============================================================================
// AGENT EXECUTIONS - CRUD
// ============================================================================

export async function createExecution(userId: string, executionData: Partial<AgentExecution>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('agent_executions')
    .insert({
      user_id: userId,
      execution_status: 'pending',
      result: {},
      output_data: {},
      context: {},
      metadata: {},
      ...executionData
    })
    .select()
    .single()

  if (error) throw error
  return data as AgentExecution
}

export async function getExecution(executionId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('agent_executions')
    .select('*')
    .eq('id', executionId)
    .single()

  if (error) throw error
  return data as AgentExecution
}

export async function getExecutionsByAgent(agentId: string, limit: number = 50) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('agent_executions')
    .select('*')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as AgentExecution[]
}

export async function getRecentExecutions(userId: string, limit: number = 50) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('agent_executions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as AgentExecution[]
}

export async function updateExecution(executionId: string, updates: Partial<AgentExecution>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('agent_executions')
    .update(updates)
    .eq('id', executionId)
    .select()
    .single()

  if (error) throw error
  return data as AgentExecution
}

export async function startExecution(executionId: string) {
  return updateExecution(executionId, {
    execution_status: 'running',
    started_at: new Date().toISOString()
  })
}

export async function completeExecution(executionId: string, result: Record<string, JsonValue>) {
  return updateExecution(executionId, {
    execution_status: 'completed',
    result
  })
}

export async function failExecution(executionId: string, errorMessage: string, stackTrace?: string) {
  return updateExecution(executionId, {
    execution_status: 'failed',
    error_message: errorMessage,
    stack_trace: stackTrace
  })
}

export async function cancelExecution(executionId: string) {
  return updateExecution(executionId, {
    execution_status: 'cancelled'
  })
}

// ============================================================================
// AGENT EXECUTIONS - FILTERS & QUERIES
// ============================================================================

export async function getRunningExecutions(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('agent_executions')
    .select('*')
    .eq('user_id', userId)
    .eq('execution_status', 'running')
    .order('started_at', { ascending: false })

  if (error) throw error
  return data as AgentExecution[]
}

export async function getFailedExecutions(userId: string, limit: number = 50) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('agent_executions')
    .select('*')
    .eq('user_id', userId)
    .eq('execution_status', 'failed')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as AgentExecution[]
}

export async function getExecutionsByStatus(userId: string, status: ExecutionStatus, limit: number = 50) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('agent_executions')
    .select('*')
    .eq('user_id', userId)
    .eq('execution_status', status)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as AgentExecution[]
}

// ============================================================================
// AGENT LOGS - CRUD
// ============================================================================

export async function createLog(userId: string, logData: Partial<AgentLog>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('agent_logs')
    .insert({
      user_id: userId,
      timestamp: new Date().toISOString(),
      details: {},
      tags: [],
      metadata: {},
      ...logData
    })
    .select()
    .single()

  if (error) throw error
  return data as AgentLog
}

export async function getLogs(agentId: string, limit: number = 100) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('agent_logs')
    .select('*')
    .eq('agent_id', agentId)
    .order('timestamp', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as AgentLog[]
}

export async function getLogsByExecution(executionId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('agent_logs')
    .select('*')
    .eq('execution_id', executionId)
    .order('timestamp', { ascending: true })

  if (error) throw error
  return data as AgentLog[]
}

export async function getLogsByLevel(userId: string, logLevel: LogLevel, limit: number = 100) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('agent_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('log_level', logLevel)
    .order('timestamp', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as AgentLog[]
}

export async function getErrorLogs(userId: string, limit: number = 100) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('agent_logs')
    .select('*')
    .eq('user_id', userId)
    .in('log_level', ['error', 'critical'])
    .order('timestamp', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as AgentLog[]
}

// ============================================================================
// AGENT METRICS - CRUD
// ============================================================================

export async function recordMetric(userId: string, metricData: Partial<AgentMetric>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('agent_metrics')
    .insert({
      user_id: userId,
      timestamp: new Date().toISOString(),
      dimensions: {},
      tags: [],
      metadata: {},
      ...metricData
    })
    .select()
    .single()

  if (error) throw error
  return data as AgentMetric
}

export async function getMetrics(agentId: string, metricName?: string, limit: number = 1000) {
  const supabase = createClient()
  let query = supabase
    .from('agent_metrics')
    .select('*')
    .eq('agent_id', agentId)

  if (metricName) {
    query = query.eq('metric_name', metricName)
  }

  const { data, error } = await query
    .order('timestamp', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as AgentMetric[]
}

export async function getMetricsByTimeRange(
  agentId: string,
  metricName: string,
  startTime: string,
  endTime: string
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('agent_metrics')
    .select('*')
    .eq('agent_id', agentId)
    .eq('metric_name', metricName)
    .gte('timestamp', startTime)
    .lte('timestamp', endTime)
    .order('timestamp', { ascending: true })

  if (error) throw error
  return data as AgentMetric[]
}

// ============================================================================
// AGENT CONFIGURATIONS - CRUD
// ============================================================================

export async function setConfiguration(userId: string, configData: Partial<AgentConfiguration>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('agent_configurations')
    .upsert({
      user_id: userId,
      is_secret: false,
      is_required: false,
      version: 1,
      tags: [],
      metadata: {},
      ...configData
    })
    .select()
    .single()

  if (error) throw error
  return data as AgentConfiguration
}

export async function getConfiguration(agentId: string, configKey: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('agent_configurations')
    .select('*')
    .eq('agent_id', agentId)
    .eq('config_key', configKey)
    .single()

  if (error) throw error
  return data as AgentConfiguration
}

export async function getConfigurations(agentId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('agent_configurations')
    .select('*')
    .eq('agent_id', agentId)
    .order('config_key', { ascending: true })

  if (error) throw error
  return data as AgentConfiguration[]
}

export async function deleteConfiguration(agentId: string, configKey: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('agent_configurations')
    .delete()
    .eq('agent_id', agentId)
    .eq('config_key', configKey)

  if (error) throw error
  return true
}

// ============================================================================
// STATISTICS & ANALYTICS
// ============================================================================

export async function getAgentStats(userId: string) {
  const supabase = createClient()

  const [
    totalResult,
    activeResult,
    criticalResult,
    unhealthyResult,
    executionsResult,
    failedExecutionsResult
  ] = await Promise.all([
    supabase.from('admin_agents').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('admin_agents').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'active'),
    supabase.from('admin_agents').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_critical', true),
    supabase.from('admin_agents').select('id', { count: 'exact', head: true }).eq('user_id', userId).lte('health_score', 70),
    supabase.from('agent_executions').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('agent_executions').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('execution_status', 'failed')
  ])

  return {
    total_agents: totalResult.count || 0,
    active_agents: activeResult.count || 0,
    critical_agents: criticalResult.count || 0,
    unhealthy_agents: unhealthyResult.count || 0,
    total_executions: executionsResult.count || 0,
    failed_executions: failedExecutionsResult.count || 0,
    success_rate: executionsResult.count && executionsResult.count > 0
      ? ((executionsResult.count - (failedExecutionsResult.count || 0)) / executionsResult.count) * 100
      : 0
  }
}

export async function getSystemHealth(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_agents')
    .select('health_score, is_critical')
    .eq('user_id', userId)
    .eq('is_enabled', true)

  if (error) throw error

  const agents = data || []
  if (agents.length === 0) return 100

  let totalWeight = 0
  let weightedHealth = 0

  agents.forEach(agent => {
    const weight = agent.is_critical ? 2 : 1
    totalWeight += weight
    weightedHealth += agent.health_score * weight
  })

  return Math.round(weightedHealth / totalWeight)
}

export async function getAgentPerformance(agentId: string, days: number = 7) {
  const supabase = createClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('agent_executions')
    .select('execution_status, duration_ms, created_at')
    .eq('agent_id', agentId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true })

  if (error) throw error

  const executions = data || []
  const totalExecutions = executions.length
  const successfulExecutions = executions.filter(e => e.execution_status === 'completed').length
  const avgDuration = executions
    .filter(e => e.duration_ms)
    .reduce((sum, e) => sum + (e.duration_ms || 0), 0) / totalExecutions || 0

  return {
    total_executions: totalExecutions,
    successful_executions: successfulExecutions,
    failed_executions: totalExecutions - successfulExecutions,
    success_rate: totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0,
    average_duration_ms: avgDuration,
    executions
  }
}
