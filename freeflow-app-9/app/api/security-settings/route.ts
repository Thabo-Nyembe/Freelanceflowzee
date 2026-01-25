/**
 * Security Settings API Routes
 *
 * REST endpoints for Security Settings:
 * GET - Backup codes, login attempts, audit logs, trusted devices, password history, alerts, stats
 * POST - Create backup codes, login attempts, audit logs, trusted devices, password history, alerts
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('security-settings')
import {
  getTwoFactorBackupCodes,
  createTwoFactorBackupCodes,
  regenerateTwoFactorBackupCodes,
  getLoginAttempts,
  getLoginAttemptsByEmail,
  createLoginAttempt,
  getRecentFailedAttempts,
  getSuspiciousAttempts,
  getSecurityAuditLogs,
  createSecurityAuditLog,
  getSecurityAuditLogsByType,
  getSuspiciousSecurityEvents,
  getHighRiskSecurityEvents,
  getTrustedDevices,
  createTrustedDevice,
  getActiveDevices,
  getPasswordHistory,
  addPasswordHistory,
  getSecurityAlerts,
  getUnreadSecurityAlerts,
  createSecurityAlert,
  markAllAlertsRead,
  getSecurityStats,
  getSecurityDashboard
} from '@/lib/security-settings-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'stats'
    const includeUsed = searchParams.get('include_used') === 'true'
    const status = searchParams.get('status') as any
    const email = searchParams.get('email')
    const eventType = searchParams.get('event_type') as any
    const isSuspicious = searchParams.get('is_suspicious')
    const minRiskScore = searchParams.get('min_risk_score') ? parseInt(searchParams.get('min_risk_score')!) : 70
    const trustStatus = searchParams.get('trust_status') as any
    const severity = searchParams.get('severity') as any
    const isRead = searchParams.get('is_read')
    const minutes = searchParams.get('minutes') ? parseInt(searchParams.get('minutes')!) : 15
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20

    switch (type) {
      case 'backup-codes': {
        const result = await getTwoFactorBackupCodes(user.id, includeUsed)
        return NextResponse.json({ data: result.data })
      }

      case 'login-attempts': {
        const filters: any = { limit }
        if (status) filters.status = status
        const result = await getLoginAttempts(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'login-attempts-by-email': {
        if (!email) {
          return NextResponse.json({ error: 'email required' }, { status: 400 })
        }
        const result = await getLoginAttemptsByEmail(email, limit)
        return NextResponse.json({ data: result.data })
      }

      case 'recent-failed-attempts': {
        const result = await getRecentFailedAttempts(user.id, minutes)
        return NextResponse.json({ data: result.data })
      }

      case 'suspicious-attempts': {
        const result = await getSuspiciousAttempts(user.id, limit)
        return NextResponse.json({ data: result.data })
      }

      case 'audit-logs': {
        const filters: any = { limit }
        if (eventType) filters.event_type = eventType
        if (isSuspicious !== null) filters.is_suspicious = isSuspicious === 'true'
        const result = await getSecurityAuditLogs(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'audit-logs-by-type': {
        if (!eventType) {
          return NextResponse.json({ error: 'event_type required' }, { status: 400 })
        }
        const result = await getSecurityAuditLogsByType(user.id, eventType, limit)
        return NextResponse.json({ data: result.data })
      }

      case 'suspicious-events': {
        const result = await getSuspiciousSecurityEvents(user.id, limit)
        return NextResponse.json({ data: result.data })
      }

      case 'high-risk-events': {
        const result = await getHighRiskSecurityEvents(user.id, minRiskScore, limit)
        return NextResponse.json({ data: result.data })
      }

      case 'trusted-devices': {
        const filters: any = {}
        if (trustStatus) filters.trust_status = trustStatus
        const result = await getTrustedDevices(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'active-devices': {
        const result = await getActiveDevices(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'password-history': {
        const result = await getPasswordHistory(user.id, limit)
        return NextResponse.json({ data: result.data })
      }

      case 'alerts': {
        const filters: any = { limit }
        if (severity) filters.severity = severity
        if (isRead !== null) filters.is_read = isRead === 'true'
        const result = await getSecurityAlerts(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'unread-alerts': {
        const result = await getUnreadSecurityAlerts(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'stats': {
        const result = await getSecurityStats(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'dashboard': {
        const result = await getSecurityDashboard(user.id)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Security Settings API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch Security Settings data' },
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
      case 'create-backup-codes': {
        const result = await createTwoFactorBackupCodes(user.id, payload.codes)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'regenerate-backup-codes': {
        const result = await regenerateTwoFactorBackupCodes(user.id, payload.codes)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-login-attempt': {
        const result = await createLoginAttempt({ user_id: user.id, ...payload })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-audit-log': {
        const result = await createSecurityAuditLog(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-trusted-device': {
        const result = await createTrustedDevice(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'add-password-history': {
        const result = await addPasswordHistory(user.id, payload.password_hash, payload.ip_address, payload.was_reset, payload.was_forced)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-alert': {
        const result = await createSecurityAlert(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'mark-all-alerts-read': {
        const result = await markAllAlertsRead(user.id)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Security Settings API error', { error })
    return NextResponse.json(
      { error: 'Failed to process Security Settings request' },
      { status: 500 }
    )
  }
}
