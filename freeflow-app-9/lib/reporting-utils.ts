import type {
  Report,
  ReportTemplate,
  ReportSection,
  ReportMetrics,
  ExportFormat,
  ReportType,
  ReportStatus,
  ChartType
} from './reporting-types'

// Report Templates
export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'financial-overview',
    name: 'Financial Overview',
    description: 'Comprehensive financial performance report',
    type: 'financial',
    icon: '💰',
    defaultSections: ['revenue', 'expenses', 'profit', 'invoices', 'payments'],
    dataSources: ['invoices', 'analytics'],
    isCustom: false
  },
  {
    id: 'sales-performance',
    name: 'Sales Performance',
    description: 'Sales pipeline, deals, and conversion metrics',
    type: 'sales',
    icon: '📈',
    defaultSections: ['pipeline', 'deals', 'conversion', 'top-performers'],
    dataSources: ['crm', 'analytics'],
    isCustom: false
  },
  {
    id: 'marketing-analytics',
    name: 'Marketing Analytics',
    description: 'Campaign performance and lead generation',
    type: 'marketing',
    icon: '🎯',
    defaultSections: ['campaigns', 'leads', 'conversion', 'roi'],
    dataSources: ['campaigns', 'leads', 'analytics'],
    isCustom: false
  },
  {
    id: 'operations-summary',
    name: 'Operations Summary',
    description: 'Project status, team productivity, and resource utilization',
    type: 'operations',
    icon: '⚙️',
    defaultSections: ['projects', 'team', 'resources', 'timeline'],
    dataSources: ['projects', 'analytics'],
    isCustom: false
  },
  {
    id: 'executive-dashboard',
    name: 'Executive Dashboard',
    description: 'High-level business metrics and KPIs',
    type: 'analytics',
    icon: '📊',
    defaultSections: ['revenue', 'growth', 'clients', 'performance'],
    dataSources: ['analytics', 'crm', 'invoices'],
    isCustom: false
  },
  {
    id: 'custom-blank',
    name: 'Blank Report',
    description: 'Start from scratch with custom sections',
    type: 'custom',
    icon: '📄',
    defaultSections: [],
    dataSources: ['custom'],
    isCustom: true
  }
]

// Mock Reports
export const MOCK_REPORTS: Report[] = [
  {
    id: 'report-1',
    name: 'Q1 Financial Report',
    description: 'Quarterly financial performance and analysis',
    type: 'financial',
    status: 'generated',
    template: REPORT_TEMPLATES[0],
    sections: [],
    schedule: {
      frequency: 'quarterly',
      time: '09:00',
      timezone: 'UTC',
      enabled: true,
      nextRun: new Date('2025-04-01')
    },
    recipients: ['ceo@company.com', 'cfo@company.com'],
    lastGenerated: new Date('2025-01-15'),
    createdAt: new Date('2025-01-01'),
    createdBy: 'Admin'
  },
  {
    id: 'report-2',
    name: 'Weekly Sales Pipeline',
    description: 'Sales pipeline status and deal progression',
    type: 'sales',
    status: 'scheduled',
    template: REPORT_TEMPLATES[1],
    sections: [],
    schedule: {
      frequency: 'weekly',
      time: '08:00',
      dayOfWeek: 1,
      timezone: 'UTC',
      enabled: true,
      nextRun: new Date('2025-01-27')
    },
    recipients: ['sales@company.com'],
    lastGenerated: new Date('2025-01-20'),
    createdAt: new Date('2025-01-01'),
    createdBy: 'Sales Manager'
  },
  {
    id: 'report-3',
    name: 'Marketing Campaign Performance',
    description: 'Email campaigns, leads, and conversion metrics',
    type: 'marketing',
    status: 'generated',
    template: REPORT_TEMPLATES[2],
    sections: [],
    recipients: ['marketing@company.com'],
    lastGenerated: new Date('2025-01-21'),
    createdAt: new Date('2025-01-15'),
    createdBy: 'Marketing Director'
  }
]

// Report Metrics
export const REPORT_METRICS: ReportMetrics = {
  totalReports: 24,
  scheduledReports: 8,
  reportsGenerated: 156,
  averageGenerationTime: 2.3,
  mostUsedTemplate: 'Sales Performance',
  totalExports: 342,
  exportsByFormat: {
    pdf: 145,
    excel: 98,
    csv: 67,
    json: 22,
    html: 10
  }
}

// Section Templates
export const SECTION_TEMPLATES: Record<string, ReportSection[]> = {
  financial: [
    {
      id: 'revenue-metric',
      type: 'metric',
      title: 'Total Revenue',
      position: 1,
      config: { metrics: ['revenue', 'growth'] },
      dataSource: 'invoices',
      visible: true
    },
    {
      id: 'revenue-chart',
      type: 'chart',
      title: 'Revenue Trend',
      position: 2,
      config: { chartType: 'line', metrics: ['revenue'], groupBy: 'month' },
      dataSource: 'analytics',
      visible: true
    },
    {
      id: 'expenses-table',
      type: 'table',
      title: 'Expense Breakdown',
      position: 3,
      config: {
        columns: [
          { key: 'category', label: 'Category', type: 'text' },
          { key: 'amount', label: 'Amount', type: 'currency' },
          { key: 'percentage', label: '% of Total', type: 'percentage' }
        ]
      },
      dataSource: 'analytics',
      visible: true
    }
  ],
  sales: [
    {
      id: 'pipeline-metric',
      type: 'metric',
      title: 'Pipeline Value',
      position: 1,
      config: { metrics: ['total-value', 'deals'] },
      dataSource: 'crm',
      visible: true
    },
    {
      id: 'conversion-chart',
      type: 'chart',
      title: 'Conversion Funnel',
      position: 2,
      config: { chartType: 'bar', metrics: ['leads', 'qualified', 'won'] },
      dataSource: 'crm',
      visible: true
    }
  ]
}

// Helper Functions
export function getReportsByStatus(status: ReportStatus): Report[] {
  return MOCK_REPORTS.filter(r => r.status === status)
}

export function getReportsByType(type: ReportType): Report[] {
  return MOCK_REPORTS.filter(r => r.type === type)
}

export function getTemplateById(id: string): ReportTemplate | undefined {
  return REPORT_TEMPLATES.find(t => t.id === id)
}

export function getStatusColor(status: ReportStatus): string {
  const colors: Record<ReportStatus, string> = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    generated: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    shared: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    archived: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
  }
  return colors[status]
}

export function getFormatIcon(format: ExportFormat): string {
  const icons: Record<ExportFormat, string> = {
    pdf: '📄',
    excel: '📊',
    csv: '📋',
    json: '{ }',
    html: '🌐'
  }
  return icons[format]
}

export function getChartTypeIcon(chartType: ChartType): string {
  const icons: Record<ChartType, string> = {
    bar: '📊',
    line: '📈',
    pie: '🥧',
    donut: '🍩',
    area: '📉',
    scatter: '🎯',
    heatmap: '🔥',
    table: '📋'
  }
  return icons[chartType]
}

export function formatScheduleText(schedule: Report['schedule']): string {
  if (!schedule || !schedule.enabled) return 'Not scheduled'

  const { frequency, time, dayOfWeek, dayOfMonth } = schedule
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  switch (frequency) {
    case 'daily':
      return `Daily at ${time}`
    case 'weekly':
      return `Weekly on ${dayNames[dayOfWeek || 1]} at ${time}`
    case 'monthly':
      return `Monthly on day ${dayOfMonth || 1} at ${time}`
    case 'quarterly':
      return `Quarterly at ${time}`
    case 'yearly':
      return `Yearly at ${time}`
    default:
      return 'Custom schedule'
  }
}

export function calculateReportMetrics(reports: Report[]): Partial<ReportMetrics> {
  return {
    totalReports: reports.length,
    scheduledReports: reports.filter(r => r.schedule?.enabled).length,
    reportsGenerated: reports.filter(r => r.status === 'generated').length
  }
}

export function generateMockReportData(type: ReportType): any {
  // Generate mock data based on report type
  const data: Record<ReportType, any> = {
    financial: {
      revenue: 284500,
      expenses: 152300,
      profit: 132200,
      profitMargin: 46.4
    },
    sales: {
      pipelineValue: 845000,
      deals: 23,
      avgDealSize: 36739,
      conversionRate: 34.5
    },
    marketing: {
      campaigns: 12,
      leads: 845,
      conversions: 142,
      roi: 285
    },
    operations: {
      projects: 18,
      completed: 12,
      onTrack: 5,
      delayed: 1
    },
    analytics: {
      visitors: 45800,
      pageViews: 128500,
      avgSessionTime: 245,
      bounceRate: 32.5
    },
    custom: {}
  }
  return data[type]
}

export function exportReport(report: Report, format: ExportFormat): void {
  console.log(`Exporting report "${report.name}" as ${format}`)
  // In a real app, this would trigger actual export functionality
}
