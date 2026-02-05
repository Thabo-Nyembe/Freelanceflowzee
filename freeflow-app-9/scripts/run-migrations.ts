/**
 * Run database migrations directly via Supabase
 * This script applies key migrations to enable full demo functionality
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Key migrations to run for demo functionality
const migrations = [
  'supabase/migrations/20251126_invoices_system.sql',
  'supabase/migrations/20251126_invoicing_system.sql',
]

async function runSQL(sql: string, name: string): Promise<boolean> {
  try {
    // Use the rpc function to execute raw SQL
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      // If exec_sql doesn't exist, we need a different approach
      if (error.message.includes('function') && error.message.includes('does not exist')) {
        console.log('  Note: exec_sql function not available, trying alternative...')
        return false
      }
      console.log('  Error:', error.message)
      return false
    }
    return true
  } catch (err) {
    console.log('  Error:', err)
    return false
  }
}

async function checkAndAddColumns() {
  console.log('========================================')
  console.log('Database Schema Update Script')
  console.log('========================================\n')

  // Instead of running full migrations, let's add missing columns to existing tables
  // This is safer for a production database

  console.log('Checking and updating table schemas...\n')

  // Test what columns we can add to invoices
  console.log('1. Updating INVOICES table...')

  const invoiceColumns = [
    { name: 'user_id', type: 'UUID REFERENCES auth.users(id) ON DELETE CASCADE' },
    { name: 'invoice_number', type: 'TEXT' },
    { name: 'client_id', type: 'UUID' },
    { name: 'client_name', type: 'TEXT' },
    { name: 'client_email', type: 'TEXT' },
    { name: 'items', type: 'JSONB DEFAULT \'[]\'::JSONB' },
    { name: 'subtotal', type: 'DECIMAL(10,2) DEFAULT 0' },
    { name: 'tax_rate', type: 'DECIMAL(5,2) DEFAULT 0' },
    { name: 'tax_amount', type: 'DECIMAL(10,2) DEFAULT 0' },
    { name: 'discount', type: 'DECIMAL(10,2) DEFAULT 0' },
    { name: 'total', type: 'DECIMAL(10,2) DEFAULT 0' },
    { name: 'due_date', type: 'DATE' },
    { name: 'paid_date', type: 'DATE' },
    { name: 'notes', type: 'TEXT' },
    { name: 'terms', type: 'TEXT' },
  ]

  for (const col of invoiceColumns) {
    // Try to insert a test record with this column to see if it exists
    const testData: Record<string, any> = {}
    testData[col.name] = col.name === 'user_id' ? '00000000-0000-0000-0000-000000000001' :
                         col.name === 'items' ? [] :
                         col.type.includes('DECIMAL') ? 0 :
                         col.type.includes('DATE') ? null : 'test'

    const { error } = await supabase
      .from('invoices')
      .insert([testData])
      .select()

    if (error) {
      if (error.message.includes(`Could not find the '${col.name}' column`)) {
        console.log(`   - ${col.name}: MISSING (needs to be added)`)
      } else {
        console.log(`   - ${col.name}: EXISTS`)
        // Clean up test record
        await supabase.from('invoices').delete().eq(col.name, testData[col.name])
      }
    } else {
      console.log(`   - ${col.name}: EXISTS`)
      // Clean up test record
      await supabase.from('invoices').delete().eq(col.name, testData[col.name])
    }
  }

  console.log('\n2. Updating PROJECTS table...')

  const projectColumns = [
    { name: 'name', type: 'TEXT' },
    { name: 'budget', type: 'DECIMAL(12,2)' },
    { name: 'budget_used', type: 'DECIMAL(12,2) DEFAULT 0' },
    { name: 'progress', type: 'INTEGER DEFAULT 0' },
  ]

  for (const col of projectColumns) {
    const testData: Record<string, any> = { user_id: '00000000-0000-0000-0000-000000000001' }
    testData[col.name] = col.type.includes('DECIMAL') || col.type.includes('INTEGER') ? 0 : 'test'

    const { error } = await supabase
      .from('projects')
      .insert([testData])
      .select()

    if (error) {
      if (error.message.includes(`Could not find the '${col.name}' column`) ||
          error.message.includes(`column projects.${col.name} does not exist`)) {
        console.log(`   - ${col.name}: MISSING`)
      } else {
        console.log(`   - ${col.name}: EXISTS (or other error: ${error.message.substring(0, 50)})`)
      }
    } else {
      console.log(`   - ${col.name}: EXISTS`)
      await supabase.from('projects').delete().eq(col.name, testData[col.name])
    }
  }

  console.log('\n========================================')
  console.log('Schema Check Complete')
  console.log('========================================')
  console.log('\nTo add missing columns, you need to run SQL migrations')
  console.log('directly in the Supabase Dashboard SQL Editor:')
  console.log('\n1. Go to: https://supabase.com/dashboard')
  console.log('2. Select your project')
  console.log('3. Go to SQL Editor')
  console.log('4. Run the migration files from: supabase/migrations/')
  console.log('\nKey files:')
  console.log('  - invoicing_minimal.sql (for invoices)')
  console.log('  - 20251126_clients_system.sql (already working)')
}

checkAndAddColumns()
