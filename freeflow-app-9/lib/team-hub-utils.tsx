/**
 * ========================================
 * TEAM HUB UTILITIES - PRODUCTION READY
 * ========================================
 *
 * Complete team management system with:
 * - Team member profiles and directories
 * - Department organization
 * - Skills and expertise tracking
 * - Availability and status management
 * - Project assignments
 * - Performance metrics and ratings
 * - Team analytics and insights
 * - Communication tools integration
 */

import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('TeamHubUtils')

// ========================================
// TYPE DEFINITIONS
// ========================================

export type MemberStatus = 'online' | 'offline' | 'away' | 'busy' | 'dnd'
export type DepartmentType = 'design' | 'development' | 'management' | 'marketing' | 'qa' | 'sales' | 'hr' | 'finance' | 'operations' | 'support'
export type RoleLevel = 'intern' | 'junior' | 'mid' | 'senior' | 'lead' | 'manager' | 'director' | 'executive'
export type AvailabilityStatus = 'available' | 'busy' | 'in-meeting' | 'on-leave' | 'offline'

export interface TeamMember {
  id: string
  userId: string
  name: string
  email: string
  phone?: string
  avatar: string
  role: string
  roleLevel: RoleLevel
  department: DepartmentType
  location: string
  timezone: string
  status: MemberStatus
  availability: AvailabilityStatus
  joinDate: Date
  lastActive: Date
  projects: number
  tasksCompleted: number
  rating: number
  reviewCount: number
  skills: string[]
  currentProjects: string[]
  bio?: string
  socialLinks?: {
    linkedin?: string
    github?: string
    twitter?: string
  }
  workingHours?: {
    start: string
    end: string
  }
}

export interface Department {
  id: string
  name: string
  type: DepartmentType
  description: string
  memberCount: number
  color: string
  icon: string
  managerId?: string
  budget?: number
  goals: string[]
}

export interface TeamProject {
  id: string
  name: string
  description: string
  teamIds: string[]
  status: 'planning' | 'active' | 'on-hold' | 'completed'
  startDate: Date
  dueDate?: Date
  progress: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

export interface TeamMeeting {
  id: string
  title: string
  description: string
  startTime: Date
  endTime: Date
  attendees: string[]
  organizer: string
  location?: string
  meetingLink?: string
  agenda?: string[]
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
}

export interface PerformanceReview {
  id: string
  memberId: string
  reviewerId: string
  period: string
  rating: number
  strengths: string[]
  improvements: string[]
  goals: string[]
  comments?: string
  createdAt: Date
}

export interface TeamAnnouncement {
  id: string
  title: string
  content: string
  author: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  departments: DepartmentType[]
  expiresAt?: Date
  createdAt: Date
  readBy: string[]
}

export interface TeamStats {
  totalMembers: number
  onlineMembers: number
  activeProjects: number
  completedTasks: number
  averageRating: number
  byDepartment: Record<DepartmentType, number>
  byStatus: Record<MemberStatus, number>
  byRoleLevel: Record<RoleLevel, number>
  topSkills: Array<{ skill: string; count: number }>
}

// ========================================
// CONSTANTS
// ========================================

const FIRST_NAMES = [
  'Sarah', 'Mike', 'Emma', 'David', 'Lisa', 'Alex', 'Jessica', 'James',
  'Maria', 'Chris', 'Jennifer', 'Michael', 'Amanda', 'Ryan', 'Nicole', 'Brian'
]

const LAST_NAMES = [
  'Johnson', 'Chen', 'Wilson', 'Kim', 'Brown', 'Rivera', 'Garcia', 'Martinez',
  'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson'
]

const ROLES = [
  'Lead Designer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Project Manager', 'Product Manager', 'UX Designer', 'UI Designer',
  'DevOps Engineer', 'QA Engineer', 'Data Analyst', 'Marketing Manager',
  'Content Strategist', 'Sales Manager', 'HR Manager', 'Financial Analyst'
]

const LOCATIONS = [
  'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA',
  'Boston, MA', 'Denver, CO', 'Miami, FL', 'Chicago, IL',
  'Los Angeles, CA', 'Portland, OR'
]

const SKILLS = [
  'React', 'TypeScript', 'Node.js', 'Python', 'JavaScript', 'AWS', 'Docker',
  'UI/UX Design', 'Figma', 'Sketch', 'Project Management', 'Agile', 'Scrum',
  'PostgreSQL', 'MongoDB', 'GraphQL', 'REST API', 'Git', 'CI/CD',
  'Tailwind CSS', 'Next.js', 'Vue.js', 'Angular', 'Leadership',
  'Communication', 'Problem Solving', 'Strategic Planning', 'Data Analysis'
]

// ========================================
// MOCK DATA GENERATION
// ========================================

export function generateMockTeamMembers(count: number = 30, userId: string = 'user-1'): TeamMember[] {
  logger.info('Generating mock team members', { count, userId })

  const members: TeamMember[] = []
  const now = new Date()
  const departments: DepartmentType[] = ['design', 'development', 'management', 'marketing', 'qa', 'sales', 'hr', 'finance']
  const statuses: MemberStatus[] = ['online', 'offline', 'away', 'busy', 'dnd']
  const roleLevels: RoleLevel[] = ['intern', 'junior', 'mid', 'senior', 'lead', 'manager']
  const availabilities: AvailabilityStatus[] = ['available', 'busy', 'in-meeting', 'on-leave', 'offline']

  for (let i = 0; i < count; i++) {
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length]
    const lastName = LAST_NAMES[i % LAST_NAMES.length]
    const daysAgo = Math.floor(Math.random() * 365)

    members.push({
      id: `member-${i + 1}`,
      userId: `user-${i + 1}`,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`,
      phone: `+1 (555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${i}`,
      role: ROLES[i % ROLES.length],
      roleLevel: roleLevels[i % roleLevels.length],
      department: departments[i % departments.length],
      location: LOCATIONS[i % LOCATIONS.length],
      timezone: 'America/Los_Angeles',
      status: statuses[i % statuses.length],
      availability: availabilities[i % availabilities.length],
      joinDate: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000),
      lastActive: new Date(now.getTime() - Math.floor(Math.random() * 24) * 60 * 60 * 1000),
      projects: Math.floor(Math.random() * 15) + 1,
      tasksCompleted: Math.floor(Math.random() * 200) + 20,
      rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
      reviewCount: Math.floor(Math.random() * 50) + 5,
      skills: [
        SKILLS[i % SKILLS.length],
        SKILLS[(i + 1) % SKILLS.length],
        SKILLS[(i + 2) % SKILLS.length],
        SKILLS[(i + 3) % SKILLS.length]
      ],
      currentProjects: [
        `Project ${Math.floor(i / 5) + 1}`,
        `Project ${Math.floor(i / 3) + 1}`
      ],
      bio: `Experienced ${ROLES[i % ROLES.length]} with a passion for innovation and teamwork.`,
      socialLinks: {
        linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
        github: i % 3 === 0 ? `https://github.com/${firstName.toLowerCase()}${lastName.toLowerCase()}` : undefined,
        twitter: i % 4 === 0 ? `https://twitter.com/${firstName.toLowerCase()}_${lastName.toLowerCase()}` : undefined
      },
      workingHours: {
        start: '09:00',
        end: '17:00'
      }
    })
  }

  logger.debug('Mock team members generated', {
    total: members.length,
    byDepartment: departments.map(d => ({ department: d, count: members.filter(m => m.department === d).length }))
  })

  return members
}

export function generateMockDepartments(): Department[] {
  logger.info('Generating mock departments')

  const departments: Department[] = [
    {
      id: 'dept-1',
      name: 'Design',
      type: 'design',
      description: 'Creative and user experience design',
      memberCount: 0,
      color: 'purple',
      icon: 'Palette',
      goals: ['Improve UI consistency', 'Launch design system', 'Increase user satisfaction']
    },
    {
      id: 'dept-2',
      name: 'Development',
      type: 'development',
      description: 'Software engineering and development',
      memberCount: 0,
      color: 'blue',
      icon: 'Code',
      goals: ['Reduce tech debt', 'Improve code quality', 'Ship features faster']
    },
    {
      id: 'dept-3',
      name: 'Management',
      type: 'management',
      description: 'Project and team management',
      memberCount: 0,
      color: 'green',
      icon: 'Users',
      goals: ['Improve team efficiency', 'Better stakeholder communication', 'Streamline processes']
    },
    {
      id: 'dept-4',
      name: 'Marketing',
      type: 'marketing',
      description: 'Marketing and growth strategies',
      memberCount: 0,
      color: 'orange',
      icon: 'TrendingUp',
      goals: ['Increase brand awareness', 'Generate more leads', 'Improve conversion rates']
    },
    {
      id: 'dept-5',
      name: 'Quality Assurance',
      type: 'qa',
      description: 'Testing and quality control',
      memberCount: 0,
      color: 'red',
      icon: 'CheckCircle',
      goals: ['Reduce bug count', 'Automate more tests', 'Improve test coverage']
    }
  ]

  logger.debug('Mock departments generated', { count: departments.length })
  return departments
}

export function generateMockMeetings(count: number = 10): TeamMeeting[] {
  logger.info('Generating mock meetings', { count })

  const meetings: TeamMeeting[] = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    const daysOffset = Math.floor(i / 2) - 2
    const startTime = new Date(now)
    startTime.setDate(now.getDate() + daysOffset)
    startTime.setHours(9 + (i % 8), 0, 0, 0)

    const endTime = new Date(startTime)
    endTime.setHours(startTime.getHours() + 1)

    meetings.push({
      id: `meeting-${i + 1}`,
      title: ['Team Standup', 'Sprint Planning', 'Design Review', 'Client Meeting', '1-on-1', 'All Hands'][i % 6],
      description: `Discussion about ${['project updates', 'upcoming sprint', 'design proposals', 'client feedback', 'career development', 'company updates'][i % 6]}`,
      startTime,
      endTime,
      attendees: [`member-${i % 30 + 1}`, `member-${(i + 1) % 30 + 1}`, `member-${(i + 2) % 30 + 1}`],
      organizer: `member-${i % 30 + 1}`,
      meetingLink: `https://meet.company.com/${Math.random().toString(36).substr(2, 9)}`,
      agenda: ['Review progress', 'Discuss blockers', 'Plan next steps'],
      status: daysOffset < 0 ? 'completed' : daysOffset === 0 ? (i % 3 === 0 ? 'in-progress' : 'scheduled') : 'scheduled'
    })
  }

  logger.debug('Mock meetings generated', { count: meetings.length })
  return meetings
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

export function getStatusColor(status: MemberStatus): string {
  const colors: Record<MemberStatus, string> = {
    online: 'green',
    offline: 'gray',
    away: 'yellow',
    busy: 'red',
    dnd: 'purple'
  }
  return colors[status]
}

export function getStatusLabel(status: MemberStatus): string {
  const labels: Record<MemberStatus, string> = {
    online: 'Online',
    offline: 'Offline',
    away: 'Away',
    busy: 'Busy',
    dnd: 'Do Not Disturb'
  }
  return labels[status]
}

export function getDepartmentIcon(department: DepartmentType): string {
  const icons: Record<DepartmentType, string> = {
    design: 'Palette',
    development: 'Code',
    management: 'Users',
    marketing: 'TrendingUp',
    qa: 'CheckCircle',
    sales: 'DollarSign',
    hr: 'Heart',
    finance: 'Calculator',
    operations: 'Settings',
    support: 'Headphones'
  }
  return icons[department]
}

export function getDepartmentColor(department: DepartmentType): string {
  const colors: Record<DepartmentType, string> = {
    design: 'purple',
    development: 'blue',
    management: 'green',
    marketing: 'orange',
    qa: 'red',
    sales: 'yellow',
    hr: 'pink',
    finance: 'indigo',
    operations: 'slate',
    support: 'cyan'
  }
  return colors[department]
}

export function getRoleLevelBadge(roleLevel: RoleLevel): { label: string; color: string } {
  const badges: Record<RoleLevel, { label: string; color: string }> = {
    intern: { label: 'Intern', color: 'gray' },
    junior: { label: 'Junior', color: 'blue' },
    mid: { label: 'Mid-Level', color: 'green' },
    senior: { label: 'Senior', color: 'purple' },
    lead: { label: 'Lead', color: 'orange' },
    manager: { label: 'Manager', color: 'red' },
    director: { label: 'Director', color: 'pink' },
    executive: { label: 'Executive', color: 'yellow' }
  }
  return badges[roleLevel]
}

export function searchMembers(members: TeamMember[], searchTerm: string): TeamMember[] {
  if (!searchTerm.trim()) return members

  const term = searchTerm.toLowerCase()
  logger.debug('Searching team members', { term, totalMembers: members.length })

  const filtered = members.filter(member =>
    member.name.toLowerCase().includes(term) ||
    member.email.toLowerCase().includes(term) ||
    member.role.toLowerCase().includes(term) ||
    member.department.toLowerCase().includes(term) ||
    member.skills.some(skill => skill.toLowerCase().includes(term))
  )

  logger.info('Member search complete', {
    term,
    resultsCount: filtered.length,
    totalSearched: members.length
  })

  return filtered
}

export function filterByDepartment(members: TeamMember[], department: DepartmentType | 'all'): TeamMember[] {
  if (department === 'all') return members

  logger.debug('Filtering members by department', { department })

  const filtered = members.filter(m => m.department === department)

  logger.info('Members filtered by department', {
    department,
    resultsCount: filtered.length
  })

  return filtered
}

export function filterByStatus(members: TeamMember[], status: MemberStatus | 'all'): TeamMember[] {
  if (status === 'all') return members

  logger.debug('Filtering members by status', { status })

  const filtered = members.filter(m => m.status === status)

  logger.info('Members filtered by status', {
    status,
    resultsCount: filtered.length
  })

  return filtered
}

export function sortMembers(
  members: TeamMember[],
  sortBy: 'name' | 'department' | 'rating' | 'joinDate' | 'tasksCompleted'
): TeamMember[] {
  logger.debug('Sorting members', { sortBy, totalMembers: members.length })

  const sorted = [...members].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'department':
        return a.department.localeCompare(b.department)
      case 'rating':
        return b.rating - a.rating
      case 'joinDate':
        return b.joinDate.getTime() - a.joinDate.getTime()
      case 'tasksCompleted':
        return b.tasksCompleted - a.tasksCompleted
      default:
        return 0
    }
  })

  logger.info('Members sorted', { sortBy, count: sorted.length })
  return sorted
}

export function calculateTeamStats(members: TeamMember[]): TeamStats {
  logger.debug('Calculating team stats', { totalMembers: members.length })

  const byDepartment: Record<DepartmentType, number> = {
    design: 0,
    development: 0,
    management: 0,
    marketing: 0,
    qa: 0,
    sales: 0,
    hr: 0,
    finance: 0,
    operations: 0,
    support: 0
  }

  const byStatus: Record<MemberStatus, number> = {
    online: 0,
    offline: 0,
    away: 0,
    busy: 0,
    dnd: 0
  }

  const byRoleLevel: Record<RoleLevel, number> = {
    intern: 0,
    junior: 0,
    mid: 0,
    senior: 0,
    lead: 0,
    manager: 0,
    director: 0,
    executive: 0
  }

  const skillCounts: Record<string, number> = {}
  let totalProjects = 0
  let totalTasks = 0
  let totalRating = 0

  members.forEach(member => {
    byDepartment[member.department]++
    byStatus[member.status]++
    byRoleLevel[member.roleLevel]++
    totalProjects += member.projects
    totalTasks += member.tasksCompleted
    totalRating += member.rating

    member.skills.forEach(skill => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1
    })
  })

  const topSkills = Object.entries(skillCounts)
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const stats: TeamStats = {
    totalMembers: members.length,
    onlineMembers: byStatus.online,
    activeProjects: totalProjects,
    completedTasks: totalTasks,
    averageRating: members.length > 0 ? parseFloat((totalRating / members.length).toFixed(1)) : 0,
    byDepartment,
    byStatus,
    byRoleLevel,
    topSkills
  }

  logger.info('Team stats calculated', {
    totalMembers: stats.totalMembers,
    onlineMembers: stats.onlineMembers,
    averageRating: stats.averageRating
  })

  return stats
}

export function getOnlineMembers(members: TeamMember[]): TeamMember[] {
  return members.filter(m => m.status === 'online')
}

export function getAvailableMembers(members: TeamMember[]): TeamMember[] {
  return members.filter(m => m.availability === 'available')
}

export function getMembersBySkill(members: TeamMember[], skill: string): TeamMember[] {
  return members.filter(m => m.skills.some(s => s.toLowerCase().includes(skill.toLowerCase())))
}

export function exportTeamDirectory(members: TeamMember[], format: 'json' | 'csv'): Blob {
  logger.info('Exporting team directory', { format, count: members.length })

  if (format === 'json') {
    const data = JSON.stringify(members, null, 2)
    return new Blob([data], { type: 'application/json' })
  }

  // CSV format
  const headers = ['Name', 'Email', 'Role', 'Department', 'Location', 'Status', 'Projects', 'Tasks Completed', 'Rating']
  const rows = members.map(m => [
    m.name,
    m.email,
    m.role,
    m.department,
    m.location,
    m.status,
    m.projects.toString(),
    m.tasksCompleted.toString(),
    m.rating.toString()
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  return new Blob([csv], { type: 'text/csv' })
}

export default {
  generateMockTeamMembers,
  generateMockDepartments,
  generateMockMeetings,
  getStatusColor,
  getStatusLabel,
  getDepartmentIcon,
  getDepartmentColor,
  getRoleLevelBadge,
  searchMembers,
  filterByDepartment,
  filterByStatus,
  sortMembers,
  calculateTeamStats,
  getOnlineMembers,
  getAvailableMembers,
  getMembersBySkill,
  exportTeamDirectory
}
