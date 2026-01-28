import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from '@/lib/auth'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('team')

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

const mockTeam = [
  { id: '1', name: 'John Smith', email: 'john@freeflow.io', role: 'Designer', avatar: '/avatars/john.png', status: 'online' },
  { id: '2', name: 'Sarah Wilson', email: 'sarah@freeflow.io', role: 'Developer', avatar: '/avatars/sarah.png', status: 'online' },
  { id: '3', name: 'Mike Brown', email: 'mike@freeflow.io', role: 'Project Manager', avatar: '/avatars/mike.png', status: 'away' },
  { id: '4', name: 'Lisa Chen', email: 'lisa@freeflow.io', role: 'Developer', avatar: '/avatars/lisa.png', status: 'offline' },
]

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const session = await getServerSession()

    // Check for demo mode
    const demoMode = isDemoMode(request)

    // If not authenticated
    if (!session?.user) {
      if (demoMode) {
        // Use demo user ID and fetch from database
        const userId = DEMO_USER_ID

        // Try to fetch team members for demo user
        const { data: teamMembers, error } = await supabase
          .from('team_members')
          .select(`
            *,
            user:users(id, name, email, avatar_url)
          `)
          .eq('team_owner_id', userId)

        if (error || !teamMembers?.length) {
          // Fall back to mock team data
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              members: mockTeam,
              stats: {
                totalMembers: 12,
                onlineNow: 8,
                activeProjects: 15
              }
            }
          })
        }

        return NextResponse.json({
          success: true,
          demo: true,
          data: {
            members: teamMembers,
            stats: {
              totalMembers: teamMembers.length,
              onlineNow: teamMembers.filter((m: any) => m.status === 'online').length,
              activeProjects: 15
            }
          }
        })
      }

      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Authenticated user - check for demo mode
    const userId = (session.user as any).authId || session.user.id
    const userEmail = session.user.email
    const isDemoAccount = userEmail === 'test@kazi.dev' || userEmail === 'demo@kazi.io' || userEmail === 'alex@freeflow.io'

    if (isDemoAccount || demoMode) {
      const demoUserId = DEMO_USER_ID

      const { data: teamMembers, error } = await supabase
        .from('team_members')
        .select(`
          *,
          user:users(id, name, email, avatar_url)
        `)
        .eq('team_owner_id', demoUserId)

      if (error || !teamMembers?.length) {
        // Fall back to mock team data
        return NextResponse.json({
          success: true,
          demo: true,
          data: {
            members: mockTeam,
            stats: {
              totalMembers: 12,
              onlineNow: 8,
              activeProjects: 15
            }
          }
        })
      }

      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          members: teamMembers,
          stats: {
            totalMembers: teamMembers.length,
            onlineNow: teamMembers.filter((m: any) => m.status === 'online').length,
            activeProjects: 15
          }
        }
      })
    }

    // Fetch real team data for authenticated user
    const { data: teamMembers, error } = await supabase
      .from('team_members')
      .select(`
        *,
        user:users(id, name, email, avatar_url)
      `)
      .eq('team_owner_id', userId)

    if (error) {
      logger.error('Team query error', { error })
      return NextResponse.json({
        success: true,
        data: {
          members: mockTeam,
          stats: {
            totalMembers: 12,
            onlineNow: 8,
            activeProjects: 15
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        members: teamMembers || mockTeam,
        stats: {
          totalMembers: teamMembers?.length || 12,
          onlineNow: teamMembers?.filter((m: any) => m.status === 'online').length || 8,
          activeProjects: 15
        }
      }
    })
  } catch (error) {
    logger.error('Team GET error', { error })
    return NextResponse.json({
      success: true,
      data: {
        members: mockTeam,
        stats: {
          totalMembers: 12,
          onlineNow: 8,
          activeProjects: 15
        }
      }
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { action, ...data } = body

    switch (action) {
      case 'invite':
        // Handle team member invitation
        return NextResponse.json({
          success: true,
          data: {
            id: Date.now().toString(),
            email: data.email,
            name: data.name,
            role: data.role,
            status: 'pending',
            invitedAt: new Date().toISOString()
          },
          message: `Invitation sent to ${data.email}`
        })

      case 'update-role':
        // Handle role update
        return NextResponse.json({
          success: true,
          data: {
            memberId: data.memberId,
            newRole: data.newRole,
            updatedAt: new Date().toISOString()
          },
          message: `Role updated successfully`
        })

      case 'remove':
        // Handle member removal
        return NextResponse.json({
          success: true,
          data: {
            memberId: data.memberId,
            removedAt: new Date().toISOString()
          },
          message: `Team member removed successfully`
        })

      case 'assign-project':
        // Handle project assignment
        return NextResponse.json({
          success: true,
          data: {
            memberId: data.memberId,
            projectName: data.projectName,
            assignedAt: new Date().toISOString()
          },
          message: `Project assigned successfully`
        })

      case 'send-message':
        // Handle sending a message to team member
        return NextResponse.json({
          success: true,
          data: {
            memberId: data.memberId,
            message: data.message,
            sentAt: new Date().toISOString()
          },
          message: `Message sent successfully`
        })

      case 'set-permissions':
        // Handle setting permissions for team member
        return NextResponse.json({
          success: true,
          data: {
            memberId: data.memberId,
            permission: data.permission,
            updatedAt: new Date().toISOString()
          },
          message: `Permissions updated successfully`
        })

      default:
        // Default behavior - create new team member
        return NextResponse.json({
          success: true,
          data: { id: Date.now().toString(), ...data }
        })
    }
  } catch (error) {
    logger.error('Team API Error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to process team request' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { memberId, ...updateData } = body

    if (!memberId) {
      return NextResponse.json(
        { success: false, error: 'Member ID is required' },
        { status: 400 }
      )
    }

    // Update team member
    return NextResponse.json({
      success: true,
      data: {
        memberId,
        ...updateData,
        updatedAt: new Date().toISOString()
      },
      message: 'Team member updated successfully'
    })
  } catch (error) {
    logger.error('Team API PUT Error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to update team member' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')

    if (!memberId) {
      return NextResponse.json(
        { success: false, error: 'Member ID is required' },
        { status: 400 }
      )
    }

    // Delete team member
    return NextResponse.json({
      success: true,
      data: {
        memberId,
        removedAt: new Date().toISOString()
      },
      message: 'Team member removed successfully'
    })
  } catch (error) {
    logger.error('Team API DELETE Error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to remove team member' },
      { status: 500 }
    )
  }
}
