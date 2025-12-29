// Analytics & Metrics Data - Impressive KPIs for investor demos
// All numbers tell a compelling growth story

export interface Metric {
  id: string
  name: string
  value: number
  previousValue: number
  changePercent: number
  category: string
  type: 'count' | 'currency' | 'percentage' | 'duration' | 'score'
  status: 'up' | 'down' | 'stable'
  target?: number
  trend: number[] // Last 7 data points for sparklines
}

// Core Business Metrics
export const BUSINESS_METRICS: Metric[] = [
  {
    id: 'metric-001',
    name: 'Monthly Recurring Revenue',
    value: 847000,
    previousValue: 789000,
    changePercent: 7.4,
    category: 'Revenue',
    type: 'currency',
    status: 'up',
    target: 900000,
    trend: [712000, 734000, 756000, 778000, 801000, 823000, 847000]
  },
  {
    id: 'metric-002',
    name: 'Annual Recurring Revenue',
    value: 10164000,
    previousValue: 9468000,
    changePercent: 7.4,
    category: 'Revenue',
    type: 'currency',
    status: 'up',
    target: 12000000,
    trend: [8544000, 8808000, 9072000, 9336000, 9612000, 9876000, 10164000]
  },
  {
    id: 'metric-003',
    name: 'Total Customers',
    value: 2847,
    previousValue: 2654,
    changePercent: 7.3,
    category: 'Customers',
    type: 'count',
    status: 'up',
    target: 3500,
    trend: [2380, 2456, 2534, 2598, 2654, 2745, 2847]
  },
  {
    id: 'metric-004',
    name: 'Enterprise Customers',
    value: 156,
    previousValue: 142,
    changePercent: 9.9,
    category: 'Customers',
    type: 'count',
    status: 'up',
    target: 200,
    trend: [118, 125, 132, 138, 142, 148, 156]
  },
  {
    id: 'metric-005',
    name: 'Net Revenue Retention',
    value: 127,
    previousValue: 118,
    changePercent: 7.6,
    category: 'Revenue',
    type: 'percentage',
    status: 'up',
    target: 130,
    trend: [112, 114, 116, 118, 121, 124, 127]
  },
  {
    id: 'metric-006',
    name: 'Churn Rate',
    value: 2.1,
    previousValue: 2.8,
    changePercent: -25.0,
    category: 'Retention',
    type: 'percentage',
    status: 'up', // down is good for churn
    target: 2.0,
    trend: [3.2, 3.0, 2.8, 2.6, 2.4, 2.2, 2.1]
  },
  {
    id: 'metric-007',
    name: 'Customer Lifetime Value',
    value: 12400,
    previousValue: 11200,
    changePercent: 10.7,
    category: 'Value',
    type: 'currency',
    status: 'up',
    target: 15000,
    trend: [9800, 10200, 10600, 11000, 11200, 11800, 12400]
  },
  {
    id: 'metric-008',
    name: 'Customer Acquisition Cost',
    value: 890,
    previousValue: 1050,
    changePercent: -15.2,
    category: 'Efficiency',
    type: 'currency',
    status: 'up', // down is good for CAC
    target: 800,
    trend: [1200, 1150, 1100, 1050, 1000, 940, 890]
  },
  {
    id: 'metric-009',
    name: 'LTV:CAC Ratio',
    value: 13.9,
    previousValue: 10.7,
    changePercent: 30.0,
    category: 'Efficiency',
    type: 'score',
    status: 'up',
    target: 15,
    trend: [8.2, 8.9, 9.6, 10.3, 10.7, 12.5, 13.9]
  },
  {
    id: 'metric-010',
    name: 'Net Promoter Score',
    value: 72,
    previousValue: 68,
    changePercent: 5.9,
    category: 'Satisfaction',
    type: 'score',
    status: 'up',
    target: 80,
    trend: [62, 64, 66, 68, 69, 71, 72]
  },
]

// Product & Engagement Metrics
export const PRODUCT_METRICS: Metric[] = [
  {
    id: 'prod-001',
    name: 'Daily Active Users',
    value: 18200,
    previousValue: 17100,
    changePercent: 6.4,
    category: 'Engagement',
    type: 'count',
    status: 'up',
    target: 20000,
    trend: [15400, 15900, 16400, 16900, 17400, 17800, 18200]
  },
  {
    id: 'prod-002',
    name: 'Monthly Active Users',
    value: 22750,
    previousValue: 21400,
    changePercent: 6.3,
    category: 'Engagement',
    type: 'count',
    status: 'up',
    target: 25000,
    trend: [19200, 19800, 20400, 21000, 21400, 22100, 22750]
  },
  {
    id: 'prod-003',
    name: 'DAU/MAU Ratio',
    value: 80,
    previousValue: 79.9,
    changePercent: 0.1,
    category: 'Engagement',
    type: 'percentage',
    status: 'stable',
    target: 85,
    trend: [78, 78.5, 79, 79.2, 79.5, 79.8, 80]
  },
  {
    id: 'prod-004',
    name: 'Avg Session Duration',
    value: 24.5,
    previousValue: 22.8,
    changePercent: 7.5,
    category: 'Engagement',
    type: 'duration',
    status: 'up',
    target: 30,
    trend: [20.2, 21.0, 21.8, 22.4, 23.0, 23.8, 24.5]
  },
  {
    id: 'prod-005',
    name: 'Feature Adoption Rate',
    value: 68.5,
    previousValue: 62.3,
    changePercent: 10.0,
    category: 'Adoption',
    type: 'percentage',
    status: 'up',
    target: 75,
    trend: [54, 56, 58, 60, 62, 65, 68.5]
  },
  {
    id: 'prod-006',
    name: 'Projects Created',
    value: 45780,
    previousValue: 42100,
    changePercent: 8.7,
    category: 'Usage',
    type: 'count',
    status: 'up',
    trend: [35200, 37400, 39600, 41200, 42800, 44200, 45780]
  },
  {
    id: 'prod-007',
    name: 'AI Features Used',
    value: 128500,
    previousValue: 89000,
    changePercent: 44.4,
    category: 'AI',
    type: 'count',
    status: 'up',
    trend: [45000, 58000, 72000, 85000, 98000, 112000, 128500]
  },
  {
    id: 'prod-008',
    name: 'Files Processed',
    value: 892000,
    previousValue: 774000,
    changePercent: 15.2,
    category: 'Usage',
    type: 'count',
    status: 'up',
    trend: [620000, 680000, 720000, 760000, 800000, 845000, 892000]
  },
]

// Sales & Marketing Metrics
export const SALES_METRICS: Metric[] = [
  {
    id: 'sales-001',
    name: 'Pipeline Value',
    value: 2450000,
    previousValue: 2180000,
    changePercent: 12.4,
    category: 'Pipeline',
    type: 'currency',
    status: 'up',
    target: 3000000,
    trend: [1850000, 1950000, 2050000, 2150000, 2250000, 2350000, 2450000]
  },
  {
    id: 'sales-002',
    name: 'Weighted Pipeline',
    value: 1470000,
    previousValue: 1308000,
    changePercent: 12.4,
    category: 'Pipeline',
    type: 'currency',
    status: 'up',
    trend: [1110000, 1170000, 1230000, 1290000, 1350000, 1410000, 1470000]
  },
  {
    id: 'sales-003',
    name: 'Win Rate',
    value: 42,
    previousValue: 38,
    changePercent: 10.5,
    category: 'Sales',
    type: 'percentage',
    status: 'up',
    target: 50,
    trend: [32, 34, 35, 37, 38, 40, 42]
  },
  {
    id: 'sales-004',
    name: 'Average Deal Size',
    value: 24500,
    previousValue: 21200,
    changePercent: 15.6,
    category: 'Sales',
    type: 'currency',
    status: 'up',
    target: 30000,
    trend: [18500, 19200, 20100, 21000, 22000, 23200, 24500]
  },
  {
    id: 'sales-005',
    name: 'Sales Cycle (Days)',
    value: 28,
    previousValue: 35,
    changePercent: -20.0,
    category: 'Efficiency',
    type: 'duration',
    status: 'up',
    target: 25,
    trend: [42, 40, 38, 35, 32, 30, 28]
  },
  {
    id: 'sales-006',
    name: 'Leads Generated',
    value: 1850,
    previousValue: 1620,
    changePercent: 14.2,
    category: 'Marketing',
    type: 'count',
    status: 'up',
    target: 2000,
    trend: [1280, 1350, 1420, 1500, 1580, 1700, 1850]
  },
  {
    id: 'sales-007',
    name: 'Lead to Customer Rate',
    value: 8.5,
    previousValue: 7.2,
    changePercent: 18.1,
    category: 'Conversion',
    type: 'percentage',
    status: 'up',
    target: 10,
    trend: [5.8, 6.2, 6.6, 7.0, 7.4, 7.9, 8.5]
  },
  {
    id: 'sales-008',
    name: 'Marketing ROI',
    value: 485,
    previousValue: 420,
    changePercent: 15.5,
    category: 'Efficiency',
    type: 'percentage',
    status: 'up',
    target: 500,
    trend: [340, 360, 380, 400, 420, 450, 485]
  },
]

// Funnel Data
export const CONVERSION_FUNNEL = [
  { stage: 'Website Visitors', count: 485000, conversion: 100, dropoff: 0 },
  { stage: 'Sign Up Started', count: 48500, conversion: 10, dropoff: 90 },
  { stage: 'Sign Up Completed', count: 24250, conversion: 50, dropoff: 50 },
  { stage: 'Onboarding Done', count: 17775, conversion: 73.3, dropoff: 26.7 },
  { stage: 'First Project', count: 14220, conversion: 80, dropoff: 20 },
  { stage: 'Activated', count: 11376, conversion: 80, dropoff: 20 },
  { stage: 'Converted to Paid', count: 2847, conversion: 25, dropoff: 75 },
]

// Cohort Retention Data
export const COHORT_RETENTION = [
  { cohort: 'Jan Week 1', users: 1890, week0: 100, week1: 78, week2: 65, week3: 58, week4: 52, week5: 48, week6: 45, week7: 42 },
  { cohort: 'Jan Week 2', users: 1780, week0: 100, week1: 76, week2: 62, week3: 55, week4: 50, week5: 46, week6: 43, week7: 0 },
  { cohort: 'Jan Week 3', users: 1920, week0: 100, week1: 80, week2: 68, week3: 60, week4: 54, week5: 50, week6: 0, week7: 0 },
  { cohort: 'Jan Week 4', users: 2050, week0: 100, week1: 82, week2: 70, week3: 62, week4: 56, week5: 0, week6: 0, week7: 0 },
  { cohort: 'Feb Week 1', users: 2180, week0: 100, week1: 79, week2: 66, week3: 58, week4: 0, week5: 0, week6: 0, week7: 0 },
  { cohort: 'Feb Week 2', users: 2340, week0: 100, week1: 81, week2: 69, week3: 0, week4: 0, week5: 0, week6: 0, week7: 0 },
  { cohort: 'Feb Week 3', users: 2450, week0: 100, week1: 84, week2: 0, week3: 0, week4: 0, week5: 0, week6: 0, week7: 0 },
  { cohort: 'Feb Week 4', users: 2580, week0: 100, week1: 0, week2: 0, week3: 0, week4: 0, week5: 0, week6: 0, week7: 0 },
]

// Real-time metrics
export const REALTIME_METRICS = {
  activeUsersNow: 847,
  pageViewsPerMin: 245,
  eventsPerMin: 1280,
  currentConversions: 12,
  activeProjects: 156,
  filesUploading: 23,
  aiRequestsPerMin: 89,
  apiCallsPerMin: 4520,
}

// Health scores
export const SYSTEM_HEALTH = {
  uptime: 99.98,
  responseTime: 145, // ms
  errorRate: 0.02,
  apiLatency: 89, // ms
  dbLatency: 12, // ms
  cacheHitRate: 96.5,
  serverLoad: 42,
  memoryUsage: 68,
}

// Geographic distribution
export const GEO_DISTRIBUTION = [
  { region: 'North America', users: 14000, revenue: 5082000, percentage: 50 },
  { region: 'Europe', users: 6200, revenue: 2540500, percentage: 25 },
  { region: 'Asia Pacific', users: 3100, revenue: 1016400, percentage: 10 },
  { region: 'Latin America', users: 850, revenue: 305000, percentage: 3 },
  { region: 'Other', users: 742, revenue: 220100, percentage: 2 },
]
