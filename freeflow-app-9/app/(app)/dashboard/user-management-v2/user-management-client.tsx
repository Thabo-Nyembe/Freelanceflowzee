'use client'
import { useState } from 'react'
import { useUserManagement, type ManagedUser, type UserRole, type UserStatus } from '@/lib/hooks/use-user-management'

export default function UserManagementClient({ initialUsers }: { initialUsers: ManagedUser[] }) {
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all')
  const { users, loading, error } = useUserManagement({ role: roleFilter, status: statusFilter })
  const displayUsers = users.length > 0 ? users : initialUsers

  const stats = {
    total: displayUsers.length,
    active: displayUsers.filter(u => u.status === 'active').length,
    admins: displayUsers.filter(u => u.role === 'admin' || u.role === 'superadmin').length,
    suspended: displayUsers.filter(u => u.status === 'suspended').length
  }

  if (error) return <div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">User Management</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Total Users</div><div className="text-3xl font-bold text-blue-600">{stats.total}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Active</div><div className="text-3xl font-bold text-green-600">{stats.active}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Admins</div><div className="text-3xl font-bold text-purple-600">{stats.admins}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Suspended</div><div className="text-3xl font-bold text-red-600">{stats.suspended}</div></div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border space-y-4">
          <div className="flex gap-4">
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Roles</option><option value="admin">Admin</option><option value="manager">Manager</option><option value="user">User</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {loading && <div className="text-center py-8"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div></div>}

        <div className="space-y-4">{displayUsers.filter(u => (roleFilter === 'all' || u.role === roleFilter) && (statusFilter === 'all' || u.status === statusFilter)).map(user => (
          <div key={user.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.status === 'active' ? 'bg-green-100 text-green-700' : user.status === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{user.status}</span>
                  <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">{user.role}</span>
                  {user.email_verified && <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">Verified</span>}
                </div>
                <h3 className="text-lg font-semibold">{user.full_name || user.display_name || user.email}</h3>
                <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                {user.department && <p className="text-sm text-gray-600">{user.department} {user.job_title && `• ${user.job_title}`}</p>}
              </div>
              <div className="text-right">
                {user.last_login_at && <div className="text-xs text-gray-500">Last login: {new Date(user.last_login_at).toLocaleDateString()}</div>}
                <div className="text-xs text-gray-500 mt-1">Logins: {user.login_count}</div>
              </div>
            </div>
          </div>
        ))}</div>
      </div>
    </div>
  )
}
