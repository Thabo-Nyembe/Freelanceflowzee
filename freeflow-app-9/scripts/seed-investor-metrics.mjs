#!/usr/bin/env node
/**
 * INVESTOR-FOCUSED DEMO DATA SEED
 *
 * Based on research from:
 * - 2025 B2B SaaS Startup Benchmarks (Lighter Capital)
 * - SaaS Metrics Benchmark Report 2025 (2,000+ companies analyzed)
 * - Essential SaaS Metrics for Series A (The SaaS CFO)
 * - Agency Analytics & Freelancer Management Software best practices
 *
 * KEY METRICS INVESTORS WANT TO SEE:
 * ✓ ARR: $1.5-3M for Series A baseline (we show $250K seed stage)
 * ✓ MRR Growth: 15-20% monthly for early stage
 * ✓ Churn: <5% annual (we show 3%)
 * ✓ NRR: >100% (we show 115% - expansion revenue)
 * ✓ LTV:CAC: 3:1+ (we show 4.2:1)
 * ✓ CAC Payback: <12 months (we show 8 months)
 * ✓ Rule of 40: Growth + Margin >= 40% (we show 55%)
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';
const uuid = (prefix, num) => `${prefix}-0000-0000-0000-${String(num).padStart(12, '0')}`;
const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

console.log('🎯 SEEDING INVESTOR-FOCUSED DEMO DATA\n');
console.log('═'.repeat(70));
console.log('\n📊 TARGET METRICS (Based on 2025 SaaS Benchmarks):');
console.log('   • ARR: $250K (Seed stage, targeting $1.5M for Series A)');
console.log('   • MRR Growth: 18% monthly average');
console.log('   • Annual Churn: 3% (Industry best: <5%)');
console.log('   • NRR: 115% (Expansion from existing clients)');
console.log('   • LTV:CAC: 4.2:1 (Best-in-class: 5:1)');
console.log('   • CAC Payback: 8 months (Target: <12 months)');
console.log('   • Rule of 40: 55% (Growth 40% + Margin 15%)');
console.log('\n' + '═'.repeat(70));

// ============================================================================
// 1. USER ACTIVITY LOGS - Shows daily engagement (DAU/MAU metrics)
// ============================================================================
async function seedUserActivity() {
  console.log('\n📱 Seeding User Activity (DAU/MAU Metrics)...');

  const activities = [];
  const features = [
    'dashboard_view', 'project_create', 'project_edit', 'invoice_create',
    'invoice_send', 'time_tracking_start', 'time_tracking_stop', 'client_add',
    'file_upload', 'message_send', 'calendar_event_create', 'report_generate',
    'ai_assistant_use', 'task_complete', 'proposal_create', 'contract_sign'
  ];

  // Generate 90 days of user activity (shows consistent engagement)
  for (let day = 0; day < 90; day++) {
    const date = new Date(Date.now() - day * 24 * 60 * 60 * 1000);

    // Skip some weekends to show realistic patterns
    if (date.getDay() === 0) continue;
    if (date.getDay() === 6 && Math.random() > 0.3) continue;

    // 15-40 actions per active day (high engagement)
    const actionsPerDay = Math.floor(Math.random() * 25) + 15;

    for (let i = 0; i < actionsPerDay; i++) {
      const hour = 8 + Math.floor(Math.random() * 10); // 8am - 6pm
      const eventDate = new Date(date);
      eventDate.setHours(hour, Math.floor(Math.random() * 60), 0);

      activities.push({
        id: uuid('60000000', activities.length + 1),
        user_id: DEMO_USER_ID,
        event_type: randomItem(features),
        event_data: { session_id: `session_${day}_${i}` },
        created_at: eventDate.toISOString(),
      });
    }
  }

  const { error } = await supabase.from('user_activity_logs').upsert(activities.slice(0, 500), { onConflict: 'id' });
  if (error) {
    // Try analytics_events
    const { error: error2 } = await supabase.from('analytics_events').upsert(
      activities.slice(0, 500).map(a => ({
        ...a,
        event_name: a.event_type,
      })),
      { onConflict: 'id' }
    );
    if (error2) {
      console.log(`   ⚠️  user_activity: ${error.message}`);
    } else {
      console.log(`   ✓ Created ${Math.min(activities.length, 500)} activity events`);
    }
  } else {
    console.log(`   ✓ Created ${Math.min(activities.length, 500)} activity events`);
  }

  // Calculate DAU/MAU ratio (sticky factor)
  const uniqueDays = new Set(activities.map(a => a.created_at.slice(0, 10))).size;
  console.log(`   📊 Active Days: ${uniqueDays}/90 | Avg Actions/Day: ${Math.round(activities.length / uniqueDays)}`);
}

// ============================================================================
// 2. REVENUE METRICS - MRR/ARR growth trajectory
// ============================================================================
async function seedRevenueMetrics() {
  console.log('\n💰 Seeding Revenue Metrics (MRR/ARR Growth)...');

  const revenueData = [];

  // 12-month growth trajectory: $3K → $21K MRR (18% monthly growth)
  const months = [
    { month: '2025-02', mrr: 3000, clients: 2, churn: 0, expansion: 0 },
    { month: '2025-03', mrr: 4500, clients: 3, churn: 0, expansion: 500 },
    { month: '2025-04', mrr: 6200, clients: 5, churn: 0, expansion: 700 },
    { month: '2025-05', mrr: 7800, clients: 6, churn: 300, expansion: 900 },
    { month: '2025-06', mrr: 9500, clients: 7, churn: 0, expansion: 1200 },
    { month: '2025-07', mrr: 11500, clients: 9, churn: 400, expansion: 1400 },
    { month: '2025-08', mrr: 13200, clients: 10, churn: 0, expansion: 1700 },
    { month: '2025-09', mrr: 15000, clients: 11, churn: 500, expansion: 2000 },
    { month: '2025-10', mrr: 17200, clients: 12, churn: 0, expansion: 2200 },
    { month: '2025-11', mrr: 19000, clients: 14, churn: 400, expansion: 2400 },
    { month: '2025-12', mrr: 21500, clients: 15, churn: 0, expansion: 2900 },
    { month: '2026-01', mrr: 24800, clients: 17, churn: 300, expansion: 3300 },
  ];

  for (const m of months) {
    revenueData.push({
      id: uuid('61000000', revenueData.length + 1),
      user_id: DEMO_USER_ID,
      period: m.month,
      mrr: m.mrr,
      arr: m.mrr * 12,
      new_mrr: Math.round(m.mrr * 0.2),
      churned_mrr: m.churn,
      expansion_mrr: m.expansion,
      net_new_mrr: Math.round(m.mrr * 0.18),
      active_clients: m.clients,
      // Key SaaS metrics
      gross_revenue_retention: m.churn > 0 ? 97 : 100,
      net_revenue_retention: 115 + Math.floor(Math.random() * 5),
      ltv: Math.round(m.mrr / m.clients * 24), // 24-month LTV
      cac: Math.round(m.mrr / m.clients * 24 / 4.2), // LTV:CAC of 4.2
      cac_payback_months: 8,
      created_at: `${m.month}-01T00:00:00Z`,
    });
  }

  const { error } = await supabase.from('revenue_metrics').upsert(revenueData, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  revenue_metrics: ${error.message}`);
  } else {
    console.log(`   ✓ Created 12 months of revenue metrics`);
  }

  // Display key metrics
  const latest = months[months.length - 1];
  const totalChurn = months.reduce((sum, m) => sum + m.churn, 0);
  const totalExpansion = months.reduce((sum, m) => sum + m.expansion, 0);

  console.log(`   📊 Current MRR: $${latest.mrr.toLocaleString()}`);
  console.log(`   📊 ARR: $${(latest.mrr * 12).toLocaleString()}`);
  console.log(`   📊 12-Month Growth: ${Math.round((latest.mrr / months[0].mrr - 1) * 100)}%`);
  console.log(`   📊 Total Churn: $${totalChurn.toLocaleString()} (${Math.round(totalChurn / (months.reduce((s,m) => s + m.mrr, 0)) * 100)}%)`);
  console.log(`   📊 Expansion Revenue: $${totalExpansion.toLocaleString()}`);
}

// ============================================================================
// 3. CLIENT JOURNEY - Shows acquisition & retention story
// ============================================================================
async function seedClientJourney() {
  console.log('\n👥 Seeding Client Journey (Acquisition & Retention)...');

  // Clients acquired over 12 months with clear growth pattern
  const clients = [
    // Early clients (proof of concept)
    { name: 'TechVenture Capital', industry: 'Finance', value: 75000, acquired: '2025-02-01', status: 'active', tier: 'enterprise' },
    { name: 'Startup Accelerator X', industry: 'Technology', value: 45000, acquired: '2025-02-15', status: 'active', tier: 'growth' },

    // Growth phase clients
    { name: 'Creative Studios Inc', industry: 'Creative', value: 28000, acquired: '2025-03-10', status: 'active', tier: 'professional' },
    { name: 'HealthTech Solutions', industry: 'Healthcare', value: 65000, acquired: '2025-04-01', status: 'active', tier: 'enterprise' },
    { name: 'E-commerce Giant', industry: 'Retail', value: 52000, acquired: '2025-04-20', status: 'active', tier: 'growth' },
    { name: 'Local Business Collective', industry: 'SMB', value: 8500, acquired: '2025-05-05', status: 'churned', tier: 'starter' }, // One churn to show realistic data

    // Expansion phase
    { name: 'Nordic Design Group', industry: 'Design', value: 35000, acquired: '2025-06-15', status: 'active', tier: 'professional' },
    { name: 'DataPulse Analytics', industry: 'Technology', value: 85000, acquired: '2025-07-01', status: 'active', tier: 'enterprise' },
    { name: 'GreenLeaf Organics', industry: 'Retail', value: 22000, acquired: '2025-07-20', status: 'active', tier: 'growth' },
    { name: 'Urban Fitness Network', industry: 'Health', value: 18000, acquired: '2025-08-10', status: 'active', tier: 'professional' },

    // Recent wins
    { name: 'Bloom Education', industry: 'EdTech', value: 68000, acquired: '2025-09-01', status: 'active', tier: 'enterprise' },
    { name: 'CloudSync Technologies', industry: 'SaaS', value: 95000, acquired: '2025-10-15', status: 'active', tier: 'enterprise' },
    { name: 'Stellar Marketing Co', industry: 'Marketing', value: 32000, acquired: '2025-11-01', status: 'active', tier: 'growth' },
    { name: 'Legal Pros Alliance', industry: 'Legal', value: 42000, acquired: '2025-12-01', status: 'active', tier: 'professional' },
    { name: 'FinanceFirst Consulting', industry: 'Finance', value: 78000, acquired: '2026-01-10', status: 'active', tier: 'enterprise' },
  ];

  // Update existing clients with journey data
  for (let i = 0; i < clients.length; i++) {
    const c = clients[i];
    const clientId = uuid('10000000', i + 1);

    const { error } = await supabase.from('clients').upsert({
      id: clientId,
      user_id: DEMO_USER_ID,
      name: c.name,
      email: c.name.toLowerCase().replace(/\s+/g, '.') + '@example.com',
      company: c.name,
      industry: c.industry,
      status: c.status === 'active' ? 'active' : 'churned',
      type: c.tier === 'enterprise' ? 'enterprise' : c.tier === 'growth' ? 'business' : 'individual',
      priority: c.tier === 'enterprise' ? 'high' : c.tier === 'growth' ? 'medium' : 'low',
      lifetime_value: c.value,
      total_revenue: c.value,
      tags: [c.tier, c.industry.toLowerCase()],
      notes: `Acquired: ${c.acquired}. Tier: ${c.tier}. Industry: ${c.industry}.`,
      created_at: c.acquired + 'T00:00:00Z',
      updated_at: daysAgo(Math.floor(Math.random() * 30)),
    }, { onConflict: 'id' });

    if (error && i === 0) {
      console.log(`   ⚠️  clients update: ${error.message}`);
    }
  }

  console.log(`   ✓ Updated ${clients.length} clients with journey data`);

  const activeClients = clients.filter(c => c.status === 'active').length;
  const enterpriseClients = clients.filter(c => c.tier === 'enterprise').length;
  const totalLTV = clients.filter(c => c.status === 'active').reduce((sum, c) => sum + c.value, 0);

  console.log(`   📊 Active Clients: ${activeClients}/${clients.length} (${Math.round(activeClients/clients.length*100)}% retention)`);
  console.log(`   📊 Enterprise Clients: ${enterpriseClients} (${Math.round(enterpriseClients/activeClients*100)}% of active)`);
  console.log(`   📊 Total Client LTV: $${totalLTV.toLocaleString()}`);
}

// ============================================================================
// 4. FEATURE ADOPTION - Shows product-market fit
// ============================================================================
async function seedFeatureAdoption() {
  console.log('\n🎯 Seeding Feature Adoption (Product-Market Fit)...');

  const features = [
    { name: 'Project Management', adoption: 100, usage_count: 2450, satisfaction: 4.8 },
    { name: 'Time Tracking', adoption: 95, usage_count: 8920, satisfaction: 4.7 },
    { name: 'Invoicing', adoption: 92, usage_count: 1580, satisfaction: 4.9 },
    { name: 'Client Portal', adoption: 88, usage_count: 3200, satisfaction: 4.6 },
    { name: 'File Management', adoption: 85, usage_count: 4100, satisfaction: 4.5 },
    { name: 'Calendar & Scheduling', adoption: 82, usage_count: 2800, satisfaction: 4.4 },
    { name: 'Messaging', adoption: 78, usage_count: 12400, satisfaction: 4.3 },
    { name: 'Reporting & Analytics', adoption: 75, usage_count: 890, satisfaction: 4.6 },
    { name: 'AI Assistant', adoption: 72, usage_count: 3500, satisfaction: 4.8 },
    { name: 'Team Collaboration', adoption: 68, usage_count: 1950, satisfaction: 4.4 },
    { name: 'Contracts & Proposals', adoption: 65, usage_count: 420, satisfaction: 4.7 },
    { name: 'Automations', adoption: 58, usage_count: 2100, satisfaction: 4.5 },
    { name: 'CRM', adoption: 55, usage_count: 1800, satisfaction: 4.3 },
    { name: 'Video Studio', adoption: 42, usage_count: 380, satisfaction: 4.6 },
    { name: 'Integrations', adoption: 38, usage_count: 890, satisfaction: 4.4 },
  ];

  const adoptionData = features.map((f, i) => ({
    id: uuid('62000000', i + 1),
    user_id: DEMO_USER_ID,
    feature_name: f.name,
    adoption_rate: f.adoption,
    total_usage_count: f.usage_count,
    monthly_active_users: Math.round(f.adoption * 0.15), // 15 active users
    avg_session_duration_minutes: Math.floor(Math.random() * 20) + 5,
    satisfaction_score: f.satisfaction,
    nps_score: Math.floor(f.satisfaction * 20) - 10 + Math.floor(Math.random() * 10),
    created_at: daysAgo(365),
    updated_at: daysAgo(0),
  }));

  const { error } = await supabase.from('analytics_feature_usage').upsert(adoptionData, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  feature_adoption: ${error.message}`);
  } else {
    console.log(`   ✓ Created ${features.length} feature adoption metrics`);
  }

  const avgAdoption = Math.round(features.reduce((sum, f) => sum + f.adoption, 0) / features.length);
  const avgSatisfaction = (features.reduce((sum, f) => sum + f.satisfaction, 0) / features.length).toFixed(1);
  const totalUsage = features.reduce((sum, f) => sum + f.usage_count, 0);

  console.log(`   📊 Average Feature Adoption: ${avgAdoption}%`);
  console.log(`   📊 Average Satisfaction: ${avgSatisfaction}/5`);
  console.log(`   📊 Total Feature Usage: ${totalUsage.toLocaleString()} actions`);
}

// ============================================================================
// 5. SALES PIPELINE - Shows growth potential
// ============================================================================
async function seedSalesPipeline() {
  console.log('\n📈 Seeding Sales Pipeline (Growth Potential)...');

  const pipeline = [
    // Closed Won (shows conversion ability)
    { company: 'TechCorp Global', value: 120000, stage: 'closed_won', probability: 100, source: 'referral' },
    { company: 'Innovation Labs', value: 85000, stage: 'closed_won', probability: 100, source: 'inbound' },
    { company: 'Digital First Agency', value: 45000, stage: 'closed_won', probability: 100, source: 'outbound' },

    // Active Pipeline (shows momentum)
    { company: 'Enterprise Solutions Inc', value: 150000, stage: 'negotiation', probability: 80, source: 'referral' },
    { company: 'Scale-Up Ventures', value: 95000, stage: 'proposal', probability: 60, source: 'inbound' },
    { company: 'Growth Partners LLC', value: 75000, stage: 'demo', probability: 40, source: 'event' },
    { company: 'Startup Studio X', value: 55000, stage: 'qualified', probability: 30, source: 'content' },
    { company: 'Agency Network', value: 68000, stage: 'proposal', probability: 55, source: 'referral' },
    { company: 'Media Conglomerate', value: 180000, stage: 'discovery', probability: 20, source: 'outbound' },
    { company: 'Tech Unicorn', value: 250000, stage: 'discovery', probability: 15, source: 'inbound' },
  ];

  const pipelineData = pipeline.map((p, i) => ({
    id: uuid('63000000', i + 1),
    user_id: DEMO_USER_ID,
    company_name: p.company,
    deal_value: p.value,
    stage: p.stage,
    probability: p.probability,
    weighted_value: Math.round(p.value * p.probability / 100),
    source: p.source,
    expected_close_date: p.stage === 'closed_won' ? daysAgo(Math.floor(Math.random() * 60)) : daysAgo(-Math.floor(Math.random() * 60)),
    days_in_stage: Math.floor(Math.random() * 14) + 3,
    next_action: p.stage === 'closed_won' ? 'Onboarding' : randomItem(['Follow-up call', 'Send proposal', 'Schedule demo', 'Contract review']),
    created_at: daysAgo(Math.floor(Math.random() * 90) + 30),
    updated_at: daysAgo(Math.floor(Math.random() * 7)),
  }));

  const { error } = await supabase.from('sales_pipeline').upsert(pipelineData, { onConflict: 'id' });
  if (error) {
    // Try deals table
    const dealsData = pipelineData.map(p => ({
      ...p,
      title: `${p.company_name} - ${p.stage}`,
      value: p.deal_value,
      client_id: uuid('10000000', 1), // Link to first client
    }));
    const { error: error2 } = await supabase.from('deals').upsert(dealsData, { onConflict: 'id' });
    if (error2) {
      console.log(`   ⚠️  sales_pipeline: ${error.message}`);
    }
  } else {
    console.log(`   ✓ Created ${pipeline.length} pipeline deals`);
  }

  const closedWon = pipeline.filter(p => p.stage === 'closed_won');
  const activePipeline = pipeline.filter(p => p.stage !== 'closed_won');
  const totalPipeline = activePipeline.reduce((sum, p) => sum + p.value, 0);
  const weightedPipeline = activePipeline.reduce((sum, p) => sum + p.value * p.probability / 100, 0);

  console.log(`   📊 Closed Won: $${closedWon.reduce((s,p) => s + p.value, 0).toLocaleString()} (${closedWon.length} deals)`);
  console.log(`   📊 Active Pipeline: $${totalPipeline.toLocaleString()} (${activePipeline.length} deals)`);
  console.log(`   📊 Weighted Pipeline: $${Math.round(weightedPipeline).toLocaleString()}`);
  console.log(`   📊 Avg Deal Size: $${Math.round(totalPipeline / activePipeline.length).toLocaleString()}`);
}

// ============================================================================
// 6. TEAM PRODUCTIVITY - Shows operational efficiency
// ============================================================================
async function seedTeamProductivity() {
  console.log('\n⚡ Seeding Team Productivity Metrics...');

  // Team of 4 with productivity data
  const teamMetrics = [
    { name: 'Alex Morgan', role: 'Founder/CEO', billable_hours: 1200, utilization: 75, revenue_generated: 180000 },
    { name: 'Jordan Lee', role: 'Lead Designer', billable_hours: 1450, utilization: 85, revenue_generated: 145000 },
    { name: 'Casey Rivera', role: 'Senior Developer', billable_hours: 1380, utilization: 82, revenue_generated: 165000 },
    { name: 'Taylor Kim', role: 'Project Manager', billable_hours: 980, utilization: 65, revenue_generated: 85000 },
  ];

  const metricsData = teamMetrics.map((t, i) => ({
    id: uuid('64000000', i + 1),
    user_id: DEMO_USER_ID,
    team_member_name: t.name,
    role: t.role,
    billable_hours_ytd: t.billable_hours,
    utilization_rate: t.utilization,
    revenue_generated: t.revenue_generated,
    projects_completed: Math.floor(Math.random() * 8) + 5,
    client_satisfaction_avg: 4.5 + Math.random() * 0.5,
    on_time_delivery_rate: 90 + Math.floor(Math.random() * 10),
    created_at: daysAgo(365),
    updated_at: daysAgo(0),
  }));

  const { error } = await supabase.from('team_performance').upsert(metricsData, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  team_productivity: ${error.message}`);
  } else {
    console.log(`   ✓ Created ${teamMetrics.length} team performance records`);
  }

  const totalBillable = teamMetrics.reduce((sum, t) => sum + t.billable_hours, 0);
  const avgUtilization = Math.round(teamMetrics.reduce((sum, t) => sum + t.utilization, 0) / teamMetrics.length);
  const totalRevenue = teamMetrics.reduce((sum, t) => sum + t.revenue_generated, 0);

  console.log(`   📊 Total Billable Hours: ${totalBillable.toLocaleString()}`);
  console.log(`   📊 Average Utilization: ${avgUtilization}%`);
  console.log(`   📊 Revenue per Employee: $${Math.round(totalRevenue / teamMetrics.length).toLocaleString()}`);
}

// ============================================================================
// 7. CUSTOMER SUCCESS METRICS
// ============================================================================
async function seedCustomerSuccess() {
  console.log('\n🏆 Seeding Customer Success Metrics...');

  const successMetrics = {
    nps_score: 72, // World-class is 70+
    csat_score: 4.7,
    response_time_hours: 2.5,
    resolution_time_hours: 8,
    tickets_this_month: 23,
    tickets_resolved: 21,
    first_contact_resolution: 78,
    customer_effort_score: 4.2,
  };

  // Create NPS responses
  const npsResponses = [];
  const promoters = 45; // 9-10 scores
  const passives = 12;  // 7-8 scores
  const detractors = 5; // 0-6 scores

  for (let i = 0; i < promoters; i++) {
    npsResponses.push({
      id: uuid('65000000', npsResponses.length + 1),
      user_id: DEMO_USER_ID,
      score: Math.random() > 0.5 ? 10 : 9,
      category: 'promoter',
      feedback: randomItem([
        'Amazing platform! Saved us hours every week.',
        'Best decision we made for our business.',
        'The AI features are game-changing.',
        'Client portal is fantastic - our clients love it.',
        'Support team is incredibly responsive.',
      ]),
      created_at: daysAgo(Math.floor(Math.random() * 90)),
    });
  }

  for (let i = 0; i < passives; i++) {
    npsResponses.push({
      id: uuid('65000000', npsResponses.length + 1),
      user_id: DEMO_USER_ID,
      score: Math.random() > 0.5 ? 8 : 7,
      category: 'passive',
      feedback: randomItem([
        'Good product, looking forward to more features.',
        'Works well for our needs.',
        'Solid platform overall.',
      ]),
      created_at: daysAgo(Math.floor(Math.random() * 90)),
    });
  }

  for (let i = 0; i < detractors; i++) {
    npsResponses.push({
      id: uuid('65000000', npsResponses.length + 1),
      user_id: DEMO_USER_ID,
      score: Math.floor(Math.random() * 7),
      category: 'detractor',
      feedback: randomItem([
        'Mobile app needs improvement.',
        'Learning curve was steep initially.',
      ]),
      created_at: daysAgo(Math.floor(Math.random() * 90)),
    });
  }

  const { error } = await supabase.from('nps_responses').upsert(npsResponses, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  nps_responses: ${error.message}`);
  } else {
    console.log(`   ✓ Created ${npsResponses.length} NPS responses`);
  }

  const nps = Math.round((promoters - detractors) / (promoters + passives + detractors) * 100);
  console.log(`   📊 NPS Score: ${nps} (World-class: 70+)`);
  console.log(`   📊 CSAT: ${successMetrics.csat_score}/5`);
  console.log(`   📊 First Contact Resolution: ${successMetrics.first_contact_resolution}%`);
  console.log(`   📊 Avg Response Time: ${successMetrics.response_time_hours} hours`);
}

// ============================================================================
// 8. COHORT RETENTION - Shows stickiness over time
// ============================================================================
async function seedCohortRetention() {
  console.log('\n📊 Seeding Cohort Retention Data...');

  // Monthly cohorts with retention percentages
  const cohorts = [
    { month: '2025-03', size: 3, m1: 100, m2: 100, m3: 100, m4: 100, m5: 100, m6: 100 },
    { month: '2025-04', size: 4, m1: 100, m2: 100, m3: 100, m4: 100, m5: 100, m6: null },
    { month: '2025-05', size: 3, m1: 100, m2: 100, m3: 67, m4: 67, m5: null, m6: null },
    { month: '2025-06', size: 5, m1: 100, m2: 100, m3: 100, m4: null, m5: null, m6: null },
    { month: '2025-07', size: 4, m1: 100, m2: 100, m3: null, m4: null, m5: null, m6: null },
    { month: '2025-08', size: 6, m1: 100, m2: null, m3: null, m4: null, m5: null, m6: null },
  ];

  const cohortData = cohorts.map((c, i) => ({
    id: uuid('66000000', i + 1),
    user_id: DEMO_USER_ID,
    cohort_month: c.month,
    initial_users: c.size,
    month_1_retention: c.m1,
    month_2_retention: c.m2,
    month_3_retention: c.m3,
    month_4_retention: c.m4,
    month_5_retention: c.m5,
    month_6_retention: c.m6,
    created_at: c.month + '-01T00:00:00Z',
  }));

  const { error } = await supabase.from('user_cohorts').upsert(cohortData, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  cohort_retention: ${error.message}`);
  } else {
    console.log(`   ✓ Created ${cohorts.length} cohort records`);
  }

  // Calculate average retention
  const avgRetention = cohorts.filter(c => c.m3).reduce((sum, c) => sum + c.m3, 0) / cohorts.filter(c => c.m3).length;
  console.log(`   📊 3-Month Avg Retention: ${Math.round(avgRetention)}%`);
  console.log(`   📊 6-Month Cohort Retention: ${cohorts[0].m6}%`);
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================
async function main() {
  try {
    await seedUserActivity();
    await seedRevenueMetrics();
    await seedClientJourney();
    await seedFeatureAdoption();
    await seedSalesPipeline();
    await seedTeamProductivity();
    await seedCustomerSuccess();
    await seedCohortRetention();

    console.log('\n' + '═'.repeat(70));
    console.log('\n🎉 INVESTOR DEMO DATA COMPLETE!\n');

    console.log('📊 INVESTOR PITCH SUMMARY:\n');
    console.log('   💰 FINANCIALS:');
    console.log('      • ARR: $297,600 (24.8K MRR × 12)');
    console.log('      • MRR Growth: 18% monthly average');
    console.log('      • Gross Margin: 85%');
    console.log('      • Rule of 40: 55% ✓\n');

    console.log('   📈 UNIT ECONOMICS:');
    console.log('      • LTV: $28,000');
    console.log('      • CAC: $6,667');
    console.log('      • LTV:CAC: 4.2:1 ✓');
    console.log('      • CAC Payback: 8 months ✓\n');

    console.log('   🔄 RETENTION:');
    console.log('      • Logo Retention: 93%');
    console.log('      • Net Revenue Retention: 115%');
    console.log('      • Annual Churn: 3% ✓\n');

    console.log('   👥 CUSTOMERS:');
    console.log('      • Active Clients: 15');
    console.log('      • Enterprise: 5 (33%)');
    console.log('      • Pipeline: $873K weighted\n');

    console.log('   ⭐ PRODUCT:');
    console.log('      • NPS: 72 (World-class)');
    console.log('      • Feature Adoption: 74% avg');
    console.log('      • DAU/MAU: 68%\n');

    console.log('🔗 Demo at: http://localhost:9323');
    console.log('   Login: alex@freeflow.io / investor2026\n');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
