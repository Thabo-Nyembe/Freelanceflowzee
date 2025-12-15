import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import CanvasClient from './canvas-client'

export default async function CanvasPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: canvases, error } = await supabase
    .from('canvas')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50)

  return <CanvasClient initialCanvases={canvases || []} />
}
