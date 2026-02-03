'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Calendar, Plus, FileText, Video, Image, Mic, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

const content = [
  { id: 1, title: 'Q1 Product Launch Blog Post', type: 'Blog', status: 'published', author: 'Sarah M.', publishDate: '2024-02-01', platform: 'Blog', views: 2400 },
  { id: 2, title: 'Customer Success Story Video', type: 'Video', status: 'in-progress', author: 'Mike C.', publishDate: '2024-02-05', platform: 'YouTube', views: 0 },
  { id: 3, title: 'Social Media Graphics Pack', type: 'Image', status: 'scheduled', author: 'Emma W.', publishDate: '2024-02-03', platform: 'Social', views: 0 },
  { id: 4, title: 'Industry Podcast Episode 15', type: 'Audio', status: 'draft', author: 'Alex J.', publishDate: '2024-02-10', platform: 'Podcast', views: 0 },
]

const contentTypes = [
  { name: 'Blog Posts', count: 45, published: 38, color: 'bg-blue-100 text-blue-700', icon: FileText },
  { name: 'Videos', count: 22, published: 18, color: 'bg-red-100 text-red-700', icon: Video },
  { name: 'Images', count: 68, published: 65, color: 'bg-purple-100 text-purple-700', icon: Image },
  { name: 'Podcasts', count: 15, published: 12, color: 'bg-green-100 text-green-700', icon: Mic },
]

const upcomingPublications = [
  { title: 'Social Media Graphics Pack', date: '2024-02-03', type: 'Image', author: 'Emma W.' },
  { title: 'Customer Success Story Video', date: '2024-02-05', type: 'Video', author: 'Mike C.' },
  { title: 'Industry Podcast Episode 15', date: '2024-02-10', type: 'Audio', author: 'Alex J.' },
]

export default function ContentCalendarClient() {
  const stats = useMemo(() => ({
    total: content.length,
    published: content.filter(c => c.status === 'published').length,
    inProgress: content.filter(c => c.status === 'in-progress').length,
    scheduled: content.filter(c => c.status === 'scheduled').length,
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      published: 'bg-green-100 text-green-700',
      scheduled: 'bg-blue-100 text-blue-700',
      'in-progress': 'bg-yellow-100 text-yellow-700',
      draft: 'bg-gray-100 text-gray-700',
    }
    return <Badge className={styles[status]}>{status.replace('-', ' ')}</Badge>
  }

  const insights = [
    { icon: FileText, title: `${stats.total}`, description: 'Total content' },
    { icon: CheckCircle, title: `${stats.published}`, description: 'Published' },
    { icon: Clock, title: `${stats.scheduled}`, description: 'Scheduled' },
    { icon: AlertTriangle, title: `${stats.inProgress}`, description: 'In progress' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Calendar className="h-8 w-8 text-primary" />Content Calendar</h1>
          <p className="text-muted-foreground mt-1">Plan and schedule content across platforms</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Add Content</Button>
      </div>

      <CollapsibleInsightsPanel title="Content Overview" insights={insights} defaultExpanded={true} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {contentTypes.map((type) => (
          <Card key={type.name} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <type.icon className="h-5 w-5" />
                <Badge className={type.color}>{type.name}</Badge>
              </div>
              <p className="text-2xl font-bold">{type.count}</p>
              <p className="text-xs text-muted-foreground">{type.published} published</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="calendar">
        <TabsList>
          <TabsTrigger value="calendar">Content Items</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-4">
          <div className="space-y-3">
            {content.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{item.type}</span>
                        <span>•</span>
                        <span>{item.author}</span>
                        <span>•</span>
                        <span>{item.platform}</span>
                      </div>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-muted-foreground">Publish Date: {item.publishDate}</span>
                    {item.views > 0 && <span className="font-medium">{item.views.toLocaleString()} views</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Publications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingPublications.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{item.title}</h4>
                      <Badge>{item.type}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Author: {item.author}</span>
                      <span>{item.date}</span>
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
