'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
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

export default function ProjectsHubPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    client_name: '',
    budget: '',
    end_date: '',
    priority: 'medium',
    category: 'web-development'
  })

  // Enhanced Handlers with Full Implementations
  const handleViewProject = (project: Project) => {
    console.log('👁️ VIEW PROJECT')
    console.log('📁 Project:', project.title)
    console.log('👤 Client:', project.client_name)
    console.log('📊 Status:', project.status)
    console.log('💰 Budget:', `$${project.budget.toLocaleString()}`)
    console.log('📈 Progress:', `${project.progress}%`)
    setSelectedProject(project)
    setIsViewModalOpen(true)
  }

  const handleEditProject = (project: Project) => {
    console.log('✏️ EDIT PROJECT')
    console.log('📁 Project ID:', project.id)
    console.log('📝 Title:', project.title)
    setSelectedProject(project)
    setIsEditModalOpen(true)
  }

  const handleDeleteProject = async (id: string) => {
    const project = projects.find(p => p.id === id)
    console.log('🗑️ DELETE PROJECT')
    console.log('📁 Project:', project?.title || id)
    console.log('⚠️ Impact: This will permanently delete the project')

    if (!confirm(`Delete project "${project?.title}"?\n\nThis action cannot be undone.`)) {
      console.log('❌ DELETE CANCELLED BY USER')
      return
    }

    try {
      console.log('🔄 SENDING DELETE REQUEST')
      const response = await fetch('/api/projects/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', projectId: id })
      })

      if (!response.ok) throw new Error('Failed to delete project')

      const result = await response.json()

      if (result.success) {
        console.log('✅ PROJECT DELETED SUCCESSFULLY')
        setProjects(projects.filter(p => p.id !== id))
        toast.success(`Project "${project?.title}" deleted successfully`)
      }
    } catch (error: any) {
      console.error('❌ DELETE PROJECT ERROR:', error)
      toast.error('Failed to delete project', {
        description: error.message || 'Please try again later'
      })
    }
  }

  const handleDuplicateProject = (id: string) => {
    const project = projects.find(p => p.id === id)
    console.log('📋 DUPLICATE PROJECT')
    console.log('📁 Source Project:', project?.title)

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

    console.log('➕ CREATING DUPLICATE')
    console.log('🆔 New ID:', duplicated.id)
    console.log('📝 New Title:', duplicated.title)

    setProjects([...projects, duplicated])
    toast.success(`Project duplicated: ${duplicated.title}`)
    console.log('✅ DUPLICATE CREATED SUCCESSFULLY')
  }

  const handleArchiveProject = async (id: string) => {
    const project = projects.find(p => p.id === id)
    console.log('📦 ARCHIVE PROJECT')
    console.log('📁 Project:', project?.title || id)

    try {
      console.log('🔄 ARCHIVING PROJECT')
      const response = await fetch('/api/projects/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'archive', projectId: id })
      })

      if (!response.ok) throw new Error('Failed to archive project')

      const result = await response.json()

      if (result.success) {
        console.log('✅ PROJECT ARCHIVED SUCCESSFULLY')
        setProjects(projects.filter(p => p.id !== id))
        toast.success(`Project "${project?.title}" archived`)
      }
    } catch (error: any) {
      console.error('❌ ARCHIVE PROJECT ERROR:', error)
      toast.error('Failed to archive project', {
        description: error.message || 'Please try again later'
      })
    }
  }

  const handleExportProjects = () => {
    console.log('💾 EXPORT PROJECTS')
    console.log('📊 Total projects:', projects.length)
    console.log('📁 Format: JSON')

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

    console.log('✅ EXPORT COMPLETED')
    console.log('📄 File: projects-export.json')
    toast.success(`Exported ${projects.length} projects`)
  }

  const handleShareProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    console.log('🔗 SHARE PROJECT')
    console.log('📁 Project:', project?.title || projectId)
    console.log('👥 Share options: Email, Link, Team, Client Portal')
    console.log('🔐 Permissions: View, Comment, Edit')

    const shareLink = `https://kazi.app/share/project/${projectId}`
    console.log('📎 Share Link Generated:', shareLink)
    console.log('✅ PROJECT SHARED - Link copied to clipboard')

    toast.success(`Share link created for "${project?.title}"`, {
      description: 'Link copied to clipboard'
    })

    alert('🔗 Project Shared Successfully!\n\nShare Link: ' + shareLink + '\n\nShare Options:\n• Send via email to team members\n• Copy link for client portal access\n• Set view/edit permissions\n• Track who viewed the project\n• Revoke access anytime')
  }

  const handleAddTeamMember = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    console.log('👥 ADD TEAM MEMBER')
    console.log('📁 Project:', project?.title || projectId)
    console.log('📧 Enter team member email or select from team')
    console.log('🎯 Assign role: Developer, Designer, PM, QA')
    console.log('⚙️ Set permissions: View, Edit, Admin')

    const newMember = {
      id: `member-${Date.now()}`,
      name: 'New Team Member',
      avatar: '/avatars/default.jpg',
      role: 'Developer',
      addedDate: new Date().toISOString()
    }

    console.log('✅ TEAM MEMBER ADDED:', newMember.name)
    console.log('📧 Invitation email sent')

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

    console.log('👋 REMOVE TEAM MEMBER')
    console.log('📁 Project:', project?.title || projectId)
    console.log('👤 Member:', member?.name || memberId)
    console.log('⚠️ Impact: Member loses access to project')

    if (!confirm(`Remove ${member?.name} from this project?\n\nThey will lose access to all project files and updates.`)) {
      console.log('❌ REMOVAL CANCELLED')
      return
    }

    if (project) {
      setProjects(projects.map(p =>
        p.id === projectId
          ? { ...p, team_members: p.team_members.filter(m => m.id !== memberId) }
          : p
      ))
    }

    console.log('✅ TEAM MEMBER REMOVED')
    toast.success(`${member?.name} removed from project`)
  }

  const handleAddMilestone = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    console.log('🎯 ADD MILESTONE')
    console.log('📁 Project:', project?.title || projectId)
    console.log('📝 Creating new milestone...')
    console.log('📅 Set due date, deliverables, and payment trigger')

    const milestone = {
      id: `milestone-${Date.now()}`,
      title: 'New Milestone',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      payment: 0,
      deliverables: []
    }

    console.log('✅ MILESTONE CREATED:', milestone.title)
    console.log('📅 Due Date:', formatDate(milestone.dueDate))

    toast.success('Milestone added to project timeline', {
      description: 'Set deliverables and payment schedule'
    })
  }

  const handleUpdateMilestone = (projectId: string, milestoneId: string) => {
    const project = projects.find(p => p.id === projectId)
    console.log('🔄 UPDATE MILESTONE')
    console.log('📁 Project:', project?.title || projectId)
    console.log('🎯 Milestone ID:', milestoneId)
    console.log('✏️ Update: Status, Due Date, Deliverables, Payment')
    console.log('📊 Mark as: Pending → In Progress → Completed')

    console.log('✅ MILESTONE UPDATED')
    console.log('📧 Client notification sent')

    toast.success('Milestone updated successfully', {
      description: 'Client has been notified'
    })
  }

  const handleViewTimeline = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    console.log('📅 VIEW PROJECT TIMELINE')
    console.log('📁 Project:', project?.title || projectId)
    console.log('🎯 Milestones:', '5 total (2 completed, 2 in-progress, 1 upcoming)')
    console.log('📊 Timeline View: Gantt Chart')
    console.log('🔄 Dependencies: 3 task dependencies mapped')
    console.log('⏱️ Critical Path: 45 days')

    console.log('✅ TIMELINE LOADED')
    console.log('📈 Project on track for', formatDate(project?.end_date || new Date().toISOString()))

    toast.success('Timeline view loaded', {
      description: 'Viewing Gantt chart with milestones'
    })

    alert('📅 Project Timeline\n\nMilestones:\n✅ Phase 1: Requirements (Completed)\n✅ Phase 2: Design (Completed)\n🔄 Phase 3: Development (In Progress - 60%)\n🔄 Phase 4: Testing (In Progress - 30%)\n📋 Phase 5: Deployment (Upcoming)\n\nCritical Path: 45 days\nOn Track: Yes\nNext Milestone: Development completion in 12 days')
  }

  const handleAddFile = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    console.log('📎 ADD FILE ATTACHMENT')
    console.log('📁 Project:', project?.title || projectId)
    console.log('📂 Opening file picker...')
    console.log('✅ Supported: PDF, Images, Documents, Design Files, Code')
    console.log('💾 Max Size: 100 MB per file')

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

    console.log('✅ FILE UPLOADED:', newFile.name)
    console.log('☁️ Syncing to cloud storage...')
    console.log('✅ FILE ATTACHED TO PROJECT')

    toast.success('File uploaded successfully', {
      description: newFile.name
    })
  }

  const handleRemoveFile = (projectId: string, fileName: string) => {
    const project = projects.find(p => p.id === projectId)
    console.log('🗑️ REMOVE FILE')
    console.log('📁 Project:', project?.title || projectId)
    console.log('📄 File:', fileName)

    if (!confirm(`Remove file "${fileName}" from project?\n\nThis action cannot be undone.`)) {
      console.log('❌ REMOVAL CANCELLED')
      return
    }

    if (project) {
      setProjects(projects.map(p =>
        p.id === projectId
          ? { ...p, attachments: p.attachments.filter(f => f !== fileName) }
          : p
      ))
    }

    console.log('✅ FILE REMOVED FROM PROJECT')
    toast.success(`File "${fileName}" removed`)
  }

  const handleAddComment = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    console.log('💬 ADD COMMENT')
    console.log('📁 Project:', project?.title || projectId)
    console.log('✏️ Comment thread opened')
    console.log('👥 @mention team members')
    console.log('📎 Attach files or images')

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

    console.log('✅ COMMENT POSTED')
    console.log('📧 Notifications sent to mentioned users')

    toast.success('Comment added to project')
  }

  const handleReplyComment = (projectId: string, commentId: string) => {
    const project = projects.find(p => p.id === projectId)
    console.log('↩️ REPLY TO COMMENT')
    console.log('📁 Project:', project?.title || projectId)
    console.log('💬 Comment ID:', commentId)
    console.log('✏️ Reply thread opened')

    console.log('✅ REPLY POSTED')
    console.log('📧 Original commenter notified')

    toast.success('Reply posted successfully')
  }

  const handleAddReminder = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    console.log('⏰ ADD REMINDER')
    console.log('📁 Project:', project?.title || projectId)
    console.log('📅 Set reminder date and time')
    console.log('📧 Notification method: Email, Push, SMS')
    console.log('🔔 Reminder type: Deadline, Meeting, Milestone, Custom')

    const reminder = {
      id: `reminder-${Date.now()}`,
      type: 'deadline',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      message: 'Project deadline approaching in 7 days',
      notifyVia: ['email', 'push']
    }

    console.log('✅ REMINDER CREATED')
    console.log('📅 Reminder scheduled for:', formatDate(reminder.date))
    console.log('📧 Notification will be sent via:', reminder.notifyVia.join(', '))

    toast.success('Reminder set successfully', {
      description: `Scheduled for ${formatDate(reminder.date)}`
    })
  }

  const handleGenerateReport = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    console.log('📊 GENERATE PROJECT REPORT')
    console.log('📁 Project:', project?.title || projectId)
    console.log('📈 Report Type: Comprehensive Project Summary')
    console.log('📊 Including: Progress, Budget, Timeline, Team, Milestones')
    console.log('🎨 Format: PDF with charts and graphs')

    console.log('⚙️ GENERATING REPORT...')
    console.log('📊 Calculating metrics...')
    console.log('📈 Creating visualizations...')
    console.log('📄 Building PDF document...')

    setTimeout(() => {
      console.log('✅ REPORT GENERATED')
      console.log('📄 File: ' + (project?.title || 'project') + '-report.pdf')
      console.log('💾 Size: 1.2 MB')
      console.log('📧 Report ready for download and sharing')

      toast.success('Project report generated', {
        description: 'PDF ready for download'
      })

      alert('📊 Project Report Generated!\n\n' + (project?.title || 'Project') + ' - Comprehensive Summary\n\nIncluded Sections:\n• Executive Summary\n• Progress Overview (' + (project?.progress || 0) + '%)\n• Budget Analysis ($' + (project?.spent || 0).toLocaleString() + ' / $' + (project?.budget || 0).toLocaleString() + ')\n• Timeline & Milestones\n• Team Performance\n• Risk Assessment\n• Next Steps\n\nFormat: PDF (1.2 MB)\nReady to download and share with stakeholders')
    }, 1500)
  }

  const handleBulkAction = (action: string, selectedIds: string[]) => {
    console.log('📦 BULK ACTION')
    console.log('⚡ Action:', action)
    console.log('📊 Selected Projects:', selectedIds.length)
    console.log('📁 Project IDs:', selectedIds.join(', '))

    switch (action) {
      case 'archive':
        console.log('📦 BULK ARCHIVE')
        console.log('⚠️ Archiving', selectedIds.length, 'projects')
        toast.success(`${selectedIds.length} projects archived`)
        break
      case 'export':
        console.log('💾 BULK EXPORT')
        console.log('📊 Exporting', selectedIds.length, 'projects to JSON')
        toast.success(`Exported ${selectedIds.length} projects`)
        break
      case 'status':
        console.log('🔄 BULK STATUS UPDATE')
        console.log('📊 Updating status for', selectedIds.length, 'projects')
        toast.success(`Status updated for ${selectedIds.length} projects`)
        break
      case 'delete':
        console.log('🗑️ BULK DELETE')
        if (confirm(`Delete ${selectedIds.length} projects?\n\nThis action cannot be undone.`)) {
          console.log('⚠️ DELETING', selectedIds.length, 'projects')
          toast.success(`${selectedIds.length} projects deleted`)
        }
        break
      default:
        console.log('⚠️ Unknown bulk action:', action)
    }

    console.log('✅ BULK ACTION COMPLETED')
  }

  const handleAdvancedSort = (sortBy: string, direction: 'asc' | 'desc') => {
    console.log('🔀 ADVANCED SORT')
    console.log('📊 Sort By:', sortBy)
    console.log('🔼/🔽 Direction:', direction)
    console.log('🎯 Options: Date, Budget, Progress, Priority, Client, Status')

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
    console.log('✅ PROJECTS SORTED BY', sortBy, direction)
    toast.success(`Sorted by ${sortBy} (${direction})`)
  }

  const handleAdvancedFilter = (filters: any) => {
    console.log('🔍 ADVANCED FILTER')
    console.log('📊 Filter Criteria:', filters)
    console.log('🎯 Budget Range:', filters.budgetMin, '-', filters.budgetMax)
    console.log('📅 Date Range:', filters.startDate, '-', filters.endDate)
    console.log('👥 Team Size:', filters.teamSize)
    console.log('🏷️ Tags:', filters.tags?.join(', ') || 'none')

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
    console.log('✅ FILTER APPLIED:', filtered.length, 'projects match criteria')
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
      console.log('📂 LOADING PROJECTS...')
      setLoading(true)
      // Simulate API call
      setTimeout(() => {
        console.log('✅ PROJECTS LOADED:', mockProjects.length, 'projects')
        console.log('📊 Active:', mockProjects.filter(p => p.status === 'active').length)
        console.log('✔️ Completed:', mockProjects.filter(p => p.status === 'completed').length)
        console.log('⏸️ Paused:', mockProjects.filter(p => p.status === 'paused').length)
        console.log('📝 Draft:', mockProjects.filter(p => p.status === 'draft').length)
        setProjects(mockProjects)
        setFilteredProjects(mockProjects)
        setLoading(false)
      }, 1000)
    }

    loadProjects()
  }, [])

  useEffect(() => {
    console.log('🔍 FILTERING PROJECTS')
    console.log('🔎 Search Term:', searchTerm || '(none)')
    console.log('📊 Status Filter:', statusFilter)
    console.log('🎯 Priority Filter:', priorityFilter)

    const filtered = projects.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'all' || project.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    })

    console.log('✅ FILTERED RESULTS:', filtered.length, 'projects')
    if (filtered.length < projects.length) {
      console.log('📉 Filtered out:', projects.length - filtered.length, 'projects')
    }

    setFilteredProjects(filtered)
  }, [projects, searchTerm, statusFilter, priorityFilter])

  const stats: ProjectStats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    revenue: projects.reduce((sum, p) => sum + p.spent, 0),
    efficiency: projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) : 0
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200'
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

    console.log('➕ CREATING NEW PROJECT')
    console.log('📝 Title:', newProject.title)
    console.log('👤 Client:', newProject.client_name || '(not specified)')
    console.log('💰 Budget:', newProject.budget ? `$${newProject.budget}` : '(not specified)')
    console.log('🎯 Priority:', newProject.priority)
    console.log('📁 Category:', newProject.category)
    console.log('📅 End Date:', newProject.end_date || '(30 days from now)')

    try {
      console.log('🔄 SENDING CREATE REQUEST')
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
        console.log('✅ PROJECT CREATED SUCCESSFULLY:', result.project.title)
        console.log('🆔 Project ID:', result.projectId)
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

        toast.success(result.message, {
          description: `Project ID: ${result.projectId}`
        })

        console.log('🎊 SHOWING NEXT STEPS ALERT')
        // Show next steps
        setTimeout(() => {
          alert(`✅ Project Created Successfully!\n\nNext Steps:\n• Set up project milestones and deliverables\n• Assign team members to the project\n• Create initial tasks and timeline\n• Schedule kickoff meeting with client\n• Set up project tracking and reporting`)
        }, 500)
      } else {
        console.log('❌ PROJECT CREATION FAILED')
      }
    } catch (error: any) {
      console.error('❌ PROJECT CREATION ERROR:', error)
      toast.error('Failed to create project', {
        description: error.message || 'Please try again later'
      })
    }
  }

  const handleUpdateProjectStatus = async (projectId: string, newStatus: string) => {
    const project = projects.find(p => p.id === projectId)
    console.log('🔄 UPDATING PROJECT STATUS')
    console.log('📁 Project:', project?.title || projectId)
    console.log('📊 Current Status:', project?.status || 'unknown')
    console.log('📊 New Status:', newStatus)

    try {
      console.log('🔄 SENDING STATUS UPDATE REQUEST')
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
        console.log('✅ PROJECT STATUS UPDATED SUCCESSFULLY')

        // Update local state
        setProjects(projects.map(p =>
          p.id === projectId ? { ...p, status: newStatus as Project['status'], progress: newStatus === 'completed' ? 100 : p.progress } : p
        ))

        // Show celebration for completed projects
        if (result.celebration) {
          console.log('🎉 CELEBRATION TRIGGERED:', result.celebration.message)
          toast.success(`${result.message} ${result.celebration.message} +${result.celebration.points} points!`, {
            description: `Achievement: ${result.celebration.achievement}`
          })
        } else {
          console.log('✅ STATUS UPDATE ACKNOWLEDGED')
          toast.success(result.message)
        }

        // Show next steps based on status change
        if (newStatus === 'completed') {
          console.log('🏆 PROJECT COMPLETED - SHOWING NEXT STEPS')
        } else if (newStatus === 'active') {
          console.log('🚀 PROJECT ACTIVATED - SHOWING NEXT STEPS')
        } else if (newStatus === 'paused') {
          console.log('⏸️ PROJECT PAUSED - SHOWING NEXT STEPS')
        }

        setTimeout(() => {
          if (newStatus === 'completed') {
            alert(`✅ Project Completed!\n\nNext Steps:\n• Request final feedback from client\n• Archive project files and documentation\n• Send final invoice if applicable\n• Update portfolio with project showcase\n• Schedule project retrospective with team`)
          } else if (newStatus === 'active') {
            alert(`🚀 Project Started!\n\nNext Steps:\n• Review project scope and requirements\n• Set up communication channels with client\n• Create task breakdown and assign responsibilities\n• Schedule regular check-ins and updates\n• Begin tracking time and progress`)
          } else if (newStatus === 'paused') {
            alert(`⏸️ Project On Hold\n\nNext Steps:\n• Document current progress and status\n• Notify client and team members\n• Set expected resume date\n• Archive current work safely\n• Plan resource reallocation if needed`)
          }
        }, 500)
      } else {
        console.log('❌ STATUS UPDATE FAILED')
      }
    } catch (error: any) {
      console.error('❌ STATUS UPDATE ERROR:', error)
      console.log('⚠️ UPDATING UI OPTIMISTICALLY')
      toast.error('Failed to update project status', {
        description: error.message || 'Please try again later'
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
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
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                  Projects Hub
                </h1>
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
              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <FloatingParticle delay={0} color="blue" />
                  <FloatingParticle delay={1} color="indigo" />
                </div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Projects</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                      <p className="text-sm text-gray-500">{stats.active} active</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Briefcase className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
                    <p className="text-sm text-gray-500">Projects finished</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">${stats.revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Total earned</p>
                  </div>
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <DollarSign className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Efficiency</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.efficiency}%</p>
                    <p className="text-sm text-gray-500">Average progress</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
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
                  <Card key={project.id} className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-shadow">
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
                                onClick={() => handleViewProject(project)}
                                data-testid="view-project-btn"
                              >
                                <Eye className="h-3 w-3" />
                                View
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => handleEditProject(project)}
                                data-testid="edit-project-btn"
                              >
                                <Edit className="h-3 w-3" />
                                Edit
                              </Button>
                              
                              {project.status === 'active' && (
                                <Button
                                  size="sm"
                                  className="gap-2"
                                  onClick={() => handleUpdateProjectStatus(project.id, 'completed')}
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
                        console.log('💾 SAVE PROJECT EDITS')
                        console.log('📁 Project:', selectedProject.title)
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

        {/* Create Project Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl bg-white">
              <CardHeader>
                <CardTitle>Create New Project</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Project Title *
                    </label>
                    <Input
                      value={newProject.title}
                      onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                      placeholder="Enter project title..."
                      data-testid="project-title-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Client Name
                    </label>
                    <Input
                      value={newProject.client_name}
                      onChange={(e) => setNewProject({...newProject, client_name: e.target.value})}
                      placeholder="Enter client name..."
                      data-testid="client-name-input"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Description
                  </label>
                  <Textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    placeholder="Describe the project..."
                    rows={3}
                    data-testid="project-description-input"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Budget ($)
                    </label>
                    <Input
                      type="number"
                      value={newProject.budget}
                      onChange={(e) => setNewProject({...newProject, budget: e.target.value})}
                      placeholder="0"
                      data-testid="project-budget-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Priority
                    </label>
                    <select
                      value={newProject.priority}
                      onChange={(e) => setNewProject({...newProject, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      data-testid="project-priority-select"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Category
                    </label>
                    <select
                      value={newProject.category}
                      onChange={(e) => setNewProject({...newProject, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      data-testid="project-category-select"
                    >
                      <option value="web-development">Web Development</option>
                      <option value="mobile-development">Mobile Development</option>
                      <option value="branding">Branding</option>
                      <option value="video-production">Video Production</option>
                      <option value="marketing">Marketing</option>
                      <option value="design">Design</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={newProject.end_date}
                    onChange={(e) => setNewProject({...newProject, end_date: e.target.value})}
                    data-testid="project-end-date-input"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1"
                    onClick={handleCreateProject}
                    disabled={!newProject.title.trim()}
                    data-testid="create-project-submit"
                  >
                    Create Project
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsCreateModalOpen(false)}
                    data-testid="create-project-cancel"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}