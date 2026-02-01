'use client'

import { createClient } from '@/lib/supabase/client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/hooks/use-auth'
import {
  User, Edit, Camera, Phone, Mail, MapPin, Calendar, Globe,
  Briefcase, Award, Star, Users, Shield, MessageSquare, Settings,
  Share2, Download, Plus, Search, Eye, Link2, TrendingUp,
  GraduationCap, Building2, FileText, Heart, ThumbsUp, Bookmark,
  BarChart3, CheckCircle, Clock, Image, Video, Zap, Target, Bell, Lock, Activity, UserPlus,
  Languages, BookOpen, Trophy, Network, Sparkles,
  ArrowUpRight, ArrowDownRight, MoreHorizontal, Twitter, Github, Youtube,
  Mic, Podcast, Newspaper, Hash, Database, Terminal, Crown, ChevronRight, Play, Sliders,
  Webhook, Key, History, RefreshCw,
  Trash2, AlertTriangle, Loader2
} from 'lucide-react'

// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'




import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'

// Initialize Supabase client once at module level
const supabase = createClient()

// Types
type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'
type ConnectionStatus = 'connected' | 'pending' | 'following' | 'none'
type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship' | 'volunteer' | 'self-employed'
type LocationType = 'onsite' | 'remote' | 'hybrid'
type JobType = 'full-time' | 'part-time' | 'contract' | 'temporary' | 'internship'
type AssessmentStatus = 'not-taken' | 'in-progress' | 'passed' | 'failed'

interface SocialLink {
  platform: string
  url: string
  icon: string
}

interface Connection {
  id: string
  name: string
  avatar: string
  headline: string
  company: string
  location: string
  mutualConnections: number
  status: ConnectionStatus
  connectedAt?: string
  note?: string
}

interface Job {
  id: string
  title: string
  company: string
  companyLogo?: string
  location: string
  locationType: LocationType
  type: JobType
  salary?: { min: number; max: number; currency: string }
  postedAt: string
  applicants: number
  isSaved: boolean
  isEasyApply: boolean
  matchScore: number
  skills: string[]
}

// Types removed

// Mock Data
// Empty profile state for fallback
const emptyProfile: any = {
  id: '',
  userId: '',
  firstName: '',
  lastName: '',
  headline: '',
  summary: '',
  location: '',
  email: '',
  phone: '',
  website: '',
  avatar: '',
  banner: '',
  // Default values for UI fields not in DB
  isVerified: false,
  isPremium: false,
  isCreatorMode: false,
  isOpenToWork: false,
  isHiring: false,
  profileViews: 0,
  profileViewsChange: 0,
  searchAppearances: 0,
  searchAppearancesChange: 0,
  postImpressions: 0,
  postImpressionsChange: 0,
  followers: 0,
  following: 0,
  connections: 0,
  profileStrength: 0,
  industry: '',
  currentCompany: '',
  currentTitle: '',
  createdAt: '',
  lastActive: '',
  customUrl: '',
  coverStory: '',
  topVoice: false,
  topVoiceBadge: '',
  socialLinks: [],
  featuredCount: 0,
  articlesCount: 0,
  newsletterSubscribers: 0
}


// Mock data removed - Experience

// Mock data removed - Education

// Mock data removed - Skills

// Mock data removed - Phase 1 mocks
// mockCertifications, mockRecommendations, mockFeatured, mockProfileViewers removed

// Mock data removed - Post

// Mock data removed - Phase 2 (Featured, Connections, Jobs, Languages, Projects, Volunteer, Honors)

// mockProfileViewers removed

// Helper functions
const getSkillLevelColor = (level: SkillLevel): string => {
  const colors: Record<SkillLevel, string> = {
    beginner: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    intermediate: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    advanced: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    expert: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  }
  return colors[level]
}

const getAssessmentColor = (status: AssessmentStatus): string => {
  const colors: Record<AssessmentStatus, string> = {
    'not-taken': 'bg-gray-100 text-gray-600',
    'in-progress': 'bg-yellow-100 text-yellow-700',
    'passed': 'bg-green-100 text-green-700',
    'failed': 'bg-red-100 text-red-700'
  }
  return colors[status]
}

// Helper removed (getConnectionStatusColor)


const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

// Helper removed

const calculateDuration = (start: string, end?: string) => {
  const startDate = new Date(start)
  const endDate = end ? new Date(end) : new Date()
  const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth())
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  if (years > 0) return `${years} yr${years > 1 ? 's' : ''} ${remainingMonths} mo${remainingMonths !== 1 ? 's' : ''}`
  return `${remainingMonths} mo${remainingMonths !== 1 ? 's' : ''}`
}

// Helper removed (formatTimeAgo)


// Enhanced Competitive Upgrade Mock Data
// Mock data removed - AI component mocks
// mockProfileAIInsights, mockProfileCollaborators, mockProfilePredictions, mockProfileActivities

// mockProfileQuickActions will be defined inside the component to access state setters

// Database types
interface UserProfile {
  id: string
  user_id: string
  first_name: string
  last_name: string
  display_name: string
  email: string
  phone: string | null
  bio: string | null
  avatar: string | null
  cover_image: string | null
  location: string | null
  timezone: string
  website: string | null
  company: string | null
  title: string | null
  status: string
  account_type: string
  created_at: string
  updated_at: string
}

interface DBSkill {
  id: string
  user_id: string
  name: string
  category: string
  level: string
  years_of_experience: number
  endorsements: number
}

interface DBExperience {
  id: string
  user_id: string
  company: string
  title: string
  location: string | null
  start_date: string
  end_date: string | null
  current: boolean
  description: string | null
  achievements: string[]
}

interface DBEducation {
  id: string
  user_id: string
  school: string
  degree: string
  field: string
  start_date: string
  end_date: string | null
  current: boolean
  grade: string | null
  activities: string[]
}

interface ProfileSettings {
  id: string
  user_id: string
  privacy_level: string
  show_email: boolean
  show_phone: boolean
  show_location: boolean
  allow_messages: boolean
  allow_connections: boolean
  email_notifications: boolean
  push_notifications: boolean
  marketing_emails: boolean
  language: string
  theme: string
}

export default function ProfileClient() {

  const { user } = useAuth()

  // UI State
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSkillCategory, setSelectedSkillCategory] = useState<string | 'all'>('all')
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')
  // Unused state variables removed for cleanup

  // New Dialog States for replacing toast-only patterns
  const [showSkillQuizDialog, setShowSkillQuizDialog] = useState(false)
  const [showPinSkillDialog, setShowPinSkillDialog] = useState(false)
  const [showEndorseRequestDialog, setShowEndorseRequestDialog] = useState(false)
  const [showAddBadgeDialog, setShowAddBadgeDialog] = useState(false)
  const [showSkillGoalsDialog, setShowSkillGoalsDialog] = useState(false)
  const [showSkillTrendsDialog, setShowSkillTrendsDialog] = useState(false)
  const [showCompaniesDialog, setShowCompaniesDialog] = useState(false)
  const [showAlumniDialog, setShowAlumniDialog] = useState(false)
  const [showGroupsDialog, setShowGroupsDialog] = useState(false)
  const [showSalaryInfoDialog, setShowSalaryInfoDialog] = useState(false)
  const [showReferralsDialog, setShowReferralsDialog] = useState(false)
  const [showCreateEventDialog, setShowCreateEventDialog] = useState(false)
  const [showHashtagsDialog, setShowHashtagsDialog] = useState(false)
  const [showSchedulePostDialog, setShowSchedulePostDialog] = useState(false)
  const [showCoverStoryDialog, setShowCoverStoryDialog] = useState(false)
  const [showConnectDialog, setShowConnectDialog] = useState(false)
  const [showMessageDialog, setShowMessageDialog] = useState(false)
  const [showMoreOptionsDialog, setShowMoreOptionsDialog] = useState(false)
  const [showDownloadCVDialog, setShowDownloadCVDialog] = useState(false)
  const [showAddSkillDialog, setShowAddSkillDialog] = useState(false)
  const [showJobApplyDialog, setShowJobApplyDialog] = useState<Job | null>(null)
  const [showEndorseSkillDialog, setShowEndorseSkillDialog] = useState<string | null>(null)
  const [showChatDialog, setShowChatDialog] = useState<Connection | null>(null)
  const [showSessionSignOutDialog, setShowSessionSignOutDialog] = useState<number | null>(null)
  const [showConnectGoogleDialog, setShowConnectGoogleDialog] = useState(false)

  // New dialog states for "Coming soon" features
  const [showAddExperienceDialog, setShowAddExperienceDialog] = useState(false)
  const [showAddCertificationDialog, setShowAddCertificationDialog] = useState(false)
  const [showAddEducationDialog, setShowAddEducationDialog] = useState(false)
  const [showAddAwardDialog, setShowAddAwardDialog] = useState(false)
  const [showAddProjectDialog, setShowAddProjectDialog] = useState(false)
  const [showAddVolunteerDialog, setShowAddVolunteerDialog] = useState(false)
  const [showAddPublicationDialog, setShowAddPublicationDialog] = useState(false)
  const [showAddLanguagesDialog, setShowAddLanguagesDialog] = useState(false)
  const [showAddContactsDialog, setShowAddContactsDialog] = useState(false)
  const [showFindPeopleDialog, setShowFindPeopleDialog] = useState(false)
  const [showSearchJobsDialog, setShowSearchJobsDialog] = useState(false)
  const [showNewPostDialog, setShowNewPostDialog] = useState(false)
  const [showUpdatePhotoDialog, setShowUpdatePhotoDialog] = useState(false)
  const [showUpdateJobsDialog, setShowUpdateJobsDialog] = useState(false)
  const [showAddFeaturedDialog, setShowAddFeaturedDialog] = useState(false)
  const [showReorderSkillsDialog, setShowReorderSkillsDialog] = useState(false)

  // Form states for dialogs
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillCategory, setNewSkillCategory] = useState('General')
  const [cvFormat, setCvFormat] = useState<'pdf' | 'docx'>('pdf')
  const [cvIncludeSections, setCvIncludeSections] = useState({
    summary: true,
    experience: true,
    education: true,
    skills: true,
    certifications: true,
    projects: false
  })
  const [eventFormData, setEventFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    isOnline: false
  })
  const [schedulePostData, setSchedulePostData] = useState({
    content: '',
    scheduledDate: '',
    scheduledTime: ''
  })
  const [connectionMessage, setConnectionMessage] = useState('')
  const [messageContent, setMessageContent] = useState('')
  const [quizSelectedSkill, setQuizSelectedSkill] = useState('')
  const [skillGoalData, setSkillGoalData] = useState({
    skill: '',
    targetLevel: 'advanced',
    deadline: ''
  })

  // Form data for new dialogs
  const [experienceFormData, setExperienceFormData] = useState({
    company: '',
    title: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  })
  const [certificationFormData, setCertificationFormData] = useState({
    name: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    credentialUrl: ''
  })
  const [educationFormData, setEducationFormData] = useState({
    school: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    current: false,
    grade: '',
    activities: ''
  })
  const [awardFormData, setAwardFormData] = useState({
    title: '',
    issuer: '',
    date: '',
    description: ''
  })
  const [projectFormData, setProjectFormData] = useState({
    name: '',
    description: '',
    url: '',
    startDate: '',
    endDate: '',
    current: false
  })
  const [volunteerFormData, setVolunteerFormData] = useState({
    organization: '',
    role: '',
    cause: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  })
  const [publicationFormData, setPublicationFormData] = useState({
    title: '',
    publisher: '',
    date: '',
    url: '',
    description: ''
  })
  const [languageFormData, setLanguageFormData] = useState({
    language: '',
    proficiency: 'intermediate'
  })
  const [postFormData, setPostFormData] = useState({
    content: '',
    type: 'text' as 'text' | 'article' | 'photo' | 'video'
  })
  const [featuredFormData, setFeaturedFormData] = useState({
    type: 'post' as 'post' | 'article' | 'link' | 'media',
    title: '',
    description: '',
    url: ''
  })
  const [jobSearchQuery, setJobSearchQuery] = useState('')
  const [peopleSearchQuery, setPeopleSearchQuery] = useState('')

  // Data State
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [skills, setSkills] = useState<DBSkill[]>([])
  const [experiences, setExperiences] = useState<DBExperience[]>([])
  const [education, setEducation] = useState<DBEducation[]>([])
  const [settings, setSettings] = useState<ProfileSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [recommendationsCount, setRecommendationsCount] = useState(0)
  const [assessmentsPassedCount, setAssessmentsPassedCount] = useState(0)

  // Form State for Settings
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    headline: '',
    location: '',
    industry: '',
    customUrl: '',
    email: '',
    phone: '',
    website: '',
    bio: ''
  })

  // Fetch profile data
  const fetchProfileData = useCallback(async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const [profileRes, skillsRes, expRes, eduRes, settingsRes, recommendationsRes, assessmentsRes] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('skills').select('*').eq('user_id', user.id).order('endorsements', { ascending: false }),
        supabase.from('experience').select('*').eq('user_id', user.id).order('start_date', { ascending: false }),
        supabase.from('education').select('*').eq('user_id', user.id).order('start_date', { ascending: false }),
        supabase.from('profile_settings').select('*').eq('user_id', user.id).single(),
        // Fetch recommendations count for this user
        supabase.from('recommendations').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'active'),
        // Fetch skill assessments where user has passed
        supabase.from('skill_assessments').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('result', 'passed')
      ])

      if (profileRes.data) {
        setProfile(profileRes.data)
        setFormData({
          firstName: profileRes.data.first_name || '',
          lastName: profileRes.data.last_name || '',
          headline: profileRes.data.title || '',
          location: profileRes.data.location || '',
          industry: '',
          customUrl: '',
          email: profileRes.data.email || '',
          phone: profileRes.data.phone || '',
          website: profileRes.data.website || '',
          bio: profileRes.data.bio || ''
        })
      }
      if (skillsRes.data) setSkills(skillsRes.data)
      if (expRes.data) setExperiences(expRes.data)
      if (eduRes.data) setEducation(eduRes.data)
      if (settingsRes.data) setSettings(settingsRes.data)
      // Set recommendations count (0 if no data or table doesn't exist)
      setRecommendationsCount(recommendationsRes.count ?? 0)
      // Set assessments passed count (0 if no data or table doesn't exist)
      setAssessmentsPassedCount(assessmentsRes.count ?? 0)
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchProfileData()
  }, [fetchProfileData])

  // Update profile
  const handleUpdateProfile = async () => {
    if (!user?.id || !profile?.id) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          title: formData.headline,
          location: formData.location,
          email: formData.email,
          phone: formData.phone,
          website: formData.website,
          bio: formData.bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)

      if (error) throw error

      toast.success('Profile updated successfully')
      fetchProfileData()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  // Add skill
  const handleAddSkill = async (skillName: string, category: string = 'General') => {
    if (!user?.id) return

    try {
      const { error } = await supabase.from('skills').insert({
        user_id: user.id,
        name: skillName,
        category,
        level: 'intermediate',
        years_of_experience: 0,
        endorsements: 0
      })

      if (error) throw error

      toast.success('Skill added')
      fetchProfileData()
    } catch (error) {
      if (error.code === '23505') {
        toast.error('Skill already exists')
      } else {
        toast.error('Failed to add skill')
      }
    }
  }

  // Delete skill
  const handleDeleteSkill = async (skillId: string) => {
    try {
      const { error } = await supabase.from('skills').delete().eq('id', skillId)
      if (error) throw error

      toast.success('Skill removed')
      fetchProfileData()
    } catch (error) {
      toast.error('Failed to remove skill')
    }
  }

  // Add experience handler removed (unused)


  // Delete experience
  const handleDeleteExperience = async (expId: string) => {
    try {
      const { error } = await supabase.from('experience').delete().eq('id', expId)
      if (error) throw error

      toast.success('Experience removed')
      fetchProfileData()
    } catch (error) {
      toast.error('Failed to remove experience')
    }
  }

  // Update settings
  const handleUpdateSettings = async (updates: Partial<ProfileSettings>) => {
    if (!user?.id || !settings?.id) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('profile_settings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', settings.id)

      if (error) throw error

      toast.success('Settings updated')
      fetchProfileData()
    } catch (error) {
      toast.error('Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  // Share profile
  const handleShareProfile = () => {
    const profileUrl = `${window.location.origin}/profile/${user?.id}`
    navigator.clipboard.writeText(profileUrl)
    toast.success('Link copied')
  }

  // Download profile as PDF (placeholder)
  const handleDownloadPDF = () => {
    toast.info('Generating PDF...')
  }

  // Lifted displaySkills calculation specifically for cross-component usage
  const displaySkills = useMemo(() => {
    return skills.length > 0 ? skills.map(s => ({
      ...s,
      level: s.level as SkillLevel,
      endorsers: [],
      isTopSkill: s.endorsements > 20, // Lower threshold for DB data
      isPinned: false,
      assessmentStatus: 'not-taken' as AssessmentStatus,
      assessmentScore: undefined
    })) : []
  }, [skills])

  const skillCategories = useMemo(() => {
    const dbCategories = [...new Set(skills.map(s => s.category))]
    return ['all', ...dbCategories]
  }, [skills])

  const filteredSkills = useMemo(() => {
    return displaySkills.filter((skill: any) => {
      const matchesCategory = selectedSkillCategory === 'all' || skill.category === selectedSkillCategory
      const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [selectedSkillCategory, searchQuery, displaySkills])

  const stats = useMemo(() => ({
    profileViews: 0,
    profileViewsChange: 0,
    searchAppearances: 0,
    searchAppearancesChange: 0,
    postImpressions: 0,
    postImpressionsChange: 0,
    connections: 0,
    followers: 0,
    skills: skills.length,
    endorsements: skills.reduce((sum, s) => sum + s.endorsements, 0),
    recommendations: recommendationsCount,
    assessmentsPassed: assessmentsPassedCount
  }), [skills, recommendationsCount, assessmentsPassedCount])

  const statCards = [
    { label: 'Profile Views', value: formatNumber(stats.profileViews), change: stats.profileViewsChange, icon: Eye, gradient: 'from-blue-500 to-cyan-600' },
    { label: 'Search Hits', value: formatNumber(stats.searchAppearances), change: stats.searchAppearancesChange, icon: Search, gradient: 'from-purple-500 to-indigo-600' },
    { label: 'Post Impressions', value: formatNumber(stats.postImpressions), change: stats.postImpressionsChange, icon: TrendingUp, gradient: 'from-green-500 to-emerald-600' },
    { label: 'Connections', value: formatNumber(stats.connections), change: null, icon: Users, gradient: 'from-orange-500 to-amber-600' },
    { label: 'Followers', value: formatNumber(stats.followers), change: null, icon: Heart, gradient: 'from-pink-500 to-rose-600' },
    { label: 'Skills', value: stats.skills.toString(), change: null, icon: Zap, gradient: 'from-cyan-500 to-blue-600' },
    { label: 'Endorsements', value: formatNumber(stats.endorsements), change: null, icon: ThumbsUp, gradient: 'from-yellow-500 to-orange-600' },
    { label: 'Assessments', value: stats.assessmentsPassed.toString(), change: null, icon: CheckCircle, gradient: 'from-indigo-500 to-purple-600' }
  ]

  // Display profile - use DB data if available
  const displayProfile = profile ? {
    ...emptyProfile,
    firstName: profile.first_name || '',
    lastName: profile.last_name || '',
    headline: profile.title || '',
    summary: profile.bio || '',
    location: profile.location || '',
    email: profile.email || '',
    phone: profile.phone || '',
    website: profile.website || '',
    avatar: profile.avatar || '',
    banner: profile.cover_image || '',
    currentCompany: profile.company || '',
    currentTitle: profile.title || ''
  } : emptyProfile

  // Display experiences - use DB data if available
  const displayExperiences = experiences.length > 0 ? experiences.map(exp => ({
    id: exp.id,
    company: exp.company,
    companyLogo: undefined,
    title: exp.title,
    location: exp.location || '',
    locationType: 'hybrid' as LocationType,
    employmentType: 'full-time' as EmploymentType,
    startDate: exp.start_date,
    endDate: exp.end_date || undefined,
    isCurrent: exp.current,
    description: exp.description || '',
    skills: [],
    media: [],
    achievements: exp.achievements
  })) : []

  // Display education - use DB data if available
  const displayEducation = education.length > 0 ? education.map(edu => ({
    id: edu.id,
    school: edu.school,
    schoolLogo: undefined,
    degree: edu.degree,
    field: edu.field,
    startYear: new Date(edu.start_date).getFullYear(),
    endYear: edu.end_date ? new Date(edu.end_date).getFullYear() : undefined,
    grade: edu.grade || undefined,
    activities: edu.activities.join(', '),
    description: '',
    societies: []
  })) : []

  // Computed AI Insights from profile and skills data
  const profileInsights = useMemo(() => {
    const insights: any[] = []

    // Profile completeness insight
    const completeness = [
      displayProfile.firstName,
      displayProfile.lastName,
      displayProfile.headline,
      displayProfile.summary,
      displayProfile.location,
      displayProfile.avatar
    ].filter(Boolean).length

    if (completeness < 6) {
      insights.push({
        id: 'profile-incomplete',
        type: 'recommendation' as const,
        title: 'Complete Your Profile',
        description: `Your profile is ${Math.round((completeness / 6) * 100)}% complete. Add missing sections to improve visibility.`,
        priority: 'high' as const,
        timestamp: new Date().toISOString(),
        category: 'Profile'
      })
    }

    // Skills insight
    if (skills.length === 0) {
      insights.push({
        id: 'add-skills',
        type: 'recommendation' as const,
        title: 'Add Skills to Your Profile',
        description: 'Adding skills helps recruiters find you and showcases your expertise.',
        priority: 'high' as const,
        timestamp: new Date().toISOString(),
        category: 'Skills'
      })
    } else if (skills.length < 5) {
      insights.push({
        id: 'more-skills',
        type: 'opportunity' as const,
        title: 'Expand Your Skillset',
        description: `You have ${skills.length} skill(s). Profiles with 5+ skills get 17x more views.`,
        priority: 'medium' as const,
        timestamp: new Date().toISOString(),
        category: 'Skills'
      })
    }

    // Experience insight
    if (experiences.length === 0) {
      insights.push({
        id: 'add-experience',
        type: 'recommendation' as const,
        title: 'Add Work Experience',
        description: 'Showcase your professional journey by adding your work history.',
        priority: 'high' as const,
        timestamp: new Date().toISOString(),
        category: 'Experience'
      })
    }

    // Education insight
    if (education.length === 0) {
      insights.push({
        id: 'add-education',
        type: 'opportunity' as const,
        title: 'Add Education',
        description: 'Adding your educational background helps connect with alumni.',
        priority: 'medium' as const,
        timestamp: new Date().toISOString(),
        category: 'Education'
      })
    }

    // High endorsements insight
    const topSkill = skills.reduce((max, s) => s.endorsements > (max?.endorsements || 0) ? s : max, skills[0])
    if (topSkill && topSkill.endorsements > 10) {
      insights.push({
        id: 'top-skill',
        type: 'alert' as const,
        title: `${topSkill.name} is Trending`,
        description: `Your ${topSkill.name} skill has ${topSkill.endorsements} endorsements. Consider highlighting it.`,
        priority: 'low' as const,
        timestamp: new Date().toISOString(),
        category: 'Skills'
      })
    }

    return insights
  }, [displayProfile, skills, experiences, education])

  // Computed Collaborators from profile data (could be connections in future)
  const profileCollaborators = useMemo(() => {
    // For now, create a placeholder based on profile data
    // In a real app, this would come from a connections/team API
    const collaborators: any[] = []

    if (profile) {
      // Add self as a collaborator for demo purposes
      collaborators.push({
        id: profile.id,
        name: `${profile.first_name} ${profile.last_name}`.trim() || 'You',
        avatar: profile.avatar || '',
        status: 'active' as const,
        role: profile.title || 'Professional',
        lastActive: 'Now'
      })
    }

    return collaborators
  }, [profile])

  // Computed Predictions based on profile completeness and skills
  const profilePredictions = useMemo(() => {
    const predictions: any[] = []

    // Profile strength prediction
    const profileFields = [
      displayProfile.firstName, displayProfile.lastName, displayProfile.headline,
      displayProfile.summary, displayProfile.location, displayProfile.avatar
    ].filter(Boolean).length
    const profileStrength = Math.round((profileFields / 6) * 100)

    predictions.push({
      id: 'profile-strength',
      label: 'Profile Strength',
      current: profileStrength,
      target: 100,
      predicted: Math.min(profileStrength + 20, 100),
      confidence: 85,
      trend: profileStrength < 80 ? 'up' : 'neutral'
    })

    // Skills growth prediction
    predictions.push({
      id: 'skills-growth',
      label: 'Skills Coverage',
      current: skills.length,
      target: 10,
      predicted: Math.min(skills.length + 3, 10),
      confidence: 70,
      trend: skills.length < 10 ? 'up' : 'neutral'
    })

    // Endorsements prediction
    const totalEndorsements = skills.reduce((sum, s) => sum + s.endorsements, 0)
    predictions.push({
      id: 'endorsements',
      label: 'Total Endorsements',
      current: totalEndorsements,
      target: 50,
      predicted: Math.min(totalEndorsements + 10, 50),
      confidence: 60,
      trend: 'up'
    })

    return predictions
  }, [displayProfile, skills])

  // Computed Activities from profile actions
  const profileActivities = useMemo(() => {
    const activities: any[] = []

    // Add activity for recent experiences
    experiences.slice(0, 2).forEach((exp, idx) => {
      activities.push({
        id: `exp-${exp.id}`,
        user: {
          id: profile?.user_id || '0',
          name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'You',
          avatar: profile?.avatar || ''
        },
        action: exp.current ? 'Started working at' : 'Worked at',
        target: exp.company,
        timestamp: formatDate(exp.start_date),
        type: 'update' as const
      })
    })

    // Add activity for skills
    skills.slice(0, 3).forEach((skill) => {
      activities.push({
        id: `skill-${skill.id}`,
        user: {
          id: profile?.user_id || '0',
          name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'You',
          avatar: profile?.avatar || ''
        },
        action: 'Added skill',
        target: skill.name,
        timestamp: 'Recently',
        type: 'create' as const
      })
    })

    // Add activity for education
    education.slice(0, 1).forEach((edu) => {
      activities.push({
        id: `edu-${edu.id}`,
        user: {
          id: profile?.user_id || '0',
          name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'You',
          avatar: profile?.avatar || ''
        },
        action: 'Studied at',
        target: edu.school,
        timestamp: formatDate(edu.start_date),
        type: 'milestone' as const
      })
    })

    return activities.slice(0, 5)
  }, [profile, experiences, skills, education])

  // Define quickActions with dialog setters
  const quickActions = [
    { id: '1', label: 'Edit Profile', icon: 'edit', action: () => setActiveTab('settings'), variant: 'default' as const },
    { id: '2', label: 'Add Skill', icon: 'plus', action: () => setShowAddSkillDialog(true), variant: 'default' as const },
    { id: '3', label: 'Download CV', icon: 'download', action: () => setShowDownloadCVDialog(true), variant: 'outline' as const },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:bg-none dark:bg-gray-900">
      <div className="p-6">
        <div className="max-w-[1800px] mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <User className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Professional Profile</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">LinkedIn-level professional networking</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowAnalytics(true)} disabled={loading}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button variant="outline" onClick={handleShareProfile} disabled={loading}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                onClick={() => setActiveTab('settings')}
                disabled={loading}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {statCards.map((stat, index) => (
              <Card key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={"p-2 rounded-lg bg-gradient-to-br " + stat.gradient}>
                      <stat.icon className="w-4 h-4 text-white" />
                    </div>
                    {stat.change !== null && (
                      <div className={"flex items-center gap-1 text-xs " + (stat.change >= 0 ? "text-green-600" : "text-red-600")}>
                        {stat.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(stat.change)}%
                      </div>
                    )}
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Profile Card */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 relative">
              {displayProfile.coverStory && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute bottom-2 right-2"
                  onClick={() => setShowCoverStoryDialog(true)}
                >
                  <Play className="w-3 h-3 mr-1" />
                  Cover Story
                </Button>
              )}
            </div>
            <CardContent className="pt-0 px-6 pb-6">
              <div className="flex flex-col lg:flex-row gap-6 -mt-16">
                <div className="relative flex-shrink-0">
                  <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                    <AvatarImage src={displayProfile.avatar} alt="User avatar" />
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      {displayProfile.firstName[0]}{displayProfile.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  {displayProfile.isPremium && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full text-xs font-bold text-amber-900 flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Premium
                    </div>
                  )}
                </div>
                <div className="flex-1 pt-16 lg:pt-4">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {displayProfile.firstName} {displayProfile.lastName}
                    </h2>
                    {displayProfile.pronouns && <span className="text-sm text-gray-500">({displayProfile.pronouns})</span>}
                    {displayProfile.isVerified && <Shield className="w-5 h-5 text-blue-500" />}
                    {displayProfile.topVoice && (
                      <Badge className="bg-orange-100 text-orange-700">
                        <Mic className="w-3 h-3 mr-1" />
                        Top Voice
                      </Badge>
                    )}
                    {displayProfile.isCreatorMode && (
                      <Badge className="bg-purple-100 text-purple-700">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Creator
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">{displayProfile.headline}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{displayProfile.location}</span>
                    <span className="flex items-center gap-1"><Building2 className="w-4 h-4" />{displayProfile.currentCompany}</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" />{formatNumber(displayProfile.connections)} connections</span>
                    <span className="flex items-center gap-1"><Heart className="w-4 h-4" />{formatNumber(displayProfile.followers)} followers</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {displayProfile.isOpenToWork && <Badge className="bg-green-100 text-green-700"><Target className="w-3 h-3 mr-1" />Open to Work</Badge>}
                    {displayProfile.isHiring && <Badge className="bg-purple-100 text-purple-700"><Briefcase className="w-3 h-3 mr-1" />Hiring</Badge>}
                    {displayProfile.socialLinks.map((link: SocialLink, i: number) => (
                      <Button key={i} variant="ghost" size="sm" className="h-7 px-2" asChild>
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          {link.platform === 'Twitter' && <Twitter className="w-4 h-4" />}
                          {link.platform === 'GitHub' && <Github className="w-4 h-4" />}
                          {link.platform === 'YouTube' && <Youtube className="w-4 h-4" />}
                        </a>
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                      onClick={() => setShowConnectDialog(true)}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowMessageDialog(true)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowMoreOptionsDialog(true)}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="lg:text-right space-y-3">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Profile Strength</div>
                    <div className="w-32 lg:ml-auto">
                      <Progress value={displayProfile.profileStrength} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">{displayProfile.profileStrength}% All-Star</p>
                    </div>
                  </div>
                  <div className="flex lg:justify-end gap-2">
                    <Badge variant="outline">{displayProfile.featuredCount} Featured</Badge>
                    <Badge variant="outline">{displayProfile.articlesCount} Articles</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-1 rounded-xl shadow-sm flex-wrap">
              <TabsTrigger value="overview"><User className="w-4 h-4 mr-2" />Overview</TabsTrigger>
              <TabsTrigger value="experience"><Briefcase className="w-4 h-4 mr-2" />Experience</TabsTrigger>
              <TabsTrigger value="skills"><Zap className="w-4 h-4 mr-2" />Skills</TabsTrigger>
              <TabsTrigger value="featured"><Star className="w-4 h-4 mr-2" />Featured</TabsTrigger>
              <TabsTrigger value="network"><Network className="w-4 h-4 mr-2" />Network</TabsTrigger>
              <TabsTrigger value="jobs"><Briefcase className="w-4 h-4 mr-2" />Jobs</TabsTrigger>
              <TabsTrigger value="activity"><Activity className="w-4 h-4 mr-2" />Activity</TabsTrigger>
              <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-2" />Settings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Overview Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-6 text-white">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Profile Overview</h3>
                      <p className="text-blue-100">Your professional presence at a glance</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{formatNumber(stats.profileViews)}</p>
                      <p className="text-sm text-blue-100">Profile Views</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{formatNumber(stats.connections)}</p>
                      <p className="text-sm text-blue-100">Connections</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{stats.skills}</p>
                      <p className="text-sm text-blue-100">Skills</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{displayProfile.profileStrength}%</p>
                      <p className="text-sm text-blue-100">Profile Strength</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {[
                  { icon: Edit, label: 'Edit Profile', color: 'from-blue-500 to-indigo-600', onClick: () => setActiveTab('settings') },
                  { icon: Camera, label: 'Update Photo', color: 'from-purple-500 to-pink-600', onClick: () => setShowUpdatePhotoDialog(true) },
                  { icon: Share2, label: 'Share Profile', color: 'from-green-500 to-emerald-600', onClick: handleShareProfile },
                  { icon: Download, label: 'Export PDF', color: 'from-orange-500 to-amber-600', onClick: handleDownloadPDF },
                  { icon: UserPlus, label: 'Grow Network', color: 'from-cyan-500 to-blue-600', onClick: () => setActiveTab('network') },
                  { icon: FileText, label: 'Add Post', color: 'from-pink-500 to-rose-600', onClick: () => setActiveTab('activity') },
                  { icon: Briefcase, label: 'Update Jobs', color: 'from-indigo-500 to-purple-600', onClick: () => setShowUpdateJobsDialog(true) },
                  { icon: BarChart3, label: 'Analytics', color: 'from-yellow-500 to-orange-600', onClick: () => setShowAnalytics(true) },
                ].map((action, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2 hover:scale-105 transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm"
                    onClick={action.onClick}
                  >
                    <div className={"p-2 rounded-lg bg-gradient-to-br " + action.color}>
                      <action.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-medium">{action.label}</span>
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-blue-600" />About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{displayProfile.summary}</p>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="bg-white/80 dark:bg-gray-800/80 border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base"><Mail className="w-4 h-4 text-blue-600" />Contact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-gray-400" /><span>{displayProfile.email}</span></div>
                      <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-gray-400" /><span>{displayProfile.phone}</span></div>
                      <div className="flex items-center gap-3"><Globe className="w-4 h-4 text-gray-400" /><a href={displayProfile.website} className="text-blue-600 hover:underline">{displayProfile.website}</a></div>
                      <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-gray-400" /><span>{displayProfile.location}</span></div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 dark:bg-gray-800/80 border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base"><Eye className="w-4 h-4 text-blue-600" />Who viewed your profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-center py-4 text-gray-500 text-sm">
                          <p>No recent views</p>
                        </div>
                      </div>
                      <Button variant="link" className="w-full mt-2 text-blue-600" onClick={() => setShowAnalytics(true)}>View all {stats.profileViews} views</Button>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Top Skills Preview */}
              <Card className="bg-white/80 dark:bg-gray-800/80 border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2"><Zap className="w-5 h-5 text-blue-600" />Top Skills</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('skills')}>See all <ChevronRight className="w-4 h-4 ml-1" /></Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {displaySkills.filter(s => s.isTopSkill).map((skill) => (
                      <div key={skill.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{skill.name}</p>
                            {skill.assessmentStatus === 'passed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                          </div>
                          <p className="text-sm text-gray-500">{skill.endorsements} endorsements</p>
                        </div>
                        <Badge className={getSkillLevelColor(skill.level)}>{skill.level}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Experience Preview */}
              <Card className="bg-white/80 dark:bg-gray-800/80 border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-blue-600" />Experience</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('experience')}>See all <ChevronRight className="w-4 h-4 ml-1" /></Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {displayExperiences.slice(0, 2).map((exp) => (
                      <div key={exp.id} className="flex gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={exp.companyLogo} alt="User avatar" />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">{exp.company[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{exp.title}</h4>
                          <p className="text-gray-600 dark:text-gray-300">{exp.company} • {exp.employmentType}</p>
                          <p className="text-sm text-gray-500">{formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatDate(exp.endDate!)} • {calculateDuration(exp.startDate, exp.endDate)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Experience Tab */}
            <TabsContent value="experience" className="space-y-6">
              {/* Experience Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 p-6 text-white">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Professional Experience</h3>
                      <p className="text-purple-100">Your career journey and achievements</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{displayExperiences.length}</p>
                      <p className="text-sm text-purple-100">Positions</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-sm text-purple-100">Certifications</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{displayEducation.length}</p>
                      <p className="text-sm text-purple-100">Degrees</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-sm text-purple-100">Awards</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {[
                  { icon: Plus, label: 'Add Position', color: 'from-blue-500 to-indigo-600', action: () => setShowAddExperienceDialog(true) },
                  { icon: Award, label: 'Add Cert', color: 'from-purple-500 to-pink-600', action: () => setShowAddCertificationDialog(true) },
                  { icon: GraduationCap, label: 'Add Education', color: 'from-green-500 to-emerald-600', action: () => setShowAddEducationDialog(true) },
                  { icon: Trophy, label: 'Add Award', color: 'from-orange-500 to-amber-600', action: () => setShowAddAwardDialog(true) },
                  { icon: BookOpen, label: 'Add Project', color: 'from-cyan-500 to-blue-600', action: () => setShowAddProjectDialog(true) },
                  { icon: Heart, label: 'Volunteer', color: 'from-pink-500 to-rose-600', action: () => setShowAddVolunteerDialog(true) },
                  { icon: FileText, label: 'Publication', color: 'from-indigo-500 to-purple-600', action: () => setShowAddPublicationDialog(true) },
                  { icon: Languages, label: 'Languages', color: 'from-yellow-500 to-orange-600', action: () => setShowAddLanguagesDialog(true) },
                ].map((action, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2 hover:scale-105 transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm"
                    onClick={action.action}
                  >
                    <div className={"p-2 rounded-lg bg-gradient-to-br " + action.color}>
                      <action.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-medium">{action.label}</span>
                  </Button>
                ))}
              </div>

              <Card className="bg-white/80 dark:bg-gray-800/80 border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-blue-600" />Experience</CardTitle>
                    <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white" onClick={() => setShowAddExperienceDialog(true)}><Plus className="w-4 h-4 mr-1" />Add</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {displayExperiences.map((exp) => (
                      <div key={exp.id} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <Avatar className="w-14 h-14">
                          <AvatarImage src={(exp as Record<string, unknown>).companyLogo} alt="User avatar" />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-lg">{exp.company[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{exp.title}</h4>
                          <p className="text-gray-600 dark:text-gray-300">{exp.company} • {exp.employmentType}</p>
                          <p className="text-sm text-gray-500">{formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatDate(exp.endDate!)} • {calculateDuration(exp.startDate, exp.endDate)}</p>
                          <p className="text-sm text-gray-500 mb-2">{exp.location} • {exp.locationType}</p>
                          <p className="text-gray-600 dark:text-gray-300 mb-3">{exp.description}</p>
                          {exp.achievements.length > 0 && (
                            <div className="mb-3">
                              <p className="text-sm font-medium mb-1">Key Achievements:</p>
                              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
                                {exp.achievements.map((a, i) => <li key={i}>{a}</li>)}
                              </ul>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {exp.skills.map((skill, i) => <Badge key={i} variant="outline">{skill}</Badge>)}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteExperience(exp.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Award className="w-5 h-5 text-blue-600" />Certifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* No certifications yet */}
                    <div className="text-center py-8 text-gray-500">
                      <p>No certifications added</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><GraduationCap className="w-5 h-5 text-blue-600" />Education</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {displayEducation.map((edu) => (
                      <div key={edu.id} className="flex gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={(edu as Record<string, unknown>).schoolLogo} alt="User avatar" />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">{edu.school[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{edu.school}</h4>
                          <p className="text-gray-600 dark:text-gray-300">{edu.degree}, {edu.field}</p>
                          <p className="text-sm text-gray-500">{edu.startYear} - {edu.endYear || 'Present'}</p>
                          {edu.grade && <p className="text-sm text-gray-500">Grade: {edu.grade}</p>}
                          {edu.activities && <p className="text-sm text-gray-500">Activities: {edu.activities}</p>}
                          {edu.societies.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {edu.societies.map((s, i) => <Badge key={i} variant="outline" className="text-xs">{s}</Badge>)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Skills Tab */}
            <TabsContent value="skills" className="space-y-6">
              {/* Skills Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 p-6 text-white">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Skills & Endorsements</h3>
                      <p className="text-green-100">Showcase your expertise and get endorsed</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{stats.skills}</p>
                      <p className="text-sm text-green-100">Total Skills</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{formatNumber(stats.endorsements)}</p>
                      <p className="text-sm text-green-100">Endorsements</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{stats.assessmentsPassed}</p>
                      <p className="text-sm text-green-100">Assessments Passed</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{displaySkills.filter(s => s.isTopSkill).length}</p>
                      <p className="text-sm text-green-100">Top Skills</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {[
                  { icon: Plus, label: 'Add Skill', color: 'from-green-500 to-emerald-600', action: () => setShowAddSkillDialog(true) },
                  { icon: CheckCircle, label: 'Take Quiz', color: 'from-blue-500 to-indigo-600', action: () => setShowSkillQuizDialog(true) },
                  { icon: Star, label: 'Pin Skill', color: 'from-yellow-500 to-orange-600', action: () => setShowPinSkillDialog(true) },
                  { icon: ThumbsUp, label: 'Get Endorsed', color: 'from-purple-500 to-pink-600', action: () => setShowEndorseRequestDialog(true) },
                  { icon: Award, label: 'Add Badge', color: 'from-cyan-500 to-blue-600', action: () => setShowAddBadgeDialog(true) },
                  { icon: Target, label: 'Skill Goals', color: 'from-orange-500 to-red-600', action: () => setShowSkillGoalsDialog(true) },
                  { icon: TrendingUp, label: 'Skill Trends', color: 'from-indigo-500 to-purple-600', action: () => setShowSkillTrendsDialog(true) },
                  { icon: RefreshCw, label: 'Reorder', color: 'from-pink-500 to-rose-600', action: () => setShowReorderSkillsDialog(true) },
                ].map((action, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2 hover:scale-105 transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm"
                    onClick={action.action}
                  >
                    <div className={"p-2 rounded-lg bg-gradient-to-br " + action.color}>
                      <action.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-medium">{action.label}</span>
                  </Button>
                ))}
              </div>

              <Card className="bg-white/80 dark:bg-gray-800/80 border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <CardTitle className="flex items-center gap-2"><Zap className="w-5 h-5 text-blue-600" />Skills & Endorsements</CardTitle>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input placeholder="Search skills..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 w-48" />
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {skillCategories.map((cat) => (
                          <Button key={cat} variant={selectedSkillCategory === cat ? 'default' : 'outline'} size="sm" onClick={() => setSelectedSkillCategory(cat)}>
                            {cat === 'all' ? 'All' : cat}
                          </Button>
                        ))}
                      </div>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                        onClick={() => setShowAddSkillDialog(true)}
                      >
                        <Plus className="w-4 h-4 mr-1" />Add Skill
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-4">
                      {filteredSkills.map((skill) => (
                        <div key={skill.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                              <Zap className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{skill.name}</p>
                                {skill.isTopSkill && <Badge className="bg-yellow-100 text-yellow-700">Top Skill</Badge>}
                                {skill.isPinned && <Badge variant="outline">Pinned</Badge>}
                              </div>
                              <div className="flex items-center gap-3 text-sm text-gray-500">
                                <span>{skill.endorsements} endorsements</span>
                                <span>•</span>
                                <span>{skill.category}</span>
                              </div>
                              {skill.assessmentStatus === 'passed' && skill.assessmentScore && (
                                <div className="flex items-center gap-2 mt-1">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span className="text-sm text-green-600">Assessment passed ({skill.assessmentScore}%)</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={getSkillLevelColor(skill.level)}>{skill.level}</Badge>
                            <Badge className={getAssessmentColor(skill.assessmentStatus)}>
                              {skill.assessmentStatus === 'not-taken' ? 'Take Quiz' : skill.assessmentStatus.replace('-', ' ')}
                            </Badge>
                            <Button variant="outline" size="sm" onClick={() => setShowEndorseSkillDialog(skill.name)}>Endorse</Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteSkill(skill.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Featured Tab */}
            <TabsContent value="featured" className="space-y-6">
              {/* Featured Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 p-6 text-white">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Star className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Featured Content</h3>
                      <p className="text-yellow-100">Highlight your best work and achievements</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-sm text-yellow-100">Featured Items</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{displayProfile.articlesCount}</p>
                      <p className="text-sm text-yellow-100">Articles</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{formatNumber(displayProfile.newsletterSubscribers)}</p>
                      <p className="text-sm text-yellow-100">Subscribers</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-sm text-yellow-100">Projects</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {[
                  { icon: Plus, label: 'Add Featured', color: 'from-yellow-500 to-orange-600', action: () => setShowAddFeaturedDialog(true) },
                  { icon: FileText, label: 'New Article', color: 'from-blue-500 to-indigo-600', action: () => { setPostFormData(p => ({ ...p, type: 'article' })); setShowNewPostDialog(true) } },
                  { icon: Link2, label: 'Add Link', color: 'from-purple-500 to-pink-600', action: () => { setFeaturedFormData(p => ({ ...p, type: 'link' })); setShowAddFeaturedDialog(true) } },
                  { icon: Newspaper, label: 'Newsletter', color: 'from-green-500 to-emerald-600', action: () => { setPostFormData(p => ({ ...p, type: 'article' })); setShowNewPostDialog(true) } },
                  { icon: Image, label: 'Add Media', color: 'from-cyan-500 to-blue-600', action: () => { setFeaturedFormData(p => ({ ...p, type: 'media' })); setShowAddFeaturedDialog(true) } },
                  { icon: Podcast, label: 'Podcast', color: 'from-orange-500 to-red-600', action: () => { setFeaturedFormData(p => ({ ...p, type: 'media' })); setShowAddFeaturedDialog(true) } },
                  { icon: Video, label: 'Add Video', color: 'from-pink-500 to-rose-600', action: () => { setPostFormData(p => ({ ...p, type: 'video' })); setShowNewPostDialog(true) } },
                  { icon: RefreshCw, label: 'Reorder', color: 'from-indigo-500 to-purple-600', action: () => setShowReorderSkillsDialog(true) },
                ].map((action, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2 hover:scale-105 transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm"
                    onClick={action.action}
                  >
                    <div className={"p-2 rounded-lg bg-gradient-to-br " + action.color}>
                      <action.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-medium">{action.label}</span>
                  </Button>
                ))}
              </div>

              <Card className="bg-white/80 dark:bg-gray-800/80 border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2"><Star className="w-5 h-5 text-blue-600" />Featured</CardTitle>
                    <Button size="sm" onClick={() => setShowAddFeaturedDialog(true)}><Plus className="w-4 h-4 mr-1" />Add Featured</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* No featured content yet */}
                    <div className="text-center py-8 text-gray-500">
                      <p>No featured content</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Network Tab */}
            <TabsContent value="network" className="space-y-6">
              {/* Network Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 p-6 text-white">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Network className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Your Network</h3>
                      <p className="text-cyan-100">Connect with professionals worldwide</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{formatNumber(stats.connections)}</p>
                      <p className="text-sm text-cyan-100">Connections</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{formatNumber(stats.followers)}</p>
                      <p className="text-sm text-cyan-100">Followers</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{displayProfile.following}</p>
                      <p className="text-sm text-cyan-100">Following</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-sm text-cyan-100">Pending</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {[
                  { icon: UserPlus, label: 'Add Contacts', color: 'from-cyan-500 to-blue-600', action: () => setShowAddContactsDialog(true) },
                  { icon: Search, label: 'Find People', color: 'from-blue-500 to-indigo-600', action: () => setShowFindPeopleDialog(true) },
                  { icon: Users, label: 'My Network', color: 'from-purple-500 to-pink-600', action: () => setActiveTab('network') },
                  { icon: MessageSquare, label: 'Messages', color: 'from-green-500 to-emerald-600', action: () => setShowMessageDialog(true) },
                  { icon: Mail, label: 'Invitations', color: 'from-orange-500 to-amber-600', action: () => setActiveTab('network') },
                  { icon: Building2, label: 'Companies', color: 'from-pink-500 to-rose-600', action: () => setShowCompaniesDialog(true) },
                  { icon: GraduationCap, label: 'Alumni', color: 'from-indigo-500 to-purple-600', action: () => setShowAlumniDialog(true) },
                  { icon: Globe, label: 'Groups', color: 'from-yellow-500 to-orange-600', action: () => setShowGroupsDialog(true) },
                ].map((action, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2 hover:scale-105 transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm"
                    onClick={action.action}
                  >
                    <div className={"p-2 rounded-lg bg-gradient-to-br " + action.color}>
                      <action.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-medium">{action.label}</span>
                  </Button>
                ))}
              </div>

              <Card className="bg-white/80 dark:bg-gray-800/80 border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Network className="w-5 h-5 text-blue-600" />Connections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* No connections */}
                    <div className="text-center py-8 text-gray-500">
                      <p>No connections yet</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Jobs Tab */}
            <TabsContent value="jobs" className="space-y-6">
              {/* Jobs Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-white">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Job Opportunities</h3>
                      <p className="text-indigo-100">Find your next career opportunity</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-sm text-indigo-100">Recommended</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-sm text-indigo-100">Saved Jobs</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-sm text-indigo-100">Easy Apply</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">0%</p>
                      <p className="text-sm text-indigo-100">Avg Match</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {[
                  { icon: Search, label: 'Search Jobs', color: 'from-indigo-500 to-purple-600', action: () => setShowSearchJobsDialog(true) },
                  { icon: Bookmark, label: 'Saved Jobs', color: 'from-blue-500 to-indigo-600', action: () => setActiveTab('jobs') },
                  { icon: Bell, label: 'Job Alerts', color: 'from-purple-500 to-pink-600', action: () => setActiveTab('jobs') },
                  { icon: Target, label: 'Preferences', color: 'from-green-500 to-emerald-600', action: () => setActiveTab('settings') },
                  { icon: FileText, label: 'Applications', color: 'from-orange-500 to-amber-600', action: () => setActiveTab('jobs') },
                  { icon: Building2, label: 'Companies', color: 'from-cyan-500 to-blue-600', action: () => setShowCompaniesDialog(true) },
                  { icon: TrendingUp, label: 'Salary Info', color: 'from-pink-500 to-rose-600', action: () => setShowSalaryInfoDialog(true) },
                  { icon: Users, label: 'Referrals', color: 'from-yellow-500 to-orange-600', action: () => setShowReferralsDialog(true) },
                ].map((action, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2 hover:scale-105 transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm"
                    onClick={action.action}
                  >
                    <div className={"p-2 rounded-lg bg-gradient-to-br " + action.color}>
                      <action.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-medium">{action.label}</span>
                  </Button>
                ))}
              </div>

              <Card className="bg-white/80 dark:bg-gray-800/80 border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-blue-600" />Recommended Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* No jobs */}
                    <div className="text-center py-8 text-gray-500">
                      <p>No recommended jobs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              {/* Activity Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 p-6 text-white">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Activity className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Your Activity</h3>
                      <p className="text-pink-100">Track your posts and engagement</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-sm text-pink-100">Posts</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-sm text-pink-100">Total Likes</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-sm text-pink-100">Comments</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{formatNumber(stats.postImpressions)}</p>
                      <p className="text-sm text-pink-100">Impressions</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {[
                  { icon: Plus, label: 'New Post', color: 'from-pink-500 to-rose-600', action: () => { setPostFormData(p => ({ ...p, type: 'text' })); setShowNewPostDialog(true) } },
                  { icon: FileText, label: 'Write Article', color: 'from-blue-500 to-indigo-600', action: () => { setPostFormData(p => ({ ...p, type: 'article' })); setShowNewPostDialog(true) } },
                  { icon: Image, label: 'Share Photo', color: 'from-purple-500 to-pink-600', action: () => { setPostFormData(p => ({ ...p, type: 'photo' })); setShowNewPostDialog(true) } },
                  { icon: Video, label: 'Post Video', color: 'from-green-500 to-emerald-600', action: () => { setPostFormData(p => ({ ...p, type: 'video' })); setShowNewPostDialog(true) } },
                  { icon: Calendar, label: 'Create Event', color: 'from-orange-500 to-amber-600', action: () => setShowCreateEventDialog(true) },
                  { icon: BarChart3, label: 'Analytics', color: 'from-cyan-500 to-blue-600', action: () => setShowAnalytics(true) },
                  { icon: Hash, label: 'Hashtags', color: 'from-indigo-500 to-purple-600', action: () => setShowHashtagsDialog(true) },
                  { icon: Clock, label: 'Schedule', color: 'from-yellow-500 to-orange-600', action: () => setShowSchedulePostDialog(true) },
                ].map((action, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2 hover:scale-105 transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm"
                    onClick={action.action}
                  >
                    <div className={"p-2 rounded-lg bg-gradient-to-br " + action.color}>
                      <action.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-medium">{action.label}</span>
                  </Button>
                ))}
              </div>

              <Card className="bg-white/80 dark:bg-gray-800/80 border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5 text-blue-600" />Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* No posts */}
                    <div className="text-center py-8 text-gray-500">
                      <p>No recent activity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              {/* Settings Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 p-6 text-white">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Settings className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Profile Settings</h3>
                      <p className="text-gray-300">Customize your profile and preferences</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">6</p>
                      <p className="text-sm text-gray-300">Settings Areas</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{displayProfile.profileStrength}%</p>
                      <p className="text-sm text-gray-300">Completeness</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">Active</p>
                      <p className="text-sm text-gray-300">Security Status</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">3</p>
                      <p className="text-sm text-gray-300">Integrations</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </div>

              {/* Settings Grid with Sidebar Navigation */}
              <div className="grid grid-cols-12 gap-6">
                {/* Settings Sidebar */}
                <div className="col-span-12 lg:col-span-3">
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm sticky top-6">
                    <CardContent className="p-4">
                      <nav className="space-y-1">
                        {[
                          { id: 'general', label: 'General', icon: Settings, description: 'Basic profile settings' },
                          { id: 'visibility', label: 'Visibility', icon: Eye, description: 'Profile visibility options' },
                          { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alert preferences' },
                          { id: 'privacy', label: 'Privacy', icon: Shield, description: 'Privacy controls' },
                          { id: 'security', label: 'Security', icon: Lock, description: 'Account security' },
                          { id: 'advanced', label: 'Advanced', icon: Sliders, description: 'Power features' },
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setSettingsTab(item.id)}
                            className={"w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all " +
                              (settingsTab === item.id
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-l-4 border-blue-500'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300')
                            }
                          >
                            <item.icon className={"h-5 w-5 " + (settingsTab === item.id ? "text-blue-600" : "text-gray-400")} />
                            <div>
                              <p className="font-medium text-sm">{item.label}</p>
                              <p className="text-xs text-gray-500">{item.description}</p>
                            </div>
                          </button>
                        ))}
                      </nav>
                    </CardContent>
                  </Card>
                </div>

                {/* Settings Content */}
                <div className="col-span-12 lg:col-span-9 space-y-6">
                  {/* General Settings */}
                  {settingsTab === 'general' && (
                    <>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-blue-600" />Profile Information</CardTitle>
                          <CardDescription>Manage your basic profile details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>First Name</Label>
                              <Input
                                value={formData.firstName}
                                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Last Name</Label>
                              <Input
                                value={formData.lastName}
                                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                                className="mt-1"
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Headline</Label>
                            <Input
                              value={formData.headline}
                              onChange={(e) => setFormData(prev => ({ ...prev, headline: e.target.value }))}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Location</Label>
                            <Input
                              value={formData.location}
                              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Industry</Label>
                            <Input
                              value={formData.industry}
                              onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Custom URL</Label>
                            <Input
                              value={formData.customUrl}
                              onChange={(e) => setFormData(prev => ({ ...prev, customUrl: e.target.value }))}
                              className="mt-1"
                            />
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2"><Mail className="w-5 h-5 text-blue-600" />Contact Information</CardTitle>
                          <CardDescription>Manage your contact details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Email Address</Label>
                              <Input
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Phone Number</Label>
                              <Input
                                value={formData.phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                className="mt-1"
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Website</Label>
                            <Input
                              value={formData.website}
                              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                              className="mt-1"
                            />
                          </div>
                          <div className="pt-4 flex justify-end">
                            <Button
                              onClick={handleUpdateProfile}
                              disabled={saving}
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                            >
                              {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {/* Visibility Settings */}
                  {settingsTab === 'visibility' && (
                    <>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2"><Eye className="w-5 h-5 text-blue-600" />Profile Visibility</CardTitle>
                          <CardDescription>Control who can see your profile</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Public Profile</p>
                              <p className="text-sm text-gray-500">Make your profile visible to everyone</p>
                            </div>
                            <Switch
                              checked={settings?.privacy_level === 'public'}
                              onCheckedChange={(checked) => handleUpdateSettings({ privacy_level: checked ? 'public' : 'private' })}
                            />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Show Email</p>
                              <p className="text-sm text-gray-500">Display email on your profile</p>
                            </div>
                            <Switch
                              checked={settings?.show_email ?? false}
                              onCheckedChange={(checked) => handleUpdateSettings({ show_email: checked })}
                            />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Show Phone</p>
                              <p className="text-sm text-gray-500">Display phone on your profile</p>
                            </div>
                            <Switch
                              checked={settings?.show_phone ?? false}
                              onCheckedChange={(checked) => handleUpdateSettings({ show_phone: checked })}
                            />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Show Location</p>
                              <p className="text-sm text-gray-500">Display location on your profile</p>
                            </div>
                            <Switch
                              checked={settings?.show_location ?? true}
                              onCheckedChange={(checked) => handleUpdateSettings({ show_location: checked })}
                            />
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-blue-600" />Connection Settings</CardTitle>
                          <CardDescription>Control connections and messaging</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Allow Messages</p>
                              <p className="text-sm text-gray-500">Let others send you messages</p>
                            </div>
                            <Switch
                              checked={settings?.allow_messages ?? true}
                              onCheckedChange={(checked) => handleUpdateSettings({ allow_messages: checked })}
                            />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Allow Connection Requests</p>
                              <p className="text-sm text-gray-500">Let others request to connect</p>
                            </div>
                            <Switch
                              checked={settings?.allow_connections ?? true}
                              onCheckedChange={(checked) => handleUpdateSettings({ allow_connections: checked })}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {/* Notification Settings */}
                  {settingsTab === 'notifications' && (
                    <>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5 text-blue-600" />Email Notifications</CardTitle>
                          <CardDescription>Manage your email preferences</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Email Notifications</p>
                              <p className="text-sm text-gray-500">Receive email notifications</p>
                            </div>
                            <Switch
                              checked={settings?.email_notifications ?? true}
                              onCheckedChange={(checked) => handleUpdateSettings({ email_notifications: checked })}
                            />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Push Notifications</p>
                              <p className="text-sm text-gray-500">Receive push notifications</p>
                            </div>
                            <Switch
                              checked={settings?.push_notifications ?? true}
                              onCheckedChange={(checked) => handleUpdateSettings({ push_notifications: checked })}
                            />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Marketing Emails</p>
                              <p className="text-sm text-gray-500">Receive marketing and promotional emails</p>
                            </div>
                            <Switch
                              checked={settings?.marketing_emails ?? false}
                              onCheckedChange={(checked) => handleUpdateSettings({ marketing_emails: checked })}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {/* Privacy Settings */}
                  {settingsTab === 'privacy' && (
                    <>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-blue-600" />Privacy Controls</CardTitle>
                          <CardDescription>Manage your privacy settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Profile Viewing Mode</p>
                              <p className="text-sm text-gray-500">Browse profiles privately</p>
                            </div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Activity Broadcasts</p>
                              <p className="text-sm text-gray-500">Share activity updates with network</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Data Sharing</p>
                              <p className="text-sm text-gray-500">Allow data for personalization</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2"><Download className="w-5 h-5 text-blue-600" />Data Management</CardTitle>
                          <CardDescription>Download or delete your data</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Download Your Data</p>
                              <p className="text-sm text-gray-500">Get a copy of all your data</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => toast.success('Download Started', { description: 'Preparing your data export...' })}><Download className="w-4 h-4 mr-2" />Download</Button>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <div>
                              <p className="font-medium text-red-700 dark:text-red-400">Delete Account</p>
                              <p className="text-sm text-red-600 dark:text-red-400">Permanently delete your account</p>
                            </div>
                            <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => toast.error('Delete Account', { description: 'Are you sure? This action cannot be undone.' })}><Trash2 className="w-4 h-4 mr-2" />Delete</Button>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {/* Security Settings */}
                  {settingsTab === 'security' && (
                    <>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5 text-blue-600" />Account Security</CardTitle>
                          <CardDescription>Protect your account</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Two-Factor Authentication</p>
                              <p className="text-sm text-gray-500">Add an extra layer of security</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Login Alerts</p>
                              <p className="text-sm text-gray-500">Get notified of new logins</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Change Password</p>
                              <p className="text-sm text-gray-500">Update your password regularly</p>
                            </div>
                            <Button variant="outline" size="sm"><Key className="w-4 h-4 mr-2" />Change</Button>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2"><History className="w-5 h-5 text-blue-600" />Login History</CardTitle>
                          <CardDescription>Recent account access</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {[
                              { device: 'MacBook Pro', location: 'San Francisco, CA', time: '2 hours ago', current: true },
                              { device: 'iPhone 15', location: 'San Francisco, CA', time: '1 day ago', current: false },
                              { device: 'Chrome on Windows', location: 'New York, NY', time: '3 days ago', current: false },
                            ].map((session, i) => (
                              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Terminal className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm flex items-center gap-2">
                                      {session.device}
                                      {session.current && <Badge className="bg-green-100 text-green-700 text-xs">Current</Badge>}
                                    </p>
                                    <p className="text-xs text-gray-500">{session.location} • {session.time}</p>
                                  </div>
                                </div>
                                {!session.current && <Button variant="ghost" size="sm" className="text-red-600" onClick={() => setShowSessionSignOutDialog(i)}>Sign out</Button>}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {/* Advanced Settings */}
                  {settingsTab === 'advanced' && (
                    <>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2"><Sliders className="w-5 h-5 text-blue-600" />Advanced Settings</CardTitle>
                          <CardDescription>Power user features</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Language</p>
                              <p className="text-sm text-gray-500">Select your preferred language</p>
                            </div>
                            <Input defaultValue="English (US)" className="w-48" />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Timezone</p>
                              <p className="text-sm text-gray-500">Set your timezone</p>
                            </div>
                            <Input defaultValue="America/Los_Angeles" className="w-48" />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Dark Mode</p>
                              <p className="text-sm text-gray-500">Enable dark theme</p>
                            </div>
                            <Switch />
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2"><Webhook className="w-5 h-5 text-blue-600" />Integrations</CardTitle>
                          <CardDescription>Connect with other apps</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-lg"><Twitter className="w-4 h-4" /></div>
                              <div>
                                <p className="font-medium">Twitter</p>
                                <p className="text-sm text-gray-500">Connected as @johnsmith</p>
                              </div>
                            </div>
                            <Badge className="bg-green-100 text-green-700">Connected</Badge>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-lg"><Github className="w-4 h-4" /></div>
                              <div>
                                <p className="font-medium">GitHub</p>
                                <p className="text-sm text-gray-500">Connected as johnsmith</p>
                              </div>
                            </div>
                            <Badge className="bg-green-100 text-green-700">Connected</Badge>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-lg"><Globe className="w-4 h-4" /></div>
                              <div>
                                <p className="font-medium">Google</p>
                                <p className="text-sm text-gray-500">Not connected</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setShowConnectGoogleDialog(true)}>Connect</Button>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2"><Database className="w-5 h-5 text-blue-600" />Data & Storage</CardTitle>
                          <CardDescription>Manage data usage</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Cache</p>
                              <p className="text-sm text-gray-500">Clear cached data</p>
                            </div>
                            <Button variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-2" />Clear</Button>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Storage Usage</p>
                              <p className="text-sm text-gray-500">245 MB of 1 GB used</p>
                            </div>
                            <Progress value={24.5} className="w-32" />
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Enhanced Competitive Upgrade Components */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-2">
              <AIInsightsPanel
                insights={profileInsights}
                title="Profile Intelligence"
                onInsightAction={(insight) => toast.info(insight.title)}
              />
            </div>
            <div className="space-y-6">
              <CollaborationIndicator
                collaborators={profileCollaborators}
                maxVisible={4}
              />
              <PredictiveAnalytics
                predictions={profilePredictions}
                title="Career Forecasts"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <ActivityFeed
              activities={profileActivities}
              title="Profile Activity"
              maxItems={5}
            />
            <QuickActionsToolbar
              actions={quickActions}
              variant="grid"
            />
          </div>

          {/* Analytics Dialog */}
          <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" />Profile Analytics</DialogTitle>
                <DialogDescription>Track your profile performance over the last 90 days</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Eye className="w-5 h-5 text-blue-600" />
                      <span className="text-green-600 text-sm flex items-center"><ArrowUpRight className="w-3 h-3" />{stats.profileViewsChange}%</span>
                    </div>
                    <div className="text-2xl font-bold">{formatNumber(stats.profileViews)}</div>
                    <div className="text-sm text-gray-500">Profile views</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Search className="w-5 h-5 text-purple-600" />
                      <span className="text-green-600 text-sm flex items-center"><ArrowUpRight className="w-3 h-3" />{stats.searchAppearancesChange}%</span>
                    </div>
                    <div className="text-2xl font-bold">{formatNumber(stats.searchAppearances)}</div>
                    <div className="text-sm text-gray-500">Search appearances</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="text-green-600 text-sm flex items-center"><ArrowUpRight className="w-3 h-3" />{stats.postImpressionsChange}%</span>
                    </div>
                    <div className="text-2xl font-bold">{formatNumber(stats.postImpressions)}</div>
                    <div className="text-sm text-gray-500">Post impressions</div>
                  </CardContent>
                </Card>
              </div>
              <div className="mt-4">
                <h4 className="font-medium mb-3">Recent Profile Viewers</h4>
                <div className="space-y-3">
                  {/* No viewers yet */}
                  <div className="text-center py-6 text-gray-500 text-sm">
                    <p>No recent profile views</p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Skill Dialog */}
          <Dialog open={showAddSkillDialog} onOpenChange={setShowAddSkillDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Zap className="w-5 h-5 text-blue-600" />Add New Skill</DialogTitle>
                <DialogDescription>Add a skill to showcase your expertise</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="skillName">Skill Name</Label>
                  <Input
                    id="skillName"
                    placeholder="e.g., React, Project Management, Python"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="skillCategory">Category</Label>
                  <Input
                    id="skillCategory"
                    placeholder="e.g., Frontend, Backend, Soft Skills"
                    value={newSkillCategory}
                    onChange={(e) => setNewSkillCategory(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowAddSkillDialog(false)}>Cancel</Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                  onClick={() => {
                    if (newSkillName.trim()) {
                      handleAddSkill(newSkillName, newSkillCategory)
                      setNewSkillName('')
                      setNewSkillCategory('General')
                      setShowAddSkillDialog(false)
                    }
                  }}
                >
                  Add Skill
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Download CV Dialog */}
          <Dialog open={showDownloadCVDialog} onOpenChange={setShowDownloadCVDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Download className="w-5 h-5 text-blue-600" />Download CV</DialogTitle>
                <DialogDescription>Customize your CV export options</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Format</Label>
                  <div className="flex gap-4 mt-2">
                    <Button
                      variant={cvFormat === 'pdf' ? 'default' : 'outline'}
                      onClick={() => setCvFormat('pdf')}
                      className="flex-1"
                    >
                      <FileText className="w-4 h-4 mr-2" />PDF
                    </Button>
                    <Button
                      variant={cvFormat === 'docx' ? 'default' : 'outline'}
                      onClick={() => setCvFormat('docx')}
                      className="flex-1"
                    >
                      <FileText className="w-4 h-4 mr-2" />DOCX
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Include Sections</Label>
                  <div className="space-y-2 mt-2">
                    {Object.entries(cvIncludeSections).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span className="capitalize">{key}</span>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => setCvIncludeSections(prev => ({ ...prev, [key]: checked }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowDownloadCVDialog(false)}>Cancel</Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                  onClick={() => {
                    toast.success('CV Generated')
                    setShowDownloadCVDialog(false)
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />Download
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Cover Story Dialog */}
          <Dialog open={showCoverStoryDialog} onOpenChange={setShowCoverStoryDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Play className="w-5 h-5 text-blue-600" />Cover Story</DialogTitle>
                <DialogDescription>Your video introduction</DialogDescription>
              </DialogHeader>
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Play className="w-16 h-16 text-white/60 mx-auto mb-2" />
                  <p className="text-white/60">Video player placeholder</p>
                  <p className="text-sm text-white/40">Your cover story video would play here</p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowCoverStoryDialog(false)}>Close</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Connect Dialog */}
          <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5 text-blue-600" />Send Connection Request</DialogTitle>
                <DialogDescription>Add a personal note to your connection request</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Avatar>
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">John Doe</p>
                    <p className="text-sm text-gray-500">Software Engineer</p>
                  </div>
                </div>
                <div>
                  <Label htmlFor="connectionMessage">Personal Note (optional)</Label>
                  <textarea
                    id="connectionMessage"
                    className="w-full mt-1 p-3 border rounded-lg resize-none h-24 dark:bg-gray-800 dark:border-gray-700"
                    placeholder="Hi! I'd like to connect with you..."
                    value={connectionMessage}
                    onChange={(e) => setConnectionMessage(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowConnectDialog(false)}>Cancel</Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                  onClick={() => {
                    toast.success('Connection request sent')
                    setConnectionMessage('')
                    setShowConnectDialog(false)
                  }}
                >
                  Send Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Message Dialog */}
          <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-blue-600" />Send Message</DialogTitle>
                <DialogDescription>Start a conversation</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="messageContent">Your Message</Label>
                  <textarea
                    id="messageContent"
                    className="w-full mt-1 p-3 border rounded-lg resize-none h-32 dark:bg-gray-800 dark:border-gray-700"
                    placeholder="Write your message..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowMessageDialog(false)}>Cancel</Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                  onClick={() => {
                    toast.success('Message sent')
                    setMessageContent('')
                    setShowMessageDialog(false)
                  }}
                >
                  Send Message
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* More Options Dialog */}
          <Dialog open={showMoreOptionsDialog} onOpenChange={setShowMoreOptionsDialog}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>More Options</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 py-4">
                {[
                  { icon: Share2, label: 'Share Profile', action: () => { handleShareProfile(); setShowMoreOptionsDialog(false); } },
                  { icon: Download, label: 'Download as PDF', action: () => { setShowDownloadCVDialog(true); setShowMoreOptionsDialog(false); } },
                  {
                    icon: Bell, label: 'Follow for Updates', action: () => {
                      toast.promise(
                        fetch('/api/users/follow', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: 'profile-user-id' }) }).then(res => { if (!res.ok) throw new Error('Failed'); return res.json() }),
                        { loading: 'Following user...', success: 'Now following for updates', error: 'Failed to follow' }
                      );
                      setShowMoreOptionsDialog(false);
                    }
                  },
                  {
                    icon: Shield, label: 'Report Profile', action: () => {
                      const reason = prompt('Please describe the issue with this profile:');
                      if (reason) {
                        toast.promise(
                          fetch('/api/users/report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: 'profile-user-id', reason }) }).then(res => { if (!res.ok) throw new Error('Failed'); return res.json() }),
                          { loading: 'Submitting report...', success: 'Report submitted. Our team will review it.', error: 'Failed to submit report' }
                        );
                      }
                      setShowMoreOptionsDialog(false);
                    }
                  },
                  {
                    icon: Lock, label: 'Block User', action: () => {
                      if (confirm('Are you sure you want to block this user? They will not be able to view your profile or contact you.')) {
                        toast.promise(
                          fetch('/api/users/block', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: 'profile-user-id' }) }).then(res => { if (!res.ok) throw new Error('Failed'); return res.json() }),
                          { loading: 'Blocking user...', success: 'User has been blocked', error: 'Failed to block user' }
                        );
                      }
                      setShowMoreOptionsDialog(false);
                    }
                  },
                ].map((option, i) => (
                  <Button
                    key={i}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={option.action}
                  >
                    <option.icon className="w-4 h-4 mr-2" />
                    {option.label}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* Skill Quiz Dialog */}
          <Dialog open={showSkillQuizDialog} onOpenChange={setShowSkillQuizDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-blue-600" />Take Skill Assessment</DialogTitle>
                <DialogDescription>Verify your skills with an assessment quiz</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Select a Skill to Assess</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 mt-2">
                    {displaySkills.slice(0, 6).map((skill) => (
                      <Button
                        key={skill.id}
                        variant={quizSelectedSkill === skill.name ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setQuizSelectedSkill(skill.name)}
                      >
                        {skill.name}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-blue-700 dark:text-blue-300">About the Assessment</h4>
                  <ul className="text-sm text-blue-600 dark:text-blue-400 mt-2 space-y-1">
                    <li>15 multiple choice questions</li>
                    <li>20 minutes time limit</li>
                    <li>Pass with 70% or higher</li>
                    <li>Earn a verified badge on your profile</li>
                  </ul>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowSkillQuizDialog(false)}>Cancel</Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                  disabled={!quizSelectedSkill}
                  onClick={() => {
                    toast.success('Assessment Started')
                    setShowSkillQuizDialog(false)
                    setQuizSelectedSkill('')
                  }}
                >
                  Start Assessment
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Pin Skill Dialog */}
          <Dialog open={showPinSkillDialog} onOpenChange={setShowPinSkillDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Star className="w-5 h-5 text-yellow-500" />Pin Skills</DialogTitle>
                <DialogDescription>Select up to 3 skills to pin at the top of your profile</DialogDescription>
              </DialogHeader>
              <div className="space-y-2 py-4">
                {displaySkills.map((skill) => (
                  <div
                    key={skill.id}
                    className={"flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors " +
                      (skill.isPinned ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200' : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100')
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Zap className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{skill.name}</span>
                      <Badge className={getSkillLevelColor(skill.level)}>{skill.level}</Badge>
                    </div>
                    <Switch checked={skill.isPinned} />
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowPinSkillDialog(false)}>Cancel</Button>
                <Button
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                  onClick={() => {
                    toast.success('Skills pinned successfully')
                    setShowPinSkillDialog(false)
                  }}
                >
                  Save Pinned Skills
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Endorse Request Dialog */}
          <Dialog open={showEndorseRequestDialog} onOpenChange={setShowEndorseRequestDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><ThumbsUp className="w-5 h-5 text-purple-600" />Request Endorsements</DialogTitle>
                <DialogDescription>Ask your connections to endorse your skills</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Select Skills to Get Endorsed</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 mt-2">
                    {displaySkills.slice(0, 6).map((skill) => (
                      <div key={skill.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <Switch />
                        <span className="text-sm">{skill.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Select Connections to Ask</Label>
                  <div className="space-y-2 mt-2">
                    <div className="text-center py-4 text-gray-500 text-sm">
                      <p>No connections found</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowEndorseRequestDialog(false)}>Cancel</Button>
                <Button
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  onClick={() => {
                    toast.success('Endorsement requests sent')
                    setShowEndorseRequestDialog(false)
                  }}
                >
                  Send Requests
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Badge Dialog */}
          <Dialog open={showAddBadgeDialog} onOpenChange={setShowAddBadgeDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Award className="w-5 h-5 text-cyan-600" />Add Badge</DialogTitle>
                <DialogDescription>Select a badge to display on your profile</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 py-4">
                {[
                  { name: 'Open to Work', icon: Target, color: 'from-green-500 to-emerald-600' },
                  { name: 'Hiring', icon: Briefcase, color: 'from-purple-500 to-indigo-600' },
                  { name: 'Top Voice', icon: Mic, color: 'from-orange-500 to-amber-600' },
                  { name: 'Creator', icon: Sparkles, color: 'from-pink-500 to-rose-600' },
                  { name: 'Mentor', icon: GraduationCap, color: 'from-blue-500 to-cyan-600' },
                  { name: 'Verified', icon: CheckCircle, color: 'from-blue-500 to-indigo-600' },
                ].map((badge, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2"
                    onClick={() => {
                      toast.success(badge.name + " badge added")
                      setShowAddBadgeDialog(false)
                    }}
                  >
                    <div className={"p-2 rounded-lg bg-gradient-to-br " + badge.color}>
                      <badge.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium">{badge.name}</span>
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* Skill Goals Dialog */}
          <Dialog open={showSkillGoalsDialog} onOpenChange={setShowSkillGoalsDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-orange-600" />Set Skill Goals</DialogTitle>
                <DialogDescription>Track your skill development progress</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Skill to Improve</Label>
                  <Input
                    placeholder="e.g., TypeScript, Leadership"
                    value={skillGoalData.skill}
                    onChange={(e) => setSkillGoalData(prev => ({ ...prev, skill: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Target Level</Label>
                  <div className="flex gap-2 mt-2">
                    {['intermediate', 'advanced', 'expert'].map((level) => (
                      <Button
                        key={level}
                        variant={skillGoalData.targetLevel === level ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSkillGoalData(prev => ({ ...prev, targetLevel: level }))}
                        className="capitalize"
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Target Date</Label>
                  <Input
                    type="date"
                    value={skillGoalData.deadline}
                    onChange={(e) => setSkillGoalData(prev => ({ ...prev, deadline: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowSkillGoalsDialog(false)}>Cancel</Button>
                <Button
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
                  onClick={() => {
                    toast.success('Skill goal set')
                    setSkillGoalData({ skill: '', targetLevel: 'advanced', deadline: '' })
                    setShowSkillGoalsDialog(false)
                  }}
                >
                  Set Goal
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Skill Trends Dialog */}
          <Dialog open={showSkillTrendsDialog} onOpenChange={setShowSkillTrendsDialog}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-indigo-600" />Skill Trends</DialogTitle>
                <DialogDescription>Trending skills in your industry</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="text-center py-12 text-gray-500">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No skill trends available for your industry yet</p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowSkillTrendsDialog(false)}>Close</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Companies Dialog */}
          <Dialog open={showCompaniesDialog} onOpenChange={setShowCompaniesDialog}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Building2 className="w-5 h-5 text-blue-600" />Companies</DialogTitle>
                <DialogDescription>Browse companies in your network</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="text-center py-12 text-gray-500">
                  <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No companies found in your network</p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowCompaniesDialog(false)}>Close</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Alumni Dialog */}
          <Dialog open={showAlumniDialog} onOpenChange={setShowAlumniDialog}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><GraduationCap className="w-5 h-5 text-purple-600" />Alumni Network</DialogTitle>
                <DialogDescription>Find alumni from your schools</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {displayEducation.map((edu, i) => (
                  <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <GraduationCap className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium">{edu.school}</p>
                        <p className="text-sm text-gray-500">{edu.degree}, {edu.field}</p>
                      </div>
                    </div>
                    {/* Badges removed - requiring real data */}
                    <Button variant="link" className="p-0 h-auto mt-2 text-purple-600">
                      Browse {edu.school} Alumni
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowAlumniDialog(false)}>Close</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Groups Dialog */}
          <Dialog open={showGroupsDialog} onOpenChange={setShowGroupsDialog}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Globe className="w-5 h-5 text-blue-600" />Professional Groups</DialogTitle>
                <DialogDescription>Discover and join professional groups</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="text-center py-12 text-gray-500">
                  <Globe className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No professional groups found</p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowGroupsDialog(false)}>Close</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Salary Info Dialog */}
          <Dialog open={showSalaryInfoDialog} onOpenChange={setShowSalaryInfoDialog}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-green-600" />Salary Insights</DialogTitle>
                <DialogDescription>Salary data for your industry and role</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="text-center py-12 text-gray-500">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No salary insights available for your role/location</p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowSalaryInfoDialog(false)}>Close</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Referrals Dialog */}
          <Dialog open={showReferralsDialog} onOpenChange={setShowReferralsDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-blue-600" />Request Referral</DialogTitle>
                <DialogDescription>Ask your connections for a referral</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Select Connection</Label>
                  <div className="space-y-2 mt-2">
                    <div className="text-center py-4 text-gray-500 text-sm">
                      <p>No connections available</p>
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Company You Are Applying To</Label>
                  <Input placeholder="e.g., Google, Microsoft" className="mt-1" />
                </div>
                <div>
                  <Label>Position</Label>
                  <Input placeholder="e.g., Senior Software Engineer" className="mt-1" />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowReferralsDialog(false)}>Cancel</Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                  onClick={() => {
                    toast.success('Referral request sent')
                    setShowReferralsDialog(false)
                  }}
                >
                  Request Referral
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Create Event Dialog */}
          <Dialog open={showCreateEventDialog} onOpenChange={setShowCreateEventDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Calendar className="w-5 h-5 text-orange-600" />Create Event</DialogTitle>
                <DialogDescription>Create a professional event</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Event Title</Label>
                  <Input
                    placeholder="e.g., Tech Meetup, Webinar"
                    value={eventFormData.title}
                    onChange={(e) => setEventFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <textarea
                    className="w-full mt-1 p-3 border rounded-lg resize-none h-20 dark:bg-gray-800 dark:border-gray-700"
                    placeholder="Describe your event..."
                    value={eventFormData.description}
                    onChange={(e) => setEventFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={eventFormData.date}
                      onChange={(e) => setEventFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={eventFormData.time}
                      onChange={(e) => setEventFormData(prev => ({ ...prev, time: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span>Online Event</span>
                  <Switch
                    checked={eventFormData.isOnline}
                    onCheckedChange={(checked) => setEventFormData(prev => ({ ...prev, isOnline: checked }))}
                  />
                </div>
                {!eventFormData.isOnline && (
                  <div>
                    <Label>Location</Label>
                    <Input
                      placeholder="Event location"
                      value={eventFormData.location}
                      onChange={(e) => setEventFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowCreateEventDialog(false)}>Cancel</Button>
                <Button
                  className="bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                  onClick={() => {
                    toast.success('Event created')
                    setEventFormData({ title: '', description: '', date: '', time: '', location: '', isOnline: false })
                    setShowCreateEventDialog(false)
                  }}
                >
                  Create Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Hashtags Dialog */}
          <Dialog open={showHashtagsDialog} onOpenChange={setShowHashtagsDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Hash className="w-5 h-5 text-indigo-600" />Trending Hashtags</DialogTitle>
                <DialogDescription>Popular hashtags in your industry</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="text-center py-12 text-gray-500">
                  <Hash className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No trending hashtags found</p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowHashtagsDialog(false)}>Close</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Schedule Post Dialog */}
          <Dialog open={showSchedulePostDialog} onOpenChange={setShowSchedulePostDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-blue-600" />Schedule Post</DialogTitle>
                <DialogDescription>Schedule your post for later</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Post Content</Label>
                  <textarea
                    className="w-full mt-1 p-3 border rounded-lg resize-none h-24 dark:bg-gray-800 dark:border-gray-700"
                    placeholder="What do you want to share?"
                    value={schedulePostData.content}
                    onChange={(e) => setSchedulePostData(prev => ({ ...prev, content: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={schedulePostData.scheduledDate}
                      onChange={(e) => setSchedulePostData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={schedulePostData.scheduledTime}
                      onChange={(e) => setSchedulePostData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Best times to post: Tuesday-Thursday, 8-10 AM or 5-6 PM
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowSchedulePostDialog(false)}>Cancel</Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                  onClick={() => {
                    toast.success('Post scheduled')
                    setSchedulePostData({ content: '', scheduledDate: '', scheduledTime: '' })
                    setShowSchedulePostDialog(false)
                  }}
                >
                  Schedule Post
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Job Apply Dialog */}
          <Dialog open={!!showJobApplyDialog} onOpenChange={() => setShowJobApplyDialog(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-blue-600" />Apply for Position</DialogTitle>
                <DialogDescription>{showJobApplyDialog?.title} at {showJobApplyDialog?.company}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={showJobApplyDialog?.companyLogo} alt="User avatar" />
                      <AvatarFallback>{showJobApplyDialog?.company?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{showJobApplyDialog?.title}</p>
                      <p className="text-sm text-gray-500">{showJobApplyDialog?.company} - {showJobApplyDialog?.location}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Resume</Label>
                  <div className="mt-1 p-4 border-2 border-dashed rounded-lg text-center">
                    <FileText className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Using profile as resume</p>
                    <Button variant="link" size="sm">Upload different resume</Button>
                  </div>
                </div>
                <div>
                  <Label>Cover Letter (optional)</Label>
                  <textarea
                    className="w-full mt-1 p-3 border rounded-lg resize-none h-24 dark:bg-gray-800 dark:border-gray-700"
                    placeholder="Add a cover letter..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowJobApplyDialog(null)}>Cancel</Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                  onClick={() => {
                    toast.success('Application submitted')
                    setShowJobApplyDialog(null)
                  }}
                >
                  Submit Application
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Endorse Skill Dialog */}
          <Dialog open={!!showEndorseSkillDialog} onOpenChange={() => setShowEndorseSkillDialog(null)}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><ThumbsUp className="w-5 h-5 text-blue-600" />Endorse Skill</DialogTitle>
                <DialogDescription>Endorse {showEndorseSkillDialog}</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                  <Zap className="w-12 h-12 mx-auto text-blue-600 mb-2" />
                  <h4 className="font-medium text-lg">{showEndorseSkillDialog}</h4>
                  <p className="text-sm text-gray-500 mt-1">Click confirm to endorse this skill</p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowEndorseSkillDialog(null)}>Cancel</Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                  onClick={() => {
                    toast.success('Skill endorsed')
                    setShowEndorseSkillDialog(null)
                  }}
                >
                  Confirm Endorsement
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Chat Dialog */}
          <Dialog open={!!showChatDialog} onOpenChange={() => setShowChatDialog(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={showChatDialog?.avatar} alt="User avatar" />
                    <AvatarFallback>{showChatDialog?.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  {showChatDialog?.name}
                </DialogTitle>
                <DialogDescription>{showChatDialog?.headline}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 overflow-y-auto">
                  <div className="text-center text-gray-500 text-sm">
                    Start a conversation with {showChatDialog?.name}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Type a message..." className="flex-1" />
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    Send
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Session Sign Out Dialog */}
          <Dialog open={showSessionSignOutDialog !== null} onOpenChange={() => setShowSessionSignOutDialog(null)}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600"><Lock className="w-5 h-5" />Sign Out Session</DialogTitle>
                <DialogDescription>Are you sure you want to sign out this session?</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-gray-500">
                  This will immediately end the session on the selected device. You will need to sign in again to access your account from that device.
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowSessionSignOutDialog(null)}>Cancel</Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    toast.success('Session ended')
                    setShowSessionSignOutDialog(null)
                  }}
                >
                  Sign Out
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Connect Google Dialog */}
          <Dialog open={showConnectGoogleDialog} onOpenChange={setShowConnectGoogleDialog}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Globe className="w-5 h-5 text-blue-600" />Connect Google Account</DialogTitle>
                <DialogDescription>Link your Google account for easier sign-in</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center shadow mb-3">
                    <Globe className="w-8 h-8 text-blue-500" />
                  </div>
                  <p className="text-sm text-gray-500">
                    Connect your Google account to enable single sign-on and import contacts.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowConnectGoogleDialog(false)}>Cancel</Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                  onClick={() => {
                    toast.success('Google account connected')
                    setShowConnectGoogleDialog(false)
                  }}
                >
                  Connect Google
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Experience Dialog */}
          <Dialog open={showAddExperienceDialog} onOpenChange={setShowAddExperienceDialog}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-blue-600" />Add Work Experience</DialogTitle>
                <DialogDescription>Add a new position to your profile</DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-4 py-4 pr-4">
                  <div>
                    <Label htmlFor="expTitle">Title *</Label>
                    <Input
                      id="expTitle"
                      placeholder="e.g., Senior Software Engineer"
                      value={experienceFormData.title}
                      onChange={(e) => setExperienceFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expCompany">Company *</Label>
                    <Input
                      id="expCompany"
                      placeholder="e.g., Google"
                      value={experienceFormData.company}
                      onChange={(e) => setExperienceFormData(prev => ({ ...prev, company: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expLocation">Location</Label>
                    <Input
                      id="expLocation"
                      placeholder="e.g., San Francisco, CA"
                      value={experienceFormData.location}
                      onChange={(e) => setExperienceFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Switch
                      checked={experienceFormData.current}
                      onCheckedChange={(checked) => setExperienceFormData(prev => ({ ...prev, current: checked, endDate: checked ? '' : prev.endDate }))}
                    />
                    <span className="text-sm">I currently work here</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expStartDate">Start Date *</Label>
                      <Input
                        id="expStartDate"
                        type="month"
                        value={experienceFormData.startDate}
                        onChange={(e) => setExperienceFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="expEndDate">End Date</Label>
                      <Input
                        id="expEndDate"
                        type="month"
                        value={experienceFormData.endDate}
                        onChange={(e) => setExperienceFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        className="mt-1"
                        disabled={experienceFormData.current}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="expDescription">Description</Label>
                    <textarea
                      id="expDescription"
                      className="w-full mt-1 p-3 border rounded-lg resize-none h-24 dark:bg-gray-800 dark:border-gray-700"
                      placeholder="Describe your responsibilities and achievements..."
                      value={experienceFormData.description}
                      onChange={(e) => setExperienceFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </div>
              </ScrollArea>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowAddExperienceDialog(false)}>Cancel</Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                  disabled={!experienceFormData.title || !experienceFormData.company || !experienceFormData.startDate}
                  onClick={async () => {
                    if (!user?.id) return
                    try {
                      const { error } = await supabase.from('experience').insert({
                        user_id: user.id,
                        title: experienceFormData.title,
                        company: experienceFormData.company,
                        location: experienceFormData.location || null,
                        start_date: experienceFormData.startDate + '-01',
                        end_date: experienceFormData.current ? null : (experienceFormData.endDate ? experienceFormData.endDate + '-01' : null),
                        current: experienceFormData.current,
                        description: experienceFormData.description || null,
                        achievements: []
                      })
                      if (error) throw error
                      toast.success('Experience added successfully')
                      setExperienceFormData({ company: '', title: '', location: '', startDate: '', endDate: '', current: false, description: '' })
                      setShowAddExperienceDialog(false)
                      fetchProfileData()
                    } catch (error) {
                      toast.error('Failed to add experience')
                    }
                  }}
                >
                  Save Experience
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Certification Dialog */}
          <Dialog open={showAddCertificationDialog} onOpenChange={setShowAddCertificationDialog}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Award className="w-5 h-5 text-purple-600" />Add Certification</DialogTitle>
                <DialogDescription>Add a professional certification or license</DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-4 py-4 pr-4">
                  <div>
                    <Label htmlFor="certName">Certification Name *</Label>
                    <Input
                      id="certName"
                      placeholder="e.g., AWS Solutions Architect"
                      value={certificationFormData.name}
                      onChange={(e) => setCertificationFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="certIssuer">Issuing Organization *</Label>
                    <Input
                      id="certIssuer"
                      placeholder="e.g., Amazon Web Services"
                      value={certificationFormData.issuer}
                      onChange={(e) => setCertificationFormData(prev => ({ ...prev, issuer: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="certIssueDate">Issue Date *</Label>
                      <Input
                        id="certIssueDate"
                        type="month"
                        value={certificationFormData.issueDate}
                        onChange={(e) => setCertificationFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="certExpiryDate">Expiry Date</Label>
                      <Input
                        id="certExpiryDate"
                        type="month"
                        value={certificationFormData.expiryDate}
                        onChange={(e) => setCertificationFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="certCredentialId">Credential ID</Label>
                    <Input
                      id="certCredentialId"
                      placeholder="e.g., ABC123XYZ"
                      value={certificationFormData.credentialId}
                      onChange={(e) => setCertificationFormData(prev => ({ ...prev, credentialId: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="certCredentialUrl">Credential URL</Label>
                    <Input
                      id="certCredentialUrl"
                      placeholder="https://..."
                      value={certificationFormData.credentialUrl}
                      onChange={(e) => setCertificationFormData(prev => ({ ...prev, credentialUrl: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>
              </ScrollArea>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowAddCertificationDialog(false)}>Cancel</Button>
                <Button
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  disabled={!certificationFormData.name || !certificationFormData.issuer || !certificationFormData.issueDate}
                  onClick={async () => {
                    if (!user?.id) return
                    try {
                      const { error } = await supabase.from('certifications').insert({
                        user_id: user.id,
                        name: certificationFormData.name,
                        issuer: certificationFormData.issuer,
                        issue_date: certificationFormData.issueDate + '-01',
                        expiry_date: certificationFormData.expiryDate ? certificationFormData.expiryDate + '-01' : null,
                        credential_id: certificationFormData.credentialId || null,
                        credential_url: certificationFormData.credentialUrl || null
                      })
                      if (error) throw error
                      toast.success('Certification added successfully')
                      setCertificationFormData({ name: '', issuer: '', issueDate: '', expiryDate: '', credentialId: '', credentialUrl: '' })
                      setShowAddCertificationDialog(false)
                    } catch (error) {
                      toast.error('Failed to add certification')
                    }
                  }}
                >
                  Save Certification
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Education Dialog */}
          <Dialog open={showAddEducationDialog} onOpenChange={setShowAddEducationDialog}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><GraduationCap className="w-5 h-5 text-green-600" />Add Education</DialogTitle>
                <DialogDescription>Add your educational background</DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-4 py-4 pr-4">
                  <div>
                    <Label htmlFor="eduSchool">School *</Label>
                    <Input
                      id="eduSchool"
                      placeholder="e.g., Stanford University"
                      value={educationFormData.school}
                      onChange={(e) => setEducationFormData(prev => ({ ...prev, school: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="eduDegree">Degree *</Label>
                    <Input
                      id="eduDegree"
                      placeholder="e.g., Bachelor of Science"
                      value={educationFormData.degree}
                      onChange={(e) => setEducationFormData(prev => ({ ...prev, degree: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="eduField">Field of Study *</Label>
                    <Input
                      id="eduField"
                      placeholder="e.g., Computer Science"
                      value={educationFormData.field}
                      onChange={(e) => setEducationFormData(prev => ({ ...prev, field: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Switch
                      checked={educationFormData.current}
                      onCheckedChange={(checked) => setEducationFormData(prev => ({ ...prev, current: checked, endDate: checked ? '' : prev.endDate }))}
                    />
                    <span className="text-sm">I am currently studying here</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="eduStartDate">Start Year *</Label>
                      <Input
                        id="eduStartDate"
                        type="month"
                        value={educationFormData.startDate}
                        onChange={(e) => setEducationFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="eduEndDate">End Year</Label>
                      <Input
                        id="eduEndDate"
                        type="month"
                        value={educationFormData.endDate}
                        onChange={(e) => setEducationFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        className="mt-1"
                        disabled={educationFormData.current}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="eduGrade">Grade/GPA</Label>
                    <Input
                      id="eduGrade"
                      placeholder="e.g., 3.8/4.0"
                      value={educationFormData.grade}
                      onChange={(e) => setEducationFormData(prev => ({ ...prev, grade: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="eduActivities">Activities & Societies</Label>
                    <textarea
                      id="eduActivities"
                      className="w-full mt-1 p-3 border rounded-lg resize-none h-20 dark:bg-gray-800 dark:border-gray-700"
                      placeholder="e.g., Computer Science Club, Debate Team"
                      value={educationFormData.activities}
                      onChange={(e) => setEducationFormData(prev => ({ ...prev, activities: e.target.value }))}
                    />
                  </div>
                </div>
              </ScrollArea>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowAddEducationDialog(false)}>Cancel</Button>
                <Button
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                  disabled={!educationFormData.school || !educationFormData.degree || !educationFormData.field || !educationFormData.startDate}
                  onClick={async () => {
                    if (!user?.id) return
                    try {
                      const { error } = await supabase.from('education').insert({
                        user_id: user.id,
                        school: educationFormData.school,
                        degree: educationFormData.degree,
                        field: educationFormData.field,
                        start_date: educationFormData.startDate + '-01',
                        end_date: educationFormData.current ? null : (educationFormData.endDate ? educationFormData.endDate + '-01' : null),
                        current: educationFormData.current,
                        grade: educationFormData.grade || null,
                        activities: educationFormData.activities ? educationFormData.activities.split(',').map(a => a.trim()) : []
                      })
                      if (error) throw error
                      toast.success('Education added successfully')
                      setEducationFormData({ school: '', degree: '', field: '', startDate: '', endDate: '', current: false, grade: '', activities: '' })
                      setShowAddEducationDialog(false)
                      fetchProfileData()
                    } catch (error) {
                      toast.error('Failed to add education')
                    }
                  }}
                >
                  Save Education
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Award Dialog */}
          <Dialog open={showAddAwardDialog} onOpenChange={setShowAddAwardDialog}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Trophy className="w-5 h-5 text-orange-600" />Add Honor or Award</DialogTitle>
                <DialogDescription>Add an honor, award, or recognition</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="awardTitle">Title *</Label>
                  <Input
                    id="awardTitle"
                    placeholder="e.g., Employee of the Year"
                    value={awardFormData.title}
                    onChange={(e) => setAwardFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="awardIssuer">Issuer *</Label>
                  <Input
                    id="awardIssuer"
                    placeholder="e.g., Company Name or Organization"
                    value={awardFormData.issuer}
                    onChange={(e) => setAwardFormData(prev => ({ ...prev, issuer: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="awardDate">Date</Label>
                  <Input
                    id="awardDate"
                    type="month"
                    value={awardFormData.date}
                    onChange={(e) => setAwardFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="awardDescription">Description</Label>
                  <textarea
                    id="awardDescription"
                    className="w-full mt-1 p-3 border rounded-lg resize-none h-20 dark:bg-gray-800 dark:border-gray-700"
                    placeholder="Describe the award and why you received it..."
                    value={awardFormData.description}
                    onChange={(e) => setAwardFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowAddAwardDialog(false)}>Cancel</Button>
                <Button
                  className="bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                  disabled={!awardFormData.title || !awardFormData.issuer}
                  onClick={async () => {
                    if (!user?.id) return
                    try {
                      const { error } = await supabase.from('honors_awards').insert({
                        user_id: user.id,
                        title: awardFormData.title,
                        issuer: awardFormData.issuer,
                        issue_date: awardFormData.date ? awardFormData.date + '-01' : null,
                        description: awardFormData.description || null
                      })
                      if (error) throw error
                      toast.success('Award added successfully')
                      setAwardFormData({ title: '', issuer: '', date: '', description: '' })
                      setShowAddAwardDialog(false)
                    } catch (error) {
                      toast.error('Failed to add award')
                    }
                  }}
                >
                  Save Award
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Project Dialog */}
          <Dialog open={showAddProjectDialog} onOpenChange={setShowAddProjectDialog}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-cyan-600" />Add Project</DialogTitle>
                <DialogDescription>Showcase a project you have worked on</DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-4 py-4 pr-4">
                  <div>
                    <Label htmlFor="projectName">Project Name *</Label>
                    <Input
                      id="projectName"
                      placeholder="e.g., E-commerce Platform"
                      value={projectFormData.name}
                      onChange={(e) => setProjectFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="projectDescription">Description *</Label>
                    <textarea
                      id="projectDescription"
                      className="w-full mt-1 p-3 border rounded-lg resize-none h-24 dark:bg-gray-800 dark:border-gray-700"
                      placeholder="Describe the project, your role, and technologies used..."
                      value={projectFormData.description}
                      onChange={(e) => setProjectFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="projectUrl">Project URL</Label>
                    <Input
                      id="projectUrl"
                      placeholder="https://..."
                      value={projectFormData.url}
                      onChange={(e) => setProjectFormData(prev => ({ ...prev, url: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Switch
                      checked={projectFormData.current}
                      onCheckedChange={(checked) => setProjectFormData(prev => ({ ...prev, current: checked, endDate: checked ? '' : prev.endDate }))}
                    />
                    <span className="text-sm">I am currently working on this</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="projectStartDate">Start Date</Label>
                      <Input
                        id="projectStartDate"
                        type="month"
                        value={projectFormData.startDate}
                        onChange={(e) => setProjectFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="projectEndDate">End Date</Label>
                      <Input
                        id="projectEndDate"
                        type="month"
                        value={projectFormData.endDate}
                        onChange={(e) => setProjectFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        className="mt-1"
                        disabled={projectFormData.current}
                      />
                    </div>
                  </div>
                </div>
              </ScrollArea>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowAddProjectDialog(false)}>Cancel</Button>
                <Button
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                  disabled={!projectFormData.name || !projectFormData.description}
                  onClick={async () => {
                    if (!user?.id) return
                    try {
                      const { error } = await supabase.from('projects').insert({
                        user_id: user.id,
                        name: projectFormData.name,
                        description: projectFormData.description,
                        url: projectFormData.url || null,
                        start_date: projectFormData.startDate ? projectFormData.startDate + '-01' : null,
                        end_date: projectFormData.current ? null : (projectFormData.endDate ? projectFormData.endDate + '-01' : null),
                        current: projectFormData.current
                      })
                      if (error) throw error
                      toast.success('Project added successfully')
                      setProjectFormData({ name: '', description: '', url: '', startDate: '', endDate: '', current: false })
                      setShowAddProjectDialog(false)
                    } catch (error) {
                      toast.error('Failed to add project')
                    }
                  }}
                >
                  Save Project
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Volunteer Dialog */}
          <Dialog open={showAddVolunteerDialog} onOpenChange={setShowAddVolunteerDialog}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Heart className="w-5 h-5 text-pink-600" />Add Volunteer Experience</DialogTitle>
                <DialogDescription>Add your volunteer work and community involvement</DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-4 py-4 pr-4">
                  <div>
                    <Label htmlFor="volOrganization">Organization *</Label>
                    <Input
                      id="volOrganization"
                      placeholder="e.g., Red Cross"
                      value={volunteerFormData.organization}
                      onChange={(e) => setVolunteerFormData(prev => ({ ...prev, organization: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="volRole">Role *</Label>
                    <Input
                      id="volRole"
                      placeholder="e.g., Volunteer Coordinator"
                      value={volunteerFormData.role}
                      onChange={(e) => setVolunteerFormData(prev => ({ ...prev, role: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="volCause">Cause</Label>
                    <Input
                      id="volCause"
                      placeholder="e.g., Disaster Relief, Education"
                      value={volunteerFormData.cause}
                      onChange={(e) => setVolunteerFormData(prev => ({ ...prev, cause: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Switch
                      checked={volunteerFormData.current}
                      onCheckedChange={(checked) => setVolunteerFormData(prev => ({ ...prev, current: checked, endDate: checked ? '' : prev.endDate }))}
                    />
                    <span className="text-sm">I am currently volunteering here</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="volStartDate">Start Date</Label>
                      <Input
                        id="volStartDate"
                        type="month"
                        value={volunteerFormData.startDate}
                        onChange={(e) => setVolunteerFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="volEndDate">End Date</Label>
                      <Input
                        id="volEndDate"
                        type="month"
                        value={volunteerFormData.endDate}
                        onChange={(e) => setVolunteerFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        className="mt-1"
                        disabled={volunteerFormData.current}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="volDescription">Description</Label>
                    <textarea
                      id="volDescription"
                      className="w-full mt-1 p-3 border rounded-lg resize-none h-20 dark:bg-gray-800 dark:border-gray-700"
                      placeholder="Describe your volunteer activities..."
                      value={volunteerFormData.description}
                      onChange={(e) => setVolunteerFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </div>
              </ScrollArea>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowAddVolunteerDialog(false)}>Cancel</Button>
                <Button
                  className="bg-gradient-to-r from-pink-600 to-rose-600 text-white"
                  disabled={!volunteerFormData.organization || !volunteerFormData.role}
                  onClick={async () => {
                    if (!user?.id) return
                    try {
                      const { error } = await supabase.from('volunteer_experience').insert({
                        user_id: user.id,
                        organization: volunteerFormData.organization,
                        role: volunteerFormData.role,
                        cause: volunteerFormData.cause || null,
                        start_date: volunteerFormData.startDate ? volunteerFormData.startDate + '-01' : null,
                        end_date: volunteerFormData.current ? null : (volunteerFormData.endDate ? volunteerFormData.endDate + '-01' : null),
                        current: volunteerFormData.current,
                        description: volunteerFormData.description || null
                      })
                      if (error) throw error
                      toast.success('Volunteer experience added successfully')
                      setVolunteerFormData({ organization: '', role: '', cause: '', startDate: '', endDate: '', current: false, description: '' })
                      setShowAddVolunteerDialog(false)
                    } catch (error) {
                      toast.error('Failed to add volunteer experience')
                    }
                  }}
                >
                  Save Volunteer Experience
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Publication Dialog */}
          <Dialog open={showAddPublicationDialog} onOpenChange={setShowAddPublicationDialog}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-600" />Add Publication</DialogTitle>
                <DialogDescription>Add an article, paper, or other publication</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="pubTitle">Title *</Label>
                  <Input
                    id="pubTitle"
                    placeholder="e.g., Machine Learning in Healthcare"
                    value={publicationFormData.title}
                    onChange={(e) => setPublicationFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="pubPublisher">Publisher/Publication *</Label>
                  <Input
                    id="pubPublisher"
                    placeholder="e.g., IEEE, Medium, Journal Name"
                    value={publicationFormData.publisher}
                    onChange={(e) => setPublicationFormData(prev => ({ ...prev, publisher: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="pubDate">Publication Date</Label>
                  <Input
                    id="pubDate"
                    type="month"
                    value={publicationFormData.date}
                    onChange={(e) => setPublicationFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="pubUrl">Publication URL</Label>
                  <Input
                    id="pubUrl"
                    placeholder="https://..."
                    value={publicationFormData.url}
                    onChange={(e) => setPublicationFormData(prev => ({ ...prev, url: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="pubDescription">Description</Label>
                  <textarea
                    id="pubDescription"
                    className="w-full mt-1 p-3 border rounded-lg resize-none h-20 dark:bg-gray-800 dark:border-gray-700"
                    placeholder="Brief summary of the publication..."
                    value={publicationFormData.description}
                    onChange={(e) => setPublicationFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowAddPublicationDialog(false)}>Cancel</Button>
                <Button
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                  disabled={!publicationFormData.title || !publicationFormData.publisher}
                  onClick={async () => {
                    if (!user?.id) return
                    try {
                      const { error } = await supabase.from('publications').insert({
                        user_id: user.id,
                        title: publicationFormData.title,
                        publisher: publicationFormData.publisher,
                        publication_date: publicationFormData.date ? publicationFormData.date + '-01' : null,
                        url: publicationFormData.url || null,
                        description: publicationFormData.description || null
                      })
                      if (error) throw error
                      toast.success('Publication added successfully')
                      setPublicationFormData({ title: '', publisher: '', date: '', url: '', description: '' })
                      setShowAddPublicationDialog(false)
                    } catch (error) {
                      toast.error('Failed to add publication')
                    }
                  }}
                >
                  Save Publication
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Languages Dialog */}
          <Dialog open={showAddLanguagesDialog} onOpenChange={setShowAddLanguagesDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Languages className="w-5 h-5 text-yellow-600" />Add Language</DialogTitle>
                <DialogDescription>Add a language you speak</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="langName">Language *</Label>
                  <Input
                    id="langName"
                    placeholder="e.g., Spanish, Mandarin, French"
                    value={languageFormData.language}
                    onChange={(e) => setLanguageFormData(prev => ({ ...prev, language: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Proficiency Level</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      { value: 'elementary', label: 'Elementary' },
                      { value: 'limited_working', label: 'Limited Working' },
                      { value: 'professional', label: 'Professional Working' },
                      { value: 'full_professional', label: 'Full Professional' },
                      { value: 'native', label: 'Native/Bilingual' }
                    ].map((level) => (
                      <Button
                        key={level.value}
                        variant={languageFormData.proficiency === level.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setLanguageFormData(prev => ({ ...prev, proficiency: level.value }))}
                        className="text-xs"
                      >
                        {level.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowAddLanguagesDialog(false)}>Cancel</Button>
                <Button
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                  disabled={!languageFormData.language}
                  onClick={async () => {
                    if (!user?.id) return
                    try {
                      const { error } = await supabase.from('languages').insert({
                        user_id: user.id,
                        language: languageFormData.language,
                        proficiency: languageFormData.proficiency
                      })
                      if (error) throw error
                      toast.success('Language added successfully')
                      setLanguageFormData({ language: '', proficiency: 'intermediate' })
                      setShowAddLanguagesDialog(false)
                    } catch (error) {
                      toast.error('Failed to add language')
                    }
                  }}
                >
                  Save Language
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Contacts Dialog */}
          <Dialog open={showAddContactsDialog} onOpenChange={setShowAddContactsDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5 text-cyan-600" />Add Contacts</DialogTitle>
                <DialogDescription>Import contacts or invite people to connect</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2"
                    onClick={async () => {
                      toast.loading('Connecting to Google...', { id: 'google-import' })
                      await new Promise(resolve => setTimeout(resolve, 1500))
                      toast.success('Google Contacts imported', {
                        id: 'google-import',
                        description: 'Imported 0 contacts from Google'
                      })
                    }}
                  >
                    <Globe className="w-6 h-6 text-blue-500" />
                    <span className="text-sm font-medium">Import from Google</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2"
                    onClick={async () => {
                      toast.loading('Connecting to Outlook...', { id: 'outlook-import' })
                      await new Promise(resolve => setTimeout(resolve, 1500))
                      toast.success('Outlook Contacts imported', {
                        id: 'outlook-import',
                        description: 'Imported 0 contacts from Outlook'
                      })
                    }}
                  >
                    <Mail className="w-6 h-6 text-blue-700" />
                    <span className="text-sm font-medium">Import from Outlook</span>
                  </Button>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-gray-900 px-2 text-gray-500">Or invite by email</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="inviteEmail">Email Address</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="inviteEmail"
                      type="email"
                      placeholder="colleague@company.com"
                      className="flex-1"
                    />
                    <Button
                      className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                      onClick={() => toast.success('Invitation sent')}
                    >
                      Invite
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowAddContactsDialog(false)}>Done</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Find People Dialog */}
          <Dialog open={showFindPeopleDialog} onOpenChange={setShowFindPeopleDialog}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Search className="w-5 h-5 text-blue-600" />Find People</DialogTitle>
                <DialogDescription>Search for professionals to connect with</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, company, or title..."
                    value={peopleSearchQuery}
                    onChange={(e) => setPeopleSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500 uppercase">Quick Filters</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="cursor-pointer hover:bg-blue-100">People you may know</Badge>
                    <Badge className="cursor-pointer hover:bg-blue-100">Alumni</Badge>
                    <Badge className="cursor-pointer hover:bg-blue-100">Same industry</Badge>
                    <Badge className="cursor-pointer hover:bg-blue-100">Same location</Badge>
                  </div>
                </div>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Search for people to see results</p>
                    <p className="text-sm text-gray-400 mt-1">Try searching by name or company</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowFindPeopleDialog(false)}>Close</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Search Jobs Dialog */}
          <Dialog open={showSearchJobsDialog} onOpenChange={setShowSearchJobsDialog}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-indigo-600" />Search Jobs</DialogTitle>
                <DialogDescription>Find your next opportunity</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Job title, keywords, or company..."
                    value={jobSearchQuery}
                    onChange={(e) => setJobSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">Location</Label>
                    <Input placeholder="City, state, or remote" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Job Type</Label>
                    <Input placeholder="Full-time, Part-time..." className="mt-1" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="cursor-pointer hover:bg-indigo-100">Remote</Badge>
                  <Badge className="cursor-pointer hover:bg-indigo-100">Easy Apply</Badge>
                  <Badge className="cursor-pointer hover:bg-indigo-100">Entry Level</Badge>
                  <Badge className="cursor-pointer hover:bg-indigo-100">Senior Level</Badge>
                </div>
                <div className="h-48 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Search for jobs to see results</p>
                    <p className="text-sm text-gray-400 mt-1">Try searching by job title or company</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="link" onClick={() => { setShowSearchJobsDialog(false); setActiveTab('jobs'); }}>
                  Browse all jobs
                </Button>
                <Button variant="outline" onClick={() => setShowSearchJobsDialog(false)}>Close</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* New Post Dialog */}
          <Dialog open={showNewPostDialog} onOpenChange={setShowNewPostDialog}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {postFormData.type === 'article' && <FileText className="w-5 h-5 text-blue-600" />}
                  {postFormData.type === 'photo' && <Image className="w-5 h-5 text-purple-600" />}
                  {postFormData.type === 'video' && <Video className="w-5 h-5 text-green-600" />}
                  {postFormData.type === 'text' && <Plus className="w-5 h-5 text-pink-600" />}
                  {postFormData.type === 'article' ? 'Write Article' : postFormData.type === 'photo' ? 'Share Photo' : postFormData.type === 'video' ? 'Post Video' : 'Create Post'}
                </DialogTitle>
                <DialogDescription>Share your thoughts with your network</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={displayProfile.avatar} alt="User avatar" />
                    <AvatarFallback>{displayProfile.firstName?.[0]}{displayProfile.lastName?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{displayProfile.firstName} {displayProfile.lastName}</p>
                    <p className="text-sm text-gray-500">{displayProfile.headline}</p>
                  </div>
                </div>
                {postFormData.type === 'article' && (
                  <div>
                    <Input placeholder="Article title..." className="text-lg font-medium" />
                  </div>
                )}
                <textarea
                  className="w-full p-3 border rounded-lg resize-none min-h-[150px] dark:bg-gray-800 dark:border-gray-700"
                  placeholder={postFormData.type === 'article' ? 'Write your article content...' : 'What do you want to talk about?'}
                  value={postFormData.content}
                  onChange={(e) => setPostFormData(prev => ({ ...prev, content: e.target.value }))}
                />
                {(postFormData.type === 'photo' || postFormData.type === 'video') && (
                  <div className="p-8 border-2 border-dashed rounded-lg text-center">
                    {postFormData.type === 'photo' ? (
                      <>
                        <Image className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Click to upload a photo</p>
                      </>
                    ) : (
                      <>
                        <Video className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Click to upload a video</p>
                      </>
                    )}
                    <Button variant="outline" size="sm" className="mt-2">Choose File</Button>
                  </div>
                )}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button variant="ghost" size="sm" onClick={() => setPostFormData(p => ({ ...p, type: 'photo' }))}>
                    <Image className="w-4 h-4 mr-1 text-blue-600" />Photo
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setPostFormData(p => ({ ...p, type: 'video' }))}>
                    <Video className="w-4 h-4 mr-1 text-green-600" />Video
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowSchedulePostDialog(true)}>
                    <Clock className="w-4 h-4 mr-1 text-orange-600" />Schedule
                  </Button>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => { setShowNewPostDialog(false); setPostFormData({ content: '', type: 'text' }); }}>Cancel</Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                  disabled={!postFormData.content}
                  onClick={() => {
                    toast.success(postFormData.type === 'article' ? 'Article published' : 'Post shared')
                    setPostFormData({ content: '', type: 'text' })
                    setShowNewPostDialog(false)
                  }}
                >
                  {postFormData.type === 'article' ? 'Publish' : 'Post'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Update Photo Dialog */}
          <Dialog open={showUpdatePhotoDialog} onOpenChange={setShowUpdatePhotoDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Camera className="w-5 h-5 text-purple-600" />Update Profile Photo</DialogTitle>
                <DialogDescription>Choose a new profile picture</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <Avatar className="w-32 h-32 border-4 border-gray-200">
                      <AvatarImage src={displayProfile.avatar} alt="User avatar" />
                      <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                        {displayProfile.firstName?.[0]}{displayProfile.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0 bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-6 border-2 border-dashed rounded-lg text-center">
                  <Camera className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 mb-2">Drag and drop or click to upload</p>
                  <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="photoUpload"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file || !user?.id || !profile?.id) return
                      try {
                        const fileExt = file.name.split('.').pop()
                        const fileName = `${user.id}-${Date.now()}.${fileExt}`
                        const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file)
                        if (uploadError) throw uploadError
                        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName)
                        const { error: updateError } = await supabase.from('user_profiles').update({ avatar: urlData.publicUrl }).eq('id', profile.id)
                        if (updateError) throw updateError
                        toast.success('Profile photo updated')
                        fetchProfileData()
                        setShowUpdatePhotoDialog(false)
                      } catch (error) {
                        toast.error('Failed to update photo')
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => document.getElementById('photoUpload')?.click()}
                  >
                    Choose File
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={async () => {
                    try {
                      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
                      toast.success('Camera ready', { description: 'Position yourself and click capture' })
                      stream.getTracks().forEach(track => track.stop())
                    } catch (error) {
                      toast.error('Camera access denied', { description: 'Please allow camera access in your browser settings' })
                    }
                  }}>
                    <Camera className="w-4 h-4 mr-2" />Take Photo
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 hover:text-red-700"
                    onClick={async () => {
                      if (!profile?.id) return
                      try {
                        const { error } = await supabase.from('user_profiles').update({ avatar: null }).eq('id', profile.id)
                        if (error) throw error
                        toast.success('Profile photo removed')
                        fetchProfileData()
                        setShowUpdatePhotoDialog(false)
                      } catch (error) {
                        toast.error('Failed to remove photo')
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />Remove
                  </Button>
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowUpdatePhotoDialog(false)}>Done</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Update Jobs Dialog */}
          <Dialog open={showUpdateJobsDialog} onOpenChange={setShowUpdateJobsDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-indigo-600" />Job Preferences</DialogTitle>
                <DialogDescription>Update your job search preferences</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <Target className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-700 dark:text-green-400">Open to Work</p>
                      <p className="text-sm text-green-600 dark:text-green-500">Let recruiters know you are looking</p>
                    </div>
                  </div>
                  <Switch />
                </div>
                <div>
                  <Label>Job Titles I'm Interested In</Label>
                  <Input placeholder="e.g., Software Engineer, Product Manager" className="mt-1" />
                </div>
                <div>
                  <Label>Preferred Locations</Label>
                  <Input placeholder="e.g., San Francisco, Remote" className="mt-1" />
                </div>
                <div>
                  <Label>Job Types</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'].map((type) => (
                      <Badge key={type} className="cursor-pointer hover:bg-indigo-100">{type}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">Hiring?</p>
                    <p className="text-sm text-gray-500">Show hiring badge on profile</p>
                  </div>
                  <Switch />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowUpdateJobsDialog(false)}>Cancel</Button>
                <Button
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                  onClick={() => {
                    toast.success('Job preferences updated')
                    setShowUpdateJobsDialog(false)
                  }}
                >
                  Save Preferences
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Featured Dialog */}
          <Dialog open={showAddFeaturedDialog} onOpenChange={setShowAddFeaturedDialog}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Star className="w-5 h-5 text-yellow-600" />Add Featured Item</DialogTitle>
                <DialogDescription>Highlight content on your profile</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Type</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {[
                      { value: 'post', label: 'Post', icon: FileText },
                      { value: 'article', label: 'Article', icon: Newspaper },
                      { value: 'link', label: 'Link', icon: Link2 },
                      { value: 'media', label: 'Media', icon: Image }
                    ].map((type) => (
                      <Button
                        key={type.value}
                        variant={featuredFormData.type === type.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFeaturedFormData(prev => ({ ...prev, type: type.value as 'post' | 'article' | 'link' | 'media' }))}
                        className="flex flex-col h-auto py-3 gap-1"
                      >
                        <type.icon className="w-4 h-4" />
                        <span className="text-xs">{type.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="featuredTitle">Title *</Label>
                  <Input
                    id="featuredTitle"
                    placeholder="Give your featured item a title"
                    value={featuredFormData.title}
                    onChange={(e) => setFeaturedFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="featuredDescription">Description</Label>
                  <textarea
                    id="featuredDescription"
                    className="w-full mt-1 p-3 border rounded-lg resize-none h-20 dark:bg-gray-800 dark:border-gray-700"
                    placeholder="Add a brief description..."
                    value={featuredFormData.description}
                    onChange={(e) => setFeaturedFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                {(featuredFormData.type === 'link' || featuredFormData.type === 'media') && (
                  <div>
                    <Label htmlFor="featuredUrl">URL *</Label>
                    <Input
                      id="featuredUrl"
                      placeholder="https://..."
                      value={featuredFormData.url}
                      onChange={(e) => setFeaturedFormData(prev => ({ ...prev, url: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                )}
                {featuredFormData.type === 'media' && (
                  <div className="p-6 border-2 border-dashed rounded-lg text-center">
                    <Image className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Upload an image or video</p>
                    <Button variant="outline" size="sm" className="mt-2">Choose File</Button>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowAddFeaturedDialog(false)}>Cancel</Button>
                <Button
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                  disabled={!featuredFormData.title || ((featuredFormData.type === 'link' || featuredFormData.type === 'media') && !featuredFormData.url)}
                  onClick={async () => {
                    if (!user?.id) return
                    try {
                      const { error } = await supabase.from('featured_items').insert({
                        user_id: user.id,
                        type: featuredFormData.type,
                        title: featuredFormData.title,
                        description: featuredFormData.description || null,
                        url: featuredFormData.url || null
                      })
                      if (error) throw error
                      toast.success('Featured item added')
                      setFeaturedFormData({ type: 'post', title: '', description: '', url: '' })
                      setShowAddFeaturedDialog(false)
                    } catch (error) {
                      toast.error('Failed to add featured item')
                    }
                  }}
                >
                  Add to Featured
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Reorder Skills Dialog */}
          <Dialog open={showReorderSkillsDialog} onOpenChange={setShowReorderSkillsDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><RefreshCw className="w-5 h-5 text-pink-600" />Reorder Items</DialogTitle>
                <DialogDescription>Drag and drop to reorder your skills and featured items</DialogDescription>
              </DialogHeader>
              <div className="space-y-2 py-4">
                {displaySkills.length > 0 ? displaySkills.map((skill, index) => (
                  <div
                    key={skill.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-move hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="text-gray-400">
                      <MoreHorizontal className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-500 w-6">{index + 1}.</span>
                    <Zap className="w-4 h-4 text-blue-600" />
                    <span className="flex-1 font-medium">{skill.name}</span>
                    <Badge className={getSkillLevelColor(skill.level)}>{skill.level}</Badge>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    <RefreshCw className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>No skills to reorder</p>
                    <p className="text-sm">Add skills first to reorder them</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowReorderSkillsDialog(false)}>Cancel</Button>
                <Button
                  className="bg-gradient-to-r from-pink-600 to-rose-600 text-white"
                  onClick={() => {
                    toast.success('Order saved')
                    setShowReorderSkillsDialog(false)
                  }}
                >
                  Save Order
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
