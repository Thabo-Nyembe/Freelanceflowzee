// =====================================================
// PHASE 5.4: WHITE-LABEL MULTI-TENANCY
// React hook for tenant management
// =====================================================

import { useState, useEffect, useCallback, useMemo } from 'react';

// =====================================================
// TYPES
// =====================================================

interface Tenant {
  id: string;
  slug: string;
  name: string;
  displayName: string;
  description?: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryDomain: string;
  customDomains: string[];
  branding: TenantBranding;
  enabledFeatures: string[];
  featureLimits: FeatureLimits;
  plan: TenantPlan;
  planStartDate: string;
  settings: TenantSettings;
  status: 'active' | 'suspended' | 'trial' | 'cancelled';
  trialEndsAt?: string;
  userCount: number;
  storageUsedMb: number;
  createdAt: string;
  role?: string; // User's role in this tenant
}

interface TenantBranding {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  darkMode: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
  };
  fontFamily: string;
  fontSize: string;
  logoUrl?: string;
  logoDarkUrl?: string;
  logoHeight: number;
  faviconUrl?: string;
  customCss?: string;
}

interface FeatureLimits {
  maxUsers: number;
  maxProjects: number;
  maxStorage: number;
  maxApiCalls: number;
  maxIntegrations: number;
  maxCustomFields: number;
  maxAutomations: number;
  maxWebhooks: number;
}

type TenantPlan = 'starter' | 'professional' | 'business' | 'enterprise' | 'custom';

interface TenantSettings {
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  currency: string;
  language: string;
  requireMfa: boolean;
  allowedAuthMethods: string[];
  sessionTimeout: number;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    maxAge: number;
  };
  emailNotifications: boolean;
  dataRetentionDays: number;
  gdprCompliant: boolean;
  hipaaCompliant: boolean;
  apiEnabled: boolean;
  webhooksEnabled: boolean;
  removeWatermarks: boolean;
}

interface TenantUser {
  id: string;
  tenantId: string;
  userId: string;
  role: TenantRole;
  permissions: string[];
  email?: string;
  name?: string;
  avatarUrl?: string;
  status: 'pending' | 'active' | 'suspended';
  createdAt: string;
}

type TenantRole = 'owner' | 'admin' | 'manager' | 'member' | 'viewer' | 'custom';

interface TenantInvite {
  id: string;
  tenantId: string;
  email: string;
  role: TenantRole;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  createdAt: string;
}

interface Domain {
  id: string;
  tenantId: string;
  domain: string;
  verificationMethod: string;
  verificationToken: string;
  verifiedAt?: string;
  status: 'pending' | 'verified' | 'failed';
  dnsRecords?: { type: string; name: string; value: string }[];
  sslStatus: string;
  createdAt: string;
}

interface Theme {
  id: string;
  tenantId: string;
  name: string;
  branding: TenantBranding;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
}

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  key?: string; // Only returned on creation
  permissions: string[];
  scopes: string[];
  rateLimit: number;
  lastUsedAt?: string;
  usageCount: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  headers: Record<string, string>;
  isActive: boolean;
  lastTriggeredAt?: string;
  lastSuccessAt?: string;
  lastFailureAt?: string;
  failureCount: number;
  createdAt: string;
}

interface AuditLog {
  id: string;
  userId: string;
  userEmail?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  description?: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  ipAddress?: string;
  createdAt: string;
}

interface TenantAnalytics {
  tenantId: string;
  period: string;
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
}

interface UseTenantResult {
  // State
  tenants: Tenant[];
  currentTenant: Tenant | null;
  users: TenantUser[];
  invites: TenantInvite[];
  domains: Domain[];
  themes: Theme[];
  apiKeys: ApiKey[];
  webhooks: Webhook[];
  auditLogs: AuditLog[];
  analytics: TenantAnalytics | null;
  isLoading: boolean;
  error: string | null;

  // Computed
  isOwner: boolean;
  isAdmin: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
  canManageBilling: boolean;

  // Tenant operations
  fetchTenants: () => Promise<void>;
  createTenant: (data: CreateTenantData) => Promise<Tenant>;
  updateTenant: (updates: Partial<Tenant>) => Promise<Tenant>;
  deleteTenant: () => Promise<void>;
  switchTenant: (tenantId: string) => void;

  // User operations
  fetchUsers: () => Promise<void>;
  inviteUser: (email: string, role: TenantRole, permissions?: string[]) => Promise<TenantInvite>;
  updateUser: (userId: string, updates: Partial<TenantUser>) => Promise<TenantUser>;
  removeUser: (userId: string) => Promise<void>;
  cancelInvite: (inviteId: string) => Promise<void>;
  acceptInvite: (inviteId: string) => Promise<void>;

  // Domain operations
  fetchDomains: () => Promise<void>;
  addDomain: (domain: string) => Promise<Domain>;
  verifyDomain: (domainId: string) => Promise<Domain>;
  removeDomain: (domainId: string) => Promise<void>;

  // Theme operations
  fetchThemes: () => Promise<void>;
  createTheme: (name: string, branding: TenantBranding) => Promise<Theme>;
  updateTheme: (themeId: string, updates: Partial<Theme>) => Promise<Theme>;
  activateTheme: (themeId: string) => Promise<void>;
  deleteTheme: (themeId: string) => Promise<void>;

  // API key operations
  fetchApiKeys: () => Promise<void>;
  createApiKey: (data: CreateApiKeyData) => Promise<ApiKey>;
  revokeApiKey: (keyId: string) => Promise<void>;

  // Webhook operations
  fetchWebhooks: () => Promise<void>;
  createWebhook: (data: CreateWebhookData) => Promise<Webhook>;
  updateWebhook: (webhookId: string, updates: Partial<Webhook>) => Promise<Webhook>;
  deleteWebhook: (webhookId: string) => Promise<void>;

  // Audit operations
  fetchAuditLogs: (options?: { limit?: number; offset?: number }) => Promise<void>;

  // Analytics
  fetchAnalytics: (period?: 'day' | 'week' | 'month' | 'year') => Promise<void>;

  // Plan operations
  upgradePlan: (plan: TenantPlan) => Promise<Tenant>;
  checkLimit: (resource: keyof FeatureLimits) => { used: number; limit: number; exceeded: boolean };

  // Data export
  requestDataExport: (type?: 'full' | 'user' | 'project', targetId?: string) => Promise<void>;
}

interface CreateTenantData {
  name: string;
  slug: string;
  plan: TenantPlan;
  branding?: Partial<TenantBranding>;
  settings?: Partial<TenantSettings>;
}

interface CreateApiKeyData {
  name: string;
  permissions?: string[];
  scopes?: string[];
  expiresAt?: string;
}

interface CreateWebhookData {
  name: string;
  url: string;
  events: string[];
  secret?: string;
  headers?: Record<string, string>;
}

// =====================================================
// HOOK
// =====================================================

export function useTenant(): UseTenantResult {
  // State
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [invites, setInvites] = useState<TenantInvite[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [analytics, setAnalytics] = useState<TenantAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API helper
  const fetchApi = useCallback(async (
    endpoint: string,
    options: RequestInit = {}
  ) => {
    const response = await fetch(`/api/tenants${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    return response.json();
  }, []);

  // Computed permissions
  const isOwner = useMemo(() => currentTenant?.role === 'owner', [currentTenant]);
  const isAdmin = useMemo(() => ['owner', 'admin'].includes(currentTenant?.role || ''), [currentTenant]);
  const canManageUsers = useMemo(() => isAdmin, [isAdmin]);
  const canManageSettings = useMemo(() => isAdmin, [isAdmin]);
  const canManageBilling = useMemo(() => isOwner, [isOwner]);

  // =====================================================
  // TENANT OPERATIONS
  // =====================================================

  const fetchTenants = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchApi('?resource=tenants');
      setTenants(data.tenants.map(mapTenantFromApi));

      // Set current tenant from localStorage or first tenant
      const savedTenantId = localStorage.getItem('currentTenantId');
      const tenant = data.tenants.find((t: { id: string }) => t.id === savedTenantId) || data.tenants[0];
      if (tenant) {
        setCurrentTenant(mapTenantFromApi(tenant));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch tenants';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchApi]);

  const createTenant = useCallback(async (data: CreateTenantData): Promise<Tenant> => {
    setError(null);

    try {
      const response = await fetchApi('?action=create', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      const tenant = mapTenantFromApi(response.tenant);
      setTenants(prev => [...prev, tenant]);
      setCurrentTenant(tenant);
      localStorage.setItem('currentTenantId', tenant.id);

      return tenant;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create tenant';
      setError(message);
      throw err;
    }
  }, [fetchApi]);

  const updateTenant = useCallback(async (updates: Partial<Tenant>): Promise<Tenant> => {
    if (!currentTenant) throw new Error('No tenant selected');

    setError(null);

    try {
      const response = await fetchApi(`?tenantId=${currentTenant.id}&resource=tenant`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      const tenant = mapTenantFromApi(response.tenant);
      setTenants(prev => prev.map(t => t.id === tenant.id ? tenant : t));
      setCurrentTenant(tenant);

      return tenant;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update tenant';
      setError(message);
      throw err;
    }
  }, [fetchApi, currentTenant]);

  const deleteTenant = useCallback(async (): Promise<void> => {
    if (!currentTenant) throw new Error('No tenant selected');

    setError(null);

    try {
      await fetchApi(`?tenantId=${currentTenant.id}&resource=tenant`, {
        method: 'DELETE',
      });

      setTenants(prev => prev.filter(t => t.id !== currentTenant.id));
      setCurrentTenant(tenants[0] || null);
      localStorage.removeItem('currentTenantId');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete tenant';
      setError(message);
      throw err;
    }
  }, [fetchApi, currentTenant, tenants]);

  const switchTenant = useCallback((tenantId: string): void => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant) {
      setCurrentTenant(tenant);
      localStorage.setItem('currentTenantId', tenantId);
      // Reset tenant-specific state
      setUsers([]);
      setInvites([]);
      setDomains([]);
      setThemes([]);
      setApiKeys([]);
      setWebhooks([]);
      setAuditLogs([]);
      setAnalytics(null);
    }
  }, [tenants]);

  // =====================================================
  // USER OPERATIONS
  // =====================================================

  const fetchUsers = useCallback(async (): Promise<void> => {
    if (!currentTenant) return;

    setError(null);

    try {
      const [usersData, invitesData] = await Promise.all([
        fetchApi(`?resource=users&tenantId=${currentTenant.id}`),
        fetchApi(`?resource=invites&tenantId=${currentTenant.id}`),
      ]);

      setUsers(usersData.users.map(mapUserFromApi));
      setInvites(invitesData.invites.map(mapInviteFromApi));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch users';
      setError(message);
    }
  }, [fetchApi, currentTenant]);

  const inviteUser = useCallback(async (
    email: string,
    role: TenantRole,
    permissions?: string[]
  ): Promise<TenantInvite> => {
    if (!currentTenant) throw new Error('No tenant selected');

    setError(null);

    try {
      const response = await fetchApi(`?action=invite&tenantId=${currentTenant.id}`, {
        method: 'POST',
        body: JSON.stringify({ email, role, permissions }),
      });

      const invite = mapInviteFromApi(response.invite);
      setInvites(prev => [...prev, invite]);

      return invite;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to invite user';
      setError(message);
      throw err;
    }
  }, [fetchApi, currentTenant]);

  const updateUser = useCallback(async (
    userId: string,
    updates: Partial<TenantUser>
  ): Promise<TenantUser> => {
    if (!currentTenant) throw new Error('No tenant selected');

    setError(null);

    try {
      const response = await fetchApi(
        `?tenantId=${currentTenant.id}&resource=user&userId=${userId}`,
        {
          method: 'PUT',
          body: JSON.stringify(updates),
        }
      );

      const user = mapUserFromApi(response.user);
      setUsers(prev => prev.map(u => u.userId === userId ? user : u));

      return user;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update user';
      setError(message);
      throw err;
    }
  }, [fetchApi, currentTenant]);

  const removeUser = useCallback(async (userId: string): Promise<void> => {
    if (!currentTenant) throw new Error('No tenant selected');

    setError(null);

    try {
      await fetchApi(
        `?tenantId=${currentTenant.id}&resource=user&userId=${userId}`,
        { method: 'DELETE' }
      );

      setUsers(prev => prev.filter(u => u.userId !== userId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove user';
      setError(message);
      throw err;
    }
  }, [fetchApi, currentTenant]);

  const cancelInvite = useCallback(async (inviteId: string): Promise<void> => {
    if (!currentTenant) throw new Error('No tenant selected');

    setError(null);

    try {
      await fetchApi(
        `?tenantId=${currentTenant.id}&resource=invite&inviteId=${inviteId}`,
        { method: 'DELETE' }
      );

      setInvites(prev => prev.filter(i => i.id !== inviteId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel invite';
      setError(message);
      throw err;
    }
  }, [fetchApi, currentTenant]);

  const acceptInvite = useCallback(async (inviteId: string): Promise<void> => {
    setError(null);

    try {
      await fetchApi('?action=accept-invite', {
        method: 'POST',
        body: JSON.stringify({ inviteId }),
      });

      // Refresh tenants to include the new one
      await fetchTenants();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to accept invite';
      setError(message);
      throw err;
    }
  }, [fetchApi, fetchTenants]);

  // =====================================================
  // DOMAIN OPERATIONS
  // =====================================================

  const fetchDomains = useCallback(async (): Promise<void> => {
    if (!currentTenant) return;

    setError(null);

    try {
      const data = await fetchApi(`?resource=domains&tenantId=${currentTenant.id}`);
      setDomains(data.domains.map(mapDomainFromApi));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch domains';
      setError(message);
    }
  }, [fetchApi, currentTenant]);

  const addDomain = useCallback(async (domain: string): Promise<Domain> => {
    if (!currentTenant) throw new Error('No tenant selected');

    setError(null);

    try {
      const response = await fetchApi(`?action=add-domain&tenantId=${currentTenant.id}`, {
        method: 'POST',
        body: JSON.stringify({ domain }),
      });

      const newDomain = mapDomainFromApi(response.domain);
      setDomains(prev => [...prev, newDomain]);

      return newDomain;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add domain';
      setError(message);
      throw err;
    }
  }, [fetchApi, currentTenant]);

  const verifyDomain = useCallback(async (domainId: string): Promise<Domain> => {
    if (!currentTenant) throw new Error('No tenant selected');

    setError(null);

    try {
      const response = await fetchApi(`?action=verify-domain&tenantId=${currentTenant.id}`, {
        method: 'POST',
        body: JSON.stringify({ domainId }),
      });

      const domain = mapDomainFromApi(response.domain);
      setDomains(prev => prev.map(d => d.id === domainId ? domain : d));

      return domain;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to verify domain';
      setError(message);
      throw err;
    }
  }, [fetchApi, currentTenant]);

  const removeDomain = useCallback(async (domainId: string): Promise<void> => {
    if (!currentTenant) throw new Error('No tenant selected');

    setError(null);

    try {
      await fetchApi(
        `?tenantId=${currentTenant.id}&resource=domain&domainId=${domainId}`,
        { method: 'DELETE' }
      );

      setDomains(prev => prev.filter(d => d.id !== domainId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove domain';
      setError(message);
      throw err;
    }
  }, [fetchApi, currentTenant]);

  // =====================================================
  // THEME OPERATIONS
  // =====================================================

  const fetchThemes = useCallback(async (): Promise<void> => {
    if (!currentTenant) return;

    setError(null);

    try {
      const data = await fetchApi(`?resource=themes&tenantId=${currentTenant.id}`);
      setThemes(data.themes.map(mapThemeFromApi));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch themes';
      setError(message);
    }
  }, [fetchApi, currentTenant]);

  const createTheme = useCallback(async (
    name: string,
    branding: TenantBranding
  ): Promise<Theme> => {
    if (!currentTenant) throw new Error('No tenant selected');

    setError(null);

    try {
      const response = await fetchApi(`?action=create-theme&tenantId=${currentTenant.id}`, {
        method: 'POST',
        body: JSON.stringify({ name, branding }),
      });

      const theme = mapThemeFromApi(response.theme);
      setThemes(prev => [...prev, theme]);

      return theme;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create theme';
      setError(message);
      throw err;
    }
  }, [fetchApi, currentTenant]);

  const updateTheme = useCallback(async (
    themeId: string,
    updates: Partial<Theme>
  ): Promise<Theme> => {
    if (!currentTenant) throw new Error('No tenant selected');

    setError(null);

    try {
      const response = await fetchApi(
        `?tenantId=${currentTenant.id}&resource=theme&themeId=${themeId}`,
        {
          method: 'PUT',
          body: JSON.stringify(updates),
        }
      );

      const theme = mapThemeFromApi(response.theme);
      setThemes(prev => prev.map(t => t.id === themeId ? theme : t));

      return theme;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update theme';
      setError(message);
      throw err;
    }
  }, [fetchApi, currentTenant]);

  const activateTheme = useCallback(async (themeId: string): Promise<void> => {
    if (!currentTenant) throw new Error('No tenant selected');

    setError(null);

    try {
      await fetchApi(`?action=activate-theme&tenantId=${currentTenant.id}`, {
        method: 'POST',
        body: JSON.stringify({ themeId }),
      });

      setThemes(prev => prev.map(t => ({
        ...t,
        isActive: t.id === themeId,
      })));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to activate theme';
      setError(message);
      throw err;
    }
  }, [fetchApi, currentTenant]);

  const deleteTheme = useCallback(async (themeId: string): Promise<void> => {
    if (!currentTenant) throw new Error('No tenant selected');

    setError(null);

    try {
      await fetchApi(
        `?tenantId=${currentTenant.id}&resource=theme&themeId=${themeId}`,
        { method: 'DELETE' }
      );

      setThemes(prev => prev.filter(t => t.id !== themeId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete theme';
      setError(message);
      throw err;
    }
  }, [fetchApi, currentTenant]);

  // =====================================================
  // API KEY OPERATIONS
  // =====================================================

  const fetchApiKeys = useCallback(async (): Promise<void> => {
    if (!currentTenant) return;

    setError(null);

    try {
      const data = await fetchApi(`?resource=api-keys&tenantId=${currentTenant.id}`);
      setApiKeys(data.apiKeys.map(mapApiKeyFromApi));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch API keys';
      setError(message);
    }
  }, [fetchApi, currentTenant]);

  const createApiKey = useCallback(async (data: CreateApiKeyData): Promise<ApiKey> => {
    if (!currentTenant) throw new Error('No tenant selected');

    setError(null);

    try {
      const response = await fetchApi(`?action=create-api-key&tenantId=${currentTenant.id}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      const apiKey = mapApiKeyFromApi(response.apiKey);
      apiKey.key = response.apiKey.key; // Include full key
      setApiKeys(prev => [...prev, apiKey]);

      return apiKey;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create API key';
      setError(message);
      throw err;
    }
  }, [fetchApi, currentTenant]);

  const revokeApiKey = useCallback(async (keyId: string): Promise<void> => {
    if (!currentTenant) throw new Error('No tenant selected');

    setError(null);

    try {
      await fetchApi(
        `?tenantId=${currentTenant.id}&resource=api-key&keyId=${keyId}`,
        { method: 'DELETE' }
      );

      setApiKeys(prev => prev.filter(k => k.id !== keyId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to revoke API key';
      setError(message);
      throw err;
    }
  }, [fetchApi, currentTenant]);

  // =====================================================
  // WEBHOOK OPERATIONS
  // =====================================================

  const fetchWebhooks = useCallback(async (): Promise<void> => {
    if (!currentTenant) return;

    setError(null);

    try {
      const data = await fetchApi(`?resource=webhooks&tenantId=${currentTenant.id}`);
      setWebhooks(data.webhooks.map(mapWebhookFromApi));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch webhooks';
      setError(message);
    }
  }, [fetchApi, currentTenant]);

  const createWebhook = useCallback(async (data: CreateWebhookData): Promise<Webhook> => {
    if (!currentTenant) throw new Error('No tenant selected');

    setError(null);

    try {
      const response = await fetchApi(`?action=create-webhook&tenantId=${currentTenant.id}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      const webhook = mapWebhookFromApi(response.webhook);
      setWebhooks(prev => [...prev, webhook]);

      return webhook;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create webhook';
      setError(message);
      throw err;
    }
  }, [fetchApi, currentTenant]);

  const updateWebhook = useCallback(async (
    webhookId: string,
    updates: Partial<Webhook>
  ): Promise<Webhook> => {
    if (!currentTenant) throw new Error('No tenant selected');

    setError(null);

    try {
      const response = await fetchApi(
        `?tenantId=${currentTenant.id}&resource=webhook&webhookId=${webhookId}`,
        {
          method: 'PUT',
          body: JSON.stringify(updates),
        }
      );

      const webhook = mapWebhookFromApi(response.webhook);
      setWebhooks(prev => prev.map(w => w.id === webhookId ? webhook : w));

      return webhook;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update webhook';
      setError(message);
      throw err;
    }
  }, [fetchApi, currentTenant]);

  const deleteWebhook = useCallback(async (webhookId: string): Promise<void> => {
    if (!currentTenant) throw new Error('No tenant selected');

    setError(null);

    try {
      await fetchApi(
        `?tenantId=${currentTenant.id}&resource=webhook&webhookId=${webhookId}`,
        { method: 'DELETE' }
      );

      setWebhooks(prev => prev.filter(w => w.id !== webhookId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete webhook';
      setError(message);
      throw err;
    }
  }, [fetchApi, currentTenant]);

  // =====================================================
  // AUDIT & ANALYTICS
  // =====================================================

  const fetchAuditLogs = useCallback(async (
    options: { limit?: number; offset?: number } = {}
  ): Promise<void> => {
    if (!currentTenant) return;

    setError(null);

    try {
      const params = new URLSearchParams({
        resource: 'audit-logs',
        tenantId: currentTenant.id,
        limit: String(options.limit || 50),
        offset: String(options.offset || 0),
      });

      const data = await fetchApi(`?${params}`);
      setAuditLogs(data.logs.map(mapAuditLogFromApi));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch audit logs';
      setError(message);
    }
  }, [fetchApi, currentTenant]);

  const fetchAnalytics = useCallback(async (
    period: 'day' | 'week' | 'month' | 'year' = 'month'
  ): Promise<void> => {
    if (!currentTenant) return;

    setError(null);

    try {
      const data = await fetchApi(
        `?resource=analytics&tenantId=${currentTenant.id}&period=${period}`
      );
      setAnalytics(data.analytics);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch analytics';
      setError(message);
    }
  }, [fetchApi, currentTenant]);

  // =====================================================
  // PLAN & LIMITS
  // =====================================================

  const upgradePlan = useCallback(async (plan: TenantPlan): Promise<Tenant> => {
    if (!currentTenant) throw new Error('No tenant selected');

    setError(null);

    try {
      const response = await fetchApi(`?action=upgrade-plan&tenantId=${currentTenant.id}`, {
        method: 'POST',
        body: JSON.stringify({ plan }),
      });

      const tenant = mapTenantFromApi(response.tenant);
      setTenants(prev => prev.map(t => t.id === tenant.id ? tenant : t));
      setCurrentTenant(tenant);

      return tenant;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upgrade plan';
      setError(message);
      throw err;
    }
  }, [fetchApi, currentTenant]);

  const checkLimit = useCallback((
    resource: keyof FeatureLimits
  ): { used: number; limit: number; exceeded: boolean } => {
    if (!currentTenant) {
      return { used: 0, limit: 0, exceeded: false };
    }

    const limit = currentTenant.featureLimits[resource];
    let used = 0;

    switch (resource) {
      case 'maxUsers':
        used = currentTenant.userCount;
        break;
      case 'maxStorage':
        used = currentTenant.storageUsedMb;
        break;
      default:
        used = 0;
    }

    return {
      used,
      limit: limit === -1 ? Infinity : limit,
      exceeded: limit !== -1 && used >= limit,
    };
  }, [currentTenant]);

  // =====================================================
  // DATA EXPORT
  // =====================================================

  const requestDataExport = useCallback(async (
    type: 'full' | 'user' | 'project' = 'full',
    targetId?: string
  ): Promise<void> => {
    if (!currentTenant) throw new Error('No tenant selected');

    setError(null);

    try {
      await fetchApi(`?action=export-data&tenantId=${currentTenant.id}`, {
        method: 'POST',
        body: JSON.stringify({ exportType: type, targetId }),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to request export';
      setError(message);
      throw err;
    }
  }, [fetchApi, currentTenant]);

  // Initialize
  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  return {
    // State
    tenants,
    currentTenant,
    users,
    invites,
    domains,
    themes,
    apiKeys,
    webhooks,
    auditLogs,
    analytics,
    isLoading,
    error,

    // Computed
    isOwner,
    isAdmin,
    canManageUsers,
    canManageSettings,
    canManageBilling,

    // Tenant operations
    fetchTenants,
    createTenant,
    updateTenant,
    deleteTenant,
    switchTenant,

    // User operations
    fetchUsers,
    inviteUser,
    updateUser,
    removeUser,
    cancelInvite,
    acceptInvite,

    // Domain operations
    fetchDomains,
    addDomain,
    verifyDomain,
    removeDomain,

    // Theme operations
    fetchThemes,
    createTheme,
    updateTheme,
    activateTheme,
    deleteTheme,

    // API key operations
    fetchApiKeys,
    createApiKey,
    revokeApiKey,

    // Webhook operations
    fetchWebhooks,
    createWebhook,
    updateWebhook,
    deleteWebhook,

    // Audit operations
    fetchAuditLogs,

    // Analytics
    fetchAnalytics,

    // Plan operations
    upgradePlan,
    checkLimit,

    // Data export
    requestDataExport,
  };
}

// =====================================================
// MAPPERS
// =====================================================

function mapTenantFromApi(data: Record<string, unknown>): Tenant {
  return {
    id: data.id as string,
    slug: data.slug as string,
    name: data.name as string,
    displayName: (data.display_name || data.displayName || data.name) as string,
    description: data.description as string | undefined,
    logoUrl: (data.logo_url || data.logoUrl) as string | undefined,
    faviconUrl: (data.favicon_url || data.faviconUrl) as string | undefined,
    primaryDomain: (data.primary_domain || data.primaryDomain) as string,
    customDomains: (data.custom_domains || data.customDomains || []) as string[],
    branding: data.branding as TenantBranding,
    enabledFeatures: (data.enabled_features || data.enabledFeatures || []) as string[],
    featureLimits: (data.feature_limits || data.featureLimits) as FeatureLimits,
    plan: data.plan as TenantPlan,
    planStartDate: (data.plan_start_date || data.planStartDate) as string,
    settings: data.settings as TenantSettings,
    status: data.status as Tenant['status'],
    trialEndsAt: (data.trial_ends_at || data.trialEndsAt) as string | undefined,
    userCount: (data.user_count || data.userCount || 0) as number,
    storageUsedMb: (data.storage_used_mb || data.storageUsedMb || 0) as number,
    createdAt: (data.created_at || data.createdAt) as string,
    role: data.role as string | undefined,
  };
}

function mapUserFromApi(data: Record<string, unknown>): TenantUser {
  const userData = data.users as Record<string, unknown> | undefined;
  return {
    id: data.id as string,
    tenantId: (data.tenant_id || data.tenantId) as string,
    userId: (data.user_id || data.userId) as string,
    role: data.role as TenantRole,
    permissions: (data.permissions || []) as string[],
    email: userData?.email as string | undefined,
    name: (userData?.raw_user_meta_data as Record<string, unknown>)?.name as string | undefined,
    avatarUrl: (userData?.raw_user_meta_data as Record<string, unknown>)?.avatar_url as string | undefined,
    status: data.status as TenantUser['status'],
    createdAt: (data.created_at || data.createdAt) as string,
  };
}

function mapInviteFromApi(data: Record<string, unknown>): TenantInvite {
  return {
    id: data.id as string,
    tenantId: (data.tenant_id || data.tenantId) as string,
    email: data.email as string,
    role: data.role as TenantRole,
    expiresAt: (data.expires_at || data.expiresAt) as string,
    status: data.status as TenantInvite['status'],
    createdAt: (data.created_at || data.createdAt) as string,
  };
}

function mapDomainFromApi(data: Record<string, unknown>): Domain {
  return {
    id: data.id as string,
    tenantId: (data.tenant_id || data.tenantId) as string,
    domain: data.domain as string,
    verificationMethod: (data.verification_method || data.verificationMethod) as string,
    verificationToken: (data.verification_token || data.verificationToken) as string,
    verifiedAt: (data.verified_at || data.verifiedAt) as string | undefined,
    status: data.status as Domain['status'],
    dnsRecords: (data.dns_records || data.dnsRecords) as Domain['dnsRecords'],
    sslStatus: (data.ssl_status || data.sslStatus) as string,
    createdAt: (data.created_at || data.createdAt) as string,
  };
}

function mapThemeFromApi(data: Record<string, unknown>): Theme {
  return {
    id: data.id as string,
    tenantId: (data.tenant_id || data.tenantId) as string,
    name: data.name as string,
    branding: data.branding as TenantBranding,
    isActive: (data.is_active || data.isActive) as boolean,
    isDefault: (data.is_default || data.isDefault) as boolean,
    createdAt: (data.created_at || data.createdAt) as string,
  };
}

function mapApiKeyFromApi(data: Record<string, unknown>): ApiKey {
  return {
    id: data.id as string,
    name: data.name as string,
    keyPrefix: (data.key_prefix || data.keyPrefix) as string,
    permissions: (data.permissions || []) as string[],
    scopes: (data.scopes || []) as string[],
    rateLimit: (data.rate_limit || data.rateLimit || 1000) as number,
    lastUsedAt: (data.last_used_at || data.lastUsedAt) as string | undefined,
    usageCount: (data.usage_count || data.usageCount || 0) as number,
    isActive: (data.is_active || data.isActive) as boolean,
    expiresAt: (data.expires_at || data.expiresAt) as string | undefined,
    createdAt: (data.created_at || data.createdAt) as string,
  };
}

function mapWebhookFromApi(data: Record<string, unknown>): Webhook {
  return {
    id: data.id as string,
    name: data.name as string,
    url: data.url as string,
    events: (data.events || []) as string[],
    headers: (data.headers || {}) as Record<string, string>,
    isActive: (data.is_active || data.isActive) as boolean,
    lastTriggeredAt: (data.last_triggered_at || data.lastTriggeredAt) as string | undefined,
    lastSuccessAt: (data.last_success_at || data.lastSuccessAt) as string | undefined,
    lastFailureAt: (data.last_failure_at || data.lastFailureAt) as string | undefined,
    failureCount: (data.failure_count || data.failureCount || 0) as number,
    createdAt: (data.created_at || data.createdAt) as string,
  };
}

function mapAuditLogFromApi(data: Record<string, unknown>): AuditLog {
  return {
    id: data.id as string,
    userId: (data.user_id || data.userId) as string,
    userEmail: (data.users as Record<string, unknown>)?.email as string | undefined,
    action: data.action as string,
    resourceType: (data.resource_type || data.resourceType) as string,
    resourceId: (data.resource_id || data.resourceId) as string | undefined,
    description: data.description as string | undefined,
    changes: data.changes as AuditLog['changes'],
    ipAddress: (data.ip_address || data.ipAddress) as string | undefined,
    createdAt: (data.created_at || data.createdAt) as string,
  };
}

export default useTenant;
