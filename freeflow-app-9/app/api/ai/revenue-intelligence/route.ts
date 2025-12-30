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

// GET endpoint for forecasting - fetches real data from database
export async function GET(request: NextRequest) {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') as '30_days' | '60_days' | '90_days' | '6_months' | '1_year';

    if (!timeframe) {
      return NextResponse.json(
        { error: 'Timeframe parameter is required' },
        { status: 400 }
      );
    }

    // Fetch real revenue data from database
    const [{ data: invoices }, { data: clients }, { data: projects }] = await Promise.all([
      supabase.from('invoices').select('*').eq('user_id', user.id),
      supabase.from('clients').select('id, name').eq('user_id', user.id),
      supabase.from('projects').select('id, client_id, budget, status').eq('user_id', user.id)
    ]);

    // Calculate revenue by client
    const clientRevenueMap = new Map<string, { clientId: string; clientName: string; revenue: number; projectCount: number }>();
    const clientMap = new Map((clients || []).map(c => [c.id, c.name]));

    (invoices || []).forEach((inv: any) => {
      if (inv.client_id && inv.status === 'paid') {
        const existing = clientRevenueMap.get(inv.client_id) || {
          clientId: inv.client_id,
          clientName: clientMap.get(inv.client_id) || 'Unknown',
          revenue: 0,
          projectCount: 0
        };
        existing.revenue += inv.total || 0;
        clientRevenueMap.set(inv.client_id, existing);
      }
    });

    // Count projects per client
    (projects || []).forEach((proj: any) => {
      if (proj.client_id) {
        const existing = clientRevenueMap.get(proj.client_id);
        if (existing) {
          existing.projectCount += 1;
        }
      }
    });

    // Calculate totals
    const paidInvoices = (invoices || []).filter((i: any) => i.status === 'paid');
    const totalRevenue = paidInvoices.reduce((sum: number, i: any) => sum + (i.total || 0), 0);
    const projectRevenue = (projects || []).filter((p: any) => p.status === 'completed')
      .reduce((sum: number, p: any) => sum + (p.budget || 0), 0);

    const revenueData: RevenueData = {
      userId: user.id,
      timeframe: 'monthly',
      totalRevenue,
      revenueBySource: {
        projects: projectRevenue,
        retainers: Math.round(totalRevenue * 0.2), // Estimate
        passive: Math.round(totalRevenue * 0.1), // Estimate
        other: 0,
      },
      revenueByClient: Array.from(clientRevenueMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10),
      expenses: Math.round(totalRevenue * 0.3), // Estimate 30% expenses
      netProfit: Math.round(totalRevenue * 0.7),
      currency: 'USD',
    };

    const forecast = await revenueIntelligenceEngine.forecastRevenue(
      revenueData,
      timeframe
    );

    return NextResponse.json({
      success: true,
      forecast,
      revenueData,
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
