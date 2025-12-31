/**
 * Create Engagement Tables via Supabase REST API
 */

const https = require('https');

const SUPABASE_URL = 'https://gcinvwprtlnwuwuvmrux.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjaW52d3BydGxud3V3dXZtcnV4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDA1ODU5MiwiZXhwIjoyMDc5NjM0NTkyfQ.pFnOu-jsRChBCQigpNOSpyIFF_grbHTwrv0eBh9JYbo';

async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`);

    const data = JSON.stringify({ query: sql });

    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data: body });
        } else {
          resolve({ success: false, error: body, status: res.statusCode });
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Try creating an exec_sql function first
async function createExecFunction() {
  const sql = `
    CREATE OR REPLACE FUNCTION exec_sql(query text)
    RETURNS json AS $$
    BEGIN
      EXECUTE query;
      RETURN json_build_object('success', true);
    EXCEPTION WHEN OTHERS THEN
      RETURN json_build_object('success', false, 'error', SQLERRM);
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  // This needs to be run via Dashboard, so let's use direct table creation instead
}

// Use the Supabase client directly
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  db: { schema: 'public' }
});

async function checkTableExists(tableName) {
  const { data, error } = await supabase.rpc('to_regclass', { text_input: `public.${tableName}` });
  return !error && data !== null;
}

async function createTablesViaRPC() {
  console.log('Creating engagement tables...\n');

  // Check if tables already exist by trying to query them
  const tables = [
    'user_analytics',
    'user_sessions',
    'user_activity_log',
    'user_preferences',
    'engagement_recommendations',
    'investor_metrics',
    'user_milestones'
  ];

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('id').limit(1);
    if (error && error.code === '42P01') {
      console.log(`❌ Table ${table} does not exist`);
    } else if (error) {
      console.log(`⚠️ Table ${table}: ${error.message}`);
    } else {
      console.log(`✅ Table ${table} exists`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('To create the missing tables, run this SQL in Supabase Dashboard:');
  console.log('https://supabase.com/dashboard/project/gcinvwprtlnwuwuvmrux/sql');
  console.log('='.repeat(60));
  console.log('\nCopy the contents of:');
  console.log('supabase/migrations/20251231000003_safe_engagement_tables.sql');
}

createTablesViaRPC().catch(console.error);
