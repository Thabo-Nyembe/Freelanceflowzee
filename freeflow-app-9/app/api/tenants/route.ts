// =====================================================
// PHASE 5.4: WHITE-LABEL MULTI-TENANCY
// API routes for tenant management
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode';
import { sendTeamInvite } from '@/lib/email/email-templates';
import { processDataExportAsync } from '@/lib/jobs/data-export-processor';


const logger = createSimpleLogger('tenants-api');

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

const createTenantSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  plan: z.enum(['starter', 'professional', 'business', 'enterprise', 'custom']),
  branding: z.object({
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
    accentColor: z.string().optional(),
    logoUrl: z.string().url().optional(),
  }).optional(),
  settings: z.object({
    timezone: z.string().optional(),
    currency: z.string().optional(),
    language: z.string().optional(),
  }).optional(),
});

const updateTenantSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  displayName: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  logoUrl: z.string().url().optional().nullable(),
  faviconUrl: z.string().url().optional().nullable(),
  branding: z.record(z.unknown()).optional(),
  settings: z.record(z.unknown()).optional(),
  enabledFeatures: z.array(z.string()).optional(),
});

const inviteUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'manager', 'member', 'viewer']),
  permissions: z.array(z.string()).optional(),
});

const updateUserSchema = z.object({
  role: z.enum(['admin', 'manager', 'member', 'viewer', 'custom']).optional(),
  permissions: z.array(z.string()).optional(),
  status: z.enum(['active', 'suspended']).optional(),
});

const addDomainSchema = z.object({
  domain: z.string().min(3).max(255),
});

const createThemeSchema = z.object({
  name: z.string().min(2).max(50),
  branding: z.record(z.unknown()),
});

const createApiKeySchema = z.object({
  name: z.string().min(2).max(50),
  permissions: z.array(z.string()).optional(),
  scopes: z.array(z.string()).optional(),
  expiresAt: z.string().datetime().optional(),
});

const createWebhookSchema = z.object({
  name: z.string().min(2).max(50),
  url: z.string().url(),
  events: z.array(z.string()).min(1),
  secret: z.string().optional(),
  headers: z.record(z.string()).optional(),
});

// =====================================================
// HELPERS
// =====================================================

async function getCurrentUser(supabase: ReturnType<typeof createClient>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

async function getUserTenantRole(
  supabase: ReturnType<typeof createClient>,
  tenantId: string,
  userId: string
) {
  const { data } = await supabase
    .from('tenant_users')
    .select('role, permissions, status')
    .eq('tenant_id', tenantId)
    .eq('user_id', userId)
    .single();

  return data;
}

function generateApiKey(): { key: string; hash: string; prefix: string } {
  const key = `ff_${crypto.randomUUID().replace(/-/g, '')}`;
  // In production, use proper hashing
  const hash = Buffer.from(key).toString('base64');
  const prefix = key.substring(0, 11);
  return { key, hash, prefix };
}

// =====================================================
// GET HANDLER
// =====================================================

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const user = await getCurrentUser(supabase);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const resource = searchParams.get('resource') || 'tenants';
  const tenantId = searchParams.get('tenantId');

  try {
    switch (resource) {
      // List user's tenants
      case 'tenants': {
        const { data: memberships } = await supabase
          .from('tenant_users')
          .select(`
            tenant_id,
            role,
            tenants (*)
          `)
          .eq('user_id', user.id)
          .eq('status', 'active');

        const tenants = memberships?.map(m => ({
          ...(m.tenants as Record<string, unknown>),
          role: m.role,
        })) || [];

        return NextResponse.json({ tenants });
      }

      // Get single tenant
      case 'tenant': {
        if (!tenantId) {
          return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
        }

        const { data: tenant } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', tenantId)
          .single();

        if (!tenant) {
          return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }

        return NextResponse.json({ tenant });
      }

      // Get tenant users
      case 'users': {
        if (!tenantId) {
          return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
        }

        const { data: users } = await supabase
          .from('tenant_users')
          .select(`
            *,
            users:user_id (id, email, raw_user_meta_data)
          `)
          .eq('tenant_id', tenantId)
          .order('created_at');

        return NextResponse.json({ users: users || [] });
      }

      // Get invites
      case 'invites': {
        if (!tenantId) {
          return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
        }

        const { data: invites } = await supabase
          .from('tenant_invites')
          .select('*')
          .eq('tenant_id', tenantId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        return NextResponse.json({ invites: invites || [] });
      }

      // Get domains
      case 'domains': {
        if (!tenantId) {
          return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
        }

        const { data: domains } = await supabase
          .from('domain_verifications')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('created_at');

        return NextResponse.json({ domains: domains || [] });
      }

      // Get themes
      case 'themes': {
        if (!tenantId) {
          return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
        }

        const { data: themes } = await supabase
          .from('tenant_themes')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('created_at');

        return NextResponse.json({ themes: themes || [] });
      }

      // Get API keys
      case 'api-keys': {
        if (!tenantId) {
          return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
        }

        const { data: apiKeys } = await supabase
          .from('tenant_api_keys')
          .select('id, name, key_prefix, permissions, scopes, rate_limit, last_used_at, usage_count, is_active, expires_at, created_at')
          .eq('tenant_id', tenantId)
          .order('created_at', { ascending: false });

        return NextResponse.json({ apiKeys: apiKeys || [] });
      }

      // Get webhooks
      case 'webhooks': {
        if (!tenantId) {
          return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
        }

        const { data: webhooks } = await supabase
          .from('tenant_webhooks')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('created_at', { ascending: false });

        return NextResponse.json({ webhooks: webhooks || [] });
      }

      // Get webhook logs
      case 'webhook-logs': {
        if (!tenantId) {
          return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
        }

        const webhookId = searchParams.get('webhookId');
        let query = supabase
          .from('tenant_webhook_logs')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('created_at', { ascending: false })
          .limit(100);

        if (webhookId) {
          query = query.eq('webhook_id', webhookId);
        }

        const { data: logs } = await query;

        return NextResponse.json({ logs: logs || [] });
      }

      // Get audit logs
      case 'audit-logs': {
        if (!tenantId) {
          return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
        }

        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        const { data: logs, count } = await supabase
          .from('tenant_audit_logs')
          .select('*, users:user_id(email)', { count: 'exact' })
          .eq('tenant_id', tenantId)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        return NextResponse.json({ logs: logs || [], total: count });
      }

      // Get SSO configs
      case 'sso-configs': {
        if (!tenantId) {
          return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
        }

        const { data: configs } = await supabase
          .from('tenant_sso_configs')
          .select('id, tenant_id, provider_type, provider_name, auto_provision_users, default_role, require_sso, is_active, created_at')
          .eq('tenant_id', tenantId);

        return NextResponse.json({ configs: configs || [] });
      }

      // Get billing
      case 'billing': {
        if (!tenantId) {
          return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
        }

        const { data: billing } = await supabase
          .from('tenant_billing')
          .select('*')
          .eq('tenant_id', tenantId)
          .single();

        return NextResponse.json({ billing });
      }

      // Get invoices
      case 'invoices': {
        if (!tenantId) {
          return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
        }

        const { data: invoices } = await supabase
          .from('tenant_invoices')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('created_at', { ascending: false });

        return NextResponse.json({ invoices: invoices || [] });
      }

      // Get usage
      case 'usage': {
        if (!tenantId) {
          return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
        }

        const { data: usage } = await supabase
          .from('tenant_usage')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('period_start', { ascending: false })
          .limit(12);

        return NextResponse.json({ usage: usage || [] });
      }

      // Get analytics
      case 'analytics': {
        if (!tenantId) {
          return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
        }

        const period = searchParams.get('period') || 'month';
        const { data: analytics } = await supabase
          .rpc('get_tenant_analytics', {
            p_tenant_id: tenantId,
            p_period: period,
          });

        return NextResponse.json({ analytics });
      }

      // Get data exports
      case 'exports': {
        if (!tenantId) {
          return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
        }

        const exportId = searchParams.get('exportId');

        // Get single export by ID
        if (exportId) {
          const { data: exportData } = await supabase
            .from('tenant_data_exports')
            .select('*')
            .eq('id', exportId)
            .eq('tenant_id', tenantId)
            .single();

          if (!exportData) {
            return NextResponse.json({ error: 'Export not found' }, { status: 404 });
          }

          return NextResponse.json({ export: exportData });
        }

        // Get all exports for tenant
        const { data: exports } = await supabase
          .from('tenant_data_exports')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('created_at', { ascending: false })
          .limit(50);

        return NextResponse.json({ exports: exports || [] });
      }

      default:
        return NextResponse.json({ error: 'Unknown resource' }, { status: 400 });
    }
  } catch (error) {
    logger.error('GET /api/tenants error', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST HANDLER
// =====================================================

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const user = await getCurrentUser(supabase);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'create';
  const tenantId = searchParams.get('tenantId');

  try {
    const body = await request.json();

    switch (action) {
      // Create new tenant
      case 'create': {
        const validated = createTenantSchema.parse(body);

        // Check if slug is taken
        const { data: existing } = await supabase
          .from('tenants')
          .select('id')
          .eq('slug', validated.slug)
          .single();

        if (existing) {
          return NextResponse.json({ error: 'This slug is already taken' }, { status: 400 });
        }

        // Create tenant
        const { data: tenant, error } = await supabase
          .from('tenants')
          .insert({
            name: validated.name,
            slug: validated.slug,
            display_name: validated.name,
            primary_domain: `${validated.slug}.freeflow.io`,
            plan: validated.plan,
            branding: validated.branding || {},
            settings: validated.settings || {},
            status: validated.plan === 'starter' ? 'trial' : 'active',
            trial_ends_at: validated.plan === 'starter'
              ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
              : null,
          })
          .select()
          .single();

        if (error) throw error;

        // Add creator as owner
        await supabase
          .from('tenant_users')
          .insert({
            tenant_id: tenant.id,
            user_id: user.id,
            role: 'owner',
            permissions: ['*'],
            status: 'active',
            accepted_at: new Date().toISOString(),
          });

        return NextResponse.json({ tenant }, { status: 201 });
      }

      // Invite user
      case 'invite': {
        if (!tenantId) {
          return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
        }

        const membership = await getUserTenantRole(supabase, tenantId, user.id);
        if (!membership || !['owner', 'admin'].includes(membership.role)) {
          return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
        }

        const validated = inviteUserSchema.parse(body);

        // Check if already a member
        const { data: existingMember } = await supabase
          .from('tenant_users')
          .select('id')
          .eq('tenant_id', tenantId)
          .eq('user_id', validated.email)
          .single();

        if (existingMember) {
          return NextResponse.json({ error: 'User is already a member' }, { status: 400 });
        }

        // Check for pending invite
        const { data: existingInvite } = await supabase
          .from('tenant_invites')
          .select('id')
          .eq('tenant_id', tenantId)
          .eq('email', validated.email)
          .eq('status', 'pending')
          .single();

        if (existingInvite) {
          return NextResponse.json({ error: 'Invite already pending' }, { status: 400 });
        }

        // Create invite
        const { data: invite, error } = await supabase
          .from('tenant_invites')
          .insert({
            tenant_id: tenantId,
            email: validated.email,
            role: validated.role,
            permissions: validated.permissions || [],
            invited_by: user.id,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending',
          })
          .select()
          .single();

        if (error) throw error;

        // Get tenant and inviter details for the email
        const { data: tenant } = await supabase
          .from('tenants')
          .select('name, display_name')
          .eq('id', tenantId)
          .single();

        const { data: inviter } = await supabase
          .from('users')
          .select('raw_user_meta_data')
          .eq('id', user.id)
          .single();

        const tenantName = tenant?.display_name || tenant?.name || 'the organization';
        const inviterName = inviter?.raw_user_meta_data?.name || inviter?.raw_user_meta_data?.full_name || user.email || 'A team member';

        // Generate invite URL
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const inviteUrl = `${baseUrl}/invite/accept?token=${invite.id}`;
        const expiresAt = new Date(invite.expires_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        // Send invite email
        try {
          await sendTeamInvite({
            inviteeName: '', // Will show as "Hi there" in the template
            inviteeEmail: validated.email,
            teamName: tenantName,
            inviterName: inviterName,
            role: validated.role,
            inviteUrl: inviteUrl,
            expiresAt: expiresAt,
          });
          logger.info('Tenant invite email sent', {
            inviteId: invite.id,
            email: validated.email,
            tenantId
          });
        } catch (emailError) {
          // Log the error but don't fail the invite creation
          logger.error('Failed to send tenant invite email', {
            error: emailError,
            inviteId: invite.id,
            email: validated.email
          });
        }

        return NextResponse.json({ invite }, { status: 201 });
      }

      // Accept invite
      case 'accept-invite': {
        const { inviteId } = body;

        const { data: invite } = await supabase
          .from('tenant_invites')
          .select('*')
          .eq('id', inviteId)
          .single();

        if (!invite) {
          return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
        }

        if (invite.status !== 'pending') {
          return NextResponse.json({ error: 'Invite is no longer valid' }, { status: 400 });
        }

        if (new Date(invite.expires_at) < new Date()) {
          return NextResponse.json({ error: 'Invite has expired' }, { status: 400 });
        }

        // Add user to tenant
        const { error: memberError } = await supabase
          .from('tenant_users')
          .insert({
            tenant_id: invite.tenant_id,
            user_id: user.id,
            role: invite.role,
            permissions: invite.permissions || [],
            invited_by: invite.invited_by,
            invited_at: invite.created_at,
            accepted_at: new Date().toISOString(),
            status: 'active',
          });

        if (memberError) throw memberError;

        // Update invite
        await supabase
          .from('tenant_invites')
          .update({
            status: 'accepted',
            accepted_at: new Date().toISOString(),
          })
          .eq('id', inviteId);

        return NextResponse.json({ success: true });
      }

      // Add domain
      case 'add-domain': {
        if (!tenantId) {
          return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
        }

        const membership = await getUserTenantRole(supabase, tenantId, user.id);
        if (!membership || !['owner', 'admin'].includes(membership.role)) {
          return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
        }

        const validated = addDomainSchema.parse(body);

        // Check if domain is already used
        const { data: existing } = await supabase
          .from('domain_verifications')
          .select('id')
          .eq('domain', validated.domain)
          .single();

        if (existing) {
          return NextResponse.json({ error: 'Domain is already in use' }, { status: 400 });
        }

        const verificationToken = `freeflow-verify-${crypto.randomUUID()}`;

        const { data: domain, error } = await supabase
          .from('domain_verifications')
          .insert({
            tenant_id: tenantId,
            domain: validated.domain,
            verification_method: 'dns_txt',
            verification_token: verificationToken,
            dns_records: [
              {
                type: 'TXT',
                name: `_freeflow-verify.${validated.domain}`,
                value: verificationToken,
              },
              {
                type: 'CNAME',
                name: validated.domain,
                value: 'custom.freeflow.io',
              },
            ],
            status: 'pending',
            ssl_status: 'pending',
          })
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json({ domain }, { status: 201 });
      }

      // Verify domain
      case 'verify-domain': {
        if (!tenantId) {
          return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
        }

        const { domainId } = body;

        // In production, this would check DNS records
        const { data: domain, error } = await supabase
          .from('domain_verifications')
          .update({
            status: 'verified',
            verified_at: new Date().toISOString(),
            ssl_status: 'active',
          })
          .eq('id', domainId)
          .eq('tenant_id', tenantId)
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json({ domain });
      }

      // Create theme
      case 'create-theme': {
        if (!tenantId) {
          return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
        }

        const membership = await getUserTenantRole(supabase, tenantId, user.id);
        if (!membership || !['owner', 'admin'].includes(membership.role)) {
          return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
        }

        const validated = createThemeSchema.parse(body);

        const { data: theme, error } = await supabase
          .from('tenant_themes')
          .insert({
            tenant_id: tenantId,
            name: validated.name,
            branding: validated.branding,
            is_active: false,
            is_default: false,
          })
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json({ theme }, { status: 201 });
      }

      // Activate theme
      case 'activate-theme': {
        if (!tenantId) {
          return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
        }

        const { themeId } = body;

        // Deactivate all themes
        await supabase
          .from('tenant_themes')
          .update({ is_active: false })
          .eq('tenant_id', tenantId);

        // Activate selected theme
        const { data: theme } = await supabase
          .from('tenant_themes')
          .update({ is_active: true })
          .eq('id', themeId)
          .select()
          .single();

        // Apply branding to tenant
        if (theme) {
          await supabase
            .from('tenants')
            .update({
              branding: theme.branding,
              updated_at: new Date().toISOString(),
            })
            .eq('id', tenantId);
        }

        return NextResponse.json({ theme });
      }

      // Create API key
      case 'create-api-key': {
        if (!tenantId) {
          return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
        }

        const membership = await getUserTenantRole(supabase, tenantId, user.id);
        if (!membership || !['owner', 'admin'].includes(membership.role)) {
          return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
        }

        const validated = createApiKeySchema.parse(body);
        const { key, hash, prefix } = generateApiKey();

        const { data: apiKey, error } = await supabase
          .from('tenant_api_keys')
          .insert({
            tenant_id: tenantId,
            name: validated.name,
            key_hash: hash,
            key_prefix: prefix,
            permissions: validated.permissions || [],
            scopes: validated.scopes || [],
            expires_at: validated.expiresAt,
            created_by: user.id,
            is_active: true,
          })
          .select('id, name, key_prefix, permissions, scopes, created_at')
          .single();

        if (error) throw error;

        // Return the full key only once
        return NextResponse.json({
          apiKey: {
            ...apiKey,
            key, // Full key is only shown once
          }
        }, { status: 201 });
      }

      // Create webhook
      case 'create-webhook': {
        if (!tenantId) {
          return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
        }

        const membership = await getUserTenantRole(supabase, tenantId, user.id);
        if (!membership || !['owner', 'admin'].includes(membership.role)) {
          return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
        }

        const validated = createWebhookSchema.parse(body);

        const { data: webhook, error } = await supabase
          .from('tenant_webhooks')
          .insert({
            tenant_id: tenantId,
            name: validated.name,
            url: validated.url,
            events: validated.events,
            secret: validated.secret,
            headers: validated.headers || {},
            created_by: user.id,
            is_active: true,
          })
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json({ webhook }, { status: 201 });
      }

      // Upgrade plan
      case 'upgrade-plan': {
        if (!tenantId) {
          return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
        }

        const membership = await getUserTenantRole(supabase, tenantId, user.id);
        if (membership?.role !== 'owner') {
          return NextResponse.json({ error: 'Only owners can upgrade' }, { status: 403 });
        }

        const { plan } = body;

        const planLimits: Record<string, Record<string, unknown>> = {
          starter: { maxUsers: 5, maxProjects: 10, maxStorage: 1024 },
          professional: { maxUsers: 25, maxProjects: 50, maxStorage: 10240 },
          business: { maxUsers: 100, maxProjects: 200, maxStorage: 102400 },
          enterprise: { maxUsers: -1, maxProjects: -1, maxStorage: -1 },
        };

        const { data: tenant, error } = await supabase
          .from('tenants')
          .update({
            plan,
            feature_limits: planLimits[plan] || planLimits.starter,
            status: 'active',
            trial_ends_at: null,
            plan_start_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', tenantId)
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json({ tenant });
      }

      // Request data export
      case 'export-data': {
        if (!tenantId) {
          return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
        }

        const membership = await getUserTenantRole(supabase, tenantId, user.id);
        if (!membership || !['owner', 'admin'].includes(membership.role)) {
          return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
        }

        const { exportType = 'full', targetId } = body;

        const { data: exportRequest, error } = await supabase
          .from('tenant_data_exports')
          .insert({
            tenant_id: tenantId,
            requested_by: user.id,
            export_type: exportType,
            target_id: targetId,
            status: 'pending',
          })
          .select()
          .single();

        if (error) throw error;

        // Queue background job to process export
        // This runs asynchronously and updates the export status in the database
        processDataExportAsync(exportRequest.id);

        logger.info('Data export queued', {
          exportId: exportRequest.id,
          tenantId,
          exportType,
          requestedBy: user.id,
        });

        return NextResponse.json({ export: exportRequest }, { status: 201 });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    logger.error('POST /api/tenants error', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =====================================================
// PUT HANDLER
// =====================================================

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const user = await getCurrentUser(supabase);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId');
  const resource = searchParams.get('resource') || 'tenant';

  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
  }

  // Check permissions
  const membership = await getUserTenantRole(supabase, tenantId, user.id);
  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const body = await request.json();

    switch (resource) {
      // Update tenant
      case 'tenant': {
        const validated = updateTenantSchema.parse(body);

        const { data: tenant, error } = await supabase
          .from('tenants')
          .update({
            name: validated.name,
            display_name: validated.displayName,
            description: validated.description,
            logo_url: validated.logoUrl,
            favicon_url: validated.faviconUrl,
            branding: validated.branding,
            settings: validated.settings,
            enabled_features: validated.enabledFeatures,
            updated_at: new Date().toISOString(),
          })
          .eq('id', tenantId)
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json({ tenant });
      }

      // Update user
      case 'user': {
        const userId = searchParams.get('userId');
        if (!userId) {
          return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        const validated = updateUserSchema.parse(body);

        const { data: tenantUser, error } = await supabase
          .from('tenant_users')
          .update({
            role: validated.role,
            permissions: validated.permissions,
            status: validated.status,
            updated_at: new Date().toISOString(),
          })
          .eq('tenant_id', tenantId)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json({ user: tenantUser });
      }

      // Update webhook
      case 'webhook': {
        const webhookId = searchParams.get('webhookId');
        if (!webhookId) {
          return NextResponse.json({ error: 'Webhook ID required' }, { status: 400 });
        }

        const { data: webhook, error } = await supabase
          .from('tenant_webhooks')
          .update({
            name: body.name,
            url: body.url,
            events: body.events,
            headers: body.headers,
            is_active: body.isActive,
            updated_at: new Date().toISOString(),
          })
          .eq('id', webhookId)
          .eq('tenant_id', tenantId)
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json({ webhook });
      }

      default:
        return NextResponse.json({ error: 'Unknown resource' }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    logger.error('PUT /api/tenants error', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE HANDLER
// =====================================================

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const user = await getCurrentUser(supabase);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId');
  const resource = searchParams.get('resource') || 'tenant';

  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
  }

  try {
    switch (resource) {
      // Delete/cancel tenant
      case 'tenant': {
        const membership = await getUserTenantRole(supabase, tenantId, user.id);
        if (membership?.role !== 'owner') {
          return NextResponse.json({ error: 'Only owners can delete tenant' }, { status: 403 });
        }

        const { error } = await supabase
          .from('tenants')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('id', tenantId);

        if (error) throw error;

        return NextResponse.json({ success: true });
      }

      // Remove user
      case 'user': {
        const userId = searchParams.get('userId');
        if (!userId) {
          return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        const membership = await getUserTenantRole(supabase, tenantId, user.id);
        if (!membership || !['owner', 'admin'].includes(membership.role)) {
          return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
        }

        // Check if trying to remove last owner
        const { data: owners } = await supabase
          .from('tenant_users')
          .select('user_id')
          .eq('tenant_id', tenantId)
          .eq('role', 'owner')
          .eq('status', 'active');

        if (owners?.length === 1 && owners[0].user_id === userId) {
          return NextResponse.json({ error: 'Cannot remove the last owner' }, { status: 400 });
        }

        const { error } = await supabase
          .from('tenant_users')
          .delete()
          .eq('tenant_id', tenantId)
          .eq('user_id', userId);

        if (error) throw error;

        return NextResponse.json({ success: true });
      }

      // Cancel invite
      case 'invite': {
        const inviteId = searchParams.get('inviteId');
        if (!inviteId) {
          return NextResponse.json({ error: 'Invite ID required' }, { status: 400 });
        }

        const { error } = await supabase
          .from('tenant_invites')
          .update({ status: 'cancelled' })
          .eq('id', inviteId)
          .eq('tenant_id', tenantId);

        if (error) throw error;

        return NextResponse.json({ success: true });
      }

      // Remove domain
      case 'domain': {
        const domainId = searchParams.get('domainId');
        if (!domainId) {
          return NextResponse.json({ error: 'Domain ID required' }, { status: 400 });
        }

        const { error } = await supabase
          .from('domain_verifications')
          .delete()
          .eq('id', domainId)
          .eq('tenant_id', tenantId);

        if (error) throw error;

        return NextResponse.json({ success: true });
      }

      // Delete API key
      case 'api-key': {
        const keyId = searchParams.get('keyId');
        if (!keyId) {
          return NextResponse.json({ error: 'Key ID required' }, { status: 400 });
        }

        const { error } = await supabase
          .from('tenant_api_keys')
          .delete()
          .eq('id', keyId)
          .eq('tenant_id', tenantId);

        if (error) throw error;

        return NextResponse.json({ success: true });
      }

      // Delete webhook
      case 'webhook': {
        const webhookId = searchParams.get('webhookId');
        if (!webhookId) {
          return NextResponse.json({ error: 'Webhook ID required' }, { status: 400 });
        }

        const { error } = await supabase
          .from('tenant_webhooks')
          .delete()
          .eq('id', webhookId)
          .eq('tenant_id', tenantId);

        if (error) throw error;

        return NextResponse.json({ success: true });
      }

      // Delete theme
      case 'theme': {
        const themeId = searchParams.get('themeId');
        if (!themeId) {
          return NextResponse.json({ error: 'Theme ID required' }, { status: 400 });
        }

        const { error } = await supabase
          .from('tenant_themes')
          .delete()
          .eq('id', themeId)
          .eq('tenant_id', tenantId);

        if (error) throw error;

        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: 'Unknown resource' }, { status: 400 });
    }
  } catch (error) {
    logger.error('DELETE /api/tenants error', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
