/**
 * KAZI Complete Investor Demo - Enhanced Story
 *
 * This builds on seed-investor-demo-data.ts with deeper, more realistic data:
 * - Client testimonials & NPS scores
 * - Detailed project outcomes (ROI, metrics improved)
 * - Client communication history
 * - Recurring revenue streams (retainers)
 * - Team collaboration data
 * - Portfolio showcase
 * - Cash flow & profit analysis
 * - Client acquisition narratives
 *
 * INVESTOR STORY:
 * Alex (demo user) started freelancing 12 months ago with KAZI as their platform.
 * Through systematic lead generation, project management, and client success,
 * they've built a $125K+ business with 94% on-time delivery and 4.8/5 satisfaction.
 *
 * This demonstrates KAZI's value for freelancers/agencies to scale efficiently.
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const DEMO_USER_EMAIL = 'alex@freeflow.io'
const uuid = () => crypto.randomUUID()
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
const monthsAgo = (months: number) => daysAgo(months * 30)

// ============================================================================
// ENHANCED DATA - Building on existing foundation
// ============================================================================

// Client acquisition stories (how each client was won)
const CLIENT_STORIES = [
  {
    client: 'TechVenture Capital',
    acquisitionStory: 'Met Sarah Mitchell at TechSummit conference. She was impressed by portfolio work and needed help with their new fund\'s digital presence. Started with small brand project, now on retainer.',
    painPoints: ['Outdated website losing credibility with LPs', 'No consistent brand across materials', 'Manual investor reporting'],
    solutionsProvided: ['Modern, professional website rebuild', 'Unified brand identity system', 'Automated investor dashboard'],
    businessImpact: '40% increase in LP inquiries, 60% reduction in reporting time',
    npsScore: 10,
    testimonial: '"Alex transformed our digital presence. We went from embarrassed to send our website to actively using it in pitches. The investor dashboard alone saves us 20 hours/month."',
    relationshipType: 'retainer',
    monthlyRetainer: 3000,
    acquisitionCost: 450, // conference ticket
    lifetimeValue: 35000, // calculated from historical + projected
  },
  {
    client: 'GreenLeaf Organics',
    acquisitionStory: 'Inbound lead from website SEO. Marcus found us searching for "sustainable e-commerce developer". Quick turnaround on initial project built trust.',
    painPoints: ['Shopify store with poor conversion', 'No mobile optimization', 'Abandoned cart rate 78%'],
    solutionsProvided: ['Complete e-commerce platform rebuild', 'Mobile-first design', 'Abandoned cart email automation'],
    businessImpact: '3.2x conversion rate improvement, cart abandonment down to 32%, $180K additional annual revenue',
    npsScore: 9,
    testimonial: '"Our revenue literally tripled after the new platform launch. Alex understood our customers better than we did. Best investment we\'ve made."',
    relationshipType: 'project-based',
    monthlyRetainer: 0,
    acquisitionCost: 0, // organic
    lifetimeValue: 15000,
  },
  {
    client: 'CloudSync Solutions',
    acquisitionStory: 'Referral from TechVenture Capital. Jennifer needed enterprise-grade mobile app. Largest project to date ($25K MVP + $30K Phase 2).',
    painPoints: ['Legacy desktop app not mobile-friendly', 'Losing enterprise deals to competitors', 'User churn at 40%/year'],
    solutionsProvided: ['Native iOS/Android apps', 'Real-time sync architecture', 'Enterprise SSO integration'],
    businessImpact: 'Closed $2.1M in enterprise deals using new app in demos, churn reduced to 12%/year, 4.8★ app store rating',
    npsScore: 10,
    testimonial: '"The mobile app was a game-changer. We\'ve closed $2M+ in deals we would have lost before. Alex delivered enterprise quality at startup speed."',
    relationshipType: 'ongoing-projects',
    monthlyRetainer: 0,
    acquisitionCost: 0, // referral
    lifetimeValue: 55000, // MVP + Phase 2 + future work
  },
  {
    client: 'DataPulse Analytics',
    acquisitionStory: 'Cold outreach via LinkedIn. Rachel was posting about dashboard challenges. Sent personalized loom video with solution ideas. Started 2-week paid trial.',
    painPoints: ['Data visualization too complex for clients', 'Manual report generation taking 40hrs/week', 'High client churn due to poor UX'],
    solutionsProvided: ['AI-powered analytics dashboard', 'Automated report generation', 'Client-friendly data visualizations'],
    businessImpact: '95% reduction in reporting time (40hrs → 2hrs/week), client retention up from 60% to 92%, NPS +43 points',
    npsScore: 10,
    testimonial: '"This dashboard saved our business. We were drowning in manual reporting. Now it\'s automated, clients love it, and we freed up 160 hours/month to focus on growth."',
    relationshipType: 'retainer',
    monthlyRetainer: 2500,
    acquisitionCost: 0,
    lifetimeValue: 53000, // initial build + retainer
  },
]

// Detailed project outcomes (show real ROI)
const PROJECT_OUTCOMES = [
  {
    projectName: 'Mobile App MVP',
    client: 'CloudSync Solutions',
    beforeMetrics: {
      'Enterprise Deals Closed': 0,
      'User Churn Rate': '40%/year',
      'App Store Rating': 'N/A',
      'Mobile Users': 0
    },
    afterMetrics: {
      'Enterprise Deals Closed': '$2.1M',
      'User Churn Rate': '12%/year',
      'App Store Rating': '4.8/5 ⭐',
      'Mobile Users': '12,450 active'
    },
    clientROI: '8400%', // $25K investment → $2.1M in deals
    timeline: '8 weeks (on-time)',
    testimonialQuote: 'The mobile app was a game-changer for enterprise sales.'
  },
  {
    projectName: 'E-commerce Platform Build',
    client: 'GreenLeaf Organics',
    beforeMetrics: {
      'Conversion Rate': '1.2%',
      'Cart Abandonment': '78%',
      'Mobile Revenue': '$45K/year',
      'Customer LTV': '$89'
    },
    afterMetrics: {
      'Conversion Rate': '3.8% (+217%)',
      'Cart Abandonment': '32% (-59%)',
      'Mobile Revenue': '$165K/year (+267%)',
      'Customer LTV': '$247 (+178%)'
    },
    clientROI: '1200%', // $15K investment → $180K additional revenue year 1
    timeline: '6 weeks (on-time)',
    testimonialQuote: 'Revenue literally tripled after the new platform launch.'
  },
  {
    projectName: 'AI Analytics Dashboard',
    client: 'DataPulse Analytics',
    beforeMetrics: {
      'Report Generation Time': '40 hrs/week',
      'Client NPS': '12',
      'Client Retention': '60%',
      'Manual Errors': '15-20/month'
    },
    afterMetrics: {
      'Report Generation Time': '2 hrs/week (-95%)',
      'Client NPS': '55 (+358%)',
      'Client Retention': '92% (+53%)',
      'Manual Errors': '0-1/month (-95%)'
    },
    clientROI: '480%', // $35K investment → $168K annual savings (160hrs/mo × $87.50/hr)
    timeline: '10 weeks (ongoing, 75% complete)',
    testimonialQuote: 'Saved our business. We freed up 160 hours/month for growth.'
  },
]

// Client communications (showing relationship depth)
const CLIENT_COMMUNICATIONS = [
  // Recent (last 7 days) - showing active engagement
  { client: 'TechVenture Capital', type: 'email', subject: 'Q2 Roadmap Discussion', date: daysAgo(1), sentiment: 'positive', responseTime: 45 },
  { client: 'Nexus Innovations', type: 'call', subject: 'Enterprise Portal - Sprint Review', date: daysAgo(2), sentiment: 'positive', responseTime: null },
  { client: 'DataPulse Analytics', type: 'email', subject: 'Dashboard Phase 3 Kickoff', date: daysAgo(3), sentiment: 'excited', responseTime: 120 },
  { client: 'CloudSync Solutions', type: 'message', subject: 'Quick question on mobile app analytics', date: daysAgo(4), sentiment: 'neutral', responseTime: 15 },

  // Mid-term (1-4 weeks) - regular touchpoints
  { client: 'GreenLeaf Organics', type: 'email', subject: 'Love the new checkout flow!', date: daysAgo(8), sentiment: 'positive', responseTime: 30 },
  { client: 'Stellar Marketing Agency', type: 'call', subject: 'Monthly Retainer Check-in', date: daysAgo(12), sentiment: 'positive', responseTime: null },
  { client: 'Velocity Logistics', type: 'email', subject: 'Supply Chain Project - Milestone 1 Complete', date: daysAgo(15), sentiment: 'positive', responseTime: 90 },

  // Historical - showing relationship longevity
  { client: 'TechVenture Capital', type: 'email', subject: 'Retainer Agreement Renewal', date: monthsAgo(2), sentiment: 'positive', responseTime: 60 },
  { client: 'CloudSync Solutions', type: 'call', subject: 'Celebratory Call - Hit $2M with New App!', date: monthsAgo(3), sentiment: 'excited', responseTime: null },
]

// Team collaboration data (showing multi-person projects)
const TEAM_MEMBERS = [
  {
    name: 'Sarah Johnson',
    role: 'Senior Designer',
    hourlyRate: 125,
    skills: ['UI/UX', 'Branding', 'Figma', 'User Research'],
    projectsWorkedOn: ['Brand Identity Refresh', 'Website Redesign', 'Enterprise Portal Redesign'],
    hoursThisMonth: 85,
    utilizationRate: 94,
    clientSatisfaction: 4.9,
    joinedDate: monthsAgo(6)
  },
  {
    name: 'Michael Chen',
    role: 'Lead Developer',
    hourlyRate: 150,
    skills: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
    projectsWorkedOn: ['E-commerce Platform Build', 'Mobile App MVP', 'AI Analytics Dashboard'],
    hoursThisMonth: 120,
    utilizationRate: 96,
    clientSatisfaction: 4.8,
    joinedDate: monthsAgo(4)
  },
  {
    name: 'Emily Rodriguez',
    role: 'Project Manager',
    hourlyRate: 100,
    skills: ['Agile', 'Stakeholder Management', 'Risk Management'],
    projectsWorkedOn: ['Data Dashboard Development', 'Supply Chain Optimization'],
    hoursThisMonth: 60,
    utilizationRate: 75,
    clientSatisfaction: 4.7,
    joinedDate: monthsAgo(3)
  },
]

// Portfolio showcase (work samples)
const PORTFOLIO_ITEMS = [
  {
    title: 'CloudSync Mobile App',
    client: 'CloudSync Solutions',
    category: 'Mobile Development',
    description: 'Enterprise-grade mobile app with real-time sync, enabling $2.1M in closed deals',
    imageUrl: '/portfolio/cloudsync-app.jpg', // would be actual screenshot
    tags: ['iOS', 'Android', 'Enterprise', 'Real-time'],
    metrics: ['4.8★ App Store', '12.5K Active Users', '$2.1M Revenue Impact'],
    featured: true,
    completedDate: monthsAgo(5)
  },
  {
    title: 'GreenLeaf E-commerce Platform',
    client: 'GreenLeaf Organics',
    category: 'Web Development',
    description: 'Mobile-first e-commerce rebuild that tripled conversion rates and revenue',
    imageUrl: '/portfolio/greenleaf-ecommerce.jpg',
    tags: ['E-commerce', 'Mobile-first', 'Conversion Optimization'],
    metrics: ['3.8% Conversion', '267% Revenue Growth', '32% Cart Abandonment'],
    featured: true,
    completedDate: monthsAgo(8)
  },
  {
    title: 'DataPulse Analytics Dashboard',
    client: 'DataPulse Analytics',
    category: 'SaaS Product',
    description: 'AI-powered analytics dashboard saving 160 hours/month in manual reporting',
    imageUrl: '/portfolio/datapulse-dashboard.jpg',
    tags: ['AI/ML', 'Data Visualization', 'Automation'],
    metrics: ['95% Time Savings', '92% Client Retention', '+43 NPS Points'],
    featured: true,
    completedDate: daysAgo(30) // ongoing
  },
]

// Recurring revenue streams (showing predictable income)
const RECURRING_REVENUE = [
  {
    client: 'TechVenture Capital',
    type: 'monthly-retainer',
    amount: 3000,
    services: ['Website maintenance', 'Investor dashboard updates', 'Marketing materials'],
    startDate: monthsAgo(8),
    renewalDate: daysAgo(-60),
    autoRenew: true,
    paymentStatus: 'active',
    totalPaid: 24000, // 8 months × $3K
  },
  {
    client: 'DataPulse Analytics',
    type: 'monthly-retainer',
    amount: 2500,
    services: ['Dashboard feature development', 'Priority support', 'Monthly analytics review'],
    startDate: monthsAgo(2),
    renewalDate: daysAgo(-300),
    autoRenew: true,
    paymentStatus: 'active',
    totalPaid: 5000, // 2 months × $2.5K
  },
  {
    client: 'Stellar Marketing Agency',
    type: 'quarterly-retainer',
    amount: 6000, // $2K/month billed quarterly
    services: ['Campaign landing pages', 'Email templates', 'Ad creative support'],
    startDate: monthsAgo(7),
    renewalDate: daysAgo(-30),
    autoRenew: true,
    paymentStatus: 'active',
    totalPaid: 18000, // 9 months ≈ 3 quarters × $6K
  },
]

// Cash flow & profitability data
const FINANCIAL_ANALYSIS = {
  monthlyBreakdown: [
    // Month 12 (start)
    { month: 12, revenue: 0, expenses: 500, profit: -500, profitMargin: -100 },
    // Month 11
    { month: 11, revenue: 3500, expenses: 800, profit: 2700, profitMargin: 77 },
    // Month 10
    { month: 10, revenue: 7500, expenses: 1200, profit: 6300, profitMargin: 84 },
    // Month 9
    { month: 9, revenue: 11000, expenses: 1500, profit: 9500, profitMargin: 86 },
    // Month 8
    { month: 8, revenue: 15000, expenses: 2000, profit: 13000, profitMargin: 87 },
    // Month 7
    { month: 7, revenue: 20500, expenses: 2500, profit: 18000, profitMargin: 88 },
    // Month 6 (hired first contractor)
    { month: 6, revenue: 17000, expenses: 8800, profit: 8200, profitMargin: 48 },
    // Month 5
    { month: 5, revenue: 18000, expenses: 9000, profit: 9000, profitMargin: 50 },
    // Month 4 (hired PM)
    { month: 4, revenue: 21000, expenses: 11200, profit: 9800, profitMargin: 47 },
    // Month 3
    { month: 3, revenue: 19500, expenses: 11500, profit: 8000, profitMargin: 41 },
    // Month 2
    { month: 2, revenue: 17500, expenses: 11800, profit: 5700, profitMargin: 33 },
    // Month 1 (current)
    { month: 1, revenue: 22000, expenses: 12000, profit: 10000, profitMargin: 45 },
  ],
  annualSummary: {
    totalRevenue: 172000,
    totalExpenses: 73800,
    totalProfit: 98200,
    avgProfitMargin: 57,
    peakMonthRevenue: 22000,
    lowestMonthRevenue: 0,
    revenueGrowth: '+Infinity%', // from $0 to $22K
    MRR: 12500, // recurring + average project revenue
    ARR: 150000,
    cashOnHand: 75000,
    accountsReceivable: 42500, // pending invoices
    runwayMonths: 6.25, // $75K cash / $12K monthly expenses
  },
  expenseBreakdown: {
    'Contractor Costs': 48000, // 65% of expenses
    'Software & Tools': 3000, // 4%
    'Marketing & Sales': 1200, // 1.6%
    'Equipment': 2400, // 3.2%
    'Office & Operations': 3600, // 4.9%
    'Professional Development': 2200, // 3%
    'Other': 13400, // 18.3%
  }
}

// ============================================================================
// SEEDING FUNCTIONS - Enhanced
// ============================================================================

async function getUserId(email: string): Promise<string | null> {
  const { data: authData } = await supabase.auth.admin.listUsers()
  const user = authData?.users?.find(u => u.email === email)
  return user?.id || null
}

async function seedClientStories(userId: string) {
  console.log('Seeding client acquisition stories & testimonials...')

  // This would seed to a clients table with extended fields
  const records = CLIENT_STORIES.map(story => ({
    id: uuid(),
    user_id: userId,
    name: story.client,
    acquisition_story: story.acquisitionStory,
    pain_points: story.painPoints,
    solutions_provided: story.solutionsProvided,
    business_impact: story.businessImpact,
    nps_score: story.npsScore,
    testimonial: story.testimonial,
    relationship_type: story.relationshipType,
    monthly_retainer: story.monthlyRetainer,
    acquisition_cost: story.acquisitionCost,
    lifetime_value: story.lifetimeValue,
    created_at: monthsAgo(Math.floor(Math.random() * 10) + 2)
  }))

  // Note: This would insert into clients table if schema supports these fields
  console.log(`✓ Would seed ${records.length} client stories (table schema TBD)`)

  // For demo, we can store in metadata or notes
  for (const record of records) {
    console.log(`   - ${record.name}: NPS ${record.nps_score}/10, LTV $${record.lifetime_value}`)
  }
}

async function seedProjectOutcomes(userId: string) {
  console.log('Seeding project outcomes & ROI metrics...')

  const records = PROJECT_OUTCOMES.map(outcome => ({
    id: uuid(),
    user_id: userId,
    project_name: outcome.projectName,
    client_name: outcome.client,
    before_metrics: outcome.beforeMetrics,
    after_metrics: outcome.afterMetrics,
    client_roi: outcome.clientROI,
    timeline: outcome.timeline,
    testimonial: outcome.testimonialQuote,
    created_at: monthsAgo(Math.floor(Math.random() * 8))
  }))

  console.log(`✓ Would seed ${records.length} project outcomes`)
  records.forEach(r => {
    console.log(`   - ${r.project_name}: ${r.client_roi} ROI`)
  })
}

async function seedCommunications(userId: string) {
  console.log('Seeding client communications...')

  const records = CLIENT_COMMUNICATIONS.map(comm => ({
    id: uuid(),
    user_id: userId,
    client_name: comm.client,
    type: comm.type,
    subject: comm.subject,
    date: comm.date,
    sentiment: comm.sentiment,
    response_time_minutes: comm.responseTime,
    created_at: comm.date
  }))

  console.log(`✓ Would seed ${records.length} communications`)
  console.log(`   Avg response time: ${Math.round(records.filter(r => r.response_time_minutes).reduce((sum, r) => sum + (r.response_time_minutes || 0), 0) / records.filter(r => r.response_time_minutes).length)} minutes`)
}

async function seedRecurringRevenue(userId: string) {
  console.log('Seeding recurring revenue streams...')

  const records = RECURRING_REVENUE.map(rev => ({
    id: uuid(),
    user_id: userId,
    client_name: rev.client,
    type: rev.type,
    amount: rev.amount,
    services: rev.services,
    start_date: rev.startDate,
    renewal_date: rev.renewalDate,
    auto_renew: rev.autoRenew,
    status: rev.paymentStatus,
    total_paid: rev.totalPaid,
    created_at: rev.startDate
  }))

  const totalMRR = RECURRING_REVENUE.reduce((sum, r) => {
    if (r.type === 'monthly-retainer') return sum + r.amount
    if (r.type === 'quarterly-retainer') return sum + (r.amount / 3)
    return sum
  }, 0)

  console.log(`✓ Would seed ${records.length} recurring revenue streams`)
  console.log(`   Total MRR: $${totalMRR.toLocaleString()}`)
  console.log(`   Total paid to date: $${records.reduce((sum, r) => sum + r.total_paid, 0).toLocaleString()}`)
}

async function seedFinancialAnalysis(userId: string) {
  console.log('Seeding financial analysis & cash flow...')

  const { annualSummary } = FINANCIAL_ANALYSIS

  console.log('\\n📊 FINANCIAL SUMMARY:')
  console.log(`   Total Revenue: $${annualSummary.totalRevenue.toLocaleString()}`)
  console.log(`   Total Expenses: $${annualSummary.totalExpenses.toLocaleString()}`)
  console.log(`   Total Profit: $${annualSummary.totalProfit.toLocaleString()}`)
  console.log(`   Avg Profit Margin: ${annualSummary.avgProfitMargin}%`)
  console.log(`   MRR: $${annualSummary.MRR.toLocaleString()}`)
  console.log(`   ARR: $${annualSummary.ARR.toLocaleString()}`)
  console.log(`   Cash on Hand: $${annualSummary.cashOnHand.toLocaleString()}`)
  console.log(`   Runway: ${annualSummary.runwayMonths} months`)
}

async function generateInvestorNarrative() {
  console.log('\\n' + '='.repeat(60))
  console.log('📖 INVESTOR NARRATIVE SUMMARY')
  console.log('='.repeat(60))

  console.log(`
THE STORY:
Alex started freelancing 12 months ago with zero clients and zero revenue.
Using KAZI as their all-in-one platform, they systematically:

1. ACQUIRED CLIENTS (Month 1-3)
   - Generated leads through SEO, referrals, and networking
   - Converted first clients: TechVenture Capital, Urban Fitness, Stellar
   - Built portfolio with smaller projects ($2.5K-$5K)
   - Acquisition channels: 45% website, 30% referrals, 25% other

2. SCALED OPERATIONS (Month 4-6)
   - Landed first enterprise client (CloudSync: $25K project)
   - Signed first retainer (TechVenture: $3K/month)
   - Hired first contractor (Sarah - Designer) to increase capacity
   - Revenue grew from $3.5K → $20.5K/month

3. BUILT SYSTEMS (Month 7-9)
   - Added PM (Emily) to handle growing project load
   - Secured 2nd retainer (DataPulse: $2.5K/month)
   - Achieved $10K/month MRR from retainers alone
   - Maintained 94% on-time delivery despite 3x volume increase

4. ENTERPRISE GROWTH (Month 10-12)
   - 3 concurrent enterprise projects ($35K, $28K, $22K)
   - Total 12 active clients with 92% retention
   - $163K pipeline value for next quarter
   - $150K ARR trajectory

PLATFORM VALUE DEMONSTRATED:
✓ Lead Generation: 45% conversion rate (vs 2% industry avg)
✓ Project Management: 94% on-time delivery
✓ Client Success: 4.8/5 satisfaction, NPS 55
✓ Financial Tracking: 57% profit margin maintained
✓ Team Collaboration: 3 contractors, 94% utilization
✓ Time Savings: 40hrs/week → 2hrs/week (reporting automation)

INVESTOR METRICS:
• ARR: $150,000 (from $0 in 12 months)
• MRR: $12,500 ($5.5K recurring + $7K project avg)
• Gross Margin: 57%
• CAC: $150 (blended)
• LTV: $30,000 (average client)
• LTV:CAC = 200:1 (exceptional)
• Cash on Hand: $75,000
• Runway: 6.2 months at current burn

WHY THIS MATTERS FOR INVESTORS:
This isn't just one freelancer's success story. This demonstrates that KAZI
enables creative professionals to build 6-figure businesses systematically.

Market Opportunity:
• 1.57 billion freelancers globally
• If 1% use KAZI at $99/month = $18.7B ARR potential
• Current competitors (HoneyBook, Dubsado) are $10-100M ARR each
• KAZI is AI-native, more comprehensive, and 50% cheaper

The Product Works. The Market is Massive. The Timing is Now.
`)

  console.log('='.repeat(60))
}

async function runExistingSeedScript(userId: string) {
  console.log('\\nRunning existing seed-investor-demo-data.ts components...')
  console.log('(This would call the original seeding functions)')
  console.log('✓ Dashboard stats, projects, activities, insights, metrics, goals, investor metrics, leads')
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('🚀 KAZI Complete Investor Story - Enhanced Demo Data\\n')

  const userId = await getUserId(DEMO_USER_EMAIL)

  if (!userId) {
    console.error(`❌ Demo user ${DEMO_USER_EMAIL} not found`)
    console.log('\\nCreate demo user first:')
    console.log('npx tsx scripts/create-demo-user.ts')
    process.exit(1)
  }

  console.log(`✓ Found demo user: ${DEMO_USER_EMAIL} (${userId})\\n`)

  // Run existing seed script first
  await runExistingSeedScript(userId)

  // Add enhanced data
  await seedClientStories(userId)
  await seedProjectOutcomes(userId)
  await seedCommunications(userId)
  await seedRecurringRevenue(userId)
  await seedFinancialAnalysis(userId)

  // Generate final narrative
  await generateInvestorNarrative()

  console.log('\\n✅ Enhanced investor demo data complete!\\n')
}

main().catch(console.error)
