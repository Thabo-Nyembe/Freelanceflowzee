#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

console.log('🚀 Tax Intelligence System - Migration Deployment');
console.log('================================================\n');

const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
const migrations = [
  '20260116000001_tax_intelligence_system.sql',
  '20260116000002_tax_seed_data.sql'
];

// Extract database connection info from Supabase URL
const dbHost = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
const projectRef = dbHost.split('.')[0];

console.log('📍 Project:', projectRef);
console.log('🌐 URL:', supabaseUrl);
console.log('\n');

// Use psql if available, otherwise provide instructions
try {
  // Check if psql is available
  execSync('which psql', { stdio: 'ignore' });

  console.log('✅ psql found, attempting direct database connection...\n');

  // Try to get database password from environment
  const dbPassword = process.env.SUPABASE_DB_PASSWORD;

  if (!dbPassword) {
    console.log('⚠️  SUPABASE_DB_PASSWORD not set');
    console.log('To use direct database connection, you need the database password.\n');
    console.log('Get it from: https://supabase.com/dashboard/project/' + projectRef + '/settings/database\n');
    throw new Error('DB password required');
  }

  // Run migrations with psql
  migrations.forEach((file, index) => {
    const filePath = path.join(migrationsDir, file);
    console.log(`📄 Migration ${index + 1}/${migrations.length}: ${file}`);

    try {
      const command = `PGPASSWORD="${dbPassword}" psql -h db.${projectRef}.supabase.co -U postgres -d postgres -f "${filePath}"`;
      execSync(command, { stdio: 'inherit' });
      console.log(`✅ Migration ${index + 1} completed\n`);
    } catch (error) {
      console.error(`❌ Migration ${index + 1} failed:`, error.message);
      process.exit(1);
    }
  });

  console.log('\n✅ All migrations completed successfully!');

} catch (error) {
  // psql not available or DB password not set, use alternative method
  console.log('📋 Manual Migration Required\n');
  console.log('Since direct database access is not configured, please run migrations manually:\n');
  console.log('1. Go to: https://supabase.com/dashboard/project/' + projectRef + '/sql/new\n');
  console.log('2. Run the following migrations in order:\n');

  migrations.forEach((file, index) => {
    const filePath = path.join(migrationsDir, file);
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Migration ${index + 1}: ${file}`);
    console.log(`${'='.repeat(60)}\n`);
    console.log('File location:', filePath);
    console.log('\nCopy the SQL from the file above and execute it in the SQL Editor.');
  });

  console.log('\n\n📊 After running migrations, verify with:\n');
  console.log('SELECT table_name FROM information_schema.tables');
  console.log('WHERE table_schema = \'public\' AND table_name LIKE \'tax%\';');
  console.log('\n');

  // Let's use the REST API approach instead
  console.log('🔄 Attempting REST API approach...\n');

  // Execute verification query
  const verifyUrl = `${supabaseUrl}/rest/v1/tax_rates?limit=1`;
  const verifyCommand = `curl -s "${verifyUrl}" -H "apikey: ${supabaseServiceKey}" -H "Authorization: Bearer ${supabaseServiceKey}"`;

  try {
    const result = execSync(verifyCommand, { encoding: 'utf8' });
    const parsed = JSON.parse(result);

    if (Array.isArray(parsed)) {
      console.log('✅ Tax tables already exist!');
      console.log(`📊 Found ${parsed.length} tax rate(s) in database`);
    }
  } catch (verifyError) {
    if (verifyError.stdout && verifyError.stdout.includes('PGRST205')) {
      console.log('⚠️  Tax tables do not exist yet');
      console.log('Please run migrations manually using the Supabase SQL Editor as shown above.');
    } else {
      console.log('❌ Could not verify tax tables');
    }
  }
}
