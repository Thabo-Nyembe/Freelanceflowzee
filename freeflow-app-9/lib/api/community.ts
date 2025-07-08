// Community API service for real data integration
export interface CommunityMember {
  id: string
  name: string
  username: string
  avatar?: string
  bio: string
  location?: string
  skills: string[]
  rating: number
  projects: number
  joined: string
  verified: boolean
  online: boolean
}

export interface Post {
  id: string
  author: CommunityMember
  content: string
  tags: string[]
  likes: number
  comments: number
  shares: number
  bookmarked: boolean
  liked: boolean
  createdAt: string
  type: 'text' | 'project' | 'question' | 'event' | 'job'
  projectData?: {
    title: string
    description: string
    skills: string[]
    budget?: string
  }
  eventData?: {
    title: string
    date: string
    location: string
    attendees: number
  }
}

export interface CommunityEvent {
  id: string
  title: string
  description: string
  date: string
  location: string
  type: 'workshop' | 'networking' | 'webinar' | 'meetup' | 'conference'
  attendees: number
  organizer: CommunityMember
  price: string
}

class CommunityAPI {
  private baseUrl = '/api/community'

  async getPosts(filters?: {
    search?: string
    type?: string
    limit?: number
    offset?: number
  }): Promise<Post[]> {
    try {
      const params = new URLSearchParams()
      if (filters?.search) params.append('search', filters.search)
      if (filters?.type) params.append('type', filters.type)
      if (filters?.limit) params.append('limit', filters.limit.toString())
      if (filters?.offset) params.append('offset', filters.offset.toString())

      const response = await fetch(`${this.baseUrl}/posts?${params}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch posts:', error)
      // Fallback to mock data
      return this.getMockPosts()
    }
  }

  async createPost(post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments' | 'shares' | 'bookmarked' | 'liked'>): Promise<Post> {
    try {
      const response = await fetch(`${this.baseUrl}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(post),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Failed to create post:', error)
      // Fallback to mock creation
      return {
        ...post,
        id: `post_${Date.now()}`,
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: 0,
        shares: 0,
        bookmarked: false,
        liked: false,
      }
    }
  }

  async toggleLike(postId: string): Promise<{ liked: boolean; likes: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/posts/${postId}/like`, {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Failed to toggle like:', error)
      // Return optimistic update
      return { liked: true, likes: 1 }
    }
  }

  async getMembers(filters?: {
    search?: string
    skills?: string[]
    limit?: number
    offset?: number
  }): Promise<CommunityMember[]> {
    try {
      const params = new URLSearchParams()
      if (filters?.search) params.append('search', filters.search)
      if (filters?.skills) params.append('skills', filters.skills.join(','))
      if (filters?.limit) params.append('limit', filters.limit.toString())
      if (filters?.offset) params.append('offset', filters.offset.toString())

      const response = await fetch(`${this.baseUrl}/members?${params}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch members:', error)
      return this.getMockMembers()
    }
  }

  async connectWithMember(memberId: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/members/${memberId}/connect`, {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Failed to connect with member:', error)
      return { success: false }
    }
  }

  async getEvents(filters?: {
    search?: string
    type?: string
    limit?: number
    offset?: number
  }): Promise<CommunityEvent[]> {
    try {
      const params = new URLSearchParams()
      if (filters?.search) params.append('search', filters.search)
      if (filters?.type) params.append('type', filters.type)
      if (filters?.limit) params.append('limit', filters.limit.toString())
      if (filters?.offset) params.append('offset', filters.offset.toString())

      const response = await fetch(`${this.baseUrl}/events?${params}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch events:', error)
      return this.getMockEvents()
    }
  }

  async createEvent(event: Omit<CommunityEvent, 'id' | 'attendees'>): Promise<CommunityEvent> {
    try {
      const response = await fetch(`${this.baseUrl}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Failed to create event:', error)
      return {
        ...event,
        id: `event_${Date.now()}`,
        attendees: 0,
      }
    }
  }

  // Mock data fallbacks
  private getMockPosts(): Post[] {
    return [
      {
        id: 'post_001',
        author: {
          id: 'member_001',
          name: 'Sarah Johnson',
          username: '@sarahdesigns',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
          bio: 'UI/UX Designer specializing in SaaS products',
          location: 'San Francisco, CA',
          skills: ['UI/UX Design', 'Figma', 'Prototyping'],
          rating: 4.9,
          projects: 47,
          joined: '2023-03-15',
          verified: true,
          online: true
        },
        content: "Just completed a mobile app redesign project! The client saw a 40% increase in user engagement after implementing the new design system.",
        tags: ['design', 'mobile', 'ux', 'success-story'],
        likes: 24,
        comments: 8,
        shares: 3,
        bookmarked: false,
        liked: false,
        createdAt: '2024-02-08T14:30:00Z',
        type: 'project',
        projectData: {
          title: 'FinTech Mobile App Redesign',
          description: 'Complete UI/UX overhaul focusing on user engagement',
          skills: ['UI/UX Design', 'Mobile Design', 'Prototyping'],
          budget: '$5,000 - $8,000'
        }
      }
    ]
  }

  private getMockMembers(): CommunityMember[] {
    return [
      {
        id: 'member_001',
        name: 'Sarah Johnson',
        username: '@sarahdesigns',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        bio: 'UI/UX Designer specializing in SaaS products',
        location: 'San Francisco, CA',
        skills: ['UI/UX Design', 'Figma', 'Prototyping'],
        rating: 4.9,
        projects: 47,
        joined: '2023-03-15',
        verified: true,
        online: true
      }
    ]
  }

  private getMockEvents(): CommunityEvent[] {
    return [
      {
        id: 'event_001',
        title: 'Building Brand Voice in the Digital Age',
        description: 'Learn how to develop a consistent brand voice across all digital platforms',
        date: '2024-02-15T18:00:00Z',
        location: 'Virtual (Zoom)',
        type: 'workshop',
        attendees: 47,
        organizer: {
          id: 'member_001',
          name: 'Sarah Johnson',
          username: '@sarahdesigns',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
          bio: 'UI/UX Designer specializing in SaaS products',
          location: 'San Francisco, CA',
          skills: ['UI/UX Design', 'Figma', 'Prototyping'],
          rating: 4.9,
          projects: 47,
          joined: '2023-03-15',
          verified: true,
          online: true
        },
        price: 'Free'
      }
    ]
  }
}

export const communityAPI = new CommunityAPI()