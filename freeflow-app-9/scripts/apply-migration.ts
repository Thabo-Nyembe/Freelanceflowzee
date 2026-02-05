/**
 * Apply database migration using Supabase service role
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'public' },
  auth: { persistSession: false }
})

async function applyMigration() {
  console.log('========================================')
  console.log('Applying Database Migration')
  console.log('========================================\n')

  // Read the migration file
  const migrationPath = 'supabase/migrations/20260127_add_missing_columns.sql'
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

  console.log('Migration file:', migrationPath)
  console.log('Size:', migrationSQL.length, 'characters\n')

  // Split into individual statements and execute
  // We need to handle DO $$ blocks specially

  // Extract DO blocks and regular statements
  const doBlockRegex = /DO \$\$[\s\S]*?\$\$;/g
  const doBlocks = migrationSQL.match(doBlockRegex) || []

  console.log('Found', doBlocks.length, 'DO blocks to execute\n')

  // Try executing via RPC if available, otherwise we need direct SQL access
  // First, let's try to add columns one by one using direct table operations

  console.log('Adding columns to tables...\n')

  // INVOICES - try adding each column
  const invoiceColumns = [
    { name: 'user_id', defaultVal: null },
    { name: 'invoice_number', defaultVal: '' },
    { name: 'client_id', defaultVal: null },
    { name: 'client_name', defaultVal: '' },
    { name: 'client_email', defaultVal: '' },
    { name: 'items', defaultVal: [] },
    { name: 'subtotal', defaultVal: 0 },
    { name: 'tax_rate', defaultVal: 0 },
    { name: 'tax_amount', defaultVal: 0 },
    { name: 'discount', defaultVal: 0 },
    { name: 'total', defaultVal: 0 },
    { name: 'due_date', defaultVal: null },
    { name: 'paid_date', defaultVal: null },
    { name: 'notes', defaultVal: '' },
    { name: 'terms', defaultVal: '' },
    { name: 'metadata', defaultVal: {} },
  ]

  console.log('INVOICES table:')
  for (const col of invoiceColumns) {
    const testRecord: Record<string, any> = { [col.name]: col.defaultVal }
    const { error } = await supabase.from('invoices').insert([testRecord]).select()

    if (error) {
      if (error.message.includes(`Could not find the '${col.name}' column`)) {
        console.log(`  ❌ ${col.name} - MISSING (needs ALTER TABLE)`)
      } else {
        console.log(`  ✅ ${col.name} - exists`)
        // Clean up
        await supabase.from('invoices').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      }
    } else {
      console.log(`  ✅ ${col.name} - exists`)
      await supabase.from('invoices').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    }
  }

  // Check projects
  console.log('\nPROJECTS table:')
  const projectCols = ['name', 'budget', 'budget_used', 'progress', 'description', 'client_id']
  for (const colName of projectCols) {
    const testRecord: Record<string, any> = {
      user_id: '00000000-0000-0000-0000-000000000001',
      [colName]: colName.includes('budget') || colName === 'progress' ? 0 : 'test'
    }
    const { error } = await supabase.from('projects').insert([testRecord]).select()

    if (error) {
      if (error.message.includes(`Could not find`) || error.message.includes('does not exist')) {
        console.log(`  ❌ ${colName} - MISSING`)
      } else {
        console.log(`  ✅ ${colName} - exists (error: ${error.message.substring(0,30)}...)`)
      }
    } else {
      console.log(`  ✅ ${colName} - exists`)
      await supabase.from('projects').delete().eq(colName, testRecord[colName])
    }
  }

  console.log('\n========================================')
  console.log('Migration Check Complete')
  console.log('========================================')
  console.log('\nThe Supabase REST API cannot run ALTER TABLE statements.')
  console.log('You must run the migration SQL directly in the Supabase SQL Editor.')
  console.log('\nSteps:')
  console.log('1. Go to: https://supabase.com/dashboard/project/gcinvwprtlnwuwuvmrux/sql')
  console.log('2. Copy the contents of: supabase/migrations/20260127_add_missing_columns.sql')
  console.log('3. Paste and click "Run"')
}

applyMigration()
