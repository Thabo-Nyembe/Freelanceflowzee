/**
 * Integrations Management API Routes
 *
 * REST endpoints for Integration Templates, Marketplace, Rate Limits, Health:
 * GET - Templates, marketplace listings, rate limits, health checks, dependencies, stats
 * POST - Create templates, listings, rate limits, health checks, dependencies
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('integrations-management')
import {
  getPublishedTemplates,
  getFeaturedTemplates,
  getUserTemplates,
  createTemplate,
  searchTemplates,
  getMarketplaceListings,
  getTopRatedListings,
  getDeveloperListings,
  createMarketplaceListing,
  searchMarketplace,
  getIntegrationRateLimits,
  getRateLimit,
  createRateLimit,
  getThrottledIntegrations,
  getIntegrationHealth,
  createHealthCheck,
  getUnhealthyIntegrations,
  getDueHealthChecks,
  getIntegrationDependencies,
  createDependency,
  checkDependenciesSatisfied,
  getIntegrationsManagementStats,
  getIntegrationAPIKeys,
  createIntegrationAPIKey
} from '@/lib/integrations-management-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'templates'
    const category = searchParams.get('category')
    const status = searchParams.get('status') as string | null
    const integrationId = searchParams.get('integration_id')
    const endpoint = searchParams.get('endpoint')
    const period = searchParams.get('period') as string | null
    const search = searchParams.get('search')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    switch (type) {
      case 'templates': {
        const result = await getPublishedTemplates(category || undefined, limit)
        return NextResponse.json({ data: result.data })
      }

      case 'featured-templates': {
        const result = await getFeaturedTemplates(limit)
        return NextResponse.json({ data: result.data })
      }

      case 'user-templates': {
        const result = await getUserTemplates(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'search-templates': {
        if (!search) {
          return NextResponse.json({ error: 'search required' }, { status: 400 })
        }
        const result = await searchTemplates(search, limit)
        return NextResponse.json({ data: result.data })
      }

      case 'marketplace': {
        const result = await getMarketplaceListings(status || undefined, limit)
        return NextResponse.json({ data: result.data })
      }

      case 'top-rated': {
        const result = await getTopRatedListings(limit)
        return NextResponse.json({ data: result.data })
      }

      case 'developer-listings': {
        const result = await getDeveloperListings(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'search-marketplace': {
        if (!search) {
          return NextResponse.json({ error: 'search required' }, { status: 400 })
        }
        const result = await searchMarketplace(search, limit)
        return NextResponse.json({ data: result.data })
      }

      case 'rate-limits': {
        if (!integrationId) {
          return NextResponse.json({ error: 'integration_id required' }, { status: 400 })
        }
        const result = await getIntegrationRateLimits(integrationId, user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'rate-limit': {
        if (!integrationId || !period) {
          return NextResponse.json({ error: 'integration_id and period required' }, { status: 400 })
        }
        const result = await getRateLimit(integrationId, user.id, endpoint, period)
        return NextResponse.json({ data: result.data })
      }

      case 'throttled': {
        const result = await getThrottledIntegrations(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'health': {
        if (!integrationId) {
          return NextResponse.json({ error: 'integration_id required' }, { status: 400 })
        }
        const result = await getIntegrationHealth(integrationId)
        return NextResponse.json({ data: result.data })
      }

      case 'unhealthy': {
        const result = await getUnhealthyIntegrations()
        return NextResponse.json({ data: result.data })
      }

      case 'due-health-checks': {
        const result = await getDueHealthChecks()
        return NextResponse.json({ data: result.data })
      }

      case 'dependencies': {
        if (!integrationId) {
          return NextResponse.json({ error: 'integration_id required' }, { status: 400 })
        }
        const result = await getIntegrationDependencies(integrationId)
        return NextResponse.json({ data: result.data })
      }

      case 'check-dependencies': {
        if (!integrationId) {
          return NextResponse.json({ error: 'integration_id required' }, { status: 400 })
        }
        const result = await checkDependenciesSatisfied(integrationId)
        return NextResponse.json({ data: result })
      }

      case 'api-keys': {
        const result = await getIntegrationAPIKeys(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'stats': {
        const result = await getIntegrationsManagementStats()
        return NextResponse.json({ data: result })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Integrations Management API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch Integrations Management data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...payload } = body

    switch (action) {
      case 'create-template': {
        const result = await createTemplate(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-listing': {
        const result = await createMarketplaceListing(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-rate-limit': {
        const result = await createRateLimit({ user_id: user.id, ...payload })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-health-check': {
        const result = await createHealthCheck(payload.integration_id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-dependency': {
        const result = await createDependency(payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-api-key': {
        const result = await createIntegrationAPIKey(user.id, payload.integration_id, payload.integration_name)
        return NextResponse.json({ data: result.data, newKey: result.newKey }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Integrations Management API error', { error })
    return NextResponse.json(
      { error: 'Failed to process Integrations Management request' },
      { status: 500 }
    )
  }
}
