/**
 * SCIM 2.0 Bulk Operations
 *
 * POST /api/scim/v2/Bulk - Execute bulk operations
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
 * Execute bulk operations
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

    // Validate bulk request
    if (!body.schemas?.includes('urn:ietf:params:scim:api:messages:2.0:BulkRequest')) {
      return NextResponse.json(
        {
          schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
          status: '400',
          scimType: 'invalidSyntax',
          detail: 'Request must include BulkRequest schema'
        },
        { status: 400, headers: { 'Content-Type': 'application/scim+json' } }
      )
    }

    if (!body.Operations || !Array.isArray(body.Operations)) {
      return NextResponse.json(
        {
          schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
          status: '400',
          scimType: 'invalidSyntax',
          detail: 'Operations array is required'
        },
        { status: 400, headers: { 'Content-Type': 'application/scim+json' } }
      )
    }

    // Check operation limit (max 1000)
    if (body.Operations.length > 1000) {
      return NextResponse.json(
        {
          schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
          status: '413',
          scimType: 'tooLarge',
          detail: 'Bulk request exceeds maximum operations (1000)'
        },
        { status: 413, headers: { 'Content-Type': 'application/scim+json' } }
      )
    }

    const result = await scimService.processBulkRequest(body.Operations)

    return NextResponse.json(result, {
      headers: {
        'Content-Type': 'application/scim+json'
      }
    })
  } catch (error) {
    logger.error('SCIM bulk error', { error })

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
