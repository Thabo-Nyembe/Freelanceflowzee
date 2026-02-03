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
  Star, TrendingUp, MessageSquare, Search, Filter, ThumbsUp,
  ThumbsDown, Reply, Flag, MoreHorizontal, Quote, Award, Heart,
  Share2, ExternalLink, CheckCircle, Clock, Eye, Send, Sparkles
} from 'lucide-react'

const reviews = [
  {
    id: 1,
    client: 'Sarah Johnson',
    clientAvatar: '/avatars/sarah.jpg',
    company: 'TechCorp Inc',
    rating: 5,
    title: 'Exceptional work and communication',
    content: 'Working with this team was an absolute pleasure. They delivered our website redesign ahead of schedule and exceeded all expectations. The attention to detail and responsiveness throughout the project was outstanding.',
    project: 'Website Redesign',
    date: '2024-01-15',
    status: 'published',
    helpful: 24,
    featured: true,
    verified: true
  },
  {
    id: 2,
    client: 'Michael Chen',
    clientAvatar: '/avatars/michael.jpg',
    company: 'StartupXYZ',
    rating: 5,
    title: 'Great experience from start to finish',
    content: 'The mobile app they built for us has transformed our business. User feedback has been overwhelmingly positive. Would highly recommend for any app development project.',
    project: 'Mobile App MVP',
    date: '2024-01-12',
    status: 'published',
    helpful: 18,
    featured: false,
    verified: true
  },
  {
    id: 3,
    client: 'Emily Rodriguez',
    clientAvatar: '/avatars/emily.jpg',
    company: 'Global Media',
    rating: 4,
    title: 'Good quality with minor delays',
    content: 'The video production quality was excellent. There were some timeline adjustments needed, but the final product was exactly what we envisioned. Communication could have been better during busy periods.',
    project: 'Video Production',
    date: '2024-01-08',
    status: 'published',
    helpful: 12,
    featured: false,
    verified: true
  },
  {
    id: 4,
    client: 'David Park',
    clientAvatar: '/avatars/david.jpg',
    company: 'Local Boutique',
    rating: 5,
    title: 'Perfect brand identity solution',
    content: 'They captured our brand essence perfectly. The logo, color scheme, and overall identity package has elevated our business presence significantly. Customers constantly compliment our new look.',
    project: 'Brand Identity',
    date: '2024-01-05',
    status: 'pending',
    helpful: 0,
    featured: false,
    verified: true
  },
  {
    id: 5,
    client: 'Anonymous',
    clientAvatar: null,
    company: 'Tech Innovators',
    rating: 3,
    title: 'Decent work but room for improvement',
    content: 'The SaaS platform works as expected but the onboarding process was confusing. Documentation could be more comprehensive. Support team was helpful when we reached out though.',
    project: 'SaaS Platform',
    date: '2024-01-02',
    status: 'hidden',
    helpful: 5,
    featured: false,
    verified: false
  },
]

const testimonialRequests = [
  { id: 1, client: 'John Smith', email: 'john@example.com', project: 'E-commerce Site', sentAt: '2024-01-10', status: 'pending' },
  { id: 2, client: 'Lisa Wang', email: 'lisa@startup.io', project: 'Dashboard App', sentAt: '2024-01-08', status: 'opened' },
  { id: 3, client: 'Tom Wilson', email: 'tom@agency.co', project: 'Marketing Site', sentAt: '2024-01-05', status: 'completed' },
]

export default function ReviewsClient() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [ratingFilter, setRatingFilter] = useState('all')

  const stats = useMemo(() => {
    const published = reviews.filter(r => r.status === 'published')
    const totalRating = published.reduce((sum, r) => sum + r.rating, 0)
    const avgRating = published.length > 0 ? (totalRating / published.length).toFixed(1) : '0.0'
    const fiveStars = published.filter(r => r.rating === 5).length
    return {
      totalReviews: published.length,
      avgRating,
      fiveStarPercent: Math.round((fiveStars / Math.max(published.length, 1)) * 100),
      pendingReviews: reviews.filter(r => r.status === 'pending').length
    }
  }, [])

  const filteredReviews = useMemo(() => {
    return reviews.filter(review => {
      const matchesSearch = review.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           review.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           review.project.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRating = ratingFilter === 'all' || review.rating === parseInt(ratingFilter)
      const matchesTab = activeTab === 'all' ||
                        (activeTab === 'featured' && review.featured) ||
                        (activeTab === 'pending' && review.status === 'pending')
      return matchesSearch && matchesRating && matchesTab
    })
  }, [searchQuery, ratingFilter, activeTab])

  const ratingDistribution = useMemo(() => {
    const dist = [0, 0, 0, 0, 0]
    reviews.filter(r => r.status === 'published').forEach(r => {
      dist[r.rating - 1]++
    })
    return dist.reverse()
  }, [])

  const renderStars = (rating: number, size: 'sm' | 'md' = 'md') => {
    const sizeClass = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      hidden: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    }
    return <Badge variant="outline" className={styles[status as keyof typeof styles]}>{status}</Badge>
  }

  const insights = [
    { icon: Star, title: `${stats.avgRating} Average`, description: 'Overall rating' },
    { icon: Award, title: `${stats.fiveStarPercent}% 5-Star`, description: 'Excellence rate' },
    { icon: TrendingUp, title: '+12 Reviews', description: 'This month' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
            Reviews & Testimonials
          </h1>
          <p className="text-muted-foreground mt-1">Manage client feedback and testimonials</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share Widget
          </Button>
          <Button>
            <Send className="h-4 w-4 mr-2" />
            Request Review
          </Button>
        </div>
      </div>

      <CollapsibleInsightsPanel
        title="Review Insights"
        insights={insights}
        defaultExpanded={true}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Stats Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Rating Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <p className="text-5xl font-bold">{stats.avgRating}</p>
                <div className="flex justify-center my-2">
                  {renderStars(Math.round(parseFloat(stats.avgRating)))}
                </div>
                <p className="text-sm text-muted-foreground">{stats.totalReviews} reviews</p>
              </div>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating, idx) => (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm w-3">{rating}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <Progress
                      value={(ratingDistribution[idx] / Math.max(stats.totalReviews, 1)) * 100}
                      className="h-2 flex-1"
                    />
                    <span className="text-sm text-muted-foreground w-6">{ratingDistribution[idx]}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending Reviews</span>
                <Badge variant="secondary">{stats.pendingReviews}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Featured</span>
                <Badge variant="secondary">{reviews.filter(r => r.featured).length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Response Rate</span>
                <Badge variant="secondary">100%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg. Response Time</span>
                <Badge variant="secondary">2 hours</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Review Requests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {testimonialRequests.slice(0, 3).map((req) => (
                <div key={req.id} className="flex items-center justify-between p-2 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{req.client}</p>
                    <p className="text-xs text-muted-foreground">{req.project}</p>
                  </div>
                  <Badge variant="outline" className={
                    req.status === 'completed' ? 'bg-green-100 text-green-700' :
                    req.status === 'opened' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }>{req.status}</Badge>
                </div>
              ))}
              <Button variant="link" className="w-full text-sm">View all requests</Button>
            </CardContent>
          </Card>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="all">All Reviews</TabsTrigger>
                    <TabsTrigger value="featured">Featured</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search reviews..."
                      className="pl-9 w-48"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={ratingFilter} onValueChange={setRatingFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredReviews.map((review) => (
                <div key={review.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={review.clientAvatar || ''} />
                        <AvatarFallback>{review.client.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{review.client}</p>
                          {review.verified && (
                            <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          {review.featured && (
                            <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700">
                              <Sparkles className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{review.company} · {review.project}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(review.status)}
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    {renderStars(review.rating)}
                    <span className="text-sm text-muted-foreground">· {review.date}</span>
                  </div>

                  <h4 className="font-medium mb-2">{review.title}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{review.content}</p>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Helpful ({review.helpful})
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <Reply className="h-4 w-4 mr-1" />
                        Reply
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      {review.status === 'pending' && (
                        <>
                          <Button size="sm" variant="outline">Hide</Button>
                          <Button size="sm">Publish</Button>
                        </>
                      )}
                      {review.status === 'published' && !review.featured && (
                        <Button size="sm" variant="outline">
                          <Sparkles className="h-4 w-4 mr-1" />
                          Feature
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
