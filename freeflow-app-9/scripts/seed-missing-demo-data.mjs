#!/usr/bin/env node

/**
 * Seed Missing Demo Data
 * Adds data to empty tables for demo user
 * Uses correct database schemas from migrations
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

// Helper to generate UUIDs
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

// Helper for random dates
function randomDate(daysAgo = 90) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString();
}

// Helper for future dates
function futureDate(daysAhead = 30) {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * daysAhead) + 1);
  return date.toISOString();
}

async function seedDeals() {
  console.log('Seeding deals...');

  // First get demo user's clients to link deals
  const { data: clients } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', DEMO_USER_ID)
    .limit(10);

  if (!clients || clients.length === 0) {
    console.log('  ⚠ No clients found for demo user - skipping deals');
    return;
  }

  const stages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
  const priorities = ['low', 'medium', 'high'];
  const sources = ['referral', 'website', 'cold_call', 'partner', 'trade_show'];

  const dealTitles = [
    'Enterprise Software License',
    'Annual Maintenance Contract',
    'Custom Development Project',
    'Cloud Migration Services',
    'Security Audit Package',
    'Training & Onboarding',
    'API Integration Project',
    'Mobile App Development',
    'Website Redesign',
    'Data Analytics Setup'
  ];

  const deals = dealTitles.map((title, i) => ({
    id: uuid(),
    user_id: DEMO_USER_ID,
    client_id: clients[i % clients.length].id,
    deal_code: `DEAL-${String(i + 1).padStart(4, '0')}`,
    title,
    description: `${title} for client partnership`,
    value: Math.floor(Math.random() * 50000) + 10000,
    currency: 'USD',
    stage: stages[Math.floor(Math.random() * stages.length)],
    probability: Math.floor(Math.random() * 80) + 20,
    expected_close_date: futureDate(60),
    source: sources[Math.floor(Math.random() * sources.length)],
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    assigned_to: DEMO_USER_ID,
    tags: ['demo', '2025'],
    notes: `Demo deal created for investor presentation`,
    metadata: { demo: true }
  }));

  const { error } = await supabase.from('deals').insert(deals);
  if (error) {
    console.log(`  Error: ${error.message}`);
  } else {
    console.log(`  ✓ Created ${deals.length} deals`);
  }
}

async function seedActivityLogs() {
  console.log('Seeding activity_logs...');

  const actions = [
    'Created new project',
    'Updated project status',
    'Completed task',
    'Sent invoice to client',
    'Added new client',
    'Uploaded document',
    'Sent message',
    'Scheduled meeting',
    'Updated profile',
    'Logged time entry',
    'Added expense',
    'Closed deal successfully'
  ];

  const categories = ['project', 'task', 'client', 'invoice', 'file', 'general'];
  const resourceTypes = ['project', 'task', 'client', 'invoice', 'file', 'deal', 'meeting'];

  const activities = [];
  for (let i = 0; i < 50; i++) {
    const action = actions[Math.floor(Math.random() * actions.length)];
    const resourceType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];

    activities.push({
      id: uuid(),
      user_id: DEMO_USER_ID,
      activity_code: `ACT-${Date.now()}-${i}`,
      user_name: 'Alexandra Chen',
      user_email: 'alex@freeflow.io',
      action,
      category: categories[Math.floor(Math.random() * categories.length)],
      status: 'success',
      resource_type: resourceType,
      resource_id: uuid(),
      resource_name: `Demo ${resourceType} ${i + 1}`,
      ip_address: '192.168.1.1',
      user_agent: 'Demo Browser',
      duration: Math.floor(Math.random() * 5000),
      metadata: { source: 'demo' },
      created_at: randomDate(30)
    });
  }

  const { error } = await supabase.from('activity_logs').insert(activities);
  if (error) {
    console.log(`  Error: ${error.message}`);
  } else {
    console.log(`  ✓ Created ${activities.length} activity logs`);
  }
}

async function seedCryptoWallets() {
  console.log('Seeding crypto_wallets...');

  const wallets = [
    {
      id: uuid(),
      user_id: DEMO_USER_ID,
      name: 'Main Bitcoin Wallet',
      currency: 'BTC',
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      balance: 2.5,
      locked_balance: 0.5,
      usd_value: 125000.00,
      type: 'hot',
      is_active: true,
      is_primary: true,
      network: 'bitcoin',
      network_type: 'mainnet',
      transaction_count: 47,
      tags: ['primary', 'demo']
    },
    {
      id: uuid(),
      user_id: DEMO_USER_ID,
      name: 'Ethereum Wallet',
      currency: 'ETH',
      address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      balance: 15.75,
      locked_balance: 2.0,
      usd_value: 52500.00,
      type: 'hot',
      is_active: true,
      is_primary: false,
      network: 'ethereum',
      network_type: 'mainnet',
      transaction_count: 128,
      tags: ['defi', 'demo']
    },
    {
      id: uuid(),
      user_id: DEMO_USER_ID,
      name: 'USDC Stablecoin',
      currency: 'USDC',
      address: '0x8B3e1F8c2D5f4a6b7C8E9d0A1B2c3D4e5F6a7b8C',
      balance: 50000.00,
      locked_balance: 0,
      usd_value: 50000.00,
      type: 'hot',
      is_active: true,
      is_primary: false,
      network: 'ethereum',
      network_type: 'mainnet',
      transaction_count: 35,
      tags: ['stablecoin', 'demo']
    }
  ];

  const { error } = await supabase.from('crypto_wallets').insert(wallets);
  if (error) {
    console.log(`  Error: ${error.message}`);
  } else {
    console.log(`  ✓ Created ${wallets.length} crypto wallets`);
  }
}

async function seedChatsAndMessages() {
  console.log('Seeding chats and messages...');

  // First check if chats exist for demo user, or create one
  let chatId;
  const { data: existingChats } = await supabase
    .from('chats')
    .select('id')
    .eq('user_id', DEMO_USER_ID)
    .limit(1);

  if (existingChats && existingChats.length > 0) {
    chatId = existingChats[0].id;
    console.log(`  Using existing chat: ${chatId}`);
  } else {
    // Create a demo chat - chats table uses user_id not created_by
    const newChatId = uuid();
    const { error: chatError } = await supabase.from('chats').insert({
      id: newChatId,
      user_id: DEMO_USER_ID,
      type: 'direct',
      name: 'Demo Team Chat',
      description: 'Team collaboration channel',
      unread_count: 3
    });

    if (chatError) {
      console.log(`  Error creating chat: ${chatError.message}`);
      return;
    }
    chatId = newChatId;
    console.log(`  Created new chat: ${chatId}`);
  }

  const messageTexts = [
    'Hi! Just checking in on the project status.',
    'The designs look great! Ready for review.',
    'Can we schedule a call for tomorrow?',
    'Invoice has been sent. Thanks!',
    'Great work on the latest milestone!',
    'Please review the attached document.',
    'Meeting confirmed for 3 PM.',
    'The client approved the proposal!',
    'Need your feedback on the wireframes.',
    'Task completed ahead of schedule.'
  ];

  // Messages table uses text column and ENUMs for type/status
  const messages = messageTexts.map((text, i) => ({
    id: uuid(),
    chat_id: chatId,
    sender_id: DEMO_USER_ID,
    text,
    created_at: randomDate(30)
  }));

  const { error } = await supabase.from('messages').insert(messages);
  if (error) {
    console.log(`  Messages error: ${error.message}`);
  } else {
    console.log(`  ✓ Created ${messages.length} messages`);
  }
}

async function seedReports() {
  console.log('Seeding custom_reports...');

  // Use DATE format (YYYY-MM-DD) not TIMESTAMPTZ
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const dateEnd = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const dateStart = thirtyDaysAgo.toISOString().split('T')[0];

  const reportDefs = [
    { name: 'Financial Summary Q4 2025', type: 'financial', description: 'Quarterly financial overview' },
    { name: 'Analytics Dashboard Report', type: 'analytics', description: 'Key metrics and KPIs' },
    { name: 'Performance Review December', type: 'performance', description: 'Team and project performance' },
    { name: 'Sales Pipeline Report', type: 'sales', description: 'Deal progression and forecasts' },
    { name: 'Custom Client Report', type: 'custom', description: 'Client engagement analysis' }
  ];

  const reports = reportDefs.map((def, i) => ({
    id: uuid(),
    user_id: DEMO_USER_ID,
    name: def.name,
    type: def.type,
    status: i === 0 ? 'generating' : 'ready',
    description: def.description,
    frequency: i < 2 ? 'monthly' : 'once',
    date_range_start: dateStart,
    date_range_end: dateEnd,
    data_points: Math.floor(Math.random() * 500) + 100,
    file_size: Math.floor(Math.random() * 500000) + 10000,
    recipients: ['alex@freeflow.io'],
    tags: ['demo', '2025'],
    filters: { demo: true },
    metrics: ['revenue', 'projects', 'tasks'],
    created_by: 'Alexandra Chen'
  }));

  // Table is custom_reports not reports
  const { error } = await supabase.from('custom_reports').insert(reports);
  if (error) {
    console.log(`  Error: ${error.message}`);
  } else {
    console.log(`  ✓ Created ${reports.length} custom reports`);
  }
}

async function seedUserSettings() {
  console.log('Seeding user settings (4 tables)...');

  // 1. User Profiles - try minimal columns first
  const profile = {
    user_id: DEMO_USER_ID,
    first_name: 'Alexandra',
    last_name: 'Chen'
  };

  const { error: profileError } = await supabase
    .from('user_profiles')
    .upsert(profile, { onConflict: 'user_id' });

  if (profileError) {
    console.log(`  Profile error: ${profileError.message}`);
    // Try users table if user_profiles fails
    await seedUsersTable();
  } else {
    console.log('  ✓ Created user profile');
  }
}

async function seedUsersTable() {
  console.log('  Trying users table...');
  const { error } = await supabase
    .from('users')
    .upsert({
      id: DEMO_USER_ID,
      full_name: 'Alexandra Chen',
      email: 'alex@freeflow.io',
      role: 'pro'
    }, { onConflict: 'id' });

  if (error) {
    console.log(`  Users table error: ${error.message}`);
  } else {
    console.log('  ✓ Updated users table');
  }

  // 2. Notification Settings
  const notifications = {
    user_id: DEMO_USER_ID,
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    in_app_notifications: true,
    project_updates: true,
    client_messages: true,
    team_mentions: true,
    task_assignments: true,
    deadline_reminders: true,
    payment_alerts: true,
    invoice_reminders: true,
    payment_confirmations: true,
    marketing_emails: false,
    product_updates: true,
    weekly_digest: true,
    monthly_reports: true,
    digest_frequency: 'weekly',
    quiet_hours_enabled: true,
    quiet_hours_start: '22:00',
    quiet_hours_end: '07:00'
  };

  const { error: notifError } = await supabase
    .from('notification_settings')
    .upsert(notifications, { onConflict: 'user_id' });

  if (notifError) {
    console.log(`  Notification settings error: ${notifError.message}`);
  } else {
    console.log('  ✓ Created notification settings');
  }

  // 3. Security Settings
  const security = {
    user_id: DEMO_USER_ID,
    two_factor_auth: true,
    two_factor_method: 'authenticator',
    biometric_auth: false,
    session_timeout: '24h',
    remember_me_enabled: true,
    concurrent_sessions_limit: 5,
    login_alerts: true,
    login_alerts_email: true,
    suspicious_activity_alerts: true,
    new_device_alerts: true,
    password_required: true,
    password_last_changed: randomDate(60)
  };

  const { error: securityError } = await supabase
    .from('security_settings')
    .upsert(security, { onConflict: 'user_id' });

  if (securityError) {
    console.log(`  Security settings error: ${securityError.message}`);
  } else {
    console.log('  ✓ Created security settings');
  }

  // 4. Appearance Settings
  const appearance = {
    user_id: DEMO_USER_ID,
    theme: 'dark',
    accent_color: '#8B5CF6',
    language: 'en',
    timezone: 'America/Los_Angeles',
    date_format: 'MM/DD/YYYY',
    time_format: '12h',
    currency: 'USD',
    compact_mode: false,
    animations: true,
    reduced_motion: false,
    high_contrast: false,
    font_size: 'medium',
    sidebar_collapsed: false,
    dashboard_layout: { widgets: ['stats', 'projects', 'tasks', 'activity'] },
    pinned_items: ['projects', 'invoices', 'analytics']
  };

  const { error: appearanceError } = await supabase
    .from('appearance_settings')
    .upsert(appearance, { onConflict: 'user_id' });

  if (appearanceError) {
    console.log(`  Appearance settings error: ${appearanceError.message}`);
  } else {
    console.log('  ✓ Created appearance settings');
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('SEEDING MISSING DEMO DATA');
  console.log('='.repeat(60));
  console.log(`User ID: ${DEMO_USER_ID}\n`);

  await seedDeals();
  await seedActivityLogs();
  await seedCryptoWallets();
  await seedChatsAndMessages();
  await seedReports();
  await seedUserSettings();

  console.log('\n' + '='.repeat(60));
  console.log('SEEDING COMPLETE');
  console.log('='.repeat(60));
}

main().catch(console.error);
