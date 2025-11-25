/**
 * API Route: Revenue Intelligence
 *
 * Provides AI-powered revenue optimization and monetization insights
 */

import { NextRequest, NextResponse } from 'next/server';
import { revenueIntelligenceEngine, type RevenueData } from '@/lib/ai/revenue-intelligence-engine';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { revenueData, options } = body;

    if (!revenueData) {
      return NextResponse.json(
        { error: 'Revenue data is required' },
        { status: 400 }
      );
    }

    // Generate comprehensive intelligence report
    const report = await revenueIntelligenceEngine.generateIntelligenceReport(
      revenueData as RevenueData,
      options || {}
    );

    return NextResponse.json({
      success: true,
      report,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error generating revenue intelligence:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate revenue intelligence',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for forecasting
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') as '30_days' | '60_days' | '90_days' | '6_months' | '1_year';

    if (!timeframe) {
      return NextResponse.json(
        { error: 'Timeframe parameter is required' },
        { status: 400 }
      );
    }

    // For demo purposes - in production, fetch from database
    const mockRevenueData: RevenueData = {
      userId: 'demo',
      timeframe: 'monthly',
      totalRevenue: 50000,
      revenueBySource: {
        projects: 35000,
        retainers: 10000,
        passive: 5000,
        other: 0,
      },
      revenueByClient: [
        { clientId: '1', clientName: 'Client A', revenue: 15000, projectCount: 3 },
        { clientId: '2', clientName: 'Client B', revenue: 12000, projectCount: 2 },
        { clientId: '3', clientName: 'Client C', revenue: 8000, projectCount: 1 },
      ],
      expenses: 15000,
      netProfit: 35000,
      currency: 'USD',
    };

    const forecast = await revenueIntelligenceEngine.forecastRevenue(
      mockRevenueData,
      timeframe
    );

    return NextResponse.json({
      success: true,
      forecast,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error generating forecast:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate forecast',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
