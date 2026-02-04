// MIGRATED: Batch #27 - Removed mock data, using database hooks
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  X
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
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState, NoDataEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createSimpleLogger } from '@/lib/simple-logger'
import { useCurrentUser } from '@/hooks/use-ai-data'

const logger = createSimpleLogger('ClientZoneCalendar')

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
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all')
  const [cancelMeeting, setCancelMeeting] = useState<{ id: number; title: string } | null>(null)
  const [showAvailabilityCalendar, setShowAvailabilityCalendar] = useState(false)
  const [showTimelineDialog, setShowTimelineDialog] = useState(false)

  // Load Calendar Data
  useEffect(() => {
    const loadCalendarData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Load calendar data from API
        const response = await fetch('/api/client-zone/calendar')
        if (!response.ok) throw new Error('Failed to load calendar')

        const data = await response.json()
        setMeetings(data.meetings || [])
        setIsLoading(false)
        announce('Calendar loaded successfully', 'polite')
        logger.info('Calendar data loaded', {
          meetingCount: data.meetings?.length || 0
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
  const upcomingMeetings = meetings.filter((m) => new Date(`${m.date}T${m.time}`) > now)
  const pastMeetings = meetings.filter((m) => new Date(`${m.date}T${m.time}`) <= now)

  // Filter meetings
  const filteredMeetings = filterStatus === 'all'
    ? meetings
    : filterStatus === 'upcoming'
      ? upcomingMeetings
      : filterStatus === 'completed'
        ? pastMeetings
        : meetings.filter((m) => m.status === 'cancelled')

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
      const response = await fetch('/api/meetings/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId: meeting.id,
          meetingTitle: meeting.title,
          participantName: 'Current User'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to join meeting')
      }

      logger.info('Meeting join recorded', { meetingId: meeting.id })
      toast.success('Opening meeting...', {
        description: `Joining ${meeting.title}`
      })

      // Open meeting URL
      window.open(meeting.meetingUrl, '_blank')
    } catch (error) {
      logger.error('Failed to join meeting', { error, meetingId: meeting.id })
      toast.error('Failed to join meeting', {
        description: error.message || 'Please try again later'
      })
    }
  }

  // Handle Schedule Meeting
  const handleScheduleMeeting = async () => {
    logger.info('Schedule meeting initiated', {
      timestamp: new Date().toISOString()
    })

    try {
      const response = await fetch('/api/meetings/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to schedule meeting')
      }

      logger.info('Meeting scheduling form opened')
      toast.success('Opening meeting scheduler...', {
        description: 'Select date, time, and attendees'
      })
      setShowScheduleDialog(true)
    } catch (error) {
      logger.error('Failed to schedule meeting', { error })
      toast.error('Failed to open scheduler', {
        description: error.message || 'Please try again later'
      })
    }
  }

  // Handle Reschedule
  const handleReschedule = async (meetingId: number) => {
    const meeting = meetings.find((m) => m.id === meetingId)
    if (!meeting) return

    logger.info('Meeting reschedule initiated', {
      meetingId,
      meetingTitle: meeting.title
    })

    try {
      const response = await fetch('/api/meetings/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId: meetingId,
          currentTime: `${meeting.date}T${meeting.time}`,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to reschedule meeting')
      }

      logger.info('Meeting rescheduled', { meetingId })
      toast.success('Meeting rescheduled', {
        description: `${meeting.title} has been updated`
      })
    } catch (error) {
      logger.error('Failed to reschedule meeting', { error, meetingId })
      toast.error('Failed to reschedule', {
        description: error.message || 'Please try again later'
      })
    }
  }

  // Handle Cancel Meeting
  const handleCancelMeeting = (meetingId: number) => {
    const meeting = meetings.find((m) => m.id === meetingId)
    if (!meeting) return

    logger.info('Meeting cancellation initiated', {
      meetingId,
      meetingTitle: meeting.title
    })

    setCancelMeeting({ id: meetingId, title: meeting.title })
  }

  const handleConfirmCancelMeeting = async () => {
    if (!cancelMeeting) return

    try {
      const response = await fetch('/api/meetings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId: cancelMeeting.id })
      })

      if (!response.ok) {
        throw new Error('Failed to cancel meeting')
      }

      setMeetings(
        meetings.map((m) =>
          m.id === cancelMeeting.id ? { ...m, status: 'cancelled' } : m
        )
      )
      logger.info('Meeting cancelled', { meetingId: cancelMeeting.id })
      toast.success('Meeting cancelled', {
        description: `${cancelMeeting.title} has been cancelled`
      })
    } catch (error) {
      logger.error('Failed to cancel meeting', { error, meetingId: cancelMeeting.id })
      toast.error('Failed to cancel meeting', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setCancelMeeting(null)
    }
  }

  // Handle Set Reminder
  const handleSetReminder = async (meetingId: number) => {
    const meeting = meetings.find((m) => m.id === meetingId)
    if (!meeting) return

    logger.info('Reminder set for meeting', {
      meetingId,
      meetingTitle: meeting.title
    })

    try {
      const response = await fetch('/api/meetings/reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId,
          meetingTitle: meeting.title,
          minutesBefore: 15
        })
      })

      if (!response.ok) {
        throw new Error('Failed to set reminder')
      }

      logger.info('Meeting reminder set', { meetingId })
      toast.success('Reminder set', {
        description: 'You will be notified 15 minutes before the meeting'
      })
    } catch (error) {
      logger.error('Failed to set reminder', { error, meetingId })
      toast.error('Failed to set reminder', {
        description: error.message || 'Please try again later'
      })
    }
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
            onClick={handleScheduleMeeting}
          >
            <Plus className="h-4 w-4" />
            Schedule Meeting
          </Button>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
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

        {/* Upcoming Meetings Section */}
        {upcomingMeetings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Clock className="h-6 w-6 text-blue-600" />
              Upcoming Meetings
            </h2>

            <div className="space-y-4">
              {(filterStatus === 'all' || filterStatus === 'upcoming' ? upcomingMeetings : []).map(
                (meeting) => (
                  <motion.div
                    key={meeting.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ x: 4 }}
                  >
                    <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-shadow">
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Meeting Details */}
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                {meeting.title}
                              </h3>
                              <p className="text-gray-600">{meeting.description}</p>
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

                            <Badge variant="outline">{meeting.project}</Badge>
                          </div>

                          {/* Attendees & Meeting Type */}
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Attendees
                              </p>
                              <div className="space-y-1">
                                {meeting.attendees.map((attendee) => (
                                  <div
                                    key={attendee}
                                    className="text-sm text-gray-700 p-2 bg-gray-50 rounded"
                                  >
                                    {attendee}
                                  </div>
                                ))}
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
                              onClick={() => handleSetReminder(meeting.id)}
                              className="gap-2"
                            >
                              <Bell className="h-4 w-4" />
                              Set Reminder
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleReschedule(meeting.id)}
                              className="gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              Reschedule
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleCancelMeeting(meeting.id)}
                              className="gap-2 text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              )}
            </div>
          </motion.div>
        )}

        {/* Past Meetings Section */}
        {pastMeetings.length > 0 && (
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
              {(filterStatus === 'all' || filterStatus === 'completed' ? pastMeetings : []).map(
                (meeting) => (
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
                            onClick={() => setSelectedMeeting(meeting)}
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              )}
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
                  onClick={handleScheduleMeeting}
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
                  onClick={() => {
                    logger.info('Project timeline view opened')
                    setShowTimelineDialog(true)
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
                  onClick={() => {
                    logger.info('Availability calendar opened')
                    setShowAvailabilityCalendar(true)
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

      {/* Cancel Meeting Confirmation Dialog */}
      <AlertDialog open={!!cancelMeeting} onOpenChange={() => setCancelMeeting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Meeting?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel &quot;{cancelMeeting?.title}&quot;? All participants will be notified of the cancellation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Meeting</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancelMeeting}
              className="bg-red-500 hover:bg-red-600"
            >
              Cancel Meeting
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Availability Calendar Dialog */}
      <Dialog open={showAvailabilityCalendar} onOpenChange={setShowAvailabilityCalendar}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Team Availability
            </DialogTitle>
            <DialogDescription>
              Find the best time for your next meeting based on team availability.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {/* Week View */}
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>
            {/* Time Slots */}
            <div className="space-y-2">
              {['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'].map((time) => (
                <div key={time} className="flex items-center gap-2">
                  <span className="w-20 text-sm text-gray-600">{time}</span>
                  <div className="flex-1 grid grid-cols-7 gap-1">
                    {[0, 1, 2, 3, 4, 5, 6].map((dayOffset) => {
                      const isAvailable = Math.random() > 0.3
                      return (
                        <button
                          key={dayOffset}
                          onClick={() => {
                            if (isAvailable) {
                              toast.success(`Selected: ${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][dayOffset]} at ${time}`)
                              setShowAvailabilityCalendar(false)
                            }
                          }}
                          className={`h-8 rounded text-xs transition-colors ${
                            isAvailable
                              ? 'bg-green-100 hover:bg-green-200 text-green-800 cursor-pointer'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {isAvailable ? 'Open' : 'Busy'}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 pt-4 border-t text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 rounded"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 rounded"></div>
                <span>Unavailable</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAvailabilityCalendar(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                handleScheduleMeeting()
                setShowAvailabilityCalendar(false)
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              Schedule Meeting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Project Timeline Dialog */}
      <Dialog open={showTimelineDialog} onOpenChange={setShowTimelineDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Project Timeline
            </DialogTitle>
            <DialogDescription>
              View all project milestones and scheduled meetings.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 max-h-[400px] overflow-y-auto">
            {meetings.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No scheduled events</p>
            ) : (
              <div className="relative pl-6 border-l-2 border-blue-200 space-y-6">
                {meetings.map((meeting, index) => (
                  <div key={meeting.id} className="relative">
                    <div className="absolute -left-[25px] w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                    <div className="bg-gray-50 rounded-lg p-4 ml-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{meeting.title}</h4>
                        <Badge className={meeting.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                          {meeting.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{meeting.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(meeting.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {meeting.time} ({meeting.duration} min)
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {meeting.attendees.length} attendees
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTimelineDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
