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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

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
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    title: '',
    location: '',
    skills: ''
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

  // Initialize edit form when profile loads
  useEffect(() => {
    if (profile) {
      setEditForm({
        name: profile.name || '',
        bio: profile.bio || '',
        title: profile.title || '',
        location: profile.location || '',
        skills: profile.skills?.join(', ') || ''
      })
    }
  }, [profile])

  const handleEditProfile = () => {
    setShowEditDialog(true)
  }

  const handleSaveProfile = async () => {
    if (!userId) {
      toast.error('Authentication required')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-profile',
          resourceId: userId,
          userId,
          data: {
            name: editForm.name,
            bio: editForm.bio,
            title: editForm.title,
            location: editForm.location,
            skills: editForm.skills.split(',').map(s => s.trim()).filter(Boolean)
          }
        })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update profile')
      }

      // Update local profile state
      setProfile((prev: any) => ({
        ...prev,
        name: editForm.name,
        bio: editForm.bio,
        title: editForm.title,
        location: editForm.location,
        skills: editForm.skills.split(',').map(s => s.trim()).filter(Boolean)
      }))

      toast.success('Profile updated successfully')
      setShowEditDialog(false)
      announce('Profile updated', 'polite')
    } catch (err) {
      logger.error('Failed to update profile', { error: err, userId })
      toast.error('Failed to update profile')
    } finally {
      setIsSubmitting(false)
    }
  }

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
                    onClick={handleEditProfile}
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

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Community Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Your display name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title / Role</Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Full Stack Developer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={editForm.location}
                onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., San Francisco, CA"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={editForm.bio}
                onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell the community about yourself..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input
                id="skills"
                value={editForm.skills}
                onChange={(e) => setEditForm(prev => ({ ...prev, skills: e.target.value }))}
                placeholder="e.g., React, Node.js, TypeScript"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
