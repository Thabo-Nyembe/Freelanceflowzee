'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EnhancedSharingModal } from '@/components/ui/enhanced-sharing-modal'
import { useSharingModal } from '@/hooks/use-sharing-modal'
import { 
  Heart, MessageCircle, Share, Bookmark, MoreHorizontal, Search, Filter,
  Play, Pause, Volume2, VolumeX, Camera, Image, Mic, Video,
  Star, MapPin, Users, Briefcase, Award, TrendingUp, CheckCircle,
  Instagram, Twitter, Facebook, Globe, Phone, Mail, Calendar,
  ThumbsUp, Send, Upload, X, Sparkles, Zap, Target, Plus, Clock, User
} from 'lucide-react'

const EnhancedCommunityHub = () => {
  const [activeTab, setActiveTab] = useState('feed')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [newPost, setNewPost] = useState({
    content: '',
    mediaType: 'image',
    mediaUrl: '',
    tags: []
  })
  const [audioPlaying, setAudioPlaying] = useState(null)
  
  const { isOpen, shareContent, closeSharingModal, sharePost } = useSharingModal()

  // Top 20 creators data
  const topCreators = [
    {
      id: 1,
      name: 'Sarah Chen',
      category: 'Photography',
      specialties: ['Portrait', 'Wedding', 'Commercial'],
      rating: 4.9,
      reviews: 247,
      projects: 156,
      pricing: '$50-150/hr',
      location: 'New York, NY',
      avatar: '/avatars/sarah-chen.jpg',
      verified: true,
      online: true,
      portfolio: [
        { type: 'image', url: '/portfolio/sarah-1.jpg', title: 'Urban Portrait Series' },
        { type: 'image', url: '/portfolio/sarah-2.jpg', title: 'Corporate Headshots' },
        { type: 'image', url: '/portfolio/sarah-3.jpg', title: 'Wedding Photography' }
      ],
      bio: 'Award-winning photographer with 8+ years experience. Specialized in capturing authentic moments.',
      badges: ['Top Rated', 'Quick Response', 'Pro']
    },
    {
      id: 2,
      name: 'Marcus Rodriguez',
      category: 'Video Editor',
      specialties: ['Commercials', 'Music Videos', 'Social Media'],
      rating: 4.8,
      reviews: 183,
      projects: 94,
      pricing: '$75-200/hr',
      location: 'Los Angeles, CA',
      avatar: '/avatars/marcus.jpg',
      verified: true,
      online: false,
      portfolio: [
        { type: 'video', url: '/portfolio/marcus-reel.mp4', title: 'Commercial Reel 2024' },
        { type: 'video', url: '/portfolio/music-video.mp4', title: 'Music Video - "Dreams"' }
      ],
      bio: 'Creative video editor bringing stories to life through compelling visual narratives.',
      badges: ['Rising Star', 'Fast Delivery']
    },
    {
      id: 3,
      name: 'Emily Watson',
      category: 'Graphic Designer',
      specialties: ['Branding', 'UI/UX', 'Print Design'],
      rating: 4.9,
      reviews: 312,
      projects: 278,
      pricing: '$40-120/hr',
      location: 'Austin, TX',
      avatar: '/avatars/emily.jpg',
      verified: true,
      online: true,
      portfolio: [
        { type: 'image', url: '/portfolio/brand-identity.jpg', title: 'Tech Startup Branding' },
        { type: 'image', url: '/portfolio/app-ui.jpg', title: 'Mobile App UI Design' }
      ],
      bio: 'Passionate about creating designs that connect brands with their audiences.',
      badges: ['Top Rated', 'Expert Level']
    },
    {
      id: 4,
      name: 'Alex Thompson',
      category: 'Developer',
      specialties: ['React', 'Node.js', 'Full-Stack'],
      rating: 4.7,
      reviews: 156,
      projects: 89,
      pricing: '$60-180/hr',
      location: 'Seattle, WA',
      avatar: '/avatars/alex.jpg',
      verified: true,
      online: true,
      portfolio: [
        { type: 'image', url: '/portfolio/web-app.jpg', title: 'E-commerce Platform' },
        { type: 'image', url: '/portfolio/mobile-app.jpg', title: 'React Native App' }
      ],
      bio: 'Full-stack developer building scalable web applications with modern technologies.',
      badges: ['Technical Expert', 'Reliable']
    },
    {
      id: 5,
      name: 'Maya Patel',
      category: 'Content Creator',
      specialties: ['Social Media', 'Copywriting', 'Strategy'],
      rating: 4.8,
      reviews: 198,
      projects: 145,
      pricing: '$35-100/hr',
      location: 'Miami, FL',
      avatar: '/avatars/maya.jpg',
      verified: true,
      online: false,
      portfolio: [
        { type: 'image', url: '/portfolio/social-campaign.jpg', title: 'Viral Campaign Strategy' },
        { type: 'image', url: '/portfolio/content-calendar.jpg', title: 'Content Calendar' }
      ],
      bio: 'Content strategist helping brands grow their digital presence with engaging content.',
      badges: ['Growth Expert', 'Creative']
    }
  ]

  // Social wall posts
  const socialPosts = [
    {
      id: 1,
      author: {
        name: 'Sarah Chen',
        username: '@sarah_captures',
        avatar: '/avatars/sarah-chen.jpg',
        verified: true
      },
      content: 'Just wrapped up an amazing sunset photoshoot! The golden hour never fails to create magic ✨ #photography #goldenhour #portraitphotography',
      mediaType: 'image',
      mediaUrl: '/posts/sunset-shoot.jpg',
      likes: 1247,
      comments: 89,
      shares: 34,
      timestamp: '2 hours ago',
      liked: false,
      bookmarked: true,
      tags: ['photography', 'goldenhour', 'portraitphotography']
    },
    {
      id: 2,
      author: {
        name: 'Marcus Rodriguez',
        username: '@marcus_edits',
        avatar: '/avatars/marcus.jpg',
        verified: true
      },
      content: 'New music video edit dropping soon! 🎬 Here\'s a behind-the-scenes look at the color grading process. What do you think of this cinematic look?',
      mediaType: 'video',
      mediaUrl: '/posts/bts-color-grade.mp4',
      thumbnail: '/posts/bts-thumb.jpg',
      duration: '1:24',
      likes: 892,
      comments: 156,
      shares: 67,
      timestamp: '4 hours ago',
      liked: true,
      bookmarked: false,
      tags: ['videoediting', 'colorgrading', 'cinematic']
    },
    {
      id: 3,
      author: {
        name: 'Emily Watson',
        username: '@emily_designs',
        avatar: '/avatars/emily.jpg',
        verified: true
      },
      content: 'Brand identity design process for a sustainable fashion startup 🌱 Swipe to see the logo evolution and color palette exploration!',
      mediaType: 'carousel',
      mediaUrls: [
        '/posts/brand-logo-1.jpg',
        '/posts/brand-logo-2.jpg',
        '/posts/brand-colors.jpg',
        '/posts/brand-final.jpg'
      ],
      likes: 2156,
      comments: 234,
      shares: 123,
      timestamp: '6 hours ago',
      liked: false,
      bookmarked: true,
      tags: ['branding', 'logodesign', 'sustainability']
    },
    {
      id: 4,
      author: {
        name: 'Maya Patel',
        username: '@maya_content',
        avatar: '/avatars/maya.jpg',
        verified: true
      },
      content: 'Sharing my thoughts on the latest social media trends 🎙️ This week we\'re diving into micro-content and its impact on engagement rates.',
      mediaType: 'audio',
      mediaUrl: '/posts/social-trends-podcast.mp3',
      duration: '8:45',
      waveform: [0.2, 0.6, 0.8, 0.4, 0.9, 0.3, 0.7, 0.5, 0.8, 0.6, 0.4, 0.7, 0.9, 0.3, 0.5],
      likes: 567,
      comments: 78,
      shares: 89,
      timestamp: '8 hours ago',
      liked: true,
      bookmarked: false,
      tags: ['socialmedia', 'trends', 'marketing']
    },
    {
      id: 5,
      author: {
        name: 'Alex Thompson',
        username: '@alex_codes',
        avatar: '/avatars/alex.jpg',
        verified: true
      },
      content: 'Just shipped a new React component library! 🚀 It includes 50+ customizable components with TypeScript support. Link in bio for early access!',
      mediaType: 'image',
      mediaUrl: '/posts/component-library.jpg',
      likes: 1834,
      comments: 267,
      shares: 445,
      timestamp: '12 hours ago',
      liked: false,
      bookmarked: true,
      tags: ['react', 'typescript', 'opensource']
    }
  ]

  const categories = ['all', 'Photography', 'Video Editor', 'Graphic Designer', 'Developer', 'Content Creator', 'Influencer']

  const filteredCreators = topCreators.filter(creator => 
    (selectedCategory === 'all' || creator.category === selectedCategory) &&
    (searchTerm === '' || creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     creator.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())))
  )

  const formatTime = (duration: string): string => {
    const parts = duration.split(':')
    return parts.length === 2 ? duration : `${Math.floor(parseInt(duration.split(':')[0]) / 60)}:${(parseInt(duration.split(':')[0]) % 60).toString().padStart(2, '0')}`
  }

  const CreatorCard = ({ creator }: { creator: any }) => (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="w-16 h-16 border-2 border-white shadow-lg">
                <AvatarImage src={creator.avatar} alt={creator.name} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold text-lg">
                  {creator.name.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {creator.online && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg text-gray-900">{creator.name}</h3>
                {creator.verified && (
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                )}
              </div>
              <Badge variant="secondary" className="text-xs font-medium">
                {creator.category}
              </Badge>
              <div className="flex items-center gap-1 mt-2">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-semibold">{creator.rating}</span>
                <span className="text-sm text-gray-500">({creator.reviews} reviews)</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Specialties */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Specialties</h4>
          <div className="flex flex-wrap gap-1">
            {creator.specialties.map((specialty: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {specialty}
              </Badge>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-lg font-bold text-gray-900">{creator.projects}</div>
            <div className="text-xs text-gray-600">Projects</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-lg font-bold text-purple-600">{creator.pricing}</div>
            <div className="text-xs text-gray-600">Rate</div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          {creator.location}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1">
          {creator.badges.map((badge: string, index: number) => (
            <Badge key={index} variant="default" className="text-xs bg-gradient-to-r from-purple-500 to-pink-500">
              {badge}
            </Badge>
          ))}
        </div>

        {/* Bio */}
        <p className="text-sm text-gray-600 line-clamp-2">{creator.bio}</p>

        {/* Portfolio Preview */}
        {creator.portfolio && creator.portfolio.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Portfolio Preview</h4>
            <div className="grid grid-cols-3 gap-2">
              {creator.portfolio.slice(0, 3).map((item: any, index: number) => (
                <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {item.type === 'image' ? (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            onClick={() => {
              console.log(`Contacting ${creator.name}`)
              // In production: open contact modal or redirect to messaging
              alert(`Opening contact form for ${creator.name}`)
            }}
          >
            <Mail className="w-4 h-4 mr-2" />
            Contact
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => {
              console.log(`Hiring ${creator.name}`)
              // In production: open hire modal or redirect to project creation
              alert(`Opening hiring process for ${creator.name}`)
            }}
          >
            <Briefcase className="w-4 h-4 mr-2" />
            Hire Now
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const SocialPost = ({ post }) => {
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentSlide, setCurrentSlide] = useState(0)

    return (
      <Card className="mb-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        {/* Post Header */}
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                <AvatarFallback>{post.author.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{post.author.name}</span>
                  {post.author.verified && (
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{post.author.username}</span>
                  <span>•</span>
                  <span>{post.timestamp}</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Post Content */}
        <CardContent className="pt-0">
          <p className="text-sm mb-4 leading-relaxed">{post.content}</p>

          {/* Media Content */}
          <div className="mb-4 rounded-xl overflow-hidden bg-gray-100">
            {post.mediaType === 'image' && (
              <div className="aspect-square bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
                <div className="text-white text-center">
                  <Camera className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm opacity-80">Photo Content</p>
                </div>
              </div>
            )}

            {post.mediaType === 'video' && (
              <div className="aspect-video bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 relative flex items-center justify-center border-2 border-purple-200">
                <div className="text-center text-purple-700">
                  <div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center mb-4 mx-auto cursor-pointer hover:bg-purple-300 transition-colors">
                    {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                  </div>
                  <p className="text-sm text-purple-600">Video Content • {post.duration}</p>
                </div>
                <div className="absolute top-3 right-3 bg-purple-600 px-2 py-1 rounded text-white text-xs">
                  {post.duration}
                </div>
              </div>
            )}

            {post.mediaType === 'carousel' && (
              <div className="aspect-square relative">
                <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center">
                  <div className="text-white text-center">
                    <Image className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm opacity-80">Carousel {currentSlide + 1}/{post.mediaUrls?.length || 4}</p>
                  </div>
                </div>
                <div className="absolute top-3 right-3 bg-purple-600/90 backdrop-blur-sm px-2 py-1 rounded text-white text-xs">
                  {currentSlide + 1}/{post.mediaUrls?.length || 4}
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex gap-1 justify-center">
                  {Array.from({ length: post.mediaUrls?.length || 4 }).map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${index === currentSlide ? 'bg-white' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {post.mediaType === 'audio' && (
              <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-purple-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-300 transition-colors">
                    {audioPlaying === post.id ? <Pause className="w-6 h-6 text-purple-700" /> : <Play className="w-6 h-6 text-purple-700 ml-1" />}
                  </div>
                  <div className="flex-1 text-purple-700">
                    <p className="font-semibold">Audio Post</p>
                    <p className="text-sm text-purple-600">Duration: {post.duration}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-purple-700 hover:bg-purple-100">
                    {audioPlaying === post.id ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                </div>
                
                {/* Waveform */}
                <div className="flex items-end gap-1 h-16 justify-center">
                  {post.waveform?.map((height, index) => (
                    <div
                      key={index}
                      className={`w-2 bg-purple-300 rounded-t transition-all duration-300 ${
                        audioPlaying === post.id && index < 5 ? 'bg-purple-600' : ''
                      }`}
                      style={{ height: `${height * 100}%` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {post.tags.map((tag, index) => (
                <span key={index} className="text-blue-600 text-sm hover:underline cursor-pointer">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button 
                data-testid="like-btn"
                className={`flex items-center gap-2 text-sm transition-colors ${post.liked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}`}
                onClick={() => {
                  console.log(`Liking post ${post.id}`);
                  alert('Post liked!');
                }}
              >
                <Heart className={`w-5 h-5 ${post.liked ? 'fill-current' : ''}`} />
                <span>Like Post</span>
                <span className="text-xs text-gray-500">({post.likes.toLocaleString()})</span>
              </button>
              
              <button 
                data-testid="comment-btn"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-500 transition-colors"
                onClick={() => {
                  console.log(`Opening comments for post ${post.id}`);
                  alert('Comments section opened!');
                }}
              >
                <MessageCircle className="w-5 h-5" />
                <span>{post.comments}</span>
              </button>
              
              <button 
                data-testid="share-btn"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-500 transition-colors"
                onClick={() => sharePost(
                  `${post.author.name}'s Post`,
                  post.content,
                  post.id.toString(),
                  post.mediaUrl
                )}
              >
                <Share className="w-5 h-5" />
                <span>Share Post</span>
                <span className="text-xs text-gray-500">({post.shares})</span>
              </button>
            </div>
            
            <button className={`text-gray-600 hover:text-yellow-500 transition-colors ${post.bookmarked ? 'text-yellow-500' : ''}`}>
              <Bookmark className={`w-5 h-5 ${post.bookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

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
            <TabsTrigger value="feed" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <Instagram className="w-4 h-4" />
              Feed
            </TabsTrigger>
            <TabsTrigger value="creators" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <Users className="w-4 h-4" />
              Creators
            </TabsTrigger>
            <TabsTrigger value="showcase" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <Star className="w-4 h-4" />
              Showcase
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <Calendar className="w-4 h-4" />
              Events
            </TabsTrigger>
          </TabsList>

          {/* Feed Tab (Social Wall) */}
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
                        placeholder="Share your creative journey..."
                        className="flex-1 bg-white/80"
                        onClick={() => setShowCreatePost(true)}
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <Button 
                        data-testid="create-post-btn"
                        variant="default"
                        size="sm" 
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                        onClick={() => {
                          console.log('Creating post');
                          setShowCreatePost(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Post
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-purple-600 hover:text-purple-700"
                        onClick={() => {
                          console.log('Opening photo upload');
                          alert('Photo upload coming soon!');
                        }}
                      >
                        <Image className="w-4 h-4 mr-2" />
                        Photo
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => {
                          console.log('Opening video upload');
                          alert('Video upload coming soon!');
                        }}
                      >
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
                    {['#photography', '#design', '#videoediting', '#branding', '#webdev', '#content', '#marketing', '#ui', '#creative', '#portfolio'].map((tag, index) => (
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
                      <Sparkles className="w-5 h-5 text-yellow-500" />
                      Featured Creators
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {topCreators.slice(0, 3).map(creator => (
                      <div key={creator.id} className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={creator.avatar} alt={creator.name} />
                          <AvatarFallback>{creator.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-sm truncate">{creator.name}</span>
                            {creator.verified && (
                              <CheckCircle className="w-3 h-3 text-blue-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600">{creator.category}</p>
                        </div>
                        <Button 
                          data-testid="follow-creator-btn"
                          size="sm" 
                          variant="outline" 
                          className="text-xs hover:bg-purple-50 hover:border-purple-200"
                          onClick={() => {
                            console.log(`Following ${creator.name}`);
                            alert(`Now following ${creator.name}!`);
                          }}
                        >
                          Follow Creator
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Creators Tab */}
          <TabsContent value="creators">
            <div className="space-y-6">
              {/* Search and Filters */}
              <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search creators by name or specialty..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/80"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-4 py-2 border border-gray-200 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </option>
                      ))}
                    </select>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8" />
                    <div>
                      <div className="text-2xl font-bold">2,847</div>
                      <div className="text-sm opacity-90">Active Creators</div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-8 h-8" />
                    <div>
                      <div className="text-2xl font-bold">12,456</div>
                      <div className="text-sm opacity-90">Projects Completed</div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                  <div className="flex items-center gap-3">
                    <Star className="w-8 h-8" />
                    <div>
                      <div className="text-2xl font-bold">4.8</div>
                      <div className="text-sm opacity-90">Average Rating</div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8" />
                    <div>
                      <div className="text-2xl font-bold">98%</div>
                      <div className="text-sm opacity-90">Success Rate</div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Creators Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCreators.map(creator => (
                  <CreatorCard key={creator.id} creator={creator} />
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Showcase Tab */}
          <TabsContent value="showcase">
            <div className="space-y-6">
              <Card className="p-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <Star className="w-8 h-8" />
                    Featured Work Showcase
                  </CardTitle>
                  <CardDescription className="text-purple-100">
                    Discover amazing work from our top creators
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Featured Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topCreators.slice(0, 6).map(creator => (
                  <Card key={creator.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden bg-white/80 backdrop-blur-sm border-0">
                    <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                        <div className="text-center text-purple-700">
                          <Sparkles className="w-12 h-12 mx-auto mb-2" />
                          <p className="font-semibold">{creator.category}</p>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={creator.avatar} alt={creator.name} />
                          <AvatarFallback>{creator.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-sm">{creator.name}</h3>
                          <p className="text-xs text-gray-600">{creator.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-medium">{creator.rating}</span>
                          <span className="text-xs text-gray-500">({creator.reviews})</span>
                        </div>
                        <Button size="sm" variant="outline" className="text-xs">
                          View Work
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <div className="space-y-6">
              <Card className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <Calendar className="w-8 h-8" />
                    Community Events
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Join workshops, networking events, and creative challenges
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Events Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    id: 1,
                    title: 'Design Masterclass',
                    date: '2024-03-15',
                    time: '2:00 PM EST',
                    type: 'Workshop',
                    attendees: 156,
                    price: 'Free',
                    instructor: 'Sarah Chen'
                  },
                  {
                    id: 2,
                    title: 'Freelancer Networking',
                    date: '2024-03-18',
                    time: '7:00 PM EST',
                    type: 'Networking',
                    attendees: 89,
                    price: 'Free',
                    instructor: 'Community'
                  },
                  {
                    id: 3,
                    title: '30-Day Photo Challenge',
                    date: '2024-03-20',
                    time: 'All Day',
                    type: 'Challenge',
                    attendees: 342,
                    price: 'Free',
                    instructor: 'Marcus Rodriguez'
                  },
                  {
                    id: 4,
                    title: 'Video Editing Bootcamp',
                    date: '2024-03-22',
                    time: '1:00 PM EST',
                    type: 'Workshop',
                    attendees: 78,
                    price: '$29',
                    instructor: 'Video Pro'
                  },
                  {
                    id: 5,
                    title: 'Portfolio Review Session',
                    date: '2024-03-25',
                    time: '3:00 PM EST',
                    type: 'Review',
                    attendees: 45,
                    price: 'Free',
                    instructor: 'Emily Watson'
                  },
                  {
                    id: 6,
                    title: 'Creative Collaboration Mixer',
                    date: '2024-03-28',
                    time: '6:00 PM EST',
                    type: 'Social',
                    attendees: 123,
                    price: 'Free',
                    instructor: 'Community'
                  }
                ].map(event => (
                  <Card key={event.id} className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-0">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            event.type === 'Workshop' ? 'border-purple-200 text-purple-700 bg-purple-50' :
                            event.type === 'Networking' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                            event.type === 'Challenge' ? 'border-green-200 text-green-700 bg-green-50' :
                            event.type === 'Review' ? 'border-orange-200 text-orange-700 bg-orange-50' :
                            'border-pink-200 text-pink-700 bg-pink-50'
                          }`}
                        >
                          {event.type}
                        </Badge>
                        <span className="text-sm font-semibold text-green-600">{event.price}</span>
                      </div>
                      
                      <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                      
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {event.date}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {event.time}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {event.attendees} attending
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {event.instructor}
                        </div>
                      </div>
                      
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                        Join Event
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Sharing Modal */}
      {shareContent && (
        <EnhancedSharingModal
          isOpen={isOpen}
          onClose={closeSharingModal}
          title={shareContent.title}
          description={shareContent.description}
          url={shareContent.url}
          imageUrl={shareContent.imageUrl}
          type={shareContent.type}
        />
      )}
    </div>
  )
}

export default EnhancedCommunityHub