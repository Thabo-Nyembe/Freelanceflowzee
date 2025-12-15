import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import PayrollClient from './payroll-client'

export const dynamic = 'force-dynamic'

export default async function PayrollPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: payrollRuns } = await supabase
    .from('payroll_runs')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('pay_date', { ascending: false })
    .limit(50)

  const { data: employeePayroll } = await supabase
    .from('employee_payroll')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <PayrollClient
      initialRuns={payrollRuns || []}
      initialEmployeePayroll={employeePayroll || []}
    />
  )
}
