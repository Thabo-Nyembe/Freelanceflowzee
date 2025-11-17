'use client'

// Comprehensive demo mode for offline functionality
export const DEMO_MODE = {
  enabled: true,
  showNotifications: true
}

// Mock data generators
export const generateMockProjects = () => [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete redesign of company website',
    status: 'in_progress',
    progress: 65,
    deadline: '2025-02-15',
    team: ['Alice', 'Bob', 'Carol'],
    created_at: '2025-01-01',
    updated_at: '2025-01-12'
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'Native iOS and Android app',
    status: 'planning',
    progress: 25,
    deadline: '2025-03-30',
    team: ['David', 'Eve'],
    created_at: '2025-01-05',
    updated_at: '2025-01-12'
  },
  {
    id: '3',
    name: 'AI Integration',
    description: 'Integrate AI features into existing platform',
    status: 'completed',
    progress: 100,
    deadline: '2025-01-15',
    team: ['Frank', 'Grace', 'Henry'],
    created_at: '2024-12-01',
    updated_at: '2025-01-10'
  }
]

export const generateMockTasks = () => [
  {
    id: '1',
    title: 'Review design mockups',
    description: 'Review and approve the latest design mockups',
    completed: false,
    priority: 'high',
    due_date: '2025-01-13',
    project_id: '1',
    assigned_to: 'Alice'
  },
  {
    id: '2',
    title: 'Setup development environment',
    description: 'Configure local development environment for new team members',
    completed: true,
    priority: 'medium',
    due_date: '2025-01-12',
    project_id: '2',
    assigned_to: 'David'
  },
  {
    id: '3',
    title: 'Write API documentation',
    description: 'Document all API endpoints for the new features',
    completed: false,
    priority: 'medium',
    due_date: '2025-01-15',
    project_id: '3',
    assigned_to: 'Frank'
  }
]

export const generateMockAnalytics = () => ({
  overview: {
    totalProjects: 12,
    activeProjects: 8,
    completedProjects: 4,
    totalTasks: 156,
    completedTasks: 98,
    teamMembers: 15,
    clientSatisfaction: 4.8
  },
  chartData: {
    projectsOverTime: [
      { month: 'Jan', projects: 3, completed: 1 },
      { month: 'Feb', projects: 5, completed: 2 },
      { month: 'Mar', projects: 4, completed: 1 },
      { month: 'Apr', projects: 6, completed: 3 },
      { month: 'May', projects: 8, completed: 4 },
      { month: 'Jun', projects: 12, completed: 6 }
    ],
    taskCompletion: [
      { week: 'Week 1', completed: 23, pending: 12 },
      { week: 'Week 2', completed: 31, pending: 8 },
      { week: 'Week 3', completed: 28, pending: 15 },
      { week: 'Week 4', completed: 35, pending: 10 }
    ]
  }
})

export const generateMockFiles = () => [
  {
    id: '1',
    name: 'project-brief.pdf',
    size: '2.4 MB',
    type: 'application/pdf',
    uploaded_at: '2025-01-10T10:30:00Z',
    uploaded_by: 'Alice Johnson',
    project_id: '1',
    url: '/demo/files/project-brief.pdf'
  },
  {
    id: '2',
    name: 'wireframes.fig',
    size: '15.7 MB',
    type: 'application/figma',
    uploaded_at: '2025-01-11T14:20:00Z',
    uploaded_by: 'Bob Smith',
    project_id: '1',
    url: '/demo/files/wireframes.fig'
  },
  {
    id: '3',
    name: 'demo-video.mp4',
    size: '45.2 MB',
    type: 'video/mp4',
    uploaded_at: '2025-01-12T09:15:00Z',
    uploaded_by: 'Carol Davis',
    project_id: '2',
    url: '/demo/files/demo-video.mp4'
  }
]

export const generateMockMessages = () => [
  {
    id: '1',
    content: 'Hey team! The new designs are ready for review. Please check them out and let me know your thoughts.',
    sender: 'Alice Johnson',
    timestamp: '2025-01-12T10:30:00Z',
    channel: 'general',
    attachments: []
  },
  {
    id: '2',
    content: 'Great work on the API integration! The response times are much better now.',
    sender: 'Bob Smith',
    timestamp: '2025-01-12T11:45:00Z',
    channel: 'development',
    attachments: []
  },
  {
    id: '3',
    content: 'Client meeting scheduled for tomorrow at 2 PM. Agenda attached.',
    sender: 'Carol Davis',
    timestamp: '2025-01-12T14:20:00Z',
    channel: 'general',
    attachments: [{ name: 'meeting-agenda.pdf', size: '156 KB' }]
  }
]

// Demo mode utilities
export const showDemoNotification = (message: string) => {
  if (DEMO_MODE.showNotifications && typeof window !== 'undefined') {
    // Create a simple notification
    const notification = document.createElement('div')
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      max-width: 300px;
    `
    notification.textContent = `✅ DEMO: ${message}`
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.remove()
    }, 3000)
  }
}

export const simulateApiCall = async <T>(data: T, delay: number = 500): Promise<T> => {
  await new Promise(resolve => setTimeout(resolve, delay))
  return data
}

// Mock API responses
export const mockApiResponses = {
  createProject: (projectData: any) => ({
    id: Math.random().toString(36).substr(2, 9),
    ...projectData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }),
  
  updateProject: (id: string, updates: any) => ({
    id,
    ...updates,
    updated_at: new Date().toISOString()
  }),
  
  deleteProject: (id: string) => ({
    success: true,
    message: `Project ${id} deleted successfully`
  }),
  
  uploadFile: (fileData: any) => ({
    id: Math.random().toString(36).substr(2, 9),
    ...fileData,
    uploaded_at: new Date().toISOString(),
    url: `/demo/files/${fileData.name}`
  }),
  
  sendMessage: (messageData: any) => ({
    id: Math.random().toString(36).substr(2, 9),
    ...messageData,
    timestamp: new Date().toISOString()
  }),
  
  aiGenerate: (prompt: string) => ({
    id: Math.random().toString(36).substr(2, 9),
    prompt,
    response: `This is a demo AI response to: "${prompt}". In the real application, this would be generated by your chosen AI provider (OpenAI, Anthropic, Google AI, etc.).`,
    timestamp: new Date().toISOString(),
    model: 'demo-model-v1'
  })
}
