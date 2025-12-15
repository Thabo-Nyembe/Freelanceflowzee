import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import ExtensionsClient from './extensions-client'

export const dynamic = 'force-dynamic'

export default async function ExtensionsPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  let extensions: any[] = []
  let stats = {
    total: 0,
    enabled: 0,
    disabled: 0,
    official: 0,
    verified: 0,
    thirdParty: 0,
    avgRating: 0,
    totalDownloads: 0
  }

  if (user) {
    const { data: extensionsData } = await supabase
      .from('extensions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (extensionsData) {
      extensions = extensionsData

      const totalRating = extensionsData.reduce((sum, e) => sum + (e.rating || 0), 0)
      const totalDownloads = extensionsData.reduce((sum, e) => sum + (e.downloads_count || 0), 0)

      stats = {
        total: extensionsData.length,
        enabled: extensionsData.filter(e => e.status === 'enabled').length,
        disabled: extensionsData.filter(e => e.status === 'disabled').length,
        official: extensionsData.filter(e => e.extension_type === 'official').length,
        verified: extensionsData.filter(e => e.extension_type === 'verified').length,
        thirdParty: extensionsData.filter(e => e.extension_type === 'third-party').length,
        avgRating: extensionsData.length > 0 ? totalRating / extensionsData.length : 0,
        totalDownloads
      }
    }
  }

  return <ExtensionsClient initialExtensions={extensions} initialStats={stats} />
}
