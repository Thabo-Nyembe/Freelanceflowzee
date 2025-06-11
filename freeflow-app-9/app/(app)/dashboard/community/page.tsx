'use client'

import React, { useState, useReducer, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Verified, 
  Camera, 
  Video, 
  Mic, 
  Image as ImageIcon,
  Play,
  Pause,
  Volume2,
  MoreVertical,
  Send,
  Smile,
  Hash,
  TrendingUp,
  Users,
  Award,
  Eye,
  Clock,
  DollarSign
} from 'lucide-react'

// Types for the community system
interface Creator {
  id: string
  name: string
  username: string
  avatar: string
  verified: boolean
  category: string
  rating: number
  reviewCount: number
  location: string
  startingPrice: number
  completedProjects: number
  bio: string
  portfolio: string[]
  skills: string[]
  isOnline: boolean
  responseTime: string
}

interface Post {
  id: string
  creator: Creator
  content: string
  media: {
    type: 'image' | 'video' | 'audio' | 'carousel'
    urls: string[]
    thumbnail?: string
    duration?: number
    waveform?: number[]
  }[]
  likes: number
  comments: number
  shares: number
  isLiked: boolean
  isBookmarked: boolean
  timestamp: string
  hashtags: string[]
  location?: string
}

interface Comment {
  id: string
  user: Creator
  content: string
  likes: number
  timestamp: string
  isLiked: boolean
}

// Sample data
const sampleCreators: Creator[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    username: '@sarahdesigns',
    avatar: '/avatars/sarah.jpg',
    verified: true,
    category: 'UI/UX Designer',
    rating: 4.9,
    reviewCount: 156,
    location: 'San Francisco, CA',
    startingPrice: 150,
    completedProjects: 89,
    bio: 'Award-winning UI/UX designer specializing in mobile apps and SaaS platforms. 8+ years creating beautiful user experiences.',
    portfolio: ['/portfolio/sarah1.jpg', '/portfolio/sarah2.jpg', '/portfolio/sarah3.jpg'],
    skills: ['UI Design', 'UX Research', 'Prototyping', 'Figma', 'Adobe Creative Suite'],
    isOnline: true,
    responseTime: '< 1 hour'
  },
  {
    id: '2',
    name: 'Marcus Rodriguez',
    username: '@marcusphoto',
    avatar: '/avatars/marcus.jpg',
    verified: true,
    category: 'Photographer',
    rating: 4.8,
    reviewCount: 203,
    location: 'New York, NY',
    startingPrice: 300,
    completedProjects: 145,
    bio: 'Professional photographer capturing brands, events, and lifestyle moments. Featured in Vogue, Harper\'s Bazaar.',
    portfolio: ['/portfolio/marcus1.jpg', '/portfolio/marcus2.jpg', '/portfolio/marcus3.jpg'],
    skills: ['Portrait Photography', 'Brand Photography', 'Event Photography', 'Photo Editing'],
    isOnline: false,
    responseTime: '2-4 hours'
  },
  {
    id: '3',
    name: 'Alex Thompson',
    username: '@alexcodes',
    avatar: '/avatars/alex.jpg',
    verified: true,
    category: 'Full-Stack Developer',
    rating: 5.0,
    reviewCount: 78,
    location: 'Austin, TX',
    startingPrice: 200,
    completedProjects: 67,
    bio: 'Full-stack developer building scalable web applications. React, Node.js, and cloud architecture specialist.',
    portfolio: ['/portfolio/alex1.jpg', '/portfolio/alex2.jpg', '/portfolio/alex3.jpg'],
    skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'PostgreSQL'],
    isOnline: true,
    responseTime: '< 30 min'
  },
  // Add more creators...
]

const samplePosts: Post[] = [
  {
    id: '1',
    creator: sampleCreators[0],
    content: 'Just finished designing this sleek dashboard for a fintech startup! 🚀 The color palette and micro-interactions really bring it to life. What do you think? #UIDesign #Dashboard #Fintech',
    media: [
      {
        type: 'carousel',
        urls: ['/posts/dashboard1.jpg', '/posts/dashboard2.jpg', '/posts/dashboard3.jpg']
      }
    ],
    likes: 1247,
    comments: 89,
    shares: 34,
    isLiked: false,
    isBookmarked: true,
    timestamp: '2 hours ago',
    hashtags: ['UIDesign', 'Dashboard', 'Fintech'],
    location: 'San Francisco, CA'
  },
  {
    id: '2',
    creator: sampleCreators[1],
    content: 'Golden hour magic at yesterday\'s brand shoot ✨ Sometimes the best shots happen when you least expect them. Here\'s a behind-the-scenes audio note from the session!',
    media: [
      {
        type: 'image',
        urls: ['/posts/photoshoot1.jpg']
      },
      {
        type: 'audio',
        urls: ['/posts/behind-scenes-audio.mp3'],
        duration: 45,
        waveform: [0.2, 0.5, 0.8, 0.3, 0.7, 0.4, 0.9, 0.2, 0.6, 0.1]
      }
    ],
    likes: 892,
    comments: 56,
    shares: 23,
    isLiked: true,
    isBookmarked: false,
    timestamp: '5 hours ago',
    hashtags: ['Photography', 'GoldenHour', 'BrandShoot'],
    location: 'Central Park, NY'
  }
]

// Community state management
interface CommunityState {
  activeTab: 'marketplace' | 'wall'
  selectedCategory: string
  searchQuery: string
  selectedPost: string | null
  showComments: string | null
  newPostModal: boolean
  posts: Post[]
  creators: Creator[]
}

type CommunityAction = 
  | { type: 'SET_TAB'; payload: 'marketplace' | 'wall' }
  | { type: 'SET_CATEGORY'; payload: string }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SELECT_POST'; payload: string | null }
  | { type: 'TOGGLE_COMMENTS'; payload: string | null }
  | { type: 'TOGGLE_NEW_POST' }
  | { type: 'LIKE_POST'; payload: string }
  | { type: 'BOOKMARK_POST'; payload: string }

const communityReducer = (state: CommunityState, action: CommunityAction): CommunityState => {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, activeTab: action.payload }
    case 'SET_CATEGORY':
      return { ...state, selectedCategory: action.payload }
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload }
    case 'SELECT_POST':
      return { ...state, selectedPost: action.payload }
    case 'TOGGLE_COMMENTS':
      return { ...state, showComments: state.showComments === action.payload ? null : action.payload }
    case 'TOGGLE_NEW_POST':
      return { ...state, newPostModal: !state.newPostModal }
    case 'LIKE_POST':
      return {
        ...state,
        posts: state.posts.map(post =>
          post.id === action.payload
            ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
            : post
        )
      }
    case 'BOOKMARK_POST':
      return {
        ...state,
        posts: state.posts.map(post =>
          post.id === action.payload
            ? { ...post, isBookmarked: !post.isBookmarked }
            : post
        )
      }
    default:
      return state
  }
}

import EnhancedCommunityHub from '@/components/community/enhanced-community-hub'

export default function CommunityPage() {
  const [state, dispatch] = useReducer(communityReducer, {
    activeTab: 'marketplace',
    selectedCategory: 'All',
    searchQuery: '',
    selectedPost: null,
    showComments: null,
    newPostModal: false,
    posts: samplePosts,
    creators: sampleCreators
  })

  const categories = ['All', 'UI/UX Designer', 'Photographer', 'Developer', 'Videographer', 'Illustrator', 'Copywriter', 'Influencer']

  return (
    <div className="min-h-screen">
      {/* Enhanced Community Hub */}
      <EnhancedCommunityHub />
    </div>
  )
  
  // Original community page (backup)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-violet-50/40 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extralight text-slate-800 mb-2">Community</h1>
            <p className="text-slate-600 font-light">Connect with creators and discover amazing work</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              onClick={() => dispatch({ type: 'TOGGLE_NEW_POST' })}
              className="bg-gradient-to-r from-rose-500 to-violet-600 text-white hover:from-rose-600 hover:to-violet-700"
            >
              <Camera className="w-4 h-4 mr-2" />
              Create Post
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between bg-white/60 backdrop-blur-xl rounded-2xl p-1 border border-white/20 shadow-luxury">
          <div className="flex items-center">
            <Button
              variant={state.activeTab === 'marketplace' ? 'default' : 'ghost'}
              onClick={() => dispatch({ type: 'SET_TAB', payload: 'marketplace' })}
              className={`rounded-xl transition-all duration-300 ${
                state.activeTab === 'marketplace'
                  ? 'bg-white shadow-md text-slate-800'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4 mr-2" />
              Creator Marketplace
            </Button>
            <Button
              variant={state.activeTab === 'wall' ? 'default' : 'ghost'}
              onClick={() => dispatch({ type: 'SET_TAB', payload: 'wall' })}
              className={`rounded-xl transition-all duration-300 ${
                state.activeTab === 'wall'
                  ? 'bg-white shadow-md text-slate-800'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <Hash className="w-4 h-4 mr-2" />
              Social Wall
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder={state.activeTab === 'marketplace' ? 'Search creators...' : 'Search posts...'}
              value={state.searchQuery}
              onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
              className="pl-10 w-80 bg-white/80 border-white/20 focus:bg-white"
            />
          </div>
        </div>

        {/* Marketplace Tab */}
        {state.activeTab === 'marketplace' && (
          <div className="space-y-6">
            
            {/* Category Filter */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={state.selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => dispatch({ type: 'SET_CATEGORY', payload: category })}
                  className={`whitespace-nowrap rounded-full transition-all duration-300 ${
                    state.selectedCategory === category
                      ? 'bg-gradient-to-r from-rose-500 to-violet-600 text-white border-0'
                      : 'bg-white/60 border-white/20 text-slate-600 hover:bg-white hover:text-slate-800'
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Featured Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white/60 backdrop-blur-xl border-white/20 shadow-luxury">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Active Creators</p>
                      <p className="text-2xl font-light text-slate-800">2,847</p>
                    </div>
                    <Users className="w-8 h-8 text-rose-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/60 backdrop-blur-xl border-white/20 shadow-luxury">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Projects Completed</p>
                      <p className="text-2xl font-light text-slate-800">12,456</p>
                    </div>
                    <Award className="w-8 h-8 text-violet-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/60 backdrop-blur-xl border-white/20 shadow-luxury">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Avg Response Time</p>
                      <p className="text-2xl font-light text-slate-800">2.3h</p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/60 backdrop-blur-xl border-white/20 shadow-luxury">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Total Revenue</p>
                      <p className="text-2xl font-light text-slate-800">$2.8M</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-emerald-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top 20 Creators Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {state.creators.slice(0, 20).map((creator) => (
                <Card key={creator.id} className="bg-white/60 backdrop-blur-xl border-white/20 shadow-luxury hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
                  <CardContent className="p-6">
                    
                    {/* Creator Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={creator.avatar} alt={creator.name} />
                            <AvatarFallback>{creator.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          {creator.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-slate-800">{creator.name}</h3>
                            {creator.verified && (
                              <Verified className="w-4 h-4 text-blue-500 fill-current" />
                            )}
                          </div>
                          <p className="text-sm text-slate-600">{creator.username}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white/80 border-white/20 text-slate-600 hover:bg-white hover:text-slate-800"
                      >
                        View Profile
                      </Button>
                    </div>

                    {/* Category & Rating */}
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="bg-gradient-to-r from-rose-50 to-violet-50 border-rose-200 text-rose-700">
                        {creator.category}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-current" />
                        <span className="text-sm font-medium text-slate-700">{creator.rating}</span>
                        <span className="text-sm text-slate-500">({creator.reviewCount})</span>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-sm text-slate-600 mb-4 line-clamp-3">{creator.bio}</p>

                    {/* Portfolio Preview */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {creator.portfolio.slice(0, 3).map((image, index) => (
                        <div key={index} className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg overflow-hidden">
                          <div className="w-full h-full bg-gradient-to-br from-rose-100 via-violet-100 to-blue-100"></div>
                        </div>
                      ))}
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {creator.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs bg-white/50 border-white/30 text-slate-600">
                          {skill}
                        </Badge>
                      ))}
                      {creator.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs bg-white/50 border-white/30 text-slate-600">
                          +{creator.skills.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Stats & CTA */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span className="text-slate-600">{creator.location}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-slate-800">${creator.startingPrice}/hr</p>
                          <p className="text-xs text-slate-500">{creator.responseTime}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-gradient-to-r from-rose-500 to-violet-600 text-white hover:from-rose-600 hover:to-violet-700"
                        >
                          Hire Now
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="bg-white/80 border-white/20 text-slate-600 hover:bg-white hover:text-slate-800"
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Social Wall Tab */}
        {state.activeTab === 'wall' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Feed */}
            <div className="lg:col-span-2 space-y-6">
              {state.posts.map((post) => (
                <Card key={post.id} className="bg-white/60 backdrop-blur-xl border-white/20 shadow-luxury">
                  <CardContent className="p-0">
                    
                    {/* Post Header */}
                    <div className="p-6 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={post.creator.avatar} alt={post.creator.name} />
                            <AvatarFallback>{post.creator.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-slate-800">{post.creator.name}</h4>
                              {post.creator.verified && (
                                <Verified className="w-4 h-4 text-blue-500 fill-current" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <span>{post.timestamp}</span>
                              {post.location && (
                                <>
                                  <span>•</span>
                                  <MapPin className="w-3 h-3" />
                                  <span>{post.location}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="px-6 pb-4">
                      <p className="text-slate-700 leading-relaxed">{post.content}</p>
                    </div>

                    {/* Media */}
                    <div className="space-y-4">
                      {post.media.map((media, index) => (
                        <div key={index}>
                          {media.type === 'image' && (
                            <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200">
                              <div className="w-full h-full bg-gradient-to-br from-rose-100 via-violet-100 to-blue-100"></div>
                            </div>
                          )}
                          
                          {media.type === 'carousel' && (
                            <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 relative">
                              <div className="w-full h-full bg-gradient-to-br from-emerald-100 via-blue-100 to-violet-100"></div>
                              <div className="absolute top-4 right-4 bg-black/50 text-white text-sm px-2 py-1 rounded-full">
                                1 / {media.urls.length}
                              </div>
                            </div>
                          )}

                          {media.type === 'video' && (
                            <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 relative">
                              <div className="w-full h-full bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100"></div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Button size="lg" className="rounded-full bg-white/90 text-slate-800 hover:bg-white">
                                  <Play className="w-6 h-6" />
                                </Button>
                              </div>
                              {media.duration && (
                                <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-2 py-1 rounded">
                                  {Math.floor(media.duration / 60)}:{(media.duration % 60).toString().padStart(2, '0')}
                                </div>
                              )}
                            </div>
                          )}

                          {media.type === 'audio' && (
                            <div className="bg-gradient-to-r from-rose-50 to-violet-50 p-6 rounded-lg border border-white/20">
                              <div className="flex items-center gap-4">
                                <Button size="sm" className="rounded-full bg-gradient-to-r from-rose-500 to-violet-600 text-white">
                                  <Play className="w-4 h-4" />
                                </Button>
                                <div className="flex-1">
                                  <div className="flex items-center gap-1 mb-2">
                                    {media.waveform?.map((height, i) => (
                                      <div
                                        key={i}
                                        className="bg-gradient-to-t from-rose-400 to-violet-500 rounded-full"
                                        style={{
                                          height: `${height * 30}px`,
                                          width: '3px'
                                        }}
                                      />
                                    ))}
                                  </div>
                                  <div className="flex items-center justify-between text-sm text-slate-600">
                                    <span>0:00</span>
                                    <Mic className="w-4 h-4" />
                                    <span>{media.duration}s</span>
                                  </div>
                                </div>
                                <Volume2 className="w-4 h-4 text-slate-400" />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Engagement */}
                    <div className="p-6 pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-6">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dispatch({ type: 'LIKE_POST', payload: post.id })}
                            className={`flex items-center gap-2 ${
                              post.isLiked ? 'text-red-500' : 'text-slate-600'
                            }`}
                          >
                            <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                            <span>{post.likes.toLocaleString()}</span>
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dispatch({ type: 'TOGGLE_COMMENTS', payload: post.id })}
                            className="flex items-center gap-2 text-slate-600"
                          >
                            <MessageCircle className="w-5 h-5" />
                            <span>{post.comments}</span>
                          </Button>
                          
                          <Button variant="ghost" size="sm" className="flex items-center gap-2 text-slate-600">
                            <Share2 className="w-5 h-5" />
                            <span>{post.shares}</span>
                          </Button>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dispatch({ type: 'BOOKMARK_POST', payload: post.id })}
                          className={`${post.isBookmarked ? 'text-blue-500' : 'text-slate-600'}`}
                        >
                          <Bookmark className={`w-5 h-5 ${post.isBookmarked ? 'fill-current' : ''}`} />
                        </Button>
                      </div>

                      {/* Comments Section */}
                      {state.showComments === post.id && (
                        <div className="space-y-4 border-t border-white/20 pt-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>YU</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 flex gap-2">
                              <Input placeholder="Add a comment..." className="bg-white/80 border-white/20" />
                              <Button size="sm" className="bg-gradient-to-r from-rose-500 to-violet-600 text-white">
                                <Send className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Sample Comments */}
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback>JD</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="bg-white/80 rounded-lg p-3">
                                  <p className="text-sm font-medium text-slate-800">John Doe</p>
                                  <p className="text-sm text-slate-600">This looks amazing! The color palette is perfect 🎨</p>
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                  <span>2h</span>
                                  <button className="hover:text-slate-700">Like</button>
                                  <button className="hover:text-slate-700">Reply</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Trending Hashtags */}
              <Card className="bg-white/60 backdrop-blur-xl border-white/20 shadow-luxury">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-rose-500" />
                    Trending
                  </h3>
                  <div className="space-y-3">
                    {[
                      { tag: 'UIDesign', posts: '12.5K' },
                      { tag: 'Photography', posts: '8.3K' },
                      { tag: 'WebDevelopment', posts: '6.7K' },
                      { tag: 'BrandDesign', posts: '5.2K' },
                      { tag: 'DigitalArt', posts: '4.8K' }
                    ].map((trend, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-800">#{trend.tag}</p>
                          <p className="text-sm text-slate-500">{trend.posts} posts</p>
                        </div>
                        <Hash className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Featured Creators */}
              <Card className="bg-white/60 backdrop-blur-xl border-white/20 shadow-luxury">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500" />
                    Featured Creators
                  </h3>
                  <div className="space-y-4">
                    {state.creators.slice(0, 3).map((creator) => (
                      <div key={creator.id} className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={creator.avatar} alt={creator.name} />
                          <AvatarFallback>{creator.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-1">
                            <p className="font-medium text-slate-800 text-sm">{creator.name}</p>
                            {creator.verified && (
                              <Verified className="w-3 h-3 text-blue-500 fill-current" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500">{creator.category}</p>
                        </div>
                        <Button size="sm" variant="outline" className="text-xs">
                          Follow
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 