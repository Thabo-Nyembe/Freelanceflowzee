#!/usr/bin/env node

/**
 * Seed Remaining Features - Auto-discover schema
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';
const daysAgo = (d) => new Date(Date.now() - d * 86400000).toISOString();
const future = (d) => new Date(Date.now() + d * 86400000).toISOString();

async function insertBatch(table, records) {
  const { data, error } = await supabase.from(table).insert(records).select();
  if (error) {
    console.log(`  ${table}: ${error.message.substring(0, 100)}`);
    return 0;
  }
  console.log(`  ${table}: ${data.length} records created`);
  return data.length;
}

async function main() {
  console.log('===========================================');
  console.log('SEEDING REMAINING FEATURES (V3)');
  console.log('===========================================\n');

  let total = 0;

  // Focus Sessions
  const focusSessions = [];
  for (let i = 0; i < 25; i++) {
    focusSessions.push({
      user_id: DEMO_USER_ID,
      title: ['Deep coding', 'Design review', 'Client call', 'Writing docs', 'Code review'][i % 5],
      duration: [25, 50, 25, 50, 30][i % 5],
      completed: true,
      created_at: daysAgo(Math.floor(i / 5))
    });
  }
  total += await insertBatch('focus_sessions', focusSessions);

  // Reminders
  const reminders = [
    { user_id: DEMO_USER_ID, title: 'Submit quarterly taxes', reminder_date: future(15), is_completed: false },
    { user_id: DEMO_USER_ID, title: 'Client check-in call', reminder_date: future(2), is_completed: false },
    { user_id: DEMO_USER_ID, title: 'Update portfolio', reminder_date: future(7), is_completed: false },
    { user_id: DEMO_USER_ID, title: 'Renew domain', reminder_date: future(30), is_completed: false },
    { user_id: DEMO_USER_ID, title: 'Team reviews', reminder_date: future(14), is_completed: false }
  ];
  total += await insertBatch('reminders', reminders);

  // Deals
  const deals = [
    { user_id: DEMO_USER_ID, title: 'TechCorp Website Redesign', amount: 45000, status: 'proposal' },
    { user_id: DEMO_USER_ID, title: 'StartupXYZ Mobile App', amount: 85000, status: 'negotiation' },
    { user_id: DEMO_USER_ID, title: 'Enterprise Dashboard', amount: 120000, status: 'discovery' },
    { user_id: DEMO_USER_ID, title: 'E-commerce Migration', amount: 65000, status: 'qualified' },
    { user_id: DEMO_USER_ID, title: 'AI Chatbot Integration', amount: 35000, status: 'won' },
    { user_id: DEMO_USER_ID, title: 'Cloud Infrastructure', amount: 28000, status: 'proposal' }
  ];
  total += await insertBatch('deals', deals);

  // Products
  const products = [
    { user_id: DEMO_USER_ID, title: 'Website Design Package', description: 'Complete website design', price: 2500 },
    { user_id: DEMO_USER_ID, title: 'Logo Design', description: 'Professional logo', price: 500 },
    { user_id: DEMO_USER_ID, title: 'Monthly Retainer - Basic', description: '10 hours/month', price: 1500 },
    { user_id: DEMO_USER_ID, title: 'Monthly Retainer - Pro', description: '25 hours/month', price: 3500 },
    { user_id: DEMO_USER_ID, title: 'SEO Audit', description: 'Full SEO audit', price: 750 },
    { user_id: DEMO_USER_ID, title: 'API Integration', description: 'Custom integration', price: 1200 }
  ];
  total += await insertBatch('products', products);

  // Orders
  const orders = [];
  for (let i = 0; i < 15; i++) {
    orders.push({
      user_id: DEMO_USER_ID,
      customer_name: `Customer ${i + 1}`,
      customer_email: `customer${i + 1}@example.com`,
      status: ['completed', 'processing', 'pending'][i % 3],
      amount: Math.floor(Math.random() * 5000) + 500,
      created_at: daysAgo(i * 3)
    });
  }
  total += await insertBatch('orders', orders);

  // Courses
  const courses = [
    { user_id: DEMO_USER_ID, title: 'React Mastery', description: 'Complete React guide', price: 199 },
    { user_id: DEMO_USER_ID, title: 'Node.js Backend', description: 'Build scalable APIs', price: 249 },
    { user_id: DEMO_USER_ID, title: 'Freelancing 101', description: 'Start freelancing', price: 99 },
    { user_id: DEMO_USER_ID, title: 'Advanced TypeScript', description: 'Master TypeScript', price: 179 }
  ];
  total += await insertBatch('courses', courses);

  // Webinars
  const webinars = [
    { user_id: DEMO_USER_ID, title: 'Building SaaS Products', description: 'Learn SaaS', start_time: future(7) },
    { user_id: DEMO_USER_ID, title: 'Freelance Pricing', description: 'Price services', start_time: future(14) },
    { user_id: DEMO_USER_ID, title: 'AI for Developers', description: 'AI integration', start_time: daysAgo(7) }
  ];
  total += await insertBatch('webinars', webinars);

  // Surveys
  const surveys = [
    { user_id: DEMO_USER_ID, title: 'Customer Satisfaction', description: 'Help us improve', status: 'active' },
    { user_id: DEMO_USER_ID, title: 'Feature Requests', description: 'What features?', status: 'active' },
    { user_id: DEMO_USER_ID, title: 'Onboarding Experience', description: 'Rate onboarding', status: 'completed' }
  ];
  total += await insertBatch('surveys', surveys);

  // Polls
  const polls = [
    { user_id: DEMO_USER_ID, question: 'What feature should we build next?', options: ['Dark mode', 'Mobile app', 'API', 'Teams'] },
    { user_id: DEMO_USER_ID, question: 'Preferred communication method?', options: ['Email', 'Slack', 'Chat', 'Call'] },
    { user_id: DEMO_USER_ID, question: 'Best time for webinars?', options: ['Morning', 'Afternoon', 'Evening', 'Weekend'] }
  ];
  total += await insertBatch('polls', polls);

  // Feedback
  const feedback = [];
  for (let i = 0; i < 10; i++) {
    feedback.push({
      user_id: DEMO_USER_ID,
      title: `Feedback ${i + 1}`,
      content: `Detailed feedback description ${i + 1}`,
      status: ['new', 'reviewed', 'planned'][i % 3],
      created_at: daysAgo(i * 2)
    });
  }
  total += await insertBatch('feedback', feedback);

  // Sprints
  const sprints = [
    { user_id: DEMO_USER_ID, name: 'Sprint 24', status: 'completed', start_date: daysAgo(28), end_date: daysAgo(14) },
    { user_id: DEMO_USER_ID, name: 'Sprint 25', status: 'completed', start_date: daysAgo(14), end_date: daysAgo(0) },
    { user_id: DEMO_USER_ID, name: 'Sprint 26', status: 'active', start_date: daysAgo(0), end_date: future(14) },
    { user_id: DEMO_USER_ID, name: 'Sprint 27', status: 'planned', start_date: future(14), end_date: future(28) }
  ];
  total += await insertBatch('sprints', sprints);

  // FAQs
  const faqs = [
    { user_id: DEMO_USER_ID, question: 'How do I reset my password?', answer: 'Click Forgot Password on login page.' },
    { user_id: DEMO_USER_ID, question: 'What payment methods do you accept?', answer: 'Credit cards, PayPal, and crypto.' },
    { user_id: DEMO_USER_ID, question: 'Can I export my data?', answer: 'Yes, from Settings > Data Export.' },
    { user_id: DEMO_USER_ID, question: 'How to cancel subscription?', answer: 'Go to Settings > Subscription > Cancel.' },
    { user_id: DEMO_USER_ID, question: 'Is my data secure?', answer: 'Yes, we use industry-standard encryption.' }
  ];
  total += await insertBatch('faqs', faqs);

  // Media Files
  const mediaFiles = [];
  for (let i = 0; i < 15; i++) {
    mediaFiles.push({
      user_id: DEMO_USER_ID,
      filename: `file_${i + 1}.${['jpg', 'png', 'pdf'][i % 3]}`,
      file_type: ['image', 'image', 'document'][i % 3],
      file_size: Math.floor(Math.random() * 5000000) + 100000,
      url: `https://source.unsplash.com/800x600/?tech,${i}`,
      created_at: daysAgo(i)
    });
  }
  total += await insertBatch('media_files', mediaFiles);

  // Reports
  const reports = [
    { user_id: DEMO_USER_ID, title: 'Monthly Revenue Report', report_type: 'financial' },
    { user_id: DEMO_USER_ID, title: 'Client Activity Report', report_type: 'activity' },
    { user_id: DEMO_USER_ID, title: 'Project Status Report', report_type: 'project' },
    { user_id: DEMO_USER_ID, title: 'Time Utilization Report', report_type: 'productivity' }
  ];
  total += await insertBatch('reports', reports);

  // Dashboards
  const dashboards = [
    { user_id: DEMO_USER_ID, name: 'Executive Dashboard', description: 'High-level business metrics' },
    { user_id: DEMO_USER_ID, name: 'Sales Dashboard', description: 'Sales pipeline and performance' },
    { user_id: DEMO_USER_ID, name: 'Project Dashboard', description: 'Project progress and timelines' },
    { user_id: DEMO_USER_ID, name: 'Financial Dashboard', description: 'Revenue, expenses, and cash flow' }
  ];
  total += await insertBatch('dashboards', dashboards);

  // Metrics
  const metrics = [];
  for (let i = 0; i < 30; i++) {
    metrics.push({
      user_id: DEMO_USER_ID,
      metric_name: ['revenue', 'users', 'sessions', 'conversions', 'pageviews'][i % 5],
      value: Math.floor(Math.random() * 10000) + 1000,
      previous_value: Math.floor(Math.random() * 9000) + 900,
      period: 'daily',
      recorded_at: daysAgo(i)
    });
  }
  total += await insertBatch('metrics', metrics);

  // Templates
  const templates = [
    { user_id: DEMO_USER_ID, name: 'Project Proposal', category: 'sales', content: 'Proposal template...' },
    { user_id: DEMO_USER_ID, name: 'Service Agreement', category: 'legal', content: 'Contract template...' },
    { user_id: DEMO_USER_ID, name: 'Project Brief', category: 'project', content: 'Brief template...' },
    { user_id: DEMO_USER_ID, name: 'Meeting Notes', category: 'productivity', content: 'Notes template...' }
  ];
  total += await insertBatch('templates', templates);

  // Automations
  const automations = [
    { user_id: DEMO_USER_ID, name: 'Welcome Email', trigger: 'signup', is_active: true },
    { user_id: DEMO_USER_ID, name: 'Invoice Reminder', trigger: 'invoice_overdue', is_active: true },
    { user_id: DEMO_USER_ID, name: 'Project Completion', trigger: 'project_done', is_active: true },
    { user_id: DEMO_USER_ID, name: 'Weekly Report', trigger: 'schedule', is_active: true }
  ];
  total += await insertBatch('automations', automations);

  // Payment Methods
  const paymentMethods = [
    { user_id: DEMO_USER_ID, method_type: 'card', provider: 'stripe', is_default: true },
    { user_id: DEMO_USER_ID, method_type: 'bank', provider: 'plaid', is_default: false },
    { user_id: DEMO_USER_ID, method_type: 'paypal', provider: 'paypal', is_default: false }
  ];
  total += await insertBatch('payment_methods', paymentMethods);

  // Subscriptions
  const subscriptions = [
    { user_id: DEMO_USER_ID, plan_name: 'Pro Plan', status: 'active', billing_cycle: 'monthly' },
    { user_id: DEMO_USER_ID, plan_name: 'Storage Plus', status: 'active', billing_cycle: 'monthly' }
  ];
  total += await insertBatch('subscriptions', subscriptions);

  // Campaigns
  const campaigns = [
    { user_id: DEMO_USER_ID, name: 'Q1 Product Launch', campaign_type: 'email', status: 'completed' },
    { user_id: DEMO_USER_ID, name: 'LinkedIn Ads', campaign_type: 'social', status: 'active' },
    { user_id: DEMO_USER_ID, name: 'Webinar Series', campaign_type: 'webinar', status: 'active' }
  ];
  total += await insertBatch('campaigns', campaigns);

  // Email Templates
  const emailTemplates = [
    { user_id: DEMO_USER_ID, name: 'Welcome Email', template_type: 'onboarding' },
    { user_id: DEMO_USER_ID, name: 'Proposal Follow-up', template_type: 'sales' },
    { user_id: DEMO_USER_ID, name: 'Invoice Reminder', template_type: 'billing' }
  ];
  total += await insertBatch('email_templates', emailTemplates);

  // Crypto Transactions
  const cryptoTx = [];
  for (let i = 0; i < 15; i++) {
    cryptoTx.push({
      user_id: DEMO_USER_ID,
      wallet_id: 'e1e1e1e1-0000-4000-8000-000000000001',
      amount: Math.random() * 1000 + 100,
      currency: ['BTC', 'ETH', 'USDC', 'SOL'][i % 4],
      status: 'completed',
      created_at: daysAgo(i * 2)
    });
  }
  total += await insertBatch('crypto_transactions', cryptoTx);

  console.log('\n===========================================');
  console.log(`TOTAL RECORDS CREATED: ${total}`);
  console.log('===========================================');
}

main();
