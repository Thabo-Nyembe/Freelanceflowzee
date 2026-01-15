#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const dbPassword = process.env.SUPABASE_DB_PASSWORD;

if (!supabaseUrl) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL');
  process.exit(1);
}

// Extract project reference from URL
const projectRef = supabaseUrl.replace('https://', '').split('.')[0];
const dbHost = `db.${projectRef}.supabase.co`;

console.log('🚀 Tax Intelligence System - PostgreSQL Migration');
console.log('================================================\n');
console.log('📍 Project:', projectRef);
console.log('🌐 Host:', dbHost);
console.log('');

if (!dbPassword) {
  console.log('⚠️  SUPABASE_DB_PASSWORD not found in environment');
  console.log('');
  console.log('To get your database password:');
  console.log(`1. Go to: https://supabase.com/dashboard/project/${projectRef}/settings/database`);
  console.log('2. Find "Database password" section');
  console.log('3. Click "Reset database password" or copy existing password');
  console.log('4. Add to .env.local:');
  console.log('   SUPABASE_DB_PASSWORD=your_password_here');
  console.log('');
  console.log('🔄 Attempting to proceed without password (may fail)...\n');
}

// Connection string
const connectionString = `postgresql://postgres${dbPassword ? ':' + dbPassword : ''}@${dbHost}:6543/postgres`;

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function executeMigration(filePath, description) {
  console.log(`📄 ${description}`);
  console.log(`   File: ${path.basename(filePath)}`);

  try {
    const sql = fs.readFileSync(filePath, 'utf8');

    // Execute the entire SQL file
    await client.query(sql);

    console.log(`✅ Migration completed successfully\n`);
    return true;
  } catch (error) {
    console.error(`❌ Migration failed:`);
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code}\n`);

    if (error.message.includes('password authentication failed')) {
      console.log('💡 Tip: Make sure SUPABASE_DB_PASSWORD is set correctly in .env.local\n');
    } else if (error.message.includes('already exists')) {
      console.log('💡 Note: Some objects already exist (this is OK if re-running)\n');
      return true;
    }

    return false;
  }
}

async function verifyTables() {
  console.log('🔍 Verifying tax tables...\n');

  try {
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name LIKE 'tax%'
      ORDER BY table_name;
    `);

    if (result.rows.length > 0) {
      console.log('✅ Found tax tables:');
      result.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
      console.log('');
      return true;
    } else {
      console.log('❌ No tax tables found\n');
      return false;
    }
  } catch (error) {
    console.error('❌ Could not verify tables:', error.message, '\n');
    return false;
  }
}

async function verifySeedData() {
  console.log('🌱 Checking seed data...\n');

  try {
    const ratesResult = await client.query('SELECT COUNT(*) FROM tax_rates');
    const categoriesResult = await client.query('SELECT COUNT(*) FROM tax_categories');
    const rulesResult = await client.query('SELECT COUNT(*) FROM tax_rules');

    const rateCount = parseInt(ratesResult.rows[0].count);
    const categoryCount = parseInt(categoriesResult.rows[0].count);
    const ruleCount = parseInt(rulesResult.rows[0].count);

    console.log(`   Tax Rates: ${rateCount} (expected: 70+)`);
    console.log(`   Tax Categories: ${categoryCount} (expected: 9)`);
    console.log(`   Tax Rules: ${ruleCount} (expected: 15+)`);
    console.log('');

    if (rateCount >= 70 && categoryCount >= 9 && ruleCount >= 15) {
      console.log('✅ Seed data fully loaded!\n');
      return true;
    } else {
      console.log('⚠️  Seed data may be incomplete\n');
      return false;
    }
  } catch (error) {
    console.error('❌ Could not check seed data:', error.message, '\n');
    return false;
  }
}

async function main() {
  try {
    console.log('🔌 Connecting to database...\n');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Check if tables already exist
    const tablesExist = await verifyTables();

    if (!tablesExist) {
      console.log('📦 Running migrations...\n');

      const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

      // Migration 1: Schema
      const success1 = await executeMigration(
        path.join(migrationsDir, '20260116000001_tax_intelligence_system.sql'),
        'Migration 1: Tax Intelligence Schema (12 tables)'
      );

      if (!success1) {
        throw new Error('Schema migration failed');
      }

      // Migration 2: Seed Data
      const success2 = await executeMigration(
        path.join(migrationsDir, '20260116000002_tax_seed_data.sql'),
        'Migration 2: Tax Seed Data (70+ rates, 9 categories, 15+ rules)'
      );

      if (!success2) {
        throw new Error('Seed data migration failed');
      }

      // Verify after migrations
      await verifyTables();
    } else {
      console.log('✅ Tax tables already exist (skipping schema migration)\n');
    }

    // Always verify seed data
    await verifySeedData();

    console.log('🎉 Tax Intelligence System database is ready!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);

    if (error.message.includes('ENOTFOUND') || error.message.includes('connect')) {
      console.log('\n💡 Connection troubleshooting:');
      console.log('1. Check if database is accessible');
      console.log('2. Verify NEXT_PUBLIC_SUPABASE_URL is correct');
      console.log('3. Ensure database password is set in SUPABASE_DB_PASSWORD');
      console.log('4. Check if your IP is allowed (Supabase → Settings → Database → Connection Pooling)\n');
    }

    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
