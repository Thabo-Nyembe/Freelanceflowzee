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
  EyeOff,
  Printer,
  FileText,
  Link as LinkIcon,
  ArrowUp,
  ArrowDown,
  Check,
  AlertCircle,
  Code,
  Languages,
  Lightbulb
} from 'lucide-react'

// A+++ UTILITIES
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'

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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

  const [activeTab, setActiveTab] = useState<string>('overview')
  const [isExporting, setIsExporting] = useState<boolean>(false)
  const [isSharing, setIsSharing] = useState<boolean>(false)
  const [previewMode, setPreviewMode] = useState<boolean>(false)

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
      try {
        logger.info('Loading CV portfolio data', {
          hasProjects: projects.length > 0,
          hasSkills: skills.length > 0,
          hasExperience: experience.length > 0
        })

        setIsLoading(true)
        setError(null)

        // Simulate data loading with potential error
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.95) {
              reject(new Error('Failed to load CV portfolio'))
            } else {
              resolve(null)
            }
          }, 1000)
        })

        const completeness = calculateCompleteness()
        logger.info('CV portfolio loaded successfully', {
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
        logger.error('Failed to load CV portfolio', { error: errorMessage })
        setError(errorMessage)
        setIsLoading(false)
        announce('Error loading CV portfolio', 'assertive')
      }
    }

    loadCVPortfolioData()
  }, [])

  // ==================== PROJECT HANDLERS ====================

  const handleAddProject = () => {
    const title = prompt('Enter project title:')
    if (!title?.trim()) return

    const description = prompt('Enter project description:')
    if (!description?.trim()) return

    const techInput = prompt('Enter technologies (comma-separated):')
    const technologies = techInput ? techInput.split(',').map(t => t.trim()) : []

    const link = prompt('Enter project URL:') || ''

    const newProject: Project = {
      id: Date.now(),
      title: title.trim(),
      description: description.trim(),
      image: '/portfolio-default.jpg',
      technologies,
      link: link.trim(),
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

    toast.success('Project Added!', {
      description: `"${title}" added to portfolio (CV ${newCompleteness}% complete)`
    })
  }

  const handleEditProject = (project: Project) => {
    const title = prompt('Edit project title:', project.title)
    if (!title?.trim()) return

    const description = prompt('Edit project description:', project.description)
    if (!description?.trim()) return

    const techInput = prompt('Edit technologies (comma-separated):', project.technologies.join(', '))
    const technologies = techInput ? techInput.split(',').map(t => t.trim()) : project.technologies

    const link = prompt('Edit project URL:', project.link)

    setProjects(prev => prev.map(p =>
      p.id === project.id
        ? {
            ...p,
            title: title.trim(),
            description: description.trim(),
            technologies,
            link: link?.trim() || p.link
          }
        : p
    ))

    logger.info('Project updated', {
      projectId: project.id,
      oldTitle: project.title,
      newTitle: title,
      technologiesCount: technologies.length
    })

    toast.success('Project Updated!', {
      description: `"${title}" has been updated`
    })
  }

  const handleDeleteProject = (projectId: number) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return

    if (!confirm(`Delete "${project.title}"? This will remove it from your portfolio.`)) return

    setProjects(prev => prev.filter(p => p.id !== projectId))

    const newCompleteness = calculateCompleteness()
    logger.info('Project deleted', {
      projectId,
      projectTitle: project.title,
      remainingProjects: projects.length - 1,
      completenessScore: newCompleteness
    })

    toast.success('Project Deleted', {
      description: `"${project.title}" removed from portfolio`
    })
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
    const name = prompt('Enter skill name:')
    if (!name?.trim()) return

    const category = prompt('Enter category (Technical/Soft/Languages):') as 'Technical' | 'Soft' | 'Languages'
    if (!category || !['Technical', 'Soft', 'Languages'].includes(category)) {
      toast.error('Invalid category', { description: 'Please use: Technical, Soft, or Languages' })
      return
    }

    const proficiencyInput = prompt('Enter proficiency level (1-5):')
    const proficiency = parseInt(proficiencyInput || '3')

    if (proficiency < 1 || proficiency > 5) {
      toast.error('Invalid proficiency', { description: 'Level must be between 1-5' })
      return
    }

    const newSkill: Skill = {
      id: Date.now(),
      name: name.trim(),
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

    if (!confirm(`Remove "${skill.name}" skill?`)) return

    setSkills(prev => prev.filter(s => s.id !== skillId))

    const newCompleteness = calculateCompleteness()
    logger.info('Skill removed', {
      skillId,
      skillName: skill.name,
      category: skill.category,
      remainingSkills: skills.length - 1,
      completenessScore: newCompleteness
    })

    toast.success('Skill Removed', {
      description: `${skill.name} deleted (${skills.length - 1} skills remaining)`
    })
  }

  // ==================== EXPERIENCE HANDLERS ====================

  const handleAddExperience = () => {
    const company = prompt('Enter company name:')
    if (!company?.trim()) return

    const position = prompt('Enter position/role:')
    if (!position?.trim()) return

    const location = prompt('Enter location:')
    if (!location?.trim()) return

    const description = prompt('Enter job description:')
    if (!description?.trim()) return

    const period = prompt('Enter period (e.g., "2020 - 2023"):')
    if (!period?.trim()) return

    const techInput = prompt('Enter technologies used (comma-separated):')
    const technologies = techInput ? techInput.split(',').map(t => t.trim()) : []

    const newExperience: Experience = {
      id: Date.now(),
      company: company.trim(),
      position: position.trim(),
      location: location.trim(),
      description: description.trim(),
      period: period.trim(),
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

    toast.success('Experience Added!', {
      description: `${position} at ${company} (CV ${newCompleteness}% complete)`
    })
  }

  const handleEditExperience = (exp: Experience) => {
    const company = prompt('Edit company name:', exp.company)
    if (!company?.trim()) return

    const position = prompt('Edit position:', exp.position)
    if (!position?.trim()) return

    const description = prompt('Edit description:', exp.description)
    if (!description?.trim()) return

    setExperience(prev => prev.map(e =>
      e.id === exp.id
        ? {
            ...e,
            company: company.trim(),
            position: position.trim(),
            description: description.trim()
          }
        : e
    ))

    logger.info('Experience updated', {
      experienceId: exp.id,
      oldCompany: exp.company,
      newCompany: company,
      oldPosition: exp.position,
      newPosition: position,
      descriptionLength: description.length
    })

    toast.success('Experience Updated!', {
      description: `${position} at ${company}`
    })
  }

  const handleDeleteExperience = (experienceId: number) => {
    const exp = experience.find(e => e.id === experienceId)
    if (!exp) return

    if (!confirm(`Delete experience at ${exp.company}?`)) return

    setExperience(prev => prev.filter(e => e.id !== experienceId))

    const newCompleteness = calculateCompleteness()
    const newYears = calculateYearsOfExperience()

    logger.info('Experience deleted', {
      experienceId,
      company: exp.company,
      position: exp.position,
      remainingExperiences: experience.length - 1,
      yearsOfExperience: newYears,
      completenessScore: newCompleteness
    })

    toast.success('Experience Deleted', {
      description: `${exp.position} at ${exp.company} removed`
    })
  }

  // ==================== EDUCATION HANDLERS ====================

  const handleAddEducation = () => {
    const institution = prompt('Enter institution name:')
    if (!institution?.trim()) return

    const degree = prompt('Enter degree/certification:')
    if (!degree?.trim()) return

    const period = prompt('Enter period (e.g., "2020 - 2023"):')
    if (!period?.trim()) return

    const location = prompt('Enter location:')
    if (!location?.trim()) return

    const gpa = prompt('Enter GPA (optional):')

    const newEducation: Education = {
      id: Date.now(),
      institution: institution.trim(),
      degree: degree.trim(),
      period: period.trim(),
      location: location.trim(),
      achievements: [],
      gpa: gpa?.trim(),
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

    toast.success('Education Added!', {
      description: `${degree} from ${institution}`
    })
  }

  const handleEditEducation = (edu: Education) => {
    const institution = prompt('Edit institution:', edu.institution)
    if (!institution?.trim()) return

    const degree = prompt('Edit degree:', edu.degree)
    if (!degree?.trim()) return

    setEducation(prev => prev.map(e =>
      e.id === edu.id
        ? { ...e, institution: institution.trim(), degree: degree.trim() }
        : e
    ))

    logger.info('Education updated', {
      educationId: edu.id,
      oldInstitution: edu.institution,
      newInstitution: institution,
      oldDegree: edu.degree,
      newDegree: degree
    })

    toast.success('Education Updated!', {
      description: `${degree} from ${institution}`
    })
  }

  const handleDeleteEducation = (educationId: number) => {
    const edu = education.find(e => e.id === educationId)
    if (!edu) return

    if (!confirm(`Delete ${edu.degree} from ${edu.institution}?`)) return

    setEducation(prev => prev.filter(e => e.id !== educationId))

    const newCompleteness = calculateCompleteness()
    logger.info('Education deleted', {
      educationId,
      institution: edu.institution,
      degree: edu.degree,
      remainingEducation: education.length - 1,
      completenessScore: newCompleteness
    })

    toast.success('Education Deleted', {
      description: `${edu.degree} removed from CV`
    })
  }

  // ==================== ACHIEVEMENT HANDLERS ====================

  const handleAddAchievement = () => {
    const title = prompt('Enter achievement title:')
    if (!title?.trim()) return

    const issuer = prompt('Enter issuing organization:')
    if (!issuer?.trim()) return

    const date = prompt('Enter date (e.g., "2023"):')
    if (!date?.trim()) return

    const description = prompt('Enter description (optional):')

    const newAchievement: Achievement = {
      id: Date.now(),
      title: title.trim(),
      issuer: issuer.trim(),
      date: date.trim(),
      description: description?.trim()
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

    toast.success('Achievement Added!', {
      description: `${title} - ${issuer}`
    })
  }

  const handleEditAchievement = (achievement: Achievement) => {
    const title = prompt('Edit achievement title:', achievement.title)
    if (!title?.trim()) return

    const issuer = prompt('Edit issuer:', achievement.issuer)
    if (!issuer?.trim()) return

    setAchievements(prev => prev.map(a =>
      a.id === achievement.id
        ? { ...a, title: title.trim(), issuer: issuer.trim() }
        : a
    ))

    logger.info('Achievement updated', {
      achievementId: achievement.id,
      oldTitle: achievement.title,
      newTitle: title,
      oldIssuer: achievement.issuer,
      newIssuer: issuer
    })

    toast.success('Achievement Updated!', {
      description: `${title} - ${issuer}`
    })
  }

  const handleDeleteAchievement = (achievementId: number) => {
    const achievement = achievements.find(a => a.id === achievementId)
    if (!achievement) return

    if (!confirm(`Delete "${achievement.title}"?`)) return

    setAchievements(prev => prev.filter(a => a.id !== achievementId))

    const newCompleteness = calculateCompleteness()
    logger.info('Achievement deleted', {
      achievementId,
      title: achievement.title,
      issuer: achievement.issuer,
      remainingAchievements: achievements.length - 1,
      completenessScore: newCompleteness
    })

    toast.success('Achievement Deleted', {
      description: `${achievement.title} removed`
    })
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

      // Simulate export - in production, call API
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Create download (JSON for now, PDF/DOCX in production)
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

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const shareUrl = `${window.location.origin}/public/portfolio/${profileData.name.toLowerCase().replace(/\s/g, '-')}`

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

    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000))

    const summary = `${profileData.title} with ${yearsOfExperience}+ years of experience specializing in ${skills.filter(s => s.category === 'Technical').slice(0, 3).map(s => s.name).join(', ')}. Proven track record of ${projects.length} successful projects and ${experience.length} professional roles. Expert in delivering innovative solutions with focus on quality and user experience.`

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
    const newBio = prompt('Update your professional summary:', profileData.bio)
    if (!newBio?.trim()) return

    const wordCount = newBio.trim().split(' ').length
    const charCount = newBio.trim().length

    setProfileData(prev => ({ ...prev, bio: newBio.trim() }))

    logger.info('Bio updated', {
      wordCount,
      charCount,
      previousLength: profileData.bio.length
    })

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
                className="kazi-focus"
                onClick={handleTogglePreview}
              >
                {previewMode ? <Edit className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {previewMode ? 'Edit' : 'Preview'}
              </Button>
              <Button
                variant="outline"
                className="kazi-focus"
                onClick={handleSharePortfolio}
                disabled={isSharing}
              >
                <Share2 className="w-4 h-4 mr-2" />
                {isSharing ? 'Generating...' : 'Share'}
              </Button>
              <Button
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
                            <Button size="sm" variant="secondary" onClick={() => handleEditProject(project)}>
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="secondary" className="text-red-600" onClick={() => handleDeleteProject(project.id)}>
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
    </div>
  );
}
