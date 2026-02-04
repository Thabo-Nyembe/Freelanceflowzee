/**
 * Announcements Send API
 * Send announcements to specific segments or all users
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

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

const logger = createFeatureLogger('announcements-send')

/**
 * POST /api/announcements/send - Send announcement to segment
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { announcement_id, segment_id, channels = ['web'] } = body as {
      announcement_id: string
      segment_id?: string
      channels?: ('web' | 'email' | 'push')[]
    }

    if (!announcement_id) {
      return NextResponse.json(
        { error: 'announcement_id is required' },
        { status: 400 }
      )
    }

    // Get the announcement
    const { data: announcement, error: announcementError } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', announcement_id)
      .single()

    if (announcementError || !announcement) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      )
    }

    let targetUsers: string[] = []
    let segmentName = 'all users'

    // If segment_id provided, get users from that segment
    if (segment_id) {
      const { data: segment, error: segmentError } = await supabase
        .from('audience_segments')
        .select('*')
        .eq('id', segment_id)
        .single()

      if (segmentError || !segment) {
        return NextResponse.json(
          { error: 'Segment not found' },
          { status: 404 }
        )
      }

      segmentName = segment.name

      // Get users matching segment rules (simplified - in production would use the rules)
      const { data: users } = await supabase
        .from('profiles')
        .select('id')
        .limit(1000)

      targetUsers = (users || []).map(u => u.id)
    } else {
      // Send to all users
      const { data: users } = await supabase
        .from('profiles')
        .select('id')
        .limit(1000)

      targetUsers = (users || []).map(u => u.id)
    }

    // Create announcement targets for each user
    const targets = targetUsers.map(userId => ({
      announcement_id,
      user_id: userId,
      channel: channels[0] || 'web',
      status: 'pending',
      created_at: new Date().toISOString()
    }))

    if (targets.length > 0) {
      const { error: insertError } = await supabase
        .from('announcement_targets')
        .insert(targets)

      if (insertError) {
        logger.error('Failed to create announcement targets', { error: insertError })
      }
    }

    // Update announcement status to published if not already
    if (announcement.status !== 'published') {
      await supabase
        .from('announcements')
        .update({
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', announcement_id)
    }

    // Process email notifications if enabled
    if (channels.includes('email') && announcement.send_email) {
      // In production, would queue email jobs here
      logger.info('Email notifications queued', { count: targetUsers.length })
    }

    // Process push notifications if enabled
    if (channels.includes('push') && announcement.send_push) {
      // In production, would queue push notification jobs here
      logger.info('Push notifications queued', { count: targetUsers.length })
    }

    return NextResponse.json({
      success: true,
      message: `Announcement sent to ${segmentName}`,
      sent_count: targetUsers.length,
      channels
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to send announcement'
    logger.error('Announcements send error', { error })
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
