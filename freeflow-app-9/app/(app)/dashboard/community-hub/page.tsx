"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from "@/components/ui/badge"
import {
  Users,
  MessageSquare,
  Share2,
  Heart,
  Eye,
  Plus,
  Search,
  Filter,
  Bookmark,
  Globe,
  TrendingUp,
  Award,
  Bell,
  Upload,
  Download,
  Settings,
  Star,
  ThumbsUp,
  Reply
} from 'lucide-react'

interface Post {
  id: number
  author: string
  avatar: string
  title: string
  content: string
  likes: number
  comments: number
  views: number
  shares: number
  tags: string[]
  timestamp: string
  featured: boolean
}

export default function CommunityHubPage() {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      author: 'John Doe',
      avatar: '/avatars/john.jpg',
      title: 'Amazing Design Trends for 2024',
      content: 'Here are the top design trends I\'ve been following this year. From minimalist approaches to bold typography, the landscape is evolving rapidly...',
      likes: 24,
      comments: 8,
      views: 156,
      shares: 5,
      tags: ['design', 'trends', 'ui/ux'],
      timestamp: '2 hours ago',
      featured: true
    },
    {
      id: 2,
      author: 'Jane Smith',
      avatar: '/avatars/jane.jpg',
      title: 'How to Optimize Client Communication',
      content: 'Effective communication strategies that have improved my client relationships and project outcomes. These tips will help you build stronger partnerships...',
      likes: 18,
      comments: 12,
      views: 89,
      shares: 3,
      tags: ['communication', 'clients', 'tips'],
      timestamp: '4 hours ago',
      featured: false
    },
    {
      id: 3,
      author: 'Mike Johnson',
      avatar: '/avatars/mike.jpg',
      title: 'Building Scalable Design Systems',
      content: 'A comprehensive guide to creating design systems that grow with your product. Learn from real-world examples and best practices...',
      likes: 32,
      comments: 15,
      views: 234,
      shares: 8,
      tags: ['design-system', 'scalability', 'process'],
      timestamp: '1 day ago',
      featured: true
    }
  ])

  const [newPost, setNewPost] = useState({ title: '', content: '', tags: '' })
  const [searchQuery, setSearchQuery] = useState('')

  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert('Please fill in both title and content')
      return
    }
    
    const post: Post = {
      id: Date.now(),
      author: 'You',
      avatar: '/avatars/default.jpg',
      title: newPost.title,
      content: newPost.content,
      likes: 0,
      comments: 0,
      views: 1,
      shares: 0,
      tags: newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      timestamp: 'just now',
      featured: false
    }
    
    setPosts([post, ...posts])
    setNewPost({ title: '', content: '', tags: '' })
    alert('Post created successfully!')
  }

  const handleLikePost = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ))
    alert('Post liked!')
  }

  const handleSharePost = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, shares: post.shares + 1 }
        : post
    ))
    alert(`Post ${postId} shared successfully!`)
  }

  const handleBookmarkPost = (postId: number) => {
    alert(`Post ${postId} bookmarked!`)
  }

  const communityStats = [
    { label: 'Active Members', value: '1,234', icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Total Posts', value: '5,678', icon: MessageSquare, color: 'text-green-600', bgColor: 'bg-green-50' },
    { label: 'Shared Resources', value: '890', icon: Share2, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { label: 'Community Score', value: '98%', icon: Award, color: 'text-amber-600', bgColor: 'bg-amber-50' }
  ]

  const trendingTopics = [
    { tag: '#design-trends', posts: 45 },
    { tag: '#ui-ux', posts: 32 },
    { tag: '#client-tips', posts: 28 },
    { tag: '#workflow', posts: 24 },
    { tag: '#creative-process', posts: 19 }
  ]

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community Hub</h1>
          <p className="text-gray-600 mt-2">
            Connect, share, and learn with fellow creators
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="community-settings-btn">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button data-testid="join-discussion-btn">
            <Plus className="w-4 h-4 mr-2" />
            Join Discussion
          </Button>
        </div>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {communityStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                  <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-3 space-y-6">
          {/* Create Post */}
          <Card>
            <CardHeader>
              <CardTitle>Share with Community</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Post title..."
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              />
              <Textarea
                placeholder="What would you like to share?"
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                rows={4}
                className="resize-none"
              />
              <Input
                placeholder="Tags (comma separated)..."
                value={newPost.tags}
                onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
              />
              <div className="flex gap-2">
                <Button 
                  onClick={handleCreatePost}
                  data-testid="create-post-btn"
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Post
                </Button>
                <Button 
                  variant="outline"
                  data-testid="upload-media-btn"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Media
                </Button>
                <Button 
                  variant="outline"
                  data-testid="save-draft-btn"
                >
                  Save Draft
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search community posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" data-testid="filter-posts-btn">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" data-testid="sort-posts-btn">
              <TrendingUp className="w-4 h-4 mr-2" />
              Sort
            </Button>
          </div>

          {/* Posts Feed */}
          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <Card key={post.id} className={`${post.featured ? 'ring-2 ring-violet-200' : ''}`}>
                <CardContent className="p-6">
                  {post.featured && (
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="w-4 h-4 text-violet-600" />
                      <span className="text-sm text-violet-600 font-medium">Featured Post</span>
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{post.author}</h4>
                        <p className="text-sm text-gray-500">{post.timestamp}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleBookmarkPost(post.id)}
                        data-testid={`bookmark-post-${post.id}-btn`}
                      >
                        <Bookmark className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleSharePost(post.id)}
                        data-testid={`share-post-${post.id}-btn`}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{post.content}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs cursor-pointer hover:bg-violet-100">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <button 
                        onClick={() => handleLikePost(post.id)}
                        data-testid={`like-post-${post.id}-btn`}
                        className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        <span className="text-sm">{post.likes}</span>
                      </button>
                      <button 
                        data-testid={`comment-post-${post.id}-btn`}
                        className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-sm">{post.comments}</span>
                      </button>
                      <button 
                        data-testid={`reply-post-${post.id}-btn`}
                        className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors"
                      >
                        <Reply className="w-4 h-4" />
                        <span className="text-sm">Reply</span>
                      </button>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">{post.views}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm">{post.shares}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trending Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Trending Topics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {trendingTopics.map((topic, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <span className="text-sm font-medium text-violet-600">{topic.tag}</span>
                  <span className="text-xs text-gray-500">{topic.posts} posts</span>
                </div>
              ))}
              <Button variant="outline" className="w-full" data-testid="view-all-trends-btn">
                View All Trends
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                data-testid="my-bookmarks-btn"
              >
                <Bookmark className="w-4 h-4 mr-2" />
                My Bookmarks
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                data-testid="my-posts-btn"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                My Posts
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                data-testid="notifications-btn"
              >
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                data-testid="community-guidelines-btn"
              >
                <Globe className="w-4 h-4 mr-2" />
                Guidelines
              </Button>
            </CardContent>
          </Card>

          {/* Active Members */}
          <Card>
            <CardHeader>
              <CardTitle>Active Members</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson'].map((member, index) => (
                <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{member}</p>
                    <p className="text-xs text-gray-500">Online now</p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              ))}
              <Button variant="outline" className="w-full" data-testid="view-all-members-btn">
                View All Members
              </Button>
            </CardContent>
          </Card>

          {/* Community Events */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900">Design Workshop</h4>
                <p className="text-sm text-blue-700">Tomorrow at 2 PM</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900">Q&A Session</h4>
                <p className="text-sm text-green-700">Friday at 10 AM</p>
              </div>
              <Button variant="outline" className="w-full" data-testid="view-all-events-btn">
                View All Events
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 