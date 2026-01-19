/**
 * SCIM 2.0 Individual Group API
 *
 * GET /api/scim/v2/Groups/[id] - Get group
 * PUT /api/scim/v2/Groups/[id] - Replace group
 * PATCH /api/scim/v2/Groups/[id] - Update group
 * DELETE /api/scim/v2/Groups/[id] - Delete group
 */

import { NextRequest, NextResponse } from 'next/server'
import { scimService } from '@/lib/auth/scim-service'
import { validateSCIMAuth } from '../../middleware'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * Get a group by ID
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

    const group = await scimService.getGroup(id)

    return NextResponse.json(group, {
      headers: { 'Content-Type': 'application/scim+json' }
    })
  } catch (error) {
    console.error('SCIM get group error:', error)

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
 * Replace a group (full update)
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
    const group = await scimService.updateGroup(id, body)

    return NextResponse.json(group, {
      headers: { 'Content-Type': 'application/scim+json' }
    })
  } catch (error) {
    console.error('SCIM update group error:', error)

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
 * Patch a group (partial update)
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

    const group = await scimService.patchGroup(id, body.Operations)

    return NextResponse.json(group, {
      headers: { 'Content-Type': 'application/scim+json' }
    })
  } catch (error) {
    console.error('SCIM patch group error:', error)

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
 * Delete a group
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

    await scimService.deleteGroup(id)

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('SCIM delete group error:', error)

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
