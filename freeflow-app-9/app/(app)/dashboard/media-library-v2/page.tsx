import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import MediaLibraryClient from './media-library-client'

export default async function MediaLibraryPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [filesResult, foldersResult] = await Promise.all([
    supabase
      .from('media_files')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('uploaded_at', { ascending: false })
      .limit(50),
    supabase
      .from('media_folders')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })
      .limit(20)
  ])

  return (
    <MediaLibraryClient
      initialFiles={filesResult.data || []}
      initialFolders={foldersResult.data || []}
    />
  )
}
