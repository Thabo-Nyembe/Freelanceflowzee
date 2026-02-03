'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Search, TrendingUp, TrendingDown, Eye, MousePointer, Award, BarChart3, FileText } from 'lucide-react'

const keywords = [
  { keyword: 'project management software', position: 3, searchVolume: 18000, traffic: 2400, difficulty: 65, trend: 'up' },
  { keyword: 'team collaboration tools', position: 7, searchVolume: 12000, traffic: 890, difficulty: 58, trend: 'up' },
  { keyword: 'workflow automation', position: 12, searchVolume: 9500, traffic: 420, difficulty: 72, trend: 'down' },
  { keyword: 'task management app', position: 5, searchVolume: 15000, traffic: 1850, difficulty: 61, trend: 'same' },
]

const topPages = [
  { url: '/features/automation', visitors: 5200, pageViews: 8400, avgTime: '3:25', bounceRate: 32 },
  { url: '/blog/productivity-tips', visitors: 4100, pageViews: 5800, avgTime: '4:12', bounceRate: 28 },
  { url: '/pricing', visitors: 3800, pageViews: 4200, avgTime: '2:15', bounceRate: 45 },
]

const metrics = [
  { name: 'Organic Traffic', value: '28.5k', change: 12.5, color: 'bg-green-100 text-green-700' },
  { name: 'Avg Position', value: '8.2', change: -2.1, color: 'bg-blue-100 text-blue-700' },
  { name: 'Click Rate', value: '3.8%', change: 0.5, color: 'bg-purple-100 text-purple-700' },
  { name: 'Impressions', value: '450k', change: 18.2, color: 'bg-orange-100 text-orange-700' },
]

export default function SeoAnalyticsClient() {
  const stats = useMemo(() => ({
    totalKeywords: keywords.length,
    avgPosition: (keywords.reduce((sum, k) => sum + k.position, 0) / keywords.length).toFixed(1),
    totalTraffic: keywords.reduce((sum, k) => sum + k.traffic, 0),
    improving: keywords.filter(k => k.trend === 'up').length,
  }), [])

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />
    return <span className="h-4 w-4 text-gray-600">→</span>
  }

  const insights = [
    { icon: Search, title: `${stats.totalKeywords}`, description: 'Keywords tracked' },
    { icon: Award, title: `${stats.avgPosition}`, description: 'Avg position' },
    { icon: Eye, title: `${stats.totalTraffic.toLocaleString()}`, description: 'Monthly traffic' },
    { icon: TrendingUp, title: `${stats.improving}`, description: 'Improving' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><BarChart3 className="h-8 w-8 text-primary" />SEO Analytics</h1>
          <p className="text-muted-foreground mt-1">Track search engine optimization performance</p>
        </div>
        <Button><FileText className="h-4 w-4 mr-2" />SEO Report</Button>
      </div>

      <CollapsibleInsightsPanel title="SEO Overview" insights={insights} defaultExpanded={true} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.name}>
            <CardContent className="p-4">
              <Badge className={metric.color}>{metric.name}</Badge>
              <p className="text-3xl font-bold mt-2">{metric.value}</p>
              <div className="flex items-center gap-1 mt-1">
                {metric.change > 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}
                <span className={`text-sm ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>{Math.abs(metric.change)}%</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="keywords">
        <TabsList>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="pages">Top Pages</TabsTrigger>
        </TabsList>

        <TabsContent value="keywords" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Keyword Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {keywords.map((keyword, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{keyword.keyword}</h4>
                        <p className="text-sm text-muted-foreground">Search Volume: {keyword.searchVolume.toLocaleString()}/mo</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge>Position {keyword.position}</Badge>
                        {getTrendIcon(keyword.trend)}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Traffic</p>
                        <p className="font-medium">{keyword.traffic.toLocaleString()}/mo</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Difficulty</p>
                        <p className="font-medium">{keyword.difficulty}/100</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">CTR</p>
                        <p className="font-medium">{((keyword.traffic / keyword.searchVolume) * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topPages.map((page, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-3">{page.url}</h4>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Visitors</p>
                        <p className="font-medium text-lg">{page.visitors.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Page Views</p>
                        <p className="font-medium text-lg">{page.pageViews.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Time</p>
                        <p className="font-medium text-lg">{page.avgTime}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Bounce Rate</p>
                        <p className="font-medium text-lg">{page.bounceRate}%</p>
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
