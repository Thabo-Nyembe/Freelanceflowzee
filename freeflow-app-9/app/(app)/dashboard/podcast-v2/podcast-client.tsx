'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import {
  Mic, Headphones, Play, Pause, SkipForward, SkipBack, Volume2,
  Download, Share2, Search, Plus, MoreHorizontal, Clock, Users,
  TrendingUp, Calendar, Upload, Radio, Rss, BarChart3, Heart,
  MessageSquare, Settings, Eye, Sparkles
} from 'lucide-react'

const episodes = [
  {
    id: 1,
    title: 'The Future of Remote Work',
    description: 'Discussing trends and best practices for distributed teams',
    duration: '45:32',
    plays: 12450,
    downloads: 3420,
    publishedAt: '2024-01-15',
    status: 'published',
    guests: ['Sarah Chen', 'Mike Johnson'],
    artwork: '/podcasts/ep1.jpg'
  },
  {
    id: 2,
    title: 'Building High-Performance Teams',
    description: 'Insights from top managers on team building strategies',
    duration: '38:15',
    plays: 8920,
    downloads: 2890,
    publishedAt: '2024-01-08',
    status: 'published',
    guests: ['Emily Davis'],
    artwork: '/podcasts/ep2.jpg'
  },
  {
    id: 3,
    title: 'AI in the Workplace',
    description: 'How artificial intelligence is transforming business operations',
    duration: '52:48',
    plays: 15230,
    downloads: 4560,
    publishedAt: '2024-01-01',
    status: 'published',
    guests: ['Dr. Alex Kim', 'Lisa Wang'],
    artwork: '/podcasts/ep3.jpg'
  },
  {
    id: 4,
    title: 'Sustainable Business Practices',
    description: 'Environmental responsibility in modern companies',
    duration: '41:20',
    plays: 0,
    downloads: 0,
    publishedAt: '2024-01-22',
    status: 'scheduled',
    guests: ['Tom Green'],
    artwork: '/podcasts/ep4.jpg'
  },
  {
    id: 5,
    title: 'Leadership in Crisis',
    description: 'Managing teams through challenging times',
    duration: '0:00',
    plays: 0,
    downloads: 0,
    publishedAt: null,
    status: 'draft',
    guests: [],
    artwork: null
  },
]

const analytics = {
  totalPlays: 36600,
  totalDownloads: 10870,
  avgListenTime: '32:45',
  subscribers: 8540,
  growth: 18.5
}

export default function PodcastClient() {
  const [activeTab, setActiveTab] = useState('episodes')
  const [searchQuery, setSearchQuery] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentEpisode, setCurrentEpisode] = useState(episodes[0])

  const filteredEpisodes = useMemo(() => {
    return episodes.filter(ep =>
      ep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const getStatusBadge = (status: string) => {
    const styles = {
      published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      draft: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    }
    return <Badge variant="outline" className={styles[status as keyof typeof styles]}>{status}</Badge>
  }

  const insights = [
    { icon: Headphones, title: `${analytics.totalPlays.toLocaleString()} Plays`, description: 'Total listens' },
    { icon: Users, title: `${analytics.subscribers.toLocaleString()} Subscribers`, description: 'Active followers' },
    { icon: TrendingUp, title: `+${analytics.growth}%`, description: 'Monthly growth' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Mic className="h-8 w-8 text-primary" />
            Podcast Studio
          </h1>
          <p className="text-muted-foreground mt-1">Manage your podcast episodes and analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Rss className="h-4 w-4 mr-2" />
            RSS Feed
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Episode
          </Button>
        </div>
      </div>

      <CollapsibleInsightsPanel
        title="Podcast Insights"
        insights={insights}
        defaultExpanded={true}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Plays</p>
                <p className="text-2xl font-bold">{analytics.totalPlays.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">+2,450 this week</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Headphones className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Downloads</p>
                <p className="text-2xl font-bold">{analytics.totalDownloads.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">+890 this week</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Download className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Subscribers</p>
                <p className="text-2xl font-bold">{analytics.subscribers.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">+{analytics.growth}% growth</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Listen Time</p>
                <p className="text-2xl font-bold">{analytics.avgListenTime}</p>
                <p className="text-xs text-muted-foreground mt-1">Per episode</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Player */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Mic className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">{currentEpisode.title}</h4>
              <p className="text-sm text-muted-foreground">{currentEpisode.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <SkipBack className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>
              <Button variant="ghost" size="icon">
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center gap-2 w-48">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <Progress value={70} className="h-2" />
            </div>
            <span className="text-sm text-muted-foreground w-24">12:34 / {currentEpisode.duration}</span>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="episodes">Episodes</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="episodes" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>All Episodes</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search episodes..."
                    className="pl-9 w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEpisodes.map((episode) => (
                  <div key={episode.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                        <Mic className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{episode.title}</h4>
                          {getStatusBadge(episode.status)}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{episode.description}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center"><Clock className="h-3 w-3 mr-1" />{episode.duration}</span>
                          {episode.guests.length > 0 && (
                            <span className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {episode.guests.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      {episode.status === 'published' && (
                        <>
                          <div className="text-center">
                            <p className="font-semibold">{episode.plays.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Plays</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold">{episode.downloads.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Downloads</p>
                          </div>
                        </>
                      )}
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setCurrentEpisode(episode)}>
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Plays Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                  <BarChart3 className="h-12 w-12 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Episodes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {episodes.filter(e => e.status === 'published').sort((a, b) => b.plays - a.plays).slice(0, 5).map((ep, idx) => (
                    <div key={ep.id} className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-muted-foreground w-8">#{idx + 1}</span>
                      <div className="flex-1">
                        <p className="font-medium">{ep.title}</p>
                        <Progress value={(ep.plays / episodes[0].plays) * 100} className="h-2 mt-1" />
                      </div>
                      <span className="font-semibold">{ep.plays.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribution Platforms</CardTitle>
              <CardDescription>Where your podcast is available</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'Spotify', connected: true, listeners: 4520 },
                  { name: 'Apple Podcasts', connected: true, listeners: 3210 },
                  { name: 'Google Podcasts', connected: true, listeners: 1890 },
                  { name: 'YouTube Music', connected: false, listeners: 0 },
                ].map((platform, idx) => (
                  <div key={idx} className={`p-4 border rounded-lg text-center ${platform.connected ? '' : 'opacity-60'}`}>
                    <div className="h-12 w-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                      <Radio className="h-6 w-6" />
                    </div>
                    <p className="font-medium">{platform.name}</p>
                    {platform.connected ? (
                      <>
                        <Badge className="mt-2 bg-green-100 text-green-700">Connected</Badge>
                        <p className="text-sm text-muted-foreground mt-2">{platform.listeners.toLocaleString()} listeners</p>
                      </>
                    ) : (
                      <Button size="sm" className="mt-2">Connect</Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
