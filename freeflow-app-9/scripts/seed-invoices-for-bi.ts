/**
 * Seed Invoices for Business Intelligence Demo
 * Creates realistic invoice data for alex@freeflow.io
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
  console.log('📊 Seeding Invoices for Business Intelligence\n')

  // Get existing projects and clients
  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, budget, client_id')
    .eq('user_id', DEMO_USER_ID)
    .limit(15)

  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, email')
    .eq('user_id', DEMO_USER_ID)
    .limit(10)

  if (!projects || projects.length === 0) {
    console.log('❌ No projects found')
    return
  }

  console.log(`✅ Found ${projects.length} projects`)
  console.log(`✅ Found ${clients?.length || 0} clients\n`)

  // Create invoices for the last 6 months
  const invoices = []
  const now = new Date()

  for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
    const invoiceDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 15)
    const paidDate = new Date(invoiceDate.getTime() + 7 * 24 * 60 * 60 * 1000) // Paid 7 days later

    // Create 2-4 invoices per month
    const invoiceCount = Math.floor(Math.random() * 3) + 2

    for (let i = 0; i < invoiceCount && i < projects.length; i++) {
      const project = projects[(monthOffset * 4 + i) % projects.length]
      const amount = Math.floor((project.budget || 5000) / 3) + Math.random() * 2000

      // 90% paid, 10% pending
      const isPaid = Math.random() > 0.1

      const client = clients?.[(monthOffset + i) % (clients?.length || 1)]
      const roundedAmount = Math.round(amount)

      invoices.push({
        user_id: DEMO_USER_ID,
        client_id: project.client_id || client?.id,
        client_name: client?.name || 'Client Name',
        client_email: client?.email || 'client@example.com',
        invoice_number: `INV-2025-${String(monthOffset * 10 + i + 100).padStart(4, '0')}`,
        subtotal: roundedAmount,
        tax_rate: 0,
        tax_amount: 0,
        discount: 0,
        total: roundedAmount,
        status: isPaid ? 'paid' : 'pending',
        issue_date: invoiceDate.toISOString().split('T')[0],
        due_date: new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paid_date: isPaid ? paidDate.toISOString().split('T')[0] : null,
        created_at: invoiceDate.toISOString(),
        updated_at: invoiceDate.toISOString(),
        items: [
          {
            description: `${project.title} - Development & Design`,
            quantity: 1,
            rate: roundedAmount,
            amount: roundedAmount
          }
        ]
      })
    }
  }

  console.log(`💰 Creating ${invoices.length} invoices...\n`)

  // Insert invoices
  const { data: created, error } = await supabase
    .from('invoices')
    .insert(invoices)
    .select()

  if (error) {
    console.error('❌ Error creating invoices:', error.message)
    return
  }

  const paidInvoices = created?.filter(i => i.status === 'paid') || []
  const totalRevenue = paidInvoices.reduce((sum, i) => sum + (parseFloat(i.total) || 0), 0)

  console.log('✅ Invoices created successfully!')
  console.log(`   Total Invoices: ${created?.length || 0}`)
  console.log(`   Paid Invoices: ${paidInvoices.length}`)
  console.log(`   Total Revenue: $${totalRevenue.toLocaleString()}`)
  console.log(`   Average Invoice: $${Math.round(totalRevenue / paidInvoices.length).toLocaleString()}`)

  // Test BI API
  console.log('\n📈 Testing Business Intelligence API...')
  const response = await fetch('http://localhost:9323/api/business-intelligence?type=overview&businessType=freelancer&period=monthly&demo=true')
  const biData = await response.json()

  console.log('\nBusiness Intelligence Metrics:')
  console.log(`   Revenue: $${biData.revenue?.total?.toLocaleString() || 0}`)
  console.log(`   Projects: ${biData.projects?.total || 0} (${biData.projects?.active || 0} active)`)
  console.log(`   Clients: ${biData.clients?.total || 0} (${biData.clients?.active || 0} active)`)
  console.log(`   Profit Margin: ${biData.profitability?.grossMargin?.toFixed(1) || 0}%`)
  console.log('')
}

seedInvoices()
