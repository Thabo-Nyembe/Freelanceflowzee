'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import {
  Layout, Eye, MousePointer, TrendingUp, Search, Plus, Copy,
  ExternalLink, MoreHorizontal, Pencil, Trash2, Globe, Zap,
  BarChart3, Users, Target, Sparkles, FileText, Layers, Play,
  Pause, CheckCircle, Clock, Monitor, Smartphone, Tablet
} from 'lucide-react'

const landingPages = [
  {
    id: 1,
    name: 'Product Launch 2024',
    slug: 'product-launch-2024',
    status: 'published',
    views: 12450,
    conversions: 456,
    conversionRate: 3.66,
    template: 'Hero',
    lastUpdated: '2024-01-15',
    thumbnail: '/pages/product-launch.jpg',
    abTest: true
  },
  {
    id: 2,
    name: 'Free Trial Signup',
    slug: 'free-trial',
    status: 'published',
    views: 8920,
    conversions: 712,
    conversionRate: 7.98,
    template: 'Lead Gen',
    lastUpdated: '2024-01-14',
    thumbnail: '/pages/free-trial.jpg',
    abTest: false
  },
  {
    id: 3,
    name: 'Webinar Registration',
    slug: 'webinar-jan-2024',
    status: 'published',
    views: 5670,
    conversions: 289,
    conversionRate: 5.10,
    template: 'Event',
    lastUpdated: '2024-01-12',
    thumbnail: '/pages/webinar.jpg',
    abTest: true
  },
  {
    id: 4,
    name: 'Enterprise Demo',
    slug: 'enterprise-demo',
    status: 'draft',
    views: 0,
    conversions: 0,
    conversionRate: 0,
    template: 'Demo Request',
    lastUpdated: '2024-01-10',
    thumbnail: '/pages/enterprise.jpg',
    abTest: false
  },
  {
    id: 5,
    name: 'Black Friday Sale',
    slug: 'black-friday-2024',
    status: 'scheduled',
    views: 0,
    conversions: 0,
    conversionRate: 0,
    template: 'Sale',
    lastUpdated: '2024-01-08',
    thumbnail: '/pages/black-friday.jpg',
    abTest: false
  },
]

const templates = [
  { id: 1, name: 'Hero Landing', category: 'Product', uses: 1245, rating: 4.8, preview: '/templates/hero.jpg' },
  { id: 2, name: 'Lead Generation', category: 'Marketing', uses: 2340, rating: 4.9, preview: '/templates/lead-gen.jpg' },
  { id: 3, name: 'Event Registration', category: 'Events', uses: 890, rating: 4.7, preview: '/templates/event.jpg' },
  { id: 4, name: 'Demo Request', category: 'Sales', uses: 567, rating: 4.6, preview: '/templates/demo.jpg' },
  { id: 5, name: 'Coming Soon', category: 'Pre-launch', uses: 1123, rating: 4.8, preview: '/templates/coming-soon.jpg' },
  { id: 6, name: 'Sale Promo', category: 'E-commerce', uses: 789, rating: 4.5, preview: '/templates/sale.jpg' },
]

export default function LandingPagesClient() {
  const [activeTab, setActiveTab] = useState('pages')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const stats = useMemo(() => {
    const published = landingPages.filter(p => p.status === 'published')
    return {
      totalPages: landingPages.length,
      publishedPages: published.length,
      totalViews: published.reduce((sum, p) => sum + p.views, 0),
      totalConversions: published.reduce((sum, p) => sum + p.conversions, 0),
      avgConversionRate: (published.reduce((sum, p) => sum + p.conversionRate, 0) / published.length).toFixed(2)
    }
  }, [])

  const filteredPages = useMemo(() => {
    return landingPages.filter(page => {
      const matchesSearch = page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           page.slug.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || page.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter])

  const getStatusBadge = (status: string) => {
    const styles = {
      published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      draft: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
      scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      archived: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    }
    const icons = {
      published: <CheckCircle className="h-3 w-3 mr-1" />,
      draft: <FileText className="h-3 w-3 mr-1" />,
      scheduled: <Clock className="h-3 w-3 mr-1" />,
      archived: <Trash2 className="h-3 w-3 mr-1" />,
    }
    return (
      <Badge variant="outline" className={`${styles[status as keyof typeof styles]} flex items-center`}>
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const insights = [
    { icon: Eye, title: `${stats.totalViews.toLocaleString()} Views`, description: 'Total page views' },
    { icon: Target, title: `${stats.avgConversionRate}% CVR`, description: 'Average conversion' },
    { icon: MousePointer, title: `${stats.totalConversions} Leads`, description: 'Total conversions' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Layout className="h-8 w-8 text-primary" />
            Landing Pages
          </h1>
          <p className="text-muted-foreground mt-1">Create and manage high-converting landing pages</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Generate
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Page
          </Button>
        </div>
      </div>

      <CollapsibleInsightsPanel
        title="Performance Insights"
        insights={insights}
        defaultExpanded={true}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pages</p>
                <p className="text-2xl font-bold">{stats.totalPages}</p>
                <p className="text-xs text-muted-foreground mt-1">{stats.publishedPages} published</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Layers className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">+12% this week</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversions</p>
                <p className="text-2xl font-bold">{stats.totalConversions.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">+8% this week</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <MousePointer className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. CVR</p>
                <p className="text-2xl font-bold">{stats.avgConversionRate}%</p>
                <Progress value={parseFloat(stats.avgConversionRate) * 10} className="h-2 mt-2" />
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pages">My Pages</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Landing Pages</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search pages..."
                      className="pl-9 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredPages.map((page) => (
                  <div key={page.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-28 rounded bg-muted flex items-center justify-center">
                        <Layout className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{page.name}</h4>
                          {page.abTest && (
                            <Badge variant="outline" className="text-xs">
                              <Zap className="h-3 w-3 mr-1" />
                              A/B Test
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">/{page.slug}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(page.status)}
                          <span className="text-xs text-muted-foreground">Updated {page.lastUpdated}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <p className="font-semibold">{page.views.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Views</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">{page.conversions}</p>
                        <p className="text-xs text-muted-foreground">Conversions</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-green-600">{page.conversionRate}%</p>
                        <p className="text-xs text-muted-foreground">CVR</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Page Templates</CardTitle>
              <CardDescription>Start with a professionally designed template</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <div key={template.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow group">
                    <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center relative">
                      <Layout className="h-12 w-12 text-muted-foreground" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="secondary" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{template.name}</h4>
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{template.uses.toLocaleString()} uses</span>
                        <span className="flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1 text-yellow-500" />
                          {template.rating}
                        </span>
                      </div>
                      <Button className="w-full mt-3" size="sm">Use Template</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Device Breakdown</CardTitle>
              <CardDescription>How visitors access your landing pages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <Monitor className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-2xl font-bold">58%</p>
                  <p className="text-sm text-muted-foreground">Desktop</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <Smartphone className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-2xl font-bold">35%</p>
                  <p className="text-sm text-muted-foreground">Mobile</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <Tablet className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-2xl font-bold">7%</p>
                  <p className="text-sm text-muted-foreground">Tablet</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {landingPages.filter(p => p.status === 'published').sort((a, b) => b.conversionRate - a.conversionRate).map((page, idx) => (
                  <div key={page.id} className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-muted-foreground w-8">#{idx + 1}</span>
                    <div className="flex-1">
                      <p className="font-medium">{page.name}</p>
                      <Progress value={page.conversionRate * 10} className="h-2 mt-1" />
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{page.conversionRate}%</p>
                      <p className="text-xs text-muted-foreground">{page.conversions} conversions</p>
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
