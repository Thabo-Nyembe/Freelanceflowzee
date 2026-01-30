#!/usr/bin/env node
/**
 * COMPLETE INVESTOR STORY SEED SCRIPT v2
 * Fixed schema mappings based on actual database structure
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

const uuid = (prefix, num) => `${prefix}-0000-0000-0000-${String(num).padStart(12, '0')}`;
const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

console.log('🚀 SEEDING COMPLETE INVESTOR STORY v2\n');
console.log('═'.repeat(60));

// ============================================================================
// MESSAGES & CHATS - Fixed schema
// ============================================================================
async function seedMessages() {
  console.log('\n💬 Seeding Messages & Chats...');

  const chats = [
    { id: uuid('32000000', 1), name: 'TechStartup Project', type: 'project' },
    { id: uuid('32000000', 2), name: 'Design Team', type: 'team' },
    { id: uuid('32000000', 3), name: 'Sarah Johnson', type: 'direct' },
    { id: uuid('32000000', 4), name: 'Michael Chen', type: 'direct' },
    { id: uuid('32000000', 5), name: 'General', type: 'channel' },
  ];

  const chatData = chats.map(c => ({
    id: c.id,
    user_id: DEMO_USER_ID,
    name: c.name,
    description: `Chat for ${c.name}`,
    type: c.type,
    is_pinned: c.type === 'project',
    is_muted: false,
    is_archived: false,
    unread_count: Math.floor(Math.random() * 5),
    last_message_at: daysAgo(Math.floor(Math.random() * 5)),
    created_at: daysAgo(90),
    updated_at: daysAgo(Math.floor(Math.random() * 5)),
  }));

  const { error: chatError } = await supabase.from('chats').upsert(chatData, { onConflict: 'id' });
  if (chatError) {
    console.log(`   ⚠️  chats: ${chatError.message}`);
  } else {
    console.log(`   ✓ Created ${chats.length} chat threads`);
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
  for (const chat of chats) {
    const messageCount = Math.floor(Math.random() * 40) + 10;
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

  const { error: msgError } = await supabase.from('messages').upsert(messages, { onConflict: 'id' });
  if (msgError) {
    console.log(`   ⚠️  messages: ${msgError.message}`);
  } else {
    console.log(`   ✓ Created ${messages.length} messages`);
  }
}

// ============================================================================
// FILES - Fixed schema
// ============================================================================
async function seedFiles() {
  console.log('\n📁 Seeding Files & Documents...');

  const files = [
    { name: 'TechStartup_Website_Final', ext: 'fig', size: 15000000, folder: 'Client Projects' },
    { name: 'MobileApp_Designs_v3', ext: 'fig', size: 22000000, folder: 'Client Projects' },
    { name: 'Brand_Guidelines_2025', ext: 'pdf', size: 8500000, folder: 'Brand Assets' },
    { name: 'Logo_Package', ext: 'zip', size: 45000000, folder: 'Brand Assets' },
    { name: 'Master_Service_Agreement', ext: 'pdf', size: 250000, folder: 'Contracts' },
    { name: 'NDA_Template', ext: 'pdf', size: 120000, folder: 'Contracts' },
    { name: 'TechStartup_Contract_Signed', ext: 'pdf', size: 380000, folder: 'Contracts' },
    { name: 'Proposal_Ecommerce_Platform', ext: 'pdf', size: 1200000, folder: 'Proposals' },
    { name: 'Proposal_Dashboard_Analytics', ext: 'pdf', size: 980000, folder: 'Proposals' },
    { name: 'Invoice_Template', ext: 'xlsx', size: 45000, folder: 'Templates' },
    { name: 'Project_Brief_Template', ext: 'docx', size: 78000, folder: 'Templates' },
    { name: 'Design_System_Starter', ext: 'fig', size: 5000000, folder: 'Templates' },
    { name: 'Client_Presentation_Q4', ext: 'pptx', size: 15000000, folder: 'Presentations' },
    { name: 'Team_Photo_2025', ext: 'jpg', size: 2500000, folder: 'Media' },
    { name: 'Product_Demo_Video', ext: 'mp4', size: 85000000, folder: 'Media' },
  ];

  const mimeTypes = {
    pdf: 'application/pdf',
    fig: 'application/figma',
    zip: 'application/zip',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    jpg: 'image/jpeg',
    mp4: 'video/mp4',
  };

  const fileData = files.map((f, i) => ({
    id: uuid('34000000', i + 1),
    user_id: DEMO_USER_ID,
    owner_id: DEMO_USER_ID,
    name: f.name,
    extension: f.ext,
    size: f.size,
    mime_type: mimeTypes[f.ext] || 'application/octet-stream',
    url: `/files/${f.name}.${f.ext}`,
    is_starred: Math.random() > 0.8,
    is_shared: Math.random() > 0.5,
    is_deleted: false,
    downloads: Math.floor(Math.random() * 20),
    views: Math.floor(Math.random() * 50),
    uploaded_at: daysAgo(Math.floor(Math.random() * 180)),
    created_at: daysAgo(Math.floor(Math.random() * 180)),
    updated_at: daysAgo(Math.floor(Math.random() * 30)),
  }));

  const { error } = await supabase.from('files').upsert(fileData, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  files: ${error.message}`);
  } else {
    console.log(`   ✓ Created ${files.length} files`);
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    console.log(`   📊 Total storage: ${(totalSize / 1000000).toFixed(1)} MB`);
  }
}

// ============================================================================
// NOTIFICATIONS - Fixed schema
// ============================================================================
async function seedNotifications() {
  console.log('\n🔔 Seeding Notifications...');

  const notificationTemplates = [
    { title: 'New payment received', type: 'payment', category: 'billing' },
    { title: 'Invoice viewed by client', type: 'invoice', category: 'billing' },
    { title: 'New message from Sarah', type: 'message', category: 'communication' },
    { title: 'Project milestone completed', type: 'project', category: 'work' },
    { title: 'Meeting reminder: Client call', type: 'calendar', category: 'schedule' },
    { title: 'Task assigned to you', type: 'task', category: 'work' },
    { title: 'New client signed up', type: 'client', category: 'business' },
    { title: 'Weekly report ready', type: 'report', category: 'analytics' },
    { title: 'Contract signed', type: 'contract', category: 'business' },
    { title: 'File shared with you', type: 'file', category: 'collaboration' },
  ];

  const notifications = [];
  for (let i = 0; i < 30; i++) {
    const template = randomItem(notificationTemplates);
    notifications.push({
      id: uuid('38000000', i + 1),
      user_id: DEMO_USER_ID,
      title: template.title,
      message: `${template.title} - Click to view details`,
      type: template.type,
      category: template.category,
      priority: randomItem(['low', 'medium', 'high']),
      is_read: i > 5,
      read_at: i > 5 ? daysAgo(Math.floor(Math.random() * i)) : null,
      action_url: `/dashboard/${template.type}s`,
      created_at: daysAgo(i),
      updated_at: daysAgo(i),
    });
  }

  const { error } = await supabase.from('notifications').upsert(notifications, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  notifications: ${error.message}`);
  } else {
    console.log(`   ✓ Created ${notifications.length} notifications`);
    console.log(`   📊 Unread: 5 | Read: ${notifications.length - 5}`);
  }
}

// ============================================================================
// EXPENSES - Fixed schema
// ============================================================================
async function seedExpenses() {
  console.log('\n💳 Seeding Expenses...');

  const expenseItems = [
    { category: 'Software', desc: 'Figma Pro Annual', amount: 144 },
    { category: 'Software', desc: 'GitHub Team', amount: 44 },
    { category: 'Software', desc: 'Vercel Pro', amount: 20 },
    { category: 'Software', desc: 'Notion Workspace', amount: 10 },
    { category: 'Software', desc: 'Slack Business', amount: 15 },
    { category: 'Software', desc: 'Adobe Creative Cloud', amount: 55 },
    { category: 'Marketing', desc: 'Google Ads Campaign', amount: 500 },
    { category: 'Marketing', desc: 'LinkedIn Ads', amount: 300 },
    { category: 'Marketing', desc: 'Content Creation', amount: 250 },
    { category: 'Office', desc: 'Coworking Membership', amount: 350 },
    { category: 'Office', desc: 'Office Supplies', amount: 75 },
    { category: 'Professional', desc: 'Accounting Services', amount: 200 },
    { category: 'Professional', desc: 'Legal Consultation', amount: 500 },
    { category: 'Travel', desc: 'Client Meeting - NYC', amount: 450 },
    { category: 'Travel', desc: 'Conference Registration', amount: 299 },
    { category: 'Equipment', desc: 'Monitor Upgrade', amount: 599 },
    { category: 'Equipment', desc: 'Keyboard & Mouse', amount: 199 },
  ];

  const expenses = [];
  for (let month = 0; month < 12; month++) {
    // Add 5-8 expenses per month
    const count = Math.floor(Math.random() * 4) + 5;
    for (let i = 0; i < count; i++) {
      const item = randomItem(expenseItems);
      const date = new Date();
      date.setMonth(date.getMonth() - month);
      date.setDate(Math.floor(Math.random() * 28) + 1);

      expenses.push({
        id: uuid('41000000', expenses.length + 1),
        user_id: DEMO_USER_ID,
        category: item.category,
        description: item.desc,
        amount: item.amount + Math.floor(Math.random() * 50),
        currency: 'USD',
        date: date.toISOString().slice(0, 10),
        is_reimbursable: item.category === 'Travel',
        is_reimbursed: item.category === 'Travel' && Math.random() > 0.3,
        tags: [item.category.toLowerCase()],
        metadata: {},
        created_at: date.toISOString(),
        updated_at: date.toISOString(),
      });
    }
  }

  const { error } = await supabase.from('expenses').upsert(expenses.slice(0, 80), { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  expenses: ${error.message}`);
  } else {
    console.log(`   ✓ Created ${Math.min(expenses.length, 80)} expenses`);
    const total = expenses.slice(0, 80).reduce((sum, e) => sum + e.amount, 0);
    console.log(`   📊 Total expenses: $${total.toLocaleString()}`);
  }
}

// ============================================================================
// SUPPORT TICKETS - Fixed schema
// ============================================================================
async function seedSupport() {
  console.log('\n🎫 Seeding Support Tickets...');

  const tickets = [
    { subject: 'Invoice payment question', status: 'resolved', priority: 'medium' },
    { subject: 'Feature request: Dark mode', status: 'resolved', priority: 'low' },
    { subject: 'Login issue on mobile', status: 'resolved', priority: 'high' },
    { subject: 'Need project status update', status: 'resolved', priority: 'medium' },
    { subject: 'Contract renewal discussion', status: 'resolved', priority: 'high' },
    { subject: 'API documentation question', status: 'in_progress', priority: 'medium' },
    { subject: 'Performance optimization request', status: 'open', priority: 'low' },
  ];

  const ticketData = tickets.map((t, i) => ({
    id: uuid('43000000', i + 1),
    user_id: DEMO_USER_ID,
    ticket_number: `TKT-2025-${String(i + 1).padStart(4, '0')}`,
    subject: t.subject,
    description: `Support request: ${t.subject}`,
    status: t.status,
    priority: t.priority,
    resolved_at: t.status === 'resolved' ? daysAgo(Math.floor(Math.random() * 30)) : null,
    created_at: daysAgo(Math.floor(Math.random() * 60)),
  }));

  const { error } = await supabase.from('support_tickets').upsert(ticketData, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  support_tickets: ${error.message}`);
  } else {
    console.log(`   ✓ Created ${tickets.length} support tickets`);
    const resolved = tickets.filter(t => t.status === 'resolved').length;
    console.log(`   📊 Resolution rate: ${Math.round(resolved/tickets.length*100)}%`);
  }
}

// ============================================================================
// VIDEO STUDIO PROJECTS
// ============================================================================
async function seedVideoProjects() {
  console.log('\n🎬 Seeding Video Studio Projects...');

  const projects = [
    { title: 'Product Demo Video', status: 'completed', duration: 180 },
    { title: 'Client Testimonial - TechStartup', status: 'completed', duration: 120 },
    { title: 'Company Overview', status: 'completed', duration: 240 },
    { title: 'Tutorial: Getting Started', status: 'in_progress', duration: 300 },
    { title: 'Social Media Teaser', status: 'draft', duration: 30 },
  ];

  const videoData = projects.map((p, i) => ({
    id: uuid('46000000', i + 1),
    user_id: DEMO_USER_ID,
    title: p.title,
    description: `Video project: ${p.title}`,
    status: p.status,
    duration_seconds: p.duration,
    resolution: '1920x1080',
    format: 'mp4',
    created_at: daysAgo(Math.floor(Math.random() * 90)),
    updated_at: daysAgo(Math.floor(Math.random() * 7)),
  }));

  const { error } = await supabase.from('video_studio_projects').upsert(videoData, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  video_studio_projects: ${error.message}`);
  } else {
    console.log(`   ✓ Created ${projects.length} video projects`);
  }
}

// ============================================================================
// AI CONVERSATIONS
// ============================================================================
async function seedAIConversations() {
  console.log('\n🤖 Seeding AI Conversations...');

  const conversations = [
    { title: 'Email draft for client proposal', type: 'email' },
    { title: 'Code review assistance', type: 'code' },
    { title: 'Marketing copy generation', type: 'content' },
    { title: 'Project timeline planning', type: 'planning' },
    { title: 'Contract clause review', type: 'legal' },
    { title: 'Design feedback analysis', type: 'design' },
    { title: 'Bug debugging session', type: 'code' },
    { title: 'Invoice template suggestions', type: 'business' },
  ];

  const convData = conversations.map((c, i) => ({
    id: uuid('47000000', i + 1),
    user_id: DEMO_USER_ID,
    title: c.title,
    type: c.type,
    message_count: Math.floor(Math.random() * 20) + 5,
    created_at: daysAgo(Math.floor(Math.random() * 60)),
    updated_at: daysAgo(Math.floor(Math.random() * 7)),
  }));

  const { error } = await supabase.from('ai_conversations').upsert(convData, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  ai_conversations: ${error.message}`);
  } else {
    console.log(`   ✓ Created ${conversations.length} AI conversations`);
  }
}

// ============================================================================
// BOOKINGS
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

  const bookings = [];
  for (let i = 0; i < 25; i++) {
    const type = randomItem(bookingTypes);
    const daysOffset = Math.floor(Math.random() * 60) - 30; // Past and future
    const date = new Date(Date.now() + daysOffset * 24 * 60 * 60 * 1000);
    date.setHours(9 + Math.floor(Math.random() * 8), 0, 0);

    bookings.push({
      id: uuid('48000000', i + 1),
      user_id: DEMO_USER_ID,
      title: type.title,
      duration_minutes: type.duration,
      start_time: date.toISOString(),
      end_time: new Date(date.getTime() + type.duration * 60000).toISOString(),
      status: daysOffset < 0 ? 'completed' : 'confirmed',
      attendee_email: `client${i}@example.com`,
      attendee_name: `Client ${i + 1}`,
      notes: `${type.title} with client`,
      created_at: daysAgo(Math.abs(daysOffset) + 7),
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
// DEALS / SALES PIPELINE
// ============================================================================
async function seedDeals() {
  console.log('\n💼 Seeding Deals & Pipeline...');

  const deals = [
    { title: 'TechStartup Website Redesign', value: 75000, stage: 'closed_won' },
    { title: 'Mobile App Development', value: 120000, stage: 'closed_won' },
    { title: 'Brand Identity Package', value: 25000, stage: 'closed_won' },
    { title: 'E-commerce Platform', value: 95000, stage: 'proposal' },
    { title: 'Dashboard Analytics', value: 45000, stage: 'negotiation' },
    { title: 'API Integration', value: 35000, stage: 'discovery' },
    { title: 'SaaS MVP Development', value: 150000, stage: 'qualified' },
    { title: 'Marketing Website', value: 28000, stage: 'proposal' },
  ];

  const dealData = deals.map((d, i) => ({
    id: uuid('49000000', i + 1),
    user_id: DEMO_USER_ID,
    title: d.title,
    value: d.value,
    currency: 'USD',
    stage: d.stage,
    probability: d.stage === 'closed_won' ? 100 : d.stage === 'negotiation' ? 75 : d.stage === 'proposal' ? 50 : 25,
    expected_close_date: d.stage === 'closed_won' ? daysAgo(Math.floor(Math.random() * 90)) : daysAgo(-Math.floor(Math.random() * 30)),
    created_at: daysAgo(Math.floor(Math.random() * 120)),
    updated_at: daysAgo(Math.floor(Math.random() * 14)),
  }));

  const { error } = await supabase.from('deals').upsert(dealData, { onConflict: 'id' });
  if (error) {
    // Try crm_deals
    const { error: error2 } = await supabase.from('crm_deals').upsert(dealData, { onConflict: 'id' });
    if (error2) {
      console.log(`   ⚠️  deals: ${error.message}`);
    } else {
      console.log(`   ✓ Created ${deals.length} deals in pipeline`);
    }
  } else {
    console.log(`   ✓ Created ${deals.length} deals in pipeline`);
    const won = deals.filter(d => d.stage === 'closed_won').reduce((sum, d) => sum + d.value, 0);
    const pipeline = deals.filter(d => d.stage !== 'closed_won').reduce((sum, d) => sum + d.value, 0);
    console.log(`   📊 Won: $${won.toLocaleString()} | Pipeline: $${pipeline.toLocaleString()}`);
  }
}

// ============================================================================
// CONTRACTS
// ============================================================================
async function seedContracts() {
  console.log('\n📝 Seeding Contracts...');

  const contracts = [
    { title: 'Master Service Agreement - TechStartup', status: 'active', value: 75000 },
    { title: 'NDA - Creative Agency', status: 'active', value: 0 },
    { title: 'Project Contract - Mobile App', status: 'active', value: 120000 },
    { title: 'Retainer Agreement - HealthTech', status: 'active', value: 5000 },
    { title: 'SOW - Dashboard Project', status: 'pending_signature', value: 45000 },
    { title: 'NDA - Enterprise Client', status: 'pending_signature', value: 0 },
    { title: 'Completed Project - Local Cafe', status: 'completed', value: 8500 },
  ];

  const contractData = contracts.map((c, i) => ({
    id: uuid('50000000', i + 1),
    user_id: DEMO_USER_ID,
    title: c.title,
    status: c.status,
    value: c.value,
    currency: 'USD',
    start_date: daysAgo(Math.floor(Math.random() * 180)),
    end_date: c.status === 'completed' ? daysAgo(Math.floor(Math.random() * 30)) : daysAgo(-365),
    created_at: daysAgo(Math.floor(Math.random() * 180)),
    updated_at: daysAgo(Math.floor(Math.random() * 14)),
  }));

  const { error } = await supabase.from('contracts').upsert(contractData, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  contracts: ${error.message}`);
  } else {
    console.log(`   ✓ Created ${contracts.length} contracts`);
    const active = contracts.filter(c => c.status === 'active').length;
    console.log(`   📊 Active: ${active} | Pending: ${contracts.filter(c => c.status === 'pending_signature').length}`);
  }
}

// ============================================================================
// FEEDBACK & REVIEWS
// ============================================================================
async function seedFeedback() {
  console.log('\n⭐ Seeding Client Feedback...');

  const feedbackItems = [
    { rating: 5, comment: 'Exceptional work! The team delivered beyond expectations.' },
    { rating: 5, comment: 'Great communication throughout the project.' },
    { rating: 5, comment: 'Would highly recommend. Very professional.' },
    { rating: 4, comment: 'Good work, delivered on time.' },
    { rating: 5, comment: 'Amazing attention to detail.' },
    { rating: 5, comment: 'The best agency we have worked with!' },
    { rating: 4, comment: 'Solid work, minor revisions needed.' },
    { rating: 5, comment: 'Transformed our business with their solutions.' },
  ];

  const feedbackData = feedbackItems.map((f, i) => ({
    id: uuid('51000000', i + 1),
    user_id: DEMO_USER_ID,
    rating: f.rating,
    comment: f.comment,
    client_name: `Client ${i + 1}`,
    project_name: `Project ${i + 1}`,
    is_public: true,
    created_at: daysAgo(Math.floor(Math.random() * 180)),
  }));

  const { error } = await supabase.from('feedback').upsert(feedbackData, { onConflict: 'id' });
  if (error) {
    // Try client_reviews
    const { error: error2 } = await supabase.from('client_reviews').upsert(feedbackData, { onConflict: 'id' });
    if (error2) {
      console.log(`   ⚠️  feedback: ${error.message}`);
    } else {
      console.log(`   ✓ Created ${feedbackItems.length} client reviews`);
    }
  } else {
    console.log(`   ✓ Created ${feedbackItems.length} feedback entries`);
    const avgRating = feedbackItems.reduce((sum, f) => sum + f.rating, 0) / feedbackItems.length;
    console.log(`   📊 Average rating: ${avgRating.toFixed(1)}/5 ⭐`);
  }
}

// ============================================================================
// LEADS
// ============================================================================
async function seedLeads() {
  console.log('\n🎯 Seeding Leads...');

  const leads = [
    { name: 'Jennifer Walsh', company: 'Retail Brand', status: 'qualified', value: 42000 },
    { name: 'Chris Martinez', company: 'SaaS Startup', status: 'new', value: 75000 },
    { name: 'Amanda Foster', company: 'Media Group', status: 'contacted', value: 38000 },
    { name: 'Kevin O\'Brien', company: 'Finance Corp', status: 'qualified', value: 120000 },
    { name: 'Rachel Green', company: 'Fashion Brand', status: 'new', value: 55000 },
    { name: 'Tom Anderson', company: 'EdTech Co', status: 'proposal_sent', value: 85000 },
    { name: 'Lisa Wang', company: 'Healthcare Org', status: 'qualified', value: 95000 },
    { name: 'Mark Johnson', company: 'Real Estate', status: 'contacted', value: 32000 },
  ];

  const leadData = leads.map((l, i) => ({
    id: uuid('52000000', i + 1),
    user_id: DEMO_USER_ID,
    name: l.name,
    email: l.name.toLowerCase().replace(/[' ]/g, '.') + '@example.com',
    company: l.company,
    status: l.status,
    estimated_value: l.value,
    source: randomItem(['website', 'referral', 'linkedin', 'conference']),
    created_at: daysAgo(Math.floor(Math.random() * 60)),
    updated_at: daysAgo(Math.floor(Math.random() * 7)),
  }));

  const { error } = await supabase.from('leads').upsert(leadData, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  leads: ${error.message}`);
  } else {
    console.log(`   ✓ Created ${leads.length} leads`);
    const totalValue = leads.reduce((sum, l) => sum + l.value, 0);
    console.log(`   📊 Total pipeline value: $${totalValue.toLocaleString()}`);
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================
async function main() {
  try {
    await seedMessages();
    await seedFiles();
    await seedNotifications();
    await seedExpenses();
    await seedSupport();
    await seedVideoProjects();
    await seedAIConversations();
    await seedBookings();
    await seedDeals();
    await seedContracts();
    await seedFeedback();
    await seedLeads();

    console.log('\n' + '═'.repeat(60));
    console.log('\n🎉 COMPLETE STORY SEEDING v2 FINISHED!\n');

    console.log('📖 FEATURES NOW POPULATED:');
    console.log('   ✓ Messages & Chats');
    console.log('   ✓ Files & Documents');
    console.log('   ✓ Notifications');
    console.log('   ✓ Expenses');
    console.log('   ✓ Support Tickets');
    console.log('   ✓ Video Studio Projects');
    console.log('   ✓ AI Conversations');
    console.log('   ✓ Bookings');
    console.log('   ✓ Deals & Pipeline');
    console.log('   ✓ Contracts');
    console.log('   ✓ Client Feedback');
    console.log('   ✓ Leads\n');

    console.log('🔗 Test at: http://localhost:9323');
    console.log('   Email: alex@freeflow.io');
    console.log('   Password: investor2026\n');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
