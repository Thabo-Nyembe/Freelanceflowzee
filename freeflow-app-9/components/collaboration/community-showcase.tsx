'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import UniversalMediaPreviews from './universal-media-previews'
import { 
  Star, 
  Users, 
  MessageCircle, 
  Heart, 
  Share2, 
  Camera, 
  Video, 
  Mic, 
  FileText, 
  Code, 
  Image,
  Zap,
  Award,
  TrendingUp,
  PlayCircle
} from 'lucide-react'

const features = [
  {
    icon: Image,
    title: 'Image Feedback',
    description: 'Click anywhere to add pin-based comments with zoom and rotate controls',
    color: 'from-rose-500 to-pink-500'
  },
  {
    icon: Video,
    title: 'Video Feedback', 
    description: 'Timeline-based commenting at specific timestamps with jump functionality',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Mic,
    title: 'Audio Feedback',
    description: 'Waveform visualization with timestamp comments and audio controls',
    color: 'from-purple-500 to-violet-500'
  },
  {
    icon: FileText,
    title: 'Document Feedback',
    description: 'Text selection-based commenting with highlighted text and inline display',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Code,
    title: 'Code Feedback',
    description: 'Line-by-line commenting system with syntax highlighting and indicators',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: Camera,
    title: 'Screenshot Feedback',
    description: 'Drawing tools and pin-based annotations with multiple layers',
    color: 'from-indigo-500 to-purple-500'
  }
]

const communityStats = [
  { label: 'Active Creators', value: '2,847', icon: Users, color: 'text-rose-500' },
  { label: 'Projects Completed', value: '12,456', icon: Award, color: 'text-violet-500' },
  { label: 'Total Posts', value: '8,932', icon: MessageCircle, color: 'text-blue-500' },
  { label: 'Community Likes', value: '156K', icon: Heart, color: 'text-red-500' }
]

const samplePosts = [
  {
    id: 1,
    author: 'Sarah Chen',
    role: 'UI/UX Designer',
    content: 'Just finished this fintech dashboard design! The gradient system and micro-interactions really bring it to life 🚀',
    likes: 1247,
    comments: 89,
    type: 'image',
    verified: true
  },
  {
    id: 2,
    author: 'Marcus Rodriguez', 
    role: 'Photographer',
    content: 'Golden hour magic ✨ Here\'s a behind-the-scenes audio note from yesterday\'s brand shoot',
    likes: 892,
    comments: 56,
    type: 'audio',
    verified: true
  },
  {
    id: 3,
    author: 'Alex Thompson',
    role: 'Developer',
    content: 'New React component library is live! Clean, accessible, and fully typed. Check out the code samples 💻',
    likes: 634,
    comments: 78,
    type: 'code',
    verified: true
  }
]

export default function CommunityShowcase() {
  const [activeDemo, setActiveDemo] = useState('feedback')
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-violet-50/40 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-extralight text-slate-800 mb-4">
            FreeflowZee
            <span className="bg-gradient-to-r from-rose-500 to-violet-600 bg-clip-text text-transparent font-light">
              {' '}Community & Feedback
            </span>
          </h1>
          <p className="text-xl text-slate-600 font-light max-w-3xl mx-auto">
            The most advanced collaboration platform combining universal media feedback 
            with a thriving creator marketplace and Instagram-like social wall
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Badge variant="outline" className="bg-gradient-to-r from-rose-50 to-violet-50 border-rose-200 text-rose-700 px-4 py-2">
              ✨ Universal Pinpoint Feedback
            </Badge>
            <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 text-blue-700 px-4 py-2">
              🏪 Creator Marketplace
            </Badge>
            <Badge variant="outline" className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-700 px-4 py-2">
              📱 Social Wall
            </Badge>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {communityStats.map((stat, index) => (
            <Card key={index} className="bg-white/60 backdrop-blur-xl border-white/20 shadow-luxury">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">{stat.label}</p>
                    <p className="text-3xl font-extralight text-slate-800">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Demo Tabs */}
        <Tabs value={activeDemo} onValueChange={setActiveDemo} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-xl border-white/20 shadow-luxury">
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Universal Feedback Demo
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Creator Marketplace
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Social Wall
            </TabsTrigger>
          </TabsList>

          {/* Universal Feedback Demo */}
          <TabsContent value="feedback" className="space-y-6">
            <Card className="bg-white/60 backdrop-blur-xl border-white/20 shadow-luxury">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-violet-500" />
                  Universal Pinpoint Feedback System
                </CardTitle>
                <p className="text-slate-600 font-light">
                  Context-aware commenting across all media types with AI-powered insights
                </p>
              </CardHeader>
              <CardContent>
                <UniversalMediaPreviews />
              </CardContent>
            </Card>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="bg-white/60 backdrop-blur-xl border-white/20 shadow-luxury hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-2">{feature.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Creator Marketplace */}
          <TabsContent value="marketplace" className="space-y-6">
            <Card className="bg-white/60 backdrop-blur-xl border-white/20 shadow-luxury">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-rose-500" />
                  Top 20 Creator Marketplace
                </CardTitle>
                <p className="text-slate-600 font-light">
                  Discover amazing creators across all categories - from influencers to photographers to developers
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { name: 'Sarah Chen', role: 'UI/UX Designer', rating: 4.9, projects: 89, price: 150, online: true },
                    { name: 'Marcus Rodriguez', role: 'Photographer', rating: 4.8, projects: 145, price: 300, online: false },
                    { name: 'Alex Thompson', role: 'Full-Stack Developer', rating: 5.0, projects: 67, price: 200, online: true },
                    { name: 'Elena Vasquez', role: 'Content Creator', rating: 4.7, projects: 234, price: 125, online: true }
                  ].map((creator, index) => (
                    <Card key={index} className="bg-white/80 backdrop-blur-sm border-white/20 hover:shadow-md transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-r from-rose-100 to-violet-100 rounded-full flex items-center justify-center text-lg font-medium">
                              {creator.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            {creator.online && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-800">{creator.name}</h4>
                            <p className="text-sm text-slate-600">{creator.role}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-500 fill-current" />
                            <span className="font-medium">{creator.rating}</span>
                          </div>
                          <span className="text-slate-500">{creator.projects} projects</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800">${creator.price}/hr</span>
                          <Button size="sm" className="bg-gradient-to-r from-rose-500 to-violet-600 text-white text-xs">
                            Hire Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Wall */}
          <TabsContent value="social" className="space-y-6">
            <Card className="bg-white/60 backdrop-blur-xl border-white/20 shadow-luxury">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                  Instagram-like Social Wall
                </CardTitle>
                <p className="text-slate-600 font-light">
                  Multi-media posts with audio support, likes, comments, and hashtag trending
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {samplePosts.map((post) => (
                    <Card key={post.id} className="bg-white/80 backdrop-blur-sm border-white/20">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center font-medium">
                            {post.author.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-slate-800">{post.author}</h4>
                              {post.verified && (
                                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-slate-600">{post.role}</p>
                          </div>
                          <Badge variant="outline" className={`text-xs ${
                            post.type === 'image' ? 'text-rose-600 border-rose-300' :
                            post.type === 'audio' ? 'text-purple-600 border-purple-300' :
                            'text-blue-600 border-blue-300'
                          }`}>
                            {post.type}
                          </Badge>
                        </div>
                        
                        <p className="text-slate-700 mb-4">{post.content}</p>
                        
                        {/* Media Preview */}
                        <div className="mb-4">
                          {post.type === 'image' && (
                            <div className="aspect-video bg-gradient-to-br from-rose-100 via-violet-100 to-blue-100 rounded-lg flex items-center justify-center">
                              <Image className="w-12 h-12 text-slate-400" />
                            </div>
                          )}
                          {post.type === 'audio' && (
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg flex items-center gap-4">
                              <Button size="sm" className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                <PlayCircle className="w-4 h-4" />
                              </Button>
                              <div className="flex-1 h-8 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full"></div>
                              <span className="text-sm text-slate-600">2:34</span>
                            </div>
                          )}
                          {post.type === 'code' && (
                            <div className="bg-slate-900 rounded-lg p-4">
                              <div className="text-green-400 text-sm font-mono">
                                {'// React Component Library'}<br/>
                                {'export const Button = ({ children, ...props }) => ('}<br/>
                                {'  <button className="btn" {...props}>{children}</button>'}<br/>
                                {')'}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-slate-600">
                          <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                            <Heart className="w-4 h-4" />
                            <span>{post.likes.toLocaleString()}</span>
                          </button>
                          <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                            <MessageCircle className="w-4 h-4" />
                            <span>{post.comments}</span>
                          </button>
                          <button className="flex items-center gap-2 hover:text-green-500 transition-colors">
                            <Share2 className="w-4 h-4" />
                            Share
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-rose-500 via-violet-600 to-blue-600 text-white shadow-luxury">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-extralight mb-4">Ready to Transform Your Collaboration?</h2>
            <p className="text-white/90 font-light mb-6 max-w-2xl mx-auto">
              Join thousands of creators using FreeflowZee's revolutionary feedback system 
              and thriving community marketplace
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" className="bg-white text-slate-800 hover:bg-white/90">
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Watch Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 