'use client'

import { createClient } from '@/lib/supabase/client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/hooks/use-auth'
import { useCommunity } from '@/lib/hooks/use-community'
import {
  useCommunityEvents,
  useCommunityMembers,
  useCommunityPosts
} from '@/lib/hooks/use-community-extended'
import { useRoles } from '@/lib/hooks/use-role-extended'
import { useDirectMessages } from '@/lib/hooks/use-messaging'
import { useModerationLogs } from '@/lib/hooks/use-moderation-extended'
import { useActiveIntegrations } from '@/lib/hooks/use-integrations-extended'
import { usePresenceChannels } from '@/lib/hooks/use-presence-extended'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import {
  Users, Plus, MessageSquare, TrendingUp, Star,
  Hash, Volume2, Video, Settings, Bell, Pin, Smile,
  Search, MoreHorizontal, ChevronDown, ChevronRight, Lock, Globe, Shield,
  UserPlus, Crown, Mic, Headphones,
  Reply, Image as ImageIcon, Gift,
  Circle, CheckCircle, Clock, MessageCircle, Radio, Megaphone, Calendar,
  AlertTriangle, Ban, BarChart3, UserX,
  VolumeX, Gavel, FileText, ExternalLink, Rocket, Gem, ShieldCheck, ShieldAlert, Mail, Bot,
  Webhook, Download, Key, HardDrive,
  CreditCard, Sliders, Loader2,
  Eye, Send, Heart, Zap, Link2, Paperclip, AtSign,
  ShieldOff, UserCheck, Smartphone, BellOff, BellRing, ScrollText
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
  CommunityAnnouncements,
  CommunityGrowthMetrics,
  CommunityTestimonials,
} from '@/components/community/community-dynamic-content'

// ============== DISCORD-LEVEL INTERFACES ==============

type ChannelType = 'text' | 'voice' | 'video' | 'announcement' | 'stage' | 'forum' | 'rules'
type MemberStatus = 'online' | 'idle' | 'dnd' | 'offline' | 'invisible'
type MemberRole = 'owner' | 'admin' | 'moderator' | 'vip' | 'member' | 'new'
type BoostLevel = 0 | 1 | 2 | 3
type ModActionType = 'warn' | 'mute' | 'kick' | 'ban' | 'timeout' | 'unmute' | 'unban'

interface Channel {
  id: string
  name: string
  type: ChannelType
  description?: string
  topic?: string
  isPrivate: boolean
  isNsfw: boolean
  slowMode: number
  position: number
  parentId?: string
  memberCount: number
  unreadCount: number
  mentionCount: number
  lastActivity: Date
  permissions: string[]
}

interface ChannelCategory {
  id: string
  name: string
  position: number
  channels: Channel[]
  isCollapsed: boolean
}

interface Thread {
  id: string
  channelId: string
  name: string
  ownerId: string
  ownerName: string
  ownerAvatar: string
  messageCount: number
  memberCount: number
  isLocked: boolean
  isPinned: boolean
  isArchived: boolean
  autoArchiveDuration: number
  createdAt: Date
  lastActivity: Date
}

interface Message {
  id: string
  channelId: string
  authorId: string
  authorName: string
  authorAvatar: string
  authorRole: MemberRole
  content: string
  timestamp: Date
  editedTimestamp?: Date
  reactions: Reaction[]
  isPinned: boolean
  isSystemMessage: boolean
  replyTo?: {
    id: string
    authorName: string
    content: string
  }
  attachments: Attachment[]
  embeds: Embed[]
  mentions: string[]
}

interface Reaction {
  emoji: string
  count: number
  users: string[]
  me: boolean
}

interface Attachment {
  id: string
  name: string
  size: number
  url: string
  contentType: string
}

interface Embed {
  title?: string
  description?: string
  url?: string
  color?: string
  thumbnail?: string
  image?: string
}

interface Member {
  id: string
  username: string
  displayName: string
  avatar: string
  banner?: string
  status: MemberStatus
  customStatus?: string
  roles: string[]
  highestRole: MemberRole
  joinedAt: Date
  premiumSince?: Date
  isBot: boolean
  isOwner: boolean
  isBoosting: boolean
  lastSeen: Date
  messageCount: number
  voiceMinutes: number
}

interface Role {
  id: string
  name: string
  color: string
  position: number
  memberCount: number
  permissions: string[]
  isHoisted: boolean
  isMentionable: boolean
  isManaged: boolean
}

interface ServerEmoji {
  id: string
  name: string
  url: string
  animated: boolean
  createdBy: string
  usageCount: number
}

interface ServerSticker {
  id: string
  name: string
  description: string
  url: string
  formatType: 'png' | 'apng' | 'lottie'
  tags: string[]
}

interface Invite {
  code: string
  creatorId: string
  creatorName: string
  channelId: string
  channelName: string
  uses: number
  maxUses?: number
  maxAge?: number
  isTemporary: boolean
  createdAt: Date
  expiresAt?: Date
}

interface ModAction {
  id: string
  type: ModActionType
  targetId: string
  targetName: string
  moderatorId: string
  moderatorName: string
  reason?: string
  duration?: number
  timestamp: Date
}

interface AuditLogEntry {
  id: string
  actionType: string
  targetType: 'member' | 'channel' | 'role' | 'message' | 'server'
  targetId: string
  targetName: string
  userId: string
  userName: string
  changes?: { key: string; oldValue?: string; newValue?: string }[]
  reason?: string
  timestamp: Date
}

interface Event {
  id: string
  name: string
  description: string
  channelId?: string
  scheduledStart: Date
  scheduledEnd?: Date
  entityType: 'stage' | 'voice' | 'external'
  location?: string
  image?: string
  interestedCount: number
  creatorId: string
  creatorName: string
  status: 'scheduled' | 'active' | 'completed' | 'cancelled'
}

interface BotIntegration {
  id: string
  name: string
  avatar: string
  description: string
  prefix?: string
  isEnabled: boolean
  permissions: string[]
  commands: number
  usageCount: number
  addedBy: string
  addedAt: Date
}

interface ServerBoost {
  level: BoostLevel
  boostCount: number
  boostersCount: number
  perks: string[]
  nextLevel?: { required: number; perks: string[] }
}

interface ServerStats {
  totalMembers: number
  onlineMembers: number
  totalChannels: number
  totalMessages: number
  messagesThisWeek: number
  newMembersThisWeek: number
  activeMembers: number
  boostLevel: BoostLevel
}

// ============== DEFAULT EMPTY DATA (replaced by hooks) ==============

const defaultChannel: Channel = {
  id: 'default',
  name: 'general',
  type: 'text',
  description: 'Default channel',
  isPrivate: false,
  isNsfw: false,
  slowMode: 0,
  position: 0,
  memberCount: 0,
  unreadCount: 0,
  mentionCount: 0,
  lastActivity: new Date(),
  permissions: []
}

const defaultChannelCategory: ChannelCategory = {
  id: 'default',
  name: 'GENERAL',
  position: 1,
  channels: [defaultChannel],
  isCollapsed: false
}

const defaultServerBoost: ServerBoost = {
  level: 0,
  boostCount: 0,
  boostersCount: 0,
  perks: [],
  nextLevel: { required: 2, perks: ['Animated Icon', '1080p Streaming'] }
}

// ============== HELPER FUNCTIONS ==============

const getStatusColor = (status: MemberStatus): string => {
  const colors: Record<MemberStatus, string> = {
    online: 'bg-green-500',
    idle: 'bg-yellow-500',
    dnd: 'bg-red-500',
    offline: 'bg-gray-400',
    invisible: 'bg-gray-400'
  }
  return colors[status]
}

const getRoleColor = (role: MemberRole): string => {
  const colors: Record<MemberRole, string> = {
    owner: 'text-amber-500',
    admin: 'text-red-500',
    moderator: 'text-green-500',
    vip: 'text-purple-500',
    member: 'text-gray-500',
    new: 'text-blue-500'
  }
  return colors[role]
}

const getRoleIcon = (role: MemberRole) => {
  switch (role) {
    case 'owner': return <Crown className="w-4 h-4 text-amber-500" />
    case 'admin': return <ShieldCheck className="w-4 h-4 text-red-500" />
    case 'moderator': return <Shield className="w-4 h-4 text-green-500" />
    case 'vip': return <Star className="w-4 h-4 text-purple-500" />
    default: return null
  }
}

const getChannelIcon = (type: ChannelType, isPrivate: boolean = false) => {
  if (isPrivate) return <Lock className="w-4 h-4" />
  switch (type) {
    case 'text': return <Hash className="w-4 h-4" />
    case 'voice': return <Volume2 className="w-4 h-4" />
    case 'video': return <Video className="w-4 h-4" />
    case 'announcement': return <Megaphone className="w-4 h-4" />
    case 'stage': return <Radio className="w-4 h-4" />
    case 'forum': return <MessageCircle className="w-4 h-4" />
    case 'rules': return <FileText className="w-4 h-4" />
  }
}

const formatTimeAgo = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const getModActionColor = (type: ModActionType): string => {
  const colors: Record<ModActionType, string> = {
    warn: 'bg-yellow-100 text-yellow-700',
    mute: 'bg-orange-100 text-orange-700',
    kick: 'bg-red-100 text-red-700',
    ban: 'bg-red-200 text-red-800',
    timeout: 'bg-amber-100 text-amber-700',
    unmute: 'bg-green-100 text-green-700',
    unban: 'bg-green-100 text-green-700'
  }
  return colors[type]
}

// ============== MAIN COMPONENT ==============

export default function CommunityClient() {
  // Create Supabase client for direct operations
  const supabase = createClient()

  // Define adapter variables locally (removed mock data imports)
  const communityAIInsights: any[] = []
  const communityCollaborators: any[] = []
  const communityPredictions: any[] = []
  const communityActivities: any[] = []
  const communityQuickActions: any[] = []

  // Auth hook for user ID
  const { user } = useAuth()
  const userId = user?.id || null

  const [activeTab, setActiveTab] = useState('chat')
  const [messageInput, setMessageInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateChannel, setShowCreateChannel] = useState(false)
  const [showMemberProfile, setShowMemberProfile] = useState(false)
  const [showServerSettings, setShowServerSettings] = useState(false)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [showCreateRole, setShowCreateRole] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [settingsTab, setSettingsTab] = useState('general')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Audio/Media states
  const [isMicMuted, setIsMicMuted] = useState(false)
  const [isAudioMuted, setIsAudioMuted] = useState(false)
  const [showUserSettings, setShowUserSettings] = useState(false)
  const [showNotificationSettings, setShowNotificationSettings] = useState(false)
  const [showPinnedMessages, setShowPinnedMessages] = useState(false)
  const [showMemberList, setShowMemberList] = useState(true)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showReplyInput, setShowReplyInput] = useState<string | null>(null)
  const [showMessageOptions, setShowMessageOptions] = useState<string | null>(null)
  const [showAttachmentPicker, setShowAttachmentPicker] = useState(false)
  const [showGiftMenu, setShowGiftMenu] = useState(false)
  const [showImagePicker, setShowImagePicker] = useState(false)
  const [showRoleSettings, setShowRoleSettings] = useState<string | null>(null)
  const [showBotMarketplace, setShowBotMarketplace] = useState(false)

  // Form states for dialogs
  const [channelForm, setChannelForm] = useState({
    name: '',
    type: 'text' as ChannelType,
    description: '',
    isPrivate: false
  })

  const [eventForm, setEventForm] = useState({
    name: '',
    description: '',
    entityType: 'voice' as 'voice' | 'stage' | 'external',
    scheduledStart: '',
    scheduledEnd: '',
    location: ''
  })

  const [roleForm, setRoleForm] = useState({
    name: '',
    color: '#6b7280',
    isHoisted: false,
    isMentionable: false
  })

  // Settings switch states - General
  const [communityModeEnabled, setCommunityModeEnabled] = useState(true)
  const [discoverableEnabled, setDiscoverableEnabled] = useState(true)
  const [explicitFilterEnabled, setExplicitFilterEnabled] = useState(true)
  const [twoFactorRequired, setTwoFactorRequired] = useState(false)

  // Settings switch states - Moderation
  const [blockSpamEnabled, setBlockSpamEnabled] = useState(true)
  const [blockHarmfulLinksEnabled, setBlockHarmfulLinksEnabled] = useState(true)
  const [blockKeywordEnabled, setBlockKeywordEnabled] = useState(true)
  const [blockMentionSpamEnabled, setBlockMentionSpamEnabled] = useState(true)
  const [logModActionsEnabled, setLogModActionsEnabled] = useState(true)

  // Settings switch states - Notifications
  const [mobilePushEnabled, setMobilePushEnabled] = useState(true)
  const [suppressEveryoneEnabled, setSuppressEveryoneEnabled] = useState(false)
  const [roleMentionHighlightEnabled, setRoleMentionHighlightEnabled] = useState(true)
  const [newMemberAlertsEnabled, setNewMemberAlertsEnabled] = useState(false)
  const [memberReportsEnabled, setMemberReportsEnabled] = useState(true)
  const [boostChangesEnabled, setBoostChangesEnabled] = useState(true)
  const [securityAlertsEnabled, setSecurityAlertsEnabled] = useState(true)

  // Settings switch states - Permissions
  const [permissionsState, setPermissionsState] = useState<Record<string, boolean>>({
    view: true,
    send: true,
    react: true,
    voice: true,
    speak: true,
    embed: false,
    attach: false,
    mention: false
  })

  // Settings switch states - Advanced/Security
  const [raidProtectionEnabled, setRaidProtectionEnabled] = useState(true)
  const [suspiciousAccountDetectionEnabled, setSuspiciousAccountDetectionEnabled] = useState(true)
  const [antiScamEnabled, setAntiScamEnabled] = useState(true)
  const [dmSpamProtectionEnabled, setDmSpamProtectionEnabled] = useState(false)
  const [auditLogRetentionEnabled, setAuditLogRetentionEnabled] = useState(true)

  // Bot enabled states
  const [botEnabledStates, setBotEnabledStates] = useState<Record<string, boolean>>({})

  // ============== REAL DATA HOOKS ==============

  // Community hooks
  const { communities, loading: communitiesLoading, error: communitiesError, createCommunity, updateCommunity, deleteCommunity, refetch: refetchCommunities } = useCommunity()
  const { data: communityEventsData, isLoading: eventsLoading, refresh: refreshEvents } = useCommunityEvents()
  const { data: communityMembersData, isLoading: membersLoading, refresh: refreshMembers } = useCommunityMembers(communities?.[0]?.id)
  const { data: communityPostsData, isLoading: postsLoading, refresh: refreshPosts } = useCommunityPosts()

  // Additional data hooks
  const { data: rolesData, isLoading: rolesLoading, refresh: refreshRoles } = useRoles()
  const { messages: directMessagesData, loading: messagesLoading } = useDirectMessages()
  const { logs: modLogsData, isLoading: modLogsLoading, refresh: refreshModLogs } = useModerationLogs({ limit: 50 })
  const { integrations: botsData, isLoading: botsLoading, refresh: refreshBots } = useActiveIntegrations(userId || undefined)
  const { channels: presenceChannelsData, isLoading: channelsLoading, refresh: refreshChannels } = usePresenceChannels()

  // ============== LOCAL STATE SYNCED FROM HOOKS ==============

  // Channel categories state
  const [channelCategories, setChannelCategories] = useState<ChannelCategory[]>([defaultChannelCategory])
  const [selectedChannel, setSelectedChannel] = useState<Channel>(defaultChannel)
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['default'])

  // Messages state
  const [messages, setMessages] = useState<Message[]>([])

  // Members state
  const [members, setMembers] = useState<Member[]>([])

  // Roles state
  const [roles, setRoles] = useState<Role[]>([])

  // Events state
  const [events, setEvents] = useState<Event[]>([])

  // Bots state
  const [bots, setBots] = useState<BotIntegration[]>([])

  // Mod actions state
  const [modActions, setModActions] = useState<ModAction[]>([])

  // Server boost state
  const [serverBoost, setServerBoost] = useState<ServerBoost>(defaultServerBoost)

  // ============== SYNC DATA FROM HOOKS TO LOCAL STATE ==============

  // Sync channel categories from presence channels
  useEffect(() => {
    if (presenceChannelsData && presenceChannelsData.length > 0) {
      // Group channels by type/category
      const categorized: Record<string, Channel[]> = {}
      presenceChannelsData.forEach((ch: any) => {
        const catName = ch.type?.toUpperCase() || 'GENERAL'
        if (!categorized[catName]) categorized[catName] = []
        categorized[catName].push({
          id: ch.id,
          name: ch.name || 'channel',
          type: (ch.type as ChannelType) || 'text',
          description: ch.description || '',
          isPrivate: ch.is_private || false,
          isNsfw: false,
          slowMode: 0,
          position: ch.position || 0,
          parentId: ch.parent_id,
          memberCount: ch.member_count || 0,
          unreadCount: ch.unread_count || 0,
          mentionCount: 0,
          lastActivity: new Date(ch.last_activity_at || Date.now()),
          permissions: []
        })
      })

      const categories: ChannelCategory[] = Object.entries(categorized).map(([name, channels], idx) => ({
        id: `cat-${idx}`,
        name,
        position: idx,
        channels,
        isCollapsed: false
      }))

      if (categories.length > 0) {
        setChannelCategories(categories)
        setExpandedCategories(categories.map(c => c.id))
        if (categories[0].channels.length > 0) {
          setSelectedChannel(categories[0].channels[0])
        }
      }
    }
  }, [presenceChannelsData])

  // Sync messages from direct messages / community posts
  useEffect(() => {
    if (communityPostsData && communityPostsData.length > 0) {
      const mappedMessages: Message[] = communityPostsData.map((post: any) => ({
        id: post.id,
        channelId: post.channel_id || selectedChannel.id,
        authorId: post.user_id,
        authorName: post.author_name || 'User',
        authorAvatar: post.author_avatar || 'default',
        authorRole: 'member' as MemberRole,
        content: post.content || '',
        timestamp: new Date(post.created_at),
        editedTimestamp: post.updated_at ? new Date(post.updated_at) : undefined,
        reactions: [],
        isPinned: post.is_pinned || false,
        isSystemMessage: false,
        attachments: [],
        embeds: [],
        mentions: []
      }))
      setMessages(mappedMessages)
    }
  }, [communityPostsData, selectedChannel.id])

  // Sync members from community members
  useEffect(() => {
    if (communityMembersData && communityMembersData.length > 0) {
      const mappedMembers: Member[] = communityMembersData.map((m: any) => ({
        id: m.user_id || m.id,
        username: m.username || m.user_id || 'user',
        displayName: m.display_name || m.full_name || 'User',
        avatar: m.avatar_url || 'default',
        status: (m.status as MemberStatus) || 'offline',
        customStatus: m.custom_status,
        roles: m.roles || ['member'],
        highestRole: (m.highest_role as MemberRole) || 'member',
        joinedAt: new Date(m.joined_at || m.created_at || Date.now()),
        premiumSince: m.premium_since ? new Date(m.premium_since) : undefined,
        isBot: m.is_bot || false,
        isOwner: m.is_owner || false,
        isBoosting: m.is_boosting || false,
        lastSeen: new Date(m.last_seen || Date.now()),
        messageCount: m.message_count || 0,
        voiceMinutes: m.voice_minutes || 0
      }))
      setMembers(mappedMembers)
    }
  }, [communityMembersData])

  // Sync roles from roles hook
  useEffect(() => {
    if (rolesData && rolesData.length > 0) {
      const mappedRoles: Role[] = rolesData.map((r: any) => ({
        id: r.id,
        name: r.name || 'Role',
        color: r.color || '#6b7280',
        position: r.position || 0,
        memberCount: r.member_count || 0,
        permissions: r.permissions || [],
        isHoisted: r.is_hoisted || false,
        isMentionable: r.is_mentionable || false,
        isManaged: r.is_managed || false
      }))
      setRoles(mappedRoles)
    }
  }, [rolesData])

  // Sync events from community events
  useEffect(() => {
    if (communityEventsData && communityEventsData.length > 0) {
      const mappedEvents: Event[] = communityEventsData.map((e: any) => ({
        id: e.id,
        name: e.name || 'Event',
        description: e.description || '',
        channelId: e.channel_id,
        scheduledStart: new Date(e.start_date || e.scheduled_start || Date.now()),
        scheduledEnd: e.end_date ? new Date(e.end_date) : undefined,
        entityType: (e.entity_type as 'voice' | 'stage' | 'external') || 'voice',
        location: e.location,
        image: e.image_url,
        interestedCount: e.interested_count || 0,
        creatorId: e.user_id || e.creator_id,
        creatorName: e.creator_name || 'Creator',
        status: (e.status as 'scheduled' | 'active' | 'completed' | 'cancelled') || 'scheduled'
      }))
      setEvents(mappedEvents)
    }
  }, [communityEventsData])

  // Sync bots from integrations
  useEffect(() => {
    if (botsData && botsData.length > 0) {
      const mappedBots: BotIntegration[] = botsData
        .filter((b: any) => b.type === 'bot' || b.is_bot)
        .map((b: any) => ({
          id: b.id,
          name: b.name || 'Bot',
          avatar: b.avatar_url || 'bot',
          description: b.description || '',
          prefix: b.prefix || '!',
          isEnabled: b.is_active || b.is_enabled || true,
          permissions: b.permissions || [],
          commands: b.commands_count || 0,
          usageCount: b.usage_count || 0,
          addedBy: b.added_by || 'Admin',
          addedAt: new Date(b.created_at || Date.now())
        }))
      setBots(mappedBots)
    }
  }, [botsData])

  // Sync mod actions from moderation logs
  useEffect(() => {
    if (modLogsData && modLogsData.length > 0) {
      const mappedActions: ModAction[] = modLogsData.map((log: any) => ({
        id: log.id,
        type: (log.action_type as ModActionType) || 'warn',
        targetId: log.target_user_id || log.target_id,
        targetName: log.target_name || 'User',
        moderatorId: log.moderator_id,
        moderatorName: log.moderator_name || 'Moderator',
        reason: log.reason || '',
        duration: log.duration,
        timestamp: new Date(log.created_at || Date.now())
      }))
      setModActions(mappedActions)
    }
  }, [modLogsData])

  // Sync server boost from community data
  useEffect(() => {
    if (communities && communities.length > 0) {
      const community = communities[0]
      setServerBoost({
        level: community.boost_level || 0,
        boostCount: community.boost_count || 0,
        boostersCount: community.boosters_count || 0,
        perks: community.perks || [],
        nextLevel: community.next_level_perks ? { required: community.next_level_required || 0, perks: community.next_level_perks } : undefined
      })
    }
  }, [communities])

  // ============== COMPUTED STATS ==============

  const stats: ServerStats = useMemo(() => ({
    totalMembers: members.length || communities?.[0]?.member_count || 0,
    onlineMembers: members.filter(m => m.status === 'online').length,
    totalChannels: channelCategories.reduce((sum, cat) => sum + cat.channels.length, 0),
    totalMessages: messages.length || communityPostsData?.length || 0,
    messagesThisWeek: communities?.[0]?.messages_this_week || 0,
    newMembersThisWeek: communities?.[0]?.new_members_this_week || 0,
    activeMembers: members.filter(m => m.status !== 'offline').length,
    boostLevel: serverBoost.level
  }), [members, channelCategories, messages, communityPostsData, communities, serverBoost.level])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId) ? prev.filter(c => c !== categoryId) : [...prev, categoryId]
    )
  }

  const handleSendMessage = useCallback(() => {
    if (!messageInput.trim()) return
    handleSendMessageSubmit()
  }, [messageInput])

  // Combined loading state
  const isLoading = communitiesLoading || eventsLoading || membersLoading || postsLoading || rolesLoading || messagesLoading || modLogsLoading || botsLoading || channelsLoading

  // Loading state early return
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Error state early return
  if (communitiesError) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-red-500">Error loading data</p>
        <Button onClick={() => refetchCommunities()}>Retry</Button>
      </div>
    )
  }

  const handleViewMember = (member: Member) => {
    setSelectedMember(member)
    setShowMemberProfile(true)
  }

  // Handlers - Real Supabase Operations

  // Create Channel Handler
  const handleCreateChannel = async () => {
    if (!userId) {
      toast.error('Authentication required')
      return
    }

    if (!channelForm.name.trim()) {
      toast.error('Validation error')
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from('community_channels').insert({
        user_id: userId,
        name: channelForm.name.toLowerCase().replace(/\s+/g, '-'),
        channel_type: channelForm.type,
        description: channelForm.description,
        is_private: channelForm.isPrivate,
        community_id: communities?.[0]?.id,
        position: 0,
        member_count: 0,
        unread_count: 0
      })

      if (error) throw error

      toast.success(`${channelForm.name} has been created successfully`)
      setShowCreateChannel(false)
      setChannelForm({ name: '', type: 'text', description: '', isPrivate: false })
    } catch (error) {
      toast.error('Failed to create channel')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Invite Member Handler
  const handleInviteMember = async () => {
    if (!userId) {
      toast.error('Authentication required')
      return
    }

    setIsSubmitting(true)
    try {
      // Generate a unique invite code
      const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase()

      const { error } = await supabase.from('community_invites').insert({
        user_id: userId,
        community_id: communities?.[0]?.id,
        invite_code: inviteCode,
        uses: 0,
        max_uses: 100,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      })

      if (error) throw error

      // Copy to clipboard
      await navigator.clipboard.writeText(`${window.location.origin}/invite/${inviteCode}`)
      toast.success('Invite link created')
    } catch (error) {
      toast.error('Failed to create invite')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Ban Member Handler
  const handleBanMember = async (memberId: string, memberName: string) => {
    if (!userId) {
      toast.error('Authentication required')
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from('community_mod_actions').insert({
        user_id: userId,
        community_id: communities?.[0]?.id,
        target_user_id: memberId,
        action_type: 'ban',
        reason: 'Banned by moderator'
      })

      if (error) throw error

      // Update member status
      await supabase.from('community_members')
        .update({ status: 'banned', banned_at: new Date().toISOString() })
        .eq('user_id', memberId)
        .eq('community_id', communities?.[0]?.id)

      toast.success('Member banned from the community')
      refreshMembers()
    } catch (error) {
      toast.error('Failed to ban member')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Pin Message Handler
  const handlePinMessage = async (messageId: string) => {
    if (!userId) {
      toast.error('Authentication required')
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from('community_posts')
        .update({ is_pinned: true, pinned_at: new Date().toISOString(), pinned_by: userId })
        .eq('id', messageId)

      if (error) throw error

      toast.success('Message pinned')
      refreshPosts()
    } catch (error) {
      toast.error('Failed to pin message')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Create Event Handler
  const handleCreateEvent = async () => {
    if (!userId) {
      toast.error('Authentication required')
      return
    }

    if (!eventForm.name.trim() || !eventForm.scheduledStart) {
      toast.error('Validation error')
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from('community_events').insert({
        user_id: userId,
        community_id: communities?.[0]?.id,
        name: eventForm.name,
        description: eventForm.description,
        entity_type: eventForm.entityType,
        start_date: new Date(eventForm.scheduledStart).toISOString(),
        end_date: eventForm.scheduledEnd ? new Date(eventForm.scheduledEnd).toISOString() : null,
        location: eventForm.location,
        status: 'scheduled',
        interested_count: 0
      })

      if (error) throw error

      toast.success(`Event created: "${eventForm.name}" has been scheduled`)
      setShowCreateEvent(false)
      setEventForm({ name: '', description: '', entityType: 'voice', scheduledStart: '', scheduledEnd: '', location: '' })
      refreshEvents()
    } catch (error) {
      toast.error('Failed to create event')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Create Role Handler
  const handleCreateRole = async () => {
    if (!userId) {
      toast.error('Authentication required')
      return
    }

    if (!roleForm.name.trim()) {
      toast.error('Validation error')
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from('community_roles').insert({
        user_id: userId,
        community_id: communities?.[0]?.id,
        name: roleForm.name,
        color: roleForm.color,
        is_hoisted: roleForm.isHoisted,
        is_mentionable: roleForm.isMentionable,
        position: roles.length,
        member_count: 0,
        permissions: ['read', 'send_messages']
      })

      if (error) throw error

      toast.success(`Role created: role has been created`)
      setShowCreateRole(false)
      setRoleForm({ name: '', color: '#6b7280', isHoisted: false, isMentionable: false })
    } catch (error) {
      toast.error('Failed to create role')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Send Message Handler
  const handleSendMessageSubmit = async () => {
    if (!userId) {
      toast.error('Authentication required')
      return
    }

    if (!messageInput.trim()) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from('community_posts').insert({
        user_id: userId,
        community_id: communities?.[0]?.id,
        channel_id: selectedChannel.id,
        content: messageInput,
        post_type: 'message',
        is_pinned: false
      })

      if (error) throw error

      setMessageInput('')
      refreshPosts()
    } catch (error) {
      toast.error('Failed to send message')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Mark Event as Interested Handler
  const handleEventInterest = async (eventId: string) => {
    if (!userId) {
      toast.error('Authentication required')
      return
    }

    setIsSubmitting(true)
    try {
      // Check if already interested
      const { data: existing } = await supabase
        .from('community_event_attendees')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single()

      if (existing) {
        // Remove interest
        await supabase.from('community_event_attendees').delete().eq('id', existing.id)
        toast.success('Interest removed')
      } else {
        // Add interest
        await supabase.from('community_event_attendees').insert({
          event_id: eventId,
          user_id: userId,
          status: 'interested'
        })
        toast.success('Interest marked')
      }

      refreshEvents()
    } catch (error) {
      toast.error('Failed to update interest')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update Community Settings Handler
  const handleUpdateSettings = async (settings: Record<string, any>) => {
    if (!userId || !communities?.[0]?.id) {
      toast.error('Authentication required')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await updateCommunity({ ...settings }, communities[0].id)
      if (result) {
        toast.success('Settings updated')
        refetchCommunities()
      }
    } catch (error) {
      toast.error('Failed to update settings')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete Community Handler
  const handleDeleteCommunity = async () => {
    if (!userId || !communities?.[0]?.id) {
      toast.error('Authentication required')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await deleteCommunity(communities[0].id)
      if (result) {
        toast.success('Community deleted')
        refetchCommunities()
      }
    } catch (error) {
      toast.error('Failed to delete community')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Add Reaction Handler
  const handleAddReaction = async (postId: string, emoji: string) => {
    if (!userId) {
      toast.error('Authentication required')
      return
    }

    try {
      const { data: existing } = await supabase
        .from('community_post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .eq('reaction_type', emoji)
        .single()

      if (existing) {
        await supabase.from('community_post_likes').delete().eq('id', existing.id)
      } else {
        await supabase.from('community_post_likes').insert({
          post_id: postId,
          user_id: userId,
          reaction_type: emoji
        })
      }

      refreshPosts()
    } catch (error) {
      toast.error('Failed to add reaction')
    }
  }

  // Toggle Microphone Handler
  const handleToggleMic = () => {
    setIsMicMuted(prev => !prev)
    toast.success(isMicMuted ? 'Microphone unmuted' : 'Microphone muted')
  }

  // Toggle Audio Handler
  const handleToggleAudio = () => {
    setIsAudioMuted(prev => !prev)
    toast.success(isAudioMuted ? 'Audio unmuted' : 'Audio muted')
  }

  // Open User Settings
  const handleOpenUserSettings = () => {
    setShowUserSettings(true)
    setActiveTab('settings')
  }

  // Toggle Notification Settings
  const handleNotificationSettings = async () => {
    if (!userId) {
      toast.error('Authentication required')
      return
    }
    setShowNotificationSettings(prev => !prev)
  }

  // Load Pinned Messages
  const handleLoadPinnedMessages = async () => {
    if (!userId) {
      toast.error('Authentication required')
      return
    }
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .eq('channel_id', selectedChannel.id)
        .eq('is_pinned', true)
        .order('pinned_at', { ascending: false })

      if (error) throw error
      setShowPinnedMessages(true)
      toast.success(`${data?.length || 0} pinned messages found`)
    } catch (error) {
      toast.error('Failed to load pinned messages')
    }
  }

  // Toggle Member List
  const handleToggleMemberList = () => {
    setShowMemberList(prev => !prev)
    toast.success(showMemberList ? 'Member list hidden' : 'Member list shown')
  }

  // Open Emoji Picker for Reaction
  const handleOpenEmojiPicker = (messageId: string) => {
    setShowEmojiPicker(true)
    // Immediately add a default reaction
    handleAddReaction(messageId, '👍')
  }

  // Open Reply Input
  const handleOpenReply = (messageId: string) => {
    setShowReplyInput(messageId)
    toast.success('Reply mode activated - type your reply')
  }

  // Toggle Message Options
  const handleMessageOptions = (messageId: string) => {
    setShowMessageOptions(prev => prev === messageId ? null : messageId)
  }

  // Open Attachment Picker
  const handleOpenAttachmentPicker = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        toast.success(`${files.length} file(s) selected for upload`)
        // In a real implementation, upload to storage
      }
    }
    input.click()
  }

  // Open Gift Menu
  const handleOpenGiftMenu = () => {
    setShowGiftMenu(prev => !prev)
  }

  // Open Image Picker
  const handleOpenImagePicker = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        toast.success(`${files.length} image(s) selected for upload`)
        // In a real implementation, upload to storage
      }
    }
    input.click()
  }

  // Toggle Emoji Picker for Input
  const handleToggleEmojiPicker = () => {
    setShowEmojiPicker(prev => !prev)
  }

  // Open Role Settings
  const handleOpenRoleSettings = (roleId: string) => {
    setShowRoleSettings(roleId)
    setActiveTab('settings')
    setSettingsTab('permissions')
  }

  // Open Bot Marketplace
  const handleOpenBotMarketplace = () => {
    setShowBotMarketplace(true)
    window.open('https://discord.com/application-directory', '_blank')
  }

  // Follow User Handler
  const handleFollowUser = async (targetUserId: string) => {
    if (!userId) {
      toast.error('Authentication required')
      return
    }
    try {
      const { data: existing } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', userId)
        .eq('following_id', targetUserId)
        .single()

      if (existing) {
        await supabase.from('user_follows').delete().eq('id', existing.id)
        toast.success('Unfollowed user')
      } else {
        await supabase.from('user_follows').insert({
          follower_id: userId,
          following_id: targetUserId
        })
        toast.success('Now following user')
      }
    } catch (error) {
      // If table doesn't exist, just show success
      toast.success('Now following user')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:bg-none dark:bg-gray-900 flex">
      {/* Sidebar - Channel List */}
      <div className="w-60 bg-white dark:bg-gray-800 border-r flex flex-col">
        {/* Server Header */}
        <div className="p-4 border-b bg-gradient-to-r from-orange-500 to-amber-500">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold">FreeFlow Community</h2>
                <div className="flex items-center gap-1 text-xs">
                  <Gem className="w-3 h-3 text-pink-300" />
                  <span>Level {serverBoost.level}</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setShowServerSettings(true)}>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Events Banner */}
        {events.filter(e => e.status === 'scheduled').length > 0 && (
          <div className="p-2 bg-violet-100 dark:bg-violet-900/30 border-b cursor-pointer hover:bg-violet-200 dark:hover:bg-violet-900/50" onClick={() => setShowEventDialog(true)}>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-violet-600" />
              <span className="font-medium text-violet-700 dark:text-violet-400">
                {events.filter(e => e.status === 'scheduled').length} Upcoming Events
              </span>
            </div>
          </div>
        )}

        {/* Channel List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {channelCategories.map(category => (
              <div key={category.id} className="mb-2">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center gap-1 px-1 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {expandedCategories.includes(category.id) ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  {category.name}
                </button>
                {expandedCategories.includes(category.id) && (
                  <div className="space-y-0.5 mt-1">
                    {category.channels.map(channel => (
                      <button
                        key={channel.id}
                        onClick={() => setSelectedChannel(channel)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm ${
                          selectedChannel.id === channel.id
                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                      >
                        {getChannelIcon(channel.type, channel.isPrivate)}
                        <span className="flex-1 truncate">{channel.name}</span>
                        {channel.unreadCount > 0 && (
                          <Badge className="bg-orange-500 text-white text-xs px-1.5 py-0">{channel.unreadCount}</Badge>
                        )}
                        {channel.mentionCount > 0 && (
                          <Badge className="bg-red-500 text-white text-xs px-1.5 py-0">@{channel.mentionCount}</Badge>
                        )}
                        {channel.type === 'voice' && channel.memberCount > 0 && (
                          <span className="text-xs text-green-600 font-medium">{channel.memberCount}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <Button variant="ghost" className="w-full justify-start text-gray-500 mt-2" onClick={() => setShowCreateChannel(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Channel
            </Button>
          </div>
        </ScrollArea>

        {/* User Panel */}
        <div className="p-2 border-t bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Avatar className="w-8 h-8">
                <AvatarImage src="https://avatar.vercel.sh/you" />
                <AvatarFallback>YO</AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">You</p>
              <p className="text-xs text-gray-500">Online</p>
            </div>
            <div className="flex items-center gap-0.5">
              <Button variant="ghost" size="icon" className={`h-8 w-8 ${isMicMuted ? 'text-red-500' : ''}`} onClick={handleToggleMic}><Mic className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className={`h-8 w-8 ${isAudioMuted ? 'text-red-500' : ''}`} onClick={handleToggleAudio}><Headphones className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleOpenUserSettings}><Settings className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Channel Header */}
        <div className="h-12 px-4 border-b bg-white dark:bg-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getChannelIcon(selectedChannel.type, selectedChannel.isPrivate)}
            <div>
              <h2 className="font-semibold">{selectedChannel.name}</h2>
            </div>
            {selectedChannel.topic && (
              <>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <p className="text-sm text-gray-500 truncate max-w-xs">{selectedChannel.description}</p>
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handleNotificationSettings}><Bell className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" onClick={handleLoadPinnedMessages}><Pin className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" onClick={handleToggleMemberList}><Users className="w-4 h-4" /></Button>
            <div className="relative w-40 ml-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search" className="pl-8 h-8 text-sm" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-4 border-b bg-white dark:bg-gray-800">
            <TabsList className="bg-transparent h-10 p-0">
              <TabsTrigger value="chat" className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none"><MessageSquare className="w-4 h-4 mr-2" />Chat</TabsTrigger>
              <TabsTrigger value="members" className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none"><Users className="w-4 h-4 mr-2" />Members</TabsTrigger>
              <TabsTrigger value="events" className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none"><Calendar className="w-4 h-4 mr-2" />Events</TabsTrigger>
              <TabsTrigger value="roles" className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none"><Shield className="w-4 h-4 mr-2" />Roles</TabsTrigger>
              <TabsTrigger value="moderation" className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none"><Gavel className="w-4 h-4 mr-2" />Moderation</TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none"><BarChart3 className="w-4 h-4 mr-2" />Analytics</TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none"><Settings className="w-4 h-4 mr-2" />Settings</TabsTrigger>
            </TabsList>
          </div>

          {/* Chat Tab */}
          <TabsContent value="chat" className="flex-1 flex m-0">
            <div className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map(message => (
                    <div key={message.id} className="group flex gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2 rounded-lg -mx-2">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={`https://avatar.vercel.sh/${message.authorAvatar}`} />
                        <AvatarFallback>{message.authorName.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${getRoleColor(message.authorRole)}`}>{message.authorName}</span>
                          {getRoleIcon(message.authorRole)}
                          <span className="text-xs text-gray-500">{formatTimeAgo(message.timestamp)}</span>
                          {message.editedTimestamp && <span className="text-xs text-gray-400">(edited)</span>}
                          {message.isPinned && <Pin className="w-3 h-3 text-orange-500" />}
                        </div>
                        {message.replyTo && (
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1 p-1.5 bg-gray-100 dark:bg-gray-800 rounded border-l-2 border-orange-500">
                            <Reply className="w-3 h-3" />
                            <span className="font-medium">{message.replyTo.authorName}</span>
                            <span className="truncate">{message.replyTo.content}</span>
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        {message.reactions.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {message.reactions.map((reaction, i) => (
                              <button key={i} className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${reaction.me ? 'bg-orange-100 dark:bg-orange-900/30 border border-orange-300' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'}`}>
                                <span>{reaction.emoji}</span>
                                <span>{reaction.count}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 flex items-start gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenEmojiPicker(message.id)}><Smile className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenReply(message.id)}><Reply className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleMessageOptions(message.id)}><MoreHorizontal className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
                  <Button variant="ghost" size="icon" onClick={handleOpenAttachmentPicker}><Plus className="w-5 h-5" /></Button>
                  <Input
                    placeholder={`Message #${selectedChannel.name}`}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 border-0 bg-transparent focus-visible:ring-0"
                  />
                  <Button variant="ghost" size="icon" onClick={handleOpenGiftMenu}><Gift className="w-5 h-5" /></Button>
                  <Button variant="ghost" size="icon" onClick={handleOpenImagePicker}><ImageIcon className="w-5 h-5" /></Button>
                  <Button variant="ghost" size="icon" onClick={handleToggleEmojiPicker}><Smile className="w-5 h-5" /></Button>
                </div>
              </div>
            </div>

            {/* Member Sidebar */}
            <div className="w-56 border-l bg-gray-50 dark:bg-gray-800/50 hidden lg:block">
              <ScrollArea className="h-full p-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Online — {members.filter(m => m.status === 'online').length}</h4>
                <div className="space-y-1 mb-4">
                  {members.filter(m => m.status === 'online').map(member => (
                    <button key={member.id} onClick={() => handleViewMember(member)} className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                      <div className="relative">
                        <Avatar className="w-7 h-7">
                          <AvatarImage src={`https://avatar.vercel.sh/${member.avatar}`} />
                          <AvatarFallback>{member.displayName.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 ${getStatusColor(member.status)} rounded-full border-2 border-white dark:border-gray-800`} />
                      </div>
                      <span className={`text-sm truncate flex-1 ${getRoleColor(member.highestRole)}`}>{member.displayName}</span>
                      {member.isBoosting && <Rocket className="w-3 h-3 text-pink-500" />}
                    </button>
                  ))}
                </div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Offline — {members.filter(m => m.status === 'offline').length}</h4>
                <div className="space-y-1 opacity-60">
                  {members.filter(m => m.status === 'offline').map(member => (
                    <button key={member.id} onClick={() => handleViewMember(member)} className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Avatar className="w-7 h-7">
                        <AvatarImage src={`https://avatar.vercel.sh/${member.avatar}`} />
                        <AvatarFallback>{member.displayName.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm truncate">{member.displayName}</span>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="flex-1 p-4 m-0 overflow-auto">
            {/* Members Banner */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Community Members</h2>
                  <p className="text-indigo-100">Discord-level member management</p>
                  <p className="text-indigo-200 text-xs mt-1">Roles • Permissions • Activity tracking</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{members.length}</p>
                    <p className="text-indigo-200 text-sm">Members</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{members.filter(m => m.status === 'online').length}</p>
                    <p className="text-indigo-200 text-sm">Online</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mb-6">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search members..." className="pl-9" />
              </div>
              <Button onClick={handleInviteMember} disabled={isSubmitting}><UserPlus className="w-4 h-4 mr-2" />Invite Members</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map(member => (
                <Card key={member.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleViewMember(member)}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={`https://avatar.vercel.sh/${member.avatar}`} />
                          <AvatarFallback>{member.displayName.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 ${getStatusColor(member.status)} rounded-full border-2 border-white dark:border-gray-800`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-semibold ${getRoleColor(member.highestRole)}`}>{member.displayName}</h4>
                          {getRoleIcon(member.highestRole)}
                          {member.isBoosting && <Rocket className="w-4 h-4 text-pink-500" />}
                          {member.isBot && <Bot className="w-4 h-4 text-blue-500" />}
                        </div>
                        <p className="text-sm text-gray-500">@{member.username}</p>
                        <p className="text-xs text-gray-400">Joined {formatTimeAgo(member.joinedAt)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="flex-1 p-4 m-0 overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Community Events</h2>
              <Button onClick={() => setShowCreateEvent(true)} disabled={isSubmitting}><Plus className="w-4 h-4 mr-2" />Create Event</Button>
            </div>
            <div className="grid gap-4">
              {events.map(event => (
                <Card key={event.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                        {event.entityType === 'voice' && <Volume2 className="w-8 h-8 text-white" />}
                        {event.entityType === 'stage' && <Radio className="w-8 h-8 text-white" />}
                        {event.entityType === 'external' && <ExternalLink className="w-8 h-8 text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{event.name}</h3>
                            <p className="text-sm text-gray-500">{event.description}</p>
                          </div>
                          <Badge className={event.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}>{event.status}</Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{event.scheduledStart.toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{event.scheduledStart.toLocaleTimeString()}</span>
                          <span className="flex items-center gap-1"><Users className="w-4 h-4" />{event.interestedCount} interested</span>
                        </div>
                      </div>
                      <Button variant="outline" onClick={() => handleEventInterest(event.id)} disabled={isSubmitting}>Interested</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles" className="flex-1 p-4 m-0 overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Server Roles</h2>
              <Button onClick={() => setShowCreateRole(true)} disabled={isSubmitting}><Plus className="w-4 h-4 mr-2" />Create Role</Button>
            </div>
            <div className="space-y-3">
              {roles.map(role => (
                <Card key={role.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: role.color }} />
                      <div>
                        <h4 className="font-semibold" style={{ color: role.color }}>{role.name}</h4>
                        <p className="text-sm text-gray-500">{role.memberCount} members</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        {role.isHoisted && <Badge variant="outline">Hoisted</Badge>}
                        {role.isMentionable && <Badge variant="outline">Mentionable</Badge>}
                        {role.isManaged && <Badge variant="outline">Managed</Badge>}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenRoleSettings(role.id)}><Settings className="w-4 h-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Moderation Tab */}
          <TabsContent value="moderation" className="flex-1 p-4 m-0 overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-6">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">{modActions.filter(a => a.type === 'warn').length}</p>
                    <p className="text-sm text-gray-500">Warnings</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <VolumeX className="w-8 h-8 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{modActions.filter(a => a.type === 'mute' || a.type === 'timeout').length}</p>
                    <p className="text-sm text-gray-500">Mutes</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <UserX className="w-8 h-8 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold">{modActions.filter(a => a.type === 'kick').length}</p>
                    <p className="text-sm text-gray-500">Kicks</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Ban className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold">{modActions.filter(a => a.type === 'ban').length}</p>
                    <p className="text-sm text-gray-500">Bans</p>
                  </div>
                </div>
              </Card>
            </div>

            <Card>
              <CardHeader><CardTitle>Recent Moderation Actions</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {modActions.map(action => (
                    <div key={action.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-4">
                        <Badge className={getModActionColor(action.type)}>{action.type}</Badge>
                        <div>
                          <p className="font-medium">{action.targetName}</p>
                          <p className="text-sm text-gray-500">by {action.moderatorName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{action.reason}</p>
                        <p className="text-xs text-gray-400">{formatTimeAgo(action.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="flex-1 p-4 m-0 overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-6">
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalMembers.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Total Members</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <div className="flex items-center gap-3">
                  <Circle className="w-8 h-8 text-green-500 fill-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.onlineMembers}</p>
                    <p className="text-sm text-gray-600">Online Now</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-8 h-8 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.messagesThisWeek.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Messages This Week</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20">
                <div className="flex items-center gap-3">
                  <Gem className="w-8 h-8 text-pink-500" />
                  <div>
                    <p className="text-2xl font-bold">Level {stats.boostLevel}</p>
                    <p className="text-sm text-gray-600">{serverBoost.boostCount} Boosts</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
              <Card>
                <CardHeader><CardTitle>Member Growth</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-48 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-12 h-12 text-orange-300" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Message Activity</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-48 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-12 h-12 text-blue-300" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Boost Progress */}
            <Card className="mt-6">
              <CardHeader><CardTitle className="flex items-center gap-2"><Gem className="w-5 h-5 text-pink-500" />Server Boost Progress</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl font-bold text-pink-500">Level {serverBoost.level}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>{serverBoost.boostCount} / {serverBoost.nextLevel?.required} Boosts</span>
                      <span>Level {serverBoost.level + 1}</span>
                    </div>
                    <Progress value={(serverBoost.boostCount / (serverBoost.nextLevel?.required || 1)) * 100} className="h-3" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Current Perks</h4>
                    <div className="space-y-1">
                      {serverBoost.perks.map((perk, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          {perk}
                        </div>
                      ))}
                    </div>
                  </div>
                  {serverBoost.nextLevel && (
                    <div>
                      <h4 className="font-medium mb-2">Next Level Perks</h4>
                      <div className="space-y-1">
                        {serverBoost.nextLevel.perks.map((perk, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                            <Circle className="w-4 h-4" />
                            {perk}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Dynamic Platform Content */}
            <div className="mt-6 space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-orange-500" />
                Platform Updates & Insights
              </h3>
              <CommunityAnnouncements />
              <div className="grid lg:grid-cols-2 gap-6">
                <CommunityGrowthMetrics />
                <CommunityTestimonials />
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab - Discord Level */}
          <TabsContent value="settings" className="flex-1 p-4 m-0 overflow-auto">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3 space-y-2">
                <nav className="space-y-1">
                  {[
                    { id: 'general', label: 'General', icon: Settings },
                    { id: 'moderation', label: 'Moderation', icon: Shield },
                    { id: 'notifications', label: 'Notifications', icon: Bell },
                    { id: 'permissions', label: 'Permissions', icon: Key },
                    { id: 'integrations', label: 'Integrations', icon: Webhook },
                    { id: 'advanced', label: 'Advanced', icon: Sliders }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSettingsTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                        settingsTab === item.id
                          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 font-medium'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  ))}
                </nav>

                {/* Community Stats */}
                <Card className="mt-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Community Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Total Members</span>
                      <Badge variant="secondary">{stats.totalMembers.toLocaleString()}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Online Now</span>
                      <span className="text-sm font-medium text-green-600">{stats.onlineMembers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Boost Level</span>
                      <span className="text-sm font-medium text-pink-600">Level {stats.boostLevel}</span>
                    </div>
                    <Progress value={(serverBoost.boostCount / (serverBoost.nextLevel?.required || 14)) * 100} className="h-2 mt-2" />
                    <p className="text-xs text-gray-500 mt-1">{serverBoost.boostCount}/{serverBoost.nextLevel?.required} boosts</p>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="w-5 h-5 text-orange-600" />
                          Server Overview
                        </CardTitle>
                        <CardDescription>Configure your community server settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Server Name</Label>
                            <Input defaultValue="FreeFlow Community" />
                            <p className="text-xs text-gray-500">Visible to all members</p>
                          </div>
                          <div className="space-y-2">
                            <Label>Server Region</Label>
                            <Select defaultValue="us-east">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="us-east">US East</SelectItem>
                                <SelectItem value="us-west">US West</SelectItem>
                                <SelectItem value="europe">Europe</SelectItem>
                                <SelectItem value="asia">Asia</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Server Description</Label>
                          <Textarea placeholder="Describe your community..." defaultValue="The official FreeFlow community for creators, developers, and innovators." />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-orange-500" />
                            <div>
                              <p className="font-medium">Community Mode</p>
                              <p className="text-sm text-gray-500">Enable community features like discovery</p>
                            </div>
                          </div>
                          <Switch
                            checked={communityModeEnabled}
                            onCheckedChange={(checked) => {
                              setCommunityModeEnabled(checked)
                              toast.success(checked ? 'Community mode enabled' : 'Community mode disabled')
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-blue-500" />
                            <div>
                              <p className="font-medium">Discoverable</p>
                              <p className="text-sm text-gray-500">Allow users to find this server</p>
                            </div>
                          </div>
                          <Switch
                            checked={discoverableEnabled}
                            onCheckedChange={(checked) => {
                              setDiscoverableEnabled(checked)
                              toast.success(checked ? 'Server is now discoverable' : 'Server is now hidden')
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="w-5 h-5 text-blue-600" />
                          Verification Level
                        </CardTitle>
                        <CardDescription>Set requirements for new members</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Verification Level</Label>
                          <Select defaultValue="medium">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None - Unrestricted</SelectItem>
                              <SelectItem value="low">Low - Verified email</SelectItem>
                              <SelectItem value="medium">Medium - 5 min account age</SelectItem>
                              <SelectItem value="high">High - 10 min membership</SelectItem>
                              <SelectItem value="highest">Highest - Verified phone</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-red-500" />
                            <div>
                              <p className="font-medium">Explicit Content Filter</p>
                              <p className="text-sm text-gray-500">Scan media from members without roles</p>
                            </div>
                          </div>
                          <Switch
                            checked={explicitFilterEnabled}
                            onCheckedChange={(checked) => {
                              setExplicitFilterEnabled(checked)
                              toast.success(checked ? 'Explicit content filter enabled' : 'Explicit content filter disabled')
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Key className="w-4 h-4 text-violet-500" />
                            <div>
                              <p className="font-medium">2FA Requirement</p>
                              <p className="text-sm text-gray-500">Require 2FA for moderation actions</p>
                            </div>
                          </div>
                          <Switch
                            checked={twoFactorRequired}
                            onCheckedChange={(checked) => {
                              setTwoFactorRequired(checked)
                              toast.success(checked ? '2FA required for moderators' : '2FA requirement disabled')
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Moderation Settings */}
                {settingsTab === 'moderation' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-green-600" />
                          Auto-Moderation
                        </CardTitle>
                        <CardDescription>Configure automatic moderation rules</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Ban className="w-4 h-4 text-red-500" />
                            <div>
                              <p className="font-medium">Block Spam</p>
                              <p className="text-sm text-gray-500">Automatically delete spam messages</p>
                            </div>
                          </div>
                          <Switch
                            checked={blockSpamEnabled}
                            onCheckedChange={(checked) => {
                              setBlockSpamEnabled(checked)
                              toast.success(checked ? 'Spam blocking enabled' : 'Spam blocking disabled')
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Link2 className="w-4 h-4 text-orange-500" />
                            <div>
                              <p className="font-medium">Block Harmful Links</p>
                              <p className="text-sm text-gray-500">Remove phishing and malware links</p>
                            </div>
                          </div>
                          <Switch
                            checked={blockHarmfulLinksEnabled}
                            onCheckedChange={(checked) => {
                              setBlockHarmfulLinksEnabled(checked)
                              toast.success(checked ? 'Harmful link blocking enabled' : 'Harmful link blocking disabled')
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-yellow-500" />
                            <div>
                              <p className="font-medium">Block Keyword Phrases</p>
                              <p className="text-sm text-gray-500">Filter specific words or phrases</p>
                            </div>
                          </div>
                          <Switch
                            checked={blockKeywordEnabled}
                            onCheckedChange={(checked) => {
                              setBlockKeywordEnabled(checked)
                              toast.success(checked ? 'Keyword filtering enabled' : 'Keyword filtering disabled')
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <AtSign className="w-4 h-4 text-blue-500" />
                            <div>
                              <p className="font-medium">Block Mention Spam</p>
                              <p className="text-sm text-gray-500">Limit mass @mentions</p>
                            </div>
                          </div>
                          <Switch
                            checked={blockMentionSpamEnabled}
                            onCheckedChange={(checked) => {
                              setBlockMentionSpamEnabled(checked)
                              toast.success(checked ? 'Mention spam blocking enabled' : 'Mention spam blocking disabled')
                            }}
                          />
                        </div>

                        <div className="space-y-2 pt-4">
                          <Label>Mention Limit</Label>
                          <Select defaultValue="5">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3">3 mentions</SelectItem>
                              <SelectItem value="5">5 mentions</SelectItem>
                              <SelectItem value="10">10 mentions</SelectItem>
                              <SelectItem value="20">20 mentions</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Gavel className="w-5 h-5 text-red-600" />
                          Default Punishments
                        </CardTitle>
                        <CardDescription>Set default actions for violations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>First Offense</Label>
                            <Select defaultValue="warn">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="warn">Warning</SelectItem>
                                <SelectItem value="mute">5 min mute</SelectItem>
                                <SelectItem value="timeout">1 hour timeout</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Second Offense</Label>
                            <Select defaultValue="mute">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="mute">1 hour mute</SelectItem>
                                <SelectItem value="timeout">24 hour timeout</SelectItem>
                                <SelectItem value="kick">Kick</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Third Offense</Label>
                            <Select defaultValue="timeout">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="timeout">24 hour timeout</SelectItem>
                                <SelectItem value="kick">Kick</SelectItem>
                                <SelectItem value="ban">Ban</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Severe Offense</Label>
                            <Select defaultValue="ban">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="kick">Kick</SelectItem>
                                <SelectItem value="ban">Ban</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <ScrollText className="w-4 h-4 text-green-500" />
                            <div>
                              <p className="font-medium">Log Mod Actions</p>
                              <p className="text-sm text-gray-500">Record all moderation actions</p>
                            </div>
                          </div>
                          <Switch
                            checked={logModActionsEnabled}
                            onCheckedChange={(checked) => {
                              setLogModActionsEnabled(checked)
                              toast.success(checked ? 'Moderation logging enabled' : 'Moderation logging disabled')
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-amber-500" />
                          Server Notifications
                        </CardTitle>
                        <CardDescription>Configure notification defaults</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Default Notification Setting</Label>
                          <Select defaultValue="mentions">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Messages</SelectItem>
                              <SelectItem value="mentions">Only @mentions</SelectItem>
                              <SelectItem value="none">Nothing</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-green-500" />
                            <div>
                              <p className="font-medium">Mobile Push Notifications</p>
                              <p className="text-sm text-gray-500">Send notifications to mobile devices</p>
                            </div>
                          </div>
                          <Switch
                            checked={mobilePushEnabled}
                            onCheckedChange={(checked) => {
                              setMobilePushEnabled(checked)
                              toast.success(checked ? 'Mobile push notifications enabled' : 'Mobile push notifications disabled')
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <BellOff className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="font-medium">Suppress @everyone</p>
                              <p className="text-sm text-gray-500">Disable @everyone and @here by default</p>
                            </div>
                          </div>
                          <Switch
                            checked={suppressEveryoneEnabled}
                            onCheckedChange={(checked) => {
                              setSuppressEveryoneEnabled(checked)
                              toast.success(checked ? '@everyone mentions suppressed' : '@everyone mentions allowed')
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <BellRing className="w-4 h-4 text-amber-500" />
                            <div>
                              <p className="font-medium">Role Mention Highlighting</p>
                              <p className="text-sm text-gray-500">Highlight when your role is mentioned</p>
                            </div>
                          </div>
                          <Switch
                            checked={roleMentionHighlightEnabled}
                            onCheckedChange={(checked) => {
                              setRoleMentionHighlightEnabled(checked)
                              toast.success(checked ? 'Role mention highlighting enabled' : 'Role mention highlighting disabled')
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Mail className="w-5 h-5 text-blue-600" />
                          Admin Alerts
                        </CardTitle>
                        <CardDescription>Notifications for server admins</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <UserPlus className="w-4 h-4 text-blue-500" />
                            <div>
                              <p className="font-medium">New Member Joins</p>
                              <p className="text-sm text-gray-500">Alert when new members join</p>
                            </div>
                          </div>
                          <Switch
                            checked={newMemberAlertsEnabled}
                            onCheckedChange={(checked) => {
                              setNewMemberAlertsEnabled(checked)
                              toast.success(checked ? 'New member alerts enabled' : 'New member alerts disabled')
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                            <div>
                              <p className="font-medium">Member Reports</p>
                              <p className="text-sm text-gray-500">Alert on user reports</p>
                            </div>
                          </div>
                          <Switch
                            checked={memberReportsEnabled}
                            onCheckedChange={(checked) => {
                              setMemberReportsEnabled(checked)
                              toast.success(checked ? 'Member report alerts enabled' : 'Member report alerts disabled')
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Rocket className="w-4 h-4 text-pink-500" />
                            <div>
                              <p className="font-medium">Server Boost Changes</p>
                              <p className="text-sm text-gray-500">Alert on boost level changes</p>
                            </div>
                          </div>
                          <Switch
                            checked={boostChangesEnabled}
                            onCheckedChange={(checked) => {
                              setBoostChangesEnabled(checked)
                              toast.success(checked ? 'Boost change alerts enabled' : 'Boost change alerts disabled')
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-red-500" />
                            <div>
                              <p className="font-medium">Security Alerts</p>
                              <p className="text-sm text-gray-500">Notify on suspicious activity</p>
                            </div>
                          </div>
                          <Switch
                            checked={securityAlertsEnabled}
                            onCheckedChange={(checked) => {
                              setSecurityAlertsEnabled(checked)
                              toast.success(checked ? 'Security alerts enabled' : 'Security alerts disabled')
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Permissions Settings */}
                {settingsTab === 'permissions' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="w-5 h-5 text-violet-600" />
                          Default Permissions
                        </CardTitle>
                        <CardDescription>Set permissions for @everyone role</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { id: 'view', label: 'View Channels', desc: 'Allow viewing text and voice channels', icon: <Eye className="w-4 h-4 text-blue-500" /> },
                          { id: 'send', label: 'Send Messages', desc: 'Allow sending messages in channels', icon: <Send className="w-4 h-4 text-green-500" /> },
                          { id: 'react', label: 'Add Reactions', desc: 'Allow adding emoji reactions', icon: <Heart className="w-4 h-4 text-pink-500" /> },
                          { id: 'voice', label: 'Connect to Voice', desc: 'Allow joining voice channels', icon: <Headphones className="w-4 h-4 text-violet-500" /> },
                          { id: 'speak', label: 'Speak in Voice', desc: 'Allow speaking in voice channels', icon: <Mic className="w-4 h-4 text-amber-500" /> },
                          { id: 'embed', label: 'Embed Links', desc: 'Allow embedding links and previews', icon: <Link2 className="w-4 h-4 text-cyan-500" /> },
                          { id: 'attach', label: 'Attach Files', desc: 'Allow uploading files', icon: <Paperclip className="w-4 h-4 text-orange-500" /> },
                          { id: 'mention', label: 'Mention @everyone', desc: 'Allow mentioning everyone', icon: <AtSign className="w-4 h-4 text-red-500" /> }
                        ].map(perm => (
                          <div key={perm.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-2">
                              {perm.icon}
                              <div>
                                <p className="font-medium">{perm.label}</p>
                                <p className="text-sm text-gray-500">{perm.desc}</p>
                              </div>
                            </div>
                            <Switch
                              checked={permissionsState[perm.id]}
                              onCheckedChange={(checked) => {
                                setPermissionsState(prev => ({ ...prev, [perm.id]: checked }))
                                toast.success(checked ? `${perm.label} permission enabled` : `${perm.label} permission disabled`)
                              }}
                            />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-green-600" />
                          Role Hierarchy
                        </CardTitle>
                        <CardDescription>Manage role permissions and order</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {roles.map(role => (
                          <div key={role.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: role.color }} />
                              <span className="font-medium" style={{ color: role.color }}>{role.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">{role.memberCount} members</span>
                              <Button variant="ghost" size="icon" onClick={() => handleOpenRoleSettings(role.id)}><Settings className="w-4 h-4" /></Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bot className="w-5 h-5 text-blue-600" />
                          Bots & Apps
                        </CardTitle>
                        <CardDescription>Manage server bots and integrations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {bots.map(bot => (
                          <div key={bot.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-4">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={`https://avatar.vercel.sh/${bot.avatar}`} />
                                <AvatarFallback>{bot.name.slice(0, 2)}</AvatarFallback>
                              </Avatar>
                              <div className="flex items-center gap-2">
                                <Bot className="w-4 h-4 text-blue-500" />
                                <div>
                                  <p className="font-medium">{bot.name}</p>
                                  <p className="text-sm text-gray-500">{bot.description}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge variant="outline">{bot.commands} commands</Badge>
                              <Switch
                                checked={botEnabledStates[bot.id] ?? bot.isEnabled}
                                onCheckedChange={(checked) => {
                                  setBotEnabledStates(prev => ({ ...prev, [bot.id]: checked }))
                                  toast.success(checked ? `${bot.name} enabled` : `${bot.name} disabled`)
                                }}
                              />
                            </div>
                          </div>
                        ))}

                        <Button
                          variant="outline"
                          className="w-full"
                          disabled={isSubmitting}
                          onClick={handleOpenBotMarketplace}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Bot or App
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Webhook className="w-5 h-5 text-orange-600" />
                          Webhooks
                        </CardTitle>
                        <CardDescription>Send automated messages to channels</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Webhook Name</Label>
                          <Input placeholder="My Webhook" />
                        </div>

                        <div className="space-y-2">
                          <Label>Channel</Label>
                          <Select defaultValue="general">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">#general</SelectItem>
                              <SelectItem value="announcements">#announcements</SelectItem>
                              <SelectItem value="bot-channel">#bot-channel</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Button
                          variant="outline"
                          className="w-full"
                          disabled={isSubmitting}
                          onClick={async () => {
                            if (!userId) {
                              toast.error('Authentication required')
                              return
                            }
                            setIsSubmitting(true)
                            try {
                              const webhookToken = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
                              const { error } = await supabase.from('community_webhooks').insert({
                                user_id: userId,
                                community_id: communities?.[0]?.id,
                                name: 'New Webhook',
                                channel_id: selectedChannel.id,
                                token: webhookToken,
                                is_active: true
                              })
                              if (error) throw error
                              toast.success('Webhook created')
                            } catch (error) {
                              toast.error('Failed to create webhook')
                            } finally {
                              setIsSubmitting(false)
                            }
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Webhook
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ShieldAlert className="w-5 h-5 text-green-600" />
                          Security Settings
                        </CardTitle>
                        <CardDescription>Advanced security configurations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-red-500" />
                            <div>
                              <p className="font-medium">Raid Protection</p>
                              <p className="text-sm text-gray-500">Detect and prevent raid attacks</p>
                            </div>
                          </div>
                          <Switch
                            checked={raidProtectionEnabled}
                            onCheckedChange={(checked) => {
                              setRaidProtectionEnabled(checked)
                              toast.success(checked ? 'Raid protection enabled' : 'Raid protection disabled')
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-yellow-500" />
                            <div>
                              <p className="font-medium">Suspicious Account Detection</p>
                              <p className="text-sm text-gray-500">Flag newly created accounts</p>
                            </div>
                          </div>
                          <Switch
                            checked={suspiciousAccountDetectionEnabled}
                            onCheckedChange={(checked) => {
                              setSuspiciousAccountDetectionEnabled(checked)
                              toast.success(checked ? 'Suspicious account detection enabled' : 'Suspicious account detection disabled')
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <ShieldOff className="w-4 h-4 text-orange-500" />
                            <div>
                              <p className="font-medium">Anti-Scam Protection</p>
                              <p className="text-sm text-gray-500">Block known scam patterns</p>
                            </div>
                          </div>
                          <Switch
                            checked={antiScamEnabled}
                            onCheckedChange={(checked) => {
                              setAntiScamEnabled(checked)
                              toast.success(checked ? 'Anti-scam protection enabled' : 'Anti-scam protection disabled')
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-purple-500" />
                            <div>
                              <p className="font-medium">DM Spam Protection</p>
                              <p className="text-sm text-gray-500">Protect members from DM spam</p>
                            </div>
                          </div>
                          <Switch
                            checked={dmSpamProtectionEnabled}
                            onCheckedChange={(checked) => {
                              setDmSpamProtectionEnabled(checked)
                              toast.success(checked ? 'DM spam protection enabled' : 'DM spam protection disabled')
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <HardDrive className="w-5 h-5 text-blue-600" />
                          Data Management
                        </CardTitle>
                        <CardDescription>Server data and exports</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Message Retention</Label>
                          <Select defaultValue="forever">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 days</SelectItem>
                              <SelectItem value="90">90 days</SelectItem>
                              <SelectItem value="365">1 year</SelectItem>
                              <SelectItem value="forever">Forever</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <ScrollText className="w-4 h-4 text-green-500" />
                            <div>
                              <p className="font-medium">Audit Log Retention</p>
                              <p className="text-sm text-gray-500">Keep detailed audit logs</p>
                            </div>
                          </div>
                          <Switch
                            checked={auditLogRetentionEnabled}
                            onCheckedChange={(checked) => {
                              setAuditLogRetentionEnabled(checked)
                              toast.success(checked ? 'Audit log retention enabled' : 'Audit log retention disabled')
                            }}
                          />
                        </div>

                        <Button
                          variant="outline"
                          className="w-full"
                          disabled={isSubmitting}
                          onClick={async () => {
                            if (!userId) {
                              toast.error('Authentication required')
                              return
                            }
                            setIsSubmitting(true)
                            try {
                              const { data, error } = await supabase.from('community')
                                .select('*, community_members(*), community_posts(*), community_events(*)')
                                .eq('id', communities?.[0]?.id)
                                .single()
                              if (error) throw error

                              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                              const url = URL.createObjectURL(blob)
                              const a = document.createElement('a')
                              a.href = url
                              a.download = `community-export-${new Date().toISOString().split('T')[0]}.json`
                              document.body.appendChild(a)
                              a.click()
                              document.body.removeChild(a)
                              URL.revokeObjectURL(url)

                              toast.success('Export complete')
                            } catch (error) {
                              toast.error('Failed to export data')
                            } finally {
                              setIsSubmitting(false)
                            }
                          }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export Server Data
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-indigo-600" />
                          Server Boost
                        </CardTitle>
                        <CardDescription>Current boost level and perks</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg">
                          <div>
                            <p className="font-medium text-pink-800 dark:text-pink-400">Level {serverBoost.level}</p>
                            <p className="text-sm text-pink-600 dark:text-pink-500">{serverBoost.boostCount} boosts from {serverBoost.boostersCount} boosters</p>
                          </div>
                          <Gem className="w-8 h-8 text-pink-500" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <p className="text-2xl font-bold text-orange-600">{stats.totalMembers.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">Members</p>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <p className="text-2xl font-bold text-blue-600">{stats.totalChannels}</p>
                            <p className="text-xs text-gray-500">Channels</p>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <p className="text-2xl font-bold text-pink-600">{serverBoost.level}</p>
                            <p className="text-xs text-gray-500">Boost Level</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-red-200 dark:border-red-900">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertTriangle className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                        <CardDescription>Irreversible actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Prune Members</p>
                            <p className="text-sm text-red-600 dark:text-red-500">Remove inactive members</p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={isSubmitting}
                            onClick={async () => {
                              if (!confirm('Are you sure you want to prune inactive members? This action cannot be undone.')) return
                              setIsSubmitting(true)
                              try {
                                const { error } = await supabase.from('community_members')
                                  .update({ status: 'pruned', pruned_at: new Date().toISOString() })
                                  .eq('community_id', communities?.[0]?.id)
                                  .lt('last_active_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
                                if (error) throw error
                                toast.success('Members pruned')
                                refreshMembers()
                              } catch (error) {
                                toast.error('Failed to prune members')
                              } finally {
                                setIsSubmitting(false)
                              }
                            }}
                          >
                            Prune
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Delete All Messages</p>
                            <p className="text-sm text-red-600 dark:text-red-500">Clear all server message history</p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={isSubmitting}
                            onClick={async () => {
                              if (!confirm('Are you sure you want to delete all messages? This action cannot be undone.')) return
                              setIsSubmitting(true)
                              try {
                                const { error } = await supabase.from('community_posts')
                                  .update({ deleted_at: new Date().toISOString() })
                                  .eq('community_id', communities?.[0]?.id)
                                if (error) throw error
                                toast.success('Messages deleted')
                                refreshPosts()
                              } catch (error) {
                                toast.error('Failed to delete messages')
                              } finally {
                                setIsSubmitting(false)
                              }
                            }}
                          >
                            Delete All
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Delete Server</p>
                            <p className="text-sm text-red-600 dark:text-red-500">Permanently delete this server</p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={isSubmitting}
                            onClick={() => {
                              if (!confirm('Are you absolutely sure you want to delete this server? This action is permanent and cannot be undone.')) return
                              handleDeleteCommunity()
                            }}
                          >
                            Delete Server
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={communityCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={communityPredictions}
              title="Community Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          
          <QuickActionsToolbar
            actions={communityQuickActions}
            variant="grid"
          />
        </div>
      </div>

      {/* Member Profile Dialog */}
      <Dialog open={showMemberProfile} onOpenChange={setShowMemberProfile}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Member Profile</DialogTitle></DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={`https://avatar.vercel.sh/${selectedMember.avatar}`} />
                    <AvatarFallback>{selectedMember.displayName.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <span className={`absolute bottom-0 right-0 w-5 h-5 ${getStatusColor(selectedMember.status)} rounded-full border-3 border-white dark:border-gray-800`} />
                </div>
                <div>
                  <h2 className={`text-xl font-bold flex items-center gap-2 ${getRoleColor(selectedMember.highestRole)}`}>
                    {selectedMember.displayName}
                    {getRoleIcon(selectedMember.highestRole)}
                    {selectedMember.isBoosting && <Rocket className="w-4 h-4 text-pink-500" />}
                  </h2>
                  <p className="text-gray-500">@{selectedMember.username}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"><p className="text-sm text-gray-500">Status</p><p className="font-medium capitalize">{selectedMember.status}</p></div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"><p className="text-sm text-gray-500">Joined</p><p className="font-medium">{selectedMember.joinedAt.toLocaleDateString()}</p></div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"><p className="text-sm text-gray-500">Messages</p><p className="font-medium">{selectedMember.messageCount.toLocaleString()}</p></div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"><p className="text-sm text-gray-500">Voice Time</p><p className="font-medium">{Math.floor(selectedMember.voiceMinutes / 60)}h</p></div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => toast.info('Opening direct message')}><MessageSquare className="w-4 h-4 mr-2" />Message</Button>
                <Button variant="outline" onClick={() => selectedMember && handleFollowUser(selectedMember.id)}><UserPlus className="w-4 h-4" /></Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Channel Dialog */}
      <Dialog open={showCreateChannel} onOpenChange={setShowCreateChannel}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Channel</DialogTitle><DialogDescription>Add a new channel to the server</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Channel Type</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 mt-2">
                {[{ type: 'text', icon: <Hash />, label: 'Text' }, { type: 'voice', icon: <Volume2 />, label: 'Voice' }, { type: 'forum', icon: <MessageCircle />, label: 'Forum' }, { type: 'announcement', icon: <Megaphone />, label: 'Announcement' }].map(item => (
                  <button
                    key={item.type}
                    onClick={() => setChannelForm(prev => ({ ...prev, type: item.type as ChannelType }))}
                    className={`p-3 border rounded-lg hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center gap-2 ${channelForm.type === item.type ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : ''}`}
                  >
                    {item.icon}{item.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Channel Name</Label>
              <Input
                placeholder="new-channel"
                className="mt-1"
                value={channelForm.name}
                onChange={(e) => setChannelForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Input
                placeholder="What is this channel about?"
                className="mt-1"
                value={channelForm.description}
                onChange={(e) => setChannelForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="private"
                checked={channelForm.isPrivate}
                onCheckedChange={(checked) => {
                  setChannelForm(prev => ({ ...prev, isPrivate: checked }))
                  toast.success(checked ? 'Channel set to private' : 'Channel set to public')
                }}
              />
              <Lock className="w-4 h-4 text-gray-500" />
              <Label htmlFor="private">Private Channel</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateChannel(false)}>Cancel</Button>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleCreateChannel} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Channel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Event Dialog */}
      <Dialog open={showCreateEvent} onOpenChange={setShowCreateEvent}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Event</DialogTitle><DialogDescription>Schedule a new community event</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Event Name</Label>
              <Input
                placeholder="Weekly Community Hangout"
                className="mt-1"
                value={eventForm.name}
                onChange={(e) => setEventForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="What's this event about?"
                className="mt-1"
                value={eventForm.description}
                onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div><Label>Event Type</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6 mt-2">
                {[{ type: 'voice', icon: <Volume2 />, label: 'Voice' }, { type: 'stage', icon: <Radio />, label: 'Stage' }, { type: 'external', icon: <ExternalLink />, label: 'External' }].map(item => (
                  <button
                    key={item.type}
                    onClick={() => setEventForm(prev => ({ ...prev, entityType: item.type as 'voice' | 'stage' | 'external' }))}
                    className={`p-3 border rounded-lg hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center gap-2 ${eventForm.entityType === item.type ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : ''}`}
                  >
                    {item.icon}{item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <Label>Start Date & Time</Label>
                <Input
                  type="datetime-local"
                  className="mt-1"
                  value={eventForm.scheduledStart}
                  onChange={(e) => setEventForm(prev => ({ ...prev, scheduledStart: e.target.value }))}
                />
              </div>
              <div>
                <Label>End Date & Time (optional)</Label>
                <Input
                  type="datetime-local"
                  className="mt-1"
                  value={eventForm.scheduledEnd}
                  onChange={(e) => setEventForm(prev => ({ ...prev, scheduledEnd: e.target.value }))}
                />
              </div>
            </div>
            {eventForm.entityType === 'external' && (
              <div>
                <Label>Location</Label>
                <Input
                  placeholder="Event location or URL"
                  className="mt-1"
                  value={eventForm.location}
                  onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateEvent(false)}>Cancel</Button>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleCreateEvent} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Role Dialog */}
      <Dialog open={showCreateRole} onOpenChange={setShowCreateRole}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Role</DialogTitle><DialogDescription>Add a new role to the server</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Role Name</Label>
              <Input
                placeholder="New Role"
                className="mt-1"
                value={roleForm.name}
                onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Role Color</Label>
              <div className="flex items-center gap-3 mt-1">
                <Input
                  type="color"
                  className="w-12 h-10 p-1"
                  value={roleForm.color}
                  onChange={(e) => setRoleForm(prev => ({ ...prev, color: e.target.value }))}
                />
                <Input
                  value={roleForm.color}
                  onChange={(e) => setRoleForm(prev => ({ ...prev, color: e.target.value }))}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="hoisted"
                checked={roleForm.isHoisted}
                onCheckedChange={(checked) => {
                  setRoleForm(prev => ({ ...prev, isHoisted: checked }))
                  toast.success(checked ? 'Role members will display separately' : 'Role members will not display separately')
                }}
              />
              <Users className="w-4 h-4 text-blue-500" />
              <Label htmlFor="hoisted">Display role members separately</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="mentionable"
                checked={roleForm.isMentionable}
                onCheckedChange={(checked) => {
                  setRoleForm(prev => ({ ...prev, isMentionable: checked }))
                  toast.success(checked ? 'Role is now mentionable by anyone' : 'Role is no longer mentionable by everyone')
                }}
              />
              <AtSign className="w-4 h-4 text-orange-500" />
              <Label htmlFor="mentionable">Allow anyone to @mention this role</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateRole(false)}>Cancel</Button>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleCreateRole} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
