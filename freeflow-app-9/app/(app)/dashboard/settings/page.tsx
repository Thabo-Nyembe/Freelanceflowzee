'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { Camera, Mail, Phone, MapPin, Globe, Briefcase, Trash2 } from 'lucide-react'
import { UserProfile, defaultProfile } from '@/lib/settings-utils'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('Settings:Profile')

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile)
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdateProfile = async () => {
    logger.info('Profile update initiated', {
      email: profile.email,
      name: `${profile.firstName} ${profile.lastName}`
    })

    setIsLoading(true)

    try {
      const response = await fetch('/api/settings/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'profile',
          action: 'update',
          data: profile
        })
      })

      const result = await response.json()

      if (result.success) {
        logger.info('Profile updated successfully', {
          email: profile.email,
          name: `${profile.firstName} ${profile.lastName}`,
          company: profile.company
        })

        toast.success('Profile Updated!', {
          description: `${profile.firstName} ${profile.lastName} - ${profile.company} - ${profile.position}`
        })
      } else {
        throw new Error(result.error || 'Failed to update profile')
      }
    } catch (error: any) {
      logger.error('Profile update failed', {
        email: profile.email,
        error: error.message
      })

      toast.error('Failed to update profile', {
        description: error.message || 'Please try again later'
      })
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

    if (confirm('⚠️ Remove profile photo?\n\nYour photo will be replaced with your initials.')) {
      setProfile({ ...profile, avatar: '' })

      logger.info('Photo removed successfully', {
        email: profile.email,
        initials: `${profile.firstName[0]}${profile.lastName[0]}`
      })

      toast.success('Photo Removed', {
        description: `Replaced with initials: ${profile.firstName[0]}${profile.lastName[0]}`
      })
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
              <Button onClick={handleUpdateProfile} disabled={isLoading}>
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
                <Button variant="outline" className="w-full" onClick={handleUploadPhoto}>
                  <Camera className="w-4 h-4 mr-2" />
                  Upload Photo
                </Button>
                <Button variant="ghost" className="w-full text-red-600 hover:text-red-700" onClick={handleRemovePhoto}>
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
    </div>
  )
}
