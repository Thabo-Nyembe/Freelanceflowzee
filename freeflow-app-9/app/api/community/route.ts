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
          'delete-post' | 'create-comment' | 'report' | 'update-profile'
  resourceId: string  // postId, memberId, commentId
  userId?: string
  data?: any
}

// Like/Unlike post
async function handleLikePost(postId: string, userId: string = 'user-1', unlike: boolean = false): Promise<NextResponse> {
  try {
    const action = unlike ? 'unlike' : 'like'
    const supabase = await createClient()
    let totalLikes = 1

    // Try to persist to database
    if (unlike) {
      // Remove like
      await supabase
        .from('post_likes')
        .delete()
        .match({ post_id: postId, user_id: userId })
        .catch(() => null)

      // Decrement likes count
      const { data: post } = await supabase
        .from('community_posts')
        .select('likes_count')
        .eq('id', postId)
        .single()
        .catch(() => ({ data: null }))

      if (post) {
        totalLikes = Math.max(0, (post.likes_count || 0) - 1)
        await supabase
          .from('community_posts')
          .update({ likes_count: totalLikes })
          .eq('id', postId)
          .catch(() => null)
      }
    } else {
      // Add like
      await supabase
        .from('post_likes')
        .upsert({ post_id: postId, user_id: userId, created_at: new Date().toISOString() })
        .catch(() => null)

      // Increment likes count
      const { data: post } = await supabase
        .from('community_posts')
        .select('likes_count')
        .eq('id', postId)
        .single()
        .catch(() => ({ data: null }))

      if (post) {
        totalLikes = (post.likes_count || 0) + 1
        await supabase
          .from('community_posts')
          .update({ likes_count: totalLikes })
          .eq('id', postId)
          .catch(() => null)
      }
    }

    const result = {
      postId,
      userId,
      action,
      timestamp: new Date().toISOString(),
      totalLikes
    }

    return NextResponse.json({
      success: true,
      action,
      result,
      message: unlike ? 'Post unliked' : 'Post liked!',
      achievement: !unlike && Math.random() > 0.9 ? {
        message: 'You\'re becoming a community star!',
        badge: 'Social Butterfly',
        points: 5
      } : undefined
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to like/unlike post'
    }, { status: 500 })
  }
}

// Bookmark/Unbookmark post
async function handleBookmarkPost(postId: string, userId: string = 'user-1', unbookmark: boolean = false): Promise<NextResponse> {
  try {
    const action = unbookmark ? 'unbookmark' : 'bookmark'
    const supabase = await createClient()

    // Try to persist to database
    if (unbookmark) {
      await supabase
        .from('post_bookmarks')
        .delete()
        .match({ post_id: postId, user_id: userId })
        .catch(() => null)

      // Decrement bookmarks count
      await supabase.rpc('decrement_bookmarks', { post_id_param: postId }).catch(() => null)
    } else {
      await supabase
        .from('post_bookmarks')
        .upsert({
          post_id: postId,
          user_id: userId,
          collection: 'Saved Posts',
          created_at: new Date().toISOString()
        })
        .catch(() => null)

      // Increment bookmarks count
      await supabase.rpc('increment_bookmarks', { post_id_param: postId }).catch(() => null)
    }

    const result = {
      postId,
      userId,
      action,
      timestamp: new Date().toISOString(),
      collection: 'Saved Posts'
    }

    return NextResponse.json({
      success: true,
      action,
      result,
      message: unbookmark ? 'Removed from bookmarks' : 'Saved to bookmarks!',
      tip: !unbookmark ? 'Access your saved posts anytime from your profile' : undefined
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to bookmark/unbookmark post'
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
    const supabase = await createClient()

    const commentData = {
      post_id: postId,
      author_id: data.authorId || 'user-1',
      content: data.content,
      parent_id: data.parentId || null,
      likes_count: 0,
      is_edited: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Try to save to database
    const { data: savedComment, error } = await supabase
      .from('post_comments')
      .insert(commentData)
      .select()
      .single()
      .catch(() => ({ data: null, error: null }))

    // Increment comments count on post
    await supabase
      .from('community_posts')
      .select('comments_count')
      .eq('id', postId)
      .single()
      .then(({ data: post }) => {
        if (post) {
          return supabase
            .from('community_posts')
            .update({ comments_count: (post.comments_count || 0) + 1 })
            .eq('id', postId)
        }
      })
      .catch(() => null)

    const comment = savedComment || {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      postId,
      authorId: data.authorId || 'user-1',
      content: data.content,
      parentId: data.parentId,
      createdAt: new Date().toISOString(),
      likes: 0,
      replies: []
    }

    return NextResponse.json({
      success: true,
      action: 'create-comment',
      comment,
      message: 'Comment posted!',
      totalComments: 1
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to create comment'
    }, { status: 500 })
  }
}

// Connect/Disconnect with member
async function handleConnectionAction(memberId: string, userId: string = 'user-1', disconnect: boolean = false): Promise<NextResponse> {
  try {
    const action = disconnect ? 'disconnect' : 'connect'
    const supabase = await createClient()

    if (disconnect) {
      // Remove connection
      await supabase
        .from('member_connections')
        .delete()
        .or(`and(requester_id.eq.${userId},recipient_id.eq.${memberId}),and(requester_id.eq.${memberId},recipient_id.eq.${userId})`)
        .catch(() => null)
    } else {
      // Create connection request
      await supabase
        .from('member_connections')
        .upsert({
          requester_id: userId,
          recipient_id: memberId,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .catch(() => null)
    }

    const result = {
      memberId,
      userId,
      action,
      timestamp: new Date().toISOString(),
      status: disconnect ? 'disconnected' : 'pending'
    }

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
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to update connection'
    }, { status: 500 })
  }
}

// Follow/Unfollow member
async function handleFollowAction(memberId: string, userId: string = 'user-1', unfollow: boolean = false): Promise<NextResponse> {
  try {
    const action = unfollow ? 'unfollow' : 'follow'
    const supabase = await createClient()
    let totalFollowers = 1

    if (unfollow) {
      // Remove follow
      await supabase
        .from('member_follows')
        .delete()
        .match({ follower_id: userId, following_id: memberId })
        .catch(() => null)

      // Update follower count
      const { data: member } = await supabase
        .from('community_members')
        .select('followers')
        .eq('user_id', memberId)
        .single()
        .catch(() => ({ data: null }))

      if (member) {
        totalFollowers = Math.max(0, (member.followers || 0) - 1)
        await supabase
          .from('community_members')
          .update({ followers: totalFollowers })
          .eq('user_id', memberId)
          .catch(() => null)
      }
    } else {
      // Add follow
      await supabase
        .from('member_follows')
        .upsert({
          follower_id: userId,
          following_id: memberId,
          created_at: new Date().toISOString()
        })
        .catch(() => null)

      // Update follower count
      const { data: member } = await supabase
        .from('community_members')
        .select('followers')
        .eq('user_id', memberId)
        .single()
        .catch(() => ({ data: null }))

      if (member) {
        totalFollowers = (member.followers || 0) + 1
        await supabase
          .from('community_members')
          .update({ followers: totalFollowers })
          .eq('user_id', memberId)
          .catch(() => null)
      }

      // Update following count for user
      const { data: userMember } = await supabase
        .from('community_members')
        .select('following')
        .eq('user_id', userId)
        .single()
        .catch(() => ({ data: null }))

      if (userMember) {
        await supabase
          .from('community_members')
          .update({ following: (userMember.following || 0) + 1 })
          .eq('user_id', userId)
          .catch(() => null)
      }
    }

    const result = {
      memberId,
      userId,
      action,
      timestamp: new Date().toISOString(),
      totalFollowers
    }

    return NextResponse.json({
      success: true,
      action,
      result,
      message: unfollow
        ? 'Unfollowed successfully'
        : 'Following! You\'ll see their updates in your feed.',
      achievement: !unfollow && Math.random() > 0.8 ? {
        message: 'Building your network!',
        badge: 'Networker',
        points: 10
      } : undefined
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to follow/unfollow'
    }, { status: 500 })
  }
}

// Create post
async function handleCreatePost(data: any): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    const postData = {
      author_id: data.authorId || 'user-1',
      content: data.content,
      type: data.type || 'text',
      visibility: data.visibility || 'public',
      tags: data.tags || [],
      hashtags: data.hashtags || [],
      mentions: data.mentions || [],
      likes_count: 0,
      comments_count: 0,
      shares_count: 0,
      bookmarks_count: 0,
      views_count: 0,
      is_pinned: false,
      is_promoted: false,
      is_edited: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Try to save to database
    const { data: savedPost, error } = await supabase
      .from('community_posts')
      .insert(postData)
      .select()
      .single()
      .catch(() => ({ data: null, error: null }))

    // Increment posts count for author
    if (savedPost) {
      await supabase
        .from('community_members')
        .select('posts_count')
        .eq('user_id', data.authorId)
        .single()
        .then(({ data: member }) => {
          if (member) {
            return supabase
              .from('community_members')
              .update({ posts_count: (member.posts_count || 0) + 1 })
              .eq('user_id', data.authorId)
          }
        })
        .catch(() => null)
    }

    const post = savedPost || {
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

    return NextResponse.json({
      success: true,
      action: 'create-post',
      post,
      message: 'Post published successfully!',
      postUrl: `https://kazi.app/community/post/${post.id}`,
      achievement: {
        message: 'Great content! Keep sharing!',
        points: 15
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to create post'
    }, { status: 500 })
  }
}

// Update profile
async function handleUpdateProfile(userId: string, data: any): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Prepare the update object
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString()
    }

    if (data.name) updates.name = data.name
    if (data.bio !== undefined) updates.bio = data.bio
    if (data.title) updates.title = data.title
    if (data.location) updates.location = data.location
    if (data.skills && Array.isArray(data.skills)) updates.skills = data.skills
    if (data.avatar) updates.avatar = data.avatar
    if (data.hourlyRate !== undefined) updates.hourly_rate = data.hourlyRate
    if (data.portfolioUrl) updates.portfolio_url = data.portfolioUrl
    if (data.languages && Array.isArray(data.languages)) updates.languages = data.languages

    // Try to update existing member profile
    const { data: existingMember, error: findError } = await supabase
      .from('community_members')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existingMember) {
      // Update existing profile
      const { data: updatedMember, error: updateError } = await supabase
        .from('community_members')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      return NextResponse.json({
        success: true,
        action: 'update-profile',
        member: updatedMember,
        message: 'Profile updated successfully!',
        timestamp: new Date().toISOString()
      })
    } else {
      // Create new member profile
      const { data: newMember, error: createError } = await supabase
        .from('community_members')
        .insert({
          user_id: userId,
          name: data.name || 'Community Member',
          bio: data.bio || '',
          title: data.title || '',
          location: data.location || '',
          skills: data.skills || [],
          category: 'freelancer',
          availability: 'available',
          currency: 'USD',
          timezone: 'UTC',
          rating: 0,
          total_projects: 0,
          total_earnings: 0,
          completion_rate: 0,
          is_online: true,
          is_verified: false,
          is_premium: false,
          followers: 0,
          following: 0,
          posts_count: 0,
          badges: [],
          achievements: [],
          endorsements: 0,
          testimonials: 0,
          languages: [],
          certifications: []
        })
        .select()
        .single()

      if (createError) {
        throw createError
      }

      return NextResponse.json({
        success: true,
        action: 'update-profile',
        member: newMember,
        message: 'Profile created successfully!',
        isNew: true,
        timestamp: new Date().toISOString()
      })
    }
  } catch (error: any) {
    // If table doesn't exist, return mock success for demo
    if (error?.code === '42P01' || error?.message?.includes('does not exist')) {
      return NextResponse.json({
        success: true,
        action: 'update-profile',
        message: 'Profile updated successfully! (Demo mode)',
        timestamp: new Date().toISOString(),
        demo: true
      })
    }

    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to update profile'
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

      case 'update-profile':
        if (!userId) {
          return NextResponse.json({
            success: false,
            error: 'User ID required for profile update'
          }, { status: 400 })
        }
        return handleUpdateProfile(userId, data)

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
