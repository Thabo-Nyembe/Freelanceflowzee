-- =====================================================
-- PHASE 5.4: WHITE-LABEL MULTI-TENANCY
-- Complete multi-tenant infrastructure for FreeFlow
-- Competes with: Shopify Partners, Webflow Enterprise,
-- Monday.com White-Label, Freshworks Neo
-- =====================================================

-- =====================================================
-- TABLE: tenants
-- Core tenant/organization table
-- =====================================================
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  display_name TEXT,
  description TEXT,
  logo_url TEXT,
  favicon_url TEXT,

  -- Domains
  primary_domain TEXT NOT NULL,
  custom_domains TEXT[] DEFAULT '{}',

  -- Branding (JSON for flexibility)
  branding JSONB DEFAULT '{
    "primaryColor": "#3B82F6",
    "secondaryColor": "#1E40AF",
    "accentColor": "#10B981",
    "backgroundColor": "#FFFFFF",
    "textColor": "#1F2937",
    "darkMode": {
      "primaryColor": "#60A5FA",
      "secondaryColor": "#3B82F6",
      "accentColor": "#34D399",
      "backgroundColor": "#111827",
      "textColor": "#F9FAFB"
    },
    "fontFamily": "Inter, system-ui, sans-serif",
    "fontSize": "medium",
    "logoHeight": 40
  }'::jsonb,

  -- Features
  enabled_features TEXT[] DEFAULT '{}',
  feature_limits JSONB DEFAULT '{
    "maxUsers": 5,
    "maxProjects": 10,
    "maxStorage": 1024,
    "maxApiCalls": 10000,
    "maxIntegrations": 3,
    "maxCustomFields": 10,
    "maxAutomations": 5,
    "maxWebhooks": 3
  }'::jsonb,

  -- Subscription
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'business', 'enterprise', 'custom')),
  plan_start_date TIMESTAMPTZ DEFAULT now(),
  plan_end_date TIMESTAMPTZ,
  billing_email TEXT,

  -- Settings
  settings JSONB DEFAULT '{
    "timezone": "UTC",
    "dateFormat": "YYYY-MM-DD",
    "timeFormat": "24h",
    "currency": "USD",
    "language": "en",
    "requireMfa": false,
    "allowedAuthMethods": ["email", "google"],
    "sessionTimeout": 30,
    "passwordPolicy": {
      "minLength": 8,
      "requireUppercase": true,
      "requireNumbers": true,
      "requireSymbols": false,
      "maxAge": 0
    },
    "emailNotifications": true,
    "dataRetentionDays": 365,
    "gdprCompliant": true,
    "hipaaCompliant": false,
    "enabledIntegrations": [],
    "apiEnabled": true,
    "webhooksEnabled": true,
    "removeWatermarks": false
  }'::jsonb,

  -- Status
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('active', 'suspended', 'trial', 'cancelled')),
  trial_ends_at TIMESTAMPTZ,

  -- Stats
  user_count INTEGER DEFAULT 0,
  storage_used_mb DECIMAL(12, 2) DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- TABLE: tenant_users
-- User memberships in tenants
-- =====================================================
CREATE TABLE IF NOT EXISTS tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Role and permissions
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'manager', 'member', 'viewer', 'custom')),
  permissions TEXT[] DEFAULT '{}',

  -- Invitation
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,

  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended')),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(tenant_id, user_id)
);

-- =====================================================
-- TABLE: tenant_invites
-- Pending invitations
-- =====================================================
CREATE TABLE IF NOT EXISTS tenant_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  permissions TEXT[] DEFAULT '{}',

  invited_by UUID NOT NULL REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,

  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),

  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(tenant_id, email)
);

-- =====================================================
-- TABLE: domain_verifications
-- Custom domain verification and SSL
-- =====================================================
CREATE TABLE IF NOT EXISTS domain_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  domain TEXT NOT NULL UNIQUE,

  -- Verification
  verification_method TEXT NOT NULL DEFAULT 'dns_txt' CHECK (verification_method IN ('dns_txt', 'dns_cname', 'file')),
  verification_token TEXT NOT NULL,
  verified_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed')),

  -- DNS records to add
  dns_records JSONB DEFAULT '[]'::jsonb,

  -- SSL
  ssl_status TEXT NOT NULL DEFAULT 'pending' CHECK (ssl_status IN ('pending', 'active', 'failed', 'expired')),
  ssl_expires_at TIMESTAMPTZ,
  ssl_certificate TEXT, -- Encrypted

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- TABLE: tenant_themes
-- Custom branding themes
-- =====================================================
CREATE TABLE IF NOT EXISTS tenant_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  branding JSONB NOT NULL,

  is_active BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- TABLE: tenant_api_keys
-- API keys for tenant integrations
-- =====================================================
CREATE TABLE IF NOT EXISTS tenant_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  key_hash TEXT NOT NULL, -- Hashed API key
  key_prefix TEXT NOT NULL, -- First 8 chars for display

  -- Permissions
  permissions TEXT[] DEFAULT '{}',
  scopes TEXT[] DEFAULT '{}',

  -- Rate limiting
  rate_limit INTEGER DEFAULT 1000, -- requests per hour
  rate_limit_window INTEGER DEFAULT 3600, -- seconds

  -- Usage
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- TABLE: tenant_webhooks
-- Webhook configurations
-- =====================================================
CREATE TABLE IF NOT EXISTS tenant_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT, -- For signature verification

  -- Events to trigger on
  events TEXT[] NOT NULL DEFAULT '{}',

  -- Headers
  headers JSONB DEFAULT '{}'::jsonb,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Health
  last_triggered_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  failure_count INTEGER DEFAULT 0,
  consecutive_failures INTEGER DEFAULT 0,

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- TABLE: tenant_webhook_logs
-- Webhook delivery logs
-- =====================================================
CREATE TABLE IF NOT EXISTS tenant_webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES tenant_webhooks(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Event
  event_type TEXT NOT NULL,
  event_id UUID,
  payload JSONB NOT NULL,

  -- Delivery
  attempt_count INTEGER DEFAULT 1,
  response_status INTEGER,
  response_body TEXT,
  response_time_ms INTEGER,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'retrying')),
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  delivered_at TIMESTAMPTZ
);

-- =====================================================
-- TABLE: tenant_audit_logs
-- Comprehensive audit trail
-- =====================================================
CREATE TABLE IF NOT EXISTS tenant_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),

  -- Action
  action TEXT NOT NULL, -- create, update, delete, login, logout, etc.
  resource_type TEXT NOT NULL, -- user, project, invoice, etc.
  resource_id UUID,

  -- Details
  description TEXT,
  changes JSONB, -- { field: { old: value, new: value } }
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Context
  ip_address INET,
  user_agent TEXT,
  session_id UUID,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- TABLE: tenant_sso_configs
-- SSO/SAML/OIDC configurations
-- =====================================================
CREATE TABLE IF NOT EXISTS tenant_sso_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Provider type
  provider_type TEXT NOT NULL CHECK (provider_type IN ('saml', 'oidc', 'google', 'microsoft', 'okta')),
  provider_name TEXT NOT NULL,

  -- SAML config
  saml_entity_id TEXT,
  saml_sso_url TEXT,
  saml_certificate TEXT,
  saml_metadata_url TEXT,

  -- OIDC config
  oidc_client_id TEXT,
  oidc_client_secret TEXT, -- Encrypted
  oidc_discovery_url TEXT,
  oidc_scopes TEXT[] DEFAULT '{"openid", "email", "profile"}',

  -- Mapping
  attribute_mapping JSONB DEFAULT '{
    "email": "email",
    "firstName": "given_name",
    "lastName": "family_name"
  }'::jsonb,

  -- Settings
  auto_provision_users BOOLEAN DEFAULT true,
  default_role TEXT DEFAULT 'member',
  require_sso BOOLEAN DEFAULT false,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(tenant_id, provider_type)
);

-- =====================================================
-- TABLE: tenant_billing
-- Billing and subscription management
-- =====================================================
CREATE TABLE IF NOT EXISTS tenant_billing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Stripe integration
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,

  -- Plan details
  plan TEXT NOT NULL,
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  price_per_month DECIMAL(10, 2),

  -- Addons
  addon_users INTEGER DEFAULT 0, -- Extra users beyond plan
  addon_storage INTEGER DEFAULT 0, -- Extra storage in MB

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'cancelled', 'paused')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,

  -- Payment
  payment_method_last4 TEXT,
  payment_method_brand TEXT,
  payment_method_exp TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- TABLE: tenant_invoices
-- Billing invoices
-- =====================================================
CREATE TABLE IF NOT EXISTS tenant_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Stripe
  stripe_invoice_id TEXT UNIQUE,

  -- Invoice details
  invoice_number TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  tax DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,

  -- Period
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  -- Line items
  line_items JSONB DEFAULT '[]'::jsonb,

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  paid_at TIMESTAMPTZ,

  -- PDF
  invoice_pdf_url TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- TABLE: tenant_usage
-- Usage tracking for billing
-- =====================================================
CREATE TABLE IF NOT EXISTS tenant_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Metrics
  active_users INTEGER DEFAULT 0,
  api_calls INTEGER DEFAULT 0,
  storage_mb DECIMAL(12, 2) DEFAULT 0,
  bandwidth_mb DECIMAL(12, 2) DEFAULT 0,
  projects_created INTEGER DEFAULT 0,
  tasks_created INTEGER DEFAULT 0,
  invoices_created INTEGER DEFAULT 0,
  automations_run INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(tenant_id, period_start)
);

-- =====================================================
-- TABLE: tenant_data_exports
-- Data export requests (GDPR compliance)
-- =====================================================
CREATE TABLE IF NOT EXISTS tenant_data_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES auth.users(id),

  -- Export details
  export_type TEXT NOT NULL CHECK (export_type IN ('full', 'user', 'project')),
  target_id UUID, -- User or project ID if not full export

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired')),
  progress INTEGER DEFAULT 0, -- 0-100

  -- Files
  download_url TEXT,
  expires_at TIMESTAMPTZ,
  file_size_mb DECIMAL(10, 2),

  -- Metadata
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- tenants indexes
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_primary_domain ON tenants(primary_domain);
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_plan ON tenants(plan);
CREATE INDEX idx_tenants_created ON tenants(created_at DESC);

-- tenant_users indexes
CREATE INDEX idx_tenant_users_tenant ON tenant_users(tenant_id);
CREATE INDEX idx_tenant_users_user ON tenant_users(user_id);
CREATE INDEX idx_tenant_users_role ON tenant_users(tenant_id, role);
CREATE INDEX idx_tenant_users_status ON tenant_users(status);

-- tenant_invites indexes
CREATE INDEX idx_tenant_invites_tenant ON tenant_invites(tenant_id);
CREATE INDEX idx_tenant_invites_email ON tenant_invites(email);
CREATE INDEX idx_tenant_invites_status ON tenant_invites(status) WHERE status = 'pending';

-- domain_verifications indexes
CREATE INDEX idx_domain_verifications_tenant ON domain_verifications(tenant_id);
CREATE INDEX idx_domain_verifications_domain ON domain_verifications(domain);
CREATE INDEX idx_domain_verifications_status ON domain_verifications(status);

-- tenant_themes indexes
CREATE INDEX idx_tenant_themes_tenant ON tenant_themes(tenant_id);
CREATE INDEX idx_tenant_themes_active ON tenant_themes(tenant_id) WHERE is_active = true;

-- tenant_api_keys indexes
CREATE INDEX idx_tenant_api_keys_tenant ON tenant_api_keys(tenant_id);
CREATE INDEX idx_tenant_api_keys_prefix ON tenant_api_keys(key_prefix);
CREATE INDEX idx_tenant_api_keys_active ON tenant_api_keys(is_active) WHERE is_active = true;

-- tenant_webhooks indexes
CREATE INDEX idx_tenant_webhooks_tenant ON tenant_webhooks(tenant_id);
CREATE INDEX idx_tenant_webhooks_active ON tenant_webhooks(is_active) WHERE is_active = true;

-- tenant_webhook_logs indexes
CREATE INDEX idx_tenant_webhook_logs_webhook ON tenant_webhook_logs(webhook_id);
CREATE INDEX idx_tenant_webhook_logs_tenant ON tenant_webhook_logs(tenant_id);
CREATE INDEX idx_tenant_webhook_logs_status ON tenant_webhook_logs(status);
CREATE INDEX idx_tenant_webhook_logs_created ON tenant_webhook_logs(created_at DESC);

-- tenant_audit_logs indexes
CREATE INDEX idx_tenant_audit_logs_tenant ON tenant_audit_logs(tenant_id);
CREATE INDEX idx_tenant_audit_logs_user ON tenant_audit_logs(user_id);
CREATE INDEX idx_tenant_audit_logs_action ON tenant_audit_logs(action);
CREATE INDEX idx_tenant_audit_logs_resource ON tenant_audit_logs(resource_type, resource_id);
CREATE INDEX idx_tenant_audit_logs_created ON tenant_audit_logs(created_at DESC);

-- tenant_sso_configs indexes
CREATE INDEX idx_tenant_sso_configs_tenant ON tenant_sso_configs(tenant_id);
CREATE INDEX idx_tenant_sso_configs_provider ON tenant_sso_configs(provider_type);

-- tenant_billing indexes
CREATE INDEX idx_tenant_billing_tenant ON tenant_billing(tenant_id);
CREATE INDEX idx_tenant_billing_stripe_customer ON tenant_billing(stripe_customer_id);
CREATE INDEX idx_tenant_billing_status ON tenant_billing(status);

-- tenant_invoices indexes
CREATE INDEX idx_tenant_invoices_tenant ON tenant_invoices(tenant_id);
CREATE INDEX idx_tenant_invoices_stripe ON tenant_invoices(stripe_invoice_id);
CREATE INDEX idx_tenant_invoices_status ON tenant_invoices(status);
CREATE INDEX idx_tenant_invoices_period ON tenant_invoices(period_start, period_end);

-- tenant_usage indexes
CREATE INDEX idx_tenant_usage_tenant ON tenant_usage(tenant_id);
CREATE INDEX idx_tenant_usage_period ON tenant_usage(period_start, period_end);

-- tenant_data_exports indexes
CREATE INDEX idx_tenant_data_exports_tenant ON tenant_data_exports(tenant_id);
CREATE INDEX idx_tenant_data_exports_status ON tenant_data_exports(status);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to get tenant analytics
CREATE OR REPLACE FUNCTION get_tenant_analytics(
  p_tenant_id UUID,
  p_period TEXT DEFAULT 'month'
)
RETURNS JSONB AS $$
DECLARE
  v_start_date TIMESTAMPTZ;
  v_result JSONB;
BEGIN
  -- Calculate start date based on period
  v_start_date := CASE p_period
    WHEN 'day' THEN now() - INTERVAL '1 day'
    WHEN 'week' THEN now() - INTERVAL '1 week'
    WHEN 'month' THEN now() - INTERVAL '1 month'
    WHEN 'year' THEN now() - INTERVAL '1 year'
    ELSE now() - INTERVAL '1 month'
  END;

  SELECT jsonb_build_object(
    'tenantId', p_tenant_id,
    'period', p_period,
    'startDate', v_start_date,
    'endDate', now(),
    'users', (
      SELECT jsonb_build_object(
        'total', COUNT(*),
        'active', COUNT(*) FILTER (WHERE status = 'active'),
        'new', COUNT(*) FILTER (WHERE created_at >= v_start_date),
        'churned', 0 -- Would need historical data
      )
      FROM tenant_users WHERE tenant_id = p_tenant_id
    ),
    'activity', (
      SELECT jsonb_build_object(
        'logins', COUNT(*) FILTER (WHERE action = 'login'),
        'pageViews', COUNT(*) FILTER (WHERE action = 'page_view'),
        'apiCalls', COUNT(*) FILTER (WHERE action = 'api_call'),
        'projectsCreated', COUNT(*) FILTER (WHERE action = 'create' AND resource_type = 'project'),
        'tasksCompleted', COUNT(*) FILTER (WHERE action = 'complete' AND resource_type = 'task'),
        'invoicesSent', COUNT(*) FILTER (WHERE action = 'send' AND resource_type = 'invoice')
      )
      FROM tenant_audit_logs
      WHERE tenant_id = p_tenant_id AND created_at >= v_start_date
    ),
    'storage', (
      SELECT jsonb_build_object(
        'usedMb', storage_used_mb,
        'limitMb', (feature_limits->>'maxStorage')::numeric,
        'filesUploaded', 0 -- Would need file tracking
      )
      FROM tenants WHERE id = p_tenant_id
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function to check tenant feature limit
CREATE OR REPLACE FUNCTION check_tenant_limit(
  p_tenant_id UUID,
  p_resource TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_tenant RECORD;
  v_limit INTEGER;
  v_used INTEGER;
BEGIN
  SELECT * INTO v_tenant FROM tenants WHERE id = p_tenant_id;

  IF v_tenant IS NULL THEN
    RETURN jsonb_build_object('error', 'Tenant not found');
  END IF;

  -- Get limit from feature_limits
  v_limit := (v_tenant.feature_limits->>(
    CASE p_resource
      WHEN 'users' THEN 'maxUsers'
      WHEN 'projects' THEN 'maxProjects'
      WHEN 'storage' THEN 'maxStorage'
      WHEN 'api_calls' THEN 'maxApiCalls'
      WHEN 'integrations' THEN 'maxIntegrations'
      WHEN 'automations' THEN 'maxAutomations'
      WHEN 'webhooks' THEN 'maxWebhooks'
      ELSE 'maxUsers'
    END
  ))::integer;

  -- Get current usage
  v_used := CASE p_resource
    WHEN 'users' THEN v_tenant.user_count
    WHEN 'storage' THEN v_tenant.storage_used_mb::integer
    ELSE 0
  END;

  RETURN jsonb_build_object(
    'resource', p_resource,
    'limit', v_limit,
    'used', v_used,
    'exceeded', v_limit > 0 AND v_used >= v_limit
  );
END;
$$ LANGUAGE plpgsql;

-- Function to log audit event
CREATE OR REPLACE FUNCTION log_tenant_audit(
  p_tenant_id UUID,
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_changes JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO tenant_audit_logs (
    tenant_id, user_id, action, resource_type, resource_id,
    description, changes, ip_address, user_agent
  ) VALUES (
    p_tenant_id, p_user_id, p_action, p_resource_type, p_resource_id,
    p_description, p_changes, p_ip_address, p_user_agent
  ) RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update tenant stats
CREATE OR REPLACE FUNCTION update_tenant_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'tenant_users' THEN
    UPDATE tenants
    SET user_count = (
      SELECT COUNT(*) FROM tenant_users
      WHERE tenant_id = COALESCE(NEW.tenant_id, OLD.tenant_id)
      AND status = 'active'
    ),
    updated_at = now()
    WHERE id = COALESCE(NEW.tenant_id, OLD.tenant_id);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to expire invites
CREATE OR REPLACE FUNCTION expire_tenant_invites()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  WITH updated AS (
    UPDATE tenant_invites
    SET status = 'expired'
    WHERE status = 'pending' AND expires_at < now()
    RETURNING id
  )
  SELECT COUNT(*) INTO v_count FROM updated;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to update tenant stats on user changes
CREATE TRIGGER trg_update_tenant_user_stats
  AFTER INSERT OR UPDATE OR DELETE ON tenant_users
  FOR EACH ROW
  EXECUTE FUNCTION update_tenant_stats();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_sso_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_data_exports ENABLE ROW LEVEL SECURITY;

-- tenants policies
CREATE POLICY "Tenant members can view their tenant"
  ON tenants FOR SELECT
  USING (
    id IN (
      SELECT tenant_id FROM tenant_users
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Tenant owners can update their tenant"
  ON tenants FOR UPDATE
  USING (
    id IN (
      SELECT tenant_id FROM tenant_users
      WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
    )
  );

-- tenant_users policies
CREATE POLICY "Tenant members can view other members"
  ON tenant_users FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Tenant admins can manage users"
  ON tenant_users FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
    )
  );

-- tenant_invites policies
CREATE POLICY "Tenant admins can manage invites"
  ON tenant_invites FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
    )
  );

-- domain_verifications policies
CREATE POLICY "Tenant admins can manage domains"
  ON domain_verifications FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
    )
  );

-- tenant_themes policies
CREATE POLICY "Tenant members can view themes"
  ON tenant_themes FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Tenant admins can manage themes"
  ON tenant_themes FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
    )
  );

-- tenant_api_keys policies
CREATE POLICY "Tenant admins can manage API keys"
  ON tenant_api_keys FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
    )
  );

-- tenant_webhooks policies
CREATE POLICY "Tenant admins can manage webhooks"
  ON tenant_webhooks FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
    )
  );

-- tenant_webhook_logs policies
CREATE POLICY "Tenant admins can view webhook logs"
  ON tenant_webhook_logs FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
    )
  );

-- tenant_audit_logs policies
CREATE POLICY "Tenant admins can view audit logs"
  ON tenant_audit_logs FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
    )
  );

-- tenant_sso_configs policies
CREATE POLICY "Tenant owners can manage SSO"
  ON tenant_sso_configs FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users
      WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
    )
  );

-- tenant_billing policies
CREATE POLICY "Tenant owners can view billing"
  ON tenant_billing FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users
      WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
    )
  );

-- tenant_invoices policies
CREATE POLICY "Tenant owners can view invoices"
  ON tenant_invoices FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users
      WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
    )
  );

-- tenant_usage policies
CREATE POLICY "Tenant admins can view usage"
  ON tenant_usage FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
    )
  );

-- tenant_data_exports policies
CREATE POLICY "Tenant admins can manage exports"
  ON tenant_data_exports FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
    )
  );

-- =====================================================
-- ADD tenant_id TO EXISTING TABLES
-- =====================================================

-- Add tenant_id to projects if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE projects ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    CREATE INDEX idx_projects_tenant ON projects(tenant_id);
  END IF;
END $$;

-- Add tenant_id to tasks if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE tasks ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    CREATE INDEX idx_tasks_tenant ON tasks(tenant_id);
  END IF;
END $$;

-- Add tenant_id to invoices if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE invoices ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    CREATE INDEX idx_invoices_tenant ON invoices(tenant_id);
  END IF;
END $$;

-- Add tenant_id to clients if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE clients ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    CREATE INDEX idx_clients_tenant ON clients(tenant_id);
  END IF;
END $$;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE tenants IS 'Multi-tenant organizations with white-label support';
COMMENT ON TABLE tenant_users IS 'User memberships in tenants with roles and permissions';
COMMENT ON TABLE tenant_invites IS 'Pending user invitations to tenants';
COMMENT ON TABLE domain_verifications IS 'Custom domain verification and SSL management';
COMMENT ON TABLE tenant_themes IS 'Custom branding themes for white-label';
COMMENT ON TABLE tenant_api_keys IS 'API keys for tenant integrations';
COMMENT ON TABLE tenant_webhooks IS 'Webhook configurations for event notifications';
COMMENT ON TABLE tenant_webhook_logs IS 'Webhook delivery attempt logs';
COMMENT ON TABLE tenant_audit_logs IS 'Comprehensive audit trail for compliance';
COMMENT ON TABLE tenant_sso_configs IS 'SSO/SAML/OIDC configurations for enterprise auth';
COMMENT ON TABLE tenant_billing IS 'Billing and subscription information';
COMMENT ON TABLE tenant_invoices IS 'Billing invoices for tenants';
COMMENT ON TABLE tenant_usage IS 'Usage tracking for billing and limits';
COMMENT ON TABLE tenant_data_exports IS 'GDPR-compliant data export requests';
