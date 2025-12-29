// Customer & Client Data - Interconnected across CRM, Invoicing, Orders
// These customers appear consistently throughout the application

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  company: string
  companyLogo?: string
  title: string
  industry: string
  type: 'enterprise' | 'mid-market' | 'smb' | 'startup'
  status: 'active' | 'vip' | 'new' | 'at-risk' | 'churned'
  plan: 'starter' | 'professional' | 'business' | 'enterprise'
  mrr: number
  ltv: number
  healthScore: number
  npsScore: number | null
  contractValue: number
  contractStart: string
  contractEnd: string
  lastActivity: string
  owner: string
  tags: string[]
  avatar: string
  location: string
  timezone: string
  createdAt: string
}

export interface Company {
  id: string
  name: string
  logo?: string
  industry: string
  size: 'startup' | 'smb' | 'mid-market' | 'enterprise'
  employees: number
  revenue: string
  website: string
  location: string
  contacts: number
  activeDeals: number
  totalRevenue: number
  healthScore: number
  status: 'active' | 'prospect' | 'at-risk' | 'churned'
  tier: 'platinum' | 'gold' | 'silver' | 'bronze'
  csm: string
  createdAt: string
}

// Top Enterprise Customers - These appear across all modules
export const TOP_CUSTOMERS: Customer[] = [
  {
    id: 'cust-001',
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@spotify.com',
    phone: '+1 (415) 555-0101',
    company: 'Spotify',
    title: 'VP of Creative Operations',
    industry: 'Entertainment',
    type: 'enterprise',
    status: 'vip',
    plan: 'enterprise',
    mrr: 12500,
    ltv: 450000,
    healthScore: 95,
    npsScore: 10,
    contractValue: 150000,
    contractStart: '2024-01-15',
    contractEnd: '2025-01-14',
    lastActivity: '2025-01-28T14:30:00Z',
    owner: 'Jennifer Walsh',
    tags: ['enterprise', 'strategic', 'case-study'],
    avatar: 'SM',
    location: 'New York, NY',
    timezone: 'America/New_York',
    createdAt: '2023-06-15T09:00:00Z'
  },
  {
    id: 'cust-002',
    name: 'James Rodriguez',
    email: 'james.r@nike.com',
    phone: '+1 (503) 555-0202',
    company: 'Nike',
    title: 'Global Creative Director',
    industry: 'Retail',
    type: 'enterprise',
    status: 'vip',
    plan: 'enterprise',
    mrr: 18750,
    ltv: 675000,
    healthScore: 98,
    npsScore: 10,
    contractValue: 225000,
    contractStart: '2024-03-01',
    contractEnd: '2025-02-28',
    lastActivity: '2025-01-28T16:45:00Z',
    owner: 'Michael Chen',
    tags: ['enterprise', 'expansion', 'reference'],
    avatar: 'JR',
    location: 'Portland, OR',
    timezone: 'America/Los_Angeles',
    createdAt: '2023-08-20T11:00:00Z'
  },
  {
    id: 'cust-003',
    name: 'Emma Thompson',
    email: 'emma.t@shopify.com',
    phone: '+1 (613) 555-0303',
    company: 'Shopify',
    title: 'Head of Brand Design',
    industry: 'Technology',
    type: 'enterprise',
    status: 'active',
    plan: 'enterprise',
    mrr: 8500,
    ltv: 306000,
    healthScore: 88,
    npsScore: 9,
    contractValue: 102000,
    contractStart: '2024-06-01',
    contractEnd: '2025-05-31',
    lastActivity: '2025-01-27T10:15:00Z',
    owner: 'Jennifer Walsh',
    tags: ['enterprise', 'tech', 'growing'],
    avatar: 'ET',
    location: 'Ottawa, Canada',
    timezone: 'America/Toronto',
    createdAt: '2023-11-10T14:00:00Z'
  },
  {
    id: 'cust-004',
    name: 'David Kim',
    email: 'david.kim@airbnb.com',
    phone: '+1 (415) 555-0404',
    company: 'Airbnb',
    title: 'Design Systems Lead',
    industry: 'Travel',
    type: 'enterprise',
    status: 'active',
    plan: 'business',
    mrr: 4200,
    ltv: 151200,
    healthScore: 82,
    npsScore: 8,
    contractValue: 50400,
    contractStart: '2024-04-15',
    contractEnd: '2025-04-14',
    lastActivity: '2025-01-26T09:30:00Z',
    owner: 'Sarah Johnson',
    tags: ['enterprise', 'design', 'expansion-opp'],
    avatar: 'DK',
    location: 'San Francisco, CA',
    timezone: 'America/Los_Angeles',
    createdAt: '2024-01-05T10:00:00Z'
  },
  {
    id: 'cust-005',
    name: 'Lisa Wang',
    email: 'lisa.wang@stripe.com',
    phone: '+1 (415) 555-0505',
    company: 'Stripe',
    title: 'Creative Operations Manager',
    industry: 'Fintech',
    type: 'enterprise',
    status: 'new',
    plan: 'business',
    mrr: 3800,
    ltv: 45600,
    healthScore: 91,
    npsScore: null,
    contractValue: 45600,
    contractStart: '2024-12-01',
    contractEnd: '2025-11-30',
    lastActivity: '2025-01-28T11:00:00Z',
    owner: 'Michael Chen',
    tags: ['enterprise', 'fintech', 'new-logo'],
    avatar: 'LW',
    location: 'San Francisco, CA',
    timezone: 'America/Los_Angeles',
    createdAt: '2024-11-15T08:00:00Z'
  },
  {
    id: 'cust-006',
    name: 'Marcus Johnson',
    email: 'marcus@creativestudio.io',
    phone: '+1 (212) 555-0606',
    company: 'Creative Studio NYC',
    title: 'Founder & CEO',
    industry: 'Creative Agency',
    type: 'mid-market',
    status: 'vip',
    plan: 'professional',
    mrr: 1580,
    ltv: 56880,
    healthScore: 94,
    npsScore: 10,
    contractValue: 18960,
    contractStart: '2024-02-01',
    contractEnd: '2025-01-31',
    lastActivity: '2025-01-28T13:20:00Z',
    owner: 'Sarah Johnson',
    tags: ['agency', 'advocate', 'referral-source'],
    avatar: 'MJ',
    location: 'New York, NY',
    timezone: 'America/New_York',
    createdAt: '2023-05-01T10:00:00Z'
  },
  {
    id: 'cust-007',
    name: 'Olivia Chen',
    email: 'olivia@pixelcraft.design',
    phone: '+1 (323) 555-0707',
    company: 'PixelCraft Design',
    title: 'Creative Director',
    industry: 'Design Agency',
    type: 'smb',
    status: 'active',
    plan: 'professional',
    mrr: 790,
    ltv: 28440,
    healthScore: 86,
    npsScore: 8,
    contractValue: 9480,
    contractStart: '2024-08-15',
    contractEnd: '2025-08-14',
    lastActivity: '2025-01-27T15:45:00Z',
    owner: 'Emily Davis',
    tags: ['agency', 'design', 'growing'],
    avatar: 'OC',
    location: 'Los Angeles, CA',
    timezone: 'America/Los_Angeles',
    createdAt: '2024-03-20T09:00:00Z'
  },
  {
    id: 'cust-008',
    name: 'Ryan Peters',
    email: 'ryan@mediamasters.co',
    phone: '+1 (512) 555-0808',
    company: 'Media Masters',
    title: 'COO',
    industry: 'Media Production',
    type: 'mid-market',
    status: 'at-risk',
    plan: 'business',
    mrr: 2100,
    ltv: 75600,
    healthScore: 45,
    npsScore: 5,
    contractValue: 25200,
    contractStart: '2024-05-01',
    contractEnd: '2025-04-30',
    lastActivity: '2025-01-10T10:00:00Z',
    owner: 'Jennifer Walsh',
    tags: ['media', 'at-risk', 'needs-attention'],
    avatar: 'RP',
    location: 'Austin, TX',
    timezone: 'America/Chicago',
    createdAt: '2023-09-15T11:00:00Z'
  },
  {
    id: 'cust-009',
    name: 'Alexandra Foster',
    email: 'alex@brandforge.com',
    phone: '+1 (617) 555-0909',
    company: 'BrandForge',
    title: 'Managing Partner',
    industry: 'Branding Agency',
    type: 'mid-market',
    status: 'active',
    plan: 'business',
    mrr: 2850,
    ltv: 102600,
    healthScore: 78,
    npsScore: 7,
    contractValue: 34200,
    contractStart: '2024-03-15',
    contractEnd: '2025-03-14',
    lastActivity: '2025-01-25T14:30:00Z',
    owner: 'Michael Chen',
    tags: ['agency', 'branding', 'upsell-opp'],
    avatar: 'AF',
    location: 'Boston, MA',
    timezone: 'America/New_York',
    createdAt: '2023-10-01T08:00:00Z'
  },
  {
    id: 'cust-010',
    name: 'Daniel Park',
    email: 'daniel@motionlab.studio',
    phone: '+1 (310) 555-1010',
    company: 'Motion Lab Studio',
    title: 'Founder',
    industry: 'Motion Design',
    type: 'smb',
    status: 'active',
    plan: 'professional',
    mrr: 790,
    ltv: 18960,
    healthScore: 89,
    npsScore: 9,
    contractValue: 9480,
    contractStart: '2024-07-01',
    contractEnd: '2025-06-30',
    lastActivity: '2025-01-28T09:15:00Z',
    owner: 'Emily Davis',
    tags: ['motion', 'studio', 'engaged'],
    avatar: 'DP',
    location: 'Los Angeles, CA',
    timezone: 'America/Los_Angeles',
    createdAt: '2024-02-10T10:00:00Z'
  },
]

// Companies - Aggregated view of customer organizations
export const TOP_COMPANIES: Company[] = [
  {
    id: 'comp-001',
    name: 'Spotify',
    industry: 'Entertainment',
    size: 'enterprise',
    employees: 9800,
    revenue: '$13.2B',
    website: 'spotify.com',
    location: 'Stockholm, Sweden',
    contacts: 12,
    activeDeals: 2,
    totalRevenue: 450000,
    healthScore: 95,
    status: 'active',
    tier: 'platinum',
    csm: 'Jennifer Walsh',
    createdAt: '2023-06-15T09:00:00Z'
  },
  {
    id: 'comp-002',
    name: 'Nike',
    industry: 'Retail',
    size: 'enterprise',
    employees: 79000,
    revenue: '$51.2B',
    website: 'nike.com',
    location: 'Beaverton, OR',
    contacts: 18,
    activeDeals: 3,
    totalRevenue: 675000,
    healthScore: 98,
    status: 'active',
    tier: 'platinum',
    csm: 'Michael Chen',
    createdAt: '2023-08-20T11:00:00Z'
  },
  {
    id: 'comp-003',
    name: 'Shopify',
    industry: 'Technology',
    size: 'enterprise',
    employees: 11600,
    revenue: '$7.1B',
    website: 'shopify.com',
    location: 'Ottawa, Canada',
    contacts: 8,
    activeDeals: 1,
    totalRevenue: 306000,
    healthScore: 88,
    status: 'active',
    tier: 'gold',
    csm: 'Jennifer Walsh',
    createdAt: '2023-11-10T14:00:00Z'
  },
  {
    id: 'comp-004',
    name: 'Airbnb',
    industry: 'Travel',
    size: 'enterprise',
    employees: 6900,
    revenue: '$9.9B',
    website: 'airbnb.com',
    location: 'San Francisco, CA',
    contacts: 6,
    activeDeals: 2,
    totalRevenue: 151200,
    healthScore: 82,
    status: 'active',
    tier: 'gold',
    csm: 'Sarah Johnson',
    createdAt: '2024-01-05T10:00:00Z'
  },
  {
    id: 'comp-005',
    name: 'Stripe',
    industry: 'Fintech',
    size: 'enterprise',
    employees: 8000,
    revenue: '$14.4B',
    website: 'stripe.com',
    location: 'San Francisco, CA',
    contacts: 4,
    activeDeals: 1,
    totalRevenue: 45600,
    healthScore: 91,
    status: 'active',
    tier: 'gold',
    csm: 'Michael Chen',
    createdAt: '2024-11-15T08:00:00Z'
  },
  {
    id: 'comp-006',
    name: 'Creative Studio NYC',
    industry: 'Creative Agency',
    size: 'mid-market',
    employees: 85,
    revenue: '$12M',
    website: 'creativestudio.io',
    location: 'New York, NY',
    contacts: 5,
    activeDeals: 1,
    totalRevenue: 56880,
    healthScore: 94,
    status: 'active',
    tier: 'gold',
    csm: 'Sarah Johnson',
    createdAt: '2023-05-01T10:00:00Z'
  },
  {
    id: 'comp-007',
    name: 'PixelCraft Design',
    industry: 'Design Agency',
    size: 'smb',
    employees: 18,
    revenue: '$2.4M',
    website: 'pixelcraft.design',
    location: 'Los Angeles, CA',
    contacts: 3,
    activeDeals: 0,
    totalRevenue: 28440,
    healthScore: 86,
    status: 'active',
    tier: 'silver',
    csm: 'Emily Davis',
    createdAt: '2024-03-20T09:00:00Z'
  },
  {
    id: 'comp-008',
    name: 'Media Masters',
    industry: 'Media Production',
    size: 'mid-market',
    employees: 120,
    revenue: '$18M',
    website: 'mediamasters.co',
    location: 'Austin, TX',
    contacts: 4,
    activeDeals: 0,
    totalRevenue: 75600,
    healthScore: 45,
    status: 'at-risk',
    tier: 'silver',
    csm: 'Jennifer Walsh',
    createdAt: '2023-09-15T11:00:00Z'
  },
]

// Deal Pipeline Data
export interface Deal {
  id: string
  name: string
  company: string
  companyId: string
  contact: string
  contactId: string
  value: number
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  probability: number
  expectedClose: string
  owner: string
  priority: 'high' | 'medium' | 'low'
  products: string[]
  createdAt: string
  lastActivity: string
}

export const DEALS: Deal[] = [
  {
    id: 'deal-001',
    name: 'Enterprise Expansion - Full Suite',
    company: 'Spotify',
    companyId: 'comp-001',
    contact: 'Sarah Mitchell',
    contactId: 'cust-001',
    value: 180000,
    stage: 'negotiation',
    probability: 80,
    expectedClose: '2025-02-28',
    owner: 'Jennifer Walsh',
    priority: 'high',
    products: ['Enterprise Suite', 'AI Add-on', 'Premium Support'],
    createdAt: '2024-11-15',
    lastActivity: '2025-01-28T14:30:00Z'
  },
  {
    id: 'deal-002',
    name: 'Global Rollout Phase 2',
    company: 'Nike',
    companyId: 'comp-002',
    contact: 'James Rodriguez',
    contactId: 'cust-002',
    value: 320000,
    stage: 'proposal',
    probability: 65,
    expectedClose: '2025-03-31',
    owner: 'Michael Chen',
    priority: 'high',
    products: ['Enterprise Suite', 'Custom Integration', 'Training Package'],
    createdAt: '2024-12-01',
    lastActivity: '2025-01-27T16:45:00Z'
  },
  {
    id: 'deal-003',
    name: 'Team Expansion',
    company: 'Shopify',
    companyId: 'comp-003',
    contact: 'Emma Thompson',
    contactId: 'cust-003',
    value: 75000,
    stage: 'qualification',
    probability: 45,
    expectedClose: '2025-04-15',
    owner: 'Jennifer Walsh',
    priority: 'medium',
    products: ['Business Plan', 'Additional Seats'],
    createdAt: '2025-01-10',
    lastActivity: '2025-01-26T10:15:00Z'
  },
  {
    id: 'deal-004',
    name: 'New Logo - Enterprise',
    company: 'Adobe',
    companyId: 'comp-new-001',
    contact: 'Michael Foster',
    contactId: 'cust-new-001',
    value: 250000,
    stage: 'prospecting',
    probability: 20,
    expectedClose: '2025-06-30',
    owner: 'Sarah Johnson',
    priority: 'high',
    products: ['Enterprise Suite'],
    createdAt: '2025-01-20',
    lastActivity: '2025-01-28T09:00:00Z'
  },
  {
    id: 'deal-005',
    name: 'Annual Renewal + Upsell',
    company: 'Airbnb',
    companyId: 'comp-004',
    contact: 'David Kim',
    contactId: 'cust-004',
    value: 85000,
    stage: 'negotiation',
    probability: 75,
    expectedClose: '2025-02-15',
    owner: 'Sarah Johnson',
    priority: 'medium',
    products: ['Business Plan', 'AI Add-on'],
    createdAt: '2024-12-15',
    lastActivity: '2025-01-25T09:30:00Z'
  },
]

// Pipeline stage configuration
export const PIPELINE_STAGES = [
  { id: 'prospecting', label: 'Prospecting', color: 'sky', probability: 10 },
  { id: 'qualification', label: 'Qualification', color: 'indigo', probability: 25 },
  { id: 'proposal', label: 'Proposal', color: 'amber', probability: 50 },
  { id: 'negotiation', label: 'Negotiation', color: 'orange', probability: 75 },
  { id: 'closed_won', label: 'Closed Won', color: 'emerald', probability: 100 },
  { id: 'closed_lost', label: 'Closed Lost', color: 'red', probability: 0 },
]

// Customer segments for analytics
export const CUSTOMER_SEGMENTS = {
  byIndustry: [
    { industry: 'Technology', count: 845, percentage: 29.7, mrr: 251465 },
    { industry: 'Creative Agency', count: 712, percentage: 25.0, mrr: 211660 },
    { industry: 'Media & Entertainment', count: 524, percentage: 18.4, mrr: 155636 },
    { industry: 'Retail & E-commerce', count: 389, percentage: 13.7, mrr: 115577 },
    { industry: 'Finance', count: 198, percentage: 7.0, mrr: 58806 },
    { industry: 'Other', count: 179, percentage: 6.3, mrr: 53196 },
  ],
  byRegion: [
    { region: 'North America', count: 1594, percentage: 56.0, mrr: 474300 },
    { region: 'Europe', count: 712, percentage: 25.0, mrr: 211660 },
    { region: 'Asia Pacific', count: 370, percentage: 13.0, mrr: 109910 },
    { region: 'Latin America', count: 114, percentage: 4.0, mrr: 33880 },
    { region: 'Middle East & Africa', count: 57, percentage: 2.0, mrr: 16940 },
  ],
  bySize: [
    { size: 'Enterprise (1000+)', count: 156, percentage: 5.5, mrr: 381150 },
    { size: 'Mid-Market (100-999)', count: 489, percentage: 17.2, mrr: 271040 },
    { size: 'SMB (10-99)', count: 1847, percentage: 64.9, mrr: 152460 },
    { size: 'Startup (<10)', count: 355, percentage: 12.5, mrr: 42350 },
  ]
}

// Quick stats for dashboards
export const CUSTOMER_STATS = {
  total: 2847,
  active: 2654,
  atRisk: 89,
  churned: 104,
  newThisMonth: 127,
  nps: 72,
  avgHealthScore: 84,
  avgLtv: 12400,
}
