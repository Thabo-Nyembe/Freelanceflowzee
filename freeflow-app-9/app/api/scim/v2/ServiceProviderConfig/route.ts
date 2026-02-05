/**
 * SCIM 2.0 Service Provider Configuration
 *
 * GET /api/scim/v2/ServiceProviderConfig - Get service provider config
 */

import { NextResponse } from 'next/server'
import { scimService } from '@/lib/auth/scim-service'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

/**
 * Get service provider configuration
 * This endpoint is typically public (no auth required)
 */
export async function GET(): Promise<NextResponse> {
  const config = scimService.getServiceProviderConfig()

  return NextResponse.json(config, {
    headers: {
      'Content-Type': 'application/scim+json'
    }
  })
}
