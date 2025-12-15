import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import ProfileClient from './profile-client'

export const dynamic = 'force-dynamic'

function calculateProfileCompleteness(profile: any): number {
  if (!profile) return 0
  const fields = [
    profile.name, profile.title, profile.bio, profile.avatar_url,
    profile.email, profile.location, profile.skills?.length > 0,
    profile.experience?.length > 0
  ]
  const completed = fields.filter(Boolean).length
  return Math.round((completed / fields.length) * 100)
}

export default async function ProfileV2Page() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  let profile: any = null
  let stats = {
    profileCompleteness: 0,
    totalViews: 0,
    totalFollowers: 0,
    projectsCompleted: 0,
    avgRating: 0
  }

  if (user) {
    const { data: profileData, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!error && profileData) {
      profile = profileData

      stats = {
        profileCompleteness: calculateProfileCompleteness(profile),
        totalViews: profile.views_count || 0,
        totalFollowers: profile.followers_count || 0,
        projectsCompleted: profile.projects_completed || 0,
        avgRating: profile.rating || 0
      }
    }
  }

  return <ProfileClient initialProfile={profile} initialStats={stats} />
}
