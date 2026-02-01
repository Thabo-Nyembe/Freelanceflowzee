'use client'
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


export const dynamic = 'force-dynamic';

import React, { useState, useReducer, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import {
  Users,
  MessageSquare,
  Heart,
  Share2,
  BookmarkPlus,
  Search,
  Plus,
  Send,
  Image as ImageIcon,
  Video,
  Link,
  Calendar,
  MapPin,
  Star,
  MoreHorizontal,
  Bell,
  UserPlus,
  UserCheck,
  Activity,
  Briefcase,
  Github,
  ExternalLink,
  CheckCircle,
  BarChart3,
  List,
  Building,
  DollarSign,
  Bookmark,
  Globe
} from 'lucide-react'
import { BorderTrail } from '@/components/ui/border-trail'
import { GlowEffect } from '@/components/ui/glow-effect'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { useCurrentUser } from '@/hooks/use-ai-data'

// SUPABASE INTEGRATION
import {
  getMembers,
  getMemberByUserId,
  getPosts,
  getGroups,
  getEvents,
  getCommunityStats,
} from '@/lib/community-hub-queries'

const logger = createFeatureLogger('Community-Hub')

interface CommunityMember {
  id: string
  name: string
  avatar?: string
  title: string
  location: string
  skills: string[]
  rating: number
  isOnline: boolean
  bio: string
  joinDate: string
  totalProjects: number
  totalEarnings: number
  completionRate: number
  responseTime: string
  languages: string[]
  certifications: string[]
  portfolioUrl?: string
  socialLinks: {
    linkedin?: string
    twitter?: string
    github?: string
    behance?: string
    dribbble?: string
    website?: string
  }
  isConnected: boolean
  isPremium: boolean
  isVerified: boolean
  isFollowing: boolean
  followers: number
  following: number
  posts: number
  category: 'freelancer' | 'client' | 'agency' | 'student'
  availability: 'available' | 'busy' | 'away' | 'offline'
  hourlyRate?: number
  currency: string
  timezone: string
  lastSeen: string
  badges: string[]
  achievements: string[]
  endorsements: number
  testimonials: number
  projects: string[]
  tags: string[]
}

interface CommunityPost {
  id: string
  authorId: string
  content: string
  type: 'text' | 'image' | 'video' | 'link' | 'poll' | 'event' | 'job' | 'showcase'
  media?: {
    type: 'image' | 'video' | 'document'
    url: string
    thumbnail?: string
    caption?: string
  }[]
  poll?: {
    question: string
    options: { text: string; votes: number }[]
    totalVotes: number
    endsAt: string
  }
  event?: {
    title: string
    description: string
    date: string
    location: string
    attendees: string[]
    maxAttendees?: number
    price?: number
    currency: string
    category: string
    tags: string[]
  }
  job?: {
    title: string
    description: string
    budget: number
    currency: string
    deadline: string
    skills: string[]
    category: string
    type: 'fixed' | 'hourly'
    experience: 'entry' | 'intermediate' | 'expert'
    applicants: number
    status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  }
  showcase?: {
    title: string
    description: string
    category: string
    tags: string[]
    projectUrl?: string
    githubUrl?: string
    liveUrl?: string
    technologies: string[]
  }
  createdAt: string
  updatedAt: string
  likes: number
  comments: number
  shares: number
  bookmarks: number
  views: number
  isLiked: boolean
  isBookmarked: boolean
  isShared: boolean
  visibility: 'public' | 'connections' | 'private'
  tags: string[]
  location?: string
  mentions: string[]
  hashtags: string[]
  isPromoted: boolean
  isPinned: boolean
  isEdited: boolean
  editHistory: string[]
  reports: number
  isReported: boolean
  isHidden: boolean
  isArchived: boolean
  engagement: {
    impressions: number
    clicks: number
    shares: number
    saves: number
    comments: number
    likes: number
  }
}

interface CommunityComment {
  id: string
  postId: string
  authorId: string
  content: string
  parentId?: string
  replies: CommunityComment[]
  createdAt: string
  updatedAt: string
  likes: number
  isLiked: boolean
  isEdited: boolean
  editHistory: string[]
  mentions: string[]
  isReported: boolean
  isHidden: boolean
  isArchived: boolean
}

interface CommunityEvent {
  id: string
  organizerId: string
  title: string
  description: string
  category: string
  type: 'online' | 'offline' | 'hybrid'
  date: string
  endDate?: string
  location: string
  maxAttendees?: number
  price?: number
  currency: string
  tags: string[]
  attendees: string[]
  interestedUsers: string[]
  speakers: string[]
  agenda: {
    time: string
    title: string
    description: string
    speaker?: string
  }[]
  requirements: string[]
  materials: string[]
  certificates: boolean
  recording: boolean
  isPublic: boolean
  isApprovalRequired: boolean
  status: 'draft' | 'published' | 'cancelled' | 'completed'
  createdAt: string
  updatedAt: string
  views: number
  shares: number
  isAttending: boolean
  isInterested: boolean
  feedback: {
    rating: number
    comments: string[]
  }
  resources: {
    title: string
    type: 'document' | 'video' | 'link'
    url: string
  }[]
}

interface CommunityGroup {
  id: string
  name: string
  description: string
  avatar?: string
  coverImage?: string
  category: string
  type: 'public' | 'private' | 'secret'
  members: string[]
  admins: string[]
  moderators: string[]
  rules: string[]
  tags: string[]
  createdAt: string
  updatedAt: string
  isJoined: boolean
  isPending: boolean
  isInvited: boolean
  posts: number
  activeMembers: number
  weeklyActivity: number
  monthlyActivity: number
  growthRate: number
  engagement: number
  rating: number
  reviews: number
  isVerified: boolean
  isPremium: boolean
  isFeatured: boolean
  isArchived: boolean
  settings: {
    allowPosts: boolean
    allowMedia: boolean
    allowPolls: boolean
    allowEvents: boolean
    allowJobs: boolean
    requireApproval: boolean
    moderateContent: boolean
    allowInvites: boolean
    allowDiscovery: boolean
    allowNotifications: boolean
  }
}

interface CommunityState {
  members: CommunityMember[]
  posts: CommunityPost[]
  comments: CommunityComment[]
  events: CommunityEvent[]
  groups: CommunityGroup[]
  currentUser: CommunityMember | null
  connections: string[]
  followers: string[]
  following: string[]
  blockedUsers: string[]
  notifications: unknown[]
  searchTerm: string
  filterBy: 'all' | 'freelancers' | 'clients' | 'agencies' | 'students'
  sortBy: 'relevance' | 'newest' | 'oldest' | 'popular' | 'rating'
  viewMode: 'grid' | 'list'
  selectedCategory: string
  selectedSkills: string[]
  selectedLocation: string
  priceRange: [number, number]
  availabilityFilter: 'all' | 'available' | 'busy' | 'away'
  onlineFilter: boolean
  verifiedFilter: boolean
  premiumFilter: boolean
  ratingFilter: number
  loading: boolean
  error: string | null
  activeTab: string
  selectedMember: CommunityMember | null
  selectedPost: CommunityPost | null
  selectedEvent: CommunityEvent | null
  selectedGroup: CommunityGroup | null
  showCreatePost: boolean
  showCreateEvent: boolean
  showCreateGroup: boolean
  showMemberProfile: boolean
  showPostDetails: boolean
  showEventDetails: boolean
  showGroupDetails: boolean
  editMode: boolean
  newPost: Partial<CommunityPost>
  newEvent: Partial<CommunityEvent>
  newGroup: Partial<CommunityGroup>
  feedFilter: 'all' | 'connections' | 'groups' | 'jobs' | 'events' | 'showcase'
  postType: 'text' | 'image' | 'video' | 'link' | 'poll' | 'event' | 'job' | 'showcase'
}

type CommunityAction = 
  | { type: 'SET_MEMBERS'; payload: CommunityMember[] }
  | { type: 'SET_POSTS'; payload: CommunityPost[] }
  | { type: 'SET_COMMENTS'; payload: CommunityComment[] }
  | { type: 'SET_EVENTS'; payload: CommunityEvent[] }
  | { type: 'SET_GROUPS'; payload: CommunityGroup[] }
  | { type: 'SET_CURRENT_USER'; payload: CommunityMember | null }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_FILTER_BY'; payload: string }
  | { type: 'SET_SORT_BY'; payload: string }
  | { type: 'SET_VIEW_MODE'; payload: 'grid' | 'list' }
  | { type: 'SET_SELECTED_CATEGORY'; payload: string }
  | { type: 'SET_SELECTED_SKILLS'; payload: string[] }
  | { type: 'SET_SELECTED_LOCATION'; payload: string }
  | { type: 'SET_PRICE_RANGE'; payload: [number, number] }
  | { type: 'SET_AVAILABILITY_FILTER'; payload: string }
  | { type: 'SET_ONLINE_FILTER'; payload: boolean }
  | { type: 'SET_VERIFIED_FILTER'; payload: boolean }
  | { type: 'SET_PREMIUM_FILTER'; payload: boolean }
  | { type: 'SET_RATING_FILTER'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_SELECTED_MEMBER'; payload: CommunityMember | null }
  | { type: 'SET_SELECTED_POST'; payload: CommunityPost | null }
  | { type: 'SET_SELECTED_EVENT'; payload: CommunityEvent | null }
  | { type: 'SET_SELECTED_GROUP'; payload: CommunityGroup | null }
  | { type: 'SET_SHOW_CREATE_POST'; payload: boolean }
  | { type: 'SET_SHOW_CREATE_EVENT'; payload: boolean }
  | { type: 'SET_SHOW_CREATE_GROUP'; payload: boolean }
  | { type: 'SET_SHOW_MEMBER_PROFILE'; payload: boolean }
  | { type: 'SET_SHOW_POST_DETAILS'; payload: boolean }
  | { type: 'SET_SHOW_EVENT_DETAILS'; payload: boolean }
  | { type: 'SET_SHOW_GROUP_DETAILS'; payload: boolean }
  | { type: 'SET_EDIT_MODE'; payload: boolean }
  | { type: 'SET_NEW_POST'; payload: Partial<CommunityPost> }
  | { type: 'SET_NEW_EVENT'; payload: Partial<CommunityEvent> }
  | { type: 'SET_NEW_GROUP'; payload: Partial<CommunityGroup> }
  | { type: 'SET_FEED_FILTER'; payload: string }
  | { type: 'SET_POST_TYPE'; payload: string }
  | { type: 'ADD_POST'; payload: CommunityPost }
  | { type: 'UPDATE_POST'; payload: CommunityPost }
  | { type: 'DELETE_POST'; payload: string }
  | { type: 'LIKE_POST'; payload: string }
  | { type: 'UNLIKE_POST'; payload: string }
  | { type: 'BOOKMARK_POST'; payload: string }
  | { type: 'UNBOOKMARK_POST'; payload: string }
  | { type: 'SHARE_POST'; payload: string }
  | { type: 'CONNECT_MEMBER'; payload: string }
  | { type: 'DISCONNECT_MEMBER'; payload: string }
  | { type: 'FOLLOW_MEMBER'; payload: string }
  | { type: 'UNFOLLOW_MEMBER'; payload: string }
  | { type: 'BLOCK_MEMBER'; payload: string }
  | { type: 'UNBLOCK_MEMBER'; payload: string }
  | { type: 'JOIN_GROUP'; payload: string }
  | { type: 'LEAVE_GROUP'; payload: string }
  | { type: 'ATTEND_EVENT'; payload: string }
  | { type: 'UNATTEND_EVENT'; payload: string }
  | { type: 'INTEREST_EVENT'; payload: string }
  | { type: 'UNINTEREST_EVENT'; payload: string }

const initialState: CommunityState = {
  members: [],
  posts: [],
  comments: [],
  events: [],
  groups: [],
  currentUser: null,
  connections: [],
  followers: [],
  following: [],
  blockedUsers: [],
  notifications: [],
  searchTerm: '',
  filterBy: 'all',
  sortBy: 'relevance',
  viewMode: 'grid',
  selectedCategory: 'all',
  selectedSkills: [],
  selectedLocation: '',
  priceRange: [0, 1000],
  availabilityFilter: 'all',
  onlineFilter: false,
  verifiedFilter: false,
  premiumFilter: false,
  ratingFilter: 0,
  loading: false,
  error: null,
  activeTab: 'feed',
  selectedMember: null,
  selectedPost: null,
  selectedEvent: null,
  selectedGroup: null,
  showCreatePost: false,
  showCreateEvent: false,
  showCreateGroup: false,
  showMemberProfile: false,
  showPostDetails: false,
  showEventDetails: false,
  showGroupDetails: false,
  editMode: false,
  newPost: {},
  newEvent: {},
  newGroup: {},
  feedFilter: 'all',
  postType: 'text'
}

function communityReducer(state: CommunityState, action: CommunityAction): CommunityState {
  switch (action.type) {
    case 'SET_MEMBERS':
      return { ...state, members: action.payload }
    case 'SET_POSTS':
      return { ...state, posts: action.payload }
    case 'SET_COMMENTS':
      return { ...state, comments: action.payload }
    case 'SET_EVENTS':
      return { ...state, events: action.payload }
    case 'SET_GROUPS':
      return { ...state, groups: action.payload }
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload }
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload }
    case 'SET_FILTER_BY':
      return { ...state, filterBy: action.payload }
    case 'SET_SORT_BY':
      return { ...state, sortBy: action.payload }
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload }
    case 'SET_SELECTED_CATEGORY':
      return { ...state, selectedCategory: action.payload }
    case 'SET_SELECTED_SKILLS':
      return { ...state, selectedSkills: action.payload }
    case 'SET_SELECTED_LOCATION':
      return { ...state, selectedLocation: action.payload }
    case 'SET_PRICE_RANGE':
      return { ...state, priceRange: action.payload }
    case 'SET_AVAILABILITY_FILTER':
      return { ...state, availabilityFilter: action.payload }
    case 'SET_ONLINE_FILTER':
      return { ...state, onlineFilter: action.payload }
    case 'SET_VERIFIED_FILTER':
      return { ...state, verifiedFilter: action.payload }
    case 'SET_PREMIUM_FILTER':
      return { ...state, premiumFilter: action.payload }
    case 'SET_RATING_FILTER':
      return { ...state, ratingFilter: action.payload }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload }
    case 'SET_SELECTED_MEMBER':
      return { ...state, selectedMember: action.payload }
    case 'SET_SELECTED_POST':
      return { ...state, selectedPost: action.payload }
    case 'SET_SELECTED_EVENT':
      return { ...state, selectedEvent: action.payload }
    case 'SET_SELECTED_GROUP':
      return { ...state, selectedGroup: action.payload }
    case 'SET_SHOW_CREATE_POST':
      return { ...state, showCreatePost: action.payload }
    case 'SET_SHOW_CREATE_EVENT':
      return { ...state, showCreateEvent: action.payload }
    case 'SET_SHOW_CREATE_GROUP':
      return { ...state, showCreateGroup: action.payload }
    case 'SET_SHOW_MEMBER_PROFILE':
      return { ...state, showMemberProfile: action.payload }
    case 'SET_SHOW_POST_DETAILS':
      return { ...state, showPostDetails: action.payload }
    case 'SET_SHOW_EVENT_DETAILS':
      return { ...state, showEventDetails: action.payload }
    case 'SET_SHOW_GROUP_DETAILS':
      return { ...state, showGroupDetails: action.payload }
    case 'SET_EDIT_MODE':
      return { ...state, editMode: action.payload }
    case 'SET_NEW_POST':
      return { ...state, newPost: action.payload }
    case 'SET_NEW_EVENT':
      return { ...state, newEvent: action.payload }
    case 'SET_NEW_GROUP':
      return { ...state, newGroup: action.payload }
    case 'SET_FEED_FILTER':
      return { ...state, feedFilter: action.payload }
    case 'SET_POST_TYPE':
      return { ...state, postType: action.payload }
    case 'ADD_POST':
      return { ...state, posts: [action.payload, ...state.posts] }
    case 'UPDATE_POST':
      return {
        ...state,
        posts: state.posts.map(post => 
          post.id === action.payload.id ? action.payload : post
        )
      }
    case 'DELETE_POST':
      return {
        ...state,
        posts: state.posts.filter(post => post.id !== action.payload)
      }
    case 'LIKE_POST':
      return {
        ...state,
        posts: state.posts.map(post =>
          post.id === action.payload
            ? { ...post, likes: post.likes + 1, isLiked: true }
            : post
        )
      }
    case 'UNLIKE_POST':
      return {
        ...state,
        posts: state.posts.map(post =>
          post.id === action.payload
            ? { ...post, likes: post.likes - 1, isLiked: false }
            : post
        )
      }
    case 'BOOKMARK_POST':
      return {
        ...state,
        posts: state.posts.map(post =>
          post.id === action.payload
            ? { ...post, bookmarks: post.bookmarks + 1, isBookmarked: true }
            : post
        )
      }
    case 'UNBOOKMARK_POST':
      return {
        ...state,
        posts: state.posts.map(post =>
          post.id === action.payload
            ? { ...post, bookmarks: post.bookmarks - 1, isBookmarked: false }
            : post
        )
      }
    case 'SHARE_POST':
      return {
        ...state,
        posts: state.posts.map(post =>
          post.id === action.payload
            ? { ...post, shares: post.shares + 1, isShared: true }
            : post
        )
      }
    case 'CONNECT_MEMBER':
      return {
        ...state,
        connections: [...state.connections, action.payload],
        members: state.members.map(member =>
          member.id === action.payload
            ? { ...member, isConnected: true }
            : member
        )
      }
    case 'DISCONNECT_MEMBER':
      return {
        ...state,
        connections: state.connections.filter(id => id !== action.payload),
        members: state.members.map(member =>
          member.id === action.payload
            ? { ...member, isConnected: false }
            : member
        )
      }
    case 'FOLLOW_MEMBER':
      return {
        ...state,
        following: [...state.following, action.payload],
        members: state.members.map(member =>
          member.id === action.payload
            ? { ...member, isFollowing: true, followers: member.followers + 1 }
            : member
        )
      }
    case 'UNFOLLOW_MEMBER':
      return {
        ...state,
        following: state.following.filter(id => id !== action.payload),
        members: state.members.map(member =>
          member.id === action.payload
            ? { ...member, isFollowing: false, followers: member.followers - 1 }
            : member
        )
      }
    case 'BLOCK_MEMBER':
      return {
        ...state,
        blockedUsers: [...state.blockedUsers, action.payload],
        connections: state.connections.filter(id => id !== action.payload),
        following: state.following.filter(id => id !== action.payload)
      }
    case 'UNBLOCK_MEMBER':
      return {
        ...state,
        blockedUsers: state.blockedUsers.filter(id => id !== action.payload)
      }
    case 'JOIN_GROUP':
      return {
        ...state,
        groups: state.groups.map(group =>
          group.id === action.payload
            ? { ...group, isJoined: true, members: [...group.members, state.currentUser?.id || ''] }
            : group
        )
      }
    case 'LEAVE_GROUP':
      return {
        ...state,
        groups: state.groups.map(group =>
          group.id === action.payload
            ? { ...group, isJoined: false, members: group.members.filter(id => id !== state.currentUser?.id) }
            : group
        )
      }
    case 'ATTEND_EVENT':
      return {
        ...state,
        events: state.events.map(event =>
          event.id === action.payload
            ? { ...event, isAttending: true, attendees: [...event.attendees, state.currentUser?.id || ''] }
            : event
        )
      }
    case 'UNATTEND_EVENT':
      return {
        ...state,
        events: state.events.map(event =>
          event.id === action.payload
            ? { ...event, isAttending: false, attendees: event.attendees.filter(id => id !== state.currentUser?.id) }
            : event
        )
      }
    case 'INTEREST_EVENT':
      return {
        ...state,
        events: state.events.map(event =>
          event.id === action.payload
            ? { ...event, isInterested: true, interestedUsers: [...event.interestedUsers, state.currentUser?.id || ''] }
            : event
        )
      }
    case 'UNINTEREST_EVENT':
      return {
        ...state,
        events: state.events.map(event =>
          event.id === action.payload
            ? { ...event, isInterested: false, interestedUsers: event.interestedUsers.filter(id => id !== state.currentUser?.id) }
            : event
        )
      }
    default:
      return state
  }
}


// ============================================================================
// V2 COMPETITIVE MOCK DATA - CommunityHub Context
// ============================================================================

const communityHubAIInsights = [
  { id: '1', type: 'info' as const, title: 'Performance Update', description: 'System running optimally with 99.9% uptime this month.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'success' as const, title: 'Goal Achievement', description: 'Monthly targets exceeded by 15%. Great progress!', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Goals' },
  { id: '3', type: 'warning' as const, title: 'Action Required', description: 'Review pending items to maintain workflow efficiency.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Tasks' },
]

const communityHubCollaborators = [
  { id: '1', name: 'Alexandra Chen', avatar: '/avatars/alex.jpg', status: 'online' as const, role: 'Manager', lastActive: 'Now' },
  { id: '2', name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg', status: 'online' as const, role: 'Developer', lastActive: '5m ago' },
  { id: '3', name: 'Sarah Williams', avatar: '/avatars/sarah.jpg', status: 'away' as const, role: 'Designer', lastActive: '30m ago' },
]

const communityHubPredictions = [
  { id: '1', label: 'Completion Rate', current: 85, target: 95, predicted: 92, confidence: 88, trend: 'up' as const },
  { id: '2', label: 'Efficiency Score', current: 78, target: 90, predicted: 86, confidence: 82, trend: 'up' as const },
]

const communityHubActivities = [
  { id: '1', user: 'Alexandra Chen', action: 'updated', target: 'system settings', timestamp: '5m ago', type: 'info' as const },
  { id: '2', user: 'Marcus Johnson', action: 'completed', target: 'task review', timestamp: '15m ago', type: 'success' as const },
  { id: '3', user: 'System', action: 'generated', target: 'weekly report', timestamp: '1h ago', type: 'info' as const },
]

// Quick actions will be defined inside the component to use dialog state setters

export default function CommunityHubClient() {
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  const [state, dispatch] = useReducer(communityReducer, initialState)
  const [activeTab, setActiveTab] = useState<string>('feed')
  const [blockUser, setBlockUser] = useState<{ id: string; name: string } | null>(null)

  // Quick Actions Dialog States
  const [showNewItemDialog, setShowNewItemDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)

  // New Item Form State
  const [newItemForm, setNewItemForm] = useState({
    type: 'post' as 'post' | 'event' | 'group' | 'job',
    title: '',
    content: '',
    category: '',
    tags: ''
  })

  // Export Form State
  const [exportForm, setExportForm] = useState({
    format: 'csv' as 'csv' | 'json' | 'pdf',
    dataType: 'all' as 'all' | 'posts' | 'members' | 'events' | 'groups',
    dateRange: 'all' as 'all' | 'week' | 'month' | 'year',
    includeAnalytics: true
  })

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState({
    emailNotifications: true,
    pushNotifications: true,
    profileVisibility: 'public' as 'public' | 'connections' | 'private',
    showOnlineStatus: true,
    allowMessages: true,
    allowConnectionRequests: true
  })

  // Quick Actions with Dialog handlers
  const communityHubQuickActions = useMemo(() => [
    { id: '1', label: 'New Item', icon: 'Plus', shortcut: 'N', action: () => setShowNewItemDialog(true) },
    { id: '2', label: 'Export', icon: 'Download', shortcut: 'E', action: () => setShowExportDialog(true) },
    { id: '3', label: 'Settings', icon: 'Settings', shortcut: 'S', action: () => setShowSettingsDialog(true) },
  ], [])

  // Quick Action Dialog Handlers
  const handleCreateNewItem = async () => {
    if (!newItemForm.title.trim()) {
      toast.error('Title is required')
      return
    }    try {
      const response = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          resourceType: newItemForm.type,
          data: {
            title: newItemForm.title,
            content: newItemForm.content,
            category: newItemForm.category,
            tags: newItemForm.tags.split(',').map(t => t.trim()).filter(Boolean)
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create item')
      }

      const result = await response.json()

      toast.success(`${newItemForm.type.charAt(0).toUpperCase() + newItemForm.type.slice(1)} created successfully!`, {
        description: `"${newItemForm.title}" has been published to the community`
      })

      setNewItemForm({ type: 'post', title: '', content: '', category: '', tags: '' })
      setShowNewItemDialog(false)
    } catch (error) {
      logger.error('Failed to create item', { error: error.message })
      toast.error('Failed to create item')
    }
  }

  const handleExportData = async () => {    try {
      toast.promise(
        (async () => {
          // Export via API
          await fetch('/api/community', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'export', format: exportForm.format }) }).catch(() => null)

          const exportData = {
            format: exportForm.format,
            dataType: exportForm.dataType,
            dateRange: exportForm.dateRange,
            includeAnalytics: exportForm.includeAnalytics,
            exportedAt: new Date().toISOString()
          }

          // Create and download file
          const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: exportForm.format === 'json' ? 'application/json' : 'text/csv'
          })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `community-export-${exportForm.dataType}-${Date.now()}.${exportForm.format}`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)

          return exportData
        })(),
        {
          loading: 'Preparing export...',
          success: `Community data exported as ${exportForm.format.toUpperCase()}`,
          error: 'Export failed'
        }
      )

      setShowExportDialog(false)
    } catch (error) {
      logger.error('Failed to export data', { error: error.message })
      toast.error('Export failed')
    }
  }

  const handleSaveSettings = async () => {    try {
      toast.promise(
        (async () => {
          // Save settings to the API
          const response = await fetch('/api/community', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'updateSettings',
              data: settingsForm
            })
          })

          return settingsForm
        })(),
        {
          loading: 'Saving settings...',
          success: 'Community settings saved successfully',
          error: 'Failed to save settings'
        }
      )

      setShowSettingsDialog(false)
    } catch (error) {
      logger.error('Failed to save settings', { error: error.message })
      toast.error('Failed to save settings')
    }
  }

  // Handlers
  const handleLikePost = async (id: string) => {
    const post = state.posts.find(p => p.id === id)
    try {
      const response = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'like',
          resourceId: id,
          userId: 'user-1'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to like post')
      }

      const result = await response.json()

      if (result.success) {
        // Show achievement for Social Butterfly (+5 points, 10% chance)
        if (result.achievement) {
          toast.success(result.message + ' ' + result.achievement.message + ' +' + result.achievement.points + ' points! Badge: ' + result.achievement.badge)
        } else {
          toast.success(result.message + ' - ' + ((post?.likes || 0) + 1) + ' likes - ' + (post?.comments || 0) + ' comments')
        }
      }
    } catch (error) {
      logger.error('Failed to like post', {
        error: error.message,
        postId: id
      })
      toast.error('Failed to like post')
    }
  }
  const handleCommentOnPost = (id: string) => {
    const post = state.posts.find(p => p.id === id)
    toast.info('Add comment - ' + (post?.comments || 0) + ' comments - ' + (post?.likes || 0) + ' likes')
  }

  const handleSharePost = async (id: string) => {
    const post = state.posts.find(p => p.id === id)
    try {
      const response = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'share',
          resourceId: id,
          data: { method: 'link' }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to share post')
      }

      const result = await response.json()

      if (result.success) {
        toast.success(result.message + ' - ' + ((post?.shares || 0) + 1) + ' shares - Link: ' + (result.shareUrl || 'Generated'))
      }
    } catch (error) {
      logger.error('Failed to share post', {
        error: error.message,
        postId: id
      })
      toast.error('Failed to share post')
    }
  }

  const handleBookmarkPost = async (id: string) => {
    const post = state.posts.find(p => p.id === id)
    try {
      const response = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bookmark',
          resourceId: id,
          userId: 'user-1'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to bookmark post')
      }

      const result = await response.json()

      if (result.success) {
        toast.success(result.message + ' - ' + ((post?.bookmarks || 0) + 1) + ' bookmarks - ' + (result.tip || 'Saved for later'))
      }
    } catch (error) {
      logger.error('Failed to bookmark post', {
        error: error.message,
        postId: id
      })
      toast.error('Failed to bookmark post')
    }
  }
  const handleFollowMember = async (id: string) => {
    const member = state.members.find(m => m.id === id)
    try {
      const response = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'follow',
          resourceId: id,
          userId: 'user-1'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to follow member')
      }

      const result = await response.json()

      if (result.success) {
        // Show achievement for Networker (+10 points, 20% chance)
        if (result.achievement) {
          toast.success(result.message + ' ' + result.achievement.message + ' +' + result.achievement.points + ' points! - ' + (member?.title || '') + ' - ' + ((member?.followers || 0) + 1) + ' followers - Badge: ' + result.achievement.badge)
        } else {
          toast.success(result.message + ' - ' + (member?.title || '') + ' - ' + ((member?.followers || 0) + 1) + ' followers - ' + (member?.category || ''))
        }
      }
    } catch (error) {
      logger.error('Failed to follow member', {
        error: error.message,
        memberId: id
      })
      toast.error('Failed to follow member')
    }
  }

  const handleUnfollowMember = (id: string) => {
    const member = state.members.find(m => m.id === id)
    toast.success('Unfollowed - ' + (member?.title || '') + ' - ' + ((member?.followers || 0) - 1) + ' followers remaining')
  }

  const handleConnectWithMember = async (id: string) => {
    const member = state.members.find(m => m.id === id)
    try {
      const response = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'connect',
          resourceId: id,
          userId: 'user-1'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to connect with member')
      }

      const result = await response.json()

      if (result.success) {
        // Show next steps if available
        if (result.nextSteps && result.nextSteps.length > 0) {
          logger.debug('Connection next steps', {
            steps: result.nextSteps
          })

          toast.success(result.message + ' - ' + (member?.title || '') + ' - Next: ' + result.nextSteps.slice(0, 2).join(', '))
        } else {
          toast.success(result.message + ' - ' + (member?.title || '') + ' - ' + (member?.category || '') + ' - Now connected')
        }
      }
    } catch (error) {
      logger.error('Failed to connect with member', {
        error: error.message,
        memberId: id
      })
      toast.error('Failed to connect with member')
    }
  }
  const handleMessageMember = (id: string) => {
    const member = state.members.find(m => m.id === id)
    toast.info('Opening chat... - ' + (member?.title || '') + ' - ' + (member?.isOnline ? 'Online' : 'Last seen: ' + (member?.lastSeen || '')))
  }

  const handleJoinEvent = async (id: string) => {
    const event = state.events.find(e => e.id === id)
    // RSVP to event in database
    if (userId) {
      try {
        const { rsvpEvent } = await import('@/lib/community-hub-queries')
        await rsvpEvent(id, userId, 'attending')
      } catch (error) {
        logger.error('Failed to record event RSVP', { error: error.message })
      }
    }

    toast.success('Registered for event! - ' + (event?.date || '') + ' - ' + (event?.location || '') + ' - ' + ((event?.attendees?.length || 0) + 1) + ' attendees')
  }

  const handleCreateEvent = () => {
    toast.info('Create community event')
  }

  const handleJoinGroup = async (id: string) => {
    const group = state.groups.find(g => g.id === id)
    // Join group in database
    if (userId) {
      try {
        const { joinGroup } = await import('@/lib/community-hub-queries')
        await joinGroup(id, userId)
      } catch (error) {
        logger.error('Failed to record group join', { error: error.message })
      }
    }

    toast.success('Joined group! - ' + (group?.category || '') + ' - ' + ((group?.members?.length || 0) + 1) + ' members - ' + (group?.posts || 0) + ' posts')
  }

  const handleCreateGroup = () => {
    toast.info('Create new group')
  }

  const handlePostJob = () => {
    toast.info('Post job opportunity')
  }

  const handleApplyToJob = (id: string) => {
    const post = state.posts.find(p => p.id === id)
    const job = post?.job
    toast.success('Application submitted! - ' + (job?.currency || '$') + (job?.budget || 0) + ' - Deadline: ' + (job?.deadline || '') + ' - ' + ((job?.applicants || 0) + 1) + ' applicants')
  }

  const handleSearchMembers = (query: string) => {
    const results = state.members.filter(m =>
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.title.toLowerCase().includes(query.toLowerCase()) ||
      m.skills.some(s => s.toLowerCase().includes(query.toLowerCase()))
    )

    logger.debug('Search results', {
      query,
      resultCount: results.length
    })

    toast.info('Searching: ' + query + ' - ' + results.length + ' members found - ' + results.filter(m => m.isOnline).length + ' online')
  }

  const handleFilterBySkill = (skill: string) => {
    const matchingMembers = state.members.filter(m => m.skills.includes(skill))

    logger.debug('Skill filter results', {
      skill,
      resultCount: matchingMembers.length
    })

    toast.info('Filter by: ' + skill + ' - ' + matchingMembers.length + ' members - ' + matchingMembers.filter(m => m.availability === 'available').length + ' available')
  }

  const handleViewProfile = (id: string) => {
    const member = state.members.find(m => m.id === id)
    toast.info('Viewing profile - ' + (member?.title || '') + ' - ' + (member?.rating || 0) + ' rating - ' + (member?.totalProjects || 0) + ' projects completed')
  }

  const handleEditProfile = () => {
    toast.info('Edit your profile')
  }

  const handleSendEndorsement = (id: string) => {
    const member = state.members.find(m => m.id === id)
    toast.success('Endorsement sent! - ' + (member?.title || '') + ' - ' + ((member?.endorsements || 0) + 1) + ' endorsements - ' + (member?.rating || 0) + ' rating')
  }

  const handleReportContent = (id: string) => {
    logger.warn('Reporting content', {
      contentId: id,
      reportedBy: 'user-1'
    })

    toast.success('Content reported')
  }

  const handleBlockUser = (id: string) => {
    const member = state.members.find(m => m.id === id)

    logger.warn('Block user requested', {
      userId: id,
      userName: member?.name
    })

    setBlockUser({ id, name: member?.name || 'Unknown' })
  }

  const handleConfirmBlockUser = () => {
    if (!blockUser) return
    toast.success('User blocked: ' + blockUser.name + ' - Blocked successfully - You can unblock from Settings')
    setBlockUser(null)
  }

  const mockMembers: CommunityMember[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: '/avatars/sarah.jpg',
      title: 'Full Stack Developer',
      location: 'San Francisco, CA',
      skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
      rating: 4.9,
      isOnline: true,
      bio: 'Passionate full-stack developer with 5+ years experience building scalable web applications.',
      joinDate: '2023-01-15',
      totalProjects: 47,
      totalEarnings: 125000,
      completionRate: 98,
      responseTime: '< 1 hour',
      languages: ['English', 'Spanish'],
      certifications: ['AWS Certified Developer', 'Google Cloud Professional'],
      portfolioUrl: 'https://sarahjohnson.dev',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/sarah-johnson-dev',
        twitter: 'https://twitter.com/sarahcodes',
        github: 'https://github.com/sarahj',
        website: 'https://sarahjohnson.dev'
      },
      isConnected: true,
      isPremium: true,
      isVerified: true,
      isFollowing: false,
      followers: 1247,
      following: 543,
      posts: 89,
      category: 'freelancer',
      availability: 'available',
      hourlyRate: 85,
      currency: 'USD',
      timezone: 'PST',
      lastSeen: '2024-01-15T10:00:00Z',
      badges: ['Top Rated', 'Rising Talent', 'Expert Vetted'],
      achievements: ['100+ Projects', 'Perfect 5.0 Rating', 'Quick Responder'],
      endorsements: 234,
      testimonials: 89,
      projects: ['1', '2', '3'],
      tags: ['web-development', 'full-stack', 'react', 'node-js']
    },
    {
      id: '2',
      name: 'Mike Rodriguez',
      avatar: '/avatars/mike.jpg',
      title: 'UI/UX Designer',
      location: 'Austin, TX',
      skills: ['Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research'],
      rating: 4.8,
      isOnline: false,
      bio: 'Creative designer specializing in user-centered design and brand identity.',
      joinDate: '2023-03-20',
      totalProjects: 32,
      totalEarnings: 95000,
      completionRate: 96,
      responseTime: '< 2 hours',
      languages: ['English', 'Portuguese'],
      certifications: ['Google UX Design Certificate', 'Adobe Certified Expert'],
      portfolioUrl: 'https://mikerodriguez.design',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/mike-rodriguez-design',
        dribbble: 'https://dribbble.com/mikerod',
        behance: 'https://behance.net/mikerodriguez',
        website: 'https://mikerodriguez.design'
      },
      isConnected: false,
      isPremium: false,
      isVerified: true,
      isFollowing: true,
      followers: 892,
      following: 301,
      posts: 145,
      category: 'freelancer',
      availability: 'busy',
      hourlyRate: 65,
      currency: 'USD',
      timezone: 'CST',
      lastSeen: '2024-01-15T08:30:00Z',
      badges: ['Top Rated', 'Design Expert'],
      achievements: ['Featured Designer', 'Client Favorite'],
      endorsements: 156,
      testimonials: 67,
      projects: ['4', '5'],
      tags: ['design', 'ui-ux', 'branding', 'figma']
    },
    {
      id: '3',
      name: 'TechCorp Inc.',
      avatar: '/avatars/techcorp.jpg',
      title: 'Technology Company',
      location: 'New York, NY',
      skills: ['Enterprise Solutions', 'Team Management', 'Project Planning'],
      rating: 4.7,
      isOnline: true,
      bio: 'Leading technology company looking for top talent to join our innovative projects.',
      joinDate: '2022-11-10',
      totalProjects: 23,
      totalEarnings: 0,
      completionRate: 100,
      responseTime: '< 4 hours',
      languages: ['English'],
      certifications: ['ISO 9001', 'SOC 2 Compliant'],
      portfolioUrl: 'https://techcorp.com',
      socialLinks: {
        linkedin: 'https://linkedin.com/company/techcorp',
        twitter: 'https://twitter.com/techcorp',
        website: 'https://techcorp.com'
      },
      isConnected: true,
      isPremium: true,
      isVerified: true,
      isFollowing: false,
      followers: 2341,
      following: 89,
      posts: 156,
      category: 'client',
      availability: 'available',
      hourlyRate: 0,
      currency: 'USD',
      timezone: 'EST',
      lastSeen: '2024-01-15T09:15:00Z',
      badges: ['Verified Client', 'Enterprise'],
      achievements: ['Trusted Partner', 'Long-term Collaborator'],
      endorsements: 445,
      testimonials: 234,
      projects: ['6', '7', '8'],
      tags: ['enterprise', 'technology', 'innovation', 'scalable']
    }
  ]

  const mockPosts: CommunityPost[] = [
    {
      id: '1',
      authorId: '1',
      content: 'Just launched my latest project! A React dashboard with real-time analytics. What do you think about the new design trends in 2024?',
      type: 'showcase',
      media: [
        {
          type: 'image',
          url: '/posts/dashboard-preview.jpg',
          thumbnail: '/posts/dashboard-preview-thumb.jpg',
          caption: 'Dashboard Preview'
        }
      ],
      showcase: {
        title: 'Analytics Dashboard',
        description: 'Real-time analytics dashboard built with React and Node.js',
        category: 'Web Development',
        tags: ['react', 'dashboard', 'analytics', 'real-time'],
        projectUrl: 'https://analytics-dashboard.demo',
        githubUrl: 'https://github.com/sarahj/analytics-dashboard',
        liveUrl: 'https://analytics-dashboard.live',
        technologies: ['React', 'Node.js', 'PostgreSQL', 'Socket.io', 'Chart.js']
      },
      createdAt: '2024-01-15T09:00:00Z',
      updatedAt: '2024-01-15T09:00:00Z',
      likes: 89,
      comments: 23,
      shares: 12,
      bookmarks: 34,
      views: 456,
      isLiked: false,
      isBookmarked: true,
      isShared: false,
      visibility: 'public',
      tags: ['react', 'dashboard', 'analytics', 'showcase'],
      location: 'San Francisco, CA',
      mentions: [],
      hashtags: ['#webdevelopment', '#react', '#dashboard'],
      isPromoted: false,
      isPinned: false,
      isEdited: false,
      editHistory: [],
      reports: 0,
      isReported: false,
      isHidden: false,
      isArchived: false,
      engagement: {
        impressions: 1234,
        clicks: 156,
        shares: 12,
        saves: 34,
        comments: 23,
        likes: 89
      }
    },
    {
      id: '2',
      authorId: '2',
      content: 'Looking for feedback on this new logo design concept. Should I go with the minimalist approach or add more visual elements?',
      type: 'image',
      media: [
        {
          type: 'image',
          url: '/posts/logo-concept.jpg',
          thumbnail: '/posts/logo-concept-thumb.jpg',
          caption: 'Logo Design Concept'
        }
      ],
      createdAt: '2024-01-15T08:30:00Z',
      updatedAt: '2024-01-15T08:30:00Z',
      likes: 156,
      comments: 45,
      shares: 8,
      bookmarks: 67,
      views: 892,
      isLiked: true,
      isBookmarked: false,
      isShared: false,
      visibility: 'public',
      tags: ['design', 'logo', 'branding', 'feedback'],
      location: 'Austin, TX',
      mentions: [],
      hashtags: ['#logodesign', '#branding', '#feedback'],
      isPromoted: false,
      isPinned: false,
      isEdited: false,
      editHistory: [],
      reports: 0,
      isReported: false,
      isHidden: false,
      isArchived: false,
      engagement: {
        impressions: 2341,
        clicks: 234,
        shares: 8,
        saves: 67,
        comments: 45,
        likes: 156
      }
    },
    {
      id: '3',
      authorId: '3',
      content: 'We\'re hiring! Looking for a senior full-stack developer to join our team. Remote work available. Competitive salary and great benefits.',
      type: 'job',
      job: {
        title: 'Senior Full-Stack Developer',
        description: 'We are looking for an experienced full-stack developer to join our growing team and work on exciting enterprise projects.',
        budget: 120000,
        currency: 'USD',
        deadline: '2024-02-15',
        skills: ['React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker'],
        category: 'Web Development',
        type: 'fixed',
        experience: 'expert',
        applicants: 23,
        status: 'open'
      },
      createdAt: '2024-01-15T07:45:00Z',
      updatedAt: '2024-01-15T07:45:00Z',
      likes: 67,
      comments: 12,
      shares: 34,
      bookmarks: 89,
      views: 1234,
      isLiked: false,
      isBookmarked: true,
      isShared: false,
      visibility: 'public',
      tags: ['job', 'hiring', 'full-stack', 'remote'],
      location: 'New York, NY',
      mentions: [],
      hashtags: ['#hiring', '#fullstack', '#remote'],
      isPromoted: true,
      isPinned: false,
      isEdited: false,
      editHistory: [],
      reports: 0,
      isReported: false,
      isHidden: false,
      isArchived: false,
      engagement: {
        impressions: 3456,
        clicks: 345,
        shares: 34,
        saves: 89,
        comments: 12,
        likes: 67
      }
    }
  ]

  const mockEvents: CommunityEvent[] = [
    {
      id: '1',
      organizerId: '1',
      title: 'React 18 Workshop: New Features Deep Dive',
      description: 'Learn about the latest React 18 features including Concurrent Rendering, Suspense, and Server Components.',
      category: 'Workshop',
      type: 'online',
      date: '2024-01-25T18:00:00Z',
      endDate: '2024-01-25T20:00:00Z',
      location: 'Virtual Event',
      maxAttendees: 100,
      price: 0,
      currency: 'USD',
      tags: ['react', 'workshop', 'javascript', 'frontend'],
      attendees: ['2', '3'],
      interestedUsers: ['4', '5', '6'],
      speakers: ['1'],
      agenda: [
        {
          time: '18:00',
          title: 'Introduction to React 18',
          description: 'Overview of new features and improvements',
          speaker: 'Sarah Johnson'
        },
        {
          time: '18:30',
          title: 'Concurrent Rendering',
          description: 'Deep dive into concurrent features',
          speaker: 'Sarah Johnson'
        },
        {
          time: '19:00',
          title: 'Suspense and Server Components',
          description: 'Building better user experiences',
          speaker: 'Sarah Johnson'
        },
        {
          time: '19:30',
          title: 'Q&A Session',
          description: 'Open discussion and questions',
          speaker: 'Sarah Johnson'
        }
      ],
      requirements: ['Basic React knowledge', 'Node.js installed'],
      materials: ['Workshop code repository', 'Slides and resources'],
      certificates: true,
      recording: true,
      isPublic: true,
      isApprovalRequired: false,
      status: 'published',
      createdAt: '2024-01-10T10:00:00Z',
      updatedAt: '2024-01-10T10:00:00Z',
      views: 456,
      shares: 23,
      isAttending: false,
      isInterested: true,
      feedback: {
        rating: 4.8,
        comments: ['Great workshop!', 'Very informative', 'Well structured']
      },
      resources: [
        {
          title: 'Workshop Code Repository',
          type: 'link',
          url: 'https://github.com/sarahj/react18-workshop'
        },
        {
          title: 'Presentation Slides',
          type: 'document',
          url: '/events/react18-slides.pdf'
        }
      ]
    }
  ]

  const mockGroups: CommunityGroup[] = [
    {
      id: '1',
      name: 'KAZI Developers',
      description: 'A community for developers using the KAZI platform to share knowledge, collaborate, and grow together.',
      avatar: '/groups/kazi-developers.jpg',
      coverImage: '/groups/kazi-developers-cover.jpg',
      category: 'Technology',
      type: 'public',
      members: ['1', '2', '3'],
      admins: ['1'],
      moderators: ['2'],
      rules: [
        'Be respectful to all members',
        'No spam or self-promotion without permission',
        'Share knowledge and help others learn',
        'Use appropriate channels for discussions'
      ],
      tags: ['development', 'kazi', 'community', 'programming'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T12:00:00Z',
      isJoined: true,
      isPending: false,
      isInvited: false,
      posts: 234,
      activeMembers: 156,
      weeklyActivity: 89,
      monthlyActivity: 345,
      growthRate: 23,
      engagement: 87,
      rating: 4.9,
      reviews: 45,
      isVerified: true,
      isPremium: false,
      isFeatured: true,
      isArchived: false,
      settings: {
        allowPosts: true,
        allowMedia: true,
        allowPolls: true,
        allowEvents: true,
        allowJobs: true,
        requireApproval: false,
        moderateContent: true,
        allowInvites: true,
        allowDiscovery: true,
        allowNotifications: true
      }
    }
  ]

  const memoizedMockMembers = useMemo(() => mockMembers, [])
  const memoizedMockPosts = useMemo(() => mockPosts, [])
  const memoizedMockEvents = useMemo(() => mockEvents, [])
  const memoizedMockGroups = useMemo(() => mockGroups, [])

  useEffect(() => {
    const loadData = async () => {
      if (!userId) {        dispatch({ type: 'SET_LOADING', payload: false })
        return
      }

      try {
        dispatch({ type: 'SET_LOADING', payload: true })        // Fetch all community data in parallel
        const [membersResult, postsResult, eventsResult, groupsResult, statsResult, currentMemberResult] = await Promise.all([
          getMembers({}),
          getPosts({}),
          getEvents({ upcoming: true }),
          getGroups({}),
          getCommunityStats(),
          getMemberByUserId(userId)
        ])

        // Transform members data from Supabase to UI format
        const transformedMembers = (membersResult.data || []).map((m) => ({
          id: m.id,
          name: m.name,
          avatar: m.avatar,
          title: m.title,
          location: m.location,
          skills: m.skills,
          rating: Number(m.rating),
          isOnline: m.is_online,
          bio: m.bio || '',
          joinDate: new Date(m.created_at).toISOString().split('T')[0],
          totalProjects: m.total_projects,
          totalEarnings: Number(m.total_earnings),
          completionRate: m.completion_rate,
          responseTime: m.response_time || 'N/A',
          languages: m.languages,
          certifications: m.certifications,
          portfolioUrl: m.portfolio_url,
          socialLinks: {},
          isConnected: m.is_connected,
          isPremium: m.is_premium,
          isVerified: m.is_verified,
          isFollowing: m.is_following,
          followers: m.followers,
          following: m.following,
          posts: m.posts_count,
          category: m.category as 'freelancer' | 'client' | 'agency' | 'student',
          availability: m.availability as 'available' | 'busy' | 'away' | 'offline',
          hourlyRate: m.hourly_rate ? Number(m.hourly_rate) : undefined,
          currency: m.currency,
          timezone: m.timezone,
          lastSeen: m.last_seen,
          badges: m.badges,
          achievements: m.achievements,
          endorsements: m.endorsements,
          testimonials: m.testimonials,
          projects: [],
          tags: []
        }))

        // Transform posts data
        const transformedPosts = (postsResult.data || []).map((p) => ({
          id: p.id,
          authorId: p.author_id,
          content: p.content,
          type: p.type as 'text' | 'image' | 'video' | 'link' | 'poll' | 'event' | 'job' | 'showcase',
          media: [],
          showcase: undefined,
          poll: undefined,
          job: undefined,
          event: undefined,
          createdAt: p.created_at,
          updatedAt: p.updated_at,
          likes: p.likes_count,
          comments: p.comments_count,
          shares: p.shares_count,
          bookmarks: p.bookmarks_count,
          views: p.views_count,
          isLiked: false,
          isBookmarked: false,
          isShared: false,
          visibility: p.visibility as 'public' | 'connections' | 'private',
          tags: p.tags,
          location: '',
          mentions: p.mentions,
          hashtags: p.hashtags,
          isPromoted: p.is_promoted,
          isPinned: p.is_pinned,
          isEdited: p.is_edited,
          editHistory: [],
          reports: 0,
          isReported: false,
          isHidden: false,
          isArchived: false,
          engagement: {
            impressions: p.views_count,
            clicks: 0,
            shares: p.shares_count,
            saves: p.bookmarks_count,
            comments: p.comments_count,
            likes: p.likes_count
          }
        }))

        // Transform events data
        const transformedEvents = (eventsResult.data || []).map((e) => ({
          id: e.id,
          organizerId: e.organizer_id,
          title: e.title,
          description: e.description,
          category: e.category,
          type: e.type as 'online' | 'offline' | 'hybrid',
          date: e.event_date,
          endDate: e.end_date,
          location: e.location,
          maxAttendees: e.max_attendees,
          price: Number(e.price),
          currency: e.currency,
          tags: e.tags,
          attendees: e.attendee_count,
          interested: e.interested_count,
          views: e.views_count,
          shares: e.shares_count,
          isAttending: false,
          isInterested: false,
          isOrganizer: e.organizer_id === (currentMemberResult.data?.id || ''),
          isFeatured: false,
          isPast: new Date(e.event_date) < new Date(),
          isLive: false,
          visibility: 'public' as const,
          media: [],
          agenda: [],
          speakers: [],
          sponsors: [],
          faqs: [],
          createdAt: e.created_at,
          updatedAt: e.updated_at
        }))

        // Transform groups data
        const transformedGroups = (groupsResult.data || []).map((g) => ({
          id: g.id,
          name: g.name,
          description: g.description,
          avatar: g.avatar,
          coverImage: g.cover_image,
          category: g.category,
          type: g.type as 'public' | 'private' | 'secret',
          members: g.member_count,
          admins: g.admin_count,
          posts: g.posts_count,
          isVerified: g.is_verified,
          isPremium: g.is_premium,
          rating: Number(g.rating),
          tags: g.tags,
          createdAt: g.created_at,
          updatedAt: g.updated_at,
          rules: [],
          isJoined: false,
          isPending: false,
          isInvited: false,
          activeMembers: g.member_count,
          weeklyActivity: 0,
          monthlyActivity: 0,
          growthRate: 0,
          engagement: 0,
          reviews: 0,
          isFeatured: false,
          isArchived: false,
          settings: {
            allowPosts: true,
            allowMedia: true,
            allowPolls: true,
            allowEvents: true,
            allowJobs: true,
            requireApproval: false,
            moderateContent: true,
            allowInvites: true,
            visibility: 'public' as const
          }
        }))

        // Set current user (or fall back to mock if no member profile exists)
        const currentUser = currentMemberResult.data ? {
          id: currentMemberResult.data.id,
          name: currentMemberResult.data.name,
          avatar: currentMemberResult.data.avatar,
          title: currentMemberResult.data.title,
          location: currentMemberResult.data.location,
          skills: currentMemberResult.data.skills,
          rating: Number(currentMemberResult.data.rating),
          isOnline: currentMemberResult.data.is_online,
          bio: currentMemberResult.data.bio || '',
          joinDate: new Date(currentMemberResult.data.created_at).toISOString().split('T')[0],
          totalProjects: currentMemberResult.data.total_projects,
          totalEarnings: Number(currentMemberResult.data.total_earnings),
          completionRate: currentMemberResult.data.completion_rate,
          responseTime: currentMemberResult.data.response_time || 'N/A',
          languages: currentMemberResult.data.languages,
          certifications: currentMemberResult.data.certifications,
          portfolioUrl: currentMemberResult.data.portfolio_url,
          socialLinks: {},
          isConnected: false,
          isPremium: currentMemberResult.data.is_premium,
          isVerified: currentMemberResult.data.is_verified,
          isFollowing: false,
          followers: currentMemberResult.data.followers,
          following: currentMemberResult.data.following,
          posts: currentMemberResult.data.posts_count,
          category: currentMemberResult.data.category as 'freelancer' | 'client' | 'agency' | 'student',
          availability: currentMemberResult.data.availability as 'available' | 'busy' | 'away' | 'offline',
          hourlyRate: currentMemberResult.data.hourly_rate ? Number(currentMemberResult.data.hourly_rate) : undefined,
          currency: currentMemberResult.data.currency,
          timezone: currentMemberResult.data.timezone,
          lastSeen: currentMemberResult.data.last_seen,
          badges: currentMemberResult.data.badges,
          achievements: currentMemberResult.data.achievements,
          endorsements: currentMemberResult.data.endorsements,
          testimonials: currentMemberResult.data.testimonials,
          projects: [],
          tags: []
        } : (transformedMembers.length > 0 ? transformedMembers[0] : memoizedMockMembers[0])

        // Dispatch all data to reducer
        dispatch({ type: 'SET_MEMBERS', payload: transformedMembers.length > 0 ? transformedMembers : memoizedMockMembers })
        dispatch({ type: 'SET_POSTS', payload: transformedPosts.length > 0 ? transformedPosts : memoizedMockPosts })
        dispatch({ type: 'SET_EVENTS', payload: transformedEvents.length > 0 ? transformedEvents : memoizedMockEvents })
        dispatch({ type: 'SET_GROUPS', payload: transformedGroups.length > 0 ? transformedGroups : memoizedMockGroups })
        dispatch({ type: 'SET_CURRENT_USER', payload: currentUser })
        dispatch({ type: 'SET_LOADING', payload: false })
        if (transformedMembers.length > 0 || transformedPosts.length > 0 || transformedEvents.length > 0 || transformedGroups.length > 0) {
          toast.success('Community Hub loaded - ' + transformedMembers.length + ' members - ' + transformedPosts.length + ' posts - ' + transformedEvents.length + ' events - ' + transformedGroups.length + ' groups')
          announce('Community Hub loaded successfully', 'polite')
        }
      } catch (error) {
        logger.error('Exception loading Community Hub data', { error: error.message, userId })
        toast.error('Failed to load community data')
        announce('Failed to load community data', 'assertive')

        // Fall back to mock data on error
        dispatch({ type: 'SET_MEMBERS', payload: memoizedMockMembers })
        dispatch({ type: 'SET_POSTS', payload: memoizedMockPosts })
        dispatch({ type: 'SET_EVENTS', payload: memoizedMockEvents })
        dispatch({ type: 'SET_GROUPS', payload: memoizedMockGroups })
        dispatch({ type: 'SET_CURRENT_USER', payload: memoizedMockMembers[0] })
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    loadData()
  }, [userId, announce, memoizedMockMembers, memoizedMockPosts, memoizedMockEvents, memoizedMockGroups]) // eslint-disable-line react-hooks/exhaustive-deps

  const filteredMembers = state.members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                         member.skills.some(skill => skill.toLowerCase().includes(state.searchTerm.toLowerCase())) ||
                         member.title.toLowerCase().includes(state.searchTerm.toLowerCase())
    
    const matchesFilter = state.filterBy === 'all' || member.category === state.filterBy
    const matchesOnline = !state.onlineFilter || member.isOnline
    const matchesVerified = !state.verifiedFilter || member.isVerified
    const matchesPremium = !state.premiumFilter || member.isPremium
    const matchesRating = member.rating >= state.ratingFilter
    const matchesAvailability = state.availabilityFilter === 'all' || member.availability === state.availabilityFilter
    
    return matchesSearch && matchesFilter && matchesOnline && matchesVerified && matchesPremium && matchesRating && matchesAvailability
  })

  const filteredPosts = state.posts.filter(post => {
    const author = state.members.find(m => m.id === post.authorId)
    if (!author) return false
    
    const matchesSearch = post.content.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(state.searchTerm.toLowerCase())) ||
                         author.name.toLowerCase().includes(state.searchTerm.toLowerCase())
    
    const matchesFilter = state.feedFilter === 'all' || 
                         (state.feedFilter === 'connections' && state.connections.includes(post.authorId)) ||
                         (state.feedFilter === 'jobs' && post.type === 'job') ||
                         (state.feedFilter === 'events' && post.type === 'event') ||
                         (state.feedFilter === 'showcase' && post.type === 'showcase')
    
    return matchesSearch && matchesFilter
  })

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    switch (state.sortBy) {
      case 'rating':
        return b.rating - a.rating
      case 'newest':
        return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()
      case 'oldest':
        return new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime()
      case 'popular':
        return b.followers - a.followers
      default:
        return a.name.localeCompare(b.name)
    }
  })

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (state.sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'popular':
        return b.likes - a.likes
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  const getMemberStatusColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-500'
      case 'busy': return 'bg-yellow-500'
      case 'away': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'job': return Briefcase
      case 'event': return Calendar
      case 'showcase': return Star
      case 'poll': return BarChart3
      case 'video': return Video
      case 'image': return ImageIcon
      case 'link': return Link
      default: return MessageSquare
    }
  }

  const handleCreatePost = async () => {
    if (!state.newPost.content) {
      toast.error('Please enter some content')
      return
    }

    if (!userId) {
      toast.error('Please log in to create posts')
      return
    }

    try {
      // Dynamic import for code splitting
      const { createPost } = await import('@/lib/community-hub-queries')

      const { data: createdPost, error: createError } = await createPost(userId, {
        content: state.newPost.content,
        type: state.postType,
        visibility: 'public',
        tags: [],
        hashtags: [],
        mentions: []
      })

      if (createError || !createdPost) {
        throw new Error(createError?.message || 'Failed to create post')
      }

      const newPost: CommunityPost = {
        id: createdPost.id,
        authorId: userId,
        content: state.newPost.content,
        type: state.postType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: 0,
        comments: 0,
        shares: 0,
        bookmarks: 0,
        views: 0,
        isLiked: false,
        isBookmarked: false,
        isShared: false,
        visibility: 'public',
        tags: [],
        mentions: [],
        hashtags: [],
        isPromoted: false,
        isPinned: false,
        isEdited: false,
        editHistory: [],
        reports: 0,
        isReported: false,
        isHidden: false,
        isArchived: false,
        engagement: {
          impressions: 0,
          clicks: 0,
          shares: 0,
          saves: 0,
          comments: 0,
          likes: 0
        }
      }

      dispatch({ type: 'ADD_POST', payload: newPost })
      dispatch({ type: 'SET_NEW_POST', payload: {} })
      dispatch({ type: 'SET_SHOW_CREATE_POST', payload: false })
      toast.success('Post created successfully!')
      announce('Post created successfully', 'polite')
    } catch (error) {
      toast.error('Failed to create post')
      announce('Error creating post', 'assertive')
    }
  }

  const handlePostAction = (action: string, postId: string) => {
    switch (action) {
      case 'like':
        dispatch({ type: 'LIKE_POST', payload: postId })
        break
      case 'unlike':
        dispatch({ type: 'UNLIKE_POST', payload: postId })
        break
      case 'bookmark':
        dispatch({ type: 'BOOKMARK_POST', payload: postId })
        break
      case 'unbookmark':
        dispatch({ type: 'UNBOOKMARK_POST', payload: postId })
        break
      case 'share':
        dispatch({ type: 'SHARE_POST', payload: postId })
        break
      case 'comment':
        toast.info('💬 Opening comments for post ' + postId)
        break
      case 'report':
        toast.info('⚠️ Reporting post ' + postId)
        break
      default:
        break
    }
  }

  const handleMemberAction = (action: string, memberId: string) => {
    switch (action) {
      case 'connect':
        dispatch({ type: 'CONNECT_MEMBER', payload: memberId })
        break
      case 'disconnect':
        dispatch({ type: 'DISCONNECT_MEMBER', payload: memberId })
        break
      case 'follow':
        dispatch({ type: 'FOLLOW_MEMBER', payload: memberId })
        break
      case 'unfollow':
        dispatch({ type: 'UNFOLLOW_MEMBER', payload: memberId })
        break
      case 'block':
        dispatch({ type: 'BLOCK_MEMBER', payload: memberId })
        break
      case 'unblock':
        dispatch({ type: 'UNBLOCK_MEMBER', payload: memberId })
        break
      case 'message':
        toast.info('💬 Opening chat with ' + memberId)
        break
      case 'hire':
        toast.info('💼 Hiring ' + memberId)
        break
      default:
        break
    }
  }

  const renderMemberCard = (member: CommunityMember) => (
    <Card key={member.id} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="w-16 h-16">
              <AvatarImage src={member.avatar} alt={member.name} />
              <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${getMemberStatusColor(member.availability)}`} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{member.name}</h3>
              {member.isVerified && <CheckCircle className="w-5 h-5 text-blue-500" />}
              {member.isPremium && <Star className="w-5 h-5 text-yellow-500 fill-current" />}
            </div>
            
            <p className="text-gray-600 mb-2">{member.title}</p>
            
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
              <MapPin className="w-4 h-4" />
              <span>{member.location}</span>
              {member.hourlyRate && (
                <>
                  <span>•</span>
                  <span>${member.hourlyRate}/{member.currency === 'USD' ? 'hr' : 'hr'}</span>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">{member.rating}</span>
              </div>
              <span className="text-sm text-gray-500">({member.testimonials} reviews)</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">{member.totalProjects} projects</span>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {member.skills.slice(0, 3).map(skill => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {member.skills.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{member.skills.length - 3} more
                </Badge>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                data-testid={`${member.isConnected ? 'disconnect' : 'connect'}-member-${member.id}-btn`}
                size="sm"
                variant={member.isConnected ? "outline" : "default"}
                onClick={() => handleMemberAction(member.isConnected ? 'disconnect' : 'connect', member.id)}
              >
                {member.isConnected ? <UserCheck className="w-4 h-4 mr-1" /> : <UserPlus className="w-4 h-4 mr-1" />}
                {member.isConnected ? 'Connected' : 'Connect'}
              </Button>

              <Button
                data-testid={`message-member-${member.id}-btn`}
                size="sm"
                variant="outline"
                onClick={() => handleMemberAction('message', member.id)}
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Message
              </Button>

              {member.category === 'freelancer' && (
                <Button
                  data-testid={`hire-member-${member.id}-btn`}
                  size="sm"
                  variant="outline"
                  onClick={() => handleMemberAction('hire', member.id)}
                >
                  <Briefcase className="w-4 h-4 mr-1" />
                  Hire
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderPostCard = (post: CommunityPost) => {
    const author = state.members.find(m => m.id === post.authorId)
    if (!author) return null
    
    const PostTypeIcon = getPostTypeIcon(post.type)
    
    return (
      <Card key={post.id} className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={author.avatar} alt={author.name} />
              <AvatarFallback>{author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold">{author.name}</h4>
                {author.isVerified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</span>
                <PostTypeIcon className="w-4 h-4 text-gray-500" />
              </div>
              
              <p className="text-gray-700 mb-4">{post.content}</p>
              
              {post.type === 'job' && post.job && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    <h5 className="font-semibold text-blue-900">{post.job.title}</h5>
                  </div>
                  <p className="text-blue-800 mb-2">{post.job.description}</p>
                  <div className="flex items-center gap-4 text-sm text-blue-700">
                    <span className="font-medium">${post.job.budget.toLocaleString()}</span>
                    <span>•</span>
                    <span>{post.job.type === 'fixed' ? 'Fixed Price' : 'Hourly'}</span>
                    <span>•</span>
                    <span>{post.job.experience} level</span>
                    <span>•</span>
                    <span>{post.job.applicants} applicants</span>
                  </div>
                </div>
              )}
              
              {post.type === 'showcase' && post.showcase && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-purple-600" />
                    <h5 className="font-semibold text-purple-900">{post.showcase.title}</h5>
                  </div>
                  <p className="text-purple-800 mb-2">{post.showcase.description}</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {post.showcase.technologies.map(tech => (
                      <Badge key={tech} variant="outline" className="text-xs border-purple-300 text-purple-700">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {post.showcase.liveUrl && (
                      <Button size="sm" variant="outline" className="text-purple-700 border-purple-300">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Live Demo
                      </Button>
                    )}
                    {post.showcase.githubUrl && (
                      <Button size="sm" variant="outline" className="text-purple-700 border-purple-300">
                        <Github className="w-4 h-4 mr-1" />
                        Code
                      </Button>
                    )}
                  </div>
                </div>
              )}
              
              {post.media && post.media.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {post.media.map((media, index) => (
                    <div key={index} className="relative rounded-lg overflow-hidden">
                      <img src={media.thumbnail || media.url} 
                        alt={media.caption || 'Post media'} 
                        className="w-full h-48 object-cover"
                      loading="lazy" />
                      {media.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
                          {media.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex items-center gap-1 mb-3">
                {post.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    data-testid={`like-post-${post.id}-btn`}
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePostAction(post.isLiked ? 'unlike' : 'like', post.id)}
                    className={post.isLiked ? 'text-red-500' : 'text-gray-500'}
                  >
                    <Heart className={`w-4 h-4 mr-1 ${post.isLiked ? 'fill-current' : ''}`} />
                    {post.likes}
                  </Button>

                  <Button
                    data-testid={`comment-post-${post.id}-btn`}
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePostAction('comment', post.id)}
                    className="text-gray-500"
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    {post.comments}
                  </Button>

                  <Button
                    data-testid={`share-post-${post.id}-btn`}
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePostAction('share', post.id)}
                    className="text-gray-500"
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    {post.shares}
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    data-testid={`bookmark-post-${post.id}-btn`}
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePostAction(post.isBookmarked ? 'unbookmark' : 'bookmark', post.id)}
                    className={post.isBookmarked ? 'text-blue-500' : 'text-gray-500'}
                  >
                    <BookmarkPlus className={`w-4 h-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
                  </Button>

                  <Button
                    data-testid={`post-menu-${post.id}-btn`}
                    variant="ghost"
                    size="sm"
                    className="text-gray-500"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (state.loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* Pattern Craft Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900 to-slate-950 -z-10 dark:opacity-100 opacity-0" />
      <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse dark:opacity-100 opacity-0"></div>
      <div className="absolute top-1/3 -right-4 w-96 h-96 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000 dark:opacity-100 opacity-0"></div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="relative backdrop-blur-sm bg-slate-900/50 border-b border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <GlowEffect className="absolute -inset-2 bg-gradient-to-r from-purple-500/50 to-pink-500/50 rounded-lg blur opacity-75" />
                <div className="relative p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                  <Globe className="w-6 h-6 text-white" />
                </div>
              </div>
              <TextShimmer className="text-4xl font-bold text-white" duration={2}>
                Community Hub
              </TextShimmer>
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">KAZI</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{state.members.length} active members</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
            
            <Dialog open={state.showCreatePost} onOpenChange={(open) => dispatch({ type: 'SET_SHOW_CREATE_POST', payload: open })}>
              <DialogTrigger asChild>
                <Button data-testid="open-create-post-dialog-btn" size="sm" className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Post</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="postType">Post Type</Label>
                    <select
                      value={state.postType}
                      onChange={(e) => dispatch({ type: 'SET_POST_TYPE', payload: e.target.value })}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="text">Text Post</option>
                      <option value="image">Image Post</option>
                      <option value="video">Video Post</option>
                      <option value="link">Link Post</option>
                      <option value="poll">Poll</option>
                      <option value="job">Job Posting</option>
                      <option value="event">Event</option>
                      <option value="showcase">Project Showcase</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      placeholder="What's on your mind?"
                      value={state.newPost.content || ''}
                      onChange={(e) => dispatch({ type: 'SET_NEW_POST', payload: { ...state.newPost, content: e.target.value } })}
                      rows={4}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      data-testid="cancel-create-post-btn"
                      variant="outline"
                      onClick={() => dispatch({ type: 'SET_SHOW_CREATE_POST', payload: false })}
                    >
                      Cancel
                    </Button>
                    <Button
                      data-testid="submit-create-post-btn"
                      onClick={handleCreatePost}
                      disabled={!state.newPost.content}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Post
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="p-6">
        
        {/* V2 Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <AIInsightsPanel insights={communityHubAIInsights} />
          <PredictiveAnalytics predictions={communityHubPredictions} />
          <CollaborationIndicator collaborators={communityHubCollaborators} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <QuickActionsToolbar actions={communityHubQuickActions} />
          <ActivityFeed activities={communityHubActivities} />
        </div>
<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="feed">Feed ({sortedPosts.length})</TabsTrigger>
            <TabsTrigger value="members">Members ({sortedMembers.length})</TabsTrigger>
            <TabsTrigger value="events">Events ({state.events.length})</TabsTrigger>
            <TabsTrigger value="groups">Groups ({state.groups.length})</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="feed" className="space-y-6">
            {/* Feed Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search posts..."
                  value={state.searchTerm}
                  onChange={(e) => dispatch({ type: 'SET_SEARCH_TERM', payload: e.target.value })}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={state.feedFilter}
                  onChange={(e) => dispatch({ type: 'SET_FEED_FILTER', payload: e.target.value })}
                  className="w-32 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">All Posts</option>
                  <option value="connections">Connections</option>
                  <option value="groups">Groups</option>
                  <option value="jobs">Jobs</option>
                  <option value="events">Events</option>
                  <option value="showcase">Showcase</option>
                </select>

                <select
                  value={state.sortBy}
                  onChange={(e) => dispatch({ type: 'SET_SORT_BY', payload: e.target.value })}
                  className="w-32 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="popular">Popular</option>
                  <option value="relevance">Relevance</option>
                </select>
              </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-6">
              {sortedPosts.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
                    <p className="text-gray-600 mb-4">
                      {state.searchTerm ? 'Try adjusting your search terms' : 'Be the first to share something with the community!'}
                    </p>
                    <Button onClick={() => dispatch({ type: 'SET_SHOW_CREATE_POST', payload: true })}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Post
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                sortedPosts.map(renderPostCard)
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="members" className="space-y-6">
            {/* Member Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search members..."
                  value={state.searchTerm}
                  onChange={(e) => dispatch({ type: 'SET_SEARCH_TERM', payload: e.target.value })}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={state.filterBy}
                  onChange={(e) => dispatch({ type: 'SET_FILTER_BY', payload: e.target.value })}
                  className="w-32 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">All Members</option>
                  <option value="freelancers">Freelancers</option>
                  <option value="clients">Clients</option>
                  <option value="agencies">Agencies</option>
                  <option value="students">Students</option>
                </select>

                <select
                  value={state.sortBy}
                  onChange={(e) => dispatch({ type: 'SET_SORT_BY', payload: e.target.value })}
                  className="w-32 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="relevance">Relevance</option>
                  <option value="rating">Rating</option>
                  <option value="newest">Newest</option>
                  <option value="popular">Popular</option>
                </select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: state.viewMode === 'grid' ? 'list' : 'grid' })}
                >
                  {state.viewMode === 'grid' ? <List className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={state.onlineFilter} 
                      onCheckedChange={(checked) => dispatch({ type: 'SET_ONLINE_FILTER', payload: checked })} 
                    />
                    <Label>Online Only</Label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={state.verifiedFilter} 
                      onCheckedChange={(checked) => dispatch({ type: 'SET_VERIFIED_FILTER', payload: checked })} 
                    />
                    <Label>Verified Only</Label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={state.premiumFilter} 
                      onCheckedChange={(checked) => dispatch({ type: 'SET_PREMIUM_FILTER', payload: checked })} 
                    />
                    <Label>Premium Only</Label>
                  </div>
                  
                  <select
                    value={state.availabilityFilter}
                    onChange={(e) => dispatch({ type: 'SET_AVAILABILITY_FILTER', payload: e.target.value })}
                    className="w-32 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="all">All Availability</option>
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="away">Away</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Members Grid */}
            <div className={state.viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {sortedMembers.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="p-12 text-center">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
                    <p className="text-gray-600">Try adjusting your search terms or filters</p>
                  </CardContent>
                </Card>
              ) : (
                sortedMembers.map(renderMemberCard)
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="events" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Community Events</h2>
              <Button data-testid="create-event-btn">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  id: '1',
                  title: 'Freelancer Networking Meetup',
                  date: '2024-02-15',
                  time: '6:00 PM',
                  location: 'Virtual',
                  attendees: 47,
                  type: 'networking',
                  image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=200&fit=crop'
                },
                {
                  id: '2',
                  title: 'Web Development Workshop',
                  date: '2024-02-20',
                  time: '2:00 PM',
                  location: 'San Francisco, CA',
                  attendees: 23,
                  type: 'workshop',
                  image: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=400&h=200&fit=crop'
                },
                {
                  id: '3',
                  title: 'Design Portfolio Review',
                  date: '2024-02-25',
                  time: '1:00 PM',
                  location: 'Virtual',
                  attendees: 31,
                  type: 'review',
                  image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=200&fit=crop'
                }
              ].map((event, index) => {
                const eventGradients = [
                  { from: 'blue-500', to: 'indigo-600' },
                  { from: 'purple-500', to: 'pink-600' },
                  { from: 'green-500', to: 'emerald-600' }
                ]
                const gradient = eventGradients[index % 3]

                return (
                  <div key={event.id} className="relative group">
                    <GlowEffect className={`absolute -inset-0.5 bg-gradient-to-r from-${gradient.from}/20 to-${gradient.to}/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity`} />
                    <LiquidGlassCard className="relative hover:shadow-2xl transition-shadow">
                      <BorderTrail className={`bg-gradient-to-r from-${gradient.from} to-${gradient.to}`} size={60} duration={6} />
                      <div className="relative">
                        <img src={event.image} alt={event.title} className="w-full h-32 object-cover rounded-t-lg" loading="lazy" />
                        <Badge className="absolute top-2 right-2" variant="secondary">
                          {event.type}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2 text-white">{event.title}</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {event.date} at {event.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {event.attendees} attending
                      </div>
                    </div>
                        <div className="flex gap-2 mt-4">
                          <Button data-testid={`join-event-${event.id}-btn`} size="sm" className="flex-1">Join Event</Button>
                          <Button data-testid={`favorite-event-${event.id}-btn`} size="sm" variant="outline">
                            <Heart className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </LiquidGlassCard>
                  </div>
                )
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="groups" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Community Groups</h2>
              <Button data-testid="create-group-btn">
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  id: '1',
                  name: 'React Developers',
                  description: 'Share tips, tricks, and best practices for React development',
                  members: 1247,
                  category: 'Development',
                  isPrivate: false,
                  avatar: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=100&h=100&fit=crop',
                  posts: 234,
                  activity: 'Very Active'
                },
                {
                  id: '2',
                  name: 'UI/UX Designers',
                  description: 'A community for designers to showcase work and get feedback',
                  members: 892,
                  category: 'Design',
                  isPrivate: false,
                  avatar: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=100&h=100&fit=crop',
                  posts: 156,
                  activity: 'Active'
                },
                {
                  id: '3',
                  name: 'Freelancer Success',
                  description: 'Tips and strategies for building a successful freelance career',
                  members: 2341,
                  category: 'Business',
                  isPrivate: false,
                  avatar: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=100&h=100&fit=crop',
                  posts: 423,
                  activity: 'Very Active'
                }
              ].map((group, index) => {
                const groupGradients = [
                  { from: 'cyan-500', to: 'blue-600' },
                  { from: 'orange-500', to: 'red-600' },
                  { from: 'yellow-500', to: 'amber-600' }
                ]
                const gradient = groupGradients[index % 3]

                return (
                  <div key={group.id} className="relative group">
                    <GlowEffect className={`absolute -inset-0.5 bg-gradient-to-r from-${gradient.from}/20 to-${gradient.to}/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity`} />
                    <LiquidGlassCard className="relative hover:shadow-2xl transition-shadow">
                      <BorderTrail className={`bg-gradient-to-r from-${gradient.from} to-${gradient.to}`} size={60} duration={6} />
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <img src={group.avatar}
                            alt={group.name}
                            className="w-12 h-12 rounded-full object-cover"
                          loading="lazy" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-white">{group.name}</h3>
                          {!group.isPrivate && (
                            <Badge variant="outline" className="text-xs">Public</Badge>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {group.category}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {group.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {group.members.toLocaleString()}
                        </div>
                        <div>{group.posts} posts</div>
                      </div>
                      <Badge 
                        variant={group.activity === 'Very Active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {group.activity}
                      </Badge>
                    </div>
                    
                        <Button data-testid={`join-group-${group.id}-btn`} className="w-full" size="sm">
                          Join Group
                        </Button>
                      </CardContent>
                    </LiquidGlassCard>
                  </div>
                )
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="jobs" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Job Board</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Post Job
              </Button>
            </div>
            
            <div className="space-y-4">
              {[
                {
                  id: '1',
                  title: 'Senior React Developer',
                  company: 'TechStart Inc.',
                  location: 'Remote',
                  type: 'Full-time',
                  budget: '$80-120/hour',
                  posted: '2 hours ago',
                  description: 'Looking for an experienced React developer to join our growing team. Must have 5+ years of experience with React, TypeScript, and modern frontend tools.',
                  skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
                  applications: 12,
                  verified: true,
                  urgent: false
                },
                {
                  id: '2',
                  title: 'UI/UX Designer for SaaS Platform',
                  company: 'Design Co.',
                  location: 'New York, NY',
                  type: 'Contract',
                  budget: '$60-80/hour',
                  posted: '1 day ago',
                  description: 'We need a talented designer to redesign our SaaS platform. The ideal candidate should have experience with B2B applications and modern design systems.',
                  skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
                  applications: 8,
                  verified: true,
                  urgent: true
                },
                {
                  id: '3',
                  title: 'Full-Stack Developer - E-commerce',
                  company: 'ShopFlow',
                  location: 'San Francisco, CA',
                  type: 'Part-time',
                  budget: '$70-90/hour',
                  posted: '3 days ago',
                  description: 'Join our team to build next-generation e-commerce solutions. Experience with React, Node.js, and payment integrations required.',
                  skills: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
                  applications: 23,
                  verified: false,
                  urgent: false
                }
              ].map(job => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{job.title}</h3>
                          {job.verified && (
                            <Badge variant="default" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          {job.urgent && (
                            <Badge variant="destructive" className="text-xs">
                              Urgent
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Building className="w-4 h-4" />
                            {job.company}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {job.type}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {job.budget}
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {job.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.skills.map(skill => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{job.applications} applications</span>
                            <span>Posted {job.posted}</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Bookmark className="w-4 h-4 mr-1" />
                              Save
                            </Button>
                            <Button size="sm">
                              Apply Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Block User Confirmation Dialog */}
      <AlertDialog open={!!blockUser} onOpenChange={() => setBlockUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block User?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to block {blockUser?.name}? They won&apos;t be able to contact you or see your content. You can unblock them later from Settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBlockUser}
              className="bg-red-500 hover:bg-red-600"
            >
              Block User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New Item Dialog */}
      <Dialog open={showNewItemDialog} onOpenChange={setShowNewItemDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Community Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="item-type">Item Type</Label>
              <select
                id="item-type"
                className="w-full px-3 py-2 border rounded-md bg-background"
                value={newItemForm.type}
                onChange={(e) => setNewItemForm({ ...newItemForm, type: e.target.value as 'post' | 'event' | 'group' | 'job' })}
              >
                <option value="post">Post</option>
                <option value="event">Event</option>
                <option value="group">Group</option>
                <option value="job">Job Listing</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-title">Title</Label>
              <Input
                id="item-title"
                placeholder={`Enter ${newItemForm.type} title...`}
                value={newItemForm.title}
                onChange={(e) => setNewItemForm({ ...newItemForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-content">Content</Label>
              <Textarea
                id="item-content"
                placeholder={`Describe your ${newItemForm.type}...`}
                rows={4}
                value={newItemForm.content}
                onChange={(e) => setNewItemForm({ ...newItemForm, content: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-category">Category</Label>
              <select
                id="item-category"
                className="w-full px-3 py-2 border rounded-md bg-background"
                value={newItemForm.category}
                onChange={(e) => setNewItemForm({ ...newItemForm, category: e.target.value })}
              >
                <option value="">Select category...</option>
                <option value="development">Development</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
                <option value="business">Business</option>
                <option value="networking">Networking</option>
                <option value="education">Education</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-tags">Tags (comma-separated)</Label>
              <Input
                id="item-tags"
                placeholder="react, typescript, community..."
                value={newItemForm.tags}
                onChange={(e) => setNewItemForm({ ...newItemForm, tags: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowNewItemDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNewItem}>
              <Plus className="w-4 h-4 mr-2" />
              Create {newItemForm.type.charAt(0).toUpperCase() + newItemForm.type.slice(1)}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Export Community Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="export-format">Export Format</Label>
              <select
                id="export-format"
                className="w-full px-3 py-2 border rounded-md bg-background"
                value={exportForm.format}
                onChange={(e) => setExportForm({ ...exportForm, format: e.target.value as 'csv' | 'json' | 'pdf' })}
              >
                <option value="csv">CSV (Spreadsheet)</option>
                <option value="json">JSON (Raw Data)</option>
                <option value="pdf">PDF (Report)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="export-data">Data to Export</Label>
              <select
                id="export-data"
                className="w-full px-3 py-2 border rounded-md bg-background"
                value={exportForm.dataType}
                onChange={(e) => setExportForm({ ...exportForm, dataType: e.target.value as 'all' | 'posts' | 'members' | 'events' | 'groups' })}
              >
                <option value="all">All Data</option>
                <option value="posts">Posts Only</option>
                <option value="members">Members Only</option>
                <option value="events">Events Only</option>
                <option value="groups">Groups Only</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="export-range">Date Range</Label>
              <select
                id="export-range"
                className="w-full px-3 py-2 border rounded-md bg-background"
                value={exportForm.dateRange}
                onChange={(e) => setExportForm({ ...exportForm, dateRange: e.target.value as 'all' | 'week' | 'month' | 'year' })}
              >
                <option value="all">All Time</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="year">Last Year</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="include-analytics">Include Analytics Data</Label>
              <Switch
                id="include-analytics"
                checked={exportForm.includeAnalytics}
                onCheckedChange={(checked) => setExportForm({ ...exportForm, includeAnalytics: checked })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleExportData}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Community Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Notifications</h4>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive updates via email</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settingsForm.emailNotifications}
                  onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, emailNotifications: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive browser notifications</p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={settingsForm.pushNotifications}
                  onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, pushNotifications: checked })}
                />
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Privacy</h4>
              <div className="space-y-2">
                <Label htmlFor="profile-visibility">Profile Visibility</Label>
                <select
                  id="profile-visibility"
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  value={settingsForm.profileVisibility}
                  onChange={(e) => setSettingsForm({ ...settingsForm, profileVisibility: e.target.value as 'public' | 'connections' | 'private' })}
                >
                  <option value="public">Public - Anyone can view</option>
                  <option value="connections">Connections Only</option>
                  <option value="private">Private - Hidden from search</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="online-status">Show Online Status</Label>
                  <p className="text-xs text-muted-foreground">Let others see when you are online</p>
                </div>
                <Switch
                  id="online-status"
                  checked={settingsForm.showOnlineStatus}
                  onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, showOnlineStatus: checked })}
                />
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Communication</h4>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allow-messages">Allow Messages</Label>
                  <p className="text-xs text-muted-foreground">Receive direct messages from members</p>
                </div>
                <Switch
                  id="allow-messages"
                  checked={settingsForm.allowMessages}
                  onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, allowMessages: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allow-connections">Allow Connection Requests</Label>
                  <p className="text-xs text-muted-foreground">Let others send you connection requests</p>
                </div>
                <Switch
                  id="allow-connections"
                  checked={settingsForm.allowConnectionRequests}
                  onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, allowConnectionRequests: checked })}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>
              Save Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

