'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Video,
  Play,
  Pause,
  Plus,
  Upload,
  Scissors,
  Brain,
  Eye,
  Share2,
  Settings,
  Film,
  Wand2,
  Target,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  RefreshCw,
  Layers,
  Music,
  Image,
  Type,
  Palette,
  Sliders,
  Zap,
  Volume2,
  Download,
  Sparkles,
  TrendingUp,
  Heart,
  Crown,
  History
} from 'lucide-react'

// Types
type VideoStatus = 'draft' | 'generating' | 'ready' | 'failed'
type VideoStyle = 'cinematic' | 'documentary' | 'social' | 'commercial' | 'animation' | 'artistic'

interface GeneratedVideo {
  id: string
  title: string
  prompt: string
  status: VideoStatus
  style: VideoStyle
  duration: number
  thumbnailUrl?: string
  videoUrl?: string
  createdAt: string
  views: number
  likes: number
}

interface VideoStats {
  totalVideos: number
  totalViews: number
  totalLikes: number
  creditsUsed: number
  creditsRemaining: number
  avgGenerationTime: number
}

// Helper functions
const getStatusColor = (status: VideoStatus) => {
  const colors = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    generating: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    ready: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  }
  return colors[status]
}

const getStyleColor = (style: VideoStyle) => {
  const colors = {
    cinematic: 'from-purple-500 to-indigo-600',
    documentary: 'from-blue-500 to-cyan-500',
    social: 'from-pink-500 to-rose-500',
    commercial: 'from-amber-500 to-orange-500',
    animation: 'from-green-500 to-emerald-500',
    artistic: 'from-violet-500 to-purple-600'
  }
  return colors[style]
}

export default function AIVideoClient() {
  const [activeTab, setActiveTab] = useState('generate')
  const [searchQuery, setSearchQuery] = useState('')
  const [prompt, setPrompt] = useState('')
  const [selectedStyle, setSelectedStyle] = useState<VideoStyle>('cinematic')
  const [duration, setDuration] = useState([30])
  const [isGenerating, setIsGenerating] = useState(false)
  const [videos, setVideos] = useState<GeneratedVideo[]>([])

  // Stats
  const stats: VideoStats = useMemo(() => ({
    totalVideos: videos.length,
    totalViews: videos.reduce((sum, v) => sum + v.views, 0),
    totalLikes: videos.reduce((sum, v) => sum + v.likes, 0),
    creditsUsed: videos.length * 10,
    creditsRemaining: 500 - videos.length * 10,
    avgGenerationTime: 45
  }), [videos])

  // Generate video
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    setIsGenerating(true)
    toast.info('Starting video generation...')

    // Simulate generation
    setTimeout(() => {
      const newVideo: GeneratedVideo = {
        id: Date.now().toString(),
        title: prompt.slice(0, 50),
        prompt,
        status: 'ready',
        style: selectedStyle,
        duration: duration[0],
        createdAt: new Date().toISOString(),
        views: 0,
        likes: 0
      }
      setVideos(prev => [newVideo, ...prev])
      setIsGenerating(false)
      setPrompt('')
      toast.success('Video generated successfully!')
    }, 3000)
  }

  // Filtered videos
  const filteredVideos = useMemo(() => {
    return videos.filter(v =>
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.prompt.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [videos, searchQuery])

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/40 dark:bg-none dark:bg-gray-900 p-6 rounded-xl overflow-hidden">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Video Studio</h1>
              <p className="text-gray-600 dark:text-gray-400">Generate stunning videos with AI</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* AI Tools Navigation */}
            <div className="flex items-center gap-2">
              <Link href="/dashboard/ai-voice-v2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Music className="w-4 h-4" />
                  <span className="hidden md:inline">Add Music/Voice</span>
                </Button>
              </Link>
              <Link href="/dashboard/ai-design-v2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Palette className="w-4 h-4" />
                  <span className="hidden md:inline">Create Graphics</span>
                </Button>
              </Link>
              <Link href="/dashboard/video-review-v2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Eye className="w-4 h-4" />
                  <span className="hidden md:inline">Review Video</span>
                </Button>
              </Link>
            </div>
            <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500" />
                <span className="font-semibold text-gray-900 dark:text-white">{stats.creditsRemaining}</span>
                <span className="text-sm text-gray-500">credits</span>
              </div>
            </div>
            <Button variant="outline">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { label: 'Videos', value: stats.totalVideos, icon: Video, color: 'from-blue-500 to-indigo-500' },
            { label: 'Total Views', value: stats.totalViews, icon: Eye, color: 'from-purple-500 to-pink-500' },
            { label: 'Total Likes', value: stats.totalLikes, icon: Heart, color: 'from-red-500 to-pink-500' },
            { label: 'Credits Used', value: stats.creditsUsed, icon: Zap, color: 'from-amber-500 to-orange-500' },
            { label: 'Avg Time', value: `${stats.avgGenerationTime}s`, icon: Clock, color: 'from-green-500 to-emerald-500' },
            { label: 'Success Rate', value: '98%', icon: Target, color: 'from-teal-500 to-cyan-500' }
          ].map((stat, idx) => (
            <Card key={idx} className="relative overflow-hidden border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm">
            <TabsTrigger value="generate" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white rounded-lg">
              <Wand2 className="w-4 h-4" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="library" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white rounded-lg">
              <Film className="w-4 h-4" />
              Library
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white rounded-lg">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Generate Tab */}
          <TabsContent value="generate" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Prompt Builder */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-blue-500" />
                      Video Prompt
                    </CardTitle>
                    <CardDescription>Describe the video you want to create</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="A cinematic drone shot over a mountain range at sunset, with soft golden light..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[150px] resize-none"
                    />

                    {/* Style Selection */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Video Style</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {(['cinematic', 'documentary', 'social', 'commercial', 'animation', 'artistic'] as VideoStyle[]).map((style) => (
                          <Button
                            key={style}
                            variant={selectedStyle === style ? 'default' : 'outline'}
                            className={`capitalize ${selectedStyle === style ? `bg-gradient-to-r ${getStyleColor(style)} text-white` : ''}`}
                            onClick={() => setSelectedStyle(style)}
                          >
                            {style}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Duration */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Duration: {duration[0]} seconds</Label>
                      <Slider
                        value={duration}
                        onValueChange={setDuration}
                        min={5}
                        max={120}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    {/* Generate Button */}
                    <Button
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                      size="lg"
                      onClick={handleGenerate}
                      disabled={isGenerating || !prompt.trim()}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Generate Video
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Panel */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sliders className="w-5 h-5 text-blue-500" />
                      Advanced Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>AI Enhancement</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Auto Stabilization</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Color Grading</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Audio Sync</Label>
                      <Switch />
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Tips */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Quick Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                    <p>- Be specific about camera movements</p>
                    <p>- Include lighting and mood details</p>
                    <p>- Mention color palette preferences</p>
                    <p>- Specify the time of day</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library" className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            {filteredVideos.length === 0 ? (
              <Card className="p-12 text-center">
                <Video className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No videos yet</h3>
                <p className="text-gray-500 mb-4">Generate your first AI video to get started</p>
                <Button onClick={() => setActiveTab('generate')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Video
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredVideos.map((video) => (
                  <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                      <Play className="w-12 h-12 text-gray-400" />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-sm truncate flex-1">{video.title}</h3>
                        <Badge className={getStatusColor(video.status)}>{video.status}</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">{video.prompt}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {video.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {video.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {video.duration}s
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Video Generation Settings</CardTitle>
                <CardDescription>Configure your default video generation preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label>Default Resolution</Label>
                    <select className="w-full mt-2 p-2 border rounded-lg dark:bg-gray-800">
                      <option>1080p (Full HD)</option>
                      <option>4K (Ultra HD)</option>
                      <option>720p (HD)</option>
                    </select>
                  </div>
                  <div>
                    <Label>Default Frame Rate</Label>
                    <select className="w-full mt-2 p-2 border rounded-lg dark:bg-gray-800">
                      <option>30 fps</option>
                      <option>60 fps</option>
                      <option>24 fps (Cinematic)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div>
                    <Label>Auto-save drafts</Label>
                    <p className="text-xs text-gray-500">Automatically save work in progress</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div>
                    <Label>Email notifications</Label>
                    <p className="text-xs text-gray-500">Get notified when videos are ready</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
