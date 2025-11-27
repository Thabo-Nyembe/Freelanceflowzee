/**
 * Email Agent Setup Query Library
 */

import { createClient } from '@/lib/supabase/client'

export type SetupStep = 'welcome' | 'email' | 'ai' | 'calendar' | 'payments' | 'sms' | 'crm' | 'review' | 'complete'
export type IntegrationType = 'email' | 'ai' | 'calendar' | 'payment' | 'sms' | 'crm'
export type IntegrationStatus = 'not_configured' | 'configuring' | 'testing' | 'connected' | 'error' | 'disconnected'
export type EmailProvider = 'gmail' | 'outlook' | 'imap' | 'resend' | 'sendgrid'
export type AIProvider = 'openai' | 'anthropic' | 'both' | 'google' | 'cohere'
export type CalendarProvider = 'google' | 'outlook' | 'apple' | 'none'
export type PaymentProvider = 'stripe' | 'paypal' | 'square' | 'none'
export type SMSProvider = 'twilio' | 'vonage' | 'messagebird' | 'none'
export type CRMProvider = 'hubspot' | 'salesforce' | 'pipedrive' | 'zoho' | 'none'

export interface SetupProgress {
  id: string
  user_id: string
  current_step: SetupStep
  completed_steps: SetupStep[]
  total_steps: number
  percentage: number
  required_integrations: number
  configured_integrations: number
  optional_integrations: number
  is_complete: boolean
  started_at: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface Integration {
  id: string
  user_id: string
  name: string
  type: IntegrationType
  provider: string
  status: IntegrationStatus
  required: boolean
  icon: string
  description?: string
  error?: string
  connected_at?: string
  last_synced?: string
  created_at: string
  updated_at: string
}

export interface IntegrationConfig {
  id: string
  integration_id: string
  provider: string
  credentials: Record<string, any>
  settings: Record<string, any>
  webhook_url?: string
  api_endpoint?: string
  enabled: boolean
  created_at: string
  updated_at: string
}

export interface TestResult {
  id: string
  integration_id: string
  success: boolean
  latency?: number
  error?: string
  details: Record<string, any>
  tested_at: string
  created_at: string
}

export interface EmailConfig {
  id: string
  user_id: string
  provider: EmailProvider
  email?: string
  api_key?: string
  password?: string
  host?: string
  port?: number
  secure: boolean
  auto_reply: boolean
  forward_to?: string
  signature?: string
  max_emails_per_day: number
  created_at: string
  updated_at: string
}

export interface AIConfig {
  id: string
  user_id: string
  provider: AIProvider
  api_key: string
  model?: string
  temperature: number
  max_tokens: number
  enable_sentiment_analysis: boolean
  enable_auto_response: boolean
  response_style: string
  created_at: string
  updated_at: string
}

export interface CalendarConfig {
  id: string
  user_id: string
  provider: CalendarProvider
  credentials: Record<string, any>
  default_duration: number
  buffer_time: number
  working_hours_start: string
  working_hours_end: string
  created_at: string
  updated_at: string
}

export interface PaymentConfig {
  id: string
  user_id: string
  provider: PaymentProvider
  api_key?: string
  secret_key?: string
  webhook_secret?: string
  currency: string
  accepted_methods: string[]
  created_at: string
  updated_at: string
}

export interface SMSConfig {
  id: string
  user_id: string
  provider: SMSProvider
  account_sid?: string
  auth_token?: string
  phone_number?: string
  enable_whatsapp: boolean
  default_country_code: string
  created_at: string
  updated_at: string
}

export interface CRMConfig {
  id: string
  user_id: string
  provider: CRMProvider
  api_key?: string
  domain?: string
  sync_interval: number
  auto_create_contacts: boolean
  created_at: string
  updated_at: string
}

export interface ProviderTemplate {
  id: string
  type: IntegrationType
  provider: string
  name: string
  icon: string
  color: string
  recommended: boolean
  features: string[]
  difficulty: string
  estimated_time: number
  requirements: string[]
  pricing_tier?: string
  starting_price?: string
  created_at: string
  updated_at: string
}

// SETUP PROGRESS
export async function getSetupProgress(userId: string) {
  const supabase = createClient()
  return await supabase.from('setup_progress').select('*').eq('user_id', userId).single()
}

export async function createSetupProgress(userId: string, progress?: Partial<SetupProgress>) {
  const supabase = createClient()
  return await supabase.from('setup_progress').insert({ user_id: userId, ...progress }).select().single()
}

export async function updateSetupProgress(userId: string, updates: Partial<SetupProgress>) {
  const supabase = createClient()
  return await supabase.from('setup_progress').update(updates).eq('user_id', userId).select().single()
}

export async function advanceSetupStep(userId: string, nextStep: SetupStep) {
  const supabase = createClient()
  const { data: current } = await getSetupProgress(userId)
  if (!current) return { data: null, error: new Error('Setup progress not found') }

  const completedSteps = [...(current.completed_steps || []), current.current_step]
  const percentage = Math.floor((completedSteps.length / current.total_steps) * 100)

  return await supabase.from('setup_progress')
    .update({ current_step: nextStep, completed_steps: completedSteps, percentage })
    .eq('user_id', userId)
    .select()
    .single()
}

export async function completeSetup(userId: string) {
  const supabase = createClient()
  return await supabase.from('setup_progress')
    .update({ is_complete: true, percentage: 100, current_step: 'complete' })
    .eq('user_id', userId)
    .select()
    .single()
}

// INTEGRATIONS
export async function getIntegrations(userId: string, filters?: { type?: IntegrationType; status?: IntegrationStatus }) {
  const supabase = createClient()
  let query = supabase.from('integrations').select('*').eq('user_id', userId).order('required', { ascending: false })
  if (filters?.type) query = query.eq('type', filters.type)
  if (filters?.status) query = query.eq('status', filters.status)
  return await query
}

export async function getIntegration(integrationId: string) {
  const supabase = createClient()
  return await supabase.from('integrations').select('*').eq('id', integrationId).single()
}

export async function createIntegration(userId: string, integration: Partial<Integration>) {
  const supabase = createClient()
  return await supabase.from('integrations').insert({ user_id: userId, ...integration }).select().single()
}

export async function updateIntegration(integrationId: string, updates: Partial<Integration>) {
  const supabase = createClient()
  return await supabase.from('integrations').update(updates).eq('id', integrationId).select().single()
}

export async function connectIntegration(integrationId: string) {
  const supabase = createClient()
  return await supabase.from('integrations').update({ status: 'connected' }).eq('id', integrationId).select().single()
}

export async function disconnectIntegration(integrationId: string) {
  const supabase = createClient()
  return await supabase.from('integrations').update({ status: 'disconnected' }).eq('id', integrationId).select().single()
}

export async function deleteIntegration(integrationId: string) {
  const supabase = createClient()
  return await supabase.from('integrations').delete().eq('id', integrationId)
}

// INTEGRATION CONFIG
export async function getIntegrationConfig(integrationId: string) {
  const supabase = createClient()
  return await supabase.from('integration_config').select('*').eq('integration_id', integrationId).single()
}

export async function createIntegrationConfig(integrationId: string, config: Partial<IntegrationConfig>) {
  const supabase = createClient()
  return await supabase.from('integration_config').insert({ integration_id: integrationId, ...config }).select().single()
}

export async function updateIntegrationConfig(integrationId: string, updates: Partial<IntegrationConfig>) {
  const supabase = createClient()
  return await supabase.from('integration_config').update(updates).eq('integration_id', integrationId).select().single()
}

// TEST RESULTS
export async function getTestResults(integrationId: string) {
  const supabase = createClient()
  return await supabase.from('test_results').select('*').eq('integration_id', integrationId).order('tested_at', { ascending: false })
}

export async function createTestResult(integrationId: string, result: Partial<TestResult>) {
  const supabase = createClient()
  return await supabase.from('test_results').insert({ integration_id: integrationId, ...result }).select().single()
}

// EMAIL CONFIG
export async function getEmailConfig(userId: string) {
  const supabase = createClient()
  return await supabase.from('email_configs').select('*').eq('user_id', userId).single()
}

export async function createEmailConfig(userId: string, config: Partial<EmailConfig>) {
  const supabase = createClient()
  return await supabase.from('email_configs').insert({ user_id: userId, ...config }).select().single()
}

export async function updateEmailConfig(userId: string, updates: Partial<EmailConfig>) {
  const supabase = createClient()
  return await supabase.from('email_configs').update(updates).eq('user_id', userId).select().single()
}

// AI CONFIG
export async function getAIConfig(userId: string) {
  const supabase = createClient()
  return await supabase.from('ai_configs').select('*').eq('user_id', userId).single()
}

export async function createAIConfig(userId: string, config: Partial<AIConfig>) {
  const supabase = createClient()
  return await supabase.from('ai_configs').insert({ user_id: userId, ...config }).select().single()
}

export async function updateAIConfig(userId: string, updates: Partial<AIConfig>) {
  const supabase = createClient()
  return await supabase.from('ai_configs').update(updates).eq('user_id', userId).select().single()
}

// CALENDAR CONFIG
export async function getCalendarConfig(userId: string) {
  const supabase = createClient()
  return await supabase.from('calendar_configs').select('*').eq('user_id', userId).single()
}

export async function createCalendarConfig(userId: string, config: Partial<CalendarConfig>) {
  const supabase = createClient()
  return await supabase.from('calendar_configs').insert({ user_id: userId, ...config }).select().single()
}

export async function updateCalendarConfig(userId: string, updates: Partial<CalendarConfig>) {
  const supabase = createClient()
  return await supabase.from('calendar_configs').update(updates).eq('user_id', userId).select().single()
}

// PAYMENT CONFIG
export async function getPaymentConfig(userId: string) {
  const supabase = createClient()
  return await supabase.from('payment_configs').select('*').eq('user_id', userId).single()
}

export async function createPaymentConfig(userId: string, config: Partial<PaymentConfig>) {
  const supabase = createClient()
  return await supabase.from('payment_configs').insert({ user_id: userId, ...config }).select().single()
}

export async function updatePaymentConfig(userId: string, updates: Partial<PaymentConfig>) {
  const supabase = createClient()
  return await supabase.from('payment_configs').update(updates).eq('user_id', userId).select().single()
}

// SMS CONFIG
export async function getSMSConfig(userId: string) {
  const supabase = createClient()
  return await supabase.from('sms_configs').select('*').eq('user_id', userId).single()
}

export async function createSMSConfig(userId: string, config: Partial<SMSConfig>) {
  const supabase = createClient()
  return await supabase.from('sms_configs').insert({ user_id: userId, ...config }).select().single()
}

export async function updateSMSConfig(userId: string, updates: Partial<SMSConfig>) {
  const supabase = createClient()
  return await supabase.from('sms_configs').update(updates).eq('user_id', userId).select().single()
}

// CRM CONFIG
export async function getCRMConfig(userId: string) {
  const supabase = createClient()
  return await supabase.from('crm_configs').select('*').eq('user_id', userId).single()
}

export async function createCRMConfig(userId: string, config: Partial<CRMConfig>) {
  const supabase = createClient()
  return await supabase.from('crm_configs').insert({ user_id: userId, ...config }).select().single()
}

export async function updateCRMConfig(userId: string, updates: Partial<CRMConfig>) {
  const supabase = createClient()
  return await supabase.from('crm_configs').update(updates).eq('user_id', userId).select().single()
}

// PROVIDER TEMPLATES
export async function getProviderTemplates(type?: IntegrationType) {
  const supabase = createClient()
  let query = supabase.from('provider_templates').select('*').order('recommended', { ascending: false })
  if (type) query = query.eq('type', type)
  return await query
}

export async function getRecommendedProviders(type: IntegrationType) {
  const supabase = createClient()
  return await supabase.from('provider_templates').select('*').eq('type', type).eq('recommended', true).order('estimated_time')
}

// STATS
export async function getSetupStats(userId: string) {
  const supabase = createClient()
  const [progressResult, integrationsResult, testsResult] = await Promise.all([
    supabase.from('setup_progress').select('percentage, is_complete, configured_integrations, required_integrations').eq('user_id', userId).single(),
    supabase.from('integrations').select('id, type, status, required').eq('user_id', userId),
    supabase.from('test_results').select('success', { count: 'exact', head: true }).eq('success', true)
  ])

  const connectedIntegrations = integrationsResult.data?.filter(i => i.status === 'connected').length || 0
  const requiredIntegrations = integrationsResult.data?.filter(i => i.required).length || 0
  const requiredConnected = integrationsResult.data?.filter(i => i.required && i.status === 'connected').length || 0

  return {
    data: {
      percentage: progressResult.data?.percentage || 0,
      is_complete: progressResult.data?.is_complete || false,
      total_integrations: integrationsResult.count || 0,
      connected_integrations: connectedIntegrations,
      required_integrations: requiredIntegrations,
      required_connected: requiredConnected,
      successful_tests: testsResult.count || 0
    },
    error: progressResult.error || integrationsResult.error || testsResult.error
  }
}
