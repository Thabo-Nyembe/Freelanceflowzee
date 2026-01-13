import { NextRequest, NextResponse } from 'next/server'

const mockTeam = [
  { id: '1', name: 'John Smith', email: 'john@freeflow.io', role: 'Designer', avatar: '/avatars/john.png', status: 'online' },
  { id: '2', name: 'Sarah Wilson', email: 'sarah@freeflow.io', role: 'Developer', avatar: '/avatars/sarah.png', status: 'online' },
  { id: '3', name: 'Mike Brown', email: 'mike@freeflow.io', role: 'Project Manager', avatar: '/avatars/mike.png', status: 'away' },
  { id: '4', name: 'Lisa Chen', email: 'lisa@freeflow.io', role: 'Developer', avatar: '/avatars/lisa.png', status: 'offline' },
]

export async function GET() {
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
    console.error('Team API Error:', error)
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
    console.error('Team API PUT Error:', error)
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
    console.error('Team API DELETE Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to remove team member' },
      { status: 500 }
    )
  }
}
