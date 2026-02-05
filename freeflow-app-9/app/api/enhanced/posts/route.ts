import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('posts')
import { z } from 'zod'

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

/**
 * Enhanced Posts API
 *
 * Social-style post system with:
 * - Rich media support (images, videos, files)
 * - Reactions and comments
 * - Shares and reposts
 * - Hashtags and mentions
 * - Post visibility controls
 * - Analytics and engagement tracking
 */

const CreatePostSchema = z.object({
  content: z.string().min(1).max(10000),
  type: z.enum(['text', 'image', 'video', 'link', 'poll', 'project_update']).default('text'),
  media: z.array(z.object({
    url: z.string().url(),
    type: z.enum(['image', 'video', 'file']),
    alt: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
  })).optional(),
  link: z.object({
    url: z.string().url(),
    title: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
  }).optional(),
  poll: z.object({
    question: z.string(),
    options: z.array(z.string()).min(2).max(10),
    expiresIn: z.number().optional(), // hours
  }).optional(),
  projectId: z.string().uuid().optional(),
  visibility: z.enum(['public', 'followers', 'connections', 'private']).default('public'),
  tags: z.array(z.string()).optional(),
  mentions: z.array(z.string().uuid()).optional(),
  scheduledAt: z.string().optional(),
})

const CommentSchema = z.object({
  postId: z.string().uuid(),
  content: z.string().min(1).max(2000),
  parentId: z.string().uuid().optional(),
})

const ReactionSchema = z.object({
  postId: z.string().uuid(),
  type: z.enum(['like', 'love', 'celebrate', 'support', 'insightful', 'curious']),
})

// Demo posts data
const demoPosts = [
  {
    id: 'post-001',
    user_id: 'user-001',
    content: 'Just completed the brand identity for @TechStart! Really proud of how the logo turned out. #branding #design #logodesign',
    type: 'image',
    media: [
      { url: '/demo/brand-reveal.jpg', type: 'image', alt: 'TechStart brand identity' },
      { url: '/demo/logo-variations.jpg', type: 'image', alt: 'Logo variations' },
    ],
    visibility: 'public',
    tags: ['branding', 'design', 'logodesign'],
    reactions_count: { like: 45, love: 12, celebrate: 8 },
    comments_count: 15,
    shares_count: 3,
    created_at: '2026-01-29T10:00:00Z',
    user: {
      name: 'Alex Johnson',
      avatar: '/avatars/alex.jpg',
      title: 'Brand Designer',
    },
  },
  {
    id: 'post-002',
    user_id: 'user-002',
    content: 'Quick tip: Always use semantic HTML elements! Not only does it improve accessibility, but it also helps with SEO. What are your favorite HTML5 semantic elements?',
    type: 'poll',
    poll: {
      question: 'Favorite semantic HTML element?',
      options: ['<article>', '<section>', '<aside>', '<figure>'],
      votes: [42, 28, 15, 35],
      total_votes: 120,
      expires_at: '2026-01-31T00:00:00Z',
    },
    visibility: 'public',
    tags: ['webdev', 'html', 'accessibility'],
    reactions_count: { like: 89, insightful: 34 },
    comments_count: 28,
    shares_count: 12,
    created_at: '2026-01-28T14:30:00Z',
    user: {
      name: 'Sarah Chen',
      avatar: '/avatars/sarah.jpg',
      title: 'Full Stack Developer',
    },
  },
  {
    id: 'post-003',
    user_id: 'user-003',
    content: 'Milestone reached! Our app just hit 10,000 active users. Thank you to everyone who believed in us from the start. #milestone #startup',
    type: 'project_update',
    project_id: 'proj-003',
    visibility: 'public',
    tags: ['milestone', 'startup'],
    reactions_count: { like: 234, love: 87, celebrate: 156 },
    comments_count: 45,
    shares_count: 23,
    created_at: '2026-01-27T09:00:00Z',
    user: {
      name: 'Mike Williams',
      avatar: '/avatars/mike.jpg',
      title: 'Product Manager',
    },
    project: {
      name: 'FitLife App',
      thumbnail: '/demo/project-3.jpg',
    },
  },
  {
    id: 'post-004',
    user_id: 'user-001',
    content: 'Check out this great article on design systems and why every team should have one.',
    type: 'link',
    link: {
      url: 'https://example.com/design-systems',
      title: 'The Ultimate Guide to Design Systems',
      description: 'Learn how to build and maintain a design system that scales with your team.',
      image: '/demo/article-preview.jpg',
    },
    visibility: 'public',
    tags: ['designsystems', 'ux'],
    reactions_count: { like: 67, insightful: 23 },
    comments_count: 8,
    shares_count: 15,
    created_at: '2026-01-26T16:00:00Z',
    user: {
      name: 'Alex Johnson',
      avatar: '/avatars/alex.jpg',
      title: 'Brand Designer',
    },
  },
]

const demoComments = [
  {
    id: 'comment-001',
    post_id: 'post-001',
    user_id: 'user-002',
    content: 'This looks amazing! Love the color palette choice.',
    reactions_count: { like: 5 },
    created_at: '2026-01-29T10:30:00Z',
    user: { name: 'Sarah Chen', avatar: '/avatars/sarah.jpg' },
  },
  {
    id: 'comment-002',
    post_id: 'post-001',
    user_id: 'user-003',
    content: 'The typography is spot on. What font did you use for the wordmark?',
    reactions_count: { like: 2 },
    created_at: '2026-01-29T11:00:00Z',
    user: { name: 'Mike Williams', avatar: '/avatars/mike.jpg' },
  },
]

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')
    const userId = searchParams.get('userId')
    const projectId = searchParams.get('projectId')
    const tag = searchParams.get('tag')
    const type = searchParams.get('type')
    const feed = searchParams.get('feed') || 'home' // home | following | trending | project
    const view = searchParams.get('view') || 'posts' // posts | comments | analytics
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Demo mode
    if (!user) {
      if (view === 'comments' && postId) {
        const comments = demoComments.filter(c => c.post_id === postId)
        return NextResponse.json({
          success: true,
          demo: true,
          data: comments,
        })
      }

      if (view === 'analytics' && postId) {
        const post = demoPosts.find(p => p.id === postId)
        return NextResponse.json({
          success: true,
          demo: true,
          data: {
            impressions: 1234,
            engagements: 156,
            engagementRate: 12.6,
            clicks: 45,
            shares: post?.shares_count || 0,
            saves: 23,
            demographics: {
              topCountries: ['US', 'UK', 'CA'],
              topIndustries: ['Technology', 'Design', 'Marketing'],
            },
          },
        })
      }

      let filtered = [...demoPosts]

      if (postId) {
        const post = demoPosts.find(p => p.id === postId)
        return NextResponse.json({
          success: true,
          demo: true,
          data: post || null,
        })
      }

      if (userId) {
        filtered = filtered.filter(p => p.user_id === userId)
      }
      if (projectId) {
        filtered = filtered.filter(p => p.project_id === projectId)
      }
      if (tag) {
        filtered = filtered.filter(p => p.tags?.includes(tag))
      }
      if (type) {
        filtered = filtered.filter(p => p.type === type)
      }

      return NextResponse.json({
        success: true,
        demo: true,
        data: filtered.slice(offset, offset + limit),
        pagination: {
          total: filtered.length,
          limit,
          offset,
          hasMore: offset + limit < filtered.length,
        },
      })
    }

    // Real implementation
    if (view === 'comments' && postId) {
      const { data: comments, error } = await supabase
        .from('post_comments')
        .select(`
          *,
          user:profiles!user_id(id, full_name, avatar_url),
          reactions:post_comment_reactions(type)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Aggregate reactions
      const formattedComments = comments?.map(c => {
        const reactionCounts: Record<string, number> = {}
        c.reactions?.forEach((r: { type: string }) => {
          reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1
        })
        return { ...c, reactions_count: reactionCounts }
      })

      return NextResponse.json({
        success: true,
        data: formattedComments,
      })
    }

    if (view === 'analytics' && postId) {
      const { data: post } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single()

      if (post?.user_id !== user.id) {
        return NextResponse.json(
          { success: false, error: 'Can only view analytics for own posts' },
          { status: 403 }
        )
      }

      const { data: analytics } = await supabase
        .from('post_analytics')
        .select('*')
        .eq('post_id', postId)
        .single()

      return NextResponse.json({
        success: true,
        data: analytics || {
          impressions: 0,
          engagements: 0,
          engagementRate: 0,
          clicks: 0,
          shares: 0,
          saves: 0,
        },
      })
    }

    // Single post
    if (postId) {
      const { data: post, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:profiles!user_id(id, full_name, avatar_url, headline),
          project:projects!project_id(id, name, thumbnail),
          reactions:post_reactions(type),
          comments:post_comments(count),
          shares:post_shares(count)
        `)
        .eq('id', postId)
        .single()

      if (error) throw error

      // Aggregate reactions
      const reactionCounts: Record<string, number> = {}
      post?.reactions?.forEach((r: { type: string }) => {
        reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1
      })

      return NextResponse.json({
        success: true,
        data: {
          ...post,
          reactions_count: reactionCounts,
          comments_count: post?.comments?.[0]?.count || 0,
          shares_count: post?.shares?.[0]?.count || 0,
        },
      })
    }

    // Build feed query
    let query = supabase
      .from('posts')
      .select(`
        *,
        user:profiles!user_id(id, full_name, avatar_url, headline),
        project:projects!project_id(id, name, thumbnail),
        reactions:post_reactions(type),
        comments:post_comments(count),
        shares:post_shares(count)
      `)

    // Apply filters based on feed type
    switch (feed) {
      case 'following':
        // Get posts from users the current user follows
        const { data: following } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id)

        const followingIds = following?.map(f => f.following_id) || []
        if (followingIds.length > 0) {
          query = query.in('user_id', followingIds)
        }
        break

      case 'trending':
        // Order by engagement in last 24 hours
        query = query.gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        break

      case 'project':
        if (projectId) {
          query = query.eq('project_id', projectId)
        }
        break
    }

    if (userId) {
      query = query.eq('user_id', userId)
    }
    if (tag) {
      query = query.contains('tags', [tag])
    }
    if (type) {
      query = query.eq('type', type)
    }

    // Visibility filter
    query = query.or(`visibility.eq.public,user_id.eq.${user.id}`)

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: posts, error, count } = await query

    if (error) throw error

    // Format posts with reaction counts
    const formattedPosts = posts?.map(post => {
      const reactionCounts: Record<string, number> = {}
      post.reactions?.forEach((r: { type: string }) => {
        reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1
      })
      return {
        ...post,
        reactions_count: reactionCounts,
        comments_count: post.comments?.[0]?.count || 0,
        shares_count: post.shares?.[0]?.count || 0,
      }
    })

    return NextResponse.json({
      success: true,
      data: formattedPosts,
      pagination: {
        total: count || formattedPosts?.length || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    })
  } catch (error) {
    logger.error('Posts GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const { action = 'create', ...data } = body

    // Demo mode
    if (!user) {
      switch (action) {
        case 'create':
          return NextResponse.json({
            success: true,
            demo: true,
            message: 'Post created (demo mode)',
            data: {
              id: `post-demo-${Date.now()}`,
              ...data,
              created_at: new Date().toISOString(),
            },
          })
        case 'comment':
          return NextResponse.json({
            success: true,
            demo: true,
            message: 'Comment added (demo mode)',
            data: {
              id: `comment-demo-${Date.now()}`,
              content: data.content,
              created_at: new Date().toISOString(),
            },
          })
        case 'react':
          return NextResponse.json({
            success: true,
            demo: true,
            message: 'Reaction added (demo mode)',
          })
        case 'share':
          return NextResponse.json({
            success: true,
            demo: true,
            message: 'Post shared (demo mode)',
          })
        case 'vote':
          return NextResponse.json({
            success: true,
            demo: true,
            message: 'Vote recorded (demo mode)',
          })
        default:
          return NextResponse.json({
            success: false,
            demo: true,
            error: 'Unknown action',
          }, { status: 400 })
      }
    }

    switch (action) {
      case 'create': {
        const validated = CreatePostSchema.parse(data)

        // Extract hashtags from content
        const hashtags = validated.content.match(/#[\w]+/g)?.map(t => t.slice(1).toLowerCase()) || []
        const allTags = [...new Set([...(validated.tags || []), ...hashtags])]

        // Extract mentions from content
        const mentionMatches = validated.content.match(/@[\w]+/g) || []

        const postData: Record<string, unknown> = {
          user_id: user.id,
          content: validated.content,
          type: validated.type,
          media: validated.media,
          link: validated.link,
          poll: validated.poll ? {
            ...validated.poll,
            votes: new Array(validated.poll.options.length).fill(0),
            total_votes: 0,
            expires_at: validated.poll.expiresIn
              ? new Date(Date.now() + validated.poll.expiresIn * 60 * 60 * 1000).toISOString()
              : null,
          } : null,
          project_id: validated.projectId,
          visibility: validated.visibility,
          tags: allTags,
          mentions: validated.mentions,
          scheduled_at: validated.scheduledAt,
          status: validated.scheduledAt ? 'scheduled' : 'published',
        }

        const { data: post, error } = await supabase
          .from('posts')
          .insert(postData)
          .select(`
            *,
            user:profiles!user_id(id, full_name, avatar_url)
          `)
          .single()

        if (error) throw error

        // Notify mentioned users
        if (validated.mentions?.length) {
          await supabase.from('notifications').insert(
            validated.mentions.map(mentionId => ({
              user_id: mentionId,
              type: 'post_mention',
              title: 'You were mentioned in a post',
              message: validated.content.substring(0, 100),
              data: { postId: post.id },
            }))
          )
        }

        return NextResponse.json({
          success: true,
          message: validated.scheduledAt ? 'Post scheduled' : 'Post created',
          data: post,
        })
      }

      case 'update': {
        const { postId, content, visibility } = data

        if (!postId) {
          return NextResponse.json(
            { success: false, error: 'Post ID required' },
            { status: 400 }
          )
        }

        const { data: existing } = await supabase
          .from('posts')
          .select('user_id')
          .eq('id', postId)
          .single()

        if (existing?.user_id !== user.id) {
          return NextResponse.json(
            { success: false, error: 'Can only edit own posts' },
            { status: 403 }
          )
        }

        const updateData: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
          edited: true,
        }
        if (content) updateData.content = content
        if (visibility) updateData.visibility = visibility

        const { data: post, error } = await supabase
          .from('posts')
          .update(updateData)
          .eq('id', postId)
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({
          success: true,
          message: 'Post updated',
          data: post,
        })
      }

      case 'delete': {
        const { postId } = data

        const { data: existing } = await supabase
          .from('posts')
          .select('user_id')
          .eq('id', postId)
          .single()

        if (existing?.user_id !== user.id) {
          return NextResponse.json(
            { success: false, error: 'Can only delete own posts' },
            { status: 403 }
          )
        }

        await supabase.from('posts').delete().eq('id', postId)

        return NextResponse.json({
          success: true,
          message: 'Post deleted',
        })
      }

      case 'comment': {
        const validated = CommentSchema.parse(data)

        const { data: comment, error } = await supabase
          .from('post_comments')
          .insert({
            post_id: validated.postId,
            user_id: user.id,
            content: validated.content,
            parent_id: validated.parentId,
          })
          .select(`
            *,
            user:profiles!user_id(id, full_name, avatar_url)
          `)
          .single()

        if (error) throw error

        // Notify post author
        const { data: post } = await supabase
          .from('posts')
          .select('user_id')
          .eq('id', validated.postId)
          .single()

        if (post && post.user_id !== user.id) {
          await supabase.from('notifications').insert({
            user_id: post.user_id,
            type: 'post_comment',
            title: 'New comment on your post',
            message: validated.content.substring(0, 100),
            data: { postId: validated.postId, commentId: comment.id },
          })
        }

        return NextResponse.json({
          success: true,
          message: 'Comment added',
          data: comment,
        })
      }

      case 'react': {
        const validated = ReactionSchema.parse(data)

        // Check if reaction exists
        const { data: existing } = await supabase
          .from('post_reactions')
          .select('id, type')
          .eq('post_id', validated.postId)
          .eq('user_id', user.id)
          .single()

        if (existing) {
          if (existing.type === validated.type) {
            // Remove reaction
            await supabase.from('post_reactions').delete().eq('id', existing.id)
            return NextResponse.json({
              success: true,
              message: 'Reaction removed',
            })
          } else {
            // Update reaction
            await supabase
              .from('post_reactions')
              .update({ type: validated.type })
              .eq('id', existing.id)
            return NextResponse.json({
              success: true,
              message: 'Reaction updated',
            })
          }
        }

        // Add reaction
        await supabase.from('post_reactions').insert({
          post_id: validated.postId,
          user_id: user.id,
          type: validated.type,
        })

        return NextResponse.json({
          success: true,
          message: 'Reaction added',
        })
      }

      case 'share': {
        const { postId, content } = data

        if (!postId) {
          return NextResponse.json(
            { success: false, error: 'Post ID required' },
            { status: 400 }
          )
        }

        // Create share record
        await supabase.from('post_shares').insert({
          post_id: postId,
          user_id: user.id,
        })

        // Create repost if content provided
        if (content) {
          await supabase.from('posts').insert({
            user_id: user.id,
            content,
            type: 'repost',
            repost_id: postId,
            visibility: 'public',
          })
        }

        // Notify original author
        const { data: post } = await supabase
          .from('posts')
          .select('user_id')
          .eq('id', postId)
          .single()

        if (post && post.user_id !== user.id) {
          await supabase.from('notifications').insert({
            user_id: post.user_id,
            type: 'post_share',
            title: 'Your post was shared',
            data: { postId },
          })
        }

        return NextResponse.json({
          success: true,
          message: 'Post shared',
        })
      }

      case 'vote': {
        const { postId, optionIndex } = data

        if (!postId || optionIndex === undefined) {
          return NextResponse.json(
            { success: false, error: 'Post ID and option index required' },
            { status: 400 }
          )
        }

        // Check if already voted
        const { data: existingVote } = await supabase
          .from('poll_votes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .single()

        if (existingVote) {
          return NextResponse.json(
            { success: false, error: 'Already voted on this poll' },
            { status: 400 }
          )
        }

        // Record vote
        await supabase.from('poll_votes').insert({
          post_id: postId,
          user_id: user.id,
          option_index: optionIndex,
        })

        // Update poll counts
        await supabase.rpc('increment_poll_vote', {
          p_post_id: postId,
          p_option_index: optionIndex,
        })

        return NextResponse.json({
          success: true,
          message: 'Vote recorded',
        })
      }

      case 'save': {
        const { postId } = data

        if (!postId) {
          return NextResponse.json(
            { success: false, error: 'Post ID required' },
            { status: 400 }
          )
        }

        // Toggle save
        const { data: existing } = await supabase
          .from('saved_posts')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .single()

        if (existing) {
          await supabase.from('saved_posts').delete().eq('id', existing.id)
          return NextResponse.json({
            success: true,
            message: 'Post unsaved',
          })
        }

        await supabase.from('saved_posts').insert({
          post_id: postId,
          user_id: user.id,
        })

        return NextResponse.json({
          success: true,
          message: 'Post saved',
        })
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    logger.error('Posts POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process post request' },
      { status: 500 }
    )
  }
}
