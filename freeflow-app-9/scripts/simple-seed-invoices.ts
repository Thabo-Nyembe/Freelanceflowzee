/**
 * Simple Invoice Seeding - Direct INSERT
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { DEMO_USER_ID } from '../lib/utils/demo-mode'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function seedInvoices() {
  console.log('📊 Simple Invoice Seeding\n')

  // First, check what columns actually exist
  const { data: test, error: testError } = await supabase
    .from('invoices')
    .select('*')
    .limit(1)

  if (testError) {
    console.log('⚠️  Invoices table error:', testError.message)
    console.log('\n✅ Using demo invoices from API instead')
    return
  }

  if (test && test.length > 0) {
    console.log('✅ Existing columns:', Object.keys(test[0]).join(', '))
  }

  // Get projects
  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, budget')
    .eq('user_id', DEMO_USER_ID)
    .limit(10)

  if (!projects || projects.length === 0) {
    console.log('❌ No projects found')
    return
  }

  console.log(`✅ Found ${projects.length} projects\n`)

  // Create simple invoices using minimal fields
  const invoices = []
  const now = new Date()

  for (let i = 0; i < Math.min(projects.length, 8); i++) {
    const project = projects[i]
    const amount = Math.floor((project.budget || 5000) / 2)
    const createdDate = new Date(now.getTime() - (i * 10 + 30) * 24 * 60 * 60 * 1000)

    invoices.push({
      user_id: DEMO_USER_ID,
      invoice_number: `INV-2026-${String(100 + i).padStart(4, '0')}`,
      client_name: `Client ${i + 1}`,
      client_email: `client${i + 1}@example.com`,
      total: amount,
      subtotal: amount,
      status: i < 6 ? 'paid' : 'draft',
      items: [],
      created_at: createdDate.toISOString()
    })
  }

  console.log(`💰 Creating ${invoices.length} invoices...\n`)

  const { data: created, error } = await supabase
    .from('invoices')
    .insert(invoices)
    .select()

  if (error) {
    console.error('❌ Error:', error.message)
    console.log('\n📝 Note: Invoices may not be supported in current schema')
    console.log('   Business Intelligence will show $0 revenue')
    console.log('   All other metrics (projects, clients) will work\n')
    return
  }

  const paidInvoices = created?.filter(i => i.status === 'paid') || []
  const totalRevenue = paidInvoices.reduce((sum, i) => sum + (parseFloat(i.total) || 0), 0)

  console.log('✅ Invoices created!')
  console.log(`   Total: ${created?.length || 0}`)
  console.log(`   Paid: ${paidInvoices.length}`)
  console.log(`   Revenue: $${totalRevenue.toLocaleString()}\n`)
}

seedInvoices()
