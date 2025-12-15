'use client'
import { useState } from 'react'
import { useCalendarEvents, type CalendarEvent, type EventType, type EventStatus } from '@/lib/hooks/use-calendar-events'

export default function CalendarClient({ initialEvents }: { initialEvents: CalendarEvent[] }) {
  const [eventTypeFilter, setEventTypeFilter] = useState<EventType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all')
  const { events, loading, error } = useCalendarEvents({ eventType: eventTypeFilter, status: statusFilter })
  const displayEvents = events.length > 0 ? events : initialEvents

  const stats = {
    total: displayEvents.length,
    confirmed: displayEvents.filter(e => e.status === 'confirmed').length,
    meetings: displayEvents.filter(e => e.event_type === 'meeting').length,
    avgAttendees: displayEvents.length > 0 ? (displayEvents.reduce((sum, e) => sum + e.total_attendees, 0) / displayEvents.length).toFixed(1) : '0'
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  if (error) return <div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Calendar</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Total Events</div><div className="text-3xl font-bold text-teal-600">{stats.total}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Confirmed</div><div className="text-3xl font-bold text-green-600">{stats.confirmed}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Meetings</div><div className="text-3xl font-bold text-blue-600">{stats.meetings}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Avg Attendees</div><div className="text-3xl font-bold text-purple-600">{stats.avgAttendees}</div></div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border space-y-4">
          <div className="flex gap-4">
            <select value={eventTypeFilter} onChange={(e) => setEventTypeFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Types</option><option value="meeting">Meeting</option><option value="appointment">Appointment</option><option value="task">Task</option><option value="reminder">Reminder</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Status</option><option value="confirmed">Confirmed</option><option value="tentative">Tentative</option><option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {loading && <div className="text-center py-8"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-600 border-r-transparent"></div></div>}

        <div className="space-y-4">{displayEvents.filter(e => (eventTypeFilter === 'all' || e.event_type === eventTypeFilter) && (statusFilter === 'all' || e.status === statusFilter)).map(event => (
          <div key={event.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs ${event.status === 'confirmed' ? 'bg-green-100 text-green-700' : event.status === 'tentative' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{event.status}</span>
                  <span className="px-3 py-1 rounded-full text-xs bg-teal-100 text-teal-700">{event.event_type}</span>
                  {event.location_type && <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">{event.location_type}</span>}
                </div>
                <h3 className="text-lg font-semibold">{event.title}</h3>
                {event.description && <p className="text-sm text-gray-600 mt-1">{event.description}</p>}
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                  <span>{new Date(event.start_time).toLocaleDateString()}</span>
                  <span>{formatTime(event.start_time)} - {formatTime(event.end_time)}</span>
                  {event.location && <span>📍 {event.location}</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-teal-600">{event.total_attendees}</div>
                <div className="text-xs text-gray-500">attendees</div>
                {event.rsvp_required && <div className="text-xs text-gray-600 mt-1">RSVP: {event.accepted_count}/{event.total_attendees}</div>}
              </div>
            </div>
          </div>
        ))}</div>
      </div>
    </div>
  )
}
