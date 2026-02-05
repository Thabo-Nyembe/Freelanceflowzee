// =====================================================
// Account Deactivation API
// Handles temporary account deactivation
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSimpleLogger } from '@/lib/simple-logger';
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode';

const logger = createSimpleLogger('account-deactivate');

// =====================================================
// POST - Deactivate account
// =====================================================
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update user profile status
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        status: 'deactivated',
        deactivated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    // Handle if table doesn't exist
    if (profileError && profileError.code !== '42P01') {
      logger.error('Profile update error', { error: profileError });
    }

    // Also update user_settings if it exists
    const { error: settingsError } = await supabase
      .from('user_settings')
      .update({
        account_status: 'deactivated',
        deactivated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (settingsError && settingsError.code !== '42P01' && settingsError.code !== '42703') {
      logger.error('Settings update error', { error: settingsError });
    }

    // Invalidate all sessions except current
    const { error: sessionError } = await supabase
      .from('user_sessions')
      .update({
        is_active: false,
        ended_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (sessionError && sessionError.code !== '42P01') {
      logger.error('Session invalidation error', { error: sessionError });
    }

    // Sign out user
    await supabase.auth.signOut();

    return NextResponse.json({
      success: true,
      message: 'Account deactivated successfully. You can reactivate by logging in again.',
      deactivatedAt: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Account deactivation error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to deactivate account' },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE - Reactivate account (undo deactivation)
// =====================================================
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Reactivate user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        status: 'active',
        deactivated_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (profileError && profileError.code !== '42P01') {
      logger.error('Profile reactivation error', { error: profileError });
    }

    // Reactivate in user_settings
    const { error: settingsError } = await supabase
      .from('user_settings')
      .update({
        account_status: 'active',
        deactivated_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (settingsError && settingsError.code !== '42P01' && settingsError.code !== '42703') {
      logger.error('Settings reactivation error', { error: settingsError });
    }

    return NextResponse.json({
      success: true,
      message: 'Account reactivated successfully'
    });
  } catch (error) {
    logger.error('Account reactivation error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reactivate account' },
      { status: 500 }
    );
  }
}
