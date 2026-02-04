/**
 * Seed Business Intelligence / Analytics Dashboard Data
 *
 * Populates demo data for:
 * - Business metrics
 * - Analytics reports
 * - KPIs
 * - Dashboard statistics
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

async function main() {
  console.log('\n🎯 Seeding Business Intelligence Dashboard Data\n')
  console.log('User ID:', DEMO_USER_ID)
  console.log('Email: alex@freeflow.io\n')

  // Dashboard Stats (Overview numbers)
  console.log('1️⃣  Dashboard Stats...')
  const { error: statsError } = await supabase
    .from('dashboard_stats')
    .upsert({
      user_id: DEMO_USER_ID,
      total_revenue: 125000,
      active_clients: 15,
      active_projects: 20,
      completion_rate: 94,
      client_satisfaction: 4.8,
      team_size: 3,
      monthly_revenue: 12500,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })

  if (statsError) {
    console.log('   ⚠️  Stats:', statsError.message)
  } else {
    console.log('   ✅ Dashboard stats seeded')
  }

  // Dashboard Metrics (KPIs over time)
  console.log('\n2️⃣  Dashboard Metrics (KPIs)...')

  const metrics = [
    {
      user_id: DEMO_USER_ID,
      metric_name: 'Monthly Recurring Revenue',
      metric_value: 12500,
      metric_type: 'revenue',
      trend: 'up',
      change_percentage: 25.5,
      period: 'month',
      date: new Date().toISOString()
    },
    {
      user_id: DEMO_USER_ID,
      metric_name: 'Total Revenue',
      metric_value: 125000,
      metric_type: 'revenue',
      trend: 'up',
      change_percentage: 630,
      period: 'year',
      date: new Date().toISOString()
    },
    {
      user_id: DEMO_USER_ID,
      metric_name: 'Active Clients',
      metric_value: 15,
      metric_type: 'clients',
      trend: 'up',
      change_percentage: 50,
      period: 'quarter',
      date: new Date().toISOString()
    },
    {
      user_id: DEMO_USER_ID,
      metric_name: 'Client Satisfaction',
      metric_value: 4.8,
      metric_type: 'satisfaction',
      trend: 'stable',
      change_percentage: 2.1,
      period: 'month',
      date: new Date().toISOString()
    },
    {
      user_id: DEMO_USER_ID,
      metric_name: 'Project Completion Rate',
      metric_value: 94,
      metric_type: 'performance',
      trend: 'up',
      change_percentage: 8.5,
      period: 'month',
      date: new Date().toISOString()
    },
    {
      user_id: DEMO_USER_ID,
      metric_name: 'Average Project Value',
      metric_value: 15600,
      metric_type: 'revenue',
      trend: 'up',
      change_percentage: 35,
      period: 'quarter',
      date: new Date().toISOString()
    },
    {
      user_id: DEMO_USER_ID,
      metric_name: 'Team Utilization',
      metric_value: 94,
      metric_type: 'performance',
      trend: 'stable',
      change_percentage: 1.5,
      period: 'week',
      date: new Date().toISOString()
    },
    {
      user_id: DEMO_USER_ID,
      metric_name: 'Lead Conversion Rate',
      metric_value: 45,
      metric_type: 'sales',
      trend: 'up',
      change_percentage: 125,
      period: 'month',
      date: new Date().toISOString()
    }
  ]

  for (const metric of metrics) {
    const { error } = await supabase
      .from('dashboard_metrics')
      .insert(metric)

    if (error && !error.message.includes('duplicate')) {
      console.log(`   ⚠️  ${metric.metric_name}:`, error.message)
    }
  }
  console.log('   ✅', metrics.length, 'KPIs seeded')

  // Revenue Analytics (monthly breakdown)
  console.log('\n3️⃣  Revenue Analytics...')

  const revenueData = [
    { month: 'January', revenue: 3500, expenses: 500, profit: 3000 },
    { month: 'February', revenue: 5000, expenses: 750, profit: 4250 },
    { month: 'March', revenue: 11000, expenses: 1500, profit: 9500 },
    { month: 'April', revenue: 15000, expenses: 6500, profit: 8500 },
    { month: 'May', revenue: 20500, expenses: 10250, profit: 10250 },
    { month: 'June', revenue: 13500, expenses: 6750, profit: 6750 },
    { month: 'July', revenue: 18000, expenses: 7200, profit: 10800 },
    { month: 'August', revenue: 12000, expenses: 6000, profit: 6000 },
    { month: 'September', revenue: 9500, expenses: 4750, profit: 4750 },
    { month: 'October', revenue: 22000, expenses: 8800, profit: 13200 },
    { month: 'November', revenue: 17000, expenses: 6800, profit: 10200 },
    { month: 'December', revenue: 28000, expenses: 11200, profit: 16800 }
  ]

  let revenueCount = 0
  for (const data of revenueData) {
    const { error } = await supabase
      .from('revenue_analytics')
      .insert({
        user_id: DEMO_USER_ID,
        period: data.month,
        revenue: data.revenue,
        expenses: data.expenses,
        profit: data.profit,
        profit_margin: ((data.profit / data.revenue) * 100).toFixed(1),
        date: new Date(2025, revenueData.indexOf(data), 1).toISOString()
      })

    if (!error) revenueCount++
  }
  console.log('   ✅', revenueCount, 'months of revenue data seeded')

  // Business Insights
  console.log('\n4️⃣  Business Insights...')

  const insights = [
    {
      user_id: DEMO_USER_ID,
      title: 'Revenue Growth Accelerating',
      description: 'Q4 revenue up 180% compared to Q1. Enterprise clients driving growth.',
      type: 'positive',
      category: 'revenue',
      priority: 'high',
      created_at: new Date().toISOString()
    },
    {
      user_id: DEMO_USER_ID,
      title: 'High Client Retention',
      description: '92% client retention rate exceeds industry average of 70%.',
      type: 'positive',
      category: 'clients',
      priority: 'medium',
      created_at: new Date().toISOString()
    },
    {
      user_id: DEMO_USER_ID,
      title: 'Opportunity: Retainer Contracts',
      description: '3 active retainers generating $7.5K MRR. Opportunity to convert 5 more clients.',
      type: 'opportunity',
      category: 'sales',
      priority: 'high',
      created_at: new Date().toISOString()
    },
    {
      user_id: DEMO_USER_ID,
      title: 'Team Scaling Efficiently',
      description: 'Revenue per team member increased 40% with addition of contractors.',
      type: 'positive',
      category: 'operations',
      priority: 'medium',
      created_at: new Date().toISOString()
    },
    {
      user_id: DEMO_USER_ID,
      title: 'Lead Conversion Outstanding',
      description: '45% lead conversion vs 2% industry average. Process highly effective.',
      type: 'positive',
      category: 'sales',
      priority: 'high',
      created_at: new Date().toISOString()
    }
  ]

  let insightCount = 0
  for (const insight of insights) {
    const { error } = await supabase
      .from('business_insights')
      .insert(insight)

    if (!error) insightCount++
  }
  console.log('   ✅', insightCount, 'business insights seeded')

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════')
  console.log('📊 BUSINESS INTELLIGENCE DATA SEEDED')
  console.log('═══════════════════════════════════════════════════════════')
  console.log('✅ Dashboard stats (overview numbers)')
  console.log('✅', metrics.length, 'KPI metrics')
  console.log('✅', revenueCount, 'months of revenue analytics')
  console.log('✅', insightCount, 'business insights')
  console.log('\n🎯 Business Intelligence dashboard should now show data!')
  console.log('   URL: http://localhost:9323/v2/dashboard/analytics')
  console.log('   or: http://localhost:9323/dashboard/analytics-v2')
  console.log('═══════════════════════════════════════════════════════════\n')
}

main().catch(console.error)
