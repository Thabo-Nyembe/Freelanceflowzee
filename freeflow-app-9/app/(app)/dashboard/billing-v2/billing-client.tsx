'use client'
import { useState } from 'react'
import { useBilling, type BillingTransaction, type BillingStatus } from '@/lib/hooks/use-billing'

export default function BillingClient({ initialBilling }: { initialBilling: BillingTransaction[] }) {
  const [statusFilter, setStatusFilter] = useState<BillingStatus | 'all'>('all')
  const { transactions, loading, error } = useBilling({ status: statusFilter })
  const display = transactions.length > 0 ? transactions : initialBilling

  if (error) return <div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Billing</h1>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
          <option value="all">All</option><option value="succeeded">Succeeded</option><option value="pending">Pending</option><option value="failed">Failed</option>
        </select>
        {loading && <div className="text-center py-8"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div></div>}
        <div className="space-y-4">{display.filter(t => statusFilter === 'all' || t.status === statusFilter).map(transaction => (
          <div key={transaction.id} className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">{transaction.transaction_type}</p>
                <p className="text-sm text-gray-600">{transaction.description}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs mt-2 ${transaction.status === 'succeeded' ? 'bg-green-100 text-green-700' : transaction.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{transaction.status}</span>
              </div>
              <div className="text-right"><div className="text-2xl font-bold">${transaction.amount.toFixed(2)}</div><div className="text-sm text-gray-500">{transaction.payment_method}</div></div>
            </div>
          </div>
        ))}</div>
      </div>
    </div>
  )
}
