'use client'

import { useState } from 'react'
import { Globe, MessageSquare, Heart, Share, Users, TrendingUp, Plus, Filter } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function CommunityPage() {
  const [posts] = useState([
    {
      id: 1,
      author: 'Sarah Mitchell',
      authorAvatar: null,
      role: 'UI/UX Designer',
      content: 'Just finished a challenging project! Anyone else working on dark mode interfaces lately? Would love to share some insights.',
      likes: 24,
      comments: 8,
      shares: 3,
      timestamp: '2 hours ago',
      tags: ['UI Design', 'Dark Mode', 'UX']
    },
    {
      id: 2,
      author: 'Alex Chen',
      authorAvatar: null,
      role: 'Frontend Developer',
      content: 'Check out this cool animation I created using Framer Motion. Perfect for landing pages!',
      likes: 42,
      comments: 15,
      shares: 7,
      timestamp: '4 hours ago',
      tags: ['Animation', 'React', 'Framer Motion']
    },
    {
      id: 3,
      author: 'Maria Garcia',
      authorAvatar: null,
      role: 'Brand Designer',
      content: 'Looking for feedback on this logo concept. What do you think about the color palette?',
      likes: 18,
      comments: 12,
      shares: 2,
      timestamp: '1 day ago',
      tags: ['Logo Design', 'Branding', 'Feedback']
    }
  ])

  const [trending] = useState([
    { tag: 'UI Design', posts: 156 },
    { tag: 'React', posts: 89 },
    { tag: 'Freelancing', posts: 67 },
    { tag: 'Design System', posts: 45 },
    { tag: 'Remote Work', posts: 38 }
  ])

  const [communities] = useState([
    { name: 'Designers Hub', members: 2341, description: 'Share design inspiration and get feedback' },
    { name: 'Freelancers United', members: 1987, description: 'Tips and discussions for freelance life' },
    { name: 'Dev Community', members: 3456, description: 'Code, collaborate, and learn together' },
    { name: 'Brand Builders', members: 1234, description: 'Everything about building strong brands' }
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Community</h1>
          <p className="text-gray-600">Connect, share, and learn with fellow creators</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">9,018</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Discussions</p>
                <p className="text-2xl font-bold text-gray-900">342</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Posts This Week</p>
                <p className="text-2xl font-bold text-gray-900">127</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Communities</p>
                <p className="text-2xl font-bold text-gray-900">{communities.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="feed" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="feed">Feed</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
              <TabsTrigger value="following">Following</TabsTrigger>
            </TabsList>

            <TabsContent value="feed" className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar>
                        <AvatarImage src={post.authorAvatar} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {post.author.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900">{post.author}</p>
                          <Badge variant="outline" className="text-xs">
                            {post.role}
                          </Badge>
                          <span className="text-sm text-gray-500">{post.timestamp}</span>
                        </div>
                        
                        <p className="mt-2 text-gray-700">{post.content}</p>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          {post.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              #{tag.toLowerCase().replace(' ', '')}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center space-x-6 mt-4 pt-4 border-t">
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500">
                            <Heart className="w-4 h-4 mr-1" />
                            {post.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-500">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            {post.comments}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-green-500">
                            <Share className="w-4 h-4 mr-1" />
                            {post.shares}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="trending" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Trending Topics</CardTitle>
                  <CardDescription>Most discussed topics this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trending.map((item, index) => (
                      <div key={item.tag} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">#{item.tag.toLowerCase().replace(' ', '')}</p>
                            <p className="text-sm text-gray-500">{item.posts} posts</p>
                          </div>
                        </div>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="following" className="space-y-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">You're not following anyone yet</p>
                  <Button className="mt-4" variant="outline">
                    Discover People
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Communities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Popular Communities</CardTitle>
              <CardDescription>Join discussions in these active communities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {communities.map((community) => (
                  <div key={community.name} className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{community.name}</p>
                      <p className="text-sm text-gray-500 mb-1">{community.description}</p>
                      <p className="text-xs text-gray-400">{community.members.toLocaleString()} members</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Join
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Post
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Find People
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Start Discussion
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Globe className="w-4 h-4 mr-2" />
                  Browse Communities
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 