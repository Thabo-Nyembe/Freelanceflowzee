#!/usr/bin/env node

/**
 * Check what data exists in the database for the demo user
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

async function checkData() {
  console.log('='.repeat(60));
  console.log('CHECKING DATABASE DATA FOR DEMO USER');
  console.log('='.repeat(60));
  console.log(`User ID: ${DEMO_USER_ID}\n`);

  const tables = [
    'projects',
    'clients',
    'invoices',
    'tasks',
    'time_entries',
    'files',
    'messages',
    'notifications',
    'calendar_events',
    'expenses',
    'leads',
    'deals',
    'team_members',
    'activity_logs',
    'ai_conversations',
    'bookings',
    'support_tickets',
  ];

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', DEMO_USER_ID);

      if (error) {
        console.log(`❌ ${table}: Error - ${error.message}`);
      } else {
        console.log(`${count > 0 ? '✓' : '⚠'} ${table}: ${count || 0} records`);
      }
    } catch (e) {
      console.log(`❌ ${table}: ${e.message}`);
    }
  }

  // Check for data without user_id filter (some tables might use different column names)
  console.log('\n--- Checking tables with alternate ID columns ---\n');

  const alternateChecks = [
    { table: 'chats', column: 'created_by' },
    { table: 'profiles', column: 'id' },
    { table: 'integrations', column: 'user_id' },
    { table: 'dashboard_stats', column: 'user_id' },
    { table: 'dashboard_metrics', column: 'user_id' },
    { table: 'wallets', column: 'user_id' },
  ];

  for (const { table, column } of alternateChecks) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq(column, DEMO_USER_ID);

      if (error) {
        console.log(`❌ ${table} (${column}): Error - ${error.message}`);
      } else {
        console.log(`${count > 0 ? '✓' : '⚠'} ${table}: ${count || 0} records`);
      }
    } catch (e) {
      console.log(`❌ ${table}: ${e.message}`);
    }
  }

  // Get sample data from projects to see structure
  console.log('\n--- Sample Project Data ---\n');
  const { data: projects, error: projError } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', DEMO_USER_ID)
    .limit(3);

  if (projError) {
    console.log('Error fetching projects:', projError.message);
  } else if (projects && projects.length > 0) {
    projects.forEach(p => {
      console.log(`  - ${p.name}: status=${p.status}, budget=${p.budget}, progress=${p.progress}`);
    });
  } else {
    console.log('  No projects found');
  }

  // Get sample invoices
  console.log('\n--- Sample Invoice Data ---\n');
  const { data: invoices, error: invError } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', DEMO_USER_ID)
    .limit(3);

  if (invError) {
    console.log('Error fetching invoices:', invError.message);
  } else if (invoices && invoices.length > 0) {
    invoices.forEach(inv => {
      console.log(`  - ${inv.invoice_number || inv.id}: total=${inv.total}, status=${inv.status}`);
    });
  } else {
    console.log('  No invoices found');
  }

  // Get sample clients
  console.log('\n--- Sample Client Data ---\n');
  const { data: clients, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', DEMO_USER_ID)
    .limit(3);

  if (clientError) {
    console.log('Error fetching clients:', clientError.message);
  } else if (clients && clients.length > 0) {
    clients.forEach(c => {
      console.log(`  - ${c.name}: status=${c.status}, email=${c.email}`);
    });
  } else {
    console.log('  No clients found');
  }
}

checkData().then(() => {
  console.log('\n' + '='.repeat(60));
  console.log('CHECK COMPLETE');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
