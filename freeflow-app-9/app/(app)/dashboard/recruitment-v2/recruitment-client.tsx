'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Briefcase,
  Users,
  Calendar,
  Clock,
  TrendingUp,
  Plus,
  Search,
  FileText,
  Mail,
  Database,
  Settings,
  BarChart3,
  MapPin,
  DollarSign,
  Building2,
  Star,
  ThumbsUp,
  ThumbsDown,
  Video,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Eye,
  Edit,
  Trash2,
  Filter,
  Download,
  Upload,
  UserPlus,
  GraduationCap,
  Award,
  MessageSquare,
  ChevronRight,
  MoreVertical,
  Linkedin,
  Globe,
  FileCheck,
  Target,
  Zap
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

import {
  recruitmentAIInsights,
  recruitmentCollaborators,
  recruitmentPredictions,
  recruitmentActivities,
  recruitmentQuickActions,
} from '@/lib/mock-data/adapters'

// Types
type JobStatus = 'draft' | 'open' | 'on-hold' | 'filled' | 'cancelled'
type JobType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance'
type JobPriority = 'low' | 'medium' | 'high' | 'urgent'
type CandidateStage = 'applied' | 'screening' | 'phone-interview' | 'technical' | 'onsite' | 'offer' | 'hired' | 'rejected'
type InterviewType = 'phone' | 'video' | 'onsite' | 'technical' | 'behavioral' | 'panel'
type InterviewStatus = 'scheduled' | 'completed' | 'cancelled' | 'no-show' | 'rescheduled'
type OfferStatus = 'draft' | 'pending-approval' | 'approved' | 'sent' | 'accepted' | 'declined' | 'expired' | 'negotiating'
type SourceType = 'linkedin' | 'indeed' | 'referral' | 'website' | 'agency' | 'career-fair' | 'other'

interface JobRequisition {
  id: string
  title: string
  jobCode: string
  department: string
  location: string
  type: JobType
  status: JobStatus
  priority: JobPriority
  hiringManager: string
  recruiter: string
  salaryMin: number
  salaryMax: number
  currency: string
  description: string
  requirements: string[]
  benefits: string[]
  applicationsCount: number
  screenedCount: number
  interviewingCount: number
  offersCount: number
  postedDate: string
  closingDate: string
  targetHireDate: string
  headcount: number
  filledCount: number
}

interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  jobId: string
  jobTitle: string
  stage: CandidateStage
  source: SourceType
  matchScore: number
  experienceYears: number
  currentCompany: string
  currentTitle: string
  location: string
  skills: string[]
  education: string
  linkedinUrl?: string
  portfolioUrl?: string
  resumeUrl: string
  coverLetter?: string
  appliedDate: string
  lastActivity: string
  notes: string[]
  rating: number
  tags: string[]
}

interface Interview {
  id: string
  candidateId: string
  candidateName: string
  candidateAvatar?: string
  jobId: string
  jobTitle: string
  type: InterviewType
  status: InterviewStatus
  scheduledDate: string
  scheduledTime: string
  duration: number
  location: string
  interviewers: { name: string; role: string; avatar?: string }[]
  meetingLink?: string
  feedback?: {
    rating: number
    strengths: string[]
    concerns: string[]
    recommendation: 'strong-yes' | 'yes' | 'neutral' | 'no' | 'strong-no'
    notes: string
  }
  createdAt: string
}

interface Offer {
  id: string
  candidateId: string
  candidateName: string
  candidateAvatar?: string
  jobId: string
  jobTitle: string
  status: OfferStatus
  baseSalary: number
  bonus?: number
  equity?: string
  currency: string
  startDate: string
  expiryDate: string
  benefits: string[]
  approvers: { name: string; status: 'pending' | 'approved' | 'rejected'; date?: string }[]
  sentDate?: string
  responseDate?: string
  negotiationNotes?: string
  createdAt: string
}

interface TalentPoolCandidate {
  id: string
  name: string
  email: string
  avatar?: string
  skills: string[]
  experienceYears: number
  currentTitle: string
  currentCompany: string
  location: string
  source: SourceType
  addedDate: string
  lastContactedDate?: string
  notes: string
  interestedRoles: string[]
  availability: 'immediate' | '2-weeks' | '1-month' | '3-months' | 'not-looking'
  tags: string[]
}

// Mock Data
const mockJobs: JobRequisition[] = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    jobCode: 'ENG-2024-001',
    department: 'Engineering',
    location: 'San Francisco, CA',
    type: 'full-time',
    status: 'open',
    priority: 'high',
    hiringManager: 'Sarah Chen',
    recruiter: 'Mike Johnson',
    salaryMin: 150000,
    salaryMax: 200000,
    currency: 'USD',
    description: 'We are looking for a Senior Software Engineer to join our platform team...',
    requirements: ['5+ years experience', 'React/TypeScript', 'System Design', 'AWS'],
    benefits: ['Health Insurance', '401k Match', 'Unlimited PTO', 'Remote Work'],
    applicationsCount: 145,
    screenedCount: 42,
    interviewingCount: 18,
    offersCount: 3,
    postedDate: '2024-01-15',
    closingDate: '2024-03-15',
    targetHireDate: '2024-04-01',
    headcount: 3,
    filledCount: 1
  },
  {
    id: '2',
    title: 'Product Manager',
    jobCode: 'PM-2024-003',
    department: 'Product',
    location: 'New York, NY',
    type: 'full-time',
    status: 'open',
    priority: 'urgent',
    hiringManager: 'David Kim',
    recruiter: 'Lisa Park',
    salaryMin: 130000,
    salaryMax: 180000,
    currency: 'USD',
    description: 'Join our product team to drive product strategy and roadmap...',
    requirements: ['3+ years PM experience', 'B2B SaaS', 'Data-driven', 'Agile'],
    benefits: ['Health Insurance', 'Stock Options', 'Learning Budget', 'Gym Membership'],
    applicationsCount: 89,
    screenedCount: 28,
    interviewingCount: 12,
    offersCount: 2,
    postedDate: '2024-01-20',
    closingDate: '2024-02-28',
    targetHireDate: '2024-03-15',
    headcount: 2,
    filledCount: 0
  },
  {
    id: '3',
    title: 'UX Designer',
    jobCode: 'DES-2024-002',
    department: 'Design',
    location: 'Remote',
    type: 'full-time',
    status: 'open',
    priority: 'medium',
    hiringManager: 'Emma Wilson',
    recruiter: 'Mike Johnson',
    salaryMin: 100000,
    salaryMax: 140000,
    currency: 'USD',
    description: 'Design beautiful and intuitive user experiences...',
    requirements: ['4+ years UX', 'Figma', 'User Research', 'Design Systems'],
    benefits: ['Health Insurance', 'Remote Work', 'Equipment Budget', 'Sabbatical'],
    applicationsCount: 234,
    screenedCount: 56,
    interviewingCount: 8,
    offersCount: 1,
    postedDate: '2024-01-10',
    closingDate: '2024-03-01',
    targetHireDate: '2024-03-20',
    headcount: 1,
    filledCount: 0
  },
  {
    id: '4',
    title: 'Data Scientist',
    jobCode: 'DATA-2024-001',
    department: 'Data',
    location: 'Austin, TX',
    type: 'full-time',
    status: 'on-hold',
    priority: 'low',
    hiringManager: 'Alex Thompson',
    recruiter: 'Lisa Park',
    salaryMin: 140000,
    salaryMax: 190000,
    currency: 'USD',
    description: 'Build ML models and drive data-driven decisions...',
    requirements: ['PhD or MS', 'Python', 'ML/AI', 'Statistics'],
    benefits: ['Health Insurance', '401k Match', 'Conference Budget', 'Relocation'],
    applicationsCount: 67,
    screenedCount: 15,
    interviewingCount: 4,
    offersCount: 0,
    postedDate: '2024-01-05',
    closingDate: '2024-04-01',
    targetHireDate: '2024-05-01',
    headcount: 2,
    filledCount: 0
  },
  {
    id: '5',
    title: 'Marketing Intern',
    jobCode: 'MKT-2024-INT',
    department: 'Marketing',
    location: 'San Francisco, CA',
    type: 'internship',
    status: 'open',
    priority: 'low',
    hiringManager: 'Jennifer Lee',
    recruiter: 'Mike Johnson',
    salaryMin: 25,
    salaryMax: 35,
    currency: 'USD/hr',
    description: 'Join our marketing team for a summer internship...',
    requirements: ['Current student', 'Social Media', 'Content Creation', 'Analytics'],
    benefits: ['Mentorship', 'Project Ownership', 'Full-time potential'],
    applicationsCount: 312,
    screenedCount: 78,
    interviewingCount: 15,
    offersCount: 5,
    postedDate: '2024-02-01',
    closingDate: '2024-03-31',
    targetHireDate: '2024-06-01',
    headcount: 5,
    filledCount: 2
  }
]

const mockCandidates: Candidate[] = [
  {
    id: '1',
    name: 'John Martinez',
    email: 'john.martinez@email.com',
    phone: '+1 (555) 123-4567',
    avatar: '',
    jobId: '1',
    jobTitle: 'Senior Software Engineer',
    stage: 'onsite',
    source: 'linkedin',
    matchScore: 92,
    experienceYears: 7,
    currentCompany: 'Google',
    currentTitle: 'Software Engineer III',
    location: 'San Francisco, CA',
    skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Python'],
    education: 'MS Computer Science, Stanford',
    linkedinUrl: 'linkedin.com/in/johnmartinez',
    portfolioUrl: 'johnmartinez.dev',
    resumeUrl: '/resumes/john-martinez.pdf',
    appliedDate: '2024-01-18',
    lastActivity: '2024-02-10',
    notes: ['Strong technical background', 'Great communication'],
    rating: 5,
    tags: ['top-candidate', 'referred']
  },
  {
    id: '2',
    name: 'Sarah Williams',
    email: 'sarah.w@email.com',
    phone: '+1 (555) 234-5678',
    jobId: '1',
    jobTitle: 'Senior Software Engineer',
    stage: 'technical',
    source: 'referral',
    matchScore: 88,
    experienceYears: 6,
    currentCompany: 'Meta',
    currentTitle: 'Senior Frontend Engineer',
    location: 'Menlo Park, CA',
    skills: ['React', 'JavaScript', 'GraphQL', 'CSS', 'Testing'],
    education: 'BS Computer Science, MIT',
    linkedinUrl: 'linkedin.com/in/sarahwilliams',
    resumeUrl: '/resumes/sarah-williams.pdf',
    appliedDate: '2024-01-20',
    lastActivity: '2024-02-08',
    notes: ['Excellent problem-solving', 'Frontend expert'],
    rating: 4,
    tags: ['strong-frontend']
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'mchen@email.com',
    phone: '+1 (555) 345-6789',
    jobId: '2',
    jobTitle: 'Product Manager',
    stage: 'offer',
    source: 'linkedin',
    matchScore: 95,
    experienceYears: 5,
    currentCompany: 'Stripe',
    currentTitle: 'Senior Product Manager',
    location: 'San Francisco, CA',
    skills: ['Product Strategy', 'Data Analysis', 'Agile', 'SQL', 'Figma'],
    education: 'MBA, Harvard Business School',
    linkedinUrl: 'linkedin.com/in/michaelchen',
    resumeUrl: '/resumes/michael-chen.pdf',
    appliedDate: '2024-01-22',
    lastActivity: '2024-02-12',
    notes: ['Exceptional product sense', 'Strong leader'],
    rating: 5,
    tags: ['top-candidate', 'fast-track']
  },
  {
    id: '4',
    name: 'Emily Rodriguez',
    email: 'emily.r@email.com',
    phone: '+1 (555) 456-7890',
    jobId: '3',
    jobTitle: 'UX Designer',
    stage: 'screening',
    source: 'website',
    matchScore: 75,
    experienceYears: 4,
    currentCompany: 'Airbnb',
    currentTitle: 'Product Designer',
    location: 'Los Angeles, CA',
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
    education: 'BFA Design, RISD',
    portfolioUrl: 'emilyrodriguez.design',
    resumeUrl: '/resumes/emily-rodriguez.pdf',
    appliedDate: '2024-02-01',
    lastActivity: '2024-02-05',
    notes: ['Beautiful portfolio'],
    rating: 4,
    tags: ['creative']
  },
  {
    id: '5',
    name: 'David Park',
    email: 'david.park@email.com',
    phone: '+1 (555) 567-8901',
    jobId: '1',
    jobTitle: 'Senior Software Engineer',
    stage: 'rejected',
    source: 'indeed',
    matchScore: 45,
    experienceYears: 3,
    currentCompany: 'Startup XYZ',
    currentTitle: 'Junior Developer',
    location: 'Seattle, WA',
    skills: ['JavaScript', 'HTML', 'CSS', 'React'],
    education: 'BS Computer Science, UW',
    resumeUrl: '/resumes/david-park.pdf',
    appliedDate: '2024-01-25',
    lastActivity: '2024-01-28',
    notes: ['Not enough experience for senior role'],
    rating: 2,
    tags: []
  },
  {
    id: '6',
    name: 'Amanda Foster',
    email: 'amanda.f@email.com',
    phone: '+1 (555) 678-9012',
    jobId: '2',
    jobTitle: 'Product Manager',
    stage: 'phone-interview',
    source: 'agency',
    matchScore: 82,
    experienceYears: 4,
    currentCompany: 'Salesforce',
    currentTitle: 'Product Manager',
    location: 'New York, NY',
    skills: ['Product Roadmap', 'Stakeholder Management', 'Analytics', 'Jira'],
    education: 'BS Business, NYU',
    linkedinUrl: 'linkedin.com/in/amandafoster',
    resumeUrl: '/resumes/amanda-foster.pdf',
    appliedDate: '2024-01-28',
    lastActivity: '2024-02-09',
    notes: ['Strong B2B background'],
    rating: 4,
    tags: ['b2b-experience']
  }
]

const mockInterviews: Interview[] = [
  {
    id: '1',
    candidateId: '1',
    candidateName: 'John Martinez',
    jobId: '1',
    jobTitle: 'Senior Software Engineer',
    type: 'onsite',
    status: 'scheduled',
    scheduledDate: '2024-02-15',
    scheduledTime: '10:00 AM',
    duration: 240,
    location: 'SF Office - Room 301',
    interviewers: [
      { name: 'Sarah Chen', role: 'Hiring Manager' },
      { name: 'Alex Kim', role: 'Tech Lead' },
      { name: 'Maria Garcia', role: 'Senior Engineer' }
    ],
    createdAt: '2024-02-08'
  },
  {
    id: '2',
    candidateId: '2',
    candidateName: 'Sarah Williams',
    jobId: '1',
    jobTitle: 'Senior Software Engineer',
    type: 'technical',
    status: 'scheduled',
    scheduledDate: '2024-02-14',
    scheduledTime: '2:00 PM',
    duration: 90,
    location: 'Virtual',
    interviewers: [
      { name: 'Alex Kim', role: 'Tech Lead' },
      { name: 'James Wilson', role: 'Principal Engineer' }
    ],
    meetingLink: 'https://zoom.us/j/123456789',
    createdAt: '2024-02-06'
  },
  {
    id: '3',
    candidateId: '6',
    candidateName: 'Amanda Foster',
    jobId: '2',
    jobTitle: 'Product Manager',
    type: 'phone',
    status: 'completed',
    scheduledDate: '2024-02-09',
    scheduledTime: '11:00 AM',
    duration: 45,
    location: 'Phone Call',
    interviewers: [
      { name: 'Lisa Park', role: 'Recruiter' }
    ],
    feedback: {
      rating: 4,
      strengths: ['Clear communication', 'Relevant experience', 'Enthusiastic'],
      concerns: ['Limited B2B SaaS exposure'],
      recommendation: 'yes',
      notes: 'Good candidate, recommend moving to next round.'
    },
    createdAt: '2024-02-05'
  },
  {
    id: '4',
    candidateId: '3',
    candidateName: 'Michael Chen',
    jobId: '2',
    jobTitle: 'Product Manager',
    type: 'panel',
    status: 'completed',
    scheduledDate: '2024-02-08',
    scheduledTime: '1:00 PM',
    duration: 180,
    location: 'NY Office - Conference A',
    interviewers: [
      { name: 'David Kim', role: 'VP Product' },
      { name: 'Jennifer Lee', role: 'Director Marketing' },
      { name: 'Tom Brown', role: 'CTO' }
    ],
    feedback: {
      rating: 5,
      strengths: ['Exceptional product sense', 'Data-driven', 'Leadership qualities', 'Strategic thinking'],
      concerns: [],
      recommendation: 'strong-yes',
      notes: 'Outstanding candidate. Ready to extend offer immediately.'
    },
    createdAt: '2024-02-01'
  }
]

const mockOffers: Offer[] = [
  {
    id: '1',
    candidateId: '3',
    candidateName: 'Michael Chen',
    jobId: '2',
    jobTitle: 'Product Manager',
    status: 'sent',
    baseSalary: 165000,
    bonus: 20000,
    equity: '0.1% over 4 years',
    currency: 'USD',
    startDate: '2024-03-15',
    expiryDate: '2024-02-20',
    benefits: ['Health Insurance', 'Stock Options', 'Unlimited PTO', '$5k Learning Budget'],
    approvers: [
      { name: 'David Kim', status: 'approved', date: '2024-02-10' },
      { name: 'HR Director', status: 'approved', date: '2024-02-11' },
      { name: 'Finance', status: 'approved', date: '2024-02-11' }
    ],
    sentDate: '2024-02-12',
    createdAt: '2024-02-09'
  },
  {
    id: '2',
    candidateId: '1',
    candidateName: 'John Martinez',
    jobId: '1',
    jobTitle: 'Senior Software Engineer',
    status: 'pending-approval',
    baseSalary: 185000,
    bonus: 25000,
    equity: '0.05% over 4 years',
    currency: 'USD',
    startDate: '2024-04-01',
    expiryDate: '2024-02-25',
    benefits: ['Health Insurance', 'Stock Options', 'Unlimited PTO', 'Remote Work'],
    approvers: [
      { name: 'Sarah Chen', status: 'approved', date: '2024-02-13' },
      { name: 'HR Director', status: 'pending' },
      { name: 'Finance', status: 'pending' }
    ],
    createdAt: '2024-02-13'
  }
]

const mockTalentPool: TalentPoolCandidate[] = [
  {
    id: '1',
    name: 'Rachel Green',
    email: 'rachel.g@email.com',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Science'],
    experienceYears: 8,
    currentTitle: 'ML Engineer',
    currentCompany: 'OpenAI',
    location: 'San Francisco, CA',
    source: 'linkedin',
    addedDate: '2024-01-10',
    lastContactedDate: '2024-02-01',
    notes: 'Reached out for ML Engineer role. Interested but not ready to move.',
    interestedRoles: ['Staff ML Engineer', 'AI Research'],
    availability: '3-months',
    tags: ['ml-expert', 'passive']
  },
  {
    id: '2',
    name: 'James Wilson',
    email: 'james.w@email.com',
    skills: ['Go', 'Kubernetes', 'DevOps', 'AWS'],
    experienceYears: 10,
    currentTitle: 'Principal Engineer',
    currentCompany: 'Netflix',
    location: 'Los Gatos, CA',
    source: 'referral',
    addedDate: '2023-12-15',
    notes: 'Silver medalist candidate from previous search. Keep warm.',
    interestedRoles: ['Staff Engineer', 'Engineering Manager'],
    availability: 'not-looking',
    tags: ['silver-medalist', 'infrastructure']
  },
  {
    id: '3',
    name: 'Lisa Thompson',
    email: 'lisa.t@email.com',
    skills: ['Product Strategy', 'Growth', 'Analytics', 'SQL'],
    experienceYears: 6,
    currentTitle: 'Senior PM',
    currentCompany: 'Uber',
    location: 'New York, NY',
    source: 'career-fair',
    addedDate: '2024-01-20',
    lastContactedDate: '2024-01-25',
    notes: 'Met at tech conference. Strong growth background.',
    interestedRoles: ['Director of Product', 'Group PM'],
    availability: '1-month',
    tags: ['growth-pm', 'active']
  }
]

export default function RecruitmentClient() {
  const [activeTab, setActiveTab] = useState('jobs')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedJob, setSelectedJob] = useState<JobRequisition | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null)
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  const [jobFilter, setJobFilter] = useState<JobStatus | 'all'>('all')
  const [stageFilter, setStageFilter] = useState<CandidateStage | 'all'>('all')

  // Stats calculations
  const stats = useMemo(() => {
    const activeJobs = mockJobs.filter(j => j.status === 'open').length
    const totalApplications = mockJobs.reduce((sum, j) => sum + j.applicationsCount, 0)
    const totalInterviewing = mockCandidates.filter(c =>
      ['phone-interview', 'technical', 'onsite'].includes(c.stage)
    ).length
    const pendingOffers = mockOffers.filter(o =>
      ['pending-approval', 'sent', 'negotiating'].includes(o.status)
    ).length
    const upcomingInterviews = mockInterviews.filter(i => i.status === 'scheduled').length
    const avgTimeToHire = 28
    const offerAcceptanceRate = 85
    const talentPoolSize = mockTalentPool.length

    return {
      activeJobs,
      totalApplications,
      totalInterviewing,
      pendingOffers,
      upcomingInterviews,
      avgTimeToHire,
      offerAcceptanceRate,
      talentPoolSize
    }
  }, [])

  // Filtered data
  const filteredJobs = useMemo(() => {
    return mockJobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.jobCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.department.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter = jobFilter === 'all' || job.status === jobFilter
      return matchesSearch && matchesFilter
    })
  }, [searchQuery, jobFilter])

  const filteredCandidates = useMemo(() => {
    return mockCandidates.filter(candidate => {
      const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesFilter = stageFilter === 'all' || candidate.stage === stageFilter
      return matchesSearch && matchesFilter
    })
  }, [searchQuery, stageFilter])

  // Helper functions
  const getJobStatusColor = (status: JobStatus) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'on-hold': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'filled': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const getPriorityColor = (priority: JobPriority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'high': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const getStageColor = (stage: CandidateStage) => {
    switch (stage) {
      case 'applied': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
      case 'screening': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'phone-interview': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'technical': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
      case 'onsite': return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'
      case 'offer': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'hired': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getInterviewTypeIcon = (type: InterviewType) => {
    switch (type) {
      case 'phone': return <Phone className="w-4 h-4" />
      case 'video': return <Video className="w-4 h-4" />
      case 'onsite': return <Building2 className="w-4 h-4" />
      case 'technical': return <FileCheck className="w-4 h-4" />
      case 'behavioral': return <MessageSquare className="w-4 h-4" />
      case 'panel': return <Users className="w-4 h-4" />
      default: return <Calendar className="w-4 h-4" />
    }
  }

  const getOfferStatusColor = (status: OfferStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
      case 'pending-approval': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'approved': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'sent': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'accepted': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'declined': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'expired': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
      case 'negotiating': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getSourceIcon = (source: SourceType) => {
    switch (source) {
      case 'linkedin': return <Linkedin className="w-4 h-4" />
      case 'referral': return <UserPlus className="w-4 h-4" />
      case 'website': return <Globe className="w-4 h-4" />
      default: return <Database className="w-4 h-4" />
    }
  }

  const formatSalary = (min: number, max: number, currency: string) => {
    if (currency === 'USD/hr') {
      return `$${min}-${max}/hr`
    }
    return `$${(min/1000).toFixed(0)}K - $${(max/1000).toFixed(0)}K`
  }

  // Pipeline stages for kanban
  const pipelineStages: { stage: CandidateStage; label: string; color: string }[] = [
    { stage: 'applied', label: 'Applied', color: 'border-gray-300' },
    { stage: 'screening', label: 'Screening', color: 'border-blue-300' },
    { stage: 'phone-interview', label: 'Phone', color: 'border-purple-300' },
    { stage: 'technical', label: 'Technical', color: 'border-indigo-300' },
    { stage: 'onsite', label: 'Onsite', color: 'border-cyan-300' },
    { stage: 'offer', label: 'Offer', color: 'border-yellow-300' }
  ]

  const handlePostJob = () => {
    toast.info('Opening job posting form...')
    // In production, this would open a job creation dialog or navigate to posting page
  }

  const handleExportReport = () => {
    toast.success('Exporting recruitment report...')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:bg-none dark:bg-gray-900">
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Recruitment</h1>
                <p className="text-gray-500 dark:text-gray-400">Workday-level Applicant Tracking System</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleExportReport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white" onClick={handlePostJob}>
                <Plus className="w-4 h-4 mr-2" />
                Post Job
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-purple-600 mb-1">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeJobs}</div>
                <div className="text-xs text-gray-500">Active Jobs</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalApplications}</div>
                <div className="text-xs text-gray-500">Applications</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-yellow-600 mb-1">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.upcomingInterviews}</div>
                <div className="text-xs text-gray-500">Interviews</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-green-600 mb-1">
                  <Send className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingOffers}</div>
                <div className="text-xs text-gray-500">Pending Offers</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-cyan-600 mb-1">
                  <Target className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalInterviewing}</div>
                <div className="text-xs text-gray-500">In Pipeline</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-orange-600 mb-1">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgTimeToHire}d</div>
                <div className="text-xs text-gray-500">Avg Hire Time</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.offerAcceptanceRate}%</div>
                <div className="text-xs text-gray-500">Acceptance</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-indigo-600 mb-1">
                  <Database className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.talentPoolSize}</div>
                <div className="text-xs text-gray-500">Talent Pool</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="bg-white dark:bg-gray-800 p-1 shadow-sm">
                <TabsTrigger value="jobs">Jobs</TabsTrigger>
                <TabsTrigger value="candidates">Candidates</TabsTrigger>
                <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
                <TabsTrigger value="interviews">Interviews</TabsTrigger>
                <TabsTrigger value="offers">Offers</TabsTrigger>
                <TabsTrigger value="talent-pool">Talent Pool</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64 bg-white dark:bg-gray-800"
                  />
                </div>
              </div>
            </div>

            {/* Jobs Tab */}
            <TabsContent value="jobs" className="space-y-4">
              {/* Jobs Banner */}
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Job Postings</h2>
                    <p className="text-blue-100">Greenhouse-level recruitment management</p>
                    <p className="text-blue-200 text-xs mt-1">Multi-channel posting • Tracking • Analytics</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold">{jobs.length}</p>
                      <p className="text-blue-200 text-sm">Open Positions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold">{candidates.length}</p>
                      <p className="text-blue-200 text-sm">Candidates</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant={jobFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setJobFilter('all')}
                >
                  All
                </Button>
                {(['open', 'on-hold', 'filled', 'cancelled'] as JobStatus[]).map(status => (
                  <Button
                    key={status}
                    variant={jobFilter === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setJobFilter(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                  </Button>
                ))}
              </div>

              <div className="grid gap-4">
                {filteredJobs.map(job => (
                  <Card
                    key={job.id}
                    className="bg-white dark:bg-gray-800 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedJob(job)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                            <Briefcase className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                              <span>{job.jobCode}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {job.department}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {job.location}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(job.priority)}>{job.priority}</Badge>
                          <Badge className={getJobStatusColor(job.status)}>{job.status}</Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-4">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {job.filledCount}/{job.headcount} filled
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Posted {new Date(job.postedDate).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">{job.applicationsCount}</div>
                          <div className="text-xs text-gray-500">Applications</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">{job.screenedCount}</div>
                          <div className="text-xs text-gray-500">Screened</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">{job.interviewingCount}</div>
                          <div className="text-xs text-gray-500">Interviewing</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">{job.offersCount}</div>
                          <div className="text-xs text-gray-500">Offers</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-gray-700">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Hiring Manager: {job.hiringManager}</span>
                          <span>Recruiter: {job.recruiter}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Candidates Tab */}
            <TabsContent value="candidates" className="space-y-4">
              {/* Candidates Banner */}
              <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Candidate Pool</h2>
                    <p className="text-emerald-100">Lever-level applicant tracking</p>
                    <p className="text-emerald-200 text-xs mt-1">Resume parsing • Scoring • Stage tracking</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold">{candidates.length}</p>
                      <p className="text-emerald-200 text-sm">Candidates</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <Button
                  variant={stageFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStageFilter('all')}
                >
                  All
                </Button>
                {(['applied', 'screening', 'phone-interview', 'technical', 'onsite', 'offer', 'hired', 'rejected'] as CandidateStage[]).map(stage => (
                  <Button
                    key={stage}
                    variant={stageFilter === stage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStageFilter(stage)}
                  >
                    {stage.charAt(0).toUpperCase() + stage.slice(1).replace('-', ' ')}
                  </Button>
                ))}
              </div>

              <div className="grid gap-4">
                {filteredCandidates.map(candidate => (
                  <Card
                    key={candidate.id}
                    className="bg-white dark:bg-gray-800 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedCandidate(candidate)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={candidate.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                              {candidate.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{candidate.name}</h3>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${i < candidate.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-gray-500">{candidate.currentTitle} at {candidate.currentCompany}</p>
                            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Briefcase className="w-3 h-3" />
                                {candidate.jobTitle}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {candidate.location}
                              </span>
                              <span>•</span>
                              <span>{candidate.experienceYears} years exp</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={getStageColor(candidate.stage)}>{candidate.stage.replace('-', ' ')}</Badge>
                          <div className="flex items-center gap-1 text-sm">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            <span className="font-medium">{candidate.matchScore}% match</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4">
                        {candidate.skills.slice(0, 5).map(skill => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {candidate.skills.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{candidate.skills.length - 5} more
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-gray-700">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            {getSourceIcon(candidate.source)}
                            {candidate.source}
                          </span>
                          <span>Applied {new Date(candidate.appliedDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <FileText className="w-4 h-4 mr-1" />
                            Resume
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Mail className="w-4 h-4 mr-1" />
                            Email
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Calendar className="w-4 h-4 mr-1" />
                            Schedule
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Pipeline Tab - Kanban View */}
            <TabsContent value="pipeline" className="space-y-4">
              <ScrollArea className="w-full">
                <div className="flex gap-4 pb-4 min-w-max">
                  {pipelineStages.map(({ stage, label, color }) => {
                    const stageCandidates = mockCandidates.filter(c => c.stage === stage)
                    return (
                      <div key={stage} className={`w-72 flex-shrink-0 border-t-4 ${color} rounded-lg bg-gray-50 dark:bg-gray-800/50`}>
                        <div className="p-4 border-b dark:border-gray-700">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{label}</h3>
                            <Badge variant="outline">{stageCandidates.length}</Badge>
                          </div>
                        </div>
                        <ScrollArea className="h-[500px]">
                          <div className="p-3 space-y-3">
                            {stageCandidates.map(candidate => (
                              <Card
                                key={candidate.id}
                                className="bg-white dark:bg-gray-800 cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => setSelectedCandidate(candidate)}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-start gap-3">
                                    <Avatar className="w-10 h-10">
                                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                                        {candidate.name.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">{candidate.name}</h4>
                                      <p className="text-xs text-gray-500 truncate">{candidate.jobTitle}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center gap-1">
                                      <Zap className="w-3 h-3 text-yellow-500" />
                                      <span className="text-xs font-medium">{candidate.matchScore}%</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-2.5 h-2.5 ${i < candidate.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                  {candidate.tags.length > 0 && (
                                    <div className="flex gap-1 mt-2 flex-wrap">
                                      {candidate.tags.slice(0, 2).map(tag => (
                                        <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Interviews Tab */}
            <TabsContent value="interviews" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Upcoming Interviews */}
                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      Upcoming Interviews
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockInterviews.filter(i => i.status === 'scheduled').map(interview => (
                        <div
                          key={interview.id}
                          className="p-4 border rounded-lg dark:border-gray-700 hover:shadow-sm transition-shadow cursor-pointer"
                          onClick={() => setSelectedInterview(interview)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                                  {interview.candidateName.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">{interview.candidateName}</h4>
                                <p className="text-sm text-gray-500">{interview.jobTitle}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="flex items-center gap-1">
                              {getInterviewTypeIcon(interview.type)}
                              {interview.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(interview.scheduledDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {interview.scheduledTime}
                            </span>
                            <span>{interview.duration} min</span>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <span className="text-xs text-gray-500">Interviewers:</span>
                            <div className="flex -space-x-2">
                              {interview.interviewers.map((interviewer, i) => (
                                <Avatar key={i} className="w-6 h-6 border-2 border-white dark:border-gray-800">
                                  <AvatarFallback className="text-[10px] bg-gray-200 dark:bg-gray-600">
                                    {interviewer.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Completed with Feedback */}
                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Recent Feedback
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockInterviews.filter(i => i.status === 'completed' && i.feedback).map(interview => (
                        <div
                          key={interview.id}
                          className="p-4 border rounded-lg dark:border-gray-700 hover:shadow-sm transition-shadow cursor-pointer"
                          onClick={() => setSelectedInterview(interview)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                                  {interview.candidateName.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">{interview.candidateName}</h4>
                                <p className="text-sm text-gray-500">{interview.jobTitle}</p>
                              </div>
                            </div>
                            <Badge
                              className={
                                interview.feedback?.recommendation === 'strong-yes' ? 'bg-green-100 text-green-700' :
                                interview.feedback?.recommendation === 'yes' ? 'bg-blue-100 text-blue-700' :
                                interview.feedback?.recommendation === 'no' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                              }
                            >
                              {interview.feedback?.recommendation === 'strong-yes' && <ThumbsUp className="w-3 h-3 mr-1" />}
                              {interview.feedback?.recommendation?.replace('-', ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-gray-500">Rating:</span>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < (interview.feedback?.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          </div>
                          {interview.feedback?.strengths && interview.feedback.strengths.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {interview.feedback.strengths.slice(0, 3).map(strength => (
                                <Badge key={strength} variant="outline" className="text-xs text-green-600">
                                  {strength}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Offers Tab */}
            <TabsContent value="offers" className="space-y-4">
              <div className="grid gap-4">
                {mockOffers.map(offer => (
                  <Card
                    key={offer.id}
                    className="bg-white dark:bg-gray-800 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedOffer(offer)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
                              {offer.candidateName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{offer.candidateName}</h3>
                            <p className="text-sm text-gray-500">{offer.jobTitle}</p>
                          </div>
                        </div>
                        <Badge className={getOfferStatusColor(offer.status)}>
                          {offer.status.replace('-', ' ')}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Base Salary</div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            ${offer.baseSalary.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Bonus</div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            ${(offer.bonus || 0).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Equity</div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {offer.equity || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Start Date</div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {new Date(offer.startDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="text-xs text-gray-500 mb-2">Approval Status</div>
                        <div className="flex items-center gap-3">
                          {offer.approvers.map((approver, i) => (
                            <div key={i} className="flex items-center gap-2">
                              {approver.status === 'approved' ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : approver.status === 'rejected' ? (
                                <XCircle className="w-4 h-4 text-red-500" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-yellow-500" />
                              )}
                              <span className="text-sm text-gray-600 dark:text-gray-400">{approver.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                        <div className="text-sm text-gray-500">
                          Expires: {new Date(offer.expiryDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          {offer.status === 'approved' && (
                            <Button size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600">
                              <Send className="w-4 h-4 mr-1" />
                              Send Offer
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Talent Pool Tab */}
            <TabsContent value="talent-pool" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </Button>
                </div>
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Candidate
                </Button>
              </div>

              <div className="grid gap-4">
                {mockTalentPool.map(candidate => (
                  <Card key={candidate.id} className="bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                              {candidate.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{candidate.name}</h3>
                            <p className="text-sm text-gray-500">{candidate.currentTitle} at {candidate.currentCompany}</p>
                            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {candidate.location}
                              </span>
                              <span>•</span>
                              <span>{candidate.experienceYears} years exp</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={
                            candidate.availability === 'immediate' ? 'bg-green-100 text-green-700' :
                            candidate.availability === '2-weeks' ? 'bg-blue-100 text-blue-700' :
                            candidate.availability === '1-month' ? 'bg-yellow-100 text-yellow-700' :
                            candidate.availability === '3-months' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-700'
                          }>
                            {candidate.availability.replace('-', ' ')}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            {getSourceIcon(candidate.source)}
                            <span>{candidate.source}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4">
                        {candidate.skills.slice(0, 4).map(skill => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {candidate.skills.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{candidate.skills.length - 4} more
                          </Badge>
                        )}
                      </div>

                      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Interested In</div>
                        <div className="flex gap-2 flex-wrap">
                          {candidate.interestedRoles.map(role => (
                            <Badge key={role} className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-gray-700">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Added: {new Date(candidate.addedDate).toLocaleDateString()}</span>
                          {candidate.lastContactedDate && (
                            <span>Last contact: {new Date(candidate.lastContactedDate).toLocaleDateString()}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Mail className="w-4 h-4 mr-1" />
                            Reach Out
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Briefcase className="w-4 h-4 mr-1" />
                            Match Jobs
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Enhanced Competitive Upgrade Components */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-2">
              <AIInsightsPanel
                insights={recruitmentAIInsights}
                title="Recruitment Intelligence"
                onInsightAction={(insight) => console.log('Insight action:', insight)}
              />
            </div>
            <div className="space-y-6">
              <CollaborationIndicator
                collaborators={recruitmentCollaborators}
                maxVisible={4}
              />
              <PredictiveAnalytics
                predictions={recruitmentPredictions}
                title="Hiring Forecasts"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <ActivityFeed
              activities={recruitmentActivities}
              title="Recruitment Activity"
              maxItems={5}
            />
            <QuickActionsToolbar
              actions={recruitmentQuickActions}
              variant="grid"
            />
          </div>
        </div>
      </div>

      {/* Job Detail Dialog */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                <Briefcase className="w-5 h-5" />
              </div>
              {selectedJob?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Badge className={getJobStatusColor(selectedJob.status)}>{selectedJob.status}</Badge>
                <Badge className={getPriorityColor(selectedJob.priority)}>{selectedJob.priority}</Badge>
                <Badge variant="outline">{selectedJob.type}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Department</div>
                  <div className="font-medium">{selectedJob.department}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Location</div>
                  <div className="font-medium">{selectedJob.location}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Salary Range</div>
                  <div className="font-medium">{formatSalary(selectedJob.salaryMin, selectedJob.salaryMax, selectedJob.currency)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Headcount</div>
                  <div className="font-medium">{selectedJob.filledCount}/{selectedJob.headcount} filled</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-2">Requirements</div>
                <div className="flex gap-2 flex-wrap">
                  {selectedJob.requirements.map(req => (
                    <Badge key={req} variant="outline">{req}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-2">Benefits</div>
                <div className="flex gap-2 flex-wrap">
                  {selectedJob.benefits.map(benefit => (
                    <Badge key={benefit} className="bg-green-100 text-green-700">{benefit}</Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedJob.applicationsCount}</div>
                  <div className="text-xs text-gray-500">Applications</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedJob.screenedCount}</div>
                  <div className="text-xs text-gray-500">Screened</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{selectedJob.interviewingCount}</div>
                  <div className="text-xs text-gray-500">Interviewing</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{selectedJob.offersCount}</div>
                  <div className="text-xs text-gray-500">Offers</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Candidate Detail Dialog */}
      <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  {selectedCandidate?.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {selectedCandidate?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedCandidate && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Badge className={getStageColor(selectedCandidate.stage)}>{selectedCandidate.stage.replace('-', ' ')}</Badge>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < selectedCandidate.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">{selectedCandidate.matchScore}% match</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Current Position</div>
                  <div className="font-medium">{selectedCandidate.currentTitle}</div>
                  <div className="text-sm text-gray-500">{selectedCandidate.currentCompany}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Applied For</div>
                  <div className="font-medium">{selectedCandidate.jobTitle}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Experience</div>
                  <div className="font-medium">{selectedCandidate.experienceYears} years</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Education</div>
                  <div className="font-medium">{selectedCandidate.education}</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-2">Skills</div>
                <div className="flex gap-2 flex-wrap">
                  {selectedCandidate.skills.map(skill => (
                    <Badge key={skill} variant="outline">{skill}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-2">Contact</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {selectedCandidate.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {selectedCandidate.phone}
                  </div>
                  {selectedCandidate.linkedinUrl && (
                    <div className="flex items-center gap-2 text-sm">
                      <Linkedin className="w-4 h-4 text-gray-400" />
                      {selectedCandidate.linkedinUrl}
                    </div>
                  )}
                </div>
              </div>

              {selectedCandidate.notes.length > 0 && (
                <div>
                  <div className="text-sm text-gray-500 mb-2">Notes</div>
                  <ul className="space-y-1">
                    {selectedCandidate.notes.map((note, i) => (
                      <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <FileText className="w-4 h-4 mr-2" />
                  View Resume
                </Button>
                <Button variant="outline" className="flex-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Interview
                </Button>
                <Button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600">
                  <ChevronRight className="w-4 h-4 mr-2" />
                  Advance Stage
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
