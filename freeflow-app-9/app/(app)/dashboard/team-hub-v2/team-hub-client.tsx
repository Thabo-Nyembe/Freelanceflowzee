'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Users,
  Plus,
  Search,
  UserPlus,
  Mail,
  MessageSquare,
  Calendar,
  TrendingUp,
  Award,
  Target,
  Clock,
  Settings,
  BarChart3,
  CheckCircle2,
  Star,
  Hash,
  AtSign,
  Bell,
  Video,
  Phone,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Circle,
  Minus,
  Moon,
  Coffee,
  Zap,
  Shield,
  Crown,
  UserCheck,
  UserX,
  Globe,
  Lock,
  Pin,
  Archive,
  Trash2,
  Edit,
  Copy,
  ExternalLink,
  Folder,
  FileText,
  Image,
  Link2,
  Mic,
  Headphones,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronRight,
  Bookmark,
  Heart,
  ThumbsUp,
  MessageCircle,
  Share2,
  Download
} from 'lucide-react'

// Types
type MemberStatus = 'online' | 'away' | 'dnd' | 'offline'
type MemberRole = 'owner' | 'admin' | 'member' | 'guest'
type ChannelType = 'public' | 'private' | 'direct'
type MessageType = 'text' | 'file' | 'image' | 'system'
type ActivityType = 'message' | 'mention' | 'reaction' | 'join' | 'leave' | 'file'

interface TeamMember {
  id: string
  name: string
  email: string
  avatar: string
  role: MemberRole
  jobTitle: string
  department: string
  status: MemberStatus
  statusMessage: string
  timezone: string
  joinedAt: string
  lastActive: string
  tasksCompleted: number
  projectsCount: number
  performanceScore: number
  isLead: boolean
}

interface Channel {
  id: string
  name: string
  type: ChannelType
  description: string
  memberCount: number
  unreadCount: number
  isPinned: boolean
  isArchived: boolean
  lastMessage: string
  lastMessageAt: string
  createdBy: string
}

interface Message {
  id: string
  content: string
  type: MessageType
  senderId: string
  senderName: string
  senderAvatar: string
  channelId: string
  timestamp: string
  reactions: Reaction[]
  replies: number
  isPinned: boolean
  attachments: Attachment[]
}

interface Reaction {
  emoji: string
  count: number
  users: string[]
}

interface Attachment {
  id: string
  name: string
  type: string
  size: number
  url: string
}

interface Activity {
  id: string
  type: ActivityType
  userId: string
  userName: string
  userAvatar: string
  content: string
  timestamp: string
  channelName: string
}

interface Meeting {
  id: string
  title: string
  startTime: string
  duration: number
  participants: string[]
  isRecurring: boolean
  type: 'video' | 'audio' | 'in-person'
}

// Mock Data
const mockMembers: TeamMember[] = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah@example.com', avatar: '/avatars/sarah.jpg', role: 'owner', jobTitle: 'CEO', department: 'Executive', status: 'online', statusMessage: 'Working on Q1 strategy', timezone: 'America/New_York', joinedAt: '2022-01-15', lastActive: '2024-01-15T12:30:00Z', tasksCompleted: 156, projectsCount: 12, performanceScore: 98, isLead: true },
  { id: '2', name: 'Mike Chen', email: 'mike@example.com', avatar: '/avatars/mike.jpg', role: 'admin', jobTitle: 'CTO', department: 'Engineering', status: 'online', statusMessage: 'In a meeting', timezone: 'America/Los_Angeles', joinedAt: '2022-02-20', lastActive: '2024-01-15T12:25:00Z', tasksCompleted: 234, projectsCount: 8, performanceScore: 95, isLead: true },
  { id: '3', name: 'Emily Davis', email: 'emily@example.com', avatar: '/avatars/emily.jpg', role: 'admin', jobTitle: 'Design Lead', department: 'Design', status: 'away', statusMessage: 'Coffee break ☕', timezone: 'Europe/London', joinedAt: '2022-03-10', lastActive: '2024-01-15T12:00:00Z', tasksCompleted: 189, projectsCount: 15, performanceScore: 92, isLead: true },
  { id: '4', name: 'Alex Rivera', email: 'alex@example.com', avatar: '/avatars/alex.jpg', role: 'member', jobTitle: 'Senior Developer', department: 'Engineering', status: 'dnd', statusMessage: 'Deep work until 3pm', timezone: 'America/Chicago', joinedAt: '2022-05-15', lastActive: '2024-01-15T11:45:00Z', tasksCompleted: 312, projectsCount: 6, performanceScore: 94, isLead: false },
  { id: '5', name: 'Jordan Lee', email: 'jordan@example.com', avatar: '/avatars/jordan.jpg', role: 'member', jobTitle: 'Product Manager', department: 'Product', status: 'online', statusMessage: '', timezone: 'America/New_York', joinedAt: '2022-06-20', lastActive: '2024-01-15T12:28:00Z', tasksCompleted: 145, projectsCount: 4, performanceScore: 88, isLead: false },
  { id: '6', name: 'Chris Taylor', email: 'chris@example.com', avatar: '/avatars/chris.jpg', role: 'member', jobTitle: 'Marketing Manager', department: 'Marketing', status: 'offline', statusMessage: '', timezone: 'Europe/Paris', joinedAt: '2022-08-01', lastActive: '2024-01-14T18:00:00Z', tasksCompleted: 98, projectsCount: 3, performanceScore: 85, isLead: false },
  { id: '7', name: 'Sam Wilson', email: 'sam@example.com', avatar: '/avatars/sam.jpg', role: 'guest', jobTitle: 'Contractor', department: 'Engineering', status: 'online', statusMessage: 'Available for questions', timezone: 'Asia/Tokyo', joinedAt: '2024-01-01', lastActive: '2024-01-15T12:20:00Z', tasksCompleted: 23, projectsCount: 1, performanceScore: 90, isLead: false }
]

const mockChannels: Channel[] = [
  { id: '1', name: 'general', type: 'public', description: 'Company-wide announcements', memberCount: 45, unreadCount: 3, isPinned: true, isArchived: false, lastMessage: 'Welcome to the new quarter!', lastMessageAt: '2024-01-15T12:00:00Z', createdBy: 'Sarah Johnson' },
  { id: '2', name: 'engineering', type: 'public', description: 'Engineering team discussions', memberCount: 18, unreadCount: 12, isPinned: true, isArchived: false, lastMessage: 'PR review needed for feature branch', lastMessageAt: '2024-01-15T12:25:00Z', createdBy: 'Mike Chen' },
  { id: '3', name: 'design', type: 'public', description: 'Design team collaboration', memberCount: 8, unreadCount: 5, isPinned: false, isArchived: false, lastMessage: 'New mockups ready for review', lastMessageAt: '2024-01-15T11:30:00Z', createdBy: 'Emily Davis' },
  { id: '4', name: 'product', type: 'public', description: 'Product discussions and roadmap', memberCount: 12, unreadCount: 0, isPinned: false, isArchived: false, lastMessage: 'Q2 roadmap draft shared', lastMessageAt: '2024-01-15T10:00:00Z', createdBy: 'Jordan Lee' },
  { id: '5', name: 'leadership', type: 'private', description: 'Leadership team only', memberCount: 5, unreadCount: 2, isPinned: true, isArchived: false, lastMessage: 'Budget review meeting tomorrow', lastMessageAt: '2024-01-15T09:00:00Z', createdBy: 'Sarah Johnson' },
  { id: '6', name: 'random', type: 'public', description: 'Water cooler chat', memberCount: 42, unreadCount: 8, isPinned: false, isArchived: false, lastMessage: 'Anyone tried the new coffee machine?', lastMessageAt: '2024-01-15T12:15:00Z', createdBy: 'Chris Taylor' }
]

const mockMessages: Message[] = [
  { id: '1', content: 'Hey team! Just pushed the new feature to staging. Can someone review?', type: 'text', senderId: '4', senderName: 'Alex Rivera', senderAvatar: '/avatars/alex.jpg', channelId: '2', timestamp: '2024-01-15T12:25:00Z', reactions: [{ emoji: '👍', count: 3, users: ['1', '2', '5'] }, { emoji: '🎉', count: 2, users: ['3', '6'] }], replies: 4, isPinned: false, attachments: [] },
  { id: '2', content: 'On it! Will check in 10 minutes.', type: 'text', senderId: '2', senderName: 'Mike Chen', senderAvatar: '/avatars/mike.jpg', channelId: '2', timestamp: '2024-01-15T12:26:00Z', reactions: [], replies: 0, isPinned: false, attachments: [] },
  { id: '3', content: 'New design mockups for the dashboard', type: 'file', senderId: '3', senderName: 'Emily Davis', senderAvatar: '/avatars/emily.jpg', channelId: '3', timestamp: '2024-01-15T11:30:00Z', reactions: [{ emoji: '❤️', count: 5, users: ['1', '2', '4', '5', '6'] }], replies: 8, isPinned: true, attachments: [{ id: '1', name: 'dashboard-v2.fig', type: 'figma', size: 2500000, url: '/files/dashboard.fig' }] },
  { id: '4', content: 'Reminder: All-hands meeting at 3pm EST', type: 'system', senderId: '1', senderName: 'Sarah Johnson', senderAvatar: '/avatars/sarah.jpg', channelId: '1', timestamp: '2024-01-15T12:00:00Z', reactions: [{ emoji: '✅', count: 12, users: [] }], replies: 2, isPinned: true, attachments: [] }
]

const mockActivities: Activity[] = [
  { id: '1', type: 'message', userId: '4', userName: 'Alex Rivera', userAvatar: '/avatars/alex.jpg', content: 'Posted in #engineering', timestamp: '2024-01-15T12:25:00Z', channelName: 'engineering' },
  { id: '2', type: 'mention', userId: '2', userName: 'Mike Chen', userAvatar: '/avatars/mike.jpg', content: 'Mentioned you in a reply', timestamp: '2024-01-15T12:20:00Z', channelName: 'engineering' },
  { id: '3', type: 'reaction', userId: '3', userName: 'Emily Davis', userAvatar: '/avatars/emily.jpg', content: 'Reacted with ❤️ to your message', timestamp: '2024-01-15T12:15:00Z', channelName: 'design' },
  { id: '4', type: 'join', userId: '7', userName: 'Sam Wilson', userAvatar: '/avatars/sam.jpg', content: 'Joined #engineering', timestamp: '2024-01-15T10:00:00Z', channelName: 'engineering' },
  { id: '5', type: 'file', userId: '3', userName: 'Emily Davis', userAvatar: '/avatars/emily.jpg', content: 'Shared a file in #design', timestamp: '2024-01-15T11:30:00Z', channelName: 'design' }
]

const mockMeetings: Meeting[] = [
  { id: '1', title: 'All-Hands Meeting', startTime: '2024-01-15T15:00:00Z', duration: 60, participants: ['1', '2', '3', '4', '5', '6', '7'], isRecurring: true, type: 'video' },
  { id: '2', title: 'Engineering Standup', startTime: '2024-01-16T09:00:00Z', duration: 15, participants: ['2', '4', '7'], isRecurring: true, type: 'video' },
  { id: '3', title: 'Design Review', startTime: '2024-01-16T14:00:00Z', duration: 45, participants: ['3', '5'], isRecurring: false, type: 'video' }
]

export default function TeamHubClient() {
  const [members] = useState<TeamMember[]>(mockMembers)
  const [channels] = useState<Channel[]>(mockChannels)
  const [messages] = useState<Message[]>(mockMessages)
  const [activities] = useState<Activity[]>(mockActivities)
  const [meetings] = useState<Meeting[]>(mockMeetings)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [statusFilter, setStatusFilter] = useState<MemberStatus | 'all'>('all')
  const [roleFilter, setRoleFilter] = useState<MemberRole | 'all'>('all')

  // Stats
  const stats = useMemo(() => {
    const totalMembers = members.length
    const onlineMembers = members.filter(m => m.status === 'online').length
    const awayMembers = members.filter(m => m.status === 'away').length
    const totalChannels = channels.length
    const unreadMessages = channels.reduce((sum, c) => sum + c.unreadCount, 0)
    const avgPerformance = members.reduce((sum, m) => sum + m.performanceScore, 0) / members.length
    const totalTasks = members.reduce((sum, m) => sum + m.tasksCompleted, 0)
    const leads = members.filter(m => m.isLead).length
    return { totalMembers, onlineMembers, awayMembers, totalChannels, unreadMessages, avgPerformance, totalTasks, leads }
  }, [members, channels])

  // Filtered members
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.department.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter
      const matchesRole = roleFilter === 'all' || member.role === roleFilter
      return matchesSearch && matchesStatus && matchesRole
    })
  }, [members, searchQuery, statusFilter, roleFilter])

  // Helper functions
  const getStatusColor = (status: MemberStatus) => {
    const colors: Record<MemberStatus, string> = {
      online: 'bg-green-500',
      away: 'bg-yellow-500',
      dnd: 'bg-red-500',
      offline: 'bg-gray-400'
    }
    return colors[status]
  }

  const getStatusIcon = (status: MemberStatus) => {
    const icons: Record<MemberStatus, React.ReactNode> = {
      online: <Circle className="w-3 h-3 fill-current" />,
      away: <Clock className="w-3 h-3" />,
      dnd: <Minus className="w-3 h-3" />,
      offline: <Circle className="w-3 h-3" />
    }
    return icons[status]
  }

  const getRoleColor = (role: MemberRole) => {
    const colors: Record<MemberRole, string> = {
      owner: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      member: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      guest: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    }
    return colors[role]
  }

  const getRoleIcon = (role: MemberRole) => {
    const icons: Record<MemberRole, React.ReactNode> = {
      owner: <Crown className="w-3 h-3" />,
      admin: <Shield className="w-3 h-3" />,
      member: <UserCheck className="w-3 h-3" />,
      guest: <Globe className="w-3 h-3" />
    }
    return icons[role]
  }

  const getChannelIcon = (type: ChannelType) => {
    const icons: Record<ChannelType, React.ReactNode> = {
      public: <Hash className="w-4 h-4" />,
      private: <Lock className="w-4 h-4" />,
      direct: <MessageSquare className="w-4 h-4" />
    }
    return icons[type]
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  const statCards = [
    { label: 'Team Members', value: stats.totalMembers.toString(), change: 8.3, icon: Users, color: 'from-green-500 to-emerald-500' },
    { label: 'Online Now', value: stats.onlineMembers.toString(), change: 15.2, icon: Circle, color: 'from-blue-500 to-cyan-500' },
    { label: 'Channels', value: stats.totalChannels.toString(), change: 5.0, icon: Hash, color: 'from-purple-500 to-pink-500' },
    { label: 'Unread', value: stats.unreadMessages.toString(), change: -12.5, icon: MessageSquare, color: 'from-orange-500 to-amber-500' },
    { label: 'Avg Performance', value: `${stats.avgPerformance.toFixed(0)}%`, change: 3.8, icon: TrendingUp, color: 'from-indigo-500 to-violet-500' },
    { label: 'Tasks Done', value: stats.totalTasks.toString(), change: 22.1, icon: CheckCircle2, color: 'from-rose-500 to-red-500' },
    { label: 'Team Leads', value: stats.leads.toString(), change: 0, icon: Crown, color: 'from-yellow-500 to-orange-500' },
    { label: 'Meetings Today', value: meetings.length.toString(), change: 0, icon: Video, color: 'from-teal-500 to-green-500' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/30 to-teal-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Hub</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Slack-level team collaboration</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search members, channels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="icon">
              <Bell className="w-4 h-4" />
            </Button>
            <Button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Member
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  {stat.change !== 0 && (
                    <div className={`flex items-center gap-1 text-xs ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {Math.abs(stat.change)}%
                    </div>
                  )}
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="members" className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 shadow-sm">
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Members
            </TabsTrigger>
            <TabsTrigger value="channels" className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Channels
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="meetings" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Meetings
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All ({members.length})
              </Button>
              {(['online', 'away', 'dnd', 'offline'] as MemberStatus[]).map(status => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  <span className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(status)}`} />
                  {status.charAt(0).toUpperCase() + status.slice(1)} ({members.filter(m => m.status === status).length})
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map(member => (
                <Card key={member.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedMember(member)}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <Avatar className="w-14 h-14">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(member.status)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white truncate">{member.name}</h4>
                          {member.isLead && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                        </div>
                        <p className="text-sm text-gray-500">{member.jobTitle}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getRoleColor(member.role)}>
                            {getRoleIcon(member.role)}
                            <span className="ml-1">{member.role}</span>
                          </Badge>
                          <Badge variant="secondary">{member.department}</Badge>
                        </div>
                      </div>
                    </div>

                    {member.statusMessage && (
                      <p className="text-sm text-gray-500 mt-3 italic">"{member.statusMessage}"</p>
                    )}

                    <div className="grid grid-cols-3 gap-2 mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-center">
                        <p className="text-lg font-bold">{member.tasksCompleted}</p>
                        <p className="text-xs text-gray-500">Tasks</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold">{member.projectsCount}</p>
                        <p className="text-xs text-gray-500">Projects</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-600">{member.performanceScore}%</p>
                        <p className="text-xs text-gray-500">Score</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Message
                      </Button>
                      <Button variant="outline" size="sm">
                        <Video className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Channels Tab */}
          <TabsContent value="channels" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Channels</h3>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Channel
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {channels.map(channel => (
                <Card key={channel.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedChannel(channel)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getChannelIcon(channel.type)}
                        <h4 className="font-semibold">{channel.name}</h4>
                        {channel.isPinned && <Pin className="w-3 h-3 text-yellow-500" />}
                      </div>
                      {channel.unreadCount > 0 && (
                        <Badge className="bg-red-500 text-white">{channel.unreadCount}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{channel.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{channel.memberCount} members</span>
                      <span>{formatTimeAgo(channel.lastMessageAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Recent Messages</CardTitle>
                <CardDescription>Latest conversations across channels</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {messages.map(message => (
                      <div key={message.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                        <Avatar>
                          <AvatarImage src={message.senderAvatar} />
                          <AvatarFallback>{message.senderName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{message.senderName}</span>
                            <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                            {message.isPinned && <Pin className="w-3 h-3 text-yellow-500" />}
                          </div>
                          <p className="text-gray-700 dark:text-gray-300">{message.content}</p>
                          {message.attachments.length > 0 && (
                            <div className="flex items-center gap-2 mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                              <FileText className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">{message.attachments[0].name}</span>
                            </div>
                          )}
                          {message.reactions.length > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                              {message.reactions.map((reaction, i) => (
                                <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                                  {reaction.emoji} {reaction.count}
                                </span>
                              ))}
                            </div>
                          )}
                          {message.replies > 0 && (
                            <button className="text-sm text-blue-600 mt-2 hover:underline">
                              {message.replies} replies
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map(activity => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={activity.userAvatar} />
                        <AvatarFallback>{activity.userName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-semibold">{activity.userName}</span>
                          {' '}{activity.content}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <span>{formatTimeAgo(activity.timestamp)}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Hash className="w-3 h-3" />
                            {activity.channelName}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Meetings Tab */}
          <TabsContent value="meetings" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Upcoming Meetings</h3>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Schedule Meeting
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {meetings.map(meeting => (
                <Card key={meeting.id} className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${meeting.type === 'video' ? 'bg-blue-100' : meeting.type === 'audio' ? 'bg-green-100' : 'bg-purple-100'}`}>
                          {meeting.type === 'video' ? <Video className="w-5 h-5 text-blue-600" /> :
                           meeting.type === 'audio' ? <Phone className="w-5 h-5 text-green-600" /> :
                           <Users className="w-5 h-5 text-purple-600" />}
                        </div>
                        <div>
                          <h4 className="font-semibold">{meeting.title}</h4>
                          <p className="text-sm text-gray-500">{formatTime(meeting.startTime)} • {meeting.duration}min</p>
                        </div>
                      </div>
                      {meeting.isRecurring && <Badge variant="secondary">Recurring</Badge>}
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex -space-x-2">
                        {meeting.participants.slice(0, 4).map((pId, i) => {
                          const member = members.find(m => m.id === pId)
                          return (
                            <Avatar key={i} className="w-8 h-8 border-2 border-white">
                              <AvatarImage src={member?.avatar} />
                              <AvatarFallback className="text-xs">{member?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                          )
                        })}
                      </div>
                      {meeting.participants.length > 4 && (
                        <span className="text-sm text-gray-500">+{meeting.participants.length - 4} more</span>
                      )}
                    </div>
                    <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                      Join Meeting
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Team Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {members.sort((a, b) => b.performanceScore - a.performanceScore).slice(0, 5).map((member, i) => (
                      <div key={member.id} className="flex items-center gap-4">
                        <span className="text-lg font-bold text-gray-400 w-6">{i + 1}</span>
                        <Avatar>
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{member.name}</p>
                          <Progress value={member.performanceScore} className="h-2 mt-1" />
                        </div>
                        <span className="font-bold text-green-600">{member.performanceScore}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Department Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['Engineering', 'Design', 'Product', 'Marketing', 'Executive'].map(dept => {
                      const deptMembers = members.filter(m => m.department === dept)
                      return (
                        <div key={dept} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                              {deptMembers.length}
                            </div>
                            <span className="font-medium">{dept}</span>
                          </div>
                          <div className="flex -space-x-2">
                            {deptMembers.slice(0, 3).map((m, i) => (
                              <Avatar key={i} className="w-8 h-8 border-2 border-white">
                                <AvatarImage src={m.avatar} />
                                <AvatarFallback className="text-xs">{m.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Member Detail Dialog */}
        <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Team Member</DialogTitle>
            </DialogHeader>
            {selectedMember && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={selectedMember.avatar} />
                      <AvatarFallback>{selectedMember.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${getStatusColor(selectedMember.status)}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedMember.name}</h3>
                    <p className="text-gray-500">{selectedMember.jobTitle}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getRoleColor(selectedMember.role)}>{selectedMember.role}</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-center">
                    <p className="text-xl font-bold">{selectedMember.tasksCompleted}</p>
                    <p className="text-xs text-gray-500">Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">{selectedMember.projectsCount}</p>
                    <p className="text-xs text-gray-500">Projects</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-green-600">{selectedMember.performanceScore}%</p>
                    <p className="text-xs text-gray-500">Score</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{selectedMember.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span>{selectedMember.timezone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Joined {formatDate(selectedMember.joinedAt)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Button variant="outline">
                    <Video className="w-4 h-4 mr-2" />
                    Call
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
