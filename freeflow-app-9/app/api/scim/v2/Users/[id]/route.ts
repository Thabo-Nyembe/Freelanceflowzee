/**
 * SCIM 2.0 Individual User API
 *
 * GET /api/scim/v2/Users/[id] - Get user
 * PUT /api/scim/v2/Users/[id] - Replace user
 * PATCH /api/scim/v2/Users/[id] - Update user
 * DELETE /api/scim/v2/Users/[id] - Delete user
 */

import { NextRequest, NextResponse } from 'next/server'
import { scimService } from '@/lib/auth/scim-service'
import { validateSCIMAuth } from '../../middleware'
import { createSimpleLogger } from '@/lib/simple-logger'

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

const logger = createSimpleLogger('scim-api')

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * Get a user by ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params

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

    const user = await scimService.getUser(id)

    return NextResponse.json(user, {
      headers: { 'Content-Type': 'application/scim+json' }
    })
  } catch (error) {
    logger.error('SCIM get user error', { error })

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
 * Replace a user (full update)
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params

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
    const user = await scimService.updateUser(id, body)

    return NextResponse.json(user, {
      headers: { 'Content-Type': 'application/scim+json' }
    })
  } catch (error) {
    logger.error('SCIM update user error', { error })

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
 * Patch a user (partial update)
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params

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

    // Validate patch request
    if (!body.schemas?.includes('urn:ietf:params:scim:api:messages:2.0:PatchOp')) {
      return NextResponse.json(
        {
          schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
          status: '400',
          scimType: 'invalidSyntax',
          detail: 'Request must include PatchOp schema'
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

    const user = await scimService.patchUser(id, body.Operations)

    return NextResponse.json(user, {
      headers: { 'Content-Type': 'application/scim+json' }
    })
  } catch (error) {
    logger.error('SCIM patch user error', { error })

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
 * Delete a user
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params

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

    await scimService.deleteUser(id)

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    logger.error('SCIM delete user error', { error })

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
