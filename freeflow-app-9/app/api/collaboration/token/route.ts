// =====================================================
// KAZI Collaboration Token API
// JWT token generation for document collaboration
// =====================================================
// This endpoint is required by the A+++ Implementation Guide
// for authenticating users in real-time collaboration sessions.
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SignJWT, jwtVerify } from 'jose'
import { createSimpleLogger } from '@/lib/simple-logger'

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

const logger = createSimpleLogger('collaboration-token')

// =====================================================
// Configuration
// =====================================================

const JWT_SECRET = new TextEncoder().encode(
  process.env.COLLABORATION_JWT_SECRET || process.env.NEXTAUTH_SECRET || 'kazi-collaboration-secret-key-change-in-production'
)

const TOKEN_EXPIRY = '24h' // Token valid for 24 hours

// =====================================================
// Types
// =====================================================

interface TokenRequest {
  documentId: string
  userId?: string
  role?: 'owner' | 'editor' | 'commenter' | 'viewer'
  permissions?: TokenPermissions
}

interface TokenPermissions {
  canEdit: boolean
  canComment: boolean
  canInvite: boolean
  canExport: boolean
}

interface TokenPayload {
  documentId: string
  userId: string
  userName: string
  userEmail: string
  userAvatar?: string
  role: string
  permissions: TokenPermissions
  sessionId?: string
  iat: number
  exp: number
}

// =====================================================
// POST - Generate Collaboration Token
// =====================================================
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body: TokenRequest = await request.json()
    const { documentId, role = 'editor', permissions } = body

    if (!documentId) {
      return NextResponse.json(
        { success: false, error: 'Document ID is required' },
        { status: 400 }
      )
    }

    // Handle demo mode for unauthenticated users
    if (!user) {
      const demoToken = await generateDemoToken(documentId)
      return NextResponse.json({
        success: true,
        token: demoToken,
        demo: true,
        message: 'Demo collaboration token generated',
        expiresIn: TOKEN_EXPIRY,
      })
    }

    // Verify user has access to the document
    const hasAccess = await verifyDocumentAccess(supabase, documentId, user.id)
    if (!hasAccess.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access denied to this document',
          reason: hasAccess.reason
        },
        { status: 403 }
      )
    }

    // Get user profile for token
    const { data: userProfile } = await supabase
      .from('users')
      .select('name, avatar_url, email')
      .eq('id', user.id)
      .single()

    // Determine permissions based on role and access level
    const tokenPermissions = permissions || getDefaultPermissions(hasAccess.role || role)

    // Generate JWT token
    const token = await new SignJWT({
      documentId,
      userId: user.id,
      userName: userProfile?.name || user.email?.split('@')[0] || 'Anonymous',
      userEmail: user.email || '',
      userAvatar: userProfile?.avatar_url,
      role: hasAccess.role || role,
      permissions: tokenPermissions,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(TOKEN_EXPIRY)
      .setSubject(user.id)
      .setAudience('kazi-collaboration')
      .setIssuer('kazi-api')
      .sign(JWT_SECRET)

    // Create or update collaboration session
    const sessionId = await createCollaborationSession(supabase, documentId, user.id, hasAccess.role || role)

    return NextResponse.json({
      success: true,
      token,
      sessionId,
      expiresIn: TOKEN_EXPIRY,
      user: {
        id: user.id,
        name: userProfile?.name || user.email?.split('@')[0],
        avatar: userProfile?.avatar_url,
        role: hasAccess.role || role,
      },
      permissions: tokenPermissions,
    })

  } catch (error) {
    logger.error('Collaboration token error', { error })
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate token' },
      { status: 500 }
    )
  }
}

// =====================================================
// GET - Verify Token / Get Token Info
// =====================================================
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      )
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET, {
        audience: 'kazi-collaboration',
        issuer: 'kazi-api',
      })

      return NextResponse.json({
        success: true,
        valid: true,
        payload: {
          documentId: payload.documentId,
          userId: payload.userId,
          userName: payload.userName,
          role: payload.role,
          permissions: payload.permissions,
          expiresAt: new Date((payload.exp as number) * 1000).toISOString(),
        },
      })

    } catch (jwtError) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: 'Token is invalid or expired',
      }, { status: 401 })
    }

  } catch (error) {
    logger.error('Token verification error', { error })
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to verify token' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  // PATCH - Update token permissions or extend expiration
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId, permissions, role } = body

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    // Update session participant
    const { data, error } = await supabase
      .from('session_participants')
      .update({
        role: role || undefined,
        last_active_at: new Date().toISOString(),
      })
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    logger.info('Collaboration token updated', { sessionId })
    return NextResponse.json({ success: true, data })

  } catch (error) {
    logger.error('Token update error', { error })
    return NextResponse.json({ error: 'Failed to update token' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  // DELETE - Revoke token / Leave collaboration session
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    // Remove user from session
    const { error } = await supabase
      .from('session_participants')
      .delete()
      .eq('session_id', sessionId)
      .eq('user_id', user.id)

    if (error) throw error

    logger.info('User left collaboration session', { sessionId, userId: user.id })
    return NextResponse.json({ success: true, message: 'Left session successfully' })

  } catch (error) {
    logger.error('Leave session error', { error })
    return NextResponse.json({ error: 'Failed to leave session' }, { status: 500 })
  }
}

// =====================================================
// Helper Functions
// =====================================================

async function verifyDocumentAccess(
  supabase: any,
  documentId: string,
  userId: string
): Promise<{ allowed: boolean; role?: string; reason?: string }> {
  try {
    // Check document permissions table
    const { data: permission } = await supabase
      .from('document_permissions')
      .select('permission_level, can_edit, can_comment, can_share')
      .eq('document_id', documentId)
      .eq('user_id', userId)
      .single()

    if (permission) {
      return {
        allowed: true,
        role: permission.can_edit ? 'editor' : permission.can_comment ? 'commenter' : 'viewer',
      }
    }

    // Check if user owns the document
    const { data: document } = await supabase
      .from('documents')
      .select('user_id, visibility')
      .eq('id', documentId)
      .single()

    if (document?.user_id === userId) {
      return { allowed: true, role: 'owner' }
    }

    // Check if document is public
    if (document?.visibility === 'public') {
      return { allowed: true, role: 'viewer' }
    }

    // Check collaboration sessions
    const { data: session } = await supabase
      .from('collaboration_sessions')
      .select('id, created_by')
      .eq('document_id', documentId)
      .eq('status', 'active')
      .single()

    if (session?.created_by === userId) {
      return { allowed: true, role: 'owner' }
    }

    // Check project team membership (if document is part of a project)
    const { data: projectMember } = await supabase
      .from('project_members')
      .select('role')
      .eq('user_id', userId)
      .single()

    if (projectMember) {
      return {
        allowed: true,
        role: projectMember.role === 'admin' ? 'editor' : 'viewer',
      }
    }

    // Default: allow with viewer access for development
    // In production, return { allowed: false, reason: 'No access to this document' }
    return { allowed: true, role: 'viewer' }

  } catch (error) {
    logger.error('Document access check error', { error })
    // Default allow in development, deny in production
    if (process.env.NODE_ENV === 'development') {
      return { allowed: true, role: 'editor' }
    }
    return { allowed: false, reason: 'Failed to verify access' }
  }
}

function getDefaultPermissions(role: string): TokenPermissions {
  switch (role) {
    case 'owner':
      return {
        canEdit: true,
        canComment: true,
        canInvite: true,
        canExport: true,
      }
    case 'editor':
      return {
        canEdit: true,
        canComment: true,
        canInvite: false,
        canExport: true,
      }
    case 'commenter':
      return {
        canEdit: false,
        canComment: true,
        canInvite: false,
        canExport: false,
      }
    case 'viewer':
    default:
      return {
        canEdit: false,
        canComment: false,
        canInvite: false,
        canExport: false,
      }
  }
}

async function createCollaborationSession(
  supabase: any,
  documentId: string,
  userId: string,
  role: string
): Promise<string | null> {
  try {
    // Check for existing active session
    const { data: existingSession } = await supabase
      .from('collaboration_sessions')
      .select('id')
      .eq('document_id', documentId)
      .eq('status', 'active')
      .single()

    if (existingSession) {
      // Join existing session
      await supabase
        .from('session_participants')
        .upsert({
          session_id: existingSession.id,
          user_id: userId,
          role,
          status: 'active',
          joined_at: new Date().toISOString(),
          last_active_at: new Date().toISOString(),
        })

      return existingSession.id
    }

    // Create new session
    const { data: newSession, error } = await supabase
      .from('collaboration_sessions')
      .insert({
        document_id: documentId,
        document_type: 'document',
        created_by: userId,
        status: 'active',
        settings: {
          maxParticipants: 50,
          allowAnonymous: false,
          requireApproval: false,
          allowComments: true,
          allowEditing: true,
          autoSaveInterval: 30,
          conflictResolution: 'crdt',
          notifyOnJoin: true,
          recordHistory: true,
        },
      })
      .select()
      .single()

    if (error) {
      logger.error('Session creation error', { error })
      return null
    }

    // Add creator as participant
    await supabase
      .from('session_participants')
      .insert({
        session_id: newSession.id,
        user_id: userId,
        role: 'owner',
        status: 'active',
        joined_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
      })

    return newSession.id

  } catch (error) {
    logger.error('Session creation error', { error })
    return null
  }
}

async function generateDemoToken(documentId: string): Promise<string> {
  const demoUserId = `demo-${Date.now()}`

  return new SignJWT({
    documentId,
    userId: demoUserId,
    userName: 'Demo User',
    userEmail: 'demo@freeflow.app',
    role: 'viewer',
    permissions: {
      canEdit: false,
      canComment: true,
      canInvite: false,
      canExport: false,
    },
    demo: true,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h') // Demo tokens expire in 1 hour
    .setSubject(demoUserId)
    .setAudience('kazi-collaboration')
    .setIssuer('kazi-api')
    .sign(JWT_SECRET)
}
