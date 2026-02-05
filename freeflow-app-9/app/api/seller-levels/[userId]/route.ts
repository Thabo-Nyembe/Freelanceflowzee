/**
 * Seller Profile API - FreeFlow A+++ Implementation
 * Get public seller statistics and badges
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSimpleLogger } from '@/lib/simple-logger';
import { isDemoMode, getDemoUserId } from '@/lib/demo-mode';

const logger = createSimpleLogger('seller-profile');

// GET - Get seller's public profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const supabase = await createClient();

    // Get seller statistics
    const { data: stats, error: statsError } = await supabase
      .from('seller_statistics')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (statsError && statsError.code !== 'PGRST116') {
      if (statsError.code === '42P01') {
        // Table doesn't exist yet
        return NextResponse.json({
          stats: null,
          level: null,
          badges: [],
          xp: null,
        });
      }
      throw statsError;
    }

    // Get level definition
    let level = null;
    if (stats) {
      const { data: levelData } = await supabase
        .from('seller_level_definitions')
        .select('*')
        .eq('tier', stats.current_level)
        .single();
      level = levelData;
    }

    // Get user's badges
    const { data: badges } = await supabase
      .from('user_badges')
      .select(`
        *,
        badge:badge_definitions (*)
      `)
      .eq('user_id', userId)
      .eq('is_expired', false)
      .order('is_featured', { ascending: false })
      .order('awarded_at', { ascending: false });

    // Get XP (only basic info for public)
    const { data: xp } = await supabase
      .from('seller_xp')
      .select('total_xp, current_level')
      .eq('user_id', userId)
      .single();

    // Get level history (recent promotions)
    const { data: levelHistory } = await supabase
      .from('seller_level_history')
      .select('*')
      .eq('user_id', userId)
      .eq('change_type', 'promotion')
      .order('changed_at', { ascending: false })
      .limit(3);

    return NextResponse.json({
      stats,
      level,
      badges: badges || [],
      xp,
      recentPromotions: levelHistory || [],
    });
  } catch (error) {
    logger.error('Seller profile GET error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
