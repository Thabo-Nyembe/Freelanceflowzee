'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  Phone,
  Plus,
  ArrowLeft,
  CheckCircle,
  Bell,
  Edit,
  Trash2,
  GripVertical,
  CalendarDays,
  CalendarRange,
  LayoutGrid,
  Filter
} from 'lucide-react'
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState, NoDataEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { useCurrentUser } from '@/hooks/use-ai-data'

const logger = createFeatureLogger('ClientZoneCalendar')

// Type Definitions
interface Meeting {
  id: number
  title: string
  description: string
  date: string
  time: string
  duration: number
  meetingType: 'video-call' | 'in-person' | 'phone-call'
  attendees: string[]
  location?: string
  meetingUrl?: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  project: string
  notes?: string
  reminder?: number // minutes before
  calendarType?: 'work' | 'personal' | 'team'
}

interface MeetingFormData {
  title: string
  description: string
  date: string
  time: string
  duration: number
  meetingType: 'video-call' | 'in-person' | 'phone-call'
  attendees: string[]
  location: string
  meetingUrl: string
  project: string
  notes: string
  calendarType: 'work' | 'personal' | 'team'
}

// Available attendees for selection
const AVAILABLE_ATTENDEES = [
  'Sarah Johnson',
  'Michael Chen',
  'John Smith',
  'Alex Thompson',
  'Lisa Wang',
  'David Brown',
  'Emily Davis',
  'Chris Wilson'
]

// Available projects
const AVAILABLE_PROJECTS = [
  'Brand Identity Redesign',
  'Website Development',
  'Mobile App',
  'Marketing Campaign',
  'Product Launch'
]

// Mock Meeting Data
const INITIAL_MEETINGS: Meeting[] = [
  {
    id: 1,
    title: 'Project Review Meeting',
    description: 'Quarterly review of Brand Identity project progress and deliverables',
    date: '2024-02-01',
    time: '14:00',
    duration: 60,
    meetingType: 'video-call',
    attendees: ['Sarah Johnson', 'Michael Chen', 'John Smith'],
    meetingUrl: 'https://meet.google.com/abc-defg-hij',
    status: 'scheduled',
    project: 'Brand Identity Redesign',
    notes: 'Bring logo concepts for final approval',
    calendarType: 'work'
  },
  {
    id: 2,
    title: 'Final Presentation',
    description: 'Final presentation and delivery of all project assets',
    date: '2024-02-05',
    time: '10:00',
    duration: 90,
    meetingType: 'in-person',
    attendees: ['Alex Thompson', 'Lisa Wang', 'John Smith', 'Sarah Johnson'],
    location: '123 Design Studio, Tech Street, City, ST 12345',
    status: 'scheduled',
    project: 'Brand Identity Redesign',
    notes: 'Bring printed samples and presentation deck',
    calendarType: 'work'
  },
  {
    id: 3,
    title: 'Website Walkthrough',
    description: 'Complete walkthrough of the new website functionality',
    date: '2024-01-30',
    time: '15:00',
    duration: 45,
    meetingType: 'video-call',
    attendees: ['Alex Thompson', 'Lisa Wang'],
    meetingUrl: 'https://meet.google.com/xyz-uvwx-yz',
    status: 'scheduled',
    project: 'Website Development',
    calendarType: 'team'
  },
  {
    id: 4,
    title: 'Weekly Sync',
    description: 'Weekly project update and discussion',
    date: '2024-01-25',
    time: '11:00',
    duration: 30,
    meetingType: 'phone-call',
    attendees: ['Sarah Johnson'],
    status: 'completed',
    project: 'Brand Identity Redesign',
    notes: 'Discussed color palette feedback',
    calendarType: 'work'
  },
  {
    id: 5,
    title: 'Project Kickoff',
    description: 'Initial project kickoff and requirements discussion',
    date: '2024-01-15',
    time: '09:00',
    duration: 120,
    meetingType: 'video-call',
    attendees: ['Sarah Johnson', 'Michael Chen', 'Alex Thompson'],
    meetingUrl: 'https://meet.google.com/old-meeting-link',
    status: 'completed',
    project: 'Website Development',
    notes: 'Defined scope and timeline',
    calendarType: 'team'
  }
]

const DEFAULT_FORM_DATA: MeetingFormData = {
  title: '',
  description: '',
  date: '',
  time: '',
  duration: 30,
  meetingType: 'video-call',
  attendees: [],
  location: '',
  meetingUrl: '',
  project: '',
  notes: '',
  calendarType: 'work'
}

export default function CalendarPage() {
  const router = useRouter()

  // A+++ UTILITIES
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all')
  const [filterCalendarType, setFilterCalendarType] = useState<'all' | 'work' | 'personal' | 'team'>('all')
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('week')

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showReminderDialog, setShowReminderDialog] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  // Form state
  const [formData, setFormData] = useState<MeetingFormData>(DEFAULT_FORM_DATA)
  const [editingMeetingId, setEditingMeetingId] = useState<number | null>(null)
  const [deletingMeeting, setDeletingMeeting] = useState<Meeting | null>(null)
  const [reminderMeeting, setReminderMeeting] = useState<Meeting | null>(null)
  const [reminderMinutes, setReminderMinutes] = useState<number>(15)
  const [inviteMeeting, setInviteMeeting] = useState<Meeting | null>(null)
  const [newAttendees, setNewAttendees] = useState<string[]>([])

  // Drag and drop state
  const [draggedMeeting, setDraggedMeeting] = useState<Meeting | null>(null)

  // Form submission states
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load Calendar Data
  useEffect(() => {
    const loadCalendarData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simulate data loading
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve(null)
          }, 500)
        })

        setMeetings(INITIAL_MEETINGS)
        setIsLoading(false)
        announce('Calendar loaded successfully', 'polite')
        logger.info('Calendar data loaded', {
          meetingCount: INITIAL_MEETINGS.length
        })
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load calendar'
        setError(errorMsg)
        setIsLoading(false)
        announce('Error loading calendar', 'assertive')
        logger.error('Failed to load calendar', { error: err })
      }
    }

    loadCalendarData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Separate upcoming and past meetings
  const now = new Date()
  const upcomingMeetings = meetings.filter((m) => new Date(`${m.date}T${m.time}`) > now && m.status !== 'cancelled')
  const pastMeetings = meetings.filter((m) => new Date(`${m.date}T${m.time}`) <= now || m.status === 'completed')

  // Filter meetings by status and calendar type
  const filteredMeetings = meetings.filter((m) => {
    const statusMatch = filterStatus === 'all'
      ? true
      : filterStatus === 'upcoming'
        ? new Date(`${m.date}T${m.time}`) > now && m.status !== 'cancelled'
        : filterStatus === 'completed'
          ? m.status === 'completed' || new Date(`${m.date}T${m.time}`) <= now
          : m.status === 'cancelled'

    const calendarMatch = filterCalendarType === 'all' || m.calendarType === filterCalendarType

    return statusMatch && calendarMatch
  })

  // Reset form data
  const resetFormData = useCallback(() => {
    setFormData(DEFAULT_FORM_DATA)
    setEditingMeetingId(null)
  }, [])

  // Handle form input change
  const handleFormChange = (field: keyof MeetingFormData, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Toggle attendee selection
  const toggleAttendee = (attendee: string) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.includes(attendee)
        ? prev.attendees.filter(a => a !== attendee)
        : [...prev.attendees, attendee]
    }))
  }

  // Handle Join Meeting
  const handleJoinMeeting = async (meeting: Meeting) => {
    if (!meeting.meetingUrl) {
      toast.error('No meeting URL available', {
        description: 'This meeting does not have a video call link'
      })
      return
    }

    logger.info('Join meeting initiated', {
      meetingId: meeting.id,
      meetingTitle: meeting.title,
      meetingType: meeting.meetingType
    })

    try {
      await toast.promise(
        fetch('/api/meetings/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            meetingId: meeting.id,
            meetingTitle: meeting.title,
            participantName: 'Current User'
          })
        }).then(res => {
          if (!res.ok) throw new Error('Failed to join meeting')
          return res
        }),
        {
          loading: `Connecting to ${meeting.title}...`,
          success: `Joining ${meeting.title}`,
          error: 'Failed to join meeting'
        }
      )

      // Open meeting URL
      window.open(meeting.meetingUrl, '_blank')
    } catch (error: any) {
      logger.error('Failed to join meeting', { error, meetingId: meeting.id })
    }
  }

  // Handle Create Meeting
  const handleCreateMeeting = async () => {
    if (!formData.title || !formData.date || !formData.time) {
      toast.error('Please fill in required fields', {
        description: 'Title, date, and time are required'
      })
      return
    }

    setIsSubmitting(true)
    logger.info('Create meeting initiated', { formData })

    try {
      await toast.promise(
        fetch('/api/meetings/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        }).then(async res => {
          // Even if API fails, create locally for demo
          const newMeeting: Meeting = {
            id: Date.now(),
            title: formData.title,
            description: formData.description,
            date: formData.date,
            time: formData.time,
            duration: formData.duration,
            meetingType: formData.meetingType,
            attendees: formData.attendees,
            location: formData.location || undefined,
            meetingUrl: formData.meetingUrl || undefined,
            status: 'scheduled',
            project: formData.project,
            notes: formData.notes || undefined,
            calendarType: formData.calendarType
          }

          setMeetings(prev => [...prev, newMeeting])
          return newMeeting
        }),
        {
          loading: 'Creating meeting...',
          success: 'Meeting created successfully',
          error: 'Failed to create meeting'
        }
      )

      setShowCreateDialog(false)
      resetFormData()
      announce('Meeting created successfully', 'polite')
    } catch (error: any) {
      logger.error('Failed to create meeting', { error })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Edit Meeting - Open Dialog
  const handleOpenEditDialog = (meeting: Meeting) => {
    setEditingMeetingId(meeting.id)
    setFormData({
      title: meeting.title,
      description: meeting.description,
      date: meeting.date,
      time: meeting.time,
      duration: meeting.duration,
      meetingType: meeting.meetingType,
      attendees: meeting.attendees,
      location: meeting.location || '',
      meetingUrl: meeting.meetingUrl || '',
      project: meeting.project,
      notes: meeting.notes || '',
      calendarType: meeting.calendarType || 'work'
    })
    setShowEditDialog(true)
  }

  // Handle Save Edit
  const handleSaveEdit = async () => {
    if (!editingMeetingId || !formData.title || !formData.date || !formData.time) {
      toast.error('Please fill in required fields')
      return
    }

    setIsSubmitting(true)
    logger.info('Edit meeting initiated', { meetingId: editingMeetingId, formData })

    try {
      await toast.promise(
        fetch('/api/meetings/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ meetingId: editingMeetingId, ...formData })
        }).then(async () => {
          // Update locally
          setMeetings(prev => prev.map(m =>
            m.id === editingMeetingId
              ? {
                  ...m,
                  title: formData.title,
                  description: formData.description,
                  date: formData.date,
                  time: formData.time,
                  duration: formData.duration,
                  meetingType: formData.meetingType,
                  attendees: formData.attendees,
                  location: formData.location || undefined,
                  meetingUrl: formData.meetingUrl || undefined,
                  project: formData.project,
                  notes: formData.notes || undefined,
                  calendarType: formData.calendarType
                }
              : m
          ))
        }),
        {
          loading: 'Updating meeting...',
          success: 'Meeting updated successfully',
          error: 'Failed to update meeting'
        }
      )

      setShowEditDialog(false)
      resetFormData()
      announce('Meeting updated successfully', 'polite')
    } catch (error: any) {
      logger.error('Failed to update meeting', { error, meetingId: editingMeetingId })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Delete Meeting - Open Confirmation
  const handleOpenDeleteDialog = (meeting: Meeting) => {
    setDeletingMeeting(meeting)
    setShowDeleteDialog(true)
  }

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingMeeting) return

    setIsSubmitting(true)
    logger.info('Delete meeting initiated', { meetingId: deletingMeeting.id })

    try {
      await toast.promise(
        fetch('/api/meetings/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ meetingId: deletingMeeting.id })
        }).then(async () => {
          // Update locally - mark as cancelled
          setMeetings(prev => prev.map(m =>
            m.id === deletingMeeting.id
              ? { ...m, status: 'cancelled' as const }
              : m
          ))
        }),
        {
          loading: `Cancelling ${deletingMeeting.title}...`,
          success: `${deletingMeeting.title} has been cancelled`,
          error: 'Failed to cancel meeting'
        }
      )

      setShowDeleteDialog(false)
      setDeletingMeeting(null)
      announce('Meeting cancelled successfully', 'polite')
    } catch (error: any) {
      logger.error('Failed to delete meeting', { error, meetingId: deletingMeeting.id })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Set Reminder - Open Dialog
  const handleOpenReminderDialog = (meeting: Meeting) => {
    setReminderMeeting(meeting)
    setReminderMinutes(meeting.reminder || 15)
    setShowReminderDialog(true)
  }

  // Handle Save Reminder
  const handleSaveReminder = async () => {
    if (!reminderMeeting) return

    setIsSubmitting(true)
    logger.info('Set reminder initiated', { meetingId: reminderMeeting.id, minutes: reminderMinutes })

    try {
      await toast.promise(
        fetch('/api/meetings/reminder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            meetingId: reminderMeeting.id,
            meetingTitle: reminderMeeting.title,
            minutesBefore: reminderMinutes
          })
        }).then(async () => {
          // Update locally
          setMeetings(prev => prev.map(m =>
            m.id === reminderMeeting.id
              ? { ...m, reminder: reminderMinutes }
              : m
          ))
        }),
        {
          loading: 'Setting reminder...',
          success: `Reminder set for ${reminderMinutes} minutes before`,
          error: 'Failed to set reminder'
        }
      )

      setShowReminderDialog(false)
      setReminderMeeting(null)
      announce(`Reminder set for ${reminderMinutes} minutes before meeting`, 'polite')
    } catch (error: any) {
      logger.error('Failed to set reminder', { error, meetingId: reminderMeeting.id })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Invite Attendees - Open Dialog
  const handleOpenInviteDialog = (meeting: Meeting) => {
    setInviteMeeting(meeting)
    setNewAttendees([])
    setShowInviteDialog(true)
  }

  // Toggle new attendee selection
  const toggleNewAttendee = (attendee: string) => {
    setNewAttendees(prev =>
      prev.includes(attendee)
        ? prev.filter(a => a !== attendee)
        : [...prev, attendee]
    )
  }

  // Handle Send Invites
  const handleSendInvites = async () => {
    if (!inviteMeeting || newAttendees.length === 0) {
      toast.error('Please select at least one attendee')
      return
    }

    setIsSubmitting(true)
    logger.info('Invite attendees initiated', { meetingId: inviteMeeting.id, newAttendees })

    try {
      await toast.promise(
        fetch('/api/meetings/invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            meetingId: inviteMeeting.id,
            attendees: newAttendees
          })
        }).then(async () => {
          // Update locally
          setMeetings(prev => prev.map(m =>
            m.id === inviteMeeting.id
              ? { ...m, attendees: [...new Set([...m.attendees, ...newAttendees])] }
              : m
          ))
        }),
        {
          loading: 'Sending invitations...',
          success: `${newAttendees.length} invitation(s) sent`,
          error: 'Failed to send invitations'
        }
      )

      setShowInviteDialog(false)
      setInviteMeeting(null)
      setNewAttendees([])
      announce(`Invitations sent to ${newAttendees.length} attendee(s)`, 'polite')
    } catch (error: any) {
      logger.error('Failed to send invites', { error, meetingId: inviteMeeting.id })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, meeting: Meeting) => {
    setDraggedMeeting(meeting)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', meeting.id.toString())
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, targetDate: string) => {
    e.preventDefault()
    if (!draggedMeeting) return

    logger.info('Meeting drag-drop reschedule', {
      meetingId: draggedMeeting.id,
      originalDate: draggedMeeting.date,
      newDate: targetDate
    })

    try {
      await toast.promise(
        fetch('/api/meetings/reschedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            meetingId: draggedMeeting.id,
            newDate: targetDate,
            newTime: draggedMeeting.time
          })
        }).then(async () => {
          // Update locally
          setMeetings(prev => prev.map(m =>
            m.id === draggedMeeting.id
              ? { ...m, date: targetDate }
              : m
          ))
        }),
        {
          loading: `Rescheduling ${draggedMeeting.title}...`,
          success: `${draggedMeeting.title} moved to ${new Date(targetDate).toLocaleDateString()}`,
          error: 'Failed to reschedule meeting'
        }
      )

      announce(`Meeting rescheduled to ${new Date(targetDate).toLocaleDateString()}`, 'polite')
    } catch (error: any) {
      logger.error('Failed to reschedule via drag-drop', { error, meetingId: draggedMeeting.id })
    } finally {
      setDraggedMeeting(null)
    }
  }

  // View meeting details
  const handleViewDetails = (meeting: Meeting) => {
    setSelectedMeeting(meeting)
    setShowDetailsDialog(true)
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="container mx-auto space-y-6">
          <CardSkeleton />
          <ListSkeleton items={5} />
        </div>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="container mx-auto">
          <ErrorEmptyState
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Schedule & Meetings</h1>
              <p className="text-gray-600 mt-1">
                Manage meetings, view project timeline, and schedule calls
              </p>
            </div>
          </div>
          <Button
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white gap-2"
            onClick={() => {
              resetFormData()
              setShowCreateDialog(true)
            }}
          >
            <Plus className="h-4 w-4" />
            Schedule Meeting
          </Button>
        </motion.div>

        {/* View Toggle & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center justify-between gap-4"
        >
          {/* Calendar View Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">View:</span>
            <Tabs value={calendarView} onValueChange={(v) => setCalendarView(v as 'day' | 'week' | 'month')}>
              <TabsList>
                <TabsTrigger value="day" className="gap-1">
                  <CalendarDays className="h-4 w-4" />
                  Day
                </TabsTrigger>
                <TabsTrigger value="week" className="gap-1">
                  <CalendarRange className="h-4 w-4" />
                  Week
                </TabsTrigger>
                <TabsTrigger value="month" className="gap-1">
                  <LayoutGrid className="h-4 w-4" />
                  Month
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Filter by Calendar Type */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={filterCalendarType} onValueChange={(v) => setFilterCalendarType(v as typeof filterCalendarType)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Calendars" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Calendars</SelectItem>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="team">Team</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Status Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex gap-2"
        >
          {(['all', 'upcoming', 'completed', 'cancelled'] as const).map(
            (status) => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                onClick={() => setFilterStatus(status)}
                className="capitalize"
              >
                {status === 'all' ? 'All Meetings' : `${status.charAt(0).toUpperCase()}${status.slice(1)}`}
              </Button>
            )
          )}
        </motion.div>

        {/* Drag-Drop Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-gray-500 flex items-center gap-2"
        >
          <GripVertical className="h-4 w-4" />
          Tip: Drag meetings to reschedule them
        </motion.div>

        {/* Upcoming Meetings Section */}
        {filteredMeetings.filter(m => new Date(`${m.date}T${m.time}`) > now && m.status !== 'cancelled').length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Clock className="h-6 w-6 text-blue-600" />
              Upcoming Meetings
            </h2>

            <div className="space-y-4">
              {filteredMeetings
                .filter(m => new Date(`${m.date}T${m.time}`) > now && m.status !== 'cancelled')
                .map((meeting) => (
                  <motion.div
                    key={meeting.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ x: 4 }}
                    draggable
                    onDragStart={(e) => handleDragStart(e as any, meeting)}
                    onDragOver={handleDragOver}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-shadow">
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Meeting Details */}
                          <div className="space-y-4">
                            <div className="flex items-start gap-2">
                              <GripVertical className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                  {meeting.title}
                                </h3>
                                <p className="text-gray-600">{meeting.description}</p>
                              </div>
                            </div>

                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="h-4 w-4" />
                                {new Date(meeting.date).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="h-4 w-4" />
                                {meeting.time} ({meeting.duration} min)
                              </div>

                              {meeting.location && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <MapPin className="h-4 w-4" />
                                  {meeting.location}
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2 flex-wrap">
                              <Badge variant="outline">{meeting.project}</Badge>
                              {meeting.calendarType && (
                                <Badge
                                  variant="secondary"
                                  className={
                                    meeting.calendarType === 'work' ? 'bg-blue-100 text-blue-800' :
                                    meeting.calendarType === 'personal' ? 'bg-green-100 text-green-800' :
                                    'bg-purple-100 text-purple-800'
                                  }
                                >
                                  {meeting.calendarType}
                                </Badge>
                              )}
                              {meeting.reminder && (
                                <Badge variant="outline" className="bg-yellow-50">
                                  <Bell className="h-3 w-3 mr-1" />
                                  {meeting.reminder}m
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Attendees & Meeting Type */}
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Attendees ({meeting.attendees.length})
                              </p>
                              <div className="space-y-1">
                                {meeting.attendees.slice(0, 3).map((attendee) => (
                                  <div
                                    key={attendee}
                                    className="text-sm text-gray-700 p-2 bg-gray-50 rounded"
                                  >
                                    {attendee}
                                  </div>
                                ))}
                                {meeting.attendees.length > 3 && (
                                  <div className="text-sm text-gray-500 p-2">
                                    +{meeting.attendees.length - 3} more
                                  </div>
                                )}
                              </div>
                            </div>

                            <div>
                              <p className="text-sm font-medium text-gray-600 mb-2">Meeting Type</p>
                              <div className="flex items-center gap-2">
                                {meeting.meetingType === 'video-call' && (
                                  <>
                                    <Video className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm">Video Call</span>
                                  </>
                                )}
                                {meeting.meetingType === 'phone-call' && (
                                  <>
                                    <Phone className="h-4 w-4 text-green-600" />
                                    <span className="text-sm">Phone Call</span>
                                  </>
                                )}
                                {meeting.meetingType === 'in-person' && (
                                  <>
                                    <MapPin className="h-4 w-4 text-purple-600" />
                                    <span className="text-sm">In-Person</span>
                                  </>
                                )}
                              </div>
                            </div>

                            {meeting.notes && (
                              <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Notes</p>
                                <p className="text-sm text-gray-700 bg-yellow-50 p-2 rounded">
                                  {meeting.notes}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-2">
                            {meeting.meetingUrl && (
                              <Button
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white gap-2"
                                onClick={() => handleJoinMeeting(meeting)}
                              >
                                <Video className="h-4 w-4" />
                                Join Meeting
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              onClick={() => handleOpenReminderDialog(meeting)}
                              className="gap-2"
                            >
                              <Bell className="h-4 w-4" />
                              Set Reminder
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleOpenInviteDialog(meeting)}
                              className="gap-2"
                            >
                              <Users className="h-4 w-4" />
                              Invite Attendees
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleOpenEditDialog(meeting)}
                              className="gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleOpenDeleteDialog(meeting)}
                              className="gap-2 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}

        {/* Past Meetings Section */}
        {filteredMeetings.filter(m => new Date(`${m.date}T${m.time}`) <= now || m.status === 'completed').length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Past Meetings
            </h2>

            <div className="space-y-3">
              {filteredMeetings
                .filter(m => new Date(`${m.date}T${m.time}`) <= now || m.status === 'completed')
                .map((meeting) => (
                  <motion.div
                    key={meeting.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Card className="bg-gray-50/70 backdrop-blur-sm border-gray-200/40 shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {meeting.title}
                            </h4>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              <span>
                                {new Date(meeting.date).toLocaleDateString()} at{' '}
                                {meeting.time}
                              </span>
                              <span>{meeting.project}</span>
                              <Badge variant="outline" className="ml-auto">
                                {meeting.status}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(meeting)}
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {filteredMeetings.length === 0 && (
          <NoDataEmptyState
            title="No meetings found"
            description="Schedule a meeting with your project team to get started."
          />
        )}

        {/* Timeline Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white justify-start gap-2 h-auto py-3"
                  onClick={() => {
                    resetFormData()
                    setShowCreateDialog(true)
                  }}
                >
                  <Plus className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-semibold">Schedule Meeting</p>
                    <p className="text-xs opacity-90">Create new meeting</p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start gap-2 h-auto py-3"
                  onClick={async () => {
                    logger.info('Project timeline view opened')
                    await toast.promise(
                      fetch('/api/calendar/timeline').then(res => {
                        if (!res.ok) throw new Error('Failed to load timeline')
                        return res.json()
                      }),
                      {
                        loading: 'Loading project timeline...',
                        success: 'Project timeline ready',
                        error: 'Failed to load timeline'
                      }
                    )
                  }}
                >
                  <Calendar className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-semibold">View Timeline</p>
                    <p className="text-xs">See all project dates</p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start gap-2 h-auto py-3"
                  onClick={async () => {
                    logger.info('Availability calendar opened')
                    await toast.promise(
                      fetch('/api/calendar/availability').then(res => {
                        if (!res.ok) throw new Error('Failed to load availability')
                        return res.json()
                      }),
                      {
                        loading: 'Opening availability calendar...',
                        success: 'Availability calendar ready',
                        error: 'Failed to load availability'
                      }
                    )
                  }}
                >
                  <Clock className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-semibold">Check Availability</p>
                    <p className="text-xs">Find best meeting time</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Meeting Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {meetings.length}
              </p>
              <p className="text-sm text-gray-600">Total Meetings</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">
                {upcomingMeetings.length}
              </p>
              <p className="text-sm text-gray-600">Upcoming</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {pastMeetings.length}
              </p>
              <p className="text-sm text-gray-600">Completed</p>
            </CardContent>
          </Card>
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">
                {meetings.reduce((acc, m) => acc + m.duration, 0)}
              </p>
              <p className="text-sm text-gray-600">Total Minutes</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Create Meeting Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule New Meeting</DialogTitle>
            <DialogDescription>
              Fill in the details to schedule a new meeting
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Meeting title"
                  value={formData.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <Select value={formData.project} onValueChange={(v) => handleFormChange('project', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_PROJECTS.map((project) => (
                      <SelectItem key={project} value={project}>{project}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Meeting description"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleFormChange('date', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleFormChange('time', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (min)</Label>
                <Select value={formData.duration.toString()} onValueChange={(v) => handleFormChange('duration', parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meetingType">Meeting Type</Label>
                <Select value={formData.meetingType} onValueChange={(v) => handleFormChange('meetingType', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video-call">Video Call</SelectItem>
                    <SelectItem value="phone-call">Phone Call</SelectItem>
                    <SelectItem value="in-person">In-Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="calendarType">Calendar</Label>
                <Select value={formData.calendarType} onValueChange={(v) => handleFormChange('calendarType', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.meetingType === 'video-call' && (
              <div className="space-y-2">
                <Label htmlFor="meetingUrl">Meeting URL</Label>
                <Input
                  id="meetingUrl"
                  placeholder="https://meet.google.com/..."
                  value={formData.meetingUrl}
                  onChange={(e) => handleFormChange('meetingUrl', e.target.value)}
                />
              </div>
            )}

            {formData.meetingType === 'in-person' && (
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Meeting location"
                  value={formData.location}
                  onChange={(e) => handleFormChange('location', e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Attendees</Label>
              <div className="grid grid-cols-2 gap-2 p-3 border rounded-md max-h-40 overflow-y-auto">
                {AVAILABLE_ATTENDEES.map((attendee) => (
                  <div key={attendee} className="flex items-center space-x-2">
                    <Checkbox
                      id={`attendee-${attendee}`}
                      checked={formData.attendees.includes(attendee)}
                      onCheckedChange={() => toggleAttendee(attendee)}
                    />
                    <label
                      htmlFor={`attendee-${attendee}`}
                      className="text-sm cursor-pointer"
                    >
                      {attendee}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes"
                value={formData.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateMeeting}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              {isSubmitting ? 'Creating...' : 'Create Meeting'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Meeting Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Meeting</DialogTitle>
            <DialogDescription>
              Update meeting details
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  placeholder="Meeting title"
                  value={formData.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-project">Project</Label>
                <Select value={formData.project} onValueChange={(v) => handleFormChange('project', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_PROJECTS.map((project) => (
                      <SelectItem key={project} value={project}>{project}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Meeting description"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date *</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleFormChange('date', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-time">Time *</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleFormChange('time', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duration (min)</Label>
                <Select value={formData.duration.toString()} onValueChange={(v) => handleFormChange('duration', parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-meetingType">Meeting Type</Label>
                <Select value={formData.meetingType} onValueChange={(v) => handleFormChange('meetingType', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video-call">Video Call</SelectItem>
                    <SelectItem value="phone-call">Phone Call</SelectItem>
                    <SelectItem value="in-person">In-Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-calendarType">Calendar</Label>
                <Select value={formData.calendarType} onValueChange={(v) => handleFormChange('calendarType', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.meetingType === 'video-call' && (
              <div className="space-y-2">
                <Label htmlFor="edit-meetingUrl">Meeting URL</Label>
                <Input
                  id="edit-meetingUrl"
                  placeholder="https://meet.google.com/..."
                  value={formData.meetingUrl}
                  onChange={(e) => handleFormChange('meetingUrl', e.target.value)}
                />
              </div>
            )}

            {formData.meetingType === 'in-person' && (
              <div className="space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  placeholder="Meeting location"
                  value={formData.location}
                  onChange={(e) => handleFormChange('location', e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Attendees</Label>
              <div className="grid grid-cols-2 gap-2 p-3 border rounded-md max-h-40 overflow-y-auto">
                {AVAILABLE_ATTENDEES.map((attendee) => (
                  <div key={attendee} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-attendee-${attendee}`}
                      checked={formData.attendees.includes(attendee)}
                      onCheckedChange={() => toggleAttendee(attendee)}
                    />
                    <label
                      htmlFor={`edit-attendee-${attendee}`}
                      className="text-sm cursor-pointer"
                    >
                      {attendee}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                placeholder="Additional notes"
                value={formData.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Meeting?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel &quot;{deletingMeeting?.title}&quot;? All participants will be notified of the cancellation. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingMeeting(null)}>
              Keep Meeting
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isSubmitting ? 'Cancelling...' : 'Cancel Meeting'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Set Reminder Dialog */}
      <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Reminder</DialogTitle>
            <DialogDescription>
              Choose when to be reminded about &quot;{reminderMeeting?.title}&quot;
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="reminder-time">Remind me</Label>
            <Select value={reminderMinutes.toString()} onValueChange={(v) => setReminderMinutes(parseInt(v))}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 minutes before</SelectItem>
                <SelectItem value="10">10 minutes before</SelectItem>
                <SelectItem value="15">15 minutes before</SelectItem>
                <SelectItem value="30">30 minutes before</SelectItem>
                <SelectItem value="60">1 hour before</SelectItem>
                <SelectItem value="1440">1 day before</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReminderDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveReminder}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Setting...' : 'Set Reminder'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Attendees Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Attendees</DialogTitle>
            <DialogDescription>
              Add more attendees to &quot;{inviteMeeting?.title}&quot;
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label>Select attendees to invite</Label>
            <div className="grid grid-cols-1 gap-2 p-3 border rounded-md mt-2 max-h-60 overflow-y-auto">
              {AVAILABLE_ATTENDEES.filter(a => !inviteMeeting?.attendees.includes(a)).map((attendee) => (
                <div key={attendee} className="flex items-center space-x-2">
                  <Checkbox
                    id={`invite-${attendee}`}
                    checked={newAttendees.includes(attendee)}
                    onCheckedChange={() => toggleNewAttendee(attendee)}
                  />
                  <label
                    htmlFor={`invite-${attendee}`}
                    className="text-sm cursor-pointer"
                  >
                    {attendee}
                  </label>
                </div>
              ))}
              {AVAILABLE_ATTENDEES.filter(a => !inviteMeeting?.attendees.includes(a)).length === 0 && (
                <p className="text-sm text-gray-500">All available attendees have been invited</p>
              )}
            </div>
            {newAttendees.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {newAttendees.length} attendee(s) selected
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendInvites}
              disabled={isSubmitting || newAttendees.length === 0}
            >
              {isSubmitting ? 'Sending...' : 'Send Invitations'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Meeting Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedMeeting?.title}</DialogTitle>
            <DialogDescription>
              Meeting details and information
            </DialogDescription>
          </DialogHeader>

          {selectedMeeting && (
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="text-gray-900">{selectedMeeting.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="text-gray-900">{new Date(selectedMeeting.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Time</p>
                  <p className="text-gray-900">{selectedMeeting.time} ({selectedMeeting.duration} min)</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Project</p>
                <p className="text-gray-900">{selectedMeeting.project}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <Badge variant="outline">{selectedMeeting.status}</Badge>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Attendees</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedMeeting.attendees.map((attendee) => (
                    <Badge key={attendee} variant="secondary">{attendee}</Badge>
                  ))}
                </div>
              </div>

              {selectedMeeting.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Notes</p>
                  <p className="text-gray-900 bg-yellow-50 p-2 rounded mt-1">{selectedMeeting.notes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
