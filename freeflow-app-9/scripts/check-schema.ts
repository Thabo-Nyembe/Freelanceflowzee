/**
 * Check current database schema
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkSchema() {
  console.log('Checking database schema...\n')

  // Try to select from invoices with all potential columns
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .limit(1)

  if (error) {
    console.log('Error querying invoices:', error.message)
  } else {
    console.log('INVOICES columns:', data && data.length > 0 ? Object.keys(data[0]).join(', ') : 'Table empty, checking via insert...')
  }

  // Try inserting a minimal record to see what columns are required
  const testInvoice = {
    user_id: '00000000-0000-0000-0000-000000000001',
    invoice_number: 'TEST-001',
    client_name: 'Test Client',
    total: 100,
    status: 'draft'
  }

  const { error: insertError } = await supabase
    .from('invoices')
    .insert([testInvoice])
    .select()

  if (insertError) {
    console.log('\nInsert test result:', insertError.message)
  } else {
    console.log('\nInsert test: SUCCESS')
    // Clean up
    await supabase.from('invoices').delete().eq('invoice_number', 'TEST-001')
  }
}

checkSchema()
