'use server'

/**
 * Server Actions for OAuth Provider Management
 *
 * Supabase 2025 Feature: OAuth 2.0 Provider Capability
 * "Sign in with KAZI"
 */

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('oauth-actions')

// ============================================
// TYPES
// ============================================

export interface CreateOAuthAppInput {
  name: string
  description?: string
  logoUrl?: string
  websiteUrl?: string
  privacyPolicyUrl?: string
  termsOfServiceUrl?: string
  redirectUris: string[]
  allowedScopes?: string[]
  isConfidential?: boolean
}

export interface OAuthAppResult {
  id: string
  clientId: string
  clientSecret?: string
  name: string
}

// ============================================
// OAUTH APPLICATIONS
// ============================================

export async function createOAuthApplication(input: CreateOAuthAppInput): Promise<ActionResult<OAuthAppResult>> {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Creating OAuth application', { name: input.name })

    // Generate secure credentials
    const clientId = `kazi_${crypto.randomBytes(16).toString('hex')}`
    const clientSecret = crypto.randomBytes(32).toString('hex')
    const clientSecretHash = crypto.createHash('sha256').update(clientSecret).digest('hex')

    const { data: result, error } = await supabase
      .from('oauth_applications')
      .insert({
        user_id: user.id,
        client_id: clientId,
        client_secret_hash: clientSecretHash,
        name: input.name,
        description: input.description,
        logo_url: input.logoUrl,
        website_url: input.websiteUrl,
        privacy_policy_url: input.privacyPolicyUrl,
        terms_of_service_url: input.termsOfServiceUrl,
        redirect_uris: input.redirectUris,
        allowed_scopes: input.allowedScopes || ['profile:read'],
        is_confidential: input.isConfidential ?? true,
        is_active: true,
      })
      .select('id, client_id, name')
      .single()

    if (error) throw error

    revalidatePath('/dashboard/settings/oauth')

    return actionSuccess({
      id: result.id,
      clientId: result.client_id,
      clientSecret,
      name: result.name,
    })
  } catch (error) {
    logger.error('createOAuthApplication failed', error)
    return actionError(error instanceof Error ? error.message : 'Failed to create application')
  }
}

export async function updateOAuthApplication(
  appId: string,
  updates: {
    name?: string
    description?: string
    logoUrl?: string
    websiteUrl?: string
    privacyPolicyUrl?: string
    termsOfServiceUrl?: string
    redirectUris?: string[]
    allowedScopes?: string[]
    isActive?: boolean
  }
): Promise<ActionResult> {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.logoUrl !== undefined) updateData.logo_url = updates.logoUrl
    if (updates.websiteUrl !== undefined) updateData.website_url = updates.websiteUrl
    if (updates.privacyPolicyUrl !== undefined) updateData.privacy_policy_url = updates.privacyPolicyUrl
    if (updates.termsOfServiceUrl !== undefined) updateData.terms_of_service_url = updates.termsOfServiceUrl
    if (updates.redirectUris !== undefined) updateData.redirect_uris = updates.redirectUris
    if (updates.allowedScopes !== undefined) updateData.allowed_scopes = updates.allowedScopes
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive

    const { error } = await supabase
      .from('oauth_applications')
      .update(updateData)
      .eq('id', appId)
      .eq('user_id', user.id)

    if (error) throw error

    revalidatePath('/dashboard/settings/oauth')

    return actionSuccess(null)
  } catch (error) {
    logger.error('updateOAuthApplication failed', error)
    return actionError(error instanceof Error ? error.message : 'Failed to update application')
  }
}

export async function deleteOAuthApplication(appId: string): Promise<ActionResult> {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Delete related tokens first
    await supabase
      .from('oauth_access_tokens')
      .delete()
      .eq('application_id', appId)

    await supabase
      .from('oauth_refresh_tokens')
      .delete()
      .eq('application_id', appId)

    await supabase
      .from('oauth_authorization_codes')
      .delete()
      .eq('application_id', appId)

    // Delete the application
    const { error } = await supabase
      .from('oauth_applications')
      .delete()
      .eq('id', appId)
      .eq('user_id', user.id)

    if (error) throw error

    revalidatePath('/dashboard/settings/oauth')

    return actionSuccess(null)
  } catch (error) {
    logger.error('deleteOAuthApplication failed', error)
    return actionError(error instanceof Error ? error.message : 'Failed to delete application')
  }
}

export async function regenerateClientSecret(appId: string): Promise<ActionResult<{ clientSecret: string }>> {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const newSecret = crypto.randomBytes(32).toString('hex')
    const newSecretHash = crypto.createHash('sha256').update(newSecret).digest('hex')

    const { error } = await supabase
      .from('oauth_applications')
      .update({
        client_secret_hash: newSecretHash,
        updated_at: new Date().toISOString(),
      })
      .eq('id', appId)
      .eq('user_id', user.id)

    if (error) throw error

    // Revoke all existing tokens
    await supabase
      .from('oauth_access_tokens')
      .update({ is_revoked: true })
      .eq('application_id', appId)

    return actionSuccess({ clientSecret: newSecret })
  } catch (error) {
    logger.error('regenerateClientSecret failed', error)
    return actionError(error instanceof Error ? error.message : 'Failed to regenerate secret')
  }
}

export async function getOAuthApplications(): Promise<ActionResult> {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('oauth_applications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return actionSuccess(data || [])
  } catch (error) {
    logger.error('getOAuthApplications failed', error)
    return actionError(error instanceof Error ? error.message : 'Failed to get applications')
  }
}

export async function getOAuthApplication(appId: string): Promise<ActionResult> {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('oauth_applications')
      .select('*')
      .eq('id', appId)
      .eq('user_id', user.id)
      .single()

    if (error) throw error

    return actionSuccess(data)
  } catch (error) {
    logger.error('getOAuthApplication failed', error)
    return actionError(error instanceof Error ? error.message : 'Failed to get application')
  }
}

// ============================================
// OAUTH SCOPES
// ============================================

export async function getOAuthScopes(): Promise<ActionResult> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('oauth_scopes')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('scope_name', { ascending: true })

    if (error) throw error

    return actionSuccess(data || [])
  } catch (error) {
    logger.error('getOAuthScopes failed', error)
    return actionError(error instanceof Error ? error.message : 'Failed to get scopes')
  }
}

// ============================================
// USER CONSENTS
// ============================================

export async function grantUserConsent(
  applicationId: string,
  scopes: string[]
): Promise<ActionResult> {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('user_oauth_consents')
      .upsert({
        user_id: user.id,
        application_id: applicationId,
        granted_scopes: scopes,
        granted_at: new Date().toISOString(),
        is_revoked: false,
      }, {
        onConflict: 'user_id,application_id',
      })
      .select()
      .single()

    if (error) throw error

    return actionSuccess(data)
  } catch (error) {
    logger.error('grantUserConsent failed', error)
    return actionError(error instanceof Error ? error.message : 'Failed to grant consent')
  }
}

export async function revokeUserConsent(applicationId: string): Promise<ActionResult> {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Revoke consent
    await supabase
      .from('user_oauth_consents')
      .update({ is_revoked: true })
      .eq('user_id', user.id)
      .eq('application_id', applicationId)

    // Revoke all access tokens
    await supabase
      .from('oauth_access_tokens')
      .update({ is_revoked: true })
      .eq('user_id', user.id)
      .eq('application_id', applicationId)

    // Revoke all refresh tokens
    await supabase
      .from('oauth_refresh_tokens')
      .update({ is_revoked: true })
      .eq('user_id', user.id)
      .eq('application_id', applicationId)

    revalidatePath('/dashboard/settings/connected-apps')

    return actionSuccess(null)
  } catch (error) {
    logger.error('revokeUserConsent failed', error)
    return actionError(error instanceof Error ? error.message : 'Failed to revoke consent')
  }
}

export async function getUserConsents(): Promise<ActionResult> {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('user_oauth_consents')
      .select(`
        *,
        oauth_applications (
          id,
          name,
          logo_url,
          website_url
        )
      `)
      .eq('user_id', user.id)
      .eq('is_revoked', false)
      .order('granted_at', { ascending: false })

    if (error) throw error

    return actionSuccess(data || [])
  } catch (error) {
    logger.error('getUserConsents failed', error)
    return actionError(error instanceof Error ? error.message : 'Failed to get consents')
  }
}

// ============================================
// ACCESS TOKENS (for user management)
// ============================================

export async function getUserAccessTokens(): Promise<ActionResult> {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('oauth_access_tokens')
      .select(`
        id,
        application_id,
        scopes,
        created_at,
        expires_at,
        oauth_applications (
          name,
          logo_url
        )
      `)
      .eq('user_id', user.id)
      .eq('is_revoked', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error

    return actionSuccess(data || [])
  } catch (error) {
    logger.error('getUserAccessTokens failed', error)
    return actionError(error instanceof Error ? error.message : 'Failed to get tokens')
  }
}

export async function revokeAccessToken(tokenId: string): Promise<ActionResult> {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('oauth_access_tokens')
      .update({ is_revoked: true })
      .eq('id', tokenId)
      .eq('user_id', user.id)

    if (error) throw error

    return actionSuccess(null)
  } catch (error) {
    logger.error('revokeAccessToken failed', error)
    return actionError(error instanceof Error ? error.message : 'Failed to revoke token')
  }
}

export async function revokeAllUserTokens(): Promise<ActionResult> {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    await supabase
      .from('oauth_access_tokens')
      .update({ is_revoked: true })
      .eq('user_id', user.id)

    await supabase
      .from('oauth_refresh_tokens')
      .update({ is_revoked: true })
      .eq('user_id', user.id)

    return actionSuccess(null)
  } catch (error) {
    logger.error('revokeAllUserTokens failed', error)
    return actionError(error instanceof Error ? error.message : 'Failed to revoke tokens')
  }
}

// ============================================
// OAUTH FLOW HELPERS (for API routes)
// ============================================

export async function validateOAuthClient(clientId: string, redirectUri: string): Promise<ActionResult> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('oauth_applications')
      .select('id, name, redirect_uris, allowed_scopes, is_active')
      .eq('client_id', clientId)
      .single()

    if (error) throw error
    if (!data.is_active) throw new Error('Application is not active')
    if (!data.redirect_uris.includes(redirectUri)) throw new Error('Invalid redirect URI')

    return actionSuccess(data)
  } catch (error) {
    logger.error('validateOAuthClient failed', error)
    return actionError(error instanceof Error ? error.message : 'Invalid client')
  }
}

export async function createAuthorizationCode(
  applicationId: string,
  redirectUri: string,
  scopes: string[],
  codeChallenge?: string,
  codeChallengeMethod?: string
): Promise<ActionResult<{ code: string }>> {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const code = crypto.randomBytes(32).toString('hex')
    const codeHash = crypto.createHash('sha256').update(code).digest('hex')

    const { error } = await supabase
      .from('oauth_authorization_codes')
      .insert({
        application_id: applicationId,
        user_id: user.id,
        code_hash: codeHash,
        redirect_uri: redirectUri,
        scopes,
        code_challenge: codeChallenge,
        code_challenge_method: codeChallengeMethod || 'S256',
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      })

    if (error) throw error

    return actionSuccess({ code })
  } catch (error) {
    logger.error('createAuthorizationCode failed', error)
    return actionError(error instanceof Error ? error.message : 'Failed to create code')
  }
}
