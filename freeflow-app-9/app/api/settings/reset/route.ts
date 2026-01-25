// =====================================================
// Settings Reset API
// Handles resetting all settings to defaults
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createFeatureLogger } from '@/lib/logger';

const logger = createFeatureLogger('settings-reset');

// Default settings configurations
const defaultNotificationSettings = {
  email_notifications: true,
  push_notifications: true,
  sms_notifications: false,
  in_app_notifications: true,
  project_updates: true,
  client_messages: true,
  team_mentions: true,
  task_assignments: true,
  deadline_reminders: true,
  payment_alerts: true,
  invoice_reminders: true,
  marketing_emails: false,
  product_updates: true,
  weekly_digest: true,
  monthly_reports: true,
  digest_frequency: 'weekly',
  quiet_hours_enabled: false,
  quiet_hours_start: null,
  quiet_hours_end: null
};

const defaultSecuritySettings = {
  two_factor_auth: false,
  two_factor_method: null,
  biometric_auth: false,
  session_timeout: '24h',
  remember_me_enabled: true,
  concurrent_sessions_limit: 5,
  login_alerts: true,
  login_alerts_email: true,
  suspicious_activity_alerts: true,
  new_device_alerts: true
};

const defaultAppearanceSettings = {
  theme: 'system',
  accent_color: '#8B5CF6',
  language: 'en',
  timezone: 'UTC',
  date_format: 'MM/DD/YYYY',
  time_format: '12h',
  currency: 'USD',
  compact_mode: false,
  animations: true,
  reduced_motion: false,
  high_contrast: false,
  font_size: 'medium',
  sidebar_collapsed: false,
  dashboard_layout: {},
  pinned_items: []
};

const defaultPrivacySettings = {
  profile_visibility: 'public',
  show_email: false,
  show_phone: false,
  activity_status: true,
  online_status: true,
  read_receipts: true,
  data_collection: 'minimal',
  analytics_tracking: true
};

// =====================================================
// POST - Reset settings to defaults
// =====================================================
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { category } = body;

    const timestamp = new Date().toISOString();

    // Reset specific category or all settings
    if (!category || category === 'all') {
      // Reset all settings
      const results = await Promise.allSettled([
        // Reset notification settings
        supabase
          .from('notification_settings')
          .upsert({
            user_id: user.id,
            ...defaultNotificationSettings,
            updated_at: timestamp
          }, { onConflict: 'user_id' }),

        // Reset security settings
        supabase
          .from('security_settings')
          .upsert({
            user_id: user.id,
            ...defaultSecuritySettings,
            updated_at: timestamp
          }, { onConflict: 'user_id' }),

        // Reset appearance settings
        supabase
          .from('appearance_settings')
          .upsert({
            user_id: user.id,
            ...defaultAppearanceSettings,
            updated_at: timestamp
          }, { onConflict: 'user_id' }),

        // Reset privacy settings in user_profiles
        supabase
          .from('user_profiles')
          .update({
            ...defaultPrivacySettings,
            updated_at: timestamp
          })
          .eq('user_id', user.id)
      ]);

      // Check for any failures
      const failures = results.filter(r => r.status === 'rejected');
      if (failures.length > 0) {
        logger.warn('Some settings failed to reset', { failures });
      }

      return NextResponse.json({
        success: true,
        message: 'All settings reset to defaults',
        resetCategories: ['notifications', 'security', 'appearance', 'privacy']
      });
    }

    // Reset specific category
    switch (category) {
      case 'notifications': {
        const { error } = await supabase
          .from('notification_settings')
          .upsert({
            user_id: user.id,
            ...defaultNotificationSettings,
            updated_at: timestamp
          }, { onConflict: 'user_id' });

        if (error && error.code !== '42P01') throw error;

        return NextResponse.json({
          success: true,
          message: 'Notification settings reset to defaults',
          settings: defaultNotificationSettings
        });
      }

      case 'security': {
        const { error } = await supabase
          .from('security_settings')
          .upsert({
            user_id: user.id,
            ...defaultSecuritySettings,
            updated_at: timestamp
          }, { onConflict: 'user_id' });

        if (error && error.code !== '42P01') throw error;

        return NextResponse.json({
          success: true,
          message: 'Security settings reset to defaults',
          settings: defaultSecuritySettings
        });
      }

      case 'appearance': {
        const { error } = await supabase
          .from('appearance_settings')
          .upsert({
            user_id: user.id,
            ...defaultAppearanceSettings,
            updated_at: timestamp
          }, { onConflict: 'user_id' });

        if (error && error.code !== '42P01') throw error;

        return NextResponse.json({
          success: true,
          message: 'Appearance settings reset to defaults',
          settings: defaultAppearanceSettings
        });
      }

      case 'privacy': {
        const { error } = await supabase
          .from('user_profiles')
          .update({
            ...defaultPrivacySettings,
            updated_at: timestamp
          })
          .eq('user_id', user.id);

        if (error && error.code !== '42P01') throw error;

        return NextResponse.json({
          success: true,
          message: 'Privacy settings reset to defaults',
          settings: defaultPrivacySettings
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown category: ${category}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    logger.error('Settings reset error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reset settings' },
      { status: 500 }
    );
  }
}

// =====================================================
// GET - Get default settings values
// =====================================================
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    if (category) {
      switch (category) {
        case 'notifications':
          return NextResponse.json({ success: true, defaults: defaultNotificationSettings });
        case 'security':
          return NextResponse.json({ success: true, defaults: defaultSecuritySettings });
        case 'appearance':
          return NextResponse.json({ success: true, defaults: defaultAppearanceSettings });
        case 'privacy':
          return NextResponse.json({ success: true, defaults: defaultPrivacySettings });
        default:
          return NextResponse.json(
            { success: false, error: `Unknown category: ${category}` },
            { status: 400 }
          );
      }
    }

    return NextResponse.json({
      success: true,
      defaults: {
        notifications: defaultNotificationSettings,
        security: defaultSecuritySettings,
        appearance: defaultAppearanceSettings,
        privacy: defaultPrivacySettings
      }
    });
  } catch (error: any) {
    logger.error('Get defaults error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get defaults' },
      { status: 500 }
    );
  }
}
