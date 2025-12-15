'use client'
import { useState } from 'react'
import { useInvoices, type Invoice, type InvoiceStatus } from '@/lib/hooks/use-invoices'

export default function InvoicesClient({ initialInvoices }: { initialInvoices: Invoice[] }) {
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all')
  const { invoices, loading, error } = useInvoices({ status: statusFilter, limit: 50 })
  const displayInvoices = invoices.length > 0 ? invoices : initialInvoices
  const stats = {
    total: displayInvoices.length,
    paid: displayInvoices.filter(i => i.status === 'paid').length,
    pending: displayInvoices.filter(i => i.status === 'pending' || i.status === 'sent').length,
    overdue: displayInvoices.filter(i => i.status === 'overdue').length,
    totalRevenue: displayInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total_amount, 0)
  }

  if (error) return <div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div><h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Invoices</h1>
          <p className="text-gray-600 mt-2">Manage your invoices and billing</p></div>
          <button className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:shadow-lg transition-all">+ New Invoice</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Total</div><div className="text-3xl font-bold text-gray-900">{stats.total}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Paid</div><div className="text-3xl font-bold text-green-600">{stats.paid}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Pending</div><div className="text-3xl font-bold text-yellow-600">{stats.pending}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Revenue</div><div className="text-3xl font-bold text-emerald-600">${stats.totalRevenue.toFixed(2)}</div></div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border"><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg"><option value="all">All</option><option value="draft">Draft</option><option value="sent">Sent</option><option value="paid">Paid</option><option value="overdue">Overdue</option></select></div>
        {loading && <div className="text-center py-8"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div></div>}
        <div className="space-y-4">{displayInvoices.filter(i => statusFilter === 'all' || i.status === statusFilter).map(invoice => (
          <div key={invoice.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border">
            <div className="flex justify-between items-start"><div>
              <div className="flex gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${invoice.status === 'paid' ? 'bg-green-100 text-green-700' : invoice.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{invoice.status}</span>
              </div>
              <h3 className="text-lg font-semibold">{invoice.title}</h3>
              <p className="text-sm text-gray-600 mt-1">Invoice #{invoice.invoice_number}</p>
              <p className="text-sm text-gray-600">Due: {new Date(invoice.due_date).toLocaleDateString()}</p>
            </div>
            <div className="text-right"><div className="text-2xl font-bold text-emerald-600">${invoice.total_amount.toFixed(2)}</div><div className="text-sm text-gray-500">{invoice.currency}</div></div></div>
          </div>
        ))}</div>
      </div>
    </div>
  )
}
