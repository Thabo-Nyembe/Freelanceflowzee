#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🚀 Tax Intelligence System - SQL Execution');
console.log('==========================================\n');

const migrationsDir = join(__dirname, '..', 'supabase', 'migrations');

async function executeSQLFile(filePath, description) {
  console.log(`📄 Executing: ${description}`);
  console.log(`   File: ${filePath}\n`);

  try {
    const sql = readFileSync(filePath, 'utf8');

    // Try to use RPC if available
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.log('⚠️  RPC method not available, using alternative approach...\n');

      // Split SQL into statements and try to execute via REST API
      // This won't work for DDL, but let's verify tables instead
      const { data: tables, error: tableError } = await supabase
        .from('tax_rates')
        .select('count')
        .limit(1);

      if (tableError && tableError.code === 'PGRST204') {
        console.log('❌ Tables do not exist. Manual migration required.\n');
        console.log('Please follow these steps:');
        console.log('1. Go to: https://supabase.com/dashboard/project/gcinvwprtlnwuwuvmrux/sql');
        console.log('2. Click "New Query"');
        console.log(`3. Copy contents of: ${filePath}`);
        console.log('4. Paste and click "Run"\n');
        return false;
      } else if (!tableError) {
        console.log('✅ Tables already exist!\n');
        return true;
      }
    } else {
      console.log('✅ SQL executed successfully\n');
      return true;
    }
  } catch (error) {
    console.error('❌ Error:', error.message, '\n');
    return false;
  }
}

async function verifyMigrations() {
  console.log('🔍 Verifying tax tables...\n');

  const tables = [
    'tax_categories',
    'tax_rates',
    'user_tax_profiles',
    'taxes',
    'tax_calculations',
    'tax_deductions',
    'tax_filings',
    'tax_exemptions',
    'tax_education_progress',
    'tax_insights',
    'tax_rules',
    'tax_api_logs'
  ];

  let allExist = true;

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);

      if (error) {
        console.log(`❌ ${table}: Not found`);
        allExist = false;
      } else {
        console.log(`✅ ${table}: Exists`);
      }
    } catch (error) {
      console.log(`❌ ${table}: Error`);
      allExist = false;
    }
  }

  return allExist;
}

async function checkSeedData() {
  console.log('\n🌱 Checking seed data...\n');

  try {
    const { count: rateCount } = await supabase
      .from('tax_rates')
      .select('*', { count: 'exact', head: true });

    const { count: categoryCount } = await supabase
      .from('tax_categories')
      .select('*', { count: 'exact', head: true });

    const { count: ruleCount } = await supabase
      .from('tax_rules')
      .select('*', { count: 'exact', head: true });

    console.log(`   Tax Rates: ${rateCount || 0} (expected: 70+)`);
    console.log(`   Tax Categories: ${categoryCount || 0} (expected: 9)`);
    console.log(`   Tax Rules: ${ruleCount || 0} (expected: 15+)\n`);

    return (rateCount >= 70 && categoryCount >= 9 && ruleCount >= 15);
  } catch (error) {
    console.log('❌ Could not check seed data\n');
    return false;
  }
}

async function main() {
  // First, verify if tables already exist
  const tablesExist = await verifyMigrations();

  if (!tablesExist) {
    console.log('\n⚠️  Tax tables do not exist. Attempting to execute migrations...\n');

    const migration1 = join(migrationsDir, '20260116000001_tax_intelligence_system.sql');
    const migration2 = join(migrationsDir, '20260116000002_tax_seed_data.sql');

    await executeSQLFile(migration1, 'Schema Creation');
    await executeSQLFile(migration2, 'Seed Data');

    // Verify again
    const nowExist = await verifyMigrations();
    if (!nowExist) {
      console.log('\n❌ Migrations could not be executed automatically.');
      console.log('Please run them manually via Supabase Dashboard.\n');
      process.exit(1);
    }
  } else {
    console.log('\n✅ All tax tables exist!\n');
  }

  // Check seed data
  const seedDataLoaded = await checkSeedData();

  if (seedDataLoaded) {
    console.log('✅ Seed data fully loaded!');
    console.log('\n🎉 Tax Intelligence System database is ready!\n');
  } else {
    console.log('⚠️  Seed data may be incomplete. Please verify manually.\n');
  }
}

main().catch(console.error);
