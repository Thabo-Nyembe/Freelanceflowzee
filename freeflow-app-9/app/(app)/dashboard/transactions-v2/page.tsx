// Transactions V2 - Server Component
// Created: December 14, 2024

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import TransactionsClient from './transactions-client'

export const metadata = { title: 'Transactions | Dashboard', description: 'Track and manage all financial transactions' }

export default async function TransactionsPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('transaction_date', { ascending: false })
    .limit(50)

  if (error) console.error('Error:', error)
  return <TransactionsClient initialTransactions={transactions || []} />
}
