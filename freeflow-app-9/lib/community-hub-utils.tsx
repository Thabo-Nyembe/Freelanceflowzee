/**
 * < COMMUNITY HUB UTILITIES
 * Comprehensive utilities for community platform and social networking
 */

import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('Community-Hub-Utils')

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

export type PostType = 'text' | 'image' | 'video' | 'link' | 'poll' | 'event' | 'job' | 'showcase'
export type PostVisibility = 'public' | 'connections' | 'private'
export type MemberCategory = 'freelancer' | 'client' | 'agency' | 'student'
export type MemberAvailability = 'available' | 'busy' | 'away' | 'offline'
export type GroupType = 'public' | 'private' | 'secret'
export type EventType = 'online' | 'offline' | 'hybrid'

export interface CommunityMember {
  id: string
  name: string
  avatar?: string
  title: string
  location: string
  skills: string[]
  rating: number
  isOnline: boolean
  bio: string
  joinDate: Date
  totalProjects: number
  totalEarnings: number
  completionRate: number
  responseTime: string
  languages: string[]
  certifications: string[]
  portfolioUrl?: string
  isConnected: boolean
  isPremium: boolean
  isVerified: boolean
  isFollowing: boolean
  followers: number
  following: number
  posts: number
  category: MemberCategory
  availability: MemberAvailability
  hourlyRate?: number
  currency: string
  timezone: string
  lastSeen: Date
  badges: string[]
  achievements: string[]
  endorsements: number
  testimonials: number
}

export interface CommunityPost {
  id: string
  authorId: string
  authorName: string
  authorAvatar: string
  content: string
  type: PostType
  visibility: PostVisibility
  createdAt: Date
  updatedAt: Date
  likes: number
  comments: number
  shares: number
  bookmarks: number
  views: number
  isLiked: boolean
  isBookmarked: boolean
  tags: string[]
  hashtags: string[]
  mentions: string[]
  isPinned: boolean
  isPromoted: boolean
}

export interface CommunityGroup {
  id: string
  name: string
  description: string
  avatar?: string
  coverImage?: string
  category: string
  type: GroupType
  memberCount: number
  adminCount: number
  posts: number
  createdAt: Date
  isJoined: boolean
  isPending: boolean
  isVerified: boolean
  isPremium: boolean
  rating: number
  tags: string[]
}

export interface CommunityEvent {
  id: string
  organizerId: string
  title: string
  description: string
  category: string
  type: EventType
  date: Date
  location: string
  maxAttendees?: number
  price?: number
  currency: string
  tags: string[]
  attendeeCount: number
  interestedCount: number
  isAttending: boolean
  isInterested: boolean
  views: number
  shares: number
}

// ============================================================================
// MOCK DATA - 50 Community Members
// ============================================================================

const names = [
  'Sarah Johnson', 'Michael Chen', 'Emma Davis', 'Alex Kumar', 'Maria Garcia',
  'James Wilson', 'Sophia Lee', 'Daniel Martinez', 'Olivia Brown', 'David Rodriguez'
]

const titles = [
  'Full Stack Developer', 'UI/UX Designer', 'Product Manager', 'Data Scientist',
  'Marketing Manager', 'Content Writer', 'Graphic Designer', 'Business Analyst',
  'DevOps Engineer', 'Project Manager'
]

const skills = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Design',
  'Marketing', 'Writing', 'Analytics', 'Management'
]

export const mockCommunityMembers: CommunityMember[] = Array.from({ length: 50 }, (_, i) => {
  const categories: MemberCategory[] = ['freelancer', 'client', 'agency', 'student']
  const availabilities: MemberAvailability[] = ['available', 'busy', 'away', 'offline']

  const joinDate = new Date()
  joinDate.setDate(joinDate.getDate() - Math.floor(Math.random() * 365))

  return {
    id: `member_${String(i + 1).padStart(4, '0')}`,
    name: names[i % names.length],
    avatar: `https://i.pravatar.cc/150?img=${i + 1}`,
    title: titles[i % titles.length],
    location: 'New York, USA',
    skills: skills.slice(0, Math.floor(Math.random() * 5) + 2),
    rating: 4 + Math.random(),
    isOnline: Math.random() > 0.5,
    bio: 'Passionate professional with years of experience',
    joinDate,
    totalProjects: Math.floor(Math.random() * 100),
    totalEarnings: Math.floor(Math.random() * 50000),
    completionRate: 90 + Math.floor(Math.random() * 10),
    responseTime: '< 2 hours',
    languages: ['English', 'Spanish'],
    certifications: ['AWS Certified', 'Google Cloud'],
    isConnected: Math.random() > 0.7,
    isPremium: Math.random() > 0.8,
    isVerified: Math.random() > 0.6,
    isFollowing: Math.random() > 0.7,
    followers: Math.floor(Math.random() * 5000),
    following: Math.floor(Math.random() * 1000),
    posts: Math.floor(Math.random() * 200),
    category: categories[i % categories.length],
    availability: availabilities[Math.floor(Math.random() * availabilities.length)],
    hourlyRate: 50 + Math.floor(Math.random() * 150),
    currency: 'USD',
    timezone: 'America/New_York',
    lastSeen: new Date(),
    badges: ['Top Rated', 'Rising Talent'],
    achievements: ['100 Projects', '5-Star Reviews'],
    endorsements: Math.floor(Math.random() * 50),
    testimonials: Math.floor(Math.random() * 30)
  }
})

// ============================================================================
// MOCK DATA - 100 Community Posts
// ============================================================================

export const mockCommunityPosts: CommunityPost[] = Array.from({ length: 100 }, (_, i) => {
  const types: PostType[] = ['text', 'image', 'video', 'link', 'poll', 'showcase']
  const visibilities: PostVisibility[] = ['public', 'connections', 'private']

  const createdDate = new Date()
  createdDate.setHours(createdDate.getHours() - i * 2)

  const member = mockCommunityMembers[i % mockCommunityMembers.length]

  return {
    id: `post_${String(i + 1).padStart(4, '0')}`,
    authorId: member.id,
    authorName: member.name,
    authorAvatar: member.avatar || '',
    content: `This is a community post. Sharing insights and updates with the community!`,
    type: types[i % types.length],
    visibility: visibilities[i % visibilities.length],
    createdAt: createdDate,
    updatedAt: createdDate,
    likes: Math.floor(Math.random() * 500),
    comments: Math.floor(Math.random() * 100),
    shares: Math.floor(Math.random() * 50),
    bookmarks: Math.floor(Math.random() * 30),
    views: Math.floor(Math.random() * 2000),
    isLiked: Math.random() > 0.7,
    isBookmarked: Math.random() > 0.8,
    tags: ['community', 'networking', 'freelance'].slice(0, Math.floor(Math.random() * 3) + 1),
    hashtags: ['#freelance', '#community', '#tech'],
    mentions: [],
    isPinned: Math.random() > 0.95,
    isPromoted: Math.random() > 0.9
  }
})

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function formatDate(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return date.toLocaleDateString()
}

export function getMembersByCategory(members: CommunityMember[], category: MemberCategory): CommunityMember[] {
  logger.debug('Filtering members by category', { category, totalMembers: members.length })
  return members.filter(m => m.category === category)
}

export function getOnlineMembers(members: CommunityMember[]): CommunityMember[] {
  logger.debug('Getting online members', { totalMembers: members.length })
  return members.filter(m => m.isOnline)
}

export function getVerifiedMembers(members: CommunityMember[]): CommunityMember[] {
  logger.debug('Getting verified members', { totalMembers: members.length })
  return members.filter(m => m.isVerified)
}

export function searchMembers(members: CommunityMember[], searchTerm: string): CommunityMember[] {
  const searchLower = searchTerm.toLowerCase()
  logger.debug('Searching members', { searchTerm, totalMembers: members.length })
  return members.filter(m =>
    m.name.toLowerCase().includes(searchLower) ||
    m.title.toLowerCase().includes(searchLower) ||
    m.skills.some(s => s.toLowerCase().includes(searchLower))
  )
}

export function getPostsByType(posts: CommunityPost[], type: PostType): CommunityPost[] {
  logger.debug('Filtering posts by type', { type, totalPosts: posts.length })
  return posts.filter(p => p.type === type)
}

export function getTrendingPosts(posts: CommunityPost[], limit: number = 10): CommunityPost[] {
  logger.debug('Getting trending posts', { limit, totalPosts: posts.length })
  return [...posts]
    .sort((a, b) => (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares))
    .slice(0, limit)
}

export function calculateCommunityStats(members: CommunityMember[], posts: CommunityPost[]) {
  logger.debug('Calculating community statistics')

  const totalMembers = members.length
  const onlineMembers = members.filter(m => m.isOnline).length
  const verifiedMembers = members.filter(m => m.isVerified).length
  const premiumMembers = members.filter(m => m.isPremium).length

  const totalPosts = posts.length
  const postsLast24h = posts.filter(p => {
    const diffHours = (Date.now() - p.createdAt.getTime()) / 3600000
    return diffHours < 24
  }).length

  const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0)
  const totalComments = posts.reduce((sum, p) => sum + p.comments, 0)
  const totalShares = posts.reduce((sum, p) => sum + p.shares, 0)

  const stats = {
    totalMembers,
    onlineMembers,
    verifiedMembers,
    premiumMembers,
    totalPosts,
    postsLast24h,
    totalLikes,
    totalComments,
    totalShares,
    engagementRate: totalPosts > 0 ? Math.round((totalLikes + totalComments) / totalPosts) : 0
  }

  logger.info('Community statistics calculated', stats)
  return stats
}

logger.info('Community Hub utilities initialized', {
  mockMembers: mockCommunityMembers.length,
  mockPosts: mockCommunityPosts.length
})
