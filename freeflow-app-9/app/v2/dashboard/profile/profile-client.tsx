'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useAuth } from '@/lib/hooks/use-auth'
import {
  User, Edit, Camera, Phone, Mail, MapPin, Calendar, Globe,
  Briefcase, Award, Star, Users, Shield, MessageSquare, Settings,
  Share2, Download, Plus, Search, Eye, Link2, TrendingUp,
  GraduationCap, Building2, FileText, Heart, ThumbsUp, Bookmark,
  BarChart3, CheckCircle, Clock, ExternalLink, Image, Video, Zap, Target, Bell, Lock, Activity, UserPlus,
  Languages, BookOpen, Trophy, Network, Sparkles,
  ArrowUpRight, ArrowDownRight, MoreHorizontal, Twitter, Github, Youtube,
  Mic, Podcast, Newspaper, Hash, Database, Terminal, Crown, ChevronRight, Play, Sliders,
  Webhook, Key, History, RefreshCw,
  Trash2
} from 'lucide-react'

// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'




import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'

// Types
type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'
type ConnectionStatus = 'connected' | 'pending' | 'following' | 'none'
type PostType = 'text' | 'article' | 'image' | 'video' | 'document' | 'poll' | 'event' | 'celebration'
type VisibilityLevel = 'public' | 'connections' | 'private'
type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship' | 'volunteer' | 'self-employed'
type LocationType = 'onsite' | 'remote' | 'hybrid'
type FeaturedType = 'post' | 'article' | 'link' | 'media' | 'newsletter' | 'event'
type JobType = 'full-time' | 'part-time' | 'contract' | 'temporary' | 'internship'
type JobPreference = 'actively-looking' | 'open-to-offers' | 'not-looking'
type LanguageProficiency = 'elementary' | 'limited-working' | 'professional-working' | 'full-professional' | 'native-bilingual'
type AssessmentStatus = 'not-taken' | 'in-progress' | 'passed' | 'failed'

interface Profile {
  id: string
  userId: string
  firstName: string
  lastName: string
  pronouns: string
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
  isCreatorMode: boolean
  isOpenToWork: boolean
  isHiring: boolean
  profileViews: number
  profileViewsChange: number
  searchAppearances: number
  searchAppearancesChange: number
  postImpressions: number
  postImpressionsChange: number
  followers: number
  following: number
  connections: number
  profileStrength: number
  industry: string
  currentCompany: string
  currentTitle: string
  createdAt: string
  lastActive: string
  customUrl: string
  coverStory: string | null
  topVoice: boolean
  topVoiceBadge: string | null
  socialLinks: SocialLink[]
  featuredCount: number
  articlesCount: number
  newsletterSubscribers: number
}

interface SocialLink {
  platform: string
  url: string
  icon: string
}

interface Experience {
  id: string
  company: string
  companyLogo?: string
  companyUrl?: string
  title: string
  location: string
  locationType: LocationType
  employmentType: EmploymentType
  startDate: string
  endDate?: string
  isCurrent: boolean
  description: string
  skills: string[]
  media: { type: string; url: string; title: string }[]
  achievements: string[]
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
  societies: string[]
}

interface Skill {
  id: string
  name: string
  level: SkillLevel
  endorsements: number
  endorsers: { id: string; name: string; avatar: string; title: string }[]
  isTopSkill: boolean
  isPinned: boolean
  assessmentStatus: AssessmentStatus
  assessmentScore?: number
  category: string
}

interface SkillAssessment {
  id: string
  skillName: string
  status: AssessmentStatus
  score?: number
  percentile?: number
  badge?: string
  completedAt?: string
  expiresAt?: string
}

interface Certification {
  id: string
  name: string
  issuingOrg: string
  issuingOrgLogo?: string
  issueDate: string
  expiryDate?: string
  credentialId: string
  credentialUrl: string
  skills: string[]
}

interface Recommendation {
  id: string
  recommender: { id: string; name: string; avatar: string; title: string; company: string; connectionDegree: number }
  relationship: string
  text: string
  createdAt: string
  isReceived: boolean
  isVisible: boolean
}

interface Post {
  id: string
  type: PostType
  content: string
  media?: { type: string; url: string; thumbnail?: string }[]
  likes: number
  comments: number
  reposts: number
  impressions: number
  engagementRate: number
  createdAt: string
  hashtags: string[]
  mentions: string[]
  isPinned: boolean
}

interface Featured {
  id: string
  type: FeaturedType
  title: string
  description: string
  url?: string
  media?: string
  createdAt: string
  stats?: { views?: number; likes?: number; comments?: number }
}

interface Connection {
  id: string
  name: string
  avatar: string
  headline: string
  company: string
  location: string
  mutualConnections: number
  status: ConnectionStatus
  connectedAt?: string
  note?: string
}

interface Job {
  id: string
  title: string
  company: string
  companyLogo?: string
  location: string
  locationType: LocationType
  type: JobType
  salary?: { min: number; max: number; currency: string }
  postedAt: string
  applicants: number
  isSaved: boolean
  isEasyApply: boolean
  matchScore: number
  skills: string[]
}

interface Language {
  id: string
  name: string
  proficiency: LanguageProficiency
}

interface VolunteerExperience {
  id: string
  organization: string
  organizationLogo?: string
  role: string
  cause: string
  startDate: string
  endDate?: string
  isCurrent: boolean
  description: string
}

interface Publication {
  id: string
  title: string
  publisher: string
  publishDate: string
  url?: string
  description: string
  authors: string[]
}

interface Project {
  id: string
  name: string
  description: string
  url?: string
  startDate: string
  endDate?: string
  isCurrent: boolean
  skills: string[]
  media: { type: string; url: string }[]
  collaborators: { name: string; avatar: string }[]
}

interface HonorAward {
  id: string
  title: string
  issuer: string
  issueDate: string
  description: string
  associatedWith?: string
}

interface ProfileViewer {
  id: string
  name?: string
  avatar?: string
  headline?: string
  company?: string
  viewedAt: string
  isAnonymous: boolean
  source: string
}

interface CareerInterest {
  jobTitles: string[]
  locations: string[]
  locationTypes: LocationType[]
  jobTypes: JobType[]
  industries: string[]
  preference: JobPreference
  startDate: string
  visibility: VisibilityLevel
}

// Mock Data
const mockProfile: Profile = {
  id: '1',
  userId: 'user-1',
  firstName: 'John',
  lastName: 'Smith',
  pronouns: 'he/him',
  headline: 'Senior Software Engineer | React | TypeScript | Node.js | Building Products That Matter',
  summary: 'Passionate software engineer with 10+ years of experience building scalable web applications. I specialize in React, TypeScript, and Node.js, with a focus on creating exceptional user experiences. Currently leading frontend architecture at TechCorp.\n\nI love mentoring junior developers, contributing to open source, and speaking at tech conferences. Always excited to connect with fellow developers and discuss new opportunities.\n\n🚀 Featured in Top 100 Tech Influencers 2024\n📚 Author of "Modern React Patterns" (10K+ copies sold)\n🎤 Speaker at ReactConf, NodeConf, JSConf',
  location: 'San Francisco Bay Area',
  email: 'john.smith@email.com',
  phone: '+1 (555) 123-4567',
  website: 'https://johnsmith.dev',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=300&fit=crop',
  isVerified: true,
  isPremium: true,
  isCreatorMode: true,
  isOpenToWork: false,
  isHiring: true,
  profileViews: 1247,
  profileViewsChange: 23.5,
  searchAppearances: 856,
  searchAppearancesChange: 15.2,
  postImpressions: 45600,
  postImpressionsChange: 42.8,
  followers: 12500,
  following: 890,
  connections: 2847,
  profileStrength: 92,
  industry: 'Technology',
  currentCompany: 'TechCorp',
  currentTitle: 'Senior Software Engineer',
  createdAt: '2018-03-15T00:00:00Z',
  lastActive: '2024-12-25T10:30:00Z',
  customUrl: 'linkedin.com/in/johnsmith',
  coverStory: 'https://example.com/cover-story.mp4',
  topVoice: true,
  topVoiceBadge: 'Software Engineering',
  socialLinks: [
    { platform: 'Twitter', url: 'https://twitter.com/johnsmith', icon: 'twitter' },
    { platform: 'GitHub', url: 'https://github.com/johnsmith', icon: 'github' },
    { platform: 'YouTube', url: 'https://youtube.com/@johnsmith', icon: 'youtube' }
  ],
  featuredCount: 6,
  articlesCount: 24,
  newsletterSubscribers: 8500
}

const mockExperiences: Experience[] = [
  {
    id: '1',
    company: 'TechCorp',
    companyLogo: 'https://api.dicebear.com/7.x/shapes/svg?seed=TechCorp',
    companyUrl: 'https://techcorp.com',
    title: 'Senior Software Engineer',
    location: 'San Francisco, CA',
    locationType: 'hybrid',
    employmentType: 'full-time',
    startDate: '2021-06-01',
    isCurrent: true,
    description: 'Leading frontend architecture for the main product. Implemented micro-frontend architecture that improved deployment velocity by 300%. Mentoring a team of 5 junior developers.',
    skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'GraphQL'],
    media: [{ type: 'image', url: '/media/project1.jpg', title: 'Architecture Diagram' }],
    achievements: ['Promoted to Senior in 18 months', 'Led migration to TypeScript', 'Reduced bundle size by 40%']
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
    media: [],
    achievements: ['Employee of the Year 2020', 'Built MVP in 3 months']
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
    activities: 'Teaching Assistant, ACM Club President, Hackathon Organizer',
    description: 'Focus on distributed systems and machine learning. Thesis on "Scalable Real-time Data Processing".',
    societies: ['Phi Beta Kappa', 'ACM', 'IEEE']
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
    activities: 'Hackathon Team Captain, CS Club, Debate Society',
    description: 'Minor in Mathematics. Dean\'s List all semesters.',
    societies: ['Tau Beta Pi', 'UPE']
  }
]

const mockSkills: Skill[] = [
  { id: '1', name: 'React', level: 'expert', endorsements: 156, endorsers: [{ id: '1', name: 'Jane Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane', title: 'Engineering Manager' }], isTopSkill: true, isPinned: true, assessmentStatus: 'passed', assessmentScore: 95, category: 'Frontend' },
  { id: '2', name: 'TypeScript', level: 'expert', endorsements: 142, endorsers: [{ id: '2', name: 'Mike Wilson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', title: 'CTO' }], isTopSkill: true, isPinned: true, assessmentStatus: 'passed', assessmentScore: 92, category: 'Languages' },
  { id: '3', name: 'Node.js', level: 'advanced', endorsements: 98, endorsers: [{ id: '3', name: 'Sarah Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', title: 'Tech Lead' }], isTopSkill: true, isPinned: true, assessmentStatus: 'passed', assessmentScore: 88, category: 'Backend' },
  { id: '4', name: 'GraphQL', level: 'advanced', endorsements: 76, endorsers: [], isTopSkill: false, isPinned: false, assessmentStatus: 'not-taken', category: 'API' },
  { id: '5', name: 'AWS', level: 'intermediate', endorsements: 54, endorsers: [], isTopSkill: false, isPinned: false, assessmentStatus: 'passed', assessmentScore: 78, category: 'Cloud' },
  { id: '6', name: 'Docker', level: 'intermediate', endorsements: 45, endorsers: [], isTopSkill: false, isPinned: false, assessmentStatus: 'not-taken', category: 'DevOps' },
  { id: '7', name: 'PostgreSQL', level: 'advanced', endorsements: 67, endorsers: [], isTopSkill: false, isPinned: false, assessmentStatus: 'passed', assessmentScore: 85, category: 'Databases' },
  { id: '8', name: 'Python', level: 'intermediate', endorsements: 38, endorsers: [], isTopSkill: false, isPinned: false, assessmentStatus: 'in-progress', category: 'Languages' },
  { id: '9', name: 'System Design', level: 'advanced', endorsements: 89, endorsers: [], isTopSkill: false, isPinned: false, assessmentStatus: 'passed', assessmentScore: 91, category: 'Architecture' },
  { id: '10', name: 'Team Leadership', level: 'advanced', endorsements: 72, endorsers: [], isTopSkill: false, isPinned: false, assessmentStatus: 'not-taken', category: 'Soft Skills' }
]

const mockCertifications: Certification[] = [
  { id: '1', name: 'AWS Solutions Architect - Associate', issuingOrg: 'Amazon Web Services', issuingOrgLogo: 'https://api.dicebear.com/7.x/shapes/svg?seed=AWS', issueDate: '2023-06-15', credentialId: 'AWS-SAA-123456', credentialUrl: 'https://aws.amazon.com/verify', skills: ['AWS', 'Cloud Architecture'] },
  { id: '2', name: 'Google Cloud Professional Developer', issuingOrg: 'Google Cloud', issuingOrgLogo: 'https://api.dicebear.com/7.x/shapes/svg?seed=GCP', issueDate: '2022-11-20', credentialId: 'GCP-PD-789012', credentialUrl: 'https://cloud.google.com/verify', skills: ['GCP', 'Cloud Development'] },
  { id: '3', name: 'Meta React Developer', issuingOrg: 'Meta', issuingOrgLogo: 'https://api.dicebear.com/7.x/shapes/svg?seed=Meta', issueDate: '2023-09-01', credentialId: 'META-RD-345678', credentialUrl: 'https://meta.com/verify', skills: ['React', 'JavaScript'] }
]

const mockRecommendations: Recommendation[] = [
  { id: '1', recommender: { id: '1', name: 'Jane Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane', title: 'Engineering Manager', company: 'TechCorp', connectionDegree: 1 }, relationship: 'Managed John directly', text: 'John is an exceptional engineer. His technical skills are top-notch, and he has a unique ability to break down complex problems into manageable solutions. He\'s also a great mentor who has helped many junior developers grow. I would highly recommend him for any senior engineering role.', createdAt: '2024-01-15T00:00:00Z', isReceived: true, isVisible: true },
  { id: '2', recommender: { id: '2', name: 'Mike Wilson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', title: 'CTO', company: 'StartupXYZ', connectionDegree: 1 }, relationship: 'Worked with John at StartupXYZ', text: 'Working with John was a pleasure. He took ownership of our entire frontend and delivered exceptional results. His attention to detail and commitment to quality are remarkable.', createdAt: '2023-08-20T00:00:00Z', isReceived: true, isVisible: true }
]

const mockPosts: Post[] = [
  { id: '1', type: 'text', content: '🚀 Excited to share that our team just launched a new feature that reduced load times by 50%!\n\nThe key was implementing proper code splitting and lazy loading. Here are the techniques we used:\n\n1. Dynamic imports for route-based splitting\n2. React.lazy for component-level splitting\n3. Prefetching critical resources\n4. Image optimization with next/image\n\nWould love to hear about your optimization strategies!\n\n#WebPerformance #React #JavaScript', likes: 234, comments: 45, reposts: 12, impressions: 5600, engagementRate: 5.2, createdAt: '2024-12-20T10:00:00Z', hashtags: ['WebPerformance', 'React', 'JavaScript'], mentions: [], isPinned: true },
  { id: '2', type: 'article', content: '📚 Just published: "10 TypeScript Tips Every React Developer Should Know"\n\nA comprehensive guide covering advanced patterns and best practices that will level up your TypeScript game.', likes: 456, comments: 78, reposts: 89, impressions: 12400, engagementRate: 5.0, createdAt: '2024-12-15T14:30:00Z', hashtags: ['TypeScript', 'React', 'WebDev'], mentions: [], isPinned: false },
  { id: '3', type: 'text', content: '💼 Looking to hire 2 senior frontend developers for my team at TechCorp!\n\nWhat we offer:\n• Work with React, TypeScript, and GraphQL\n• Remote-friendly environment\n• Competitive salary + equity\n• Great benefits & learning budget\n\nDM me if interested!\n\n#Hiring #Jobs #TechJobs', likes: 178, comments: 34, reposts: 56, impressions: 8900, engagementRate: 3.0, createdAt: '2024-12-10T09:00:00Z', hashtags: ['Hiring', 'Jobs', 'TechJobs'], mentions: [], isPinned: false }
]

const mockFeatured: Featured[] = [
  { id: '1', type: 'article', title: '10 TypeScript Tips Every React Developer Should Know', description: 'A comprehensive guide to advanced TypeScript patterns', url: 'https://medium.com/@johnsmith/typescript-tips', createdAt: '2024-12-15', stats: { views: 12400, likes: 456, comments: 78 } },
  { id: '2', type: 'post', title: 'Web Performance Optimization Success', description: 'How we reduced load times by 50%', createdAt: '2024-12-20', stats: { views: 5600, likes: 234, comments: 45 } },
  { id: '3', type: 'newsletter', title: 'The Weekly Dev Digest', description: '8,500 subscribers - Weekly insights on web development', url: 'https://johnsmith.substack.com', createdAt: '2024-01-01', stats: { views: 85000 } },
  { id: '4', type: 'link', title: 'Modern React Patterns - Book', description: 'My book on advanced React patterns (10K+ copies sold)', url: 'https://amazon.com/modern-react-patterns', media: '/book-cover.jpg', createdAt: '2023-06-01' }
]

const mockConnections: Connection[] = [
  { id: '1', name: 'Jane Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane', headline: 'Engineering Manager at TechCorp', company: 'TechCorp', location: 'San Francisco', mutualConnections: 45, status: 'connected', connectedAt: '2022-01-15' },
  { id: '2', name: 'Mike Wilson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', headline: 'CTO at StartupXYZ', company: 'StartupXYZ', location: 'New York', mutualConnections: 32, status: 'connected', connectedAt: '2018-03-01' },
  { id: '3', name: 'Sarah Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', headline: 'Tech Lead at Google', company: 'Google', location: 'Seattle', mutualConnections: 28, status: 'pending' },
  { id: '4', name: 'Alex Rivera', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', headline: 'Senior Developer at Meta', company: 'Meta', location: 'Austin', mutualConnections: 15, status: 'following' }
]

const mockJobs: Job[] = [
  { id: '1', title: 'Staff Software Engineer', company: 'Stripe', companyLogo: 'https://api.dicebear.com/7.x/shapes/svg?seed=Stripe', location: 'San Francisco, CA', locationType: 'hybrid', type: 'full-time', salary: { min: 250000, max: 350000, currency: 'USD' }, postedAt: '2024-12-20', applicants: 45, isSaved: true, isEasyApply: true, matchScore: 95, skills: ['React', 'TypeScript', 'Node.js'] },
  { id: '2', title: 'Principal Engineer', company: 'Netflix', companyLogo: 'https://api.dicebear.com/7.x/shapes/svg?seed=Netflix', location: 'Los Gatos, CA', locationType: 'hybrid', type: 'full-time', salary: { min: 300000, max: 450000, currency: 'USD' }, postedAt: '2024-12-18', applicants: 120, isSaved: false, isEasyApply: false, matchScore: 88, skills: ['React', 'System Design', 'Leadership'] },
  { id: '3', title: 'Senior Frontend Engineer', company: 'Airbnb', companyLogo: 'https://api.dicebear.com/7.x/shapes/svg?seed=Airbnb', location: 'Remote', locationType: 'remote', type: 'full-time', salary: { min: 200000, max: 280000, currency: 'USD' }, postedAt: '2024-12-22', applicants: 78, isSaved: true, isEasyApply: true, matchScore: 92, skills: ['React', 'TypeScript', 'GraphQL'] }
]

const mockLanguages: Language[] = [
  { id: '1', name: 'English', proficiency: 'native-bilingual' },
  { id: '2', name: 'Spanish', proficiency: 'professional-working' },
  { id: '3', name: 'Japanese', proficiency: 'limited-working' }
]

const mockProjects: Project[] = [
  { id: '1', name: 'React Component Library', description: 'Open-source UI component library with 5K+ GitHub stars', url: 'https://github.com/johnsmith/react-ui', startDate: '2022-01-01', isCurrent: true, skills: ['React', 'TypeScript', 'Storybook'], media: [], collaborators: [{ name: 'Jane Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane' }] },
  { id: '2', name: 'Performance Monitoring Tool', description: 'Internal tool for real-time performance monitoring', startDate: '2023-06-01', endDate: '2023-12-01', isCurrent: false, skills: ['Node.js', 'GraphQL', 'TimescaleDB'], media: [], collaborators: [] }
]

const mockVolunteer: VolunteerExperience[] = [
  { id: '1', organization: 'Code.org', organizationLogo: 'https://api.dicebear.com/7.x/shapes/svg?seed=CodeOrg', role: 'Volunteer Instructor', cause: 'Education', startDate: '2020-01-01', isCurrent: true, description: 'Teaching programming to underserved high school students' }
]

const mockHonors: HonorAward[] = [
  { id: '1', title: 'Top 100 Tech Influencers 2024', issuer: 'TechCrunch', issueDate: '2024-01-15', description: 'Recognized for contributions to web development community', associatedWith: 'TechCorp' },
  { id: '2', title: 'Employee of the Year', issuer: 'StartupXYZ', issueDate: '2020-12-01', description: 'Awarded for exceptional performance and leadership', associatedWith: 'StartupXYZ' }
]

const mockProfileViewers: ProfileViewer[] = [
  { id: '1', name: 'Recruiter at Google', headline: 'Technical Recruiter', company: 'Google', viewedAt: '2024-12-25T09:00:00Z', isAnonymous: false, source: 'Search' },
  { id: '2', isAnonymous: true, viewedAt: '2024-12-24T15:30:00Z', source: 'Profile recommendation' },
  { id: '3', name: 'Sarah Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', headline: 'Tech Lead at Google', company: 'Google', viewedAt: '2024-12-24T10:00:00Z', isAnonymous: false, source: 'Your post' }
]

// Helper functions
const getSkillLevelColor = (level: SkillLevel): string => {
  const colors: Record<SkillLevel, string> = {
    beginner: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    intermediate: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    advanced: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    expert: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  }
  return colors[level]
}

const getAssessmentColor = (status: AssessmentStatus): string => {
  const colors: Record<AssessmentStatus, string> = {
    'not-taken': 'bg-gray-100 text-gray-600',
    'in-progress': 'bg-yellow-100 text-yellow-700',
    'passed': 'bg-green-100 text-green-700',
    'failed': 'bg-red-100 text-red-700'
  }
  return colors[status]
}

const getConnectionStatusColor = (status: ConnectionStatus): string => {
  const colors: Record<ConnectionStatus, string> = {
    connected: 'bg-blue-100 text-blue-700',
    pending: 'bg-yellow-100 text-yellow-700',
    following: 'bg-purple-100 text-purple-700',
    none: 'bg-gray-100 text-gray-600'
  }
  return colors[status]
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

const formatSalary = (salary: { min: number; max: number; currency: string }) => {
  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: salary.currency, maximumFractionDigits: 0 })
  return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}`
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

const formatTimeAgo = (date: string) => {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(date)
}

// Enhanced Competitive Upgrade Mock Data
const mockProfileAIInsights = [
  { id: '1', type: 'success' as const, title: 'Profile Strength', description: 'Profile 95% complete. Top 10% in your industry.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Profile' },
  { id: '2', type: 'info' as const, title: 'Skill Suggestion', description: 'Adding React.js would increase profile visibility 25%.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Skills' },
  { id: '3', type: 'warning' as const, title: 'Update Needed', description: 'Work experience not updated in 6 months.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Updates' },
]

const mockProfileCollaborators = [
  { id: '1', name: 'HR Manager', avatar: '/avatars/hr.jpg', status: 'online' as const, role: 'HR' },
  { id: '2', name: 'Team Lead', avatar: '/avatars/lead.jpg', status: 'online' as const, role: 'Lead' },
  { id: '3', name: 'Mentor', avatar: '/avatars/mentor.jpg', status: 'away' as const, role: 'Mentor' },
]

const mockProfilePredictions = [
  { id: '1', title: 'Career Growth', prediction: 'On track for senior role within 6 months', confidence: 78, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Skill Demand', prediction: 'Your top skills growing 30% in job market', confidence: 85, trend: 'up' as const, impact: 'medium' as const },
]

const mockProfileActivities = [
  { id: '1', user: 'You', action: 'Updated', target: 'profile headline', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'System', action: 'Verified', target: 'email address', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'HR', action: 'Viewed', target: 'your profile', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'update' as const },
]

const mockProfileQuickActions = [
  { id: '1', label: 'Edit Profile', icon: 'edit', action: () => toast.promise(
    new Promise(resolve => setTimeout(resolve, 500)),
    { loading: 'Opening profile editor...', success: 'Profile editor ready', error: 'Failed to open editor' }
  ), variant: 'default' as const },
  { id: '2', label: 'Add Skill', icon: 'plus', action: () => toast.promise(
    new Promise(resolve => setTimeout(resolve, 600)),
    { loading: 'Adding skill...', success: 'Skill added to profile', error: 'Failed to add skill' }
  ), variant: 'default' as const },
  { id: '3', label: 'Download CV', icon: 'download', action: () => toast.promise(
    new Promise(resolve => setTimeout(resolve, 1500)),
    { loading: 'Generating CV...', success: 'CV downloaded successfully', error: 'Failed to download CV' }
  ), variant: 'outline' as const },
]

// Database types
interface UserProfile {
  id: string
  user_id: string
  first_name: string
  last_name: string
  display_name: string
  email: string
  phone: string | null
  bio: string | null
  avatar: string | null
  cover_image: string | null
  location: string | null
  timezone: string
  website: string | null
  company: string | null
  title: string | null
  status: string
  account_type: string
  created_at: string
  updated_at: string
}

interface DBSkill {
  id: string
  user_id: string
  name: string
  category: string
  level: string
  years_of_experience: number
  endorsements: number
}

interface DBExperience {
  id: string
  user_id: string
  company: string
  title: string
  location: string | null
  start_date: string
  end_date: string | null
  current: boolean
  description: string | null
  achievements: string[]
}

interface DBEducation {
  id: string
  user_id: string
  school: string
  degree: string
  field: string
  start_date: string
  end_date: string | null
  current: boolean
  grade: string | null
  activities: string[]
}

interface ProfileSettings {
  id: string
  user_id: string
  privacy_level: string
  show_email: boolean
  show_phone: boolean
  show_location: boolean
  allow_messages: boolean
  allow_connections: boolean
  email_notifications: boolean
  push_notifications: boolean
  marketing_emails: boolean
  language: string
  theme: string
}

export default function ProfileClient() {
  const supabase = createClient()
  const { user } = useAuth()

  // UI State
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSkillCategory, setSelectedSkillCategory] = useState<string | 'all'>('all')
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')

  // Data State
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [skills, setSkills] = useState<DBSkill[]>([])
  const [experiences, setExperiences] = useState<DBExperience[]>([])
  const [education, setEducation] = useState<DBEducation[]>([])
  const [settings, setSettings] = useState<ProfileSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form State for Settings
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    headline: '',
    location: '',
    industry: '',
    customUrl: '',
    email: '',
    phone: '',
    website: '',
    bio: ''
  })

  // Fetch profile data
  const fetchProfileData = useCallback(async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const [profileRes, skillsRes, expRes, eduRes, settingsRes] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('skills').select('*').eq('user_id', user.id).order('endorsements', { ascending: false }),
        supabase.from('experience').select('*').eq('user_id', user.id).order('start_date', { ascending: false }),
        supabase.from('education').select('*').eq('user_id', user.id).order('start_date', { ascending: false }),
        supabase.from('profile_settings').select('*').eq('user_id', user.id).single()
      ])

      if (profileRes.data) {
        setProfile(profileRes.data)
        setFormData({
          firstName: profileRes.data.first_name || '',
          lastName: profileRes.data.last_name || '',
          headline: profileRes.data.title || '',
          location: profileRes.data.location || '',
          industry: '',
          customUrl: '',
          email: profileRes.data.email || '',
          phone: profileRes.data.phone || '',
          website: profileRes.data.website || '',
          bio: profileRes.data.bio || ''
        })
      }
      if (skillsRes.data) setSkills(skillsRes.data)
      if (expRes.data) setExperiences(expRes.data)
      if (eduRes.data) setEducation(eduRes.data)
      if (settingsRes.data) setSettings(settingsRes.data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }, [user?.id, supabase])

  useEffect(() => {
    fetchProfileData()
  }, [fetchProfileData])

  // Update profile
  const handleUpdateProfile = async () => {
    if (!user?.id || !profile?.id) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          title: formData.headline,
          location: formData.location,
          email: formData.email,
          phone: formData.phone,
          website: formData.website,
          bio: formData.bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)

      if (error) throw error

      toast.success('Profile updated successfully')
      fetchProfileData()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  // Add skill
  const handleAddSkill = async (skillName: string, category: string = 'General') => {
    if (!user?.id) return

    try {
      const { error } = await supabase.from('skills').insert({
        user_id: user.id,
        name: skillName,
        category,
        level: 'intermediate',
        years_of_experience: 0,
        endorsements: 0
      })

      if (error) throw error

      toast.success('Skill added', { description: `${skillName} has been added to your profile` })
      fetchProfileData()
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error('Skill already exists')
      } else {
        toast.error('Failed to add skill')
      }
    }
  }

  // Delete skill
  const handleDeleteSkill = async (skillId: string) => {
    try {
      const { error } = await supabase.from('skills').delete().eq('id', skillId)
      if (error) throw error

      toast.success('Skill removed')
      fetchProfileData()
    } catch (error) {
      toast.error('Failed to remove skill')
    }
  }

  // Add experience
  const handleAddExperience = async (exp: Partial<DBExperience>) => {
    if (!user?.id) return

    try {
      const { error } = await supabase.from('experience').insert({
        user_id: user.id,
        company: exp.company || '',
        title: exp.title || '',
        location: exp.location,
        start_date: exp.start_date,
        end_date: exp.end_date,
        current: exp.current || false,
        description: exp.description,
        achievements: exp.achievements || []
      })

      if (error) throw error

      toast.success('Experience added')
      fetchProfileData()
    } catch (error) {
      toast.error('Failed to add experience')
    }
  }

  // Delete experience
  const handleDeleteExperience = async (expId: string) => {
    try {
      const { error } = await supabase.from('experience').delete().eq('id', expId)
      if (error) throw error

      toast.success('Experience removed')
      fetchProfileData()
    } catch (error) {
      toast.error('Failed to remove experience')
    }
  }

  // Update settings
  const handleUpdateSettings = async (updates: Partial<ProfileSettings>) => {
    if (!user?.id || !settings?.id) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('profile_settings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', settings.id)

      if (error) throw error

      toast.success('Settings updated')
      fetchProfileData()
    } catch (error) {
      toast.error('Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  // Share profile
  const handleShareProfile = () => {
    const profileUrl = `${window.location.origin}/profile/${user?.id}`
    navigator.clipboard.writeText(profileUrl)
    toast.success('Link copied', { description: 'Profile link copied to clipboard' })
  }

  // Download profile as PDF (placeholder)
  const handleDownloadPDF = () => {
    toast.info('Generating PDF...', { description: 'Your profile PDF will download shortly' })
  }

  const skillCategories = useMemo(() => {
    const dbCategories = [...new Set(skills.map(s => s.category))]
    const mockCategories = [...new Set(mockSkills.map(s => s.category))]
    const allCategories = [...new Set([...dbCategories, ...mockCategories])]
    return ['all', ...allCategories]
  }, [skills])

  const filteredSkills = useMemo(() => {
    // Merge DB skills with mock for display
    const displaySkills = skills.length > 0 ? skills.map(s => ({
      ...s,
      level: s.level as SkillLevel,
      endorsers: [],
      isTopSkill: s.endorsements > 50,
      isPinned: false,
      assessmentStatus: 'not-taken' as AssessmentStatus
    })) : mockSkills

    return displaySkills.filter((skill: any) => {
      const matchesCategory = selectedSkillCategory === 'all' || skill.category === selectedSkillCategory
      const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [selectedSkillCategory, searchQuery, skills])

  const stats = useMemo(() => ({
    profileViews: mockProfile.profileViews,
    profileViewsChange: mockProfile.profileViewsChange,
    searchAppearances: mockProfile.searchAppearances,
    searchAppearancesChange: mockProfile.searchAppearancesChange,
    postImpressions: mockProfile.postImpressions,
    postImpressionsChange: mockProfile.postImpressionsChange,
    connections: mockProfile.connections,
    followers: mockProfile.followers,
    skills: skills.length > 0 ? skills.length : mockSkills.length,
    endorsements: skills.length > 0
      ? skills.reduce((sum, s) => sum + s.endorsements, 0)
      : mockSkills.reduce((sum, s) => sum + s.endorsements, 0),
    recommendations: mockRecommendations.filter(r => r.isReceived).length,
    assessmentsPassed: mockSkills.filter(s => s.assessmentStatus === 'passed').length
  }), [skills])

  const statCards = [
    { label: 'Profile Views', value: formatNumber(stats.profileViews), change: stats.profileViewsChange, icon: Eye, gradient: 'from-blue-500 to-cyan-600' },
    { label: 'Search Hits', value: formatNumber(stats.searchAppearances), change: stats.searchAppearancesChange, icon: Search, gradient: 'from-purple-500 to-indigo-600' },
    { label: 'Post Impressions', value: formatNumber(stats.postImpressions), change: stats.postImpressionsChange, icon: TrendingUp, gradient: 'from-green-500 to-emerald-600' },
    { label: 'Connections', value: formatNumber(stats.connections), change: null, icon: Users, gradient: 'from-orange-500 to-amber-600' },
    { label: 'Followers', value: formatNumber(stats.followers), change: null, icon: Heart, gradient: 'from-pink-500 to-rose-600' },
    { label: 'Skills', value: stats.skills.toString(), change: null, icon: Zap, gradient: 'from-cyan-500 to-blue-600' },
    { label: 'Endorsements', value: formatNumber(stats.endorsements), change: null, icon: ThumbsUp, gradient: 'from-yellow-500 to-orange-600' },
    { label: 'Assessments', value: stats.assessmentsPassed.toString(), change: null, icon: CheckCircle, gradient: 'from-indigo-500 to-purple-600' }
  ]

  // Display profile - use DB data if available, otherwise mock
  const displayProfile = profile ? {
    ...mockProfile,
    firstName: profile.first_name,
    lastName: profile.last_name,
    headline: profile.title || mockProfile.headline,
    summary: profile.bio || mockProfile.summary,
    location: profile.location || mockProfile.location,
    email: profile.email,
    phone: profile.phone || mockProfile.phone,
    website: profile.website || mockProfile.website,
    avatar: profile.avatar || mockProfile.avatar,
    banner: profile.cover_image || mockProfile.banner,
    currentCompany: profile.company || mockProfile.currentCompany,
    currentTitle: profile.title || mockProfile.currentTitle
  } : mockProfile

  // Display experiences - use DB data if available
  const displayExperiences = experiences.length > 0 ? experiences.map(exp => ({
    id: exp.id,
    company: exp.company,
    title: exp.title,
    location: exp.location || '',
    locationType: 'hybrid' as LocationType,
    employmentType: 'full-time' as EmploymentType,
    startDate: exp.start_date,
    endDate: exp.end_date || undefined,
    isCurrent: exp.current,
    description: exp.description || '',
    skills: [],
    media: [],
    achievements: exp.achievements
  })) : mockExperiences

  // Display education - use DB data if available
  const displayEducation = education.length > 0 ? education.map(edu => ({
    id: edu.id,
    school: edu.school,
    degree: edu.degree,
    field: edu.field,
    startYear: new Date(edu.start_date).getFullYear(),
    endYear: edu.end_date ? new Date(edu.end_date).getFullYear() : undefined,
    grade: edu.grade || undefined,
    activities: edu.activities.join(', '),
    description: '',
    societies: []
  })) : mockEducation

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:bg-none dark:bg-gray-900">
      <div className="p-6">
        <div className="max-w-[1800px] mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <User className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Professional Profile</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">LinkedIn-level professional networking</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowAnalytics(true)} disabled={loading}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button variant="outline" onClick={handleShareProfile} disabled={loading}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                onClick={() => setActiveTab('settings')}
                disabled={loading}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {statCards.map((stat, index) => (
              <Card key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                      <stat.icon className="w-4 h-4 text-white" />
                    </div>
                    {stat.change !== null && (
                      <div className={`flex items-center gap-1 text-xs ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(stat.change)}%
                      </div>
                    )}
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Profile Card */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 relative">
              {displayProfile.coverStory && (
                <Button size="sm" variant="secondary" className="absolute bottom-2 right-2">
                  <Play className="w-3 h-3 mr-1" />
                  Cover Story
                </Button>
              )}
            </div>
            <CardContent className="pt-0 px-6 pb-6">
              <div className="flex flex-col lg:flex-row gap-6 -mt-16">
                <div className="relative flex-shrink-0">
                  <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                    <AvatarImage src={displayProfile.avatar} />
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      {displayProfile.firstName[0]}{displayProfile.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  {displayProfile.isPremium && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full text-xs font-bold text-amber-900 flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Premium
                    </div>
                  )}
                </div>
                <div className="flex-1 pt-16 lg:pt-4">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {displayProfile.firstName} {displayProfile.lastName}
                    </h2>
                    {displayProfile.pronouns && <span className="text-sm text-gray-500">({displayProfile.pronouns})</span>}
                    {displayProfile.isVerified && <Shield className="w-5 h-5 text-blue-500" />}
                    {displayProfile.topVoice && (
                      <Badge className="bg-orange-100 text-orange-700">
                        <Mic className="w-3 h-3 mr-1" />
                        Top Voice
                      </Badge>
                    )}
                    {displayProfile.isCreatorMode && (
                      <Badge className="bg-purple-100 text-purple-700">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Creator
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">{displayProfile.headline}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{displayProfile.location}</span>
                    <span className="flex items-center gap-1"><Building2 className="w-4 h-4" />{displayProfile.currentCompany}</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" />{formatNumber(displayProfile.connections)} connections</span>
                    <span className="flex items-center gap-1"><Heart className="w-4 h-4" />{formatNumber(displayProfile.followers)} followers</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {displayProfile.isOpenToWork && <Badge className="bg-green-100 text-green-700"><Target className="w-3 h-3 mr-1" />Open to Work</Badge>}
                    {displayProfile.isHiring && <Badge className="bg-purple-100 text-purple-700"><Briefcase className="w-3 h-3 mr-1" />Hiring</Badge>}
                    {displayProfile.socialLinks.map((link, i) => (
                      <Button key={i} variant="ghost" size="sm" className="h-7 px-2" asChild>
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          {link.platform === 'Twitter' && <Twitter className="w-4 h-4" />}
                          {link.platform === 'GitHub' && <Github className="w-4 h-4" />}
                          {link.platform === 'YouTube' && <Youtube className="w-4 h-4" />}
                        </a>
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                    <Button variant="outline">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button variant="outline">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="lg:text-right space-y-3">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Profile Strength</div>
                    <div className="w-32 lg:ml-auto">
                      <Progress value={displayProfile.profileStrength} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">{displayProfile.profileStrength}% All-Star</p>
                    </div>
                  </div>
                  <div className="flex lg:justify-end gap-2">
                    <Badge variant="outline">{displayProfile.featuredCount} Featured</Badge>
                    <Badge variant="outline">{displayProfile.articlesCount} Articles</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-1 rounded-xl shadow-sm flex-wrap">
              <TabsTrigger value="overview"><User className="w-4 h-4 mr-2" />Overview</TabsTrigger>
              <TabsTrigger value="experience"><Briefcase className="w-4 h-4 mr-2" />Experience</TabsTrigger>
              <TabsTrigger value="skills"><Zap className="w-4 h-4 mr-2" />Skills</TabsTrigger>
              <TabsTrigger value="featured"><Star className="w-4 h-4 mr-2" />Featured</TabsTrigger>
              <TabsTrigger value="network"><Network className="w-4 h-4 mr-2" />Network</TabsTrigger>
              <TabsTrigger value="jobs"><Briefcase className="w-4 h-4 mr-2" />Jobs</TabsTrigger>
              <TabsTrigger value="activity"><Activity className="w-4 h-4 mr-2" />Activity</TabsTrigger>
              <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-2" />Settings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Overview Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-6 text-white">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Profile Overview</h3>
                      <p className="text-blue-100">Your professional presence at a glance</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{formatNumber(stats.profileViews)}</p>
                      <p className="text-sm text-blue-100">Profile Views</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{formatNumber(stats.connections)}</p>
                      <p className="text-sm text-blue-100">Connections</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{stats.skills}</p>
                      <p className="text-sm text-blue-100">Skills</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{mockProfile.profileStrength}%</p>
                      <p className="text-sm text-blue-100">Profile Strength</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {[
                  { icon: Edit, label: 'Edit Profile', color: 'from-blue-500 to-indigo-600', onClick: () => setActiveTab('settings') },
                  { icon: Camera, label: 'Update Photo', color: 'from-purple-500 to-pink-600', onClick: () => toast.promise(new Promise(r => setTimeout(r, 1000)), { loading: 'Opening photo uploader...', success: 'Photo upload coming soon - we are working on it!', error: 'Photo upload unavailable' }) },
                  { icon: Share2, label: 'Share Profile', color: 'from-green-500 to-emerald-600', onClick: handleShareProfile },
                  { icon: Download, label: 'Export PDF', color: 'from-orange-500 to-amber-600', onClick: handleDownloadPDF },
                  { icon: UserPlus, label: 'Grow Network', color: 'from-cyan-500 to-blue-600', onClick: () => setActiveTab('network') },
                  { icon: FileText, label: 'Add Post', color: 'from-pink-500 to-rose-600', onClick: () => setActiveTab('activity') },
                  { icon: Briefcase, label: 'Update Jobs', color: 'from-indigo-500 to-purple-600', onClick: () => setActiveTab('jobs') },
                  { icon: BarChart3, label: 'Analytics', color: 'from-yellow-500 to-orange-600', onClick: () => setShowAnalytics(true) },
                ].map((action, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2 hover:scale-105 transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm"
                    onClick={action.onClick}
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color}`}>
                      <action.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-medium">{action.label}</span>
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-blue-600" />About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{displayProfile.summary}</p>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="bg-white/80 dark:bg-gray-800/80 border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base"><Mail className="w-4 h-4 text-blue-600" />Contact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-gray-400" /><span>{displayProfile.email}</span></div>
                      <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-gray-400" /><span>{displayProfile.phone}</span></div>
                      <div className="flex items-center gap-3"><Globe className="w-4 h-4 text-gray-400" /><a href={displayProfile.website} className="text-blue-600 hover:underline">{displayProfile.website}</a></div>
                      <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-gray-400" /><span>{displayProfile.location}</span></div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 dark:bg-gray-800/80 border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base"><Eye className="w-4 h-4 text-blue-600" />Who viewed your profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {mockProfileViewers.slice(0, 3).map((viewer) => (
                          <div key={viewer.id} className="flex items-center gap-3">
                            {viewer.isAnonymous ? (
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-400" />
                              </div>
                            ) : (
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={viewer.avatar} />
                                <AvatarFallback>{viewer.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{viewer.isAnonymous ? 'LinkedIn Member' : viewer.name}</p>
                              <p className="text-xs text-gray-500 truncate">{viewer.isAnonymous ? 'Private mode' : viewer.headline}</p>
                            </div>
                            <span className="text-xs text-gray-400">{formatTimeAgo(viewer.viewedAt)}</span>
                          </div>
                        ))}
                      </div>
                      <Button variant="link" className="w-full mt-2 text-blue-600">View all {stats.profileViews} views</Button>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Top Skills Preview */}
              <Card className="bg-white/80 dark:bg-gray-800/80 border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2"><Zap className="w-5 h-5 text-blue-600" />Top Skills</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('skills')}>See all <ChevronRight className="w-4 h-4 ml-1" /></Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {mockSkills.filter(s => s.isTopSkill).map((skill) => (
                      <div key={skill.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{skill.name}</p>
                            {skill.assessmentStatus === 'passed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                          </div>
                          <p className="text-sm text-gray-500">{skill.endorsements} endorsements</p>
                        </div>
                        <Badge className={getSkillLevelColor(skill.level)}>{skill.level}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Experience Preview */}
              <Card className="bg-white/80 dark:bg-gray-800/80 border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-blue-600" />Experience</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('experience')}>See all <ChevronRight className="w-4 h-4 ml-1" /></Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {displayExperiences.slice(0, 2).map((exp) => (
                      <div key={exp.id} className="flex gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={exp.companyLogo} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">{exp.company[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{exp.title}</h4>
                          <p className="text-gray-600 dark:text-gray-300">{exp.company} • {exp.employmentType}</p>
                          <p className="text-sm text-gray-500">{formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatDate(exp.endDate!)} • {calculateDuration(exp.startDate, exp.endDate)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Experience Tab */}
            <TabsContent value="experience" className="space-y-6">
              {/* Experience Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 p-6 text-white">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Professional Experience</h3>
                      <p className="text-purple-100">Your career journey and achievements</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{displayExperiences.length}</p>
                      <p className="text-sm text-purple-100">Positions</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{mockCertifications.length}</p>
                      <p className="text-sm text-purple-100">Certifications</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{displayEducation.length}</p>
                      <p className="text-sm text-purple-100">Degrees</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{mockHonors.length}</p>
                      <p className="text-sm text-purple-100">Awards</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {[
                  { icon: Plus, label: 'Add Position', color: 'from-blue-500 to-indigo-600' },
                  { icon: Award, label: 'Add Cert', color: 'from-purple-500 to-pink-600' },
                  { icon: GraduationCap, label: 'Add Education', color: 'from-green-500 to-emerald-600' },
                  { icon: Trophy, label: 'Add Award', color: 'from-orange-500 to-amber-600' },
                  { icon: BookOpen, label: 'Add Project', color: 'from-cyan-500 to-blue-600' },
                  { icon: Heart, label: 'Volunteer', color: 'from-pink-500 to-rose-600' },
                  { icon: FileText, label: 'Publication', color: 'from-indigo-500 to-purple-600' },
                  { icon: Languages, label: 'Languages', color: 'from-yellow-500 to-orange-600' },
                ].map((action, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2 hover:scale-105 transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm"
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color}`}>
                      <action.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-medium">{action.label}</span>
                  </Button>
                ))}
              </div>

              <Card className="bg-white/80 dark:bg-gray-800/80 border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-blue-600" />Experience</CardTitle>
                    <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"><Plus className="w-4 h-4 mr-1" />Add</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {displayExperiences.map((exp) => (
                      <div key={exp.id} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <Avatar className="w-14 h-14">
                          <AvatarImage src={(exp as any).companyLogo} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-lg">{exp.company[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{exp.title}</h4>
                          <p className="text-gray-600 dark:text-gray-300">{exp.company} • {exp.employmentType}</p>
                          <p className="text-sm text-gray-500">{formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatDate(exp.endDate!)} • {calculateDuration(exp.startDate, exp.endDate)}</p>
                          <p className="text-sm text-gray-500 mb-2">{exp.location} • {exp.locationType}</p>
                          <p className="text-gray-600 dark:text-gray-300 mb-3">{exp.description}</p>
                          {exp.achievements.length > 0 && (
                            <div className="mb-3">
                              <p className="text-sm font-medium mb-1">Key Achievements:</p>
                              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
                                {exp.achievements.map((a, i) => <li key={i}>{a}</li>)}
                              </ul>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {exp.skills.map((skill, i) => <Badge key={i} variant="outline">{skill}</Badge>)}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteExperience(exp.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Award className="w-5 h-5 text-blue-600" />Certifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockCertifications.map((cert) => (
                      <div key={cert.id} className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <div className="flex gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={cert.issuingOrgLogo} />
                            <AvatarFallback>{cert.issuingOrg[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{cert.name}</h4>
                            <p className="text-gray-600 dark:text-gray-300">{cert.issuingOrg}</p>
                            <p className="text-sm text-gray-500">Issued {formatDate(cert.issueDate)}</p>
                            <p className="text-sm text-gray-500">Credential ID: {cert.credentialId}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4 mr-1" />View</a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><GraduationCap className="w-5 h-5 text-blue-600" />Education</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {displayEducation.map((edu) => (
                      <div key={edu.id} className="flex gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={(edu as any).schoolLogo} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">{edu.school[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{edu.school}</h4>
                          <p className="text-gray-600 dark:text-gray-300">{edu.degree}, {edu.field}</p>
                          <p className="text-sm text-gray-500">{edu.startYear} - {edu.endYear || 'Present'}</p>
                          {edu.grade && <p className="text-sm text-gray-500">Grade: {edu.grade}</p>}
                          {edu.activities && <p className="text-sm text-gray-500">Activities: {edu.activities}</p>}
                          {edu.societies.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {edu.societies.map((s, i) => <Badge key={i} variant="outline" className="text-xs">{s}</Badge>)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Skills Tab */}
            <TabsContent value="skills" className="space-y-6">
              {/* Skills Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 p-6 text-white">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Skills & Endorsements</h3>
                      <p className="text-green-100">Showcase your expertise and get endorsed</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{stats.skills}</p>
                      <p className="text-sm text-green-100">Total Skills</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{formatNumber(stats.endorsements)}</p>
                      <p className="text-sm text-green-100">Endorsements</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{stats.assessmentsPassed}</p>
                      <p className="text-sm text-green-100">Assessments Passed</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{mockSkills.filter(s => s.isTopSkill).length}</p>
                      <p className="text-sm text-green-100">Top Skills</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {[
                  { icon: Plus, label: 'Add Skill', color: 'from-green-500 to-emerald-600' },
                  { icon: CheckCircle, label: 'Take Quiz', color: 'from-blue-500 to-indigo-600' },
                  { icon: Star, label: 'Pin Skill', color: 'from-yellow-500 to-orange-600' },
                  { icon: ThumbsUp, label: 'Get Endorsed', color: 'from-purple-500 to-pink-600' },
                  { icon: Award, label: 'Add Badge', color: 'from-cyan-500 to-blue-600' },
                  { icon: Target, label: 'Skill Goals', color: 'from-orange-500 to-red-600' },
                  { icon: TrendingUp, label: 'Skill Trends', color: 'from-indigo-500 to-purple-600' },
                  { icon: RefreshCw, label: 'Reorder', color: 'from-pink-500 to-rose-600' },
                ].map((action, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2 hover:scale-105 transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm"
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color}`}>
                      <action.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-medium">{action.label}</span>
                  </Button>
                ))}
              </div>

              <Card className="bg-white/80 dark:bg-gray-800/80 border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <CardTitle className="flex items-center gap-2"><Zap className="w-5 h-5 text-blue-600" />Skills & Endorsements</CardTitle>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input placeholder="Search skills..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 w-48" />
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {skillCategories.map((cat) => (
                          <Button key={cat} variant={selectedSkillCategory === cat ? 'default' : 'outline'} size="sm" onClick={() => setSelectedSkillCategory(cat)}>
                            {cat === 'all' ? 'All' : cat}
                          </Button>
                        ))}
                      </div>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                        onClick={() => {
                          const skillName = prompt('Enter skill name:')
                          if (skillName) handleAddSkill(skillName)
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" />Add Skill
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-4">
                      {filteredSkills.map((skill) => (
                        <div key={skill.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                              <Zap className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{skill.name}</p>
                                {skill.isTopSkill && <Badge className="bg-yellow-100 text-yellow-700">Top Skill</Badge>}
                                {skill.isPinned && <Badge variant="outline">Pinned</Badge>}
                              </div>
                              <div className="flex items-center gap-3 text-sm text-gray-500">
                                <span>{skill.endorsements} endorsements</span>
                                <span>•</span>
                                <span>{skill.category}</span>
                              </div>
                              {skill.assessmentStatus === 'passed' && skill.assessmentScore && (
                                <div className="flex items-center gap-2 mt-1">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span className="text-sm text-green-600">Assessment passed ({skill.assessmentScore}%)</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={getSkillLevelColor(skill.level)}>{skill.level}</Badge>
                            <Badge className={getAssessmentColor(skill.assessmentStatus)}>
                              {skill.assessmentStatus === 'not-taken' ? 'Take Quiz' : skill.assessmentStatus.replace('-', ' ')}
                            </Badge>
                            <Button variant="outline" size="sm">Endorse</Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteSkill(skill.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Featured Tab */}
            <TabsContent value="featured" className="space-y-6">
              {/* Featured Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 p-6 text-white">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Star className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Featured Content</h3>
                      <p className="text-yellow-100">Highlight your best work and achievements</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{mockFeatured.length}</p>
                      <p className="text-sm text-yellow-100">Featured Items</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{mockProfile.articlesCount}</p>
                      <p className="text-sm text-yellow-100">Articles</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{formatNumber(mockProfile.newsletterSubscribers)}</p>
                      <p className="text-sm text-yellow-100">Subscribers</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{mockProjects.length}</p>
                      <p className="text-sm text-yellow-100">Projects</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {[
                  { icon: Plus, label: 'Add Featured', color: 'from-yellow-500 to-orange-600' },
                  { icon: FileText, label: 'New Article', color: 'from-blue-500 to-indigo-600' },
                  { icon: Link2, label: 'Add Link', color: 'from-purple-500 to-pink-600' },
                  { icon: Newspaper, label: 'Newsletter', color: 'from-green-500 to-emerald-600' },
                  { icon: Image, label: 'Add Media', color: 'from-cyan-500 to-blue-600' },
                  { icon: Podcast, label: 'Podcast', color: 'from-orange-500 to-red-600' },
                  { icon: Video, label: 'Add Video', color: 'from-pink-500 to-rose-600' },
                  { icon: RefreshCw, label: 'Reorder', color: 'from-indigo-500 to-purple-600' },
                ].map((action, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2 hover:scale-105 transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm"
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color}`}>
                      <action.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-medium">{action.label}</span>
                  </Button>
                ))}
              </div>

              <Card className="bg-white/80 dark:bg-gray-800/80 border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2"><Star className="w-5 h-5 text-blue-600" />Featured</CardTitle>
                    <Button size="sm"><Plus className="w-4 h-4 mr-1" />Add Featured</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockFeatured.map((item) => (
                      <Card key={item.id} className="border hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                              {item.type === 'article' && <FileText className="w-5 h-5 text-blue-600" />}
                              {item.type === 'post' && <MessageSquare className="w-5 h-5 text-green-600" />}
                              {item.type === 'newsletter' && <Newspaper className="w-5 h-5 text-purple-600" />}
                              {item.type === 'link' && <Link2 className="w-5 h-5 text-orange-600" />}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{item.title}</h4>
                              <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                              {item.stats && (
                                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                  {item.stats.views && <span>{formatNumber(item.stats.views)} views</span>}
                                  {item.stats.likes && <span>{formatNumber(item.stats.likes)} likes</span>}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Network Tab */}
            <TabsContent value="network" className="space-y-6">
              {/* Network Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 p-6 text-white">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Network className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Your Network</h3>
                      <p className="text-cyan-100">Connect with professionals worldwide</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{formatNumber(stats.connections)}</p>
                      <p className="text-sm text-cyan-100">Connections</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{formatNumber(stats.followers)}</p>
                      <p className="text-sm text-cyan-100">Followers</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{mockProfile.following}</p>
                      <p className="text-sm text-cyan-100">Following</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{mockConnections.filter(c => c.status === 'pending').length}</p>
                      <p className="text-sm text-cyan-100">Pending</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {[
                  { icon: UserPlus, label: 'Add Contacts', color: 'from-cyan-500 to-blue-600' },
                  { icon: Search, label: 'Find People', color: 'from-blue-500 to-indigo-600' },
                  { icon: Users, label: 'My Network', color: 'from-purple-500 to-pink-600' },
                  { icon: MessageSquare, label: 'Messages', color: 'from-green-500 to-emerald-600' },
                  { icon: Mail, label: 'Invitations', color: 'from-orange-500 to-amber-600' },
                  { icon: Building2, label: 'Companies', color: 'from-pink-500 to-rose-600' },
                  { icon: GraduationCap, label: 'Alumni', color: 'from-indigo-500 to-purple-600' },
                  { icon: Globe, label: 'Groups', color: 'from-yellow-500 to-orange-600' },
                ].map((action, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2 hover:scale-105 transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm"
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color}`}>
                      <action.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-medium">{action.label}</span>
                  </Button>
                ))}
              </div>

              <Card className="bg-white/80 dark:bg-gray-800/80 border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Network className="w-5 h-5 text-blue-600" />Connections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockConnections.map((connection) => (
                      <div key={connection.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={connection.avatar} />
                            <AvatarFallback>{connection.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{connection.name}</h4>
                            <p className="text-sm text-gray-500">{connection.headline}</p>
                            <p className="text-xs text-gray-400">{connection.mutualConnections} mutual connections</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getConnectionStatusColor(connection.status)}>{connection.status}</Badge>
                          <Button variant="outline" size="sm"><MessageSquare className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Jobs Tab */}
            <TabsContent value="jobs" className="space-y-6">
              {/* Jobs Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-white">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Job Opportunities</h3>
                      <p className="text-indigo-100">Find your next career opportunity</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{mockJobs.length}</p>
                      <p className="text-sm text-indigo-100">Recommended</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{mockJobs.filter(j => j.isSaved).length}</p>
                      <p className="text-sm text-indigo-100">Saved Jobs</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{mockJobs.filter(j => j.isEasyApply).length}</p>
                      <p className="text-sm text-indigo-100">Easy Apply</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{Math.round(mockJobs.reduce((a, j) => a + j.matchScore, 0) / mockJobs.length)}%</p>
                      <p className="text-sm text-indigo-100">Avg Match</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {[
                  { icon: Search, label: 'Search Jobs', color: 'from-indigo-500 to-purple-600' },
                  { icon: Bookmark, label: 'Saved Jobs', color: 'from-blue-500 to-indigo-600' },
                  { icon: Bell, label: 'Job Alerts', color: 'from-purple-500 to-pink-600' },
                  { icon: Target, label: 'Preferences', color: 'from-green-500 to-emerald-600' },
                  { icon: FileText, label: 'Applications', color: 'from-orange-500 to-amber-600' },
                  { icon: Building2, label: 'Companies', color: 'from-cyan-500 to-blue-600' },
                  { icon: TrendingUp, label: 'Salary Info', color: 'from-pink-500 to-rose-600' },
                  { icon: Users, label: 'Referrals', color: 'from-yellow-500 to-orange-600' },
                ].map((action, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2 hover:scale-105 transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm"
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color}`}>
                      <action.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-medium">{action.label}</span>
                  </Button>
                ))}
              </div>

              <Card className="bg-white/80 dark:bg-gray-800/80 border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-blue-600" />Recommended Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockJobs.map((job) => (
                      <div key={job.id} className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={job.companyLogo} />
                            <AvatarFallback>{job.company[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-blue-600 hover:underline cursor-pointer">{job.title}</h4>
                            <p className="text-gray-600 dark:text-gray-300">{job.company}</p>
                            <p className="text-sm text-gray-500">{job.location} • {job.locationType}</p>
                            {job.salary && <p className="text-sm font-medium text-green-600">{formatSalary(job.salary)}</p>}
                            <div className="flex flex-wrap gap-2 mt-2">
                              {job.skills.map((s, i) => <Badge key={i} variant="outline" className="text-xs">{s}</Badge>)}
                            </div>
                            <p className="text-xs text-gray-400 mt-2">{job.applicants} applicants • Posted {formatTimeAgo(job.postedAt)}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className="bg-green-100 text-green-700">{job.matchScore}% match</Badge>
                          {job.isEasyApply && <Badge variant="outline">Easy Apply</Badge>}
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon"><Bookmark className={`w-4 h-4 ${job.isSaved ? 'fill-current text-blue-600' : ''}`} /></Button>
                            <Button size="sm">Apply</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              {/* Activity Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 p-6 text-white">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Activity className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Your Activity</h3>
                      <p className="text-pink-100">Track your posts and engagement</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{mockPosts.length}</p>
                      <p className="text-sm text-pink-100">Posts</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{formatNumber(mockPosts.reduce((a, p) => a + p.likes, 0))}</p>
                      <p className="text-sm text-pink-100">Total Likes</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{mockPosts.reduce((a, p) => a + p.comments, 0)}</p>
                      <p className="text-sm text-pink-100">Comments</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{formatNumber(stats.postImpressions)}</p>
                      <p className="text-sm text-pink-100">Impressions</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {[
                  { icon: Plus, label: 'New Post', color: 'from-pink-500 to-rose-600' },
                  { icon: FileText, label: 'Write Article', color: 'from-blue-500 to-indigo-600' },
                  { icon: Image, label: 'Share Photo', color: 'from-purple-500 to-pink-600' },
                  { icon: Video, label: 'Post Video', color: 'from-green-500 to-emerald-600' },
                  { icon: Calendar, label: 'Create Event', color: 'from-orange-500 to-amber-600' },
                  { icon: BarChart3, label: 'Analytics', color: 'from-cyan-500 to-blue-600' },
                  { icon: Hash, label: 'Hashtags', color: 'from-indigo-500 to-purple-600' },
                  { icon: Clock, label: 'Schedule', color: 'from-yellow-500 to-orange-600' },
                ].map((action, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2 hover:scale-105 transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm"
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color}`}>
                      <action.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-medium">{action.label}</span>
                  </Button>
                ))}
              </div>

              <Card className="bg-white/80 dark:bg-gray-800/80 border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5 text-blue-600" />Recent Activity</CardTitle>
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
                              <span className="font-semibold">{mockProfile.firstName} {mockProfile.lastName}</span>
                              {post.isPinned && <Badge variant="outline" className="text-xs">Pinned</Badge>}
                              <Badge variant="outline" className="text-xs">{post.type}</Badge>
                              <span className="text-xs text-gray-500">{formatTimeAgo(post.createdAt)}</span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line mb-3">{post.content}</p>
                            <div className="flex gap-6 text-sm text-gray-500">
                              <span className="flex items-center gap-1"><ThumbsUp className="w-4 h-4" />{formatNumber(post.likes)}</span>
                              <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" />{post.comments}</span>
                              <span className="flex items-center gap-1"><Share2 className="w-4 h-4" />{post.reposts}</span>
                              <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{formatNumber(post.impressions)}</span>
                              <span className="text-green-600">{post.engagementRate}% engagement</span>
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
              {/* Settings Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 p-6 text-white">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Settings className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Profile Settings</h3>
                      <p className="text-gray-300">Customize your profile and preferences</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">6</p>
                      <p className="text-sm text-gray-300">Settings Areas</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{mockProfile.profileStrength}%</p>
                      <p className="text-sm text-gray-300">Completeness</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">Active</p>
                      <p className="text-sm text-gray-300">Security Status</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">3</p>
                      <p className="text-sm text-gray-300">Integrations</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </div>

              {/* Settings Grid with Sidebar Navigation */}
              <div className="grid grid-cols-12 gap-6">
                {/* Settings Sidebar */}
                <div className="col-span-12 lg:col-span-3">
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm sticky top-6">
                    <CardContent className="p-4">
                      <nav className="space-y-1">
                        {[
                          { id: 'general', label: 'General', icon: Settings, description: 'Basic profile settings' },
                          { id: 'visibility', label: 'Visibility', icon: Eye, description: 'Profile visibility options' },
                          { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alert preferences' },
                          { id: 'privacy', label: 'Privacy', icon: Shield, description: 'Privacy controls' },
                          { id: 'security', label: 'Security', icon: Lock, description: 'Account security' },
                          { id: 'advanced', label: 'Advanced', icon: Sliders, description: 'Power features' },
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setSettingsTab(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all ${
                              settingsTab === item.id
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-l-4 border-blue-500'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <item.icon className={`h-5 w-5 ${settingsTab === item.id ? 'text-blue-600' : 'text-gray-400'}`} />
                            <div>
                              <p className="font-medium text-sm">{item.label}</p>
                              <p className="text-xs text-gray-500">{item.description}</p>
                            </div>
                          </button>
                        ))}
                      </nav>
                    </CardContent>
                  </Card>
                </div>

                {/* Settings Content */}
                <div className="col-span-12 lg:col-span-9 space-y-6">
                  {/* General Settings */}
                  {settingsTab === 'general' && (
                    <>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-blue-600" />Profile Information</CardTitle>
                          <CardDescription>Manage your basic profile details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>First Name</Label>
                              <Input
                                value={formData.firstName}
                                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Last Name</Label>
                              <Input
                                value={formData.lastName}
                                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                                className="mt-1"
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Headline</Label>
                            <Input
                              value={formData.headline}
                              onChange={(e) => setFormData(prev => ({ ...prev, headline: e.target.value }))}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Location</Label>
                            <Input
                              value={formData.location}
                              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Industry</Label>
                            <Input
                              value={formData.industry}
                              onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Custom URL</Label>
                            <Input
                              value={formData.customUrl}
                              onChange={(e) => setFormData(prev => ({ ...prev, customUrl: e.target.value }))}
                              className="mt-1"
                            />
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2"><Mail className="w-5 h-5 text-blue-600" />Contact Information</CardTitle>
                          <CardDescription>Manage your contact details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Email Address</Label>
                              <Input
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Phone Number</Label>
                              <Input
                                value={formData.phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                className="mt-1"
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Website</Label>
                            <Input
                              value={formData.website}
                              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                              className="mt-1"
                            />
                          </div>
                          <div className="pt-4 flex justify-end">
                            <Button
                              onClick={handleUpdateProfile}
                              disabled={saving}
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                            >
                              {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {/* Visibility Settings */}
                  {settingsTab === 'visibility' && (
                    <>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2"><Eye className="w-5 h-5 text-blue-600" />Profile Visibility</CardTitle>
                          <CardDescription>Control who can see your profile</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Public Profile</p>
                              <p className="text-sm text-gray-500">Make your profile visible to everyone</p>
                            </div>
                            <Switch
                              checked={settings?.privacy_level === 'public'}
                              onCheckedChange={(checked) => handleUpdateSettings({ privacy_level: checked ? 'public' : 'private' })}
                            />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Show Email</p>
                              <p className="text-sm text-gray-500">Display email on your profile</p>
                            </div>
                            <Switch
                              checked={settings?.show_email ?? false}
                              onCheckedChange={(checked) => handleUpdateSettings({ show_email: checked })}
                            />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Show Phone</p>
                              <p className="text-sm text-gray-500">Display phone on your profile</p>
                            </div>
                            <Switch
                              checked={settings?.show_phone ?? false}
                              onCheckedChange={(checked) => handleUpdateSettings({ show_phone: checked })}
                            />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Show Location</p>
                              <p className="text-sm text-gray-500">Display location on your profile</p>
                            </div>
                            <Switch
                              checked={settings?.show_location ?? true}
                              onCheckedChange={(checked) => handleUpdateSettings({ show_location: checked })}
                            />
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-blue-600" />Connection Settings</CardTitle>
                          <CardDescription>Control connections and messaging</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Allow Messages</p>
                              <p className="text-sm text-gray-500">Let others send you messages</p>
                            </div>
                            <Switch
                              checked={settings?.allow_messages ?? true}
                              onCheckedChange={(checked) => handleUpdateSettings({ allow_messages: checked })}
                            />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Allow Connection Requests</p>
                              <p className="text-sm text-gray-500">Let others request to connect</p>
                            </div>
                            <Switch
                              checked={settings?.allow_connections ?? true}
                              onCheckedChange={(checked) => handleUpdateSettings({ allow_connections: checked })}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {/* Notification Settings */}
                  {settingsTab === 'notifications' && (
                    <>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5 text-blue-600" />Email Notifications</CardTitle>
                          <CardDescription>Manage your email preferences</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Email Notifications</p>
                              <p className="text-sm text-gray-500">Receive email notifications</p>
                            </div>
                            <Switch
                              checked={settings?.email_notifications ?? true}
                              onCheckedChange={(checked) => handleUpdateSettings({ email_notifications: checked })}
                            />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Push Notifications</p>
                              <p className="text-sm text-gray-500">Receive push notifications</p>
                            </div>
                            <Switch
                              checked={settings?.push_notifications ?? true}
                              onCheckedChange={(checked) => handleUpdateSettings({ push_notifications: checked })}
                            />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Marketing Emails</p>
                              <p className="text-sm text-gray-500">Receive marketing and promotional emails</p>
                            </div>
                            <Switch
                              checked={settings?.marketing_emails ?? false}
                              onCheckedChange={(checked) => handleUpdateSettings({ marketing_emails: checked })}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {/* Privacy Settings */}
                  {settingsTab === 'privacy' && (
                    <>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-blue-600" />Privacy Controls</CardTitle>
                          <CardDescription>Manage your privacy settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Profile Viewing Mode</p>
                              <p className="text-sm text-gray-500">Browse profiles privately</p>
                            </div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Activity Broadcasts</p>
                              <p className="text-sm text-gray-500">Share activity updates with network</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Data Sharing</p>
                              <p className="text-sm text-gray-500">Allow data for personalization</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2"><Download className="w-5 h-5 text-blue-600" />Data Management</CardTitle>
                          <CardDescription>Download or delete your data</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Download Your Data</p>
                              <p className="text-sm text-gray-500">Get a copy of all your data</p>
                            </div>
                            <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Download</Button>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <div>
                              <p className="font-medium text-red-700 dark:text-red-400">Delete Account</p>
                              <p className="text-sm text-red-600 dark:text-red-400">Permanently delete your account</p>
                            </div>
                            <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50"><Trash2 className="w-4 h-4 mr-2" />Delete</Button>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {/* Security Settings */}
                  {settingsTab === 'security' && (
                    <>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5 text-blue-600" />Account Security</CardTitle>
                          <CardDescription>Protect your account</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Two-Factor Authentication</p>
                              <p className="text-sm text-gray-500">Add an extra layer of security</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Login Alerts</p>
                              <p className="text-sm text-gray-500">Get notified of new logins</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Change Password</p>
                              <p className="text-sm text-gray-500">Update your password regularly</p>
                            </div>
                            <Button variant="outline" size="sm"><Key className="w-4 h-4 mr-2" />Change</Button>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2"><History className="w-5 h-5 text-blue-600" />Login History</CardTitle>
                          <CardDescription>Recent account access</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {[
                              { device: 'MacBook Pro', location: 'San Francisco, CA', time: '2 hours ago', current: true },
                              { device: 'iPhone 15', location: 'San Francisco, CA', time: '1 day ago', current: false },
                              { device: 'Chrome on Windows', location: 'New York, NY', time: '3 days ago', current: false },
                            ].map((session, i) => (
                              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Terminal className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm flex items-center gap-2">
                                      {session.device}
                                      {session.current && <Badge className="bg-green-100 text-green-700 text-xs">Current</Badge>}
                                    </p>
                                    <p className="text-xs text-gray-500">{session.location} • {session.time}</p>
                                  </div>
                                </div>
                                {!session.current && <Button variant="ghost" size="sm" className="text-red-600">Sign out</Button>}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {/* Advanced Settings */}
                  {settingsTab === 'advanced' && (
                    <>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2"><Sliders className="w-5 h-5 text-blue-600" />Advanced Settings</CardTitle>
                          <CardDescription>Power user features</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Language</p>
                              <p className="text-sm text-gray-500">Select your preferred language</p>
                            </div>
                            <Input defaultValue="English (US)" className="w-48" />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Timezone</p>
                              <p className="text-sm text-gray-500">Set your timezone</p>
                            </div>
                            <Input defaultValue="America/Los_Angeles" className="w-48" />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Dark Mode</p>
                              <p className="text-sm text-gray-500">Enable dark theme</p>
                            </div>
                            <Switch />
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2"><Webhook className="w-5 h-5 text-blue-600" />Integrations</CardTitle>
                          <CardDescription>Connect with other apps</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-lg"><Twitter className="w-4 h-4" /></div>
                              <div>
                                <p className="font-medium">Twitter</p>
                                <p className="text-sm text-gray-500">Connected as @johnsmith</p>
                              </div>
                            </div>
                            <Badge className="bg-green-100 text-green-700">Connected</Badge>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-lg"><Github className="w-4 h-4" /></div>
                              <div>
                                <p className="font-medium">GitHub</p>
                                <p className="text-sm text-gray-500">Connected as johnsmith</p>
                              </div>
                            </div>
                            <Badge className="bg-green-100 text-green-700">Connected</Badge>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-lg"><Globe className="w-4 h-4" /></div>
                              <div>
                                <p className="font-medium">Google</p>
                                <p className="text-sm text-gray-500">Not connected</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">Connect</Button>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2"><Database className="w-5 h-5 text-blue-600" />Data & Storage</CardTitle>
                          <CardDescription>Manage data usage</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Cache</p>
                              <p className="text-sm text-gray-500">Clear cached data</p>
                            </div>
                            <Button variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-2" />Clear</Button>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Storage Usage</p>
                              <p className="text-sm text-gray-500">245 MB of 1 GB used</p>
                            </div>
                            <Progress value={24.5} className="w-32" />
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Enhanced Competitive Upgrade Components */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-2">
              <AIInsightsPanel
                insights={mockProfileAIInsights}
                title="Profile Intelligence"
                onInsightAction={(insight) => console.log('Insight action:', insight)}
              />
            </div>
            <div className="space-y-6">
              <CollaborationIndicator
                collaborators={mockProfileCollaborators}
                maxVisible={4}
              />
              <PredictiveAnalytics
                predictions={mockProfilePredictions}
                title="Career Forecasts"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <ActivityFeed
              activities={mockProfileActivities}
              title="Profile Activity"
              maxItems={5}
            />
            <QuickActionsToolbar
              actions={mockProfileQuickActions}
              variant="grid"
            />
          </div>

          {/* Analytics Dialog */}
          <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" />Profile Analytics</DialogTitle>
                <DialogDescription>Track your profile performance over the last 90 days</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Eye className="w-5 h-5 text-blue-600" />
                      <span className="text-green-600 text-sm flex items-center"><ArrowUpRight className="w-3 h-3" />{stats.profileViewsChange}%</span>
                    </div>
                    <div className="text-2xl font-bold">{formatNumber(stats.profileViews)}</div>
                    <div className="text-sm text-gray-500">Profile views</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Search className="w-5 h-5 text-purple-600" />
                      <span className="text-green-600 text-sm flex items-center"><ArrowUpRight className="w-3 h-3" />{stats.searchAppearancesChange}%</span>
                    </div>
                    <div className="text-2xl font-bold">{formatNumber(stats.searchAppearances)}</div>
                    <div className="text-sm text-gray-500">Search appearances</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="text-green-600 text-sm flex items-center"><ArrowUpRight className="w-3 h-3" />{stats.postImpressionsChange}%</span>
                    </div>
                    <div className="text-2xl font-bold">{formatNumber(stats.postImpressions)}</div>
                    <div className="text-sm text-gray-500">Post impressions</div>
                  </CardContent>
                </Card>
              </div>
              <div className="mt-4">
                <h4 className="font-medium mb-3">Recent Profile Viewers</h4>
                <div className="space-y-3">
                  {mockProfileViewers.map((viewer) => (
                    <div key={viewer.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        {viewer.isAnonymous ? (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-400" />
                          </div>
                        ) : (
                          <Avatar>
                            <AvatarImage src={viewer.avatar} />
                            <AvatarFallback>{viewer.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <p className="font-medium">{viewer.isAnonymous ? 'LinkedIn Member' : viewer.name}</p>
                          <p className="text-sm text-gray-500">{viewer.isAnonymous ? 'Private mode' : viewer.headline}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{formatTimeAgo(viewer.viewedAt)}</p>
                        <p className="text-xs text-gray-400">via {viewer.source}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
