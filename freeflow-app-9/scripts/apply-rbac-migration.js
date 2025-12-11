#!/usr/bin/env node
/**
 * Apply RBAC Migration directly using Supabase REST API
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://gcinvwprtlnwuwuvmrux.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjaW52d3BydGxud3V3dXZtcnV4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDA1ODU5MiwiZXhwIjoyMDc5NjM0NTkyfQ.pFnOu-jsRChBCQigpNOSpyIFF_grbHTwrv0eBh9JYbo';

console.log('🔐 RBAC Migration Runner');
console.log('='.repeat(50));

// Read the migration file
const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20251211000005_rbac_system.sql');
const sql = fs.readFileSync(migrationPath, 'utf-8');

// Extract individual CREATE TABLE statements
const statements = [];

// Extract CREATE TABLE IF NOT EXISTS statements
const createTableRegex = /CREATE TABLE IF NOT EXISTS (\w+)\s*\([^;]+\);/gis;
let match;
while ((match = createTableRegex.exec(sql)) !== null) {
  statements.push({ type: 'CREATE TABLE', name: match[1], sql: match[0] });
}

// Extract CREATE INDEX statements
const createIndexRegex = /CREATE INDEX IF NOT EXISTS (\w+)[^;]+;/gi;
while ((match = createIndexRegex.exec(sql)) !== null) {
  statements.push({ type: 'CREATE INDEX', name: match[1], sql: match[0] });
}

console.log(`Found ${statements.length} statements to execute`);

async function executeSQL(statement) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: statement });

    const options = {
      hostname: 'gcinvwprtlnwuwuvmrux.supabase.co',
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data });
        } else {
          resolve({ success: false, status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function checkTableExists(tableName) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'gcinvwprtlnwuwuvmrux.supabase.co',
      path: `/rest/v1/${tableName}?select=id&limit=1`,
      method: 'GET',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // 200 means table exists, 404 means it doesn't
        resolve(res.statusCode === 200);
      });
    });

    req.on('error', () => resolve(false));
    req.end();
  });
}

async function main() {
  // Check if tables already exist
  const tablesToCheck = ['team_members', 'project_members', 'user_permissions', 'role_definitions'];

  console.log('\n📊 Checking existing tables...');
  for (const table of tablesToCheck) {
    const exists = await checkTableExists(table);
    console.log(`   ${table}: ${exists ? '✅ exists' : '❌ missing'}`);
  }

  console.log('\n📝 Note: The RBAC tables need to be created via Supabase Dashboard SQL editor.');
  console.log('   Copy the SQL from: supabase/migrations/20251211000005_rbac_system.sql');
  console.log('   And paste it in: https://supabase.com/dashboard/project/gcinvwprtlnwuwuvmrux/sql/new');
}

main().catch(console.error);
