// ============================================================================
// COLLABORATION MEETINGS UTILITIES - PRODUCTION
// ============================================================================
// Comprehensive meeting management with video conferencing, screen sharing,
// recording, participant controls, and collaboration features
// ============================================================================

import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('CollaborationMeetingsUtils')

// ============================================================================
// TYPESCRIPT TYPES & INTERFACES
// ============================================================================

export type MeetingType = 'video' | 'voice' | 'screen-share'
export type MeetingStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
export type ViewMode = 'grid' | 'speaker' | 'sidebar' | 'fullscreen'
export type ParticipantRole = 'host' | 'co-host' | 'participant' | 'guest'
export type MeetingRecurrence = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly'
export type RecordingQuality = 'low' | 'medium' | 'high' | 'hd'

export interface Participant {
  id: string
  userId?: string
  name: string
  email: string
  avatar?: string
  role: ParticipantRole
  isHost: boolean
  isMuted: boolean
  isVideoOff: boolean
  isHandRaised: boolean
  isScreenSharing: boolean
  joinedAt?: string
  leftAt?: string
  totalDuration?: number // in seconds
  connectionQuality?: 'excellent' | 'good' | 'fair' | 'poor'
}

export interface Meeting {
  id: string
  userId: string
  title: string
  description: string
  scheduledDate: string
  scheduledTime: string
  duration: number // in minutes
  type: MeetingType
  status: MeetingStatus
  hostId: string
  hostName: string
  participants: Participant[]
  maxParticipants: number
  meetingLink?: string
  passcode?: string
  recordingUrl?: string
  isRecording: boolean
  recordingStartedAt?: string
  recordingDuration?: number
  recurrence: MeetingRecurrence
  timezone: string
  reminders: number[] // minutes before meeting
  settings: MeetingSettings
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface MeetingSettings {
  allowGuestAccess: boolean
  requirePasscode: boolean
  enableWaitingRoom: boolean
  muteOnEntry: boolean
  enableChat: boolean
  enableScreenShare: boolean
  enableRecording: boolean
  autoRecord: boolean
  recordingQuality: RecordingQuality
  maxDuration?: number
  enableBreakoutRooms?: boolean
  enablePolls?: boolean
  enableWhiteboard?: boolean
  enableReactions?: boolean
}

export interface CallState {
  isInCall: boolean
  isCameraOn: boolean
  isMicOn: boolean
  isScreenSharing: boolean
  isRecording: boolean
  viewMode: ViewMode
  volume: number
  activeSpeakerId?: string
  backgroundBlur: boolean
  noiseSuppression: boolean
}

export interface MeetingRecording {
  id: string
  meetingId: string
  userId: string
  title: string
  startedAt: string
  endedAt: string
  duration: number
  fileSize: number // in MB
  quality: RecordingQuality
  url: string
  thumbnailUrl?: string
  viewCount: number
  downloadCount: number
  transcriptUrl?: string
  highlightsUrl?: string
  createdAt: string
}

export interface MeetingAnalytics {
  meetingId: string
  totalParticipants: number
  peakParticipants: number
  averageDuration: number
  totalDuration: number
  joinRate: number // percentage
  dropoffRate: number
  averageConnectionQuality: string
  chatMessages: number
  handRaises: number
  screenShares: number
  recordingViews: number
}

export interface MeetingsStats {
  totalMeetings: number
  upcomingMeetings: number
  ongoingMeetings: number
  completedMeetings: number
  cancelledMeetings: number
  totalHours: number
  totalParticipants: number
  averageParticipants: number
  totalRecordings: number
  byType: Record<MeetingType, number>
  byStatus: Record<MeetingStatus, number>
  lastUpdated: string
}

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

const meetingTitles = [
  'Daily Standup', 'Sprint Planning', 'Product Review', 'Design Critique',
  'Client Presentation', 'Team Sync', 'Quarterly Review', 'Budget Planning',
  'Strategy Session', 'Training Workshop', 'Brainstorming Session', 'All Hands',
  'Performance Review', '1:1 Check-in', 'Project Kickoff', 'Retrospective',
  'Tech Talk', 'Sales Demo', 'Investor Meeting', 'Board Meeting',
  'Marketing Review', 'Customer Feedback', 'Feature Discussion', 'Bug Triage',
  'Architecture Review', 'Security Briefing', 'Compliance Training', 'Onboarding Session',
  'Town Hall', 'Department Meeting', 'Interview Panel', 'Leadership Summit'
]

const participants: Omit<Participant, 'id' | 'joinedAt'>[] = [
  { name: 'John Doe', email: 'john@example.com', role: 'host', isHost: true, isMuted: false, isVideoOff: false, isHandRaised: false, isScreenSharing: false, connectionQuality: 'excellent' },
  { name: 'Sarah Johnson', email: 'sarah@example.com', role: 'co-host', isHost: false, isMuted: false, isVideoOff: false, isHandRaised: false, isScreenSharing: false, connectionQuality: 'good' },
  { name: 'Mike Chen', email: 'mike@example.com', role: 'participant', isHost: false, isMuted: true, isVideoOff: false, isHandRaised: false, isScreenSharing: false, connectionQuality: 'excellent' },
  { name: 'Emily Davis', email: 'emily@example.com', role: 'participant', isHost: false, isMuted: false, isVideoOff: true, isHandRaised: false, isScreenSharing: false, connectionQuality: 'fair' },
  { name: 'David Wilson', email: 'david@example.com', role: 'participant', isHost: false, isMuted: false, isVideoOff: false, isHandRaised: true, isScreenSharing: false, connectionQuality: 'good' },
  { name: 'Lisa Anderson', email: 'lisa@example.com', role: 'participant', isHost: false, isMuted: true, isVideoOff: false, isHandRaised: false, isScreenSharing: false, connectionQuality: 'excellent' },
  { name: 'Tom Brown', email: 'tom@example.com', role: 'participant', isHost: false, isMuted: false, isVideoOff: false, isHandRaised: false, isScreenSharing: true, connectionQuality: 'good' },
  { name: 'Anna Martinez', email: 'anna@example.com', role: 'guest', isHost: false, isMuted: true, isVideoOff: true, isHandRaised: false, isScreenSharing: false, connectionQuality: 'poor' }
]

const types: MeetingType[] = ['video', 'voice', 'screen-share']
const statuses: MeetingStatus[] = ['scheduled', 'ongoing', 'completed', 'cancelled']

export function generateMockMeetings(count: number = 30, userId: string = 'user-1'): Meeting[] {
  logger.info('Generating mock meetings', { count, userId })

  const meetings: Meeting[] = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    const type = types[i % types.length]
    const isUpcoming = i < count * 0.4
    const isOngoing = !isUpcoming && i < count * 0.5
    const isCancelled = !isUpcoming && !isOngoing && Math.random() > 0.9

    const status: MeetingStatus = isCancelled
      ? 'cancelled'
      : (isOngoing ? 'ongoing' : (isUpcoming ? 'scheduled' : 'completed'))

    const scheduledDate = new Date(
      now.getTime() +
      (isUpcoming ? Math.random() * 30 * 24 * 60 * 60 * 1000 : -Math.random() * 60 * 24 * 60 * 60 * 1000)
    )

    const duration = [15, 30, 45, 60, 90, 120][Math.floor(Math.random() * 6)]
    const participantCount = 2 + Math.floor(Math.random() * 7)
    const meetingParticipants = participants.slice(0, participantCount).map((p, idx) => ({
      ...p,
      id: `participant-${i}-${idx}`,
      userId: `user-${idx + 1}`,
      joinedAt: status === 'ongoing' || status === 'completed'
        ? new Date(scheduledDate.getTime() + Math.random() * 10 * 60 * 1000).toISOString()
        : undefined,
      leftAt: status === 'completed'
        ? new Date(scheduledDate.getTime() + duration * 60 * 1000).toISOString()
        : undefined,
      totalDuration: status === 'completed' ? duration * 60 : undefined
    }))

    const hasRecording = status === 'completed' && Math.random() > 0.4

    meetings.push({
      id: `meeting-${i + 1}`,
      userId,
      title: meetingTitles[i % meetingTitles.length],
      description: `${meetingTitles[i % meetingTitles.length]} with the team to discuss progress and next steps`,
      scheduledDate: scheduledDate.toISOString().split('T')[0],
      scheduledTime: `${String(9 + Math.floor(i / 2) % 8).padStart(2, '0')}:${['00', '30'][i % 2]}`,
      duration,
      type,
      status,
      hostId: 'user-1',
      hostName: participants[0].name,
      participants: meetingParticipants,
      maxParticipants: 25 * (Math.floor(i / 10) + 1),
      meetingLink: `https://meet.app.com/${Math.random().toString(36).substring(7)}`,
      passcode: Math.random() > 0.5 ? Math.floor(100000 + Math.random() * 900000).toString() : undefined,
      recordingUrl: hasRecording ? `https://recordings.app.com/${i + 1}.mp4` : undefined,
      isRecording: status === 'ongoing' && Math.random() > 0.7,
      recordingStartedAt: hasRecording ? scheduledDate.toISOString() : undefined,
      recordingDuration: hasRecording ? duration : undefined,
      recurrence: (['none', 'daily', 'weekly', 'monthly'] as MeetingRecurrence[])[Math.floor(Math.random() * 4)],
      timezone: 'UTC',
      reminders: [15, 30, 60],
      settings: {
        allowGuestAccess: Math.random() > 0.5,
        requirePasscode: Math.random() > 0.5,
        enableWaitingRoom: Math.random() > 0.6,
        muteOnEntry: Math.random() > 0.4,
        enableChat: Math.random() > 0.2,
        enableScreenShare: Math.random() > 0.3,
        enableRecording: Math.random() > 0.4,
        autoRecord: Math.random() > 0.8,
        recordingQuality: (['low', 'medium', 'high', 'hd'] as RecordingQuality[])[Math.floor(Math.random() * 4)],
        maxDuration: duration + 30,
        enableBreakoutRooms: Math.random() > 0.7,
        enablePolls: Math.random() > 0.6,
        enableWhiteboard: Math.random() > 0.5,
        enableReactions: Math.random() > 0.3
      },
      createdAt: new Date(scheduledDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    })
  }

  logger.info('Mock meetings generated successfully', {
    total: meetings.length,
    upcoming: meetings.filter(m => m.status === 'scheduled').length,
    ongoing: meetings.filter(m => m.status === 'ongoing').length,
    completed: meetings.filter(m => m.status === 'completed').length
  })

  return meetings
}

export function generateMockRecordings(count: number = 15, userId: string = 'user-1'): MeetingRecording[] {
  logger.info('Generating mock recordings', { count, userId })

  const recordings: MeetingRecording[] = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    const duration = [30, 45, 60, 90, 120][Math.floor(Math.random() * 5)]
    const quality: RecordingQuality = (['low', 'medium', 'high', 'hd'] as RecordingQuality[])[Math.floor(Math.random() * 4)]
    const qualityMultiplier = { low: 50, medium: 100, high: 200, hd: 400 }
    const fileSize = Math.floor((duration / 60) * qualityMultiplier[quality])

    recordings.push({
      id: `recording-${i + 1}`,
      meetingId: `meeting-${i + 1}`,
      userId,
      title: `${meetingTitles[i % meetingTitles.length]} Recording`,
      startedAt: new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      endedAt: new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000 + duration * 60 * 1000).toISOString(),
      duration,
      fileSize,
      quality,
      url: `https://recordings.app.com/${i + 1}.mp4`,
      thumbnailUrl: `https://recordings.app.com/thumbs/${i + 1}.jpg`,
      viewCount: Math.floor(Math.random() * 100),
      downloadCount: Math.floor(Math.random() * 50),
      transcriptUrl: Math.random() > 0.5 ? `https://recordings.app.com/${i + 1}-transcript.txt` : undefined,
      highlightsUrl: Math.random() > 0.7 ? `https://recordings.app.com/${i + 1}-highlights.json` : undefined,
      createdAt: new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  logger.info('Mock recordings generated successfully', { total: recordings.length })
  return recordings
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function searchMeetings(meetings: Meeting[], searchTerm: string): Meeting[] {
  if (!searchTerm.trim()) return meetings

  const term = searchTerm.toLowerCase()
  logger.debug('Searching meetings', { searchTerm: term, totalMeetings: meetings.length })

  const results = meetings.filter(meeting =>
    meeting.title.toLowerCase().includes(term) ||
    meeting.description.toLowerCase().includes(term) ||
    meeting.hostName.toLowerCase().includes(term) ||
    meeting.participants.some(p => p.name.toLowerCase().includes(term))
  )

  logger.debug('Search completed', { resultsCount: results.length })
  return results
}

export function filterByType(meetings: Meeting[], type: MeetingType | 'all'): Meeting[] {
  if (type === 'all') return meetings

  logger.debug('Filtering by type', { type })
  return meetings.filter(m => m.type === type)
}

export function filterByStatus(meetings: Meeting[], status: MeetingStatus | 'all'): Meeting[] {
  if (status === 'all') return meetings

  logger.debug('Filtering by status', { status })
  return meetings.filter(m => m.status === status)
}

export function sortMeetings(meetings: Meeting[], sortBy: 'date' | 'title' | 'duration' | 'participants'): Meeting[] {
  logger.debug('Sorting meetings', { sortBy, count: meetings.length })

  const sorted = [...meetings].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(a.scheduledDate + 'T' + a.scheduledTime).getTime() -
               new Date(b.scheduledDate + 'T' + b.scheduledTime).getTime()

      case 'title':
        return a.title.localeCompare(b.title)

      case 'duration':
        return b.duration - a.duration

      case 'participants':
        return b.participants.length - a.participants.length

      default:
        return 0
    }
  })

  return sorted
}

export function calculateMeetingsStats(meetings: Meeting[]): MeetingsStats {
  logger.debug('Calculating meetings statistics', { totalMeetings: meetings.length })

  const byType: Record<MeetingType, number> = {
    video: 0,
    voice: 0,
    'screen-share': 0
  }

  const byStatus: Record<MeetingStatus, number> = {
    scheduled: 0,
    ongoing: 0,
    completed: 0,
    cancelled: 0
  }

  let totalHours = 0
  let totalParticipants = 0

  meetings.forEach(meeting => {
    byType[meeting.type]++
    byStatus[meeting.status]++
    totalHours += meeting.duration / 60
    totalParticipants += meeting.participants.length
  })

  const stats: MeetingsStats = {
    totalMeetings: meetings.length,
    upcomingMeetings: byStatus.scheduled,
    ongoingMeetings: byStatus.ongoing,
    completedMeetings: byStatus.completed,
    cancelledMeetings: byStatus.cancelled,
    totalHours,
    totalParticipants,
    averageParticipants: meetings.length > 0 ? totalParticipants / meetings.length : 0,
    totalRecordings: meetings.filter(m => m.recordingUrl).length,
    byType,
    byStatus,
    lastUpdated: new Date().toISOString()
  }

  logger.info('Statistics calculated', {
    totalMeetings: stats.totalMeetings,
    upcoming: stats.upcomingMeetings,
    completed: stats.completedMeetings
  })

  return stats
}

export function exportMeetingData(meeting: Meeting, format: 'json' | 'csv' | 'ics'): Blob {
  logger.info('Exporting meeting data', { meetingId: meeting.id, format })

  if (format === 'json') {
    const data = JSON.stringify(meeting, null, 2)
    return new Blob([data], { type: 'application/json' })
  }

  if (format === 'csv') {
    let csv = 'Field,Value\n'
    csv += `Title,${meeting.title}\n`
    csv += `Date,${meeting.scheduledDate}\n`
    csv += `Time,${meeting.scheduledTime}\n`
    csv += `Duration,${meeting.duration} minutes\n`
    csv += `Type,${meeting.type}\n`
    csv += `Status,${meeting.status}\n`
    csv += `Host,${meeting.hostName}\n`
    csv += `Participants,${meeting.participants.length}\n`
    csv += `Meeting Link,${meeting.meetingLink || 'N/A'}\n`

    return new Blob([csv], { type: 'text/csv' })
  }

  // ICS format
  const startDate = new Date(`${meeting.scheduledDate}T${meeting.scheduledTime}`)
  const endDate = new Date(startDate.getTime() + meeting.duration * 60 * 1000)

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:${meeting.id}
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${meeting.title}
DESCRIPTION:${meeting.description}
LOCATION:${meeting.meetingLink || 'Online'}
END:VEVENT
END:VCALENDAR`

  return new Blob([ics], { type: 'text/calendar' })
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  logger as meetingsLogger
}
