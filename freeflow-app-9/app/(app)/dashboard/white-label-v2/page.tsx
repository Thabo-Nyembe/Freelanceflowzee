'use client';

import { useState, useEffect } from 'react';
import { useTenant } from '@/lib/hooks/use-tenant';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import {
  Building2,
  Users,
  Globe,
  Palette,
  Key,
  Webhook,
  Shield,
  FileText,
  Settings,
  Plus,
  Copy,
  Trash2,
  Check,
  X,
  RefreshCw,
  Download,
  Upload,
  Eye,
  EyeOff,
  Crown,
  AlertTriangle,
  Clock,
  Activity,
  BarChart3,
  Zap,
} from 'lucide-react';

export default function WhiteLabelPage() {
  const {
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
    isOwner,
    isAdmin,
    canManageUsers,
    canManageSettings,
    fetchTenants,
    createTenant,
    updateTenant,
    switchTenant,
    fetchUsers,
    inviteUser,
    updateUser,
    removeUser,
    cancelInvite,
    fetchDomains,
    addDomain,
    verifyDomain,
    removeDomain,
    fetchThemes,
    createTheme,
    activateTheme,
    deleteTheme,
    fetchApiKeys,
    createApiKey,
    revokeApiKey,
    fetchWebhooks,
    createWebhook,
    deleteWebhook,
    fetchAuditLogs,
    fetchAnalytics,
    upgradePlan,
    checkLimit,
    requestDataExport,
  } = useTenant();

  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateTenant, setShowCreateTenant] = useState(false);
  const [showInviteUser, setShowInviteUser] = useState(false);
  const [showAddDomain, setShowAddDomain] = useState(false);
  const [showCreateTheme, setShowCreateTheme] = useState(false);
  const [showCreateApiKey, setShowCreateApiKey] = useState(false);
  const [showCreateWebhook, setShowCreateWebhook] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);

  // Form states
  const [newTenant, setNewTenant] = useState({ name: '', slug: '', plan: 'starter' });
  const [newInvite, setNewInvite] = useState({ email: '', role: 'member' });
  const [newDomain, setNewDomain] = useState('');
  const [newThemeName, setNewThemeName] = useState('');
  const [newKeyName, setNewKeyName] = useState('');
  const [newWebhook, setNewWebhook] = useState({ name: '', url: '', events: [] as string[] });

  // Load data when tenant changes
  useEffect(() => {
    if (currentTenant) {
      fetchUsers();
      fetchDomains();
      fetchThemes();
      fetchApiKeys();
      fetchWebhooks();
      fetchAuditLogs();
      fetchAnalytics();
    }
  }, [currentTenant, fetchUsers, fetchDomains, fetchThemes, fetchApiKeys, fetchWebhooks, fetchAuditLogs, fetchAnalytics]);

  // Handlers
  const handleCreateTenant = async () => {
    try {
      await createTenant({
        name: newTenant.name,
        slug: newTenant.slug,
        plan: newTenant.plan as 'starter' | 'professional' | 'business' | 'enterprise',
      });
      setShowCreateTenant(false);
      setNewTenant({ name: '', slug: '', plan: 'starter' });
      toast.success('Organization created successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create organization');
    }
  };

  const handleInviteUser = async () => {
    try {
      await inviteUser(newInvite.email, newInvite.role as 'admin' | 'manager' | 'member' | 'viewer');
      setShowInviteUser(false);
      setNewInvite({ email: '', role: 'member' });
      toast.success('Invitation sent');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send invitation');
    }
  };

  const handleAddDomain = async () => {
    try {
      await addDomain(newDomain);
      setShowAddDomain(false);
      setNewDomain('');
      toast.success('Domain added. Please verify DNS records.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add domain');
    }
  };

  const handleCreateTheme = async () => {
    try {
      await createTheme(newThemeName, currentTenant?.branding || {} as never);
      setShowCreateTheme(false);
      setNewThemeName('');
      toast.success('Theme created');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create theme');
    }
  };

  const handleCreateApiKey = async () => {
    try {
      const key = await createApiKey({ name: newKeyName });
      setNewApiKey(key.key || null);
      setNewKeyName('');
      toast.success('API key created');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create API key');
    }
  };

  const handleCreateWebhook = async () => {
    try {
      await createWebhook({
        name: newWebhook.name,
        url: newWebhook.url,
        events: newWebhook.events,
      });
      setShowCreateWebhook(false);
      setNewWebhook({ name: '', url: '', events: [] });
      toast.success('Webhook created');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create webhook');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (isLoading && !currentTenant) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const userLimit = checkLimit('maxUsers');
  const storageLimit = checkLimit('maxStorage');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              White-Label Admin
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your organization, branding, and integrations
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Tenant Selector */}
            <Select
              value={currentTenant?.id}
              onValueChange={switchTenant}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                {tenants.map(tenant => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {tenant.name}
                      {tenant.status === 'trial' && (
                        <Badge variant="secondary" className="ml-2">Trial</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Dialog open={showCreateTenant} onOpenChange={setShowCreateTenant}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Organization
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Organization</DialogTitle>
                  <DialogDescription>
                    Create a new white-label organization
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Organization Name</Label>
                    <Input
                      value={newTenant.name}
                      onChange={e => setNewTenant(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Acme Corp"
                    />
                  </div>
                  <div>
                    <Label>Slug (URL)</Label>
                    <Input
                      value={newTenant.slug}
                      onChange={e => setNewTenant(prev => ({
                        ...prev,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                      }))}
                      placeholder="acme-corp"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Your URL: {newTenant.slug || 'your-org'}.freeflow.io
                    </p>
                  </div>
                  <div>
                    <Label>Plan</Label>
                    <Select
                      value={newTenant.plan}
                      onValueChange={plan => setNewTenant(prev => ({ ...prev, plan }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="starter">Starter (14-day trial)</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateTenant(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTenant}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Trial Warning */}
        {currentTenant?.status === 'trial' && currentTenant.trialEndsAt && (
          <Card className="border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">
                    Trial Period
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Your trial ends {new Date(currentTenant.trialEndsAt).toLocaleDateString()}.
                    Upgrade to continue using all features.
                  </p>
                </div>
              </div>
              <Button onClick={() => upgradePlan('professional')}>
                <Crown className="h-4 w-4 mr-2" />
                Upgrade Now
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 p-1">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="branding" className="gap-2">
              <Palette className="h-4 w-4" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="domains" className="gap-2">
              <Globe className="h-4 w-4" />
              Domains
            </TabsTrigger>
            <TabsTrigger value="api" className="gap-2">
              <Key className="h-4 w-4" />
              API & Webhooks
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2">
              <FileText className="h-4 w-4" />
              Audit Log
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Users</p>
                      <p className="text-2xl font-bold">
                        {currentTenant?.userCount || 0}
                        {userLimit.limit !== Infinity && (
                          <span className="text-sm text-gray-400 font-normal">
                            /{userLimit.limit}
                          </span>
                        )}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                  {userLimit.limit !== Infinity && (
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${Math.min((userLimit.used / userLimit.limit) * 100, 100)}%` }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Storage</p>
                      <p className="text-2xl font-bold">
                        {((currentTenant?.storageUsedMb || 0) / 1024).toFixed(1)} GB
                        {storageLimit.limit !== Infinity && (
                          <span className="text-sm text-gray-400 font-normal">
                            /{(storageLimit.limit / 1024).toFixed(0)} GB
                          </span>
                        )}
                      </p>
                    </div>
                    <Activity className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Plan</p>
                      <p className="text-2xl font-bold capitalize">{currentTenant?.plan}</p>
                    </div>
                    <Crown className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Domains</p>
                      <p className="text-2xl font-bold">{domains.length}</p>
                    </div>
                    <Globe className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analytics */}
            {analytics && (
              <Card>
                <CardHeader>
                  <CardTitle>Activity Overview</CardTitle>
                  <CardDescription>Last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-3xl font-bold text-blue-600">{analytics.activity.logins}</p>
                      <p className="text-sm text-gray-500">Logins</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-3xl font-bold text-green-600">{analytics.activity.projectsCreated}</p>
                      <p className="text-sm text-gray-500">Projects Created</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-3xl font-bold text-purple-600">{analytics.activity.tasksCompleted}</p>
                      <p className="text-sm text-gray-500">Tasks Completed</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-3xl font-bold text-orange-600">{analytics.activity.invoicesSent}</p>
                      <p className="text-sm text-gray-500">Invoices Sent</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto flex-col py-4" onClick={() => setShowInviteUser(true)}>
                  <Users className="h-6 w-6 mb-2" />
                  Invite Team
                </Button>
                <Button variant="outline" className="h-auto flex-col py-4" onClick={() => setShowAddDomain(true)}>
                  <Globe className="h-6 w-6 mb-2" />
                  Add Domain
                </Button>
                <Button variant="outline" className="h-auto flex-col py-4" onClick={() => setShowCreateApiKey(true)}>
                  <Key className="h-6 w-6 mb-2" />
                  Create API Key
                </Button>
                <Button variant="outline" className="h-auto flex-col py-4" onClick={() => requestDataExport()}>
                  <Download className="h-6 w-6 mb-2" />
                  Export Data
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Brand Settings</CardTitle>
                <CardDescription>Customize your organization&apos;s appearance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo */}
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="flex items-center gap-4">
                    {currentTenant?.branding?.logoUrl ? (
                      <img
                        src={currentTenant.branding.logoUrl}
                        alt="Logo"
                        className="h-12 object-contain"
                      />
                    ) : (
                      <div className="h-12 w-32 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </Button>
                  </div>
                </div>

                {/* Colors */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Primary Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="h-10 w-10 rounded border"
                        style={{ backgroundColor: currentTenant?.branding?.primaryColor || '#3B82F6' }}
                      />
                      <Input
                        value={currentTenant?.branding?.primaryColor || '#3B82F6'}
                        onChange={e => updateTenant({
                          branding: {
                            ...currentTenant?.branding,
                            primaryColor: e.target.value,
                          } as never
                        })}
                        className="font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Secondary Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="h-10 w-10 rounded border"
                        style={{ backgroundColor: currentTenant?.branding?.secondaryColor || '#1E40AF' }}
                      />
                      <Input
                        value={currentTenant?.branding?.secondaryColor || '#1E40AF'}
                        className="font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Accent Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="h-10 w-10 rounded border"
                        style={{ backgroundColor: currentTenant?.branding?.accentColor || '#10B981' }}
                      />
                      <Input
                        value={currentTenant?.branding?.accentColor || '#10B981'}
                        className="font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Font */}
                <div>
                  <Label>Font Family</Label>
                  <Select defaultValue="inter">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inter">Inter</SelectItem>
                      <SelectItem value="roboto">Roboto</SelectItem>
                      <SelectItem value="opensans">Open Sans</SelectItem>
                      <SelectItem value="poppins">Poppins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Themes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Themes</CardTitle>
                  <CardDescription>Manage your saved themes</CardDescription>
                </div>
                <Dialog open={showCreateTheme} onOpenChange={setShowCreateTheme}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Theme
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Theme</DialogTitle>
                      <DialogDescription>
                        Save current branding as a new theme
                      </DialogDescription>
                    </DialogHeader>
                    <div>
                      <Label>Theme Name</Label>
                      <Input
                        value={newThemeName}
                        onChange={e => setNewThemeName(e.target.value)}
                        placeholder="Dark Corporate"
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowCreateTheme(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateTheme}>Create</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {themes.map(theme => (
                    <Card key={theme.id} className={theme.isActive ? 'border-primary' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-6 w-6 rounded"
                              style={{ backgroundColor: theme.branding.primaryColor }}
                            />
                            <span className="font-medium">{theme.name}</span>
                          </div>
                          {theme.isActive && <Badge>Active</Badge>}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => activateTheme(theme.id)}
                            disabled={theme.isActive}
                          >
                            Activate
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTheme(theme.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    {users.length} of {userLimit.limit === Infinity ? '∞' : userLimit.limit} users
                  </CardDescription>
                </div>
                <Dialog open={showInviteUser} onOpenChange={setShowInviteUser}>
                  <DialogTrigger asChild>
                    <Button disabled={!canManageUsers || userLimit.exceeded}>
                      <Plus className="h-4 w-4 mr-2" />
                      Invite User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite Team Member</DialogTitle>
                      <DialogDescription>
                        Send an invitation to join your organization
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Email Address</Label>
                        <Input
                          type="email"
                          value={newInvite.email}
                          onChange={e => setNewInvite(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="colleague@example.com"
                        />
                      </div>
                      <div>
                        <Label>Role</Label>
                        <Select
                          value={newInvite.role}
                          onValueChange={role => setNewInvite(prev => ({ ...prev, role }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowInviteUser(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleInviteUser}>Send Invite</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(user => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              {user.name?.[0] || user.email?.[0] || '?'}
                            </div>
                            <div>
                              <p className="font-medium">{user.name || 'Unknown'}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'owner' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'active' ? 'outline' : 'secondary'}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {user.role !== 'owner' && canManageUsers && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeUser(user.userId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pending Invites */}
                {invites.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Pending Invitations</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Expires</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invites.map(invite => (
                          <TableRow key={invite.id}>
                            <TableCell>{invite.email}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{invite.role}</Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(invite.expiresAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => cancelInvite(invite.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Domains Tab */}
          <TabsContent value="domains" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Custom Domains</CardTitle>
                  <CardDescription>Configure your own domains</CardDescription>
                </div>
                <Dialog open={showAddDomain} onOpenChange={setShowAddDomain}>
                  <DialogTrigger asChild>
                    <Button disabled={!isAdmin}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Domain
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Custom Domain</DialogTitle>
                      <DialogDescription>
                        Enter your domain name to start verification
                      </DialogDescription>
                    </DialogHeader>
                    <div>
                      <Label>Domain</Label>
                      <Input
                        value={newDomain}
                        onChange={e => setNewDomain(e.target.value)}
                        placeholder="app.yourdomain.com"
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAddDomain(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddDomain}>Add Domain</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {/* Primary Domain */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{currentTenant?.primaryDomain}</p>
                        <p className="text-sm text-gray-500">Primary subdomain</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      <Check className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </div>

                {/* Custom Domains */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Domain</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>SSL</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {domains.map(domain => (
                      <TableRow key={domain.id}>
                        <TableCell className="font-medium">{domain.domain}</TableCell>
                        <TableCell>
                          <Badge
                            variant={domain.status === 'verified' ? 'outline' : 'secondary'}
                            className={domain.status === 'verified' ? 'text-green-600' : ''}
                          >
                            {domain.status === 'verified' ? (
                              <Check className="h-3 w-3 mr-1" />
                            ) : (
                              <Clock className="h-3 w-3 mr-1" />
                            )}
                            {domain.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={domain.sslStatus === 'active' ? 'outline' : 'secondary'}
                            className={domain.sslStatus === 'active' ? 'text-green-600' : ''}
                          >
                            {domain.sslStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {domain.status === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => verifyDomain(domain.id)}
                              >
                                Verify
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDomain(domain.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {domains.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-500">
                          No custom domains added yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* DNS Instructions */}
                {domains.some(d => d.status === 'pending') && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                      DNS Configuration
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                      Add the following DNS records to verify your domain:
                    </p>
                    {domains
                      .filter(d => d.status === 'pending')
                      .map(domain => (
                        <div key={domain.id} className="space-y-2">
                          {domain.dnsRecords?.map((record, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded font-mono text-sm"
                            >
                              <span>
                                {record.type}: {record.name} → {record.value.substring(0, 30)}...
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(record.value)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* API & Webhooks Tab */}
          <TabsContent value="api" className="space-y-6">
            {/* API Keys */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>Manage API access to your organization</CardDescription>
                </div>
                <Dialog open={showCreateApiKey} onOpenChange={setShowCreateApiKey}>
                  <DialogTrigger asChild>
                    <Button disabled={!isAdmin}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Key
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create API Key</DialogTitle>
                      <DialogDescription>
                        Generate a new API key for programmatic access
                      </DialogDescription>
                    </DialogHeader>
                    {newApiKey ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                            Copy your API key now. You won&apos;t be able to see it again!
                          </p>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 p-2 bg-white dark:bg-gray-800 rounded font-mono text-sm">
                              {newApiKey}
                            </code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(newApiKey)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => {
                            setNewApiKey(null);
                            setShowCreateApiKey(false);
                          }}
                        >
                          Done
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <Label>Key Name</Label>
                          <Input
                            value={newKeyName}
                            onChange={e => setNewKeyName(e.target.value)}
                            placeholder="Production API Key"
                          />
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowCreateApiKey(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreateApiKey}>Create</Button>
                        </DialogFooter>
                      </>
                    )}
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Key</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead>Calls</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map(key => (
                      <TableRow key={key.id}>
                        <TableCell className="font-medium">{key.name}</TableCell>
                        <TableCell>
                          <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {key.keyPrefix}...
                          </code>
                        </TableCell>
                        <TableCell>
                          {key.lastUsedAt
                            ? new Date(key.lastUsedAt).toLocaleDateString()
                            : 'Never'}
                        </TableCell>
                        <TableCell>{key.usageCount.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => revokeApiKey(key.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {apiKeys.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500">
                          No API keys created yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Webhooks */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Webhooks</CardTitle>
                  <CardDescription>Receive real-time notifications</CardDescription>
                </div>
                <Dialog open={showCreateWebhook} onOpenChange={setShowCreateWebhook}>
                  <DialogTrigger asChild>
                    <Button disabled={!isAdmin}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Webhook
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Webhook</DialogTitle>
                      <DialogDescription>
                        Configure a webhook endpoint to receive events
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={newWebhook.name}
                          onChange={e => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Production Webhook"
                        />
                      </div>
                      <div>
                        <Label>URL</Label>
                        <Input
                          value={newWebhook.url}
                          onChange={e => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                          placeholder="https://api.example.com/webhooks"
                        />
                      </div>
                      <div>
                        <Label>Events</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {['project.created', 'task.completed', 'invoice.paid', 'user.joined'].map(event => (
                            <label key={event} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={newWebhook.events.includes(event)}
                                onChange={e => {
                                  if (e.target.checked) {
                                    setNewWebhook(prev => ({
                                      ...prev,
                                      events: [...prev.events, event]
                                    }));
                                  } else {
                                    setNewWebhook(prev => ({
                                      ...prev,
                                      events: prev.events.filter(ev => ev !== event)
                                    }));
                                  }
                                }}
                                className="rounded"
                              />
                              <span className="text-sm">{event}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowCreateWebhook(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateWebhook}>Create</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Events</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {webhooks.map(webhook => (
                      <TableRow key={webhook.id}>
                        <TableCell className="font-medium">{webhook.name}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {webhook.url}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{webhook.events.length} events</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={webhook.isActive ? 'outline' : 'secondary'}>
                            {webhook.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteWebhook(webhook.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {webhooks.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500">
                          No webhooks configured yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Configure authentication and access controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Require MFA</p>
                    <p className="text-sm text-gray-500">
                      Require all users to enable two-factor authentication
                    </p>
                  </div>
                  <Switch
                    checked={currentTenant?.settings?.requireMfa}
                    onCheckedChange={checked => updateTenant({
                      settings: {
                        ...currentTenant?.settings,
                        requireMfa: checked,
                      } as never
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Session Timeout</p>
                    <p className="text-sm text-gray-500">
                      Automatically log out inactive users
                    </p>
                  </div>
                  <Select defaultValue="30">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="480">8 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Password Policy</p>
                    <p className="text-sm text-gray-500">
                      Minimum 8 characters, uppercase, numbers required
                    </p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SSO / SAML</p>
                    <p className="text-sm text-gray-500">
                      Enable single sign-on for your organization
                    </p>
                  </div>
                  <Badge variant="secondary">Enterprise</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data & Privacy</CardTitle>
                <CardDescription>GDPR and data handling settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">GDPR Compliant</p>
                    <p className="text-sm text-gray-500">
                      Enable GDPR compliance features
                    </p>
                  </div>
                  <Switch checked={currentTenant?.settings?.gdprCompliant} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Data Retention</p>
                    <p className="text-sm text-gray-500">
                      How long to keep user data after account deletion
                    </p>
                  </div>
                  <Select defaultValue="365">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                      <SelectItem value="730">2 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Export All Data</p>
                    <p className="text-sm text-gray-500">
                      Download all organization data in JSON format
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => requestDataExport()}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Audit Log</CardTitle>
                <CardDescription>Track all changes and activities</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map(log => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>{log.userEmail || 'System'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.action}</Badge>
                        </TableCell>
                        <TableCell>
                          {log.resourceType}
                          {log.resourceId && (
                            <span className="text-gray-400 text-xs ml-1">
                              #{log.resourceId.substring(0, 8)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {log.ipAddress || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                    {auditLogs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500">
                          No audit logs yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
