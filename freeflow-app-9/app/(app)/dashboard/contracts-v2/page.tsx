// Contracts V2 - Server Component
// Created: December 14, 2024

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ContractsClient from './contracts-client'

export const metadata = { title: 'Contracts | Dashboard', description: 'Manage your contracts' }

export default async function ContractsPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: contracts, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) console.error('Error:', error)
  return <ContractsClient initialContracts={contracts || []} />
}
