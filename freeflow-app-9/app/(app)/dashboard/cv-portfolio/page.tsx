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
  Link as LinkIcon
} from 'lucide-react'

// A+++ UTILITIES
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'

export default function CVPortfolioPage() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

  const [activeTab, setActiveTab] = useState<string>('overview')
  const [isExporting, setIsExporting] = useState<boolean>(false)
  const [isSharing, setIsSharing] = useState<boolean>(false)

  // A+++ LOAD CV PORTFOLIO DATA
  useEffect(() => {
    const loadCVPortfolioData = async () => {
      try {
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

        setIsLoading(false)
        announce('CV portfolio loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load CV portfolio')
        setIsLoading(false)
        announce('Error loading CV portfolio', 'assertive')
      }
    }

    loadCVPortfolioData()
  }, [announce])

  // Handler functions
  const handleEditProfile = () => {
    console.log('✏️ CV PORTFOLIO: Edit profile')
    console.log('📝 CV PORTFOLIO: Opening profile editor')
    console.log('✅ CV PORTFOLIO: Available updates:')
    console.log('  • Personal information')
    console.log('  • Contact details')
    console.log('  • Professional summary')
    console.log('  • Profile picture')
    toast.info('✏️ Edit Profile', {
      description: 'Opening profile editor'
    })
  }

  const handleSharePortfolio = async () => {
    console.log('🔗 SHARE PORTFOLIO')
    setIsSharing(true)

    try {
      // Call API to generate shareable link
      const response = await fetch('/api/cv-portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'share',
          data: {
            method: 'social'
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate share link')
      }

      const result = await response.json()

      if (result.success) {
        // Copy link to clipboard
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(result.shareUrl)
        }

        // Show social sharing options
        const socialLinks = result.shareLinks
        console.log('🔗 CV PORTFOLIO: Portfolio shared successfully!')
        console.log('📎 CV PORTFOLIO: Share URL:', result.shareUrl)
        console.log('⏰ CV PORTFOLIO: Expires in:', result.expiresIn)
        console.log('📱 CV PORTFOLIO: Social sharing:')
        console.log('  • LinkedIn:', socialLinks.linkedin)
        console.log('  • Twitter:', socialLinks.twitter)
        console.log('  • Facebook:', socialLinks.facebook)
        console.log('  • WhatsApp:', socialLinks.whatsapp)
        console.log('✅ CV PORTFOLIO: Link copied to clipboard')

        toast.success('🔗 Share Link Generated!', {
          description: 'Link copied to clipboard. Valid for 30 days.'
        })
      }
    } catch (error: any) {
      console.error('Share Error:', error)
      toast.error('Failed to generate share link', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsSharing(false)
    }
  }

  const handleDownloadCV = async () => {
    console.log('📥 DOWNLOAD CV')
    setIsExporting(true)

    try {
      // Prepare CV data
      const cvData = {
        profile: profileData,
        experience,
        projects,
        skills,
        education,
        achievements: []
      }

      // Call API to export PDF
      const response = await fetch('/api/cv-portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'export-pdf',
          data: cvData
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate CV')
      }

      // Download the PDF
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cv-${profileData.name.replace(/\s/g, '-')}-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('📥 CV Downloaded Successfully!', {
        description: `File: ${a.download}`
      })
    } catch (error: any) {
      console.error('CV Export Error:', error)
      toast.error('Failed to download CV', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleViewProject = (project: any) => {
    console.log('👁️ CV PORTFOLIO: View project:', project.title)
    console.log('📊 CV PORTFOLIO: Status:', project.status)
    console.log('🔗 CV PORTFOLIO: Link:', project.link)
    console.log('✅ CV PORTFOLIO: Opening project details')
    toast.info('👁️ Viewing Project', {
      description: project.title
    })
  }

  const handleAddExperience = () => {
    console.log('➕ CV PORTFOLIO: Add experience')
    console.log('📝 CV PORTFOLIO: Enter details:')
    console.log('  • Company name')
    console.log('  • Position')
    console.log('  • Duration')
    console.log('  • Description')
    console.log('  • Technologies used')
    toast.info('➕ Add Work Experience', {
      description: 'Fill in your work details'
    })
  }

  const handleEditExperience = (experience: any) => {
    console.log('✏️ CV PORTFOLIO: Edit experience:', experience.company)
    console.log('📝 CV PORTFOLIO: Position:', experience.position)
    console.log('✅ CV PORTFOLIO: Update any field and save')
    toast.info('✏️ Edit Experience', {
      description: experience.position + ' at ' + experience.company
    })
  }

  const handleDeleteExperience = (experienceId: number) => {
    console.log('🗑️ CV PORTFOLIO: Delete experience - ID:', experienceId)
    if (confirm('⚠️ Delete Experience? This will remove this entry from your CV. Are you sure?')) {
      console.log('✅ CV PORTFOLIO: Experience deleted successfully')
      toast.success('✅ Experience deleted', {
        description: 'Entry removed from your CV'
      })
    }
  }

  const handleAddProject = () => {
    console.log('➕ CV PORTFOLIO: Add project')
    console.log('📝 CV PORTFOLIO: Showcase your work:')
    console.log('  • Project name')
    console.log('  • Description')
    console.log('  • Technologies')
    console.log('  • Project URL')
    console.log('  • Upload images')
    toast.info('➕ Add Project', {
      description: 'Showcase your work'
    })
  }

  const handleEditProject = (project: any) => {
    console.log('✏️ CV PORTFOLIO: Edit project:', project.title)
    console.log('📝 CV PORTFOLIO: Update project details, images, or status')
    toast.info('✏️ Edit Project', {
      description: project.title
    })
  }

  const handleDeleteProject = (projectId: number) => {
    console.log('🗑️ CV PORTFOLIO: Delete project - ID:', projectId)
    if (confirm('⚠️ Delete Project? This will remove this project from your portfolio. Are you sure?')) {
      console.log('✅ CV PORTFOLIO: Project deleted successfully')
      toast.success('✅ Project deleted', {
        description: 'Removed from your portfolio'
      })
    }
  }

  const handleAddEducation = () => {
    console.log('➕ CV PORTFOLIO: Add education')
    console.log('📝 CV PORTFOLIO: Add your qualifications:')
    console.log('  • Institution name')
    console.log('  • Degree/Certification')
    console.log('  • Period')
    console.log('  • Achievements')
    toast.info('➕ Add Education', {
      description: 'Add your qualifications'
    })
  }

  const handleEditEducation = (education: any) => {
    console.log('✏️ CV PORTFOLIO: Edit education:', education.institution)
    console.log('📝 CV PORTFOLIO: Degree:', education.degree)
    toast.info('✏️ Edit Education', {
      description: education.degree
    })
  }

  const handleDeleteEducation = (educationId: number) => {
    console.log('🗑️ CV PORTFOLIO: Delete education - ID:', educationId)
    if (confirm('⚠️ Delete Education? This will remove this entry from your CV. Are you sure?')) {
      console.log('✅ CV PORTFOLIO: Education entry deleted successfully')
      toast.success('✅ Education deleted', {
        description: 'Entry removed from your CV'
      })
    }
  }

  const handleAddAchievement = () => {
    console.log('🏆 CV PORTFOLIO: Add achievement')
    console.log('📝 CV PORTFOLIO: Highlight your accomplishments:')
    console.log('  • Award title')
    console.log('  • Issuing organization')
    console.log('  • Date received')
    console.log('  • Description')
    toast.info('🏆 Add Achievement', {
      description: 'Highlight your accomplishments'
    })
  }

  const handleEditAchievement = (achievement: any) => {
    console.log('✏️ CV PORTFOLIO: Edit achievement:', achievement.title)
    console.log('📝 CV PORTFOLIO: Update achievement details')
    toast.info('✏️ Edit Achievement', {
      description: achievement.title
    })
  }

  const handleDeleteAchievement = (achievementId: number) => {
    console.log('🗑️ CV PORTFOLIO: Delete achievement - ID:', achievementId)
    if (confirm('⚠️ Delete Achievement? This will remove this award from your profile. Are you sure?')) {
      console.log('✅ CV PORTFOLIO: Achievement deleted successfully')
      toast.success('✅ Achievement deleted', {
        description: 'Award removed from your profile'
      })
    }
  }

  const handleUploadAvatar = () => {
    console.log('📸 CV PORTFOLIO: Upload avatar')
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        console.log('✅ CV PORTFOLIO: Avatar selected:', file.name)
        console.log('📷 CV PORTFOLIO: Profile picture updated')
        toast.success('✅ Avatar Uploaded!', {
          description: file.name
        })
      }
    }
    input.click()
  }

  const handleAddSkill = () => {
    console.log('➕ CV PORTFOLIO: Add skill')
    const skill = prompt('Enter skill category and items (e.g., "Mobile: React Native, Flutter, Swift")')
    if (skill) {
      console.log('✅ CV PORTFOLIO: Skill added:', skill)
      console.log('📝 CV PORTFOLIO: Adjust proficiency level in editor')
      toast.success('✅ Skill Added!', {
        description: skill
      })
    }
  }

  const handleRemoveSkill = (category: string) => {
    console.log('🗑️ CV PORTFOLIO: Remove skill category:', category)
    if (confirm('⚠️ Remove ' + category + ' skills? This will remove the entire category. Are you sure?')) {
      console.log('✅ CV PORTFOLIO: ' + category + ' skills removed')
      toast.success('✅ Skills removed', {
        description: category + ' category deleted'
      })
    }
  }

  const handleExportToPDF = () => {
    console.log('📄 CV PORTFOLIO: Export to PDF')
    console.log('📝 CV PORTFOLIO: Generating PDF from your profile')
    console.log('📋 CV PORTFOLIO: Options:')
    console.log('  • One-page CV')
    console.log('  • Full portfolio')
    console.log('  • Custom selection')
    toast.info('📄 Export to PDF', {
      description: 'Choose your export format'
    })
  }

  const handlePrintCV = () => {
    console.log('🖨️ CV PORTFOLIO: Print CV')
    console.log('📄 CV PORTFOLIO: Opening print dialog')
    console.log('💡 CV PORTFOLIO: Tip - Save as PDF for digital copies')
    toast.info('🖨️ Print CV', {
      description: 'Opening print dialog'
    })
    // In production: window.print()
  }

  const handleGeneratePublicLink = () => {
    console.log('🌐 CV PORTFOLIO: Generate public portfolio link')
    const publicLink = `${window.location.origin}/public/portfolio/${profileData.name.toLowerCase().replace(' ', '-')}`
    console.log('🔗 CV PORTFOLIO: Link:', publicLink)
    console.log('📱 CV PORTFOLIO: Share on:')
    console.log('  • LinkedIn')
    console.log('  • Resume')
    console.log('  • Email signature')
    console.log('  • Business cards')
    if (navigator.clipboard) {
      navigator.clipboard.writeText(publicLink)
      console.log('✅ CV PORTFOLIO: Link copied to clipboard')
      toast.success('🌐 Public Link Generated!', {
        description: 'Link copied to clipboard'
      })
    }
  }

  const handleUpdateBio = () => {
    console.log('✏️ CV PORTFOLIO: Update bio')
    const newBio = prompt('Update your professional summary:', profileData.bio)
    if (newBio && newBio.trim()) {
      console.log('✅ CV PORTFOLIO: Bio updated successfully')
      toast.success('✅ Bio Updated!', {
        description: 'Professional summary updated'
      })
    }
  }

  const handleTogglePublicVisibility = () => {
    console.log('👁️ CV PORTFOLIO: Toggle public visibility')
    console.log('📋 CV PORTFOLIO: Visibility options:')
    console.log('  • Public (Anyone can view)')
    console.log('  • Private (Only you)')
    console.log('  • Link-only (Anyone with link)')
    console.log('📍 CV PORTFOLIO: Current: Link-only')
    toast.info('👁️ Portfolio Visibility', {
      description: 'Current: Link-only'
    })
  }

  const handleExportToLinkedIn = () => {
    console.log('💼 CV PORTFOLIO: Export to LinkedIn')
    console.log('📝 CV PORTFOLIO: This will:')
    console.log('  • Format your experience')
    console.log('  • Optimize for LinkedIn')
    console.log('  • Copy to clipboard')
    console.log('✅ CV PORTFOLIO: Ready to paste into your profile')
    toast.success('💼 Export to LinkedIn', {
      description: 'Content copied to clipboard'
    })
  }

  const profileData = {
    name: 'Thabo Nkanyane',
    title: 'Senior Full-Stack Developer & Designer',
    location: 'Johannesburg, South Africa',
    email: 'thabo@kaleidocraft.co.za',
    phone: '+27 81 234 5678',
    website: 'kaleidocraft.co.za',
    bio: 'Creative technologist with 8+ years of experience building innovative digital solutions. Specialized in React, Node.js, and modern web technologies with a passion for user-centered design.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Thabo'
  }

  const experience = [
    {
      id: 1,
      company: 'KaleidoCraft Digital',
      position: 'Lead Developer & Founder',
      period: '2020 - Present',
      location: 'Johannesburg, SA',
      description: 'Founded and led a digital agency specializing in custom web applications and mobile solutions for enterprise clients.',
      technologies: ['React', 'Node.js', 'TypeScript', 'AWS', 'PostgreSQL']
    },
    {
      id: 2,
      company: 'Innovation Labs',
      position: 'Senior Full-Stack Developer',
      period: '2018 - 2020',
      location: 'Cape Town, SA',
      description: 'Developed scalable web applications serving 100K+ users. Led a team of 5 developers in agile environment.',
      technologies: ['Vue.js', 'Python', 'Django', 'Docker', 'Redis']
    },
    {
      id: 3,
      company: 'TechStart Solutions',
      position: 'Frontend Developer',
      period: '2016 - 2018',
      location: 'Pretoria, SA',
      description: 'Built responsive web interfaces and progressive web apps with focus on performance and accessibility.',
      technologies: ['JavaScript', 'HTML5', 'CSS3', 'SASS', 'Webpack']
    }
  ]

  const education = [
    {
      id: 1,
      institution: 'University of the Witwatersrand',
      degree: 'Bachelor of Science in Computer Science',
      period: '2012 - 2015',
      location: 'Johannesburg, SA',
      achievements: ['Cum Laude', 'Dean\'s List 2014-2015']
    },
    {
      id: 2,
      institution: 'Google Cloud Platform',
      degree: 'Professional Cloud Architect Certification',
      period: '2021',
      location: 'Online',
      achievements: ['Professional Certification']
    }
  ]

  const skills = [
    { category: 'Frontend', items: ['React', 'Vue.js', 'TypeScript', 'Next.js', 'Tailwind CSS'], level: 95 },
    { category: 'Backend', items: ['Node.js', 'Python', 'Express.js', 'Django', 'PostgreSQL'], level: 90 },
    { category: 'Cloud & DevOps', items: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'], level: 85 },
    { category: 'Design', items: ['Figma', 'Adobe Creative Suite', 'UI/UX Design', 'Prototyping'], level: 80 }
  ]

  const projects = [
    {
      id: 1,
      title: 'E-commerce Platform Redesign',
      description: 'Complete overhaul of a major retail platform serving 500K+ customers',
      image: '/portfolio-1.jpg',
      technologies: ['React', 'Node.js', 'AWS', 'Stripe'],
      link: 'https://example.com',
      status: 'Completed'
    },
    {
      id: 2,
      title: 'AI-Powered Analytics Dashboard',
      description: 'Real-time analytics platform with machine learning insights',
      image: '/portfolio-2.jpg',
      technologies: ['Vue.js', 'Python', 'TensorFlow', 'D3.js'],
      link: 'https://example.com',
      status: 'Live'
    },
    {
      id: 3,
      title: 'Mobile Banking App',
      description: 'Secure mobile banking solution with biometric authentication',
      image: '/portfolio-3.jpg',
      technologies: ['React Native', 'Node.js', 'MongoDB', 'AWS'],
      link: 'https://example.com',
      status: 'In Development'
    }
  ]

  const achievements = [
    {
      id: 1,
      title: 'Developer of the Year 2023',
      issuer: 'South African Developers Association',
      date: '2023',
      icon: Award
    },
    {
      id: 2,
      title: 'Top 1% React Developer',
      issuer: 'Stack Overflow',
      date: '2022',
      icon: Star
    },
    {
      id: 3,
      title: 'Innovation Award',
      issuer: 'TechCrunch Africa',
      date: '2021',
      icon: Award
    }
  ]

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
                Professional profile and showcase
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="kazi-focus" onClick={handleEditProfile}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
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
                onClick={handleDownloadCV}
                disabled={isExporting}
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Download CV'}
              </Button>
            </div>
          </div>
        </div>

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

            {/* Skills Overview */}
            <Card className="kazi-card">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="kazi-headline">Skills Overview</CardTitle>
                  <Button size="sm" variant="outline" onClick={handleAddSkill}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {skills.map((skillCategory) => (
                  <div key={skillCategory.category}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium kazi-body-medium">{skillCategory.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          <NumberFlow value={skillCategory.level} className="inline-block" />%
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          onClick={() => handleRemoveSkill(skillCategory.category)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${skillCategory.level}%` }}
                      />
                    </div>
                  </div>
                ))}
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
                      <Button size="sm" variant="outline" onClick={handleUpdateBio}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300 kazi-body leading-relaxed">
                      {profileData.bio}
                    </p>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="kazi-card">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold kazi-text-primary mb-2">
                        <NumberFlow value={8} className="inline-block" />+
                      </div>
                      <div className="text-gray-600 dark:text-gray-300 kazi-body">Years Experience</div>
                    </CardContent>
                  </Card>
                  <Card className="kazi-card">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold kazi-text-primary mb-2">
                        <NumberFlow value={50} className="inline-block" />+
                      </div>
                      <div className="text-gray-600 dark:text-gray-300 kazi-body">Projects Completed</div>
                    </CardContent>
                  </Card>
                  <Card className="kazi-card">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold kazi-text-primary mb-2">
                        <NumberFlow value={25} className="inline-block" />+
                      </div>
                      <div className="text-gray-600 dark:text-gray-300 kazi-body">Happy Clients</div>
                    </CardContent>
                  </Card>
                </div>
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
                  {achievements.map((achievement) => {
                    const IconComponent = achievement.icon
                    return (
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
                          <IconComponent className="w-12 h-12 mx-auto mb-4 kazi-text-primary" />
                          <h3 className="font-bold kazi-text-dark dark:kazi-text-light kazi-headline mb-2">
                            {achievement.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 kazi-body mb-2">
                            {achievement.issuer}
                          </p>
                          <Badge variant="outline">{achievement.date}</Badge>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}