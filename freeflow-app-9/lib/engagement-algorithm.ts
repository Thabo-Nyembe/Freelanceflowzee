/**
 * KAZI Engagement Algorithm
 *
 * Machine learning-inspired algorithm that learns from user behavior
 * to increase engagement and provide personalized recommendations.
 *
 * Key Features:
 * - Behavior pattern recognition
 * - Personalized recommendations
 * - Engagement scoring
 * - Churn prediction
 * - Feature adoption suggestions
 */

import { createClient } from '@/lib/supabase/client'

// ============================================================================
// TYPES
// ============================================================================

export interface UserBehaviorProfile {
  userId: string

  // Activity patterns
  activeHours: number[] // 0-23 hours
  activeDays: number[] // 0-6 (Sunday-Saturday)
  avgSessionDuration: number // seconds
  sessionsPerWeek: number

  // Feature usage patterns
  topFeatures: string[]
  featureFrequency: Record<string, number>
  unusedFeatures: string[]

  // Engagement metrics
  engagementScore: number
  retentionScore: number
  churnRisk: 'low' | 'medium' | 'high'

  // User tier
  tier: 'new' | 'casual' | 'active' | 'power' | 'champion'

  // Preferences
  preferredViewMode: string
  preferredDashboardWidgets: string[]
}

export interface Recommendation {
  id: string
  type: 'feature' | 'action' | 'content' | 'tutorial' | 'upsell'
  title: string
  description: string
  actionUrl?: string
  priority: number // 0-100
  relevanceScore: number // 0-100
  reason: string
  expiresAt?: Date
}

export interface EngagementInsight {
  type: 'positive' | 'warning' | 'opportunity'
  metric: string
  value: number
  trend: 'up' | 'down' | 'stable'
  message: string
  suggestion?: string
}

// ============================================================================
// FEATURE DEFINITIONS - What the algorithm tracks
// ============================================================================

const ALL_FEATURES = [
  'projects', 'tasks', 'invoices', 'clients', 'files',
  'time-tracking', 'calendar', 'messages', 'reports', 'analytics',
  'ai-assistant', 'video-studio', 'canvas', 'templates', 'workflows',
  'team-management', 'integrations', 'notifications', 'settings'
]

const FEATURE_DEPENDENCIES: Record<string, string[]> = {
  'invoices': ['projects', 'clients'],
  'reports': ['projects', 'invoices'],
  'analytics': ['projects', 'tasks'],
  'workflows': ['projects', 'tasks'],
  'team-management': ['projects'],
  'video-studio': ['files'],
  'canvas': ['files'],
}

const FEATURE_VALUE_SCORES: Record<string, number> = {
  'invoices': 90,
  'projects': 85,
  'clients': 80,
  'ai-assistant': 75,
  'workflows': 70,
  'reports': 65,
  'analytics': 60,
  'time-tracking': 55,
  'team-management': 50,
  'video-studio': 45,
  'files': 40,
  'tasks': 35,
  'messages': 30,
  'calendar': 25,
  'templates': 20,
  'canvas': 15,
  'notifications': 10,
  'settings': 5,
  'integrations': 5,
}

// ============================================================================
// ENGAGEMENT ALGORITHM CLASS
// ============================================================================

export class EngagementAlgorithm {
  private supabase = createClient()
  private userId: string
  private behaviorCache: UserBehaviorProfile | null = null
  private lastCacheTime: number = 0
  private cacheLifetime = 5 * 60 * 1000 // 5 minutes

  constructor(userId: string) {
    this.userId = userId
  }

  // --------------------------------------------------------------------------
  // BEHAVIOR ANALYSIS
  // --------------------------------------------------------------------------

  /**
   * Analyze user behavior patterns from activity logs
   */
  async analyzeBehavior(): Promise<UserBehaviorProfile> {
    // Check cache
    if (this.behaviorCache && Date.now() - this.lastCacheTime < this.cacheLifetime) {
      return this.behaviorCache
    }

    // Fetch activity data from last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Gracefully handle missing tables
    let activities: any[] = []
    let sessions: any[] = []

    try {
      const { data: activityData, error: activityError } = await this.supabase
        .from('engagement_activity_log')
        .select('*')
        .eq('user_id', this.userId)
        .gte('timestamp', thirtyDaysAgo.toISOString())
        .order('timestamp', { ascending: false })

      if (!activityError) {
        activities = activityData || []
      }
    } catch (e) {
      // Table might not exist yet
    }

    try {
      const { data: sessionData, error: sessionError } = await this.supabase
        .from('engagement_sessions')
        .select('*')
        .eq('user_id', this.userId)
        .gte('started_at', thirtyDaysAgo.toISOString())

      if (!sessionError) {
        sessions = sessionData || []
      }
    } catch (e) {
      // Table might not exist yet
    }

    // Analyze active hours (0-23)
    const hourCounts = new Array(24).fill(0)
    const dayCounts = new Array(7).fill(0)
    const featureUsage: Record<string, number> = {}

    activities.forEach(activity => {
      const date = new Date(activity.timestamp)
      hourCounts[date.getHours()]++
      dayCounts[date.getDay()]++

      const feature = this.extractFeatureFromAction(activity.action_name, activity.page_path)
      featureUsage[feature] = (featureUsage[feature] || 0) + 1
    })

    // Find peak hours and days
    const activeHours = this.findPeakIndices(hourCounts, 3)
    const activeDays = this.findPeakIndices(dayCounts, 3)

    // Calculate session metrics
    const totalSessions = sessions.length
    const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0)
    const avgSessionDuration = totalSessions > 0 ? totalDuration / totalSessions : 0
    const sessionsPerWeek = totalSessions / 4 // 30 days ≈ 4 weeks

    // Sort features by usage
    const sortedFeatures = Object.entries(featureUsage)
      .sort((a, b) => b[1] - a[1])
    const topFeatures = sortedFeatures.slice(0, 5).map(([f]) => f)
    const usedFeatures = new Set(sortedFeatures.map(([f]) => f))
    const unusedFeatures = ALL_FEATURES.filter(f => !usedFeatures.has(f))

    // Calculate scores
    const engagementScore = this.calculateEngagementScore(activities.length, totalSessions, avgSessionDuration)
    const retentionScore = this.calculateRetentionScore(activities)
    const churnRisk = this.predictChurnRisk(engagementScore, retentionScore, activities)
    const tier = this.determineUserTier(engagementScore, topFeatures.length, sessionsPerWeek)

    const profile: UserBehaviorProfile = {
      userId: this.userId,
      activeHours,
      activeDays,
      avgSessionDuration,
      sessionsPerWeek,
      topFeatures,
      featureFrequency: featureUsage,
      unusedFeatures,
      engagementScore,
      retentionScore,
      churnRisk,
      tier,
      preferredViewMode: 'grid',
      preferredDashboardWidgets: topFeatures.slice(0, 4)
    }

    // Cache the result
    this.behaviorCache = profile
    this.lastCacheTime = Date.now()

    // Store in database (gracefully handle missing tables)
    try {
      await this.storeBehaviorProfile(profile)
    } catch (e) {
      // Tables might not exist yet
    }

    return profile
  }

  private extractFeatureFromAction(actionName: string, pagePath?: string): string {
    // Extract feature from page path
    if (pagePath) {
      const match = pagePath.match(/\/dashboard\/([^\/]+)/)
      if (match && match[1]) {
        return match[1].replace(/-v2$/, '')
      }
    }

    // Extract from action name
    for (const feature of ALL_FEATURES) {
      if (actionName.toLowerCase().includes(feature)) {
        return feature
      }
    }

    return 'dashboard'
  }

  private findPeakIndices(arr: number[], count: number): number[] {
    return arr
      .map((value, index) => ({ value, index }))
      .sort((a, b) => b.value - a.value)
      .slice(0, count)
      .map(item => item.index)
  }

  private calculateEngagementScore(activityCount: number, sessionCount: number, avgDuration: number): number {
    // Weighted engagement score
    const activityScore = Math.min(activityCount / 100, 1) * 40
    const sessionScore = Math.min(sessionCount / 30, 1) * 30
    const durationScore = Math.min(avgDuration / 1800, 1) * 30 // 30 min = max

    return Math.round(activityScore + sessionScore + durationScore)
  }

  private calculateRetentionScore(activities: any[]): number {
    if (activities.length === 0) return 0

    // Check activity distribution over weeks
    const weekCounts = [0, 0, 0, 0]
    const now = new Date()

    activities.forEach(activity => {
      const date = new Date(activity.timestamp)
      const weeksAgo = Math.floor((now.getTime() - date.getTime()) / (7 * 24 * 60 * 60 * 1000))
      if (weeksAgo < 4) {
        weekCounts[weeksAgo]++
      }
    })

    // Score based on consistency
    const activeWeeks = weekCounts.filter(c => c > 0).length
    const trend = weekCounts[0] >= weekCounts[3] ? 1.2 : 0.8 // Recent activity bonus

    return Math.min(100, Math.round((activeWeeks / 4) * 100 * trend))
  }

  private predictChurnRisk(engagementScore: number, retentionScore: number, activities: any[]): 'low' | 'medium' | 'high' {
    // Days since last activity
    const lastActivity = activities[0]
    const daysSinceActive = lastActivity
      ? Math.floor((Date.now() - new Date(lastActivity.timestamp).getTime()) / (24 * 60 * 60 * 1000))
      : 30

    const combinedScore = (engagementScore * 0.4) + (retentionScore * 0.4) + (Math.max(0, 30 - daysSinceActive) / 30 * 20)

    if (combinedScore >= 60) return 'low'
    if (combinedScore >= 30) return 'medium'
    return 'high'
  }

  private determineUserTier(engagementScore: number, featureCount: number, sessionsPerWeek: number): UserBehaviorProfile['tier'] {
    const score = engagementScore + (featureCount * 5) + (sessionsPerWeek * 2)

    if (score >= 100) return 'champion'
    if (score >= 70) return 'power'
    if (score >= 40) return 'active'
    if (score >= 20) return 'casual'
    return 'new'
  }

  private async storeBehaviorProfile(profile: UserBehaviorProfile): Promise<void> {
    await this.supabase
      .from('engagement_analytics')
      .upsert({
        user_id: this.userId,
        engagement_score: profile.engagementScore,
        retention_score: profile.retentionScore,
        user_tier: profile.tier,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })

    await this.supabase
      .from('engagement_preferences')
      .upsert({
        user_id: this.userId,
        most_used_features: profile.topFeatures,
        best_active_hours: profile.activeHours.map(h => `${h}:00`),
        best_active_days: profile.activeDays.map(d => ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][d]),
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
  }

  // --------------------------------------------------------------------------
  // RECOMMENDATION ENGINE
  // --------------------------------------------------------------------------

  /**
   * Generate personalized recommendations based on user behavior
   */
  async getRecommendations(limit: number = 5): Promise<Recommendation[]> {
    const profile = await this.analyzeBehavior()
    const recommendations: Recommendation[] = []

    // 1. Feature discovery recommendations
    const featureRecs = this.generateFeatureRecommendations(profile)
    recommendations.push(...featureRecs)

    // 2. Action recommendations based on time
    const actionRecs = this.generateActionRecommendations(profile)
    recommendations.push(...actionRecs)

    // 3. Re-engagement recommendations for at-risk users
    if (profile.churnRisk !== 'low') {
      const reengageRecs = this.generateReengagementRecommendations(profile)
      recommendations.push(...reengageRecs)
    }

    // 4. Upsell recommendations for power users
    if (profile.tier === 'power' || profile.tier === 'champion') {
      const upsellRecs = this.generateUpsellRecommendations(profile)
      recommendations.push(...upsellRecs)
    }

    // Sort by priority and relevance
    recommendations.sort((a, b) => {
      const scoreA = a.priority * 0.6 + a.relevanceScore * 0.4
      const scoreB = b.priority * 0.6 + b.relevanceScore * 0.4
      return scoreB - scoreA
    })

    // Store recommendations
    await this.storeRecommendations(recommendations.slice(0, limit))

    return recommendations.slice(0, limit)
  }

  private generateFeatureRecommendations(profile: UserBehaviorProfile): Recommendation[] {
    const recommendations: Recommendation[] = []

    // Find high-value unused features
    for (const feature of profile.unusedFeatures) {
      const value = FEATURE_VALUE_SCORES[feature] || 0

      // Check if user has dependencies for this feature
      const dependencies = FEATURE_DEPENDENCIES[feature] || []
      const hasDependencies = dependencies.every(dep => profile.topFeatures.includes(dep))

      if (value >= 50 && (dependencies.length === 0 || hasDependencies)) {
        recommendations.push({
          id: `feature-${feature}-${Date.now()}`,
          type: 'feature',
          title: `Discover ${this.formatFeatureName(feature)}`,
          description: this.getFeatureDescription(feature),
          actionUrl: `/dashboard/${feature}-v2`,
          priority: value,
          relevanceScore: hasDependencies ? 90 : 70,
          reason: hasDependencies
            ? `Based on your use of ${dependencies.join(' and ')}, you might find this helpful`
            : `This feature can boost your productivity`
        })
      }
    }

    return recommendations.slice(0, 3)
  }

  private generateActionRecommendations(profile: UserBehaviorProfile): Recommendation[] {
    const recommendations: Recommendation[] = []
    const hour = new Date().getHours()

    // If current time is in user's active hours, suggest actions
    if (profile.activeHours.includes(hour)) {
      const topFeature = profile.topFeatures[0]

      if (topFeature === 'projects') {
        recommendations.push({
          id: `action-project-${Date.now()}`,
          type: 'action',
          title: 'Review your projects',
          description: 'You usually work on projects at this time. Would you like to check your active projects?',
          actionUrl: '/dashboard/projects-hub-v2',
          priority: 80,
          relevanceScore: 85,
          reason: 'This is your peak productivity hour'
        })
      }

      if (topFeature === 'tasks' || profile.topFeatures.includes('tasks')) {
        recommendations.push({
          id: `action-tasks-${Date.now()}`,
          type: 'action',
          title: 'Check your tasks',
          description: 'Start your productive session by reviewing pending tasks',
          actionUrl: '/dashboard/tasks-v2',
          priority: 75,
          relevanceScore: 80,
          reason: 'Task management is one of your top activities'
        })
      }
    }

    return recommendations
  }

  private generateReengagementRecommendations(profile: UserBehaviorProfile): Recommendation[] {
    const recommendations: Recommendation[] = []

    if (profile.churnRisk === 'high') {
      recommendations.push({
        id: `reengage-tutorial-${Date.now()}`,
        type: 'tutorial',
        title: 'Get more from KAZI',
        description: 'Discover features that can save you hours every week',
        actionUrl: '/dashboard/getting-started',
        priority: 95,
        relevanceScore: 90,
        reason: 'We want to help you get the most out of KAZI'
      })
    }

    if (profile.churnRisk === 'medium') {
      const suggestedFeature = profile.unusedFeatures.find(f => FEATURE_VALUE_SCORES[f] >= 60)
      if (suggestedFeature) {
        recommendations.push({
          id: `reengage-feature-${Date.now()}`,
          type: 'feature',
          title: `Try ${this.formatFeatureName(suggestedFeature)}`,
          description: 'This feature might be exactly what you need',
          actionUrl: `/dashboard/${suggestedFeature}-v2`,
          priority: 85,
          relevanceScore: 75,
          reason: 'Many users like you find this feature valuable'
        })
      }
    }

    return recommendations
  }

  private generateUpsellRecommendations(profile: UserBehaviorProfile): Recommendation[] {
    const recommendations: Recommendation[] = []

    if (profile.tier === 'champion') {
      recommendations.push({
        id: `upsell-team-${Date.now()}`,
        type: 'upsell',
        title: 'Invite your team',
        description: 'Collaborate with team members and multiply your productivity',
        actionUrl: '/dashboard/team-management-v2',
        priority: 70,
        relevanceScore: 85,
        reason: 'You\'re a power user - your team would benefit from KAZI too'
      })
    }

    return recommendations
  }

  private formatFeatureName(feature: string): string {
    return feature
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  private getFeatureDescription(feature: string): string {
    const descriptions: Record<string, string> = {
      'invoices': 'Create professional invoices and get paid faster',
      'analytics': 'Get insights into your business performance',
      'reports': 'Generate detailed reports for clients and stakeholders',
      'workflows': 'Automate repetitive tasks and save time',
      'ai-assistant': 'Let AI help you with content, analysis, and more',
      'video-studio': 'Create stunning videos for your projects',
      'time-tracking': 'Track time spent on projects accurately',
      'team-management': 'Collaborate with your team effectively',
      'integrations': 'Connect with your favorite tools',
    }
    return descriptions[feature] || `Explore the ${this.formatFeatureName(feature)} feature`
  }

  private async storeRecommendations(recommendations: Recommendation[]): Promise<void> {
    for (const rec of recommendations) {
      await this.supabase
        .from('engagement_recommendations')
        .upsert({
          user_id: this.userId,
          recommendation_type: rec.type,
          title: rec.title,
          description: rec.description,
          priority: rec.priority,
          trigger_reason: rec.reason,
          action_url: rec.actionUrl,
          relevance_score: rec.relevanceScore,
          status: 'pending'
        })
    }
  }

  // --------------------------------------------------------------------------
  // ENGAGEMENT INSIGHTS
  // --------------------------------------------------------------------------

  /**
   * Get engagement insights for the user
   */
  async getInsights(): Promise<EngagementInsight[]> {
    const profile = await this.analyzeBehavior()
    const insights: EngagementInsight[] = []

    // Engagement score insight
    const engagementInsight: EngagementInsight = {
      type: profile.engagementScore >= 60 ? 'positive' : profile.engagementScore >= 30 ? 'warning' : 'opportunity',
      metric: 'Engagement Score',
      value: profile.engagementScore,
      trend: 'stable',
      message: profile.engagementScore >= 60
        ? 'You\'re highly engaged with KAZI!'
        : 'There are features that could help you more'
    }
    if (profile.engagementScore < 60) {
      engagementInsight.suggestion = 'Try exploring the AI Assistant for quick wins'
    }
    insights.push(engagementInsight)

    // Session frequency insight
    const sessionInsight: EngagementInsight = {
      type: profile.sessionsPerWeek >= 5 ? 'positive' : 'opportunity',
      metric: 'Weekly Sessions',
      value: Math.round(profile.sessionsPerWeek),
      trend: 'stable',
      message: `You use KAZI about ${Math.round(profile.sessionsPerWeek)} times per week`
    }
    if (profile.sessionsPerWeek < 3) {
      sessionInsight.suggestion = 'Regular use helps you stay on top of projects'
    }
    insights.push(sessionInsight)

    // Feature adoption insight
    const featureAdoption = (profile.topFeatures.length / ALL_FEATURES.length) * 100
    const featureInsight: EngagementInsight = {
      type: featureAdoption >= 50 ? 'positive' : 'opportunity',
      metric: 'Feature Adoption',
      value: Math.round(featureAdoption),
      trend: 'stable',
      message: `You're using ${profile.topFeatures.length} of ${ALL_FEATURES.length} features`
    }
    if (featureAdoption < 50 && profile.unusedFeatures[0]) {
      featureInsight.suggestion = `Try ${profile.unusedFeatures[0]} to boost productivity`
    }
    insights.push(featureInsight)

    return insights
  }

  // --------------------------------------------------------------------------
  // ACTIVITY TRACKING
  // --------------------------------------------------------------------------

  /**
   * Log a user activity
   */
  async logActivity(action: {
    type: string
    name: string
    entityType?: string
    entityId?: string
    pagePath?: string
    metadata?: Record<string, any>
    duration?: number
  }): Promise<void> {
    try {
      await this.supabase
        .from('engagement_activity_log')
        .insert({
          user_id: this.userId,
          action_type: action.type,
          action_name: action.name,
          entity_type: action.entityType,
          entity_id: action.entityId,
          page_path: action.pagePath,
          metadata: action.metadata || {},
          duration: action.duration
        })

      // Invalidate cache
      this.behaviorCache = null
    } catch (e) {
      // Table might not exist yet
    }
  }

  /**
   * Start a new session
   */
  async startSession(context: {
    deviceType?: string
    browser?: string
    os?: string
    screenSize?: string
  }): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('engagement_sessions')
        .insert({
          user_id: this.userId,
          device_type: context.deviceType,
          browser: context.browser,
          os: context.os,
          screen_size: context.screenSize
        })
        .select('id')
        .single()

      if (error) return null
      return data?.id
    } catch (e) {
      return null
    }
  }

  /**
   * End a session
   */
  async endSession(sessionId: string, pagesViewed: number, actionsCount: number, featuresUsed: string[]): Promise<void> {
    if (!sessionId) return

    try {
      const { data: session } = await this.supabase
        .from('engagement_sessions')
        .select('started_at')
        .eq('id', sessionId)
        .single()

      if (session) {
        const duration = Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000)

        await this.supabase
          .from('engagement_sessions')
          .update({
            ended_at: new Date().toISOString(),
            duration,
            pages_viewed: pagesViewed,
            actions_taken: actionsCount,
            features_used: featuresUsed
          })
          .eq('id', sessionId)

        // Update engagement analytics
        await this.supabase
          .from('engagement_analytics')
          .upsert({
            user_id: this.userId,
            total_sessions: 1,
            total_time_spent: duration,
            last_session_at: new Date().toISOString()
          }, { onConflict: 'user_id' })
      }
    } catch (e) {
      // Tables might not exist yet
    }
  }

  // --------------------------------------------------------------------------
  // MILESTONE TRACKING
  // --------------------------------------------------------------------------

  /**
   * Check and award milestones
   */
  async checkMilestones(): Promise<string[]> {
    try {
      const profile = await this.analyzeBehavior()
      const awardedMilestones: string[] = []

      const milestoneChecks = [
        { type: 'first_login', condition: true, name: 'Welcome to KAZI', description: 'Started your journey' },
        { type: 'first_project', condition: (profile.featureFrequency?.['projects'] ?? 0) >= 1, name: 'Project Pioneer', description: 'Created your first project' },
        { type: 'first_invoice', condition: (profile.featureFrequency?.['invoices'] ?? 0) >= 1, name: 'Getting Paid', description: 'Sent your first invoice' },
        { type: 'power_user', condition: profile.tier === 'power' || profile.tier === 'champion', name: 'Power User', description: 'Achieved power user status' },
        { type: 'feature_explorer', condition: profile.topFeatures.length >= 5, name: 'Feature Explorer', description: 'Used 5+ features' },
        { type: 'consistent_user', condition: profile.retentionScore >= 80, name: 'Consistent Contributor', description: 'Active for 4 weeks straight' },
      ]

      for (const milestone of milestoneChecks) {
        if (milestone.condition) {
          try {
            const { data: existing } = await this.supabase
              .from('user_milestones')
              .select('id')
              .eq('user_id', this.userId)
              .eq('milestone_type', milestone.type)
              .single()

            if (!existing) {
              await this.supabase
                .from('user_milestones')
                .insert({
                  user_id: this.userId,
                  milestone_type: milestone.type,
                  milestone_name: milestone.name,
                  description: milestone.description
                })
              awardedMilestones.push(milestone.name)
            }
          } catch (e) {
            // Table might not exist
          }
        }
      }

      return awardedMilestones
    } catch (e) {
      return []
    }
  }
}

// ============================================================================
// INVESTOR METRICS AGGREGATOR
// ============================================================================

export class InvestorMetricsAggregator {
  private supabase = createClient()

  /**
   * Generate daily investor metrics
   */
  async generateDailyMetrics(date: Date = new Date()): Promise<void> {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    // Get user counts
    const { count: totalUsers } = await this.supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    const { count: newUsers } = await this.supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString())

    // Get session data
    const { data: sessions } = await this.supabase
      .from('engagement_sessions')
      .select('user_id, duration')
      .gte('started_at', startOfDay.toISOString())
      .lte('started_at', endOfDay.toISOString())

    const activeUsers = new Set(sessions?.map(s => s.user_id)).size
    const totalSessionDuration = sessions?.reduce((sum, s) => sum + (s.duration || 0), 0) || 0
    const avgSessionDuration = sessions?.length ? totalSessionDuration / sessions.length : 0

    // Get business metrics
    const { data: projects } = await this.supabase
      .from('projects')
      .select('id')
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString())

    const { data: invoices } = await this.supabase
      .from('invoices')
      .select('total')
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString())

    const totalRevenue = invoices?.reduce((sum, i) => sum + (i.total || 0), 0) || 0

    // Store metrics
    await this.supabase
      .from('platform_metrics')
      .upsert({
        period_start: startOfDay.toISOString().split('T')[0],
        period_end: endOfDay.toISOString().split('T')[0],
        period_type: 'daily',
        total_users: totalUsers || 0,
        new_users: newUsers || 0,
        active_users: activeUsers,
        total_sessions: sessions?.length || 0,
        avg_session_duration: Math.round(avgSessionDuration),
        avg_sessions_per_user: activeUsers > 0 ? (sessions?.length || 0) / activeUsers : 0,
        total_revenue: totalRevenue,
        avg_revenue_per_user: activeUsers > 0 ? totalRevenue / activeUsers : 0,
        total_projects_created: projects?.length || 0,
        total_invoices_sent: invoices?.length || 0
      }, { onConflict: 'period_start,period_end,period_type' })
  }

  /**
   * Get investor dashboard data
   */
  async getInvestorDashboard(days: number = 30): Promise<{
    summary: {
      totalUsers: number
      activeUsers: number
      newUsers: number
      revenue: number
      growth: number
    }
    trends: {
      date: string
      users: number
      revenue: number
      sessions: number
    }[]
    topFeatures: { name: string; usage: number }[]
    retention: {
      day1: number
      day7: number
      day30: number
    }
  }> {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get metrics for period
    const { data: metrics } = await this.supabase
      .from('platform_metrics')
      .select('*')
      .gte('period_start', startDate.toISOString().split('T')[0])
      .lte('period_end', endDate.toISOString().split('T')[0])
      .eq('period_type', 'daily')
      .order('period_start', { ascending: true })

    // Calculate summary
    const latestMetrics = metrics?.[metrics.length - 1]
    const earliestMetrics = metrics?.[0]

    const totalUsers = latestMetrics?.total_users || 0
    const activeUsers = metrics?.reduce((sum, m) => sum + m.active_users, 0) || 0
    const newUsers = metrics?.reduce((sum, m) => sum + m.new_users, 0) || 0
    const revenue = metrics?.reduce((sum, m) => sum + parseFloat(m.total_revenue || 0), 0) || 0

    const growth = earliestMetrics?.total_users
      ? ((totalUsers - earliestMetrics.total_users) / earliestMetrics.total_users) * 100
      : 0

    // Build trends
    const trends = metrics?.map(m => ({
      date: m.period_start,
      users: m.active_users,
      revenue: parseFloat(m.total_revenue || 0),
      sessions: m.total_sessions
    })) || []

    // Get top features from activity
    const { data: activities } = await this.supabase
      .from('engagement_activity_log')
      .select('action_name')
      .gte('timestamp', startDate.toISOString())

    const featureCounts: Record<string, number> = {}
    activities?.forEach(a => {
      const feature = a.action_name.split('_')[0]
      featureCounts[feature] = (featureCounts[feature] || 0) + 1
    })

    const topFeatures = Object.entries(featureCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, usage]) => ({ name, usage }))

    return {
      summary: {
        totalUsers,
        activeUsers: Math.round(activeUsers / (days || 1)),
        newUsers,
        revenue,
        growth: Math.round(growth * 10) / 10
      },
      trends,
      topFeatures,
      retention: {
        day1: latestMetrics?.day_1_retention || 0,
        day7: latestMetrics?.day_7_retention || 0,
        day30: latestMetrics?.day_30_retention || 0
      }
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export function createEngagementAlgorithm(userId: string): EngagementAlgorithm {
  return new EngagementAlgorithm(userId)
}

export function createInvestorMetricsAggregator(): InvestorMetricsAggregator {
  return new InvestorMetricsAggregator()
}
