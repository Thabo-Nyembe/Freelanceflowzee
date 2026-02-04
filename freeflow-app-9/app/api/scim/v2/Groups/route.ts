/**
 * SCIM 2.0 Groups API
 *
 * GET /api/scim/v2/Groups - List groups
 * POST /api/scim/v2/Groups - Create group
 */

import { NextRequest, NextResponse } from 'next/server'
import { scimService } from '@/lib/auth/scim-service'
import { validateSCIMAuth } from '../middleware'
import { createFeatureLogger } from '@/lib/logger'

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

const logger = createFeatureLogger('scim-api')

/**
 * List groups with filtering and pagination
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Validate SCIM authentication
    const authResult = await validateSCIMAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        {
          schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
          status: '401',
          detail: authResult.error
        },
        { status: 401 }
      )
    }

    if (authResult.organizationId) {
      scimService.setOrganization(authResult.organizationId)
    }

    const searchParams = request.nextUrl.searchParams
    const filter = searchParams.get('filter') || undefined
    const startIndex = parseInt(searchParams.get('startIndex') || '1', 10)
    const count = parseInt(searchParams.get('count') || '100', 10)

    const result = await scimService.listGroups({
      filter,
      startIndex,
      count
    })

    return NextResponse.json(result, {
      headers: {
        'Content-Type': 'application/scim+json'
      }
    })
  } catch (error) {
    logger.error('SCIM list groups error', { error })

    if ((error as { schemas?: string[] }).schemas) {
      const scimError = error as { status: string }
      return NextResponse.json(error, {
        status: parseInt(scimError.status, 10),
        headers: { 'Content-Type': 'application/scim+json' }
      })
    }

    return NextResponse.json(
      {
        schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
        status: '500',
        detail: 'Internal server error'
      },
      { status: 500, headers: { 'Content-Type': 'application/scim+json' } }
    )
  }
}

/**
 * Create a new group
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Validate SCIM authentication
    const authResult = await validateSCIMAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        {
          schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
          status: '401',
          detail: authResult.error
        },
        { status: 401 }
      )
    }

    if (authResult.organizationId) {
      scimService.setOrganization(authResult.organizationId)
    }

    const body = await request.json()
    const group = await scimService.createGroup(body)

    return NextResponse.json(group, {
      status: 201,
      headers: {
        'Content-Type': 'application/scim+json',
        Location: group.meta.location
      }
    })
  } catch (error) {
    logger.error('SCIM create group error', { error })

    if ((error as { schemas?: string[] }).schemas) {
      const scimError = error as { status: string }
      return NextResponse.json(error, {
        status: parseInt(scimError.status, 10),
        headers: { 'Content-Type': 'application/scim+json' }
      })
    }

    return NextResponse.json(
      {
        schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
        status: '500',
        detail: 'Internal server error'
      },
      { status: 500, headers: { 'Content-Type': 'application/scim+json' } }
    )
  }
}
