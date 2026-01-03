'use client'

/**
 * Demo Mode Configuration
 *
 * Provides rich demo data for showcasing the platform
 */

export const DEMO_MODE = {
  enabled: true,
  showNotifications: true
}

// Demo user for showcase
export const DEMO_USER = {
  id: 'demo-user-001',
  email: 'demo@kazi.io',
  name: 'Alex Thompson',
  avatar: '/avatars/demo-user.png',
  role: 'Product Manager',
  company: 'KAZI Technologies'
}

// Generate rich mock projects
export const generateMockProjects = () => [
  {
    id: 'proj-001',
    title: 'E-Commerce Platform Redesign',
    description: 'Complete overhaul of the customer shopping experience with AI recommendations',
    status: 'in_progress',
    progress: 75,
    priority: 'high',
    budget: 150000,
    spent: 112500,
    client: { name: 'TechRetail Corp', avatar: '/avatars/client-1.png' },
    team: [
      { name: 'Sarah Chen', role: 'Lead Designer', avatar: '/avatars/team-1.png' },
      { name: 'Mike Ross', role: 'Frontend Dev', avatar: '/avatars/team-2.png' },
      { name: 'Emma Wilson', role: 'UX Researcher', avatar: '/avatars/team-3.png' },
    ],
    dueDate: '2026-02-15',
    createdAt: '2025-11-01',
    tags: ['e-commerce', 'redesign', 'AI'],
  },
  {
    id: 'proj-002',
    title: 'Mobile Banking App',
    description: 'Next-gen mobile banking with biometric auth and instant transfers',
    status: 'in_progress',
    progress: 45,
    priority: 'high',
    budget: 280000,
    spent: 126000,
    client: { name: 'FinanceFirst Bank', avatar: '/avatars/client-2.png' },
    team: [
      { name: 'James Liu', role: 'Mobile Lead', avatar: '/avatars/team-4.png' },
      { name: 'Anna Schmidt', role: 'Security Expert', avatar: '/avatars/team-5.png' },
    ],
    dueDate: '2026-03-30',
    createdAt: '2025-12-01',
    tags: ['fintech', 'mobile', 'security'],
  },
  {
    id: 'proj-003',
    title: 'AI Content Studio',
    description: 'Revolutionary AI-powered content creation and editing platform',
    status: 'completed',
    progress: 100,
    priority: 'medium',
    budget: 95000,
    spent: 89000,
    client: { name: 'MediaMax Studios', avatar: '/avatars/client-3.png' },
    team: [
      { name: 'David Park', role: 'AI Engineer', avatar: '/avatars/team-6.png' },
    ],
    dueDate: '2025-12-20',
    createdAt: '2025-09-15',
    tags: ['AI', 'content', 'automation'],
  },
  {
    id: 'proj-004',
    title: 'Healthcare Portal',
    description: 'Patient management system with telemedicine integration',
    status: 'in_progress',
    progress: 60,
    priority: 'high',
    budget: 320000,
    spent: 192000,
    client: { name: 'HealthCare Plus', avatar: '/avatars/client-4.png' },
    team: [
      { name: 'Lisa Johnson', role: 'Project Lead', avatar: '/avatars/team-7.png' },
      { name: 'Robert Kim', role: 'Backend Dev', avatar: '/avatars/team-8.png' },
      { name: 'Maria Garcia', role: 'HIPAA Specialist', avatar: '/avatars/team-9.png' },
    ],
    dueDate: '2026-04-15',
    createdAt: '2025-10-01',
    tags: ['healthcare', 'telemedicine', 'compliance'],
  },
  {
    id: 'proj-005',
    title: 'Smart Home Dashboard',
    description: 'Unified IoT control center for smart home devices',
    status: 'planning',
    progress: 15,
    priority: 'medium',
    budget: 75000,
    spent: 11250,
    client: { name: 'SmartLiving Inc', avatar: '/avatars/client-5.png' },
    team: [
      { name: 'Tom Brown', role: 'IoT Specialist', avatar: '/avatars/team-10.png' },
    ],
    dueDate: '2026-05-01',
    createdAt: '2025-12-15',
    tags: ['IoT', 'smart-home', 'dashboard'],
  },
]

// Generate rich mock tasks
export const generateMockTasks = () => [
  { id: 't1', title: 'Design system update', status: 'completed', priority: 'high', project: 'E-Commerce Platform', assignee: 'Sarah Chen', dueDate: '2026-01-02' },
  { id: 't2', title: 'API integration testing', status: 'in_progress', priority: 'high', project: 'Mobile Banking App', assignee: 'James Liu', dueDate: '2026-01-05' },
  { id: 't3', title: 'User authentication flow', status: 'in_progress', priority: 'high', project: 'Healthcare Portal', assignee: 'Robert Kim', dueDate: '2026-01-08' },
  { id: 't4', title: 'Performance optimization', status: 'todo', priority: 'medium', project: 'E-Commerce Platform', assignee: 'Mike Ross', dueDate: '2026-01-10' },
  { id: 't5', title: 'Security audit review', status: 'in_progress', priority: 'high', project: 'Mobile Banking App', assignee: 'Anna Schmidt', dueDate: '2026-01-07' },
  { id: 't6', title: 'Client presentation prep', status: 'todo', priority: 'medium', project: 'AI Content Studio', assignee: 'David Park', dueDate: '2026-01-12' },
  { id: 't7', title: 'Database migration', status: 'completed', priority: 'high', project: 'Healthcare Portal', assignee: 'Maria Garcia', dueDate: '2026-01-01' },
  { id: 't8', title: 'Mobile responsiveness', status: 'in_progress', priority: 'medium', project: 'E-Commerce Platform', assignee: 'Emma Wilson', dueDate: '2026-01-15' },
]

// Generate rich analytics data
export const generateMockAnalytics = () => ({
  overview: {
    totalProjects: 24,
    activeProjects: 12,
    completedProjects: 10,
    totalTasks: 156,
    completedTasks: 98,
    teamMembers: 18,
    clientSatisfaction: 94.5,
    revenue: 1250000,
    revenueGrowth: 23.5,
    activeClients: 15,
  },
  chartData: {
    projectsOverTime: [
      { month: 'Jul', completed: 2, started: 3 },
      { month: 'Aug', completed: 3, started: 2 },
      { month: 'Sep', completed: 2, started: 4 },
      { month: 'Oct', completed: 4, started: 3 },
      { month: 'Nov', completed: 3, started: 5 },
      { month: 'Dec', completed: 5, started: 4 },
    ],
    taskCompletion: [
      { week: 'Week 1', completed: 12, total: 15 },
      { week: 'Week 2', completed: 18, total: 20 },
      { week: 'Week 3', completed: 15, total: 18 },
      { week: 'Week 4', completed: 22, total: 25 },
    ],
    revenueByMonth: [
      { month: 'Jul', revenue: 85000 },
      { month: 'Aug', revenue: 92000 },
      { month: 'Sep', revenue: 110000 },
      { month: 'Oct', revenue: 125000 },
      { month: 'Nov', revenue: 145000 },
      { month: 'Dec', revenue: 168000 },
    ],
  },
})

// Generate mock files
export const generateMockFiles = () => [
  { id: 'f1', name: 'Brand Guidelines v2.pdf', type: 'pdf', size: '2.4 MB', modified: '2 hours ago', project: 'E-Commerce Platform' },
  { id: 'f2', name: 'Wireframes-Final.fig', type: 'figma', size: '15.8 MB', modified: '5 hours ago', project: 'Mobile Banking App' },
  { id: 'f3', name: 'API Documentation.md', type: 'markdown', size: '124 KB', modified: '1 day ago', project: 'Healthcare Portal' },
  { id: 'f4', name: 'User Research Report.docx', type: 'document', size: '3.2 MB', modified: '2 days ago', project: 'AI Content Studio' },
  { id: 'f5', name: 'Sprint Planning.xlsx', type: 'spreadsheet', size: '856 KB', modified: '3 days ago', project: 'Smart Home Dashboard' },
  { id: 'f6', name: 'Product Demo.mp4', type: 'video', size: '245 MB', modified: '1 week ago', project: 'E-Commerce Platform' },
]

// Generate mock messages
export const generateMockMessages = () => [
  { id: 'm1', from: 'Sarah Chen', message: 'The new design system is ready for review!', time: '10 min ago', unread: true, avatar: '/avatars/team-1.png' },
  { id: 'm2', from: 'TechRetail Corp', message: 'Great progress on the project. Can we schedule a demo?', time: '1 hour ago', unread: true, avatar: '/avatars/client-1.png' },
  { id: 'm3', from: 'James Liu', message: 'API tests are passing. Ready for staging deployment.', time: '2 hours ago', unread: false, avatar: '/avatars/team-4.png' },
  { id: 'm4', from: 'Anna Schmidt', message: 'Security review complete. All issues resolved.', time: '5 hours ago', unread: false, avatar: '/avatars/team-5.png' },
]

// Generate mock invoices
export const generateMockInvoices = () => [
  { id: 'INV-2026-001', client: 'TechRetail Corp', amount: 45000, status: 'paid', date: '2026-01-01', dueDate: '2026-01-15' },
  { id: 'INV-2026-002', client: 'FinanceFirst Bank', amount: 65000, status: 'pending', date: '2025-12-28', dueDate: '2026-01-28' },
  { id: 'INV-2025-089', client: 'MediaMax Studios', amount: 28000, status: 'paid', date: '2025-12-15', dueDate: '2025-12-30' },
  { id: 'INV-2026-003', client: 'HealthCare Plus', amount: 85000, status: 'overdue', date: '2025-12-01', dueDate: '2025-12-31' },
]

// Generate mock calendar events
export const generateMockCalendarEvents = () => [
  { id: 'e1', title: 'Sprint Planning', start: '2026-01-06T09:00:00', end: '2026-01-06T10:30:00', type: 'meeting', project: 'E-Commerce Platform' },
  { id: 'e2', title: 'Client Demo', start: '2026-01-07T14:00:00', end: '2026-01-07T15:00:00', type: 'presentation', project: 'Mobile Banking App' },
  { id: 'e3', title: 'Design Review', start: '2026-01-08T11:00:00', end: '2026-01-08T12:00:00', type: 'review', project: 'Healthcare Portal' },
  { id: 'e4', title: 'Team Standup', start: '2026-01-09T09:30:00', end: '2026-01-09T09:45:00', type: 'standup', project: 'All Projects' },
]

// Generate mock team members
export const generateMockTeamMembers = () => [
  { id: 'tm1', name: 'Sarah Chen', role: 'Lead Designer', email: 'sarah@kazi.io', status: 'online', projects: 3, tasksCompleted: 24 },
  { id: 'tm2', name: 'Mike Ross', role: 'Frontend Developer', email: 'mike@kazi.io', status: 'online', projects: 2, tasksCompleted: 31 },
  { id: 'tm3', name: 'James Liu', role: 'Mobile Lead', email: 'james@kazi.io', status: 'away', projects: 1, tasksCompleted: 18 },
  { id: 'tm4', name: 'Anna Schmidt', role: 'Security Expert', email: 'anna@kazi.io', status: 'online', projects: 2, tasksCompleted: 15 },
  { id: 'tm5', name: 'Emma Wilson', role: 'UX Researcher', email: 'emma@kazi.io', status: 'offline', projects: 2, tasksCompleted: 12 },
  { id: 'tm6', name: 'David Park', role: 'AI Engineer', email: 'david@kazi.io', status: 'online', projects: 1, tasksCompleted: 28 },
]

// Generate mock notifications
export const generateMockNotifications = () => [
  { id: 'n1', type: 'success', title: 'Project Milestone Reached', message: 'E-Commerce Platform hit 75% completion!', time: '5 min ago' },
  { id: 'n2', type: 'info', title: 'New Comment', message: 'Sarah Chen commented on your design', time: '15 min ago' },
  { id: 'n3', type: 'warning', title: 'Invoice Due Soon', message: 'INV-2026-002 is due in 3 days', time: '1 hour ago' },
  { id: 'n4', type: 'success', title: 'Payment Received', message: 'TechRetail Corp paid $45,000', time: '2 hours ago' },
]

// Demo notification utility
export const showDemoNotification = (message: string) => {
  if (DEMO_MODE.showNotifications) {
    console.log('📢 Demo:', message)
  }
}

// API simulation for demo
export const simulateApiCall = async <T>(data: T, delay: number = 500): Promise<T> => {
  await new Promise(resolve => setTimeout(resolve, delay))
  return data
}
