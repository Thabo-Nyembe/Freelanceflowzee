'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Layers, Plus, Search, ThumbsUp, MessageSquare, Users, Tag, TrendingUp, Clock } from 'lucide-react'

const features = [
  { id: 1, title: 'Dark Mode Support', category: 'UI/UX', status: 'ready', priority: 'high', votes: 234, comments: 45, estimatedEffort: '3 weeks', requestedBy: 'Sarah Chen', createdDate: '2024-12-15', tags: ['design', 'accessibility'] },
  { id: 2, title: 'Batch Export Functionality', category: 'Data', status: 'backlog', priority: 'medium', votes: 156, comments: 28, estimatedEffort: '2 weeks', requestedBy: 'Mike Johnson', createdDate: '2024-12-20', tags: ['export', 'productivity'] },
  { id: 3, title: 'Advanced Search Filters', category: 'Search', status: 'ready', priority: 'high', votes: 198, comments: 34, estimatedEffort: '4 weeks', requestedBy: 'Tom Wilson', createdDate: '2024-12-10', tags: ['search', 'filters'] },
  { id: 4, title: 'Email Notifications', category: 'Notifications', status: 'in-review', priority: 'critical', votes: 312, comments: 67, estimatedEffort: '5 weeks', requestedBy: 'Lisa Anderson', createdDate: '2024-12-05', tags: ['notifications', 'email'] },
  { id: 5, title: 'Bulk Edit Operations', category: 'Productivity', status: 'backlog', priority: 'medium', votes: 143, comments: 19, estimatedEffort: '3 weeks', requestedBy: 'David Kim', createdDate: '2025-01-02', tags: ['bulk', 'edit'] },
  { id: 6, title: 'Calendar Integration', category: 'Integration', status: 'ready', priority: 'high', votes: 276, comments: 52, estimatedEffort: '6 weeks', requestedBy: 'Emma Davis', createdDate: '2024-12-18', tags: ['calendar', 'integration'] },
  { id: 7, title: 'Custom Dashboards', category: 'Analytics', status: 'in-review', priority: 'medium', votes: 189, comments: 41, estimatedEffort: '8 weeks', requestedBy: 'John Smith', createdDate: '2024-12-22', tags: ['dashboard', 'customization'] },
  { id: 8, title: 'Mobile Push Notifications', category: 'Mobile', status: 'backlog', priority: 'low', votes: 98, comments: 15, estimatedEffort: '4 weeks', requestedBy: 'Anna Lee', createdDate: '2025-01-05', tags: ['mobile', 'push'] },
]

export default function FeaturesBacklogClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const stats = useMemo(() => ({
    total: features.length,
    ready: features.filter(f => f.status === 'ready').length,
    inReview: features.filter(f => f.status === 'in-review').length,
    backlog: features.filter(f => f.status === 'backlog').length,
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'ready': 'bg-green-100 text-green-700',
      'in-review': 'bg-blue-100 text-blue-700',
      'backlog': 'bg-gray-100 text-gray-700',
      'archived': 'bg-red-100 text-red-700',
    }
    const labels: Record<string, string> = {
      'ready': 'Ready',
      'in-review': 'In Review',
      'backlog': 'Backlog',
      'archived': 'Archived',
    }
    return <Badge className={styles[status]}>{labels[status]}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      critical: 'bg-red-100 text-red-700',
      high: 'bg-orange-100 text-orange-700',
      medium: 'bg-blue-100 text-blue-700',
      low: 'bg-gray-100 text-gray-700',
    }
    return <Badge variant="outline" className={styles[priority]}>{priority}</Badge>
  }

  const categories = ['all', ...new Set(features.map(f => f.category))]
  const statuses = ['all', 'ready', 'in-review', 'backlog', 'archived']

  const filteredFeatures = useMemo(() => features.filter(f =>
    (categoryFilter === 'all' || f.category === categoryFilter) &&
    (statusFilter === 'all' || f.status === statusFilter) &&
    (f.title.toLowerCase().includes(searchQuery.toLowerCase()) || f.category.toLowerCase().includes(searchQuery.toLowerCase()))
  ), [searchQuery, categoryFilter, statusFilter])

  const insights = [
    { icon: Layers, title: `${stats.total}`, description: 'Total features' },
    { icon: TrendingUp, title: `${stats.ready}`, description: 'Ready for dev' },
    { icon: Clock, title: `${stats.inReview}`, description: 'In review' },
    { icon: Tag, title: `${stats.backlog}`, description: 'In backlog' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Layers className="h-8 w-8 text-primary" />Features Backlog</h1>
          <p className="text-muted-foreground mt-1">Manage and prioritize feature requests</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Add Feature</Button>
      </div>

      <CollapsibleInsightsPanel title="Backlog Overview" insights={insights} defaultExpanded={true} />

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search features..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <select className="border rounded-md px-3 py-2" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          {categories.map(cat => <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>)}
        </select>
        <select className="border rounded-md px-3 py-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {statuses.map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredFeatures.map((feature) => (
          <Card key={feature.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{feature.category}</p>
                </div>
                {getPriorityBadge(feature.priority)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                {getStatusBadge(feature.status)}
                <span className="text-sm text-muted-foreground">{feature.estimatedEffort}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {feature.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    {feature.votes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {feature.comments}
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {feature.requestedBy}
                </span>
              </div>
              <div className="flex gap-2 pt-2 border-t">
                <Button size="sm" variant="outline" className="flex-1">View Details</Button>
                <Button size="sm" variant="ghost">Upvote</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
