// Projects API service for real data integration
export interface Project {
  id: string
  title: string
  description: string
  status: 'active' | 'paused' | 'completed' | 'cancelled' | 'draft'
  progress: number
  client_name: string
  budget: number
  spent: number
  start_date: string
  end_date: string
  team_members: Array<{
    id: string
    name: string
    avatar: string
    role?: string
  }>
  priority: 'low' | 'medium' | 'high' | 'urgent'
  comments_count: number
  attachments: any[]
  tags?: string[]
  tasks?: {
    total: number
    completed: number
  }
}

export interface ProjectStats {
  total: number
  active: number
  completed: number
  totalBudget: number
  totalSpent: number
  totalEarned: number
}

class ProjectsAPI {
  private baseUrl = '/api/projects'

  async getProjects(filters?: {
    search?: string
    status?: string
    priority?: string
    clientId?: string
    limit?: number
    offset?: number
  }): Promise<Project[]> {
    try {
      const params = new URLSearchParams()
      if (filters?.search) params.append('search', filters.search)
      if (filters?.status) params.append('status', filters.status)
      if (filters?.priority) params.append('priority', filters.priority)
      if (filters?.clientId) params.append('clientId', filters.clientId)
      if (filters?.limit) params.append('limit', filters.limit.toString())
      if (filters?.offset) params.append('offset', filters.offset.toString())

      const response = await fetch(`${this.baseUrl}?${params}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      return this.getMockProjects()
    }
  }

  async getProject(id: string): Promise<Project | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`)
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch project:', error)
      return this.getMockProjects().find(p => p.id === id) || null
    }
  }

  async createProject(project: Omit<Project, 'id' | 'comments_count' | 'attachments'>): Promise<Project> {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(project),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Failed to create project:', error)
      // Fallback to mock creation
      return {
        ...project,
        id: `proj_${Date.now()}`,
        comments_count: 0,
        attachments: [],
      }
    }
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Failed to update project:', error)
      return null
    }
  }

  async deleteProject(id: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return { success: true }
    } catch (error) {
      console.error('Failed to delete project:', error)
      return { success: false }
    }
  }

  async getProjectStats(): Promise<ProjectStats> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch project stats:', error)
      const mockProjects = this.getMockProjects()
      return {
        total: mockProjects.length,
        active: mockProjects.filter(p => p.status === 'active').length,
        completed: mockProjects.filter(p => p.status === 'completed').length,
        totalBudget: mockProjects.reduce((sum, p) => sum + p.budget, 0),
        totalSpent: mockProjects.reduce((sum, p) => sum + p.spent, 0),
        totalEarned: mockProjects.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.budget, 0),
      }
    }
  }

  async updateProjectStatus(id: string, status: Project['status']): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return { success: true }
    } catch (error) {
      console.error('Failed to update project status:', error)
      return { success: false }
    }
  }

  async updateProjectProgress(id: string, progress: number): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ progress }),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return { success: true }
    } catch (error) {
      console.error('Failed to update project progress:', error)
      return { success: false }
    }
  }

  async addTeamMember(projectId: string, memberId: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/${projectId}/team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memberId }),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return { success: true }
    } catch (error) {
      console.error('Failed to add team member:', error)
      return { success: false }
    }
  }

  async removeTeamMember(projectId: string, memberId: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/${projectId}/team/${memberId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return { success: true }
    } catch (error) {
      console.error('Failed to remove team member:', error)
      return { success: false }
    }
  }

  private getMockProjects(): Project[] {
    return [
      {
        id: 'proj_001',
        title: 'Brand Identity Package',
        description: 'Complete brand identity design including logo, colors, typography, and brand guidelines for Acme Corp.',
        status: 'active',
        progress: 75,
        client_name: 'Acme Corp',
        budget: 5000,
        spent: 3750,
        start_date: '2024-01-15',
        end_date: '2024-03-15',
        team_members: [
          {
            id: 'user_001',
            name: 'Sarah Johnson',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
            role: 'Designer'
          },
          {
            id: 'user_002',
            name: 'Mike Chen',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
            role: 'Art Director'
          }
        ],
        priority: 'high',
        comments_count: 12,
        attachments: [{}, {}, {}],
        tags: ['branding', 'design', 'logo'],
        tasks: { total: 12, completed: 9 }
      },
      {
        id: 'proj_002',
        title: 'E-commerce Website',
        description: 'Full-stack e-commerce platform with modern design and advanced features for Tech Startup.',
        status: 'active',
        progress: 45,
        client_name: 'Tech Startup',
        budget: 15000,
        spent: 6750,
        start_date: '2024-02-01',
        end_date: '2024-05-01',
        team_members: [
          {
            id: 'user_003',
            name: 'Alex Rivera',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
            role: 'Developer'
          },
          {
            id: 'user_004',
            name: 'Emma Wilson',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
            role: 'UI/UX Designer'
          }
        ],
        priority: 'medium',
        comments_count: 8,
        attachments: [{}, {}],
        tags: ['web-development', 'ecommerce', 'react'],
        tasks: { total: 28, completed: 13 }
      },
      {
        id: 'proj_003',
        title: 'Mobile App Design',
        description: 'Native mobile app design for iOS and Android with user experience optimization.',
        status: 'completed',
        progress: 100,
        client_name: 'FinTech Solutions',
        budget: 8000,
        spent: 8000,
        start_date: '2023-11-01',
        end_date: '2024-01-30',
        team_members: [
          {
            id: 'user_005',
            name: 'David Kim',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
            role: 'Mobile Designer'
          }
        ],
        priority: 'high',
        comments_count: 15,
        attachments: [{}, {}, {}, {}],
        tags: ['mobile', 'ios', 'android', 'ux'],
        tasks: { total: 15, completed: 15 }
      }
    ]
  }
}

export const projectsAPI = new ProjectsAPI()