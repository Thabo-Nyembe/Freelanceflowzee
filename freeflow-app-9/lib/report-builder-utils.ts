/**
 * Custom Report Builder Utilities
 * Templates, helpers, and mock data for report building
 */

import {
  ReportTemplate,
  DateRange,
  ExportFormat,
  MetricCard,
  ChartData,
  Widget
} from './report-builder-types'

// Report Templates Library
export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'financial-overview',
    name: 'Financial Overview',
    description: 'Complete financial summary with revenue, expenses, and profit analysis',
    type: 'financial',
    icon: 'DollarSign',
    category: 'Finance',
    thumbnail: '/templates/financial-report.jpg',
    premium: false,
    widgets: [],
    filters: [],
    tags: ['finance', 'revenue', 'expenses', 'profit'],
    popularity: 95,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'project-performance',
    name: 'Project Performance',
    description: 'Track project progress, milestones, and team efficiency',
    type: 'project-performance',
    icon: 'BarChart3',
    category: 'Projects',
    thumbnail: '/templates/project-report.jpg',
    premium: false,
    widgets: [],
    filters: [],
    tags: ['projects', 'performance', 'milestones', 'efficiency'],
    popularity: 88,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'client-activity',
    name: 'Client Activity Report',
    description: 'Monitor client engagement, satisfaction, and project status',
    type: 'client-activity',
    icon: 'Users',
    category: 'Clients',
    thumbnail: '/templates/client-report.jpg',
    premium: true,
    widgets: [],
    filters: [],
    tags: ['clients', 'engagement', 'satisfaction', 'retention'],
    popularity: 82,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'time-tracking',
    name: 'Time Tracking Analysis',
    description: 'Analyze time spent on projects, tasks, and billable hours',
    type: 'time-tracking',
    icon: 'Clock',
    category: 'Time',
    thumbnail: '/templates/time-report.jpg',
    premium: false,
    widgets: [],
    filters: [],
    tags: ['time', 'hours', 'billable', 'productivity'],
    popularity: 76,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'sales-pipeline',
    name: 'Sales Pipeline Report',
    description: 'Track leads, conversions, and revenue forecasts',
    type: 'sales-pipeline',
    icon: 'TrendingUp',
    category: 'Sales',
    thumbnail: '/templates/sales-report.jpg',
    premium: true,
    widgets: [],
    filters: [],
    tags: ['sales', 'pipeline', 'leads', 'conversions'],
    popularity: 91,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'team-productivity',
    name: 'Team Productivity',
    description: 'Measure team performance, output, and collaboration metrics',
    type: 'team-productivity',
    icon: 'Users2',
    category: 'Team',
    thumbnail: '/templates/team-report.jpg',
    premium: true,
    widgets: [],
    filters: [],
    tags: ['team', 'productivity', 'performance', 'collaboration'],
    popularity: 79,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'resource-utilization',
    name: 'Resource Utilization',
    description: 'Optimize resource allocation and capacity planning',
    type: 'resource-utilization',
    icon: 'PieChart',
    category: 'Resources',
    thumbnail: '/templates/resource-report.jpg',
    premium: true,
    widgets: [],
    filters: [],
    tags: ['resources', 'capacity', 'allocation', 'optimization'],
    popularity: 71,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'custom-report',
    name: 'Blank Custom Report',
    description: 'Start from scratch and build your own custom report',
    type: 'custom',
    icon: 'FileText',
    category: 'Custom',
    thumbnail: '/templates/custom-report.jpg',
    premium: false,
    widgets: [],
    filters: [],
    tags: ['custom', 'blank', 'flexible'],
    popularity: 85,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

// Available Widget Types
export const WIDGET_TYPES = [
  {
    id: 'metric',
    name: 'Metric Card',
    icon: 'Hash',
    description: 'Display a single KPI or metric',
    category: 'Metrics'
  },
  {
    id: 'chart-line',
    name: 'Line Chart',
    icon: 'LineChart',
    description: 'Show trends over time',
    category: 'Charts'
  },
  {
    id: 'chart-bar',
    name: 'Bar Chart',
    icon: 'BarChart3',
    description: 'Compare values across categories',
    category: 'Charts'
  },
  {
    id: 'chart-pie',
    name: 'Pie Chart',
    icon: 'PieChart',
    description: 'Show proportions of a whole',
    category: 'Charts'
  },
  {
    id: 'chart-area',
    name: 'Area Chart',
    icon: 'AreaChart',
    description: 'Display cumulative totals over time',
    category: 'Charts'
  },
  {
    id: 'table',
    name: 'Data Table',
    icon: 'Table',
    description: 'Display detailed data in rows and columns',
    category: 'Tables'
  },
  {
    id: 'gauge',
    name: 'Gauge',
    icon: 'Gauge',
    description: 'Show progress towards a goal',
    category: 'Metrics'
  },
  {
    id: 'funnel',
    name: 'Funnel Chart',
    icon: 'Filter',
    description: 'Visualize process stages',
    category: 'Charts'
  }
]

// Date Range Presets
export const DATE_RANGE_PRESETS = [
  { value: 'today' as DateRange, label: 'Today' },
  { value: 'yesterday' as DateRange, label: 'Yesterday' },
  { value: 'last-7-days' as DateRange, label: 'Last 7 Days' },
  { value: 'last-30-days' as DateRange, label: 'Last 30 Days' },
  { value: 'last-90-days' as DateRange, label: 'Last 90 Days' },
  { value: 'this-month' as DateRange, label: 'This Month' },
  { value: 'last-month' as DateRange, label: 'Last Month' },
  { value: 'this-quarter' as DateRange, label: 'This Quarter' },
  { value: 'last-quarter' as DateRange, label: 'Last Quarter' },
  { value: 'this-year' as DateRange, label: 'This Year' },
  { value: 'last-year' as DateRange, label: 'Last Year' },
  { value: 'custom' as DateRange, label: 'Custom Range' }
]

// Export Format Options
export const EXPORT_FORMATS = [
  { value: 'pdf' as ExportFormat, label: 'PDF Document', icon: 'FileText', description: 'Portable document format' },
  { value: 'excel' as ExportFormat, label: 'Excel Spreadsheet', icon: 'FileSpreadsheet', description: 'Microsoft Excel format' },
  { value: 'csv' as ExportFormat, label: 'CSV File', icon: 'FileDown', description: 'Comma-separated values' },
  { value: 'json' as ExportFormat, label: 'JSON Data', icon: 'Braces', description: 'JavaScript object notation' },
  { value: 'png' as ExportFormat, label: 'PNG Image', icon: 'Image', description: 'High-quality image' },
  { value: 'svg' as ExportFormat, label: 'SVG Vector', icon: 'FileImage', description: 'Scalable vector graphic' }
]

// MIGRATED: Batch #11 - Removed mock data, using database hooks
export const MOCK_METRICS: MetricCard[] = []

// MIGRATED: Batch #11 - Removed mock data, using database hooks
export const MOCK_CHART_DATA: ChartData = {
  labels: [],
  datasets: []
}

/**
 * Calculate date range from preset
 */
export function calculateDateRange(preset: DateRange): { from: Date; to: Date } {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (preset) {
    case 'today':
      return { from: today, to: now }

    case 'yesterday': {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      return { from: yesterday, to: today }
    }

    case 'last-7-days': {
      const from = new Date(today)
      from.setDate(from.getDate() - 7)
      return { from, to: now }
    }

    case 'last-30-days': {
      const from = new Date(today)
      from.setDate(from.getDate() - 30)
      return { from, to: now }
    }

    case 'last-90-days': {
      const from = new Date(today)
      from.setDate(from.getDate() - 90)
      return { from, to: now }
    }

    case 'this-month': {
      const from = new Date(now.getFullYear(), now.getMonth(), 1)
      return { from, to: now }
    }

    case 'last-month': {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const to = new Date(now.getFullYear(), now.getMonth(), 0)
      return { from, to }
    }

    case 'this-quarter': {
      const quarter = Math.floor(now.getMonth() / 3)
      const from = new Date(now.getFullYear(), quarter * 3, 1)
      return { from, to: now }
    }

    case 'last-quarter': {
      const quarter = Math.floor(now.getMonth() / 3)
      const from = new Date(now.getFullYear(), (quarter - 1) * 3, 1)
      const to = new Date(now.getFullYear(), quarter * 3, 0)
      return { from, to }
    }

    case 'this-year': {
      const from = new Date(now.getFullYear(), 0, 1)
      return { from, to: now }
    }

    case 'last-year': {
      const from = new Date(now.getFullYear() - 1, 0, 1)
      const to = new Date(now.getFullYear() - 1, 11, 31)
      return { from, to }
    }

    default:
      return { from: today, to: now }
  }
}

/**
 * Format date for display
 */
export function formatDate(date: Date, format: 'short' | 'medium' | 'long' = 'medium'): string {
  const options: Intl.DateTimeFormatOptions = {
    short: { month: 'short', day: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
  }[format]

  return new Intl.DateTimeFormat('en-US', options).format(date)
}

/**
 * Format number with proper separators
 */
export function formatNumber(value: number, options?: {
  decimals?: number
  prefix?: string
  suffix?: string
  type?: 'number' | 'currency' | 'percentage'
}): string {
  const decimals = options?.decimals ?? 0
  const type = options?.type ?? 'number'

  let formatted: string

  if (type === 'currency') {
    formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value)
  } else if (type === 'percentage') {
    formatted = `${value.toFixed(decimals)}%`
  } else {
    formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value)
  }

  if (options?.prefix) formatted = options.prefix + formatted
  if (options?.suffix) formatted = formatted + options.suffix

  return formatted
}

/**
 * Get chart color palette
 */
export function getChartColors(count: number): string[] {
  const colors = [
    'rgb(99, 102, 241)',   // indigo
    'rgb(59, 130, 246)',   // blue
    'rgb(16, 185, 129)',   // green
    'rgb(245, 158, 11)',   // amber
    'rgb(239, 68, 68)',    // red
    'rgb(168, 85, 247)',   // purple
    'rgb(236, 72, 153)',   // pink
    'rgb(6, 182, 212)',    // cyan
    'rgb(132, 204, 22)',   // lime
    'rgb(251, 146, 60)'    // orange
  ]

  return colors.slice(0, count)
}

/**
 * Estimate export time based on format and data size
 */
export function estimateExportTime(format: ExportFormat, widgetCount: number): string {
  const baseTime = {
    pdf: 3,
    excel: 2,
    csv: 1,
    json: 1,
    png: 4,
    svg: 2
  }[format]

  const totalSeconds = baseTime + (widgetCount * 0.5)

  if (totalSeconds < 5) return 'a few seconds'
  if (totalSeconds < 60) return `${Math.round(totalSeconds)} seconds`
  return `${Math.round(totalSeconds / 60)} minute${totalSeconds >= 120 ? 's' : ''}`
}

/**
 * Generate sample widget
 */
export function createSampleWidget(type: string): Widget {
  return {
    id: `widget_${Math.random().toString(36).substr(2, 9)}`,
    type: type,
    title: 'New Widget',
    position: { x: 0, y: 0, width: 6, height: 4 },
    data: {
      source: 'default',
      fields: [],
      aggregation: 'sum'
    },
    settings: {
      chartType: 'bar',
      colors: getChartColors(5),
      showLegend: true,
      showGrid: true,
      animate: true,
      responsive: true
    }
  }
}
