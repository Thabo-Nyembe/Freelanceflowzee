'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Key, Shield, Users, CheckCircle, XCircle, Settings, Plus, ExternalLink, RefreshCw } from 'lucide-react'

const ssoProviders = [
  { id: 1, name: 'Google Workspace', type: 'oauth', status: 'active', users: 145, lastSync: '2024-01-15 10:30', icon: '🔵' },
  { id: 2, name: 'Microsoft Azure AD', type: 'saml', status: 'active', users: 89, lastSync: '2024-01-15 09:45', icon: '🟦' },
  { id: 3, name: 'Okta', type: 'saml', status: 'inactive', users: 0, lastSync: 'Never', icon: '🟣' },
  { id: 4, name: 'OneLogin', type: 'oauth', status: 'configured', users: 0, lastSync: 'Never', icon: '🟢' },
]

export default function SsoClient() {
  const [enforceSSO, setEnforceSSO] = useState(false)

  const stats = {
    providers: ssoProviders.filter(p => p.status === 'active').length,
    totalUsers: ssoProviders.reduce((sum, p) => sum + p.users, 0),
    configured: ssoProviders.filter(p => p.status !== 'inactive').length,
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = { active: 'bg-green-100 text-green-700', inactive: 'bg-gray-100 text-gray-700', configured: 'bg-yellow-100 text-yellow-700' }
    return <Badge className={styles[status]}>{status}</Badge>
  }

  const insights = [
    { icon: Key, title: `${stats.providers}`, description: 'Active providers' },
    { icon: Users, title: `${stats.totalUsers}`, description: 'SSO users' },
    { icon: Shield, title: `${stats.configured}`, description: 'Configured' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Key className="h-8 w-8 text-primary" />
            Single Sign-On
          </h1>
          <p className="text-muted-foreground mt-1">Configure identity providers and SSO settings</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Add Provider</Button>
      </div>

      <CollapsibleInsightsPanel title="SSO Overview" insights={insights} defaultExpanded={true} />

      <Card>
        <CardHeader>
          <CardTitle>SSO Settings</CardTitle>
          <CardDescription>Global single sign-on configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div><p className="font-medium">Enforce SSO</p><p className="text-sm text-muted-foreground">Require all users to authenticate via SSO</p></div>
            <Switch checked={enforceSSO} onCheckedChange={setEnforceSSO} />
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div><p className="font-medium">Allow Password Login</p><p className="text-sm text-muted-foreground">Allow users to login with email/password as fallback</p></div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div><p className="font-medium">Auto-provision Users</p><p className="text-sm text-muted-foreground">Automatically create accounts on first SSO login</p></div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Identity Providers</CardTitle>
          <CardDescription>Connected SSO providers</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {ssoProviders.map((provider) => (
              <div key={provider.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{provider.icon}</div>
                  <div>
                    <h4 className="font-medium">{provider.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="secondary">{provider.type.toUpperCase()}</Badge>
                      {provider.users > 0 && <span>{provider.users} users</span>}
                      <span>Last sync: {provider.lastSync}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {getStatusBadge(provider.status)}
                  <Button variant="outline" size="sm"><Settings className="h-4 w-4 mr-1" />Configure</Button>
                  {provider.status === 'active' && <Button variant="ghost" size="icon"><RefreshCw className="h-4 w-4" /></Button>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
