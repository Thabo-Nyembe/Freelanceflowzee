'use client'

import React, { useState, useReducer, useEffect, useMemo } from 'react'
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
  List
} from 'lucide-react'

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
  const [state, dispatch] = useReducer(communityReducer, initialState)
  const [activeTab, setActiveTab] = useState('feed')

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
      dispatch({ type: 'SET_LOADING', payload: true })
      
      setTimeout(() => {
        dispatch({ type: 'SET_MEMBERS', payload: memoizedMockMembers })
        dispatch({ type: 'SET_POSTS', payload: memoizedMockPosts })
        dispatch({ type: 'SET_EVENTS', payload: memoizedMockEvents })
        dispatch({ type: 'SET_GROUPS', payload: memoizedMockGroups })
        dispatch({ type: 'SET_CURRENT_USER', payload: memoizedMockMembers[0] })
        dispatch({ type: 'SET_LOADING', payload: false })
      }, 1000)
    }
    
    loadData()
  }, [memoizedMockMembers, memoizedMockPosts, memoizedMockEvents, memoizedMockGroups])

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
      alert('Post created successfully!')
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
        alert(`Opening comments for post ${postId}`)
        break
      case 'report':
        alert(`Reporting post ${postId}`)
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
        alert(`Opening chat with ${memberId}`)
        break
      case 'hire':
        alert(`Hiring ${memberId}`)
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
                size="sm"
                variant={member.isConnected ? "outline" : "default"}
                onClick={() => handleMemberAction(member.isConnected ? 'disconnect' : 'connect', member.id)}
              >
                {member.isConnected ? <UserCheck className="w-4 h-4 mr-1" /> : <UserPlus className="w-4 h-4 mr-1" />}
                {member.isConnected ? 'Connected' : 'Connect'}
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleMemberAction('message', member.id)}
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Message
              </Button>
              
              {member.category === 'freelancer' && (
                <Button
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
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePostAction(post.isLiked ? 'unlike' : 'like', post.id)}
                    className={post.isLiked ? 'text-red-500' : 'text-gray-500'}
                  >
                    <Heart className={`w-4 h-4 mr-1 ${post.isLiked ? 'fill-current' : ''}`} />
                    {post.likes}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePostAction('comment', post.id)}
                    className="text-gray-500"
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    {post.comments}
                  </Button>
                  
                  <Button
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
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePostAction(post.isBookmarked ? 'unbookmark' : 'bookmark', post.id)}
                    className={post.isBookmarked ? 'text-blue-500' : 'text-gray-500'}
                  >
                    <BookmarkPlus className={`w-4 h-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="text-gray-500">
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">Community Hub</h1>
              <Badge className="bg-gradient-to-r from-purple-500 to-violet-600 text-white">KAZI</Badge>
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
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
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
                    <Button variant="outline" onClick={() => dispatch({ type: 'SET_SHOW_CREATE_POST', payload: false })}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreatePost} disabled={!state.newPost.content}>
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
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Events Coming Soon</h3>
                <p className="text-gray-600">Community events and workshops will be available here</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="groups" className="space-y-6">
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Groups Coming Soon</h3>
                <p className="text-gray-600">Community groups and discussions will be available here</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="jobs" className="space-y-6">
            <Card>
              <CardContent className="p-12 text-center">
                <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Job Board Coming Soon</h3>
                <p className="text-gray-600">Find and post freelance opportunities here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

