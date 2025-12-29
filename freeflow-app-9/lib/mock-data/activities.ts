// Activity Feed Data - Real-time updates across the app
// These activities appear in activity feeds, notifications, and timelines

export interface Activity {
  id: string
  type: 'create' | 'update' | 'delete' | 'comment' | 'milestone' | 'mention' | 'share' | 'complete' | 'assign' | 'payment' | 'login' | 'alert'
  title: string
  description: string
  user: {
    id: string
    name: string
    avatar: string
    initials: string
  }
  target?: {
    type: 'project' | 'task' | 'customer' | 'invoice' | 'deal' | 'document' | 'user'
    id: string
    name: string
  }
  timestamp: string
  metadata: Record<string, unknown>
  read?: boolean
}

// Recent Activities (Real-time feed)
export const RECENT_ACTIVITIES: Activity[] = [
  {
    id: 'act-001',
    type: 'payment',
    title: 'Payment received',
    description: 'Nike paid invoice INV-2025-0128 for $75,000',
    user: { id: 'system', name: 'System', avatar: '', initials: 'SY' },
    target: { type: 'invoice', id: 'inv-001', name: 'INV-2025-0128' },
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 min ago
    metadata: { amount: 75000, currency: 'USD' },
    read: false
  },
  {
    id: 'act-002',
    type: 'milestone',
    title: 'Milestone achieved',
    description: 'AI Content Generator v2 reached 72% completion',
    user: { id: 'team-002', name: 'Marcus Williams', avatar: '/avatars/marcus-williams.jpg', initials: 'MW' },
    target: { type: 'project', id: 'proj-001', name: 'AI Content Generator v2' },
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 min ago
    metadata: { progress: 72, previousProgress: 68 },
    read: false
  },
  {
    id: 'act-003',
    type: 'complete',
    title: 'Task completed',
    description: 'Emily Davis completed "Set up Spotify sandbox environment"',
    user: { id: 'team-006', name: 'Emily Davis', avatar: '/avatars/emily-davis.jpg', initials: 'ED' },
    target: { type: 'task', id: 'task-003', name: 'Set up Spotify sandbox environment' },
    timestamp: new Date(Date.now() - 1000 * 60 * 32).toISOString(), // 32 min ago
    metadata: { projectId: 'proj-002' },
    read: true
  },
  {
    id: 'act-004',
    type: 'create',
    title: 'New deal created',
    description: 'Jennifer Walsh created deal "Enterprise Expansion - Full Suite" with Spotify',
    user: { id: 'team-003', name: 'Jennifer Walsh', avatar: '/avatars/jennifer-walsh.jpg', initials: 'JW' },
    target: { type: 'deal', id: 'deal-001', name: 'Enterprise Expansion - Full Suite' },
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 min ago
    metadata: { value: 180000, company: 'Spotify' },
    read: true
  },
  {
    id: 'act-005',
    type: 'comment',
    title: 'New comment',
    description: 'Lisa Park commented on "Design AI generation interface"',
    user: { id: 'team-008', name: 'Lisa Park', avatar: '/avatars/lisa-park.jpg', initials: 'LP' },
    target: { type: 'task', id: 'task-002', name: 'Design AI generation interface' },
    timestamp: new Date(Date.now() - 1000 * 60 * 58).toISOString(), // 58 min ago
    metadata: { commentPreview: 'Updated the color palette based on feedback...' },
    read: true
  },
  {
    id: 'act-006',
    type: 'update',
    title: 'Deal stage changed',
    description: 'Spotify deal moved to Negotiation stage',
    user: { id: 'team-003', name: 'Jennifer Walsh', avatar: '/avatars/jennifer-walsh.jpg', initials: 'JW' },
    target: { type: 'deal', id: 'deal-001', name: 'Enterprise Expansion - Full Suite' },
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
    metadata: { fromStage: 'proposal', toStage: 'negotiation' },
    read: true
  },
  {
    id: 'act-007',
    type: 'assign',
    title: 'Task assigned',
    description: 'Robert Kim assigned "Analytics Dashboard v3" to Emily Davis',
    user: { id: 'team-007', name: 'Robert Kim', avatar: '/avatars/robert-kim.jpg', initials: 'RK' },
    target: { type: 'task', id: 'task-new', name: 'Analytics Dashboard v3' },
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    metadata: { assigneeId: 'team-006' },
    read: true
  },
  {
    id: 'act-008',
    type: 'login',
    title: 'New login detected',
    description: 'Sarah Mitchell from Spotify logged in from New York',
    user: { id: 'cust-001', name: 'Sarah Mitchell', avatar: '', initials: 'SM' },
    timestamp: new Date(Date.now() - 1000 * 60 * 150).toISOString(), // 2.5 hours ago
    metadata: { location: 'New York, NY', device: 'MacBook Pro' },
    read: true
  },
  {
    id: 'act-009',
    type: 'share',
    title: 'Document shared',
    description: 'Anna Martinez shared "Nike Training Materials" with the team',
    user: { id: 'team-010', name: 'Anna Martinez', avatar: '/avatars/anna-martinez.jpg', initials: 'AM' },
    target: { type: 'document', id: 'doc-001', name: 'Nike Training Materials' },
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    metadata: { sharedWith: ['team-005', 'team-009'] },
    read: true
  },
  {
    id: 'act-010',
    type: 'alert',
    title: 'Customer at risk',
    description: 'Media Masters health score dropped below 50',
    user: { id: 'system', name: 'System', avatar: '', initials: 'SY' },
    target: { type: 'customer', id: 'comp-008', name: 'Media Masters' },
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
    metadata: { healthScore: 45, previousScore: 62 },
    read: false
  },
]

// Quick Actions - Context-aware shortcuts
export const QUICK_ACTIONS = {
  global: [
    { id: 'qa-001', label: 'New Project', icon: 'FolderPlus', shortcut: '⌘⇧P', category: 'create' },
    { id: 'qa-002', label: 'New Task', icon: 'CheckSquare', shortcut: '⌘⇧T', category: 'create' },
    { id: 'qa-003', label: 'New Invoice', icon: 'Receipt', shortcut: '⌘⇧I', category: 'create' },
    { id: 'qa-004', label: 'New Contact', icon: 'UserPlus', shortcut: '⌘⇧C', category: 'create' },
    { id: 'qa-005', label: 'Search', icon: 'Search', shortcut: '⌘K', category: 'navigate' },
    { id: 'qa-006', label: 'AI Assistant', icon: 'Sparkles', shortcut: '⌘J', category: 'ai' },
  ],
  crm: [
    { id: 'qa-crm-001', label: 'New Contact', icon: 'UserPlus', shortcut: '⌘N', category: 'create' },
    { id: 'qa-crm-002', label: 'New Deal', icon: 'Target', shortcut: '⌘D', category: 'create' },
    { id: 'qa-crm-003', label: 'Log Activity', icon: 'Activity', shortcut: '⌘L', category: 'action' },
    { id: 'qa-crm-004', label: 'Send Email', icon: 'Mail', shortcut: '⌘E', category: 'action' },
  ],
  financial: [
    { id: 'qa-fin-001', label: 'New Invoice', icon: 'Receipt', shortcut: '⌘I', category: 'create' },
    { id: 'qa-fin-002', label: 'Record Payment', icon: 'DollarSign', shortcut: '⌘P', category: 'action' },
    { id: 'qa-fin-003', label: 'Export Report', icon: 'Download', shortcut: '⌘E', category: 'action' },
    { id: 'qa-fin-004', label: 'Reconcile', icon: 'CheckCircle', shortcut: '⌘R', category: 'action' },
  ],
  projects: [
    { id: 'qa-proj-001', label: 'New Project', icon: 'FolderPlus', shortcut: '⌘N', category: 'create' },
    { id: 'qa-proj-002', label: 'New Task', icon: 'CheckSquare', shortcut: '⌘T', category: 'create' },
    { id: 'qa-proj-003', label: 'Start Sprint', icon: 'Play', shortcut: '⌘S', category: 'action' },
    { id: 'qa-proj-004', label: 'View Board', icon: 'Kanban', shortcut: '⌘B', category: 'navigate' },
  ],
}

// Notifications
export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error' | 'mention' | 'reminder'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
  actionLabel?: string
}

export const NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-001',
    type: 'success',
    title: 'Payment Received',
    message: 'Nike paid $75,000 for Invoice INV-2025-0128',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    read: false,
    actionUrl: '/dashboard/invoices-v2',
    actionLabel: 'View Invoice'
  },
  {
    id: 'notif-002',
    type: 'mention',
    title: 'You were mentioned',
    message: 'Lisa Park mentioned you in "Design AI generation interface"',
    timestamp: new Date(Date.now() - 1000 * 60 * 58).toISOString(),
    read: false,
    actionUrl: '/dashboard/projects-hub-v2',
    actionLabel: 'View Task'
  },
  {
    id: 'notif-003',
    type: 'warning',
    title: 'Customer At Risk',
    message: 'Media Masters health score dropped to 45. Action required.',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    read: false,
    actionUrl: '/dashboard/customers-v2',
    actionLabel: 'View Customer'
  },
  {
    id: 'notif-004',
    type: 'reminder',
    title: 'Meeting in 30 minutes',
    message: 'Quarterly review with Sarah Mitchell (Spotify)',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: true,
    actionUrl: '/dashboard/calendar-v2',
    actionLabel: 'View Calendar'
  },
  {
    id: 'notif-005',
    type: 'info',
    title: 'Sprint Ending Soon',
    message: 'Sprint 24 ends in 5 days. 4 tasks remaining.',
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    read: true,
    actionUrl: '/dashboard/sprints-v2',
    actionLabel: 'View Sprint'
  },
]

// Today's schedule
export const TODAYS_SCHEDULE = [
  { id: 'sched-001', time: '09:00', title: 'Daily standup', type: 'meeting', duration: 15, attendees: 8 },
  { id: 'sched-002', time: '10:00', title: 'Spotify Integration Review', type: 'meeting', duration: 60, attendees: 4, customer: 'Spotify' },
  { id: 'sched-003', time: '11:30', title: 'Sprint Planning', type: 'meeting', duration: 90, attendees: 6 },
  { id: 'sched-004', time: '14:00', title: 'Nike Onboarding Call', type: 'call', duration: 45, attendees: 3, customer: 'Nike' },
  { id: 'sched-005', time: '15:30', title: 'Product Review', type: 'meeting', duration: 60, attendees: 5 },
  { id: 'sched-006', time: '17:00', title: 'Team 1:1 - Emily', type: 'meeting', duration: 30, attendees: 2 },
]
