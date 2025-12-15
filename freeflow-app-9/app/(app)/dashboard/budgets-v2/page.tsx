// Budgets V2 - Server Component
// Created: December 14, 2024

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import BudgetsClient from './budgets-client'

export const metadata = { title: 'Budgets | Dashboard', description: 'Monitor and manage spending across all categories' }

export default async function BudgetsPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: budgets, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('start_date', { ascending: false })
    .limit(50)

  if (error) console.error('Error:', error)
  return <BudgetsClient initialBudgets={budgets || []} />
}
