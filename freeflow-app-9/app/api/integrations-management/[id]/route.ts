/**
 * Integrations Management API - Single Resource Routes
 *
 * GET - Get single template, listing, health check
 * PUT - Update template, listing, rate limit, health check, dependency
 * DELETE - Delete template, listing, dependency, API key
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('integrations-management')
import {
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  publishTemplate,
  featureTemplate,
  incrementTemplateLikes,
  getMarketplaceListingById,
  updateMarketplaceListing,
  deleteMarketplaceListing,
  submitForApproval,
  approveListing,
  rejectListing,
  publishListing,
  incrementRateLimitUsage,
  resetRateLimit,
  updateHealthCheck,
  recordHealthCheckResult,
  updateCheckInterval,
  updateDependency,
  deleteDependency,
  deleteIntegrationAPIKey
} from '@/lib/integrations-management-queries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'template'

    switch (type) {
      case 'template': {
        const result = await getTemplateById(id)
        return NextResponse.json({ data: result.data })
      }

      case 'listing': {
        const result = await getMarketplaceListingById(id)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Integrations Management API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch resource' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, action, ...updates } = body

    switch (type) {
      case 'template': {
        if (action === 'publish') {
          const result = await publishTemplate(id)
          return NextResponse.json({ data: result.data })
        } else if (action === 'feature') {
          const result = await featureTemplate(id, updates.featured)
          return NextResponse.json({ data: result.data })
        } else if (action === 'like') {
          const result = await incrementTemplateLikes(id)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateTemplate(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'listing': {
        if (action === 'submit-for-approval') {
          const result = await submitForApproval(id)
          return NextResponse.json({ data: result.data })
        } else if (action === 'approve') {
          const result = await approveListing(id)
          return NextResponse.json({ data: result.data })
        } else if (action === 'reject') {
          const result = await rejectListing(id, updates.reason)
          return NextResponse.json({ data: result.data })
        } else if (action === 'publish') {
          const result = await publishListing(id)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateMarketplaceListing(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'rate-limit': {
        if (action === 'increment') {
          const result = await incrementRateLimitUsage(id)
          return NextResponse.json({ data: result.data })
        } else if (action === 'reset') {
          const result = await resetRateLimit(id)
          return NextResponse.json({ data: result.data })
        }
        return NextResponse.json({ error: 'Invalid action for rate-limit' }, { status: 400 })
      }

      case 'health-check': {
        if (action === 'record-result') {
          const result = await recordHealthCheckResult(
            id,
            updates.is_success,
            updates.response_time_ms,
            updates.error_message,
            updates.error_code
          )
          return NextResponse.json({ data: result.data })
        } else if (action === 'update-interval') {
          const result = await updateCheckInterval(id, updates.interval_minutes)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateHealthCheck(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'dependency': {
        const result = await updateDependency(id, updates)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Integrations Management API error', { error })
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'template'

    switch (type) {
      case 'template': {
        await deleteTemplate(id)
        return NextResponse.json({ success: true })
      }

      case 'listing': {
        await deleteMarketplaceListing(id)
        return NextResponse.json({ success: true })
      }

      case 'dependency': {
        await deleteDependency(id)
        return NextResponse.json({ success: true })
      }

      case 'api-key': {
        const result = await deleteIntegrationAPIKey(user.id, id)
        return NextResponse.json({ success: result.success })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Integrations Management API error', { error })
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
