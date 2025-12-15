// Invoices V2 - Server Component with Real Data
// Created: December 14, 2024

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import InvoicesClient from './invoices-client'

export const metadata = {
  title: 'Invoices | Dashboard',
  description: 'Manage your invoices and billing'
}

export default async function InvoicesPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) console.error('Error fetching invoices:', error)
  return <InvoicesClient initialInvoices={invoices || []} />
}
