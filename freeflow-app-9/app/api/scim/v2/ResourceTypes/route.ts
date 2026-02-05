/**
 * SCIM 2.0 Resource Types
 *
 * GET /api/scim/v2/ResourceTypes - List resource types
 */

import { NextResponse } from 'next/server'
import { scimService } from '@/lib/auth/scim-service'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

/**
 * List resource types
 * This endpoint is typically public (no auth required)
 */
export async function GET(): Promise<NextResponse> {
  const resourceTypes = scimService.getResourceTypes()

  return NextResponse.json({
    schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
    totalResults: resourceTypes.length,
    Resources: resourceTypes
  }, {
    headers: {
      'Content-Type': 'application/scim+json'
    }
  })
}
