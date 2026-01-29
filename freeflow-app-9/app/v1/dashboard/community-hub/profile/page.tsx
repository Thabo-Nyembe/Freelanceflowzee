'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { toast } from 'sonner'
import { User, Star, MessageSquare, Heart, Trophy, Users, BookOpen, Award, Edit } from 'lucide-react'

const logger = createFeatureLogger('CommunityProfile')

export default function CommunityProfilePage() {
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState({
    posts: 0,
    replies: 0,
    likes: 0,
    followers: 0,
    following: 0,
    reputation: 0
  })

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        // Simulate loading community profile
        await new Promise(resolve => setTimeout(resolve, 500))
        setProfile({
          name: 'Community Member',
          bio: 'Active community contributor',
          joined: new Date().toISOString(),
          badges: ['Early Adopter', 'Helpful', 'Top Contributor']
        })
        setStats({
          posts: 24,
          replies: 156,
          likes: 342,
          followers: 89,
          following: 45,
          reputation: 1250
        })
        setIsLoading(false)
        announce('Community profile loaded', 'polite')
      } catch (err) {
        logger.error('Failed to load community profile', { error: err, userId })
        setIsLoading(false)
        toast.error('Failed to load profile')
      }
    }

    loadProfile()
  }, [userId, announce])

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:bg-none dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <CardSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:bg-none dark:bg-gray-900">
      <div className="max-w-4xl mx-auto space-y-8">
        <ScrollReveal>
          <TextShimmer className="text-4xl font-bold mb-2">
            Community Profile
          </TextShimmer>
          <p className="text-muted-foreground">
            Your presence in the KAZI community
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <LiquidGlassCard>
            <div className="p-8">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                  <User className="w-12 h-12" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{profile?.name}</h2>
                  <p className="text-muted-foreground">{profile?.bio}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {profile?.badges?.map((badge: string) => (
                      <span key={badge} className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full text-sm">
                        <Award className="w-3 h-3 inline mr-1" />
                        {badge}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => toast.info('Edit community profile')}
                    className="mt-4 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-indigo-600 hover:to-purple-600 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </LiquidGlassCard>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Posts', value: stats.posts, icon: BookOpen, color: 'text-blue-500' },
              { label: 'Replies', value: stats.replies, icon: MessageSquare, color: 'text-green-500' },
              { label: 'Likes', value: stats.likes, icon: Heart, color: 'text-red-500' },
              { label: 'Followers', value: stats.followers, icon: Users, color: 'text-purple-500' },
              { label: 'Following', value: stats.following, icon: User, color: 'text-indigo-500' },
              { label: 'Reputation', value: stats.reputation, icon: Trophy, color: 'text-yellow-500' }
            ].map((stat) => (
              <LiquidGlassCard key={stat.label}>
                <div className="p-4 text-center">
                  <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </LiquidGlassCard>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
