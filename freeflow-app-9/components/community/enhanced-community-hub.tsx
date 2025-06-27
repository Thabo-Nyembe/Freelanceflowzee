'use client

import React, { useState } from 'react
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { 
  MessageCircle, 
  Heart, 
  Share, 
  Bookmark, 
  Plus, 
  Image, 
  Video, 
  Star, 
  Users, 
  Calendar, 
  Instagram, 
  TrendingUp 
} from 'lucide-react

interface Post {
  id: string
  author: {
    name: string
    avatar: string
    rating: number
  }
  title: string
  content: string
  mediaUrl?: string
  likes: number
  comments: number
  shares: number
  bookmarked?: boolean
  createdAt: string
}

const socialPosts: Post[] = [
  {
    id: '1',
    author: { 
      name: 'Alex Designer', 
      avatar: '/avatars/alex-designer.jpg', 
      rating: 4.9 
    },
    title: 'Brand Identity for TechCorp',
    content: 'Just completed this amazing brand identity project! The client wanted something modern yet approachable.',
    mediaUrl: '/images/brand-showcase.jpg',
    likes: 42,
    comments: 8,
    shares: 3,
    bookmarked: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    author: { 
      name: 'Sarah Johnson', 
      avatar: '/avatars/sarah.jpg', 
      rating: 4.8 
    },
    title: 'Video Editing Magic',
    content: 'Behind the scenes of my latest video project. Love how the transitions turned out!',
    likes: 38,
    comments: 12,
    shares: 7,
    bookmarked: true,
    createdAt: new Date().toISOString()
  }
]

export default function EnhancedCommunityHub() {
  const [activeTab, setActiveTab] = useState('feed')
  const [showCreatePost, setShowCreatePost] = useState(false)

  const SocialPost = ({ post }: { post: Post }) => (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-6">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={post.author.avatar} alt={post.author.name} />
            <AvatarFallback>{post.author.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{post.title}</h3>
            <p className="text-gray-600 mt-1">{post.content}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-500">by {post.author.name}</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm text-gray-600">{post.author.rating}</span>
              </div>
            </div>
          </div>
        </div>

        {post.mediaUrl && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img 
              src={post.mediaUrl} 
              alt={post.title}
              className="w-full h-48 object-cover
            />
          </div>
        )}
"
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-500 transition-colors
              onClick={() => console.log('Like clicked')}
            >"
              <Heart className="w-5 h-5" />
              <span>{post.likes}</span>
            </button>
            
            <button 
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-500 transition-colors
              onClick={() => console.log('Comments clicked')}
            >"
              <MessageCircle className="w-5 h-5" />
              <span>{post.comments}</span>
            </button>
            
            <button 
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-500 transition-colors
              onClick={() => console.log('Share clicked')}
            >"
              <Share className="w-5 h-5" />
              <span>{post.shares}</span>
            </button>
          </div>
          
          <button 
            className={`text-gray-600 hover:text-yellow-500 transition-colors ${
              post.bookmarked ? 'text-yellow-500' : 
            }`}
            onClick={() => console.log('Bookmark clicked')}
          >
            <Bookmark className={`w-5 h-5 ${post.bookmarked ? 'fill-current' : '}`} />
          </button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Community Hub
          </h1>
          <p className="text-gray-600 text-lg">
            Connect with top creators and share your creative journey
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-white/50 backdrop-blur-sm">
            <TabsTrigger 
              value="feed" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white
            >"
              <Instagram className="w-4 h-4" />
              Feed
            </TabsTrigger>
            <TabsTrigger 
              value="creators" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white
            >"
              <Users className="w-4 h-4" />
              Creators
            </TabsTrigger>
            <TabsTrigger 
              value="showcase" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white
            >"
              <Star className="w-4 h-4" />
              Showcase
            </TabsTrigger>
            <TabsTrigger 
              value="events" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white
            >"
              <Calendar className="w-4 h-4" />
              Events
            </TabsTrigger>
          </TabsList>

          {/* Feed Tab */}
          <TabsContent value="feed">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Feed */}
              <div className="lg:col-span-2">
                {/* Create Post */}
                <Card className="mb-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src="/avatars/current-user.jpg" alt="You" />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                          YU
                        </AvatarFallback>
                      </Avatar>
                      <Input 
                        placeholder="Share your creative journey...
                        className="flex-1 bg-white/80
                        onClick={() => setShowCreatePost(true)}
                        readOnly
                      />
                    </div>"
                    <div className="flex items-center gap-4">
                      <Button 
                        variant="default
                        size="sm" 
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white
                        onClick={() => setShowCreatePost(true)}
                      >"
                        <Plus className="w-4 h-4 mr-2" />
                        Create Post
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-purple-600 hover:text-purple-700
                        onClick={() => alert('Photo upload coming soon!')}
                      >"
                        <Image className="w-4 h-4 mr-2" />
                        Photo
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-600 hover:text-blue-700
                        onClick={() => alert('Video upload coming soon!')}
                      >"
                        <Video className="w-4 h-4 mr-2" />
                        Video
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Posts Feed */}
                <div className="space-y-6">
                  {socialPosts.map(post => (
                    <SocialPost key={post.id} post={post} />
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Trending Tags */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      Trending Tags
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {['#photography', '#design', '#videoediting', '#branding', '#webdev'].map((tag, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-blue-600 hover:underline cursor-pointer">{tag}</span>
                        <Badge variant="secondary" className="text-xs">
                          {Math.floor(Math.random() * 1000) + 100}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Featured Creators */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Star className="w-5 h-5 text-purple-600" />
                      Featured Creators
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { name: 'Alex Designer', followers: '12.5K', avatar: '/avatars/alex.jpg' },
                      { name: 'Sarah Video', followers: '8.3K', avatar: '/avatars/sarah.jpg' },
                      { name: 'Mike Dev', followers: '15.2K', avatar: '/avatars/mike.jpg' }
                    ].map((creator, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={creator.avatar} alt={creator.name} />
                          <AvatarFallback>{creator.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-medium">{creator.name}</h4>
                          <p className="text-sm text-gray-600">{creator.followers} followers</p>
                        </div>
                        <Button size="sm" variant="outline">
                          Follow
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Other Tabs */}
          <TabsContent value="creators">
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-4">Creator Marketplace</h3>
              <p className="text-gray-600">Browse and connect with talented creators</p>
            </div>
          </TabsContent>

          <TabsContent value="showcase">
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-4">Project Showcase</h3>
              <p className="text-gray-600">Discover amazing projects from the community</p>
            </div>
          </TabsContent>

          <TabsContent value="events">
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-4">Community Events</h3>
              <p className="text-gray-600">Join upcoming workshops and networking events</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}