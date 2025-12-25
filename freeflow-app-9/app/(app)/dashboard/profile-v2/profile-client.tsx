'use client'

import { useState, useMemo } from 'react'
import {
  User, Edit, Camera, Phone, Mail, MapPin, Calendar, Globe,
  Briefcase, Award, Star, Users, Shield, MessageSquare, Settings,
  Share2, Download, Plus, Search, Eye, Link2, TrendingUp,
  GraduationCap, Building2, FileText, Heart, ThumbsUp, Bookmark,
  BarChart3, CheckCircle, Clock, ExternalLink, Image, Video,
  PenTool, Zap, Target, Bell, Lock, Activity, UserPlus, UserCheck,
  Languages, BookOpen, Lightbulb, Trophy, Medal, Network, Sparkles,
  ArrowUpRight, ArrowDownRight, MoreHorizontal, Flag, Send,
  Linkedin, Twitter, Github, Youtube, Instagram, Facebook,
  Mic, Podcast, Newspaper, FileCode, FolderOpen, Hash,
  Layers, Palette, Code, Database, Server, Cloud, Terminal,
  Verified, Crown, Gem, AlertCircle, Info, X, ChevronRight,
  ChevronDown, Filter, SortAsc, Grid, List, Play, Pause,
  Volume2, Headphones, Radio, Gift, Coffee, Rocket, Flame,
  Compass, Map, Navigation, Anchor, Scissors, Wand2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
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

export default function ProfileClient() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSkillCategory, setSelectedSkillCategory] = useState<string | 'all'>('all')
  const [showAnalytics, setShowAnalytics] = useState(false)

  const skillCategories = useMemo(() => {
    const categories = [...new Set(mockSkills.map(s => s.category))]
    return ['all', ...categories]
  }, [])

  const filteredSkills = useMemo(() => {
    return mockSkills.filter(skill => {
      const matchesCategory = selectedSkillCategory === 'all' || skill.category === selectedSkillCategory
      const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [selectedSkillCategory, searchQuery])

  const stats = useMemo(() => ({
    profileViews: mockProfile.profileViews,
    profileViewsChange: mockProfile.profileViewsChange,
    searchAppearances: mockProfile.searchAppearances,
    searchAppearancesChange: mockProfile.searchAppearancesChange,
    postImpressions: mockProfile.postImpressions,
    postImpressionsChange: mockProfile.postImpressionsChange,
    connections: mockProfile.connections,
    followers: mockProfile.followers,
    skills: mockSkills.length,
    endorsements: mockSkills.reduce((sum, s) => sum + s.endorsements, 0),
    recommendations: mockRecommendations.filter(r => r.isReceived).length,
    assessmentsPassed: mockSkills.filter(s => s.assessmentStatus === 'passed').length
  }), [])

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
              <Button variant="outline" onClick={() => setShowAnalytics(true)}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
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
              {mockProfile.coverStory && (
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
                    <AvatarImage src={mockProfile.avatar} />
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      {mockProfile.firstName[0]}{mockProfile.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  {mockProfile.isPremium && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full text-xs font-bold text-amber-900 flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Premium
                    </div>
                  )}
                </div>
                <div className="flex-1 pt-16 lg:pt-4">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {mockProfile.firstName} {mockProfile.lastName}
                    </h2>
                    {mockProfile.pronouns && <span className="text-sm text-gray-500">({mockProfile.pronouns})</span>}
                    {mockProfile.isVerified && <Shield className="w-5 h-5 text-blue-500" />}
                    {mockProfile.topVoice && (
                      <Badge className="bg-orange-100 text-orange-700">
                        <Mic className="w-3 h-3 mr-1" />
                        Top Voice
                      </Badge>
                    )}
                    {mockProfile.isCreatorMode && (
                      <Badge className="bg-purple-100 text-purple-700">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Creator
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">{mockProfile.headline}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{mockProfile.location}</span>
                    <span className="flex items-center gap-1"><Building2 className="w-4 h-4" />{mockProfile.currentCompany}</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" />{formatNumber(mockProfile.connections)} connections</span>
                    <span className="flex items-center gap-1"><Heart className="w-4 h-4" />{formatNumber(mockProfile.followers)} followers</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {mockProfile.isOpenToWork && <Badge className="bg-green-100 text-green-700"><Target className="w-3 h-3 mr-1" />Open to Work</Badge>}
                    {mockProfile.isHiring && <Badge className="bg-purple-100 text-purple-700"><Briefcase className="w-3 h-3 mr-1" />Hiring</Badge>}
                    {mockProfile.socialLinks.map((link, i) => (
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
                      <Progress value={mockProfile.profileStrength} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">{mockProfile.profileStrength}% All-Star</p>
                    </div>
                  </div>
                  <div className="flex lg:justify-end gap-2">
                    <Badge variant="outline">{mockProfile.featuredCount} Featured</Badge>
                    <Badge variant="outline">{mockProfile.articlesCount} Articles</Badge>
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-blue-600" />About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{mockProfile.summary}</p>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="bg-white/80 dark:bg-gray-800/80 border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base"><Mail className="w-4 h-4 text-blue-600" />Contact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-gray-400" /><span>{mockProfile.email}</span></div>
                      <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-gray-400" /><span>{mockProfile.phone}</span></div>
                      <div className="flex items-center gap-3"><Globe className="w-4 h-4 text-gray-400" /><a href={mockProfile.website} className="text-blue-600 hover:underline">{mockProfile.website}</a></div>
                      <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-gray-400" /><span>{mockProfile.location}</span></div>
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
                    {mockExperiences.slice(0, 2).map((exp) => (
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
              <Card className="bg-white/80 dark:bg-gray-800/80 border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-blue-600" />Experience</CardTitle>
                    <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"><Plus className="w-4 h-4 mr-1" />Add</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {mockExperiences.map((exp) => (
                      <div key={exp.id} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <Avatar className="w-14 h-14">
                          <AvatarImage src={exp.companyLogo} />
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
                    {mockEducation.map((edu) => (
                      <div key={edu.id} className="flex gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={edu.schoolLogo} />
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
                      <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"><Plus className="w-4 h-4 mr-1" />Add Skill</Button>
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/80 dark:bg-gray-800/80 border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Eye className="w-5 h-5" />Visibility</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div><p className="font-medium">Profile visibility</p><p className="text-sm text-gray-500">Visible to everyone</p></div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div><p className="font-medium">Open to work</p><p className="text-sm text-gray-500">Let recruiters know</p></div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div><p className="font-medium">Creator mode</p><p className="text-sm text-gray-500">Grow your audience</p></div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-gray-800/80 border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" />Notifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div><p className="font-medium">Connection requests</p><p className="text-sm text-gray-500">New requests</p></div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div><p className="font-medium">Profile views</p><p className="text-sm text-gray-500">Weekly summary</p></div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div><p className="font-medium">Job alerts</p><p className="text-sm text-gray-500">Matching jobs</p></div>
                      <Switch />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

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
