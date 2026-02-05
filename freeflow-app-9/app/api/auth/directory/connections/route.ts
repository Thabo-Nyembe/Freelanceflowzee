/**
 * Directory Connections API
 *
 * GET /api/auth/directory/connections - List directory connections
 * POST /api/auth/directory/connections - Create directory connection
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createDirectoryConnection,
  listDirectoryConnections,
  type DirectoryProvider
} from '@/lib/auth/directory-sync'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('directory-connections')

/**
 * List directory connections for organization
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get organization from query params or user's default org
    const searchParams = request.nextUrl.searchParams
    const organizationId = searchParams.get('organizationId')

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    // Verify user has access to organization
    const { data: membership, error: memberError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single()

    if (memberError || !membership) {
      return NextResponse.json(
        { error: 'Not a member of this organization' },
        { status: 403 }
      )
    }

    // Only admins/owners can view directory connections
    if (!['admin', 'owner'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const connections = await listDirectoryConnections(organizationId)

    return NextResponse.json({
      success: true,
      connections
    })
  } catch (error) {
    logger.error('List directory connections error', { error })
    return NextResponse.json(
      { error: 'Failed to list directory connections' },
      { status: 500 }
    )
  }
}

/**
 * Create a new directory connection
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      organizationId,
      provider,
      name,
      config,
      syncOptions
    } = body

    // Validate required fields
    if (!organizationId || !provider || !name || !config) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, provider, name, config' },
        { status: 400 }
      )
    }

    // Validate provider
    const validProviders: DirectoryProvider[] = ['azure_ad', 'google_workspace', 'okta', 'onelogin', 'ldap']
    if (!validProviders.includes(provider)) {
      return NextResponse.json(
        { error: `Invalid provider. Must be one of: ${validProviders.join(', ')}` },
        { status: 400 }
      )
    }

    // Verify user has admin access to organization
    const { data: membership, error: memberError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single()

    if (memberError || !membership) {
      return NextResponse.json(
        { error: 'Not a member of this organization' },
        { status: 403 }
      )
    }

    if (!['admin', 'owner'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Only admins can create directory connections' },
        { status: 403 }
      )
    }

    // Validate provider-specific config
    const configValidation = validateProviderConfig(provider, config)
    if (!configValidation.valid) {
      return NextResponse.json(
        { error: configValidation.error },
        { status: 400 }
      )
    }

    // Create the connection
    const connectionId = await createDirectoryConnection({
      organizationId,
      provider,
      name,
      config,
      syncOptions: syncOptions || {
        autoProvision: true,
        autoDeprovision: false,
        syncGroups: true,
        syncInterval: 3600 // 1 hour
      }
    })

    // Log the creation
    await supabase.from('directory_sync_logs').insert({
      connection_id: connectionId,
      organization_id: organizationId,
      operation: 'connection_created',
      status: 'success',
      details: {
        provider,
        name,
        created_by: user.id
      }
    })

    return NextResponse.json({
      success: true,
      connectionId,
      message: 'Directory connection created successfully'
    }, { status: 201 })
  } catch (error) {
    logger.error('Create directory connection error', { error })
    return NextResponse.json(
      { error: 'Failed to create directory connection' },
      { status: 500 }
    )
  }
}

/**
 * Validate provider-specific configuration
 */
function validateProviderConfig(
  provider: DirectoryProvider,
  config: Record<string, unknown>
): { valid: boolean; error?: string } {
  switch (provider) {
    case 'azure_ad':
      if (!config.tenantId || !config.clientId || !config.clientSecret) {
        return {
          valid: false,
          error: 'Azure AD requires: tenantId, clientId, clientSecret'
        }
      }
      break

    case 'google_workspace':
      if (!config.domain || !config.adminEmail || !config.serviceAccountKey) {
        return {
          valid: false,
          error: 'Google Workspace requires: domain, adminEmail, serviceAccountKey'
        }
      }
      break

    case 'okta':
      if (!config.domain || !config.apiToken) {
        return {
          valid: false,
          error: 'Okta requires: domain, apiToken'
        }
      }
      break

    case 'onelogin':
      if (!config.subdomain || !config.clientId || !config.clientSecret) {
        return {
          valid: false,
          error: 'OneLogin requires: subdomain, clientId, clientSecret'
        }
      }
      break

    case 'ldap':
      if (!config.url || !config.bindDn || !config.bindPassword || !config.baseDn) {
        return {
          valid: false,
          error: 'LDAP requires: url, bindDn, bindPassword, baseDn'
        }
      }
      break
  }

  return { valid: true }
}
