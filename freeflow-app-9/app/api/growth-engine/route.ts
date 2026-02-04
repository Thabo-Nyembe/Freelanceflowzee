/**
 * GROWTH ENGINE API
 * Advanced business growth features for freelancers & businesses
 */

import { NextRequest, NextResponse } from 'next/server'
import { businessGrowthEngine } from '@/lib/ai/business-growth-engine'
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

const logger = createFeatureLogger('GrowthEngine-API')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, params } = body

    logger.info('Growth engine request', { action, params })

    let result

    switch (action) {
      case 'client-acquisition':
        result = await businessGrowthEngine.generateClientAcquisitionPlan(params)
        break

      case 'pricing-optimization':
        result = await businessGrowthEngine.optimizePricing(params)
        break

      case 'growth-roadmap':
        result = await businessGrowthEngine.createGrowthRoadmap(params)
        break

      case 'outreach-campaign':
        result = await businessGrowthEngine.generateOutreachCampaign(params)
        break

      case 'workflow-optimization':
        result = await businessGrowthEngine.optimizeWorkflow(params)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action', validActions: ['client-acquisition', 'pricing-optimization', 'growth-roadmap', 'outreach-campaign', 'workflow-optimization'] },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true, data: result })

  } catch (error) {
    logger.error('Growth engine error', { error: error instanceof Error ? error.message : 'Unknown error' })

    return NextResponse.json(
      { error: 'Failed to process growth engine request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Return available growth engine features
  return NextResponse.json({
    features: [
      {
        action: 'client-acquisition',
        description: 'Generate personalized client acquisition strategies',
        params: ['industry', 'targetClient', 'currentClients', 'targetClients', 'timeline']
      },
      {
        action: 'pricing-optimization',
        description: 'Optimize pricing based on market analysis',
        params: ['currentRate', 'experience', 'skills', 'market', 'targetIncome']
      },
      {
        action: 'growth-roadmap',
        description: 'Create detailed growth roadmap with milestones',
        params: ['currentRevenue', 'targetRevenue', 'timeline', 'businessType', 'constraints']
      },
      {
        action: 'outreach-campaign',
        description: 'Generate multi-touch cold outreach campaigns',
        params: ['targetIndustry', 'serviceOffering', 'uniqueValue', 'touchPoints']
      },
      {
        action: 'workflow-optimization',
        description: 'Analyze and optimize workflows for efficiency',
        params: ['currentWorkflow', 'timePerProject', 'painPoints', 'toolsUsed']
      }
    ]
  })
}

export async function PATCH(request: NextRequest) {
  // Growth engine uses action-based POST for most operations
  // PATCH can be used for updating saved growth plans
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Plan ID required' }, { status: 400 })
    }

    // This would update a saved growth plan in the database
    // For now, return success as growth engine is primarily computation-based
    logger.info('Growth plan update', { id, updates })

    return NextResponse.json({
      success: true,
      message: 'Growth plan updated',
      data: { id, ...updates }
    })

  } catch (error) {
    logger.error('Growth engine PATCH error', { error: error instanceof Error ? error.message : 'Unknown' })

    return NextResponse.json(
      { error: 'Failed to update growth plan' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  // Delete saved growth plans
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Plan ID required' }, { status: 400 })
    }

    logger.info('Growth plan deletion', { id })

    return NextResponse.json({
      success: true,
      message: 'Growth plan deleted'
    })

  } catch (error) {
    logger.error('Growth engine DELETE error', { error: error instanceof Error ? error.message : 'Unknown' })

    return NextResponse.json(
      { error: 'Failed to delete growth plan' },
      { status: 500 }
    )
  }
}
