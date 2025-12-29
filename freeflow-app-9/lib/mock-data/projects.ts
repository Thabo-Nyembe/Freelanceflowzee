// Project & Task Data - Used across project management, kanban, sprints
// References customers and team members for consistency

export interface Project {
  id: string
  name: string
  description: string
  client?: string
  clientId?: string
  status: 'active' | 'completed' | 'on-hold' | 'planning' | 'cancelled'
  priority: 'critical' | 'high' | 'medium' | 'low'
  type: 'internal' | 'client' | 'product'
  progress: number
  budget: number
  spent: number
  startDate: string
  dueDate: string
  completedDate?: string
  owner: string
  ownerId: string
  team: string[]
  tags: string[]
  tasks: { total: number; completed: number }
  health: 'on-track' | 'at-risk' | 'behind'
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  title: string
  description: string
  projectId: string
  projectName: string
  status: 'backlog' | 'todo' | 'in-progress' | 'review' | 'done'
  priority: 'critical' | 'high' | 'medium' | 'low'
  assignee: string
  assigneeId: string
  dueDate: string
  estimatedHours: number
  actualHours: number
  tags: string[]
  subtasks: { total: number; completed: number }
  comments: number
  attachments: number
  createdAt: string
  updatedAt: string
}

export interface Sprint {
  id: string
  name: string
  goal: string
  status: 'planning' | 'active' | 'completed' | 'cancelled'
  startDate: string
  endDate: string
  totalPoints: number
  completedPoints: number
  tasks: { total: number; completed: number; inProgress: number }
  velocity: number
  team: string[]
}

// Active Projects
export const PROJECTS: Project[] = [
  {
    id: 'proj-001',
    name: 'AI Content Generator v2',
    description: 'Next-generation AI-powered content creation with GPT-4 integration',
    status: 'active',
    priority: 'critical',
    type: 'product',
    progress: 72,
    budget: 150000,
    spent: 108000,
    startDate: '2024-10-01',
    dueDate: '2025-02-28',
    owner: 'Marcus Williams',
    ownerId: 'team-002',
    team: ['team-002', 'team-006', 'team-008', 'team-007'],
    tags: ['ai', 'core-feature', 'q1-priority'],
    tasks: { total: 124, completed: 89 },
    health: 'on-track',
    createdAt: '2024-09-15',
    updatedAt: '2025-01-28T14:30:00Z'
  },
  {
    id: 'proj-002',
    name: 'Spotify Integration',
    description: 'Custom enterprise integration for Spotify creative operations team',
    client: 'Spotify',
    clientId: 'comp-001',
    status: 'active',
    priority: 'high',
    type: 'client',
    progress: 45,
    budget: 85000,
    spent: 38250,
    startDate: '2024-12-01',
    dueDate: '2025-03-15',
    owner: 'Jennifer Walsh',
    ownerId: 'team-003',
    team: ['team-006', 'team-010', 'team-008'],
    tags: ['enterprise', 'integration', 'priority-client'],
    tasks: { total: 67, completed: 30 },
    health: 'on-track',
    createdAt: '2024-11-20',
    updatedAt: '2025-01-28T10:15:00Z'
  },
  {
    id: 'proj-003',
    name: 'Nike Global Rollout',
    description: 'Phase 2 deployment across Nike global creative teams',
    client: 'Nike',
    clientId: 'comp-002',
    status: 'active',
    priority: 'high',
    type: 'client',
    progress: 28,
    budget: 220000,
    spent: 61600,
    startDate: '2025-01-15',
    dueDate: '2025-06-30',
    owner: 'Michael Chen',
    ownerId: 'team-005',
    team: ['team-005', 'team-009', 'team-010'],
    tags: ['enterprise', 'global', 'expansion'],
    tasks: { total: 156, completed: 44 },
    health: 'on-track',
    createdAt: '2025-01-10',
    updatedAt: '2025-01-28T11:00:00Z'
  },
  {
    id: 'proj-004',
    name: 'Mobile App Redesign',
    description: 'Complete redesign of iOS and Android mobile applications',
    status: 'active',
    priority: 'high',
    type: 'product',
    progress: 58,
    budget: 95000,
    spent: 55100,
    startDate: '2024-11-01',
    dueDate: '2025-02-15',
    owner: 'Lisa Park',
    ownerId: 'team-008',
    team: ['team-008', 'team-006', 'team-007'],
    tags: ['mobile', 'design', 'ux'],
    tasks: { total: 89, completed: 52 },
    health: 'at-risk',
    createdAt: '2024-10-20',
    updatedAt: '2025-01-27T16:45:00Z'
  },
  {
    id: 'proj-005',
    name: 'Enterprise SSO Implementation',
    description: 'SAML and OIDC single sign-on for enterprise customers',
    status: 'active',
    priority: 'critical',
    type: 'product',
    progress: 85,
    budget: 45000,
    spent: 38250,
    startDate: '2024-11-15',
    dueDate: '2025-01-31',
    owner: 'David Thompson',
    ownerId: 'team-011',
    team: ['team-011', 'team-006'],
    tags: ['security', 'enterprise', 'compliance'],
    tasks: { total: 34, completed: 29 },
    health: 'on-track',
    createdAt: '2024-11-10',
    updatedAt: '2025-01-28T09:30:00Z'
  },
  {
    id: 'proj-006',
    name: 'Q1 Marketing Campaign',
    description: 'Integrated marketing campaign for Q1 2025 product launch',
    status: 'active',
    priority: 'medium',
    type: 'internal',
    progress: 62,
    budget: 125000,
    spent: 77500,
    startDate: '2024-12-15',
    dueDate: '2025-03-31',
    owner: 'Sarah Johnson',
    ownerId: 'team-004',
    team: ['team-004', 'team-012', 'team-008'],
    tags: ['marketing', 'campaign', 'brand'],
    tasks: { total: 78, completed: 48 },
    health: 'on-track',
    createdAt: '2024-12-01',
    updatedAt: '2025-01-28T13:00:00Z'
  },
  {
    id: 'proj-007',
    name: 'Analytics Dashboard v3',
    description: 'Real-time analytics with predictive insights',
    status: 'planning',
    priority: 'medium',
    type: 'product',
    progress: 12,
    budget: 75000,
    spent: 9000,
    startDate: '2025-02-01',
    dueDate: '2025-05-15',
    owner: 'Robert Kim',
    ownerId: 'team-007',
    team: ['team-007', 'team-006', 'team-008'],
    tags: ['analytics', 'feature', 'roadmap'],
    tasks: { total: 45, completed: 5 },
    health: 'on-track',
    createdAt: '2025-01-15',
    updatedAt: '2025-01-28T08:00:00Z'
  },
  {
    id: 'proj-008',
    name: 'Shopify API Integration',
    description: 'Seamless integration with Shopify e-commerce platform',
    client: 'Shopify',
    clientId: 'comp-003',
    status: 'completed',
    priority: 'high',
    type: 'client',
    progress: 100,
    budget: 65000,
    spent: 58500,
    startDate: '2024-08-01',
    dueDate: '2024-11-30',
    completedDate: '2024-11-25',
    owner: 'Jennifer Walsh',
    ownerId: 'team-003',
    team: ['team-006', 'team-010'],
    tags: ['integration', 'api', 'completed'],
    tasks: { total: 52, completed: 52 },
    health: 'on-track',
    createdAt: '2024-07-20',
    updatedAt: '2024-11-25T17:00:00Z'
  },
]

// Current Tasks
export const TASKS: Task[] = [
  {
    id: 'task-001',
    title: 'Implement GPT-4 streaming response handler',
    description: 'Add streaming support for real-time AI responses',
    projectId: 'proj-001',
    projectName: 'AI Content Generator v2',
    status: 'in-progress',
    priority: 'critical',
    assignee: 'Emily Davis',
    assigneeId: 'team-006',
    dueDate: '2025-01-30',
    estimatedHours: 16,
    actualHours: 12,
    tags: ['ai', 'backend', 'streaming'],
    subtasks: { total: 4, completed: 3 },
    comments: 8,
    attachments: 2,
    createdAt: '2025-01-20',
    updatedAt: '2025-01-28T14:30:00Z'
  },
  {
    id: 'task-002',
    title: 'Design AI generation interface',
    description: 'Create new UI for content generation workflow',
    projectId: 'proj-001',
    projectName: 'AI Content Generator v2',
    status: 'review',
    priority: 'high',
    assignee: 'Lisa Park',
    assigneeId: 'team-008',
    dueDate: '2025-01-29',
    estimatedHours: 24,
    actualHours: 20,
    tags: ['design', 'ui', 'ai'],
    subtasks: { total: 6, completed: 5 },
    comments: 12,
    attachments: 8,
    createdAt: '2025-01-15',
    updatedAt: '2025-01-28T11:00:00Z'
  },
  {
    id: 'task-003',
    title: 'Set up Spotify sandbox environment',
    description: 'Configure development environment for Spotify integration testing',
    projectId: 'proj-002',
    projectName: 'Spotify Integration',
    status: 'done',
    priority: 'high',
    assignee: 'David Thompson',
    assigneeId: 'team-011',
    dueDate: '2025-01-25',
    estimatedHours: 8,
    actualHours: 6,
    tags: ['devops', 'integration', 'setup'],
    subtasks: { total: 3, completed: 3 },
    comments: 4,
    attachments: 1,
    createdAt: '2025-01-20',
    updatedAt: '2025-01-25T16:00:00Z'
  },
  {
    id: 'task-004',
    title: 'SSO SAML configuration',
    description: 'Implement SAML 2.0 identity provider configuration',
    projectId: 'proj-005',
    projectName: 'Enterprise SSO Implementation',
    status: 'in-progress',
    priority: 'critical',
    assignee: 'David Thompson',
    assigneeId: 'team-011',
    dueDate: '2025-01-31',
    estimatedHours: 12,
    actualHours: 8,
    tags: ['security', 'sso', 'enterprise'],
    subtasks: { total: 5, completed: 3 },
    comments: 6,
    attachments: 3,
    createdAt: '2025-01-22',
    updatedAt: '2025-01-28T10:00:00Z'
  },
  {
    id: 'task-005',
    title: 'Mobile navigation redesign',
    description: 'Implement new bottom navigation pattern for mobile app',
    projectId: 'proj-004',
    projectName: 'Mobile App Redesign',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Lisa Park',
    assigneeId: 'team-008',
    dueDate: '2025-02-05',
    estimatedHours: 16,
    actualHours: 6,
    tags: ['mobile', 'navigation', 'ux'],
    subtasks: { total: 4, completed: 1 },
    comments: 5,
    attachments: 4,
    createdAt: '2025-01-25',
    updatedAt: '2025-01-28T09:30:00Z'
  },
  {
    id: 'task-006',
    title: 'Write AI feature launch blog post',
    description: 'Create compelling blog content for AI feature announcement',
    projectId: 'proj-006',
    projectName: 'Q1 Marketing Campaign',
    status: 'todo',
    priority: 'medium',
    assignee: 'Sophie Anderson',
    assigneeId: 'team-012',
    dueDate: '2025-02-10',
    estimatedHours: 8,
    actualHours: 0,
    tags: ['content', 'blog', 'ai'],
    subtasks: { total: 3, completed: 0 },
    comments: 2,
    attachments: 1,
    createdAt: '2025-01-26',
    updatedAt: '2025-01-26T14:00:00Z'
  },
  {
    id: 'task-007',
    title: 'Nike training materials',
    description: 'Prepare onboarding and training documentation for Nike team',
    projectId: 'proj-003',
    projectName: 'Nike Global Rollout',
    status: 'todo',
    priority: 'high',
    assignee: 'Anna Martinez',
    assigneeId: 'team-010',
    dueDate: '2025-02-15',
    estimatedHours: 20,
    actualHours: 0,
    tags: ['training', 'documentation', 'onboarding'],
    subtasks: { total: 8, completed: 0 },
    comments: 3,
    attachments: 0,
    createdAt: '2025-01-27',
    updatedAt: '2025-01-27T11:00:00Z'
  },
  {
    id: 'task-008',
    title: 'API rate limiting implementation',
    description: 'Add rate limiting to public API endpoints',
    projectId: 'proj-001',
    projectName: 'AI Content Generator v2',
    status: 'backlog',
    priority: 'medium',
    assignee: 'Emily Davis',
    assigneeId: 'team-006',
    dueDate: '2025-02-28',
    estimatedHours: 8,
    actualHours: 0,
    tags: ['api', 'security', 'performance'],
    subtasks: { total: 2, completed: 0 },
    comments: 1,
    attachments: 0,
    createdAt: '2025-01-28',
    updatedAt: '2025-01-28T08:00:00Z'
  },
]

// Current Sprint
export const CURRENT_SPRINT: Sprint = {
  id: 'sprint-024',
  name: 'Sprint 24 - AI Launch Prep',
  goal: 'Complete AI content generator MVP and prepare for beta launch',
  status: 'active',
  startDate: '2025-01-20',
  endDate: '2025-02-02',
  totalPoints: 89,
  completedPoints: 52,
  tasks: { total: 24, completed: 14, inProgress: 6 },
  velocity: 72,
  team: ['team-002', 'team-006', 'team-008', 'team-007']
}

// Sprint History
export const SPRINT_HISTORY: Sprint[] = [
  {
    id: 'sprint-023',
    name: 'Sprint 23 - SSO & Security',
    goal: 'Enterprise SSO foundation and security improvements',
    status: 'completed',
    startDate: '2025-01-06',
    endDate: '2025-01-19',
    totalPoints: 76,
    completedPoints: 71,
    tasks: { total: 21, completed: 20, inProgress: 0 },
    velocity: 71,
    team: ['team-002', 'team-006', 'team-011']
  },
  {
    id: 'sprint-022',
    name: 'Sprint 22 - Mobile Polish',
    goal: 'Mobile app UI polish and performance optimization',
    status: 'completed',
    startDate: '2024-12-23',
    endDate: '2025-01-05',
    totalPoints: 68,
    completedPoints: 65,
    tasks: { total: 18, completed: 17, inProgress: 0 },
    velocity: 65,
    team: ['team-006', 'team-008']
  },
]

// Project stats
export const PROJECT_STATS = {
  totalProjects: 8,
  activeProjects: 6,
  completedThisMonth: 1,
  onTrack: 5,
  atRisk: 1,
  totalBudget: 860000,
  totalSpent: 386200,
  avgProgress: 52,
  totalTasks: 645,
  completedTasks: 349,
}

// Kanban board configuration
export const KANBAN_COLUMNS = [
  { id: 'backlog', title: 'Backlog', color: 'gray', limit: null },
  { id: 'todo', title: 'To Do', color: 'blue', limit: 10 },
  { id: 'in-progress', title: 'In Progress', color: 'yellow', limit: 5 },
  { id: 'review', title: 'Review', color: 'purple', limit: 5 },
  { id: 'done', title: 'Done', color: 'green', limit: null },
]
