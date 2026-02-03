'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Lightbulb, Plus, Search, ThumbsUp, MessageSquare, TrendingUp, Users, CheckCircle } from 'lucide-react'

const suggestions = [
  { id: 1, title: 'Flexible Working Hours', category: 'Work-Life Balance', author: 'Sarah Chen', date: '2024-02-01', votes: 45, comments: 12, status: 'under-review', department: 'HR' },
  { id: 2, title: 'Green Energy Initiative', category: 'Sustainability', author: 'Mike Johnson', date: '2024-01-28', votes: 38, comments: 8, status: 'approved', department: 'Facilities' },
  { id: 3, title: 'Monthly Team Building Events', category: 'Culture', author: 'Emily Davis', date: '2024-01-25', votes: 52, comments: 15, status: 'under-review', department: 'HR' },
  { id: 4, title: 'Remote Work Equipment Budget', category: 'Technology', author: 'Tom Wilson', date: '2024-01-20', votes: 67, comments: 20, status: 'implemented', department: 'IT' },
  { id: 5, title: 'Wellness Program Expansion', category: 'Health', author: 'Lisa Park', date: '2024-01-15', votes: 41, comments: 10, status: 'under-review', department: 'HR' },
]

const mySuggestions = [
  { id: 1, title: 'Standing Desk Options', category: 'Workplace', status: 'approved', votes: 28, submitted: '2024-01-10' },
  { id: 2, title: 'Learning Budget Increase', category: 'Development', status: 'under-review', votes: 15, submitted: '2024-01-18' },
]

const trending = [
  { id: 1, title: 'Remote Work Equipment Budget', votes: 67, trend: '+12' },
  { id: 2, title: 'Monthly Team Building Events', votes: 52, trend: '+8' },
  { id: 3, title: 'Flexible Working Hours', votes: 45, trend: '+5' },
]

export default function SuggestionsClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const stats = useMemo(() => ({
    total: suggestions.length,
    underReview: suggestions.filter(s => s.status === 'under-review').length,
    approved: suggestions.filter(s => s.status === 'approved').length,
    implemented: suggestions.filter(s => s.status === 'implemented').length,
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'under-review': 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      implemented: 'bg-blue-100 text-blue-700',
      declined: 'bg-red-100 text-red-700',
    }
    return <Badge className={styles[status]}>{status.replace('-', ' ')}</Badge>
  }

  const categories = ['all', ...new Set(suggestions.map(s => s.category))]

  const filteredSuggestions = useMemo(() => suggestions.filter(s =>
    (categoryFilter === 'all' || s.category === categoryFilter) &&
    (statusFilter === 'all' || s.status === statusFilter) &&
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  ), [searchQuery, categoryFilter, statusFilter])

  const insights = [
    { icon: Lightbulb, title: `${stats.total}`, description: 'Total suggestions' },
    { icon: TrendingUp, title: `${stats.underReview}`, description: 'Under review' },
    { icon: CheckCircle, title: `${stats.approved}`, description: 'Approved' },
    { icon: Users, title: `${stats.implemented}`, description: 'Implemented' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Lightbulb className="h-8 w-8 text-primary" />Suggestions</h1>
          <p className="text-muted-foreground mt-1">Share and vote on improvement ideas</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Submit Suggestion</Button>
      </div>

      <CollapsibleInsightsPanel title="Suggestions Overview" insights={insights} defaultExpanded={true} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Trending This Week</h3>
            <div className="space-y-2">
              {trending.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <p className="text-sm truncate flex-1">{item.title}</p>
                  <div className="flex items-center gap-2 ml-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700">+{item.trend}</Badge>
                    <span className="text-sm font-medium">{item.votes}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">My Suggestions</h3>
            <div className="space-y-2">
              {mySuggestions.map((suggestion) => (
                <div key={suggestion.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">{suggestion.title}</p>
                    <p className="text-xs text-muted-foreground">{suggestion.category} • Submitted {suggestion.submitted}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{suggestion.votes} votes</span>
                    {getStatusBadge(suggestion.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Suggestions</TabsTrigger>
          <TabsTrigger value="popular">Most Popular</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search suggestions..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <select className="border rounded-md px-3 py-2" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              {categories.map(cat => <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>)}
            </select>
            <select className="border rounded-md px-3 py-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="under-review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="implemented">Implemented</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredSuggestions.map((suggestion) => (
              <Card key={suggestion.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <span className="font-bold">{suggestion.votes}</span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-lg">{suggestion.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{suggestion.category}</Badge>
                            {getStatusBadge(suggestion.status)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-xs">{suggestion.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <span>{suggestion.author}</span>
                        </div>
                        <span>•</span>
                        <span>{suggestion.date}</span>
                        <span>•</span>
                        <span>{suggestion.department}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {suggestion.comments} comments
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="popular" className="mt-4">
          <p className="text-muted-foreground">Showing most voted suggestions...</p>
        </TabsContent>

        <TabsContent value="recent" className="mt-4">
          <p className="text-muted-foreground">Showing recently submitted suggestions...</p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
