'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Megaphone,
  Bell,
  Search,
  Plus,
  Calendar,
  Eye,
  ThumbsUp,
  MessageSquare,
  Clock,
  Send,
  Edit,
  Trash2,
  Pin,
  PinOff,
  Users,
  Target,
  BarChart3,
  TrendingUp,
  Filter,
  ChevronRight,
  Sparkles,
  Zap,
  Gift,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Star,
  Heart,
  Share2,
  ExternalLink,
  Globe,
  Smartphone,
  Monitor,
  Mail,
  Copy,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  Layers,
  History,
  Settings,
  Image,
  Video,
  FileText,
  Tag,
} from 'lucide-react'

// Types
type AnnouncementStatus = 'draft' | 'scheduled' | 'published' | 'archived'
type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent' | 'critical'
type AnnouncementType = 'feature' | 'improvement' | 'fix' | 'announcement' | 'promotion' | 'maintenance'
type ReactionType = 'like' | 'love' | 'celebrate' | 'insightful' | 'curious'

interface Author {
  id: string
  name: string
  avatar: string
  role: string
}

interface Reaction {
  type: ReactionType
  count: number
  hasReacted: boolean
}

interface Comment {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  createdAt: string
  likes: number
}

interface SegmentRule {
  attribute: string
  operator: string
  value: string
}

interface Segment {
  id: string
  name: string
  description: string
  rules: SegmentRule[]
  userCount: number
}

interface AnnouncementMetrics {
  views: number
  uniqueViews: number
  clicks: number
  ctr: number
  avgTimeOnPost: number
  shares: number
}

interface Announcement {
  id: string
  title: string
  content: string
  excerpt: string
  type: AnnouncementType
  status: AnnouncementStatus
  priority: AnnouncementPriority
  author: Author
  createdAt: string
  updatedAt: string
  publishedAt?: string
  scheduledAt?: string
  expiresAt?: string
  isPinned: boolean
  isFeatured: boolean
  reactions: Reaction[]
  comments: Comment[]
  metrics: AnnouncementMetrics
  targetSegments: string[]
  channels: ('web' | 'mobile' | 'email' | 'push')[]
  media?: { type: 'image' | 'video'; url: string }[]
  labels: string[]
  version?: string
  relatedAnnouncements: string[]
}

interface ChangelogEntry {
  id: string
  version: string
  title: string
  description: string
  type: AnnouncementType
  changes: string[]
  publishedAt: string
  author: Author
}

// Mock Data
const mockAuthors: Author[] = [
  { id: '1', name: 'Sarah Chen', avatar: '/avatars/sarah.jpg', role: 'Product Manager' },
  { id: '2', name: 'Mike Johnson', avatar: '/avatars/mike.jpg', role: 'Engineering Lead' },
  { id: '3', name: 'Emily Davis', avatar: '/avatars/emily.jpg', role: 'Marketing Director' },
]

const mockSegments: Segment[] = [
  { id: '1', name: 'All Users', description: 'Everyone', rules: [], userCount: 50000 },
  { id: '2', name: 'Pro Users', description: 'Pro plan subscribers', rules: [{ attribute: 'plan', operator: '=', value: 'pro' }], userCount: 12500 },
  { id: '3', name: 'Enterprise', description: 'Enterprise customers', rules: [{ attribute: 'plan', operator: '=', value: 'enterprise' }], userCount: 850 },
  { id: '4', name: 'New Users', description: 'Signed up in last 30 days', rules: [{ attribute: 'created_at', operator: '>', value: '-30d' }], userCount: 3200 },
]

const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Introducing AI Copilot - Your New Productivity Partner',
    content: 'We are thrilled to announce the launch of AI Copilot, our most requested feature! AI Copilot uses advanced machine learning to help you work smarter, not harder.',
    excerpt: 'Meet your new AI-powered productivity assistant',
    type: 'feature',
    status: 'published',
    priority: 'high',
    author: mockAuthors[0],
    createdAt: '2024-03-15',
    updatedAt: '2024-03-18',
    publishedAt: '2024-03-18T10:00:00',
    isPinned: true,
    isFeatured: true,
    reactions: [
      { type: 'like', count: 234, hasReacted: false },
      { type: 'love', count: 156, hasReacted: true },
      { type: 'celebrate', count: 89, hasReacted: false }
    ],
    comments: [
      { id: '1', userId: '1', userName: 'John Doe', userAvatar: '/avatars/john.jpg', content: 'This is amazing! Been waiting for this.', createdAt: '2024-03-18T11:00:00', likes: 12 }
    ],
    metrics: { views: 12450, uniqueViews: 8920, clicks: 3456, ctr: 38.7, avgTimeOnPost: 45, shares: 234 },
    targetSegments: ['1'],
    channels: ['web', 'mobile', 'email', 'push'],
    media: [{ type: 'image', url: '/announcements/ai-copilot.png' }],
    labels: ['AI', 'New Feature', 'Productivity'],
    version: '3.0.0',
    relatedAnnouncements: ['2']
  },
  {
    id: '2',
    title: 'Performance Improvements - 40% Faster Load Times',
    content: 'We have been working hard to optimize our infrastructure. You will now experience significantly faster load times across the entire platform.',
    excerpt: 'Major performance boost across the platform',
    type: 'improvement',
    status: 'published',
    priority: 'normal',
    author: mockAuthors[1],
    createdAt: '2024-03-10',
    updatedAt: '2024-03-12',
    publishedAt: '2024-03-12T09:00:00',
    isPinned: false,
    isFeatured: false,
    reactions: [
      { type: 'like', count: 178, hasReacted: false },
      { type: 'celebrate', count: 45, hasReacted: false }
    ],
    comments: [],
    metrics: { views: 8920, uniqueViews: 6540, clicks: 1234, ctr: 18.9, avgTimeOnPost: 28, shares: 89 },
    targetSegments: ['1'],
    channels: ['web', 'mobile'],
    labels: ['Performance', 'Infrastructure'],
    version: '2.9.5',
    relatedAnnouncements: []
  },
  {
    id: '3',
    title: 'Scheduled Maintenance - March 25th',
    content: 'We will be performing scheduled maintenance on March 25th from 2:00 AM to 4:00 AM UTC. During this time, the platform may be temporarily unavailable.',
    excerpt: 'Brief downtime for system maintenance',
    type: 'maintenance',
    status: 'scheduled',
    priority: 'urgent',
    author: mockAuthors[1],
    createdAt: '2024-03-18',
    updatedAt: '2024-03-18',
    scheduledAt: '2024-03-24T18:00:00',
    isPinned: false,
    isFeatured: false,
    reactions: [],
    comments: [],
    metrics: { views: 0, uniqueViews: 0, clicks: 0, ctr: 0, avgTimeOnPost: 0, shares: 0 },
    targetSegments: ['1'],
    channels: ['web', 'email', 'push'],
    labels: ['Maintenance', 'Downtime'],
    relatedAnnouncements: []
  },
  {
    id: '4',
    title: 'Spring Sale - 30% Off Annual Plans',
    content: 'Celebrate spring with our biggest sale of the year! Get 30% off all annual plans. Use code SPRING30 at checkout.',
    excerpt: 'Limited time offer on annual plans',
    type: 'promotion',
    status: 'published',
    priority: 'high',
    author: mockAuthors[2],
    createdAt: '2024-03-01',
    updatedAt: '2024-03-01',
    publishedAt: '2024-03-01T00:00:00',
    expiresAt: '2024-03-31T23:59:59',
    isPinned: false,
    isFeatured: true,
    reactions: [
      { type: 'love', count: 567, hasReacted: false },
      { type: 'celebrate', count: 234, hasReacted: false }
    ],
    comments: [],
    metrics: { views: 24560, uniqueViews: 18900, clicks: 8920, ctr: 47.2, avgTimeOnPost: 62, shares: 456 },
    targetSegments: ['1', '4'],
    channels: ['web', 'mobile', 'email'],
    media: [{ type: 'image', url: '/announcements/spring-sale.png' }],
    labels: ['Promotion', 'Sale', 'Limited Time'],
    relatedAnnouncements: []
  },
  {
    id: '5',
    title: 'Bug Fix: Export Function Now Working',
    content: 'We have fixed an issue where the export function was failing for large datasets. Thank you for your patience.',
    excerpt: 'Export functionality restored',
    type: 'fix',
    status: 'published',
    priority: 'normal',
    author: mockAuthors[1],
    createdAt: '2024-03-08',
    updatedAt: '2024-03-08',
    publishedAt: '2024-03-08T14:00:00',
    isPinned: false,
    isFeatured: false,
    reactions: [
      { type: 'like', count: 45, hasReacted: false }
    ],
    comments: [],
    metrics: { views: 2340, uniqueViews: 1890, clicks: 234, ctr: 12.4, avgTimeOnPost: 15, shares: 12 },
    targetSegments: ['2', '3'],
    channels: ['web'],
    labels: ['Bug Fix', 'Export'],
    version: '2.9.4',
    relatedAnnouncements: []
  }
]

const mockChangelog: ChangelogEntry[] = [
  {
    id: '1',
    version: '3.0.0',
    title: 'AI Copilot Release',
    description: 'Major release introducing AI-powered features',
    type: 'feature',
    changes: [
      'Added AI Copilot for smart suggestions',
      'New AI-powered search functionality',
      'Automated task prioritization',
      'Smart scheduling recommendations'
    ],
    publishedAt: '2024-03-18',
    author: mockAuthors[0]
  },
  {
    id: '2',
    version: '2.9.5',
    title: 'Performance Update',
    description: 'Major performance improvements',
    type: 'improvement',
    changes: [
      '40% faster load times',
      'Reduced memory usage by 25%',
      'Optimized database queries',
      'Improved caching strategy'
    ],
    publishedAt: '2024-03-12',
    author: mockAuthors[1]
  },
  {
    id: '3',
    version: '2.9.4',
    title: 'Bug Fixes',
    description: 'Various bug fixes and improvements',
    type: 'fix',
    changes: [
      'Fixed export function for large datasets',
      'Resolved login issues on mobile',
      'Fixed notification delivery delays',
      'Corrected timezone display issues'
    ],
    publishedAt: '2024-03-08',
    author: mockAuthors[1]
  }
]

const typeIcons: Record<AnnouncementType, React.ReactNode> = {
  feature: <Sparkles className="h-4 w-4" />,
  improvement: <TrendingUp className="h-4 w-4" />,
  fix: <CheckCircle className="h-4 w-4" />,
  announcement: <Megaphone className="h-4 w-4" />,
  promotion: <Gift className="h-4 w-4" />,
  maintenance: <AlertTriangle className="h-4 w-4" />
}

const typeColors: Record<AnnouncementType, string> = {
  feature: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  improvement: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  fix: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  announcement: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  promotion: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  maintenance: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
}

export default function AnnouncementsClient() {
  const [announcements] = useState<Announcement[]>(mockAnnouncements)
  const [changelog] = useState<ChangelogEntry[]>(mockChangelog)
  const [segments] = useState<Segment[]>(mockSegments)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<AnnouncementStatus | 'all'>('all')
  const [selectedType, setSelectedType] = useState<AnnouncementType | 'all'>('all')
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
  const [activeTab, setActiveTab] = useState('announcements')

  // Filtered announcements
  const filteredAnnouncements = useMemo(() => {
    let result = announcements

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(a =>
        a.title.toLowerCase().includes(query) ||
        a.content.toLowerCase().includes(query) ||
        a.labels.some(l => l.toLowerCase().includes(query))
      )
    }

    if (selectedStatus !== 'all') {
      result = result.filter(a => a.status === selectedStatus)
    }

    if (selectedType !== 'all') {
      result = result.filter(a => a.type === selectedType)
    }

    return result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime()
    })
  }, [announcements, searchQuery, selectedStatus, selectedType])

  // Stats
  const stats = useMemo(() => ({
    total: announcements.length,
    published: announcements.filter(a => a.status === 'published').length,
    scheduled: announcements.filter(a => a.status === 'scheduled').length,
    totalViews: announcements.reduce((sum, a) => sum + a.metrics.views, 0),
    totalReactions: announcements.reduce((sum, a) => sum + a.reactions.reduce((s, r) => s + r.count, 0), 0),
    avgCTR: announcements.filter(a => a.metrics.ctr > 0).length > 0
      ? announcements.filter(a => a.metrics.ctr > 0).reduce((sum, a) => sum + a.metrics.ctr, 0) / announcements.filter(a => a.metrics.ctr > 0).length
      : 0
  }), [announcements])

  const getStatusColor = (status: AnnouncementStatus) => {
    const colors: Record<AnnouncementStatus, string> = {
      draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
      scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      archived: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    }
    return colors[status]
  }

  const getPriorityColor = (priority: AnnouncementPriority) => {
    const colors: Record<AnnouncementPriority, string> = {
      low: 'text-gray-500',
      normal: 'text-blue-500',
      high: 'text-orange-500',
      urgent: 'text-red-500',
      critical: 'text-red-600 font-bold'
    }
    return colors[priority]
  }

  const getReactionIcon = (type: ReactionType) => {
    const icons: Record<ReactionType, React.ReactNode> = {
      like: <ThumbsUp className="h-4 w-4" />,
      love: <Heart className="h-4 w-4" />,
      celebrate: <Star className="h-4 w-4" />,
      insightful: <Sparkles className="h-4 w-4" />,
      curious: <Info className="h-4 w-4" />
    }
    return icons[type]
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50/30 to-fuchsia-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Megaphone className="h-8 w-8" />
                Announcements
              </h1>
              <p className="mt-2 text-white/80">
                Share updates, features, and news with your users
              </p>
            </div>
            <Button className="bg-white text-violet-600 hover:bg-white/90">
              <Plus className="h-4 w-4 mr-2" />
              New Announcement
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-6 gap-4 mt-8">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-white/70">Total</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold">{stats.published}</div>
              <div className="text-sm text-white/70">Published</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold">{stats.scheduled}</div>
              <div className="text-sm text-white/70">Scheduled</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold">{formatNumber(stats.totalViews)}</div>
              <div className="text-sm text-white/70">Total Views</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold">{formatNumber(stats.totalReactions)}</div>
              <div className="text-sm text-white/70">Reactions</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold">{stats.avgCTR.toFixed(1)}%</div>
              <div className="text-sm text-white/70">Avg CTR</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800">
            <TabsTrigger value="announcements" className="gap-2">
              <Megaphone className="h-4 w-4" />
              Announcements
            </TabsTrigger>
            <TabsTrigger value="changelog" className="gap-2">
              <History className="h-4 w-4" />
              Changelog
            </TabsTrigger>
            <TabsTrigger value="segments" className="gap-2">
              <Users className="h-4 w-4" />
              Segments
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="announcements" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search announcements..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as AnnouncementStatus | 'all')}
                      className="border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                    >
                      <option value="all">All Status</option>
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>

                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value as AnnouncementType | 'all')}
                      className="border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                    >
                      <option value="all">All Types</option>
                      <option value="feature">Feature</option>
                      <option value="improvement">Improvement</option>
                      <option value="fix">Bug Fix</option>
                      <option value="announcement">Announcement</option>
                      <option value="promotion">Promotion</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Announcements List */}
            <div className="space-y-4">
              {filteredAnnouncements.map(announcement => (
                <Card
                  key={announcement.id}
                  className={`cursor-pointer hover:shadow-lg transition-shadow ${announcement.isPinned ? 'border-violet-200 dark:border-violet-800' : ''}`}
                  onClick={() => setSelectedAnnouncement(announcement)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${typeColors[announcement.type]}`}>
                        {typeIcons[announcement.type]}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {announcement.isPinned && <Pin className="h-4 w-4 text-violet-500" />}
                              {announcement.isFeatured && <Star className="h-4 w-4 text-amber-500 fill-current" />}
                              <h3 className="font-semibold text-lg">{announcement.title}</h3>
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-2">{announcement.excerpt}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(announcement.status)}>
                              {announcement.status}
                            </Badge>
                            <Badge className={typeColors[announcement.type]}>
                              {announcement.type}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback>{announcement.author.name[0]}</AvatarFallback>
                            </Avatar>
                            <span>{announcement.author.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {announcement.publishedAt
                              ? new Date(announcement.publishedAt).toLocaleDateString()
                              : announcement.scheduledAt
                                ? `Scheduled: ${new Date(announcement.scheduledAt).toLocaleDateString()}`
                                : 'Draft'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {formatNumber(announcement.metrics.views)}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {announcement.reactions.map(reaction => (
                              <button
                                key={reaction.type}
                                className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
                                  reaction.hasReacted ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {getReactionIcon(reaction.type)}
                                {reaction.count}
                              </button>
                            ))}
                            {announcement.comments.length > 0 && (
                              <span className="flex items-center gap-1 text-sm text-gray-500">
                                <MessageSquare className="h-4 w-4" />
                                {announcement.comments.length}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {announcement.channels.map(channel => (
                              <span key={channel} className="text-gray-400">
                                {channel === 'web' && <Globe className="h-4 w-4" />}
                                {channel === 'mobile' && <Smartphone className="h-4 w-4" />}
                                {channel === 'email' && <Mail className="h-4 w-4" />}
                                {channel === 'push' && <Bell className="h-4 w-4" />}
                              </span>
                            ))}
                          </div>
                        </div>

                        {announcement.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {announcement.labels.map(label => (
                              <Badge key={label} variant="outline" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {label}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="changelog" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Release History</h2>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Release
              </Button>
            </div>

            <div className="space-y-4">
              {changelog.map((entry, i) => (
                <Card key={entry.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className={`p-3 rounded-xl ${typeColors[entry.type]}`}>
                          {typeIcons[entry.type]}
                        </div>
                        {i < changelog.length - 1 && (
                          <div className="absolute top-14 left-1/2 -translate-x-1/2 w-0.5 h-16 bg-gray-200 dark:bg-gray-700" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Badge className="bg-violet-100 text-violet-700">v{entry.version}</Badge>
                            <h3 className="font-semibold">{entry.title}</h3>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(entry.publishedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <p className="text-sm text-gray-500 mb-3">{entry.description}</p>

                        <ul className="space-y-2">
                          {entry.changes.map((change, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                              <span>{change}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback>{entry.author.name[0]}</AvatarFallback>
                          </Avatar>
                          <span>{entry.author.name}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="segments" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">User Segments</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Segment
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {segments.map(segment => (
                <Card key={segment.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">{segment.name}</h3>
                        <p className="text-sm text-gray-500">{segment.description}</p>
                      </div>
                      <Badge variant="secondary">
                        <Users className="h-3 w-3 mr-1" />
                        {formatNumber(segment.userCount)}
                      </Badge>
                    </div>

                    {segment.rules.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs text-gray-500 font-medium">Rules</div>
                        {segment.rules.map((rule, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                            <code className="text-violet-600">{rule.attribute}</code>
                            <span className="text-gray-400">{rule.operator}</span>
                            <code className="text-green-600">{rule.value}</code>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-4">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">
                        <Send className="h-4 w-4 mr-2" />
                        Send Announcement
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {announcements.filter(a => a.status === 'published').slice(0, 5).map(a => (
                      <div key={a.id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium truncate max-w-[60%]">{a.title}</span>
                          <span className="text-gray-500">{formatNumber(a.metrics.views)} views</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <Progress value={a.metrics.ctr} className="flex-1 h-2" />
                          <span className="text-sm font-medium w-16">{a.metrics.ctr.toFixed(1)}% CTR</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Top Reactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(['like', 'love', 'celebrate'] as ReactionType[]).map(type => {
                        const total = announcements.reduce((sum, a) => {
                          const reaction = a.reactions.find(r => r.type === type)
                          return sum + (reaction?.count || 0)
                        }, 0)
                        return (
                          <div key={type} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getReactionIcon(type)}
                              <span className="capitalize">{type}</span>
                            </div>
                            <span className="font-semibold">{formatNumber(total)}</span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Channel Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { channel: 'Web', icon: <Globe className="h-4 w-4" />, reach: 45230 },
                        { channel: 'Mobile', icon: <Smartphone className="h-4 w-4" />, reach: 28900 },
                        { channel: 'Email', icon: <Mail className="h-4 w-4" />, reach: 52340 },
                        { channel: 'Push', icon: <Bell className="h-4 w-4" />, reach: 18900 }
                      ].map(item => (
                        <div key={item.channel} className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-gray-600">
                            {item.icon}
                            <span>{item.channel}</span>
                          </div>
                          <span className="font-semibold">{formatNumber(item.reach)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Announcement Detail Dialog */}
      <Dialog open={!!selectedAnnouncement} onOpenChange={() => setSelectedAnnouncement(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          {selectedAnnouncement && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={typeColors[selectedAnnouncement.type]}>
                    {typeIcons[selectedAnnouncement.type]}
                    <span className="ml-1">{selectedAnnouncement.type}</span>
                  </Badge>
                  <Badge className={getStatusColor(selectedAnnouncement.status)}>
                    {selectedAnnouncement.status}
                  </Badge>
                  {selectedAnnouncement.version && (
                    <Badge variant="outline">v{selectedAnnouncement.version}</Badge>
                  )}
                </div>
                <DialogTitle className="text-2xl">{selectedAnnouncement.title}</DialogTitle>
              </DialogHeader>

              <ScrollArea className="flex-1">
                <div className="space-y-6 pr-4">
                  {/* Meta */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>{selectedAnnouncement.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <span>{selectedAnnouncement.author.name}</span>
                    </div>
                    <span>•</span>
                    <span>{selectedAnnouncement.publishedAt
                      ? new Date(selectedAnnouncement.publishedAt).toLocaleDateString()
                      : 'Not published'}</span>
                  </div>

                  {/* Content */}
                  <div className="prose dark:prose-invert max-w-none">
                    <p>{selectedAnnouncement.content}</p>
                  </div>

                  {/* Media */}
                  {selectedAnnouncement.media && selectedAnnouncement.media.length > 0 && (
                    <div className="space-y-4">
                      {selectedAnnouncement.media.map((m, i) => (
                        <div key={i} className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-video flex items-center justify-center">
                          {m.type === 'image' ? (
                            <Image className="h-16 w-16 text-gray-400" />
                          ) : (
                            <Video className="h-16 w-16 text-gray-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Metrics */}
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-3">Performance</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{formatNumber(selectedAnnouncement.metrics.views)}</div>
                          <div className="text-sm text-gray-500">Views</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{selectedAnnouncement.metrics.ctr.toFixed(1)}%</div>
                          <div className="text-sm text-gray-500">CTR</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{formatNumber(selectedAnnouncement.metrics.shares)}</div>
                          <div className="text-sm text-gray-500">Shares</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Reactions */}
                  <div>
                    <h4 className="font-medium mb-3">Reactions</h4>
                    <div className="flex items-center gap-3">
                      {selectedAnnouncement.reactions.map(reaction => (
                        <button
                          key={reaction.type}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
                            reaction.hasReacted ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {getReactionIcon(reaction.type)}
                          <span className="capitalize">{reaction.type}</span>
                          <span className="font-medium">{reaction.count}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Labels */}
                  {selectedAnnouncement.labels.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Labels</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedAnnouncement.labels.map(label => (
                          <Badge key={label} variant="secondary">
                            <Tag className="h-3 w-3 mr-1" />
                            {label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t">
                    <Button variant="outline" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline">
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </Button>
                    {selectedAnnouncement.isPinned ? (
                      <Button variant="outline">
                        <PinOff className="h-4 w-4 mr-2" />
                        Unpin
                      </Button>
                    ) : (
                      <Button variant="outline">
                        <Pin className="h-4 w-4 mr-2" />
                        Pin
                      </Button>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
