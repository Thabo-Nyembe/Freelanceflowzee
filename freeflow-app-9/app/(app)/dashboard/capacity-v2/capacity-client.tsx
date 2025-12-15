'use client'
import { useState } from 'react'
import { useCapacity, type Capacity, type ResourceType, type CapacityStatus } from '@/lib/hooks/use-capacity'

export default function CapacityClient({ initialCapacity }: { initialCapacity: Capacity[] }) {
  const [resourceTypeFilter, setResourceTypeFilter] = useState<ResourceType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<CapacityStatus | 'all'>('all')
  const { capacity, loading, error } = useCapacity({ resourceType: resourceTypeFilter, status: statusFilter })
  const displayCapacity = capacity.length > 0 ? capacity : initialCapacity

  const stats = {
    total: displayCapacity.length,
    active: displayCapacity.filter(c => c.status === 'active').length,
    avgUtilization: displayCapacity.length > 0 ? (displayCapacity.reduce((sum, c) => sum + c.utilization_percentage, 0) / displayCapacity.length).toFixed(1) : '0',
    overallocated: displayCapacity.filter(c => c.is_overallocated).length
  }

  if (error) return <div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Capacity Planning</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Total Resources</div><div className="text-3xl font-bold text-indigo-600">{stats.total}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Active</div><div className="text-3xl font-bold text-green-600">{stats.active}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Avg Utilization</div><div className="text-3xl font-bold text-blue-600">{stats.avgUtilization}%</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Overallocated</div><div className="text-3xl font-bold text-red-600">{stats.overallocated}</div></div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border space-y-4">
          <div className="flex gap-4">
            <select value={resourceTypeFilter} onChange={(e) => setResourceTypeFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Types</option><option value="team_member">Team Member</option><option value="equipment">Equipment</option><option value="room">Room</option><option value="vehicle">Vehicle</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        {loading && <div className="text-center py-8"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div></div>}

        <div className="space-y-4">{displayCapacity.filter(c => (resourceTypeFilter === 'all' || c.resource_type === resourceTypeFilter) && (statusFilter === 'all' || c.status === statusFilter)).map(resource => (
          <div key={resource.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs ${resource.status === 'active' ? 'bg-green-100 text-green-700' : resource.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{resource.status}</span>
                  <span className="px-3 py-1 rounded-full text-xs bg-indigo-100 text-indigo-700">{resource.resource_type}</span>
                  <span className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700">{resource.availability_status}</span>
                  {resource.is_overallocated && <span className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-700">Overallocated</span>}
                </div>
                <h3 className="text-lg font-semibold">{resource.resource_name}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                  <span>📊 {resource.utilization_percentage}% utilized</span>
                  <span>✅ {resource.available_capacity.toFixed(1)}/{resource.total_capacity.toFixed(1)} available</span>
                  <span>⏰ {resource.working_hours_per_day}h/day</span>
                  {resource.cost_per_hour && <span>💰 ${resource.cost_per_hour}/hr</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-indigo-600">{resource.utilization_percentage}%</div>
                <div className="text-xs text-gray-500">utilization</div>
                {resource.efficiency_score && <div className="text-xs text-gray-600 mt-1">⚡ {resource.efficiency_score}% efficiency</div>}
              </div>
            </div>
          </div>
        ))}</div>
      </div>
    </div>
  )
}
