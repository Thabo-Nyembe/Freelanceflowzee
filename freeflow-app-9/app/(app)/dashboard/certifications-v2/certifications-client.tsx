'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

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

// Import mock data from centralized adapters
import {
  certificationsAIInsights,
  certificationsCollaborators,
  certificationsPredictions,
  certificationsActivities,
  certificationsQuickActions
} from '@/lib/mock-data/adapters'

// ============================================================================
// CREDLY-LEVEL CERTIFICATIONS - Digital Credentialing Platform
// Features: Digital badges, Skill endorsements, Learning pathways, Blockchain verification
// ============================================================================

interface Credential {
  id: string
  name: string
  description: string
  type: 'certification' | 'license' | 'degree' | 'course' | 'achievement'
  issuer: {
    id: string
    name: string
    logo: string
    verified: boolean
    website: string
  }
  recipient: {
    id: string
    name: string
    email: string
    avatar: string
  }
  issueDate: string
  expiryDate: string | null
  status: 'active' | 'expired' | 'revoked' | 'pending'
  credentialId: string
  credentialUrl: string
  badgeImage: string
  skills: string[]
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master'
  earningCriteria: string[]
  verificationHash: string
  blockchainTxId: string | null
  shareCount: number
  viewCount: number
  endorsements: number
  metadata: Record<string, string>
}

interface Badge {
  id: string
  name: string
  description: string
  image: string
  category: string
  issuer: { name: string; logo: string }
  earnedDate: string
  level: number
  xpValue: number
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  skills: string[]
  holders: number
  requirements: { description: string; completed: boolean }[]
  isPublic: boolean
  isPinned: boolean
}

interface Skill {
  id: string
  name: string
  category: string
  level: number
  maxLevel: number
  xp: number
  xpToNextLevel: number
  endorsements: {
    count: number
    topEndorsers: { name: string; avatar: string; title: string }[]
  }
  relatedBadges: { id: string; name: string; image: string }[]
  assessmentScore: number | null
  lastAssessed: string | null
  trending: boolean
  demandScore: number
}

interface LearningPathway {
  id: string
  name: string
  description: string
  category: string
  provider: string
  thumbnail: string
  duration: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  enrolledCount: number
  completedCount: number
  rating: number
  reviewCount: number
  steps: {
    id: string
    title: string
    type: 'course' | 'assessment' | 'project' | 'badge'
    duration: string
    status: 'locked' | 'available' | 'in_progress' | 'completed'
    progress: number
  }[]
  targetCredential: { name: string; image: string } | null
  progress: number
  estimatedCompletion: string | null
}

interface VerificationRecord {
  id: string
  credentialId: string
  credentialName: string
  verifiedAt: string
  verifier: { name: string; email: string; organization: string }
  method: 'blockchain' | 'api' | 'qr_code' | 'direct'
  status: 'valid' | 'invalid' | 'expired' | 'revoked'
  ipAddress: string
  location: string
  deviceType: string
}

// Mock data for Credly-level credentials
const mockCredentials: Credential[] = [
  {
    id: '1',
    name: 'AWS Solutions Architect Professional',
    description: 'Advanced certification for designing distributed systems on AWS',
    type: 'certification',
    issuer: {
      id: 'aws',
      name: 'Amazon Web Services',
      logo: '☁️',
      verified: true,
      website: 'https://aws.amazon.com'
    },
    recipient: { id: 'user1', name: 'John Doe', email: 'john@example.com', avatar: '👨‍💻' },
    issueDate: '2024-06-15',
    expiryDate: '2027-06-15',
    status: 'active',
    credentialId: 'AWS-SAP-2024-78432',
    credentialUrl: 'https://credly.com/badges/aws-sap-78432',
    badgeImage: '🏆',
    skills: ['Cloud Architecture', 'AWS', 'Distributed Systems', 'Security', 'Cost Optimization'],
    level: 'expert',
    earningCriteria: ['Pass SAP-C02 exam', '2+ years AWS experience', 'Complete lab assessments'],
    verificationHash: '0x7f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
    blockchainTxId: '0xabc123def456789',
    shareCount: 45,
    viewCount: 1250,
    endorsements: 28,
    metadata: { examScore: '892/1000', provider: 'Pearson VUE' }
  },
  {
    id: '2',
    name: 'Google Cloud Professional Data Engineer',
    description: 'Design, build, and manage data processing systems on GCP',
    type: 'certification',
    issuer: {
      id: 'gcp',
      name: 'Google Cloud',
      logo: '🌐',
      verified: true,
      website: 'https://cloud.google.com'
    },
    recipient: { id: 'user1', name: 'John Doe', email: 'john@example.com', avatar: '👨‍💻' },
    issueDate: '2024-08-20',
    expiryDate: '2026-08-20',
    status: 'active',
    credentialId: 'GCP-PDE-2024-54321',
    credentialUrl: 'https://credly.com/badges/gcp-pde-54321',
    badgeImage: '📊',
    skills: ['BigQuery', 'Dataflow', 'Data Pipelines', 'Machine Learning', 'ETL'],
    level: 'advanced',
    earningCriteria: ['Pass PDE exam', 'Complete hands-on labs', 'Case study assessment'],
    verificationHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
    blockchainTxId: '0xdef789abc123456',
    shareCount: 32,
    viewCount: 890,
    endorsements: 19,
    metadata: { examScore: '845/1000', provider: 'Kryterion' }
  },
  {
    id: '3',
    name: 'Certified Kubernetes Administrator',
    description: 'Demonstrate competence in Kubernetes administration',
    type: 'certification',
    issuer: {
      id: 'cncf',
      name: 'Cloud Native Computing Foundation',
      logo: '⚓',
      verified: true,
      website: 'https://cncf.io'
    },
    recipient: { id: 'user1', name: 'John Doe', email: 'john@example.com', avatar: '👨‍💻' },
    issueDate: '2024-03-10',
    expiryDate: '2027-03-10',
    status: 'active',
    credentialId: 'CKA-2024-LF-98765',
    credentialUrl: 'https://credly.com/badges/cka-98765',
    badgeImage: '🎯',
    skills: ['Kubernetes', 'Container Orchestration', 'DevOps', 'Linux', 'Networking'],
    level: 'advanced',
    earningCriteria: ['Pass CKA performance exam', 'Complete 2-hour hands-on test'],
    verificationHash: '0x9f8e7d6c5b4a3b2c1d0e9f8e7d6c5b4a3b2c1d0e',
    blockchainTxId: '0x456789abcdef123',
    shareCount: 67,
    viewCount: 2100,
    endorsements: 42,
    metadata: { examScore: '91%', examDuration: '120 minutes' }
  },
  {
    id: '4',
    name: 'Project Management Professional (PMP)',
    description: 'Globally recognized project management certification',
    type: 'certification',
    issuer: {
      id: 'pmi',
      name: 'Project Management Institute',
      logo: '📋',
      verified: true,
      website: 'https://pmi.org'
    },
    recipient: { id: 'user1', name: 'John Doe', email: 'john@example.com', avatar: '👨‍💻' },
    issueDate: '2023-11-05',
    expiryDate: '2026-11-05',
    status: 'active',
    credentialId: 'PMP-2023-3456789',
    credentialUrl: 'https://credly.com/badges/pmp-3456789',
    badgeImage: '🎖️',
    skills: ['Project Management', 'Agile', 'Risk Management', 'Stakeholder Management', 'Budgeting'],
    level: 'expert',
    earningCriteria: ['35 hours PM education', '3-5 years PM experience', 'Pass PMP exam'],
    verificationHash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c',
    blockchainTxId: null,
    shareCount: 89,
    viewCount: 3400,
    endorsements: 56,
    metadata: { pduEarned: '60', renewalDate: '2026-11-05' }
  },
  {
    id: '5',
    name: 'Machine Learning Specialization',
    description: 'Comprehensive ML course covering supervised and unsupervised learning',
    type: 'course',
    issuer: {
      id: 'coursera',
      name: 'Stanford Online / Coursera',
      logo: '🎓',
      verified: true,
      website: 'https://coursera.org'
    },
    recipient: { id: 'user1', name: 'John Doe', email: 'john@example.com', avatar: '👨‍💻' },
    issueDate: '2024-01-22',
    expiryDate: null,
    status: 'active',
    credentialId: 'COURSE-ML-2024-11223',
    credentialUrl: 'https://coursera.org/verify/specialization/11223',
    badgeImage: '🤖',
    skills: ['Machine Learning', 'Python', 'TensorFlow', 'Neural Networks', 'Data Science'],
    level: 'intermediate',
    earningCriteria: ['Complete all 3 courses', 'Pass all quizzes', 'Complete capstone project'],
    verificationHash: '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e',
    blockchainTxId: null,
    shareCount: 23,
    viewCount: 567,
    endorsements: 11,
    metadata: { grade: '97.5%', hoursCompleted: '120' }
  }
]

const mockBadges: Badge[] = [
  {
    id: 'b1',
    name: 'Cloud Pioneer',
    description: 'Earned 3+ cloud certifications from major providers',
    image: '🏔️',
    category: 'Cloud Computing',
    issuer: { name: 'FreeFlow Academy', logo: '🎯' },
    earnedDate: '2024-09-01',
    level: 3,
    xpValue: 500,
    rarity: 'rare',
    skills: ['AWS', 'GCP', 'Azure'],
    holders: 1234,
    requirements: [
      { description: 'Earn AWS certification', completed: true },
      { description: 'Earn GCP certification', completed: true },
      { description: 'Earn Azure certification', completed: false }
    ],
    isPublic: true,
    isPinned: true
  },
  {
    id: 'b2',
    name: 'DevOps Master',
    description: 'Demonstrated expertise in CI/CD and infrastructure automation',
    image: '🔧',
    category: 'DevOps',
    issuer: { name: 'FreeFlow Academy', logo: '🎯' },
    earnedDate: '2024-07-15',
    level: 4,
    xpValue: 750,
    rarity: 'epic',
    skills: ['Docker', 'Kubernetes', 'Terraform', 'CI/CD'],
    holders: 567,
    requirements: [
      { description: 'Complete CKA certification', completed: true },
      { description: 'Deploy 10+ production pipelines', completed: true },
      { description: 'Mentor 3 junior engineers', completed: true }
    ],
    isPublic: true,
    isPinned: true
  },
  {
    id: 'b3',
    name: 'First Certificate',
    description: 'Earned your first professional certification',
    image: '🌟',
    category: 'Milestones',
    issuer: { name: 'FreeFlow Academy', logo: '🎯' },
    earnedDate: '2023-06-01',
    level: 1,
    xpValue: 100,
    rarity: 'common',
    skills: [],
    holders: 45678,
    requirements: [{ description: 'Earn any certification', completed: true }],
    isPublic: true,
    isPinned: false
  },
  {
    id: 'b4',
    name: 'Knowledge Sharer',
    description: 'Received 50+ endorsements from peers',
    image: '🤝',
    category: 'Community',
    issuer: { name: 'FreeFlow Academy', logo: '🎯' },
    earnedDate: '2024-10-01',
    level: 2,
    xpValue: 300,
    rarity: 'uncommon',
    skills: ['Leadership', 'Mentoring'],
    holders: 8901,
    requirements: [
      { description: 'Receive 50 endorsements', completed: true },
      { description: 'Endorse 25 peers', completed: true }
    ],
    isPublic: true,
    isPinned: false
  },
  {
    id: 'b5',
    name: 'Legendary Architect',
    description: 'Achieved mastery in system architecture across all domains',
    image: '👑',
    category: 'Architecture',
    issuer: { name: 'FreeFlow Academy', logo: '🎯' },
    earnedDate: '2024-11-01',
    level: 5,
    xpValue: 1500,
    rarity: 'legendary',
    skills: ['System Design', 'Cloud Architecture', 'Security', 'Performance'],
    holders: 89,
    requirements: [
      { description: 'AWS Solutions Architect Professional', completed: true },
      { description: 'GCP Professional Architect', completed: true },
      { description: 'Design 5+ enterprise systems', completed: true },
      { description: 'Published architecture guide', completed: true }
    ],
    isPublic: true,
    isPinned: true
  }
]

const mockSkills: Skill[] = [
  {
    id: 's1',
    name: 'Cloud Architecture',
    category: 'Cloud Computing',
    level: 4,
    maxLevel: 5,
    xp: 4250,
    xpToNextLevel: 750,
    endorsements: {
      count: 42,
      topEndorsers: [
        { name: 'Alice Chen', avatar: '👩‍💻', title: 'Principal Engineer' },
        { name: 'Bob Smith', avatar: '👨‍💼', title: 'CTO' },
        { name: 'Carol Lee', avatar: '👩‍🔬', title: 'Solutions Architect' }
      ]
    },
    relatedBadges: [
      { id: 'b1', name: 'Cloud Pioneer', image: '🏔️' },
      { id: 'b5', name: 'Legendary Architect', image: '👑' }
    ],
    assessmentScore: 92,
    lastAssessed: '2024-10-15',
    trending: true,
    demandScore: 95
  },
  {
    id: 's2',
    name: 'Kubernetes',
    category: 'DevOps',
    level: 4,
    maxLevel: 5,
    xp: 3800,
    xpToNextLevel: 1200,
    endorsements: {
      count: 38,
      topEndorsers: [
        { name: 'David Wang', avatar: '👨‍💻', title: 'DevOps Lead' },
        { name: 'Eva Martinez', avatar: '👩‍💼', title: 'Platform Engineer' }
      ]
    },
    relatedBadges: [{ id: 'b2', name: 'DevOps Master', image: '🔧' }],
    assessmentScore: 91,
    lastAssessed: '2024-09-20',
    trending: true,
    demandScore: 92
  },
  {
    id: 's3',
    name: 'Machine Learning',
    category: 'Data Science',
    level: 3,
    maxLevel: 5,
    xp: 2100,
    xpToNextLevel: 900,
    endorsements: {
      count: 19,
      topEndorsers: [{ name: 'Frank Zhou', avatar: '👨‍🔬', title: 'ML Engineer' }]
    },
    relatedBadges: [],
    assessmentScore: 85,
    lastAssessed: '2024-08-10',
    trending: true,
    demandScore: 98
  },
  {
    id: 's4',
    name: 'Project Management',
    category: 'Management',
    level: 5,
    maxLevel: 5,
    xp: 5000,
    xpToNextLevel: 0,
    endorsements: {
      count: 56,
      topEndorsers: [
        { name: 'Grace Kim', avatar: '👩‍💼', title: 'VP Engineering' },
        { name: 'Henry Park', avatar: '👨‍💼', title: 'Program Manager' }
      ]
    },
    relatedBadges: [],
    assessmentScore: 96,
    lastAssessed: '2024-11-01',
    trending: false,
    demandScore: 78
  },
  {
    id: 's5',
    name: 'Python',
    category: 'Programming',
    level: 4,
    maxLevel: 5,
    xp: 4100,
    xpToNextLevel: 900,
    endorsements: {
      count: 45,
      topEndorsers: [
        { name: 'Ivy Chen', avatar: '👩‍💻', title: 'Senior Developer' },
        { name: 'Jack Liu', avatar: '👨‍💻', title: 'Backend Lead' }
      ]
    },
    relatedBadges: [],
    assessmentScore: 89,
    lastAssessed: '2024-10-05',
    trending: false,
    demandScore: 88
  }
]

const mockPathways: LearningPathway[] = [
  {
    id: 'p1',
    name: 'AWS Solutions Architect Path',
    description: 'Complete journey from cloud basics to professional architect certification',
    category: 'Cloud Computing',
    provider: 'AWS Training',
    thumbnail: '☁️',
    duration: '6 months',
    difficulty: 'advanced',
    enrolledCount: 45000,
    completedCount: 12000,
    rating: 4.8,
    reviewCount: 3200,
    steps: [
      { id: 's1', title: 'Cloud Practitioner Essentials', type: 'course', duration: '6 hours', status: 'completed', progress: 100 },
      { id: 's2', title: 'Solutions Architect Associate', type: 'course', duration: '40 hours', status: 'completed', progress: 100 },
      { id: 's3', title: 'Associate Certification Exam', type: 'assessment', duration: '2 hours', status: 'completed', progress: 100 },
      { id: 's4', title: 'Advanced Architecting', type: 'course', duration: '30 hours', status: 'completed', progress: 100 },
      { id: 's5', title: 'Professional Certification Exam', type: 'assessment', duration: '3 hours', status: 'completed', progress: 100 },
      { id: 's6', title: 'AWS Solutions Architect Professional Badge', type: 'badge', duration: '-', status: 'completed', progress: 100 }
    ],
    targetCredential: { name: 'AWS SAP', image: '🏆' },
    progress: 100,
    estimatedCompletion: null
  },
  {
    id: 'p2',
    name: 'Full Stack Developer Path',
    description: 'Learn modern web development from frontend to backend and deployment',
    category: 'Development',
    provider: 'FreeFlow Academy',
    thumbnail: '💻',
    duration: '4 months',
    difficulty: 'intermediate',
    enrolledCount: 78000,
    completedCount: 23000,
    rating: 4.7,
    reviewCount: 5600,
    steps: [
      { id: 's1', title: 'HTML/CSS Fundamentals', type: 'course', duration: '10 hours', status: 'completed', progress: 100 },
      { id: 's2', title: 'JavaScript Essentials', type: 'course', duration: '20 hours', status: 'completed', progress: 100 },
      { id: 's3', title: 'React Development', type: 'course', duration: '30 hours', status: 'in_progress', progress: 65 },
      { id: 's4', title: 'Node.js Backend', type: 'course', duration: '25 hours', status: 'available', progress: 0 },
      { id: 's5', title: 'Capstone Project', type: 'project', duration: '20 hours', status: 'locked', progress: 0 },
      { id: 's6', title: 'Full Stack Developer Certificate', type: 'badge', duration: '-', status: 'locked', progress: 0 }
    ],
    targetCredential: { name: 'Full Stack Dev', image: '🎯' },
    progress: 52,
    estimatedCompletion: '2025-02-15'
  },
  {
    id: 'p3',
    name: 'Data Engineering Mastery',
    description: 'Master data pipelines, warehousing, and big data technologies',
    category: 'Data Engineering',
    provider: 'DataCamp',
    thumbnail: '📊',
    duration: '5 months',
    difficulty: 'advanced',
    enrolledCount: 23000,
    completedCount: 5600,
    rating: 4.6,
    reviewCount: 1800,
    steps: [
      { id: 's1', title: 'SQL for Data Engineering', type: 'course', duration: '15 hours', status: 'completed', progress: 100 },
      { id: 's2', title: 'Python for Data Engineering', type: 'course', duration: '20 hours', status: 'completed', progress: 100 },
      { id: 's3', title: 'Apache Spark Fundamentals', type: 'course', duration: '25 hours', status: 'in_progress', progress: 40 },
      { id: 's4', title: 'Data Warehousing with BigQuery', type: 'course', duration: '20 hours', status: 'locked', progress: 0 },
      { id: 's5', title: 'Data Pipeline Project', type: 'project', duration: '30 hours', status: 'locked', progress: 0 }
    ],
    targetCredential: { name: 'Data Engineer', image: '🔧' },
    progress: 45,
    estimatedCompletion: '2025-03-20'
  }
]

const mockVerifications: VerificationRecord[] = [
  {
    id: 'v1',
    credentialId: '1',
    credentialName: 'AWS Solutions Architect Professional',
    verifiedAt: '2024-12-20T14:30:00Z',
    verifier: { name: 'HR Manager', email: 'hr@techcorp.com', organization: 'TechCorp Inc' },
    method: 'blockchain',
    status: 'valid',
    ipAddress: '192.168.1.***',
    location: 'San Francisco, CA',
    deviceType: 'Desktop - Chrome'
  },
  {
    id: 'v2',
    credentialId: '3',
    credentialName: 'Certified Kubernetes Administrator',
    verifiedAt: '2024-12-18T09:15:00Z',
    verifier: { name: 'Recruiter', email: 'recruit@startup.io', organization: 'StartupIO' },
    method: 'qr_code',
    status: 'valid',
    ipAddress: '10.0.0.***',
    location: 'New York, NY',
    deviceType: 'Mobile - Safari'
  },
  {
    id: 'v3',
    credentialId: '4',
    credentialName: 'Project Management Professional',
    verifiedAt: '2024-12-15T11:45:00Z',
    verifier: { name: 'Project Director', email: 'director@enterprise.com', organization: 'Enterprise Corp' },
    method: 'api',
    status: 'valid',
    ipAddress: '172.16.0.***',
    location: 'Austin, TX',
    deviceType: 'Desktop - Firefox'
  }
]

// Enhanced Competitive Upgrade Mock Data
const mockCertsAIInsights = [
  { id: '1', type: 'success' as const, title: 'Credential Verification', description: 'All 156 credentials blockchain-verified and valid.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Verification' },
  { id: '2', type: 'info' as const, title: 'Skill Trending', description: 'AI/ML certifications up 45% in demand this quarter.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Trends' },
  { id: '3', type: 'warning' as const, title: 'Expiring Soon', description: '8 certifications expire within 30 days. Renew now.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Renewals' },
]

const mockCertsCollaborators = [
  { id: '1', name: 'Credential Admin', avatar: '/avatars/admin.jpg', status: 'online' as const, role: 'Admin' },
  { id: '2', name: 'HR Manager', avatar: '/avatars/hr.jpg', status: 'online' as const, role: 'HR' },
  { id: '3', name: 'Training Lead', avatar: '/avatars/training.jpg', status: 'away' as const, role: 'Training' },
]

const mockCertsPredictions = [
  { id: '1', title: 'Skill Gap Analysis', prediction: 'Cloud certifications needed for 60% of team', confidence: 87, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Certification ROI', prediction: 'Certified employees 35% more productive', confidence: 92, trend: 'stable' as const, impact: 'medium' as const },
]

const mockCertsActivities = [
  { id: '1', user: 'System', action: 'Verified', target: 'AWS Solutions Architect badge', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'HR', action: 'Approved', target: 'training budget for 5 employees', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'Employee', action: 'Earned', target: 'Google Cloud Professional certificate', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'update' as const },
]

const mockCertsQuickActions = [
  { id: '1', label: 'Add Credential', icon: 'plus', action: () => console.log('Add credential'), variant: 'default' as const },
  { id: '2', label: 'Verify Badge', icon: 'shield', action: () => console.log('Verify'), variant: 'default' as const },
  { id: '3', label: 'Export Report', icon: 'download', action: () => console.log('Export'), variant: 'outline' as const },
]

export default function CertificationsClient() {
  const [activeView, setActiveView] = useState<'credentials' | 'badges' | 'skills' | 'pathways' | 'verification'>('credentials')
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null)
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [skillCategory, setSkillCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [settingsTab, setSettingsTab] = useState('general')

  // Calculate stats
  const stats = useMemo(() => {
    const totalCredentials = mockCredentials.length
    const activeCredentials = mockCredentials.filter(c => c.status === 'active').length
    const totalBadges = mockBadges.length
    const totalSkills = mockSkills.length
    const totalXP = mockBadges.reduce((sum, b) => sum + b.xpValue, 0)
    const totalEndorsements = mockSkills.reduce((sum, s) => sum + s.endorsements.count, 0)
    const pathwaysCompleted = mockPathways.filter(p => p.progress === 100).length
    const pathwaysInProgress = mockPathways.filter(p => p.progress > 0 && p.progress < 100).length
    const verificationCount = mockVerifications.length
    const blockchainVerified = mockCredentials.filter(c => c.blockchainTxId).length

    return {
      totalCredentials,
      activeCredentials,
      totalBadges,
      totalSkills,
      totalXP,
      totalEndorsements,
      pathwaysCompleted,
      pathwaysInProgress,
      verificationCount,
      blockchainVerified
    }
  }, [])

  // Filtered credentials
  const filteredCredentials = useMemo(() => {
    return mockCredentials.filter(c => {
      const matchesType = typeFilter === 'all' || c.type === typeFilter
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter
      const matchesSearch = !searchQuery ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.issuer.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesType && matchesStatus && matchesSearch
    })
  }, [typeFilter, statusFilter, searchQuery])

  // Filtered skills
  const filteredSkills = useMemo(() => {
    return mockSkills.filter(s => {
      const matchesCategory = skillCategory === 'all' || s.category === skillCategory
      const matchesSearch = !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [skillCategory, searchQuery])

  // Helper functions
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
      case 'intermediate': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
      case 'advanced': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
      case 'expert': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
      case 'master': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800'
      case 'uncommon': return 'border-green-400 bg-green-50 dark:border-green-600 dark:bg-green-900/20'
      case 'rare': return 'border-blue-400 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20'
      case 'epic': return 'border-purple-400 bg-purple-50 dark:border-purple-600 dark:bg-purple-900/20'
      case 'legendary': return 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 dark:border-yellow-500 dark:from-yellow-900/20 dark:to-orange-900/20'
      default: return 'border-gray-300 bg-gray-50'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'valid': case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      case 'pending': case 'in_progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
      case 'expired': case 'revoked': case 'invalid': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  // Handlers
  const handleStartCertification = (certName: string) => {
    toast.info('Starting certification', {
      description: `Beginning "${certName}" exam...`
    })
  }

  const handleDownloadCertificate = (certName: string) => {
    toast.success('Downloading certificate', {
      description: `"${certName}" certificate will be downloaded`
    })
  }

  const handleShareCertification = (certName: string) => {
    toast.success('Sharing certification', {
      description: `"${certName}" share link copied`
    })
  }

  const handleRenewCertification = (certName: string) => {
    toast.info('Renewing certification', {
      description: `Starting renewal for "${certName}"...`
    })
  }

  const handleViewCredential = (certName: string) => {
    toast.info('Loading credential', {
      description: `Opening "${certName}" details...`
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Certifications & Credentials
              </h1>
              <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium rounded-full">
                Credly Level
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Digital badges, skills endorsements & verified credentials</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search credentials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white w-64"
            />
            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity">
              + Add Credential
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Credentials</div>
            <div className="text-2xl font-bold text-blue-600">{stats.totalCredentials}</div>
            <div className="text-xs text-green-600">{stats.activeCredentials} active</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Badges</div>
            <div className="text-2xl font-bold text-purple-600">{stats.totalBadges}</div>
            <div className="text-xs text-purple-600">{formatNumber(stats.totalXP)} XP</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Skills</div>
            <div className="text-2xl font-bold text-green-600">{stats.totalSkills}</div>
            <div className="text-xs text-green-600">{stats.totalEndorsements} endorsements</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Learning Paths</div>
            <div className="text-2xl font-bold text-orange-600">{stats.pathwaysCompleted}</div>
            <div className="text-xs text-orange-600">{stats.pathwaysInProgress} in progress</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Verifications</div>
            <div className="text-2xl font-bold text-cyan-600">{stats.verificationCount}</div>
            <div className="text-xs text-cyan-600">{stats.blockchainVerified} on-chain</div>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm border dark:border-gray-700">
            <TabsTrigger value="credentials" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/30">
              🏆 Credentials
            </TabsTrigger>
            <TabsTrigger value="badges" className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/30">
              🎖️ Badges
            </TabsTrigger>
            <TabsTrigger value="skills" className="data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900/30">
              ⚡ Skills
            </TabsTrigger>
            <TabsTrigger value="pathways" className="data-[state=active]:bg-orange-100 dark:data-[state=active]:bg-orange-900/30">
              🛤️ Pathways
            </TabsTrigger>
            <TabsTrigger value="verification" className="data-[state=active]:bg-cyan-100 dark:data-[state=active]:bg-cyan-900/30">
              🔐 Verification
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800">
              ⚙️ Settings
            </TabsTrigger>
          </TabsList>

          {/* Credentials Tab */}
          <TabsContent value="credentials" className="space-y-6">
            {/* Credentials Overview Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🏆</span>
                  <h3 className="text-xl font-bold">Digital Credentials</h3>
                </div>
                <p className="text-white/80 mb-4 max-w-2xl">
                  Manage and showcase your verified digital credentials. Share your achievements with blockchain-verified authenticity.
                </p>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.totalCredentials}</div>
                    <div className="text-xs text-white/70">Total Credentials</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-200">{stats.activeCredentials}</div>
                    <div className="text-xs text-white/70">Active</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.blockchainVerified}</div>
                    <div className="text-xs text-white/70">Blockchain Verified</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{mockCredentials.reduce((sum, c) => sum + c.shareCount, 0)}</div>
                    <div className="text-xs text-white/70">Total Shares</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="certification">Certifications</option>
                <option value="license">Licenses</option>
                <option value="degree">Degrees</option>
                <option value="course">Courses</option>
                <option value="achievement">Achievements</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="grid gap-4">
              {filteredCredentials.map(credential => (
                <Dialog key={credential.id}>
                  <DialogTrigger asChild>
                    <div
                      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => setSelectedCredential(credential)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{credential.badgeImage}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(credential.status)}`}>
                              {credential.status}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${getLevelColor(credential.level)}`}>
                              {credential.level}
                            </span>
                            <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                              {credential.type}
                            </span>
                            {credential.blockchainTxId && (
                              <span className="px-2 py-1 rounded text-xs bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                                ⛓️ On-chain
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold dark:text-white">{credential.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{credential.description}</p>
                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                            <span>{credential.issuer.logo} {credential.issuer.name}</span>
                            <span>📅 {credential.issueDate}</span>
                            {credential.expiryDate && <span>⏰ Expires {credential.expiryDate}</span>}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {credential.skills.slice(0, 4).map(skill => (
                              <span key={skill} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs dark:text-gray-300">
                                {skill}
                              </span>
                            ))}
                            {credential.skills.length > 4 && (
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs dark:text-gray-300">
                                +{credential.skills.length - 4}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>👁️ {formatNumber(credential.viewCount)}</span>
                            <span>🔗 {credential.shareCount}</span>
                            <span>👍 {credential.endorsements}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3">
                        <span className="text-3xl">{credential.badgeImage}</span>
                        {credential.name}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-gray-600 dark:text-gray-400">{credential.description}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <div className="text-sm text-gray-500 dark:text-gray-400">Credential ID</div>
                          <div className="font-mono text-sm dark:text-white">{credential.credentialId}</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <div className="text-sm text-gray-500 dark:text-gray-400">Issuer</div>
                          <div className="dark:text-white">{credential.issuer.name}</div>
                        </div>
                      </div>
                      {credential.blockchainTxId && (
                        <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-lg border border-cyan-200 dark:border-cyan-800">
                          <div className="text-sm font-medium text-cyan-700 dark:text-cyan-300 mb-2">⛓️ Blockchain Verification</div>
                          <div className="font-mono text-xs text-cyan-600 dark:text-cyan-400 break-all">{credential.verificationHash}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium mb-2 dark:text-white">Earning Criteria</div>
                        <ul className="space-y-1">
                          {credential.earningCriteria.map((criteria, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <span className="text-green-500">✓</span> {criteria}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex gap-3">
                        <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          Share Credential
                        </button>
                        <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white">
                          Download PDF
                        </button>
                        <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white">
                          Verify
                        </button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-6">
            {/* Badges Overview Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🎖️</span>
                  <h3 className="text-xl font-bold">Achievement Badges</h3>
                </div>
                <p className="text-white/80 mb-4 max-w-2xl">
                  Earn badges by completing learning pathways, achievements, and skill assessments. Show off your accomplishments!
                </p>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.totalBadges}</div>
                    <div className="text-xs text-white/70">Badges Earned</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.totalXP}</div>
                    <div className="text-xs text-white/70">Total XP</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{mockBadges.filter(b => b.rarity === 'legendary' || b.rarity === 'epic').length}</div>
                    <div className="text-xs text-white/70">Rare Badges</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{mockBadges.filter(b => b.isPinned).length}</div>
                    <div className="text-xs text-white/70">Pinned</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockBadges.map(badge => (
                <Dialog key={badge.id}>
                  <DialogTrigger asChild>
                    <div
                      className={`rounded-xl p-6 shadow-sm border-2 hover:shadow-md transition-all cursor-pointer ${getRarityColor(badge.rarity)}`}
                      onClick={() => setSelectedBadge(badge)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-5xl">{badge.image}</div>
                        <div className="text-right">
                          {badge.isPinned && <span className="text-yellow-500">📌</span>}
                          <div className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-1">{badge.rarity}</div>
                        </div>
                      </div>
                      <h3 className="font-semibold text-lg mb-1 dark:text-white">{badge.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{badge.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-purple-600 font-medium">+{badge.xpValue} XP</span>
                        <span className="text-gray-500 dark:text-gray-400">Level {badge.level}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                        <span>{badge.issuer.name}</span>
                        <span>{formatNumber(badge.holders)} holders</span>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3">
                        <span className="text-4xl">{badge.image}</span>
                        {badge.name}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-gray-600 dark:text-gray-400">{badge.description}</p>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-sm capitalize ${getRarityColor(badge.rarity)}`}>
                          {badge.rarity}
                        </span>
                        <span className="text-purple-600 font-medium">+{badge.xpValue} XP</span>
                        <span className="text-gray-500 dark:text-gray-400">Level {badge.level}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-2 dark:text-white">Requirements</div>
                        <ul className="space-y-2">
                          {badge.requirements.map((req, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <span className={req.completed ? 'text-green-500' : 'text-gray-300'}>
                                {req.completed ? '✓' : '○'}
                              </span>
                              <span className={req.completed ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'}>
                                {req.description}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {badge.skills.length > 0 && (
                        <div>
                          <div className="text-sm font-medium mb-2 dark:text-white">Related Skills</div>
                          <div className="flex flex-wrap gap-2">
                            {badge.skills.map(skill => (
                              <span key={skill} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm dark:text-gray-300">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-3">
                        <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                          Share Badge
                        </button>
                        <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white">
                          {badge.isPinned ? 'Unpin' : 'Pin to Profile'}
                        </button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-4">
            <div className="flex gap-4 mb-4">
              <select
                value={skillCategory}
                onChange={(e) => setSkillCategory(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="all">All Categories</option>
                <option value="Cloud Computing">Cloud Computing</option>
                <option value="DevOps">DevOps</option>
                <option value="Data Science">Data Science</option>
                <option value="Programming">Programming</option>
                <option value="Management">Management</option>
              </select>
            </div>

            <div className="grid gap-4">
              {filteredSkills.map(skill => (
                <Dialog key={skill.id}>
                  <DialogTrigger asChild>
                    <div
                      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => setSelectedSkill(skill)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold dark:text-white">{skill.name}</h3>
                            {skill.trending && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 rounded text-xs">
                                🔥 Trending
                              </span>
                            )}
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded text-xs">
                              {skill.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mb-3">
                            <div className="flex-1">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-600 dark:text-gray-400">Level {skill.level}/{skill.maxLevel}</span>
                                <span className="text-gray-500 dark:text-gray-400">{skill.xp}/{skill.xp + skill.xpToNextLevel} XP</span>
                              </div>
                              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                                  style={{ width: `${(skill.xp / (skill.xp + skill.xpToNextLevel)) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                            <span>👍 {skill.endorsements.count} endorsements</span>
                            {skill.assessmentScore && <span>📊 {skill.assessmentScore}% assessed</span>}
                            <span>📈 {skill.demandScore}% demand</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {skill.endorsements.topEndorsers.slice(0, 3).map((endorser, i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm -ml-2 first:ml-0 border-2 border-white dark:border-gray-800">
                              {endorser.avatar}
                            </div>
                          ))}
                          {skill.endorsements.count > 3 && (
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs -ml-2 border-2 border-white dark:border-gray-800 dark:text-white">
                              +{skill.endorsements.count - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{skill.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded dark:text-gray-300">{skill.category}</span>
                        {skill.trending && (
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 rounded">
                            🔥 Trending Skill
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-2 dark:text-white">Skill Progress</div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                            style={{ width: `${(skill.level / skill.maxLevel) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-sm mt-1 text-gray-500 dark:text-gray-400">
                          <span>Level {skill.level}</span>
                          <span>Max Level {skill.maxLevel}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-2 dark:text-white">Top Endorsers</div>
                        <div className="space-y-2">
                          {skill.endorsements.topEndorsers.map((endorser, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <span className="text-2xl">{endorser.avatar}</span>
                              <div>
                                <div className="font-medium dark:text-white">{endorser.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{endorser.title}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {skill.relatedBadges.length > 0 && (
                        <div>
                          <div className="text-sm font-medium mb-2 dark:text-white">Related Badges</div>
                          <div className="flex gap-3">
                            {skill.relatedBadges.map(badge => (
                              <div key={badge.id} className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <span className="text-xl">{badge.image}</span>
                                <span className="text-sm dark:text-gray-300">{badge.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-3">
                        <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                          Take Assessment
                        </button>
                        <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white">
                          Request Endorsement
                        </button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </TabsContent>

          {/* Pathways Tab */}
          <TabsContent value="pathways" className="space-y-4">
            <div className="grid gap-4">
              {mockPathways.map(pathway => (
                <div key={pathway.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{pathway.thumbnail}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs ${getLevelColor(pathway.difficulty)}`}>
                          {pathway.difficulty}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded text-xs">
                          {pathway.category}
                        </span>
                        {pathway.progress === 100 && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded text-xs">
                            ✓ Completed
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold dark:text-white">{pathway.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{pathway.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                        <span>⏱️ {pathway.duration}</span>
                        <span>⭐ {pathway.rating} ({formatNumber(pathway.reviewCount)} reviews)</span>
                        <span>👥 {formatNumber(pathway.enrolledCount)} enrolled</span>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="font-medium dark:text-white">Progress</span>
                          <span className="text-gray-500 dark:text-gray-400">{pathway.progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pathway.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{ width: `${pathway.progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        {pathway.steps.map((step, index) => (
                          <div key={step.id} className="flex items-center gap-3 text-sm">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                              step.status === 'completed' ? 'bg-green-500 text-white' :
                              step.status === 'in_progress' ? 'bg-blue-500 text-white' :
                              step.status === 'available' ? 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300' :
                              'bg-gray-100 dark:bg-gray-700 text-gray-400'
                            }`}>
                              {step.status === 'completed' ? '✓' : index + 1}
                            </div>
                            <span className={`flex-1 ${step.status === 'locked' ? 'text-gray-400 dark:text-gray-500' : 'dark:text-gray-300'}`}>
                              {step.title}
                            </span>
                            <span className="text-gray-400 dark:text-gray-500 text-xs">{step.duration}</span>
                            {step.status === 'in_progress' && (
                              <span className="text-blue-600 dark:text-blue-400 text-xs">{step.progress}%</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    {pathway.targetCredential && (
                      <div className="text-center">
                        <div className="text-3xl mb-1">{pathway.targetCredential.image}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Target</div>
                      </div>
                    )}
                  </div>
                  {pathway.progress < 100 && (
                    <div className="mt-4 pt-4 border-t dark:border-gray-700 flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Est. completion: {pathway.estimatedCompletion}
                      </span>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                        Continue Learning
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Verification Tab */}
          <TabsContent value="verification" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Verification QR Code */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
                <h3 className="font-semibold mb-4 dark:text-white">🔐 Verify Your Credentials</h3>
                <div className="text-center py-8">
                  <div className="inline-block p-4 bg-gray-100 dark:bg-gray-700 rounded-xl mb-4">
                    <div className="w-32 h-32 bg-white dark:bg-gray-600 rounded grid grid-cols-4 gap-1 p-2">
                      {[...Array(16)].map((_, i) => (
                        <div key={i} className={`${Math.random() > 0.5 ? 'bg-gray-900 dark:bg-white' : 'bg-transparent'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Scan this QR code to verify all your credentials
                  </p>
                  <div className="flex justify-center gap-3">
                    <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-sm">
                      Download QR
                    </button>
                    <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm dark:text-white">
                      Copy Link
                    </button>
                  </div>
                </div>
              </div>

              {/* Blockchain Status */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
                <h3 className="font-semibold mb-4 dark:text-white">⛓️ Blockchain Anchoring</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="text-sm dark:text-green-300">On-chain Credentials</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">{stats.blockchainVerified}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm dark:text-gray-300">Pending Anchoring</span>
                    <span className="font-semibold dark:text-white">{stats.totalCredentials - stats.blockchainVerified}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Credentials anchored to blockchain are tamper-proof and can be independently verified without contacting the issuer.
                  </p>
                  <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
                    Anchor All Credentials
                  </button>
                </div>
              </div>
            </div>

            {/* Verification History */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
              <h3 className="font-semibold mb-4 dark:text-white">📋 Verification History</h3>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {mockVerifications.map(record => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                        <div>
                          <div className="font-medium text-sm dark:text-white">{record.credentialName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Verified by {record.verifier.organization} via {record.method}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 dark:text-gray-400">{record.location}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(record.verifiedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Settings Tab - Comprehensive 6 Sub-tabs */}
          <TabsContent value="settings" className="space-y-6">
            {/* Settings Overview Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 rounded-xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">⚙️</span>
                  <h3 className="text-xl font-bold">Certification Settings</h3>
                </div>
                <p className="text-white/70 mb-4 max-w-2xl">
                  Configure your credential platform settings, verification preferences, notifications, privacy options, and account security.
                </p>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.totalCredentials}</div>
                    <div className="text-xs text-white/70">Credentials</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.totalBadges}</div>
                    <div className="text-xs text-white/70">Badges</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.totalXP}</div>
                    <div className="text-xs text-white/70">Total XP</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.totalEndorsements}</div>
                    <div className="text-xs text-white/70">Endorsements</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Grid with Sidebar Navigation */}
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <nav className="space-y-1">
                    {[
                      { id: 'general', label: 'General', icon: '⚙️', description: 'Account settings' },
                      { id: 'privacy', label: 'Privacy', icon: '🔒', description: 'Visibility options' },
                      { id: 'verification', label: 'Verification', icon: '✓', description: 'Verify settings' },
                      { id: 'notifications', label: 'Notifications', icon: '🔔', description: 'Alert preferences' },
                      { id: 'integrations', label: 'Integrations', icon: '🔗', description: 'Connected apps' },
                      { id: 'advanced', label: 'Advanced', icon: '🚀', description: 'Power features' },
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
                        <span className="text-xl">{item.icon}</span>
                        <div>
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.description}</p>
                        </div>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
                        <span>👤</span> Profile Settings
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Display Name</label>
                          <input type="text" defaultValue="John Doe" className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Professional Title</label>
                          <input type="text" defaultValue="Senior Developer" className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                          <input type="email" defaultValue="john@example.com" className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">LinkedIn URL</label>
                          <input type="url" defaultValue="linkedin.com/in/johndoe" className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                        <textarea rows={3} defaultValue="Experienced developer with expertise in cloud technologies..." className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
                        <span>🌐</span> Public Profile
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium dark:text-white">Public Profile</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Allow others to view your credentials</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 dark:bg-gray-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium dark:text-white">Featured Credentials</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Show top credentials on your profile</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 dark:bg-gray-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium dark:text-white">Skills Endorsements</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Allow others to endorse your skills</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 dark:bg-gray-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Privacy Settings */}
                {settingsTab === 'privacy' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
                        <span>🔒</span> Privacy Controls
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium dark:text-white">Hide Email Address</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Don't display email on public profile</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 dark:bg-gray-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium dark:text-white">Hide Verification History</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Keep verification records private</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 dark:bg-gray-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium dark:text-white">Anonymous Mode</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Hide your name on leaderboards</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 dark:bg-gray-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium dark:text-white">Indexable Profile</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Allow search engines to index your profile</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 dark:bg-gray-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
                        <span>📊</span> Data Sharing
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium dark:text-white">Share with Employers</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Allow verified employers to view credentials</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 dark:bg-gray-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium dark:text-white">Analytics Sharing</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Share anonymous usage data</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 dark:bg-gray-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Verification Settings */}
                {settingsTab === 'verification' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
                        <span>✅</span> Verification Preferences
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium dark:text-white">Blockchain Verification</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Store credentials on blockchain</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 dark:bg-gray-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium dark:text-white">Auto-Renew Credentials</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Automatically renew expiring credentials</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 dark:bg-gray-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium dark:text-white">Verification QR Code</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Generate QR codes for quick verification</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 dark:bg-gray-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
                        <span>🔔</span> Email Notifications
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium dark:text-white">Credential Expiry</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Notify before credentials expire</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 dark:bg-gray-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium dark:text-white">New Badges</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Notify when you earn new badges</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 dark:bg-gray-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium dark:text-white">Endorsements</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Notify when skills are endorsed</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 dark:bg-gray-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium dark:text-white">Verification Requests</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Notify when credentials are verified</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 dark:bg-gray-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
                        <span>🔗</span> Connected Platforms
                      </h3>
                      <div className="space-y-4">
                        {[
                          { name: 'LinkedIn', status: 'connected', icon: '💼' },
                          { name: 'Coursera', status: 'connected', icon: '📚' },
                          { name: 'Credly', status: 'connected', icon: '🎖️' },
                          { name: 'Udemy', status: 'disconnected', icon: '🎓' },
                          { name: 'AWS Training', status: 'connected', icon: '☁️' },
                          { name: 'Google Cloud', status: 'disconnected', icon: '🌐' },
                        ].map((platform) => (
                          <div key={platform.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{platform.icon}</span>
                              <div>
                                <p className="font-medium dark:text-white">{platform.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {platform.status === 'connected' ? 'Connected' : 'Not connected'}
                                </p>
                              </div>
                            </div>
                            <button className={`px-4 py-2 rounded-lg text-sm font-medium ${
                              platform.status === 'connected'
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}>
                              {platform.status === 'connected' ? 'Disconnect' : 'Connect'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
                        <span>🚀</span> Advanced Options
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium dark:text-white">Developer Mode</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Access API keys and webhooks</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 dark:bg-gray-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium dark:text-white">Beta Features</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Early access to new features</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 dark:bg-gray-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
                        <span>📥</span> Data Export
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <button className="p-4 border-2 border-dashed rounded-lg hover:border-blue-500 text-center dark:border-gray-600">
                          <span className="text-2xl">📄</span>
                          <p className="font-medium mt-2 dark:text-white">Export as PDF</p>
                          <p className="text-xs text-gray-500">All credentials</p>
                        </button>
                        <button className="p-4 border-2 border-dashed rounded-lg hover:border-blue-500 text-center dark:border-gray-600">
                          <span className="text-2xl">📊</span>
                          <p className="font-medium mt-2 dark:text-white">Export as JSON</p>
                          <p className="text-xs text-gray-500">Machine readable</p>
                        </button>
                      </div>
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-6">
                      <h3 className="text-lg font-semibold mb-4 text-red-700 dark:text-red-400 flex items-center gap-2">
                        <span>⚠️</span> Danger Zone
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Delete All Data</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Remove all credentials and data</p>
                          </div>
                          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockCertsAIInsights}
              title="Certification Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockCertsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockCertsPredictions}
              title="Certification Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockCertsActivities}
            title="Certification Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockCertsQuickActions}
            variant="grid"
          />
        </div>
      </div>
    </div>
  )
}
