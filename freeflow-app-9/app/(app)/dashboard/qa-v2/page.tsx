import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import QAClient from './qa-client'

export const dynamic = 'force-dynamic'

export default async function QAPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch QA test cases data
  const { data: testCases } = await supabase
    .from('qa_test_cases')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
    .limit(50)

  return <QAClient initialTestCases={testCases || []} />
}
