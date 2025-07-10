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
  Globe
} from 'lucide-react'

export default function CVPortfolioPage() {
  const [activeTab, setActiveTab] = useState<any>('overview')

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
              <Button variant="outline" className="kazi-focus">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="outline" className="kazi-focus">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button className="btn-kazi-primary kazi-ripple">
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
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={profileData.avatar} alt={profileData.name} />
                  <AvatarFallback>{profileData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
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
                <CardTitle className="kazi-headline">Skills Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {skills.map((skillCategory) => (
                  <div key={skillCategory.category}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium kazi-body-medium">{skillCategory.category}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">{skillCategory.level}%</span>
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
                    <CardTitle className="kazi-headline">Professional Summary</CardTitle>
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
                        <Badge variant="outline">{job.period}</Badge>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map((project) => (
                    <Card key={project.id} className="kazi-card kazi-hover-scale">
                      <CardContent className="p-0">
                        <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
                          <div className="text-white text-6xl opacity-20">
                            <Briefcase />
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
                          <Button variant="outline" className="w-full">
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
                        <Badge variant="outline">{edu.period}</Badge>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {achievements.map((achievement) => {
                    const IconComponent = achievement.icon
                    return (
                      <Card key={achievement.id} className="kazi-card text-center">
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