import { NextResponse } from 'next/server';
import { multiCloudStorage } from '@/lib/storage/multi-cloud-storage';

export async function GET() {
  try {
    const [analytics, healthCheck] = await Promise.all([
      multiCloudStorage.getAnalytics(),
      multiCloudStorage.healthCheck()
    ]);

    // Calculate cost savings insights
    const insights = {
      monthlySavings: analytics.potentialSavings,
      percentageSavings: analytics.supabaseSize > 0 
        ? Math.round((analytics.potentialSavings / analytics.costBreakdown.supabaseCost) * 100)
        : 0,
      recommendedActions: [
        analytics.supabaseFiles > 50 ? 'Consider moving large files to Wasabi for cost savings' : null,
        analytics.wasabiFiles > 100 ? 'Excellent cost optimization with Wasabi usage!' : null,
        analytics.totalSize > 1e10 ? 'Large storage usage - Wasabi can save up to 80%' : null
      ].filter(Boolean)
    };

    return NextResponse.json({
      success: true,
      analytics,
      healthCheck,
      insights,
      status: {
        overall: healthCheck.overall ? 'healthy' : 'degraded',
        providers: {
          supabase: healthCheck.supabase ? 'connected' : 'disconnected',
          wasabi: healthCheck.wasabi ? 'connected' : 'disconnected'
        }
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch analytics'
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    const optimization = await multiCloudStorage.optimizeStorage();
    
    return NextResponse.json({
      success: true,
      optimization,
      message: `Storage optimization complete! Moved ${optimization.moved} files, saving approximately $${(optimization.saved / 1e9 * 0.023).toFixed(2)}/month`
    });

  } catch (error) {
    console.error('Optimization error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Optimization failed'
    }, { status: 500 });
  }
} 