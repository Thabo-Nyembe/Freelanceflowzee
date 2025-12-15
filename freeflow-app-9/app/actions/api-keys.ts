'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function getApiKeys(options?: {
  status?: string
  keyType?: string
  environment?: string
}) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  return { data }
}

export async function createApiKey(keyData: {
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
}) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/api-keys-v2')
  // Return the full key only on creation - this is the only time it's visible
  return { data: { ...data, key_value: keyValue } }
}

export async function updateApiKey(
  keyId: string,
  updates: {
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
) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/api-keys-v2')
  return { data }
}

export async function revokeApiKey(keyId: string, reason?: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/api-keys-v2')
  return { data }
}

export async function activateApiKey(keyId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/api-keys-v2')
  return { data }
}

export async function deactivateApiKey(keyId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/api-keys-v2')
  return { data }
}

export async function regenerateApiKey(keyId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get the existing key info
  const { data: existingKey } = await supabase
    .from('api_keys')
    .select('environment')
    .eq('id', keyId)
    .eq('user_id', user.id)
    .single()

  if (!existingKey) {
    return { error: 'API key not found' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/api-keys-v2')
  return { data: { ...data, key_value: keyValue } }
}

export async function deleteApiKey(keyId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('api_keys')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', keyId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/api-keys-v2')
  return { success: true }
}

export async function getApiKeyStats() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: keys } = await supabase
    .from('api_keys')
    .select('status, key_type, environment, total_requests, requests_today, requests_this_month, expires_at')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  if (!keys) {
    return { data: null }
  }

  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const stats = {
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

  return { data: stats }
}

export async function recordApiKeyUsage(keyId: string, ipAddress?: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: key } = await supabase
    .from('api_keys')
    .select('total_requests, requests_today, requests_this_month')
    .eq('id', keyId)
    .single()

  if (!key) {
    return { error: 'API key not found' }
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

  return { success: true }
}
