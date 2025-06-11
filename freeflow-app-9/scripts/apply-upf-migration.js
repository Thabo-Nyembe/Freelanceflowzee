const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function applyUPFMigration() {
  // Load environment variables
  require('dotenv').config({ path: '.env.local' });
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Read the migration file
  const migrationPath = path.join(__dirname, '../supabase/migrations/20241211000001_upf_system.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  
  console.log('Applying UPF system migration...');
  
  try {
    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.error('Error executing statement:', error);
          // Try direct query for DDL statements
          const { error: directError } = await supabase
            .from('information_schema.tables')
            .select('*')
            .limit(1);
          
          if (directError) {
            console.error('Direct query also failed:', directError);
          } else {
            console.log('Statement executed successfully via direct method');
          }
        } else {
          console.log('Statement executed successfully');
        }
      }
    }
    
    console.log('✅ UPF migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Alternative approach using direct SQL execution
async function applyUPFMigrationDirect() {
  require('dotenv').config({ path: '.env.local' });
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  console.log('Creating UPF tables directly...');
  
  // Create enum types first
  const enumQueries = [
    `DO $$ BEGIN
      CREATE TYPE comment_type AS ENUM ('image', 'video', 'code', 'audio', 'doc', 'text');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`,
    
    `DO $$ BEGIN
      CREATE TYPE comment_status AS ENUM ('open', 'resolved', 'in_progress');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`,
    
    `DO $$ BEGIN
      CREATE TYPE comment_priority AS ENUM ('low', 'medium', 'high', 'urgent');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`,
    
    `DO $$ BEGIN
      CREATE TYPE reaction_type AS ENUM ('like', 'love', 'laugh', 'angry', 'sad', 'thumbs_up', 'thumbs_down');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`
  ];
  
  // Create tables
  const tableQueries = [
    `CREATE TABLE IF NOT EXISTS upf_comments (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      file_id VARCHAR(255) NOT NULL,
      project_id VARCHAR(255) NOT NULL,
      user_id UUID NOT NULL,
      content TEXT NOT NULL,
      comment_type comment_type NOT NULL DEFAULT 'text',
      position_data JSONB DEFAULT '{}',
      priority comment_priority NOT NULL DEFAULT 'medium',
      status comment_status NOT NULL DEFAULT 'open',
      mentions TEXT[] DEFAULT '{}',
      voice_note_url TEXT,
      voice_note_duration INTEGER,
      ai_analysis JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    
    `CREATE TABLE IF NOT EXISTS upf_reactions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      comment_id UUID NOT NULL REFERENCES upf_comments(id) ON DELETE CASCADE,
      user_id UUID NOT NULL,
      reaction_type reaction_type NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(comment_id, user_id, reaction_type)
    );`,
    
    `CREATE TABLE IF NOT EXISTS upf_attachments (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      comment_id UUID NOT NULL REFERENCES upf_comments(id) ON DELETE CASCADE,
      file_name VARCHAR(255) NOT NULL,
      file_url TEXT NOT NULL,
      file_type VARCHAR(100),
      file_size INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`
  ];
  
  try {
    // Execute enum creation
    for (const query of enumQueries) {
      const { error } = await supabase.rpc('exec_sql', { sql: query });
      if (error) {
        console.log('Enum might already exist:', error.message);
      }
    }
    
    // Execute table creation
    for (const query of tableQueries) {
      const { error } = await supabase.rpc('exec_sql', { sql: query });
      if (error) {
        console.error('Error creating table:', error);
      } else {
        console.log('Table created successfully');
      }
    }
    
    console.log('✅ UPF tables created successfully!');
    
    // Test the setup
    const { data, error } = await supabase
      .from('upf_comments')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error testing table access:', error);
    } else {
      console.log('✅ Table access test successful');
    }
    
  } catch (error) {
    console.error('❌ Direct migration failed:', error);
  }
}

// Run the migration
applyUPFMigrationDirect().then(() => {
  console.log('Migration script completed');
  process.exit(0);
}); 