'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { useMessages } from '@/lib/hooks/use-messages'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import {
  MessageSquare, Plus, Search, Hash, Lock, Users, Settings, Bell, BellOff,
  Star, Pin, Bookmark, Send,
  AtSign, Image, FileText, Video, Phone, ChevronRight,
  Clock, CheckCheck, Reply, Forward, Trash2,
  Filter, Archive, Inbox, Download, Upload, Headphones, MessageCircle, ThumbsUp, UserPlus, LogOut, Zap, Bot, Workflow, Code, Calendar, ArrowUpRight, ArrowDownRight,
  FolderOpen, Files, Sparkles, Moon, Sun, Palette, Shield, Key,
  RefreshCw, PhoneOff, ScreenShare, PlayCircle, Radio, BookOpen, HelpCircle,
  Webhook, HardDrive, AlertOctagon, Sliders
} from 'lucide-react'

// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'

import {
  messagesAIInsights,
  messagesCollaborators,
  messagesPredictions,
  messagesActivities,
  messagesQuickActions,
} from '@/lib/mock-data/adapters'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

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
  const [recipientId, setRecipientId] = useState('')
  const [messageSubject, setMessageSubject] = useState('')

  // Real Supabase hook for messages
  const {
    messages: supabaseMessages,
    loading: messagesLoading,
    error: messagesError,
    mutating,
    createMessage,
    updateMessage,
    deleteMessage,
    refetch: refetchMessages
  } = useMessages({ limit: 100 })

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

  // Dialog states for formerly toast-only buttons
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [showWorkflowBuilderDialog, setShowWorkflowBuilderDialog] = useState(false)
  const [showFileUploadDialog, setShowFileUploadDialog] = useState(false)
  const [showSessionManagementDialog, setShowSessionManagementDialog] = useState(false)
  const [showWorkflowManagerDialog, setShowWorkflowManagerDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)

  // Dialog form states
  const [inviteEmails, setInviteEmails] = useState('')
  const [inviteMessage, setInviteMessage] = useState('')
  const [workflowName, setWorkflowName] = useState('')
  const [workflowTrigger, setWorkflowTrigger] = useState('')
  const [workflowAction, setWorkflowAction] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [exportFormat, setExportFormat] = useState('json')
  const [exportDateRange, setExportDateRange] = useState('all')
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'starred' | 'pinned'>('all')
  const [filterDateRange, setFilterDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [filterChannel, setFilterChannel] = useState<string>('all')
  const [sidebarThemeColor, setSidebarThemeColor] = useState('#4a154b')

  // Reply and Forward Dialog states
  const [showReplyDialog, setShowReplyDialog] = useState(false)
  const [showForwardDialog, setShowForwardDialog] = useState(false)
  const [replyMessageId, setReplyMessageId] = useState<string | null>(null)
  const [forwardMessageId, setForwardMessageId] = useState<string | null>(null)
  const [replyBody, setReplyBody] = useState('')
  const [forwardRecipient, setForwardRecipient] = useState('')

  // Confirmation Dialog states
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false)
  const [showArchiveConfirmDialog, setShowArchiveConfirmDialog] = useState(false)
  const [showLeaveWorkspaceDialog, setShowLeaveWorkspaceDialog] = useState(false)
  const [deleteMessageId, setDeleteMessageId] = useState<string | null>(null)
  const [archiveMessageId, setArchiveMessageId] = useState<string | null>(null)

  // File type filters
  const [fileTypeFilter, setFileTypeFilter] = useState<'all' | 'images' | 'videos' | 'documents' | 'code'>('all')

  // Thread filters
  const [threadFilter, setThreadFilter] = useState<'all' | 'following' | 'unread' | 'mentions' | 'archived'>('all')

  // Mention filters
  const [mentionFilter, setMentionFilter] = useState<'all' | 'unread' | 'reactions' | 'starred'>('all')

  // Call scheduling dialog
  const [showScheduleCallDialog, setShowScheduleCallDialog] = useState(false)
  const [scheduleCallDate, setScheduleCallDate] = useState('')
  const [scheduleCallTime, setScheduleCallTime] = useState('')
  const [scheduleCallType, setScheduleCallType] = useState<'audio' | 'video'>('video')
  const [scheduleCallParticipants, setScheduleCallParticipants] = useState('')

  // Saved/Bookmarked messages view
  const [showSavedMessages, setShowSavedMessages] = useState(false)

  // Channel state tracking
  const [mutedChannels, setMutedChannels] = useState<Set<string>>(new Set())
  const [archivedChannels, setArchivedChannels] = useState<Set<string>>(new Set())
  const [activeCallChannel, setActiveCallChannel] = useState<string | null>(null)
  const [callType, setCallType] = useState<'audio' | 'video' | null>(null)

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

  // Real Supabase handlers
  const handleSendMessage = async () => {
    if (!messageInput.trim()) {
      toast.error('Message required', { description: 'Please enter a message to send' })
      return
    }

    try {
      await createMessage({
        body: messageInput,
        subject: messageSubject || null,
        recipient_id: recipientId || currentUser.id,
        sender_id: currentUser.id,
        message_type: 'direct' as const,
        status: 'sent' as const,
        priority: 'normal' as const,
        folder: 'inbox',
        is_read: false,
        is_pinned: false,
        is_starred: false,
        is_important: false,
        is_spam: false,
        is_forwarded: false,
        is_encrypted: false,
        is_scheduled: false,
        has_attachments: false,
        attachment_count: 0,
        reaction_count: 0
      })
      setMessageInput('')
      setMessageSubject('')
      toast.success('Message sent', { description: 'Your message has been delivered' })
    } catch (error) {
      toast.error('Failed to send message', { description: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId)
      toast.success('Message deleted', { description: 'The message has been removed' })
    } catch (error) {
      toast.error('Failed to delete message', { description: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await updateMessage(messageId, {
        is_read: true,
        read_at: new Date().toISOString(),
        status: 'read' as const
      })
      toast.success('Marked as read', { description: 'Message marked as read' })
    } catch (error) {
      toast.error('Failed to mark as read', { description: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const handleArchiveMessage = async (messageId: string) => {
    try {
      await updateMessage(messageId, {
        status: 'archived' as const,
        folder: 'archive'
      })
      toast.success('Message archived', { description: 'Message moved to archive' })
    } catch (error) {
      toast.error('Failed to archive message', { description: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const handleStarMessage = async (messageId: string, currentStarred: boolean) => {
    try {
      await updateMessage(messageId, {
        is_starred: !currentStarred
      })
      toast.success(currentStarred ? 'Star removed' : 'Message starred', {
        description: currentStarred ? 'Star has been removed' : 'Message has been starred'
      })
    } catch (error) {
      toast.error('Failed to update star', { description: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const handlePinMessage = async (messageId: string, currentPinned: boolean) => {
    try {
      await updateMessage(messageId, {
        is_pinned: !currentPinned
      })
      toast.success(currentPinned ? 'Message unpinned' : 'Message pinned', {
        description: currentPinned ? 'Message has been unpinned' : 'Message has been pinned'
      })
    } catch (error) {
      toast.error('Failed to update pin', { description: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const handleMarkAsImportant = async (messageId: string, currentImportant: boolean) => {
    try {
      await updateMessage(messageId, {
        is_important: !currentImportant
      })
      toast.success(currentImportant ? 'Removed important flag' : 'Marked as important', {
        description: currentImportant ? 'Important flag removed' : 'Message marked as important'
      })
    } catch (error) {
      toast.error('Failed to update importance', { description: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const handleCreateChannel = () => {
    toast.info('Create Channel', {
      description: 'Opening channel builder...'
    })
  }

  const handleStartCall = (contactName: string, type: 'audio' | 'video' = 'audio') => {
    // Show loading state
    toast.loading('Initiating call...', { id: 'call' })

    // Set active call state
    setActiveCallChannel(contactName)
    setCallType(type)

    // Store call initiation data
    const callData = {
      channel: contactName,
      type,
      initiated_at: new Date().toISOString(),
      status: 'connecting'
    }
    sessionStorage.setItem('active_call', JSON.stringify(callData))

    // Update call status to connected
    sessionStorage.setItem('active_call', JSON.stringify({
      ...callData,
      status: 'connected',
      connected_at: new Date().toISOString()
    }))

    toast.success(`${type === 'video' ? 'Video' : 'Audio'} call started with ${contactName}`, {
      id: 'call',
      description: type === 'video' ? 'Connecting to video stream...' : 'Connecting to audio...',
      action: {
        label: 'End Call',
        onClick: () => handleEndCall()
      }
    })
  }

  const handleEndCall = () => {
    if (activeCallChannel) {
      toast.info('Call ended', {
        description: `Call with ${activeCallChannel} has ended`
      })
      sessionStorage.removeItem('active_call')
      setActiveCallChannel(null)
      setCallType(null)
    }
  }

  const handleMuteChannel = (channelName: string) => {
    // Show loading state
    toast.loading('Updating preferences...', { id: 'mute' })

    // Toggle mute state
    const isMuted = mutedChannels.has(channelName)
    const newMutedChannels = new Set(mutedChannels)

    if (isMuted) {
      // Unmute the channel
      newMutedChannels.delete(channelName)
      setMutedChannels(newMutedChannels)

      // Store in session
      sessionStorage.setItem('muted_channels', JSON.stringify(Array.from(newMutedChannels)))

      toast.success(`${channelName} unmuted`, {
        id: 'mute',
        description: 'You will now receive notifications from this channel',
        action: {
          label: 'Undo',
          onClick: () => handleMuteChannel(channelName)
        }
      })
    } else {
      // Mute the channel
      newMutedChannels.add(channelName)
      setMutedChannels(newMutedChannels)

      // Store in session
      sessionStorage.setItem('muted_channels', JSON.stringify(Array.from(newMutedChannels)))

      toast.success(`${channelName} muted`, {
        id: 'mute',
        description: 'You will not receive notifications from this channel',
        action: {
          label: 'Undo',
          onClick: () => handleMuteChannel(channelName)
        }
      })
    }
  }

  const handleInvitePeople = () => {
    setShowInviteDialog(true)
  }

  const handleSendInvites = () => {
    if (!inviteEmails.trim()) {
      toast.error('Email required', { description: 'Please enter at least one email address' })
      return
    }
    const emailList = inviteEmails.split(',').map(e => e.trim()).filter(e => e)
    toast.success('Invitations sent', { description: `Sent invites to ${emailList.length} team member(s)` })
    setInviteEmails('')
    setInviteMessage('')
    setShowInviteDialog(false)
  }

  const handleOpenMarketplace = async () => {
    // Load marketplace data
    const marketplaceData = {
      apps: [
        { id: 1, name: 'Zoom Integration', category: 'video' },
        { id: 2, name: 'GitHub', category: 'development' },
        { id: 3, name: 'Google Drive', category: 'storage' }
      ],
      timestamp: new Date().toISOString()
    }
    sessionStorage.setItem('marketplace_data', JSON.stringify(marketplaceData))
    toast.success('App marketplace opened - browse integrations')
  }

  const handleCreateWorkflow = () => {
    setShowWorkflowBuilderDialog(true)
  }

  const handleSaveNewWorkflow = () => {
    if (!workflowName.trim()) {
      toast.error('Name required', { description: 'Please enter a workflow name' })
      return
    }
    if (!workflowTrigger) {
      toast.error('Trigger required', { description: 'Please select a trigger for the workflow' })
      return
    }
    toast.success('Workflow created', { description: `"${workflowName}" workflow has been created and activated` })
    setWorkflowName('')
    setWorkflowTrigger('')
    setWorkflowAction('')
    setShowWorkflowBuilderDialog(false)
  }

  const handleViewPinnedMessages = () => {
    // Filter and load pinned messages from both mock and Supabase
    const supabasePinned = supabaseMessages?.filter(m => m.is_pinned) || []
    const mockPinned = mockMessages.filter(m => m.isPinned)

    // Combine and dedupe
    const allPinned = [...supabasePinned, ...mockPinned]

    // Store in session with metadata
    sessionStorage.setItem('pinned_messages_view', JSON.stringify({
      messages: allPinned,
      count: allPinned.length,
      channel: selectedChannel?.name || 'all',
      loaded_at: new Date().toISOString()
    }))

    if (allPinned.length === 0) {
      toast.info('No pinned messages', {
        description: selectedChannel
          ? `No messages are pinned in #${selectedChannel.name}`
          : 'No pinned messages found'
      })
    } else {
      toast.success(`${allPinned.length} pinned message${allPinned.length === 1 ? '' : 's'} found`, {
        description: selectedChannel
          ? `Viewing pinned messages in #${selectedChannel.name}`
          : 'Viewing all pinned messages',
        action: {
          label: 'Clear Filter',
          onClick: () => {
            sessionStorage.removeItem('pinned_messages_view')
            toast.info('Pinned filter cleared')
          }
        }
      })
    }
  }

  const handleArchiveChannel = (channelName: string) => {
    // Check if already archived (to toggle)
    const isArchived = archivedChannels.has(channelName)

    if (isArchived) {
      // Unarchive the channel
      const newArchivedChannels = new Set(archivedChannels)
      newArchivedChannels.delete(channelName)
      setArchivedChannels(newArchivedChannels)

      // Update session storage
      sessionStorage.removeItem(`channel_${channelName}_archived`)
      sessionStorage.setItem('archived_channels', JSON.stringify(Array.from(newArchivedChannels)))

      toast.success(`#${channelName} restored`, {
        description: 'Channel is now visible in your sidebar',
        action: {
          label: 'Undo',
          onClick: () => handleArchiveChannel(channelName)
        }
      })
    } else {
      // Archive the channel
      const newArchivedChannels = new Set(archivedChannels)
      newArchivedChannels.add(channelName)
      setArchivedChannels(newArchivedChannels)

      // Store archive data with timestamp
      sessionStorage.setItem(`channel_${channelName}_archived`, JSON.stringify({
        archived_at: new Date().toISOString(),
        archived_by: 'current_user',
        visible: false
      }))
      sessionStorage.setItem('archived_channels', JSON.stringify(Array.from(newArchivedChannels)))

      // If the archived channel is selected, clear selection
      if (selectedChannel?.name === channelName) {
        setSelectedChannel(null)
      }

      toast.success(`#${channelName} archived`, {
        description: 'Channel hidden from sidebar. You can restore it from archived channels.',
        action: {
          label: 'Undo',
          onClick: () => handleArchiveChannel(channelName)
        }
      })
    }
  }

  const handleViewCallDetails = (callDate: string) => {
    // Load and cache call details
    sessionStorage.setItem('current_call_details', JSON.stringify({
      date: callDate,
      loaded_at: new Date().toISOString()
    }))
    toast.success(`Call scheduled for ${callDate}`)
  }

  const handleUploadFile = () => {
    setShowFileUploadDialog(true)
  }

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }

  const handleUploadSelectedFiles = () => {
    if (selectedFiles.length === 0) {
      toast.error('No files selected', { description: 'Please select files to upload' })
      return
    }
    toast.success('Files uploaded', { description: `${selectedFiles.length} file(s) uploaded successfully` })
    setSelectedFiles([])
    setShowFileUploadDialog(false)
  }

  const handleDownloadFile = (fileName: string) => {
    // Download file
    const mockFile = new Blob(['mock file content'], { type: 'text/plain' })
    const url = window.URL.createObjectURL(mockFile)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(link)
    toast.success(`${fileName} downloaded successfully`)
  }

  const handleManageActiveSessions = () => {
    setShowSessionManagementDialog(true)
  }

  const handleRevokeSession = (sessionId: number) => {
    toast.success('Session revoked', { description: `Session ${sessionId} has been terminated` })
  }

  const handleRevokeAllSessions = () => {
    toast.success('All sessions revoked', { description: 'All other sessions have been terminated' })
    setShowSessionManagementDialog(false)
  }

  const handleConnectZoom = () => {
    // Initiate Zoom OAuth flow or connection
    sessionStorage.setItem('zoom_connection', JSON.stringify({
      status: 'connected',
      connected_at: new Date().toISOString()
    }))
    toast.success('Zoom connected successfully - video calls enabled')
  }

  const handleManageWorkflows = () => {
    setShowWorkflowManagerDialog(true)
  }

  const handleToggleWorkflow = (workflowId: number, workflowName: string, currentStatus: boolean) => {
    toast.success(currentStatus ? 'Workflow disabled' : 'Workflow enabled', {
      description: `"${workflowName}" has been ${currentStatus ? 'disabled' : 'enabled'}`
    })
  }

  const handleDeleteWorkflow = (workflowId: number, workflowName: string) => {
    toast.success('Workflow deleted', { description: `"${workflowName}" has been removed` })
  }

  const handleExportData = () => {
    setShowExportDialog(true)
  }

  const handleStartExport = () => {
    const exportData = {
      messages: supabaseMessages?.length || 0,
      channels: mockChannels.length,
      format: exportFormat,
      dateRange: exportDateRange,
      exported_at: new Date().toISOString()
    }
    const dataStr = exportFormat === 'json'
      ? JSON.stringify(exportData, null, 2)
      : `Messages,Channels,Format,DateRange,ExportedAt\n${exportData.messages},${exportData.channels},${exportData.format},${exportData.dateRange},${exportData.exported_at}`
    const mimeType = exportFormat === 'json' ? 'application/json' : 'text/csv'
    const dataBlob = new Blob([dataStr], { type: mimeType })
    const url = window.URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `messages-export-${Date.now()}.${exportFormat}`
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(link)
    toast.success('Export complete', { description: `Data exported as ${exportFormat.toUpperCase()} file` })
    setShowExportDialog(false)
  }

  const handleClearCache = () => {
    // Clear local cache/sessionStorage
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('messages_cache_')) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))

    // Also clear sessionStorage
    sessionStorage.clear()
    toast.success('Cache cleared successfully')
  }

  const handleOpenDocumentation = () => {
    window.open('https://docs.example.com/messages', '_blank')
    toast.success('Documentation opened in new tab')
  }

  const handleContactSupport = () => {
    // Open support chat widget
    sessionStorage.setItem('support_chat_active', JSON.stringify({
      opened_at: new Date().toISOString(),
      session_id: Math.random().toString(36).substring(7)
    }))
    toast.success('Support chat opened - an agent will respond shortly')
  }

  const handleShowKeyboardShortcuts = () => {
    // Load and display keyboard shortcuts
    sessionStorage.setItem('shortcuts_modal_open', JSON.stringify({
      opened_at: new Date().toISOString()
    }))
    toast.success('Press Ctrl+/ anytime to view all keyboard shortcuts')
  }

  const handleCheckForUpdates = () => {
    // Check for updates from API
    const currentVersion = '2.1.0'
    sessionStorage.setItem('version_check', JSON.stringify({
      current: currentVersion,
      checked_at: new Date().toISOString(),
      is_latest: true
    }))
    toast.success('You are running the latest version')
  }

  const handleOpenFilterDialog = () => {
    setShowFilterDialog(true)
  }

  const handleApplyFilters = () => {
    // Store filter preferences in sessionStorage
    const filterPrefs = {
      type: filterType,
      dateRange: filterDateRange,
      channel: filterChannel,
      applied_at: new Date().toISOString()
    }
    sessionStorage.setItem('messages_filter_prefs', JSON.stringify(filterPrefs))

    // Apply filters to channel filter for basic filtering
    if (filterType === 'unread') {
      setChannelFilter('unread')
    } else if (filterType === 'starred') {
      setChannelFilter('starred')
    } else {
      setChannelFilter('all')
    }

    toast.success('Filters applied', {
      description: `Showing ${filterType} messages${filterDateRange !== 'all' ? ` from ${filterDateRange}` : ''}`
    })
    setShowFilterDialog(false)
  }

  const handleClearFilters = () => {
    setFilterType('all')
    setFilterDateRange('all')
    setFilterChannel('all')
    setChannelFilter('all')
    sessionStorage.removeItem('messages_filter_prefs')
    toast.info('Filters cleared', { description: 'Showing all messages' })
    setShowFilterDialog(false)
  }

  const handleToggleReaction = async (messageId: string, reactionType: ReactionType, currentHasReacted: boolean) => {
    try {
      // Find the message in mock data for display purposes
      const message = mockMessages.find(m => m.id === messageId)
      const reactionName = reactionType.replace('thumbsup', 'thumbs up').replace('plus1', '+1')

      // Store reaction state in sessionStorage
      const reactionKey = `reaction_${messageId}_${reactionType}`
      const currentState = sessionStorage.getItem(reactionKey)
      const newState = currentState === 'reacted' ? null : 'reacted'

      if (newState) {
        sessionStorage.setItem(reactionKey, newState)
        toast.success('Reaction added', {
          description: `You reacted with ${getReactionIcon(reactionType)} to the message`
        })
      } else {
        sessionStorage.removeItem(reactionKey)
        toast.info('Reaction removed', {
          description: `Removed your ${getReactionIcon(reactionType)} reaction`
        })
      }

      // If we have Supabase messages, try to update reaction count
      const supabaseMsg = supabaseMessages?.find(m => m.id === messageId)
      if (supabaseMsg) {
        await updateMessage(messageId, {
          reaction_count: newState ? (supabaseMsg.reaction_count || 0) + 1 : Math.max(0, (supabaseMsg.reaction_count || 0) - 1)
        })
      }
    } catch (error) {
      toast.error('Failed to update reaction', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  const handleSetSidebarThemeColor = (color: string) => {
    setSidebarThemeColor(color)
    // Persist to localStorage for persistence across sessions
    localStorage.setItem('messages_sidebar_theme_color', color)
    // Apply as CSS custom property for immediate visual feedback
    document.documentElement.style.setProperty('--sidebar-theme-color', color)
    toast.success('Theme color updated', {
      description: `Sidebar color set to ${color}`
    })
  }

  const handleMarkAllAsRead = async () => {
    if (!supabaseMessages || supabaseMessages.length === 0) {
      toast.info('No messages to mark as read')
      return
    }

    try {
      const unreadMessages = supabaseMessages.filter(m => !m.is_read)
      for (const msg of unreadMessages) {
        await updateMessage(msg.id, {
          is_read: true,
          read_at: new Date().toISOString(),
          status: 'read' as const
        })
      }
      toast.success('All messages marked as read', { description: `${unreadMessages.length} messages updated` })
    } catch (error) {
      toast.error('Failed to mark all as read', { description: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const handleForwardMessage = async (messageId: string, newRecipientId: string) => {
    const originalMessage = supabaseMessages?.find(m => m.id === messageId)
    if (!originalMessage) {
      toast.error('Message not found')
      return
    }

    try {
      await createMessage({
        body: originalMessage.body,
        subject: originalMessage.subject ? `Fwd: ${originalMessage.subject}` : null,
        recipient_id: newRecipientId,
        sender_id: currentUser.id,
        message_type: 'direct' as const,
        status: 'sent' as const,
        priority: originalMessage.priority,
        folder: 'sent',
        is_read: false,
        is_pinned: false,
        is_starred: false,
        is_important: false,
        is_spam: false,
        is_forwarded: true,
        forwarded_from_message_id: messageId,
        is_encrypted: false,
        is_scheduled: false,
        has_attachments: originalMessage.has_attachments,
        attachment_count: originalMessage.attachment_count,
        reaction_count: 0
      })
      toast.success('Message forwarded', { description: 'Message has been forwarded successfully' })
    } catch (error) {
      toast.error('Failed to forward message', { description: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const handleReplyToMessage = async (parentMessageId: string, replyBodyText: string) => {
    const parentMessage = supabaseMessages?.find(m => m.id === parentMessageId)
    if (!parentMessage) {
      toast.error('Original message not found')
      return
    }

    try {
      await createMessage({
        body: replyBodyText,
        subject: parentMessage.subject ? `Re: ${parentMessage.subject}` : null,
        recipient_id: parentMessage.sender_id,
        sender_id: currentUser.id,
        parent_message_id: parentMessageId,
        reply_to_message_id: parentMessageId,
        thread_id: parentMessage.thread_id || parentMessageId,
        message_type: 'direct' as const,
        status: 'sent' as const,
        priority: 'normal' as const,
        folder: 'sent',
        is_read: false,
        is_pinned: false,
        is_starred: false,
        is_important: false,
        is_spam: false,
        is_forwarded: false,
        is_encrypted: false,
        is_scheduled: false,
        has_attachments: false,
        attachment_count: 0,
        reaction_count: 0
      })
      toast.success('Reply sent', { description: 'Your reply has been sent' })
    } catch (error) {
      toast.error('Failed to send reply', { description: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  // Open reply dialog
  const handleOpenReplyDialog = (messageId: string) => {
    setReplyMessageId(messageId)
    setReplyBody('')
    setShowReplyDialog(true)
  }

  // Submit reply from dialog
  const handleSubmitReply = async () => {
    if (!replyMessageId || !replyBody.trim()) {
      toast.error('Reply required', { description: 'Please enter a reply message' })
      return
    }
    await handleReplyToMessage(replyMessageId, replyBody)
    setShowReplyDialog(false)
    setReplyBody('')
    setReplyMessageId(null)
  }

  // Open forward dialog
  const handleOpenForwardDialog = (messageId: string) => {
    setForwardMessageId(messageId)
    setForwardRecipient('')
    setShowForwardDialog(true)
  }

  // Submit forward from dialog
  const handleSubmitForward = async () => {
    if (!forwardMessageId || !forwardRecipient) {
      toast.error('Recipient required', { description: 'Please select a recipient' })
      return
    }
    await handleForwardMessage(forwardMessageId, forwardRecipient)
    setShowForwardDialog(false)
    setForwardRecipient('')
    setForwardMessageId(null)
  }

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    if (!deleteMessageId) return
    await handleDeleteMessage(deleteMessageId)
    setShowDeleteConfirmDialog(false)
    setDeleteMessageId(null)
  }

  // Open delete confirmation
  const handleOpenDeleteConfirm = (messageId: string) => {
    setDeleteMessageId(messageId)
    setShowDeleteConfirmDialog(true)
  }

  // Confirm archive handler
  const handleConfirmArchive = async () => {
    if (!archiveMessageId) return
    await handleArchiveMessage(archiveMessageId)
    setShowArchiveConfirmDialog(false)
    setArchiveMessageId(null)
  }

  // Open archive confirmation
  const handleOpenArchiveConfirm = (messageId: string) => {
    setArchiveMessageId(messageId)
    setShowArchiveConfirmDialog(true)
  }

  // Browse channels handler
  const handleBrowseChannels = () => {
    setChannelFilter('all')
    toast.success('Browsing Channels', { description: `Showing all ${mockChannels.length} channels` })
  }

  // View archived channels handler
  const handleViewArchivedChannels = async () => {
    const archivedList = Array.from(archivedChannels)
    if (archivedList.length === 0) {
      toast.info('No Archived Channels', { description: 'You have no archived channels' })
    } else {
      toast.success('Archived Channels', {
        description: `${archivedList.length} archived channel(s): ${archivedList.join(', ')}`,
        action: {
          label: 'Restore All',
          onClick: () => {
            setArchivedChannels(new Set())
            sessionStorage.removeItem('archived_channels')
            toast.success('All channels restored')
          }
        }
      })
    }
  }

  // View saved messages handler
  const handleViewSavedMessages = async () => {
    const savedMessages = supabaseMessages?.filter(m => m.is_starred) || []
    const mockSaved = mockMessages.filter(m => m.isBookmarked)
    const totalSaved = savedMessages.length + mockSaved.length

    if (totalSaved === 0) {
      toast.info('No Saved Messages', { description: 'Bookmark messages to save them here' })
    } else {
      setShowSavedMessages(true)
      toast.success(`${totalSaved} Saved Messages`, { description: 'Viewing your bookmarked messages' })
    }
  }

  // Filter files by type
  const handleFilterFilesByType = (type: 'all' | 'images' | 'videos' | 'documents' | 'code') => {
    setFileTypeFilter(type)
    const typeLabels = { all: 'all files', images: 'image files', videos: 'video files', documents: 'document files', code: 'code files' }
    toast.success(`Filtering ${typeLabels[type]}`, { description: `Showing ${type === 'all' ? 'all' : type} only` })
  }

  // Filter threads
  const handleFilterThreads = (filter: 'all' | 'following' | 'unread' | 'mentions' | 'archived') => {
    setThreadFilter(filter)
    const filterLabels = { all: 'all threads', following: 'threads you follow', unread: 'unread threads', mentions: 'threads with mentions', archived: 'archived threads' }
    const count = filter === 'unread' ? mockThreads.filter(t => t.isUnread).length :
                  filter === 'following' ? mockThreads.filter(t => t.isFollowing).length :
                  mockThreads.length
    toast.success(`Showing ${filterLabels[filter]}`, { description: `Found ${count} thread(s)` })
  }

  // Filter mentions
  const handleFilterMentions = (filter: 'all' | 'unread' | 'reactions' | 'starred') => {
    setMentionFilter(filter)
    const filterLabels = { all: 'all mentions', unread: 'unread mentions', reactions: 'messages with reactions', starred: 'starred mentions' }
    toast.success(`Showing ${filterLabels[filter]}`, { description: 'Filter applied' })
  }

  // Schedule call handler
  const handleScheduleCall = () => {
    setShowScheduleCallDialog(true)
  }

  // Submit scheduled call
  const handleSubmitScheduledCall = async () => {
    if (!scheduleCallDate || !scheduleCallTime) {
      toast.error('Date and time required', { description: 'Please select a date and time for the call' })
      return
    }

    const scheduledDateTime = new Date(`${scheduleCallDate}T${scheduleCallTime}`)
    const callData = {
      type: scheduleCallType,
      scheduled_at: scheduledDateTime.toISOString(),
      participants: scheduleCallParticipants.split(',').map(p => p.trim()).filter(p => p),
      created_at: new Date().toISOString()
    }

    // Store scheduled call
    const existingCalls = JSON.parse(sessionStorage.getItem('scheduled_calls') || '[]')
    existingCalls.push(callData)
    sessionStorage.setItem('scheduled_calls', JSON.stringify(existingCalls))

    toast.success('Call Scheduled', {
      description: `${scheduleCallType === 'video' ? 'Video' : 'Audio'} call scheduled for ${scheduledDateTime.toLocaleString()}`
    })

    setShowScheduleCallDialog(false)
    setScheduleCallDate('')
    setScheduleCallTime('')
    setScheduleCallParticipants('')
  }

  // Start huddle handler
  const handleStartHuddle = () => {
    const huddleData = {
      type: 'huddle',
      started_at: new Date().toISOString(),
      channel: selectedChannel?.name || 'Quick Huddle'
    }
    sessionStorage.setItem('active_huddle', JSON.stringify(huddleData))
    toast.success('Huddle Started', {
      description: `Quick huddle in ${selectedChannel?.name || 'new channel'}`,
      action: {
        label: 'End Huddle',
        onClick: () => {
          sessionStorage.removeItem('active_huddle')
          toast.info('Huddle ended')
        }
      }
    })
  }

  // Screen share handler
  const handleStartScreenShare = async () => {
    try {
      toast.loading('Requesting screen access...', { id: 'screen-share' })
      // Check if screen sharing is supported
      if (navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices) {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        sessionStorage.setItem('screen_share_active', JSON.stringify({ started_at: new Date().toISOString() }))
        toast.success('Screen Share Active', {
          id: 'screen-share',
          description: 'Your screen is now being shared',
          action: {
            label: 'Stop Sharing',
            onClick: () => {
              stream.getTracks().forEach(track => track.stop())
              sessionStorage.removeItem('screen_share_active')
              toast.info('Screen sharing stopped')
            }
          }
        })
      } else {
        toast.error('Screen sharing not supported', { id: 'screen-share', description: 'Your browser does not support screen sharing' })
      }
    } catch (error) {
      toast.error('Screen share failed', { id: 'screen-share', description: 'Could not access screen. Permission may have been denied.' })
    }
  }

  // View call recordings handler
  const handleViewCallRecordings = () => {
    const recordings = mockCalls.filter(c => c.isRecorded)
    if (recordings.length === 0) {
      toast.info('No Recordings', { description: 'No call recordings available' })
    } else {
      toast.success(`${recordings.length} Recording(s)`, { description: 'Showing your call recordings' })
    }
  }

  // View call history handler
  const handleViewCallHistory = () => {
    const completedCalls = mockCalls.filter(c => c.status === 'ended' || c.status === 'missed')
    toast.success('Call History', { description: `${completedCalls.length} calls in history. ${mockCalls.filter(c => c.status === 'missed').length} missed.` })
  }

  // Open call settings handler
  const handleOpenCallSettings = () => {
    toast.info('Call Settings', {
      description: 'Audio: Default microphone, Video: Default camera',
      action: {
        label: 'Configure',
        onClick: () => setSettingsTab('notifications')
      }
    })
  }

  // Open channel settings handler
  const handleOpenChannelSettings = () => {
    if (!selectedChannel) {
      toast.info('Select a Channel', { description: 'Please select a channel to configure its settings' })
      return
    }
    toast.success(`#${selectedChannel.name} Settings`, {
      description: `Members: ${selectedChannel.memberCount}, Type: ${selectedChannel.type}`,
      action: {
        label: 'Open Settings Tab',
        onClick: () => setSettingsTab('general')
      }
    })
  }

  // Leave workspace handler with confirmation
  const handleLeaveWorkspace = () => {
    setShowLeaveWorkspaceDialog(true)
  }

  const handleConfirmLeaveWorkspace = () => {
    sessionStorage.clear()
    toast.success('Left Workspace', { description: 'You have left the workspace. Redirecting...' })
    setShowLeaveWorkspaceDialog(false)
  }

  // AI Insight action handler
  const handleAIInsightAction = (insight: { id: string; title: string; description: string }) => {
    toast.success(`AI Insight: ${insight.title}`, {
      description: insight.description,
      action: {
        label: 'Apply',
        onClick: () => toast.info('Insight Applied', { description: 'AI recommendation has been applied' })
      }
    })
  }

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
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Slack-level team communication platform
                {messagesLoading && <span className="ml-2 text-blue-500">(Loading...)</span>}
                {messagesError && <span className="ml-2 text-red-500">(Error loading messages)</span>}
                {supabaseMessages && <span className="ml-2 text-green-500">({supabaseMessages.length} messages from Supabase)</span>}
              </p>
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
            <Button variant="outline" size="icon" onClick={handleOpenFilterDialog}>
              <Filter className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} disabled={mutating}>
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
            <Button className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white" onClick={() => {
              setMessageInput('')
              toast.info('Compose Message', { description: 'Use the message input below to send a new message' })
            }}>
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
            {/* Channels Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Channels & Workspaces</h2>
                  <p className="text-purple-100">Slack-level team communication and collaboration</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockChannels.length}</p>
                    <p className="text-purple-200 text-sm">Channels</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.unreadMessages}</p>
                    <p className="text-purple-200 text-sm">Unread</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.onlineMembers}</p>
                    <p className="text-purple-200 text-sm">Online</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Channels Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'New Channel', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', action: () => handleCreateChannel() },
                { icon: Hash, label: 'Browse', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', action: () => handleBrowseChannels() },
                { icon: UserPlus, label: 'Invite', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', action: () => handleInvitePeople() },
                { icon: Star, label: 'Starred', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', action: () => { setChannelFilter('starred'); toast.success('Starred Channels', { description: `Found ${mockChannels.filter(c => c.isStarred).length} starred channels` }) } },
                { icon: Bot, label: 'Apps', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', action: () => handleOpenMarketplace() },
                { icon: Workflow, label: 'Workflows', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', action: () => handleCreateWorkflow() },
                { icon: Archive, label: 'Archive', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', action: () => handleViewArchivedChannels() },
                { icon: Settings, label: 'Settings', color: 'bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400', action: () => handleOpenChannelSettings() },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.action}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

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
                    <Button variant="outline" className="w-full justify-start" onClick={handleCreateChannel}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Channel
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={handleInvitePeople}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite People
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={handleOpenMarketplace}>
                      <Bot className="w-4 h-4 mr-2" />
                      Add App
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={handleCreateWorkflow}>
                      <Workflow className="w-4 h-4 mr-2" />
                      Create Workflow
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={handleMarkAllAsRead} disabled={mutating}>
                      <CheckCheck className="w-4 h-4 mr-2" />
                      Mark All Read
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={refetchMessages} disabled={messagesLoading}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Messages
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
            {/* Messages Banner */}
            <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Direct Messages</h2>
                  <p className="text-rose-100">Private conversations with instant delivery</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.totalMessages.toLocaleString()}</p>
                    <p className="text-rose-200 text-sm">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.unreadMessages}</p>
                    <p className="text-rose-200 text-sm">Unread</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.mentions}</p>
                    <p className="text-rose-200 text-sm">Mentions</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'New DM', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', action: () => { setSelectedChannel(directMessages[0] || null); toast.success('New Direct Message', { description: directMessages.length > 0 ? `Selected ${directMessages[0].name}` : 'No contacts available' }) } },
                { icon: Send, label: 'Compose', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', action: () => { setMessageInput(''); document.querySelector<HTMLInputElement>('input[placeholder*="Message"]')?.focus(); toast.success('Compose Message', { description: 'Start typing your message below' }) } },
                { icon: Reply, label: 'Reply All', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400', action: () => { if (channelMessages.length > 0) { handleOpenReplyDialog(channelMessages[0].id) } else { toast.info('No Messages', { description: 'Select a conversation with messages first' }) } } },
                { icon: Forward, label: 'Forward', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', action: () => { if (channelMessages.length > 0) { handleOpenForwardDialog(channelMessages[0].id) } else { toast.info('No Messages', { description: 'Select a conversation with messages first' }) } } },
                { icon: Bookmark, label: 'Saved', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', action: () => handleViewSavedMessages() },
                { icon: Pin, label: 'Pinned', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', action: () => handleViewPinnedMessages() },
                { icon: Search, label: 'Search', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', action: () => { document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')?.focus(); toast.success('Search Messages', { description: 'Type your search query' }) } },
                { icon: Filter, label: 'Filter', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', action: () => handleOpenFilterDialog() },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.action}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

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
                          <Button variant="ghost" size="icon" onClick={() => handleStartCall(selectedChannel.name, 'audio')} title="Start audio call"><Phone className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleStartCall(selectedChannel.name, 'video')} title="Start video call"><Video className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={handleViewPinnedMessages} title="View pinned messages"><Pin className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleMuteChannel(selectedChannel.name)} title={mutedChannels.has(selectedChannel.name) ? 'Unmute channel' : 'Mute channel'}>{mutedChannels.has(selectedChannel.name) ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}</Button>
                          <Button variant="ghost" size="icon" onClick={() => handleArchiveChannel(selectedChannel.name)} title={archivedChannels.has(selectedChannel.name) ? 'Restore channel' : 'Archive channel'}><Archive className="w-4 h-4" /></Button>
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
                                    <Button key={idx} variant="outline" size="sm" className="h-6 px-2 text-xs" onClick={() => handleToggleReaction(message.id, reaction.type, reaction.hasReacted)}>
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
                        <Input placeholder={`Message #${selectedChannel.name}`} value={messageInput} onChange={(e) => setMessageInput(e.target.value)} className="flex-1" onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
                        <Button onClick={handleSendMessage} disabled={mutating || !messageInput.trim()}>
                          <Send className="w-4 h-4" />
                        </Button>
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
            {/* Threads Banner */}
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Threaded Conversations</h2>
                  <p className="text-amber-100">Keep discussions organized with focused threads</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockThreads.length}</p>
                    <p className="text-amber-200 text-sm">Total Threads</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.activeThreads}</p>
                    <p className="text-amber-200 text-sm">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockThreads.filter(t => t.isFollowing).length}</p>
                    <p className="text-amber-200 text-sm">Following</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Threads Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: MessageCircle, label: 'All Threads', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', action: () => handleFilterThreads('all') },
                { icon: Star, label: 'Following', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', action: () => handleFilterThreads('following') },
                { icon: Inbox, label: 'Unread', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', action: () => handleFilterThreads('unread') },
                { icon: Reply, label: 'My Replies', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', action: () => { setThreadFilter('all'); toast.success('My Replies', { description: `Showing ${mockThreads.filter(t => t.participants.some(p => p.id === currentUser.id)).length} threads with your replies` }) } },
                { icon: AtSign, label: 'Mentions', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', action: () => handleFilterThreads('mentions') },
                { icon: Archive, label: 'Archived', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400', action: () => handleFilterThreads('archived') },
                { icon: Search, label: 'Search', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', action: () => { document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')?.focus(); toast.success('Search Threads', { description: 'Enter your search query' }) } },
                { icon: Settings, label: 'Settings', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', action: () => { setSettingsTab('notifications'); toast.success('Thread Settings', { description: 'Configure thread notification preferences' }) } },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.action}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

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
            {/* Calls Banner */}
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Voice & Video Calls</h2>
                  <p className="text-green-100">Zoom-level calling with huddles and screen sharing</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.totalCalls}</p>
                    <p className="text-green-200 text-sm">Today</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockCalls.filter(c => c.status === 'ongoing').length}</p>
                    <p className="text-green-200 text-sm">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockCalls.filter(c => c.status === 'scheduled').length}</p>
                    <p className="text-green-200 text-sm">Scheduled</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Calls Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Phone, label: 'Start Call', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', action: () => handleStartCall(selectedChannel?.name || 'New Call', 'audio') },
                { icon: Video, label: 'Video Call', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', action: () => handleStartCall(selectedChannel?.name || 'Video Call', 'video') },
                { icon: Headphones, label: 'Huddle', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', action: () => handleStartHuddle() },
                { icon: ScreenShare, label: 'Share', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', action: () => handleStartScreenShare() },
                { icon: Calendar, label: 'Schedule', color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400', action: () => handleScheduleCall() },
                { icon: PlayCircle, label: 'Recordings', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', action: () => handleViewCallRecordings() },
                { icon: Clock, label: 'History', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', action: () => handleViewCallHistory() },
                { icon: Settings, label: 'Settings', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', action: () => handleOpenCallSettings() },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.action}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

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
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => {
                            setActiveCall(call)
                            toast.success('Joining call', { description: `You are now in ${call.channelName}` })
                          }}>
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
                          <Button variant="outline" size="sm" onClick={() => handleViewCallDetails(new Date(call.startTime).toLocaleString())}>View</Button>
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
            {/* Files Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">File Management</h2>
                  <p className="text-blue-100">Dropbox-level file sharing with search and preview</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.totalFiles}</p>
                    <p className="text-blue-200 text-sm">Total Files</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockFiles.reduce((sum, f) => sum + f.downloads, 0)}</p>
                    <p className="text-blue-200 text-sm">Downloads</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">18.5GB</p>
                    <p className="text-blue-200 text-sm">Storage</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Files Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Upload, label: 'Upload', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', action: () => handleUploadFile() },
                { icon: FolderOpen, label: 'Browse', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', action: () => handleFilterFilesByType('all') },
                { icon: Image, label: 'Images', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', action: () => handleFilterFilesByType('images') },
                { icon: Video, label: 'Videos', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', action: () => handleFilterFilesByType('videos') },
                { icon: FileText, label: 'Documents', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400', action: () => handleFilterFilesByType('documents') },
                { icon: Code, label: 'Code', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', action: () => handleFilterFilesByType('code') },
                { icon: Search, label: 'Search', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', action: () => { document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')?.focus(); toast.success('Search Files', { description: 'Enter your search query' }) } },
                { icon: Settings, label: 'Settings', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', action: () => { setSettingsTab('advanced'); toast.success('File Settings', { description: 'Configure storage and retention settings' }) } },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.action}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Shared Files</CardTitle>
                    <CardDescription>All files shared across channels</CardDescription>
                  </div>
                  <Button onClick={handleUploadFile}>
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
                        <Button variant="outline" size="icon" onClick={() => handleDownloadFile(file.name)}>
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
            {/* Mentions Banner */}
            <div className="bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Mentions & Reactions</h2>
                  <p className="text-cyan-100">Never miss important conversations about you</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockMentions.length}</p>
                    <p className="text-cyan-200 text-sm">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.mentions}</p>
                    <p className="text-cyan-200 text-sm">Unread</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">12</p>
                    <p className="text-cyan-200 text-sm">Reactions</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mentions Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: AtSign, label: 'All Mentions', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', action: () => handleFilterMentions('all') },
                { icon: Inbox, label: 'Unread', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', action: () => handleFilterMentions('unread') },
                { icon: ThumbsUp, label: 'Reactions', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', action: () => handleFilterMentions('reactions') },
                { icon: Star, label: 'Starred', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', action: () => handleFilterMentions('starred') },
                { icon: Reply, label: 'Reply All', color: 'bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400', action: () => { if (mockMentions.length > 0) { handleOpenReplyDialog(mockMentions[0].message.id) } else { toast.info('No Mentions', { description: 'No mentions to reply to' }) } } },
                { icon: CheckCheck, label: 'Mark Read', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400', action: () => handleMarkAllAsRead() },
                { icon: Filter, label: 'Filter', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', action: () => handleOpenFilterDialog() },
                { icon: Settings, label: 'Settings', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', action: () => { setSettingsTab('notifications'); toast.success('Mention Settings', { description: 'Configure mention notification preferences' }) } },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.action}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

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
                        <Button variant="ghost" size="icon" onClick={() => {
                          toast.info('Reply', { description: 'Enter your reply in the message input below' })
                          setMessageInput(`@${mention.message.author.name} `)
                        }}>
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
                      <Input placeholder="Search messages..." className="pl-10 h-12 text-lg" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <Button size="lg" onClick={() => {
                      if (!searchQuery.trim()) {
                        toast.error('Search required', { description: 'Please enter a search term' })
                        return
                      }
                      const results = supabaseMessages?.filter(m =>
                        m.body?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        m.subject?.toLowerCase().includes(searchQuery.toLowerCase())
                      ) || []
                      toast.success(`Search complete`, { description: `Found ${results.length} matching messages` })
                    }}>Search</Button>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 text-center">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Workspace Name</Label>
                            <Input defaultValue="FreeFlow Team" />
                          </div>
                          <div className="space-y-2">
                            <Label>Workspace URL</Label>
                            <Input defaultValue="freeflow.slack.com" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                                className={`w-8 h-8 rounded-full border-2 shadow-sm hover:scale-110 transition-transform ${sidebarThemeColor === color ? 'border-gray-900 dark:border-white ring-2 ring-offset-2 ring-gray-400' : 'border-white'}`}
                                style={{ backgroundColor: color }}
                                onClick={() => handleSetSidebarThemeColor(color)}
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
                        <Button variant="outline" className="w-full" onClick={handleManageActiveSessions}>
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
                          <Button variant="outline" size="sm" onClick={handleConnectZoom}>Connect</Button>
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
                          <Button variant="outline" size="sm" onClick={handleManageWorkflows}>Manage</Button>
                        </div>
                        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" onClick={handleOpenMarketplace}>
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
                          <Button variant="outline" className="flex-1" onClick={handleExportData}>
                            <Download className="w-4 h-4 mr-2" />
                            Export Data
                          </Button>
                          <Button variant="outline" className="flex-1" onClick={handleClearCache}>
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
                        <Button variant="outline" className="w-full justify-start" onClick={handleOpenDocumentation}>
                          <BookOpen className="w-4 h-4 mr-2" />
                          Documentation
                        </Button>
                        <Button variant="outline" className="w-full justify-start" onClick={handleContactSupport}>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Contact Support
                        </Button>
                        <Button variant="outline" className="w-full justify-start" onClick={handleShowKeyboardShortcuts}>
                          <Zap className="w-4 h-4 mr-2" />
                          Keyboard Shortcuts
                        </Button>
                        <Button variant="outline" className="w-full justify-start" onClick={handleCheckForUpdates}>
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
                          <Button variant="destructive" size="sm" onClick={handleLeaveWorkspace}>
                            <LogOut className="w-4 h-4 mr-2" />
                            Leave
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                          <div>
                            <div className="font-medium text-red-700 dark:text-red-400">Delete All Messages</div>
                            <div className="text-sm text-red-600 dark:text-red-500">Permanently delete all your messages</div>
                          </div>
                          <Button variant="destructive" size="sm" onClick={async () => {
                            if (!supabaseMessages || supabaseMessages.length === 0) {
                              toast.info('No messages to delete')
                              return
                            }
                            if (confirm('Are you sure you want to delete all messages? This cannot be undone.')) {
                              try {
                                for (const msg of supabaseMessages) {
                                  await deleteMessage(msg.id, true)
                                }
                                toast.success('All messages deleted', { description: 'All your messages have been permanently deleted' })
                              } catch (error) {
                                toast.error('Failed to delete messages', { description: error instanceof Error ? error.message : 'Unknown error' })
                              }
                            }
                          }} disabled={mutating}>
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

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={messagesAIInsights}
              title="Messaging Intelligence"
              onInsightAction={(insight) => handleAIInsightAction(insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={messagesCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={messagesPredictions}
              title="Communication Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={messagesActivities}
            title="Message Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={messagesQuickActions}
            variant="grid"
          />
        </div>
      </div>

      {/* Invite Team Members Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              Invite Team Members
            </DialogTitle>
            <DialogDescription>
              Send invitations to team members to join this workspace
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-emails">Email Addresses</Label>
              <Textarea
                id="invite-emails"
                placeholder="Enter email addresses separated by commas..."
                value={inviteEmails}
                onChange={(e) => setInviteEmails(e.target.value)}
                className="min-h-[100px]"
              />
              <p className="text-xs text-gray-500">Separate multiple emails with commas</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-message">Personal Message (Optional)</Label>
              <Textarea
                id="invite-message"
                placeholder="Add a personal note to your invitation..."
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700 dark:text-blue-400">
                Invitees will receive an email with a link to join
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendInvites} className="bg-blue-600 hover:bg-blue-700">
              <Send className="w-4 h-4 mr-2" />
              Send Invitations
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Workflow Builder Dialog */}
      <Dialog open={showWorkflowBuilderDialog} onOpenChange={setShowWorkflowBuilderDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Workflow className="w-5 h-5 text-purple-600" />
              Create New Workflow
            </DialogTitle>
            <DialogDescription>
              Build automation flows to streamline your messaging
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="workflow-name">Workflow Name</Label>
              <Input
                id="workflow-name"
                placeholder="Enter workflow name..."
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Trigger</Label>
              <Select value={workflowTrigger} onValueChange={setWorkflowTrigger}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a trigger..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new_message">New message received</SelectItem>
                  <SelectItem value="mention">When mentioned</SelectItem>
                  <SelectItem value="keyword">Keyword detected</SelectItem>
                  <SelectItem value="schedule">On a schedule</SelectItem>
                  <SelectItem value="reaction">Reaction added</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Action</Label>
              <Select value={workflowAction} onValueChange={setWorkflowAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an action..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="send_reply">Send auto-reply</SelectItem>
                  <SelectItem value="forward">Forward message</SelectItem>
                  <SelectItem value="notify">Send notification</SelectItem>
                  <SelectItem value="tag">Add tag/label</SelectItem>
                  <SelectItem value="archive">Archive message</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <Zap className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-purple-700 dark:text-purple-400">
                Workflows run automatically when triggered
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWorkflowBuilderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNewWorkflow} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Upload Dialog */}
      <Dialog open={showFileUploadDialog} onOpenChange={setShowFileUploadDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-green-600" />
              Upload Files
            </DialogTitle>
            <DialogDescription>
              Select files to share with your team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <input
                type="file"
                multiple
                onChange={handleFileSelection}
                className="hidden"
                id="file-upload-input"
              />
              <label htmlFor="file-upload-input" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Click to select files or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  Maximum file size: 50MB
                </p>
              </label>
            </div>
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Files ({selectedFiles.length})</Label>
                <div className="max-h-[150px] overflow-y-auto space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm truncate max-w-[300px]">{file.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setSelectedFiles([]); setShowFileUploadDialog(false) }}>
              Cancel
            </Button>
            <Button onClick={handleUploadSelectedFiles} className="bg-green-600 hover:bg-green-700">
              <Upload className="w-4 h-4 mr-2" />
              Upload {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Session Management Dialog */}
      <Dialog open={showSessionManagementDialog} onOpenChange={setShowSessionManagementDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-600" />
              Active Sessions
            </DialogTitle>
            <DialogDescription>
              View and manage your active sessions across devices
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              {[
                { id: 1, device: 'Chrome - MacBook Pro', location: 'San Francisco, CA', lastActive: 'Now', current: true },
                { id: 2, device: 'Safari - iPad', location: 'San Francisco, CA', lastActive: '1 hour ago', current: false },
                { id: 3, device: 'Chrome - Windows PC', location: 'New York, NY', lastActive: '3 hours ago', current: false },
              ].map((session) => (
                <div key={session.id} className={`flex items-center justify-between p-3 rounded-lg ${session.current ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-800'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${session.current ? 'bg-green-100 dark:bg-green-800' : 'bg-gray-200 dark:bg-gray-700'}`}>
                      <HardDrive className={`w-5 h-5 ${session.current ? 'text-green-600' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{session.device}</p>
                        {session.current && <Badge className="bg-green-100 text-green-700 text-xs">Current</Badge>}
                      </div>
                      <p className="text-xs text-gray-500">{session.location} - {session.lastActive}</p>
                    </div>
                  </div>
                  {!session.current && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevokeSession(session.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
              <Shield className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-amber-700 dark:text-amber-400">
                Revoking a session will log out that device immediately
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSessionManagementDialog(false)}>
              Close
            </Button>
            <Button variant="destructive" onClick={handleRevokeAllSessions}>
              <LogOut className="w-4 h-4 mr-2" />
              Revoke All Other Sessions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Workflow Manager Dialog */}
      <Dialog open={showWorkflowManagerDialog} onOpenChange={setShowWorkflowManagerDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Workflow className="w-5 h-5 text-indigo-600" />
              Manage Workflows
            </DialogTitle>
            <DialogDescription>
              View and edit your automation workflows
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              {[
                { id: 1, name: 'Auto-reply for Mentions', trigger: 'When mentioned', active: true },
                { id: 2, name: 'Message Categorization', trigger: 'New message received', active: true },
                { id: 3, name: 'Daily Digest', trigger: 'On a schedule', active: true },
                { id: 4, name: 'Priority Alerts', trigger: 'Keyword detected', active: false },
              ].map((workflow) => (
                <div key={workflow.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${workflow.active ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-gray-200 dark:bg-gray-700'}`}>
                      <Workflow className={`w-5 h-5 ${workflow.active ? 'text-indigo-600' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <p className="font-medium">{workflow.name}</p>
                      <p className="text-xs text-gray-500">Trigger: {workflow.trigger}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={workflow.active}
                      onCheckedChange={() => handleToggleWorkflow(workflow.id, workflow.name, workflow.active)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteWorkflow(workflow.id, workflow.name)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWorkflowManagerDialog(false)}>
              Close
            </Button>
            <Button onClick={() => { setShowWorkflowManagerDialog(false); setShowWorkflowBuilderDialog(true) }} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Create New Workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Data Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-cyan-600" />
              Export Data
            </DialogTitle>
            <DialogDescription>
              Download your messages and data
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={exportDateRange} onValueChange={setExportDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="90">Last 90 Days</SelectItem>
                  <SelectItem value="365">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 space-y-2">
              <p className="font-medium text-sm">Export Summary</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 text-sm">
                <div className="text-gray-500">Messages:</div>
                <div className="font-medium">{supabaseMessages?.length || 0}</div>
                <div className="text-gray-500">Channels:</div>
                <div className="font-medium">{mockChannels.length}</div>
                <div className="text-gray-500">Format:</div>
                <div className="font-medium">{exportFormat.toUpperCase()}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-cyan-50 dark:bg-cyan-900/20">
              <Files className="w-4 h-4 text-cyan-600" />
              <span className="text-sm text-cyan-700 dark:text-cyan-400">
                Your download will start automatically
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleStartExport} className="bg-cyan-600 hover:bg-cyan-700">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filter Messages Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-purple-600" />
              Filter Messages
            </DialogTitle>
            <DialogDescription>
              Customize which messages are displayed
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Message Type</Label>
              <Select value={filterType} onValueChange={(value: 'all' | 'unread' | 'starred' | 'pinned') => setFilterType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select message type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Messages</SelectItem>
                  <SelectItem value="unread">Unread Only</SelectItem>
                  <SelectItem value="starred">Starred</SelectItem>
                  <SelectItem value="pinned">Pinned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={filterDateRange} onValueChange={(value: 'all' | 'today' | 'week' | 'month') => setFilterDateRange(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Channel</Label>
              <Select value={filterChannel} onValueChange={setFilterChannel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  {mockChannels.map(channel => (
                    <SelectItem key={channel.id} value={channel.id}>
                      {channel.type === 'direct' ? channel.name : `#${channel.name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <Filter className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-purple-700 dark:text-purple-400">
                {filterType === 'all' && filterDateRange === 'all' && filterChannel === 'all'
                  ? 'No filters applied - showing all messages'
                  : `Filtering: ${filterType !== 'all' ? filterType : ''}${filterDateRange !== 'all' ? ` from ${filterDateRange}` : ''}${filterChannel !== 'all' ? ` in selected channel` : ''}`
                }
              </span>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
            <Button onClick={handleApplyFilters} className="bg-purple-600 hover:bg-purple-700">
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Reply className="w-5 h-5 text-blue-600" />
              Reply to Message
            </DialogTitle>
            <DialogDescription>
              Send a reply to this conversation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reply-body">Your Reply</Label>
              <Textarea
                id="reply-body"
                placeholder="Type your reply here..."
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <Reply className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700 dark:text-blue-400">
                Your reply will be sent to the original sender
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowReplyDialog(false); setReplyBody(''); setReplyMessageId(null); }}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReply} disabled={mutating || !replyBody.trim()} className="bg-blue-600 hover:bg-blue-700">
              <Send className="w-4 h-4 mr-2" />
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Forward Dialog */}
      <Dialog open={showForwardDialog} onOpenChange={setShowForwardDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Forward className="w-5 h-5 text-purple-600" />
              Forward Message
            </DialogTitle>
            <DialogDescription>
              Choose a recipient to forward this message to
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Recipient</Label>
              <Select value={forwardRecipient} onValueChange={setForwardRecipient}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a recipient..." />
                </SelectTrigger>
                <SelectContent>
                  {mockUsers.filter(u => !u.isBot && u.id !== currentUser.id).map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">{user.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {user.displayName}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <Forward className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-purple-700 dark:text-purple-400">
                The message will be forwarded with a "Forwarded" label
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowForwardDialog(false); setForwardRecipient(''); setForwardMessageId(null); }}>
              Cancel
            </Button>
            <Button onClick={handleSubmitForward} disabled={mutating || !forwardRecipient} className="bg-purple-600 hover:bg-purple-700">
              <Forward className="w-4 h-4 mr-2" />
              Forward Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Delete Message
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <AlertOctagon className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-700 dark:text-red-400">
                This message will be permanently deleted
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDeleteConfirmDialog(false); setDeleteMessageId(null); }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={mutating}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation Dialog */}
      <Dialog open={showArchiveConfirmDialog} onOpenChange={setShowArchiveConfirmDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <Archive className="w-5 h-5" />
              Archive Message
            </DialogTitle>
            <DialogDescription>
              Move this message to your archive? You can restore it later.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <Archive className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-amber-700 dark:text-amber-400">
                Archived messages can be found in the Archive folder
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowArchiveConfirmDialog(false); setArchiveMessageId(null); }}>
              Cancel
            </Button>
            <Button onClick={handleConfirmArchive} disabled={mutating} className="bg-amber-600 hover:bg-amber-700">
              <Archive className="w-4 h-4 mr-2" />
              Archive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave Workspace Confirmation Dialog */}
      <Dialog open={showLeaveWorkspaceDialog} onOpenChange={setShowLeaveWorkspaceDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <LogOut className="w-5 h-5" />
              Leave Workspace
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to leave this workspace? You will lose access to all channels and messages.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <AlertOctagon className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-700 dark:text-red-400">
                You will need an invite to rejoin this workspace
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLeaveWorkspaceDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmLeaveWorkspace}>
              <LogOut className="w-4 h-4 mr-2" />
              Leave Workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Call Dialog */}
      <Dialog open={showScheduleCallDialog} onOpenChange={setShowScheduleCallDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-600" />
              Schedule a Call
            </DialogTitle>
            <DialogDescription>
              Set up a scheduled call with your team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label htmlFor="call-date">Date</Label>
                <Input
                  id="call-date"
                  type="date"
                  value={scheduleCallDate}
                  onChange={(e) => setScheduleCallDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="call-time">Time</Label>
                <Input
                  id="call-time"
                  type="time"
                  value={scheduleCallTime}
                  onChange={(e) => setScheduleCallTime(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Call Type</Label>
              <Select value={scheduleCallType} onValueChange={(v: 'audio' | 'video') => setScheduleCallType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      Video Call
                    </div>
                  </SelectItem>
                  <SelectItem value="audio">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Audio Call
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="call-participants">Participants (optional)</Label>
              <Input
                id="call-participants"
                placeholder="Enter names or emails, separated by commas"
                value={scheduleCallParticipants}
                onChange={(e) => setScheduleCallParticipants(e.target.value)}
              />
              <p className="text-xs text-gray-500">Leave empty to invite when the call starts</p>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-sky-50 dark:bg-sky-900/20">
              <Calendar className="w-4 h-4 text-sky-600" />
              <span className="text-sm text-sky-700 dark:text-sky-400">
                Participants will receive a calendar invite
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowScheduleCallDialog(false); setScheduleCallDate(''); setScheduleCallTime(''); setScheduleCallParticipants(''); }}>
              Cancel
            </Button>
            <Button onClick={handleSubmitScheduledCall} disabled={!scheduleCallDate || !scheduleCallTime} className="bg-sky-600 hover:bg-sky-700">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Call
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
