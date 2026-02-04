/**
 * Seller Levels API - FreeFlow A+++ Implementation
 * Get level definitions and user's current level
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createFeatureLogger } from '@/lib/logger';

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

const logger = createFeatureLogger('seller-levels');

// GET - Get level definitions and optionally user's stats
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const includeUserStats = searchParams.get('include_user_stats') === 'true';

    // Get level definitions
    const { data: levels, error: levelsError } = await supabase
      .from('seller_level_definitions')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (levelsError && levelsError.code !== '42P01') {
      throw levelsError;
    }

    let userStats = null;
    let userXP = null;
    let levelProgress = null;

    if (includeUserStats) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Get user's statistics
        const { data: stats } = await supabase
          .from('seller_statistics')
          .select('*')
          .eq('user_id', user.id)
          .single();

        userStats = stats;

        // Get user's XP
        const { data: xp } = await supabase
          .from('seller_xp')
          .select('*')
          .eq('user_id', user.id)
          .single();

        userXP = xp;

        // Calculate progress to next level
        if (stats && levels) {
          const currentLevel = levels.find((l: { tier: string }) => l.tier === stats.current_level);
          const currentIndex = levels.findIndex((l: { tier: string }) => l.tier === stats.current_level);
          const nextLevel = currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;

          if (currentLevel) {
            levelProgress = {
              current: currentLevel,
              next: nextLevel,
              progress: calculateProgress(stats, nextLevel),
            };
          }
        }
      }
    }

    return NextResponse.json({
      levels: levels || [],
      userStats,
      userXP,
      levelProgress,
    });
  } catch (error) {
    logger.error('Seller levels GET error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

interface SellerStats {
  completed_orders: number;
  total_earnings: number;
  average_rating: number;
  on_time_delivery_rate: number;
  response_rate: number;
  order_completion_rate: number;
  days_since_joined: number;
  repeat_buyer_rate: number;
}

interface LevelDef {
  min_orders: number;
  min_earnings: number;
  min_rating: number;
  min_on_time_rate: number;
  min_response_rate: number;
  min_completion_rate: number;
  min_days_active: number;
  min_repeat_buyer_rate: number;
}

function calculateProgress(stats: SellerStats, nextLevel: LevelDef | null) {
  if (!nextLevel) return null;

  const metrics = [
    { name: 'orders', current: stats.completed_orders, required: nextLevel.min_orders },
    { name: 'earnings', current: stats.total_earnings, required: nextLevel.min_earnings },
    { name: 'rating', current: stats.average_rating, required: nextLevel.min_rating },
    { name: 'onTimeRate', current: stats.on_time_delivery_rate, required: nextLevel.min_on_time_rate },
    { name: 'responseRate', current: stats.response_rate, required: nextLevel.min_response_rate },
    { name: 'completionRate', current: stats.order_completion_rate, required: nextLevel.min_completion_rate },
    { name: 'daysActive', current: stats.days_since_joined, required: nextLevel.min_days_active },
    { name: 'repeatBuyerRate', current: stats.repeat_buyer_rate, required: nextLevel.min_repeat_buyer_rate },
  ];

  const progress: Record<string, { current: number; required: number; percentage: number }> = {};
  let totalPercentage = 0;

  for (const metric of metrics) {
    const percentage = metric.required > 0
      ? Math.min(100, (metric.current / metric.required) * 100)
      : 100;
    progress[metric.name] = {
      current: metric.current,
      required: metric.required,
      percentage,
    };
    totalPercentage += percentage;
  }

  return {
    metrics: progress,
    overall: totalPercentage / metrics.length,
  };
}
