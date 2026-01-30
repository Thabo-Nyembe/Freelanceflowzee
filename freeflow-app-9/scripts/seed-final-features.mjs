#!/usr/bin/env node
/**
 * FINAL FEATURES SEED - Correct schemas for remaining tables
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

console.log('🚀 SEEDING FINAL FEATURES\n');
console.log('═'.repeat(60));

// ============================================================================
// CHATS - Fixed enum values
// ============================================================================
async function seedChats() {
  console.log('\n💬 Seeding Chats...');

  // First check what enum values are valid
  const chats = [
    { id: uuid('32000000', 1), name: 'TechStartup Project', type: 'group' },
    { id: uuid('32000000', 2), name: 'Design Team', type: 'group' },
    { id: uuid('32000000', 3), name: 'Sarah Johnson', type: 'direct' },
    { id: uuid('32000000', 4), name: 'Michael Chen', type: 'direct' },
    { id: uuid('32000000', 5), name: 'General Discussion', type: 'group' },
  ];

  const chatData = chats.map(c => ({
    id: c.id,
    user_id: DEMO_USER_ID,
    name: c.name,
    description: `Chat: ${c.name}`,
    type: c.type,
    is_pinned: c.name.includes('Project'),
    is_muted: false,
    is_archived: false,
    unread_count: Math.floor(Math.random() * 5),
    last_message_at: daysAgo(Math.floor(Math.random() * 5)),
    created_at: daysAgo(90),
    updated_at: daysAgo(Math.floor(Math.random() * 5)),
  }));

  const { error } = await supabase.from('chats').upsert(chatData, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  chats: ${error.message}`);
  } else {
    console.log(`   ✓ Created ${chats.length} chats`);
  }
}

// ============================================================================
// MESSAGES - Use existing chat IDs or create orphan messages
// ============================================================================
async function seedMessages() {
  console.log('\n💬 Seeding Messages...');

  // Get existing chats
  const { data: existingChats } = await supabase
    .from('chats')
    .select('id')
    .eq('user_id', DEMO_USER_ID)
    .limit(5);

  if (!existingChats || existingChats.length === 0) {
    console.log('   ⚠️  No chats found to add messages to');
    return;
  }

  const messageTemplates = [
    "Just finished the wireframes, ready for review!",
    "Great progress on the project today",
    "Can we schedule a call to discuss the feedback?",
    "The client loved the new designs!",
    "I've pushed the latest updates to staging",
    "Let me know when you're free to review",
    "All tests passing, ready to deploy",
    "Thanks for the quick turnaround!",
    "Here's the updated proposal with revisions",
    "The new feature is now live",
  ];

  const messages = [];
  for (const chat of existingChats) {
    const messageCount = Math.floor(Math.random() * 20) + 10;
    for (let i = 0; i < messageCount; i++) {
      messages.push({
        id: uuid('33000000', messages.length + 1),
        chat_id: chat.id,
        sender_id: DEMO_USER_ID,
        text: randomItem(messageTemplates),
        status: 'sent',
        is_edited: false,
        is_pinned: false,
        is_deleted: false,
        created_at: daysAgo(Math.floor(Math.random() * 60)),
      });
    }
  }

  const { error } = await supabase.from('messages').upsert(messages, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  messages: ${error.message}`);
  } else {
    console.log(`   ✓ Created ${messages.length} messages`);
  }
}

// ============================================================================
// BOOKINGS - Correct schema
// ============================================================================
async function seedBookings() {
  console.log('\n📆 Seeding Bookings...');

  const bookingTypes = [
    { title: 'Discovery Call', duration: 30 },
    { title: 'Project Consultation', duration: 60 },
    { title: 'Design Review', duration: 45 },
    { title: 'Technical Discussion', duration: 60 },
    { title: 'Follow-up Meeting', duration: 30 },
  ];

  const clientNames = ['Sarah Johnson', 'Michael Chen', 'Emma Williams', 'David Rodriguez', 'Lisa Park'];

  const bookings = [];
  for (let i = 0; i < 25; i++) {
    const type = randomItem(bookingTypes);
    const client = randomItem(clientNames);
    const daysOffset = Math.floor(Math.random() * 60) - 30;
    const date = new Date(Date.now() + daysOffset * 24 * 60 * 60 * 1000);
    date.setHours(9 + Math.floor(Math.random() * 8), 0, 0);

    bookings.push({
      id: uuid('48000000', i + 1),
      user_id: DEMO_USER_ID,
      client_name: client,
      client_email: client.toLowerCase().replace(' ', '.') + '@example.com',
      client_phone: '+1 555-' + String(Math.floor(Math.random() * 9000) + 1000),
      start_time: date.toISOString(),
      end_time: new Date(date.getTime() + type.duration * 60000).toISOString(),
      status: daysOffset < 0 ? 'completed' : 'confirmed',
      location: randomItem(['Zoom', 'Google Meet', 'Office']),
      notes: `${type.title} with ${client}`,
      payment_status: 'not_required',
      created_at: daysAgo(Math.abs(daysOffset) + 7),
      updated_at: daysAgo(Math.abs(daysOffset)),
    });
  }

  const { error } = await supabase.from('bookings').upsert(bookings, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  bookings: ${error.message}`);
  } else {
    console.log(`   ✓ Created ${bookings.length} bookings`);
    const completed = bookings.filter(b => b.status === 'completed').length;
    console.log(`   📊 Completed: ${completed} | Upcoming: ${bookings.length - completed}`);
  }
}

// ============================================================================
// CONTRACTS - Correct schema
// ============================================================================
async function seedContracts() {
  console.log('\n📝 Seeding Contracts...');

  const contracts = [
    { title: 'Master Service Agreement - TechStartup', type: 'msa', status: 'active', value: 75000 },
    { title: 'NDA - Creative Agency', type: 'nda', status: 'active', value: 0 },
    { title: 'Project Contract - Mobile App', type: 'project', status: 'active', value: 120000 },
    { title: 'Retainer Agreement - HealthTech', type: 'retainer', status: 'active', value: 5000 },
    { title: 'SOW - Dashboard Project', type: 'sow', status: 'pending', value: 45000 },
    { title: 'NDA - Enterprise Client', type: 'nda', status: 'pending', value: 0 },
    { title: 'Completed Project - Local Cafe', type: 'project', status: 'completed', value: 8500 },
  ];

  const contractData = contracts.map((c, i) => ({
    id: uuid('50000000', i + 1),
    user_id: DEMO_USER_ID,
    contract_number: `CTR-2025-${String(i + 1).padStart(4, '0')}`,
    title: c.title,
    description: `${c.type.toUpperCase()} contract: ${c.title}`,
    contract_type: c.type,
    status: c.status,
    contract_value: c.value,
    currency: 'USD',
    start_date: daysAgo(Math.floor(Math.random() * 180)),
    end_date: c.status === 'completed' ? daysAgo(Math.floor(Math.random() * 30)) : daysAgo(-365),
    party_a_name: 'Alex Morgan / FreeFlow Agency',
    party_a_email: 'alex@freeflow.io',
    party_b_name: c.title.split(' - ')[1] || 'Client',
    party_b_email: 'client@example.com',
    is_template: false,
    version: 1,
    created_at: daysAgo(Math.floor(Math.random() * 180)),
    updated_at: daysAgo(Math.floor(Math.random() * 14)),
  }));

  const { error } = await supabase.from('contracts').upsert(contractData, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  contracts: ${error.message}`);
  } else {
    console.log(`   ✓ Created ${contracts.length} contracts`);
    const active = contracts.filter(c => c.status === 'active').length;
    const totalValue = contracts.reduce((sum, c) => sum + c.value, 0);
    console.log(`   📊 Active: ${active} | Total value: $${totalValue.toLocaleString()}`);
  }
}

// ============================================================================
// LEADS - Correct schema
// ============================================================================
async function seedLeads() {
  console.log('\n🎯 Seeding Leads...');

  const leads = [
    { name: 'Jennifer Walsh', company: 'Retail Brand', status: 'qualified', value: 42000 },
    { name: 'Chris Martinez', company: 'SaaS Startup', status: 'new', value: 75000 },
    { name: 'Amanda Foster', company: 'Media Group', status: 'contacted', value: 38000 },
    { name: 'Kevin O\'Brien', company: 'Finance Corp', status: 'qualified', value: 120000 },
    { name: 'Rachel Green', company: 'Fashion Brand', status: 'new', value: 55000 },
    { name: 'Tom Anderson', company: 'EdTech Co', status: 'negotiation', value: 85000 },
    { name: 'Lisa Wang', company: 'Healthcare Org', status: 'qualified', value: 95000 },
    { name: 'Mark Johnson', company: 'Real Estate', status: 'contacted', value: 32000 },
  ];

  const leadData = leads.map((l, i) => ({
    id: uuid('52000000', i + 1),
    user_id: DEMO_USER_ID,
    name: l.name,
    email: l.name.toLowerCase().replace(/[' ]/g, '.') + '@example.com',
    phone: '+1 555-' + String(Math.floor(Math.random() * 9000) + 1000),
    company: l.company,
    title: randomItem(['CEO', 'CTO', 'VP Marketing', 'Director', 'Manager']),
    status: l.status,
    score: Math.floor(Math.random() * 50) + 50,
    source: randomItem(['website', 'referral', 'linkedin', 'conference']),
    value_estimate: l.value,
    notes: `Lead from ${l.company}`,
    last_contact_at: daysAgo(Math.floor(Math.random() * 14)),
    next_follow_up: daysAgo(-Math.floor(Math.random() * 7)),
    tags: [l.company.toLowerCase().replace(' ', '-')],
    created_at: daysAgo(Math.floor(Math.random() * 60)),
    updated_at: daysAgo(Math.floor(Math.random() * 7)),
  }));

  const { error } = await supabase.from('leads').upsert(leadData, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  leads: ${error.message}`);
  } else {
    console.log(`   ✓ Created ${leads.length} leads`);
    const totalValue = leads.reduce((sum, l) => sum + l.value, 0);
    console.log(`   📊 Pipeline value: $${totalValue.toLocaleString()}`);
  }
}

// ============================================================================
// AI CONVERSATIONS - Correct schema
// ============================================================================
async function seedAIConversations() {
  console.log('\n🤖 Seeding AI Conversations...');

  const conversations = [
    { title: 'Email draft for client proposal', preview: 'Help me write a proposal...' },
    { title: 'Code review assistance', preview: 'Can you review this code...' },
    { title: 'Marketing copy generation', preview: 'I need marketing copy for...' },
    { title: 'Project timeline planning', preview: 'Help me plan the timeline...' },
    { title: 'Contract clause review', preview: 'Review this contract clause...' },
    { title: 'Design feedback analysis', preview: 'Analyze this design feedback...' },
    { title: 'Bug debugging session', preview: 'Help me debug this issue...' },
    { title: 'Invoice template suggestions', preview: 'Suggest invoice improvements...' },
    { title: 'Client presentation outline', preview: 'Create an outline for...' },
    { title: 'API documentation help', preview: 'Help document this API...' },
  ];

  const convData = conversations.map((c, i) => ({
    id: uuid('47000000', i + 1),
    user_id: DEMO_USER_ID,
    title: c.title,
    preview: c.preview,
    status: 'active',
    is_pinned: i < 2,
    is_archived: false,
    message_count: Math.floor(Math.random() * 20) + 5,
    total_tokens: Math.floor(Math.random() * 5000) + 1000,
    user_message_count: Math.floor(Math.random() * 10) + 3,
    assistant_message_count: Math.floor(Math.random() * 10) + 3,
    avg_rating: 4 + Math.random(),
    last_message_at: daysAgo(Math.floor(Math.random() * 30)),
    tags: [c.title.split(' ')[0].toLowerCase()],
    created_at: daysAgo(Math.floor(Math.random() * 60)),
    updated_at: daysAgo(Math.floor(Math.random() * 7)),
  }));

  const { error } = await supabase.from('ai_conversations').upsert(convData, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  ai_conversations: ${error.message}`);
  } else {
    console.log(`   ✓ Created ${conversations.length} AI conversations`);
    const totalTokens = convData.reduce((sum, c) => sum + c.total_tokens, 0);
    console.log(`   📊 Total tokens used: ${totalTokens.toLocaleString()}`);
  }
}

// ============================================================================
// ACTIVITIES / TIMELINE
// ============================================================================
async function seedActivities() {
  console.log('\n📋 Seeding Activities...');

  const activityTypes = [
    { type: 'invoice_sent', description: 'Sent invoice to client' },
    { type: 'payment_received', description: 'Received payment' },
    { type: 'project_started', description: 'Started new project' },
    { type: 'project_completed', description: 'Completed project' },
    { type: 'meeting_scheduled', description: 'Scheduled client meeting' },
    { type: 'contract_signed', description: 'Contract signed' },
    { type: 'task_completed', description: 'Completed task' },
    { type: 'file_uploaded', description: 'Uploaded file' },
    { type: 'client_added', description: 'Added new client' },
    { type: 'proposal_sent', description: 'Sent proposal' },
  ];

  const activities = [];
  for (let i = 0; i < 50; i++) {
    const activity = randomItem(activityTypes);
    activities.push({
      id: uuid('53000000', i + 1),
      user_id: DEMO_USER_ID,
      type: activity.type,
      description: activity.description,
      metadata: { auto_generated: true },
      created_at: daysAgo(Math.floor(Math.random() * 90)),
    });
  }

  const { error } = await supabase.from('activity_logs').upsert(activities, { onConflict: 'id' });
  if (error) {
    // Try activities table
    const { error: error2 } = await supabase.from('activities').upsert(activities, { onConflict: 'id' });
    if (error2) {
      console.log(`   ⚠️  activities: ${error.message}`);
    } else {
      console.log(`   ✓ Created ${activities.length} activity logs`);
    }
  } else {
    console.log(`   ✓ Created ${activities.length} activity logs`);
  }
}

// ============================================================================
// RECURRING REVENUE (MRR)
// ============================================================================
async function seedRecurringRevenue() {
  console.log('\n💵 Seeding Recurring Revenue...');

  const mrrData = [];
  for (let month = 11; month >= 0; month--) {
    const date = new Date();
    date.setMonth(date.getMonth() - month);

    // MRR grows from $2K to $18K over 12 months
    const baseMRR = 2000;
    const growth = Math.pow(1.2, 12 - month); // 20% growth per month average

    mrrData.push({
      id: uuid('54000000', 12 - month),
      user_id: DEMO_USER_ID,
      period: date.toISOString().slice(0, 7),
      mrr: Math.round(baseMRR * growth),
      arr: Math.round(baseMRR * growth * 12),
      new_mrr: Math.round(baseMRR * growth * 0.15),
      churned_mrr: Math.round(baseMRR * growth * 0.02),
      expansion_mrr: Math.round(baseMRR * growth * 0.08),
      active_subscriptions: Math.floor(3 + (12 - month) * 0.8),
      created_at: date.toISOString(),
    });
  }

  const { error } = await supabase.from('revenue_analytics').upsert(mrrData, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  revenue_analytics: ${error.message}`);
  } else {
    console.log(`   ✓ Created 12 months of revenue data`);
    const latestMRR = mrrData[mrrData.length - 1].mrr;
    console.log(`   📊 Current MRR: $${latestMRR.toLocaleString()} | ARR: $${(latestMRR * 12).toLocaleString()}`);
  }
}

// ============================================================================
// INTEGRATIONS
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
    { name: 'QuickBooks', type: 'accounting', status: 'pending' },
    { name: 'HubSpot', type: 'crm', status: 'disconnected' },
  ];

  const integrationData = integrations.map((i, idx) => ({
    id: uuid('55000000', idx + 1),
    user_id: DEMO_USER_ID,
    name: i.name,
    type: i.type,
    status: i.status,
    connected_at: i.status === 'connected' ? daysAgo(Math.floor(Math.random() * 180)) : null,
    last_sync_at: i.status === 'connected' ? daysAgo(Math.floor(Math.random() * 7)) : null,
    created_at: daysAgo(Math.floor(Math.random() * 180)),
    updated_at: daysAgo(Math.floor(Math.random() * 7)),
  }));

  const { error } = await supabase.from('integrations').upsert(integrationData, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  integrations: ${error.message}`);
  } else {
    console.log(`   ✓ Created ${integrations.length} integrations`);
    const connected = integrations.filter(i => i.status === 'connected').length;
    console.log(`   📊 Connected: ${connected}/${integrations.length}`);
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================
async function main() {
  try {
    await seedChats();
    await seedMessages();
    await seedBookings();
    await seedContracts();
    await seedLeads();
    await seedAIConversations();
    await seedActivities();
    await seedRecurringRevenue();
    await seedIntegrations();

    console.log('\n' + '═'.repeat(60));
    console.log('\n🎉 ALL FEATURES SEEDED!\n');

    console.log('📊 DEMO USER DATA SUMMARY:');
    console.log('   👤 User: alex@freeflow.io');
    console.log('   🔑 Password: investor2026');
    console.log('');
    console.log('   ✓ Clients & Projects (from previous seeds)');
    console.log('   ✓ Invoices & Payments');
    console.log('   ✓ Time Tracking (944 hours)');
    console.log('   ✓ Calendar (177 events)');
    console.log('   ✓ Tasks (20 tasks)');
    console.log('   ✓ Files (15 documents)');
    console.log('   ✓ Messages & Chats');
    console.log('   ✓ Notifications (30)');
    console.log('   ✓ Expenses ($22K+)');
    console.log('   ✓ Bookings (25)');
    console.log('   ✓ Contracts (7)');
    console.log('   ✓ Leads (8)');
    console.log('   ✓ AI Conversations (10)');
    console.log('   ✓ Integrations (8)');
    console.log('');
    console.log('🔗 Test at: http://localhost:9323');
    console.log('   Login: alex@freeflow.io / investor2026\n');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
