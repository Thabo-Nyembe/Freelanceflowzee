'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  FolderSync,
  Plus,
  RefreshCw,
  Settings,
  Trash2,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Building2,
  Link2,
  ChevronRight,
  AlertCircle,
  Loader2,
  Shield,
  ArrowRight,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { useDirectorySync, type DirectoryProvider, type DirectoryConnection } from '@/lib/hooks/use-directory-sync'

// Demo organization ID - in production, this would come from the user's session
const DEMO_ORG_ID = '00000000-0000-0000-0000-000000000001'

interface ProviderConfig {
  azure_ad: {
    tenantId: string
    clientId: string
    clientSecret: string
  }
  google_workspace: {
    domain: string
    adminEmail: string
    serviceAccountKey: string
  }
  okta: {
    domain: string
    apiToken: string
  }
  onelogin: {
    subdomain: string
    clientId: string
    clientSecret: string
  }
  ldap: {
    url: string
    bindDn: string
    bindPassword: string
    baseDn: string
    userFilter?: string
    groupFilter?: string
  }
}

export default function DirectorySyncClient() {
  const {
    connections,
    selectedConnection,
    syncLogs,
    attributeMappings,
    stats,
    isLoading,
    isSyncing,
    fetchConnections,
    fetchConnection,
    createConnection,
    updateConnection,
    deleteConnection,
    triggerSync,
    fetchSyncLogs,
    fetchMappings,
    updateMappings,
    getProviderLabel,
    getProviderIcon
  } = useDirectorySync()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<DirectoryProvider>('azure_ad')
  const [connectionName, setConnectionName] = useState('')
  const [providerConfig, setProviderConfig] = useState<Partial<ProviderConfig[keyof ProviderConfig]>>({})
  const [syncOptions, setSyncOptions] = useState({
    autoProvision: true,
    autoDeprovision: false,
    syncGroups: true,
    syncInterval: 3600
  })

  // Fetch connections on mount
  useEffect(() => {
    fetchConnections(DEMO_ORG_ID)
  }, [fetchConnections])

  // Handle connection selection
  const handleSelectConnection = async (connection: DirectoryConnection) => {
    await fetchConnection(connection.id)
    await fetchSyncLogs(connection.id)
  }

  // Handle create connection
  const handleCreateConnection = async () => {
    if (!connectionName.trim()) {
      toast.error('Connection name is required')
      return
    }

    const result = await createConnection({
      organizationId: DEMO_ORG_ID,
      provider: selectedProvider,
      name: connectionName,
      config: providerConfig,
      syncOptions
    })

    if (result) {
      setIsCreateDialogOpen(false)
      setConnectionName('')
      setProviderConfig({})
      setSelectedProvider('azure_ad')
    }
  }

  // Handle delete connection
  const handleDeleteConnection = async (connectionId: string) => {
    await deleteConnection(connectionId)
  }

  // Handle trigger sync
  const handleTriggerSync = async (connectionId: string, syncType: 'full' | 'incremental') => {
    await triggerSync(connectionId, syncType)
  }

  // Handle toggle connection active
  const handleToggleActive = async (connection: DirectoryConnection) => {
    await updateConnection(connection.id, { isActive: !connection.is_active })
    await fetchConnections(DEMO_ORG_ID)
  }

  // Format duration
  const formatDuration = (ms: number | null): string => {
    if (!ms) return '-'
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  // Format date
  const formatDate = (date: string | null): string => {
    if (!date) return 'Never'
    return new Date(date).toLocaleString()
  }

  // Get status badge color
  const getStatusColor = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'success': return 'default'
      case 'syncing':
      case 'in_progress': return 'secondary'
      case 'failure':
      case 'error': return 'destructive'
      default: return 'outline'
    }
  }

  // Render provider config form
  const renderProviderConfigForm = () => {
    switch (selectedProvider) {
      case 'azure_ad':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tenant ID</Label>
              <Input
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                value={(providerConfig as ProviderConfig['azure_ad'])?.tenantId || ''}
                onChange={e => setProviderConfig(prev => ({ ...prev, tenantId: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Client ID</Label>
              <Input
                placeholder="Application (client) ID"
                value={(providerConfig as ProviderConfig['azure_ad'])?.clientId || ''}
                onChange={e => setProviderConfig(prev => ({ ...prev, clientId: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Client Secret</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={(providerConfig as ProviderConfig['azure_ad'])?.clientSecret || ''}
                onChange={e => setProviderConfig(prev => ({ ...prev, clientSecret: e.target.value }))}
              />
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                <strong>Required Permissions:</strong> User.Read.All, Group.Read.All, Directory.Read.All
              </p>
            </div>
          </div>
        )

      case 'google_workspace':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Domain</Label>
              <Input
                placeholder="example.com"
                value={(providerConfig as ProviderConfig['google_workspace'])?.domain || ''}
                onChange={e => setProviderConfig(prev => ({ ...prev, domain: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Admin Email</Label>
              <Input
                type="email"
                placeholder="admin@example.com"
                value={(providerConfig as ProviderConfig['google_workspace'])?.adminEmail || ''}
                onChange={e => setProviderConfig(prev => ({ ...prev, adminEmail: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Service Account Key (JSON)</Label>
              <textarea
                className="w-full h-24 p-2 border rounded-md text-sm font-mono"
                placeholder='{"type": "service_account", ...}'
                value={(providerConfig as ProviderConfig['google_workspace'])?.serviceAccountKey || ''}
                onChange={e => setProviderConfig(prev => ({ ...prev, serviceAccountKey: e.target.value }))}
              />
            </div>
          </div>
        )

      case 'okta':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Okta Domain</Label>
              <Input
                placeholder="your-company.okta.com"
                value={(providerConfig as ProviderConfig['okta'])?.domain || ''}
                onChange={e => setProviderConfig(prev => ({ ...prev, domain: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>API Token</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={(providerConfig as ProviderConfig['okta'])?.apiToken || ''}
                onChange={e => setProviderConfig(prev => ({ ...prev, apiToken: e.target.value }))}
              />
            </div>
          </div>
        )

      case 'onelogin':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Subdomain</Label>
              <Input
                placeholder="your-company"
                value={(providerConfig as ProviderConfig['onelogin'])?.subdomain || ''}
                onChange={e => setProviderConfig(prev => ({ ...prev, subdomain: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Client ID</Label>
              <Input
                placeholder="Client ID"
                value={(providerConfig as ProviderConfig['onelogin'])?.clientId || ''}
                onChange={e => setProviderConfig(prev => ({ ...prev, clientId: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Client Secret</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={(providerConfig as ProviderConfig['onelogin'])?.clientSecret || ''}
                onChange={e => setProviderConfig(prev => ({ ...prev, clientSecret: e.target.value }))}
              />
            </div>
          </div>
        )

      case 'ldap':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>LDAP URL</Label>
              <Input
                placeholder="ldaps://ldap.example.com:636"
                value={(providerConfig as ProviderConfig['ldap'])?.url || ''}
                onChange={e => setProviderConfig(prev => ({ ...prev, url: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Bind DN</Label>
              <Input
                placeholder="cn=admin,dc=example,dc=com"
                value={(providerConfig as ProviderConfig['ldap'])?.bindDn || ''}
                onChange={e => setProviderConfig(prev => ({ ...prev, bindDn: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Bind Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={(providerConfig as ProviderConfig['ldap'])?.bindPassword || ''}
                onChange={e => setProviderConfig(prev => ({ ...prev, bindPassword: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Base DN</Label>
              <Input
                placeholder="dc=example,dc=com"
                value={(providerConfig as ProviderConfig['ldap'])?.baseDn || ''}
                onChange={e => setProviderConfig(prev => ({ ...prev, baseDn: e.target.value }))}
              />
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <FolderSync className="h-8 w-8 text-blue-600" />
              Directory Sync
            </h1>
            <p className="text-muted-foreground">
              Connect your identity provider to automatically provision and deprovision users
            </p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Connection
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Directory Connection</DialogTitle>
                <DialogDescription>
                  Connect to your identity provider for automated user provisioning
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label>Connection Name</Label>
                  <Input
                    placeholder="My Azure AD Connection"
                    value={connectionName}
                    onChange={e => setConnectionName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Identity Provider</Label>
                  <Select
                    value={selectedProvider}
                    onValueChange={v => setSelectedProvider(v as DirectoryProvider)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="azure_ad">
                        <span className="flex items-center gap-2">
                          🔷 Microsoft Entra ID (Azure AD)
                        </span>
                      </SelectItem>
                      <SelectItem value="google_workspace">
                        <span className="flex items-center gap-2">
                          🔵 Google Workspace
                        </span>
                      </SelectItem>
                      <SelectItem value="okta">
                        <span className="flex items-center gap-2">
                          ⚪ Okta
                        </span>
                      </SelectItem>
                      <SelectItem value="onelogin">
                        <span className="flex items-center gap-2">
                          🟣 OneLogin
                        </span>
                      </SelectItem>
                      <SelectItem value="ldap">
                        <span className="flex items-center gap-2">
                          📁 LDAP / Active Directory
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Provider Configuration</h4>
                  {renderProviderConfigForm()}
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Sync Options</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto-provision users</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically create users when they are added in the IdP
                        </p>
                      </div>
                      <Switch
                        checked={syncOptions.autoProvision}
                        onCheckedChange={v => setSyncOptions(prev => ({ ...prev, autoProvision: v }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto-deprovision users</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically suspend users when removed from the IdP
                        </p>
                      </div>
                      <Switch
                        checked={syncOptions.autoDeprovision}
                        onCheckedChange={v => setSyncOptions(prev => ({ ...prev, autoDeprovision: v }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Sync groups</Label>
                        <p className="text-sm text-muted-foreground">
                          Sync group memberships from the IdP
                        </p>
                      </div>
                      <Switch
                        checked={syncOptions.syncGroups}
                        onCheckedChange={v => setSyncOptions(prev => ({ ...prev, syncGroups: v }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Sync Interval</Label>
                      <Select
                        value={syncOptions.syncInterval.toString()}
                        onValueChange={v => setSyncOptions(prev => ({ ...prev, syncInterval: parseInt(v) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="900">Every 15 minutes</SelectItem>
                          <SelectItem value="1800">Every 30 minutes</SelectItem>
                          <SelectItem value="3600">Every hour</SelectItem>
                          <SelectItem value="7200">Every 2 hours</SelectItem>
                          <SelectItem value="21600">Every 6 hours</SelectItem>
                          <SelectItem value="86400">Daily</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateConnection} disabled={isLoading}>
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Connection
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                  <Link2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{connections.length}</p>
                  <p className="text-sm text-muted-foreground">Connections</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {connections.filter(c => c.is_active && c.sync_status === 'idle').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {connections.reduce((sum, c) => sum + c.total_users_synced, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Users Synced</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
                  <Building2 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {connections.reduce((sum, c) => sum + c.total_groups_synced, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Groups Synced</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Connections List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Connections */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Connections</CardTitle>
              <CardDescription>
                Your configured identity provider connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && connections.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : connections.length === 0 ? (
                <div className="text-center py-8">
                  <FolderSync className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No connections configured</p>
                  <Button
                    variant="link"
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="mt-2"
                  >
                    Add your first connection
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {connections.map(connection => (
                    <button
                      key={connection.id}
                      onClick={() => handleSelectConnection(connection)}
                      className={`w-full p-4 rounded-lg border text-left transition-colors hover:bg-accent ${
                        selectedConnection?.id === connection.id
                          ? 'bg-accent border-primary'
                          : 'bg-card'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getProviderIcon(connection.provider)}</span>
                          <div>
                            <p className="font-medium">{connection.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {getProviderLabel(connection.provider)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusColor(connection.sync_status)}>
                            {connection.sync_status === 'syncing' && (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            )}
                            {connection.sync_status}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Connection Details */}
          <Card className="lg:col-span-2">
            {selectedConnection ? (
              <>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{getProviderIcon(selectedConnection.provider)}</span>
                      <div>
                        <CardTitle>{selectedConnection.name}</CardTitle>
                        <CardDescription>
                          {getProviderLabel(selectedConnection.provider)}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={selectedConnection.is_active}
                        onCheckedChange={() => handleToggleActive(selectedConnection)}
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Connection</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this connection? This will stop
                              all user provisioning from this identity provider.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteConnection(selectedConnection.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview">
                    <TabsList>
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="logs">Sync Logs</TabsTrigger>
                      <TabsTrigger value="mappings">Attribute Mappings</TabsTrigger>
                      <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6 mt-6">
                      {/* Sync Actions */}
                      <div className="flex items-center gap-4">
                        <Button
                          onClick={() => handleTriggerSync(selectedConnection.id, 'incremental')}
                          disabled={isSyncing || selectedConnection.sync_status === 'syncing' || !selectedConnection.is_active}
                        >
                          {(isSyncing || selectedConnection.sync_status === 'syncing') ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                          )}
                          Sync Now
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleTriggerSync(selectedConnection.id, 'full')}
                          disabled={isSyncing || selectedConnection.sync_status === 'syncing' || !selectedConnection.is_active}
                        >
                          Full Sync
                        </Button>
                      </div>

                      {/* Stats */}
                      {stats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-4 rounded-lg bg-muted">
                            <p className="text-sm text-muted-foreground">Total Syncs</p>
                            <p className="text-2xl font-bold">{stats.total_syncs}</p>
                          </div>
                          <div className="p-4 rounded-lg bg-muted">
                            <p className="text-sm text-muted-foreground">Success Rate</p>
                            <p className="text-2xl font-bold">
                              {stats.total_syncs > 0
                                ? ((stats.successful_syncs / stats.total_syncs) * 100).toFixed(0)
                                : 0}%
                            </p>
                          </div>
                          <div className="p-4 rounded-lg bg-muted">
                            <p className="text-sm text-muted-foreground">Users Created</p>
                            <p className="text-2xl font-bold">{stats.total_users_created}</p>
                          </div>
                          <div className="p-4 rounded-lg bg-muted">
                            <p className="text-sm text-muted-foreground">Avg Duration</p>
                            <p className="text-2xl font-bold">{formatDuration(stats.avg_duration_ms)}</p>
                          </div>
                        </div>
                      )}

                      {/* Last Sync Info */}
                      <div className="p-4 rounded-lg border">
                        <h4 className="font-medium mb-3">Last Sync</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Started</span>
                            <span>{formatDate(selectedConnection.last_sync_started_at)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Completed</span>
                            <span>{formatDate(selectedConnection.last_sync_completed_at)}</span>
                          </div>
                          {selectedConnection.last_sync_error && (
                            <div className="flex items-start gap-2 p-2 mt-2 rounded bg-destructive/10 text-destructive">
                              <AlertCircle className="h-4 w-4 mt-0.5" />
                              <span>{selectedConnection.last_sync_error}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="logs" className="mt-6">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Operation</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Users</TableHead>
                            <TableHead>Groups</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Time</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {syncLogs.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                No sync logs yet
                              </TableCell>
                            </TableRow>
                          ) : (
                            syncLogs.map(log => (
                              <TableRow key={log.id}>
                                <TableCell className="font-medium">
                                  {log.operation.replace(/_/g, ' ')}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={getStatusColor(log.status)}>
                                    {log.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  +{log.users_created} / ~{log.users_updated}
                                </TableCell>
                                <TableCell>{log.groups_synced}</TableCell>
                                <TableCell>{formatDuration(log.duration_ms)}</TableCell>
                                <TableCell className="text-muted-foreground">
                                  {formatDate(log.created_at)}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TabsContent>

                    <TabsContent value="mappings" className="mt-6">
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Configure how attributes from your identity provider map to FreeFlow user fields.
                        </p>

                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Source Attribute</TableHead>
                              <TableHead>
                                <ArrowRight className="h-4 w-4" />
                              </TableHead>
                              <TableHead>FreeFlow Field</TableHead>
                              <TableHead>Transform</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {attributeMappings.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                  Using default mappings
                                </TableCell>
                              </TableRow>
                            ) : (
                              attributeMappings.map(mapping => (
                                <TableRow key={mapping.id}>
                                  <TableCell className="font-mono text-sm">
                                    {mapping.source_attribute}
                                  </TableCell>
                                  <TableCell>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                  </TableCell>
                                  <TableCell>{mapping.target_attribute}</TableCell>
                                  <TableCell className="text-muted-foreground">
                                    {mapping.transform || '-'}
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>

                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure Mappings
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="settings" className="mt-6">
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <h4 className="font-medium">Sync Options</h4>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Auto-provision users</p>
                                <p className="text-sm text-muted-foreground">
                                  Automatically create users when added in IdP
                                </p>
                              </div>
                              <Switch
                                checked={selectedConnection.sync_options?.autoProvision ?? true}
                                onCheckedChange={async (v) => {
                                  await updateConnection(selectedConnection.id, {
                                    syncOptions: {
                                      ...selectedConnection.sync_options,
                                      autoProvision: v
                                    }
                                  })
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Auto-deprovision users</p>
                                <p className="text-sm text-muted-foreground">
                                  Automatically suspend users when removed from IdP
                                </p>
                              </div>
                              <Switch
                                checked={selectedConnection.sync_options?.autoDeprovision ?? false}
                                onCheckedChange={async (v) => {
                                  await updateConnection(selectedConnection.id, {
                                    syncOptions: {
                                      ...selectedConnection.sync_options,
                                      autoDeprovision: v
                                    }
                                  })
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Sync groups</p>
                                <p className="text-sm text-muted-foreground">
                                  Sync group memberships from IdP
                                </p>
                              </div>
                              <Switch
                                checked={selectedConnection.sync_options?.syncGroups ?? true}
                                onCheckedChange={async (v) => {
                                  await updateConnection(selectedConnection.id, {
                                    syncOptions: {
                                      ...selectedConnection.sync_options,
                                      syncGroups: v
                                    }
                                  })
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/5">
                          <h4 className="font-medium text-destructive mb-2">Danger Zone</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Deleting this connection will stop all automated user provisioning.
                          </p>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Connection
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Connection</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteConnection(selectedConnection.id)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Shield className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="text-lg font-medium mb-2">No Connection Selected</p>
                <p className="text-muted-foreground text-center mb-4">
                  Select a connection from the list or create a new one
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Connection
                </Button>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
