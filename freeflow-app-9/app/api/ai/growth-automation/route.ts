/**
 * API Route: Growth Automation
 *
 * AI-powered client acquisition, lead scoring, and growth strategies
 */

import { NextRequest, NextResponse } from 'next/server';
import { growthAutomationEngine } from '@/lib/ai/growth-automation-engine';
import { createSimpleLogger } from '@/lib/simple-logger';

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

const logger = createSimpleLogger('ai-growth-automation');

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST /api/ai/growth-automation
 *
 * Body options:
 * - action: 'score_leads' | 'generate_outreach' | 'acquisition_playbook' | 'referral_optimization' | 'market_opportunities' | 'action_plan'
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Action parameter is required' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'score_leads': {
        if (!data.leads || !Array.isArray(data.leads)) {
          return NextResponse.json(
            { error: 'Leads array is required' },
            { status: 400 }
          );
        }

        const leadScores = await growthAutomationEngine.scoreLeads(data.leads);
        result = { leadScores };
        break;
      }

      case 'generate_outreach': {
        const { lead, type, userInfo } = data;

        if (!lead || !type || !userInfo) {
          return NextResponse.json(
            { error: 'lead, type, and userInfo are required' },
            { status: 400 }
          );
        }

        const outreach = await growthAutomationEngine.generateOutreach(
          lead,
          type,
          userInfo
        );
        result = { outreach };
        break;
      }

      case 'acquisition_playbook': {
        const { industry, expertise, currentClientCount, targetMonthlyRevenue } = data;

        if (!industry || !expertise) {
          return NextResponse.json(
            { error: 'industry and expertise are required' },
            { status: 400 }
          );
        }

        const playbook = await growthAutomationEngine.generateAcquisitionPlaybook(
          industry,
          expertise,
          currentClientCount || 0,
          targetMonthlyRevenue || 10000
        );
        result = { playbook };
        break;
      }

      case 'referral_optimization': {
        const { clientData } = data;

        if (!clientData || !Array.isArray(clientData)) {
          return NextResponse.json(
            { error: 'clientData array is required' },
            { status: 400 }
          );
        }

        const optimization = await growthAutomationEngine.optimizeReferralSystem(clientData);
        result = { optimization };
        break;
      }

      case 'market_opportunities': {
        const { currentExpertise, industry } = data;

        if (!currentExpertise || !industry) {
          return NextResponse.json(
            { error: 'currentExpertise and industry are required' },
            { status: 400 }
          );
        }

        const opportunities = await growthAutomationEngine.scanMarketOpportunities(
          currentExpertise,
          industry
        );
        result = { opportunities };
        break;
      }

      case 'action_plan': {
        const { userProfile } = data;

        if (!userProfile) {
          return NextResponse.json(
            { error: 'userProfile is required' },
            { status: 400 }
          );
        }

        const actionPlan = await growthAutomationEngine.generateGrowthActionPlan(userProfile);
        result = { actionPlan };
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action,
      ...result,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Error in growth automation', { error });
    return NextResponse.json(
      {
        error: 'Failed to process growth automation request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
