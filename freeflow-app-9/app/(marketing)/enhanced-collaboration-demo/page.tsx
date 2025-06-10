'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EnhancedCollaborationSystem } from '@/components/collaboration/enhanced-collaboration-system'
import { AdvancedGallerySharingSystem } from '@/components/gallery/advanced-sharing-system'
import { 
  Video, 
  Image, 
  MessageCircle, 
  Heart, 
  CheckCircle, 
  Download,
  Users,
  Clock,
  Star,
  TrendingUp,
  Shield,
  Lock,
  Globe,
  Rocket,
  Images,
  Calendar as CalendarIcon
} from 'lucide-react'
import Link from 'next/link'

export default function EnhancedCollaborationDemo() {
  const [activeDemo, setActiveDemo] = useState<'video' | 'image' | 'gallery'>('video')

  // Mock data for demonstration
  const mockCollaborators = [
    {
      id: 'user1',
      name: 'Sarah Johnson',
      avatar: '/avatars/sarah.jpg',
      role: 'client' as const,
      isOnline: true
    },
    {
      id: 'user2', 
      name: 'Mike Chen',
      avatar: '/avatars/mike.jpg',
      role: 'freelancer' as const,
      isOnline: true
    },
    {
      id: 'user3',
      name: 'Emma Davis',
      avatar: '/avatars/emma.jpg', 
      role: 'reviewer' as const,
      isOnline: false
    }
  ]

  const mockCurrentUser = {
    id: 'current_user',
    name: 'Alex Thompson',
    avatar: '/avatars/alex.jpg',
    role: 'client' as const
  }

  const mockGalleryItems = [
    {
      id: 'item1',
      name: 'Brand Identity Concept A',
      type: 'image' as const,
      url: '/images/brand-concept-a.jpg',
      thumbnailUrl: '/images/brand-concept-a-thumb.jpg',
      size: 2457600,
      dimensions: { width: 1920, height: 1080 },
      metadata: {
        camera: 'Canon EOS R5',
        lens: '24-70mm f/2.8',
        settings: 'f/5.6, 1/125s, ISO 400',
        location: 'Studio',
        tags: ['branding', 'logo', 'concept', 'modern']
      },
      pricing: {
        digital: 299,
        print: 499,
        commercial: 999
      },
      stats: {
        views: 156,
        likes: 23,
        downloads: 8,
        shares: 12
      },
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 'item2',
      name: 'Brand Video Presentation',
      type: 'video' as const,
      url: '/videos/brand-presentation.mp4',
      thumbnailUrl: '/images/brand-video-thumb.jpg',
      size: 15728640,
      dimensions: { width: 1920, height: 1080 },
      metadata: {
        tags: ['presentation', 'brand', 'video', 'marketing']
      },
      pricing: {
        digital: 599,
        print: 799,
        commercial: 1499
      },
      stats: {
        views: 89,
        likes: 31,
        downloads: 5,
        shares: 18
      },
      createdAt: '2024-01-20T14:15:00Z'
    }
  ]

  const mockGallerySettings = {
    isPublic: true,
    allowDownloads: true,
    showPricing: true,
    watermarkEnabled: true,
    passwordProtected: false,
    brandingEnabled: true,
    analyticsEnabled: true,
    socialSharingEnabled: true
  }

  const mockAnalytics = {
    totalVisitors: 1247,
    uniqueVisitors: 892,
    pageViews: 3456,
    avgSessionDuration: 185,
    topReferrers: [
      { source: 'Direct', visits: 423 },
      { source: 'Google', visits: 298 },
      { source: 'Social Media', visits: 171 }
    ],
    geoData: [
      { country: 'United States', visits: 456 },
      { country: 'United Kingdom', visits: 234 },
      { country: 'Canada', visits: 202 }
    ],
    deviceTypes: [
      { type: 'Desktop', percentage: 65 },
      { type: 'Mobile', percentage: 28 },
      { type: 'Tablet', percentage: 7 }
    ],
    popularItems: [
      { id: 'item1', name: 'Brand Identity Concept A', views: 156 },
      { id: 'item2', name: 'Brand Video Presentation', views: 89 }
    ]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">
              Enhanced Collaboration System
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional client collaboration with video annotations, image comments, 
              real-time feedback, approval workflows, and secure escrow integration
            </p>
            
            <div className="flex items-center justify-center space-x-6 mt-6">
              <div className="flex items-center space-x-2">
                <Video className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">Video Annotations</span>
              </div>
              <div className="flex items-center space-x-2">
                <Image className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Image Comments</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium">Client Preferences</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium">Approval Workflows</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium">Escrow Protection</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader className="text-center">
              <Video className="h-8 w-8 text-blue-600 mx-auto" />
              <CardTitle className="text-lg">Video Annotations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Time-code specific comments</li>
                <li>• Priority levels and types</li>
                <li>• @mention notifications</li>
                <li>• Reaction system</li>
                <li>• Approval requirements</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Image className="h-8 w-8 text-green-600 mx-auto" />
              <CardTitle className="text-lg">Image Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Position-specific feedback</li>
                <li>• Visual annotation markers</li>
                <li>• Contextual discussions</li>
                <li>• Issue tracking</li>
                <li>• Resolution workflows</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Heart className="h-8 w-8 text-red-600 mx-auto" />
              <CardTitle className="text-lg">Client Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Like/favorite system</li>
                <li>• Selection for finals</li>
                <li>• Preference tracking</li>
                <li>• Client feedback analytics</li>
                <li>• Decision documentation</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Shield className="h-8 w-8 text-yellow-600 mx-auto" />
              <CardTitle className="text-lg">Escrow Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Milestone-based releases</li>
                <li>• Password-protected downloads</li>
                <li>• Secure file delivery</li>
                <li>• Payment verification</li>
                <li>• Automated unlocking</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Demo Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center">Interactive Demo</CardTitle>
            <p className="text-center text-gray-600">
              Explore each collaboration feature with live examples
            </p>
          </CardHeader>
          <CardContent>
            <Tabs value={activeDemo} onValueChange={(value: any) => setActiveDemo(value)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="video" className="space-x-2">
                  <Video className="h-4 w-4" />
                  <span>Video Collaboration</span>
                </TabsTrigger>
                <TabsTrigger value="image" className="space-x-2">
                  <Image className="h-4 w-4" />
                  <span>Image Feedback</span>
                </TabsTrigger>
                <TabsTrigger value="gallery" className="space-x-2">
                  <Globe className="h-4 w-4" />
                  <span>Gallery Sharing</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="video" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Video className="h-5 w-5" />
                      <span>Video Collaboration Demo</span>
                      <Badge>Escrow: Fully Released</Badge>
                    </CardTitle>
                    <p className="text-gray-600">
                      Click on the video timeline to add time-specific comments. 
                      Use different comment types and priorities to organize feedback.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <EnhancedCollaborationSystem
                      projectId="demo_project_1"
                      fileId="demo_video_1"
                      fileType="video"
                      fileUrl="/videos/sample-brand-video.mp4"
                      thumbnailUrl="/images/video-thumbnail.jpg"
                      escrowStatus="fully_released"
                      downloadPassword="DEMO2024"
                      currentUser={mockCurrentUser}
                      collaborators={mockCollaborators}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="image" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Image className="h-5 w-5" />
                      <span>Image Feedback Demo</span>
                      <Badge variant="secondary">Escrow: Milestone Released</Badge>
                    </CardTitle>
                    <p className="text-gray-600">
                      Click anywhere on the image to add position-specific comments. 
                      Perfect for design reviews and detailed feedback.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <EnhancedCollaborationSystem
                      projectId="demo_project_2"
                      fileId="demo_image_1"
                      fileType="image"
                      fileUrl="/images/sample-brand-design.jpg"
                      escrowStatus="milestone_released"
                      currentUser={mockCurrentUser}
                      collaborators={mockCollaborators}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="gallery" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Globe className="h-5 w-5" />
                      <span>Advanced Gallery Sharing</span>
                      <Badge>Public Gallery</Badge>
                    </CardTitle>
                    <p className="text-gray-600">
                      Professional client galleries with social sharing, analytics, 
                      and pricing integration. Perfect for client deliveries.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <AdvancedGallerySharingSystem
                      galleryId="demo_gallery_1"
                      items={mockGalleryItems}
                      settings={mockGallerySettings}
                      analytics={mockAnalytics}
                      currentUser={mockCurrentUser}
                      isOwnerView={true}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Key Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Real-Time Collaboration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Live user presence indicators</span>
              </div>
              <div className="flex items-center space-x-3">
                <MessageCircle className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Instant comment notifications</span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-4 w-4 text-purple-500" />
                <span className="text-sm">Multi-user collaboration</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Automated approval workflows</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Advanced Analytics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">1,247</div>
                  <div className="text-sm text-gray-600">Total Visitors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">892</div>
                  <div className="text-sm text-gray-600">Unique Visitors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">3,456</div>
                  <div className="text-sm text-gray-600">Page Views</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">3:05</div>
                  <div className="text-sm text-gray-600">Avg. Session</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Implementation Benefits */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-center">Implementation Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <Star className="h-8 w-8 text-yellow-500 mx-auto" />
                <h3 className="font-semibold">Enhanced Client Experience</h3>
                <p className="text-sm text-gray-600">
                  Professional presentation with intuitive feedback tools 
                  creates better client relationships and satisfaction
                </p>
              </div>
              
              <div className="text-center space-y-2">
                <Clock className="h-8 w-8 text-blue-500 mx-auto" />
                <h3 className="font-semibold">Faster Project Delivery</h3>
                <p className="text-sm text-gray-600">
                  Real-time collaboration and automated workflows 
                  reduce revision cycles and project turnaround time
                </p>
              </div>
              
              <div className="text-center space-y-2">
                <Shield className="h-8 w-8 text-green-500 mx-auto" />
                <h3 className="font-semibold">Secure & Professional</h3>
                <p className="text-sm text-gray-600">
                  Enterprise-grade security with escrow protection 
                  ensures safe delivery of valuable creative work
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <h2 className="text-2xl font-bold mb-4">Ready to Transform Your Client Collaboration?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of freelancers who have streamlined their workflow 
            with our comprehensive collaboration platform
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link href="/dashboard/collaboration">
              <Button size="lg" className="space-x-2">
                <Users className="h-5 w-5" />
                <span>Access Full Collaboration Suite</span>
              </Button>
            </Link>
            <Link href="/projects/new">
              <Button size="lg" variant="outline" className="space-x-2">
                <Rocket className="h-5 w-5" />
                <span>Start New Project</span>
              </Button>
            </Link>
          </div>
          
          {/* Additional Feature Links */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/dashboard/escrow">
              <Button variant="secondary" className="w-full space-x-2">
                <Shield className="h-4 w-4" />
                <span>Escrow System</span>
              </Button>
            </Link>
            <Link href="/dashboard/gallery">
              <Button variant="secondary" className="w-full space-x-2">
                <Images className="h-4 w-4" />
                <span>Portfolio Gallery</span>
              </Button>
            </Link>
            <Link href="/dashboard/calendar">
              <Button variant="secondary" className="w-full space-x-2">
                <CalendarIcon className="h-4 w-4" />
                <span>Calendar & Scheduling</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 