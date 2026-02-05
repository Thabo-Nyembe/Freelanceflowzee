import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('API-AdminOverview')

async function verifyAdminAccess(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return { authorized: false, error: 'Authentication required', status: 401 }
  }

  // Check for admin role (adjust based on your role system)
  const userRole = (session.user as { role?: string }).role || 'user'
  const userEmail = session.user.email

  // Allow demo user and admins
  const isDemoUser = userEmail === DEMO_USER_EMAIL ||
                     userEmail === 'demo@kazi.io' ||
                     userEmail === 'test@kazi.dev'

  if (!['admin', 'super_admin'].includes(userRole) && !isDemoUser) {
    logger.warn('Unauthorized admin access attempt', { userId: session.user.id, role: userRole })
    return { authorized: false, error: 'Admin access required', status: 403 }
  }

  return { authorized: true, user: session.user }
}

export async function GET(request: NextRequest) {
  const authResult = await verifyAdminAccess(request)

  if (!authResult.authorized) {
    return NextResponse.json(
      { success: false, error: authResult.error },
      { status: authResult.status }
    )
  }

  logger.info('Admin overview accessed', { userId: authResult.user?.id })

  return NextResponse.json({
    success: true,
    data: {
      totalRevenue: 125000,
      activeProjects: 12,
      pendingInvoices: 5,
      clientSatisfaction: 94,
      monthlyGrowth: 12.5,
      recentActivity: [
        { id: '1', type: 'project', action: 'completed', timestamp: new Date().toISOString() },
        { id: '2', type: 'invoice', action: 'paid', timestamp: new Date().toISOString() },
      ]
    }
  })
}

export async function POST(request: NextRequest) {
  const authResult = await verifyAdminAccess(request)

  if (!authResult.authorized) {
    return NextResponse.json(
      { success: false, error: authResult.error },
      { status: authResult.status }
    )
  }

  try {
    const body = await request.json()
    logger.info('Admin overview POST', { userId: authResult.user?.id, action: body.action })
    return NextResponse.json({ success: true, data: body })
  } catch (error) {
    logger.error('Admin overview POST error', { error })
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    )
  }
}
