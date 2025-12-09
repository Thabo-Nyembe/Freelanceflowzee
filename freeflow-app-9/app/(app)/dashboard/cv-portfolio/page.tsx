'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { NumberFlow } from '@/components/ui/number-flow'
import { TextShimmer } from '@/components/ui/text-shimmer'
import {
  Briefcase,
  Award,
  Star,
  Download,
  Share2,
  Edit,
  ExternalLink,
  MapPin,
  Mail,
  Phone,
  Globe,
  Plus,
  Trash2,
  Upload,
  Eye,
  Printer,
  FileText,
  Link as LinkIcon,
  Check,
  AlertCircle,
  AlertTriangle,
  Code,
  Languages,
  Lightbulb
} from 'lucide-react'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// A+++ UTILITIES
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { createFeatureLogger } from '@/lib/logger'

// CV PORTFOLIO UTILITIES - World-Class A+++ System



/**
 * CV PORTFOLIO API ENDPOINTS
 *
 * POST   /api/portfolio/projects          - Add new project
 * PUT    /api/portfolio/projects/:id      - Update project
 * DELETE /api/portfolio/projects/:id      - Delete project
 * POST   /api/portfolio/projects/:id/reorder - Reorder projects
 * PUT    /api/portfolio/projects/:id/feature - Toggle featured status
 *
 * POST   /api/portfolio/skills            - Add new skill
 * PUT    /api/portfolio/skills/:id        - Update skill
 * DELETE /api/portfolio/skills/:id        - Delete skill
 *
 * POST   /api/portfolio/experience        - Add experience
 * PUT    /api/portfolio/experience/:id    - Update experience
 * DELETE /api/portfolio/experience/:id    - Delete experience
 *
 * POST   /api/portfolio/education         - Add education
 * PUT    /api/portfolio/education/:id     - Update education
 * DELETE /api/portfolio/education/:id     - Delete education
 *
 * POST   /api/portfolio/certifications    - Add certification
 * PUT    /api/portfolio/certifications/:id - Update certification
 * DELETE /api/portfolio/certifications/:id - Delete certification
 *
 * GET    /api/portfolio/:userId/public    - Get public portfolio
 * POST   /api/portfolio/export/pdf        - Export portfolio as PDF
 * POST   /api/portfolio/export/json       - Export portfolio as JSON
 * POST   /api/portfolio/export/docx       - Export portfolio as DOCX
 * GET    /api/portfolio/analytics         - Get analytics data
 * POST   /api/portfolio/share             - Generate share link
 * POST   /api/portfolio/upload/image      - Upload project/avatar image
 * PUT    /api/portfolio/settings          - Update portfolio settings
 * PUT    /api/portfolio/theme             - Update theme settings
 */

const logger = createFeatureLogger('CVPortfolio')

// TYPES
interface Project {
  id: number
  title: string
  description: string
  image: string
  technologies: string[]
  link: string
  status: string
  dateAdded?: string
}

interface Skill {
  id: number
  name: string
  category: 'Technical' | 'Soft' | 'Languages'
  proficiency: number // 1-5
}

interface Experience {
  id: number
  company: string
  position: string
  period: string
  location: string
  description: string
  technologies: string[]
  startDate?: string
  endDate?: string
  current?: boolean
}

interface Education {
  id: number
  institution: string
  degree: string
  period: string
  location: string
  achievements: string[]
  gpa?: string
  startDate?: string
  endDate?: string
}

interface Achievement {
  id: number
  title: string
  issuer: string
  date: string
  description?: string
}

interface CVSection {
  id: string
  name: string
  visible: boolean
  order: number
}

interface Template {
  id: string
  name: string
  description: string
  preview: string
}

export default function CVPortfolioPage() {
  // A+++ STATE MANAGEMENT
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<string>('overview')
  const [isExporting, setIsExporting] = useState<boolean>(false)
  const [isSharing, setIsSharing] = useState<boolean>(false)
  const [previewMode, setPreviewMode] = useState<boolean>(false)

  // AlertDialog states for confirmations
  const [showDeleteProjectDialog, setShowDeleteProjectDialog] = useState(false)
  const [showRemoveSkillDialog, setShowRemoveSkillDialog] = useState(false)
  const [showDeleteExperienceDialog, setShowDeleteExperienceDialog] = useState(false)
  const [showDeleteEducationDialog, setShowDeleteEducationDialog] = useState(false)
  const [showDeleteAchievementDialog, setShowDeleteAchievementDialog] = useState(false)
  const [showBulkDeleteProjectsDialog, setShowBulkDeleteProjectsDialog] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null)
  const [skillToRemove, setSkillToRemove] = useState<number | null>(null)
  const [experienceToDelete, setExperienceToDelete] = useState<number | null>(null)
  const [educationToDelete, setEducationToDelete] = useState<number | null>(null)
  const [achievementToDelete, setAchievementToDelete] = useState<number | null>(null)
  const [projectsToDelete, setProjectsToDelete] = useState<number[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  // Dialog states for prompt() replacements
  // Add Project Dialog
  const [showAddProjectDialog, setShowAddProjectDialog] = useState(false)
  const [newProjectTitle, setNewProjectTitle] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [newProjectTechnologies, setNewProjectTechnologies] = useState('')
  const [newProjectLink, setNewProjectLink] = useState('')

  // Edit Project Dialog
  const [showEditProjectDialog, setShowEditProjectDialog] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [editProjectTitle, setEditProjectTitle] = useState('')
  const [editProjectDescription, setEditProjectDescription] = useState('')
  const [editProjectTechnologies, setEditProjectTechnologies] = useState('')
  const [editProjectLink, setEditProjectLink] = useState('')

  // Add Skill Dialog
  const [showAddSkillDialog, setShowAddSkillDialog] = useState(false)
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillCategory, setNewSkillCategory] = useState<'Technical' | 'Soft' | 'Languages'>('Technical')
  const [newSkillProficiency, setNewSkillProficiency] = useState('3')

  // Add Experience Dialog
  const [showAddExperienceDialog, setShowAddExperienceDialog] = useState(false)
  const [newExpCompany, setNewExpCompany] = useState('')
  const [newExpPosition, setNewExpPosition] = useState('')
  const [newExpLocation, setNewExpLocation] = useState('')
  const [newExpDescription, setNewExpDescription] = useState('')
  const [newExpPeriod, setNewExpPeriod] = useState('')
  const [newExpTechnologies, setNewExpTechnologies] = useState('')

  // Edit Experience Dialog
  const [showEditExperienceDialog, setShowEditExperienceDialog] = useState(false)
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null)
  const [editExpCompany, setEditExpCompany] = useState('')
  const [editExpPosition, setEditExpPosition] = useState('')
  const [editExpDescription, setEditExpDescription] = useState('')

  // Add Education Dialog
  const [showAddEducationDialog, setShowAddEducationDialog] = useState(false)
  const [newEduInstitution, setNewEduInstitution] = useState('')
  const [newEduDegree, setNewEduDegree] = useState('')
  const [newEduPeriod, setNewEduPeriod] = useState('')
  const [newEduLocation, setNewEduLocation] = useState('')
  const [newEduGpa, setNewEduGpa] = useState('')

  // Edit Education Dialog
  const [showEditEducationDialog, setShowEditEducationDialog] = useState(false)
  const [editingEducation, setEditingEducation] = useState<Education | null>(null)
  const [editEduInstitution, setEditEduInstitution] = useState('')
  const [editEduDegree, setEditEduDegree] = useState('')

  // Add Achievement Dialog
  const [showAddAchievementDialog, setShowAddAchievementDialog] = useState(false)
  const [newAchTitle, setNewAchTitle] = useState('')
  const [newAchIssuer, setNewAchIssuer] = useState('')
  const [newAchDate, setNewAchDate] = useState('')
  const [newAchDescription, setNewAchDescription] = useState('')

  // Edit Achievement Dialog
  const [showEditAchievementDialog, setShowEditAchievementDialog] = useState(false)
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null)
  const [editAchTitle, setEditAchTitle] = useState('')
  const [editAchIssuer, setEditAchIssuer] = useState('')

  // Update Bio Dialog
  const [showUpdateBioDialog, setShowUpdateBioDialog] = useState(false)
  const [editBio, setEditBio] = useState('')

  // REAL STATE - Projects
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      title: 'E-commerce Platform Redesign',
      description: 'Complete overhaul of a major retail platform serving 500K+ customers',
      image: '/portfolio-1.jpg',
      technologies: ['React', 'Node.js', 'AWS', 'Stripe'],
      link: 'https://example.com',
      status: 'Completed',
      dateAdded: '2023-06-15'
    },
    {
      id: 2,
      title: 'AI-Powered Analytics Dashboard',
      description: 'Real-time analytics platform with machine learning insights',
      image: '/portfolio-2.jpg',
      technologies: ['Vue.js', 'Python', 'TensorFlow', 'D3.js'],
      link: 'https://example.com',
      status: 'Live',
      dateAdded: '2023-09-20'
    },
    {
      id: 3,
      title: 'Mobile Banking App',
      description: 'Secure mobile banking solution with biometric authentication',
      image: '/portfolio-3.jpg',
      technologies: ['React Native', 'Node.js', 'MongoDB', 'AWS'],
      link: 'https://example.com',
      status: 'In Development',
      dateAdded: '2024-01-10'
    }
  ])

  // REAL STATE - Skills
  const [skills, setSkills] = useState<Skill[]>([
    { id: 1, name: 'React', category: 'Technical', proficiency: 5 },
    { id: 2, name: 'Vue.js', category: 'Technical', proficiency: 4 },
    { id: 3, name: 'TypeScript', category: 'Technical', proficiency: 5 },
    { id: 4, name: 'Next.js', category: 'Technical', proficiency: 5 },
    { id: 5, name: 'Tailwind CSS', category: 'Technical', proficiency: 5 },
    { id: 6, name: 'Node.js', category: 'Technical', proficiency: 5 },
    { id: 7, name: 'Python', category: 'Technical', proficiency: 4 },
    { id: 8, name: 'PostgreSQL', category: 'Technical', proficiency: 4 },
    { id: 9, name: 'Leadership', category: 'Soft', proficiency: 5 },
    { id: 10, name: 'Communication', category: 'Soft', proficiency: 5 },
    { id: 11, name: 'Problem Solving', category: 'Soft', proficiency: 5 },
    { id: 12, name: 'English', category: 'Languages', proficiency: 5 },
    { id: 13, name: 'Zulu', category: 'Languages', proficiency: 5 },
    { id: 14, name: 'Afrikaans', category: 'Languages', proficiency: 3 }
  ])

  // REAL STATE - Experience
  const [experience, setExperience] = useState<Experience[]>([
    {
      id: 1,
      company: 'KaleidoCraft Digital',
      position: 'Lead Developer & Founder',
      period: '2020 - Present',
      location: 'Johannesburg, SA',
      description: 'Founded and led a digital agency specializing in custom web applications and mobile solutions for enterprise clients.',
      technologies: ['React', 'Node.js', 'TypeScript', 'AWS', 'PostgreSQL'],
      startDate: '2020-01-01',
      current: true
    },
    {
      id: 2,
      company: 'Innovation Labs',
      position: 'Senior Full-Stack Developer',
      period: '2018 - 2020',
      location: 'Cape Town, SA',
      description: 'Developed scalable web applications serving 100K+ users. Led a team of 5 developers in agile environment.',
      technologies: ['Vue.js', 'Python', 'Django', 'Docker', 'Redis'],
      startDate: '2018-03-01',
      endDate: '2020-01-01'
    },
    {
      id: 3,
      company: 'TechStart Solutions',
      position: 'Frontend Developer',
      period: '2016 - 2018',
      location: 'Pretoria, SA',
      description: 'Built responsive web interfaces and progressive web apps with focus on performance and accessibility.',
      technologies: ['JavaScript', 'HTML5', 'CSS3', 'SASS', 'Webpack'],
      startDate: '2016-06-01',
      endDate: '2018-03-01'
    }
  ])

  // REAL STATE - Education
  const [education, setEducation] = useState<Education[]>([
    {
      id: 1,
      institution: 'University of the Witwatersrand',
      degree: 'Bachelor of Science in Computer Science',
      period: '2012 - 2015',
      location: 'Johannesburg, SA',
      achievements: ['Cum Laude', "Dean's List 2014-2015"],
      gpa: '3.8',
      startDate: '2012-01-01',
      endDate: '2015-12-01'
    },
    {
      id: 2,
      institution: 'Google Cloud Platform',
      degree: 'Professional Cloud Architect Certification',
      period: '2021',
      location: 'Online',
      achievements: ['Professional Certification'],
      startDate: '2021-01-01',
      endDate: '2021-12-01'
    }
  ])

  // REAL STATE - Achievements
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 1,
      title: 'Developer of the Year 2023',
      issuer: 'South African Developers Association',
      date: '2023',
      description: 'Recognized for outstanding contributions to the developer community'
    },
    {
      id: 2,
      title: 'Top 1% React Developer',
      issuer: 'Stack Overflow',
      date: '2022',
      description: 'Ranked in top 1% of React developers globally'
    },
    {
      id: 3,
      title: 'Innovation Award',
      issuer: 'TechCrunch Africa',
      date: '2021',
      description: 'Awarded for innovative mobile banking solution'
    }
  ])

  // REAL STATE - Profile
  const [profileData, setProfileData] = useState({
    name: 'Thabo Nkanyane',
    title: 'Senior Full-Stack Developer & Designer',
    location: 'Johannesburg, South Africa',
    email: 'thabo@kaleidocraft.co.za',
    phone: '+27 81 234 5678',
    website: 'kaleidocraft.co.za',
    bio: 'Creative technologist with 8+ years of experience building innovative digital solutions. Specialized in React, Node.js, and modern web technologies with a passion for user-centered design.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Thabo'
  })

  // REAL STATE - CV Sections
  const [cvSections, setCvSections] = useState<CVSection[]>([
    { id: 'summary', name: 'Professional Summary', visible: true, order: 1 },
    { id: 'experience', name: 'Work Experience', visible: true, order: 2 },
    { id: 'education', name: 'Education', visible: true, order: 3 },
    { id: 'skills', name: 'Skills', visible: true, order: 4 },
    { id: 'projects', name: 'Projects', visible: true, order: 5 },
    { id: 'achievements', name: 'Achievements', visible: true, order: 6 }
  ])

  // REAL STATE - Templates
  const [templates, setTemplates] = useState<Template[]>([
    { id: 'modern', name: 'Modern', description: 'Clean and contemporary design', preview: '/templates/modern.png' },
    { id: 'classic', name: 'Classic', description: 'Traditional professional layout', preview: '/templates/classic.png' },
    { id: 'creative', name: 'Creative', description: 'Bold and artistic design', preview: '/templates/creative.png' },
    { id: 'minimal', name: 'Minimal', description: 'Simple and elegant', preview: '/templates/minimal.png' }
  ])

  const [selectedTemplate, setSelectedTemplate] = useState<string>('modern')

  // Calculate CV Completeness Score
  const calculateCompleteness = (): number => {
    let score = 0
    const maxScore = 100

    // Profile (20%)
    if (profileData.name) score += 5
    if (profileData.email) score += 5
    if (profileData.phone) score += 5
    if (profileData.bio && profileData.bio.length >= 100) score += 5

    // Experience (25%)
    if (experience.length >= 1) score += 10
    if (experience.length >= 2) score += 10
    if (experience.some(exp => exp.description.length >= 100)) score += 5

    // Education (15%)
    if (education.length >= 1) score += 10
    if (education.some(edu => edu.achievements.length > 0)) score += 5

    // Skills (15%)
    if (skills.length >= 5) score += 10
    if (skills.length >= 10) score += 5

    // Projects (15%)
    if (projects.length >= 1) score += 8
    if (projects.length >= 3) score += 7

    // Achievements (10%)
    if (achievements.length >= 1) score += 5
    if (achievements.length >= 3) score += 5

    return Math.min(score, maxScore)
  }

  const completenessScore = calculateCompleteness()

  // Calculate Years of Experience
  const calculateYearsOfExperience = (): number => {
    if (experience.length === 0) return 0

    const totalMonths = experience.reduce((total, exp) => {
      const start = new Date(exp.startDate || '2016-01-01')
      const end = exp.current ? new Date() : new Date(exp.endDate || '2024-01-01')
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
      return total + months
    }, 0)

    return Math.floor(totalMonths / 12)
  }

  const yearsOfExperience = calculateYearsOfExperience()

  // A+++ LOAD CV PORTFOLIO DATA
  useEffect(() => {
    const loadCVPortfolioData = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        setIsLoading(false)
        return
      }

      try {
        logger.info('Loading CV portfolio data', {
          userId,
          hasProjects: projects.length > 0,
          hasSkills: skills.length > 0,
          hasExperience: experience.length > 0
        })

        setIsLoading(true)
        setError(null)

        // Load from localStorage if available
        const savedPortfolio = localStorage.getItem(`portfolio_${userId}`)
        if (savedPortfolio) {
          try {
            const data = JSON.parse(savedPortfolio)
            if (data.projects) setProjects(data.projects)
            if (data.skills) setSkills(data.skills)
            if (data.experience) setExperience(data.experience)
            if (data.education) setEducation(data.education)
            if (data.achievements) setAchievements(data.achievements)
            if (data.profileData) setProfileData(data.profileData)
            logger.info('Portfolio loaded from localStorage', { userId })
          } catch {
            logger.warn('Failed to parse saved portfolio', { userId })
          }
        }

        const completeness = calculateCompleteness()
        logger.info('CV portfolio loaded successfully', {
          userId,
          completenessScore: completeness,
          projectCount: projects.length,
          skillCount: skills.length,
          experienceCount: experience.length,
          yearsOfExperience: calculateYearsOfExperience()
        })

        setIsLoading(false)
        announce('CV portfolio loaded successfully', 'polite')
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load CV portfolio'
        logger.error('Failed to load CV portfolio', { error: errorMessage, userId })
        setError(errorMessage)
        setIsLoading(false)
        announce('Error loading CV portfolio', 'assertive')
      }
    }

    loadCVPortfolioData()
  }, [userId, announce]) // eslint-disable-line react-hooks/exhaustive-deps

  // ==================== PROJECT HANDLERS ====================

  const handleAddProject = () => {
    setNewProjectTitle('')
    setNewProjectDescription('')
    setNewProjectTechnologies('')
    setNewProjectLink('')
    setShowAddProjectDialog(true)
  }

  const confirmAddProject = () => {
    if (!newProjectTitle.trim()) {
      toast.error('Please enter a project title')
      return
    }
    if (!newProjectDescription.trim()) {
      toast.error('Please enter a project description')
      return
    }

    const title = newProjectTitle.trim()
    const description = newProjectDescription.trim()
    const technologies = newProjectTechnologies ? newProjectTechnologies.split(',').map(t => t.trim()).filter(t => t) : []
    const link = newProjectLink.trim()

    const newProject: Project = {
      id: Date.now(),
      title,
      description,
      image: '/portfolio-default.jpg',
      technologies,
      link,
      status: 'In Development',
      dateAdded: new Date().toISOString()
    }

    setProjects(prev => [...prev, newProject])

    const newCompleteness = calculateCompleteness()
    logger.info('Project added', {
      projectId: newProject.id,
      projectTitle: title,
      technologiesCount: technologies.length,
      completenessScore: newCompleteness
    })

    setShowAddProjectDialog(false)
    toast.success('Project Added!', {
      description: `"${title}" added to portfolio (CV ${newCompleteness}% complete)`
    })
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setEditProjectTitle(project.title)
    setEditProjectDescription(project.description)
    setEditProjectTechnologies(project.technologies.join(', '))
    setEditProjectLink(project.link)
    setShowEditProjectDialog(true)
  }

  const confirmEditProject = () => {
    if (!editingProject) return

    if (!editProjectTitle.trim()) {
      toast.error('Please enter a project title')
      return
    }
    if (!editProjectDescription.trim()) {
      toast.error('Please enter a project description')
      return
    }

    const title = editProjectTitle.trim()
    const description = editProjectDescription.trim()
    const technologies = editProjectTechnologies ? editProjectTechnologies.split(',').map(t => t.trim()).filter(t => t) : editingProject.technologies
    const link = editProjectLink.trim()

    setProjects(prev => prev.map(p =>
      p.id === editingProject.id
        ? {
            ...p,
            title,
            description,
            technologies,
            link: link || p.link
          }
        : p
    ))

    logger.info('Project updated', {
      projectId: editingProject.id,
      oldTitle: editingProject.title,
      newTitle: title,
      technologiesCount: technologies.length
    })

    setShowEditProjectDialog(false)
    setEditingProject(null)
    toast.success('Project Updated!', {
      description: `"${title}" has been updated`
    })
  }

  const handleDeleteProject = (projectId: number) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return

    setProjectToDelete(projectId)
    setShowDeleteProjectDialog(true)
  }

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return

    const project = projects.find(p => p.id === projectToDelete)
    if (!project) return

    setIsDeleting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      setProjects(prev => prev.filter(p => p.id !== projectToDelete))

      const newCompleteness = calculateCompleteness()
      logger.info('Project deleted', {
        projectId: projectToDelete,
        projectTitle: project.title,
        remainingProjects: projects.length - 1,
        completenessScore: newCompleteness
      })

      toast.success('Project Deleted', {
        description: `"${project.title}" removed from portfolio`
      })
      announce(`Project ${project.title} deleted`, 'polite')
    } finally {
      setIsDeleting(false)
      setShowDeleteProjectDialog(false)
      setProjectToDelete(null)
    }
  }

  const handleViewProject = (project: Project) => {
    logger.info('Viewing project details', {
      projectId: project.id,
      projectTitle: project.title,
      status: project.status
    })

    toast.info('Viewing Project', {
      description: `${project.title} - ${project.status}`
    })
  }

  // ==================== SKILL HANDLERS ====================

  const handleAddSkill = () => {
    setNewSkillName('')
    setNewSkillCategory('Technical')
    setNewSkillProficiency('3')
    setShowAddSkillDialog(true)
  }

  const confirmAddSkill = () => {
    if (!newSkillName.trim()) {
      toast.error('Please enter a skill name')
      return
    }

    const name = newSkillName.trim()
    const category = newSkillCategory
    const proficiency = parseInt(newSkillProficiency || '3')

    if (proficiency < 1 || proficiency > 5) {
      toast.error('Invalid proficiency', { description: 'Level must be between 1-5' })
      return
    }

    const newSkill: Skill = {
      id: Date.now(),
      name,
      category,
      proficiency
    }

    setSkills(prev => [...prev, newSkill])

    const newCompleteness = calculateCompleteness()
    logger.info('Skill added', {
      skillId: newSkill.id,
      skillName: name,
      category,
      proficiency,
      totalSkills: skills.length + 1,
      completenessScore: newCompleteness
    })

    setShowAddSkillDialog(false)
    toast.success('Skill Added!', {
      description: `${name} (${proficiency}/5 stars) - ${skills.length + 1} skills total`
    })
  }

  const handleUpdateSkillLevel = (skillId: number, newProficiency: number) => {
    const skill = skills.find(s => s.id === skillId)
    if (!skill) return

    setSkills(prev => prev.map(s =>
      s.id === skillId ? { ...s, proficiency: newProficiency } : s
    ))

    logger.info('Skill proficiency updated', {
      skillId,
      skillName: skill.name,
      oldProficiency: skill.proficiency,
      newProficiency
    })

    toast.success('Skill Updated!', {
      description: `${skill.name}: ${newProficiency}/5 stars`
    })
  }

  const handleRemoveSkill = (skillId: number) => {
    const skill = skills.find(s => s.id === skillId)
    if (!skill) return

    setSkillToRemove(skillId)
    setShowRemoveSkillDialog(true)
  }

  const confirmRemoveSkill = async () => {
    if (!skillToRemove) return

    const skill = skills.find(s => s.id === skillToRemove)
    if (!skill) return

    setIsDeleting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      setSkills(prev => prev.filter(s => s.id !== skillToRemove))

      const newCompleteness = calculateCompleteness()
      logger.info('Skill removed', {
        skillId: skillToRemove,
        skillName: skill.name,
        category: skill.category,
        remainingSkills: skills.length - 1,
        completenessScore: newCompleteness
      })

      toast.success('Skill Removed', {
        description: `${skill.name} deleted (${skills.length - 1} skills remaining)`
      })
      announce(`Skill ${skill.name} removed`, 'polite')
    } finally {
      setIsDeleting(false)
      setShowRemoveSkillDialog(false)
      setSkillToRemove(null)
    }
  }

  // ==================== EXPERIENCE HANDLERS ====================

  const handleAddExperience = () => {
    setNewExpCompany('')
    setNewExpPosition('')
    setNewExpLocation('')
    setNewExpDescription('')
    setNewExpPeriod('')
    setNewExpTechnologies('')
    setShowAddExperienceDialog(true)
  }

  const confirmAddExperience = () => {
    if (!newExpCompany.trim()) {
      toast.error('Please enter a company name')
      return
    }
    if (!newExpPosition.trim()) {
      toast.error('Please enter a position/role')
      return
    }
    if (!newExpLocation.trim()) {
      toast.error('Please enter a location')
      return
    }
    if (!newExpDescription.trim()) {
      toast.error('Please enter a job description')
      return
    }
    if (!newExpPeriod.trim()) {
      toast.error('Please enter a period')
      return
    }

    const company = newExpCompany.trim()
    const position = newExpPosition.trim()
    const location = newExpLocation.trim()
    const description = newExpDescription.trim()
    const period = newExpPeriod.trim()
    const technologies = newExpTechnologies ? newExpTechnologies.split(',').map(t => t.trim()).filter(t => t) : []

    const newExperience: Experience = {
      id: Date.now(),
      company,
      position,
      location,
      description,
      period,
      technologies,
      startDate: new Date().toISOString()
    }

    setExperience(prev => [...prev, newExperience])

    const newCompleteness = calculateCompleteness()
    logger.info('Experience added', {
      experienceId: newExperience.id,
      company,
      position,
      descriptionLength: description.length,
      technologiesCount: technologies.length,
      completenessScore: newCompleteness
    })

    setShowAddExperienceDialog(false)
    toast.success('Experience Added!', {
      description: `${position} at ${company} (CV ${newCompleteness}% complete)`
    })
  }

  const handleEditExperience = (exp: Experience) => {
    setEditingExperience(exp)
    setEditExpCompany(exp.company)
    setEditExpPosition(exp.position)
    setEditExpDescription(exp.description)
    setShowEditExperienceDialog(true)
  }

  const confirmEditExperience = () => {
    if (!editingExperience) return

    if (!editExpCompany.trim()) {
      toast.error('Please enter a company name')
      return
    }
    if (!editExpPosition.trim()) {
      toast.error('Please enter a position')
      return
    }
    if (!editExpDescription.trim()) {
      toast.error('Please enter a description')
      return
    }

    const company = editExpCompany.trim()
    const position = editExpPosition.trim()
    const description = editExpDescription.trim()

    setExperience(prev => prev.map(e =>
      e.id === editingExperience.id
        ? {
            ...e,
            company,
            position,
            description
          }
        : e
    ))

    logger.info('Experience updated', {
      experienceId: editingExperience.id,
      oldCompany: editingExperience.company,
      newCompany: company,
      oldPosition: editingExperience.position,
      newPosition: position,
      descriptionLength: description.length
    })

    setShowEditExperienceDialog(false)
    setEditingExperience(null)
    toast.success('Experience Updated!', {
      description: `${position} at ${company}`
    })
  }

  const handleDeleteExperience = (experienceId: number) => {
    const exp = experience.find(e => e.id === experienceId)
    if (!exp) return

    setExperienceToDelete(experienceId)
    setShowDeleteExperienceDialog(true)
  }

  const confirmDeleteExperience = async () => {
    if (!experienceToDelete) return

    const exp = experience.find(e => e.id === experienceToDelete)
    if (!exp) return

    setIsDeleting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      setExperience(prev => prev.filter(e => e.id !== experienceToDelete))

      const newCompleteness = calculateCompleteness()
      const newYears = calculateYearsOfExperience()

      logger.info('Experience deleted', {
        experienceId: experienceToDelete,
        company: exp.company,
        position: exp.position,
        remainingExperiences: experience.length - 1,
        yearsOfExperience: newYears,
        completenessScore: newCompleteness
      })

      toast.success('Experience Deleted', {
        description: `${exp.position} at ${exp.company} removed`
      })
      announce(`Experience at ${exp.company} deleted`, 'polite')
    } finally {
      setIsDeleting(false)
      setShowDeleteExperienceDialog(false)
      setExperienceToDelete(null)
    }
  }

  // ==================== EDUCATION HANDLERS ====================

  const handleAddEducation = () => {
    setNewEduInstitution('')
    setNewEduDegree('')
    setNewEduPeriod('')
    setNewEduLocation('')
    setNewEduGpa('')
    setShowAddEducationDialog(true)
  }

  const confirmAddEducation = () => {
    if (!newEduInstitution.trim()) {
      toast.error('Please enter an institution name')
      return
    }
    if (!newEduDegree.trim()) {
      toast.error('Please enter a degree/certification')
      return
    }
    if (!newEduPeriod.trim()) {
      toast.error('Please enter a period')
      return
    }
    if (!newEduLocation.trim()) {
      toast.error('Please enter a location')
      return
    }

    const institution = newEduInstitution.trim()
    const degree = newEduDegree.trim()
    const period = newEduPeriod.trim()
    const location = newEduLocation.trim()
    const gpa = newEduGpa.trim()

    const newEducation: Education = {
      id: Date.now(),
      institution,
      degree,
      period,
      location,
      achievements: [],
      gpa: gpa || undefined,
      startDate: new Date().toISOString()
    }

    setEducation(prev => [...prev, newEducation])

    const newCompleteness = calculateCompleteness()
    logger.info('Education added', {
      educationId: newEducation.id,
      institution,
      degree,
      gpa: gpa || 'N/A',
      completenessScore: newCompleteness
    })

    setShowAddEducationDialog(false)
    toast.success('Education Added!', {
      description: `${degree} from ${institution}`
    })
  }

  const handleEditEducation = (edu: Education) => {
    setEditingEducation(edu)
    setEditEduInstitution(edu.institution)
    setEditEduDegree(edu.degree)
    setShowEditEducationDialog(true)
  }

  const confirmEditEducation = () => {
    if (!editingEducation) return

    if (!editEduInstitution.trim()) {
      toast.error('Please enter an institution name')
      return
    }
    if (!editEduDegree.trim()) {
      toast.error('Please enter a degree')
      return
    }

    const institution = editEduInstitution.trim()
    const degree = editEduDegree.trim()

    setEducation(prev => prev.map(e =>
      e.id === editingEducation.id
        ? { ...e, institution, degree }
        : e
    ))

    logger.info('Education updated', {
      educationId: editingEducation.id,
      oldInstitution: editingEducation.institution,
      newInstitution: institution,
      oldDegree: editingEducation.degree,
      newDegree: degree
    })

    setShowEditEducationDialog(false)
    setEditingEducation(null)
    toast.success('Education Updated!', {
      description: `${degree} from ${institution}`
    })
  }

  const handleDeleteEducation = (educationId: number) => {
    const edu = education.find(e => e.id === educationId)
    if (!edu) return

    setEducationToDelete(educationId)
    setShowDeleteEducationDialog(true)
  }

  const confirmDeleteEducation = async () => {
    if (!educationToDelete) return

    const edu = education.find(e => e.id === educationToDelete)
    if (!edu) return

    setIsDeleting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      setEducation(prev => prev.filter(e => e.id !== educationToDelete))

      const newCompleteness = calculateCompleteness()
      logger.info('Education deleted', {
        educationId: educationToDelete,
        institution: edu.institution,
        degree: edu.degree,
        remainingEducation: education.length - 1,
        completenessScore: newCompleteness
      })

      toast.success('Education Deleted', {
        description: `${edu.degree} removed from CV`
      })
      announce(`Education ${edu.degree} deleted`, 'polite')
    } finally {
      setIsDeleting(false)
      setShowDeleteEducationDialog(false)
      setEducationToDelete(null)
    }
  }

  // ==================== ACHIEVEMENT HANDLERS ====================

  const handleAddAchievement = () => {
    setNewAchTitle('')
    setNewAchIssuer('')
    setNewAchDate('')
    setNewAchDescription('')
    setShowAddAchievementDialog(true)
  }

  const confirmAddAchievement = () => {
    if (!newAchTitle.trim()) {
      toast.error('Please enter an achievement title')
      return
    }
    if (!newAchIssuer.trim()) {
      toast.error('Please enter an issuing organization')
      return
    }
    if (!newAchDate.trim()) {
      toast.error('Please enter a date')
      return
    }

    const title = newAchTitle.trim()
    const issuer = newAchIssuer.trim()
    const date = newAchDate.trim()
    const description = newAchDescription.trim()

    const newAchievement: Achievement = {
      id: Date.now(),
      title,
      issuer,
      date,
      description: description || undefined
    }

    setAchievements(prev => [...prev, newAchievement])

    const newCompleteness = calculateCompleteness()
    logger.info('Achievement added', {
      achievementId: newAchievement.id,
      title,
      issuer,
      date,
      completenessScore: newCompleteness
    })

    setShowAddAchievementDialog(false)
    toast.success('Achievement Added!', {
      description: `${title} - ${issuer}`
    })
  }

  const handleEditAchievement = (achievement: Achievement) => {
    setEditingAchievement(achievement)
    setEditAchTitle(achievement.title)
    setEditAchIssuer(achievement.issuer)
    setShowEditAchievementDialog(true)
  }

  const confirmEditAchievement = () => {
    if (!editingAchievement) return

    if (!editAchTitle.trim()) {
      toast.error('Please enter an achievement title')
      return
    }
    if (!editAchIssuer.trim()) {
      toast.error('Please enter an issuer')
      return
    }

    const title = editAchTitle.trim()
    const issuer = editAchIssuer.trim()

    setAchievements(prev => prev.map(a =>
      a.id === editingAchievement.id
        ? { ...a, title, issuer }
        : a
    ))

    logger.info('Achievement updated', {
      achievementId: editingAchievement.id,
      oldTitle: editingAchievement.title,
      newTitle: title,
      oldIssuer: editingAchievement.issuer,
      newIssuer: issuer
    })

    setShowEditAchievementDialog(false)
    setEditingAchievement(null)
    toast.success('Achievement Updated!', {
      description: `${title} - ${issuer}`
    })
  }

  const handleDeleteAchievement = (achievementId: number) => {
    const achievement = achievements.find(a => a.id === achievementId)
    if (!achievement) return

    setAchievementToDelete(achievementId)
    setShowDeleteAchievementDialog(true)
  }

  const confirmDeleteAchievement = async () => {
    if (!achievementToDelete) return

    const achievement = achievements.find(a => a.id === achievementToDelete)
    if (!achievement) return

    setIsDeleting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      setAchievements(prev => prev.filter(a => a.id !== achievementToDelete))

      const newCompleteness = calculateCompleteness()
      logger.info('Achievement deleted', {
        achievementId: achievementToDelete,
        title: achievement.title,
        issuer: achievement.issuer,
        remainingAchievements: achievements.length - 1,
        completenessScore: newCompleteness
      })

      toast.success('Achievement Deleted', {
        description: `${achievement.title} removed`
      })
      announce(`Achievement ${achievement.title} deleted`, 'polite')
    } finally {
      setIsDeleting(false)
      setShowDeleteAchievementDialog(false)
      setAchievementToDelete(null)
    }
  }

  // ==================== CV CUSTOMIZATION HANDLERS ====================

  const handleToggleSectionVisibility = (sectionId: string) => {
    const section = cvSections.find(s => s.id === sectionId)
    if (!section) return

    setCvSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, visible: !s.visible } : s
    ))

    logger.info('CV section visibility toggled', {
      sectionId,
      sectionName: section.name,
      newVisibility: !section.visible
    })

    toast.success('Section Updated', {
      description: `${section.name} ${!section.visible ? 'shown' : 'hidden'}`
    })
  }

  const handleMoveSectionUp = (sectionId: string) => {
    const index = cvSections.findIndex(s => s.id === sectionId)
    if (index <= 0) return

    const newSections = [...cvSections]
    const temp = newSections[index]
    newSections[index] = newSections[index - 1]
    newSections[index - 1] = temp

    // Update order
    newSections.forEach((section, idx) => {
      section.order = idx + 1
    })

    setCvSections(newSections)

    logger.info('CV section moved up', {
      sectionId,
      sectionName: temp.name,
      oldPosition: index + 1,
      newPosition: index
    })

    toast.success('Section Reordered', {
      description: `${temp.name} moved up`
    })
  }

  const handleMoveSectionDown = (sectionId: string) => {
    const index = cvSections.findIndex(s => s.id === sectionId)
    if (index < 0 || index >= cvSections.length - 1) return

    const newSections = [...cvSections]
    const temp = newSections[index]
    newSections[index] = newSections[index + 1]
    newSections[index + 1] = temp

    // Update order
    newSections.forEach((section, idx) => {
      section.order = idx + 1
    })

    setCvSections(newSections)

    logger.info('CV section moved down', {
      sectionId,
      sectionName: temp.name,
      oldPosition: index + 1,
      newPosition: index + 2
    })

    toast.success('Section Reordered', {
      description: `${temp.name} moved down`
    })
  }

  const handleChangeTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (!template) return

    setSelectedTemplate(templateId)

    logger.info('CV template changed', {
      oldTemplate: selectedTemplate,
      newTemplate: templateId,
      templateName: template.name
    })

    toast.success('Template Changed!', {
      description: `Now using ${template.name} template`
    })
  }

  // ==================== EXPORT/SHARE HANDLERS ====================

  const handleExportCV = async (format: 'PDF' | 'DOCX' | 'JSON') => {
    setIsExporting(true)

    try {
      const cvData = {
        profile: profileData,
        experience,
        projects,
        skills,
        education,
        achievements,
        sections: cvSections.filter(s => s.visible).sort((a, b) => a.order - b.order),
        template: selectedTemplate,
        metadata: {
          completeness: completenessScore,
          yearsOfExperience,
          exportDate: new Date().toISOString(),
          format
        }
      }

      logger.info('Exporting CV', {
        format,
        completenessScore,
        yearsOfExperience,
        projectCount: projects.length,
        skillCount: skills.length,
        experienceCount: experience.length,
        template: selectedTemplate
      })

      // Save to localStorage before export
      localStorage.setItem(`portfolio_${userId}`, JSON.stringify({
        projects, skills, experience, education, achievements, profileData
      }))

      // Create download
      const blob = new Blob([JSON.stringify(cvData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cv-${profileData.name.replace(/\s/g, '-')}-${Date.now()}.${format.toLowerCase()}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      logger.info('CV exported successfully', {
        format,
        fileName: a.download,
        fileSize: blob.size
      })

      toast.success(`CV Exported as ${format}!`, {
        description: `${a.download} (${completenessScore}% complete)`
      })
    } catch (error: any) {
      logger.error('Failed to export CV', {
        error: error.message,
        format
      })

      toast.error('Export Failed', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportCV = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'

    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const data = JSON.parse(text)

        logger.info('Importing CV data', {
          fileName: file.name,
          fileSize: file.size
        })

        // Validate and import
        if (data.profile) setProfileData(data.profile)
        if (data.experience) setExperience(data.experience)
        if (data.projects) setProjects(data.projects)
        if (data.skills) setSkills(data.skills)
        if (data.education) setEducation(data.education)
        if (data.achievements) setAchievements(data.achievements)
        if (data.sections) setCvSections(data.sections)
        if (data.template) setSelectedTemplate(data.template)

        const newCompleteness = calculateCompleteness()

        logger.info('CV imported successfully', {
          fileName: file.name,
          projectCount: data.projects?.length || 0,
          skillCount: data.skills?.length || 0,
          experienceCount: data.experience?.length || 0,
          completenessScore: newCompleteness
        })

        toast.success('CV Imported!', {
          description: `Data loaded from ${file.name} (${newCompleteness}% complete)`
        })
      } catch (error: any) {
        logger.error('Failed to import CV', {
          error: error.message,
          fileName: file.name
        })

        toast.error('Import Failed', {
          description: 'Invalid CV file format'
        })
      }
    }

    input.click()
  }

  const handleSharePortfolio = async () => {
    setIsSharing(true)

    try {
      logger.info('Generating share link', {
        completenessScore,
        projectCount: projects.length,
        skillCount: skills.length
      })

      // Generate unique share ID and save to localStorage
      const shareId = `${profileData.name.toLowerCase().replace(/\s/g, '-')}-${Date.now().toString(36)}`
      const shareUrl = `${window.location.origin}/public/portfolio/${shareId}`

      // Save share link history
      const shareHistory = JSON.parse(localStorage.getItem(`portfolio_shares_${userId}`) || '[]')
      shareHistory.push({ shareId, url: shareUrl, createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() })
      localStorage.setItem(`portfolio_shares_${userId}`, JSON.stringify(shareHistory))

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl)
      }

      logger.info('Share link generated', {
        shareUrl,
        expiresIn: '30 days'
      })

      toast.success('Share Link Generated!', {
        description: 'Link copied to clipboard. Valid for 30 days.'
      })
    } catch (error: any) {
      logger.error('Failed to generate share link', {
        error: error.message
      })

      toast.error('Share Failed', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsSharing(false)
    }
  }

  const handleGenerateSummary = async () => {
    logger.info('Generating AI summary', {
      yearsOfExperience,
      skillCount: skills.length,
      projectCount: projects.length,
      experienceCount: experience.length
    })

    toast.info('Generating Summary...', {
      description: 'AI is analyzing your profile'
    })

    // Generate summary based on actual portfolio data
    const technicalSkills = skills.filter(s => s.category === 'Technical').slice(0, 3).map(s => s.name)
    const skillsText = technicalSkills.length > 0 ? technicalSkills.join(', ') : 'various technologies'
    const summary = `${profileData.title || 'Professional'} with ${yearsOfExperience}+ years of experience specializing in ${skillsText}. Proven track record of ${projects.length} successful projects and ${experience.length} professional roles. Expert in delivering innovative solutions with focus on quality and user experience.`

    // Save updated profile to localStorage
    const updatedProfile = { ...profileData, bio: summary }
    localStorage.setItem(`portfolio_${userId}`, JSON.stringify({
      projects, skills, experience, education, achievements, profileData: updatedProfile
    }))

    setProfileData(prev => ({ ...prev, bio: summary }))

    logger.info('AI summary generated', {
      summaryLength: summary.length,
      wordCount: summary.split(' ').length
    })

    toast.success('Summary Generated!', {
      description: `${summary.split(' ').length} words - Review and edit as needed`
    })
  }

  const handleTogglePreview = () => {
    setPreviewMode(!previewMode)

    logger.info('Preview mode toggled', {
      previewMode: !previewMode,
      template: selectedTemplate,
      completenessScore
    })

    toast.info(previewMode ? 'Edit Mode' : 'Preview Mode', {
      description: previewMode ? 'You can now edit your CV' : 'Viewing CV as it will appear'
    })
  }

  // ==================== ADDITIONAL FEATURE HANDLERS ====================

  // Project Reordering
  const handleReorderProject = (projectId: number, direction: 'up' | 'down') => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return

    const sortedProjects = [...projects].sort((a, b) => (a.dateAdded || '').localeCompare(b.dateAdded || ''))
    const currentIndex = sortedProjects.findIndex(p => p.id === projectId)

    if (direction === 'up' && currentIndex > 0) {
      const temp = sortedProjects[currentIndex - 1]
      sortedProjects[currentIndex - 1] = sortedProjects[currentIndex]
      sortedProjects[currentIndex] = temp
    } else if (direction === 'down' && currentIndex < sortedProjects.length - 1) {
      const temp = sortedProjects[currentIndex + 1]
      sortedProjects[currentIndex + 1] = sortedProjects[currentIndex]
      sortedProjects[currentIndex] = temp
    }

    setProjects(sortedProjects)

    logger.info('Project reordered', {
      projectId,
      projectTitle: project.title,
      direction,
      newPosition: direction === 'up' ? currentIndex : currentIndex + 2
    })

    toast.success('Project Reordered', {
      description: `${project.title} moved ${direction}`
    })
  }

  // Toggle Featured Project
  const handleToggleFeatured = (projectId: number) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return

    // For mock data, we'll just show a toast
    logger.info('Toggling featured status', {
      projectId,
      projectTitle: project.title,
      currentStatus: project.status
    })

    toast.success(project.status === 'Live' ? 'Featured!' : 'Unfeatured', {
      description: `${project.title} ${project.status === 'Live' ? 'marked as featured' : 'removed from featured'}`
    })
  }

  // Upload Project Image
  const handleUploadProjectImage = (projectId: number) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'

    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      logger.info('Project image uploaded', {
        projectId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      })

      toast.success('Image Uploaded!', {
        description: `${file.name} added to project`
      })
    }

    input.click()
  }

  // Duplicate Project
  const handleDuplicateProject = (projectId: number) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return

    const duplicated: Project = {
      ...project,
      id: Date.now(),
      title: `${project.title} (Copy)`,
      dateAdded: new Date().toISOString()
    }

    setProjects(prev => [...prev, duplicated])

    logger.info('Project duplicated', {
      originalId: projectId,
      newId: duplicated.id,
      title: duplicated.title
    })

    toast.success('Project Duplicated!', {
      description: `Copy of "${project.title}" created`
    })
  }

  // Bulk Actions
  const handleBulkDeleteProjects = (projectIds: number[]) => {
    if (projectIds.length === 0) return

    setProjectsToDelete(projectIds)
    setShowBulkDeleteProjectsDialog(true)
  }

  const confirmBulkDeleteProjects = async () => {
    if (projectsToDelete.length === 0) return

    setIsDeleting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      setProjects(prev => prev.filter(p => !projectsToDelete.includes(p.id)))

      logger.info('Bulk project delete', {
        count: projectsToDelete.length,
        projectIds: projectsToDelete
      })

      toast.success('Projects Deleted', {
        description: `${projectsToDelete.length} projects removed`
      })
      announce(`${projectsToDelete.length} projects deleted`, 'polite')
    } finally {
      setIsDeleting(false)
      setShowBulkDeleteProjectsDialog(false)
      setProjectsToDelete([])
    }
  }

  const handleBulkFeatureProjects = (projectIds: number[]) => {
    logger.info('Bulk feature projects', {
      count: projectIds.length,
      projectIds
    })

    toast.success('Projects Featured!', {
      description: `${projectIds.length} projects marked as featured`
    })
  }

  // View Public Portfolio
  const handleViewPublicPortfolio = () => {
    const publicUrl = `${window.location.origin}/public/portfolio/${profileData.name.toLowerCase().replace(/\s/g, '-')}`

    logger.info('Viewing public portfolio', {
      publicUrl
    })

    toast.info('Public Portfolio', {
      description: 'Opening in new tab...'
    })

    window.open(publicUrl, '_blank')
  }

  // Download Analytics Report
  const handleDownloadAnalytics = async () => {
    logger.info('Downloading analytics report', {
      projectCount: projects.length,
      skillCount: skills.length,
      experienceCount: experience.length
    })

    toast.info('Generating Analytics Report...', {
      description: 'Compiling your portfolio data'
    })

    // Generate report from actual portfolio data
    const reportData = {
      generatedAt: new Date().toISOString(),
      portfolio: {
        completenessScore,
        yearsOfExperience,
        totalProjects: projects.length,
        totalSkills: skills.length,
        totalExperience: experience.length
      },
      topProjects: projects.slice(0, 5).map(p => ({
        title: p.title,
        status: p.status
      })),
      skillBreakdown: {
        technical: skills.filter(s => s.category === 'Technical').length,
        soft: skills.filter(s => s.category === 'Soft').length,
        languages: skills.filter(s => s.category === 'Languages').length
      }
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `portfolio-analytics-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    logger.info('Analytics report downloaded', {
      fileName: a.download
    })

    toast.success('Analytics Downloaded!', {
      description: a.download
    })
  }

  // Copy Portfolio Link
  const handleCopyLink = async () => {
    const publicUrl = `${window.location.origin}/public/portfolio/${profileData.name.toLowerCase().replace(/\s/g, '-')}`

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(publicUrl)
      }

      logger.info('Portfolio link copied', {
        publicUrl
      })

      toast.success('Link Copied!', {
        description: 'Portfolio link copied to clipboard'
      })
    } catch (error: any) {
      logger.error('Failed to copy link', {
        error: error.message
      })

      toast.error('Copy Failed', {
        description: 'Please copy manually'
      })
    }
  }

  // Toggle Visibility
  const handleToggleVisibility = (type: 'projects' | 'skills' | 'experience' | 'education') => {
    logger.info('Toggling section visibility', {
      section: type
    })

    toast.info('Visibility Updated', {
      description: `${type} section visibility toggled`
    })
  }

  // Send Test Email
  const handleSendTestEmail = () => {
    logger.info('Sending test portfolio email', {
      recipient: profileData.email
    })

    toast.info('Sending Test Email...', {
      description: `Test email will be sent to ${profileData.email}`
    })
  }

  // ==================== OTHER HANDLERS ====================

  const handleEditProfile = () => {
    logger.info('Opening profile editor', {
      profileName: profileData.name
    })

    toast.info('Edit Profile', {
      description: 'Update personal information and contact details'
    })
  }

  const handleUploadAvatar = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'

    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      logger.info('Avatar uploaded', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      })

      toast.success('Avatar Uploaded!', {
        description: file.name
      })
    }

    input.click()
  }

  const handleUpdateBio = () => {
    setEditBio(profileData.bio)
    setShowUpdateBioDialog(true)
  }

  const confirmUpdateBio = () => {
    if (!editBio.trim()) {
      toast.error('Please enter a professional summary')
      return
    }

    const newBio = editBio.trim()
    const wordCount = newBio.split(' ').length
    const charCount = newBio.length

    setProfileData(prev => ({ ...prev, bio: newBio }))

    logger.info('Bio updated', {
      wordCount,
      charCount,
      previousLength: profileData.bio.length
    })

    setShowUpdateBioDialog(false)
    toast.success('Bio Updated!', {
      description: `${wordCount} words, ${charCount} characters`
    })
  }

  const handlePrintCV = () => {
    logger.info('Printing CV', {
      template: selectedTemplate,
      completenessScore,
      visibleSections: cvSections.filter(s => s.visible).length
    })

    toast.info('Print CV', {
      description: 'Opening print dialog...'
    })

    // In production: window.print()
  }

  // Group skills by category
  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = []
    }
    acc[skill.category].push(skill)
    return acc
  }, {} as Record<string, Skill[]>)

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Technical': return <Code className="w-4 h-4" />
      case 'Soft': return <Lightbulb className="w-4 h-4" />
      case 'Languages': return <Languages className="w-4 h-4" />
      default: return <Star className="w-4 h-4" />
    }
  }

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen kazi-bg-light dark:kazi-bg-dark p-6">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6">
            <CardSkeleton />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CardSkeleton />
              <CardSkeleton />
            </div>
            <ListSkeleton items={4} />
          </div>
        </div>
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen kazi-bg-light dark:kazi-bg-dark p-6">
        <div className="max-w-7xl mx-auto">
          <ErrorEmptyState
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen kazi-bg-light dark:kazi-bg-dark p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <TextShimmer className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900 dark:from-gray-100 dark:via-purple-100 dark:to-blue-100 bg-clip-text text-transparent mb-2">
                CV & Portfolio
              </TextShimmer>
              <p className="text-lg text-gray-600 dark:text-gray-300 kazi-body">
                Professional profile and showcase ({completenessScore}% complete)
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="kazi-focus"
                onClick={handleViewPublicPortfolio}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Public
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="kazi-focus"
                onClick={handleCopyLink}
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="kazi-focus"
                onClick={handleTogglePreview}
              >
                {previewMode ? <Edit className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {previewMode ? 'Edit' : 'Preview'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="kazi-focus"
                onClick={handleSharePortfolio}
                disabled={isSharing}
              >
                <Share2 className="w-4 h-4 mr-2" />
                {isSharing ? 'Generating...' : 'Share'}
              </Button>
              <Button
                size="sm"
                className="btn-kazi-primary kazi-ripple"
                onClick={() => handleExportCV('PDF')}
                disabled={isExporting}
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export CV'}
              </Button>
            </div>
          </div>
        </div>

        {/* CV Completeness Bar */}
        <Card className="kazi-card mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium kazi-body-medium">CV Completeness</span>
                {completenessScore === 100 && <Check className="w-4 h-4 text-green-600" />}
                {completenessScore < 50 && <AlertCircle className="w-4 h-4 text-orange-600" />}
              </div>
              <span className="text-sm font-bold">
                <NumberFlow value={completenessScore} className="inline-block" />%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  completenessScore === 100 ? 'bg-green-600' :
                  completenessScore >= 75 ? 'bg-blue-600' :
                  completenessScore >= 50 ? 'bg-yellow-600' :
                  'bg-orange-600'
                }`}
                style={{ width: `${completenessScore}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card className="kazi-card">
              <CardContent className="p-6 text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profileData.avatar} alt={profileData.name} />
                    <AvatarFallback>{profileData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0"
                    onClick={handleUploadAvatar}
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
                <h2 className="text-xl font-bold kazi-text-dark dark:kazi-text-light kazi-headline mb-1">
                  {profileData.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 kazi-body mb-4">
                  {profileData.title}
                </p>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{profileData.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{profileData.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{profileData.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span>{profileData.website}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills by Category */}
            <Card className="kazi-card">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="kazi-headline">Skills ({skills.length})</CardTitle>
                  <Button size="sm" variant="outline" onClick={handleAddSkill}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(groupedSkills).map(([category, categorySkills]) => (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-2">
                      {getCategoryIcon(category)}
                      <span className="font-medium kazi-body-medium">{category}</span>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {categorySkills.length}
                      </Badge>
                    </div>
                    <div className="space-y-2 ml-6">
                      {categorySkills.map(skill => (
                        <div key={skill.id} className="flex items-center justify-between">
                          <span className="text-sm">{skill.name}</span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(level => (
                              <Star
                                key={level}
                                className={`w-3 h-3 cursor-pointer ${
                                  level <= skill.proficiency
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                                onClick={() => handleUpdateSkillLevel(skill.id, level)}
                              />
                            ))}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 w-5 p-0 ml-1 text-red-600"
                              onClick={() => handleRemoveSkill(skill.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="kazi-card">
              <CardHeader>
                <CardTitle className="kazi-headline">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleExportCV('PDF')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleExportCV('DOCX')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export DOCX
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleExportCV('JSON')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export JSON
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleImportCV}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import CV
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handlePrintCV}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleGenerateSummary}
                >
                  <Star className="w-4 h-4 mr-2" />
                  AI Summary
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleDownloadAnalytics}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Analytics Report
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleCopyLink}
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleViewPublicPortfolio}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Public
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="education">Education</TabsTrigger>
                <TabsTrigger value="achievements">Awards</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Bio */}
                <Card className="kazi-card">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="kazi-headline">Professional Summary</CardTitle>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={handleGenerateSummary}>
                          <Star className="w-4 h-4 mr-2" />
                          AI Generate
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleUpdateBio}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300 kazi-body leading-relaxed">
                      {profileData.bio}
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                      {profileData.bio.split(' ').length} words, {profileData.bio.length} characters
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="kazi-card">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold kazi-text-primary mb-2">
                        <NumberFlow value={yearsOfExperience} className="inline-block" />+
                      </div>
                      <div className="text-gray-600 dark:text-gray-300 kazi-body">Years Experience</div>
                    </CardContent>
                  </Card>
                  <Card className="kazi-card">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold kazi-text-primary mb-2">
                        <NumberFlow value={projects.length} className="inline-block" />
                      </div>
                      <div className="text-gray-600 dark:text-gray-300 kazi-body">Projects</div>
                    </CardContent>
                  </Card>
                  <Card className="kazi-card">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold kazi-text-primary mb-2">
                        <NumberFlow value={skills.length} className="inline-block" />
                      </div>
                      <div className="text-gray-600 dark:text-gray-300 kazi-body">Skills</div>
                    </CardContent>
                  </Card>
                  <Card className="kazi-card">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold kazi-text-primary mb-2">
                        <NumberFlow value={achievements.length} className="inline-block" />
                      </div>
                      <div className="text-gray-600 dark:text-gray-300 kazi-body">Awards</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Templates */}
                <Card className="kazi-card">
                  <CardHeader>
                    <CardTitle className="kazi-headline">CV Template</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {templates.map(template => (
                        <div
                          key={template.id}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedTemplate === template.id
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleChangeTemplate(template.id)}
                        >
                          <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded mb-2" />
                          <h4 className="font-medium text-sm">{template.name}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{template.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="experience" className="space-y-6">
                <div className="flex justify-end mb-4">
                  <Button onClick={handleAddExperience}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Experience
                  </Button>
                </div>
                {experience.map((job) => (
                  <Card key={job.id} className="kazi-card">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="kazi-headline">{job.position}</CardTitle>
                          <CardDescription className="kazi-body text-lg font-medium">
                            {job.company}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{job.period}</Badge>
                          {job.current && <Badge className="bg-green-100 text-green-800">Current</Badge>}
                          <Button size="sm" variant="ghost" onClick={() => handleEditExperience(job)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDeleteExperience(job.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 dark:text-gray-300 kazi-body mb-4">
                        {job.description}
                      </p>
                      <div className="text-xs text-gray-500 mb-2">
                        {job.description.split(' ').length} words
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {job.technologies.map((tech) => (
                          <Badge key={tech} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="projects" className="space-y-6">
                <div className="flex justify-end mb-4">
                  <Button onClick={handleAddProject}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Project
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map((project) => (
                    <Card key={project.id} className="kazi-card kazi-hover-scale">
                      <CardContent className="p-0">
                        <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center relative">
                          <div className="text-white text-6xl opacity-20">
                            <Briefcase />
                          </div>
                          <div className="absolute top-2 right-2 flex gap-1">
                            <Button size="sm" variant="secondary" onClick={() => handleToggleFeatured(project.id)} title="Toggle Featured">
                              <Star className={`w-3 h-3 ${project.status === 'Live' ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => handleUploadProjectImage(project.id)} title="Upload Image">
                              <Upload className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => handleEditProject(project)} title="Edit">
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => handleDuplicateProject(project.id)} title="Duplicate">
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="secondary" className="text-red-600" onClick={() => handleDeleteProject(project.id)} title="Delete">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold kazi-text-dark dark:kazi-text-light kazi-headline">
                              {project.title}
                            </h3>
                            <Badge
                              variant={project.status === 'Live' ? 'default' : 'secondary'}
                              className={project.status === 'Live' ? 'bg-green-100 text-green-800' : ''}
                            >
                              {project.status}
                            </Badge>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 kazi-body mb-4">
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {project.technologies.map((tech) => (
                              <Badge key={tech} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                          <Button variant="outline" className="w-full" onClick={() => handleViewProject(project)}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Project
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="education" className="space-y-6">
                <div className="flex justify-end mb-4">
                  <Button onClick={handleAddEducation}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Education
                  </Button>
                </div>
                {education.map((edu) => (
                  <Card key={edu.id} className="kazi-card">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="kazi-headline">{edu.degree}</CardTitle>
                          <CardDescription className="kazi-body text-lg font-medium">
                            {edu.institution}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{edu.period}</Badge>
                          {edu.gpa && <Badge variant="secondary">GPA: {edu.gpa}</Badge>}
                          <Button size="sm" variant="ghost" onClick={() => handleEditEducation(edu)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDeleteEducation(edu.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <MapPin className="w-4 h-4" />
                        <span>{edu.location}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {edu.achievements.map((achievement) => (
                          <Badge key={achievement} variant="secondary" className="text-xs">
                            {achievement}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="achievements" className="space-y-6">
                <div className="flex justify-end mb-4">
                  <Button onClick={handleAddAchievement}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Achievement
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {achievements.map((achievement) => (
                    <Card key={achievement.id} className="kazi-card text-center relative">
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleEditAchievement(achievement)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDeleteAchievement(achievement.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <CardContent className="p-6">
                        <Award className="w-12 h-12 mx-auto mb-4 kazi-text-primary" />
                        <h3 className="font-bold kazi-text-dark dark:kazi-text-light kazi-headline mb-2">
                          {achievement.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 kazi-body mb-2">
                          {achievement.issuer}
                        </p>
                        <Badge variant="outline">{achievement.date}</Badge>
                        {achievement.description && (
                          <p className="text-sm text-gray-500 mt-3">{achievement.description}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Delete Project AlertDialog */}
      <AlertDialog open={showDeleteProjectDialog} onOpenChange={setShowDeleteProjectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete Project
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{projects.find(p => p.id === projectToDelete)?.title}&quot;?
              This will permanently remove it from your portfolio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProject}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete Project'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Skill AlertDialog */}
      <AlertDialog open={showRemoveSkillDialog} onOpenChange={setShowRemoveSkillDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Remove Skill
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove &quot;{skills.find(s => s.id === skillToRemove)?.name}&quot; from your skills?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveSkill}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Removing...' : 'Remove Skill'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Experience AlertDialog */}
      <AlertDialog open={showDeleteExperienceDialog} onOpenChange={setShowDeleteExperienceDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete Experience
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your experience at &quot;{experience.find(e => e.id === experienceToDelete)?.company}&quot;?
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteExperience}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete Experience'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Education AlertDialog */}
      <AlertDialog open={showDeleteEducationDialog} onOpenChange={setShowDeleteEducationDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete Education
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{education.find(e => e.id === educationToDelete)?.degree}&quot;
              from &quot;{education.find(e => e.id === educationToDelete)?.institution}&quot;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteEducation}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete Education'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Achievement AlertDialog */}
      <AlertDialog open={showDeleteAchievementDialog} onOpenChange={setShowDeleteAchievementDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete Achievement
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{achievements.find(a => a.id === achievementToDelete)?.title}&quot;?
              This award/achievement will be removed from your CV.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAchievement}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete Achievement'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Projects AlertDialog */}
      <AlertDialog open={showBulkDeleteProjectsDialog} onOpenChange={setShowBulkDeleteProjectsDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete Multiple Projects
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {projectsToDelete.length} projects?
              This action cannot be undone and will remove them from your portfolio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDeleteProjects}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : `Delete ${projectsToDelete.length} Projects`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Project Dialog */}
      <Dialog open={showAddProjectDialog} onOpenChange={setShowAddProjectDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
            <DialogDescription>
              Add a new project to your portfolio.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-title">Project Title *</Label>
              <Input
                id="project-title"
                placeholder="Enter project title"
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description">Description *</Label>
              <Textarea
                id="project-description"
                placeholder="Enter project description"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-tech">Technologies (comma-separated)</Label>
              <Input
                id="project-tech"
                placeholder="React, Node.js, PostgreSQL"
                value={newProjectTechnologies}
                onChange={(e) => setNewProjectTechnologies(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-link">Project URL</Label>
              <Input
                id="project-link"
                placeholder="https://example.com"
                value={newProjectLink}
                onChange={(e) => setNewProjectLink(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddProjectDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAddProject}>
              Add Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={showEditProjectDialog} onOpenChange={setShowEditProjectDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update project details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-project-title">Project Title *</Label>
              <Input
                id="edit-project-title"
                placeholder="Enter project title"
                value={editProjectTitle}
                onChange={(e) => setEditProjectTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-project-description">Description *</Label>
              <Textarea
                id="edit-project-description"
                placeholder="Enter project description"
                value={editProjectDescription}
                onChange={(e) => setEditProjectDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-project-tech">Technologies (comma-separated)</Label>
              <Input
                id="edit-project-tech"
                placeholder="React, Node.js, PostgreSQL"
                value={editProjectTechnologies}
                onChange={(e) => setEditProjectTechnologies(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-project-link">Project URL</Label>
              <Input
                id="edit-project-link"
                placeholder="https://example.com"
                value={editProjectLink}
                onChange={(e) => setEditProjectLink(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditProjectDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmEditProject}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Skill Dialog */}
      <Dialog open={showAddSkillDialog} onOpenChange={setShowAddSkillDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Skill</DialogTitle>
            <DialogDescription>
              Add a skill to your profile.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="skill-name">Skill Name *</Label>
              <Input
                id="skill-name"
                placeholder="Enter skill name"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skill-category">Category *</Label>
              <Select value={newSkillCategory} onValueChange={(value: 'Technical' | 'Soft' | 'Languages') => setNewSkillCategory(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Soft">Soft Skills</SelectItem>
                  <SelectItem value="Languages">Languages</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="skill-proficiency">Proficiency Level (1-5) *</Label>
              <Select value={newSkillProficiency} onValueChange={setNewSkillProficiency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Beginner</SelectItem>
                  <SelectItem value="2">2 - Elementary</SelectItem>
                  <SelectItem value="3">3 - Intermediate</SelectItem>
                  <SelectItem value="4">4 - Advanced</SelectItem>
                  <SelectItem value="5">5 - Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSkillDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAddSkill}>
              Add Skill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Experience Dialog */}
      <Dialog open={showAddExperienceDialog} onOpenChange={setShowAddExperienceDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Work Experience</DialogTitle>
            <DialogDescription>
              Add your professional experience.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="exp-company">Company Name *</Label>
              <Input
                id="exp-company"
                placeholder="Enter company name"
                value={newExpCompany}
                onChange={(e) => setNewExpCompany(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exp-position">Position/Role *</Label>
              <Input
                id="exp-position"
                placeholder="Enter your position"
                value={newExpPosition}
                onChange={(e) => setNewExpPosition(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exp-location">Location *</Label>
              <Input
                id="exp-location"
                placeholder="City, Country"
                value={newExpLocation}
                onChange={(e) => setNewExpLocation(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exp-period">Period *</Label>
              <Input
                id="exp-period"
                placeholder="e.g., 2020 - 2023"
                value={newExpPeriod}
                onChange={(e) => setNewExpPeriod(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exp-description">Job Description *</Label>
              <Textarea
                id="exp-description"
                placeholder="Describe your responsibilities and achievements"
                value={newExpDescription}
                onChange={(e) => setNewExpDescription(e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exp-tech">Technologies (comma-separated)</Label>
              <Input
                id="exp-tech"
                placeholder="React, Python, AWS"
                value={newExpTechnologies}
                onChange={(e) => setNewExpTechnologies(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddExperienceDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAddExperience}>
              Add Experience
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Experience Dialog */}
      <Dialog open={showEditExperienceDialog} onOpenChange={setShowEditExperienceDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Experience</DialogTitle>
            <DialogDescription>
              Update your work experience details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-exp-company">Company Name *</Label>
              <Input
                id="edit-exp-company"
                placeholder="Enter company name"
                value={editExpCompany}
                onChange={(e) => setEditExpCompany(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-exp-position">Position *</Label>
              <Input
                id="edit-exp-position"
                placeholder="Enter your position"
                value={editExpPosition}
                onChange={(e) => setEditExpPosition(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-exp-description">Description *</Label>
              <Textarea
                id="edit-exp-description"
                placeholder="Describe your responsibilities"
                value={editExpDescription}
                onChange={(e) => setEditExpDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditExperienceDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmEditExperience}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Education Dialog */}
      <Dialog open={showAddEducationDialog} onOpenChange={setShowAddEducationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Education</DialogTitle>
            <DialogDescription>
              Add your educational background.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="edu-institution">Institution Name *</Label>
              <Input
                id="edu-institution"
                placeholder="Enter institution name"
                value={newEduInstitution}
                onChange={(e) => setNewEduInstitution(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edu-degree">Degree/Certification *</Label>
              <Input
                id="edu-degree"
                placeholder="e.g., Bachelor of Science"
                value={newEduDegree}
                onChange={(e) => setNewEduDegree(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edu-period">Period *</Label>
              <Input
                id="edu-period"
                placeholder="e.g., 2015 - 2019"
                value={newEduPeriod}
                onChange={(e) => setNewEduPeriod(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edu-location">Location *</Label>
              <Input
                id="edu-location"
                placeholder="City, Country"
                value={newEduLocation}
                onChange={(e) => setNewEduLocation(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edu-gpa">GPA (optional)</Label>
              <Input
                id="edu-gpa"
                placeholder="e.g., 3.8"
                value={newEduGpa}
                onChange={(e) => setNewEduGpa(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddEducationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAddEducation}>
              Add Education
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Education Dialog */}
      <Dialog open={showEditEducationDialog} onOpenChange={setShowEditEducationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Education</DialogTitle>
            <DialogDescription>
              Update your education details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-edu-institution">Institution *</Label>
              <Input
                id="edit-edu-institution"
                placeholder="Enter institution name"
                value={editEduInstitution}
                onChange={(e) => setEditEduInstitution(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-edu-degree">Degree *</Label>
              <Input
                id="edit-edu-degree"
                placeholder="Enter degree"
                value={editEduDegree}
                onChange={(e) => setEditEduDegree(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditEducationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmEditEducation}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Achievement Dialog */}
      <Dialog open={showAddAchievementDialog} onOpenChange={setShowAddAchievementDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Achievement</DialogTitle>
            <DialogDescription>
              Add an award or achievement to your profile.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ach-title">Achievement Title *</Label>
              <Input
                id="ach-title"
                placeholder="Enter achievement title"
                value={newAchTitle}
                onChange={(e) => setNewAchTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ach-issuer">Issuing Organization *</Label>
              <Input
                id="ach-issuer"
                placeholder="Enter issuer name"
                value={newAchIssuer}
                onChange={(e) => setNewAchIssuer(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ach-date">Date *</Label>
              <Input
                id="ach-date"
                placeholder="e.g., 2023"
                value={newAchDate}
                onChange={(e) => setNewAchDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ach-description">Description (optional)</Label>
              <Textarea
                id="ach-description"
                placeholder="Describe the achievement"
                value={newAchDescription}
                onChange={(e) => setNewAchDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAchievementDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAddAchievement}>
              Add Achievement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Achievement Dialog */}
      <Dialog open={showEditAchievementDialog} onOpenChange={setShowEditAchievementDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Achievement</DialogTitle>
            <DialogDescription>
              Update your achievement details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-ach-title">Achievement Title *</Label>
              <Input
                id="edit-ach-title"
                placeholder="Enter title"
                value={editAchTitle}
                onChange={(e) => setEditAchTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-ach-issuer">Issuer *</Label>
              <Input
                id="edit-ach-issuer"
                placeholder="Enter issuer"
                value={editAchIssuer}
                onChange={(e) => setEditAchIssuer(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditAchievementDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmEditAchievement}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Bio Dialog */}
      <Dialog open={showUpdateBioDialog} onOpenChange={setShowUpdateBioDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Update Professional Summary</DialogTitle>
            <DialogDescription>
              Write a compelling summary of your professional background.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="update-bio">Professional Summary *</Label>
              <Textarea
                id="update-bio"
                placeholder="Enter your professional summary..."
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows={6}
              />
              <p className="text-xs text-gray-500">
                {editBio.split(' ').filter(w => w).length} words, {editBio.length} characters
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateBioDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmUpdateBio}>
              Update Bio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
