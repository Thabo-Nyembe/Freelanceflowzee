'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Users,
  Calendar,
  Clock,
  Play,
  Pause,
  Settings,
  BarChart3,
  Plus,
  Search,
  Mail,
  MessageSquare,
  HelpCircle,
  Layout,
  PlayCircle,
  Download,
  Upload,
  Trash2,
  Edit,
  Copy,
  MoreHorizontal,
  ExternalLink,
  ChevronRight,
  Share2,
  Link,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Eye,
  FileText,
  Zap,
  Bell,
  Globe,
  Lock,
  UserPlus,
  UserCheck,
  UserX,
  Send,
  RefreshCw,
  Circle,
  Radio,
  Hand,
  MessageCircle,
  BarChart2,
  PieChart,
  Timer,
  StopCircle,
  Filter,
  Star,
  ThumbsUp,
  ThumbsDown,
  ListChecks,
  Presentation,
  MonitorPlay,
  Headphones,
  Volume2,
  VolumeX,
  ScreenShare,
  ScreenShareOff,
  Maximize2,
  Minimize2,
  Gift,
  Award,
  Target,
  Sparkles
} from 'lucide-react'

// Types
type WebinarStatus = 'scheduled' | 'live' | 'ended' | 'cancelled' | 'draft'
type WebinarType = 'webinar' | 'meeting' | 'training' | 'demo' | 'conference'
type RegistrationStatus = 'pending' | 'approved' | 'declined' | 'attended' | 'no_show'
type RecordingStatus = 'processing' | 'ready' | 'failed'

interface Panelist {
  id: string
  name: string
  email: string
  role: 'host' | 'co-host' | 'panelist' | 'speaker'
  avatar?: string
}

interface Poll {
  id: string
  question: string
  options: { id: string; text: string; votes: number }[]
  status: 'draft' | 'active' | 'ended'
  createdAt: string
}

interface QAItem {
  id: string
  question: string
  askedBy: string
  askedAt: string
  answer?: string
  answeredBy?: string
  answeredAt?: string
  upvotes: number
  status: 'pending' | 'answered' | 'dismissed'
}

interface Webinar {
  id: string
  title: string
  description: string
  type: WebinarType
  status: WebinarStatus
  scheduledDate: string
  duration: number
  timezone: string
  host: Panelist
  panelists: Panelist[]
  registeredCount: number
  attendedCount: number
  maxParticipants: number
  registrationRequired: boolean
  approvalRequired: boolean
  recordingEnabled: boolean
  qnaEnabled: boolean
  pollsEnabled: boolean
  chatEnabled: boolean
  waitingRoomEnabled: boolean
  meetingId?: string
  joinUrl?: string
  registrationUrl?: string
  createdAt: string
}

interface Registration {
  id: string
  webinarId: string
  name: string
  email: string
  company?: string
  jobTitle?: string
  status: RegistrationStatus
  registeredAt: string
  attendedAt?: string
  leftAt?: string
  duration?: number
  source?: string
}

interface Recording {
  id: string
  webinarId: string
  webinarTitle: string
  type: 'video' | 'audio' | 'transcript'
  status: RecordingStatus
  duration: number
  size: number
  views: number
  downloadCount: number
  url?: string
  createdAt: string
  expiresAt?: string
}

interface EmailTemplate {
  id: string
  name: string
  type: 'confirmation' | 'reminder' | 'follow_up' | 'cancellation'
  subject: string
  enabled: boolean
  sendTime?: string
}

interface WebinarStats {
  totalWebinars: number
  scheduledWebinars: number
  liveNow: number
  endedWebinars: number
  totalRegistrations: number
  totalAttendees: number
  avgAttendanceRate: number
  avgDuration: number
}

// Mock Data
const mockWebinars: Webinar[] = [
  {
    id: 'w1',
    title: 'Product Launch: AI Features 2024',
    description: 'Join us for the unveiling of our new AI-powered features',
    type: 'webinar',
    status: 'scheduled',
    scheduledDate: '2024-03-15T14:00:00Z',
    duration: 60,
    timezone: 'America/New_York',
    host: { id: 'h1', name: 'Sarah Chen', email: 'sarah@example.com', role: 'host' },
    panelists: [
      { id: 'p1', name: 'Mike Johnson', email: 'mike@example.com', role: 'speaker' },
      { id: 'p2', name: 'Emily Davis', email: 'emily@example.com', role: 'panelist' }
    ],
    registeredCount: 234,
    attendedCount: 0,
    maxParticipants: 500,
    registrationRequired: true,
    approvalRequired: false,
    recordingEnabled: true,
    qnaEnabled: true,
    pollsEnabled: true,
    chatEnabled: true,
    waitingRoomEnabled: true,
    meetingId: '123-456-789',
    joinUrl: 'https://zoom.us/j/123456789',
    registrationUrl: 'https://zoom.us/webinar/register/123456789',
    createdAt: '2024-03-01'
  },
  {
    id: 'w2',
    title: 'Customer Success Workshop',
    description: 'Best practices for maximizing customer value',
    type: 'training',
    status: 'live',
    scheduledDate: '2024-03-12T10:00:00Z',
    duration: 90,
    timezone: 'America/New_York',
    host: { id: 'h2', name: 'Alex Rivera', email: 'alex@example.com', role: 'host' },
    panelists: [],
    registeredCount: 156,
    attendedCount: 134,
    maxParticipants: 200,
    registrationRequired: true,
    approvalRequired: false,
    recordingEnabled: true,
    qnaEnabled: true,
    pollsEnabled: false,
    chatEnabled: true,
    waitingRoomEnabled: false,
    createdAt: '2024-02-28'
  },
  {
    id: 'w3',
    title: 'Q1 Product Demo',
    description: 'Live demonstration of our latest features',
    type: 'demo',
    status: 'ended',
    scheduledDate: '2024-03-05T15:00:00Z',
    duration: 45,
    timezone: 'America/New_York',
    host: { id: 'h1', name: 'Sarah Chen', email: 'sarah@example.com', role: 'host' },
    panelists: [
      { id: 'p3', name: 'James Wilson', email: 'james@example.com', role: 'speaker' }
    ],
    registeredCount: 312,
    attendedCount: 267,
    maxParticipants: 500,
    registrationRequired: true,
    approvalRequired: false,
    recordingEnabled: true,
    qnaEnabled: true,
    pollsEnabled: true,
    chatEnabled: true,
    waitingRoomEnabled: true,
    createdAt: '2024-02-20'
  },
  {
    id: 'w4',
    title: 'Annual User Conference 2024',
    description: 'Our biggest event of the year with keynotes and sessions',
    type: 'conference',
    status: 'scheduled',
    scheduledDate: '2024-04-01T09:00:00Z',
    duration: 480,
    timezone: 'America/New_York',
    host: { id: 'h3', name: 'Lisa Brown', email: 'lisa@example.com', role: 'host' },
    panelists: [
      { id: 'p1', name: 'Mike Johnson', email: 'mike@example.com', role: 'speaker' },
      { id: 'p2', name: 'Emily Davis', email: 'emily@example.com', role: 'speaker' },
      { id: 'p4', name: 'David Lee', email: 'david@example.com', role: 'panelist' }
    ],
    registeredCount: 892,
    attendedCount: 0,
    maxParticipants: 1000,
    registrationRequired: true,
    approvalRequired: true,
    recordingEnabled: true,
    qnaEnabled: true,
    pollsEnabled: true,
    chatEnabled: true,
    waitingRoomEnabled: true,
    createdAt: '2024-02-01'
  },
  {
    id: 'w5',
    title: 'Weekly Team Sync',
    description: 'Internal team meeting',
    type: 'meeting',
    status: 'draft',
    scheduledDate: '2024-03-18T11:00:00Z',
    duration: 30,
    timezone: 'America/New_York',
    host: { id: 'h2', name: 'Alex Rivera', email: 'alex@example.com', role: 'host' },
    panelists: [],
    registeredCount: 0,
    attendedCount: 0,
    maxParticipants: 50,
    registrationRequired: false,
    approvalRequired: false,
    recordingEnabled: false,
    qnaEnabled: false,
    pollsEnabled: false,
    chatEnabled: true,
    waitingRoomEnabled: false,
    createdAt: '2024-03-10'
  }
]

const mockRegistrations: Registration[] = [
  { id: 'r1', webinarId: 'w1', name: 'John Smith', email: 'john@company.com', company: 'Acme Inc', jobTitle: 'CTO', status: 'approved', registeredAt: '2024-03-05', source: 'landing_page' },
  { id: 'r2', webinarId: 'w1', name: 'Jane Doe', email: 'jane@startup.io', company: 'Startup.io', jobTitle: 'Product Manager', status: 'approved', registeredAt: '2024-03-06', source: 'email_campaign' },
  { id: 'r3', webinarId: 'w1', name: 'Bob Wilson', email: 'bob@enterprise.com', company: 'Enterprise Corp', jobTitle: 'VP Engineering', status: 'pending', registeredAt: '2024-03-08', source: 'organic' },
  { id: 'r4', webinarId: 'w2', name: 'Alice Brown', email: 'alice@tech.co', company: 'Tech Co', status: 'attended', registeredAt: '2024-03-01', attendedAt: '2024-03-12T10:02:00Z', leftAt: '2024-03-12T11:28:00Z', duration: 86 },
  { id: 'r5', webinarId: 'w2', name: 'Charlie Davis', email: 'charlie@agency.com', status: 'attended', registeredAt: '2024-03-02', attendedAt: '2024-03-12T10:05:00Z', duration: 85 },
  { id: 'r6', webinarId: 'w3', name: 'Diana Lee', email: 'diana@company.com', status: 'attended', registeredAt: '2024-02-25', attendedAt: '2024-03-05T15:00:00Z', leftAt: '2024-03-05T15:45:00Z', duration: 45 },
  { id: 'r7', webinarId: 'w3', name: 'Edward King', email: 'edward@firm.com', status: 'no_show', registeredAt: '2024-02-26' }
]

const mockRecordings: Recording[] = [
  { id: 'rec1', webinarId: 'w3', webinarTitle: 'Q1 Product Demo', type: 'video', status: 'ready', duration: 2700, size: 456000000, views: 189, downloadCount: 45, url: 'https://example.com/recording1.mp4', createdAt: '2024-03-05', expiresAt: '2024-06-05' },
  { id: 'rec2', webinarId: 'w3', webinarTitle: 'Q1 Product Demo', type: 'audio', status: 'ready', duration: 2700, size: 45000000, views: 23, downloadCount: 12, url: 'https://example.com/recording1.mp3', createdAt: '2024-03-05', expiresAt: '2024-06-05' },
  { id: 'rec3', webinarId: 'w3', webinarTitle: 'Q1 Product Demo', type: 'transcript', status: 'ready', duration: 0, size: 125000, views: 56, downloadCount: 34, url: 'https://example.com/transcript1.txt', createdAt: '2024-03-05' },
  { id: 'rec4', webinarId: 'w2', webinarTitle: 'Customer Success Workshop', type: 'video', status: 'processing', duration: 5400, size: 0, views: 0, downloadCount: 0, createdAt: '2024-03-12' }
]

const mockTemplates: EmailTemplate[] = [
  { id: 't1', name: 'Registration Confirmation', type: 'confirmation', subject: 'You\'re registered for {{webinar_title}}!', enabled: true },
  { id: 't2', name: '24 Hour Reminder', type: 'reminder', subject: 'Reminder: {{webinar_title}} starts tomorrow', enabled: true, sendTime: '24h' },
  { id: 't3', name: '1 Hour Reminder', type: 'reminder', subject: '{{webinar_title}} starts in 1 hour', enabled: true, sendTime: '1h' },
  { id: 't4', name: 'Follow Up Email', type: 'follow_up', subject: 'Thank you for attending {{webinar_title}}', enabled: true },
  { id: 't5', name: 'Cancellation Notice', type: 'cancellation', subject: '{{webinar_title}} has been cancelled', enabled: true }
]

const mockPolls: Poll[] = [
  { id: 'poll1', question: 'What feature are you most excited about?', options: [{ id: 'o1', text: 'AI Assistant', votes: 45 }, { id: 'o2', text: 'Automation', votes: 32 }, { id: 'o3', text: 'Analytics', votes: 28 }], status: 'ended', createdAt: '2024-03-05' },
  { id: 'poll2', question: 'How would you rate this webinar?', options: [{ id: 'o1', text: 'Excellent', votes: 78 }, { id: 'o2', text: 'Good', votes: 45 }, { id: 'o3', text: 'Average', votes: 12 }, { id: 'o4', text: 'Poor', votes: 3 }], status: 'ended', createdAt: '2024-03-05' }
]

const mockQA: QAItem[] = [
  { id: 'qa1', question: 'When will this feature be available?', askedBy: 'John S.', askedAt: '2024-03-05T15:15:00Z', answer: 'We expect to release it by end of Q2.', answeredBy: 'Sarah Chen', answeredAt: '2024-03-05T15:17:00Z', upvotes: 23, status: 'answered' },
  { id: 'qa2', question: 'Does this integrate with Salesforce?', askedBy: 'Jane D.', askedAt: '2024-03-05T15:20:00Z', answer: 'Yes, we have native Salesforce integration.', answeredBy: 'Mike Johnson', answeredAt: '2024-03-05T15:22:00Z', upvotes: 18, status: 'answered' },
  { id: 'qa3', question: 'What about enterprise pricing?', askedBy: 'Bob W.', askedAt: '2024-03-05T15:25:00Z', upvotes: 12, status: 'pending' }
]

// Helper Functions
const getStatusColor = (status: WebinarStatus) => {
  switch (status) {
    case 'live': return 'bg-red-100 text-red-800 border-red-200'
    case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'ended': return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'cancelled': return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getTypeIcon = (type: WebinarType) => {
  switch (type) {
    case 'webinar': return <Video className="w-4 h-4" />
    case 'meeting': return <Users className="w-4 h-4" />
    case 'training': return <Presentation className="w-4 h-4" />
    case 'demo': return <MonitorPlay className="w-4 h-4" />
    case 'conference': return <Globe className="w-4 h-4" />
    default: return <Video className="w-4 h-4" />
  }
}

const getRegistrationStatusColor = (status: RegistrationStatus) => {
  switch (status) {
    case 'approved': return 'bg-green-100 text-green-800 border-green-200'
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'declined': return 'bg-red-100 text-red-800 border-red-200'
    case 'attended': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'no_show': return 'bg-gray-100 text-gray-800 border-gray-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export default function WebinarsClient() {
  const [activeTab, setActiveTab] = useState('webinars')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<WebinarStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<WebinarType | 'all'>('all')
  const [selectedWebinar, setSelectedWebinar] = useState<Webinar | null>(null)

  // Calculate stats
  const stats: WebinarStats = useMemo(() => ({
    totalWebinars: mockWebinars.length,
    scheduledWebinars: mockWebinars.filter(w => w.status === 'scheduled').length,
    liveNow: mockWebinars.filter(w => w.status === 'live').length,
    endedWebinars: mockWebinars.filter(w => w.status === 'ended').length,
    totalRegistrations: mockWebinars.reduce((sum, w) => sum + w.registeredCount, 0),
    totalAttendees: mockWebinars.reduce((sum, w) => sum + w.attendedCount, 0),
    avgAttendanceRate: mockWebinars.filter(w => w.registeredCount > 0).reduce((sum, w) => sum + (w.attendedCount / w.registeredCount * 100), 0) / mockWebinars.filter(w => w.registeredCount > 0).length || 0,
    avgDuration: mockWebinars.reduce((sum, w) => sum + w.duration, 0) / mockWebinars.length
  }), [])

  // Filter webinars
  const filteredWebinars = useMemo(() => {
    return mockWebinars.filter(webinar => {
      const matchesSearch = webinar.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        webinar.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || webinar.status === statusFilter
      const matchesType = typeFilter === 'all' || webinar.type === typeFilter
      return matchesSearch && matchesStatus && matchesType
    })
  }, [searchQuery, statusFilter, typeFilter])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Webinars Hub
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Host engaging virtual events
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" />
              View Calendar
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Plus className="w-4 h-4" />
              Schedule Webinar
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Video className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-gray-500">Total</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalWebinars}</p>
              <p className="text-xs text-purple-600">Webinars</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Radio className="w-4 h-4 text-red-600 animate-pulse" />
                <span className="text-xs text-gray-500">Live Now</span>
              </div>
              <p className="text-2xl font-bold">{stats.liveNow}</p>
              <p className="text-xs text-red-600">Broadcasting</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-gray-500">Scheduled</span>
              </div>
              <p className="text-2xl font-bold">{stats.scheduledWebinars}</p>
              <p className="text-xs text-blue-600">Upcoming</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-500">Completed</span>
              </div>
              <p className="text-2xl font-bold">{stats.endedWebinars}</p>
              <p className="text-xs text-green-600">Ended</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <UserPlus className="w-4 h-4 text-orange-600" />
                <span className="text-xs text-gray-500">Registrations</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalRegistrations.toLocaleString()}</p>
              <p className="text-xs text-orange-600">+156 this week</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className="w-4 h-4 text-cyan-600" />
                <span className="text-xs text-gray-500">Attendees</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalAttendees.toLocaleString()}</p>
              <p className="text-xs text-cyan-600">Total</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span className="text-xs text-gray-500">Attendance</span>
              </div>
              <p className="text-2xl font-bold">{stats.avgAttendanceRate.toFixed(0)}%</p>
              <p className="text-xs text-emerald-600">Average rate</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Timer className="w-4 h-4 text-pink-600" />
                <span className="text-xs text-gray-500">Avg Duration</span>
              </div>
              <p className="text-2xl font-bold">{formatDuration(stats.avgDuration)}</p>
              <p className="text-xs text-pink-600">Per webinar</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 p-1 shadow-sm">
            <TabsTrigger value="webinars" className="gap-2">
              <Video className="w-4 h-4" />
              Webinars
            </TabsTrigger>
            <TabsTrigger value="registrations" className="gap-2">
              <Users className="w-4 h-4" />
              Registrations
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="recordings" className="gap-2">
              <PlayCircle className="w-4 h-4" />
              Recordings
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <Mail className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Webinars Tab */}
          <TabsContent value="webinars" className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search webinars..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as WebinarStatus | 'all')}
                className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800"
              >
                <option value="all">All Status</option>
                <option value="live">Live</option>
                <option value="scheduled">Scheduled</option>
                <option value="ended">Ended</option>
                <option value="draft">Draft</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as WebinarType | 'all')}
                className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800"
              >
                <option value="all">All Types</option>
                <option value="webinar">Webinar</option>
                <option value="training">Training</option>
                <option value="demo">Demo</option>
                <option value="conference">Conference</option>
              </select>
            </div>

            <div className="grid gap-4">
              {filteredWebinars.map((webinar) => (
                <Card key={webinar.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedWebinar(webinar)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {webinar.status === 'live' && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-red-100 rounded text-xs text-red-700">
                              <Radio className="w-3 h-3 animate-pulse" />
                              LIVE
                            </span>
                          )}
                          <h3 className="text-lg font-semibold">{webinar.title}</h3>
                          <Badge className={getStatusColor(webinar.status)}>
                            {webinar.status}
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            {getTypeIcon(webinar.type)}
                            {webinar.type}
                          </Badge>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                          {webinar.description}
                        </p>

                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{formatDate(webinar.scheduledDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{formatDuration(webinar.duration)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span>{webinar.registeredCount} / {webinar.maxParticipants}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-5 h-5">
                              <AvatarFallback className="text-xs">{webinar.host.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <span>{webinar.host.name}</span>
                          </div>
                        </div>

                        {/* Features */}
                        <div className="flex items-center gap-2 mt-3">
                          {webinar.recordingEnabled && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <PlayCircle className="w-3 h-3" />
                              Recording
                            </Badge>
                          )}
                          {webinar.qnaEnabled && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <HelpCircle className="w-3 h-3" />
                              Q&A
                            </Badge>
                          )}
                          {webinar.pollsEnabled && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <BarChart2 className="w-3 h-3" />
                              Polls
                            </Badge>
                          )}
                          {webinar.chatEnabled && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <MessageCircle className="w-3 h-3" />
                              Chat
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {webinar.status === 'scheduled' && (
                          <Button variant="default" size="sm" className="gap-1 bg-red-600 hover:bg-red-700">
                            <Play className="w-4 h-4" />
                            Start
                          </Button>
                        )}
                        {webinar.status === 'live' && (
                          <Button variant="default" size="sm" className="gap-1 bg-red-600 hover:bg-red-700">
                            <Video className="w-4 h-4" />
                            Join
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Registrations Tab */}
          <TabsContent value="registrations" className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search registrations..." className="pl-9" />
              </div>
              <select className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800">
                <option value="all">All Webinars</option>
                {mockWebinars.map(w => (
                  <option key={w.id} value={w.id}>{w.title}</option>
                ))}
              </select>
              <select className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800">
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="attended">Attended</option>
                <option value="no_show">No Show</option>
              </select>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registrant</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {mockRegistrations.map((reg) => (
                        <tr key={reg.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback>{reg.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{reg.name}</p>
                                <p className="text-xs text-gray-500">{reg.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm">{reg.company || '-'}</p>
                            <p className="text-xs text-gray-500">{reg.jobTitle || ''}</p>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={getRegistrationStatusColor(reg.status)}>
                              {reg.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {reg.registeredAt}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {reg.duration ? `${reg.duration}m` : '-'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Mail className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Attendance Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Attendance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockWebinars.filter(w => w.status === 'ended').map((webinar) => {
                      const rate = (webinar.attendedCount / webinar.registeredCount) * 100
                      return (
                        <div key={webinar.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium truncate">{webinar.title}</span>
                            <span className="text-sm text-green-600">{rate.toFixed(0)}%</span>
                          </div>
                          <Progress value={rate} className="h-2" />
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{webinar.attendedCount} attended</span>
                            <span>{webinar.registeredCount} registered</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Poll Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Poll Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {mockPolls.map((poll) => (
                      <div key={poll.id}>
                        <p className="font-medium mb-3">{poll.question}</p>
                        <div className="space-y-2">
                          {poll.options.map((option) => {
                            const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0)
                            const percentage = (option.votes / totalVotes) * 100
                            return (
                              <div key={option.id}>
                                <div className="flex items-center justify-between text-sm mb-1">
                                  <span>{option.text}</span>
                                  <span>{percentage.toFixed(0)}%</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Q&A Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Q&A Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockQA.map((qa) => (
                      <div key={qa.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium">{qa.question}</p>
                          <Badge className={qa.status === 'answered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {qa.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">Asked by {qa.askedBy}</p>
                        {qa.answer && (
                          <p className="text-sm border-l-2 border-purple-300 pl-3 text-gray-700 dark:text-gray-300">
                            {qa.answer}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <ThumbsUp className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{qa.upvotes} upvotes</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Engagement Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Engagement Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                      <p className="text-3xl font-bold text-purple-600">85%</p>
                      <p className="text-sm text-gray-500">Avg Attendance Rate</p>
                    </div>
                    <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg text-center">
                      <p className="text-3xl font-bold text-pink-600">4.5</p>
                      <p className="text-sm text-gray-500">Avg Rating</p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                      <p className="text-3xl font-bold text-blue-600">23</p>
                      <p className="text-sm text-gray-500">Avg Questions</p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                      <p className="text-3xl font-bold text-green-600">67%</p>
                      <p className="text-sm text-gray-500">Poll Participation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recordings Tab */}
          <TabsContent value="recordings" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search recordings..." className="pl-9" />
              </div>
              <div className="flex items-center gap-2">
                <select className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800">
                  <option value="all">All Types</option>
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                  <option value="transcript">Transcript</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4">
              {mockRecordings.map((recording) => (
                <Card key={recording.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          recording.type === 'video' ? 'bg-purple-100 text-purple-600' :
                          recording.type === 'audio' ? 'bg-blue-100 text-blue-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {recording.type === 'video' ? <Video className="w-6 h-6" /> :
                           recording.type === 'audio' ? <Headphones className="w-6 h-6" /> :
                           <FileText className="w-6 h-6" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{recording.webinarTitle}</h3>
                            <Badge className={recording.status === 'ready' ? 'bg-green-100 text-green-800' : recording.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                              {recording.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="capitalize">{recording.type}</span>
                            {recording.duration > 0 && <span>{formatDuration(recording.duration / 60)}</span>}
                            <span>{formatBytes(recording.size)}</span>
                            <span>{recording.createdAt}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-medium">{recording.views} views</p>
                          <p className="text-xs text-gray-500">{recording.downloadCount} downloads</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {recording.status === 'ready' && (
                            <>
                              <Button variant="outline" size="sm" className="gap-1">
                                <Play className="w-4 h-4" />
                                Play
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Share2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Email Templates</h3>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Template
              </Button>
            </div>

            <div className="grid gap-4">
              {mockTemplates.map((template) => (
                <Card key={template.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          template.type === 'confirmation' ? 'bg-green-100 text-green-600' :
                          template.type === 'reminder' ? 'bg-blue-100 text-blue-600' :
                          template.type === 'follow_up' ? 'bg-purple-100 text-purple-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{template.name}</h3>
                            <Badge variant="outline" className="capitalize">{template.type.replace('_', ' ')}</Badge>
                            {template.sendTime && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                {template.sendTime} before
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{template.subject}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{template.enabled ? 'Enabled' : 'Disabled'}</span>
                          <input type="checkbox" checked={template.enabled} className="w-5 h-5" readOnly />
                        </div>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Default Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Default Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Registration Required</p>
                      <p className="text-xs text-gray-500">Require registration for new webinars</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable Recording</p>
                      <p className="text-xs text-gray-500">Automatically record all webinars</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable Q&A</p>
                      <p className="text-xs text-gray-500">Allow attendees to ask questions</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable Chat</p>
                      <p className="text-xs text-gray-500">Allow attendee chat</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Waiting Room</p>
                      <p className="text-xs text-gray-500">Hold attendees before start</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>

              {/* Branding */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Branding
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Logo</label>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Upload className="w-6 h-6 text-gray-400" />
                      </div>
                      <Button variant="outline">Upload Logo</Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Brand Color</label>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-600 border-2 border-gray-200" />
                      <Input defaultValue="#9333ea" className="max-w-[150px]" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Custom Domain</label>
                    <Input placeholder="webinars.yourdomain.com" />
                  </div>
                </CardContent>
              </Card>

              {/* Integrations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Integrations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: 'Zoom', description: 'Video conferencing', connected: true, icon: '📹' },
                    { name: 'HubSpot', description: 'Sync registrations to CRM', connected: true, icon: '🔶' },
                    { name: 'Mailchimp', description: 'Email marketing', connected: false, icon: '📧' },
                    { name: 'Slack', description: 'Notifications', connected: true, icon: '💬' }
                  ].map((integration) => (
                    <div key={integration.name} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{integration.icon}</span>
                        <div>
                          <p className="font-medium text-sm">{integration.name}</p>
                          <p className="text-xs text-gray-500">{integration.description}</p>
                        </div>
                      </div>
                      <Button variant={integration.connected ? 'outline' : 'default'} size="sm">
                        {integration.connected ? 'Connected' : 'Connect'}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">New Registration</p>
                      <p className="text-xs text-gray-500">Notify when someone registers</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Webinar Starting</p>
                      <p className="text-xs text-gray-500">Reminder before webinar starts</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Recording Ready</p>
                      <p className="text-xs text-gray-500">Notify when recording is processed</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Weekly Summary</p>
                      <p className="text-xs text-gray-500">Weekly analytics report</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Webinar Detail Dialog */}
        <Dialog open={!!selectedWebinar} onOpenChange={() => setSelectedWebinar(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Video className="w-5 h-5 text-purple-600" />
                {selectedWebinar?.title}
              </DialogTitle>
            </DialogHeader>

            {selectedWebinar && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 flex-wrap">
                  {selectedWebinar.status === 'live' && (
                    <Badge className="bg-red-100 text-red-800 gap-1">
                      <Radio className="w-3 h-3 animate-pulse" />
                      LIVE
                    </Badge>
                  )}
                  <Badge className={getStatusColor(selectedWebinar.status)}>
                    {selectedWebinar.status}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    {getTypeIcon(selectedWebinar.type)}
                    {selectedWebinar.type}
                  </Badge>
                </div>

                <p className="text-gray-600 dark:text-gray-400">
                  {selectedWebinar.description}
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Scheduled</p>
                    <p className="text-lg font-bold">{formatDate(selectedWebinar.scheduledDate)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="text-2xl font-bold">{formatDuration(selectedWebinar.duration)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Registered</p>
                    <p className="text-2xl font-bold">{selectedWebinar.registeredCount}</p>
                    <p className="text-xs text-gray-500">of {selectedWebinar.maxParticipants}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Attended</p>
                    <p className="text-2xl font-bold text-green-600">{selectedWebinar.attendedCount}</p>
                  </div>
                </div>

                {/* Capacity */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Registration Capacity</span>
                    <span>{Math.round((selectedWebinar.registeredCount / selectedWebinar.maxParticipants) * 100)}%</span>
                  </div>
                  <Progress value={(selectedWebinar.registeredCount / selectedWebinar.maxParticipants) * 100} />
                </div>

                {/* Host & Panelists */}
                <div>
                  <h4 className="font-semibold mb-3">Host & Panelists</h4>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">{selectedWebinar.host.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{selectedWebinar.host.name}</span>
                      <Badge className="text-xs">Host</Badge>
                    </div>
                    {selectedWebinar.panelists.map((panelist) => (
                      <div key={panelist.id} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">{panelist.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{panelist.name}</span>
                        <Badge variant="outline" className="text-xs capitalize">{panelist.role}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Links */}
                {selectedWebinar.joinUrl && (
                  <div>
                    <h4 className="font-semibold mb-3">Links</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Link className="w-4 h-4 text-gray-400" />
                        <span className="text-sm flex-1 truncate">{selectedWebinar.joinUrl}</span>
                        <Button variant="ghost" size="sm">
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      {selectedWebinar.registrationUrl && (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <UserPlus className="w-4 h-4 text-gray-400" />
                          <span className="text-sm flex-1 truncate">{selectedWebinar.registrationUrl}</span>
                          <Button variant="ghost" size="sm">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4">
                  {selectedWebinar.status === 'scheduled' && (
                    <Button className="gap-2 bg-red-600 hover:bg-red-700">
                      <Play className="w-4 h-4" />
                      Start Webinar
                    </Button>
                  )}
                  {selectedWebinar.status === 'live' && (
                    <Button className="gap-2 bg-red-600 hover:bg-red-700">
                      <Video className="w-4 h-4" />
                      Join Webinar
                    </Button>
                  )}
                  <Button variant="outline" className="gap-2">
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Users className="w-4 h-4" />
                    View Registrations
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
