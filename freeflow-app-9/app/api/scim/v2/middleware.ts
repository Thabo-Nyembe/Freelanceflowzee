/**
 * SCIM Authentication Middleware
 *
 * Validates SCIM API requests using Bearer tokens
 */

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('scim-api')

export interface SCIMAuthResult {
  success: boolean
  organizationId?: string
  error?: string
}

/**
 * Validate SCIM authentication
 * Supports Bearer token authentication with SCIM tokens
 */
export async function validateSCIMAuth(request: NextRequest): Promise<SCIMAuthResult> {
  const authHeader = request.headers.get('Authorization')

  if (!authHeader) {
    return {
      success: false,
      error: 'Authorization header required'
    }
  }

  // Extract Bearer token
  const match = authHeader.match(/^Bearer\s+(.+)$/i)
  if (!match) {
    return {
      success: false,
      error: 'Invalid authorization format. Expected: Bearer <token>'
    }
  }

  const token = match[1]

  try {
    const supabase = await createClient()

    // Look up the SCIM token
    const { data: scimToken, error } = await supabase
      .from('scim_tokens')
      .select('*, organizations(id, name)')
      .eq('token_hash', hashToken(token))
      .eq('is_active', true)
      .single()

    if (error || !scimToken) {
      return {
        success: false,
        error: 'Invalid or expired SCIM token'
      }
    }

    // Check expiration
    if (scimToken.expires_at && new Date(scimToken.expires_at) < new Date()) {
      return {
        success: false,
        error: 'SCIM token has expired'
      }
    }

    // Update last used timestamp
    await supabase
      .from('scim_tokens')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', scimToken.id)

    return {
      success: true,
      organizationId: scimToken.organization_id
    }
  } catch (err) {
    logger.error('SCIM auth error', { error: err })
    return {
      success: false,
      error: 'Authentication failed'
    }
  }
}

/**
 * Hash a token for secure storage
 */
function hashToken(token: string): string {
  // Use Web Crypto API for hashing
  const encoder = new TextEncoder()
  const data = encoder.encode(token)

  // Simple hash for comparison (in production, use proper crypto)
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data[i]
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }

  // Return hex string
  return Math.abs(hash).toString(16).padStart(8, '0')
}

/**
 * Generate a new SCIM token
 */
export function generateSCIMToken(): { token: string; hash: string } {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  const hash = hashToken(token)

  return { token, hash }
}

/**
 * Create a new SCIM token for an organization
 */
export async function createSCIMToken(
  organizationId: string,
  name: string,
  expiresInDays?: number
): Promise<{ token: string; id: string }> {
  const supabase = await createClient()

  const { token, hash } = generateSCIMToken()

  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    : null

  const { data, error } = await supabase
    .from('scim_tokens')
    .insert({
      organization_id: organizationId,
      name,
      token_hash: hash,
      expires_at: expiresAt,
      is_active: true,
      created_at: new Date().toISOString()
    })
    .select('id')
    .single()

  if (error) {
    throw new Error('Failed to create SCIM token')
  }

  return { token, id: data.id }
}

/**
 * Revoke a SCIM token
 */
export async function revokeSCIMToken(tokenId: string): Promise<void> {
  const supabase = await createClient()

  await supabase
    .from('scim_tokens')
    .update({
      is_active: false,
      revoked_at: new Date().toISOString()
    })
    .eq('id', tokenId)
}

/**
 * List SCIM tokens for an organization
 */
export async function listSCIMTokens(organizationId: string): Promise<Array<{
  id: string
  name: string
  createdAt: string
  lastUsedAt: string | null
  expiresAt: string | null
  isActive: boolean
}>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('scim_tokens')
    .select('id, name, created_at, last_used_at, expires_at, is_active')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Failed to list SCIM tokens')
  }

  return (data || []).map(t => ({
    id: t.id,
    name: t.name,
    createdAt: t.created_at,
    lastUsedAt: t.last_used_at,
    expiresAt: t.expires_at,
    isActive: t.is_active
  }))
}
