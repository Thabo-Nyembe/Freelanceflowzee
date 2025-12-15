import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import PermissionsClient from './permissions-client'

export default async function PermissionsPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [rolesResult, permissionsResult] = await Promise.all([
    supabase
      .from('roles')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('priority', { ascending: false })
      .limit(50),
    supabase
      .from('permissions')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('priority', { ascending: false })
      .limit(100)
  ])

  return (
    <PermissionsClient
      initialRoles={rolesResult.data || []}
      initialPermissions={permissionsResult.data || []}
    />
  )
}
