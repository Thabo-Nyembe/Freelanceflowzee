'use client'

import { useState, useCallback, useMemo } from 'react'
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
  DialogFooter, DialogTrigger
} from '@/components/ui/dialog'
import {
  Users, Plus, MessageSquare, ThumbsUp, Share2, TrendingUp, Award, Star, Heart, Eye,
  Hash, Volume2, Video, Settings, Bell, Pin, Smile, Send, Paperclip, AtSign,
  Search, Filter, MoreHorizontal, ChevronDown, ChevronRight, Lock, Globe, Shield,
  UserPlus, UserMinus, Crown, Mic, MicOff, Headphones, Phone, Camera, ScreenShare,
  Reply, Edit3, Trash2, Flag, Bookmark, Link2, Image as ImageIcon, Gift, Sparkles,
  Circle, CheckCircle, Clock, Zap, MessageCircle, Radio, Megaphone, Calendar,
  AlertTriangle, Ban, Timer, Activity, BarChart3, PieChart, UserCheck, UserX,
  VolumeX, Gavel, FileText, ExternalLink, Copy, Rocket, Gem, Palette, Folder,
  FolderPlus, Tag, SlidersHorizontal, ShieldCheck, ShieldAlert, Mail, Bot,
  Webhook, PuzzlePiece, Download, Upload, RefreshCw, History, Eye as EyeIcon,
  MoreVertical, ChevronUp, X, Check, AlertCircle, Info, HelpCircle, Key, HardDrive,
  CreditCard, Sliders
} from 'lucide-react'

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

// ============== MOCK DATA ==============

const mockChannelCategories: ChannelCategory[] = [
  {
    id: 'cat1', name: 'INFORMATION', position: 1, isCollapsed: false,
    channels: [
      { id: 'ch1', name: 'rules', type: 'rules', description: 'Server rules and guidelines', isPrivate: false, isNsfw: false, slowMode: 0, position: 1, parentId: 'cat1', memberCount: 1250, unreadCount: 0, mentionCount: 0, lastActivity: new Date(), permissions: [] },
      { id: 'ch2', name: 'announcements', type: 'announcement', description: 'Important updates', isPrivate: false, isNsfw: false, slowMode: 0, position: 2, parentId: 'cat1', memberCount: 1250, unreadCount: 2, mentionCount: 0, lastActivity: new Date(), permissions: [] },
      { id: 'ch3', name: 'welcome', type: 'text', description: 'Say hello!', isPrivate: false, isNsfw: false, slowMode: 0, position: 3, parentId: 'cat1', memberCount: 1250, unreadCount: 0, mentionCount: 0, lastActivity: new Date(), permissions: [] }
    ]
  },
  {
    id: 'cat2', name: 'GENERAL', position: 2, isCollapsed: false,
    channels: [
      { id: 'ch4', name: 'general', type: 'text', description: 'General discussion', isPrivate: false, isNsfw: false, slowMode: 0, position: 1, parentId: 'cat2', memberCount: 1250, unreadCount: 12, mentionCount: 3, lastActivity: new Date(), permissions: [] },
      { id: 'ch5', name: 'off-topic', type: 'text', description: 'Random chatter', isPrivate: false, isNsfw: false, slowMode: 5, position: 2, parentId: 'cat2', memberCount: 980, unreadCount: 5, mentionCount: 0, lastActivity: new Date(), permissions: [] },
      { id: 'ch6', name: 'media', type: 'text', description: 'Share images and videos', isPrivate: false, isNsfw: false, slowMode: 10, position: 3, parentId: 'cat2', memberCount: 750, unreadCount: 0, mentionCount: 0, lastActivity: new Date(), permissions: [] }
    ]
  },
  {
    id: 'cat3', name: 'COMMUNITY', position: 3, isCollapsed: false,
    channels: [
      { id: 'ch7', name: 'showcase', type: 'forum', description: 'Share your projects', isPrivate: false, isNsfw: false, slowMode: 0, position: 1, parentId: 'cat3', memberCount: 890, unreadCount: 3, mentionCount: 0, lastActivity: new Date(), permissions: [] },
      { id: 'ch8', name: 'help', type: 'text', description: 'Get help from the community', isPrivate: false, isNsfw: false, slowMode: 0, position: 2, parentId: 'cat3', memberCount: 1100, unreadCount: 8, mentionCount: 1, lastActivity: new Date(), permissions: [] },
      { id: 'ch9', name: 'feedback', type: 'forum', description: 'Submit feedback and suggestions', isPrivate: false, isNsfw: false, slowMode: 0, position: 3, parentId: 'cat3', memberCount: 650, unreadCount: 0, mentionCount: 0, lastActivity: new Date(), permissions: [] }
    ]
  },
  {
    id: 'cat4', name: 'VOICE CHANNELS', position: 4, isCollapsed: false,
    channels: [
      { id: 'ch10', name: 'Lounge', type: 'voice', description: 'Hang out', isPrivate: false, isNsfw: false, slowMode: 0, position: 1, parentId: 'cat4', memberCount: 8, unreadCount: 0, mentionCount: 0, lastActivity: new Date(), permissions: [] },
      { id: 'ch11', name: 'Gaming', type: 'voice', description: 'Gaming voice chat', isPrivate: false, isNsfw: false, slowMode: 0, position: 2, parentId: 'cat4', memberCount: 4, unreadCount: 0, mentionCount: 0, lastActivity: new Date(), permissions: [] },
      { id: 'ch12', name: 'Music', type: 'voice', description: 'Listen together', isPrivate: false, isNsfw: false, slowMode: 0, position: 3, parentId: 'cat4', memberCount: 2, unreadCount: 0, mentionCount: 0, lastActivity: new Date(), permissions: [] },
      { id: 'ch13', name: 'Stage', type: 'stage', description: 'Community events', isPrivate: false, isNsfw: false, slowMode: 0, position: 4, parentId: 'cat4', memberCount: 0, unreadCount: 0, mentionCount: 0, lastActivity: new Date(), permissions: [] }
    ]
  },
  {
    id: 'cat5', name: 'STAFF', position: 5, isCollapsed: false,
    channels: [
      { id: 'ch14', name: 'staff-chat', type: 'text', description: 'Staff only', isPrivate: true, isNsfw: false, slowMode: 0, position: 1, parentId: 'cat5', memberCount: 12, unreadCount: 1, mentionCount: 0, lastActivity: new Date(), permissions: [] },
      { id: 'ch15', name: 'mod-log', type: 'text', description: 'Moderation actions', isPrivate: true, isNsfw: false, slowMode: 0, position: 2, parentId: 'cat5', memberCount: 8, unreadCount: 0, mentionCount: 0, lastActivity: new Date(), permissions: [] }
    ]
  }
]

const mockMessages: Message[] = [
  {
    id: 'm1', channelId: 'ch4', authorId: 'u1', authorName: 'John Developer', authorAvatar: 'john', authorRole: 'admin',
    content: 'Hey everyone! Just shipped a new feature. Check it out! 🚀',
    timestamp: new Date('2024-01-15T10:30:00'), reactions: [{ emoji: '🚀', count: 12, users: [], me: true }, { emoji: '👍', count: 8, users: [], me: false }],
    isPinned: false, isSystemMessage: false, attachments: [], embeds: [], mentions: []
  },
  {
    id: 'm2', channelId: 'ch4', authorId: 'u2', authorName: 'Sarah Designer', authorAvatar: 'sarah', authorRole: 'moderator',
    content: 'That looks amazing! The new dashboard design is clean 🎨',
    timestamp: new Date('2024-01-15T10:32:00'), reactions: [{ emoji: '❤️', count: 5, users: [], me: false }],
    isPinned: false, isSystemMessage: false, attachments: [], embeds: [], mentions: [],
    replyTo: { id: 'm1', authorName: 'John Developer', content: 'Hey everyone! Just shipped...' }
  },
  {
    id: 'm3', channelId: 'ch4', authorId: 'u3', authorName: 'Mike Engineer', authorAvatar: 'mike', authorRole: 'vip',
    content: 'Nice work! I found a small issue on mobile though. @John Developer check DMs',
    timestamp: new Date('2024-01-15T10:35:00'), editedTimestamp: new Date('2024-01-15T10:36:00'),
    reactions: [], isPinned: false, isSystemMessage: false, attachments: [], embeds: [], mentions: ['u1']
  },
  {
    id: 'm4', channelId: 'ch4', authorId: 'u4', authorName: 'Emily PM', authorAvatar: 'emily', authorRole: 'member',
    content: 'Great collaboration everyone! Let\'s schedule a sync to discuss next steps.',
    timestamp: new Date('2024-01-15T10:40:00'), reactions: [{ emoji: '✅', count: 6, users: [], me: true }],
    isPinned: true, isSystemMessage: false, attachments: [], embeds: [], mentions: []
  },
  {
    id: 'm5', channelId: 'ch4', authorId: 'bot1', authorName: 'FreeFlow Bot', authorAvatar: 'bot', authorRole: 'member',
    content: '📊 **Daily Stats Update**\n• New members: 23\n• Messages: 847\n• Active users: 156',
    timestamp: new Date('2024-01-15T11:00:00'), reactions: [],
    isPinned: false, isSystemMessage: true, attachments: [], embeds: [], mentions: []
  }
]

const mockMembers: Member[] = [
  { id: 'u1', username: 'john_dev', displayName: 'John Developer', avatar: 'john', status: 'online', roles: ['admin', 'vip'], highestRole: 'admin', joinedAt: new Date('2023-01-15'), isBot: false, isOwner: true, isBoosting: true, lastSeen: new Date(), messageCount: 2340, voiceMinutes: 12500 },
  { id: 'u2', username: 'sarah_design', displayName: 'Sarah Designer', avatar: 'sarah', status: 'online', customStatus: 'Working on UI', roles: ['moderator', 'vip'], highestRole: 'moderator', joinedAt: new Date('2023-02-20'), isBot: false, isOwner: false, isBoosting: true, lastSeen: new Date(), messageCount: 1890, voiceMinutes: 8900 },
  { id: 'u3', username: 'mike_eng', displayName: 'Mike Engineer', avatar: 'mike', status: 'idle', roles: ['vip'], highestRole: 'vip', joinedAt: new Date('2023-03-10'), isBot: false, isOwner: false, isBoosting: false, lastSeen: new Date(), messageCount: 1456, voiceMinutes: 5600 },
  { id: 'u4', username: 'emily_pm', displayName: 'Emily PM', avatar: 'emily', status: 'dnd', customStatus: 'In a meeting', roles: ['member'], highestRole: 'member', joinedAt: new Date('2023-04-01'), isBot: false, isOwner: false, isBoosting: false, lastSeen: new Date(), messageCount: 890, voiceMinutes: 3400 },
  { id: 'u5', username: 'alex_fe', displayName: 'Alex Frontend', avatar: 'alex', status: 'offline', roles: ['member'], highestRole: 'member', joinedAt: new Date('2023-05-15'), isBot: false, isOwner: false, isBoosting: false, lastSeen: new Date(), messageCount: 567, voiceMinutes: 1200 },
  { id: 'u6', username: 'lisa_be', displayName: 'Lisa Backend', avatar: 'lisa', status: 'online', roles: ['member'], highestRole: 'member', joinedAt: new Date('2023-06-01'), isBot: false, isOwner: false, isBoosting: true, lastSeen: new Date(), messageCount: 678, voiceMinutes: 2300 },
  { id: 'bot1', username: 'freeflow_bot', displayName: 'FreeFlow Bot', avatar: 'bot', status: 'online', roles: ['member'], highestRole: 'member', joinedAt: new Date('2023-01-01'), isBot: true, isOwner: false, isBoosting: false, lastSeen: new Date(), messageCount: 5670, voiceMinutes: 0 }
]

const mockRoles: Role[] = [
  { id: 'r1', name: 'Owner', color: '#f59e0b', position: 5, memberCount: 1, permissions: ['all'], isHoisted: true, isMentionable: false, isManaged: false },
  { id: 'r2', name: 'Admin', color: '#ef4444', position: 4, memberCount: 2, permissions: ['manage_server', 'manage_channels', 'manage_roles', 'ban_members'], isHoisted: true, isMentionable: true, isManaged: false },
  { id: 'r3', name: 'Moderator', color: '#22c55e', position: 3, memberCount: 5, permissions: ['kick_members', 'mute_members', 'manage_messages'], isHoisted: true, isMentionable: true, isManaged: false },
  { id: 'r4', name: 'VIP', color: '#a855f7', position: 2, memberCount: 15, permissions: ['create_instant_invite', 'embed_links', 'attach_files'], isHoisted: true, isMentionable: true, isManaged: false },
  { id: 'r5', name: 'Booster', color: '#ec4899', position: 1, memberCount: 8, permissions: ['use_external_emojis', 'use_external_stickers'], isHoisted: true, isMentionable: false, isManaged: true },
  { id: 'r6', name: 'Member', color: '#6b7280', position: 0, memberCount: 1219, permissions: ['read', 'send_messages', 'add_reactions'], isHoisted: false, isMentionable: false, isManaged: false }
]

const mockEvents: Event[] = [
  { id: 'e1', name: 'Weekly Community Hangout', description: 'Join us for casual chat and games!', channelId: 'ch10', scheduledStart: new Date('2024-01-20T19:00:00'), scheduledEnd: new Date('2024-01-20T21:00:00'), entityType: 'voice', interestedCount: 45, creatorId: 'u1', creatorName: 'John Developer', status: 'scheduled' },
  { id: 'e2', name: 'Product Launch Stream', description: 'Watch the live reveal of our new features', channelId: 'ch13', scheduledStart: new Date('2024-01-25T18:00:00'), entityType: 'stage', interestedCount: 234, creatorId: 'u2', creatorName: 'Sarah Designer', status: 'scheduled' },
  { id: 'e3', name: 'Game Night: Among Us', description: 'Social deduction gaming night', scheduledStart: new Date('2024-01-22T20:00:00'), entityType: 'external', location: 'Among Us Lobby', interestedCount: 28, creatorId: 'u3', creatorName: 'Mike Engineer', status: 'scheduled' }
]

const mockBots: BotIntegration[] = [
  { id: 'bot1', name: 'FreeFlow Bot', avatar: 'bot', description: 'Official server bot for moderation and utilities', prefix: '!', isEnabled: true, permissions: ['manage_messages', 'ban_members', 'manage_roles'], commands: 45, usageCount: 12340, addedBy: 'John Developer', addedAt: new Date('2023-01-01') },
  { id: 'bot2', name: 'Music Bot', avatar: 'music', description: 'Play music in voice channels', prefix: '!m ', isEnabled: true, permissions: ['connect', 'speak'], commands: 15, usageCount: 5670, addedBy: 'Sarah Designer', addedAt: new Date('2023-03-15') },
  { id: 'bot3', name: 'Level Bot', avatar: 'level', description: 'XP and leveling system', prefix: '!lv ', isEnabled: true, permissions: ['manage_roles', 'send_messages'], commands: 12, usageCount: 8900, addedBy: 'John Developer', addedAt: new Date('2023-02-01') }
]

const mockModActions: ModAction[] = [
  { id: 'ma1', type: 'warn', targetId: 'u99', targetName: 'SpamUser123', moderatorId: 'u2', moderatorName: 'Sarah Designer', reason: 'Spamming in general chat', timestamp: new Date('2024-01-14T15:30:00') },
  { id: 'ma2', type: 'timeout', targetId: 'u98', targetName: 'ToxicPlayer', moderatorId: 'u3', moderatorName: 'Mike Engineer', reason: 'Harassment', duration: 3600, timestamp: new Date('2024-01-14T12:00:00') },
  { id: 'ma3', type: 'kick', targetId: 'u97', targetName: 'Advertiser', moderatorId: 'u2', moderatorName: 'Sarah Designer', reason: 'Unsolicited advertising', timestamp: new Date('2024-01-13T18:45:00') },
  { id: 'ma4', type: 'ban', targetId: 'u96', targetName: 'HackerAccount', moderatorId: 'u1', moderatorName: 'John Developer', reason: 'Phishing links', timestamp: new Date('2024-01-12T09:00:00') }
]

const serverBoost: ServerBoost = {
  level: 2,
  boostCount: 8,
  boostersCount: 6,
  perks: ['Animated Icon', '1080p Streaming', '50 Emoji Slots', '150 Sticker Slots', '50MB Upload Limit'],
  nextLevel: { required: 14, perks: ['Banner', 'Vanity URL', '100 Emoji Slots', '300 Sticker Slots'] }
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
  const [activeTab, setActiveTab] = useState('chat')
  const [selectedChannel, setSelectedChannel] = useState<Channel>(mockChannelCategories[1].channels[0])
  const [messageInput, setMessageInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<string[]>(mockChannelCategories.map(c => c.id))
  const [showCreateChannel, setShowCreateChannel] = useState(false)
  const [showMemberProfile, setShowMemberProfile] = useState(false)
  const [showServerSettings, setShowServerSettings] = useState(false)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [settingsTab, setSettingsTab] = useState('general')

  const stats: ServerStats = useMemo(() => ({
    totalMembers: 1250,
    onlineMembers: mockMembers.filter(m => m.status === 'online').length,
    totalChannels: mockChannelCategories.reduce((sum, cat) => sum + cat.channels.length, 0),
    totalMessages: mockMembers.reduce((sum, m) => sum + m.messageCount, 0),
    messagesThisWeek: 2847,
    newMembersThisWeek: 45,
    activeMembers: 156,
    boostLevel: serverBoost.level
  }), [])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId) ? prev.filter(c => c !== categoryId) : [...prev, categoryId]
    )
  }

  const handleSendMessage = useCallback(() => {
    if (!messageInput.trim()) return
    setMessageInput('')
  }, [messageInput])

  const handleViewMember = (member: Member) => {
    setSelectedMember(member)
    setShowMemberProfile(true)
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
        {mockEvents.filter(e => e.status === 'scheduled').length > 0 && (
          <div className="p-2 bg-violet-100 dark:bg-violet-900/30 border-b cursor-pointer hover:bg-violet-200 dark:hover:bg-violet-900/50" onClick={() => setShowEventDialog(true)}>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-violet-600" />
              <span className="font-medium text-violet-700 dark:text-violet-400">
                {mockEvents.filter(e => e.status === 'scheduled').length} Upcoming Events
              </span>
            </div>
          </div>
        )}

        {/* Channel List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {mockChannelCategories.map(category => (
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
              <Button variant="ghost" size="icon" className="h-8 w-8"><Mic className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8"><Headphones className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8"><Settings className="w-4 h-4" /></Button>
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
            <Button variant="ghost" size="icon"><Bell className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon"><Pin className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon"><Users className="w-4 h-4" /></Button>
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
                  {mockMessages.map(message => (
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
                        <Button variant="ghost" size="icon" className="h-7 w-7"><Smile className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7"><Reply className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
                  <Button variant="ghost" size="icon"><Plus className="w-5 h-5" /></Button>
                  <Input
                    placeholder={`Message #${selectedChannel.name}`}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 border-0 bg-transparent focus-visible:ring-0"
                  />
                  <Button variant="ghost" size="icon"><Gift className="w-5 h-5" /></Button>
                  <Button variant="ghost" size="icon"><ImageIcon className="w-5 h-5" /></Button>
                  <Button variant="ghost" size="icon"><Smile className="w-5 h-5" /></Button>
                </div>
              </div>
            </div>

            {/* Member Sidebar */}
            <div className="w-56 border-l bg-gray-50 dark:bg-gray-800/50 hidden lg:block">
              <ScrollArea className="h-full p-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Online — {mockMembers.filter(m => m.status === 'online').length}</h4>
                <div className="space-y-1 mb-4">
                  {mockMembers.filter(m => m.status === 'online').map(member => (
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
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Offline — {mockMembers.filter(m => m.status === 'offline').length}</h4>
                <div className="space-y-1 opacity-60">
                  {mockMembers.filter(m => m.status === 'offline').map(member => (
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
                    <p className="text-3xl font-bold">{mockMembers.length}</p>
                    <p className="text-indigo-200 text-sm">Members</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockMembers.filter(m => m.status === 'online').length}</p>
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
              <Button><UserPlus className="w-4 h-4 mr-2" />Invite Members</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockMembers.map(member => (
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
              <Button><Plus className="w-4 h-4 mr-2" />Create Event</Button>
            </div>
            <div className="grid gap-4">
              {mockEvents.map(event => (
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
                      <Button variant="outline">Interested</Button>
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
              <Button><Plus className="w-4 h-4 mr-2" />Create Role</Button>
            </div>
            <div className="space-y-3">
              {mockRoles.map(role => (
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
                      <Button variant="ghost" size="icon"><Settings className="w-4 h-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Moderation Tab */}
          <TabsContent value="moderation" className="flex-1 p-4 m-0 overflow-auto">
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">{mockModActions.filter(a => a.type === 'warn').length}</p>
                    <p className="text-sm text-gray-500">Warnings</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <VolumeX className="w-8 h-8 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{mockModActions.filter(a => a.type === 'mute' || a.type === 'timeout').length}</p>
                    <p className="text-sm text-gray-500">Mutes</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <UserX className="w-8 h-8 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold">{mockModActions.filter(a => a.type === 'kick').length}</p>
                    <p className="text-sm text-gray-500">Kicks</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Ban className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold">{mockModActions.filter(a => a.type === 'ban').length}</p>
                    <p className="text-sm text-gray-500">Bans</p>
                  </div>
                </div>
              </Card>
            </div>

            <Card>
              <CardHeader><CardTitle>Recent Moderation Actions</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockModActions.map(action => (
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
            <div className="grid grid-cols-4 gap-4 mb-6">
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

            <div className="grid grid-cols-2 gap-6">
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
                <div className="grid grid-cols-2 gap-4">
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
                        <div className="grid grid-cols-2 gap-6">
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
                          <div>
                            <p className="font-medium">Community Mode</p>
                            <p className="text-sm text-gray-500">Enable community features like discovery</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Discoverable</p>
                            <p className="text-sm text-gray-500">Allow users to find this server</p>
                          </div>
                          <Switch defaultChecked />
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
                          <div>
                            <p className="font-medium">Explicit Content Filter</p>
                            <p className="text-sm text-gray-500">Scan media from members without roles</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">2FA Requirement</p>
                            <p className="text-sm text-gray-500">Require 2FA for moderation actions</p>
                          </div>
                          <Switch />
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
                          <div>
                            <p className="font-medium">Block Spam</p>
                            <p className="text-sm text-gray-500">Automatically delete spam messages</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Block Harmful Links</p>
                            <p className="text-sm text-gray-500">Remove phishing and malware links</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Block Keyword Phrases</p>
                            <p className="text-sm text-gray-500">Filter specific words or phrases</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Block Mention Spam</p>
                            <p className="text-sm text-gray-500">Limit mass @mentions</p>
                          </div>
                          <Switch defaultChecked />
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
                        <div className="grid grid-cols-2 gap-4">
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
                          <div>
                            <p className="font-medium">Log Mod Actions</p>
                            <p className="text-sm text-gray-500">Record all moderation actions</p>
                          </div>
                          <Switch defaultChecked />
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
                          <div>
                            <p className="font-medium">Mobile Push Notifications</p>
                            <p className="text-sm text-gray-500">Send notifications to mobile devices</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Suppress @everyone</p>
                            <p className="text-sm text-gray-500">Disable @everyone and @here by default</p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Role Mention Highlighting</p>
                            <p className="text-sm text-gray-500">Highlight when your role is mentioned</p>
                          </div>
                          <Switch defaultChecked />
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
                          <div>
                            <p className="font-medium">New Member Joins</p>
                            <p className="text-sm text-gray-500">Alert when new members join</p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Member Reports</p>
                            <p className="text-sm text-gray-500">Alert on user reports</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Server Boost Changes</p>
                            <p className="text-sm text-gray-500">Alert on boost level changes</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Security Alerts</p>
                            <p className="text-sm text-gray-500">Notify on suspicious activity</p>
                          </div>
                          <Switch defaultChecked />
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
                          { id: 'view', label: 'View Channels', desc: 'Allow viewing text and voice channels', default: true },
                          { id: 'send', label: 'Send Messages', desc: 'Allow sending messages in channels', default: true },
                          { id: 'react', label: 'Add Reactions', desc: 'Allow adding emoji reactions', default: true },
                          { id: 'voice', label: 'Connect to Voice', desc: 'Allow joining voice channels', default: true },
                          { id: 'speak', label: 'Speak in Voice', desc: 'Allow speaking in voice channels', default: true },
                          { id: 'embed', label: 'Embed Links', desc: 'Allow embedding links and previews', default: false },
                          { id: 'attach', label: 'Attach Files', desc: 'Allow uploading files', default: false },
                          { id: 'mention', label: 'Mention @everyone', desc: 'Allow mentioning everyone', default: false }
                        ].map(perm => (
                          <div key={perm.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <p className="font-medium">{perm.label}</p>
                              <p className="text-sm text-gray-500">{perm.desc}</p>
                            </div>
                            <Switch defaultChecked={perm.default} />
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
                        {mockRoles.map(role => (
                          <div key={role.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: role.color }} />
                              <span className="font-medium" style={{ color: role.color }}>{role.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">{role.memberCount} members</span>
                              <Button variant="ghost" size="icon"><Settings className="w-4 h-4" /></Button>
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
                        {mockBots.map(bot => (
                          <div key={bot.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-4">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={`https://avatar.vercel.sh/${bot.avatar}`} />
                                <AvatarFallback>{bot.name.slice(0, 2)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{bot.name}</p>
                                <p className="text-sm text-gray-500">{bot.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge variant="outline">{bot.commands} commands</Badge>
                              <Switch checked={bot.isEnabled} />
                            </div>
                          </div>
                        ))}

                        <Button variant="outline" className="w-full">
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

                        <Button variant="outline" className="w-full">
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
                          <div>
                            <p className="font-medium">Raid Protection</p>
                            <p className="text-sm text-gray-500">Detect and prevent raid attacks</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Suspicious Account Detection</p>
                            <p className="text-sm text-gray-500">Flag newly created accounts</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Anti-Scam Protection</p>
                            <p className="text-sm text-gray-500">Block known scam patterns</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">DM Spam Protection</p>
                            <p className="text-sm text-gray-500">Protect members from DM spam</p>
                          </div>
                          <Switch />
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
                          <div>
                            <p className="font-medium">Audit Log Retention</p>
                            <p className="text-sm text-gray-500">Keep detailed audit logs</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <Button variant="outline" className="w-full">
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

                        <div className="grid grid-cols-3 gap-4">
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
                          <Button variant="destructive" size="sm">Prune</Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Delete All Messages</p>
                            <p className="text-sm text-red-600 dark:text-red-500">Clear all server message history</p>
                          </div>
                          <Button variant="destructive" size="sm">Delete All</Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Delete Server</p>
                            <p className="text-sm text-red-600 dark:text-red-500">Permanently delete this server</p>
                          </div>
                          <Button variant="destructive" size="sm">Delete Server</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
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
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"><p className="text-sm text-gray-500">Status</p><p className="font-medium capitalize">{selectedMember.status}</p></div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"><p className="text-sm text-gray-500">Joined</p><p className="font-medium">{selectedMember.joinedAt.toLocaleDateString()}</p></div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"><p className="text-sm text-gray-500">Messages</p><p className="font-medium">{selectedMember.messageCount.toLocaleString()}</p></div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"><p className="text-sm text-gray-500">Voice Time</p><p className="font-medium">{Math.floor(selectedMember.voiceMinutes / 60)}h</p></div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1"><MessageSquare className="w-4 h-4 mr-2" />Message</Button>
                <Button variant="outline"><UserPlus className="w-4 h-4" /></Button>
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
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[{ type: 'text', icon: <Hash />, label: 'Text' }, { type: 'voice', icon: <Volume2 />, label: 'Voice' }, { type: 'forum', icon: <MessageCircle />, label: 'Forum' }, { type: 'announcement', icon: <Megaphone />, label: 'Announcement' }].map(item => (
                  <button key={item.type} className="p-3 border rounded-lg hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center gap-2">{item.icon}{item.label}</button>
                ))}
              </div>
            </div>
            <div><Label>Channel Name</Label><Input placeholder="new-channel" className="mt-1" /></div>
            <div className="flex items-center gap-2"><Switch id="private" /><Label htmlFor="private">Private Channel</Label></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowCreateChannel(false)}>Cancel</Button><Button className="bg-orange-500 hover:bg-orange-600">Create Channel</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
