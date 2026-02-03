'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import {
  MessageSquare, ThumbsUp, ThumbsDown, TrendingUp, Search, Filter,
  Star, Send, MoreHorizontal, Tag, AlertCircle, CheckCircle, Clock,
  Lightbulb, Bug, Sparkles, Heart, ArrowUpRight, BarChart3, Users,
  Smile, Meh, Frown, Zap
} from 'lucide-react'

const feedbackItems = [
  {
    id: 1,
    user: 'Sarah Johnson',
    email: 'sarah@techcorp.com',
    type: 'feature_request',
    title: 'Dark mode support',
    content: 'Would love to see a dark mode option for the dashboard. It would really help during late-night work sessions.',
    rating: null,
    sentiment: 'positive',
    status: 'under_review',
    votes: 145,
    createdAt: '2024-01-15',
    tags: ['UI/UX', 'Enhancement']
  },
  {
    id: 2,
    user: 'Mike Chen',
    email: 'mike@startup.io',
    type: 'bug_report',
    title: 'Export to PDF not working',
    content: 'When I try to export reports to PDF, the process hangs and never completes. Tried multiple browsers.',
    rating: null,
    sentiment: 'negative',
    status: 'in_progress',
    votes: 23,
    createdAt: '2024-01-14',
    tags: ['Bug', 'Export']
  },
  {
    id: 3,
    user: 'Emily Davis',
    email: 'emily@agency.co',
    type: 'general',
    title: 'Amazing product!',
    content: 'Just wanted to say that this product has completely transformed how our team works. The collaboration features are incredible!',
    rating: 5,
    sentiment: 'positive',
    status: 'acknowledged',
    votes: 12,
    createdAt: '2024-01-13',
    tags: ['Praise', 'Collaboration']
  },
  {
    id: 4,
    user: 'Tom Wilson',
    email: 'tom@enterprise.com',
    type: 'feature_request',
    title: 'API rate limiting dashboard',
    content: 'It would be helpful to have a dashboard showing API usage and rate limits to better plan our integrations.',
    rating: null,
    sentiment: 'neutral',
    status: 'planned',
    votes: 89,
    createdAt: '2024-01-12',
    tags: ['API', 'Dashboard']
  },
  {
    id: 5,
    user: 'Lisa Wang',
    email: 'lisa@design.co',
    type: 'general',
    title: 'Confusing navigation',
    content: 'I find it hard to navigate between different sections. The menu structure could be more intuitive.',
    rating: 3,
    sentiment: 'negative',
    status: 'under_review',
    votes: 34,
    createdAt: '2024-01-11',
    tags: ['Navigation', 'UX']
  },
]

const npsScores = {
  promoters: 68,
  passives: 22,
  detractors: 10,
  score: 58
}

const sentimentData = {
  positive: 65,
  neutral: 25,
  negative: 10
}

export default function FeedbackHubClient() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const stats = useMemo(() => ({
    totalFeedback: feedbackItems.length,
    pendingReview: feedbackItems.filter(f => f.status === 'under_review').length,
    avgRating: (feedbackItems.filter(f => f.rating).reduce((sum, f) => sum + (f.rating || 0), 0) / feedbackItems.filter(f => f.rating).length).toFixed(1),
    responseRate: 92
  }), [])

  const filteredFeedback = useMemo(() => {
    return feedbackItems.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.user.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = typeFilter === 'all' || item.type === typeFilter
      const matchesTab = activeTab === 'all' ||
                        (activeTab === 'feature_requests' && item.type === 'feature_request') ||
                        (activeTab === 'bugs' && item.type === 'bug_report') ||
                        (activeTab === 'general' && item.type === 'general')
      return matchesSearch && matchesType && matchesTab
    })
  }, [searchQuery, typeFilter, activeTab])

  const getTypeBadge = (type: string) => {
    const config = {
      feature_request: { bg: 'bg-purple-100 text-purple-700', icon: Lightbulb, label: 'Feature Request' },
      bug_report: { bg: 'bg-red-100 text-red-700', icon: Bug, label: 'Bug Report' },
      general: { bg: 'bg-blue-100 text-blue-700', icon: MessageSquare, label: 'General' },
    }
    const { bg, icon: Icon, label } = config[type as keyof typeof config] || config.general
    return (
      <Badge variant="outline" className={bg}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      under_review: 'bg-yellow-100 text-yellow-700',
      in_progress: 'bg-blue-100 text-blue-700',
      planned: 'bg-purple-100 text-purple-700',
      acknowledged: 'bg-green-100 text-green-700',
      closed: 'bg-gray-100 text-gray-700',
    }
    const labels = {
      under_review: 'Under Review',
      in_progress: 'In Progress',
      planned: 'Planned',
      acknowledged: 'Acknowledged',
      closed: 'Closed',
    }
    return <Badge variant="outline" className={styles[status as keyof typeof styles]}>{labels[status as keyof typeof labels]}</Badge>
  }

  const getSentimentIcon = (sentiment: string) => {
    if (sentiment === 'positive') return <Smile className="h-4 w-4 text-green-500" />
    if (sentiment === 'negative') return <Frown className="h-4 w-4 text-red-500" />
    return <Meh className="h-4 w-4 text-yellow-500" />
  }

  const insights = [
    { icon: MessageSquare, title: `${stats.totalFeedback} Feedback`, description: 'Total submissions' },
    { icon: TrendingUp, title: `${npsScores.score} NPS`, description: 'Net Promoter Score' },
    { icon: Zap, title: `${stats.responseRate}%`, description: 'Response rate' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-primary" />
            Feedback Hub
          </h1>
          <p className="text-muted-foreground mt-1">Collect and manage customer feedback</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button>
            <Send className="h-4 w-4 mr-2" />
            Request Feedback
          </Button>
        </div>
      </div>

      <CollapsibleInsightsPanel
        title="Feedback Insights"
        insights={insights}
        defaultExpanded={true}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">NPS Score</p>
                <p className="text-3xl font-bold text-green-600">{npsScores.score}</p>
              </div>
              <div className="text-right text-xs">
                <p className="text-green-600">{npsScores.promoters}% Promoters</p>
                <p className="text-yellow-600">{npsScores.passives}% Passives</p>
                <p className="text-red-600">{npsScores.detractors}% Detractors</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Sentiment Analysis</p>
            <div className="flex items-center gap-2 mt-2">
              <Smile className="h-5 w-5 text-green-500" />
              <Progress value={sentimentData.positive} className="h-2 flex-1" />
              <span className="text-sm font-medium">{sentimentData.positive}%</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Meh className="h-5 w-5 text-yellow-500" />
              <Progress value={sentimentData.neutral} className="h-2 flex-1" />
              <span className="text-sm font-medium">{sentimentData.neutral}%</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Frown className="h-5 w-5 text-red-500" />
              <Progress value={sentimentData.negative} className="h-2 flex-1" />
              <span className="text-sm font-medium">{sentimentData.negative}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">{stats.pendingReview}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Rating</p>
                <p className="text-2xl font-bold flex items-center">
                  {stats.avgRating}
                  <Star className="h-5 w-5 ml-1 fill-yellow-400 text-yellow-400" />
                </p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Feedback</TabsTrigger>
          <TabsTrigger value="feature_requests">Feature Requests</TabsTrigger>
          <TabsTrigger value="bugs">Bug Reports</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Feedback Items</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search feedback..."
                    className="pl-9 w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredFeedback.map((item) => (
                  <div key={item.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarFallback>{item.user.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{item.user}</p>
                            {getTypeBadge(item.type)}
                            {getStatusBadge(item.status)}
                            {getSentimentIcon(item.sentiment)}
                          </div>
                          <h4 className="font-medium mt-2">{item.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{item.content}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex flex-wrap gap-2">
                              {item.tags.map((tag, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  <Tag className="h-3 w-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">{item.createdAt}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Button variant="ghost" size="sm" className="h-8">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {item.votes}
                          </Button>
                        </div>
                        {item.rating && (
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < item.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        )}
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
      </Tabs>
    </div>
  )
}
