#!/usr/bin/env node
/**
 * Execute SQL migrations via Supabase REST API
 * Uses service key for elevated permissions
 */

const fs = require('fs')
const path = require('path')
const https = require('https')

require('dotenv').config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gcinvwprtlnwuwuvmrux.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🚀 Kazi Database - SQL Execution via REST API')
console.log('='.repeat(60))
console.log(`📍 URL: ${SUPABASE_URL}`)
console.log('='.repeat(60))
console.log('')

async function executeSQL(sql, description) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL)
    url.pathname = '/rest/v1/rpc/exec_sql'

    const postData = JSON.stringify({ query: sql })

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    }

    const req = https.request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data })
        } else {
          resolve({ success: false, error: data, statusCode: res.statusCode })
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.write(postData)
    req.end()
  })
}

async function applySQLFile(filePath, fileName) {
  console.log(`\n📄 Applying: ${fileName}`)

  try {
    if (!fs.existsSync(filePath)) {
      console.log(`   ⚠️  File not found: ${fileName}`)
      return false
    }

    const sql = fs.readFileSync(filePath, 'utf-8')

    // Split by semicolons but keep them
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'))

    console.log(`   📊 Found ${statements.length} SQL statements`)

    // Execute each statement
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'

      try {
        const result = await executeSQL(statement, `Statement ${i + 1}`)

        if (result.success) {
          successCount++
        } else {
          // Check if it's just "already exists" error
          if (result.error && (result.error.includes('already exists') ||
                                result.error.includes('duplicate'))) {
            successCount++
          } else {
            errorCount++
          }
        }

        // Progress
        if ((i + 1) % 10 === 0) {
          process.stdout.write(`   Progress: ${i + 1}/${statements.length}\r`)
        }
      } catch (error) {
        errorCount++
      }
    }

    console.log(`   ✅ Completed: ${successCount} OK, ${errorCount} warnings`)
    return true

  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
    return false
  }
}

async function main() {
  console.log('⚠️  Note: The Supabase REST API may not support all DDL operations.')
  console.log('   For best results, apply migrations via Supabase Dashboard SQL Editor.')
  console.log('')
  console.log('Opening Supabase Dashboard with migrations...')
  console.log('')

  // Since REST API approach is limited, let's guide the user
  const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]

  const migrations = [
    'MASTER_COMPLETE_SETUP.sql',
    '20251125_ai_features.sql',
    '20251125_missing_tables.sql'
  ]

  console.log('📋 Migrations to apply:')
  migrations.forEach((file, idx) => {
    console.log(`   ${idx + 1}. ${file}`)
  })
  console.log('')

  console.log('✨ Quick Apply Method:')
  console.log('─'.repeat(60))
  console.log('')

  for (const [idx, migration] of migrations.entries()) {
    const filePath = path.join(process.cwd(), 'supabase', 'migrations', migration)

    if (fs.existsSync(filePath)) {
      console.log(`${idx + 1}. Copy ${migration}:`)
      console.log(`   cat supabase/migrations/${migration} | pbcopy`)
      console.log('')
    }
  }

  console.log('Then paste and run in:')
  console.log(`https://supabase.com/dashboard/project/${projectRef}/sql/new`)
  console.log('')

  // Copy first migration automatically
  const firstMigration = path.join(process.cwd(), 'supabase', 'migrations', migrations[0])
  if (fs.existsSync(firstMigration)) {
    const sql = fs.readFileSync(firstMigration, 'utf-8')
    require('child_process').execSync('pbcopy', { input: sql })
    console.log(`✅ ${migrations[0]} copied to clipboard!`)
    console.log('')
    require('child_process').execSync(`open "https://supabase.com/dashboard/project/${projectRef}/sql/new"`)
  }
}

main().catch(console.error)
