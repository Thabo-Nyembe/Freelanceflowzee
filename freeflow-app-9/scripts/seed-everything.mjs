#!/usr/bin/env node
/**
 * SEED EVERYTHING - All Features for Investor Demo
 * Covers: My Day, Crypto, Escrow, Dashboard, Projects, Collaborations, and MORE
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
const hoursAgo = (hours) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

console.log('🚀 SEEDING EVERYTHING FOR INVESTOR DEMO\n');
console.log('═'.repeat(70));

// Helper to try inserting data and handle errors gracefully
async function seedTable(tableName, data, label) {
  const { error } = await supabase.from(tableName).upsert(data, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  ${label}: ${error.message.slice(0, 60)}...`);
    return false;
  }
  console.log(`   ✓ ${label}: ${data.length} records`);
  return true;
}

// ============================================================================
// 1. MY DAY / FOCUS SESSIONS
// ============================================================================
async function seedMyDay() {
  console.log('\n📅 Seeding My Day / Focus Sessions...');

  // Daily goals
  const goals = [];
  for (let day = 0; day < 30; day++) {
    const date = new Date(Date.now() - day * 24 * 60 * 60 * 1000);
    goals.push({
      id: uuid('A0000000', day + 1),
      user_id: DEMO_USER_ID,
      date: date.toISOString().slice(0, 10),
      goals: [
        { text: 'Complete client deliverables', completed: Math.random() > 0.2 },
        { text: 'Review team PRs', completed: Math.random() > 0.3 },
        { text: 'Update project timeline', completed: Math.random() > 0.4 },
        { text: 'Send weekly report', completed: day % 7 === 0 },
      ],
      notes: 'Focus on high-priority tasks',
      mood: randomItem(['great', 'good', 'okay', 'focused']),
      energy_level: randomBetween(6, 10),
      created_at: date.toISOString(),
    });
  }
  await seedTable('daily_goals', goals, 'Daily Goals');

  // Focus sessions (Pomodoro-style)
  const sessions = [];
  for (let i = 0; i < 100; i++) {
    const duration = randomItem([25, 25, 25, 50, 90]); // Pomodoro style
    sessions.push({
      id: uuid('A1000000', i + 1),
      user_id: DEMO_USER_ID,
      title: randomItem(['Deep Work', 'Code Review', 'Design', 'Planning', 'Writing', 'Research']),
      duration_minutes: duration,
      completed: Math.random() > 0.1,
      interruptions: randomBetween(0, 3),
      notes: 'Focused work session',
      started_at: hoursAgo(randomBetween(1, 720)),
      ended_at: hoursAgo(randomBetween(0, 719)),
      created_at: daysAgo(randomBetween(0, 30)),
    });
  }
  await seedTable('focus_sessions', sessions, 'Focus Sessions');
}

// ============================================================================
// 2. ESCROW SYSTEM
// ============================================================================
async function seedEscrow() {
  console.log('\n🔒 Seeding Escrow System...');

  const escrowTransactions = [
    { title: 'TechStartup Mobile App - Phase 1', amount: 25000, status: 'released', client: 'TechVenture Capital' },
    { title: 'E-commerce Platform Milestone 1', amount: 35000, status: 'released', client: 'CloudSync Technologies' },
    { title: 'Healthcare Dashboard - Design', amount: 15000, status: 'released', client: 'HealthTech Solutions' },
    { title: 'API Integration Project', amount: 18000, status: 'funded', client: 'DataPulse Analytics' },
    { title: 'Brand Identity Package', amount: 12000, status: 'funded', client: 'Nordic Design Group' },
    { title: 'Mobile App Phase 2', amount: 30000, status: 'pending', client: 'TechVenture Capital' },
    { title: 'SaaS Dashboard - Development', amount: 45000, status: 'in_progress', client: 'Bloom Education' },
    { title: 'Website Redesign', amount: 22000, status: 'disputed', client: 'Urban Fitness Network' },
  ];

  const escrowData = escrowTransactions.map((e, i) => ({
    id: uuid('A2000000', i + 1),
    user_id: DEMO_USER_ID,
    title: e.title,
    description: `Escrow for ${e.title}`,
    amount: e.amount,
    currency: 'USD',
    status: e.status,
    client_name: e.client,
    client_email: e.client.toLowerCase().replace(/\s+/g, '.') + '@example.com',
    release_conditions: 'Upon successful delivery and client approval',
    funded_at: ['funded', 'released', 'in_progress'].includes(e.status) ? daysAgo(randomBetween(10, 60)) : null,
    released_at: e.status === 'released' ? daysAgo(randomBetween(1, 30)) : null,
    created_at: daysAgo(randomBetween(30, 120)),
    updated_at: daysAgo(randomBetween(0, 14)),
  }));

  await seedTable('escrow', escrowData, 'Escrow Transactions');

  // Escrow milestones
  const milestones = [];
  for (const e of escrowData.slice(0, 5)) {
    for (let m = 1; m <= 3; m++) {
      milestones.push({
        id: uuid('A3000000', milestones.length + 1),
        escrow_id: e.id,
        user_id: DEMO_USER_ID,
        title: `Milestone ${m}: ${randomItem(['Design', 'Development', 'Testing', 'Delivery'])}`,
        amount: Math.round(e.amount / 3),
        status: m === 1 ? 'completed' : m === 2 ? 'in_progress' : 'pending',
        due_date: daysAgo(-m * 14),
        completed_at: m === 1 ? daysAgo(randomBetween(1, 14)) : null,
        created_at: e.created_at,
      });
    }
  }
  await seedTable('escrow_milestones', milestones, 'Escrow Milestones');
}

// ============================================================================
// 3. CRYPTO PAYMENTS
// ============================================================================
async function seedCrypto() {
  console.log('\n₿ Seeding Crypto Payments...');

  // Crypto wallets
  const wallets = [
    { name: 'Business Bitcoin', currency: 'BTC', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', balance: 0.85 },
    { name: 'Ethereum Wallet', currency: 'ETH', address: '0x742d35Cc6634C0532925a3b844Bc9e7595f8fE', balance: 12.5 },
    { name: 'USDC Treasury', currency: 'USDC', address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd5807', balance: 25000 },
    { name: 'Solana Wallet', currency: 'SOL', address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', balance: 150 },
  ];

  const walletData = wallets.map((w, i) => ({
    id: uuid('A4000000', i + 1),
    user_id: DEMO_USER_ID,
    name: w.name,
    currency: w.currency,
    address: w.address,
    balance: w.balance,
    is_primary: i === 2, // USDC is primary
    created_at: daysAgo(randomBetween(60, 180)),
    updated_at: daysAgo(randomBetween(0, 7)),
  }));

  await seedTable('crypto_wallets', walletData, 'Crypto Wallets');

  // Crypto transactions
  const transactions = [
    { type: 'received', amount: 5000, currency: 'USDC', from: 'TechVenture Capital', status: 'confirmed' },
    { type: 'received', amount: 0.25, currency: 'BTC', from: 'International Client', status: 'confirmed' },
    { type: 'received', amount: 3.5, currency: 'ETH', from: 'DeFi Project', status: 'confirmed' },
    { type: 'sent', amount: 1500, currency: 'USDC', from: 'Contractor Payment', status: 'confirmed' },
    { type: 'received', amount: 8500, currency: 'USDC', from: 'CloudSync Technologies', status: 'confirmed' },
    { type: 'received', amount: 0.15, currency: 'BTC', from: 'Anonymous Tip', status: 'confirmed' },
    { type: 'sent', amount: 500, currency: 'USDC', from: 'Software Subscription', status: 'confirmed' },
    { type: 'received', amount: 12000, currency: 'USDC', from: 'Milestone Payment', status: 'pending' },
  ];

  const txData = transactions.map((t, i) => ({
    id: uuid('A5000000', i + 1),
    user_id: DEMO_USER_ID,
    type: t.type,
    amount: t.amount,
    currency: t.currency,
    description: t.from,
    status: t.status,
    tx_hash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
    confirmations: t.status === 'confirmed' ? randomBetween(10, 100) : 0,
    created_at: daysAgo(randomBetween(1, 90)),
  }));

  await seedTable('crypto_transactions', txData, 'Crypto Transactions');
}

// ============================================================================
// 4. COLLABORATION FEATURES
// ============================================================================
async function seedCollaboration() {
  console.log('\n👥 Seeding Collaboration Features...');

  // Collaboration sessions
  const sessions = [
    { title: 'Design Review - Homepage', type: 'design_review', participants: 4 },
    { title: 'Code Pairing - API Development', type: 'pair_programming', participants: 2 },
    { title: 'Sprint Planning', type: 'meeting', participants: 5 },
    { title: 'Client Presentation', type: 'presentation', participants: 6 },
    { title: 'Whiteboard Session - Architecture', type: 'whiteboard', participants: 3 },
    { title: 'Bug Bash', type: 'testing', participants: 4 },
    { title: 'Retrospective', type: 'meeting', participants: 5 },
    { title: 'Brainstorming - New Features', type: 'brainstorm', participants: 6 },
  ];

  const sessionData = sessions.map((s, i) => ({
    id: uuid('A6000000', i + 1),
    user_id: DEMO_USER_ID,
    title: s.title,
    type: s.type,
    status: i < 5 ? 'completed' : i < 7 ? 'in_progress' : 'scheduled',
    participant_count: s.participants,
    duration_minutes: randomBetween(30, 120),
    recording_url: i < 3 ? `https://recordings.example.com/session-${i + 1}` : null,
    notes: `Collaboration session: ${s.title}`,
    started_at: i < 7 ? hoursAgo(randomBetween(24, 720)) : hoursAgo(-randomBetween(24, 168)),
    ended_at: i < 5 ? hoursAgo(randomBetween(1, 700)) : null,
    created_at: daysAgo(randomBetween(1, 60)),
  }));

  await seedTable('collaboration_sessions', sessionData, 'Collaboration Sessions');

  // Team shares / shared items
  const shares = [];
  for (let i = 0; i < 20; i++) {
    shares.push({
      id: uuid('A7000000', i + 1),
      user_id: DEMO_USER_ID,
      resource_type: randomItem(['file', 'project', 'task', 'document', 'design']),
      resource_id: uuid('00000000', randomBetween(1, 50)),
      shared_with_email: `team${i}@freeflow.io`,
      permission: randomItem(['view', 'edit', 'comment']),
      expires_at: Math.random() > 0.7 ? daysAgo(-randomBetween(7, 30)) : null,
      created_at: daysAgo(randomBetween(1, 60)),
    });
  }
  await seedTable('team_shares', shares, 'Team Shares');
}

// ============================================================================
// 5. DASHBOARD WIDGETS & ANALYTICS
// ============================================================================
async function seedDashboard() {
  console.log('\n📊 Seeding Dashboard & Analytics...');

  // Dashboard widgets configuration
  const widgets = [
    { type: 'revenue_chart', title: 'Revenue Overview', position: 0, size: 'large' },
    { type: 'active_projects', title: 'Active Projects', position: 1, size: 'medium' },
    { type: 'recent_invoices', title: 'Recent Invoices', position: 2, size: 'medium' },
    { type: 'time_tracking', title: 'Time This Week', position: 3, size: 'small' },
    { type: 'upcoming_meetings', title: 'Upcoming Meetings', position: 4, size: 'small' },
    { type: 'task_progress', title: 'Task Progress', position: 5, size: 'medium' },
    { type: 'client_activity', title: 'Client Activity', position: 6, size: 'medium' },
    { type: 'team_performance', title: 'Team Performance', position: 7, size: 'large' },
    { type: 'notifications', title: 'Recent Notifications', position: 8, size: 'small' },
    { type: 'quick_actions', title: 'Quick Actions', position: 9, size: 'small' },
  ];

  const widgetData = widgets.map((w, i) => ({
    id: uuid('A8000000', i + 1),
    user_id: DEMO_USER_ID,
    widget_type: w.type,
    title: w.title,
    position: w.position,
    size: w.size,
    is_visible: true,
    settings: { refreshInterval: 300 },
    created_at: daysAgo(90),
    updated_at: daysAgo(randomBetween(0, 7)),
  }));

  await seedTable('dashboard_widgets', widgetData, 'Dashboard Widgets');

  // Analytics events
  const events = [];
  for (let day = 0; day < 90; day++) {
    const eventsPerDay = randomBetween(20, 50);
    for (let i = 0; i < eventsPerDay; i++) {
      events.push({
        id: uuid('A9000000', events.length + 1),
        user_id: DEMO_USER_ID,
        event_name: randomItem([
          'page_view', 'feature_used', 'invoice_created', 'project_updated',
          'time_logged', 'file_uploaded', 'message_sent', 'task_completed',
          'client_added', 'payment_received', 'report_generated', 'ai_used'
        ]),
        event_category: randomItem(['engagement', 'conversion', 'productivity', 'revenue']),
        properties: { source: 'web', version: '2.0' },
        created_at: daysAgo(day),
      });
    }
  }
  await seedTable('analytics_events', events.slice(0, 500), 'Analytics Events');
}

// ============================================================================
// 6. PROJECT DETAILS (Milestones, Comments, Activity)
// ============================================================================
async function seedProjectDetails() {
  console.log('\n📁 Seeding Project Details...');

  // Project milestones
  const milestones = [];
  const projectIds = Array.from({ length: 8 }, (_, i) => uuid('70000000', i + 1));

  for (const projectId of projectIds) {
    for (let m = 1; m <= 4; m++) {
      milestones.push({
        id: uuid('B0000000', milestones.length + 1),
        project_id: projectId,
        user_id: DEMO_USER_ID,
        title: `Phase ${m}: ${randomItem(['Discovery', 'Design', 'Development', 'Testing', 'Launch'])}`,
        description: `Milestone ${m} deliverables`,
        due_date: daysAgo(-m * 14 + randomBetween(-7, 7)),
        status: m <= 2 ? 'completed' : m === 3 ? 'in_progress' : 'pending',
        completed_at: m <= 2 ? daysAgo(randomBetween(1, 30)) : null,
        created_at: daysAgo(60),
      });
    }
  }
  await seedTable('project_milestones', milestones, 'Project Milestones');

  // Comments on projects/tasks
  const comments = [];
  for (let i = 0; i < 50; i++) {
    comments.push({
      id: uuid('B1000000', i + 1),
      user_id: DEMO_USER_ID,
      resource_type: randomItem(['project', 'task', 'file', 'invoice']),
      resource_id: uuid('70000000', randomBetween(1, 8)),
      content: randomItem([
        'Great progress on this!',
        'Can we discuss this in our next meeting?',
        'Updated the designs based on feedback.',
        'Ready for review.',
        'Nice work team! 🎉',
        'Need more details on this requirement.',
        'Approved. Moving forward.',
        'Let me know if you need any clarification.',
      ]),
      created_at: hoursAgo(randomBetween(1, 720)),
      updated_at: hoursAgo(randomBetween(0, 720)),
    });
  }
  await seedTable('comments', comments, 'Comments');

  // Project activity log
  const activities = [];
  for (let i = 0; i < 100; i++) {
    activities.push({
      id: uuid('B2000000', i + 1),
      project_id: uuid('70000000', randomBetween(1, 8)),
      user_id: DEMO_USER_ID,
      action: randomItem([
        'created_task', 'completed_task', 'uploaded_file', 'added_comment',
        'updated_status', 'assigned_member', 'created_milestone', 'sent_invoice',
        'received_payment', 'scheduled_meeting', 'shared_document'
      ]),
      description: 'Activity on project',
      metadata: {},
      created_at: hoursAgo(randomBetween(1, 720)),
    });
  }
  await seedTable('project_activity', activities, 'Project Activity');
}

// ============================================================================
// 7. REPORTS & ANALYTICS
// ============================================================================
async function seedReports() {
  console.log('\n📈 Seeding Reports...');

  const reports = [
    { title: 'Q4 2025 Revenue Report', type: 'revenue', period: 'quarterly' },
    { title: 'Monthly Client Report - January', type: 'client', period: 'monthly' },
    { title: 'Project Profitability Analysis', type: 'profitability', period: 'custom' },
    { title: 'Team Utilization Report', type: 'utilization', period: 'monthly' },
    { title: 'Invoice Aging Report', type: 'invoice', period: 'monthly' },
    { title: 'Time Tracking Summary', type: 'time', period: 'weekly' },
    { title: 'Expense Report - Q4', type: 'expense', period: 'quarterly' },
    { title: 'Annual Business Review 2025', type: 'annual', period: 'yearly' },
  ];

  const reportData = reports.map((r, i) => ({
    id: uuid('B3000000', i + 1),
    user_id: DEMO_USER_ID,
    title: r.title,
    type: r.type,
    period: r.period,
    status: 'generated',
    data: { summary: 'Report data here' },
    generated_at: daysAgo(randomBetween(1, 30)),
    created_at: daysAgo(randomBetween(30, 90)),
  }));

  await seedTable('reports', reportData, 'Reports');
}

// ============================================================================
// 8. TEMPLATES (Project, Invoice, Contract)
// ============================================================================
async function seedTemplates() {
  console.log('\n📋 Seeding Templates...');

  // Project templates
  const projectTemplates = [
    { name: 'Web Application', category: 'development', tasks: 25 },
    { name: 'Mobile App', category: 'development', tasks: 30 },
    { name: 'Brand Identity', category: 'design', tasks: 15 },
    { name: 'Website Redesign', category: 'design', tasks: 20 },
    { name: 'API Integration', category: 'development', tasks: 12 },
    { name: 'Marketing Campaign', category: 'marketing', tasks: 18 },
  ];

  const ptData = projectTemplates.map((t, i) => ({
    id: uuid('B4000000', i + 1),
    user_id: DEMO_USER_ID,
    name: t.name,
    description: `Template for ${t.name} projects`,
    category: t.category,
    estimated_tasks: t.tasks,
    estimated_duration_days: t.tasks * 2,
    is_public: false,
    usage_count: randomBetween(5, 20),
    created_at: daysAgo(randomBetween(60, 180)),
  }));

  await seedTable('project_templates', ptData, 'Project Templates');

  // Invoice templates
  const invoiceTemplates = [
    { name: 'Standard Invoice', style: 'modern' },
    { name: 'Detailed Invoice', style: 'detailed' },
    { name: 'Simple Invoice', style: 'minimal' },
    { name: 'Professional Invoice', style: 'corporate' },
  ];

  const itData = invoiceTemplates.map((t, i) => ({
    id: uuid('B5000000', i + 1),
    user_id: DEMO_USER_ID,
    name: t.name,
    style: t.style,
    is_default: i === 0,
    usage_count: randomBetween(10, 50),
    created_at: daysAgo(randomBetween(60, 180)),
  }));

  await seedTable('invoice_templates', itData, 'Invoice Templates');
}

// ============================================================================
// 9. INTEGRATIONS & WEBHOOKS
// ============================================================================
async function seedIntegrations() {
  console.log('\n🔌 Seeding Integrations...');

  const integrations = [
    { name: 'Stripe', type: 'payment', status: 'connected' },
    { name: 'Slack', type: 'communication', status: 'connected' },
    { name: 'Google Calendar', type: 'calendar', status: 'connected' },
    { name: 'Zoom', type: 'video', status: 'connected' },
    { name: 'GitHub', type: 'development', status: 'connected' },
    { name: 'Figma', type: 'design', status: 'connected' },
    { name: 'QuickBooks', type: 'accounting', status: 'connected' },
    { name: 'Mailchimp', type: 'marketing', status: 'connected' },
    { name: 'Zapier', type: 'automation', status: 'connected' },
    { name: 'HubSpot', type: 'crm', status: 'pending' },
    { name: 'Notion', type: 'productivity', status: 'connected' },
    { name: 'Jira', type: 'project_management', status: 'disconnected' },
  ];

  const intData = integrations.map((i, idx) => ({
    id: uuid('B6000000', idx + 1),
    user_id: DEMO_USER_ID,
    name: i.name,
    type: i.type,
    status: i.status,
    config: {},
    last_sync_at: i.status === 'connected' ? hoursAgo(randomBetween(1, 24)) : null,
    created_at: daysAgo(randomBetween(30, 180)),
    updated_at: daysAgo(randomBetween(0, 7)),
  }));

  await seedTable('integrations', intData, 'Integrations');

  // Webhooks
  const webhooks = [
    { event: 'invoice.paid', url: 'https://hooks.slack.com/services/xxx' },
    { event: 'project.completed', url: 'https://hooks.slack.com/services/yyy' },
    { event: 'client.created', url: 'https://api.hubspot.com/webhook/zzz' },
    { event: 'payment.received', url: 'https://hooks.zapier.com/hooks/catch/xxx' },
  ];

  const whData = webhooks.map((w, i) => ({
    id: uuid('B7000000', i + 1),
    user_id: DEMO_USER_ID,
    event: w.event,
    url: w.url,
    is_active: true,
    last_triggered_at: hoursAgo(randomBetween(1, 168)),
    trigger_count: randomBetween(10, 100),
    created_at: daysAgo(randomBetween(30, 90)),
  }));

  await seedTable('webhooks', whData, 'Webhooks');
}

// ============================================================================
// 10. AUTOMATIONS & WORKFLOWS
// ============================================================================
async function seedAutomations() {
  console.log('\n⚡ Seeding Automations...');

  const automations = [
    { name: 'Welcome Email on Client Signup', trigger: 'client.created', runs: 45 },
    { name: 'Invoice Reminder (7 days before due)', trigger: 'schedule', runs: 128 },
    { name: 'Invoice Overdue Notification', trigger: 'invoice.overdue', runs: 23 },
    { name: 'Project Milestone Notification', trigger: 'milestone.completed', runs: 67 },
    { name: 'Weekly Revenue Report', trigger: 'schedule', runs: 48 },
    { name: 'Monthly Client Summary', trigger: 'schedule', runs: 12 },
    { name: 'Contract Expiry Alert (30 days)', trigger: 'schedule', runs: 8 },
    { name: 'Lead Follow-up Reminder', trigger: 'lead.inactive', runs: 34 },
    { name: 'Daily Time Entry Summary', trigger: 'schedule', runs: 180 },
    { name: 'Payment Received Thank You', trigger: 'payment.received', runs: 89 },
    { name: 'Task Due Tomorrow Alert', trigger: 'schedule', runs: 156 },
    { name: 'New Team Member Onboarding', trigger: 'team.member_added', runs: 4 },
  ];

  const autoData = automations.map((a, i) => ({
    id: uuid('B8000000', i + 1),
    user_id: DEMO_USER_ID,
    name: a.name,
    trigger_type: a.trigger,
    status: 'active',
    actions: [{ type: 'send_email' }, { type: 'create_task' }],
    total_runs: a.runs,
    successful_runs: Math.round(a.runs * 0.98),
    failed_runs: Math.round(a.runs * 0.02),
    last_run_at: hoursAgo(randomBetween(1, 168)),
    created_at: daysAgo(randomBetween(30, 180)),
    updated_at: daysAgo(randomBetween(0, 7)),
  }));

  await seedTable('automations', autoData, 'Automations');
}

// ============================================================================
// 11. RECURRING INVOICES & SUBSCRIPTIONS
// ============================================================================
async function seedRecurring() {
  console.log('\n🔄 Seeding Recurring Invoices...');

  const recurring = [
    { client: 'TechVenture Capital', amount: 5000, frequency: 'monthly', status: 'active' },
    { client: 'HealthTech Solutions', amount: 3500, frequency: 'monthly', status: 'active' },
    { client: 'Nordic Design Group', amount: 2500, frequency: 'monthly', status: 'active' },
    { client: 'DataPulse Analytics', amount: 8000, frequency: 'monthly', status: 'active' },
    { client: 'CloudSync Technologies', amount: 12000, frequency: 'quarterly', status: 'active' },
    { client: 'Bloom Education', amount: 4500, frequency: 'monthly', status: 'paused' },
  ];

  const recData = recurring.map((r, i) => ({
    id: uuid('B9000000', i + 1),
    user_id: DEMO_USER_ID,
    client_name: r.client,
    client_email: r.client.toLowerCase().replace(/\s+/g, '.') + '@example.com',
    amount: r.amount,
    currency: 'USD',
    frequency: r.frequency,
    status: r.status,
    next_invoice_date: daysAgo(-randomBetween(1, 30)),
    last_invoice_date: daysAgo(randomBetween(1, 30)),
    total_invoiced: r.amount * randomBetween(3, 12),
    invoices_generated: randomBetween(3, 12),
    created_at: daysAgo(randomBetween(60, 180)),
    updated_at: daysAgo(randomBetween(0, 7)),
  }));

  await seedTable('recurring_invoices', recData, 'Recurring Invoices');
}

// ============================================================================
// 12. TEAM & PERFORMANCE
// ============================================================================
async function seedTeam() {
  console.log('\n👥 Seeding Team Data...');

  const teamMembers = [
    { name: 'Alex Morgan', role: 'Founder & CEO', rate: 200, utilization: 75 },
    { name: 'Jordan Lee', role: 'Lead Designer', rate: 150, utilization: 85 },
    { name: 'Casey Rivera', role: 'Senior Developer', rate: 175, utilization: 82 },
    { name: 'Taylor Kim', role: 'Project Manager', rate: 125, utilization: 70 },
    { name: 'Morgan Chen', role: 'Full Stack Developer', rate: 160, utilization: 88 },
    { name: 'Riley Johnson', role: 'UX Designer', rate: 140, utilization: 78 },
  ];

  const memberData = teamMembers.map((m, i) => ({
    id: uuid('C0000000', i + 1),
    user_id: DEMO_USER_ID,
    name: m.name,
    email: m.name.toLowerCase().replace(' ', '.') + '@freeflow.io',
    role: m.role,
    hourly_rate: m.rate,
    status: 'active',
    joined_at: daysAgo(randomBetween(30, 365)),
    created_at: daysAgo(randomBetween(30, 365)),
  }));

  await seedTable('team_members', memberData, 'Team Members');

  // Team performance metrics
  const performanceData = teamMembers.map((m, i) => ({
    id: uuid('C1000000', i + 1),
    user_id: DEMO_USER_ID,
    member_name: m.name,
    period: '2025-01',
    billable_hours: Math.round(160 * m.utilization / 100),
    total_hours: 160,
    utilization_rate: m.utilization,
    revenue_generated: Math.round(160 * m.utilization / 100 * m.rate),
    tasks_completed: randomBetween(20, 50),
    projects_contributed: randomBetween(2, 5),
    client_satisfaction: 4.5 + Math.random() * 0.5,
    created_at: daysAgo(30),
  }));

  await seedTable('team_performance', performanceData, 'Team Performance');
}

// ============================================================================
// 13. GOALS & OKRs
// ============================================================================
async function seedGoals() {
  console.log('\n🎯 Seeding Goals & OKRs...');

  const goals = [
    { title: 'Reach $300K ARR', type: 'revenue', target: 300000, current: 250000 },
    { title: 'Acquire 20 clients', type: 'growth', target: 20, current: 15 },
    { title: '90% client retention', type: 'retention', target: 90, current: 93 },
    { title: 'Launch mobile app', type: 'product', target: 100, current: 75 },
    { title: 'Hire 2 more developers', type: 'team', target: 2, current: 1 },
    { title: 'NPS score of 70+', type: 'satisfaction', target: 70, current: 72 },
  ];

  const goalData = goals.map((g, i) => ({
    id: uuid('C2000000', i + 1),
    user_id: DEMO_USER_ID,
    title: g.title,
    type: g.type,
    target_value: g.target,
    current_value: g.current,
    progress: Math.round(g.current / g.target * 100),
    status: g.current >= g.target ? 'completed' : 'in_progress',
    due_date: daysAgo(-randomBetween(30, 90)),
    created_at: daysAgo(randomBetween(30, 180)),
    updated_at: daysAgo(randomBetween(0, 7)),
  }));

  await seedTable('goals', goalData, 'Goals');
}

// ============================================================================
// 14. PORTFOLIOS & CASE STUDIES
// ============================================================================
async function seedPortfolios() {
  console.log('\n🖼️  Seeding Portfolios...');

  const portfolioItems = [
    { title: 'TechVenture Mobile App', category: 'mobile', client: 'TechVenture Capital' },
    { title: 'E-commerce Platform Redesign', category: 'web', client: 'CloudSync Technologies' },
    { title: 'Healthcare Dashboard', category: 'dashboard', client: 'HealthTech Solutions' },
    { title: 'Nordic Brand Identity', category: 'branding', client: 'Nordic Design Group' },
    { title: 'DataPulse Analytics UI', category: 'dashboard', client: 'DataPulse Analytics' },
    { title: 'Fitness App MVP', category: 'mobile', client: 'Urban Fitness Network' },
    { title: 'Education Platform', category: 'web', client: 'Bloom Education' },
    { title: 'Restaurant Booking System', category: 'web', client: 'Local Restaurant' },
  ];

  const portfolioData = portfolioItems.map((p, i) => ({
    id: uuid('C3000000', i + 1),
    user_id: DEMO_USER_ID,
    title: p.title,
    description: `Case study: ${p.title} for ${p.client}`,
    category: p.category,
    client_name: p.client,
    is_featured: i < 3,
    is_public: true,
    view_count: randomBetween(100, 1000),
    tags: [p.category, 'case-study'],
    created_at: daysAgo(randomBetween(30, 180)),
    updated_at: daysAgo(randomBetween(0, 30)),
  }));

  await seedTable('portfolios', portfolioData, 'Portfolio Items');
}

// ============================================================================
// 15. VIDEO STUDIO PROJECTS
// ============================================================================
async function seedVideoStudio() {
  console.log('\n🎬 Seeding Video Studio...');

  const videos = [
    { title: 'Product Demo - Platform Overview', duration: 180, status: 'published' },
    { title: 'Client Testimonial - TechVenture', duration: 120, status: 'published' },
    { title: 'Feature Walkthrough - Invoicing', duration: 300, status: 'published' },
    { title: 'Team Introduction', duration: 90, status: 'published' },
    { title: 'Tutorial: Getting Started', duration: 420, status: 'draft' },
    { title: 'Webinar Recording - Best Practices', duration: 3600, status: 'processing' },
    { title: 'Social Media Teaser', duration: 30, status: 'draft' },
    { title: 'Annual Recap 2025', duration: 240, status: 'draft' },
  ];

  const videoData = videos.map((v, i) => ({
    id: uuid('C4000000', i + 1),
    user_id: DEMO_USER_ID,
    title: v.title,
    description: `Video: ${v.title}`,
    duration_seconds: v.duration,
    status: v.status,
    resolution: '1920x1080',
    format: 'mp4',
    file_size: v.duration * 1000000, // ~1MB per second
    view_count: v.status === 'published' ? randomBetween(50, 500) : 0,
    thumbnail_url: `/thumbnails/video-${i + 1}.jpg`,
    created_at: daysAgo(randomBetween(7, 90)),
    updated_at: daysAgo(randomBetween(0, 7)),
  }));

  await seedTable('video_projects', videoData, 'Video Projects');
}

// ============================================================================
// 16. VOICE PROJECTS (AI Voice)
// ============================================================================
async function seedVoiceProjects() {
  console.log('\n🎙️  Seeding Voice Projects...');

  const voices = [
    { title: 'Product Demo Voiceover', duration: 180, status: 'completed' },
    { title: 'Tutorial Narration', duration: 420, status: 'completed' },
    { title: 'Podcast Intro', duration: 30, status: 'completed' },
    { title: 'IVR Menu Voice', duration: 60, status: 'completed' },
    { title: 'Explainer Video Voice', duration: 240, status: 'in_progress' },
  ];

  const voiceData = voices.map((v, i) => ({
    id: uuid('C5000000', i + 1),
    user_id: DEMO_USER_ID,
    title: v.title,
    script: `Script for ${v.title}...`,
    duration_seconds: v.duration,
    status: v.status,
    voice_id: 'eleven_multilingual_v2',
    language: 'en',
    created_at: daysAgo(randomBetween(7, 60)),
    updated_at: daysAgo(randomBetween(0, 7)),
  }));

  await seedTable('voice_projects', voiceData, 'Voice Projects');
}

// ============================================================================
// 17. CLIENT PORTAL DATA
// ============================================================================
async function seedClientPortal() {
  console.log('\n🌐 Seeding Client Portal...');

  // Client portal sessions
  const sessions = [];
  for (let i = 0; i < 30; i++) {
    sessions.push({
      id: uuid('C6000000', i + 1),
      user_id: DEMO_USER_ID,
      client_email: `client${i % 10}@example.com`,
      client_name: `Client ${i % 10 + 1}`,
      action: randomItem(['viewed_project', 'downloaded_file', 'approved_design', 'left_comment', 'viewed_invoice', 'made_payment']),
      resource_type: randomItem(['project', 'file', 'invoice', 'design']),
      ip_address: '192.168.1.' + randomBetween(1, 255),
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      created_at: hoursAgo(randomBetween(1, 720)),
    });
  }
  await seedTable('client_portal_activity', sessions, 'Client Portal Activity');
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================
async function main() {
  try {
    await seedMyDay();
    await seedEscrow();
    await seedCrypto();
    await seedCollaboration();
    await seedDashboard();
    await seedProjectDetails();
    await seedReports();
    await seedTemplates();
    await seedIntegrations();
    await seedAutomations();
    await seedRecurring();
    await seedTeam();
    await seedGoals();
    await seedPortfolios();
    await seedVideoStudio();
    await seedVoiceProjects();
    await seedClientPortal();

    console.log('\n' + '═'.repeat(70));
    console.log('\n🎉 EVERYTHING SEEDED!\n');

    console.log('📊 NEW FEATURES POPULATED:');
    console.log('   ✓ My Day / Focus Sessions');
    console.log('   ✓ Escrow System & Milestones');
    console.log('   ✓ Crypto Wallets & Transactions');
    console.log('   ✓ Collaboration Sessions & Shares');
    console.log('   ✓ Dashboard Widgets & Analytics');
    console.log('   ✓ Project Milestones & Activity');
    console.log('   ✓ Reports & Analytics');
    console.log('   ✓ Templates (Project & Invoice)');
    console.log('   ✓ Integrations & Webhooks');
    console.log('   ✓ Automations & Workflows');
    console.log('   ✓ Recurring Invoices');
    console.log('   ✓ Team & Performance Metrics');
    console.log('   ✓ Goals & OKRs');
    console.log('   ✓ Portfolio & Case Studies');
    console.log('   ✓ Video Studio Projects');
    console.log('   ✓ Voice Projects');
    console.log('   ✓ Client Portal Activity\n');

    console.log('🔗 TEST IN V1: http://localhost:9323/v1/dashboard');
    console.log('🔗 TEST IN V2: http://localhost:9323/v2/dashboard');
    console.log('');
    console.log('   Login: alex@freeflow.io / investor2026\n');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
