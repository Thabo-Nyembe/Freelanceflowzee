'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Share2, Plus, Search, Heart, MessageCircle, Users, TrendingUp, Eye, Calendar } from 'lucide-react'

const posts = [
  { id: 1, platform: 'Twitter', content: 'Excited to announce our new product launch! 🚀', date: '2024-02-01 10:30', likes: 245, comments: 32, shares: 18, impressions: 5200, status: 'published' },
  { id: 2, platform: 'LinkedIn', content: 'Join us for our upcoming webinar on AI trends', date: '2024-02-01 14:00', likes: 189, comments: 24, shares: 45, impressions: 8900, status: 'published' },
  { id: 3, platform: 'Facebook', content: 'Customer success story: How Company X achieved 300% growth', date: '2024-02-02 09:00', likes: 420, comments: 68, shares: 92, impressions: 12500, status: 'scheduled' },
  { id: 4, platform: 'Instagram', content: 'Behind the scenes at our office! #TeamCulture', date: '2024-01-31 16:00', likes: 1250, comments: 145, shares: 85, impressions: 18000, status: 'published' },
]

const platforms = [
  { name: 'Twitter', followers: 12500, engagement: 4.2, posts: 145, color: 'bg-blue-100 text-blue-700' },
  { name: 'LinkedIn', followers: 8900, engagement: 6.8, posts: 98, color: 'bg-indigo-100 text-indigo-700' },
  { name: 'Facebook', followers: 15200, engagement: 3.5, posts: 120, color: 'bg-blue-100 text-blue-700' },
  { name: 'Instagram', followers: 22000, engagement: 8.9, posts: 180, color: 'bg-pink-100 text-pink-700' },
]

const trending = [
  { content: 'Product launch announcement', platform: 'Twitter', engagement: 12.5, impressions: 25000 },
  { content: 'Customer testimonial video', platform: 'Instagram', engagement: 15.8, impressions: 42000 },
  { content: 'Industry insights article', platform: 'LinkedIn', engagement: 9.2, impressions: 18000 },
]

export default function SocialMediaClient() {
  const [searchQuery, setSearchQuery] = useState('')

  const stats = useMemo(() => ({
    totalFollowers: platforms.reduce((sum, p) => sum + p.followers, 0),
    avgEngagement: (platforms.reduce((sum, p) => sum + p.engagement, 0) / platforms.length).toFixed(1),
    totalPosts: platforms.reduce((sum, p) => sum + p.posts, 0),
    publishedPosts: posts.filter(p => p.status === 'published').length,
  }), [])

  const insights = [
    { icon: Users, title: `${(stats.totalFollowers / 1000).toFixed(1)}k`, description: 'Total followers' },
    { icon: TrendingUp, title: `${stats.avgEngagement}%`, description: 'Avg engagement' },
    { icon: Share2, title: `${stats.totalPosts}`, description: 'Total posts' },
    { icon: Calendar, title: `${stats.publishedPosts}`, description: 'Published today' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Share2 className="h-8 w-8 text-primary" />Social Media</h1>
          <p className="text-muted-foreground mt-1">Manage social media presence and engagement</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Create Post</Button>
      </div>

      <CollapsibleInsightsPanel title="Social Media Overview" insights={insights} defaultExpanded={true} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {platforms.map((platform) => (
          <Card key={platform.name} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <Badge className={platform.color}>{platform.name}</Badge>
              <p className="text-2xl font-bold mt-2">{(platform.followers / 1000).toFixed(1)}k</p>
              <p className="text-xs text-muted-foreground">followers • {platform.engagement}% engagement</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="posts">
        <TabsList>
          <TabsTrigger value="posts">Recent Posts</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-4">
          <div className="space-y-3">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <Badge className="mb-2">{post.platform}</Badge>
                      <p className="text-sm">{post.content}</p>
                    </div>
                    <Badge variant="outline">{post.status}</Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm mt-3">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4 text-blue-500" />
                      <span>{post.comments}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Share2 className="h-4 w-4 text-green-500" />
                      <span>{post.shares}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4 text-purple-500" />
                      <span>{post.impressions.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Trending Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trending.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{item.content}</h4>
                      <Badge>{item.platform}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Engagement</p>
                        <p className="font-medium text-lg text-green-600">{item.engagement}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Impressions</p>
                        <p className="font-medium text-lg">{item.impressions.toLocaleString()}</p>
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
