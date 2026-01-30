#!/usr/bin/env node
/**
 * COMPLETE INVESTOR STORY SEED SCRIPT
 *
 * This seeds ALL features with data that tells Alex Morgan's growth story:
 * - Started as solo freelancer in Jan 2025
 * - Grew to 3-person agency by Dec 2025
 * - Revenue: $0 → $250K+ ARR
 * - Clients: 0 → 15 active clients
 * - Projects: 25+ completed, 5 in progress
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Check .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';
const DEMO_USER_EMAIL = 'alex@freeflow.io';

// Helper functions
const uuid = (prefix, num) => `${prefix}-0000-0000-0000-${String(num).padStart(12, '0')}`;
const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

console.log('🚀 SEEDING COMPLETE INVESTOR STORY\n');
console.log('═'.repeat(60));

// ============================================================================
// 1. TIME TRACKING - Shows productivity and billable hours
// ============================================================================
async function seedTimeTracking() {
  console.log('\n⏱️  Seeding Time Tracking...');

  const timeEntries = [];
  const projects = ['Website Redesign', 'Mobile App', 'Brand Identity', 'E-commerce Platform', 'Dashboard Analytics'];
  const tasks = ['Development', 'Design', 'Meeting', 'Research', 'Testing', 'Documentation'];

  // Generate 6 months of time entries (shows consistent work ethic)
  for (let day = 0; day < 180; day++) {
    // Skip some weekends randomly
    const date = new Date(Date.now() - day * 24 * 60 * 60 * 1000);
    if (date.getDay() === 0 || (date.getDay() === 6 && Math.random() > 0.3)) continue;

    // 2-5 entries per day
    const entriesPerDay = Math.floor(Math.random() * 4) + 2;
    for (let i = 0; i < entriesPerDay; i++) {
      const hours = Math.random() * 3 + 0.5; // 0.5 to 3.5 hours
      const isBillable = Math.random() > 0.2; // 80% billable

      timeEntries.push({
        id: uuid('30000000', timeEntries.length + 1),
        user_id: DEMO_USER_ID,
        project_name: randomItem(projects),
        task_name: randomItem(tasks),
        description: `${randomItem(tasks)} work on ${randomItem(projects)}`,
        duration_minutes: Math.round(hours * 60),
        start_time: new Date(date.setHours(9 + i * 2, 0, 0)).toISOString(),
        end_time: new Date(date.setHours(9 + i * 2 + hours, 0, 0)).toISOString(),
        is_billable: isBillable,
        hourly_rate: isBillable ? 150 : 0,
        status: 'completed',
        created_at: date.toISOString(),
      });
    }
  }

  // Try to insert into time_entries table
  const { error } = await supabase.from('time_entries').upsert(timeEntries.slice(0, 500), { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  time_entries: ${error.message}`);
  } else {
    console.log(`   ✓ Created ${Math.min(timeEntries.length, 500)} time entries`);

    // Calculate totals for display
    const totalHours = timeEntries.reduce((sum, e) => sum + e.duration_minutes / 60, 0);
    const billableHours = timeEntries.filter(e => e.is_billable).reduce((sum, e) => sum + e.duration_minutes / 60, 0);
    console.log(`   📊 Total: ${Math.round(totalHours)}h | Billable: ${Math.round(billableHours)}h (${Math.round(billableHours/totalHours*100)}%)`);
  }
}

// ============================================================================
// 2. CALENDAR & MEETINGS - Shows client engagement
// ============================================================================
async function seedCalendar() {
  console.log('\n📅 Seeding Calendar & Meetings...');

  const events = [];
  const meetingTypes = [
    { title: 'Client Discovery Call', duration: 60, color: '#4F46E5' },
    { title: 'Project Kickoff', duration: 90, color: '#10B981' },
    { title: 'Design Review', duration: 45, color: '#F59E0B' },
    { title: 'Sprint Planning', duration: 60, color: '#6366F1' },
    { title: 'Weekly Check-in', duration: 30, color: '#8B5CF6' },
    { title: 'Proposal Presentation', duration: 60, color: '#EC4899' },
    { title: 'Contract Signing', duration: 30, color: '#14B8A6' },
    { title: 'Training Session', duration: 120, color: '#F97316' },
  ];

  const clients = ['TechStartup Inc', 'Creative Agency', 'HealthTech Co', 'E-commerce Brand', 'Financial Services'];

  // Past 90 days + next 30 days of meetings
  for (let day = -90; day < 30; day++) {
    // 1-3 meetings per day on weekdays
    const date = new Date(Date.now() + day * 24 * 60 * 60 * 1000);
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const meetingsToday = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < meetingsToday; i++) {
      const meeting = randomItem(meetingTypes);
      const hour = 9 + Math.floor(Math.random() * 8); // 9am to 5pm

      events.push({
        id: uuid('31000000', events.length + 1),
        user_id: DEMO_USER_ID,
        title: `${meeting.title} - ${randomItem(clients)}`,
        description: `${meeting.title} with ${randomItem(clients)} team`,
        start_time: new Date(date.setHours(hour, 0, 0)).toISOString(),
        end_time: new Date(date.setHours(hour, meeting.duration, 0)).toISOString(),
        type: 'meeting',
        status: day < 0 ? 'completed' : 'scheduled',
        color: meeting.color,
        location: Math.random() > 0.5 ? 'Zoom' : 'Google Meet',
        attendees: [DEMO_USER_EMAIL, `client${Math.floor(Math.random() * 10)}@example.com`],
        created_at: daysAgo(Math.max(0, -day + 7)),
      });
    }
  }

  const { error } = await supabase.from('calendar_events').upsert(events, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  calendar_events: ${error.message}`);
  } else {
    console.log(`   ✓ Created ${events.length} calendar events`);
    console.log(`   📊 Past: ${events.filter(e => e.status === 'completed').length} | Upcoming: ${events.filter(e => e.status === 'scheduled').length}`);
  }
}

// ============================================================================
// 3. MESSAGES & CHATS - Shows active communication
// ============================================================================
async function seedMessages() {
  console.log('\n💬 Seeding Messages & Chats...');

  // Create chat threads
  const chats = [
    { id: uuid('32000000', 1), name: 'TechStartup Project', type: 'project', members: 4 },
    { id: uuid('32000000', 2), name: 'Design Team', type: 'team', members: 3 },
    { id: uuid('32000000', 3), name: 'Sarah Johnson', type: 'direct', members: 2 },
    { id: uuid('32000000', 4), name: 'Michael Chen', type: 'direct', members: 2 },
    { id: uuid('32000000', 5), name: 'General', type: 'channel', members: 8 },
  ];

  const chatData = chats.map(c => ({
    ...c,
    user_id: DEMO_USER_ID,
    created_at: daysAgo(90),
    updated_at: daysAgo(Math.floor(Math.random() * 5)),
  }));

  const { error: chatError } = await supabase.from('chats').upsert(chatData, { onConflict: 'id' });
  if (chatError) {
    console.log(`   ⚠️  chats: ${chatError.message}`);
  } else {
    console.log(`   ✓ Created ${chats.length} chat threads`);
  }

  // Create messages
  const messageTemplates = [
    "Just finished the wireframes, ready for review!",
    "Great progress on the project today 🎉",
    "Can we schedule a call to discuss the feedback?",
    "The client loved the new designs!",
    "I've pushed the latest updates to staging",
    "Let me know when you're free to review",
    "All tests passing, ready to deploy",
    "Thanks for the quick turnaround!",
    "Here's the updated proposal with revisions",
    "The new feature is now live 🚀",
  ];

  const messages = [];
  for (const chat of chats) {
    // 10-50 messages per chat
    const messageCount = Math.floor(Math.random() * 40) + 10;
    for (let i = 0; i < messageCount; i++) {
      messages.push({
        id: uuid('33000000', messages.length + 1),
        chat_id: chat.id,
        user_id: DEMO_USER_ID,
        content: randomItem(messageTemplates),
        type: 'text',
        status: 'sent',
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
// 4. FILES & DOCUMENTS - Shows organized workflow
// ============================================================================
async function seedFiles() {
  console.log('\n📁 Seeding Files & Documents...');

  const folders = [
    { name: 'Client Projects', type: 'folder' },
    { name: 'Contracts', type: 'folder' },
    { name: 'Proposals', type: 'folder' },
    { name: 'Brand Assets', type: 'folder' },
    { name: 'Templates', type: 'folder' },
  ];

  const files = [
    // Client deliverables
    { name: 'TechStartup_Website_Final.fig', type: 'figma', size: 15000000, folder: 'Client Projects' },
    { name: 'MobileApp_Designs_v3.fig', type: 'figma', size: 22000000, folder: 'Client Projects' },
    { name: 'Brand_Guidelines_2025.pdf', type: 'pdf', size: 8500000, folder: 'Brand Assets' },
    { name: 'Logo_Package.zip', type: 'archive', size: 45000000, folder: 'Brand Assets' },

    // Contracts
    { name: 'Master_Service_Agreement.pdf', type: 'pdf', size: 250000, folder: 'Contracts' },
    { name: 'NDA_Template.pdf', type: 'pdf', size: 120000, folder: 'Contracts' },
    { name: 'TechStartup_Contract_Signed.pdf', type: 'pdf', size: 380000, folder: 'Contracts' },
    { name: 'HealthTech_SOW.pdf', type: 'pdf', size: 290000, folder: 'Contracts' },

    // Proposals
    { name: 'Proposal_Ecommerce_Platform.pdf', type: 'pdf', size: 1200000, folder: 'Proposals' },
    { name: 'Proposal_Dashboard_Analytics.pdf', type: 'pdf', size: 980000, folder: 'Proposals' },
    { name: 'Proposal_Mobile_App_Phase2.pdf', type: 'pdf', size: 1500000, folder: 'Proposals' },

    // Templates
    { name: 'Invoice_Template.xlsx', type: 'spreadsheet', size: 45000, folder: 'Templates' },
    { name: 'Project_Brief_Template.docx', type: 'document', size: 78000, folder: 'Templates' },
    { name: 'Design_System_Starter.fig', type: 'figma', size: 5000000, folder: 'Templates' },
  ];

  const fileData = files.map((f, i) => ({
    id: uuid('34000000', i + 1),
    user_id: DEMO_USER_ID,
    name: f.name,
    type: f.type,
    size: f.size,
    mime_type: f.type === 'pdf' ? 'application/pdf' : 'application/octet-stream',
    folder: f.folder,
    status: 'active',
    download_count: Math.floor(Math.random() * 20),
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
// 5. TEAM MEMBERS - Shows growth from solo to agency
// ============================================================================
async function seedTeam() {
  console.log('\n👥 Seeding Team Members...');

  const teamMembers = [
    {
      id: uuid('35000000', 1),
      user_id: DEMO_USER_ID,
      name: 'Alex Morgan',
      email: 'alex@freeflow.io',
      role: 'Founder & Lead Developer',
      avatar: null,
      status: 'active',
      joined_at: daysAgo(365), // Started 1 year ago
      hourly_rate: 175,
      skills: ['React', 'Node.js', 'UI/UX', 'Strategy'],
    },
    {
      id: uuid('35000000', 2),
      user_id: DEMO_USER_ID,
      name: 'Jordan Lee',
      email: 'jordan@freeflow.io',
      role: 'Senior Designer',
      avatar: null,
      status: 'active',
      joined_at: daysAgo(180), // Hired 6 months ago
      hourly_rate: 125,
      skills: ['Figma', 'Brand Design', 'Motion Graphics'],
    },
    {
      id: uuid('35000000', 3),
      user_id: DEMO_USER_ID,
      name: 'Casey Rivera',
      email: 'casey@freeflow.io',
      role: 'Full Stack Developer',
      avatar: null,
      status: 'active',
      joined_at: daysAgo(90), // Hired 3 months ago
      hourly_rate: 135,
      skills: ['TypeScript', 'Python', 'AWS', 'PostgreSQL'],
    },
    {
      id: uuid('35000000', 4),
      user_id: DEMO_USER_ID,
      name: 'Taylor Kim',
      email: 'taylor@freeflow.io',
      role: 'Project Manager',
      avatar: null,
      status: 'active',
      joined_at: daysAgo(45), // Most recent hire
      hourly_rate: 95,
      skills: ['Scrum', 'Client Relations', 'Documentation'],
    },
  ];

  const { error } = await supabase.from('team_members').upsert(teamMembers, { onConflict: 'id' });
  if (error) {
    // Try alternative table
    const { error: error2 } = await supabase.from('team_management').upsert(teamMembers, { onConflict: 'id' });
    if (error2) {
      console.log(`   ⚠️  team: ${error.message}`);
    } else {
      console.log(`   ✓ Created ${teamMembers.length} team members`);
    }
  } else {
    console.log(`   ✓ Created ${teamMembers.length} team members`);
    console.log(`   📊 Team growth: Solo → ${teamMembers.length} people in 12 months`);
  }
}

// ============================================================================
// 6. ANALYTICS DATA - Shows growth metrics
// ============================================================================
async function seedAnalytics() {
  console.log('\n📊 Seeding Analytics Data...');

  const analyticsData = [];

  // Generate 12 months of growth data
  for (let month = 11; month >= 0; month--) {
    const date = new Date();
    date.setMonth(date.getMonth() - month);

    // Growth trajectory: starts slow, accelerates
    const growthMultiplier = Math.pow(1.15, 12 - month); // 15% monthly growth

    analyticsData.push({
      id: uuid('36000000', 12 - month),
      user_id: DEMO_USER_ID,
      period: date.toISOString().slice(0, 7), // YYYY-MM format
      revenue: Math.round(5000 * growthMultiplier),
      expenses: Math.round(2000 * growthMultiplier * 0.6),
      profit: Math.round(5000 * growthMultiplier * 0.7),
      new_clients: Math.floor(Math.random() * 3) + 1,
      projects_completed: Math.floor(Math.random() * 4) + 1,
      hours_billed: Math.round(80 * growthMultiplier * 0.8),
      average_project_value: Math.round(8000 + month * 500),
      client_satisfaction: 4.5 + Math.random() * 0.5,
      created_at: date.toISOString(),
    });
  }

  const { error } = await supabase.from('analytics').upsert(analyticsData, { onConflict: 'id' });
  if (error) {
    // Try revenue_analytics
    const { error: error2 } = await supabase.from('revenue_analytics').upsert(analyticsData, { onConflict: 'id' });
    if (error2) {
      console.log(`   ⚠️  analytics: ${error.message}`);
    }
  } else {
    console.log(`   ✓ Created 12 months of analytics data`);
    const totalRevenue = analyticsData.reduce((sum, a) => sum + a.revenue, 0);
    console.log(`   📊 Total Revenue: $${totalRevenue.toLocaleString()}`);
  }
}

// ============================================================================
// 7. TASKS - Shows active project management
// ============================================================================
async function seedTasks() {
  console.log('\n✅ Seeding Tasks...');

  const taskTemplates = [
    // Completed tasks (show progress)
    { title: 'Setup project repository', status: 'completed', priority: 'high' },
    { title: 'Create wireframes', status: 'completed', priority: 'high' },
    { title: 'Design system components', status: 'completed', priority: 'medium' },
    { title: 'Implement authentication', status: 'completed', priority: 'high' },
    { title: 'Database schema design', status: 'completed', priority: 'high' },
    { title: 'API endpoints development', status: 'completed', priority: 'high' },
    { title: 'Frontend layout', status: 'completed', priority: 'medium' },
    { title: 'Integration testing', status: 'completed', priority: 'medium' },
    { title: 'Client review meeting', status: 'completed', priority: 'high' },
    { title: 'Revision round 1', status: 'completed', priority: 'medium' },

    // In progress tasks (show current work)
    { title: 'Dashboard analytics module', status: 'in_progress', priority: 'high' },
    { title: 'Mobile responsive design', status: 'in_progress', priority: 'high' },
    { title: 'Payment integration', status: 'in_progress', priority: 'high' },
    { title: 'Performance optimization', status: 'in_progress', priority: 'medium' },

    // Todo tasks (show pipeline)
    { title: 'User onboarding flow', status: 'todo', priority: 'medium' },
    { title: 'Email notifications', status: 'todo', priority: 'low' },
    { title: 'Documentation', status: 'todo', priority: 'low' },
    { title: 'Security audit', status: 'todo', priority: 'high' },
    { title: 'Launch preparation', status: 'todo', priority: 'high' },
    { title: 'Client training', status: 'todo', priority: 'medium' },
  ];

  const tasks = taskTemplates.map((t, i) => ({
    id: uuid('37000000', i + 1),
    user_id: DEMO_USER_ID,
    title: t.title,
    description: `Task: ${t.title}`,
    status: t.status,
    priority: t.priority,
    due_date: t.status === 'todo' ? daysAgo(-Math.floor(Math.random() * 14)) : null,
    completed_at: t.status === 'completed' ? daysAgo(Math.floor(Math.random() * 30)) : null,
    created_at: daysAgo(Math.floor(Math.random() * 60) + 10),
  }));

  const { error } = await supabase.from('tasks').upsert(tasks, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  tasks: ${error.message}`);
  } else {
    console.log(`   ✓ Created ${tasks.length} tasks`);
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const todo = tasks.filter(t => t.status === 'todo').length;
    console.log(`   📊 Completed: ${completed} | In Progress: ${inProgress} | Todo: ${todo}`);
  }
}

// ============================================================================
// 8. NOTIFICATIONS - Shows activity
// ============================================================================
async function seedNotifications() {
  console.log('\n🔔 Seeding Notifications...');

  const notificationTemplates = [
    { title: 'New payment received', type: 'payment', icon: '💰' },
    { title: 'Invoice viewed by client', type: 'invoice', icon: '👁️' },
    { title: 'New message from Sarah', type: 'message', icon: '💬' },
    { title: 'Project milestone completed', type: 'project', icon: '🎯' },
    { title: 'Meeting reminder: Client call', type: 'calendar', icon: '📅' },
    { title: 'Task assigned to you', type: 'task', icon: '✅' },
    { title: 'New client signed up', type: 'client', icon: '🎉' },
    { title: 'Weekly report ready', type: 'report', icon: '📊' },
    { title: 'Contract signed', type: 'contract', icon: '📝' },
    { title: 'File shared with you', type: 'file', icon: '📁' },
  ];

  const notifications = [];
  for (let i = 0; i < 30; i++) {
    const template = randomItem(notificationTemplates);
    notifications.push({
      id: uuid('38000000', i + 1),
      user_id: DEMO_USER_ID,
      title: template.title,
      message: `${template.icon} ${template.title}`,
      type: template.type,
      read: i > 5, // First 5 unread
      created_at: daysAgo(i),
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
// 9. PROPOSALS & CONTRACTS - Shows sales pipeline
// ============================================================================
async function seedProposals() {
  console.log('\n📋 Seeding Proposals & Contracts...');

  const proposals = [
    { title: 'E-commerce Platform Development', value: 75000, status: 'accepted', client: 'TechStartup Inc' },
    { title: 'Mobile App Design & Development', value: 45000, status: 'accepted', client: 'HealthTech Co' },
    { title: 'Brand Identity Package', value: 15000, status: 'accepted', client: 'Creative Agency' },
    { title: 'Dashboard Analytics System', value: 32000, status: 'sent', client: 'DataCorp' },
    { title: 'Website Redesign', value: 18000, status: 'sent', client: 'Local Cafe' },
    { title: 'API Integration Project', value: 28000, status: 'draft', client: 'Enterprise Ltd' },
    { title: 'SaaS Platform MVP', value: 95000, status: 'negotiating', client: 'StartupXYZ' },
  ];

  const proposalData = proposals.map((p, i) => ({
    id: uuid('39000000', i + 1),
    user_id: DEMO_USER_ID,
    title: p.title,
    client_name: p.client,
    value: p.value,
    status: p.status,
    valid_until: daysAgo(-30),
    created_at: daysAgo(Math.floor(Math.random() * 60)),
  }));

  const { error } = await supabase.from('proposals').upsert(proposalData, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  proposals: ${error.message}`);
  } else {
    console.log(`   ✓ Created ${proposals.length} proposals`);
    const pipeline = proposals.filter(p => p.status !== 'accepted').reduce((sum, p) => sum + p.value, 0);
    const won = proposals.filter(p => p.status === 'accepted').reduce((sum, p) => sum + p.value, 0);
    console.log(`   📊 Won: $${won.toLocaleString()} | Pipeline: $${pipeline.toLocaleString()}`);
  }
}

// ============================================================================
// 10. CRM CONTACTS - Shows network growth
// ============================================================================
async function seedCRM() {
  console.log('\n📇 Seeding CRM Contacts...');

  const contacts = [
    { name: 'Sarah Johnson', company: 'TechStartup Inc', role: 'CEO', status: 'client', value: 85000 },
    { name: 'Michael Chen', company: 'Creative Agency', role: 'Creative Director', status: 'client', value: 45000 },
    { name: 'Emma Williams', company: 'Global Corp', role: 'Marketing Manager', status: 'client', value: 62000 },
    { name: 'David Rodriguez', company: 'Local Cafe', role: 'Owner', status: 'client', value: 8500 },
    { name: 'Lisa Park', company: 'HealthTech Co', role: 'VP Product', status: 'client', value: 55000 },
    { name: 'James Thompson', company: 'Nonprofit Org', role: 'Director', status: 'client', value: 12000 },
    { name: 'Anna Mueller', company: 'EuroTech GmbH', role: 'Head of Digital', status: 'lead', value: 95000 },
    { name: 'Robert Kim', company: 'Legal Pros', role: 'Managing Partner', status: 'past_client', value: 28000 },
    { name: 'Jennifer Walsh', company: 'Retail Brand', role: 'E-commerce Manager', status: 'lead', value: 42000 },
    { name: 'Chris Martinez', company: 'SaaS Startup', role: 'CTO', status: 'prospect', value: 75000 },
    { name: 'Amanda Foster', company: 'Media Group', role: 'Digital Director', status: 'lead', value: 38000 },
    { name: 'Kevin O\'Brien', company: 'Finance Corp', role: 'VP Technology', status: 'prospect', value: 120000 },
  ];

  const crmData = contacts.map((c, i) => ({
    id: uuid('40000000', i + 1),
    user_id: DEMO_USER_ID,
    name: c.name,
    email: c.name.toLowerCase().replace(' ', '.') + '@example.com',
    company: c.company,
    role: c.role,
    status: c.status,
    lifetime_value: c.value,
    last_contact: daysAgo(Math.floor(Math.random() * 30)),
    next_followup: c.status === 'lead' ? daysAgo(-Math.floor(Math.random() * 14)) : null,
    created_at: daysAgo(Math.floor(Math.random() * 180)),
  }));

  const { error } = await supabase.from('crm_contacts').upsert(crmData, { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  crm_contacts: ${error.message}`);
  } else {
    console.log(`   ✓ Created ${contacts.length} CRM contacts`);
    const clients = contacts.filter(c => c.status === 'client').length;
    const leads = contacts.filter(c => c.status === 'lead').length;
    console.log(`   📊 Clients: ${clients} | Leads: ${leads} | Prospects: ${contacts.length - clients - leads}`);
  }
}

// ============================================================================
// 11. EXPENSES - Shows business operations
// ============================================================================
async function seedExpenses() {
  console.log('\n💳 Seeding Expenses...');

  const expenseCategories = [
    { category: 'Software & Tools', items: ['Figma Pro', 'GitHub Team', 'Vercel Pro', 'Notion', 'Slack'] },
    { category: 'Marketing', items: ['Google Ads', 'LinkedIn Ads', 'Content Creation', 'SEO Tools'] },
    { category: 'Office', items: ['Coworking Space', 'Equipment', 'Office Supplies'] },
    { category: 'Professional', items: ['Accounting', 'Legal', 'Insurance'] },
    { category: 'Travel', items: ['Client Meetings', 'Conference', 'Team Retreat'] },
  ];

  const expenses = [];
  for (let month = 0; month < 12; month++) {
    for (const cat of expenseCategories) {
      // 1-3 expenses per category per month
      const count = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < count; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - month);
        date.setDate(Math.floor(Math.random() * 28) + 1);

        expenses.push({
          id: uuid('41000000', expenses.length + 1),
          user_id: DEMO_USER_ID,
          description: randomItem(cat.items),
          category: cat.category,
          amount: Math.round(Math.random() * 500 + 50),
          date: date.toISOString().slice(0, 10),
          status: 'approved',
          created_at: date.toISOString(),
        });
      }
    }
  }

  const { error } = await supabase.from('expenses').upsert(expenses.slice(0, 100), { onConflict: 'id' });
  if (error) {
    console.log(`   ⚠️  expenses: ${error.message}`);
  } else {
    console.log(`   ✓ Created ${Math.min(expenses.length, 100)} expenses`);
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    console.log(`   📊 Total expenses: $${total.toLocaleString()}`);
  }
}

// ============================================================================
// 12. AI USAGE - Shows AI adoption
// ============================================================================
async function seedAIUsage() {
  console.log('\n🤖 Seeding AI Usage Data...');

  const aiFeatures = [
    'Content Generation', 'Code Completion', 'Design Suggestions',
    'Email Drafts', 'Proposal Writing', 'Image Generation',
    'Data Analysis', 'Task Prioritization', 'Meeting Summaries'
  ];

  const aiUsage = [];
  for (let day = 0; day < 90; day++) {
    // 3-10 AI uses per day
    const usesPerDay = Math.floor(Math.random() * 8) + 3;
    for (let i = 0; i < usesPerDay; i++) {
      const date = new Date(Date.now() - day * 24 * 60 * 60 * 1000);
      aiUsage.push({
        id: uuid('42000000', aiUsage.length + 1),
        user_id: DEMO_USER_ID,
        feature: randomItem(aiFeatures),
        tokens_used: Math.floor(Math.random() * 2000) + 100,
        model: randomItem(['gpt-4', 'claude-3', 'gemini-pro']),
        success: Math.random() > 0.02, // 98% success rate
        created_at: date.toISOString(),
      });
    }
  }

  const { error } = await supabase.from('ai_usage_logs').upsert(aiUsage.slice(0, 200), { onConflict: 'id' });
  if (error) {
    // Try alternative table
    const { error: error2 } = await supabase.from('ai_feature_usage').upsert(aiUsage.slice(0, 200), { onConflict: 'id' });
    if (error2) {
      console.log(`   ⚠️  ai_usage: ${error.message}`);
    }
  } else {
    console.log(`   ✓ Created ${Math.min(aiUsage.length, 200)} AI usage records`);
    const totalTokens = aiUsage.reduce((sum, a) => sum + a.tokens_used, 0);
    console.log(`   📊 Total tokens: ${totalTokens.toLocaleString()}`);
  }
}

// ============================================================================
// 13. SUPPORT TICKETS - Shows customer success
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
// 14. KNOWLEDGE BASE - Shows documentation
// ============================================================================
async function seedKnowledgeBase() {
  console.log('\n📚 Seeding Knowledge Base...');

  const articles = [
    { title: 'Getting Started Guide', category: 'Onboarding', views: 245 },
    { title: 'How to Create Your First Project', category: 'Projects', views: 189 },
    { title: 'Invoice Management Best Practices', category: 'Billing', views: 156 },
    { title: 'Team Collaboration Features', category: 'Teams', views: 134 },
    { title: 'Time Tracking Tips', category: 'Productivity', views: 112 },
    { title: 'Client Portal Setup', category: 'Clients', views: 98 },
    { title: 'Integrations Overview', category: 'Integrations', views: 87 },
    { title: 'Security & Privacy', category: 'Security', views: 76 },
    { title: 'API Documentation', category: 'Developers', views: 234 },
    { title: 'Troubleshooting Common Issues', category: 'Support', views: 167 },
  ];

  const kbData = articles.map((a, i) => ({
    id: uuid('44000000', i + 1),
    user_id: DEMO_USER_ID,
    title: a.title,
    category: a.category,
    content: `# ${a.title}\n\nThis article covers ${a.title.toLowerCase()}...`,
    views: a.views,
    helpful_count: Math.floor(a.views * 0.85),
    status: 'published',
    created_at: daysAgo(Math.floor(Math.random() * 180)),
  }));

  const { error } = await supabase.from('knowledge_base').upsert(kbData, { onConflict: 'id' });
  if (error) {
    // Try kb_articles
    const { error: error2 } = await supabase.from('kb_articles').upsert(kbData, { onConflict: 'id' });
    if (error2) {
      console.log(`   ⚠️  knowledge_base: ${error.message}`);
    }
  } else {
    console.log(`   ✓ Created ${articles.length} knowledge base articles`);
    const totalViews = articles.reduce((sum, a) => sum + a.views, 0);
    console.log(`   📊 Total views: ${totalViews.toLocaleString()}`);
  }
}

// ============================================================================
// 15. AUTOMATIONS - Shows workflow efficiency
// ============================================================================
async function seedAutomations() {
  console.log('\n⚡ Seeding Automations...');

  const automations = [
    { name: 'Welcome Email on Signup', trigger: 'new_client', status: 'active', runs: 45 },
    { name: 'Invoice Reminder (7 days)', trigger: 'invoice_due', status: 'active', runs: 128 },
    { name: 'Project Milestone Notification', trigger: 'milestone_complete', status: 'active', runs: 67 },
    { name: 'Weekly Report Generation', trigger: 'schedule_weekly', status: 'active', runs: 48 },
    { name: 'Contract Expiry Alert', trigger: 'contract_expiring', status: 'active', runs: 12 },
    { name: 'Lead Follow-up Reminder', trigger: 'lead_inactive', status: 'active', runs: 34 },
    { name: 'Time Entry Summary', trigger: 'schedule_daily', status: 'active', runs: 180 },
    { name: 'Payment Received Thank You', trigger: 'payment_received', status: 'active', runs: 89 },
  ];

  const automationData = automations.map((a, i) => ({
    id: uuid('45000000', i + 1),
    user_id: DEMO_USER_ID,
    name: a.name,
    trigger_type: a.trigger,
    status: a.status,
    total_runs: a.runs,
    last_run: daysAgo(Math.floor(Math.random() * 7)),
    created_at: daysAgo(Math.floor(Math.random() * 180)),
  }));

  const { error } = await supabase.from('automations').upsert(automationData, { onConflict: 'id' });
  if (error) {
    // Try automation table
    const { error: error2 } = await supabase.from('automation').upsert(automationData, { onConflict: 'id' });
    if (error2) {
      console.log(`   ⚠️  automations: ${error.message}`);
    }
  } else {
    console.log(`   ✓ Created ${automations.length} automations`);
    const totalRuns = automations.reduce((sum, a) => sum + a.runs, 0);
    console.log(`   📊 Total automation runs: ${totalRuns}`);
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================
async function main() {
  try {
    // Run all seed functions
    await seedTimeTracking();
    await seedCalendar();
    await seedMessages();
    await seedFiles();
    await seedTeam();
    await seedAnalytics();
    await seedTasks();
    await seedNotifications();
    await seedProposals();
    await seedCRM();
    await seedExpenses();
    await seedAIUsage();
    await seedSupport();
    await seedKnowledgeBase();
    await seedAutomations();

    console.log('\n' + '═'.repeat(60));
    console.log('\n🎉 COMPLETE STORY SEEDING FINISHED!\n');

    console.log('📖 ALEX MORGAN\'S STORY:\n');
    console.log('   🚀 January 2025: Started as solo freelancer');
    console.log('   📈 March 2025: First major client ($75K project)');
    console.log('   👥 July 2025: Hired first team member (Jordan)');
    console.log('   🎯 September 2025: Hit $150K revenue milestone');
    console.log('   👥 October 2025: Hired second team member (Casey)');
    console.log('   🏆 December 2025: Agency of 4, $250K+ ARR');
    console.log('   💼 January 2026: 15 active clients, $175K pipeline\n');

    console.log('📊 KEY METRICS FOR INVESTORS:');
    console.log('   💰 Revenue: $250,000+ ARR');
    console.log('   📈 Growth: 15% MoM average');
    console.log('   👥 Team: 4 people');
    console.log('   🎯 Clients: 15 active');
    console.log('   ✅ Projects: 25+ completed');
    console.log('   ⏱️  Billable Hours: 80%+ rate');
    console.log('   🤖 AI Usage: 500+ features/month');
    console.log('   ⚡ Automations: 8 active workflows');
    console.log('   📚 Knowledge Base: 10 articles\n');

    console.log('🔗 Test the demo at: http://localhost:9323');
    console.log('   Email: alex@freeflow.io');
    console.log('   Password: investor2026\n');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
