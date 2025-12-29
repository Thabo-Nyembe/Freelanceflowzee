// Team Member Data - Appears in collaboration indicators, assignments, activities
// These team members are referenced consistently across all modules

export interface TeamMember {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  initials: string
  role: string
  department: string
  title: string
  status: 'active' | 'away' | 'busy' | 'offline'
  lastActive: string
  location: string
  timezone: string
  manager?: string
  directReports: number
  joinedAt: string
  skills: string[]
  projects: number
  tasksCompleted: number
  productivity: number // 0-100
}

// Leadership Team
export const LEADERSHIP_TEAM: TeamMember[] = [
  {
    id: 'team-001',
    name: 'Alexandra Chen',
    email: 'alex@freeflow.io',
    phone: '+1 (415) 555-0001',
    avatar: '/avatars/alex-chen.jpg',
    initials: 'AC',
    role: 'CEO',
    department: 'Executive',
    title: 'Chief Executive Officer',
    status: 'active',
    lastActive: 'Just now',
    location: 'San Francisco, CA',
    timezone: 'America/Los_Angeles',
    directReports: 5,
    joinedAt: '2022-01-15',
    skills: ['Leadership', 'Strategy', 'Product Vision'],
    projects: 3,
    tasksCompleted: 847,
    productivity: 95
  },
  {
    id: 'team-002',
    name: 'Marcus Williams',
    email: 'marcus@freeflow.io',
    phone: '+1 (415) 555-0002',
    avatar: '/avatars/marcus-williams.jpg',
    initials: 'MW',
    role: 'CTO',
    department: 'Engineering',
    title: 'Chief Technology Officer',
    status: 'active',
    lastActive: '5m ago',
    location: 'San Francisco, CA',
    timezone: 'America/Los_Angeles',
    manager: 'team-001',
    directReports: 8,
    joinedAt: '2022-01-15',
    skills: ['Architecture', 'Engineering', 'AI/ML'],
    projects: 12,
    tasksCompleted: 1243,
    productivity: 92
  },
  {
    id: 'team-003',
    name: 'Jennifer Walsh',
    email: 'jennifer@freeflow.io',
    phone: '+1 (415) 555-0003',
    avatar: '/avatars/jennifer-walsh.jpg',
    initials: 'JW',
    role: 'VP Sales',
    department: 'Sales',
    title: 'Vice President of Sales',
    status: 'active',
    lastActive: '2m ago',
    location: 'New York, NY',
    timezone: 'America/New_York',
    manager: 'team-001',
    directReports: 12,
    joinedAt: '2022-06-01',
    skills: ['Enterprise Sales', 'Negotiations', 'Team Leadership'],
    projects: 8,
    tasksCompleted: 956,
    productivity: 94
  },
  {
    id: 'team-004',
    name: 'Sarah Johnson',
    email: 'sarah@freeflow.io',
    phone: '+1 (415) 555-0004',
    avatar: '/avatars/sarah-johnson.jpg',
    initials: 'SJ',
    role: 'VP Marketing',
    department: 'Marketing',
    title: 'Vice President of Marketing',
    status: 'away',
    lastActive: '15m ago',
    location: 'San Francisco, CA',
    timezone: 'America/Los_Angeles',
    manager: 'team-001',
    directReports: 8,
    joinedAt: '2022-08-15',
    skills: ['Brand Strategy', 'Growth Marketing', 'Content'],
    projects: 6,
    tasksCompleted: 723,
    productivity: 89
  },
  {
    id: 'team-005',
    name: 'Michael Chen',
    email: 'michael.c@freeflow.io',
    phone: '+1 (415) 555-0005',
    avatar: '/avatars/michael-chen.jpg',
    initials: 'MC',
    role: 'VP Customer Success',
    department: 'Customer Success',
    title: 'Vice President of Customer Success',
    status: 'active',
    lastActive: 'Just now',
    location: 'San Francisco, CA',
    timezone: 'America/Los_Angeles',
    manager: 'team-001',
    directReports: 10,
    joinedAt: '2023-01-10',
    skills: ['Customer Success', 'Account Management', 'Retention'],
    projects: 5,
    tasksCompleted: 612,
    productivity: 91
  },
]

// Full Team (includes leadership + key team members)
export const TEAM_MEMBERS: TeamMember[] = [
  ...LEADERSHIP_TEAM,
  {
    id: 'team-006',
    name: 'Emily Davis',
    email: 'emily@freeflow.io',
    phone: '+1 (415) 555-0006',
    avatar: '/avatars/emily-davis.jpg',
    initials: 'ED',
    role: 'Senior Engineer',
    department: 'Engineering',
    title: 'Senior Software Engineer',
    status: 'active',
    lastActive: '3m ago',
    location: 'Seattle, WA',
    timezone: 'America/Los_Angeles',
    manager: 'team-002',
    directReports: 0,
    joinedAt: '2023-03-15',
    skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
    projects: 4,
    tasksCompleted: 456,
    productivity: 93
  },
  {
    id: 'team-007',
    name: 'Robert Kim',
    email: 'robert@freeflow.io',
    phone: '+1 (415) 555-0007',
    avatar: '/avatars/robert-kim.jpg',
    initials: 'RK',
    role: 'Product Manager',
    department: 'Product',
    title: 'Senior Product Manager',
    status: 'busy',
    lastActive: '1h ago',
    location: 'San Francisco, CA',
    timezone: 'America/Los_Angeles',
    manager: 'team-001',
    directReports: 0,
    joinedAt: '2023-05-20',
    skills: ['Product Strategy', 'Roadmap', 'Analytics'],
    projects: 6,
    tasksCompleted: 389,
    productivity: 88
  },
  {
    id: 'team-008',
    name: 'Lisa Park',
    email: 'lisa@freeflow.io',
    phone: '+1 (415) 555-0008',
    avatar: '/avatars/lisa-park.jpg',
    initials: 'LP',
    role: 'Designer',
    department: 'Design',
    title: 'Senior Product Designer',
    status: 'active',
    lastActive: 'Just now',
    location: 'Los Angeles, CA',
    timezone: 'America/Los_Angeles',
    manager: 'team-001',
    directReports: 2,
    joinedAt: '2023-02-01',
    skills: ['UI/UX', 'Figma', 'Design Systems'],
    projects: 5,
    tasksCompleted: 512,
    productivity: 91
  },
  {
    id: 'team-009',
    name: 'James Wilson',
    email: 'james@freeflow.io',
    phone: '+1 (415) 555-0009',
    avatar: '/avatars/james-wilson.jpg',
    initials: 'JWi',
    role: 'Account Executive',
    department: 'Sales',
    title: 'Senior Account Executive',
    status: 'active',
    lastActive: '10m ago',
    location: 'New York, NY',
    timezone: 'America/New_York',
    manager: 'team-003',
    directReports: 0,
    joinedAt: '2023-04-10',
    skills: ['Enterprise Sales', 'Demos', 'Closing'],
    projects: 15,
    tasksCompleted: 678,
    productivity: 96
  },
  {
    id: 'team-010',
    name: 'Anna Martinez',
    email: 'anna@freeflow.io',
    phone: '+1 (415) 555-0010',
    avatar: '/avatars/anna-martinez.jpg',
    initials: 'AM',
    role: 'Customer Success Manager',
    department: 'Customer Success',
    title: 'Senior CSM',
    status: 'active',
    lastActive: '5m ago',
    location: 'Austin, TX',
    timezone: 'America/Chicago',
    manager: 'team-005',
    directReports: 0,
    joinedAt: '2023-06-01',
    skills: ['Onboarding', 'Retention', 'Upselling'],
    projects: 8,
    tasksCompleted: 534,
    productivity: 90
  },
  {
    id: 'team-011',
    name: 'David Thompson',
    email: 'david.t@freeflow.io',
    phone: '+1 (415) 555-0011',
    avatar: '/avatars/david-thompson.jpg',
    initials: 'DT',
    role: 'DevOps Engineer',
    department: 'Engineering',
    title: 'Senior DevOps Engineer',
    status: 'active',
    lastActive: '1m ago',
    location: 'Denver, CO',
    timezone: 'America/Denver',
    manager: 'team-002',
    directReports: 0,
    joinedAt: '2023-07-15',
    skills: ['Kubernetes', 'AWS', 'CI/CD', 'Terraform'],
    projects: 3,
    tasksCompleted: 423,
    productivity: 94
  },
  {
    id: 'team-012',
    name: 'Sophie Anderson',
    email: 'sophie@freeflow.io',
    phone: '+1 (415) 555-0012',
    avatar: '/avatars/sophie-anderson.jpg',
    initials: 'SA',
    role: 'Content Marketer',
    department: 'Marketing',
    title: 'Content Marketing Manager',
    status: 'away',
    lastActive: '30m ago',
    location: 'Chicago, IL',
    timezone: 'America/Chicago',
    manager: 'team-004',
    directReports: 0,
    joinedAt: '2023-09-01',
    skills: ['Content Strategy', 'SEO', 'Copywriting'],
    projects: 4,
    tasksCompleted: 312,
    productivity: 87
  },
]

// Collaborators format for competitive upgrades components
const COLLABORATOR_COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444']

export const COLLABORATORS = TEAM_MEMBERS.slice(0, 5).map((m, i) => ({
  id: m.id,
  name: m.name,
  avatar: m.avatar,
  color: COLLABORATOR_COLORS[i % COLLABORATOR_COLORS.length],
  status: (m.status === 'active' ? 'online' : m.status === 'idle' ? 'away' : 'offline') as 'online' | 'away' | 'offline',
  lastActive: m.lastActive,
  role: m.title
}))

// Department breakdown
export const DEPARTMENTS = [
  { name: 'Engineering', headcount: 45, budget: 4500000, lead: 'Marcus Williams' },
  { name: 'Sales', headcount: 28, budget: 2800000, lead: 'Jennifer Walsh' },
  { name: 'Marketing', headcount: 18, budget: 1800000, lead: 'Sarah Johnson' },
  { name: 'Customer Success', headcount: 22, budget: 1650000, lead: 'Michael Chen' },
  { name: 'Product', headcount: 8, budget: 960000, lead: 'Robert Kim' },
  { name: 'Design', headcount: 6, budget: 720000, lead: 'Lisa Park' },
]

// Team stats for dashboards
export const TEAM_STATS = {
  totalEmployees: 127,
  activeNow: 89,
  departments: 6,
  avgProductivity: 91,
  openPositions: 12,
  avgTenure: 1.4, // years
  retention: 94.5, // percent
  satisfaction: 4.6, // out of 5
}

// Org chart data
export const ORG_STRUCTURE = {
  ceo: 'team-001',
  directReports: ['team-002', 'team-003', 'team-004', 'team-005', 'team-007'],
  departments: {
    engineering: { lead: 'team-002', members: ['team-006', 'team-011'] },
    sales: { lead: 'team-003', members: ['team-009'] },
    marketing: { lead: 'team-004', members: ['team-012'] },
    customerSuccess: { lead: 'team-005', members: ['team-010'] },
    design: { lead: 'team-008', members: [] },
  }
}
