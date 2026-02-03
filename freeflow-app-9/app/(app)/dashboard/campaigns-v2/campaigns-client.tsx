'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Megaphone, Plus, Search, TrendingUp, DollarSign, Users, Eye, Target, Calendar } from 'lucide-react'

const campaigns = [
  { id: 'CAM-001', name: 'Summer Product Launch', type: 'Product Launch', status: 'active', budget: 50000, spent: 32000, leads: 1250, conversions: 85, startDate: '2024-01-15', endDate: '2024-03-15', channels: ['Email', 'Social', 'PPC'] },
  { id: 'CAM-002', name: 'Brand Awareness Q1', type: 'Brand', status: 'active', budget: 75000, spent: 45000, leads: 2100, conversions: 120, startDate: '2024-01-01', endDate: '2024-03-31', channels: ['Social', 'Display', 'Video'] },
  { id: 'CAM-003', name: 'Email Nurture Series', type: 'Lead Nurture', status: 'active', budget: 15000, spent: 12000, leads: 890, conversions: 145, startDate: '2024-02-01', endDate: '2024-04-30', channels: ['Email'] },
  { id: 'CAM-004', name: 'Trade Show Promotion', type: 'Event', status: 'scheduled', budget: 120000, spent: 0, leads: 0, conversions: 0, startDate: '2024-04-01', endDate: '2024-05-15', channels: ['Email', 'Social', 'Display'] },
  { id: 'CAM-005', name: 'Holiday Sale 2024', type: 'Promotion', status: 'draft', budget: 95000, spent: 0, leads: 0, conversions: 0, startDate: '2024-11-01', endDate: '2024-12-31', channels: ['All Channels'] },
]

const campaignTypes = [
  { name: 'Product Launch', count: 8, roi: 245, color: 'bg-blue-100 text-blue-700' },
  { name: 'Brand Awareness', count: 12, roi: 180, color: 'bg-purple-100 text-purple-700' },
  { name: 'Lead Generation', count: 15, roi: 320, color: 'bg-green-100 text-green-700' },
  { name: 'Promotion', count: 10, roi: 280, color: 'bg-orange-100 text-orange-700' },
]

const topPerformers = [
  { name: 'Summer Product Launch', conversions: 85, conversionRate: 6.8, roi: 285 },
  { name: 'Email Nurture Series', conversions: 145, conversionRate: 16.3, roi: 420 },
  { name: 'Brand Awareness Q1', conversions: 120, conversionRate: 5.7, roi: 195 },
]

const recentActivity = [
  { campaign: 'CAM-001', activity: 'New leads added', count: 45, time: '2 hours ago' },
  { campaign: 'CAM-002', activity: 'Budget adjusted', amount: '+$5,000', time: '5 hours ago' },
  { campaign: 'CAM-003', activity: 'Campaign paused', time: '1 day ago' },
]

export default function CampaignsClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const stats = useMemo(() => ({
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'active').length,
    totalBudget: campaigns.reduce((sum, c) => sum + c.budget, 0),
    totalSpent: campaigns.reduce((sum, c) => sum + c.spent, 0),
    totalLeads: campaigns.reduce((sum, c) => sum + c.leads, 0),
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      scheduled: 'bg-blue-100 text-blue-700',
      paused: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-gray-100 text-gray-700',
      draft: 'bg-orange-100 text-orange-700',
    }
    return <Badge className={styles[status]}>{status}</Badge>
  }

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => 
      (statusFilter === 'all' || c.status === statusFilter) &&
      (c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       c.id.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [searchQuery, statusFilter])

  const insights = [
    { icon: Megaphone, title: `${stats.total}`, description: 'Total campaigns' },
    { icon: Target, title: `${stats.active}`, description: 'Active' },
    { icon: DollarSign, title: `$${(stats.totalSpent / 1000).toFixed(0)}k`, description: 'Total spent' },
    { icon: Users, title: `${stats.totalLeads.toLocaleString()}`, description: 'Total leads' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Megaphone className="h-8 w-8 text-primary" />Marketing Campaigns</h1>
          <p className="text-muted-foreground mt-1">Manage and track marketing campaigns</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Create Campaign</Button>
      </div>

      <CollapsibleInsightsPanel title="Campaign Overview" insights={insights} defaultExpanded={true} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {campaignTypes.map((type) => (
          <Card key={type.name} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <Badge className={type.color}>{type.name}</Badge>
              <p className="text-2xl font-bold mt-2">{type.count}</p>
              <p className="text-sm text-muted-foreground">Avg ROI: {type.roi}%</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="campaigns">
        <TabsList>
          <TabsTrigger value="campaigns">All Campaigns</TabsTrigger>
          <TabsTrigger value="performance">Top Performers</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="mt-4 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search campaigns..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <select className="border rounded-md px-3 py-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="paused">Paused</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredCampaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{campaign.id}</Badge>
                        <h4 className="font-semibold">{campaign.name}</h4>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{campaign.type}</span>
                        <span>•</span>
                        <span>{campaign.channels.join(', ')}</span>
                      </div>
                    </div>
                    {getStatusBadge(campaign.status)}
                  </div>

                  {campaign.status === 'active' && (
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Budget Utilization</span>
                        <span className="font-medium">${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}</span>
                      </div>
                      <Progress value={(campaign.spent / campaign.budget) * 100} className="h-2" />
                    </div>
                  )}

                  <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-muted-foreground">Budget</p>
                      <p className="font-medium">${campaign.budget.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Leads</p>
                      <p className="font-medium">{campaign.leads.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Conversions</p>
                      <p className="font-medium text-green-600">{campaign.conversions}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Conv. Rate</p>
                      <p className="font-medium">{campaign.leads > 0 ? ((campaign.conversions / campaign.leads) * 100).toFixed(1) : 0}%</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="h-4 w-4" />
                    <span>{campaign.startDate} - {campaign.endDate}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">View Details</Button>
                    <Button size="sm" variant="outline" className="flex-1">Edit</Button>
                  </div>
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
                        <p className="text-muted-foreground">Conversions</p>
                        <p className="font-medium text-lg text-green-600">{campaign.conversions}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Conv. Rate</p>
                        <p className="font-medium text-lg">{campaign.conversionRate}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">ROI</p>
                        <p className="font-medium text-lg text-blue-600">{campaign.roi}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Campaign Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline">{activity.campaign}</Badge>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                    <p className="font-medium">{activity.activity}</p>
                    {activity.count && <p className="text-sm text-muted-foreground">{activity.count} new leads</p>}
                    {activity.amount && <p className="text-sm text-green-600">{activity.amount}</p>}
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
