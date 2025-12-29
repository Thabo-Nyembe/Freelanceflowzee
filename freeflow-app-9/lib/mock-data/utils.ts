// Utility functions for mock data
// Helper functions used across the mock data library

// Format currency
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format large numbers (1000 -> 1K, 1000000 -> 1M)
export function formatCompactNumber(num: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num)
}

// Format percentage
export function formatPercentage(value: number, decimals = 1): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`
}

// Format date relative to now
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 7) return `${diffDay}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Format date
export function formatDate(dateString: string, format: 'short' | 'medium' | 'long' = 'medium'): string {
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = {
    short: { month: 'short', day: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
  }[format]

  return date.toLocaleDateString('en-US', options)
}

// Generate sparkline data
export function generateSparkline(
  baseValue: number,
  points = 7,
  volatility = 0.1,
  trend: 'up' | 'down' | 'stable' = 'up'
): number[] {
  const data: number[] = []
  let value = baseValue * (1 - volatility * (points / 2))

  for (let i = 0; i < points; i++) {
    const trendFactor = trend === 'up' ? 1.02 : trend === 'down' ? 0.98 : 1
    const randomFactor = 1 + (Math.random() - 0.5) * volatility
    value = value * trendFactor * randomFactor
    data.push(Math.round(value))
  }

  return data
}

// Get status color
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // Positive statuses
    active: 'emerald',
    completed: 'emerald',
    paid: 'emerald',
    connected: 'emerald',
    delivered: 'emerald',
    closed_won: 'emerald',
    'on-track': 'emerald',
    up: 'emerald',

    // Warning statuses
    pending: 'amber',
    processing: 'amber',
    'in-progress': 'amber',
    tentative: 'amber',
    'at-risk': 'amber',

    // Negative statuses
    overdue: 'red',
    failed: 'red',
    cancelled: 'red',
    churned: 'red',
    closed_lost: 'red',
    behind: 'red',
    down: 'red',

    // Neutral statuses
    draft: 'gray',
    inactive: 'gray',
    paused: 'gray',
    stable: 'blue',

    // Special statuses
    vip: 'purple',
    new: 'blue',
    critical: 'red',
    high: 'orange',
    medium: 'amber',
    low: 'gray',
  }

  return colors[status.toLowerCase()] || 'gray'
}

// Get trend indicator
export function getTrendIndicator(change: number): { icon: 'up' | 'down' | 'stable'; color: string; isPositive: boolean } {
  if (change > 0.5) {
    return { icon: 'up', color: 'emerald', isPositive: true }
  } else if (change < -0.5) {
    return { icon: 'down', color: 'red', isPositive: false }
  }
  return { icon: 'stable', color: 'gray', isPositive: true }
}

// Calculate health score color
export function getHealthScoreColor(score: number): string {
  if (score >= 80) return 'emerald'
  if (score >= 60) return 'amber'
  return 'red'
}

// Generate random ID
export function generateId(prefix = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Calculate percentage change
export function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

// Get priority badge color
export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    critical: 'red',
    high: 'orange',
    medium: 'amber',
    low: 'gray',
  }
  return colors[priority.toLowerCase()] || 'gray'
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Format duration
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

// Get avatar placeholder URL
export function getAvatarUrl(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
}

// Delay helper for simulating loading
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Random item from array
export function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

// Shuffle array
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Generate date range
export function generateDateRange(days: number): Date[] {
  const dates: Date[] = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dates.push(date)
  }
  return dates
}

// Format chart data
export function formatChartData(
  data: number[],
  labels: string[]
): { label: string; value: number }[] {
  return data.map((value, index) => ({
    label: labels[index] || `Point ${index + 1}`,
    value,
  }))
}
