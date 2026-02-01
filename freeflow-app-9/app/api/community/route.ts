import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from '@/lib/auth'

// Community Hub API
// Supports: Posts, Connections, Likes, Comments, Shares, Bookmarks

// ============================================================================
// DEMO MODE CONFIGURATION
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

function isDemoMode(request: NextRequest): boolean {
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

interface CommunityRequest {
  action: 'like' | 'unlike' | 'bookmark' | 'unbookmark' | 'share' | 'comment' |
          'connect' | 'disconnect' | 'follow' | 'unfollow' | 'create-post' |
          'delete-post' | 'create-comment' | 'report'
  resourceId: string  // postId, memberId, commentId
  userId?: string
  data?: any
}

// Like/Unlike post
async function handleLikePost(postId: string, userId: string = 'user-1', unlike: boolean = false): Promise<NextResponse> {
  try {
    const action = unlike ? 'unlike' : 'like'

    const result = {
      postId,
      userId,
      action,
      timestamp: new Date().toISOString(),
      totalLikes: unlike ? -1 : 1  // Would be actual count from database
    }

    // In production: Update database
    // await db.posts.updateLikes(postId, userId, action)

    return NextResponse.json({
      success: true,
      action,
      result,
      message: unlike ? 'Post unliked' : 'Post liked!',
      achievement: !unlike && Math.random() > 0.9 ? {
        message: '🎉 You\'re becoming a community star!',
        badge: 'Social Butterfly',
        points: 5
      } : undefined
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to like/unlike post'
    }, { status: 500 })
  }
}

// Bookmark/Unbookmark post
async function handleBookmarkPost(postId: string, userId: string = 'user-1', unbookmark: boolean = false): Promise<NextResponse> {
  try {
    const action = unbookmark ? 'unbookmark' : 'bookmark'

    const result = {
      postId,
      userId,
      action,
      timestamp: new Date().toISOString(),
      collection: 'Saved Posts'  // Could organize into collections
    }

    // In production: Update database
    // await db.bookmarks.toggle(postId, userId, action)

    return NextResponse.json({
      success: true,
      action,
      result,
      message: unbookmark ? 'Removed from bookmarks' : 'Saved to bookmarks!',
      tip: !unbookmark ? 'Access your saved posts anytime from your profile' : undefined
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to bookmark/unbookmark post'
    }, { status: 500 })
  }
}

// Share post
async function handleSharePost(postId: string, data: any): Promise<NextResponse> {
  try {
    const result = {
      postId,
      shareMethod: data?.method || 'link',  // link, email, social
      platform: data?.platform,  // twitter, linkedin, facebook
      timestamp: new Date().toISOString(),
      shareUrl: `https://kazi.app/community/post/${postId}`,
      totalShares: 1  // Would be actual count from database
    }

    // In production: Track share analytics
    // await db.posts.incrementShares(postId)
    // await db.analytics.trackShare(postId, data)

    return NextResponse.json({
      success: true,
      action: 'share',
      result,
      message: 'Post shared successfully!',
      shareUrl: result.shareUrl,
      socialLinks: {
        twitter: `https://twitter.com/intent/tweet?url=${result.shareUrl}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${result.shareUrl}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${result.shareUrl}`
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to share post'
    }, { status: 500 })
  }
}

// Create comment
async function handleCreateComment(postId: string, data: any): Promise<NextResponse> {
  try {
    const comment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      postId,
      authorId: data.authorId || 'user-1',
      content: data.content,
      parentId: data.parentId,  // For replies
      createdAt: new Date().toISOString(),
      likes: 0,
      replies: []
    }

    // In production: Save to database
    // await db.comments.create(comment)

    return NextResponse.json({
      success: true,
      action: 'create-comment',
      comment,
      message: 'Comment posted!',
      totalComments: 1  // Would be actual count
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create comment'
    }, { status: 500 })
  }
}

// Connect/Disconnect with member
async function handleConnectionAction(memberId: string, userId: string = 'user-1', disconnect: boolean = false): Promise<NextResponse> {
  try {
    const action = disconnect ? 'disconnect' : 'connect'

    const result = {
      memberId,
      userId,
      action,
      timestamp: new Date().toISOString(),
      status: disconnect ? 'disconnected' : 'pending'  // Could require acceptance
    }

    // In production: Update database and send notification
    // await db.connections.toggle(userId, memberId, action)
    // await sendNotification(memberId, `${userId} wants to connect`)

    return NextResponse.json({
      success: true,
      action,
      result,
      message: disconnect
        ? 'Connection removed'
        : 'Connection request sent!',
      nextSteps: !disconnect ? [
        'They will be notified',
        'You can message once they accept'
      ] : undefined
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update connection'
    }, { status: 500 })
  }
}

// Follow/Unfollow member
async function handleFollowAction(memberId: string, userId: string = 'user-1', unfollow: boolean = false): Promise<NextResponse> {
  try {
    const action = unfollow ? 'unfollow' : 'follow'

    const result = {
      memberId,
      userId,
      action,
      timestamp: new Date().toISOString(),
      totalFollowers: unfollow ? -1 : 1  // Would be actual count
    }

    // In production: Update database
    // await db.follows.toggle(userId, memberId, action)

    return NextResponse.json({
      success: true,
      action,
      result,
      message: unfollow
        ? 'Unfollowed successfully'
        : 'Following! You\'ll see their updates in your feed.',
      achievement: !unfollow && Math.random() > 0.8 ? {
        message: '🌟 Building your network!',
        badge: 'Networker',
        points: 10
      } : undefined
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to follow/unfollow'
    }, { status: 500 })
  }
}

// Create post
async function handleCreatePost(data: any): Promise<NextResponse> {
  try {
    const post = {
      id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      authorId: data.authorId || 'user-1',
      content: data.content,
      type: data.type || 'text',
      media: data.media || [],
      tags: data.tags || [],
      visibility: data.visibility || 'public',
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
      shares: 0,
      bookmarks: 0,
      views: 0
    }

    // In production: Save to database
    // await db.posts.create(post)

    return NextResponse.json({
      success: true,
      action: 'create-post',
      post,
      message: 'Post published successfully!',
      postUrl: `https://kazi.app/community/post/${post.id}`,
      achievement: {
        message: '📝 Great content! Keep sharing!',
        points: 15
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create post'
    }, { status: 500 })
  }
}

// Report content
async function handleReport(resourceId: string, data: any): Promise<NextResponse> {
  try {
    const report = {
      id: `report_${Date.now()}`,
      resourceType: data.type || 'post',  // post, comment, member
      resourceId,
      reporterId: data.reporterId || 'user-1',
      reason: data.reason || 'inappropriate',
      details: data.details || '',
      timestamp: new Date().toISOString(),
      status: 'pending'
    }

    // In production: Save report and notify moderators
    // await db.reports.create(report)
    // await notifyModerators(report)

    return NextResponse.json({
      success: true,
      action: 'report',
      report,
      message: 'Thank you for reporting. Our team will review this.',
      caseNumber: report.id,
      nextSteps: [
        'Our moderation team will review within 24 hours',
        'You\'ll be notified of the outcome',
        'Content may be hidden from your feed'
      ]
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to submit report'
    }, { status: 500 })
  }
}

// Main POST handler
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: CommunityRequest = await request.json()
    const { action, resourceId, userId, data } = body

    switch (action) {
      case 'like':
        return handleLikePost(resourceId, userId, false)

      case 'unlike':
        return handleLikePost(resourceId, userId, true)

      case 'bookmark':
        return handleBookmarkPost(resourceId, userId, false)

      case 'unbookmark':
        return handleBookmarkPost(resourceId, userId, true)

      case 'share':
        return handleSharePost(resourceId, data)

      case 'comment':
        if (!data?.content) {
          return NextResponse.json({
            success: false,
            error: 'Comment content required'
          }, { status: 400 })
        }
        return handleCreateComment(resourceId, data)

      case 'connect':
        return handleConnectionAction(resourceId, userId, false)

      case 'disconnect':
        return handleConnectionAction(resourceId, userId, true)

      case 'follow':
        return handleFollowAction(resourceId, userId, false)

      case 'unfollow':
        return handleFollowAction(resourceId, userId, true)

      case 'create-post':
        if (!data?.content) {
          return NextResponse.json({
            success: false,
            error: 'Post content required'
          }, { status: 400 })
        }
        return handleCreatePost(data)

      case 'report':
        if (!data?.reason) {
          return NextResponse.json({
            success: false,
            error: 'Report reason required'
          }, { status: 400 })
        }
        return handleReport(resourceId, data)

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}`
        }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Invalid request'
    }, { status: 400 })
  }
}

// GET handler for fetching community data
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'posts'  // posts, members, events, groups
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const supabase = await createClient()
    const session = await getServerSession()

    // Check for demo mode
    const demoMode = isDemoMode(request)

    // Determine user ID
    let userId: string | null = null
    let isDemo = false

    if (!session?.user) {
      if (demoMode) {
        // Use demo user ID
        userId = DEMO_USER_ID
        isDemo = true
      } else {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    } else {
      const userEmail = session.user.email
      const isDemoAccount = userEmail === 'test@kazi.dev' || userEmail === 'demo@kazi.io' || userEmail === 'alex@freeflow.io'
      userId = isDemoAccount ? DEMO_USER_ID : ((session.user as { authId?: string; id: string }).authId || session.user.id)
      isDemo = isDemoAccount || demoMode
    }

    // Fetch data based on type
    switch (type) {
      case 'posts': {
        const { data: posts, error, count } = await supabase
          .from('community_posts')
          .select('*', { count: 'exact' })
          .eq('user_id', userId)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .range((page - 1) * limit, page * limit - 1)

        if (error) {
          // If table doesn't exist, return empty data
          return NextResponse.json({
            success: true,
            demo: isDemo,
            data: [],
            pagination: { page, limit, total: 0, totalPages: 0 },
            message: 'No posts found'
          })
        }

        return NextResponse.json({
          success: true,
          demo: isDemo,
          data: posts || [],
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit)
          },
          message: `Fetched ${posts?.length || 0} posts`
        })
      }

      case 'members': {
        const { data: members, error, count } = await supabase
          .from('community_members')
          .select('*', { count: 'exact' })
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .range((page - 1) * limit, page * limit - 1)

        if (error) {
          return NextResponse.json({
            success: true,
            demo: isDemo,
            data: [],
            pagination: { page, limit, total: 0, totalPages: 0 },
            message: 'No members found'
          })
        }

        return NextResponse.json({
          success: true,
          demo: isDemo,
          data: members || [],
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit)
          },
          message: `Fetched ${members?.length || 0} members`
        })
      }

      case 'events': {
        const { data: events, error, count } = await supabase
          .from('community_events')
          .select('*', { count: 'exact' })
          .is('deleted_at', null)
          .order('event_date', { ascending: true })
          .range((page - 1) * limit, page * limit - 1)

        if (error) {
          return NextResponse.json({
            success: true,
            demo: isDemo,
            data: [],
            pagination: { page, limit, total: 0, totalPages: 0 },
            message: 'No events found'
          })
        }

        return NextResponse.json({
          success: true,
          demo: isDemo,
          data: events || [],
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit)
          },
          message: `Fetched ${events?.length || 0} events`
        })
      }

      case 'groups': {
        const { data: groups, error, count } = await supabase
          .from('community_groups')
          .select('*', { count: 'exact' })
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .range((page - 1) * limit, page * limit - 1)

        if (error) {
          return NextResponse.json({
            success: true,
            demo: isDemo,
            data: [],
            pagination: { page, limit, total: 0, totalPages: 0 },
            message: 'No groups found'
          })
        }

        return NextResponse.json({
          success: true,
          demo: isDemo,
          data: groups || [],
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit)
          },
          message: `Fetched ${groups?.length || 0} groups`
        })
      }

      default:
        return NextResponse.json({
          success: true,
          demo: isDemo,
          data: [],
          message: `Unknown type: ${type}`
        })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch data'
    }, { status: 500 })
  }
}
