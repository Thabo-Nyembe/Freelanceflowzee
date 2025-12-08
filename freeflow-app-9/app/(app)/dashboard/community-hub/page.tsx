'use client'

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { NumberFlow } from '@/components/ui/number-flow'
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

// A+++ UTILITIES
import { DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { useCurrentUser } from '@/hooks/use-ai-data'

// SUPABASE INTEGRATION
import {
  getMembers,
  getMemberByUserId,
  createMember,
  updateMember,
  getPosts,
  createPost,
  updatePost,
  deletePost,
  togglePostLike,
  getComments,
  addComment,
  deleteComment,
  getGroups,
  createGroup,
  joinGroup,
  leaveGroup,
  getEvents,
  createEvent,
  rsvpEvent,
  sendConnectionRequest,
  acceptConnectionRequest,
  getConnections,
  getCommunityStats,
  type CommunityMember as DBMember,
  type CommunityPost as DBPost,
  type CommunityGroup as DBGroup,
  type CommunityEvent as DBEvent,
  type PostType,
  type PostVisibility,
  type MemberCategory,
  type MemberAvailability,
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

export default function CommunityHubPage() {
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  const [state, dispatch] = useReducer(communityReducer, initialState)
  const [activeTab, setActiveTab] = useState<string>('feed')
  const [blockUser, setBlockUser] = useState<{ id: string; name: string } | null>(null)

  // Handlers
  const handleLikePost = async (id: string) => {
    const post = state.posts.find(p => p.id === id)

    logger.info('Liking post', {
      postId: id,
      authorId: post?.authorId,
      type: post?.type,
      currentLikes: post?.likes
    })

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
        logger.info('Post liked successfully', {
          postId: id,
          newLikeCount: (post?.likes || 0) + 1,
          hasAchievement: !!result.achievement
        })

        // Show achievement for Social Butterfly (+5 points, 10% chance)
        if (result.achievement) {
          toast.success(`${result.message} ${result.achievement.message} +${result.achievement.points} points!`, {
            description: `${post?.type} post - ${(post?.likes || 0) + 1} likes - Badge: ${result.achievement.badge}`
          })
        } else {
          toast.success(result.message, {
            description: `${post?.type} post - ${(post?.likes || 0) + 1} likes - ${post?.comments || 0} comments`
          })
        }
      }
    } catch (error: any) {
      logger.error('Failed to like post', {
        error: error.message,
        postId: id
      })
      toast.error('Failed to like post', {
        description: error.message || 'Please try again later'
      })
    }
  }
  const handleCommentOnPost = (id: string) => {
    const post = state.posts.find(p => p.id === id)

    logger.info('Opening comment dialog', {
      postId: id,
      postType: post?.type,
      currentComments: post?.comments
    })

    toast.info('Add comment', {
      description: `${post?.type} post - ${post?.comments || 0} comments - ${post?.likes || 0} likes`
    })
  }

  const handleSharePost = async (id: string) => {
    const post = state.posts.find(p => p.id === id)

    logger.info('Sharing post', {
      postId: id,
      postType: post?.type,
      currentShares: post?.shares
    })

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
        logger.info('Post shared successfully', {
          postId: id,
          shareUrl: result.shareUrl,
          newShareCount: (post?.shares || 0) + 1
        })

        toast.success(result.message, {
          description: `${post?.type} post - ${(post?.shares || 0) + 1} shares - Link: ${result.shareUrl || 'Generated'}`
        })
      }
    } catch (error: any) {
      logger.error('Failed to share post', {
        error: error.message,
        postId: id
      })
      toast.error('Failed to share post', {
        description: error.message || 'Please try again later'
      })
    }
  }

  const handleBookmarkPost = async (id: string) => {
    const post = state.posts.find(p => p.id === id)

    logger.info('Bookmarking post', {
      postId: id,
      postType: post?.type,
      currentBookmarks: post?.bookmarks
    })

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
        logger.info('Post bookmarked successfully', {
          postId: id,
          newBookmarkCount: (post?.bookmarks || 0) + 1
        })

        toast.success(result.message, {
          description: `${post?.type} post - ${(post?.bookmarks || 0) + 1} bookmarks - ${result.tip || 'Saved for later'}`
        })
      }
    } catch (error: any) {
      logger.error('Failed to bookmark post', {
        error: error.message,
        postId: id
      })
      toast.error('Failed to bookmark post', {
        description: error.message || 'Please try again later'
      })
    }
  }
  const handleFollowMember = async (id: string) => {
    const member = state.members.find(m => m.id === id)

    logger.info('Following member', {
      memberId: id,
      memberName: member?.name,
      memberCategory: member?.category,
      currentFollowers: member?.followers
    })

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
        logger.info('Member followed successfully', {
          memberId: id,
          memberName: member?.name,
          newFollowerCount: (member?.followers || 0) + 1,
          hasAchievement: !!result.achievement
        })

        // Show achievement for Networker (+10 points, 20% chance)
        if (result.achievement) {
          toast.success(`${result.message} ${result.achievement.message} +${result.achievement.points} points!`, {
            description: `${member?.name} - ${member?.title} - ${(member?.followers || 0) + 1} followers - Badge: ${result.achievement.badge}`
          })
        } else {
          toast.success(result.message, {
            description: `${member?.name} - ${member?.title} - ${(member?.followers || 0) + 1} followers - ${member?.category}`
          })
        }
      }
    } catch (error: any) {
      logger.error('Failed to follow member', {
        error: error.message,
        memberId: id
      })
      toast.error('Failed to follow member', {
        description: error.message || 'Please try again later'
      })
    }
  }

  const handleUnfollowMember = (id: string) => {
    const member = state.members.find(m => m.id === id)

    logger.info('Unfollowing member', {
      memberId: id,
      memberName: member?.name,
      currentFollowers: member?.followers
    })

    toast.success('Unfollowed', {
      description: `${member?.name} - ${member?.title} - ${(member?.followers || 0) - 1} followers remaining`
    })
  }

  const handleConnectWithMember = async (id: string) => {
    const member = state.members.find(m => m.id === id)

    logger.info('Connecting with member', {
      memberId: id,
      memberName: member?.name,
      memberCategory: member?.category
    })

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
        logger.info('Connected with member successfully', {
          memberId: id,
          memberName: member?.name,
          hasNextSteps: !!(result.nextSteps && result.nextSteps.length > 0)
        })

        // Show next steps if available
        if (result.nextSteps && result.nextSteps.length > 0) {
          logger.debug('Connection next steps', {
            steps: result.nextSteps
          })

          toast.success(result.message, {
            description: `${member?.name} - ${member?.title} - Next: ${result.nextSteps.slice(0, 2).join(', ')}`
          })
        } else {
          toast.success(result.message, {
            description: `${member?.name} - ${member?.title} - ${member?.category} - Now connected`
          })
        }
      }
    } catch (error: any) {
      logger.error('Failed to connect with member', {
        error: error.message,
        memberId: id
      })
      toast.error('Failed to connect with member', {
        description: error.message || 'Please try again later'
      })
    }
  }
  const handleMessageMember = (id: string) => {
    const member = state.members.find(m => m.id === id)

    logger.info('Opening chat with member', {
      memberId: id,
      memberName: member?.name,
      isOnline: member?.isOnline
    })

    toast.info('Opening chat...', {
      description: `${member?.name} - ${member?.title} - ${member?.isOnline ? 'Online' : `Last seen: ${member?.lastSeen}`}`
    })
  }

  const handleJoinEvent = (id: string) => {
    const event = state.events.find(e => e.id === id)

    logger.info('Joining event', {
      eventId: id,
      eventTitle: event?.title,
      eventDate: event?.date,
      currentAttendees: event?.attendees?.length
    })

    toast.success('Registered for event!', {
      description: `${event?.title} - ${event?.date} - ${event?.location} - ${(event?.attendees?.length || 0) + 1} attendees`
    })
  }

  const handleCreateEvent = () => {
    logger.info('Opening event creation form')

    toast.info('Create community event', {
      description: 'Online, offline, or hybrid - Set date, location, and attendee limit'
    })
  }

  const handleJoinGroup = (id: string) => {
    const group = state.groups.find(g => g.id === id)

    logger.info('Joining group', {
      groupId: id,
      groupName: group?.name,
      currentMembers: group?.members?.length
    })

    toast.success('Joined group!', {
      description: `${group?.name} - ${group?.category} - ${(group?.members?.length || 0) + 1} members - ${group?.posts} posts`
    })
  }

  const handleCreateGroup = () => {
    logger.info('Opening group creation form')

    toast.info('Create new group', {
      description: 'Public, private, or secret - Set category, rules, and member permissions'
    })
  }

  const handlePostJob = () => {
    logger.info('Opening job posting form')

    toast.info('Post job opportunity', {
      description: 'Fixed or hourly - Set budget, deadline, and required skills'
    })
  }

  const handleApplyToJob = (id: string) => {
    const post = state.posts.find(p => p.id === id)
    const job = post?.job

    logger.info('Applying to job', {
      jobId: id,
      jobTitle: job?.title,
      budget: job?.budget,
      deadline: job?.deadline
    })

    toast.success('Application submitted!', {
      description: `${job?.title} - ${job?.currency}${job?.budget} - Deadline: ${job?.deadline} - ${(job?.applicants || 0) + 1} applicants`
    })
  }

  const handleSearchMembers = (query: string) => {
    logger.info('Searching members', {
      query,
      totalMembers: state.members.length
    })

    const results = state.members.filter(m =>
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.title.toLowerCase().includes(query.toLowerCase()) ||
      m.skills.some(s => s.toLowerCase().includes(query.toLowerCase()))
    )

    logger.debug('Search results', {
      query,
      resultCount: results.length
    })

    toast.info(`Searching: ${query}`, {
      description: `${results.length} members found - ${results.filter(m => m.isOnline).length} online`
    })
  }
  const handleFilterBySkill = (skill: string) => {
    logger.info('Filtering by skill', { skill })

    const matchingMembers = state.members.filter(m => m.skills.includes(skill))

    logger.debug('Skill filter results', {
      skill,
      resultCount: matchingMembers.length
    })

    toast.info(`Filter by: ${skill}`, {
      description: `${matchingMembers.length} members - ${matchingMembers.filter(m => m.availability === 'available').length} available`
    })
  }

  const handleViewProfile = (id: string) => {
    const member = state.members.find(m => m.id === id)

    logger.info('Viewing profile', {
      memberId: id,
      memberName: member?.name,
      category: member?.category
    })

    toast.info('Viewing profile', {
      description: `${member?.name} - ${member?.title} - ${member?.rating}★ rating - ${member?.totalProjects} projects completed`
    })
  }

  const handleEditProfile = () => {
    logger.info('Opening profile editor')

    toast.info('Edit your profile', {
      description: 'Update skills, bio, portfolio, rates, and availability'
    })
  }

  const handleSendEndorsement = (id: string) => {
    const member = state.members.find(m => m.id === id)

    logger.info('Sending endorsement', {
      memberId: id,
      memberName: member?.name,
      currentEndorsements: member?.endorsements
    })

    toast.success('Endorsement sent!', {
      description: `${member?.name} - ${member?.title} - ${(member?.endorsements || 0) + 1} endorsements - ${member?.rating}★ rating`
    })
  }

  const handleReportContent = (id: string) => {
    logger.warn('Reporting content', {
      contentId: id,
      reportedBy: 'user-1'
    })

    toast.success('Content reported', {
      description: 'Our team will review this content within 24 hours - Thank you for keeping the community safe'
    })
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

    logger.info('User blocked', {
      userId: blockUser.id,
      userName: blockUser.name
    })

    toast.success('User blocked', {
      description: `${blockUser.name} - Blocked successfully - You can unblock from Settings`
    })
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
      if (!userId) {
        logger.info('Waiting for user authentication')
        dispatch({ type: 'SET_LOADING', payload: false })
        return
      }

      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        logger.info('Loading Community Hub data from Supabase', { userId })

        // Fetch all community data in parallel
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

        logger.info('Community Hub data loaded successfully', {
          members: transformedMembers.length,
          posts: transformedPosts.length,
          events: transformedEvents.length,
          groups: transformedGroups.length,
          stats: statsResult.data,
          userId
        })

        if (transformedMembers.length > 0 || transformedPosts.length > 0 || transformedEvents.length > 0 || transformedGroups.length > 0) {
          toast.success('Community Hub loaded', {
            description: `${transformedMembers.length} members • ${transformedPosts.length} posts • ${transformedEvents.length} events • ${transformedGroups.length} groups`
          })
          announce('Community Hub loaded successfully', 'polite')
        }
      } catch (error: any) {
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

  const handleCreatePost = () => {
    if (state.newPost.content) {
      const newPost: CommunityPost = {
        id: Date.now().toString(),
        authorId: state.currentUser?.id || '',
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
                      <img 
                        src={media.thumbnail || media.url} 
                        alt={media.caption || 'Post media'} 
                        className="w-full h-48 object-cover"
                      />
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
                    <Select value={state.postType} onValueChange={(value) => dispatch({ type: 'SET_POST_TYPE', payload: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text Post</SelectItem>
                        <SelectItem value="image">Image Post</SelectItem>
                        <SelectItem value="video">Video Post</SelectItem>
                        <SelectItem value="link">Link Post</SelectItem>
                        <SelectItem value="poll">Poll</SelectItem>
                        <SelectItem value="job">Job Posting</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="showcase">Project Showcase</SelectItem>
                      </SelectContent>
                    </Select>
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
                <Select value={state.feedFilter} onValueChange={(value) => dispatch({ type: 'SET_FEED_FILTER', payload: value })}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Posts</SelectItem>
                    <SelectItem value="connections">Connections</SelectItem>
                    <SelectItem value="groups">Groups</SelectItem>
                    <SelectItem value="jobs">Jobs</SelectItem>
                    <SelectItem value="events">Events</SelectItem>
                    <SelectItem value="showcase">Showcase</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={state.sortBy} onValueChange={(value) => dispatch({ type: 'SET_SORT_BY', payload: value })}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="popular">Popular</SelectItem>
                    <SelectItem value="relevance">Relevance</SelectItem>
                  </SelectContent>
                </Select>
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
                <Select value={state.filterBy} onValueChange={(value) => dispatch({ type: 'SET_FILTER_BY', payload: value })}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Members</SelectItem>
                    <SelectItem value="freelancers">Freelancers</SelectItem>
                    <SelectItem value="clients">Clients</SelectItem>
                    <SelectItem value="agencies">Agencies</SelectItem>
                    <SelectItem value="students">Students</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={state.sortBy} onValueChange={(value) => dispatch({ type: 'SET_SORT_BY', payload: value })}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="popular">Popular</SelectItem>
                  </SelectContent>
                </Select>
                
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
                  
                  <Select value={state.availabilityFilter} onValueChange={(value) => dispatch({ type: 'SET_AVAILABILITY_FILTER', payload: value })}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Availability</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="busy">Busy</SelectItem>
                      <SelectItem value="away">Away</SelectItem>
                    </SelectContent>
                  </Select>
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
                        <img src={event.image} alt={event.title} className="w-full h-32 object-cover rounded-t-lg" />
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
                          <img
                            src={group.avatar}
                            alt={group.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
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
    </div>
  )
}

