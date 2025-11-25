/**
 * API Route: Investor Metrics
 *
 * Real-time investor-grade metrics and analytics
 * Designed for funding readiness and investor presentations
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * Calculate comprehensive investor metrics from platform data
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const timeframe = searchParams.get('timeframe') || '30_days';

    // In production, aggregate real data from database
    // For now, return calculated metrics structure

    const metrics = await calculateInvestorMetrics(userId, timeframe);

    return NextResponse.json({
      success: true,
      metrics,
      timestamp: new Date().toISOString(),
      timeframe,
    });

  } catch (error) {
    console.error('Error calculating investor metrics:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate investor metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Submit metrics data for investor dashboard
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { userId, eventType, eventData } = body;

    if (!userId || !eventType) {
      return NextResponse.json(
        { error: 'userId and eventType are required' },
        { status: 400 }
      );
    }

    // Store event for metrics calculation
    const { data, error } = await supabase
      .from('investor_metrics_events')
      .insert({
        user_id: userId,
        event_type: eventType,
        event_data: eventData,
        created_at: new Date().toISOString(),
      });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Metrics event recorded',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error recording metrics event:', error);
    return NextResponse.json(
      {
        error: 'Failed to record metrics event',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Helper: Calculate investor metrics from user data
 */
async function calculateInvestorMetrics(userId: string | null, timeframe: string) {
  // In production, query real data from database
  // This is a demo structure showing what will be calculated

  const metrics = {
    // Revenue Metrics
    revenue: {
      mrr: 0, // Monthly Recurring Revenue
      arr: 0, // Annual Recurring Revenue
      totalRevenue: 0,
      growthRate: 0, // MoM %
      revenueBySource: {
        projects: 0,
        retainers: 0,
        subscriptions: 0,
        other: 0,
      },
    },

    // Customer Metrics
    customers: {
      total: 0,
      active: 0,
      new: 0,
      churned: 0,
      churnRate: 0, // %
      retentionRate: 0, // %
      nps: 0, // Net Promoter Score
    },

    // Financial Metrics
    financial: {
      arpu: 0, // Average Revenue Per User
      cac: 0, // Customer Acquisition Cost
      clv: 0, // Customer Lifetime Value
      clvCacRatio: 0, // Should be > 3
      grossMargin: 0, // %
      netMargin: 0, // %
      paybackPeriod: 0, // months
    },

    // Growth Metrics
    growth: {
      quickRatio: 0, // (New + Expansion) / (Churned + Contraction)
      nrr: 0, // Net Revenue Retention %
      grr: 0, // Gross Revenue Retention %
      ruleOf40: 0, // Growth Rate + Profit Margin
      magicNumber: 0, // Net New ARR / Sales & Marketing Spend
    },

    // Engagement Metrics
    engagement: {
      dau: 0, // Daily Active Users
      wau: 0, // Weekly Active Users
      mau: 0, // Monthly Active Users
      stickiness: 0, // DAU/MAU ratio
      avgSessionDuration: 0, // minutes
      featureAdoptionRate: 0, // %
    },

    // Platform Metrics (Aggregate across all users)
    platform: {
      totalUsers: 0,
      paidUsers: 0,
      freeToPaidConversion: 0, // %
      platformRevenue: 0,
      totalJobsCreated: 0,
      totalEconomicImpact: 0, // Total $ earned by users
      avgUserRevenueIncrease: 0, // % increase after joining
    },

    // AI Feature Metrics
    aiMetrics: {
      aiFeatureUsageRate: 0, // % of users using AI
      aiGeneratedRevenue: 0, // Revenue attributed to AI features
      avgTimeSavedPerUser: 0, // hours/week
      aiRecommendationAcceptanceRate: 0, // %
      aiFeaturesSatisfactionScore: 0, // 1-10
    },

    // Efficiency Metrics
    efficiency: {
      revenuePerEmployee: 0,
      grossMerchantVolume: 0, // GMV
      takeRate: 0, // % of GMV
      operatingExpenseRatio: 0, // %
    },

    // Funding Metrics
    funding: {
      burnRate: 0, // $/month (for startups)
      runway: 0, // months
      cashBalance: 0,
      investmentReadinessScore: 0, // 0-100
    },
  };

  // TODO: Query database and calculate real metrics
  // Example queries:
  // - SELECT SUM(amount) FROM invoices WHERE status = 'paid' AND type = 'retainer'
  // - SELECT COUNT(DISTINCT user_id) FROM activity WHERE date > NOW() - INTERVAL '1 day'
  // - SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '30 days'

  return metrics;
}
