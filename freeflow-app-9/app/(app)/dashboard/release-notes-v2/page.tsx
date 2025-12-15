import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import ReleaseNotesClient from './release-notes-client'
import { ReleaseNote, ReleaseNotesStats } from '@/lib/hooks/use-release-notes'

export const dynamic = 'force-dynamic'

export default async function ReleaseNotesPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  let releases: ReleaseNote[] = []
  let stats: ReleaseNotesStats = {
    total: 0,
    published: 0,
    draft: 0,
    scheduled: 0,
    totalDownloads: 0,
    avgLikes: 0
  }

  if (user) {
    const { data } = await supabase
      .from('release_notes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) {
      releases = data as ReleaseNote[]

      const published = releases.filter(r => r.status === 'published').length
      const draft = releases.filter(r => r.status === 'draft').length
      const scheduled = releases.filter(r => r.status === 'scheduled').length
      const totalDownloads = releases.reduce((sum, r) => sum + (r.downloads_count || 0), 0)
      const avgLikes = releases.length > 0
        ? releases.reduce((sum, r) => sum + (r.likes_count || 0), 0) / releases.length
        : 0

      stats = {
        total: releases.length,
        published,
        draft,
        scheduled,
        totalDownloads,
        avgLikes
      }
    }
  }

  return <ReleaseNotesClient initialReleases={releases} initialStats={stats} />
}
