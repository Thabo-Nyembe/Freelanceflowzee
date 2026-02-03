'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import {
  Video, Play, Pause, Star, Quote, Search, Plus, Download, Share2,
  Eye, Clock, Heart, MessageSquare, MoreHorizontal, Upload, Sparkles,
  CheckCircle, Camera, Mic, Film, Users, TrendingUp, Award, Send
} from 'lucide-react'

const videoTestimonials = [
  {
    id: 1,
    client: 'Sarah Johnson',
    company: 'TechCorp Inc',
    avatar: '/avatars/sarah.jpg',
    thumbnail: '/testimonials/sarah-thumb.jpg',
    duration: '2:34',
    rating: 5,
    views: 1250,
    featured: true,
    status: 'published',
    date: '2024-01-15',
    quote: 'Working with this team transformed our business...'
  },
  {
    id: 2,
    client: 'Michael Chen',
    company: 'StartupXYZ',
    avatar: '/avatars/michael.jpg',
    thumbnail: '/testimonials/michael-thumb.jpg',
    duration: '1:45',
    rating: 5,
    views: 890,
    featured: false,
    status: 'published',
    date: '2024-01-12',
    quote: 'The results exceeded our expectations...'
  },
  {
    id: 3,
    client: 'Emily Rodriguez',
    company: 'Global Media',
    avatar: '/avatars/emily.jpg',
    thumbnail: '/testimonials/emily-thumb.jpg',
    duration: '3:12',
    rating: 5,
    views: 2100,
    featured: true,
    status: 'published',
    date: '2024-01-10',
    quote: 'Absolutely incredible experience from start to finish...'
  },
  {
    id: 4,
    client: 'David Park',
    company: 'Local Boutique',
    avatar: '/avatars/david.jpg',
    thumbnail: '/testimonials/david-thumb.jpg',
    duration: '1:58',
    rating: 4,
    views: 456,
    featured: false,
    status: 'processing',
    date: '2024-01-08',
    quote: 'Great quality and professional service...'
  },
  {
    id: 5,
    client: 'Lisa Wang',
    company: 'E-commerce Plus',
    avatar: '/avatars/lisa.jpg',
    thumbnail: '/testimonials/lisa-thumb.jpg',
    duration: '2:20',
    rating: 5,
    views: 0,
    featured: false,
    status: 'pending',
    date: '2024-01-05',
    quote: 'Would recommend to anyone looking for quality...'
  },
]

const testimonialRequests = [
  { id: 1, client: 'John Smith', email: 'john@example.com', project: 'Website Redesign', sentAt: '2024-01-10', status: 'pending', reminder: 1 },
  { id: 2, client: 'Anna Brown', email: 'anna@startup.io', project: 'Mobile App', sentAt: '2024-01-08', status: 'opened', reminder: 0 },
  { id: 3, client: 'Tom Wilson', email: 'tom@agency.co', project: 'Brand Identity', sentAt: '2024-01-05', status: 'submitted', reminder: 2 },
]

export default function TestimonialsClient() {
  const [activeTab, setActiveTab] = useState('videos')
  const [searchQuery, setSearchQuery] = useState('')

  const stats = useMemo(() => {
    const published = videoTestimonials.filter(t => t.status === 'published')
    return {
      totalTestimonials: videoTestimonials.length,
      totalViews: published.reduce((sum, t) => sum + t.views, 0),
      avgRating: (published.reduce((sum, t) => sum + t.rating, 0) / published.length).toFixed(1),
      featuredCount: published.filter(t => t.featured).length
    }
  }, [])

  const filteredTestimonials = useMemo(() => {
    return videoTestimonials.filter(t =>
      t.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.company.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    }
    return <Badge variant="outline" className={styles[status as keyof typeof styles]}>{status}</Badge>
  }

  const insights = [
    { icon: Video, title: `${stats.totalTestimonials} Videos`, description: 'Total testimonials' },
    { icon: Star, title: `${stats.avgRating} Rating`, description: 'Average rating' },
    { icon: Eye, title: `${stats.totalViews.toLocaleString()} Views`, description: 'Total views' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Film className="h-8 w-8 text-primary" />
            Video Testimonials
          </h1>
          <p className="text-muted-foreground mt-1">Collect and showcase client video testimonials</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Send className="h-4 w-4 mr-2" />
            Request Testimonial
          </Button>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Video
          </Button>
        </div>
      </div>

      <CollapsibleInsightsPanel
        title="Testimonial Insights"
        insights={insights}
        defaultExpanded={true}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Videos</p>
                <p className="text-2xl font-bold">{stats.totalTestimonials}</p>
                <p className="text-xs text-muted-foreground mt-1">{stats.featuredCount} featured</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Video className="h-6 w-6 text-purple-600" />
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
                <p className="text-xs text-green-600 mt-1">+320 this week</p>
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
                <p className="text-sm text-muted-foreground">Avg. Rating</p>
                <p className="text-2xl font-bold">{stats.avgRating}</p>
                <div className="flex gap-0.5 mt-1">
                  {renderStars(Math.round(parseFloat(stats.avgRating)))}
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600 fill-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
                <p className="text-2xl font-bold">{testimonialRequests.filter(r => r.status !== 'submitted').length}</p>
                <p className="text-xs text-muted-foreground mt-1">Awaiting response</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="videos">Video Library</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="widgets">Embed Widgets</TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Video Testimonials</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search testimonials..."
                    className="pl-9 w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTestimonials.map((testimonial) => (
                  <div key={testimonial.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow group">
                    <div className="relative h-40 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                      <Video className="h-12 w-12 text-gray-600" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="secondary" size="icon" className="rounded-full h-12 w-12">
                          <Play className="h-6 w-6" />
                        </Button>
                      </div>
                      <div className="absolute bottom-2 right-2">
                        <Badge variant="secondary" className="bg-black/60 text-white">
                          {testimonial.duration}
                        </Badge>
                      </div>
                      {testimonial.featured && (
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-yellow-500 text-white">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{testimonial.client.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{testimonial.client}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        {renderStars(testimonial.rating)}
                        {getStatusBadge(testimonial.status)}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        "{testimonial.quote}"
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {testimonial.views.toLocaleString()}
                        </span>
                        <span>{testimonial.date}</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Download className="h-4 w-4 mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Testimonial Requests</CardTitle>
                  <CardDescription>Track and manage testimonial requests</CardDescription>
                </div>
                <Button>
                  <Send className="h-4 w-4 mr-2" />
                  New Request
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testimonialRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>{request.client.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{request.client}</p>
                        <p className="text-sm text-muted-foreground">{request.project}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm">Sent {request.sentAt}</p>
                        {request.reminder > 0 && (
                          <p className="text-xs text-muted-foreground">{request.reminder} reminder(s) sent</p>
                        )}
                      </div>
                      <Badge variant="outline" className={
                        request.status === 'submitted' ? 'bg-green-100 text-green-700' :
                        request.status === 'opened' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }>{request.status}</Badge>
                      <Button variant="outline" size="sm" disabled={request.status === 'submitted'}>
                        Send Reminder
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="widgets" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Embed Widgets</CardTitle>
              <CardDescription>Add testimonials to your website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'Carousel Widget', description: 'Auto-rotating testimonial carousel', icon: Film },
                  { name: 'Grid Widget', description: 'Display testimonials in a grid', icon: Users },
                  { name: 'Wall of Love', description: 'Social proof wall display', icon: Heart },
                ].map((widget, idx) => (
                  <div key={idx} className="border rounded-lg p-6 text-center hover:shadow-md transition-shadow">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <widget.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h4 className="font-medium mb-2">{widget.name}</h4>
                    <p className="text-sm text-muted-foreground mb-4">{widget.description}</p>
                    <Button variant="outline" className="w-full">Get Embed Code</Button>
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
