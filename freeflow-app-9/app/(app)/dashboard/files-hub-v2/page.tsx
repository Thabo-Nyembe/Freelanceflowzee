import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import FilesHubClient from './files-hub-client'

export const dynamic = 'force-dynamic'

export default async function FilesHubV2Page() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  let files: any[] = []
  let folders: any[] = []
  let stats = {
    totalFiles: 0,
    totalFolders: 0,
    totalSizeBytes: 0,
    starredFiles: 0,
    recentFiles: 0
  }

  if (user) {
    // Fetch files at root level (no folder)
    const { data: filesData } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .is('folder_id', null)
      .order('updated_at', { ascending: false })

    files = filesData || []

    // Fetch all files for stats
    const { data: allFilesData } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')

    const allFiles = allFilesData || []

    // Fetch folders
    const { data: foldersData } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true })

    folders = foldersData || []

    // Calculate recent files (last 7 days)
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    stats = {
      totalFiles: allFiles.length,
      totalFolders: folders.length,
      totalSizeBytes: allFiles.reduce((sum, f) => sum + (f.size_bytes || 0), 0),
      starredFiles: allFiles.filter(f => f.is_starred).length,
      recentFiles: allFiles.filter(f => new Date(f.created_at) > oneWeekAgo).length
    }
  }

  return <FilesHubClient initialFiles={files} initialFolders={folders} initialStats={stats} />
}
