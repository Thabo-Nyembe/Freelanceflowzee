import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import InvoicingClient from './invoicing-client'

export const dynamic = 'force-dynamic'

export default async function InvoicingV2Page() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  let invoices: any[] = []
  let stats = {
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
    totalRevenue: 0,
    pendingAmount: 0
  }

  if (user) {
    const { data: invoicesData } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    invoices = invoicesData || []

    stats = {
      total: invoices.length,
      paid: invoices.filter(i => i.status === 'paid').length,
      pending: invoices.filter(i => i.status === 'pending' || i.status === 'sent').length,
      overdue: invoices.filter(i => i.status === 'overdue').length,
      totalRevenue: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total_amount || i.amount || 0), 0),
      pendingAmount: invoices.filter(i => i.status === 'pending' || i.status === 'sent').reduce((sum, i) => sum + (i.total_amount || i.amount || 0), 0)
    }
  }

  return <InvoicingClient initialInvoices={invoices} initialStats={stats} />
}
