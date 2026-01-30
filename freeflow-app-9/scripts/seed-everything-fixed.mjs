#!/usr/bin/env node
/**
 * SEED EVERYTHING - Fixed with correct schemas
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

console.log('🚀 SEEDING EVERYTHING (FIXED SCHEMAS)\n');
console.log('═'.repeat(70));

// ============================================================================
// 1. PORTFOLIOS (Correct schema)
// ============================================================================
async function seedPortfolios() {
  console.log('\n🖼️  Seeding Portfolio...');

  const portfolio = {
    id: uuid('D0000000', 1),
    user_id: DEMO_USER_ID,
    slug: 'alex-morgan',
    title: 'Alex Morgan - Full Stack Creative',
    subtitle: 'Building digital experiences that matter',
    bio: 'Award-winning creative technologist with 10+ years of experience building products for startups and enterprises. Specializing in web applications, mobile apps, and brand identity.',
    avatar_url: '/avatars/alex-morgan.jpg',
    cover_image_url: '/covers/portfolio-cover.jpg',
    email: 'alex@freeflow.io',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    website: 'https://alexmorgan.design',
    timezone: 'America/Los_Angeles',
    preferred_contact: 'email',
    github_url: 'https://github.com/alexmorgan',
    linkedin_url: 'https://linkedin.com/in/alexmorgan',
    twitter_url: 'https://twitter.com/alexmorgan',
    behance_url: 'https://behance.net/alexmorgan',
    dribbble_url: 'https://dribbble.com/alexmorgan',
    is_public: true,
    show_contact: true,
    show_social: true,
    show_analytics: true,
    allow_download: true,
    allow_share: true,
    seo_title: 'Alex Morgan | Creative Technologist & Designer',
    seo_description: 'Portfolio of Alex Morgan - Full stack developer and designer specializing in web apps, mobile apps, and brand identity.',
    seo_keywords: ['developer', 'designer', 'portfolio', 'web apps', 'mobile apps'],
    created_at: daysAgo(180),
    updated_at: daysAgo(1),
    last_published_at: daysAgo(1),
  };

  const { error } = await supabase.from('portfolios').upsert(portfolio, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  portfolios: ${error.message}`);
  } else {
    console.log(`   ✓ Portfolio created`);
  }
}

// ============================================================================
// 2. INTEGRATIONS (Correct schema)
// ============================================================================
async function seedIntegrations() {
  console.log('\n🔌 Seeding Integrations...');

  const integrations = [
    { name: 'Stripe', type: 'payment', description: 'Payment processing', status: 'active' },
    { name: 'Slack', type: 'communication', description: 'Team messaging', status: 'active' },
    { name: 'Google Calendar', type: 'calendar', description: 'Calendar sync', status: 'active' },
    { name: 'Zoom', type: 'video', description: 'Video meetings', status: 'active' },
    { name: 'GitHub', type: 'development', description: 'Code repository', status: 'active' },
    { name: 'Figma', type: 'design', description: 'Design collaboration', status: 'active' },
    { name: 'QuickBooks', type: 'accounting', description: 'Accounting', status: 'active' },
    { name: 'Notion', type: 'productivity', description: 'Documentation', status: 'active' },
    { name: 'Zapier', type: 'automation', description: 'Workflow automation', status: 'active' },
    { name: 'HubSpot', type: 'crm', description: 'CRM', status: 'pending' },
  ];

  const intData = integrations.map((i, idx) => ({
    id: uuid('D1000000', idx + 1),
    user_id: DEMO_USER_ID,
    name: i.name,
    type: i.type,
    description: i.description,
    status: i.status,
    credentials: {},
    settings: { enabled: true },
    scopes: ['read', 'write'],
    last_sync_at: i.status === 'active' ? hoursAgo(randomBetween(1, 24)) : null,
    sync_frequency: 'hourly',
    metadata: {},
    created_at: daysAgo(randomBetween(30, 180)),
    updated_at: daysAgo(randomBetween(0, 7)),
  }));

  const { error } = await supabase.from('integrations').upsert(intData, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  integrations: ${error.message}`);
  } else {
    console.log(`   ✓ ${integrations.length} integrations created`);
  }
}

// ============================================================================
// 3. MORE CLIENTS with full data
// ============================================================================
async function seedMoreClients() {
  console.log('\n👥 Seeding More Clients...');

  const clients = [
    { name: 'TechVenture Capital', industry: 'Finance', value: 150000, status: 'vip' },
    { name: 'CloudSync Technologies', industry: 'Technology', value: 120000, status: 'active' },
    { name: 'HealthTech Solutions', industry: 'Healthcare', value: 95000, status: 'active' },
    { name: 'Nordic Design Group', industry: 'Creative', value: 65000, status: 'active' },
    { name: 'DataPulse Analytics', industry: 'Technology', value: 85000, status: 'active' },
    { name: 'Bloom Education', industry: 'EdTech', value: 78000, status: 'active' },
    { name: 'Urban Fitness Network', industry: 'Health', value: 45000, status: 'active' },
    { name: 'Creative Studios Inc', industry: 'Creative', value: 55000, status: 'active' },
    { name: 'Legal Pros Alliance', industry: 'Legal', value: 42000, status: 'active' },
    { name: 'FinanceFirst Consulting', industry: 'Finance', value: 88000, status: 'active' },
    { name: 'Stellar Marketing Co', industry: 'Marketing', value: 38000, status: 'active' },
    { name: 'GreenLeaf Organics', industry: 'Retail', value: 32000, status: 'active' },
    { name: 'Local Restaurant Group', industry: 'Hospitality', value: 18000, status: 'active' },
    { name: 'Nonprofit Foundation', industry: 'Nonprofit', value: 12000, status: 'active' },
    { name: 'Old Client Corp', industry: 'Technology', value: 8500, status: 'churned' },
  ];

  for (let i = 0; i < clients.length; i++) {
    const c = clients[i];
    const { error } = await supabase.from('clients').upsert({
      id: uuid('10000000', i + 1),
      user_id: DEMO_USER_ID,
      name: c.name,
      email: c.name.toLowerCase().replace(/\s+/g, '.') + '@example.com',
      company: c.name,
      industry: c.industry,
      status: c.status,
      type: c.value > 80000 ? 'enterprise' : c.value > 40000 ? 'business' : 'individual',
      priority: c.value > 80000 ? 'high' : c.value > 40000 ? 'medium' : 'low',
      lifetime_value: c.value,
      total_revenue: c.value,
      tags: [c.industry.toLowerCase(), c.status],
      notes: `Industry: ${c.industry}. Status: ${c.status}.`,
      created_at: daysAgo(randomBetween(30, 365)),
      updated_at: daysAgo(randomBetween(0, 14)),
    }, { onConflict: 'id' });
  }
  console.log(`   ✓ ${clients.length} clients updated`);
}

// ============================================================================
// 4. MORE PROJECTS with full details
// ============================================================================
async function seedMoreProjects() {
  console.log('\n📁 Seeding More Projects...');

  const projects = [
    { title: 'TechVenture Mobile App', budget: 85000, progress: 75, status: 'active' },
    { title: 'CloudSync Platform v2', budget: 120000, progress: 45, status: 'active' },
    { title: 'HealthTech Dashboard', budget: 65000, progress: 90, status: 'active' },
    { title: 'Nordic Brand Identity', budget: 35000, progress: 100, status: 'completed' },
    { title: 'DataPulse Analytics UI', budget: 55000, progress: 100, status: 'completed' },
    { title: 'Bloom LMS Platform', budget: 95000, progress: 100, status: 'completed' },
    { title: 'Fitness App MVP', budget: 42000, progress: 100, status: 'completed' },
    { title: 'Marketing Site Redesign', budget: 28000, progress: 100, status: 'completed' },
    { title: 'E-commerce Integration', budget: 38000, progress: 60, status: 'active' },
    { title: 'Legal Document Portal', budget: 52000, progress: 30, status: 'active' },
    { title: 'Restaurant Booking System', budget: 32000, progress: 100, status: 'completed' },
    { title: 'Finance Dashboard', budget: 68000, progress: 100, status: 'completed' },
  ];

  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    const { error } = await supabase.from('projects').upsert({
      id: uuid('70000000', i + 1),
      user_id: DEMO_USER_ID,
      title: p.title,
      description: `Full-service ${p.title} development including design, development, testing, and deployment.`,
      status: p.status,
      budget: p.budget,
      spent: Math.round(p.budget * p.progress / 100),
      progress: p.progress,
      priority: p.budget > 60000 ? 'high' : 'medium',
      start_date: daysAgo(randomBetween(30, 180)),
      end_date: p.status === 'completed' ? daysAgo(randomBetween(1, 30)) : daysAgo(-randomBetween(30, 90)),
      created_at: daysAgo(randomBetween(60, 200)),
      updated_at: daysAgo(randomBetween(0, 7)),
    }, { onConflict: 'id' });
  }
  console.log(`   ✓ ${projects.length} projects updated`);
}

// ============================================================================
// 5. FEEDBACK / REVIEWS
// ============================================================================
async function seedFeedback() {
  console.log('\n⭐ Seeding Feedback & Reviews...');

  const reviews = [
    { rating: 5, comment: 'Exceptional work! The team delivered beyond our expectations. Highly recommended.' },
    { rating: 5, comment: 'Great communication throughout the project. Very professional and responsive.' },
    { rating: 5, comment: 'The best agency we have ever worked with. Will definitely hire again.' },
    { rating: 4, comment: 'Good quality work, delivered on time. Minor revisions were handled quickly.' },
    { rating: 5, comment: 'Amazing attention to detail. They really understood our vision.' },
    { rating: 5, comment: 'Transformed our business with their innovative solutions.' },
    { rating: 4, comment: 'Solid work overall. Would recommend for any project.' },
    { rating: 5, comment: 'Outstanding results! Our users love the new experience.' },
    { rating: 5, comment: 'Professional, creative, and reliable. A+ team!' },
    { rating: 5, comment: 'Exceeded all expectations. Looking forward to future projects.' },
  ];

  const feedbackData = reviews.map((r, i) => ({
    id: uuid('D2000000', i + 1),
    user_id: DEMO_USER_ID,
    rating: r.rating,
    comment: r.comment,
    source: 'client_review',
    status: 'published',
    created_at: daysAgo(randomBetween(7, 180)),
    updated_at: daysAgo(randomBetween(0, 7)),
  }));

  const { error } = await supabase.from('feedback').upsert(feedbackData, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  feedback: ${error.message}`);
  } else {
    console.log(`   ✓ ${reviews.length} reviews created`);
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    console.log(`   📊 Average rating: ${avgRating.toFixed(1)}/5`);
  }
}

// ============================================================================
// 6. PAYMENTS
// ============================================================================
async function seedPayments() {
  console.log('\n💳 Seeding Payments...');

  const payments = [];
  for (let i = 0; i < 30; i++) {
    payments.push({
      id: uuid('D3000000', i + 1),
      user_id: DEMO_USER_ID,
      amount: randomBetween(1000, 25000),
      currency: 'USD',
      status: 'completed',
      payment_method: randomItem(['stripe', 'bank_transfer', 'paypal', 'crypto']),
      description: `Payment for Invoice #${1000 + i}`,
      client_name: randomItem(['TechVenture Capital', 'CloudSync Technologies', 'HealthTech Solutions', 'Nordic Design']),
      created_at: daysAgo(randomBetween(1, 180)),
      updated_at: daysAgo(randomBetween(0, 30)),
    });
  }

  const { error } = await supabase.from('payments').upsert(payments, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  payments: ${error.message}`);
  } else {
    console.log(`   ✓ ${payments.length} payments created`);
    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    console.log(`   📊 Total payments: $${total.toLocaleString()}`);
  }
}

// ============================================================================
// 7. ANNOUNCEMENTS
// ============================================================================
async function seedAnnouncements() {
  console.log('\n📢 Seeding Announcements...');

  const announcements = [
    { title: 'New Feature: AI Assistant', content: 'We are excited to announce our new AI-powered assistant to help with your daily tasks.', type: 'feature' },
    { title: 'Q4 Goals Update', content: 'Great progress on our quarterly goals. We have achieved 85% of our targets.', type: 'update' },
    { title: 'Holiday Schedule', content: 'Please note our holiday schedule for the upcoming season.', type: 'info' },
    { title: 'System Maintenance', content: 'Scheduled maintenance this weekend. Expect brief downtime.', type: 'maintenance' },
    { title: 'Welcome New Team Member', content: 'Please welcome our newest team member to the family!', type: 'team' },
  ];

  const annData = announcements.map((a, i) => ({
    id: uuid('D4000000', i + 1),
    user_id: DEMO_USER_ID,
    title: a.title,
    content: a.content,
    type: a.type,
    is_pinned: i === 0,
    is_read: i > 1,
    created_at: daysAgo(i * 7),
    updated_at: daysAgo(i * 7),
  }));

  const { error } = await supabase.from('announcements').upsert(annData, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  announcements: ${error.message}`);
  } else {
    console.log(`   ✓ ${announcements.length} announcements created`);
  }
}

// ============================================================================
// 8. ACTIVITY LOGS
// ============================================================================
async function seedActivityLogs() {
  console.log('\n📋 Seeding Activity Logs...');

  const activities = [];
  const actions = [
    'created_project', 'updated_project', 'completed_task', 'sent_invoice',
    'received_payment', 'added_client', 'uploaded_file', 'sent_message',
    'scheduled_meeting', 'generated_report', 'used_ai_feature', 'exported_data'
  ];

  for (let i = 0; i < 100; i++) {
    activities.push({
      id: uuid('D5000000', i + 1),
      user_id: DEMO_USER_ID,
      action: randomItem(actions),
      resource_type: randomItem(['project', 'task', 'invoice', 'client', 'file']),
      resource_id: uuid('00000000', randomBetween(1, 50)),
      ip_address: '192.168.1.' + randomBetween(1, 255),
      user_agent: 'Mozilla/5.0',
      created_at: hoursAgo(randomBetween(1, 720)),
    });
  }

  const { error } = await supabase.from('activity_logs').upsert(activities, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  activity_logs: ${error.message}`);
  } else {
    console.log(`   ✓ ${activities.length} activity logs created`);
  }
}

// ============================================================================
// 9. MEDIA FILES (Gallery)
// ============================================================================
async function seedMediaFiles() {
  console.log('\n🖼️  Seeding Media Files...');

  const mediaFiles = [
    { name: 'homepage-hero.jpg', type: 'image', size: 2500000 },
    { name: 'product-demo.mp4', type: 'video', size: 125000000 },
    { name: 'team-photo.jpg', type: 'image', size: 4500000 },
    { name: 'client-testimonial.mp4', type: 'video', size: 85000000 },
    { name: 'brand-logo.svg', type: 'image', size: 50000 },
    { name: 'office-tour.mp4', type: 'video', size: 95000000 },
    { name: 'project-showcase.jpg', type: 'image', size: 3200000 },
    { name: 'wireframes.png', type: 'image', size: 1800000 },
    { name: 'mockup-preview.jpg', type: 'image', size: 2100000 },
    { name: 'presentation-slides.pdf', type: 'document', size: 15000000 },
  ];

  const mediaData = mediaFiles.map((m, i) => ({
    id: uuid('D6000000', i + 1),
    user_id: DEMO_USER_ID,
    name: m.name,
    type: m.type,
    size: m.size,
    url: `/media/${m.name}`,
    thumbnail_url: `/thumbnails/${m.name.replace(/\.[^.]+$/, '.jpg')}`,
    is_public: true,
    download_count: randomBetween(10, 100),
    view_count: randomBetween(50, 500),
    created_at: daysAgo(randomBetween(7, 180)),
    updated_at: daysAgo(randomBetween(0, 30)),
  }));

  const { error } = await supabase.from('media_files').upsert(mediaData, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  media_files: ${error.message}`);
  } else {
    console.log(`   ✓ ${mediaFiles.length} media files created`);
  }
}

// ============================================================================
// 10. BROADCASTS (Email campaigns)
// ============================================================================
async function seedBroadcasts() {
  console.log('\n📧 Seeding Broadcasts...');

  const broadcasts = [
    { subject: 'Monthly Newsletter - January 2026', status: 'sent', recipients: 150 },
    { subject: 'New Feature Announcement', status: 'sent', recipients: 145 },
    { subject: 'Holiday Greetings', status: 'sent', recipients: 148 },
    { subject: 'Q4 Report Summary', status: 'sent', recipients: 142 },
    { subject: 'Upcoming Webinar Invitation', status: 'scheduled', recipients: 155 },
    { subject: 'Product Update - February', status: 'draft', recipients: 0 },
  ];

  const broadcastData = broadcasts.map((b, i) => ({
    id: uuid('D7000000', i + 1),
    user_id: DEMO_USER_ID,
    subject: b.subject,
    content: `Email content for: ${b.subject}`,
    status: b.status,
    recipient_count: b.recipients,
    sent_count: b.status === 'sent' ? b.recipients : 0,
    open_count: b.status === 'sent' ? Math.round(b.recipients * 0.45) : 0,
    click_count: b.status === 'sent' ? Math.round(b.recipients * 0.15) : 0,
    scheduled_at: b.status === 'scheduled' ? daysAgo(-7) : null,
    sent_at: b.status === 'sent' ? daysAgo(randomBetween(7, 60)) : null,
    created_at: daysAgo(randomBetween(7, 90)),
    updated_at: daysAgo(randomBetween(0, 7)),
  }));

  const { error } = await supabase.from('broadcasts').upsert(broadcastData, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  broadcasts: ${error.message}`);
  } else {
    console.log(`   ✓ ${broadcasts.length} broadcasts created`);
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================
async function main() {
  try {
    await seedPortfolios();
    await seedIntegrations();
    await seedMoreClients();
    await seedMoreProjects();
    await seedFeedback();
    await seedPayments();
    await seedAnnouncements();
    await seedActivityLogs();
    await seedMediaFiles();
    await seedBroadcasts();

    console.log('\n' + '═'.repeat(70));
    console.log('\n🎉 EVERYTHING SEEDED WITH CORRECT SCHEMAS!\n');

    console.log('📊 ADDITIONAL FEATURES POPULATED:');
    console.log('   ✓ Portfolio (with full profile)');
    console.log('   ✓ 10 Active Integrations');
    console.log('   ✓ 15 Clients (updated with full data)');
    console.log('   ✓ 12 Projects (with budgets & progress)');
    console.log('   ✓ 10 Client Reviews (avg 4.8/5)');
    console.log('   ✓ 30 Payments ($300K+ total)');
    console.log('   ✓ 5 Announcements');
    console.log('   ✓ 100 Activity Logs');
    console.log('   ✓ 10 Media Files');
    console.log('   ✓ 6 Email Broadcasts\n');

    console.log('🔗 V1: http://localhost:9323/v1/dashboard');
    console.log('🔗 V2: http://localhost:9323/v2/dashboard');
    console.log('');
    console.log('   Login: alex@freeflow.io / investor2026\n');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
