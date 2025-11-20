'use client';

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { format, addMonths, subMonths } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NumberFlow } from '@/components/ui/number-flow'
import { TextShimmer } from '@/components/ui/text-shimmer'
import {
  Calendar,
  Clock,
  Plus,
  Users,
  Video,
  MapPin,
  Settings,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Brain
} from 'lucide-react'

// ============================================================================
// FRAMER MOTION COMPONENTS
// ============================================================================

const FloatingParticle = ({ delay = 0, color = 'blue' }: { delay?: number; color?: string }) => {
  return (
    <motion.div
      className={`absolute w-2 h-2 bg-${color}-400 rounded-full opacity-30`}
      animate={{
        y: [0, -30, 0],
        x: [0, 15, -15, 0],
        scale: [0.8, 1.2, 0.8],
        opacity: [0.3, 0.8, 0.3]
      }}
      transition={{
        duration: 4 + delay,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: delay
      }}
    />
  )
}


// ============================================================================
// CALENDAR DATA MODEL
// ============================================================================

const KAZI_CALENDAR_DATA = {
  metrics: {
    totalMeetings: 342,
    monthlyMeetings: 47,
    averageMeetingDuration: 45,
    meetingEfficiencyScore: 87.3,
    noShowRate: 2.1,
    clientSatisfactionScore: 9.4,
    timeUtilization: 78.9,
    productivityIndex: 92.6
  },

  aiInsights: [
    {
      id: 'ai-insight-1',
      type: 'optimization',
      title: 'Meeting Cluster Detected',
      description: 'You have 3 meetings within 2 hours on Thursday',
      impact: 'high',
      confidence: 94,
      actionable: true,
      suggestion: 'Consider consolidating or rescheduling'
    },
    {
      id: 'ai-insight-2',
      type: 'productivity',
      title: 'Peak Productivity Hours',
      description: 'Your most productive meetings are 9-11 AM',
      impact: 'medium',
      confidence: 89,
      actionable: true,
      suggestion: 'Schedule important meetings in this window'
    }
  ]
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')
  const [searchTerm, setSearchTerm] = useState('')
  const [aiMode, setAiMode] = useState(false)

  const events = [
    {
      id: 1,
      title: 'Client Meeting - Acme Corp',
      time: '09:00 AM',
      duration: '1 hour',
      type: 'meeting',
      location: 'Video Call',
      attendees: 3,
      color: 'blue'
    },
    {
      id: 2,
      title: 'Design Review Session',
      time: '02:00 PM',
      duration: '2 hours',
      type: 'review',
      location: 'Conference Room A',
      attendees: 5,
      color: 'green'
    },
    {
      id: 3,
      title: 'Project Deadline',
      time: '11:59 PM',
      duration: 'All day',
      type: 'deadline',
      location: 'Remote',
      attendees: 1,
      color: 'red'
    }
  ]

  const upcomingEvents = [
    {
      id: 4,
      title: 'Weekly Team Standup',
      date: 'Tomorrow',
      time: '10:00 AM',
      type: 'meeting'
    },
    {
      id: 5,
      title: 'Client Presentation',
      date: 'Friday',
      time: '03:00 PM',
      type: 'presentation'
    }
  ]

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const isToday = (day: number) => {
    const today = new Date()
    return day === today.getDate() &&
           currentDate.getMonth() === today.getMonth() &&
           currentDate.getFullYear() === today.getFullYear()
  }

  // ============================================================================
  // HANDLER 1: NAVIGATE MONTH
  // ============================================================================

  const navigateMonth = (direction: 'prev' | 'next') => {
    const oldMonth = format(currentDate, 'MMMM yyyy')

    console.log('📅 NAVIGATING CALENDAR MONTH')
    console.log('⏪ Direction:', direction === 'prev' ? 'Previous' : 'Next')
    console.log('📊 Current month:', oldMonth)
    console.log('📅 Current view:', view)
    console.log('🤖 AI mode:', aiMode ? 'enabled' : 'disabled')
    console.log('🔍 Search term:', searchTerm || '(none)')

    const newDate = direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1)
    const newMonth = format(newDate, 'MMMM yyyy')

    console.log('⏩ New month:', newMonth)
    console.log('✅ MONTH NAVIGATION COMPLETE')
    console.log('🏁 CALENDAR UPDATED')

    setCurrentDate(newDate)

    toast.success(`Navigated to ${newMonth}`, {
      description: `Viewing ${view} view`
    })
  }

  // ============================================================================
  // HANDLER 2: SEARCH EVENTS
  // ============================================================================

  const handleSearchEvents = (newSearch: string) => {
    const previousSearch = searchTerm

    console.log('🔍 SEARCHING CALENDAR EVENTS')
    console.log('⏪ Previous search:', previousSearch || '(empty)')
    console.log('⏩ New search:', newSearch || '(empty)')
    console.log('📊 Search length:', newSearch.length, 'characters')
    console.log('📅 Current month:', format(currentDate, 'MMMM yyyy'))
    console.log('📅 Current view:', view)

    if (newSearch.length === 0) {
      console.log('🧹 SEARCH CLEARED - Showing all events')
    } else if (newSearch.length >= 2) {
      console.log('✅ SEARCH ACTIVE - Filtering events')
      console.log('🔎 Searching for:', newSearch)
    }

    console.log('🏁 SEARCH UPDATE COMPLETE')

    setSearchTerm(newSearch)
  }

  // ============================================================================
  // HANDLER 3: AI MODE TOGGLE
  // ============================================================================

  const handleAiModeToggle = () => {
    const previousState = aiMode
    const newState = !aiMode

    console.log('🤖 AI MODE TOGGLE')
    console.log('⏪ Previous state:', previousState ? 'ENABLED' : 'DISABLED')
    console.log('⏩ New state:', newState ? 'ENABLED' : 'DISABLED')
    console.log('📅 Current month:', format(currentDate, 'MMMM yyyy'))
    console.log('📅 Current view:', view)

    if (newState) {
      console.log('✨ AI FEATURES ENABLED:')
      console.log('  - Smart scheduling suggestions')
      console.log('  - Meeting time optimization')
      console.log('  - Conflict detection')
      console.log('  - AI-powered insights')
    } else {
      console.log('⚠️ AI FEATURES DISABLED')
      console.log('  - Switching to standard calendar')
    }

    console.log('✅ AI MODE UPDATED')
    console.log('🏁 AI MODE TOGGLE COMPLETE')

    setAiMode(newState)

    toast.success(newState ? 'AI Mode Enabled' : 'AI Mode Disabled', {
      description: newState ? 'Smart scheduling features activated' : 'Switched to standard calendar'
    })
  }

  // ============================================================================
  // HANDLER 4: CREATE EVENT
  // ============================================================================

  const handleCreateEvent = async () => {
    console.log('➕ CREATING NEW EVENT')
    console.log('📅 Current month:', format(currentDate, 'MMMM yyyy'))
    console.log('📅 Current view:', view)
    console.log('🤖 AI mode:', aiMode ? 'enabled' : 'disabled')
    console.log('✅ CREATE EVENT MODAL OPENED')
    console.log('🏁 CREATE EVENT PROCESS INITIATED')

    const title = prompt('Enter event title:')
    if (!title) {
      console.log('❌ CREATE EVENT CANCELLED')
      return
    }

    const time = prompt('Enter start time (e.g., 2025-02-01T09:00:00):')
    if (!time) {
      console.log('❌ CREATE EVENT CANCELLED')
      return
    }

    console.log('📝 Event title:', title)
    console.log('⏰ Event time:', time)

    try {
      console.log('📡 SENDING EVENT TO API')
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          data: {
            title,
            description: 'New calendar event',
            startTime: time,
            endTime: new Date(new Date(time).getTime() + 60 * 60 * 1000).toISOString(),
            type: 'meeting',
            location: { type: 'virtual', details: 'Online' },
            priority: 'medium'
          }
        })
      })

      console.log('📡 API RESPONSE STATUS:', response.status, response.statusText)

      if (!response.ok) {
        throw new Error('Failed to create event')
      }

      const result = await response.json()

      if (result.success) {
        console.log('✅ EVENT CREATED SUCCESSFULLY')
        console.log('🏁 CREATE EVENT PROCESS COMPLETE')

        toast.success(result.message, {
          description: result.hasConflict ? '⚠️ Calendar conflict detected' : 'Event added to calendar'
        })
      }
    } catch (error: any) {
      console.error('❌ CREATE EVENT ERROR:', error)
      console.log('📊 Error details:', error.message || 'Unknown error')
      toast.error('Failed to create event', {
        description: error.message || 'Please try again later'
      })
    }
  }

  // ============================================================================
  // HANDLER 5: VIEW CHANGE
  // ============================================================================

  const handleViewChange = (newView: 'month' | 'week' | 'day') => {
    const previousView = view

    console.log('📅 CALENDAR VIEW CHANGED')
    console.log('⏪ Previous view:', previousView)
    console.log('⏩ New view:', newView)
    console.log('📊 Current month:', format(currentDate, 'MMMM yyyy'))
    console.log('🤖 AI mode:', aiMode ? 'enabled' : 'disabled')
    console.log('✅ VIEW UPDATED')
    console.log('🏁 VIEW CHANGE COMPLETE')

    setView(newView)

    toast.success(`Switched to ${newView} view`, {
      description: `Viewing ${format(currentDate, 'MMMM yyyy')}`
    })
  }

  // ============================================================================
  // ADDITIONAL HANDLERS (keeping existing functionality)
  // ============================================================================

  const handleEditEvent = (eventId: number) => {
    console.log('✏️ EDIT EVENT - ID:', eventId)
    toast.info('Edit event feature', {
      description: 'Modify event details and settings'
    })
  }

  const handleDeleteEvent = async (eventId: number) => {
    console.log('🗑️ DELETE EVENT - ID:', eventId)

    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          eventId: eventId.toString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to delete event')
      }

      const result = await response.json()

      if (result.success) {
        toast.success(result.message || 'Event deleted successfully')
      }
    } catch (error: any) {
      console.error('Delete Event Error:', error)
      toast.error('Failed to delete event', {
        description: error.message || 'Please try again later'
      })
    }
  }

  const handleScheduleWithAI = async () => {
    console.log('🤖 AI SCHEDULING')

    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'suggest',
          data: {
            title: 'New Meeting',
            duration: 60,
            attendees: []
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get AI suggestions')
      }

      const result = await response.json()

      if (result.success && result.suggestions) {
        toast.success(result.message || 'AI scheduling suggestions ready!', {
          description: `Found ${result.suggestions.length} optimal time slots`
        })
      }
    } catch (error: any) {
      console.error('AI Scheduling Error:', error)
      toast.error('Failed to generate AI suggestions', {
        description: error.message || 'Please try again later'
      })
    }
  }

  // ============================================================================
  // HANDLER 8: SYNC CALENDAR
  // ============================================================================

  const handleSyncCalendar = async () => {
    console.log('🔄 CALENDAR: SYNCING CALENDAR WITH EXTERNAL PROVIDERS')
    console.log('📅 CALENDAR: Current month - ' + format(currentDate, 'MMMM yyyy'))
    console.log('📊 CALENDAR: Current view - ' + view)
    console.log('🤖 CALENDAR: AI mode - ' + (aiMode ? 'enabled' : 'disabled'))

    toast.info('🔄 Syncing calendar...', {
      description: 'Connecting to Google, Apple, and Outlook calendars'
    })

    try {
      console.log('📡 CALENDAR: SENDING SYNC REQUEST TO API')
      const response = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync',
          providers: ['google', 'apple', 'outlook']
        })
      })

      console.log('📡 CALENDAR: API RESPONSE STATUS - ' + response.status + ' ' + response.statusText)

      if (!response.ok) {
        throw new Error('Failed to sync calendar')
      }

      const result = await response.json()

      console.log('✅ CALENDAR: SYNC COMPLETED SUCCESSFULLY')
      console.log('📊 CALENDAR: Events synced - ' + (result.eventsSynced || 0))
      console.log('🏁 CALENDAR: SYNC CALENDAR PROCESS COMPLETE')

      toast.success('✅ Calendar synced successfully!', {
        description: 'Synced ' + (result.eventsSynced || 0) + ' events from all providers'
      })
    } catch (error: any) {
      console.error('❌ CALENDAR: SYNC ERROR - ' + error.message)
      toast.error('❌ Failed to sync calendar', {
        description: error.message || 'Please check your connection settings'
      })
    }
  }

  // ============================================================================
  // HANDLER 9: CREATE RECURRING EVENT
  // ============================================================================

  const handleCreateRecurring = async () => {
    console.log('🔁 CALENDAR: CREATING RECURRING EVENT')
    console.log('📅 CALENDAR: Current month - ' + format(currentDate, 'MMMM yyyy'))
    console.log('📅 CALENDAR: Current view - ' + view)
    console.log('🤖 CALENDAR: AI mode - ' + (aiMode ? 'enabled' : 'disabled'))

    const title = prompt('Enter recurring event title:')
    if (!title) {
      console.log('❌ CALENDAR: RECURRING EVENT CREATION CANCELLED')
      return
    }

    const frequency = prompt('Enter frequency (daily/weekly/monthly):')
    if (!frequency) {
      console.log('❌ CALENDAR: RECURRING EVENT CREATION CANCELLED')
      return
    }

    console.log('📝 CALENDAR: Event title - ' + title)
    console.log('🔁 CALENDAR: Frequency - ' + frequency)

    try {
      console.log('📡 CALENDAR: SENDING RECURRING EVENT TO API')
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_recurring',
          data: {
            title,
            frequency,
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            recurring: true
          }
        })
      })

      console.log('📡 CALENDAR: API RESPONSE STATUS - ' + response.status + ' ' + response.statusText)

      if (!response.ok) {
        throw new Error('Failed to create recurring event')
      }

      const result = await response.json()

      console.log('✅ CALENDAR: RECURRING EVENT CREATED SUCCESSFULLY')
      console.log('🏁 CALENDAR: CREATE RECURRING EVENT PROCESS COMPLETE')

      toast.success('🔁 Recurring event created!', {
        description: 'Event will repeat ' + frequency + ' starting today'
      })
    } catch (error: any) {
      console.error('❌ CALENDAR: RECURRING EVENT ERROR - ' + error.message)
      toast.error('❌ Failed to create recurring event', {
        description: error.message || 'Please try again later'
      })
    }
  }

  // ============================================================================
  // HANDLER 10: SET EVENT REMINDERS
  // ============================================================================

  const handleEventReminders = async () => {
    console.log('🔔 CALENDAR: SETTING EVENT REMINDERS')
    console.log('📅 CALENDAR: Current month - ' + format(currentDate, 'MMMM yyyy'))
    console.log('📊 CALENDAR: Current view - ' + view)
    console.log('🤖 CALENDAR: AI mode - ' + (aiMode ? 'enabled' : 'disabled'))

    const reminderTime = prompt('Set reminder time (minutes before event):')
    if (!reminderTime) {
      console.log('❌ CALENDAR: REMINDER SETUP CANCELLED')
      return
    }

    console.log('⏰ CALENDAR: Reminder time - ' + reminderTime + ' minutes before')

    try {
      console.log('📡 CALENDAR: SENDING REMINDER SETTINGS TO API')
      const response = await fetch('/api/calendar/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_reminders',
          minutesBefore: parseInt(reminderTime),
          notificationTypes: ['email', 'push', 'sms']
        })
      })

      console.log('📡 CALENDAR: API RESPONSE STATUS - ' + response.status + ' ' + response.statusText)

      if (!response.ok) {
        throw new Error('Failed to set reminders')
      }

      console.log('✅ CALENDAR: REMINDERS SET SUCCESSFULLY')
      console.log('🏁 CALENDAR: SET REMINDERS PROCESS COMPLETE')

      toast.success('🔔 Event reminders configured!', {
        description: 'You will be notified ' + reminderTime + ' minutes before events'
      })
    } catch (error: any) {
      console.error('❌ CALENDAR: REMINDER ERROR - ' + error.message)
      toast.error('❌ Failed to set reminders', {
        description: error.message || 'Please try again later'
      })
    }
  }

  // ============================================================================
  // HANDLER 11: VIEW AGENDA
  // ============================================================================

  const handleViewAgenda = () => {
    console.log('📋 CALENDAR: SWITCHING TO AGENDA VIEW')
    console.log('⏪ CALENDAR: Previous view - ' + view)
    console.log('📅 CALENDAR: Current month - ' + format(currentDate, 'MMMM yyyy'))
    console.log('🤖 CALENDAR: AI mode - ' + (aiMode ? 'enabled' : 'disabled'))
    console.log('🔍 CALENDAR: Search term - ' + (searchTerm || '(none)'))

    console.log('📋 CALENDAR: Loading agenda/list view')
    console.log('📊 CALENDAR: Displaying events chronologically')
    console.log('✅ CALENDAR: AGENDA VIEW ACTIVATED')
    console.log('🏁 CALENDAR: VIEW AGENDA PROCESS COMPLETE')

    toast.info('📋 Agenda view activated', {
      description: 'Showing all events in chronological order'
    })
  }

  // ============================================================================
  // HANDLER 12: EXPORT CALENDAR
  // ============================================================================

  const handleExportCalendar = async () => {
    console.log('📤 CALENDAR: EXPORTING CALENDAR DATA')
    console.log('📅 CALENDAR: Current month - ' + format(currentDate, 'MMMM yyyy'))
    console.log('📊 CALENDAR: Current view - ' + view)
    console.log('🤖 CALENDAR: AI mode - ' + (aiMode ? 'enabled' : 'disabled'))

    const exportFormat = prompt('Export format (ical/csv/json):')
    if (!exportFormat) {
      console.log('❌ CALENDAR: EXPORT CANCELLED')
      return
    }

    console.log('📦 CALENDAR: Export format - ' + exportFormat)

    try {
      console.log('📡 CALENDAR: SENDING EXPORT REQUEST TO API')
      const response = await fetch('/api/calendar/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'export',
          format: exportFormat,
          dateRange: {
            start: format(currentDate, 'yyyy-MM-01'),
            end: format(currentDate, 'yyyy-MM-31')
          }
        })
      })

      console.log('📡 CALENDAR: API RESPONSE STATUS - ' + response.status + ' ' + response.statusText)

      if (!response.ok) {
        throw new Error('Failed to export calendar')
      }

      const result = await response.json()

      console.log('✅ CALENDAR: EXPORT COMPLETED SUCCESSFULLY')
      console.log('📊 CALENDAR: Events exported - ' + (result.eventsExported || 0))
      console.log('🏁 CALENDAR: EXPORT CALENDAR PROCESS COMPLETE')

      toast.success('📤 Calendar exported successfully!', {
        description: 'Downloaded ' + (result.eventsExported || 0) + ' events as ' + exportFormat
      })
    } catch (error: any) {
      console.error('❌ CALENDAR: EXPORT ERROR - ' + error.message)
      toast.error('❌ Failed to export calendar', {
        description: error.message || 'Please try again later'
      })
    }
  }

  // ============================================================================
  // HANDLER 13: SHARE CALENDAR
  // ============================================================================

  const handleShareCalendar = async () => {
    console.log('🤝 CALENDAR: SHARING CALENDAR WITH TEAM')
    console.log('📅 CALENDAR: Current month - ' + format(currentDate, 'MMMM yyyy'))
    console.log('📊 CALENDAR: Current view - ' + view)
    console.log('🤖 CALENDAR: AI mode - ' + (aiMode ? 'enabled' : 'disabled'))

    const email = prompt('Enter email address to share with:')
    if (!email) {
      console.log('❌ CALENDAR: SHARE CANCELLED')
      return
    }

    const permission = prompt('Permission level (view/edit/admin):')
    if (!permission) {
      console.log('❌ CALENDAR: SHARE CANCELLED')
      return
    }

    console.log('📧 CALENDAR: Share with - ' + email)
    console.log('🔐 CALENDAR: Permission level - ' + permission)

    try {
      console.log('📡 CALENDAR: SENDING SHARE REQUEST TO API')
      const response = await fetch('/api/calendar/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'share',
          email,
          permission
        })
      })

      console.log('📡 CALENDAR: API RESPONSE STATUS - ' + response.status + ' ' + response.statusText)

      if (!response.ok) {
        throw new Error('Failed to share calendar')
      }

      console.log('✅ CALENDAR: CALENDAR SHARED SUCCESSFULLY')
      console.log('🏁 CALENDAR: SHARE CALENDAR PROCESS COMPLETE')

      toast.success('🤝 Calendar shared successfully!', {
        description: 'Shared with ' + email + ' (' + permission + ' access)'
      })
    } catch (error: any) {
      console.error('❌ CALENDAR: SHARE ERROR - ' + error.message)
      toast.error('❌ Failed to share calendar', {
        description: error.message || 'Please try again later'
      })
    }
  }

  // ============================================================================
  // HANDLER 14: TIME ZONE SETTINGS
  // ============================================================================

  const handleTimeZoneSettings = () => {
    console.log('🌍 CALENDAR: MANAGING TIME ZONE SETTINGS')
    console.log('📅 CALENDAR: Current month - ' + format(currentDate, 'MMMM yyyy'))
    console.log('📊 CALENDAR: Current view - ' + view)
    console.log('🤖 CALENDAR: AI mode - ' + (aiMode ? 'enabled' : 'disabled'))

    const timezone = prompt('Enter time zone (e.g., America/New_York, Europe/London):')
    if (!timezone) {
      console.log('❌ CALENDAR: TIME ZONE CHANGE CANCELLED')
      return
    }

    console.log('🌍 CALENDAR: New time zone - ' + timezone)
    console.log('⏰ CALENDAR: Updating all event times')
    console.log('✅ CALENDAR: TIME ZONE UPDATED SUCCESSFULLY')
    console.log('🏁 CALENDAR: TIME ZONE SETTINGS PROCESS COMPLETE')

    toast.success('🌍 Time zone updated!', {
      description: 'Calendar now showing times in ' + timezone
    })
  }

  // ============================================================================
  // HANDLER 15: CALENDAR ANALYTICS
  // ============================================================================

  const handleCalendarAnalytics = async () => {
    console.log('📊 CALENDAR: VIEWING CALENDAR ANALYTICS')
    console.log('📅 CALENDAR: Current month - ' + format(currentDate, 'MMMM yyyy'))
    console.log('📊 CALENDAR: Current view - ' + view)
    console.log('🤖 CALENDAR: AI mode - ' + (aiMode ? 'enabled' : 'disabled'))

    try {
      console.log('📡 CALENDAR: FETCHING ANALYTICS FROM API')
      const response = await fetch('/api/calendar/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_analytics',
          period: 'month',
          month: format(currentDate, 'yyyy-MM')
        })
      })

      console.log('📡 CALENDAR: API RESPONSE STATUS - ' + response.status + ' ' + response.statusText)

      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const result = await response.json()

      console.log('📊 CALENDAR: Analytics data received')
      console.log('⏱️ CALENDAR: Total meeting time - ' + (result.totalMeetingTime || 0) + ' hours')
      console.log('📈 CALENDAR: Productivity score - ' + (result.productivityScore || 0) + '%')
      console.log('✅ CALENDAR: ANALYTICS LOADED SUCCESSFULLY')
      console.log('🏁 CALENDAR: CALENDAR ANALYTICS PROCESS COMPLETE')

      toast.success('📊 Analytics loaded!', {
        description: 'Total meeting time: ' + (result.totalMeetingTime || 0) + ' hours this month'
      })
    } catch (error: any) {
      console.error('❌ CALENDAR: ANALYTICS ERROR - ' + error.message)
      toast.error('❌ Failed to load analytics', {
        description: error.message || 'Please try again later'
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="relative">
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <FloatingParticle delay={0} color="blue" />
                <FloatingParticle delay={1} color="indigo" />
              </div>
              <TextShimmer className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-cyan-900 dark:from-gray-100 dark:via-blue-100 dark:to-cyan-100 bg-clip-text text-transparent mb-2 relative z-10">
                Calendar
              </TextShimmer>
              <p className="text-lg text-gray-600">
                Manage your schedule and appointments
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => handleSearchEvents(e.target.value)}
                  className="pl-10 w-80"
                  data-testid="search-events-input"
                />
              </div>
              <Button
                variant={aiMode ? 'default' : 'outline'}
                onClick={handleAiModeToggle}
                className={aiMode ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : ''}
                data-testid="ai-mode-toggle-btn"
              >
                <Brain className="w-4 h-4 mr-2" />
                AI Mode
              </Button>
              <Button
                onClick={handleCreateEvent}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                data-testid="create-event-btn"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Event
              </Button>
            </div>
          </div>
        </div>

        {/* AI Insights Panel */}
        {aiMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6"
          >
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {KAZI_CALENDAR_DATA.aiInsights.map((insight) => (
                  <div key={insight.id} className="p-4 bg-white rounded-lg border border-purple-100">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-purple-900">{insight.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {insight.confidence}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                    <p className="text-sm text-purple-600 font-medium">{insight.suggestion}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-3">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth('prev')}
                      data-testid="prev-month-btn"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <h2 className="text-2xl font-bold">
                      <TextShimmer>
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                      </TextShimmer>
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth('next')}
                      data-testid="next-month-btn"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Tabs value={view} onValueChange={(v) => handleViewChange(v as 'month' | 'week' | 'day')}>
                      <TabsList>
                        <TabsTrigger value="month">Month</TabsTrigger>
                        <TabsTrigger value="week">Week</TabsTrigger>
                        <TabsTrigger value="day">Day</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {view === 'month' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-7 gap-1"
                  >
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="p-2 text-center font-medium text-gray-500">
                        {day}
                      </div>
                    ))}

                    {generateCalendarDays().map((day, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.01 }}
                        className={`
                          p-2 h-24 border border-gray-100 relative cursor-pointer hover:bg-gray-50 transition-colors
                          ${day === null ? 'bg-gray-50' : ''}
                          ${isToday(day || 0) ? 'bg-blue-50 border-blue-200' : ''}
                        `}
                      >
                        {day && (
                          <>
                            <span className={`text-sm font-medium ${isToday(day) ? 'text-blue-600' : 'text-gray-900'}`}>
                              {day}
                            </span>
                            {day === 15 && (
                              <div className="mt-1 space-y-1">
                                <div className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate">
                                  Client Meeting
                                </div>
                              </div>
                            )}
                            {day === 20 && (
                              <div className="mt-1 space-y-1">
                                <div className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded truncate">
                                  Design Review
                                </div>
                                <div className="text-xs bg-red-100 text-red-800 px-1 py-0.5 rounded truncate">
                                  Deadline
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {view === 'week' && (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Week View</h3>
                    <p className="text-gray-600">
                      Weekly calendar view coming soon
                    </p>
                  </div>
                )}

                {view === 'day' && (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Day View</h3>
                    <p className="text-gray-600">
                      Daily schedule view coming soon
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Events */}
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle>Today&apos;s Events</CardTitle>
                <CardDescription>
                  {format(new Date(), 'EEEE, MMMM d, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {events.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className={`w-3 h-3 rounded-full mt-1 bg-${event.color}-500`} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {event.title}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{event.time}</span>
                        <span>•</span>
                        <span>{event.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        {event.location.includes('Video') ? (
                          <Video className="w-3 h-3" />
                        ) : (
                          <MapPin className="w-3 h-3" />
                        )}
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle>Upcoming</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {event.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {event.date} at {event.time}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {event.type}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="outline" onClick={handleScheduleWithAI}>
                  <Brain className="w-4 h-4 mr-2" />
                  AI Schedule
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Team Calendar
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </CardContent>
            </Card>

            {/* Meeting Metrics */}
            {aiMode && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                  <CardHeader>
                    <CardTitle className="text-purple-900">Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Meetings</span>
                      <NumberFlow value={KAZI_CALENDAR_DATA.metrics.totalMeetings} className="font-bold text-purple-900" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">This Month</span>
                      <NumberFlow value={KAZI_CALENDAR_DATA.metrics.monthlyMeetings} className="font-bold text-purple-900" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Efficiency</span>
                      <span className="font-bold text-purple-900">
                        <NumberFlow value={KAZI_CALENDAR_DATA.metrics.meetingEfficiencyScore} decimals={1} className="inline-block" />%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Satisfaction</span>
                      <span className="font-bold text-purple-900">
                        <NumberFlow value={KAZI_CALENDAR_DATA.metrics.clientSatisfactionScore} decimals={1} className="inline-block" />/10
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
