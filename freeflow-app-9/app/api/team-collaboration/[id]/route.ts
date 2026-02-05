/**
 * Team Collaboration API - Single Resource Routes
 *
 * GET - Get single team, member
 * PUT - Update team, member, project access, role, reactions
 * DELETE - Delete team, remove member, remove project, revoke invite
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('team-collaboration')
import {
  getTeamById,
  updateTeam,
  deleteTeam,
  getTeamMember,
  updateTeamMember,
  removeTeamMember,
  changeTeamMemberRole,
  addTeamMember,
  revokeTeamInvite,
  removeProjectFromTeam,
  updateProjectAccess,
  addMessageReaction,
  removeMessageReaction
} from '@/lib/team-collaboration-queries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'team'
    const userId = searchParams.get('user_id')

    switch (type) {
      case 'team': {
        const data = await getTeamById(id)
        return NextResponse.json({ data })
      }

      case 'member': {
        if (!userId) {
          return NextResponse.json({ error: 'user_id required' }, { status: 400 })
        }
        const data = await getTeamMember(id, userId)
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to fetch resource', { error })
    return NextResponse.json(
      { error: 'Failed to fetch resource' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, action, ...updates } = body

    switch (type) {
      case 'team': {
        const data = await updateTeam(id, updates)
        return NextResponse.json({ data })
      }

      case 'member': {
        if (action === 'change-role') {
          const success = await changeTeamMemberRole(id, updates.user_id, updates.new_role, user.id)
          return NextResponse.json({ success })
        } else if (action === 'add') {
          const data = await addTeamMember(id, updates.user_id, updates.role, user.id, updates)
          return NextResponse.json({ data })
        } else {
          const data = await updateTeamMember(id, updates.user_id, updates)
          return NextResponse.json({ data })
        }
      }

      case 'project': {
        if (action === 'update-access') {
          const success = await updateProjectAccess(id, updates.project_id, updates.access_level)
          return NextResponse.json({ success })
        }
        return NextResponse.json({ error: 'Invalid action for project' }, { status: 400 })
      }

      case 'message': {
        if (action === 'add-reaction') {
          const success = await addMessageReaction(id, user.id, updates.emoji)
          return NextResponse.json({ success })
        } else if (action === 'remove-reaction') {
          const success = await removeMessageReaction(id, user.id, updates.emoji)
          return NextResponse.json({ success })
        }
        return NextResponse.json({ error: 'Invalid action for message' }, { status: 400 })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to update resource', { error })
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'team'
    const userId = searchParams.get('user_id')
    const projectId = searchParams.get('project_id')
    const permanent = searchParams.get('permanent') === 'true'

    switch (type) {
      case 'team': {
        const success = await deleteTeam(id, permanent)
        return NextResponse.json({ success })
      }

      case 'member': {
        if (!userId) {
          return NextResponse.json({ error: 'user_id required' }, { status: 400 })
        }
        const success = await removeTeamMember(id, userId, user.id)
        return NextResponse.json({ success })
      }

      case 'invite': {
        const success = await revokeTeamInvite(id, user.id)
        return NextResponse.json({ success })
      }

      case 'project': {
        if (!projectId) {
          return NextResponse.json({ error: 'project_id required' }, { status: 400 })
        }
        const success = await removeProjectFromTeam(id, projectId, user.id)
        return NextResponse.json({ success })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to delete resource', { error })
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
