/**
 * KAZI Enterprise Audit Log Service
 *
 * Comprehensive audit logging for compliance, security monitoring,
 * and activity tracking. Supports automatic logging, querying,
 * and retention management.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Types
export type ActionCategory =
  | 'auth'
  | 'data'
  | 'settings'
  | 'billing'
  | 'team'
  | 'integration'
  | 'file'
  | 'communication'
  | 'admin'
  | 'security'
  | 'system'

export type ActionSeverity = 'debug' | 'info' | 'warning' | 'error' | 'critical'

export type ActorType = 'user' | 'system' | 'api' | 'webhook' | 'automation' | 'admin'

export type SecurityEventType =
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'password_change'
  | 'password_reset'
  | 'mfa_enabled'
  | 'mfa_disabled'
  | 'api_key_created'
  | 'api_key_revoked'
  | 'api_key_used'
  | 'permission_granted'
  | 'permission_revoked'
  | 'suspicious_activity'
  | 'brute_force_detected'
  | 'rate_limit_exceeded'
  | 'unauthorized_access'
  | 'data_export'
  | 'bulk_delete'
  | 'session_hijack_attempt'
  | 'ip_block'
  | 'account_locked'

export interface AuditLogEntry {
  id?: string
  userId?: string
  actorType?: ActorType
  actorName?: string
  actorEmail?: string
  action: string
  actionCategory: ActionCategory
  actionSeverity?: ActionSeverity
  resourceType?: string
  resourceId?: string
  resourceName?: string
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  changedFields?: string[]
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  requestId?: string
  metadata?: Record<string, any>
  tags?: string[]
  status?: 'success' | 'failure' | 'partial' | 'pending'
  errorMessage?: string
  errorCode?: string
  isSensitive?: boolean
}

export interface SecurityEvent {
  eventType: SecurityEventType
  severity: 'low' | 'medium' | 'high' | 'critical'
  userId?: string
  targetUserId?: string
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  description?: string
  metadata?: Record<string, any>
  actionTaken?: string
}

export interface AuditQuery {
  userId?: string
  action?: string
  actionCategory?: ActionCategory
  actionSeverity?: ActionSeverity
  resourceType?: string
  resourceId?: string
  startDate?: Date
  endDate?: Date
  status?: string
  ipAddress?: string
  tags?: string[]
  limit?: number
  offset?: number
  orderBy?: 'created_at' | 'action_severity'
  orderDirection?: 'asc' | 'desc'
}

export interface AuditSummary {
  totalEvents: number
  byCategory: Record<string, number>
  bySeverity: Record<string, number>
  recentFailures: number
  topActions: Array<{ action: string; count: number }>
  uniqueIPs: number
}

class AuditService {
  private supabase: SupabaseClient | null = null
  private requestContext: {
    ipAddress?: string
    userAgent?: string
    sessionId?: string
    requestId?: string
  } = {}

  constructor() {
    // Initialize lazily
  }

  private getClient(): SupabaseClient {
    if (!this.supabase) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase credentials not configured')
      }

      this.supabase = createClient(supabaseUrl, supabaseKey)
    }
    return this.supabase
  }

  /**
   * Set request context for automatic inclusion in logs
   */
  setRequestContext(context: {
    ipAddress?: string
    userAgent?: string
    sessionId?: string
    requestId?: string
  }) {
    this.requestContext = context
  }

  /**
   * Log an audit event
   */
  async log(entry: AuditLogEntry): Promise<string | null> {
    try {
      const supabase = this.getClient()

      const logEntry = {
        user_id: entry.userId,
        actor_type: entry.actorType || 'user',
        actor_name: entry.actorName,
        actor_email: entry.actorEmail,
        action: entry.action,
        action_category: entry.actionCategory,
        action_severity: entry.actionSeverity || 'info',
        resource_type: entry.resourceType,
        resource_id: entry.resourceId,
        resource_name: entry.resourceName,
        old_values: entry.oldValues,
        new_values: entry.newValues,
        changed_fields: entry.changedFields,
        ip_address: entry.ipAddress || this.requestContext.ipAddress,
        user_agent: entry.userAgent || this.requestContext.userAgent,
        session_id: entry.sessionId || this.requestContext.sessionId,
        request_id: entry.requestId || this.requestContext.requestId,
        metadata: entry.metadata || {},
        tags: entry.tags || [],
        status: entry.status || 'success',
        error_message: entry.errorMessage,
        error_code: entry.errorCode,
        is_sensitive: entry.isSensitive || false
      }

      const { data, error } = await supabase
        .from('audit_logs')
        .insert(logEntry)
        .select('id')
        .single()

      if (error) {
        console.error('Failed to log audit event:', error)
        return null
      }

      return data.id
    } catch (error) {
      console.error('Audit log error:', error)
      return null
    }
  }

  /**
   * Log a security event
   */
  async logSecurityEvent(event: SecurityEvent): Promise<string | null> {
    try {
      const supabase = this.getClient()

      const securityEvent = {
        event_type: event.eventType,
        severity: event.severity,
        user_id: event.userId,
        target_user_id: event.targetUserId,
        ip_address: event.ipAddress || this.requestContext.ipAddress,
        user_agent: event.userAgent || this.requestContext.userAgent,
        session_id: event.sessionId || this.requestContext.sessionId,
        description: event.description,
        metadata: event.metadata || {},
        action_taken: event.actionTaken
      }

      const { data, error } = await supabase
        .from('security_events')
        .insert(securityEvent)
        .select('id')
        .single()

      if (error) {
        console.error('Failed to log security event:', error)
        return null
      }

      // Also log to audit_logs for unified view
      await this.log({
        userId: event.userId,
        action: event.eventType,
        actionCategory: 'security',
        actionSeverity: event.severity === 'critical' ? 'critical' : event.severity === 'high' ? 'error' : 'warning',
        metadata: event.metadata,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent
      })

      return data.id
    } catch (error) {
      console.error('Security event log error:', error)
      return null
    }
  }

  /**
   * Log data access
   */
  async logDataAccess(params: {
    userId: string
    tableName: string
    recordId?: string
    accessType: 'select' | 'insert' | 'update' | 'delete' | 'export' | 'bulk'
    fieldsAccessed?: string[]
    rowCount?: number
    durationMs?: number
    apiEndpoint?: string
    metadata?: Record<string, any>
  }): Promise<string | null> {
    try {
      const supabase = this.getClient()

      const { data, error } = await supabase
        .from('data_access_logs')
        .insert({
          user_id: params.userId,
          table_name: params.tableName,
          record_id: params.recordId,
          access_type: params.accessType,
          fields_accessed: params.fieldsAccessed,
          row_count: params.rowCount,
          duration_ms: params.durationMs,
          api_endpoint: params.apiEndpoint,
          ip_address: this.requestContext.ipAddress,
          user_agent: this.requestContext.userAgent,
          metadata: params.metadata || {}
        })
        .select('id')
        .single()

      if (error) {
        console.error('Failed to log data access:', error)
        return null
      }

      return data.id
    } catch (error) {
      console.error('Data access log error:', error)
      return null
    }
  }

  /**
   * Log API usage
   */
  async logApiUsage(params: {
    userId?: string
    apiKeyId?: string
    method: string
    endpoint: string
    statusCode: number
    durationMs?: number
    requestBodySize?: number
    responseBodySize?: number
    pathParams?: Record<string, any>
    queryParams?: Record<string, any>
  }): Promise<string | null> {
    try {
      const supabase = this.getClient()

      const { data, error } = await supabase
        .from('api_usage_logs')
        .insert({
          user_id: params.userId,
          api_key_id: params.apiKeyId,
          method: params.method,
          endpoint: params.endpoint,
          status_code: params.statusCode,
          duration_ms: params.durationMs,
          request_body_size: params.requestBodySize,
          response_body_size: params.responseBodySize,
          path_params: params.pathParams,
          query_params: params.queryParams,
          ip_address: this.requestContext.ipAddress,
          user_agent: this.requestContext.userAgent
        })
        .select('id')
        .single()

      if (error) {
        console.error('Failed to log API usage:', error)
        return null
      }

      return data.id
    } catch (error) {
      console.error('API usage log error:', error)
      return null
    }
  }

  /**
   * Query audit logs
   */
  async query(params: AuditQuery): Promise<{ logs: any[]; total: number }> {
    try {
      const supabase = this.getClient()

      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })

      if (params.userId) {
        query = query.eq('user_id', params.userId)
      }

      if (params.action) {
        query = query.eq('action', params.action)
      }

      if (params.actionCategory) {
        query = query.eq('action_category', params.actionCategory)
      }

      if (params.actionSeverity) {
        query = query.eq('action_severity', params.actionSeverity)
      }

      if (params.resourceType) {
        query = query.eq('resource_type', params.resourceType)
      }

      if (params.resourceId) {
        query = query.eq('resource_id', params.resourceId)
      }

      if (params.startDate) {
        query = query.gte('created_at', params.startDate.toISOString())
      }

      if (params.endDate) {
        query = query.lte('created_at', params.endDate.toISOString())
      }

      if (params.status) {
        query = query.eq('status', params.status)
      }

      if (params.ipAddress) {
        query = query.eq('ip_address', params.ipAddress)
      }

      if (params.tags && params.tags.length > 0) {
        query = query.contains('tags', params.tags)
      }

      const orderBy = params.orderBy || 'created_at'
      const orderDirection = params.orderDirection || 'desc'
      query = query.order(orderBy, { ascending: orderDirection === 'asc' })

      const limit = params.limit || 50
      const offset = params.offset || 0
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) {
        throw error
      }

      return {
        logs: data || [],
        total: count || 0
      }
    } catch (error) {
      console.error('Audit query error:', error)
      return { logs: [], total: 0 }
    }
  }

  /**
   * Get audit summary for a user
   */
  async getSummary(userId: string, days: number = 30): Promise<AuditSummary | null> {
    try {
      const supabase = this.getClient()

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      // Get basic counts
      const { data: logs, error } = await supabase
        .from('audit_logs')
        .select('action, action_category, action_severity, status, ip_address')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())

      if (error) throw error

      // Calculate summary
      const byCategory: Record<string, number> = {}
      const bySeverity: Record<string, number> = {}
      const actionCounts: Record<string, number> = {}
      const uniqueIPs = new Set<string>()
      let failures = 0

      logs.forEach(log => {
        byCategory[log.action_category] = (byCategory[log.action_category] || 0) + 1
        bySeverity[log.action_severity] = (bySeverity[log.action_severity] || 0) + 1
        actionCounts[log.action] = (actionCounts[log.action] || 0) + 1

        if (log.status === 'failure') failures++
        if (log.ip_address) uniqueIPs.add(log.ip_address)
      })

      const topActions = Object.entries(actionCounts)
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      return {
        totalEvents: logs.length,
        byCategory,
        bySeverity,
        recentFailures: failures,
        topActions,
        uniqueIPs: uniqueIPs.size
      }
    } catch (error) {
      console.error('Audit summary error:', error)
      return null
    }
  }

  /**
   * Get security events
   */
  async getSecurityEvents(params: {
    userId?: string
    eventType?: SecurityEventType
    severity?: string
    startDate?: Date
    endDate?: Date
    unresolvedOnly?: boolean
    limit?: number
    offset?: number
  }): Promise<{ events: any[]; total: number }> {
    try {
      const supabase = this.getClient()

      let query = supabase
        .from('security_events')
        .select('*', { count: 'exact' })

      if (params.userId) {
        query = query.or(`user_id.eq.${params.userId},target_user_id.eq.${params.userId}`)
      }

      if (params.eventType) {
        query = query.eq('event_type', params.eventType)
      }

      if (params.severity) {
        query = query.eq('severity', params.severity)
      }

      if (params.startDate) {
        query = query.gte('created_at', params.startDate.toISOString())
      }

      if (params.endDate) {
        query = query.lte('created_at', params.endDate.toISOString())
      }

      if (params.unresolvedOnly) {
        query = query.eq('is_resolved', false)
      }

      query = query.order('created_at', { ascending: false })

      const limit = params.limit || 50
      const offset = params.offset || 0
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw error

      return {
        events: data || [],
        total: count || 0
      }
    } catch (error) {
      console.error('Security events query error:', error)
      return { events: [], total: 0 }
    }
  }

  /**
   * Resolve a security event
   */
  async resolveSecurityEvent(
    eventId: string,
    resolvedBy: string,
    notes?: string
  ): Promise<boolean> {
    try {
      const supabase = this.getClient()

      const { error } = await supabase
        .from('security_events')
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: resolvedBy,
          resolution_notes: notes
        })
        .eq('id', eventId)

      if (error) throw error

      return true
    } catch (error) {
      console.error('Resolve security event error:', error)
      return false
    }
  }

  // Convenience methods for common actions

  async logLogin(userId: string, success: boolean, metadata?: Record<string, any>) {
    if (success) {
      await this.logSecurityEvent({
        eventType: 'login_success',
        severity: 'low',
        userId,
        description: 'User logged in successfully',
        metadata
      })
    } else {
      await this.logSecurityEvent({
        eventType: 'login_failure',
        severity: 'medium',
        userId,
        description: 'Failed login attempt',
        metadata
      })
    }
  }

  async logLogout(userId: string) {
    await this.logSecurityEvent({
      eventType: 'logout',
      severity: 'low',
      userId,
      description: 'User logged out'
    })
  }

  async logDataCreate(userId: string, resourceType: string, resourceId: string, data: any) {
    await this.log({
      userId,
      action: `${resourceType}_created`,
      actionCategory: 'data',
      resourceType,
      resourceId,
      newValues: data
    })
  }

  async logDataUpdate(
    userId: string,
    resourceType: string,
    resourceId: string,
    oldData: any,
    newData: any
  ) {
    await this.log({
      userId,
      action: `${resourceType}_updated`,
      actionCategory: 'data',
      resourceType,
      resourceId,
      oldValues: oldData,
      newValues: newData
    })
  }

  async logDataDelete(userId: string, resourceType: string, resourceId: string, oldData?: any) {
    await this.log({
      userId,
      action: `${resourceType}_deleted`,
      actionCategory: 'data',
      actionSeverity: 'warning',
      resourceType,
      resourceId,
      oldValues: oldData
    })
  }

  async logSettingsChange(userId: string, setting: string, oldValue: any, newValue: any) {
    await this.log({
      userId,
      action: 'settings_updated',
      actionCategory: 'settings',
      resourceType: 'settings',
      resourceId: setting,
      oldValues: { [setting]: oldValue },
      newValues: { [setting]: newValue }
    })
  }

  async logApiKeyCreated(userId: string, keyId: string, keyName: string) {
    await this.logSecurityEvent({
      eventType: 'api_key_created',
      severity: 'medium',
      userId,
      description: `API key "${keyName}" created`,
      metadata: { keyId, keyName }
    })
  }

  async logApiKeyRevoked(userId: string, keyId: string, keyName: string) {
    await this.logSecurityEvent({
      eventType: 'api_key_revoked',
      severity: 'medium',
      userId,
      description: `API key "${keyName}" revoked`,
      metadata: { keyId, keyName }
    })
  }

  async logUnauthorizedAccess(userId: string | undefined, resource: string) {
    await this.logSecurityEvent({
      eventType: 'unauthorized_access',
      severity: 'high',
      userId,
      description: `Unauthorized access attempt to ${resource}`,
      metadata: { resource }
    })
  }

  async logBulkOperation(
    userId: string,
    operation: string,
    resourceType: string,
    count: number,
    metadata?: Record<string, any>
  ) {
    await this.log({
      userId,
      action: `bulk_${operation}`,
      actionCategory: 'data',
      actionSeverity: 'warning',
      resourceType,
      metadata: {
        count,
        ...metadata
      }
    })

    if (operation === 'delete' && count > 10) {
      await this.logSecurityEvent({
        eventType: 'bulk_delete',
        severity: 'medium',
        userId,
        description: `Bulk delete of ${count} ${resourceType} records`,
        metadata: { count, resourceType }
      })
    }
  }
}

// Export singleton instance
export const auditService = new AuditService()

// Export class for custom instances
export { AuditService }
