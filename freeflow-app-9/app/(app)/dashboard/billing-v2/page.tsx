// Billing V2 - Server Component
// Created: December 14, 2024

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import BillingClient from './billing-client'

export const metadata = { title: 'Billing | Dashboard', description: 'Manage billing and payments' }

export default async function BillingPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: billing, error } = await supabase
    .from('billing')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) console.error('Error:', error)
  return <BillingClient initialBilling={billing || []} />
}
