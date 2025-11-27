/**
 * Notification Settings Query Library
 */

import { createClient } from '@/lib/supabase/client'

export type NotificationChannel = 'email' | 'push' | 'sms' | 'in_app' | 'webhook'
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'
export type DeliveryStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced' | 'clicked' | 'opened'
export type TemplateType = 'system' | 'custom' | 'transactional' | 'marketing'
export type DigestFrequency = 'realtime' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'never'

export interface NotificationPreference {
  id: string
  user_id: string
  category: string
  channel: NotificationChannel
  is_enabled: boolean
  priority: NotificationPriority
  digest_frequency: DigestFrequency
  conditions: Record<string, any>
  custom_settings: Record<string, any>
  created_at: string
  updated_at: string
}

export interface NotificationSchedule {
  id: string
  user_id: string
  schedule_name: string
  description?: string
  quiet_hours_enabled: boolean
  quiet_hours_start?: string
  quiet_hours_end?: string
  quiet_hours_timezone: string
  excluded_days: number[]
  digest_enabled: boolean
  digest_frequency: DigestFrequency
  digest_time?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface NotificationTemplate {
  id: string
  user_id?: string
  template_name: string
  template_type: TemplateType
  category: string
  subject?: string
  body: string
  html_body?: string
  variables: any[]
  styles: Record<string, any>
  language: string
  is_active: boolean
  is_system: boolean
  usage_count: number
  created_at: string
  updated_at: string
}

export interface NotificationDeliveryLog {
  id: string
  user_id?: string
  category: string
  channel: NotificationChannel
  priority: NotificationPriority
  subject?: string
  body: string
  metadata: Record<string, any>
  status: DeliveryStatus
  sent_at?: string
  delivered_at?: string
  opened_at?: string
  clicked_at?: string
  failed_at?: string
  recipient_email?: string
  recipient_phone?: string
  device_token?: string
  error_message?: string
  retry_count: number
  max_retries: number
  external_id?: string
  provider?: string
  created_at: string
}

export interface PushNotificationToken {
  id: string
  user_id: string
  token: string
  platform: string
  device_id?: string
  device_name?: string
  device_type?: string
  browser?: string
  os?: string
  is_active: boolean
  last_used_at?: string
  expires_at?: string
  created_at: string
  updated_at: string
}

export interface NotificationUnsubscribe {
  id: string
  user_id?: string
  email?: string
  category: string
  channel: NotificationChannel
  unsubscribed_at: string
  reason?: string
  ip_address?: string
  resubscribed_at?: string
  created_at: string
}

// NOTIFICATION PREFERENCES
export async function getNotificationPreferences(userId: string, filters?: { category?: string; channel?: NotificationChannel; is_enabled?: boolean }) {
  const supabase = createClient()
  let query = supabase.from('notification_preferences').select('*').eq('user_id', userId).order('category')
  if (filters?.category) query = query.eq('category', filters.category)
  if (filters?.channel) query = query.eq('channel', filters.channel)
  if (filters?.is_enabled !== undefined) query = query.eq('is_enabled', filters.is_enabled)
  return await query
}

export async function getNotificationPreference(userId: string, category: string, channel: NotificationChannel) {
  const supabase = createClient()
  return await supabase.from('notification_preferences').select('*').eq('user_id', userId).eq('category', category).eq('channel', channel).single()
}

export async function createNotificationPreference(userId: string, preference: Partial<NotificationPreference>) {
  const supabase = createClient()
  return await supabase.from('notification_preferences').insert({ user_id: userId, ...preference }).select().single()
}

export async function updateNotificationPreference(preferenceId: string, updates: Partial<NotificationPreference>) {
  const supabase = createClient()
  return await supabase.from('notification_preferences').update(updates).eq('id', preferenceId).select().single()
}

export async function toggleNotificationPreference(userId: string, category: string, channel: NotificationChannel, enabled: boolean) {
  const supabase = createClient()
  return await supabase.from('notification_preferences').update({ is_enabled: enabled }).eq('user_id', userId).eq('category', category).eq('channel', channel).select().single()
}

export async function deleteNotificationPreference(preferenceId: string) {
  const supabase = createClient()
  return await supabase.from('notification_preferences').delete().eq('id', preferenceId)
}

// NOTIFICATION SCHEDULES
export async function getNotificationSchedules(userId: string, filters?: { is_active?: boolean }) {
  const supabase = createClient()
  let query = supabase.from('notification_schedules').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.is_active !== undefined) query = query.eq('is_active', filters.is_active)
  return await query
}

export async function getActiveNotificationSchedule(userId: string) {
  const supabase = createClient()
  return await supabase.from('notification_schedules').select('*').eq('user_id', userId).eq('is_active', true).single()
}

export async function getNotificationSchedule(scheduleId: string) {
  const supabase = createClient()
  return await supabase.from('notification_schedules').select('*').eq('id', scheduleId).single()
}

export async function createNotificationSchedule(userId: string, schedule: Partial<NotificationSchedule>) {
  const supabase = createClient()
  return await supabase.from('notification_schedules').insert({ user_id: userId, ...schedule }).select().single()
}

export async function updateNotificationSchedule(scheduleId: string, updates: Partial<NotificationSchedule>) {
  const supabase = createClient()
  return await supabase.from('notification_schedules').update(updates).eq('id', scheduleId).select().single()
}

export async function activateNotificationSchedule(scheduleId: string) {
  const supabase = createClient()
  // Deactivate all other schedules first
  const { data: schedule } = await supabase.from('notification_schedules').select('user_id').eq('id', scheduleId).single()
  if (schedule) {
    await supabase.from('notification_schedules').update({ is_active: false }).eq('user_id', schedule.user_id)
  }
  return await supabase.from('notification_schedules').update({ is_active: true }).eq('id', scheduleId).select().single()
}

export async function deleteNotificationSchedule(scheduleId: string) {
  const supabase = createClient()
  return await supabase.from('notification_schedules').delete().eq('id', scheduleId)
}

// NOTIFICATION TEMPLATES
export async function getNotificationTemplates(filters?: { category?: string; template_type?: TemplateType; is_active?: boolean; is_system?: boolean }) {
  const supabase = createClient()
  let query = supabase.from('notification_templates').select('*').order('category')
  if (filters?.category) query = query.eq('category', filters.category)
  if (filters?.template_type) query = query.eq('template_type', filters.template_type)
  if (filters?.is_active !== undefined) query = query.eq('is_active', filters.is_active)
  if (filters?.is_system !== undefined) query = query.eq('is_system', filters.is_system)
  return await query
}

export async function getUserNotificationTemplates(userId: string) {
  const supabase = createClient()
  return await supabase.from('notification_templates').select('*').eq('user_id', userId).order('created_at', { ascending: false })
}

export async function getNotificationTemplate(templateId: string) {
  const supabase = createClient()
  return await supabase.from('notification_templates').select('*').eq('id', templateId).single()
}

export async function getNotificationTemplateByName(templateName: string, category: string) {
  const supabase = createClient()
  return await supabase.from('notification_templates').select('*').eq('template_name', templateName).eq('category', category).single()
}

export async function createNotificationTemplate(userId: string | undefined, template: Partial<NotificationTemplate>) {
  const supabase = createClient()
  return await supabase.from('notification_templates').insert({ user_id: userId, ...template }).select().single()
}

export async function updateNotificationTemplate(templateId: string, updates: Partial<NotificationTemplate>) {
  const supabase = createClient()
  return await supabase.from('notification_templates').update(updates).eq('id', templateId).select().single()
}

export async function deleteNotificationTemplate(templateId: string) {
  const supabase = createClient()
  return await supabase.from('notification_templates').delete().eq('id', templateId)
}

export async function getPopularTemplates(limit: number = 10) {
  const supabase = createClient()
  return await supabase.from('notification_templates').select('*').eq('is_active', true).order('usage_count', { ascending: false }).limit(limit)
}

// NOTIFICATION DELIVERY LOGS
export async function getNotificationDeliveryLogs(userId: string, filters?: { category?: string; channel?: NotificationChannel; status?: DeliveryStatus; limit?: number }) {
  const supabase = createClient()
  let query = supabase.from('notification_delivery_logs').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.category) query = query.eq('category', filters.category)
  if (filters?.channel) query = query.eq('channel', filters.channel)
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.limit) query = query.limit(filters.limit)
  return await query
}

export async function getNotificationDeliveryLog(logId: string) {
  const supabase = createClient()
  return await supabase.from('notification_delivery_logs').select('*').eq('id', logId).single()
}

export async function createNotificationDeliveryLog(userId: string | undefined, log: Partial<NotificationDeliveryLog>) {
  const supabase = createClient()
  return await supabase.from('notification_delivery_logs').insert({ user_id: userId, ...log }).select().single()
}

export async function updateNotificationDeliveryLog(logId: string, updates: Partial<NotificationDeliveryLog>) {
  const supabase = createClient()
  return await supabase.from('notification_delivery_logs').update(updates).eq('id', logId).select().single()
}

export async function updateDeliveryStatus(logId: string, status: DeliveryStatus, errorMessage?: string) {
  const supabase = createClient()
  return await supabase.from('notification_delivery_logs').update({
    status,
    error_message: errorMessage
  }).eq('id', logId).select().single()
}

export async function getPendingDeliveries(channel?: NotificationChannel, limit: number = 100) {
  const supabase = createClient()
  let query = supabase.from('notification_delivery_logs').select('*').eq('status', 'pending').order('created_at')
  if (channel) query = query.eq('channel', channel)
  return await query.limit(limit)
}

export async function getFailedDeliveries(userId: string, limit: number = 20) {
  const supabase = createClient()
  return await supabase.from('notification_delivery_logs').select('*').eq('user_id', userId).eq('status', 'failed').order('failed_at', { ascending: false }).limit(limit)
}

// PUSH NOTIFICATION TOKENS
export async function getPushNotificationTokens(userId: string, filters?: { platform?: string; is_active?: boolean }) {
  const supabase = createClient()
  let query = supabase.from('push_notification_tokens').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.platform) query = query.eq('platform', filters.platform)
  if (filters?.is_active !== undefined) query = query.eq('is_active', filters.is_active)
  return await query
}

export async function getPushNotificationToken(tokenId: string) {
  const supabase = createClient()
  return await supabase.from('push_notification_tokens').select('*').eq('id', tokenId).single()
}

export async function createPushNotificationToken(userId: string, token: Partial<PushNotificationToken>) {
  const supabase = createClient()
  return await supabase.from('push_notification_tokens').insert({ user_id: userId, ...token }).select().single()
}

export async function updatePushNotificationToken(tokenId: string, updates: Partial<PushNotificationToken>) {
  const supabase = createClient()
  return await supabase.from('push_notification_tokens').update(updates).eq('id', tokenId).select().single()
}

export async function deactivatePushNotificationToken(tokenId: string) {
  const supabase = createClient()
  return await supabase.from('push_notification_tokens').update({ is_active: false }).eq('id', tokenId).select().single()
}

export async function deletePushNotificationToken(tokenId: string) {
  const supabase = createClient()
  return await supabase.from('push_notification_tokens').delete().eq('id', tokenId)
}

export async function getActivePushTokens(userId: string) {
  const supabase = createClient()
  return await supabase.from('push_notification_tokens').select('*').eq('user_id', userId).eq('is_active', true)
}

// NOTIFICATION UNSUBSCRIBES
export async function getNotificationUnsubscribes(userId: string, filters?: { category?: string; channel?: NotificationChannel }) {
  const supabase = createClient()
  let query = supabase.from('notification_unsubscribes').select('*').eq('user_id', userId).order('unsubscribed_at', { ascending: false })
  if (filters?.category) query = query.eq('category', filters.category)
  if (filters?.channel) query = query.eq('channel', filters.channel)
  return await query
}

export async function createNotificationUnsubscribe(userId: string | undefined, unsubscribe: Partial<NotificationUnsubscribe>) {
  const supabase = createClient()
  return await supabase.from('notification_unsubscribes').insert({ user_id: userId, ...unsubscribe }).select().single()
}

export async function resubscribeNotification(unsubscribeId: string) {
  const supabase = createClient()
  return await supabase.from('notification_unsubscribes').update({
    resubscribed_at: new Date().toISOString()
  }).eq('id', unsubscribeId).select().single()
}

export async function isUnsubscribed(email: string, category: string, channel: NotificationChannel) {
  const supabase = createClient()
  const { data } = await supabase.from('notification_unsubscribes')
    .select('id')
    .eq('email', email)
    .eq('category', category)
    .eq('channel', channel)
    .is('resubscribed_at', null)
    .single()
  return !!data
}

// STATS
export async function getNotificationStats(userId: string) {
  const supabase = createClient()
  const [preferencesResult, logsResult, tokensResult, unsubscribesResult, schedulesResult, templatesResult] = await Promise.all([
    supabase.from('notification_preferences').select('id, channel, is_enabled').eq('user_id', userId),
    supabase.from('notification_delivery_logs').select('id, channel, status').eq('user_id', userId),
    supabase.from('push_notification_tokens').select('id, is_active', { count: 'exact' }).eq('user_id', userId),
    supabase.from('notification_unsubscribes').select('id, channel', { count: 'exact' }).eq('user_id', userId).is('resubscribed_at', null),
    supabase.from('notification_schedules').select('id, is_active', { count: 'exact' }).eq('user_id', userId),
    supabase.from('notification_templates').select('id, template_type', { count: 'exact' }).eq('user_id', userId)
  ])

  const enabledPreferences = preferencesResult.data?.filter(p => p.is_enabled).length || 0
  const sentNotifications = logsResult.data?.filter(l => l.status === 'sent' || l.status === 'delivered').length || 0
  const deliveredNotifications = logsResult.data?.filter(l => l.status === 'delivered').length || 0
  const failedNotifications = logsResult.data?.filter(l => l.status === 'failed').length || 0
  const activeTokens = tokensResult.data?.filter(t => t.is_active).length || 0
  const activeSchedules = schedulesResult.data?.filter(s => s.is_active).length || 0

  // Channel breakdown
  const channelBreakdown = preferencesResult.data?.reduce((acc, p) => {
    acc[p.channel] = (acc[p.channel] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  // Status breakdown
  const statusBreakdown = logsResult.data?.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  return {
    data: {
      total_preferences: preferencesResult.count || 0,
      enabled_preferences: enabledPreferences,
      channel_breakdown: channelBreakdown,
      total_notifications_sent: logsResult.count || 0,
      sent_notifications: sentNotifications,
      delivered_notifications: deliveredNotifications,
      failed_notifications: failedNotifications,
      status_breakdown: statusBreakdown,
      total_push_tokens: tokensResult.count || 0,
      active_push_tokens: activeTokens,
      total_unsubscribes: unsubscribesResult.count || 0,
      total_schedules: schedulesResult.count || 0,
      active_schedules: activeSchedules,
      total_templates: templatesResult.count || 0
    },
    error: preferencesResult.error || logsResult.error || tokensResult.error || unsubscribesResult.error || schedulesResult.error || templatesResult.error
  }
}

export async function getNotificationDashboard(userId: string) {
  const supabase = createClient()
  const [statsResult, recentLogs, activeSchedule, enabledPreferences] = await Promise.all([
    getNotificationStats(userId),
    supabase.from('notification_delivery_logs').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
    getActiveNotificationSchedule(userId),
    supabase.from('notification_preferences').select('*').eq('user_id', userId).eq('is_enabled', true)
  ])

  return {
    data: {
      stats: statsResult.data,
      recent_logs: recentLogs.data || [],
      active_schedule: activeSchedule.data,
      enabled_preferences: enabledPreferences.data || []
    },
    error: statsResult.error || recentLogs.error || activeSchedule.error || enabledPreferences.error
  }
}
