"use client"

import { useState } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  MiniKPI,
  ActivityFeed
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
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
  UserX,
  Crown,
  Award,
  Plus
} from 'lucide-react'

/**
 * Permissions V2 - Groundbreaking Roles & Permissions Management
 * Showcases RBAC, permission matrices, and access control
 */
export default function PermissionsV2() {
  const [selectedTab, setSelectedTab] = useState<'roles' | 'permissions' | 'users'>('roles')

  const stats = [
    { label: 'Total Roles', value: '24', change: 15.3, icon: <Crown className="w-5 h-5" /> },
    { label: 'Custom Permissions', value: '147', change: 28.4, icon: <Key className="w-5 h-5" /> },
    { label: 'Assigned Users', value: '8,947', change: 42.1, icon: <Users className="w-5 h-5" /> },
    { label: 'Access Violations', value: '12', change: -35.2, icon: <Shield className="w-5 h-5" /> }
  ]

  const roles = [
    {
      id: '1',
      name: 'Super Administrator',
      description: 'Full system access with all permissions',
      users: 8,
      permissions: ['*'],
      color: 'from-red-500 to-orange-500',
      level: 'system',
      editable: false
    },
    {
      id: '2',
      name: 'Administrator',
      description: 'Admin access with most permissions',
      users: 24,
      permissions: ['users.*', 'roles.*', 'settings.*', 'reports.read', 'audit.read'],
      color: 'from-orange-500 to-amber-500',
      level: 'admin',
      editable: true
    },
    {
      id: '3',
      name: 'Manager',
      description: 'Team management and oversight',
      users: 147,
      permissions: ['users.read', 'teams.*', 'projects.read', 'projects.write', 'reports.read'],
      color: 'from-yellow-500 to-amber-500',
      level: 'manager',
      editable: true
    },
    {
      id: '4',
      name: 'Developer',
      description: 'Development and code access',
      users: 456,
      permissions: ['code.*', 'deployments.*', 'logs.read', 'api.*'],
      color: 'from-blue-500 to-cyan-500',
      level: 'standard',
      editable: true
    },
    {
      id: '5',
      name: 'Content Editor',
      description: 'Content creation and editing',
      users: 892,
      permissions: ['content.*', 'media.read', 'media.write', 'publish.*'],
      color: 'from-purple-500 to-pink-500',
      level: 'standard',
      editable: true
    },
    {
      id: '6',
      name: 'Viewer',
      description: 'Read-only access',
      users: 2847,
      permissions: ['*.read'],
      color: 'from-gray-500 to-slate-500',
      level: 'basic',
      editable: true
    },
    {
      id: '7',
      name: 'Support Agent',
      description: 'Customer support access',
      users: 234,
      permissions: ['tickets.*', 'customers.read', 'chat.*', 'knowledge_base.*'],
      color: 'from-green-500 to-emerald-500',
      level: 'standard',
      editable: true
    }
  ]

  const permissions = [
    {
      id: '1',
      resource: 'users',
      actions: ['create', 'read', 'update', 'delete'],
      description: 'User account management',
      roles: ['Super Administrator', 'Administrator']
    },
    {
      id: '2',
      resource: 'roles',
      actions: ['create', 'read', 'update', 'delete'],
      description: 'Role and permission management',
      roles: ['Super Administrator', 'Administrator']
    },
    {
      id: '3',
      resource: 'projects',
      actions: ['create', 'read', 'update', 'delete'],
      description: 'Project management',
      roles: ['Super Administrator', 'Administrator', 'Manager', 'Developer']
    },
    {
      id: '4',
      resource: 'content',
      actions: ['create', 'read', 'update', 'delete', 'publish'],
      description: 'Content and media management',
      roles: ['Super Administrator', 'Administrator', 'Content Editor']
    },
    {
      id: '5',
      resource: 'api',
      actions: ['read', 'write'],
      description: 'API access and keys',
      roles: ['Super Administrator', 'Developer']
    },
    {
      id: '6',
      resource: 'tickets',
      actions: ['create', 'read', 'update', 'close'],
      description: 'Support ticket management',
      roles: ['Super Administrator', 'Administrator', 'Support Agent']
    }
  ]

  const permissionMatrix = [
    {
      resource: 'Users',
      superAdmin: true,
      admin: true,
      manager: false,
      developer: false,
      editor: false,
      viewer: false
    },
    {
      resource: 'Projects',
      superAdmin: true,
      admin: true,
      manager: true,
      developer: true,
      editor: false,
      viewer: false
    },
    {
      resource: 'Content',
      superAdmin: true,
      admin: true,
      manager: false,
      developer: false,
      editor: true,
      viewer: false
    },
    {
      resource: 'Reports',
      superAdmin: true,
      admin: true,
      manager: true,
      developer: false,
      editor: false,
      viewer: false
    },
    {
      resource: 'Settings',
      superAdmin: true,
      admin: true,
      manager: false,
      developer: false,
      editor: false,
      viewer: false
    }
  ]

  const recentActivity = [
    { icon: <UserCheck className="w-5 h-5" />, title: 'Role assigned', description: 'user@example.com added to Administrator', time: '5 minutes ago', status: 'success' as const },
    { icon: <Shield className="w-5 h-5" />, title: 'Permission updated', description: 'Developer role granted API access', time: '1 hour ago', status: 'info' as const },
    { icon: <UserX className="w-5 h-5" />, title: 'Access revoked', description: 'Former employee removed from system', time: '2 hours ago', status: 'warning' as const },
    { icon: <Key className="w-5 h-5" />, title: 'Custom role created', description: 'Marketing Manager role added', time: '1 day ago', status: 'success' as const }
  ]

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'system': return 'bg-red-100 text-red-700'
      case 'admin': return 'bg-orange-100 text-orange-700'
      case 'manager': return 'bg-yellow-100 text-yellow-700'
      case 'standard': return 'bg-blue-100 text-blue-700'
      case 'basic': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const maxUsers = Math.max(...roles.map(r => r.users))

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50/30 to-blue-50/40 p-6">
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
          <BentoQuickAction icon={<Crown />} title="Roles" description="Manage roles" onClick={() => console.log('Roles')} />
          <BentoQuickAction icon={<Key />} title="Permissions" description="Access rights" onClick={() => console.log('Permissions')} />
          <BentoQuickAction icon={<Users />} title="Users" description="Assignments" onClick={() => console.log('Users')} />
          <BentoQuickAction icon={<Settings />} title="Settings" description="Configure RBAC" onClick={() => console.log('Settings')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedTab === 'roles' ? 'primary' : 'ghost'} onClick={() => setSelectedTab('roles')}>
            <Crown className="w-4 h-4 mr-2" />
            Roles
          </PillButton>
          <PillButton variant={selectedTab === 'permissions' ? 'primary' : 'ghost'} onClick={() => setSelectedTab('permissions')}>
            <Key className="w-4 h-4 mr-2" />
            Permissions
          </PillButton>
          <PillButton variant={selectedTab === 'users' ? 'primary' : 'ghost'} onClick={() => setSelectedTab('users')}>
            <Users className="w-4 h-4 mr-2" />
            User Assignments
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">System Roles</h3>
              <div className="space-y-3">
                {roles.map((role) => {
                  const userPercent = (role.users / maxUsers) * 100

                  return (
                    <div key={role.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${role.color} flex items-center justify-center text-white`}>
                                <Crown className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-semibold">{role.name}</h4>
                                <span className={`text-xs px-2 py-1 rounded-md ${getLevelColor(role.level)}`}>
                                  {role.level}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{role.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-purple-600">{role.users}</p>
                            <p className="text-xs text-muted-foreground">users</p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">User Distribution</span>
                            <span className="font-semibold">{userPercent.toFixed(0)}%</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${role.color}`}
                              style={{ width: `${userPercent}%` }}
                            />
                          </div>
                        </div>

                        <div className="pt-2 border-t">
                          <p className="text-xs font-semibold mb-2">Permissions ({role.permissions.length}):</p>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.slice(0, 5).map((permission, index) => (
                              <span key={index} className="text-xs px-2 py-1 rounded-md bg-muted font-mono">
                                {permission}
                              </span>
                            ))}
                            {role.permissions.length > 5 && (
                              <span className="text-xs px-2 py-1 rounded-md bg-muted">
                                +{role.permissions.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t">
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('View', role.id)}>
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </ModernButton>
                          {role.editable && (
                            <>
                              <ModernButton variant="outline" size="sm" onClick={() => console.log('Edit', role.id)}>
                                <Edit className="w-3 h-3 mr-1" />
                                Edit
                              </ModernButton>
                              <ModernButton variant="outline" size="sm" onClick={() => console.log('Delete', role.id)}>
                                <Trash className="w-3 h-3 mr-1" />
                                Delete
                              </ModernButton>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </BentoCard>

            <BentoCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Permission Matrix</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 font-semibold">Resource</th>
                      <th className="text-center py-2 px-3 font-semibold">Super Admin</th>
                      <th className="text-center py-2 px-3 font-semibold">Admin</th>
                      <th className="text-center py-2 px-3 font-semibold">Manager</th>
                      <th className="text-center py-2 px-3 font-semibold">Developer</th>
                      <th className="text-center py-2 px-3 font-semibold">Editor</th>
                      <th className="text-center py-2 px-3 font-semibold">Viewer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissionMatrix.map((row, index) => (
                      <tr key={index} className="border-b hover:bg-muted/30">
                        <td className="py-3 px-3 font-medium">{row.resource}</td>
                        <td className="text-center py-3 px-3">
                          {row.superAdmin ? <CheckCircle className="w-5 h-5 text-green-600 inline" /> : <XCircle className="w-5 h-5 text-gray-300 inline" />}
                        </td>
                        <td className="text-center py-3 px-3">
                          {row.admin ? <CheckCircle className="w-5 h-5 text-green-600 inline" /> : <XCircle className="w-5 h-5 text-gray-300 inline" />}
                        </td>
                        <td className="text-center py-3 px-3">
                          {row.manager ? <CheckCircle className="w-5 h-5 text-green-600 inline" /> : <XCircle className="w-5 h-5 text-gray-300 inline" />}
                        </td>
                        <td className="text-center py-3 px-3">
                          {row.developer ? <CheckCircle className="w-5 h-5 text-green-600 inline" /> : <XCircle className="w-5 h-5 text-gray-300 inline" />}
                        </td>
                        <td className="text-center py-3 px-3">
                          {row.editor ? <CheckCircle className="w-5 h-5 text-green-600 inline" /> : <XCircle className="w-5 h-5 text-gray-300 inline" />}
                        </td>
                        <td className="text-center py-3 px-3">
                          {row.viewer ? <CheckCircle className="w-5 h-5 text-green-600 inline" /> : <XCircle className="w-5 h-5 text-gray-300 inline" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Permission Definitions</h3>
              <div className="space-y-3">
                {permissions.map((permission) => (
                  <div key={permission.id} className="p-4 rounded-lg border border-border bg-background">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{permission.resource}</h4>
                        <p className="text-sm text-muted-foreground">{permission.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      {permission.actions.map((action) => (
                        <span key={action} className="text-xs px-2 py-1 rounded-md bg-muted">
                          {action}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span>Granted to:</span>
                      {permission.roles.map((role, index) => (
                        <span key={index}>
                          {role}{index < permission.roles.length - 1 ? ',' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Permission Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Total Roles" value="24" change={15.3} />
                <MiniKPI label="Custom Permissions" value="147" change={28.4} />
                <MiniKPI label="Role Assignments" value="8,947" change={42.1} />
                <MiniKPI label="Access Denials" value="12" change={-35.2} />
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('Assign')}>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Assign Role
                </ModernButton>
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('Audit')}>
                  <Shield className="w-4 h-4 mr-2" />
                  View Audit Log
                </ModernButton>
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('Export')}>
                  <Key className="w-4 h-4 mr-2" />
                  Export Permissions
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
