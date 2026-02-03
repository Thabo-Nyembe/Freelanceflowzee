'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Zap, Search, Star, TrendingUp, Users, CheckCircle, Clock } from 'lucide-react'

const features = [
  { id: 1, name: 'AI Assistant', category: 'AI & Automation', status: 'active', users: 1250, rating: 4.8, icon: '🤖' },
  { id: 2, name: 'Video Collaboration', category: 'Communication', status: 'active', users: 890, rating: 4.6, icon: '📹' },
  { id: 3, name: 'Analytics Dashboard', category: 'Analytics', status: 'active', users: 2100, rating: 4.9, icon: '📊' },
  { id: 4, name: 'Task Automation', category: 'AI & Automation', status: 'beta', users: 340, rating: 4.3, icon: '⚡' },
  { id: 5, name: 'Team Chat', category: 'Communication', status: 'active', users: 1800, rating: 4.7, icon: '💬' },
  { id: 6, name: 'File Management', category: 'Productivity', status: 'active', users: 1560, rating: 4.5, icon: '📁' },
  { id: 7, name: 'CRM Integration', category: 'Sales', status: 'active', users: 950, rating: 4.4, icon: '🤝' },
  { id: 8, name: 'Invoice Generator', category: 'Finance', status: 'active', users: 1120, rating: 4.8, icon: '💰' },
  { id: 9, name: 'Kanban Boards', category: 'Productivity', status: 'active', users: 1650, rating: 4.6, icon: '📋' },
  { id: 10, name: 'Time Tracking', category: 'Productivity', status: 'beta', users: 780, rating: 4.2, icon: '⏱️' },
  { id: 11, name: 'Email Marketing', category: 'Marketing', status: 'coming-soon', users: 0, rating: 0, icon: '📧' },
  { id: 12, name: 'Mobile App', category: 'Platform', status: 'coming-soon', users: 0, rating: 0, icon: '📱' },
]

const categories = [
  { name: 'AI & Automation', count: 45, color: 'bg-purple-100 text-purple-700' },
  { name: 'Communication', count: 32, color: 'bg-blue-100 text-blue-700' },
  { name: 'Analytics', count: 28, color: 'bg-green-100 text-green-700' },
  { name: 'Productivity', count: 38, color: 'bg-orange-100 text-orange-700' },
  { name: 'Sales', count: 24, color: 'bg-pink-100 text-pink-700' },
  { name: 'Finance', count: 20, color: 'bg-emerald-100 text-emerald-700' },
]

export default function FeaturesHubClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const stats = useMemo(() => ({
    total: features.length,
    active: features.filter(f => f.status === 'active').length,
    beta: features.filter(f => f.status === 'beta').length,
    totalUsers: features.reduce((sum, f) => sum + f.users, 0),
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      beta: 'bg-blue-100 text-blue-700',
      'coming-soon': 'bg-yellow-100 text-yellow-700',
      deprecated: 'bg-red-100 text-red-700',
    }
    return <Badge className={styles[status]}>{status.replace('-', ' ')}</Badge>
  }

  const categoryOptions = ['all', ...new Set(features.map(f => f.category))]

  const filteredFeatures = useMemo(() => features.filter(f =>
    (categoryFilter === 'all' || f.category === categoryFilter) &&
    (statusFilter === 'all' || f.status === statusFilter) &&
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  ), [searchQuery, categoryFilter, statusFilter])

  const insights = [
    { icon: Zap, title: `${stats.total}`, description: 'Total features' },
    { icon: CheckCircle, title: `${stats.active}`, description: 'Active features' },
    { icon: Clock, title: `${stats.beta}`, description: 'In beta' },
    { icon: Users, title: `${stats.totalUsers.toLocaleString()}`, description: 'Total users' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Zap className="h-8 w-8 text-primary" />Features Hub</h1>
          <p className="text-muted-foreground mt-1">Explore and manage platform features</p>
        </div>
        <Button><Search className="h-4 w-4 mr-2" />Request Feature</Button>
      </div>

      <CollapsibleInsightsPanel title="Features Overview" insights={insights} defaultExpanded={true} />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map((category) => (
          <Card key={category.name} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-3 text-center">
              <Badge className={category.color}>{category.name}</Badge>
              <p className="text-2xl font-bold mt-2">{category.count}</p>
              <p className="text-xs text-muted-foreground">Features</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search features..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <select className="border rounded-md px-3 py-2" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          {categoryOptions.map(cat => <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>)}
        </select>
        <select className="border rounded-md px-3 py-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="beta">Beta</option>
          <option value="coming-soon">Coming Soon</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFeatures.map((feature) => (
          <Card key={feature.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="text-4xl mb-3">{feature.icon}</div>
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold">{feature.name}</h4>
                {getStatusBadge(feature.status)}
              </div>
              <Badge variant="outline" className="mb-3">{feature.category}</Badge>

              {feature.status !== 'coming-soon' && (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Users:</span>
                    <span className="font-medium">{feature.users.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Rating:</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{feature.rating}</span>
                    </div>
                  </div>
                </div>
              )}

              {feature.status === 'coming-soon' && (
                <p className="text-sm text-muted-foreground">Coming soon! Stay tuned for updates.</p>
              )}

              <Button
                className="w-full mt-3"
                variant={feature.status === 'coming-soon' ? 'outline' : 'default'}
                disabled={feature.status === 'coming-soon'}
              >
                {feature.status === 'coming-soon' ? 'Notify Me' : 'Explore Feature'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
