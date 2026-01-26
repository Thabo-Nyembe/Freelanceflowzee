/**
 * AI Settings Query Library
 *
 * CRUD operations for AI Settings system:
 * - AI Providers (7 functions)
 * - AI Models (4 functions)
 * - AI Features (5 functions)
 * - Usage Records (3 functions)
 * - API Keys (4 functions)
 * - Usage Stats (3 functions)
 *
 * Total: 26 functions
 */

import { createClient } from '@/lib/supabase/client'
import { DatabaseError, type JsonValue } from '@/lib/types/database'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type AIProviderType = 'openai' | 'anthropic' | 'google' | 'replicate' | 'huggingface' | 'cohere' | 'mistral'
export type ProviderStatus = 'connected' | 'disconnected' | 'testing' | 'error'
export type ModelCapability = 'text' | 'image' | 'audio' | 'video' | 'code' | 'embeddings' | 'vision' | 'multimodal'
export type UsageStatus = 'success' | 'error' | 'timeout'

export interface AIProvider {
  id: string
  user_id: string
  type: AIProviderType
  name: string
  description: string | null
  color: string
  status: ProviderStatus
  api_key: string | null
  api_key_last_four: string | null
  api_endpoint: string | null
  features: string[]
  pricing: string | null
  is_enabled: boolean
  connected_at: string | null
  last_used: string | null
  total_requests: number
  total_tokens: number
  total_cost: number
  monthly_budget: number | null
  rate_limits: Record<string, JsonValue> | null
  settings: Record<string, JsonValue> | null
  metadata: Record<string, JsonValue> | null
  created_at: string
  updated_at: string
}

export interface AIModel {
  id: string
  provider_id: string
  name: string
  display_name: string
  capabilities: ModelCapability[]
  context_window: number
  max_tokens: number
  input_cost_per_1k: number
  output_cost_per_1k: number
  is_default: boolean
  is_deprecated: boolean
  version: string | null
  settings: Record<string, JsonValue> | null
  metadata: Record<string, JsonValue> | null
  created_at: string
  updated_at: string
}

export interface AIFeature {
  id: string
  user_id: string
  name: string
  description: string | null
  provider_id: string
  model_id: string
  is_enabled: boolean
  requires_key: boolean
  usage_count: number
  last_used: string | null
  config: Record<string, JsonValue> | null
  settings: Record<string, JsonValue> | null
  metadata: Record<string, JsonValue> | null
  created_at: string
  updated_at: string
}

export interface UsageRecord {
  id: string
  user_id: string
  provider_id: string
  model_id: string
  feature_id: string | null
  request_type: string
  input_tokens: number
  output_tokens: number
  total_tokens: number
  cost: number
  latency: number
  status: UsageStatus
  error_message: string | null
  request_data: Record<string, JsonValue> | null
  response_data: Record<string, JsonValue> | null
  timestamp: string
  metadata: Record<string, JsonValue> | null
}

export interface APIKey {
  id: string
  user_id: string
  provider_id: string
  key_name: string
  key_value: string
  key_last_four: string
  is_active: boolean
  expires_at: string | null
  last_used: string | null
  usage_count: number
  settings: Record<string, JsonValue> | null
  metadata: Record<string, JsonValue> | null
  created_at: string
  updated_at: string
}

export interface UsageStats {
  id: string
  user_id: string
  date: string
  total_requests: number
  total_tokens: number
  total_cost: number
  average_latency: number
  success_rate: number
  provider_breakdown: Record<string, JsonValue> | null
  model_breakdown: Record<string, JsonValue> | null
  feature_breakdown: Record<string, JsonValue> | null
  settings: Record<string, JsonValue> | null
  metadata: Record<string, JsonValue> | null
  created_at: string
  updated_at: string
}

// ============================================================================
// AI PROVIDERS (7 functions)
// ============================================================================

export async function getProviders(
  userId: string
): Promise<{ data: AIProvider[] | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_providers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return { data, error }
}

export async function getProvider(
  providerId: string
): Promise<{ data: AIProvider | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_providers')
    .select('*')
    .eq('id', providerId)
    .single()

  return { data, error }
}

export async function createProvider(
  userId: string,
  provider: {
    type: AIProviderType
    name: string
    description?: string
    color: string
    api_key?: string
    api_key_last_four?: string
    pricing?: string
    features?: string[]
  }
): Promise<{ data: AIProvider | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_providers')
    .insert({
      user_id: userId,
      ...provider
    })
    .select()
    .single()

  return { data, error }
}

export async function updateProvider(
  providerId: string,
  updates: Partial<Omit<AIProvider, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: AIProvider | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_providers')
    .update(updates)
    .eq('id', providerId)
    .select()
    .single()

  return { data, error }
}

export async function updateProviderStatus(
  providerId: string,
  status: ProviderStatus
): Promise<{ data: AIProvider | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const updates: { status: ProviderStatus; connected_at?: string } = { status }
  if (status === 'connected') {
    updates.connected_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('ai_providers')
    .update(updates)
    .eq('id', providerId)
    .select()
    .single()

  return { data, error }
}

export async function deleteProvider(
  providerId: string
): Promise<{ error: DatabaseError | null }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('ai_providers')
    .delete()
    .eq('id', providerId)

  return { error }
}

interface ProviderStats {
  total_providers: number
  connected_providers: number
  enabled_providers: number
  total_requests: number
  total_tokens: number
  total_cost: number
  by_provider: Record<string, { requests: number; tokens: number; cost: number }>
}

export async function getProviderStats(
  userId: string
): Promise<{ data: ProviderStats | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_providers')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    return { data: null, error }
  }

  const stats = {
    total_providers: data.length,
    connected_providers: data.filter(p => p.status === 'connected').length,
    enabled_providers: data.filter(p => p.is_enabled).length,
    total_requests: data.reduce((sum, p) => sum + p.total_requests, 0),
    total_tokens: data.reduce((sum, p) => sum + p.total_tokens, 0),
    total_cost: data.reduce((sum, p) => sum + p.total_cost, 0),
    by_provider: data.reduce((acc, p) => {
      acc[p.type] = {
        requests: p.total_requests,
        tokens: p.total_tokens,
        cost: p.total_cost
      }
      return acc
    }, {} as Record<string, { requests: number; tokens: number; cost: number }>)
  }

  return { data: stats, error: null }
}

// ============================================================================
// AI MODELS (4 functions)
// ============================================================================

export async function getModels(
  providerId: string
): Promise<{ data: AIModel[] | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_models')
    .select('*')
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false })

  return { data, error }
}

export async function getModel(
  modelId: string
): Promise<{ data: AIModel | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_models')
    .select('*')
    .eq('id', modelId)
    .single()

  return { data, error }
}

export async function createModel(
  model: {
    provider_id: string
    name: string
    display_name: string
    capabilities: ModelCapability[]
    context_window?: number
    max_tokens?: number
    input_cost_per_1k: number
    output_cost_per_1k: number
    version?: string
  }
): Promise<{ data: AIModel | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_models')
    .insert(model)
    .select()
    .single()

  return { data, error }
}

export async function updateModel(
  modelId: string,
  updates: Partial<Omit<AIModel, 'id' | 'provider_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: AIModel | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_models')
    .update(updates)
    .eq('id', modelId)
    .select()
    .single()

  return { data, error }
}

// ============================================================================
// AI FEATURES (5 functions)
// ============================================================================

export async function getFeatures(
  userId: string
): Promise<{ data: AIFeature[] | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_features')
    .select('*')
    .eq('user_id', userId)
    .order('usage_count', { ascending: false })

  return { data, error }
}

export async function createFeature(
  userId: string,
  feature: {
    name: string
    description?: string
    provider_id: string
    model_id: string
    requires_key?: boolean
  }
): Promise<{ data: AIFeature | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_features')
    .insert({
      user_id: userId,
      ...feature
    })
    .select()
    .single()

  return { data, error }
}

export async function toggleFeature(
  featureId: string,
  isEnabled: boolean
): Promise<{ data: AIFeature | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_features')
    .update({ is_enabled: isEnabled })
    .eq('id', featureId)
    .select()
    .single()

  return { data, error }
}

export async function updateFeature(
  featureId: string,
  updates: Partial<Omit<AIFeature, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: AIFeature | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_features')
    .update(updates)
    .eq('id', featureId)
    .select()
    .single()

  return { data, error }
}

export async function deleteFeature(
  featureId: string
): Promise<{ error: DatabaseError | null }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('ai_features')
    .delete()
    .eq('id', featureId)

  return { error }
}

// ============================================================================
// USAGE RECORDS (3 functions)
// ============================================================================

export async function getUsageRecords(
  userId: string,
  filters?: {
    provider_id?: string
    model_id?: string
    status?: UsageStatus
    date_from?: string
    date_to?: string
  }
): Promise<{ data: UsageRecord[] | null; error: DatabaseError | null }> {
  const supabase = createClient()
  let query = supabase
    .from('ai_usage_records')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })

  if (filters?.provider_id) {
    query = query.eq('provider_id', filters.provider_id)
  }
  if (filters?.model_id) {
    query = query.eq('model_id', filters.model_id)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.date_from) {
    query = query.gte('timestamp', filters.date_from)
  }
  if (filters?.date_to) {
    query = query.lte('timestamp', filters.date_to)
  }

  const { data, error } = await query
  return { data, error }
}

export async function createUsageRecord(
  userId: string,
  record: {
    provider_id: string
    model_id: string
    feature_id?: string
    request_type: string
    input_tokens: number
    output_tokens: number
    total_tokens: number
    cost: number
    latency: number
    status?: UsageStatus
    error_message?: string
  }
): Promise<{ data: UsageRecord | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_usage_records')
    .insert({
      user_id: userId,
      ...record
    })
    .select()
    .single()

  return { data, error }
}

interface UsageSummary {
  total_requests: number
  total_tokens: number
  total_cost: number
  average_latency: number
  success_rate: number
  by_provider: Record<string, { requests: number; tokens: number; cost: number }>
}

export async function getUsageSummary(
  userId: string,
  dateFrom?: string,
  dateTo?: string
): Promise<{ data: UsageSummary | null; error: DatabaseError | null }> {
  const supabase = createClient()
  let query = supabase
    .from('ai_usage_records')
    .select('*')
    .eq('user_id', userId)

  if (dateFrom) {
    query = query.gte('timestamp', dateFrom)
  }
  if (dateTo) {
    query = query.lte('timestamp', dateTo)
  }

  const { data, error } = await query

  if (error) {
    return { data: null, error }
  }

  const summary = {
    total_requests: data.length,
    total_tokens: data.reduce((sum, r) => sum + r.total_tokens, 0),
    total_cost: data.reduce((sum, r) => sum + r.cost, 0),
    average_latency: data.length > 0 ? data.reduce((sum, r) => sum + r.latency, 0) / data.length : 0,
    success_rate: data.length > 0 ? (data.filter(r => r.status === 'success').length / data.length) * 100 : 0,
    by_provider: data.reduce((acc, r) => {
      if (!acc[r.provider_id]) {
        acc[r.provider_id] = { requests: 0, tokens: 0, cost: 0 }
      }
      acc[r.provider_id].requests++
      acc[r.provider_id].tokens += r.total_tokens
      acc[r.provider_id].cost += r.cost
      return acc
    }, {} as Record<string, { requests: number; tokens: number; cost: number }>)
  }

  return { data: summary, error: null }
}

// ============================================================================
// API KEYS (4 functions)
// ============================================================================

export async function getAPIKeys(
  userId: string
): Promise<{ data: APIKey[] | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_api_keys')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return { data, error }
}

export async function createAPIKey(
  userId: string,
  apiKey: {
    provider_id: string
    key_name: string
    key_value: string
    key_last_four: string
    expires_at?: string
  }
): Promise<{ data: APIKey | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_api_keys')
    .insert({
      user_id: userId,
      ...apiKey
    })
    .select()
    .single()

  return { data, error }
}

export async function updateAPIKey(
  keyId: string,
  updates: Partial<Omit<APIKey, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: APIKey | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_api_keys')
    .update(updates)
    .eq('id', keyId)
    .select()
    .single()

  return { data, error }
}

export async function deleteAPIKey(
  keyId: string
): Promise<{ error: DatabaseError | null }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('ai_api_keys')
    .delete()
    .eq('id', keyId)

  return { error }
}

// ============================================================================
// USAGE STATS (3 functions)
// ============================================================================

export async function getUsageStats(
  userId: string,
  dateFrom?: string,
  dateTo?: string
): Promise<{ data: UsageStats[] | null; error: DatabaseError | null }> {
  const supabase = createClient()
  let query = supabase
    .from('ai_usage_stats')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (dateFrom) {
    query = query.gte('date', dateFrom)
  }
  if (dateTo) {
    query = query.lte('date', dateTo)
  }

  const { data, error } = await query
  return { data, error }
}

export async function getTodayUsageStats(
  userId: string
): Promise<{ data: UsageStats | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('ai_usage_stats')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single()

  return { data, error }
}

export async function updateUsageStats(
  userId: string,
  date: string,
  stats: {
    total_requests: number
    total_tokens: number
    total_cost: number
    average_latency: number
    success_rate: number
    provider_breakdown?: Record<string, JsonValue>
    model_breakdown?: Record<string, JsonValue>
  }
): Promise<{ data: UsageStats | null; error: DatabaseError | null }> {
  const supabase = createClient()

  // Try to get existing stats for date
  const { data: existing } = await supabase
    .from('ai_usage_stats')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .single()

  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from('ai_usage_stats')
      .update(stats)
      .eq('id', existing.id)
      .select()
      .single()

    return { data, error }
  } else {
    // Create new
    const { data, error } = await supabase
      .from('ai_usage_stats')
      .insert({
        user_id: userId,
        date,
        ...stats
      })
      .select()
      .single()

    return { data, error }
  }
}

// ============================================================================
// AI USER PREFERENCES
// ============================================================================

export interface AIUserPreferences {
  id: string
  user_id: string
  monthly_budget: number
  rate_limit_per_minute: number
  rate_limit_per_hour: number
  default_providers: Record<string, string>
  logging_enabled: boolean
  created_at: string
  updated_at: string
}

/**
 * Get AI user preferences
 */
export async function getAIPreferences(
  userId: string
): Promise<{ data: AIUserPreferences | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  return { data, error }
}

/**
 * Create or update AI user preferences (upsert)
 */
export async function upsertAIPreferences(
  userId: string,
  preferences: Partial<Omit<AIUserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: AIUserPreferences | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_user_preferences')
    .upsert({
      user_id: userId,
      ...preferences,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    .select()
    .single()

  return { data, error }
}

/**
 * Update monthly budget
 */
export async function updateAIBudget(
  userId: string,
  monthlyBudget: number
): Promise<{ data: AIUserPreferences | null; error: DatabaseError | null }> {
  return upsertAIPreferences(userId, { monthly_budget: monthlyBudget })
}

/**
 * Update rate limits
 */
export async function updateAIRateLimits(
  userId: string,
  perMinute: number,
  perHour: number
): Promise<{ data: AIUserPreferences | null; error: DatabaseError | null }> {
  return upsertAIPreferences(userId, {
    rate_limit_per_minute: perMinute,
    rate_limit_per_hour: perHour
  })
}

/**
 * Update default providers
 */
export async function updateDefaultProviders(
  userId: string,
  defaultProviders: Record<string, string>
): Promise<{ data: AIUserPreferences | null; error: DatabaseError | null }> {
  return upsertAIPreferences(userId, { default_providers: defaultProviders })
}

/**
 * Toggle logging
 */
export async function toggleAILogging(
  userId: string,
  enabled: boolean
): Promise<{ data: AIUserPreferences | null; error: DatabaseError | null }> {
  return upsertAIPreferences(userId, { logging_enabled: enabled })
}
