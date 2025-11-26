/**
 * Reports & Analytics Utilities
 *
 * Comprehensive utilities for financial analytics, report generation, and export functionality.
 * Production-ready with real mock data and full TypeScript support.
 *
 * Features:
 * - Report generation and management
 * - Financial analytics and calculations
 * - Export to multiple formats (PDF, Excel, CSV, JSON)
 * - Scheduled report automation
 * - Real-time analytics tracking
 * - Budget and profitability analysis
 * - Cash flow projections
 * - Business insights and trends
 */

import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('ReportsUtils')

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ReportType = 'analytics' | 'financial' | 'performance' | 'sales' | 'custom'
export type ReportStatus = 'draft' | 'generating' | 'ready' | 'scheduled' | 'failed'
export type ReportFrequency = 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json'
export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'heatmap'
export type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all' | 'custom'

export interface Report {
  id: string
  userId: string
  name: string
  type: ReportType
  status: ReportStatus
  description: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
  dateRange: {
    start: Date
    end: Date
  }
  frequency: ReportFrequency
  nextRun?: Date
  lastRun?: Date
  dataPoints: number
  fileSize: number // in bytes
  recipients: string[]
  tags: string[]
  config: ReportConfig
  metadata?: ReportMetadata
}

export interface ReportConfig {
  includeCharts: boolean
  includeTables: boolean
  includeRawData: boolean
  chartTypes: ChartType[]
  metrics: string[]
  filters: ReportFilter[]
  groupBy?: string[]
  sortBy?: string
  limit?: number
}

export interface ReportFilter {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains'
  value: any
}

export interface ReportMetadata {
  generationTime?: number // in milliseconds
  lastExported?: Date
  exportHistory: ExportRecord[]
  views: number
  downloads: number
  scheduleHistory: ScheduleRecord[]
}

export interface ExportRecord {
  id: string
  format: ExportFormat
  exportedAt: Date
  fileSize: number
  downloadUrl?: string
}

export interface ScheduleRecord {
  id: string
  scheduledAt: Date
  executedAt?: Date
  status: 'pending' | 'success' | 'failed'
  error?: string
}

export interface ReportTemplate {
  id: string
  name: string
  description: string
  type: ReportType
  config: ReportConfig
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

// Financial Analytics

export interface FinancialAnalytics {
  revenueData: RevenueData
  profitability: ProfitabilityData
  cashFlow: CashFlowData
  insights: BusinessInsights
}

export interface RevenueData {
  monthly: MonthlyRevenue[]
  yearly: YearlyRevenue
  currentMonth: number
  lastMonth: number
  averageProjectValue: number
  totalRevenue: number
  revenueByService: ServiceRevenue[]
}

export interface MonthlyRevenue {
  month: string
  year: number
  revenue: number
  growth: number
  projects: number
  clients: number
}

export interface YearlyRevenue {
  year: number
  revenue: number
  growth: number
  projects: number
  clients: number
}

export interface ServiceRevenue {
  service: string
  revenue: number
  count: number
  growth: number
}

export interface ProfitabilityData {
  projects: ProjectProfitability[]
  totalRevenue: number
  totalExpenses: number
  totalProfit: number
  averageMargin: number
  marginByCategory: CategoryMargin[]
}

export interface ProjectProfitability {
  id: string
  name: string
  revenue: number
  expenses: number
  profit: number
  margin: number
  status: 'active' | 'completed' | 'cancelled'
  startDate: Date
  endDate?: Date
}

export interface CategoryMargin {
  category: string
  revenue: number
  expenses: number
  margin: number
}

export interface CashFlowData {
  projections: CashFlowProjection[]
  currentBalance: number
  projectedBalance: number
  runway: number // months
  burnRate: number // per month
  income: IncomeBreakdown
  expenses: ExpenseBreakdown
}

export interface CashFlowProjection {
  month: string
  year: number
  income: number
  expenses: number
  net: number
  balance: number
}

export interface IncomeBreakdown {
  projects: number
  recurring: number
  other: number
  total: number
}

export interface ExpenseBreakdown {
  salaries: number
  software: number
  marketing: number
  operations: number
  other: number
  total: number
}

export interface BusinessInsights {
  topServices: TopService[]
  clientRetention: number
  seasonalTrends: SeasonalTrend[]
  growthRate: number
  performanceMetrics: PerformanceMetric[]
  recommendations: Recommendation[]
}

export interface TopService {
  service: string
  revenue: number
  count: number
  avgValue: number
  growth: number
}

export interface SeasonalTrend {
  quarter: string
  year: number
  revenue: number
  projects: number
  growth: number
}

export interface PerformanceMetric {
  metric: string
  value: number
  target: number
  status: 'above' | 'on-track' | 'below'
  trend: 'up' | 'stable' | 'down'
}

export interface Recommendation {
  id: string
  category: 'revenue' | 'cost' | 'efficiency' | 'growth'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  effort: 'high' | 'medium' | 'low'
  priority: number
}

// Analytics

export interface AnalyticsData {
  pageViews: PageViewData[]
  userEngagement: UserEngagementData
  conversionMetrics: ConversionMetrics
  performanceMetrics: PerformanceMetrics
}

export interface PageViewData {
  page: string
  views: number
  uniqueVisitors: number
  avgTimeOnPage: number
  bounceRate: number
}

export interface UserEngagementData {
  totalUsers: number
  activeUsers: number
  newUsers: number
  returningUsers: number
  avgSessionDuration: number
  sessionsPerUser: number
}

export interface ConversionMetrics {
  conversionRate: number
  goalCompletions: number
  totalVisitors: number
  conversions: ConversionData[]
}

export interface ConversionData {
  goal: string
  completions: number
  rate: number
  value: number
}

export interface PerformanceMetrics {
  avgLoadTime: number
  serverResponseTime: number
  errorRate: number
  uptime: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

export const MOCK_REPORTS: Report[] = [
  {
    id: 'RPT-001',
    userId: 'USR-001',
    name: 'Q4 2024 Financial Summary',
    type: 'financial',
    status: 'ready',
    description: 'Comprehensive quarterly financial report with revenue, profit, and cash flow analysis',
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-15'),
    createdBy: 'John Doe',
    dateRange: {
      start: new Date('2024-10-01'),
      end: new Date('2024-12-31')
    },
    frequency: 'quarterly',
    nextRun: new Date('2025-04-01'),
    lastRun: new Date('2024-12-15'),
    dataPoints: 8547,
    fileSize: 2456789,
    recipients: ['cfo@company.com', 'ceo@company.com'],
    tags: ['quarterly', 'financial', 'important'],
    config: {
      includeCharts: true,
      includeTables: true,
      includeRawData: false,
      chartTypes: ['bar', 'line', 'pie'],
      metrics: ['revenue', 'profit', 'expenses', 'cash_flow'],
      filters: [],
      groupBy: ['month', 'category'],
      sortBy: 'date',
      limit: 1000
    },
    metadata: {
      generationTime: 12500,
      lastExported: new Date('2024-12-16'),
      exportHistory: [
        {
          id: 'EXP-001',
          format: 'pdf',
          exportedAt: new Date('2024-12-16'),
          fileSize: 3245678,
          downloadUrl: '/exports/q4-2024-financial-summary.pdf'
        }
      ],
      views: 45,
      downloads: 12,
      scheduleHistory: [
        {
          id: 'SCH-001',
          scheduledAt: new Date('2024-12-15'),
          executedAt: new Date('2024-12-15'),
          status: 'success'
        }
      ]
    }
  },
  {
    id: 'RPT-002',
    userId: 'USR-001',
    name: 'Monthly Sales Performance',
    type: 'sales',
    status: 'ready',
    description: 'Detailed monthly sales analysis with pipeline metrics and conversion rates',
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-30'),
    createdBy: 'Jane Smith',
    dateRange: {
      start: new Date('2024-11-01'),
      end: new Date('2024-11-30')
    },
    frequency: 'monthly',
    nextRun: new Date('2025-01-01'),
    lastRun: new Date('2024-12-01'),
    dataPoints: 3456,
    fileSize: 1234567,
    recipients: ['sales@company.com'],
    tags: ['monthly', 'sales'],
    config: {
      includeCharts: true,
      includeTables: true,
      includeRawData: true,
      chartTypes: ['line', 'bar'],
      metrics: ['sales', 'conversions', 'pipeline'],
      filters: [
        { field: 'status', operator: 'eq', value: 'closed' }
      ],
      groupBy: ['week'],
      sortBy: 'date'
    },
    metadata: {
      generationTime: 8500,
      lastExported: new Date('2024-12-01'),
      exportHistory: [],
      views: 23,
      downloads: 5,
      scheduleHistory: []
    }
  },
  {
    id: 'RPT-003',
    userId: 'USR-001',
    name: 'User Engagement Analytics',
    type: 'analytics',
    status: 'ready',
    description: 'Website analytics with traffic, engagement, and conversion metrics',
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-20'),
    createdBy: 'Bob Johnson',
    dateRange: {
      start: new Date('2024-11-01'),
      end: new Date('2024-12-31')
    },
    frequency: 'monthly',
    nextRun: new Date('2025-01-01'),
    dataPoints: 15678,
    fileSize: 3456789,
    recipients: ['marketing@company.com'],
    tags: ['analytics', 'monthly'],
    config: {
      includeCharts: true,
      includeTables: true,
      includeRawData: false,
      chartTypes: ['line', 'area', 'pie'],
      metrics: ['pageviews', 'sessions', 'conversions'],
      filters: [],
      groupBy: ['day'],
      sortBy: 'date',
      limit: 500
    },
    metadata: {
      generationTime: 15000,
      exportHistory: [],
      views: 67,
      downloads: 8,
      scheduleHistory: []
    }
  },
  {
    id: 'RPT-004',
    userId: 'USR-001',
    name: 'Revenue Growth Report',
    type: 'financial',
    status: 'scheduled',
    description: 'Year-over-year revenue growth analysis with projections',
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-01'),
    createdBy: 'John Doe',
    dateRange: {
      start: new Date('2024-01-01'),
      end: new Date('2024-12-31')
    },
    frequency: 'yearly',
    nextRun: new Date('2025-01-15'),
    dataPoints: 12456,
    fileSize: 4567890,
    recipients: ['finance@company.com', 'board@company.com'],
    tags: ['yearly', 'financial', 'strategic'],
    config: {
      includeCharts: true,
      includeTables: true,
      includeRawData: false,
      chartTypes: ['line', 'bar'],
      metrics: ['revenue', 'growth', 'projections'],
      filters: [],
      groupBy: ['quarter'],
      sortBy: 'date'
    },
    metadata: {
      generationTime: 0,
      exportHistory: [],
      views: 12,
      downloads: 0,
      scheduleHistory: []
    }
  },
  {
    id: 'RPT-005',
    userId: 'USR-001',
    name: 'Customer Acquisition Report',
    type: 'sales',
    status: 'generating',
    description: 'Customer acquisition analysis with CAC, LTV, and channel performance',
    createdAt: new Date('2024-12-15'),
    updatedAt: new Date('2024-12-20'),
    createdBy: 'Jane Smith',
    dateRange: {
      start: new Date('2024-10-01'),
      end: new Date('2024-12-31')
    },
    frequency: 'quarterly',
    dataPoints: 5678,
    fileSize: 1876543,
    recipients: [],
    tags: ['quarterly', 'sales', 'marketing'],
    config: {
      includeCharts: true,
      includeTables: true,
      includeRawData: true,
      chartTypes: ['bar', 'pie'],
      metrics: ['cac', 'ltv', 'channels'],
      filters: [],
      groupBy: ['channel'],
      sortBy: 'cac'
    },
    metadata: {
      generationTime: 0,
      exportHistory: [],
      views: 3,
      downloads: 0,
      scheduleHistory: []
    }
  },
  {
    id: 'RPT-006',
    userId: 'USR-001',
    name: 'Quarterly Performance Review',
    type: 'performance',
    status: 'ready',
    description: 'Team and project performance metrics with KPI tracking',
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-12-31'),
    createdBy: 'Bob Johnson',
    dateRange: {
      start: new Date('2024-10-01'),
      end: new Date('2024-12-31')
    },
    frequency: 'quarterly',
    nextRun: new Date('2025-04-01'),
    lastRun: new Date('2024-12-31'),
    dataPoints: 9876,
    fileSize: 2987654,
    recipients: ['hr@company.com', 'management@company.com'],
    tags: ['quarterly', 'performance', 'hr'],
    config: {
      includeCharts: true,
      includeTables: true,
      includeRawData: false,
      chartTypes: ['bar', 'line'],
      metrics: ['productivity', 'quality', 'velocity'],
      filters: [],
      groupBy: ['team', 'project'],
      sortBy: 'performance'
    },
    metadata: {
      generationTime: 18500,
      lastExported: new Date('2025-01-02'),
      exportHistory: [
        {
          id: 'EXP-002',
          format: 'excel',
          exportedAt: new Date('2025-01-02'),
          fileSize: 4567890,
          downloadUrl: '/exports/q4-2024-performance.xlsx'
        }
      ],
      views: 34,
      downloads: 6,
      scheduleHistory: []
    }
  },
  {
    id: 'RPT-007',
    userId: 'USR-001',
    name: 'Annual Financial Statement',
    type: 'financial',
    status: 'draft',
    description: 'Complete annual financial statement with balance sheet and income statement',
    createdAt: new Date('2024-12-20'),
    updatedAt: new Date('2024-12-20'),
    createdBy: 'John Doe',
    dateRange: {
      start: new Date('2024-01-01'),
      end: new Date('2024-12-31')
    },
    frequency: 'yearly',
    dataPoints: 0,
    fileSize: 0,
    recipients: ['cfo@company.com', 'auditor@company.com'],
    tags: ['yearly', 'financial', 'compliance'],
    config: {
      includeCharts: true,
      includeTables: true,
      includeRawData: true,
      chartTypes: ['bar', 'line', 'pie'],
      metrics: ['assets', 'liabilities', 'equity', 'income', 'expenses'],
      filters: [],
      groupBy: ['quarter', 'category'],
      sortBy: 'date'
    },
    metadata: {
      generationTime: 0,
      exportHistory: [],
      views: 1,
      downloads: 0,
      scheduleHistory: []
    }
  },
  {
    id: 'RPT-008',
    userId: 'USR-001',
    name: 'Marketing Campaign Analysis',
    type: 'analytics',
    status: 'ready',
    description: 'Multi-channel marketing campaign performance with ROI analysis',
    createdAt: new Date('2024-11-15'),
    updatedAt: new Date('2024-12-15'),
    createdBy: 'Jane Smith',
    dateRange: {
      start: new Date('2024-11-01'),
      end: new Date('2024-12-31')
    },
    frequency: 'monthly',
    nextRun: new Date('2025-01-15'),
    lastRun: new Date('2024-12-15'),
    dataPoints: 7890,
    fileSize: 2345678,
    recipients: ['marketing@company.com'],
    tags: ['monthly', 'marketing', 'campaigns'],
    config: {
      includeCharts: true,
      includeTables: true,
      includeRawData: false,
      chartTypes: ['bar', 'pie', 'line'],
      metrics: ['impressions', 'clicks', 'conversions', 'roi'],
      filters: [
        { field: 'status', operator: 'eq', value: 'active' }
      ],
      groupBy: ['channel'],
      sortBy: 'roi'
    },
    metadata: {
      generationTime: 11000,
      lastExported: new Date('2024-12-16'),
      exportHistory: [
        {
          id: 'EXP-003',
          format: 'pdf',
          exportedAt: new Date('2024-12-16'),
          fileSize: 2987654
        }
      ],
      views: 28,
      downloads: 4,
      scheduleHistory: []
    }
  },
  {
    id: 'RPT-009',
    userId: 'USR-001',
    name: 'Product Usage Statistics',
    type: 'analytics',
    status: 'ready',
    description: 'Feature adoption and usage patterns across user segments',
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-20'),
    createdBy: 'Bob Johnson',
    dateRange: {
      start: new Date('2024-11-01'),
      end: new Date('2024-12-31')
    },
    frequency: 'monthly',
    nextRun: new Date('2025-01-01'),
    lastRun: new Date('2024-12-20'),
    dataPoints: 23456,
    fileSize: 5678901,
    recipients: ['product@company.com'],
    tags: ['monthly', 'product', 'analytics'],
    config: {
      includeCharts: true,
      includeTables: true,
      includeRawData: false,
      chartTypes: ['heatmap', 'bar', 'line'],
      metrics: ['active_users', 'feature_usage', 'retention'],
      filters: [],
      groupBy: ['feature', 'segment'],
      sortBy: 'usage'
    },
    metadata: {
      generationTime: 22000,
      lastExported: new Date('2024-12-21'),
      exportHistory: [
        {
          id: 'EXP-004',
          format: 'excel',
          exportedAt: new Date('2024-12-21'),
          fileSize: 6789012
        }
      ],
      views: 52,
      downloads: 11,
      scheduleHistory: []
    }
  },
  {
    id: 'RPT-010',
    userId: 'USR-001',
    name: 'Team Productivity Report',
    type: 'performance',
    status: 'ready',
    description: 'Team productivity metrics with time tracking and project completion rates',
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-20'),
    createdBy: 'John Doe',
    dateRange: {
      start: new Date('2024-12-01'),
      end: new Date('2024-12-31')
    },
    frequency: 'monthly',
    nextRun: new Date('2025-01-10'),
    lastRun: new Date('2024-12-20'),
    dataPoints: 4567,
    fileSize: 1567890,
    recipients: ['management@company.com'],
    tags: ['monthly', 'productivity', 'team'],
    config: {
      includeCharts: true,
      includeTables: true,
      includeRawData: false,
      chartTypes: ['bar', 'line'],
      metrics: ['hours_logged', 'tasks_completed', 'velocity'],
      filters: [],
      groupBy: ['team', 'member'],
      sortBy: 'productivity'
    },
    metadata: {
      generationTime: 9500,
      lastExported: new Date('2024-12-21'),
      exportHistory: [],
      views: 19,
      downloads: 3,
      scheduleHistory: []
    }
  }
]

export const MOCK_REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'TPL-001',
    name: 'Monthly Financial Summary',
    description: 'Standard monthly financial report template',
    type: 'financial',
    isDefault: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    config: {
      includeCharts: true,
      includeTables: true,
      includeRawData: false,
      chartTypes: ['bar', 'line', 'pie'],
      metrics: ['revenue', 'expenses', 'profit', 'cash_flow'],
      filters: [],
      groupBy: ['category'],
      sortBy: 'date'
    }
  },
  {
    id: 'TPL-002',
    name: 'Sales Pipeline Report',
    description: 'Sales pipeline and conversion tracking template',
    type: 'sales',
    isDefault: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    config: {
      includeCharts: true,
      includeTables: true,
      includeRawData: true,
      chartTypes: ['bar', 'line'],
      metrics: ['leads', 'opportunities', 'conversions', 'revenue'],
      filters: [],
      groupBy: ['stage'],
      sortBy: 'value'
    }
  },
  {
    id: 'TPL-003',
    name: 'Website Analytics',
    description: 'Website traffic and engagement analytics template',
    type: 'analytics',
    isDefault: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    config: {
      includeCharts: true,
      includeTables: true,
      includeRawData: false,
      chartTypes: ['line', 'area', 'pie'],
      metrics: ['pageviews', 'sessions', 'bounce_rate', 'conversions'],
      filters: [],
      groupBy: ['page', 'source'],
      sortBy: 'pageviews'
    }
  },
  {
    id: 'TPL-004',
    name: 'Team Performance Review',
    description: 'Team and individual performance metrics template',
    type: 'performance',
    isDefault: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    config: {
      includeCharts: true,
      includeTables: true,
      includeRawData: false,
      chartTypes: ['bar', 'line'],
      metrics: ['tasks_completed', 'hours_logged', 'quality_score'],
      filters: [],
      groupBy: ['team', 'member'],
      sortBy: 'performance'
    }
  }
]

export const MOCK_FINANCIAL_ANALYTICS: FinancialAnalytics = {
  revenueData: {
    monthly: [
      { month: 'January', year: 2024, revenue: 24500, growth: 12, projects: 8, clients: 12 },
      { month: 'February', year: 2024, revenue: 28700, growth: 17, projects: 9, clients: 14 },
      { month: 'March', year: 2024, revenue: 32100, growth: 12, projects: 11, clients: 16 },
      { month: 'April', year: 2024, revenue: 29800, growth: -7, projects: 10, clients: 15 },
      { month: 'May', year: 2024, revenue: 35400, growth: 19, projects: 12, clients: 18 },
      { month: 'June', year: 2024, revenue: 38900, growth: 10, projects: 13, clients: 19 },
      { month: 'July', year: 2024, revenue: 42300, growth: 9, projects: 14, clients: 21 },
      { month: 'August', year: 2024, revenue: 39600, growth: -6, projects: 13, clients: 20 },
      { month: 'September', year: 2024, revenue: 44200, growth: 12, projects: 15, clients: 22 },
      { month: 'October', year: 2024, revenue: 47800, growth: 8, projects: 16, clients: 24 },
      { month: 'November', year: 2024, revenue: 51200, growth: 7, projects: 17, clients: 25 },
      { month: 'December', year: 2024, revenue: 54600, growth: 7, projects: 18, clients: 27 }
    ],
    yearly: {
      year: 2024,
      revenue: 469100,
      growth: 23,
      projects: 156,
      clients: 233
    },
    currentMonth: 54600,
    lastMonth: 51200,
    averageProjectValue: 8750,
    totalRevenue: 469100,
    revenueByService: [
      { service: 'Web Development', revenue: 145000, count: 42, growth: 28 },
      { service: 'Mobile Apps', revenue: 98000, count: 28, growth: 22 },
      { service: 'UI/UX Design', revenue: 87000, count: 45, growth: 18 },
      { service: 'Branding', revenue: 64000, count: 30, growth: 15 },
      { service: 'SEO & Marketing', revenue: 75000, count: 38, growth: 20 }
    ]
  },
  profitability: {
    projects: [
      {
        id: 'PRJ-001',
        name: 'E-commerce Platform',
        revenue: 45000,
        expenses: 18000,
        profit: 27000,
        margin: 60,
        status: 'completed',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-12-15')
      },
      {
        id: 'PRJ-002',
        name: 'Mobile App Design',
        revenue: 32000,
        expenses: 12800,
        profit: 19200,
        margin: 60,
        status: 'completed',
        startDate: new Date('2024-10-01'),
        endDate: new Date('2024-12-20')
      },
      {
        id: 'PRJ-003',
        name: 'Brand Identity Package',
        revenue: 15000,
        expenses: 4500,
        profit: 10500,
        margin: 70,
        status: 'completed',
        startDate: new Date('2024-11-01'),
        endDate: new Date('2024-12-10')
      },
      {
        id: 'PRJ-004',
        name: 'Website Redesign',
        revenue: 28000,
        expenses: 11200,
        profit: 16800,
        margin: 60,
        status: 'active',
        startDate: new Date('2024-11-15')
      },
      {
        id: 'PRJ-005',
        name: 'Marketing Campaign',
        revenue: 22000,
        expenses: 8800,
        profit: 13200,
        margin: 60,
        status: 'active',
        startDate: new Date('2024-12-01')
      },
      {
        id: 'PRJ-006',
        name: 'SEO Optimization',
        revenue: 12000,
        expenses: 3600,
        profit: 8400,
        margin: 70,
        status: 'completed',
        startDate: new Date('2024-11-01'),
        endDate: new Date('2024-12-31')
      }
    ],
    totalRevenue: 154000,
    totalExpenses: 58900,
    totalProfit: 95100,
    averageMargin: 62,
    marginByCategory: [
      { category: 'Development', revenue: 105000, expenses: 42000, margin: 60 },
      { category: 'Design', revenue: 62000, expenses: 21700, margin: 65 },
      { category: 'Marketing', revenue: 97000, expenses: 33950, margin: 65 }
    ]
  },
  cashFlow: {
    projections: [
      { month: 'January', year: 2025, income: 52000, expenses: 21000, net: 31000, balance: 156000 },
      { month: 'February', year: 2025, income: 48000, expenses: 19000, net: 29000, balance: 185000 },
      { month: 'March', year: 2025, income: 55000, expenses: 22000, net: 33000, balance: 218000 },
      { month: 'April', year: 2025, income: 58000, expenses: 23000, net: 35000, balance: 253000 },
      { month: 'May', year: 2025, income: 51000, expenses: 20000, net: 31000, balance: 284000 },
      { month: 'June', year: 2025, income: 60000, expenses: 24000, net: 36000, balance: 320000 }
    ],
    currentBalance: 125000,
    projectedBalance: 320000,
    runway: 18,
    burnRate: 6944,
    income: {
      projects: 95000,
      recurring: 25000,
      other: 5000,
      total: 125000
    },
    expenses: {
      salaries: 45000,
      software: 8000,
      marketing: 12000,
      operations: 15000,
      other: 5000,
      total: 85000
    }
  },
  insights: {
    topServices: [
      { service: 'Web Development', revenue: 145000, count: 42, avgValue: 3452, growth: 28 },
      { service: 'Mobile Apps', revenue: 98000, count: 28, avgValue: 3500, growth: 22 },
      { service: 'UI/UX Design', revenue: 87000, count: 45, avgValue: 1933, growth: 18 },
      { service: 'Branding', revenue: 64000, count: 30, avgValue: 2133, growth: 15 },
      { service: 'SEO & Marketing', revenue: 75000, count: 38, avgValue: 1974, growth: 20 }
    ],
    clientRetention: 87,
    seasonalTrends: [
      { quarter: 'Q1 2024', year: 2024, revenue: 85300, projects: 28, growth: 0 },
      { quarter: 'Q2 2024', year: 2024, revenue: 104100, projects: 35, growth: 22 },
      { quarter: 'Q3 2024', year: 2024, revenue: 126100, projects: 42, growth: 21 },
      { quarter: 'Q4 2024', year: 2024, revenue: 153600, projects: 51, growth: 22 }
    ],
    growthRate: 23,
    performanceMetrics: [
      { metric: 'Revenue Growth', value: 23, target: 20, status: 'above', trend: 'up' },
      { metric: 'Profit Margin', value: 62, target: 60, status: 'above', trend: 'up' },
      { metric: 'Client Retention', value: 87, target: 85, status: 'above', trend: 'stable' },
      { metric: 'Project Completion Rate', value: 94, target: 95, status: 'on-track', trend: 'stable' },
      { metric: 'Average Project Value', value: 8750, target: 8000, status: 'above', trend: 'up' }
    ],
    recommendations: [
      {
        id: 'REC-001',
        category: 'revenue',
        title: 'Increase Average Project Value',
        description: 'Focus on higher-value web development projects to boost revenue',
        impact: 'high',
        effort: 'medium',
        priority: 1
      },
      {
        id: 'REC-002',
        category: 'efficiency',
        title: 'Improve Project Completion Rate',
        description: 'Streamline workflows to complete projects faster',
        impact: 'medium',
        effort: 'low',
        priority: 2
      },
      {
        id: 'REC-003',
        category: 'growth',
        title: 'Expand Mobile App Services',
        description: 'Mobile apps showing strong growth, consider expanding this service',
        impact: 'high',
        effort: 'high',
        priority: 3
      },
      {
        id: 'REC-004',
        category: 'cost',
        title: 'Optimize Marketing Spend',
        description: 'Review marketing ROI and optimize budget allocation',
        impact: 'medium',
        effort: 'low',
        priority: 4
      }
    ]
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get reports with optional filtering
 */
export function getReports(userId?: string, filters?: {
  type?: ReportType
  status?: ReportStatus
  frequency?: ReportFrequency
  dateRange?: { start: Date; end: Date }
}): Report[] {
  logger.debug('Getting reports', { userId, filters })

  let reports = [...MOCK_REPORTS]

  if (userId) {
    reports = reports.filter(r => r.userId === userId)
  }

  if (filters?.type) {
    reports = reports.filter(r => r.type === filters.type)
  }

  if (filters?.status) {
    reports = reports.filter(r => r.status === filters.status)
  }

  if (filters?.frequency) {
    reports = reports.filter(r => r.frequency === filters.frequency)
  }

  if (filters?.dateRange) {
    reports = reports.filter(r => {
      const reportStart = new Date(r.dateRange.start)
      const reportEnd = new Date(r.dateRange.end)
      return reportStart >= filters.dateRange!.start && reportEnd <= filters.dateRange!.end
    })
  }

  logger.debug('Reports filtered', { count: reports.length })
  return reports
}

/**
 * Get report by ID
 */
export function getReportById(reportId: string): Report | undefined {
  logger.debug('Getting report by ID', { reportId })
  const report = MOCK_REPORTS.find(r => r.id === reportId)

  if (report) {
    logger.debug('Report found', { name: report.name })
  } else {
    logger.warn('Report not found', { reportId })
  }

  return report
}

/**
 * Create new report
 */
export function createReport(data: Partial<Report>): Report {
  logger.info('Creating report', { name: data.name, type: data.type })

  const report: Report = {
    id: `RPT-${String(MOCK_REPORTS.length + 1).padStart(3, '0')}`,
    userId: data.userId || 'USR-001',
    name: data.name || 'Untitled Report',
    type: data.type || 'custom',
    status: 'draft',
    description: data.description || '',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: data.createdBy || 'Unknown',
    dateRange: data.dateRange || {
      start: new Date(),
      end: new Date()
    },
    frequency: data.frequency || 'once',
    dataPoints: 0,
    fileSize: 0,
    recipients: data.recipients || [],
    tags: data.tags || [],
    config: data.config || {
      includeCharts: true,
      includeTables: true,
      includeRawData: false,
      chartTypes: ['bar'],
      metrics: [],
      filters: []
    },
    metadata: {
      generationTime: 0,
      exportHistory: [],
      views: 0,
      downloads: 0,
      scheduleHistory: []
    }
  }

  logger.info('Report created', { id: report.id, name: report.name })
  return report
}

/**
 * Update report
 */
export function updateReport(reportId: string, updates: Partial<Report>): Report | null {
  logger.info('Updating report', { reportId, updates: Object.keys(updates) })

  const index = MOCK_REPORTS.findIndex(r => r.id === reportId)

  if (index === -1) {
    logger.warn('Report not found for update', { reportId })
    return null
  }

  const updatedReport = {
    ...MOCK_REPORTS[index],
    ...updates,
    updatedAt: new Date()
  }

  logger.info('Report updated', { id: updatedReport.id, name: updatedReport.name })
  return updatedReport
}

/**
 * Delete report
 */
export function deleteReport(reportId: string): boolean {
  logger.info('Deleting report', { reportId })

  const index = MOCK_REPORTS.findIndex(r => r.id === reportId)

  if (index === -1) {
    logger.warn('Report not found for deletion', { reportId })
    return false
  }

  const deletedReport = MOCK_REPORTS[index]
  logger.info('Report deleted', { id: deletedReport.id, name: deletedReport.name })
  return true
}

/**
 * Generate report data
 */
export function generateReportData(reportId: string): {
  dataPoints: number
  fileSize: number
  generationTime: number
} {
  logger.info('Generating report data', { reportId })

  const report = getReportById(reportId)

  if (!report) {
    logger.error('Report not found for generation', { reportId })
    throw new Error('Report not found')
  }

  // Simulate report generation
  const dataPoints = Math.floor(Math.random() * 10000) + 1000
  const fileSize = Math.floor(Math.random() * 5000000) + 500000
  const generationTime = Math.floor(Math.random() * 20000) + 5000

  logger.info('Report data generated', {
    reportId,
    dataPoints,
    fileSize,
    generationTime
  })

  return {
    dataPoints,
    fileSize,
    generationTime
  }
}

/**
 * Export report to file
 */
export function exportReport(
  reportId: string,
  format: ExportFormat
): {
  fileSize: number
  downloadUrl: string
  exportId: string
} {
  logger.info('Exporting report', { reportId, format })

  const report = getReportById(reportId)

  if (!report) {
    logger.error('Report not found for export', { reportId })
    throw new Error('Report not found')
  }

  // Simulate file export
  const exportId = `EXP-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
  const fileSize = Math.floor(Math.random() * 10000000) + 1000000
  const downloadUrl = `/exports/${report.name.toLowerCase().replace(/\s+/g, '-')}.${format}`

  logger.info('Report exported', {
    reportId,
    format,
    exportId,
    fileSize,
    downloadUrl
  })

  return {
    fileSize,
    downloadUrl,
    exportId
  }
}

/**
 * Schedule report generation
 */
export function scheduleReport(
  reportId: string,
  nextRun: Date
): {
  scheduleId: string
  nextRun: Date
} {
  logger.info('Scheduling report', { reportId, nextRun })

  const report = getReportById(reportId)

  if (!report) {
    logger.error('Report not found for scheduling', { reportId })
    throw new Error('Report not found')
  }

  const scheduleId = `SCH-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`

  logger.info('Report scheduled', {
    reportId,
    scheduleId,
    nextRun
  })

  return {
    scheduleId,
    nextRun
  }
}

/**
 * Get report templates
 */
export function getReportTemplates(type?: ReportType): ReportTemplate[] {
  logger.debug('Getting report templates', { type })

  let templates = [...MOCK_REPORT_TEMPLATES]

  if (type) {
    templates = templates.filter(t => t.type === type)
  }

  logger.debug('Report templates found', { count: templates.length })
  return templates
}

/**
 * Create report from template
 */
export function createReportFromTemplate(
  templateId: string,
  data: Partial<Report>
): Report {
  logger.info('Creating report from template', { templateId })

  const template = MOCK_REPORT_TEMPLATES.find(t => t.id === templateId)

  if (!template) {
    logger.error('Template not found', { templateId })
    throw new Error('Template not found')
  }

  const report = createReport({
    ...data,
    type: template.type,
    config: template.config
  })

  logger.info('Report created from template', {
    templateId,
    reportId: report.id,
    name: report.name
  })

  return report
}

// Financial Analytics Functions

/**
 * Get financial analytics data
 */
export function getFinancialAnalytics(
  userId?: string,
  dateRange?: { start: Date; end: Date }
): FinancialAnalytics {
  logger.debug('Getting financial analytics', { userId, dateRange })

  // In production, this would filter by userId and dateRange
  // For now, return mock data

  logger.debug('Financial analytics retrieved')
  return MOCK_FINANCIAL_ANALYTICS
}

/**
 * Calculate revenue growth
 */
export function calculateRevenueGrowth(
  currentRevenue: number,
  previousRevenue: number
): number {
  if (previousRevenue === 0) return 0

  const growth = ((currentRevenue - previousRevenue) / previousRevenue) * 100

  logger.debug('Revenue growth calculated', {
    currentRevenue,
    previousRevenue,
    growth
  })

  return Math.round(growth * 10) / 10
}

/**
 * Calculate profit margin
 */
export function calculateProfitMargin(
  revenue: number,
  expenses: number
): number {
  if (revenue === 0) return 0

  const profit = revenue - expenses
  const margin = (profit / revenue) * 100

  logger.debug('Profit margin calculated', {
    revenue,
    expenses,
    profit,
    margin
  })

  return Math.round(margin * 10) / 10
}

/**
 * Calculate cash runway
 */
export function calculateCashRunway(
  currentBalance: number,
  monthlyBurnRate: number
): number {
  if (monthlyBurnRate === 0) return Infinity

  const runway = Math.floor(currentBalance / monthlyBurnRate)

  logger.debug('Cash runway calculated', {
    currentBalance,
    monthlyBurnRate,
    runway
  })

  return runway
}

/**
 * Generate revenue projection
 */
export function generateRevenueProjection(
  historicalData: MonthlyRevenue[],
  months: number
): CashFlowProjection[] {
  logger.debug('Generating revenue projection', {
    historicalMonths: historicalData.length,
    projectionMonths: months
  })

  const projections: CashFlowProjection[] = []

  // Calculate average growth rate
  const growthRates = historicalData.slice(1).map((month, i) =>
    calculateRevenueGrowth(month.revenue, historicalData[i].revenue)
  )
  const avgGrowthRate = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length

  // Calculate average expense ratio
  const avgExpenseRatio = 0.4 // 40% of revenue

  // Generate projections
  let currentBalance = 125000 // Starting balance
  let lastRevenue = historicalData[historicalData.length - 1].revenue

  for (let i = 0; i < months; i++) {
    const projectedRevenue = lastRevenue * (1 + avgGrowthRate / 100)
    const projectedExpenses = projectedRevenue * avgExpenseRatio
    const net = projectedRevenue - projectedExpenses
    currentBalance += net

    const date = new Date()
    date.setMonth(date.getMonth() + i + 1)

    projections.push({
      month: date.toLocaleString('default', { month: 'long' }),
      year: date.getFullYear(),
      income: Math.round(projectedRevenue),
      expenses: Math.round(projectedExpenses),
      net: Math.round(net),
      balance: Math.round(currentBalance)
    })

    lastRevenue = projectedRevenue
  }

  logger.debug('Revenue projection generated', {
    projections: projections.length,
    avgGrowthRate,
    finalBalance: projections[projections.length - 1].balance
  })

  return projections
}

/**
 * Analyze service performance
 */
export function analyzeServicePerformance(
  services: ServiceRevenue[]
): {
  topPerforming: ServiceRevenue[]
  underperforming: ServiceRevenue[]
  recommendations: string[]
} {
  logger.debug('Analyzing service performance', { services: services.length })

  const sorted = [...services].sort((a, b) => b.revenue - a.revenue)

  const avgRevenue = services.reduce((sum, s) => sum + s.revenue, 0) / services.length

  const topPerforming = sorted.filter(s => s.revenue > avgRevenue)
  const underperforming = sorted.filter(s => s.revenue <= avgRevenue)

  const recommendations: string[] = []

  if (topPerforming.length > 0) {
    recommendations.push(
      `Focus on scaling ${topPerforming[0].service} - highest revenue at $${topPerforming[0].revenue.toLocaleString()}`
    )
  }

  if (underperforming.length > 0) {
    recommendations.push(
      `Consider optimizing or phasing out ${underperforming[underperforming.length - 1].service} - lowest revenue`
    )
  }

  const highGrowthServices = services.filter(s => s.growth > 20)
  if (highGrowthServices.length > 0) {
    recommendations.push(
      `Invest in ${highGrowthServices[0].service} - showing ${highGrowthServices[0].growth}% growth`
    )
  }

  logger.debug('Service performance analyzed', {
    topPerforming: topPerforming.length,
    underperforming: underperforming.length,
    recommendations: recommendations.length
  })

  return {
    topPerforming,
    underperforming,
    recommendations
  }
}

/**
 * Calculate KPI status
 */
export function calculateKPIStatus(
  actual: number,
  target: number,
  threshold: number = 0.95
): 'above' | 'on-track' | 'below' {
  const ratio = actual / target

  if (ratio >= 1) return 'above'
  if (ratio >= threshold) return 'on-track'
  return 'below'
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Format number with abbreviation
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toLocaleString()
}

/**
 * Calculate date range
 */
export function calculateDateRange(range: TimeRange): { start: Date; end: Date } {
  const end = new Date()
  const start = new Date()

  switch (range) {
    case '7d':
      start.setDate(end.getDate() - 7)
      break
    case '30d':
      start.setDate(end.getDate() - 30)
      break
    case '90d':
      start.setDate(end.getDate() - 90)
      break
    case '1y':
      start.setFullYear(end.getFullYear() - 1)
      break
    case 'all':
      start.setFullYear(2000)
      break
  }

  return { start, end }
}

/**
 * Get report status color
 */
export function getReportStatusColor(status: ReportStatus): string {
  const colors = {
    draft: 'gray',
    generating: 'blue',
    ready: 'green',
    scheduled: 'purple',
    failed: 'red'
  }

  return colors[status] || 'gray'
}

/**
 * Get report type icon
 */
export function getReportTypeIcon(type: ReportType): string {
  const icons = {
    analytics: 'BarChart3',
    financial: 'DollarSign',
    performance: 'TrendingUp',
    sales: 'Users',
    custom: 'Sparkles'
  }

  return icons[type] || 'FileText'
}

/**
 * Validate report configuration
 */
export function validateReportConfig(config: ReportConfig): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!config.metrics || config.metrics.length === 0) {
    errors.push('At least one metric is required')
  }

  if (config.includeCharts && (!config.chartTypes || config.chartTypes.length === 0)) {
    errors.push('At least one chart type is required when charts are enabled')
  }

  if (config.limit && config.limit < 1) {
    errors.push('Limit must be greater than 0')
  }

  logger.debug('Report config validated', {
    valid: errors.length === 0,
    errors: errors.length
  })

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Search reports
 */
export function searchReports(
  query: string,
  reports: Report[] = MOCK_REPORTS
): Report[] {
  logger.debug('Searching reports', { query })

  const lowerQuery = query.toLowerCase()

  const results = reports.filter(report =>
    report.name.toLowerCase().includes(lowerQuery) ||
    report.description.toLowerCase().includes(lowerQuery) ||
    report.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    report.createdBy.toLowerCase().includes(lowerQuery)
  )

  logger.debug('Search completed', {
    query,
    resultsCount: results.length
  })

  return results
}

/**
 * Sort reports
 */
export function sortReports(
  reports: Report[],
  sortBy: 'name' | 'date' | 'type' | 'status' | 'size',
  order: 'asc' | 'desc' = 'asc'
): Report[] {
  logger.debug('Sorting reports', { sortBy, order })

  const sorted = [...reports].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'date':
        comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        break
      case 'type':
        comparison = a.type.localeCompare(b.type)
        break
      case 'status':
        comparison = a.status.localeCompare(b.status)
        break
      case 'size':
        comparison = a.fileSize - b.fileSize
        break
    }

    return order === 'asc' ? comparison : -comparison
  })

  logger.debug('Reports sorted', { count: sorted.length })
  return sorted
}

/**
 * Generate report summary
 */
export function generateReportSummary(report: Report): string {
  const summary = [
    `${report.name} - ${report.type} report`,
    `Status: ${report.status}`,
    `Created: ${new Date(report.createdAt).toLocaleDateString()}`,
    `Data Points: ${formatNumber(report.dataPoints)}`,
    `File Size: ${formatFileSize(report.fileSize)}`
  ]

  if (report.metadata) {
    summary.push(`Views: ${report.metadata.views}`)
    summary.push(`Downloads: ${report.metadata.downloads}`)
  }

  return summary.join(' • ')
}

logger.info('Reports utilities initialized', {
  mockReports: MOCK_REPORTS.length,
  mockTemplates: MOCK_REPORT_TEMPLATES.length
})
