'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'

interface Project {
  id: number
  title: string
  description: string
  budget: number
  status: 'pending' | 'in-progress' | 'completed'
  timeline: string
  createdAt: string
}

const ClientDashboard = () => {
  const supabase = createClient()
  const [statusFilter, setStatusFilter] = useState<any>('all')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showNewProjectDialog, setShowNewProjectDialog] = useState<any>(false)
  const [successMessage, setSuccessMessage] = useState<any>('')
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      title: 'Website Redesign',
      description: 'Complete redesign of company website',
      budget: 5000,
      status: 'in-progress',
      timeline: '3 months',
      createdAt: '2024-01-01'
    },
    {
      id: 2,
      title: 'Mobile App Development',
      description: 'Develop iOS and Android apps',
      budget: 10000,
      status: 'pending',
      timeline: '6 months',
      createdAt: '2024-02-01'
    }
  ])

  const [newProject, setNewProject] = useState<any>({
    title: '',
    description: '',
    budget: ''
  })

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
  }

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project)
  }

  const handleStatusChange = (value: 'pending' | 'in-progress' | 'completed') => {
    if (selectedProject) {
      const updatedProject = { ...selectedProject, status: value }
      setProjects(prev => prev.map(p => p.id === selectedProject.id ? updatedProject : p))
      setSelectedProject(updatedProject)
    }
  }

  const handleNewProjectSubmit = async () => {
    const newProjectData: Project = {
      id: projects.length + 1,
      title: newProject.title,
      description: newProject.description,
      budget: Number(newProject.budget),
      status: 'pending',
      timeline: '3 months',
      createdAt: new Date().toISOString().split('T')[0]
    }

    setProjects(prev => [...prev, newProjectData])
    setNewProject({ title: '', description: '', budget: '' })
    setShowNewProjectDialog(false)
    setSuccessMessage('Project created successfully')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const filteredProjects = statusFilter === 'all'
    ? projects
    : projects.filter(p => p.status === statusFilter)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Projects</h1>
        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger data-testid="status-filter">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
            <DialogTrigger asChild>
              <Button data-testid="new-project-button">New Project</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>Fill in the project details below.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    data-testid="project-title-input"
                    value={newProject.title}
                    onChange={e => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    data-testid="project-description-input"
                    value={newProject.description}
                    onChange={e => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Budget</label>
                  <Input
                    data-testid="project-budget-input"
                    type="number"
                    value={newProject.budget}
                    onChange={e => setNewProject(prev => ({ ...prev, budget: e.target.value }))}
                  />
                </div>
                <Button
                  data-testid="submit-project-button"
                  onClick={handleNewProjectSubmit}
                  className="w-full"
                >
                  Create Project
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {successMessage && (
        <div className="text-green-500" role="alert">
          {successMessage}
        </div>
      )}

      <div data-testid="project-list" data-filter={statusFilter} className="grid grid-cols-2 gap-4">
        {filteredProjects.map(project => (
          <Card
            key={project.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            data-testid={`project-card-${project.id}`}
            onClick={() => handleProjectClick(project)}
          >
            <CardHeader>
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">{project.title}</h2>
                <span
                  data-testid={`project-status-${project.id}`}
                  className={`px-2 py-1 rounded text-sm ${
                    project.status === 'completed' ? 'bg-green-100 text-green-800' :
                    project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {project.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{project.description}</p>
              <div className="mt-4 flex justify-between text-sm text-gray-500">
                <span>Budget: ${project.budget}</span>
                <span>Timeline: {project.timeline}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedProject && (
        <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedProject.title}</DialogTitle>
              <DialogDescription>View and manage project details.</DialogDescription>
            </DialogHeader>
            <div data-testid="project-details" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">Project Details</h3>
                <p className="mt-2">{selectedProject.description}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Project Timeline</h3>
                <p className="mt-2">Started: {selectedProject.createdAt}</p>
                <p>Expected Duration: {selectedProject.timeline}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Budget Overview</h3>
                <p className="mt-2">Total Budget: ${selectedProject.budget}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Status</h3>
                <div className="mt-2">
                  <Select value={selectedProject.status} onValueChange={handleStatusChange}>
                    <SelectTrigger data-testid="project-status-button">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default ClientDashboard 