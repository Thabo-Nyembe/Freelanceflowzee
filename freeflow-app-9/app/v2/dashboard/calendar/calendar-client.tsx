'use client'
import { useState, useMemo } from 'react'
import { useCalendarEvents, type CalendarEvent, type EventType, type EventStatus } from '@/lib/hooks/use-calendar-events'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock,
  MapPin, Users, Video, Bell,
  Search, Settings, List, CalendarDays,
  Globe, Link2, CheckCircle2, Edit2, Trash2,
  Copy, ExternalLink, Download, Share2,
  BarChart3, Timer, CalendarCheck, CalendarClock, Zap, MessageSquare
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

import {
  calendarAIInsights,
  calendarCollaborators,
  calendarPredictions,
  calendarActivities,
  calendarQuickActions,
} from '@/lib/mock-data/adapters'

// ============================================================================
// TYPE DEFINITIONS - Google Calendar Level Platform
// ============================================================================

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  events: CalendarEvent[]
}

interface CalendarSource {
  id: string
  name: string
  color: string
  enabled: boolean
  type: 'personal' | 'work' | 'shared' | 'holiday' | 'birthday' | 'subscribed'
  email?: string
  owner?: string
  eventCount: number
}

interface SchedulingLink {
  id: string
  name: string
  duration: number
  url: string
  isActive: boolean
  bookingsCount: number
  availability: string[]
  buffer: number
}

interface Reminder {
  id: string
  title: string
  datetime: Date
  completed: boolean
  eventId?: string
  type: 'email' | 'notification' | 'sms'
}

interface TimeSlot {
  start: string
  end: string
  available: boolean
  reason?: string
}

interface Attendee {
  id: string
  name: string
  email: string
  avatar?: string
  status: 'accepted' | 'declined' | 'tentative' | 'pending'
  organizer?: boolean
}

interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number
  endDate?: Date
  count?: number
  daysOfWeek?: number[]
}

interface TimeZone {
  id: string
  name: string
  offset: string
  city: string
}

interface WorkingHours {
  day: string
  enabled: boolean
  start: string
  end: string
}

type ViewMode = 'month' | 'week' | 'day' | 'agenda' | 'schedule'

// ============================================================================
// CONSTANTS
// ============================================================================

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WEEKDAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const eventColors: Record<string, string> = {
  meeting: 'bg-blue-500',
  appointment: 'bg-green-500',
  task: 'bg-yellow-500',
  reminder: 'bg-purple-500',
  event: 'bg-pink-500',
  deadline: 'bg-red-500',
  focus: 'bg-indigo-500',
  personal: 'bg-teal-500'
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockCalendars: CalendarSource[] = [
  { id: '1', name: 'Personal', color: 'bg-blue-500', enabled: true, type: 'personal', eventCount: 45 },
  { id: '2', name: 'Work', color: 'bg-green-500', enabled: true, type: 'work', email: 'work@company.com', eventCount: 128 },
  { id: '3', name: 'Team Meetings', color: 'bg-purple-500', enabled: true, type: 'shared', owner: 'Team Lead', eventCount: 32 },
  { id: '4', name: 'US Holidays', color: 'bg-red-500', enabled: false, type: 'holiday', eventCount: 12 },
  { id: '5', name: 'Birthdays', color: 'bg-pink-500', enabled: false, type: 'birthday', eventCount: 24 },
  { id: '6', name: 'NBA Schedule', color: 'bg-orange-500', enabled: false, type: 'subscribed', eventCount: 82 },
]

const mockSchedulingLinks: SchedulingLink[] = [
  { id: '1', name: '30-min Meeting', duration: 30, url: 'https://cal.com/user/30min', isActive: true, bookingsCount: 45, availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], buffer: 15 },
  { id: '2', name: '1-hour Consultation', duration: 60, url: 'https://cal.com/user/1hour', isActive: true, bookingsCount: 23, availability: ['Tue', 'Thu'], buffer: 30 },
  { id: '3', name: '15-min Quick Chat', duration: 15, url: 'https://cal.com/user/15min', isActive: true, bookingsCount: 67, availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], buffer: 5 },
  { id: '4', name: 'Team Sync', duration: 45, url: 'https://cal.com/user/team', isActive: false, bookingsCount: 12, availability: ['Wed'], buffer: 15 },
]

const mockReminders: Reminder[] = [
  { id: '1', title: 'Review Q4 Reports', datetime: new Date(Date.now() + 1000 * 60 * 60 * 2), completed: false, type: 'notification' },
  { id: '2', title: 'Send follow-up email', datetime: new Date(Date.now() + 1000 * 60 * 60 * 24), completed: false, type: 'email' },
  { id: '3', title: 'Prepare presentation', datetime: new Date(Date.now() + 1000 * 60 * 60 * 48), completed: false, type: 'notification' },
  { id: '4', title: 'Call client', datetime: new Date(Date.now() - 1000 * 60 * 60 * 2), completed: true, type: 'notification' },
]

const mockAttendees: Attendee[] = [
  { id: '1', name: 'Sarah Chen', email: 'sarah@company.com', avatar: '', status: 'accepted', organizer: true },
  { id: '2', name: 'Mike Johnson', email: 'mike@company.com', avatar: '', status: 'accepted' },
  { id: '3', name: 'Emily Davis', email: 'emily@company.com', avatar: '', status: 'tentative' },
  { id: '4', name: 'James Wilson', email: 'james@company.com', avatar: '', status: 'pending' },
]

const mockWorkingHours: WorkingHours[] = [
  { day: 'Monday', enabled: true, start: '09:00', end: '17:00' },
  { day: 'Tuesday', enabled: true, start: '09:00', end: '17:00' },
  { day: 'Wednesday', enabled: true, start: '09:00', end: '17:00' },
  { day: 'Thursday', enabled: true, start: '09:00', end: '17:00' },
  { day: 'Friday', enabled: true, start: '09:00', end: '17:00' },
  { day: 'Saturday', enabled: false, start: '10:00', end: '14:00' },
  { day: 'Sunday', enabled: false, start: '10:00', end: '14:00' },
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStatusColor = (status: EventStatus | Attendee['status']): string => {
  const colors: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400',
    accepted: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400',
    tentative: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400',
    pending: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
    declined: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-400',
  }
  return colors[status] || colors.pending
}

const formatTime = (dateString: string | Date) => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

const formatDateRange = (start: string, end: string) => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  if (startDate.toDateString() === endDate.toDateString()) {
    return `${formatTime(start)} - ${formatTime(end)}`
  }
  return `${startDate.toLocaleDateString()} ${formatTime(start)} - ${endDate.toLocaleDateString()} ${formatTime(end)}`
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CalendarClient({ initialEvents }: { initialEvents: CalendarEvent[] }) {
  const [activeTab, setActiveTab] = useState('calendar')
  const [settingsTab, setSettingsTab] = useState('general')
  const [eventTypeFilter, setEventTypeFilter] = useState<EventType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showNewEvent, setShowNewEvent] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const { events, loading, error, createEvent, updateEvent, deleteEvent, refetch } = useCalendarEvents({ eventType: eventTypeFilter, status: statusFilter })

  // Form state for new event
  const [newEventForm, setNewEventForm] = useState({
    title: '',
    startTime: '',
    endTime: '',
    eventType: 'meeting' as EventType,
    location: '',
    description: ''
  })

  // Handle creating a new event
  const handleCreateEvent = async () => {
    if (!newEventForm.title || !newEventForm.startTime || !newEventForm.endTime) {
      toast.error('Please fill in title, start and end time')
      return
    }
    try {
      await createEvent({
        title: newEventForm.title,
        start_time: newEventForm.startTime,
        end_time: newEventForm.endTime,
        event_type: newEventForm.eventType,
        location: newEventForm.location || null,
        description: newEventForm.description || null,
        status: 'confirmed',
        all_day: false,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      } as any)
      setShowNewEvent(false)
      setNewEventForm({ title: '', startTime: '', endTime: '', eventType: 'meeting', location: '', description: '' })
      toast.success('Event created')
      refetch()
    } catch (error) {
      console.error('Failed to create event:', error)
    }
  }
  const displayEvents = (events && events.length > 0) ? events : (initialEvents || [])

  // Calculate comprehensive stats
  const stats = useMemo(() => {
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    const thisWeekEvents = displayEvents.filter(e => {
      const eventDate = new Date(e.start_time)
      return eventDate >= weekStart && eventDate <= weekEnd
    })

    const thisMonthEvents = displayEvents.filter(e => {
      const eventDate = new Date(e.start_time)
      return eventDate >= monthStart && eventDate <= monthEnd
    })

    const upcomingEvents = displayEvents.filter(e => new Date(e.start_time) > today)
    const meetingsToday = displayEvents.filter(e => {
      const eventDate = new Date(e.start_time)
      return eventDate.toDateString() === today.toDateString() && e.event_type === 'meeting'
    })

    const totalHoursThisWeek = thisWeekEvents.reduce((sum, e) => {
      const start = new Date(e.start_time)
      const end = new Date(e.end_time)
      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    }, 0)

    return {
      total: displayEvents.length,
      upcoming: upcomingEvents.length,
      thisWeek: thisWeekEvents.length,
      thisMonth: thisMonthEvents.length,
      meetingsToday: meetingsToday.length,
      confirmed: displayEvents.filter(e => e.status === 'confirmed').length,
      hoursThisWeek: totalHoursThisWeek.toFixed(1),
      avgAttendees: displayEvents.length > 0
        ? (displayEvents.reduce((sum, e) => sum + e.total_attendees, 0) / displayEvents.length).toFixed(1)
        : '0'
    }
  }, [displayEvents])

  // Calendar utilities
  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days: CalendarDay[] = []
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
  }

  const getWeekDays = (date: Date): CalendarDay[] => {
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay())

    const days: CalendarDay[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek)
      currentDay.setDate(startOfWeek.getDate() + i)

      const dayEvents = displayEvents.filter(e => {
        const eventDate = new Date(e.start_time)
        return eventDate.toDateString() === currentDay.toDateString()
      })

      days.push({
        date: currentDay,
        isCurrentMonth: true,
        isToday: currentDay.toDateString() === today.toDateString(),
        events: dayEvents
      })
    }

    return days
  }

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

  const calendarDays = useMemo(() => getDaysInMonth(currentDate), [currentDate, displayEvents])
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate, displayEvents])

  const upcomingEvents = useMemo(() => {
    return displayEvents
      .filter(e => new Date(e.start_time) >= new Date())
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .slice(0, 10)
  }, [displayEvents])

  // Handlers
  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    startTime: '',
    endTime: '',
    location: '',
    description: ''
  })
  const [isEditing, setIsEditing] = useState(false)

  // Handle updating an event
  const handleUpdateEvent = async () => {
    if (!selectedEvent || !editForm.title) return
    try {
      await updateEvent({
        id: selectedEvent.id,
        title: editForm.title,
        start_time: editForm.startTime,
        end_time: editForm.endTime,
        location: editForm.location || null,
        description: editForm.description || null
      } as any)
      toast.success('Event updated')
      setIsEditing(false)
      setSelectedEvent(null)
      refetch()
    } catch (err) {
      toast.error('Failed to update event')
    }
  }

  // Handle deleting an event
  const handleDeleteEvent = async (event: CalendarEvent) => {
    try {
      await deleteEvent({ id: event.id } as any)
      toast.success('Event deleted', { description: `"${event.title}" removed` })
      setSelectedEvent(null)
      refetch()
    } catch (err) {
      toast.error('Failed to delete event')
    }
  }

  // Start editing - populate form
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

  const handleExportCalendar = () => {
    toast.success('Export started', {
      description: 'Your calendar is being exported'
    })
  }

  const handleSyncCalendar = () => {
    toast.success('Sync started', {
      description: 'Syncing with external calendars...'
    })
  }

  // In demo mode, continue with empty events instead of showing error
  // The UI will show the full calendar interface with sample/mock data

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-50 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-[1800px] mx-auto space-y-8">
        {/* Premium Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 rounded-2xl p-8 text-white">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <CalendarIcon className="h-8 w-8" />
                  </div>
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                    Calendar Pro
                  </Badge>
                  <Badge className="bg-teal-500/30 text-white border-0 backdrop-blur-sm">
                    Google Calendar Level
                  </Badge>
                </div>
                <h1 className="text-4xl font-bold mb-2">Smart Calendar</h1>
                <p className="text-white/80 max-w-xl">
                  Intelligent scheduling with AI suggestions, booking links, team availability, and seamless integrations
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Dialog open={showNewEvent} onOpenChange={setShowNewEvent}>
                  <DialogTrigger asChild>
                    <Button className="bg-white text-teal-600 hover:bg-white/90">
                      <Plus className="h-4 w-4 mr-2" />
                      New Event
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3">
                        <Plus className="h-6 w-6 text-teal-600" />
                        Create New Event
                      </DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="max-h-[500px]">
                      <div className="space-y-4 py-4 pr-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Event Title</label>
                          <Input placeholder="Add title" value={newEventForm.title} onChange={(e) => setNewEventForm(prev => ({ ...prev, title: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Start</label>
                            <Input type="datetime-local" value={newEventForm.startTime} onChange={(e) => setNewEventForm(prev => ({ ...prev, startTime: e.target.value }))} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">End</label>
                            <Input type="datetime-local" value={newEventForm.endTime} onChange={(e) => setNewEventForm(prev => ({ ...prev, endTime: e.target.value }))} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Event Type</label>
                          <select className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" value={newEventForm.eventType} onChange={(e) => setNewEventForm(prev => ({ ...prev, eventType: e.target.value as EventType }))}>
                            <option value="meeting">Meeting</option>
                            <option value="appointment">Appointment</option>
                            <option value="task">Task</option>
                            <option value="reminder">Reminder</option>
                            <option value="deadline">Deadline</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Calendar</label>
                          <select className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                            {mockCalendars.filter(c => c.enabled).map(cal => (
                              <option key={cal.id} value={cal.id}>{cal.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Location</label>
                          <div className="flex items-center gap-2">
                            <Input placeholder="Add location or video link" className="flex-1" value={newEventForm.location} onChange={(e) => setNewEventForm(prev => ({ ...prev, location: e.target.value }))} />
                            <Button variant="outline" size="sm">
                              <Video className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Description</label>
                          <textarea rows={3} placeholder="Add description" className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" value={newEventForm.description} onChange={(e) => setNewEventForm(prev => ({ ...prev, description: e.target.value }))} />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                          <Button variant="outline" onClick={() => setShowNewEvent(false)}>Cancel</Button>
                          <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleCreateEvent} disabled={loading || !newEventForm.title}>{loading ? 'Creating...' : 'Create Event'}</Button>
                        </div>
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
                <Button variant="ghost" className="text-white hover:bg-white/20">
                  <Download className="h-5 w-5" />
                </Button>
                <Button variant="ghost" className="text-white hover:bg-white/20">
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - 8 Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { label: 'Total Events', value: stats.total, icon: CalendarIcon, color: 'teal', change: '+12' },
            { label: 'Today', value: stats.meetingsToday, icon: CalendarCheck, color: 'blue', change: '' },
            { label: 'This Week', value: stats.thisWeek, icon: CalendarDays, color: 'green', change: '+3' },
            { label: 'Upcoming', value: stats.upcoming, icon: CalendarClock, color: 'purple', change: '' },
            { label: 'Confirmed', value: stats.confirmed, icon: CheckCircle2, color: 'emerald', change: '+8' },
            { label: 'Hours/Week', value: stats.hoursThisWeek, icon: Timer, color: 'amber', change: '' },
            { label: 'Avg Attendees', value: stats.avgAttendees, icon: Users, color: 'pink', change: '' },
            { label: 'Bookings', value: mockSchedulingLinks.reduce((sum, l) => sum + l.bookingsCount, 0), icon: Link2, color: 'sky', change: '+5' },
          ].map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-lg bg-gradient-to-br from-${stat.color}-400 to-${stat.color}-600`}>
                    <stat.icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-xs text-gray-500 truncate">{stat.label}</span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
                  {stat.change && (
                    <span className="text-xs text-green-600">{stat.change}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-white dark:bg-gray-800 p-1 shadow-sm">
              <TabsTrigger value="dashboard" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="calendar" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="events" className="gap-2">
                <List className="h-4 w-4" />
                Events
              </TabsTrigger>
              <TabsTrigger value="scheduling" className="gap-2">
                <Link2 className="h-4 w-4" />
                Scheduling
              </TabsTrigger>
              <TabsTrigger value="reminders" className="gap-2">
                <Bell className="h-4 w-4" />
                Reminders
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
                {(['month', 'week', 'day', 'agenda'] as ViewMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      viewMode === mode
                        ? 'bg-teal-600 text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Dashboard Overview Banner */}
            <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <BarChart3 className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Calendar Dashboard</h2>
                    <p className="text-teal-100">Your schedule at a glance • {stats.totalEvents} events, {stats.upcomingEvents} upcoming</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.todaysEvents}</p>
                    <p className="text-sm text-teal-200">Today</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.upcomingEvents}</p>
                    <p className="text-sm text-teal-200">This Week</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.pendingRSVPs}</p>
                    <p className="text-sm text-teal-200">Pending</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { label: 'New Event', icon: Plus, color: 'from-teal-500 to-cyan-500' },
                { label: 'Quick Add', icon: Zap, color: 'from-yellow-500 to-orange-500' },
                { label: 'Meet Now', icon: Video, color: 'from-blue-500 to-indigo-500' },
                { label: 'Book Room', icon: MapPin, color: 'from-purple-500 to-pink-500' },
                { label: 'Find Time', icon: Search, color: 'from-green-500 to-emerald-500' },
                { label: 'Schedule', icon: CalendarClock, color: 'from-orange-500 to-red-500' },
                { label: 'Reminder', icon: Bell, color: 'from-pink-500 to-rose-500' },
                { label: 'Share', icon: Share2, color: 'from-gray-500 to-gray-600' }
              ].map((action, i) => (
                <button
                  key={i}
                  className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:scale-105 transition-all group"
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color} text-white group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{action.label}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Today's Schedule */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold">Today's Schedule</CardTitle>
                  <Badge variant="outline">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  {displayEvents
                    .filter(e => new Date(e.start_time).toDateString() === new Date().toDateString())
                    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                    .slice(0, 5)
                    .map(event => (
                      <div key={event.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer" onClick={() => setSelectedEvent(event)}>
                        <div className={`w-1 h-12 rounded-full ${eventColors[event.event_type] || 'bg-gray-500'}`}></div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{event.title}</p>
                          <p className="text-sm text-gray-500">{formatTime(event.start_time)} - {formatTime(event.end_time)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {event.location_type === 'virtual' && <Video className="h-4 w-4 text-blue-500" />}
                          {event.total_attendees > 1 && (
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Users className="h-4 w-4" />{event.total_attendees}
                            </span>
                          )}
                        </div>
                      </div>
                    )) || (
                    <div className="text-center py-8 text-gray-500">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No events scheduled for today</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upcoming */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold">Upcoming</CardTitle>
                  <Button variant="ghost" size="sm">View All</Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcomingEvents.slice(0, 5).map(event => (
                    <div key={event.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer" onClick={() => setSelectedEvent(event)}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${eventColors[event.event_type] || 'bg-gray-500'}`}></div>
                        <span className="font-medium text-gray-900 dark:text-white truncate">{event.title}</span>
                      </div>
                      <p className="text-xs text-gray-500 ml-4">
                        {new Date(event.start_time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • {formatTime(event.start_time)}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* My Calendars */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">My Calendars</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {mockCalendars.map(cal => (
                    <label key={cal.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer group">
                      <div className={`w-3 h-3 rounded ${cal.color} ${!cal.enabled && 'opacity-50'}`}></div>
                      <span className={`flex-1 text-sm ${cal.enabled ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                        {cal.name}
                      </span>
                      <span className="text-xs text-gray-400">{cal.eventCount}</span>
                      <Switch checked={cal.enabled} className="scale-75" />
                    </label>
                  ))}
                  <Button variant="outline" className="w-full mt-2" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Calendar
                  </Button>
                </CardContent>
              </Card>

              {/* Scheduling Links */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold">Scheduling Links</CardTitle>
                  <Button variant="ghost" size="sm">Manage</Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockSchedulingLinks.filter(l => l.isActive).slice(0, 3).map(link => (
                    <div key={link.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">{link.name}</span>
                        <Badge variant="outline">{link.duration} min</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{link.bookingsCount} bookings</span>
                        <span>•</span>
                        <span>{link.availability.join(', ')}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Input value={link.url} readOnly className="text-xs h-8" />
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">This Week</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Total Events</span>
                    <span className="font-bold text-gray-900 dark:text-white">{stats.thisWeek}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Hours Scheduled</span>
                    <span className="font-bold text-gray-900 dark:text-white">{stats.hoursThisWeek}h</span>
                  </div>
                  <Progress value={parseFloat(stats.hoursThisWeek) / 40 * 100} className="h-2" />
                  <p className="text-xs text-gray-500">{(40 - parseFloat(stats.hoursThisWeek)).toFixed(1)} hours available</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6">
            {/* Calendar View Banner */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <CalendarDays className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
                    <p className="text-indigo-100">Navigate and manage your calendar events</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{calendarDays.reduce((sum, d) => sum + d.events.length, 0)}</p>
                    <p className="text-sm text-indigo-200">Events</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{calendarDays.filter(d => d.isToday).length > 0 ? calendarDays.find(d => d.isToday)?.events.length || 0 : 0}</p>
                    <p className="text-sm text-indigo-200">Today</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-6">
              {/* Sidebar */}
              <div className="w-72 space-y-4 hidden lg:block">
                {/* Mini Calendar */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-sm">{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => navigateMonth(-1)}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => navigateMonth(1)}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {WEEKDAYS.map(day => (
                        <div key={day} className="text-xs text-gray-500 py-1">{day.charAt(0)}</div>
                      ))}
                      {calendarDays.map((day, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentDate(day.date)}
                          className={`text-xs p-1.5 rounded-full transition-colors ${
                            day.isToday ? 'bg-teal-600 text-white' :
                            day.isCurrentMonth ? 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700' :
                            'text-gray-400'
                          } ${day.events.length > 0 ? 'font-bold' : ''}`}
                        >
                          {day.date.getDate()}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Calendars */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">My Calendars</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 pt-0">
                    {mockCalendars.slice(0, 4).map(cal => (
                      <label key={cal.id} className="flex items-center gap-2 p-1.5 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className={`w-2.5 h-2.5 rounded ${cal.color} ${!cal.enabled && 'opacity-50'}`}></div>
                        <span className={`text-sm flex-1 ${cal.enabled ? '' : 'text-gray-500'}`}>{cal.name}</span>
                        <Switch checked={cal.enabled} className="scale-75" />
                      </label>
                    ))}
                  </CardContent>
                </Card>

                {/* Upcoming Events */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Upcoming</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0">
                    {upcomingEvents.slice(0, 4).map(event => (
                      <div key={event.id} onClick={() => setSelectedEvent(event)} className="p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${eventColors[event.event_type]}`}></div>
                          <span className="text-sm font-medium truncate">{event.title}</span>
                        </div>
                        <p className="text-xs text-gray-500 ml-4 mt-0.5">
                          {new Date(event.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {formatTime(event.start_time)}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Main Calendar */}
              <div className="flex-1">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={goToToday}>Today</Button>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => navigateMonth(-1)}>
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => navigateMonth(1)}>
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {viewMode === 'day'
                        ? currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                        : `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                      }
                    </h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input placeholder="Search events..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 w-64" />
                    </div>
                  </div>
                </div>

                {loading && (
                  <div className="text-center py-8">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-600 border-r-transparent"></div>
                  </div>
                )}

                {/* Month View */}
                {viewMode === 'month' && !loading && (
                  <Card className="overflow-hidden">
                    <div className="grid grid-cols-7 border-b dark:border-gray-700">
                      {WEEKDAYS.map(day => (
                        <div key={day} className="p-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400 border-r dark:border-gray-700 last:border-r-0">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7">
                      {calendarDays.map((day, i) => (
                        <div
                          key={i}
                          className={`min-h-[100px] p-2 border-b border-r dark:border-gray-700 last:border-r-0 ${
                            !day.isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800/50' : ''
                          } ${day.isToday ? 'bg-teal-50 dark:bg-teal-900/20' : ''}`}
                        >
                          <div className={`text-sm mb-1 ${
                            day.isToday ? 'w-7 h-7 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold' :
                            day.isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                          }`}>
                            {day.date.getDate()}
                          </div>
                          <div className="space-y-1">
                            {day.events.slice(0, 3).map(event => (
                              <div
                                key={event.id}
                                onClick={() => setSelectedEvent(event)}
                                className={`text-xs px-2 py-0.5 rounded truncate cursor-pointer ${eventColors[event.event_type]} text-white hover:opacity-80`}
                              >
                                {formatTime(event.start_time)} {event.title}
                              </div>
                            ))}
                            {day.events.length > 3 && (
                              <div className="text-xs text-gray-500 px-2">+{day.events.length - 3} more</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Week View */}
                {viewMode === 'week' && !loading && (
                  <Card className="overflow-hidden">
                    <div className="grid grid-cols-8 border-b dark:border-gray-700">
                      <div className="p-3 border-r dark:border-gray-700"></div>
                      {weekDays.map((day, i) => (
                        <div key={i} className={`p-3 text-center border-r dark:border-gray-700 last:border-r-0 ${day.isToday ? 'bg-teal-50 dark:bg-teal-900/20' : ''}`}>
                          <div className="text-xs text-gray-500">{WEEKDAYS[day.date.getDay()]}</div>
                          <div className={`text-lg font-bold ${day.isToday ? 'text-teal-600' : 'text-gray-900 dark:text-white'}`}>
                            {day.date.getDate()}
                          </div>
                        </div>
                      ))}
                    </div>
                    <ScrollArea className="h-[500px]">
                      <div className="grid grid-cols-8">
                        {HOURS.slice(6, 22).map(hour => (
                          <div key={hour} className="contents">
                            <div className="p-2 text-xs text-gray-500 text-right border-r dark:border-gray-700 h-14">
                              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                            </div>
                            {weekDays.map((day, i) => (
                              <div key={i} className={`border-r border-b dark:border-gray-700 last:border-r-0 h-14 relative ${day.isToday ? 'bg-teal-50/50 dark:bg-teal-900/10' : ''}`}>
                                {day.events.filter(e => new Date(e.start_time).getHours() === hour).map(event => (
                                  <div
                                    key={event.id}
                                    onClick={() => setSelectedEvent(event)}
                                    className={`absolute left-0.5 right-0.5 p-1 text-xs rounded cursor-pointer ${eventColors[event.event_type]} text-white`}
                                    style={{ top: `${(new Date(event.start_time).getMinutes() / 60) * 56}px` }}
                                  >
                                    <div className="font-medium truncate">{event.title}</div>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </Card>
                )}

                {/* Day View */}
                {viewMode === 'day' && !loading && (
                  <Card className="overflow-hidden">
                    <ScrollArea className="h-[500px]">
                      <div className="grid grid-cols-[80px_1fr]">
                        {HOURS.map(hour => {
                          const dayEvents = displayEvents.filter(e => {
                            const eventDate = new Date(e.start_time)
                            return eventDate.toDateString() === currentDate.toDateString() && eventDate.getHours() === hour
                          })
                          return (
                            <div key={hour} className="contents">
                              <div className="p-2 text-xs text-gray-500 text-right border-r dark:border-gray-700 h-16">
                                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                              </div>
                              <div className="border-b dark:border-gray-700 h-16 relative">
                                {dayEvents.map(event => (
                                  <div
                                    key={event.id}
                                    onClick={() => setSelectedEvent(event)}
                                    className={`absolute left-2 right-2 p-2 rounded cursor-pointer ${eventColors[event.event_type]} text-white`}
                                    style={{ top: `${(new Date(event.start_time).getMinutes() / 60) * 64}px` }}
                                  >
                                    <div className="font-medium">{event.title}</div>
                                    <div className="text-xs opacity-80">{formatTime(event.start_time)} - {formatTime(event.end_time)}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  </Card>
                )}

                {/* Agenda View */}
                {viewMode === 'agenda' && !loading && (
                  <div className="space-y-3">
                    {upcomingEvents.length === 0 ? (
                      <Card className="p-12 text-center">
                        <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No upcoming events</p>
                      </Card>
                    ) : upcomingEvents.map((event, i) => {
                      const eventDate = new Date(event.start_time)
                      const showDateHeader = i === 0 || new Date(upcomingEvents[i - 1].start_time).toDateString() !== eventDate.toDateString()
                      return (
                        <div key={event.id}>
                          {showDateHeader && (
                            <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 mt-4 first:mt-0">
                              {eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </div>
                          )}
                          <Card className="p-4 hover:shadow-md transition-all cursor-pointer" onClick={() => setSelectedEvent(event)}>
                            <div className="flex items-start gap-4">
                              <div className={`w-1 h-16 rounded-full ${eventColors[event.event_type]}`}></div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                                  <Badge variant="outline">{event.event_type}</Badge>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{formatTime(event.start_time)} - {formatTime(event.end_time)}</span>
                                  {event.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{event.location}</span>}
                                  <span className="flex items-center gap-1"><Users className="h-4 w-4" />{event.total_attendees}</span>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            {/* Events List Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <CalendarCheck className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">All Events</h2>
                    <p className="text-blue-100">View and manage all your calendar events</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{displayEvents.length}</p>
                    <p className="text-sm text-blue-200">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{displayEvents.filter(e => e.status === 'confirmed').length}</p>
                    <p className="text-sm text-blue-200">Confirmed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{displayEvents.filter(e => e.rsvp_required && e.status === 'pending').length}</p>
                    <p className="text-sm text-blue-200">Pending</p>
                  </div>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>All Events</CardTitle>
                <div className="flex items-center gap-3">
                  <Input placeholder="Search events..." className="w-64" />
                  <select className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                    <option value="all">All Types</option>
                    <option value="meeting">Meetings</option>
                    <option value="appointment">Appointments</option>
                    <option value="task">Tasks</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {displayEvents.slice(0, 15).map(event => (
                    <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer" onClick={() => setSelectedEvent(event)}>
                      <div className="flex items-center gap-4">
                        <div className={`w-1 h-10 rounded-full ${eventColors[event.event_type]}`}></div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{event.title}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(event.start_time).toLocaleDateString()} • {formatTime(event.start_time)} - {formatTime(event.end_time)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                        <Badge variant="outline">{event.event_type}</Badge>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Users className="h-4 w-4" />{event.total_attendees}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scheduling Tab */}
          <TabsContent value="scheduling" className="space-y-6">
            {/* Scheduling Banner */}
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Link2 className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Scheduling Links</h2>
                    <p className="text-green-100">Create and manage booking links for easy scheduling</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockSchedulingLinks.length}</p>
                    <p className="text-sm text-green-200">Links</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockSchedulingLinks.filter(l => l.isActive).length}</p>
                    <p className="text-sm text-green-200">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockSchedulingLinks.reduce((sum, l) => sum + l.bookingsCount, 0)}</p>
                    <p className="text-sm text-green-200">Bookings</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Scheduling Links</h2>
                <p className="text-gray-500">Let others book time on your calendar</p>
              </div>
              <Button className="bg-teal-600 hover:bg-teal-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Link
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockSchedulingLinks.map(link => (
                <Card key={link.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{link.name}</h3>
                        <p className="text-sm text-gray-500">{link.duration} minutes • {link.buffer} min buffer</p>
                      </div>
                      <Switch checked={link.isActive} />
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
                      <Link2 className="h-4 w-4 text-gray-400" />
                      <code className="text-sm text-gray-600 dark:text-gray-400 flex-1 truncate">{link.url}</code>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Available: {link.availability.join(', ')}</span>
                      <span className="text-teal-600 font-medium">{link.bookingsCount} bookings</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Reminders Tab */}
          <TabsContent value="reminders" className="space-y-6">
            {/* Reminders Banner */}
            <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Bell className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Reminders</h2>
                    <p className="text-orange-100">Never miss an important event with timely reminders</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockReminders.length}</p>
                    <p className="text-sm text-orange-200">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockReminders.filter(r => !r.completed).length}</p>
                    <p className="text-sm text-orange-200">Pending</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockReminders.filter(r => r.completed).length}</p>
                    <p className="text-sm text-orange-200">Done</p>
                  </div>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Reminders</CardTitle>
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Reminder
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockReminders.map(reminder => (
                  <div key={reminder.id} className={`flex items-center gap-4 p-4 rounded-lg ${reminder.completed ? 'bg-gray-100 dark:bg-gray-800 opacity-60' : 'bg-gray-50 dark:bg-gray-800'}`}>
                    <button className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${reminder.completed ? 'bg-teal-600 border-teal-600' : 'border-gray-300'}`}>
                      {reminder.completed && <CheckCircle2 className="h-3 w-3 text-white" />}
                    </button>
                    <div className="flex-1">
                      <p className={`font-medium ${reminder.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>{reminder.title}</p>
                      <p className="text-sm text-gray-500">
                        {reminder.datetime.toLocaleDateString()} at {formatTime(reminder.datetime)}
                      </p>
                    </div>
                    <Badge variant="outline">{reminder.type}</Badge>
                    <Button variant="ghost" size="sm"><Trash2 className="h-4 w-4 text-gray-400" /></Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* Settings Overview Banner */}
            <div className="bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Settings className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Calendar Settings</h2>
                    <p className="text-gray-300">Configure your schedule, availability, and preferences</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Synced</Badge>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </div>

            {/* Settings Sidebar Layout */}
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card className="border-0 shadow-sm sticky top-6">
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', icon: Settings, label: 'General', desc: 'Basic settings' },
                        { id: 'availability', icon: Clock, label: 'Availability', desc: 'Working hours' },
                        { id: 'sync', icon: Link2, label: 'Sync', desc: 'Connected apps' },
                        { id: 'timezone', icon: Globe, label: 'Time Zone', desc: 'Location prefs' },
                        { id: 'notifications', icon: Bell, label: 'Notifications', desc: 'Alert prefs' },
                        { id: 'advanced', icon: Zap, label: 'Advanced', desc: 'Power settings' }
                      ].map(item => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                            settingsTab === item.id
                              ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          <div className="text-left">
                            <p className="font-medium text-sm">{item.label}</p>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                          </div>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-teal-600" />
                        General Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Calendar Name</label>
                        <Input defaultValue="My Calendar" className="max-w-md" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default View</label>
                        <select className="w-full max-w-md px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                          <option>Month</option>
                          <option>Week</option>
                          <option>Day</option>
                          <option>Agenda</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Week Starts On</p>
                          <p className="text-sm text-gray-500">Sunday or Monday</p>
                        </div>
                        <select className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-700">
                          <option>Sunday</option>
                          <option>Monday</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Show Weekends</p>
                          <p className="text-sm text-gray-500">Display Saturday and Sunday</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Show Declined Events</p>
                          <p className="text-sm text-gray-500">Display events you declined</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Show Week Numbers</p>
                          <p className="text-sm text-gray-500">Display week numbers in calendar</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Enable Drag and Drop</p>
                          <p className="text-sm text-gray-500">Move events by dragging</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Show Event Details on Hover</p>
                          <p className="text-sm text-gray-500">Preview events with a tooltip</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Color Code by Type</p>
                          <p className="text-sm text-gray-500">Color events by category</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Event Duration</label>
                        <select className="w-full max-w-md px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                          <option>15 minutes</option>
                          <option>30 minutes</option>
                          <option>45 minutes</option>
                          <option>1 hour</option>
                          <option>2 hours</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Reminder Time</label>
                        <select className="w-full max-w-md px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                          <option>5 minutes before</option>
                          <option>10 minutes before</option>
                          <option>15 minutes before</option>
                          <option>30 minutes before</option>
                          <option>1 hour before</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Show Birthdays</p>
                          <p className="text-sm text-gray-500">Display birthdays from contacts</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Show Holidays</p>
                          <p className="text-sm text-gray-500">Display public holidays</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Availability Settings */}
                {settingsTab === 'availability' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        Working Hours
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {mockWorkingHours.map(wh => (
                        <div key={wh.day} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Switch checked={wh.enabled} className="scale-90" />
                          <span className={`w-24 text-sm ${wh.enabled ? 'font-medium' : 'text-gray-500'}`}>{wh.day}</span>
                          {wh.enabled ? (
                            <div className="flex items-center gap-2 flex-1">
                              <Input type="time" defaultValue={wh.start} className="w-28 h-9" />
                              <span className="text-gray-400">to</span>
                              <Input type="time" defaultValue={wh.end} className="w-28 h-9" />
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Unavailable</span>
                          )}
                        </div>
                      ))}
                      <div className="pt-4 border-t dark:border-gray-700">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Buffer Time</p>
                            <p className="text-sm text-gray-500">Add buffer between meetings</p>
                          </div>
                          <select className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-700">
                            <option>None</option>
                            <option>5 minutes</option>
                            <option>10 minutes</option>
                            <option>15 minutes</option>
                          </select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Sync Settings */}
                {settingsTab === 'sync' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Link2 className="w-5 h-5 text-purple-600" />
                        Calendar Sync
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { name: 'Google Calendar', connected: true, email: 'user@gmail.com', icon: CalendarIcon },
                        { name: 'Outlook Calendar', connected: true, email: 'user@outlook.com', icon: CalendarIcon },
                        { name: 'Apple Calendar', connected: false, icon: CalendarIcon },
                        { name: 'Zoom', connected: true, email: 'Connected', icon: Video },
                        { name: 'Microsoft Teams', connected: false, icon: Users },
                        { name: 'Slack', connected: true, email: 'Connected', icon: MessageSquare },
                        { name: 'Notion', connected: false, icon: FileText },
                      ].map((cal, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cal.connected ? 'bg-teal-100 text-teal-600' : 'bg-gray-200 text-gray-500'}`}>
                              <cal.icon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{cal.name}</p>
                              {cal.email && <p className="text-sm text-gray-500">{cal.email}</p>}
                            </div>
                          </div>
                          <Button variant={cal.connected ? 'outline' : 'default'} size="sm">
                            {cal.connected ? 'Disconnect' : 'Connect'}
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Time Zone Settings */}
                {settingsTab === 'timezone' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-green-600" />
                        Time Zone Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Time Zone</label>
                        <select className="w-full max-w-md px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                          <option>America/New_York (EST)</option>
                          <option>America/Los_Angeles (PST)</option>
                          <option>Europe/London (GMT)</option>
                          <option>Asia/Tokyo (JST)</option>
                          <option>Australia/Sydney (AEST)</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Show Secondary Time Zone</p>
                          <p className="text-sm text-gray-500">Display a second time zone in calendar</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Auto-detect Time Zone</p>
                          <p className="text-sm text-gray-500">Update based on your location</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">24-Hour Format</p>
                          <p className="text-sm text-gray-500">Use 24-hour time format</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Show World Clock</p>
                          <p className="text-sm text-gray-500">Display multiple time zones</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Show Attendee Time Zones</p>
                          <p className="text-sm text-gray-500">Display time in attendee&apos;s local time</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-orange-600" />
                        Notification Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { label: 'Email Reminders', desc: 'Receive email reminders before events', enabled: true },
                        { label: 'Push Notifications', desc: 'Get notified on your devices', enabled: true },
                        { label: 'Daily Digest', desc: 'Summary of your schedule each morning', enabled: false },
                        { label: 'Week Ahead', desc: 'Weekly overview every Sunday', enabled: true },
                        { label: 'Event Invitations', desc: 'Notify when invited to events', enabled: true },
                        { label: 'RSVP Updates', desc: 'Notify when attendees respond', enabled: true },
                        { label: 'Event Changes', desc: 'Notify when events are modified', enabled: true },
                        { label: 'Cancellations', desc: 'Notify when events are cancelled', enabled: true },
                        { label: 'Rescheduling', desc: 'Notify when events are moved', enabled: true },
                        { label: 'Scheduling Conflicts', desc: 'Warn about double-bookings', enabled: true },
                      ].map((setting, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{setting.label}</p>
                            <p className="text-sm text-gray-500">{setting.desc}</p>
                          </div>
                          <Switch defaultChecked={setting.enabled} />
                        </div>
                      ))}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notification Channels</label>
                        <div className="flex gap-2">
                          <Badge className="bg-blue-100 text-blue-700">Email</Badge>
                          <Badge className="bg-purple-100 text-purple-700">Push</Badge>
                          <Badge className="bg-green-100 text-green-700">SMS</Badge>
                          <Badge variant="outline">Slack</Badge>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quiet Hours</label>
                        <div className="flex items-center gap-2 max-w-md">
                          <Input type="time" defaultValue="22:00" className="w-28" />
                          <span className="text-gray-500">to</span>
                          <Input type="time" defaultValue="08:00" className="w-28" />
                        </div>
                        <p className="text-sm text-gray-500 mt-1">No notifications during these hours</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-600" />
                        Advanced Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Keyboard Shortcuts</p>
                          <p className="text-sm text-gray-500">Enable keyboard navigation</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Quick Add Events</p>
                          <p className="text-sm text-gray-500">Create events with natural language</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Auto-decline Conflicts</p>
                          <p className="text-sm text-gray-500">Automatically decline overlapping events</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Speedy Meetings</p>
                          <p className="text-sm text-gray-500">End meetings 5 minutes early</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Focus Time Blocking</p>
                          <p className="text-sm text-gray-500">Auto-block deep work periods</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Meeting Cost Calculator</p>
                          <p className="text-sm text-gray-500">Show estimated cost of meetings</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Travel Time Blocking</p>
                          <p className="text-sm text-gray-500">Auto-block travel time between events</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Smart Scheduling</p>
                          <p className="text-sm text-gray-500">AI-powered optimal meeting times</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Meeting Analytics</p>
                          <p className="text-sm text-gray-500">Track time spent in meetings</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">iCal Export</p>
                          <p className="text-sm text-gray-500">Allow external iCal subscriptions</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">API Access</p>
                          <p className="text-sm text-gray-500">Enable calendar API integrations</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Webhook Notifications</p>
                          <p className="text-sm text-gray-500">Send events to external endpoints</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="pt-6 border-t dark:border-gray-700">
                        <h4 className="font-medium text-red-600 mb-4">Danger Zone</h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                            <div>
                              <p className="font-medium text-red-700 dark:text-red-400">Clear All Events</p>
                              <p className="text-sm text-red-600">Remove all events from calendar</p>
                            </div>
                            <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100">
                              Clear
                            </Button>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                            <div>
                              <p className="font-medium text-red-700 dark:text-red-400">Delete Calendar</p>
                              <p className="text-sm text-red-600">Permanently delete this calendar</p>
                            </div>
                            <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100">
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={calendarAIInsights}
              title="Calendar Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={calendarCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={calendarPredictions}
              title="Schedule Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={calendarActivities}
            title="Calendar Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={calendarQuickActions}
            variant="grid"
          />
        </div>

        {/* Event Detail Modal */}
        {selectedEvent && (
          <Dialog open={!!selectedEvent} onOpenChange={() => { setSelectedEvent(null); setIsEditing(false) }}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${eventColors[selectedEvent.event_type]}`}></div>
                  {isEditing ? 'Edit Event' : selectedEvent.title}
                </DialogTitle>
              </DialogHeader>
              {isEditing ? (
                <div className="space-y-4 py-4">
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
                    <textarea rows={3} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" value={editForm.description} onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))} />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button className="flex-1 bg-teal-600 hover:bg-teal-700" onClick={handleUpdateEvent} disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Clock className="h-5 w-5" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedEvent.start_time).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="text-sm">{formatTime(selectedEvent.start_time)} - {formatTime(selectedEvent.end_time)}</div>
                    </div>
                  </div>
                  {selectedEvent.location && (
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <MapPin className="h-5 w-5" />
                      <span>{selectedEvent.location}</span>
                    </div>
                  )}
                  {selectedEvent.location_type === 'virtual' && (
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <Video className="h-5 w-5" />
                      <Button variant="link" className="text-teal-600 p-0">Join Video Call</Button>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Users className="h-5 w-5" />
                    <span>{selectedEvent.total_attendees} attendees</span>
                    {selectedEvent.rsvp_required && (
                      <span className="text-sm text-gray-500">({selectedEvent.accepted_count} accepted)</span>
                    )}
                  </div>
                  {selectedEvent.description && (
                    <div className="pt-4 border-t dark:border-gray-700">
                      <p className="text-gray-600 dark:text-gray-400">{selectedEvent.description}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-4 border-t dark:border-gray-700">
                    <Button className="flex-1 bg-teal-600 hover:bg-teal-700" onClick={() => startEditing(selectedEvent)}>
                      <Edit2 className="h-4 w-4 mr-2" />Edit
                    </Button>
                    <Button variant="outline" onClick={() => toast.promise(navigator.clipboard.writeText(selectedEvent.title), { loading: 'Copying to clipboard...', success: 'Event title copied to clipboard', error: 'Failed to copy to clipboard' })}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleDeleteEvent(selectedEvent)} disabled={loading}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
