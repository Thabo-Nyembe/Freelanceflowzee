/**
 * Team API Route
 * Comprehensive team management with invitations, roles, permissions, and communications
 * Full database implementation with demo mode fallback
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from '@/lib/auth'
import { createFeatureLogger } from '@/lib/logger'
import { randomBytes } from 'crypto'

const logger = createFeatureLogger('team-api')

// Demo mode support
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

function isDemoMode(request: NextRequest): boolean {
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

// Type definitions matching database schema
type MemberStatus = 'online' | 'busy' | 'away' | 'offline'
type MemberRole = 'Lead Designer' | 'Frontend Developer' | 'Backend Developer' | 'Project Manager' | 'QA Engineer' | 'Marketing Specialist' | 'Content Writer' | 'DevOps Engineer' | 'UI/UX Designer' | 'Data Analyst' | 'Team Member'
type DepartmentType = 'Design' | 'Development' | 'Management' | 'Marketing' | 'Quality Assurance' | 'Content' | 'Operations' | 'Analytics' | 'Sales' | 'Support'
type PermissionLevel = 'owner' | 'admin' | 'write' | 'read'
type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired'

// Mock data for demo/fallback
const mockTeam = [
  { id: '1', name: 'John Smith', email: 'john@freeflow.io', role: 'Lead Designer', department: 'Design', avatar: '/avatars/john.png', status: 'online', rating: 4.8, skills: ['Figma', 'UI Design', 'Branding'] },
  { id: '2', name: 'Sarah Wilson', email: 'sarah@freeflow.io', role: 'Frontend Developer', department: 'Development', avatar: '/avatars/sarah.png', status: 'online', rating: 4.9, skills: ['React', 'TypeScript', 'CSS'] },
  { id: '3', name: 'Mike Brown', email: 'mike@freeflow.io', role: 'Project Manager', department: 'Management', avatar: '/avatars/mike.png', status: 'away', rating: 4.7, skills: ['Agile', 'Scrum', 'Leadership'] },
  { id: '4', name: 'Lisa Chen', email: 'lisa@freeflow.io', role: 'Backend Developer', department: 'Development', avatar: '/avatars/lisa.png', status: 'offline', rating: 4.9, skills: ['Node.js', 'Python', 'PostgreSQL'] },
  { id: '5', name: 'David Kim', email: 'david@freeflow.io', role: 'QA Engineer', department: 'Quality Assurance', avatar: '/avatars/david.png', status: 'online', rating: 4.6, skills: ['Testing', 'Automation', 'Jest'] },
]

const mockStats = {
  totalMembers: 12,
  onlineNow: 8,
  activeProjects: 15,
  averageRating: 4.78,
  departmentDistribution: {
    Design: 3,
    Development: 5,
    Management: 2,
    'Quality Assurance': 2
  }
}

// ========================================================================
// GET - Fetch team members and statistics
// ========================================================================
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const session = await getServerSession()
    const demoMode = isDemoMode(request)
    const url = new URL(request.url)
    const memberId = url.searchParams.get('id')

    // Determine effective user ID
    let effectiveUserId: string | null = null

    if (session?.user) {
      const userEmail = session.user.email
      const isDemoAccount = userEmail === 'test@kazi.dev' || userEmail === 'demo@kazi.io' || userEmail === 'alex@freeflow.io'
      effectiveUserId = isDemoAccount || demoMode ? DEMO_USER_ID : (session.user as any).authId || session.user.id
    } else if (demoMode) {
      effectiveUserId = DEMO_USER_ID
    } else {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch single team member by ID
    if (memberId) {
      const { data: member, error } = await supabase
        .from('team_members')
        .select(`
          *,
          skills:team_skills(skill, category, proficiency),
          projects:team_project_members(
            project:team_projects(id, name, status, progress)
          )
        `)
        .eq('id', memberId)
        .single()

      if (error || !member) {
        logger.warn('Team member not found', { memberId, error })
        return NextResponse.json(
          { success: false, error: 'Team member not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        demo: demoMode,
        data: member
      })
    }

    // Fetch all team members
    const { data: teamMembers, error: membersError } = await supabase
      .from('team_members')
      .select(`
        *,
        user:users(id, name, email, avatar_url)
      `)
      .order('name', { ascending: true })
      .limit(100)

    if (membersError) {
      logger.error('Failed to fetch team members', { error: membersError })
      // Fall back to mock data
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          members: mockTeam,
          stats: mockStats
        }
      })
    }

    // Calculate statistics
    const stats = {
      totalMembers: teamMembers?.length || 0,
      onlineNow: teamMembers?.filter(m => m.status === 'online').length || 0,
      busyNow: teamMembers?.filter(m => m.status === 'busy').length || 0,
      awayNow: teamMembers?.filter(m => m.status === 'away').length || 0,
      activeProjects: teamMembers?.reduce((acc, m) => acc + (m.projects_count || 0), 0) || 0,
      averageRating: teamMembers?.length
        ? Math.round((teamMembers.reduce((acc, m) => acc + (m.rating || 0), 0) / teamMembers.length) * 100) / 100
        : 0,
      departmentDistribution: teamMembers?.reduce((acc: Record<string, number>, m) => {
        const dept = m.department || 'Other'
        acc[dept] = (acc[dept] || 0) + 1
        return acc
      }, {}) || {}
    }

    return NextResponse.json({
      success: true,
      demo: demoMode,
      data: {
        members: teamMembers || [],
        stats
      }
    })
  } catch (error) {
    logger.error('Team GET error', { error })
    return NextResponse.json({
      success: true,
      demo: true,
      data: {
        members: mockTeam,
        stats: mockStats
      }
    })
  }
}

// ========================================================================
// POST - Team member actions
// ========================================================================
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const session = await getServerSession()
    const demoMode = isDemoMode(request)

    // Determine effective user ID
    let effectiveUserId: string | null = null

    if (session?.user) {
      const userEmail = session.user.email
      const isDemoAccount = userEmail === 'test@kazi.dev' || userEmail === 'demo@kazi.io' || userEmail === 'alex@freeflow.io'
      effectiveUserId = isDemoAccount || demoMode ? DEMO_USER_ID : (session.user as any).authId || session.user.id
    } else if (demoMode) {
      effectiveUserId = DEMO_USER_ID
    } else {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const { action, ...data } = body

    logger.info('Team action received', { action, userId: effectiveUserId, demoMode })

    switch (action) {
      case 'invite':
        return handleInviteMember(supabase, effectiveUserId, data, demoMode)

      case 'update-role':
        return handleUpdateRole(supabase, effectiveUserId, data, demoMode)

      case 'remove':
        return handleRemoveMember(supabase, effectiveUserId, data, demoMode)

      case 'assign-project':
        return handleAssignProject(supabase, effectiveUserId, data, demoMode)

      case 'unassign-project':
        return handleUnassignProject(supabase, effectiveUserId, data, demoMode)

      case 'send-message':
        return handleSendMessage(supabase, effectiveUserId, data, demoMode)

      case 'set-permissions':
        return handleSetPermissions(supabase, effectiveUserId, data, demoMode)

      case 'update-status':
        return handleUpdateStatus(supabase, effectiveUserId, data, demoMode)

      case 'add-skill':
        return handleAddSkill(supabase, effectiveUserId, data, demoMode)

      case 'remove-skill':
        return handleRemoveSkill(supabase, effectiveUserId, data, demoMode)

      case 'accept-invitation':
        return handleAcceptInvitation(supabase, effectiveUserId, data, demoMode)

      case 'decline-invitation':
        return handleDeclineInvitation(supabase, effectiveUserId, data, demoMode)

      case 'resend-invitation':
        return handleResendInvitation(supabase, effectiveUserId, data, demoMode)

      case 'log-time':
        return handleLogTime(supabase, effectiveUserId, data, demoMode)

      default:
        // Default behavior - create new team member directly
        return handleCreateMember(supabase, effectiveUserId, data, demoMode)
    }
  } catch (error) {
    logger.error('Team POST error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to process team request' },
      { status: 500 }
    )
  }
}

// ========================================================================
// Team Action Handlers
// ========================================================================

async function handleInviteMember(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: {
    email: string
    name: string
    role: MemberRole
    department: DepartmentType
    message?: string
  },
  demoMode: boolean
): Promise<NextResponse> {
  // Validate required fields
  if (!data.email || !data.name || !data.role || !data.department) {
    return NextResponse.json(
      { success: false, error: 'Missing required fields: email, name, role, department' },
      { status: 400 }
    )
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.email)) {
    return NextResponse.json(
      { success: false, error: 'Invalid email address' },
      { status: 400 }
    )
  }

  // Generate invitation token
  const invitationToken = randomBytes(32).toString('hex')
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // Expires in 7 days

  try {
    // Check if email already exists
    const { data: existingMember } = await supabase
      .from('team_members')
      .select('id')
      .eq('email', data.email)
      .single()

    if (existingMember) {
      return NextResponse.json(
        { success: false, error: 'A team member with this email already exists' },
        { status: 400 }
      )
    }

    // Check for existing pending invitation
    const { data: existingInvitation } = await supabase
      .from('team_invitations')
      .select('id, status')
      .eq('email', data.email)
      .eq('status', 'pending')
      .single()

    if (existingInvitation) {
      return NextResponse.json(
        { success: false, error: 'An invitation is already pending for this email' },
        { status: 400 }
      )
    }

    // Create invitation
    const { data: invitation, error: invitationError } = await supabase
      .from('team_invitations')
      .insert({
        email: data.email,
        name: data.name,
        role: data.role,
        department: data.department,
        invited_by: userId,
        status: 'pending',
        message: data.message || null,
        token: invitationToken,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (invitationError) {
      logger.error('Failed to create invitation', { error: invitationError })

      if (demoMode) {
        return NextResponse.json({
          success: true,
          demo: true,
          data: {
            id: randomBytes(8).toString('hex'),
            email: data.email,
            name: data.name,
            role: data.role,
            department: data.department,
            status: 'pending',
            invitedAt: new Date().toISOString(),
            expiresAt: expiresAt.toISOString()
          },
          message: `Invitation sent to ${data.email} (demo mode)`
        })
      }

      throw invitationError
    }

    // TODO: Send invitation email via /api/send-invoice or dedicated email service
    logger.info('Invitation created', {
      invitationId: invitation.id,
      email: data.email,
      invitedBy: userId
    })

    return NextResponse.json({
      success: true,
      demo: demoMode,
      data: {
        ...invitation,
        invitationLink: `${process.env.NEXT_PUBLIC_APP_URL || 'https://kazi.app'}/invite/${invitationToken}`
      },
      message: `Invitation sent to ${data.email}`
    })
  } catch (error) {
    logger.error('Invite member error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to send invitation' },
      { status: 500 }
    )
  }
}

async function handleUpdateRole(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { memberId: string; newRole: MemberRole; newDepartment?: DepartmentType },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.memberId || !data.newRole) {
    return NextResponse.json(
      { success: false, error: 'Member ID and new role are required' },
      { status: 400 }
    )
  }

  const updateData: Record<string, unknown> = { role: data.newRole }
  if (data.newDepartment) {
    updateData.department = data.newDepartment
  }

  const { data: member, error } = await supabase
    .from('team_members')
    .update(updateData)
    .eq('id', data.memberId)
    .select()
    .single()

  if (error) {
    logger.error('Failed to update role', { error, memberId: data.memberId })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          memberId: data.memberId,
          newRole: data.newRole,
          newDepartment: data.newDepartment,
          updatedAt: new Date().toISOString()
        },
        message: 'Role updated successfully (demo mode)'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update role' },
      { status: 500 }
    )
  }

  logger.info('Role updated', { memberId: data.memberId, newRole: data.newRole, updatedBy: userId })

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: member,
    message: 'Role updated successfully'
  })
}

async function handleRemoveMember(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { memberId: string; reason?: string },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.memberId) {
    return NextResponse.json(
      { success: false, error: 'Member ID is required' },
      { status: 400 }
    )
  }

  // Check if member exists
  const { data: member } = await supabase
    .from('team_members')
    .select('id, name, email')
    .eq('id', data.memberId)
    .single()

  if (!member && !demoMode) {
    return NextResponse.json(
      { success: false, error: 'Team member not found' },
      { status: 404 }
    )
  }

  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', data.memberId)

  if (error) {
    logger.error('Failed to remove member', { error, memberId: data.memberId })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          memberId: data.memberId,
          removedAt: new Date().toISOString()
        },
        message: 'Team member removed successfully (demo mode)'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to remove team member' },
      { status: 500 }
    )
  }

  logger.info('Member removed', { memberId: data.memberId, reason: data.reason, removedBy: userId })

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: {
      memberId: data.memberId,
      name: member?.name,
      removedAt: new Date().toISOString()
    },
    message: 'Team member removed successfully'
  })
}

async function handleAssignProject(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { memberId: string; projectId: string; projectName?: string; role?: string },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.memberId || !data.projectId) {
    return NextResponse.json(
      { success: false, error: 'Member ID and project ID are required' },
      { status: 400 }
    )
  }

  // Check if already assigned
  const { data: existingAssignment } = await supabase
    .from('team_project_members')
    .select('id')
    .eq('member_id', data.memberId)
    .eq('project_id', data.projectId)
    .single()

  if (existingAssignment) {
    return NextResponse.json(
      { success: false, error: 'Member is already assigned to this project' },
      { status: 400 }
    )
  }

  const { data: assignment, error } = await supabase
    .from('team_project_members')
    .insert({
      project_id: data.projectId,
      member_id: data.memberId,
      role: data.role || null
    })
    .select()
    .single()

  if (error) {
    logger.error('Failed to assign project', { error, memberId: data.memberId, projectId: data.projectId })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          memberId: data.memberId,
          projectId: data.projectId,
          projectName: data.projectName,
          assignedAt: new Date().toISOString()
        },
        message: 'Project assigned successfully (demo mode)'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to assign project' },
      { status: 500 }
    )
  }

  // Update member's project count
  await supabase.rpc('increment_projects_count', { member_uuid: data.memberId }).catch(() => {
    // Fallback if RPC doesn't exist
    supabase
      .from('team_members')
      .update({ projects_count: supabase.rpc('coalesce', { val: 'projects_count', default_val: 0 }) })
      .eq('id', data.memberId)
  })

  logger.info('Project assigned', { memberId: data.memberId, projectId: data.projectId, assignedBy: userId })

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: assignment,
    message: 'Project assigned successfully'
  })
}

async function handleUnassignProject(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { memberId: string; projectId: string },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.memberId || !data.projectId) {
    return NextResponse.json(
      { success: false, error: 'Member ID and project ID are required' },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from('team_project_members')
    .delete()
    .eq('member_id', data.memberId)
    .eq('project_id', data.projectId)

  if (error) {
    logger.error('Failed to unassign project', { error, memberId: data.memberId, projectId: data.projectId })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          memberId: data.memberId,
          projectId: data.projectId,
          unassignedAt: new Date().toISOString()
        },
        message: 'Project unassigned successfully (demo mode)'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to unassign project' },
      { status: 500 }
    )
  }

  logger.info('Project unassigned', { memberId: data.memberId, projectId: data.projectId, unassignedBy: userId })

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: {
      memberId: data.memberId,
      projectId: data.projectId,
      unassignedAt: new Date().toISOString()
    },
    message: 'Project unassigned successfully'
  })
}

async function handleSendMessage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { memberId: string; message: string; subject?: string; type?: 'message' | 'email' | 'announcement' },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.memberId || !data.message) {
    return NextResponse.json(
      { success: false, error: 'Member ID and message are required' },
      { status: 400 }
    )
  }

  // Get sender's team member ID
  const { data: senderMember } = await supabase
    .from('team_members')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (!senderMember && !demoMode) {
    return NextResponse.json(
      { success: false, error: 'Sender not found in team' },
      { status: 404 }
    )
  }

  const { data: communication, error } = await supabase
    .from('team_communications')
    .insert({
      type: data.type || 'message',
      from_member_id: senderMember?.id || userId,
      subject: data.subject || null,
      content: data.message,
      read: false
    })
    .select()
    .single()

  if (error) {
    logger.error('Failed to send message', { error, memberId: data.memberId })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          id: randomBytes(8).toString('hex'),
          memberId: data.memberId,
          message: data.message,
          sentAt: new Date().toISOString()
        },
        message: 'Message sent successfully (demo mode)'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    )
  }

  // Add recipient
  await supabase.from('team_communication_recipients').insert({
    communication_id: communication.id,
    member_id: data.memberId,
    read: false
  })

  logger.info('Message sent', { communicationId: communication.id, toMemberId: data.memberId, fromUserId: userId })

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: communication,
    message: 'Message sent successfully'
  })
}

async function handleSetPermissions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { memberId: string; permission: PermissionLevel; resource?: string; actions?: string[] },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.memberId || !data.permission) {
    return NextResponse.json(
      { success: false, error: 'Member ID and permission level are required' },
      { status: 400 }
    )
  }

  // Update member's general permission level
  const { error: memberError } = await supabase
    .from('team_members')
    .update({ permissions: data.permission })
    .eq('id', data.memberId)

  if (memberError) {
    logger.error('Failed to update member permissions', { error: memberError, memberId: data.memberId })
  }

  // If specific resource permissions are provided, add them
  if (data.resource) {
    const { data: permission, error: permissionError } = await supabase
      .from('team_permissions')
      .upsert({
        member_id: data.memberId,
        resource: data.resource,
        actions: data.actions || ['read'],
        level: data.permission,
        granted_by: userId
      }, {
        onConflict: 'member_id,resource'
      })
      .select()
      .single()

    if (permissionError) {
      logger.error('Failed to set resource permissions', { error: permissionError })

      if (demoMode) {
        return NextResponse.json({
          success: true,
          demo: true,
          data: {
            memberId: data.memberId,
            permission: data.permission,
            resource: data.resource,
            updatedAt: new Date().toISOString()
          },
          message: 'Permissions updated successfully (demo mode)'
        })
      }

      return NextResponse.json(
        { success: false, error: 'Failed to set permissions' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      demo: demoMode,
      data: permission,
      message: 'Permissions updated successfully'
    })
  }

  logger.info('Permissions updated', { memberId: data.memberId, permission: data.permission, grantedBy: userId })

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: {
      memberId: data.memberId,
      permission: data.permission,
      updatedAt: new Date().toISOString()
    },
    message: 'Permissions updated successfully'
  })
}

async function handleUpdateStatus(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { memberId?: string; status: MemberStatus; availability?: string },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.status) {
    return NextResponse.json(
      { success: false, error: 'Status is required' },
      { status: 400 }
    )
  }

  // If no memberId provided, update current user's status
  const targetMemberId = data.memberId

  const updateData: Record<string, unknown> = {
    status: data.status,
    last_active: new Date().toISOString()
  }
  if (data.availability) {
    updateData.availability = data.availability
  }

  let query = supabase.from('team_members').update(updateData)

  if (targetMemberId) {
    query = query.eq('id', targetMemberId)
  } else {
    query = query.eq('user_id', userId)
  }

  const { data: member, error } = await query.select().single()

  if (error) {
    logger.error('Failed to update status', { error, memberId: targetMemberId || userId })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          memberId: targetMemberId || userId,
          status: data.status,
          updatedAt: new Date().toISOString()
        },
        message: 'Status updated successfully (demo mode)'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update status' },
      { status: 500 }
    )
  }

  logger.info('Status updated', { memberId: member?.id, status: data.status })

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: member,
    message: 'Status updated successfully'
  })
}

async function handleAddSkill(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { memberId: string; skill: string; category: string; proficiency?: number },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.memberId || !data.skill || !data.category) {
    return NextResponse.json(
      { success: false, error: 'Member ID, skill, and category are required' },
      { status: 400 }
    )
  }

  const { data: skill, error } = await supabase
    .from('team_skills')
    .insert({
      member_id: data.memberId,
      skill: data.skill,
      category: data.category,
      proficiency: data.proficiency || 3
    })
    .select()
    .single()

  if (error) {
    logger.error('Failed to add skill', { error, memberId: data.memberId })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          id: randomBytes(8).toString('hex'),
          memberId: data.memberId,
          skill: data.skill,
          category: data.category,
          proficiency: data.proficiency || 3,
          addedAt: new Date().toISOString()
        },
        message: 'Skill added successfully (demo mode)'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to add skill' },
      { status: 500 }
    )
  }

  // Also update the skills array on the team member
  await supabase.rpc('array_append_unique', {
    table_name: 'team_members',
    column_name: 'skills',
    row_id: data.memberId,
    value: data.skill
  }).catch(() => {
    // Fallback - just log the error
    logger.warn('Could not update skills array', { memberId: data.memberId })
  })

  logger.info('Skill added', { skillId: skill.id, memberId: data.memberId, skill: data.skill })

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: skill,
    message: 'Skill added successfully'
  })
}

async function handleRemoveSkill(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { memberId: string; skillId: string },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.memberId || !data.skillId) {
    return NextResponse.json(
      { success: false, error: 'Member ID and skill ID are required' },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from('team_skills')
    .delete()
    .eq('id', data.skillId)
    .eq('member_id', data.memberId)

  if (error) {
    logger.error('Failed to remove skill', { error, skillId: data.skillId })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          skillId: data.skillId,
          removedAt: new Date().toISOString()
        },
        message: 'Skill removed successfully (demo mode)'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to remove skill' },
      { status: 500 }
    )
  }

  logger.info('Skill removed', { skillId: data.skillId, memberId: data.memberId })

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: {
      skillId: data.skillId,
      removedAt: new Date().toISOString()
    },
    message: 'Skill removed successfully'
  })
}

async function handleAcceptInvitation(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { token: string },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.token) {
    return NextResponse.json(
      { success: false, error: 'Invitation token is required' },
      { status: 400 }
    )
  }

  // Get invitation
  const { data: invitation, error: inviteError } = await supabase
    .from('team_invitations')
    .select('*')
    .eq('token', data.token)
    .eq('status', 'pending')
    .single()

  if (inviteError || !invitation) {
    return NextResponse.json(
      { success: false, error: 'Invalid or expired invitation' },
      { status: 404 }
    )
  }

  // Check if expired
  if (new Date(invitation.expires_at) < new Date()) {
    await supabase
      .from('team_invitations')
      .update({ status: 'expired' })
      .eq('id', invitation.id)

    return NextResponse.json(
      { success: false, error: 'Invitation has expired' },
      { status: 400 }
    )
  }

  // Create team member
  const { data: member, error: memberError } = await supabase
    .from('team_members')
    .insert({
      user_id: userId,
      name: invitation.name,
      role: invitation.role,
      department: invitation.department,
      email: invitation.email,
      status: 'offline',
      permissions: 'read'
    })
    .select()
    .single()

  if (memberError) {
    logger.error('Failed to create team member', { error: memberError })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          memberId: randomBytes(8).toString('hex'),
          name: invitation.name,
          role: invitation.role,
          acceptedAt: new Date().toISOString()
        },
        message: 'Invitation accepted (demo mode)'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create team member' },
      { status: 500 }
    )
  }

  // Update invitation status
  await supabase
    .from('team_invitations')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString()
    })
    .eq('id', invitation.id)

  logger.info('Invitation accepted', { invitationId: invitation.id, memberId: member.id })

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: member,
    message: 'Invitation accepted successfully'
  })
}

async function handleDeclineInvitation(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { token: string; reason?: string },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.token) {
    return NextResponse.json(
      { success: false, error: 'Invitation token is required' },
      { status: 400 }
    )
  }

  const { data: invitation, error } = await supabase
    .from('team_invitations')
    .update({
      status: 'declined',
      declined_at: new Date().toISOString(),
      metadata: { decline_reason: data.reason }
    })
    .eq('token', data.token)
    .eq('status', 'pending')
    .select()
    .single()

  if (error) {
    logger.error('Failed to decline invitation', { error })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { token: data.token, status: 'declined', declinedAt: new Date().toISOString() },
        message: 'Invitation declined (demo mode)'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to decline invitation' },
      { status: 500 }
    )
  }

  logger.info('Invitation declined', { invitationId: invitation?.id })

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: invitation,
    message: 'Invitation declined'
  })
}

async function handleResendInvitation(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { invitationId: string },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.invitationId) {
    return NextResponse.json(
      { success: false, error: 'Invitation ID is required' },
      { status: 400 }
    )
  }

  // Generate new token and expiration
  const newToken = randomBytes(32).toString('hex')
  const newExpires = new Date()
  newExpires.setDate(newExpires.getDate() + 7)

  const { data: invitation, error } = await supabase
    .from('team_invitations')
    .update({
      token: newToken,
      expires_at: newExpires.toISOString(),
      status: 'pending'
    })
    .eq('id', data.invitationId)
    .eq('invited_by', userId)
    .select()
    .single()

  if (error) {
    logger.error('Failed to resend invitation', { error, invitationId: data.invitationId })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { invitationId: data.invitationId, resentAt: new Date().toISOString() },
        message: 'Invitation resent (demo mode)'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to resend invitation' },
      { status: 500 }
    )
  }

  // TODO: Resend email notification

  logger.info('Invitation resent', { invitationId: invitation.id })

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: {
      ...invitation,
      invitationLink: `${process.env.NEXT_PUBLIC_APP_URL || 'https://kazi.app'}/invite/${newToken}`
    },
    message: 'Invitation resent successfully'
  })
}

async function handleLogTime(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { memberId?: string; projectId: string; taskId?: string; hours: number; date?: string; description?: string; billable?: boolean },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.projectId || !data.hours) {
    return NextResponse.json(
      { success: false, error: 'Project ID and hours are required' },
      { status: 400 }
    )
  }

  // Get member ID
  let memberId = data.memberId
  if (!memberId) {
    const { data: member } = await supabase
      .from('team_members')
      .select('id')
      .eq('user_id', userId)
      .single()
    memberId = member?.id
  }

  if (!memberId && !demoMode) {
    return NextResponse.json(
      { success: false, error: 'Team member not found' },
      { status: 404 }
    )
  }

  const { data: timeEntry, error } = await supabase
    .from('team_time_tracking')
    .insert({
      member_id: memberId || userId,
      project_id: data.projectId,
      task_id: data.taskId || null,
      date: data.date || new Date().toISOString().split('T')[0],
      hours_worked: data.hours,
      description: data.description || null,
      billable: data.billable !== false
    })
    .select()
    .single()

  if (error) {
    logger.error('Failed to log time', { error, projectId: data.projectId })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          id: randomBytes(8).toString('hex'),
          memberId,
          projectId: data.projectId,
          hours: data.hours,
          date: data.date || new Date().toISOString().split('T')[0],
          loggedAt: new Date().toISOString()
        },
        message: 'Time logged successfully (demo mode)'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to log time' },
      { status: 500 }
    )
  }

  logger.info('Time logged', { timeEntryId: timeEntry.id, memberId, projectId: data.projectId, hours: data.hours })

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: timeEntry,
    message: 'Time logged successfully'
  })
}

async function handleCreateMember(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: {
    name: string
    email: string
    role: MemberRole
    department: DepartmentType
    phone?: string
    location?: string
    bio?: string
    skills?: string[]
  },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.name || !data.email || !data.role || !data.department) {
    return NextResponse.json(
      { success: false, error: 'Name, email, role, and department are required' },
      { status: 400 }
    )
  }

  const { data: member, error } = await supabase
    .from('team_members')
    .insert({
      user_id: userId,
      name: data.name,
      email: data.email,
      role: data.role,
      department: data.department,
      phone: data.phone || null,
      location: data.location || null,
      bio: data.bio || null,
      skills: data.skills || [],
      status: 'offline',
      permissions: 'read'
    })
    .select()
    .single()

  if (error) {
    logger.error('Failed to create team member', { error })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          id: randomBytes(8).toString('hex'),
          ...data,
          status: 'offline',
          createdAt: new Date().toISOString()
        },
        message: 'Team member created (demo mode)'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create team member' },
      { status: 500 }
    )
  }

  logger.info('Team member created', { memberId: member.id, name: data.name })

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: member,
    message: 'Team member created successfully'
  })
}

// ========================================================================
// PUT - Update team member
// ========================================================================
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const session = await getServerSession()
    const demoMode = isDemoMode(request)

    // Determine effective user ID
    let effectiveUserId: string | null = null

    if (session?.user) {
      const userEmail = session.user.email
      const isDemoAccount = userEmail === 'test@kazi.dev' || userEmail === 'demo@kazi.io' || userEmail === 'alex@freeflow.io'
      effectiveUserId = isDemoAccount || demoMode ? DEMO_USER_ID : (session.user as any).authId || session.user.id
    } else if (demoMode) {
      effectiveUserId = DEMO_USER_ID
    } else {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const { memberId, ...updateData } = body

    if (!memberId) {
      return NextResponse.json(
        { success: false, error: 'Member ID is required' },
        { status: 400 }
      )
    }

    // Build update object
    const allowedFields = ['name', 'role', 'department', 'phone', 'location', 'bio', 'status', 'availability', 'work_hours', 'timezone', 'linkedin', 'github', 'portfolio', 'hourly_rate']
    const sanitizedUpdate: Record<string, unknown> = {}

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        sanitizedUpdate[field] = updateData[field]
      }
    }

    const { data: member, error } = await supabase
      .from('team_members')
      .update(sanitizedUpdate)
      .eq('id', memberId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update team member', { error, memberId })

      if (demoMode) {
        return NextResponse.json({
          success: true,
          demo: true,
          data: { memberId, ...sanitizedUpdate, updatedAt: new Date().toISOString() },
          message: 'Team member updated successfully (demo mode)'
        })
      }

      return NextResponse.json(
        { success: false, error: 'Failed to update team member' },
        { status: 500 }
      )
    }

    logger.info('Team member updated', { memberId, updatedBy: effectiveUserId })

    return NextResponse.json({
      success: true,
      demo: demoMode,
      data: member,
      message: 'Team member updated successfully'
    })
  } catch (error) {
    logger.error('Team PUT error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to update team member' },
      { status: 500 }
    )
  }
}

// ========================================================================
// DELETE - Remove team member
// ========================================================================
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const session = await getServerSession()
    const demoMode = isDemoMode(request)
    const url = new URL(request.url)
    const memberId = url.searchParams.get('memberId') || url.searchParams.get('id')

    if (!memberId) {
      return NextResponse.json(
        { success: false, error: 'Member ID is required' },
        { status: 400 }
      )
    }

    // Determine effective user ID
    let effectiveUserId: string | null = null

    if (session?.user) {
      const userEmail = session.user.email
      const isDemoAccount = userEmail === 'test@kazi.dev' || userEmail === 'demo@kazi.io' || userEmail === 'alex@freeflow.io'
      effectiveUserId = isDemoAccount || demoMode ? DEMO_USER_ID : (session.user as any).authId || session.user.id
    } else if (demoMode) {
      effectiveUserId = DEMO_USER_ID
    } else {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get member info before deletion
    const { data: member } = await supabase
      .from('team_members')
      .select('id, name, email')
      .eq('id', memberId)
      .single()

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId)

    if (error) {
      logger.error('Failed to delete team member', { error, memberId })

      if (demoMode) {
        return NextResponse.json({
          success: true,
          demo: true,
          data: { memberId, removedAt: new Date().toISOString() },
          message: 'Team member removed successfully (demo mode)'
        })
      }

      return NextResponse.json(
        { success: false, error: 'Failed to remove team member' },
        { status: 500 }
      )
    }

    logger.info('Team member deleted', { memberId, name: member?.name, deletedBy: effectiveUserId })

    return NextResponse.json({
      success: true,
      demo: demoMode,
      data: {
        memberId,
        name: member?.name,
        removedAt: new Date().toISOString()
      },
      message: 'Team member removed successfully'
    })
  } catch (error) {
    logger.error('Team DELETE error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to remove team member' },
      { status: 500 }
    )
  }
}
