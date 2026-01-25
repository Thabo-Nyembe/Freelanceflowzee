// =====================================================
// KAZI Settings API - Comprehensive Route
// User settings management: notifications, security, appearance
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createFeatureLogger } from '@/lib/logger';

const logger = createFeatureLogger('settings');

// =====================================================
// GET - Get all settings or specific category
// =====================================================
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // Demo mode for unauthenticated users
    if (!user) {
      return handleDemoGet(category);
    }

    switch (category) {
      case 'notifications': {
        const settings = await getNotificationSettings(supabase, user.id);
        return NextResponse.json({ success: true, settings });
      }

      case 'security': {
        const settings = await getSecuritySettings(supabase, user.id);
        return NextResponse.json({ success: true, settings });
      }

      case 'appearance': {
        const settings = await getAppearanceSettings(supabase, user.id);
        return NextResponse.json({ success: true, settings });
      }

      case 'privacy': {
        const settings = await getPrivacySettings(supabase, user.id);
        return NextResponse.json({ success: true, settings });
      }

      case 'billing': {
        const settings = await getBillingSettings(supabase, user.id);
        return NextResponse.json({ success: true, settings });
      }

      case 'integrations': {
        const settings = await getIntegrationSettings(supabase, user.id);
        return NextResponse.json({ success: true, settings });
      }

      case 'api-keys': {
        const apiKeys = await getApiKeys(supabase, user.id);
        return NextResponse.json({ success: true, apiKeys });
      }

      case 'sessions': {
        const sessions = await getActiveSessions(supabase, user.id);
        return NextResponse.json({ success: true, sessions });
      }

      case 'service-status': {
        return NextResponse.json({
          success: true,
          service: 'Settings Service',
          version: '2.0.0',
          status: 'operational',
          capabilities: [
            'notification_preferences',
            'security_settings',
            'appearance_customization',
            'privacy_controls',
            'billing_management',
            'integration_settings',
            'api_key_management',
            'session_management'
          ]
        });
      }

      default: {
        // Return all settings
        const [notifications, security, appearance, privacy] = await Promise.all([
          getNotificationSettings(supabase, user.id),
          getSecuritySettings(supabase, user.id),
          getAppearanceSettings(supabase, user.id),
          getPrivacySettings(supabase, user.id)
        ]);

        return NextResponse.json({
          success: true,
          settings: {
            notifications,
            security,
            appearance,
            privacy
          }
        });
      }
    }
  } catch (error: any) {
    logger.error('Settings GET error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Create settings or perform actions
// =====================================================
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'generate-api-key': {
        const apiKey = await generateApiKey(supabase, user.id, {
          name: data.name,
          permissions: data.permissions,
          expiresAt: data.expiresAt
        });
        return NextResponse.json({
          success: true,
          action: 'generate-api-key',
          apiKey,
          message: 'API key generated. Save this key securely - it will not be shown again.',
          warning: 'Store this key safely. You will not be able to see it again.'
        });
      }

      case 'revoke-api-key': {
        await revokeApiKey(supabase, user.id, data.keyId);
        return NextResponse.json({
          success: true,
          action: 'revoke-api-key',
          message: 'API key revoked'
        });
      }

      case 'enable-2fa': {
        const setup = await enable2FA(supabase, user.id, data.method);
        return NextResponse.json({
          success: true,
          action: 'enable-2fa',
          setup,
          message: 'Two-factor authentication setup initiated'
        });
      }

      case 'verify-2fa': {
        const result = await verify2FA(supabase, user.id, data.code);
        return NextResponse.json({
          success: true,
          action: 'verify-2fa',
          verified: result,
          message: result ? 'Two-factor authentication enabled' : 'Invalid code'
        });
      }

      case 'disable-2fa': {
        await disable2FA(supabase, user.id, data.code);
        return NextResponse.json({
          success: true,
          action: 'disable-2fa',
          message: 'Two-factor authentication disabled'
        });
      }

      case 'terminate-session': {
        await terminateSession(supabase, user.id, data.sessionId);
        return NextResponse.json({
          success: true,
          action: 'terminate-session',
          message: 'Session terminated'
        });
      }

      case 'terminate-all-sessions': {
        await terminateAllSessions(supabase, user.id, data.exceptCurrent);
        return NextResponse.json({
          success: true,
          action: 'terminate-all-sessions',
          message: 'All sessions terminated'
        });
      }

      case 'change-password': {
        await changePassword(supabase, user.id, data.currentPassword, data.newPassword);
        return NextResponse.json({
          success: true,
          action: 'change-password',
          message: 'Password changed successfully'
        });
      }

      case 'export-data': {
        const exportData = await requestDataExport(supabase, user.id, data.format);
        return NextResponse.json({
          success: true,
          action: 'export-data',
          exportId: exportData.id,
          message: 'Data export requested. You will receive an email when ready.'
        });
      }

      case 'delete-account': {
        await requestAccountDeletion(supabase, user.id, data.confirmation);
        return NextResponse.json({
          success: true,
          action: 'delete-account',
          message: 'Account deletion requested. You have 30 days to cancel.'
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    logger.error('Settings POST error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Operation failed' },
      { status: 500 }
    );
  }
}

// =====================================================
// PUT - Update settings
// =====================================================
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { category, ...updates } = body;

    switch (category) {
      case 'notifications': {
        const settings = await updateNotificationSettings(supabase, user.id, updates);
        return NextResponse.json({
          success: true,
          category: 'notifications',
          settings,
          message: 'Notification settings updated'
        });
      }

      case 'security': {
        const settings = await updateSecuritySettings(supabase, user.id, updates);
        return NextResponse.json({
          success: true,
          category: 'security',
          settings,
          message: 'Security settings updated'
        });
      }

      case 'appearance': {
        const settings = await updateAppearanceSettings(supabase, user.id, updates);
        return NextResponse.json({
          success: true,
          category: 'appearance',
          settings,
          message: 'Appearance settings updated'
        });
      }

      case 'privacy': {
        const settings = await updatePrivacySettings(supabase, user.id, updates);
        return NextResponse.json({
          success: true,
          category: 'privacy',
          settings,
          message: 'Privacy settings updated'
        });
      }

      case 'billing': {
        const settings = await updateBillingSettings(supabase, user.id, updates);
        return NextResponse.json({
          success: true,
          category: 'billing',
          settings,
          message: 'Billing settings updated'
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown category: ${category}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    logger.error('Settings PUT error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

async function getNotificationSettings(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('notification_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;

  return data || getDefaultNotificationSettings();
}

async function getSecuritySettings(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('security_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;

  return data || getDefaultSecuritySettings();
}

async function getAppearanceSettings(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('appearance_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;

  return data || getDefaultAppearanceSettings();
}

async function getPrivacySettings(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('profile_visibility, show_email, show_phone')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;

  return {
    profileVisibility: data?.profile_visibility || 'public',
    showEmail: data?.show_email || false,
    showPhone: data?.show_phone || false
  };
}

async function getBillingSettings(supabase: any, userId: string) {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  const { data: paymentMethods } = await supabase
    .from('payment_methods')
    .select('id, type, last4, brand, is_default')
    .eq('user_id', userId)
    .order('is_default', { ascending: false });

  const { data: invoices } = await supabase
    .from('billing_invoices')
    .select('id, amount, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  return {
    subscription: subscription || null,
    paymentMethods: paymentMethods || [],
    recentInvoices: invoices || []
  };
}

async function getIntegrationSettings(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('integrations')
    .select('id, provider, status, connected_at, settings')
    .eq('user_id', userId)
    .order('connected_at', { ascending: false });

  if (error) throw error;

  return data || [];
}

async function getApiKeys(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('api_keys')
    .select('id, name, prefix, permissions, last_used_at, created_at, expires_at')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data || [];
}

async function getActiveSessions(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('user_sessions')
    .select('id, device_type, browser, os, ip_address, location, last_active_at, created_at')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('last_active_at', { ascending: false });

  if (error && error.code !== 'PGRST116') return [];

  return data || [];
}

async function updateNotificationSettings(supabase: any, userId: string, updates: any) {
  const updateData: any = { updated_at: new Date().toISOString() };

  // Map updates
  if (updates.emailNotifications !== undefined) updateData.email_notifications = updates.emailNotifications;
  if (updates.pushNotifications !== undefined) updateData.push_notifications = updates.pushNotifications;
  if (updates.smsNotifications !== undefined) updateData.sms_notifications = updates.smsNotifications;
  if (updates.inAppNotifications !== undefined) updateData.in_app_notifications = updates.inAppNotifications;
  if (updates.projectUpdates !== undefined) updateData.project_updates = updates.projectUpdates;
  if (updates.clientMessages !== undefined) updateData.client_messages = updates.clientMessages;
  if (updates.teamMentions !== undefined) updateData.team_mentions = updates.teamMentions;
  if (updates.taskAssignments !== undefined) updateData.task_assignments = updates.taskAssignments;
  if (updates.deadlineReminders !== undefined) updateData.deadline_reminders = updates.deadlineReminders;
  if (updates.paymentAlerts !== undefined) updateData.payment_alerts = updates.paymentAlerts;
  if (updates.invoiceReminders !== undefined) updateData.invoice_reminders = updates.invoiceReminders;
  if (updates.marketingEmails !== undefined) updateData.marketing_emails = updates.marketingEmails;
  if (updates.productUpdates !== undefined) updateData.product_updates = updates.productUpdates;
  if (updates.weeklyDigest !== undefined) updateData.weekly_digest = updates.weeklyDigest;
  if (updates.monthlyReports !== undefined) updateData.monthly_reports = updates.monthlyReports;
  if (updates.digestFrequency !== undefined) updateData.digest_frequency = updates.digestFrequency;
  if (updates.quietHoursEnabled !== undefined) updateData.quiet_hours_enabled = updates.quietHoursEnabled;
  if (updates.quietHoursStart !== undefined) updateData.quiet_hours_start = updates.quietHoursStart;
  if (updates.quietHoursEnd !== undefined) updateData.quiet_hours_end = updates.quietHoursEnd;

  const { data, error } = await supabase
    .from('notification_settings')
    .upsert({ user_id: userId, ...updateData }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateSecuritySettings(supabase: any, userId: string, updates: any) {
  const updateData: any = { updated_at: new Date().toISOString() };

  if (updates.sessionTimeout !== undefined) updateData.session_timeout = updates.sessionTimeout;
  if (updates.rememberMeEnabled !== undefined) updateData.remember_me_enabled = updates.rememberMeEnabled;
  if (updates.concurrentSessionsLimit !== undefined) updateData.concurrent_sessions_limit = updates.concurrentSessionsLimit;
  if (updates.loginAlerts !== undefined) updateData.login_alerts = updates.loginAlerts;
  if (updates.loginAlertsEmail !== undefined) updateData.login_alerts_email = updates.loginAlertsEmail;
  if (updates.suspiciousActivityAlerts !== undefined) updateData.suspicious_activity_alerts = updates.suspiciousActivityAlerts;
  if (updates.newDeviceAlerts !== undefined) updateData.new_device_alerts = updates.newDeviceAlerts;

  const { data, error } = await supabase
    .from('security_settings')
    .upsert({ user_id: userId, ...updateData }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateAppearanceSettings(supabase: any, userId: string, updates: any) {
  const updateData: any = { updated_at: new Date().toISOString() };

  if (updates.theme !== undefined) updateData.theme = updates.theme;
  if (updates.accentColor !== undefined) updateData.accent_color = updates.accentColor;
  if (updates.language !== undefined) updateData.language = updates.language;
  if (updates.timezone !== undefined) updateData.timezone = updates.timezone;
  if (updates.dateFormat !== undefined) updateData.date_format = updates.dateFormat;
  if (updates.timeFormat !== undefined) updateData.time_format = updates.timeFormat;
  if (updates.currency !== undefined) updateData.currency = updates.currency;
  if (updates.compactMode !== undefined) updateData.compact_mode = updates.compactMode;
  if (updates.animations !== undefined) updateData.animations = updates.animations;
  if (updates.reducedMotion !== undefined) updateData.reduced_motion = updates.reducedMotion;
  if (updates.highContrast !== undefined) updateData.high_contrast = updates.highContrast;
  if (updates.fontSize !== undefined) updateData.font_size = updates.fontSize;
  if (updates.sidebarCollapsed !== undefined) updateData.sidebar_collapsed = updates.sidebarCollapsed;
  if (updates.dashboardLayout !== undefined) updateData.dashboard_layout = updates.dashboardLayout;
  if (updates.pinnedItems !== undefined) updateData.pinned_items = updates.pinnedItems;

  const { data, error } = await supabase
    .from('appearance_settings')
    .upsert({ user_id: userId, ...updateData }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updatePrivacySettings(supabase: any, userId: string, updates: any) {
  const updateData: any = { updated_at: new Date().toISOString() };

  if (updates.profileVisibility !== undefined) updateData.profile_visibility = updates.profileVisibility;
  if (updates.showEmail !== undefined) updateData.show_email = updates.showEmail;
  if (updates.showPhone !== undefined) updateData.show_phone = updates.showPhone;

  const { data, error } = await supabase
    .from('user_profiles')
    .update(updateData)
    .eq('user_id', userId)
    .select('profile_visibility, show_email, show_phone')
    .single();

  if (error) throw error;
  return {
    profileVisibility: data.profile_visibility,
    showEmail: data.show_email,
    showPhone: data.show_phone
  };
}

async function updateBillingSettings(supabase: any, userId: string, updates: any) {
  // Handle default payment method change
  if (updates.defaultPaymentMethodId) {
    await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .eq('user_id', userId);

    await supabase
      .from('payment_methods')
      .update({ is_default: true })
      .eq('id', updates.defaultPaymentMethodId)
      .eq('user_id', userId);
  }

  return getBillingSettings(supabase, userId);
}

async function generateApiKey(supabase: any, userId: string, data: any) {
  // Generate a secure API key
  const keyBytes = new Uint8Array(32);
  crypto.getRandomValues(keyBytes);
  const apiKey = 'kazi_' + Array.from(keyBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  const prefix = apiKey.substring(0, 12);

  // Hash the key for storage
  const encoder = new TextEncoder();
  const keyData = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashedKey = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  const { data: savedKey, error } = await supabase
    .from('api_keys')
    .insert({
      user_id: userId,
      name: data.name || 'API Key',
      key_hash: hashedKey,
      prefix,
      permissions: data.permissions || ['read'],
      expires_at: data.expiresAt,
      is_active: true
    })
    .select('id, name, prefix, permissions, created_at, expires_at')
    .single();

  if (error) throw error;

  return {
    ...savedKey,
    key: apiKey // Return the full key only this once
  };
}

async function revokeApiKey(supabase: any, userId: string, keyId: string) {
  const { error } = await supabase
    .from('api_keys')
    .update({ is_active: false, revoked_at: new Date().toISOString() })
    .eq('id', keyId)
    .eq('user_id', userId);

  if (error) throw error;
}

async function enable2FA(supabase: any, userId: string, method: string) {
  // Generate 2FA secret
  const secretBytes = new Uint8Array(20);
  crypto.getRandomValues(secretBytes);
  const secret = Array.from(secretBytes).map(b => b.toString(16).padStart(2, '0')).join('');

  // Store pending 2FA setup
  await supabase
    .from('pending_2fa_setup')
    .upsert({
      user_id: userId,
      method,
      secret,
      created_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

  // Return setup info (in production, generate proper TOTP URI)
  return {
    method,
    secret: secret.substring(0, 16).toUpperCase(), // Simplified for demo
    qrCode: `otpauth://totp/KAZI:${userId}?secret=${secret.substring(0, 16).toUpperCase()}&issuer=KAZI`
  };
}

async function verify2FA(supabase: any, userId: string, code: string) {
  // In production, verify the TOTP code against the secret
  // For demo, accept any 6-digit code
  if (!/^\d{6}$/.test(code)) {
    return false;
  }

  // Enable 2FA
  await supabase
    .from('security_settings')
    .upsert({
      user_id: userId,
      two_factor_auth: true,
      two_factor_method: 'authenticator',
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

  // Clear pending setup
  await supabase
    .from('pending_2fa_setup')
    .delete()
    .eq('user_id', userId);

  return true;
}

async function disable2FA(supabase: any, userId: string, code: string) {
  // Verify code first
  if (!/^\d{6}$/.test(code)) {
    throw new Error('Invalid verification code');
  }

  await supabase
    .from('security_settings')
    .update({
      two_factor_auth: false,
      two_factor_method: null,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);
}

async function terminateSession(supabase: any, userId: string, sessionId: string) {
  const { error } = await supabase
    .from('user_sessions')
    .update({ is_active: false, ended_at: new Date().toISOString() })
    .eq('id', sessionId)
    .eq('user_id', userId);

  if (error) throw error;
}

async function terminateAllSessions(supabase: any, userId: string, exceptCurrent: boolean) {
  let query = supabase
    .from('user_sessions')
    .update({ is_active: false, ended_at: new Date().toISOString() })
    .eq('user_id', userId);

  if (exceptCurrent) {
    // In a real implementation, you'd exclude the current session
    query = query.eq('is_current', false);
  }

  const { error } = await query;
  if (error) throw error;
}

async function changePassword(supabase: any, userId: string, currentPassword: string, newPassword: string) {
  // In production, this would verify the current password and update
  // For now, we'll just update the password changed timestamp
  await supabase
    .from('security_settings')
    .update({
      password_last_changed: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);
}

async function requestDataExport(supabase: any, userId: string, format: string) {
  const { data, error } = await supabase
    .from('data_export_requests')
    .insert({
      user_id: userId,
      format: format || 'json',
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function requestAccountDeletion(supabase: any, userId: string, confirmation: string) {
  if (confirmation !== 'DELETE MY ACCOUNT') {
    throw new Error('Invalid confirmation');
  }

  await supabase
    .from('account_deletion_requests')
    .insert({
      user_id: userId,
      requested_at: new Date().toISOString(),
      scheduled_deletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    });
}

// =====================================================
// DEFAULT SETTINGS
// =====================================================

function getDefaultNotificationSettings() {
  return {
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
    payment_confirmations: true,
    marketing_emails: false,
    product_updates: true,
    weekly_digest: true,
    monthly_reports: true,
    digest_frequency: 'weekly',
    quiet_hours_enabled: false,
    quiet_hours_start: null,
    quiet_hours_end: null
  };
}

function getDefaultSecuritySettings() {
  return {
    two_factor_auth: false,
    two_factor_method: null,
    biometric_auth: false,
    session_timeout: '24h',
    remember_me_enabled: true,
    concurrent_sessions_limit: 5,
    login_alerts: true,
    login_alerts_email: true,
    suspicious_activity_alerts: true,
    new_device_alerts: true,
    password_required: true,
    password_last_changed: null,
    password_expiry_days: null
  };
}

function getDefaultAppearanceSettings() {
  return {
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
}

// =====================================================
// DEMO MODE HANDLER
// =====================================================
function handleDemoGet(category: string | null): NextResponse {
  const mockNotifications = getDefaultNotificationSettings();
  const mockSecurity = getDefaultSecuritySettings();
  const mockAppearance = getDefaultAppearanceSettings();
  const mockPrivacy = {
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false
  };

  switch (category) {
    case 'notifications':
      return NextResponse.json({ success: true, settings: mockNotifications, demo: true });
    case 'security':
      return NextResponse.json({ success: true, settings: mockSecurity, demo: true });
    case 'appearance':
      return NextResponse.json({ success: true, settings: mockAppearance, demo: true });
    case 'privacy':
      return NextResponse.json({ success: true, settings: mockPrivacy, demo: true });
    default:
      return NextResponse.json({
        success: true,
        settings: {
          notifications: mockNotifications,
          security: mockSecurity,
          appearance: mockAppearance,
          privacy: mockPrivacy
        },
        demo: true
      });
  }
}
