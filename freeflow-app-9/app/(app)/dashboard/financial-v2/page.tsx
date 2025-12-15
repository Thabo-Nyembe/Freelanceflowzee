// Financial V2 - Server Component
// Created: December 14, 2024

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import FinancialClient from './financial-client'

export const metadata = { title: 'Financial | Dashboard', description: 'Manage financial records and analytics' }

export default async function FinancialPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: financial, error } = await supabase
    .from('financial')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('record_date', { ascending: false })
    .limit(50)

  if (error) console.error('Error:', error)
  return <FinancialClient initialFinancial={financial || []} />
}
