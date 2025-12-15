import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ExpensesClient from './expenses-client'

export default async function ExpensesPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: expenses, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50)

  return <ExpensesClient initialExpenses={expenses || []} />
}
