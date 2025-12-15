import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import RolesClient from './roles-client'

export const dynamic = 'force-dynamic'

/**
 * Roles V2 - Role & Permission Management
 * Server-side rendered with real-time client updates
 */
export default async function RolesV2Page() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  let roles: any[] = []
  let stats = {
    totalRoles: 0,
    activeRoles: 0,
    inactiveRoles: 0,
    customRoles: 0,
    systemRoles: 0,
    totalAssignments: 0,
    activeAssignments: 0,
    totalPermissions: 0
  }

  if (user) {
    // Fetch roles
    const { data: rolesData } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(100)

    roles = rolesData || []

    if (roles.length > 0) {
      stats = {
        totalRoles: roles.length,
        activeRoles: roles.filter(r => r.status === 'active').length,
        inactiveRoles: roles.filter(r => r.status === 'inactive').length,
        customRoles: roles.filter(r => r.type === 'custom').length,
        systemRoles: roles.filter(r => r.is_system).length,
        totalAssignments: roles.reduce((sum, r) => sum + (r.total_users || 0), 0),
        activeAssignments: roles.reduce((sum, r) => sum + (r.active_users || 0), 0),
        totalPermissions: roles.reduce((sum, r) => sum + (r.permissions?.length || 0), 0)
      }
    }
  }

  return (
    <RolesClient
      initialRoles={roles}
      initialStats={stats}
    />
  )
}
