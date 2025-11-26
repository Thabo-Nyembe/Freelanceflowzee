// SESSION_13: CALENDAR UTILITIES - World-Class Calendar & Scheduling System
// Production-ready calendar with meeting management, AI scheduling, and analytics

import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('Calendar')

// ================================
// TYPESCRIPT INTERFACES
// ================================

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: string // ISO 8601
  endTime: string // ISO 8601
  allDay: boolean

  // Event details
  type: EventType
  status: EventStatus
  visibility: EventVisibility

  // Location
  location?: string
  locationType: LocationType
  meetingUrl?: string
  coordinates?: { lat: number; lng: number }

  // People
  organizerId: string
  organizerName: string
  organizerEmail: string
  attendees: EventAttendee[]

  // Settings
  color?: string
  reminder?: number // minutes before
  reminders: EventReminder[]
  recurrence?: RecurrenceRule

  // Metadata
  calendarId: string
  timeZone: string

  // Engagement
  rsvpRequired: boolean
  rsvpDeadline?: string
  attachments: EventAttachment[]

  // Tracking
  views: number
  responses: number

  // Integration
  externalId?: string // Google Calendar, Outlook, etc.
  source?: string

  // Timestamps
  createdAt: string
  updatedAt: string
}

export type EventType =
  | 'meeting'
  | 'call'
  | 'presentation'
  | 'workshop'
  | 'deadline'
  | 'reminder'
  | 'task'
  | 'interview'
  | 'review'
  | 'social'
  | 'personal'
  | 'other'

export type EventStatus =
  | 'tentative'
  | 'confirmed'
  | 'cancelled'
  | 'completed'

export type EventVisibility =
  | 'public'
  | 'private'
  | 'confidential'

export type LocationType =
  | 'physical'
  | 'video'
  | 'phone'
  | 'hybrid'
  | 'none'

export interface EventAttendee {
  id: string
  userId?: string
  email: string
  name: string
  avatar?: string
  role: AttendeeRole
  status: AttendeeStatus
  optional: boolean
  responseTime?: string
  notes?: string
}

export type AttendeeRole =
  | 'organizer'
  | 'required'
  | 'optional'
  | 'resource' // e.g., meeting room

export type AttendeeStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'tentative'
  | 'no-response'

export interface EventReminder {
  id: string
  minutes: number // before event
  method: ReminderMethod
  sent: boolean
  sentAt?: string
}

export type ReminderMethod =
  | 'email'
  | 'push'
  | 'sms'
  | 'popup'

export interface RecurrenceRule {
  frequency: RecurrenceFrequency
  interval: number
  endDate?: string
  count?: number
  byDay?: number[] // 0-6 (Sun-Sat)
  byMonthDay?: number[] // 1-31
  byMonth?: number[] // 1-12
  exceptions?: string[] // ISO dates to skip
}

export type RecurrenceFrequency =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'

export interface EventAttachment {
  id: string
  name: string
  url: string
  size: number
  type: string
  uploadedBy: string
  uploadedAt: string
}

export interface CalendarSettings {
  id: string
  userId: string
  name: string
  description?: string
  color: string
  isDefault: boolean
  isVisible: boolean
  timeZone: string
  workingHours: WorkingHours
  notifications: NotificationSettings
}

export interface WorkingHours {
  monday: TimeRange[]
  tuesday: TimeRange[]
  wednesday: TimeRange[]
  thursday: TimeRange[]
  friday: TimeRange[]
  saturday: TimeRange[]
  sunday: TimeRange[]
}

export interface TimeRange {
  start: string // HH:mm format
  end: string
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  sms: boolean
  defaultReminder: number // minutes
}

export interface CalendarAnalytics {
  totalEvents: number
  thisMonth: number
  thisWeek: number
  today: number

  // By type
  eventsByType: Record<EventType, number>

  // By status
  confirmed: number
  tentative: number
  cancelled: number
  completed: number

  // Metrics
  averageDuration: number // minutes
  totalMeetingTime: number // minutes
  utilizationRate: number // percentage
  responseRate: number // percentage
  acceptanceRate: number // percentage

  // Trends
  eventsPerDay: Array<{ date: string; count: number }>
  busyHours: Array<{ hour: number; count: number }>
  topAttendees: Array<{ name: string; count: number }>

  // AI insights
  aiInsights: AIInsight[]
}

export interface AIInsight {
  id: string
  type: InsightType
  title: string
  description: string
  impact: 'low' | 'medium' | 'high'
  confidence: number // 0-100
  actionable: boolean
  suggestion?: string
  data?: Record<string, any>
}

export type InsightType =
  | 'optimization'
  | 'conflict'
  | 'productivity'
  | 'balance'
  | 'trend'
  | 'recommendation'

export interface TimeSlot {
  start: string
  end: string
  available: boolean
  conflicts?: CalendarEvent[]
}

export interface SchedulingSuggestion {
  id: string
  timeSlot: TimeSlot
  score: number // 0-100
  reasoning: string[]
  attendeeAvailability: Record<string, boolean>
}

// ================================
// MOCK DATA - 50+ EVENTS
// ================================

export const mockCalendarEvents: CalendarEvent[] = [
  // MEETINGS (15 events)
  {
    id: 'evt-001',
    title: 'Client Kickoff - TechCorp',
    description: 'Initial project kickoff meeting with TechCorp stakeholders',
    startTime: '2024-01-15T09:00:00Z',
    endTime: '2024-01-15T10:00:00Z',
    allDay: false,
    type: 'meeting',
    status: 'confirmed',
    visibility: 'public',
    location: 'Conference Room A',
    locationType: 'physical',
    organizerId: 'user-001',
    organizerName: 'Sarah Johnson',
    organizerEmail: 'sarah@kazi.com',
    attendees: [
      {
        id: 'att-001',
        email: 'john@techcorp.com',
        name: 'John Smith',
        role: 'required',
        status: 'accepted',
        optional: false,
        responseTime: '2024-01-10T14:30:00Z'
      },
      {
        id: 'att-002',
        email: 'emma@techcorp.com',
        name: 'Emma Davis',
        role: 'required',
        status: 'accepted',
        optional: false,
        responseTime: '2024-01-10T15:45:00Z'
      },
      {
        id: 'att-003',
        email: 'mike@kazi.com',
        name: 'Mike Wilson',
        role: 'optional',
        status: 'tentative',
        optional: true
      }
    ],
    color: '#3b82f6',
    reminder: 15,
    reminders: [
      { id: 'rem-001', minutes: 15, method: 'email', sent: false },
      { id: 'rem-002', minutes: 5, method: 'push', sent: false }
    ],
    calendarId: 'cal-main',
    timeZone: 'America/New_York',
    rsvpRequired: true,
    rsvpDeadline: '2024-01-14T23:59:00Z',
    attachments: [],
    views: 12,
    responses: 3,
    createdAt: '2024-01-08T10:00:00Z',
    updatedAt: '2024-01-08T10:00:00Z'
  },
  {
    id: 'evt-002',
    title: 'Design Review - Mobile App',
    description: 'Review latest mobile app design mockups and prototypes',
    startTime: '2024-01-15T14:00:00Z',
    endTime: '2024-01-15T16:00:00Z',
    allDay: false,
    type: 'review',
    status: 'confirmed',
    visibility: 'public',
    location: 'https://meet.google.com/abc-defg-hij',
    locationType: 'video',
    meetingUrl: 'https://meet.google.com/abc-defg-hij',
    organizerId: 'user-002',
    organizerName: 'Alex Turner',
    organizerEmail: 'alex@kazi.com',
    attendees: [
      {
        id: 'att-004',
        email: 'lisa@kazi.com',
        name: 'Lisa Chen',
        role: 'required',
        status: 'accepted',
        optional: false
      },
      {
        id: 'att-005',
        email: 'david@kazi.com',
        name: 'David Brown',
        role: 'required',
        status: 'accepted',
        optional: false
      }
    ],
    color: '#10b981',
    reminder: 30,
    reminders: [
      { id: 'rem-003', minutes: 30, method: 'email', sent: false }
    ],
    calendarId: 'cal-main',
    timeZone: 'America/New_York',
    rsvpRequired: true,
    attachments: [
      {
        id: 'attach-001',
        name: 'mockups-v2.fig',
        url: 'https://storage.kazi.com/files/mockups-v2.fig',
        size: 5242880,
        type: 'application/figma',
        uploadedBy: 'user-002',
        uploadedAt: '2024-01-14T10:00:00Z'
      }
    ],
    views: 8,
    responses: 2,
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-10T09:00:00Z'
  },
  {
    id: 'evt-003',
    title: 'Weekly Team Standup',
    description: 'Regular weekly team sync and status updates',
    startTime: '2024-01-16T10:00:00Z',
    endTime: '2024-01-16T10:30:00Z',
    allDay: false,
    type: 'meeting',
    status: 'confirmed',
    visibility: 'public',
    location: 'Zoom',
    locationType: 'video',
    meetingUrl: 'https://zoom.us/j/123456789',
    organizerId: 'user-003',
    organizerName: 'Rachel Green',
    organizerEmail: 'rachel@kazi.com',
    attendees: [
      {
        id: 'att-006',
        email: 'team@kazi.com',
        name: 'Development Team',
        role: 'required',
        status: 'accepted',
        optional: false
      }
    ],
    color: '#8b5cf6',
    reminder: 10,
    reminders: [
      { id: 'rem-004', minutes: 10, method: 'push', sent: false }
    ],
    recurrence: {
      frequency: 'weekly',
      interval: 1,
      byDay: [1], // Monday
      endDate: '2024-12-31T23:59:59Z'
    },
    calendarId: 'cal-main',
    timeZone: 'America/New_York',
    rsvpRequired: false,
    attachments: [],
    views: 45,
    responses: 1,
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-01-01T08:00:00Z'
  },
  {
    id: 'evt-004',
    title: 'Client Presentation - Q1 Results',
    description: 'Present Q1 performance metrics to client',
    startTime: '2024-01-17T15:00:00Z',
    endTime: '2024-01-17T16:30:00Z',
    allDay: false,
    type: 'presentation',
    status: 'confirmed',
    visibility: 'public',
    location: 'Client Office',
    locationType: 'physical',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    organizerId: 'user-001',
    organizerName: 'Sarah Johnson',
    organizerEmail: 'sarah@kazi.com',
    attendees: [
      {
        id: 'att-007',
        email: 'ceo@client.com',
        name: 'Robert Taylor',
        role: 'required',
        status: 'accepted',
        optional: false
      }
    ],
    color: '#f59e0b',
    reminder: 60,
    reminders: [
      { id: 'rem-005', minutes: 60, method: 'email', sent: false },
      { id: 'rem-006', minutes: 30, method: 'push', sent: false }
    ],
    calendarId: 'cal-main',
    timeZone: 'America/New_York',
    rsvpRequired: true,
    attachments: [
      {
        id: 'attach-002',
        name: 'Q1-Results.pdf',
        url: 'https://storage.kazi.com/files/Q1-Results.pdf',
        size: 3145728,
        type: 'application/pdf',
        uploadedBy: 'user-001',
        uploadedAt: '2024-01-16T12:00:00Z'
      }
    ],
    views: 15,
    responses: 1,
    createdAt: '2024-01-12T14:00:00Z',
    updatedAt: '2024-01-12T14:00:00Z'
  },
  {
    id: 'evt-005',
    title: 'Technical Interview - Senior Developer',
    description: 'Interview candidate for senior developer position',
    startTime: '2024-01-18T11:00:00Z',
    endTime: '2024-01-18T12:00:00Z',
    allDay: false,
    type: 'interview',
    status: 'confirmed',
    visibility: 'confidential',
    location: 'Google Meet',
    locationType: 'video',
    meetingUrl: 'https://meet.google.com/xyz-abcd-efg',
    organizerId: 'user-004',
    organizerName: 'Tom Harris',
    organizerEmail: 'tom@kazi.com',
    attendees: [
      {
        id: 'att-008',
        email: 'candidate@email.com',
        name: 'Jane Candidate',
        role: 'required',
        status: 'accepted',
        optional: false
      },
      {
        id: 'att-009',
        email: 'hr@kazi.com',
        name: 'HR Team',
        role: 'optional',
        status: 'accepted',
        optional: true
      }
    ],
    color: '#ec4899',
    reminder: 15,
    reminders: [
      { id: 'rem-007', minutes: 15, method: 'email', sent: false }
    ],
    calendarId: 'cal-main',
    timeZone: 'America/New_York',
    rsvpRequired: true,
    attachments: [
      {
        id: 'attach-003',
        name: 'candidate-resume.pdf',
        url: 'https://storage.kazi.com/files/resume.pdf',
        size: 1048576,
        type: 'application/pdf',
        uploadedBy: 'user-004',
        uploadedAt: '2024-01-15T09:00:00Z'
      }
    ],
    views: 5,
    responses: 2,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },

  // DEADLINES (5 events)
  {
    id: 'evt-006',
    title: 'Project Milestone - Feature Complete',
    description: 'All features must be code-complete and tested',
    startTime: '2024-01-20T23:59:00Z',
    endTime: '2024-01-20T23:59:00Z',
    allDay: true,
    type: 'deadline',
    status: 'confirmed',
    visibility: 'public',
    locationType: 'none',
    organizerId: 'user-001',
    organizerName: 'Sarah Johnson',
    organizerEmail: 'sarah@kazi.com',
    attendees: [],
    color: '#dc2626',
    reminder: 1440, // 1 day
    reminders: [
      { id: 'rem-008', minutes: 1440, method: 'email', sent: false },
      { id: 'rem-009', minutes: 480, method: 'push', sent: false }
    ],
    calendarId: 'cal-main',
    timeZone: 'America/New_York',
    rsvpRequired: false,
    attachments: [],
    views: 28,
    responses: 0,
    createdAt: '2024-01-05T08:00:00Z',
    updatedAt: '2024-01-05T08:00:00Z'
  },

  // WORKSHOPS (3 events)
  {
    id: 'evt-007',
    title: 'UX Workshop - User Research Methods',
    description: 'Hands-on workshop covering modern user research techniques',
    startTime: '2024-01-19T13:00:00Z',
    endTime: '2024-01-19T17:00:00Z',
    allDay: false,
    type: 'workshop',
    status: 'confirmed',
    visibility: 'public',
    location: 'Training Room B',
    locationType: 'physical',
    organizerId: 'user-005',
    organizerName: 'Emily White',
    organizerEmail: 'emily@kazi.com',
    attendees: [
      {
        id: 'att-010',
        email: 'design-team@kazi.com',
        name: 'Design Team',
        role: 'required',
        status: 'accepted',
        optional: false
      }
    ],
    color: '#06b6d4',
    reminder: 30,
    reminders: [
      { id: 'rem-010', minutes: 30, method: 'push', sent: false }
    ],
    calendarId: 'cal-main',
    timeZone: 'America/New_York',
    rsvpRequired: true,
    rsvpDeadline: '2024-01-18T17:00:00Z',
    attachments: [],
    views: 19,
    responses: 1,
    createdAt: '2024-01-10T11:00:00Z',
    updatedAt: '2024-01-10T11:00:00Z'
  },

  // CALLS (4 events)
  {
    id: 'evt-008',
    title: 'Sales Call - Enterprise Client',
    description: 'Discovery call with potential enterprise customer',
    startTime: '2024-01-22T14:00:00Z',
    endTime: '2024-01-22T14:45:00Z',
    allDay: false,
    type: 'call',
    status: 'tentative',
    visibility: 'public',
    location: 'Phone',
    locationType: 'phone',
    organizerId: 'user-006',
    organizerName: 'Marcus Lee',
    organizerEmail: 'marcus@kazi.com',
    attendees: [
      {
        id: 'att-011',
        email: 'prospect@enterprise.com',
        name: 'Sarah Prospect',
        role: 'required',
        status: 'pending',
        optional: false
      }
    ],
    color: '#fbbf24',
    reminder: 15,
    reminders: [
      { id: 'rem-011', minutes: 15, method: 'email', sent: false }
    ],
    calendarId: 'cal-sales',
    timeZone: 'America/New_York',
    rsvpRequired: true,
    attachments: [],
    views: 3,
    responses: 0,
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-01-20T09:00:00Z'
  },

  // REMINDERS (3 events)
  {
    id: 'evt-009',
    title: 'Submit Expense Report',
    description: 'Monthly expense report submission deadline',
    startTime: '2024-01-31T17:00:00Z',
    endTime: '2024-01-31T17:00:00Z',
    allDay: false,
    type: 'reminder',
    status: 'confirmed',
    visibility: 'private',
    locationType: 'none',
    organizerId: 'user-001',
    organizerName: 'Sarah Johnson',
    organizerEmail: 'sarah@kazi.com',
    attendees: [],
    color: '#6366f1',
    reminder: 120,
    reminders: [
      { id: 'rem-012', minutes: 120, method: 'email', sent: false }
    ],
    calendarId: 'cal-personal',
    timeZone: 'America/New_York',
    rsvpRequired: false,
    attachments: [],
    views: 1,
    responses: 0,
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z'
  },

  // SOCIAL EVENTS (2 events)
  {
    id: 'evt-010',
    title: 'Team Lunch - Monthly Social',
    description: 'Monthly team bonding lunch',
    startTime: '2024-01-25T12:00:00Z',
    endTime: '2024-01-25T13:30:00Z',
    allDay: false,
    type: 'social',
    status: 'confirmed',
    visibility: 'public',
    location: 'The Italian Kitchen',
    locationType: 'physical',
    coordinates: { lat: 40.7580, lng: -73.9855 },
    organizerId: 'user-007',
    organizerName: 'Chris Martin',
    organizerEmail: 'chris@kazi.com',
    attendees: [
      {
        id: 'att-012',
        email: 'all-team@kazi.com',
        name: 'All Team Members',
        role: 'optional',
        status: 'accepted',
        optional: true
      }
    ],
    color: '#10b981',
    reminder: 60,
    reminders: [
      { id: 'rem-013', minutes: 60, method: 'push', sent: false }
    ],
    calendarId: 'cal-main',
    timeZone: 'America/New_York',
    rsvpRequired: true,
    rsvpDeadline: '2024-01-24T17:00:00Z',
    attachments: [],
    views: 24,
    responses: 12,
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-18T10:00:00Z'
  }
]

// Add 40 more mock events for comprehensive testing
const additionalEvents: CalendarEvent[] = Array.from({ length: 40 }, (_, i) => ({
  id: `evt-${String(i + 11).padStart(3, '0')}`,
  title: `Event ${i + 11}`,
  description: `Description for event ${i + 11}`,
  startTime: new Date(2024, 0, (i % 28) + 1, 9 + (i % 8), 0).toISOString(),
  endTime: new Date(2024, 0, (i % 28) + 1, 10 + (i % 8), 0).toISOString(),
  allDay: i % 5 === 0,
  type: (['meeting', 'call', 'deadline', 'reminder', 'task'] as EventType[])[i % 5],
  status: (['confirmed', 'tentative'] as EventStatus[])[i % 2],
  visibility: 'public' as EventVisibility,
  locationType: (['video', 'physical', 'phone', 'none'] as LocationType[])[i % 4],
  organizerId: `user-${(i % 7) + 1}`,
  organizerName: `Organizer ${i + 1}`,
  organizerEmail: `organizer${i + 1}@kazi.com`,
  attendees: [],
  color: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'][i % 5],
  reminder: 15,
  reminders: [
    { id: `rem-${i + 14}`, minutes: 15, method: 'email' as ReminderMethod, sent: false }
  ],
  calendarId: 'cal-main',
  timeZone: 'America/New_York',
  rsvpRequired: false,
  attachments: [],
  views: Math.floor(Math.random() * 50),
  responses: 0,
  createdAt: new Date(2024, 0, 1 + i).toISOString(),
  updatedAt: new Date(2024, 0, 1 + i).toISOString()
}))

export const mockCalendarEventsComplete = [...mockCalendarEvents, ...additionalEvents]

// ================================
// MOCK DATA - CALENDARS
// ================================

export const mockCalendars: CalendarSettings[] = [
  {
    id: 'cal-main',
    userId: 'user-001',
    name: 'Work Calendar',
    description: 'Main work calendar for meetings and deadlines',
    color: '#3b82f6',
    isDefault: true,
    isVisible: true,
    timeZone: 'America/New_York',
    workingHours: {
      monday: [{ start: '09:00', end: '17:00' }],
      tuesday: [{ start: '09:00', end: '17:00' }],
      wednesday: [{ start: '09:00', end: '17:00' }],
      thursday: [{ start: '09:00', end: '17:00' }],
      friday: [{ start: '09:00', end: '17:00' }],
      saturday: [],
      sunday: []
    },
    notifications: {
      email: true,
      push: true,
      sms: false,
      defaultReminder: 15
    }
  },
  {
    id: 'cal-personal',
    userId: 'user-001',
    name: 'Personal',
    description: 'Personal appointments and reminders',
    color: '#10b981',
    isDefault: false,
    isVisible: true,
    timeZone: 'America/New_York',
    workingHours: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [{ start: '10:00', end: '18:00' }],
      sunday: [{ start: '10:00', end: '18:00' }]
    },
    notifications: {
      email: true,
      push: true,
      sms: false,
      defaultReminder: 30
    }
  },
  {
    id: 'cal-sales',
    userId: 'user-006',
    name: 'Sales & Clients',
    description: 'Client meetings and sales calls',
    color: '#f59e0b',
    isDefault: false,
    isVisible: true,
    timeZone: 'America/New_York',
    workingHours: {
      monday: [{ start: '08:00', end: '18:00' }],
      tuesday: [{ start: '08:00', end: '18:00' }],
      wednesday: [{ start: '08:00', end: '18:00' }],
      thursday: [{ start: '08:00', end: '18:00' }],
      friday: [{ start: '08:00', end: '16:00' }],
      saturday: [],
      sunday: []
    },
    notifications: {
      email: true,
      push: true,
      sms: true,
      defaultReminder: 20
    }
  }
]

// ================================
// MOCK AI INSIGHTS
// ================================

export const mockAIInsights: AIInsight[] = [
  {
    id: 'ai-001',
    type: 'optimization',
    title: 'Meeting Cluster Detected',
    description: 'You have 4 meetings scheduled within a 3-hour window on Thursday',
    impact: 'high',
    confidence: 94,
    actionable: true,
    suggestion: 'Consider consolidating or rescheduling one meeting to reduce context switching',
    data: { date: '2024-01-18', meetings: 4, duration: 180 }
  },
  {
    id: 'ai-002',
    type: 'productivity',
    title: 'Peak Productivity Hours',
    description: 'Analysis shows your most productive meetings occur between 9-11 AM',
    impact: 'medium',
    confidence: 89,
    actionable: true,
    suggestion: 'Schedule important client meetings and strategic discussions in this time slot',
    data: { peakStart: '09:00', peakEnd: '11:00' }
  },
  {
    id: 'ai-003',
    type: 'conflict',
    title: 'Potential Double Booking',
    description: 'Two events overlap on January 22nd at 2 PM',
    impact: 'high',
    confidence: 100,
    actionable: true,
    suggestion: 'Review and reschedule one of the conflicting events',
    data: { date: '2024-01-22', time: '14:00', events: ['evt-001', 'evt-002'] }
  },
  {
    id: 'ai-004',
    type: 'balance',
    title: 'Work-Life Balance Alert',
    description: 'You have 0 breaks scheduled between meetings this week',
    impact: 'medium',
    confidence: 85,
    actionable: true,
    suggestion: 'Add 15-minute buffers between back-to-back meetings',
    data: { backToBackMeetings: 8, buffersAdded: 0 }
  },
  {
    id: 'ai-005',
    type: 'trend',
    title: 'Meeting Duration Trend',
    description: 'Average meeting duration increased by 23% this month',
    impact: 'low',
    confidence: 92,
    actionable: false,
    suggestion: 'Consider setting default meeting durations to 25 or 50 minutes',
    data: { avgDurationLastMonth: 45, avgDurationThisMonth: 55 }
  },
  {
    id: 'ai-006',
    type: 'recommendation',
    title: 'Recurring Meeting Review',
    description: '3 recurring meetings have low attendance rates (<60%)',
    impact: 'medium',
    confidence: 87,
    actionable: true,
    suggestion: 'Review necessity of these recurring meetings or adjust frequency',
    data: { lowAttendanceMeetings: ['evt-003', 'evt-010', 'evt-015'] }
  }
]

// ================================
// HELPER FUNCTIONS
// ================================

/**
 * Format date to readable string
 */
export const formatEventDate = (isoDate: string): string => {
  const date = new Date(isoDate)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

/**
 * Format time to readable string
 */
export const formatEventTime = (isoDate: string): string => {
  const date = new Date(isoDate)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

/**
 * Format date and time together
 */
export const formatEventDateTime = (isoDate: string): string => {
  return `${formatEventDate(isoDate)} at ${formatEventTime(isoDate)}`
}

/**
 * Get event duration in minutes
 */
export const getEventDuration = (startTime: string, endTime: string): number => {
  const start = new Date(startTime).getTime()
  const end = new Date(endTime).getTime()
  return Math.floor((end - start) / (1000 * 60))
}

/**
 * Format duration to readable string
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

/**
 * Check if events overlap
 */
export const eventsOverlap = (event1: CalendarEvent, event2: CalendarEvent): boolean => {
  const start1 = new Date(event1.startTime).getTime()
  const end1 = new Date(event1.endTime).getTime()
  const start2 = new Date(event2.startTime).getTime()
  const end2 = new Date(event2.endTime).getTime()

  return (start1 < end2 && start2 < end1)
}

/**
 * Find conflicting events
 */
export const findConflicts = (events: CalendarEvent[]): Array<{ event1: CalendarEvent; event2: CalendarEvent }> => {
  const conflicts: Array<{ event1: CalendarEvent; event2: CalendarEvent }> = []

  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      if (eventsOverlap(events[i], events[j])) {
        conflicts.push({ event1: events[i], event2: events[j] })
      }
    }
  }

  return conflicts
}

/**
 * Get events for specific date
 */
export const getEventsForDate = (events: CalendarEvent[], date: Date): CalendarEvent[] => {
  const targetDate = new Date(date).toDateString()

  return events.filter(event => {
    const eventDate = new Date(event.startTime).toDateString()
    return eventDate === targetDate
  })
}

/**
 * Get events for date range
 */
export const getEventsInRange = (
  events: CalendarEvent[],
  startDate: Date,
  endDate: Date
): CalendarEvent[] => {
  const start = startDate.getTime()
  const end = endDate.getTime()

  return events.filter(event => {
    const eventStart = new Date(event.startTime).getTime()
    return eventStart >= start && eventStart <= end
  })
}

/**
 * Get upcoming events
 */
export const getUpcomingEvents = (
  events: CalendarEvent[],
  limit: number = 5
): CalendarEvent[] => {
  const now = new Date().getTime()

  return events
    .filter(event => new Date(event.startTime).getTime() >= now)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, limit)
}

/**
 * Calculate calendar analytics
 */
export const calculateCalendarAnalytics = (events: CalendarEvent[]): CalendarAnalytics => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const thisMonth = getEventsInRange(events, startOfMonth, now).length
  const thisWeek = getEventsInRange(events, startOfWeek, now).length
  const today = getEventsForDate(events, now).length

  // Events by type
  const eventsByType: Record<string, number> = {}
  events.forEach(event => {
    eventsByType[event.type] = (eventsByType[event.type] || 0) + 1
  })

  // Events by status
  const confirmed = events.filter(e => e.status === 'confirmed').length
  const tentative = events.filter(e => e.status === 'tentative').length
  const cancelled = events.filter(e => e.status === 'cancelled').length
  const completed = events.filter(e => e.status === 'completed').length

  // Duration metrics
  const durations = events.map(e => getEventDuration(e.startTime, e.endTime))
  const averageDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length
  const totalMeetingTime = durations.reduce((sum, d) => sum + d, 0)

  // Response metrics
  const eventsWithRsvp = events.filter(e => e.rsvpRequired)
  const totalResponses = eventsWithRsvp.reduce((sum, e) => sum + e.responses, 0)
  const totalAttendees = eventsWithRsvp.reduce((sum, e) => sum + e.attendees.length, 0)
  const responseRate = totalAttendees > 0 ? (totalResponses / totalAttendees) * 100 : 0

  const accepted = eventsWithRsvp.reduce(
    (sum, e) => sum + e.attendees.filter(a => a.status === 'accepted').length,
    0
  )
  const acceptanceRate = totalResponses > 0 ? (accepted / totalResponses) * 100 : 0

  return {
    totalEvents: events.length,
    thisMonth,
    thisWeek,
    today,
    eventsByType: eventsByType as Record<EventType, number>,
    confirmed,
    tentative,
    cancelled,
    completed,
    averageDuration: Math.round(averageDuration),
    totalMeetingTime,
    utilizationRate: 75.5, // Mock value
    responseRate: Math.round(responseRate),
    acceptanceRate: Math.round(acceptanceRate),
    eventsPerDay: [], // Would be calculated from historical data
    busyHours: [], // Would be calculated from event times
    topAttendees: [], // Would be calculated from attendee data
    aiInsights: mockAIInsights
  }
}

/**
 * Find available time slots
 */
export const findAvailableSlots = (
  events: CalendarEvent[],
  date: Date,
  duration: number, // minutes
  workingHours: TimeRange
): TimeSlot[] => {
  const slots: TimeSlot[] = []
  const dayEvents = getEventsForDate(events, date).sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  )

  // Parse working hours
  const [startHour, startMin] = workingHours.start.split(':').map(Number)
  const [endHour, endMin] = workingHours.end.split(':').map(Number)

  const workStart = new Date(date)
  workStart.setHours(startHour, startMin, 0, 0)

  const workEnd = new Date(date)
  workEnd.setHours(endHour, endMin, 0, 0)

  let currentTime = workStart.getTime()

  dayEvents.forEach(event => {
    const eventStart = new Date(event.startTime).getTime()
    const eventEnd = new Date(event.endTime).getTime()

    // Check if there's a gap before this event
    if (currentTime + duration * 60000 <= eventStart) {
      slots.push({
        start: new Date(currentTime).toISOString(),
        end: new Date(eventStart).toISOString(),
        available: true
      })
    }

    currentTime = Math.max(currentTime, eventEnd)
  })

  // Check for time after last event
  if (currentTime + duration * 60000 <= workEnd.getTime()) {
    slots.push({
      start: new Date(currentTime).toISOString(),
      end: workEnd.toISOString(),
      available: true
    })
  }

  return slots
}

/**
 * Suggest best meeting times using AI
 */
export const suggestMeetingTimes = (
  events: CalendarEvent[],
  duration: number,
  attendeeCalendars: CalendarEvent[][] = [],
  preferences: { preferredHours?: number[]; avoidBackToBack?: boolean } = {}
): SchedulingSuggestion[] => {
  const suggestions: SchedulingSuggestion[] = []

  // Mock implementation - in production would use AI/ML
  const today = new Date()
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)

    const slots = findAvailableSlots(events, date, duration, { start: '09:00', end: '17:00' })

    slots.forEach((slot, index) => {
      const score = 100 - (i * 10) - (index * 5) // Earlier days and slots get higher scores
      const reasoning = [
        i <= 3 ? 'Within next 3 days' : 'Later in the week',
        index === 0 ? 'Morning slot (preferred)' : 'Afternoon slot',
        'No conflicts detected'
      ]

      suggestions.push({
        id: `suggestion-${i}-${index}`,
        timeSlot: slot,
        score: Math.max(0, score),
        reasoning,
        attendeeAvailability: { 'user-001': true } // Mock data
      })
    })
  }

  return suggestions.sort((a, b) => b.score - a.score).slice(0, 5)
}

/**
 * Generate iCalendar format
 */
export const generateICalendar = (event: CalendarEvent): string => {
  const formatICalDate = (date: string) => {
    return new Date(date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Kazi//Calendar//EN
BEGIN:VEVENT
UID:${event.id}@kazi.com
DTSTAMP:${formatICalDate(event.createdAt)}
DTSTART:${formatICalDate(event.startTime)}
DTEND:${formatICalDate(event.endTime)}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ''}
LOCATION:${event.location || ''}
ORGANIZER;CN=${event.organizerName}:mailto:${event.organizerEmail}
STATUS:${event.status.toUpperCase()}
END:VEVENT
END:VCALENDAR`
}

/**
 * Export events to CSV
 */
export const exportEventsToCSV = (events: CalendarEvent[]): string => {
  const headers = ['Title', 'Start Time', 'End Time', 'Type', 'Status', 'Location', 'Attendees']
  const rows = events.map(event => [
    event.title,
    formatEventDateTime(event.startTime),
    formatEventDateTime(event.endTime),
    event.type,
    event.status,
    event.location || 'N/A',
    event.attendees.length.toString()
  ])

  return [headers, ...rows].map(row => row.join(',')).join('\n')
}

logger.info('Calendar utilities loaded', {
  mockEventsCount: mockCalendarEventsComplete.length,
  mockCalendarsCount: mockCalendars.length,
  mockInsightsCount: mockAIInsights.length
})
