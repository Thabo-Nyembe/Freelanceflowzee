'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Users,
  Plus,
  MessageSquare,
  FileText,
  Video,
  Calendar,
  CheckCircle,
  TrendingUp,
  Share2,
  Trash2,
  Lock,
  Star,
  MoreHorizontal,
  Search,
  Grid,
  List,
  Layout,
  Download,
  Upload,
  Settings,
  Palette,
  Link2,
  History,
  Play,
  Presentation,
  ExternalLink,
  FolderOpen,
  File,
  FileVideo,
  FileImage,
  FileAudio,
  LayoutTemplate,
  Crown,
  Send,
  Smile,
  Paperclip,
  ScreenShare,
  Hash,
  Bell,
  BellOff,
  Pin,
  Reply,
  MoreVertical,
  UserPlus,
  Settings2,
  Zap,
  Globe,
  AlertCircle
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

// Types
type BoardType = 'whiteboard' | 'flowchart' | 'mindmap' | 'wireframe' | 'kanban' | 'brainstorm' | 'retrospective'
type BoardStatus = 'active' | 'archived' | 'template'
type AccessLevel = 'view' | 'comment' | 'edit' | 'admin'
type MeetingStatus = 'scheduled' | 'live' | 'ended' | 'cancelled'
type ChannelType = 'public' | 'private' | 'direct'
type FileType = 'document' | 'image' | 'video' | 'audio' | 'spreadsheet' | 'presentation' | 'other'
type PresenceStatus = 'online' | 'away' | 'busy' | 'offline' | 'dnd'

interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'owner' | 'admin' | 'member' | 'guest'
  presence: PresenceStatus
  cursorColor: string
  lastActive: string
  department?: string
  title?: string
}

interface Board {
  id: string
  name: string
  description?: string
  type: BoardType
  status: BoardStatus
  createdAt: string
  updatedAt: string
  createdBy: TeamMember
  members: TeamMember[]
  isStarred: boolean
  isLocked: boolean
  isPublic: boolean
  viewCount: number
  commentCount: number
  elementCount: number
  version: number
  tags: string[]
  teamId?: string
  teamName?: string
  channelId?: string
}

interface Channel {
  id: string
  name: string
  type: ChannelType
  description?: string
  memberCount: number
  unreadCount: number
  isPinned: boolean
  isMuted: boolean
  lastMessage?: Message
  createdAt: string
}

interface Message {
  id: string
  channelId: string
  author: TeamMember
  content: string
  timestamp: string
  isEdited: boolean
  isPinned: boolean
  reactions: { emoji: string; count: number; users: string[] }[]
  replyTo?: string
  attachments: Attachment[]
  mentions: string[]
}

interface Meeting {
  id: string
  title: string
  description?: string
  status: MeetingStatus
  startTime: string
  endTime?: string
  duration: number
  organizer: TeamMember
  participants: TeamMember[]
  isRecurring: boolean
  recurrence?: string
  hasRecording: boolean
  recordingUrl?: string
  meetingUrl: string
  channelId?: string
}

interface SharedFile {
  id: string
  name: string
  type: FileType
  size: number
  uploadedBy: TeamMember
  uploadedAt: string
  modifiedAt: string
  sharedWith: string[]
  channelId?: string
  downloadCount: number
  version: number
  isStarred: boolean
}

interface Attachment {
  id: string
  name: string
  type: FileType
  size: number
  url: string
}

interface Team {
  id: string
  name: string
  description?: string
  avatar?: string
  memberCount: number
  boardCount: number
  channelCount: number
  plan: 'free' | 'starter' | 'business' | 'enterprise'
  role: 'owner' | 'admin' | 'member' | 'guest'
  createdAt: string
}

interface Activity {
  id: string
  type: 'board' | 'meeting' | 'file' | 'message' | 'member'
  user: TeamMember
  action: string
  description: string
  resourceId: string
  resourceName: string
  timestamp: string
}

interface Template {
  id: string
  name: string
  description: string
  category: 'project' | 'meeting' | 'brainstorm' | 'planning' | 'design' | 'agile'
  preview: string
  usageCount: number
  createdBy: string
  isOfficial: boolean
}

interface Integration {
  id: string
  name: string
  type: 'calendar' | 'storage' | 'communication' | 'productivity' | 'development'
  status: 'connected' | 'disconnected' | 'error'
  icon: string
  lastSync: string
}

interface Automation {
  id: string
  name: string
  trigger: string
  actions: string[]
  isActive: boolean
  lastTriggered?: string
}

// Mock Data
const mockMembers: TeamMember[] = [
  { id: '1', name: 'Sarah Chen', email: 'sarah@example.com', role: 'admin', presence: 'online', cursorColor: '#3B82F6', lastActive: '2024-01-15T14:30:00Z', department: 'Product', title: 'Product Manager' },
  { id: '2', name: 'Mike Johnson', email: 'mike@example.com', role: 'member', presence: 'online', cursorColor: '#10B981', lastActive: '2024-01-15T14:28:00Z', department: 'Engineering', title: 'Senior Developer' },
  { id: '3', name: 'Emily Davis', email: 'emily@example.com', role: 'member', presence: 'away', cursorColor: '#F59E0B', lastActive: '2024-01-15T12:00:00Z', department: 'Design', title: 'UX Designer' },
  { id: '4', name: 'Alex Kim', email: 'alex@example.com', role: 'member', presence: 'busy', cursorColor: '#EF4444', lastActive: '2024-01-15T14:25:00Z', department: 'Engineering', title: 'Developer' },
  { id: '5', name: 'Jordan Lee', email: 'jordan@example.com', role: 'guest', presence: 'offline', cursorColor: '#8B5CF6', lastActive: '2024-01-14T18:00:00Z', department: 'Marketing', title: 'Marketing Lead' }
]

const mockBoards: Board[] = [
  { id: '1', name: 'Product Roadmap 2024', description: 'Strategic planning and feature prioritization', type: 'kanban', status: 'active', createdAt: '2024-01-10T10:00:00Z', updatedAt: '2024-01-15T14:30:00Z', createdBy: mockMembers[0], members: mockMembers.slice(0, 4), isStarred: true, isLocked: false, isPublic: false, viewCount: 245, commentCount: 32, elementCount: 156, version: 47, tags: ['roadmap', 'planning'], teamId: 't1', teamName: 'Product Team', channelId: 'c1' },
  { id: '2', name: 'User Flow Diagrams', description: 'Main user journeys and flows', type: 'flowchart', status: 'active', createdAt: '2024-01-08T09:00:00Z', updatedAt: '2024-01-15T11:20:00Z', createdBy: mockMembers[2], members: mockMembers.slice(0, 3), isStarred: true, isLocked: false, isPublic: true, viewCount: 189, commentCount: 18, elementCount: 89, version: 23, tags: ['ux', 'design'], teamId: 't2', teamName: 'Design Team', channelId: 'c2' },
  { id: '3', name: 'Sprint Retrospective', description: 'Team reflection on Sprint 24', type: 'retrospective', status: 'active', createdAt: '2024-01-14T15:00:00Z', updatedAt: '2024-01-15T10:00:00Z', createdBy: mockMembers[1], members: mockMembers, isStarred: false, isLocked: false, isPublic: false, viewCount: 56, commentCount: 45, elementCount: 67, version: 12, tags: ['agile', 'retro'], teamId: 't1', teamName: 'Product Team', channelId: 'c1' },
  { id: '4', name: 'Architecture Diagram', description: 'System architecture overview', type: 'flowchart', status: 'active', createdAt: '2024-01-05T10:00:00Z', updatedAt: '2024-01-14T16:00:00Z', createdBy: mockMembers[3], members: mockMembers.slice(1, 4), isStarred: false, isLocked: true, isPublic: false, viewCount: 312, commentCount: 23, elementCount: 198, version: 56, tags: ['architecture', 'technical'], teamId: 't3', teamName: 'Engineering', channelId: 'c3' }
]

const mockChannels: Channel[] = [
  { id: 'c1', name: 'general', type: 'public', description: 'General team discussions', memberCount: 45, unreadCount: 12, isPinned: true, isMuted: false, createdAt: '2024-01-01', lastMessage: { id: 'm1', channelId: 'c1', author: mockMembers[0], content: 'Great work on the release everyone!', timestamp: '2024-01-15T14:30:00Z', isEdited: false, isPinned: false, reactions: [{ emoji: '🎉', count: 5, users: ['1', '2', '3', '4', '5'] }], attachments: [], mentions: [] } },
  { id: 'c2', name: 'design-team', type: 'private', description: 'Design discussions and reviews', memberCount: 8, unreadCount: 3, isPinned: false, isMuted: false, createdAt: '2024-01-05', lastMessage: { id: 'm2', channelId: 'c2', author: mockMembers[2], content: 'New mockups are ready for review', timestamp: '2024-01-15T12:00:00Z', isEdited: false, isPinned: true, reactions: [], attachments: [], mentions: ['1'] } },
  { id: 'c3', name: 'engineering', type: 'private', description: 'Engineering team channel', memberCount: 25, unreadCount: 0, isPinned: true, isMuted: false, createdAt: '2024-01-02' },
  { id: 'c4', name: 'random', type: 'public', description: 'Off-topic fun', memberCount: 40, unreadCount: 8, isPinned: false, isMuted: true, createdAt: '2024-01-01' },
  { id: 'c5', name: 'announcements', type: 'public', description: 'Company-wide announcements', memberCount: 120, unreadCount: 1, isPinned: true, isMuted: false, createdAt: '2024-01-01' }
]

const mockMessages: Message[] = [
  { id: 'm1', channelId: 'c1', author: mockMembers[0], content: 'Hey team! Just pushed the latest updates to the roadmap board. Please review when you get a chance.', timestamp: '2024-01-15T14:30:00Z', isEdited: false, isPinned: false, reactions: [{ emoji: '👍', count: 3, users: ['2', '3', '4'] }], attachments: [], mentions: [] },
  { id: 'm2', channelId: 'c1', author: mockMembers[1], content: 'Looks great @Sarah! I have a few suggestions for the Q2 timeline.', timestamp: '2024-01-15T14:32:00Z', isEdited: false, isPinned: false, reactions: [], attachments: [], mentions: ['1'] },
  { id: 'm3', channelId: 'c1', author: mockMembers[2], content: 'I\'ve attached the updated wireframes for the new feature.', timestamp: '2024-01-15T14:35:00Z', isEdited: false, isPinned: true, reactions: [{ emoji: '🎨', count: 2, users: ['1', '3'] }], attachments: [{ id: 'a1', name: 'wireframes-v2.fig', type: 'document', size: 2456000, url: '#' }], mentions: [] },
  { id: 'm4', channelId: 'c1', author: mockMembers[3], content: 'Sprint planning meeting in 30 minutes. Don\'t forget!', timestamp: '2024-01-15T14:40:00Z', isEdited: false, isPinned: false, reactions: [{ emoji: '⏰', count: 4, users: ['1', '2', '3', '4'] }], attachments: [], mentions: [] },
  { id: 'm5', channelId: 'c1', author: mockMembers[0], content: 'Great work on the release everyone! 🎉', timestamp: '2024-01-15T15:00:00Z', isEdited: false, isPinned: false, reactions: [{ emoji: '🎉', count: 5, users: ['1', '2', '3', '4', '5'] }, { emoji: '🚀', count: 3, users: ['1', '2', '4'] }], attachments: [], mentions: [] }
]

const mockMeetings: Meeting[] = [
  { id: 'mt1', title: 'Sprint Planning', description: 'Plan Sprint 25 backlog', status: 'scheduled', startTime: '2024-01-16T10:00:00Z', duration: 60, organizer: mockMembers[0], participants: mockMembers.slice(0, 4), isRecurring: true, recurrence: 'Every 2 weeks', hasRecording: false, meetingUrl: 'https://meet.example.com/sprint-planning', channelId: 'c1' },
  { id: 'mt2', title: 'Design Review', description: 'Review new feature designs', status: 'live', startTime: '2024-01-15T14:00:00Z', duration: 45, organizer: mockMembers[2], participants: mockMembers.slice(0, 3), isRecurring: false, hasRecording: true, meetingUrl: 'https://meet.example.com/design-review' },
  { id: 'mt3', title: 'Team Standup', description: 'Daily standup meeting', status: 'ended', startTime: '2024-01-15T09:00:00Z', endTime: '2024-01-15T09:15:00Z', duration: 15, organizer: mockMembers[1], participants: mockMembers, isRecurring: true, recurrence: 'Every weekday', hasRecording: true, recordingUrl: '#', meetingUrl: 'https://meet.example.com/standup', channelId: 'c3' },
  { id: 'mt4', title: 'Product Demo', description: 'Demo new features to stakeholders', status: 'scheduled', startTime: '2024-01-17T15:00:00Z', duration: 90, organizer: mockMembers[0], participants: mockMembers, isRecurring: false, hasRecording: false, meetingUrl: 'https://meet.example.com/product-demo' }
]

const mockFiles: SharedFile[] = [
  { id: 'f1', name: 'Product Roadmap 2024.pdf', type: 'document', size: 2456000, uploadedBy: mockMembers[0], uploadedAt: '2024-01-10T10:00:00Z', modifiedAt: '2024-01-15T14:00:00Z', sharedWith: ['c1'], downloadCount: 45, version: 3, isStarred: true },
  { id: 'f2', name: 'Design System.fig', type: 'document', size: 15678000, uploadedBy: mockMembers[2], uploadedAt: '2024-01-08T09:00:00Z', modifiedAt: '2024-01-14T16:00:00Z', sharedWith: ['c2'], downloadCount: 28, version: 12, isStarred: true },
  { id: 'f3', name: 'Sprint Review Recording.mp4', type: 'video', size: 156780000, uploadedBy: mockMembers[1], uploadedAt: '2024-01-12T15:00:00Z', modifiedAt: '2024-01-12T15:00:00Z', sharedWith: ['c1', 'c3'], downloadCount: 12, version: 1, isStarred: false },
  { id: 'f4', name: 'Q1 Budget.xlsx', type: 'spreadsheet', size: 345000, uploadedBy: mockMembers[0], uploadedAt: '2024-01-05T10:00:00Z', modifiedAt: '2024-01-10T11:00:00Z', sharedWith: ['c1'], downloadCount: 8, version: 2, isStarred: false },
  { id: 'f5', name: 'Brand Guidelines.pdf', type: 'document', size: 8900000, uploadedBy: mockMembers[2], uploadedAt: '2024-01-02T14:00:00Z', modifiedAt: '2024-01-02T14:00:00Z', sharedWith: ['c1', 'c2'], downloadCount: 67, version: 1, isStarred: true },
  { id: 'f6', name: 'Product Demo.pptx', type: 'presentation', size: 12340000, uploadedBy: mockMembers[0], uploadedAt: '2024-01-14T09:00:00Z', modifiedAt: '2024-01-15T10:00:00Z', sharedWith: ['c1'], downloadCount: 23, version: 4, isStarred: false }
]

const mockTeams: Team[] = [
  { id: 't1', name: 'Product Team', description: 'Product management and strategy', memberCount: 12, boardCount: 24, channelCount: 5, plan: 'business', role: 'admin', createdAt: '2023-06-01' },
  { id: 't2', name: 'Design Team', description: 'UX and visual design', memberCount: 8, boardCount: 18, channelCount: 3, plan: 'business', role: 'member', createdAt: '2023-06-01' },
  { id: 't3', name: 'Engineering', description: 'Development and infrastructure', memberCount: 25, boardCount: 42, channelCount: 8, plan: 'enterprise', role: 'member', createdAt: '2023-01-15' }
]

const mockActivities: Activity[] = [
  { id: 'a1', type: 'board', user: mockMembers[0], action: 'updated', description: 'Updated roadmap timeline', resourceId: '1', resourceName: 'Product Roadmap 2024', timestamp: '2024-01-15T14:30:00Z' },
  { id: 'a2', type: 'message', user: mockMembers[1], action: 'sent', description: 'Sent a message', resourceId: 'c1', resourceName: '#general', timestamp: '2024-01-15T14:32:00Z' },
  { id: 'a3', type: 'file', user: mockMembers[2], action: 'uploaded', description: 'Uploaded wireframes', resourceId: 'f2', resourceName: 'Design System.fig', timestamp: '2024-01-15T12:00:00Z' },
  { id: 'a4', type: 'meeting', user: mockMembers[0], action: 'scheduled', description: 'Scheduled a meeting', resourceId: 'mt4', resourceName: 'Product Demo', timestamp: '2024-01-15T11:00:00Z' },
  { id: 'a5', type: 'member', user: mockMembers[0], action: 'invited', description: 'Invited Jordan Lee', resourceId: '5', resourceName: 'Jordan Lee', timestamp: '2024-01-14T16:00:00Z' }
]

const mockTemplates: Template[] = [
  { id: 'tmp1', name: 'Sprint Planning Board', description: 'Kanban board for sprint planning with backlog and status columns', category: 'agile', preview: '/templates/sprint.png', usageCount: 1245, createdBy: 'Collaboration Team', isOfficial: true },
  { id: 'tmp2', name: 'Design Brainstorm', description: 'Visual brainstorming canvas with sticky notes and mood boards', category: 'brainstorm', preview: '/templates/brainstorm.png', usageCount: 892, createdBy: 'Design Team', isOfficial: true },
  { id: 'tmp3', name: 'Weekly Standup', description: 'Meeting template for weekly team standups with agenda sections', category: 'meeting', preview: '/templates/standup.png', usageCount: 2156, createdBy: 'Collaboration Team', isOfficial: true },
  { id: 'tmp4', name: 'Product Roadmap', description: 'Timeline-based roadmap for product planning and releases', category: 'planning', preview: '/templates/roadmap.png', usageCount: 1567, createdBy: 'Product Team', isOfficial: true },
  { id: 'tmp5', name: 'User Flow Diagram', description: 'Template for mapping user journeys and application flows', category: 'design', preview: '/templates/userflow.png', usageCount: 734, createdBy: 'Design Team', isOfficial: true },
  { id: 'tmp6', name: 'Project Kickoff', description: 'Comprehensive template for new project kickoff meetings', category: 'project', preview: '/templates/kickoff.png', usageCount: 1089, createdBy: 'Collaboration Team', isOfficial: true }
]

const mockIntegrations: Integration[] = [
  { id: 'int1', name: 'Google Calendar', type: 'calendar', status: 'connected', icon: 'calendar', lastSync: '2024-01-15T14:00:00Z' },
  { id: 'int2', name: 'Slack', type: 'communication', status: 'connected', icon: 'slack', lastSync: '2024-01-15T14:30:00Z' },
  { id: 'int3', name: 'Google Drive', type: 'storage', status: 'connected', icon: 'drive', lastSync: '2024-01-15T13:00:00Z' },
  { id: 'int4', name: 'Jira', type: 'productivity', status: 'connected', icon: 'jira', lastSync: '2024-01-15T12:00:00Z' },
  { id: 'int5', name: 'GitHub', type: 'development', status: 'disconnected', icon: 'github', lastSync: '2024-01-10T09:00:00Z' },
  { id: 'int6', name: 'Figma', type: 'productivity', status: 'connected', icon: 'figma', lastSync: '2024-01-15T14:15:00Z' },
  { id: 'int7', name: 'Dropbox', type: 'storage', status: 'error', icon: 'dropbox', lastSync: '2024-01-14T16:00:00Z' },
  { id: 'int8', name: 'Microsoft Teams', type: 'communication', status: 'disconnected', icon: 'teams', lastSync: '2024-01-05T10:00:00Z' }
]

const mockAutomations: Automation[] = [
  { id: 'aut1', name: 'Auto-assign new tasks', trigger: 'When task is created', actions: ['Assign to project lead', 'Notify team channel'], isActive: true, lastTriggered: '2024-01-15T14:30:00Z' },
  { id: 'aut2', name: 'Meeting reminder', trigger: '15 minutes before meeting', actions: ['Send desktop notification', 'Post in meeting channel'], isActive: true, lastTriggered: '2024-01-15T09:45:00Z' },
  { id: 'aut3', name: 'Weekly digest', trigger: 'Every Monday at 9:00 AM', actions: ['Generate activity report', 'Send email to team'], isActive: true, lastTriggered: '2024-01-15T09:00:00Z' },
  { id: 'aut4', name: 'File backup', trigger: 'When file is uploaded', actions: ['Sync to Google Drive', 'Create version history'], isActive: false },
  { id: 'aut5', name: 'Sprint completion', trigger: 'When sprint ends', actions: ['Generate sprint report', 'Create retrospective board', 'Notify stakeholders'], isActive: true, lastTriggered: '2024-01-12T18:00:00Z' },
  { id: 'aut6', name: 'Overdue task alert', trigger: 'Daily at 10:00 AM', actions: ['Check for overdue tasks', 'Send reminder to assignees', 'Update manager'], isActive: true, lastTriggered: '2024-01-15T10:00:00Z' }
]

// ============================================================================
// ENHANCED COMPETITIVE UPGRADE MOCK DATA - Miro/Figma Level
// ============================================================================

const mockCollabAIInsights = [
  { id: '1', type: 'success' as const, title: 'Active Collaboration', description: '15 team members actively editing boards. Peak collaboration time!', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Engagement' },
  { id: '2', type: 'warning' as const, title: 'Meeting Conflict', description: 'You have overlapping meetings scheduled for tomorrow at 2pm.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Scheduling' },
  { id: '3', type: 'info' as const, title: 'Board Insights', description: 'Product Roadmap board has highest engagement this week.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Analytics' },
]

const mockCollabCollaborators = [
  { id: '1', name: 'Product Manager', avatar: '/avatars/pm.jpg', status: 'online' as const, role: 'PM' },
  { id: '2', name: 'UX Designer', avatar: '/avatars/ux.jpg', status: 'online' as const, role: 'Design' },
  { id: '3', name: 'Developer', avatar: '/avatars/dev.jpg', status: 'away' as const, role: 'Dev' },
]

const mockCollabPredictions = [
  { id: '1', title: 'Meeting Efficiency', prediction: 'Standups running 15% shorter with new format', confidence: 93, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Board Usage', prediction: 'Whiteboard usage expected to double during planning week', confidence: 86, trend: 'up' as const, impact: 'medium' as const },
]

const mockCollabActivities = [
  { id: '1', user: 'Product Manager', action: 'Created', target: 'Q1 Planning whiteboard', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'UX Designer', action: 'Shared', target: 'new wireframes in Design Board', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'Developer', action: 'Joined', target: 'Sprint Retro meeting', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

const mockCollabQuickActions = [
  { id: '1', label: 'New Board', icon: 'plus', action: () => {
    const boardName = `Board_${new Date().toLocaleTimeString()}`;
    const newBoard: Board = {
      id: `b${Date.now()}`,
      name: boardName,
      description: 'New collaboration board',
      type: 'whiteboard',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: mockMembers[0],
      members: [mockMembers[0]],
      isStarred: false,
      isLocked: false,
      isPublic: false,
      viewCount: 0,
      commentCount: 0,
      elementCount: 0,
      version: 1,
      tags: ['new'],
    };
    mockBoards.push(newBoard);
    toast.success('Board created successfully');
  }, variant: 'default' as const },
  { id: '2', label: 'Schedule Meeting', icon: 'calendar', action: () => {
    const newMeeting: Meeting = {
      id: `mt${Date.now()}`,
      title: 'New Meeting',
      status: 'scheduled',
      startTime: new Date(Date.now() + 3600000).toISOString(),
      duration: 60,
      organizer: mockMembers[0],
      participants: mockMembers.slice(0, 2),
      isRecurring: false,
      hasRecording: false,
      meetingUrl: 'https://meet.example.com/new-meeting'
    };
    mockMeetings.push(newMeeting);
    toast.success('Meeting scheduler ready');
  }, variant: 'default' as const },
  { id: '3', label: 'Start Call', icon: 'video', action: () => {
    window.open('https://meet.example.com/instant-call', '_blank');
    toast.success('Call started');
  }, variant: 'outline' as const },
]

export default function CollaborationClient() {
  const [activeTab, setActiveTab] = useState('boards')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null)
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [showNewMeeting, setShowNewMeeting] = useState(false)
  const [showNewChannel, setShowNewChannel] = useState(false)
  const [messageInput, setMessageInput] = useState('')
  const [settingsTab, setSettingsTab] = useState('general')
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [showIntegrationDialog, setShowIntegrationDialog] = useState(false)
  const [showAutomationDialog, setShowAutomationDialog] = useState(false)
  const [showNewBoardDialog, setShowNewBoardDialog] = useState(false)
  const [showInviteMemberDialog, setShowInviteMemberDialog] = useState(false)
  const [showStarredBoardsDialog, setShowStarredBoardsDialog] = useState(false)
  const [showScheduleMeetingDialog, setShowScheduleMeetingDialog] = useState(false)
  const [showRecordingsDialog, setShowRecordingsDialog] = useState(false)
  const [showMeetingSettingsDialog, setShowMeetingSettingsDialog] = useState(false)
  const [showUploadFileDialog, setShowUploadFileDialog] = useState(false)
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false)
  const [showStarredFilesDialog, setShowStarredFilesDialog] = useState(false)
  const [showRecentFilesDialog, setShowRecentFilesDialog] = useState(false)
  const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false)
  const [showTeamSettingsDialog, setShowTeamSettingsDialog] = useState(false)
  const [showPrivateChannelDialog, setShowPrivateChannelDialog] = useState(false)
  const [showPinnedChannelsDialog, setShowPinnedChannelsDialog] = useState(false)
  const [showBrowseChannelsDialog, setShowBrowseChannelsDialog] = useState(false)
  const [showBoardActivityDialog, setShowBoardActivityDialog] = useState(false)
  const [showMessagesActivityDialog, setShowMessagesActivityDialog] = useState(false)
  const [showFileUploadsActivityDialog, setShowFileUploadsActivityDialog] = useState(false)
  const [showTeamUpdatesActivityDialog, setShowTeamUpdatesActivityDialog] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')
  const [newBoardDescription, setNewBoardDescription] = useState('')
  const [newBoardType, setNewBoardType] = useState<BoardType>('whiteboard')
  const [inviteEmail, setInviteEmail] = useState('')
  const [newFolderName, setNewFolderName] = useState('')
  const [newTeamName, setNewTeamName] = useState('')
  const [newTeamDescription, setNewTeamDescription] = useState('')
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [activityFilter, setActivityFilter] = useState<string>('all')
  const [selectedWorkspaceColor, setSelectedWorkspaceColor] = useState<string>('#3B82F6')
  const [selectedAccentColor, setSelectedAccentColor] = useState<string>('#3B82F6')
  const [showColorPickerDialog, setShowColorPickerDialog] = useState(false)
  const [colorPickerType, setColorPickerType] = useState<'workspace' | 'accent'>('workspace')

  // New dialog states for replacing toast-only handlers
  const [showChannelOptionsDialog, setShowChannelOptionsDialog] = useState(false)
  const [showEmojiPickerDialog, setShowEmojiPickerDialog] = useState(false)
  const [showMessageOptionsDialog, setShowMessageOptionsDialog] = useState(false)
  const [showFileOptionsDialog, setShowFileOptionsDialog] = useState(false)
  const [showChannelInfoDialog, setShowChannelInfoDialog] = useState(false)
  const [showAutomationOptionsDialog, setShowAutomationOptionsDialog] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [selectedFile, setSelectedFile] = useState<SharedFile | null>(null)
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null)
  const [emojiTarget, setEmojiTarget] = useState<'message' | 'chat'>('chat')
  const [selectedEmoji, setSelectedEmoji] = useState<string>('')

  const filteredBoards = useMemo(() => {
    return mockBoards.filter(board => {
      return board.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             board.description?.toLowerCase().includes(searchQuery.toLowerCase())
    })
  }, [searchQuery])

  const stats = useMemo(() => ({
    totalBoards: mockBoards.length,
    activeBoards: mockBoards.filter(b => b.status === 'active').length,
    totalMembers: mockMembers.length,
    onlineNow: mockMembers.filter(m => m.presence === 'online').length,
    totalChannels: mockChannels.length,
    unreadMessages: mockChannels.reduce((sum, c) => sum + c.unreadCount, 0),
    scheduledMeetings: mockMeetings.filter(m => m.status === 'scheduled').length,
    sharedFiles: mockFiles.length
  }), [])

  const statsCards = [
    { label: 'Boards', value: stats.totalBoards.toString(), icon: Layout, color: 'from-blue-500 to-blue-600' },
    { label: 'Online', value: stats.onlineNow.toString(), icon: Users, color: 'from-green-500 to-green-600' },
    { label: 'Channels', value: stats.totalChannels.toString(), icon: Hash, color: 'from-purple-500 to-purple-600' },
    { label: 'Unread', value: stats.unreadMessages.toString(), icon: MessageSquare, color: 'from-amber-500 to-amber-600' },
    { label: 'Meetings', value: stats.scheduledMeetings.toString(), icon: Video, color: 'from-cyan-500 to-cyan-600' },
    { label: 'Files', value: stats.sharedFiles.toString(), icon: FileText, color: 'from-rose-500 to-rose-600' },
    { label: 'Teams', value: mockTeams.length.toString(), icon: Users, color: 'from-indigo-500 to-indigo-600' },
    { label: 'Activity', value: mockActivities.length.toString(), icon: TrendingUp, color: 'from-teal-500 to-teal-600' }
  ]

  const formatTimeAgo = (date: string) => {
    const now = new Date()
    const then = new Date(date)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const formatSize = (bytes: number) => {
    if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${bytes} B`
  }

  const getPresenceColor = (presence: PresenceStatus): string => {
    const colors: Record<PresenceStatus, string> = {
      'online': 'bg-green-500',
      'away': 'bg-amber-500',
      'busy': 'bg-red-500',
      'dnd': 'bg-red-600',
      'offline': 'bg-gray-400'
    }
    return colors[presence]
  }

  const getMeetingStatusColor = (status: MeetingStatus): string => {
    const colors: Record<MeetingStatus, string> = {
      'scheduled': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      'live': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      'ended': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      'cancelled': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
    }
    return colors[status]
  }

  const getFileIcon = (type: FileType) => {
    const icons: Record<FileType, any> = {
      'document': FileText,
      'image': FileImage,
      'video': FileVideo,
      'audio': FileAudio,
      'spreadsheet': FileText,
      'presentation': Presentation,
      'other': File
    }
    return icons[type] || File
  }

  // Handlers
  const handleCreateProject = () => {
    toast.info('Create Project')
  }

  const handleInviteMember = (email: string) => {
    toast.success('Invitation sent to ' + email)
  }

  const handleShareFile = (fileName: string) => {
    toast.success('File "' + fileName + '" shared with team')
  }

  const handleStartMeeting = () => {
    toast.info('Starting meeting')
  }

  const handleLeaveProject = (projectName: string) => {
    toast.info('Left project: ' + projectName)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Collaboration Hub</h1>
              <p className="text-gray-500 dark:text-gray-400">Microsoft Teams level workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search everything..." className="w-72 pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Button variant="outline" onClick={() => setShowNewMeeting(true)}><Video className="h-4 w-4 mr-2" />New Meeting</Button>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600" onClick={() => setShowNewBoardDialog(true)}><Plus className="h-4 w-4 mr-2" />New Board</Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {statsCards.map((stat, i) => (
            <Card key={i} className="border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Online Members Bar */}
        <Card className="border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Online now:</span>
                <div className="flex -space-x-2">
                  {mockMembers.filter(m => m.presence === 'online').map(member => (
                    <div key={member.id} className="relative">
                      <Avatar className="w-8 h-8 border-2 border-white">
                        <AvatarFallback style={{ backgroundColor: member.cursorColor }} className="text-white text-xs">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getPresenceColor(member.presence)}`} />
                    </div>
                  ))}
                </div>
                <span className="text-sm text-gray-500">{mockMembers.filter(m => m.presence === 'online').length} collaborating</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  window.open('https://meet.example.com/instant-meeting', '_blank');
                  toast.success('Meeting started! Joining now...');
                }}><Video className="h-4 w-4 mr-2" />Start Meeting</Button>
                <Button variant="outline" size="sm" onClick={() => {
                  navigator.mediaDevices.getDisplayMedia({ video: true }).then(() => {
                    toast.success('Screen sharing started');
                  }).catch(() => {
                    toast.error('Screen sharing was cancelled');
                  });
                }}><ScreenShare className="h-4 w-4 mr-2" />Share Screen</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1">
            <TabsTrigger value="boards" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"><Layout className="h-4 w-4 mr-2" />Boards</TabsTrigger>
            <TabsTrigger value="chat" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"><MessageSquare className="h-4 w-4 mr-2" />Chat{stats.unreadMessages > 0 && <Badge className="ml-2 bg-red-500">{stats.unreadMessages}</Badge>}</TabsTrigger>
            <TabsTrigger value="meetings" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"><Video className="h-4 w-4 mr-2" />Meetings</TabsTrigger>
            <TabsTrigger value="files" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"><FileText className="h-4 w-4 mr-2" />Files</TabsTrigger>
            <TabsTrigger value="teams" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"><Users className="h-4 w-4 mr-2" />Teams</TabsTrigger>
            <TabsTrigger value="channels" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"><Hash className="h-4 w-4 mr-2" />Channels</TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"><History className="h-4 w-4 mr-2" />Activity</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"><Settings className="h-4 w-4 mr-2" />Settings</TabsTrigger>
          </TabsList>

          {/* Boards Tab */}
          <TabsContent value="boards" className="mt-6 space-y-6">
            {/* Boards Overview Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <Layout className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Collaborative Boards</h3>
                </div>
                <p className="text-white/80 mb-4 max-w-2xl">
                  Create and collaborate on whiteboards, flowcharts, wireframes, and more. Real-time editing with your team across all board types.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.totalBoards}</div>
                    <div className="text-xs text-white/70">Total Boards</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.activeBoards}</div>
                    <div className="text-xs text-white/70">Active</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{mockBoards.filter(b => b.isStarred).length}</div>
                    <div className="text-xs text-white/70">Starred</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{mockMembers.filter(m => m.presence === 'online').length}</div>
                    <div className="text-xs text-white/70">Online Now</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all hover:scale-105" onClick={() => setShowNewBoardDialog(true)}>
                    <Plus className="h-5 w-5 text-blue-600" />
                    <span className="text-sm">New Board</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all hover:scale-105" onClick={() => setShowTemplateDialog(true)}>
                    <LayoutTemplate className="h-5 w-5 text-purple-600" />
                    <span className="text-sm">From Template</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all hover:scale-105" onClick={() => setShowInviteMemberDialog(true)}>
                    <UserPlus className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Invite Members</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all hover:scale-105" onClick={() => setShowStarredBoardsDialog(true)}>
                    <Star className="h-5 w-5 text-amber-600" />
                    <span className="text-sm">Starred Boards</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-2 mb-4">
              <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}><Grid className="h-4 w-4" /></Button>
              <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}><List className="h-4 w-4" /></Button>
            </div>
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4' : 'space-y-3'}>
              {filteredBoards.map(board => (
                <Card key={board.id} className="border-gray-200 dark:border-gray-700 hover:shadow-lg cursor-pointer" onClick={() => setSelectedBoard(board)}>
                  <CardContent className="p-0">
                    <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-t-lg flex items-center justify-center relative">
                      <Layout className="h-8 w-8 text-gray-400" />
                      {board.isStarred && <Star className="absolute top-2 right-2 h-4 w-4 text-amber-500 fill-amber-500" />}
                      {board.isLocked && <Lock className="absolute top-2 left-2 h-4 w-4 text-gray-400" />}
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold mb-1">{board.name}</h4>
                      <p className="text-sm text-gray-500 mb-2 truncate">{board.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {board.members.slice(0, 3).map(m => (
                            <Avatar key={m.id} className="w-6 h-6 border-2 border-white">
                              <AvatarFallback style={{ backgroundColor: m.cursorColor }} className="text-white text-xs">{m.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                          ))}
                          {board.members.length > 3 && <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">+{board.members.length - 3}</div>}
                        </div>
                        <span className="text-xs text-gray-500">{formatTimeAgo(board.updatedAt)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="mt-6 space-y-6">
            {/* Chat Overview Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <MessageSquare className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Team Chat</h3>
                </div>
                <p className="text-white/80 mb-4 max-w-2xl">
                  Real-time messaging with your team. Share files, react with emojis, and stay connected across all your channels.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{mockChannels.length}</div>
                    <div className="text-xs text-white/70">Channels</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-red-200">{stats.unreadMessages}</div>
                    <div className="text-xs text-white/70">Unread</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{mockMessages.length}</div>
                    <div className="text-xs text-white/70">Messages Today</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.onlineNow}</div>
                    <div className="text-xs text-white/70">Online Now</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6 h-[600px]">
              {/* Channels Sidebar */}
              <Card className="col-span-3 border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Channels</CardTitle>
                    <Button size="sm" variant="ghost" onClick={() => setShowNewChannel(true)}><Plus className="h-4 w-4" /></Button>
                  </div>
                </CardHeader>
                <CardContent className="p-2">
                  <ScrollArea className="h-[500px]">
                    {mockChannels.map(channel => (
                      <div key={channel.id} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${selectedChannel?.id === channel.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`} onClick={() => setSelectedChannel(channel)}>
                        <div className="relative">
                          {channel.type === 'private' ? <Lock className="h-4 w-4 text-gray-400" /> : <Hash className="h-4 w-4 text-gray-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">{channel.name}</span>
                            {channel.isPinned && <Pin className="h-3 w-3 text-gray-400" />}
                          </div>
                          {channel.lastMessage && <p className="text-xs text-gray-500 truncate">{channel.lastMessage.content}</p>}
                        </div>
                        {channel.unreadCount > 0 && <Badge className="bg-red-500 text-white">{channel.unreadCount}</Badge>}
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
              {/* Messages */}
              <Card className="col-span-9 border-gray-200 dark:border-gray-700 flex flex-col">
                <CardHeader className="pb-2 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Hash className="h-5 w-5" />
                      <CardTitle>{selectedChannel?.name || 'general'}</CardTitle>
                      <Badge variant="outline">{selectedChannel?.memberCount || 45} members</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => {
                        if (selectedChannel) {
                          selectedChannel.isPinned = !selectedChannel.isPinned;
                          toast.success(selectedChannel.isPinned ? 'Channel pinned' : 'Channel unpinned');
                        }
                      }}><Pin className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => {
                        document.getElementById('search-input')?.focus();
                        toast.success('Search opened');
                      }}><Search className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => {
                        setShowChannelOptionsDialog(true);
                      }}><MoreVertical className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-4 overflow-hidden">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {mockMessages.map(message => (
                        <div key={message.id} className="flex gap-3 group">
                          <Avatar className="w-9 h-9">
                            <AvatarFallback style={{ backgroundColor: message.author.cursorColor }} className="text-white text-xs">{message.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">{message.author.name}</span>
                              <span className="text-xs text-gray-500">{formatTimeAgo(message.timestamp)}</span>
                              {message.isPinned && <Pin className="h-3 w-3 text-amber-500" />}
                            </div>
                            <p className="text-sm">{message.content}</p>
                            {message.attachments.length > 0 && (
                              <div className="mt-2 flex gap-2">
                                {message.attachments.map(att => (
                                  <div key={att.id} className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                    <FileText className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm">{att.name}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {message.reactions.length > 0 && (
                              <div className="mt-2 flex gap-1">
                                {message.reactions.map((r, i) => (
                                  <Badge key={i} variant="outline" className="text-xs cursor-pointer hover:bg-gray-100">{r.emoji} {r.count}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 flex items-start gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                              setSelectedMessage(message);
                              setEmojiTarget('message');
                              setShowEmojiPickerDialog(true);
                            }}><Smile className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                              setMessageInput(`@${message.author.name} `);
                              toast.success('Reply mode activated');
                            }}><Reply className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                              setSelectedMessage(message);
                              setShowMessageOptionsDialog(true);
                            }}><MoreHorizontal className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
                <div className="p-4 border-t">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.onchange = () => {
                        toast.success('File attached successfully');
                      };
                      input.click();
                    }}><Paperclip className="h-4 w-4" /></Button>
                    <Input placeholder="Type a message..." className="flex-1" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} />
                    <Button variant="ghost" size="icon" onClick={() => {
                      setEmojiTarget('chat');
                      setShowEmojiPickerDialog(true);
                    }}><Smile className="h-4 w-4" /></Button>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
                      if (messageInput.trim()) {
                        mockMessages.push({
                          id: `m${Date.now()}`,
                          channelId: selectedChannel?.id || 'c1',
                          author: mockMembers[0],
                          content: messageInput,
                          timestamp: new Date().toISOString(),
                          isEdited: false,
                          isPinned: false,
                          reactions: [],
                          attachments: [],
                          mentions: []
                        });
                        setMessageInput('');
                        toast.success('Message sent successfully');
                      } else {
                        toast.error('Cannot send empty message');
                      }
                    }}><Send className="h-4 w-4" /></Button>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Meetings Tab */}
          <TabsContent value="meetings" className="mt-6 space-y-6">
            {/* Meetings Overview Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 rounded-xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <Video className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Video Meetings</h3>
                </div>
                <p className="text-white/80 mb-4 max-w-2xl">
                  Host and join video meetings with your team. Record sessions, share screens, and collaborate in real-time with HD video and audio.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{mockMeetings.length}</div>
                    <div className="text-xs text-white/70">Total Meetings</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-200">{mockMeetings.filter(m => m.status === 'live').length}</div>
                    <div className="text-xs text-white/70">Live Now</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.scheduledMeetings}</div>
                    <div className="text-xs text-white/70">Scheduled</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{mockMeetings.filter(m => m.hasRecording).length}</div>
                    <div className="text-xs text-white/70">Recordings</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Meeting Quick Actions */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-cyan-600" />
                  Meeting Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all hover:scale-105" onClick={() => setShowNewMeeting(true)}>
                    <Video className="h-5 w-5 text-cyan-600" />
                    <span className="text-sm">Start Meeting</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all hover:scale-105" onClick={() => setShowScheduleMeetingDialog(true)}>
                    <Calendar className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Schedule</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all hover:scale-105" onClick={() => setShowRecordingsDialog(true)}>
                    <Play className="h-5 w-5 text-purple-600" />
                    <span className="text-sm">Recordings</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all hover:scale-105" onClick={() => setShowMeetingSettingsDialog(true)}>
                    <Settings className="h-5 w-5 text-amber-600" />
                    <span className="text-sm">Settings</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
              {mockMeetings.map(meeting => (
                <Card key={meeting.id} className="border-gray-200 dark:border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${meeting.status === 'live' ? 'bg-green-100' : 'bg-blue-100'}`}>
                          <Video className={`h-6 w-6 ${meeting.status === 'live' ? 'text-green-600' : 'text-blue-600'}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold">{meeting.title}</h3>
                          <p className="text-sm text-gray-500">{meeting.description}</p>
                        </div>
                      </div>
                      <Badge className={getMeetingStatusColor(meeting.status)}>{meeting.status === 'live' && <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />}{meeting.status}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 text-sm">
                      <div><span className="text-gray-500">Date:</span> <span className="font-medium">{new Date(meeting.startTime).toLocaleDateString()}</span></div>
                      <div><span className="text-gray-500">Time:</span> <span className="font-medium">{new Date(meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                      <div><span className="text-gray-500">Duration:</span> <span className="font-medium">{meeting.duration} min</span></div>
                      <div><span className="text-gray-500">Organizer:</span> <span className="font-medium">{meeting.organizer.name}</span></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {meeting.participants.slice(0, 4).map(p => (
                          <Avatar key={p.id} className="w-8 h-8 border-2 border-white">
                            <AvatarFallback style={{ backgroundColor: p.cursorColor }} className="text-white text-xs">{p.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                        ))}
                        {meeting.participants.length > 4 && <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">+{meeting.participants.length - 4}</div>}
                      </div>
                      <div className="flex gap-2">
                        {meeting.hasRecording && <Button variant="outline" size="sm" onClick={() => {
                          window.open(meeting.recordingUrl || '#', '_blank');
                          toast.success('Recording opened');
                        }}><Play className="h-4 w-4 mr-1" />Recording</Button>}
                        {meeting.status === 'live' && <Button className="bg-green-600 hover:bg-green-700" onClick={() => {
                          window.open(meeting.meetingUrl, '_blank');
                          toast.success('Joined meeting successfully');
                        }}><Video className="h-4 w-4 mr-2" />Join</Button>}
                        {meeting.status === 'scheduled' && <Button variant="outline" onClick={() => {
                          const event = {
                            title: meeting.title,
                            start: new Date(meeting.startTime),
                            end: new Date(new Date(meeting.startTime).getTime() + meeting.duration * 60000),
                            description: meeting.description || ''
                          };
                          const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.start.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${event.end.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(event.description)}`;
                          window.open(googleCalendarUrl, '_blank');
                          toast.success('Added to calendar');
                        }}><Calendar className="h-4 w-4 mr-2" />Add to Calendar</Button>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="mt-6 space-y-6">
            {/* Files Overview Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 rounded-xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Shared Files</h3>
                </div>
                <p className="text-white/80 mb-4 max-w-2xl">
                  Access and manage all your shared files in one place. Upload, download, and collaborate on documents, presentations, and media files.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.sharedFiles}</div>
                    <div className="text-xs text-white/70">Total Files</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{mockFiles.filter(f => f.isStarred).length}</div>
                    <div className="text-xs text-white/70">Starred</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{formatSize(mockFiles.reduce((sum, f) => sum + f.size, 0))}</div>
                    <div className="text-xs text-white/70">Total Size</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{mockFiles.reduce((sum, f) => sum + f.downloadCount, 0)}</div>
                    <div className="text-xs text-white/70">Downloads</div>
                  </div>
                </div>
              </div>
            </div>

            {/* File Quick Actions */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-rose-600" />
                  File Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all hover:scale-105" onClick={() => setShowUploadFileDialog(true)}>
                    <Upload className="h-5 w-5 text-rose-600" />
                    <span className="text-sm">Upload File</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all hover:scale-105" onClick={() => setShowNewFolderDialog(true)}>
                    <FolderOpen className="h-5 w-5 text-pink-600" />
                    <span className="text-sm">New Folder</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-fuchsia-500 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/20 transition-all hover:scale-105" onClick={() => setShowStarredFilesDialog(true)}>
                    <Star className="h-5 w-5 text-fuchsia-600" />
                    <span className="text-sm">Starred Files</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all hover:scale-105" onClick={() => setShowRecentFilesDialog(true)}>
                    <Download className="h-5 w-5 text-purple-600" />
                    <span className="text-sm">Recent</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-700">
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {mockFiles.map(file => {
                    const FileIcon = getFileIcon(file.type)
                    return (
                      <div key={file.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <FileIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{file.name}</h4>
                            {file.isStarred && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
                          </div>
                          <p className="text-sm text-gray-500">{formatSize(file.size)} • v{file.version} • {file.downloadCount} downloads</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{file.uploadedBy.name}</p>
                          <p className="text-xs text-gray-500">{formatTimeAgo(file.modifiedAt)}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => {
                            const blob = new Blob([`File: ${file.name}\nSize: ${file.size} bytes\nVersion: ${file.version}`], { type: 'application/octet-stream' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = file.name;
                            link.click();
                            URL.revokeObjectURL(url);
                            file.downloadCount++;
                            toast.success('File downloaded successfully');
                          }}><Download className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => {
                            const shareUrl = `https://app.example.com/share/${file.id}`;
                            navigator.clipboard.writeText(shareUrl);
                            toast.success('Share link copied to clipboard');
                          }}><Share2 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => {
                            setSelectedFile(file);
                            setShowFileOptionsDialog(true);
                          }}><MoreHorizontal className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams" className="mt-6 space-y-6">
            {/* Teams Overview Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Your Teams</h3>
                </div>
                <p className="text-white/80 mb-4 max-w-2xl">
                  Manage your teams and collaborate with members across departments. Create channels, share files, and coordinate projects effectively.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{mockTeams.length}</div>
                    <div className="text-xs text-white/70">Teams</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{mockTeams.reduce((sum, t) => sum + t.memberCount, 0)}</div>
                    <div className="text-xs text-white/70">Members</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{mockTeams.reduce((sum, t) => sum + t.boardCount, 0)}</div>
                    <div className="text-xs text-white/70">Boards</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{mockTeams.reduce((sum, t) => sum + t.channelCount, 0)}</div>
                    <div className="text-xs text-white/70">Channels</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Quick Actions */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-indigo-600" />
                  Team Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all hover:scale-105" onClick={() => setShowCreateTeamDialog(true)}>
                    <Plus className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm">Create Team</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all hover:scale-105" onClick={() => setShowInviteMemberDialog(true)}>
                    <UserPlus className="h-5 w-5 text-purple-600" />
                    <span className="text-sm">Invite Members</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all hover:scale-105" onClick={() => setShowNewChannel(true)}>
                    <Hash className="h-5 w-5 text-pink-600" />
                    <span className="text-sm">New Channel</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all hover:scale-105" onClick={() => setShowTeamSettingsDialog(true)}>
                    <Settings className="h-5 w-5 text-blue-600" />
                    <span className="text-sm">Team Settings</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6">
              {mockTeams.map(team => (
                <Card key={team.id} className="border-gray-200 dark:border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">{team.name.split(' ').map(w => w[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold">{team.name}</h3>
                        <Badge variant="outline" className="text-xs capitalize">{team.role}</Badge>
                      </div>
                      <Badge className={team.plan === 'enterprise' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}>{team.plan}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{team.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6 text-center">
                      <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"><p className="text-lg font-bold">{team.memberCount}</p><p className="text-xs text-gray-500">Members</p></div>
                      <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"><p className="text-lg font-bold">{team.boardCount}</p><p className="text-xs text-gray-500">Boards</p></div>
                      <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"><p className="text-lg font-bold">{team.channelCount}</p><p className="text-xs text-gray-500">Channels</p></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Channels Tab */}
          <TabsContent value="channels" className="mt-6 space-y-6">
            {/* Channels Overview Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <Hash className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Channels</h3>
                </div>
                <p className="text-white/80 mb-4 max-w-2xl">
                  Organize conversations by topic, project, or team. Create public or private channels to keep discussions focused and productive.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{mockChannels.length}</div>
                    <div className="text-xs text-white/70">Total Channels</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{mockChannels.filter(c => c.type === 'public').length}</div>
                    <div className="text-xs text-white/70">Public</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{mockChannels.filter(c => c.type === 'private').length}</div>
                    <div className="text-xs text-white/70">Private</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{mockChannels.filter(c => c.isPinned).length}</div>
                    <div className="text-xs text-white/70">Pinned</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Channel Quick Actions */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-600" />
                  Channel Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all hover:scale-105" onClick={() => setShowNewChannel(true)}>
                    <Plus className="h-5 w-5 text-amber-600" />
                    <span className="text-sm">Create Channel</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all hover:scale-105" onClick={() => setShowPrivateChannelDialog(true)}>
                    <Lock className="h-5 w-5 text-orange-600" />
                    <span className="text-sm">Private Channel</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all hover:scale-105" onClick={() => setShowPinnedChannelsDialog(true)}>
                    <Pin className="h-5 w-5 text-red-600" />
                    <span className="text-sm">Pinned Channels</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all hover:scale-105" onClick={() => setShowBrowseChannelsDialog(true)}>
                    <Search className="h-5 w-5 text-purple-600" />
                    <span className="text-sm">Browse All</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-700">
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {mockChannels.map(channel => (
                    <div key={channel.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        {channel.type === 'private' ? <Lock className="h-5 w-5 text-gray-600" /> : <Hash className="h-5 w-5 text-gray-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{channel.name}</h4>
                          {channel.isPinned && <Pin className="h-4 w-4 text-amber-500" />}
                          {channel.isMuted && <BellOff className="h-4 w-4 text-gray-400" />}
                        </div>
                        <p className="text-sm text-gray-500">{channel.description}</p>
                      </div>
                      <Badge variant="outline">{channel.memberCount} members</Badge>
                      {channel.unreadCount > 0 && <Badge className="bg-red-500">{channel.unreadCount}</Badge>}
                      <Button variant="ghost" size="icon" onClick={() => {
                        setSelectedChannel(channel);
                        setShowChannelInfoDialog(true);
                      }}><MoreHorizontal className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="mt-6 space-y-6">
            {/* Activity Overview Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 rounded-xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <History className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Activity Feed</h3>
                </div>
                <p className="text-white/80 mb-4 max-w-2xl">
                  Track all activity across your workspace. See who's editing boards, posting messages, uploading files, and scheduling meetings in real-time.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{mockActivities.length}</div>
                    <div className="text-xs text-white/70">Activities Today</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{mockActivities.filter(a => a.type === 'board').length}</div>
                    <div className="text-xs text-white/70">Board Updates</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{mockActivities.filter(a => a.type === 'file').length}</div>
                    <div className="text-xs text-white/70">File Actions</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.onlineNow}</div>
                    <div className="text-xs text-white/70">Active Users</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Quick Actions */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-violet-600" />
                  Activity Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button variant="outline" className={`h-auto py-4 flex flex-col items-center gap-2 hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all hover:scale-105 ${activityFilter === 'board' ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' : ''}`} onClick={() => {
                    setActivityFilter(activityFilter === 'board' ? 'all' : 'board');
                    toast.success(activityFilter === 'board' ? 'Showing all activities' : 'Filtering by board activity');
                  }}>
                    <Layout className="h-5 w-5 text-violet-600" />
                    <span className="text-sm">Board Activity</span>
                  </Button>
                  <Button variant="outline" className={`h-auto py-4 flex flex-col items-center gap-2 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all hover:scale-105 ${activityFilter === 'message' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : ''}`} onClick={() => {
                    setActivityFilter(activityFilter === 'message' ? 'all' : 'message');
                    toast.success(activityFilter === 'message' ? 'Showing all activities' : 'Filtering by messages');
                  }}>
                    <MessageSquare className="h-5 w-5 text-purple-600" />
                    <span className="text-sm">Messages</span>
                  </Button>
                  <Button variant="outline" className={`h-auto py-4 flex flex-col items-center gap-2 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all hover:scale-105 ${activityFilter === 'file' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : ''}`} onClick={() => {
                    setActivityFilter(activityFilter === 'file' ? 'all' : 'file');
                    toast.success(activityFilter === 'file' ? 'Showing all activities' : 'Filtering by file uploads');
                  }}>
                    <FileText className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm">File Uploads</span>
                  </Button>
                  <Button variant="outline" className={`h-auto py-4 flex flex-col items-center gap-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all hover:scale-105 ${activityFilter === 'member' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`} onClick={() => {
                    setActivityFilter(activityFilter === 'member' ? 'all' : 'member');
                    toast.success(activityFilter === 'member' ? 'Showing all activities' : 'Filtering by team updates');
                  }}>
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="text-sm">Team Updates</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {mockActivities.map(activity => (
                      <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback style={{ backgroundColor: activity.user.cursorColor }} className="text-white text-xs">{activity.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{activity.user.name}</span>
                            <span className="text-gray-500">{activity.action}</span>
                            <span className="font-medium text-blue-600">{activity.resourceName}</span>
                          </div>
                          <p className="text-sm text-gray-500">{activity.description}</p>
                          <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(activity.timestamp)}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => {
                          window.open(`#/${activity.resourceId}`, '_blank');
                          toast.success('Resource opened');
                        }}><ExternalLink className="h-4 w-4" /></Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab - Comprehensive 6 Sub-tabs with Sidebar */}
          <TabsContent value="settings" className="mt-6 space-y-6">
            {/* Settings Overview Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 rounded-xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <Settings className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Collaboration Settings</h3>
                  <Badge className="bg-blue-500/20 text-blue-300 border-0">Teams Level</Badge>
                </div>
                <p className="text-white/70 mb-4 max-w-2xl">
                  Configure your workspace preferences, meeting defaults, notifications, integrations, automations, and appearance options.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{mockIntegrations.filter(i => i.status === 'connected').length}</div>
                    <div className="text-xs text-white/70">Connected Apps</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{mockAutomations.filter(a => a.isActive).length}</div>
                    <div className="text-xs text-white/70">Active Automations</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{mockTemplates.length}</div>
                    <div className="text-xs text-white/70">Templates</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{mockTeams.length}</div>
                    <div className="text-xs text-white/70">Teams</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Grid with Sidebar Navigation */}
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardContent className="p-4">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Settings2, description: 'Workspace settings' },
                        { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alerts & sounds' },
                        { id: 'integrations', label: 'Integrations', icon: Link2, description: 'Connected apps' },
                        { id: 'automations', label: 'Automations', icon: Zap, description: 'Workflows' },
                        { id: 'privacy', label: 'Privacy', icon: Lock, description: 'Security & data' },
                        { id: 'appearance', label: 'Appearance', icon: Palette, description: 'Theme & display' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all ${
                            settingsTab === item.id
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-l-4 border-blue-500'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <item.icon className={`h-5 w-5 ${settingsTab === item.id ? 'text-blue-600' : 'text-gray-400'}`} />
                          <div>
                            <p className="font-medium text-sm">{item.label}</p>
                            <p className="text-xs text-gray-500">{item.description}</p>
                          </div>
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
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings2 className="h-5 w-5 text-blue-600" />
                          Workspace Settings
                        </CardTitle>
                        <CardDescription>Configure your workspace preferences and organization details</CardDescription>
                      </CardHeader>
                    <CardContent className="space-y-4">
                      <div><Label>Workspace Name</Label><Input defaultValue="My Workspace" className="mt-1" /></div>
                      <div><Label>Workspace URL</Label><Input defaultValue="my-workspace" className="mt-1" /></div>
                      <div><Label>Default Language</Label>
                        <Select defaultValue="en"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="es">Spanish</SelectItem><SelectItem value="fr">French</SelectItem><SelectItem value="de">German</SelectItem></SelectContent></Select>
                      </div>
                      <div><Label>Timezone</Label>
                        <Select defaultValue="utc"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="utc">UTC</SelectItem><SelectItem value="est">Eastern Time</SelectItem><SelectItem value="pst">Pacific Time</SelectItem><SelectItem value="gmt">GMT</SelectItem></SelectContent></Select>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>Meeting Defaults</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between"><div><p className="font-medium">Camera On</p><p className="text-sm text-gray-500">Start with camera enabled</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Microphone On</p><p className="text-sm text-gray-500">Start with mic enabled</p></div><Switch /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Auto-Record</p><p className="text-sm text-gray-500">Record meetings automatically</p></div><Switch /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Enable Transcription</p><p className="text-sm text-gray-500">Auto-transcribe meetings</p></div><Switch defaultChecked /></div>
                    </CardContent>
                  </Card>
                  <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="h-5 w-5 text-purple-600" />
                          Workspace Branding
                        </CardTitle>
                        <CardDescription>Customize your workspace appearance</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 border-2 border-dashed rounded-lg text-center">
                          <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">Upload workspace logo</p>
                          <p className="text-xs text-gray-400">PNG, JPG up to 2MB</p>
                        </div>
                        <div><Label>Workspace Color</Label>
                          <div className="flex gap-2 mt-2">
                            {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map(color => (
                              <button
                                key={color}
                                className={`w-8 h-8 rounded-full border-2 shadow-md hover:scale-110 transition-transform ${selectedWorkspaceColor === color ? 'border-gray-900 dark:border-white ring-2 ring-offset-2 ring-blue-500' : 'border-white'}`}
                                style={{ backgroundColor: color }}
                                onClick={() => {
                                  setSelectedWorkspaceColor(color);
                                  toast.success('Workspace color updated')
                                }}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Custom Domain</p>
                            <p className="text-sm text-gray-500">Use your own domain</p>
                          </div>
                          <Badge variant="outline">Enterprise</Badge>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-gray-200 dark:border-gray-700 col-span-2">
                      <CardHeader><CardTitle className="flex items-center gap-2">
                        <LayoutTemplate className="h-5 w-5 text-indigo-600" />
                        Templates
                      </CardTitle>
                      <Button size="sm" onClick={() => setShowTemplateDialog(true)}><Plus className="h-4 w-4 mr-2" />Create Template</Button>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {mockTemplates.map(template => (
                          <div key={template.id} className="p-4 border rounded-lg hover:border-blue-500 cursor-pointer">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                <LayoutTemplate className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{template.name}</h4>
                                  {template.isOfficial && <Crown className="h-4 w-4 text-amber-500" />}
                                </div>
                                <Badge variant="outline" className="text-xs capitalize">{template.category}</Badge>
                              </div>
                            </div>
                            <p className="text-sm text-gray-500 mb-2">{template.description}</p>
                            <div className="flex items-center justify-between text-xs text-gray-400">
                              <span>{template.usageCount} uses</span>
                              <span>{template.createdBy}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  </>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="h-5 w-5 text-amber-600" />
                          Desktop Notifications
                        </CardTitle>
                        <CardDescription>Configure desktop alerts</CardDescription>
                      </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between"><div><p className="font-medium">All Notifications</p><p className="text-sm text-gray-500">Enable desktop notifications</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Direct Messages</p><p className="text-sm text-gray-500">Notify for DMs</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Mentions</p><p className="text-sm text-gray-500">Notify when mentioned</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Channel Messages</p><p className="text-sm text-gray-500">Notify for channel activity</p></div><Switch /></div>
                    </CardContent>
                  </Card>
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>Sound & Alerts</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between"><div><p className="font-medium">Sound Alerts</p><p className="text-sm text-gray-500">Play sound for notifications</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Meeting Reminders</p><p className="text-sm text-gray-500">Sound for meeting alerts</p></div><Switch defaultChecked /></div>
                      <div><Label>Notification Sound</Label>
                        <Select defaultValue="chime"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="chime">Chime</SelectItem><SelectItem value="pop">Pop</SelectItem><SelectItem value="ding">Ding</SelectItem><SelectItem value="none">None</SelectItem></SelectContent></Select>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>Email Notifications</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between"><div><p className="font-medium">Daily Digest</p><p className="text-sm text-gray-500">Summary of daily activity</p></div><Switch /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Weekly Summary</p><p className="text-sm text-gray-500">Weekly activity report</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Meeting Invites</p><p className="text-sm text-gray-500">Email for meeting invites</p></div><Switch defaultChecked /></div>
                    </CardContent>
                  </Card>
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>Do Not Disturb</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between"><div><p className="font-medium">Schedule DND</p><p className="text-sm text-gray-500">Auto-enable outside work hours</p></div><Switch /></div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div><Label>Start Time</Label><Input type="time" defaultValue="18:00" className="mt-1" /></div>
                        <div><Label>End Time</Label><Input type="time" defaultValue="09:00" className="mt-1" /></div>
                      </div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Weekend DND</p><p className="text-sm text-gray-500">Auto DND on weekends</p></div><Switch defaultChecked /></div>
                    </CardContent>
                  </Card>
                </div>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Connected Services</CardTitle>
                      <Button size="sm" onClick={() => setShowIntegrationDialog(true)}><Plus className="h-4 w-4 mr-2" />Add Integration</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockIntegrations.map(integration => (
                        <div key={integration.id} className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${integration.status === 'connected' ? 'bg-green-100 dark:bg-green-900' : integration.status === 'error' ? 'bg-red-100 dark:bg-red-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                            <Globe className={`h-6 w-6 ${integration.status === 'connected' ? 'text-green-600' : integration.status === 'error' ? 'text-red-600' : 'text-gray-500'}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{integration.name}</h4>
                              <Badge variant="outline" className="text-xs capitalize">{integration.type}</Badge>
                            </div>
                            <p className="text-sm text-gray-500">Last synced: {formatTimeAgo(integration.lastSync)}</p>
                          </div>
                          <Badge className={integration.status === 'connected' ? 'bg-green-100 text-green-700' : integration.status === 'error' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}>
                            {integration.status === 'connected' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {integration.status === 'error' && <AlertCircle className="h-3 w-3 mr-1" />}
                            {integration.status}
                          </Badge>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => {
                              if (integration.status === 'connected') {
                                setSelectedIntegration(integration);
                                toast.success(`${integration.name} settings opened`);
                              } else {
                                integration.status = 'connected';
                                integration.lastSync = new Date().toISOString();
                                toast.success(`${integration.name} connected successfully`);
                              }
                            }}>{integration.status === 'connected' ? 'Configure' : 'Connect'}</Button>
                            {integration.status === 'connected' && <Button variant="ghost" size="sm" className="text-red-600" onClick={() => {
                              integration.status = 'disconnected';
                              toast.success(`${integration.name} disconnected`);
                            }}>Disconnect</Button>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                )}

                {/* Automations Settings */}
                {settingsTab === 'automations' && (
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Workflow Automations</CardTitle>
                      <Button size="sm" onClick={() => setShowAutomationDialog(true)}><Plus className="h-4 w-4 mr-2" />Create Automation</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockAutomations.map(automation => (
                        <div key={automation.id} className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${automation.isActive ? 'bg-purple-100 dark:bg-purple-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                            <Zap className={`h-6 w-6 ${automation.isActive ? 'text-purple-600' : 'text-gray-500'}`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{automation.name}</h4>
                            <p className="text-sm text-gray-500">Trigger: {automation.trigger}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {automation.actions.slice(0, 2).map((action, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{action}</Badge>
                              ))}
                              {automation.actions.length > 2 && <Badge variant="outline" className="text-xs">+{automation.actions.length - 2} more</Badge>}
                            </div>
                          </div>
                          <div className="text-right">
                            {automation.lastTriggered && <p className="text-xs text-gray-500">Last run: {formatTimeAgo(automation.lastTriggered)}</p>}
                          </div>
                          <Switch checked={automation.isActive} />
                          <Button variant="ghost" size="icon" onClick={() => {
                            setSelectedAutomation(automation);
                            setShowAutomationOptionsDialog(true);
                          }}><MoreHorizontal className="h-4 w-4" /></Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                )}

                {/* Privacy Settings */}
                {settingsTab === 'privacy' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>Presence & Status</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between"><div><p className="font-medium">Show Online Status</p><p className="text-sm text-gray-500">Let others see when you're online</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Show Typing Indicator</p><p className="text-sm text-gray-500">Show when you're typing</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Activity Status</p><p className="text-sm text-gray-500">Show what you're working on</p></div><Switch /></div>
                    </CardContent>
                  </Card>
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>Message Privacy</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between"><div><p className="font-medium">Read Receipts</p><p className="text-sm text-gray-500">Show when you've read messages</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Message Previews</p><p className="text-sm text-gray-500">Show message content in notifications</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Allow DMs</p><p className="text-sm text-gray-500">Allow direct messages from anyone</p></div><Switch defaultChecked /></div>
                    </CardContent>
                  </Card>
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>Profile Visibility</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between"><div><p className="font-medium">Public Profile</p><p className="text-sm text-gray-500">Make profile visible to everyone</p></div><Switch /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Show Email</p><p className="text-sm text-gray-500">Display email on profile</p></div><Switch /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Show Department</p><p className="text-sm text-gray-500">Display department info</p></div><Switch defaultChecked /></div>
                    </CardContent>
                  </Card>
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>Data & Security</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between"><div><p className="font-medium">Two-Factor Auth</p><p className="text-sm text-gray-500">Require 2FA for login</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Session Timeout</p><p className="text-sm text-gray-500">Auto-logout after inactivity</p></div><Switch /></div>
                      <Button variant="outline" className="w-full" onClick={() => {
                        const data = {
                          user: mockMembers[0],
                          boards: mockBoards,
                          channels: mockChannels,
                          meetings: mockMeetings,
                          files: mockFiles,
                          activities: mockActivities,
                          exportDate: new Date().toISOString()
                        };
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `collaboration-data-export-${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                        toast.success('Data exported successfully');
                      }}><Download className="h-4 w-4 mr-2" />Export My Data</Button>
                    </CardContent>
                  </Card>
                </div>
                )}

                {/* Appearance Settings */}
                {settingsTab === 'appearance' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>Theme</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div><Label>Color Theme</Label>
                        <Select defaultValue="system"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="light">Light</SelectItem><SelectItem value="dark">Dark</SelectItem><SelectItem value="system">System</SelectItem></SelectContent></Select>
                      </div>
                      <div><Label>Accent Color</Label>
                        <div className="flex gap-2 mt-2">
                          {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map(color => (
                            <button
                              key={color}
                              className={`w-8 h-8 rounded-full border-2 shadow-md hover:scale-110 transition-transform ${selectedAccentColor === color ? 'border-gray-900 dark:border-white ring-2 ring-offset-2 ring-blue-500' : 'border-white'}`}
                              style={{ backgroundColor: color }}
                              onClick={() => {
                                setSelectedAccentColor(color);
                                toast.success('Accent color updated')
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>Display</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between"><div><p className="font-medium">Compact Mode</p><p className="text-sm text-gray-500">Reduce spacing in messages</p></div><Switch /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Show Avatars</p><p className="text-sm text-gray-500">Display user avatars</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Show Timestamps</p><p className="text-sm text-gray-500">Display message times</p></div><Switch defaultChecked /></div>
                    </CardContent>
                  </Card>
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>Sidebar</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between"><div><p className="font-medium">Collapsed Sidebar</p><p className="text-sm text-gray-500">Start with sidebar collapsed</p></div><Switch /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Show Channel Icons</p><p className="text-sm text-gray-500">Display icons for channels</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Sort Channels</p><p className="text-sm text-gray-500">Alphabetically sort channels</p></div><Switch /></div>
                    </CardContent>
                  </Card>
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>Accessibility</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between"><div><p className="font-medium">Reduce Motion</p><p className="text-sm text-gray-500">Minimize animations</p></div><Switch /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">High Contrast</p><p className="text-sm text-gray-500">Increase color contrast</p></div><Switch /></div>
                      <div><Label>Font Size</Label>
                        <Select defaultValue="medium"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="small">Small</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="large">Large</SelectItem></SelectContent></Select>
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
            <AIInsightsPanel
              insights={mockCollabAIInsights}
              title="Collaboration Intelligence"
              onInsightAction={(insight) => toast.info(insight.title)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockCollabCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockCollabPredictions}
              title="Team Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockCollabActivities}
            title="Collaboration Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockCollabQuickActions}
            variant="grid"
          />
        </div>

        {/* New Meeting Dialog */}
        <Dialog open={showNewMeeting} onOpenChange={setShowNewMeeting}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Schedule Meeting</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Meeting Title</Label><Input placeholder="Sprint Planning" /></div>
              <div><Label>Description</Label><Textarea placeholder="Meeting agenda..." rows={2} /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div><Label>Date</Label><Input type="date" /></div>
                <div><Label>Time</Label><Input type="time" /></div>
              </div>
              <div><Label>Duration</Label><Select><SelectTrigger><SelectValue placeholder="Select duration" /></SelectTrigger><SelectContent><SelectItem value="15">15 minutes</SelectItem><SelectItem value="30">30 minutes</SelectItem><SelectItem value="45">45 minutes</SelectItem><SelectItem value="60">1 hour</SelectItem><SelectItem value="90">1.5 hours</SelectItem></SelectContent></Select></div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"><div className="flex items-center gap-2"><Video className="h-4 w-4 text-gray-500" /><span className="text-sm">Enable Recording</span></div><Switch /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewMeeting(false)}>Cancel</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
                const newMeeting: Meeting = {
                  id: `mt${Date.now()}`,
                  title: 'New Scheduled Meeting',
                  description: 'Meeting scheduled via dialog',
                  status: 'scheduled',
                  startTime: new Date(Date.now() + 86400000).toISOString(),
                  duration: 60,
                  organizer: mockMembers[0],
                  participants: mockMembers.slice(0, 3),
                  isRecurring: false,
                  hasRecording: false,
                  meetingUrl: `https://meet.example.com/meeting-${Date.now()}`
                };
                mockMeetings.push(newMeeting);
                setShowNewMeeting(false);
                toast.success('Meeting scheduled successfully');
              }}>Schedule Meeting</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Template Dialog */}
        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create Template</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Template Name</Label><Input placeholder="My Template" /></div>
              <div><Label>Description</Label><Textarea placeholder="What is this template for?" rows={3} /></div>
              <div><Label>Category</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="brainstorm">Brainstorm</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="agile">Agile</SelectItem>
                </SelectContent></Select>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-gray-500" /><span className="text-sm">Make template public</span></div>
                <Switch />
              </div>
              <div className="p-4 border-2 border-dashed rounded-lg text-center">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Upload preview image</p>
                <p className="text-xs text-gray-400">PNG, JPG up to 2MB</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>Cancel</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
                const newTemplate: Template = {
                  id: `tmp${Date.now()}`,
                  name: 'My Custom Template',
                  description: 'Custom template created via dialog',
                  category: 'project',
                  preview: '/templates/custom.png',
                  usageCount: 0,
                  createdBy: 'You',
                  isOfficial: false
                };
                mockTemplates.push(newTemplate);
                setShowTemplateDialog(false);
                toast.success('Template created successfully');
              }}>Create Template</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Integration Dialog */}
        <Dialog open={showIntegrationDialog} onOpenChange={setShowIntegrationDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Add Integration</DialogTitle></DialogHeader>
            <div className="py-4">
              <Input placeholder="Search integrations..." className="mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {[
                  { name: 'Google Calendar', type: 'calendar', description: 'Sync meetings and events' },
                  { name: 'Slack', type: 'communication', description: 'Send notifications to Slack' },
                  { name: 'Google Drive', type: 'storage', description: 'Access and share files' },
                  { name: 'Dropbox', type: 'storage', description: 'Cloud storage integration' },
                  { name: 'Jira', type: 'productivity', description: 'Sync tasks and issues' },
                  { name: 'GitHub', type: 'development', description: 'Link code repositories' },
                  { name: 'Figma', type: 'productivity', description: 'Embed design files' },
                  { name: 'Zoom', type: 'communication', description: 'Video conferencing' },
                ].map((integration, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 border rounded-lg hover:border-blue-500 cursor-pointer" onClick={() => {
                    const newIntegration: Integration = {
                      id: `int${Date.now()}`,
                      name: integration.name,
                      type: integration.type as Integration['type'],
                      status: 'connected',
                      icon: integration.name.toLowerCase().replace(' ', '-'),
                      lastSync: new Date().toISOString()
                    };
                    mockIntegrations.push(newIntegration);
                    setShowIntegrationDialog(false);
                    toast.success(`${integration.name} connected successfully`);
                  }}>
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{integration.name}</h4>
                      <p className="text-sm text-gray-500">{integration.description}</p>
                    </div>
                    <Badge variant="outline" className="text-xs capitalize">{integration.type}</Badge>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowIntegrationDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Automation Dialog */}
        <Dialog open={showAutomationDialog} onOpenChange={setShowAutomationDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create Automation</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Automation Name</Label><Input placeholder="My Automation" /></div>
              <div><Label>Trigger</Label>
                <Select><SelectTrigger><SelectValue placeholder="When should this run?" /></SelectTrigger><SelectContent>
                  <SelectItem value="task_created">When task is created</SelectItem>
                  <SelectItem value="task_completed">When task is completed</SelectItem>
                  <SelectItem value="meeting_starts">When meeting starts</SelectItem>
                  <SelectItem value="file_uploaded">When file is uploaded</SelectItem>
                  <SelectItem value="member_joins">When member joins</SelectItem>
                  <SelectItem value="daily">Daily at specific time</SelectItem>
                  <SelectItem value="weekly">Weekly on specific day</SelectItem>
                </SelectContent></Select>
              </div>
              <div><Label>Actions</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <Zap className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Send notification</span>
                    <Button variant="ghost" size="sm" className="ml-auto" onClick={() => {
                      toast.success('Action removed successfully');
                    }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => {
                    toast.success('Action added: Post to channel');
                  }}><Plus className="h-4 w-4 mr-2" />Add Action</Button>
                </div>
              </div>
              <div><Label>Conditions (Optional)</Label>
                <Textarea placeholder="Add conditions for when this automation should run..." rows={2} />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-purple-500" /><span className="text-sm">Enable automation immediately</span></div>
                <Switch defaultChecked />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAutomationDialog(false)}>Cancel</Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => {
                const newAutomation: Automation = {
                  id: `aut${Date.now()}`,
                  name: 'Custom Automation',
                  trigger: 'When task is created',
                  actions: ['Send notification'],
                  isActive: true,
                  lastTriggered: undefined
                };
                mockAutomations.push(newAutomation);
                setShowAutomationDialog(false);
                toast.success('Automation created and enabled');
              }}>Create Automation</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Channel Dialog */}
        <Dialog open={showNewChannel} onOpenChange={setShowNewChannel}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create Channel</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Channel Name</Label><Input placeholder="project-updates" /></div>
              <div><Label>Description</Label><Textarea placeholder="What's this channel about?" rows={2} /></div>
              <div><Label>Channel Type</Label>
                <Select defaultValue="public"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                  <SelectItem value="public">Public - Anyone can join</SelectItem>
                  <SelectItem value="private">Private - Invite only</SelectItem>
                </SelectContent></Select>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2"><Bell className="h-4 w-4 text-gray-500" /><span className="text-sm">Post announcement when created</span></div>
                <Switch defaultChecked />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewChannel(false)}>Cancel</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
                const newChannel: Channel = {
                  id: `c${Date.now()}`,
                  name: 'new-channel',
                  type: 'public',
                  description: 'New channel created via dialog',
                  memberCount: 1,
                  unreadCount: 0,
                  isPinned: false,
                  isMuted: false,
                  createdAt: new Date().toISOString()
                };
                mockChannels.push(newChannel);
                setShowNewChannel(false);
                toast.success('Channel created successfully');
              }}>Create Channel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Board Dialog */}
        <Dialog open={showNewBoardDialog} onOpenChange={setShowNewBoardDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create New Board</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Board Name</Label><Input placeholder="My Board" value={newBoardName} onChange={(e) => setNewBoardName(e.target.value)} /></div>
              <div><Label>Description</Label><Textarea placeholder="What's this board for?" rows={2} value={newBoardDescription} onChange={(e) => setNewBoardDescription(e.target.value)} /></div>
              <div><Label>Board Type</Label>
                <Select value={newBoardType} onValueChange={(v) => setNewBoardType(v as BoardType)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whiteboard">Whiteboard</SelectItem>
                    <SelectItem value="flowchart">Flowchart</SelectItem>
                    <SelectItem value="mindmap">Mind Map</SelectItem>
                    <SelectItem value="wireframe">Wireframe</SelectItem>
                    <SelectItem value="kanban">Kanban</SelectItem>
                    <SelectItem value="brainstorm">Brainstorm</SelectItem>
                    <SelectItem value="retrospective">Retrospective</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-gray-500" /><span className="text-sm">Make board public</span></div>
                <Switch />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewBoardDialog(false)}>Cancel</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
                if (!newBoardName.trim()) {
                  toast.error('Please enter a board name');
                  return;
                }
                const newBoard: Board = {
                  id: `b${Date.now()}`,
                  name: newBoardName,
                  description: newBoardDescription,
                  type: newBoardType,
                  status: 'active',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  createdBy: mockMembers[0],
                  members: [mockMembers[0]],
                  isStarred: false,
                  isLocked: false,
                  isPublic: false,
                  viewCount: 0,
                  commentCount: 0,
                  elementCount: 0,
                  version: 1,
                  tags: ['new']
                };
                mockBoards.push(newBoard);
                setNewBoardName('');
                setNewBoardDescription('');
                setShowNewBoardDialog(false);
                toast.success('Board created successfully');
              }}>Create Board</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Invite Member Dialog */}
        <Dialog open={showInviteMemberDialog} onOpenChange={setShowInviteMemberDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Invite Team Members</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Email Address</Label><Input type="email" placeholder="colleague@company.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} /></div>
              <div><Label>Role</Label>
                <Select defaultValue="member">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="guest">Guest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Personal Message (Optional)</Label><Textarea placeholder="Add a personal note to your invitation..." rows={2} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInviteMemberDialog(false)}>Cancel</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
                if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
                  toast.error('Please enter a valid email address');
                  return;
                }
                toast.success(`Invitation sent to ${inviteEmail}`);
                setInviteEmail('');
                setShowInviteMemberDialog(false);
              }}>Send Invitation</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Starred Boards Dialog */}
        <Dialog open={showStarredBoardsDialog} onOpenChange={setShowStarredBoardsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Starred Boards</DialogTitle></DialogHeader>
            <div className="py-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {mockBoards.filter(b => b.isStarred).map(board => (
                    <div key={board.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => {
                      setSelectedBoard(board);
                      setShowStarredBoardsDialog(false);
                      toast.success(`Opening ${board.name}`);
                    }}>
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <Layout className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{board.name}</h4>
                        <p className="text-sm text-gray-500">{board.description}</p>
                      </div>
                      <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                    </div>
                  ))}
                  {mockBoards.filter(b => b.isStarred).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No starred boards yet</p>
                      <p className="text-sm">Star boards to access them quickly</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowStarredBoardsDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Schedule Meeting Dialog */}
        <Dialog open={showScheduleMeetingDialog} onOpenChange={setShowScheduleMeetingDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Schedule Meeting</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Meeting Title</Label><Input placeholder="Weekly Sync" /></div>
              <div><Label>Description</Label><Textarea placeholder="Meeting agenda..." rows={2} /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div><Label>Date</Label><Input type="date" /></div>
                <div><Label>Time</Label><Input type="time" /></div>
              </div>
              <div><Label>Duration</Label>
                <Select defaultValue="30">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2"><Video className="h-4 w-4 text-gray-500" /><span className="text-sm">Auto-record meeting</span></div>
                <Switch />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowScheduleMeetingDialog(false)}>Cancel</Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => {
                toast.success('Meeting scheduled successfully');
                setShowScheduleMeetingDialog(false);
              }}>Schedule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Recordings Dialog */}
        <Dialog open={showRecordingsDialog} onOpenChange={setShowRecordingsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Meeting Recordings</DialogTitle></DialogHeader>
            <div className="py-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {mockMeetings.filter(m => m.hasRecording).map(meeting => (
                    <div key={meeting.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                        <Play className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{meeting.title}</h4>
                        <p className="text-sm text-gray-500">{new Date(meeting.startTime).toLocaleDateString()} - {meeting.duration} min</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => {
                        window.open(meeting.recordingUrl || '#', '_blank');
                        toast.success('Recording opened');
                      }}><Play className="h-4 w-4 mr-1" />Play</Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        toast.success('Recording download started');
                      }}><Download className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRecordingsDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Meeting Settings Dialog */}
        <Dialog open={showMeetingSettingsDialog} onOpenChange={setShowMeetingSettingsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Meeting Settings</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between"><div><p className="font-medium">Auto-record all meetings</p><p className="text-sm text-gray-500">Automatically record when meetings start</p></div><Switch /></div>
              <div className="flex items-center justify-between"><div><p className="font-medium">Enable transcription</p><p className="text-sm text-gray-500">Auto-transcribe meeting recordings</p></div><Switch defaultChecked /></div>
              <div className="flex items-center justify-between"><div><p className="font-medium">Camera on by default</p><p className="text-sm text-gray-500">Start meetings with camera enabled</p></div><Switch defaultChecked /></div>
              <div className="flex items-center justify-between"><div><p className="font-medium">Mic on by default</p><p className="text-sm text-gray-500">Start meetings with microphone enabled</p></div><Switch /></div>
              <div className="flex items-center justify-between"><div><p className="font-medium">Allow guests</p><p className="text-sm text-gray-500">Let external users join meetings</p></div><Switch defaultChecked /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMeetingSettingsDialog(false)}>Cancel</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
                toast.success('Meeting settings saved');
                setShowMeetingSettingsDialog(false);
              }}>Save Settings</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Upload File Dialog */}
        <Dialog open={showUploadFileDialog} onOpenChange={setShowUploadFileDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Upload File</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-8 border-2 border-dashed rounded-lg text-center hover:border-blue-500 cursor-pointer" onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.multiple = true;
                input.onchange = (e) => {
                  const files = (e.target as HTMLInputElement).files;
                  if (files && files.length > 0) {
                    toast.success(`${files.length} file(s) uploaded successfully`);
                    setShowUploadFileDialog(false);
                  }
                };
                input.click();
              }}>
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium">Click to upload</p>
                <p className="text-sm text-gray-500">or drag and drop files here</p>
                <p className="text-xs text-gray-400 mt-2">Supports all file types up to 100MB</p>
              </div>
              <div><Label>Share with channel</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select channel" /></SelectTrigger>
                  <SelectContent>
                    {mockChannels.map(channel => (
                      <SelectItem key={channel.id} value={channel.id}># {channel.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUploadFileDialog(false)}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Folder Dialog */}
        <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create New Folder</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Folder Name</Label><Input placeholder="My Folder" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} /></div>
              <div><Label>Location</Label>
                <Select defaultValue="root">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="root">Root Directory</SelectItem>
                    <SelectItem value="documents">Documents</SelectItem>
                    <SelectItem value="projects">Projects</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewFolderDialog(false)}>Cancel</Button>
              <Button className="bg-pink-600 hover:bg-pink-700" onClick={() => {
                if (!newFolderName.trim()) {
                  toast.error('Please enter a folder name');
                  return;
                }
                toast.success(`Folder "${newFolderName}" created`);
                setNewFolderName('');
                setShowNewFolderDialog(false);
              }}>Create Folder</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Starred Files Dialog */}
        <Dialog open={showStarredFilesDialog} onOpenChange={setShowStarredFilesDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Starred Files</DialogTitle></DialogHeader>
            <div className="py-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {mockFiles.filter(f => f.isStarred).map(file => {
                    const FileIcon = getFileIcon(file.type);
                    return (
                      <div key={file.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <FileIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{file.name}</h4>
                          <p className="text-sm text-gray-500">{formatSize(file.size)}</p>
                        </div>
                        <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                        <Button variant="ghost" size="sm" onClick={() => {
                          toast.success('File downloaded');
                        }}><Download className="h-4 w-4" /></Button>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowStarredFilesDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Recent Files Dialog */}
        <Dialog open={showRecentFilesDialog} onOpenChange={setShowRecentFilesDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Recent Files</DialogTitle></DialogHeader>
            <div className="py-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {mockFiles.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()).map(file => {
                    const FileIcon = getFileIcon(file.type);
                    return (
                      <div key={file.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                          <FileIcon className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{file.name}</h4>
                          <p className="text-sm text-gray-500">Modified {formatTimeAgo(file.modifiedAt)}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => {
                          setSelectedFile(file);
                          setShowFileOptionsDialog(true);
                        }}><ExternalLink className="h-4 w-4" /></Button>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRecentFilesDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Team Dialog */}
        <Dialog open={showCreateTeamDialog} onOpenChange={setShowCreateTeamDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create Team</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Team Name</Label><Input placeholder="Engineering Team" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} /></div>
              <div><Label>Description</Label><Textarea placeholder="What's this team about?" rows={2} value={newTeamDescription} onChange={(e) => setNewTeamDescription(e.target.value)} /></div>
              <div className="p-4 border-2 border-dashed rounded-lg text-center">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Upload team avatar</p>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-gray-500" /><span className="text-sm">Allow anyone to join</span></div>
                <Switch />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateTeamDialog(false)}>Cancel</Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => {
                if (!newTeamName.trim()) {
                  toast.error('Please enter a team name');
                  return;
                }
                const newTeam: Team = {
                  id: `t${Date.now()}`,
                  name: newTeamName,
                  description: newTeamDescription,
                  memberCount: 1,
                  boardCount: 0,
                  channelCount: 1,
                  plan: 'free',
                  role: 'owner',
                  createdAt: new Date().toISOString()
                };
                mockTeams.push(newTeam);
                toast.success(`Team "${newTeamName}" created`);
                setNewTeamName('');
                setNewTeamDescription('');
                setShowCreateTeamDialog(false);
              }}>Create Team</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Team Settings Dialog */}
        <Dialog open={showTeamSettingsDialog} onOpenChange={setShowTeamSettingsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Team Settings</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Team Name</Label><Input defaultValue={mockTeams[0]?.name || 'Product Team'} /></div>
              <div><Label>Description</Label><Textarea defaultValue={mockTeams[0]?.description || ''} rows={2} /></div>
              <div className="flex items-center justify-between"><div><p className="font-medium">Allow member invites</p><p className="text-sm text-gray-500">Members can invite others</p></div><Switch defaultChecked /></div>
              <div className="flex items-center justify-between"><div><p className="font-medium">Public team</p><p className="text-sm text-gray-500">Anyone can discover and join</p></div><Switch /></div>
              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full text-red-600 hover:bg-red-50" onClick={() => {
                  toast.error('Team deletion requires confirmation');
                }}>Delete Team</Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTeamSettingsDialog(false)}>Cancel</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
                toast.success('Team settings saved');
                setShowTeamSettingsDialog(false);
              }}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Private Channel Dialog */}
        <Dialog open={showPrivateChannelDialog} onOpenChange={setShowPrivateChannelDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create Private Channel</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Channel Name</Label><Input placeholder="secret-project" /></div>
              <div><Label>Description</Label><Textarea placeholder="What's this channel for?" rows={2} /></div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <Lock className="h-4 w-4" />
                  <span className="text-sm font-medium">Private Channel</span>
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">Only invited members can see and access this channel</p>
              </div>
              <div><Label>Invite Members</Label><Input placeholder="Search members..." /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPrivateChannelDialog(false)}>Cancel</Button>
              <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => {
                toast.success('Private channel created');
                setShowPrivateChannelDialog(false);
              }}>Create Private Channel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Pinned Channels Dialog */}
        <Dialog open={showPinnedChannelsDialog} onOpenChange={setShowPinnedChannelsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Pinned Channels</DialogTitle></DialogHeader>
            <div className="py-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {mockChannels.filter(c => c.isPinned).map(channel => (
                    <div key={channel.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => {
                      setSelectedChannel(channel);
                      setShowPinnedChannelsDialog(false);
                      setActiveTab('chat');
                      toast.success(`Opened #${channel.name}`);
                    }}>
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        {channel.type === 'private' ? <Lock className="h-5 w-5 text-gray-600" /> : <Hash className="h-5 w-5 text-gray-600" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium"># {channel.name}</h4>
                        <p className="text-sm text-gray-500">{channel.description}</p>
                      </div>
                      <Pin className="h-5 w-5 text-amber-500" />
                      <Badge variant="outline">{channel.memberCount} members</Badge>
                    </div>
                  ))}
                  {mockChannels.filter(c => c.isPinned).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Pin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No pinned channels yet</p>
                      <p className="text-sm">Pin channels to access them quickly</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPinnedChannelsDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Browse Channels Dialog */}
        <Dialog open={showBrowseChannelsDialog} onOpenChange={setShowBrowseChannelsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Browse All Channels</DialogTitle></DialogHeader>
            <div className="py-4">
              <Input placeholder="Search channels..." className="mb-4" />
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {mockChannels.map(channel => (
                    <div key={channel.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        {channel.type === 'private' ? <Lock className="h-5 w-5 text-gray-600" /> : <Hash className="h-5 w-5 text-gray-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium"># {channel.name}</h4>
                          {channel.isPinned && <Pin className="h-4 w-4 text-amber-500" />}
                        </div>
                        <p className="text-sm text-gray-500">{channel.description}</p>
                      </div>
                      <Badge variant="outline">{channel.memberCount} members</Badge>
                      <Button size="sm" onClick={() => {
                        setSelectedChannel(channel);
                        setShowBrowseChannelsDialog(false);
                        setActiveTab('chat');
                        toast.success(`Joined #${channel.name}`);
                      }}>Join</Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBrowseChannelsDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Channel Options Dialog */}
        <Dialog open={showChannelOptionsDialog} onOpenChange={setShowChannelOptionsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Channel Options
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => {
                  if (selectedChannel) {
                    selectedChannel.isPinned = !selectedChannel.isPinned;
                    toast.success(selectedChannel.isPinned ? 'Channel pinned' : 'Channel unpinned');
                  }
                  setShowChannelOptionsDialog(false);
                }}>
                  <Pin className="h-4 w-4 mr-2" />
                  {selectedChannel?.isPinned ? 'Unpin Channel' : 'Pin Channel'}
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => {
                  if (selectedChannel) {
                    selectedChannel.isMuted = !selectedChannel.isMuted;
                    toast.success(selectedChannel.isMuted ? 'Notifications muted' : 'Notifications enabled');
                  }
                  setShowChannelOptionsDialog(false);
                }}>
                  {selectedChannel?.isMuted ? <Bell className="h-4 w-4 mr-2" /> : <BellOff className="h-4 w-4 mr-2" />}
                  {selectedChannel?.isMuted ? 'Unmute Notifications' : 'Mute Notifications'}
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => {
                  setShowChannelOptionsDialog(false);
                  setShowChannelInfoDialog(true);
                }}>
                  <Users className="h-4 w-4 mr-2" />
                  View Members
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => {
                  const shareUrl = `https://app.example.com/channel/${selectedChannel?.id}`;
                  navigator.clipboard.writeText(shareUrl);
                  toast.success('Channel link copied to clipboard');
                  setShowChannelOptionsDialog(false);
                }}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Copy Channel Link
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => {
                  setShowChannelOptionsDialog(false);
                  setShowInviteMemberDialog(true);
                }}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite People
                </Button>
              </div>
              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full justify-start text-red-600 hover:bg-red-50" onClick={() => {
                  toast.success('Left channel successfully');
                  setShowChannelOptionsDialog(false);
                }}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Leave Channel
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowChannelOptionsDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Emoji Picker Dialog */}
        <Dialog open={showEmojiPickerDialog} onOpenChange={setShowEmojiPickerDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Choose an Emoji</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="grid grid-cols-8 gap-2">
                {['😀', '😂', '😍', '🥰', '😎', '🤔', '😢', '😡', '👍', '👎', '❤️', '🔥', '⭐', '🎉', '🚀', '💯', '✅', '❌', '👀', '💪', '🙏', '🎯', '💡', '📌', '⏰', '📝', '🔔', '💬', '👏', '🤝', '💼', '📊'].map(emoji => (
                  <button
                    key={emoji}
                    className="w-10 h-10 text-2xl hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    onClick={() => {
                      if (emojiTarget === 'message' && selectedMessage) {
                        const existingReaction = selectedMessage.reactions.find(r => r.emoji === emoji);
                        if (existingReaction) {
                          existingReaction.count++;
                          existingReaction.users.push('current-user');
                        } else {
                          selectedMessage.reactions.push({ emoji, count: 1, users: ['current-user'] });
                        }
                        toast.success(`Reacted with ${emoji}`);
                      } else {
                        setMessageInput(prev => prev + emoji);
                        toast.success('Emoji added');
                      }
                      setShowEmojiPickerDialog(false);
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEmojiPickerDialog(false)}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Message Options Dialog */}
        <Dialog open={showMessageOptionsDialog} onOpenChange={setShowMessageOptionsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Message Options</DialogTitle>
            </DialogHeader>
            {selectedMessage && (
              <div className="space-y-4 py-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback style={{ backgroundColor: selectedMessage.author.cursorColor }} className="text-white text-xs">
                        {selectedMessage.author.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">{selectedMessage.author.name}</span>
                    <span className="text-xs text-gray-500">{formatTimeAgo(selectedMessage.timestamp)}</span>
                  </div>
                  <p className="text-sm">{selectedMessage.content}</p>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={() => {
                    setMessageInput(`@${selectedMessage.author.name} `);
                    setShowMessageOptionsDialog(false);
                    toast.success('Reply mode activated');
                  }}>
                    <Reply className="h-4 w-4 mr-2" />
                    Reply to Message
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => {
                    selectedMessage.isPinned = !selectedMessage.isPinned;
                    toast.success(selectedMessage.isPinned ? 'Message pinned' : 'Message unpinned');
                    setShowMessageOptionsDialog(false);
                  }}>
                    <Pin className="h-4 w-4 mr-2" />
                    {selectedMessage.isPinned ? 'Unpin Message' : 'Pin Message'}
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => {
                    navigator.clipboard.writeText(selectedMessage.content);
                    toast.success('Message copied to clipboard');
                    setShowMessageOptionsDialog(false);
                  }}>
                    <FileText className="h-4 w-4 mr-2" />
                    Copy Text
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => {
                    const shareUrl = `https://app.example.com/message/${selectedMessage.id}`;
                    navigator.clipboard.writeText(shareUrl);
                    toast.success('Message link copied');
                    setShowMessageOptionsDialog(false);
                  }}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Message
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => {
                    setShowMessageOptionsDialog(false);
                    setEmojiTarget('message');
                    setShowEmojiPickerDialog(true);
                  }}>
                    <Smile className="h-4 w-4 mr-2" />
                    Add Reaction
                  </Button>
                </div>
                <div className="pt-4 border-t">
                  <Button variant="outline" className="w-full justify-start text-red-600 hover:bg-red-50" onClick={() => {
                    const index = mockMessages.findIndex(m => m.id === selectedMessage.id);
                    if (index > -1) {
                      mockMessages.splice(index, 1);
                    }
                    toast.success('Message deleted');
                    setShowMessageOptionsDialog(false);
                  }}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Message
                  </Button>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMessageOptionsDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* File Options Dialog */}
        <Dialog open={showFileOptionsDialog} onOpenChange={setShowFileOptionsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>File Options</DialogTitle>
            </DialogHeader>
            {selectedFile && (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{selectedFile.name}</h4>
                    <p className="text-sm text-gray-500">{formatSize(selectedFile.size)} - v{selectedFile.version}</p>
                  </div>
                  {selectedFile.isStarred && <Star className="h-5 w-5 text-amber-500 fill-amber-500" />}
                </div>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={() => {
                    window.open(`https://app.example.com/preview/${selectedFile.id}`, '_blank');
                    toast.success('File opened in new tab');
                    setShowFileOptionsDialog(false);
                  }}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open File
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => {
                    selectedFile.downloadCount++;
                    toast.success('Download started');
                    setShowFileOptionsDialog(false);
                  }}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => {
                    selectedFile.isStarred = !selectedFile.isStarred;
                    toast.success(selectedFile.isStarred ? 'File starred' : 'File unstarred');
                    setShowFileOptionsDialog(false);
                  }}>
                    <Star className={`h-4 w-4 mr-2 ${selectedFile.isStarred ? 'fill-amber-500 text-amber-500' : ''}`} />
                    {selectedFile.isStarred ? 'Remove from Starred' : 'Add to Starred'}
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => {
                    const shareUrl = `https://app.example.com/share/${selectedFile.id}`;
                    navigator.clipboard.writeText(shareUrl);
                    toast.success('Share link copied to clipboard');
                    setShowFileOptionsDialog(false);
                  }}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Copy Share Link
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => {
                    toast.info('File renaming');
                    setShowFileOptionsDialog(false);
                  }}>
                    <FileText className="h-4 w-4 mr-2" />
                    Rename File
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => {
                    toast.info('Move file');
                    setShowFileOptionsDialog(false);
                  }}>
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Move to Folder
                  </Button>
                </div>
                <div className="pt-4 border-t">
                  <Button variant="outline" className="w-full justify-start text-red-600 hover:bg-red-50" onClick={() => {
                    const index = mockFiles.findIndex(f => f.id === selectedFile.id);
                    if (index > -1) {
                      mockFiles.splice(index, 1);
                    }
                    toast.success('File deleted');
                    setShowFileOptionsDialog(false);
                  }}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete File
                  </Button>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowFileOptionsDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Channel Info Dialog */}
        <Dialog open={showChannelInfoDialog} onOpenChange={setShowChannelInfoDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedChannel?.type === 'private' ? <Lock className="h-5 w-5" /> : <Hash className="h-5 w-5" />}
                {selectedChannel?.name}
              </DialogTitle>
            </DialogHeader>
            {selectedChannel && (
              <div className="space-y-6 py-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedChannel.description || 'No description set'}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Channel Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-sm">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-gray-500">Type</p>
                      <p className="font-medium capitalize">{selectedChannel.type}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-gray-500">Members</p>
                      <p className="font-medium">{selectedChannel.memberCount}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-gray-500">Created</p>
                      <p className="font-medium">{new Date(selectedChannel.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-gray-500">Status</p>
                      <p className="font-medium flex items-center gap-1">
                        {selectedChannel.isPinned && <Pin className="h-3 w-3 text-amber-500" />}
                        {selectedChannel.isMuted && <BellOff className="h-3 w-3 text-gray-400" />}
                        {!selectedChannel.isPinned && !selectedChannel.isMuted && 'Active'}
                        {selectedChannel.isPinned && 'Pinned'}
                        {selectedChannel.isMuted && ', Muted'}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Members ({selectedChannel.memberCount})</h4>
                  <ScrollArea className="h-[150px]">
                    <div className="space-y-2">
                      {mockMembers.map(member => (
                        <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                          <div className="relative">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback style={{ backgroundColor: member.cursorColor }} className="text-white text-xs">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getPresenceColor(member.presence)}`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.title}</p>
                          </div>
                          <Badge variant="outline" className="text-xs capitalize">{member.role}</Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Notification Preferences</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div><p className="text-sm font-medium">Mute notifications</p><p className="text-xs text-gray-500">Silence all channel notifications</p></div>
                      <Switch checked={selectedChannel.isMuted} onCheckedChange={(checked) => { selectedChannel.isMuted = checked; }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowChannelInfoDialog(false)}>Close</Button>
              <Button onClick={() => {
                setShowChannelInfoDialog(false);
                setActiveTab('chat');
                toast.success(`Opened #${selectedChannel?.name}`);
              }}>Open Channel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Automation Options Dialog */}
        <Dialog open={showAutomationOptionsDialog} onOpenChange={setShowAutomationOptionsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-600" />
                Automation Settings
              </DialogTitle>
            </DialogHeader>
            {selectedAutomation && (
              <div className="space-y-6 py-4">
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h4 className="font-medium">{selectedAutomation.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Trigger: {selectedAutomation.trigger}</p>
                </div>
                <div>
                  <Label>Automation Name</Label>
                  <Input defaultValue={selectedAutomation.name} className="mt-1" />
                </div>
                <div>
                  <Label>Trigger</Label>
                  <Select defaultValue={selectedAutomation.trigger.toLowerCase().replace(/ /g, '_')}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="when_task_is_created">When task is created</SelectItem>
                      <SelectItem value="when_task_is_completed">When task is completed</SelectItem>
                      <SelectItem value="when_meeting_starts">When meeting starts</SelectItem>
                      <SelectItem value="when_file_is_uploaded">When file is uploaded</SelectItem>
                      <SelectItem value="daily_at_specific_time">Daily at specific time</SelectItem>
                      <SelectItem value="weekly_on_specific_day">Weekly on specific day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Actions</Label>
                  <div className="space-y-2 mt-2">
                    {selectedAutomation.actions.map((action, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <Zap className="h-4 w-4 text-purple-500" />
                        <span className="text-sm flex-1">{action}</span>
                        <Button variant="ghost" size="sm" onClick={() => {
                          selectedAutomation.actions.splice(i, 1);
                          toast.success('Action removed');
                        }}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full" onClick={() => {
                      selectedAutomation.actions.push('Send notification');
                      toast.success('Action added');
                    }}><Plus className="h-4 w-4 mr-2" />Add Action</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div><p className="font-medium">Enable Automation</p><p className="text-sm text-gray-500">Run this automation automatically</p></div>
                  <Switch checked={selectedAutomation.isActive} onCheckedChange={(checked) => { selectedAutomation.isActive = checked; }} />
                </div>
                <div className="pt-4 border-t flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => {
                    selectedAutomation.lastTriggered = new Date().toISOString();
                    toast.success('Automation ran successfully');
                  }}>
                    <Play className="h-4 w-4 mr-2" />
                    Run Now
                  </Button>
                  <Button variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => {
                    const index = mockAutomations.findIndex(a => a.id === selectedAutomation.id);
                    if (index > -1) {
                      mockAutomations.splice(index, 1);
                    }
                    toast.success('Automation deleted');
                    setShowAutomationOptionsDialog(false);
                  }}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAutomationOptionsDialog(false)}>Cancel</Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => {
                toast.success('Automation settings saved');
                setShowAutomationOptionsDialog(false);
              }}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
