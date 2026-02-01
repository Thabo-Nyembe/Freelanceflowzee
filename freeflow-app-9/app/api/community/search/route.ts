import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('CommunitySearchAPI')

// Flag to track if we should use database or mock
let useDatabaseQueries = true

// ============================================================================
// TYPES
// ============================================================================

interface SearchFilters {
  query?: string
  type?: 'members' | 'posts' | 'jobs' | 'events' | 'all'
  category?: string
  skills?: string[]
  location?: string
  minRating?: number
  maxRating?: number
  minBudget?: number
  maxBudget?: number
  availability?: string[]
  verified?: boolean
  premium?: boolean
  dateRange?: {
    start?: string
    end?: string
  }
  sortBy?: 'relevance' | 'recent' | 'rating' | 'popularity' | 'budget'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
  tags?: string[]
  languages?: string[]
  timezone?: string
  experienceLevel?: string[]
  memberCategory?: string[]
}

interface SearchResult {
  members: any[]
  posts: any[]
  jobs: any[]
  events: any[]
  totalResults: number
  pagination: {
    page: number
    limit: number
    totalPages: number
    hasMore: boolean
  }
  facets: {
    skills: { value: string; count: number }[]
    locations: { value: string; count: number }[]
    categories: { value: string; count: number }[]
    tags: { value: string; count: number }[]
  }
  suggestions: string[]
}

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

const mockMembers = [
  {
    id: '1',
    name: 'Sarah Johnson',
    title: 'Senior UX Designer',
    avatar: '/avatars/sarah.jpg',
    skills: ['UI/UX', 'Figma', 'Adobe XD', 'User Research'],
    location: 'San Francisco, CA',
    rating: 4.9,
    isOnline: true,
    isVerified: true,
    isPremium: true,
    category: 'freelancer',
    availability: 'available',
    hourlyRate: 85,
    currency: 'USD',
    totalProjects: 127,
    completionRate: 98,
    bio: 'Award-winning UX designer with 10+ years experience',
    languages: ['English', 'Spanish'],
    timezone: 'PST',
    tags: ['Design', 'Prototyping', 'User Testing']
  },
  {
    id: '2',
    name: 'Michael Chen',
    title: 'Full Stack Developer',
    avatar: '/avatars/michael.jpg',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
    location: 'New York, NY',
    rating: 4.8,
    isOnline: true,
    isVerified: true,
    isPremium: false,
    category: 'freelancer',
    availability: 'busy',
    hourlyRate: 95,
    currency: 'USD',
    totalProjects: 89,
    completionRate: 96,
    bio: 'Passionate about building scalable web applications',
    languages: ['English', 'Mandarin'],
    timezone: 'EST',
    tags: ['Web Development', 'API Design', 'DevOps']
  },
  {
    id: '3',
    name: 'Emma Williams',
    title: 'Content Strategist',
    avatar: '/avatars/emma.jpg',
    skills: ['Content Strategy', 'SEO', 'Copywriting', 'Marketing'],
    location: 'London, UK',
    rating: 4.7,
    isOnline: false,
    isVerified: true,
    isPremium: true,
    category: 'freelancer',
    availability: 'available',
    hourlyRate: 65,
    currency: 'GBP',
    totalProjects: 156,
    completionRate: 99,
    bio: 'Helping brands tell their stories effectively',
    languages: ['English', 'French'],
    timezone: 'GMT',
    tags: ['Content', 'Strategy', 'Branding']
  },
  {
    id: '4',
    name: 'TechCorp Solutions',
    title: 'Software Development Agency',
    avatar: '/avatars/techcorp.jpg',
    skills: ['Mobile Apps', 'Web Development', 'Cloud Services', 'AI/ML'],
    location: 'Austin, TX',
    rating: 4.9,
    isOnline: true,
    isVerified: true,
    isPremium: true,
    category: 'agency',
    availability: 'available',
    hourlyRate: 125,
    currency: 'USD',
    totalProjects: 234,
    completionRate: 97,
    bio: 'Award-winning agency specializing in enterprise solutions',
    languages: ['English'],
    timezone: 'CST',
    tags: ['Enterprise', 'Consulting', 'Innovation']
  }
]

const mockJobs = [
  {
    id: 'job1',
    title: 'Senior React Developer Needed',
    description: 'Looking for an experienced React developer to build a modern SaaS dashboard',
    budget: 5000,
    currency: 'USD',
    type: 'fixed',
    skills: ['React', 'TypeScript', 'Node.js'],
    category: 'Web Development',
    experience: 'expert',
    deadline: '2025-02-15',
    status: 'open',
    applicants: 12,
    postedBy: '1',
    location: 'Remote',
    tags: ['React', 'Frontend', 'SaaS']
  },
  {
    id: 'job2',
    title: 'UI/UX Designer for Mobile App',
    description: 'Design a beautiful and intuitive mobile app for fitness tracking',
    budget: 3500,
    currency: 'USD',
    type: 'fixed',
    skills: ['UI/UX', 'Figma', 'Mobile Design'],
    category: 'Design',
    experience: 'intermediate',
    deadline: '2025-02-28',
    status: 'open',
    applicants: 8,
    postedBy: '2',
    location: 'Remote',
    tags: ['Design', 'Mobile', 'Fitness']
  }
]

const mockPosts = [
  {
    id: 'post1',
    authorId: '1',
    type: 'showcase',
    content: 'Just completed a redesign of a fintech app! Check out the before/after.',
    tags: ['Design', 'Fintech', 'UI/UX'],
    createdAt: '2025-01-20T10:00:00Z',
    likes: 145,
    comments: 23,
    shares: 12,
    views: 892
  },
  {
    id: 'post2',
    authorId: '2',
    type: 'text',
    content: 'Tips for optimizing React performance: 1) Use React.memo, 2) Implement code splitting, 3) Lazy load components...',
    tags: ['React', 'Performance', 'Tips'],
    createdAt: '2025-01-19T14:30:00Z',
    likes: 89,
    comments: 15,
    shares: 34,
    views: 567
  }
]

// ============================================================================
// DATABASE SEARCH FUNCTIONS
// ============================================================================

async function searchMembersFromDatabase(filters: SearchFilters, supabase: Awaited<ReturnType<typeof createClient>>) {
  try {
    let query = supabase
      .from('profiles')
      .select('*')
      .limit(filters.limit || 20)
      .order('created_at', { ascending: false })

    if (filters.query) {
      query = query.or(`full_name.ilike.%${filters.query}%,title.ilike.%${filters.query}%,bio.ilike.%${filters.query}%`)
    }

    if (filters.verified !== undefined) {
      query = query.eq('is_verified', filters.verified)
    }

    const { data, error } = await query

    if (error) {
      logger.warn('Database search failed, using mock data', { error: error.message })
      return null
    }

    // Transform to expected format
    return data?.map(profile => ({
      id: profile.id,
      name: profile.full_name || profile.username || 'User',
      title: profile.title || 'Freelancer',
      avatar: profile.avatar_url || '/avatars/default.jpg',
      skills: profile.skills || [],
      location: profile.location || 'Remote',
      rating: profile.rating || 4.5,
      isOnline: false,
      isVerified: profile.is_verified || false,
      isPremium: profile.is_premium || false,
      category: profile.category || 'freelancer',
      availability: profile.availability || 'available',
      hourlyRate: profile.hourly_rate || 50,
      currency: 'USD',
      totalProjects: profile.total_projects || 0,
      completionRate: profile.completion_rate || 95,
      bio: profile.bio || '',
      tags: profile.tags || []
    })) || []
  } catch (error) {
    logger.warn('Database query error', { error })
    return null
  }
}

async function searchJobsFromDatabase(filters: SearchFilters, supabase: Awaited<ReturnType<typeof createClient>>) {
  try {
    let query = supabase
      .from('jobs')
      .select('*')
      .eq('status', 'open')
      .limit(filters.limit || 20)
      .order('created_at', { ascending: false })

    if (filters.query) {
      query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`)
    }

    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    if (filters.minBudget) {
      query = query.gte('budget_min', filters.minBudget)
    }

    if (filters.maxBudget) {
      query = query.lte('budget_max', filters.maxBudget)
    }

    const { data, error } = await query

    if (error) {
      logger.warn('Jobs database search failed', { error: error.message })
      return null
    }

    return data?.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      budget: { min: job.budget_min, max: job.budget_max },
      currency: job.currency || 'USD',
      budgetType: job.budget_type || 'fixed',
      skills: job.required_skills || [],
      category: job.category,
      experience: job.experience_level || 'intermediate',
      deadline: job.deadline,
      status: job.status,
      applicants: job.applicant_count || 0,
      postedBy: job.user_id,
      location: job.location || 'Remote',
      tags: job.tags || []
    })) || []
  } catch (error) {
    logger.warn('Jobs query error', { error })
    return null
  }
}

async function searchPostsFromDatabase(filters: SearchFilters, supabase: Awaited<ReturnType<typeof createClient>>) {
  try {
    let query = supabase
      .from('posts')
      .select('*')
      .limit(filters.limit || 20)
      .order('created_at', { ascending: false })

    if (filters.query) {
      query = query.or(`content.ilike.%${filters.query}%,title.ilike.%${filters.query}%`)
    }

    const { data, error } = await query

    if (error) {
      logger.warn('Posts database search failed', { error: error.message })
      return null
    }

    return data?.map(post => ({
      id: post.id,
      authorId: post.user_id,
      type: post.type || 'text',
      content: post.content,
      tags: post.tags || [],
      createdAt: post.created_at,
      likes: post.like_count || 0,
      comments: post.comment_count || 0,
      shares: post.share_count || 0,
      views: post.view_count || 0
    })) || []
  } catch (error) {
    logger.warn('Posts query error', { error })
    return null
  }
}

// ============================================================================
// MOCK SEARCH LOGIC (FALLBACK)
// ============================================================================

function searchMembers(filters: SearchFilters) {
  let results = [...mockMembers]

  // Text search
  if (filters.query) {
    const query = filters.query.toLowerCase()
    results = results.filter(member =>
      member.name.toLowerCase().includes(query) ||
      member.title.toLowerCase().includes(query) ||
      member.bio.toLowerCase().includes(query) ||
      member.skills.some(skill => skill.toLowerCase().includes(query)) ||
      member.location.toLowerCase().includes(query) ||
      member.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  // Category filter
  if (filters.category && filters.category !== 'all') {
    results = results.filter(member => member.category === filters.category)
  }

  // Skills filter
  if (filters.skills && filters.skills.length > 0) {
    results = results.filter(member =>
      filters.skills!.some(skill =>
        member.skills.some(memberSkill =>
          memberSkill.toLowerCase().includes(skill.toLowerCase())
        )
      )
    )
  }

  // Location filter
  if (filters.location) {
    results = results.filter(member =>
      member.location.toLowerCase().includes(filters.location!.toLowerCase())
    )
  }

  // Rating filter
  if (filters.minRating !== undefined) {
    results = results.filter(member => member.rating >= filters.minRating!)
  }

  // Verified filter
  if (filters.verified !== undefined) {
    results = results.filter(member => member.isVerified === filters.verified)
  }

  // Premium filter
  if (filters.premium !== undefined) {
    results = results.filter(member => member.isPremium === filters.premium)
  }

  // Availability filter
  if (filters.availability && filters.availability.length > 0) {
    results = results.filter(member =>
      filters.availability!.includes(member.availability)
    )
  }

  // Languages filter
  if (filters.languages && filters.languages.length > 0) {
    results = results.filter(member =>
      filters.languages!.some(lang =>
        member.languages.some(memberLang =>
          memberLang.toLowerCase().includes(lang.toLowerCase())
        )
      )
    )
  }

  // Member category filter
  if (filters.memberCategory && filters.memberCategory.length > 0) {
    results = results.filter(member =>
      filters.memberCategory!.includes(member.category)
    )
  }

  // Sorting
  if (filters.sortBy) {
    results.sort((a, b) => {
      let comparison = 0

      switch (filters.sortBy) {
        case 'rating':
          comparison = a.rating - b.rating
          break
        case 'recent':
          comparison = a.totalProjects - b.totalProjects
          break
        case 'popularity':
          comparison = a.totalProjects - b.totalProjects
          break
        default:
          comparison = 0
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison
    })
  }

  return results
}

function searchJobs(filters: SearchFilters) {
  let results = [...mockJobs]

  // Text search
  if (filters.query) {
    const query = filters.query.toLowerCase()
    results = results.filter(job =>
      job.title.toLowerCase().includes(query) ||
      job.description.toLowerCase().includes(query) ||
      job.skills.some(skill => skill.toLowerCase().includes(query)) ||
      job.category.toLowerCase().includes(query) ||
      job.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  // Category filter
  if (filters.category && filters.category !== 'all') {
    results = results.filter(job => job.category === filters.category)
  }

  // Budget filter
  if (filters.minBudget !== undefined) {
    results = results.filter(job => job.budget >= filters.minBudget!)
  }

  if (filters.maxBudget !== undefined) {
    results = results.filter(job => job.budget <= filters.maxBudget!)
  }

  // Skills filter
  if (filters.skills && filters.skills.length > 0) {
    results = results.filter(job =>
      filters.skills!.some(skill =>
        job.skills.some(jobSkill =>
          jobSkill.toLowerCase().includes(skill.toLowerCase())
        )
      )
    )
  }

  // Experience level filter
  if (filters.experienceLevel && filters.experienceLevel.length > 0) {
    results = results.filter(job =>
      filters.experienceLevel!.includes(job.experience)
    )
  }

  // Sorting
  if (filters.sortBy) {
    results.sort((a, b) => {
      let comparison = 0

      switch (filters.sortBy) {
        case 'budget':
          comparison = a.budget - b.budget
          break
        case 'recent':
          comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          break
        case 'popularity':
          comparison = a.applicants - b.applicants
          break
        default:
          comparison = 0
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison
    })
  }

  return results
}

function searchPosts(filters: SearchFilters) {
  let results = [...mockPosts]

  // Text search
  if (filters.query) {
    const query = filters.query.toLowerCase()
    results = results.filter(post =>
      post.content.toLowerCase().includes(query) ||
      post.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  // Tags filter
  if (filters.tags && filters.tags.length > 0) {
    results = results.filter(post =>
      filters.tags!.some(tag =>
        post.tags.some(postTag =>
          postTag.toLowerCase().includes(tag.toLowerCase())
        )
      )
    )
  }

  // Date range filter
  if (filters.dateRange?.start) {
    results = results.filter(post =>
      new Date(post.createdAt) >= new Date(filters.dateRange!.start!)
    )
  }

  if (filters.dateRange?.end) {
    results = results.filter(post =>
      new Date(post.createdAt) <= new Date(filters.dateRange!.end!)
    )
  }

  // Sorting
  if (filters.sortBy) {
    results.sort((a, b) => {
      let comparison = 0

      switch (filters.sortBy) {
        case 'recent':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'popularity':
          comparison = (a.likes + a.comments + a.shares) - (b.likes + b.comments + b.shares)
          break
        default:
          comparison = 0
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison
    })
  }

  return results
}

function generateFacets(members: any[], jobs: any[], posts: any[]) {
  const skillCounts: { [key: string]: number } = {}
  const locationCounts: { [key: string]: number } = {}
  const categoryCounts: { [key: string]: number } = {}
  const tagCounts: { [key: string]: number } = {}

  // Count from members
  members.forEach(member => {
    member.skills.forEach((skill: string) => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1
    })
    locationCounts[member.location] = (locationCounts[member.location] || 0) + 1
    categoryCounts[member.category] = (categoryCounts[member.category] || 0) + 1
    member.tags.forEach((tag: string) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    })
  })

  // Count from jobs
  jobs.forEach(job => {
    job.skills.forEach((skill: string) => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1
    })
    categoryCounts[job.category] = (categoryCounts[job.category] || 0) + 1
  })

  return {
    skills: Object.entries(skillCounts)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20),
    locations: Object.entries(locationCounts)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    categories: Object.entries(categoryCounts)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count),
    tags: Object.entries(tagCounts)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)
  }
}

function generateSuggestions(query: string): string[] {
  const suggestions = [
    'React developer',
    'UI/UX designer',
    'Full stack engineer',
    'Content writer',
    'Mobile app developer',
    'DevOps engineer',
    'Product designer',
    'Data scientist'
  ]

  if (!query) return suggestions.slice(0, 5)

  return suggestions
    .filter(s => s.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5)
}

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const filters: SearchFilters = await request.json()

    logger.info('Community search requested', {
      query: filters.query,
      type: filters.type,
      page: filters.page,
      limit: filters.limit
    })

    // Default values
    const page = filters.page || 1
    const limit = filters.limit || 20
    const type = filters.type || 'all'

    // Try database queries first, fall back to mock data
    let members: any[] = []
    let jobs: any[] = []
    let posts: any[] = []

    if (type === 'members' || type === 'all') {
      const dbMembers = useDatabaseQueries ? await searchMembersFromDatabase(filters, supabase) : null
      members = dbMembers || searchMembers(filters)
      if (!dbMembers && useDatabaseQueries) {
        useDatabaseQueries = false // Disable for subsequent requests if tables don't exist
      }
    }

    if (type === 'jobs' || type === 'all') {
      const dbJobs = useDatabaseQueries ? await searchJobsFromDatabase(filters, supabase) : null
      jobs = dbJobs || searchJobs(filters)
    }

    if (type === 'posts' || type === 'all') {
      const dbPosts = useDatabaseQueries ? await searchPostsFromDatabase(filters, supabase) : null
      posts = dbPosts || searchPosts(filters)
    }

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    const paginatedMembers = members.slice(startIndex, endIndex)
    const paginatedJobs = jobs.slice(startIndex, endIndex)
    const paginatedPosts = posts.slice(startIndex, endIndex)

    // Generate facets
    const facets = generateFacets(members, jobs, posts)

    // Generate suggestions
    const suggestions = generateSuggestions(filters.query || '')

    // Calculate totals
    const totalResults = members.length + jobs.length + posts.length
    const totalPages = Math.ceil(totalResults / limit)

    const result: SearchResult = {
      members: paginatedMembers,
      posts: paginatedPosts,
      jobs: paginatedJobs,
      totalResults,
      pagination: {
        page,
        limit,
        totalPages,
        hasMore: page < totalPages
      },
      facets,
      suggestions
    }

    logger.info('Community search completed', {
      totalResults,
      membersFound: members.length,
      jobsFound: jobs.length,
      postsFound: posts.length
    })

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    logger.error('Community search failed', {
      error: error.message,
      stack: error.stack
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform search',
        message: error.message
      },
      { status: 500 }
    )
  }
}

// GET method for simple searches
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const filters: SearchFilters = {
      query,
      type: type as any,
      page,
      limit
    }

    logger.info('Community search requested (GET)', { query, type, page, limit })

    // Delegate to POST handler logic
    const members = type === 'members' || type === 'all' ? searchMembers(filters) : []
    const jobs = type === 'jobs' || type === 'all' ? searchJobs(filters) : []
    const posts = type === 'posts' || type === 'all' ? searchPosts(filters) : []

    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    const result = {
      members: members.slice(startIndex, endIndex),
      jobs: jobs.slice(startIndex, endIndex),
      posts: posts.slice(startIndex, endIndex),
      totalResults: members.length + jobs.length + posts.length,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil((members.length + jobs.length + posts.length) / limit),
        hasMore: endIndex < (members.length + jobs.length + posts.length)
      }
    }

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    logger.error('Community search failed (GET)', { error: error.message })

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform search'
      },
      { status: 500 }
    )
  }
}
