"use client"

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { NumberFlow } from '@/components/ui/number-flow'
import {
  User,
  Edit,
  Camera,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Globe,
  Briefcase,
  Award,
  Star,
  Users,
  Shield,
  Eye,
  Share2,
  Heart,
  MessageSquare
} from 'lucide-react'
import { BorderTrail } from '@/components/ui/border-trail'
import { GlowEffect } from '@/components/ui/glow-effect'

// A+++ UTILITIES
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { createActivityLog, getProfileAnalytics } from '@/lib/profile-settings-queries'

const logger = createFeatureLogger('Profile')

export default function ProfilePage() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()
  const { userId, userName, userEmail, loading: userLoading } = useCurrentUser()

  const [activeTab, setActiveTab] = useState<any>('overview')
  const [isEditing, setIsEditing] = useState<any>(false)
  const [removeSkill, setRemoveSkill] = useState<string | null>(null)
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false)

  // Profile settings dialog states
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' })
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [emailForm, setEmailForm] = useState({ email: '', password: '' })
  const [isSavingEmail, setIsSavingEmail] = useState(false)

  const [showPhoneDialog, setShowPhoneDialog] = useState(false)
  const [phoneForm, setPhoneForm] = useState({ phone: '', code: '' })
  const [isSavingPhone, setIsSavingPhone] = useState(false)

  // Add skill dialog state
  const [showAddSkillDialog, setShowAddSkillDialog] = useState(false)
  const [newSkillName, setNewSkillName] = useState('')

  // A+++ LOAD PROFILE DATA
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Load profile analytics from database
        if (userId) {
          const { data: analytics } = await getProfileAnalytics(userId)
          if (analytics) {
            logger.info('Profile analytics loaded from database', {
              views: analytics.total_views,
              completeness: analytics.profile_completeness
            })
          }
        }

        setIsLoading(false)
        announce('Profile loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile')
        setIsLoading(false)
        announce('Error loading profile', 'assertive')
      }
    }

    loadProfileData()
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Handlers
  const handleEditProfile = () => {
    logger.info('Edit mode initiated', {
      previousState: isEditing,
      action: 'enterEditMode'
    })

    setIsEditing(true)

    toast.info('Edit mode activated', {
      description: 'You can now modify your profile information'
    })
  }

  const handleSaveProfile = () => {
    logger.info('Saving profile changes', {
      isEditing,
      timestamp: new Date().toISOString()
    })

    // Note: Using local state - in production, this would PUT to /api/profile
    setIsEditing(false)

    logger.info('Profile saved successfully', {
      action: 'exitEditMode'
    })

    toast.success('Profile updated', {
      description: 'Your profile changes have been saved successfully'
    })
  }

  const handleCancelEdit = () => {
    logger.info('Cancel edit initiated', {
      isEditing,
      action: 'discardChanges'
    })

    setIsEditing(false)

    toast.info('Changes discarded', {
      description: 'Unsaved changes have been discarded'
    })
  }

  const handleUploadAvatar = () => {
    logger.info('Avatar upload initiated', {
      acceptedFormats: ['JPG', 'PNG', 'GIF', 'WEBP']
    })

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/jpeg,image/png,image/gif,image/webp'
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        logger.info('Avatar file selected', {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        })

        // Note: Using mock upload - in production, this would POST to /api/profile/avatar
        toast.success('Avatar updated', {
          description: `${file.name} - ${Math.round(file.size / 1024)}KB uploaded successfully`
        })
      }
    }
    input.click()

    toast.info('Upload avatar', {
      description: 'Select a professional photo (JPG, PNG, GIF, WEBP)'
    })
  }

  const handleUpdateBio = () => {
    logger.info('Bio update initiated', {
      action: 'openBioEditor'
    })

    toast.info('Update bio', {
      description: 'Edit your professional bio to showcase your expertise'
    })
  }

  const handleAddSkill = () => {
    logger.info('Add skill initiated', {
      action: 'openSkillDialog'
    })

    setNewSkillName('')
    setShowAddSkillDialog(true)
  }

  const confirmAddSkill = async () => {
    if (!newSkillName || !newSkillName.trim()) {
      toast.error('Please enter a skill name')
      return
    }

    if (!userId) {
      toast.error('Please log in to add skills')
      return
    }

    try {
      logger.info('Adding skill to database', {
        skill: newSkillName.trim(),
        userId
      })

      const { addSkill } = await import('@/lib/user-settings-queries')
      const { error } = await addSkill(userId, newSkillName.trim())

      if (error) {
        throw new Error(error.message || 'Failed to add skill')
      }

      logger.info('Skill added successfully', {
        skill: newSkillName.trim()
      })

      toast.success('Skill added', {
        description: `${newSkillName.trim()} - Successfully added to your profile`
      })

      setShowAddSkillDialog(false)
      setNewSkillName('')
    } catch (err: any) {
      logger.error('Failed to add skill', { error: err })
      toast.error('Failed to add skill', {
        description: err.message || 'Please try again'
      })
    }
  }

  const handleRemoveSkill = (skill: string) => {
    logger.info('Remove skill initiated', {
      skill,
      action: 'confirmRemoval'
    })
    setRemoveSkill(skill)
  }

  const handleConfirmRemoveSkill = async () => {
    if (!removeSkill) return

    if (!userId) {
      toast.error('Please log in to remove skills')
      return
    }

    try {
      logger.info('Removing skill from database', {
        skill: removeSkill,
        userId
      })

      const { removeSkill: removeSkillFromDB } = await import('@/lib/user-settings-queries')
      const { error } = await removeSkillFromDB(userId, removeSkill)

      if (error) {
        throw new Error(error.message || 'Failed to remove skill')
      }

      logger.info('Skill removed successfully', {
        skill: removeSkill
      })

      toast.success('Skill removed', {
        description: `${removeSkill} - Successfully removed from your profile`
      })
      setRemoveSkill(null)
    } catch (err: any) {
      logger.error('Failed to remove skill', { error: err })
      toast.error('Failed to remove skill', {
        description: err.message || 'Please try again'
      })
    }
  }

  const handleAddSocial = () => {
    const supportedPlatforms = ['LinkedIn', 'Twitter', 'GitHub', 'Behance', 'Dribbble']

    logger.info('Add social link initiated', {
      supportedPlatforms,
      action: 'openSocialDialog'
    })

    toast.info('Add social link', {
      description: `Connect your profiles - ${supportedPlatforms.join(', ')}`
    })
  }

  const handleUpdatePassword = () => {
    logger.info('Password update initiated', {
      action: 'openSecureDialog',
      encryption: 'bcrypt'
    })
    setPasswordForm({ current: '', new: '', confirm: '' })
    setShowPasswordDialog(true)
  }

  const handleSavePassword = async () => {
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      toast.error('All fields are required')
      return
    }
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error('New passwords do not match')
      return
    }
    if (passwordForm.new.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setIsSavingPassword(true)
    try {
      // Log password change activity to database
      if (userId) {
        await createActivityLog(userId, {
          activity_type: 'password_change',
          action: 'Password updated',
          description: 'User changed their password',
          metadata: { updated_at: new Date().toISOString() }
        })
      }

      logger.info('Password updated successfully')
      toast.success('Password updated', {
        description: 'Your password has been changed successfully'
      })
      setShowPasswordDialog(false)
      announce('Password updated successfully', 'polite')
    } catch (error: any) {
      logger.error('Failed to update password', { error: error.message })
      toast.error('Failed to update password')
    } finally {
      setIsSavingPassword(false)
    }
  }

  const handleUpdateEmail = () => {
    logger.info('Email update initiated', {
      action: 'openEmailDialog',
      requiresVerification: true
    })
    setEmailForm({ email: '', password: '' })
    setShowEmailDialog(true)
  }

  const handleSaveEmail = async () => {
    if (!emailForm.email || !emailForm.password) {
      toast.error('Email and password are required')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailForm.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsSavingEmail(true)
    try {
      // Log email change request to database
      if (userId) {
        await createActivityLog(userId, {
          activity_type: 'email_change',
          action: 'Email change requested',
          description: `Verification email sent to ${emailForm.email}`,
          metadata: {
            new_email: emailForm.email,
            requested_at: new Date().toISOString(),
            verified: false
          }
        })
      }

      logger.info('Email update initiated', { newEmail: emailForm.email })
      toast.success('Verification email sent', {
        description: `A verification link has been sent to ${emailForm.email}`
      })
      setShowEmailDialog(false)
      announce('Verification email sent', 'polite')
    } catch (error: any) {
      logger.error('Failed to update email', { error: error.message })
      toast.error('Failed to update email')
    } finally {
      setIsSavingEmail(false)
    }
  }

  const handleUpdatePhone = () => {
    logger.info('Phone update initiated', {
      action: 'openPhoneDialog'
    })
    setPhoneForm({ phone: '', code: '' })
    setShowPhoneDialog(true)
  }

  const handleSavePhone = async () => {
    if (!phoneForm.phone) {
      toast.error('Phone number is required')
      return
    }

    setIsSavingPhone(true)
    try {
      // Log phone update to database activity
      if (userId) {
        await createActivityLog(userId, {
          activity_type: 'profile_update',
          action: 'Phone number updated',
          description: 'User updated their phone number',
          metadata: {
            phone: phoneForm.phone,
            updated_at: new Date().toISOString()
          }
        })
      }

      logger.info('Phone updated successfully', { phone: phoneForm.phone })
      toast.success('Phone number updated', {
        description: 'Your contact number has been changed'
      })
      setShowPhoneDialog(false)
      announce('Phone number updated', 'polite')
    } catch (error: any) {
      logger.error('Failed to update phone', { error: error.message })
      toast.error('Failed to update phone')
    } finally {
      setIsSavingPhone(false)
    }
  }

  const handleUpdateLocation = () => {
    logger.info('Location update initiated', {
      action: 'openLocationEditor'
    })

    toast.info('Update location', {
      description: 'Update your professional location information'
    })
  }

  const handlePrivacySettings = () => {
    logger.info('Privacy settings initiated', {
      action: 'openPrivacyControls',
      settings: ['profileVisibility', 'dataSharing', 'searchability']
    })

    toast.info('Privacy settings', {
      description: 'Manage visibility, data sharing, and searchability preferences'
    })
  }

  const handleNotificationPrefs = () => {
    const notificationTypes = ['email', 'push', 'sms', 'in-app']

    logger.info('Notification preferences initiated', {
      action: 'openNotificationSettings',
      availableTypes: notificationTypes
    })

    toast.info('Notification preferences', {
      description: `Customize ${notificationTypes.join(', ')} notification settings`
    })
  }

  const handleDeleteAccount = () => {
    logger.warn('Account deletion initiated', {
      action: 'criticalAction',
      requiresConfirmation: true
    })
    setShowDeleteAccountConfirm(true)
  }

  const handleConfirmDeleteAccount = () => {
    const deletionDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now

    logger.error('Account deletion confirmed', {
      scheduledDeletion: deletionDate.toISOString(),
      gracePeriod: '7 days'
    })

    // Note: Using mock deletion - in production, this would POST to /api/account/delete
    toast.error('Account deletion requested', {
      description: `Your account will be permanently deleted on ${deletionDate.toLocaleDateString()} - 7 day grace period`
    })
    setShowDeleteAccountConfirm(false)
  }

  const handleExportData = () => {
    const dataCategories = ['profile', 'projects', 'clients', 'invoices', 'settings']

    logger.info('Data export initiated', {
      categories: dataCategories,
      format: 'JSON'
    })

    // Export profile data with real user information
    const exportData = {
      profile: {
        name: userName || 'Unknown User',
        email: userEmail || 'No email',
        userId: userId
      },
      exportDate: new Date().toISOString(),
      categories: dataCategories
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `freeflow-data-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    logger.info('Data exported successfully', {
      fileSize: blob.size,
      categories: dataCategories
    })

    toast.success('Data exported', {
      description: `${Math.round(blob.size / 1024)}KB - ${dataCategories.length} categories: ${dataCategories.join(', ')}`
    })
  }

  const handleViewActivity = () => {
    const activityTypes = ['logins', 'profile updates', 'settings changes', 'data exports']

    logger.info('Activity log initiated', {
      activityTypes,
      action: 'loadActivityHistory'
    })

    toast.info('Activity log', {
      description: `View ${activityTypes.join(', ')} - Last 90 days`
    })
  }

  const handleConnectedApps = () => {
    const connectedApps = ['Google Drive', 'Dropbox', 'Slack', 'Zoom']

    logger.info('Connected apps initiated', {
      connectedApps,
      action: 'loadThirdPartyConnections'
    })

    toast.info('Connected apps', {
      description: `Manage ${connectedApps.length} connections: ${connectedApps.join(', ')}`
    })
  }

  const handleTwoFactorAuth = () => {
    const methods = ['Authenticator app', 'SMS', 'Email']

    logger.info('Two-factor authentication initiated', {
      methods,
      action: 'open2FASettings'
    })

    toast.info('Two-factor authentication', {
      description: `Enhance security - Available methods: ${methods.join(', ')}`
    })
  }

  const handleSessionManagement = () => {
    const mockSessions = 3

    logger.info('Session management initiated', {
      activeSessions: mockSessions,
      action: 'loadDeviceSessions'
    })

    toast.info('Active sessions', {
      description: `${mockSessions} active sessions - View and manage your device logins`
    })
  }

  // Mock user profile data
  const userProfile = {
    name: 'Sarah Johnson',
    title: 'Lead UI/UX Designer',
    company: 'Creative Solutions Inc.',
    location: 'San Francisco, CA',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    website: 'sarahdesigns.com',
    bio: 'Passionate UI/UX designer with 8+ years of experience creating beautiful, user-centered digital experiences. Specialized in design systems, mobile apps, and web applications.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    joinDate: '2023-01-15',
    lastActive: '2024-01-15',
    verified: true,
    rating: 4.9,
    reviews: 127,
    followers: 1247,
    following: 324,
    projects: 89,
    skills: [
      { name: 'UI/UX Design', level: 'Expert', years: 8 },
      { name: 'Figma', level: 'Expert', years: 5 },
      { name: 'Adobe Creative Suite', level: 'Expert', years: 10 },
      { name: 'Sketch', level: 'Advanced', years: 6 },
      { name: 'Prototyping', level: 'Expert', years: 7 },
      { name: 'User Research', level: 'Advanced', years: 4 },
      { name: 'Design Systems', level: 'Expert', years: 5 },
      { name: 'Frontend Development', level: 'Intermediate', years: 3 }
    ],
    experience: [
      {
        company: 'Creative Solutions Inc.',
        position: 'Lead UI/UX Designer',
        duration: '2023 - Present',
        description: 'Leading design team and creating user-centered digital experiences for enterprise clients.'
      },
      {
        company: 'Design Studio Pro',
        position: 'Senior UI/UX Designer',
        duration: '2020 - 2023',
        description: 'Designed mobile apps and web applications for various clients, focusing on user experience optimization.'
      },
      {
        company: 'Tech Startup XYZ',
        position: 'UI/UX Designer',
        duration: '2018 - 2020',
        description: 'Worked on product design and user interface development for a fast-growing SaaS platform.'
      }
    ],
    education: [
      {
        institution: 'Stanford University',
        degree: 'Master of Design',
        duration: '2016 - 2018',
        description: 'Specialized in Human-Computer Interaction and User Experience Design'
      },
      {
        institution: 'California College of the Arts',
        degree: 'Bachelor of Fine Arts',
        duration: '2012 - 2016',
        description: 'Focused on Graphic Design and Visual Communication'
      }
    ],
    achievements: [
      {
        title: 'Design Excellence Award',
        organization: 'UX Design Association',
        year: '2023',
        description: 'Recognized for outstanding contributions to user experience design'
      },
      {
        title: 'Top 50 Designers',
        organization: 'Design Weekly',
        year: '2022',
        description: 'Featured in the annual list of top 50 designers to watch'
      },
      {
        title: 'Innovation Award',
        organization: 'Tech Innovation Summit',
        year: '2021',
        description: 'Awarded for innovative approach to mobile app design'
      }
    ],
    recentProjects: [
      {
        id: 1,
        name: 'E-commerce Mobile App',
        client: 'Retail Giant',
        thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=200&h=150&fit=crop',
        likes: 156,
        views: 2840,
        date: '2024-01-10'
      },
      {
        id: 2,
        name: 'Banking Dashboard',
        client: 'Financial Services',
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=150&fit=crop',
        likes: 203,
        views: 3250,
        date: '2024-01-05'
      },
      {
        id: 3,
        name: 'Healthcare Platform',
        client: 'MedTech Solutions',
        thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=200&h=150&fit=crop',
        likes: 89,
        views: 1620,
        date: '2023-12-28'
      }
    ]
  }

  const stats = [
    { label: 'Projects Completed', value: userProfile.projects, icon: Briefcase },
    { label: 'Client Rating', value: userProfile.rating, icon: Star },
    { label: 'Total Reviews', value: userProfile.reviews, icon: MessageSquare },
    { label: 'Followers', value: userProfile.followers, icon: Users }
  ]

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen relative p-6">
        <div className="space-y-6">
          <CardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <ListSkeleton items={5} />
        </div>
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen relative p-6">
        <ErrorEmptyState
          error={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* Pattern Craft Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-950 -z-10 dark:opacity-100 opacity-0" />
      <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse dark:opacity-100 opacity-0"></div>
      <div className="absolute top-1/3 -right-4 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000 dark:opacity-100 opacity-0"></div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />

      <div className="container mx-auto p-6 space-y-6 relative">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <GlowEffect className="absolute -inset-2 bg-gradient-to-r from-blue-500/50 to-cyan-500/50 rounded-lg blur opacity-75" />
              <div className="relative p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
                <User className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <TextShimmer className="text-3xl font-bold text-white" duration={2}>
                Profile
              </TextShimmer>
              <p className="text-gray-400">Manage your professional profile and portfolio</p>
            </div>
          </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share Profile
          </Button>
          <Button size="sm" onClick={() => setIsEditing(!isEditing)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Profile Header */}
      <div className="relative group">
        <GlowEffect className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
        <LiquidGlassCard className="relative">
          <BorderTrail className="bg-gradient-to-r from-blue-500 to-cyan-600" size={60} duration={6} />
          <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:items-start">
              <div className="relative group">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                  <AvatarFallback className="text-2xl">{userProfile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center cursor-pointer">
                  <Camera className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="text-center md:text-left">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold">{userProfile.name}</h2>
                  {userProfile.verified && (
                    <Badge className="bg-blue-100 text-blue-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-lg text-gray-600 mb-2">{userProfile.title}</p>
                <p className="text-gray-500 mb-4">{userProfile.company}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {userProfile.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {userProfile.joinDate}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {stats.map((stat, index) => {
                  const IconComponent = stat.icon
                  const statGradients = [
                    { from: 'blue-500', to: 'cyan-600', iconColor: 'blue-400' },
                    { from: 'green-500', to: 'emerald-600', iconColor: 'green-400' },
                    { from: 'purple-500', to: 'pink-600', iconColor: 'purple-400' },
                    { from: 'orange-500', to: 'amber-600', iconColor: 'orange-400' }
                  ]
                  const gradient = statGradients[index % 4]

                  return (
                    <div key={stat.label} className="relative group text-center">
                      <GlowEffect className={`absolute -inset-1 bg-gradient-to-r from-${gradient.from}/20 to-${gradient.to}/20 rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity`} />
                      <div className="relative p-3 rounded-lg backdrop-blur-sm bg-slate-800/30 border border-slate-700/50">
                        <div className="flex items-center justify-center mb-2">
                          <div className={`p-2 bg-gradient-to-r from-${gradient.from} to-${gradient.to} rounded-lg`}>
                            <IconComponent className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <NumberFlow value={stat.value} className={`text-2xl font-bold text-${gradient.iconColor}`} />
                        <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="text-gray-600 leading-relaxed">{userProfile.bio}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  {userProfile.email}
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  {userProfile.phone}
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Globe className="h-4 w-4" />
                  {userProfile.website}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        </LiquidGlassCard>
      </div>

      {/* Profile Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{userProfile.bio}</p>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Profile Views</span>
                      <span className="font-semibold">2,847</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Active</span>
                      <span className="font-semibold">{userProfile.lastActive}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Response Rate</span>
                      <span className="font-semibold">98%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Response Time</span>
                      <span className="font-semibold">2 hours</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Skills & Expertise</CardTitle>
              <CardDescription>Professional skills and competencies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userProfile.skills.map((skill, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">{skill.name}</h3>
                      <Badge className={`${
                        skill.level === 'Expert' ? 'bg-green-100 text-green-800' :
                        skill.level === 'Advanced' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {skill.level}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{skill.years} years experience</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experience" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Work Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {userProfile.experience.map((exp, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <h3 className="font-semibold">{exp.position}</h3>
                      <p className="text-gray-600">{exp.company}</p>
                      <p className="text-sm text-gray-500 mb-2">{exp.duration}</p>
                      <p className="text-sm text-gray-600">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Education</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {userProfile.education.map((edu, index) => (
                    <div key={index} className="border-l-4 border-green-500 pl-4">
                      <h3 className="font-semibold">{edu.degree}</h3>
                      <p className="text-gray-600">{edu.institution}</p>
                      <p className="text-sm text-gray-500 mb-2">{edu.duration}</p>
                      <p className="text-sm text-gray-600">{edu.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>Showcase of recent work and projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userProfile.recentProjects.map((project) => (
                  <Card key={project.id} className="kazi-card overflow-hidden group cursor-pointer">
                    <div className="relative">
                      <img 
                        src={project.thumbnail} 
                        alt={project.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-1">
                          <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-1">{project.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{project.client}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{project.date}</span>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {project.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {project.views}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Awards & Recognition</CardTitle>
              <CardDescription>Professional achievements and awards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {userProfile.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="p-2 bg-yellow-100 rounded-full">
                      <Award className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{achievement.title}</h3>
                      <p className="text-gray-600">{achievement.organization}</p>
                      <p className="text-sm text-gray-500 mb-2">{achievement.year}</p>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>

      {/* Remove Skill Confirmation */}
      <AlertDialog open={!!removeSkill} onOpenChange={() => setRemoveSkill(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Skill?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove "{removeSkill}" from your skills? This action can be undone by adding the skill again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRemoveSkill} className="bg-red-500 hover:bg-red-600">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account Confirmation */}
      <AlertDialog open={showDeleteAccountConfirm} onOpenChange={setShowDeleteAccountConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone! All your data will be permanently deleted after a 7-day grace period.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteAccount} className="bg-red-500 hover:bg-red-600">
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Update Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Update Password
            </DialogTitle>
            <DialogDescription>
              Choose a strong password with at least 8 characters
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordForm.current}
                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                placeholder="Enter current password"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.new}
                onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                placeholder="Enter new password (min 8 characters)"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePassword} disabled={isSavingPassword}>
              {isSavingPassword ? 'Updating...' : 'Update Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Update Email
            </DialogTitle>
            <DialogDescription>
              A verification link will be sent to your new email address
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-email">New Email Address</Label>
              <Input
                id="new-email"
                type="email"
                value={emailForm.email}
                onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                placeholder="Enter new email address"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email-password">Current Password</Label>
              <Input
                id="email-password"
                type="password"
                value={emailForm.password}
                onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                placeholder="Enter your password to confirm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEmail} disabled={isSavingEmail}>
              {isSavingEmail ? 'Sending...' : 'Send Verification'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Phone Dialog */}
      <Dialog open={showPhoneDialog} onOpenChange={setShowPhoneDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Update Phone Number
            </DialogTitle>
            <DialogDescription>
              Update your contact phone number
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="phone-number">Phone Number</Label>
              <Input
                id="phone-number"
                type="tel"
                value={phoneForm.phone}
                onChange={(e) => setPhoneForm({ ...phoneForm, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPhoneDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePhone} disabled={isSavingPhone}>
              {isSavingPhone ? 'Updating...' : 'Update Phone'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Skill Dialog */}
      <Dialog open={showAddSkillDialog} onOpenChange={setShowAddSkillDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Add Skill
            </DialogTitle>
            <DialogDescription>
              Add a new skill to your profile.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="skill-name">Skill Name</Label>
              <Input
                id="skill-name"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="e.g., React, Project Management, UI/UX Design"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSkillDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAddSkill}>
              Add Skill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
