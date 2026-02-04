/**
 * TIME TRACKING UTILITIES
 *
 * Comprehensive utilities for time tracking and productivity management with:
 * - Real-time timer with start/stop/pause
 * - Manual time entry creation
 * - Project and task time allocation
 * - Billable vs non-billable hours
 * - Time reports and analytics
 * - Weekly/monthly summaries
 * - Team time tracking
 * - Invoice integration
 * - Productivity insights
 * - Time export (CSV, PDF, JSON)
 */

import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('TimeTrackingUtils')

// ============================================
// TYPES & INTERFACES
// ============================================

export type EntryStatus = 'running' | 'stopped' | 'paused'
export type EntryType = 'timer' | 'manual' | 'imported'
export type ReportFormat = 'csv' | 'pdf' | 'json' | 'excel'
export type TimeRangeType = 'today' | 'yesterday' | 'this-week' | 'last-week' | 'this-month' | 'last-month' | 'custom'
export type RoundingMode = 'none' | '15min' | '30min' | '1hour'

export interface TimeEntry {
  id: string
  userId: string
  projectId: string
  projectName: string
  taskId: string
  taskName: string
  description: string
  startTime: Date
  endTime?: Date
  duration: number // in seconds
  isRunning: boolean
  isPaused: boolean
  status: EntryStatus
  type: EntryType
  billable: boolean
  hourlyRate?: number
  tags: string[]
  metadata?: EntryMetadata
  createdAt: Date
  updatedAt: Date
}

export interface EntryMetadata {
  client?: string
  location?: string
  device?: string
  pauseDuration?: number
  pauseCount?: number
  editHistory?: EditHistory[]
}

export interface EditHistory {
  editedAt: Date
  editedBy: string
  field: string
  oldValue: any
  newValue: any
}

export interface Project {
  id: string
  name: string
  color: string
  client?: string
  billable: boolean
  hourlyRate?: number
  budget?: number
  budgetType?: 'hours' | 'amount'
  tasks: Task[]
  archived: boolean
}

export interface Task {
  id: string
  name: string
  projectId: string
  estimated?: number
  spent?: number
  status: 'todo' | 'in-progress' | 'completed'
}

export interface TimeReport {
  userId: string
  startDate: Date
  endDate: Date
  totalDuration: number
  billableDuration: number
  nonBillableDuration: number
  totalAmount: number
  entries: TimeEntry[]
  projectBreakdown: ProjectBreakdown[]
  taskBreakdown: TaskBreakdown[]
  dailySummary: DailySummary[]
}

export interface ProjectBreakdown {
  projectId: string
  projectName: string
  duration: number
  billableDuration: number
  amount: number
  percentage: number
  entryCount: number
}

export interface TaskBreakdown {
  taskId: string
  taskName: string
  projectName: string
  duration: number
  amount: number
  percentage: number
  entryCount: number
}

export interface DailySummary {
  date: string
  totalDuration: number
  billableDuration: number
  entryCount: number
  amount: number
}

export interface TimeAnalytics {
  userId: string
  period: TimeRangeType
  totalHours: number
  billableHours: number
  productiveHours: number
  averageHoursPerDay: number
  mostProductiveDay: string
  mostProductiveHour: number
  topProjects: {
    projectName: string
    hours: number
    percentage: number
  }[]
  topTasks: {
    taskName: string
    hours: number
    percentage: number
  }[]
  trends: {
    date: string
    hours: number
  }[]
}

export interface TimerSettings {
  autoStart: boolean
  autoStop: boolean
  idleDetection: boolean
  idleThreshold: number // minutes
  reminderEnabled: boolean
  reminderInterval: number // minutes
  roundingMode: RoundingMode
  weekStart: 'monday' | 'sunday'
  timeFormat: '12h' | '24h'
  defaultBillable: boolean
}

export interface WeeklySummary {
  weekStart: Date
  weekEnd: Date
  totalHours: number
  billableHours: number
  totalAmount: number
  dailyHours: number[]
  comparisonToPrevious: {
    hours: number
    percentage: number
  }
}

export interface MonthlySummary {
  month: number
  year: number
  totalHours: number
  billableHours: number
  totalAmount: number
  workingDays: number
  averageHoursPerDay: number
  topProjects: ProjectBreakdown[]
  comparisonToPrevious: {
    hours: number
    percentage: number
  }
}

// ============================================
// MOCK DATA
// ============================================

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Website Redesign',
    color: '#3B82F6',
    client: 'Acme Corp',
    billable: true,
    hourlyRate: 95,
    budget: 10000,
    budgetType: 'amount',
    tasks: [
      { id: '1', name: 'UI Design', projectId: '1', estimated: 20, spent: 15, status: 'in-progress' },
      { id: '2', name: 'Frontend Development', projectId: '1', estimated: 40, spent: 28, status: 'in-progress' },
      { id: '3', name: 'Backend Integration', projectId: '1', estimated: 30, spent: 12, status: 'todo' },
      { id: '4', name: 'Testing & QA', projectId: '1', estimated: 15, spent: 0, status: 'todo' }
    ],
    archived: false
  },
  {
    id: '2',
    name: 'Mobile App',
    color: '#10B981',
    client: 'Tech Startup',
    billable: true,
    hourlyRate: 120,
    budget: 200,
    budgetType: 'hours',
    tasks: [
      { id: '5', name: 'Wireframes', projectId: '2', estimated: 10, spent: 8, status: 'completed' },
      { id: '6', name: 'User Testing', projectId: '2', estimated: 12, spent: 6, status: 'in-progress' },
      { id: '7', name: 'UI Implementation', projectId: '2', estimated: 35, spent: 18, status: 'in-progress' }
    ],
    archived: false
  },
  {
    id: '3',
    name: 'Marketing Campaign',
    color: '#F59E0B',
    client: 'Brand Studio',
    billable: true,
    hourlyRate: 75,
    tasks: [
      { id: '8', name: 'Content Creation', projectId: '3', estimated: 20, spent: 14, status: 'in-progress' },
      { id: '9', name: 'Social Media Management', projectId: '3', estimated: 15, spent: 9, status: 'in-progress' },
      { id: '10', name: 'Analytics & Reporting', projectId: '3', estimated: 8, spent: 3, status: 'todo' }
    ],
    archived: false
  },
  {
    id: '4',
    name: 'Internal Projects',
    color: '#8B5CF6',
    billable: false,
    tasks: [
      { id: '11', name: 'Team Meetings', projectId: '4', status: 'in-progress' },
      { id: '12', name: 'Learning & Development', projectId: '4', status: 'in-progress' },
      { id: '13', name: 'Administrative Tasks', projectId: '4', status: 'in-progress' }
    ],
    archived: false
  }
]

export const mockTimeEntries: TimeEntry[] = [
  {
    id: '1',
    userId: 'user-123',
    projectId: '1',
    projectName: 'Website Redesign',
    taskId: '1',
    taskName: 'UI Design',
    description: 'Designing homepage mockups',
    startTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
    duration: 7200,
    isRunning: false,
    isPaused: false,
    status: 'stopped',
    type: 'timer',
    billable: true,
    hourlyRate: 95,
    tags: ['design', 'homepage'],
    metadata: {
      client: 'Acme Corp',
      device: 'MacBook Pro'
    },
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
  },
  {
    id: '2',
    userId: 'user-123',
    projectId: '2',
    projectName: 'Mobile App',
    taskId: '6',
    taskName: 'User Testing',
    description: 'Conducting user interviews',
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 22 * 60 * 60 * 1000),
    duration: 5400,
    isRunning: false,
    isPaused: false,
    status: 'stopped',
    type: 'timer',
    billable: true,
    hourlyRate: 120,
    tags: ['research', 'ux'],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 22 * 60 * 60 * 1000)
  },
  {
    id: '3',
    userId: 'user-123',
    projectId: '1',
    projectName: 'Website Redesign',
    taskId: '2',
    taskName: 'Frontend Development',
    description: 'Implementing responsive navigation',
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
    duration: 14400,
    isRunning: false,
    isPaused: false,
    status: 'stopped',
    type: 'timer',
    billable: true,
    hourlyRate: 95,
    tags: ['development', 'react'],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000)
  },
  {
    id: '4',
    userId: 'user-123',
    projectId: '4',
    projectName: 'Internal Projects',
    taskId: '11',
    taskName: 'Team Meetings',
    description: 'Weekly team standup',
    startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
    duration: 1800,
    isRunning: false,
    isPaused: false,
    status: 'stopped',
    type: 'manual',
    billable: false,
    tags: ['meeting', 'internal'],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  }
]

export const mockTimerSettings: TimerSettings = {
  autoStart: false,
  autoStop: true,
  idleDetection: true,
  idleThreshold: 5,
  reminderEnabled: true,
  reminderInterval: 30,
  roundingMode: '15min',
  weekStart: 'monday',
  timeFormat: '12h',
  defaultBillable: true
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format duration in seconds to readable string
 */
export function formatDuration(seconds: number, format: 'short' | 'long' = 'short'): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (format === 'short') {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const parts: string[] = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`)

  return parts.join(' ')
}

/**
 * Convert duration to decimal hours
 */
export function durationToHours(seconds: number): number {
  return parseFloat((seconds / 3600).toFixed(2))
}

/**
 * Convert decimal hours to duration
 */
export function hoursToDuration(hours: number): number {
  return Math.round(hours * 3600)
}

/**
 * Calculate total duration from entries
 */
export function calculateTotalDuration(entries: TimeEntry[]): number {
  return entries.reduce((total, entry) => total + entry.duration, 0)
}

/**
 * Calculate billable duration
 */
export function calculateBillableDuration(entries: TimeEntry[]): number {
  return entries
    .filter(e => e.billable)
    .reduce((total, entry) => total + entry.duration, 0)
}

/**
 * Calculate total amount from entries
 */
export function calculateTotalAmount(entries: TimeEntry[]): number {
  return entries
    .filter(e => e.billable && e.hourlyRate)
    .reduce((total, entry) => {
      const hours = durationToHours(entry.duration)
      return total + (hours * (entry.hourlyRate || 0))
    }, 0)
}

/**
 * Round duration based on rounding mode
 */
export function roundDuration(seconds: number, mode: RoundingMode): number {
  if (mode === 'none') return seconds

  const roundingSeconds: Record<RoundingMode, number> = {
    'none': 0,
    '15min': 900,
    '30min': 1800,
    '1hour': 3600
  }

  const interval = roundingSeconds[mode]
  return Math.ceil(seconds / interval) * interval
}

/**
 * Filter entries by date range
 */
export function filterEntriesByRange(
  entries: TimeEntry[],
  startDate: Date,
  endDate: Date
): TimeEntry[] {
  return entries.filter(entry => {
    const entryDate = new Date(entry.startTime)
    return entryDate >= startDate && entryDate <= endDate
  })
}

/**
 * Filter entries by project
 */
export function filterEntriesByProject(
  entries: TimeEntry[],
  projectId: string
): TimeEntry[] {
  return entries.filter(e => e.projectId === projectId)
}

/**
 * Filter entries by task
 */
export function filterEntriesByTask(
  entries: TimeEntry[],
  taskId: string
): TimeEntry[] {
  return entries.filter(e => e.taskId === taskId)
}

/**
 * Filter billable entries
 */
export function filterBillableEntries(entries: TimeEntry[]): TimeEntry[] {
  return entries.filter(e => e.billable)
}

/**
 * Get entries for specific range type
 */
export function getEntriesForRange(
  entries: TimeEntry[],
  rangeType: TimeRangeType
): TimeEntry[] {
  const now = new Date()
  let startDate: Date
  let endDate: Date = new Date()

  switch (rangeType) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0))
      break
    case 'yesterday':
      startDate = new Date(now.setDate(now.getDate() - 1))
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date(startDate)
      endDate.setHours(23, 59, 59, 999)
      break
    case 'this-week':
      startDate = new Date(now.setDate(now.getDate() - now.getDay()))
      startDate.setHours(0, 0, 0, 0)
      break
    case 'last-week':
      startDate = new Date(now.setDate(now.getDate() - now.getDay() - 7))
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 6)
      endDate.setHours(23, 59, 59, 999)
      break
    case 'this-month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case 'last-month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      endDate = new Date(now.getFullYear(), now.getMonth(), 0)
      endDate.setHours(23, 59, 59, 999)
      break
    default:
      return entries
  }

  return filterEntriesByRange(entries, startDate, endDate)
}

/**
 * Generate project breakdown
 */
export function generateProjectBreakdown(entries: TimeEntry[]): ProjectBreakdown[] {
  const projectMap = new Map<string, ProjectBreakdown>()
  const totalDuration = calculateTotalDuration(entries)

  entries.forEach(entry => {
    const existing = projectMap.get(entry.projectId)

    if (existing) {
      existing.duration += entry.duration
      if (entry.billable) {
        existing.billableDuration += entry.duration
        existing.amount += durationToHours(entry.duration) * (entry.hourlyRate || 0)
      }
      existing.entryCount++
    } else {
      projectMap.set(entry.projectId, {
        projectId: entry.projectId,
        projectName: entry.projectName,
        duration: entry.duration,
        billableDuration: entry.billable ? entry.duration : 0,
        amount: entry.billable ? durationToHours(entry.duration) * (entry.hourlyRate || 0) : 0,
        percentage: 0,
        entryCount: 1
      })
    }
  })

  const breakdown = Array.from(projectMap.values())

  // Calculate percentages
  breakdown.forEach(item => {
    item.percentage = totalDuration > 0 ? (item.duration / totalDuration) * 100 : 0
  })

  return breakdown.sort((a, b) => b.duration - a.duration)
}

/**
 * Generate task breakdown
 */
export function generateTaskBreakdown(entries: TimeEntry[]): TaskBreakdown[] {
  const taskMap = new Map<string, TaskBreakdown>()
  const totalDuration = calculateTotalDuration(entries)

  entries.forEach(entry => {
    const existing = taskMap.get(entry.taskId)

    if (existing) {
      existing.duration += entry.duration
      existing.amount += durationToHours(entry.duration) * (entry.hourlyRate || 0)
      existing.entryCount++
    } else {
      taskMap.set(entry.taskId, {
        taskId: entry.taskId,
        taskName: entry.taskName,
        projectName: entry.projectName,
        duration: entry.duration,
        amount: durationToHours(entry.duration) * (entry.hourlyRate || 0),
        percentage: 0,
        entryCount: 1
      })
    }
  })

  const breakdown = Array.from(taskMap.values())

  // Calculate percentages
  breakdown.forEach(item => {
    item.percentage = totalDuration > 0 ? (item.duration / totalDuration) * 100 : 0
  })

  return breakdown.sort((a, b) => b.duration - a.duration)
}

/**
 * Generate daily summary
 */
export function generateDailySummary(entries: TimeEntry[]): DailySummary[] {
  const dailyMap = new Map<string, DailySummary>()

  entries.forEach(entry => {
    const dateStr = new Date(entry.startTime).toLocaleDateString()
    const existing = dailyMap.get(dateStr)

    if (existing) {
      existing.totalDuration += entry.duration
      if (entry.billable) {
        existing.billableDuration += entry.duration
        existing.amount += durationToHours(entry.duration) * (entry.hourlyRate || 0)
      }
      existing.entryCount++
    } else {
      dailyMap.set(dateStr, {
        date: dateStr,
        totalDuration: entry.duration,
        billableDuration: entry.billable ? entry.duration : 0,
        entryCount: 1,
        amount: entry.billable ? durationToHours(entry.duration) * (entry.hourlyRate || 0) : 0
      })
    }
  })

  return Array.from(dailyMap.values()).sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )
}

/**
 * Generate time report
 */
export function generateTimeReport(
  entries: TimeEntry[],
  userId: string,
  startDate: Date,
  endDate: Date
): TimeReport {
  const filteredEntries = filterEntriesByRange(entries, startDate, endDate)

  return {
    userId,
    startDate,
    endDate,
    totalDuration: calculateTotalDuration(filteredEntries),
    billableDuration: calculateBillableDuration(filteredEntries),
    nonBillableDuration: calculateTotalDuration(filteredEntries) - calculateBillableDuration(filteredEntries),
    totalAmount: calculateTotalAmount(filteredEntries),
    entries: filteredEntries,
    projectBreakdown: generateProjectBreakdown(filteredEntries),
    taskBreakdown: generateTaskBreakdown(filteredEntries),
    dailySummary: generateDailySummary(filteredEntries)
  }
}

/**
 * Export to CSV
 */
export function exportToCSV(entries: TimeEntry[]): string {
  const headers = ['Date', 'Project', 'Task', 'Description', 'Duration', 'Billable', 'Amount']
  const rows = entries.map(entry => [
    new Date(entry.startTime).toLocaleDateString(),
    entry.projectName,
    entry.taskName,
    entry.description,
    formatDuration(entry.duration, 'long'),
    entry.billable ? 'Yes' : 'No',
    entry.billable && entry.hourlyRate
      ? `$${(durationToHours(entry.duration) * entry.hourlyRate).toFixed(2)}`
      : '$0.00'
  ])

  return [headers, ...rows].map(row => row.join(',')).join('\n')
}

/**
 * Export to JSON
 */
export function exportToJSON(entries: TimeEntry[]): string {
  return JSON.stringify(entries, null, 2)
}

/**
 * Calculate weekly summary
 */
export function calculateWeeklySummary(
  entries: TimeEntry[],
  weekStart: Date
): WeeklySummary {
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  const weekEntries = filterEntriesByRange(entries, weekStart, weekEnd)
  const dailyHours: number[] = []

  for (let i = 0; i < 7; i++) {
    const dayStart = new Date(weekStart)
    dayStart.setDate(dayStart.getDate() + i)
    const dayEnd = new Date(dayStart)
    dayEnd.setHours(23, 59, 59, 999)

    const dayEntries = filterEntriesByRange(weekEntries, dayStart, dayEnd)
    dailyHours.push(durationToHours(calculateTotalDuration(dayEntries)))
  }

  // Previous week comparison
  const prevWeekStart = new Date(weekStart)
  prevWeekStart.setDate(prevWeekStart.getDate() - 7)
  const prevWeekEnd = new Date(prevWeekStart)
  prevWeekEnd.setDate(prevWeekEnd.getDate() + 6)
  const prevWeekEntries = filterEntriesByRange(entries, prevWeekStart, prevWeekEnd)

  const currentHours = durationToHours(calculateTotalDuration(weekEntries))
  const prevHours = durationToHours(calculateTotalDuration(prevWeekEntries))
  const diff = currentHours - prevHours
  const percentage = prevHours > 0 ? (diff / prevHours) * 100 : 0

  return {
    weekStart,
    weekEnd,
    totalHours: currentHours,
    billableHours: durationToHours(calculateBillableDuration(weekEntries)),
    totalAmount: calculateTotalAmount(weekEntries),
    dailyHours,
    comparisonToPrevious: {
      hours: diff,
      percentage
    }
  }
}

/**
 * Calculate monthly summary
 */
export function calculateMonthlySummary(
  entries: TimeEntry[],
  month: number,
  year: number
): MonthlySummary {
  const monthStart = new Date(year, month - 1, 1)
  const monthEnd = new Date(year, month, 0)
  monthEnd.setHours(23, 59, 59, 999)

  const monthEntries = filterEntriesByRange(entries, monthStart, monthEnd)

  // Previous month comparison
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  const prevMonthStart = new Date(prevYear, prevMonth - 1, 1)
  const prevMonthEnd = new Date(prevYear, prevMonth, 0)
  prevMonthEnd.setHours(23, 59, 59, 999)
  const prevMonthEntries = filterEntriesByRange(entries, prevMonthStart, prevMonthEnd)

  const currentHours = durationToHours(calculateTotalDuration(monthEntries))
  const prevHours = durationToHours(calculateTotalDuration(prevMonthEntries))
  const diff = currentHours - prevHours
  const percentage = prevHours > 0 ? (diff / prevHours) * 100 : 0

  // Count working days (exclude weekends)
  let workingDays = 0
  for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
    const day = d.getDay()
    if (day !== 0 && day !== 6) workingDays++
  }

  return {
    month,
    year,
    totalHours: currentHours,
    billableHours: durationToHours(calculateBillableDuration(monthEntries)),
    totalAmount: calculateTotalAmount(monthEntries),
    workingDays,
    averageHoursPerDay: workingDays > 0 ? currentHours / workingDays : 0,
    topProjects: generateProjectBreakdown(monthEntries).slice(0, 5),
    comparisonToPrevious: {
      hours: diff,
      percentage
    }
  }
}

/**
 * Get project budget status
 */
export function getProjectBudgetStatus(
  project: Project,
  entries: TimeEntry[]
): {
  spent: number
  remaining: number
  percentage: number
  overBudget: boolean
} {
  const projectEntries = filterEntriesByProject(entries, project.id)
  const spent = project.budgetType === 'hours'
    ? durationToHours(calculateTotalDuration(projectEntries))
    : calculateTotalAmount(projectEntries)

  const budget = project.budget || 0
  const remaining = Math.max(budget - spent, 0)
  const percentage = budget > 0 ? (spent / budget) * 100 : 0
  const overBudget = spent > budget

  return { spent, remaining, percentage, overBudget }
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

/**
 * Validate time entry
 */
export function validateTimeEntry(entry: Partial<TimeEntry>): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!entry.projectId) errors.push('Project is required')
  if (!entry.taskId) errors.push('Task is required')
  if (!entry.description || entry.description.trim() === '') {
    errors.push('Description is required')
  }
  if (entry.duration !== undefined && entry.duration < 0) {
    errors.push('Duration cannot be negative')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Export all
export default {
  mockProjects,
  mockTimeEntries,
  mockTimerSettings,
  formatDuration,
  durationToHours,
  hoursToDuration,
  calculateTotalDuration,
  calculateBillableDuration,
  calculateTotalAmount,
  roundDuration,
  filterEntriesByRange,
  filterEntriesByProject,
  filterEntriesByTask,
  filterBillableEntries,
  getEntriesForRange,
  generateProjectBreakdown,
  generateTaskBreakdown,
  generateDailySummary,
  generateTimeReport,
  exportToCSV,
  exportToJSON,
  calculateWeeklySummary,
  calculateMonthlySummary,
  getProjectBudgetStatus,
  formatCurrency,
  validateTimeEntry
}
