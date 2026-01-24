'use client'

import { createClient } from '@/lib/supabase/client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

// Auth hooks
import { useAuthUserId } from '@/lib/hooks/use-auth-user-id'

// Real-time team collaboration API hooks
import {
  useTeamMembers,
  useTeamStats,
  useCreateTeamMember,
  useUpdateTeamMember,
  useDeleteTeamMember,
  useSendInvitation,
  useTeamInvitations,
  useConversations,
  useMessagingStats,
  useSendMessage,
  useNotifications,
  useEvents,
  useCreateEvent
} from '@/lib/api-clients'

// Extended hooks for additional data
import { useTeamActivity, useTeamMeetings } from '@/lib/hooks/use-team-extended'
import { useCollaborationChannels, useCollaborationMessages } from '@/lib/hooks/use-collaboration-extended'
import { useWorkflows } from '@/lib/hooks/use-workflows'
import { useIntegrationMarketplace } from '@/lib/hooks/use-integration-extended'
import { useNotificationQueue } from '@/lib/hooks/use-notification-extended'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Users,
  Plus,
  Search,
  UserPlus,
  Mail,
  MessageSquare,
  Calendar,
  Award,
  Clock,
  Settings,
  Star,
  Hash,
  AtSign,
  Bell,
  Video,
  Phone,
  Smile,
  MoreVertical,
  Filter,
  Circle,
  Shield,
  Crown,
  UserCheck,
  Globe,
  Lock,
  Pin,
  Trash2,
  Copy,
  ExternalLink,
  Folder,
  FileText,
  Headphones,
  VolumeX,
  Bookmark,
  MessageCircle,
  Download,
  Layers,
  Workflow,
  BellOff,
  RefreshCw,
  FileCode,
  Eye,
  AlertCircle,
  Sliders,
  Webhook,
  Key,
  Database,
  Terminal,
  AlertTriangle,
  Loader2
} from 'lucide-react'

// Competitive Upgrade Components
import {
  AIInsightsPanel,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'


// Types
type MemberStatus = 'online' | 'away' | 'dnd' | 'offline' | 'in-meeting'
type MemberRole = 'owner' | 'admin' | 'member' | 'guest' | 'single-channel-guest'
type ChannelType = 'public' | 'private' | 'direct' | 'group-dm' | 'shared'
type MessageType = 'text' | 'file' | 'image' | 'code' | 'system' | 'poll' | 'canvas'
type ActivityType = 'message' | 'mention' | 'reaction' | 'join' | 'leave' | 'file' | 'huddle' | 'workflow' | 'app'
type HuddleStatus = 'active' | 'ended' | 'scheduled'
type AppCategory = 'productivity' | 'communication' | 'developer' | 'analytics' | 'hr' | 'sales' | 'marketing' | 'support'
type WorkflowTrigger = 'channel_message' | 'emoji_reaction' | 'new_member' | 'scheduled' | 'webhook' | 'shortcut'
type ReminderStatus = 'pending' | 'completed' | 'snoozed'
type NotificationLevel = 'all' | 'mentions' | 'nothing'

interface TeamMember {
  id: string
  name: string
  displayName: string
  email: string
  avatar: string
  role: MemberRole
  jobTitle: string
  department: string
  status: MemberStatus
  statusMessage: string
  statusEmoji: string
  statusExpiry: string | null
  timezone: string
  localTime: string
  joinedAt: string
  lastActive: string
  tasksCompleted: number
  projectsCount: number
  performanceScore: number
  isLead: boolean
  phone: string
  slackConnect: boolean
  customFields: { label: string; value: string }[]
}

interface Channel {
  id: string
  name: string
  type: ChannelType
  description: string
  topic: string
  memberCount: number
  unreadCount: number
  mentionCount: number
  isPinned: boolean
  isMuted: boolean
  isArchived: boolean
  isStarred: boolean
  lastMessage: string
  lastMessageAt: string
  createdBy: string
  createdAt: string
  retentionDays: number | null
  canvasCount: number
  bookmarkCount: number
  notificationLevel: NotificationLevel
  externalConnections: string[]
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
  editedAt: string | null
  reactions: Reaction[]
  replies: Reply[]
  replyCount: number
  isPinned: boolean
  isBookmarked: boolean
  isScheduled: boolean
  scheduledFor: string | null
  attachments: Attachment[]
  mentions: string[]
  links: LinkPreview[]
  codeSnippet: CodeSnippet | null
  poll: Poll | null
}

interface Reply {
  id: string
  content: string
  senderId: string
  senderName: string
  senderAvatar: string
  timestamp: string
  reactions: Reaction[]
}

interface Reaction {
  emoji: string
  count: number
  users: string[]
  isCustom: boolean
}

interface Attachment {
  id: string
  name: string
  type: string
  size: number
  url: string
  thumbnailUrl: string | null
  downloadCount: number
}

interface LinkPreview {
  url: string
  title: string
  description: string
  image: string | null
  favicon: string | null
}

interface CodeSnippet {
  language: string
  code: string
  filename: string
}

interface Poll {
  question: string
  options: { text: string; votes: number; voters: string[] }[]
  isAnonymous: boolean
  expiresAt: string | null
  allowMultiple: boolean
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
  channelId: string
  metadata: Record<string, unknown>
}

interface Huddle {
  id: string
  channelId: string
  channelName: string
  status: HuddleStatus
  startedAt: string
  duration: number
  participants: { userId: string; name: string; avatar: string; isSpeaking: boolean; isMuted: boolean; hasVideo: boolean }[]
  isRecording: boolean
  hasScreenShare: boolean
}

interface SlackApp {
  id: string
  name: string
  icon: string
  category: AppCategory
  description: string
  developer: string
  isInstalled: boolean
  isEnabled: boolean
  permissions: string[]
  webhookCount: number
  lastActivity: string
  rating: number
  installCount: number
}

interface SlackWorkflow {
  id: string
  name: string
  description: string
  trigger: WorkflowTrigger
  triggerChannel: string | null
  steps: WorkflowStep[]
  isEnabled: boolean
  createdBy: string
  createdAt: string
  runCount: number
  lastRun: string | null
  errorCount: number
}

interface WorkflowStep {
  id: string
  type: 'send_message' | 'create_channel' | 'add_reaction' | 'collect_info' | 'webhook' | 'delay' | 'condition'
  config: Record<string, unknown>
  order: number
}

interface Reminder {
  id: string
  text: string
  createdAt: string
  remindAt: string
  status: ReminderStatus
  channelId: string | null
  messageId: string | null
  isRecurring: boolean
  recurringPattern: string | null
}

interface SavedItem {
  id: string
  type: 'message' | 'file' | 'channel' | 'canvas'
  title: string
  preview: string
  savedAt: string
  channelName: string
  sourceUrl: string
}

interface Canvas {
  id: string
  title: string
  content: string
  channelId: string
  createdBy: string
  createdAt: string
  lastEditedBy: string
  lastEditedAt: string
  collaborators: string[]
  isPublished: boolean
}

interface UserGroup {
  id: string
  handle: string
  name: string
  description: string
  memberCount: number
  members: string[]
  createdBy: string
  isDefault: boolean
}

interface SearchResult {
  id: string
  type: 'message' | 'file' | 'channel' | 'member'
  title: string
  preview: string
  timestamp: string
  channelName: string
  highlights: string[]
}

// Mock Data
const mockMembers: TeamMember[] = [
  { id: '1', name: 'Sarah Johnson', displayName: 'sarah', email: 'sarah@example.com', avatar: '/avatars/sarah.jpg', role: 'owner', jobTitle: 'CEO', department: 'Executive', status: 'online', statusMessage: 'Working on Q1 strategy', statusEmoji: '📊', statusExpiry: null, timezone: 'America/New_York', localTime: '12:30 PM', joinedAt: '2022-01-15', lastActive: '2024-01-15T12:30:00Z', tasksCompleted: 156, projectsCount: 12, performanceScore: 98, isLead: true, phone: '+1 555-0101', slackConnect: true, customFields: [{ label: 'Pronouns', value: 'she/her' }] },
  { id: '2', name: 'Mike Chen', displayName: 'mike.chen', email: 'mike@example.com', avatar: '/avatars/mike.jpg', role: 'admin', jobTitle: 'CTO', department: 'Engineering', status: 'in-meeting', statusMessage: 'In standup', statusEmoji: '🎯', statusExpiry: '2024-01-15T13:00:00Z', timezone: 'America/Los_Angeles', localTime: '9:30 AM', joinedAt: '2022-02-20', lastActive: '2024-01-15T12:25:00Z', tasksCompleted: 234, projectsCount: 8, performanceScore: 95, isLead: true, phone: '+1 555-0102', slackConnect: true, customFields: [] },
  { id: '3', name: 'Emily Davis', displayName: 'emily', email: 'emily@example.com', avatar: '/avatars/emily.jpg', role: 'admin', jobTitle: 'Design Lead', department: 'Design', status: 'away', statusMessage: 'Coffee break', statusEmoji: '☕', statusExpiry: '2024-01-15T12:45:00Z', timezone: 'Europe/London', localTime: '5:30 PM', joinedAt: '2022-03-10', lastActive: '2024-01-15T12:00:00Z', tasksCompleted: 189, projectsCount: 15, performanceScore: 92, isLead: true, phone: '+44 20 7946 0958', slackConnect: false, customFields: [{ label: 'Pronouns', value: 'she/her' }] },
  { id: '4', name: 'Alex Rivera', displayName: 'alex.r', email: 'alex@example.com', avatar: '/avatars/alex.jpg', role: 'member', jobTitle: 'Senior Developer', department: 'Engineering', status: 'dnd', statusMessage: 'Deep work until 3pm', statusEmoji: '🔕', statusExpiry: '2024-01-15T15:00:00Z', timezone: 'America/Chicago', localTime: '11:30 AM', joinedAt: '2022-05-15', lastActive: '2024-01-15T11:45:00Z', tasksCompleted: 312, projectsCount: 6, performanceScore: 94, isLead: false, phone: '+1 555-0104', slackConnect: false, customFields: [] },
  { id: '5', name: 'Jordan Lee', displayName: 'jordan', email: 'jordan@example.com', avatar: '/avatars/jordan.jpg', role: 'member', jobTitle: 'Product Manager', department: 'Product', status: 'online', statusMessage: '', statusEmoji: '', statusExpiry: null, timezone: 'America/New_York', localTime: '12:30 PM', joinedAt: '2022-06-20', lastActive: '2024-01-15T12:28:00Z', tasksCompleted: 145, projectsCount: 4, performanceScore: 88, isLead: false, phone: '+1 555-0105', slackConnect: true, customFields: [] },
  { id: '6', name: 'Chris Taylor', displayName: 'chris.t', email: 'chris@example.com', avatar: '/avatars/chris.jpg', role: 'member', jobTitle: 'Marketing Manager', department: 'Marketing', status: 'offline', statusMessage: '', statusEmoji: '', statusExpiry: null, timezone: 'Europe/Paris', localTime: '6:30 PM', joinedAt: '2022-08-01', lastActive: '2024-01-14T18:00:00Z', tasksCompleted: 98, projectsCount: 3, performanceScore: 85, isLead: false, phone: '+33 1 42 68 53 00', slackConnect: false, customFields: [] },
  { id: '7', name: 'Sam Wilson', displayName: 'sam.w', email: 'sam@partner.com', avatar: '/avatars/sam.jpg', role: 'guest', jobTitle: 'Contractor', department: 'Engineering', status: 'online', statusMessage: 'Available for questions', statusEmoji: '💬', statusExpiry: null, timezone: 'Asia/Tokyo', localTime: '2:30 AM', joinedAt: '2024-01-01', lastActive: '2024-01-15T12:20:00Z', tasksCompleted: 23, projectsCount: 1, performanceScore: 90, isLead: false, phone: '+81 3-1234-5678', slackConnect: true, customFields: [{ label: 'Company', value: 'TechPartners Inc' }] }
]

const mockChannels: Channel[] = [
  { id: '1', name: 'general', type: 'public', description: 'Company-wide announcements and work-based matters', topic: 'Welcome to FreeFlow! 🎉', memberCount: 45, unreadCount: 3, mentionCount: 1, isPinned: true, isMuted: false, isArchived: false, isStarred: true, lastMessage: 'Welcome to the new quarter!', lastMessageAt: '2024-01-15T12:00:00Z', createdBy: 'Sarah Johnson', createdAt: '2022-01-15', retentionDays: null, canvasCount: 2, bookmarkCount: 5, notificationLevel: 'all', externalConnections: [] },
  { id: '2', name: 'engineering', type: 'public', description: 'Engineering team discussions and technical updates', topic: 'Code reviews needed for Q1 sprint', memberCount: 18, unreadCount: 12, mentionCount: 3, isPinned: true, isMuted: false, isArchived: false, isStarred: false, lastMessage: 'PR review needed for feature branch', lastMessageAt: '2024-01-15T12:25:00Z', createdBy: 'Mike Chen', createdAt: '2022-01-20', retentionDays: 365, canvasCount: 8, bookmarkCount: 12, notificationLevel: 'mentions', externalConnections: [] },
  { id: '3', name: 'design', type: 'public', description: 'Design team collaboration and creative discussions', topic: 'New brand guidelines live! 🎨', memberCount: 8, unreadCount: 5, mentionCount: 0, isPinned: false, isMuted: false, isArchived: false, isStarred: true, lastMessage: 'New mockups ready for review', lastMessageAt: '2024-01-15T11:30:00Z', createdBy: 'Emily Davis', createdAt: '2022-02-01', retentionDays: null, canvasCount: 15, bookmarkCount: 8, notificationLevel: 'all', externalConnections: [] },
  { id: '4', name: 'product', type: 'public', description: 'Product discussions and roadmap planning', topic: 'Q2 planning in progress', memberCount: 12, unreadCount: 0, mentionCount: 0, isPinned: false, isMuted: false, isArchived: false, isStarred: false, lastMessage: 'Q2 roadmap draft shared', lastMessageAt: '2024-01-15T10:00:00Z', createdBy: 'Jordan Lee', createdAt: '2022-03-01', retentionDays: null, canvasCount: 4, bookmarkCount: 3, notificationLevel: 'all', externalConnections: [] },
  { id: '5', name: 'leadership', type: 'private', description: 'Leadership team only - confidential discussions', topic: 'Weekly sync Tuesdays 10am', memberCount: 5, unreadCount: 2, mentionCount: 2, isPinned: true, isMuted: false, isArchived: false, isStarred: false, lastMessage: 'Budget review meeting tomorrow', lastMessageAt: '2024-01-15T09:00:00Z', createdBy: 'Sarah Johnson', createdAt: '2022-01-15', retentionDays: 90, canvasCount: 3, bookmarkCount: 6, notificationLevel: 'all', externalConnections: [] },
  { id: '6', name: 'random', type: 'public', description: 'Non-work banter and water cooler chat', topic: 'Keep it fun! 🎮', memberCount: 42, unreadCount: 8, mentionCount: 0, isPinned: false, isMuted: true, isArchived: false, isStarred: false, lastMessage: 'Anyone tried the new coffee machine?', lastMessageAt: '2024-01-15T12:15:00Z', createdBy: 'Chris Taylor', createdAt: '2022-01-16', retentionDays: 30, canvasCount: 0, bookmarkCount: 2, notificationLevel: 'nothing', externalConnections: [] },
  { id: '7', name: 'ext-techpartners', type: 'shared', description: 'Slack Connect with TechPartners Inc', topic: 'Q1 collaboration project', memberCount: 8, unreadCount: 1, mentionCount: 0, isPinned: false, isMuted: false, isArchived: false, isStarred: false, lastMessage: 'API docs updated', lastMessageAt: '2024-01-15T11:00:00Z', createdBy: 'Mike Chen', createdAt: '2024-01-01', retentionDays: null, canvasCount: 1, bookmarkCount: 4, notificationLevel: 'all', externalConnections: ['TechPartners Inc'] }
]

const mockMessages: Message[] = [
  { id: '1', content: 'Hey team! Just pushed the new feature to staging. Can someone review? :eyes:', type: 'text', senderId: '4', senderName: 'Alex Rivera', senderAvatar: '/avatars/alex.jpg', channelId: '2', timestamp: '2024-01-15T12:25:00Z', editedAt: null, reactions: [{ emoji: '👍', count: 3, users: ['1', '2', '5'], isCustom: false }, { emoji: '🎉', count: 2, users: ['3', '6'], isCustom: false }], replies: [{ id: 'r1', content: 'On it!', senderId: '2', senderName: 'Mike Chen', senderAvatar: '/avatars/mike.jpg', timestamp: '2024-01-15T12:26:00Z', reactions: [] }], replyCount: 4, isPinned: false, isBookmarked: false, isScheduled: false, scheduledFor: null, attachments: [], mentions: [], links: [], codeSnippet: null, poll: null },
  { id: '2', content: 'Will check in 10 minutes. Just finishing up my current task.', type: 'text', senderId: '2', senderName: 'Mike Chen', senderAvatar: '/avatars/mike.jpg', channelId: '2', timestamp: '2024-01-15T12:26:00Z', editedAt: null, reactions: [], replies: [], replyCount: 0, isPinned: false, isBookmarked: false, isScheduled: false, scheduledFor: null, attachments: [], mentions: [], links: [], codeSnippet: null, poll: null },
  { id: '3', content: 'New design mockups for the dashboard refresh', type: 'file', senderId: '3', senderName: 'Emily Davis', senderAvatar: '/avatars/emily.jpg', channelId: '3', timestamp: '2024-01-15T11:30:00Z', editedAt: null, reactions: [{ emoji: '❤️', count: 5, users: ['1', '2', '4', '5', '6'], isCustom: false }, { emoji: '🔥', count: 3, users: ['1', '2', '7'], isCustom: false }], replies: [], replyCount: 8, isPinned: true, isBookmarked: true, isScheduled: false, scheduledFor: null, attachments: [{ id: '1', name: 'dashboard-v2.fig', type: 'figma', size: 2500000, url: '/files/dashboard.fig', thumbnailUrl: '/thumbs/dashboard.png', downloadCount: 12 }], mentions: ['@design-team'], links: [], codeSnippet: null, poll: null },
  { id: '4', content: ':mega: Reminder: All-hands meeting at 3pm EST today!', type: 'system', senderId: '1', senderName: 'Sarah Johnson', senderAvatar: '/avatars/sarah.jpg', channelId: '1', timestamp: '2024-01-15T12:00:00Z', editedAt: null, reactions: [{ emoji: '✅', count: 12, users: [], isCustom: false }], replies: [], replyCount: 2, isPinned: true, isBookmarked: false, isScheduled: false, scheduledFor: null, attachments: [], mentions: ['@channel'], links: [], codeSnippet: null, poll: null },
  { id: '5', content: 'Here\'s the updated API endpoint', type: 'code', senderId: '4', senderName: 'Alex Rivera', senderAvatar: '/avatars/alex.jpg', channelId: '2', timestamp: '2024-01-15T11:00:00Z', editedAt: '2024-01-15T11:05:00Z', reactions: [{ emoji: '👀', count: 2, users: ['2', '7'], isCustom: false }], replies: [], replyCount: 3, isPinned: false, isBookmarked: true, isScheduled: false, scheduledFor: null, attachments: [], mentions: [], links: [], codeSnippet: { language: 'typescript', code: 'export async function getUser(id: string) {\n  return await db.users.findUnique({ where: { id } })\n}', filename: 'user-api.ts' }, poll: null },
  { id: '6', content: 'Quick poll: When should we schedule the team lunch?', type: 'poll', senderId: '5', senderName: 'Jordan Lee', senderAvatar: '/avatars/jordan.jpg', channelId: '1', timestamp: '2024-01-15T10:00:00Z', editedAt: null, reactions: [], replies: [], replyCount: 5, isPinned: false, isBookmarked: false, isScheduled: false, scheduledFor: null, attachments: [], mentions: [], links: [], codeSnippet: null, poll: { question: 'When should we schedule the team lunch?', options: [{ text: 'Friday 12pm', votes: 8, voters: ['1', '2', '3', '4', '5', '6', '7', '1'] }, { text: 'Friday 1pm', votes: 4, voters: ['2', '3', '5', '6'] }, { text: 'Next Monday 12pm', votes: 2, voters: ['4', '7'] }], isAnonymous: false, expiresAt: '2024-01-16T12:00:00Z', allowMultiple: false } }
]

const mockActivities: Activity[] = [
  { id: '1', type: 'message', userId: '4', userName: 'Alex Rivera', userAvatar: '/avatars/alex.jpg', content: 'Posted in #engineering', timestamp: '2024-01-15T12:25:00Z', channelName: 'engineering', channelId: '2', metadata: {} },
  { id: '2', type: 'mention', userId: '2', userName: 'Mike Chen', userAvatar: '/avatars/mike.jpg', content: 'Mentioned you in a thread', timestamp: '2024-01-15T12:20:00Z', channelName: 'engineering', channelId: '2', metadata: { messageId: '1' } },
  { id: '3', type: 'huddle', userId: '3', userName: 'Emily Davis', userAvatar: '/avatars/emily.jpg', content: 'Started a huddle', timestamp: '2024-01-15T12:15:00Z', channelName: 'design', channelId: '3', metadata: { huddleId: 'h1' } },
  { id: '4', type: 'workflow', userId: '1', userName: 'Sarah Johnson', userAvatar: '/avatars/sarah.jpg', content: 'New hire onboarding triggered', timestamp: '2024-01-15T11:00:00Z', channelName: 'general', channelId: '1', metadata: { workflowId: 'w1' } },
  { id: '5', type: 'file', userId: '3', userName: 'Emily Davis', userAvatar: '/avatars/emily.jpg', content: 'Shared dashboard-v2.fig', timestamp: '2024-01-15T11:30:00Z', channelName: 'design', channelId: '3', metadata: { fileId: 'f1' } }
]

const mockHuddles: Huddle[] = [
  { id: 'h1', channelId: '3', channelName: 'design', status: 'active', startedAt: '2024-01-15T12:15:00Z', duration: 15, participants: [{ userId: '3', name: 'Emily Davis', avatar: '/avatars/emily.jpg', isSpeaking: true, isMuted: false, hasVideo: false }, { userId: '5', name: 'Jordan Lee', avatar: '/avatars/jordan.jpg', isSpeaking: false, isMuted: true, hasVideo: false }], isRecording: false, hasScreenShare: true },
  { id: 'h2', channelId: '2', channelName: 'engineering', status: 'scheduled', startedAt: '2024-01-15T14:00:00Z', duration: 0, participants: [], isRecording: false, hasScreenShare: false }
]

const mockApps: SlackApp[] = [
  { id: 'a1', name: 'GitHub', icon: '🐙', category: 'developer', description: 'Get updates from GitHub repos directly in Slack', developer: 'GitHub, Inc.', isInstalled: true, isEnabled: true, permissions: ['read_channels', 'write_messages'], webhookCount: 5, lastActivity: '2024-01-15T12:00:00Z', rating: 4.8, installCount: 150000 },
  { id: 'a2', name: 'Google Calendar', icon: '📅', category: 'productivity', description: 'Sync your calendar and get meeting reminders', developer: 'Google LLC', isInstalled: true, isEnabled: true, permissions: ['read_channels', 'read_users'], webhookCount: 2, lastActivity: '2024-01-15T11:00:00Z', rating: 4.6, installCount: 200000 },
  { id: 'a3', name: 'Jira Cloud', icon: '📋', category: 'productivity', description: 'Create and manage Jira issues from Slack', developer: 'Atlassian', isInstalled: true, isEnabled: true, permissions: ['read_channels', 'write_messages', 'read_users'], webhookCount: 8, lastActivity: '2024-01-15T12:20:00Z', rating: 4.5, installCount: 180000 },
  { id: 'a4', name: 'Figma', icon: '🎨', category: 'productivity', description: 'Share and preview Figma designs in channels', developer: 'Figma, Inc.', isInstalled: true, isEnabled: true, permissions: ['read_channels', 'write_messages'], webhookCount: 3, lastActivity: '2024-01-15T11:30:00Z', rating: 4.7, installCount: 120000 },
  { id: 'a5', name: 'Salesforce', icon: '☁️', category: 'sales', description: 'Connect Salesforce to collaborate on deals', developer: 'Salesforce', isInstalled: false, isEnabled: false, permissions: [], webhookCount: 0, lastActivity: '', rating: 4.4, installCount: 95000 },
  { id: 'a6', name: 'Zendesk', icon: '🎫', category: 'support', description: 'Manage support tickets from Slack', developer: 'Zendesk', isInstalled: true, isEnabled: false, permissions: ['read_channels'], webhookCount: 1, lastActivity: '2024-01-10T09:00:00Z', rating: 4.3, installCount: 85000 }
]

const mockWorkflows: SlackWorkflow[] = [
  { id: 'w1', name: 'New Hire Onboarding', description: 'Welcome new team members and share resources', trigger: 'new_member', triggerChannel: '1', steps: [{ id: 's1', type: 'send_message', config: { message: 'Welcome to the team!' }, order: 1 }, { id: 's2', type: 'add_reaction', config: { emoji: '👋' }, order: 2 }], isEnabled: true, createdBy: 'Sarah Johnson', createdAt: '2023-06-01', runCount: 45, lastRun: '2024-01-10', errorCount: 0 },
  { id: 'w2', name: 'PR Review Reminder', description: 'Remind about pending PR reviews daily', trigger: 'scheduled', triggerChannel: '2', steps: [{ id: 's1', type: 'webhook', config: { url: '/api/github/pending-prs' }, order: 1 }, { id: 's2', type: 'send_message', config: { template: 'pr_reminder' }, order: 2 }], isEnabled: true, createdBy: 'Mike Chen', createdAt: '2023-08-15', runCount: 120, lastRun: '2024-01-15', errorCount: 2 },
  { id: 'w3', name: 'Bug Report Triage', description: 'Auto-categorize and assign bug reports', trigger: 'emoji_reaction', triggerChannel: null, steps: [{ id: 's1', type: 'collect_info', config: { fields: ['severity', 'component'] }, order: 1 }, { id: 's2', type: 'create_channel', config: { prefix: 'bug-' }, order: 2 }], isEnabled: false, createdBy: 'Alex Rivera', createdAt: '2023-11-20', runCount: 23, lastRun: '2024-01-05', errorCount: 5 }
]

const mockReminders: Reminder[] = [
  { id: 'r1', text: 'Review Q1 budget proposal', createdAt: '2024-01-14T10:00:00Z', remindAt: '2024-01-15T14:00:00Z', status: 'pending', channelId: '5', messageId: null, isRecurring: false, recurringPattern: null },
  { id: 'r2', text: 'Submit weekly report', createdAt: '2024-01-08T09:00:00Z', remindAt: '2024-01-15T17:00:00Z', status: 'pending', channelId: null, messageId: null, isRecurring: true, recurringPattern: 'Every Friday at 5pm' },
  { id: 'r3', text: 'Follow up on API documentation', createdAt: '2024-01-12T11:00:00Z', remindAt: '2024-01-15T10:00:00Z', status: 'completed', channelId: '2', messageId: 'm5', isRecurring: false, recurringPattern: null }
]

const mockSavedItems: SavedItem[] = [
  { id: 's1', type: 'message', title: 'API endpoint update', preview: 'Here\'s the updated API endpoint...', savedAt: '2024-01-15T11:05:00Z', channelName: 'engineering', sourceUrl: '/channels/2/messages/5' },
  { id: 's2', type: 'file', title: 'dashboard-v2.fig', preview: 'Design mockups for dashboard refresh', savedAt: '2024-01-15T11:35:00Z', channelName: 'design', sourceUrl: '/files/f1' },
  { id: 's3', type: 'canvas', title: 'Q1 OKRs', preview: 'Company objectives and key results...', savedAt: '2024-01-10T09:00:00Z', channelName: 'leadership', sourceUrl: '/canvas/c1' }
]

const mockUserGroups: UserGroup[] = [
  { id: 'ug1', handle: 'design-team', name: 'Design Team', description: 'All design team members', memberCount: 8, members: ['3'], createdBy: 'Emily Davis', isDefault: false },
  { id: 'ug2', handle: 'engineering', name: 'Engineering', description: 'Engineering department', memberCount: 18, members: ['2', '4', '7'], createdBy: 'Mike Chen', isDefault: false },
  { id: 'ug3', handle: 'leadership', name: 'Leadership', description: 'Company leadership', memberCount: 5, members: ['1', '2', '3'], createdBy: 'Sarah Johnson', isDefault: true }
]

// Database Types
interface DbTeamMember {
  id: string
  user_id: string
  name: string
  email: string
  avatar: string | null
  bio: string | null
  role: string
  role_level: string
  department: string
  phone: string | null
  location: string | null
  timezone: string
  status: string
  availability: string
  last_seen: string | null
  skills: string[]
  start_date: string | null
  projects_count: number
  tasks_completed: number
  rating: number
  settings: Record<string, unknown>
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export default function TeamHubClient() {
  // Define adapter variables locally (removed mock data imports)
  const teamHubAIInsights: any[] = []
  const teamHubPredictions: any[] = []
  const teamHubActivities: any[] = []
  const teamHubQuickActions: any[] = []

  // ==========================================================================
  // AUTHENTICATION - Get user ID for backend queries
  // ==========================================================================
  const { getUserId } = useAuthUserId()
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    getUserId().then(id => setUserId(id))
  }, [getUserId])

  // ==========================================================================
  // REAL-TIME TEAM COLLABORATION HOOKS - Wired to Supabase APIs
  // ==========================================================================

  // Team members from API with real-time sync
  const { data: apiTeamMembersData, isLoading: isLoadingApiTeam } = useTeamMembers()
  const { data: apiTeamStatsData } = useTeamStats()
  const createTeamMemberApi = useCreateTeamMember()
  const updateTeamMemberApi = useUpdateTeamMember()
  const deleteTeamMemberApi = useDeleteTeamMember()
  const sendInvitationApi = useSendInvitation()
  const { data: invitationsData } = useTeamInvitations()

  // Messaging/Chat from API
  const { data: conversationsData } = useConversations()
  const { data: messagingStatsData } = useMessagingStats()
  const sendMessageApi = useSendMessage()

  // Calendar events for huddles/meetings
  const { data: eventsData } = useEvents()
  const createEventApi = useCreateEvent()

  // Notifications for real-time updates
  const { data: notificationsData } = useNotifications()

  // Extended hooks for additional data (using userId)
  const { data: teamActivityData } = useTeamActivity(userId || undefined)
  const { data: teamMeetingsData } = useTeamMeetings(userId || undefined)
  const { data: collaborationChannelsData } = useCollaborationChannels(userId || undefined)
  const { workflows: backendWorkflows, loading: workflowsLoading } = useWorkflows()
  const { data: integrationAppsData } = useIntegrationMarketplace()
  const { data: notificationQueueData } = useNotificationQueue(userId || undefined)

  // Transform API team members to match member structure
  const apiTeamMembers = useMemo(() => {
    const members = apiTeamMembersData?.data || []
    return members.map((member: any) => ({
      id: member.id,
      name: member.name || member.full_name || 'Team Member',
      email: member.email || '',
      avatar: member.avatar_url || member.avatar || '',
      displayName: member.display_name || member.name?.split(' ')[0]?.toLowerCase() || 'user',
      role: (member.role || 'member') as MemberRole,
      jobTitle: member.title || member.job_title || member.role || 'Team Member',
      department: member.department || 'General',
      status: (member.status === 'active' || member.status === 'online') ? 'online' as MemberStatus : 'offline' as MemberStatus,
      statusMessage: member.status_message || '',
      statusEmoji: member.status_emoji || '',
      statusExpiry: member.status_expiry || null,
      timezone: member.timezone || 'UTC',
      localTime: new Date().toLocaleTimeString(),
      joinedAt: member.created_at || member.joined_at || new Date().toISOString(),
      lastActive: member.last_active || member.updated_at || new Date().toISOString(),
      tasksCompleted: member.tasks_completed || 0,
      projectsCount: member.projects_count || 0,
      performanceScore: member.performance_score || member.rating || 80,
      isLead: member.is_lead || member.role === 'admin' || member.role === 'owner',
      phone: member.phone || '',
      slackConnect: member.slack_connect || false,
      customFields: member.custom_fields || []
    }))
  }, [apiTeamMembersData])

  // Transform API conversations to channels format
  const apiChannels = useMemo(() => {
    // Use collaboration channels first, then fall back to conversations
    const channels = collaborationChannelsData || conversationsData?.data || []
    return channels.map((conv: any) => ({
      id: conv.id,
      name: conv.name || conv.title || 'general',
      type: (conv.type === 'public' ? 'public' : conv.type === 'private' ? 'private' : conv.type === 'dm' ? 'direct' : 'public') as ChannelType,
      description: conv.description || '',
      topic: conv.topic || '',
      memberCount: conv.member_count || conv.participants?.length || 1,
      unreadCount: conv.unread_count || 0,
      mentionCount: conv.mention_count || 0,
      isPinned: conv.is_pinned || false,
      isMuted: conv.is_muted || false,
      isArchived: conv.is_archived || false,
      isStarred: conv.is_starred || false,
      lastMessage: conv.last_message || '',
      lastMessageAt: conv.last_message_at || conv.updated_at || new Date().toISOString(),
      createdBy: conv.created_by || '',
      createdAt: conv.created_at || new Date().toISOString(),
      retentionDays: conv.retention_days || null,
      canvasCount: conv.canvas_count || 0,
      bookmarkCount: conv.bookmark_count || 0,
      notificationLevel: (conv.notification_level || 'all') as NotificationLevel,
      externalConnections: conv.external_connections || []
    }))
  }, [collaborationChannelsData, conversationsData])

  // Transform activities from backend
  const apiActivities = useMemo(() => {
    const activities = teamActivityData || []
    return activities.map((act: any) => ({
      id: act.id,
      type: (act.activity_type || act.type || 'message') as ActivityType,
      userId: act.user_id || '',
      userName: act.user_name || 'User',
      userAvatar: act.user_avatar || '',
      content: act.description || act.content || '',
      timestamp: act.created_at || new Date().toISOString(),
      channelName: act.channel_name || '',
      channelId: act.channel_id || '',
      metadata: act.metadata || {}
    }))
  }, [teamActivityData])

  // Transform huddles/meetings from backend
  const apiHuddles = useMemo(() => {
    const meetings = teamMeetingsData || eventsData?.data?.filter((e: any) => e.type === 'huddle' || e.type === 'meeting') || []
    return meetings.map((meeting: any) => ({
      id: meeting.id,
      channelId: meeting.channel_id || '',
      channelName: meeting.channel_name || meeting.title || 'Huddle',
      status: (meeting.status === 'in_progress' ? 'active' : meeting.status === 'scheduled' ? 'scheduled' : 'ended') as HuddleStatus,
      startedAt: meeting.started_at || meeting.scheduled_at || new Date().toISOString(),
      duration: meeting.duration || 0,
      participants: meeting.participants || [],
      isRecording: meeting.is_recording || false,
      hasScreenShare: meeting.has_screen_share || false
    }))
  }, [teamMeetingsData, eventsData])

  // Transform apps from backend
  const apiApps = useMemo(() => {
    const apps = integrationAppsData || []
    return apps.map((app: any) => ({
      id: app.id,
      name: app.name || 'App',
      icon: app.icon || app.logo_url || '',
      category: (app.category || 'productivity') as AppCategory,
      description: app.description || '',
      developer: app.developer || app.vendor || '',
      isInstalled: app.is_installed || false,
      isEnabled: app.is_enabled !== false,
      permissions: app.permissions || [],
      webhookCount: app.webhook_count || 0,
      lastActivity: app.last_activity || app.updated_at || '',
      rating: app.rating || 4.0,
      installCount: app.install_count || 0
    }))
  }, [integrationAppsData])

  // Transform workflows from backend
  const apiWorkflows = useMemo(() => {
    return (backendWorkflows || []).map((wf: any) => ({
      id: wf.id,
      name: wf.name || 'Workflow',
      description: wf.description || '',
      trigger: (wf.trigger || 'channel_message') as WorkflowTrigger,
      triggerChannel: wf.trigger_channel || null,
      steps: wf.steps_config || [],
      isEnabled: wf.status === 'active',
      createdBy: wf.created_by || '',
      createdAt: wf.created_at || new Date().toISOString(),
      runCount: wf.run_count || 0,
      lastRun: wf.last_run || null,
      errorCount: wf.error_count || 0
    }))
  }, [backendWorkflows])

  // Transform reminders from notifications queue
  const apiReminders = useMemo(() => {
    const reminders = notificationQueueData || []
    return reminders.filter((n: any) => n.type === 'reminder').map((r: any) => ({
      id: r.id,
      text: r.message || r.title || 'Reminder',
      createdAt: r.created_at || new Date().toISOString(),
      remindAt: r.scheduled_at || new Date().toISOString(),
      status: (r.status === 'completed' ? 'completed' : r.status === 'snoozed' ? 'snoozed' : 'pending') as ReminderStatus,
      channelId: r.channel_id || null,
      messageId: r.message_id || null,
      isRecurring: r.is_recurring || false,
      recurringPattern: r.recurring_pattern || null
    }))
  }, [notificationQueueData])

  // Enhanced real stats from API
  const enhancedTeamStats = useMemo(() => ({
    totalMembers: apiTeamStatsData?.data?.totalMembers || apiTeamMembers.length || mockMembers.length,
    activeMembers: apiTeamStatsData?.data?.activeMembers || apiTeamMembers.filter(m => m.status === 'online').length || mockMembers.filter(m => m.status === 'online').length,
    onlineNow: apiTeamMembers.filter(m => m.status === 'online').length || mockMembers.filter(m => m.status === 'online').length,
    admins: apiTeamMembers.filter(m => m.role === 'admin' || m.role === 'owner').length || mockMembers.filter(m => m.role === 'admin' || m.role === 'owner').length,
    totalChannels: apiChannels.length || mockChannels.length,
    unreadMessages: messagingStatsData?.data?.unreadCount || 0,
    pendingInvitations: invitationsData?.data?.length || 0,
    totalHuddles: apiHuddles.length || mockHuddles.length
  }), [apiTeamStatsData, apiTeamMembers, apiChannels, apiHuddles, messagingStatsData, invitationsData])

  // Use API data with fallback to mock data
  const effectiveMembers = apiTeamMembers.length > 0 ? apiTeamMembers : mockMembers
  const effectiveChannels = apiChannels.length > 0 ? apiChannels : mockChannels
  const effectiveActivities = apiActivities.length > 0 ? apiActivities : mockActivities
  const effectiveHuddles = apiHuddles.length > 0 ? apiHuddles : mockHuddles
  const effectiveApps = apiApps.length > 0 ? apiApps : mockApps
  const effectiveWorkflows = apiWorkflows.length > 0 ? apiWorkflows : mockWorkflows
  const effectiveReminders = apiReminders.length > 0 ? apiReminders : mockReminders

  // UI State - synced from backend data via useEffect
  const [members, setMembers] = useState<TeamMember[]>(mockMembers)
  const [channels, setChannels] = useState<Channel[]>(mockChannels)
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [activities, setActivities] = useState<Activity[]>(mockActivities)
  const [huddles, setHuddles] = useState<Huddle[]>(mockHuddles)
  const [apps, setApps] = useState<SlackApp[]>(mockApps)
  const [workflows, setWorkflows] = useState<SlackWorkflow[]>(mockWorkflows)
  const [reminders, setReminders] = useState<Reminder[]>(mockReminders)
  const [savedItems, setSavedItems] = useState<SavedItem[]>(mockSavedItems)
  const [userGroups, setUserGroups] = useState<UserGroup[]>(mockUserGroups)

  // Sync members from backend
  useEffect(() => {
    if (effectiveMembers.length > 0) {
      setMembers(effectiveMembers as TeamMember[])
    }
  }, [effectiveMembers])

  // Sync channels from backend
  useEffect(() => {
    if (effectiveChannels.length > 0) {
      setChannels(effectiveChannels as Channel[])
    }
  }, [effectiveChannels])

  // Sync activities from backend
  useEffect(() => {
    if (effectiveActivities.length > 0) {
      setActivities(effectiveActivities as Activity[])
    }
  }, [effectiveActivities])

  // Sync huddles from backend
  useEffect(() => {
    if (effectiveHuddles.length > 0) {
      setHuddles(effectiveHuddles as Huddle[])
    }
  }, [effectiveHuddles])

  // Sync apps from backend
  useEffect(() => {
    if (effectiveApps.length > 0) {
      setApps(effectiveApps as SlackApp[])
    }
  }, [effectiveApps])

  // Sync workflows from backend
  useEffect(() => {
    if (effectiveWorkflows.length > 0) {
      setWorkflows(effectiveWorkflows as SlackWorkflow[])
    }
  }, [effectiveWorkflows])

  // Sync reminders from backend
  useEffect(() => {
    if (effectiveReminders.length > 0) {
      setReminders(effectiveReminders as Reminder[])
    }
  }, [effectiveReminders])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [selectedApp, setSelectedApp] = useState<SlackApp | null>(null)
  const [statusFilter, setStatusFilter] = useState<MemberStatus | 'all'>('all')
  const [showSearch, setShowSearch] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')

  // Data State
  const [dbMembers, setDbMembers] = useState<DbTeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Dialog State
  const [showCreateMemberDialog, setShowCreateMemberDialog] = useState(false)
  const [showNewTeamDialog, setShowNewTeamDialog] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [showCreateChannelDialog, setShowCreateChannelDialog] = useState(false)
  const [showAddAppDialog, setShowAddAppDialog] = useState(false)
  const [showWorkflowBuilderDialog, setShowWorkflowBuilderDialog] = useState(false)
  const [showHuddleDialog, setShowHuddleDialog] = useState(false)
  const [showReactionsDialog, setShowReactionsDialog] = useState(false)
  const [showThreadDialog, setShowThreadDialog] = useState(false)
  const [selectedMessageForThread, setSelectedMessageForThread] = useState<Message | null>(null)
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [showSaveSettingsDialog, setShowSaveSettingsDialog] = useState(false)

  // Form State
  const [memberForm, setMemberForm] = useState({
    name: '',
    email: '',
    role: '',
    department: 'development',
    phone: '',
    location: '',
    timezone: 'UTC',
    bio: '',
    skills: ''
  })

  // Channel Form State
  const [channelForm, setChannelForm] = useState({
    name: '',
    description: '',
    isPrivate: false
  })

  // Workflow Form State
  const [workflowForm, setWorkflowForm] = useState({
    name: '',
    description: '',
    trigger: 'channel_message' as WorkflowTrigger
  })

  // Huddle Form State
  const [huddleForm, setHuddleForm] = useState({
    channelId: '',
    enableVideo: false,
    recordHuddle: false
  })

  // Reply Form State
  const [replyContent, setReplyContent] = useState('')

  // API Token State
  const [apiToken, setApiToken] = useState('xoxb-****************************')

  // Settings State
  const [settingsState, setSettingsState] = useState({
    workspaceName: 'FreeFlow Workspace',
    defaultChannel: 'general',
    messageRetention: 90,
    allowGuestAccess: true,
    requireTwoFactor: false,
    allowFileUploads: true,
    maxFileSize: 100,
    notifications: {
      desktop: true,
      email: true,
      mobile: true
    }
  })

  // Selected message for reactions
  const [selectedMessageForReaction, setSelectedMessageForReaction] = useState<Message | null>(null)

  // Fetch team members
  const fetchMembers = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDbMembers(data || [])
    } catch (error) {
      console.error('Error fetching team members:', error)
      toast.error('Failed to load team members')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Create team member
  const handleCreateMember = async () => {
    if (!memberForm.name || !memberForm.email) {
      toast.error('Name and email are required')
      return
    }
    try {
      setIsSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to add team members')
        return
      }

      const { error } = await supabase.from('team_members').insert({
        user_id: user.id,
        name: memberForm.name,
        email: memberForm.email,
        role: memberForm.role || 'Member',
        department: memberForm.department,
        phone: memberForm.phone || null,
        location: memberForm.location || null,
        timezone: memberForm.timezone,
        bio: memberForm.bio || null,
        skills: memberForm.skills ? memberForm.skills.split(',').map(s => s.trim()) : []
      })

      if (error) throw error

      toast.success('Team member added successfully')
      setShowCreateMemberDialog(false)
      resetMemberForm()
      fetchMembers()
    } catch (error) {
      console.error('Error creating team member:', error)
      toast.error('Failed to add team member')
    } finally {
      setIsSaving(false)
    }
  }

  // Update member status
  const handleUpdateMemberStatus = async (memberId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', memberId)

      if (error) throw error
      toast.success(`Status updated to ${newStatus}`)
      fetchMembers()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  // Delete team member
  const handleDeleteMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId)

      if (error) throw error
      toast.success('Team member removed')
      fetchMembers()
    } catch (error) {
      console.error('Error deleting member:', error)
      toast.error('Failed to remove team member')
    }
  }

  // Reset form
  const resetMemberForm = () => {
    setMemberForm({
      name: '',
      email: '',
      role: '',
      department: 'development',
      phone: '',
      location: '',
      timezone: 'UTC',
      bio: '',
      skills: ''
    })
  }

  // Load data on mount
  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  // Stats - computed from current state (synced from backend)
  const stats = useMemo(() => {
    const totalMembers = members.length
    const onlineMembers = members.filter(m => m.status === 'online' || m.status === 'in-meeting').length
    const onlineNow = onlineMembers // Alias for UI
    const inMeetingMembers = members.filter(m => m.status === 'in-meeting').length
    const admins = members.filter(m => m.role === 'admin' || m.role === 'owner').length
    const totalChannels = channels.length
    const unreadMessages = channels.reduce((sum, c) => sum + c.unreadCount, 0)
    const totalMentions = channels.reduce((sum, c) => sum + c.mentionCount, 0)
    const activeHuddles = huddles.filter(h => h.status === 'active').length
    const installedApps = apps.filter(a => a.isInstalled).length
    const activeWorkflows = workflows.filter(w => w.isEnabled).length
    const pendingReminders = reminders.filter(r => r.status === 'pending').length
    return { totalMembers, onlineMembers, onlineNow, inMeetingMembers, admins, totalChannels, unreadMessages, totalMentions, activeHuddles, installedApps, activeWorkflows, pendingReminders }
  }, [members, channels, huddles, apps, workflows, reminders])

  // Filtered members
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.department.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [members, searchQuery, statusFilter])

  // Helper functions
  const getStatusColor = (status: MemberStatus) => {
    const colors: Record<MemberStatus, string> = {
      'online': 'bg-green-500',
      'away': 'bg-yellow-500',
      'dnd': 'bg-red-500',
      'offline': 'bg-gray-400',
      'in-meeting': 'bg-purple-500'
    }
    return colors[status]
  }

  const getStatusLabel = (status: MemberStatus) => {
    const labels: Record<MemberStatus, string> = {
      'online': 'Active',
      'away': 'Away',
      'dnd': 'Do Not Disturb',
      'offline': 'Offline',
      'in-meeting': 'In a meeting'
    }
    return labels[status]
  }

  const getRoleColor = (role: MemberRole) => {
    const colors: Record<MemberRole, string> = {
      owner: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      member: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      guest: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      'single-channel-guest': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    }
    return colors[role]
  }

  const getRoleIcon = (role: MemberRole) => {
    const icons: Record<MemberRole, React.ReactNode> = {
      owner: <Crown className="w-3 h-3" />,
      admin: <Shield className="w-3 h-3" />,
      member: <UserCheck className="w-3 h-3" />,
      guest: <Globe className="w-3 h-3" />,
      'single-channel-guest': <Lock className="w-3 h-3" />
    }
    return icons[role]
  }

  const getChannelIcon = (type: ChannelType) => {
    const icons: Record<ChannelType, React.ReactNode> = {
      public: <Hash className="w-4 h-4" />,
      private: <Lock className="w-4 h-4" />,
      direct: <MessageSquare className="w-4 h-4" />,
      'group-dm': <Users className="w-4 h-4" />,
      shared: <ExternalLink className="w-4 h-4" />
    }
    return icons[type]
  }

  const getAppCategoryColor = (category: AppCategory) => {
    const colors: Record<AppCategory, string> = {
      productivity: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      communication: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      developer: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      analytics: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      hr: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      sales: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      marketing: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      support: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    }
    return colors[category]
  }

  const getWorkflowTriggerLabel = (trigger: WorkflowTrigger) => {
    const labels: Record<WorkflowTrigger, string> = {
      channel_message: 'New message',
      emoji_reaction: 'Emoji reaction',
      new_member: 'New member joins',
      scheduled: 'Scheduled',
      webhook: 'Webhook',
      shortcut: 'Shortcut'
    }
    return labels[trigger]
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const statCards = [
    { label: 'Team Members', value: stats.totalMembers.toString(), subValue: `${stats.onlineMembers} online`, icon: Users, color: 'from-green-500 to-emerald-500' },
    { label: 'Channels', value: stats.totalChannels.toString(), subValue: `${stats.unreadMessages} unread`, icon: Hash, color: 'from-blue-500 to-cyan-500' },
    { label: 'Mentions', value: stats.totalMentions.toString(), subValue: 'needs attention', icon: AtSign, color: 'from-red-500 to-rose-500' },
    { label: 'Active Huddles', value: stats.activeHuddles.toString(), subValue: 'in progress', icon: Headphones, color: 'from-purple-500 to-pink-500' },
    { label: 'Apps Installed', value: stats.installedApps.toString(), subValue: 'integrations', icon: Layers, color: 'from-orange-500 to-amber-500' },
    { label: 'Workflows', value: stats.activeWorkflows.toString(), subValue: 'active', icon: Workflow, color: 'from-indigo-500 to-violet-500' },
    { label: 'Reminders', value: stats.pendingReminders.toString(), subValue: 'pending', icon: Bell, color: 'from-yellow-500 to-orange-500' },
    { label: 'In Meetings', value: stats.inMeetingMembers.toString(), subValue: 'right now', icon: Video, color: 'from-teal-500 to-green-500' }
  ]

  // Handlers
  const handleCreateChannel = () => {
    setShowCreateChannelDialog(true)
  }

  const handleStartHuddle = () => {
    setShowHuddleDialog(true)
  }

  const handleSendMessage = (channelName: string) => {
    toast.success('Message sent')
  }

  const handleInviteMember = () => {
    setShowCreateMemberDialog(true)
  }

  const handleSetReminder = () => {
    toast.success('Reminder set')
  }

  const handleOpenNotifications = () => {
    setShowNotificationsPanel(true)
  }

  const handleOpenApprovalQueue = () => {
    setShowApprovalDialog(true)
  }

  const handleAddApp = () => {
    setShowAddAppDialog(true)
  }

  const handleOpenWorkflowBuilder = () => {
    setShowWorkflowBuilderDialog(true)
  }

  const handleStartThread = (message: Message) => {
    setSelectedMessageForThread(message)
    setShowThreadDialog(true)
  }

  const handleOpenReactions = (message?: Message) => {
    if (message) {
      setSelectedMessageForReaction(message)
    }
    setShowReactionsDialog(true)
  }

  const handleSaveSettings = async () => {
    setShowSaveSettingsDialog(true)
    try {
      // Real API call to save workspace settings
      const response = await fetch('/api/workspace/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: settingsState })
      })
      if (!response.ok) throw new Error('Failed to save settings')
      toast.success('Settings saved')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setShowSaveSettingsDialog(false)
    }
  }

  // Combined stats from mock + db
  const combinedMemberCount = members.length + dbMembers.length
  const dbOnlineCount = dbMembers.filter(m => m.status === 'online').length

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
            <Button variant="outline" size="icon" onClick={() => setShowSearch(true)}>
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="relative" onClick={handleOpenNotifications}>
              <Bell className="w-4 h-4" />
              {stats.totalMentions > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{stats.totalMentions}</span>
              )}
            </Button>
            <Button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white" onClick={handleInviteMember}>
              <UserPlus className="w-4 h-4 mr-2" />
              Invite
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
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{stat.subValue}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="members" className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 shadow-sm flex-wrap">
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
            <TabsTrigger value="huddles" className="flex items-center gap-2">
              <Headphones className="w-4 h-4" />
              Huddles
            </TabsTrigger>
            <TabsTrigger value="apps" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Apps
            </TabsTrigger>
            <TabsTrigger value="workflows" className="flex items-center gap-2">
              <Workflow className="w-4 h-4" />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            {/* Members Banner */}
            <Card className="border-0 bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Users className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Team Members</h3>
                      <p className="text-white/80">Manage your workspace members and permissions</p>
                    </div>
                  </div>
                  <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6 text-center">
                    <div>
                      <p className="text-2xl font-bold">{stats.totalMembers}</p>
                      <p className="text-sm text-white/80">Total</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.onlineNow}</p>
                      <p className="text-sm text-white/80">Online</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.admins}</p>
                      <p className="text-sm text-white/80">Admins</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Members Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: UserPlus, label: 'Invite', color: 'bg-purple-500', onClick: handleInviteMember },
                { icon: Mail, label: 'Email All', color: 'bg-blue-500', onClick: () => {
                  const emails = members.map(m => m.email).join(',')
                  window.location.href = `mailto:${emails}?subject=Team Communication`
                }},
                { icon: UserCheck, label: 'Approve', color: 'bg-green-500', onClick: handleOpenApprovalQueue },
                { icon: Shield, label: 'Roles', color: 'bg-orange-500', onClick: () => setSettingsTab('members') },
                { icon: Crown, label: 'Admins', color: 'bg-yellow-500', onClick: () => {
                  const adminCount = members.filter(m => m.role === 'admin' || m.role === 'owner').length
                  toast.info(`${adminCount} admin users in workspace`)
                }},
                { icon: Download, label: 'Export', color: 'bg-pink-500', onClick: () => {
                  const csvContent = 'Name,Email,Role,Department,Status\n' +
                    members.map(m => `${m.name},${m.email},${m.role},${m.department},${m.status}`).join('\n')
                  const blob = new Blob([csvContent], { type: 'text/csv' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'team-members.csv'
                  a.click()
                  URL.revokeObjectURL(url)
                  toast.success('Team data exported')
                }},
                { icon: Filter, label: 'Filter', color: 'bg-indigo-500', onClick: () => setStatusFilter(statusFilter === 'all' ? 'online' : 'all') },
                { icon: Settings, label: 'Settings', color: 'bg-gray-500', onClick: () => setSettingsTab('members') }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200"
                  onClick={action.onClick}
                >
                  <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant={statusFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('all')}>
                  All ({members.length})
                </Button>
                {(['online', 'away', 'dnd', 'in-meeting', 'offline'] as MemberStatus[]).map(status => (
                  <Button key={status} variant={statusFilter === status ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter(status)}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(status)}`} />
                    {getStatusLabel(status)} ({members.filter(m => m.status === status).length})
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMembers.map(member => (
                <Card key={member.id} className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group" onClick={() => setSelectedMember(member)}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={member.avatar} alt="User avatar" />
                          <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-900 ${getStatusColor(member.status)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white truncate">{member.name}</h4>
                          {member.isLead && <Star className="w-3.5 h-3.5 text-yellow-500 fill-current flex-shrink-0" />}
                          {member.slackConnect && <ExternalLink className="w-3 h-3 text-blue-500 flex-shrink-0" />}
                        </div>
                        <p className="text-sm text-gray-500 truncate">@{member.displayName}</p>
                        <p className="text-xs text-gray-400 truncate">{member.jobTitle}</p>
                      </div>
                    </div>

                    {(member.statusEmoji || member.statusMessage) && (
                      <div className="flex items-center gap-2 mt-3 px-2 py-1.5 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                        {member.statusEmoji && <span>{member.statusEmoji}</span>}
                        <span className="text-gray-600 dark:text-gray-400 truncate">{member.statusMessage}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                      <span>{member.department}</span>
                      <span>{member.localTime}</span>
                    </div>

                    <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="sm" className="flex-1 h-8" onClick={(e) => { e.stopPropagation(); window.location.href = `mailto:${member.email}?subject=Message from Team Hub`; toast.success(`Opening email to ${member.name}`) }}>
                        <MessageSquare className="w-3.5 h-3.5 mr-1" />
                        Message
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 px-2" onClick={(e) => { e.stopPropagation(); if (member.phone) { window.location.href = `tel:${member.phone}`; toast.success(`Calling ${member.name}`) } else { toast.error('No phone number available') } }}>
                        <Headphones className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Database Members */}
              {isLoading ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-8 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </CardContent>
                </Card>
              ) : (
                dbMembers.map(member => (
                  <Card key={member.id} className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-900 ${member.status === 'online' ? 'bg-green-500' : member.status === 'busy' ? 'bg-red-500' : 'bg-gray-400'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white truncate">{member.name}</h4>
                            <Badge variant="outline" className="text-xs">DB</Badge>
                          </div>
                          <p className="text-sm text-gray-500 truncate">{member.email}</p>
                          <p className="text-xs text-gray-400 truncate">{member.role}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                        <span className="capitalize">{member.department}</span>
                        <span>{member.location || member.timezone}</span>
                      </div>

                      {member.skills && member.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {member.skills.slice(0, 3).map((skill, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{skill}</Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="outline" size="sm" className="flex-1 h-8" onClick={(e) => { e.stopPropagation(); handleUpdateMemberStatus(member.id, member.status === 'online' ? 'offline' : 'online') }}>
                          {member.status === 'online' ? 'Set Offline' : 'Set Online'}
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 px-2 text-red-500 hover:text-red-600" onClick={(e) => { e.stopPropagation(); handleDeleteMember(member.id) }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Channels Tab */}
          <TabsContent value="channels" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Channels</h3>
                <Badge variant="secondary">{channels.length}</Badge>
              </div>
              <Button onClick={handleCreateChannel}>
                <Plus className="w-4 h-4 mr-2" />
                Create Channel
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {channels.map(channel => (
                <Card key={channel.id} className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => setSelectedChannel(channel)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{getChannelIcon(channel.type)}</span>
                        <h4 className="font-semibold">{channel.name}</h4>
                        {channel.isPinned && <Pin className="w-3 h-3 text-yellow-500" />}
                        {channel.isStarred && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                        {channel.isMuted && <BellOff className="w-3 h-3 text-gray-400" />}
                        {channel.type === 'shared' && <Badge variant="outline" className="text-xs">External</Badge>}
                      </div>
                      <div className="flex items-center gap-2">
                        {channel.mentionCount > 0 && <Badge className="bg-red-500 text-white">{channel.mentionCount}</Badge>}
                        {channel.unreadCount > 0 && <Badge variant="secondary">{channel.unreadCount}</Badge>}
                      </div>
                    </div>

                    {channel.topic && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">{channel.topic}</p>
                    )}

                    <p className="text-sm text-gray-500 mb-3 line-clamp-1">{channel.lastMessage}</p>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {channel.memberCount}
                        </span>
                        {channel.canvasCount > 0 && (
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {channel.canvasCount}
                          </span>
                        )}
                        {channel.bookmarkCount > 0 && (
                          <span className="flex items-center gap-1">
                            <Bookmark className="w-3 h-3" />
                            {channel.bookmarkCount}
                          </span>
                        )}
                      </div>
                      <span>{formatTimeAgo(channel.lastMessageAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Recent Messages</CardTitle>
                    <CardDescription>Latest conversations across channels</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-4">
                        {messages.map(message => (
                          <div key={message.id} className="group p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                            <div className="flex items-start gap-3">
                              <Avatar className="w-9 h-9">
                                <AvatarImage src={message.senderAvatar} alt="User avatar" />
                                <AvatarFallback>{message.senderName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-sm">{message.senderName}</span>
                                  <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                                  {message.isPinned && <Pin className="w-3 h-3 text-yellow-500" />}
                                  {message.editedAt && <span className="text-xs text-gray-400">(edited)</span>}
                                </div>

                                {message.type === 'code' && message.codeSnippet ? (
                                  <div className="bg-gray-900 rounded-lg p-3 mt-2 overflow-x-auto">
                                    <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                                      <span>{message.codeSnippet.filename}</span>
                                      <Badge variant="secondary">{message.codeSnippet.language}</Badge>
                                    </div>
                                    <pre className="text-sm text-gray-100"><code>{message.codeSnippet.code}</code></pre>
                                  </div>
                                ) : message.type === 'poll' && message.poll ? (
                                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mt-2">
                                    <p className="font-medium mb-3">{message.poll.question}</p>
                                    <div className="space-y-2">
                                      {message.poll.options.map((opt, i) => {
                                        const total = message.poll!.options.reduce((sum, o) => sum + o.votes, 0)
                                        const pct = total > 0 ? (opt.votes / total) * 100 : 0
                                        return (
                                          <div key={i} className="relative">
                                            <div className="flex items-center justify-between text-sm mb-1">
                                              <span>{opt.text}</span>
                                              <span className="text-gray-500">{opt.votes} votes</span>
                                            </div>
                                            <Progress value={pct} className="h-2" />
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-gray-700 dark:text-gray-300">{message.content}</p>
                                )}

                                {message.attachments.length > 0 && (
                                  <div className="flex items-center gap-2 mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                                    <FileText className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm flex-1">{message.attachments[0].name}</span>
                                    <span className="text-xs text-gray-500">{formatFileSize(message.attachments[0].size)}</span>
                                  </div>
                                )}

                                {message.reactions.length > 0 && (
                                  <div className="flex items-center gap-1 mt-2 flex-wrap">
                                    {message.reactions.map((reaction, i) => (
                                      <button key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700">
                                        {reaction.emoji} {reaction.count}
                                      </button>
                                    ))}
                                  </div>
                                )}

                                {message.replyCount > 0 && (
                                  <button className="flex items-center gap-2 mt-2 text-sm text-blue-600 hover:underline">
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    {message.replyCount} replies
                                  </button>
                                )}
                              </div>

                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenReactions(message)}><Smile className="w-3.5 h-3.5" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleStartThread(message)}><MessageCircle className="w-3.5 h-3.5" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                                  setSavedItems(prev => [...prev, { id: `saved-${Date.now()}`, type: 'message', title: message.content.substring(0, 30), time: new Date().toLocaleTimeString() }])
                                  toast.success('Message saved')
                                }}><Bookmark className="w-3.5 h-3.5" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { navigator.clipboard.writeText(message.content); toast.success('Copied!') }}><MoreVertical className="w-3.5 h-3.5" /></Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bookmark className="w-4 h-4" />
                      Saved Items
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {savedItems.map(item => (
                        <div key={item.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            {item.type === 'message' && <MessageSquare className="w-3.5 h-3.5 text-gray-500" />}
                            {item.type === 'file' && <FileText className="w-3.5 h-3.5 text-gray-500" />}
                            {item.type === 'canvas' && <FileCode className="w-3.5 h-3.5 text-gray-500" />}
                            <span className="font-medium text-sm">{item.title}</span>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2">{item.preview}</p>
                          <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                            <span>#{item.channelName}</span>
                            <span>{formatTimeAgo(item.savedAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Reminders
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {reminders.filter(r => r.status === 'pending').map(reminder => (
                        <div key={reminder.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Clock className="w-4 h-4 text-gray-500 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">{reminder.text}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                              <span>{formatTime(reminder.remindAt)}</span>
                              {reminder.isRecurring && <Badge variant="secondary" className="text-xs">Recurring</Badge>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Huddles Tab */}
          <TabsContent value="huddles" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Huddles</h3>
              <Button onClick={handleStartHuddle}>
                <Headphones className="w-4 h-4 mr-2" />
                Start Huddle
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {huddles.filter(h => h.status === 'active').map(huddle => (
                <Card key={huddle.id} className="border-0 shadow-sm border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Headphones className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">#{huddle.channelName}</h4>
                          <p className="text-xs text-gray-500">Started {formatTimeAgo(huddle.startedAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {huddle.hasScreenShare && <Badge variant="secondary"><Eye className="w-3 h-3 mr-1" />Sharing</Badge>}
                        {huddle.isRecording && <Badge className="bg-red-500 text-white"><Circle className="w-2 h-2 mr-1 fill-current" />REC</Badge>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex -space-x-2">
                        {huddle.participants.slice(0, 4).map((p, i) => (
                          <Avatar key={i} className="w-8 h-8 border-2 border-white dark:border-gray-900">
                            <AvatarImage src={p.avatar} alt="User avatar" />
                            <AvatarFallback className="text-xs">{p.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      {huddle.participants.length > 4 && (
                        <span className="text-sm text-gray-500">+{huddle.participants.length - 4} more</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded mb-4">
                      {huddle.participants.slice(0, 3).map((p, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${p.isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                          <span className="text-xs">{p.name.split(' ')[0]}</span>
                          {p.isMuted && <VolumeX className="w-3 h-3 text-gray-400" />}
                        </div>
                      ))}
                    </div>

                    <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white" onClick={() => {
                      setShowHuddleDialog(true)
                      toast.success('Joined huddle')
                    }}>
                      Join Huddle
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {huddles.filter(h => h.status === 'active').length === 0 && (
                <Card className="border-0 shadow-sm col-span-full">
                  <CardContent className="p-12 text-center">
                    <Headphones className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No active huddles</h3>
                    <p className="text-gray-500 mb-4">Start a huddle to have a quick audio chat with your team</p>
                    <Button onClick={handleStartHuddle}>
                      <Plus className="w-4 h-4 mr-2" />
                      Start Huddle
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Apps Tab */}
          <TabsContent value="apps" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Installed Apps</h3>
              <Button onClick={handleAddApp}>
                <Plus className="w-4 h-4 mr-2" />
                Add Apps
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {apps.filter(a => a.isInstalled).map(app => (
                <Card key={app.id} className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => setSelectedApp(app)}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl">
                        {app.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{app.name}</h4>
                          {app.isEnabled ? (
                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Disabled</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2 mt-1">{app.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                      <Badge className={getAppCategoryColor(app.category)}>{app.category}</Badge>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        {app.rating}
                      </div>
                    </div>

                    {app.webhookCount > 0 && (
                      <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                        <span className="text-gray-500">{app.webhookCount} webhooks configured</span>
                        {app.lastActivity && <span className="text-gray-400 ml-2">• Last active {formatTimeAgo(app.lastActivity)}</span>}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Popular Apps</CardTitle>
                <CardDescription>Recommended integrations for your workspace</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {apps.filter(a => !a.isInstalled).map(app => (
                    <div key={app.id} className="flex items-center gap-3 p-3 border rounded-lg hover:border-blue-500 cursor-pointer transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl">
                        {app.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{app.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-yellow-500 fill-current" />{app.rating}</span>
                          <span>•</span>
                          <span>{app.installCount.toLocaleString()} installs</span>
                        </div>
                      </div>
                      <Button size="sm" onClick={(e) => {
                        e.stopPropagation()
                        setApps(prev => prev.map(a =>
                          a.id === app.id ? { ...a, isInstalled: true, isEnabled: true } : a
                        ))
                        toast.success(`${app.name} added`)
                      }}>Add</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Workflow Builder</h3>
              <Button onClick={handleOpenWorkflowBuilder}>
                <Plus className="w-4 h-4 mr-2" />
                Create Workflow
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {workflows.map(workflow => (
                <Card key={workflow.id} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${workflow.isEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <Workflow className={`w-5 h-5 ${workflow.isEnabled ? 'text-green-600' : 'text-gray-500'}`} />
                        </div>
                        <div>
                          <h4 className="font-semibold">{workflow.name}</h4>
                          <p className="text-sm text-gray-500">{workflow.description}</p>
                        </div>
                      </div>
                      <Switch checked={workflow.isEnabled} />
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary">{getWorkflowTriggerLabel(workflow.trigger)}</Badge>
                      {workflow.triggerChannel && <span className="text-sm text-gray-500">in #{channels.find(c => c.id === workflow.triggerChannel)?.name}</span>}
                    </div>

                    <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                      <div>
                        <span className="text-gray-500">Runs:</span>
                        <span className="font-medium ml-1">{workflow.runCount}</span>
                      </div>
                      {workflow.lastRun && (
                        <div>
                          <span className="text-gray-500">Last:</span>
                          <span className="ml-1">{formatDate(workflow.lastRun)}</span>
                        </div>
                      )}
                      {workflow.errorCount > 0 && (
                        <div className="flex items-center gap-1 text-red-600">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {workflow.errorCount} errors
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <span>{workflow.steps.length} steps</span>
                        <span>•</span>
                        <span>by {workflow.createdBy}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="border-0 bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Settings className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Workspace Settings</h3>
                      <p className="text-white/80">Configure your team hub preferences</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card>
                  <CardContent className="p-4">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Sliders },
                        { id: 'members', label: 'Members', icon: Users },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'integrations', label: 'Integrations', icon: Webhook },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'advanced', label: 'Advanced', icon: Terminal }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            settingsTab === item.id
                              ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                              : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sliders className="w-5 h-5 text-purple-500" />
                          Workspace Settings
                        </CardTitle>
                        <CardDescription>Configure basic workspace preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <Label>Workspace Name</Label>
                            <Input defaultValue="FreeFlow Team" className="mt-1" />
                          </div>
                          <div>
                            <Label>Workspace URL</Label>
                            <Input defaultValue="freeflow.slack.com" className="mt-1" />
                          </div>
                        </div>
                        <div>
                          <Label>Workspace Description</Label>
                          <Input defaultValue="The central hub for FreeFlow team communication" className="mt-1" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Allow Public Channels</p>
                            <p className="text-sm text-gray-500">Members can create public channels</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Allow Direct Messages</p>
                            <p className="text-sm text-gray-500">Members can DM each other</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Allow Huddles</p>
                            <p className="text-sm text-gray-500">Enable voice and video huddles</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <Button className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white" onClick={handleSaveSettings} disabled={showSaveSettingsDialog}>
                          {showSaveSettingsDialog ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            'Save Settings'
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Members Settings */}
                {settingsTab === 'members' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-blue-500" />
                          Member Settings
                        </CardTitle>
                        <CardDescription>Configure member permissions and access</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Allow Self-Registration</p>
                            <p className="text-sm text-gray-500">New users can request to join</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Require Admin Approval</p>
                            <p className="text-sm text-gray-500">Admins must approve new members</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Allow Guest Access</p>
                            <p className="text-sm text-gray-500">Invite external guests to channels</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Show Member Directory</p>
                            <p className="text-sm text-gray-500">Members can see the full directory</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Default Role for New Members</Label>
                          <Input defaultValue="Member" className="mt-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-orange-500" />
                          Notification Preferences
                        </CardTitle>
                        <CardDescription>Configure workspace notification defaults</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { label: 'Direct Messages', desc: 'Notify on all DMs', checked: true },
                          { label: 'Mentions', desc: 'Notify when mentioned', checked: true },
                          { label: 'Thread Replies', desc: 'Notify on thread replies', checked: true },
                          { label: 'Channel Messages', desc: 'Notify on channel messages', checked: false },
                          { label: 'Huddle Invites', desc: 'Notify on huddle invitations', checked: true },
                          { label: 'Workflow Runs', desc: 'Notify on workflow completions', checked: false }
                        ].map((notif, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{notif.label}</p>
                              <p className="text-sm text-gray-500">{notif.desc}</p>
                            </div>
                            <Switch defaultChecked={notif.checked} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Webhook className="w-5 h-5 text-green-500" />
                          Connected Apps
                        </CardTitle>
                        <CardDescription>Manage workspace integrations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Google Drive', desc: 'File sharing', status: 'connected' },
                          { name: 'Jira', desc: 'Issue tracking', status: 'connected' },
                          { name: 'GitHub', desc: 'Code repositories', status: 'connected' },
                          { name: 'Zoom', desc: 'Video meetings', status: 'disconnected' },
                          { name: 'Salesforce', desc: 'CRM', status: 'disconnected' }
                        ].map((integration, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                {integration.name[0]}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{integration.name}</p>
                                <p className="text-sm text-gray-500">{integration.desc}</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => {
                              if (integration.status === 'connected') {
                                setShowAddAppDialog(true)
                              } else {
                                toast.success('Connected successfully')
                              }
                            }}>
                              {integration.status === 'connected' ? 'Configure' : 'Connect'}
                            </Button>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={() => setShowAddAppDialog(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Integration
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="w-5 h-5 text-purple-500" />
                          API & Webhooks
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>API Token</Label>
                          <div className="flex gap-2 mt-1">
                            <Input type="password" value={apiToken} readOnly className="font-mono" />
                            <Button variant="outline" onClick={() => {
                              navigator.clipboard.writeText(apiToken)
                              toast.success('Copied!')
                            }}>
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label>Webhook URL</Label>
                          <Input defaultValue="https://hooks.slack.com/services/..." className="mt-1 font-mono" />
                        </div>
                        <Button variant="outline" onClick={() => {
                          if (confirm('Are you sure you want to regenerate the API token? Existing integrations will stop working.')) {
                            const newToken = `xoxb-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
                            setApiToken(newToken)
                            toast.success('Token regenerated')
                          }
                        }}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Regenerate Token
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Security Settings */}
                {settingsTab === 'security' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-green-500" />
                          Security Settings
                        </CardTitle>
                        <CardDescription>Protect your workspace</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                            <p className="text-sm text-gray-500">Require 2FA for all members</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">SSO Required</p>
                            <p className="text-sm text-gray-500">Require single sign-on</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Session Timeout</p>
                            <p className="text-sm text-gray-500">Auto-logout after inactivity</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Audit Logging</p>
                            <p className="text-sm text-gray-500">Log all workspace activity</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lock className="w-5 h-5 text-yellow-500" />
                          Data Protection
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Message Encryption</p>
                            <p className="text-sm text-gray-500">Encrypt messages at rest</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">File Scanning</p>
                            <p className="text-sm text-gray-500">Scan uploads for malware</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Terminal className="w-5 h-5 text-cyan-500" />
                          Advanced Configuration
                        </CardTitle>
                        <CardDescription>Advanced settings for power users</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Developer Mode</p>
                            <p className="text-sm text-gray-500">Enable developer features</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Beta Features</p>
                            <p className="text-sm text-gray-500">Try new features early</p>
                          </div>
                          <Switch />
                        </div>
                        <div>
                          <Label>Message Retention (days)</Label>
                          <Input type="number" defaultValue="365" className="mt-1" />
                        </div>
                        <div>
                          <Label>File Storage Limit (GB)</Label>
                          <Input type="number" defaultValue="100" className="mt-1" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Database className="w-5 h-5 text-blue-500" />
                          Data Management
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => {
                            const workspaceData = {
                              members: members.map(m => ({ name: m.name, email: m.email, role: m.role, department: m.department })),
                              channels: channels.map(c => ({ name: c.name, type: c.type, memberCount: c.memberCount })),
                              exportDate: new Date().toISOString()
                            }
                            const blob = new Blob([JSON.stringify(workspaceData, null, 2)], { type: 'application/json' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = 'workspace-export.json'
                            a.click()
                            URL.revokeObjectURL(url)
                            toast.success('Export complete')
                          }}>
                            <Download className="w-4 h-4 mr-2" />
                            Export Workspace Data
                          </Button>
                          <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={() => {
                            if (confirm('Clear all cached data? This action cannot be undone.')) {
                              localStorage.clear()
                              sessionStorage.clear()
                              toast.success('Cache cleared')
                            }
                          }}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear Cache
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-900">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertTriangle className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-300">Reset Workspace</p>
                            <p className="text-sm text-red-600/70">Reset all workspace settings</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => {
                            if (confirm('Are you sure you want to reset all workspace settings? This cannot be undone.')) {
                              // Reset form states to defaults
                              setChannelForm({ name: '', description: '', isPrivate: false })
                              setWorkflowForm({ name: '', description: '', trigger: 'channel_message' })
                              setHuddleForm({ channelId: '', enableVideo: false, recordHuddle: false })
                              setApiToken('xoxb-****************************')
                              setSettingsTab('general')
                              // Clear any cached settings
                              localStorage.removeItem('team-hub-settings')
                              toast.success('Workspace reset')
                            }
                          }}>
                            Reset
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-300">Delete Workspace</p>
                            <p className="text-sm text-red-600/70">Permanently delete workspace</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => { if (confirm('DANGER: This will permanently delete the workspace and all data. Type "DELETE" to confirm.')) { toast.error('Deletion cancelled') } }}>
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

        {/* Member Detail Dialog */}
        <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Profile</DialogTitle>
            </DialogHeader>
            {selectedMember && (
              <ScrollArea className="max-h-[70vh]">
                <div className="space-y-4 pr-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={selectedMember.avatar} alt="User avatar" />
                        <AvatarFallback>{selectedMember.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${getStatusColor(selectedMember.status)}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{selectedMember.name}</h3>
                      <p className="text-gray-500">@{selectedMember.displayName}</p>
                      {selectedMember.slackConnect && (
                        <Badge variant="outline" className="mt-1">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          External
                        </Badge>
                      )}
                    </div>
                  </div>

                  {(selectedMember.statusEmoji || selectedMember.statusMessage) && (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      {selectedMember.statusEmoji && <span className="text-lg">{selectedMember.statusEmoji}</span>}
                      <span>{selectedMember.statusMessage || getStatusLabel(selectedMember.status)}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge className={getRoleColor(selectedMember.role)}>
                        {getRoleIcon(selectedMember.role)}
                        <span className="ml-1 capitalize">{selectedMember.role}</span>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4 text-gray-400" />
                        <span>{selectedMember.department}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-gray-400" />
                        <span>{selectedMember.jobTitle}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{selectedMember.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{selectedMember.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span>{selectedMember.timezone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{selectedMember.localTime} local</span>
                      </div>
                    </div>

                    {selectedMember.customFields.length > 0 && (
                      <div className="pt-3 border-t space-y-2">
                        {selectedMember.customFields.map((field, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">{field.label}:</span>
                            <span>{field.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button className="flex-1" onClick={() => { window.location.href = `mailto:${selectedMember.email}?subject=Message from Team Hub`; toast.success(`Opening email to ${selectedMember.name}`) }}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button variant="outline" onClick={() => { if (selectedMember.phone) { window.location.href = `tel:${selectedMember.phone}`; toast.success(`Calling ${selectedMember.name}`) } else { toast.error('No phone number available') } }}>
                      <Headphones className="w-4 h-4 mr-2" />
                      Huddle
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(selectedMember.email); toast.success('Copied!') }}>
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>

        {/* Channel Detail Dialog */}
        <Dialog open={!!selectedChannel} onOpenChange={() => setSelectedChannel(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedChannel && getChannelIcon(selectedChannel.type)}
                {selectedChannel?.name}
              </DialogTitle>
              <DialogDescription>{selectedChannel?.description}</DialogDescription>
            </DialogHeader>
            {selectedChannel && (
              <div className="space-y-4">
                {selectedChannel.topic && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm font-medium mb-1">Topic</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedChannel.topic}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{selectedChannel.memberCount} members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Created {formatDate(selectedChannel.createdAt)}</span>
                  </div>
                  {selectedChannel.canvasCount > 0 && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span>{selectedChannel.canvasCount} canvases</span>
                    </div>
                  )}
                  {selectedChannel.bookmarkCount > 0 && (
                    <div className="flex items-center gap-2">
                      <Bookmark className="w-4 h-4 text-gray-400" />
                      <span>{selectedChannel.bookmarkCount} bookmarks</span>
                    </div>
                  )}
                </div>

                {selectedChannel.externalConnections.length > 0 && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm font-medium mb-1 flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Slack Connect
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Connected with: {selectedChannel.externalConnections.join(', ')}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  <Button className="flex-1" onClick={() => {
                    toast.success('Opening channel')
                    setSelectedChannel(null)
                  }}>Open Channel</Button>
                  <Button variant="outline" size="icon" onClick={() => {
                    const newStarredState = !selectedChannel.isStarred
                    setChannels(prev => prev.map(ch =>
                      ch.id === selectedChannel.id ? { ...ch, isStarred: newStarredState } : ch
                    ))
                    setSelectedChannel({ ...selectedChannel, isStarred: newStarredState })
                    toast.success(newStarredState ? 'Channel starred' : 'Channel unstarred')
                  }}>
                    {selectedChannel.isStarred ? <Star className="w-4 h-4 fill-current text-yellow-500" /> : <Star className="w-4 h-4" />}
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(`#${selectedChannel.name}`); toast.success('Copied!') }}>
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Search Dialog */}
        <Dialog open={showSearch} onOpenChange={setShowSearch}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Search
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search messages, files, channels..." className="pl-10" autoFocus />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Try:</span>
                <button className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700">in:#engineering</button>
                <button className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700">from:@alex</button>
                <button className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700">has:link</button>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 mb-3">Recent Searches</p>
                <div className="space-y-2">
                  <button className="flex items-center gap-2 w-full p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>API documentation</span>
                  </button>
                  <button className="flex items-center gap-2 w-full p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>from:@emily design</span>
                  </button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* AI-Powered Team Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <AIInsightsPanel
            insights={teamHubAIInsights}
            onAskQuestion={(q) => toast.info('Question submitted')}
          />
          <PredictiveAnalytics predictions={teamHubPredictions} />
        </div>

        {/* Activity Feed */}
        <div className="mt-6">
          <ActivityFeed
            activities={teamHubActivities}
            maxItems={5}
            showFilters={true}
          />
        </div>

        {/* Quick Actions Toolbar */}
        <QuickActionsToolbar actions={teamHubQuickActions} />

        {/* Create Member Dialog */}
        <Dialog open={showCreateMemberDialog} onOpenChange={setShowCreateMemberDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-green-500" />
                Add Team Member
              </DialogTitle>
              <DialogDescription>Add a new member to your team</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="col-span-2">
                  <Label>Name *</Label>
                  <Input
                    value={memberForm.name}
                    onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                    placeholder="John Doe"
                    className="mt-1"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={memberForm.email}
                    onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                    placeholder="john@example.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <Input
                    value={memberForm.role}
                    onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                    placeholder="Developer"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Department</Label>
                  <select
                    value={memberForm.department}
                    onChange={(e) => setMemberForm({ ...memberForm, department: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="development">Development</option>
                    <option value="design">Design</option>
                    <option value="marketing">Marketing</option>
                    <option value="sales">Sales</option>
                    <option value="support">Support</option>
                    <option value="management">Management</option>
                    <option value="operations">Operations</option>
                    <option value="qa">QA</option>
                  </select>
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={memberForm.phone}
                    onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                    placeholder="+1 555-0123"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={memberForm.location}
                    onChange={(e) => setMemberForm({ ...memberForm, location: e.target.value })}
                    placeholder="New York, USA"
                    className="mt-1"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Skills (comma-separated)</Label>
                  <Input
                    value={memberForm.skills}
                    onChange={(e) => setMemberForm({ ...memberForm, skills: e.target.value })}
                    placeholder="React, TypeScript, Node.js"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateMemberDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateMember}
                disabled={isSaving || !memberForm.name || !memberForm.email}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Member
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Channel Dialog */}
        <Dialog open={showCreateChannelDialog} onOpenChange={setShowCreateChannelDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-blue-500" />
                Create Channel
              </DialogTitle>
              <DialogDescription>Create a new communication channel</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Channel Name</Label>
                <Input
                  placeholder="project-updates"
                  className="mt-1"
                  value={channelForm.name}
                  onChange={(e) => setChannelForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  placeholder="Updates and discussions for the project"
                  className="mt-1"
                  value={channelForm.description}
                  onChange={(e) => setChannelForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Private Channel</p>
                  <p className="text-sm text-gray-500">Only invited members can see this channel</p>
                </div>
                <Switch
                  checked={channelForm.isPrivate}
                  onCheckedChange={(checked) => setChannelForm(prev => ({ ...prev, isPrivate: checked }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setShowCreateChannelDialog(false)
                setChannelForm({ name: '', description: '', isPrivate: false })
              }}>Cancel</Button>
              <Button
                disabled={!channelForm.name.trim()}
                onClick={() => {
                  const newChannel: Channel = {
                    id: `channel-${Date.now()}`,
                    name: channelForm.name.toLowerCase().replace(/\s+/g, '-'),
                    type: channelForm.isPrivate ? 'private' : 'public',
                    description: channelForm.description,
                    topic: '',
                    memberCount: 1,
                    unreadCount: 0,
                    mentionCount: 0,
                    isPinned: false,
                    isMuted: false,
                    isArchived: false,
                    isStarred: false,
                    lastMessage: '',
                    lastMessageAt: new Date().toISOString(),
                    createdBy: 'You',
                    createdAt: new Date().toISOString().split('T')[0],
                    retentionDays: null,
                    canvasCount: 0,
                    bookmarkCount: 0,
                    notificationLevel: 'all',
                    externalConnections: []
                  }
                  setChannels(prev => [...prev, newChannel])
                  setShowCreateChannelDialog(false)
                  setChannelForm({ name: '', description: '', isPrivate: false })
                  toast.success('Channel created')
                }}
              >Create Channel</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Huddle Dialog */}
        <Dialog open={showHuddleDialog} onOpenChange={setShowHuddleDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Headphones className="w-5 h-5 text-green-500" />
                Start Huddle
              </DialogTitle>
              <DialogDescription>Start a quick audio chat with your team</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Select Channel</Label>
                <select
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={huddleForm.channelId || channels[0]?.id || ''}
                  onChange={(e) => setHuddleForm(prev => ({ ...prev, channelId: e.target.value }))}
                >
                  {channels.map(channel => (
                    <option key={channel.id} value={channel.id}>#{channel.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Enable Video</p>
                  <p className="text-sm text-gray-500">Start with video on</p>
                </div>
                <Switch
                  checked={huddleForm.enableVideo}
                  onCheckedChange={(checked) => setHuddleForm(prev => ({ ...prev, enableVideo: checked }))}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Record Huddle</p>
                  <p className="text-sm text-gray-500">Record this conversation</p>
                </div>
                <Switch
                  checked={huddleForm.recordHuddle}
                  onCheckedChange={(checked) => setHuddleForm(prev => ({ ...prev, recordHuddle: checked }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setShowHuddleDialog(false)
                setHuddleForm({ channelId: '', enableVideo: false, recordHuddle: false })
              }}>Cancel</Button>
              <Button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white" onClick={() => {
                const selectedChannelId = huddleForm.channelId || channels[0]?.id
                const selectedChannel = channels.find(c => c.id === selectedChannelId)
                const newHuddle: Huddle = {
                  id: `huddle-${Date.now()}`,
                  channelId: selectedChannelId,
                  channelName: selectedChannel?.name || 'general',
                  status: 'active',
                  startedAt: new Date().toISOString(),
                  duration: 0,
                  participants: [{
                    userId: 'current-user',
                    name: 'You',
                    avatar: '/avatars/default.jpg',
                    isSpeaking: false,
                    isMuted: false,
                    hasVideo: huddleForm.enableVideo
                  }],
                  isRecording: huddleForm.recordHuddle,
                  hasScreenShare: false
                }
                setHuddles(prev => [...prev, newHuddle])
                setShowHuddleDialog(false)
                setHuddleForm({ channelId: '', enableVideo: false, recordHuddle: false })
                toast.success('Huddle started')
              }}>
                <Headphones className="w-4 h-4 mr-2" />
                Start Huddle
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Notifications Panel Dialog */}
        <Dialog open={showNotificationsPanel} onOpenChange={setShowNotificationsPanel}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-500" />
                Notifications
              </DialogTitle>
              <DialogDescription>You have {stats.totalMentions} unread mentions</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4 py-4">
                {activities.slice(0, 5).map(activity => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={activity.userAvatar} alt="User avatar" />
                      <AvatarFallback>{activity.userName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.userName}</p>
                      <p className="text-sm text-gray-500">{activity.content}</p>
                      <p className="text-xs text-gray-400 mt-1">#{activity.channelName} - {formatTimeAgo(activity.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowNotificationsPanel(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Approval Queue Dialog */}
        <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-green-500" />
                Approval Queue
              </DialogTitle>
              <DialogDescription>Review pending member requests</DialogDescription>
            </DialogHeader>
            <div className="py-8 text-center">
              <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No pending requests</h3>
              <p className="text-gray-500">All member requests have been processed</p>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add App Dialog */}
        <Dialog open={showAddAppDialog} onOpenChange={setShowAddAppDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-500" />
                Add App
              </DialogTitle>
              <DialogDescription>Browse and install apps for your workspace</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input placeholder="Search apps..." className="w-full" />
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {apps.map(app => (
                    <div key={app.id} className="flex items-center gap-3 p-3 border rounded-lg hover:border-purple-500 cursor-pointer transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl">
                        {app.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{app.name}</h4>
                        <p className="text-xs text-gray-500 truncate">{app.description}</p>
                      </div>
                      <Button size="sm" variant={app.isInstalled ? 'secondary' : 'default'} onClick={() => {
                        const newInstalledState = !app.isInstalled
                        setApps(prev => prev.map(a =>
                          a.id === app.id ? { ...a, isInstalled: newInstalledState } : a
                        ))
                        toast.success(newInstalledState ? 'App installed' : 'App removed')
                      }}>
                        {app.isInstalled ? 'Installed' : 'Add'}
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowAddAppDialog(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Workflow Builder Dialog */}
        <Dialog open={showWorkflowBuilderDialog} onOpenChange={setShowWorkflowBuilderDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Workflow className="w-5 h-5 text-indigo-500" />
                Create Workflow
              </DialogTitle>
              <DialogDescription>Automate tasks and processes for your team</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Workflow Name</Label>
                <Input
                  placeholder="My Workflow"
                  className="mt-1"
                  value={workflowForm.name}
                  onChange={(e) => setWorkflowForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  placeholder="What does this workflow do?"
                  className="mt-1"
                  value={workflowForm.description}
                  onChange={(e) => setWorkflowForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <Label>Trigger</Label>
                <select
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={workflowForm.trigger}
                  onChange={(e) => setWorkflowForm(prev => ({ ...prev, trigger: e.target.value as WorkflowTrigger }))}
                >
                  <option value="channel_message">When a message is posted</option>
                  <option value="emoji_reaction">When an emoji is added</option>
                  <option value="new_member">When a new member joins</option>
                  <option value="scheduled">On a schedule</option>
                  <option value="webhook">Via webhook</option>
                </select>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add steps to your workflow after creation. Steps can include sending messages, creating channels, adding reactions, and more.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setShowWorkflowBuilderDialog(false)
                setWorkflowForm({ name: '', description: '', trigger: 'channel_message' })
              }}>Cancel</Button>
              <Button
                disabled={!workflowForm.name.trim()}
                onClick={() => {
                  const newWorkflow: SlackWorkflow = {
                    id: `workflow-${Date.now()}`,
                    name: workflowForm.name,
                    description: workflowForm.description,
                    trigger: workflowForm.trigger,
                    triggerChannel: null,
                    steps: [],
                    isEnabled: true,
                    createdBy: 'You',
                    createdAt: new Date().toISOString().split('T')[0],
                    runCount: 0,
                    lastRun: null,
                    errorCount: 0
                  }
                  setWorkflows(prev => [...prev, newWorkflow])
                  setShowWorkflowBuilderDialog(false)
                  setWorkflowForm({ name: '', description: '', trigger: 'channel_message' })
                  toast.success('Workflow created')
                }}
              >
                Create Workflow
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reactions Dialog */}
        <Dialog open={showReactionsDialog} onOpenChange={setShowReactionsDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Smile className="w-5 h-5 text-yellow-500" />
                Add Reaction
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="grid grid-cols-8 gap-2">
                {['👍', '👎', '❤️', '🎉', '🔥', '👀', '✅', '❌', '💯', '🚀', '💪', '🙏', '😊', '😂', '🤔', '😍'].map(emoji => (
                  <button
                    key={emoji}
                    className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    onClick={() => {
                      if (selectedMessageForReaction) {
                        setMessages(prev => prev.map(msg =>
                          msg.id === selectedMessageForReaction.id
                            ? {
                                ...msg,
                                reactions: [
                                  ...msg.reactions.filter(r => r.emoji !== emoji),
                                  {
                                    emoji,
                                    count: (msg.reactions.find(r => r.emoji === emoji)?.count || 0) + 1,
                                    users: [...(msg.reactions.find(r => r.emoji === emoji)?.users || []), 'current-user'],
                                    isCustom: false
                                  }
                                ]
                              }
                            : msg
                        ))
                      }
                      setShowReactionsDialog(false)
                      setSelectedMessageForReaction(null)
                      toast.success('Reaction added')
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Thread Dialog */}
        <Dialog open={showThreadDialog} onOpenChange={setShowThreadDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-500" />
                Thread
              </DialogTitle>
              {selectedMessageForThread && (
                <DialogDescription>Reply to {selectedMessageForThread.senderName}</DialogDescription>
              )}
            </DialogHeader>
            {selectedMessageForThread && (
              <div className="space-y-4 py-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={selectedMessageForThread.senderAvatar} alt="User avatar" />
                      <AvatarFallback>{selectedMessageForThread.senderName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">{selectedMessageForThread.senderName}</span>
                    <span className="text-xs text-gray-500">{formatTime(selectedMessageForThread.timestamp)}</span>
                  </div>
                  <p className="text-sm">{selectedMessageForThread.content}</p>
                </div>
                {/* Show existing replies */}
                {selectedMessageForThread.replies.length > 0 && (
                  <div className="space-y-2">
                    {selectedMessageForThread.replies.map(reply => (
                      <div key={reply.id} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg ml-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Avatar className="w-5 h-5">
                            <AvatarImage src={reply.senderAvatar} alt="User avatar" />
                            <AvatarFallback>{reply.senderName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-xs">{reply.senderName}</span>
                          <span className="text-xs text-gray-500">{formatTime(reply.timestamp)}</span>
                        </div>
                        <p className="text-xs">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div>
                  <Label>Your Reply</Label>
                  <Input
                    placeholder="Write a reply..."
                    className="mt-1"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setShowThreadDialog(false)
                setSelectedMessageForThread(null)
                setReplyContent('')
              }}>Cancel</Button>
              <Button
                disabled={!replyContent.trim()}
                onClick={() => {
                  if (selectedMessageForThread && replyContent.trim()) {
                    const newReply: Reply = {
                      id: `reply-${Date.now()}`,
                      content: replyContent,
                      senderId: 'current-user',
                      senderName: 'You',
                      senderAvatar: '/avatars/default.jpg',
                      timestamp: new Date().toISOString(),
                      reactions: []
                    }
                    setMessages(prev => prev.map(msg =>
                      msg.id === selectedMessageForThread.id
                        ? {
                            ...msg,
                            replies: [...msg.replies, newReply],
                            replyCount: msg.replyCount + 1
                          }
                        : msg
                    ))
                    setShowThreadDialog(false)
                    setSelectedMessageForThread(null)
                    setReplyContent('')
                    toast.success('Reply sent')
                  }
                }}
              >
                Send Reply
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
