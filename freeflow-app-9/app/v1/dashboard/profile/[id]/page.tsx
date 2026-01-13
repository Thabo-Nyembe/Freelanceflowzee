'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  MapPin,
  Star,
  Briefcase,
  Calendar,
  Globe,
  MessageSquare,
  UserPlus,
  UserCheck,
  Share2,
  Award,
  TrendingUp,
  Clock,
  DollarSign,
  CheckCircle,
  Github,
  Linkedin,
  Twitter,
  ExternalLink,
  Heart,
  Eye,
  Image as ImageIcon,
  Sparkles,
  Send
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { NumberFlow } from '@/components/ui/number-flow'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { createFeatureLogger } from '@/lib/logger'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'

const logger = createFeatureLogger('CommunityProfile')

// ============================================================================
// TYPES
// ============================================================================

interface PortfolioProject {
  id: string
  title: string
  description: string
  thumbnail: string
  category: string
  tags: string[]
  likes: number
  views: number
  comments: number
  createdAt: string
  technologies: string[]
  liveUrl?: string
  githubUrl?: string
  featured: boolean
}

interface Testimonial {
  id: string
  clientName: string
  clientAvatar: string
  clientTitle: string
  rating: number
  content: string
  projectTitle: string
  date: string
}

interface Experience {
  id: string
  title: string
  company: string
  location: string
  startDate: string
  endDate?: string
  description: string
  current: boolean
}

interface Certification {
  id: string
  name: string
  issuer: string
  date: string
  credentialId?: string
  credentialUrl?: string
}

export default function CommunityProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { announce } = useAnnouncer()
  const { userId, loading: userLoading } = useCurrentUser()
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [activeTab, setActiveTab] = useState('portfolio')
  const [isMessageOpen, setIsMessageOpen] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null)

  // Mock member data
  const member = {
    id: params.id as string,
    name: 'Sarah Johnson',
    title: 'Senior UX Designer & Product Strategist',
    avatar: '/avatars/sarah.jpg',
    coverImage: '/covers/design.jpg',
    bio: 'Award-winning UX designer with 10+ years of experience creating delightful digital experiences. Passionate about user-centered design and data-driven decisions. Available for freelance projects and consulting.',
    location: 'San Francisco, CA',
    timezone: 'PST (UTC-8)',
    rating: 4.9,
    reviewsCount: 127,
    isOnline: true,
    isVerified: true,
    isPremium: true,
    category: 'freelancer',
    availability: 'available',
    hourlyRate: 85,
    currency: 'USD',
    responseTime: '2 hours',
    completionRate: 98,
    totalProjects: 127,
    totalEarnings: 245000,
    followers: 1543,
    following: 234,
    memberSince: '2020-03-15',

    skills: [
      { name: 'UI/UX Design', level: 95 },
      { name: 'Figma', level: 98 },
      { name: 'Adobe XD', level: 92 },
      { name: 'User Research', level: 88 },
      { name: 'Prototyping', level: 94 },
      { name: 'Design Systems', level: 90 },
      { name: 'Interaction Design', level: 91 },
      { name: 'Usability Testing', level: 87 }
    ],

    languages: [
      { name: 'English', level: 'Native' },
      { name: 'Spanish', level: 'Professional' },
      { name: 'French', level: 'Conversational' }
    ],

    socialLinks: {
      website: 'https://sarahjohnson.design',
      linkedin: 'https://linkedin.com/in/sarahjohnson',
      twitter: 'https://twitter.com/sarahdesigns',
      github: 'https://github.com/sarahj',
      dribbble: 'https://dribbble.com/sarahj',
      behance: 'https://behance.net/sarahj'
    },

    badges: ['Top Rated', 'Fast Responder', 'Repeat Hire', 'Rising Talent'],

    stats: {
      projectsCompleted: 127,
      clientSatisfaction: 98,
      onTimeDelivery: 99,
      onBudget: 97,
      repeatClients: 45
    }
  }

  // Mock portfolio projects
  const portfolioProjects: PortfolioProject[] = [
    {
      id: '1',
      title: 'Fintech Mobile App Redesign',
      description: 'Complete redesign of a fintech mobile app, improving user engagement by 45% and reducing bounce rate by 30%.',
      thumbnail: '/portfolio/fintech-app.jpg',
      category: 'Mobile Design',
      tags: ['UI/UX', 'Fintech', 'Mobile', 'Figma'],
      likes: 234,
      views: 1892,
      comments: 45,
      createdAt: '2024-12-15',
      technologies: ['Figma', 'Adobe XD', 'Principle'],
      liveUrl: 'https://example.com/fintech-app',
      featured: true
    },
    {
      id: '2',
      title: 'E-commerce Dashboard',
      description: 'Admin dashboard for e-commerce platform with advanced analytics and real-time data visualization.',
      thumbnail: '/portfolio/ecommerce-dashboard.jpg',
      category: 'Web Design',
      tags: ['Dashboard', 'Analytics', 'SaaS'],
      likes: 189,
      views: 1456,
      comments: 32,
      createdAt: '2024-11-20',
      technologies: ['Figma', 'React', 'D3.js'],
      githubUrl: 'https://github.com/sarahj/ecommerce-dashboard',
      featured: true
    },
    {
      id: '3',
      title: 'Healthcare Patient Portal',
      description: 'User-friendly patient portal for healthcare providers with appointment scheduling and medical records.',
      thumbnail: '/portfolio/healthcare-portal.jpg',
      category: 'Web Design',
      tags: ['Healthcare', 'Portal', 'Accessibility'],
      likes: 156,
      views: 1123,
      comments: 28,
      createdAt: '2024-10-10',
      technologies: ['Figma', 'Adobe XD'],
      liveUrl: 'https://example.com/healthcare-portal',
      featured: false
    }
  ]

  // Mock testimonials
  const testimonials: Testimonial[] = [
    {
      id: '1',
      clientName: 'Michael Chen',
      clientAvatar: '/avatars/michael.jpg',
      clientTitle: 'CEO at TechCorp',
      rating: 5,
      content: 'Sarah exceeded our expectations! Her attention to detail and user-centered approach resulted in a product our users love. Highly recommend!',
      projectTitle: 'Fintech Mobile App Redesign',
      date: '2024-12-20'
    },
    {
      id: '2',
      clientName: 'Emma Williams',
      clientAvatar: '/avatars/emma.jpg',
      clientTitle: 'Product Manager at StartupXYZ',
      rating: 5,
      content: 'Working with Sarah was a pleasure. She understood our vision and delivered a beautiful, functional design ahead of schedule.',
      projectTitle: 'E-commerce Dashboard',
      date: '2024-11-25'
    }
  ]

  // Mock experience
  const experience: Experience[] = [
    {
      id: '1',
      title: 'Senior UX Designer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      startDate: '2022-01',
      description: 'Leading UX design for enterprise SaaS products. Managing a team of 5 designers.',
      current: true
    },
    {
      id: '2',
      title: 'UX Designer',
      company: 'Design Studio',
      location: 'San Francisco, CA',
      startDate: '2019-06',
      endDate: '2021-12',
      description: 'Designed user interfaces for various client projects across web and mobile.',
      current: false
    }
  ]

  // Mock certifications
  const certifications: Certification[] = [
    {
      id: '1',
      name: 'Google UX Design Professional Certificate',
      issuer: 'Google',
      date: '2023-05',
      credentialId: 'GUX-2023-5678',
      credentialUrl: 'https://coursera.org/verify/GUX-2023-5678'
    },
    {
      id: '2',
      name: 'Nielsen Norman Group UX Certification',
      issuer: 'NN/g',
      date: '2022-08',
      credentialId: 'NNG-UX-2022-1234'
    }
  ]

  useEffect(() => {
    // Load profile data
    fetch(`/api/profiles/${member.id}`).then(res => {
      if (res.ok) {
        setIsLoading(false)
        announce(`Profile loaded for ${member.name}`)
        logger.info('Profile page loaded', { memberId: member.id, name: member.name })
      }
    }).catch(() => setIsLoading(false))
  }, [member.id, member.name, announce])

  // Handlers
  const handleFollow = () => {
    setIsFollowing(!isFollowing)
    toast.success(isFollowing ? 'Unfollowed' : `Following ${member.name}`)
    logger.info('Follow toggled', { memberId: member.id, isFollowing: !isFollowing })
  }

  const handleMessage = () => {
    setIsMessageOpen(true)
    setMessageText('')
    logger.info('Message composer opened', { memberId: member.id })
    announce('Message composer opened', 'polite')
  }

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      toast.error('Please enter a message')
      return
    }

    setIsSendingMessage(true)
    logger.info('Sending message', { memberId: member.id, messageLength: messageText.length })

    try {
      // Open email client with message
      const subject = encodeURIComponent(`Message from Kazi Community`)
      const body = encodeURIComponent(messageText)
      window.open(`mailto:${member.email || ''}?subject=${subject}&body=${body}`, '_blank')

      toast.success('Message sent!', {
        description: `Your message to ${member.name} has been delivered`
      })
      logger.info('Message sent successfully', { memberId: member.id })
      announce('Message sent successfully', 'polite')

      setIsMessageOpen(false)
      setMessageText('')
    } catch (error) {
      toast.error('Failed to send message')
      logger.error('Message send failed', { error, memberId: member.id })
    } finally {
      setIsSendingMessage(false)
    }
  }

  const handleHire = () => {
    toast.success('Redirecting to hire page...', {
      description: `Starting a project with ${member.name}`
    })
    logger.info('Hire initiated', { memberId: member.id, hourlyRate: member.hourlyRate })
    router.push(`/dashboard/escrow?freelancer=${member.id}`)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: member.name,
        text: member.bio,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Profile link copied to clipboard!')
    }
    logger.info('Profile shared', { memberId: member.id })
    announce('Profile link copied', 'polite')
  }

  const handleProjectClick = (project: PortfolioProject) => {
    setSelectedProject(project)
    logger.info('Portfolio project clicked', {
      projectId: project.id,
      title: project.title
    })
    announce(`Viewing project: ${project.title}`, 'polite')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-800">
      {/* Cover Image */}
      <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="relative -mt-32 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  {member.isOnline && (
                    <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <TextShimmer className="text-3xl font-bold">
                          {member.name}
                        </TextShimmer>
                        {member.isVerified && (
                          <CheckCircle className="w-6 h-6 text-blue-600" />
                        )}
                        {member.isPremium && (
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                            Premium
                          </Badge>
                        )}
                      </div>

                      <p className="text-lg text-gray-700 mb-3">{member.title}</p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {member.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          {member.rating} ({member.reviewsCount} reviews)
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {member.totalProjects} projects
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Member since {new Date(member.memberSince).getFullYear()}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {member.badges.map(badge => (
                          <Badge key={badge} variant="outline">
                            <Award className="w-3 h-3 mr-1" />
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={isFollowing ? 'outline' : 'default'}
                        onClick={handleFollow}
                      >
                        {isFollowing ? (
                          <>
                            <UserCheck className="w-4 h-4 mr-2" />
                            Following
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Follow
                          </>
                        )}
                      </Button>

                      <Button variant="outline" onClick={handleMessage}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message
                      </Button>

                      <Button
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        onClick={handleHire}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Hire Me
                      </Button>

                      <Button variant="outline" size="icon" onClick={handleShare}>
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <LiquidGlassCard variant="gradient">
            <div className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">Completion Rate</span>
              </div>
              <NumberFlow
                value={member.completionRate}
                suffix="%"
                className="text-2xl font-bold text-gray-900"
              />
            </div>
          </LiquidGlassCard>

          <LiquidGlassCard variant="tinted">
            <div className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">Response Time</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{member.responseTime}</p>
            </div>
          </LiquidGlassCard>

          <LiquidGlassCard variant="gradient">
            <div className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">Hourly Rate</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">${member.hourlyRate}</p>
            </div>
          </LiquidGlassCard>

          <LiquidGlassCard variant="tinted">
            <div className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-gray-600">Total Earned</span>
              </div>
              <NumberFlow
                value={member.totalEarnings}
                format="currency"
                className="text-2xl font-bold text-gray-900"
              />
            </div>
          </LiquidGlassCard>

          <LiquidGlassCard variant="gradient">
            <div className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-red-600" />
                <span className="text-sm text-gray-600">Followers</span>
              </div>
              <NumberFlow
                value={member.followers}
                format="compact"
                className="text-2xl font-bold text-gray-900"
              />
            </div>
          </LiquidGlassCard>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
          </TabsList>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolioProjects.map(project => (
                <Card
                  key={project.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleProjectClick(project)}
                >
                  <div className="aspect-video bg-gray-200 rounded-t-lg relative overflow-hidden">
                    {project.featured && (
                      <Badge className="absolute top-2 right-2 bg-yellow-500">
                        Featured
                      </Badge>
                    )}
                    <ImageIcon className="w-16 h-16 text-gray-400 absolute inset-0 m-auto" />
                  </div>

                  <CardContent className="pt-4">
                    <h3 className="font-semibold text-lg mb-2">{project.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {project.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {project.views}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        {project.liveUrl && (
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                        {project.githubUrl && (
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Github className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About Me</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line">{member.bio}</p>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h3 className="font-semibold">Languages</h3>
                  {member.languages.map(lang => (
                    <div key={lang.name} className="flex items-center justify-between">
                      <span>{lang.name}</span>
                      <Badge variant="outline">{lang.level}</Badge>
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                <div className="space-y-3">
                  <h3 className="font-semibold">Connect</h3>
                  <div className="flex flex-wrap gap-2">
                    {member.socialLinks.website && (
                      <Button variant="outline" size="sm">
                        <Globe className="w-4 h-4 mr-2" />
                        Website
                      </Button>
                    )}
                    {member.socialLinks.linkedin && (
                      <Button variant="outline" size="sm">
                        <Linkedin className="w-4 h-4 mr-2" />
                        LinkedIn
                      </Button>
                    )}
                    {member.socialLinks.github && (
                      <Button variant="outline" size="sm">
                        <Github className="w-4 h-4 mr-2" />
                        GitHub
                      </Button>
                    )}
                    {member.socialLinks.twitter && (
                      <Button variant="outline" size="sm">
                        <Twitter className="w-4 h-4 mr-2" />
                        Twitter
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            {testimonials.map(testimonial => (
              <Card key={testimonial.id}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <Avatar>
                      <AvatarImage src={testimonial.clientAvatar} />
                      <AvatarFallback>
                        {testimonial.clientName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{testimonial.clientName}</h4>
                          <p className="text-sm text-gray-600">{testimonial.clientTitle}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: testimonial.rating }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                          ))}
                        </div>
                      </div>

                      <p className="text-gray-700 mb-2">{testimonial.content}</p>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Badge variant="outline">{testimonial.projectTitle}</Badge>
                        <span>•</span>
                        <span>{new Date(testimonial.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Skills & Expertise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {member.skills.map(skill => (
                    <div key={skill.name}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{skill.name}</span>
                        <span className="text-sm text-gray-600">{skill.level}%</span>
                      </div>
                      <Progress value={skill.level} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {certifications.map(cert => (
                    <div key={cert.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Award className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{cert.name}</h4>
                        <p className="text-sm text-gray-600 mb-1">{cert.issuer}</p>
                        <p className="text-xs text-gray-500">
                          Issued: {new Date(cert.date).toLocaleDateString()}
                        </p>
                        {cert.credentialUrl && (
                          <Button variant="link" size="sm" className="h-auto p-0 mt-1">
                            View Credential
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Experience Tab */}
          <TabsContent value="experience" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Work Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {experience.map((exp, index) => (
                    <div key={exp.id}>
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Briefcase className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold">{exp.title}</h4>
                              <p className="text-sm text-gray-700">{exp.company}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} -
                                {exp.current ? ' Present' : ` ${new Date(exp.endDate!).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                                {' • '}
                                {exp.location}
                              </p>
                            </div>
                            {exp.current && (
                              <Badge className="bg-green-100 text-green-800">Current</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-2">{exp.description}</p>
                        </div>
                      </div>
                      {index < experience.length - 1 && <Separator className="my-6" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Message Dialog */}
      <Dialog open={isMessageOpen} onOpenChange={setIsMessageOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Message {member.name}
            </DialogTitle>
            <DialogDescription>
              Send a direct message. Average response time: {member.responseTime}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Avatar className="w-10 h-10">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-gray-600">{member.title}</p>
              </div>
              {member.isOnline && (
                <Badge className="bg-green-100 text-green-800 ml-auto">Online</Badge>
              )}
            </div>

            <Textarea
              placeholder={`Hi ${member.name.split(' ')[0]}, I'd like to discuss a project with you...`}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={5}
              className="resize-none"
            />

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {messageText.length} / 1000 characters
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsMessageOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={isSendingMessage || !messageText.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                >
                  {isSendingMessage ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Project Preview Dialog */}
      <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
        <DialogContent className="sm:max-w-[700px]">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedProject.title}
                  {selectedProject.featured && (
                    <Badge className="bg-yellow-500">Featured</Badge>
                  )}
                </DialogTitle>
                <DialogDescription>
                  {selectedProject.category} • {new Date(selectedProject.createdAt).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Thumbnail */}
                <div className="aspect-video bg-gray-200 rounded-lg relative overflow-hidden">
                  <ImageIcon className="w-20 h-20 text-gray-400 absolute inset-0 m-auto" />
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-gray-600">{selectedProject.description}</p>
                </div>

                {/* Technologies */}
                <div>
                  <h4 className="font-medium mb-2">Technologies Used</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.technologies.map(tech => (
                      <Badge key={tech} variant="outline">{tech}</Badge>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <h4 className="font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    <span className="font-medium">{selectedProject.likes}</span>
                    <span className="text-gray-500">likes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">{selectedProject.views}</span>
                    <span className="text-gray-500">views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-purple-500" />
                    <span className="font-medium">{selectedProject.comments}</span>
                    <span className="text-gray-500">comments</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  {selectedProject.liveUrl && (
                    <Button variant="outline" asChild>
                      <a href={selectedProject.liveUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Live
                      </a>
                    </Button>
                  )}
                  {selectedProject.githubUrl && (
                    <Button variant="outline" asChild>
                      <a href={selectedProject.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="w-4 h-4 mr-2" />
                        View Code
                      </a>
                    </Button>
                  )}
                  <Button
                    className="ml-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    onClick={() => {
                      setSelectedProject(null)
                      handleHire()
                    }}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Hire for Similar Project
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
