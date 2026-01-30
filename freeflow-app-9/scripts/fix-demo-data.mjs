#!/usr/bin/env node

/**
 * Fix Demo Data - Update existing records with proper names and values
 * This ensures the demo user has impressive data for investor showcase
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

// Impressive project names for investor demo
const PROJECT_NAMES = [
  'Enterprise Portal v2.0',
  'Mobile App Redesign',
  'AI Analytics Dashboard',
  'E-commerce Platform',
  'Brand Identity Package',
  'Cloud Migration Project',
  'Customer Success Portal',
  'Marketing Automation Suite',
  'Data Warehouse Integration',
  'Security Audit & Compliance',
  'API Gateway Development',
  'Real-time Chat System',
  'Inventory Management System',
  'HR Management Platform',
  'Financial Reporting Dashboard',
  'IoT Monitoring Solution',
  'Learning Management System',
  'Supply Chain Optimization',
  'CRM Integration Project',
  'DevOps Pipeline Setup'
];

const PROJECT_CATEGORIES = ['development', 'design', 'ai', 'marketing', 'consulting', 'infrastructure'];
const PROJECT_PRIORITIES = ['urgent', 'high', 'medium', 'low'];

async function fixProjects() {
  console.log('Fixing projects...');

  const { data: projects, error } = await supabase
    .from('projects')
    .select('id')
    .eq('user_id', DEMO_USER_ID);

  if (error) {
    console.log('Error fetching projects:', error.message);
    return;
  }

  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    const name = PROJECT_NAMES[i % PROJECT_NAMES.length];
    const progress = Math.floor(Math.random() * 60) + 40; // 40-100%
    const category = PROJECT_CATEGORIES[Math.floor(Math.random() * PROJECT_CATEGORIES.length)];
    const priority = PROJECT_PRIORITIES[Math.floor(Math.random() * PROJECT_PRIORITIES.length)];

    const { error: updateError } = await supabase
      .from('projects')
      .update({
        name,
        progress,
        category,
        priority,
        description: `High-impact ${category} project delivering exceptional results for our valued client.`
      })
      .eq('id', project.id);

    if (updateError) {
      console.log(`  Error updating project ${project.id}:`, updateError.message);
    }
  }

  console.log(`  ✓ Updated ${projects.length} projects`);
}

// Impressive client names
const CLIENT_NAMES = [
  'Acme Corporation',
  'TechStart Inc',
  'DataFlow LLC',
  'RetailMax',
  'Sunrise Media',
  'Global Dynamics',
  'Innovate Solutions',
  'Premier Partners',
  'Alpha Industries',
  'Zenith Technologies',
  'Momentum Group',
  'Catalyst Ventures',
  'Apex Digital',
  'Summit Enterprises',
  'Vanguard Systems'
];

async function fixClients() {
  console.log('Fixing clients...');

  const { data: clients, error } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', DEMO_USER_ID);

  if (error) {
    console.log('Error fetching clients:', error.message);
    return;
  }

  for (let i = 0; i < clients.length; i++) {
    const client = clients[i];
    const name = CLIENT_NAMES[i % CLIENT_NAMES.length];

    const { error: updateError } = await supabase
      .from('clients')
      .update({
        name,
        company: name,
        email: `contact@${name.toLowerCase().replace(/\s+/g, '')}.com`,
        status: i < 3 ? 'vip' : 'active'
      })
      .eq('id', client.id);

    if (updateError) {
      console.log(`  Error updating client ${client.id}:`, updateError.message);
    }
  }

  console.log(`  ✓ Updated ${clients.length} clients`);
}

// Task names
const TASK_PREFIXES = [
  'Implement', 'Design', 'Review', 'Test', 'Deploy', 'Configure', 'Optimize', 'Document',
  'Analyze', 'Create', 'Build', 'Fix', 'Update', 'Migrate', 'Integrate'
];

const TASK_SUBJECTS = [
  'user authentication module',
  'dashboard analytics',
  'payment integration',
  'API endpoints',
  'database schema',
  'UI components',
  'performance metrics',
  'security features',
  'notification system',
  'file upload service',
  'search functionality',
  'reporting module',
  'mobile responsive design',
  'error handling',
  'logging system'
];

async function fixTasks() {
  console.log('Fixing tasks...');

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('id')
    .eq('user_id', DEMO_USER_ID);

  if (error) {
    console.log('Error fetching tasks:', error.message);
    return;
  }

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const prefix = TASK_PREFIXES[Math.floor(Math.random() * TASK_PREFIXES.length)];
    const subject = TASK_SUBJECTS[Math.floor(Math.random() * TASK_SUBJECTS.length)];
    const title = `${prefix} ${subject}`;

    const { error: updateError } = await supabase
      .from('tasks')
      .update({
        title,
        description: `Task to ${prefix.toLowerCase()} the ${subject} for improved functionality and user experience.`
      })
      .eq('id', task.id);

    if (updateError) {
      console.log(`  Error updating task ${task.id}:`, updateError.message);
    }
  }

  console.log(`  ✓ Updated ${tasks.length} tasks`);
}

// Update dashboard stats with impressive numbers (using correct schema)
async function fixDashboardStats() {
  console.log('Fixing dashboard stats...');

  const { error } = await supabase
    .from('dashboard_stats')
    .upsert({
      user_id: DEMO_USER_ID,
      earnings: 847500,
      earnings_trend: 17.4,
      active_projects: 8,
      active_projects_trend: 12.5,
      completed_projects: 16,
      completed_projects_trend: 23.0,
      total_clients: 47,
      total_clients_trend: 8.3,
      hours_this_month: 186,
      revenue_this_month: 89500,
      average_project_value: 35291,
      client_satisfaction: 4.8,
      productivity_score: 94,
      pending_tasks: 12,
      overdue_tasks: 2,
      upcoming_meetings: 5,
      unread_messages: 3
    }, { onConflict: 'user_id' });

  if (error) {
    console.log('  Error updating dashboard stats:', error.message);
  } else {
    console.log('  ✓ Dashboard stats updated');
  }
}

// Main function
async function main() {
  console.log('='.repeat(60));
  console.log('FIXING DEMO DATA');
  console.log('='.repeat(60));
  console.log(`User ID: ${DEMO_USER_ID}\n`);

  await fixProjects();
  await fixClients();
  await fixTasks();
  await fixDashboardStats();

  console.log('\n' + '='.repeat(60));
  console.log('DEMO DATA FIX COMPLETE');
  console.log('='.repeat(60));
}

main().catch(console.error);
