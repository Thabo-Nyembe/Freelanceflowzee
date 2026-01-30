#!/usr/bin/env node
/**
 * FULL APP USAGE SEED - Maximum data for ALL features
 * Works with both V1 and V2 dashboards
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

console.log('🚀 SEEDING FULL APP USAGE DATA\n');
console.log('═'.repeat(70));
console.log('This will populate ALL features for testing in V1 and V2');
console.log('═'.repeat(70));

// ============================================================================
// 1. MORE PROJECTS with detailed data
// ============================================================================
async function seedMoreProjects() {
  console.log('\n📁 Seeding More Projects...');

  const projects = [
    // Active projects
    { title: 'TechStartup Mobile App', status: 'active', budget: 85000, progress: 65, priority: 'high' },
    { title: 'E-commerce Platform v2', status: 'active', budget: 120000, progress: 40, priority: 'high' },
    { title: 'Healthcare Dashboard', status: 'active', budget: 55000, progress: 80, priority: 'medium' },
    { title: 'FinTech API Integration', status: 'active', budget: 45000, progress: 25, priority: 'high' },
    { title: 'Real Estate Portal', status: 'active', budget: 75000, progress: 55, priority: 'medium' },

    // Completed projects
    { title: 'Brand Identity - Nordic Design', status: 'completed', budget: 28000, progress: 100, priority: 'medium' },
    { title: 'SaaS Dashboard Analytics', status: 'completed', budget: 65000, progress: 100, priority: 'high' },
    { title: 'Restaurant Booking System', status: 'completed', budget: 35000, progress: 100, priority: 'low' },
    { title: 'Fitness App MVP', status: 'completed', budget: 42000, progress: 100, priority: 'medium' },
    { title: 'Legal Document Portal', status: 'completed', budget: 58000, progress: 100, priority: 'high' },
    { title: 'Education Platform', status: 'completed', budget: 95000, progress: 100, priority: 'high' },
    { title: 'IoT Monitoring Dashboard', status: 'completed', budget: 72000, progress: 100, priority: 'medium' },

    // On hold / Planning
    { title: 'AI Chatbot Integration', status: 'on_hold', budget: 38000, progress: 15, priority: 'low' },
    { title: 'Blockchain Wallet App', status: 'planning', budget: 150000, progress: 5, priority: 'medium' },
    { title: 'VR Training Platform', status: 'planning', budget: 200000, progress: 0, priority: 'low' },
  ];

  const projectData = projects.map((p, i) => ({
    id: uuid('70000000', i + 1),
    user_id: DEMO_USER_ID,
    title: p.title,
    description: `Project: ${p.title}. Full-service ${p.title.toLowerCase()} development including design, development, testing, and deployment.`,
    status: p.status,
    budget: p.budget,
    spent: Math.round(p.budget * p.progress / 100),
    progress: p.progress,
    priority: p.priority,
    start_date: daysAgo(randomBetween(30, 180)),
    end_date: p.status === 'completed' ? daysAgo(randomBetween(1, 30)) : daysAgo(-randomBetween(30, 90)),
    created_at: daysAgo(randomBetween(60, 200)),
    updated_at: daysAgo(randomBetween(0, 7)),
  }));

  const { error } = await supabase.from('projects').upsert(projectData, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  projects: ${error.message}`);
  } else {
    console.log(`   ✓ Created ${projects.length} projects`);
    console.log(`   📊 Active: ${projects.filter(p => p.status === 'active').length} | Completed: ${projects.filter(p => p.status === 'completed').length}`);
  }
}

// ============================================================================
// 2. MORE TASKS across all projects
// ============================================================================
async function seedMoreTasks() {
  console.log('\n✅ Seeding More Tasks...');

  const taskTemplates = [
    // Design tasks
    { title: 'Create wireframes', category: 'design', priority: 'high' },
    { title: 'Design system components', category: 'design', priority: 'medium' },
    { title: 'UI mockups review', category: 'design', priority: 'high' },
    { title: 'Prototype interactions', category: 'design', priority: 'medium' },
    { title: 'Design handoff documentation', category: 'design', priority: 'low' },

    // Development tasks
    { title: 'Setup project repository', category: 'development', priority: 'high' },
    { title: 'Implement authentication', category: 'development', priority: 'high' },
    { title: 'Build API endpoints', category: 'development', priority: 'high' },
    { title: 'Database schema design', category: 'development', priority: 'high' },
    { title: 'Frontend components', category: 'development', priority: 'medium' },
    { title: 'State management setup', category: 'development', priority: 'medium' },
    { title: 'API integration', category: 'development', priority: 'high' },
    { title: 'Performance optimization', category: 'development', priority: 'medium' },
    { title: 'Code review', category: 'development', priority: 'medium' },

    // Testing tasks
    { title: 'Unit tests', category: 'testing', priority: 'medium' },
    { title: 'Integration tests', category: 'testing', priority: 'medium' },
    { title: 'E2E testing', category: 'testing', priority: 'high' },
    { title: 'Performance testing', category: 'testing', priority: 'low' },
    { title: 'Security audit', category: 'testing', priority: 'high' },

    // Project management
    { title: 'Client kickoff meeting', category: 'meeting', priority: 'high' },
    { title: 'Sprint planning', category: 'meeting', priority: 'medium' },
    { title: 'Weekly status update', category: 'meeting', priority: 'medium' },
    { title: 'Stakeholder demo', category: 'meeting', priority: 'high' },
    { title: 'Project documentation', category: 'docs', priority: 'low' },
    { title: 'Technical documentation', category: 'docs', priority: 'medium' },
  ];

  const statuses = ['completed', 'completed', 'completed', 'in_progress', 'in_progress', 'todo', 'todo'];

  const tasks = [];
  for (let i = 0; i < 80; i++) {
    const template = taskTemplates[i % taskTemplates.length];
    const status = randomItem(statuses);

    tasks.push({
      id: uuid('71000000', i + 1),
      user_id: DEMO_USER_ID,
      title: `${template.title} - Task ${i + 1}`,
      description: `${template.category}: ${template.title}`,
      status: status,
      priority: template.priority,
      due_date: status === 'todo' ? daysAgo(-randomBetween(1, 14)) : null,
      completed_at: status === 'completed' ? daysAgo(randomBetween(1, 60)) : null,
      tags: [template.category],
      created_at: daysAgo(randomBetween(1, 90)),
      updated_at: daysAgo(randomBetween(0, 7)),
    });
  }

  const { error } = await supabase.from('tasks').upsert(tasks, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  tasks: ${error.message}`);
  } else {
    console.log(`   ✓ Created ${tasks.length} tasks`);
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    console.log(`   📊 Completed: ${completed} | In Progress: ${inProgress} | Todo: ${tasks.length - completed - inProgress}`);
  }
}

// ============================================================================
// 3. MORE INVOICES with line items
// ============================================================================
async function seedMoreInvoices() {
  console.log('\n💰 Seeding More Invoices...');

  const clients = [
    { name: 'TechVenture Capital', email: 'billing@techventure.com' },
    { name: 'Creative Studios Inc', email: 'accounts@creativestudios.com' },
    { name: 'HealthTech Solutions', email: 'finance@healthtech.co' },
    { name: 'Nordic Design Group', email: 'billing@nordicdesign.com' },
    { name: 'DataPulse Analytics', email: 'ap@datapulse.io' },
    { name: 'CloudSync Technologies', email: 'billing@cloudsync.tech' },
  ];

  const invoices = [];
  const statuses = ['paid', 'paid', 'paid', 'paid', 'sent', 'sent', 'viewed', 'overdue', 'draft'];

  for (let i = 0; i < 40; i++) {
    const client = randomItem(clients);
    const status = randomItem(statuses);
    const subtotal = randomBetween(2000, 25000);
    const taxRate = randomBetween(5, 10);
    const discount = Math.random() > 0.7 ? randomBetween(100, 500) : 0;

    invoices.push({
      id: uuid('72000000', i + 1),
      user_id: DEMO_USER_ID,
      invoice_number: `INV-2025-${String(i + 100).padStart(4, '0')}`,
      client_name: client.name,
      client_email: client.email,
      status: status,
      items: [
        { description: 'Professional Services', quantity: randomBetween(10, 40), rate: randomBetween(100, 200), amount: subtotal * 0.6 },
        { description: 'Development Hours', quantity: randomBetween(5, 20), rate: randomBetween(125, 175), amount: subtotal * 0.3 },
        { description: 'Project Management', quantity: randomBetween(2, 8), rate: randomBetween(75, 125), amount: subtotal * 0.1 },
      ],
      subtotal: subtotal,
      tax_rate: taxRate,
      tax_amount: Math.round(subtotal * taxRate / 100),
      discount: discount,
      total: Math.round(subtotal * (1 + taxRate / 100) - discount),
      currency: 'USD',
      due_date: status === 'paid' ? daysAgo(randomBetween(30, 90)) : daysAgo(-randomBetween(7, 30)),
      paid_date: status === 'paid' ? daysAgo(randomBetween(1, 30)) : null,
      notes: 'Thank you for your business!',
      terms: 'Net 30. Late payments subject to 1.5% monthly interest.',
      created_at: daysAgo(randomBetween(1, 120)),
      updated_at: daysAgo(randomBetween(0, 14)),
    });
  }

  const { error } = await supabase.from('invoices').upsert(invoices, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  invoices: ${error.message}`);
  } else {
    console.log(`   ✓ Created ${invoices.length} invoices`);
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
    const pending = invoices.filter(i => ['sent', 'viewed'].includes(i.status)).reduce((sum, i) => sum + i.total, 0);
    console.log(`   📊 Paid: $${totalRevenue.toLocaleString()} | Pending: $${pending.toLocaleString()}`);
  }
}

// ============================================================================
// 4. MORE TIME ENTRIES
// ============================================================================
async function seedMoreTimeEntries() {
  console.log('\n⏱️  Seeding More Time Entries...');

  const projects = ['Mobile App', 'E-commerce Platform', 'Healthcare Dashboard', 'API Integration', 'Brand Identity'];
  const taskTypes = ['Development', 'Design', 'Meeting', 'Research', 'Testing', 'Documentation', 'Code Review'];

  const entries = [];

  // Generate 12 months of time entries
  for (let day = 0; day < 365; day++) {
    const date = new Date(Date.now() - day * 24 * 60 * 60 * 1000);

    // Skip most weekends
    if (date.getDay() === 0) continue;
    if (date.getDay() === 6 && Math.random() > 0.2) continue;

    // 3-6 entries per day
    const entriesPerDay = randomBetween(3, 6);

    for (let i = 0; i < entriesPerDay; i++) {
      const duration = randomBetween(30, 240); // 30 min to 4 hours
      const hour = 8 + i * 2;
      const startTime = new Date(date);
      startTime.setHours(hour, 0, 0);

      entries.push({
        id: uuid('73000000', entries.length + 1),
        user_id: DEMO_USER_ID,
        project_name: randomItem(projects),
        task_name: randomItem(taskTypes),
        description: `${randomItem(taskTypes)} work`,
        duration_minutes: duration,
        start_time: startTime.toISOString(),
        end_time: new Date(startTime.getTime() + duration * 60000).toISOString(),
        is_billable: Math.random() > 0.15, // 85% billable
        hourly_rate: randomBetween(100, 175),
        status: 'completed',
        created_at: startTime.toISOString(),
      });
    }
  }

  // Take the most recent 1000 entries
  const recentEntries = entries.slice(0, 1000);

  const { error } = await supabase.from('time_entries').upsert(recentEntries, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  time_entries: ${error.message}`);
  } else {
    console.log(`   ✓ Created ${recentEntries.length} time entries`);
    const totalHours = recentEntries.reduce((sum, e) => sum + e.duration_minutes, 0) / 60;
    const billableHours = recentEntries.filter(e => e.is_billable).reduce((sum, e) => sum + e.duration_minutes, 0) / 60;
    console.log(`   📊 Total: ${Math.round(totalHours)}h | Billable: ${Math.round(billableHours)}h (${Math.round(billableHours/totalHours*100)}%)`);
  }
}

// ============================================================================
// 5. MORE CALENDAR EVENTS
// ============================================================================
async function seedMoreCalendarEvents() {
  console.log('\n📅 Seeding More Calendar Events...');

  const eventTypes = [
    { title: 'Client Call', duration: 60, color: '#4F46E5', type: 'meeting' },
    { title: 'Team Standup', duration: 15, color: '#10B981', type: 'meeting' },
    { title: 'Sprint Planning', duration: 120, color: '#F59E0B', type: 'meeting' },
    { title: 'Design Review', duration: 45, color: '#EC4899', type: 'meeting' },
    { title: 'Code Review', duration: 30, color: '#8B5CF6', type: 'meeting' },
    { title: 'Project Kickoff', duration: 90, color: '#14B8A6', type: 'meeting' },
    { title: 'Stakeholder Demo', duration: 60, color: '#F97316', type: 'meeting' },
    { title: 'Training Session', duration: 120, color: '#06B6D4', type: 'event' },
    { title: 'Workshop', duration: 180, color: '#84CC16', type: 'event' },
    { title: 'Conference Call', duration: 60, color: '#A855F7', type: 'meeting' },
  ];

  const clients = ['TechVenture', 'Creative Studios', 'HealthTech', 'Nordic Design', 'DataPulse', 'CloudSync'];
  const events = [];

  // Past 180 days + next 60 days
  for (let day = -180; day < 60; day++) {
    const date = new Date(Date.now() + day * 24 * 60 * 60 * 1000);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    // 2-5 events per day
    const eventsPerDay = randomBetween(2, 5);

    for (let i = 0; i < eventsPerDay; i++) {
      const eventType = randomItem(eventTypes);
      const hour = 9 + randomBetween(0, 8);
      const eventDate = new Date(date);
      eventDate.setHours(hour, 0, 0);

      events.push({
        id: uuid('74000000', events.length + 1),
        user_id: DEMO_USER_ID,
        title: `${eventType.title} - ${randomItem(clients)}`,
        description: `${eventType.title} with ${randomItem(clients)} team`,
        start_time: eventDate.toISOString(),
        end_time: new Date(eventDate.getTime() + eventType.duration * 60000).toISOString(),
        type: eventType.type,
        status: day < 0 ? 'completed' : 'scheduled',
        color: eventType.color,
        location: randomItem(['Zoom', 'Google Meet', 'Microsoft Teams', 'Office', 'Phone']),
        created_at: daysAgo(Math.max(0, -day + 7)),
      });
    }
  }

  const { error } = await supabase.from('calendar_events').upsert(events.slice(0, 500), { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  calendar_events: ${error.message}`);
  } else {
    console.log(`   ✓ Created ${Math.min(events.length, 500)} calendar events`);
    const past = events.filter(e => e.status === 'completed').length;
    const upcoming = events.filter(e => e.status === 'scheduled').length;
    console.log(`   📊 Completed: ${past} | Upcoming: ${upcoming}`);
  }
}

// ============================================================================
// 6. MORE FILES & DOCUMENTS
// ============================================================================
async function seedMoreFiles() {
  console.log('\n📁 Seeding More Files...');

  const fileCategories = [
    // Design files
    { name: 'Homepage_Design_Final', ext: 'fig', folder: 'Designs', size: 15000000 },
    { name: 'Mobile_App_Screens', ext: 'fig', folder: 'Designs', size: 22000000 },
    { name: 'Dashboard_Components', ext: 'fig', folder: 'Designs', size: 18000000 },
    { name: 'Icon_Library', ext: 'fig', folder: 'Designs', size: 8000000 },
    { name: 'Brand_Guidelines', ext: 'pdf', folder: 'Branding', size: 5500000 },
    { name: 'Logo_Package', ext: 'zip', folder: 'Branding', size: 45000000 },
    { name: 'Color_Palette', ext: 'pdf', folder: 'Branding', size: 1200000 },

    // Contracts & Legal
    { name: 'Master_Service_Agreement', ext: 'pdf', folder: 'Contracts', size: 350000 },
    { name: 'NDA_Template', ext: 'pdf', folder: 'Contracts', size: 180000 },
    { name: 'Statement_of_Work', ext: 'pdf', folder: 'Contracts', size: 420000 },
    { name: 'Contractor_Agreement', ext: 'pdf', folder: 'Contracts', size: 280000 },
    { name: 'Terms_of_Service', ext: 'pdf', folder: 'Legal', size: 150000 },
    { name: 'Privacy_Policy', ext: 'pdf', folder: 'Legal', size: 120000 },

    // Proposals
    { name: 'Proposal_Ecommerce_Platform', ext: 'pdf', folder: 'Proposals', size: 2500000 },
    { name: 'Proposal_Mobile_App', ext: 'pdf', folder: 'Proposals', size: 1800000 },
    { name: 'Proposal_Brand_Refresh', ext: 'pdf', folder: 'Proposals', size: 3200000 },
    { name: 'Proposal_SaaS_Dashboard', ext: 'pdf', folder: 'Proposals', size: 2100000 },

    // Documentation
    { name: 'API_Documentation', ext: 'pdf', folder: 'Documentation', size: 850000 },
    { name: 'User_Guide', ext: 'pdf', folder: 'Documentation', size: 4200000 },
    { name: 'Technical_Specs', ext: 'pdf', folder: 'Documentation', size: 1500000 },
    { name: 'Deployment_Guide', ext: 'pdf', folder: 'Documentation', size: 680000 },

    // Presentations
    { name: 'Client_Presentation_Q1', ext: 'pptx', folder: 'Presentations', size: 15000000 },
    { name: 'Project_Kickoff_Deck', ext: 'pptx', folder: 'Presentations', size: 12000000 },
    { name: 'Quarterly_Review', ext: 'pptx', folder: 'Presentations', size: 8500000 },
    { name: 'Company_Overview', ext: 'pptx', folder: 'Presentations', size: 18000000 },

    // Media
    { name: 'Product_Demo_Video', ext: 'mp4', folder: 'Media', size: 125000000 },
    { name: 'Team_Photo', ext: 'jpg', folder: 'Media', size: 4500000 },
    { name: 'Office_Tour', ext: 'mp4', folder: 'Media', size: 85000000 },
    { name: 'Client_Testimonial', ext: 'mp4', folder: 'Media', size: 55000000 },

    // Spreadsheets
    { name: 'Project_Timeline', ext: 'xlsx', folder: 'Planning', size: 250000 },
    { name: 'Budget_Tracker', ext: 'xlsx', folder: 'Finance', size: 180000 },
    { name: 'Resource_Allocation', ext: 'xlsx', folder: 'Planning', size: 320000 },
    { name: 'Invoice_Template', ext: 'xlsx', folder: 'Templates', size: 85000 },
  ];

  const mimeTypes = {
    pdf: 'application/pdf',
    fig: 'application/figma',
    zip: 'application/zip',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    jpg: 'image/jpeg',
    mp4: 'video/mp4',
  };

  const files = fileCategories.map((f, i) => ({
    id: uuid('75000000', i + 1),
    user_id: DEMO_USER_ID,
    owner_id: DEMO_USER_ID,
    name: f.name,
    extension: f.ext,
    size: f.size,
    mime_type: mimeTypes[f.ext] || 'application/octet-stream',
    url: `/files/${f.folder}/${f.name}.${f.ext}`,
    is_starred: Math.random() > 0.8,
    is_shared: Math.random() > 0.5,
    is_deleted: false,
    downloads: randomBetween(0, 50),
    views: randomBetween(5, 100),
    uploaded_at: daysAgo(randomBetween(1, 180)),
    created_at: daysAgo(randomBetween(1, 180)),
    updated_at: daysAgo(randomBetween(0, 30)),
  }));

  const { error } = await supabase.from('files').upsert(files, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  files: ${error.message}`);
  } else {
    console.log(`   ✓ Created ${files.length} files`);
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    console.log(`   📊 Total storage: ${(totalSize / 1000000000).toFixed(2)} GB`);
  }
}

// ============================================================================
// 7. MORE MESSAGES & CHATS
// ============================================================================
async function seedMoreMessages() {
  console.log('\n💬 Seeding More Messages...');

  // Create more chat threads
  const chatThreads = [
    { name: 'TechVenture Project', type: 'group' },
    { name: 'Design Team', type: 'group' },
    { name: 'Development Team', type: 'group' },
    { name: 'Sarah Johnson', type: 'direct' },
    { name: 'Michael Chen', type: 'direct' },
    { name: 'Emma Williams', type: 'direct' },
    { name: 'David Rodriguez', type: 'direct' },
    { name: 'General', type: 'group' },
    { name: 'Announcements', type: 'group' },
    { name: 'Random', type: 'group' },
  ];

  const chats = chatThreads.map((c, i) => ({
    id: uuid('76000000', i + 1),
    user_id: DEMO_USER_ID,
    name: c.name,
    description: `Chat: ${c.name}`,
    type: c.type,
    is_pinned: i < 3,
    is_muted: false,
    is_archived: false,
    unread_count: randomBetween(0, 8),
    last_message_at: hoursAgo(randomBetween(1, 48)),
    created_at: daysAgo(randomBetween(30, 180)),
    updated_at: hoursAgo(randomBetween(1, 24)),
  }));

  const { error: chatError } = await supabase.from('chats').upsert(chats, { onConflict: 'id' });
  if (chatError) {
    console.log(`   ⚠️  chats: ${chatError.message}`);
  } else {
    console.log(`   ✓ Created ${chats.length} chat threads`);
  }

  // Create messages
  const messageTemplates = [
    "Just finished the wireframes, ready for review!",
    "Great progress today! 🎉",
    "Can we schedule a quick call?",
    "The client approved the designs!",
    "Pushed latest updates to staging",
    "Let me know when you're free",
    "All tests passing ✅",
    "Thanks for the quick turnaround!",
    "Here's the updated proposal",
    "New feature is now live 🚀",
    "Can you review this PR?",
    "Meeting notes attached",
    "Good catch on that bug!",
    "Sprint demo at 3pm",
    "Invoice sent to client",
    "Project milestone completed",
    "Need your input on this",
    "Design looks great!",
    "Documentation updated",
    "Ready for deployment",
  ];

  const messages = [];
  for (const chat of chats) {
    const messageCount = randomBetween(20, 60);
    for (let i = 0; i < messageCount; i++) {
      messages.push({
        id: uuid('77000000', messages.length + 1),
        chat_id: chat.id,
        sender_id: DEMO_USER_ID,
        text: randomItem(messageTemplates),
        status: 'sent',
        is_edited: false,
        is_pinned: false,
        is_deleted: false,
        created_at: hoursAgo(randomBetween(1, 720)), // Last 30 days
      });
    }
  }

  const { error: msgError } = await supabase.from('messages').upsert(messages.slice(0, 400), { onConflict: 'id' });
  if (msgError) {
    console.log(`   ⚠️  messages: ${msgError.message}`);
  } else {
    console.log(`   ✓ Created ${Math.min(messages.length, 400)} messages`);
  }
}

// ============================================================================
// 8. MORE EXPENSES
// ============================================================================
async function seedMoreExpenses() {
  console.log('\n💳 Seeding More Expenses...');

  const expenseCategories = [
    { category: 'Software', items: ['Figma Pro', 'GitHub Enterprise', 'Vercel Pro', 'Notion Team', 'Slack Business+', 'Adobe CC', 'AWS', 'Supabase'] },
    { category: 'Marketing', items: ['Google Ads', 'LinkedIn Ads', 'Facebook Ads', 'Content Creation', 'SEO Tools', 'Email Marketing'] },
    { category: 'Office', items: ['Coworking Space', 'Internet', 'Phone', 'Office Supplies', 'Coffee & Snacks'] },
    { category: 'Equipment', items: ['MacBook Pro', 'Monitor', 'Keyboard', 'Mouse', 'Headphones', 'Standing Desk'] },
    { category: 'Professional', items: ['Accounting Services', 'Legal Consultation', 'Insurance', 'Consulting'] },
    { category: 'Travel', items: ['Client Meeting - NYC', 'Conference', 'Team Offsite', 'Flight', 'Hotel', 'Uber'] },
    { category: 'Training', items: ['Online Course', 'Conference Ticket', 'Books', 'Workshop'] },
    { category: 'Subscriptions', items: ['Dribbble Pro', 'ProductHunt', 'Medium', 'Spotify'] },
  ];

  const expenses = [];

  // 12 months of expenses
  for (let month = 0; month < 12; month++) {
    for (const cat of expenseCategories) {
      const count = randomBetween(1, 4);
      for (let i = 0; i < count; i++) {
        const item = randomItem(cat.items);
        const date = new Date();
        date.setMonth(date.getMonth() - month);
        date.setDate(randomBetween(1, 28));

        expenses.push({
          id: uuid('78000000', expenses.length + 1),
          user_id: DEMO_USER_ID,
          category: cat.category,
          description: item,
          amount: randomBetween(20, 2000),
          currency: 'USD',
          date: date.toISOString().slice(0, 10),
          is_reimbursable: cat.category === 'Travel',
          is_reimbursed: cat.category === 'Travel' && Math.random() > 0.3,
          tags: [cat.category.toLowerCase()],
          metadata: {},
          created_at: date.toISOString(),
          updated_at: date.toISOString(),
        });
      }
    }
  }

  const { error } = await supabase.from('expenses').upsert(expenses.slice(0, 200), { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  expenses: ${error.message}`);
  } else {
    console.log(`   ✓ Created ${Math.min(expenses.length, 200)} expenses`);
    const total = expenses.slice(0, 200).reduce((sum, e) => sum + e.amount, 0);
    console.log(`   📊 Total expenses: $${total.toLocaleString()}`);
  }
}

// ============================================================================
// 9. MORE NOTIFICATIONS
// ============================================================================
async function seedMoreNotifications() {
  console.log('\n🔔 Seeding More Notifications...');

  const notificationTypes = [
    { title: 'New payment received', type: 'payment', category: 'billing', priority: 'high' },
    { title: 'Invoice viewed by client', type: 'invoice', category: 'billing', priority: 'medium' },
    { title: 'Invoice is overdue', type: 'invoice', category: 'billing', priority: 'high' },
    { title: 'New message received', type: 'message', category: 'communication', priority: 'medium' },
    { title: 'Project milestone completed', type: 'project', category: 'work', priority: 'high' },
    { title: 'Task assigned to you', type: 'task', category: 'work', priority: 'medium' },
    { title: 'Task due tomorrow', type: 'task', category: 'work', priority: 'high' },
    { title: 'Meeting starting soon', type: 'calendar', category: 'schedule', priority: 'high' },
    { title: 'New client signed up', type: 'client', category: 'business', priority: 'high' },
    { title: 'Weekly report ready', type: 'report', category: 'analytics', priority: 'low' },
    { title: 'Contract signed', type: 'contract', category: 'business', priority: 'high' },
    { title: 'File shared with you', type: 'file', category: 'collaboration', priority: 'medium' },
    { title: 'Comment on your work', type: 'comment', category: 'collaboration', priority: 'medium' },
    { title: 'System update available', type: 'system', category: 'system', priority: 'low' },
    { title: 'New feature released', type: 'feature', category: 'system', priority: 'low' },
  ];

  const notifications = [];
  for (let i = 0; i < 60; i++) {
    const template = randomItem(notificationTypes);
    notifications.push({
      id: uuid('79000000', i + 1),
      user_id: DEMO_USER_ID,
      title: template.title,
      message: `${template.title} - Click to view details`,
      type: template.type,
      category: template.category,
      priority: template.priority,
      is_read: i > 8, // First 8 unread
      read_at: i > 8 ? hoursAgo(randomBetween(1, i * 2)) : null,
      action_url: `/dashboard/${template.type}s`,
      created_at: hoursAgo(i * 4),
      updated_at: hoursAgo(i * 4),
    });
  }

  const { error } = await supabase.from('notifications').upsert(notifications, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  notifications: ${error.message}`);
  } else {
    console.log(`   ✓ Created ${notifications.length} notifications`);
    console.log(`   📊 Unread: 8 | Read: ${notifications.length - 8}`);
  }
}

// ============================================================================
// 10. MORE AI CONVERSATIONS
// ============================================================================
async function seedMoreAIConversations() {
  console.log('\n🤖 Seeding More AI Conversations...');

  const conversations = [
    { title: 'Draft email to client about project delay', preview: 'Help me write a professional email...' },
    { title: 'Review React component for performance', preview: 'Can you review this useEffect hook...' },
    { title: 'Generate marketing copy for landing page', preview: 'I need compelling copy for...' },
    { title: 'Create project timeline estimate', preview: 'Help me estimate the timeline for...' },
    { title: 'Analyze contract terms', preview: 'Review this contract clause...' },
    { title: 'Summarize client feedback', preview: 'Here is feedback from 5 clients...' },
    { title: 'Debug TypeScript error', preview: 'Getting this type error...' },
    { title: 'Improve invoice design', preview: 'Suggest improvements for...' },
    { title: 'Write API documentation', preview: 'Document this REST endpoint...' },
    { title: 'Create meeting agenda', preview: 'Prepare agenda for client kickoff...' },
    { title: 'Optimize database query', preview: 'This query is slow...' },
    { title: 'Generate test cases', preview: 'Write unit tests for this function...' },
    { title: 'Design system suggestions', preview: 'Recommend color palette for...' },
    { title: 'Refactor legacy code', preview: 'Help me modernize this code...' },
    { title: 'Write proposal introduction', preview: 'Draft an intro paragraph...' },
    { title: 'Explain technical concept', preview: 'Explain microservices to client...' },
    { title: 'Create user story', preview: 'Write user story for checkout...' },
    { title: 'Review security practices', preview: 'Audit these auth patterns...' },
    { title: 'Generate social media posts', preview: 'Create LinkedIn posts about...' },
    { title: 'Translate to Spanish', preview: 'Translate this email to Spanish...' },
  ];

  const convData = conversations.map((c, i) => ({
    id: uuid('80000000', i + 1),
    user_id: DEMO_USER_ID,
    title: c.title,
    preview: c.preview,
    status: 'active',
    is_pinned: i < 3,
    is_archived: false,
    message_count: randomBetween(5, 30),
    total_tokens: randomBetween(1000, 8000),
    user_message_count: randomBetween(3, 15),
    assistant_message_count: randomBetween(3, 15),
    avg_rating: 4 + Math.random(),
    last_message_at: hoursAgo(randomBetween(1, 168)),
    tags: [c.title.split(' ')[0].toLowerCase()],
    created_at: daysAgo(randomBetween(1, 90)),
    updated_at: hoursAgo(randomBetween(1, 48)),
  }));

  const { error } = await supabase.from('ai_conversations').upsert(convData, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  ai_conversations: ${error.message}`);
  } else {
    console.log(`   ✓ Created ${conversations.length} AI conversations`);
    const totalTokens = convData.reduce((sum, c) => sum + c.total_tokens, 0);
    console.log(`   📊 Total tokens: ${totalTokens.toLocaleString()}`);
  }
}

// ============================================================================
// 11. MORE SUPPORT TICKETS
// ============================================================================
async function seedMoreSupportTickets() {
  console.log('\n🎫 Seeding More Support Tickets...');

  const tickets = [
    { subject: 'Invoice payment question', status: 'resolved', priority: 'medium' },
    { subject: 'Feature request: Export to PDF', status: 'resolved', priority: 'low' },
    { subject: 'Login issue on Safari', status: 'resolved', priority: 'high' },
    { subject: 'API rate limit exceeded', status: 'resolved', priority: 'high' },
    { subject: 'Calendar sync not working', status: 'resolved', priority: 'medium' },
    { subject: 'Request for custom integration', status: 'resolved', priority: 'medium' },
    { subject: 'Billing address update', status: 'resolved', priority: 'low' },
    { subject: 'Team member permissions', status: 'resolved', priority: 'medium' },
    { subject: 'Data export request', status: 'in_progress', priority: 'medium' },
    { subject: 'Mobile app feedback', status: 'in_progress', priority: 'low' },
    { subject: 'Performance issue on dashboard', status: 'open', priority: 'high' },
    { subject: 'Question about contract terms', status: 'open', priority: 'medium' },
  ];

  const ticketData = tickets.map((t, i) => ({
    id: uuid('81000000', i + 1),
    user_id: DEMO_USER_ID,
    ticket_number: `TKT-2025-${String(i + 1).padStart(4, '0')}`,
    subject: t.subject,
    description: `Support request: ${t.subject}`,
    status: t.status,
    priority: t.priority,
    resolved_at: t.status === 'resolved' ? daysAgo(randomBetween(1, 30)) : null,
    created_at: daysAgo(randomBetween(1, 90)),
    updated_at: daysAgo(randomBetween(0, 7)),
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
// 12. MORE CONTRACTS
// ============================================================================
async function seedMoreContracts() {
  console.log('\n📝 Seeding More Contracts...');

  const contracts = [
    { title: 'Master Service Agreement - TechVenture', type: 'msa', status: 'active', value: 150000 },
    { title: 'NDA - Creative Studios', type: 'nda', status: 'active', value: 0 },
    { title: 'Project Contract - Mobile App', type: 'project', status: 'active', value: 85000 },
    { title: 'Retainer Agreement - HealthTech', type: 'retainer', status: 'active', value: 8000 },
    { title: 'SOW - E-commerce Platform', type: 'sow', status: 'active', value: 120000 },
    { title: 'Consulting Agreement - DataPulse', type: 'consulting', status: 'active', value: 45000 },
    { title: 'NDA - Enterprise Client', type: 'nda', status: 'pending', value: 0 },
    { title: 'Partnership Agreement - Agency', type: 'partnership', status: 'pending', value: 25000 },
    { title: 'Completed Project - Restaurant App', type: 'project', status: 'completed', value: 35000 },
    { title: 'Completed SOW - Brand Refresh', type: 'sow', status: 'completed', value: 28000 },
  ];

  const contractData = contracts.map((c, i) => ({
    id: uuid('82000000', i + 1),
    user_id: DEMO_USER_ID,
    contract_number: `CTR-2025-${String(i + 1).padStart(4, '0')}`,
    title: c.title,
    description: `${c.type.toUpperCase()}: ${c.title}`,
    contract_type: c.type,
    status: c.status,
    contract_value: c.value,
    currency: 'USD',
    start_date: daysAgo(randomBetween(30, 180)),
    end_date: c.status === 'completed' ? daysAgo(randomBetween(1, 30)) : daysAgo(-randomBetween(180, 365)),
    party_a_name: 'Alex Morgan / FreeFlow Agency',
    party_a_email: 'alex@freeflow.io',
    party_b_name: c.title.split(' - ')[1] || 'Client',
    party_b_email: 'client@example.com',
    terms: 'Standard terms and conditions apply.',
    is_template: false,
    version: 1,
    created_at: daysAgo(randomBetween(30, 180)),
    updated_at: daysAgo(randomBetween(0, 14)),
  }));

  const { error } = await supabase.from('contracts').upsert(contractData, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  contracts: ${error.message}`);
  } else {
    console.log(`   ✓ Created ${contracts.length} contracts`);
    const active = contracts.filter(c => c.status === 'active').length;
    const totalValue = contracts.filter(c => c.status === 'active').reduce((sum, c) => sum + c.value, 0);
    console.log(`   📊 Active: ${active} | Total value: $${totalValue.toLocaleString()}`);
  }
}

// ============================================================================
// 13. MORE LEADS
// ============================================================================
async function seedMoreLeads() {
  console.log('\n🎯 Seeding More Leads...');

  const leads = [
    { name: 'Jennifer Walsh', company: 'Retail Brand Co', status: 'qualified', value: 65000 },
    { name: 'Chris Martinez', company: 'SaaS Startup', status: 'new', value: 95000 },
    { name: 'Amanda Foster', company: 'Media Group Inc', status: 'contacted', value: 48000 },
    { name: 'Kevin O\'Brien', company: 'Finance Corp', status: 'qualified', value: 150000 },
    { name: 'Rachel Green', company: 'Fashion Brand', status: 'new', value: 72000 },
    { name: 'Tom Anderson', company: 'EdTech Solutions', status: 'negotiation', value: 110000 },
    { name: 'Lisa Wang', company: 'Healthcare Org', status: 'qualified', value: 125000 },
    { name: 'Mark Johnson', company: 'Real Estate Inc', status: 'contacted', value: 55000 },
    { name: 'Sarah Lee', company: 'Logistics Co', status: 'new', value: 88000 },
    { name: 'David Kim', company: 'Manufacturing Ltd', status: 'qualified', value: 135000 },
    { name: 'Emily Chen', company: 'Hospitality Group', status: 'contacted', value: 42000 },
    { name: 'James Wilson', company: 'Sports Brand', status: 'new', value: 78000 },
  ];

  const leadData = leads.map((l, i) => ({
    id: uuid('83000000', i + 1),
    user_id: DEMO_USER_ID,
    name: l.name,
    email: l.name.toLowerCase().replace(/[' ]/g, '.') + '@example.com',
    phone: '+1 555-' + String(randomBetween(1000, 9999)),
    company: l.company,
    title: randomItem(['CEO', 'CTO', 'VP Marketing', 'Director', 'Manager', 'Founder']),
    status: l.status,
    score: randomBetween(40, 95),
    source: randomItem(['website', 'referral', 'linkedin', 'conference', 'cold_outreach', 'content']),
    value_estimate: l.value,
    notes: `Lead from ${l.company}. Interested in ${randomItem(['web app', 'mobile app', 'branding', 'consulting'])} services.`,
    last_contact_at: daysAgo(randomBetween(1, 21)),
    next_follow_up: daysAgo(-randomBetween(1, 14)),
    tags: [l.company.split(' ')[0].toLowerCase()],
    created_at: daysAgo(randomBetween(7, 90)),
    updated_at: daysAgo(randomBetween(0, 7)),
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
// 14. MORE BOOKINGS
// ============================================================================
async function seedMoreBookings() {
  console.log('\n📆 Seeding More Bookings...');

  const bookingTypes = [
    { title: 'Discovery Call', duration: 30 },
    { title: 'Strategy Session', duration: 60 },
    { title: 'Design Review', duration: 45 },
    { title: 'Technical Consultation', duration: 60 },
    { title: 'Project Kickoff', duration: 90 },
    { title: 'Follow-up Meeting', duration: 30 },
    { title: 'Demo Presentation', duration: 45 },
    { title: 'Onboarding Call', duration: 60 },
  ];

  const clientNames = ['Sarah Johnson', 'Michael Chen', 'Emma Williams', 'David Rodriguez', 'Lisa Park', 'James Thompson', 'Anna Mueller'];

  const bookings = [];
  for (let i = 0; i < 40; i++) {
    const type = randomItem(bookingTypes);
    const client = randomItem(clientNames);
    const daysOffset = randomBetween(-60, 30);
    const date = new Date(Date.now() + daysOffset * 24 * 60 * 60 * 1000);
    date.setHours(9 + randomBetween(0, 8), 0, 0);

    bookings.push({
      id: uuid('84000000', i + 1),
      user_id: DEMO_USER_ID,
      client_name: client,
      client_email: client.toLowerCase().replace(' ', '.') + '@example.com',
      client_phone: '+1 555-' + String(randomBetween(1000, 9999)),
      start_time: date.toISOString(),
      end_time: new Date(date.getTime() + type.duration * 60000).toISOString(),
      status: daysOffset < 0 ? 'completed' : randomItem(['confirmed', 'confirmed', 'pending']),
      location: randomItem(['Zoom', 'Google Meet', 'Microsoft Teams', 'Office']),
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
    const upcoming = bookings.filter(b => b.status !== 'completed').length;
    console.log(`   📊 Completed: ${completed} | Upcoming: ${upcoming}`);
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================
async function main() {
  try {
    await seedMoreProjects();
    await seedMoreTasks();
    await seedMoreInvoices();
    await seedMoreTimeEntries();
    await seedMoreCalendarEvents();
    await seedMoreFiles();
    await seedMoreMessages();
    await seedMoreExpenses();
    await seedMoreNotifications();
    await seedMoreAIConversations();
    await seedMoreSupportTickets();
    await seedMoreContracts();
    await seedMoreLeads();
    await seedMoreBookings();

    console.log('\n' + '═'.repeat(70));
    console.log('\n🎉 FULL APP USAGE DATA COMPLETE!\n');

    console.log('📊 DEMO DATA READY FOR TESTING:\n');
    console.log('   ✓ Projects: 15+');
    console.log('   ✓ Tasks: 80+');
    console.log('   ✓ Invoices: 40+');
    console.log('   ✓ Time Entries: 1000+');
    console.log('   ✓ Calendar Events: 500+');
    console.log('   ✓ Files: 35+');
    console.log('   ✓ Messages: 400+');
    console.log('   ✓ Expenses: 200+');
    console.log('   ✓ Notifications: 60+');
    console.log('   ✓ AI Conversations: 20+');
    console.log('   ✓ Support Tickets: 12+');
    console.log('   ✓ Contracts: 10+');
    console.log('   ✓ Leads: 12+');
    console.log('   ✓ Bookings: 40+\n');

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
