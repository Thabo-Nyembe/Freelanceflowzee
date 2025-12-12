"use client"

import { useState } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  ActivityFeed,
  MiniKPI
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  Users,
  Plus,
  Search,
  Mail,
  Shield,
  UserCheck,
  UserX,
  Settings,
  Crown,
  Key,
  Ban,
  CheckCircle
} from 'lucide-react'

/**
 * User Management V2 - Groundbreaking User Administration
 * Showcases user management with modern components
 */
export default function UserManagementV2() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'admins' | 'pending'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const stats = [
    { label: 'Total Users', value: '1,284', change: 12.5, icon: <Users className="w-5 h-5" /> },
    { label: 'Active Today', value: '847', change: 8.3, icon: <UserCheck className="w-5 h-5" /> },
    { label: 'Admins', value: '12', change: 0, icon: <Crown className="w-5 h-5" /> },
    { label: 'Pending', value: '34', change: -15.2, icon: <Shield className="w-5 h-5" /> }
  ]

  const users = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      role: 'Admin',
      status: 'active',
      lastActive: '2 hours ago',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SJ'
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael@example.com',
      role: 'User',
      status: 'active',
      lastActive: '5 minutes ago',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=MC'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      email: 'emily@example.com',
      role: 'Editor',
      status: 'active',
      lastActive: '1 day ago',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=ER'
    },
    {
      id: '4',
      name: 'David Kim',
      email: 'david@example.com',
      role: 'User',
      status: 'pending',
      lastActive: 'Never',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=DK'
    }
  ]

  const recentActivity = [
    { icon: <Plus className="w-5 h-5" />, title: 'New user registered', description: 'David Kim joined the platform', time: '1 hour ago', status: 'info' as const },
    { icon: <Shield className="w-5 h-5" />, title: 'Role updated', description: 'Emily Rodriguez promoted to Editor', time: '3 hours ago', status: 'success' as const },
    { icon: <Ban className="w-5 h-5" />, title: 'User suspended', description: 'Suspicious activity detected', time: '1 day ago', status: 'warning' as const },
    { icon: <CheckCircle className="w-5 h-5" />, title: 'Account verified', description: 'Sarah Johnson email verified', time: '2 days ago', status: 'success' as const }
  ]

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-purple-100 text-purple-700'
      case 'Editor': return 'bg-blue-100 text-blue-700'
      case 'User': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'suspended': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Users className="w-10 h-10 text-blue-600" />
              User Management
            </h1>
            <p className="text-muted-foreground">Manage users, roles, and permissions</p>
          </div>
          <GradientButton from="blue" to="indigo" onClick={() => console.log('Add user')}>
            <Plus className="w-5 h-5 mr-2" />
            Add User
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Plus />} title="Add User" description="New account" onClick={() => console.log('Add')} />
          <BentoQuickAction icon={<Mail />} title="Invite Users" description="Bulk invite" onClick={() => console.log('Invite')} />
          <BentoQuickAction icon={<Shield />} title="Roles" description="Manage" onClick={() => console.log('Roles')} />
          <BentoQuickAction icon={<Key />} title="Permissions" description="Configure" onClick={() => console.log('Permissions')} />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <PillButton variant={selectedFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('all')}>All</PillButton>
            <PillButton variant={selectedFilter === 'active' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('active')}>Active</PillButton>
            <PillButton variant={selectedFilter === 'admins' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('admins')}>Admins</PillButton>
            <PillButton variant={selectedFilter === 'pending' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('pending')}>Pending</PillButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Users</h3>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{user.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded-md ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(user.status)}`}>
                            {user.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{user.email}</p>
                        <p className="text-xs text-muted-foreground">Last active: {user.lastActive}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <ModernButton variant="outline" size="sm" onClick={() => console.log('Edit', user.id)}>
                          <Settings className="w-3 h-3 mr-1" />
                          Edit
                        </ModernButton>
                        {user.status === 'pending' && (
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('Approve', user.id)}>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approve
                          </ModernButton>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Role Distribution</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium">Admins</span>
                    </div>
                    <span className="text-sm font-bold">12</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: '1%' }} />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">Editors</span>
                    </div>
                    <span className="text-sm font-bold">87</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: '7%' }} />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium">Users</span>
                    </div>
                    <span className="text-sm font-bold">1,185</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gray-500" style={{ width: '92%' }} />
                  </div>
                </div>
              </div>
            </BentoCard>

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Daily Active Users" value="847" change={12.5} />
                <MiniKPI label="New This Week" value="124" change={25.3} />
                <MiniKPI label="Retention Rate" value="94%" change={5.7} />
                <MiniKPI label="Avg Session Time" value="24min" change={8.3} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
