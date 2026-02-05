import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('projects')
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
 * Project Access API
 *
 * Manages project access control:
 * - User permissions (owner, editor, viewer, client)
 * - Team access
 * - Client portal access
 * - Public/private visibility
 * - Access tokens for API/embed access
 */

const GrantAccessSchema = z.object({
  userId: z.string().uuid().optional(),
  email: z.string().email().optional(),
  teamId: z.string().uuid().optional(),
  role: z.enum(['owner', 'admin', 'editor', 'viewer', 'client']),
  expiresAt: z.string().optional(),
  permissions: z.array(z.string()).optional(),
})

const UpdateAccessSchema = z.object({
  accessId: z.string().uuid(),
  role: z.enum(['owner', 'admin', 'editor', 'viewer', 'client']).optional(),
  permissions: z.array(z.string()).optional(),
  expiresAt: z.string().optional(),
})

const AccessTokenSchema = z.object({
  name: z.string().min(1).max(100),
  permissions: z.array(z.string()),
  expiresAt: z.string().optional(),
})

// Demo access data
const demoAccess = [
  {
    id: 'access-001',
    user_id: 'user-001',
    role: 'owner',
    permissions: ['*'],
    created_at: '2026-01-01T00:00:00Z',
    user: { name: 'Alex Johnson', email: 'alex@example.com', avatar: '/avatars/alex.jpg' },
  },
  {
    id: 'access-002',
    user_id: 'user-002',
    role: 'editor',
    permissions: ['read', 'write', 'comment'],
    created_at: '2026-01-15T10:00:00Z',
    user: { name: 'Sarah Chen', email: 'sarah@example.com', avatar: '/avatars/sarah.jpg' },
  },
  {
    id: 'access-003',
    user_id: 'client-001',
    role: 'client',
    permissions: ['read', 'comment', 'approve'],
    created_at: '2026-01-20T14:00:00Z',
    user: { name: 'John Smith', email: 'john@techstart.com', avatar: null },
  },
  {
    id: 'access-004',
    team_id: 'team-001',
    role: 'viewer',
    permissions: ['read'],
    created_at: '2026-01-22T09:00:00Z',
    team: { name: 'Design Team', member_count: 5 },
  },
]

const demoTokens = [
  {
    id: 'token-001',
    name: 'API Access',
    permissions: ['read', 'write'],
    last_used: '2026-01-29T08:00:00Z',
    expires_at: '2026-06-01T00:00:00Z',
    created_at: '2026-01-15T00:00:00Z',
  },
  {
    id: 'token-002',
    name: 'Embed Token',
    permissions: ['read'],
    last_used: '2026-01-28T16:30:00Z',
    expires_at: null,
    created_at: '2026-01-20T00:00:00Z',
  },
]

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { searchParams } = new URL(request.url)
    const view = searchParams.get('view') || 'access' // access | tokens | summary

    // Demo mode
    if (!user) {
      if (view === 'tokens') {
        return NextResponse.json({
          success: true,
          demo: true,
          data: demoTokens,
        })
      }

      if (view === 'summary') {
        return NextResponse.json({
          success: true,
          demo: true,
          data: {
            totalAccess: demoAccess.length,
            byRole: {
              owner: 1,
              editor: 1,
              viewer: 1,
              client: 1,
            },
            visibility: 'private',
            clientPortalEnabled: true,
            activeTokens: demoTokens.length,
          },
        })
      }

      return NextResponse.json({
        success: true,
        demo: true,
        data: demoAccess,
      })
    }

    // Get project
    const { data: project } = await supabase
      .from('projects')
      .select('id, owner_id, visibility, settings')
      .or(`slug.eq.${slug},id.eq.${slug}`)
      .single()

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }

    // Check if user has access to view permissions
    const hasAccess = project.owner_id === user.id || await checkProjectAccess(supabase, project.id, user.id, ['admin', 'owner'])

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    if (view === 'tokens') {
      const { data: tokens } = await supabase
        .from('project_access_tokens')
        .select('id, name, permissions, last_used_at, expires_at, created_at')
        .eq('project_id', project.id)
        .order('created_at', { ascending: false })

      return NextResponse.json({
        success: true,
        data: tokens,
      })
    }

    if (view === 'summary') {
      const { data: access } = await supabase
        .from('project_access')
        .select('role')
        .eq('project_id', project.id)

      const { data: tokens } = await supabase
        .from('project_access_tokens')
        .select('id')
        .eq('project_id', project.id)

      const byRole: Record<string, number> = {}
      access?.forEach(a => {
        byRole[a.role] = (byRole[a.role] || 0) + 1
      })

      return NextResponse.json({
        success: true,
        data: {
          totalAccess: access?.length || 0,
          byRole,
          visibility: project.visibility || 'private',
          clientPortalEnabled: project.settings?.clientPortalEnabled || false,
          activeTokens: tokens?.length || 0,
        },
      })
    }

    // Default: access list
    const { data: access } = await supabase
      .from('project_access')
      .select(`
        *,
        user:profiles!user_id(id, full_name, email, avatar_url),
        team:teams!team_id(id, name)
      `)
      .eq('project_id', project.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      success: true,
      data: access,
    })
  } catch (error) {
    logger.error('Project access GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project access' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const { action = 'grant', ...data } = body

    // Demo mode
    if (!user) {
      switch (action) {
        case 'grant':
          return NextResponse.json({
            success: true,
            demo: true,
            message: 'Access granted (demo mode)',
            data: {
              id: `access-demo-${Date.now()}`,
              ...data,
              created_at: new Date().toISOString(),
            },
          })
        case 'update':
          return NextResponse.json({
            success: true,
            demo: true,
            message: 'Access updated (demo mode)',
          })
        case 'revoke':
          return NextResponse.json({
            success: true,
            demo: true,
            message: 'Access revoked (demo mode)',
          })
        case 'create_token':
          return NextResponse.json({
            success: true,
            demo: true,
            message: 'Token created (demo mode)',
            data: {
              id: `token-demo-${Date.now()}`,
              token: 'demo_token_xxxxxxxxxxxxx',
              ...data,
            },
          })
        case 'revoke_token':
          return NextResponse.json({
            success: true,
            demo: true,
            message: 'Token revoked (demo mode)',
          })
        default:
          return NextResponse.json({
            success: false,
            demo: true,
            error: 'Unknown action',
          }, { status: 400 })
      }
    }

    // Get project
    const { data: project } = await supabase
      .from('projects')
      .select('id, owner_id')
      .or(`slug.eq.${slug},id.eq.${slug}`)
      .single()

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }

    // Check admin access
    const hasAccess = project.owner_id === user.id || await checkProjectAccess(supabase, project.id, user.id, ['admin', 'owner'])

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    switch (action) {
      case 'grant': {
        const validated = GrantAccessSchema.parse(data)

        if (!validated.userId && !validated.email && !validated.teamId) {
          return NextResponse.json(
            { success: false, error: 'Must specify userId, email, or teamId' },
            { status: 400 }
          )
        }

        let targetUserId = validated.userId

        // If email provided, look up or invite user
        if (validated.email && !targetUserId) {
          const { data: existingUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', validated.email)
            .single()

          if (existingUser) {
            targetUserId = existingUser.id
          } else {
            // Create invite
            const { data: invite, error } = await supabase
              .from('project_invites')
              .insert({
                project_id: project.id,
                email: validated.email,
                role: validated.role,
                permissions: validated.permissions,
                invited_by: user.id,
                expires_at: validated.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              })
              .select()
              .single()

            if (error) throw error

            // Send project invitation email
            const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://kazi.app'}/projects/${project.slug}/join`

            try {
              await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/notifications/email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'project_update',
                  data: {
                    recipientEmail: validated.email,
                    recipientName: validated.email.split('@')[0],
                    projectName: project.name || project.title || 'Project',
                    updateType: 'invitation',
                    message: `You've been invited to join this project as a ${validated.role}.`,
                    actionUrl: invitationLink,
                    actionText: 'View Project'
                  }
                })
              })
              logger.info('Project invitation email sent', { email: validated.email, projectId: project.id })
            } catch (emailError) {
              logger.warn('Failed to send project invitation email', { error: emailError, email: validated.email })
            }

            return NextResponse.json({
              success: true,
              message: 'Invitation sent',
              data: invite,
            })
          }
        }

        // Grant access
        const { data: access, error } = await supabase
          .from('project_access')
          .insert({
            project_id: project.id,
            user_id: targetUserId,
            team_id: validated.teamId,
            role: validated.role,
            permissions: validated.permissions || getDefaultPermissions(validated.role),
            expires_at: validated.expiresAt,
            granted_by: user.id,
          })
          .select()
          .single()

        if (error) throw error

        // Notify user
        if (targetUserId) {
          await supabase.from('notifications').insert({
            user_id: targetUserId,
            type: 'project_access_granted',
            title: 'Project access granted',
            message: `You've been granted ${validated.role} access to a project`,
            data: { projectId: project.id, role: validated.role },
          })
        }

        return NextResponse.json({
          success: true,
          message: 'Access granted successfully',
          data: access,
        })
      }

      case 'update': {
        const validated = UpdateAccessSchema.parse(data)

        const updateData: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        }
        if (validated.role) updateData.role = validated.role
        if (validated.permissions) updateData.permissions = validated.permissions
        if (validated.expiresAt) updateData.expires_at = validated.expiresAt

        const { data: access, error } = await supabase
          .from('project_access')
          .update(updateData)
          .eq('id', validated.accessId)
          .eq('project_id', project.id)
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({
          success: true,
          message: 'Access updated successfully',
          data: access,
        })
      }

      case 'revoke': {
        const { accessId, userId, teamId } = data

        let query = supabase
          .from('project_access')
          .delete()
          .eq('project_id', project.id)

        if (accessId) {
          query = query.eq('id', accessId)
        } else if (userId) {
          query = query.eq('user_id', userId)
        } else if (teamId) {
          query = query.eq('team_id', teamId)
        } else {
          return NextResponse.json(
            { success: false, error: 'Must specify accessId, userId, or teamId' },
            { status: 400 }
          )
        }

        const { error } = await query

        if (error) throw error

        return NextResponse.json({
          success: true,
          message: 'Access revoked successfully',
        })
      }

      case 'create_token': {
        const validated = AccessTokenSchema.parse(data)

        // Generate secure token
        const token = generateSecureToken()

        const { data: accessToken, error } = await supabase
          .from('project_access_tokens')
          .insert({
            project_id: project.id,
            name: validated.name,
            token_hash: await hashToken(token),
            permissions: validated.permissions,
            expires_at: validated.expiresAt,
            created_by: user.id,
          })
          .select('id, name, permissions, expires_at, created_at')
          .single()

        if (error) throw error

        return NextResponse.json({
          success: true,
          message: 'Access token created',
          data: {
            ...accessToken,
            token, // Only returned on creation
          },
        })
      }

      case 'revoke_token': {
        const { tokenId } = data

        if (!tokenId) {
          return NextResponse.json(
            { success: false, error: 'Token ID required' },
            { status: 400 }
          )
        }

        const { error } = await supabase
          .from('project_access_tokens')
          .delete()
          .eq('id', tokenId)
          .eq('project_id', project.id)

        if (error) throw error

        return NextResponse.json({
          success: true,
          message: 'Token revoked successfully',
        })
      }

      case 'update_visibility': {
        const { visibility } = data

        if (!['private', 'public', 'unlisted'].includes(visibility)) {
          return NextResponse.json(
            { success: false, error: 'Invalid visibility setting' },
            { status: 400 }
          )
        }

        const { error } = await supabase
          .from('projects')
          .update({ visibility })
          .eq('id', project.id)

        if (error) throw error

        return NextResponse.json({
          success: true,
          message: `Project visibility set to ${visibility}`,
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
    logger.error('Project access POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process access request' },
      { status: 500 }
    )
  }
}

async function checkProjectAccess(
  supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never,
  projectId: string,
  userId: string,
  allowedRoles: string[]
): Promise<boolean> {
  const { data } = await supabase
    .from('project_access')
    .select('role')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .single()

  return data ? allowedRoles.includes(data.role) : false
}

function getDefaultPermissions(role: string): string[] {
  switch (role) {
    case 'owner':
    case 'admin':
      return ['*']
    case 'editor':
      return ['read', 'write', 'comment', 'upload']
    case 'viewer':
      return ['read', 'comment']
    case 'client':
      return ['read', 'comment', 'approve', 'download']
    default:
      return ['read']
  }
}

function generateSecureToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = 'kazi_'
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(token)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
