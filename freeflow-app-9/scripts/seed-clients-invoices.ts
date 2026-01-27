/**
 * Seed Data Script for Clients and Invoices
 *
 * This script inserts realistic demo data for:
 * - 8 sample clients with contact info
 * - 15 invoices across those clients (various statuses)
 * - Payment records for paid invoices
 *
 * Usage: npx ts-node scripts/seed-clients-invoices.ts
 * Or: npx tsx scripts/seed-clients-invoices.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Demo user ID
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.error('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// ============================================================================
// SAMPLE DATA
// ============================================================================

interface Client {
  id: string
  user_id: string
  name: string
  email: string
  phone: string
  company: string
  position: string
  status: 'active' | 'inactive' | 'lead' | 'prospect' | 'churned' | 'vip'
  type: 'individual' | 'business' | 'enterprise' | 'agency' | 'nonprofit'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  address: string
  city: string
  state: string
  country: string
  postal_code: string
  timezone: string
  website: string
  industry: string
  tags: string[]
  notes: string
}

const sampleClients: Client[] = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    user_id: DEMO_USER_ID,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@techstartup.io',
    phone: '+1 (415) 555-0101',
    company: 'TechStartup Inc.',
    position: 'CEO',
    status: 'vip',
    type: 'business',
    priority: 'high',
    address: '123 Innovation Way',
    city: 'San Francisco',
    state: 'CA',
    country: 'United States',
    postal_code: '94105',
    timezone: 'America/Los_Angeles',
    website: 'https://techstartup.io',
    industry: 'Technology',
    tags: ['tech', 'startup', 'priority'],
    notes: 'Key client - multiple ongoing projects. Prefers video calls on Tuesdays.'
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    user_id: DEMO_USER_ID,
    name: 'Michael Chen',
    email: 'michael.chen@designagency.com',
    phone: '+1 (212) 555-0202',
    company: 'Creative Design Agency',
    position: 'Creative Director',
    status: 'active',
    type: 'agency',
    priority: 'medium',
    address: '456 Creative Blvd, Suite 300',
    city: 'New York',
    state: 'NY',
    country: 'United States',
    postal_code: '10001',
    timezone: 'America/New_York',
    website: 'https://creativedesignagency.com',
    industry: 'Creative Services',
    tags: ['design', 'agency', 'branding'],
    notes: 'Regular monthly retainer client. Great for referrals.'
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    user_id: DEMO_USER_ID,
    name: 'Emma Williams',
    email: 'emma.w@globalcorp.com',
    phone: '+44 20 7946 0958',
    company: 'Global Corporation Ltd',
    position: 'Marketing Manager',
    status: 'active',
    type: 'enterprise',
    priority: 'high',
    address: '78 Corporate Plaza',
    city: 'London',
    state: 'Greater London',
    country: 'United Kingdom',
    postal_code: 'EC2A 4NE',
    timezone: 'Europe/London',
    website: 'https://globalcorp.com',
    industry: 'Finance',
    tags: ['enterprise', 'finance', 'international'],
    notes: 'Enterprise client with strict compliance requirements. Net 60 payment terms.'
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    user_id: DEMO_USER_ID,
    name: 'David Rodriguez',
    email: 'david@localcafe.com',
    phone: '+1 (305) 555-0404',
    company: 'Local Cafe & Bakery',
    position: 'Owner',
    status: 'active',
    type: 'individual',
    priority: 'low',
    address: '234 Main Street',
    city: 'Miami',
    state: 'FL',
    country: 'United States',
    postal_code: '33101',
    timezone: 'America/New_York',
    website: 'https://localcafemiami.com',
    industry: 'Food & Beverage',
    tags: ['small-business', 'local', 'hospitality'],
    notes: 'Small business owner. Website redesign project completed.'
  },
  {
    id: '10000000-0000-0000-0000-000000000005',
    user_id: DEMO_USER_ID,
    name: 'Lisa Park',
    email: 'lisa.park@healthtech.co',
    phone: '+1 (617) 555-0505',
    company: 'HealthTech Solutions',
    position: 'VP of Product',
    status: 'active',
    type: 'business',
    priority: 'high',
    address: '567 Innovation Park',
    city: 'Boston',
    state: 'MA',
    country: 'United States',
    postal_code: '02210',
    timezone: 'America/New_York',
    website: 'https://healthtech.co',
    industry: 'Healthcare Technology',
    tags: ['healthtech', 'saas', 'product'],
    notes: 'SaaS platform development. Ongoing maintenance contract.'
  },
  {
    id: '10000000-0000-0000-0000-000000000006',
    user_id: DEMO_USER_ID,
    name: 'James Thompson',
    email: 'james@nonprofitorg.org',
    phone: '+1 (503) 555-0606',
    company: 'Community Impact Foundation',
    position: 'Executive Director',
    status: 'active',
    type: 'nonprofit',
    priority: 'medium',
    address: '890 Community Drive',
    city: 'Portland',
    state: 'OR',
    country: 'United States',
    postal_code: '97201',
    timezone: 'America/Los_Angeles',
    website: 'https://communityimpact.org',
    industry: 'Nonprofit',
    tags: ['nonprofit', 'community', 'social-impact'],
    notes: 'Nonprofit rate applied. Annual website maintenance.'
  },
  {
    id: '10000000-0000-0000-0000-000000000007',
    user_id: DEMO_USER_ID,
    name: 'Anna Mueller',
    email: 'anna.mueller@eurotech.de',
    phone: '+49 30 12345678',
    company: 'EuroTech GmbH',
    position: 'Head of Digital',
    status: 'prospect',
    type: 'enterprise',
    priority: 'medium',
    address: 'Technologiepark 42',
    city: 'Berlin',
    state: 'Berlin',
    country: 'Germany',
    postal_code: '10115',
    timezone: 'Europe/Berlin',
    website: 'https://eurotech.de',
    industry: 'Technology',
    tags: ['prospect', 'enterprise', 'international'],
    notes: 'Potential enterprise client. Initial discovery call scheduled.'
  },
  {
    id: '10000000-0000-0000-0000-000000000008',
    user_id: DEMO_USER_ID,
    name: 'Robert Kim',
    email: 'robert.kim@legalpros.com',
    phone: '+1 (312) 555-0808',
    company: 'Legal Professionals LLP',
    position: 'Managing Partner',
    status: 'churned',
    type: 'business',
    priority: 'low',
    address: '321 Law Center Plaza',
    city: 'Chicago',
    state: 'IL',
    country: 'United States',
    postal_code: '60601',
    timezone: 'America/Chicago',
    website: 'https://legalpros.com',
    industry: 'Legal',
    tags: ['legal', 'professional-services'],
    notes: 'Previous client - project completed. May return for future work.'
  }
]

// Invoice items for different types of work
const invoiceItemTemplates = {
  webDesign: [
    { description: 'Website Design - Homepage', quantity: 1, rate: 2500 },
    { description: 'Website Design - Inner Pages (5)', quantity: 5, rate: 800 },
    { description: 'Responsive Mobile Optimization', quantity: 1, rate: 1500 },
    { description: 'UI/UX Consultation', quantity: 8, rate: 150 }
  ],
  development: [
    { description: 'Frontend Development', quantity: 40, rate: 125 },
    { description: 'Backend API Development', quantity: 30, rate: 150 },
    { description: 'Database Design & Setup', quantity: 10, rate: 175 },
    { description: 'Testing & QA', quantity: 15, rate: 100 }
  ],
  branding: [
    { description: 'Logo Design', quantity: 1, rate: 1500 },
    { description: 'Brand Guidelines Document', quantity: 1, rate: 2000 },
    { description: 'Business Card Design', quantity: 1, rate: 300 },
    { description: 'Social Media Kit', quantity: 1, rate: 800 }
  ],
  consulting: [
    { description: 'Strategic Consulting Session', quantity: 4, rate: 250 },
    { description: 'Technical Assessment', quantity: 1, rate: 1500 },
    { description: 'Implementation Roadmap', quantity: 1, rate: 2000 }
  ],
  maintenance: [
    { description: 'Monthly Website Maintenance', quantity: 1, rate: 500 },
    { description: 'Security Updates & Patches', quantity: 1, rate: 200 },
    { description: 'Performance Optimization', quantity: 2, rate: 300 },
    { description: 'Content Updates (hours)', quantity: 5, rate: 75 }
  ]
}

function generateInvoiceNumber(index: number): string {
  const year = new Date().getFullYear()
  return `INV-${year}-${String(index + 1).padStart(4, '0')}`
}

function calculateInvoiceTotals(items: Array<{ quantity: number; rate: number }>, taxRate: number = 0, discount: number = 0) {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0)
  const taxAmount = Math.round((subtotal - discount) * (taxRate / 100) * 100) / 100
  const total = Math.round((subtotal + taxAmount - discount) * 100) / 100
  return { subtotal, taxAmount, total }
}

function getRandomDate(daysAgo: number, daysRange: number = 30): Date {
  const now = new Date()
  const randomDays = Math.floor(Math.random() * daysRange)
  now.setDate(now.getDate() - daysAgo + randomDays)
  return now
}

function getDueDate(issueDate: Date, netDays: number = 30): Date {
  const dueDate = new Date(issueDate)
  dueDate.setDate(dueDate.getDate() + netDays)
  return dueDate
}

interface Invoice {
  id: string
  user_id: string
  invoice_number: string
  client_id: string
  // Store additional data in metadata for the simplified schema
  amount: number // Total amount (simplified schema uses 'amount' instead of subtotal/tax/total)
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled' | 'refunded'
  due_date: string
  paid_date: string | null
  notes: string
  metadata: {
    items: Array<{ description: string; quantity: number; rate: number; amount: number }>
    subtotal: number
    tax_rate: number
    tax_amount: number
    discount: number
    currency: string
    terms: string
    client_name: string
    client_email: string
  }
}

function generateInvoices(): Invoice[] {
  const invoices: Invoice[] = []

  // Invoice 1: Paid - Web Design for TechStartup (VIP client)
  const items1 = invoiceItemTemplates.webDesign.map(item => ({
    ...item,
    amount: item.quantity * item.rate
  }))
  const totals1 = calculateInvoiceTotals(items1, 8.5, 500)
  const issueDate1 = getRandomDate(45, 10)
  invoices.push({
    id: '20000000-0000-0000-0000-000000000001',
    user_id: DEMO_USER_ID,
    invoice_number: generateInvoiceNumber(0),
    client_id: sampleClients[0].id,
    amount: totals1.total,
    status: 'paid',
    due_date: getDueDate(issueDate1, 30).toISOString().split('T')[0],
    paid_date: getDueDate(issueDate1, 25).toISOString().split('T')[0],
    notes: 'Thank you for your business!',
    metadata: {
      items: items1,
      subtotal: totals1.subtotal,
      tax_rate: 8.5,
      tax_amount: totals1.taxAmount,
      discount: 500,
      currency: 'USD',
      terms: 'Net 30. Late payments subject to 1.5% monthly interest.',
      client_name: sampleClients[0].name,
      client_email: sampleClients[0].email
    }
  })

  // Invoice 2: Paid - Development for TechStartup
  const items2 = invoiceItemTemplates.development.map(item => ({
    ...item,
    amount: item.quantity * item.rate
  }))
  const totals2 = calculateInvoiceTotals(items2, 8.5, 0)
  const issueDate2 = getRandomDate(30, 10)
  invoices.push({
    id: '20000000-0000-0000-0000-000000000002',
    user_id: DEMO_USER_ID,
    invoice_number: generateInvoiceNumber(1),
    client_id: sampleClients[0].id,
    amount: totals2.total,
    status: 'paid',
    due_date: getDueDate(issueDate2, 30).toISOString().split('T')[0],
    paid_date: getDueDate(issueDate2, 20).toISOString().split('T')[0],
    notes: 'Phase 2 development complete.',
    metadata: {
      items: items2,
      subtotal: totals2.subtotal,
      tax_rate: 8.5,
      tax_amount: totals2.taxAmount,
      discount: 0,
      currency: 'USD',
      terms: 'Net 30. Late payments subject to 1.5% monthly interest.',
      client_name: sampleClients[0].name,
      client_email: sampleClients[0].email
    }
  })

  // Invoice 3: Sent - Branding for Creative Design Agency
  const items3 = invoiceItemTemplates.branding.map(item => ({
    ...item,
    amount: item.quantity * item.rate
  }))
  const totals3 = calculateInvoiceTotals(items3, 8.875, 0)
  const issueDate3 = getRandomDate(15, 5)
  invoices.push({
    id: '20000000-0000-0000-0000-000000000003',
    user_id: DEMO_USER_ID,
    invoice_number: generateInvoiceNumber(2),
    client_id: sampleClients[1].id,
    amount: totals3.total,
    status: 'sent',
    due_date: getDueDate(issueDate3, 30).toISOString().split('T')[0],
    paid_date: null,
    notes: 'Branding package as discussed.',
    metadata: {
      items: items3,
      subtotal: totals3.subtotal,
      tax_rate: 8.875,
      tax_amount: totals3.taxAmount,
      discount: 0,
      currency: 'USD',
      terms: 'Net 30. Late payments subject to 1.5% monthly interest.',
      client_name: sampleClients[1].name,
      client_email: sampleClients[1].email
    }
  })

  // Invoice 4: Overdue - Consulting for Global Corporation
  const items4 = invoiceItemTemplates.consulting.map(item => ({
    ...item,
    amount: item.quantity * item.rate
  }))
  const totals4 = calculateInvoiceTotals(items4, 20, 0)
  const issueDate4 = getRandomDate(60, 10)
  invoices.push({
    id: '20000000-0000-0000-0000-000000000004',
    user_id: DEMO_USER_ID,
    invoice_number: generateInvoiceNumber(3),
    client_id: sampleClients[2].id,
    amount: totals4.total,
    status: 'overdue',
    due_date: getDueDate(issueDate4, 60).toISOString().split('T')[0],
    paid_date: null,
    notes: 'Strategic consulting engagement - Q4 2024',
    metadata: {
      items: items4,
      subtotal: totals4.subtotal,
      tax_rate: 20,
      tax_amount: totals4.taxAmount,
      discount: 0,
      currency: 'GBP',
      terms: 'Net 60. Payment via bank transfer.',
      client_name: sampleClients[2].name,
      client_email: sampleClients[2].email
    }
  })

  // Invoice 5: Paid - Website for Local Cafe
  const items5 = [
    { description: 'Small Business Website Package', quantity: 1, rate: 2500, amount: 2500 },
    { description: 'Menu Integration', quantity: 1, rate: 500, amount: 500 },
    { description: 'Online Ordering Setup', quantity: 1, rate: 750, amount: 750 },
    { description: 'Google Business Profile Setup', quantity: 1, rate: 200, amount: 200 }
  ]
  const totals5 = calculateInvoiceTotals(items5, 7, 0)
  const issueDate5 = getRandomDate(90, 15)
  invoices.push({
    id: '20000000-0000-0000-0000-000000000005',
    user_id: DEMO_USER_ID,
    invoice_number: generateInvoiceNumber(4),
    client_id: sampleClients[3].id,
    amount: totals5.total,
    status: 'paid',
    due_date: getDueDate(issueDate5, 14).toISOString().split('T')[0],
    paid_date: getDueDate(issueDate5, 10).toISOString().split('T')[0],
    notes: 'Small business special rate applied.',
    metadata: {
      items: items5,
      subtotal: totals5.subtotal,
      tax_rate: 7,
      tax_amount: totals5.taxAmount,
      discount: 0,
      currency: 'USD',
      terms: 'Net 14. Thank you for supporting local businesses!',
      client_name: sampleClients[3].name,
      client_email: sampleClients[3].email
    }
  })

  // Invoice 6: Draft - New project for HealthTech
  const items6 = [
    { description: 'Healthcare App UI Design', quantity: 1, rate: 8000, amount: 8000 },
    { description: 'Patient Portal Development', quantity: 80, rate: 150, amount: 12000 },
    { description: 'HIPAA Compliance Review', quantity: 1, rate: 3000, amount: 3000 },
    { description: 'Integration with EHR Systems', quantity: 40, rate: 175, amount: 7000 }
  ]
  const totals6 = calculateInvoiceTotals(items6, 6.25, 1500)
  const issueDate6 = new Date()
  invoices.push({
    id: '20000000-0000-0000-0000-000000000006',
    user_id: DEMO_USER_ID,
    invoice_number: generateInvoiceNumber(5),
    client_id: sampleClients[4].id,
    amount: totals6.total,
    status: 'draft',
    due_date: getDueDate(issueDate6, 45).toISOString().split('T')[0],
    paid_date: null,
    notes: 'Healthcare platform development - Phase 1',
    metadata: {
      items: items6,
      subtotal: totals6.subtotal,
      tax_rate: 6.25,
      tax_amount: totals6.taxAmount,
      discount: 1500,
      currency: 'USD',
      terms: 'Net 45. Milestone payments accepted.',
      client_name: sampleClients[4].name,
      client_email: sampleClients[4].email
    }
  })

  // Invoice 7: Paid - Nonprofit discount
  const items7 = [
    { description: 'Nonprofit Website Redesign', quantity: 1, rate: 1800, amount: 1800 },
    { description: 'Donation Platform Integration', quantity: 1, rate: 600, amount: 600 },
    { description: 'Event Calendar System', quantity: 1, rate: 400, amount: 400 },
    { description: 'Volunteer Portal', quantity: 1, rate: 500, amount: 500 }
  ]
  const totals7 = calculateInvoiceTotals(items7, 0, 500)
  const issueDate7 = getRandomDate(75, 10)
  invoices.push({
    id: '20000000-0000-0000-0000-000000000007',
    user_id: DEMO_USER_ID,
    invoice_number: generateInvoiceNumber(6),
    client_id: sampleClients[5].id,
    amount: totals7.total,
    status: 'paid',
    due_date: getDueDate(issueDate7, 30).toISOString().split('T')[0],
    paid_date: getDueDate(issueDate7, 28).toISOString().split('T')[0],
    notes: '25% nonprofit discount applied. Tax exempt organization.',
    metadata: {
      items: items7,
      subtotal: totals7.subtotal,
      tax_rate: 0,
      tax_amount: totals7.taxAmount,
      discount: 500,
      currency: 'USD',
      terms: 'Net 30. Tax exempt - EIN provided.',
      client_name: sampleClients[5].name,
      client_email: sampleClients[5].email
    }
  })

  // Invoice 8: Sent - Monthly maintenance
  const items8 = invoiceItemTemplates.maintenance.map(item => ({
    ...item,
    amount: item.quantity * item.rate
  }))
  const totals8 = calculateInvoiceTotals(items8, 6.25, 0)
  const issueDate8 = getRandomDate(5, 3)
  invoices.push({
    id: '20000000-0000-0000-0000-000000000008',
    user_id: DEMO_USER_ID,
    invoice_number: generateInvoiceNumber(7),
    client_id: sampleClients[4].id,
    amount: totals8.total,
    status: 'sent',
    due_date: getDueDate(issueDate8, 15).toISOString().split('T')[0],
    paid_date: null,
    notes: 'January 2025 maintenance',
    metadata: {
      items: items8,
      subtotal: totals8.subtotal,
      tax_rate: 6.25,
      tax_amount: totals8.taxAmount,
      discount: 0,
      currency: 'USD',
      terms: 'Net 15. Recurring monthly invoice.',
      client_name: sampleClients[4].name,
      client_email: sampleClients[4].email
    }
  })

  // Invoice 9: Viewed - Large enterprise project
  const items9 = [
    { description: 'Enterprise Portal Development', quantity: 200, rate: 150, amount: 30000 },
    { description: 'SSO Integration', quantity: 1, rate: 5000, amount: 5000 },
    { description: 'Custom Reporting Dashboard', quantity: 1, rate: 8000, amount: 8000 },
    { description: 'Training Sessions (days)', quantity: 3, rate: 2000, amount: 6000 }
  ]
  const totals9 = calculateInvoiceTotals(items9, 20, 2000)
  const issueDate9 = getRandomDate(20, 5)
  invoices.push({
    id: '20000000-0000-0000-0000-000000000009',
    user_id: DEMO_USER_ID,
    invoice_number: generateInvoiceNumber(8),
    client_id: sampleClients[2].id,
    amount: totals9.total,
    status: 'viewed',
    due_date: getDueDate(issueDate9, 60).toISOString().split('T')[0],
    paid_date: null,
    notes: 'Enterprise portal project - Milestone 1',
    metadata: {
      items: items9,
      subtotal: totals9.subtotal,
      tax_rate: 20,
      tax_amount: totals9.taxAmount,
      discount: 2000,
      currency: 'GBP',
      terms: 'Net 60. Purchase order required.',
      client_name: sampleClients[2].name,
      client_email: sampleClients[2].email
    }
  })

  // Invoice 10: Paid - Retainer for Design Agency
  const items10 = [
    { description: 'Monthly Design Retainer', quantity: 1, rate: 4000, amount: 4000 },
    { description: 'Additional Design Hours', quantity: 12, rate: 125, amount: 1500 }
  ]
  const totals10 = calculateInvoiceTotals(items10, 8.875, 0)
  const issueDate10 = getRandomDate(35, 5)
  invoices.push({
    id: '20000000-0000-0000-0000-000000000010',
    user_id: DEMO_USER_ID,
    invoice_number: generateInvoiceNumber(9),
    client_id: sampleClients[1].id,
    amount: totals10.total,
    status: 'paid',
    due_date: getDueDate(issueDate10, 15).toISOString().split('T')[0],
    paid_date: getDueDate(issueDate10, 12).toISOString().split('T')[0],
    notes: 'December 2024 retainer + overage hours',
    metadata: {
      items: items10,
      subtotal: totals10.subtotal,
      tax_rate: 8.875,
      tax_amount: totals10.taxAmount,
      discount: 0,
      currency: 'USD',
      terms: 'Net 15. Monthly retainer agreement.',
      client_name: sampleClients[1].name,
      client_email: sampleClients[1].email
    }
  })

  // Invoice 11: Cancelled
  const items11 = [
    { description: 'Mobile App Design', quantity: 1, rate: 6000, amount: 6000 },
    { description: 'App Development (iOS)', quantity: 100, rate: 150, amount: 15000 }
  ]
  const totals11 = calculateInvoiceTotals(items11, 19, 0)
  const issueDate11 = getRandomDate(50, 10)
  invoices.push({
    id: '20000000-0000-0000-0000-000000000011',
    user_id: DEMO_USER_ID,
    invoice_number: generateInvoiceNumber(10),
    client_id: sampleClients[6].id,
    amount: totals11.total,
    status: 'cancelled',
    due_date: getDueDate(issueDate11, 30).toISOString().split('T')[0],
    paid_date: null,
    notes: 'Project cancelled - scope change. See credit memo.',
    metadata: {
      items: items11,
      subtotal: totals11.subtotal,
      tax_rate: 19,
      tax_amount: totals11.taxAmount,
      discount: 0,
      currency: 'EUR',
      terms: 'Net 30.',
      client_name: sampleClients[6].name,
      client_email: sampleClients[6].email
    }
  })

  // Invoice 12: Sent - Annual maintenance
  const items12 = [
    { description: 'Annual Website Maintenance Plan', quantity: 1, rate: 3600, amount: 3600 },
    { description: 'SSL Certificate Renewal', quantity: 1, rate: 150, amount: 150 },
    { description: 'Annual Security Audit', quantity: 1, rate: 500, amount: 500 }
  ]
  const totals12 = calculateInvoiceTotals(items12, 0, 0)
  const issueDate12 = getRandomDate(10, 3)
  invoices.push({
    id: '20000000-0000-0000-0000-000000000012',
    user_id: DEMO_USER_ID,
    invoice_number: generateInvoiceNumber(11),
    client_id: sampleClients[5].id,
    amount: totals12.total,
    status: 'sent',
    due_date: getDueDate(issueDate12, 30).toISOString().split('T')[0],
    paid_date: null,
    notes: '2025 Annual Maintenance - Nonprofit rate',
    metadata: {
      items: items12,
      subtotal: totals12.subtotal,
      tax_rate: 0,
      tax_amount: totals12.taxAmount,
      discount: 0,
      currency: 'USD',
      terms: 'Net 30. Annual payment preferred.',
      client_name: sampleClients[5].name,
      client_email: sampleClients[5].email
    }
  })

  // Invoice 13: Paid - Past project for churned client
  const items13 = [
    { description: 'Legal Website Development', quantity: 1, rate: 8500, amount: 8500 },
    { description: 'Document Portal System', quantity: 1, rate: 4500, amount: 4500 },
    { description: 'Client Intake Forms', quantity: 1, rate: 1500, amount: 1500 }
  ]
  const totals13 = calculateInvoiceTotals(items13, 10.25, 0)
  const issueDate13 = getRandomDate(180, 30)
  invoices.push({
    id: '20000000-0000-0000-0000-000000000013',
    user_id: DEMO_USER_ID,
    invoice_number: generateInvoiceNumber(12),
    client_id: sampleClients[7].id,
    amount: totals13.total,
    status: 'paid',
    due_date: getDueDate(issueDate13, 30).toISOString().split('T')[0],
    paid_date: getDueDate(issueDate13, 35).toISOString().split('T')[0],
    notes: 'Legal website project complete.',
    metadata: {
      items: items13,
      subtotal: totals13.subtotal,
      tax_rate: 10.25,
      tax_amount: totals13.taxAmount,
      discount: 0,
      currency: 'USD',
      terms: 'Net 30.',
      client_name: sampleClients[7].name,
      client_email: sampleClients[7].email
    }
  })

  // Invoice 14: Overdue - Follow up needed
  const items14 = [
    { description: 'Additional Development Work', quantity: 25, rate: 150, amount: 3750 },
    { description: 'Bug Fixes & Updates', quantity: 8, rate: 125, amount: 1000 }
  ]
  const totals14 = calculateInvoiceTotals(items14, 8.5, 0)
  const issueDate14 = getRandomDate(50, 5)
  invoices.push({
    id: '20000000-0000-0000-0000-000000000014',
    user_id: DEMO_USER_ID,
    invoice_number: generateInvoiceNumber(13),
    client_id: sampleClients[0].id,
    amount: totals14.total,
    status: 'overdue',
    due_date: getDueDate(issueDate14, 30).toISOString().split('T')[0],
    paid_date: null,
    notes: 'Additional work per change request #CR-2024-015',
    metadata: {
      items: items14,
      subtotal: totals14.subtotal,
      tax_rate: 8.5,
      tax_amount: totals14.taxAmount,
      discount: 0,
      currency: 'USD',
      terms: 'Net 30. OVERDUE - Please remit payment.',
      client_name: sampleClients[0].name,
      client_email: sampleClients[0].email
    }
  })

  // Invoice 15: Draft - New quote
  const items15 = [
    { description: 'E-commerce Platform Development', quantity: 1, rate: 15000, amount: 15000 },
    { description: 'Payment Gateway Integration', quantity: 1, rate: 2500, amount: 2500 },
    { description: 'Inventory Management System', quantity: 1, rate: 5000, amount: 5000 },
    { description: 'Training & Documentation', quantity: 16, rate: 100, amount: 1600 }
  ]
  const totals15 = calculateInvoiceTotals(items15, 8.5, 0)
  const issueDate15 = new Date()
  invoices.push({
    id: '20000000-0000-0000-0000-000000000015',
    user_id: DEMO_USER_ID,
    invoice_number: generateInvoiceNumber(14),
    client_id: sampleClients[0].id,
    amount: totals15.total,
    status: 'draft',
    due_date: getDueDate(issueDate15, 30).toISOString().split('T')[0],
    paid_date: null,
    notes: 'E-commerce platform proposal - awaiting approval',
    metadata: {
      items: items15,
      subtotal: totals15.subtotal,
      tax_rate: 8.5,
      tax_amount: totals15.taxAmount,
      discount: 0,
      currency: 'USD',
      terms: 'Net 30. 50% deposit required to begin.',
      client_name: sampleClients[0].name,
      client_email: sampleClients[0].email
    }
  })

  return invoices
}

interface Payment {
  id: string
  invoice_id: string
  user_id: string
  amount: number
  currency: string
  method: 'credit_card' | 'bank_transfer' | 'paypal' | 'stripe' | 'cash' | 'check' | 'crypto' | 'other'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  transaction_id: string
  processing_fee: number
  net_amount: number
  payment_date: string
  notes: string
}

function generatePayments(invoices: Invoice[]): Payment[] {
  const payments: Payment[] = []
  const paidInvoices = invoices.filter(inv => inv.status === 'paid')

  paidInvoices.forEach((invoice, index) => {
    const methods: Payment['method'][] = ['credit_card', 'bank_transfer', 'stripe', 'paypal']
    const method = methods[index % methods.length]

    let processingFee = 0
    if (method === 'credit_card' || method === 'stripe') {
      processingFee = Math.round(invoice.amount * 0.029 * 100) / 100 + 0.30
    } else if (method === 'paypal') {
      processingFee = Math.round(invoice.amount * 0.0349 * 100) / 100 + 0.49
    }

    const netAmount = Math.round((invoice.amount - processingFee) * 100) / 100

    payments.push({
      id: `30000000-0000-0000-0000-00000000000${index + 1}`,
      invoice_id: invoice.id,
      user_id: DEMO_USER_ID,
      amount: invoice.amount,
      currency: invoice.metadata.currency,
      method: method,
      status: 'completed',
      transaction_id: `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      processing_fee: processingFee,
      net_amount: netAmount,
      payment_date: invoice.paid_date!,
      notes: `Payment for ${invoice.invoice_number}`
    })
  })

  return payments
}

// ============================================================================
// MAIN SEEDING FUNCTION
// ============================================================================

async function seedData() {
  console.log('========================================')
  console.log('Starting Seed Data Script')
  console.log('========================================')
  console.log('')
  console.log('Demo User ID:', DEMO_USER_ID)
  console.log('Supabase URL:', supabaseUrl)
  console.log('')

  try {
    // Check if data already exists
    console.log('Checking for existing data...')

    const { data: existingClients, error: clientCheckError } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', DEMO_USER_ID)
      .limit(1)

    if (clientCheckError) {
      console.log('Note: Could not check clients table:', clientCheckError.message)
    }

    const { data: existingInvoices, error: invoiceCheckError } = await supabase
      .from('invoices')
      .select('id')
      .eq('user_id', DEMO_USER_ID)
      .limit(1)

    if (invoiceCheckError) {
      console.log('Note: Could not check invoices table:', invoiceCheckError.message)
    }

    // Check if we should proceed
    const hasExistingData = (existingClients && existingClients.length > 0) ||
                            (existingInvoices && existingInvoices.length > 0)

    if (hasExistingData) {
      console.log('')
      console.log('Existing data found for demo user.')
      console.log('Do you want to clear existing data and re-seed? (This script will proceed)')
      console.log('')

      // Clear existing data
      console.log('Clearing existing payments...')
      await supabase
        .from('invoice_payments')
        .delete()
        .eq('user_id', DEMO_USER_ID)

      console.log('Clearing existing invoices...')
      await supabase
        .from('invoices')
        .delete()
        .eq('user_id', DEMO_USER_ID)

      console.log('Clearing existing clients...')
      await supabase
        .from('clients')
        .delete()
        .eq('user_id', DEMO_USER_ID)

      console.log('Existing data cleared.')
      console.log('')
    }

    // Insert Clients - try full schema first, then fall back to minimal
    console.log('Inserting clients...')

    // First try with full schema (as defined in 20251126_clients_system.sql)
    const fullClientData = sampleClients.map(client => ({
      id: client.id,
      user_id: client.user_id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company,
      position: client.position,
      status: client.status,
      type: client.type,
      priority: client.priority,
      address: client.address,
      city: client.city,
      state: client.state,
      country: client.country,
      postal_code: client.postal_code,
      timezone: client.timezone,
      website: client.website,
      industry: client.industry,
      tags: client.tags,
      notes: client.notes
    }))

    // Try full schema insert first
    let clientsInserted = false
    const { data: fullInsertResult, error: fullInsertError } = await supabase
      .from('clients')
      .insert(fullClientData)
      .select()

    if (!fullInsertError && fullInsertResult) {
      console.log(`Inserted ${fullInsertResult.length} clients (full schema)`)
      clientsInserted = true
    } else {
      console.log('Full schema insert failed, trying minimal schema...')
      console.log('Error:', fullInsertError?.message)

      // Fall back to minimal schema (id, user_id, name, email, phone, company, address, notes)
      const minimalClientData = sampleClients.map(client => ({
        id: client.id,
        user_id: client.user_id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        company: client.company,
        address: `${client.address}, ${client.city}, ${client.state} ${client.postal_code}, ${client.country}`,
        notes: `${client.notes}\n\nPosition: ${client.position}\nStatus: ${client.status}\nType: ${client.type}\nPriority: ${client.priority}\nIndustry: ${client.industry}\nWebsite: ${client.website}\nTimezone: ${client.timezone}\nTags: ${client.tags.join(', ')}`
      }))

      const { data: minimalInsertResult, error: minimalInsertError } = await supabase
        .from('clients')
        .insert(minimalClientData)
        .select()

      if (minimalInsertError) {
        console.error('Error inserting clients (minimal):', minimalInsertError)
        throw minimalInsertError
      }

      console.log(`Inserted ${minimalInsertResult?.length || 0} clients (minimal schema)`)
      clientsInserted = true
    }

    if (!clientsInserted) {
      throw new Error('Failed to insert clients with both schema versions')
    }

    // Generate and Insert Invoices
    console.log('')
    console.log('Generating invoices...')
    const invoices = generateInvoices()

    // Try multiple schema versions for invoices
    let invoicesInserted = false

    // Version 1: Full schema from invoicing_minimal.sql (with user_id, client_email, items, etc.)
    const fullInvoiceData = invoices.map(invoice => ({
      id: invoice.id,
      user_id: invoice.user_id,
      invoice_number: invoice.invoice_number,
      client_id: invoice.client_id,
      client_name: invoice.metadata.client_name,
      client_email: invoice.metadata.client_email,
      items: invoice.metadata.items,
      subtotal: invoice.metadata.subtotal,
      tax_rate: invoice.metadata.tax_rate,
      tax_amount: invoice.metadata.tax_amount,
      discount: invoice.metadata.discount,
      total: invoice.amount,
      currency: invoice.metadata.currency,
      status: invoice.status,
      due_date: invoice.due_date,
      paid_date: invoice.paid_date,
      notes: invoice.notes,
      terms: invoice.metadata.terms
    }))

    const { data: fullInvoiceResult, error: fullInvoiceError } = await supabase
      .from('invoices')
      .insert(fullInvoiceData)
      .select()

    if (!fullInvoiceError && fullInvoiceResult) {
      console.log(`Inserted ${fullInvoiceResult.length} invoices (full schema)`)
      invoicesInserted = true
    } else {
      console.log('Full schema insert failed, trying minimal schema...')
      console.log('Error:', fullInvoiceError?.message)

      // Version 2: Minimal schema from init_schema.sql
      const minimalInvoiceData = invoices.map(invoice => ({
        id: invoice.id,
        user_id: invoice.user_id,
        invoice_number: invoice.invoice_number,
        client_id: invoice.client_id,
        amount: invoice.amount,
        status: invoice.status,
        due_date: invoice.due_date,
        paid_date: invoice.paid_date,
        notes: `${invoice.notes}\n\nCurrency: ${invoice.metadata.currency}\nSubtotal: ${invoice.metadata.subtotal}\nTax: ${invoice.metadata.tax_amount} (${invoice.metadata.tax_rate}%)\nDiscount: ${invoice.metadata.discount}\n\n${invoice.metadata.terms}`
      }))

      const { data: minimalInvoiceResult, error: minimalInvoiceError } = await supabase
        .from('invoices')
        .insert(minimalInvoiceData)
        .select()

      if (!minimalInvoiceError && minimalInvoiceResult) {
        console.log(`Inserted ${minimalInvoiceResult.length} invoices (minimal schema)`)
        invoicesInserted = true
      } else {
        console.log('Minimal schema also failed, trying without user_id...')
        console.log('Error:', minimalInvoiceError?.message)

        // Version 3: Without user_id (in case table doesn't have it)
        const noUserIdData = invoices.map(invoice => ({
          id: invoice.id,
          invoice_number: invoice.invoice_number,
          client_id: invoice.client_id,
          amount: invoice.amount,
          status: invoice.status,
          due_date: invoice.due_date,
          paid_date: invoice.paid_date,
          notes: invoice.notes
        }))

        const { data: noUserIdResult, error: noUserIdError } = await supabase
          .from('invoices')
          .insert(noUserIdData)
          .select()

        if (!noUserIdError && noUserIdResult) {
          console.log(`Inserted ${noUserIdResult.length} invoices (no user_id schema)`)
          invoicesInserted = true
        } else {
          console.error('Error inserting invoices (all schemas failed):', noUserIdError)
          console.log('Warning: Could not insert invoices. Continuing with other data...')
        }
      }
    }

    // Generate and Insert Payments
    console.log('')
    console.log('Generating payments for paid invoices...')
    const payments = generatePayments(invoices)

    if (payments.length > 0) {
      const paymentsToInsert = payments.map(payment => ({
        id: payment.id,
        invoice_id: payment.invoice_id,
        user_id: payment.user_id,
        amount: payment.amount,
        currency: payment.currency,
        method: payment.method,
        status: payment.status,
        transaction_id: payment.transaction_id,
        processing_fee: payment.processing_fee,
        net_amount: payment.net_amount,
        payment_date: payment.payment_date,
        notes: payment.notes
      }))

      const { data: insertedPayments, error: paymentError } = await supabase
        .from('invoice_payments')
        .insert(paymentsToInsert)
        .select()

      if (paymentError) {
        console.error('Error inserting payments:', paymentError)
        throw paymentError
      }

      console.log(`Inserted ${insertedPayments?.length || 0} payments`)
    }

    // Summary
    console.log('')
    console.log('========================================')
    console.log('Seed Data Summary')
    console.log('========================================')
    console.log('')
    console.log('Clients inserted:', sampleClients.length)
    console.log('  - VIP:', sampleClients.filter(c => c.status === 'vip').length)
    console.log('  - Active:', sampleClients.filter(c => c.status === 'active').length)
    console.log('  - Prospect:', sampleClients.filter(c => c.status === 'prospect').length)
    console.log('  - Churned:', sampleClients.filter(c => c.status === 'churned').length)
    console.log('')
    console.log('Invoices inserted:', invoices.length)
    console.log('  - Draft:', invoices.filter(i => i.status === 'draft').length)
    console.log('  - Sent:', invoices.filter(i => i.status === 'sent').length)
    console.log('  - Viewed:', invoices.filter(i => i.status === 'viewed').length)
    console.log('  - Paid:', invoices.filter(i => i.status === 'paid').length)
    console.log('  - Overdue:', invoices.filter(i => i.status === 'overdue').length)
    console.log('  - Cancelled:', invoices.filter(i => i.status === 'cancelled').length)
    console.log('')
    console.log('Payments inserted:', payments.length)
    console.log('')

    const totalRevenue = invoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + i.amount, 0)
    const pendingAmount = invoices
      .filter(i => ['sent', 'viewed'].includes(i.status))
      .reduce((sum, i) => sum + i.amount, 0)
    const overdueAmount = invoices
      .filter(i => i.status === 'overdue')
      .reduce((sum, i) => sum + i.amount, 0)

    console.log('Financial Summary:')
    console.log(`  - Total Revenue (Paid): $${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`)
    console.log(`  - Pending: $${pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`)
    console.log(`  - Overdue: $${overdueAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`)
    console.log('')
    console.log('Seed data insertion complete!')
    console.log('')

  } catch (error) {
    console.error('Seed data failed:', error)
    process.exit(1)
  }
}

// Run the seed function
seedData()
