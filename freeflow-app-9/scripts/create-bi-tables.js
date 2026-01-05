const https = require('https');

const SUPABASE_URL = 'https://gcinvwprtlnwuwuvmrux.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjaW52d3BydGxud3V3dXZtcnV4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDA1ODU5MiwiZXhwIjoyMDc5NjM0NTkyfQ.pFnOu-jsRChBCQigpNOSpyIFF_grbHTwrv0eBh9JYbo';

// Function to make REST API call
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SUPABASE_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: body ? JSON.parse(body) : null });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function createTablesViaInsert() {
  console.log('Creating Business Intelligence tables via data insertion...\n');

  // Get a user ID first
  console.log('1. Getting user ID...');
  const usersRes = await makeRequest('GET', '/rest/v1/users?limit=1&select=id');
  const userId = usersRes.data?.[0]?.id || '00000000-0000-0000-0000-000000000001';
  console.log(`   Using user ID: ${userId}\n`);

  // Try to insert into kpi_goals to trigger table creation or test if it exists
  console.log('2. Testing kpi_goals table...');
  const testRes = await makeRequest('GET', '/rest/v1/kpi_goals?limit=1');

  if (testRes.status === 200) {
    console.log('   ✓ kpi_goals table exists!\n');
  } else if (testRes.data?.code === 'PGRST205') {
    console.log('   ✗ Table does not exist. Creating via SQL...\n');

    // The table doesn't exist - we need to create it via the SQL Editor
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('MANUAL STEP REQUIRED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\nPlease run this SQL in Supabase Dashboard SQL Editor:');
    console.log('https://supabase.com/dashboard/project/gcinvwprtlnwuwuvmrux/sql/new\n');

    console.log(`
-- Create KPI Goals table
CREATE TABLE IF NOT EXISTS kpi_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  unit TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'not_started',
  priority TEXT DEFAULT 'medium',
  frequency TEXT DEFAULT 'monthly',
  milestones JSONB DEFAULT '[]'::jsonb,
  history JSONB DEFAULT '[]'::jsonb,
  linked_metrics TEXT[] DEFAULT '{}',
  owner TEXT,
  team TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_kpi_goals_user_id ON kpi_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_kpi_goals_status ON kpi_goals(status);
CREATE INDEX IF NOT EXISTS idx_kpi_goals_category ON kpi_goals(category);

-- Enable RLS
ALTER TABLE kpi_goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can manage their own KPI goals" ON kpi_goals
  FOR ALL USING (auth.uid() = user_id);

-- Allow anon access for demo
CREATE POLICY "Allow anon read access" ON kpi_goals
  FOR SELECT USING (true);

-- Insert sample data
INSERT INTO kpi_goals (user_id, name, description, category, target_value, current_value, unit, start_date, end_date, status, priority, frequency, tags)
VALUES
  ('${userId}', 'Q1 Revenue Target', 'Achieve $30,000 in revenue for Q1', 'revenue', 30000, 24500, '$', '2025-01-01', '2025-03-31', 'on_track', 'critical', 'quarterly', ARRAY['revenue', 'q1']),
  ('${userId}', 'Client Retention Rate', 'Maintain 90% client retention', 'retention', 90, 87, '%', '2025-01-01', '2025-12-31', 'at_risk', 'high', 'yearly', ARRAY['retention', 'clients']),
  ('${userId}', 'Profit Margin', 'Achieve 35% net profit margin', 'profitability', 35, 32, '%', '2025-01-01', '2025-12-31', 'on_track', 'high', 'yearly', ARRAY['profitability'])
ON CONFLICT DO NOTHING;
`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return false;
  }

  // If table exists, insert sample data
  console.log('3. Inserting sample KPI goals...');
  const sampleGoals = [
    {
      user_id: userId,
      name: 'Q1 Revenue Target',
      description: 'Achieve $30,000 in revenue for Q1',
      category: 'revenue',
      target_value: 30000,
      current_value: 24500,
      unit: '$',
      start_date: '2025-01-01',
      end_date: '2025-03-31',
      status: 'on_track',
      priority: 'critical',
      frequency: 'quarterly',
      tags: ['revenue', 'q1', 'priority']
    },
    {
      user_id: userId,
      name: 'Client Retention Rate',
      description: 'Maintain 90% client retention',
      category: 'retention',
      target_value: 90,
      current_value: 87,
      unit: '%',
      start_date: '2025-01-01',
      end_date: '2025-12-31',
      status: 'at_risk',
      priority: 'high',
      frequency: 'yearly',
      tags: ['retention', 'clients']
    },
    {
      user_id: userId,
      name: 'Profit Margin',
      description: 'Achieve 35% net profit margin',
      category: 'profitability',
      target_value: 35,
      current_value: 32,
      unit: '%',
      start_date: '2025-01-01',
      end_date: '2025-12-31',
      status: 'on_track',
      priority: 'high',
      frequency: 'yearly',
      tags: ['profitability', 'efficiency']
    },
    {
      user_id: userId,
      name: 'Utilization Rate',
      description: 'Achieve 75% billable utilization',
      category: 'efficiency',
      target_value: 75,
      current_value: 68,
      unit: '%',
      start_date: '2025-01-01',
      end_date: '2025-06-30',
      status: 'on_track',
      priority: 'medium',
      frequency: 'monthly',
      tags: ['efficiency', 'billable']
    },
    {
      user_id: userId,
      name: 'New Client Acquisition',
      description: 'Acquire 12 new clients in Q1',
      category: 'clients',
      target_value: 12,
      current_value: 9,
      unit: 'clients',
      start_date: '2025-01-01',
      end_date: '2025-03-31',
      status: 'on_track',
      priority: 'high',
      frequency: 'quarterly',
      tags: ['clients', 'growth']
    }
  ];

  const insertRes = await makeRequest('POST', '/rest/v1/kpi_goals', sampleGoals);

  if (insertRes.status === 201 || insertRes.status === 200) {
    console.log(`   ✓ Inserted ${sampleGoals.length} sample goals\n`);
  } else {
    console.log(`   Note: ${JSON.stringify(insertRes.data)}\n`);
  }

  // Verify
  console.log('4. Verifying data...');
  const verifyRes = await makeRequest('GET', '/rest/v1/kpi_goals?select=id,name,category,status&limit=10');

  if (verifyRes.status === 200 && Array.isArray(verifyRes.data)) {
    console.log(`   ✓ Found ${verifyRes.data.length} KPI goals:\n`);
    verifyRes.data.forEach(g => {
      console.log(`     • ${g.name} (${g.category}) - ${g.status}`);
    });
  }

  console.log('\n✅ Business Intelligence integration complete!');
  return true;
}

createTablesViaInsert().catch(console.error);
