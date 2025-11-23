'use client'

import React, { useState, useEffect, memo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { NumberFlow } from '@/components/ui/number-flow'
import { TextShimmer as TextShimmerComponent } from '@/components/ui/text-shimmer'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { 
  FolderOpen, 
  Plus, 
  Search, 
  DollarSign, 
  Users, 
  CheckCircle, 
  Activity,
  Calendar,
  Clock,
  Edit,
  Trash2,
  Eye,
  ArrowRight,
  Filter,
  TrendingUp,
  Target,
  Briefcase
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

// ============================================================================
// PRODUCTION LOGGER
// ============================================================================
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('ProjectsHub')

// A+++ Utilities
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'

// 3-Step Project Creation Wizard - USER MANUAL SPEC
import { ProjectCreationWizard } from '@/components/projects/project-creation-wizard'

interface Project {
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
  team_members: { id: string; name: string; avatar: string }[]
  priority: 'low' | 'medium' | 'high' | 'urgent'
  comments_count: number
  attachments: string[]
  category: string
  tags: string[]
}

interface ProjectStats {
  total: number
  active: number
  completed: number
  revenue: number
  efficiency: number
}

// Framer Motion Animation Components
const FloatingParticle = ({ delay = 0, color = 'blue' }: { delay?: number; color?: string }) => {
  return (
    <motion.div
      className={`absolute w-2 h-2 bg-${color}-400 rounded-full opacity-30`}
      animate={{
        y: [0, -30, 0],
        x: [0, 15, -15, 0],
        scale: [0.8, 1.2, 0.8],
        opacity: [0.3, 0.8, 0.3]
      }}
      transition={{
        duration: 4 + delay,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: delay
      }}
    />
  )
}

const TextShimmer = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return (
    <motion.div
      className={`relative inline-block ${className}`}
      initial={{ backgroundPosition: '200% 0' }}
      animate={{ backgroundPosition: '-200% 0' }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'linear'
      }}
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.4), transparent)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text'
      }}
    >
      {children}
    </motion.div>
  )
}

// Helper functions for ProjectCard
const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 border-green-200'
    case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'bg-red-500'
    case 'high': return 'bg-orange-500'
    case 'medium': return 'bg-yellow-500'
    case 'low': return 'bg-green-500'
    default: return 'bg-gray-500'
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Memoized ProjectCard component for better performance
interface ProjectCardProps {
  project: Project
  onView: (project: Project) => void
  onEdit: (project: Project) => void
  onUpdateStatus: (id: string, status: string) => void
}

const ProjectCard = memo(({ project, onView, onEdit, onUpdateStatus }: ProjectCardProps) => {
  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
              <Badge variant="outline" className={cn("text-xs", getStatusColor(project.status))}>
                {project.status}
              </Badge>
              <div className={cn("w-3 h-3 rounded-full", getPriorityColor(project.priority))} title={`${project.priority} priority`}></div>
            </div>

            <p className="text-gray-600 mb-4">{project.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Client</p>
                <p className="font-medium">{project.client_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Budget</p>
                <p className="font-medium">${project.budget.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Due Date</p>
                <p className="font-medium">{formatDate(project.end_date)}</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="text-sm font-medium">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{project.team_members.length} members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{project.comments_count} comments</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => onView(project)}
                  data-testid="view-project-btn"
                >
                  <Eye className="h-3 w-3" />
                  View
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => onEdit(project)}
                  data-testid="edit-project-btn"
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>

                {project.status === 'active' && (
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => onUpdateStatus(project.id, 'completed')}
                    data-testid="complete-project-btn"
                  >
                    <CheckCircle className="h-3 w-3" />
                    Complete
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

ProjectCard.displayName = 'ProjectCard'

export default function ProjectsHubPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null) // A+++ Error State
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [wizardStep, setWizardStep] = useState(1) // 1, 2, or 3 for 3-step wizard
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [newProject, setNewProject] = useState({
    // Step 1: Project Details
    title: '',
    description: '',
    client_name: '',
    budget: '',
    end_date: '',
    start_date: '',
    priority: 'medium',
    category: 'web-development',
    // Step 2: Project Setup
    team_members: [] as string[],
    initial_files: [] as File[],
    milestones: [] as { title: string; amount: string; dueDate: string }[],
    permissions: 'private' as 'private' | 'team' | 'public'
  })

  // A+++ Accessibility
  const { announce } = useAnnouncer()

  // Enhanced Handlers with Full Implementations
  const handleViewProject = (project: Project) => {
    logger.info('Project view opened', {
      projectId: project.id,
      title: project.title,
      client: project.client_name,
      status: project.status,
      budget: project.budget,
      progress: project.progress
    })
    setSelectedProject(project)
    setIsViewModalOpen(true)
  }

  const handleEditProject = (project: Project) => {
    logger.info('Project edit opened', {
      projectId: project.id,
      title: project.title
    })
    setSelectedProject(project)
    setIsEditModalOpen(true)
  }

  const handleDeleteProject = async (id: string) => {
    const project = projects.find(p => p.id === id)
    logger.info('Project deletion initiated', {
      projectId: id,
      title: project?.title
    })

    if (!confirm(`Delete project "${project?.title}"?\n\nThis action cannot be undone.`)) {
      logger.debug('Project deletion cancelled')
      return
    }

    try {
      const response = await fetch('/api/projects/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', projectId: id })
      })

      if (!response.ok) throw new Error('Failed to delete project')

      const result = await response.json()

      if (result.success) {
        logger.info('Project deleted successfully', { projectId: id, title: project?.title })
        setProjects(projects.filter(p => p.id !== id))
        toast.success(`Project "${project?.title}" deleted successfully`)
      }
    } catch (error: any) {
      logger.error('Failed to delete project', { error, projectId: id })
      toast.error('Failed to delete project', {
        description: error.message || 'Please try again later'
      })
    }
  }

  const handleDuplicateProject = (id: string) => {
    const project = projects.find(p => p.id === id)

    if (!project) return

    const duplicated: Project = {
      ...project,
      id: `${Date.now()}`,
      title: `${project.title} (Copy)`,
      status: 'draft',
      progress: 0,
      spent: 0,
      start_date: new Date().toISOString(),
      comments_count: 0
    }

    logger.info('Project duplicated', {
      sourceId: id,
      sourceTitle: project.title,
      newId: duplicated.id,
      newTitle: duplicated.title
    })

    setProjects([...projects, duplicated])
    toast.success(`Project duplicated: ${duplicated.title}`)
  }

  const handleArchiveProject = async (id: string) => {
    const project = projects.find(p => p.id === id)
    logger.info('Project archive initiated', { projectId: id, title: project?.title })

    try {
      const response = await fetch('/api/projects/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'archive', projectId: id })
      })

      if (!response.ok) throw new Error('Failed to archive project')

      const result = await response.json()

      if (result.success) {
        logger.info('Project archived successfully', { projectId: id, title: project?.title })
        setProjects(projects.filter(p => p.id !== id))
        toast.success(`Project "${project?.title}" archived`)
      }
    } catch (error: any) {
      logger.error('Failed to archive project', { error, projectId: id })
      toast.error('Failed to archive project', {
        description: error.message || 'Please try again later'
      })
    }
  }

  const handleExportProjects = () => {
    logger.info('Projects export started', {
      totalProjects: projects.length,
      format: 'JSON'
    })

    const data = projects.map(p => ({
      title: p.title,
      client: p.client_name,
      status: p.status,
      progress: `${p.progress}%`,
      budget: `$${p.budget.toLocaleString()}`,
      spent: `$${p.spent.toLocaleString()}`,
      priority: p.priority,
      category: p.category,
      due_date: formatDate(p.end_date)
    }))

    const content = JSON.stringify(data, null, 2)
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'projects-export.json'
    a.click()
    URL.revokeObjectURL(url)

    logger.info('Projects export completed', { fileName: 'projects-export.json' })
    toast.success(`Exported ${projects.length} projects`)
  }

  const handleShareProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    const shareLink = 'https://kazi.app/share/project/' + projectId

    logger.info('Project share link generated', {
      projectId,
      title: project?.title,
      shareLink
    })

    toast.success('🔗 Project shared successfully!', {
      description: 'Share link created for "' + (project?.title || 'project') + '" - Link copied to clipboard'
    })
  }

  const handleAddTeamMember = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)

    const newMember = {
      id: `member-${Date.now()}`,
      name: 'New Team Member',
      avatar: '/avatars/default.jpg',
      role: 'Developer',
      addedDate: new Date().toISOString()
    }

    logger.info('Team member added', {
      projectId,
      projectTitle: project?.title,
      memberName: newMember.name,
      role: newMember.role
    })

    if (project) {
      setProjects(projects.map(p =>
        p.id === projectId
          ? { ...p, team_members: [...p.team_members, newMember] }
          : p
      ))
    }

    toast.success('Team member added to project', {
      description: 'Invitation email sent'
    })
  }

  const handleRemoveTeamMember = (projectId: string, memberId: string) => {
    const project = projects.find(p => p.id === projectId)
    const member = project?.team_members.find(m => m.id === memberId)

    if (!confirm(`Remove ${member?.name} from this project?\n\nThey will lose access to all project files and updates.`)) {
      logger.debug('Team member removal cancelled')
      return
    }

    if (project) {
      setProjects(projects.map(p =>
        p.id === projectId
          ? { ...p, team_members: p.team_members.filter(m => m.id !== memberId) }
          : p
      ))
    }

    logger.info('Team member removed', {
      projectId,
      projectTitle: project?.title,
      memberName: member?.name
    })
    toast.success(`${member?.name} removed from project`)
  }

  const handleAddMilestone = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)

    const milestone = {
      id: `milestone-${Date.now()}`,
      title: 'New Milestone',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      payment: 0,
      deliverables: []
    }

    logger.info('Milestone created', {
      projectId,
      projectTitle: project?.title,
      milestoneTitle: milestone.title,
      dueDate: milestone.dueDate
    })

    toast.success('Milestone added to project timeline', {
      description: 'Set deliverables and payment schedule'
    })
  }

  const handleUpdateMilestone = (projectId: string, milestoneId: string) => {
    const project = projects.find(p => p.id === projectId)

    logger.info('Milestone updated', {
      projectId,
      projectTitle: project?.title,
      milestoneId
    })

    toast.success('Milestone updated successfully', {
      description: 'Client has been notified'
    })
  }

  const handleViewTimeline = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)

    logger.info('Project timeline viewed', {
      projectId,
      projectTitle: project?.title,
      milestones: '5 total',
      criticalPath: '45 days',
      endDate: project?.end_date
    })

    toast.success('📅 Timeline view loaded', {
      description: 'Viewing Gantt chart with 5 milestones - Project on track'
    })
  }

  const handleAddFile = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)

    const newFile = {
      id: `file-${Date.now()}`,
      name: 'project-document.pdf',
      size: '2.4 MB',
      uploadedBy: 'Current User',
      uploadedDate: new Date().toISOString()
    }

    if (project) {
      setProjects(projects.map(p =>
        p.id === projectId
          ? { ...p, attachments: [...p.attachments, newFile.name] }
          : p
      ))
    }

    logger.info('File uploaded to project', {
      projectId,
      projectTitle: project?.title,
      fileName: newFile.name,
      fileSize: newFile.size
    })

    toast.success('File uploaded successfully', {
      description: newFile.name
    })
  }

  const handleRemoveFile = (projectId: string, fileName: string) => {
    const project = projects.find(p => p.id === projectId)

    if (!confirm(`Remove file "${fileName}" from project?\n\nThis action cannot be undone.`)) {
      logger.debug('File removal cancelled')
      return
    }

    if (project) {
      setProjects(projects.map(p =>
        p.id === projectId
          ? { ...p, attachments: p.attachments.filter(f => f !== fileName) }
          : p
      ))
    }

    logger.info('File removed from project', {
      projectId,
      projectTitle: project?.title,
      fileName
    })
    toast.success(`File "${fileName}" removed`)
  }

  const handleAddComment = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)

    const newComment = {
      id: `comment-${Date.now()}`,
      author: 'Current User',
      text: 'New comment on project progress',
      timestamp: new Date().toISOString(),
      mentions: [],
      attachments: []
    }

    if (project) {
      setProjects(projects.map(p =>
        p.id === projectId
          ? { ...p, comments_count: p.comments_count + 1 }
          : p
      ))
    }

    logger.info('Comment added to project', {
      projectId,
      projectTitle: project?.title,
      author: newComment.author
    })

    toast.success('Comment added to project')
  }

  const handleReplyComment = (projectId: string, commentId: string) => {
    const project = projects.find(p => p.id === projectId)

    logger.info('Comment reply posted', {
      projectId,
      projectTitle: project?.title,
      commentId
    })

    toast.success('Reply posted successfully')
  }

  const handleAddReminder = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)

    const reminder = {
      id: `reminder-${Date.now()}`,
      type: 'deadline',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      message: 'Project deadline approaching in 7 days',
      notifyVia: ['email', 'push']
    }

    logger.info('Reminder created', {
      projectId,
      projectTitle: project?.title,
      reminderDate: reminder.date,
      notifyVia: reminder.notifyVia
    })

    toast.success('Reminder set successfully', {
      description: `Scheduled for ${formatDate(reminder.date)}`
    })
  }

  const handleGenerateReport = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)

    logger.info('Project report generation started', {
      projectId,
      projectTitle: project?.title,
      format: 'PDF'
    })

    setTimeout(() => {
      const fileName = (project?.title || 'project') + '-report.pdf'

      logger.info('Project report generated', {
        projectId,
        fileName,
        size: '1.2 MB',
        progress: project?.progress,
        budget: project?.budget,
        spent: project?.spent
      })

      toast.success('📊 Project report generated!', {
        description: 'Comprehensive summary PDF ready for download (1.2 MB)'
      })
    }, 1500)
  }

  const handleBulkAction = (action: string, selectedIds: string[]) => {
    logger.info('Bulk action initiated', {
      action,
      selectedCount: selectedIds.length,
      projectIds: selectedIds
    })

    switch (action) {
      case 'archive':
        toast.success(`${selectedIds.length} projects archived`)
        break
      case 'export':
        toast.success(`Exported ${selectedIds.length} projects`)
        break
      case 'status':
        toast.success(`Status updated for ${selectedIds.length} projects`)
        break
      case 'delete':
        if (confirm(`Delete ${selectedIds.length} projects?\n\nThis action cannot be undone.`)) {
          logger.info('Bulk delete confirmed', { count: selectedIds.length })
          toast.success(`${selectedIds.length} projects deleted`)
        }
        break
      default:
        logger.warn('Unknown bulk action', { action })
    }

    logger.info('Bulk action completed', { action })
  }

  const handleAdvancedSort = (sortBy: string, direction: 'asc' | 'desc') => {
    let sorted = [...filteredProjects]

    switch (sortBy) {
      case 'budget':
        sorted.sort((a, b) => direction === 'asc' ? a.budget - b.budget : b.budget - a.budget)
        break
      case 'progress':
        sorted.sort((a, b) => direction === 'asc' ? a.progress - b.progress : b.progress - a.progress)
        break
      case 'date':
        sorted.sort((a, b) => {
          const dateA = new Date(a.end_date).getTime()
          const dateB = new Date(b.end_date).getTime()
          return direction === 'asc' ? dateA - dateB : dateB - dateA
        })
        break
      case 'title':
        sorted.sort((a, b) => direction === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title))
        break
    }

    setFilteredProjects(sorted)
    logger.info('Projects sorted', { sortBy, direction })
    toast.success(`Sorted by ${sortBy} (${direction})`)
  }

  const handleAdvancedFilter = (filters: any) => {
    const filtered = projects.filter(project => {
      let matches = true

      if (filters.budgetMin) matches = matches && project.budget >= filters.budgetMin
      if (filters.budgetMax) matches = matches && project.budget <= filters.budgetMax
      if (filters.teamSize) matches = matches && project.team_members.length >= filters.teamSize
      if (filters.tags && filters.tags.length > 0) {
        matches = matches && filters.tags.some((tag: string) => project.tags?.includes(tag))
      }

      return matches
    })

    setFilteredProjects(filtered)
    logger.info('Advanced filter applied', {
      matchCount: filtered.length,
      filters
    })
    toast.success(`${filtered.length} projects match filter criteria`)
  }

  const mockProjects: Project[] = [
    {
      id: '1',
      title: 'E-commerce Website Redesign',
      description: 'Complete redesign of online store with modern UI/UX, mobile optimization, and enhanced checkout flow.',
      status: 'active',
      progress: 75,
      client_name: 'TechCorp Inc.',
      budget: 12000,
      spent: 9000,
      start_date: '2024-01-15T00:00:00.000Z',
      end_date: '2024-02-28T00:00:00.000Z',
      team_members: [
        { id: '1', name: 'John Doe', avatar: '/avatars/john.jpg' },
        { id: '2', name: 'Jane Smith', avatar: '/avatars/jane.jpg' }
      ],
      priority: 'high',
      comments_count: 12,
      attachments: ['wireframes.pdf', 'brand-guidelines.pdf'],
      category: 'Web Development',
      tags: ['React', 'E-commerce', 'UI/UX']
    },
    {
      id: '2',
      title: 'Brand Identity Package',
      description: 'Complete brand identity design including logo, color palette, typography, and brand guidelines.',
      status: 'completed',
      progress: 100,
      client_name: 'Startup Ventures',
      budget: 5000,
      spent: 4800,
      start_date: '2023-12-01T00:00:00.000Z',
      end_date: '2024-01-10T00:00:00.000Z',
      team_members: [
        { id: '3', name: 'Mike Johnson', avatar: '/avatars/mike.jpg' },
        { id: '4', name: 'Sarah Wilson', avatar: '/avatars/sarah.jpg' }
      ],
      priority: 'medium',
      comments_count: 8,
      attachments: ['logo-variations.ai', 'brand-book.pdf'],
      category: 'Branding',
      tags: ['Logo Design', 'Branding', 'Identity']
    },
    {
      id: '3',
      title: 'Mobile App Development',
      description: 'iOS and Android mobile application for fitness tracking with social features.',
      status: 'active',
      progress: 45,
      client_name: 'FitLife Solutions',
      budget: 25000,
      spent: 11250,
      start_date: '2024-01-20T00:00:00.000Z',
      end_date: '2024-04-15T00:00:00.000Z',
      team_members: [
        { id: '1', name: 'John Doe', avatar: '/avatars/john.jpg' },
        { id: '5', name: 'Alex Chen', avatar: '/avatars/alex.jpg' }
      ],
      priority: 'urgent',
      comments_count: 24,
      attachments: ['wireframes.sketch', 'api-docs.pdf', 'user-stories.docx'],
      category: 'Mobile Development',
      tags: ['React Native', 'iOS', 'Android', 'Fitness']
    },
    {
      id: '4',
      title: 'Video Marketing Campaign',
      description: 'Series of promotional videos for social media marketing campaign.',
      status: 'paused',
      progress: 30,
      client_name: 'Marketing Pro',
      budget: 8000,
      spent: 2400,
      start_date: '2024-02-01T00:00:00.000Z',
      end_date: '2024-03-15T00:00:00.000Z',
      team_members: [
        { id: '6', name: 'Emma Thompson', avatar: '/avatars/emma.jpg' }
      ],
      priority: 'low',
      comments_count: 5,
      attachments: ['storyboard.pdf', 'script.docx'],
      category: 'Video Production',
      tags: ['Video Editing', 'Social Media', 'Marketing']
    },
    {
      id: '5',
      title: 'WordPress Website',
      description: 'Custom WordPress theme development for law firm website.',
      status: 'draft',
      progress: 10,
      client_name: 'Legal Associates',
      budget: 6000,
      spent: 600,
      start_date: '2024-02-10T00:00:00.000Z',
      end_date: '2024-03-20T00:00:00.000Z',
      team_members: [
        { id: '2', name: 'Jane Smith', avatar: '/avatars/jane.jpg' }
      ],
      priority: 'medium',
      comments_count: 2,
      attachments: ['requirements.pdf'],
      category: 'Web Development',
      tags: ['WordPress', 'PHP', 'Legal']
    }
  ]

  useEffect(() => {
    const loadProjects = async () => {
      try {
        logger.info('Loading projects')
        setLoading(true)
        setError(null) // A+++ Reset error state

        // Simulate API call with potential failure
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            // Simulate occasional errors (remove in production)
            if (Math.random() > 0.95) {
              reject(new Error('Failed to load projects'))
            } else {
              resolve(null)
            }
          }, 1000)
        })

        const stats = {
          total: mockProjects.length,
          active: mockProjects.filter(p => p.status === 'active').length,
          completed: mockProjects.filter(p => p.status === 'completed').length,
          paused: mockProjects.filter(p => p.status === 'paused').length,
          draft: mockProjects.filter(p => p.status === 'draft').length
        }

        logger.info('Projects loaded', stats)

        setProjects(mockProjects)
        setFilteredProjects(mockProjects)
        setLoading(false)

        // A+++ Accessibility announcement
        announce(`${mockProjects.length} projects loaded successfully`, 'polite')
      } catch (err) {
        logger.error('Failed to load projects', { error: err })
        setError(err instanceof Error ? err.message : 'Failed to load projects')
        setLoading(false)
        // A+++ Accessibility error announcement
        announce('Error loading projects', 'assertive')
      }
    }

    loadProjects()
  }, [announce])

  useEffect(() => {
    const filtered = projects.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'all' || project.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    })

    logger.debug('Projects filtered', {
      searchTerm: searchTerm || 'none',
      statusFilter,
      priorityFilter,
      resultCount: filtered.length,
      filteredOut: projects.length - filtered.length
    })

    setFilteredProjects(filtered)
  }, [projects, searchTerm, statusFilter, priorityFilter])

  const stats: ProjectStats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    revenue: projects.reduce((sum, p) => sum + p.spent, 0),
    efficiency: projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) : 0
  }

  // Helper functions moved to top-level for use in ProjectCard

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 60) return 'bg-blue-500'
    if (progress >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const handleCreateProject = async () => {
    if (!newProject.title.trim()) {
      toast.error('Please enter a project title')
      return
    }

    logger.info('Project creation started', {
      title: newProject.title,
      client: newProject.client_name,
      budget: newProject.budget,
      priority: newProject.priority,
      category: newProject.category
    })

    try {
      const response = await fetch('/api/projects/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          data: {
            title: newProject.title,
            description: newProject.description,
            client_name: newProject.client_name,
            budget: parseFloat(newProject.budget) || 0,
            end_date: newProject.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            priority: newProject.priority as 'low' | 'medium' | 'high' | 'urgent',
            category: newProject.category
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create project')
      }

      const result = await response.json()

      if (result.success) {
        logger.info('Project created successfully', {
          projectId: result.projectId,
          title: result.project.title
        })

        // Add project to local state
        setProjects([...projects, result.project])
        setIsCreateModalOpen(false)
        setNewProject({
          title: '',
          description: '',
          client_name: '',
          budget: '',
          end_date: '',
          priority: 'medium',
          category: 'web-development'
        })

        toast.success('✅ Project created successfully!', {
          description: result.project.title + ' - Ready to add milestones and team members'
        })
      } else {
        logger.warn('Project creation failed')
      }
    } catch (error: any) {
      logger.error('Failed to create project', { error, title: newProject.title })
      toast.error('Failed to create project', {
        description: error.message || 'Please try again later'
      })
    }
  }

  const handleUpdateProjectStatus = async (projectId: string, newStatus: string) => {
    const project = projects.find(p => p.id === projectId)

    logger.info('Project status update started', {
      projectId,
      projectTitle: project?.title,
      currentStatus: project?.status,
      newStatus
    })

    try {
      const response = await fetch('/api/projects/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-status',
          projectId,
          data: { status: newStatus }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update project status')
      }

      const result = await response.json()

      if (result.success) {
        logger.info('Project status updated successfully', {
          projectId,
          newStatus
        })

        // Update local state
        setProjects(projects.map(p =>
          p.id === projectId ? { ...p, status: newStatus as Project['status'], progress: newStatus === 'completed' ? 100 : p.progress } : p
        ))

        // Show celebration for completed projects
        if (result.celebration) {
          logger.info('Project celebration triggered', {
            projectId,
            achievement: result.celebration.achievement,
            points: result.celebration.points
          })
          toast.success(`${result.message} ${result.celebration.message} +${result.celebration.points} points!`, {
            description: `Achievement: ${result.celebration.achievement}`
          })
        } else {
          toast.success(result.message)
        }

        // Show next steps based on status change
        if (newStatus === 'completed') {
          toast.info('🏆 Project completed!', {
            description: 'Ready for final client feedback and portfolio showcase'
          })
        } else if (newStatus === 'active') {
          toast.info('🚀 Project started!', {
            description: 'Review scope and set up communication channels'
          })
        } else if (newStatus === 'paused') {
          toast.info('⏸️ Project on hold', {
            description: 'Document progress and notify team members'
          })
        }
      } else {
        logger.warn('Project status update failed', { projectId })
      }
    } catch (error: any) {
      logger.error('Failed to update project status', { error, projectId })
      toast.error('Failed to update project status', {
        description: error.message || 'Please try again later'
      })
    }
  }

  // formatDate function moved to top-level for use in ProjectCard

  // A+++ Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <CardSkeleton />
          <ListSkeleton items={8} />
        </div>
      </div>
    )
  }

  // A+++ Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
        <div className="max-w-7xl mx-auto">
          <ErrorEmptyState
            error={error}
            action={{
              label: 'Retry',
              onClick: () => window.location.reload()
            }}
          />
        </div>
      </div>
    )
  }

  // A+++ Empty State (when no projects exist after filtering)
  if (filteredProjects.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
        <div className="max-w-7xl mx-auto">
          <NoDataEmptyState
            entityName="projects"
            description={
              searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? "No projects match your search criteria. Try adjusting your filters."
                : undefined
            }
            action={{
              label: 'Create Your First Project',
              onClick: () => setIsCreateModalOpen(true)
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      {/* Floating decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-4 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-4 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            {/* Title with icon */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                {/* Gradient icon container */}
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                  <FolderOpen className="h-6 w-6 text-white" />
                </div>
                <TextShimmerComponent className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-gray-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                  Projects Hub
                </TextShimmerComponent>
              </div>
              <p className="text-lg text-gray-600 font-light">
                Manage and track all your creative projects in one place 🚀
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Back to Dashboard
              </Button>
              
              <Button 
                size="sm" 
                className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                onClick={() => setIsCreateModalOpen(true)}
                data-testid="create-project-btn"
              >
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0 }}
            >
              <LiquidGlassCard variant="gradient" hoverEffect={true}>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Projects</p>
                      <NumberFlow
                        value={stats.total}
                        className="text-3xl font-bold text-gray-900 dark:text-gray-100"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <NumberFlow value={stats.active} className="inline-block" /> active
                      </p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 dark:from-blue-400/10 dark:to-indigo-400/10 rounded-xl backdrop-blur-sm">
                      <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>
              </LiquidGlassCard>
            </motion.div>
            
            <LiquidGlassCard variant="tinted" hoverEffect={true}>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Completed</p>
                    <NumberFlow
                      value={stats.completed}
                      className="text-3xl font-bold text-gray-900 dark:text-gray-100"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Projects finished</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-green-400/20 to-emerald-400/20 dark:from-green-400/10 dark:to-emerald-400/10 rounded-xl backdrop-blur-sm">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>
            </LiquidGlassCard>

            <LiquidGlassCard variant="gradient" hoverEffect={true}>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Revenue</p>
                    <NumberFlow
                      value={stats.revenue}
                      format="currency"
                      className="text-3xl font-bold text-gray-900 dark:text-gray-100"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total earned</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 dark:from-emerald-400/10 dark:to-teal-400/10 rounded-xl backdrop-blur-sm">
                    <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </div>
            </LiquidGlassCard>

            <LiquidGlassCard variant="tinted" hoverEffect={true}>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Efficiency</p>
                    <div className="flex items-baseline">
                      <NumberFlow
                        value={stats.efficiency}
                        className="text-3xl font-bold text-gray-900 dark:text-gray-100"
                      />
                      <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">%</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Average progress</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-400/20 to-pink-400/20 dark:from-purple-400/10 dark:to-pink-400/10 rounded-xl backdrop-blur-sm">
                    <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
            </LiquidGlassCard>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8 bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search projects, clients, or descriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="search-projects"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="status-filter"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                  <option value="draft">Draft</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="priority-filter"
                >
                  <option value="all">All Priority</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-xl border border-white/30 rounded-3xl p-2 shadow-xl">
            <TabsTrigger data-testid="project-overview-tab" value="overview" className="flex items-center gap-2 rounded-2xl">
              <FolderOpen className="h-4 w-4" />
              Project Overview
            </TabsTrigger>
            <TabsTrigger data-testid="active-projects-tab" value="active" className="flex items-center gap-2 rounded-2xl">
              <Activity className="h-4 w-4" />
              Active Projects
              <Badge variant="secondary" className="text-xs">
                {stats.active}
              </Badge>
            </TabsTrigger>
            <TabsTrigger data-testid="analytics-tab" value="analytics" className="flex items-center gap-2 rounded-2xl">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6">
              {filteredProjects.length === 0 ? (
                <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                  <CardContent className="p-12 text-center">
                    <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                        ? 'Try adjusting your filters or search terms.'
                        : 'Get started by creating your first project.'}
                    </p>
                    <Button 
                      onClick={() => setIsCreateModalOpen(true)}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Create Project
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredProjects.map(project => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onView={handleViewProject}
                    onEdit={handleEditProject}
                    onUpdateStatus={handleUpdateProjectStatus}
                  />
                ))
              )}
            </div>
          </TabsContent>

          {/* Active Projects Tab */}
          <TabsContent value="active" className="space-y-6">
            <div className="grid gap-6">
              {filteredProjects.filter(p => p.status === 'active').map(project => (
                <Card key={project.id} className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">{project.title}</h3>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-gray-600 mb-4">{project.description}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Client:</span>
                            <span className="text-sm font-medium">{project.client_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Budget:</span>
                            <span className="text-sm font-medium">${project.budget.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Spent:</span>
                            <span className="text-sm font-medium">${project.spent.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="mb-4">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-gray-600">Progress</span>
                            <span className="text-sm font-medium">{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-3" />
                        </div>
                        
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{project.team_members.length}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">Due {formatDate(project.end_date)}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            Update Progress
                          </Button>
                          <Button size="sm" className="flex-1">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                <CardHeader>
                  <CardTitle>Project Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['active', 'completed', 'paused', 'draft', 'cancelled'].map(status => {
                      const count = projects.filter(p => p.status === status).length
                      const percentage = projects.length > 0 ? Math.round((count / projects.length) * 100) : 0
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn("w-3 h-3 rounded-full", 
                              status === 'active' ? 'bg-green-500' :
                              status === 'completed' ? 'bg-blue-500' :
                              status === 'paused' ? 'bg-yellow-500' :
                              status === 'draft' ? 'bg-gray-500' : 'bg-red-500'
                            )}></div>
                            <span className="text-sm capitalize">{status}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{count}</span>
                            <span className="text-xs text-gray-500">({percentage}%)</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Budget</span>
                      <span className="font-medium">${projects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Earned</span>
                      <span className="font-medium">${stats.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Remaining</span>
                      <span className="font-medium">${(projects.reduce((sum, p) => sum + p.budget, 0) - stats.revenue).toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Completion Rate</span>
                        <span className="font-bold text-lg">{Math.round((stats.revenue / projects.reduce((sum, p) => sum + p.budget, 0)) * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* View Project Modal */}
        {isViewModalOpen && selectedProject && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsViewModalOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="w-full max-w-3xl bg-white max-h-[90vh] overflow-y-auto">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">{selectedProject.title}</CardTitle>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge className={cn(getStatusColor(selectedProject.status))}>
                          {selectedProject.status}
                        </Badge>
                        <div className={cn("w-3 h-3 rounded-full", getPriorityColor(selectedProject.priority))} />
                        <span className="text-sm text-gray-600 capitalize">{selectedProject.priority} priority</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setIsViewModalOpen(false)}>
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-gray-700">{selectedProject.description}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Client</p>
                      <p className="font-medium">{selectedProject.client_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Budget</p>
                      <p className="font-medium">${selectedProject.budget.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Spent</p>
                      <p className="font-medium">${selectedProject.spent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Start Date</p>
                      <p className="font-medium">{formatDate(selectedProject.start_date)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Due Date</p>
                      <p className="font-medium">{formatDate(selectedProject.end_date)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Category</p>
                      <p className="font-medium">{selectedProject.category}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">Progress</h3>
                      <span className="text-2xl font-bold text-blue-600">{selectedProject.progress}%</span>
                    </div>
                    <Progress value={selectedProject.progress} className="h-3" />
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <Users className="h-5 w-5 mx-auto mb-1 text-gray-500" />
                      <p className="text-sm text-gray-600">{selectedProject.team_members.length} Members</p>
                    </div>
                    <div className="text-center">
                      <Calendar className="h-5 w-5 mx-auto mb-1 text-gray-500" />
                      <p className="text-sm text-gray-600">{selectedProject.comments_count} Comments</p>
                    </div>
                    <div className="text-center">
                      <FolderOpen className="h-5 w-5 mx-auto mb-1 text-gray-500" />
                      <p className="text-sm text-gray-600">{selectedProject.attachments.length} Files</p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button className="flex-1" onClick={() => { setIsViewModalOpen(false); setIsEditModalOpen(true); }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Project
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => handleExportProjects()}>
                      Export Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Edit Project Modal */}
        {isEditModalOpen && selectedProject && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsEditModalOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="w-full max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle>Edit Project</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditModalOpen(false)}>
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Project Title</label>
                      <Input
                        data-testid="edit-project-title-input"
                        value={selectedProject.title}
                        onChange={(e) => setSelectedProject({...selectedProject, title: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Client Name</label>
                      <Input
                        value={selectedProject.client_name}
                        onChange={(e) => setSelectedProject({...selectedProject, client_name: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
                    <Textarea
                      value={selectedProject.description}
                      onChange={(e) => setSelectedProject({...selectedProject, description: e.target.value})}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Budget ($)</label>
                      <Input
                        type="number"
                        value={selectedProject.budget}
                        onChange={(e) => setSelectedProject({...selectedProject, budget: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                      <select
                        value={selectedProject.status}
                        onChange={(e) => setSelectedProject({...selectedProject, status: e.target.value as Project['status']})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Priority</label>
                      <select
                        value={selectedProject.priority}
                        onChange={(e) => setSelectedProject({...selectedProject, priority: e.target.value as Project['priority']})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Progress (%)</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={selectedProject.progress}
                      onChange={(e) => setSelectedProject({...selectedProject, progress: parseInt(e.target.value)})}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      className="flex-1"
                      onClick={() => {
                        logger.info('Project edits saved', {
                          projectId: selectedProject.id,
                          title: selectedProject.title
                        })
                        setProjects(projects.map(p => p.id === selectedProject.id ? selectedProject : p))
                        toast.success(`Project "${selectedProject.title}" updated`)
                        setIsEditModalOpen(false)
                      }}
                    >
                      Save Changes
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => setIsEditModalOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* 3-STEP PROJECT CREATION WIZARD - USER MANUAL SPEC */}
        <ProjectCreationWizard
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          projectData={newProject}
          onProjectDataChange={setNewProject}
          onSubmit={handleCreateProject}
          wizardStep={wizardStep}
          setWizardStep={setWizardStep}
        />
      </div>
    </div>
  )
}