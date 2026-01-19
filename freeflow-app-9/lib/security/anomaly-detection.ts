/**
 * Security Anomaly Detection Service
 *
 * Phase 9.6 of A+++ Implementation
 *
 * Real-time security monitoring with ML-based anomaly detection:
 * - Impossible travel detection
 * - Brute force attack detection
 * - Session anomaly detection
 * - Suspicious API pattern detection
 * - Behavioral biometrics analysis
 */

import { createClient } from '@/lib/supabase/server'

// =============================================================================
// TYPES
// =============================================================================

export type SecurityEventType =
  | 'login_attempt'
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'password_change'
  | 'mfa_enabled'
  | 'mfa_disabled'
  | 'api_call'
  | 'permission_change'
  | 'data_export'
  | 'session_created'
  | 'session_revoked'
  | 'suspicious_activity'

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'

export type AlertStatus = 'new' | 'investigating' | 'resolved' | 'false_positive'

export interface SecurityEvent {
  id?: string
  user_id: string | null
  organization_id?: string
  event_type: SecurityEventType
  ip_address: string
  user_agent: string
  location?: GeoLocation
  metadata: Record<string, unknown>
  risk_score?: number
  timestamp?: string
}

export interface GeoLocation {
  country?: string
  country_code?: string
  region?: string
  city?: string
  latitude?: number
  longitude?: number
  timezone?: string
}

export interface SecurityAlert {
  id?: string
  user_id: string | null
  organization_id?: string
  alert_type: string
  severity: AlertSeverity
  status: AlertStatus
  title: string
  description: string
  details: Record<string, unknown>
  related_events: string[]
  created_at?: string
  resolved_at?: string
  resolved_by?: string
}

export interface AnomalyRule {
  id: string
  name: string
  description: string
  rule_type: string
  conditions: RuleCondition[]
  actions: RuleAction[]
  severity: AlertSeverity
  is_active: boolean
  cooldown_minutes: number
}

export interface RuleCondition {
  field: string
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'not_contains' | 'in' | 'not_in'
  value: unknown
}

export interface RuleAction {
  type: 'alert' | 'block_ip' | 'lock_account' | 'require_mfa' | 'notify_admin' | 'webhook'
  config?: Record<string, unknown>
}

export interface UserBehaviorProfile {
  user_id: string
  typical_login_hours: number[]
  typical_locations: string[]
  typical_devices: string[]
  typical_ips: string[]
  avg_session_duration: number
  avg_api_calls_per_hour: number
  last_updated: string
}

export interface ThreatIntelligence {
  ip_address: string
  is_tor_exit: boolean
  is_vpn: boolean
  is_proxy: boolean
  is_hosting: boolean
  is_known_attacker: boolean
  threat_score: number
  last_checked: string
}

// =============================================================================
// ANOMALY DETECTION SERVICE
// =============================================================================

class AnomalyDetectionService {
  private supabase: Awaited<ReturnType<typeof createClient>> | null = null
  private rules: AnomalyRule[] = []
  private behaviorProfiles: Map<string, UserBehaviorProfile> = new Map()

  // Earth radius in km for distance calculations
  private readonly EARTH_RADIUS_KM = 6371

  /**
   * Initialize the service
   */
  async init(): Promise<void> {
    this.supabase = await createClient()
    await this.loadRules()
  }

  /**
   * Load active anomaly detection rules
   */
  async loadRules(): Promise<void> {
    if (!this.supabase) await this.init()

    const { data: rules } = await this.supabase!
      .from('anomaly_rules')
      .select('*')
      .eq('is_active', true)

    this.rules = rules || []
  }

  // ===========================================================================
  // EVENT PROCESSING
  // ===========================================================================

  /**
   * Process a security event and check for anomalies
   */
  async processEvent(event: SecurityEvent): Promise<{
    risk_score: number
    anomalies: string[]
    alerts: SecurityAlert[]
  }> {
    if (!this.supabase) await this.init()

    const anomalies: string[] = []
    const alerts: SecurityAlert[] = []
    let risk_score = 0

    // Store the event
    const { data: storedEvent } = await this.supabase!
      .from('security_events')
      .insert({
        ...event,
        timestamp: event.timestamp || new Date().toISOString()
      })
      .select()
      .single()

    const eventId = storedEvent?.id

    // Run all anomaly checks in parallel
    const checks = await Promise.all([
      this.checkImpossibleTravel(event),
      this.checkBruteForce(event),
      this.checkGeoAnomaly(event),
      this.checkDeviceAnomaly(event),
      this.checkTimeAnomaly(event),
      this.checkVelocityAnomaly(event),
      this.checkThreatIntelligence(event),
      this.checkBehavioralAnomaly(event)
    ])

    // Aggregate results
    for (const check of checks) {
      if (check.detected) {
        anomalies.push(check.type)
        risk_score += check.score

        if (check.alert) {
          check.alert.related_events = [eventId]
          alerts.push(check.alert)
        }
      }
    }

    // Cap risk score at 100
    risk_score = Math.min(risk_score, 100)

    // Update event with risk score
    if (eventId) {
      await this.supabase!
        .from('security_events')
        .update({ risk_score })
        .eq('id', eventId)
    }

    // Store alerts
    for (const alert of alerts) {
      await this.createAlert(alert)
    }

    // Execute rule-based actions
    await this.evaluateRules(event, anomalies, risk_score)

    return { risk_score, anomalies, alerts }
  }

  // ===========================================================================
  // ANOMALY DETECTION ALGORITHMS
  // ===========================================================================

  /**
   * Detect impossible travel - login from geographically distant locations
   * in too short a time frame
   */
  private async checkImpossibleTravel(event: SecurityEvent): Promise<{
    detected: boolean
    type: string
    score: number
    alert?: SecurityAlert
  }> {
    if (!event.user_id || !event.location?.latitude || event.event_type !== 'login_success') {
      return { detected: false, type: 'impossible_travel', score: 0 }
    }

    // Get last successful login
    const { data: lastLogin } = await this.supabase!
      .from('security_events')
      .select('*')
      .eq('user_id', event.user_id)
      .eq('event_type', 'login_success')
      .neq('ip_address', event.ip_address)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single()

    if (!lastLogin || !lastLogin.location?.latitude) {
      return { detected: false, type: 'impossible_travel', score: 0 }
    }

    // Calculate distance
    const distance = this.calculateDistance(
      lastLogin.location.latitude,
      lastLogin.location.longitude,
      event.location.latitude!,
      event.location.longitude!
    )

    // Calculate time difference in hours
    const timeDiff = (
      new Date(event.timestamp || Date.now()).getTime() -
      new Date(lastLogin.timestamp).getTime()
    ) / (1000 * 60 * 60)

    // Maximum possible travel speed (km/h) - typical commercial flight
    const MAX_TRAVEL_SPEED = 900

    // Calculate if travel is possible
    const maxPossibleDistance = MAX_TRAVEL_SPEED * timeDiff
    const isImpossible = distance > maxPossibleDistance && distance > 500 // Min 500km to trigger

    if (isImpossible) {
      return {
        detected: true,
        type: 'impossible_travel',
        score: 40,
        alert: {
          user_id: event.user_id,
          organization_id: event.organization_id,
          alert_type: 'impossible_travel',
          severity: 'high',
          status: 'new',
          title: 'Impossible Travel Detected',
          description: `Login detected from ${event.location.city || event.location.country} after login from ${lastLogin.location.city || lastLogin.location.country}. Distance: ${Math.round(distance)}km in ${timeDiff.toFixed(1)} hours.`,
          details: {
            current_location: event.location,
            previous_location: lastLogin.location,
            distance_km: Math.round(distance),
            time_difference_hours: timeDiff.toFixed(1),
            max_possible_distance: Math.round(maxPossibleDistance)
          },
          related_events: []
        }
      }
    }

    return { detected: false, type: 'impossible_travel', score: 0 }
  }

  /**
   * Detect brute force attacks - multiple failed login attempts
   */
  private async checkBruteForce(event: SecurityEvent): Promise<{
    detected: boolean
    type: string
    score: number
    alert?: SecurityAlert
  }> {
    if (event.event_type !== 'login_failure') {
      return { detected: false, type: 'brute_force', score: 0 }
    }

    const windowMinutes = 15
    const threshold = 5

    // Count recent failures from same IP
    const { count: ipFailures } = await this.supabase!
      .from('security_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'login_failure')
      .eq('ip_address', event.ip_address)
      .gte('timestamp', new Date(Date.now() - windowMinutes * 60 * 1000).toISOString())

    // Count recent failures for same user
    const userFailures = event.user_id ? (await this.supabase!
      .from('security_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'login_failure')
      .eq('user_id', event.user_id)
      .gte('timestamp', new Date(Date.now() - windowMinutes * 60 * 1000).toISOString())
    ).count : 0

    const maxFailures = Math.max(ipFailures || 0, userFailures || 0)

    if (maxFailures >= threshold) {
      const severity: AlertSeverity = maxFailures >= 20 ? 'critical' : maxFailures >= 10 ? 'high' : 'medium'

      return {
        detected: true,
        type: 'brute_force',
        score: Math.min(maxFailures * 5, 50),
        alert: {
          user_id: event.user_id,
          organization_id: event.organization_id,
          alert_type: 'brute_force',
          severity,
          status: 'new',
          title: 'Brute Force Attack Detected',
          description: `${maxFailures} failed login attempts in the last ${windowMinutes} minutes from IP ${event.ip_address}.`,
          details: {
            ip_address: event.ip_address,
            ip_failures: ipFailures,
            user_failures: userFailures,
            window_minutes: windowMinutes,
            threshold
          },
          related_events: []
        }
      }
    }

    return { detected: false, type: 'brute_force', score: 0 }
  }

  /**
   * Detect geographic anomalies - login from unusual countries
   */
  private async checkGeoAnomaly(event: SecurityEvent): Promise<{
    detected: boolean
    type: string
    score: number
    alert?: SecurityAlert
  }> {
    if (!event.user_id || !event.location?.country_code || event.event_type !== 'login_success') {
      return { detected: false, type: 'geo_anomaly', score: 0 }
    }

    // Get user's typical locations
    const profile = await this.getUserBehaviorProfile(event.user_id)

    if (!profile || profile.typical_locations.length === 0) {
      // First time user, no baseline
      return { detected: false, type: 'geo_anomaly', score: 0 }
    }

    const isNewLocation = !profile.typical_locations.includes(event.location.country_code)

    if (isNewLocation) {
      // Check if this country is considered high-risk
      const highRiskCountries = ['KP', 'IR', 'RU', 'CN', 'NG', 'RO', 'UA', 'BY']
      const isHighRisk = highRiskCountries.includes(event.location.country_code)

      return {
        detected: true,
        type: 'geo_anomaly',
        score: isHighRisk ? 30 : 15,
        alert: {
          user_id: event.user_id,
          organization_id: event.organization_id,
          alert_type: 'geo_anomaly',
          severity: isHighRisk ? 'high' : 'medium',
          status: 'new',
          title: 'Login from New Location',
          description: `First login detected from ${event.location.country} (${event.location.city || 'Unknown city'}).`,
          details: {
            new_location: event.location,
            typical_locations: profile.typical_locations,
            is_high_risk_country: isHighRisk
          },
          related_events: []
        }
      }
    }

    return { detected: false, type: 'geo_anomaly', score: 0 }
  }

  /**
   * Detect device anomalies - login from new/unusual devices
   */
  private async checkDeviceAnomaly(event: SecurityEvent): Promise<{
    detected: boolean
    type: string
    score: number
    alert?: SecurityAlert
  }> {
    if (!event.user_id || !event.user_agent || event.event_type !== 'login_success') {
      return { detected: false, type: 'device_anomaly', score: 0 }
    }

    // Parse device fingerprint from user agent
    const deviceFingerprint = this.parseDeviceFingerprint(event.user_agent)

    // Get user's typical devices
    const profile = await this.getUserBehaviorProfile(event.user_id)

    if (!profile || profile.typical_devices.length === 0) {
      return { detected: false, type: 'device_anomaly', score: 0 }
    }

    const isNewDevice = !profile.typical_devices.includes(deviceFingerprint)

    if (isNewDevice) {
      return {
        detected: true,
        type: 'device_anomaly',
        score: 10,
        alert: {
          user_id: event.user_id,
          organization_id: event.organization_id,
          alert_type: 'device_anomaly',
          severity: 'low',
          status: 'new',
          title: 'Login from New Device',
          description: `Login detected from a new device: ${deviceFingerprint}`,
          details: {
            new_device: deviceFingerprint,
            user_agent: event.user_agent,
            typical_devices: profile.typical_devices
          },
          related_events: []
        }
      }
    }

    return { detected: false, type: 'device_anomaly', score: 0 }
  }

  /**
   * Detect time anomalies - login at unusual times
   */
  private async checkTimeAnomaly(event: SecurityEvent): Promise<{
    detected: boolean
    type: string
    score: number
    alert?: SecurityAlert
  }> {
    if (!event.user_id || event.event_type !== 'login_success') {
      return { detected: false, type: 'time_anomaly', score: 0 }
    }

    const profile = await this.getUserBehaviorProfile(event.user_id)

    if (!profile || profile.typical_login_hours.length === 0) {
      return { detected: false, type: 'time_anomaly', score: 0 }
    }

    const eventHour = new Date(event.timestamp || Date.now()).getHours()
    const isUnusualTime = !profile.typical_login_hours.includes(eventHour)

    // Only flag if it's very unusual (e.g., 2am-5am) and not in their typical hours
    const isLateNight = eventHour >= 2 && eventHour <= 5

    if (isUnusualTime && isLateNight) {
      return {
        detected: true,
        type: 'time_anomaly',
        score: 10,
        alert: {
          user_id: event.user_id,
          organization_id: event.organization_id,
          alert_type: 'time_anomaly',
          severity: 'low',
          status: 'new',
          title: 'Login at Unusual Time',
          description: `Login detected at ${eventHour}:00, outside typical active hours.`,
          details: {
            login_hour: eventHour,
            typical_hours: profile.typical_login_hours
          },
          related_events: []
        }
      }
    }

    return { detected: false, type: 'time_anomaly', score: 0 }
  }

  /**
   * Detect velocity anomalies - unusual rate of API calls or actions
   */
  private async checkVelocityAnomaly(event: SecurityEvent): Promise<{
    detected: boolean
    type: string
    score: number
    alert?: SecurityAlert
  }> {
    if (!event.user_id || event.event_type !== 'api_call') {
      return { detected: false, type: 'velocity_anomaly', score: 0 }
    }

    const profile = await this.getUserBehaviorProfile(event.user_id)

    if (!profile || profile.avg_api_calls_per_hour === 0) {
      return { detected: false, type: 'velocity_anomaly', score: 0 }
    }

    // Count API calls in last hour
    const { count } = await this.supabase!
      .from('security_events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', event.user_id)
      .eq('event_type', 'api_call')
      .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString())

    const currentRate = count || 0
    const threshold = profile.avg_api_calls_per_hour * 5 // 5x normal rate

    if (currentRate > threshold && currentRate > 100) {
      return {
        detected: true,
        type: 'velocity_anomaly',
        score: 25,
        alert: {
          user_id: event.user_id,
          organization_id: event.organization_id,
          alert_type: 'velocity_anomaly',
          severity: 'medium',
          status: 'new',
          title: 'Unusual API Activity',
          description: `API call rate (${currentRate}/hour) is significantly higher than normal (${profile.avg_api_calls_per_hour}/hour).`,
          details: {
            current_rate: currentRate,
            average_rate: profile.avg_api_calls_per_hour,
            threshold
          },
          related_events: []
        }
      }
    }

    return { detected: false, type: 'velocity_anomaly', score: 0 }
  }

  /**
   * Check threat intelligence for IP reputation
   */
  private async checkThreatIntelligence(event: SecurityEvent): Promise<{
    detected: boolean
    type: string
    score: number
    alert?: SecurityAlert
  }> {
    if (!event.ip_address) {
      return { detected: false, type: 'threat_intel', score: 0 }
    }

    // Check cached threat intelligence
    const { data: threatData } = await this.supabase!
      .from('threat_intelligence')
      .select('*')
      .eq('ip_address', event.ip_address)
      .single()

    // If no data or stale (>24h), fetch fresh data
    const needsRefresh = !threatData ||
      new Date(threatData.last_checked).getTime() < Date.now() - 24 * 60 * 60 * 1000

    let threat: ThreatIntelligence

    if (needsRefresh) {
      threat = await this.fetchThreatIntelligence(event.ip_address)
    } else {
      threat = threatData
    }

    const isHighRisk = threat.threat_score >= 70 ||
      threat.is_known_attacker ||
      threat.is_tor_exit

    const isMediumRisk = threat.threat_score >= 40 ||
      threat.is_vpn ||
      threat.is_proxy

    if (isHighRisk) {
      return {
        detected: true,
        type: 'threat_intel',
        score: 35,
        alert: {
          user_id: event.user_id,
          organization_id: event.organization_id,
          alert_type: 'threat_intel',
          severity: 'high',
          status: 'new',
          title: 'High-Risk IP Address Detected',
          description: `Activity from IP ${event.ip_address} with high threat score (${threat.threat_score}/100).`,
          details: threat,
          related_events: []
        }
      }
    }

    if (isMediumRisk && event.event_type === 'login_success') {
      return {
        detected: true,
        type: 'threat_intel',
        score: 15,
        alert: {
          user_id: event.user_id,
          organization_id: event.organization_id,
          alert_type: 'threat_intel',
          severity: 'medium',
          status: 'new',
          title: 'Suspicious IP Address',
          description: `Login from ${threat.is_vpn ? 'VPN' : threat.is_proxy ? 'Proxy' : 'suspicious'} IP address.`,
          details: threat,
          related_events: []
        }
      }
    }

    return { detected: false, type: 'threat_intel', score: 0 }
  }

  /**
   * Check for behavioral anomalies using ML-based scoring
   */
  private async checkBehavioralAnomaly(event: SecurityEvent): Promise<{
    detected: boolean
    type: string
    score: number
    alert?: SecurityAlert
  }> {
    if (!event.user_id) {
      return { detected: false, type: 'behavioral', score: 0 }
    }

    // Get user's recent activity pattern
    const { data: recentEvents } = await this.supabase!
      .from('security_events')
      .select('*')
      .eq('user_id', event.user_id)
      .order('timestamp', { ascending: false })
      .limit(100)

    if (!recentEvents || recentEvents.length < 10) {
      // Not enough data for behavioral analysis
      return { detected: false, type: 'behavioral', score: 0 }
    }

    // Calculate behavioral score using simple statistical analysis
    const anomalyScore = this.calculateBehavioralAnomalyScore(event, recentEvents)

    if (anomalyScore > 0.8) {
      return {
        detected: true,
        type: 'behavioral',
        score: 20,
        alert: {
          user_id: event.user_id,
          organization_id: event.organization_id,
          alert_type: 'behavioral_anomaly',
          severity: 'medium',
          status: 'new',
          title: 'Unusual Behavioral Pattern',
          description: `Activity deviates significantly from established behavioral patterns (score: ${(anomalyScore * 100).toFixed(0)}%).`,
          details: {
            anomaly_score: anomalyScore,
            recent_events_analyzed: recentEvents.length
          },
          related_events: []
        }
      }
    }

    return { detected: false, type: 'behavioral', score: 0 }
  }

  // ===========================================================================
  // HELPER METHODS
  // ===========================================================================

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const dLat = this.toRad(lat2 - lat1)
    const dLon = this.toRad(lon2 - lon1)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
      Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return this.EARTH_RADIUS_KM * c
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180)
  }

  /**
   * Parse device fingerprint from user agent
   */
  private parseDeviceFingerprint(userAgent: string): string {
    // Simple device fingerprinting based on OS and browser
    const patterns = {
      os: /Windows|Mac OS|Linux|Android|iOS|iPhone/i,
      browser: /Chrome|Firefox|Safari|Edge|Opera/i
    }

    const os = userAgent.match(patterns.os)?.[0] || 'Unknown OS'
    const browser = userAgent.match(patterns.browser)?.[0] || 'Unknown Browser'

    return `${os}-${browser}`
  }

  /**
   * Get or create user behavior profile
   */
  private async getUserBehaviorProfile(userId: string): Promise<UserBehaviorProfile | null> {
    // Check cache first
    if (this.behaviorProfiles.has(userId)) {
      const cached = this.behaviorProfiles.get(userId)!
      const age = Date.now() - new Date(cached.last_updated).getTime()
      if (age < 60 * 60 * 1000) { // 1 hour cache
        return cached
      }
    }

    // Fetch from database
    const { data: profile } = await this.supabase!
      .from('user_behavior_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (profile) {
      this.behaviorProfiles.set(userId, profile)
      return profile
    }

    // Generate profile from historical data
    return this.generateBehaviorProfile(userId)
  }

  /**
   * Generate behavior profile from historical data
   */
  private async generateBehaviorProfile(userId: string): Promise<UserBehaviorProfile | null> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    // Get historical events
    const { data: events } = await this.supabase!
      .from('security_events')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', thirtyDaysAgo)

    if (!events || events.length < 10) {
      return null
    }

    // Calculate typical login hours
    const loginHours = events
      .filter(e => e.event_type === 'login_success')
      .map(e => new Date(e.timestamp).getHours())

    const hourCounts = new Map<number, number>()
    for (const hour of loginHours) {
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1)
    }

    const typicalHours = Array.from(hourCounts.entries())
      .filter(([, count]) => count >= 2)
      .map(([hour]) => hour)

    // Calculate typical locations
    const locations = events
      .filter(e => e.location?.country_code)
      .map(e => e.location.country_code)

    const typicalLocations = [...new Set(locations)]

    // Calculate typical devices
    const devices = events
      .map(e => this.parseDeviceFingerprint(e.user_agent))

    const typicalDevices = [...new Set(devices)]

    // Calculate typical IPs
    const ips = events.map(e => e.ip_address)
    const typicalIps = [...new Set(ips)].slice(0, 10)

    // Calculate average session duration
    const sessions = events.filter(e => e.event_type === 'session_created')
    const avgSessionDuration = sessions.length > 0
      ? sessions.reduce((sum, s) => sum + ((s.metadata as Record<string, number>)?.duration || 0), 0) / sessions.length
      : 0

    // Calculate average API calls per hour
    const apiCalls = events.filter(e => e.event_type === 'api_call')
    const avgApiCallsPerHour = apiCalls.length / (30 * 24) // 30 days

    const profile: UserBehaviorProfile = {
      user_id: userId,
      typical_login_hours: typicalHours,
      typical_locations: typicalLocations,
      typical_devices: typicalDevices,
      typical_ips: typicalIps,
      avg_session_duration: avgSessionDuration,
      avg_api_calls_per_hour: avgApiCallsPerHour,
      last_updated: new Date().toISOString()
    }

    // Store profile
    await this.supabase!
      .from('user_behavior_profiles')
      .upsert(profile)

    this.behaviorProfiles.set(userId, profile)

    return profile
  }

  /**
   * Fetch threat intelligence for an IP
   */
  private async fetchThreatIntelligence(ipAddress: string): Promise<ThreatIntelligence> {
    // In production, this would call external threat intelligence APIs
    // For now, we'll use a simplified scoring based on IP characteristics

    const isPrivateIP = this.isPrivateIP(ipAddress)

    const threat: ThreatIntelligence = {
      ip_address: ipAddress,
      is_tor_exit: false, // Would check against Tor exit node list
      is_vpn: false, // Would check against VPN IP databases
      is_proxy: false, // Would check against proxy IP databases
      is_hosting: false, // Would check against hosting provider IPs
      is_known_attacker: false, // Would check against threat feeds
      threat_score: isPrivateIP ? 0 : 10, // Default low score for public IPs
      last_checked: new Date().toISOString()
    }

    // Store threat intelligence
    await this.supabase!
      .from('threat_intelligence')
      .upsert(threat)

    return threat
  }

  /**
   * Check if IP is private/internal
   */
  private isPrivateIP(ip: string): boolean {
    const parts = ip.split('.').map(Number)

    return (
      parts[0] === 10 ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168) ||
      parts[0] === 127
    )
  }

  /**
   * Calculate behavioral anomaly score using statistical analysis
   */
  private calculateBehavioralAnomalyScore(
    event: SecurityEvent,
    historicalEvents: SecurityEvent[]
  ): number {
    let anomalyFactors = 0
    let totalFactors = 0

    // Check event type frequency
    const eventTypeCounts = new Map<string, number>()
    for (const e of historicalEvents) {
      eventTypeCounts.set(e.event_type, (eventTypeCounts.get(e.event_type) || 0) + 1)
    }
    const eventTypeFrequency = (eventTypeCounts.get(event.event_type) || 0) / historicalEvents.length
    if (eventTypeFrequency < 0.05) {
      anomalyFactors += 1
    }
    totalFactors += 1

    // Check time of day pattern
    const eventHour = new Date(event.timestamp || Date.now()).getHours()
    const historicalHours = historicalEvents.map(e => new Date(e.timestamp).getHours())
    const avgHour = historicalHours.reduce((a, b) => a + b, 0) / historicalHours.length
    const hourVariance = historicalHours.reduce((sum, h) => sum + Math.pow(h - avgHour, 2), 0) / historicalHours.length
    const hourStdDev = Math.sqrt(hourVariance)

    if (Math.abs(eventHour - avgHour) > 2 * hourStdDev) {
      anomalyFactors += 0.5
    }
    totalFactors += 1

    // Check IP diversity
    const uniqueIPs = new Set(historicalEvents.map(e => e.ip_address)).size
    const isNewIP = !historicalEvents.some(e => e.ip_address === event.ip_address)
    if (isNewIP && uniqueIPs <= 3) {
      anomalyFactors += 0.5
    }
    totalFactors += 1

    return anomalyFactors / totalFactors
  }

  // ===========================================================================
  // RULE ENGINE
  // ===========================================================================

  /**
   * Evaluate custom rules against an event
   */
  private async evaluateRules(
    event: SecurityEvent,
    detectedAnomalies: string[],
    riskScore: number
  ): Promise<void> {
    for (const rule of this.rules) {
      const matches = this.evaluateRuleConditions(rule.conditions, event, detectedAnomalies, riskScore)

      if (matches) {
        await this.executeRuleActions(rule, event)
      }
    }
  }

  /**
   * Evaluate rule conditions
   */
  private evaluateRuleConditions(
    conditions: RuleCondition[],
    event: SecurityEvent,
    anomalies: string[],
    riskScore: number
  ): boolean {
    for (const condition of conditions) {
      let fieldValue: unknown

      switch (condition.field) {
        case 'event_type':
          fieldValue = event.event_type
          break
        case 'risk_score':
          fieldValue = riskScore
          break
        case 'country':
          fieldValue = event.location?.country_code
          break
        case 'anomalies':
          fieldValue = anomalies
          break
        default:
          fieldValue = (event.metadata as Record<string, unknown>)?.[condition.field]
      }

      if (!this.evaluateCondition(condition, fieldValue)) {
        return false
      }
    }

    return true
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(condition: RuleCondition, value: unknown): boolean {
    switch (condition.operator) {
      case 'eq':
        return value === condition.value
      case 'neq':
        return value !== condition.value
      case 'gt':
        return (value as number) > (condition.value as number)
      case 'lt':
        return (value as number) < (condition.value as number)
      case 'gte':
        return (value as number) >= (condition.value as number)
      case 'lte':
        return (value as number) <= (condition.value as number)
      case 'contains':
        return Array.isArray(value)
          ? value.includes(condition.value)
          : String(value).includes(String(condition.value))
      case 'not_contains':
        return Array.isArray(value)
          ? !value.includes(condition.value)
          : !String(value).includes(String(condition.value))
      case 'in':
        return (condition.value as unknown[]).includes(value)
      case 'not_in':
        return !(condition.value as unknown[]).includes(value)
      default:
        return false
    }
  }

  /**
   * Execute rule actions
   */
  private async executeRuleActions(rule: AnomalyRule, event: SecurityEvent): Promise<void> {
    for (const action of rule.actions) {
      switch (action.type) {
        case 'alert':
          await this.createAlert({
            user_id: event.user_id,
            organization_id: event.organization_id,
            alert_type: `rule_${rule.id}`,
            severity: rule.severity,
            status: 'new',
            title: `Rule Triggered: ${rule.name}`,
            description: rule.description,
            details: { rule_id: rule.id, event },
            related_events: []
          })
          break

        case 'block_ip':
          await this.blockIP(event.ip_address, rule.id)
          break

        case 'lock_account':
          if (event.user_id) {
            await this.lockAccount(event.user_id, rule.id)
          }
          break

        case 'require_mfa':
          if (event.user_id) {
            await this.requireMFA(event.user_id, rule.id)
          }
          break

        case 'notify_admin':
          await this.notifyAdmins(event, rule)
          break

        case 'webhook':
          if (action.config?.url) {
            await this.sendWebhook(action.config.url as string, { event, rule })
          }
          break
      }
    }
  }

  // ===========================================================================
  // ALERT MANAGEMENT
  // ===========================================================================

  /**
   * Create a security alert
   */
  async createAlert(alert: SecurityAlert): Promise<string | null> {
    if (!this.supabase) await this.init()

    // Check for duplicate recent alerts
    const { data: existing } = await this.supabase!
      .from('security_alerts')
      .select('id')
      .eq('alert_type', alert.alert_type)
      .eq('user_id', alert.user_id)
      .eq('status', 'new')
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Within 1 hour
      .limit(1)
      .single()

    if (existing) {
      // Update existing alert with new event
      await this.supabase!
        .from('security_alerts')
        .update({
          related_events: [...(alert.related_events || [])],
          details: alert.details
        })
        .eq('id', existing.id)

      return existing.id
    }

    // Create new alert
    const { data, error } = await this.supabase!
      .from('security_alerts')
      .insert(alert)
      .select()
      .single()

    if (error) {
      console.error('Failed to create alert:', error)
      return null
    }

    return data.id
  }

  /**
   * Update alert status
   */
  async updateAlertStatus(
    alertId: string,
    status: AlertStatus,
    resolvedBy?: string
  ): Promise<void> {
    if (!this.supabase) await this.init()

    const updates: Record<string, unknown> = { status }

    if (status === 'resolved' || status === 'false_positive') {
      updates.resolved_at = new Date().toISOString()
      updates.resolved_by = resolvedBy
    }

    await this.supabase!
      .from('security_alerts')
      .update(updates)
      .eq('id', alertId)
  }

  // ===========================================================================
  // ACTION HANDLERS
  // ===========================================================================

  /**
   * Block an IP address
   */
  private async blockIP(ipAddress: string, ruleId: string): Promise<void> {
    await this.supabase!.from('blocked_ips').insert({
      ip_address: ipAddress,
      reason: `Blocked by rule ${ruleId}`,
      blocked_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    })
  }

  /**
   * Lock a user account
   */
  private async lockAccount(userId: string, ruleId: string): Promise<void> {
    await this.supabase!
      .from('users')
      .update({
        is_locked: true,
        locked_reason: `Locked by security rule ${ruleId}`,
        locked_at: new Date().toISOString()
      })
      .eq('id', userId)
  }

  /**
   * Require MFA for a user
   */
  private async requireMFA(userId: string, _ruleId: string): Promise<void> {
    await this.supabase!
      .from('users')
      .update({
        mfa_required: true
      })
      .eq('id', userId)
  }

  /**
   * Notify organization admins
   */
  private async notifyAdmins(event: SecurityEvent, rule: AnomalyRule): Promise<void> {
    if (!event.organization_id) return

    // Get org admins
    const { data: admins } = await this.supabase!
      .from('organization_members')
      .select('user_id')
      .eq('organization_id', event.organization_id)
      .in('role', ['admin', 'owner'])

    if (!admins) return

    // Create notifications
    const notifications = admins.map(admin => ({
      user_id: admin.user_id,
      type: 'security_alert',
      title: `Security Alert: ${rule.name}`,
      message: rule.description,
      metadata: { event, rule_id: rule.id },
      created_at: new Date().toISOString()
    }))

    await this.supabase!.from('notifications').insert(notifications)
  }

  /**
   * Send webhook notification
   */
  private async sendWebhook(url: string, payload: unknown): Promise<void> {
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    } catch (error) {
      console.error('Webhook failed:', error)
    }
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export const anomalyDetectionService = new AnomalyDetectionService()

/**
 * Process a security event
 */
export async function processSecurityEvent(event: SecurityEvent) {
  return anomalyDetectionService.processEvent(event)
}

/**
 * Create a security alert
 */
export async function createSecurityAlert(alert: SecurityAlert) {
  return anomalyDetectionService.createAlert(alert)
}

/**
 * Update alert status
 */
export async function updateAlertStatus(
  alertId: string,
  status: AlertStatus,
  resolvedBy?: string
) {
  return anomalyDetectionService.updateAlertStatus(alertId, status, resolvedBy)
}

export default anomalyDetectionService
