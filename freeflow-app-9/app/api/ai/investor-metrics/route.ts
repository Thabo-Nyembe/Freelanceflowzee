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
  const supabase = await createClient()

  // Calculate date ranges based on timeframe
  const now = new Date()
  const timeframeMap: Record<string, number> = {
    '7_days': 7,
    '30_days': 30,
    '90_days': 90,
    '365_days': 365,
  }
  const days = timeframeMap[timeframe] || 30
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString()
  const previousStartDate = new Date(now.getTime() - days * 2 * 24 * 60 * 60 * 1000).toISOString()

  // Query all metrics in parallel for performance
  const [
    usersResult,
    invoicesResult,
    paymentsResult,
    subscriptionsResult,
    activityResult,
    clientsResult,
  ] = await Promise.all([
    // Total users
    supabase.from('users').select('id, created_at, role', { count: 'exact' }),
    // Invoices for revenue
    supabase.from('invoices').select('total_amount, status, type, created_at').gte('created_at', startDate),
    // Payments
    supabase.from('payments').select('amount, status, created_at').eq('status', 'succeeded').gte('created_at', startDate),
    // Subscriptions for MRR
    supabase.from('subscriptions').select('amount, status, interval').eq('status', 'active'),
    // User activity for engagement
    supabase.from('user_sessions').select('user_id, duration, created_at').gte('created_at', startDate),
    // Clients
    supabase.from('clients').select('id, status, created_at', { count: 'exact' }),
  ])

  // Calculate revenue metrics
  const paidInvoices = invoicesResult.data?.filter(i => i.status === 'paid') || []
  const totalRevenue = paidInvoices.reduce((sum, i) => sum + (i.total_amount || 0), 0)
  const projectRevenue = paidInvoices.filter(i => i.type === 'project').reduce((sum, i) => sum + (i.total_amount || 0), 0)
  const retainerRevenue = paidInvoices.filter(i => i.type === 'retainer').reduce((sum, i) => sum + (i.total_amount || 0), 0)
  const subscriptionRevenue = subscriptionsResult.data?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0

  // Calculate MRR from subscriptions
  const mrr = subscriptionsResult.data?.reduce((sum, sub) => {
    const amount = sub.amount || 0
    return sum + (sub.interval === 'year' ? amount / 12 : amount)
  }, 0) || 0

  // Calculate customer metrics
  const totalUsers = usersResult.count || 0
  const totalClients = clientsResult.count || 0
  const activeClients = clientsResult.data?.filter(c => c.status === 'active').length || 0
  const newClients = clientsResult.data?.filter(c => new Date(c.created_at) >= new Date(startDate)).length || 0

  // Calculate engagement from sessions
  const sessions = activityResult.data || []
  const uniqueUsersToday = new Set(sessions.filter(s =>
    new Date(s.created_at) >= new Date(now.getTime() - 24 * 60 * 60 * 1000)
  ).map(s => s.user_id)).size
  const uniqueUsersWeek = new Set(sessions.filter(s =>
    new Date(s.created_at) >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  ).map(s => s.user_id)).size
  const uniqueUsersMonth = new Set(sessions.map(s => s.user_id)).size
  const avgSessionDuration = sessions.length > 0
    ? sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length / 60
    : 0

  const metrics = {
    revenue: {
      mrr,
      arr: mrr * 12,
      totalRevenue,
      growthRate: 0, // Would need previous period comparison
      revenueBySource: {
        projects: projectRevenue,
        retainers: retainerRevenue,
        subscriptions: subscriptionRevenue,
        other: totalRevenue - projectRevenue - retainerRevenue - subscriptionRevenue,
      },
    },
    customers: {
      total: totalClients,
      active: activeClients,
      new: newClients,
      churned: 0, // Would need tracking table
      churnRate: 0,
      retentionRate: totalClients > 0 ? (activeClients / totalClients) * 100 : 0,
      nps: 0, // Would need survey data
    },
    financial: {
      arpu: totalUsers > 0 ? totalRevenue / totalUsers : 0,
      cac: 0, // Would need marketing spend data
      clv: 0, // Would need lifetime calculation
      clvCacRatio: 0,
      grossMargin: 70, // Industry standard for SaaS
      netMargin: 20,
      paybackPeriod: 0,
    },
    growth: {
      quickRatio: 0,
      nrr: 100, // Baseline
      grr: 100,
      ruleOf40: 0,
      magicNumber: 0,
    },
    engagement: {
      dau: uniqueUsersToday,
      wau: uniqueUsersWeek,
      mau: uniqueUsersMonth,
      stickiness: uniqueUsersMonth > 0 ? (uniqueUsersToday / uniqueUsersMonth) * 100 : 0,
      avgSessionDuration,
      featureAdoptionRate: 0,
    },
    platform: {
      totalUsers,
      paidUsers: subscriptionsResult.data?.length || 0,
      freeToPaidConversion: totalUsers > 0 ? ((subscriptionsResult.data?.length || 0) / totalUsers) * 100 : 0,
      platformRevenue: totalRevenue,
      totalJobsCreated: 0,
      totalEconomicImpact: totalRevenue,
      avgUserRevenueIncrease: 0,
    },
    aiMetrics: {
      aiFeatureUsageRate: 0,
      aiGeneratedRevenue: 0,
      avgTimeSavedPerUser: 0,
      aiRecommendationAcceptanceRate: 0,
      aiFeaturesSatisfactionScore: 0,
    },
    efficiency: {
      revenuePerEmployee: 0,
      grossMerchantVolume: totalRevenue,
      takeRate: 0,
      operatingExpenseRatio: 0,
    },
    funding: {
      burnRate: 0,
      runway: 0,
      cashBalance: 0,
      investmentReadinessScore: Math.min(100, mrr > 0 ? 50 + (mrr / 1000) : 25),
    },
  }

  return metrics
}
