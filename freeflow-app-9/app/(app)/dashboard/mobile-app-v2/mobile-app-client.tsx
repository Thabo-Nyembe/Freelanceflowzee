'use client'

import { useState, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Smartphone, Download, Star, TrendingUp, Users, Activity,
  Package, Upload, Play, AlertCircle, CheckCircle, Clock,
  Settings, Globe, Bell, Shield, Zap, BarChart3, Target,
  Bug, Cpu, HardDrive, Battery, Wifi, Apple, Monitor,
  RefreshCw, Send, Eye, MessageSquare, ChevronRight, Layers
} from 'lucide-react'

// Types
type Platform = 'ios' | 'android' | 'all'
type BuildStatus = 'processing' | 'ready' | 'submitted' | 'in-review' | 'approved' | 'rejected' | 'released'
type ReleaseType = 'production' | 'beta' | 'internal' | 'staged'

interface Build {
  id: string
  version: string
  buildNumber: string
  platform: Platform
  status: BuildStatus
  releaseType: ReleaseType
  uploadedAt: string
  size: string
  minOsVersion: string
  expiresAt?: string
  testFlightEnabled: boolean
  testers: number
  crashes: number
  sessions: number
  feedback: number
}

interface AppVersion {
  id: string
  version: string
  platform: Platform
  status: 'draft' | 'ready' | 'in-review' | 'pending-release' | 'released' | 'rejected'
  releaseDate?: string
  phaseRelease: boolean
  phasePercentage: number
  whatsnew: string
  builds: Build[]
  screenshots: { device: string; urls: string[] }[]
  reviewNotes?: string
}

interface AppReview {
  id: string
  rating: number
  title: string
  body: string
  author: string
  date: string
  version: string
  platform: Platform
  response?: string
  responseDate?: string
  helpful: number
  territory: string
}

interface Analytics {
  downloads: { date: string; count: number }[]
  activeUsers: { date: string; count: number }[]
  sessions: { date: string; count: number }[]
  crashes: { date: string; count: number }[]
  revenue: { date: string; amount: number }[]
}

interface PushCampaign {
  id: string
  title: string
  message: string
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled'
  scheduledAt?: string
  sentAt?: string
  platform: Platform
  targetAudience: string
  sent: number
  opened: number
  clicked: number
}

interface InAppPurchase {
  id: string
  productId: string
  name: string
  type: 'consumable' | 'non-consumable' | 'subscription'
  price: string
  status: 'active' | 'inactive' | 'pending'
  purchases: number
  revenue: number
}

interface MobileAppClientProps {
  initialFeatures: any[]
  initialVersions: any[]
  initialStats: any
}

// Mock Data
const mockBuilds: Build[] = [
  { id: 'b1', version: '2.5.0', buildNumber: '250', platform: 'ios', status: 'released', releaseType: 'production', uploadedAt: '2024-01-15', size: '45.2 MB', minOsVersion: 'iOS 15.0', testFlightEnabled: true, testers: 156, crashes: 12, sessions: 45000, feedback: 23 },
  { id: 'b2', version: '2.5.1', buildNumber: '251', platform: 'ios', status: 'in-review', releaseType: 'production', uploadedAt: '2024-01-18', size: '45.8 MB', minOsVersion: 'iOS 15.0', testFlightEnabled: true, testers: 89, crashes: 2, sessions: 8500, feedback: 8 },
  { id: 'b3', version: '2.5.0', buildNumber: '2500', platform: 'android', status: 'released', releaseType: 'production', uploadedAt: '2024-01-15', size: '38.4 MB', minOsVersion: 'Android 10', testFlightEnabled: false, testers: 0, crashes: 18, sessions: 62000, feedback: 0 },
  { id: 'b4', version: '2.6.0', buildNumber: '260', platform: 'ios', status: 'processing', releaseType: 'beta', uploadedAt: '2024-01-18', size: '46.1 MB', minOsVersion: 'iOS 15.0', expiresAt: '2024-04-18', testFlightEnabled: true, testers: 45, crashes: 0, sessions: 1200, feedback: 5 },
]

const mockReviews: AppReview[] = [
  { id: 'r1', rating: 5, title: 'Best productivity app!', body: 'This app has completely changed how I manage my work. The interface is beautiful and intuitive.', author: 'ProductivityPro', date: '2024-01-17', version: '2.5.0', platform: 'ios', helpful: 42, territory: 'US' },
  { id: 'r2', rating: 4, title: 'Great but needs dark mode', body: 'Love the app overall but my eyes hurt at night. Please add dark mode!', author: 'NightOwl', date: '2024-01-16', version: '2.5.0', platform: 'ios', response: 'Thanks for the feedback! Dark mode is coming in v2.6.0, available in beta now.', responseDate: '2024-01-17', helpful: 28, territory: 'UK' },
  { id: 'r3', rating: 2, title: 'Crashes on startup', body: 'App keeps crashing on my Pixel 6. Please fix!', author: 'PixelUser', date: '2024-01-15', version: '2.5.0', platform: 'android', helpful: 15, territory: 'DE' },
  { id: 'r4', rating: 5, title: 'Worth every penny', body: 'The pro subscription is absolutely worth it. Customer support is excellent too.', author: 'HappyCustomer', date: '2024-01-14', version: '2.4.2', platform: 'android', helpful: 67, territory: 'US' },
]

const mockCampaigns: PushCampaign[] = [
  { id: 'p1', title: 'New Feature Launch', message: 'Check out our new AI assistant feature!', status: 'sent', sentAt: '2024-01-15', platform: 'all', targetAudience: 'All Users', sent: 125000, opened: 45000, clicked: 12500 },
  { id: 'p2', title: 'Weekend Sale', message: '50% off Pro subscription this weekend only!', status: 'scheduled', scheduledAt: '2024-01-20', platform: 'all', targetAudience: 'Free Users', sent: 0, opened: 0, clicked: 0 },
  { id: 'p3', title: 'Update Available', message: 'Version 2.5.1 is now available with bug fixes.', status: 'draft', platform: 'ios', targetAudience: 'iOS Users', sent: 0, opened: 0, clicked: 0 },
]

const mockIAPs: InAppPurchase[] = [
  { id: 'iap1', productId: 'com.app.pro_monthly', name: 'Pro Monthly', type: 'subscription', price: '$9.99/mo', status: 'active', purchases: 4500, revenue: 44955 },
  { id: 'iap2', productId: 'com.app.pro_yearly', name: 'Pro Yearly', type: 'subscription', price: '$79.99/yr', status: 'active', purchases: 2100, revenue: 167979 },
  { id: 'iap3', productId: 'com.app.credits_100', name: '100 Credits', type: 'consumable', price: '$4.99', status: 'active', purchases: 8900, revenue: 44411 },
  { id: 'iap4', productId: 'com.app.lifetime', name: 'Lifetime Access', type: 'non-consumable', price: '$199.99', status: 'active', purchases: 156, revenue: 31198 },
]

export default function MobileAppClient({ initialFeatures, initialVersions, initialStats }: MobileAppClientProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('all')
  const [selectedBuild, setSelectedBuild] = useState<Build | null>(null)
  const [showBuildDialog, setShowBuildDialog] = useState(false)
  const [selectedReview, setSelectedReview] = useState<AppReview | null>(null)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [responseText, setResponseText] = useState('')

  const builds = mockBuilds
  const reviews = mockReviews
  const campaigns = mockCampaigns
  const iaps = mockIAPs

  const filteredBuilds = useMemo(() => {
    return builds.filter(b => selectedPlatform === 'all' || b.platform === selectedPlatform)
  }, [builds, selectedPlatform])

  const stats = {
    totalDownloads: 2340000,
    monthlyActiveUsers: 890000,
    dailyActiveUsers: 125000,
    avgRating: 4.6,
    totalReviews: 12500,
    crashFreeRate: 99.2,
    avgSessionLength: 8.5,
    retention7Day: 42,
    revenue: 288543,
    iosDownloads: 1250000,
    androidDownloads: 1090000
  }

  const getStatusColor = (status: BuildStatus | string) => {
    const colors: Record<string, string> = {
      processing: 'bg-yellow-100 text-yellow-700',
      ready: 'bg-blue-100 text-blue-700',
      submitted: 'bg-purple-100 text-purple-700',
      'in-review': 'bg-orange-100 text-orange-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      released: 'bg-emerald-100 text-emerald-700',
      draft: 'bg-gray-100 text-gray-700',
      scheduled: 'bg-blue-100 text-blue-700',
      sent: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-gray-100 text-gray-700',
      pending: 'bg-yellow-100 text-yellow-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getPlatformIcon = (platform: Platform) => {
    if (platform === 'ios') return <Apple className="h-4 w-4" />
    if (platform === 'android') return <Smartphone className="h-4 w-4" />
    return <Globe className="h-4 w-4" />
  }

  const openBuildDetails = (build: Build) => {
    setSelectedBuild(build)
    setShowBuildDialog(true)
  }

  const openReviewResponse = (review: AppReview) => {
    setSelectedReview(review)
    setResponseText(review.response || '')
    setShowReviewDialog(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Smartphone className="h-8 w-8" />
                Mobile App Console
              </h1>
              <p className="text-indigo-100 mt-1">Manage your iOS and Android applications</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync
              </Button>
              <Button className="bg-white text-indigo-600 hover:bg-indigo-50">
                <Upload className="h-4 w-4 mr-2" />
                Upload Build
              </Button>
            </div>
          </div>

          {/* Platform Toggle */}
          <div className="flex items-center gap-3 mb-6">
            {(['all', 'ios', 'android'] as Platform[]).map(platform => (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedPlatform === platform ? 'bg-white text-indigo-600' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {getPlatformIcon(platform)}
                {platform === 'all' ? 'All Platforms' : platform.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-6 gap-4">
            {[
              { label: 'Total Downloads', value: `${(stats.totalDownloads / 1000000).toFixed(1)}M`, icon: Download, trend: '+12.5%' },
              { label: 'Monthly Active', value: `${(stats.monthlyActiveUsers / 1000).toFixed(0)}K`, icon: Users, trend: '+8.3%' },
              { label: 'Avg Rating', value: stats.avgRating.toFixed(1), icon: Star, trend: '+0.2' },
              { label: 'Crash-Free', value: `${stats.crashFreeRate}%`, icon: Shield, trend: '+0.5%' },
              { label: '7-Day Retention', value: `${stats.retention7Day}%`, icon: Target, trend: '+3.1%' },
              { label: 'Revenue (MTD)', value: `$${(stats.revenue / 1000).toFixed(0)}K`, icon: TrendingUp, trend: '+18.2%' }
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="h-5 w-5 text-indigo-200" />
                  <span className="text-xs text-emerald-300">{stat.trend}</span>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-indigo-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="builds">Builds</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="push">Push Notifications</TabsTrigger>
            <TabsTrigger value="iap">In-App Purchases</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-3 gap-6">
              {/* Recent Builds */}
              <div className="col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Recent Builds</CardTitle>
                      <Button variant="outline" size="sm" onClick={() => setActiveTab('builds')}>
                        View All
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredBuilds.slice(0, 4).map(build => (
                        <div key={build.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => openBuildDetails(build)}>
                          <div className={`p-2 rounded-lg ${build.platform === 'ios' ? 'bg-gray-900 text-white' : 'bg-green-500 text-white'}`}>
                            {getPlatformIcon(build.platform)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">v{build.version} ({build.buildNumber})</h4>
                              <Badge className={getStatusColor(build.status)}>{build.status}</Badge>
                              {build.releaseType !== 'production' && (
                                <Badge variant="outline">{build.releaseType}</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              {build.size} • Min {build.minOsVersion} • Uploaded {build.uploadedAt}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{build.sessions.toLocaleString()} sessions</p>
                            <p className="text-xs text-gray-500">{build.crashes} crashes</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Reviews */}
                <Card className="mt-6">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Recent Reviews</CardTitle>
                      <Button variant="outline" size="sm" onClick={() => setActiveTab('reviews')}>
                        View All
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reviews.slice(0, 3).map(review => (
                        <div key={review.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <div className="flex">
                                  {[1,2,3,4,5].map(star => (
                                    <Star key={star} className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                                  ))}
                                </div>
                                <h4 className="font-medium">{review.title}</h4>
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-2">{review.body}</p>
                            </div>
                            {!review.response && (
                              <Button size="sm" variant="outline" onClick={() => openReviewResponse(review)}>
                                Reply
                              </Button>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                            <span>{review.author}</span>
                            <span>v{review.version}</span>
                            <span className="flex items-center gap-1">
                              {getPlatformIcon(review.platform)}
                              {review.platform.toUpperCase()}
                            </span>
                            <span>{review.territory}</span>
                          </div>
                          {review.response && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm text-blue-800">Developer Response:</p>
                              <p className="text-sm text-blue-700">{review.response}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Platform Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Platform Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="flex items-center gap-2 text-sm">
                          <Apple className="h-4 w-4" />
                          iOS
                        </span>
                        <span className="text-sm font-medium">{(stats.iosDownloads / 1000000).toFixed(1)}M</span>
                      </div>
                      <Progress value={(stats.iosDownloads / stats.totalDownloads) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="flex items-center gap-2 text-sm">
                          <Smartphone className="h-4 w-4" />
                          Android
                        </span>
                        <span className="text-sm font-medium">{(stats.androidDownloads / 1000000).toFixed(1)}M</span>
                      </div>
                      <Progress value={(stats.androidDownloads / stats.totalDownloads) * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      { label: 'Upload New Build', icon: Upload, color: 'text-indigo-600' },
                      { label: 'Send Push Notification', icon: Bell, color: 'text-blue-600' },
                      { label: 'View Crash Reports', icon: Bug, color: 'text-red-600' },
                      { label: 'Update App Metadata', icon: Settings, color: 'text-gray-600' },
                    ].map((action, i) => (
                      <button key={i} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-left">
                        <action.icon className={`h-5 w-5 ${action.color}`} />
                        <span className="text-sm">{action.label}</span>
                      </button>
                    ))}
                  </CardContent>
                </Card>

                {/* Rating Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Rating Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <p className="text-4xl font-bold">{stats.avgRating}</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        {[1,2,3,4,5].map(star => (
                          <Star key={star} className={`h-4 w-4 ${star <= Math.round(stats.avgRating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{stats.totalReviews.toLocaleString()} reviews</p>
                    </div>
                    <div className="space-y-2">
                      {[
                        { stars: 5, percent: 72 },
                        { stars: 4, percent: 18 },
                        { stars: 3, percent: 5 },
                        { stars: 2, percent: 3 },
                        { stars: 1, percent: 2 },
                      ].map(rating => (
                        <div key={rating.stars} className="flex items-center gap-2">
                          <span className="text-xs w-3">{rating.stars}</span>
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <Progress value={rating.percent} className="h-1.5 flex-1" />
                          <span className="text-xs text-gray-500 w-8">{rating.percent}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Builds Tab */}
          <TabsContent value="builds">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Builds</CardTitle>
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Build
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredBuilds.map(build => (
                    <div key={build.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => openBuildDetails(build)}>
                      <div className={`p-3 rounded-lg ${build.platform === 'ios' ? 'bg-gray-900 text-white' : 'bg-green-500 text-white'}`}>
                        {getPlatformIcon(build.platform)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">Version {build.version}</h4>
                          <Badge variant="outline">Build {build.buildNumber}</Badge>
                          <Badge className={getStatusColor(build.status)}>{build.status}</Badge>
                          {build.releaseType !== 'production' && (
                            <Badge variant="secondary">{build.releaseType}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{build.size}</span>
                          <span>Min {build.minOsVersion}</span>
                          <span>Uploaded {build.uploadedAt}</span>
                          {build.expiresAt && <span className="text-orange-600">Expires {build.expiresAt}</span>}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-6 text-center">
                        <div>
                          <p className="text-lg font-semibold">{build.sessions.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">Sessions</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-red-600">{build.crashes}</p>
                          <p className="text-xs text-gray-500">Crashes</p>
                        </div>
                        {build.testFlightEnabled && (
                          <>
                            <div>
                              <p className="text-lg font-semibold text-blue-600">{build.testers}</p>
                              <p className="text-xs text-gray-500">Testers</p>
                            </div>
                            <div>
                              <p className="text-lg font-semibold">{build.feedback}</p>
                              <p className="text-xs text-gray-500">Feedback</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>App Reviews</CardTitle>
                      <div className="flex items-center gap-2">
                        <select className="px-3 py-2 border rounded-lg text-sm">
                          <option>All Ratings</option>
                          <option>5 Stars</option>
                          <option>4 Stars</option>
                          <option>3 Stars</option>
                          <option>2 Stars</option>
                          <option>1 Star</option>
                        </select>
                        <select className="px-3 py-2 border rounded-lg text-sm">
                          <option>All Versions</option>
                          <option>v2.5.0</option>
                          <option>v2.4.2</option>
                        </select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reviews.map(review => (
                        <div key={review.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex">
                                  {[1,2,3,4,5].map(star => (
                                    <Star key={star} className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                                  ))}
                                </div>
                                <h4 className="font-semibold">{review.title}</h4>
                              </div>
                              <p className="text-gray-600 mb-3">{review.body}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>{review.author}</span>
                                <span>{review.date}</span>
                                <span className="flex items-center gap-1">
                                  {getPlatformIcon(review.platform)}
                                  v{review.version}
                                </span>
                                <span>{review.territory}</span>
                                <span>{review.helpful} found helpful</span>
                              </div>
                            </div>
                            <Button size="sm" variant={review.response ? 'secondary' : 'outline'} onClick={() => openReviewResponse(review)}>
                              {review.response ? 'Edit Response' : 'Reply'}
                            </Button>
                          </div>
                          {review.response && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary">Developer Response</Badge>
                                <span className="text-xs text-gray-500">{review.responseDate}</span>
                              </div>
                              <p className="text-sm text-gray-700">{review.response}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Review Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <p className="text-5xl font-bold">{stats.avgRating}</p>
                      <p className="text-sm text-gray-500">{stats.totalReviews.toLocaleString()} total reviews</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold">{reviews.filter(r => !r.response).length}</p>
                        <p className="text-xs text-gray-500">Needs Response</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold">{reviews.filter(r => r.rating <= 2).length}</p>
                        <p className="text-xs text-gray-500">Negative</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Common Topics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[
                        { topic: 'Performance', sentiment: 'positive', count: 245 },
                        { topic: 'UI/UX', sentiment: 'positive', count: 189 },
                        { topic: 'Crashes', sentiment: 'negative', count: 45 },
                        { topic: 'Pricing', sentiment: 'neutral', count: 78 },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                          <span className="text-sm">{item.topic}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs ${item.sentiment === 'positive' ? 'text-green-600' : item.sentiment === 'negative' ? 'text-red-600' : 'text-gray-600'}`}>
                              {item.count} mentions
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Downloads Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <BarChart3 className="h-16 w-16 text-gray-300" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <Activity className="h-16 w-16 text-gray-300" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Device Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Avg Session', value: `${stats.avgSessionLength}m`, icon: Clock },
                      { label: 'Crash-Free Rate', value: `${stats.crashFreeRate}%`, icon: Shield },
                      { label: 'DAU', value: `${(stats.dailyActiveUsers / 1000).toFixed(0)}K`, icon: Users },
                      { label: 'MAU', value: `${(stats.monthlyActiveUsers / 1000).toFixed(0)}K`, icon: Users },
                    ].map((metric, i) => (
                      <div key={i} className="p-4 bg-gray-50 rounded-lg">
                        <metric.icon className="h-5 w-5 text-gray-400 mb-2" />
                        <p className="text-2xl font-bold">{metric.value}</p>
                        <p className="text-sm text-gray-500">{metric.label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Retention</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { period: 'Day 1', rate: 68 },
                      { period: 'Day 7', rate: 42 },
                      { period: 'Day 14', rate: 31 },
                      { period: 'Day 30', rate: 22 },
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">{item.period}</span>
                          <span className="text-sm font-medium">{item.rate}%</span>
                        </div>
                        <Progress value={item.rate} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Push Notifications Tab */}
          <TabsContent value="push">
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Push Campaigns</CardTitle>
                      <Button className="bg-indigo-600 hover:bg-indigo-700">
                        <Bell className="h-4 w-4 mr-2" />
                        New Campaign
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {campaigns.map(campaign => (
                        <div key={campaign.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{campaign.title}</h4>
                                <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                              </div>
                              <p className="text-sm text-gray-600">{campaign.message}</p>
                            </div>
                            <Button variant="outline" size="sm">Edit</Button>
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            <span className="flex items-center gap-1">
                              {getPlatformIcon(campaign.platform)}
                              {campaign.platform === 'all' ? 'All' : campaign.platform.toUpperCase()}
                            </span>
                            <span className="text-gray-500">{campaign.targetAudience}</span>
                            {campaign.sentAt && <span>Sent: {campaign.sentAt}</span>}
                            {campaign.scheduledAt && <span className="text-blue-600">Scheduled: {campaign.scheduledAt}</span>}
                          </div>
                          {campaign.sent > 0 && (
                            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                              <div>
                                <p className="text-lg font-semibold">{campaign.sent.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">Sent</p>
                              </div>
                              <div>
                                <p className="text-lg font-semibold">{((campaign.opened / campaign.sent) * 100).toFixed(1)}%</p>
                                <p className="text-xs text-gray-500">Open Rate</p>
                              </div>
                              <div>
                                <p className="text-lg font-semibold">{((campaign.clicked / campaign.sent) * 100).toFixed(1)}%</p>
                                <p className="text-xs text-gray-500">Click Rate</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Campaign Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <p className="text-3xl font-bold text-indigo-600">{campaigns.filter(c => c.status === 'sent').length}</p>
                    <p className="text-sm text-gray-600">Campaigns Sent</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Avg Open Rate</span>
                      <span className="font-medium">36%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Avg Click Rate</span>
                      <span className="font-medium">10%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Total Sent</span>
                      <span className="font-medium">125K</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* In-App Purchases Tab */}
          <TabsContent value="iap">
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>In-App Purchases</CardTitle>
                      <Button className="bg-indigo-600 hover:bg-indigo-700">
                        <Package className="h-4 w-4 mr-2" />
                        Add Product
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {iaps.map(iap => (
                        <div key={iap.id} className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className={`p-3 rounded-lg ${iap.type === 'subscription' ? 'bg-purple-100' : iap.type === 'consumable' ? 'bg-blue-100' : 'bg-green-100'}`}>
                            <Package className={`h-5 w-5 ${iap.type === 'subscription' ? 'text-purple-600' : iap.type === 'consumable' ? 'text-blue-600' : 'text-green-600'}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{iap.name}</h4>
                              <Badge variant="outline" className="capitalize">{iap.type}</Badge>
                              <Badge className={getStatusColor(iap.status)}>{iap.status}</Badge>
                            </div>
                            <p className="text-sm text-gray-500">{iap.productId}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg">{iap.price}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{iap.purchases.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">Purchases</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">${iap.revenue.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">Revenue</p>
                          </div>
                          <Button variant="outline" size="sm">Edit</Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Revenue Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <p className="text-4xl font-bold text-green-600">
                      ${iaps.reduce((sum, iap) => sum + iap.revenue, 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                  </div>
                  <div className="space-y-3">
                    {[
                      { type: 'Subscriptions', amount: iaps.filter(i => i.type === 'subscription').reduce((s, i) => s + i.revenue, 0), color: 'bg-purple-500' },
                      { type: 'Consumables', amount: iaps.filter(i => i.type === 'consumable').reduce((s, i) => s + i.revenue, 0), color: 'bg-blue-500' },
                      { type: 'One-time', amount: iaps.filter(i => i.type === 'non-consumable').reduce((s, i) => s + i.revenue, 0), color: 'bg-green-500' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="flex-1 text-sm">{item.type}</span>
                        <span className="font-medium">${item.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Build Detail Dialog */}
      <Dialog open={showBuildDialog} onOpenChange={setShowBuildDialog}>
        <DialogContent className="max-w-2xl">
          {selectedBuild && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {getPlatformIcon(selectedBuild.platform)}
                  Version {selectedBuild.version} (Build {selectedBuild.buildNumber})
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(selectedBuild.status)}>{selectedBuild.status}</Badge>
                  <Badge variant="outline">{selectedBuild.releaseType}</Badge>
                  {selectedBuild.testFlightEnabled && <Badge variant="secondary">TestFlight</Badge>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Size</p>
                    <p className="text-lg font-semibold">{selectedBuild.size}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Min OS Version</p>
                    <p className="text-lg font-semibold">{selectedBuild.minOsVersion}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Uploaded</p>
                    <p className="text-lg font-semibold">{selectedBuild.uploadedAt}</p>
                  </div>
                  {selectedBuild.expiresAt && (
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <p className="text-sm text-orange-600">Expires</p>
                      <p className="text-lg font-semibold text-orange-700">{selectedBuild.expiresAt}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold">{selectedBuild.sessions.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Sessions</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{selectedBuild.crashes}</p>
                    <p className="text-sm text-gray-500">Crashes</p>
                  </div>
                  {selectedBuild.testFlightEnabled && (
                    <>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{selectedBuild.testers}</p>
                        <p className="text-sm text-gray-500">Testers</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-2xl font-bold">{selectedBuild.feedback}</p>
                        <p className="text-sm text-gray-500">Feedback</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-3">
                  {selectedBuild.status === 'ready' && (
                    <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                      <Send className="h-4 w-4 mr-2" />
                      Submit for Review
                    </Button>
                  )}
                  {selectedBuild.status === 'approved' && (
                    <Button className="flex-1 bg-green-600 hover:bg-green-700">
                      <Play className="h-4 w-4 mr-2" />
                      Release to App Store
                    </Button>
                  )}
                  <Button variant="outline">
                    <Bug className="h-4 w-4 mr-2" />
                    View Crashes
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Response Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          {selectedReview && (
            <>
              <DialogHeader>
                <DialogTitle>Respond to Review</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1,2,3,4,5].map(star => (
                        <Star key={star} className={`h-4 w-4 ${star <= selectedReview.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="font-medium">{selectedReview.title}</span>
                  </div>
                  <p className="text-sm text-gray-600">{selectedReview.body}</p>
                  <p className="text-xs text-gray-500 mt-2">by {selectedReview.author} • {selectedReview.date}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Your Response</label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={4}
                    placeholder="Write a helpful response to this review..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Your response will be publicly visible on the App Store.</p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setShowReviewDialog(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                    <Send className="h-4 w-4 mr-2" />
                    Submit Response
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
