#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '[SET]' : '[MISSING]');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration(filePath, description) {
  console.log(`\n📄 Running migration: ${description}`);
  console.log(`   File: ${path.basename(filePath)}`);

  try {
    const sql = fs.readFileSync(filePath, 'utf8');

    // Split SQL into individual statements (basic splitting)
    // This handles most cases but might need refinement for complex SQL
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`   Executing ${statements.length} SQL statements...`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';

      try {
        // Use the PostgreSQL direct connection
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: statement
        });

        if (error) {
          // Try alternative approach - use raw query if RPC doesn't exist
          console.log(`   Statement ${i + 1}/${statements.length} - Using alternative method...`);

          // For table creation, we'll need to use Supabase's query method
          // This is a workaround since Supabase REST API doesn't directly support DDL
          // We'll log the SQL and provide instructions for manual execution
          console.log(`   ⚠️  Cannot execute DDL via REST API: ${statement.substring(0, 100)}...`);
        } else {
          console.log(`   ✅ Statement ${i + 1}/${statements.length} executed`);
        }
      } catch (err) {
        console.error(`   ❌ Error on statement ${i + 1}:`, err.message);
        console.error(`   SQL: ${statement.substring(0, 200)}...`);
      }
    }

    console.log(`✅ Migration completed: ${description}`);
    return true;
  } catch (error) {
    console.error(`❌ Migration failed: ${description}`);
    console.error('Error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Tax Intelligence System - Database Migration');
  console.log('================================================\n');

  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

  const migrations = [
    {
      file: path.join(migrationsDir, '20260116000001_tax_intelligence_system.sql'),
      description: 'Tax Intelligence System Schema (12 tables)'
    },
    {
      file: path.join(migrationsDir, '20260116000002_tax_seed_data.sql'),
      description: 'Tax Seed Data (70+ rates, 9 categories, 15+ rules)'
    }
  ];

  console.log('⚠️  IMPORTANT NOTICE:');
  console.log('Supabase REST API does not support DDL operations (CREATE TABLE, etc.)');
  console.log('You need to run these migrations manually via Supabase Dashboard.\n');
  console.log('📋 Manual Migration Steps:');
  console.log('1. Go to https://supabase.com/dashboard/project/gcinvwprtlnwuwuvmrux/sql');
  console.log('2. Open SQL Editor');
  console.log('3. Copy and execute the SQL from each migration file:\n');

  for (const migration of migrations) {
    if (!fs.existsSync(migration.file)) {
      console.error(`❌ Migration file not found: ${migration.file}`);
      continue;
    }

    console.log(`\n📁 ${migration.description}`);
    console.log(`   File: ${path.basename(migration.file)}`);
    console.log(`   Path: ${migration.file}`);

    const sql = fs.readFileSync(migration.file, 'utf8');
    const lines = sql.split('\n').length;
    const sizeKB = (Buffer.byteLength(sql, 'utf8') / 1024).toFixed(2);

    console.log(`   Size: ${sizeKB} KB (${lines} lines)`);
  }

  console.log('\n\n📝 ALTERNATIVE: Use Database Password');
  console.log('If you have the database password, you can use psql:');
  console.log('');
  console.log('export PGPASSWORD="your-database-password"');
  console.log('psql -h db.gcinvwprtlnwuwuvmrux.supabase.co \\');
  console.log('     -U postgres \\');
  console.log('     -d postgres \\');
  console.log('     -f supabase/migrations/20260116000001_tax_intelligence_system.sql');
  console.log('psql ... -f supabase/migrations/20260116000002_tax_seed_data.sql');

  console.log('\n\n✅ Migration script completed');
  console.log('Please run the migrations manually as described above.');
}

main().catch(console.error);
