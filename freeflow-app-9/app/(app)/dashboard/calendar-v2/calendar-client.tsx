'use client'
import { useState, useMemo } from 'react'
import { useCalendarEvents, type CalendarEvent, type EventType, type EventStatus } from '@/lib/hooks/use-calendar-events'
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock,
  MapPin, Users, Video, Phone, Bell, Repeat, Tag, MoreHorizontal,
  Search, Filter, Settings, Grid3X3, List, CalendarDays, Sun, Moon,
  Globe, Link2, CheckCircle2, XCircle, AlertCircle, Edit2, Trash2,
  Copy, ExternalLink, Eye, EyeOff, Palette, Download, Share2
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

type ViewMode = 'month' | 'week' | 'day' | 'agenda'

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  events: CalendarEvent[]
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const eventColors: Record<string, string> = {
  meeting: 'bg-blue-500',
  appointment: 'bg-green-500',
  task: 'bg-yellow-500',
  reminder: 'bg-purple-500',
  event: 'bg-pink-500',
  deadline: 'bg-red-500'
}

export default function CalendarClient({ initialEvents }: { initialEvents: CalendarEvent[] }) {
  const [eventTypeFilter, setEventTypeFilter] = useState<EventType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showNewEvent, setShowNewEvent] = useState(false)
  const [showMiniCalendar, setShowMiniCalendar] = useState(true)
  const { events, loading, error } = useCalendarEvents({ eventType: eventTypeFilter, status: statusFilter })
  const displayEvents = (events && events.length > 0) ? events : (initialEvents || [])

  const stats = useMemo(() => ({
    total: displayEvents.length,
    confirmed: displayEvents.filter(e => e.status === 'confirmed').length,
    meetings: displayEvents.filter(e => e.event_type === 'meeting').length,
    upcoming: displayEvents.filter(e => new Date(e.start_time) > new Date()).length,
    avgAttendees: displayEvents.length > 0
      ? (displayEvents.reduce((sum, e) => sum + e.total_attendees, 0) / displayEvents.length).toFixed(1)
      : '0'
  }), [displayEvents])

  // Calendar utilities
  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
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

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const calendarDays = useMemo(() => getDaysInMonth(currentDate), [currentDate, displayEvents])
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate, displayEvents])

  const upcomingEvents = useMemo(() => {
    return displayEvents
      .filter(e => new Date(e.start_time) >= new Date())
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .slice(0, 10)
  }, [displayEvents])

  // Mini calendars for sidebar
  const miniCalendarDays = useMemo(() => getDaysInMonth(currentDate), [currentDate])

  if (error) return <div className="p-8"><div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-50 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 text-white">
        <div className="max-w-full mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CalendarIcon className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">Calendar</h1>
                <p className="text-teal-100 text-sm">Manage your schedule and events</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Quick Stats */}
              <div className="hidden lg:flex items-center gap-6 mr-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-xs text-teal-200">Events</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.upcoming}</div>
                  <div className="text-xs text-teal-200">Upcoming</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.meetings}</div>
                  <div className="text-xs text-teal-200">Meetings</div>
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
                {(['month', 'week', 'day', 'agenda'] as ViewMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      viewMode === mode
                        ? 'bg-white text-teal-600'
                        : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowNewEvent(true)}
                className="flex items-center gap-2 bg-white text-teal-600 px-4 py-2 rounded-lg font-medium hover:bg-teal-50 transition-colors"
              >
                <Plus className="h-4 w-4" />
                New Event
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-72 bg-white dark:bg-gray-800 border-r dark:border-gray-700 p-4 hidden lg:block">
          {/* Mini Calendar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {WEEKDAYS.map(day => (
                <div key={day} className="text-xs text-gray-500 dark:text-gray-500 py-1">
                  {day.charAt(0)}
                </div>
              ))}
              {miniCalendarDays.map((day, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentDate(day.date)}
                  className={`text-xs p-1.5 rounded-full transition-colors ${
                    day.isToday
                      ? 'bg-teal-600 text-white'
                      : day.isCurrentMonth
                        ? 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                        : 'text-gray-400 dark:text-gray-600'
                  } ${day.events.length > 0 ? 'font-bold' : ''}`}
                >
                  {day.date.getDate()}
                </button>
              ))}
            </div>
          </div>

          {/* Calendars */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">My Calendars</h3>
            <div className="space-y-2">
              {[
                { name: 'Personal', color: 'bg-blue-500', enabled: true },
                { name: 'Work', color: 'bg-green-500', enabled: true },
                { name: 'Meetings', color: 'bg-purple-500', enabled: true },
                { name: 'Holidays', color: 'bg-red-500', enabled: false },
                { name: 'Birthdays', color: 'bg-pink-500', enabled: false }
              ].map(cal => (
                <label key={cal.name} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-3 h-3 rounded ${cal.color} ${!cal.enabled && 'opacity-50'}`}></div>
                  <span className={`text-sm flex-1 ${cal.enabled ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-500'}`}>
                    {cal.name}
                  </span>
                  {cal.enabled ? (
                    <Eye className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100" />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Upcoming</h3>
            <div className="space-y-2">
              {upcomingEvents.slice(0, 5).map(event => (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${eventColors[event.event_type] || 'bg-gray-500'}`}></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{event.title}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 ml-4 mt-1">
                    {new Date(event.start_time).toLocaleDateString()} • {formatTime(event.start_time)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Calendar Area */}
        <div className="flex-1 p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={goToToday}
                className="px-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Today
              </button>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-64"
                />
              </div>
              <select
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="meeting">Meetings</option>
                <option value="appointment">Appointments</option>
                <option value="task">Tasks</option>
                <option value="reminder">Reminders</option>
              </select>
            </div>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-600 border-r-transparent"></div>
            </div>
          )}

          {/* Month View */}
          {viewMode === 'month' && !loading && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
              {/* Week Day Headers */}
              <div className="grid grid-cols-7 border-b dark:border-gray-700">
                {WEEKDAYS.map(day => (
                  <div key={day} className="p-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400 border-r dark:border-gray-700 last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7">
                {calendarDays.map((day, i) => (
                  <div
                    key={i}
                    className={`min-h-[120px] p-2 border-b border-r dark:border-gray-700 last:border-r-0 ${
                      !day.isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800/50' : ''
                    } ${day.isToday ? 'bg-teal-50 dark:bg-teal-900/20' : ''}`}
                  >
                    <div className={`text-sm mb-1 ${
                      day.isToday
                        ? 'w-7 h-7 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold'
                        : day.isCurrentMonth
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-400 dark:text-gray-600'
                    }`}>
                      {day.date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {day.events.slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          onClick={() => setSelectedEvent(event)}
                          className={`text-xs px-2 py-1 rounded truncate cursor-pointer ${eventColors[event.event_type] || 'bg-gray-500'} text-white hover:opacity-80`}
                        >
                          {formatTime(event.start_time)} {event.title}
                        </div>
                      ))}
                      {day.events.length > 3 && (
                        <div className="text-xs text-gray-500 dark:text-gray-500 px-2">
                          +{day.events.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Week View */}
          {viewMode === 'week' && !loading && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
              {/* Time + Day Headers */}
              <div className="grid grid-cols-8 border-b dark:border-gray-700">
                <div className="p-3 border-r dark:border-gray-700"></div>
                {weekDays.map((day, i) => (
                  <div key={i} className={`p-3 text-center border-r dark:border-gray-700 last:border-r-0 ${day.isToday ? 'bg-teal-50 dark:bg-teal-900/20' : ''}`}>
                    <div className="text-xs text-gray-500 dark:text-gray-500">{WEEKDAYS[day.date.getDay()]}</div>
                    <div className={`text-lg font-bold ${day.isToday ? 'text-teal-600' : 'text-gray-900 dark:text-white'}`}>
                      {day.date.getDate()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Time Grid */}
              <ScrollArea className="h-[600px]">
                <div className="grid grid-cols-8">
                  {HOURS.map(hour => (
                    <div key={hour} className="contents">
                      <div className="p-2 text-xs text-gray-500 dark:text-gray-500 text-right border-r dark:border-gray-700 h-16">
                        {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                      </div>
                      {weekDays.map((day, i) => (
                        <div key={i} className={`border-r border-b dark:border-gray-700 last:border-r-0 h-16 relative ${day.isToday ? 'bg-teal-50/50 dark:bg-teal-900/10' : ''}`}>
                          {day.events
                            .filter(e => new Date(e.start_time).getHours() === hour)
                            .map(event => (
                              <div
                                key={event.id}
                                onClick={() => setSelectedEvent(event)}
                                className={`absolute left-1 right-1 p-1 text-xs rounded cursor-pointer ${eventColors[event.event_type] || 'bg-gray-500'} text-white`}
                                style={{ top: `${(new Date(event.start_time).getMinutes() / 60) * 64}px` }}
                              >
                                <div className="font-medium truncate">{event.title}</div>
                                <div className="opacity-80">{formatTime(event.start_time)}</div>
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Day View */}
          {viewMode === 'day' && !loading && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
              <ScrollArea className="h-[600px]">
                <div className="grid grid-cols-[80px_1fr]">
                  {HOURS.map(hour => {
                    const dayEvents = displayEvents.filter(e => {
                      const eventDate = new Date(e.start_time)
                      return eventDate.toDateString() === currentDate.toDateString() && eventDate.getHours() === hour
                    })

                    return (
                      <div key={hour} className="contents">
                        <div className="p-2 text-xs text-gray-500 dark:text-gray-500 text-right border-r dark:border-gray-700 h-20">
                          {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                        </div>
                        <div className="border-b dark:border-gray-700 h-20 relative">
                          {dayEvents.map(event => (
                            <div
                              key={event.id}
                              onClick={() => setSelectedEvent(event)}
                              className={`absolute left-2 right-2 p-2 rounded cursor-pointer ${eventColors[event.event_type] || 'bg-gray-500'} text-white`}
                              style={{ top: `${(new Date(event.start_time).getMinutes() / 60) * 80}px` }}
                            >
                              <div className="font-medium">{event.title}</div>
                              <div className="text-sm opacity-80">{formatTime(event.start_time)} - {formatTime(event.end_time)}</div>
                              {event.location && <div className="text-xs opacity-80 mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location}</div>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Agenda View */}
          {viewMode === 'agenda' && !loading && (
            <div className="space-y-4">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
                  <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No upcoming events</p>
                </div>
              ) : (
                upcomingEvents.map((event, i) => {
                  const eventDate = new Date(event.start_time)
                  const showDateHeader = i === 0 || new Date(upcomingEvents[i - 1].start_time).toDateString() !== eventDate.toDateString()

                  return (
                    <div key={event.id}>
                      {showDateHeader && (
                        <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 mt-4 first:mt-0">
                          {eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </div>
                      )}
                      <div
                        onClick={() => setSelectedEvent(event)}
                        className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-1 h-full min-h-[60px] rounded-full ${eventColors[event.event_type] || 'bg-gray-500'}`}></div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-0.5 rounded-full text-xs ${
                                event.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                event.status === 'tentative' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                              }`}>
                                {event.status}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-xs bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                                {event.event_type}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                            {event.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{event.description}</p>}
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500 mt-2">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatTime(event.start_time)} - {formatTime(event.end_time)}
                              </span>
                              {event.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {event.location}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {event.total_attendees} attendees
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Event Detail Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${eventColors[selectedEvent?.event_type || 'meeting']}`}></div>
              {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <Clock className="h-5 w-5" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {selectedEvent && new Date(selectedEvent.start_time).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="text-sm">
                  {selectedEvent && formatTime(selectedEvent.start_time)} - {selectedEvent && formatTime(selectedEvent.end_time)}
                </div>
              </div>
            </div>

            {selectedEvent?.location && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <MapPin className="h-5 w-5" />
                <span>{selectedEvent.location}</span>
              </div>
            )}

            {selectedEvent?.location_type === 'virtual' && (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Video className="h-5 w-5" />
                <button className="text-teal-600 dark:text-teal-400 hover:underline">Join Video Call</button>
              </div>
            )}

            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <Users className="h-5 w-5" />
              <span>{selectedEvent?.total_attendees} attendees</span>
              {selectedEvent?.rsvp_required && (
                <span className="text-sm text-gray-500">
                  ({selectedEvent.accepted_count} accepted)
                </span>
              )}
            </div>

            {selectedEvent?.description && (
              <div className="pt-4 border-t dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400">{selectedEvent.description}</p>
              </div>
            )}

            <div className="flex items-center gap-2 pt-4 border-t dark:border-gray-700">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                <Edit2 className="h-4 w-4" />
                Edit
              </button>
              <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <Copy className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <Trash2 className="h-4 w-4 text-red-600" />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Event Modal */}
      <Dialog open={showNewEvent} onOpenChange={setShowNewEvent}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Plus className="h-6 w-6 text-teal-600" />
              Create New Event
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Title</label>
              <input
                type="text"
                placeholder="Add title"
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start</label>
                <input
                  type="datetime-local"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End</label>
                <input
                  type="datetime-local"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Type</label>
              <select className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option value="meeting">Meeting</option>
                <option value="appointment">Appointment</option>
                <option value="task">Task</option>
                <option value="reminder">Reminder</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add location"
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Video className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                rows={3}
                placeholder="Add description"
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-4 pt-4 border-t dark:border-gray-700">
              <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <Users className="h-4 w-4" />
                Add guests
              </button>
              <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <Bell className="h-4 w-4" />
                Add reminder
              </button>
              <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <Repeat className="h-4 w-4" />
                Repeat
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowNewEvent(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                Create Event
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
