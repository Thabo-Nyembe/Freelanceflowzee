import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // Using anon key like the UI does
const supabase = createClient(supabaseUrl, supabaseKey)

console.log('\n🔍 Checking why data isn\'t visible in UI...\n')
console.log('Supabase URL:', supabaseUrl)
console.log('Using anon key:', supabaseKey ? 'Yes' : 'No')

// Try to sign in as the demo user
console.log('\n1️⃣  Attempting login as alex@freeflow.io...')
const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email: 'alex@freeflow.io',
  password: 'investor2026'
})

if (authError) {
  console.log('❌ Login Error:', authError.message)
  console.log('   This means the UI cannot authenticate the user!')
  process.exit(1)
}

console.log('✅ Login successful')
console.log('   User ID:', authData.user.id)
console.log('   Email:', authData.user.email)

// Now try to fetch data as the logged-in user would
console.log('\n2️⃣  Fetching data as UI would (with RLS policies)...\n')

const { data: clients, error: clientError, count: clientCount } = await supabase
  .from('clients')
  .select('*', { count: 'exact' })

console.log('Clients Query:')
if (clientError) {
  console.log('   ❌ Error:', clientError.message)
  console.log('   Code:', clientError.code)
  console.log('   Details:', JSON.stringify(clientError.details))
  console.log('   Hint:', clientError.hint)
} else {
  console.log('   ✅ Found:', clientCount || 0, 'clients')
  if (clients && clients.length > 0) {
    console.log('   First 3:', clients.slice(0, 3).map(c => c.name || c.company_name || 'Unnamed'))
  } else {
    console.log('   ⚠️  Query succeeded but returned 0 results')
    console.log('   This means RLS policies are blocking the data!')
  }
}

const { data: projects, error: projectError, count: projectCount } = await supabase
  .from('projects')
  .select('*', { count: 'exact' })

console.log('\nProjects Query:')
if (projectError) {
  console.log('   ❌ Error:', projectError.message)
  console.log('   Code:', projectError.code)
} else {
  console.log('   ✅ Found:', projectCount || 0, 'projects')
  if (projects && projects.length > 0) {
    console.log('   First 3:', projects.slice(0, 3).map(p => p.name || 'Unnamed'))
  } else {
    console.log('   ⚠️  Query succeeded but returned 0 results')
  }
}

const { data: invoices, error: invoiceError, count: invoiceCount } = await supabase
  .from('invoices')
  .select('*', { count: 'exact' })

console.log('\nInvoices Query:')
if (invoiceError) {
  console.log('   ❌ Error:', invoiceError.message)
  console.log('   Code:', invoiceError.code)
} else {
  console.log('   ✅ Found:', invoiceCount || 0, 'invoices')
  if (!invoiceCount || invoiceCount === 0) {
    console.log('   ⚠️  Query succeeded but returned 0 results')
  }
}

console.log('\n3️⃣  DIAGNOSIS:\n')

if (clientError || projectError || invoiceError) {
  console.log('❌ PROBLEM: Database queries are failing')
  console.log('   Likely cause: Table permissions or RLS policy issues')
  console.log('   Solution: Need to adjust Supabase RLS policies')
} else if ((clientCount || 0) === 0 && (projectCount || 0) === 0) {
  console.log('⚠️  PROBLEM: Queries work but return no data')
  console.log('   Likely cause: RLS policies are filtering out all data')
  console.log('   Or: Data user_id doesn\'t match logged-in user ID')
  console.log('   ')
  console.log('   Logged-in user ID:', authData.user.id)
  console.log('   Expected user ID:  00000000-0000-0000-0000-000000000001')
  console.log('   ')
  if (authData.user.id !== '00000000-0000-0000-0000-000000000001') {
    console.log('   ❌ USER ID MISMATCH! This is the problem!')
    console.log('   Data was seeded for user: 00000000-0000-0000-0000-000000000001')
    console.log('   But login returns user:   ' + authData.user.id)
  }
} else {
  console.log('✅ GOOD: Data is visible through the UI authentication!')
  console.log('   If you still can\'t see it in browser, check:')
  console.log('   - Browser console for JavaScript errors')
  console.log('   - Network tab for failed requests')
  console.log('   - Component rendering logic')
}

await supabase.auth.signOut()
console.log('\n')
