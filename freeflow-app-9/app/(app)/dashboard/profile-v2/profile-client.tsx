'use client'

import { useState, useMemo } from 'react'
import {
  User, Edit, Camera, Phone, Mail, MapPin, Calendar, Globe,
  Briefcase, Award, Star, Users, Shield, MessageSquare, Settings,
  Share2, Download, Plus, Search, Eye, Link2, TrendingUp,
  GraduationCap, Building2, FileText, Heart, ThumbsUp, Bookmark,
  BarChart3, CheckCircle, Clock, ExternalLink, Image, Video,
  PenTool, Zap, Target, Bell, Lock, Activity
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'

// Types
type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'
type ConnectionStatus = 'connected' | 'pending' | 'none'
type PostType = 'text' | 'article' | 'image' | 'video' | 'document' | 'poll'

interface Profile {
  id: string
  userId: string
  firstName: string
  lastName: string
  headline: string
  summary: string
  location: string
  email: string
  phone: string
  website: string
  avatar: string
  banner: string
  isVerified: boolean
  isPremium: boolean
  isOpenToWork: boolean
  isHiring: boolean
  profileViews: number
  searchAppearances: number
  postImpressions: number
  followers: number
  following: number
  connections: number
  profileStrength: number
  industry: string
  currentCompany: string
  currentTitle: string
  createdAt: string
  lastActive: string
}

interface Experience {
  id: string
  company: string
  companyLogo?: string
  title: string
  location: string
  locationType: 'onsite' | 'remote' | 'hybrid'
  employmentType: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship'
  startDate: string
  endDate?: string
  isCurrent: boolean
  description: string
  skills: string[]
  media: { type: string; url: string; title: string }[]
}

interface Education {
  id: string
  school: string
  schoolLogo?: string
  degree: string
  field: string
  startYear: number
  endYear?: number
  grade?: string
  activities: string
  description: string
}

interface Skill {
  id: string
  name: string
  level: SkillLevel
  endorsements: number
  endorsers: { name: string; avatar: string }[]
  isTopSkill: boolean
}

interface Certification {
  id: string
  name: string
  issuingOrg: string
  issueDate: string
  expiryDate?: string
  credentialId: string
  credentialUrl: string
  skills: string[]
}

interface Recommendation {
  id: string
  recommender: { name: string; avatar: string; title: string; company: string }
  relationship: string
  text: string
  createdAt: string
  isReceived: boolean
}

interface Post {
  id: string
  type: PostType
  content: string
  media?: { type: string; url: string }[]
  likes: number
  comments: number
  reposts: number
  impressions: number
  createdAt: string
}

// Mock Data
const mockProfile: Profile = {
  id: '1',
  userId: 'user-1',
  firstName: 'John',
  lastName: 'Smith',
  headline: 'Senior Software Engineer | React | TypeScript | Node.js | Building Products That Matter',
  summary: 'Passionate software engineer with 10+ years of experience building scalable web applications. I specialize in React, TypeScript, and Node.js, with a focus on creating exceptional user experiences. Currently leading frontend architecture at TechCorp.\n\nI love mentoring junior developers, contributing to open source, and speaking at tech conferences. Always excited to connect with fellow developers and discuss new opportunities.',
  location: 'San Francisco Bay Area',
  email: 'john.smith@email.com',
  phone: '+1 (555) 123-4567',
  website: 'https://johnsmith.dev',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=300&fit=crop',
  isVerified: true,
  isPremium: true,
  isOpenToWork: false,
  isHiring: true,
  profileViews: 1247,
  searchAppearances: 856,
  postImpressions: 45600,
  followers: 12500,
  following: 890,
  connections: 2847,
  profileStrength: 92,
  industry: 'Technology',
  currentCompany: 'TechCorp',
  currentTitle: 'Senior Software Engineer',
  createdAt: '2018-03-15T00:00:00Z',
  lastActive: '2024-12-25T10:30:00Z'
}

const mockExperiences: Experience[] = [
  {
    id: '1',
    company: 'TechCorp',
    companyLogo: 'https://api.dicebear.com/7.x/shapes/svg?seed=TechCorp',
    title: 'Senior Software Engineer',
    location: 'San Francisco, CA',
    locationType: 'hybrid',
    employmentType: 'full-time',
    startDate: '2021-06-01',
    isCurrent: true,
    description: 'Leading frontend architecture for the main product. Implemented micro-frontend architecture that improved deployment velocity by 300%. Mentoring a team of 5 junior developers.',
    skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'GraphQL'],
    media: []
  },
  {
    id: '2',
    company: 'StartupXYZ',
    companyLogo: 'https://api.dicebear.com/7.x/shapes/svg?seed=StartupXYZ',
    title: 'Full Stack Developer',
    location: 'New York, NY',
    locationType: 'onsite',
    employmentType: 'full-time',
    startDate: '2018-03-01',
    endDate: '2021-05-31',
    isCurrent: false,
    description: 'Built the entire frontend from scratch using React and Redux. Developed RESTful APIs with Node.js and PostgreSQL. Reduced page load time by 60%.',
    skills: ['React', 'Redux', 'Node.js', 'PostgreSQL', 'Docker'],
    media: []
  },
  {
    id: '3',
    company: 'Digital Agency',
    companyLogo: 'https://api.dicebear.com/7.x/shapes/svg?seed=DigitalAgency',
    title: 'Frontend Developer',
    location: 'Los Angeles, CA',
    locationType: 'onsite',
    employmentType: 'full-time',
    startDate: '2015-01-01',
    endDate: '2018-02-28',
    isCurrent: false,
    description: 'Developed responsive web applications for various clients. Worked with Vue.js, Angular, and React across different projects.',
    skills: ['JavaScript', 'Vue.js', 'Angular', 'CSS', 'HTML'],
    media: []
  }
]

const mockEducation: Education[] = [
  {
    id: '1',
    school: 'Stanford University',
    schoolLogo: 'https://api.dicebear.com/7.x/shapes/svg?seed=Stanford',
    degree: 'Master of Science',
    field: 'Computer Science',
    startYear: 2013,
    endYear: 2015,
    grade: '3.9 GPA',
    activities: 'Teaching Assistant, ACM Club President',
    description: 'Focus on distributed systems and machine learning.'
  },
  {
    id: '2',
    school: 'UC Berkeley',
    schoolLogo: 'https://api.dicebear.com/7.x/shapes/svg?seed=Berkeley',
    degree: 'Bachelor of Science',
    field: 'Computer Science',
    startYear: 2009,
    endYear: 2013,
    grade: '3.7 GPA',
    activities: 'Hackathon Team, Computer Science Club',
    description: 'Minor in Mathematics. Dean\'s List all semesters.'
  }
]

const mockSkills: Skill[] = [
  { id: '1', name: 'React', level: 'expert', endorsements: 156, endorsers: [{ name: 'Jane Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane' }], isTopSkill: true },
  { id: '2', name: 'TypeScript', level: 'expert', endorsements: 142, endorsers: [{ name: 'Mike Wilson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike' }], isTopSkill: true },
  { id: '3', name: 'Node.js', level: 'advanced', endorsements: 98, endorsers: [{ name: 'Sarah Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' }], isTopSkill: true },
  { id: '4', name: 'GraphQL', level: 'advanced', endorsements: 76, endorsers: [], isTopSkill: false },
  { id: '5', name: 'AWS', level: 'intermediate', endorsements: 54, endorsers: [], isTopSkill: false },
  { id: '6', name: 'Docker', level: 'intermediate', endorsements: 45, endorsers: [], isTopSkill: false },
  { id: '7', name: 'PostgreSQL', level: 'advanced', endorsements: 67, endorsers: [], isTopSkill: false },
  { id: '8', name: 'Python', level: 'intermediate', endorsements: 38, endorsers: [], isTopSkill: false }
]

const mockCertifications: Certification[] = [
  { id: '1', name: 'AWS Solutions Architect - Associate', issuingOrg: 'Amazon Web Services', issueDate: '2023-06-15', credentialId: 'AWS-SAA-123456', credentialUrl: 'https://aws.amazon.com/verify', skills: ['AWS', 'Cloud Architecture'] },
  { id: '2', name: 'Google Cloud Professional Developer', issuingOrg: 'Google Cloud', issueDate: '2022-11-20', credentialId: 'GCP-PD-789012', credentialUrl: 'https://cloud.google.com/verify', skills: ['GCP', 'Cloud Development'] },
  { id: '3', name: 'Meta React Developer', issuingOrg: 'Meta', issueDate: '2023-09-01', credentialId: 'META-RD-345678', credentialUrl: 'https://meta.com/verify', skills: ['React', 'JavaScript'] }
]

const mockRecommendations: Recommendation[] = [
  { id: '1', recommender: { name: 'Jane Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane', title: 'Engineering Manager', company: 'TechCorp' }, relationship: 'Managed John directly', text: 'John is an exceptional engineer. His technical skills are top-notch, and he has a unique ability to break down complex problems into manageable solutions. He\'s also a great mentor who has helped many junior developers grow.', createdAt: '2024-01-15T00:00:00Z', isReceived: true },
  { id: '2', recommender: { name: 'Mike Wilson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', title: 'CTO', company: 'StartupXYZ' }, relationship: 'Worked with John at StartupXYZ', text: 'Working with John was a pleasure. He took ownership of our entire frontend and delivered exceptional results. His attention to detail and commitment to quality are remarkable.', createdAt: '2023-08-20T00:00:00Z', isReceived: true }
]

const mockPosts: Post[] = [
  { id: '1', type: 'text', content: 'Excited to share that our team just launched a new feature that reduced load times by 50%! The key was implementing proper code splitting and lazy loading. Would love to hear about your optimization strategies! #WebPerformance #React', likes: 234, comments: 45, reposts: 12, impressions: 5600, createdAt: '2024-12-20T10:00:00Z' },
  { id: '2', type: 'article', content: 'Just published: "10 TypeScript Tips Every React Developer Should Know" - A comprehensive guide covering advanced patterns and best practices.', likes: 456, comments: 78, reposts: 89, impressions: 12400, createdAt: '2024-12-15T14:30:00Z' },
  { id: '3', type: 'text', content: 'Looking to hire 2 senior frontend developers for my team at TechCorp! We work with React, TypeScript, and GraphQL. Remote-friendly, great benefits. DM me if interested! #Hiring #Jobs', likes: 178, comments: 34, reposts: 56, impressions: 8900, createdAt: '2024-12-10T09:00:00Z' }
]

// Helper functions
const getSkillLevelColor = (level: SkillLevel): string => {
  const colors: Record<SkillLevel, string> = {
    beginner: 'bg-gray-100 text-gray-700',
    intermediate: 'bg-blue-100 text-blue-700',
    advanced: 'bg-purple-100 text-purple-700',
    expert: 'bg-green-100 text-green-700'
  }
  return colors[level]
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

const calculateDuration = (start: string, end?: string) => {
  const startDate = new Date(start)
  const endDate = end ? new Date(end) : new Date()
  const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth())
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  if (years > 0) return `${years} yr${years > 1 ? 's' : ''} ${remainingMonths} mo${remainingMonths !== 1 ? 's' : ''}`
  return `${remainingMonths} mo${remainingMonths !== 1 ? 's' : ''}`
}

export default function ProfileClient() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')

  // Computed stats
  const stats = useMemo(() => {
    return {
      profileViews: mockProfile.profileViews,
      searchAppearances: mockProfile.searchAppearances,
      postImpressions: mockProfile.postImpressions,
      connections: mockProfile.connections,
      followers: mockProfile.followers,
      skills: mockSkills.length,
      endorsements: mockSkills.reduce((sum, s) => sum + s.endorsements, 0),
      recommendations: mockRecommendations.filter(r => r.isReceived).length
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:bg-none dark:bg-gray-900">
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Professional Profile
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  LinkedIn-level professional networking and career management
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { label: 'Profile Views', value: formatNumber(stats.profileViews), icon: Eye, gradient: 'from-blue-500 to-cyan-600' },
              { label: 'Search Hits', value: formatNumber(stats.searchAppearances), icon: Search, gradient: 'from-purple-500 to-indigo-600' },
              { label: 'Post Impressions', value: formatNumber(stats.postImpressions), icon: TrendingUp, gradient: 'from-green-500 to-emerald-600' },
              { label: 'Connections', value: formatNumber(stats.connections), icon: Users, gradient: 'from-orange-500 to-amber-600' },
              { label: 'Followers', value: formatNumber(stats.followers), icon: Heart, gradient: 'from-pink-500 to-rose-600' },
              { label: 'Skills', value: stats.skills.toString(), icon: Zap, gradient: 'from-cyan-500 to-blue-600' },
              { label: 'Endorsements', value: formatNumber(stats.endorsements), icon: ThumbsUp, gradient: 'from-yellow-500 to-orange-600' },
              { label: 'Recommendations', value: stats.recommendations.toString(), icon: Star, gradient: 'from-indigo-500 to-purple-600' }
            ].map((stat, index) => (
              <Card key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${stat.gradient} mb-3`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Profile Card */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
            <CardContent className="pt-0 px-6 pb-6">
              <div className="flex flex-col md:flex-row gap-6 -mt-16">
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                    <AvatarImage src={mockProfile.avatar} />
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      {mockProfile.firstName[0]}{mockProfile.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  {mockProfile.isPremium && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full text-xs font-bold text-amber-900">
                      Premium
                    </div>
                  )}
                </div>
                <div className="flex-1 pt-16 md:pt-4">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {mockProfile.firstName} {mockProfile.lastName}
                    </h2>
                    {mockProfile.isVerified && <Shield className="w-5 h-5 text-blue-500" />}
                    {mockProfile.isOpenToWork && <Badge className="bg-green-100 text-green-700">Open to Work</Badge>}
                    {mockProfile.isHiring && <Badge className="bg-purple-100 text-purple-700">Hiring</Badge>}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">{mockProfile.headline}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{mockProfile.location}</span>
                    <span className="flex items-center gap-1"><Building2 className="w-4 h-4" />{mockProfile.currentCompany}</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" />{formatNumber(mockProfile.connections)} connections</span>
                  </div>
                  <div className="flex gap-3">
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">Connect</Button>
                    <Button variant="outline">Message</Button>
                    <Button variant="outline">More</Button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-2">Profile Strength</div>
                  <div className="w-32">
                    <Progress value={mockProfile.profileStrength} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">{mockProfile.profileStrength}% complete</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-1 rounded-xl shadow-sm">
              <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                <User className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="experience" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                <Briefcase className="w-4 h-4 mr-2" />
                Experience
              </TabsTrigger>
              <TabsTrigger value="skills" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                <Zap className="w-4 h-4 mr-2" />
                Skills
              </TabsTrigger>
              <TabsTrigger value="education" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                <GraduationCap className="w-4 h-4 mr-2" />
                Education
              </TabsTrigger>
              <TabsTrigger value="activity" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                <Activity className="w-4 h-4 mr-2" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* About Section */}
                <Card className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      About
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{mockProfile.summary}</p>
                  </CardContent>
                </Card>

                {/* Contact Info */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-blue-600" />
                      Contact Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{mockProfile.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{mockProfile.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <a href={mockProfile.website} className="text-sm text-blue-600 hover:underline">{mockProfile.website}</a>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{mockProfile.location}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Skills Preview */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    Top Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {mockSkills.filter(s => s.isTopSkill).map((skill) => (
                      <div key={skill.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{skill.name}</p>
                          <p className="text-sm text-gray-500">{skill.endorsements} endorsements</p>
                        </div>
                        <Badge className={getSkillLevelColor(skill.level)}>{skill.level}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations Preview */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-blue-600" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockRecommendations.slice(0, 2).map((rec) => (
                      <div key={rec.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarImage src={rec.recommender.avatar} />
                            <AvatarFallback>{rec.recommender.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{rec.recommender.name}</p>
                            <p className="text-sm text-gray-500">{rec.recommender.title} at {rec.recommender.company}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{rec.text}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Experience Tab */}
            <TabsContent value="experience" className="space-y-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                      Experience
                    </CardTitle>
                    <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {mockExperiences.map((exp, idx) => (
                      <div key={exp.id} className="flex gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={exp.companyLogo} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">{exp.company[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{exp.title}</h4>
                          <p className="text-gray-600 dark:text-gray-300">{exp.company} • {exp.employmentType}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatDate(exp.endDate!)} • {calculateDuration(exp.startDate, exp.endDate)}
                          </p>
                          <p className="text-sm text-gray-500">{exp.location} • {exp.locationType}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{exp.description}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {exp.skills.map((skill, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Certifications */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    Licenses & Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockCertifications.map((cert) => (
                      <div key={cert.id} className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{cert.name}</h4>
                          <p className="text-gray-600 dark:text-gray-300">{cert.issuingOrg}</p>
                          <p className="text-sm text-gray-500">Issued {formatDate(cert.issueDate)}</p>
                          <p className="text-sm text-gray-500">Credential ID: {cert.credentialId}</p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-1" /> View
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Skills Tab */}
            <TabsContent value="skills" className="space-y-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-600" />
                      Skills & Endorsements
                    </CardTitle>
                    <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      <Plus className="w-4 h-4 mr-1" /> Add Skill
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      {mockSkills.map((skill) => (
                        <div key={skill.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                              <Zap className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-900 dark:text-white">{skill.name}</p>
                                {skill.isTopSkill && <Badge className="bg-yellow-100 text-yellow-700">Top Skill</Badge>}
                              </div>
                              <p className="text-sm text-gray-500">{skill.endorsements} endorsements</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={getSkillLevelColor(skill.level)}>{skill.level}</Badge>
                            <Button variant="outline" size="sm">Endorse</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Education Tab */}
            <TabsContent value="education" className="space-y-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                      Education
                    </CardTitle>
                    <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {mockEducation.map((edu) => (
                      <div key={edu.id} className="flex gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={edu.schoolLogo} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">{edu.school[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{edu.school}</h4>
                          <p className="text-gray-600 dark:text-gray-300">{edu.degree}, {edu.field}</p>
                          <p className="text-sm text-gray-500">{edu.startYear} - {edu.endYear || 'Present'}</p>
                          {edu.grade && <p className="text-sm text-gray-500">Grade: {edu.grade}</p>}
                          {edu.activities && <p className="text-sm text-gray-500">Activities: {edu.activities}</p>}
                          {edu.description && <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{edu.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockPosts.map((post) => (
                      <div key={post.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarImage src={mockProfile.avatar} />
                            <AvatarFallback>{mockProfile.firstName[0]}{mockProfile.lastName[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-gray-900 dark:text-white">{mockProfile.firstName} {mockProfile.lastName}</span>
                              <Badge variant="outline" className="text-xs">{post.type}</Badge>
                              <span className="text-xs text-gray-500">{formatDate(post.createdAt)}</span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mb-3">{post.content}</p>
                            <div className="flex gap-6 text-sm text-gray-500">
                              <span className="flex items-center gap-1"><ThumbsUp className="w-4 h-4" />{post.likes}</span>
                              <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" />{post.comments}</span>
                              <span className="flex items-center gap-1"><Share2 className="w-4 h-4" />{post.reposts}</span>
                              <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{formatNumber(post.impressions)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Visibility Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Profile visibility</p>
                        <p className="text-sm text-gray-500">Make your profile visible to everyone</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Open to work</p>
                        <p className="text-sm text-gray-500">Let recruiters know you're looking</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Show profile photo</p>
                        <p className="text-sm text-gray-500">Display your photo publicly</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Notification Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Connection requests</p>
                        <p className="text-sm text-gray-500">Get notified of new requests</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Profile views</p>
                        <p className="text-sm text-gray-500">Weekly summary of profile views</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Job recommendations</p>
                        <p className="text-sm text-gray-500">Receive job alerts</p>
                      </div>
                      <Switch />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
