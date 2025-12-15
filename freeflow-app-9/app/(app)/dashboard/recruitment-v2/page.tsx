import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import RecruitmentClient from './recruitment-client'

export const dynamic = 'force-dynamic'

export default async function RecruitmentPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch job postings data
  const { data: jobs } = await supabase
    .from('job_postings')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50)

  // Fetch recent applications
  const { data: applications } = await supabase
    .from('job_applications')
    .select('*')
    .eq('user_id', user.id)
    .order('applied_date', { ascending: false })
    .limit(20)

  return <RecruitmentClient initialJobs={jobs || []} initialApplications={applications || []} />
}
