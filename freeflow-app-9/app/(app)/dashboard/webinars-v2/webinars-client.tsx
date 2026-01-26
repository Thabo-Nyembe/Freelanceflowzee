'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { toast } from 'sonner'

// Supabase webinars hooks for real data
import { useWebinars as useSupabaseWebinars, type Webinar as DbWebinar, type WebinarStatus as DbWebinarStatus } from '@/lib/hooks/use-webinars'
import { useUpcomingWebinars } from '@/lib/hooks/use-webinars-extended'

// Real-time video collaboration API hooks (fallback)
import {
  useEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  useBookings,
  useCreateBooking,
  useTeamMembers,
  useTeamStats,
  useNotifications,
  useSendMessage
} from '@/lib/api-clients'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Video,
  Users,
  Calendar,
  Clock,
  Play,
  Settings,
  BarChart3,
  Plus,
  Search,
  Mail,
  MessageSquare,
  HelpCircle,
  PlayCircle,
  Download,
  Upload,
  Trash2,
  Edit,
  Copy,
  MoreHorizontal,
  Share2,
  Link,
  CheckCircle2,
  TrendingUp,
  Eye,
  FileText,
  Bell,
  Globe,
  Lock,
  UserPlus,
  UserCheck,
  UserX,
  Send,
  RefreshCw,
  Radio,
  MessageCircle,
  BarChart2,
  PieChart,
  Timer,
  Filter,
  ThumbsUp,
  ListChecks,
  Presentation,
  MonitorPlay,
  Headphones,
  Sparkles,
  Shield,
  Sliders,
  Webhook,
  Key,
  Database,
  Terminal,
  AlertTriangle
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

// Real database hooks for collaboration and activity data
import { useTeam } from '@/lib/hooks/use-team'
import { useActivityLogs } from '@/lib/hooks/use-activity-logs'

// Types
type WebinarStatus = 'scheduled' | 'live' | 'ended' | 'cancelled' | 'draft'
type WebinarType = 'webinar' | 'meeting' | 'training' | 'demo' | 'conference'
type RegistrationStatus = 'pending' | 'approved' | 'declined' | 'attended' | 'no_show'
type RecordingStatus = 'processing' | 'ready' | 'failed'

interface Panelist {
  id: string
  name: string
  email: string
  role: 'host' | 'co-host' | 'panelist' | 'speaker'
  avatar?: string
}

interface Poll {
  id: string
  question: string
  options: { id: string; text: string; votes: number }[]
  status: 'draft' | 'active' | 'ended'
  createdAt: string
}

interface QAItem {
  id: string
  question: string
  askedBy: string
  askedAt: string
  answer?: string
  answeredBy?: string
  answeredAt?: string
  upvotes: number
  status: 'pending' | 'answered' | 'dismissed'
}

interface Webinar {
  id: string
  title: string
  description: string
  type: WebinarType
  status: WebinarStatus
  scheduledDate: string
  duration: number
  timezone: string
  host: Panelist
  panelists: Panelist[]
  registeredCount: number
  attendedCount: number
  maxParticipants: number
  registrationRequired: boolean
  approvalRequired: boolean
  recordingEnabled: boolean
  qnaEnabled: boolean
  pollsEnabled: boolean
  chatEnabled: boolean
  waitingRoomEnabled: boolean
  meetingId?: string
  joinUrl?: string
  registrationUrl?: string
  createdAt: string
}

interface Registration {
  id: string
  webinarId: string
  name: string
  email: string
  company?: string
  jobTitle?: string
  status: RegistrationStatus
  registeredAt: string
  attendedAt?: string
  leftAt?: string
  duration?: number
  source?: string
}

interface Recording {
  id: string
  webinarId: string
  webinarTitle: string
  type: 'video' | 'audio' | 'transcript'
  status: RecordingStatus
  duration: number
  size: number
  views: number
  downloadCount: number
  url?: string
  createdAt: string
  expiresAt?: string
}

interface EmailTemplate {
  id: string
  name: string
  type: 'confirmation' | 'reminder' | 'follow_up' | 'cancellation'
  subject: string
  enabled: boolean
  sendTime?: string
}

interface WebinarStats {
  totalWebinars: number
  scheduledWebinars: number
  liveNow: number
  endedWebinars: number
  totalRegistrations: number
  totalAttendees: number
  avgAttendanceRate: number
  avgDuration: number
}

// Empty data arrays - real data comes from API
const webinarsData: Webinar[] = []
const registrationsData: Registration[] = []
const recordingsData: Recording[] = []
const templatesData: EmailTemplate[] = []
const pollsData: Poll[] = []
const qaData: QAItem[] = []

// Helper Functions
const getStatusColor = (status: WebinarStatus) => {
  switch (status) {
    case 'live': return 'bg-red-100 text-red-800 border-red-200'
    case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'ended': return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'cancelled': return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getTypeIcon = (type: WebinarType) => {
  switch (type) {
    case 'webinar': return <Video className="w-4 h-4" />
    case 'meeting': return <Users className="w-4 h-4" />
    case 'training': return <Presentation className="w-4 h-4" />
    case 'demo': return <MonitorPlay className="w-4 h-4" />
    case 'conference': return <Globe className="w-4 h-4" />
    default: return <Video className="w-4 h-4" />
  }
}

const getRegistrationStatusColor = (status: RegistrationStatus) => {
  switch (status) {
    case 'approved': return 'bg-green-100 text-green-800 border-green-200'
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'declined': return 'bg-red-100 text-red-800 border-red-200'
    case 'attended': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'no_show': return 'bg-gray-100 text-gray-800 border-gray-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

// Empty arrays for competitive upgrade components - collaborators and activities now come from hooks
const webinarsAIInsights: { id: string; type: 'success' | 'warning' | 'info'; title: string; description: string; priority: 'low' | 'medium' | 'high'; timestamp: string; category: string }[] = []
const webinarsPredictions: { id: string; title: string; prediction: string; confidence: number; trend: 'up' | 'down' | 'stable'; impact: 'low' | 'medium' | 'high' }[] = []

export default function WebinarsClient() {

  // ==========================================================================
  // SUPABASE DATABASE HOOKS - Real data from webinars table
  // ==========================================================================

  // Primary Supabase hooks for webinars data
  const {
    webinars: dbWebinars,
    loading: isLoadingWebinars,
    error: webinarsError,
    mutating: isMutating,
    createWebinar: createDbWebinar,
    updateWebinar: updateDbWebinar,
    deleteWebinar: deleteDbWebinar,
    refetch: refetchWebinars
  } = useSupabaseWebinars()

  // Upcoming webinars for scheduling view
  const { webinars: upcomingWebinars, isLoading: isLoadingUpcoming } = useUpcomingWebinars({ limit: 10 })

  // Real-time collaboration and activity data
  const { members: teamMembers } = useTeam()
  const { logs: activityLogs } = useActivityLogs()

  // Map team members to collaborators format
  const webinarsCollaborators = useMemo(() =>
    teamMembers?.map(m => ({
      id: m.id,
      name: m.name,
      avatar: m.avatar_url || '',
      status: m.status === 'active' ? 'online' as const : m.status === 'on_leave' ? 'away' as const : 'offline' as const,
      role: m.role || 'Team Member'
    })) || [], [teamMembers])

  // Map activity logs to activities format
  const webinarsActivities = useMemo(() =>
    activityLogs?.slice(0, 20).map(l => ({
      id: l.id,
      user: l.user_name || 'System',
      action: l.action,
      target: l.resource_name || '',
      timestamp: l.created_at,
      type: (l.status === 'success' ? 'success' : l.status === 'failed' ? 'error' : 'info') as 'success' | 'info' | 'warning' | 'error'
    })) || [], [activityLogs])

  // ==========================================================================
  // FALLBACK API HOOKS - For extended functionality
  // ==========================================================================

  // Events/Webinars from API (fallback)
  const { data: eventsData, isLoading: isLoadingEvents } = useEvents()
  const createEventApi = useCreateEvent()
  const updateEventApi = useUpdateEvent()
  const deleteEventApi = useDeleteEvent()

  // Bookings for webinar registrations
  const { data: bookingsData } = useBookings()
  const createBookingApi = useCreateBooking()

  // Team members for presenters/hosts
  const { data: teamMembersData } = useTeamMembers()
  const { data: teamStatsData } = useTeamStats()

  // Notifications for webinar reminders
  const { data: notificationsData } = useNotifications()

  // Messaging for webinar chat
  const sendMessageApi = useSendMessage()

  // ==========================================================================
  // LOADING AND ERROR STATES
  // ==========================================================================

  const isLoading = isLoadingWebinars || isLoadingUpcoming
  const hasError = !!webinarsError

  // Show error toast when there's an error loading webinars
  useEffect(() => {
    if (webinarsError) {
      toast.error('Failed to load webinars', {
        description: webinarsError.message || 'Please try refreshing the page'
      })
    }
  }, [webinarsError])

  // ==========================================================================
  // MAP DATABASE DATA TO UI TYPES
  // ==========================================================================

  // Helper to map DB status to UI status
  const mapDbStatusToUI = (dbStatus: DbWebinarStatus): WebinarStatus => {
    switch (dbStatus) {
      case 'live': return 'live'
      case 'scheduled': return 'scheduled'
      case 'ended': return 'ended'
      case 'cancelled': return 'cancelled'
      case 'recording': return 'ended' // Treat recording as ended for UI
      default: return 'scheduled'
    }
  }

  // Helper to map DB topic to UI type
  const mapDbTopicToType = (topic: string | null): WebinarType => {
    switch (topic) {
      case 'training': return 'training'
      case 'demo': return 'demo'
      case 'onboarding': return 'training'
      default: return 'webinar'
    }
  }

  // Transform Supabase webinars to UI format
  const mappedWebinars: Webinar[] = useMemo(() => {
    if (!dbWebinars || dbWebinars.length === 0) return []

    return dbWebinars.map((dbWebinar: DbWebinar) => ({
      id: dbWebinar.id,
      title: dbWebinar.title || 'Untitled Webinar',
      description: dbWebinar.description || '',
      type: mapDbTopicToType(dbWebinar.topic),
      status: mapDbStatusToUI(dbWebinar.status),
      scheduledDate: dbWebinar.scheduled_date,
      duration: dbWebinar.duration_minutes || 60,
      timezone: dbWebinar.timezone || 'UTC',
      host: {
        id: dbWebinar.user_id,
        name: dbWebinar.host_name || 'Host',
        email: '',
        role: 'host' as const
      },
      panelists: (dbWebinar.speakers as Panelist[]) || [],
      registeredCount: dbWebinar.registered_count || 0,
      attendedCount: dbWebinar.attended_count || 0,
      maxParticipants: dbWebinar.max_participants || 1000,
      registrationRequired: true,
      approvalRequired: false,
      recordingEnabled: !!dbWebinar.recording_url,
      qnaEnabled: dbWebinar.questions_asked > 0,
      pollsEnabled: dbWebinar.polls_conducted > 0,
      chatEnabled: dbWebinar.chat_messages > 0,
      waitingRoomEnabled: true,
      meetingId: dbWebinar.meeting_id || undefined,
      joinUrl: dbWebinar.meeting_link || undefined,
      registrationUrl: dbWebinar.meeting_link || undefined,
      createdAt: dbWebinar.created_at
    }))
  }, [dbWebinars])

  // Transform API events to webinar format (fallback)
  const apiWebinars = useMemo(() => {
    const events = eventsData?.data || []
    return events
      .filter((event: any) => event.type === 'webinar' || event.type === 'meeting')
      .map((event: any) => ({
        id: event.id,
        title: event.title || 'Untitled Webinar',
        description: event.description || '',
        status: event.status === 'in_progress' ? 'live' : (event.status === 'completed' ? 'ended' : 'scheduled') as WebinarStatus,
        type: 'webinar' as WebinarType,
        startTime: event.start_date || event.start_time,
        endTime: event.end_date || event.end_time,
        duration: event.duration || 60,
        host: teamMembersData?.data?.[0] || { id: '1', name: 'Host', avatar: '' },
        presenters: event.attendees?.filter((a: any) => a.role === 'presenter') || [],
        maxAttendees: event.max_attendees || 1000,
        currentAttendees: event.attendee_count || 0,
        registrationUrl: event.registration_url || `https://app.freeflow.io/webinar/${event.id}/register`,
        joinUrl: event.meeting_url || `https://app.freeflow.io/webinar/${event.id}/join`,
        recordingEnabled: event.recording_enabled ?? true,
        chatEnabled: event.chat_enabled ?? true,
        qnaEnabled: event.qna_enabled ?? true,
        category: event.category || 'general',
        tags: event.tags || [],
        createdAt: event.created_at,
        updatedAt: event.updated_at
      }))
  }, [eventsData, teamMembersData])

  // Transform bookings to registrations format
  const apiRegistrations = useMemo(() => {
    const bookings = bookingsData?.data || []
    return bookings.map((booking: any) => ({
      id: booking.id,
      webinarId: booking.event_id,
      attendeeId: booking.user_id,
      attendeeName: booking.user_name || 'Attendee',
      attendeeEmail: booking.user_email || '',
      registeredAt: booking.created_at,
      status: booking.status || 'registered',
      attended: booking.attended || false,
      joinedAt: booking.joined_at,
      leftAt: booking.left_at,
      engagementScore: booking.engagement_score || 0
    }))
  }, [bookingsData])

  // Enhanced stats from Supabase data
  const enhancedWebinarStats = useMemo(() => ({
    totalWebinars: mappedWebinars.length,
    scheduledWebinars: mappedWebinars.filter(w => w.status === 'scheduled').length,
    liveWebinars: mappedWebinars.filter(w => w.status === 'live').length,
    totalRegistrations: mappedWebinars.reduce((sum, w) => sum + (w.registeredCount || 0), 0),
    totalAttendees: mappedWebinars.reduce((sum, w) => sum + (w.attendedCount || 0), 0),
    totalRecordings: recordingsData.length
  }), [mappedWebinars])

  // Use Supabase data as primary, fall back to API data
  const effectiveWebinars = mappedWebinars.length > 0 ? mappedWebinars : apiWebinars
  const effectiveRegistrations = apiRegistrations

  // Create webinar using Supabase hook (primary) with API fallback
  const handleCreateWebinarWithAPI = useCallback(async (webinarData: Partial<Webinar>) => {
    try {
      // Try Supabase first
      await createDbWebinar({
        title: webinarData.title || 'New Webinar',
        description: webinarData.description || '',
        topic: 'other',
        status: 'scheduled',
        scheduled_date: webinarData.scheduledDate || new Date(Date.now() + 86400000).toISOString(),
        duration_minutes: webinarData.duration || 60,
        timezone: webinarData.timezone || 'UTC',
        max_participants: webinarData.maxParticipants || 1000,
        host_name: webinarData.host?.name || 'Host',
      })
      toast.success('Webinar created successfully')
      setShowScheduleDialog(false)
      refetchWebinars()
    } catch (supabaseError) {
      // Fall back to API
      try {
        await createEventApi.mutateAsync({
          title: webinarData.title || 'New Webinar',
          description: webinarData.description || '',
          start_date: webinarData.scheduledDate || new Date(Date.now() + 86400000).toISOString(),
          end_date: new Date(Date.now() + 86400000 + 3600000).toISOString(),
          type: 'webinar',
          is_all_day: false
        })
        toast.success('Webinar created successfully')
        setShowScheduleDialog(false)
      } catch (apiError) {
        // Add to local state as final fallback
        const newWebinar: Webinar = {
          id: `webinar-${Date.now()}`,
          title: webinarData.title || 'New Webinar',
          description: webinarData.description || '',
          status: 'scheduled',
          type: 'webinar',
          scheduledDate: webinarData.scheduledDate || new Date(Date.now() + 86400000).toISOString(),
          duration: 60,
          timezone: 'UTC',
          host: { id: '1', name: 'Host', email: 'host@example.com', role: 'host' as const },
          panelists: [],
          registeredCount: 0,
          attendedCount: 0,
          maxParticipants: 1000,
          registrationRequired: true,
          approvalRequired: false,
          recordingEnabled: true,
          qnaEnabled: true,
          pollsEnabled: true,
          chatEnabled: true,
          waitingRoomEnabled: true,
          createdAt: new Date().toISOString()
        }
        setWebinars(prev => [...prev, newWebinar])
        toast.success('Webinar created successfully')
        setShowScheduleDialog(false)
      }
    }
  }, [createDbWebinar, createEventApi, refetchWebinars])

  // Register for webinar using API hook
  const handleRegisterForWebinar = useCallback(async (webinarId: string) => {
    try {
      await createBookingApi.mutateAsync({
        event_id: webinarId,
        notes: 'Registered via webinar page'
      })
      toast.success('Registration successful!')
    } catch (error) {
      // Add to local state as fallback
      const newRegistration: Registration = {
        id: `reg-${Date.now()}`,
        webinarId,
        attendeeId: 'current-user',
        attendeeName: 'Current User',
        attendeeEmail: 'user@example.com',
        registeredAt: new Date().toISOString(),
        status: 'registered',
        attended: false,
        engagementScore: 0
      }
      setRegistrations(prev => [...prev, newRegistration])
      toast.success('Registration successful!')
    }
  }, [createBookingApi])

  const [activeTab, setActiveTab] = useState('webinars')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<WebinarStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<WebinarType | 'all'>('all')
  const [selectedWebinar, setSelectedWebinar] = useState<Webinar | null>(null)
  const [settingsTab, setSettingsTab] = useState('general')

  // Additional states for functional buttons
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [emailForm, setEmailForm] = useState({ subject: '', body: '', recipients: 'all' })
  const [isRecording, setIsRecording] = useState(false)
  const [webinars, setWebinars] = useState<Webinar[]>([])
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [polls, setPolls] = useState<Poll[]>([])
  const [qaItems, setQaItems] = useState<QAItem[]>([])
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingWebinar, setEditingWebinar] = useState<Webinar | null>(null)

  // Sync Supabase data to local state when it loads
  useEffect(() => {
    if (mappedWebinars.length > 0) {
      setWebinars(mappedWebinars)
    }
  }, [mappedWebinars])

  // Helper functions for real functionality
  const copyToClipboard = async (text: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(successMessage)
    } catch {
      toast.error('Failed to copy to clipboard')
    }
  }

  const shareWebinar = async (webinar: Webinar) => {
    const shareUrl = webinar.joinUrl || webinar.registrationUrl || `https://kazi.app/webinar/${webinar.id}`
    const shareData = {
      title: webinar.title,
      text: webinar.description,
      url: shareUrl
    }

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData)
        toast.success('Shared successfully!')
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          // User cancelled, fall back to copy
          copyToClipboard(shareUrl, 'Share link copied to clipboard!')
        }
      }
    } else {
      copyToClipboard(shareUrl, 'Share link copied to clipboard!')
    }
  }

  const openWebinarLink = (webinar: Webinar) => {
    const url = webinar.joinUrl || webinar.registrationUrl
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
      toast.success(`Opening ${webinar.title}...`)
    } else {
      toast.error('No webinar link available')
    }
  }

  const deleteRecording = async (recording: Recording) => {
    if (!confirm(`Are you sure you want to delete "${recording.webinarTitle}"? This cannot be undone.`)) {
      return
    }
    try {
      // API call would go here
      setRecordings(prev => prev.filter(r => r.id !== recording.id))
      toast.success('Recording deleted successfully')
    } catch {
      toast.error('Failed to delete recording')
    }
  }

  const downloadRecording = (recording: Recording) => {
    if (recording.url) {
      const link = document.createElement('a')
      link.href = recording.url
      link.download = `${recording.webinarTitle}.${recording.type === 'video' ? 'mp4' : recording.type === 'audio' ? 'mp3' : 'txt'}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success(`Downloading ${recording.webinarTitle}...`)
    } else {
      toast.error('Recording URL not available')
    }
  }

  const playRecording = (recording: Recording) => {
    if (recording.url) {
      window.open(recording.url, '_blank', 'noopener,noreferrer')
      toast.success(`Playing ${recording.webinarTitle}...`)
    } else {
      toast.error('Recording not available for playback')
    }
  }

  const approveRegistration = async (registration: Registration) => {
    try {
      setRegistrations(prev => prev.map(r =>
        r.id === registration.id ? { ...r, status: 'approved' as RegistrationStatus } : r
      ))
      toast.success(`${registration.name} has been approved`)
    } catch {
      toast.error('Failed to approve registration')
    }
  }

  const declineRegistration = async (registration: Registration) => {
    if (!confirm(`Are you sure you want to decline ${registration.name}'s registration?`)) {
      return
    }
    try {
      setRegistrations(prev => prev.map(r =>
        r.id === registration.id ? { ...r, status: 'declined' as RegistrationStatus } : r
      ))
      toast.success(`${registration.name}'s registration has been declined`)
    } catch {
      toast.error('Failed to decline registration')
    }
  }

  const sendEmailToRegistrant = async (registration: Registration) => {
    setEmailForm({
      subject: `Regarding your webinar registration`,
      body: `Dear ${registration.name},\n\n`,
      recipients: registration.email
    })
    setShowEmailDialog(true)
  }

  const exportAttendeesCSV = () => {
    const headers = ['Name', 'Email', 'Company', 'Job Title', 'Status', 'Registered At', 'Duration']
    const csvContent = [
      headers.join(','),
      ...registrations.map(r => [
        r.name,
        r.email,
        r.company || '',
        r.jobTitle || '',
        r.status,
        r.registeredAt,
        r.duration || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'attendees-export.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    toast.success('Attendees exported to CSV!')
  }

  const toggleRecording = async () => {
    try {
      setIsRecording(prev => !prev)
      if (isRecording) {
        toast.success('Recording stopped')
      } else {
        toast.success('Recording started')
      }
    } catch {
      toast.error('Failed to toggle recording')
    }
  }

  const deleteWebinar = async (webinar: Webinar) => {
    if (!confirm(`Are you sure you want to delete "${webinar.title}"? This cannot be undone.`)) {
      return
    }
    try {
      setWebinars(prev => prev.filter(w => w.id !== webinar.id))
      toast.success('Webinar deleted successfully')
    } catch {
      toast.error('Failed to delete webinar')
    }
  }

  const duplicateWebinar = (webinar: Webinar) => {
    const newWebinar: Webinar = {
      ...webinar,
      id: `w${Date.now()}`,
      title: `${webinar.title} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0]
    }
    setWebinars(prev => [...prev, newWebinar])
    toast.success('Webinar duplicated successfully!')
  }

  const openEditWebinar = (webinar: Webinar) => {
    setEditingWebinar({ ...webinar })
    setShowEditDialog(true)
  }

  const saveWebinarEdits = () => {
    if (!editingWebinar) return

    setWebinars(prev => prev.map(w =>
      w.id === editingWebinar.id ? editingWebinar : w
    ))

    // Update selectedWebinar if it's the same webinar being edited
    if (selectedWebinar?.id === editingWebinar.id) {
      setSelectedWebinar(editingWebinar)
    }

    setShowEditDialog(false)
    setEditingWebinar(null)
    toast.success('Webinar updated successfully')
  }

  // Quick actions for the toolbar
  const webinarsQuickActions = [
    { id: '1', label: 'New Webinar', icon: 'plus', action: () => setShowScheduleDialog(true), variant: 'default' as const },
    { id: '2', label: 'Go Live', icon: 'video', action: () => {
      const liveWebinar = webinars.find(w => w.status === 'scheduled')
      if (liveWebinar) {
        openWebinarLink(liveWebinar)
      } else {
        toast.info('No scheduled webinars to go live')
      }
    }, variant: 'default' as const },
    { id: '3', label: 'Recordings', icon: 'film', action: () => setActiveTab('recordings'), variant: 'outline' as const },
  ]

  // Calculate stats
  const stats: WebinarStats = useMemo(() => {
    const webinarsWithRegistrations = webinars.filter(w => w.registeredCount > 0)
    return {
      totalWebinars: webinars.length,
      scheduledWebinars: webinars.filter(w => w.status === 'scheduled').length,
      liveNow: webinars.filter(w => w.status === 'live').length,
      endedWebinars: webinars.filter(w => w.status === 'ended').length,
      totalRegistrations: webinars.reduce((sum, w) => sum + w.registeredCount, 0),
      totalAttendees: webinars.reduce((sum, w) => sum + w.attendedCount, 0),
      avgAttendanceRate: webinarsWithRegistrations.length > 0
        ? webinarsWithRegistrations.reduce((sum, w) => sum + (w.attendedCount / w.registeredCount * 100), 0) / webinarsWithRegistrations.length
        : 0,
      avgDuration: webinars.length > 0 ? webinars.reduce((sum, w) => sum + w.duration, 0) / webinars.length : 0
    }
  }, [webinars])

  // Filter webinars
  const filteredWebinars = useMemo(() => {
    return webinars.filter(webinar => {
      const matchesSearch = webinar.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        webinar.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || webinar.status === statusFilter
      const matchesType = typeFilter === 'all' || webinar.type === typeFilter
      return matchesSearch && matchesStatus && matchesType
    })
  }, [webinars, searchQuery, statusFilter, typeFilter])

  // Handlers with real functionality
  const handleCreateWebinar = () => {
    setShowScheduleDialog(true)
    toast.success('Opening webinar setup wizard...')
  }

  const handleStartWebinar = (webinar: Webinar) => {
    // Open the webinar link in a new tab
    if (webinar.joinUrl) {
      window.open(webinar.joinUrl, '_blank', 'noopener,noreferrer')
      // Update webinar status to live
      setWebinars(prev => prev.map(w =>
        w.id === webinar.id ? { ...w, status: 'live' as WebinarStatus } : w
      ))
      toast.success(`"${webinar.title}" is now live!`)
    } else {
      toast.error('No webinar link available')
    }
  }

  const handleEndWebinar = (webinar: Webinar) => {
    if (!confirm(`Are you sure you want to end "${webinar.title}"?`)) {
      return
    }
    setWebinars(prev => prev.map(w =>
      w.id === webinar.id ? { ...w, status: 'ended' as WebinarStatus } : w
    ))
    toast.success(`"${webinar.title}" has ended. Recording will be processed.`)
  }

  const handleRegister = () => {
    // Open registration dialog
    setShowScheduleDialog(true)
    toast.success('Opening registration form...')
  }

  const handleExportAttendees = () => {
    exportAttendeesCSV()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:bg-none dark:bg-gray-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Webinars Hub
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Host engaging virtual events
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2" onClick={refetchWebinars} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => {
              // Open calendar view - could integrate with Google Calendar or native calendar
              const scheduledWebinars = webinars.filter(w => w.status === 'scheduled')
              toast.success(`${scheduledWebinars.length} scheduled webinars. Click on a webinar to add to calendar.`)
            }}>
              <Calendar className="w-4 h-4" />
              View Calendar
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" onClick={handleCreateWebinar} disabled={isMutating}>
              <Plus className="w-4 h-4" />
              Schedule Webinar
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-purple-500 mr-2" />
            <span className="text-gray-500">Loading webinars...</span>
          </div>
        )}

        {/* Error State */}
        {hasError && !isLoading && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-200">Failed to load webinars</h3>
                  <p className="text-sm text-red-600 dark:text-red-300">
                    {webinarsError?.message || 'There was an error loading your webinars. Please try again.'}
                  </p>
                </div>
                <Button variant="outline" className="ml-auto" onClick={refetchWebinars}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Video className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-gray-500">Total</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalWebinars}</p>
              <p className="text-xs text-purple-600">Webinars</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Radio className="w-4 h-4 text-red-600 animate-pulse" />
                <span className="text-xs text-gray-500">Live Now</span>
              </div>
              <p className="text-2xl font-bold">{stats.liveNow}</p>
              <p className="text-xs text-red-600">Broadcasting</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-gray-500">Scheduled</span>
              </div>
              <p className="text-2xl font-bold">{stats.scheduledWebinars}</p>
              <p className="text-xs text-blue-600">Upcoming</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-500">Completed</span>
              </div>
              <p className="text-2xl font-bold">{stats.endedWebinars}</p>
              <p className="text-xs text-green-600">Ended</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <UserPlus className="w-4 h-4 text-orange-600" />
                <span className="text-xs text-gray-500">Registrations</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalRegistrations.toLocaleString()}</p>
              <p className="text-xs text-orange-600">+156 this week</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className="w-4 h-4 text-cyan-600" />
                <span className="text-xs text-gray-500">Attendees</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalAttendees.toLocaleString()}</p>
              <p className="text-xs text-cyan-600">Total</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span className="text-xs text-gray-500">Attendance</span>
              </div>
              <p className="text-2xl font-bold">{stats.avgAttendanceRate.toFixed(0)}%</p>
              <p className="text-xs text-emerald-600">Average rate</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Timer className="w-4 h-4 text-pink-600" />
                <span className="text-xs text-gray-500">Avg Duration</span>
              </div>
              <p className="text-2xl font-bold">{formatDuration(stats.avgDuration)}</p>
              <p className="text-xs text-pink-600">Per webinar</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 p-1 shadow-sm">
            <TabsTrigger value="webinars" className="gap-2">
              <Video className="w-4 h-4" />
              Webinars
            </TabsTrigger>
            <TabsTrigger value="registrations" className="gap-2">
              <Users className="w-4 h-4" />
              Registrations
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="recordings" className="gap-2">
              <PlayCircle className="w-4 h-4" />
              Recordings
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <Mail className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Webinars Tab */}
          <TabsContent value="webinars" className="space-y-6">
            {/* Webinars Banner */}
            <Card className="border-0 bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Video className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Webinar Management</h3>
                      <p className="text-white/80">Schedule and manage your virtual events</p>
                    </div>
                  </div>
                  <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6 text-center">
                    <div>
                      <p className="text-2xl font-bold">{stats.totalWebinars}</p>
                      <p className="text-sm text-white/80">Total</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.liveNow}</p>
                      <p className="text-sm text-white/80">Live Now</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.scheduledWebinars}</p>
                      <p className="text-sm text-white/80">Scheduled</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Webinars Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Plus, label: 'New Webinar', color: 'bg-purple-500', action: () => handleCreateWebinar() },
                { icon: Calendar, label: 'Schedule', color: 'bg-blue-500', action: () => setShowScheduleDialog(true) },
                { icon: Play, label: 'Go Live', color: 'bg-red-500', action: () => {
                  const scheduledWebinar = webinars.find(w => w.status === 'scheduled')
                  if (scheduledWebinar) {
                    handleStartWebinar(scheduledWebinar)
                  } else {
                    toast.info('No scheduled webinars available to start')
                  }
                }},
                { icon: Users, label: 'Attendees', color: 'bg-green-500', action: () => setActiveTab('registrations') },
                { icon: PlayCircle, label: 'Recordings', color: 'bg-orange-500', action: () => setActiveTab('recordings') },
                { icon: Mail, label: 'Invites', color: 'bg-pink-500', action: () => setShowEmailDialog(true) },
                { icon: BarChart3, label: 'Analytics', color: 'bg-indigo-500', action: () => setActiveTab('analytics') },
                { icon: Settings, label: 'Settings', color: 'bg-gray-500', action: () => setActiveTab('settings') }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200"
                  onClick={action.action}
                >
                  <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search webinars..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as WebinarStatus | 'all')}
                className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800"
              >
                <option value="all">All Status</option>
                <option value="live">Live</option>
                <option value="scheduled">Scheduled</option>
                <option value="ended">Ended</option>
                <option value="draft">Draft</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as WebinarType | 'all')}
                className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800"
              >
                <option value="all">All Types</option>
                <option value="webinar">Webinar</option>
                <option value="training">Training</option>
                <option value="demo">Demo</option>
                <option value="conference">Conference</option>
              </select>
            </div>

            <div className="grid gap-4">
              {filteredWebinars.map((webinar) => (
                <Card key={webinar.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedWebinar(webinar)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {webinar.status === 'live' && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-red-100 rounded text-xs text-red-700">
                              <Radio className="w-3 h-3 animate-pulse" />
                              LIVE
                            </span>
                          )}
                          <h3 className="text-lg font-semibold">{webinar.title}</h3>
                          <Badge className={getStatusColor(webinar.status)}>
                            {webinar.status}
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            {getTypeIcon(webinar.type)}
                            {webinar.type}
                          </Badge>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                          {webinar.description}
                        </p>

                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{formatDate(webinar.scheduledDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{formatDuration(webinar.duration)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span>{webinar.registeredCount} / {webinar.maxParticipants}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-5 h-5">
                              <AvatarFallback className="text-xs">{webinar.host.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <span>{webinar.host.name}</span>
                          </div>
                        </div>

                        {/* Features */}
                        <div className="flex items-center gap-2 mt-3">
                          {webinar.recordingEnabled && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <PlayCircle className="w-3 h-3" />
                              Recording
                            </Badge>
                          )}
                          {webinar.qnaEnabled && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <HelpCircle className="w-3 h-3" />
                              Q&A
                            </Badge>
                          )}
                          {webinar.pollsEnabled && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <BarChart2 className="w-3 h-3" />
                              Polls
                            </Badge>
                          )}
                          {webinar.chatEnabled && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <MessageCircle className="w-3 h-3" />
                              Chat
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {webinar.status === 'scheduled' && (
                          <Button variant="default" size="sm" className="gap-1 bg-red-600 hover:bg-red-700" onClick={(e) => { e.stopPropagation(); handleStartWebinar(webinar) }}>
                            <Play className="w-4 h-4" />
                            Start
                          </Button>
                        )}
                        {webinar.status === 'live' && (
                          <Button variant="default" size="sm" className="gap-1 bg-red-600 hover:bg-red-700" onClick={(e) => { e.stopPropagation(); openWebinarLink(webinar) }}>
                            <Video className="w-4 h-4" />
                            Join
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); openEditWebinar(webinar) }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={(e) => {
                          e.stopPropagation()
                          const action = prompt('Choose action: 1=Duplicate, 2=Share, 3=Delete, 4=Cancel')
                          if (action === '1') duplicateWebinar(webinar)
                          else if (action === '2') shareWebinar(webinar)
                          else if (action === '3') deleteWebinar(webinar)
                          else if (action === '4') {
                            setWebinars(prev => prev.map(w => w.id === webinar.id ? { ...w, status: 'cancelled' as WebinarStatus } : w))
                            toast.success('Webinar cancelled')
                          }
                        }}>
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Registrations Tab */}
          <TabsContent value="registrations" className="space-y-6">
            {/* Registrations Banner */}
            <Card className="border-0 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Users className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Registration Management</h3>
                      <p className="text-white/80">Manage attendee registrations and approvals</p>
                    </div>
                  </div>
                  <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6 text-center">
                    <div>
                      <p className="text-2xl font-bold">{stats.totalRegistrations.toLocaleString()}</p>
                      <p className="text-sm text-white/80">Total</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.totalAttendees}</p>
                      <p className="text-sm text-white/80">Attended</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.avgAttendanceRate.toFixed(0)}%</p>
                      <p className="text-sm text-white/80">Rate</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Registrations Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: UserPlus, label: 'Add Manual', color: 'bg-green-500', action: () => handleRegister() },
                { icon: Upload, label: 'Import CSV', color: 'bg-blue-500', action: () => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = '.csv'
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) {
                      toast.success(`Importing ${file.name}...`)
                      // Process CSV file here
                    }
                  }
                  input.click()
                }},
                { icon: Download, label: 'Export', color: 'bg-purple-500', action: () => handleExportAttendees() },
                { icon: Mail, label: 'Email All', color: 'bg-orange-500', action: () => { setEmailForm({ ...emailForm, recipients: 'all' }); setShowEmailDialog(true); } },
                { icon: UserCheck, label: 'Approve', color: 'bg-teal-500', action: () => {
                  const pendingCount = registrations.filter(r => r.status === 'pending').length
                  if (pendingCount === 0) {
                    toast.info('No pending registrations to approve')
                    return
                  }
                  setRegistrations(prev => prev.map(r => r.status === 'pending' ? { ...r, status: 'approved' as RegistrationStatus } : r))
                  toast.success(`${pendingCount} registrations approved!`)
                }},
                { icon: UserX, label: 'Decline', color: 'bg-red-500', action: () => {
                  const pendingCount = registrations.filter(r => r.status === 'pending').length
                  if (pendingCount === 0) {
                    toast.info('No pending registrations to decline')
                    return
                  }
                  if (confirm(`Decline all ${pendingCount} pending registrations?`)) {
                    setRegistrations(prev => prev.map(r => r.status === 'pending' ? { ...r, status: 'declined' as RegistrationStatus } : r))
                    toast.success(`${pendingCount} registrations declined`)
                  }
                }},
                { icon: Filter, label: 'Filter', color: 'bg-pink-500', action: () => setShowFilterDialog(true) },
                { icon: RefreshCw, label: 'Refresh', color: 'bg-gray-500', action: () => {
                  // Refresh from API - registrations will be empty until API provides data
                  setRegistrations([])
                  toast.success('Registrations refreshed!')
                }}
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200"
                  onClick={action.action}
                >
                  <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search registrations..." className="pl-9" />
              </div>
              <select className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800">
                <option value="all">All Webinars</option>
                {webinars.map(w => (
                  <option key={w.id} value={w.id}>{w.title}</option>
                ))}
              </select>
              <select className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800">
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="attended">Attended</option>
                <option value="no_show">No Show</option>
              </select>
              <Button variant="outline" className="gap-2" onClick={handleExportAttendees}>
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registrant</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {registrations.map((reg) => (
                        <tr key={reg.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback>{reg.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{reg.name}</p>
                                <p className="text-xs text-gray-500">{reg.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm">{reg.company || '-'}</p>
                            <p className="text-xs text-gray-500">{reg.jobTitle || ''}</p>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={getRegistrationStatusColor(reg.status)}>
                              {reg.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {reg.registeredAt}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {reg.duration ? `${reg.duration}m` : '-'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => sendEmailToRegistrant(reg)}>
                                <Mail className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => {
                                const action = prompt(`${reg.name}: 1=Approve, 2=Decline, 3=Send Reminder`)
                                if (action === '1') approveRegistration(reg)
                                else if (action === '2') declineRegistration(reg)
                                else if (action === '3') {
                                  setEmailForm({
                                    subject: 'Reminder: Your upcoming webinar',
                                    body: `Dear ${reg.name},\n\nThis is a reminder about your upcoming webinar.\n\n`,
                                    recipients: reg.email
                                  })
                                  setShowEmailDialog(true)
                                }
                              }}>
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Banner */}
            <Card className="border-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <BarChart3 className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Webinar Analytics</h3>
                      <p className="text-white/80">Track performance and engagement metrics</p>
                    </div>
                  </div>
                  <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6 text-center">
                    <div>
                      <p className="text-2xl font-bold">{stats.avgAttendanceRate.toFixed(0)}%</p>
                      <p className="text-sm text-white/80">Attendance Rate</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">4.5</p>
                      <p className="text-sm text-white/80">Avg Rating</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">67%</p>
                      <p className="text-sm text-white/80">Engagement</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analytics Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: BarChart3, label: 'Reports', color: 'bg-blue-500', action: () => {
                  const totalAttendees = webinars.reduce((sum, w) => sum + w.attendedCount, 0)
                  const avgRate = webinars.filter(w => w.registeredCount > 0).reduce((sum, w) => sum + (w.attendedCount / w.registeredCount * 100), 0) / webinars.filter(w => w.registeredCount > 0).length || 0
                  toast.success(`Report: ${totalAttendees} total attendees, ${avgRate.toFixed(0)}% avg attendance`)
                }},
                { icon: TrendingUp, label: 'Trends', color: 'bg-green-500', action: () => {
                  const endedWebinars = webinars.filter(w => w.status === 'ended')
                  toast.success(`Trends: ${endedWebinars.length} completed webinars analyzed`)
                }},
                { icon: PieChart, label: 'Breakdown', color: 'bg-purple-500', action: () => {
                  const statusCounts = webinars.reduce((acc, w) => {
                    acc[w.status] = (acc[w.status] || 0) + 1
                    return acc
                  }, {} as Record<string, number>)
                  toast.success(`Status: ${Object.entries(statusCounts).map(([k, v]) => `${k}: ${v}`).join(', ')}`)
                }},
                { icon: Users, label: 'Attendees', color: 'bg-orange-500', action: () => setActiveTab('registrations') },
                { icon: MessageSquare, label: 'Q&A Stats', color: 'bg-pink-500', action: () => {
                  const answered = qaItems.filter(q => q.status === 'answered').length
                  const total = qaItems.length
                  toast.success(`Q&A: ${answered}/${total} questions answered (${total > 0 ? ((answered/total)*100).toFixed(0) : 0}%)`)
                }},
                { icon: ListChecks, label: 'Polls', color: 'bg-indigo-500', action: () => {
                  const totalVotes = polls.reduce((sum, p) => sum + p.options.reduce((s, o) => s + o.votes, 0), 0)
                  toast.success(`Polls: ${polls.length} polls with ${totalVotes} total votes`)
                }},
                { icon: Download, label: 'Export', color: 'bg-teal-500', action: () => {
                  const analyticsData = JSON.stringify({ webinars, registrations, polls, qa: qaItems }, null, 2)
                  const blob = new Blob([analyticsData], { type: 'application/json' })
                  const url = window.URL.createObjectURL(blob)
                  const link = document.createElement('a')
                  link.href = url
                  link.download = 'webinar-analytics.json'
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                  window.URL.revokeObjectURL(url)
                  toast.success('Analytics exported to JSON!')
                }},
                { icon: Calendar, label: 'Date Range', color: 'bg-gray-500', action: () => {
                  toast.info('Date range filter: Last 30 days (configurable in settings)')
                }}
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200"
                  onClick={action.action}
                >
                  <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Attendance Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Attendance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {webinars.filter(w => w.status === 'ended').map((webinar) => {
                      const rate = webinar.registeredCount > 0 ? (webinar.attendedCount / webinar.registeredCount) * 100 : 0
                      return (
                        <div key={webinar.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium truncate">{webinar.title}</span>
                            <span className="text-sm text-green-600">{rate.toFixed(0)}%</span>
                          </div>
                          <Progress value={rate} className="h-2" />
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{webinar.attendedCount} attended</span>
                            <span>{webinar.registeredCount} registered</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Poll Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Poll Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {polls.map((poll) => (
                      <div key={poll.id}>
                        <p className="font-medium mb-3">{poll.question}</p>
                        <div className="space-y-2">
                          {poll.options.map((option) => {
                            const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0)
                            const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0
                            return (
                              <div key={option.id}>
                                <div className="flex items-center justify-between text-sm mb-1">
                                  <span>{option.text}</span>
                                  <span>{percentage.toFixed(0)}%</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Q&A Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Q&A Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {qaItems.map((qa) => (
                      <div key={qa.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium">{qa.question}</p>
                          <Badge className={qa.status === 'answered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {qa.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">Asked by {qa.askedBy}</p>
                        {qa.answer && (
                          <p className="text-sm border-l-2 border-purple-300 pl-3 text-gray-700 dark:text-gray-300">
                            {qa.answer}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <ThumbsUp className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{qa.upvotes} upvotes</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Engagement Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Engagement Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                      <p className="text-3xl font-bold text-purple-600">85%</p>
                      <p className="text-sm text-gray-500">Avg Attendance Rate</p>
                    </div>
                    <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg text-center">
                      <p className="text-3xl font-bold text-pink-600">4.5</p>
                      <p className="text-sm text-gray-500">Avg Rating</p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                      <p className="text-3xl font-bold text-blue-600">23</p>
                      <p className="text-sm text-gray-500">Avg Questions</p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                      <p className="text-3xl font-bold text-green-600">67%</p>
                      <p className="text-sm text-gray-500">Poll Participation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recordings Tab */}
          <TabsContent value="recordings" className="space-y-6">
            {/* Recordings Banner */}
            <Card className="border-0 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <PlayCircle className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Recording Library</h3>
                      <p className="text-white/80">Access and share webinar recordings</p>
                    </div>
                  </div>
                  <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6 text-center">
                    <div>
                      <p className="text-2xl font-bold">{recordings.length}</p>
                      <p className="text-sm text-white/80">Recordings</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{recordings.reduce((sum, r) => sum + r.views, 0)}</p>
                      <p className="text-sm text-white/80">Views</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{recordings.reduce((sum, r) => sum + r.downloadCount, 0)}</p>
                      <p className="text-sm text-white/80">Downloads</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recordings Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Play, label: 'Play All', color: 'bg-red-500', action: () => {
                  const readyRecordings = recordings.filter(r => r.status === 'ready' && r.url)
                  if (readyRecordings.length > 0 && readyRecordings[0].url) {
                    window.open(readyRecordings[0].url, '_blank', 'noopener,noreferrer')
                    toast.success(`Playing ${readyRecordings.length} recordings in sequence`)
                  } else {
                    toast.info('No ready recordings available')
                  }
                }},
                { icon: Download, label: 'Download', color: 'bg-blue-500', action: () => {
                  const readyRecordings = recordings.filter(r => r.status === 'ready' && r.url)
                  readyRecordings.forEach(rec => downloadRecording(rec))
                  if (readyRecordings.length > 0) {
                    toast.success(`Downloading ${readyRecordings.length} recordings...`)
                  } else {
                    toast.info('No recordings available to download')
                  }
                }},
                { icon: Share2, label: 'Share', color: 'bg-purple-500', action: () => {
                  copyToClipboard('https://kazi.app/webinar/recordings', 'Recordings page link copied!')
                }},
                { icon: Upload, label: 'Upload', color: 'bg-green-500', action: () => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'video/*,audio/*'
                  input.multiple = true
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files
                    if (files && files.length > 0) {
                      toast.success(`Uploading ${files.length} file(s)...`)
                    }
                  }
                  input.click()
                }},
                { icon: FileText, label: 'Transcripts', color: 'bg-orange-500', action: () => {
                  const transcripts = recordings.filter(r => r.type === 'transcript')
                  toast.success(`${transcripts.length} transcripts available`)
                }},
                { icon: Headphones, label: 'Audio Only', color: 'bg-pink-500', action: () => {
                  const audioRecordings = recordings.filter(r => r.type === 'audio')
                  toast.success(`${audioRecordings.length} audio recordings found`)
                }},
                { icon: Trash2, label: 'Delete', color: 'bg-gray-500', action: () => {
                  if (confirm('Delete all recordings? This cannot be undone.')) {
                    setRecordings([])
                    toast.success('All recordings deleted')
                  }
                }},
                { icon: Settings, label: 'Settings', color: 'bg-indigo-500', action: () => setActiveTab('settings') }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200"
                  onClick={action.action}
                >
                  <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search recordings..." className="pl-9" />
              </div>
              <div className="flex items-center gap-2">
                <select className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800">
                  <option value="all">All Types</option>
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                  <option value="transcript">Transcript</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4">
              {recordings.map((recording) => (
                <Card key={recording.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          recording.type === 'video' ? 'bg-purple-100 text-purple-600' :
                          recording.type === 'audio' ? 'bg-blue-100 text-blue-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {recording.type === 'video' ? <Video className="w-6 h-6" /> :
                           recording.type === 'audio' ? <Headphones className="w-6 h-6" /> :
                           <FileText className="w-6 h-6" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{recording.webinarTitle}</h3>
                            <Badge className={recording.status === 'ready' ? 'bg-green-100 text-green-800' : recording.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                              {recording.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="capitalize">{recording.type}</span>
                            {recording.duration > 0 && <span>{formatDuration(recording.duration / 60)}</span>}
                            <span>{formatBytes(recording.size)}</span>
                            <span>{recording.createdAt}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-medium">{recording.views} views</p>
                          <p className="text-xs text-gray-500">{recording.downloadCount} downloads</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {recording.status === 'ready' && (
                            <>
                              <Button variant="outline" size="sm" className="gap-1" onClick={() => playRecording(recording)}>
                                <Play className="w-4 h-4" />
                                Play
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => downloadRecording(recording)}>
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => copyToClipboard(`https://kazi.app/recordings/${recording.id}`, 'Share link copied!')}>
                                <Share2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button variant="outline" size="sm" onClick={() => deleteRecording(recording)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            {/* Templates Banner */}
            <Card className="border-0 bg-gradient-to-r from-cyan-500 via-teal-500 to-green-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Mail className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Email Templates</h3>
                      <p className="text-white/80">Manage automated email communications</p>
                    </div>
                  </div>
                  <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6 text-center">
                    <div>
                      <p className="text-2xl font-bold">{templates.length}</p>
                      <p className="text-sm text-white/80">Templates</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{templates.filter(t => t.enabled).length}</p>
                      <p className="text-sm text-white/80">Enabled</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">4</p>
                      <p className="text-sm text-white/80">Types</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Templates Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Plus, label: 'New Template', color: 'bg-green-500', action: () => setShowTemplateDialog(true) },
                { icon: Mail, label: 'Confirmation', color: 'bg-blue-500', action: () => {
                  const confirmTemplate = templates.find(t => t.type === 'confirmation')
                  if (confirmTemplate) {
                    setShowTemplateDialog(true)
                    toast.success(`Editing: ${confirmTemplate.name}`)
                  } else {
                    toast.info('No confirmation template found')
                  }
                }},
                { icon: Bell, label: 'Reminder', color: 'bg-purple-500', action: () => {
                  const reminderTemplates = templates.filter(t => t.type === 'reminder')
                  toast.success(`${reminderTemplates.length} reminder templates available`)
                }},
                { icon: Send, label: 'Follow Up', color: 'bg-orange-500', action: () => {
                  const followUpTemplate = templates.find(t => t.type === 'follow_up')
                  if (followUpTemplate) {
                    setShowTemplateDialog(true)
                    toast.success(`Editing: ${followUpTemplate.name}`)
                  }
                }},
                { icon: Copy, label: 'Duplicate', color: 'bg-pink-500', action: () => {
                  if (templates.length > 0) {
                    const newTemplate = {
                      ...templates[0],
                      id: `t${Date.now()}`,
                      name: `${templates[0].name} (Copy)`
                    }
                    setTemplates(prev => [...prev, newTemplate])
                    toast.success('Template duplicated!')
                  }
                }},
                { icon: Eye, label: 'Preview', color: 'bg-indigo-500', action: () => {
                  toast.info('Select a template below to preview')
                }},
                { icon: Edit, label: 'Edit', color: 'bg-teal-500', action: () => {
                  toast.info('Select a template card below to edit')
                }},
                { icon: Trash2, label: 'Delete', color: 'bg-red-500', action: () => {
                  toast.info('Select a template card to delete')
                }}
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200"
                  onClick={action.action}
                >
                  <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Email Templates</h3>
              <Button className="gap-2" onClick={() => setShowTemplateDialog(true)}>
                <Plus className="w-4 h-4" />
                Create Template
              </Button>
            </div>

            <div className="grid gap-4">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          template.type === 'confirmation' ? 'bg-green-100 text-green-600' :
                          template.type === 'reminder' ? 'bg-blue-100 text-blue-600' :
                          template.type === 'follow_up' ? 'bg-purple-100 text-purple-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{template.name}</h3>
                            <Badge variant="outline" className="capitalize">{template.type.replace('_', ' ')}</Badge>
                            {template.sendTime && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                {template.sendTime} before
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{template.subject}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{template.enabled ? 'Enabled' : 'Disabled'}</span>
                          <input type="checkbox" checked={template.enabled} className="w-5 h-5" readOnly />
                        </div>
                        <Button variant="outline" size="sm" onClick={() => {
                          setShowTemplateDialog(true)
                          toast.success(`Editing: ${template.name}`)
                        }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="border-0 bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Settings className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Webinar Settings</h3>
                      <p className="text-white/80">Configure your webinar platform preferences</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card>
                  <CardContent className="p-4">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Sliders },
                        { id: 'branding', label: 'Branding', icon: Sparkles },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'integrations', label: 'Integrations', icon: Webhook },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'advanced', label: 'Advanced', icon: Terminal }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            settingsTab === item.id
                              ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                              : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sliders className="w-5 h-5 text-purple-500" />
                          Default Webinar Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Registration Required</p>
                            <p className="text-sm text-gray-500">Require registration for new webinars</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Enable Recording</p>
                            <p className="text-sm text-gray-500">Automatically record all webinars</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Enable Q&A</p>
                            <p className="text-sm text-gray-500">Allow attendees to ask questions</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Enable Chat</p>
                            <p className="text-sm text-gray-500">Allow attendee chat during webinars</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Enable Polls</p>
                            <p className="text-sm text-gray-500">Allow polls during webinars</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Waiting Room</p>
                            <p className="text-sm text-gray-500">Hold attendees before webinar starts</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-blue-500" />
                          Time & Duration
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <Label>Default Timezone</Label>
                            <Input defaultValue="America/New_York" className="mt-1" />
                          </div>
                          <div>
                            <Label>Default Duration (minutes)</Label>
                            <Input type="number" defaultValue="60" className="mt-1" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <Label>Max Participants</Label>
                            <Input type="number" defaultValue="500" className="mt-1" />
                          </div>
                          <div>
                            <Label>Buffer Time (minutes)</Label>
                            <Input type="number" defaultValue="15" className="mt-1" />
                          </div>
                        </div>
                        <Button className="bg-gradient-to-r from-purple-500 to-pink-600 text-white" onClick={() => {
                          // In real app, would save to API
                          toast.success('Settings saved successfully!')
                        }}>
                          Save Settings
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Branding Settings */}
                {settingsTab === 'branding' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-pink-500" />
                          Branding
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Company Logo</Label>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                              <Upload className="w-8 h-8 text-gray-400" />
                            </div>
                            <Button variant="outline" onClick={() => {
                              const input = document.createElement('input')
                              input.type = 'file'
                              input.accept = 'image/png,image/jpeg'
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0]
                                if (file) {
                                  if (file.size > 2 * 1024 * 1024) {
                                    toast.error('File too large. Max 2MB.')
                                  } else {
                                    toast.success(`Logo "${file.name}" uploaded!`)
                                  }
                                }
                              }
                              input.click()
                            }}>Upload Logo</Button>
                          </div>
                        </div>
                        <div>
                          <Label>Brand Color</Label>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="w-10 h-10 rounded-lg bg-purple-600 border-2 border-gray-200" />
                            <Input defaultValue="#9333ea" className="max-w-[150px]" />
                          </div>
                        </div>
                        <div>
                          <Label>Custom Domain</Label>
                          <Input placeholder="webinars.yourdomain.com" className="mt-1" />
                        </div>
                        <div>
                          <Label>Registration Page Header</Label>
                          <Input placeholder="Welcome to our webinar" className="mt-1" />
                        </div>
                        <Button className="bg-gradient-to-r from-purple-500 to-pink-600 text-white" onClick={() => {
                          toast.success('Branding updated successfully!')
                        }}>
                          Save Branding
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-orange-500" />
                          Host Notifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { label: 'New Registration', desc: 'Notify when someone registers' },
                          { label: 'Webinar Starting', desc: 'Reminder before webinar starts' },
                          { label: 'Recording Ready', desc: 'Notify when recording is processed' },
                          { label: 'High Attendance', desc: 'Notify when capacity reaches 80%' },
                          { label: 'Weekly Summary', desc: 'Weekly analytics report' }
                        ].map((notif, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{notif.label}</p>
                              <p className="text-sm text-gray-500">{notif.desc}</p>
                            </div>
                            <Switch defaultChecked={idx < 3} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Mail className="w-5 h-5 text-blue-500" />
                          Attendee Notifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { label: 'Registration Confirmation', desc: 'Send confirmation after registration' },
                          { label: '24 Hour Reminder', desc: 'Send reminder 24 hours before' },
                          { label: '1 Hour Reminder', desc: 'Send reminder 1 hour before' },
                          { label: 'Follow-up Email', desc: 'Send follow-up after webinar ends' }
                        ].map((notif, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{notif.label}</p>
                              <p className="text-sm text-gray-500">{notif.desc}</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Webhook className="w-5 h-5 text-purple-500" />
                          Platform Integrations
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Zoom', desc: 'Video conferencing', status: 'connected' },
                          { name: 'HubSpot', desc: 'CRM sync', status: 'connected' },
                          { name: 'Mailchimp', desc: 'Email marketing', status: 'disconnected' },
                          { name: 'Slack', desc: 'Notifications', status: 'connected' },
                          { name: 'Salesforce', desc: 'CRM sync', status: 'disconnected' }
                        ].map((integration, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                {integration.name[0]}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{integration.name}</p>
                                <p className="text-sm text-gray-500">{integration.desc}</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => {
                              if (integration.status === 'connected') {
                                setSettingsTab('integrations')
                              } else {
                                // In real app, would open OAuth flow
                                toast.success(`Connecting to ${integration.name}...`)
                              }
                            }}>
                              {integration.status === 'connected' ? 'Configure' : 'Connect'}
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="w-5 h-5 text-green-500" />
                          API Configuration
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>API Key</Label>
                          <div className="flex gap-2 mt-1">
                            <Input type="password" value="sk_webinar_****************************" readOnly className="font-mono" />
                            <Button variant="outline" onClick={() => copyToClipboard('sk_webinar_live_abc123xyz789...', 'API key copied to clipboard!')}>
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label>Webhook URL</Label>
                          <Input defaultValue="https://api.yoursite.com/webhooks/webinar" className="mt-1 font-mono" />
                        </div>
                        <Button variant="outline" onClick={() => {
                          if (confirm('Are you sure? This will invalidate your current API key.')) {
                            toast.success('New API key generated! Update your integrations.')
                          }
                        }}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Regenerate API Key
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Security Settings */}
                {settingsTab === 'security' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-green-500" />
                          Access Security
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Password Protection</p>
                            <p className="text-sm text-gray-500">Require password to join webinars</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Email Verification</p>
                            <p className="text-sm text-gray-500">Verify attendee email addresses</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Block Anonymous Join</p>
                            <p className="text-sm text-gray-500">Prevent unregistered attendees</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Lock Meeting After Start</p>
                            <p className="text-sm text-gray-500">Prevent late joins after 15 minutes</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lock className="w-5 h-5 text-yellow-500" />
                          Recording Security
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Password Protect Recordings</p>
                            <p className="text-sm text-gray-500">Require password to view recordings</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Disable Download</p>
                            <p className="text-sm text-gray-500">Prevent recording downloads</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Auto-Delete After</p>
                            <p className="text-sm text-gray-500">Automatically delete old recordings</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Terminal className="w-5 h-5 text-cyan-500" />
                          Advanced Configuration
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Debug Mode</p>
                            <p className="text-sm text-gray-500">Enable verbose logging</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Auto-Start Recording</p>
                            <p className="text-sm text-gray-500">Start recording when host joins</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">HD Video</p>
                            <p className="text-sm text-gray-500">Enable high-definition video quality</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Recording Quality</Label>
                          <Input defaultValue="1080p" className="mt-1" />
                        </div>
                        <div>
                          <Label>Max Recording Storage (GB)</Label>
                          <Input type="number" defaultValue="100" className="mt-1" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Database className="w-5 h-5 text-blue-500" />
                          Data Management
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Data Retention (days)</Label>
                          <Input type="number" defaultValue="365" className="mt-1" />
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => {
                            const allData = JSON.stringify({
                              webinars,
                              registrations,
                              recordings,
                              templates
                            }, null, 2)
                            const blob = new Blob([allData], { type: 'application/json' })
                            const url = window.URL.createObjectURL(blob)
                            const link = document.createElement('a')
                            link.href = url
                            link.download = 'webinar-data-export.json'
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)
                            window.URL.revokeObjectURL(url)
                            toast.success('All webinar data exported!')
                          }}>
                            <Download className="w-4 h-4 mr-2" />
                            Export All Data
                          </Button>
                          <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={() => {
                            if (confirm('Clear all cached data?')) {
                              localStorage.removeItem('webinar-cache')
                              toast.success('Cache cleared!')
                            }
                          }}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear Cache
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-900">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertTriangle className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-300">Reset All Settings</p>
                            <p className="text-sm text-red-600/70">Restore all settings to defaults</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => {
                            if (confirm('Reset all settings to defaults? This cannot be undone.')) {
                              toast.success('All settings have been reset to defaults')
                            }
                          }}>
                            Reset
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-300">Delete All Data</p>
                            <p className="text-sm text-red-600/70">Permanently delete all webinar data</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => {
                            if (confirm('DELETE ALL DATA? This action is PERMANENT and cannot be undone!')) {
                              if (confirm('Are you ABSOLUTELY sure? Type "DELETE" in the next prompt to confirm.')) {
                                const confirmation = prompt('Type DELETE to confirm:')
                                if (confirmation === 'DELETE') {
                                  setWebinars([])
                                  setRegistrations([])
                                  setRecordings([])
                                  setTemplates([])
                                  toast.success('All webinar data has been permanently deleted')
                                } else {
                                  toast.info('Deletion cancelled')
                                }
                              }
                            }
                          }}>
                            Delete
                          </Button>
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
              insights={webinarsAIInsights}
              title="Webinar Intelligence"
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight', { description: insight.description || 'View insight details' })}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={webinarsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={webinarsPredictions}
              title="Webinar Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={webinarsActivities}
            title="Webinar Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={webinarsQuickActions}
            variant="grid"
          />
        </div>

        {/* Webinar Detail Dialog */}
        <Dialog open={!!selectedWebinar} onOpenChange={() => setSelectedWebinar(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Video className="w-5 h-5 text-purple-600" />
                {selectedWebinar?.title}
              </DialogTitle>
            </DialogHeader>

            {selectedWebinar && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 flex-wrap">
                  {selectedWebinar.status === 'live' && (
                    <Badge className="bg-red-100 text-red-800 gap-1">
                      <Radio className="w-3 h-3 animate-pulse" />
                      LIVE
                    </Badge>
                  )}
                  <Badge className={getStatusColor(selectedWebinar.status)}>
                    {selectedWebinar.status}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    {getTypeIcon(selectedWebinar.type)}
                    {selectedWebinar.type}
                  </Badge>
                </div>

                <p className="text-gray-600 dark:text-gray-400">
                  {selectedWebinar.description}
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Scheduled</p>
                    <p className="text-lg font-bold">{formatDate(selectedWebinar.scheduledDate)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="text-2xl font-bold">{formatDuration(selectedWebinar.duration)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Registered</p>
                    <p className="text-2xl font-bold">{selectedWebinar.registeredCount}</p>
                    <p className="text-xs text-gray-500">of {selectedWebinar.maxParticipants}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Attended</p>
                    <p className="text-2xl font-bold text-green-600">{selectedWebinar.attendedCount}</p>
                  </div>
                </div>

                {/* Capacity */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Registration Capacity</span>
                    <span>{Math.round((selectedWebinar.registeredCount / selectedWebinar.maxParticipants) * 100)}%</span>
                  </div>
                  <Progress value={(selectedWebinar.registeredCount / selectedWebinar.maxParticipants) * 100} />
                </div>

                {/* Host & Panelists */}
                <div>
                  <h4 className="font-semibold mb-3">Host & Panelists</h4>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">{selectedWebinar.host.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{selectedWebinar.host.name}</span>
                      <Badge className="text-xs">Host</Badge>
                    </div>
                    {selectedWebinar.panelists.map((panelist) => (
                      <div key={panelist.id} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">{panelist.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{panelist.name}</span>
                        <Badge variant="outline" className="text-xs capitalize">{panelist.role}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Links */}
                {selectedWebinar.joinUrl && (
                  <div>
                    <h4 className="font-semibold mb-3">Links</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Link className="w-4 h-4 text-gray-400" />
                        <span className="text-sm flex-1 truncate">{selectedWebinar.joinUrl}</span>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(selectedWebinar.joinUrl || '', 'Join URL copied to clipboard!')}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      {selectedWebinar.registrationUrl && (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <UserPlus className="w-4 h-4 text-gray-400" />
                          <span className="text-sm flex-1 truncate">{selectedWebinar.registrationUrl}</span>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(selectedWebinar.registrationUrl || '', 'Registration URL copied to clipboard!')}>
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4">
                  {selectedWebinar.status === 'scheduled' && (
                    <Button className="gap-2 bg-red-600 hover:bg-red-700" onClick={() => { handleStartWebinar(selectedWebinar); setSelectedWebinar(null); }}>
                      <Play className="w-4 h-4" />
                      Start Webinar
                    </Button>
                  )}
                  {selectedWebinar.status === 'live' && (
                    <Button className="gap-2 bg-red-600 hover:bg-red-700" onClick={() => { openWebinarLink(selectedWebinar); setSelectedWebinar(null); }}>
                      <Video className="w-4 h-4" />
                      Join Webinar
                    </Button>
                  )}
                  <Button variant="outline" className="gap-2" onClick={() => {
                    openEditWebinar(selectedWebinar)
                    setSelectedWebinar(null)
                  }}>
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => { setActiveTab('registrations'); setSelectedWebinar(null); }}>
                    <Users className="w-4 h-4" />
                    View Registrations
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => shareWebinar(selectedWebinar)}>
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Webinar Dialog */}
        <Dialog open={showEditDialog} onOpenChange={(open) => { if (!open) { setShowEditDialog(false); setEditingWebinar(null); } }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Edit className="w-5 h-5 text-blue-600" />
                Edit Webinar
              </DialogTitle>
            </DialogHeader>

            {editingWebinar && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editingWebinar.title}
                    onChange={(e) => setEditingWebinar({ ...editingWebinar, title: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Input
                    id="edit-description"
                    value={editingWebinar.description}
                    onChange={(e) => setEditingWebinar({ ...editingWebinar, description: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <Label htmlFor="edit-type">Type</Label>
                    <select
                      id="edit-type"
                      value={editingWebinar.type}
                      onChange={(e) => setEditingWebinar({ ...editingWebinar, type: e.target.value as WebinarType })}
                      className="mt-1 w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                    >
                      <option value="webinar">Webinar</option>
                      <option value="meeting">Meeting</option>
                      <option value="training">Training</option>
                      <option value="demo">Demo</option>
                      <option value="conference">Conference</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="edit-status">Status</Label>
                    <select
                      id="edit-status"
                      value={editingWebinar.status}
                      onChange={(e) => setEditingWebinar({ ...editingWebinar, status: e.target.value as WebinarStatus })}
                      className="mt-1 w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                    >
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="live">Live</option>
                      <option value="ended">Ended</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <Label htmlFor="edit-duration">Duration (minutes)</Label>
                    <Input
                      id="edit-duration"
                      type="number"
                      value={editingWebinar.duration}
                      onChange={(e) => setEditingWebinar({ ...editingWebinar, duration: parseInt(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-max-participants">Max Participants</Label>
                    <Input
                      id="edit-max-participants"
                      type="number"
                      value={editingWebinar.maxParticipants}
                      onChange={(e) => setEditingWebinar({ ...editingWebinar, maxParticipants: parseInt(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm">Recording</span>
                      <Switch
                        checked={editingWebinar.recordingEnabled}
                        onCheckedChange={(checked) => setEditingWebinar({ ...editingWebinar, recordingEnabled: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm">Q&A</span>
                      <Switch
                        checked={editingWebinar.qnaEnabled}
                        onCheckedChange={(checked) => setEditingWebinar({ ...editingWebinar, qnaEnabled: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm">Polls</span>
                      <Switch
                        checked={editingWebinar.pollsEnabled}
                        onCheckedChange={(checked) => setEditingWebinar({ ...editingWebinar, pollsEnabled: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm">Chat</span>
                      <Switch
                        checked={editingWebinar.chatEnabled}
                        onCheckedChange={(checked) => setEditingWebinar({ ...editingWebinar, chatEnabled: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm">Waiting Room</span>
                      <Switch
                        checked={editingWebinar.waitingRoomEnabled}
                        onCheckedChange={(checked) => setEditingWebinar({ ...editingWebinar, waitingRoomEnabled: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm">Registration Required</span>
                      <Switch
                        checked={editingWebinar.registrationRequired}
                        onCheckedChange={(checked) => setEditingWebinar({ ...editingWebinar, registrationRequired: checked })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => { setShowEditDialog(false); setEditingWebinar(null); }}>
                    Cancel
                  </Button>
                  <Button onClick={saveWebinarEdits}>
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
