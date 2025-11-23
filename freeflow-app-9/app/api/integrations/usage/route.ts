import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import logger from '@/lib/logger';

/**
 * API Route: Integration Usage Statistics
 *
 * Track and report API usage and costs
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d'; // 1d, 7d, 30d, 90d

    // Get usage data from api_usage table
    const { data, error } = await supabase
      .from('api_usage')
      .select('*')
      .gte('recorded_at', getStartDate(period))
      .order('recorded_at', { ascending: false });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Aggregate stats by provider
    const stats = aggregateUsageStats(data || []);

    return NextResponse.json({
      success: true,
      period,
      stats,
      total: {
        calls: stats.reduce((sum, s) => sum + s.totalCalls, 0),
        cost: stats.reduce((sum, s) => sum + s.totalCost, 0),
      },
    });
  } catch (error: any) {
    logger.error('Failed to get usage stats', { error: error.message });
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { integrationId, type, provider, operation, tokensUsed, unitsUsed, estimatedCost } = await request.json();

    // Record usage
    const { error } = await supabase
      .from('api_usage')
      .insert({
        integration_id: integrationId,
        integration_type: type,
        provider,
        operation,
        tokens_used: tokensUsed,
        units_used: unitsUsed,
        estimated_cost: estimatedCost,
        recorded_at: new Date().toISOString(),
      });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    logger.info('Usage recorded', { provider, operation, cost: estimatedCost });

    return NextResponse.json({
      success: true,
      message: 'Usage recorded',
    });
  } catch (error: any) {
    logger.error('Failed to record usage', { error: error.message });
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Helper functions
function getStartDate(period: string): string {
  const now = new Date();
  const daysMap: any = {
    '1d': 1,
    '7d': 7,
    '30d': 30,
    '90d': 90,
  };

  const days = daysMap[period] || 30;
  now.setDate(now.getDate() - days);

  return now.toISOString();
}

function aggregateUsageStats(usageData: any[]): any[] {
  const providerStats: any = {};

  usageData.forEach((record) => {
    const provider = record.provider;

    if (!providerStats[provider]) {
      providerStats[provider] = {
        provider,
        totalCalls: 0,
        totalCost: 0,
        today: 0,
        thisMonth: 0,
      };
    }

    providerStats[provider].totalCalls += 1;
    providerStats[provider].totalCost += parseFloat(record.estimated_cost || 0);

    // Check if today
    const recordDate = new Date(record.recorded_at);
    const today = new Date();
    if (
      recordDate.getDate() === today.getDate() &&
      recordDate.getMonth() === today.getMonth() &&
      recordDate.getFullYear() === today.getFullYear()
    ) {
      providerStats[provider].today += 1;
    }

    // Check if this month
    if (
      recordDate.getMonth() === today.getMonth() &&
      recordDate.getFullYear() === today.getFullYear()
    ) {
      providerStats[provider].thisMonth += 1;
    }
  });

  return Object.values(providerStats);
}
