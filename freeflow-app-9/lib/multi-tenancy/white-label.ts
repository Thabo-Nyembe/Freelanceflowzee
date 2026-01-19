// =====================================================
// PHASE 5.4: WHITE-LABEL MULTI-TENANCY
// Complete multi-tenant white-label platform
// Competes with: Shopify Partners, Webflow Enterprise,
// Monday.com White-Label, Freshworks Neo
// =====================================================

import { createClient } from '@/lib/supabase/client';

// =====================================================
// TYPES
// =====================================================

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  displayName: string;
  description?: string;
  logoUrl?: string;
  faviconUrl?: string;

  // Domains
  primaryDomain: string;
  customDomains: string[];

  // Branding
  branding: TenantBranding;

  // Features
  enabledFeatures: string[];
  featureLimits: FeatureLimits;

  // Subscription
  plan: TenantPlan;
  planStartDate: string;
  planEndDate?: string;
  billingEmail?: string;

  // Settings
  settings: TenantSettings;

  // Status
  status: 'active' | 'suspended' | 'trial' | 'cancelled';
  trialEndsAt?: string;

  // Stats
  userCount: number;
  storageUsedMb: number;

  // Metadata
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface TenantBranding {
  // Colors
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;

  // Dark mode
  darkMode: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
  };

  // Typography
  fontFamily: string;
  headingFontFamily?: string;
  fontSize: 'small' | 'medium' | 'large';

  // Logo
  logoUrl?: string;
  logoDarkUrl?: string;
  logoHeight: number;

  // Favicon
  faviconUrl?: string;

  // Social
  socialShareImage?: string;

  // Email
  emailLogoUrl?: string;
  emailFooterText?: string;
  emailFromName?: string;
  emailFromAddress?: string;

  // Custom CSS
  customCss?: string;

  // Login page
  loginBackgroundUrl?: string;
  loginTitle?: string;
  loginSubtitle?: string;

  // Footer
  footerText?: string;
  footerLinks?: { label: string; url: string }[];
  hidePoweredBy?: boolean;
}

export interface FeatureLimits {
  maxUsers: number;
  maxProjects: number;
  maxStorage: number; // MB
  maxApiCalls: number; // per month
  maxIntegrations: number;
  maxCustomFields: number;
  maxAutomations: number;
  maxWebhooks: number;
}

export type TenantPlan =
  | 'starter'
  | 'professional'
  | 'business'
  | 'enterprise'
  | 'custom';

export interface TenantSettings {
  // General
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  language: string;

  // Security
  requireMfa: boolean;
  allowedAuthMethods: ('email' | 'google' | 'microsoft' | 'saml' | 'oidc')[];
  sessionTimeout: number; // minutes
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    maxAge: number; // days, 0 = never expires
  };
  ipWhitelist?: string[];

  // Notifications
  emailNotifications: boolean;
  slackIntegration?: {
    webhookUrl: string;
    channel: string;
  };

  // Privacy
  dataRetentionDays: number;
  gdprCompliant: boolean;
  hipaaCompliant: boolean;

  // Customization
  customTermsUrl?: string;
  customPrivacyUrl?: string;
  customSupportEmail?: string;
  customSupportUrl?: string;

  // Integrations
  enabledIntegrations: string[];

  // API
  apiEnabled: boolean;
  webhooksEnabled: boolean;

  // White-label specific
  removeWatermarks: boolean;
  customEmailDomain?: string;
  customSmtp?: {
    host: string;
    port: number;
    username: string;
    password: string;
    secure: boolean;
  };
}

export interface TenantUser {
  id: string;
  tenantId: string;
  userId: string;
  role: TenantRole;
  permissions: string[];
  invitedBy?: string;
  invitedAt?: string;
  acceptedAt?: string;
  status: 'pending' | 'active' | 'suspended';
  metadata: Record<string, unknown>;
  createdAt: string;
}

export type TenantRole =
  | 'owner'
  | 'admin'
  | 'manager'
  | 'member'
  | 'viewer'
  | 'custom';

export interface TenantInvite {
  id: string;
  tenantId: string;
  email: string;
  role: TenantRole;
  permissions?: string[];
  invitedBy: string;
  expiresAt: string;
  acceptedAt?: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  createdAt: string;
}

export interface DomainVerification {
  id: string;
  tenantId: string;
  domain: string;
  verificationMethod: 'dns_txt' | 'dns_cname' | 'file';
  verificationToken: string;
  verifiedAt?: string;
  status: 'pending' | 'verified' | 'failed';
  dnsRecords?: {
    type: string;
    name: string;
    value: string;
  }[];
  sslStatus: 'pending' | 'active' | 'failed';
  sslExpiresAt?: string;
  createdAt: string;
}

export interface TenantTheme {
  id: string;
  tenantId: string;
  name: string;
  branding: TenantBranding;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TenantAnalytics {
  tenantId: string;
  period: 'day' | 'week' | 'month' | 'year';
  startDate: string;
  endDate: string;

  users: {
    total: number;
    active: number;
    new: number;
    churned: number;
  };

  activity: {
    logins: number;
    pageViews: number;
    apiCalls: number;
    projectsCreated: number;
    tasksCompleted: number;
    invoicesSent: number;
  };

  storage: {
    usedMb: number;
    limitMb: number;
    filesUploaded: number;
  };

  revenue: {
    mrr: number;
    totalRevenue: number;
    invoicesPaid: number;
    invoicesOverdue: number;
  };
}

// =====================================================
// DEFAULT VALUES
// =====================================================

export const defaultBranding: TenantBranding = {
  primaryColor: '#3B82F6',
  secondaryColor: '#1E40AF',
  accentColor: '#10B981',
  backgroundColor: '#FFFFFF',
  textColor: '#1F2937',
  darkMode: {
    primaryColor: '#60A5FA',
    secondaryColor: '#3B82F6',
    accentColor: '#34D399',
    backgroundColor: '#111827',
    textColor: '#F9FAFB',
  },
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: 'medium',
  logoHeight: 40,
};

export const defaultSettings: TenantSettings = {
  timezone: 'UTC',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '24h',
  currency: 'USD',
  language: 'en',
  requireMfa: false,
  allowedAuthMethods: ['email', 'google'],
  sessionTimeout: 30,
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSymbols: false,
    maxAge: 0,
  },
  emailNotifications: true,
  dataRetentionDays: 365,
  gdprCompliant: true,
  hipaaCompliant: false,
  enabledIntegrations: [],
  apiEnabled: true,
  webhooksEnabled: true,
  removeWatermarks: false,
};

export const planLimits: Record<TenantPlan, FeatureLimits> = {
  starter: {
    maxUsers: 5,
    maxProjects: 10,
    maxStorage: 1024, // 1GB
    maxApiCalls: 10000,
    maxIntegrations: 3,
    maxCustomFields: 10,
    maxAutomations: 5,
    maxWebhooks: 3,
  },
  professional: {
    maxUsers: 25,
    maxProjects: 50,
    maxStorage: 10240, // 10GB
    maxApiCalls: 100000,
    maxIntegrations: 10,
    maxCustomFields: 50,
    maxAutomations: 25,
    maxWebhooks: 10,
  },
  business: {
    maxUsers: 100,
    maxProjects: 200,
    maxStorage: 102400, // 100GB
    maxApiCalls: 500000,
    maxIntegrations: 50,
    maxCustomFields: 200,
    maxAutomations: 100,
    maxWebhooks: 50,
  },
  enterprise: {
    maxUsers: -1, // unlimited
    maxProjects: -1,
    maxStorage: -1,
    maxApiCalls: -1,
    maxIntegrations: -1,
    maxCustomFields: -1,
    maxAutomations: -1,
    maxWebhooks: -1,
  },
  custom: {
    maxUsers: -1,
    maxProjects: -1,
    maxStorage: -1,
    maxApiCalls: -1,
    maxIntegrations: -1,
    maxCustomFields: -1,
    maxAutomations: -1,
    maxWebhooks: -1,
  },
};

// =====================================================
// WHITE-LABEL SERVICE
// =====================================================

export class WhiteLabelService {
  private supabase = createClient();
  private tenantCache = new Map<string, { tenant: Tenant; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  // =====================================================
  // TENANT MANAGEMENT
  // =====================================================

  async createTenant(data: {
    name: string;
    slug: string;
    plan: TenantPlan;
    ownerId: string;
    branding?: Partial<TenantBranding>;
    settings?: Partial<TenantSettings>;
  }): Promise<Tenant> {
    const { name, slug, plan, ownerId, branding = {}, settings = {} } = data;

    // Validate slug
    if (!/^[a-z0-9-]+$/.test(slug)) {
      throw new Error('Slug must contain only lowercase letters, numbers, and hyphens');
    }

    // Check if slug is taken
    const { data: existing } = await this.supabase
      .from('tenants')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      throw new Error('This slug is already taken');
    }

    // Create tenant
    const { data: tenant, error } = await this.supabase
      .from('tenants')
      .insert({
        name,
        slug,
        display_name: name,
        primary_domain: `${slug}.freeflow.io`,
        branding: { ...defaultBranding, ...branding },
        settings: { ...defaultSettings, ...settings },
        plan,
        feature_limits: planLimits[plan],
        enabled_features: this.getDefaultFeatures(plan),
        status: plan === 'starter' ? 'trial' : 'active',
        trial_ends_at: plan === 'starter'
          ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
          : null,
      })
      .select()
      .single();

    if (error) throw error;

    // Add owner as tenant user
    await this.addTenantUser(tenant.id, ownerId, 'owner');

    return this.mapTenantFromDb(tenant);
  }

  async getTenant(tenantId: string): Promise<Tenant | null> {
    // Check cache
    const cached = this.tenantCache.get(tenantId);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.tenant;
    }

    const { data, error } = await this.supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();

    if (error || !data) return null;

    const tenant = this.mapTenantFromDb(data);
    this.tenantCache.set(tenantId, { tenant, timestamp: Date.now() });

    return tenant;
  }

  async getTenantBySlug(slug: string): Promise<Tenant | null> {
    const { data, error } = await this.supabase
      .from('tenants')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) return null;
    return this.mapTenantFromDb(data);
  }

  async getTenantByDomain(domain: string): Promise<Tenant | null> {
    // Check primary domain
    let { data } = await this.supabase
      .from('tenants')
      .select('*')
      .eq('primary_domain', domain)
      .single();

    if (data) return this.mapTenantFromDb(data);

    // Check custom domains
    const { data: verification } = await this.supabase
      .from('domain_verifications')
      .select('tenant_id')
      .eq('domain', domain)
      .eq('status', 'verified')
      .single();

    if (verification) {
      return this.getTenant(verification.tenant_id);
    }

    return null;
  }

  async updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<Tenant> {
    const { data, error } = await this.supabase
      .from('tenants')
      .update({
        name: updates.name,
        display_name: updates.displayName,
        description: updates.description,
        logo_url: updates.logoUrl,
        favicon_url: updates.faviconUrl,
        branding: updates.branding,
        settings: updates.settings,
        enabled_features: updates.enabledFeatures,
        metadata: updates.metadata,
        updated_at: new Date().toISOString(),
      })
      .eq('id', tenantId)
      .select()
      .single();

    if (error) throw error;

    // Clear cache
    this.tenantCache.delete(tenantId);

    return this.mapTenantFromDb(data);
  }

  async deleteTenant(tenantId: string): Promise<void> {
    const { error } = await this.supabase
      .from('tenants')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', tenantId);

    if (error) throw error;

    // Clear cache
    this.tenantCache.delete(tenantId);
  }

  async listTenants(options: {
    userId?: string;
    status?: string;
    plan?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ tenants: Tenant[]; total: number }> {
    let query = this.supabase.from('tenants').select('*', { count: 'exact' });

    if (options.userId) {
      // Get tenants where user is a member
      const { data: memberships } = await this.supabase
        .from('tenant_users')
        .select('tenant_id')
        .eq('user_id', options.userId)
        .eq('status', 'active');

      const tenantIds = memberships?.map(m => m.tenant_id) || [];
      query = query.in('id', tenantIds);
    }

    if (options.status) {
      query = query.eq('status', options.status);
    }

    if (options.plan) {
      query = query.eq('plan', options.plan);
    }

    if (options.search) {
      query = query.or(`name.ilike.%${options.search}%,slug.ilike.%${options.search}%`);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(options.offset || 0, (options.offset || 0) + (options.limit || 20) - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      tenants: (data || []).map(this.mapTenantFromDb),
      total: count || 0,
    };
  }

  // =====================================================
  // TENANT USERS
  // =====================================================

  async addTenantUser(
    tenantId: string,
    userId: string,
    role: TenantRole,
    permissions?: string[],
    invitedBy?: string
  ): Promise<TenantUser> {
    // Check limits
    const tenant = await this.getTenant(tenantId);
    if (!tenant) throw new Error('Tenant not found');

    if (tenant.featureLimits.maxUsers > 0) {
      const { count } = await this.supabase
        .from('tenant_users')
        .select('id', { count: 'exact' })
        .eq('tenant_id', tenantId)
        .eq('status', 'active');

      if ((count || 0) >= tenant.featureLimits.maxUsers) {
        throw new Error('User limit reached for this plan');
      }
    }

    const { data, error } = await this.supabase
      .from('tenant_users')
      .insert({
        tenant_id: tenantId,
        user_id: userId,
        role,
        permissions: permissions || this.getDefaultPermissions(role),
        invited_by: invitedBy,
        invited_at: invitedBy ? new Date().toISOString() : null,
        accepted_at: invitedBy ? null : new Date().toISOString(),
        status: invitedBy ? 'pending' : 'active',
      })
      .select()
      .single();

    if (error) throw error;

    // Update user count
    await this.updateTenantStats(tenantId);

    return this.mapTenantUserFromDb(data);
  }

  async updateTenantUser(
    tenantId: string,
    userId: string,
    updates: Partial<TenantUser>
  ): Promise<TenantUser> {
    const { data, error } = await this.supabase
      .from('tenant_users')
      .update({
        role: updates.role,
        permissions: updates.permissions,
        status: updates.status,
      })
      .eq('tenant_id', tenantId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return this.mapTenantUserFromDb(data);
  }

  async removeTenantUser(tenantId: string, userId: string): Promise<void> {
    // Prevent removing last owner
    const { data: owners } = await this.supabase
      .from('tenant_users')
      .select('user_id')
      .eq('tenant_id', tenantId)
      .eq('role', 'owner')
      .eq('status', 'active');

    if (owners?.length === 1 && owners[0].user_id === userId) {
      throw new Error('Cannot remove the last owner');
    }

    const { error } = await this.supabase
      .from('tenant_users')
      .delete()
      .eq('tenant_id', tenantId)
      .eq('user_id', userId);

    if (error) throw error;

    // Update user count
    await this.updateTenantStats(tenantId);
  }

  async getTenantUsers(tenantId: string): Promise<TenantUser[]> {
    const { data, error } = await this.supabase
      .from('tenant_users')
      .select('*, users(email, name, avatar_url)')
      .eq('tenant_id', tenantId)
      .order('created_at');

    if (error) throw error;
    return (data || []).map(this.mapTenantUserFromDb);
  }

  async getUserTenants(userId: string): Promise<{ tenant: Tenant; role: TenantRole }[]> {
    const { data, error } = await this.supabase
      .from('tenant_users')
      .select('*, tenants(*)')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error) throw error;

    return (data || []).map(tu => ({
      tenant: this.mapTenantFromDb(tu.tenants),
      role: tu.role as TenantRole,
    }));
  }

  // =====================================================
  // INVITES
  // =====================================================

  async createInvite(
    tenantId: string,
    email: string,
    role: TenantRole,
    invitedBy: string,
    permissions?: string[]
  ): Promise<TenantInvite> {
    // Check if user is already a member
    const { data: existing } = await this.supabase
      .from('tenant_users')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('user_id', email)
      .single();

    if (existing) {
      throw new Error('User is already a member');
    }

    // Check for pending invite
    const { data: pendingInvite } = await this.supabase
      .from('tenant_invites')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('email', email)
      .eq('status', 'pending')
      .single();

    if (pendingInvite) {
      throw new Error('An invite is already pending for this email');
    }

    const { data, error } = await this.supabase
      .from('tenant_invites')
      .insert({
        tenant_id: tenantId,
        email,
        role,
        permissions: permissions || this.getDefaultPermissions(role),
        invited_by: invitedBy,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // TODO: Send invite email

    return this.mapInviteFromDb(data);
  }

  async acceptInvite(inviteId: string, userId: string): Promise<void> {
    const { data: invite, error: fetchError } = await this.supabase
      .from('tenant_invites')
      .select('*')
      .eq('id', inviteId)
      .single();

    if (fetchError || !invite) {
      throw new Error('Invite not found');
    }

    if (invite.status !== 'pending') {
      throw new Error('Invite is no longer valid');
    }

    if (new Date(invite.expires_at) < new Date()) {
      throw new Error('Invite has expired');
    }

    // Add user to tenant
    await this.addTenantUser(
      invite.tenant_id,
      userId,
      invite.role,
      invite.permissions,
      invite.invited_by
    );

    // Update invite
    await this.supabase
      .from('tenant_invites')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', inviteId);
  }

  async cancelInvite(inviteId: string): Promise<void> {
    await this.supabase
      .from('tenant_invites')
      .update({ status: 'cancelled' })
      .eq('id', inviteId);
  }

  // =====================================================
  // DOMAINS
  // =====================================================

  async addCustomDomain(tenantId: string, domain: string): Promise<DomainVerification> {
    // Validate domain format
    if (!/^[a-zA-Z0-9][a-zA-Z0-9-_.]+[a-zA-Z0-9]$/.test(domain)) {
      throw new Error('Invalid domain format');
    }

    // Check if domain is already used
    const { data: existing } = await this.supabase
      .from('domain_verifications')
      .select('id')
      .eq('domain', domain)
      .single();

    if (existing) {
      throw new Error('Domain is already in use');
    }

    // Generate verification token
    const verificationToken = this.generateVerificationToken();

    const { data, error } = await this.supabase
      .from('domain_verifications')
      .insert({
        tenant_id: tenantId,
        domain,
        verification_method: 'dns_txt',
        verification_token: verificationToken,
        dns_records: [
          {
            type: 'TXT',
            name: `_freeflow-verify.${domain}`,
            value: verificationToken,
          },
          {
            type: 'CNAME',
            name: domain,
            value: 'custom.freeflow.io',
          },
        ],
        status: 'pending',
        ssl_status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapDomainFromDb(data);
  }

  async verifyDomain(verificationId: string): Promise<DomainVerification> {
    const { data: verification, error: fetchError } = await this.supabase
      .from('domain_verifications')
      .select('*')
      .eq('id', verificationId)
      .single();

    if (fetchError || !verification) {
      throw new Error('Verification not found');
    }

    // In production, this would check DNS records
    // For now, we'll simulate verification
    const isVerified = await this.checkDnsRecords(
      verification.domain,
      verification.verification_token
    );

    if (!isVerified) {
      await this.supabase
        .from('domain_verifications')
        .update({ status: 'failed' })
        .eq('id', verificationId);

      throw new Error('DNS verification failed. Please ensure the TXT record is set correctly.');
    }

    const { data, error } = await this.supabase
      .from('domain_verifications')
      .update({
        status: 'verified',
        verified_at: new Date().toISOString(),
        ssl_status: 'active', // In production, this would trigger SSL provisioning
      })
      .eq('id', verificationId)
      .select()
      .single();

    if (error) throw error;

    // Add to tenant's custom domains
    const tenant = await this.getTenant(verification.tenant_id);
    if (tenant) {
      await this.updateTenant(verification.tenant_id, {
        customDomains: [...(tenant.customDomains || []), verification.domain],
      });
    }

    return this.mapDomainFromDb(data);
  }

  async removeDomain(tenantId: string, domain: string): Promise<void> {
    await this.supabase
      .from('domain_verifications')
      .delete()
      .eq('tenant_id', tenantId)
      .eq('domain', domain);

    // Remove from tenant's custom domains
    const tenant = await this.getTenant(tenantId);
    if (tenant) {
      await this.updateTenant(tenantId, {
        customDomains: (tenant.customDomains || []).filter(d => d !== domain),
      });
    }
  }

  // =====================================================
  // THEMES
  // =====================================================

  async createTheme(
    tenantId: string,
    name: string,
    branding: TenantBranding
  ): Promise<TenantTheme> {
    const { data, error } = await this.supabase
      .from('tenant_themes')
      .insert({
        tenant_id: tenantId,
        name,
        branding,
        is_active: false,
        is_default: false,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapThemeFromDb(data);
  }

  async updateTheme(themeId: string, updates: Partial<TenantTheme>): Promise<TenantTheme> {
    const { data, error } = await this.supabase
      .from('tenant_themes')
      .update({
        name: updates.name,
        branding: updates.branding,
        updated_at: new Date().toISOString(),
      })
      .eq('id', themeId)
      .select()
      .single();

    if (error) throw error;
    return this.mapThemeFromDb(data);
  }

  async activateTheme(tenantId: string, themeId: string): Promise<void> {
    // Deactivate all other themes
    await this.supabase
      .from('tenant_themes')
      .update({ is_active: false })
      .eq('tenant_id', tenantId);

    // Activate the selected theme
    const { data: theme } = await this.supabase
      .from('tenant_themes')
      .update({ is_active: true })
      .eq('id', themeId)
      .select()
      .single();

    // Apply branding to tenant
    if (theme) {
      await this.updateTenant(tenantId, {
        branding: theme.branding,
      });
    }
  }

  async getTenantThemes(tenantId: string): Promise<TenantTheme[]> {
    const { data, error } = await this.supabase
      .from('tenant_themes')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at');

    if (error) throw error;
    return (data || []).map(this.mapThemeFromDb);
  }

  // =====================================================
  // ANALYTICS
  // =====================================================

  async getTenantAnalytics(
    tenantId: string,
    period: 'day' | 'week' | 'month' | 'year' = 'month'
  ): Promise<TenantAnalytics> {
    const { data, error } = await this.supabase
      .rpc('get_tenant_analytics', {
        p_tenant_id: tenantId,
        p_period: period,
      });

    if (error) throw error;
    return data;
  }

  // =====================================================
  // PLAN MANAGEMENT
  // =====================================================

  async upgradePlan(tenantId: string, newPlan: TenantPlan): Promise<Tenant> {
    const { data, error } = await this.supabase
      .from('tenants')
      .update({
        plan: newPlan,
        feature_limits: planLimits[newPlan],
        enabled_features: this.getDefaultFeatures(newPlan),
        status: 'active',
        trial_ends_at: null,
        plan_start_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', tenantId)
      .select()
      .single();

    if (error) throw error;

    // Clear cache
    this.tenantCache.delete(tenantId);

    return this.mapTenantFromDb(data);
  }

  async checkLimits(tenantId: string, resource: keyof FeatureLimits): Promise<{
    used: number;
    limit: number;
    exceeded: boolean;
  }> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) throw new Error('Tenant not found');

    const limit = tenant.featureLimits[resource];
    let used = 0;

    switch (resource) {
      case 'maxUsers':
        const { count: userCount } = await this.supabase
          .from('tenant_users')
          .select('id', { count: 'exact' })
          .eq('tenant_id', tenantId)
          .eq('status', 'active');
        used = userCount || 0;
        break;
      case 'maxProjects':
        const { count: projectCount } = await this.supabase
          .from('projects')
          .select('id', { count: 'exact' })
          .eq('tenant_id', tenantId);
        used = projectCount || 0;
        break;
      case 'maxStorage':
        used = tenant.storageUsedMb;
        break;
      // Add other resource checks as needed
    }

    return {
      used,
      limit: limit === -1 ? Infinity : limit,
      exceeded: limit !== -1 && used >= limit,
    };
  }

  // =====================================================
  // HELPERS
  // =====================================================

  private getDefaultFeatures(plan: TenantPlan): string[] {
    const baseFeatures = [
      'projects',
      'tasks',
      'invoices',
      'clients',
      'time_tracking',
      'file_storage',
      'basic_reports',
    ];

    switch (plan) {
      case 'starter':
        return baseFeatures;
      case 'professional':
        return [
          ...baseFeatures,
          'advanced_reports',
          'integrations',
          'automations',
          'custom_fields',
          'team_management',
        ];
      case 'business':
        return [
          ...baseFeatures,
          'advanced_reports',
          'integrations',
          'automations',
          'custom_fields',
          'team_management',
          'api_access',
          'webhooks',
          'sso',
          'audit_logs',
          'priority_support',
        ];
      case 'enterprise':
      case 'custom':
        return [
          ...baseFeatures,
          'advanced_reports',
          'integrations',
          'automations',
          'custom_fields',
          'team_management',
          'api_access',
          'webhooks',
          'sso',
          'audit_logs',
          'priority_support',
          'white_label',
          'custom_domain',
          'dedicated_support',
          'sla',
          'hipaa_compliance',
        ];
    }
  }

  private getDefaultPermissions(role: TenantRole): string[] {
    switch (role) {
      case 'owner':
        return ['*'];
      case 'admin':
        return [
          'manage_users',
          'manage_settings',
          'manage_billing',
          'manage_integrations',
          'view_analytics',
          'manage_projects',
          'manage_clients',
        ];
      case 'manager':
        return [
          'manage_projects',
          'manage_clients',
          'view_analytics',
          'assign_tasks',
          'approve_time',
        ];
      case 'member':
        return [
          'view_projects',
          'manage_own_tasks',
          'log_time',
          'upload_files',
        ];
      case 'viewer':
        return ['view_projects', 'view_tasks', 'view_files'];
      default:
        return [];
    }
  }

  private generateVerificationToken(): string {
    return `freeflow-verify-${crypto.randomUUID()}`;
  }

  private async checkDnsRecords(domain: string, token: string): Promise<boolean> {
    // In production, this would use a DNS lookup service
    // For development, simulate verification
    return true;
  }

  private async updateTenantStats(tenantId: string): Promise<void> {
    const { count } = await this.supabase
      .from('tenant_users')
      .select('id', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .eq('status', 'active');

    await this.supabase
      .from('tenants')
      .update({
        user_count: count || 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', tenantId);
  }

  // =====================================================
  // MAPPERS
  // =====================================================

  private mapTenantFromDb(data: Record<string, unknown>): Tenant {
    return {
      id: data.id as string,
      slug: data.slug as string,
      name: data.name as string,
      displayName: (data.display_name || data.name) as string,
      description: data.description as string | undefined,
      logoUrl: data.logo_url as string | undefined,
      faviconUrl: data.favicon_url as string | undefined,
      primaryDomain: data.primary_domain as string,
      customDomains: (data.custom_domains || []) as string[],
      branding: (data.branding || defaultBranding) as TenantBranding,
      enabledFeatures: (data.enabled_features || []) as string[],
      featureLimits: (data.feature_limits || planLimits.starter) as FeatureLimits,
      plan: data.plan as TenantPlan,
      planStartDate: data.plan_start_date as string,
      planEndDate: data.plan_end_date as string | undefined,
      billingEmail: data.billing_email as string | undefined,
      settings: (data.settings || defaultSettings) as TenantSettings,
      status: data.status as Tenant['status'],
      trialEndsAt: data.trial_ends_at as string | undefined,
      userCount: (data.user_count || 0) as number,
      storageUsedMb: (data.storage_used_mb || 0) as number,
      metadata: (data.metadata || {}) as Record<string, unknown>,
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
    };
  }

  private mapTenantUserFromDb(data: Record<string, unknown>): TenantUser {
    return {
      id: data.id as string,
      tenantId: data.tenant_id as string,
      userId: data.user_id as string,
      role: data.role as TenantRole,
      permissions: (data.permissions || []) as string[],
      invitedBy: data.invited_by as string | undefined,
      invitedAt: data.invited_at as string | undefined,
      acceptedAt: data.accepted_at as string | undefined,
      status: data.status as TenantUser['status'],
      metadata: (data.metadata || {}) as Record<string, unknown>,
      createdAt: data.created_at as string,
    };
  }

  private mapInviteFromDb(data: Record<string, unknown>): TenantInvite {
    return {
      id: data.id as string,
      tenantId: data.tenant_id as string,
      email: data.email as string,
      role: data.role as TenantRole,
      permissions: data.permissions as string[] | undefined,
      invitedBy: data.invited_by as string,
      expiresAt: data.expires_at as string,
      acceptedAt: data.accepted_at as string | undefined,
      status: data.status as TenantInvite['status'],
      createdAt: data.created_at as string,
    };
  }

  private mapDomainFromDb(data: Record<string, unknown>): DomainVerification {
    return {
      id: data.id as string,
      tenantId: data.tenant_id as string,
      domain: data.domain as string,
      verificationMethod: data.verification_method as DomainVerification['verificationMethod'],
      verificationToken: data.verification_token as string,
      verifiedAt: data.verified_at as string | undefined,
      status: data.status as DomainVerification['status'],
      dnsRecords: data.dns_records as DomainVerification['dnsRecords'],
      sslStatus: data.ssl_status as DomainVerification['sslStatus'],
      sslExpiresAt: data.ssl_expires_at as string | undefined,
      createdAt: data.created_at as string,
    };
  }

  private mapThemeFromDb(data: Record<string, unknown>): TenantTheme {
    return {
      id: data.id as string,
      tenantId: data.tenant_id as string,
      name: data.name as string,
      branding: data.branding as TenantBranding,
      isActive: data.is_active as boolean,
      isDefault: data.is_default as boolean,
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
    };
  }
}

// Export singleton instance
export const whiteLabelService = new WhiteLabelService();
