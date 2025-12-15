'use client'
import { useState } from 'react'
import { useFinancial, type FinancialRecord, type FinancialRecordType, type FinancialStatus } from '@/lib/hooks/use-financial'

export default function FinancialClient({ initialFinancial }: { initialFinancial: FinancialRecord[] }) {
  const [recordTypeFilter, setRecordTypeFilter] = useState<FinancialRecordType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<FinancialStatus | 'all'>('all')
  const { records, loading, error } = useFinancial({ recordType: recordTypeFilter, status: statusFilter })
  const displayRecords = records.length > 0 ? records : initialFinancial

  const stats = {
    totalRevenue: displayRecords.filter(r => r.record_type === 'revenue' && r.status === 'completed').reduce((sum, r) => sum + r.amount, 0),
    totalExpenses: displayRecords.filter(r => r.record_type === 'expense' && r.status === 'completed').reduce((sum, r) => sum + r.amount, 0),
    pending: displayRecords.filter(r => r.status === 'pending').length,
    approved: displayRecords.filter(r => r.status === 'approved').length
  }
  const netProfit = stats.totalRevenue - stats.totalExpenses

  if (error) return <div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Financial Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Revenue</div><div className="text-3xl font-bold text-green-600">${stats.totalRevenue.toFixed(2)}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Expenses</div><div className="text-3xl font-bold text-red-600">${stats.totalExpenses.toFixed(2)}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Net Profit</div><div className="text-3xl font-bold text-emerald-600">${netProfit.toFixed(2)}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Approved</div><div className="text-3xl font-bold text-blue-600">{stats.approved}</div></div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border space-y-4">
          <div className="flex gap-4">
            <select value={recordTypeFilter} onChange={(e) => setRecordTypeFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Types</option><option value="revenue">Revenue</option><option value="expense">Expense</option><option value="investment">Investment</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Status</option><option value="draft">Draft</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {loading && <div className="text-center py-8"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div></div>}

        <div className="space-y-4">{displayRecords.filter(r => (recordTypeFilter === 'all' || r.record_type === recordTypeFilter) && (statusFilter === 'all' || r.status === statusFilter)).map(record => (
          <div key={record.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{record.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{record.record_number} • {record.record_type}</p>
                <p className="text-sm text-gray-600">{new Date(record.record_date).toLocaleDateString()}</p>
                <div className="flex gap-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs ${record.status === 'completed' ? 'bg-green-100 text-green-700' : record.status === 'approved' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{record.status}</span>
                  <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700">{record.category}</span>
                </div>
              </div>
              <div className="text-right"><div className={`text-2xl font-bold ${record.record_type === 'revenue' ? 'text-green-600' : 'text-red-600'}`}>${record.amount.toFixed(2)}</div><div className="text-sm text-gray-500">{record.currency}</div></div>
            </div>
          </div>
        ))}</div>
      </div>
    </div>
  )
}
