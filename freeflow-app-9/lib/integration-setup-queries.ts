/**
 * Integration Setup Database Queries
 * Wizard sessions, step tracking, validation, onboarding
 */

import { createClient } from '@/lib/supabase/client'
import { JsonValue } from '@/lib/types/database'

// ============================================================================
// TYPES
// ============================================================================

export type SetupStatus = 'not_started' | 'in_progress' | 'completed' | 'failed' | 'skipped'
export type ValidationStatus = 'pending' | 'validating' | 'valid' | 'invalid' | 'expired'
export type OnboardingStage = 'welcome' | 'select_integrations' | 'configure' | 'test' | 'complete'

export interface IntegrationSetupSession {
  id: string
  user_id: string
  integration_id?: string
  session_type: string
  current_step: number
  total_steps: number
  completed_steps: number
  status: SetupStatus
  started_at: string
  completed_at?: string
  abandoned_at?: string
  time_spent_seconds: number
  config_snapshot: Record<string, JsonValue>
  user_selections: Record<string, JsonValue>
  referrer?: string
  device_type?: string
  browser?: string
  created_at: string
  updated_at: string
}

export interface IntegrationSetupStep {
  id: string
  session_id: string
  step_number: number
  step_name: string
  step_type: string
  status: SetupStatus
  started_at?: string
  completed_at?: string
  time_spent_seconds: number
  step_data: Record<string, JsonValue>
  validation_errors?: string[]
  help_accessed: boolean
  skip_reason?: string
  created_at: string
  updated_at: string
}

export interface IntegrationValidationResult {
  id: string
  session_id?: string
  integration_id: string
  user_id: string
  validation_type: string
  validation_status: ValidationStatus
  test_endpoint?: string
  test_request?: Record<string, JsonValue>
  test_response?: Record<string, JsonValue>
  is_valid: boolean
  error_message?: string
  error_code?: string
  warnings?: string[]
  response_time_ms?: number
  retry_count: number
  max_retries: number
  validated_at?: string
  expires_at?: string
  created_at: string
}

export interface IntegrationOnboardingProgress {
  id: string
  user_id: string
  current_stage: OnboardingStage
  completed_stages: OnboardingStage[]
  total_integrations_available: number
  required_integrations_completed: number
  optional_integrations_completed: number
  is_complete: boolean
  completion_percentage: number
  completed_at?: string
  skipped_optional: boolean
  selected_integrations: string[]
  onboarding_metadata: Record<string, JsonValue>
  created_at: string
  updated_at: string
}

export interface IntegrationSetupError {
  id: string
  session_id?: string
  step_id?: string
  user_id: string
  error_type: string
  error_code?: string
  error_message: string
  occurred_at_step?: number
  integration_id?: string
  stack_trace?: string
  request_data?: Record<string, JsonValue>
  response_data?: Record<string, JsonValue>
  is_resolved: boolean
  resolved_at?: string
  resolution_notes?: string
  user_action?: string
  created_at: string
}

// ============================================================================
// SETUP SESSIONS
// ============================================================================

export async function createSetupSession(userId: string, sessionData: Partial<IntegrationSetupSession>) {
  const supabase = createClient()
  return await supabase
    .from('integration_setup_sessions')
    .insert({
      user_id: userId,
      ...sessionData
    })
    .select()
    .single()
}

export async function getSetupSession(sessionId: string) {
  const supabase = createClient()
  return await supabase
    .from('integration_setup_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()
}

export async function getUserSetupSessions(userId: string, status?: SetupStatus) {
  const supabase = createClient()
  let query = supabase
    .from('integration_setup_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  return await query
}

export async function updateSetupSession(sessionId: string, updates: Partial<IntegrationSetupSession>) {
  const supabase = createClient()
  return await supabase
    .from('integration_setup_sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single()
}

export async function completeSetupSession(sessionId: string) {
  const supabase = createClient()
  return await supabase
    .from('integration_setup_sessions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('id', sessionId)
    .select()
    .single()
}

export async function abandonSetupSession(sessionId: string) {
  const supabase = createClient()
  return await supabase
    .from('integration_setup_sessions')
    .update({
      status: 'failed',
      abandoned_at: new Date().toISOString()
    })
    .eq('id', sessionId)
    .select()
    .single()
}

export async function getActiveSetupSession(userId: string, integrationId?: string) {
  const supabase = createClient()
  let query = supabase
    .from('integration_setup_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'in_progress')
    .order('started_at', { ascending: false })
    .limit(1)

  if (integrationId) {
    query = query.eq('integration_id', integrationId)
  }

  return await query.single()
}

// ============================================================================
// SETUP STEPS
// ============================================================================

export async function createSetupStep(sessionId: string, stepData: Partial<IntegrationSetupStep>) {
  const supabase = createClient()
  return await supabase
    .from('integration_setup_steps')
    .insert({
      session_id: sessionId,
      ...stepData
    })
    .select()
    .single()
}

export async function getSessionSteps(sessionId: string) {
  const supabase = createClient()
  return await supabase
    .from('integration_setup_steps')
    .select('*')
    .eq('session_id', sessionId)
    .order('step_number')
}

export async function updateSetupStep(stepId: string, updates: Partial<IntegrationSetupStep>) {
  const supabase = createClient()
  return await supabase
    .from('integration_setup_steps')
    .update(updates)
    .eq('id', stepId)
    .select()
    .single()
}

export async function startStep(stepId: string) {
  const supabase = createClient()
  return await supabase
    .from('integration_setup_steps')
    .update({
      status: 'in_progress',
      started_at: new Date().toISOString()
    })
    .eq('id', stepId)
    .select()
    .single()
}

export async function completeStep(stepId: string, stepData?: Record<string, JsonValue>) {
  const supabase = createClient()
  return await supabase
    .from('integration_setup_steps')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      step_data: stepData || {}
    })
    .eq('id', stepId)
    .select()
    .single()
}

export async function skipStep(stepId: string, reason?: string) {
  const supabase = createClient()
  return await supabase
    .from('integration_setup_steps')
    .update({
      status: 'skipped',
      skip_reason: reason
    })
    .eq('id', stepId)
    .select()
    .single()
}

export async function markStepHelpAccessed(stepId: string) {
  const supabase = createClient()
  return await supabase
    .from('integration_setup_steps')
    .update({ help_accessed: true })
    .eq('id', stepId)
    .select()
    .single()
}

export async function getCurrentStep(sessionId: string) {
  const supabase = createClient()
  return await supabase
    .from('integration_setup_steps')
    .select('*')
    .eq('session_id', sessionId)
    .eq('status', 'in_progress')
    .single()
}

// ============================================================================
// VALIDATION RESULTS
// ============================================================================

export async function createValidationResult(resultData: Partial<IntegrationValidationResult>) {
  const supabase = createClient()
  return await supabase
    .from('integration_validation_results')
    .insert(resultData)
    .select()
    .single()
}

export async function getValidationResult(resultId: string) {
  const supabase = createClient()
  return await supabase
    .from('integration_validation_results')
    .select('*')
    .eq('id', resultId)
    .single()
}

export async function getIntegrationValidations(integrationId: string, userId: string) {
  const supabase = createClient()
  return await supabase
    .from('integration_validation_results')
    .select('*')
    .eq('integration_id', integrationId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
}

export async function updateValidationResult(resultId: string, updates: Partial<IntegrationValidationResult>) {
  const supabase = createClient()
  return await supabase
    .from('integration_validation_results')
    .update(updates)
    .eq('id', resultId)
    .select()
    .single()
}

export async function markValidationValid(resultId: string, responseTimeMs?: number) {
  const supabase = createClient()
  return await supabase
    .from('integration_validation_results')
    .update({
      validation_status: 'valid',
      is_valid: true,
      validated_at: new Date().toISOString(),
      response_time_ms: responseTimeMs
    })
    .eq('id', resultId)
    .select()
    .single()
}

export async function markValidationInvalid(resultId: string, errorMessage: string, errorCode?: string) {
  const supabase = createClient()
  return await supabase
    .from('integration_validation_results')
    .update({
      validation_status: 'invalid',
      is_valid: false,
      error_message: errorMessage,
      error_code: errorCode,
      validated_at: new Date().toISOString()
    })
    .eq('id', resultId)
    .select()
    .single()
}

export async function getLatestValidation(integrationId: string, userId: string, validationType: string) {
  const supabase = createClient()
  return await supabase
    .from('integration_validation_results')
    .select('*')
    .eq('integration_id', integrationId)
    .eq('user_id', userId)
    .eq('validation_type', validationType)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
}

// ============================================================================
// ONBOARDING PROGRESS
// ============================================================================

export async function getOnboardingProgress(userId: string) {
  const supabase = createClient()
  return await supabase
    .from('integration_onboarding_progress')
    .select('*')
    .eq('user_id', userId)
    .single()
}

export async function createOnboardingProgress(userId: string, progressData?: Partial<IntegrationOnboardingProgress>) {
  const supabase = createClient()
  return await supabase
    .from('integration_onboarding_progress')
    .insert({
      user_id: userId,
      ...progressData
    })
    .select()
    .single()
}

export async function updateOnboardingProgress(userId: string, updates: Partial<IntegrationOnboardingProgress>) {
  const supabase = createClient()
  return await supabase
    .from('integration_onboarding_progress')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()
}

export async function advanceOnboardingStage(userId: string, nextStage: OnboardingStage) {
  const supabase = createClient()

  const { data: progress } = await getOnboardingProgress(userId)

  if (!progress) {
    return { data: null, error: new Error('Onboarding progress not found') }
  }

  const completedStages = [...progress.completed_stages, progress.current_stage]

  return await supabase
    .from('integration_onboarding_progress')
    .update({
      current_stage: nextStage,
      completed_stages: completedStages
    })
    .eq('user_id', userId)
    .select()
    .single()
}

export async function incrementRequiredIntegrationsCompleted(userId: string) {
  const supabase = createClient()

  const { data: progress } = await getOnboardingProgress(userId)

  if (!progress) {
    return { data: null, error: new Error('Onboarding progress not found') }
  }

  return await supabase
    .from('integration_onboarding_progress')
    .update({
      required_integrations_completed: progress.required_integrations_completed + 1
    })
    .eq('user_id', userId)
    .select()
    .single()
}

export async function incrementOptionalIntegrationsCompleted(userId: string) {
  const supabase = createClient()

  const { data: progress } = await getOnboardingProgress(userId)

  if (!progress) {
    return { data: null, error: new Error('Onboarding progress not found') }
  }

  return await supabase
    .from('integration_onboarding_progress')
    .update({
      optional_integrations_completed: progress.optional_integrations_completed + 1
    })
    .eq('user_id', userId)
    .select()
    .single()
}

export async function completeOnboarding(userId: string) {
  const supabase = createClient()
  return await supabase
    .from('integration_onboarding_progress')
    .update({
      is_complete: true,
      current_stage: 'complete',
      completed_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select()
    .single()
}

export async function skipOptionalIntegrations(userId: string) {
  const supabase = createClient()
  return await supabase
    .from('integration_onboarding_progress')
    .update({ skipped_optional: true })
    .eq('user_id', userId)
    .select()
    .single()
}

// ============================================================================
// SETUP ERRORS
// ============================================================================

export async function logSetupError(errorData: Partial<IntegrationSetupError>) {
  const supabase = createClient()
  return await supabase
    .from('integration_setup_errors')
    .insert(errorData)
    .select()
    .single()
}

export async function getSessionErrors(sessionId: string) {
  const supabase = createClient()
  return await supabase
    .from('integration_setup_errors')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
}

export async function getUserSetupErrors(userId: string, limit: number = 50) {
  const supabase = createClient()
  return await supabase
    .from('integration_setup_errors')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
}

export async function resolveSetupError(errorId: string, resolutionNotes?: string) {
  const supabase = createClient()
  return await supabase
    .from('integration_setup_errors')
    .update({
      is_resolved: true,
      resolved_at: new Date().toISOString(),
      resolution_notes: resolutionNotes
    })
    .eq('id', errorId)
    .select()
    .single()
}

export async function getUnresolvedErrors(userId?: string) {
  const supabase = createClient()
  let query = supabase
    .from('integration_setup_errors')
    .select('*')
    .eq('is_resolved', false)
    .order('created_at', { ascending: false })

  if (userId) {
    query = query.eq('user_id', userId)
  }

  return await query
}

export async function getErrorsByType(errorType: string, limit: number = 100) {
  const supabase = createClient()
  return await supabase
    .from('integration_setup_errors')
    .select('*')
    .eq('error_type', errorType)
    .order('created_at', { ascending: false })
    .limit(limit)
}

// ============================================================================
// STATISTICS & ANALYTICS
// ============================================================================

export async function getSetupStats(userId?: string) {
  const supabase = createClient()

  let sessionsQuery = supabase.from('integration_setup_sessions').select('*')
  let errorsQuery = supabase.from('integration_setup_errors').select('*')

  if (userId) {
    sessionsQuery = sessionsQuery.eq('user_id', userId)
    errorsQuery = errorsQuery.eq('user_id', userId)
  }

  const [sessionsResult, errorsResult] = await Promise.all([
    sessionsQuery,
    errorsQuery
  ])

  const sessions = sessionsResult.data || []
  const errors = errorsResult.data || []

  const completedSessions = sessions.filter(s => s.status === 'completed')
  const failedSessions = sessions.filter(s => s.status === 'failed')
  const inProgressSessions = sessions.filter(s => s.status === 'in_progress')

  const averageTimeToComplete = completedSessions.length > 0
    ? completedSessions.reduce((sum, s) => sum + s.time_spent_seconds, 0) / completedSessions.length
    : 0

  const completionRate = sessions.length > 0
    ? (completedSessions.length / sessions.length) * 100
    : 0

  const errorsByType = errors.reduce((acc, error) => {
    acc[error.error_type] = (acc[error.error_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    sessions: {
      total: sessions.length,
      completed: completedSessions.length,
      failed: failedSessions.length,
      inProgress: inProgressSessions.length,
      averageTimeToComplete: Math.round(averageTimeToComplete),
      completionRate: Math.round(completionRate * 100) / 100
    },
    errors: {
      total: errors.length,
      unresolved: errors.filter(e => !e.is_resolved).length,
      byType: errorsByType
    }
  }
}

export async function getOnboardingStats() {
  const supabase = createClient()

  const { data: onboardingProgress } = await supabase
    .from('integration_onboarding_progress')
    .select('*')

  if (!onboardingProgress) {
    return {
      totalUsers: 0,
      completed: 0,
      inProgress: 0,
      averageCompletion: 0
    }
  }

  const completed = onboardingProgress.filter(p => p.is_complete).length
  const inProgress = onboardingProgress.filter(p => !p.is_complete).length
  const averageCompletion = onboardingProgress.reduce((sum, p) => sum + p.completion_percentage, 0) / onboardingProgress.length

  return {
    totalUsers: onboardingProgress.length,
    completed,
    inProgress,
    averageCompletion: Math.round(averageCompletion * 100) / 100
  }
}
