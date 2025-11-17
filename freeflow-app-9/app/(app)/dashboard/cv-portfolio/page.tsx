'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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

export default function CVPortfolioPage() {
  const [activeTab, setActiveTab] = useState<string>('overview')

  // Handler functions
  const handleEditProfile = () => {
    console.log('✏️ EDIT PROFILE')
    alert('✏️ Edit Profile\n\nOpening profile editor...\n\nYou can update:\n• Personal information\n• Contact details\n• Professional summary\n• Profile picture')
  }

  const handleSharePortfolio = () => {
    console.log('🔗 SHARE PORTFOLIO')
    const shareLink = `${window.location.origin}/portfolio/${profileData.name.toLowerCase().replace(' ', '-')}`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareLink)
      alert(`🔗 Portfolio Link Copied!\n\nLink: ${shareLink}\n\nShare this link with clients and recruiters!`)
    } else {
      alert(`🔗 Share Portfolio\n\n${shareLink}`)
    }
  }

  const handleDownloadCV = () => {
    console.log('📥 DOWNLOAD CV')
    alert('📥 Downloading CV\n\nFormat: PDF\nFile: Thabo_Nkanyane_CV.pdf\n\nGenerating professional CV from your profile...')
    // In production: Generate and download PDF
  }

  const handleViewProject = (project: any) => {
    console.log('👁️ VIEW PROJECT:', project.title)
    alert(`👁️ View Project\n\nProject: ${project.title}\nStatus: ${project.status}\nLink: ${project.link}\n\nOpening project details...`)
  }

  const handleAddExperience = () => {
    console.log('➕ ADD EXPERIENCE')
    alert('➕ Add Work Experience\n\nEnter details:\n• Company name\n• Position\n• Duration\n• Description\n• Technologies used')
  }

  const handleEditExperience = (experience: any) => {
    console.log('✏️ EDIT EXPERIENCE:', experience.company)
    alert(`✏️ Edit Experience\n\nEditing: ${experience.position} at ${experience.company}\n\nUpdate any field and save changes.`)
  }

  const handleDeleteExperience = (experienceId: number) => {
    console.log('🗑️ DELETE EXPERIENCE - ID:', experienceId)
    if (confirm('⚠️ Delete Experience?\n\nThis will remove this entry from your CV.\n\nAre you sure?')) {
      alert('✅ Experience deleted successfully!')
    }
  }

  const handleAddProject = () => {
    console.log('➕ ADD PROJECT')
    alert('➕ Add Project\n\nShowcase your work:\n• Project name\n• Description\n• Technologies\n• Project URL\n• Upload images')
  }

  const handleEditProject = (project: any) => {
    console.log('✏️ EDIT PROJECT:', project.title)
    alert(`✏️ Edit Project\n\nEditing: ${project.title}\n\nUpdate project details, images, or status.`)
  }

  const handleDeleteProject = (projectId: number) => {
    console.log('🗑️ DELETE PROJECT - ID:', projectId)
    if (confirm('⚠️ Delete Project?\n\nThis will remove this project from your portfolio.\n\nAre you sure?')) {
      alert('✅ Project deleted successfully!')
    }
  }

  const handleAddEducation = () => {
    console.log('➕ ADD EDUCATION')
    alert('➕ Add Education\n\nAdd your qualifications:\n• Institution name\n• Degree/Certification\n• Period\n• Achievements')
  }

  const handleEditEducation = (education: any) => {
    console.log('✏️ EDIT EDUCATION:', education.institution)
    alert(`✏️ Edit Education\n\nEditing: ${education.degree}\n\nUpdate your educational details.`)
  }

  const handleDeleteEducation = (educationId: number) => {
    console.log('🗑️ DELETE EDUCATION - ID:', educationId)
    if (confirm('⚠️ Delete Education?\n\nThis will remove this entry from your CV.\n\nAre you sure?')) {
      alert('✅ Education entry deleted successfully!')
    }
  }

  const handleAddAchievement = () => {
    console.log('🏆 ADD ACHIEVEMENT')
    alert('🏆 Add Achievement\n\nHighlight your accomplishments:\n• Award title\n• Issuing organization\n• Date received\n• Description')
  }

  const handleEditAchievement = (achievement: any) => {
    console.log('✏️ EDIT ACHIEVEMENT:', achievement.title)
    alert(`✏️ Edit Achievement\n\nEditing: ${achievement.title}\n\nUpdate achievement details.`)
  }

  const handleDeleteAchievement = (achievementId: number) => {
    console.log('🗑️ DELETE ACHIEVEMENT - ID:', achievementId)
    if (confirm('⚠️ Delete Achievement?\n\nThis will remove this award from your profile.\n\nAre you sure?')) {
      alert('✅ Achievement deleted successfully!')
    }
  }

  const handleUploadAvatar = () => {
    console.log('📸 UPLOAD AVATAR')
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        console.log('✅ AVATAR SELECTED:', file.name)
        alert(`✅ Avatar Uploaded!\n\nFile: ${file.name}\n\nYour profile picture has been updated.`)
      }
    }
    input.click()
  }

  const handleAddSkill = () => {
    console.log('➕ ADD SKILL')
    const skill = prompt('Enter skill category and items (e.g., "Mobile: React Native, Flutter, Swift")')
    if (skill) {
      alert(`✅ Skill Added!\n\n${skill}\n\nYou can adjust the proficiency level in the editor.`)
    }
  }

  const handleRemoveSkill = (category: string) => {
    console.log('🗑️ REMOVE SKILL CATEGORY:', category)
    if (confirm(`⚠️ Remove ${category} skills?\n\nThis will remove the entire category.\n\nAre you sure?`)) {
      alert(`✅ ${category} skills removed successfully!`)
    }
  }

  const handleExportToPDF = () => {
    console.log('📄 EXPORT TO PDF')
    alert('📄 Export to PDF\n\nGenerating PDF from your profile...\n\nOptions:\n• One-page CV\n• Full portfolio\n• Custom selection')
  }

  const handlePrintCV = () => {
    console.log('🖨️ PRINT CV')
    alert('🖨️ Print CV\n\nOpening print dialog...\n\nTip: Save as PDF for digital copies!')
    // In production: window.print()
  }

  const handleGeneratePublicLink = () => {
    console.log('🌐 GENERATE PUBLIC PORTFOLIO LINK')
    const publicLink = `${window.location.origin}/public/portfolio/${profileData.name.toLowerCase().replace(' ', '-')}`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(publicLink)
      alert(`🌐 Public Portfolio Link Generated!\n\nLink: ${publicLink}\n\nThis link can be shared on:\n• LinkedIn\n• Resume\n• Email signature\n• Business cards\n\nLink copied to clipboard!`)
    }
  }

  const handleUpdateBio = () => {
    console.log('✏️ UPDATE BIO')
    const newBio = prompt('Update your professional summary:', profileData.bio)
    if (newBio && newBio.trim()) {
      alert(`✅ Bio Updated!\n\nYour professional summary has been updated.`)
    }
  }

  const handleTogglePublicVisibility = () => {
    console.log('👁️ TOGGLE PUBLIC VISIBILITY')
    alert('👁️ Portfolio Visibility\n\nOptions:\n• Public (Anyone can view)\n• Private (Only you)\n• Link-only (Anyone with link)\n\nCurrent: Link-only')
  }

  const handleExportToLinkedIn = () => {
    console.log('💼 EXPORT TO LINKEDIN')
    alert('💼 Export to LinkedIn\n\nThis will:\n• Format your experience\n• Optimize for LinkedIn\n• Copy to clipboard\n\nReady to paste into your profile!')
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

  return (
    <div className="min-h-screen kazi-bg-light dark:kazi-bg-dark p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold kazi-text-dark dark:kazi-text-light mb-2 kazi-headline">
                CV & Portfolio
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 kazi-body">
                Professional profile and showcase
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="kazi-focus" onClick={handleEditProfile}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="outline" className="kazi-focus" onClick={handleSharePortfolio}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button className="btn-kazi-primary kazi-ripple" onClick={handleDownloadCV}>
                <Download className="w-4 h-4 mr-2" />
                Download CV
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
                        <span className="text-sm text-gray-600 dark:text-gray-300">{skillCategory.level}%</span>
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
                      <div className="text-3xl font-bold kazi-text-primary mb-2">8+</div>
                      <div className="text-gray-600 dark:text-gray-300 kazi-body">Years Experience</div>
                    </CardContent>
                  </Card>
                  <Card className="kazi-card">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold kazi-text-primary mb-2">50+</div>
                      <div className="text-gray-600 dark:text-gray-300 kazi-body">Projects Completed</div>
                    </CardContent>
                  </Card>
                  <Card className="kazi-card">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold kazi-text-primary mb-2">25+</div>
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