'use client'

import { useState, useEffect } from 'react'
import ProjectsHub from '@/components/hubs/projects-hub'

// Mock data transformer to match the expected interface
const transformMockData = (mockData: any[]) => {
  return mockData.map(project => ({
    id: project.id,
    title: project.title,
    description: project.description,
    status: project.status === 'in_review' ? 'paused' : project.status as 'active' | 'paused' | 'completed' | 'cancelled' | 'draft',
    progress: project.progress,
    client_name: project.client,
    budget: project.budget,
    spent: Math.floor(project.budget * (project.progress / 100)),
    start_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
    team_members: [
      { id: '1', name: 'John Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
      { id: '2', name: 'Jane Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane' }
    ],
    priority: ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)] as 'low' | 'medium' | 'high' | 'urgent',
    comments_count: Math.floor(Math.random() * 20),
    attachments: []
  }))
}

export default function ProjectsHubPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProjects = async () => {
      try {
        // In a real app, this would be an API call
        const mockData = await import('/public/mock-data/projects.json')
        const transformedData = transformMockData(mockData.default)
        setProjects(transformedData)
      } catch (error) {
        console.error('Error loading projects:', error)
        // Fallback to empty array
        setProjects([])
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="h-full p-6">
      <ProjectsHub projects={projects} _userId="current-user" />
    </div>
  )
}