'use client'

import { useState, useMemo } from 'react'
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
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
  Archive,
  CheckCircle2,
  Circle,
  Star,
  MessageSquare,
  Image,
  Video,
  FileText,
  Link,
  Calendar,
  Clock,
  Globe,
  Lock,
  Settings,
  Palette,
  Zap,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  GripVertical,
  X,
  Check,
  AlertCircle,
  Sparkles,
  Layout,
  Type,
  Hash,
  ToggleLeft,
  ListOrdered,
  Smile,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Percent,
  Mail,
  ExternalLink,
  Download,
  RefreshCw,
  Target,
  Award,
  Gift,
  Layers,
  Workflow,
  Code,
  Send,
  UserCheck
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
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

// ============================================================================
// COMPONENT
// ============================================================================

export default function PollsClient() {
  const [activeTab, setActiveTab] = useState('forms')
  const [forms, setForms] = useState<Form[]>(mockForms)
  const [templates] = useState<FormTemplate[]>(mockTemplates)
  const [selectedForm, setSelectedForm] = useState<Form | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedQuestionType, setSelectedQuestionType] = useState<string | null>(null)

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
                      <button className="p-1.5 bg-white/80 hover:bg-white rounded-lg shadow-sm">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-1.5 bg-white/80 hover:bg-white rounded-lg shadow-sm">
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-1.5 bg-white/80 hover:bg-white rounded-lg shadow-sm">
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
                      <button className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        Results
                      </button>
                      <button className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        Settings
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <Copy className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
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
                  <p className="font-semibold text-gray-900 dark:text-white">Create New Form</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Start from scratch or use a template</p>
                </div>
              </button>
            </div>

            {filteredForms.length === 0 && (
              <div className="text-center py-12">
                <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No forms found</h3>
                <p className="text-gray-500">Try adjusting your search or create a new form</p>
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
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Export All
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </button>
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
                      <button className="px-3 py-1.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors">
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
                { name: 'Google Sheets', description: 'Sync responses to Google Sheets automatically', icon: '📊', connected: true },
                { name: 'Slack', description: 'Get notified in Slack for new responses', icon: '💬', connected: true },
                { name: 'Zapier', description: 'Connect to 5000+ apps with Zapier', icon: '⚡', connected: false },
                { name: 'Webhooks', description: 'Send data to your custom endpoints', icon: '🔗', connected: true },
                { name: 'Mailchimp', description: 'Add respondents to your mailing lists', icon: '📧', connected: false },
                { name: 'HubSpot', description: 'Create leads from form submissions', icon: '🎯', connected: false }
              ].map((integration, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{integration.icon}</div>
                    {integration.connected ? (
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
                  <button className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                    integration.connected
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}>
                    {integration.connected ? 'Configure' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Form Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Create New Form</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-120px)]">
            <div className="space-y-6 p-1">
              {/* Form Details */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Form Title</label>
                  <input
                    type="text"
                    placeholder="Enter form title..."
                    className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Describe your form..."
                    className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  />
                </div>
              </div>

              {/* Question Types */}
              <div>
                <h4 className="font-medium mb-3">Add Questions</h4>
                <div className="grid grid-cols-3 gap-3">
                  {questionTypes.map(qt => (
                    <button
                      key={qt.type}
                      onClick={() => setSelectedQuestionType(qt.type)}
                      className={`p-4 text-left border rounded-lg hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all ${
                        selectedQuestionType === qt.type
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <qt.icon className="w-5 h-5 text-emerald-600 mb-2" />
                      <p className="font-medium text-sm">{qt.label}</p>
                      <p className="text-xs text-gray-500">{qt.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Selection */}
              <div>
                <h4 className="font-medium mb-3">Choose Theme</h4>
                <div className="grid grid-cols-4 gap-3">
                  {mockThemes.map(theme => (
                    <button
                      key={theme.id}
                      className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-emerald-500 transition-all"
                    >
                      <div
                        className="h-16 rounded-lg mb-2"
                        style={{ backgroundColor: theme.backgroundColor }}
                      />
                      <p className="text-sm font-medium">{theme.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowCreateDialog(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  Cancel
                </button>
                <button className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium">
                  Create Form
                </button>
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
                      <button className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg">
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
    </div>
  )
}
