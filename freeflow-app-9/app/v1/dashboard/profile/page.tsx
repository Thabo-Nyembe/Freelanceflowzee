'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { toast } from 'sonner'
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Settings, Edit, Camera } from 'lucide-react'

const logger = createFeatureLogger('ProfilePage')

export default function ProfilePage() {
  const router = useRouter()
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const { getProfile } = await import('@/lib/profile-queries')
        const result = await getProfile(userId)
        setProfile(result.data)
        setIsLoading(false)
        announce('Profile loaded', 'polite')
      } catch (err) {
        logger.error('Failed to load profile', { error: err, userId })
        setIsLoading(false)
        toast.error('Failed to load profile')
      }
    }

    loadProfile()
  }, [userId, announce])

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:bg-none dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <CardSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:bg-none dark:bg-gray-900">
      <div className="max-w-4xl mx-auto space-y-8">
        <ScrollReveal>
          <TextShimmer className="text-4xl font-bold mb-2">
            My Profile
          </TextShimmer>
          <p className="text-muted-foreground">
            Manage your personal information and preferences
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <LiquidGlassCard>
            <div className="p-8">
              <div className="flex items-start gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
                    {profile?.full_name?.charAt(0) || 'U'}
                  </div>
                  <button
                    onClick={() => toast.info('Upload profile photo')}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{profile?.full_name || 'User'}</h2>
                  <p className="text-muted-foreground">{profile?.title || 'Freelancer'}</p>
                  <div className="flex items-center gap-4 mt-4">
                    <button
                      onClick={() => router.push('/v1/dashboard/settings')}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    <button
                      onClick={() => toast.info('Edit profile')}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-600 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </LiquidGlassCard>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LiquidGlassCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-purple-500" />
                    <span>{profile?.email || 'email@example.com'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-purple-500" />
                    <span>{profile?.phone || 'Not set'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-purple-500" />
                    <span>{profile?.location || 'Not set'}</span>
                  </div>
                </div>
              </div>
            </LiquidGlassCard>

            <LiquidGlassCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Work Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-pink-500" />
                    <span>{profile?.company || 'Independent'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-pink-500" />
                    <span>{profile?.role || 'Freelancer'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-pink-500" />
                    <span>Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </LiquidGlassCard>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
