'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'
import { uuidSchema } from '@/lib/validations'

// ============================================
// TYPES
// ============================================

interface ApiKey {
  id: string
  user_id: string
  name: string
  description?: string | null
  key_hash: string
  key_prefix: string
  key_type: string
  permission: string
  scopes: string[]
  environment: string
  ip_whitelist: string[]
  allowed_origins?: string[]
  rate_limit_per_hour: number
  rate_limit_per_day: number
  expires_at?: string | null
  tags: string[]
  created_by: string
  status: string
  total_requests: number
  requests_today: number
  requests_this_month: number
  last_used_at?: string | null
  last_ip_address?: string | null
  revoked_at?: string | null
  revoked_by?: string | null
  revoke_reason?: string | null
  deleted_at?: string | null
  created_at: string
  updated_at: string
}

interface ApiKeyWithValue extends ApiKey {
  key_value: string
}

interface CreateApiKeyInput {
  name: string
  description?: string
  key_type?: string
  permission?: string
  scopes?: string[]
  environment?: string
  ip_whitelist?: string[]
  rate_limit_per_hour?: number
  rate_limit_per_day?: number
  expires_at?: string
  tags?: string[]
}

interface UpdateApiKeyInput {
  name?: string
  description?: string
  permission?: string
  scopes?: string[]
  ip_whitelist?: string[]
  allowed_origins?: string[]
  rate_limit_per_hour?: number
  rate_limit_per_day?: number
  tags?: string[]
}

interface GetApiKeysOptions {
  status?: string
  keyType?: string
  environment?: string
}

interface ApiKeyStats {
  total: number
  active: number
  inactive: number
  expired: number
  revoked: number
  byType: Record<string, number>
  byEnvironment: Record<string, number>
  totalRequests: number
  requestsToday: number
  requestsThisMonth: number
  expiringSoon: number
}

// ============================================
// LOGGER
// ============================================

const logger = createFeatureLogger('api-keys')

// ============================================
// API KEY ACTIONS
// ============================================

/**
 * Get API keys with optional filters
 */
export async function getApiKeys(
  options?: GetApiKeysOptions
): Promise<ActionResult<ApiKey[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Get API keys failed: User not authenticated')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    let query = supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (options?.status) {
      query = query.eq('status', options.status)
    }
    if (options?.keyType) {
      query = query.eq('key_type', options.keyType)
    }
    if (options?.environment) {
      query = query.eq('environment', options.environment)
    }

    const { data, error } = await query.limit(100)

    if (error) {
      logger.error('Failed to get API keys', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('API keys retrieved successfully', {
      userId: user.id,
      count: data.length
    })

    return actionSuccess(data as ApiKey[])
  } catch (error) {
    logger.error('Unexpected error getting API keys', { error })
    return actionError('Failed to get API keys', 'INTERNAL_ERROR')
  }
}

/**
 * Create a new API key
 */
export async function createApiKey(
  keyData: CreateApiKeyInput
): Promise<ActionResult<ApiKeyWithValue>> {
  try {
    if (!keyData.name || keyData.name.trim().length === 0) {
      return actionError('API key name is required', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Create API key failed: User not authenticated')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Generate a secure API key
    const environment = keyData.environment || 'production'
    const envPrefix = environment === 'production' ? 'live' : environment === 'staging' ? 'test' : 'dev'
    const keyValue = `sk_${envPrefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 32)}`
    const keyPrefix = keyValue.slice(0, 12) + '...' + keyValue.slice(-4)

    // In production, use proper cryptographic hashing (bcrypt, argon2)
    const keyHash = Buffer.from(keyValue).toString('base64')

    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: user.id,
        name: keyData.name,
        description: keyData.description,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        key_type: keyData.key_type || 'api',
        permission: keyData.permission || 'read',
        scopes: keyData.scopes || [],
        environment: environment,
        ip_whitelist: keyData.ip_whitelist || [],
        rate_limit_per_hour: keyData.rate_limit_per_hour || 1000,
        rate_limit_per_day: keyData.rate_limit_per_day || 10000,
        expires_at: keyData.expires_at,
        tags: keyData.tags || [],
        created_by: user.email,
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create API key', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('API key created successfully', {
      keyId: data.id,
      userId: user.id,
      environment
    })

    revalidatePath('/dashboard/api-keys-v2')
    // Return the full key only on creation - this is the only time it's visible
    return actionSuccess({ ...data, key_value: keyValue } as ApiKeyWithValue)
  } catch (error) {
    logger.error('Unexpected error creating API key', { error })
    return actionError('Failed to create API key', 'INTERNAL_ERROR')
  }
}

/**
 * Update an API key
 */
export async function updateApiKey(
  keyId: string,
  updates: UpdateApiKeyInput
): Promise<ActionResult<ApiKey>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(keyId)
    if (!idValidation.success) {
      return actionError('Invalid API key ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Update API key failed: User not authenticated', { keyId })
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('api_keys')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', keyId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update API key', { error, keyId, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('API key updated successfully', { keyId, userId: user.id })

    revalidatePath('/dashboard/api-keys-v2')
    return actionSuccess(data as ApiKey)
  } catch (error) {
    logger.error('Unexpected error updating API key', { error, keyId })
    return actionError('Failed to update API key', 'INTERNAL_ERROR')
  }
}

/**
 * Revoke an API key
 */
export async function revokeApiKey(
  keyId: string,
  reason?: string
): Promise<ActionResult<ApiKey>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(keyId)
    if (!idValidation.success) {
      return actionError('Invalid API key ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Revoke API key failed: User not authenticated', { keyId })
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('api_keys')
      .update({
        status: 'revoked',
        revoked_at: new Date().toISOString(),
        revoked_by: user.email,
        revoke_reason: reason || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', keyId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to revoke API key', { error, keyId, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('API key revoked successfully', { keyId, userId: user.id, reason })

    revalidatePath('/dashboard/api-keys-v2')
    return actionSuccess(data as ApiKey)
  } catch (error) {
    logger.error('Unexpected error revoking API key', { error, keyId })
    return actionError('Failed to revoke API key', 'INTERNAL_ERROR')
  }
}

/**
 * Activate an API key
 */
export async function activateApiKey(keyId: string): Promise<ActionResult<ApiKey>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(keyId)
    if (!idValidation.success) {
      return actionError('Invalid API key ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Activate API key failed: User not authenticated', { keyId })
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('api_keys')
      .update({
        status: 'active',
        revoked_at: null,
        revoked_by: null,
        revoke_reason: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', keyId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to activate API key', { error, keyId, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('API key activated successfully', { keyId, userId: user.id })

    revalidatePath('/dashboard/api-keys-v2')
    return actionSuccess(data as ApiKey)
  } catch (error) {
    logger.error('Unexpected error activating API key', { error, keyId })
    return actionError('Failed to activate API key', 'INTERNAL_ERROR')
  }
}

/**
 * Deactivate an API key
 */
export async function deactivateApiKey(keyId: string): Promise<ActionResult<ApiKey>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(keyId)
    if (!idValidation.success) {
      return actionError('Invalid API key ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Deactivate API key failed: User not authenticated', { keyId })
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('api_keys')
      .update({
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', keyId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to deactivate API key', { error, keyId, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('API key deactivated successfully', { keyId, userId: user.id })

    revalidatePath('/dashboard/api-keys-v2')
    return actionSuccess(data as ApiKey)
  } catch (error) {
    logger.error('Unexpected error deactivating API key', { error, keyId })
    return actionError('Failed to deactivate API key', 'INTERNAL_ERROR')
  }
}

/**
 * Regenerate an API key
 */
export async function regenerateApiKey(
  keyId: string
): Promise<ActionResult<ApiKeyWithValue>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(keyId)
    if (!idValidation.success) {
      return actionError('Invalid API key ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Regenerate API key failed: User not authenticated', { keyId })
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Get the existing key info
    const { data: existingKey } = await supabase
      .from('api_keys')
      .select('environment')
      .eq('id', keyId)
      .eq('user_id', user.id)
      .single()

    if (!existingKey) {
      logger.warn('Regenerate API key failed: Key not found', { keyId, userId: user.id })
      return actionError('API key not found', 'NOT_FOUND')
    }

    // Generate a new key
    const environment = existingKey.environment || 'production'
    const envPrefix = environment === 'production' ? 'live' : environment === 'staging' ? 'test' : 'dev'
    const keyValue = `sk_${envPrefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 32)}`
    const keyPrefix = keyValue.slice(0, 12) + '...' + keyValue.slice(-4)
    const keyHash = Buffer.from(keyValue).toString('base64')

    const { data, error } = await supabase
      .from('api_keys')
      .update({
        key_hash: keyHash,
        key_prefix: keyPrefix,
        updated_at: new Date().toISOString()
      })
      .eq('id', keyId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to regenerate API key', { error, keyId, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('API key regenerated successfully', { keyId, userId: user.id })

    revalidatePath('/dashboard/api-keys-v2')
    return actionSuccess({ ...data, key_value: keyValue } as ApiKeyWithValue)
  } catch (error) {
    logger.error('Unexpected error regenerating API key', { error, keyId })
    return actionError('Failed to regenerate API key', 'INTERNAL_ERROR')
  }
}

/**
 * Delete an API key (soft delete)
 */
export async function deleteApiKey(
  keyId: string
): Promise<ActionResult<{ success: true }>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(keyId)
    if (!idValidation.success) {
      return actionError('Invalid API key ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Delete API key failed: User not authenticated', { keyId })
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('api_keys')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', keyId)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete API key', { error, keyId, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('API key deleted successfully', { keyId, userId: user.id })

    revalidatePath('/dashboard/api-keys-v2')
    return actionSuccess({ success: true })
  } catch (error) {
    logger.error('Unexpected error deleting API key', { error, keyId })
    return actionError('Failed to delete API key', 'INTERNAL_ERROR')
  }
}

/**
 * Get API key statistics
 */
export async function getApiKeyStats(): Promise<ActionResult<ApiKeyStats>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Get API key stats failed: User not authenticated')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: keys } = await supabase
      .from('api_keys')
      .select('status, key_type, environment, total_requests, requests_today, requests_this_month, expires_at')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (!keys) {
      logger.warn('Get API key stats failed: No keys found', { userId: user.id })
      return actionSuccess({
        total: 0,
        active: 0,
        inactive: 0,
        expired: 0,
        revoked: 0,
        byType: {},
        byEnvironment: {},
        totalRequests: 0,
        requestsToday: 0,
        requestsThisMonth: 0,
        expiringSoon: 0
      })
    }

    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const stats: ApiKeyStats = {
      total: keys.length,
      active: keys.filter(k => k.status === 'active').length,
      inactive: keys.filter(k => k.status === 'inactive').length,
      expired: keys.filter(k => k.status === 'expired').length,
      revoked: keys.filter(k => k.status === 'revoked').length,
      byType: keys.reduce((acc, k) => {
        acc[k.key_type] = (acc[k.key_type] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      byEnvironment: keys.reduce((acc, k) => {
        acc[k.environment] = (acc[k.environment] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      totalRequests: keys.reduce((sum, k) => sum + k.total_requests, 0),
      requestsToday: keys.reduce((sum, k) => sum + k.requests_today, 0),
      requestsThisMonth: keys.reduce((sum, k) => sum + k.requests_this_month, 0),
      expiringSoon: keys.filter(k => {
        if (!k.expires_at) return false
        const expiryDate = new Date(k.expires_at)
        return expiryDate > now && expiryDate < thirtyDaysFromNow
      }).length
    }

    logger.info('API key stats retrieved successfully', { userId: user.id, total: stats.total })

    return actionSuccess(stats)
  } catch (error) {
    logger.error('Unexpected error getting API key stats', { error })
    return actionError('Failed to get API key stats', 'INTERNAL_ERROR')
  }
}

/**
 * Record API key usage
 */
export async function recordApiKeyUsage(
  keyId: string,
  ipAddress?: string
): Promise<ActionResult<{ success: true }>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(keyId)
    if (!idValidation.success) {
      return actionError('Invalid API key ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()

    const { data: key } = await supabase
      .from('api_keys')
      .select('total_requests, requests_today, requests_this_month')
      .eq('id', keyId)
      .single()

    if (!key) {
      logger.warn('Record API key usage failed: Key not found', { keyId })
      return actionError('API key not found', 'NOT_FOUND')
    }

    await supabase
      .from('api_keys')
      .update({
        total_requests: key.total_requests + 1,
        requests_today: key.requests_today + 1,
        requests_this_month: key.requests_this_month + 1,
        last_used_at: new Date().toISOString(),
        last_ip_address: ipAddress || null
      })
      .eq('id', keyId)

    logger.info('API key usage recorded', { keyId, ipAddress })

    return actionSuccess({ success: true })
  } catch (error) {
    logger.error('Unexpected error recording API key usage', { error, keyId })
    return actionError('Failed to record API key usage', 'INTERNAL_ERROR')
  }
}
