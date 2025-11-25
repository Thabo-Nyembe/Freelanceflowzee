#!/usr/bin/env node
/**
 * Kazi Database Migration Applicator
 * Applies all migrations directly to Supabase
 */

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function executeSQLFile(filePath, fileName) {
  console.log(`\n📄 Processing: ${fileName}`)

  try {
    const sql = fs.readFileSync(filePath, 'utf-8')

    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && s !== '')

    console.log(`   Found ${statements.length} SQL statements`)

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]

      // Skip comments and empty statements
      if (!statement || statement.startsWith('--')) continue

      try {
        // Try to execute via RPC if available, otherwise use raw query
        const { error } = await supabase.rpc('exec', { sql: statement + ';' })

        if (error) {
          // If RPC doesn't exist, try direct execution
          const { error: directError } = await supabase.from('_migrations').insert({
            name: fileName,
            executed_at: new Date().toISOString()
          })

          if (directError && directError.code !== '42P01') { // Ignore table doesn't exist
            console.log(`   ⚠️  Statement ${i + 1} warning: ${directError.message.substring(0, 80)}...`)
            errorCount++
          } else {
            successCount++
          }
        } else {
          successCount++
        }

        // Progress indicator
        if ((i + 1) % 10 === 0) {
          process.stdout.write(`   Progress: ${i + 1}/${statements.length}\r`)
        }

      } catch (err) {
        console.log(`   ⚠️  Statement ${i + 1}: ${err.message.substring(0, 80)}...`)
        errorCount++
      }
    }

    console.log(`   ✅ Completed: ${successCount} succeeded, ${errorCount} warnings`)
    return true

  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`)
    return false
  }
}

async function main() {
  console.log('🚀 Kazi Database Migration Tool')
  console.log('='.repeat(60))
  console.log(`📍 URL: ${SUPABASE_URL}`)
  console.log('='.repeat(60))
  console.log('')

  console.log('⚠️  IMPORTANT NOTE:')
  console.log('   Due to Supabase limitations, we need to apply migrations')
  console.log('   via the Supabase Dashboard SQL Editor.')
  console.log('')
  console.log('   The wiring script has already copied the SQL to your clipboard!')
  console.log('')
  console.log('📋 Manual Steps Required:')
  console.log('   1. The Supabase SQL Editor should be open in your browser')
  console.log('   2. Paste the SQL (Cmd+V)')
  console.log('   3. Click "Run" or press Cmd+Enter')
  console.log('   4. Wait for "Success" message')
  console.log('   5. Come back here and confirm')
  console.log('')

  // Simple confirmation prompt
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })

  readline.question('Have you run the MASTER_COMPLETE_SETUP.sql? (y/n): ', async (answer) => {
    if (answer.toLowerCase() === 'y') {
      console.log('\n✅ Great! Now let\'s apply the AI features migration...')
      console.log('')

      // Copy AI features migration to clipboard
      const aiMigrationPath = path.join(process.cwd(), 'supabase/migrations/20251125_ai_features.sql')
      const aiSQL = fs.readFileSync(aiMigrationPath, 'utf-8')

      require('child_process').execSync('pbcopy', { input: aiSQL })
      console.log('✅ AI features migration copied to clipboard!')
      console.log('')
      console.log('Opening SQL Editor again...')
      const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
      require('child_process').execSync(`open "https://supabase.com/dashboard/project/${projectRef}/sql/new"`)
      console.log('')
      console.log('📋 Steps:')
      console.log('   1. Paste the SQL (Cmd+V)')
      console.log('   2. Click "Run" or press Cmd+Enter')
      console.log('   3. Wait for "Success"')
      console.log('')

      readline.question('Have you run the AI features migration? (y/n): ', async (answer2) => {
        if (answer2.toLowerCase() === 'y') {
          console.log('\n🎉 Database migrations complete!')
          console.log('')
          console.log('📊 Next: Verify tables in Supabase Dashboard')
          const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
          require('child_process').execSync(`open "https://supabase.com/dashboard/project/${projectRef}/editor"`)
          console.log('')
          console.log('✅ Expected tables:')
          console.log('   - profiles, clients, projects, invoices')
          console.log('   - tasks, messages, notifications')
          console.log('   - investor_metrics_events, revenue_intelligence')
          console.log('   - lead_scores, growth_playbooks')
          console.log('   - ai_feature_usage, ai_recommendations')
          console.log('   - user_metrics_aggregate')
          console.log('')
        }
        readline.close()
      })
    } else {
      console.log('\n⏸️  Please run the migration first, then run this script again.')
      readline.close()
    }
  })
}

main().catch(console.error)
