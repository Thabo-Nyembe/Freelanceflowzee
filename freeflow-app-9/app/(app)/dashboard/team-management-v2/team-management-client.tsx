'use client'
import { useState } from 'react'
import { useTeamManagement, type Team, type TeamType, type TeamStatus } from '@/lib/hooks/use-team-management'

export default function TeamManagementClient({ initialTeams }: { initialTeams: Team[] }) {
  const [typeFilter, setTypeFilter] = useState<TeamType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<TeamStatus | 'all'>('all')
  const { teams, loading, error } = useTeamManagement({ teamType: typeFilter, status: statusFilter })
  const displayTeams = teams.length > 0 ? teams : initialTeams

  const stats = {
    total: displayTeams.length,
    active: displayTeams.filter(t => t.status === 'active').length,
    totalMembers: displayTeams.reduce((sum, t) => sum + t.member_count, 0),
    avgSize: displayTeams.length > 0 ? (displayTeams.reduce((sum, t) => sum + t.member_count, 0) / displayTeams.length).toFixed(1) : '0'
  }

  if (error) return <div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Team Management</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Total Teams</div><div className="text-3xl font-bold text-purple-600">{stats.total}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Active</div><div className="text-3xl font-bold text-green-600">{stats.active}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Total Members</div><div className="text-3xl font-bold text-blue-600">{stats.totalMembers}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Avg Size</div><div className="text-3xl font-bold text-pink-600">{stats.avgSize}</div></div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border space-y-4">
          <div className="flex gap-4">
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Types</option><option value="department">Department</option><option value="project">Project</option><option value="cross_functional">Cross-Functional</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="forming">Forming</option>
            </select>
          </div>
        </div>

        {loading && <div className="text-center py-8"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div></div>}

        <div className="space-y-4">{displayTeams.filter(t => (typeFilter === 'all' || t.team_type === typeFilter) && (statusFilter === 'all' || t.status === statusFilter)).map(team => (
          <div key={team.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs ${team.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{team.status}</span>
                  <span className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700">{team.team_type}</span>
                  <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">{team.visibility}</span>
                </div>
                <h3 className="text-lg font-semibold">{team.team_name}</h3>
                {team.description && <p className="text-sm text-gray-600 mt-1">{team.description}</p>}
                {team.department && <p className="text-sm text-gray-600 mt-1">{team.department}</p>}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">{team.member_count}</div>
                <div className="text-xs text-gray-500">members</div>
                {team.health_score && <div className="text-xs text-gray-600 mt-1">Health: {team.health_score.toFixed(0)}%</div>}
              </div>
            </div>
          </div>
        ))}</div>
      </div>
    </div>
  )
}
