import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import AudioStudioClient from './audio-studio-client'

export const dynamic = 'force-dynamic'

/**
 * Audio Studio V2 - Professional Audio Editing & Processing
 * Server-side rendered with real-time client updates
 */
export default async function AudioStudioV2Page() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  let tracks: any[] = []
  let projects: any[] = []
  let stats = {
    totalTracks: 0,
    totalProjects: 0,
    totalDuration: 0,
    totalSize: 0,
    processedTracks: 0,
    avgProcessingTime: 2.3
  }

  if (user) {
    // Fetch tracks
    const { data: tracksData } = await supabase
      .from('audio_tracks')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(100)

    // Fetch projects
    const { data: projectsData } = await supabase
      .from('audio_projects')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(50)

    tracks = tracksData || []
    projects = projectsData || []

    if (tracks.length > 0) {
      stats = {
        totalTracks: tracks.length,
        totalProjects: projects.length,
        totalDuration: tracks.reduce((sum, t) => sum + (t.duration_seconds || 0), 0),
        totalSize: tracks.reduce((sum, t) => sum + (t.file_size_bytes || 0), 0),
        processedTracks: tracks.filter(t => t.is_processed).length,
        avgProcessingTime: 2.3
      }
    }
  }

  return (
    <AudioStudioClient
      initialTracks={tracks}
      initialProjects={projects}
      initialStats={stats}
    />
  )
}
