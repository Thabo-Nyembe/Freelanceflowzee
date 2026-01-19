/**
 * SCIM 2.0 Schemas
 *
 * GET /api/scim/v2/Schemas - List schemas
 */

import { NextResponse } from 'next/server'
import { scimService } from '@/lib/auth/scim-service'

/**
 * List schemas
 * This endpoint is typically public (no auth required)
 */
export async function GET(): Promise<NextResponse> {
  const schemas = scimService.getSchemas()

  return NextResponse.json({
    schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
    totalResults: schemas.length,
    Resources: schemas
  }, {
    headers: {
      'Content-Type': 'application/scim+json'
    }
  })
}
