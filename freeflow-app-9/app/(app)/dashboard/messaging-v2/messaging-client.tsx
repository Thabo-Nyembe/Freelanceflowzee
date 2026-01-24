'use client'

import { createClient } from '@/lib/supabase/client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import {
  MessageSquare,
  Send,
  Star,
  Search,
  Paperclip,
  Clock,
  Users,
  TrendingUp,
  Hash,
  Lock,
  Plus,
  Settings,
  ChevronDown,
  ChevronRight,
  AtSign,
  Smile,
  Image,
  FileText,
  Mic,
  Pin,
  Bookmark,
  Trash2,
  Bell,
  LogOut,
  Eye,
  X,
  Loader2,
  Link,
  Code,
  Bold,
  Italic,
  MoreHorizontal,
  Headphones,
  VolumeX,
  Globe,
  Zap,
  MessageCircle,
  Download,
  ExternalLink,
  Phone,
  Video,
  PhoneOff,
  VideoOff,
  MicOff,
  Monitor,
  Hand,
  Circle,
  Square,
  ScreenShare,
  ScreenShareOff
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


import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useConversations, useMessagingMutations, useDirectMessages as useDirectMessagesHook } from '@/lib/hooks/use-messaging'
import { useVoiceVideo, useActiveCall } from '@/lib/hooks/use-voice-video'
import { useAuth } from '@/lib/hooks/use-auth'
import { useUsers } from '@/lib/hooks/use-users-extended'

// Initialize Supabase client once at module level
const supabase = createClient()

// ============================================================================
// TYPE DEFINITIONS - Slack/Discord Level
// ============================================================================

interface User {
  id: string
  name: string
  displayName: string
  avatar: string
  email: string
  status: 'online' | 'away' | 'dnd' | 'offline'
  statusMessage: string | null
  role: 'admin' | 'member' | 'guest'
  lastSeen: string
}

interface Reaction {
  emoji: string
  count: number
  users: string[]
  reacted: boolean
}

interface Attachment {
  id: string
  type: 'image' | 'file' | 'video' | 'audio' | 'link'
  name: string
  url: string
  size: number
  mimeType: string
  thumbnail?: string
  preview?: {
    title: string
    description: string
    image: string
  }
}

interface Message {
  id: string
  channelId: string
  threadId: string | null
  parentId: string | null
  author: User
  content: string
  timestamp: string
  editedAt: string | null
  reactions: Reaction[]
  attachments: Attachment[]
  mentions: string[]
  isPinned: boolean
  isBookmarked: boolean
  replyCount: number
  isEdited: boolean
  isDeleted: boolean
}

interface Thread {
  id: string
  parentMessage: Message
  messages: Message[]
  participantCount: number
  lastReplyAt: string
  isFollowing: boolean
}

interface Channel {
  id: string
  name: string
  description: string
  type: 'public' | 'private' | 'dm' | 'group_dm'
  categoryId: string | null
  memberCount: number
  unreadCount: number
  mentionCount: number
  lastMessageAt: string
  lastMessage: string | null
  isPinned: boolean
  isMuted: boolean
  isArchived: boolean
  topic: string | null
  createdBy: User
  createdAt: string
  members?: User[]
}

interface ChannelCategory {
  id: string
  name: string
  channels: Channel[]
  isCollapsed: boolean
}

interface DirectMessage {
  id: string
  participants: User[]
  lastMessage: Message | null
  unreadCount: number
  isPinned: boolean
  isMuted: boolean
}

interface SearchResult {
  type: 'message' | 'file' | 'channel' | 'user'
  message?: Message
  file?: Attachment
  channel?: Channel
  user?: User
  relevance: number
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Transform DB user to messaging User type
function transformDbUserToUser(dbUser: any): User {
  return {
    id: dbUser.id,
    name: dbUser.full_name || dbUser.email?.split('@')[0] || 'Unknown',
    displayName: dbUser.full_name?.toLowerCase().replace(/\s/g, '') || dbUser.email?.split('@')[0] || 'unknown',
    avatar: dbUser.avatar_url || '',
    email: dbUser.email || '',
    status: 'online' as const,
    statusMessage: null,
    role: (dbUser.role as 'admin' | 'member' | 'guest') || 'member',
    lastSeen: dbUser.updated_at || dbUser.created_at || new Date().toISOString()
  }
}

// Transform conversation to Channel type
function transformConversationToChannel(conv: any, defaultUser: User): Channel {
  return {
    id: conv.id,
    name: conv.conversation_name || 'unnamed',
    description: conv.metadata?.description || '',
    type: conv.conversation_type === 'channel' ? 'public' : conv.metadata?.is_private ? 'private' : 'public',
    categoryId: conv.metadata?.category_id || 'cat-1',
    memberCount: conv.participant_count || 1,
    unreadCount: conv.unread_count || 0,
    mentionCount: 0,
    lastMessageAt: conv.last_message_at || conv.updated_at,
    lastMessage: conv.last_message_preview || null,
    isPinned: conv.is_pinned || false,
    isMuted: conv.is_muted || false,
    isArchived: conv.status === 'archived',
    topic: conv.metadata?.topic || '',
    createdBy: defaultUser,
    createdAt: conv.created_at
  }
}

// Transform DB message to Message type
function transformDbMessageToMessage(dbMsg: any, users: User[]): Message {
  const author = users.find(u => u.id === dbMsg.sender_id) || {
    id: dbMsg.sender_id || 'unknown',
    name: dbMsg.sender_name || 'Unknown',
    displayName: dbMsg.sender_name?.toLowerCase().replace(/\s/g, '') || 'unknown',
    avatar: dbMsg.sender_avatar || '',
    email: dbMsg.sender_email || '',
    status: 'offline' as const,
    statusMessage: null,
    role: 'member' as const,
    lastSeen: dbMsg.sent_at
  }

  return {
    id: dbMsg.id,
    channelId: dbMsg.conversation_id || '',
    threadId: null,
    parentId: dbMsg.reply_to_id || null,
    author,
    content: dbMsg.content || '',
    timestamp: dbMsg.sent_at || dbMsg.created_at,
    editedAt: dbMsg.edited_at || null,
    reactions: dbMsg.reactions ? Object.entries(dbMsg.reactions).map(([emoji, data]: [string, any]) => ({
      emoji,
      count: data.count || 1,
      users: data.users || [],
      reacted: false
    })) : [],
    attachments: dbMsg.attachments || [],
    mentions: [],
    isPinned: dbMsg.metadata?.is_pinned || false,
    isBookmarked: dbMsg.metadata?.is_bookmarked || false,
    replyCount: 0,
    isEdited: dbMsg.is_edited || false,
    isDeleted: dbMsg.deleted_at !== null
  }
}

// Transform DM conversation to DirectMessage type
function transformDmConversationToDirectMessage(conv: any, users: User[], currentUserId: string): DirectMessage {
  const participantIds = conv.participant_ids || []
  const participants = participantIds
    .map((id: string) => users.find(u => u.id === id))
    .filter(Boolean) as User[]

  // If no participants found, create placeholder from participant_emails
  if (participants.length === 0 && conv.participant_emails) {
    conv.participant_emails.forEach((email: string, idx: number) => {
      participants.push({
        id: participantIds[idx] || `temp-${idx}`,
        name: email.split('@')[0],
        displayName: email.split('@')[0].toLowerCase(),
        avatar: '',
        email,
        status: 'offline',
        statusMessage: null,
        role: 'member',
        lastSeen: conv.updated_at
      })
    })
  }

  return {
    id: conv.id,
    participants,
    lastMessage: null,
    unreadCount: conv.unread_count || 0,
    isPinned: conv.is_pinned || false,
    isMuted: conv.is_muted || false
  }
}

// ============================================================================
// EMOJI PICKER DATA
// ============================================================================

const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '🔥', '🎉', '🚀', '👀', '✅']

// ============================================================================
// COMPONENT
// ============================================================================

export default function MessagingClient() {
  // Define adapter variables locally (removed mock data imports)
  const messagingAIInsights: any[] = []
  const messagingCollaborators: any[] = []
  const messagingPredictions: any[] = []
  const messagingActivities: any[] = []
  const messagingQuickActions: any[] = []

  // Auth hook for current user
  const { user: authUser, loading: authLoading } = useAuth()
  const currentUserId = authUser?.id || null

  // Users hook for team members
  const { users: dbUsers, isLoading: usersLoading, refresh: refetchUsers } = useUsers({ is_active: true, limit: 100 })

  // Supabase hooks for real data
  const { conversations, loading: conversationsLoading, refetch: refetchConversations } = useConversations({ type: 'channel' })
  const { conversations: dmConversations, loading: dmsLoading, refetch: refetchDMs } = useConversations({ type: 'direct' })
  const { messages: dbDirectMessages, loading: messagesLoading, refetch: refetchMessages } = useDirectMessagesHook({})
  const {
    createConversation,
    updateConversation,
    deleteConversation,
    sendMessage,
    updateMessage,
    deleteMessage
  } = useMessagingMutations()

  // Transform DB users to messaging User type
  const users: User[] = useMemo(() => {
    return dbUsers.map(transformDbUserToUser)
  }, [dbUsers])

  // Create currentUser from authenticated user
  const currentUser: User = useMemo(() => {
    if (authUser) {
      return {
        id: authUser.id,
        name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'You',
        displayName: authUser.user_metadata?.full_name?.toLowerCase().replace(/\s/g, '') || authUser.email?.split('@')[0] || 'you',
        avatar: authUser.user_metadata?.avatar_url || '',
        email: authUser.email || '',
        status: 'online' as const,
        statusMessage: null,
        role: 'member' as const,
        lastSeen: new Date().toISOString()
      }
    }
    // Fallback for unauthenticated state
    return {
      id: 'guest',
      name: 'Guest',
      displayName: 'guest',
      avatar: '',
      email: '',
      status: 'online' as const,
      statusMessage: null,
      role: 'guest' as const,
      lastSeen: new Date().toISOString()
    }
  }, [authUser])

  // Transform conversations to channels
  const channels: Channel[] = useMemo(() => {
    return conversations.map(conv => transformConversationToChannel(conv, currentUser))
  }, [conversations, currentUser])

  // Transform DM conversations to DirectMessage type
  const directMessages: DirectMessage[] = useMemo(() => {
    return dmConversations.map(conv => transformDmConversationToDirectMessage(conv, users, currentUserId || ''))
  }, [dmConversations, users, currentUserId])

  // Transform DB messages to Message type
  const transformedMessages: Message[] = useMemo(() => {
    return dbDirectMessages.map(msg => transformDbMessageToMessage(msg, users))
  }, [dbDirectMessages, users])

  // Build categories from channels
  const initialCategories: ChannelCategory[] = useMemo(() => {
    // Group channels by category
    const workChannels = channels.filter(c =>
      ['general', 'engineering', 'design', 'announcements'].includes(c.name.toLowerCase()) ||
      c.type === 'public'
    )
    const projectChannels = channels.filter(c =>
      c.name.toLowerCase().includes('project') || c.type === 'private'
    )
    const socialChannels = channels.filter(c =>
      ['random', 'social', 'fun'].includes(c.name.toLowerCase())
    )

    return [
      { id: 'cat-1', name: 'Work', channels: workChannels.length > 0 ? workChannels : channels, isCollapsed: false },
      { id: 'cat-2', name: 'Projects', channels: projectChannels, isCollapsed: false },
      { id: 'cat-3', name: 'Social', channels: socialChannels, isCollapsed: true }
    ].filter(cat => cat.channels.length > 0 || cat.id === 'cat-1')
  }, [channels])

  // Voice/Video Calling Hooks
  const voiceVideo = useVoiceVideo()
  const { call: activeCall, participants, isConnecting: callConnecting } = useActiveCall(voiceVideo.activeCallId)

  // Call UI State
  const [showCallUI, setShowCallUI] = useState(false)
  const [isStartingCall, setIsStartingCall] = useState(false)

  // UI State
  const [activeView, setActiveView] = useState<'channels' | 'dms' | 'threads' | 'search' | 'settings' | 'analytics'>('channels')
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [selectedDM, setSelectedDM] = useState<DirectMessage | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [categories, setCategories] = useState<ChannelCategory[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showThread, setShowThread] = useState(false)
  const [selectedThread, setSelectedThread] = useState<Message | null>(null)
  const [showChannelSettings, setShowChannelSettings] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null)
  const [editingMessage, setEditingMessage] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [typingUsers, setTypingUsers] = useState<User[]>([])
  const [showNewChannel, setShowNewChannel] = useState(false)
  const [activeTab, setActiveTab] = useState('messages')
  const [settingsTab, setSettingsTab] = useState('general')
  const messageEndRef = useRef<HTMLDivElement>(null)

  // New Channel Form State
  const [newChannelName, setNewChannelName] = useState('')
  const [newChannelDescription, setNewChannelDescription] = useState('')
  const [newChannelType, setNewChannelType] = useState<'public' | 'private'>('public')
  const [isCreatingChannel, setIsCreatingChannel] = useState(false)

  // Message editing state
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  // Sync categories when initialCategories change
  useEffect(() => {
    if (initialCategories.length > 0 && categories.length === 0) {
      setCategories(initialCategories)
    }
  }, [initialCategories, categories.length])

  // Sync messages when transformedMessages change
  useEffect(() => {
    if (transformedMessages.length > 0) {
      setMessages(transformedMessages)
    }
  }, [transformedMessages])

  // Select first channel when channels load
  useEffect(() => {
    if (channels.length > 0 && !selectedChannel) {
      setSelectedChannel(channels[0])
    }
  }, [channels, selectedChannel])

  const currentChannelMessages = useMemo(() => {
    if (!selectedChannel) return []
    return messages.filter(m => m.channelId === selectedChannel.id && !m.parentId)
  }, [messages, selectedChannel])

  const threadMessages = useMemo(() => {
    if (!selectedThread) return []
    return messages.filter(m => m.parentId === selectedThread.id)
  }, [messages, selectedThread])

  const totalUnread = useMemo(() => {
    return channels.reduce((sum, c) => sum + c.unreadCount, 0) +
           directMessages.reduce((sum, d) => sum + d.unreadCount, 0)
  }, [channels, directMessages])

  const toggleCategory = (categoryId: string) => {
    setCategories(cats => cats.map(c =>
      c.id === categoryId ? { ...c, isCollapsed: !c.isCollapsed } : c
    ))
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChannel) return

    const tempId = `msg-${Date.now()}`
    const now = new Date().toISOString()

    // Optimistic UI update
    const newMessage: Message = {
      id: tempId,
      channelId: selectedChannel.id,
      threadId: null,
      parentId: null,
      author: currentUser,
      content: messageInput,
      timestamp: now,
      editedAt: null,
      reactions: [],
      attachments: [],
      mentions: [],
      isPinned: false,
      isBookmarked: false,
      replyCount: 0,
      isEdited: false,
      isDeleted: false
    }
    setMessages(prev => [...prev, newMessage])
    setMessageInput('')

    // Save to Supabase
    try {
      // Find the conversation ID for this channel
      const channelConversation = conversations.find(c =>
        c.conversation_name === selectedChannel.name
      )

      const result = await sendMessage.create({
        conversation_id: channelConversation?.id || null,
        content: messageInput,
        content_type: 'text',
        sender_id: currentUserId || '',
        sender_name: currentUser.name,
        sender_email: currentUser.email,
        sender_avatar: currentUser.avatar,
        status: 'sent',
        is_edited: false,
        is_forwarded: false,
        is_reply: false,
        attachments: [],
        attachment_count: 0,
        reactions: {},
        reaction_count: 0,
        sent_at: now,
        metadata: { channel_id: selectedChannel.id }
      })

      if (result) {
        // Update the message ID with the real one from DB
        setMessages(prev => prev.map(m =>
          m.id === tempId ? { ...m, id: result.id } : m
        ))
      }
    } catch (error) {
      console.error('Failed to save message:', error)
      // Message is already in local state, so user sees it
      // In a real app, you might want to mark it as "failed to send"
    }
  }

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== messageId) return m
      const existingReaction = m.reactions.find(r => r.emoji === emoji)
      if (existingReaction) {
        if (existingReaction.reacted) {
          return {
            ...m,
            reactions: m.reactions.map(r =>
              r.emoji === emoji
                ? { ...r, count: r.count - 1, users: r.users.filter(u => u !== currentUser.id), reacted: false }
                : r
            ).filter(r => r.count > 0)
          }
        } else {
          return {
            ...m,
            reactions: m.reactions.map(r =>
              r.emoji === emoji
                ? { ...r, count: r.count + 1, users: [...r.users, currentUser.id], reacted: true }
                : r
            )
          }
        }
      } else {
        return {
          ...m,
          reactions: [...m.reactions, { emoji, count: 1, users: [currentUser.id], reacted: true }]
        }
      }
    }))
    setShowEmojiPicker(null)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    setIsSearching(true)
    // Simulate search
    setTimeout(() => {
      const results: SearchResult[] = messages
        .filter(m => m.content.toLowerCase().includes(query.toLowerCase()))
        .map(m => ({ type: 'message' as const, message: m, relevance: 1 }))
      setSearchResults(results)
      setIsSearching(false)
    }, 300)
  }

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'dnd': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Handlers
  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) {
      toast.error('Channel name required')
      return
    }

    // Validate channel name (no spaces or periods)
    if (/[\s.]/.test(newChannelName)) {
      toast.error('Invalid channel name')
      return
    }

    setIsCreatingChannel(true)
    try {
      const result = await createConversation.create({
        conversation_name: newChannelName.toLowerCase(),
        conversation_type: newChannelType === 'public' ? 'channel' : 'group',
        status: 'active',
        participant_count: 1,
        is_pinned: false,
        is_starred: false,
        is_muted: false,
        unread_count: 0,
        notification_enabled: true,
        metadata: {
          description: newChannelDescription,
          is_private: newChannelType === 'private'
        }
      })

      if (result) {
        toast.success(`Channel created: "${newChannelName}" has been created successfully`)
        setShowNewChannel(false)
        setNewChannelName('')
        setNewChannelDescription('')
        setNewChannelType('public')
        refetchConversations()
      }
    } catch (error) {
      toast.error('Failed to create channel')
    } finally {
      setIsCreatingChannel(false)
    }
  }

  const handlePinMessage = async (message: Message) => {
    try {
      // Update message in local state immediately for optimistic UI
      setMessages(prev => prev.map(m =>
        m.id === message.id ? { ...m, isPinned: !m.isPinned } : m
      ))

      // If we have a real message ID (from DB), update in Supabase
      if (message.id && !message.id.startsWith('msg-')) {
        await updateMessage.update(message.id, {
          is_pinned: !message.isPinned
        })
      }

      toast.success(message.isPinned ? 'Message unpinned' : 'Message pinned')
    } catch (error) {
      // Revert on error
      setMessages(prev => prev.map(m =>
        m.id === message.id ? { ...m, isPinned: message.isPinned } : m
      ))
      toast.error('Failed to update pin status')
    }
  }

  const handleReactToMessage = async (message: Message, emoji: string) => {
    try {
      // Update local state for optimistic UI
      handleReaction(message.id, emoji)

      // If we have a real message ID, update in Supabase
      if (message.id && !message.id.startsWith('msg-')) {
        const currentReactions = message.reactions || []
        const existingReaction = currentReactions.find(r => r.emoji === emoji)
        let updatedReactions

        if (existingReaction?.reacted) {
          // Remove reaction
          updatedReactions = currentReactions.filter(r => r.emoji !== emoji || r.count > 1)
        } else {
          // Add reaction
          updatedReactions = [...currentReactions, { emoji, count: 1, users: [currentUserId || ''], reacted: true }]
        }

        await updateMessage.update(message.id, {
          reactions: updatedReactions
        })
      }

      toast.success(`Reaction updated: ${emoji} reaction added`)
    } catch (error) {
      toast.error('Failed to add reaction')
    }
  }

  const handleSearchMessages = async () => {
    if (!searchQuery.trim()) {
      toast.info('Enter search term')
      return
    }

    setIsSearching(true)
    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .ilike('content', `%${searchQuery}%`)
        .order('sent_at', { ascending: false })
        .limit(50)

      if (error) throw error

      const results: SearchResult[] = (data || []).map((msg: any) => ({
        type: 'message' as const,
        message: {
          id: msg.id,
          channelId: msg.conversation_id || '',
          threadId: null,
          parentId: msg.reply_to_id,
          author: {
            id: msg.sender_id,
            name: msg.sender_name || 'Unknown',
            displayName: msg.sender_name?.toLowerCase().replace(/\s/g, '') || 'unknown',
            avatar: msg.sender_avatar || '',
            email: msg.sender_email || '',
            status: 'online' as const,
            statusMessage: null,
            role: 'member' as const,
            lastSeen: msg.sent_at
          },
          content: msg.content,
          timestamp: msg.sent_at,
          editedAt: msg.edited_at,
          reactions: msg.reactions ? Object.entries(msg.reactions).map(([emoji, data]: [string, any]) => ({
            emoji,
            count: data.count || 1,
            users: data.users || [],
            reacted: data.users?.includes(currentUserId) || false
          })) : [],
          attachments: msg.attachments || [],
          mentions: [],
          isPinned: false,
          isBookmarked: false,
          replyCount: 0,
          isEdited: msg.is_edited,
          isDeleted: false
        },
        relevance: 1
      }))

      setSearchResults(results)
      toast.success(`Search complete: ${results.length} matching messages`)
    } catch (error) {
      toast.error('Search failed')
    } finally {
      setIsSearching(false)
    }
  }

  // Save edited message to Supabase
  const handleSaveEditedMessage = async (messageId: string) => {
    if (!editContent.trim()) return

    setIsSavingEdit(true)
    try {
      // Update local state immediately
      setMessages(prev => prev.map(m =>
        m.id === messageId ? { ...m, content: editContent, isEdited: true, editedAt: new Date().toISOString() } : m
      ))
      setEditingMessage(null)

      // If it's a real DB message, update in Supabase
      if (messageId && !messageId.startsWith('msg-')) {
        await updateMessage.update(messageId, {
          content: editContent,
          is_edited: true,
          edited_at: new Date().toISOString()
        })
      }

      toast.success('Message updated')
    } catch (error) {
      toast.error('Failed to update message')
    } finally {
      setIsSavingEdit(false)
    }
  }

  // Delete message
  const handleDeleteMessage = async (messageId: string) => {
    try {
      // Remove from local state immediately
      setMessages(prev => prev.filter(m => m.id !== messageId))

      // If it's a real DB message, delete in Supabase
      if (messageId && !messageId.startsWith('msg-')) {
        await deleteMessage.remove(messageId)
      }

      toast.success('Message deleted')
    } catch (error) {
      toast.error('Failed to delete message')
    }
  }

  // Bookmark message
  const handleBookmarkMessage = async (message: Message) => {
    try {
      setMessages(prev => prev.map(m =>
        m.id === message.id ? { ...m, isBookmarked: !m.isBookmarked } : m
      ))

      if (message.id && !message.id.startsWith('msg-')) {
        await updateMessage.update(message.id, {
          metadata: { ...((message as any).metadata || {}), is_bookmarked: !message.isBookmarked }
        })
      }

      toast.success(message.isBookmarked ? 'Bookmark removed' : 'Message bookmarked')
    } catch (error) {
      setMessages(prev => prev.map(m =>
        m.id === message.id ? { ...m, isBookmarked: message.isBookmarked } : m
      ))
      toast.error('Failed to update bookmark')
    }
  }

  // Toggle channel mute
  const handleToggleChannelMute = async () => {
    if (!selectedChannel) return

    try {
      // Find the conversation in the DB
      const channelConversation = conversations.find(c =>
        c.conversation_name === selectedChannel.name
      )

      if (channelConversation) {
        await updateConversation.update(channelConversation.id, {
          is_muted: !selectedChannel.isMuted
        })
        refetchConversations()
      }

      toast.success(selectedChannel.isMuted ? 'Channel unmuted' : 'Channel muted')
    } catch (error) {
      toast.error('Failed to update channel settings')
    }
  }

  // Toggle channel pin
  const handleToggleChannelPin = async () => {
    if (!selectedChannel) return

    try {
      const channelConversation = conversations.find(c =>
        c.conversation_name === selectedChannel.name
      )

      if (channelConversation) {
        await updateConversation.update(channelConversation.id, {
          is_pinned: !selectedChannel.isPinned
        })
        refetchConversations()
      }

      toast.success(selectedChannel.isPinned ? 'Channel unpinned' : 'Channel pinned')
    } catch (error) {
      toast.error('Failed to update channel settings')
    }
  }

  // Leave channel
  const handleLeaveChannel = async () => {
    if (!selectedChannel) return

    try {
      const channelConversation = conversations.find(c =>
        c.conversation_name === selectedChannel.name
      )

      if (channelConversation) {
        await updateConversation.update(channelConversation.id, {
          status: 'archived'
        })
        refetchConversations()
      }

      toast.success(`Left channel: ${selectedChannel?.name}`)
      setShowChannelSettings(false)
      setSelectedChannel(null)
    } catch (error) {
      toast.error('Failed to leave channel')
    }
  }

  // ============================================================================
  // VOICE/VIDEO CALL HANDLERS
  // ============================================================================

  const handleStartAudioCall = async () => {
    if (!selectedChannel || isStartingCall) return

    setIsStartingCall(true)
    try {
      await voiceVideo.startCall({
        channelId: selectedChannel.id,
        callType: 'audio',
        title: `Voice call in #${selectedChannel.name}`,
      })
      setShowCallUI(true)
      toast.success('Audio call started')
    } catch (error) {
      console.error('Failed to start audio call:', error)
      toast.error('Failed to start audio call')
    } finally {
      setIsStartingCall(false)
    }
  }

  const handleStartVideoCall = async () => {
    if (!selectedChannel || isStartingCall) return

    setIsStartingCall(true)
    try {
      await voiceVideo.startCall({
        channelId: selectedChannel.id,
        callType: 'video',
        title: `Video call in #${selectedChannel.name}`,
      })
      setShowCallUI(true)
      toast.success('Video call started')
    } catch (error) {
      console.error('Failed to start video call:', error)
      toast.error('Failed to start video call')
    } finally {
      setIsStartingCall(false)
    }
  }

  const handleJoinCall = async (callId: string) => {
    try {
      await voiceVideo.joinCall({ callId })
      setShowCallUI(true)
      toast.success('Joined call')
    } catch (error) {
      console.error('Failed to join call:', error)
      toast.error('Failed to join call')
    }
  }

  const handleLeaveCall = async () => {
    try {
      await voiceVideo.leaveCall()
      setShowCallUI(false)
      toast.success('Left call')
    } catch (error) {
      console.error('Failed to leave call:', error)
      toast.error('Failed to leave call')
    }
  }

  const handleEndCall = async () => {
    try {
      await voiceVideo.endCall()
      setShowCallUI(false)
      toast.success('Call ended')
    } catch (error) {
      console.error('Failed to end call:', error)
      toast.error('Failed to end call')
    }
  }

  const handleToggleAudio = () => {
    voiceVideo.toggleAudio()
  }

  const handleToggleVideo = () => {
    voiceVideo.toggleVideo()
  }

  const handleToggleScreenShare = async () => {
    try {
      await voiceVideo.toggleScreenShare()
    } catch (error) {
      toast.error('Failed to toggle screen share')
    }
  }

  const handleToggleHandRaise = async () => {
    try {
      await voiceVideo.toggleHandRaise()
      toast.success(voiceVideo.isHandRaised ? 'Hand lowered' : 'Hand raised')
    } catch (error) {
      toast.error('Failed to toggle hand raise')
    }
  }

  const handleToggleRecording = async () => {
    try {
      if (voiceVideo.isRecording) {
        await voiceVideo.stopRecording()
        toast.success('Recording stopped')
      } else {
        await voiceVideo.startRecording()
        toast.success('Recording started')
      }
    } catch (error) {
      toast.error('Failed to toggle recording')
    }
  }

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-gray-100 flex flex-col">
        {/* Workspace Header */}
        <div className="p-4 border-b border-gray-800">
          <button className="flex items-center justify-between w-full hover:bg-gray-800 rounded-lg p-2 -m-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center font-bold">
                F
              </div>
              <div>
                <h1 className="font-bold text-sm">FreeFlow</h1>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(currentUser.status)}`} />
                  {currentUser.name}
                </div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Navigation */}
        <div className="p-2 space-y-1">
          <button
            onClick={() => setActiveView('channels')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
              activeView === 'channels' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Hash className="w-4 h-4" />
            Channels
            {totalUnread > 0 && (
              <span className="ml-auto px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {totalUnread}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveView('dms')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
              activeView === 'dms' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Direct Messages
          </button>
          <button
            onClick={() => setActiveView('threads')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
              activeView === 'threads' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Threads
          </button>
          <button
            onClick={() => setActiveView('search')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
              activeView === 'search' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Search className="w-4 h-4" />
            Search
          </button>
          <button
            onClick={() => setActiveView('analytics')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
              activeView === 'analytics' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Analytics
          </button>
          <button
            onClick={() => setActiveView('settings')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
              activeView === 'settings' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>

        {/* Channels List */}
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-4 py-2">
            {categories.map(category => (
              <div key={category.id}>
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-200 w-full"
                >
                  {category.isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {category.name}
                </button>
                {!category.isCollapsed && (
                  <div className="mt-1 space-y-0.5">
                    {category.channels.map(channel => (
                      <button
                        key={channel.id}
                        onClick={() => { setSelectedChannel(channel); setSelectedDM(null) }}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm ${
                          selectedChannel?.id === channel.id
                            ? 'bg-indigo-600 text-white'
                            : channel.unreadCount > 0
                            ? 'text-white hover:bg-gray-800'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                        }`}
                      >
                        {channel.type === 'private' ? <Lock className="w-4 h-4" /> : <Hash className="w-4 h-4" />}
                        <span className={`flex-1 text-left truncate ${channel.unreadCount > 0 ? 'font-semibold' : ''}`}>
                          {channel.name}
                        </span>
                        {channel.unreadCount > 0 && (
                          <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                            channel.mentionCount > 0 ? 'bg-red-500 text-white' : 'bg-gray-600 text-gray-200'
                          }`}>
                            {channel.mentionCount > 0 ? `@${channel.mentionCount}` : channel.unreadCount}
                          </span>
                        )}
                        {channel.isMuted && <VolumeX className="w-3 h-3 text-gray-500" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Direct Messages */}
            <div>
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Direct Messages</span>
                <button className="p-1 hover:bg-gray-800 rounded">
                  <Plus className="w-3 h-3 text-gray-400" />
                </button>
              </div>
              <div className="mt-1 space-y-0.5">
                {directMessages.map(dm => {
                  const otherUser = dm.participants.find(p => p.id !== currentUser.id) || dm.participants[1]
                  return (
                    <button
                      key={dm.id}
                      onClick={() => { setSelectedDM(dm); setSelectedChannel(null) }}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm ${
                        selectedDM?.id === dm.id
                          ? 'bg-indigo-600 text-white'
                          : dm.unreadCount > 0
                          ? 'text-white hover:bg-gray-800'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                      }`}
                    >
                      <div className="relative">
                        <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white text-xs font-medium">
                          {otherUser?.name.charAt(0)}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-gray-900 ${getStatusColor(otherUser?.status || 'offline')}`} />
                      </div>
                      <span className={`flex-1 text-left truncate ${dm.unreadCount > 0 ? 'font-semibold' : ''}`}>
                        {dm.participants.length > 2
                          ? dm.participants.map(p => p.name.split(' ')[0]).join(', ')
                          : otherUser?.name}
                      </span>
                      {dm.unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 bg-red-500 text-white rounded-full text-xs font-medium">
                          {dm.unreadCount}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Add Channel Button */}
        <div className="p-2 border-t border-gray-800">
          <button
            onClick={() => setShowNewChannel(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300"
          >
            <Plus className="w-4 h-4" />
            Add Channel
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Settings View */}
        {activeView === 'settings' && (
          <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Settings Header */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Messaging Settings</h1>
                  <p className="text-muted-foreground">Configure your messaging experience</p>
                </div>
              </div>

              {/* Settings Banner */}
              <Card className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 text-white border-0">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">Slack-Level Messaging Platform</h3>
                        <p className="text-indigo-100 text-sm">Real-time messaging, channels, and collaboration</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{channels.length}</div>
                        <div className="text-xs text-indigo-100">Channels</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{directMessages.length}</div>
                        <div className="text-xs text-indigo-100">DMs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{messages.length}</div>
                        <div className="text-xs text-indigo-100">Messages</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-12 gap-6">
                {/* Settings Sidebar */}
                <Card className="col-span-3 h-fit">
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', icon: Settings, label: 'General' },
                        { id: 'notifications', icon: Bell, label: 'Notifications' },
                        { id: 'privacy', icon: Lock, label: 'Privacy' },
                        { id: 'appearance', icon: Eye, label: 'Appearance' },
                        { id: 'audio', icon: Headphones, label: 'Audio & Video' },
                        { id: 'advanced', icon: Zap, label: 'Advanced' }
                      ].map(item => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                            settingsTab === item.id
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/50'
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>

                {/* Settings Content */}
                <div className="col-span-9 space-y-6">
                  {settingsTab === 'general' && (
                    <Card>
                      <CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Language</div>
                            <div className="text-sm text-muted-foreground">Select your preferred language</div>
                          </div>
                          <select className="p-2 border rounded-lg dark:bg-gray-700">
                            <option>English (US)</option>
                            <option>Spanish</option>
                            <option>French</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Timezone</div>
                            <div className="text-sm text-muted-foreground">Set your local timezone</div>
                          </div>
                          <select className="p-2 border rounded-lg dark:bg-gray-700">
                            <option>UTC-5 (Eastern Time)</option>
                            <option>UTC-8 (Pacific Time)</option>
                            <option>UTC+0 (GMT)</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Show Online Status</div>
                            <div className="text-sm text-muted-foreground">Let others see when you're online</div>
                          </div>
                          <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Auto-mark as Read</div>
                            <div className="text-sm text-muted-foreground">Mark messages as read when viewing</div>
                          </div>
                          <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {settingsTab === 'notifications' && (
                    <Card>
                      <CardHeader><CardTitle>Notification Settings</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Desktop Notifications</div>
                            <div className="text-sm text-muted-foreground">Show desktop notifications for new messages</div>
                          </div>
                          <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Sound Notifications</div>
                            <div className="text-sm text-muted-foreground">Play sound for new messages</div>
                          </div>
                          <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Email Notifications</div>
                            <div className="text-sm text-muted-foreground">Receive email for missed messages</div>
                          </div>
                          <input type="checkbox" className="toggle" />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Do Not Disturb Schedule</div>
                            <div className="text-sm text-muted-foreground">Set hours to pause notifications</div>
                          </div>
                          <Button variant="outline" size="sm">Configure</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Thread Notifications</div>
                            <div className="text-sm text-muted-foreground">Notify for thread replies</div>
                          </div>
                          <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {settingsTab === 'privacy' && (
                    <Card>
                      <CardHeader><CardTitle>Privacy Settings</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Read Receipts</div>
                            <div className="text-sm text-muted-foreground">Show when you've read messages</div>
                          </div>
                          <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Typing Indicators</div>
                            <div className="text-sm text-muted-foreground">Show when you're typing</div>
                          </div>
                          <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Activity Status</div>
                            <div className="text-sm text-muted-foreground">Share your activity with others</div>
                          </div>
                          <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Profile Visibility</div>
                            <div className="text-sm text-muted-foreground">Who can see your profile</div>
                          </div>
                          <select className="p-2 border rounded-lg dark:bg-gray-700">
                            <option>Everyone</option>
                            <option>Team Members</option>
                            <option>Contacts Only</option>
                          </select>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {settingsTab === 'appearance' && (
                    <Card>
                      <CardHeader><CardTitle>Appearance Settings</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Theme</div>
                            <div className="text-sm text-muted-foreground">Choose your color theme</div>
                          </div>
                          <select className="p-2 border rounded-lg dark:bg-gray-700">
                            <option>System</option>
                            <option>Light</option>
                            <option>Dark</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Message Density</div>
                            <div className="text-sm text-muted-foreground">How compact messages appear</div>
                          </div>
                          <select className="p-2 border rounded-lg dark:bg-gray-700">
                            <option>Comfortable</option>
                            <option>Compact</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Sidebar Width</div>
                            <div className="text-sm text-muted-foreground">Adjust sidebar size</div>
                          </div>
                          <select className="p-2 border rounded-lg dark:bg-gray-700">
                            <option>Default</option>
                            <option>Wide</option>
                            <option>Narrow</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Show Avatars</div>
                            <div className="text-sm text-muted-foreground">Display user avatars in messages</div>
                          </div>
                          <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {settingsTab === 'audio' && (
                    <Card>
                      <CardHeader><CardTitle>Audio & Video Settings</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Microphone</div>
                            <div className="text-sm text-muted-foreground">Select input device</div>
                          </div>
                          <select className="p-2 border rounded-lg dark:bg-gray-700">
                            <option>Default Microphone</option>
                            <option>Built-in Microphone</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Speakers</div>
                            <div className="text-sm text-muted-foreground">Select output device</div>
                          </div>
                          <select className="p-2 border rounded-lg dark:bg-gray-700">
                            <option>Default Speakers</option>
                            <option>Built-in Speakers</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Camera</div>
                            <div className="text-sm text-muted-foreground">Select video device</div>
                          </div>
                          <select className="p-2 border rounded-lg dark:bg-gray-700">
                            <option>Default Camera</option>
                            <option>Built-in Camera</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Noise Suppression</div>
                            <div className="text-sm text-muted-foreground">Reduce background noise</div>
                          </div>
                          <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {settingsTab === 'advanced' && (
                    <Card>
                      <CardHeader><CardTitle>Advanced Settings</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Developer Mode</div>
                            <div className="text-sm text-muted-foreground">Enable developer features</div>
                          </div>
                          <input type="checkbox" className="toggle" />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Message Preview</div>
                            <div className="text-sm text-muted-foreground">Show link previews</div>
                          </div>
                          <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Auto-download Media</div>
                            <div className="text-sm text-muted-foreground">Automatically download images and files</div>
                          </div>
                          <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Keyboard Shortcuts</div>
                            <div className="text-sm text-muted-foreground">Enable keyboard navigation</div>
                          </div>
                          <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                        <div className="flex gap-3 mt-4">
                          <Button variant="outline">Export Data</Button>
                          <Button variant="destructive">Clear Cache</Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics View */}
        {activeView === 'analytics' && (
          <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Analytics Header */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Messaging Analytics</h1>
                  <p className="text-muted-foreground">Track engagement and activity</p>
                </div>
              </div>

              {/* Analytics Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{messages.length}</div>
                      <div className="text-xs text-muted-foreground">Total Messages</div>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">156</div>
                      <div className="text-xs text-muted-foreground">Active Users</div>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Hash className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{channels.length}</div>
                      <div className="text-xs text-muted-foreground">Active Channels</div>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">2.4h</div>
                      <div className="text-xs text-muted-foreground">Avg Response Time</div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Analytics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      Weekly Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, idx) => (
                        <div key={day} className="flex items-center gap-3">
                          <span className="text-sm w-24">{day}</span>
                          <Progress value={[85, 92, 78, 88, 95][idx]} className="flex-1" />
                          <span className="text-sm font-medium w-12">{[425, 512, 389, 456, 589][idx]}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Hash className="w-5 h-5 text-purple-500" />
                      Top Channels
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {channels.slice(0, 5).map((channel, idx) => (
                        <div key={channel.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-400">#{idx + 1}</span>
                            <Hash className="w-4 h-4 text-gray-500" />
                            <span>{channel.name}</span>
                          </div>
                          <Badge variant="secondary">{channel.memberCount} members</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      Message Types
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { type: 'Text Messages', count: 2450, percent: 68 },
                        { type: 'Files Shared', count: 456, percent: 13 },
                        { type: 'Reactions', count: 389, percent: 11 },
                        { type: 'Thread Replies', count: 289, percent: 8 }
                      ].map(item => (
                        <div key={item.type} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{item.type}</span>
                            <span className="font-medium">{item.count}</span>
                          </div>
                          <Progress value={item.percent} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-500" />
                      Most Active Members
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { name: 'Sarah Johnson', messages: 245, avatar: 'S' },
                        { name: 'Mike Chen', messages: 198, avatar: 'M' },
                        { name: 'Alex Rivera', messages: 156, avatar: 'A' },
                        { name: 'Emily Davis', messages: 134, avatar: 'E' },
                        { name: 'Chris Wilson', messages: 112, avatar: 'C' }
                      ].map((member, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                              {member.avatar}
                            </div>
                            <span>{member.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{member.messages} msgs</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Response Trends & Activity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-500" />
                      Response Time Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { period: 'This Week', time: '2.4h', trend: '-15%', improving: true },
                        { period: 'Last Week', time: '2.8h', trend: '-8%', improving: true },
                        { period: '2 Weeks Ago', time: '3.0h', trend: '+5%', improving: false },
                        { period: '3 Weeks Ago', time: '2.9h', trend: '-12%', improving: true }
                      ].map(item => (
                        <div key={item.period} className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="text-sm">{item.period}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{item.time}</span>
                            <Badge className={item.improving ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                              {item.trend}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-indigo-500" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { action: 'New channel created', channel: '#marketing-2025', time: '5 min ago' },
                        { action: 'File shared', channel: '#general', time: '12 min ago' },
                        { action: 'New member joined', channel: '#engineering', time: '25 min ago' },
                        { action: 'Thread started', channel: '#support', time: '1 hour ago' },
                        { action: 'Reaction added', channel: '#random', time: '2 hours ago' }
                      ].map((activity, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <MessageCircle className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.action}</p>
                            <p className="text-xs text-muted-foreground">{activity.channel}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">{activity.time}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Platform Usage */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-cyan-500" />
                    Platform Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { platform: 'Desktop App', percent: 45, users: 234 },
                      { platform: 'Web Browser', percent: 35, users: 182 },
                      { platform: 'Mobile iOS', percent: 12, users: 62 },
                      { platform: 'Mobile Android', percent: 8, users: 41 }
                    ].map(item => (
                      <div key={item.platform} className="p-4 border rounded-lg text-center">
                        <div className="text-2xl font-bold">{item.percent}%</div>
                        <div className="text-sm font-medium mt-1">{item.platform}</div>
                        <div className="text-xs text-muted-foreground">{item.users} users</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Channel Header */}
        {activeView !== 'settings' && activeView !== 'analytics' && selectedChannel && (
          <div className="h-14 px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {selectedChannel.type === 'private' ? (
                  <Lock className="w-5 h-5 text-gray-500" />
                ) : (
                  <Hash className="w-5 h-5 text-gray-500" />
                )}
                <h2 className="font-semibold text-lg">{selectedChannel.name}</h2>
              </div>
              {selectedChannel.topic && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <p className="text-sm text-gray-500 truncate max-w-md">{selectedChannel.topic}</p>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Voice/Video Call Buttons */}
              <button
                onClick={handleStartAudioCall}
                disabled={isStartingCall || !!activeCall}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 group relative"
                title="Start voice call"
              >
                <Phone className="w-5 h-5 text-gray-500 group-hover:text-green-500" />
              </button>
              <button
                onClick={handleStartVideoCall}
                disabled={isStartingCall || !!activeCall}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 group relative"
                title="Start video call"
              >
                <Video className="w-5 h-5 text-gray-500 group-hover:text-blue-500" />
              </button>

              {/* Active Call Indicator */}
              {activeCall && (
                <button
                  onClick={() => setShowCallUI(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium animate-pulse"
                >
                  <Phone className="w-4 h-4" />
                  <span>In Call</span>
                  <span className="text-xs opacity-75">({participants.length})</span>
                </button>
              )}

              <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1" />

              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Users className="w-5 h-5 text-gray-500" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Pin className="w-5 h-5 text-gray-500" />
              </button>
              <button
                onClick={() => setShowChannelSettings(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <Settings className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        )}

        {/* Active Call Overlay */}
        {showCallUI && activeCall && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
            <div className="bg-gray-900 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Call Header */}
              <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {activeCall.callType === 'video' ? (
                      <Video className="w-5 h-5 text-blue-400" />
                    ) : (
                      <Phone className="w-5 h-5 text-green-400" />
                    )}
                    <h2 className="text-white font-semibold">{activeCall.title || `Call in #${selectedChannel?.name}`}</h2>
                  </div>
                  <Badge variant="secondary" className="bg-gray-800">
                    {participants.length} participant{participants.length !== 1 ? 's' : ''}
                  </Badge>
                  {voiceVideo.isRecording && (
                    <Badge variant="destructive" className="animate-pulse">
                      <Circle className="w-2 h-2 mr-1 fill-current" /> Recording
                    </Badge>
                  )}
                </div>
                <button
                  onClick={() => setShowCallUI(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Participants Grid */}
              <div className="flex-1 p-6 overflow-auto">
                <div className={`grid gap-4 ${
                  participants.length === 1 ? 'grid-cols-1' :
                  participants.length <= 4 ? 'grid-cols-2' :
                  participants.length <= 9 ? 'grid-cols-3' : 'grid-cols-4'
                }`}>
                  {participants.map((participant) => (
                    <div
                      key={participant.odId}
                      className={`relative bg-gray-800 rounded-xl overflow-hidden aspect-video flex items-center justify-center ${
                        participant.isSpeaking ? 'ring-2 ring-green-500' : ''
                      }`}
                    >
                      {participant.videoEnabled ? (
                        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
                          <span className="text-white/50 text-sm">Video Feed</span>
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                          {participant.userName.charAt(0)}
                        </div>
                      )}

                      {/* Participant overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                        <div className="flex items-center justify-between">
                          <span className="text-white text-sm font-medium flex items-center gap-2">
                            {participant.userName}
                            {participant.role === 'host' && (
                              <Badge variant="secondary" className="text-xs">Host</Badge>
                            )}
                          </span>
                          <div className="flex items-center gap-1">
                            {!participant.audioEnabled && (
                              <MicOff className="w-4 h-4 text-red-400" />
                            )}
                            {participant.handRaised && (
                              <Hand className="w-4 h-4 text-yellow-400" />
                            )}
                            {participant.isScreenSharing && (
                              <Monitor className="w-4 h-4 text-blue-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call Controls */}
              <div className="px-6 py-4 border-t border-gray-800 bg-gray-900/95">
                <div className="flex items-center justify-center gap-4">
                  {/* Audio Toggle */}
                  <button
                    onClick={handleToggleAudio}
                    className={`p-4 rounded-full transition-colors ${
                      voiceVideo.isAudioEnabled
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    {voiceVideo.isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                  </button>

                  {/* Video Toggle */}
                  <button
                    onClick={handleToggleVideo}
                    className={`p-4 rounded-full transition-colors ${
                      voiceVideo.isVideoEnabled
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    {voiceVideo.isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                  </button>

                  {/* Screen Share */}
                  <button
                    onClick={handleToggleScreenShare}
                    className={`p-4 rounded-full transition-colors ${
                      voiceVideo.isScreenSharing
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                  >
                    {voiceVideo.isScreenSharing ? <ScreenShareOff className="w-6 h-6" /> : <ScreenShare className="w-6 h-6" />}
                  </button>

                  {/* Hand Raise */}
                  <button
                    onClick={handleToggleHandRaise}
                    className={`p-4 rounded-full transition-colors ${
                      voiceVideo.isHandRaised
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                  >
                    <Hand className="w-6 h-6" />
                  </button>

                  {/* Recording */}
                  <button
                    onClick={handleToggleRecording}
                    className={`p-4 rounded-full transition-colors ${
                      voiceVideo.isRecording
                        ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                  >
                    {voiceVideo.isRecording ? <Square className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                  </button>

                  <div className="w-px h-10 bg-gray-700 mx-2" />

                  {/* Leave Call */}
                  <button
                    onClick={handleLeaveCall}
                    className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium flex items-center gap-2"
                  >
                    <PhoneOff className="w-5 h-5" />
                    Leave
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 flex overflow-hidden">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 max-w-4xl mx-auto">
              {currentChannelMessages.map((message, index) => {
                const showAvatar = index === 0 ||
                  currentChannelMessages[index - 1].author.id !== message.author.id ||
                  new Date(message.timestamp).getTime() - new Date(currentChannelMessages[index - 1].timestamp).getTime() > 300000

                return (
                  <div
                    key={message.id}
                    className={`group relative ${showAvatar ? 'mt-4' : 'mt-1'}`}
                  >
                    <div className="flex gap-3">
                      {showAvatar ? (
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {message.author.name.charAt(0)}
                        </div>
                      ) : (
                        <div className="w-10 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        {showAvatar && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold hover:underline cursor-pointer">{message.author.name}</span>
                            <span className="text-xs text-gray-500">{formatTimestamp(message.timestamp)}</span>
                            {message.isEdited && <span className="text-xs text-gray-400">(edited)</span>}
                          </div>
                        )}
                        {editingMessage === message.id ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSaveEditedMessage(message.id)}
                              className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveEditedMessage(message.id)}
                              disabled={isSavingEdit}
                              className="px-3 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white rounded-lg text-sm flex items-center gap-1"
                            >
                              {isSavingEdit ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                              Save
                            </button>
                            <button
                              onClick={() => setEditingMessage(null)}
                              className="px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{message.content}</p>
                          </div>
                        )}

                        {/* Attachments */}
                        {message.attachments.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {message.attachments.map(att => (
                              <div key={att.id}>
                                {att.type === 'image' && (
                                  <div className="relative max-w-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                                      <Image className="w-12 h-12 text-gray-400"  loading="lazy"/>
                                    </div>
                                  </div>
                                )}
                                {att.type === 'file' && (
                                  <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg max-w-sm">
                                    <FileText className="w-10 h-10 text-red-500" />
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm truncate">{att.name}</p>
                                      <p className="text-xs text-gray-500">{formatFileSize(att.size)}</p>
                                    </div>
                                    <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                                      <Download className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                                {att.type === 'link' && att.preview && (
                                  <div className="flex gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg max-w-sm border-l-4 border-indigo-500">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm">{att.preview.title}</p>
                                      <p className="text-xs text-gray-500 mt-1">{att.preview.description}</p>
                                      <a href={att.url} className="text-xs text-indigo-500 hover:underline mt-1 flex items-center gap-1">
                                        {att.url} <ExternalLink className="w-3 h-3" />
                                      </a>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reactions */}
                        {message.reactions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {message.reactions.map((reaction, i) => (
                              <button
                                key={i}
                                onClick={() => handleReaction(message.id, reaction.emoji)}
                                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-sm border ${
                                  reaction.reacted
                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700'
                                    : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                              >
                                <span>{reaction.emoji}</span>
                                <span className="text-xs font-medium">{reaction.count}</span>
                              </button>
                            ))}
                            <button
                              onClick={() => setShowEmojiPicker(message.id)}
                              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              <Smile className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        )}

                        {/* Thread indicator */}
                        {message.replyCount > 0 && (
                          <button
                            onClick={() => { setSelectedThread(message); setShowThread(true) }}
                            className="flex items-center gap-2 mt-2 text-sm text-indigo-600 hover:underline"
                          >
                            <MessageSquare className="w-4 h-4" />
                            {message.replyCount} {message.replyCount === 1 ? 'reply' : 'replies'}
                          </button>
                        )}
                      </div>

                      {/* Message Actions */}
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-4 right-0 flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm px-1 py-0.5">
                        <button
                          onClick={() => setShowEmojiPicker(message.id)}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          title="Add reaction"
                        >
                          <Smile className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => { setSelectedThread(message); setShowThread(true) }}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          title="Reply in thread"
                        >
                          <MessageSquare className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleBookmarkMessage(message)}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          title={message.isBookmarked ? "Remove bookmark" : "Bookmark"}
                        >
                          <Bookmark className={`w-4 h-4 ${message.isBookmarked ? 'text-yellow-500 fill-yellow-500' : 'text-gray-500'}`} />
                        </button>
                        <button
                          onClick={() => handlePinMessage(message)}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          title={message.isPinned ? "Unpin message" : "Pin message"}
                        >
                          <Pin className={`w-4 h-4 ${message.isPinned ? 'text-indigo-500' : 'text-gray-500'}`} />
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          title="Delete message"
                        >
                          <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500" />
                        </button>
                        <button
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          title="More"
                        >
                          <MoreHorizontal className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>

                      {/* Quick Emoji Picker */}
                      {showEmojiPicker === message.id && (
                        <div className="absolute top-8 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 z-10">
                          <div className="flex gap-1">
                            {quickReactions.map(emoji => (
                              <button
                                key={emoji}
                                onClick={() => handleReaction(message.id, emoji)}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-lg"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Typing Indicator */}
              {typingUsers.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span>{typingUsers.map(u => u.name.split(' ')[0]).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
                </div>
              )}

              <div ref={messageEndRef} />
            </div>
          </ScrollArea>

          {/* Thread Panel */}
          {showThread && selectedThread && (
            <div className="w-96 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
              <div className="h-14 px-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-semibold">Thread</h3>
                <button
                  onClick={() => setShowThread(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {/* Parent message */}
                  <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold">
                        {selectedThread.author.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{selectedThread.author.name}</span>
                          <span className="text-xs text-gray-500">{formatTimestamp(selectedThread.timestamp)}</span>
                        </div>
                        <p className="text-gray-900 dark:text-gray-100">{selectedThread.content}</p>
                      </div>
                    </div>
                  </div>

                  {/* Thread replies */}
                  <div className="text-xs text-gray-500 mb-4">{selectedThread.replyCount} replies</div>
                  {threadMessages.map(msg => (
                    <div key={msg.id} className="flex gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white text-sm font-semibold">
                        {msg.author.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{msg.author.name}</span>
                          <span className="text-xs text-gray-500">{formatTimestamp(msg.timestamp)}</span>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-gray-100">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <input
                  type="text"
                  placeholder="Reply in thread..."
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        {selectedChannel && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-end gap-2 bg-gray-100 dark:bg-gray-900 rounded-xl p-2">
                <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg">
                  <Plus className="w-5 h-5 text-gray-500" />
                </button>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder={`Message #${selectedChannel.name}`}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    className="w-full px-2 py-2 bg-transparent text-sm focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg">
                    <Bold className="w-4 h-4 text-gray-500" />
                  </button>
                  <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg">
                    <Italic className="w-4 h-4 text-gray-500" />
                  </button>
                  <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg">
                    <Link className="w-4 h-4 text-gray-500" />
                  </button>
                  <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg">
                    <Code className="w-4 h-4 text-gray-500" />
                  </button>
                  <span className="w-px h-5 bg-gray-300 dark:bg-gray-700 mx-1" />
                  <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg">
                    <AtSign className="w-4 h-4 text-gray-500" />
                  </button>
                  <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg">
                    <Smile className="w-4 h-4 text-gray-500" />
                  </button>
                  <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg">
                    <Paperclip className="w-4 h-4 text-gray-500" />
                  </button>
                  <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg">
                    <Mic className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Channel Settings Dialog */}
      <Dialog open={showChannelSettings} onOpenChange={setShowChannelSettings}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Hash className="w-5 h-5" />
              {selectedChannel?.name} Settings
            </DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="about">
            <TabsList className="mb-4">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="about" className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Channel name</label>
                <input
                  type="text"
                  value={selectedChannel?.name || ''}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  readOnly
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Topic</label>
                <input
                  type="text"
                  value={selectedChannel?.topic || ''}
                  placeholder="Add a topic"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  value={selectedChannel?.description || ''}
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
            </TabsContent>
            <TabsContent value="members">
              <div className="space-y-2">
                {users.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold">
                          {user.name.charAt(0)}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${getStatusColor(user.status)}`} />
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">@{user.displayName}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                      user.role === 'member' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' :
                      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="settings" className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div>
                  <p className="font-medium">Mute channel</p>
                  <p className="text-sm text-gray-500">Mute notifications from this channel</p>
                </div>
                <button
                  onClick={handleToggleChannelMute}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    selectedChannel?.isMuted ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                    selectedChannel?.isMuted ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div>
                  <p className="font-medium">Pin channel</p>
                  <p className="text-sm text-gray-500">Keep this channel at the top</p>
                </div>
                <button
                  onClick={handleToggleChannelPin}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    selectedChannel?.isPinned ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                    selectedChannel?.isPinned ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              <button
                onClick={handleLeaveChannel}
                className="w-full p-4 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Leave channel
              </button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Enhanced Competitive Upgrade Components */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 px-4">
        <div className="lg:col-span-2">
          <AIInsightsPanel
            insights={messagingAIInsights}
            title="Messaging Intelligence"
            onInsightAction={(insight) => toast.info(insight.title || 'AI Insight')}
          />
        </div>
        <div className="space-y-6">
          <CollaborationIndicator
            collaborators={messagingCollaborators}
            maxVisible={4}
          />
          <PredictiveAnalytics
            predictions={messagingPredictions}
            title="Communication Forecasts"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 px-4">
        <ActivityFeed
          activities={messagingActivities}
          title="Team Activity"
          maxItems={5}
        />
        <QuickActionsToolbar
          actions={messagingQuickActions}
          variant="grid"
        />
      </div>

      {/* New Channel Dialog */}
      <Dialog open={showNewChannel} onOpenChange={(open) => {
        setShowNewChannel(open)
        if (!open) {
          setNewChannelName('')
          setNewChannelDescription('')
          setNewChannelType('public')
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a channel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium">Channel type</label>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
                <button
                  type="button"
                  onClick={() => setNewChannelType('public')}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    newChannelType === 'public'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Hash className={`w-6 h-6 mb-2 ${newChannelType === 'public' ? 'text-indigo-600' : 'text-gray-600'}`} />
                  <p className="font-medium">Public</p>
                  <p className="text-sm text-gray-500">Anyone can join</p>
                </button>
                <button
                  type="button"
                  onClick={() => setNewChannelType('private')}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    newChannelType === 'private'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Lock className={`w-6 h-6 mb-2 ${newChannelType === 'private' ? 'text-indigo-600' : 'text-gray-600'}`} />
                  <p className="font-medium">Private</p>
                  <p className="text-sm text-gray-500">Invite only</p>
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Name</label>
              <div className="mt-1 flex items-center">
                <span className="px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg text-gray-500">
                  #
                </span>
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value.toLowerCase().replace(/[\s.]/g, '-'))}
                  placeholder="e.g. marketing"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-r-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Names can't have spaces or periods</p>
            </div>
            <div>
              <label className="text-sm font-medium">Description (optional)</label>
              <input
                type="text"
                value={newChannelDescription}
                onChange={(e) => setNewChannelDescription(e.target.value)}
                placeholder="What's this channel about?"
                className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowNewChannel(false)}
                disabled={isCreatingChannel}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateChannel}
                disabled={isCreatingChannel || !newChannelName.trim()}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isCreatingChannel ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Channel'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
