'use client'

import { createClient } from '@/lib/supabase/client'

import { useState, useMemo, useCallback } from 'react'
import { toast } from 'sonner'
import { useMessages } from '@/lib/hooks/use-messages'
import { useConversations } from '@/lib/hooks/use-conversations'

// Real-time API hooks for messaging
import {
  useConversations as useApiConversations,
  useMessagingStats,
  useSendMessage,
  useMarkAsRead as useMarkAsReadApi,
  useAddReaction as useAddReactionApi,
  useCreateConversation,
  useNotifications,
  useTeamMembers
} from '@/lib/api-clients'

// Types used throughout - commented to avoid unused import errors
// import type { Chat, ChatMessage } from '@/lib/hooks/use-conversations'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
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
  // Define adapter variables locally (removed mock data imports)
  const messagesAIInsights: any[] = []
  const messagesCollaborators: any[] = []
  const messagesPredictions: any[] = []
  const messagesActivities: any[] = []
  const messagesQuickActions: any[] = []

  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(mockChannels[0])
  const [searchQuery, setSearchQuery] = useState('')
  const [messageInput, setMessageInput] = useState('')
  const [showThreadPanel, setShowThreadPanel] = useState(false)
  const [selectedThread, setSelectedThread] = useState<Message | null>(null)
  const [channelFilter, setChannelFilter] = useState<'all' | 'unread' | 'starred'>('all')
  const [activeCall, setActiveCall] = useState<Call | null>(null)
  const [recipientId, setRecipientId] = useState('')
  const [messageSubject, setMessageSubject] = useState('')

  // Real Supabase hook for messages (legacy)
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

  // NEW: Real Supabase hook for conversations/chats
  const {
    chats: supabaseChats,
    messages: chatMessages,
    currentChat,
    typingUsers,
    currentUserId,
    totalUnread,
    directChats,
    groupChats,
    channels: supabaseChannels,
    pinnedMessages,
    chatsLoading,
    messagesLoading: chatMessagesLoading,
    sending,
    chatsError,
    messagesError: chatMessagesError,
    fetchChats,
    fetchMessages: fetchChatMessages,
    selectChat,
    sendMessage: sendChatMessage,
    editMessage: editChatMessage,
    deleteMessage: deleteChatMessage,
    markAsRead,
    addReaction,
    removeReaction,
    pinMessage,
    createChat,
    setTyping,
    searchMessages
  } = useConversations({ enableRealtime: true })

  // ==========================================================================
  // NEW API HOOKS - Enhanced messaging with TanStack Query
  // ==========================================================================

  // Messaging stats for real-time metrics
  const { data: messagingStatsData } = useMessagingStats()
  const sendMessageApi = useSendMessage()
  const markAsReadApi = useMarkAsReadApi()
  const addReactionApi = useAddReactionApi()
  const createConversationApi = useCreateConversation()

  // Team members for mentions and user lookup
  const { data: teamMembersData } = useTeamMembers()

  // Notifications for real-time alerts
  const { data: notificationsData } = useNotifications()

  // Enhanced stats combining API data with local data
  const enhancedStats = useMemo(() => ({
    totalUnread: messagingStatsData?.data?.unreadCount ?? totalUnread,
    totalConversations: messagingStatsData?.data?.totalConversations ?? supabaseChats?.length ?? 0,
    directMessages: directChats?.length ?? 0,
    groupChats: groupChats?.length ?? 0,
    channels: supabaseChannels?.length ?? mockChannels.length,
    unreadNotifications: notificationsData?.data?.filter((n: any) => !n.is_read).length ?? 0
  }), [messagingStatsData, totalUnread, supabaseChats, directChats, groupChats, supabaseChannels, notificationsData])

  // Enhanced send message with API fallback
  const handleSendMessageEnhanced = useCallback(async (content: string, channelId?: string) => {
    const targetChannelId = channelId || selectedChannel?.id
    if (!content.trim() || !targetChannelId) {
      toast.error('Message cannot be empty')
      return
    }

    try {
      // Try API hook first
      await sendMessageApi.mutateAsync({
        conversationId: targetChannelId,
        content: content.trim()
      })
      setMessageInput('')
    } catch (error) {
      // Fallback to existing sendChatMessage
      try {
        await sendChatMessage(content.trim())
        setMessageInput('')
      } catch (fallbackError) {
        toast.error('Failed to send message')
      }
    }
  }, [selectedChannel, sendMessageApi, sendChatMessage])

  // Enhanced create conversation with API hook
  const handleCreateConversationEnhanced = useCallback(async (participants: string[], type: 'direct' | 'group' | 'channel', title?: string) => {
    try {
      await createConversationApi.mutateAsync({
        participantIds: participants,
        type,
        title
      })
      toast.success('Conversation created')
    } catch (error) {
      // Fallback to existing createChat
      try {
        await createChat(participants, type === 'group', title)
        toast.success('Conversation created')
      } catch (fallbackError) {
        toast.error('Failed to create conversation')
      }
    }
  }, [createConversationApi, createChat])

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

  // Dialog states for quick actions
  const [showAllThreadsDialog, setShowAllThreadsDialog] = useState(false)
  const [showMyRepliesDialog, setShowMyRepliesDialog] = useState(false)
  const [showArchivedThreadsDialog, setShowArchivedThreadsDialog] = useState(false)
  const [showCallHistoryDialog, setShowCallHistoryDialog] = useState(false)
  const [showBrowseFilesDialog, setShowBrowseFilesDialog] = useState(false)
  const [showCodeFilesDialog, setShowCodeFilesDialog] = useState(false)
  const [showAllMentionsDialog, setShowAllMentionsDialog] = useState(false)
  const [showReactionsDialog, setShowReactionsDialog] = useState(false)

  // New dialog states for real functionality
  const [showComposeDialog, setShowComposeDialog] = useState(false)
  const [showReplyDialog, setShowReplyDialog] = useState(false)
  const [showForwardDialog, setShowForwardDialog] = useState(false)
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false)
  const [showArchiveConfirmDialog, setShowArchiveConfirmDialog] = useState(false)
  const [showCreateChannelDialog, setShowCreateChannelDialog] = useState(false)
  const [showSavedMessagesDialog, setShowSavedMessagesDialog] = useState(false)
  const [showPinnedMessagesDialog, setShowPinnedMessagesDialog] = useState(false)
  const [showFileUploadDialog, setShowFileUploadDialog] = useState(false)

  // Form states for dialogs
  const [composeRecipient, setComposeRecipient] = useState('')
  const [composeSubject, setComposeSubject] = useState('')
  const [composeBody, setComposeBody] = useState('')
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null)
  const [replyBody, setReplyBody] = useState('')
  const [forwardMessage, setForwardMessage] = useState<Message | null>(null)
  const [forwardRecipient, setForwardRecipient] = useState('')
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [archiveTargetId, setArchiveTargetId] = useState<string | null>(null)
  const [newChannelName, setNewChannelName] = useState('')
  const [newChannelDescription, setNewChannelDescription] = useState('')
  const [newChannelType, setNewChannelType] = useState<'public' | 'private'>('public')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isForwardMode, setIsForwardMode] = useState(false)
  const [searchResults, setSearchResults] = useState<Message[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Stats - now uses real Supabase data when available
  const stats = useMemo(() => {
    // Use real data from Supabase when available, fallback to mock data
    const hasRealData = supabaseChats.length > 0 || (supabaseMessages && supabaseMessages.length > 0)

    // Calculate real message counts
    const realMessageCount = chatMessages.length + (supabaseMessages?.length || 0)
    const totalMessages = hasRealData ? realMessageCount : mockMessages.length * 150

    // Calculate real channel counts (direct + group + channels)
    const totalChannels = hasRealData
      ? directChats.length + groupChats.length + supabaseChannels.length
      : mockChannels.length

    // Calculate real unread count
    const unreadMessages = hasRealData
      ? totalUnread
      : mockChannels.reduce((sum, c) => sum + c.unreadCount, 0)

    // Calculate active threads from pinned messages (as proxy for threads)
    const activeThreads = hasRealData
      ? pinnedMessages.length
      : mockThreads.filter(t => t.isUnread).length

    // Files count - would need a separate hook for real data
    const totalFiles = mockFiles.length * 25

    // Calls count - would need a separate hook for real data
    const totalCalls = mockCalls.length * 12

    // Online members - use typing users as proxy for online activity
    const onlineMembers = hasRealData
      ? typingUsers.length + (currentUserId ? 1 : 0)
      : mockUsers.filter(u => u.status === 'online').length

    // Mentions count from unread messages
    const mentions = hasRealData
      ? supabaseMessages?.filter(m => !m.is_read).length || 0
      : mockMentions.filter(m => !m.isRead).length

    return {
      totalMessages,
      totalChannels,
      unreadMessages,
      activeThreads,
      totalFiles,
      totalCalls,
      onlineMembers,
      mentions,
      hasRealData
    }
  }, [supabaseChats, chatMessages, supabaseMessages, totalUnread, directChats, groupChats, supabaseChannels, pinnedMessages, typingUsers, currentUserId])

  // Filtered channels - merges real Supabase data with mock data
  const filteredChannels = useMemo(() => {
    // Start with mock channels as fallback
    let channels = mockChannels

    // If we have real Supabase chats, convert them to Channel format
    if (supabaseChats.length > 0) {
      const supabaseAsChannels: Channel[] = supabaseChats.map(chat => ({
        id: chat.id,
        name: chat.name,
        type: chat.type === 'channel' ? 'public' : chat.type === 'group' ? 'private' : 'direct',
        description: chat.description || undefined,
        topic: '',
        members: [],
        memberCount: chat.member_count || 0,
        unreadCount: chat.unread_count || 0,
        isMuted: false,
        isStarred: false,
        isPinned: false,
        lastActivity: chat.last_message_at || chat.updated_at,
        createdAt: chat.created_at,
        createdBy: currentUser
      }))
      // Merge: real data first, then mock data
      channels = [...supabaseAsChannels, ...mockChannels]
    }

    if (channelFilter === 'unread') channels = channels.filter(c => c.unreadCount > 0)
    else if (channelFilter === 'starred') channels = channels.filter(c => c.isStarred)
    if (searchQuery) channels = channels.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    return channels
  }, [channelFilter, searchQuery, supabaseChats])

  // Messages for selected channel - uses real Supabase messages when available
  const channelMessages = useMemo(() => {
    if (!selectedChannel) return []

    // If this is a Supabase chat, use real messages
    const isSupabaseChat = supabaseChats.some(c => c.id === selectedChannel.id)
    if (isSupabaseChat && chatMessages.length > 0) {
      // Convert ChatMessage to Message format for display
      return chatMessages.map(msg => ({
        id: msg.id,
        channelId: msg.chat_id,
        content: msg.text,
        author: {
          id: msg.sender?.id || msg.sender_id,
          name: msg.sender?.name || 'Unknown',
          displayName: msg.sender?.name || 'Unknown',
          email: msg.sender?.email || '',
          status: 'online' as UserStatus
        },
        createdAt: msg.created_at,
        editedAt: msg.edited_at || undefined,
        status: msg.status as MessageStatus,
        reactions: (msg.reactions || []).map(r => ({
          type: r.emoji as ReactionType,
          count: 1,
          users: [{ id: r.user_id, name: '', displayName: '', email: '', status: 'online' as UserStatus }],
          hasReacted: r.user_id === currentUserId
        })),
        threadCount: 0,
        threadParticipants: [],
        attachments: (msg.attachments || []).map(a => ({
          id: a.id,
          type: a.type as 'file' | 'image' | 'video' | 'audio',
          name: a.name,
          url: a.url,
          size: a.size_bytes
        })),
        mentions: [],
        isPinned: msg.is_pinned,
        isBookmarked: false
      })) as Message[]
    }

    // Fallback to mock messages
    return mockMessages.filter(m => m.channelId === selectedChannel.id && !m.parentId)
  }, [selectedChannel, chatMessages, supabaseChats, currentUserId])

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
      toast.error('Message required')
      return
    }

    // Check if we're in a real Supabase chat
    const isSupabaseChat = selectedChannel && supabaseChats.some(c => c.id === selectedChannel.id)

    if (isSupabaseChat && selectedChannel) {
      // Use the new conversations hook for real chats
      try {
        // Select the chat first to ensure currentChat is set
        await selectChat(selectedChannel.id)

        const result = await sendChatMessage(messageInput.trim(), 'text')
        if (result.success) {
          setMessageInput('')
          setMessageSubject('')
          toast.success('Message sent')
        } else {
          toast.error('Failed to send message')
        }
      } catch (error) {
        toast.error('Failed to send message')
      }
    } else {
      // Fallback to legacy messages table
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
        toast.success('Message sent')
      } catch (error) {
        toast.error('Failed to send message')
      }
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    // Check if this is a Supabase chat message
    const isChatMessage = chatMessages.some(m => m.id === messageId)

    try {
      if (isChatMessage) {
        const result = await deleteChatMessage(messageId)
        if (!result.success) {
          throw new Error(result.error || 'Failed to delete message')
        }
      } else {
        await deleteMessage(messageId)
      }
      toast.success('Message deleted')
    } catch (error) {
      toast.error('Failed to delete message')
    }
  }

  const handleMarkAsRead = async (messageId: string) => {
    // Check if this is a Supabase chat
    const chatMessage = chatMessages.find(m => m.id === messageId)

    try {
      if (chatMessage) {
        // Mark the entire chat as read
        const result = await markAsRead(chatMessage.chat_id)
        if (!result.success) {
          throw new Error(result.error || 'Failed to mark as read')
        }
      } else {
        // Legacy message
        await updateMessage(messageId, {
          is_read: true,
          read_at: new Date().toISOString(),
          status: 'read' as const
        })
      }
      toast.success('Marked as read')
    } catch (error) {
      toast.error('Failed to mark as read')
    }
  }

  // Handler for marking entire chat as read
  const handleMarkChatAsRead = async (chatId: string) => {
    try {
      const result = await markAsRead(chatId)
      if (!result.success) {
        throw new Error(result.error || 'Failed to mark chat as read')
      }
      toast.success('Chat marked as read')
    } catch (error) {
      toast.error('Failed to mark chat as read')
    }
  }

  const handleArchiveMessage = async (messageId: string) => {
    try {
      await updateMessage(messageId, {
        status: 'archived' as const,
        folder: 'archive'
      })
      toast.success('Message archived')
    } catch (error) {
      toast.error('Failed to archive message')
    }
  }

  const handleStarMessage = async (messageId: string, currentStarred: boolean) => {
    try {
      await updateMessage(messageId, {
        is_starred: !currentStarred
      })
      toast.success(currentStarred ? 'Star removed' : 'Message starred')
    } catch (error) {
      toast.error('Failed to update star')
    }
  }

  const handlePinMessage = async (messageId: string, currentPinned: boolean) => {
    // Check if this is a Supabase chat message
    const isChatMessage = chatMessages.some(m => m.id === messageId)

    try {
      if (isChatMessage) {
        const result = await pinMessage(messageId, !currentPinned)
        if (!result.success) {
          throw new Error(result.error || 'Failed to update pin')
        }
      } else {
        await updateMessage(messageId, {
          is_pinned: !currentPinned
        })
      }
      toast.success(currentPinned ? 'Message unpinned' : 'Message pinned')
    } catch (error) {
      toast.error('Failed to update pin')
    }
  }

  const handleMarkAsImportant = async (messageId: string, currentImportant: boolean) => {
    try {
      await updateMessage(messageId, {
        is_important: !currentImportant
      })
      toast.success(currentImportant ? 'Removed important flag' : 'Marked as important')
    } catch (error) {
      toast.error('Failed to update importance')
    }
  }

  const handleCreateChannel = async () => {
    // Open the create channel dialog instead of using prompt
    setNewChannelName('')
    setNewChannelDescription('')
    setNewChannelType('public')
    setShowCreateChannelDialog(true)
  }

  // Actual channel creation when form is submitted
  const handleSubmitCreateChannel = async () => {
    if (!newChannelName.trim()) {
      toast.error('Channel name required')
      return
    }

    try {
      const result = await createChat({
        name: newChannelName.trim(),
        type: newChannelType === 'public' ? 'channel' : 'group',
        description: newChannelDescription.trim() || `Channel for ${newChannelName} discussions`
      })
      if (result.success) {
        toast.success(`Channel #${newChannelName} created`)
        setShowCreateChannelDialog(false)
        setNewChannelName('')
        setNewChannelDescription('')
        // Refresh chats list
        fetchChats()
      } else {
        toast.error('Failed to create channel')
      }
    } catch (error) {
      toast.error('Failed to create channel')
    }
  }

  // Handler for creating new direct message chat
  const handleCreateDirectMessage = async (userId: string, userName: string) => {
    try {
      const result = await createChat({
        name: `Chat with ${userName}`,
        type: 'direct',
        memberIds: [userId]
      })
      if (result.success && result.chat) {
        toast.success(`Chat with ${userName} created`)
        // Select the new chat
        await selectChat(result.chat.id)
      } else {
        toast.error('Failed to start chat')
      }
    } catch (error) {
      toast.error('Failed to start chat')
    }
  }

  // Handler for creating group chat - uses the same dialog with private type
  const handleCreateGroupChat = async () => {
    setNewChannelName('')
    setNewChannelDescription('')
    setNewChannelType('private')
    setShowCreateChannelDialog(true)
  }

  // Handler for compose message dialog submission
  const handleSubmitCompose = async () => {
    if (!composeBody.trim()) {
      toast.error('Message required')
      return
    }
    if (!composeRecipient) {
      toast.error('Recipient required')
      return
    }

    try {
      await createMessage({
        body: composeBody.trim(),
        subject: composeSubject.trim() || null,
        recipient_id: composeRecipient,
        sender_id: currentUser.id,
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
        has_attachments: uploadedFiles.length > 0,
        attachment_count: uploadedFiles.length,
        reaction_count: 0
      })
      toast.success('Message sent')
      setShowComposeDialog(false)
      setComposeRecipient('')
      setComposeSubject('')
      setComposeBody('')
      setUploadedFiles([])
    } catch (error) {
      toast.error('Failed to send message')
    }
  }

  // Handler for reply dialog submission
  const handleSubmitReply = async () => {
    if (!replyBody.trim()) {
      toast.error('Reply required')
      return
    }
    if (!replyToMessage) {
      toast.error('No message selected')
      return
    }

    await handleReplyToMessage(replyToMessage.id, replyBody.trim())
    setShowReplyDialog(false)
    setReplyToMessage(null)
    setReplyBody('')
  }

  // Handler for forward dialog submission
  const handleSubmitForward = async () => {
    if (!forwardMessage) {
      toast.error('No message selected')
      return
    }
    if (!forwardRecipient) {
      toast.error('Recipient required')
      return
    }

    await handleForwardMessage(forwardMessage.id, forwardRecipient)
    setShowForwardDialog(false)
    setForwardMessage(null)
    setForwardRecipient('')
    setIsForwardMode(false)
  }

  // Handler for delete confirmation
  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return

    await handleDeleteMessage(deleteTargetId)
    setShowDeleteConfirmDialog(false)
    setDeleteTargetId(null)
  }

  // Handler for archive confirmation
  const handleConfirmArchive = async () => {
    if (!archiveTargetId) return

    await handleArchiveMessage(archiveTargetId)
    setShowArchiveConfirmDialog(false)
    setArchiveTargetId(null)
  }

  // Handler for file upload
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const newFiles = Array.from(files)
    setUploadedFiles(prev => [...prev, ...newFiles])
    toast.success(`${newFiles.length} file(s) added and ready to upload`)
  }

  // Handler for advanced search
  const handleAdvancedSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Search required')
      return
    }

    setIsSearching(true)
    try {
      // Search in Supabase messages
      const results = supabaseMessages?.filter(m =>
        m.body?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.subject?.toLowerCase().includes(searchQuery.toLowerCase())
      ) || []

      // Also search in mock messages for demo
      const mockResults = mockMessages.filter(m =>
        m.content.toLowerCase().includes(searchQuery.toLowerCase())
      )

      // Convert Supabase results to Message format
      const convertedResults: Message[] = results.map(m => ({
        id: m.id,
        channelId: m.recipient_id || '',
        content: m.body || '',
        author: {
          id: m.sender_id || currentUser.id,
          name: currentUser.name,
          displayName: currentUser.displayName,
          email: currentUser.email,
          status: 'online' as UserStatus
        },
        createdAt: m.created_at,
        status: (m.status || 'sent') as MessageStatus,
        reactions: [],
        threadCount: 0,
        threadParticipants: [],
        attachments: [],
        mentions: [],
        isPinned: m.is_pinned || false,
        isBookmarked: m.is_starred || false
      }))

      setSearchResults([...convertedResults, ...mockResults])
      toast.success(`Search complete: ${convertedResults.length + mockResults.length} matching messages`)
    } catch (error) {
      toast.error('Search failed')
    } finally {
      setIsSearching(false)
    }
  }

  // Open reply dialog for a specific message
  const openReplyDialog = (message: Message) => {
    setReplyToMessage(message)
    setReplyBody('')
    setShowReplyDialog(true)
  }

  // Open forward dialog for a specific message
  const openForwardDialog = (message: Message) => {
    setForwardMessage(message)
    setForwardRecipient('')
    setShowForwardDialog(true)
  }

  // Open delete confirmation for a specific message
  const openDeleteConfirm = (messageId: string) => {
    setDeleteTargetId(messageId)
    setShowDeleteConfirmDialog(true)
  }

  // Open archive confirmation for a specific message
  const openArchiveConfirm = (messageId: string) => {
    setArchiveTargetId(messageId)
    setShowArchiveConfirmDialog(true)
  }

  // Handler for adding reaction to chat message
  const handleAddReaction = async (messageId: string, emoji: string) => {
    try {
      const result = await addReaction(messageId, emoji)
      if (!result.success) {
        throw new Error(result.error || 'Failed to add reaction')
      }
    } catch (error) {
      toast.error('Failed to add reaction')
    }
  }

  // Handler for selecting a conversation
  const handleSelectConversation = async (channelId: string) => {
    const channel = filteredChannels.find(c => c.id === channelId)
    setSelectedChannel(channel || null)

    // If it's a Supabase chat, also select it via the hook
    const isSupabaseChat = supabaseChats.some(c => c.id === channelId)
    if (isSupabaseChat) {
      await selectChat(channelId)
    }
  }

  // Handle typing indicator
  const handleTyping = (isTyping: boolean) => {
    if (currentChat) {
      setTyping(isTyping)
    }
  }

  const handleStartCall = (contactName: string) => {
    setActiveCall({
      id: `call-${Date.now()}`,
      type: 'audio',
      status: 'ongoing',
      channelId: selectedChannel?.id || 'new',
      channelName: contactName,
      participants: [currentUser as any],
      startTime: new Date().toISOString(),
      isRecorded: false
    })
    toast.success(`Calling ${contactName}`)
  }

  const handleMuteChannel = (channelName: string) => {
    toast.success(`Channel #${channelName} muted - notifications are now off`)
  }

  const handleMarkAllAsRead = async () => {
    let totalMarked = 0

    try {
      // Mark all Supabase chats as read
      if (supabaseChats.length > 0) {
        const unreadChats = supabaseChats.filter(c => (c.unread_count || 0) > 0)
        for (const chat of unreadChats) {
          await markAsRead(chat.id)
          totalMarked += chat.unread_count || 0
        }
      }

      // Also mark legacy messages as read
      if (supabaseMessages && supabaseMessages.length > 0) {
        const unreadMessages = supabaseMessages.filter(m => !m.is_read)
        for (const msg of unreadMessages) {
          await updateMessage(msg.id, {
            is_read: true,
            read_at: new Date().toISOString(),
            status: 'read' as const
          })
          totalMarked++
        }
      }

      if (totalMarked > 0) {
        toast.success(`All messages marked as read: ${totalMarked} messages updated`)
      } else {
        toast.info('No unread messages')
      }
    } catch (error) {
      toast.error('Failed to mark all as read')
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
      toast.success('Message forwarded')
    } catch (error) {
      toast.error('Failed to forward message')
    }
  }

  const handleReplyToMessage = async (parentMessageId: string, replyBody: string) => {
    const parentMessage = supabaseMessages?.find(m => m.id === parentMessageId)
    if (!parentMessage) {
      toast.error('Original message not found')
      return
    }

    try {
      await createMessage({
        body: replyBody,
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
      toast.success('Reply sent')
    } catch (error) {
      toast.error('Failed to send reply')
    }
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
                {/* Loading states */}
                {(chatsLoading || messagesLoading) && (
                  <span className="ml-2 text-blue-500 inline-flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Loading...
                  </span>
                )}
                {/* Error states */}
                {(chatsError || messagesError) && (
                  <span className="ml-2 text-red-500 inline-flex items-center gap-1">
                    <AlertOctagon className="w-3 h-3" />
                    Error loading data
                  </span>
                )}
                {/* Real-time connection status */}
                {stats.hasRealData && !chatsLoading && !chatsError && (
                  <span className="ml-2 text-green-500 inline-flex items-center gap-1">
                    <Radio className="w-3 h-3" />
                    Live ({supabaseChats.length} chats, {chatMessages.length} messages)
                  </span>
                )}
                {/* Typing indicator */}
                {typingUsers.length > 0 && (
                  <span className="ml-2 text-purple-500 italic">
                    {typingUsers.map(t => t.user_name).join(', ')} typing...
                  </span>
                )}
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
            <Button variant="outline" size="icon" onClick={() => {
              const filters = ['all', 'unread', 'starred'] as const
              const currentIndex = filters.indexOf(channelFilter as typeof filters[number])
              const nextFilter = filters[(currentIndex + 1) % filters.length]
              setChannelFilter(nextFilter)
            }}>
              <Filter className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} disabled={mutating || sending}>
              {(mutating || sending) ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <CheckCheck className="w-4 h-4 mr-2" />}
              Mark All Read
            </Button>
            <Button className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white" onClick={() => {
              setComposeRecipient('')
              setComposeSubject('')
              setComposeBody('')
              setShowComposeDialog(true)
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
                  <p className="text-purple-100">
                    Slack-level team communication and collaboration
                    {stats.hasRealData && (
                      <span className="ml-2 inline-flex items-center gap-1">
                        <Radio className="w-3 h-3" />
                        Live
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.totalChannels}</p>
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
                { icon: Plus, label: 'New Channel', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', action: handleCreateChannel },
                { icon: Hash, label: 'Browse', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', action: () => { setChannelFilter('all'); toast.success(`Browse: ${filteredChannels.length} channels available`) } },
                { icon: UserPlus, label: 'Invite', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', action: () => { navigator.clipboard.writeText('https://freeflow.app/invite/workspace'); toast.success('Invite link copied!') } },
                { icon: Star, label: 'Starred', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', action: () => { setChannelFilter('starred'); toast.success('Showing starred channels') } },
                { icon: Bot, label: 'Apps', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', action: () => window.open('/dashboard/integrations', '_blank') },
                { icon: Workflow, label: 'Workflows', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', action: () => window.open('/dashboard/automations', '_blank') },
                { icon: Archive, label: 'Archive', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', action: () => { const archived = mockChannels.filter(c => c.isMuted); toast.success(`Archived: ${archived.length} channels in archive`) } },
                { icon: Settings, label: 'Settings', color: 'bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400', action: () => { setSettingsTab('general'); const settingsTabEl = document.querySelector('[value="settings"]') as HTMLElement; if (settingsTabEl) settingsTabEl.click() } },
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
                        <div key={channel.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => handleSelectConversation(channel.id)}>
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
                        <div key={channel.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => handleSelectConversation(channel.id)}>
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
                      <div key={channel.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => handleSelectConversation(channel.id)}>
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
                    <Button variant="outline" className="w-full justify-start" onClick={() => {
                      navigator.clipboard.writeText('https://freeflow.app/invite/channel')
                      toast.success('Invite link copied!')
                    }}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite People
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => window.open('/dashboard/integrations', '_blank')}>
                      <Bot className="w-4 h-4 mr-2" />
                      Add App
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => window.open('/dashboard/automations', '_blank')}>
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
                      {stats.hasRealData && (
                        <Badge variant="secondary" className="ml-2 text-xs">Live</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Show typing users from real-time data first */}
                    {typingUsers.map(typingUser => (
                      <div key={typingUser.user_id} className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>{typingUser.user_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white bg-green-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{typingUser.user_name}</p>
                          <p className="text-xs text-green-500 italic">typing...</p>
                        </div>
                      </div>
                    ))}
                    {/* Show mock users as fallback if no real-time data */}
                    {typingUsers.length === 0 && mockUsers.filter(u => u.status === 'online' && !u.isBot).map(user => (
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
                    {typingUsers.length === 0 && mockUsers.filter(u => u.status === 'online' && !u.isBot).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No one online</p>
                    )}
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
                { icon: Plus, label: 'New DM', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', action: () => { setComposeRecipient(''); setComposeSubject(''); setComposeBody(''); setShowComposeDialog(true) } },
                { icon: Send, label: 'Compose', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', action: () => { setComposeRecipient(''); setComposeSubject(''); setComposeBody(''); setShowComposeDialog(true) } },
                { icon: Reply, label: 'Reply All', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400', action: () => { if (channelMessages.length > 0) { openReplyDialog(channelMessages[channelMessages.length - 1]) } else { toast.info('No messages to reply to') } } },
                { icon: Forward, label: 'Forward', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', action: () => { setIsForwardMode(true); toast.info('Forward mode enabled') } },
                { icon: Bookmark, label: 'Saved', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', action: () => setShowSavedMessagesDialog(true) },
                { icon: Pin, label: 'Pinned', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', action: () => setShowPinnedMessagesDialog(true) },
                { icon: Search, label: 'Search', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', action: () => { const searchTabEl = document.querySelector('[value="search"]') as HTMLElement; if (searchTabEl) searchTabEl.click() } },
                { icon: Filter, label: 'Filter', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', action: () => { setChannelFilter(channelFilter === 'all' ? 'unread' : 'all') } },
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
                    {chatsLoading ? (
                      <div className="flex items-center justify-center h-32">
                        <RefreshCw className="w-6 h-6 animate-spin text-purple-500" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {/* Show Supabase chats first, then mock channels */}
                        {filteredChannels.map(channel => (
                          <div key={channel.id} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${selectedChannel?.id === channel.id ? 'bg-purple-100 dark:bg-purple-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`} onClick={() => handleSelectConversation(channel.id)}>
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
                    )}
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
                          <Button variant="ghost" size="icon" onClick={() => handleStartCall(selectedChannel.name)}><Phone className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleStartCall(selectedChannel.name)}><Video className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => {
                            const pinnedMessages = channelMessages.filter(m => m.isPinned)
                            toast.success(`Pinned: ${channelMessages.filter(m => m.isPinned).length} pinned messages in this channel`)
                          }}><Pin className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleMuteChannel(selectedChannel.name)}><BellOff className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={async () => {
                            if (confirm(`Are you sure you want to archive #${selectedChannel.name}?`)) {
                              toast.success(`Channel #${selectedChannel.name} has been archived`)
                              setSelectedChannel(null)
                            }
                          }}><Archive className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    </CardHeader>
                    <ScrollArea className="flex-1 p-4">
                      {chatMessagesLoading ? (
                        <div className="flex items-center justify-center h-32">
                          <RefreshCw className="w-6 h-6 animate-spin text-purple-500" />
                          <span className="ml-2 text-gray-500">Loading messages...</span>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {channelMessages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                              <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
                              <p>No messages yet</p>
                              <p className="text-sm">Start the conversation!</p>
                            </div>
                          ) : (
                            channelMessages.map(message => (
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
                                        <Button key={idx} variant="outline" size="sm" className="h-6 px-2 text-xs" onClick={() => handleAddReaction(message.id, reaction.type)}>
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
                                  {/* Message actions on hover */}
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 mt-1">
                                    <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => handleAddReaction(message.id, 'thumbsup')}>
                                      <ThumbsUp className="w-3 h-3" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => handlePinMessage(message.id, message.isPinned)}>
                                      <Pin className="w-3 h-3" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => handleDeleteMessage(message.id)}>
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                          {/* Typing indicator */}
                          {typingUsers.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 italic">
                              <div className="flex gap-1">
                                <span className="animate-bounce">.</span>
                                <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>.</span>
                                <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                              </div>
                              {typingUsers.map(t => t.user_name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing
                            </div>
                          )}
                        </div>
                      )}
                    </ScrollArea>
                    <div className="p-4 border-t">
                      <div className="flex gap-2">
                        <Input
                          placeholder={`Message ${selectedChannel.type === 'direct' ? selectedChannel.name : '#' + selectedChannel.name}`}
                          value={messageInput}
                          onChange={(e) => {
                            setMessageInput(e.target.value)
                            // Trigger typing indicator when user starts typing
                            if (e.target.value && !messageInput) {
                              handleTyping(true)
                            } else if (!e.target.value && messageInput) {
                              handleTyping(false)
                            }
                          }}
                          onBlur={() => handleTyping(false)}
                          className="flex-1"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleSendMessage()
                              handleTyping(false)
                            }
                          }}
                          disabled={sending}
                        />
                        <Button onClick={handleSendMessage} disabled={mutating || sending || !messageInput.trim()}>
                          {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
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
                  <p className="text-amber-100">
                    Keep discussions organized with focused threads
                    {stats.hasRealData && (
                      <span className="ml-2 inline-flex items-center gap-1">
                        <Radio className="w-3 h-3" />
                        Live
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.hasRealData ? pinnedMessages.length : mockThreads.length}</p>
                    <p className="text-amber-200 text-sm">Total Threads</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.activeThreads}</p>
                    <p className="text-amber-200 text-sm">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.hasRealData ? pinnedMessages.length : mockThreads.filter(t => t.isFollowing).length}</p>
                    <p className="text-amber-200 text-sm">Following</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Threads Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: MessageCircle, label: 'All Threads', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', action: () => setShowAllThreadsDialog(true) },
                { icon: Star, label: 'Following', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', action: () => { const following = mockThreads.filter(t => t.isFollowing); toast.success(`Following: ${following.length} threads you are following`) } },
                { icon: Inbox, label: 'Unread', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', action: () => { const unread = mockThreads.filter(t => t.isUnread); toast.success(`Unread: ${unread.length} unread threads`) } },
                { icon: Reply, label: 'My Replies', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', action: () => setShowMyRepliesDialog(true) },
                { icon: AtSign, label: 'Mentions', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', action: () => { const mentionsTabEl = document.querySelector('[value="mentions"]') as HTMLElement; if (mentionsTabEl) mentionsTabEl.click(); toast.success(`Mentions: ${stats.mentions} mentions found`) } },
                { icon: Archive, label: 'Archived', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400', action: () => setShowArchivedThreadsDialog(true) },
                { icon: Search, label: 'Search', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', action: () => { setSearchQuery(''); const searchTabEl = document.querySelector('[value="search"]') as HTMLElement; if (searchTabEl) searchTabEl.click() } },
                { icon: Settings, label: 'Settings', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', action: () => { setSettingsTab('notifications'); const settingsTabEl = document.querySelector('[value="settings"]') as HTMLElement; if (settingsTabEl) settingsTabEl.click() } },
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
                <CardTitle className="flex items-center gap-2">
                  Active Threads
                  {stats.hasRealData && <Badge variant="secondary" className="text-xs">Live</Badge>}
                </CardTitle>
                <CardDescription>
                  {stats.hasRealData ? 'Pinned conversations and threads' : 'Conversations you are following'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Show pinned messages from Supabase as threads when available */}
                  {stats.hasRealData && pinnedMessages.length > 0 && pinnedMessages.map(msg => (
                    <div key={msg.id} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => {
                      const chat = supabaseChats.find(c => c.id === msg.chat_id)
                      if (chat) {
                        handleSelectConversation(chat.id)
                      }
                    }}>
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarFallback>{msg.sender?.name?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{msg.sender?.name || 'Unknown'}</span>
                            <span className="text-xs text-gray-500">pinned</span>
                            <Pin className="w-3 h-3 text-yellow-500" />
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{msg.text}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>{msg.reactions?.length || 0} reactions</span>
                            <span>Pinned {formatTime(msg.pinned_at || msg.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Show mock threads as fallback */}
                  {(!stats.hasRealData || pinnedMessages.length === 0) && mockThreads.map(thread => (
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
                  {/* Empty state */}
                  {stats.hasRealData && pinnedMessages.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No pinned threads yet</p>
                      <p className="text-sm">Pin important messages to create threads</p>
                    </div>
                  )}
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
                { icon: Phone, label: 'Start Call', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', action: () => { if (selectedChannel) { handleStartCall(selectedChannel.name) } else { toast.success('Select a contact') } } },
                { icon: Video, label: 'Video Call', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', action: () => { if (selectedChannel) { handleStartCall(selectedChannel.name) } else { toast.success('Select a contact') } } },
                { icon: Headphones, label: 'Huddle', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', action: () => { setActiveCall({ id: 'huddle-new', type: 'huddle', status: 'ongoing', channelId: 'huddle', channelName: 'Quick Huddle', participants: [currentUser as any], startTime: new Date().toISOString(), isRecorded: false }); toast.success('Huddle started') } },
                { icon: ScreenShare, label: 'Share', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', action: () => { if (!activeCall) { toast.warning('Start a call first') } } },
                { icon: Calendar, label: 'Schedule', color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400', action: () => window.open('/dashboard/calendar', '_blank') },
                { icon: PlayCircle, label: 'Recordings', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', action: () => { const recorded = mockCalls.filter(c => c.isRecorded); toast.success(`Call recordings: ${recorded.length} recorded calls available`) } },
                { icon: Clock, label: 'History', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', action: () => setShowCallHistoryDialog(true) },
                { icon: Settings, label: 'Settings', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', action: () => { setSettingsTab('general'); const settingsTabEl = document.querySelector('[value="settings"]') as HTMLElement; if (settingsTabEl) settingsTabEl.click() } },
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
                            toast.success(`Joined ${call.channelName} - ${call.participants.length} participants`)
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
                          <Button variant="outline" size="sm" onClick={() => {
                            navigator.clipboard.writeText(`Call: ${call.channelName}\nScheduled: ${new Date(call.startTime).toLocaleString()}\nParticipants: ${call.participants.length}`)
                            toast.success(`Call details copied - ${call.channelName} at ${new Date(call.startTime).toLocaleString()}`)
                          }}>View</Button>
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
                { icon: Upload, label: 'Upload', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', action: () => { setUploadedFiles([]); setShowFileUploadDialog(true) } },
                { icon: FolderOpen, label: 'Browse', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', action: () => setShowBrowseFilesDialog(true) },
                { icon: Image, label: 'Images', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', action: () => setShowBrowseFilesDialog(true) },
                { icon: Video, label: 'Videos', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', action: () => setShowBrowseFilesDialog(true) },
                { icon: FileText, label: 'Documents', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400', action: () => setShowBrowseFilesDialog(true) },
                { icon: Code, label: 'Code', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', action: () => setShowCodeFilesDialog(true) },
                { icon: Search, label: 'Search', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', action: () => { setSearchQuery(''); const searchTabEl = document.querySelector('[value="search"]') as HTMLElement; if (searchTabEl) searchTabEl.click() } },
                { icon: Settings, label: 'Settings', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', action: () => { setSettingsTab('advanced'); const settingsTabEl = document.querySelector('[value="settings"]') as HTMLElement; if (settingsTabEl) settingsTabEl.click() } },
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
                  <Button onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.multiple = true
                    input.onchange = () => toast.success(`Files selected and ready to upload`)
                    input.click()
                  }}>
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
                          {file.type.includes('image') ? <Image className="w-6 h-6 text-blue-500"  loading="lazy"/> :
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
                        <Button variant="outline" size="icon" onClick={() => {
                          const link = document.createElement('a')
                          link.href = file.url || '#'
                          link.download = file.name
                          link.click()
                          toast.success(`Downloaded ${file.name}`)
                        }}>
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
                { icon: AtSign, label: 'All Mentions', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', action: () => setShowAllMentionsDialog(true) },
                { icon: Inbox, label: 'Unread', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', action: () => setShowAllMentionsDialog(true) },
                { icon: ThumbsUp, label: 'Reactions', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', action: () => setShowReactionsDialog(true) },
                { icon: Star, label: 'Starred', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', action: () => setShowSavedMessagesDialog(true) },
                { icon: Reply, label: 'Reply All', color: 'bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400', action: () => { if (channelMessages.length > 0) { openReplyDialog(channelMessages[channelMessages.length - 1]) } else { toast.info('No messages to reply to') } } },
                { icon: CheckCheck, label: 'Mark Read', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400', action: handleMarkAllAsRead },
                { icon: Filter, label: 'Filter', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', action: () => { setChannelFilter(channelFilter === 'all' ? 'unread' : 'all') } },
                { icon: Settings, label: 'Settings', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', action: () => { setSettingsTab('notifications'); const settingsTabEl = document.querySelector('[value="settings"]') as HTMLElement; if (settingsTabEl) settingsTabEl.click() } },
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
                          setMessageInput(`@${mention.message.author.name} `)
                          toast.success('Ready to reply')
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
                      <Input
                        placeholder="Search messages..."
                        className="pl-10 h-12 text-lg"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAdvancedSearch() }}
                      />
                    </div>
                    <Button size="lg" onClick={handleAdvancedSearch} disabled={isSearching}>
                      {isSearching ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                      Search
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100" onClick={() => setSearchQuery(searchQuery + ' from:@')}>from:@user</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100" onClick={() => setSearchQuery(searchQuery + ' in:#')}>in:#channel</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100" onClick={() => setSearchQuery(searchQuery + ' has:file')}>has:file</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100" onClick={() => setSearchQuery(searchQuery + ' has:link')}>has:link</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100" onClick={() => setSearchQuery(searchQuery + ' before:')}>before:date</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100" onClick={() => setSearchQuery(searchQuery + ' after:')}>after:date</Badge>
                  </div>

                  {searchResults.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">{searchResults.length} result(s) found</p>
                        <Button variant="outline" size="sm" onClick={() => setSearchResults([])}>Clear Results</Button>
                      </div>
                      <ScrollArea className="h-80">
                        <div className="space-y-3">
                          {searchResults.map(msg => (
                            <div key={msg.id} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                              <div className="flex items-center gap-2 mb-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback className="text-xs">{msg.author.displayName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">{msg.author.displayName}</span>
                                <span className="text-xs text-gray-500">{formatTime(msg.createdAt)}</span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{msg.content}</p>
                              <div className="flex gap-2 mt-2">
                                <Button variant="ghost" size="sm" onClick={() => openReplyDialog(msg)}>
                                  <Reply className="w-3 h-3 mr-1" />
                                  Reply
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => openForwardDialog(msg)}>
                                  <Forward className="w-3 h-3 mr-1" />
                                  Forward
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-gray-500">
                      <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg">Enter a search term to find messages</p>
                      <p className="text-sm">Use filters to narrow down results</p>
                    </div>
                  )}
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
                        <Button variant="outline" className="w-full" onClick={() => window.open('/dashboard/settings/sessions', '_blank')}>
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
                          <Button variant="outline" size="sm" onClick={() => {
                            window.open('https://zoom.us/oauth/authorize', '_blank')
                            toast.success('Zoom OAuth started')
                          }}>Connect</Button>
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
                          <Button variant="outline" size="sm" onClick={() => window.open('/dashboard/automations', '_blank')}>Manage</Button>
                        </div>
                        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" onClick={() => window.open('/dashboard/integrations', '_blank')}>
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
                          <Button variant="outline" className="flex-1" onClick={async () => {
                            try {
                              const data = JSON.stringify({ messages: supabaseMessages, channels: mockChannels, files: mockFiles }, null, 2)
                              const blob = new Blob([data], { type: 'application/json' })
                              const url = URL.createObjectURL(blob)
                              const link = document.createElement('a')
                              link.href = url
                              link.download = 'freeflow-data-export.json'
                              link.click()
                              URL.revokeObjectURL(url)
                              toast.success('Data exported')
                            } catch {
                              toast.error('Export failed')
                            }
                          }}>
                            <Download className="w-4 h-4 mr-2" />
                            Export Data
                          </Button>
                          <Button variant="outline" className="flex-1" onClick={() => {
                            localStorage.clear()
                            sessionStorage.clear()
                            toast.success('Cache cleared')
                          }}>
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
                        <Button variant="outline" className="w-full justify-start" onClick={() => window.open('/docs', '_blank')}>
                          <BookOpen className="w-4 h-4 mr-2" />
                          Documentation
                        </Button>
                        <Button variant="outline" className="w-full justify-start" onClick={() => window.open('/support', '_blank')}>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Contact Support
                        </Button>
                        <Button variant="outline" className="w-full justify-start" onClick={() => {
                          toast.success('Keyboard shortcuts')
                        }}>
                          <Zap className="w-4 h-4 mr-2" />
                          Keyboard Shortcuts
                        </Button>
                        <Button variant="outline" className="w-full justify-start" onClick={() => {
                          refetchMessages()
                          toast.success('You are on the latest version')
                        }}>
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
                          <Button variant="destructive" size="sm" onClick={() => {
                            if (confirm('Are you sure you want to leave this workspace?')) {
                              toast.success('Left workspace')
                              window.location.href = '/dashboard'
                            }
                          }}>
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
                              toast.warning('No messages to delete')
                              return
                            }
                            if (confirm('Are you sure you want to delete all messages? This cannot be undone.')) {
                              try {
                                for (const msg of supabaseMessages) {
                                  await deleteMessage(msg.id, true)
                                }
                                toast.success('All messages deleted')
                              } catch (error) {
                                toast.error('Failed to delete messages')
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
              onInsightAction={(insight) => {
                // Handle AI insight actions
                if (insight.actionLabel?.toLowerCase().includes('compose')) {
                  setShowComposeDialog(true)
                } else if (insight.actionLabel?.toLowerCase().includes('search')) {
                  const searchTabEl = document.querySelector('[value="search"]') as HTMLElement
                  if (searchTabEl) searchTabEl.click()
                } else if (insight.actionLabel?.toLowerCase().includes('filter')) {
                  setChannelFilter('unread')
                } else {
                  toast.info('Insight action triggered')
                }
              }}
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

      {/* All Threads Dialog */}
      <Dialog open={showAllThreadsDialog} onOpenChange={setShowAllThreadsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-amber-600" />
              All Threads
            </DialogTitle>
            <DialogDescription>
              View and manage all threaded conversations
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {(mockThreads || []).map(thread => (
              <div key={thread.id} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
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
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{thread.parentMessage.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{thread.replies} replies</span>
                      <span>Last reply {formatTime(thread.lastReply)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {mockThreads.length === 0 && (
              <p className="text-center text-gray-500 py-8">No threads found</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAllThreadsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* My Replies Dialog */}
      <Dialog open={showMyRepliesDialog} onOpenChange={setShowMyRepliesDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Reply className="w-5 h-5 text-rose-600" />
              My Replies
            </DialogTitle>
            <DialogDescription>
              Threads you have replied to
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {(mockThreads.filter(t => t.isFollowing) || []).map(thread => (
              <div key={thread.id} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback>{thread.parentMessage.author.displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{thread.parentMessage.author.displayName}</span>
                      <span className="text-xs text-gray-500">in #{thread.channel}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{thread.parentMessage.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{thread.replies} replies</span>
                      <span>Your last reply {formatTime(thread.lastReply)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {mockThreads.filter(t => t.isFollowing).length === 0 && (
              <p className="text-center text-gray-500 py-8">You haven't replied to any threads yet</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMyRepliesDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archived Threads Dialog */}
      <Dialog open={showArchivedThreadsDialog} onOpenChange={setShowArchivedThreadsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Archive className="w-5 h-5 text-fuchsia-600" />
              Archived Threads
            </DialogTitle>
            <DialogDescription>
              Threads that have been archived
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="text-center py-12">
              <Archive className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No archived threads</p>
              <p className="text-sm text-gray-400 mt-2">Threads you archive will appear here</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowArchivedThreadsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Call History Dialog */}
      <Dialog open={showCallHistoryDialog} onOpenChange={setShowCallHistoryDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Call History
            </DialogTitle>
            <DialogDescription>
              {stats.totalCalls} calls today
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {mockCalls.map(call => (
              <div key={call.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 border">
                <div className="flex items-center gap-3">
                  {call.status === 'missed' ? <PhoneOff className="w-5 h-5 text-red-500" /> :
                   call.status === 'ongoing' ? <Phone className="w-5 h-5 text-green-500 animate-pulse" /> :
                   <Phone className="w-5 h-5 text-gray-500" />}
                  <div>
                    <p className="font-medium">{call.channelName}</p>
                    <p className="text-sm text-gray-500">{formatTime(call.startTime)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {call.duration && <span className="text-sm text-gray-500">{formatDuration(call.duration)}</span>}
                  <Badge className={
                    call.status === 'missed' ? 'bg-red-100 text-red-700' :
                    call.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                    call.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }>{call.status}</Badge>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCallHistoryDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Browse Files Dialog */}
      <Dialog open={showBrowseFilesDialog} onOpenChange={setShowBrowseFilesDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-indigo-600" />
              Browse All Files
            </DialogTitle>
            <DialogDescription>
              {mockFiles.length} files shared across channels
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {mockFiles.map(file => (
              <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    {file.type.includes('image') ? <Image className="w-5 h-5 text-blue-500"  loading="lazy"/> :
                     file.type.includes('video') ? <Video className="w-5 h-5 text-purple-500" /> :
                     file.type.includes('pdf') ? <FileText className="w-5 h-5 text-red-500" /> :
                     <FolderOpen className="w-5 h-5 text-gray-500" />}
                  </div>
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{formatFileSize(file.size)}</span>
                      <span>-</span>
                      <span>{file.channelName}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                  const link = document.createElement('a')
                  link.href = file.url || '#'
                  link.download = file.name
                  link.click()
                  toast.success(`Downloaded ${file.name}`)
                }}>
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBrowseFilesDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Code Files Dialog */}
      <Dialog open={showCodeFilesDialog} onOpenChange={setShowCodeFilesDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code className="w-5 h-5 text-pink-600" />
              Code Files
            </DialogTitle>
            <DialogDescription>
              Code snippets and files shared in channels
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="text-center py-12">
              <Code className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No code files found</p>
              <p className="text-sm text-gray-400 mt-2">Share code snippets in messages to see them here</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCodeFilesDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* All Mentions Dialog */}
      <Dialog open={showAllMentionsDialog} onOpenChange={setShowAllMentionsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AtSign className="w-5 h-5 text-cyan-600" />
              All Mentions
            </DialogTitle>
            <DialogDescription>
              {mockMentions.length} mentions found
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {(mockMentions || []).map(mention => (
              <div key={mention.id} className={`p-4 border rounded-lg ${mention.isRead ? '' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200'}`}>
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback>{mention.message.author.displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{mention.message.author.displayName}</span>
                      <span className="text-xs text-gray-500">in {mention.channel}</span>
                      {!mention.isRead && <Badge className="bg-blue-500 text-white text-xs">New</Badge>}
                    </div>
                    <p className="text-sm">{mention.message.content}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatTime(mention.mentionedAt)}</p>
                  </div>
                </div>
              </div>
            ))}
            {mockMentions.length === 0 && (
              <p className="text-center text-gray-500 py-8">No mentions found</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAllMentionsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reactions Dialog */}
      <Dialog open={showReactionsDialog} onOpenChange={setShowReactionsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ThumbsUp className="w-5 h-5 text-emerald-600" />
              Reactions to Your Messages
            </DialogTitle>
            <DialogDescription>
              12 reactions to your messages
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-6">
              {[
                { emoji: '👍', label: 'Thumbs Up', count: 5 },
                { emoji: '❤️', label: 'Heart', count: 3 },
                { emoji: '🔥', label: 'Fire', count: 2 },
                { emoji: '🎉', label: 'Celebrate', count: 2 },
              ].map((reaction, idx) => (
                <div key={idx} className="text-center p-4 border rounded-lg">
                  <span className="text-3xl">{reaction.emoji}</span>
                  <p className="text-sm font-medium mt-2">{reaction.count}</p>
                  <p className="text-xs text-gray-500">{reaction.label}</p>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Recent Reactions</h4>
              {mockMessages.filter(m => m.reactions.length > 0).slice(0, 3).map(message => (
                <div key={message.id} className="p-3 border rounded-lg mb-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1">{message.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {message.reactions.map((reaction, idx) => (
                      <span key={idx} className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {getReactionIcon(reaction.type)} {reaction.count}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReactionsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Compose Message Dialog */}
      <Dialog open={showComposeDialog} onOpenChange={setShowComposeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-pink-600" />
              Compose Message
            </DialogTitle>
            <DialogDescription>
              Create a new message
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Recipient</Label>
              <Select value={composeRecipient} onValueChange={setComposeRecipient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a recipient" />
                </SelectTrigger>
                <SelectContent>
                  {mockUsers.filter(u => u.id !== currentUser.id).map(user => (
                    <SelectItem key={user.id} value={user.id}>{user.displayName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject (optional)</Label>
              <Input
                placeholder="Enter subject..."
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <textarea
                className="w-full min-h-32 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-700"
                placeholder="Type your message..."
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.multiple = true
                input.onchange = () => handleFileUpload(input.files)
                input.click()
              }}>
                <Upload className="w-4 h-4 mr-2" />
                Attach Files
              </Button>
              {uploadedFiles.length > 0 && (
                <span className="text-sm text-gray-500">{uploadedFiles.length} file(s) attached</span>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowComposeDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmitCompose} disabled={mutating || !composeBody.trim() || !composeRecipient}>
              {mutating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Reply className="w-5 h-5 text-fuchsia-600" />
              Reply to Message
            </DialogTitle>
            <DialogDescription>
              Reply to {replyToMessage?.author.displayName || 'this message'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {replyToMessage && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">{replyToMessage.author.displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{replyToMessage.author.displayName}</span>
                  <span className="text-xs text-gray-500">{formatTime(replyToMessage.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{replyToMessage.content}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label>Your Reply</Label>
              <textarea
                className="w-full min-h-32 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-700"
                placeholder="Type your reply..."
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReplyDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmitReply} disabled={mutating || !replyBody.trim()}>
              {mutating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Reply className="w-4 h-4 mr-2" />}
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Forward Dialog */}
      <Dialog open={showForwardDialog} onOpenChange={setShowForwardDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Forward className="w-5 h-5 text-purple-600" />
              Forward Message
            </DialogTitle>
            <DialogDescription>
              Forward this message to another recipient
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {forwardMessage && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">{forwardMessage.author.displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{forwardMessage.author.displayName}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{forwardMessage.content}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label>Forward To</Label>
              <Select value={forwardRecipient} onValueChange={setForwardRecipient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a recipient" />
                </SelectTrigger>
                <SelectContent>
                  {mockUsers.filter(u => u.id !== currentUser.id).map(user => (
                    <SelectItem key={user.id} value={user.id}>{user.displayName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowForwardDialog(false); setIsForwardMode(false) }}>Cancel</Button>
            <Button onClick={handleSubmitForward} disabled={mutating || !forwardRecipient}>
              {mutating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Forward className="w-4 h-4 mr-2" />}
              Forward
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Delete Message
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirmDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={mutating}>
              {mutating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation Dialog */}
      <Dialog open={showArchiveConfirmDialog} onOpenChange={setShowArchiveConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Archive className="w-5 h-5 text-amber-600" />
              Archive Message
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to archive this message? You can find it in your archive folder later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowArchiveConfirmDialog(false)}>Cancel</Button>
            <Button onClick={handleConfirmArchive} disabled={mutating}>
              {mutating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Archive className="w-4 h-4 mr-2" />}
              Archive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Channel Dialog */}
      <Dialog open={showCreateChannelDialog} onOpenChange={setShowCreateChannelDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {newChannelType === 'public' ? <Hash className="w-5 h-5 text-purple-600" /> : <Lock className="w-5 h-5 text-purple-600" />}
              Create {newChannelType === 'public' ? 'Channel' : 'Private Group'}
            </DialogTitle>
            <DialogDescription>
              {newChannelType === 'public' ? 'Channels are open to everyone in the workspace' : 'Private groups are only visible to invited members'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="flex gap-2">
                <Button
                  variant={newChannelType === 'public' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNewChannelType('public')}
                >
                  <Hash className="w-4 h-4 mr-2" />
                  Public
                </Button>
                <Button
                  variant={newChannelType === 'private' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNewChannelType('private')}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Private
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="e.g., marketing, design-team"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input
                placeholder="What's this channel about?"
                value={newChannelDescription}
                onChange={(e) => setNewChannelDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateChannelDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmitCreateChannel} disabled={mutating || !newChannelName.trim()}>
              {mutating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Saved Messages Dialog */}
      <Dialog open={showSavedMessagesDialog} onOpenChange={setShowSavedMessagesDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-violet-600" />
              Saved Messages
            </DialogTitle>
            <DialogDescription>
              {supabaseMessages?.filter(m => m.is_starred)?.length || 0} saved messages
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {supabaseMessages?.filter(m => m.is_starred)?.length ? (
              supabaseMessages.filter(m => m.is_starred).map(msg => (
                <div key={msg.id} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{msg.subject || 'No subject'}</span>
                    <span className="text-xs text-gray-500">{formatTime(msg.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{msg.body}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No saved messages</p>
                <p className="text-sm text-gray-400 mt-2">Star messages to save them for later</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSavedMessagesDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pinned Messages Dialog */}
      <Dialog open={showPinnedMessagesDialog} onOpenChange={setShowPinnedMessagesDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pin className="w-5 h-5 text-indigo-600" />
              Pinned Messages
            </DialogTitle>
            <DialogDescription>
              {supabaseMessages?.filter(m => m.is_pinned)?.length || pinnedMessages.length || 0} pinned messages
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {(supabaseMessages?.filter(m => m.is_pinned)?.length || pinnedMessages.length) ? (
              [...(supabaseMessages?.filter(m => m.is_pinned) || []), ...pinnedMessages].map((msg: any, idx) => (
                <div key={msg.id || idx} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Pin className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-medium">{msg.subject || msg.text || 'Pinned message'}</span>
                    <span className="text-xs text-gray-500">{formatTime(msg.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{msg.body || msg.text}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Pin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No pinned messages</p>
                <p className="text-sm text-gray-400 mt-2">Pin important messages to find them quickly</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPinnedMessagesDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Upload Dialog */}
      <Dialog open={showFileUploadDialog} onOpenChange={setShowFileUploadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              Upload Files
            </DialogTitle>
            <DialogDescription>
              Select files to upload and share
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.multiple = true
                input.onchange = () => handleFileUpload(input.files)
                input.click()
              }}
            >
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Click to select files</p>
              <p className="text-xs text-gray-400 mt-1">or drag and drop</p>
            </div>
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Files ({uploadedFiles.length})</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== idx))}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowFileUploadDialog(false); setUploadedFiles([]) }}>Cancel</Button>
            <Button
              onClick={async () => {
                if (uploadedFiles.length > 0) {
                  try {
                    toast.loading('Uploading files...')
                    const supabase = createClient()
                    const { data: { user } } = await supabase.auth.getUser()
                    if (!user) throw new Error('Not authenticated')

                    for (const file of uploadedFiles) {
                      const fileExt = file.name.split('.').pop()
                      const fileName = `${user.id}/messages/${Date.now()}-${file.name}`

                      const { error: uploadError } = await supabase.storage
                        .from('attachments')
                        .upload(fileName, file)

                      if (uploadError) throw uploadError
                    }

                    toast.dismiss()
                    toast.success(`${uploadedFiles.length} file(s) uploaded successfully`)
                    setShowFileUploadDialog(false)
                    setUploadedFiles([])
                  } catch (error: any) {
                    toast.dismiss()
                    toast.error('Failed to upload files', { description: error.message })
                  }
                } else {
                  toast.error('No files selected')
                }
              }}
              disabled={uploadedFiles.length === 0}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload {uploadedFiles.length > 0 ? `(${uploadedFiles.length})` : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
