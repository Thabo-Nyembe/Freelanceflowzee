'use client'

import { useState, useMemo, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import {
  MessageSquare, Plus, Search, Hash, Lock, Users, Settings, Bell, BellOff,
  Star, StarOff, Pin, Bookmark, MoreHorizontal, Send, Smile, Paperclip,
  AtSign, Image, FileText, Video, Phone, ChevronDown, ChevronRight, Circle,
  Clock, Check, CheckCheck, Reply, Forward, Edit, Trash2, Copy, ExternalLink,
  Filter, Archive, Inbox, Download, Upload, Mic, MicOff, Headphones, Volume2,
  MoreVertical, X, Maximize2, Minimize2, MessageCircle, ThumbsUp, Heart,
  Laugh, Frown, Eye, EyeOff, UserPlus, LogOut, Zap, Bot, Workflow, Code,
  Link2, Calendar, AlertCircle, ArrowUpRight, ArrowDownRight, TrendingUp,
  FolderOpen, Files, Sparkles, Globe, Moon, Sun, Palette, Shield, Key,
  RefreshCw, Megaphone, PhoneCall, PhoneOff, ScreenShare, Layers, PlayCircle,
  PauseCircle, StopCircle, Radio, Voicemail, BookOpen, HelpCircle, Cog,
  Webhook, HardDrive, AlertOctagon, CreditCard, Sliders
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Types
type ChannelType = 'public' | 'private' | 'direct' | 'group'
type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
type UserStatus = 'online' | 'away' | 'dnd' | 'offline'
type ReactionType = 'thumbsup' | 'heart' | 'laugh' | 'celebrate' | 'eyes' | 'fire' | 'check' | 'plus1'
type CallType = 'audio' | 'video' | 'huddle'
type CallStatus = 'ongoing' | 'ended' | 'missed' | 'scheduled'

interface User {
  id: string
  name: string
  displayName: string
  email: string
  avatar?: string
  status: UserStatus
  statusText?: string
  title?: string
  timezone?: string
  isBot?: boolean
}

interface Channel {
  id: string
  name: string
  type: ChannelType
  description?: string
  topic?: string
  members: User[]
  memberCount: number
  unreadCount: number
  isMuted: boolean
  isStarred: boolean
  isPinned: boolean
  lastMessage?: Message
  lastActivity: string
  createdAt: string
  createdBy: User
}

interface Message {
  id: string
  channelId: string
  content: string
  author: User
  createdAt: string
  editedAt?: string
  status: MessageStatus
  reactions: Reaction[]
  threadCount: number
  threadParticipants: User[]
  attachments: Attachment[]
  mentions: User[]
  isPinned: boolean
  isBookmarked: boolean
  parentId?: string
  replyTo?: Message
}

interface Reaction {
  type: ReactionType
  count: number
  users: User[]
  hasReacted: boolean
}

interface Attachment {
  id: string
  type: 'file' | 'image' | 'video' | 'audio' | 'code' | 'link'
  name: string
  url: string
  size?: number
  mimeType?: string
  preview?: string
}

interface Thread {
  id: string
  parentMessage: Message
  channel: string
  replies: number
  participants: User[]
  lastReply: string
  isFollowing: boolean
  isUnread: boolean
}

interface Call {
  id: string
  type: CallType
  status: CallStatus
  channelId: string
  channelName: string
  participants: User[]
  startTime: string
  endTime?: string
  duration?: number
  isRecorded: boolean
}

interface SharedFile {
  id: string
  name: string
  type: string
  size: number
  uploadedBy: User
  uploadedAt: string
  channelId: string
  channelName: string
  downloads: number
}

interface Mention {
  id: string
  message: Message
  channel: string
  isRead: boolean
  mentionedAt: string
}

// Mock Data
const currentUser: User = {
  id: 'u0',
  name: 'you',
  displayName: 'You',
  email: 'you@example.com',
  status: 'online',
  title: 'Software Engineer'
}

const mockUsers: User[] = [
  { id: 'u1', name: 'sarah.chen', displayName: 'Sarah Chen', email: 'sarah@example.com', status: 'online', title: 'Product Manager', statusText: 'In a meeting' },
  { id: 'u2', name: 'mike.johnson', displayName: 'Mike Johnson', email: 'mike@example.com', status: 'away', title: 'Senior Developer' },
  { id: 'u3', name: 'emily.davis', displayName: 'Emily Davis', email: 'emily@example.com', status: 'online', title: 'Designer' },
  { id: 'u4', name: 'alex.kim', displayName: 'Alex Kim', email: 'alex@example.com', status: 'dnd', title: 'DevOps Engineer', statusText: 'Focusing' },
  { id: 'u5', name: 'slackbot', displayName: 'Slackbot', email: 'bot@slack.com', status: 'online', isBot: true },
  { id: 'u6', name: 'github', displayName: 'GitHub', email: 'github@slack.com', status: 'online', isBot: true }
]

const mockChannels: Channel[] = [
  { id: 'c1', name: 'general', type: 'public', description: 'Company-wide announcements', topic: 'Welcome to the team!', members: mockUsers, memberCount: 156, unreadCount: 3, isMuted: false, isStarred: true, isPinned: true, lastActivity: '2024-01-15T14:30:00Z', createdAt: '2023-01-01T00:00:00Z', createdBy: mockUsers[0] },
  { id: 'c2', name: 'engineering', type: 'public', description: 'Engineering team discussions', topic: 'Sprint 24 planning', members: [mockUsers[1], mockUsers[3]], memberCount: 42, unreadCount: 12, isMuted: false, isStarred: true, isPinned: false, lastActivity: '2024-01-15T14:28:00Z', createdAt: '2023-01-15T00:00:00Z', createdBy: mockUsers[1] },
  { id: 'c3', name: 'design-team', type: 'private', description: 'Private design channel', members: [mockUsers[2]], memberCount: 8, unreadCount: 0, isMuted: true, isStarred: false, isPinned: false, lastActivity: '2024-01-15T12:00:00Z', createdAt: '2023-02-01T00:00:00Z', createdBy: mockUsers[2] },
  { id: 'c4', name: 'random', type: 'public', description: 'Non-work banter', topic: 'Share memes!', members: mockUsers, memberCount: 134, unreadCount: 0, isMuted: false, isStarred: false, isPinned: false, lastActivity: '2024-01-15T10:00:00Z', createdAt: '2023-01-01T00:00:00Z', createdBy: mockUsers[0] },
  { id: 'c5', name: 'product', type: 'public', description: 'Product discussions', members: mockUsers, memberCount: 28, unreadCount: 5, isMuted: false, isStarred: false, isPinned: false, lastActivity: '2024-01-15T13:00:00Z', createdAt: '2023-03-01T00:00:00Z', createdBy: mockUsers[0] },
  { id: 'dm1', name: 'Sarah Chen', type: 'direct', members: [mockUsers[0]], memberCount: 2, unreadCount: 1, isMuted: false, isStarred: false, isPinned: false, lastActivity: '2024-01-15T14:25:00Z', createdAt: '2023-06-15T00:00:00Z', createdBy: currentUser },
  { id: 'dm2', name: 'Mike Johnson', type: 'direct', members: [mockUsers[1]], memberCount: 2, unreadCount: 0, isMuted: false, isStarred: false, isPinned: false, lastActivity: '2024-01-14T16:00:00Z', createdAt: '2023-07-01T00:00:00Z', createdBy: currentUser }
]

const mockMessages: Message[] = [
  { id: 'm1', channelId: 'c1', content: 'Hey team! Quick update on the Q1 roadmap - check out the attached doc.', author: mockUsers[0], createdAt: '2024-01-15T14:30:00Z', status: 'read', reactions: [{ type: 'thumbsup', count: 5, users: mockUsers.slice(0, 5), hasReacted: true }], threadCount: 3, threadParticipants: [mockUsers[1], mockUsers[2]], attachments: [{ id: 'a1', type: 'file', name: 'Q1_Roadmap.pdf', url: '#', size: 2500000 }], mentions: [], isPinned: true, isBookmarked: false },
  { id: 'm2', channelId: 'c1', content: '@sarah.chen Looks great! Questions about the timeline.', author: mockUsers[1], createdAt: '2024-01-15T14:28:00Z', status: 'read', reactions: [], threadCount: 0, threadParticipants: [], attachments: [], mentions: [mockUsers[0]], isPinned: false, isBookmarked: false, parentId: 'm1' },
  { id: 'm3', channelId: 'c2', content: '```javascript\nconst feature = { name: "Dark Mode", status: "done" };\n```\nJust pushed!', author: mockUsers[3], createdAt: '2024-01-15T14:20:00Z', status: 'read', reactions: [{ type: 'fire', count: 8, users: mockUsers, hasReacted: true }], threadCount: 5, threadParticipants: [mockUsers[0], mockUsers[1]], attachments: [], mentions: [], isPinned: false, isBookmarked: true },
  { id: 'm4', channelId: 'c2', content: 'New deployment completed successfully!', author: mockUsers[5], createdAt: '2024-01-15T14:15:00Z', status: 'read', reactions: [{ type: 'celebrate', count: 12, users: mockUsers, hasReacted: true }], threadCount: 0, threadParticipants: [], attachments: [], mentions: [], isPinned: false, isBookmarked: false },
  { id: 'm5', channelId: 'dm1', content: 'Hey! Are you free for a quick sync at 3pm?', author: mockUsers[0], createdAt: '2024-01-15T14:25:00Z', status: 'delivered', reactions: [], threadCount: 0, threadParticipants: [], attachments: [], mentions: [], isPinned: false, isBookmarked: false }
]

const mockThreads: Thread[] = [
  { id: 't1', parentMessage: mockMessages[0], channel: 'general', replies: 3, participants: [mockUsers[0], mockUsers[1], mockUsers[2]], lastReply: '2024-01-15T14:35:00Z', isFollowing: true, isUnread: true },
  { id: 't2', parentMessage: mockMessages[2], channel: 'engineering', replies: 5, participants: [mockUsers[0], mockUsers[1], mockUsers[3]], lastReply: '2024-01-15T14:25:00Z', isFollowing: true, isUnread: false },
  { id: 't3', parentMessage: mockMessages[0], channel: 'general', replies: 2, participants: [mockUsers[2], mockUsers[3]], lastReply: '2024-01-15T13:00:00Z', isFollowing: false, isUnread: false }
]

const mockCalls: Call[] = [
  { id: 'call1', type: 'huddle', status: 'ongoing', channelId: 'c2', channelName: '#engineering', participants: [mockUsers[1], mockUsers[3]], startTime: '2024-01-15T14:00:00Z', isRecorded: false },
  { id: 'call2', type: 'video', status: 'scheduled', channelId: 'c1', channelName: '#general', participants: mockUsers.slice(0, 4), startTime: '2024-01-16T10:00:00Z', isRecorded: true },
  { id: 'call3', type: 'audio', status: 'ended', channelId: 'dm1', channelName: 'Sarah Chen', participants: [mockUsers[0]], startTime: '2024-01-15T11:00:00Z', endTime: '2024-01-15T11:30:00Z', duration: 1800, isRecorded: false },
  { id: 'call4', type: 'video', status: 'missed', channelId: 'dm2', channelName: 'Mike Johnson', participants: [mockUsers[1]], startTime: '2024-01-15T09:00:00Z', isRecorded: false }
]

const mockFiles: SharedFile[] = [
  { id: 'f1', name: 'Q1_Roadmap.pdf', type: 'application/pdf', size: 2500000, uploadedBy: mockUsers[0], uploadedAt: '2024-01-15T14:30:00Z', channelId: 'c1', channelName: '#general', downloads: 45 },
  { id: 'f2', name: 'design-system.figma', type: 'application/figma', size: 15000000, uploadedBy: mockUsers[2], uploadedAt: '2024-01-14T10:00:00Z', channelId: 'c3', channelName: '#design-team', downloads: 12 },
  { id: 'f3', name: 'architecture.png', type: 'image/png', size: 850000, uploadedBy: mockUsers[3], uploadedAt: '2024-01-13T16:00:00Z', channelId: 'c2', channelName: '#engineering', downloads: 28 },
  { id: 'f4', name: 'demo-video.mp4', type: 'video/mp4', size: 125000000, uploadedBy: mockUsers[0], uploadedAt: '2024-01-12T09:00:00Z', channelId: 'c5', channelName: '#product', downloads: 67 },
  { id: 'f5', name: 'meeting-notes.docx', type: 'application/docx', size: 45000, uploadedBy: mockUsers[1], uploadedAt: '2024-01-11T14:00:00Z', channelId: 'c1', channelName: '#general', downloads: 23 }
]

const mockMentions: Mention[] = [
  { id: 'men1', message: mockMessages[1], channel: '#general', isRead: false, mentionedAt: '2024-01-15T14:28:00Z' },
  { id: 'men2', message: { ...mockMessages[0], content: '@you Great work on the feature!' } as Message, channel: '#engineering', isRead: false, mentionedAt: '2024-01-15T13:00:00Z' },
  { id: 'men3', message: { ...mockMessages[0], content: '@you Can you review this PR?' } as Message, channel: '#engineering', isRead: true, mentionedAt: '2024-01-14T16:00:00Z' }
]

export default function MessagesClient() {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(mockChannels[0])
  const [searchQuery, setSearchQuery] = useState('')
  const [messageInput, setMessageInput] = useState('')
  const [showThreadPanel, setShowThreadPanel] = useState(false)
  const [selectedThread, setSelectedThread] = useState<Message | null>(null)
  const [channelFilter, setChannelFilter] = useState<'all' | 'unread' | 'starred'>('all')
  const [activeCall, setActiveCall] = useState<Call | null>(null)

  // Settings
  const [settings, setSettings] = useState({
    notifications: true,
    sounds: true,
    desktopNotifications: true,
    emailDigest: false,
    darkMode: false,
    compactMode: false,
    showTypingIndicators: true,
    showOnlineStatus: true,
    messagePreview: true,
    autoMarkRead: true
  })
  const [settingsTab, setSettingsTab] = useState('general')

  // Stats
  const stats = useMemo(() => {
    const totalMessages = mockMessages.length * 150
    const totalChannels = mockChannels.length
    const unreadMessages = mockChannels.reduce((sum, c) => sum + c.unreadCount, 0)
    const activeThreads = mockThreads.filter(t => t.isUnread).length
    const totalFiles = mockFiles.length * 25
    const totalCalls = mockCalls.length * 12
    const onlineMembers = mockUsers.filter(u => u.status === 'online').length
    const mentions = mockMentions.filter(m => !m.isRead).length
    return { totalMessages, totalChannels, unreadMessages, activeThreads, totalFiles, totalCalls, onlineMembers, mentions }
  }, [])

  const filteredChannels = useMemo(() => {
    let channels = mockChannels
    if (channelFilter === 'unread') channels = channels.filter(c => c.unreadCount > 0)
    else if (channelFilter === 'starred') channels = channels.filter(c => c.isStarred)
    if (searchQuery) channels = channels.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    return channels
  }, [channelFilter, searchQuery])

  const channelMessages = useMemo(() => {
    if (!selectedChannel) return []
    return mockMessages.filter(m => m.channelId === selectedChannel.id && !m.parentId)
  }, [selectedChannel])

  const publicChannels = filteredChannels.filter(c => c.type === 'public')
  const privateChannels = filteredChannels.filter(c => c.type === 'private')
  const directMessages = filteredChannels.filter(c => c.type === 'direct' || c.type === 'group')

  // Helper functions
  const getStatusColor = (status: UserStatus) => {
    const colors = { online: 'bg-green-500', away: 'bg-yellow-500', dnd: 'bg-red-500', offline: 'bg-gray-400' }
    return colors[status]
  }

  const getReactionIcon = (type: ReactionType) => {
    const icons: Record<ReactionType, string> = { thumbsup: '👍', heart: '❤️', laugh: '😂', celebrate: '🎉', eyes: '👀', fire: '🔥', check: '✅', plus1: '➕' }
    return icons[type]
  }

  const formatTime = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - d.getTime()) / 3600000)
    if (diffHours < 24) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    if (diffHours < 48) return 'Yesterday'
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`
    if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(1)} KB`
    return `${bytes} B`
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const statCards = [
    { label: 'Messages', value: stats.totalMessages.toLocaleString(), change: 15.3, icon: MessageSquare, gradient: 'from-purple-500 to-indigo-500' },
    { label: 'Channels', value: stats.totalChannels.toString(), change: 8.7, icon: Hash, gradient: 'from-blue-500 to-cyan-500' },
    { label: 'Unread', value: stats.unreadMessages.toString(), change: -12.4, icon: Inbox, gradient: 'from-red-500 to-orange-500' },
    { label: 'Active Threads', value: stats.activeThreads.toString(), change: 5.2, icon: MessageCircle, gradient: 'from-green-500 to-emerald-500' },
    { label: 'Shared Files', value: stats.totalFiles.toString(), change: 22.1, icon: Files, gradient: 'from-amber-500 to-yellow-500' },
    { label: 'Calls Today', value: stats.totalCalls.toString(), change: 18.9, icon: Phone, gradient: 'from-pink-500 to-rose-500' },
    { label: 'Online', value: stats.onlineMembers.toString(), change: 0, icon: Users, gradient: 'from-cyan-500 to-teal-500' },
    { label: 'Mentions', value: stats.mentions.toString(), change: -5.0, icon: AtSign, gradient: 'from-indigo-500 to-purple-500' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Slack-level team communication platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search messages, channels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-72"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
            <Button className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Message
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
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
        <Tabs defaultValue="channels" className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 shadow-sm">
            <TabsTrigger value="channels" className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Channels
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="threads" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Threads
            </TabsTrigger>
            <TabsTrigger value="calls" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Calls
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2">
              <Files className="w-4 h-4" />
              Files
            </TabsTrigger>
            <TabsTrigger value="mentions" className="flex items-center gap-2">
              <AtSign className="w-4 h-4" />
              Mentions
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Channels Tab */}
          <TabsContent value="channels" className="space-y-6">
            <div className="flex items-center gap-2">
              <Button variant={channelFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setChannelFilter('all')}>All</Button>
              <Button variant={channelFilter === 'unread' ? 'default' : 'outline'} size="sm" onClick={() => setChannelFilter('unread')}>Unread ({stats.unreadMessages})</Button>
              <Button variant={channelFilter === 'starred' ? 'default' : 'outline'} size="sm" onClick={() => setChannelFilter('starred')}>Starred</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {publicChannels.length > 0 && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Hash className="w-5 h-5" />
                        Public Channels
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {publicChannels.map(channel => (
                        <div key={channel.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => setSelectedChannel(channel)}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                              <Hash className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">#{channel.name}</p>
                                {channel.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                                {channel.isMuted && <BellOff className="w-4 h-4 text-gray-400" />}
                              </div>
                              <p className="text-sm text-gray-500">{channel.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-sm text-gray-500">{channel.memberCount} members</div>
                            {channel.unreadCount > 0 && (
                              <Badge className="bg-red-500 text-white">{channel.unreadCount}</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {privateChannels.length > 0 && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Lock className="w-5 h-5" />
                        Private Channels
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {privateChannels.map(channel => (
                        <div key={channel.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                              <Lock className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                              <p className="font-medium">#{channel.name}</p>
                              <p className="text-sm text-gray-500">{channel.description}</p>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">{channel.memberCount} members</div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="w-5 h-5" />
                      Direct Messages
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {directMessages.map(channel => (
                      <div key={channel.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar>
                              <AvatarFallback>{channel.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(channel.members[0]?.status || 'offline')}`} />
                          </div>
                          <div>
                            <p className="font-medium">{channel.name}</p>
                            <p className="text-sm text-gray-500">{channel.members[0]?.title}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">{formatTime(channel.lastActivity)}</span>
                          {channel.unreadCount > 0 && (
                            <Badge className="bg-red-500 text-white">{channel.unreadCount}</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Channel
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite People
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Bot className="w-4 h-4 mr-2" />
                      Add App
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Workflow className="w-4 h-4 mr-2" />
                      Create Workflow
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Online Now
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockUsers.filter(u => u.status === 'online' && !u.isBot).map(user => (
                      <div key={user.id} className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${getStatusColor(user.status)}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.displayName}</p>
                          <p className="text-xs text-gray-500">{user.statusText || user.title}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <Card className="lg:col-span-1 border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Conversations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-2">
                      {mockChannels.map(channel => (
                        <div key={channel.id} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${selectedChannel?.id === channel.id ? 'bg-purple-100 dark:bg-purple-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`} onClick={() => setSelectedChannel(channel)}>
                          {channel.type === 'direct' ? (
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>{channel.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                              {channel.type === 'private' ? <Lock className="w-4 h-4" /> : <Hash className="w-4 h-4" />}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{channel.type === 'direct' ? channel.name : `#${channel.name}`}</p>
                            <p className="text-xs text-gray-500 truncate">{formatTime(channel.lastActivity)}</p>
                          </div>
                          {channel.unreadCount > 0 && (
                            <Badge className="bg-red-500 text-white text-xs">{channel.unreadCount}</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="lg:col-span-3 border-0 shadow-sm">
                {selectedChannel ? (
                  <div className="flex flex-col h-[600px]">
                    <CardHeader className="border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {selectedChannel.type === 'direct' ? <Avatar><AvatarFallback>{selectedChannel.name.charAt(0)}</AvatarFallback></Avatar> : <Hash className="w-5 h-5" />}
                          <div>
                            <CardTitle>{selectedChannel.type === 'direct' ? selectedChannel.name : `#${selectedChannel.name}`}</CardTitle>
                            <CardDescription>{selectedChannel.memberCount} members</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon"><Phone className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon"><Video className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon"><Pin className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    </CardHeader>
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {channelMessages.map(message => (
                          <div key={message.id} className="flex gap-3 group">
                            <Avatar>
                              <AvatarFallback>{message.author.displayName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm">{message.author.displayName}</span>
                                <span className="text-xs text-gray-500">{formatTime(message.createdAt)}</span>
                                {message.isPinned && <Pin className="w-3 h-3 text-yellow-500" />}
                              </div>
                              <p className="text-sm mt-1">{message.content}</p>
                              {message.reactions.length > 0 && (
                                <div className="flex gap-1 mt-2">
                                  {message.reactions.map((reaction, idx) => (
                                    <Button key={idx} variant="outline" size="sm" className="h-6 px-2 text-xs">
                                      {getReactionIcon(reaction.type)} {reaction.count}
                                    </Button>
                                  ))}
                                </div>
                              )}
                              {message.threadCount > 0 && (
                                <button className="flex items-center gap-2 mt-2 text-xs text-blue-600 hover:underline" onClick={() => { setSelectedThread(message); setShowThreadPanel(true); }}>
                                  {message.threadCount} replies <ChevronRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="p-4 border-t">
                      <div className="flex gap-2">
                        <Input placeholder={`Message #${selectedChannel.name}`} value={messageInput} onChange={(e) => setMessageInput(e.target.value)} className="flex-1" />
                        <Button><Send className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-[600px] flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select a conversation</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* Threads Tab */}
          <TabsContent value="threads" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Active Threads</CardTitle>
                <CardDescription>Conversations you're following</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockThreads.map(thread => (
                    <div key={thread.id} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarFallback>{thread.parentMessage.author.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{thread.parentMessage.author.displayName}</span>
                            <span className="text-xs text-gray-500">in #{thread.channel}</span>
                            {thread.isUnread && <Badge className="bg-blue-500 text-white text-xs">New</Badge>}
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{thread.parentMessage.content}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>{thread.replies} replies</span>
                            <div className="flex -space-x-1">
                              {thread.participants.slice(0, 3).map(p => (
                                <Avatar key={p.id} className="w-5 h-5 border border-white">
                                  <AvatarFallback className="text-[8px]">{p.displayName.charAt(0)}</AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                            <span>Last reply {formatTime(thread.lastReply)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calls Tab */}
          <TabsContent value="calls" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Radio className="w-5 h-5 text-green-500 animate-pulse" />
                    Active Calls
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockCalls.filter(c => c.status === 'ongoing').map(call => (
                      <div key={call.id} className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {call.type === 'huddle' ? <Headphones className="w-5 h-5 text-green-600" /> : call.type === 'video' ? <Video className="w-5 h-5 text-green-600" /> : <Phone className="w-5 h-5 text-green-600" />}
                            <div>
                              <p className="font-medium">{call.channelName}</p>
                              <p className="text-xs text-gray-500">{call.participants.length} participants</p>
                            </div>
                          </div>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                            Join
                          </Button>
                        </div>
                        <div className="flex -space-x-2">
                          {call.participants.map(p => (
                            <Avatar key={p.id} className="w-8 h-8 border-2 border-white">
                              <AvatarFallback>{p.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                      </div>
                    ))}
                    {mockCalls.filter(c => c.status === 'ongoing').length === 0 && (
                      <p className="text-center text-gray-500 py-8">No active calls</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Scheduled Calls
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockCalls.filter(c => c.status === 'scheduled').map(call => (
                      <div key={call.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Video className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="font-medium">{call.channelName}</p>
                              <p className="text-sm text-gray-500">{new Date(call.startTime).toLocaleString()}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">View</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Call History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockCalls.filter(c => c.status === 'ended' || c.status === 'missed').map(call => (
                      <div key={call.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="flex items-center gap-3">
                          {call.status === 'missed' ? <PhoneOff className="w-5 h-5 text-red-500" /> : <Phone className="w-5 h-5 text-gray-500" />}
                          <div>
                            <p className="font-medium">{call.channelName}</p>
                            <p className="text-sm text-gray-500">{formatTime(call.startTime)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {call.duration && <span className="text-sm text-gray-500">{formatDuration(call.duration)}</span>}
                          <Badge className={call.status === 'missed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}>{call.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Shared Files</CardTitle>
                    <CardDescription>All files shared across channels</CardDescription>
                  </div>
                  <Button>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload File
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockFiles.map(file => (
                    <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          {file.type.includes('image') ? <Image className="w-6 h-6 text-blue-500" /> :
                           file.type.includes('video') ? <Video className="w-6 h-6 text-purple-500" /> :
                           file.type.includes('pdf') ? <FileText className="w-6 h-6 text-red-500" /> :
                           <FolderOpen className="w-6 h-6 text-gray-500" />}
                        </div>
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{formatFileSize(file.size)}</span>
                            <span>•</span>
                            <span>{file.channelName}</span>
                            <span>•</span>
                            <span>{formatTime(file.uploadedAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">{file.downloads} downloads</span>
                        <Button variant="outline" size="icon">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mentions Tab */}
          <TabsContent value="mentions" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Mentions & Reactions</CardTitle>
                <CardDescription>Messages where you were mentioned</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockMentions.map(mention => (
                    <div key={mention.id} className={`p-4 border rounded-lg ${mention.isRead ? '' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200'}`}>
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarFallback>{mention.message.author.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{mention.message.author.displayName}</span>
                            <span className="text-xs text-gray-500">in {mention.channel}</span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">{formatTime(mention.mentionedAt)}</span>
                            {!mention.isRead && <Badge className="bg-blue-500 text-white text-xs">New</Badge>}
                          </div>
                          <p className="text-sm">{mention.message.content}</p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Reply className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Advanced Search</CardTitle>
                <CardDescription>Search across all messages, files, and channels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input placeholder="Search messages..." className="pl-10 h-12 text-lg" />
                    </div>
                    <Button size="lg">Search</Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">from:@user</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">in:#channel</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">has:file</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">has:link</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">before:date</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">after:date</Badge>
                  </div>

                  <div className="py-12 text-center text-gray-500">
                    <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">Enter a search term to find messages</p>
                    <p className="text-sm">Use filters to narrow down results</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab - Slack Level */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3 space-y-2">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Settings },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'appearance', label: 'Appearance', icon: Palette },
                        { id: 'privacy', label: 'Privacy', icon: Shield },
                        { id: 'integrations', label: 'Integrations', icon: Webhook },
                        { id: 'advanced', label: 'Advanced', icon: Sliders }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            settingsTab === item.id
                              ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>

                {/* Messaging Stats Sidebar */}
                <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium opacity-90">Workspace Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-2xl font-bold">{stats.totalMessages.toLocaleString()}</div>
                      <div className="text-xs opacity-80">Total Messages</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-white/20 rounded-lg p-2">
                        <div className="text-lg font-semibold">{stats.totalChannels}</div>
                        <div className="text-xs opacity-80">Channels</div>
                      </div>
                      <div className="bg-white/20 rounded-lg p-2">
                        <div className="text-lg font-semibold">{stats.onlineMembers}</div>
                        <div className="text-xs opacity-80">Online</div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Storage Used</span>
                        <span>18.5 GB</span>
                      </div>
                      <Progress value={62} className="h-2 bg-white/20" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {settingsTab === 'general' && (
                  <>
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="w-5 h-5 text-purple-600" />
                          Workspace Settings
                        </CardTitle>
                        <CardDescription>Configure your workspace preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Workspace Name</Label>
                            <Input defaultValue="FreeFlow Team" />
                          </div>
                          <div className="space-y-2">
                            <Label>Workspace URL</Label>
                            <Input defaultValue="freeflow.slack.com" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Default Language</Label>
                            <Select defaultValue="en">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Spanish</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                                <SelectItem value="de">German</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Timezone</Label>
                            <Select defaultValue="pst">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pst">Pacific Time</SelectItem>
                                <SelectItem value="est">Eastern Time</SelectItem>
                                <SelectItem value="utc">UTC</SelectItem>
                                <SelectItem value="gmt">GMT</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Allow Message Editing</div>
                            <div className="text-sm text-gray-500">Members can edit messages after sending</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Allow Message Deletion</div>
                            <div className="text-sm text-gray-500">Members can delete their messages</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-blue-600" />
                          Profile Settings
                        </CardTitle>
                        <CardDescription>Manage your profile information</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Display Name</Label>
                            <Input defaultValue={currentUser.displayName} />
                          </div>
                          <div className="space-y-2">
                            <Label>Title</Label>
                            <Input defaultValue={currentUser.title} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Status Message</Label>
                          <Input placeholder="What's your status?" />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Set Status Automatically</div>
                            <div className="text-sm text-gray-500">Update status based on calendar</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'notifications' && (
                  <>
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-orange-600" />
                          Notification Preferences
                        </CardTitle>
                        <CardDescription>Control how you receive notifications</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Push Notifications</div>
                            <div className="text-sm text-gray-500">Receive notifications for new messages</div>
                          </div>
                          <Switch checked={settings.notifications} onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked })} />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Sound Alerts</div>
                            <div className="text-sm text-gray-500">Play sounds for notifications</div>
                          </div>
                          <Switch checked={settings.sounds} onCheckedChange={(checked) => setSettings({ ...settings, sounds: checked })} />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Desktop Notifications</div>
                            <div className="text-sm text-gray-500">Show desktop notification popups</div>
                          </div>
                          <Switch checked={settings.desktopNotifications} onCheckedChange={(checked) => setSettings({ ...settings, desktopNotifications: checked })} />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Email Digest</div>
                            <div className="text-sm text-gray-500">Receive daily email summaries</div>
                          </div>
                          <Switch checked={settings.emailDigest} onCheckedChange={(checked) => setSettings({ ...settings, emailDigest: checked })} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-blue-600" />
                          Do Not Disturb
                        </CardTitle>
                        <CardDescription>Set quiet hours</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Enable DND Schedule</div>
                            <div className="text-sm text-gray-500">Automatically mute notifications</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Start Time</Label>
                            <Select defaultValue="22">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="20">8:00 PM</SelectItem>
                                <SelectItem value="21">9:00 PM</SelectItem>
                                <SelectItem value="22">10:00 PM</SelectItem>
                                <SelectItem value="23">11:00 PM</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>End Time</Label>
                            <Select defaultValue="8">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="6">6:00 AM</SelectItem>
                                <SelectItem value="7">7:00 AM</SelectItem>
                                <SelectItem value="8">8:00 AM</SelectItem>
                                <SelectItem value="9">9:00 AM</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'appearance' && (
                  <>
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Palette className="w-5 h-5 text-pink-600" />
                          Theme Settings
                        </CardTitle>
                        <CardDescription>Customize the look and feel</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div className="flex items-center gap-2">
                            {settings.darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                            <div>
                              <div className="font-medium">Dark Mode</div>
                              <div className="text-sm text-gray-500">Use dark theme</div>
                            </div>
                          </div>
                          <Switch checked={settings.darkMode} onCheckedChange={(checked) => setSettings({ ...settings, darkMode: checked })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Sidebar Theme</Label>
                          <div className="flex gap-2">
                            {['#4a154b', '#1264a3', '#2eb67d', '#e01e5a', '#36c5f0', '#ecb22e'].map(color => (
                              <button
                                key={color}
                                className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Compact Mode</div>
                            <div className="text-sm text-gray-500">Reduce spacing in messages</div>
                          </div>
                          <Switch checked={settings.compactMode} onCheckedChange={(checked) => setSettings({ ...settings, compactMode: checked })} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-indigo-600" />
                          Message Display
                        </CardTitle>
                        <CardDescription>Customize message appearance</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Message Preview</div>
                            <div className="text-sm text-gray-500">Show message previews in sidebar</div>
                          </div>
                          <Switch checked={settings.messagePreview} onCheckedChange={(checked) => setSettings({ ...settings, messagePreview: checked })} />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Show Timestamps</div>
                            <div className="text-sm text-gray-500">Display timestamps on all messages</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Show Full Names</div>
                            <div className="text-sm text-gray-500">Display full names instead of usernames</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>Font Size</Label>
                          <Select defaultValue="medium">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">Small</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="large">Large</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'privacy' && (
                  <>
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-green-600" />
                          Privacy Settings
                        </CardTitle>
                        <CardDescription>Control your privacy and visibility</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Show Typing Indicators</div>
                            <div className="text-sm text-gray-500">Let others see when you're typing</div>
                          </div>
                          <Switch checked={settings.showTypingIndicators} onCheckedChange={(checked) => setSettings({ ...settings, showTypingIndicators: checked })} />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Show Online Status</div>
                            <div className="text-sm text-gray-500">Let others see your status</div>
                          </div>
                          <Switch checked={settings.showOnlineStatus} onCheckedChange={(checked) => setSettings({ ...settings, showOnlineStatus: checked })} />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Auto Mark as Read</div>
                            <div className="text-sm text-gray-500">Automatically mark messages as read</div>
                          </div>
                          <Switch checked={settings.autoMarkRead} onCheckedChange={(checked) => setSettings({ ...settings, autoMarkRead: checked })} />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Read Receipts</div>
                            <div className="text-sm text-gray-500">Show when you've read messages</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="w-5 h-5 text-amber-600" />
                          Security
                        </CardTitle>
                        <CardDescription>Manage your security settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Two-Factor Authentication</div>
                            <div className="text-sm text-gray-500">Add an extra layer of security</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Session Timeout</div>
                            <div className="text-sm text-gray-500">Auto logout after inactivity</div>
                          </div>
                          <Select defaultValue="1h">
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30m">30 minutes</SelectItem>
                              <SelectItem value="1h">1 hour</SelectItem>
                              <SelectItem value="4h">4 hours</SelectItem>
                              <SelectItem value="never">Never</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button variant="outline" className="w-full">
                          <Key className="w-4 h-4 mr-2" />
                          Manage Active Sessions
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'integrations' && (
                  <>
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Webhook className="w-5 h-5 text-indigo-600" />
                          Connected Apps
                        </CardTitle>
                        <CardDescription>Manage third-party integrations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#2684FF] flex items-center justify-center">
                              <span className="text-white font-bold">J</span>
                            </div>
                            <div>
                              <div className="font-medium">Jira</div>
                              <div className="text-sm text-gray-500">Project tracking integration</div>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Connected</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
                              <span className="text-white font-bold">GH</span>
                            </div>
                            <div>
                              <div className="font-medium">GitHub</div>
                              <div className="text-sm text-gray-500">Code notifications</div>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Connected</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                              <span className="text-white font-bold">G</span>
                            </div>
                            <div>
                              <div className="font-medium">Google Calendar</div>
                              <div className="text-sm text-gray-500">Meeting reminders</div>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Connected</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                              <span className="text-white font-bold">Z</span>
                            </div>
                            <div>
                              <div className="font-medium">Zoom</div>
                              <div className="text-sm text-gray-500">Not connected</div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">Connect</Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bot className="w-5 h-5 text-purple-600" />
                          Bots & Workflows
                        </CardTitle>
                        <CardDescription>Manage automation and bots</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div className="flex items-center gap-3">
                            <Bot className="w-5 h-5 text-green-600" />
                            <div>
                              <div className="font-medium">Slackbot</div>
                              <div className="text-sm text-gray-500">Built-in assistant</div>
                            </div>
                          </div>
                          <Badge>Active</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div className="flex items-center gap-3">
                            <Workflow className="w-5 h-5 text-blue-600" />
                            <div>
                              <div className="font-medium">Custom Workflows</div>
                              <div className="text-sm text-gray-500">3 active workflows</div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">Manage</Button>
                        </div>
                        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                          <Plus className="w-4 h-4 mr-2" />
                          Add App
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'advanced' && (
                  <>
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <HardDrive className="w-5 h-5 text-gray-600" />
                          Data & Storage
                        </CardTitle>
                        <CardDescription>Manage your data and storage</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Message Retention</Label>
                          <Select defaultValue="forever">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="90">90 days</SelectItem>
                              <SelectItem value="365">1 year</SelectItem>
                              <SelectItem value="730">2 years</SelectItem>
                              <SelectItem value="forever">Forever</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-3">
                          <Button variant="outline" className="flex-1">
                            <Download className="w-4 h-4 mr-2" />
                            Export Data
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <Archive className="w-4 h-4 mr-2" />
                            Clear Cache
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <HelpCircle className="w-5 h-5 text-blue-600" />
                          Help & Support
                        </CardTitle>
                        <CardDescription>Get help and support resources</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Button variant="outline" className="w-full justify-start">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Documentation
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Contact Support
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Zap className="w-4 h-4 mr-2" />
                          Keyboard Shortcuts
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Check for Updates
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertOctagon className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                        <CardDescription>Irreversible actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                          <div>
                            <div className="font-medium text-red-700 dark:text-red-400">Leave Workspace</div>
                            <div className="text-sm text-red-600 dark:text-red-500">Remove yourself from this workspace</div>
                          </div>
                          <Button variant="destructive" size="sm">
                            <LogOut className="w-4 h-4 mr-2" />
                            Leave
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                          <div>
                            <div className="font-medium text-red-700 dark:text-red-400">Delete All Messages</div>
                            <div className="text-sm text-red-600 dark:text-red-500">Permanently delete all your messages</div>
                          </div>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
