/**
 * Team Collaboration API Routes
 *
 * REST endpoints for Team Management and Collaboration:
 * GET - Teams, members, invites, projects, channels, messages, activity, stats
 * POST - Create teams, invite members, add projects, create channels, send messages
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('team-collaboration')
import {
  getTeams,
  getTeamBySlug,
  createTeam,
  getTeamMembers,
  inviteToTeam,
  getTeamInvites,
  acceptTeamInvite,
  getTeamProjects,
  addProjectToTeam,
  getTeamChannels,
  createTeamChannel,
  getChannelMessages,
  sendTeamMessage,
  getTeamActivity,
  getTeamStats
} from '@/lib/team-collaboration-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'teams'
    const teamId = searchParams.get('team_id')
    const channelId = searchParams.get('channel_id')
    const slug = searchParams.get('slug')
    const before = searchParams.get('before')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    switch (type) {
      case 'teams': {
        const data = await getTeams(user.id)
        return NextResponse.json({ data })
      }

      case 'team-by-slug': {
        if (!slug) {
          return NextResponse.json({ error: 'slug required' }, { status: 400 })
        }
        const data = await getTeamBySlug(slug)
        return NextResponse.json({ data })
      }

      case 'members': {
        if (!teamId) {
          return NextResponse.json({ error: 'team_id required' }, { status: 400 })
        }
        const data = await getTeamMembers(teamId)
        return NextResponse.json({ data })
      }

      case 'invites': {
        if (!teamId) {
          return NextResponse.json({ error: 'team_id required' }, { status: 400 })
        }
        const data = await getTeamInvites(teamId)
        return NextResponse.json({ data })
      }

      case 'projects': {
        if (!teamId) {
          return NextResponse.json({ error: 'team_id required' }, { status: 400 })
        }
        const data = await getTeamProjects(teamId)
        return NextResponse.json({ data })
      }

      case 'channels': {
        if (!teamId) {
          return NextResponse.json({ error: 'team_id required' }, { status: 400 })
        }
        const data = await getTeamChannels(teamId, user.id)
        return NextResponse.json({ data })
      }

      case 'messages': {
        if (!channelId) {
          return NextResponse.json({ error: 'channel_id required' }, { status: 400 })
        }
        const options: any = { limit }
        if (before) options.before = before
        const data = await getChannelMessages(channelId, options)
        return NextResponse.json({ data })
      }

      case 'activity': {
        if (!teamId) {
          return NextResponse.json({ error: 'team_id required' }, { status: 400 })
        }
        const data = await getTeamActivity(teamId, limit)
        return NextResponse.json({ data })
      }

      case 'stats': {
        if (!teamId) {
          return NextResponse.json({ error: 'team_id required' }, { status: 400 })
        }
        const data = await getTeamStats(teamId)
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to fetch Team Collaboration data', { error })
    return NextResponse.json(
      { error: 'Failed to fetch Team Collaboration data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...payload } = body

    switch (action) {
      case 'create-team': {
        const data = await createTeam(payload, user.id)
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'invite-member': {
        const data = await inviteToTeam(payload.team_id, payload.email, payload.role, user.id)
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'accept-invite': {
        const result = await acceptTeamInvite(payload.token, user.id)
        return NextResponse.json({ data: result })
      }

      case 'add-project': {
        const data = await addProjectToTeam(payload.team_id, payload.project_id, user.id, payload.access_level)
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-channel': {
        const data = await createTeamChannel({ ...payload, created_by: user.id })
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'send-message': {
        const data = await sendTeamMessage({ ...payload, user_id: user.id })
        return NextResponse.json({ data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to process Team Collaboration request', { error })
    return NextResponse.json(
      { error: 'Failed to process Team Collaboration request' },
      { status: 500 }
    )
  }
}
