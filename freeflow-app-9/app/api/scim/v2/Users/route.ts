/**
 * SCIM 2.0 Users API
 *
 * GET /api/scim/v2/Users - List users
 * POST /api/scim/v2/Users - Create user
 */

import { NextRequest, NextResponse } from 'next/server'
import { scimService } from '@/lib/auth/scim-service'
import { validateSCIMAuth } from '../middleware'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('scim-api')

/**
 * List users with filtering and pagination
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

    // Set organization context
    if (authResult.organizationId) {
      scimService.setOrganization(authResult.organizationId)
    }

    const searchParams = request.nextUrl.searchParams
    const filter = searchParams.get('filter') || undefined
    const startIndex = parseInt(searchParams.get('startIndex') || '1', 10)
    const count = parseInt(searchParams.get('count') || '100', 10)
    const sortBy = searchParams.get('sortBy') || undefined
    const sortOrder = (searchParams.get('sortOrder') as 'ascending' | 'descending') || undefined

    const result = await scimService.listUsers({
      filter,
      startIndex,
      count,
      sortBy,
      sortOrder
    })

    return NextResponse.json(result, {
      headers: {
        'Content-Type': 'application/scim+json'
      }
    })
  } catch (error) {
    logger.error('SCIM list users error', { error })

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
 * Create a new user
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

    // Set organization context
    if (authResult.organizationId) {
      scimService.setOrganization(authResult.organizationId)
    }

    const body = await request.json()
    const user = await scimService.createUser(body)

    return NextResponse.json(user, {
      status: 201,
      headers: {
        'Content-Type': 'application/scim+json',
        Location: user.meta.location
      }
    })
  } catch (error) {
    logger.error('SCIM create user error', { error })

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
