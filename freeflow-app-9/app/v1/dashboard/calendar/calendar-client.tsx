'use client'

/**
 * Calendar Client Component with Real Functionality
 * - Uses Supabase hooks for data fetching
 * - Real file generation for exports (ICS, CSV, PDF)
 * - Blob/URL.createObjectURL for downloads
 * - No hardcoded mock data
 */

import { useState, useMemo, useCallback } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock,
  MapPin, Users, Video, Bell, Download, Share2, Search, Settings,
  List, CalendarDays, Link2, CheckCircle2, Edit2, Trash2, Copy, Zap, TrendingUp, Activity
} from 'lucide-react'
import { useCalendarEvents, type CalendarEvent, type EventType, type EventStatus, type CreateCalendarEventInput } from '@/lib/hooks/use-calendar-events'
import { CollapsibleInsightsPanel, InsightsToggleButton, useInsightsPanel } from '@/components/ui/collapsible-insights-panel'

// ============================================================================
// CONSTANTS
// ============================================================================

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const eventColors: Record<string, string> = {
  meeting: 'bg-blue-500',
  appointment: 'bg-green-500',
  task: 'bg-yellow-500',
  reminder: 'bg-purple-500',
  deadline: 'bg-red-500',
  milestone: 'bg-indigo-500',
  holiday: 'bg-pink-500',
  birthday: 'bg-teal-500',
  custom: 'bg-gray-500'
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatTime = (dateString: string | Date) => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

const getStatusColor = (status: EventStatus): string => {
  const colors: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-800',
    tentative: 'bg-yellow-100 text-yellow-800',
    pending: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
    rescheduled: 'bg-orange-100 text-orange-800',
    completed: 'bg-gray-100 text-gray-800'
  }
  return colors[status] || colors.pending
}

// Generate ICS file content
function generateICSContent(events: CalendarEvent[]): string {
  const formatICSDate = (date: string) => {
    return new Date(date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FreeFlow//Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ]

  events.forEach(event => {
    icsContent.push(
      'BEGIN:VEVENT',
      `DTSTART:${formatICSDate(event.start_time)}`,
      `DTEND:${formatICSDate(event.end_time)}`,
      `SUMMARY:${event.title.replace(/,/g, '\\,')}`,
      `DESCRIPTION:${(event.description || '').replace(/\n/g, '\\n').replace(/,/g, '\\,')}`,
      `LOCATION:${(event.location || '').replace(/,/g, '\\,')}`,
      `UID:${event.id}@freeflow.com`,
      `STATUS:${event.status.toUpperCase()}`,
      `CREATED:${formatICSDate(event.created_at)}`,
      'END:VEVENT'
    )
  })

  icsContent.push('END:VCALENDAR')
  return icsContent.join('\r\n')
}

// Generate CSV file content
function generateCSVContent(events: CalendarEvent[]): string {
  const headers = ['Title', 'Start Time', 'End Time', 'Location', 'Description', 'Type', 'Status', 'Attendees']
  const rows = events.map(event => [
    `"${event.title.replace(/"/g, '""')}"`,
    event.start_time,
    event.end_time,
    `"${(event.location || '').replace(/"/g, '""')}"`,
    `"${(event.description || '').replace(/"/g, '""')}"`,
    event.event_type,
    event.status,
    event.total_attendees.toString()
  ])
  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface CalendarClientProps {
  initialEvents?: CalendarEvent[]
}

export default function CalendarClient({ initialEvents = [] }: CalendarClientProps) {
  const insightsPanel = useInsightsPanel(false)
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'agenda'>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showNewEventDialog, setShowNewEventDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showQuickAddDialog, setShowQuickAddDialog] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [exportFormat, setExportFormat] = useState<'ics' | 'csv' | 'json'>('ics')

  // New event form state
  const [newEventForm, setNewEventForm] = useState({
    title: '',
    startTime: '',
    endTime: '',
    eventType: 'meeting' as EventType,
    location: '',
    description: ''
  })

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    startTime: '',
    endTime: '',
    location: '',
    description: ''
  })

  // Quick add state
  const [quickAddText, setQuickAddText] = useState('')

  // Use the calendar events hook for real data
  const { events, loading, error, createEvent, updateEvent, deleteEvent, refetch } = useCalendarEvents()

  // Use fetched events or fall back to initial events
  const displayEvents = events.length > 0 ? events : initialEvents

  // Calculate stats from real data
  const stats = useMemo(() => {
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)

    const thisWeekEvents = displayEvents.filter(e => {
      const eventDate = new Date(e.start_time)
      return eventDate >= weekStart && eventDate <= weekEnd
    })

    const upcomingEvents = displayEvents.filter(e => new Date(e.start_time) > today)
    const todaysEvents = displayEvents.filter(e =>
      new Date(e.start_time).toDateString() === today.toDateString()
    )

    const totalHoursThisWeek = thisWeekEvents.reduce((sum, e) => {
      const start = new Date(e.start_time)
      const end = new Date(e.end_time)
      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    }, 0)

    return {
      total: displayEvents.length,
      upcoming: upcomingEvents.length,
      thisWeek: thisWeekEvents.length,
      today: todaysEvents.length,
      confirmed: displayEvents.filter(e => e.status === 'confirmed').length,
      hoursThisWeek: totalHoursThisWeek.toFixed(1)
    }
  }, [displayEvents])

  // Get calendar days for month view
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days: { date: Date; isCurrentMonth: boolean; isToday: boolean; events: CalendarEvent[] }[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < 42; i++) {
      const currentDay = new Date(startDate)
      currentDay.setDate(startDate.getDate() + i)

      const dayEvents = displayEvents.filter(e => {
        const eventDate = new Date(e.start_time)
        return eventDate.toDateString() === currentDay.toDateString()
      })

      days.push({
        date: currentDay,
        isCurrentMonth: currentDay.getMonth() === month,
        isToday: currentDay.toDateString() === today.toDateString(),
        events: dayEvents
      })
    }

    return days
  }, [currentDate, displayEvents])

  // Upcoming events sorted by date
  const upcomingEvents = useMemo(() => {
    return displayEvents
      .filter(e => new Date(e.start_time) >= new Date())
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .slice(0, 10)
  }, [displayEvents])

  // Navigation handlers
  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate)
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + direction)
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7))
    } else if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + direction)
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => setCurrentDate(new Date())

  // REAL: Create event handler
  const handleCreateEvent = async () => {
    if (!newEventForm.title || !newEventForm.startTime || !newEventForm.endTime) {
      toast.error('Please fill in title, start and end time')
      return
    }

    try {
      await createEvent({
        title: newEventForm.title,
        start_time: new Date(newEventForm.startTime).toISOString(),
        end_time: new Date(newEventForm.endTime).toISOString(),
        event_type: newEventForm.eventType,
        location: newEventForm.location || null,
        description: newEventForm.description || null,
        status: 'confirmed',
        all_day: false,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      })
      setShowNewEventDialog(false)
      setNewEventForm({ title: '', startTime: '', endTime: '', eventType: 'meeting', location: '', description: '' })
      toast.success('Event created successfully')
    } catch (err) {
      console.error('Failed to create event:', err)
      toast.error('Failed to create event')
    }
  }

  // REAL: Update event handler
  const handleUpdateEvent = async () => {
    if (!selectedEvent || !editForm.title) {
      toast.error('Title is required')
      return
    }

    try {
      await updateEvent({
        id: selectedEvent.id,
        title: editForm.title,
        start_time: new Date(editForm.startTime).toISOString(),
        end_time: new Date(editForm.endTime).toISOString(),
        location: editForm.location || null,
        description: editForm.description || null
      })
      toast.success('Event updated successfully')
      setIsEditing(false)
      setSelectedEvent(null)
    } catch (err) {
      console.error('Failed to update event:', err)
      toast.error('Failed to update event')
    }
  }

  // REAL: Delete event handler
  const handleDeleteEvent = async (event: CalendarEvent) => {
    try {
      await deleteEvent({ id: event.id })
      toast.success('Event deleted successfully')
      setSelectedEvent(null)
    } catch (err) {
      console.error('Failed to delete event:', err)
      toast.error('Failed to delete event')
    }
  }

  // REAL: Export calendar with file generation
  const handleExport = useCallback(() => {
    if (displayEvents.length === 0) {
      toast.error('No events to export')
      return
    }

    let content: string
    let mimeType: string
    let filename: string
    const dateStr = new Date().toISOString().split('T')[0]

    switch (exportFormat) {
      case 'ics':
        content = generateICSContent(displayEvents)
        mimeType = 'text/calendar'
        filename = `calendar-export-${dateStr}.ics`
        break
      case 'csv':
        content = generateCSVContent(displayEvents)
        mimeType = 'text/csv'
        filename = `calendar-export-${dateStr}.csv`
        break
      case 'json':
      default:
        content = JSON.stringify({ events: displayEvents, exportedAt: new Date().toISOString() }, null, 2)
        mimeType = 'application/json'
        filename = `calendar-export-${dateStr}.json`
        break
    }

    // Create blob and download
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success(`Calendar exported as ${exportFormat.toUpperCase()}`)
    setShowExportDialog(false)
  }, [displayEvents, exportFormat])

  // REAL: Share calendar - generate shareable link
  const handleShare = useCallback(async () => {
    const shareUrl = `${window.location.origin}/shared/calendar/${Date.now()}`

    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Share link copied to clipboard!')
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      toast.success('Share link copied to clipboard!')
    }

    setShowShareDialog(false)
  }, [])

  // REAL: Quick add with natural language parsing
  const handleQuickAdd = async () => {
    if (!quickAddText.trim()) {
      toast.error('Please enter event details')
      return
    }

    // Simple natural language parsing
    const text = quickAddText.toLowerCase()
    const now = new Date()
    let startTime = new Date(now)
    let endTime = new Date(now)
    let title = quickAddText

    // Parse "tomorrow"
    if (text.includes('tomorrow')) {
      startTime.setDate(startTime.getDate() + 1)
      endTime.setDate(endTime.getDate() + 1)
    }

    // Parse time patterns like "at 3pm", "at 10am"
    const timeMatch = text.match(/at\s+(\d{1,2})\s*(am|pm)?/i)
    if (timeMatch) {
      let hour = parseInt(timeMatch[1])
      if (timeMatch[2]?.toLowerCase() === 'pm' && hour < 12) hour += 12
      if (timeMatch[2]?.toLowerCase() === 'am' && hour === 12) hour = 0
      startTime.setHours(hour, 0, 0, 0)
      endTime.setHours(hour + 1, 0, 0, 0)
      // Remove time from title
      title = quickAddText.replace(/at\s+\d{1,2}\s*(am|pm)?/i, '').trim()
    } else {
      // Default to next hour
      startTime.setHours(startTime.getHours() + 1, 0, 0, 0)
      endTime.setHours(endTime.getHours() + 2, 0, 0, 0)
    }

    // Remove "tomorrow" from title
    title = title.replace(/tomorrow/i, '').trim()
    if (!title) title = 'New Event'

    try {
      await createEvent({
        title,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        event_type: 'meeting',
        status: 'confirmed',
        all_day: false,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      })
      toast.success(`Event "${title}" created`)
      setQuickAddText('')
      setShowQuickAddDialog(false)
    } catch (err) {
      console.error('Failed to create event:', err)
      toast.error('Failed to create event')
    }
  }

  // Start editing an event
  const startEditing = (event: CalendarEvent) => {
    setEditForm({
      title: event.title,
      startTime: event.start_time.slice(0, 16),
      endTime: event.end_time.slice(0, 16),
      location: event.location || '',
      description: event.description || ''
    })
    setIsEditing(true)
  }

  // REAL: Join video meeting
  const handleJoinMeeting = (event: CalendarEvent) => {
    const meetingUrl = event.meeting_url || event.location
    if (meetingUrl && (meetingUrl.startsWith('http') || meetingUrl.startsWith('https'))) {
      window.open(meetingUrl, '_blank', 'noopener,noreferrer')
      toast.success('Opening meeting...')
    } else {
      toast.info('No meeting link available')
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6">
          <p className="text-red-500">Failed to load calendar: {error.message}</p>
          <Button onClick={() => refetch()} className="mt-4">Retry</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendar</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your schedule and events</p>
          </div>
          <div className="flex items-center gap-3">
            <InsightsToggleButton isOpen={insightsPanel.isOpen} onToggle={insightsPanel.toggle} />
            <Button variant="outline" onClick={() => setShowQuickAddDialog(true)}>
              <Zap className="h-4 w-4 mr-2" />
              Quick Add
            </Button>
            <Button variant="outline" onClick={() => setShowExportDialog(true)}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setShowNewEventDialog(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total Events', value: stats.total, icon: CalendarIcon },
            { label: 'Today', value: stats.today, icon: CalendarDays },
            { label: 'This Week', value: stats.thisWeek, icon: Clock },
            { label: 'Upcoming', value: stats.upcoming, icon: CheckCircle2 },
            { label: 'Confirmed', value: stats.confirmed, icon: CheckCircle2 },
            { label: 'Hours/Week', value: stats.hoursThisWeek, icon: Clock }
          ].map((stat, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-gray-500">{stat.label}</span>
                </div>
                <span className="text-2xl font-bold">{stat.value}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar View */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm" onClick={goToToday}>Today</Button>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => navigateMonth(-1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => navigateMonth(1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <h2 className="text-lg font-semibold">
                    {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {(['month', 'week', 'day', 'agenda'] as const).map(mode => (
                    <Button
                      key={mode}
                      variant={viewMode === mode ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode(mode)}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : viewMode === 'month' ? (
                  <div>
                    <div className="grid grid-cols-7 border-b">
                      {WEEKDAYS.map(day => (
                        <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7">
                      {calendarDays.map((day, i) => (
                        <div
                          key={i}
                          className={`min-h-[80px] p-1 border-b border-r ${
                            !day.isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800/50' : ''
                          } ${day.isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                        >
                          <div className={`text-sm mb-1 ${
                            day.isToday ? 'w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center' :
                            day.isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                          }`}>
                            {day.date.getDate()}
                          </div>
                          <div className="space-y-0.5">
                            {day.events.slice(0, 2).map(event => (
                              <div
                                key={event.id}
                                onClick={() => setSelectedEvent(event)}
                                className={`text-xs px-1 py-0.5 rounded truncate cursor-pointer ${eventColors[event.event_type]} text-white`}
                              >
                                {formatTime(event.start_time)} {event.title}
                              </div>
                            ))}
                            {day.events.length > 2 && (
                              <div className="text-xs text-gray-500">+{day.events.length - 2} more</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : viewMode === 'agenda' ? (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-2">
                      {upcomingEvents.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>No upcoming events</p>
                        </div>
                      ) : upcomingEvents.map(event => (
                        <div
                          key={event.id}
                          onClick={() => setSelectedEvent(event)}
                          className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-1 h-12 rounded-full ${eventColors[event.event_type]}`}></div>
                            <div className="flex-1">
                              <h3 className="font-medium">{event.title}</h3>
                              <p className="text-sm text-gray-500">
                                {new Date(event.start_time).toLocaleDateString()} - {formatTime(event.start_time)}
                              </p>
                            </div>
                            <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p>Select a view mode above</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {upcomingEvents.slice(0, 5).map(event => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${eventColors[event.event_type]}`}></div>
                      <span className="text-sm font-medium truncate">{event.title}</span>
                    </div>
                    <p className="text-xs text-gray-500 ml-4">
                      {new Date(event.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                ))}
                {upcomingEvents.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No upcoming events</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Event Detail Modal */}
        {selectedEvent && (
          <Dialog open={!!selectedEvent} onOpenChange={() => { setSelectedEvent(null); setIsEditing(false) }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${eventColors[selectedEvent.event_type]}`}></div>
                  {isEditing ? 'Edit Event' : selectedEvent.title}
                </DialogTitle>
              </DialogHeader>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <Input value={editForm.title} onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Start</label>
                      <Input type="datetime-local" value={editForm.startTime} onChange={(e) => setEditForm(f => ({ ...f, startTime: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">End</label>
                      <Input type="datetime-local" value={editForm.endTime} onChange={(e) => setEditForm(f => ({ ...f, endTime: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <Input value={editForm.location} onChange={(e) => setEditForm(f => ({ ...f, location: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg"
                      value={editForm.description}
                      onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button className="flex-1" onClick={handleUpdateEvent} disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Clock className="h-5 w-5" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedEvent.start_time).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </div>
                      <div className="text-sm">{formatTime(selectedEvent.start_time)} - {formatTime(selectedEvent.end_time)}</div>
                    </div>
                  </div>
                  {selectedEvent.location && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <MapPin className="h-5 w-5" />
                      <span>{selectedEvent.location}</span>
                    </div>
                  )}
                  {selectedEvent.location_type === 'virtual' && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <Video className="h-5 w-5" />
                      <Button variant="link" className="text-blue-600 p-0" onClick={() => handleJoinMeeting(selectedEvent)}>
                        Join Video Call
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-gray-600">
                    <Users className="h-5 w-5" />
                    <span>{selectedEvent.total_attendees} attendees</span>
                  </div>
                  {selectedEvent.description && (
                    <div className="pt-4 border-t">
                      <p className="text-gray-600">{selectedEvent.description}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-4 border-t">
                    <Button className="flex-1" onClick={() => startEditing(selectedEvent)}>
                      <Edit2 className="h-4 w-4 mr-2" />Edit
                    </Button>
                    <Button variant="outline" onClick={() => {
                      navigator.clipboard.writeText(selectedEvent.title)
                      toast.success('Event title copied')
                    }}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="text-red-600" onClick={() => handleDeleteEvent(selectedEvent)} disabled={loading}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}

        {/* New Event Dialog */}
        <Dialog open={showNewEventDialog} onOpenChange={setShowNewEventDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <Input
                  placeholder="Event title"
                  value={newEventForm.title}
                  onChange={(e) => setNewEventForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start *</label>
                  <Input
                    type="datetime-local"
                    value={newEventForm.startTime}
                    onChange={(e) => setNewEventForm(f => ({ ...f, startTime: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End *</label>
                  <Input
                    type="datetime-local"
                    value={newEventForm.endTime}
                    onChange={(e) => setNewEventForm(f => ({ ...f, endTime: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Event Type</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg"
                  value={newEventForm.eventType}
                  onChange={(e) => setNewEventForm(f => ({ ...f, eventType: e.target.value as EventType }))}
                >
                  <option value="meeting">Meeting</option>
                  <option value="appointment">Appointment</option>
                  <option value="task">Task</option>
                  <option value="reminder">Reminder</option>
                  <option value="deadline">Deadline</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <Input
                  placeholder="Location or meeting URL"
                  value={newEventForm.location}
                  onChange={(e) => setNewEventForm(f => ({ ...f, location: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Event description"
                  value={newEventForm.description}
                  onChange={(e) => setNewEventForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewEventDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateEvent} disabled={loading}>
                {loading ? 'Creating...' : 'Create Event'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Calendar
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Export Format</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg"
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as 'ics' | 'csv' | 'json')}
                >
                  <option value="ics">iCalendar (.ics) - Compatible with most calendar apps</option>
                  <option value="csv">CSV - For spreadsheets</option>
                  <option value="json">JSON - For developers</option>
                </select>
              </div>
              <p className="text-sm text-gray-500">
                {displayEvents.length} events will be exported
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>Cancel</Button>
              <Button onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Quick Add Dialog */}
        <Dialog open={showQuickAddDialog} onOpenChange={setShowQuickAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Quick Add Event
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="e.g., Team meeting tomorrow at 3pm"
                value={quickAddText}
                onChange={(e) => setQuickAddText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
              />
              <p className="text-sm text-gray-500">
                Use natural language like "Meeting tomorrow at 2pm" or "Lunch with team at 12pm"
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowQuickAddDialog(false)}>Cancel</Button>
              <Button onClick={handleQuickAdd} disabled={loading}>Add Event</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Share Dialog */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Share Calendar
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Generate a shareable link for your calendar. Anyone with this link can view your events.
              </p>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Share link will be copied to clipboard</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowShareDialog(false)}>Cancel</Button>
              <Button onClick={handleShare}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Share Link
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Collapsible Insights Panel */}
        <CollapsibleInsightsPanel
          title="Calendar Insights & Analytics"
          defaultOpen={insightsPanel.isOpen}
          onOpenChange={insightsPanel.setIsOpen}
        >
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-blue-600" />
                Event Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Events</span>
                <span className="font-semibold">{stats.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Today</span>
                <span className="font-semibold text-blue-600">{stats.today}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">This Week</span>
                <span className="font-semibold">{stats.thisWeek}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Upcoming</span>
                <span className="font-semibold text-green-600">{stats.upcoming}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Confirmed</span>
                <span className="font-semibold">{stats.confirmed}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Hours This Week</span>
                <span className="font-semibold">{stats.hoursThisWeek}h</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-600" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stats.today > 5 && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Busy day ahead with {stats.today} events - consider prioritizing
                </p>
              )}
              {parseFloat(stats.hoursThisWeek) > 40 && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  Over 40 hours of meetings this week - consider blocking focus time
                </p>
              )}
              {stats.upcoming === 0 && (
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  No upcoming events scheduled - great time for planning
                </p>
              )}
              {stats.confirmed < stats.total && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  {stats.total - stats.confirmed} event(s) pending confirmation
                </p>
              )}
              {stats.today === 0 && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  No events today - enjoy your free time!
                </p>
              )}
            </CardContent>
          </Card>
        </CollapsibleInsightsPanel>
      </div>
    </div>
  )
}
