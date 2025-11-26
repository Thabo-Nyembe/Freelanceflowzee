/**
 * TEAM MANAGEMENT UTILITIES
 *
 * Comprehensive utilities for team collaboration and management with:
 * - Team member profiles and roles
 * - Real-time availability tracking
 * - Performance metrics and ratings
 * - Skill management and matching
 * - Project assignments
 * - Communication tools integration
 * - Time tracking and schedules
 * - Permission management
 * - Team analytics and insights
 */

import { createFeatureLogger } from './logger'

const logger = createFeatureLogger('TeamUtils')

// ============================================
// TYPES & INTERFACES
// ============================================

export type MemberStatus = 'online' | 'busy' | 'away' | 'offline'
export type MemberRole = 'Lead Designer' | 'Frontend Developer' | 'Backend Developer' | 'Project Manager' | 'QA Engineer' | 'Marketing Specialist' | 'Content Writer' | 'DevOps Engineer' | 'UI/UX Designer' | 'Data Analyst' | 'Team Member'
export type Department = 'Design' | 'Development' | 'Management' | 'Marketing' | 'Quality Assurance' | 'Content' | 'Operations' | 'Analytics' | 'Sales' | 'Support'
export type PermissionLevel = 'owner' | 'admin' | 'write' | 'read'
export type Timezone = 'PST' | 'MST' | 'CST' | 'EST' | 'UTC' | 'GMT' | 'CET' | 'IST' | 'JST' | 'AEST'
export type AvailabilityStatus = 'Available' | 'Busy' | 'In Meeting' | 'On Break' | 'Offline' | 'On Leave' | 'Pending'

export interface TeamMember {
  id: string
  name: string
  role: MemberRole
  department: Department
  email: string
  phone?: string
  location: string
  avatar: string
  status: MemberStatus
  joinDate: string
  projects: number
  completedTasks: number
  rating: number
  skills: string[]
  availability: AvailabilityStatus
  workHours: string
  timezone: Timezone
  permissions?: PermissionLevel
  metadata?: MemberMetadata
}

export interface MemberMetadata {
  bio?: string
  linkedIn?: string
  github?: string
  portfolio?: string
  certifications?: string[]
  languages?: string[]
  yearsOfExperience?: number
  hourlyRate?: number
  preferredProjects?: string[]
  lastActive?: Date
}

export interface TeamInvitation {
  id: string
  email: string
  name: string
  role: MemberRole
  department: Department
  invitedBy: string
  invitedAt: Date
  expiresAt: Date
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  message?: string
}

export interface TeamProject {
  id: string
  name: string
  description: string
  memberIds: string[]
  startDate: Date
  endDate?: Date
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled'
  progress: number
}

export interface TeamTask {
  id: string
  title: string
  description: string
  assignedTo: string
  projectId: string
  status: 'todo' | 'in-progress' | 'review' | 'completed' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: Date
  completedAt?: Date
}

export interface PerformanceMetrics {
  memberId: string
  period: 'week' | 'month' | 'quarter' | 'year'
  tasksCompleted: number
  projectsCompleted: number
  averageTaskTime: number
  onTimeDelivery: number
  qualityScore: number
  collaborationScore: number
  clientSatisfaction: number
  skillGrowth: number
}

export interface TeamMeeting {
  id: string
  title: string
  description: string
  startTime: Date
  endTime: Date
  attendees: string[]
  organizer: string
  meetingLink?: string
  agenda?: string[]
  notes?: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
}

export interface TeamCommunication {
  id: string
  type: 'message' | 'email' | 'video-call' | 'announcement'
  from: string
  to: string[]
  subject?: string
  content: string
  timestamp: Date
  read: boolean
  attachments?: string[]
}

export interface SkillSet {
  skill: string
  category: 'technical' | 'soft' | 'tool' | 'language' | 'domain'
  proficiency: 1 | 2 | 3 | 4 | 5
  yearsOfExperience: number
  certifications?: string[]
}

export interface TimeTracking {
  memberId: string
  date: Date
  hoursWorked: number
  projectId: string
  taskId?: string
  description: string
  billable: boolean
}

export interface TeamAnalytics {
  period: 'week' | 'month' | 'quarter' | 'year'
  totalMembers: number
  activeMembers: number
  onlineMembers: number
  totalProjects: number
  totalTasks: number
  completedTasks: number
  averageRating: number
  averageResponseTime: number
  utilizationRate: number
  retentionRate: number
  skillCoverage: Record<string, number>
  departmentDistribution: Record<Department, number>
}

export interface Permission {
  resource: string
  actions: ('create' | 'read' | 'update' | 'delete' | 'share' | 'manage')[]
  level: PermissionLevel
}

// ============================================
// MOCK DATA
// ============================================

export const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Lead Designer',
    department: 'Design',
    email: 'sarah@company.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    status: 'online',
    joinDate: '2023-01-15',
    projects: 12,
    completedTasks: 156,
    rating: 4.9,
    skills: ['UI/UX', 'Figma', 'Sketch', 'Adobe XD', 'Prototyping', 'Design Systems'],
    availability: 'Available',
    workHours: '9:00 AM - 6:00 PM PST',
    timezone: 'PST',
    permissions: 'admin',
    metadata: {
      bio: 'Passionate designer with 8+ years of experience',
      linkedIn: 'linkedin.com/in/sarahjohnson',
      portfolio: 'sarahjohnson.design',
      certifications: ['Google UX Design', 'Nielsen Norman UX Certification'],
      languages: ['English', 'Spanish'],
      yearsOfExperience: 8,
      hourlyRate: 95,
      preferredProjects: ['Web Design', 'Mobile Apps', 'Design Systems']
    }
  },
  {
    id: '2',
    name: 'Mike Chen',
    role: 'Frontend Developer',
    department: 'Development',
    email: 'mike@company.com',
    phone: '+1 (555) 234-5678',
    location: 'New York, NY',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    status: 'busy',
    joinDate: '2023-03-20',
    projects: 8,
    completedTasks: 203,
    rating: 4.8,
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Node.js', 'Testing'],
    availability: 'Busy until 3 PM',
    workHours: '8:00 AM - 5:00 PM EST',
    timezone: 'EST',
    permissions: 'write',
    metadata: {
      bio: 'Full-stack developer specializing in React ecosystem',
      github: 'github.com/mikechen',
      portfolio: 'mikechen.dev',
      certifications: ['AWS Certified Developer', 'React Advanced'],
      languages: ['English', 'Mandarin'],
      yearsOfExperience: 6,
      hourlyRate: 85,
      preferredProjects: ['Web Apps', 'SaaS', 'E-commerce']
    }
  },
  {
    id: '3',
    name: 'Emma Wilson',
    role: 'Project Manager',
    department: 'Management',
    email: 'emma@company.com',
    phone: '+1 (555) 345-6789',
    location: 'Austin, TX',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    status: 'away',
    joinDate: '2022-11-10',
    projects: 15,
    completedTasks: 89,
    rating: 4.7,
    skills: ['Project Management', 'Agile', 'Scrum', 'Jira', 'Stakeholder Management', 'Risk Management'],
    availability: 'In Meeting',
    workHours: '9:00 AM - 6:00 PM CST',
    timezone: 'CST',
    permissions: 'admin',
    metadata: {
      bio: 'Certified Scrum Master with track record of successful deliveries',
      linkedIn: 'linkedin.com/in/emmawilson',
      certifications: ['PMP', 'Certified Scrum Master', 'SAFe Agilist'],
      languages: ['English'],
      yearsOfExperience: 10,
      hourlyRate: 90,
      preferredProjects: ['Enterprise', 'Digital Transformation', 'Product Launch']
    }
  },
  {
    id: '4',
    name: 'David Kim',
    role: 'Backend Developer',
    department: 'Development',
    email: 'david@company.com',
    phone: '+1 (555) 456-7890',
    location: 'Seattle, WA',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    status: 'offline',
    joinDate: '2023-05-01',
    projects: 6,
    completedTasks: 134,
    rating: 4.6,
    skills: ['Node.js', 'Python', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker'],
    availability: 'Offline',
    workHours: '10:00 AM - 7:00 PM PST',
    timezone: 'PST',
    permissions: 'write',
    metadata: {
      bio: 'Backend specialist with focus on scalable systems',
      github: 'github.com/davidkim',
      certifications: ['AWS Solutions Architect', 'MongoDB Certified'],
      languages: ['English', 'Korean'],
      yearsOfExperience: 5,
      hourlyRate: 80,
      preferredProjects: ['APIs', 'Microservices', 'Data Engineering']
    }
  },
  {
    id: '5',
    name: 'Lisa Brown',
    role: 'Marketing Specialist',
    department: 'Marketing',
    email: 'lisa@company.com',
    phone: '+1 (555) 567-8901',
    location: 'Miami, FL',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    status: 'online',
    joinDate: '2023-07-15',
    projects: 10,
    completedTasks: 67,
    rating: 4.5,
    skills: ['Content Marketing', 'SEO', 'Analytics', 'Social Media', 'Email Marketing', 'Copywriting'],
    availability: 'Available',
    workHours: '9:00 AM - 6:00 PM EST',
    timezone: 'EST',
    permissions: 'write',
    metadata: {
      bio: 'Digital marketing expert with data-driven approach',
      linkedIn: 'linkedin.com/in/lisabrown',
      certifications: ['Google Analytics', 'HubSpot Inbound', 'Facebook Blueprint'],
      languages: ['English'],
      yearsOfExperience: 4,
      hourlyRate: 70,
      preferredProjects: ['Content Strategy', 'Growth Marketing', 'Brand Building']
    }
  },
  {
    id: '6',
    name: 'Alex Rivera',
    role: 'QA Engineer',
    department: 'Quality Assurance',
    email: 'alex@company.com',
    phone: '+1 (555) 678-9012',
    location: 'Denver, CO',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    status: 'online',
    joinDate: '2023-09-01',
    projects: 7,
    completedTasks: 98,
    rating: 4.8,
    skills: ['Manual Testing', 'Automation', 'Selenium', 'Jest', 'Cypress', 'Performance Testing'],
    availability: 'Available',
    workHours: '8:00 AM - 5:00 PM MST',
    timezone: 'MST',
    permissions: 'write',
    metadata: {
      bio: 'QA specialist focused on automated testing',
      github: 'github.com/alexrivera',
      certifications: ['ISTQB Certified', 'Selenium WebDriver'],
      languages: ['English', 'Spanish'],
      yearsOfExperience: 3,
      hourlyRate: 65,
      preferredProjects: ['Test Automation', 'CI/CD', 'Quality Frameworks']
    }
  }
]

export const mockInvitations: TeamInvitation[] = [
  {
    id: '1',
    email: 'john.doe@example.com',
    name: 'John Doe',
    role: 'Frontend Developer',
    department: 'Development',
    invitedBy: '1',
    invitedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    status: 'pending',
    message: 'Join our team to work on exciting React projects!'
  },
  {
    id: '2',
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    role: 'UI/UX Designer',
    department: 'Design',
    invitedBy: '3',
    invitedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: 'expired'
  }
]

export const mockProjects: TeamProject[] = [
  {
    id: '1',
    name: 'E-commerce Platform Redesign',
    description: 'Complete redesign of the e-commerce platform with modern UI/UX',
    memberIds: ['1', '2', '4'],
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-04-15'),
    status: 'active',
    progress: 65
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'Native mobile app for iOS and Android',
    memberIds: ['2', '4', '6'],
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-06-30'),
    status: 'active',
    progress: 45
  },
  {
    id: '3',
    name: 'Marketing Campaign Q1',
    description: 'Comprehensive marketing campaign for Q1 2024',
    memberIds: ['5'],
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-03-31'),
    status: 'completed',
    progress: 100
  }
]

export const mockTasks: TeamTask[] = [
  {
    id: '1',
    title: 'Design homepage mockups',
    description: 'Create high-fidelity mockups for the new homepage',
    assignedTo: '1',
    projectId: '1',
    status: 'completed',
    priority: 'high',
    completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    id: '2',
    title: 'Implement authentication system',
    description: 'Build secure authentication with JWT',
    assignedTo: '4',
    projectId: '1',
    status: 'in-progress',
    priority: 'urgent',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  },
  {
    id: '3',
    title: 'Setup automated testing',
    description: 'Configure Jest and Cypress for testing',
    assignedTo: '6',
    projectId: '2',
    status: 'review',
    priority: 'medium',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  }
]

export const mockPerformanceMetrics: PerformanceMetrics[] = [
  {
    memberId: '1',
    period: 'month',
    tasksCompleted: 42,
    projectsCompleted: 3,
    averageTaskTime: 4.5,
    onTimeDelivery: 95,
    qualityScore: 4.8,
    collaborationScore: 4.9,
    clientSatisfaction: 4.7,
    skillGrowth: 15
  },
  {
    memberId: '2',
    period: 'month',
    tasksCompleted: 38,
    projectsCompleted: 2,
    averageTaskTime: 5.2,
    onTimeDelivery: 90,
    qualityScore: 4.7,
    collaborationScore: 4.6,
    clientSatisfaction: 4.8,
    skillGrowth: 12
  }
]

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get status color class
 */
export function getStatusColor(status: MemberStatus): string {
  switch (status) {
    case 'online':
      return 'bg-green-500'
    case 'busy':
      return 'bg-yellow-500'
    case 'away':
      return 'bg-orange-500'
    case 'offline':
      return 'bg-gray-500'
    default:
      return 'bg-gray-500'
  }
}

/**
 * Get status icon name
 */
export function getStatusIcon(status: MemberStatus): string {
  switch (status) {
    case 'online':
      return 'CheckCircle'
    case 'busy':
      return 'AlertCircle'
    case 'away':
      return 'Clock'
    case 'offline':
      return 'XCircle'
    default:
      return 'XCircle'
  }
}

/**
 * Filter team members by status
 */
export function filterMembersByStatus(
  members: TeamMember[],
  status: MemberStatus
): TeamMember[] {
  return members.filter(m => m.status === status)
}

/**
 * Filter team members by department
 */
export function filterMembersByDepartment(
  members: TeamMember[],
  department: Department
): TeamMember[] {
  return members.filter(m => m.department === department)
}

/**
 * Filter team members by role
 */
export function filterMembersByRole(
  members: TeamMember[],
  role: MemberRole
): TeamMember[] {
  return members.filter(m => m.role === role)
}

/**
 * Search team members
 */
export function searchTeamMembers(
  members: TeamMember[],
  query: string
): TeamMember[] {
  const lowerQuery = query.toLowerCase()
  return members.filter(m =>
    m.name.toLowerCase().includes(lowerQuery) ||
    m.role.toLowerCase().includes(lowerQuery) ||
    m.department.toLowerCase().includes(lowerQuery) ||
    m.email.toLowerCase().includes(lowerQuery) ||
    m.skills.some(skill => skill.toLowerCase().includes(lowerQuery))
  )
}

/**
 * Sort team members
 */
export function sortTeamMembers(
  members: TeamMember[],
  sortBy: 'name' | 'role' | 'rating' | 'projects' | 'tasks' | 'joinDate'
): TeamMember[] {
  const sorted = [...members]

  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
    case 'role':
      return sorted.sort((a, b) => a.role.localeCompare(b.role))
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating)
    case 'projects':
      return sorted.sort((a, b) => b.projects - a.projects)
    case 'tasks':
      return sorted.sort((a, b) => b.completedTasks - a.completedTasks)
    case 'joinDate':
      return sorted.sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())
    default:
      return sorted
  }
}

/**
 * Get members by skill
 */
export function getMembersBySkill(
  members: TeamMember[],
  skill: string
): TeamMember[] {
  return members.filter(m =>
    m.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
  )
}

/**
 * Get available members
 */
export function getAvailableMembers(members: TeamMember[]): TeamMember[] {
  return members.filter(m =>
    m.status === 'online' &&
    m.availability === 'Available'
  )
}

/**
 * Calculate team statistics
 */
export function calculateTeamStats(members: TeamMember[]): {
  totalMembers: number
  onlineMembers: number
  activeProjects: number
  completedTasks: number
  averageRating: number
  busyMembers: number
  availableMembers: number
} {
  return {
    totalMembers: members.length,
    onlineMembers: members.filter(m => m.status === 'online').length,
    activeProjects: members.reduce((sum, m) => sum + m.projects, 0),
    completedTasks: members.reduce((sum, m) => sum + m.completedTasks, 0),
    averageRating: members.reduce((sum, m) => sum + m.rating, 0) / members.length,
    busyMembers: members.filter(m => m.status === 'busy').length,
    availableMembers: members.filter(m => m.availability === 'Available').length
  }
}

/**
 * Get department distribution
 */
export function getDepartmentDistribution(
  members: TeamMember[]
): Record<Department, number> {
  const distribution: Record<Department, number> = {
    'Design': 0,
    'Development': 0,
    'Management': 0,
    'Marketing': 0,
    'Quality Assurance': 0,
    'Content': 0,
    'Operations': 0,
    'Analytics': 0,
    'Sales': 0,
    'Support': 0
  }

  members.forEach(m => {
    distribution[m.department]++
  })

  return distribution
}

/**
 * Get skill coverage
 */
export function getSkillCoverage(members: TeamMember[]): Record<string, number> {
  const skills: Record<string, number> = {}

  members.forEach(m => {
    m.skills.forEach(skill => {
      skills[skill] = (skills[skill] || 0) + 1
    })
  })

  return skills
}

/**
 * Find best match for skill requirement
 */
export function findBestMatch(
  members: TeamMember[],
  requiredSkills: string[],
  availableOnly: boolean = true
): TeamMember | null {
  let candidates = availableOnly ? getAvailableMembers(members) : members

  let bestMatch: TeamMember | null = null
  let maxMatchCount = 0

  candidates.forEach(member => {
    const matchCount = requiredSkills.filter(skill =>
      member.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
    ).length

    if (matchCount > maxMatchCount) {
      maxMatchCount = matchCount
      bestMatch = member
    }
  })

  return maxMatchCount > 0 ? bestMatch : null
}

/**
 * Calculate member utilization
 */
export function calculateMemberUtilization(
  member: TeamMember,
  maxProjects: number = 5
): number {
  return Math.min((member.projects / maxProjects) * 100, 100)
}

/**
 * Get member initials
 */
export function getMemberInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

/**
 * Format work hours
 */
export function formatWorkHours(workHours: string, timezone: Timezone): string {
  return `${workHours} ${timezone}`
}

/**
 * Check if member is active
 */
export function isMemberActive(member: TeamMember): boolean {
  return member.status === 'online' || member.status === 'busy' || member.status === 'away'
}

/**
 * Get permission level label
 */
export function getPermissionLabel(level: PermissionLevel): string {
  switch (level) {
    case 'owner':
      return 'Owner'
    case 'admin':
      return 'Administrator'
    case 'write':
      return 'Editor'
    case 'read':
      return 'Viewer'
    default:
      return 'Unknown'
  }
}

/**
 * Can perform action
 */
export function canPerformAction(
  memberPermission: PermissionLevel,
  requiredPermission: PermissionLevel
): boolean {
  const levels: PermissionLevel[] = ['read', 'write', 'admin', 'owner']
  const memberLevel = levels.indexOf(memberPermission)
  const requiredLevel = levels.indexOf(requiredPermission)
  return memberLevel >= requiredLevel
}

/**
 * Format join date
 */
export function formatJoinDate(joinDate: string): string {
  const date = new Date(joinDate)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 30) {
    return `${diffDays} days ago`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months} ${months === 1 ? 'month' : 'months'} ago`
  } else {
    const years = Math.floor(diffDays / 365)
    return `${years} ${years === 1 ? 'year' : 'years'} ago`
  }
}

/**
 * Get member workload
 */
export function getMemberWorkload(
  member: TeamMember,
  tasks: TeamTask[]
): {
  total: number
  todo: number
  inProgress: number
  review: number
  blocked: number
} {
  const memberTasks = tasks.filter(t => t.assignedTo === member.id)

  return {
    total: memberTasks.length,
    todo: memberTasks.filter(t => t.status === 'todo').length,
    inProgress: memberTasks.filter(t => t.status === 'in-progress').length,
    review: memberTasks.filter(t => t.status === 'review').length,
    blocked: memberTasks.filter(t => t.status === 'blocked').length
  }
}

/**
 * Export team to CSV
 */
export function exportTeamToCSV(members: TeamMember[]): string {
  const headers = ['Name', 'Role', 'Department', 'Email', 'Location', 'Projects', 'Tasks', 'Rating', 'Status']
  const rows = members.map(m => [
    m.name,
    m.role,
    m.department,
    m.email,
    m.location,
    m.projects.toString(),
    m.completedTasks.toString(),
    m.rating.toString(),
    m.status
  ])

  return [headers, ...rows].map(row => row.join(',')).join('\n')
}

/**
 * Get project members
 */
export function getProjectMembers(
  project: TeamProject,
  allMembers: TeamMember[]
): TeamMember[] {
  return allMembers.filter(m => project.memberIds.includes(m.id))
}

/**
 * Calculate project progress
 */
export function calculateProjectProgress(
  project: TeamProject,
  tasks: TeamTask[]
): number {
  const projectTasks = tasks.filter(t => t.projectId === project.id)
  if (projectTasks.length === 0) return 0

  const completedTasks = projectTasks.filter(t => t.status === 'completed').length
  return Math.round((completedTasks / projectTasks.length) * 100)
}

/**
 * Get upcoming meetings for member
 */
export function getUpcomingMeetings(
  memberId: string,
  meetings: TeamMeeting[],
  limit: number = 5
): TeamMeeting[] {
  const now = new Date()
  return meetings
    .filter(m =>
      m.attendees.includes(memberId) &&
      m.startTime > now &&
      m.status === 'scheduled'
    )
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    .slice(0, limit)
}

/**
 * Get unread messages count
 */
export function getUnreadMessagesCount(
  memberId: string,
  communications: TeamCommunication[]
): number {
  return communications.filter(c =>
    c.to.includes(memberId) &&
    !c.read
  ).length
}

/**
 * Calculate team collaboration score
 */
export function calculateCollaborationScore(
  member: TeamMember,
  communications: TeamCommunication[]
): number {
  const memberCommunications = communications.filter(c =>
    c.from === member.id || c.to.includes(member.id)
  )

  const responseTime = memberCommunications.filter(c => c.from === member.id).length
  const interactions = memberCommunications.length

  // Simple formula: normalize to 0-5 scale
  return Math.min((interactions / 100) * 5, 5)
}

/**
 * Get skill gap analysis
 */
export function getSkillGapAnalysis(
  members: TeamMember[],
  requiredSkills: string[]
): {
  skill: string
  memberCount: number
  gap: number
}[] {
  return requiredSkills.map(skill => {
    const memberCount = members.filter(m =>
      m.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
    ).length

    return {
      skill,
      memberCount,
      gap: Math.max(3 - memberCount, 0) // Assuming 3 is ideal
    }
  })
}

/**
 * Recommend team for project
 */
export function recommendTeamForProject(
  members: TeamMember[],
  requiredSkills: string[],
  teamSize: number
): TeamMember[] {
  const scored = members.map(member => {
    const skillMatches = requiredSkills.filter(skill =>
      member.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
    ).length

    const availabilityScore = member.availability === 'Available' ? 2 : 0
    const utilizationScore = member.projects < 3 ? 2 : 0
    const ratingScore = member.rating

    return {
      member,
      score: skillMatches * 3 + availabilityScore + utilizationScore + ratingScore
    }
  })

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, teamSize)
    .map(s => s.member)
}

// Export all functions
export default {
  // Mock data
  mockTeamMembers,
  mockInvitations,
  mockProjects,
  mockTasks,
  mockPerformanceMetrics,

  // Helper functions
  getStatusColor,
  getStatusIcon,
  filterMembersByStatus,
  filterMembersByDepartment,
  filterMembersByRole,
  searchTeamMembers,
  sortTeamMembers,
  getMembersBySkill,
  getAvailableMembers,
  calculateTeamStats,
  getDepartmentDistribution,
  getSkillCoverage,
  findBestMatch,
  calculateMemberUtilization,
  getMemberInitials,
  formatWorkHours,
  isMemberActive,
  getPermissionLabel,
  canPerformAction,
  formatJoinDate,
  getMemberWorkload,
  exportTeamToCSV,
  getProjectMembers,
  calculateProjectProgress,
  getUpcomingMeetings,
  getUnreadMessagesCount,
  calculateCollaborationScore,
  getSkillGapAnalysis,
  recommendTeamForProject
}
