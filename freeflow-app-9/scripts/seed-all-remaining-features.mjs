#!/usr/bin/env node

/**
 * Comprehensive Seed Script - All Remaining Features
 * Seeds demo data for investor showcase
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';
const uuid = (prefix, num) => {
  const prefixCodes = {
    'wallet': 'e1e1e1e1', 'cryptotx': 'e2e2e2e2', 'escrow': 'e3e3e3e3', 'escrowtx': 'e4e4e4e4',
    'paymethod': 'e5e5e5e5', 'paytx': 'e6e6e6e6', 'sub': 'e7e7e7e7', 'subplan': 'e8e8e8e8',
    'dailygoal': 'f1f1f1f1', 'dailytask': 'f2f2f2f2', 'focus': 'f3f3f3f3', 'habit': 'f4f4f4f4',
    'habitlog': 'f5f5f5f5', 'mood': 'f6f6f6f6', 'journal': 'f7f7f7f7', 'reminder': 'f8f8f8f8',
    'quicknote': 'f9f9f9f9', 'deal': 'd1d1d1d1', 'pipeline': 'd2d2d2d2', 'contact': 'd3d3d3d3',
    'campaign': 'd4d4d4d4', 'emailtpl': 'd5d5d5d5', 'product': 'd6d6d6d6', 'order': 'd7d7d7d7',
    'course': 'd8d8d8d8', 'module': 'd9d9d9d9', 'lesson': 'dadadada', 'enroll': 'dbdbdbdb',
    'webinar': 'dcdcdcdc', 'survey': 'dddddddd', 'poll': 'dededede', 'feedback': 'dfdfdfdf',
    'review': 'e0e0e0e0', 'report': 'eeeeeeee', 'dashboard': 'efefefef', 'metric': 'f0f0f0f0',
    'kpi': 'fafafafa', 'goal': 'fbfbfbfb', 'okr': 'fcfcfcfc', 'milestone': 'fdfdfdfd',
    'sprint': 'fefefefe', 'template': 'a0a0a0a0', 'automation': 'a1a1a1a1', 'article': 'a2a2a2a2',
    'faq': 'a3a3a3a3', 'gallery': 'a4a4a4a4', 'media': 'a5a5a5a5', 'voicenote': 'a6a6a6a6',
    'calllog': 'a7a7a7a7', 'recording': 'a8a8a8a8', 'broadcast': 'a9a9a9a9', 'meeting': 'ababab0b',
    'inventory': 'acacac0c', 'warehouse': 'adadadad', 'shipment': 'aeaeaeae', 'dept': 'afafafaf'
  };
  return `${prefixCodes[prefix] || 'ffffffff'}-0000-4000-8000-${String(num).padStart(12, '0')}`;
};

const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
const futureDate = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
const today = () => new Date().toISOString().split('T')[0];

async function seedCryptoPayments() {
  console.log('\n--- Seeding Crypto & Payments ---\n');
  let count = 0;

  // Crypto Wallets
  const wallets = [
    { name: 'Bitcoin Wallet', currency: 'BTC', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', balance: 0.5234, network: 'mainnet' },
    { name: 'Ethereum Wallet', currency: 'ETH', address: '0x742d35Cc6634C0532925a3b844Bc9e7595f8a2B1', balance: 3.2145, network: 'mainnet' },
    { name: 'USDC Wallet', currency: 'USDC', address: '0x8A3F5E96d3C1B6e0F9F4E8E2D1F2B3A4C5D6E7F8', balance: 15000.00, network: 'ethereum' },
    { name: 'Solana Wallet', currency: 'SOL', address: '7cVfgArCheMR6Cs4t6vz5rfnqd3fj8WX3GQZuM6TbNPr', balance: 125.50, network: 'mainnet' }
  ].map((w, i) => ({ id: uuid('wallet', i + 1), user_id: DEMO_USER_ID, ...w, is_primary: i === 0, created_at: daysAgo(180) }));

  const { error: walletErr } = await supabase.from('crypto_wallets').upsert(wallets, { onConflict: 'id' });
  if (!walletErr) { console.log(`Created ${wallets.length} crypto wallets`); count += wallets.length; }
  else console.log('Wallet error:', walletErr.message);

  // Crypto Transactions
  const cryptoTx = [];
  for (let i = 0; i < 25; i++) {
    cryptoTx.push({
      id: uuid('cryptotx', i + 1),
      user_id: DEMO_USER_ID,
      wallet_id: wallets[i % 4].id,
      type: ['deposit', 'withdrawal', 'payment', 'received'][i % 4],
      amount: (Math.random() * 1000 + 50).toFixed(2),
      currency: wallets[i % 4].currency,
      status: ['completed', 'completed', 'completed', 'pending'][i % 4],
      tx_hash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
      description: ['Client payment', 'Withdrawal to bank', 'Subscription payment', 'Project milestone'][i % 4],
      created_at: daysAgo(i * 3)
    });
  }
  const { error: txErr } = await supabase.from('crypto_transactions').upsert(cryptoTx, { onConflict: 'id' });
  if (!txErr) { console.log(`Created ${cryptoTx.length} crypto transactions`); count += cryptoTx.length; }
  else console.log('Crypto tx error:', txErr.message);

  // Escrow Accounts
  const escrows = [
    { title: 'Website Redesign Project', client_name: 'TechCorp Inc', amount: 15000, currency: 'USD', status: 'active', release_conditions: 'Upon project completion and client approval' },
    { title: 'Mobile App Development', client_name: 'StartupXYZ', amount: 25000, currency: 'USD', status: 'active', release_conditions: 'Milestone-based: 40% upfront, 30% at beta, 30% at launch' },
    { title: 'API Integration Project', client_name: 'Enterprise Solutions', amount: 8500, currency: 'USD', status: 'released', release_conditions: 'Completed and approved' },
    { title: 'Brand Identity Design', client_name: 'Fashion Forward', amount: 5000, currency: 'USD', status: 'pending', release_conditions: 'Awaiting client deposit' }
  ].map((e, i) => ({ id: uuid('escrow', i + 1), user_id: DEMO_USER_ID, ...e, created_at: daysAgo(60 - i * 15) }));

  const { error: escrowErr } = await supabase.from('escrow_accounts').upsert(escrows, { onConflict: 'id' });
  if (!escrowErr) { console.log(`Created ${escrows.length} escrow accounts`); count += escrows.length; }
  else console.log('Escrow error:', escrowErr.message);

  // Payment Methods
  const payMethods = [
    { type: 'credit_card', name: 'Visa ending in 4242', last_four: '4242', brand: 'visa', is_default: true, exp_month: 12, exp_year: 2027 },
    { type: 'bank_account', name: 'Chase Business Checking', last_four: '6789', bank_name: 'Chase', is_default: false },
    { type: 'paypal', name: 'PayPal - alex@freeflow.io', email: 'alex@freeflow.io', is_default: false },
    { type: 'crypto', name: 'Bitcoin Wallet', wallet_address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', is_default: false }
  ].map((p, i) => ({ id: uuid('paymethod', i + 1), user_id: DEMO_USER_ID, ...p, created_at: daysAgo(200) }));

  const { error: payErr } = await supabase.from('payment_methods').upsert(payMethods, { onConflict: 'id' });
  if (!payErr) { console.log(`Created ${payMethods.length} payment methods`); count += payMethods.length; }
  else console.log('Payment method error:', payErr.message);

  // Subscriptions
  const subs = [
    { plan_name: 'FreeFlow Pro', status: 'active', amount: 29, currency: 'USD', interval: 'month', current_period_start: daysAgo(15), current_period_end: futureDate(15) },
    { plan_name: 'Cloud Storage Plus', status: 'active', amount: 9.99, currency: 'USD', interval: 'month', current_period_start: daysAgo(10), current_period_end: futureDate(20) },
    { plan_name: 'Design Tools Suite', status: 'canceled', amount: 49, currency: 'USD', interval: 'month', canceled_at: daysAgo(30) }
  ].map((s, i) => ({ id: uuid('sub', i + 1), user_id: DEMO_USER_ID, ...s, created_at: daysAgo(180) }));

  const { error: subErr } = await supabase.from('subscriptions').upsert(subs, { onConflict: 'id' });
  if (!subErr) { console.log(`Created ${subs.length} subscriptions`); count += subs.length; }
  else console.log('Subscription error:', subErr.message);

  return count;
}

async function seedMyDay() {
  console.log('\n--- Seeding My Day Features ---\n');
  let count = 0;

  // Daily Goals
  const dailyGoals = [
    { title: 'Complete 4 deep work sessions', target: 4, current: 3, category: 'productivity', priority: 'high' },
    { title: 'Review and respond to all client emails', target: 1, current: 1, category: 'communication', priority: 'high' },
    { title: 'Ship the new feature branch', target: 1, current: 0, category: 'development', priority: 'critical' },
    { title: 'Exercise for 30 minutes', target: 30, current: 30, category: 'health', priority: 'medium' },
    { title: 'Read 20 pages of tech book', target: 20, current: 15, category: 'learning', priority: 'low' }
  ].map((g, i) => ({ id: uuid('dailygoal', i + 1), user_id: DEMO_USER_ID, ...g, date: today(), is_completed: g.current >= g.target, created_at: daysAgo(0) }));

  const { error: goalErr } = await supabase.from('daily_goals').upsert(dailyGoals, { onConflict: 'id' });
  if (!goalErr) { console.log(`Created ${dailyGoals.length} daily goals`); count += dailyGoals.length; }
  else console.log('Daily goals error:', goalErr.message);

  // Focus Sessions
  const focusSessions = [];
  for (let i = 0; i < 30; i++) {
    focusSessions.push({
      id: uuid('focus', i + 1),
      user_id: DEMO_USER_ID,
      title: ['Deep coding session', 'Design review', 'Client call prep', 'Documentation', 'Code review'][i % 5],
      duration_minutes: [25, 50, 25, 50, 25][i % 5],
      actual_minutes: [25, 48, 25, 45, 22][i % 5],
      category: ['development', 'design', 'communication', 'documentation', 'review'][i % 5],
      is_completed: true,
      distractions: Math.floor(Math.random() * 3),
      notes: 'Productive session with good flow state.',
      created_at: daysAgo(Math.floor(i / 5))
    });
  }
  const { error: focusErr } = await supabase.from('focus_sessions').upsert(focusSessions, { onConflict: 'id' });
  if (!focusErr) { console.log(`Created ${focusSessions.length} focus sessions`); count += focusSessions.length; }
  else console.log('Focus sessions error:', focusErr.message);

  // Habits
  const habits = [
    { name: 'Morning meditation', frequency: 'daily', target: 1, streak: 45, best_streak: 60, category: 'wellness', time_of_day: 'morning' },
    { name: 'Exercise', frequency: 'daily', target: 1, streak: 30, best_streak: 45, category: 'health', time_of_day: 'morning' },
    { name: 'Read technical articles', frequency: 'daily', target: 3, streak: 22, best_streak: 30, category: 'learning', time_of_day: 'evening' },
    { name: 'Code review', frequency: 'daily', target: 2, streak: 15, best_streak: 20, category: 'work', time_of_day: 'afternoon' },
    { name: 'Journal', frequency: 'daily', target: 1, streak: 60, best_streak: 90, category: 'wellness', time_of_day: 'evening' },
    { name: 'Network on LinkedIn', frequency: 'weekly', target: 3, streak: 8, best_streak: 12, category: 'networking', time_of_day: 'afternoon' }
  ].map((h, i) => ({ id: uuid('habit', i + 1), user_id: DEMO_USER_ID, ...h, is_active: true, created_at: daysAgo(180) }));

  const { error: habitErr } = await supabase.from('habits').upsert(habits, { onConflict: 'id' });
  if (!habitErr) { console.log(`Created ${habits.length} habits`); count += habits.length; }
  else console.log('Habits error:', habitErr.message);

  // Habit Logs
  const habitLogs = [];
  for (let h = 0; h < habits.length; h++) {
    for (let d = 0; d < 30; d++) {
      habitLogs.push({
        id: uuid('habitlog', h * 30 + d),
        user_id: DEMO_USER_ID,
        habit_id: habits[h].id,
        completed: Math.random() > 0.15,
        date: daysAgo(d).split('T')[0],
        notes: d === 0 ? 'Great session today!' : null,
        created_at: daysAgo(d)
      });
    }
  }
  const { error: logErr } = await supabase.from('habit_logs').upsert(habitLogs, { onConflict: 'id' });
  if (!logErr) { console.log(`Created ${habitLogs.length} habit logs`); count += habitLogs.length; }
  else console.log('Habit logs error:', logErr.message);

  // Mood Logs
  const moods = ['great', 'good', 'okay', 'stressed', 'tired'];
  const moodLogs = [];
  for (let i = 0; i < 60; i++) {
    moodLogs.push({
      id: uuid('mood', i + 1),
      user_id: DEMO_USER_ID,
      mood: moods[Math.floor(Math.random() * 5)],
      energy_level: Math.floor(Math.random() * 5) + 1,
      notes: i % 5 === 0 ? 'Feeling productive today!' : null,
      factors: ['sleep', 'exercise', 'work', 'social'].slice(0, Math.floor(Math.random() * 3) + 1),
      date: daysAgo(i).split('T')[0],
      created_at: daysAgo(i)
    });
  }
  const { error: moodErr } = await supabase.from('mood_logs').upsert(moodLogs, { onConflict: 'id' });
  if (!moodErr) { console.log(`Created ${moodLogs.length} mood logs`); count += moodLogs.length; }
  else console.log('Mood logs error:', moodErr.message);

  // Journal Entries
  const journalEntries = [
    { title: 'Reflecting on Q4 Goals', content: 'Made significant progress on the FreeFlow platform. The new AI features are getting great feedback from beta users. Need to focus more on marketing in the coming weeks.', mood: 'good', tags: ['reflection', 'goals', 'work'] },
    { title: 'Product Launch Success', content: 'Launched the new invoicing feature today. Already seeing 20% increase in user engagement. The team did an amazing job pulling this together.', mood: 'great', tags: ['launch', 'success', 'team'] },
    { title: 'Lessons from Failed Pitch', content: 'The investor meeting didn\'t go as planned. Key learnings: need to focus more on unit economics and show clearer path to profitability. Back to the drawing board.', mood: 'okay', tags: ['learning', 'investor', 'growth'] },
    { title: 'Gratitude List', content: '1. Amazing team that believes in the vision. 2. Growing user base. 3. Health and energy to pursue this dream. 4. Supportive family and friends.', mood: 'great', tags: ['gratitude', 'positivity'] },
    { title: 'Technical Deep Dive', content: 'Spent the day optimizing database queries. Reduced average response time by 40%. Sometimes the unglamorous work makes the biggest impact.', mood: 'good', tags: ['technical', 'optimization', 'backend'] }
  ].map((j, i) => ({ id: uuid('journal', i + 1), user_id: DEMO_USER_ID, ...j, is_private: true, created_at: daysAgo(i * 5) }));

  const { error: journalErr } = await supabase.from('journal_entries').upsert(journalEntries, { onConflict: 'id' });
  if (!journalErr) { console.log(`Created ${journalEntries.length} journal entries`); count += journalEntries.length; }
  else console.log('Journal error:', journalErr.message);

  // Reminders
  const reminders = [
    { title: 'Submit quarterly taxes', due_date: futureDate(15), priority: 'high', category: 'finance', is_recurring: true, recurrence: 'quarterly' },
    { title: 'Renew domain registration', due_date: futureDate(30), priority: 'medium', category: 'admin', is_recurring: true, recurrence: 'yearly' },
    { title: 'Team performance reviews', due_date: futureDate(7), priority: 'high', category: 'management', is_recurring: true, recurrence: 'quarterly' },
    { title: 'Update portfolio website', due_date: futureDate(14), priority: 'low', category: 'personal', is_recurring: false },
    { title: 'Client check-in call', due_date: futureDate(2), priority: 'high', category: 'client', is_recurring: true, recurrence: 'weekly' },
    { title: 'Backup all project files', due_date: futureDate(1), priority: 'medium', category: 'admin', is_recurring: true, recurrence: 'weekly' }
  ].map((r, i) => ({ id: uuid('reminder', i + 1), user_id: DEMO_USER_ID, ...r, is_completed: false, created_at: daysAgo(30) }));

  const { error: reminderErr } = await supabase.from('reminders').upsert(reminders, { onConflict: 'id' });
  if (!reminderErr) { console.log(`Created ${reminders.length} reminders`); count += reminders.length; }
  else console.log('Reminders error:', reminderErr.message);

  // Quick Notes
  const quickNotes = [
    { content: 'API rate limit: 1000 requests/minute', category: 'technical', is_pinned: true },
    { content: 'Client prefers Slack over email', category: 'client', is_pinned: false },
    { content: 'Meeting room code: 4521#', category: 'admin', is_pinned: true },
    { content: 'Design system colors: #3B82F6, #10B981, #F59E0B', category: 'design', is_pinned: true },
    { content: 'Book recommendation from Sarah: "The Lean Startup"', category: 'personal', is_pinned: false },
    { content: 'SSH key location: ~/.ssh/id_ed25519', category: 'technical', is_pinned: true },
    { content: 'Invoice NET 30 for enterprise clients', category: 'finance', is_pinned: false },
    { content: 'Staging server: staging.freeflow.io', category: 'technical', is_pinned: true }
  ].map((n, i) => ({ id: uuid('quicknote', i + 1), user_id: DEMO_USER_ID, ...n, created_at: daysAgo(i * 3) }));

  const { error: noteErr } = await supabase.from('quick_notes').upsert(quickNotes, { onConflict: 'id' });
  if (!noteErr) { console.log(`Created ${quickNotes.length} quick notes`); count += quickNotes.length; }
  else console.log('Quick notes error:', noteErr.message);

  return count;
}

async function seedCRMSales() {
  console.log('\n--- Seeding CRM & Sales ---\n');
  let count = 0;

  // Pipelines
  const pipelines = [
    { name: 'Main Sales Pipeline', stages: ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'], is_default: true },
    { name: 'Enterprise Pipeline', stages: ['Initial Contact', 'Discovery', 'Solution Design', 'Proof of Concept', 'Contract', 'Closed'], is_default: false },
    { name: 'Upsell Pipeline', stages: ['Identified', 'Pitched', 'Reviewing', 'Approved', 'Implemented'], is_default: false }
  ].map((p, i) => ({ id: uuid('pipeline', i + 1), user_id: DEMO_USER_ID, ...p, created_at: daysAgo(180) }));

  const { error: pipeErr } = await supabase.from('pipelines').upsert(pipelines, { onConflict: 'id' });
  if (!pipeErr) { console.log(`Created ${pipelines.length} pipelines`); count += pipelines.length; }
  else console.log('Pipeline error:', pipeErr.message);

  // Deals
  const deals = [
    { name: 'TechCorp Website Redesign', value: 45000, stage: 'Proposal', probability: 60, expected_close: futureDate(30), company: 'TechCorp Inc' },
    { name: 'StartupXYZ Mobile App', value: 85000, stage: 'Negotiation', probability: 80, expected_close: futureDate(14), company: 'StartupXYZ' },
    { name: 'Enterprise Analytics Dashboard', value: 120000, stage: 'Discovery', probability: 30, expected_close: futureDate(60), company: 'BigCorp Ltd' },
    { name: 'E-commerce Platform Migration', value: 65000, stage: 'Qualified', probability: 40, expected_close: futureDate(45), company: 'RetailMax' },
    { name: 'AI Chatbot Integration', value: 35000, stage: 'Closed Won', probability: 100, expected_close: daysAgo(5), company: 'ServicePro' },
    { name: 'Cloud Infrastructure Setup', value: 28000, stage: 'Proposal', probability: 55, expected_close: futureDate(21), company: 'CloudFirst Inc' },
    { name: 'CRM System Customization', value: 18000, stage: 'Closed Won', probability: 100, expected_close: daysAgo(15), company: 'SalesForce Plus' },
    { name: 'Data Pipeline Architecture', value: 95000, stage: 'Solution Design', probability: 45, expected_close: futureDate(75), company: 'DataDriven Co' }
  ].map((d, i) => ({ id: uuid('deal', i + 1), user_id: DEMO_USER_ID, pipeline_id: pipelines[i % 3].id, ...d, created_at: daysAgo(90 - i * 10) }));

  const { error: dealErr } = await supabase.from('deals').upsert(deals, { onConflict: 'id' });
  if (!dealErr) { console.log(`Created ${deals.length} deals`); count += deals.length; }
  else console.log('Deals error:', dealErr.message);

  // Contacts
  const contacts = [
    { first_name: 'Jennifer', last_name: 'Williams', email: 'jennifer@techcorp.com', phone: '+1-555-0101', company: 'TechCorp Inc', title: 'CTO', source: 'referral' },
    { first_name: 'Michael', last_name: 'Chen', email: 'michael@startupxyz.io', phone: '+1-555-0102', company: 'StartupXYZ', title: 'CEO', source: 'linkedin' },
    { first_name: 'Sarah', last_name: 'Johnson', email: 'sarah@bigcorp.com', phone: '+1-555-0103', company: 'BigCorp Ltd', title: 'VP Engineering', source: 'conference' },
    { first_name: 'David', last_name: 'Kim', email: 'david@retailmax.com', phone: '+1-555-0104', company: 'RetailMax', title: 'Head of Digital', source: 'cold_outreach' },
    { first_name: 'Emily', last_name: 'Brown', email: 'emily@servicepro.io', phone: '+1-555-0105', company: 'ServicePro', title: 'Product Manager', source: 'website' },
    { first_name: 'James', last_name: 'Wilson', email: 'james@cloudfirst.com', phone: '+1-555-0106', company: 'CloudFirst Inc', title: 'Director IT', source: 'referral' },
    { first_name: 'Lisa', last_name: 'Martinez', email: 'lisa@salesforceplus.com', phone: '+1-555-0107', company: 'SalesForce Plus', title: 'Operations Lead', source: 'partner' },
    { first_name: 'Robert', last_name: 'Taylor', email: 'robert@datadriven.co', phone: '+1-555-0108', company: 'DataDriven Co', title: 'Chief Data Officer', source: 'webinar' }
  ].map((c, i) => ({ id: uuid('contact', i + 1), user_id: DEMO_USER_ID, ...c, status: 'active', last_contact: daysAgo(i * 3), created_at: daysAgo(120 - i * 10) }));

  const { error: contactErr } = await supabase.from('contacts').upsert(contacts, { onConflict: 'id' });
  if (!contactErr) { console.log(`Created ${contacts.length} contacts`); count += contacts.length; }
  else console.log('Contacts error:', contactErr.message);

  // Campaigns
  const campaigns = [
    { name: 'Q1 Product Launch', type: 'email', status: 'completed', budget: 5000, spent: 4850, leads_generated: 145, conversions: 23 },
    { name: 'LinkedIn Ads - Enterprise', type: 'social', status: 'active', budget: 10000, spent: 6500, leads_generated: 89, conversions: 12 },
    { name: 'Webinar Series - AI Tools', type: 'webinar', status: 'active', budget: 2000, spent: 1200, leads_generated: 234, conversions: 45 },
    { name: 'Content Marketing - Blog', type: 'content', status: 'active', budget: 3000, spent: 2100, leads_generated: 312, conversions: 28 },
    { name: 'Referral Program', type: 'referral', status: 'active', budget: 8000, spent: 5600, leads_generated: 67, conversions: 34 }
  ].map((c, i) => ({ id: uuid('campaign', i + 1), user_id: DEMO_USER_ID, ...c, start_date: daysAgo(90 - i * 15), end_date: i === 0 ? daysAgo(30) : futureDate(30 + i * 15), created_at: daysAgo(100 - i * 15) }));

  const { error: campErr } = await supabase.from('campaigns').upsert(campaigns, { onConflict: 'id' });
  if (!campErr) { console.log(`Created ${campaigns.length} campaigns`); count += campaigns.length; }
  else console.log('Campaigns error:', campErr.message);

  // Email Templates
  const emailTemplates = [
    { name: 'Welcome Email', subject: 'Welcome to FreeFlow!', body: 'Hi {{first_name}},\n\nWelcome to FreeFlow! We\'re excited to have you on board.\n\nBest,\nAlex', category: 'onboarding' },
    { name: 'Proposal Follow-up', subject: 'Following up on our proposal', body: 'Hi {{first_name}},\n\nI wanted to follow up on the proposal we sent last week. Do you have any questions?\n\nBest,\nAlex', category: 'sales' },
    { name: 'Invoice Reminder', subject: 'Friendly reminder: Invoice #{{invoice_number}}', body: 'Hi {{first_name}},\n\nThis is a friendly reminder that invoice #{{invoice_number}} is due on {{due_date}}.\n\nBest,\nAlex', category: 'billing' },
    { name: 'Project Kickoff', subject: 'Let\'s get started on {{project_name}}!', body: 'Hi {{first_name}},\n\nI\'m excited to kick off {{project_name}}! Let\'s schedule our first meeting.\n\nBest,\nAlex', category: 'project' },
    { name: 'Monthly Newsletter', subject: 'FreeFlow Monthly Update - {{month}}', body: 'Hi {{first_name}},\n\nHere\'s what\'s new this month at FreeFlow...\n\nBest,\nThe FreeFlow Team', category: 'marketing' }
  ].map((t, i) => ({ id: uuid('emailtpl', i + 1), user_id: DEMO_USER_ID, ...t, is_active: true, usage_count: Math.floor(Math.random() * 50) + 10, created_at: daysAgo(180) }));

  const { error: tplErr } = await supabase.from('email_templates').upsert(emailTemplates, { onConflict: 'id' });
  if (!tplErr) { console.log(`Created ${emailTemplates.length} email templates`); count += emailTemplates.length; }
  else console.log('Email templates error:', tplErr.message);

  return count;
}

async function seedProductsOrders() {
  console.log('\n--- Seeding Products & Orders ---\n');
  let count = 0;

  // Products
  const products = [
    { name: 'Website Design Package', description: 'Complete website design with 5 pages', price: 2500, category: 'design', sku: 'WDP-001', stock: 999, is_digital: true },
    { name: 'Logo Design', description: 'Professional logo design with 3 concepts', price: 500, category: 'design', sku: 'LD-001', stock: 999, is_digital: true },
    { name: 'Monthly Retainer - Basic', description: '10 hours of development per month', price: 1500, category: 'service', sku: 'RET-BASIC', stock: 999, is_digital: true },
    { name: 'Monthly Retainer - Pro', description: '25 hours of development per month', price: 3500, category: 'service', sku: 'RET-PRO', stock: 999, is_digital: true },
    { name: 'SEO Audit', description: 'Comprehensive SEO audit with recommendations', price: 750, category: 'marketing', sku: 'SEO-001', stock: 999, is_digital: true },
    { name: 'API Integration', description: 'Custom API integration service', price: 1200, category: 'development', sku: 'API-001', stock: 999, is_digital: true },
    { name: 'Mobile App Template', description: 'React Native app template', price: 299, category: 'template', sku: 'MAT-001', stock: 999, is_digital: true },
    { name: 'E-commerce Starter Kit', description: 'Complete e-commerce solution', price: 4500, category: 'development', sku: 'ECK-001', stock: 999, is_digital: true }
  ].map((p, i) => ({ id: uuid('product', i + 1), user_id: DEMO_USER_ID, ...p, is_active: true, created_at: daysAgo(180) }));

  const { error: prodErr } = await supabase.from('products').upsert(products, { onConflict: 'id' });
  if (!prodErr) { console.log(`Created ${products.length} products`); count += products.length; }
  else console.log('Products error:', prodErr.message);

  // Orders
  const orders = [];
  for (let i = 0; i < 20; i++) {
    const product = products[i % products.length];
    orders.push({
      id: uuid('order', i + 1),
      user_id: DEMO_USER_ID,
      customer_email: `customer${i + 1}@example.com`,
      customer_name: `Customer ${i + 1}`,
      status: ['completed', 'completed', 'completed', 'processing', 'pending'][i % 5],
      total: product.price * (1 + (i % 3)),
      currency: 'USD',
      items: [{ product_id: product.id, name: product.name, quantity: 1 + (i % 3), price: product.price }],
      payment_status: i % 5 < 3 ? 'paid' : 'pending',
      created_at: daysAgo(i * 4)
    });
  }
  const { error: orderErr } = await supabase.from('orders').upsert(orders, { onConflict: 'id' });
  if (!orderErr) { console.log(`Created ${orders.length} orders`); count += orders.length; }
  else console.log('Orders error:', orderErr.message);

  return count;
}

async function seedCoursesLearning() {
  console.log('\n--- Seeding Courses & Learning ---\n');
  let count = 0;

  // Courses
  const courses = [
    { title: 'React Mastery', description: 'Complete guide to React development', category: 'development', level: 'intermediate', duration_hours: 20, price: 199, is_published: true, enrolled_count: 1247 },
    { title: 'Node.js Backend Development', description: 'Build scalable backend APIs', category: 'development', level: 'intermediate', duration_hours: 25, price: 249, is_published: true, enrolled_count: 892 },
    { title: 'Freelancing 101', description: 'Start your freelance career', category: 'business', level: 'beginner', duration_hours: 8, price: 99, is_published: true, enrolled_count: 2341 },
    { title: 'Advanced TypeScript', description: 'Master TypeScript patterns', category: 'development', level: 'advanced', duration_hours: 15, price: 179, is_published: true, enrolled_count: 567 },
    { title: 'UI/UX Design Fundamentals', description: 'Design beautiful interfaces', category: 'design', level: 'beginner', duration_hours: 12, price: 149, is_published: true, enrolled_count: 1823 }
  ].map((c, i) => ({ id: uuid('course', i + 1), user_id: DEMO_USER_ID, instructor_name: 'Alex Rivera', ...c, rating: 4.5 + Math.random() * 0.5, created_at: daysAgo(180 - i * 30) }));

  const { error: courseErr } = await supabase.from('courses').upsert(courses, { onConflict: 'id' });
  if (!courseErr) { console.log(`Created ${courses.length} courses`); count += courses.length; }
  else console.log('Courses error:', courseErr.message);

  // Webinars
  const webinars = [
    { title: 'Building SaaS Products', description: 'Learn to build and scale SaaS', scheduled_at: futureDate(7), duration_minutes: 90, max_attendees: 500, registered_count: 234, status: 'scheduled' },
    { title: 'Freelance Pricing Strategies', description: 'How to price your services', scheduled_at: futureDate(14), duration_minutes: 60, max_attendees: 1000, registered_count: 456, status: 'scheduled' },
    { title: 'AI for Developers', description: 'Integrate AI into your apps', scheduled_at: daysAgo(7), duration_minutes: 120, max_attendees: 300, registered_count: 289, status: 'completed' },
    { title: 'Remote Team Management', description: 'Lead distributed teams effectively', scheduled_at: futureDate(21), duration_minutes: 75, max_attendees: 200, registered_count: 123, status: 'scheduled' }
  ].map((w, i) => ({ id: uuid('webinar', i + 1), user_id: DEMO_USER_ID, host_name: 'Alex Rivera', ...w, is_free: i % 2 === 0, price: i % 2 === 0 ? 0 : 49, created_at: daysAgo(60) }));

  const { error: webErr } = await supabase.from('webinars').upsert(webinars, { onConflict: 'id' });
  if (!webErr) { console.log(`Created ${webinars.length} webinars`); count += webinars.length; }
  else console.log('Webinars error:', webErr.message);

  return count;
}

async function seedSurveysFeedback() {
  console.log('\n--- Seeding Surveys & Feedback ---\n');
  let count = 0;

  // Surveys
  const surveys = [
    { title: 'Customer Satisfaction Survey', description: 'Help us improve our services', status: 'active', responses_count: 156, questions_count: 10, category: 'customer' },
    { title: 'Feature Request Survey', description: 'What features would you like to see?', status: 'active', responses_count: 89, questions_count: 5, category: 'product' },
    { title: 'Onboarding Experience', description: 'Rate your onboarding experience', status: 'completed', responses_count: 234, questions_count: 8, category: 'onboarding' },
    { title: 'Annual User Survey 2024', description: 'Annual comprehensive user feedback', status: 'draft', responses_count: 0, questions_count: 15, category: 'annual' }
  ].map((s, i) => ({ id: uuid('survey', i + 1), user_id: DEMO_USER_ID, ...s, created_at: daysAgo(90 - i * 20) }));

  const { error: surveyErr } = await supabase.from('surveys').upsert(surveys, { onConflict: 'id' });
  if (!surveyErr) { console.log(`Created ${surveys.length} surveys`); count += surveys.length; }
  else console.log('Surveys error:', surveyErr.message);

  // Polls
  const polls = [
    { question: 'What new feature should we build next?', options: ['Dark mode', 'Mobile app', 'API access', 'Team collaboration'], votes: [45, 78, 32, 56], status: 'active' },
    { question: 'Preferred communication method?', options: ['Email', 'Slack', 'In-app chat', 'Video call'], votes: [89, 67, 45, 23], status: 'active' },
    { question: 'Best time for webinars?', options: ['Morning (9-12)', 'Afternoon (1-4)', 'Evening (5-8)', 'Weekend'], votes: [34, 56, 78, 21], status: 'completed' }
  ].map((p, i) => ({ id: uuid('poll', i + 1), user_id: DEMO_USER_ID, ...p, total_votes: p.votes.reduce((a, b) => a + b, 0), created_at: daysAgo(30 - i * 10) }));

  const { error: pollErr } = await supabase.from('polls').upsert(polls, { onConflict: 'id' });
  if (!pollErr) { console.log(`Created ${polls.length} polls`); count += polls.length; }
  else console.log('Polls error:', pollErr.message);

  // Feedback
  const feedbackItems = [];
  for (let i = 0; i < 20; i++) {
    feedbackItems.push({
      id: uuid('feedback', i + 1),
      user_id: DEMO_USER_ID,
      type: ['bug', 'feature', 'improvement', 'praise', 'complaint'][i % 5],
      title: `Feedback item ${i + 1}`,
      description: `Detailed feedback description for item ${i + 1}`,
      status: ['new', 'in_review', 'planned', 'completed', 'declined'][i % 5],
      priority: ['low', 'medium', 'high'][i % 3],
      votes: Math.floor(Math.random() * 50),
      created_at: daysAgo(i * 3)
    });
  }
  const { error: fbErr } = await supabase.from('feedback').upsert(feedbackItems, { onConflict: 'id' });
  if (!fbErr) { console.log(`Created ${feedbackItems.length} feedback items`); count += feedbackItems.length; }
  else console.log('Feedback error:', fbErr.message);

  // Reviews
  const reviews = [];
  for (let i = 0; i < 15; i++) {
    reviews.push({
      id: uuid('review', i + 1),
      user_id: DEMO_USER_ID,
      reviewer_name: `Reviewer ${i + 1}`,
      reviewer_email: `reviewer${i + 1}@example.com`,
      rating: Math.floor(Math.random() * 2) + 4,
      title: ['Great service!', 'Highly recommended', 'Professional work', 'Excellent communication', 'Will hire again'][i % 5],
      content: `Detailed review content for review ${i + 1}. Very satisfied with the work.`,
      is_verified: Math.random() > 0.3,
      is_featured: i < 3,
      created_at: daysAgo(i * 5)
    });
  }
  const { error: revErr } = await supabase.from('reviews').upsert(reviews, { onConflict: 'id' });
  if (!revErr) { console.log(`Created ${reviews.length} reviews`); count += reviews.length; }
  else console.log('Reviews error:', revErr.message);

  return count;
}

async function seedGoalsOKRs() {
  console.log('\n--- Seeding Goals & OKRs ---\n');
  let count = 0;

  // Goals
  const goals = [
    { title: 'Reach $500K ARR', description: 'Grow annual recurring revenue to $500,000', category: 'revenue', target_value: 500000, current_value: 250000, unit: 'USD', deadline: futureDate(180), status: 'on_track' },
    { title: 'Acquire 10,000 users', description: 'Grow user base to 10,000 active users', category: 'growth', target_value: 10000, current_value: 5234, unit: 'users', deadline: futureDate(120), status: 'on_track' },
    { title: 'Launch mobile app', description: 'Release iOS and Android apps', category: 'product', target_value: 1, current_value: 0, unit: 'launch', deadline: futureDate(90), status: 'at_risk' },
    { title: 'Achieve 99.9% uptime', description: 'Maintain platform reliability', category: 'engineering', target_value: 99.9, current_value: 99.7, unit: 'percent', deadline: futureDate(30), status: 'on_track' },
    { title: 'Hire 5 engineers', description: 'Expand engineering team', category: 'hiring', target_value: 5, current_value: 2, unit: 'hires', deadline: futureDate(60), status: 'behind' }
  ].map((g, i) => ({ id: uuid('goal', i + 1), user_id: DEMO_USER_ID, ...g, progress: Math.round((g.current_value / g.target_value) * 100), created_at: daysAgo(90) }));

  const { error: goalErr } = await supabase.from('goals').upsert(goals, { onConflict: 'id' });
  if (!goalErr) { console.log(`Created ${goals.length} goals`); count += goals.length; }
  else console.log('Goals error:', goalErr.message);

  // Key Results (OKRs)
  const keyResults = [
    { objective: 'Increase revenue', key_result: 'Close 20 new enterprise deals', target: 20, current: 12, quarter: 'Q1 2024' },
    { objective: 'Increase revenue', key_result: 'Reduce churn to under 5%', target: 5, current: 6.2, quarter: 'Q1 2024' },
    { objective: 'Improve product', key_result: 'Release 10 new features', target: 10, current: 7, quarter: 'Q1 2024' },
    { objective: 'Improve product', key_result: 'Achieve NPS score of 50+', target: 50, current: 48, quarter: 'Q1 2024' },
    { objective: 'Build team', key_result: 'Hire 3 senior engineers', target: 3, current: 1, quarter: 'Q1 2024' },
    { objective: 'Build team', key_result: 'Complete leadership training', target: 1, current: 1, quarter: 'Q1 2024' }
  ].map((k, i) => ({ id: uuid('okr', i + 1), user_id: DEMO_USER_ID, ...k, progress: Math.round((k.current / k.target) * 100), status: k.current >= k.target ? 'achieved' : 'in_progress', created_at: daysAgo(60) }));

  const { error: okrErr } = await supabase.from('key_results').upsert(keyResults, { onConflict: 'id' });
  if (!okrErr) { console.log(`Created ${keyResults.length} key results`); count += keyResults.length; }
  else console.log('Key results error:', okrErr.message);

  // Milestones
  const milestones = [
    { title: 'MVP Launch', description: 'Launch minimum viable product', status: 'completed', due_date: daysAgo(365), completed_at: daysAgo(360) },
    { title: 'First 100 Users', description: 'Acquire first 100 paying users', status: 'completed', due_date: daysAgo(300), completed_at: daysAgo(290) },
    { title: 'Seed Funding', description: 'Close seed funding round', status: 'completed', due_date: daysAgo(200), completed_at: daysAgo(195) },
    { title: '$100K ARR', description: 'Reach $100K annual recurring revenue', status: 'completed', due_date: daysAgo(100), completed_at: daysAgo(95) },
    { title: 'Series A', description: 'Close Series A funding', status: 'in_progress', due_date: futureDate(90) },
    { title: '$1M ARR', description: 'Reach $1M annual recurring revenue', status: 'planned', due_date: futureDate(365) }
  ].map((m, i) => ({ id: uuid('milestone', i + 1), user_id: DEMO_USER_ID, ...m, created_at: daysAgo(400 - i * 50) }));

  const { error: mileErr } = await supabase.from('milestones').upsert(milestones, { onConflict: 'id' });
  if (!mileErr) { console.log(`Created ${milestones.length} milestones`); count += milestones.length; }
  else console.log('Milestones error:', mileErr.message);

  // Sprints
  const sprints = [
    { name: 'Sprint 24', goal: 'Complete payment integration', status: 'completed', start_date: daysAgo(28), end_date: daysAgo(14), velocity: 42, completed_points: 42 },
    { name: 'Sprint 25', goal: 'Launch dashboard redesign', status: 'completed', start_date: daysAgo(14), end_date: daysAgo(0), velocity: 38, completed_points: 35 },
    { name: 'Sprint 26', goal: 'Implement AI features', status: 'active', start_date: daysAgo(0), end_date: futureDate(14), velocity: 40, completed_points: 12 },
    { name: 'Sprint 27', goal: 'Mobile app beta', status: 'planned', start_date: futureDate(14), end_date: futureDate(28), velocity: 40, completed_points: 0 }
  ].map((s, i) => ({ id: uuid('sprint', i + 1), user_id: DEMO_USER_ID, ...s, total_points: 40 + i * 2, created_at: daysAgo(42 - i * 14) }));

  const { error: sprintErr } = await supabase.from('sprints').upsert(sprints, { onConflict: 'id' });
  if (!sprintErr) { console.log(`Created ${sprints.length} sprints`); count += sprints.length; }
  else console.log('Sprints error:', sprintErr.message);

  return count;
}

async function seedKnowledgeBase() {
  console.log('\n--- Seeding Knowledge Base ---\n');
  let count = 0;

  // Articles
  const articles = [
    { title: 'Getting Started Guide', content: 'Welcome to FreeFlow! This guide will help you get started...', category: 'onboarding', tags: ['beginner', 'setup', 'guide'], views: 5234 },
    { title: 'How to Create Your First Invoice', content: 'Creating invoices in FreeFlow is easy. Follow these steps...', category: 'billing', tags: ['invoice', 'billing', 'tutorial'], views: 3421 },
    { title: 'Time Tracking Best Practices', content: 'Maximize your productivity with these time tracking tips...', category: 'productivity', tags: ['time', 'tracking', 'tips'], views: 2890 },
    { title: 'Setting Up Integrations', content: 'Connect FreeFlow with your favorite tools...', category: 'integrations', tags: ['setup', 'integrations', 'api'], views: 1876 },
    { title: 'Managing Client Projects', content: 'Learn how to effectively manage multiple client projects...', category: 'projects', tags: ['projects', 'clients', 'management'], views: 2345 },
    { title: 'Understanding Analytics', content: 'Make data-driven decisions with FreeFlow analytics...', category: 'analytics', tags: ['analytics', 'reports', 'data'], views: 1567 }
  ].map((a, i) => ({ id: uuid('article', i + 1), user_id: DEMO_USER_ID, ...a, status: 'published', is_featured: i < 2, created_at: daysAgo(180 - i * 25) }));

  const { error: artErr } = await supabase.from('articles').upsert(articles, { onConflict: 'id' });
  if (!artErr) { console.log(`Created ${articles.length} articles`); count += articles.length; }
  else console.log('Articles error:', artErr.message);

  // FAQs
  const faqs = [
    { question: 'How do I reset my password?', answer: 'Click "Forgot Password" on the login page and follow the instructions.', category: 'account' },
    { question: 'What payment methods do you accept?', answer: 'We accept all major credit cards, PayPal, and cryptocurrency.', category: 'billing' },
    { question: 'Can I export my data?', answer: 'Yes, you can export all your data from Settings > Data Export.', category: 'data' },
    { question: 'How do I cancel my subscription?', answer: 'Go to Settings > Subscription and click "Cancel Subscription".', category: 'billing' },
    { question: 'Is my data secure?', answer: 'Yes, we use industry-standard encryption and security practices.', category: 'security' },
    { question: 'How do I contact support?', answer: 'Email us at support@freeflow.io or use the in-app chat.', category: 'support' },
    { question: 'Do you offer refunds?', answer: 'Yes, we offer a 30-day money-back guarantee.', category: 'billing' },
    { question: 'Can I use FreeFlow offline?', answer: 'The mobile app has limited offline functionality.', category: 'features' }
  ].map((f, i) => ({ id: uuid('faq', i + 1), user_id: DEMO_USER_ID, ...f, views: Math.floor(Math.random() * 1000) + 100, is_published: true, created_at: daysAgo(180) }));

  const { error: faqErr } = await supabase.from('faqs').upsert(faqs, { onConflict: 'id' });
  if (!faqErr) { console.log(`Created ${faqs.length} FAQs`); count += faqs.length; }
  else console.log('FAQs error:', faqErr.message);

  return count;
}

async function seedMediaGallery() {
  console.log('\n--- Seeding Media & Gallery ---\n');
  let count = 0;

  // Galleries
  const galleries = [
    { name: 'Portfolio Showcase', description: 'Featured project screenshots', item_count: 24, is_public: true },
    { name: 'Client Work 2024', description: 'Work completed for clients in 2024', item_count: 18, is_public: false },
    { name: 'Design Assets', description: 'Logos, icons, and design elements', item_count: 45, is_public: false },
    { name: 'Marketing Materials', description: 'Social media and marketing graphics', item_count: 32, is_public: true }
  ].map((g, i) => ({ id: uuid('gallery', i + 1), user_id: DEMO_USER_ID, ...g, cover_image: `https://source.unsplash.com/800x600/?design,${i}`, created_at: daysAgo(90 - i * 20) }));

  const { error: galErr } = await supabase.from('galleries').upsert(galleries, { onConflict: 'id' });
  if (!galErr) { console.log(`Created ${galleries.length} galleries`); count += galleries.length; }
  else console.log('Galleries error:', galErr.message);

  // Media Files
  const mediaFiles = [];
  for (let i = 0; i < 30; i++) {
    mediaFiles.push({
      id: uuid('media', i + 1),
      user_id: DEMO_USER_ID,
      gallery_id: galleries[i % 4].id,
      name: `File ${i + 1}`,
      type: ['image', 'image', 'video', 'document'][i % 4],
      url: `https://source.unsplash.com/800x600/?technology,${i}`,
      size: Math.floor(Math.random() * 5000000) + 100000,
      mime_type: ['image/jpeg', 'image/png', 'video/mp4', 'application/pdf'][i % 4],
      created_at: daysAgo(i * 2)
    });
  }
  const { error: mediaErr } = await supabase.from('media_files').upsert(mediaFiles, { onConflict: 'id' });
  if (!mediaErr) { console.log(`Created ${mediaFiles.length} media files`); count += mediaFiles.length; }
  else console.log('Media files error:', mediaErr.message);

  return count;
}

async function seedVoiceVideo() {
  console.log('\n--- Seeding Voice & Video ---\n');
  let count = 0;

  // Voice Notes
  const voiceNotes = [];
  for (let i = 0; i < 15; i++) {
    voiceNotes.push({
      id: uuid('voicenote', i + 1),
      user_id: DEMO_USER_ID,
      title: `Voice Note ${i + 1}`,
      duration_seconds: Math.floor(Math.random() * 300) + 30,
      transcript: i % 3 === 0 ? 'Transcription of the voice note content...' : null,
      tags: ['meeting', 'idea', 'reminder', 'note'][i % 4],
      created_at: daysAgo(i * 2)
    });
  }
  const { error: vnErr } = await supabase.from('voice_notes').upsert(voiceNotes, { onConflict: 'id' });
  if (!vnErr) { console.log(`Created ${voiceNotes.length} voice notes`); count += voiceNotes.length; }
  else console.log('Voice notes error:', vnErr.message);

  // Call Logs
  const callLogs = [];
  for (let i = 0; i < 25; i++) {
    callLogs.push({
      id: uuid('calllog', i + 1),
      user_id: DEMO_USER_ID,
      contact_name: `Contact ${i + 1}`,
      contact_email: `contact${i + 1}@example.com`,
      type: ['video', 'audio', 'video', 'audio'][i % 4],
      direction: ['outgoing', 'incoming'][i % 2],
      duration_seconds: Math.floor(Math.random() * 3600) + 60,
      status: ['completed', 'completed', 'missed', 'completed'][i % 4],
      notes: i % 3 === 0 ? 'Discussed project timeline and deliverables.' : null,
      created_at: daysAgo(i)
    });
  }
  const { error: clErr } = await supabase.from('call_logs').upsert(callLogs, { onConflict: 'id' });
  if (!clErr) { console.log(`Created ${callLogs.length} call logs`); count += callLogs.length; }
  else console.log('Call logs error:', clErr.message);

  // Recordings
  const recordings = [];
  for (let i = 0; i < 10; i++) {
    recordings.push({
      id: uuid('recording', i + 1),
      user_id: DEMO_USER_ID,
      call_id: callLogs[i].id,
      title: `Recording ${i + 1}`,
      duration_seconds: Math.floor(Math.random() * 3600) + 300,
      file_size: Math.floor(Math.random() * 100000000) + 5000000,
      transcript: i % 2 === 0 ? 'Full transcript of the call recording...' : null,
      created_at: daysAgo(i * 3)
    });
  }
  const { error: recErr } = await supabase.from('recordings').upsert(recordings, { onConflict: 'id' });
  if (!recErr) { console.log(`Created ${recordings.length} recordings`); count += recordings.length; }
  else console.log('Recordings error:', recErr.message);

  return count;
}

async function seedReportsDashboards() {
  console.log('\n--- Seeding Reports & Dashboards ---\n');
  let count = 0;

  // Reports
  const reports = [
    { name: 'Monthly Revenue Report', type: 'financial', description: 'Monthly revenue breakdown and trends', schedule: 'monthly', last_run: daysAgo(5) },
    { name: 'Client Activity Report', type: 'activity', description: 'Client engagement and activity metrics', schedule: 'weekly', last_run: daysAgo(2) },
    { name: 'Project Status Report', type: 'project', description: 'Overview of all active projects', schedule: 'weekly', last_run: daysAgo(3) },
    { name: 'Time Utilization Report', type: 'productivity', description: 'Time tracking and utilization analysis', schedule: 'weekly', last_run: daysAgo(1) },
    { name: 'Quarterly Business Review', type: 'executive', description: 'Comprehensive quarterly business metrics', schedule: 'quarterly', last_run: daysAgo(30) }
  ].map((r, i) => ({ id: uuid('report', i + 1), user_id: DEMO_USER_ID, ...r, is_automated: true, created_at: daysAgo(180) }));

  const { error: repErr } = await supabase.from('reports').upsert(reports, { onConflict: 'id' });
  if (!repErr) { console.log(`Created ${reports.length} reports`); count += reports.length; }
  else console.log('Reports error:', repErr.message);

  // Dashboards
  const dashboards = [
    { name: 'Executive Dashboard', description: 'High-level business metrics', layout: 'grid', is_default: true, widgets_count: 8 },
    { name: 'Sales Dashboard', description: 'Sales pipeline and performance', layout: 'grid', is_default: false, widgets_count: 6 },
    { name: 'Project Dashboard', description: 'Project progress and timelines', layout: 'list', is_default: false, widgets_count: 5 },
    { name: 'Financial Dashboard', description: 'Revenue, expenses, and cash flow', layout: 'grid', is_default: false, widgets_count: 7 }
  ].map((d, i) => ({ id: uuid('dashboard', i + 1), user_id: DEMO_USER_ID, ...d, is_public: false, created_at: daysAgo(90) }));

  const { error: dashErr } = await supabase.from('dashboards').upsert(dashboards, { onConflict: 'id' });
  if (!dashErr) { console.log(`Created ${dashboards.length} dashboards`); count += dashboards.length; }
  else console.log('Dashboards error:', dashErr.message);

  // KPIs
  const kpis = [
    { name: 'Monthly Recurring Revenue', value: 21500, target: 25000, unit: 'USD', trend: 'up', change_percent: 12.5, category: 'revenue' },
    { name: 'Customer Acquisition Cost', value: 145, target: 120, unit: 'USD', trend: 'down', change_percent: -8.2, category: 'marketing' },
    { name: 'Churn Rate', value: 4.2, target: 3.0, unit: 'percent', trend: 'down', change_percent: -15.0, category: 'retention' },
    { name: 'Net Promoter Score', value: 48, target: 50, unit: 'score', trend: 'up', change_percent: 6.7, category: 'satisfaction' },
    { name: 'Average Revenue Per User', value: 42, target: 50, unit: 'USD', trend: 'up', change_percent: 8.5, category: 'revenue' },
    { name: 'Customer Lifetime Value', value: 1850, target: 2000, unit: 'USD', trend: 'up', change_percent: 5.2, category: 'revenue' }
  ].map((k, i) => ({ id: uuid('kpi', i + 1), user_id: DEMO_USER_ID, ...k, period: 'monthly', updated_at: daysAgo(1), created_at: daysAgo(180) }));

  const { error: kpiErr } = await supabase.from('kpis').upsert(kpis, { onConflict: 'id' });
  if (!kpiErr) { console.log(`Created ${kpis.length} KPIs`); count += kpis.length; }
  else console.log('KPIs error:', kpiErr.message);

  // Metrics
  const metrics = [];
  for (let i = 0; i < 60; i++) {
    metrics.push({
      id: uuid('metric', i + 1),
      user_id: DEMO_USER_ID,
      name: ['revenue', 'users', 'sessions', 'conversions', 'page_views'][i % 5],
      value: Math.floor(Math.random() * 10000) + 1000,
      date: daysAgo(i).split('T')[0],
      created_at: daysAgo(i)
    });
  }
  const { error: metErr } = await supabase.from('metrics').upsert(metrics, { onConflict: 'id' });
  if (!metErr) { console.log(`Created ${metrics.length} metrics`); count += metrics.length; }
  else console.log('Metrics error:', metErr.message);

  return count;
}

async function seedTemplatesAutomations() {
  console.log('\n--- Seeding Templates & Automations ---\n');
  let count = 0;

  // Templates
  const templates = [
    { name: 'Standard Project Proposal', type: 'proposal', category: 'sales', content: 'Proposal template content...', usage_count: 45 },
    { name: 'Service Agreement', type: 'contract', category: 'legal', content: 'Contract template content...', usage_count: 32 },
    { name: 'Project Brief', type: 'document', category: 'project', content: 'Brief template content...', usage_count: 28 },
    { name: 'Weekly Status Update', type: 'email', category: 'communication', content: 'Status update template...', usage_count: 156 },
    { name: 'Invoice Template', type: 'invoice', category: 'billing', content: 'Invoice template content...', usage_count: 89 },
    { name: 'Meeting Notes', type: 'document', category: 'productivity', content: 'Meeting notes template...', usage_count: 67 }
  ].map((t, i) => ({ id: uuid('template', i + 1), user_id: DEMO_USER_ID, ...t, is_public: false, created_at: daysAgo(180) }));

  const { error: tplErr } = await supabase.from('templates').upsert(templates, { onConflict: 'id' });
  if (!tplErr) { console.log(`Created ${templates.length} templates`); count += templates.length; }
  else console.log('Templates error:', tplErr.message);

  // Automations
  const automations = [
    { name: 'Welcome Email on Signup', trigger: 'user_signup', action: 'send_email', status: 'active', runs_count: 1247 },
    { name: 'Invoice Reminder', trigger: 'invoice_overdue', action: 'send_reminder', status: 'active', runs_count: 89 },
    { name: 'Project Completion Notification', trigger: 'project_completed', action: 'notify_team', status: 'active', runs_count: 156 },
    { name: 'Weekly Report Generation', trigger: 'schedule_weekly', action: 'generate_report', status: 'active', runs_count: 52 },
    { name: 'Lead Score Update', trigger: 'lead_activity', action: 'update_score', status: 'active', runs_count: 2341 },
    { name: 'Slack Notification on Payment', trigger: 'payment_received', action: 'slack_notify', status: 'active', runs_count: 432 }
  ].map((a, i) => ({ id: uuid('automation', i + 1), user_id: DEMO_USER_ID, ...a, last_run: daysAgo(i), created_at: daysAgo(180) }));

  const { error: autoErr } = await supabase.from('automations').upsert(automations, { onConflict: 'id' });
  if (!autoErr) { console.log(`Created ${automations.length} automations`); count += automations.length; }
  else console.log('Automations error:', autoErr.message);

  return count;
}

async function main() {
  console.log('===========================================');
  console.log('SEEDING ALL REMAINING FEATURES');
  console.log('===========================================');
  console.log(`Demo User: alex@freeflow.io`);
  console.log(`User ID: ${DEMO_USER_ID}`);

  let totalCount = 0;

  try {
    totalCount += await seedCryptoPayments();
    totalCount += await seedMyDay();
    totalCount += await seedCRMSales();
    totalCount += await seedProductsOrders();
    totalCount += await seedCoursesLearning();
    totalCount += await seedSurveysFeedback();
    totalCount += await seedGoalsOKRs();
    totalCount += await seedKnowledgeBase();
    totalCount += await seedMediaGallery();
    totalCount += await seedVoiceVideo();
    totalCount += await seedReportsDashboards();
    totalCount += await seedTemplatesAutomations();

    console.log('\n===========================================');
    console.log('SEEDING COMPLETE!');
    console.log('===========================================');
    console.log(`\nTotal new records created: ${totalCount}`);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
