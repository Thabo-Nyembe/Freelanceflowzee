'use client'
import { useState } from 'react'
import { useTransactions, type Transaction, type TransactionType, type TransactionStatus } from '@/lib/hooks/use-transactions'

export default function TransactionsClient({ initialTransactions }: { initialTransactions: Transaction[] }) {
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>('all')
  const { transactions, loading, error } = useTransactions({ transactionType: typeFilter, status: statusFilter })
  const displayTransactions = transactions.length > 0 ? transactions : initialTransactions

  const stats = {
    totalIncome: displayTransactions.filter(t => t.transaction_type === 'payment' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0),
    totalExpenses: displayTransactions.filter(t => ['refund', 'fee', 'charge'].includes(t.transaction_type) && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0),
    pending: displayTransactions.filter(t => t.status === 'pending').length,
    completed: displayTransactions.filter(t => t.status === 'completed').length
  }

  if (error) return <div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Transactions</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Income</div><div className="text-3xl font-bold text-green-600">${stats.totalIncome.toFixed(2)}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Expenses</div><div className="text-3xl font-bold text-red-600">${stats.totalExpenses.toFixed(2)}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Pending</div><div className="text-3xl font-bold text-yellow-600">{stats.pending}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Completed</div><div className="text-3xl font-bold text-blue-600">{stats.completed}</div></div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border space-y-4">
          <div className="flex gap-4">
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Types</option><option value="payment">Payment</option><option value="refund">Refund</option><option value="transfer">Transfer</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Status</option><option value="pending">Pending</option><option value="completed">Completed</option><option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {loading && <div className="text-center py-8"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div></div>}

        <div className="space-y-4">{displayTransactions.filter(t => (typeFilter === 'all' || t.transaction_type === typeFilter) && (statusFilter === 'all' || t.status === statusFilter)).map(transaction => (
          <div key={transaction.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{transaction.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{transaction.transaction_number} • {transaction.transaction_type}</p>
                <p className="text-sm text-gray-600">{new Date(transaction.transaction_date).toLocaleDateString()}</p>
                <div className="flex gap-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs ${transaction.status === 'completed' ? 'bg-green-100 text-green-700' : transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{transaction.status}</span>
                  <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700">{transaction.payment_method}</span>
                </div>
              </div>
              <div className="text-right"><div className="text-2xl font-bold text-emerald-600">${transaction.amount.toFixed(2)}</div><div className="text-sm text-gray-500">{transaction.currency}</div></div>
            </div>
          </div>
        ))}</div>
      </div>
    </div>
  )
}
