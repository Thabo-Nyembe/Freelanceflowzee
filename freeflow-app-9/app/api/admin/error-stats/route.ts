import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { getErrorStats } from '@/lib/error-monitoring'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('API-ErrorStats')

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userRole = (session.user as { role?: string }).role || 'user'
    const userEmail = session.user.email

    // Allow demo user and admins
    const isDemoUser = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

    if (!['admin', 'super_admin'].includes(userRole) && !isDemoUser) {
      logger.warn('Unauthorized error stats access attempt', {
        userId: session.user.id,
        role: userRole
      })
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get error statistics
    const stats = getErrorStats()

    logger.info('Error stats retrieved', { userId: session.user.id })

    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    logger.error('Failed to get error stats', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve error statistics' },
      { status: 500 }
    )
  }
}
