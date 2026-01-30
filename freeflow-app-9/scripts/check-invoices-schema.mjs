/**
 * Check invoices table schema
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkSchema() {
  console.log('Checking invoices table schema...\n')

  // Test various column combinations
  const testCases = [
    { name: 'minimal', data: { status: 'draft' } },
    { name: 'with user_id', data: { user_id: '00000000-0000-0000-0000-000000000001', status: 'draft' } },
    { name: 'with total', data: { user_id: '00000000-0000-0000-0000-000000000001', total: 100, status: 'draft' } },
    { name: 'with stripe_invoice_id', data: { user_id: '00000000-0000-0000-0000-000000000001', stripe_invoice_id: 'inv_test', status: 'draft' } },
    { name: 'full new schema', data: {
      user_id: '00000000-0000-0000-0000-000000000001',
      invoice_number: 'INV-TEST',
      client_name: 'Test',
      total: 100,
      status: 'draft'
    }}
  ]

  for (const test of testCases) {
    const { data, error } = await supabase.from('invoices').insert([test.data]).select()
    if (error) {
      console.log(`❌ ${test.name}: ${error.message}`)
    } else {
      console.log(`✅ ${test.name}: SUCCESS`)
      console.log('   Columns returned:', Object.keys(data[0]).join(', '))
      // Clean up
      await supabase.from('invoices').delete().eq('id', data[0].id)
    }
  }
}

checkSchema()
