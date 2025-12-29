// Communications Data - Messages, Emails, Calls, Meetings
// For messaging, email, calendar, and communication modules

export interface Message {
  id: string
  conversationId: string
  sender: {
    id: string
    name: string
    avatar: string
    initials: string
    type: 'user' | 'customer' | 'system'
  }
  content: string
  timestamp: string
  read: boolean
  attachments?: Attachment[]
  reactions?: Reaction[]
}

export interface Conversation {
  id: string
  type: 'direct' | 'group' | 'channel'
  name?: string
  participants: Participant[]
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  pinned: boolean
  muted: boolean
}

export interface Participant {
  id: string
  name: string
  avatar: string
  initials: string
  status: 'online' | 'away' | 'busy' | 'offline'
  lastSeen?: string
}

export interface Attachment {
  id: string
  name: string
  type: string
  size: number
  url: string
}

export interface Reaction {
  emoji: string
  users: string[]
}

export interface Email {
  id: string
  from: { name: string; email: string }
  to: { name: string; email: string }[]
  cc?: { name: string; email: string }[]
  subject: string
  preview: string
  body: string
  timestamp: string
  read: boolean
  starred: boolean
  labels: string[]
  attachments?: Attachment[]
  folder: 'inbox' | 'sent' | 'drafts' | 'trash' | 'archive'
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: string
  end: string
  allDay: boolean
  type: 'meeting' | 'call' | 'task' | 'reminder' | 'event'
  location?: string
  attendees: Attendee[]
  organizer: string
  status: 'confirmed' | 'tentative' | 'cancelled'
  recurring?: boolean
  videoLink?: string
  color: string
}

export interface Attendee {
  id: string
  name: string
  email: string
  avatar?: string
  status: 'accepted' | 'declined' | 'tentative' | 'pending'
}

// Conversations
export const CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-001',
    type: 'direct',
    participants: [
      { id: 'cust-001', name: 'Sarah Mitchell', avatar: '/avatars/sarah-mitchell.jpg', initials: 'SM', status: 'online' },
    ],
    lastMessage: 'Thanks for the update on the integration timeline!',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    unreadCount: 2,
    pinned: true,
    muted: false
  },
  {
    id: 'conv-002',
    type: 'group',
    name: 'Spotify Integration Team',
    participants: [
      { id: 'team-006', name: 'Emily Davis', avatar: '/avatars/emily-davis.jpg', initials: 'ED', status: 'online' },
      { id: 'team-010', name: 'Anna Martinez', avatar: '/avatars/anna-martinez.jpg', initials: 'AM', status: 'away' },
      { id: 'cust-001', name: 'Sarah Mitchell', avatar: '/avatars/sarah-mitchell.jpg', initials: 'SM', status: 'online' },
    ],
    lastMessage: 'The API documentation has been updated',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    unreadCount: 0,
    pinned: true,
    muted: false
  },
  {
    id: 'conv-003',
    type: 'channel',
    name: '#engineering',
    participants: [
      { id: 'team-002', name: 'Marcus Williams', avatar: '/avatars/marcus-williams.jpg', initials: 'MW', status: 'online' },
      { id: 'team-006', name: 'Emily Davis', avatar: '/avatars/emily-davis.jpg', initials: 'ED', status: 'online' },
      { id: 'team-011', name: 'David Thompson', avatar: '/avatars/david-thompson.jpg', initials: 'DT', status: 'busy' },
    ],
    lastMessage: 'Deploy completed successfully to staging',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    unreadCount: 5,
    pinned: false,
    muted: false
  },
  {
    id: 'conv-004',
    type: 'direct',
    participants: [
      { id: 'cust-002', name: 'James Rodriguez', avatar: '/avatars/james-rodriguez.jpg', initials: 'JR', status: 'away' },
    ],
    lastMessage: 'Looking forward to our call tomorrow',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    unreadCount: 0,
    pinned: false,
    muted: false
  },
  {
    id: 'conv-005',
    type: 'channel',
    name: '#general',
    participants: [
      { id: 'team-001', name: 'Alexandra Chen', avatar: '/avatars/alex-chen.jpg', initials: 'AC', status: 'online' },
    ],
    lastMessage: 'Great work everyone on hitting our Q4 targets!',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    unreadCount: 0,
    pinned: false,
    muted: false
  },
]

// Messages
export const MESSAGES: Message[] = [
  {
    id: 'msg-001',
    conversationId: 'conv-001',
    sender: { id: 'cust-001', name: 'Sarah Mitchell', avatar: '/avatars/sarah-mitchell.jpg', initials: 'SM', type: 'customer' },
    content: 'Thanks for the update on the integration timeline!',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    read: false
  },
  {
    id: 'msg-002',
    conversationId: 'conv-001',
    sender: { id: 'cust-001', name: 'Sarah Mitchell', avatar: '/avatars/sarah-mitchell.jpg', initials: 'SM', type: 'customer' },
    content: 'The team is excited to see the new features in action. Can we schedule a demo for next week?',
    timestamp: new Date(Date.now() - 1000 * 60 * 16).toISOString(),
    read: false
  },
  {
    id: 'msg-003',
    conversationId: 'conv-001',
    sender: { id: 'team-005', name: 'Michael Chen', avatar: '/avatars/michael-chen.jpg', initials: 'MC', type: 'user' },
    content: 'Absolutely! I\'ll send over some time slots. We have some exciting updates to share.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: true
  },
  {
    id: 'msg-004',
    conversationId: 'conv-002',
    sender: { id: 'team-006', name: 'Emily Davis', avatar: '/avatars/emily-davis.jpg', initials: 'ED', type: 'user' },
    content: 'The API documentation has been updated',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    read: true,
    attachments: [
      { id: 'att-001', name: 'api-docs-v2.pdf', type: 'application/pdf', size: 2450000, url: '/files/api-docs-v2.pdf' }
    ]
  },
  {
    id: 'msg-005',
    conversationId: 'conv-003',
    sender: { id: 'team-011', name: 'David Thompson', avatar: '/avatars/david-thompson.jpg', initials: 'DT', type: 'user' },
    content: 'Deploy completed successfully to staging',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    read: true,
    reactions: [
      { emoji: '🎉', users: ['team-002', 'team-006'] },
      { emoji: '👍', users: ['team-007'] }
    ]
  },
]

// Emails
export const EMAILS: Email[] = [
  {
    id: 'email-001',
    from: { name: 'Sarah Mitchell', email: 'sarah.mitchell@spotify.com' },
    to: [{ name: 'Michael Chen', email: 'michael.c@freeflow.io' }],
    subject: 'Re: Enterprise Integration - Next Steps',
    preview: 'Thank you for the detailed proposal. The executive team has reviewed it and we\'re ready to move forward...',
    body: 'Thank you for the detailed proposal. The executive team has reviewed it and we\'re ready to move forward with the Phase 2 implementation. Can we schedule a kickoff call for next week?\n\nBest regards,\nSarah',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false,
    starred: true,
    labels: ['important', 'enterprise'],
    folder: 'inbox'
  },
  {
    id: 'email-002',
    from: { name: 'James Rodriguez', email: 'james.r@nike.com' },
    to: [{ name: 'Jennifer Walsh', email: 'jennifer@freeflow.io' }],
    subject: 'Global Rollout Timeline',
    preview: 'Hi Jennifer, I wanted to follow up on our conversation about the timeline for the global rollout...',
    body: 'Hi Jennifer,\n\nI wanted to follow up on our conversation about the timeline for the global rollout. Our APAC team is eager to get started and we\'d like to begin training sessions in February.\n\nCan you send over the updated project plan?\n\nThanks,\nJames',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    read: true,
    starred: false,
    labels: ['enterprise'],
    folder: 'inbox'
  },
  {
    id: 'email-003',
    from: { name: 'HubSpot', email: 'noreply@hubspot.com' },
    to: [{ name: 'Sarah Johnson', email: 'sarah@freeflow.io' }],
    subject: 'Your Weekly Marketing Report',
    preview: 'Here\'s your weekly marketing performance summary...',
    body: 'Your campaigns generated 2,450 new leads this week, a 15% increase from last week.',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    read: true,
    starred: false,
    labels: ['marketing'],
    folder: 'inbox'
  },
  {
    id: 'email-004',
    from: { name: 'Michael Chen', email: 'michael.c@freeflow.io' },
    to: [{ name: 'Sarah Mitchell', email: 'sarah.mitchell@spotify.com' }],
    subject: 'Re: Enterprise Integration - Next Steps',
    preview: 'Great to hear! I\'ve attached some available times for the kickoff call...',
    body: 'Great to hear! I\'ve attached some available times for the kickoff call. Looking forward to getting started.\n\nBest,\nMichael',
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    read: true,
    starred: false,
    labels: ['enterprise'],
    folder: 'sent'
  },
]

// Calendar Events
export const CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'event-001',
    title: 'Daily Standup',
    description: 'Daily engineering standup meeting',
    start: new Date().setHours(9, 0, 0, 0).toString(),
    end: new Date().setHours(9, 15, 0, 0).toString(),
    allDay: false,
    type: 'meeting',
    location: 'Zoom',
    attendees: [
      { id: 'team-002', name: 'Marcus Williams', email: 'marcus@freeflow.io', status: 'accepted' },
      { id: 'team-006', name: 'Emily Davis', email: 'emily@freeflow.io', status: 'accepted' },
      { id: 'team-011', name: 'David Thompson', email: 'david.t@freeflow.io', status: 'accepted' },
    ],
    organizer: 'Marcus Williams',
    status: 'confirmed',
    recurring: true,
    videoLink: 'https://zoom.us/j/123456789',
    color: 'blue'
  },
  {
    id: 'event-002',
    title: 'Spotify Integration Review',
    description: 'Weekly sync with Spotify integration team',
    start: new Date().setHours(10, 0, 0, 0).toString(),
    end: new Date().setHours(11, 0, 0, 0).toString(),
    allDay: false,
    type: 'meeting',
    location: 'Google Meet',
    attendees: [
      { id: 'team-005', name: 'Michael Chen', email: 'michael.c@freeflow.io', status: 'accepted' },
      { id: 'team-006', name: 'Emily Davis', email: 'emily@freeflow.io', status: 'accepted' },
      { id: 'cust-001', name: 'Sarah Mitchell', email: 'sarah.mitchell@spotify.com', status: 'accepted' },
    ],
    organizer: 'Michael Chen',
    status: 'confirmed',
    videoLink: 'https://meet.google.com/abc-defg-hij',
    color: 'green'
  },
  {
    id: 'event-003',
    title: 'Nike Onboarding Call',
    description: 'Phase 2 kickoff with Nike global team',
    start: new Date().setHours(14, 0, 0, 0).toString(),
    end: new Date().setHours(14, 45, 0, 0).toString(),
    allDay: false,
    type: 'call',
    attendees: [
      { id: 'team-003', name: 'Jennifer Walsh', email: 'jennifer@freeflow.io', status: 'accepted' },
      { id: 'team-010', name: 'Anna Martinez', email: 'anna@freeflow.io', status: 'accepted' },
      { id: 'cust-002', name: 'James Rodriguez', email: 'james.r@nike.com', status: 'accepted' },
    ],
    organizer: 'Jennifer Walsh',
    status: 'confirmed',
    videoLink: 'https://zoom.us/j/987654321',
    color: 'purple'
  },
  {
    id: 'event-004',
    title: 'Sprint Planning',
    description: 'Sprint 25 planning session',
    start: new Date().setHours(11, 30, 0, 0).toString(),
    end: new Date().setHours(13, 0, 0, 0).toString(),
    allDay: false,
    type: 'meeting',
    location: 'Conference Room A',
    attendees: [
      { id: 'team-002', name: 'Marcus Williams', email: 'marcus@freeflow.io', status: 'accepted' },
      { id: 'team-006', name: 'Emily Davis', email: 'emily@freeflow.io', status: 'accepted' },
      { id: 'team-007', name: 'Robert Kim', email: 'robert@freeflow.io', status: 'accepted' },
      { id: 'team-008', name: 'Lisa Park', email: 'lisa@freeflow.io', status: 'tentative' },
    ],
    organizer: 'Robert Kim',
    status: 'confirmed',
    color: 'orange'
  },
  {
    id: 'event-005',
    title: 'Product Review',
    description: 'Weekly product review and demo',
    start: new Date().setHours(15, 30, 0, 0).toString(),
    end: new Date().setHours(16, 30, 0, 0).toString(),
    allDay: false,
    type: 'meeting',
    location: 'Zoom',
    attendees: [
      { id: 'team-001', name: 'Alexandra Chen', email: 'alex@freeflow.io', status: 'accepted' },
      { id: 'team-007', name: 'Robert Kim', email: 'robert@freeflow.io', status: 'accepted' },
      { id: 'team-008', name: 'Lisa Park', email: 'lisa@freeflow.io', status: 'accepted' },
    ],
    organizer: 'Alexandra Chen',
    status: 'confirmed',
    recurring: true,
    videoLink: 'https://zoom.us/j/111222333',
    color: 'indigo'
  },
]

// Communication Stats
export const COMMUNICATION_STATS = {
  unreadMessages: 7,
  unreadEmails: 12,
  pendingResponses: 5,
  meetingsToday: 6,
  callsScheduled: 3,
  avgResponseTime: '2.5 hours',
}
