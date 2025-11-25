/**
 * GROWTH ENGINE API
 * Advanced business growth features for freelancers & businesses
 */

import { NextRequest, NextResponse } from 'next/server'
import { businessGrowthEngine } from '@/lib/ai/business-growth-engine'
import { createFeatureLogger } from '@/lib/logger'

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
