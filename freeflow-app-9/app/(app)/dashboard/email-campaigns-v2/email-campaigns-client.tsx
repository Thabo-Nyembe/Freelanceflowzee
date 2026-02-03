'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Mail, Plus, Send, MousePointer, Eye, Users, TrendingUp, CheckCircle } from 'lucide-react'

const campaigns = [
  { id: 'EML-001', name: 'Weekly Newsletter #45', status: 'sent', sent: 15000, opened: 6750, clicked: 1350, unsubscribed: 15, sentDate: '2024-02-01', openRate: 45, clickRate: 9 },
  { id: 'EML-002', name: 'Product Launch Announcement', status: 'sent', sent: 8500, opened: 5100, clicked: 1530, unsubscribed: 8, sentDate: '2024-01-28', openRate: 60, clickRate: 18 },
  { id: 'EML-003', name: 'Customer Survey Request', status: 'scheduled', sent: 0, opened: 0, clicked: 0, unsubscribed: 0, sentDate: '2024-02-05', openRate: 0, clickRate: 0 },
  { id: 'EML-004', name: 'Webinar Invitation', status: 'draft', sent: 0, opened: 0, clicked: 0, unsubscribed: 0, sentDate: null, openRate: 0, clickRate: 0 },
]

const emailMetrics = [
  { name: 'Total Sent', value: '23.5k', change: 12, color: 'bg-blue-100 text-blue-700' },
  { name: 'Open Rate', value: '48.2%', change: 3.5, color: 'bg-green-100 text-green-700' },
  { name: 'Click Rate', value: '12.8%', change: 1.2, color: 'bg-purple-100 text-purple-700' },
  { name: 'Conversions', value: '485', change: 8.5, color: 'bg-orange-100 text-orange-700' },
]

const topPerformers = [
  { name: 'Product Launch Announcement', openRate: 60, clickRate: 18, conversions: 152 },
  { name: 'Customer Success Stories', openRate: 55, clickRate: 15, conversions: 98 },
  { name: 'Weekly Newsletter #45', openRate: 45, clickRate: 9, conversions: 42 },
]

export default function EmailCampaignsClient() {
  const stats = useMemo(() => ({
    total: campaigns.length,
    sent: campaigns.filter(c => c.status === 'sent').length,
    scheduled: campaigns.filter(c => c.status === 'scheduled').length,
    draft: campaigns.filter(c => c.status === 'draft').length,
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      sent: 'bg-green-100 text-green-700',
      scheduled: 'bg-blue-100 text-blue-700',
      draft: 'bg-gray-100 text-gray-700',
      sending: 'bg-yellow-100 text-yellow-700',
    }
    return <Badge className={styles[status]}>{status}</Badge>
  }

  const insights = [
    { icon: Mail, title: `${stats.total}`, description: 'Total campaigns' },
    { icon: Send, title: `${stats.sent}`, description: 'Sent' },
    { icon: CheckCircle, title: `${stats.scheduled}`, description: 'Scheduled' },
    { icon: Users, title: `${stats.draft}`, description: 'Drafts' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Mail className="h-8 w-8 text-primary" />Email Campaigns</h1>
          <p className="text-muted-foreground mt-1">Create and manage email marketing campaigns</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />New Campaign</Button>
      </div>

      <CollapsibleInsightsPanel title="Email Overview" insights={insights} defaultExpanded={true} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {emailMetrics.map((metric) => (
          <Card key={metric.name}>
            <CardContent className="p-4">
              <Badge className={metric.color}>{metric.name}</Badge>
              <p className="text-3xl font-bold mt-2">{metric.value}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">+{metric.change}%</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="campaigns">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="performance">Top Performers</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="mt-4">
          <div className="space-y-3">
            {campaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{campaign.id}</Badge>
                        <h4 className="font-semibold">{campaign.name}</h4>
                      </div>
                      {campaign.sentDate && <p className="text-sm text-muted-foreground">Sent: {campaign.sentDate}</p>}
                    </div>
                    {getStatusBadge(campaign.status)}
                  </div>

                  {campaign.status === 'sent' && (
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Send className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="text-muted-foreground">Sent</p>
                          <p className="font-medium">{campaign.sent.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="text-muted-foreground">Opened</p>
                          <p className="font-medium">{campaign.opened.toLocaleString()} ({campaign.openRate}%)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MousePointer className="h-4 w-4 text-purple-500" />
                        <div>
                          <p className="text-muted-foreground">Clicked</p>
                          <p className="font-medium">{campaign.clicked.toLocaleString()} ({campaign.clickRate}%)</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Unsubscribed</p>
                        <p className="font-medium text-red-600">{campaign.unsubscribed}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.map((campaign, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-3">{campaign.name}</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Open Rate</p>
                        <p className="font-medium text-lg text-green-600">{campaign.openRate}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Click Rate</p>
                        <p className="font-medium text-lg text-blue-600">{campaign.clickRate}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Conversions</p>
                        <p className="font-medium text-lg text-purple-600">{campaign.conversions}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
