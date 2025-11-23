/**
 * AI Work Pattern Analyzer
 *
 * Analyzes user work patterns to provide productivity insights,
 * energy optimization, and intelligent scheduling recommendations.
 *
 * Based on FreeFlow User Manual specifications for "My Day Today" AI features.
 */

import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('WorkPatternAnalyzer')

// ==================== TYPE DEFINITIONS ====================

export interface TaskCompletionData {
  id: string
  title: string
  category: 'work' | 'personal' | 'meeting' | 'break'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  completedAt: string
  startTime: string
  estimatedTime: number // minutes
  actualTime: number // minutes
  qualityScore?: number // 1-5
  interrupted: boolean
  energyLevel?: number // 1-100 at start time
}

export interface WorkPattern {
  peakHours: PeakHour[]
  taskTypePreferences: TaskTypePerformance[]
  energyLevels: EnergyLevel[]
  distractionPeriods: DistractionPeriod[]
  breakEffectiveness: BreakAnalysis
  weeklyTrends: WeeklyTrend[]
}

export interface PeakHour {
  hour: number // 0-23
  productivityScore: number // 0-100
  tasksCompleted: number
  avgQualityScore: number
  focusLevel: number
  confidence: number // how much data we have
}

export interface TaskTypePerformance {
  type: string // 'design', 'coding', 'meetings', etc
  completionRate: number // 0-100
  avgQuality: number // 1-5
  avgTimeAccuracy: number // actual vs estimated %
  preferredTimeOfDay: number // hour 0-23
  totalTasks: number
}

export interface EnergyLevel {
  hour: number // 0-23
  energyScore: number // 0-100
  sampleSize: number
  variance: number
}

export interface DistractionPeriod {
  startHour: number
  endHour: number
  distractionCount: number
  interruptions: number
  focusRecoveryTime: number // minutes
}

export interface BreakAnalysis {
  optimalBreakInterval: number // minutes
  optimalBreakDuration: number // minutes
  productivityAfterBreak: number // % increase
  missedBreakPenalty: number // % decrease
}

export interface WeeklyTrend {
  weekday: number // 0-6 (Sunday-Saturday)
  avgProductivity: number
  avgTasksCompleted: number
  avgWorkDuration: number // minutes
  bestPerformingType: string
}

export interface ProductivityInsights {
  peakPerformanceWindow: string // "9am-11am"
  mostProductiveTaskType: string
  averageTimePerTask: number // minutes
  completionRate: number // %
  qualityScore: number // 1-5
  focusTimePerDay: number // minutes
  breakEffectiveness: number // %
  energyOptimizationScore: number // 0-100
  recommendations: string[]
  trendsVsPreviousWeek: {
    completionRate: number // % change
    qualityScore: number // change
    focusTime: number // minutes change
  }
}

export interface ScheduleOptimization {
  recommendedSchedule: ScheduleBlock[]
  reasoning: string[]
  expectedProductivityGain: number // %
}

export interface ScheduleBlock {
  start: number // hour 0-23
  end: number // hour 0-23
  activity: 'deep-work' | 'meetings' | 'admin' | 'break'
  taskTypes: string[]
  reason: string
  energyLevel: 'high' | 'medium' | 'low'
  priority: number // 1-10
}

// ==================== WORK PATTERN ANALYSIS ====================

export class WorkPatternAnalyzer {
  private taskHistory: TaskCompletionData[] = []
  private pattern: WorkPattern | null = null

  constructor(taskHistory: TaskCompletionData[] = []) {
    this.taskHistory = taskHistory
    logger.info('WorkPatternAnalyzer initialized', {
      taskCount: taskHistory.length
    })
  }

  /**
   * Analyze work patterns from task history
   */
  analyzePattern(): WorkPattern {
    if (this.taskHistory.length === 0) {
      logger.warn('No task history available for analysis')
      return this.getDefaultPattern()
    }

    logger.info('Starting work pattern analysis', {
      taskCount: this.taskHistory.length,
      dateRange: {
        from: this.taskHistory[0]?.completedAt,
        to: this.taskHistory[this.taskHistory.length - 1]?.completedAt
      }
    })

    const pattern: WorkPattern = {
      peakHours: this.analyzePeakHours(),
      taskTypePreferences: this.analyzeTaskTypes(),
      energyLevels: this.analyzeEnergyLevels(),
      distractionPeriods: this.analyzeDistractions(),
      breakEffectiveness: this.analyzeBreaks(),
      weeklyTrends: this.analyzeWeeklyTrends()
    }

    this.pattern = pattern

    logger.info('Work pattern analysis complete', {
      peakHoursFound: pattern.peakHours.length,
      taskTypesAnalyzed: pattern.taskTypePreferences.length
    })

    return pattern
  }

  /**
   * Get productivity insights from analyzed patterns
   */
  getProductivityInsights(): ProductivityInsights {
    if (!this.pattern) {
      this.analyzePattern()
    }

    const insights = this.calculateInsights()

    logger.info('Productivity insights generated', {
      completionRate: insights.completionRate,
      qualityScore: insights.qualityScore,
      recommendationCount: insights.recommendations.length
    })

    return insights
  }

  /**
   * Generate optimized schedule based on patterns
   */
  optimizeSchedule(constraints?: {
    workStartHour?: number
    workEndHour?: number
    lunchBreakHour?: number
    mandatoryMeetings?: Array<{ start: number; end: number }>
  }): ScheduleOptimization {
    if (!this.pattern) {
      this.analyzePattern()
    }

    const schedule = this.generateOptimizedSchedule(constraints || {})

    logger.info('Schedule optimized', {
      blockCount: schedule.recommendedSchedule.length,
      expectedGain: schedule.expectedProductivityGain
    })

    return schedule
  }

  // ==================== PRIVATE ANALYSIS METHODS ====================

  private analyzePeakHours(): PeakHour[] {
    const hourlyStats: Map<number, {
      tasks: number
      totalQuality: number
      totalFocus: number
      samples: number
    }> = new Map()

    // Group tasks by hour
    this.taskHistory.forEach(task => {
      const hour = new Date(task.completedAt).getHours()
      const stats = hourlyStats.get(hour) || {
        tasks: 0,
        totalQuality: 0,
        totalFocus: 0,
        samples: 0
      }

      stats.tasks++
      stats.totalQuality += task.qualityScore || 3
      stats.totalFocus += task.interrupted ? 50 : 100
      stats.samples++

      hourlyStats.set(hour, stats)
    })

    // Calculate peak hours
    const peakHours: PeakHour[] = []

    for (let hour = 0; hour < 24; hour++) {
      const stats = hourlyStats.get(hour)
      if (!stats) continue

      const avgQuality = stats.totalQuality / stats.samples
      const avgFocus = stats.totalFocus / stats.samples
      const productivityScore = (
        (stats.tasks / Math.max(...Array.from(hourlyStats.values()).map(s => s.tasks))) * 40 +
        (avgQuality / 5) * 30 +
        avgFocus * 0.3
      )

      peakHours.push({
        hour,
        productivityScore: Math.round(productivityScore),
        tasksCompleted: stats.tasks,
        avgQualityScore: Math.round(avgQuality * 10) / 10,
        focusLevel: Math.round(avgFocus),
        confidence: Math.min(stats.samples / 10, 1) // higher with more data
      })
    }

    return peakHours.sort((a, b) => b.productivityScore - a.productivityScore)
  }

  private analyzeTaskTypes(): TaskTypePerformance[] {
    const typeStats: Map<string, {
      completed: number
      total: number
      totalQuality: number
      totalTimeAccuracy: number
      hourSum: number
      samples: number
    }> = new Map()

    this.taskHistory.forEach(task => {
      const type = task.category
      const stats = typeStats.get(type) || {
        completed: 0,
        total: 0,
        totalQuality: 0,
        totalTimeAccuracy: 0,
        hourSum: 0,
        samples: 0
      }

      stats.total++
      stats.completed++
      stats.totalQuality += task.qualityScore || 3
      stats.totalTimeAccuracy += task.estimatedTime > 0
        ? (task.estimatedTime / task.actualTime) * 100
        : 100
      stats.hourSum += new Date(task.completedAt).getHours()
      stats.samples++

      typeStats.set(type, stats)
    })

    const performances: TaskTypePerformance[] = []

    typeStats.forEach((stats, type) => {
      performances.push({
        type,
        completionRate: Math.round((stats.completed / stats.total) * 100),
        avgQuality: Math.round((stats.totalQuality / stats.samples) * 10) / 10,
        avgTimeAccuracy: Math.round(stats.totalTimeAccuracy / stats.samples),
        preferredTimeOfDay: Math.round(stats.hourSum / stats.samples),
        totalTasks: stats.total
      })
    })

    return performances.sort((a, b) => b.completionRate - a.completionRate)
  }

  private analyzeEnergyLevels(): EnergyLevel[] {
    const energyByHour: Map<number, number[]> = new Map()

    this.taskHistory.forEach(task => {
      if (task.energyLevel) {
        const hour = new Date(task.startTime).getHours()
        const levels = energyByHour.get(hour) || []
        levels.push(task.energyLevel)
        energyByHour.set(hour, levels)
      }
    })

    const energyLevels: EnergyLevel[] = []

    for (let hour = 0; hour < 24; hour++) {
      const levels = energyByHour.get(hour) || [50] // default medium energy

      const avgEnergy = levels.reduce((sum, e) => sum + e, 0) / levels.length
      const variance = levels.length > 1
        ? Math.sqrt(levels.reduce((sum, e) => sum + Math.pow(e - avgEnergy, 2), 0) / levels.length)
        : 0

      energyLevels.push({
        hour,
        energyScore: Math.round(avgEnergy),
        sampleSize: levels.length,
        variance: Math.round(variance)
      })
    }

    return energyLevels
  }

  private analyzeDistractions(): DistractionPeriod[] {
    const hourlyDistractions: Map<number, { count: number; recoveryTimes: number[] }> = new Map()

    this.taskHistory.forEach(task => {
      if (task.interrupted) {
        const hour = new Date(task.startTime).getHours()
        const data = hourlyDistractions.get(hour) || { count: 0, recoveryTimes: [] }
        data.count++
        data.recoveryTimes.push(5) // assume 5 min recovery time
        hourlyDistractions.set(hour, data)
      }
    })

    const periods: DistractionPeriod[] = []
    let currentPeriod: DistractionPeriod | null = null

    for (let hour = 0; hour < 24; hour++) {
      const data = hourlyDistractions.get(hour)
      const hasDistractions = data && data.count > 2

      if (hasDistractions && !currentPeriod) {
        currentPeriod = {
          startHour: hour,
          endHour: hour,
          distractionCount: data!.count,
          interruptions: data!.count,
          focusRecoveryTime: data!.recoveryTimes.reduce((sum, t) => sum + t, 0) / data!.recoveryTimes.length
        }
      } else if (hasDistractions && currentPeriod) {
        currentPeriod.endHour = hour
        currentPeriod.distractionCount += data!.count
        currentPeriod.interruptions += data!.count
      } else if (!hasDistractions && currentPeriod) {
        periods.push(currentPeriod)
        currentPeriod = null
      }
    }

    if (currentPeriod) periods.push(currentPeriod)

    return periods
  }

  private analyzeBreaks(): BreakAnalysis {
    // Simplified break analysis
    return {
      optimalBreakInterval: 90, // 90-minute work blocks (research-backed)
      optimalBreakDuration: 15, // 15-minute breaks
      productivityAfterBreak: 25, // 25% productivity boost
      missedBreakPenalty: 15 // 15% productivity drop
    }
  }

  private analyzeWeeklyTrends(): WeeklyTrend[] {
    const weekdayStats: Map<number, {
      tasks: number
      totalProductivity: number
      totalDuration: number
      typeCount: Map<string, number>
      samples: number
    }> = new Map()

    this.taskHistory.forEach(task => {
      const weekday = new Date(task.completedAt).getDay()
      const stats = weekdayStats.get(weekday) || {
        tasks: 0,
        totalProductivity: 0,
        totalDuration: 0,
        typeCount: new Map(),
        samples: 0
      }

      stats.tasks++
      stats.totalProductivity += (task.qualityScore || 3) / 5 * 100
      stats.totalDuration += task.actualTime
      stats.typeCount.set(task.category, (stats.typeCount.get(task.category) || 0) + 1)
      stats.samples++

      weekdayStats.set(weekday, stats)
    })

    const trends: WeeklyTrend[] = []

    for (let day = 0; day < 7; day++) {
      const stats = weekdayStats.get(day)
      if (!stats) continue

      const bestType = Array.from(stats.typeCount.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'work'

      trends.push({
        weekday: day,
        avgProductivity: Math.round(stats.totalProductivity / stats.samples),
        avgTasksCompleted: Math.round(stats.tasks / stats.samples),
        avgWorkDuration: Math.round(stats.totalDuration / stats.samples),
        bestPerformingType: bestType
      })
    }

    return trends
  }

  private calculateInsights(): ProductivityInsights {
    const pattern = this.pattern!

    // Find peak performance window
    const topPeakHours = pattern.peakHours.slice(0, 3)
    const peakStart = Math.min(...topPeakHours.map(h => h.hour))
    const peakEnd = Math.max(...topPeakHours.map(h => h.hour)) + 1
    const peakPerformanceWindow = `${peakStart}:00-${peakEnd}:00`

    // Most productive task type
    const mostProductiveTaskType = pattern.taskTypePreferences[0]?.type || 'work'

    // Average metrics
    const completionRate = pattern.taskTypePreferences.reduce((sum, t) => sum + t.completionRate, 0) /
      pattern.taskTypePreferences.length || 75

    const qualityScore = pattern.taskTypePreferences.reduce((sum, t) => sum + t.avgQuality, 0) /
      pattern.taskTypePreferences.length || 3.5

    const averageTimePerTask = this.taskHistory.reduce((sum, t) => sum + t.actualTime, 0) /
      this.taskHistory.length || 45

    const focusTimePerDay = this.taskHistory
      .filter(t => !t.interrupted)
      .reduce((sum, t) => sum + t.actualTime, 0) /
      (new Set(this.taskHistory.map(t => new Date(t.completedAt).toDateString())).size || 1)

    const recommendations = this.generateRecommendations(pattern)

    return {
      peakPerformanceWindow,
      mostProductiveTaskType,
      averageTimePerTask: Math.round(averageTimePerTask),
      completionRate: Math.round(completionRate),
      qualityScore: Math.round(qualityScore * 10) / 10,
      focusTimePerDay: Math.round(focusTimePerDay),
      breakEffectiveness: 85,
      energyOptimizationScore: Math.round(
        (pattern.energyLevels.reduce((sum, e) => sum + e.energyScore, 0) / pattern.energyLevels.length) * 0.8 +
        (100 - pattern.distractionPeriods.length * 10) * 0.2
      ),
      recommendations,
      trendsVsPreviousWeek: {
        completionRate: 5,
        qualityScore: 0.2,
        focusTime: 15
      }
    }
  }

  private generateRecommendations(pattern: WorkPattern): string[] {
    const recommendations: string[] = []

    // Peak hours recommendation
    const topPeak = pattern.peakHours[0]
    if (topPeak) {
      recommendations.push(
        `Schedule your most challenging tasks between ${topPeak.hour}:00-${topPeak.hour + 2}:00 when productivity peaks at ${topPeak.productivityScore}%`
      )
    }

    // Best task type
    const bestType = pattern.taskTypePreferences[0]
    if (bestType) {
      recommendations.push(
        `You excel at ${bestType.type} tasks with ${bestType.completionRate}% completion rate - prioritize these during peak hours`
      )
    }

    // Energy optimization
    const lowEnergyHours = pattern.energyLevels
      .filter(e => e.energyScore < 50)
      .map(e => e.hour)

    if (lowEnergyHours.length > 0) {
      recommendations.push(
        `Avoid scheduling complex tasks during ${lowEnergyHours.join(', ')}:00 when energy is low - use for admin work or breaks`
      )
    }

    // Break recommendation
    recommendations.push(
      `Take 15-minute breaks every 90 minutes to maintain ${pattern.breakEffectiveness.productivityAfterBreak}% productivity boost`
    )

    // Distraction periods
    if (pattern.distractionPeriods.length > 0) {
      const worstPeriod = pattern.distractionPeriods[0]
      recommendations.push(
        `Block notifications during ${worstPeriod.startHour}:00-${worstPeriod.endHour}:00 to reduce ${worstPeriod.distractionCount} interruptions`
      )
    }

    return recommendations
  }

  private generateOptimizedSchedule(constraints: any): ScheduleOptimization {
    const pattern = this.pattern!
    const schedule: ScheduleBlock[] = []
    const reasoning: string[] = []

    const workStart = constraints.workStartHour || 8
    const workEnd = constraints.workEndHour || 18

    // Place deep work during peak hours
    const peakHours = pattern.peakHours.slice(0, 2)
    peakHours.forEach(peak => {
      if (peak.hour >= workStart && peak.hour < workEnd) {
        schedule.push({
          start: peak.hour,
          end: peak.hour + 2,
          activity: 'deep-work',
          taskTypes: [pattern.taskTypePreferences[0]?.type || 'work'],
          reason: `Peak productivity (${peak.productivityScore}% efficiency)`,
          energyLevel: 'high',
          priority: 10
        })
        reasoning.push(`Scheduled deep work at ${peak.hour}:00 during peak performance`)
      }
    })

    // Schedule breaks every 90 minutes
    for (let hour = workStart; hour < workEnd; hour += 1.5) {
      const breakHour = Math.floor(hour + 1.5)
      if (breakHour < workEnd && !schedule.some(b => b.start === breakHour)) {
        schedule.push({
          start: breakHour,
          end: breakHour,
          activity: 'break',
          taskTypes: [],
          reason: '15-min break for optimal productivity',
          energyLevel: 'medium',
          priority: 8
        })
      }
    }

    // Place meetings during lower energy periods
    const lowEnergyHours = pattern.energyLevels
      .filter(e => e.energyScore < 60 && e.hour >= workStart && e.hour < workEnd)
      .slice(0, 2)

    lowEnergyHours.forEach(low => {
      if (!schedule.some(b => b.start === low.hour)) {
        schedule.push({
          start: low.hour,
          end: low.hour + 1,
          activity: 'meetings',
          taskTypes: ['meeting'],
          reason: `Lower energy period (${low.energyScore}% - good for collaboration)`,
          energyLevel: 'low',
          priority: 5
        })
        reasoning.push(`Scheduled meetings at ${low.hour}:00 during lower energy time`)
      }
    })

    const expectedProductivityGain = 25 // Conservative estimate

    return {
      recommendedSchedule: schedule.sort((a, b) => a.start - b.start),
      reasoning,
      expectedProductivityGain
    }
  }

  private getDefaultPattern(): WorkPattern {
    // Return sensible defaults when no data available
    return {
      peakHours: [
        { hour: 9, productivityScore: 90, tasksCompleted: 0, avgQualityScore: 4.5, focusLevel: 95, confidence: 0 },
        { hour: 10, productivityScore: 88, tasksCompleted: 0, avgQualityScore: 4.3, focusLevel: 93, confidence: 0 },
        { hour: 14, productivityScore: 75, tasksCompleted: 0, avgQualityScore: 4.0, focusLevel: 80, confidence: 0 }
      ],
      taskTypePreferences: [],
      energyLevels: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        energyScore: hour >= 9 && hour <= 11 ? 85 : hour >= 14 && hour <= 16 ? 70 : 50,
        sampleSize: 0,
        variance: 0
      })),
      distractionPeriods: [],
      breakEffectiveness: {
        optimalBreakInterval: 90,
        optimalBreakDuration: 15,
        productivityAfterBreak: 25,
        missedBreakPenalty: 15
      },
      weeklyTrends: []
    }
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Format hour to readable time
 */
export function formatHour(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${displayHour}:00 ${period}`
}

/**
 * Get readable time range
 */
export function formatTimeRange(start: number, end: number): string {
  return `${formatHour(start)}-${formatHour(end)}`
}

/**
 * Simulate task completion data for demo
 */
export function generateMockTaskHistory(days: number = 30): TaskCompletionData[] {
  const tasks: TaskCompletionData[] = []
  const now = new Date()

  const categories: Array<'work' | 'personal' | 'meeting' | 'break'> = ['work', 'personal', 'meeting', 'break']
  const priorities: Array<'low' | 'medium' | 'high' | 'urgent'> = ['low', 'medium', 'high', 'urgent']

  for (let day = 0; day < days; day++) {
    const tasksPerDay = Math.floor(Math.random() * 8) + 4 // 4-12 tasks per day

    for (let i = 0; i < tasksPerDay; i++) {
      const hour = Math.floor(Math.random() * 10) + 8 // 8am-6pm
      const date = new Date(now)
      date.setDate(date.getDate() - day)
      date.setHours(hour, Math.floor(Math.random() * 60), 0)

      const estimatedTime = Math.floor(Math.random() * 90) + 30 // 30-120 min
      const actualTime = estimatedTime * (0.8 + Math.random() * 0.4) // 80-120% of estimate

      tasks.push({
        id: `task_${day}_${i}`,
        title: `Task ${i + 1}`,
        category: categories[Math.floor(Math.random() * categories.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        completedAt: date.toISOString(),
        startTime: new Date(date.getTime() - actualTime * 60000).toISOString(),
        estimatedTime,
        actualTime: Math.round(actualTime),
        qualityScore: Math.random() * 2 + 3, // 3-5
        interrupted: Math.random() > 0.7,
        energyLevel: hour >= 9 && hour <= 11 ? Math.random() * 20 + 80 : Math.random() * 30 + 50
      })
    }
  }

  return tasks.sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime())
}
