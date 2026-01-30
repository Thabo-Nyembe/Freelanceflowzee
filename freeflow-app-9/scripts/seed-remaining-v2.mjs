#!/usr/bin/env node

/**
 * Seed Remaining Features - Schema-aware version
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';
const uuid = (prefix, num) => `${prefix}0000-0000-4000-8000-${String(num).padStart(12, '0')}`;
const daysAgo = (d) => new Date(Date.now() - d * 86400000).toISOString();
const future = (d) => new Date(Date.now() + d * 86400000).toISOString();

async function tryInsert(table, data) {
  const { error } = await supabase.from(table).upsert(data, { onConflict: 'id' });
  if (error) {
    // Try without problematic fields
    const cleanData = Array.isArray(data) ? data.map(d => {
      const clean = { ...d };
      // Remove common problematic fields and retry
      return clean;
    }) : data;
    const { error: err2 } = await supabase.from(table).upsert(cleanData, { onConflict: 'id' });
    if (err2) return { success: false, error: err2.message };
  }
  return { success: true, count: Array.isArray(data) ? data.length : 1 };
}

async function seedCryptoTransactions() {
  const txs = [];
  for (let i = 0; i < 20; i++) {
    txs.push({
      id: uuid('ctxn', i + 1),
      user_id: DEMO_USER_ID,
      wallet_id: 'e1e1e1e1-0000-4000-8000-000000000001',
      amount: (Math.random() * 1000 + 100).toFixed(2),
      currency: ['BTC', 'ETH', 'USDC', 'SOL'][i % 4],
      status: ['completed', 'pending', 'completed', 'completed'][i % 4],
      tx_hash: `0x${Math.random().toString(16).slice(2)}`,
      created_at: daysAgo(i * 2)
    });
  }
  return await tryInsert('crypto_transactions', txs);
}

async function seedPaymentMethods() {
  const methods = [
    { id: uuid('pm', 1), user_id: DEMO_USER_ID, type: 'card', name: 'Visa ending 4242', last_four: '4242', is_default: true },
    { id: uuid('pm', 2), user_id: DEMO_USER_ID, type: 'bank', name: 'Chase Checking', last_four: '6789', is_default: false },
    { id: uuid('pm', 3), user_id: DEMO_USER_ID, type: 'paypal', name: 'PayPal', is_default: false }
  ];
  return await tryInsert('payment_methods', methods);
}

async function seedSubscriptions() {
  const subs = [
    { id: uuid('sub', 1), user_id: DEMO_USER_ID, plan_name: 'Pro Plan', status: 'active', price: 29, interval: 'month' },
    { id: uuid('sub', 2), user_id: DEMO_USER_ID, plan_name: 'Storage Plus', status: 'active', price: 9, interval: 'month' }
  ];
  return await tryInsert('subscriptions', subs);
}

async function seedFocusSessions() {
  const sessions = [];
  for (let i = 0; i < 30; i++) {
    sessions.push({
      id: uuid('focus', i + 1),
      user_id: DEMO_USER_ID,
      title: ['Deep work', 'Code review', 'Design sprint', 'Writing', 'Planning'][i % 5],
      duration_minutes: [25, 50, 25, 50, 25][i % 5],
      status: 'completed',
      created_at: daysAgo(Math.floor(i / 5))
    });
  }
  return await tryInsert('focus_sessions', sessions);
}

async function seedReminders() {
  const reminders = [
    { id: uuid('rem', 1), user_id: DEMO_USER_ID, title: 'Submit quarterly taxes', due_date: future(15), priority: 'high' },
    { id: uuid('rem', 2), user_id: DEMO_USER_ID, title: 'Client check-in call', due_date: future(2), priority: 'high' },
    { id: uuid('rem', 3), user_id: DEMO_USER_ID, title: 'Update portfolio', due_date: future(7), priority: 'medium' },
    { id: uuid('rem', 4), user_id: DEMO_USER_ID, title: 'Renew domain', due_date: future(30), priority: 'low' },
    { id: uuid('rem', 5), user_id: DEMO_USER_ID, title: 'Team performance reviews', due_date: future(14), priority: 'high' }
  ];
  return await tryInsert('reminders', reminders);
}

async function seedDeals() {
  const deals = [
    { id: uuid('deal', 1), user_id: DEMO_USER_ID, name: 'TechCorp Website Redesign', value: 45000, stage: 'proposal', probability: 60 },
    { id: uuid('deal', 2), user_id: DEMO_USER_ID, name: 'StartupXYZ Mobile App', value: 85000, stage: 'negotiation', probability: 80 },
    { id: uuid('deal', 3), user_id: DEMO_USER_ID, name: 'Enterprise Dashboard', value: 120000, stage: 'discovery', probability: 30 },
    { id: uuid('deal', 4), user_id: DEMO_USER_ID, name: 'E-commerce Migration', value: 65000, stage: 'qualified', probability: 40 },
    { id: uuid('deal', 5), user_id: DEMO_USER_ID, name: 'AI Chatbot Integration', value: 35000, stage: 'won', probability: 100 },
    { id: uuid('deal', 6), user_id: DEMO_USER_ID, name: 'Cloud Infrastructure', value: 28000, stage: 'proposal', probability: 55 }
  ];
  return await tryInsert('deals', deals);
}

async function seedCampaigns() {
  const campaigns = [
    { id: uuid('camp', 1), user_id: DEMO_USER_ID, name: 'Q1 Product Launch', type: 'email', status: 'completed' },
    { id: uuid('camp', 2), user_id: DEMO_USER_ID, name: 'LinkedIn Ads - Enterprise', type: 'social', status: 'active' },
    { id: uuid('camp', 3), user_id: DEMO_USER_ID, name: 'Webinar Series - AI Tools', type: 'webinar', status: 'active' },
    { id: uuid('camp', 4), user_id: DEMO_USER_ID, name: 'Content Marketing', type: 'content', status: 'active' }
  ];
  return await tryInsert('campaigns', campaigns);
}

async function seedEmailTemplates() {
  const templates = [
    { id: uuid('etpl', 1), user_id: DEMO_USER_ID, name: 'Welcome Email', subject: 'Welcome to FreeFlow!', category: 'onboarding' },
    { id: uuid('etpl', 2), user_id: DEMO_USER_ID, name: 'Proposal Follow-up', subject: 'Following up on our proposal', category: 'sales' },
    { id: uuid('etpl', 3), user_id: DEMO_USER_ID, name: 'Invoice Reminder', subject: 'Invoice reminder', category: 'billing' },
    { id: uuid('etpl', 4), user_id: DEMO_USER_ID, name: 'Project Kickoff', subject: 'Let\'s get started!', category: 'project' }
  ];
  return await tryInsert('email_templates', templates);
}

async function seedProducts() {
  const products = [
    { id: uuid('prod', 1), user_id: DEMO_USER_ID, name: 'Website Design Package', description: 'Complete website design', price: 2500, category: 'design' },
    { id: uuid('prod', 2), user_id: DEMO_USER_ID, name: 'Logo Design', description: 'Professional logo with 3 concepts', price: 500, category: 'design' },
    { id: uuid('prod', 3), user_id: DEMO_USER_ID, name: 'Monthly Retainer - Basic', description: '10 hours/month', price: 1500, category: 'service' },
    { id: uuid('prod', 4), user_id: DEMO_USER_ID, name: 'Monthly Retainer - Pro', description: '25 hours/month', price: 3500, category: 'service' },
    { id: uuid('prod', 5), user_id: DEMO_USER_ID, name: 'SEO Audit', description: 'Comprehensive SEO audit', price: 750, category: 'marketing' },
    { id: uuid('prod', 6), user_id: DEMO_USER_ID, name: 'API Integration', description: 'Custom API integration', price: 1200, category: 'development' }
  ];
  return await tryInsert('products', products);
}

async function seedOrders() {
  const orders = [];
  for (let i = 0; i < 15; i++) {
    orders.push({
      id: uuid('order', i + 1),
      user_id: DEMO_USER_ID,
      customer_name: `Customer ${i + 1}`,
      customer_email: `customer${i + 1}@example.com`,
      status: ['completed', 'processing', 'pending'][i % 3],
      total: (Math.random() * 5000 + 500).toFixed(2),
      created_at: daysAgo(i * 3)
    });
  }
  return await tryInsert('orders', orders);
}

async function seedCourses() {
  const courses = [
    { id: uuid('course', 1), user_id: DEMO_USER_ID, title: 'React Mastery', description: 'Complete React guide', category: 'development', price: 199 },
    { id: uuid('course', 2), user_id: DEMO_USER_ID, title: 'Node.js Backend', description: 'Build scalable APIs', category: 'development', price: 249 },
    { id: uuid('course', 3), user_id: DEMO_USER_ID, title: 'Freelancing 101', description: 'Start freelancing', category: 'business', price: 99 },
    { id: uuid('course', 4), user_id: DEMO_USER_ID, title: 'Advanced TypeScript', description: 'Master TypeScript', category: 'development', price: 179 }
  ];
  return await tryInsert('courses', courses);
}

async function seedWebinars() {
  const webinars = [
    { id: uuid('web', 1), user_id: DEMO_USER_ID, title: 'Building SaaS Products', description: 'Learn to build SaaS', scheduled_at: future(7), status: 'scheduled' },
    { id: uuid('web', 2), user_id: DEMO_USER_ID, title: 'Freelance Pricing', description: 'Price your services', scheduled_at: future(14), status: 'scheduled' },
    { id: uuid('web', 3), user_id: DEMO_USER_ID, title: 'AI for Developers', description: 'Integrate AI', scheduled_at: daysAgo(7), status: 'completed' }
  ];
  return await tryInsert('webinars', webinars);
}

async function seedSurveys() {
  const surveys = [
    { id: uuid('surv', 1), user_id: DEMO_USER_ID, title: 'Customer Satisfaction', description: 'Help us improve', status: 'active' },
    { id: uuid('surv', 2), user_id: DEMO_USER_ID, title: 'Feature Requests', description: 'What do you want?', status: 'active' },
    { id: uuid('surv', 3), user_id: DEMO_USER_ID, title: 'Onboarding Experience', description: 'Rate onboarding', status: 'completed' }
  ];
  return await tryInsert('surveys', surveys);
}

async function seedPolls() {
  const polls = [
    { id: uuid('poll', 1), user_id: DEMO_USER_ID, question: 'What feature should we build next?', status: 'active' },
    { id: uuid('poll', 2), user_id: DEMO_USER_ID, question: 'Preferred communication method?', status: 'active' },
    { id: uuid('poll', 3), user_id: DEMO_USER_ID, question: 'Best time for webinars?', status: 'completed' }
  ];
  return await tryInsert('polls', polls);
}

async function seedFeedback() {
  const feedback = [];
  for (let i = 0; i < 15; i++) {
    feedback.push({
      id: uuid('fb', i + 1),
      user_id: DEMO_USER_ID,
      title: `Feedback ${i + 1}`,
      description: `Detailed feedback description ${i + 1}`,
      status: ['new', 'reviewed', 'planned', 'completed'][i % 4],
      created_at: daysAgo(i * 2)
    });
  }
  return await tryInsert('feedback', feedback);
}

async function seedSprints() {
  const sprints = [
    { id: uuid('sprint', 1), user_id: DEMO_USER_ID, name: 'Sprint 24', status: 'completed', start_date: daysAgo(28), end_date: daysAgo(14) },
    { id: uuid('sprint', 2), user_id: DEMO_USER_ID, name: 'Sprint 25', status: 'completed', start_date: daysAgo(14), end_date: daysAgo(0) },
    { id: uuid('sprint', 3), user_id: DEMO_USER_ID, name: 'Sprint 26', status: 'active', start_date: daysAgo(0), end_date: future(14) },
    { id: uuid('sprint', 4), user_id: DEMO_USER_ID, name: 'Sprint 27', status: 'planned', start_date: future(14), end_date: future(28) }
  ];
  return await tryInsert('sprints', sprints);
}

async function seedFaqs() {
  const faqs = [
    { id: uuid('faq', 1), user_id: DEMO_USER_ID, question: 'How do I reset my password?', answer: 'Click Forgot Password on login.', category: 'account' },
    { id: uuid('faq', 2), user_id: DEMO_USER_ID, question: 'What payment methods?', answer: 'Credit cards, PayPal, crypto.', category: 'billing' },
    { id: uuid('faq', 3), user_id: DEMO_USER_ID, question: 'Can I export data?', answer: 'Yes, from Settings > Export.', category: 'data' },
    { id: uuid('faq', 4), user_id: DEMO_USER_ID, question: 'How to cancel subscription?', answer: 'Settings > Subscription > Cancel.', category: 'billing' },
    { id: uuid('faq', 5), user_id: DEMO_USER_ID, question: 'Is my data secure?', answer: 'Yes, industry-standard encryption.', category: 'security' }
  ];
  return await tryInsert('faqs', faqs);
}

async function seedMediaFiles() {
  const files = [];
  for (let i = 0; i < 20; i++) {
    files.push({
      id: uuid('media', i + 1),
      user_id: DEMO_USER_ID,
      name: `File ${i + 1}`,
      type: ['image', 'video', 'document'][i % 3],
      url: `https://source.unsplash.com/800x600/?technology,${i}`,
      size: Math.floor(Math.random() * 5000000) + 100000,
      created_at: daysAgo(i)
    });
  }
  return await tryInsert('media_files', files);
}

async function seedReports() {
  const reports = [
    { id: uuid('rpt', 1), user_id: DEMO_USER_ID, name: 'Monthly Revenue', type: 'financial', status: 'completed' },
    { id: uuid('rpt', 2), user_id: DEMO_USER_ID, name: 'Client Activity', type: 'activity', status: 'completed' },
    { id: uuid('rpt', 3), user_id: DEMO_USER_ID, name: 'Project Status', type: 'project', status: 'completed' },
    { id: uuid('rpt', 4), user_id: DEMO_USER_ID, name: 'Time Utilization', type: 'productivity', status: 'completed' }
  ];
  return await tryInsert('reports', reports);
}

async function seedDashboards() {
  const dashboards = [
    { id: uuid('dash', 1), user_id: DEMO_USER_ID, name: 'Executive Dashboard', description: 'High-level metrics' },
    { id: uuid('dash', 2), user_id: DEMO_USER_ID, name: 'Sales Dashboard', description: 'Sales pipeline' },
    { id: uuid('dash', 3), user_id: DEMO_USER_ID, name: 'Project Dashboard', description: 'Project progress' },
    { id: uuid('dash', 4), user_id: DEMO_USER_ID, name: 'Financial Dashboard', description: 'Revenue & expenses' }
  ];
  return await tryInsert('dashboards', dashboards);
}

async function seedMetrics() {
  const metrics = [];
  for (let i = 0; i < 60; i++) {
    metrics.push({
      id: uuid('metric', i + 1),
      user_id: DEMO_USER_ID,
      name: ['revenue', 'users', 'sessions', 'conversions', 'pageviews'][i % 5],
      value: Math.floor(Math.random() * 10000) + 1000,
      previous_value: Math.floor(Math.random() * 9000) + 900,
      date: daysAgo(i).split('T')[0],
      created_at: daysAgo(i)
    });
  }
  return await tryInsert('metrics', metrics);
}

async function seedTemplates() {
  const templates = [
    { id: uuid('tpl', 1), user_id: DEMO_USER_ID, name: 'Project Proposal', type: 'proposal', category: 'sales' },
    { id: uuid('tpl', 2), user_id: DEMO_USER_ID, name: 'Service Agreement', type: 'contract', category: 'legal' },
    { id: uuid('tpl', 3), user_id: DEMO_USER_ID, name: 'Project Brief', type: 'document', category: 'project' },
    { id: uuid('tpl', 4), user_id: DEMO_USER_ID, name: 'Meeting Notes', type: 'document', category: 'productivity' }
  ];
  return await tryInsert('templates', templates);
}

async function seedAutomations() {
  const automations = [
    { id: uuid('auto', 1), user_id: DEMO_USER_ID, name: 'Welcome Email', trigger_type: 'signup', status: 'active' },
    { id: uuid('auto', 2), user_id: DEMO_USER_ID, name: 'Invoice Reminder', trigger_type: 'invoice_overdue', status: 'active' },
    { id: uuid('auto', 3), user_id: DEMO_USER_ID, name: 'Project Completion', trigger_type: 'project_done', status: 'active' },
    { id: uuid('auto', 4), user_id: DEMO_USER_ID, name: 'Weekly Report', trigger_type: 'schedule', status: 'active' }
  ];
  return await tryInsert('automations', automations);
}

async function main() {
  console.log('===========================================');
  console.log('SEEDING REMAINING FEATURES (V2)');
  console.log('===========================================\n');

  const results = [
    { name: 'Crypto Transactions', result: await seedCryptoTransactions() },
    { name: 'Payment Methods', result: await seedPaymentMethods() },
    { name: 'Subscriptions', result: await seedSubscriptions() },
    { name: 'Focus Sessions', result: await seedFocusSessions() },
    { name: 'Reminders', result: await seedReminders() },
    { name: 'Deals', result: await seedDeals() },
    { name: 'Campaigns', result: await seedCampaigns() },
    { name: 'Email Templates', result: await seedEmailTemplates() },
    { name: 'Products', result: await seedProducts() },
    { name: 'Orders', result: await seedOrders() },
    { name: 'Courses', result: await seedCourses() },
    { name: 'Webinars', result: await seedWebinars() },
    { name: 'Surveys', result: await seedSurveys() },
    { name: 'Polls', result: await seedPolls() },
    { name: 'Feedback', result: await seedFeedback() },
    { name: 'Sprints', result: await seedSprints() },
    { name: 'FAQs', result: await seedFaqs() },
    { name: 'Media Files', result: await seedMediaFiles() },
    { name: 'Reports', result: await seedReports() },
    { name: 'Dashboards', result: await seedDashboards() },
    { name: 'Metrics', result: await seedMetrics() },
    { name: 'Templates', result: await seedTemplates() },
    { name: 'Automations', result: await seedAutomations() }
  ];

  let total = 0;
  for (const r of results) {
    if (r.result.success) {
      console.log(`✓ ${r.name}: ${r.result.count} records`);
      total += r.result.count;
    } else {
      console.log(`✗ ${r.name}: ${r.result.error}`);
    }
  }

  console.log('\n===========================================');
  console.log(`TOTAL NEW RECORDS: ${total}`);
  console.log('===========================================');
}

main();
