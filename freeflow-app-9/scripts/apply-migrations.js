import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyMigration() {
  try {
    const migrationPath = path.join(process.cwd(), 'scripts', 'migrations', 'create-files-and-posts-tables.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

    console.log('Applying migration...')
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL })

    if (error) {
      throw error
    }

    console.log('Migration applied successfully!')
  } catch (error) {
    console.error('Error applying migration:', error)
    process.exit(1)
  }
}

applyMigration() 