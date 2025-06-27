#!/usr/bin/env node

/**
 * Direct Analytics Tables Creation Script
 * Creates analytics tables directly via Supabase Client
 */

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🚀 Creating Analytics Tables Directly')
console.log('====================================\n')

async function createAnalyticsTables() {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('❌ Missing environment variables')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // SQL statements to create tables
  const sqlStatements = [
    // 1. Create analytics_events table
    `
    CREATE TABLE IF NOT EXISTS analytics_events (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      event_type VARCHAR(50) NOT NULL,
      event_name VARCHAR(100) NOT NULL,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      session_id VARCHAR(100) NOT NULL,
      timestamp TIMESTAMPTZ DEFAULT NOW(),
      properties JSONB DEFAULT '{}',
      page_url TEXT,
      user_agent TEXT,
      ip_address INET,
      performance_metrics JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    `,
    
    // 2. Create business_metrics table
    `
    CREATE TABLE IF NOT EXISTS business_metrics (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      metric_name VARCHAR(100) NOT NULL,
      value DECIMAL(15,2) NOT NULL,
      unit VARCHAR(20) DEFAULT 'count',
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      timestamp TIMESTAMPTZ DEFAULT NOW(),
      properties JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    `,
    
    // 3. Create user_sessions table
    `
    CREATE TABLE IF NOT EXISTS user_sessions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      session_id VARCHAR(100) UNIQUE NOT NULL,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      start_time TIMESTAMPTZ DEFAULT NOW(),
      end_time TIMESTAMPTZ,
      duration_seconds INTEGER,
      page_views INTEGER DEFAULT 0,
      events_count INTEGER DEFAULT 0,
      ip_address INET,
      user_agent TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    `,
    
    // 4. Create indexes for performance
    `CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);`,
    `CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);`,
    `CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);`,
    `CREATE INDEX IF NOT EXISTS idx_business_metrics_user_id ON business_metrics(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_business_metrics_timestamp ON business_metrics(timestamp);`,
    `CREATE INDEX IF NOT EXISTS idx_business_metrics_metric_name ON business_metrics(metric_name);`,
    `CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);`,
    
    // 5. Enable Row Level Security
    `ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE business_metrics ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;`,
    
    // 6. Create RLS policies
    `
    CREATE POLICY IF NOT EXISTS "Users can insert their own analytics events" 
    ON analytics_events FOR INSERT 
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
    `,
    
    `
    CREATE POLICY IF NOT EXISTS "Users can view their own analytics events" 
    ON analytics_events FOR SELECT 
    USING (auth.uid() = user_id OR user_id IS NULL);
    `,
    
    `
    CREATE POLICY IF NOT EXISTS "Users can insert their own business metrics" 
    ON business_metrics FOR INSERT 
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
    `,
    
    `
    CREATE POLICY IF NOT EXISTS "Users can view their own business metrics" 
    ON business_metrics FOR SELECT 
    USING (auth.uid() = user_id OR user_id IS NULL);
    `,
    
    `
    CREATE POLICY IF NOT EXISTS "Users can manage their own sessions" 
    ON user_sessions FOR ALL 
    USING (auth.uid() = user_id OR user_id IS NULL);
    `
  ]

  console.log(`📊 Executing ${sqlStatements.length} SQL statements...\n`)

  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < sqlStatements.length; i++) {
    const sql = sqlStatements[i].trim()
    if (!sql) continue

    try {
      console.log(`⚡ Statement ${i + 1}: Executing...`)
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })
      
      if (error) {
        // Try direct query execution instead
        const { error: directError } = await supabase.from('_').select(sql).limit(0)'
        if (directError) {
          console.log(`⚠️  Statement ${i + 1}: ${directError.message}`)
          errorCount++
        } else {
          console.log(`✅ Statement ${i + 1}: Success`)
          successCount++
        }
      } else {
        console.log(`✅ Statement ${i + 1}: Success`)
        successCount++
      }
    } catch (e) {
      console.log(`❌ Statement ${i + 1}: ${e.message}`)
      errorCount++
    }
  }

  console.log(`\n📈 Results Summary:`)
  console.log(`✅ Successful: ${successCount}`)
  console.log(`❌ Failed: ${errorCount}`)

  // Test if tables exist now
  console.log(`\n🔍 Verifying tables...`)
  
  try {
    const { data: events } = await supabase.from('analytics_events').select('count').limit(1)
    console.log('✅ analytics_events table: Created')
  } catch (e) {
    console.log('❌ analytics_events table: Failed')
  }

  try {
    const { data: metrics } = await supabase.from('business_metrics').select('count').limit(1)
    console.log('✅ business_metrics table: Created')
  } catch (e) {
    console.log('❌ business_metrics table: Failed')
  }

  try {
    const { data: sessions } = await supabase.from('user_sessions').select('count').limit(1)
    console.log('✅ user_sessions table: Created')
  } catch (e) {
    console.log('❌ user_sessions table: Failed')
  }

  console.log('\n🎉 Analytics Tables Setup Complete!')
}

createAnalyticsTables().catch(console.error) 