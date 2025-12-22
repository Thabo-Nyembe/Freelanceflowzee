'use client'

import { useState } from 'react'
import { useRoles, usePermissions, useRoleAssignments, type Role, type Permission, type RoleLevel } from '@/lib/hooks/use-permissions'
import { BentoCard, BentoQuickAction } from '@/components/ui/bento-grid-advanced'
import { StatGrid, MiniKPI, ActivityFeed } from '@/components/ui/results-display'
import { ModernButton, GradientButton, PillButton } from '@/components/ui/modern-buttons'
import {
  Lock,
  Shield,
  Users,
  Key,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash,
  Settings,
  UserCheck,
  Crown,
  Award,
  Plus
} from 'lucide-react'

interface PermissionsClientProps {
  initialRoles: Role[]
  initialPermissions: Permission[]
}

export default function PermissionsClient({ initialRoles, initialPermissions }: PermissionsClientProps) {
  const [selectedTab, setSelectedTab] = useState<'roles' | 'permissions' | 'users'>('roles')
  const { roles, loading: rolesLoading } = useRoles()
  const { permissions, loading: permissionsLoading } = usePermissions()
  const { roleAssignments } = useRoleAssignments()

  const displayRoles = roles.length > 0 ? roles : initialRoles
  const displayPermissions = permissions.length > 0 ? permissions : initialPermissions

  const totalAssignments = roleAssignments.filter(a => a.status === 'active').length

  const stats = [
    { label: 'Total Roles', value: displayRoles.length.toString(), change: 15.3, icon: <Crown className="w-5 h-5" /> },
    { label: 'Permissions', value: displayPermissions.length.toString(), change: 28.4, icon: <Key className="w-5 h-5" /> },
    { label: 'Assignments', value: totalAssignments.toString(), change: 42.1, icon: <Users className="w-5 h-5" /> },
    { label: 'Access Violations', value: '0', change: -100, icon: <Shield className="w-5 h-5" /> }
  ]

  const recentActivity = roleAssignments.slice(0, 4).map(a => ({
    icon: <UserCheck className="w-5 h-5" />,
    title: a.status === 'active' ? 'Role assigned' : 'Role revoked',
    description: a.assigned_user_email || 'Unknown user',
    time: new Date(a.created_at).toLocaleDateString(),
    status: (a.status === 'active' ? 'success' : 'warning') as const
  }))

  const getLevelColor = (level: RoleLevel) => {
    switch (level) {
      case 'system': return 'bg-red-100 text-red-700'
      case 'admin': return 'bg-orange-100 text-orange-700'
      case 'manager': return 'bg-yellow-100 text-yellow-700'
      case 'standard': return 'bg-blue-100 text-blue-700'
      case 'basic': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getRoleColor = (index: number) => {
    const colors = [
      'from-red-500 to-orange-500',
      'from-orange-500 to-amber-500',
      'from-yellow-500 to-amber-500',
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-green-500 to-emerald-500',
      'from-gray-500 to-slate-500'
    ]
    return colors[index % colors.length]
  }

  const maxUsers = Math.max(...displayRoles.map(r => r.current_users), 1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50/30 to-blue-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Lock className="w-10 h-10 text-purple-600" />
              Roles & Permissions
            </h1>
            <p className="text-muted-foreground">Manage access control and user permissions</p>
          </div>
          <GradientButton from="purple" to="indigo" onClick={() => console.log('New role')}>
            <Plus className="w-5 h-5 mr-2" />
            Create Role
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Crown />} title="Roles" description="Manage roles" onClick={() => setSelectedTab('roles')} />
          <BentoQuickAction icon={<Key />} title="Permissions" description="Access rights" onClick={() => setSelectedTab('permissions')} />
          <BentoQuickAction icon={<Users />} title="Users" description="Assignments" onClick={() => setSelectedTab('users')} />
          <BentoQuickAction icon={<Settings />} title="Settings" description="Configure RBAC" onClick={() => console.log('Settings')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedTab === 'roles' ? 'primary' : 'ghost'} onClick={() => setSelectedTab('roles')}>
            <Crown className="w-4 h-4 mr-2" />Roles
          </PillButton>
          <PillButton variant={selectedTab === 'permissions' ? 'primary' : 'ghost'} onClick={() => setSelectedTab('permissions')}>
            <Key className="w-4 h-4 mr-2" />Permissions
          </PillButton>
          <PillButton variant={selectedTab === 'users' ? 'primary' : 'ghost'} onClick={() => setSelectedTab('users')}>
            <Users className="w-4 h-4 mr-2" />User Assignments
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">System Roles</h3>
              <div className="space-y-3">
                {displayRoles.map((role, index) => {
                  const userPercent = maxUsers > 0 ? (role.current_users / maxUsers) * 100 : 0

                  return (
                    <div key={role.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getRoleColor(index)} flex items-center justify-center text-white`}>
                                <Crown className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-semibold">{role.display_name || role.role_name}</h4>
                                <span className={`text-xs px-2 py-1 rounded-md ${getLevelColor(role.role_level)}`}>
                                  {role.role_level}
                                </span>
                              </div>
                            </div>
                            {role.description && (
                              <p className="text-sm text-muted-foreground mb-2">{role.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-purple-600">{role.current_users}</p>
                            <p className="text-xs text-muted-foreground">users</p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">User Distribution</span>
                            <span className="font-semibold">{userPercent.toFixed(0)}%</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full bg-gradient-to-r ${getRoleColor(index)}`} style={{ width: `${userPercent}%` }} />
                          </div>
                        </div>

                        <div className="pt-2 border-t">
                          <p className="text-xs font-semibold mb-2">Permissions ({role.permissions?.length || 0}):</p>
                          <div className="flex flex-wrap gap-1">
                            {(role.permissions || []).slice(0, 5).map((permission, i) => (
                              <span key={i} className="text-xs px-2 py-1 rounded-md bg-muted font-mono">{permission}</span>
                            ))}
                            {(role.permissions?.length || 0) > 5 && (
                              <span className="text-xs px-2 py-1 rounded-md bg-muted">+{role.permissions!.length - 5} more</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t">
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('View', role.id)}>
                            <Eye className="w-3 h-3 mr-1" />View
                          </ModernButton>
                          {role.is_editable && (
                            <>
                              <ModernButton variant="outline" size="sm" onClick={() => console.log('Edit', role.id)}>
                                <Edit className="w-3 h-3 mr-1" />Edit
                              </ModernButton>
                              {role.is_deletable && (
                                <ModernButton variant="outline" size="sm" onClick={() => console.log('Delete', role.id)}>
                                  <Trash className="w-3 h-3 mr-1" />Delete
                                </ModernButton>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}

                {displayRoles.length === 0 && (
                  <div className="text-center py-12">
                    <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Roles</h3>
                    <p className="text-muted-foreground">Create your first role to get started</p>
                  </div>
                )}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Permission Definitions</h3>
              <div className="space-y-3">
                {displayPermissions.slice(0, 10).map((permission) => (
                  <div key={permission.id} className="p-4 rounded-lg border border-border bg-background">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{permission.permission_name}</h4>
                        {permission.description && (
                          <p className="text-sm text-muted-foreground">{permission.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {(permission.actions || []).map((action) => (
                        <span key={action} className="text-xs px-2 py-1 rounded-md bg-muted">{action}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span>Resource: <strong>{permission.resource}</strong></span>
                      {permission.assigned_roles && permission.assigned_roles.length > 0 && (
                        <>
                          <span className="mx-2">•</span>
                          <span>Roles: {permission.assigned_roles.join(', ')}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {displayPermissions.length === 0 && (
                  <div className="text-center py-8">
                    <Key className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-muted-foreground">No permissions defined</p>
                  </div>
                )}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <ActivityFeed title="Recent Activity" activities={recentActivity.length > 0 ? recentActivity : [
              { icon: <CheckCircle className="w-5 h-5" />, title: 'No recent activity', description: 'Role changes will appear here', time: 'Now', status: 'info' as const }
            ]} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Permission Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Total Roles" value={displayRoles.length.toString()} change={15.3} />
                <MiniKPI label="Permissions" value={displayPermissions.length.toString()} change={28.4} />
                <MiniKPI label="Assignments" value={totalAssignments.toString()} change={42.1} />
                <MiniKPI label="System Roles" value={displayRoles.filter(r => r.role_level === 'system').length.toString()} change={0} />
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('Assign')}>
                  <UserCheck className="w-4 h-4 mr-2" />Assign Role
                </ModernButton>
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('Audit')}>
                  <Shield className="w-4 h-4 mr-2" />View Audit Log
                </ModernButton>
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('Export')}>
                  <Key className="w-4 h-4 mr-2" />Export Permissions
                </ModernButton>
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Role Hierarchy</h3>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-red-50 border-l-4 border-red-500">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-red-600" />
                    <span className="font-semibold text-sm">System</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Full system control</p>
                </div>
                <div className="p-3 rounded-lg bg-orange-50 border-l-4 border-orange-500">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-orange-600" />
                    <span className="font-semibold text-sm">Admin</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Administrative access</p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-50 border-l-4 border-yellow-500">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-yellow-600" />
                    <span className="font-semibold text-sm">Manager</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Team oversight</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50 border-l-4 border-blue-500">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-sm">Standard</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Regular user access</p>
                </div>
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
