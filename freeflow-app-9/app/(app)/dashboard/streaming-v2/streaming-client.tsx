'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import {
  Video, Users, Eye, Clock, Search, Settings, Play, Square,
  Radio, Wifi, Mic, MicOff, Camera, CameraOff, Monitor, Share2,
  MessageSquare, Heart, Gift, DollarSign, TrendingUp, BarChart3,
  Calendar, ExternalLink, Copy, AlertCircle, CheckCircle, Pause,
  Volume2, VolumeX, Maximize2, MoreHorizontal, Youtube, Twitch
} from 'lucide-react'

const liveStreams = [
  {
    id: 1,
    title: 'Product Launch Event',
    status: 'live',
    viewers: 1250,
    peakViewers: 1890,
    duration: '01:45:23',
    platform: 'youtube',
    quality: '1080p',
    bitrate: '6000 kbps',
    health: 'excellent',
    startedAt: '2024-01-15T10:00:00Z',
    thumbnail: '/streams/product-launch.jpg'
  },
  {
    id: 2,
    title: 'Weekly Team Update',
    status: 'scheduled',
    viewers: 0,
    peakViewers: 0,
    duration: '00:00:00',
    platform: 'custom',
    quality: '720p',
    bitrate: '4500 kbps',
    health: 'pending',
    startedAt: '2024-01-16T14:00:00Z',
    thumbnail: '/streams/team-update.jpg'
  },
]

const pastStreams = [
  { id: 1, title: 'Client Demo Session', date: '2024-01-14', duration: '02:15:00', viewers: 856, engagement: 78 },
  { id: 2, title: 'Feature Walkthrough', date: '2024-01-12', duration: '01:30:00', viewers: 1234, engagement: 85 },
  { id: 3, title: 'Q&A Session', date: '2024-01-10', duration: '01:00:00', viewers: 567, engagement: 92 },
  { id: 4, title: 'Workshop: Design Basics', date: '2024-01-08', duration: '03:00:00', viewers: 2100, engagement: 88 },
]

const chatMessages = [
  { id: 1, user: 'John D.', message: 'Great presentation!', time: '2 min ago', badge: 'subscriber' },
  { id: 2, user: 'Sarah M.', message: 'Can you show the pricing page?', time: '1 min ago', badge: null },
  { id: 3, user: 'Mike T.', message: 'This is exactly what we needed!', time: '30 sec ago', badge: 'moderator' },
  { id: 4, user: 'Emily R.', message: '🔥🔥🔥', time: 'Just now', badge: 'subscriber' },
]

export default function StreamingClient() {
  const [activeTab, setActiveTab] = useState('live')
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isStreaming, setIsStreaming] = useState(true)

  const currentStream = liveStreams.find(s => s.status === 'live')

  const stats = useMemo(() => ({
    totalStreams: pastStreams.length + liveStreams.filter(s => s.status === 'live').length,
    totalViewers: pastStreams.reduce((sum, s) => sum + s.viewers, 0) + (currentStream?.viewers || 0),
    avgEngagement: Math.round(pastStreams.reduce((sum, s) => sum + s.engagement, 0) / pastStreams.length),
    totalHours: Math.round(pastStreams.reduce((sum, s) => {
      const [h, m] = s.duration.split(':').map(Number)
      return sum + h + m / 60
    }, 0))
  }), [currentStream])

  const getHealthBadge = (health: string) => {
    const styles = {
      excellent: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      good: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      fair: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      poor: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      pending: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    }
    return <Badge variant="outline" className={styles[health as keyof typeof styles]}>{health}</Badge>
  }

  const getUserBadge = (badge: string | null) => {
    if (!badge) return null
    const styles = {
      subscriber: 'bg-purple-100 text-purple-700',
      moderator: 'bg-green-100 text-green-700',
      vip: 'bg-yellow-100 text-yellow-700',
    }
    return <Badge variant="outline" className={`text-xs ${styles[badge as keyof typeof styles]}`}>{badge}</Badge>
  }

  const insights = [
    { icon: Eye, title: '1,250 Live Viewers', description: 'Currently watching' },
    { icon: TrendingUp, title: '+23% Engagement', description: 'Above average' },
    { icon: Clock, title: `${stats.totalHours}h Streamed`, description: 'This month' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Radio className="h-8 w-8 text-red-500" />
            Live Streaming
          </h1>
          <p className="text-muted-foreground mt-1">Manage your live broadcasts and streams</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Stream
          </Button>
          <Button className="bg-red-600 hover:bg-red-700">
            <Video className="h-4 w-4 mr-2" />
            Go Live
          </Button>
        </div>
      </div>

      <CollapsibleInsightsPanel
        title="Streaming Insights"
        insights={insights}
        defaultExpanded={true}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Streams</p>
                <p className="text-2xl font-bold">{stats.totalStreams}</p>
                <p className="text-xs text-green-600 mt-1">+5 this month</p>
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
                <p className="text-2xl font-bold">{stats.totalViewers.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
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
                <p className="text-sm text-muted-foreground">Avg. Engagement</p>
                <p className="text-2xl font-bold">{stats.avgEngagement}%</p>
                <Progress value={stats.avgEngagement} className="h-2 mt-2" />
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hours Streamed</p>
                <p className="text-2xl font-bold">{stats.totalHours}h</p>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Stream Preview */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-600 text-white animate-pulse">
                    <Radio className="h-3 w-3 mr-1" />
                    LIVE
                  </Badge>
                  <CardTitle>{currentStream?.title || 'No Active Stream'}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {currentStream?.viewers.toLocaleString() || 0}
                  </Badge>
                  {currentStream && getHealthBadge(currentStream.health)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Video Preview Placeholder */}
              <div className="relative bg-black rounded-lg aspect-video mb-4 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                  <div className="text-center text-white">
                    <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Product Launch Event</p>
                    <p className="text-sm text-gray-400">Live stream preview</p>
                  </div>
                </div>
                {/* Stream Overlay */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-black/60 text-white">
                      {currentStream?.quality || '1080p'}
                    </Badge>
                    <Badge variant="secondary" className="bg-black/60 text-white">
                      {currentStream?.duration || '00:00:00'}
                    </Badge>
                  </div>
                  <Button variant="secondary" size="icon" className="bg-black/60">
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Stream Controls */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Button
                    variant={isMuted ? 'destructive' : 'outline'}
                    size="icon"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant={!isCameraOn ? 'destructive' : 'outline'}
                    size="icon"
                    onClick={() => setIsCameraOn(!isCameraOn)}
                  >
                    {isCameraOn ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="icon">
                    <Monitor className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline">
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                  <Button variant="destructive" onClick={() => setIsStreaming(false)}>
                    <Square className="h-4 w-4 mr-2" />
                    End Stream
                  </Button>
                </div>
              </div>

              {/* Stream Info */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Bitrate</p>
                  <p className="font-semibold">{currentStream?.bitrate || '0 kbps'}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Peak Viewers</p>
                  <p className="font-semibold">{currentStream?.peakViewers.toLocaleString() || 0}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Platform</p>
                  <p className="font-semibold capitalize">{currentStream?.platform || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Past Streams */}
          <Card>
            <CardHeader>
              <CardTitle>Past Streams</CardTitle>
              <CardDescription>Your recent broadcast history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pastStreams.map((stream) => (
                  <div key={stream.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-20 rounded bg-muted flex items-center justify-center">
                        <Video className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{stream.title}</p>
                        <p className="text-sm text-muted-foreground">{stream.date} · {stream.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="font-semibold">{stream.viewers.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Views</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-green-600">{stream.engagement}%</p>
                        <p className="text-xs text-muted-foreground">Engagement</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Play className="h-4 w-4 mr-1" />
                        Replay
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Chat */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Live Chat
                </CardTitle>
                <Badge variant="secondary">{chatMessages.length} messages</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col h-[calc(100%-80px)]">
              <div className="flex-1 space-y-3 overflow-y-auto mb-4">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{msg.user.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{msg.user}</span>
                        {getUserBadge(msg.badge)}
                        <span className="text-xs text-muted-foreground">{msg.time}</span>
                      </div>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4">
                <div className="flex gap-2">
                  <Input placeholder="Send a message..." />
                  <Button size="icon">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <Switch id="slow-mode" />
                    <label htmlFor="slow-mode" className="text-sm text-muted-foreground">Slow mode</label>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4 mr-1" />
                    Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
