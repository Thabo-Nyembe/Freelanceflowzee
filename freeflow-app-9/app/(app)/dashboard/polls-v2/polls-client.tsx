'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import {
  ClipboardList,
  Plus,
  Search,
  MoreVertical,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Eye,
  Share2,
  Copy,
  Trash2,
  Edit2,
  Play,
  Pause,
  CheckCircle2,
  Star,
  MessageSquare,
  Image,
  FileText,
  Link,
  Calendar,
  Clock,
  Globe,
  Lock,
  Settings,
  Palette,
  Zap,
  ChevronDown,
  ArrowUp,
  X,
  AlertCircle,
  Sparkles,
  Layout,
  Type,
  ToggleLeft,
  ListOrdered,
  Mail,
  Download,
  RefreshCw,
  Target,
  Award,
  Layers,
  Code,
  UserCheck,
  Webhook,
  Key,
  Shield,
  HardDrive,
  AlertOctagon,
  Bell,
  CreditCard,
  Sliders
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




import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

// ============================================================================
// TYPE DEFINITIONS - Typeform Level
// ============================================================================

interface QuestionOption {
  id: string
  text: string
  image?: string
  value?: number
}

interface LogicJump {
  id: string
  condition: {
    questionId: string
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
    value: string | number
  }
  action: 'jump_to' | 'skip' | 'end'
  targetQuestionId?: string
}

interface Question {
  id: string
  type: 'welcome' | 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'rating' | 'nps' | 'opinion_scale' | 'yes_no' | 'email' | 'phone' | 'date' | 'file_upload' | 'picture_choice' | 'ranking' | 'statement' | 'thank_you'
  title: string
  description?: string
  placeholder?: string
  required: boolean
  options?: QuestionOption[]
  settings: {
    randomizeOptions?: boolean
    allowOther?: boolean
    minValue?: number
    maxValue?: number
    minLabel?: string
    maxLabel?: string
    maxFiles?: number
    maxFileSize?: number
    allowedFileTypes?: string[]
    dateFormat?: string
    buttonText?: string
    showQuotaMarks?: boolean
    multipleSelectionLimit?: number
  }
  logic?: LogicJump[]
  mediaUrl?: string
  mediaType?: 'image' | 'video'
}

interface FormTheme {
  id: string
  name: string
  backgroundColor: string
  questionColor: string
  answerColor: string
  buttonColor: string
  buttonTextColor: string
  fontFamily: string
  backgroundImage?: string
  logoUrl?: string
  progressBar: 'top' | 'bottom' | 'none'
  animation: 'slide' | 'fade' | 'none'
}

interface FormSettings {
  showProgressBar: boolean
  showQuestionNumbers: boolean
  allowBackNavigation: boolean
  shuffleQuestions: boolean
  limitResponses: boolean
  maxResponses?: number
  closeOnDate: boolean
  closeDate?: string
  notifyOnResponse: boolean
  notifyEmails: string[]
  sendConfirmationEmail: boolean
  confirmationEmailTemplate?: string
  redirectOnComplete: boolean
  redirectUrl?: string
  passwordProtected: boolean
  password?: string
  closedMessage?: string
}

interface Form {
  id: string
  title: string
  description: string
  slug: string
  status: 'draft' | 'active' | 'paused' | 'closed' | 'scheduled'
  questions: Question[]
  theme: FormTheme
  settings: FormSettings
  responseCount: number
  viewCount: number
  completionRate: number
  averageTime: number
  createdAt: string
  updatedAt: string
  publishedAt?: string
  closedAt?: string
  workspace: string
  createdBy: {
    id: string
    name: string
    avatar: string
  }
}

interface Response {
  id: string
  formId: string
  answers: {
    questionId: string
    answer: string | string[] | number
    timestamp: string
  }[]
  metadata: {
    startedAt: string
    completedAt: string
    duration: number
    device: string
    browser: string
    location?: string
    referrer?: string
  }
  respondent?: {
    email?: string
    name?: string
  }
}

interface FormTemplate {
  id: string
  name: string
  description: string
  category: string
  thumbnail: string
  questionsCount: number
  usageCount: number
  questions: Question[]
}

interface FormAnalytics {
  views: number
  starts: number
  completions: number
  completionRate: number
  averageTime: number
  dropOffByQuestion: { questionId: string; dropOffRate: number }[]
  responsesByDay: { date: string; count: number }[]
  deviceBreakdown: { device: string; count: number }[]
  locationBreakdown: { location: string; count: number }[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockThemes: FormTheme[] = [
  { id: 'theme-1', name: 'Default', backgroundColor: '#ffffff', questionColor: '#1f2937', answerColor: '#3b82f6', buttonColor: '#3b82f6', buttonTextColor: '#ffffff', fontFamily: 'Inter', progressBar: 'top', animation: 'slide' },
  { id: 'theme-2', name: 'Dark', backgroundColor: '#1f2937', questionColor: '#ffffff', answerColor: '#60a5fa', buttonColor: '#60a5fa', buttonTextColor: '#1f2937', fontFamily: 'Inter', progressBar: 'top', animation: 'fade' },
  { id: 'theme-3', name: 'Nature', backgroundColor: '#ecfdf5', questionColor: '#065f46', answerColor: '#059669', buttonColor: '#059669', buttonTextColor: '#ffffff', fontFamily: 'Poppins', progressBar: 'bottom', animation: 'slide' },
  { id: 'theme-4', name: 'Sunset', backgroundColor: '#fff7ed', questionColor: '#9a3412', answerColor: '#ea580c', buttonColor: '#ea580c', buttonTextColor: '#ffffff', fontFamily: 'DM Sans', progressBar: 'none', animation: 'fade' }
]

const mockQuestions: Question[] = [
  {
    id: 'q-welcome',
    type: 'welcome',
    title: 'Welcome to our Survey!',
    description: 'We appreciate your time. This survey takes about 3 minutes.',
    required: false,
    settings: { buttonText: 'Start' }
  },
  {
    id: 'q-1',
    type: 'short_text',
    title: "What's your name?",
    placeholder: 'Type your name here...',
    required: true,
    settings: {}
  },
  {
    id: 'q-2',
    type: 'email',
    title: "What's your email address?",
    description: "We'll send you a copy of your responses",
    placeholder: 'name@example.com',
    required: true,
    settings: {}
  },
  {
    id: 'q-3',
    type: 'multiple_choice',
    title: 'How did you hear about us?',
    required: true,
    options: [
      { id: 'opt-1', text: 'Social Media' },
      { id: 'opt-2', text: 'Friend/Family' },
      { id: 'opt-3', text: 'Search Engine' },
      { id: 'opt-4', text: 'Advertisement' },
      { id: 'opt-5', text: 'Other' }
    ],
    settings: { allowOther: true, randomizeOptions: false }
  },
  {
    id: 'q-4',
    type: 'nps',
    title: 'How likely are you to recommend us to a friend?',
    description: '0 = Not at all likely, 10 = Extremely likely',
    required: true,
    settings: { minValue: 0, maxValue: 10, minLabel: 'Not likely', maxLabel: 'Very likely' }
  },
  {
    id: 'q-5',
    type: 'rating',
    title: 'How would you rate your overall experience?',
    required: true,
    settings: { minValue: 1, maxValue: 5 }
  },
  {
    id: 'q-6',
    type: 'long_text',
    title: 'Any additional feedback you would like to share?',
    placeholder: 'Share your thoughts...',
    required: false,
    settings: {}
  },
  {
    id: 'q-thank',
    type: 'thank_you',
    title: 'Thank you for your feedback!',
    description: "Your responses have been recorded. We'll be in touch soon.",
    required: false,
    settings: { buttonText: 'Done' }
  }
]

const mockForms: Form[] = [
  {
    id: 'form-1',
    title: 'Customer Satisfaction Survey',
    description: 'Measure customer satisfaction and gather feedback',
    slug: 'customer-satisfaction',
    status: 'active',
    questions: mockQuestions,
    theme: mockThemes[0],
    settings: {
      showProgressBar: true,
      showQuestionNumbers: true,
      allowBackNavigation: true,
      shuffleQuestions: false,
      limitResponses: false,
      closeOnDate: false,
      notifyOnResponse: true,
      notifyEmails: ['team@company.com'],
      sendConfirmationEmail: true,
      redirectOnComplete: false,
      passwordProtected: false
    },
    responseCount: 1247,
    viewCount: 3892,
    completionRate: 78.5,
    averageTime: 185,
    createdAt: '2024-11-01T10:00:00Z',
    updatedAt: '2024-12-20T14:30:00Z',
    publishedAt: '2024-11-05T09:00:00Z',
    workspace: 'Marketing',
    createdBy: { id: 'user-1', name: 'John Smith', avatar: '/avatars/john.jpg' }
  },
  {
    id: 'form-2',
    title: 'Event Registration Form',
    description: 'Register for our upcoming product launch event',
    slug: 'event-registration',
    status: 'active',
    questions: mockQuestions.slice(0, 5),
    theme: mockThemes[2],
    settings: {
      showProgressBar: true,
      showQuestionNumbers: false,
      allowBackNavigation: true,
      shuffleQuestions: false,
      limitResponses: true,
      maxResponses: 500,
      closeOnDate: true,
      closeDate: '2024-12-31T23:59:59Z',
      notifyOnResponse: true,
      notifyEmails: ['events@company.com'],
      sendConfirmationEmail: true,
      redirectOnComplete: true,
      redirectUrl: 'https://company.com/event/confirmation',
      passwordProtected: false
    },
    responseCount: 342,
    viewCount: 1250,
    completionRate: 85.2,
    averageTime: 120,
    createdAt: '2024-12-01T08:00:00Z',
    updatedAt: '2024-12-22T16:45:00Z',
    publishedAt: '2024-12-05T12:00:00Z',
    workspace: 'Events',
    createdBy: { id: 'user-2', name: 'Sarah Chen', avatar: '/avatars/sarah.jpg' }
  },
  {
    id: 'form-3',
    title: 'Employee Feedback Survey',
    description: 'Quarterly employee engagement and satisfaction survey',
    slug: 'employee-feedback-q4',
    status: 'draft',
    questions: mockQuestions.slice(0, 6),
    theme: mockThemes[1],
    settings: {
      showProgressBar: true,
      showQuestionNumbers: true,
      allowBackNavigation: false,
      shuffleQuestions: false,
      limitResponses: false,
      closeOnDate: false,
      notifyOnResponse: false,
      notifyEmails: [],
      sendConfirmationEmail: false,
      redirectOnComplete: false,
      passwordProtected: true,
      password: 'employee2024'
    },
    responseCount: 0,
    viewCount: 45,
    completionRate: 0,
    averageTime: 0,
    createdAt: '2024-12-20T10:00:00Z',
    updatedAt: '2024-12-23T09:15:00Z',
    workspace: 'HR',
    createdBy: { id: 'user-3', name: 'Mike Johnson', avatar: '/avatars/mike.jpg' }
  },
  {
    id: 'form-4',
    title: 'Product Feedback Form',
    description: 'Share your thoughts on our latest product release',
    slug: 'product-feedback-v2',
    status: 'paused',
    questions: mockQuestions,
    theme: mockThemes[3],
    settings: {
      showProgressBar: true,
      showQuestionNumbers: false,
      allowBackNavigation: true,
      shuffleQuestions: false,
      limitResponses: false,
      closeOnDate: false,
      notifyOnResponse: true,
      notifyEmails: ['product@company.com'],
      sendConfirmationEmail: false,
      redirectOnComplete: false,
      passwordProtected: false
    },
    responseCount: 89,
    viewCount: 456,
    completionRate: 62.3,
    averageTime: 240,
    createdAt: '2024-10-15T14:00:00Z',
    updatedAt: '2024-12-10T11:20:00Z',
    publishedAt: '2024-10-20T08:00:00Z',
    workspace: 'Product',
    createdBy: { id: 'user-1', name: 'John Smith', avatar: '/avatars/john.jpg' }
  }
]

const mockTemplates: FormTemplate[] = [
  { id: 'tpl-1', name: 'Customer Satisfaction', description: 'Measure customer happiness with your product or service', category: 'Feedback', thumbnail: '/templates/csat.png', questionsCount: 8, usageCount: 15420, questions: mockQuestions },
  { id: 'tpl-2', name: 'NPS Survey', description: 'Net Promoter Score survey to measure customer loyalty', category: 'Feedback', thumbnail: '/templates/nps.png', questionsCount: 5, usageCount: 28930, questions: mockQuestions.slice(0, 5) },
  { id: 'tpl-3', name: 'Event Registration', description: 'Collect attendee information for your events', category: 'Registration', thumbnail: '/templates/event.png', questionsCount: 10, usageCount: 12350, questions: mockQuestions },
  { id: 'tpl-4', name: 'Job Application', description: 'Screen candidates with a comprehensive application form', category: 'HR', thumbnail: '/templates/job.png', questionsCount: 15, usageCount: 8920, questions: mockQuestions },
  { id: 'tpl-5', name: 'Contact Form', description: 'Simple contact form for your website', category: 'Contact', thumbnail: '/templates/contact.png', questionsCount: 4, usageCount: 45680, questions: mockQuestions.slice(0, 4) },
  { id: 'tpl-6', name: 'Quiz', description: 'Create engaging quizzes with scoring', category: 'Quiz', thumbnail: '/templates/quiz.png', questionsCount: 10, usageCount: 6780, questions: mockQuestions }
]

const questionTypes = [
  { type: 'short_text', label: 'Short Text', icon: Type, description: 'Single line text input' },
  { type: 'long_text', label: 'Long Text', icon: FileText, description: 'Multi-line text area' },
  { type: 'multiple_choice', label: 'Multiple Choice', icon: ListOrdered, description: 'Select one option' },
  { type: 'checkboxes', label: 'Checkboxes', icon: CheckCircle2, description: 'Select multiple options' },
  { type: 'dropdown', label: 'Dropdown', icon: ChevronDown, description: 'Select from dropdown' },
  { type: 'rating', label: 'Rating', icon: Star, description: 'Star rating scale' },
  { type: 'nps', label: 'NPS', icon: Target, description: 'Net Promoter Score 0-10' },
  { type: 'opinion_scale', label: 'Opinion Scale', icon: BarChart3, description: 'Numeric scale' },
  { type: 'yes_no', label: 'Yes/No', icon: ToggleLeft, description: 'Binary choice' },
  { type: 'email', label: 'Email', icon: Mail, description: 'Email address input' },
  { type: 'date', label: 'Date', icon: Calendar, description: 'Date picker' },
  { type: 'file_upload', label: 'File Upload', icon: Download, description: 'Upload files' },
  { type: 'picture_choice', label: 'Picture Choice', icon: Image, description: 'Image options' },
  { type: 'ranking', label: 'Ranking', icon: ArrowUp, description: 'Drag to rank items' },
  { type: 'statement', label: 'Statement', icon: MessageSquare, description: 'Info block' }
]

// Enhanced Competitive Upgrade Mock Data - Polls Context
const mockPollsAIInsights = [
  { id: '1', type: 'success' as const, title: 'High Response Rate', description: 'Customer Satisfaction Survey has 85% response rate. Great engagement!', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'info' as const, title: 'Trending Topics', description: 'Product feedback questions getting most attention this week.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Analytics' },
  { id: '3', type: 'warning' as const, title: 'Low Completion', description: '3 surveys have <50% completion rate. Consider shortening them.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Quality' },
]

const mockPollsCollaborators = [
  { id: '1', name: 'Research Lead', avatar: '/avatars/sarah-chen.jpg', status: 'online' as const, role: 'Survey Manager', lastActive: 'Now' },
  { id: '2', name: 'Marketing Team', avatar: '/avatars/emily.jpg', status: 'online' as const, role: 'Contributor', lastActive: '10m ago' },
  { id: '3', name: 'Data Analyst', avatar: '/avatars/maya.jpg', status: 'away' as const, role: 'Analyst', lastActive: '30m ago' },
]

const mockPollsPredictions = [
  { id: '1', label: 'Avg Response Rate', current: 72, target: 80, predicted: 78, confidence: 80, trend: 'up' as const },
  { id: '2', label: 'Completion Rate', current: 65, target: 75, predicted: 72, confidence: 75, trend: 'up' as const },
  { id: '3', label: 'Monthly Responses', current: 1250, target: 1500, predicted: 1400, confidence: 82, trend: 'up' as const },
]

const mockPollsActivities = [
  { id: '1', user: 'Research Lead', action: 'created', target: 'Employee Engagement Survey', timestamp: '20m ago', type: 'success' as const },
  { id: '2', user: 'System', action: 'collected', target: '50 new responses', timestamp: '45m ago', type: 'info' as const },
  { id: '3', user: 'Marketing Team', action: 'shared', target: 'survey link to 500 customers', timestamp: '1h ago', type: 'info' as const },
]

// Quick actions defined inline within component for proper state access

// ============================================================================
// SUPABASE POLL TYPE
// ============================================================================

type PollType = 'single-choice' | 'multiple-choice' | 'rating' | 'ranking' | 'open-ended'
type PollStatus = 'draft' | 'active' | 'paused' | 'closed' | 'archived'

interface DbPoll {
  id: string
  user_id: string
  question: string
  description: string | null
  poll_type: PollType
  status: PollStatus
  options: { id: string; text: string }[]
  total_votes: number
  total_voters: number
  views_count: number
  starts_at: string | null
  ends_at: string | null
  is_public: boolean
  created_at: string
  updated_at: string
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function PollsClient() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState('forms')
  const [forms, setForms] = useState<Form[]>(mockForms)
  const [templates] = useState<FormTemplate[]>(mockTemplates)
  const [_selectedForm, _setSelectedForm] = useState<Form | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [_viewMode, _setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedQuestionType, setSelectedQuestionType] = useState<string | null>(null)
  const [settingsTab, setSettingsTab] = useState('general')

  // Database state
  const [dbPolls, setDbPolls] = useState<DbPoll[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Form state for create/edit
  const [formData, setFormData] = useState({
    question: '',
    description: '',
    poll_type: 'single-choice' as PollType,
    status: 'draft' as PollStatus,
    options: [{ id: '1', text: '' }, { id: '2', text: '' }],
    is_public: true,
    starts_at: '',
    ends_at: ''
  })

  // Selected form for viewing
  const [selectedFormForView, setSelectedFormForView] = useState<Form | null>(null)

  // Selected theme
  const [selectedTheme, setSelectedTheme] = useState<string>(mockThemes[0].id)

  // Dialog states for functionality
  const [showWebhookDialog, setShowWebhookDialog] = useState(false)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [showResponseDetailDialog, setShowResponseDetailDialog] = useState(false)
  const [selectedResponseDetail, setSelectedResponseDetail] = useState<{formTitle: string, responseNum: number} | null>(null)

  // Webhook form state
  const [webhookForm, setWebhookForm] = useState({
    url: '',
    triggerEvent: 'submit',
    dataFormat: 'json',
    secret: '',
    isActive: true
  })
  const [savedWebhooks, setSavedWebhooks] = useState<Array<{id: string, url: string, triggerEvent: string, isActive: boolean}>>([])

  // Plan selection state
  const [selectedPlan, setSelectedPlan] = useState<string>('')

  // Quick actions with real functionality
  const pollsQuickActions = useMemo(() => [
    {
      id: '1',
      label: 'New Survey',
      icon: 'Plus',
      shortcut: 'N',
      action: () => {
        setShowCreateDialog(true)
      }
    },
    {
      id: '2',
      label: 'View Results',
      icon: 'BarChart3',
      shortcut: 'R',
      action: () => {
        setActiveTab('responses')
      }
    },
    {
      id: '3',
      label: 'Templates',
      icon: 'Layout',
      shortcut: 'T',
      action: () => {
        setShowTemplateDialog(true)
      }
    },
    {
      id: '4',
      label: 'Export',
      icon: 'Download',
      shortcut: 'E',
      action: () => {
        handleExportResponses()
      }
    },
  ], [])

  // Reset form
  const resetForm = () => {
    setFormData({
      question: '',
      description: '',
      poll_type: 'single-choice',
      status: 'draft',
      options: [{ id: '1', text: '' }, { id: '2', text: '' }],
      is_public: true,
      starts_at: '',
      ends_at: ''
    })
    setSelectedQuestionType(null)
  }

  // Fetch polls from Supabase
  const fetchPolls = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDbPolls(data || [])
    } catch (error) {
      console.error('Error fetching polls:', error)
      toast.error('Failed to load polls')
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Create poll
  const handleCreatePoll = async () => {
    if (!formData.question.trim()) {
      toast.error('Please enter a question')
      return
    }
    try {
      setIsSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to create polls')
        return
      }

      const { error } = await supabase.from('polls').insert({
        user_id: user.id,
        question: formData.question,
        description: formData.description || null,
        poll_type: formData.poll_type,
        status: formData.status,
        options: formData.options.filter(o => o.text.trim()),
        is_public: formData.is_public,
        starts_at: formData.starts_at || null,
        ends_at: formData.ends_at || null
      })

      if (error) throw error

      toast.success('Poll created successfully')
      setShowCreateDialog(false)
      resetForm()
      fetchPolls()
    } catch (error) {
      console.error('Error creating poll:', error)
      toast.error('Failed to create poll')
    } finally {
      setIsSaving(false)
    }
  }

  // Update poll status
  const handleUpdatePollStatus = async (pollId: string, newStatus: PollStatus) => {
    try {
      const { error } = await supabase
        .from('polls')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', pollId)

      if (error) throw error

      toast.success(`Poll ${newStatus === 'active' ? 'activated' : newStatus}`)
      fetchPolls()
    } catch (error) {
      console.error('Error updating poll:', error)
      toast.error('Failed to update poll')
    }
  }

  // Delete poll
  const handleDeletePoll = async (pollId: string) => {
    toast.promise(
      (async () => {
        const { error } = await supabase
          .from('polls')
          .delete()
          .eq('id', pollId)

        if (error) throw error
        fetchPolls()
      })(),
      {
        loading: 'Deleting poll...',
        success: 'Poll deleted successfully',
        error: 'Failed to delete poll'
      }
    )
  }

  // Duplicate poll
  const handleDuplicatePollDb = async (poll: DbPoll) => {
    setIsSaving(true)
    toast.promise(
      (async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Please sign in to duplicate polls')

        const { error } = await supabase.from('polls').insert({
          user_id: user.id,
          question: `${poll.question} (Copy)`,
          description: poll.description,
          poll_type: poll.poll_type,
          status: 'draft',
          options: poll.options,
          is_public: poll.is_public
        })

        if (error) throw error
        fetchPolls()
      })().finally(() => setIsSaving(false)),
      {
        loading: 'Duplicating poll...',
        success: 'Poll duplicated successfully',
        error: 'Failed to duplicate poll'
      }
    )
  }

  // Add option to form
  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { id: String(prev.options.length + 1), text: '' }]
    }))
  }

  // Update option text
  const updateOption = (id: string, text: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map(o => o.id === id ? { ...o, text } : o)
    }))
  }

  // Remove option
  const removeOption = (id: string) => {
    if (formData.options.length <= 2) {
      toast.error('Minimum 2 options required')
      return
    }
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter(o => o.id !== id)
    }))
  }

  // Load polls on mount
  useEffect(() => {
    fetchPolls()
  }, [fetchPolls])

  const filteredForms = useMemo(() => {
    return forms.filter(form => {
      const matchesSearch = form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        form.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || form.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [forms, searchQuery, statusFilter])

  const stats = useMemo(() => ({
    totalForms: forms.length,
    totalResponses: forms.reduce((sum, f) => sum + f.responseCount, 0),
    totalViews: forms.reduce((sum, f) => sum + f.viewCount, 0),
    avgCompletionRate: forms.filter(f => f.responseCount > 0).length > 0
      ? forms.filter(f => f.responseCount > 0).reduce((sum, f) => sum + f.completionRate, 0) /
        forms.filter(f => f.responseCount > 0).length
      : 0,
    activeForms: forms.filter(f => f.status === 'active').length,
    draftForms: forms.filter(f => f.status === 'draft').length
  }), [forms])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
      case 'paused': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'closed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'scheduled': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleExportResponses = async () => {
    try {
      const csvContent = dbPolls.map(p =>
        `"${p.question}","${p.poll_type}","${p.status}","${p.total_votes}","${p.created_at}"`
      ).join('\n')
      const blob = new Blob([`Question,Type,Status,Votes,Created\n${csvContent}`], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'polls-export.csv'
      a.click()
      toast.success('Export completed', { description: 'Polls exported to CSV' })
    } catch {
      toast.error('Export failed')
    }
  }

  const handleShareForm = async (pollId: string) => {
    const url = `${window.location.origin}/polls/${pollId}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Poll share link copied to clipboard')
    } catch {
      toast.error('Failed to copy link')
    }
  }

  // Handle form preview
  const handlePreviewForm = (form: Form) => {
    setSelectedFormForView(form)
    toast.success(`Previewing: ${form.title}`)
  }

  // Handle form edit - opens settings tab
  const handleEditForm = (form: Form) => {
    setSelectedFormForView(form)
    setActiveTab('settings')
    toast.success(`Editing: ${form.title}`)
  }

  // Handle share for mockForms
  const handleShareMockForm = async (form: Form) => {
    const url = `${window.location.origin}/polls/${form.slug}`
    try {
      // Try Web Share API first
      if (navigator.share) {
        await navigator.share({
          title: form.title,
          text: form.description,
          url: url
        })
        toast.success('Poll shared successfully')
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url)
        toast.success('Poll link copied to clipboard')
      }
    } catch (err) {
      // User cancelled share or clipboard failed
      if ((err as Error).name !== 'AbortError') {
        toast.error('Failed to share poll')
      }
    }
  }

  // Handle view results for a form
  const handleViewResults = (form: Form) => {
    setSelectedFormForView(form)
    setActiveTab('analytics')
    toast.success(`Viewing results for: ${form.title}`)
  }

  // Handle form settings
  const handleFormSettings = (form: Form) => {
    setSelectedFormForView(form)
    setActiveTab('settings')
    setSettingsTab('form-defaults')
    toast.success(`Opening settings for: ${form.title}`)
  }

  // Handle duplicate mock form
  const handleDuplicateMockForm = (form: Form) => {
    const duplicatedForm: Form = {
      ...form,
      id: `form-${Date.now()}`,
      title: `${form.title} (Copy)`,
      status: 'draft',
      responseCount: 0,
      viewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setForms(prev => [duplicatedForm, ...prev])
    toast.success(`Duplicated: ${form.title}`)
  }

  // Handle delete mock form
  const handleDeleteMockForm = (form: Form) => {
    if (confirm(`Are you sure you want to delete "${form.title}"? This action cannot be undone.`)) {
      setForms(prev => prev.filter(f => f.id !== form.id))
      toast.success(`Deleted: ${form.title}`)
    }
  }

  // Handle view response details
  const handleViewResponseDetails = (formTitle: string, responseNum: number) => {
    setSelectedResponseDetail({ formTitle, responseNum })
    setShowResponseDetailDialog(true)
  }

  // Integration connection state
  const [integrationStatus, setIntegrationStatus] = useState<Record<string, boolean>>({
    'Google Sheets': true,
    'Slack': true,
    'Zapier': false,
    'Webhooks': true,
    'Mailchimp': false,
    'HubSpot': false
  })

  // Handle integration toggle
  const handleIntegrationToggle = (integrationName: string, isCurrentlyConnected: boolean) => {
    if (isCurrentlyConnected) {
      // Configure - open settings tab for integrations
      setActiveTab('settings')
      setSettingsTab('integrations')
      toast.success(`Configuring ${integrationName}`)
    } else {
      // Connect
      setIntegrationStatus(prev => ({ ...prev, [integrationName]: true }))
      toast.success(`${integrationName} connected successfully!`)
    }
  }

  // Handle theme selection
  const handleThemeSelect = (theme: FormTheme) => {
    setSelectedTheme(theme.id)
    toast.success(`${theme.name} theme set as default`)
  }

  // Handle copy API key
  const handleCopyApiKey = async () => {
    try {
      await navigator.clipboard.writeText('sk_live_xxxxxxxxxxxxxxxxxxxxx')
      toast.success('API key copied to clipboard')
    } catch {
      toast.error('Failed to copy API key')
    }
  }

  // Handle regenerate API key
  const handleRegenerateApiKey = () => {
    if (confirm('Are you sure you want to regenerate your API key? Your old key will stop working immediately.')) {
      toast.success('New API key generated successfully')
    }
  }

  // Handle add webhook
  const handleAddWebhook = () => {
    setShowWebhookDialog(true)
  }

  // Handle save webhook
  const handleSaveWebhook = () => {
    if (!webhookForm.url.trim()) {
      toast.error('Please enter a webhook URL')
      return
    }
    const newWebhook = {
      id: `webhook-${Date.now()}`,
      url: webhookForm.url,
      triggerEvent: webhookForm.triggerEvent,
      isActive: webhookForm.isActive
    }
    setSavedWebhooks(prev => [...prev, newWebhook])
    setWebhookForm({ url: '', triggerEvent: 'submit', dataFormat: 'json', secret: '', isActive: true })
    toast.success('Webhook endpoint created successfully')
  }

  // Handle delete webhook
  const handleDeleteWebhook = (webhookId: string) => {
    setSavedWebhooks(prev => prev.filter(w => w.id !== webhookId))
    toast.success('Webhook deleted')
  }

  // Handle manage subscription
  const handleManageSubscription = () => {
    setActiveTab('settings')
    setSettingsTab('advanced')
  }

  // Handle upgrade plan
  const handleUpgradePlan = () => {
    setShowUpgradeDialog(true)
  }

  // Handle plan selection and upgrade
  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId)
  }

  // Handle confirm upgrade
  const handleConfirmUpgrade = () => {
    if (!selectedPlan) {
      toast.error('Please select a plan')
      return
    }
    const planNames: Record<string, string> = {
      'basic': 'Basic',
      'professional': 'Professional',
      'enterprise': 'Enterprise'
    }
    toast.success(`Successfully upgraded to ${planNames[selectedPlan]} plan!`)
    setShowUpgradeDialog(false)
    setSelectedPlan('')
  }

  // Handle delete all responses
  const handleDeleteAllResponses = () => {
    if (confirm('Are you sure you want to delete ALL responses? This action cannot be undone.')) {
      setForms(prev => prev.map(f => ({ ...f, responseCount: 0, viewCount: 0, completionRate: 0 })))
      toast.success('All responses deleted permanently')
    }
  }

  // Handle reset workspace
  const handleResetWorkspace = () => {
    if (confirm('Are you sure you want to reset your workspace? This will delete all forms and data. This action cannot be undone.')) {
      setForms([])
      setDbPolls([])
      toast.success('Workspace reset complete')
    }
  }

  // Handle delete account
  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action is permanent and cannot be undone.')) {
      toast.error('Account deletion requires email confirmation. Check your inbox.')
    }
  }

  // Handle use template
  const handleUseTemplate = (template: FormTemplate) => {
    const newForm: Form = {
      id: `form-${Date.now()}`,
      title: template.name,
      description: template.description,
      slug: `${template.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      status: 'draft',
      questions: template.questions,
      theme: mockThemes[0],
      settings: {
        showProgressBar: true,
        showQuestionNumbers: true,
        allowBackNavigation: true,
        shuffleQuestions: false,
        limitResponses: false,
        closeOnDate: false,
        notifyOnResponse: false,
        notifyEmails: [],
        sendConfirmationEmail: false,
        redirectOnComplete: false,
        passwordProtected: false
      },
      responseCount: 0,
      viewCount: 0,
      completionRate: 0,
      averageTime: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      workspace: 'Default',
      createdBy: { id: 'user-1', name: 'Current User', avatar: '/avatars/default.jpg' }
    }
    setForms(prev => [newForm, ...prev])
    setShowTemplateDialog(false)
    toast.success(`Template applied! Form "${template.name}" ready to customize`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/30 to-cyan-50/40 dark:bg-none dark:bg-gray-900">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white">
        <div className="max-w-[1800px] mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <ClipboardList className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Forms & Surveys</h1>
                  <div className="flex items-center gap-2 text-emerald-100 text-sm">
                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium">Typeform Level</span>
                    <span>•</span>
                    <span>Beautiful forms that people enjoy filling out</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowTemplateDialog(true)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium backdrop-blur-sm transition-colors flex items-center gap-2"
              >
                <Layers className="w-4 h-4" />
                Templates
              </button>
              <button
                onClick={() => setShowCreateDialog(true)}
                className="px-4 py-2 bg-white hover:bg-gray-50 text-emerald-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Form
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-6 gap-4">
            {[
              { label: 'Total Forms', value: stats.totalForms, icon: ClipboardList, change: `${stats.activeForms} active` },
              { label: 'Total Responses', value: stats.totalResponses.toLocaleString(), icon: UserCheck, change: '+127 today' },
              { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: Eye, change: '+542 today' },
              { label: 'Avg Completion', value: `${stats.avgCompletionRate.toFixed(1)}%`, icon: Target, change: '+2.3%' },
              { label: 'Active Forms', value: stats.activeForms, icon: Play, change: 'Collecting' },
              { label: 'Draft Forms', value: stats.draftForms, icon: Edit2, change: 'In progress' }
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className="w-4 h-4 text-emerald-200" />
                  <span className="text-sm text-emerald-100">{stat.label}</span>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-emerald-200 mt-1">{stat.change}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-white dark:bg-gray-800 shadow-sm">
              <TabsTrigger value="forms" className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                My Forms
              </TabsTrigger>
              <TabsTrigger value="responses" className="flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Responses
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="integrations" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Integrations
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search forms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="paused">Paused</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Forms Tab */}
          <TabsContent value="forms" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredForms.map(form => (
                <div
                  key={form.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all group"
                >
                  {/* Form Header with Theme Preview */}
                  <div
                    className="h-24 p-4 flex items-end justify-between"
                    style={{ backgroundColor: form.theme.backgroundColor }}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(form.status)}`}>
                        {form.status}
                      </span>
                      {form.settings.passwordProtected && (
                        <Lock className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <button onClick={() => handlePreviewForm(form)} className="p-1.5 bg-white/80 hover:bg-white rounded-lg shadow-sm">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button onClick={() => handleEditForm(form)} className="p-1.5 bg-white/80 hover:bg-white rounded-lg shadow-sm">
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button onClick={() => handleShareMockForm(form)} className="p-1.5 bg-white/80 hover:bg-white rounded-lg shadow-sm">
                        <Share2 className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Form Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">{form.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{form.description}</p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="text-lg font-bold text-emerald-600">{form.responseCount}</div>
                        <div className="text-xs text-gray-500">Responses</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{form.completionRate.toFixed(0)}%</div>
                        <div className="text-xs text-gray-500">Completion</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">{formatDuration(form.averageTime)}</div>
                        <div className="text-xs text-gray-500">Avg Time</div>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {form.createdBy.name.charAt(0)}
                        </div>
                        <span>{form.createdBy.name}</span>
                      </div>
                      <span>{formatDate(form.updatedAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleViewResults(form)} className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        Results
                      </button>
                      <button onClick={() => handleFormSettings(form)} className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        Settings
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDuplicateMockForm(form)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="Duplicate form">
                        <Copy className="w-4 h-4 text-gray-400" />
                      </button>
                      <button onClick={() => handleDeleteMockForm(form)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="Delete form">
                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Create New Form Card */}
              <button
                onClick={() => setShowCreateDialog(true)}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-dashed border-gray-200 dark:border-gray-700 p-8 flex flex-col items-center justify-center gap-4 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all min-h-[300px]"
              >
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                  <Plus className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900 dark:text-white">Create New Poll</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Start from scratch or use a template</p>
                </div>
              </button>
            </div>

            {/* Database Polls Section */}
            {dbPolls.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-emerald-600" />
                  Your Polls ({dbPolls.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dbPolls.map(poll => (
                    <div key={poll.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={getStatusColor(poll.status)}>{poll.status}</Badge>
                          <span className="text-xs text-gray-500">{poll.poll_type}</span>
                        </div>
                        <h4 className="font-semibold mb-1 line-clamp-2">{poll.question}</h4>
                        {poll.description && (
                          <p className="text-sm text-gray-500 line-clamp-1 mb-3">{poll.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {poll.total_voters} voters
                          </span>
                          <span className="flex items-center gap-1">
                            <BarChart3 className="w-4 h-4" />
                            {poll.total_votes} votes
                          </span>
                        </div>
                      </div>
                      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {poll.status === 'draft' && (
                            <Button size="sm" variant="ghost" onClick={() => handleUpdatePollStatus(poll.id, 'active')}>
                              <Play className="w-4 h-4 mr-1" /> Publish
                            </Button>
                          )}
                          {poll.status === 'active' && (
                            <Button size="sm" variant="ghost" onClick={() => handleUpdatePollStatus(poll.id, 'paused')}>
                              <Pause className="w-4 h-4 mr-1" /> Pause
                            </Button>
                          )}
                          {poll.status === 'paused' && (
                            <Button size="sm" variant="ghost" onClick={() => handleUpdatePollStatus(poll.id, 'active')}>
                              <Play className="w-4 h-4 mr-1" /> Resume
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" onClick={() => handleShareForm(poll.id)}>
                            <Share2 className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDuplicatePollDb(poll)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDeletePoll(poll.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredForms.length === 0 && dbPolls.length === 0 && (
              <div className="text-center py-12">
                <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No polls found</h3>
                <p className="text-gray-500">Create your first poll to get started</p>
              </div>
            )}
          </TabsContent>

          {/* Responses Tab */}
          <TabsContent value="responses" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Recent Responses</h2>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleExportResponses} className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Export All
                    </Button>
                    <Button variant="outline" onClick={fetchPolls} disabled={isLoading} className="flex items-center gap-2">
                      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {forms.filter(f => f.responseCount > 0).slice(0, 5).flatMap(form => [1, 2, 3].map((_, i) => (
                  <div key={`${form.id}-${i}`} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-medium">
                          R
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">Response #{form.responseCount - i}</span>
                            <span className="text-sm text-gray-500">to</span>
                            <span className="text-sm font-medium text-emerald-600">{form.title}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatDuration(120 + i * 30)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Globe className="w-4 h-4" />
                              Desktop
                            </span>
                            <span>2 hours ago</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => handleViewResponseDetails(form.title, form.responseCount - i)} className="px-3 py-1.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                )))}
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  Response Trends
                </h3>
                <div className="h-48 flex items-end justify-between gap-2">
                  {[35, 52, 45, 78, 62, 85, 70].map((value, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className="w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t transition-all"
                        style={{ height: `${value}%` }}
                      />
                      <span className="text-xs text-gray-500">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-purple-600" />
                  Completion by Device
                </h3>
                <div className="flex items-center justify-center gap-8">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="50" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                      <circle cx="64" cy="64" r="50" stroke="#10b981" strokeWidth="12" fill="none"
                        strokeDasharray={`${65 * 3.14} ${100 * 3.14}`} />
                      <circle cx="64" cy="64" r="50" stroke="#8b5cf6" strokeWidth="12" fill="none"
                        strokeDasharray={`${25 * 3.14} ${100 * 3.14}`}
                        strokeDashoffset={`-${65 * 3.14}`} />
                    </svg>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded" />
                      <span className="text-sm">Desktop - 65%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded" />
                      <span className="text-sm">Mobile - 25%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-300 rounded" />
                      <span className="text-sm">Tablet - 10%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Drop-off Analysis
                </h3>
                <div className="space-y-3">
                  {mockQuestions.slice(1, 6).map((q, i) => {
                    const dropOff = 100 - (i * 15)
                    return (
                      <div key={q.id}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="truncate flex-1">{q.title}</span>
                          <span className="font-medium">{dropOff}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${dropOff > 70 ? 'bg-green-500' : dropOff > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${dropOff}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Top Performing Forms
                </h3>
                <div className="space-y-3">
                  {forms.sort((a, b) => b.completionRate - a.completionRate).slice(0, 4).map((form, i) => (
                    <div key={form.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <span className="w-6 h-6 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{form.title}</p>
                        <p className="text-xs text-gray-500">{form.responseCount} responses</p>
                      </div>
                      <span className="text-sm font-bold text-emerald-600">{form.completionRate.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'Google Sheets', description: 'Sync responses to Google Sheets automatically', icon: '📊' },
                { name: 'Slack', description: 'Get notified in Slack for new responses', icon: '💬' },
                { name: 'Zapier', description: 'Connect to 5000+ apps with Zapier', icon: '⚡' },
                { name: 'Webhooks', description: 'Send data to your custom endpoints', icon: '🔗' },
                { name: 'Mailchimp', description: 'Add respondents to your mailing lists', icon: '📧' },
                { name: 'HubSpot', description: 'Create leads from form submissions', icon: '🎯' }
              ].map((integration, i) => {
                const isConnected = integrationStatus[integration.name] ?? false
                return (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl">{integration.icon}</div>
                      {isConnected ? (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded">
                          Connected
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded">
                          Not Connected
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold mb-1">{integration.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{integration.description}</p>
                    <button onClick={() => handleIntegrationToggle(integration.name, isConnected)} className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                      isConnected
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}>
                      {isConnected ? 'Configure' : 'Connect'}
                    </button>
                  </div>
                )
              })}
            </div>
          </TabsContent>

          {/* Settings Tab - SurveyMonkey Level */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3 space-y-2">
                <nav className="space-y-1">
                  {[
                    { id: 'general', label: 'General', icon: Settings },
                    { id: 'form-defaults', label: 'Form Defaults', icon: ClipboardList },
                    { id: 'notifications', label: 'Notifications', icon: Bell },
                    { id: 'branding', label: 'Branding', icon: Palette },
                    { id: 'integrations', label: 'Integrations', icon: Webhook },
                    { id: 'advanced', label: 'Advanced', icon: Sliders }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSettingsTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                        settingsTab === item.id
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-medium'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  ))}
                </nav>

                {/* Survey Stats */}
                <Card className="mt-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Survey Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Total Responses</span>
                      <Badge variant="secondary">{stats.totalResponses.toLocaleString()}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Completion Rate</span>
                      <span className="text-sm font-medium text-emerald-600">{stats.avgCompletionRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Active Forms</span>
                      <span className="text-sm font-medium">{stats.activeForms}</span>
                    </div>
                    <Progress value={stats.avgCompletionRate} className="h-2 mt-2" />
                    <p className="text-xs text-gray-500 mt-1">Overall completion rate</p>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="w-5 h-5 text-emerald-600" />
                          General Settings
                        </CardTitle>
                        <CardDescription>Configure your survey workspace settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Workspace Name</Label>
                            <Input defaultValue="My Survey Workspace" />
                            <p className="text-xs text-gray-500">Name visible to team members</p>
                          </div>
                          <div className="space-y-2">
                            <Label>Default Language</Label>
                            <Select defaultValue="en">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Spanish</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                                <SelectItem value="de">German</SelectItem>
                                <SelectItem value="pt">Portuguese</SelectItem>
                                <SelectItem value="ja">Japanese</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Time Zone</Label>
                            <Select defaultValue="utc">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="utc">UTC (Coordinated Universal Time)</SelectItem>
                                <SelectItem value="est">Eastern Time (EST/EDT)</SelectItem>
                                <SelectItem value="pst">Pacific Time (PST/PDT)</SelectItem>
                                <SelectItem value="cet">Central European Time (CET)</SelectItem>
                                <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Date Format</Label>
                            <Select defaultValue="mdy">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                                <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                                <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Auto-save Drafts</p>
                            <p className="text-sm text-gray-500">Automatically save form changes</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Public Profile</p>
                            <p className="text-sm text-gray-500">Allow respondents to view your profile</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="w-5 h-5 text-blue-600" />
                          Localization
                        </CardTitle>
                        <CardDescription>Multi-language and regional settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Multi-language Support</p>
                            <p className="text-sm text-gray-500">Enable translations for surveys</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Auto-detect Language</p>
                            <p className="text-sm text-gray-500">Show surveys in respondent's language</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">RTL Support</p>
                            <p className="text-sm text-gray-500">Enable right-to-left text direction</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Form Defaults Settings */}
                {settingsTab === 'form-defaults' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ClipboardList className="w-5 h-5 text-emerald-600" />
                          Default Form Settings
                        </CardTitle>
                        <CardDescription>Configure default behavior for new forms</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Show Progress Bar</p>
                            <p className="text-sm text-gray-500">Display progress indicator to respondents</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Show Question Numbers</p>
                            <p className="text-sm text-gray-500">Number each question automatically</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Allow Back Navigation</p>
                            <p className="text-sm text-gray-500">Let respondents go back to previous questions</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Required by Default</p>
                            <p className="text-sm text-gray-500">Make new questions required automatically</p>
                          </div>
                          <Switch />
                        </div>

                        <div className="grid grid-cols-2 gap-6 pt-4">
                          <div className="space-y-2">
                            <Label>Default Animation</Label>
                            <Select defaultValue="slide">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="slide">Slide</SelectItem>
                                <SelectItem value="fade">Fade</SelectItem>
                                <SelectItem value="none">None</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Progress Bar Position</Label>
                            <Select defaultValue="top">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="top">Top</SelectItem>
                                <SelectItem value="bottom">Bottom</SelectItem>
                                <SelectItem value="none">Hidden</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-purple-600" />
                          Response Collection
                        </CardTitle>
                        <CardDescription>Default settings for collecting responses</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Allow Multiple Responses</p>
                            <p className="text-sm text-gray-500">Let same person respond multiple times</p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Save Partial Responses</p>
                            <p className="text-sm text-gray-500">Store incomplete survey submissions</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Anonymous Responses</p>
                            <p className="text-sm text-gray-500">Don't collect identifying information</p>
                          </div>
                          <Switch />
                        </div>

                        <div className="space-y-2 pt-4">
                          <Label>Default Response Limit</Label>
                          <Input type="number" placeholder="Unlimited" />
                          <p className="text-xs text-gray-500">Leave empty for unlimited responses</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-amber-500" />
                          Email Notifications
                        </CardTitle>
                        <CardDescription>Configure email alerts for responses</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">New Response Notifications</p>
                            <p className="text-sm text-gray-500">Get notified for each new submission</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Daily Digest</p>
                            <p className="text-sm text-gray-500">Receive daily summary of responses</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Weekly Report</p>
                            <p className="text-sm text-gray-500">Get weekly analytics summary</p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Completion Milestone Alerts</p>
                            <p className="text-sm text-gray-500">Notify at 100, 500, 1000 responses</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="space-y-2 pt-4">
                          <Label>Notification Email</Label>
                          <Input type="email" placeholder="team@company.com" defaultValue="team@company.com" />
                          <p className="text-xs text-gray-500">Where to send email notifications</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Mail className="w-5 h-5 text-blue-600" />
                          Respondent Emails
                        </CardTitle>
                        <CardDescription>Email settings for survey respondents</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Confirmation Emails</p>
                            <p className="text-sm text-gray-500">Send confirmation when form is submitted</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Response Copy</p>
                            <p className="text-sm text-gray-500">Send respondent a copy of their answers</p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Reminder Emails</p>
                            <p className="text-sm text-gray-500">Send reminders for incomplete surveys</p>
                          </div>
                          <Switch />
                        </div>

                        <div className="space-y-2 pt-4">
                          <Label>Custom Sender Name</Label>
                          <Input placeholder="Your Company Name" />
                          <p className="text-xs text-gray-500">Name shown in From field</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-purple-600" />
                          Smart Alerts
                        </CardTitle>
                        <CardDescription>AI-powered notification triggers</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Low Score Alert</p>
                            <p className="text-sm text-gray-500">Alert when NPS or rating is below threshold</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Sentiment Detection</p>
                            <p className="text-sm text-gray-500">Alert for negative text responses</p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Drop-off Alert</p>
                            <p className="text-sm text-gray-500">Notify when completion rate drops</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Branding Settings */}
                {settingsTab === 'branding' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Palette className="w-5 h-5 text-pink-600" />
                          Brand Identity
                        </CardTitle>
                        <CardDescription>Customize forms with your brand</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <Label>Logo Upload</Label>
                          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                            <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Drag and drop or click to upload</p>
                            <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Primary Color</Label>
                            <div className="flex gap-2">
                              <Input type="color" defaultValue="#10b981" className="w-16 h-10 p-1" />
                              <Input defaultValue="#10b981" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Secondary Color</Label>
                            <div className="flex gap-2">
                              <Input type="color" defaultValue="#0ea5e9" className="w-16 h-10 p-1" />
                              <Input defaultValue="#0ea5e9" />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Brand Font</Label>
                          <Select defaultValue="inter">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="inter">Inter</SelectItem>
                              <SelectItem value="poppins">Poppins</SelectItem>
                              <SelectItem value="roboto">Roboto</SelectItem>
                              <SelectItem value="opensans">Open Sans</SelectItem>
                              <SelectItem value="lato">Lato</SelectItem>
                              <SelectItem value="montserrat">Montserrat</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Remove Powered By</p>
                            <p className="text-sm text-gray-500">Hide branding on forms (Pro feature)</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Layout className="w-5 h-5 text-indigo-600" />
                          Default Theme
                        </CardTitle>
                        <CardDescription>Set default theme for new forms</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-4 gap-4">
                          {mockThemes.map(theme => (
                            <button
                              key={theme.id}
                              onClick={() => handleThemeSelect(theme)}
                              className={`p-3 border rounded-lg transition-all ${selectedTheme === theme.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-emerald-500'}`}
                            >
                              <div
                                className="h-20 rounded-lg mb-2"
                                style={{ backgroundColor: theme.backgroundColor }}
                              />
                              <p className="text-sm font-medium text-center">{theme.name}</p>
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Link className="w-5 h-5 text-cyan-600" />
                          Custom Domain
                        </CardTitle>
                        <CardDescription>Use your own domain for surveys</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Custom Domain</Label>
                          <Input placeholder="surveys.yourdomain.com" />
                          <p className="text-xs text-gray-500">Point your CNAME to surveys.platform.com</p>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600" />
                            <div>
                              <p className="font-medium text-amber-800 dark:text-amber-400">SSL Certificate</p>
                              <p className="text-sm text-amber-600 dark:text-amber-500">Auto-provisioned after domain verification</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="border-amber-500 text-amber-600">Pending</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Webhook className="w-5 h-5 text-orange-600" />
                          Webhooks
                        </CardTitle>
                        <CardDescription>Send form data to external services</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Webhook URL</Label>
                          <Input placeholder="https://your-service.com/webhook" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Trigger Event</Label>
                            <Select defaultValue="submit">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="submit">On Submit</SelectItem>
                                <SelectItem value="start">On Start</SelectItem>
                                <SelectItem value="complete">On Complete</SelectItem>
                                <SelectItem value="abandon">On Abandon</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Data Format</Label>
                            <Select defaultValue="json">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="json">JSON</SelectItem>
                                <SelectItem value="form">Form Data</SelectItem>
                                <SelectItem value="xml">XML</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <Button variant="outline" className="w-full" onClick={handleAddWebhook}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Webhook Endpoint
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="w-5 h-5 text-violet-600" />
                          API Access
                        </CardTitle>
                        <CardDescription>Manage API keys and access tokens</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <div className="flex gap-2">
                            <Input type="password" value="STRIPE_KEY_PLACEHOLDER" readOnly />
                            <Button variant="outline" onClick={handleCopyApiKey}>
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" onClick={handleRegenerateApiKey}>
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500">Use this key to authenticate API requests</p>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">API Access</p>
                            <p className="text-sm text-gray-500">Enable programmatic access to forms</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="space-y-2">
                          <Label>Rate Limit</Label>
                          <Select defaultValue="1000">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="100">100 requests/minute</SelectItem>
                              <SelectItem value="1000">1,000 requests/minute</SelectItem>
                              <SelectItem value="10000">10,000 requests/minute</SelectItem>
                              <SelectItem value="unlimited">Unlimited</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Code className="w-5 h-5 text-gray-600" />
                          Embed Settings
                        </CardTitle>
                        <CardDescription>Configure embedded form behavior</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Allow Embedding</p>
                            <p className="text-sm text-gray-500">Let forms be embedded on external sites</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="space-y-2">
                          <Label>Allowed Domains</Label>
                          <Input placeholder="yourdomain.com, subdomain.yourdomain.com" />
                          <p className="text-xs text-gray-500">Comma-separated list of allowed domains</p>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Popup Mode</p>
                            <p className="text-sm text-gray-500">Enable popup/modal form display</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-green-600" />
                          Security Settings
                        </CardTitle>
                        <CardDescription>Protect your forms and data</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">CAPTCHA Protection</p>
                            <p className="text-sm text-gray-500">Prevent spam submissions</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Honeypot Fields</p>
                            <p className="text-sm text-gray-500">Hidden anti-bot protection</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">IP Tracking</p>
                            <p className="text-sm text-gray-500">Log respondent IP addresses</p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Data Encryption</p>
                            <p className="text-sm text-gray-500">Encrypt responses at rest</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <HardDrive className="w-5 h-5 text-blue-600" />
                          Data Management
                        </CardTitle>
                        <CardDescription>Response storage and retention</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Data Retention Period</Label>
                          <Select defaultValue="forever">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 days</SelectItem>
                              <SelectItem value="90">90 days</SelectItem>
                              <SelectItem value="365">1 year</SelectItem>
                              <SelectItem value="forever">Forever</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-500">Auto-delete responses after this period</p>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">GDPR Compliance Mode</p>
                            <p className="text-sm text-gray-500">Enable GDPR-compliant data handling</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Data Export Format</p>
                            <p className="text-sm text-gray-500">Default format for exports</p>
                          </div>
                          <Select defaultValue="csv">
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="csv">CSV</SelectItem>
                              <SelectItem value="xlsx">Excel</SelectItem>
                              <SelectItem value="json">JSON</SelectItem>
                              <SelectItem value="pdf">PDF</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Button variant="outline" className="w-full" onClick={handleExportResponses}>
                          <Download className="w-4 h-4 mr-2" />
                          Export All Data
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-indigo-600" />
                          Subscription & Billing
                        </CardTitle>
                        <CardDescription>Manage your plan and payments</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                          <div>
                            <p className="font-medium text-emerald-800 dark:text-emerald-400">Professional Plan</p>
                            <p className="text-sm text-emerald-600 dark:text-emerald-500">Unlimited forms • 10,000 responses/mo</p>
                          </div>
                          <Badge className="bg-emerald-600">Active</Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <p className="text-2xl font-bold text-emerald-600">{stats.totalForms}</p>
                            <p className="text-xs text-gray-500">Forms Created</p>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <p className="text-2xl font-bold text-blue-600">{stats.totalResponses.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">Responses Used</p>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <p className="text-2xl font-bold text-purple-600">87%</p>
                            <p className="text-xs text-gray-500">Quota Used</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1" onClick={handleManageSubscription}>
                            Manage Subscription
                          </Button>
                          <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={handleUpgradePlan}>
                            Upgrade Plan
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-red-200 dark:border-red-900">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertOctagon className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                        <CardDescription>Irreversible actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Delete All Responses</p>
                            <p className="text-sm text-red-600 dark:text-red-500">Remove all response data permanently</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={handleDeleteAllResponses}>Delete All</Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Reset Workspace</p>
                            <p className="text-sm text-red-600 dark:text-red-500">Delete all forms and start fresh</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={handleResetWorkspace}>Reset</Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Delete Account</p>
                            <p className="text-sm text-red-600 dark:text-red-500">Permanently delete your account</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>Delete Account</Button>
                        </div>
                      </CardContent>
                    </Card>
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
              insights={mockPollsAIInsights}
              title="Survey Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockPollsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockPollsPredictions}
              title="Response Rate Forecast"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockPollsActivities}
            title="Survey Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={pollsQuickActions}
            variant="grid"
          />
        </div>
      </div>

      {/* Create Form Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => { setShowCreateDialog(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Create New Poll</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-120px)]">
            <div className="space-y-6 p-1">
              {/* Poll Details */}
              <div className="space-y-4">
                <div>
                  <Label>Poll Question *</Label>
                  <Input
                    value={formData.question}
                    onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                    placeholder="What would you like to ask?"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Add context for your poll..."
                    className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
                  />
                </div>
              </div>

              {/* Poll Type */}
              <div>
                <Label>Poll Type</Label>
                <Select value={formData.poll_type} onValueChange={(v: PollType) => setFormData(prev => ({ ...prev, poll_type: v }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single-choice">Single Choice</SelectItem>
                    <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                    <SelectItem value="rating">Rating Scale</SelectItem>
                    <SelectItem value="ranking">Ranking</SelectItem>
                    <SelectItem value="open-ended">Open Ended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Options */}
              {(formData.poll_type === 'single-choice' || formData.poll_type === 'multiple-choice') && (
                <div>
                  <Label>Options</Label>
                  <div className="space-y-2 mt-2">
                    {formData.options.map((opt, idx) => (
                      <div key={opt.id} className="flex gap-2">
                        <Input
                          value={opt.text}
                          onChange={(e) => updateOption(opt.id, e.target.value)}
                          placeholder={`Option ${idx + 1}`}
                        />
                        <Button variant="ghost" size="icon" onClick={() => removeOption(opt.id)} disabled={formData.options.length <= 2}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addOption} className="mt-2">
                      <Plus className="w-4 h-4 mr-1" /> Add Option
                    </Button>
                  </div>
                </div>
              )}

              {/* Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v: PollStatus) => setFormData(prev => ({ ...prev, status: v }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch
                    checked={formData.is_public}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: checked }))}
                  />
                  <Label>Public Poll</Label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePoll} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
                  {isSaving ? 'Creating...' : 'Create Poll'}
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Templates Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Form Templates</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-120px)]">
            <div className="grid grid-cols-3 gap-4 p-1">
              {templates.map(template => (
                <div
                  key={template.id}
                  className="bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="h-32 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <ClipboardList className="w-12 h-12 text-white group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded">
                        {template.category}
                      </span>
                      <span className="text-xs text-gray-500">{template.questionsCount} questions</span>
                    </div>
                    <h3 className="font-semibold mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{template.description}</p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-xs text-gray-500">{template.usageCount.toLocaleString()} uses</span>
                      <button onClick={() => handleUseTemplate(template)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg">
                        Use Template
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Webhook Management Dialog */}
      <Dialog open={showWebhookDialog} onOpenChange={setShowWebhookDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Webhook className="w-5 h-5 text-orange-600" />
              Webhook Management
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-120px)]">
            <div className="space-y-6 p-1">
              {/* Existing Webhooks */}
              {savedWebhooks.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Active Webhooks</Label>
                  {savedWebhooks.map(webhook => (
                    <div key={webhook.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${webhook.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <div>
                          <p className="text-sm font-medium truncate max-w-[300px]">{webhook.url}</p>
                          <p className="text-xs text-gray-500">Trigger: {webhook.triggerEvent}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteWebhook(webhook.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Webhook Form */}
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-medium">Add New Webhook</h4>

                <div className="space-y-2">
                  <Label>Webhook URL *</Label>
                  <Input
                    value={webhookForm.url}
                    onChange={(e) => setWebhookForm(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://your-service.com/webhook"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Trigger Event</Label>
                    <Select
                      value={webhookForm.triggerEvent}
                      onValueChange={(v) => setWebhookForm(prev => ({ ...prev, triggerEvent: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="submit">On Form Submit</SelectItem>
                        <SelectItem value="start">On Form Start</SelectItem>
                        <SelectItem value="complete">On Form Complete</SelectItem>
                        <SelectItem value="abandon">On Form Abandon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Data Format</Label>
                    <Select
                      value={webhookForm.dataFormat}
                      onValueChange={(v) => setWebhookForm(prev => ({ ...prev, dataFormat: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="form">Form Data</SelectItem>
                        <SelectItem value="xml">XML</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Secret Key (Optional)</Label>
                  <Input
                    type="password"
                    value={webhookForm.secret}
                    onChange={(e) => setWebhookForm(prev => ({ ...prev, secret: e.target.value }))}
                    placeholder="Used for request signing"
                  />
                  <p className="text-xs text-gray-500">This key will be used to sign webhook payloads</p>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={webhookForm.isActive}
                    onCheckedChange={(checked) => setWebhookForm(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label>Enable webhook immediately</Label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowWebhookDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveWebhook} className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Webhook
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Upgrade Plan Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              Upgrade Your Plan
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-120px)]">
            <div className="space-y-6 p-1">
              <p className="text-gray-500">Choose the plan that best fits your needs</p>

              <div className="grid grid-cols-3 gap-4">
                {/* Basic Plan */}
                <div
                  className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedPlan === 'basic'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'
                  }`}
                  onClick={() => handleSelectPlan('basic')}
                >
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold">Basic</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">$19</span>
                      <span className="text-gray-500">/month</span>
                    </div>
                  </div>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Up to 5 forms</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>1,000 responses/month</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Basic analytics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Email support</span>
                    </li>
                  </ul>
                </div>

                {/* Professional Plan */}
                <div
                  className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedPlan === 'professional'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'
                  }`}
                  onClick={() => handleSelectPlan('professional')}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-emerald-600">Most Popular</Badge>
                  </div>
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold">Professional</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">$49</span>
                      <span className="text-gray-500">/month</span>
                    </div>
                  </div>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Unlimited forms</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>10,000 responses/month</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Advanced analytics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Custom branding</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Priority support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Webhooks & API access</span>
                    </li>
                  </ul>
                </div>

                {/* Enterprise Plan */}
                <div
                  className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedPlan === 'enterprise'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'
                  }`}
                  onClick={() => handleSelectPlan('enterprise')}
                >
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold">Enterprise</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">$149</span>
                      <span className="text-gray-500">/month</span>
                    </div>
                  </div>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Everything in Pro</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Unlimited responses</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Custom domain</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>SSO/SAML</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Dedicated support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>SLA guarantee</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Payment Method */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium mb-3">Payment Method</h4>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label>Card Number</Label>
                    <Input placeholder="4242 4242 4242 4242" className="mt-1" />
                  </div>
                  <div className="w-24">
                    <Label>Expiry</Label>
                    <Input placeholder="MM/YY" className="mt-1" />
                  </div>
                  <div className="w-20">
                    <Label>CVC</Label>
                    <Input placeholder="123" className="mt-1" />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => { setShowUpgradeDialog(false); setSelectedPlan(''); }}>
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmUpgrade}
                  disabled={!selectedPlan}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Response Details Dialog */}
      <Dialog open={showResponseDetailDialog} onOpenChange={setShowResponseDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              Response Details
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-120px)]">
            {selectedResponseDetail && (
              <div className="space-y-6 p-1">
                {/* Response Header */}
                <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <div>
                    <h3 className="font-semibold">{selectedResponseDetail.formTitle}</h3>
                    <p className="text-sm text-gray-500">Response #{selectedResponseDetail.responseNum}</p>
                  </div>
                  <Badge className="bg-emerald-600">Completed</Badge>
                </div>

                {/* Response Meta */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <Clock className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                    <p className="text-sm font-medium">3m 24s</p>
                    <p className="text-xs text-gray-500">Duration</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <Globe className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                    <p className="text-sm font-medium">Desktop</p>
                    <p className="text-xs text-gray-500">Device</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <Calendar className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                    <p className="text-sm font-medium">Today</p>
                    <p className="text-xs text-gray-500">Submitted</p>
                  </div>
                </div>

                {/* Response Answers */}
                <div className="space-y-4">
                  <h4 className="font-medium">Answers</h4>

                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">What is your name?</p>
                    <p className="font-medium">John Smith</p>
                  </div>

                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">What is your email address?</p>
                    <p className="font-medium">john.smith@example.com</p>
                  </div>

                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">How did you hear about us?</p>
                    <p className="font-medium">Social Media</p>
                  </div>

                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">How likely are you to recommend us? (NPS)</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-emerald-600">9</span>
                      <span className="text-sm text-gray-500">/ 10</span>
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 ml-2">Promoter</Badge>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Overall experience rating</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-5 h-5 ${star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                      ))}
                      <span className="ml-2 text-sm font-medium">4/5</span>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Additional feedback</p>
                    <p className="font-medium">Great service, really enjoyed the experience. Would definitely recommend to friends and family!</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="w-4 h-4 mr-2" />
                      Send Copy
                    </Button>
                  </div>
                  <Button variant="outline" onClick={() => setShowResponseDetailDialog(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
