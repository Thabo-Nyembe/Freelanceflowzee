'use client'
import { useState } from 'react'
import { useContracts, type Contract, type ContractStatus } from '@/lib/hooks/use-contracts'

export default function ContractsClient({ initialContracts }: { initialContracts: Contract[] }) {
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'all'>('all')
  const { contracts, loading, error } = useContracts({ status: statusFilter })
  const display = contracts.length > 0 ? contracts : initialContracts

  if (error) return <div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Contracts</h1>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
          <option value="all">All</option><option value="draft">Draft</option><option value="active">Active</option><option value="completed">Completed</option>
        </select>
        {loading && <div className="text-center py-8"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div></div>}
        <div className="space-y-4">{display.filter(c => statusFilter === 'all' || c.status === statusFilter).map(contract => (
          <div key={contract.id} className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold">{contract.title}</h3>
            <p className="text-sm text-gray-600">#{contract.contract_number} • {contract.contract_type}</p>
            <div className="flex gap-2 mt-2">
              <span className={`px-3 py-1 rounded-full text-xs ${contract.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{contract.status}</span>
            </div>
          </div>
        ))}</div>
      </div>
    </div>
  )
}
