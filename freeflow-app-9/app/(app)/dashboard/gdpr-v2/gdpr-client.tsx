'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Shield, Search, FileText, Users, Clock, CheckCircle, AlertTriangle, Download, Trash2, Eye, MoreHorizontal } from 'lucide-react'

const dataRequests = [
  { id: 1, user: 'john@email.com', type: 'access', status: 'completed', requestDate: '2024-01-10', completedDate: '2024-01-12' },
  { id: 2, user: 'sarah@email.com', type: 'deletion', status: 'pending', requestDate: '2024-01-14', completedDate: null },
  { id: 3, user: 'mike@email.com', type: 'portability', status: 'processing', requestDate: '2024-01-13', completedDate: null },
  { id: 4, user: 'emily@email.com', type: 'access', status: 'completed', requestDate: '2024-01-08', completedDate: '2024-01-09' },
  { id: 5, user: 'tom@email.com', type: 'rectification', status: 'completed', requestDate: '2024-01-05', completedDate: '2024-01-07' },
]

const consentRecords = [
  { id: 1, purpose: 'Marketing Communications', users: 12450, consentRate: 78 },
  { id: 2, purpose: 'Analytics & Tracking', users: 15230, consentRate: 92 },
  { id: 3, purpose: 'Third-party Sharing', users: 8920, consentRate: 45 },
  { id: 4, purpose: 'Personalization', users: 14100, consentRate: 85 },
]

export default function GdprClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('requests')

  const stats = useMemo(() => ({
    totalRequests: dataRequests.length,
    pending: dataRequests.filter(r => r.status === 'pending').length,
    avgResponseTime: '2.3 days',
    complianceScore: 94,
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = { pending: 'bg-yellow-100 text-yellow-700', processing: 'bg-blue-100 text-blue-700', completed: 'bg-green-100 text-green-700' }
    return <Badge className={styles[status]}>{status}</Badge>
  }

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = { access: 'bg-blue-100 text-blue-700', deletion: 'bg-red-100 text-red-700', portability: 'bg-purple-100 text-purple-700', rectification: 'bg-orange-100 text-orange-700' }
    return <Badge className={styles[type]}>{type}</Badge>
  }

  const filteredRequests = useMemo(() => dataRequests.filter(r => r.user.toLowerCase().includes(searchQuery.toLowerCase())), [searchQuery])

  const insights = [
    { icon: Shield, title: `${stats.complianceScore}%`, description: 'Compliance score' },
    { icon: Clock, title: `${stats.pending}`, description: 'Pending requests' },
    { icon: CheckCircle, title: stats.avgResponseTime, description: 'Avg response' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            GDPR & Privacy
          </h1>
          <p className="text-muted-foreground mt-1">Manage data privacy and GDPR compliance</p>
        </div>
        <Button><FileText className="h-4 w-4 mr-2" />Generate Report</Button>
      </div>

      <CollapsibleInsightsPanel title="Privacy Overview" insights={insights} defaultExpanded={true} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="requests">Data Requests</TabsTrigger>
          <TabsTrigger value="consent">Consent Management</TabsTrigger>
          <TabsTrigger value="settings">Privacy Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-4 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by email..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center"><Users className="h-5 w-5 text-muted-foreground" /></div>
                      <div>
                        <h4 className="font-medium">{request.user}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {getTypeBadge(request.type)}
                          <span>Requested: {request.requestDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(request.status)}
                      <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consent" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {consentRecords.map((consent) => (
              <Card key={consent.id}>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">{consent.purpose}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span>Consent Rate</span><span className="font-medium">{consent.consentRate}%</span></div>
                    <Progress value={consent.consentRate} className="h-2" />
                    <p className="text-xs text-muted-foreground">{consent.users.toLocaleString()} users</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Privacy Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div><p className="font-medium">Data Retention</p><p className="text-sm text-muted-foreground">Automatically delete inactive user data after 2 years</p></div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div><p className="font-medium">Cookie Consent Banner</p><p className="text-sm text-muted-foreground">Show cookie consent to EU visitors</p></div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div><p className="font-medium">Data Processing Agreements</p><p className="text-sm text-muted-foreground">Require DPA for all third-party integrations</p></div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
