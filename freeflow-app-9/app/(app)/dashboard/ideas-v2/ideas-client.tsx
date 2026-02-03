'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Lightbulb, Plus, Search, ThumbsUp, MessageSquare, TrendingUp, Award, Zap } from 'lucide-react'

const ideas = [
  { id: 1, title: 'AI-Powered Customer Support Bot', category: 'Technology', author: 'Sarah Chen', date: '2024-02-01', votes: 45, comments: 12, status: 'in-development', impact: 'high' },
  { id: 2, title: 'Employee Mentorship Program', category: 'HR', author: 'Mike Johnson', date: '2024-01-28', votes: 38, comments: 8, status: 'approved', impact: 'medium' },
  { id: 3, title: 'Sustainable Packaging Solution', category: 'Operations', author: 'Emily Davis', date: '2024-01-25', votes: 52, comments: 15, status: 'concept', impact: 'high' },
  { id: 4, title: 'Internal Knowledge Base', category: 'Technology', author: 'Tom Wilson', date: '2024-01-20', votes: 67, comments: 20, status: 'implemented', impact: 'high' },
  { id: 5, title: 'Quarterly Innovation Awards', category: 'Culture', author: 'Lisa Park', date: '2024-01-15', votes: 41, comments: 10, status: 'approved', impact: 'medium' },
]

const myIdeas = [
  { id: 1, title: 'Mobile App for Employees', status: 'in-development', votes: 34, submitted: '2024-01-10' },
  { id: 2, title: 'Green Office Initiative', status: 'concept', votes: 18, submitted: '2024-01-05' },
]

const categories = [
  { name: 'Technology', count: 45, color: 'bg-blue-100 text-blue-700' },
  { name: 'Operations', count: 32, color: 'bg-green-100 text-green-700' },
  { name: 'HR', count: 28, color: 'bg-purple-100 text-purple-700' },
  { name: 'Culture', count: 25, color: 'bg-orange-100 text-orange-700' },
  { name: 'Sustainability', count: 20, color: 'bg-emerald-100 text-emerald-700' },
]

export default function IdeasClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const stats = useMemo(() => ({
    total: ideas.length,
    implemented: ideas.filter(i => i.status === 'implemented').length,
    inDevelopment: ideas.filter(i => i.status === 'in-development').length,
    approved: ideas.filter(i => i.status === 'approved').length,
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      concept: 'bg-gray-100 text-gray-700',
      approved: 'bg-green-100 text-green-700',
      'in-development': 'bg-blue-100 text-blue-700',
      implemented: 'bg-purple-100 text-purple-700',
      declined: 'bg-red-100 text-red-700',
    }
    return <Badge className={styles[status]}>{status.replace('-', ' ')}</Badge>
  }

  const getImpactBadge = (impact: string) => {
    const styles: Record<string, string> = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-green-100 text-green-700',
    }
    return <Badge variant="outline" className={styles[impact]}>{impact} impact</Badge>
  }

  const categoryOptions = ['all', ...new Set(ideas.map(i => i.category))]

  const filteredIdeas = useMemo(() => ideas.filter(i =>
    (categoryFilter === 'all' || i.category === categoryFilter) &&
    i.title.toLowerCase().includes(searchQuery.toLowerCase())
  ), [searchQuery, categoryFilter])

  const insights = [
    { icon: Lightbulb, title: `${stats.total}`, description: 'Total ideas' },
    { icon: Zap, title: `${stats.inDevelopment}`, description: 'In development' },
    { icon: Award, title: `${stats.implemented}`, description: 'Implemented' },
    { icon: TrendingUp, title: `${stats.approved}`, description: 'Approved' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Lightbulb className="h-8 w-8 text-primary" />Innovation Hub</h1>
          <p className="text-muted-foreground mt-1">Share and develop innovative ideas</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Submit Idea</Button>
      </div>

      <CollapsibleInsightsPanel title="Innovation Stats" insights={insights} defaultExpanded={true} />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {categories.map((category) => (
          <Card key={category.name} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-3 text-center">
              <Badge className={category.color}>{category.name}</Badge>
              <p className="text-2xl font-bold mt-2">{category.count}</p>
              <p className="text-xs text-muted-foreground">Ideas</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Ideas</TabsTrigger>
          <TabsTrigger value="mine">My Ideas</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search ideas..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <select className="border rounded-md px-3 py-2" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              {categoryOptions.map(cat => <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>)}
            </select>
          </div>

          <div className="space-y-3">
            {filteredIdeas.map((idea) => (
              <Card key={idea.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <span className="font-bold">{idea.votes}</span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-lg">{idea.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{idea.category}</Badge>
                            {getStatusBadge(idea.status)}
                            {getImpactBadge(idea.impact)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-xs">{idea.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <span>{idea.author}</span>
                        </div>
                        <span>•</span>
                        <span>{idea.date}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {idea.comments} comments
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mine" className="mt-4">
          <div className="space-y-3">
            {myIdeas.map((idea) => (
              <Card key={idea.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{idea.title}</h4>
                      <p className="text-sm text-muted-foreground">Submitted: {idea.submitted}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{idea.votes} votes</span>
                      {getStatusBadge(idea.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trending" className="mt-4">
          <p className="text-muted-foreground">Showing most voted ideas this week...</p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
