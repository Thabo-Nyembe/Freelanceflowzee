'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { Camera, Mail, Phone, MapPin, Globe, Briefcase, Trash2, AlertTriangle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { UserProfile, defaultProfile } from '@/lib/settings-utils'
import { createFeatureLogger } from '@/lib/logger'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'

const logger = createFeatureLogger('Settings:Profile')

export default function ProfilePage() {
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  const [profile, setProfile] = useState<UserProfile>(defaultProfile)
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(true)

  // AlertDialog states
  const [showRemovePhotoDialog, setShowRemovePhotoDialog] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        logger.info('Loading profile', { userId })

        // Dynamic import for code splitting
        const { getProfileSettings } = await import('@/lib/profile-settings-queries')

        const { data, error } = await getProfileSettings(userId)
        if (error) throw new Error(error.message)

        if (data) {
          const mappedProfile: UserProfile = {
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            email: data.email || '',
            phone: data.phone || '',
            bio: data.bio || '',
            location: data.location || '',
            website: data.website || '',
            company: data.company || '',
            position: data.position || '',
            avatar: data.avatar_url || ''
          }
          setProfile(mappedProfile)
        }

        logger.info('Profile loaded', { userId })
        announce('Profile loaded successfully', 'polite')
      } catch (error) {
        logger.error('Failed to load profile', { error, userId })
        toast.error('Failed to load profile')
        announce('Error loading profile', 'assertive')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [userId, announce]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpdateProfile = async () => {
    if (!userId) {
      toast.error('Please log in')
      announce('Authentication required', 'assertive')
      return
    }

    logger.info('Profile update initiated', {
      email: profile.email,
      name: `${profile.firstName} ${profile.lastName}`,
      userId
    })

    setIsLoading(true)

    try {
      const { updateProfileSettings } = await import('@/lib/profile-settings-queries')

      const { error } = await updateProfileSettings(userId, {
        first_name: profile.firstName,
        last_name: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        bio: profile.bio,
        location: profile.location,
        website: profile.website,
        company: profile.company,
        position: profile.position,
        avatar_url: profile.avatar
      })

      if (error) throw new Error(error.message)

      logger.info('Profile updated successfully', {
        email: profile.email,
        name: `${profile.firstName} ${profile.lastName}`,
        company: profile.company,
        userId
      })

      toast.success('Profile Updated!', {
        description: `${profile.firstName} ${profile.lastName} - ${profile.company} - ${profile.position}`
      })
      announce('Profile updated successfully', 'polite')
    } catch (error: any) {
      logger.error('Profile update failed', {
        email: profile.email,
        error: error.message,
        userId
      })

      toast.error('Failed to update profile', {
        description: error.message || 'Please try again later'
      })
      announce('Error updating profile', 'assertive')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadPhoto = () => {
    logger.info('Photo upload initiated', {
      email: profile.email
    })

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        logger.info('Photo file selected', {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        })

        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setProfile({ ...profile, avatar: result })

          logger.info('Photo uploaded successfully', {
            email: profile.email,
            fileName: file.name,
            fileSize: file.size
          })

          toast.success('Photo Uploaded!', {
            description: `${file.name} - ${Math.round(file.size / 1024)}KB - Profile picture updated`
          })
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const handleRemovePhoto = () => {
    logger.info('Remove photo initiated', {
      email: profile.email,
      hasAvatar: !!profile.avatar
    })

    setShowRemovePhotoDialog(true)
  }

  const confirmRemovePhoto = async () => {
    if (!userId) {
      toast.error('Please log in to remove photo')
      return
    }

    try {
      logger.info('Removing photo from database', { userId })

      const { updateAvatar } = await import('@/lib/user-settings-queries')
      const { error } = await updateAvatar(userId, '')

      if (error) {
        throw new Error(error.message || 'Failed to remove photo')
      }

      setProfile({ ...profile, avatar: '' })

      logger.info('Photo removed successfully', {
        email: profile.email,
        initials: `${profile.firstName[0]}${profile.lastName[0]}`
      })

      toast.success('Photo Removed', {
        description: `Replaced with initials: ${profile.firstName[0]}${profile.lastName[0]}`
      })
      announce('Profile photo removed', 'polite')
    } catch (err: any) {
      logger.error('Failed to remove photo', { error: err })
      toast.error('Failed to remove photo', {
        description: err.message || 'Please try again'
      })
    } finally {
      setShowRemovePhotoDialog(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <LiquidGlassCard className="lg:col-span-2">
          <CardHeader>
            <TextShimmer className="text-xl font-bold" duration={2}>
              Personal Information
            </TextShimmer>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                <Input
                  id="firstName"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                <Input
                  id="lastName"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={3}
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="website"
                    value={profile.website}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company">Company</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="company"
                    value={profile.company}
                    onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={profile.position}
                  onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-4">
              <Button onClick={handleUpdateProfile} disabled={loading || isLoading}>
                {isLoading ? 'Saving...' : 'Update Profile'}
              </Button>
            </div>
          </CardContent>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.avatar} alt={profile.firstName} />
                <AvatarFallback className="text-lg">
                  {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-2 w-full">
                <Button variant="outline" className="w-full" onClick={handleUploadPhoto} disabled={loading || isLoading}>
                  <Camera className="w-4 h-4 mr-2" />
                  Upload Photo
                </Button>
                <Button variant="ghost" className="w-full text-red-600 hover:text-red-700" onClick={handleRemovePhoto} disabled={loading || isLoading}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Photo
                </Button>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500">
              <p>Recommended: Square image, at least 400x400px</p>
            </div>
          </CardContent>
        </LiquidGlassCard>
      </div>

      {/* Remove Photo AlertDialog */}
      <AlertDialog open={showRemovePhotoDialog} onOpenChange={setShowRemovePhotoDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Remove Profile Photo
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove your profile photo?
              Your photo will be replaced with your initials: {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemovePhoto}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove Photo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
