/**
 * Security Settings Query Library
 */

import { createClient } from '@/lib/supabase/client'

export type LoginAttemptStatus = 'success' | 'failed' | 'blocked' | 'suspicious'
export type SecurityEventType = 'login' | 'logout' | 'password_change' | '2fa_enabled' | '2fa_disabled' | 'password_reset' | 'device_trusted' | 'device_removed' | 'settings_changed' | 'suspicious_activity'
export type DeviceTrustStatus = 'trusted' | 'pending' | 'blocked' | 'expired'
export type SecurityAlertSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface TwoFactorBackupCode {
  id: string
  user_id: string
  code_hash: string
  code_prefix: string
  is_used: boolean
  used_at?: string
  used_from_ip?: string
  generated_at: string
  expires_at?: string
  created_at: string
}

export interface LoginAttempt {
  id: string
  user_id?: string
  email?: string
  status: LoginAttemptStatus
  attempted_at: string
  ip_address?: string
  user_agent?: string
  device_type?: string
  browser?: string
  os?: string
  country?: string
  city?: string
  used_2fa: boolean
  used_backup_code: boolean
  failure_reason?: string
  attempts_count: number
  created_at: string
}

export interface SecurityAuditLog {
  id: string
  user_id?: string
  event_type: SecurityEventType
  event_description: string
  occurred_at: string
  ip_address?: string
  user_agent?: string
  device_id?: string
  old_value: Record<string, any>
  new_value: Record<string, any>
  additional_data: Record<string, any>
  is_suspicious: boolean
  risk_score?: number
  created_at: string
}

export interface TrustedDevice {
  id: string
  user_id: string
  device_id: string
  device_name?: string
  device_type?: string
  browser?: string
  os?: string
  trust_status: DeviceTrustStatus
  trusted_at?: string
  expires_at?: string
  ip_address?: string
  country?: string
  city?: string
  last_used_at?: string
  login_count: number
  verification_token?: string
  verified_at?: string
  created_at: string
  updated_at: string
}

export interface PasswordHistory {
  id: string
  user_id: string
  password_hash: string
  changed_at: string
  changed_from_ip?: string
  changed_via?: string
  was_reset: boolean
  was_forced: boolean
  created_at: string
}

export interface SecurityAlert {
  id: string
  user_id: string
  alert_type: string
  severity: SecurityAlertSeverity
  title: string
  message: string
  is_read: boolean
  read_at?: string
  is_dismissed: boolean
  dismissed_at?: string
  related_ip?: string
  related_device_id?: string
  related_event_id?: string
  alert_data: Record<string, any>
  created_at: string
  updated_at: string
}

// TWO-FACTOR BACKUP CODES
export async function getTwoFactorBackupCodes(userId: string, includeUsed: boolean = false) {
  const supabase = createClient()
  let query = supabase.from('two_factor_backup_codes').select('*').eq('user_id', userId).order('generated_at', { ascending: false })
  if (!includeUsed) query = query.eq('is_used', false)
  return await query
}

export async function createTwoFactorBackupCodes(userId: string, codes: Array<{ code_hash: string; code_prefix: string }>) {
  const supabase = createClient()
  const records = codes.map(code => ({ user_id: userId, ...code }))
  return await supabase.from('two_factor_backup_codes').insert(records).select()
}

export async function useTwoFactorBackupCode(codeHash: string, ipAddress?: string) {
  const supabase = createClient()
  return await supabase.from('two_factor_backup_codes').update({
    is_used: true,
    used_from_ip: ipAddress
  }).eq('code_hash', codeHash).eq('is_used', false).select().single()
}

export async function verifyTwoFactorBackupCode(userId: string, codeHash: string) {
  const supabase = createClient()
  const { data } = await supabase.from('two_factor_backup_codes')
    .select('id')
    .eq('user_id', userId)
    .eq('code_hash', codeHash)
    .eq('is_used', false)
    .single()
  return !!data
}

export async function deleteUsedBackupCodes(userId: string) {
  const supabase = createClient()
  return await supabase.from('two_factor_backup_codes').delete().eq('user_id', userId).eq('is_used', true)
}

export async function regenerateTwoFactorBackupCodes(userId: string, codes: Array<{ code_hash: string; code_prefix: string }>) {
  const supabase = createClient()
  // Delete old codes
  await supabase.from('two_factor_backup_codes').delete().eq('user_id', userId)
  // Create new codes
  return await createTwoFactorBackupCodes(userId, codes)
}

// LOGIN ATTEMPTS
export async function getLoginAttempts(userId: string, filters?: { status?: LoginAttemptStatus; limit?: number }) {
  const supabase = createClient()
  let query = supabase.from('login_attempts').select('*').eq('user_id', userId).order('attempted_at', { ascending: false })
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.limit) query = query.limit(filters.limit)
  return await query
}

export async function getLoginAttemptsByEmail(email: string, limit: number = 20) {
  const supabase = createClient()
  return await supabase.from('login_attempts').select('*').eq('email', email).order('attempted_at', { ascending: false }).limit(limit)
}

export async function createLoginAttempt(attempt: Partial<LoginAttempt>) {
  const supabase = createClient()
  return await supabase.from('login_attempts').insert(attempt).select().single()
}

export async function getRecentFailedAttempts(userId: string, minutes: number = 15) {
  const supabase = createClient()
  const cutoff = new Date(Date.now() - minutes * 60 * 1000).toISOString()
  return await supabase.from('login_attempts')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'failed')
    .gte('attempted_at', cutoff)
    .order('attempted_at', { ascending: false })
}

export async function getSuspiciousAttempts(userId: string, limit: number = 10) {
  const supabase = createClient()
  return await supabase.from('login_attempts')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['suspicious', 'blocked'])
    .order('attempted_at', { ascending: false })
    .limit(limit)
}

// SECURITY AUDIT LOGS
export async function getSecurityAuditLogs(userId: string, filters?: { event_type?: SecurityEventType; is_suspicious?: boolean; limit?: number }) {
  const supabase = createClient()
  let query = supabase.from('security_audit_logs').select('*').eq('user_id', userId).order('occurred_at', { ascending: false })
  if (filters?.event_type) query = query.eq('event_type', filters.event_type)
  if (filters?.is_suspicious !== undefined) query = query.eq('is_suspicious', filters.is_suspicious)
  if (filters?.limit) query = query.limit(filters.limit)
  return await query
}

export async function createSecurityAuditLog(userId: string | undefined, log: Partial<SecurityAuditLog>) {
  const supabase = createClient()
  return await supabase.from('security_audit_logs').insert({ user_id: userId, ...log }).select().single()
}

export async function getSecurityAuditLogsByType(userId: string, eventType: SecurityEventType, limit: number = 20) {
  const supabase = createClient()
  return await supabase.from('security_audit_logs').select('*').eq('user_id', userId).eq('event_type', eventType).order('occurred_at', { ascending: false }).limit(limit)
}

export async function getSuspiciousSecurityEvents(userId: string, limit: number = 10) {
  const supabase = createClient()
  return await supabase.from('security_audit_logs').select('*').eq('user_id', userId).eq('is_suspicious', true).order('occurred_at', { ascending: false }).limit(limit)
}

export async function getHighRiskSecurityEvents(userId: string, minRiskScore: number = 70, limit: number = 10) {
  const supabase = createClient()
  return await supabase.from('security_audit_logs').select('*').eq('user_id', userId).gte('risk_score', minRiskScore).order('occurred_at', { ascending: false }).limit(limit)
}

// TRUSTED DEVICES
export async function getTrustedDevices(userId: string, filters?: { trust_status?: DeviceTrustStatus }) {
  const supabase = createClient()
  let query = supabase.from('trusted_devices').select('*').eq('user_id', userId).order('last_used_at', { ascending: false })
  if (filters?.trust_status) query = query.eq('trust_status', filters.trust_status)
  return await query
}

export async function getTrustedDevice(deviceId: string) {
  const supabase = createClient()
  return await supabase.from('trusted_devices').select('*').eq('id', deviceId).single()
}

export async function createTrustedDevice(userId: string, device: Partial<TrustedDevice>) {
  const supabase = createClient()
  return await supabase.from('trusted_devices').insert({ user_id: userId, ...device }).select().single()
}

export async function updateTrustedDevice(deviceId: string, updates: Partial<TrustedDevice>) {
  const supabase = createClient()
  return await supabase.from('trusted_devices').update(updates).eq('id', deviceId).select().single()
}

export async function trustDevice(deviceId: string) {
  const supabase = createClient()
  return await supabase.from('trusted_devices').update({
    trust_status: 'trusted',
    trusted_at: new Date().toISOString(),
    verified_at: new Date().toISOString()
  }).eq('id', deviceId).select().single()
}

export async function blockDevice(deviceId: string) {
  const supabase = createClient()
  return await supabase.from('trusted_devices').update({
    trust_status: 'blocked'
  }).eq('id', deviceId).select().single()
}

export async function removeTrustedDevice(deviceId: string) {
  const supabase = createClient()
  return await supabase.from('trusted_devices').delete().eq('id', deviceId)
}

export async function getActiveDevices(userId: string) {
  const supabase = createClient()
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
  return await supabase.from('trusted_devices')
    .select('*')
    .eq('user_id', userId)
    .eq('trust_status', 'trusted')
    .gte('last_used_at', cutoff)
    .order('last_used_at', { ascending: false })
}

// PASSWORD HISTORY
export async function getPasswordHistory(userId: string, limit: number = 10) {
  const supabase = createClient()
  return await supabase.from('password_history').select('*').eq('user_id', userId).order('changed_at', { ascending: false }).limit(limit)
}

export async function addPasswordHistory(userId: string, passwordHash: string, ipAddress?: string, wasReset: boolean = false, wasForced: boolean = false) {
  const supabase = createClient()
  return await supabase.from('password_history').insert({
    user_id: userId,
    password_hash: passwordHash,
    changed_from_ip: ipAddress,
    was_reset: wasReset,
    was_forced: wasForced
  }).select().single()
}

export async function checkPasswordHistory(userId: string, passwordHash: string) {
  const supabase = createClient()
  const { data } = await supabase.from('password_history')
    .select('id')
    .eq('user_id', userId)
    .eq('password_hash', passwordHash)
    .single()
  return !!data
}

export async function cleanOldPasswordHistory(userId: string, keepCount: number = 10) {
  const supabase = createClient()
  const { data: passwords } = await supabase.from('password_history')
    .select('id')
    .eq('user_id', userId)
    .order('changed_at', { ascending: false })

  if (!passwords || passwords.length <= keepCount) return { data: null, error: null }

  const toDelete = passwords.slice(keepCount).map(p => p.id)
  return await supabase.from('password_history').delete().in('id', toDelete)
}

// SECURITY ALERTS
export async function getSecurityAlerts(userId: string, filters?: { severity?: SecurityAlertSeverity; is_read?: boolean; limit?: number }) {
  const supabase = createClient()
  let query = supabase.from('security_alerts').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.severity) query = query.eq('severity', filters.severity)
  if (filters?.is_read !== undefined) query = query.eq('is_read', filters.is_read)
  if (filters?.limit) query = query.limit(filters.limit)
  return await query
}

export async function getUnreadSecurityAlerts(userId: string) {
  const supabase = createClient()
  return await supabase.from('security_alerts').select('*').eq('user_id', userId).eq('is_read', false).order('created_at', { ascending: false })
}

export async function createSecurityAlert(userId: string, alert: Partial<SecurityAlert>) {
  const supabase = createClient()
  return await supabase.from('security_alerts').insert({ user_id: userId, ...alert }).select().single()
}

export async function markSecurityAlertRead(alertId: string) {
  const supabase = createClient()
  return await supabase.from('security_alerts').update({
    is_read: true,
    read_at: new Date().toISOString()
  }).eq('id', alertId).select().single()
}

export async function dismissSecurityAlert(alertId: string) {
  const supabase = createClient()
  return await supabase.from('security_alerts').update({
    is_dismissed: true,
    dismissed_at: new Date().toISOString()
  }).eq('id', alertId).select().single()
}

export async function deleteSecurityAlert(alertId: string) {
  const supabase = createClient()
  return await supabase.from('security_alerts').delete().eq('id', alertId)
}

export async function markAllAlertsRead(userId: string) {
  const supabase = createClient()
  return await supabase.from('security_alerts').update({
    is_read: true,
    read_at: new Date().toISOString()
  }).eq('user_id', userId).eq('is_read', false)
}

// STATS
export async function getSecurityStats(userId: string) {
  const supabase = createClient()
  const [backupCodesResult, loginAttemptsResult, auditLogsResult, devicesResult, passwordHistoryResult, alertsResult] = await Promise.all([
    supabase.from('two_factor_backup_codes').select('id, is_used', { count: 'exact' }).eq('user_id', userId),
    supabase.from('login_attempts').select('id, status').eq('user_id', userId),
    supabase.from('security_audit_logs').select('id, event_type, is_suspicious').eq('user_id', userId),
    supabase.from('trusted_devices').select('id, trust_status, login_count').eq('user_id', userId),
    supabase.from('password_history').select('id, changed_at').eq('user_id', userId).order('changed_at', { ascending: false }).limit(1).single(),
    supabase.from('security_alerts').select('id, severity, is_read').eq('user_id', userId)
  ])

  const unusedBackupCodes = backupCodesResult.data?.filter(c => !c.is_used).length || 0
  const usedBackupCodes = backupCodesResult.data?.filter(c => c.is_used).length || 0
  const successfulLogins = loginAttemptsResult.data?.filter(a => a.status === 'success').length || 0
  const failedLogins = loginAttemptsResult.data?.filter(a => a.status === 'failed').length || 0
  const suspiciousLogins = loginAttemptsResult.data?.filter(a => a.status === 'suspicious' || a.status === 'blocked').length || 0
  const suspiciousEvents = auditLogsResult.data?.filter(e => e.is_suspicious).length || 0
  const trustedDevicesCount = devicesResult.data?.filter(d => d.trust_status === 'trusted').length || 0
  const blockedDevicesCount = devicesResult.data?.filter(d => d.trust_status === 'blocked').length || 0
  const totalDeviceLogins = devicesResult.data?.reduce((sum, d) => sum + (d.login_count || 0), 0) || 0
  const unreadAlertsCount = alertsResult.data?.filter(a => !a.is_read).length || 0
  const criticalAlertsCount = alertsResult.data?.filter(a => a.severity === 'critical').length || 0

  // Event type breakdown
  const eventTypeBreakdown = auditLogsResult.data?.reduce((acc, e) => {
    acc[e.event_type] = (acc[e.event_type] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  return {
    data: {
      total_backup_codes: backupCodesResult.count || 0,
      unused_backup_codes: unusedBackupCodes,
      used_backup_codes: usedBackupCodes,
      total_login_attempts: loginAttemptsResult.count || 0,
      successful_logins: successfulLogins,
      failed_logins: failedLogins,
      suspicious_logins: suspiciousLogins,
      total_audit_logs: auditLogsResult.count || 0,
      suspicious_events: suspiciousEvents,
      event_type_breakdown: eventTypeBreakdown,
      total_devices: devicesResult.count || 0,
      trusted_devices: trustedDevicesCount,
      blocked_devices: blockedDevicesCount,
      total_device_logins: totalDeviceLogins,
      last_password_change: passwordHistoryResult.data?.changed_at,
      total_password_changes: passwordHistoryResult.count || 0,
      total_alerts: alertsResult.count || 0,
      unread_alerts: unreadAlertsCount,
      critical_alerts: criticalAlertsCount
    },
    error: backupCodesResult.error || loginAttemptsResult.error || auditLogsResult.error || devicesResult.error || passwordHistoryResult.error || alertsResult.error
  }
}

export async function getSecurityDashboard(userId: string) {
  const supabase = createClient()
  const [statsResult, recentLogins, recentEvents, activeAlerts] = await Promise.all([
    getSecurityStats(userId),
    supabase.from('login_attempts').select('*').eq('user_id', userId).order('attempted_at', { ascending: false }).limit(5),
    supabase.from('security_audit_logs').select('*').eq('user_id', userId).order('occurred_at', { ascending: false }).limit(5),
    supabase.from('security_alerts').select('*').eq('user_id', userId).eq('is_read', false).order('created_at', { ascending: false }).limit(5)
  ])

  return {
    data: {
      stats: statsResult.data,
      recent_logins: recentLogins.data || [],
      recent_events: recentEvents.data || [],
      active_alerts: activeAlerts.data || []
    },
    error: statsResult.error || recentLogins.error || recentEvents.error || activeAlerts.error
  }
}
