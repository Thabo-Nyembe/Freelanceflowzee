/**
 * KAZI Collaboration System - Complete Utilities
 *
 * Includes: Communications, Whiteboard, Video/Voice calls, Teams, Tasks, Analytics
 * All utilities, interfaces, mock data, and helper functions
 */

import { logger } from '@/lib/logger'
import {
  MessageSquare,
  Users,
  LayoutGrid,
  Video,
  MessageCircle,
  FileText,
  Image,
  BarChart3,
  Pencil,
  Send,
  Phone,
  PhoneCall,
  Monitor,
  Mic,
  MicOff,
  VideoOff,
  ScreenShare,
  Circle,
  Square,
  Triangle,
  Type,
  Eraser,
  Download,
  Upload,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  FileImage,
  FileVideo,
  FileAudio,
  File,
  Plus,
  Trash2,
  Edit,
  Star,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Hash,
  Lock,
  Pin,
  Search,
  Paperclip,
  Smile,
  MoreVertical,
  Settings,
  Heart,
  Shield,
  UserPlus,
  UserMinus,
  Play,
  Pause,
  Camera,
  CameraOff,
  AlertTriangle
} from 'lucide-react'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type MessageStatus = 'sent' | 'delivered' | 'read'
export type ChannelType = 'public' | 'private' | 'dm'
export type TeamRole = 'owner' | 'admin' | 'member' | 'guest'
export type MemberStatus = 'online' | 'offline' | 'away' | 'busy'
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type MeetingStatus = 'scheduled' | 'live' | 'ended' | 'cancelled'
export type FeedbackRating = 1 | 2 | 3 | 4 | 5
export type MediaFileType = 'image' | 'video' | 'document' | 'audio' | 'other'
export type CanvasTool = 'select' | 'pen' | 'eraser' | 'text' | 'shape' | 'image'

// ============================================================================
// INTERFACE DEFINITIONS
// ============================================================================

export interface Channel {
  id: string
  name: string
  description: string
  type: ChannelType
  members: number
  unreadCount: number
  lastMessage?: string
  lastMessageTime?: string
  isPinned: boolean
  createdBy: string
  createdAt: string
}

export interface Message {
  id: string
  channelId: string
  senderId: string
  senderName: string
  senderAvatar: string
  content: string
  timestamp: string
  status: MessageStatus
  isPinned: boolean
  reactions: MessageReaction[]
  attachments: MessageAttachment[]
  replyTo?: string
}

export interface MessageReaction {
  emoji: string
  count: number
  users: string[]
}

export interface MessageAttachment {
  id: string
  name: string
  url: string
  type: string
  size: number
}

export interface TeamMember {
  id: string
  name: string
  email: string
  avatar: string
  role: TeamRole
  status: MemberStatus
  department: string
  jobTitle: string
  joinedAt: string
  lastActive: string
  timezone: string
  skills: string[]
  currentTask?: string
  availability: boolean
}

export interface WorkspaceBoard {
  id: string
  name: string
  description: string
  createdBy: string
  createdAt: string
  members: string[]
  columns: BoardColumn[]
  tags: string[]
  color: string
}

export interface BoardColumn {
  id: string
  name: string
  taskIds: string[]
  limit?: number
  color: string
}

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assignees: string[]
  dueDate: string
  createdAt: string
  updatedAt: string
  tags: string[]
  attachments: number
  comments: number
  subtasks: Subtask[]
  estimatedHours: number
  actualHours: number
}

export interface Subtask {
  id: string
  title: string
  completed: boolean
}

export interface Meeting {
  id: string
  title: string
  description: string
  status: MeetingStatus
  startTime: string
  endTime: string
  duration: number
  host: string
  attendees: MeetingAttendee[]
  agenda: string[]
  recording?: MeetingRecording
  notes?: string
  roomUrl?: string
}

export interface MeetingAttendee {
  id: string
  name: string
  avatar: string
  status: 'accepted' | 'declined' | 'tentative' | 'no-response'
  joinedAt?: string
}

export interface MeetingRecording {
  id: string
  url: string
  duration: number
  size: number
  createdAt: string
}

export interface Feedback {
  id: string
  fromId: string
  fromName: string
  fromAvatar: string
  toId: string
  toName: string
  rating: FeedbackRating
  category: string
  comment: string
  isAnonymous: boolean
  createdAt: string
  replies: FeedbackReply[]
}

export interface FeedbackReply {
  id: string
  fromId: string
  fromName: string
  fromAvatar: string
  comment: string
  createdAt: string
}

export interface MediaFile {
  id: string
  name: string
  type: MediaFileType
  url: string
  thumbnail?: string
  size: number
  uploadedBy: string
  uploadedByName: string
  uploadedAt: string
  folderId?: string
  tags: string[]
  isShared: boolean
  sharedWith: string[]
  downloads: number
}

export interface MediaFolder {
  id: string
  name: string
  parentId?: string
  createdBy: string
  createdAt: string
  fileCount: number
  color: string
}

export interface CanvasBoard {
  id: string
  name: string
  description: string
  createdBy: string
  createdAt: string
  updatedAt: string
  thumbnail?: string
  collaborators: string[]
  elements: CanvasElement[]
  template?: string
  isPublic: boolean
}

export interface CanvasElement {
  id: string
  type: CanvasTool
  x: number
  y: number
  width: number
  height: number
  color?: string
  content?: string
  strokeWidth?: number
  opacity?: number
}

export interface CollaborationAnalytics {
  teamActivity: TeamActivityMetrics
  messageVolume: MessageVolumeData[]
  meetingStats: MeetingStatsData
  responseTime: ResponseTimeData
  productivityScores: ProductivityScore[]
  topContributors: ContributorData[]
}

export interface TeamActivityMetrics {
  activeMembers: number
  totalMembers: number
  messagesThisWeek: number
  meetingsThisWeek: number
  tasksCompleted: number
  tasksInProgress: number
  avgResponseTime: number
  engagementScore: number
}

export interface MessageVolumeData {
  date: string
  count: number
  channel?: string
}

export interface MeetingStatsData {
  totalMeetings: number
  avgDuration: number
  avgAttendance: number
  recordingsCreated: number
  onTimeStart: number
}

export interface ResponseTimeData {
  avgFirstResponse: number
  avgFullResponse: number
  within1Hour: number
  within24Hours: number
  over24Hours: number
}

export interface ProductivityScore {
  memberId: string
  memberName: string
  score: number
  tasksCompleted: number
  messagesSent: number
  meetingsAttended: number
  trend: 'up' | 'down' | 'stable'
}

export interface ContributorData {
  id: string
  name: string
  avatar: string
  contributions: number
  type: 'messages' | 'tasks' | 'files' | 'meetings'
}

export interface CollaborationData {
  channels: Channel[]
  messages: Message[]
  teamMembers: TeamMember[]
  workspaceBoards: WorkspaceBoard[]
  tasks: Task[]
  meetings: Meeting[]
  feedback: Feedback[]
  mediaFiles: MediaFile[]
  mediaFolders: MediaFolder[]
  canvasBoards: CanvasBoard[]
  analytics: CollaborationAnalytics
}

// ============================================================================
// MOCK DATA
// ============================================================================

export const KAZI_COLLABORATION_DATA: CollaborationData = {
  channels: [
    {
      id: 'ch-1',
      name: 'general',
      description: 'General team discussions',
      type: 'public',
      members: 24,
      unreadCount: 5,
      lastMessage: 'Great work on the latest release!',
      lastMessageTime: '2 min ago',
      isPinned: true,
      createdBy: 'user-1',
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'ch-2',
      name: 'projects',
      description: 'Project-related discussions',
      type: 'public',
      members: 18,
      unreadCount: 12,
      lastMessage: 'Updated the project timeline',
      lastMessageTime: '15 min ago',
      isPinned: true,
      createdBy: 'user-2',
      createdAt: '2024-01-05T00:00:00Z'
    },
    {
      id: 'ch-3',
      name: 'design',
      description: 'Design team workspace',
      type: 'public',
      members: 8,
      unreadCount: 3,
      lastMessage: 'New mockups are ready',
      lastMessageTime: '1 hour ago',
      isPinned: false,
      createdBy: 'user-3',
      createdAt: '2024-01-10T00:00:00Z'
    },
    {
      id: 'ch-4',
      name: 'development',
      description: 'Development team discussions',
      type: 'public',
      members: 12,
      unreadCount: 0,
      lastMessage: 'Code review completed',
      lastMessageTime: '3 hours ago',
      isPinned: false,
      createdBy: 'user-4',
      createdAt: '2024-01-12T00:00:00Z'
    }
  ],

  messages: [
    {
      id: 'msg-1',
      channelId: 'ch-1',
      senderId: 'user-1',
      senderName: 'Sarah Johnson',
      senderAvatar: '/avatars/sarah.jpg',
      content: 'Great work on the latest release! The team did an amazing job.',
      timestamp: '2 min ago',
      status: 'read',
      isPinned: false,
      reactions: [
        { emoji: '👍', count: 5, users: ['user-2', 'user-3', 'user-4', 'user-5', 'user-6'] },
        { emoji: '🎉', count: 3, users: ['user-7', 'user-8', 'user-9'] }
      ],
      attachments: []
    }
  ],

  teamMembers: [
    {
      id: 'user-1',
      name: 'Sarah Johnson',
      email: 'sarah@company.com',
      avatar: '/avatars/sarah.jpg',
      role: 'owner',
      status: 'online',
      department: 'Product',
      jobTitle: 'Product Manager',
      joinedAt: '2023-01-15',
      lastActive: 'Just now',
      timezone: 'PST',
      skills: ['Product Strategy', 'User Research', 'Agile'],
      currentTask: 'Q1 Planning Review',
      availability: true
    },
    {
      id: 'user-2',
      name: 'Michael Chen',
      email: 'michael@company.com',
      avatar: '/avatars/michael.jpg',
      role: 'admin',
      status: 'online',
      department: 'Engineering',
      jobTitle: 'Lead Developer',
      joinedAt: '2023-02-01',
      lastActive: '2 min ago',
      timezone: 'PST',
      skills: ['React', 'Node.js', 'TypeScript'],
      currentTask: 'API Integration',
      availability: true
    }
  ],

  workspaceBoards: [
    {
      id: 'board-1',
      name: 'Q1 Product Roadmap',
      description: 'Planning and tracking for Q1 2024',
      createdBy: 'user-1',
      createdAt: '2024-01-01T00:00:00Z',
      members: ['user-1', 'user-2', 'user-3', 'user-4'],
      columns: [
        { id: 'col-1', name: 'To Do', taskIds: ['task-1', 'task-4'], color: 'gray' },
        { id: 'col-2', name: 'In Progress', taskIds: ['task-2', 'task-5'], color: 'blue' },
        { id: 'col-3', name: 'Review', taskIds: ['task-3'], color: 'yellow' },
        { id: 'col-4', name: 'Done', taskIds: ['task-6', 'task-7'], color: 'green' }
      ],
      tags: ['product', 'roadmap', 'Q1'],
      color: 'purple'
    }
  ],

  tasks: [
    {
      id: 'task-1',
      title: 'User Research for New Feature',
      description: 'Conduct interviews with 10 users',
      status: 'todo',
      priority: 'high',
      assignees: ['user-6'],
      dueDate: '2024-02-15',
      createdAt: '2024-01-20T00:00:00Z',
      updatedAt: '2024-01-22T00:00:00Z',
      tags: ['research', 'ux'],
      attachments: 2,
      comments: 5,
      subtasks: [
        { id: 'sub-1', title: 'Create interview script', completed: true }
      ],
      estimatedHours: 20,
      actualHours: 8
    }
  ],

  meetings: [
    {
      id: 'meet-1',
      title: 'Weekly Team Standup',
      description: 'Regular Monday standup to align on priorities',
      status: 'scheduled',
      startTime: '2024-01-29T10:00:00Z',
      endTime: '2024-01-29T10:30:00Z',
      duration: 30,
      host: 'user-1',
      attendees: [
        { id: 'user-1', name: 'Sarah Johnson', avatar: '/avatars/sarah.jpg', status: 'accepted' }
      ],
      agenda: ['Review last week', 'Discuss priorities'],
      roomUrl: 'https://meet.kazi.com/weekly-standup'
    }
  ],

  feedback: [
    {
      id: 'fb-1',
      fromId: 'user-1',
      fromName: 'Sarah Johnson',
      fromAvatar: '/avatars/sarah.jpg',
      toId: 'user-2',
      toName: 'Michael Chen',
      rating: 5,
      category: 'Code Quality',
      comment: 'Excellent work on the API integration!',
      isAnonymous: false,
      createdAt: '2024-01-25T14:30:00Z',
      replies: []
    }
  ],

  mediaFiles: [
    {
      id: 'file-1',
      name: 'Product_Demo_Recording.mp4',
      type: 'video',
      url: '/media/product-demo.mp4',
      thumbnail: '/media/thumbnails/product-demo.jpg',
      size: 125000000,
      uploadedBy: 'user-1',
      uploadedByName: 'Sarah Johnson',
      uploadedAt: '2024-01-25T10:00:00Z',
      folderId: 'folder-1',
      tags: ['demo', 'product'],
      isShared: true,
      sharedWith: ['user-2', 'user-3'],
      downloads: 12
    }
  ],

  mediaFolders: [
    {
      id: 'folder-1',
      name: 'Meetings & Recordings',
      createdBy: 'user-1',
      createdAt: '2024-01-01T00:00:00Z',
      fileCount: 12,
      color: 'blue'
    }
  ],

  canvasBoards: [
    {
      id: 'canvas-1',
      name: 'Product Roadmap Brainstorm',
      description: 'Collaborative brainstorming for Q2',
      createdBy: 'user-1',
      createdAt: '2024-01-20T00:00:00Z',
      updatedAt: '2024-01-25T14:00:00Z',
      thumbnail: '/canvas/thumbnails/roadmap.jpg',
      collaborators: ['user-1', 'user-2'],
      elements: [],
      isPublic: false
    }
  ],

  analytics: {
    teamActivity: {
      activeMembers: 18,
      totalMembers: 24,
      messagesThisWeek: 342,
      meetingsThisWeek: 8,
      tasksCompleted: 12,
      tasksInProgress: 15,
      avgResponseTime: 2.3,
      engagementScore: 87
    },
    messageVolume: [
      { date: '2024-01-22', count: 45 },
      { date: '2024-01-23', count: 52 }
    ],
    meetingStats: {
      totalMeetings: 24,
      avgDuration: 42,
      avgAttendance: 4.5,
      recordingsCreated: 8,
      onTimeStart: 92
    },
    responseTime: {
      avgFirstResponse: 1.8,
      avgFullResponse: 4.2,
      within1Hour: 78,
      within24Hours: 94,
      over24Hours: 6
    },
    productivityScores: [
      {
        memberId: 'user-2',
        memberName: 'Michael Chen',
        score: 95,
        tasksCompleted: 8,
        messagesSent: 142,
        meetingsAttended: 6,
        trend: 'up'
      }
    ],
    topContributors: [
      { id: 'user-2', name: 'Michael Chen', avatar: '/avatars/michael.jpg', contributions: 142, type: 'messages' }
    ]
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
  return date.toLocaleDateString()
}

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'online': 'bg-green-100 text-green-800 border-green-300',
    'offline': 'bg-gray-100 text-gray-800 border-gray-300',
    'away': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'busy': 'bg-red-100 text-red-800 border-red-300'
  }
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300'
}

export const getStatusIcon = (status: string) => {
  return <Circle className="h-3 w-3" />
}

export const filterChannels = (channels: Channel[], query: string): Channel[] => {
  if (!query) return channels
  const q = query.toLowerCase()
  return channels.filter(ch => ch.name.toLowerCase().includes(q) || ch.description.toLowerCase().includes(q))
}

export const filterTeamMembers = (members: TeamMember[], query: string): TeamMember[] => {
  if (!query) return members
  const q = query.toLowerCase()
  return members.filter(m => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q))
}

export default KAZI_COLLABORATION_DATA
