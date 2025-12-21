-- ============================================
-- SUPABASE 2025 UPDATE: Security Email Templates
-- Migration: 20251216000003_security_email_templates.sql
-- Features: Security notifications for auth events
-- Password changes, email modifications, MFA status
-- ============================================

-- ============================================
-- SECURITY EMAIL EVENTS TRACKING (2025 Feature)
-- ============================================
CREATE TABLE IF NOT EXISTS security_email_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Event details
    event_type TEXT NOT NULL CHECK (event_type IN (
        'password_change',
        'email_change',
        'phone_change',
        'mfa_enrolled',
        'mfa_unenrolled',
        'identity_linked',
        'identity_unlinked',
        'new_device_login',
        'suspicious_login',
        'account_locked',
        'account_unlocked',
        'session_revoked',
        'api_key_created',
        'api_key_revoked'
    )),
    event_status TEXT NOT NULL DEFAULT 'pending' CHECK (event_status IN (
        'pending', 'email_sent', 'email_failed', 'acknowledged'
    )),

    -- Context
    ip_address INET,
    user_agent TEXT,
    device_fingerprint TEXT,
    location JSONB, -- { country, city, region }

    -- Change details
    old_value TEXT, -- Hashed or masked for security
    new_value TEXT, -- Hashed or masked for security
    metadata JSONB DEFAULT '{}',

    -- Email tracking
    email_sent_at TIMESTAMPTZ,
    email_template_id TEXT,
    email_error TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ
);

-- ============================================
-- EMAIL TEMPLATE CONFIGURATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS security_email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Template identification
    template_key TEXT UNIQUE NOT NULL,
    template_name TEXT NOT NULL,
    event_type TEXT NOT NULL,

    -- Email content
    subject_template TEXT NOT NULL,
    html_template TEXT NOT NULL,
    text_template TEXT,

    -- Configuration
    is_active BOOLEAN DEFAULT true,
    priority TEXT DEFAULT 'high' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    send_delay_seconds INTEGER DEFAULT 0, -- Delay before sending (for undo)

    -- Customization
    custom_styles JSONB DEFAULT '{}',
    include_device_info BOOLEAN DEFAULT true,
    include_location_info BOOLEAN DEFAULT true,
    include_action_buttons BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER SECURITY PREFERENCES
-- ============================================
CREATE TABLE IF NOT EXISTS user_security_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Email notification preferences
    notify_password_change BOOLEAN DEFAULT true,
    notify_email_change BOOLEAN DEFAULT true,
    notify_phone_change BOOLEAN DEFAULT true,
    notify_mfa_change BOOLEAN DEFAULT true,
    notify_new_device BOOLEAN DEFAULT true,
    notify_suspicious_activity BOOLEAN DEFAULT true,
    notify_identity_changes BOOLEAN DEFAULT true,

    -- Security settings
    require_mfa_for_sensitive BOOLEAN DEFAULT false,
    session_timeout_minutes INTEGER DEFAULT 60,
    max_sessions INTEGER DEFAULT 5,

    -- Recovery options
    recovery_email TEXT,
    recovery_phone TEXT,
    trusted_devices JSONB DEFAULT '[]',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- KNOWN DEVICES TRACKING
-- ============================================
CREATE TABLE IF NOT EXISTS user_known_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Device identification
    device_fingerprint TEXT NOT NULL,
    device_name TEXT,
    device_type TEXT, -- desktop, mobile, tablet
    browser TEXT,
    os TEXT,

    -- Trust status
    is_trusted BOOLEAN DEFAULT false,
    trust_level TEXT DEFAULT 'unknown' CHECK (trust_level IN (
        'unknown', 'recognized', 'trusted', 'blocked'
    )),

    -- Usage tracking
    first_seen_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    login_count INTEGER DEFAULT 1,

    -- Location
    last_ip_address INET,
    last_location JSONB,

    UNIQUE(user_id, device_fingerprint)
);

-- ============================================
-- INSERT DEFAULT EMAIL TEMPLATES
-- ============================================
INSERT INTO security_email_templates (template_key, template_name, event_type, subject_template, html_template, text_template)
VALUES
    -- Password Change
    ('password_changed', 'Password Changed Alert', 'password_change',
     'Security Alert: Your password was changed',
     E'<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">🔐 Password Changed</h1>
    </div>
    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
        <p>Hi {{user_name}},</p>
        <p>Your KAZI account password was successfully changed.</p>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>When:</strong> {{event_time}}</p>
            {{#if device_info}}<p><strong>Device:</strong> {{device_info}}</p>{{/if}}
            {{#if location}}<p><strong>Location:</strong> {{location}}</p>{{/if}}
        </div>
        <p style="color: #dc3545;"><strong>If you didn''t make this change</strong>, please secure your account immediately:</p>
        <a href="{{reset_url}}" style="display: inline-block; background: #dc3545; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 10px 0;">Reset Password Now</a>
        <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
        <p style="color: #6c757d; font-size: 12px;">This is an automated security notification from KAZI. If you have questions, contact support.</p>
    </div>
</body>
</html>',
     E'Password Changed\n\nHi {{user_name}},\n\nYour KAZI account password was changed on {{event_time}}.\n\nIf you didn''t make this change, reset your password immediately: {{reset_url}}'
    ),

    -- Email Change
    ('email_changed', 'Email Address Changed Alert', 'email_change',
     'Security Alert: Your email address was changed',
     E'<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">📧 Email Changed</h1>
    </div>
    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
        <p>Hi {{user_name}},</p>
        <p>The email address associated with your KAZI account was changed.</p>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Old Email:</strong> {{old_email}}</p>
            <p><strong>New Email:</strong> {{new_email}}</p>
            <p><strong>When:</strong> {{event_time}}</p>
        </div>
        <p style="color: #dc3545;"><strong>Didn''t make this change?</strong></p>
        <a href="{{support_url}}" style="display: inline-block; background: #dc3545; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Contact Support</a>
    </div>
</body>
</html>',
     E'Email Address Changed\n\nYour email was changed from {{old_email}} to {{new_email}} on {{event_time}}.\n\nIf you didn''t make this change, contact support: {{support_url}}'
    ),

    -- MFA Enrolled
    ('mfa_enrolled', 'Two-Factor Authentication Enabled', 'mfa_enrolled',
     'Security Update: Two-factor authentication enabled',
     E'<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">🛡️ 2FA Enabled</h1>
    </div>
    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
        <p>Hi {{user_name}},</p>
        <p>Great news! Two-factor authentication has been enabled on your KAZI account.</p>
        <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <p style="margin: 0; color: #155724;"><strong>✓ Your account is now more secure</strong></p>
        </div>
        <p><strong>Method:</strong> {{mfa_method}}</p>
        <p><strong>When:</strong> {{event_time}}</p>
        <p>Make sure to save your recovery codes in a safe place.</p>
    </div>
</body>
</html>',
     E'Two-Factor Authentication Enabled\n\nHi {{user_name}},\n\n2FA has been enabled on your account using {{mfa_method}} on {{event_time}}.\n\nRemember to save your recovery codes!'
    ),

    -- MFA Unenrolled
    ('mfa_unenrolled', 'Two-Factor Authentication Disabled', 'mfa_unenrolled',
     'Security Alert: Two-factor authentication disabled',
     E'<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">⚠️ 2FA Disabled</h1>
    </div>
    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
        <p>Hi {{user_name}},</p>
        <p>Two-factor authentication has been <strong>disabled</strong> on your KAZI account.</p>
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404;"><strong>⚠️ Your account is now less secure</strong></p>
        </div>
        <p><strong>When:</strong> {{event_time}}</p>
        <p>We strongly recommend re-enabling 2FA to protect your account.</p>
        <a href="{{security_settings_url}}" style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Security Settings</a>
    </div>
</body>
</html>',
     E'Two-Factor Authentication Disabled\n\nHi {{user_name}},\n\n2FA has been disabled on your account on {{event_time}}.\n\nWe recommend re-enabling it: {{security_settings_url}}'
    ),

    -- New Device Login
    ('new_device_login', 'New Device Sign-In', 'new_device_login',
     'New sign-in to your KAZI account',
     E'<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">🔔 New Sign-In</h1>
    </div>
    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
        <p>Hi {{user_name}},</p>
        <p>We noticed a new sign-in to your KAZI account.</p>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Device:</strong> {{device_info}}</p>
            <p><strong>Location:</strong> {{location}}</p>
            <p><strong>IP Address:</strong> {{ip_address}}</p>
            <p><strong>Time:</strong> {{event_time}}</p>
        </div>
        <p><strong>Was this you?</strong></p>
        <a href="{{confirm_url}}" style="display: inline-block; background: #28a745; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-right: 10px;">Yes, it was me</a>
        <a href="{{secure_url}}" style="display: inline-block; background: #dc3545; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">No, secure my account</a>
    </div>
</body>
</html>',
     E'New Sign-In Detected\n\nHi {{user_name}},\n\nNew sign-in from {{device_info}} in {{location}} on {{event_time}}.\n\nNot you? Secure your account: {{secure_url}}'
    ),

    -- Identity Linked
    ('identity_linked', 'New Identity Provider Linked', 'identity_linked',
     'New sign-in method added to your account',
     E'<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">🔗 Account Linked</h1>
    </div>
    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
        <p>Hi {{user_name}},</p>
        <p>A new sign-in method has been linked to your KAZI account.</p>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Provider:</strong> {{provider_name}}</p>
            <p><strong>Email:</strong> {{provider_email}}</p>
            <p><strong>When:</strong> {{event_time}}</p>
        </div>
        <p>You can now sign in using {{provider_name}}.</p>
    </div>
</body>
</html>',
     E'Account Linked\n\n{{provider_name}} has been linked to your KAZI account on {{event_time}}.'
    ),

    -- Phone Change
    ('phone_changed', 'Phone Number Changed Alert', 'phone_change',
     'Security Alert: Your phone number was changed',
     E'<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">📱 Phone Changed</h1>
    </div>
    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
        <p>Hi {{user_name}},</p>
        <p>The phone number on your KAZI account was changed.</p>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>When:</strong> {{event_time}}</p>
            {{#if device_info}}<p><strong>Device:</strong> {{device_info}}</p>{{/if}}
        </div>
        <p style="color: #dc3545;"><strong>If you didn''t make this change</strong>, contact support immediately.</p>
    </div>
</body>
</html>',
     E'Phone Number Changed\n\nYour phone number was changed on {{event_time}}.\n\nIf you didn''t make this change, contact support.'
    )
ON CONFLICT (template_key) DO UPDATE SET
    html_template = EXCLUDED.html_template,
    text_template = EXCLUDED.text_template,
    updated_at = NOW();

-- ============================================
-- SECURITY EVENT TRIGGERS
-- ============================================

-- Function to log security email event
CREATE OR REPLACE FUNCTION log_security_email_event(
    p_user_id UUID,
    p_event_type TEXT,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_old_value TEXT DEFAULT NULL,
    p_new_value TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO security_email_events (
        user_id, event_type, ip_address, user_agent,
        old_value, new_value, metadata
    )
    VALUES (
        p_user_id, p_event_type, p_ip_address, p_user_agent,
        p_old_value, p_new_value, p_metadata
    )
    RETURNING id INTO event_id;

    RETURN event_id;
END;
$$;

-- Function to mark security email as sent (called by edge function or webhook)
CREATE OR REPLACE FUNCTION mark_security_email_sent(
    p_event_id UUID,
    p_template_id TEXT,
    p_error TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE security_email_events
    SET
        event_status = CASE WHEN p_error IS NULL THEN 'email_sent' ELSE 'email_failed' END,
        email_sent_at = CASE WHEN p_error IS NULL THEN NOW() ELSE NULL END,
        email_template_id = p_template_id,
        email_error = p_error
    WHERE id = p_event_id;
END;
$$;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_security_email_events_user ON security_email_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_email_events_type ON security_email_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_email_events_status ON security_email_events(event_status);
CREATE INDEX IF NOT EXISTS idx_security_email_events_created ON security_email_events(created_at);

CREATE INDEX IF NOT EXISTS idx_user_known_devices_user ON user_known_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_known_devices_fingerprint ON user_known_devices(device_fingerprint);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE security_email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_security_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_known_devices ENABLE ROW LEVEL SECURITY;

-- Security email events - users see their own
CREATE POLICY "Users view own security email events"
ON security_email_events FOR SELECT
USING (auth.uid() = user_id);

-- Email templates - read-only for all (managed via admin API)
CREATE POLICY "Anyone can read email templates"
ON security_email_templates FOR SELECT
USING (true);

-- Security preferences - users manage their own
CREATE POLICY "Users manage own security preferences"
ON user_security_preferences FOR ALL
USING (auth.uid() = user_id);

-- Known devices - users manage their own
CREATE POLICY "Users manage own devices"
ON user_known_devices FOR ALL
USING (auth.uid() = user_id);

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE security_email_events IS 'Security event logging for email notifications - Supabase 2025 Feature';
COMMENT ON TABLE security_email_templates IS 'Email templates for security notifications';
COMMENT ON TABLE user_security_preferences IS 'User preferences for security notifications';
COMMENT ON TABLE user_known_devices IS 'Known/trusted devices for user accounts';
COMMENT ON FUNCTION log_security_email_event IS 'Log a security event and trigger email notification';
