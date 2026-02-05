import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('projects')

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
 * Clear Rate Limits API
 *
 * Admin endpoint to reset rate limits for users or projects.
 * Used for support cases and emergency access restoration.
 */

// In-memory rate limit store (in production, use Redis)
const rateLimits = new Map<string, { count: number; resetAt: number }>()

interface RateLimitEntry {
  key: string
  count: number
  limit: number
  resetAt: string
  type: 'user' | 'project' | 'ip'
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Demo mode
    if (!user) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          limits: [
            {
              key: 'user:demo-001',
              count: 45,
              limit: 100,
              resetAt: new Date(Date.now() + 3600000).toISOString(),
              type: 'user',
            },
            {
              key: 'project:proj-001',
              count: 180,
              limit: 500,
              resetAt: new Date(Date.now() + 1800000).toISOString(),
              type: 'project',
            },
            {
              key: 'ip:192.168.1.1',
              count: 25,
              limit: 50,
              resetAt: new Date(Date.now() + 600000).toISOString(),
              type: 'ip',
            },
          ],
          summary: {
            totalTracked: 3,
            nearLimit: 1,
            atLimit: 0,
          },
        },
      })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const key = searchParams.get('key')

    // Get rate limits from database or memory
    const limits: RateLimitEntry[] = []

    rateLimits.forEach((value, mapKey) => {
      const [limitType, identifier] = mapKey.split(':')
      if (type && limitType !== type) return
      if (key && !mapKey.includes(key)) return

      limits.push({
        key: mapKey,
        count: value.count,
        limit: getLimitForType(limitType),
        resetAt: new Date(value.resetAt).toISOString(),
        type: limitType as 'user' | 'project' | 'ip',
      })
    })

    // Also check database for persistent rate limits
    const { data: dbLimits } = await supabase
      .from('rate_limits')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(100)

    const allLimits = [
      ...limits,
      ...(dbLimits?.map(l => ({
        key: l.key,
        count: l.count,
        limit: l.limit_value,
        resetAt: l.reset_at,
        type: l.type,
      })) || []),
    ]

    const nearLimit = allLimits.filter(l => l.count / l.limit > 0.8).length
    const atLimit = allLimits.filter(l => l.count >= l.limit).length

    return NextResponse.json({
      success: true,
      data: {
        limits: allLimits,
        summary: {
          totalTracked: allLimits.length,
          nearLimit,
          atLimit,
        },
      },
    })
  } catch (error) {
    logger.error('Rate limits GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rate limits' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const { action = 'clear', ...data } = body

    // Demo mode
    if (!user) {
      switch (action) {
        case 'clear':
          return NextResponse.json({
            success: true,
            demo: true,
            message: 'Rate limits cleared (demo mode)',
            data: { clearedCount: 1 },
          })
        case 'clear_all':
          return NextResponse.json({
            success: true,
            demo: true,
            message: 'All rate limits cleared (demo mode)',
            data: { clearedCount: 3 },
          })
        case 'adjust':
          return NextResponse.json({
            success: true,
            demo: true,
            message: 'Rate limit adjusted (demo mode)',
          })
        default:
          return NextResponse.json({
            success: false,
            demo: true,
            error: 'Unknown action',
          }, { status: 400 })
      }
    }

    // Check admin access
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    switch (action) {
      case 'clear': {
        const { key, type, identifier } = data
        const targetKey = key || `${type}:${identifier}`

        if (!targetKey) {
          return NextResponse.json(
            { success: false, error: 'Missing key or type/identifier' },
            { status: 400 }
          )
        }

        // Clear from memory
        rateLimits.delete(targetKey)

        // Clear from database
        await supabase
          .from('rate_limits')
          .delete()
          .eq('key', targetKey)

        // Log the action
        await supabase.from('admin_audit_log').insert({
          admin_id: user.id,
          action: 'clear_rate_limit',
          target_key: targetKey,
          details: { key: targetKey },
        })

        return NextResponse.json({
          success: true,
          message: `Rate limit cleared for ${targetKey}`,
          data: { clearedCount: 1 },
        })
      }

      case 'clear_all': {
        const { type } = data
        let clearedCount = 0

        if (type) {
          // Clear all of a specific type
          const keysToDelete: string[] = []
          rateLimits.forEach((_, key) => {
            if (key.startsWith(`${type}:`)) {
              keysToDelete.push(key)
            }
          })
          keysToDelete.forEach(key => {
            rateLimits.delete(key)
            clearedCount++
          })

          await supabase
            .from('rate_limits')
            .delete()
            .eq('type', type)
        } else {
          // Clear all
          clearedCount = rateLimits.size
          rateLimits.clear()

          await supabase
            .from('rate_limits')
            .delete()
            .neq('key', '')
        }

        // Log the action
        await supabase.from('admin_audit_log').insert({
          admin_id: user.id,
          action: 'clear_all_rate_limits',
          details: { type: type || 'all', clearedCount },
        })

        return NextResponse.json({
          success: true,
          message: type
            ? `All ${type} rate limits cleared`
            : 'All rate limits cleared',
          data: { clearedCount },
        })
      }

      case 'adjust': {
        const { key, type, identifier, newLimit, newCount } = data
        const targetKey = key || `${type}:${identifier}`

        if (!targetKey) {
          return NextResponse.json(
            { success: false, error: 'Missing key or type/identifier' },
            { status: 400 }
          )
        }

        // Update in database
        const { error } = await supabase
          .from('rate_limits')
          .upsert({
            key: targetKey,
            type: type || targetKey.split(':')[0],
            limit_value: newLimit,
            count: newCount ?? 0,
            reset_at: new Date(Date.now() + 3600000).toISOString(),
            updated_at: new Date().toISOString(),
          })

        if (error) throw error

        // Update memory if exists
        if (rateLimits.has(targetKey)) {
          const existing = rateLimits.get(targetKey)!
          rateLimits.set(targetKey, {
            count: newCount ?? existing.count,
            resetAt: existing.resetAt,
          })
        }

        // Log the action
        await supabase.from('admin_audit_log').insert({
          admin_id: user.id,
          action: 'adjust_rate_limit',
          target_key: targetKey,
          details: { key: targetKey, newLimit, newCount },
        })

        return NextResponse.json({
          success: true,
          message: `Rate limit adjusted for ${targetKey}`,
        })
      }

      case 'whitelist': {
        const { type, identifier, reason } = data

        if (!type || !identifier) {
          return NextResponse.json(
            { success: false, error: 'Missing type or identifier' },
            { status: 400 }
          )
        }

        await supabase.from('rate_limit_whitelist').insert({
          type,
          identifier,
          reason,
          created_by: user.id,
          created_at: new Date().toISOString(),
        })

        return NextResponse.json({
          success: true,
          message: `${type}:${identifier} added to whitelist`,
        })
      }

      case 'remove_whitelist': {
        const { type, identifier } = data

        await supabase
          .from('rate_limit_whitelist')
          .delete()
          .eq('type', type)
          .eq('identifier', identifier)

        return NextResponse.json({
          success: true,
          message: `${type}:${identifier} removed from whitelist`,
        })
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error) {
    logger.error('Rate limits POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process rate limit operation' },
      { status: 500 }
    )
  }
}

function getLimitForType(type: string): number {
  switch (type) {
    case 'user':
      return 100
    case 'project':
      return 500
    case 'ip':
      return 50
    default:
      return 100
  }
}
