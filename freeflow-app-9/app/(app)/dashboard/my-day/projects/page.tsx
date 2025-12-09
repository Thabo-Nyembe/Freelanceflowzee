'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Briefcase, TrendingUp, Brain, CheckCircle, Activity, Plus, Edit2, Trash2, Download, MoreVertical } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// A+++ UTILITIES
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('MyDay-Projects')

interface Project {
  id: string
  name: string
  description: string
  progress: number
  status: 'on-track' | 'at-risk' | 'ahead' | 'completed'
  priority: 'high' | 'medium' | 'low'
  velocity: number
  tasksToday: number
  dueIn: string
  color: string
}

const INITIAL_PROJECTS: Project[] = [
  { id: 'proj_1', name: 'TechCorp Branding', description: 'Complete logo design and brand guidelines', progress: 75, status: 'on-track', priority: 'high', velocity: 85, tasksToday: 2, dueIn: '3 days', color: 'purple' },
  { id: 'proj_2', name: 'Portfolio Redesign', description: 'Modernize portfolio with new case studies', progress: 45, status: 'at-risk', priority: 'medium', velocity: 72, tasksToday: 1, dueIn: '1 week', color: 'blue' },
  { id: 'proj_3', name: 'Client Dashboard', description: 'Build custom analytics dashboard', progress: 92, status: 'ahead', priority: 'low', velocity: 95, tasksToday: 1, dueIn: '5 days', color: 'green' }
]

const PROJECT_COLORS: Record<string, { bg: string; border: string; text: string; bar: string }> = {
  purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-700', text: 'text-purple-700 dark:text-purple-300', bar: 'bg-purple-600' },
  blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-700', text: 'text-blue-700 dark:text-blue-300', bar: 'bg-blue-600' },
  green: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-700', text: 'text-green-700 dark:text-green-300', bar: 'bg-green-600' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-700', text: 'text-orange-700 dark:text-orange-300', bar: 'bg-orange-600' },
  pink: { bg: 'bg-pink-50 dark:bg-pink-900/20', border: 'border-pink-200 dark:border-pink-700', text: 'text-pink-700 dark:text-pink-300', bar: 'bg-pink-600' }
}

const STATUS_STYLES: Record<string, string> = {
  'on-track': 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
  'at-risk': 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
  'ahead': 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
  'completed': 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700'
}

const DEFAULT_PROJECT: Omit<Project, 'id'> = {
  name: '',
  description: '',
  progress: 0,
  status: 'on-track',
  priority: 'medium',
  velocity: 80,
  tasksToday: 0,
  dueIn: '1 week',
  color: 'purple'
}

export default function ProjectsPage() {
  // A+++ UTILITIES
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS)
  const [showProjectDialog, setShowProjectDialog] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deleteProject, setDeleteProject] = useState<Project | null>(null)
  const [formData, setFormData] = useState(DEFAULT_PROJECT)

  // Open create dialog
  const handleCreateProject = useCallback(() => {
    setEditingProject(null)
    setFormData(DEFAULT_PROJECT)
    setShowProjectDialog(true)
    logger.info('Opening create project dialog')
  }, [])

  // Open edit dialog
  const handleEditProject = useCallback((project: Project) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      description: project.description,
      progress: project.progress,
      status: project.status,
      priority: project.priority,
      velocity: project.velocity,
      tasksToday: project.tasksToday,
      dueIn: project.dueIn,
      color: project.color
    })
    setShowProjectDialog(true)
    logger.info('Opening edit project dialog', { projectId: project.id })
  }, [])

  // Save project
  const handleSaveProject = useCallback(() => {
    if (!formData.name.trim()) {
      toast.error('Please enter a project name')
      return
    }

    if (editingProject) {
      setProjects(prev => prev.map(p =>
        p.id === editingProject.id ? { ...p, ...formData } : p
      ))
      toast.success('Project Updated', { description: formData.name })
      logger.info('Project updated', { projectId: editingProject.id })
      announce('Project updated', 'polite')
    } else {
      const newProject: Project = {
        id: `proj_${Date.now()}`,
        ...formData
      }
      setProjects(prev => [...prev, newProject])
      toast.success('Project Created', { description: formData.name })
      logger.info('Project created', { projectId: newProject.id })
      announce('Project created', 'polite')
    }

    setShowProjectDialog(false)
    setFormData(DEFAULT_PROJECT)
  }, [formData, editingProject, announce])

  // Update progress
  const handleUpdateProgress = useCallback((project: Project, newProgress: number) => {
    const clampedProgress = Math.max(0, Math.min(100, newProgress))
    const newStatus = clampedProgress >= 100 ? 'completed' : clampedProgress >= 80 ? 'ahead' : clampedProgress < 50 ? 'at-risk' : 'on-track'

    setProjects(prev => prev.map(p =>
      p.id === project.id ? { ...p, progress: clampedProgress, status: newStatus } : p
    ))
    toast.success('Progress Updated', { description: `${project.name}: ${clampedProgress}%` })
    logger.info('Project progress updated', { projectId: project.id, progress: clampedProgress })
  }, [])

  // Confirm delete
  const handleConfirmDelete = useCallback(() => {
    if (!deleteProject) return

    setProjects(prev => prev.filter(p => p.id !== deleteProject.id))
    toast.success('Project Deleted', { description: deleteProject.name })
    logger.info('Project deleted', { projectId: deleteProject.id })
    announce('Project deleted', 'polite')
    setDeleteProject(null)
  }, [deleteProject, announce])

  // Export projects
  const handleExportProjects = useCallback(() => {
    const exportData = {
      projects,
      exportedAt: new Date().toISOString(),
      summary: {
        total: projects.length,
        onTrack: projects.filter(p => p.status === 'on-track').length,
        atRisk: projects.filter(p => p.status === 'at-risk').length,
        completed: projects.filter(p => p.status === 'completed').length,
        avgProgress: Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / (projects.length || 1))
      }
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `projects-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Projects Exported')
    logger.info('Projects exported')
  }, [projects])

  // Apply AI recommendation
  const handleApplyRecommendation = useCallback(() => {
    const atRiskProject = projects.find(p => p.status === 'at-risk')
    if (atRiskProject) {
      setProjects(prev => prev.map(p =>
        p.id === atRiskProject.id ? { ...p, tasksToday: p.tasksToday + 2 } : p
      ))
      toast.success('AI Recommendation Applied', { description: `Added 2 tasks to ${atRiskProject.name}` })
      logger.info('AI recommendation applied', { projectId: atRiskProject.id })
      announce('AI recommendation applied', 'polite')
    } else {
      toast.info('No at-risk projects to optimize')
    }
  }, [projects, announce])

  // Calculate resource allocation
  const resourceAllocation = {
    design: Math.round(projects.filter(p => p.color === 'purple').length / (projects.length || 1) * 100),
    development: Math.round(projects.filter(p => p.color === 'blue').length / (projects.length || 1) * 100),
    communication: Math.round(projects.filter(p => p.color === 'green').length / (projects.length || 1) * 100)
  }

  // Render project card
  const renderProjectCard = (project: Project) => {
    const colors = PROJECT_COLORS[project.color] || PROJECT_COLORS.purple

    return (
      <div key={project.id} className={`p-4 rounded-xl border ${colors.border} ${colors.bg} group`}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{project.name}</h4>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={STATUS_STYLES[project.status]}>
              {project.status.replace('-', ' ')}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEditProject(project)}>
                  <Edit2 className="h-4 w-4 mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUpdateProgress(project, project.progress + 10)}>
                  <TrendingUp className="h-4 w-4 mr-2" /> Add 10%
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDeleteProject(project)} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{project.description}</p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className="font-medium">{project.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className={`${colors.bar} h-2 rounded-full transition-all`} style={{ width: `${project.progress}%` }}></div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 mt-2">
            <span>Tasks today: {project.tasksToday}</span>
            <span>Due: {project.dueIn}</span>
          </div>
          <div className="flex gap-2 mt-3">
            <Badge variant="outline" className={`text-xs ${colors.text}`}>
              {project.priority} Priority
            </Badge>
            <Badge variant="outline" className="text-xs">
              Velocity: {project.velocity}%
            </Badge>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Active Projects</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track progress and manage your project portfolio
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportProjects}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleCreateProject}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Projects */}
        <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-white/40 dark:border-gray-700/40 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Active Projects ({projects.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {projects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active projects</p>
                <Button variant="link" onClick={handleCreateProject}>
                  Create your first project
                </Button>
              </div>
            ) : (
              projects.map(renderProjectCard)
            )}
          </CardContent>
        </Card>

        {/* Project Insights */}
        <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-white/40 dark:border-gray-700/40 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Project Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Velocity Metrics */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Project Velocity</h4>
              <div className="space-y-3">
                {projects.map(project => (
                  <div key={project.id} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{project.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{project.velocity}%</span>
                      {project.velocity >= 80 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <Activity className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resource Allocation */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Resource Allocation</h4>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Design (Purple)</span>
                    <span className="font-medium">{resourceAllocation.design}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full transition-all" style={{ width: `${resourceAllocation.design}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Development (Blue)</span>
                    <span className="font-medium">{resourceAllocation.development}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${resourceAllocation.development}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Other (Green)</span>
                    <span className="font-medium">{resourceAllocation.communication}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full transition-all" style={{ width: `${resourceAllocation.communication}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
              <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-2 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Recommendation
              </h4>
              <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
                {projects.find(p => p.status === 'at-risk')
                  ? `Focus on "${projects.find(p => p.status === 'at-risk')?.name}" to get it back on track. Consider allocating 2 more hours today.`
                  : projects.length > 0
                    ? `Great work! All projects are on track. Keep up the momentum on "${projects[0].name}".`
                    : 'Create your first project to get AI-powered recommendations.'}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                onClick={handleApplyRecommendation}
              >
                <CheckCircle className="h-3 w-3" />
                Apply Recommendation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Project Dialog */}
      <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProject ? 'Edit Project' : 'Create Project'}</DialogTitle>
            <DialogDescription>
              {editingProject ? 'Update your project details' : 'Add a new project to your portfolio'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="e.g., TechCorp Branding"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                placeholder="Brief description of the project"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="project-progress">Progress (%)</Label>
                <Input
                  id="project-progress"
                  type="number"
                  min={0}
                  max={100}
                  value={formData.progress}
                  onChange={(e) => setFormData(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="project-due">Due In</Label>
                <Input
                  id="project-due"
                  placeholder="e.g., 1 week"
                  value={formData.dueIn}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueIn: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: 'high' | 'medium' | 'low') => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Color</Label>
                <Select
                  value={formData.color}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="purple">Purple (Design)</SelectItem>
                    <SelectItem value="blue">Blue (Development)</SelectItem>
                    <SelectItem value="green">Green (Communication)</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                    <SelectItem value="pink">Pink</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowProjectDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveProject}>
                {editingProject ? 'Save Changes' : 'Create Project'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteProject} onOpenChange={() => setDeleteProject(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteProject?.name}" and all its data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
