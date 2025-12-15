import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import TemplatesClient from './templates-client'

export const dynamic = 'force-dynamic'

export default async function TemplatesPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: templates } = await supabase
    .from('templates')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
    .limit(100)

  return <TemplatesClient initialTemplates={templates || []} />
}
