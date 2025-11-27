/**
 * Community Hub Queries
 *
 * Supabase queries for community networking platform:
 * - Member profiles with skills and ratings
 * - Posts with likes and comments
 * - Groups with membership management
 * - Events with attendees
 * - Connections/networking system
 */

import { createClient } from '@/lib/supabase/client'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('CommunityHub')

// ============================================================================
// TYPES
// ============================================================================

export type PostType = 'text' | 'image' | 'video' | 'link' | 'poll' | 'event' | 'job' | 'showcase'
export type PostVisibility = 'public' | 'connections' | 'private'
export type MemberCategory = 'freelancer' | 'client' | 'agency' | 'student'
export type MemberAvailability = 'available' | 'busy' | 'away' | 'offline'
export type GroupType = 'public' | 'private' | 'secret'
export type EventType = 'online' | 'offline' | 'hybrid'

export interface CommunityMember {
  id: string
  user_id: string
  name: string
  avatar?: string
  title: string
  location: string
  skills: string[]
  rating: number
  is_online: boolean
  bio?: string
  total_projects: number
  total_earnings: number
  completion_rate: number
  response_time?: string
  languages: string[]
  certifications: string[]
  portfolio_url?: string
  is_connected: boolean
  is_premium: boolean
  is_verified: boolean
  is_following: boolean
  followers: number
  following: number
  posts_count: number
  category: MemberCategory
  availability: MemberAvailability
  hourly_rate?: number
  currency: string
  timezone: string
  last_seen: string
  badges: string[]
  achievements: string[]
  endorsements: number
  testimonials: number
  created_at: string
  updated_at: string
}

export interface CommunityPost {
  id: string
  author_id: string
  content: string
  type: PostType
  visibility: PostVisibility
  likes_count: number
  comments_count: number
  shares_count: number
  bookmarks_count: number
  views_count: number
  tags: string[]
  hashtags: string[]
  mentions: string[]
  is_pinned: boolean
  is_promoted: boolean
  is_edited: boolean
  created_at: string
  updated_at: string
}

export interface PostLike {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

export interface Comment {
  id: string
  post_id: string
  author_id: string
  parent_id?: string
  content: string
  likes_count: number
  is_edited: boolean
  created_at: string
  updated_at: string
}

export interface CommunityGroup {
  id: string
  name: string
  description: string
  avatar?: string
  cover_image?: string
  category: string
  type: GroupType
  member_count: number
  admin_count: number
  posts_count: number
  is_verified: boolean
  is_premium: boolean
  rating: number
  tags: string[]
  created_at: string
  updated_at: string
}

export interface GroupMember {
  id: string
  group_id: string
  member_id: string
  role: string
  is_pending: boolean
  joined_at: string
}

export interface CommunityEvent {
  id: string
  organizer_id: string
  title: string
  description: string
  category: string
  type: EventType
  event_date: string
  end_date?: string
  location: string
  max_attendees?: number
  price: number
  currency: string
  tags: string[]
  attendee_count: number
  interested_count: number
  views_count: number
  shares_count: number
  created_at: string
  updated_at: string
}

export interface EventAttendee {
  id: string
  event_id: string
  member_id: string
  is_attending: boolean
  is_interested: boolean
  registered_at: string
}

export interface Connection {
  id: string
  requester_id: string
  recipient_id: string
  status: string
  created_at: string
  accepted_at?: string
}

// ============================================================================
// MEMBER OPERATIONS
// ============================================================================

/**
 * Get all community members with filters
 */
export async function getMembers(
  filters?: {
    category?: MemberCategory
    availability?: MemberAvailability
    is_verified?: boolean
    is_online?: boolean
    skills?: string[]
    search?: string
  }
): Promise<{ data: CommunityMember[] | null; error: any }> {
  const startTime = performance.now()

  try {
    logger.info('Fetching community members', { filters })

    const supabase = createClient()

    let query = supabase
      .from('community_members')
      .select('*')
      .order('rating', { ascending: false })

    // Apply filters
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.availability) {
      query = query.eq('availability', filters.availability)
    }

    if (filters?.is_verified !== undefined) {
      query = query.eq('is_verified', filters.is_verified)
    }

    if (filters?.is_online !== undefined) {
      query = query.eq('is_online', filters.is_online)
    }

    if (filters?.skills && filters.skills.length > 0) {
      query = query.contains('skills', filters.skills)
    }

    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Failed to fetch members', { error: error.message })
      return { data: null, error }
    }

    const duration = performance.now() - startTime

    logger.info('Members fetched successfully', {
      count: data?.length || 0,
      duration
    })

    return { data, error: null }
  } catch (error: any) {
    logger.error('Exception in getMembers', { error: error.message })
    return { data: null, error }
  }
}

/**
 * Get member by ID
 */
export async function getMemberById(
  memberId: string
): Promise<{ data: CommunityMember | null; error: any }> {
  try {
    logger.info('Fetching member by ID', { memberId })

    const supabase = createClient()

    const { data, error } = await supabase
      .from('community_members')
      .select('*')
      .eq('id', memberId)
      .single()

    if (error) {
      logger.error('Failed to fetch member', { error: error.message, memberId })
      return { data: null, error }
    }

    logger.info('Member fetched successfully', { memberId })

    return { data, error: null }
  } catch (error: any) {
    logger.error('Exception in getMemberById', { error: error.message, memberId })
    return { data: null, error }
  }
}

/**
 * Get member by user_id
 */
export async function getMemberByUserId(
  userId: string
): Promise<{ data: CommunityMember | null; error: any }> {
  try {
    logger.info('Fetching member by user ID', { userId })

    const supabase = createClient()

    const { data, error } = await supabase
      .from('community_members')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      logger.error('Failed to fetch member by user ID', { error: error.message, userId })
      return { data: null, error }
    }

    logger.info('Member fetched successfully', { userId })

    return { data, error: null }
  } catch (error: any) {
    logger.error('Exception in getMemberByUserId', { error: error.message, userId })
    return { data: null, error }
  }
}

/**
 * Create member profile
 */
export async function createMember(
  userId: string,
  member: {
    name: string
    title: string
    location: string
    category?: MemberCategory
    avatar?: string
    bio?: string
    skills?: string[]
    languages?: string[]
    hourly_rate?: number
    portfolio_url?: string
  }
): Promise<{ data: CommunityMember | null; error: any }> {
  try {
    logger.info('Creating member profile', { userId, name: member.name })

    const supabase = createClient()

    const { data, error } = await supabase
      .from('community_members')
      .insert({
        user_id: userId,
        name: member.name,
        title: member.title,
        location: member.location,
        category: member.category || 'freelancer',
        avatar: member.avatar,
        bio: member.bio,
        skills: member.skills || [],
        languages: member.languages || [],
        hourly_rate: member.hourly_rate,
        portfolio_url: member.portfolio_url
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create member', { error: error.message, userId })
      return { data: null, error }
    }

    logger.info('Member created successfully', { memberId: data.id, name: member.name })

    return { data, error: null }
  } catch (error: any) {
    logger.error('Exception in createMember', { error: error.message, userId })
    return { data: null, error }
  }
}

/**
 * Update member profile
 */
export async function updateMember(
  memberId: string,
  updates: Partial<CommunityMember>
): Promise<{ data: CommunityMember | null; error: any }> {
  try {
    logger.info('Updating member profile', { memberId, updates })

    const supabase = createClient()

    const { data, error } = await supabase
      .from('community_members')
      .update(updates)
      .eq('id', memberId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update member', { error: error.message, memberId })
      return { data: null, error }
    }

    logger.info('Member updated successfully', { memberId })

    return { data, error: null }
  } catch (error: any) {
    logger.error('Exception in updateMember', { error: error.message, memberId })
    return { data: null, error }
  }
}

// ============================================================================
// POST OPERATIONS
// ============================================================================

/**
 * Get posts with filters
 */
export async function getPosts(
  filters?: {
    author_id?: string
    type?: PostType
    visibility?: PostVisibility
    tags?: string[]
    search?: string
  }
): Promise<{ data: CommunityPost[] | null; error: any }> {
  try {
    logger.info('Fetching posts', { filters })

    const supabase = createClient()

    let query = supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters?.author_id) {
      query = query.eq('author_id', filters.author_id)
    }

    if (filters?.type) {
      query = query.eq('type', filters.type)
    }

    if (filters?.visibility) {
      query = query.eq('visibility', filters.visibility)
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags)
    }

    if (filters?.search) {
      query = query.ilike('content', `%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Failed to fetch posts', { error: error.message })
      return { data: null, error }
    }

    logger.info('Posts fetched successfully', { count: data?.length || 0 })

    return { data, error: null }
  } catch (error: any) {
    logger.error('Exception in getPosts', { error: error.message })
    return { data: null, error }
  }
}

/**
 * Create post
 */
export async function createPost(
  authorId: string,
  post: {
    content: string
    type?: PostType
    visibility?: PostVisibility
    tags?: string[]
    hashtags?: string[]
    mentions?: string[]
  }
): Promise<{ data: CommunityPost | null; error: any }> {
  try {
    logger.info('Creating post', { authorId, type: post.type })

    const supabase = createClient()

    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        author_id: authorId,
        content: post.content,
        type: post.type || 'text',
        visibility: post.visibility || 'public',
        tags: post.tags || [],
        hashtags: post.hashtags || [],
        mentions: post.mentions || []
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create post', { error: error.message, authorId })
      return { data: null, error }
    }

    logger.info('Post created successfully', { postId: data.id })

    return { data, error: null }
  } catch (error: any) {
    logger.error('Exception in createPost', { error: error.message, authorId })
    return { data: null, error }
  }
}

/**
 * Update post
 */
export async function updatePost(
  postId: string,
  updates: Partial<CommunityPost>
): Promise<{ data: CommunityPost | null; error: any }> {
  try {
    logger.info('Updating post', { postId, updates })

    const supabase = createClient()

    const { data, error } = await supabase
      .from('community_posts')
      .update({ ...updates, is_edited: true })
      .eq('id', postId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update post', { error: error.message, postId })
      return { data: null, error }
    }

    logger.info('Post updated successfully', { postId })

    return { data, error: null }
  } catch (error: any) {
    logger.error('Exception in updatePost', { error: error.message, postId })
    return { data: null, error }
  }
}

/**
 * Delete post
 */
export async function deletePost(
  postId: string
): Promise<{ success: boolean; error: any }> {
  try {
    logger.info('Deleting post', { postId })

    const supabase = createClient()

    const { error } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', postId)

    if (error) {
      logger.error('Failed to delete post', { error: error.message, postId })
      return { success: false, error }
    }

    logger.info('Post deleted successfully', { postId })

    return { success: true, error: null }
  } catch (error: any) {
    logger.error('Exception in deletePost', { error: error.message, postId })
    return { success: false, error }
  }
}

/**
 * Like/unlike post (toggle)
 */
export async function togglePostLike(
  postId: string,
  userId: string
): Promise<{ data: PostLike | null; removed: boolean; error: any }> {
  try {
    logger.info('Toggling post like', { postId, userId })

    const supabase = createClient()

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('community_post_likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single()

    if (existingLike) {
      // Remove like
      const { error } = await supabase
        .from('community_post_likes')
        .delete()
        .eq('id', existingLike.id)

      if (error) {
        logger.error('Failed to remove like', { error: error.message })
        return { data: null, removed: false, error }
      }

      logger.info('Like removed', { postId })
      return { data: null, removed: true, error: null }
    } else {
      // Add like
      const { data, error } = await supabase
        .from('community_post_likes')
        .insert({ post_id: postId, user_id: userId })
        .select()
        .single()

      if (error) {
        logger.error('Failed to add like', { error: error.message })
        return { data: null, removed: false, error }
      }

      logger.info('Like added', { postId })
      return { data, removed: false, error: null }
    }
  } catch (error: any) {
    logger.error('Exception in togglePostLike', { error: error.message, postId })
    return { data: null, removed: false, error }
  }
}

// ============================================================================
// COMMENT OPERATIONS
// ============================================================================

/**
 * Get comments for a post
 */
export async function getComments(
  postId: string
): Promise<{ data: Comment[] | null; error: any }> {
  try {
    logger.info('Fetching comments', { postId })

    const supabase = createClient()

    const { data, error } = await supabase
      .from('community_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (error) {
      logger.error('Failed to fetch comments', { error: error.message, postId })
      return { data: null, error }
    }

    logger.info('Comments fetched successfully', { postId, count: data?.length || 0 })

    return { data, error: null }
  } catch (error: any) {
    logger.error('Exception in getComments', { error: error.message, postId })
    return { data: null, error }
  }
}

/**
 * Add comment to post
 */
export async function addComment(
  postId: string,
  authorId: string,
  content: string,
  parentId?: string
): Promise<{ data: Comment | null; error: any }> {
  try {
    logger.info('Adding comment', { postId, authorId, parentId })

    const supabase = createClient()

    const { data, error } = await supabase
      .from('community_comments')
      .insert({
        post_id: postId,
        author_id: authorId,
        content,
        parent_id: parentId
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to add comment', { error: error.message, postId })
      return { data: null, error }
    }

    logger.info('Comment added successfully', { commentId: data.id })

    return { data, error: null }
  } catch (error: any) {
    logger.error('Exception in addComment', { error: error.message, postId })
    return { data: null, error }
  }
}

/**
 * Delete comment
 */
export async function deleteComment(
  commentId: string
): Promise<{ success: boolean; error: any }> {
  try {
    logger.info('Deleting comment', { commentId })

    const supabase = createClient()

    const { error } = await supabase
      .from('community_comments')
      .delete()
      .eq('id', commentId)

    if (error) {
      logger.error('Failed to delete comment', { error: error.message, commentId })
      return { success: false, error }
    }

    logger.info('Comment deleted successfully', { commentId })

    return { success: true, error: null }
  } catch (error: any) {
    logger.error('Exception in deleteComment', { error: error.message, commentId })
    return { success: false, error }
  }
}

// ============================================================================
// GROUP OPERATIONS
// ============================================================================

/**
 * Get groups with filters
 */
export async function getGroups(
  filters?: {
    type?: GroupType
    category?: string
    search?: string
  }
): Promise<{ data: CommunityGroup[] | null; error: any }> {
  try {
    logger.info('Fetching groups', { filters })

    const supabase = createClient()

    let query = supabase
      .from('community_groups')
      .select('*')
      .order('member_count', { ascending: false })

    if (filters?.type) {
      query = query.eq('type', filters.type)
    }

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Failed to fetch groups', { error: error.message })
      return { data: null, error }
    }

    logger.info('Groups fetched successfully', { count: data?.length || 0 })

    return { data, error: null }
  } catch (error: any) {
    logger.error('Exception in getGroups', { error: error.message })
    return { data: null, error }
  }
}

/**
 * Create group
 */
export async function createGroup(
  group: {
    name: string
    description: string
    category: string
    type?: GroupType
    avatar?: string
    cover_image?: string
    tags?: string[]
  }
): Promise<{ data: CommunityGroup | null; error: any }> {
  try {
    logger.info('Creating group', { name: group.name })

    const supabase = createClient()

    const { data, error } = await supabase
      .from('community_groups')
      .insert({
        name: group.name,
        description: group.description,
        category: group.category,
        type: group.type || 'public',
        avatar: group.avatar,
        cover_image: group.cover_image,
        tags: group.tags || []
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create group', { error: error.message })
      return { data: null, error }
    }

    logger.info('Group created successfully', { groupId: data.id })

    return { data, error: null }
  } catch (error: any) {
    logger.error('Exception in createGroup', { error: error.message })
    return { data: null, error }
  }
}

/**
 * Join group
 */
export async function joinGroup(
  groupId: string,
  memberId: string,
  role: string = 'member'
): Promise<{ data: GroupMember | null; error: any }> {
  try {
    logger.info('Joining group', { groupId, memberId })

    const supabase = createClient()

    const { data, error } = await supabase
      .from('community_group_members')
      .insert({
        group_id: groupId,
        member_id: memberId,
        role
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to join group', { error: error.message, groupId })
      return { data: null, error }
    }

    logger.info('Joined group successfully', { groupId, memberId })

    return { data, error: null }
  } catch (error: any) {
    logger.error('Exception in joinGroup', { error: error.message, groupId })
    return { data: null, error }
  }
}

/**
 * Leave group
 */
export async function leaveGroup(
  groupId: string,
  memberId: string
): Promise<{ success: boolean; error: any }> {
  try {
    logger.info('Leaving group', { groupId, memberId })

    const supabase = createClient()

    const { error } = await supabase
      .from('community_group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('member_id', memberId)

    if (error) {
      logger.error('Failed to leave group', { error: error.message, groupId })
      return { success: false, error }
    }

    logger.info('Left group successfully', { groupId, memberId })

    return { success: true, error: null }
  } catch (error: any) {
    logger.error('Exception in leaveGroup', { error: error.message, groupId })
    return { success: false, error }
  }
}

// ============================================================================
// EVENT OPERATIONS
// ============================================================================

/**
 * Get events with filters
 */
export async function getEvents(
  filters?: {
    type?: EventType
    category?: string
    upcoming?: boolean
    search?: string
  }
): Promise<{ data: CommunityEvent[] | null; error: any }> {
  try {
    logger.info('Fetching events', { filters })

    const supabase = createClient()

    let query = supabase
      .from('community_events')
      .select('*')
      .order('event_date', { ascending: true })

    if (filters?.type) {
      query = query.eq('type', filters.type)
    }

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.upcoming) {
      query = query.gte('event_date', new Date().toISOString())
    }

    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Failed to fetch events', { error: error.message })
      return { data: null, error }
    }

    logger.info('Events fetched successfully', { count: data?.length || 0 })

    return { data, error: null }
  } catch (error: any) {
    logger.error('Exception in getEvents', { error: error.message })
    return { data: null, error }
  }
}

/**
 * Create event
 */
export async function createEvent(
  organizerId: string,
  event: {
    title: string
    description: string
    category: string
    type?: EventType
    event_date: string
    end_date?: string
    location: string
    max_attendees?: number
    price?: number
    tags?: string[]
  }
): Promise<{ data: CommunityEvent | null; error: any }> {
  try {
    logger.info('Creating event', { organizerId, title: event.title })

    const supabase = createClient()

    const { data, error } = await supabase
      .from('community_events')
      .insert({
        organizer_id: organizerId,
        title: event.title,
        description: event.description,
        category: event.category,
        type: event.type || 'online',
        event_date: event.event_date,
        end_date: event.end_date,
        location: event.location,
        max_attendees: event.max_attendees,
        price: event.price || 0,
        tags: event.tags || []
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create event', { error: error.message })
      return { data: null, error }
    }

    logger.info('Event created successfully', { eventId: data.id })

    return { data, error: null }
  } catch (error: any) {
    logger.error('Exception in createEvent', { error: error.message })
    return { data: null, error }
  }
}

/**
 * RSVP to event
 */
export async function rsvpEvent(
  eventId: string,
  memberId: string,
  isAttending: boolean = true,
  isInterested: boolean = false
): Promise<{ data: EventAttendee | null; error: any }> {
  try {
    logger.info('RSVP to event', { eventId, memberId, isAttending })

    const supabase = createClient()

    const { data, error } = await supabase
      .from('community_event_attendees')
      .insert({
        event_id: eventId,
        member_id: memberId,
        is_attending: isAttending,
        is_interested: isInterested
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to RSVP', { error: error.message, eventId })
      return { data: null, error }
    }

    logger.info('RSVP successful', { eventId, memberId })

    return { data, error: null }
  } catch (error: any) {
    logger.error('Exception in rsvpEvent', { error: error.message, eventId })
    return { data: null, error }
  }
}

// ============================================================================
// CONNECTION OPERATIONS
// ============================================================================

/**
 * Send connection request
 */
export async function sendConnectionRequest(
  requesterId: string,
  recipientId: string
): Promise<{ data: Connection | null; error: any }> {
  try {
    logger.info('Sending connection request', { requesterId, recipientId })

    const supabase = createClient()

    const { data, error } = await supabase
      .from('community_connections')
      .insert({
        requester_id: requesterId,
        recipient_id: recipientId,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to send connection request', { error: error.message })
      return { data: null, error }
    }

    logger.info('Connection request sent', { connectionId: data.id })

    return { data, error: null }
  } catch (error: any) {
    logger.error('Exception in sendConnectionRequest', { error: error.message })
    return { data: null, error }
  }
}

/**
 * Accept connection request
 */
export async function acceptConnectionRequest(
  connectionId: string
): Promise<{ data: Connection | null; error: any }> {
  try {
    logger.info('Accepting connection request', { connectionId })

    const supabase = createClient()

    const { data, error } = await supabase
      .from('community_connections')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', connectionId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to accept connection', { error: error.message })
      return { data: null, error }
    }

    logger.info('Connection accepted', { connectionId })

    return { data, error: null }
  } catch (error: any) {
    logger.error('Exception in acceptConnectionRequest', { error: error.message })
    return { data: null, error }
  }
}

/**
 * Get user connections
 */
export async function getConnections(
  memberId: string,
  status?: string
): Promise<{ data: Connection[] | null; error: any }> {
  try {
    logger.info('Fetching connections', { memberId, status })

    const supabase = createClient()

    let query = supabase
      .from('community_connections')
      .select('*')
      .or(`requester_id.eq.${memberId},recipient_id.eq.${memberId}`)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Failed to fetch connections', { error: error.message })
      return { data: null, error }
    }

    logger.info('Connections fetched successfully', { count: data?.length || 0 })

    return { data, error: null }
  } catch (error: any) {
    logger.error('Exception in getConnections', { error: error.message })
    return { data: null, error }
  }
}

// ============================================================================
// STATISTICS & ANALYTICS
// ============================================================================

/**
 * Get community statistics
 */
export async function getCommunityStats(): Promise<{
  data: {
    totalMembers: number
    totalPosts: number
    totalGroups: number
    totalEvents: number
    onlineMembers: number
    verifiedMembers: number
  } | null
  error: any
}> {
  try {
    logger.info('Fetching community statistics')

    const supabase = createClient()

    // Get member stats
    const { data: members } = await supabase
      .from('community_members')
      .select('is_online, is_verified')

    // Get counts
    const { count: postsCount } = await supabase
      .from('community_posts')
      .select('*', { count: 'exact', head: true })

    const { count: groupsCount } = await supabase
      .from('community_groups')
      .select('*', { count: 'exact', head: true })

    const { count: eventsCount } = await supabase
      .from('community_events')
      .select('*', { count: 'exact', head: true })

    const stats = {
      totalMembers: members?.length || 0,
      totalPosts: postsCount || 0,
      totalGroups: groupsCount || 0,
      totalEvents: eventsCount || 0,
      onlineMembers: members?.filter(m => m.is_online).length || 0,
      verifiedMembers: members?.filter(m => m.is_verified).length || 0
    }

    logger.info('Community statistics calculated', { stats })

    return { data: stats, error: null }
  } catch (error: any) {
    logger.error('Exception in getCommunityStats', { error: error.message })
    return { data: null, error }
  }
}
