// FreeFlow Company Data - The Story We're Telling Investors
// A rapidly growing B2B SaaS platform helping creative agencies and freelancers

export const COMPANY_INFO = {
  name: 'FreeFlow',
  tagline: 'The All-in-One Platform for Creative Professionals',
  founded: '2022',
  headquarters: 'San Francisco, CA',
  employees: 127,
  stage: 'Series A',
  website: 'freeflow.io',

  // Key Investment Metrics
  metrics: {
    mrr: 847000, // Monthly Recurring Revenue
    arr: 10164000, // Annual Recurring Revenue
    mrrGrowth: 18.5, // Month-over-month growth %
    arrGrowth: 312, // Year-over-year growth %
    customers: 2847,
    enterprises: 156,
    nps: 72,
    churnRate: 2.1,
    ltv: 12400,
    cac: 890,
    ltvCacRatio: 13.9,
    paybackMonths: 4.2,
    grossMargin: 82.5,
    runway: 24, // months
    burnRate: 425000,
  },

  // Growth Story Timeline
  milestones: [
    { date: '2022-Q1', event: 'Company Founded', metric: '3 founders' },
    { date: '2022-Q3', event: 'Seed Round', metric: '$2.5M raised' },
    { date: '2022-Q4', event: 'Product Launch', metric: '100 beta users' },
    { date: '2023-Q1', event: 'Product-Market Fit', metric: '$50K MRR' },
    { date: '2023-Q2', event: 'First Enterprise Deal', metric: 'Fortune 500 client' },
    { date: '2023-Q3', event: 'Team Expansion', metric: '50 employees' },
    { date: '2023-Q4', event: 'Series A', metric: '$15M at $75M valuation' },
    { date: '2024-Q1', event: 'International Launch', metric: '15 countries' },
    { date: '2024-Q2', event: 'AI Features Launch', metric: '40% productivity boost' },
    { date: '2024-Q3', event: 'Enterprise Growth', metric: '100+ enterprise clients' },
    { date: '2024-Q4', event: '$10M ARR', metric: '10,000+ users' },
    { date: '2025-Q1', event: 'Market Leadership', metric: '#1 in category' },
  ],

  // Funding History
  funding: [
    { round: 'Pre-Seed', date: '2022-01', amount: 500000, investors: ['Founders', 'Angels'] },
    { round: 'Seed', date: '2022-08', amount: 2500000, investors: ['First Round Capital', 'Y Combinator'] },
    { round: 'Series A', date: '2023-11', amount: 15000000, investors: ['Andreessen Horowitz', 'Sequoia', 'First Round Capital'] },
  ],

  // Market Opportunity
  market: {
    tam: 78000000000, // $78B - Creative software market
    sam: 12000000000, // $12B - Agency management tools
    som: 480000000, // $480M - Target serviceable market
    growthRate: 24.5, // Annual market growth %
  }
}

// Revenue breakdown by segment
export const REVENUE_SEGMENTS = [
  { segment: 'Enterprise', percentage: 45, mrr: 381150, customers: 156, avgDealSize: 2443 },
  { segment: 'Mid-Market', percentage: 32, mrr: 271040, customers: 489, avgDealSize: 554 },
  { segment: 'SMB', percentage: 18, mrr: 152460, customers: 1847, avgDealSize: 83 },
  { segment: 'Startup', percentage: 5, mrr: 42350, customers: 355, avgDealSize: 119 },
]

// Monthly Revenue Trend (Last 12 months)
export const REVENUE_TREND = [
  { month: 'Feb 2024', mrr: 312000, newMrr: 45000, churnedMrr: 12000, expansionMrr: 28000 },
  { month: 'Mar 2024', mrr: 368000, newMrr: 52000, churnedMrr: 14000, expansionMrr: 32000 },
  { month: 'Apr 2024', mrr: 421000, newMrr: 58000, churnedMrr: 15000, expansionMrr: 25000 },
  { month: 'May 2024', mrr: 478000, newMrr: 62000, churnedMrr: 18000, expansionMrr: 31000 },
  { month: 'Jun 2024', mrr: 534000, newMrr: 67000, churnedMrr: 16000, expansionMrr: 29000 },
  { month: 'Jul 2024', mrr: 589000, newMrr: 72000, churnedMrr: 19000, expansionMrr: 34000 },
  { month: 'Aug 2024', mrr: 645000, newMrr: 78000, churnedMrr: 22000, expansionMrr: 38000 },
  { month: 'Sep 2024', mrr: 698000, newMrr: 82000, churnedMrr: 21000, expansionMrr: 36000 },
  { month: 'Oct 2024', mrr: 752000, newMrr: 85000, churnedMrr: 23000, expansionMrr: 42000 },
  { month: 'Nov 2024', mrr: 789000, newMrr: 78000, churnedMrr: 25000, expansionMrr: 44000 },
  { month: 'Dec 2024', mrr: 823000, newMrr: 74000, churnedMrr: 26000, expansionMrr: 48000 },
  { month: 'Jan 2025', mrr: 847000, newMrr: 68000, churnedMrr: 24000, expansionMrr: 52000 },
]

// User growth trend
export const USER_GROWTH_TREND = [
  { month: 'Feb 2024', users: 4250, dau: 2800, mau: 3890, newUsers: 580, churnedUsers: 92 },
  { month: 'Mar 2024', users: 5120, dau: 3450, mau: 4650, newUsers: 720, churnedUsers: 105 },
  { month: 'Apr 2024', users: 6180, dau: 4200, mau: 5620, newUsers: 890, churnedUsers: 118 },
  { month: 'May 2024', users: 7420, dau: 5100, mau: 6750, newUsers: 1050, churnedUsers: 135 },
  { month: 'Jun 2024', users: 8890, dau: 6200, mau: 8100, newUsers: 1280, churnedUsers: 152 },
  { month: 'Jul 2024', users: 10580, dau: 7500, mau: 9650, newUsers: 1520, churnedUsers: 168 },
  { month: 'Aug 2024', users: 12450, dau: 8900, mau: 11350, newUsers: 1780, churnedUsers: 185 },
  { month: 'Sep 2024', users: 14680, dau: 10500, mau: 13400, newUsers: 2100, churnedUsers: 198 },
  { month: 'Oct 2024', users: 17250, dau: 12400, mau: 15780, newUsers: 2450, churnedUsers: 215 },
  { month: 'Nov 2024', users: 20180, dau: 14600, mau: 18450, newUsers: 2820, churnedUsers: 232 },
  { month: 'Dec 2024', users: 23450, dau: 17100, mau: 21400, newUsers: 3150, churnedUsers: 248 },
  { month: 'Jan 2025', users: 24892, dau: 18200, mau: 22750, newUsers: 1850, churnedUsers: 265 },
]

// Pricing plans
export const PRICING_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    interval: 'month',
    features: ['5 projects', '10GB storage', 'Basic analytics', 'Email support'],
    popular: false,
    customers: 1245
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 79,
    interval: 'month',
    features: ['Unlimited projects', '100GB storage', 'Advanced analytics', 'Priority support', 'Team collaboration', 'API access'],
    popular: true,
    customers: 1089
  },
  {
    id: 'business',
    name: 'Business',
    price: 199,
    interval: 'month',
    features: ['Everything in Pro', '500GB storage', 'Custom workflows', 'SSO/SAML', 'Dedicated CSM', 'SLA guarantee'],
    popular: false,
    customers: 357
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 499,
    interval: 'month',
    features: ['Everything in Business', 'Unlimited storage', 'Custom integrations', 'On-premise option', 'Custom contracts', '24/7 phone support'],
    popular: false,
    customers: 156
  }
]
