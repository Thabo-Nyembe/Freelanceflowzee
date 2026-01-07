'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import {
  ClipboardList,
  Search,
  Plus,
  BarChart3,
  FileText,
  Settings,
  Eye,
  Edit,
  Trash2,
  Copy,
  Share2,
  ExternalLink,
  Clock,
  CheckCircle,
  Users,
  TrendingUp,
  MessageSquare,
  Star,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  Globe,
  Mail,
  Link,
  QrCode,
  Play,
  Pause,
  Archive,
  Download,
  Upload,
  Layout,
  Type,
  Hash,
  ToggleLeft,
  List,
  Calendar,
  FileUp,
  Sliders,
  Zap,
  GitBranch,
  Layers,
  PieChart,
  Target,
  Sparkles,
  Loader2,
  Shield,
  Bell,
  Webhook,
  Terminal,
  RefreshCw,
  XCircle
} from 'lucide-react'

// Supabase hooks for real database operations
import { useSurveys, useSurveyMutations } from '@/lib/hooks/use-surveys'

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




// Types
type SurveyStatus = 'draft' | 'active' | 'paused' | 'closed'
type QuestionType = 'short_text' | 'long_text' | 'multiple_choice' | 'checkbox' | 'rating' | 'nps' | 'date' | 'file_upload' | 'dropdown' | 'linear_scale' | 'matrix'
type DistributionChannel = 'link' | 'email' | 'embed' | 'qr'

interface Question {
  id: string
  type: QuestionType
  title: string
  description?: string
  required: boolean
  options?: string[]
  minValue?: number
  maxValue?: number
  hasLogicJump: boolean
  logicRules?: {
    condition: string
    value: string
    jumpTo: string
  }[]
  order: number
}

interface Survey {
  id: string
  title: string
  description: string
  status: SurveyStatus
  theme: {
    primaryColor: string
    backgroundColor: string
    fontFamily: string
  }
  questions: Question[]
  responses: number
  completionRate: number
  avgTime: number
  createdAt: string
  updatedAt: string
  publishedAt?: string
  closedAt?: string
  tags: string[]
  isTemplate: boolean
  createdBy: string
  settings: {
    showProgressBar: boolean
    showQuestionNumbers: boolean
    allowMultipleResponses: boolean
    requireLogin: boolean
    customThankYou: string
    redirectUrl?: string
  }
}

interface Response {
  id: string
  surveyId: string
  respondentId?: string
  respondentEmail?: string
  startedAt: string
  completedAt?: string
  duration: number
  answers: {
    questionId: string
    questionTitle: string
    answer: string | string[] | number
  }[]
  metadata: {
    device: string
    browser: string
    location: string
    referrer?: string
  }
  isComplete: boolean
  npsScore?: number
}

interface Template {
  id: string
  name: string
  description: string
  category: string
  questions: number
  uses: number
  rating: number
  thumbnail: string
  isPremium: boolean
}

interface SurveyStats {
  totalSurveys: number
  activeSurveys: number
  totalResponses: number
  avgCompletionRate: number
  avgNPS: number
  responsesThisWeek: number
  responsesLastWeek: number
}

// Mock Data
const mockSurveys: Survey[] = [
  {
    id: 'survey-1',
    title: 'Customer Satisfaction Survey 2024',
    description: 'Annual customer satisfaction and feedback collection',
    status: 'active',
    theme: { primaryColor: '#10b981', backgroundColor: '#ffffff', fontFamily: 'Inter' },
    questions: [
      { id: 'q1', type: 'nps', title: 'How likely are you to recommend us?', required: true, minValue: 0, maxValue: 10, hasLogicJump: true, logicRules: [{ condition: 'less_than', value: '7', jumpTo: 'q3' }], order: 1 },
      { id: 'q2', type: 'long_text', title: 'What do you love most about our product?', required: false, hasLogicJump: false, order: 2 },
      { id: 'q3', type: 'long_text', title: 'What can we improve?', required: true, hasLogicJump: false, order: 3 },
      { id: 'q4', type: 'rating', title: 'Rate your overall experience', required: true, minValue: 1, maxValue: 5, hasLogicJump: false, order: 4 },
      { id: 'q5', type: 'multiple_choice', title: 'How did you hear about us?', required: false, options: ['Social Media', 'Search Engine', 'Friend Referral', 'Advertisement', 'Other'], hasLogicJump: false, order: 5 }
    ],
    responses: 1247,
    completionRate: 89.4,
    avgTime: 4.2,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
    publishedAt: '2024-01-02',
    tags: ['customer', 'feedback', '2024'],
    isTemplate: false,
    createdBy: 'John Smith',
    settings: { showProgressBar: true, showQuestionNumbers: true, allowMultipleResponses: false, requireLogin: false, customThankYou: 'Thank you for your feedback!' }
  },
  {
    id: 'survey-2',
    title: 'Employee Engagement Survey',
    description: 'Quarterly employee satisfaction and engagement assessment',
    status: 'active',
    theme: { primaryColor: '#6366f1', backgroundColor: '#f8fafc', fontFamily: 'Plus Jakarta Sans' },
    questions: [
      { id: 'q1', type: 'rating', title: 'How satisfied are you with your work?', required: true, minValue: 1, maxValue: 5, hasLogicJump: false, order: 1 },
      { id: 'q2', type: 'multiple_choice', title: 'What motivates you at work?', required: true, options: ['Career Growth', 'Compensation', 'Team Culture', 'Work-Life Balance', 'Learning Opportunities'], hasLogicJump: false, order: 2 },
      { id: 'q3', type: 'long_text', title: 'Any suggestions for improvement?', required: false, hasLogicJump: false, order: 3 }
    ],
    responses: 892,
    completionRate: 94.7,
    avgTime: 3.8,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-14',
    publishedAt: '2024-01-06',
    tags: ['hr', 'employee', 'engagement'],
    isTemplate: false,
    createdBy: 'HR Team',
    settings: { showProgressBar: true, showQuestionNumbers: false, allowMultipleResponses: false, requireLogin: true, customThankYou: 'Your input helps us build a better workplace!' }
  },
  {
    id: 'survey-3',
    title: 'Product Feature Request',
    description: 'Gather ideas for new product features',
    status: 'draft',
    theme: { primaryColor: '#f59e0b', backgroundColor: '#fffbeb', fontFamily: 'Inter' },
    questions: [
      { id: 'q1', type: 'short_text', title: 'What feature would you like to see?', required: true, hasLogicJump: false, order: 1 },
      { id: 'q2', type: 'linear_scale', title: 'How important is this feature?', required: true, minValue: 1, maxValue: 10, hasLogicJump: false, order: 2 }
    ],
    responses: 0,
    completionRate: 0,
    avgTime: 0,
    createdAt: '2024-01-14',
    updatedAt: '2024-01-15',
    tags: ['product', 'features'],
    isTemplate: false,
    createdBy: 'Product Team',
    settings: { showProgressBar: true, showQuestionNumbers: true, allowMultipleResponses: true, requireLogin: false, customThankYou: 'Thanks for sharing your ideas!' }
  },
  {
    id: 'survey-4',
    title: 'Event Feedback Form',
    description: 'Post-event satisfaction survey',
    status: 'closed',
    theme: { primaryColor: '#ec4899', backgroundColor: '#fdf2f8', fontFamily: 'Outfit' },
    questions: [
      { id: 'q1', type: 'nps', title: 'How likely are you to attend future events?', required: true, minValue: 0, maxValue: 10, hasLogicJump: false, order: 1 },
      { id: 'q2', type: 'checkbox', title: 'What did you enjoy most?', required: false, options: ['Speakers', 'Networking', 'Content', 'Venue', 'Food'], hasLogicJump: false, order: 2 },
      { id: 'q3', type: 'rating', title: 'Rate the event organization', required: true, minValue: 1, maxValue: 5, hasLogicJump: false, order: 3 }
    ],
    responses: 456,
    completionRate: 78.3,
    avgTime: 2.9,
    createdAt: '2023-12-15',
    updatedAt: '2024-01-10',
    publishedAt: '2023-12-16',
    closedAt: '2024-01-01',
    tags: ['event', 'feedback'],
    isTemplate: false,
    createdBy: 'Events Team',
    settings: { showProgressBar: true, showQuestionNumbers: true, allowMultipleResponses: false, requireLogin: false, customThankYou: 'See you at the next event!' }
  },
  {
    id: 'survey-5',
    title: 'Website Usability Study',
    description: 'User experience research for website redesign',
    status: 'paused',
    theme: { primaryColor: '#0ea5e9', backgroundColor: '#f0f9ff', fontFamily: 'Inter' },
    questions: [
      { id: 'q1', type: 'rating', title: 'How easy is it to navigate our website?', required: true, minValue: 1, maxValue: 5, hasLogicJump: false, order: 1 },
      { id: 'q2', type: 'multiple_choice', title: 'What device do you primarily use?', required: true, options: ['Desktop', 'Laptop', 'Tablet', 'Mobile'], hasLogicJump: false, order: 2 },
      { id: 'q3', type: 'long_text', title: 'What would improve your experience?', required: false, hasLogicJump: false, order: 3 }
    ],
    responses: 234,
    completionRate: 65.2,
    avgTime: 5.1,
    createdAt: '2024-01-08',
    updatedAt: '2024-01-12',
    publishedAt: '2024-01-09',
    tags: ['ux', 'research', 'website'],
    isTemplate: false,
    createdBy: 'UX Team',
    settings: { showProgressBar: true, showQuestionNumbers: true, allowMultipleResponses: false, requireLogin: false, customThankYou: 'Your feedback shapes our design!' }
  }
]

const mockResponses: Response[] = [
  {
    id: 'resp-1',
    surveyId: 'survey-1',
    respondentEmail: 'user1@example.com',
    startedAt: '2024-01-15T10:30:00',
    completedAt: '2024-01-15T10:34:15',
    duration: 255,
    answers: [
      { questionId: 'q1', questionTitle: 'How likely are you to recommend us?', answer: 9 },
      { questionId: 'q2', questionTitle: 'What do you love most about our product?', answer: 'The intuitive interface and excellent customer support' },
      { questionId: 'q4', questionTitle: 'Rate your overall experience', answer: 5 },
      { questionId: 'q5', questionTitle: 'How did you hear about us?', answer: 'Social Media' }
    ],
    metadata: { device: 'Desktop', browser: 'Chrome', location: 'New York, US' },
    isComplete: true,
    npsScore: 9
  },
  {
    id: 'resp-2',
    surveyId: 'survey-1',
    respondentEmail: 'user2@example.com',
    startedAt: '2024-01-15T11:00:00',
    completedAt: '2024-01-15T11:05:30',
    duration: 330,
    answers: [
      { questionId: 'q1', questionTitle: 'How likely are you to recommend us?', answer: 6 },
      { questionId: 'q3', questionTitle: 'What can we improve?', answer: 'Faster response times from support team' },
      { questionId: 'q4', questionTitle: 'Rate your overall experience', answer: 3 },
      { questionId: 'q5', questionTitle: 'How did you hear about us?', answer: 'Friend Referral' }
    ],
    metadata: { device: 'Mobile', browser: 'Safari', location: 'London, UK' },
    isComplete: true,
    npsScore: 6
  },
  {
    id: 'resp-3',
    surveyId: 'survey-1',
    startedAt: '2024-01-15T12:15:00',
    duration: 45,
    answers: [
      { questionId: 'q1', questionTitle: 'How likely are you to recommend us?', answer: 8 }
    ],
    metadata: { device: 'Tablet', browser: 'Firefox', location: 'Toronto, CA' },
    isComplete: false
  }
]

const mockTemplates: Template[] = [
  { id: 'tpl-1', name: 'Customer Satisfaction (CSAT)', description: 'Measure customer satisfaction with your product or service', category: 'Customer Feedback', questions: 8, uses: 15420, rating: 4.8, thumbnail: '📊', isPremium: false },
  { id: 'tpl-2', name: 'Net Promoter Score (NPS)', description: 'Gauge customer loyalty and likelihood to recommend', category: 'Customer Feedback', questions: 5, uses: 23150, rating: 4.9, thumbnail: '📈', isPremium: false },
  { id: 'tpl-3', name: 'Employee Engagement', description: 'Assess workplace satisfaction and engagement levels', category: 'HR & Internal', questions: 15, uses: 8930, rating: 4.7, thumbnail: '👥', isPremium: false },
  { id: 'tpl-4', name: 'Event Feedback', description: 'Collect feedback after events and conferences', category: 'Events', questions: 10, uses: 12340, rating: 4.6, thumbnail: '🎉', isPremium: false },
  { id: 'tpl-5', name: 'Product Research', description: 'Validate product ideas and gather feature requests', category: 'Product', questions: 12, uses: 6780, rating: 4.5, thumbnail: '💡', isPremium: true },
  { id: 'tpl-6', name: 'Market Research', description: 'Understand market trends and customer preferences', category: 'Research', questions: 20, uses: 5420, rating: 4.4, thumbnail: '🔍', isPremium: true },
  { id: 'tpl-7', name: 'Website Usability', description: 'Evaluate website user experience and navigation', category: 'UX Research', questions: 12, uses: 7890, rating: 4.6, thumbnail: '🌐', isPremium: false },
  { id: 'tpl-8', name: 'Course Evaluation', description: 'Get feedback on training and educational content', category: 'Education', questions: 8, uses: 9120, rating: 4.7, thumbnail: '📚', isPremium: false }
]

const mockStats: SurveyStats = {
  totalSurveys: 5,
  activeSurveys: 2,
  totalResponses: 2829,
  avgCompletionRate: 81.9,
  avgNPS: 7.8,
  responsesThisWeek: 342,
  responsesLastWeek: 289
}

// Helper functions
const getStatusColor = (status: SurveyStatus) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    case 'paused': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'closed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  }
}

const getQuestionTypeIcon = (type: QuestionType) => {
  switch (type) {
    case 'short_text': return <Type className="w-4 h-4" />
    case 'long_text': return <FileText className="w-4 h-4" />
    case 'multiple_choice': return <List className="w-4 h-4" />
    case 'checkbox': return <ToggleLeft className="w-4 h-4" />
    case 'rating': return <Star className="w-4 h-4" />
    case 'nps': return <Target className="w-4 h-4" />
    case 'date': return <Calendar className="w-4 h-4" />
    case 'file_upload': return <FileUp className="w-4 h-4" />
    case 'dropdown': return <Sliders className="w-4 h-4" />
    case 'linear_scale': return <Hash className="w-4 h-4" />
    case 'matrix': return <Layout className="w-4 h-4" />
  }
}

const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getNPSCategory = (score: number) => {
  if (score >= 9) return { label: 'Promoter', color: 'text-green-600' }
  if (score >= 7) return { label: 'Passive', color: 'text-yellow-600' }
  return { label: 'Detractor', color: 'text-red-600' }
}

// Mock data for AI-powered competitive upgrade components
const mockSurveysAIInsights = [
  { id: '1', type: 'success' as const, title: 'High Engagement Survey', description: 'Customer Satisfaction survey has 89% completion rate - above industry average!', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Engagement' },
  { id: '2', type: 'warning' as const, title: 'Drop-off Detected', description: 'Product feedback survey loses 45% respondents at question 7. Consider splitting.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Optimization' },
  { id: '3', type: 'info' as const, title: 'NPS Trending Up', description: 'Overall NPS score improved from 42 to 67 over last quarter.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Trends' },
]

const mockSurveysCollaborators = [
  { id: '1', name: 'Research Lead', avatar: '/avatars/sarah-chen.jpg', status: 'online' as const, role: 'Research' },
  { id: '2', name: 'UX Designer', avatar: '/avatars/alice.jpg', status: 'online' as const, role: 'UX' },
  { id: '3', name: 'Product Manager', avatar: '/avatars/marcus.jpg', status: 'away' as const, role: 'Product' },
]

const mockSurveysPredictions = [
  { id: '1', title: 'Response Forecast', prediction: 'Employee engagement survey will reach target 500 responses by Friday', confidence: 91, trend: 'up' as const, impact: 'medium' as const },
  { id: '2', title: 'Sentiment Analysis', prediction: 'Q4 satisfaction scores likely to improve 15% based on recent feedback', confidence: 84, trend: 'up' as const, impact: 'high' as const },
]

const mockSurveysActivities = [
  { id: '1', user: 'Research Lead', action: 'Launched', target: 'Q4 customer satisfaction survey', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'UX Designer', action: 'Designed', target: 'new product feedback template', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'Product Manager', action: 'Analyzed', target: 'feature request survey results', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

const mockSurveysQuickActions = [
  { id: '1', label: 'Create Survey', icon: 'plus', action: () => toast.promise(new Promise(r => setTimeout(r, 1000)), { loading: 'Creating survey...', success: 'Survey created successfully', error: 'Failed to create survey' }), variant: 'default' as const },
  { id: '2', label: 'View Results', icon: 'bar-chart', action: () => toast.promise(new Promise(r => setTimeout(r, 600)), { loading: 'Loading survey results...', success: 'Results dashboard opened', error: 'Failed to load results' }), variant: 'default' as const },
  { id: '3', label: 'Export Data', icon: 'download', action: () => toast.promise(new Promise(r => setTimeout(r, 900)), { loading: 'Exporting survey data...', success: 'Data exported successfully', error: 'Failed to export data' }), variant: 'outline' as const },
]

export default function SurveysClient() {
  const [activeTab, setActiveTab] = useState('surveys')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<SurveyStatus | 'all'>('all')
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null)
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [sharingSurvey, setSharingSurvey] = useState<Survey | null>(null)
  const [settingsTab, setSettingsTab] = useState('general')

  // Create Survey Dialog State
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newSurveyTitle, setNewSurveyTitle] = useState('')
  const [newSurveyDescription, setNewSurveyDescription] = useState('')
  const [newSurveyType, setNewSurveyType] = useState('customer-feedback')

  // Confirm Delete Dialog State
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [surveyToDelete, setSurveyToDelete] = useState<string | null>(null)

  // Real Supabase data and mutations
  const { surveys: dbSurveys, stats: dbStats, isLoading, error: dbError, refetch } = useSurveys()
  const {
    createSurvey,
    updateSurvey,
    publishSurvey,
    closeSurvey,
    pauseSurvey,
    deleteSurvey,
    isCreating,
    isUpdating,
    isDeleting
  } = useSurveyMutations()

  // Handler: Create Survey
  const handleCreateSurvey = async () => {
    if (!newSurveyTitle.trim()) {
      toast.error('Please enter a survey title')
      return
    }

    try {
      const result = await createSurvey({
        title: newSurveyTitle.trim(),
        description: newSurveyDescription.trim() || undefined,
        survey_type: newSurveyType,
        status: 'draft'
      })

      if (result.success) {
        toast.success('Survey created successfully!')
        setShowCreateDialog(false)
        setNewSurveyTitle('')
        setNewSurveyDescription('')
        setNewSurveyType('customer-feedback')
        refetch()
      } else {
        toast.error(result.error || 'Failed to create survey')
      }
    } catch (err) {
      toast.error('An error occurred while creating the survey')
    }
  }

  // Handler: Publish Survey
  const handlePublishSurvey = async (surveyId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    try {
      const result = await publishSurvey(surveyId)
      if (result.success) {
        toast.success('Survey published successfully!')
        refetch()
      } else {
        toast.error(result.error || 'Failed to publish survey')
      }
    } catch (err) {
      toast.error('An error occurred while publishing the survey')
    }
  }

  // Handler: Close Survey
  const handleCloseSurvey = async (surveyId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    try {
      const result = await closeSurvey(surveyId)
      if (result.success) {
        toast.success('Survey closed successfully!')
        refetch()
      } else {
        toast.error(result.error || 'Failed to close survey')
      }
    } catch (err) {
      toast.error('An error occurred while closing the survey')
    }
  }

  // Handler: Pause Survey
  const handlePauseSurvey = async (surveyId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    try {
      const result = await pauseSurvey(surveyId)
      if (result.success) {
        toast.success('Survey paused successfully!')
        refetch()
      } else {
        toast.error(result.error || 'Failed to pause survey')
      }
    } catch (err) {
      toast.error('An error occurred while pausing the survey')
    }
  }

  // Handler: Delete Survey (with confirmation)
  const handleDeleteSurvey = async () => {
    if (!surveyToDelete) return

    try {
      const result = await deleteSurvey(surveyToDelete)
      if (result.success) {
        toast.success('Survey deleted successfully!')
        setShowDeleteDialog(false)
        setSurveyToDelete(null)
        refetch()
      } else {
        toast.error(result.error || 'Failed to delete survey')
      }
    } catch (err) {
      toast.error('An error occurred while deleting the survey')
    }
  }

  // Open delete confirmation
  const confirmDeleteSurvey = (surveyId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setSurveyToDelete(surveyId)
    setShowDeleteDialog(true)
  }

  // Combine database surveys with mock surveys for display
  // Database surveys take priority, mock surveys are for demo purposes when no real data
  const combinedSurveys = useMemo(() => {
    // Map database surveys to the local Survey interface
    const dbSurveysMapped: Survey[] = dbSurveys.map(dbSurvey => ({
      id: dbSurvey.id,
      title: dbSurvey.title,
      description: dbSurvey.description || '',
      status: (dbSurvey.status as SurveyStatus) || 'draft',
      theme: { primaryColor: '#10b981', backgroundColor: '#ffffff', fontFamily: 'Inter' },
      questions: [], // Questions would need separate query
      responses: dbSurvey.total_responses || 0,
      completionRate: dbSurvey.completion_rate || 0,
      avgTime: dbSurvey.average_time || 0,
      createdAt: dbSurvey.created_at,
      updatedAt: dbSurvey.updated_at,
      publishedAt: dbSurvey.published_date || undefined,
      closedAt: dbSurvey.closed_date || undefined,
      tags: dbSurvey.tags || [],
      isTemplate: false,
      createdBy: dbSurvey.created_by || 'Unknown',
      settings: {
        showProgressBar: true,
        showQuestionNumbers: true,
        allowMultipleResponses: false,
        requireLogin: false,
        customThankYou: 'Thank you for your feedback!'
      }
    }))

    // Return database surveys if available, otherwise show mock surveys as demo
    return dbSurveysMapped.length > 0 ? dbSurveysMapped : mockSurveys
  }, [dbSurveys])

  // Computed values
  const filteredSurveys = useMemo(() => {
    return combinedSurveys.filter(survey => {
      const matchesSearch = survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        survey.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || survey.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchTerm, statusFilter, combinedSurveys])

  const surveyResponses = useMemo(() => {
    if (!selectedSurvey) return []
    return mockResponses.filter(r => r.surveyId === selectedSurvey.id)
  }, [selectedSurvey])

  // Computed stats - prefer database stats over mock stats
  const displayStats = useMemo(() => {
    if (dbStats && dbSurveys.length > 0) {
      return {
        totalSurveys: dbStats.total,
        activeSurveys: dbStats.active,
        totalResponses: dbStats.totalResponses,
        avgCompletionRate: Math.round(dbStats.avgCompletionRate * 10) / 10,
        avgNPS: Math.round(dbStats.avgNPS * 10) / 10 || 0,
        responsesThisWeek: mockStats.responsesThisWeek, // Would need additional query for real data
        responsesLastWeek: mockStats.responsesLastWeek
      }
    }
    return mockStats
  }, [dbStats, dbSurveys])

  const npsDistribution = useMemo(() => {
    const promoters = mockResponses.filter(r => r.npsScore && r.npsScore >= 9).length
    const passives = mockResponses.filter(r => r.npsScore && r.npsScore >= 7 && r.npsScore < 9).length
    const detractors = mockResponses.filter(r => r.npsScore && r.npsScore < 7).length
    const total = promoters + passives + detractors
    return {
      promoters: total > 0 ? (promoters / total) * 100 : 0,
      passives: total > 0 ? (passives / total) * 100 : 0,
      detractors: total > 0 ? (detractors / total) * 100 : 0,
      nps: total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0
    }
  }, [])

  // Handlers
  const handleShare = (survey: Survey) => {
    setSharingSurvey(survey)
    setShowShareDialog(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50/30 to-teal-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
              <ClipboardList className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Surveys</h1>
              <p className="text-gray-600 dark:text-gray-400">Typeform-level survey experience</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
              onClick={() => setShowCreateDialog(true)}
              disabled={isCreating}
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Create Survey
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <ClipboardList className="w-4 h-4" />
                <span className="text-xs font-medium">Total Surveys</span>
              </div>
              <p className="text-2xl font-bold">{displayStats.totalSurveys}</p>
              <p className="text-xs text-muted-foreground">{displayStats.activeSurveys} active</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs font-medium">Responses</span>
              </div>
              <p className="text-2xl font-bold">{displayStats.totalResponses.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">all time</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs font-medium">Completion</span>
              </div>
              <p className="text-2xl font-bold">{displayStats.avgCompletionRate}%</p>
              <p className="text-xs text-muted-foreground">avg rate</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-purple-600 mb-1">
                <Target className="w-4 h-4" />
                <span className="text-xs font-medium">Avg NPS</span>
              </div>
              <p className="text-2xl font-bold">{displayStats.avgNPS}</p>
              <p className="text-xs text-muted-foreground">score</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-amber-600 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">This Week</span>
              </div>
              <p className="text-2xl font-bold">{displayStats.responsesThisWeek}</p>
              <p className="text-xs text-green-600">+{Math.round(((displayStats.responsesThisWeek - displayStats.responsesLastWeek) / displayStats.responsesLastWeek) * 100)}%</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <ThumbsUp className="w-4 h-4" />
                <span className="text-xs font-medium">Promoters</span>
              </div>
              <p className="text-2xl font-bold">{Math.round(npsDistribution.promoters)}%</p>
              <p className="text-xs text-muted-foreground">NPS 9-10</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-yellow-600 mb-1">
                <MessageSquare className="w-4 h-4" />
                <span className="text-xs font-medium">Passives</span>
              </div>
              <p className="text-2xl font-bold">{Math.round(npsDistribution.passives)}%</p>
              <p className="text-xs text-muted-foreground">NPS 7-8</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-600 mb-1">
                <ThumbsDown className="w-4 h-4" />
                <span className="text-xs font-medium">Detractors</span>
              </div>
              <p className="text-2xl font-bold">{Math.round(npsDistribution.detractors)}%</p>
              <p className="text-xs text-muted-foreground">NPS 0-6</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-white/80 dark:bg-gray-800/80">
              <TabsTrigger value="surveys" className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                Surveys
              </TabsTrigger>
              <TabsTrigger value="responses" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Responses
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <Layout className="w-4 h-4" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="builder" className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Question Types
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search surveys..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64 bg-white/80 dark:bg-gray-800/80"
                />
              </div>
            </div>
          </div>

          {/* Surveys Tab */}
          <TabsContent value="surveys" className="space-y-4">
            {/* Surveys Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-8 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <ClipboardList className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Survey Management</h2>
                    <p className="text-white/80">Create, distribute, and analyze surveys</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Active Surveys</p>
                    <p className="text-2xl font-bold">{displayStats.activeSurveys}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Total Responses</p>
                    <p className="text-2xl font-bold">{displayStats.totalResponses.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Avg Completion</p>
                    <p className="text-2xl font-bold">{displayStats.avgCompletionRate}%</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">NPS Score</p>
                    <p className="text-2xl font-bold">{displayStats.avgNPS}</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {[
                { icon: Plus, label: 'New Survey', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' },
                { icon: Layout, label: 'Templates', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
                { icon: Share2, label: 'Distribute', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' },
                { icon: BarChart3, label: 'Analytics', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600' },
                { icon: Download, label: 'Export', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' },
                { icon: Users, label: 'Responses', color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600' },
                { icon: GitBranch, label: 'Logic Flow', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' },
                { icon: Zap, label: 'Automations', color: 'bg-red-100 dark:bg-red-900/30 text-red-600' },
              ].map((action, i) => (
                <button
                  key={i}
                  className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  <div className={`p-3 rounded-xl ${action.color}`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('active')}
              >
                <Play className="w-3 h-3 mr-1" />
                Active
              </Button>
              <Button
                variant={statusFilter === 'draft' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('draft')}
              >
                <Edit className="w-3 h-3 mr-1" />
                Draft
              </Button>
              <Button
                variant={statusFilter === 'paused' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('paused')}
              >
                <Pause className="w-3 h-3 mr-1" />
                Paused
              </Button>
              <Button
                variant={statusFilter === 'closed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('closed')}
              >
                <Archive className="w-3 h-3 mr-1" />
                Closed
              </Button>
            </div>

            <div className="grid gap-4">
              {isLoading ? (
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                  <CardContent className="p-6 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mr-2" />
                    <span>Loading surveys...</span>
                  </CardContent>
                </Card>
              ) : filteredSurveys.length === 0 ? (
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                  <CardContent className="p-6 text-center">
                    <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No surveys yet</h3>
                    <p className="text-muted-foreground mb-4">Create your first survey to get started</p>
                    <Button
                      onClick={() => setShowCreateDialog(true)}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Survey
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredSurveys.map(survey => (
                <Card key={survey.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getStatusColor(survey.status)}>{survey.status}</Badge>
                          {survey.questions.some(q => q.hasLogicJump) && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <GitBranch className="w-3 h-3" />
                              Logic Jumps
                            </Badge>
                          )}
                          {survey.isTemplate && (
                            <Badge variant="secondary">Template</Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold mb-1">{survey.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{survey.description}</p>

                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span>{survey.questions.length} questions</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>{survey.responses.toLocaleString()} responses</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-muted-foreground" />
                            <span>{survey.completionRate}% completion</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{survey.avgTime} min avg</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                          {survey.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Status-based action buttons */}
                        {survey.status === 'draft' && (
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={(e) => handlePublishSurvey(survey.id, e)}
                            disabled={isUpdating}
                          >
                            {isUpdating ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-1" />
                                Publish
                              </>
                            )}
                          </Button>
                        )}
                        {survey.status === 'active' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => handlePauseSurvey(survey.id, e)}
                              disabled={isUpdating}
                            >
                              <Pause className="w-4 h-4 mr-1" />
                              Pause
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={(e) => handleCloseSurvey(survey.id, e)}
                              disabled={isUpdating}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Close
                            </Button>
                          </>
                        )}
                        {survey.status === 'paused' && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={(e) => handlePublishSurvey(survey.id, e)}
                              disabled={isUpdating}
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Resume
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={(e) => handleCloseSurvey(survey.id, e)}
                              disabled={isUpdating}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Close
                            </Button>
                          </>
                        )}
                        <Button variant="outline" size="sm" onClick={() => handleShare(survey)}>
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setSelectedSurvey(survey)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          onClick={(e) => confirmDeleteSurvey(survey.id, e)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Response Progress */}
                    {survey.status === 'active' && (
                      <div className="mt-4 pt-4 border-t dark:border-gray-700">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Response Progress</span>
                          <span className="font-medium">{survey.responses} collected</span>
                        </div>
                        <Progress value={Math.min(survey.responses / 10, 100)} className="h-2" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
              )}
            </div>
          </TabsContent>

          {/* Responses Tab */}
          <TabsContent value="responses" className="space-y-4">
            {/* Responses Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-8 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Users className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Response Management</h2>
                    <p className="text-white/80">View and analyze all survey responses</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-6">
                  <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-colors">
                    <RefreshCw className="w-4 h-4 inline mr-2" />
                    Refresh
                  </button>
                  <button className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-white/90 transition-colors">
                    <Download className="w-4 h-4 inline mr-2" />
                    Export All
                  </button>
                </div>
              </div>
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            </div>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="divide-y dark:divide-gray-700">
                    {mockResponses.map(response => (
                      <div
                        key={response.id}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedResponse(response)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-emerald-100 text-emerald-700">
                                {response.respondentEmail ? response.respondentEmail[0].toUpperCase() : 'A'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {response.respondentEmail || 'Anonymous'}
                                </span>
                                {response.isComplete ? (
                                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    Complete
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">Partial</Badge>
                                )}
                                {response.npsScore !== undefined && (
                                  <Badge className={getNPSCategory(response.npsScore).color}>
                                    NPS: {response.npsScore}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {formatDateTime(response.startedAt)} • {formatDuration(response.duration)} • {response.metadata.device}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-medium">{response.answers.length}</p>
                              <p className="text-xs text-muted-foreground">answers</p>
                            </div>
                            <Button variant="ghost" size="sm">
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            {/* Templates Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <Layout className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Survey Templates</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Start with professionally designed templates</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {mockTemplates.map(template => (
                <Card key={template.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur hover:shadow-lg transition-all cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-4xl">{template.thumbnail}</div>
                      {template.isPremium && (
                        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold mb-1 group-hover:text-emerald-600 transition-colors">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{template.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{template.questions} questions</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span>{template.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t dark:border-gray-700">
                      <span className="text-xs text-muted-foreground">{template.uses.toLocaleString()} uses</span>
                      <Button size="sm">
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Response Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {Array.from({ length: 14 }).map((_, i) => {
                      const height = 30 + Math.random() * 70
                      const isToday = i === 13
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className={`w-full rounded-t ${isToday ? 'bg-emerald-500' : 'bg-teal-500'}`}
                            style={{ height: `${height}%` }}
                          />
                          <span className="text-[10px] text-muted-foreground">{i + 1}</span>
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-2">Last 14 days</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    NPS Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center gap-8 h-64">
                    <div className="relative">
                      <svg className="w-40 h-40 transform -rotate-90">
                        <circle cx="80" cy="80" r="70" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          fill="none"
                          stroke="#22c55e"
                          strokeWidth="12"
                          strokeDasharray={`${2 * Math.PI * 70 * (npsDistribution.promoters / 100)} ${2 * Math.PI * 70}`}
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          fill="none"
                          stroke="#eab308"
                          strokeWidth="12"
                          strokeDasharray={`${2 * Math.PI * 70 * (npsDistribution.passives / 100)} ${2 * Math.PI * 70}`}
                          strokeDashoffset={`${-2 * Math.PI * 70 * (npsDistribution.promoters / 100)}`}
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="12"
                          strokeDasharray={`${2 * Math.PI * 70 * (npsDistribution.detractors / 100)} ${2 * Math.PI * 70}`}
                          strokeDashoffset={`${-2 * Math.PI * 70 * ((npsDistribution.promoters + npsDistribution.passives) / 100)}`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold">{npsDistribution.nps}</span>
                        <span className="text-xs text-muted-foreground">NPS Score</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm">Promoters: {Math.round(npsDistribution.promoters)}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span className="text-sm">Passives: {Math.round(npsDistribution.passives)}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-sm">Detractors: {Math.round(npsDistribution.detractors)}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Completion Rates by Survey
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockSurveys.slice(0, 5).map(survey => (
                      <div key={survey.id} className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium truncate">{survey.title}</span>
                            <span className="text-sm text-muted-foreground">{survey.completionRate}%</span>
                          </div>
                          <Progress value={survey.completionRate} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Device Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Desktop</span>
                          <span className="text-sm text-muted-foreground">52%</span>
                        </div>
                        <Progress value={52} className="h-2" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Mobile</span>
                          <span className="text-sm text-muted-foreground">38%</span>
                        </div>
                        <Progress value={38} className="h-2" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Tablet</span>
                          <span className="text-sm text-muted-foreground">10%</span>
                        </div>
                        <Progress value={10} className="h-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Question Types Tab */}
          <TabsContent value="builder" className="space-y-4">
            <h2 className="text-lg font-semibold">Available Question Types</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[
                { type: 'short_text', name: 'Short Text', description: 'Single line text response', icon: Type },
                { type: 'long_text', name: 'Long Text', description: 'Multi-line text response', icon: FileText },
                { type: 'multiple_choice', name: 'Multiple Choice', description: 'Select one option from a list', icon: List },
                { type: 'checkbox', name: 'Checkboxes', description: 'Select multiple options', icon: ToggleLeft },
                { type: 'rating', name: 'Rating', description: '1-5 star rating scale', icon: Star },
                { type: 'nps', name: 'NPS Score', description: '0-10 Net Promoter Score', icon: Target },
                { type: 'linear_scale', name: 'Linear Scale', description: 'Custom numeric scale', icon: Hash },
                { type: 'date', name: 'Date Picker', description: 'Date selection', icon: Calendar },
                { type: 'file_upload', name: 'File Upload', description: 'Upload files and images', icon: FileUp },
                { type: 'dropdown', name: 'Dropdown', description: 'Select from dropdown menu', icon: Sliders },
                { type: 'matrix', name: 'Matrix', description: 'Grid of questions', icon: Layout },
                { type: 'logic_jump', name: 'Logic Jump', description: 'Conditional branching', icon: GitBranch }
              ].map(item => (
                <Card key={item.type} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur hover:shadow-lg transition-all cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors">
                        <item.icon className="w-5 h-5 text-emerald-600" />
                      </div>
                      <h3 className="font-semibold">{item.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-12 md:col-span-3">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sticky top-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Settings</h3>
                  <nav className="space-y-1">
                    {[
                      { id: 'general', label: 'General', icon: Sliders },
                      { id: 'branding', label: 'Branding', icon: Globe },
                      { id: 'notifications', label: 'Notifications', icon: Bell },
                      { id: 'integrations', label: 'Integrations', icon: Webhook },
                      { id: 'security', label: 'Security', icon: Shield },
                      { id: 'advanced', label: 'Advanced', icon: Terminal },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSettingsTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          settingsTab === item.id
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Settings Content */}
              <div className="col-span-12 md:col-span-9 space-y-6">
                {settingsTab === 'general' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Default Survey Settings</CardTitle>
                        <CardDescription>Configure default options for new surveys</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="defaultFont">Default Font</Label>
                            <select id="defaultFont" className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                              <option>Inter</option>
                              <option>Plus Jakarta Sans</option>
                              <option>Outfit</option>
                              <option>Roboto</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor="defaultLanguage">Default Language</Label>
                            <select id="defaultLanguage" className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                              <option>English</option>
                              <option>Spanish</option>
                              <option>French</option>
                              <option>German</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Show Progress Bar</p>
                            <p className="text-sm text-gray-500">Display completion progress to respondents</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Show Question Numbers</p>
                            <p className="text-sm text-gray-500">Display question numbers in surveys</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Allow Multiple Responses</p>
                            <p className="text-sm text-gray-500">Let users submit multiple times</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Thank You Page</CardTitle>
                        <CardDescription>Customize the completion experience</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="thankYouMessage">Thank You Message</Label>
                          <Input id="thankYouMessage" type="text" className="mt-1" defaultValue="Thank you for your feedback!" />
                        </div>
                        <div>
                          <Label htmlFor="redirectUrl">Redirect URL (optional)</Label>
                          <Input id="redirectUrl" type="url" className="mt-1" placeholder="https://yoursite.com/thank-you" />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Show Social Share Buttons</p>
                            <p className="text-sm text-gray-500">Allow respondents to share the survey</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'branding' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Brand Identity</CardTitle>
                        <CardDescription>Customize your survey appearance</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Logo</p>
                            <p className="text-sm text-gray-500">Upload your brand logo</p>
                          </div>
                          <Button variant="outline">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="primaryColor">Primary Color</Label>
                            <div className="mt-1 flex items-center gap-2">
                              <input type="color" id="primaryColor" className="w-10 h-10 rounded border cursor-pointer" defaultValue="#10b981" />
                              <Input type="text" className="flex-1" defaultValue="#10b981" />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="bgColor">Background Color</Label>
                            <div className="mt-1 flex items-center gap-2">
                              <input type="color" id="bgColor" className="w-10 h-10 rounded border cursor-pointer" defaultValue="#ffffff" />
                              <Input type="text" className="flex-1" defaultValue="#ffffff" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Custom Domain</CardTitle>
                        <CardDescription>Use your own domain for surveys</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="customDomain">Custom Domain</Label>
                          <Input id="customDomain" type="text" className="mt-1" placeholder="surveys.yourdomain.com" />
                        </div>
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            To use a custom domain, add a CNAME record pointing to surveys.app
                          </p>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Remove Branding</p>
                            <p className="text-sm text-gray-500">Hide "Powered by" watermark</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'notifications' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Email Notifications</CardTitle>
                        <CardDescription>Configure when you receive emails</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'New Response', desc: 'Get notified for each new response', enabled: true },
                          { name: 'Survey Completed', desc: 'When a survey reaches target responses', enabled: true },
                          { name: 'Daily Summary', desc: 'Daily digest of all responses', enabled: true },
                          { name: 'Weekly Reports', desc: 'Weekly analytics summary', enabled: true },
                          { name: 'Low NPS Alert', desc: 'Alert when NPS drops below threshold', enabled: false },
                          { name: 'Survey Expiring', desc: 'Reminder before survey closes', enabled: true },
                        ].map((notification) => (
                          <div key={notification.name} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{notification.name}</p>
                              <p className="text-sm text-gray-500">{notification.desc}</p>
                            </div>
                            <Switch defaultChecked={notification.enabled} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Notification Recipients</CardTitle>
                        <CardDescription>Who should receive notifications</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="notifyEmails">Email Addresses</Label>
                          <Input id="notifyEmails" type="text" className="mt-1" defaultValue="team@company.com" />
                          <p className="text-xs text-gray-500 mt-1">Separate multiple emails with commas</p>
                        </div>
                        <div>
                          <Label htmlFor="slackChannel">Slack Channel</Label>
                          <Input id="slackChannel" type="text" className="mt-1" placeholder="#survey-responses" />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'integrations' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Connected Apps</CardTitle>
                        <CardDescription>Sync responses with your tools</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Google Sheets', desc: 'Sync responses automatically', status: 'connected', icon: '📊' },
                          { name: 'Slack', desc: 'Real-time notifications', status: 'connected', icon: '💬' },
                          { name: 'Mailchimp', desc: 'Sync contacts to lists', status: 'disconnected', icon: '📧' },
                          { name: 'HubSpot', desc: 'CRM integration', status: 'disconnected', icon: '🔶' },
                          { name: 'Zapier', desc: 'Connect to 5000+ apps', status: 'connected', icon: '⚡' },
                          { name: 'Segment', desc: 'Analytics sync', status: 'disconnected', icon: '📈' },
                        ].map((integration) => (
                          <div key={integration.name} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{integration.icon}</span>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{integration.name}</p>
                                <p className="text-sm text-gray-500">{integration.desc}</p>
                              </div>
                            </div>
                            <Button variant={integration.status === 'connected' ? 'outline' : 'default'} size="sm">
                              {integration.status === 'connected' ? 'Manage' : 'Connect'}
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>API Access</CardTitle>
                        <CardDescription>Developer integration options</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="apiKey">API Key</Label>
                          <div className="mt-1 flex gap-2">
                            <Input id="apiKey" type="password" className="flex-1" defaultValue="STRIPE_KEY_PLACEHOLDER" readOnly />
                            <Button variant="outline">
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="webhookUrl">Webhook URL</Label>
                          <Input id="webhookUrl" type="url" className="mt-1" placeholder="https://api.yoursite.com/webhooks/survey" />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'security' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Access Control</CardTitle>
                        <CardDescription>Manage survey access settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Require Login</p>
                            <p className="text-sm text-gray-500">Respondents must sign in</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Password Protected</p>
                            <p className="text-sm text-gray-500">Require password to access surveys</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">CAPTCHA</p>
                            <p className="text-sm text-gray-500">Prevent spam responses</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">IP Blocking</p>
                            <p className="text-sm text-gray-500">Block suspicious IP addresses</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Data Privacy</CardTitle>
                        <CardDescription>Configure privacy settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Anonymous Responses</p>
                            <p className="text-sm text-gray-500">Don't collect identifying information</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">GDPR Compliance</p>
                            <p className="text-sm text-gray-500">Show consent notice</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Data Encryption</p>
                            <p className="text-sm text-gray-500">Encrypt response data at rest</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'advanced' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Data Management</CardTitle>
                        <CardDescription>Export and manage survey data</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Export All Data</p>
                            <p className="text-sm text-gray-500">Download all surveys and responses</p>
                          </div>
                          <Button>
                            <Download className="w-4 h-4 mr-2" />
                            Export
                          </Button>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Import Surveys</p>
                            <p className="text-sm text-gray-500">Upload surveys from other platforms</p>
                          </div>
                          <Button variant="outline">
                            <Upload className="w-4 h-4 mr-2" />
                            Import
                          </Button>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Data Retention</p>
                            <p className="text-sm text-gray-500">How long to keep response data</p>
                          </div>
                          <select className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                            <option>Forever (default)</option>
                            <option>1 year</option>
                            <option>2 years</option>
                            <option>5 years</option>
                          </select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Plan & Billing</CardTitle>
                        <CardDescription>Manage your subscription</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl">
                            <h3 className="font-semibold text-lg mb-1">Professional</h3>
                            <p className="text-xs text-muted-foreground mb-4">Current Plan</p>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>Responses</span>
                                <span>{displayStats.totalResponses.toLocaleString()} / 10,000</span>
                              </div>
                              <Progress value={(displayStats.totalResponses / 10000) * 100} className="h-2" />
                            </div>
                          </div>
                          <div className="md:col-span-2 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <p className="text-xs text-muted-foreground">Next Billing</p>
                                <p className="font-semibold">$29/mo on Feb 1</p>
                              </div>
                              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <p className="text-xs text-muted-foreground">Features</p>
                                <p className="font-semibold">Logic, Branding, API</p>
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <Button variant="outline" className="flex-1">View Invoices</Button>
                              <Button className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600">Upgrade</Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-900/50">
                      <CardHeader>
                        <CardTitle className="text-red-600">Danger Zone</CardTitle>
                        <CardDescription>Irreversible actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Delete All Responses</p>
                            <p className="text-sm text-gray-500">Remove all collected data</p>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Close Account</p>
                            <p className="text-sm text-gray-500">Permanently delete your account</p>
                          </div>
                          <Button variant="destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Account
                          </Button>
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
              insights={mockSurveysAIInsights}
              title="Survey Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockSurveysCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockSurveysPredictions}
              title="Response Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockSurveysActivities}
            title="Survey Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockSurveysQuickActions}
            variant="grid"
          />
        </div>

        {/* Survey Detail Dialog */}
        <Dialog open={!!selectedSurvey} onOpenChange={() => setSelectedSurvey(null)}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                {selectedSurvey?.title}
              </DialogTitle>
              <DialogDescription>{selectedSurvey?.description}</DialogDescription>
            </DialogHeader>
            {selectedSurvey && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(selectedSurvey.status)}>{selectedSurvey.status}</Badge>
                  {selectedSurvey.tags.map(tag => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold">{selectedSurvey.questions.length}</p>
                    <p className="text-xs text-muted-foreground">Questions</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold">{selectedSurvey.responses.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Responses</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">{selectedSurvey.completionRate}%</p>
                    <p className="text-xs text-muted-foreground">Completion</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold">{selectedSurvey.avgTime} min</p>
                    <p className="text-xs text-muted-foreground">Avg Time</p>
                  </div>
                </div>

                {/* Questions Preview */}
                <div>
                  <h4 className="font-medium mb-3">Questions</h4>
                  <div className="space-y-3">
                    {selectedSurvey.questions.map((question, idx) => (
                      <div key={question.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-sm font-bold text-muted-foreground w-6">{idx + 1}</span>
                        <div className="flex items-center gap-2">
                          {getQuestionTypeIcon(question.type)}
                          <span className="text-xs text-muted-foreground capitalize">{question.type.replace('_', ' ')}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{question.title}</p>
                          {question.required && (
                            <Badge variant="outline" className="text-xs mt-1">Required</Badge>
                          )}
                          {question.hasLogicJump && (
                            <Badge variant="secondary" className="text-xs mt-1 ml-1">
                              <GitBranch className="w-3 h-3 mr-1" />
                              Logic
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => handleShare(selectedSurvey)}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button className="flex-1">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Survey
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Response Detail Dialog */}
        <Dialog open={!!selectedResponse} onOpenChange={() => setSelectedResponse(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Response Details
              </DialogTitle>
              <DialogDescription>
                {selectedResponse?.respondentEmail || 'Anonymous response'}
              </DialogDescription>
            </DialogHeader>
            {selectedResponse && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  {selectedResponse.isComplete ? (
                    <Badge className="bg-green-100 text-green-700">Complete</Badge>
                  ) : (
                    <Badge variant="secondary">Partial</Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {formatDateTime(selectedResponse.startedAt)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatDuration(selectedResponse.duration)}
                  </span>
                </div>

                {/* Answers */}
                <div className="space-y-4">
                  <h4 className="font-medium">Answers</h4>
                  {selectedResponse.answers.map((answer, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">{answer.questionTitle}</p>
                      <p className="font-medium">
                        {typeof answer.answer === 'number' ? answer.answer : answer.answer.toString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-muted-foreground">Device</p>
                    <p className="font-medium">{selectedResponse.metadata.device}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-muted-foreground">Browser</p>
                    <p className="font-medium">{selectedResponse.metadata.browser}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-medium">{selectedResponse.metadata.location}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Share Dialog */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Share Survey
              </DialogTitle>
              <DialogDescription>
                {sharingSurvey?.title}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Link className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Share Link</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={`https://survey.app/s/${sharingSurvey?.id}`}
                    className="text-sm"
                  />
                  <Button variant="outline" size="sm">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <QrCode className="w-4 h-4" />
                  QR Code
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Embed
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Preview
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Survey Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Survey
              </DialogTitle>
              <DialogDescription>
                Create a new survey to start collecting responses
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="survey-title">Survey Title *</Label>
                <Input
                  id="survey-title"
                  placeholder="Enter survey title..."
                  value={newSurveyTitle}
                  onChange={(e) => setNewSurveyTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="survey-description">Description</Label>
                <Textarea
                  id="survey-description"
                  placeholder="Enter survey description..."
                  value={newSurveyDescription}
                  onChange={(e) => setNewSurveyDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="survey-type">Survey Type</Label>
                <select
                  id="survey-type"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  value={newSurveyType}
                  onChange={(e) => setNewSurveyType(e.target.value)}
                >
                  <option value="customer-feedback">Customer Feedback</option>
                  <option value="nps">NPS Survey</option>
                  <option value="csat">Customer Satisfaction (CSAT)</option>
                  <option value="employee-engagement">Employee Engagement</option>
                  <option value="market-research">Market Research</option>
                  <option value="product-feedback">Product Feedback</option>
                  <option value="event-feedback">Event Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateSurvey}
                disabled={isCreating || !newSurveyTitle.trim()}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Survey
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="w-5 h-5" />
                Delete Survey
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this survey? This action cannot be undone.
                All responses associated with this survey will also be deleted.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteDialog(false)
                  setSurveyToDelete(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteSurvey}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Survey
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
