import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import MobileAppClient from './mobile-app-client'
import { MobileAppFeature, MobileAppVersion, MobileAppStats } from '@/lib/hooks/use-mobile-app'

export const dynamic = 'force-dynamic'

export default async function MobileAppPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  let features: MobileAppFeature[] = []
  let versions: MobileAppVersion[] = []
  let stats: MobileAppStats = {
    totalDownloads: 0,
    totalUsers: 0,
    avgRating: 0,
    avgEngagement: 0,
    activeFeatures: 0,
    totalVersions: 0,
    latestVersion: null
  }

  if (user) {
    const [featuresResult, versionsResult] = await Promise.all([
      supabase
        .from('mobile_app_features')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('mobile_app_versions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
    ])

    if (featuresResult.data) {
      features = featuresResult.data as MobileAppFeature[]
    }
    if (versionsResult.data) {
      versions = versionsResult.data as MobileAppVersion[]
    }

    const activeFeatures = features.filter(f => f.status === 'active')
    const latestVersion = versions.length > 0 ? versions[0] : null

    stats = {
      totalDownloads: versions.reduce((sum, v) => sum + (v.downloads_count || 0), 0),
      totalUsers: features.reduce((sum, f) => sum + (f.users_count || 0), 0),
      avgRating: features.length > 0
        ? features.reduce((sum, f) => sum + (f.rating || 0), 0) / features.length
        : 0,
      avgEngagement: features.length > 0
        ? features.reduce((sum, f) => sum + (f.engagement_percent || 0), 0) / features.length
        : 0,
      activeFeatures: activeFeatures.length,
      totalVersions: versions.length,
      latestVersion: latestVersion?.version || null
    }
  }

  return <MobileAppClient initialFeatures={features} initialVersions={versions} initialStats={stats} />
}
