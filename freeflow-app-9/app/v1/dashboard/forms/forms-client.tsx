'use client'

import { useState, useMemo, useCallback } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useForms, type Form, type FormStatus, type FormType } from '@/lib/hooks/use-forms'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  CollapsibleInsightsPanel,
  InsightsToggleButton,
  useInsightsPanel
} from '@/components/ui/collapsible-insights-panel'
import {
  FileText, Plus, Search, Eye, Edit3, Copy, Trash2, Share2, Settings,
  BarChart3, Users, Clock, CheckCircle, XCircle, ChevronDown,
  Type, List, Hash, Star, Calendar, Upload, ToggleLeft, AlignLeft, MessageSquare,
  Image as ImageIcon, Link2, Mail, Phone, CreditCard,
  Play, Pause, Archive, ExternalLink, Code, Zap, Bell, Download,
  TrendingUp, PieChart, Activity, Target, Sparkles, Wand2, Palette,
  Layout, Grid3X3, Smartphone, Monitor, Globe, Lock, RefreshCw,
  MousePointer, CircleDot, MoreVertical, Send, Webhook, Database, GitBranch, Shuffle,
  Timer, Gauge, Sliders, ListChecks, FileUp, Save, AlertOctagon, Loader2
} from 'lucide-react'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface QuestionType {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  category: 'text' | 'choice' | 'rating' | 'date' | 'file' | 'contact' | 'payment' | 'layout'
  isPremium: boolean
}

interface FormQuestion {
  id: string
  formId: string
  type: string
  title: string
  description?: string
  required: boolean
  order: number
  options?: string[]
  settings: Record<string, any>
  logicJumps?: LogicJump[]
}

interface LogicJump {
  id: string
  condition: string
  value: string
  targetQuestionId: string
}

interface FormTemplate {
  id: string
  name: string
  description: string
  icon: string
  category: string
  questions: number
  color: string
  uses: number
  isPremium: boolean
}

interface FormResponse {
  id: string
  formId: string
  formTitle: string
  respondentEmail?: string
  submittedAt: Date
  completionTime: number
  answers: Record<string, any>
  metadata: {
    device: 'desktop' | 'mobile' | 'tablet'
    browser: string
    location?: string
  }
}

interface Integration {
  id: string
  name: string
  icon: string
  description: string
  connected: boolean
  category: 'notification' | 'storage' | 'crm' | 'automation' | 'payment'
  responsesSynced?: number
}

interface FormTheme {
  id: string
  name: string
  primaryColor: string
  backgroundColor: string
  fontFamily: string
  isCustom: boolean
}

interface FormWorkspace {
  id: string
  name: string
  formCount: number
  memberCount: number
  createdAt: Date
}

interface FormAnalytics {
  views: number
  starts: number
  completions: number
  completionRate: number
  avgCompletionTime: number
  dropOffPoints: { questionId: string; dropOffRate: number }[]
  deviceBreakdown: { device: string; percentage: number }[]
  dailyResponses: { date: string; count: number }[]
}

interface Webhook {
  id: string
  url: string
  events: string[]
  status: 'active' | 'inactive'
  createdAt: Date
}

interface ApiLog {
  id: string
  time: Date
  method: string
  endpoint: string
  status: number
  duration: string
}

// ============================================================================
// STATIC DATA
// ============================================================================

const questionTypes: QuestionType[] = [
  { id: 'short_text', name: 'Short Text', icon: <Type className="w-5 h-5" />, description: 'Single line answer', category: 'text', isPremium: false },
  { id: 'long_text', name: 'Long Text', icon: <AlignLeft className="w-5 h-5" />, description: 'Multi-line answer', category: 'text', isPremium: false },
  { id: 'email', name: 'Email', icon: <Mail className="w-5 h-5" />, description: 'Email address', category: 'contact', isPremium: false },
  { id: 'phone', name: 'Phone', icon: <Phone className="w-5 h-5" />, description: 'Phone number', category: 'contact', isPremium: false },
  { id: 'website', name: 'Website', icon: <Globe className="w-5 h-5" />, description: 'URL input', category: 'contact', isPremium: false },
  { id: 'multiple_choice', name: 'Multiple Choice', icon: <CircleDot className="w-5 h-5" />, description: 'Select one option', category: 'choice', isPremium: false },
  { id: 'checkboxes', name: 'Checkboxes', icon: <ListChecks className="w-5 h-5" />, description: 'Select multiple', category: 'choice', isPremium: false },
  { id: 'dropdown', name: 'Dropdown', icon: <ChevronDown className="w-5 h-5" />, description: 'Select from list', category: 'choice', isPremium: false },
  { id: 'picture_choice', name: 'Picture Choice', icon: <ImageIcon className="w-5 h-5" />, description: 'Visual options', category: 'choice', isPremium: true },
  { id: 'yes_no', name: 'Yes/No', icon: <ToggleLeft className="w-5 h-5" />, description: 'Binary choice', category: 'choice', isPremium: false },
  { id: 'opinion_scale', name: 'Opinion Scale', icon: <Sliders className="w-5 h-5" />, description: '0-10 scale', category: 'rating', isPremium: false },
  { id: 'star_rating', name: 'Star Rating', icon: <Star className="w-5 h-5" />, description: '1-5 stars', category: 'rating', isPremium: false },
  { id: 'nps', name: 'NPS', icon: <TrendingUp className="w-5 h-5" />, description: 'Net Promoter Score', category: 'rating', isPremium: false },
  { id: 'ranking', name: 'Ranking', icon: <ListChecks className="w-5 h-5" />, description: 'Order items', category: 'rating', isPremium: true },
  { id: 'date', name: 'Date', icon: <Calendar className="w-5 h-5" />, description: 'Date picker', category: 'date', isPremium: false },
  { id: 'file_upload', name: 'File Upload', icon: <FileUp className="w-5 h-5" />, description: 'Upload files', category: 'file', isPremium: false },
  { id: 'payment', name: 'Payment', icon: <CreditCard className="w-5 h-5" />, description: 'Collect payments', category: 'payment', isPremium: true },
  { id: 'statement', name: 'Statement', icon: <MessageSquare className="w-5 h-5" />, description: 'Info block', category: 'layout', isPremium: false },
  { id: 'welcome_screen', name: 'Welcome Screen', icon: <Sparkles className="w-5 h-5" />, description: 'Form intro', category: 'layout', isPremium: false },
  { id: 'ending_screen', name: 'Ending Screen', icon: <CheckCircle className="w-5 h-5" />, description: 'Thank you', category: 'layout', isPremium: false },
]

const formTemplates: FormTemplate[] = [
  { id: '1', name: 'Contact Form', description: 'Simple contact form with name, email, and message', icon: '📬', category: 'Basic', questions: 5, color: 'from-blue-500 to-cyan-500', uses: 12400, isPremium: false },
  { id: '2', name: 'Customer Feedback', description: 'Collect product and service feedback', icon: '💬', category: 'Feedback', questions: 8, color: 'from-purple-500 to-pink-500', uses: 8900, isPremium: false },
  { id: '3', name: 'Event Registration', description: 'Register attendees for events', icon: '🎫', category: 'Events', questions: 12, color: 'from-green-500 to-emerald-500', uses: 6500, isPremium: false },
  { id: '4', name: 'Job Application', description: 'Streamline your hiring process', icon: '💼', category: 'HR', questions: 15, color: 'from-orange-500 to-red-500', uses: 5200, isPremium: false },
  { id: '5', name: 'Product Survey', description: 'Gather product insights and preferences', icon: '📊', category: 'Survey', questions: 10, color: 'from-indigo-500 to-purple-500', uses: 7800, isPremium: false },
  { id: '6', name: 'NPS Survey', description: 'Measure Net Promoter Score', icon: '⭐', category: 'Survey', questions: 3, color: 'from-yellow-500 to-orange-500', uses: 15600, isPremium: false },
  { id: '7', name: 'Lead Generation', description: 'Capture and qualify leads', icon: '🎯', category: 'Marketing', questions: 7, color: 'from-rose-500 to-pink-500', uses: 9200, isPremium: true },
  { id: '8', name: 'Quiz', description: 'Create interactive quizzes', icon: '🧠', category: 'Quiz', questions: 10, color: 'from-teal-500 to-cyan-500', uses: 4300, isPremium: true },
]

const integrations: Integration[] = [
  { id: '1', name: 'Slack', icon: '💬', description: 'Get notified on submissions', connected: false, category: 'notification' },
  { id: '2', name: 'Google Sheets', icon: '📊', description: 'Sync responses to sheets', connected: false, category: 'storage' },
  { id: '3', name: 'Mailchimp', icon: '✉️', description: 'Add to email lists', connected: false, category: 'crm' },
  { id: '4', name: 'Zapier', icon: '⚡', description: 'Connect 5000+ apps', connected: false, category: 'automation' },
  { id: '5', name: 'Stripe', icon: '💳', description: 'Accept payments', connected: false, category: 'payment' },
  { id: '6', name: 'HubSpot', icon: '🧡', description: 'CRM integration', connected: false, category: 'crm' },
  { id: '7', name: 'Webhooks', icon: '🔗', description: 'Custom integrations', connected: false, category: 'automation' },
  { id: '8', name: 'Notion', icon: '📝', description: 'Sync to databases', connected: false, category: 'storage' },
  { id: '9', name: 'Airtable', icon: '📋', description: 'Powerful spreadsheets', connected: false, category: 'storage' },
  { id: '10', name: 'Salesforce', icon: '☁️', description: 'Enterprise CRM', connected: false, category: 'crm' },
]

const formThemes: FormTheme[] = [
  { id: '1', name: 'Default', primaryColor: '#6366f1', backgroundColor: '#ffffff', fontFamily: 'Inter', isCustom: false },
  { id: '2', name: 'Dark Mode', primaryColor: '#8b5cf6', backgroundColor: '#1f2937', fontFamily: 'Inter', isCustom: false },
  { id: '3', name: 'Ocean', primaryColor: '#0ea5e9', backgroundColor: '#f0f9ff', fontFamily: 'Poppins', isCustom: false },
  { id: '4', name: 'Forest', primaryColor: '#10b981', backgroundColor: '#f0fdf4', fontFamily: 'Nunito', isCustom: false },
  { id: '5', name: 'Sunset', primaryColor: '#f97316', backgroundColor: '#fff7ed', fontFamily: 'Roboto', isCustom: false },
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStatusColor = (status: FormStatus): string => {
  const colors: Record<FormStatus, string> = {
    draft: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300',
    active: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400',
    paused: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
    closed: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400',
    archived: 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-700 dark:text-gray-400',
  }
  return colors[status] || colors.draft
}

const getStatusIcon = (status: FormStatus) => {
  const icons: Record<FormStatus, React.ReactNode> = {
    draft: <Edit3 className="w-3 h-3" />,
    active: <Play className="w-3 h-3" />,
    paused: <Pause className="w-3 h-3" />,
    closed: <XCircle className="w-3 h-3" />,
    archived: <Archive className="w-3 h-3" />,
  }
  return icons[status] || icons.draft
}

const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
}

const formatDate = (date: Date | string): string => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const formatRelativeTime = (date: Date | string): string => {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays < 7) return `${diffDays} days ago`
  return formatDate(d)
}

// ============================================================================
// REAL DATA UTILITIES - CSV/JSON Generation
// ============================================================================

function generateCSV(data: Record<string, any>[], filename: string): void {
  if (data.length === 0) {
    toast.error('No data to export')
    return
  }

  const headers = Object.keys(data[0])
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header]
        if (value === null || value === undefined) return ''
        if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return String(value)
      }).join(',')
    )
  ]

  const csvContent = csvRows.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, `${filename}.csv`)
}

function generateJSON(data: any, filename: string): void {
  const jsonContent = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json' })
  downloadBlob(blob, `${filename}.json`)
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function FormsClient({ initialForms }: { initialForms: Form[] }) {
  const supabase = createClient()

  // Helper to safely get window origin (SSR-safe)
  const getOrigin = () => {
    return typeof window !== 'undefined' ? window.location.origin : ''
  }

  // UI State
  const [activeTab, setActiveTab] = useState('dashboard')
  const [settingsTab, setSettingsTab] = useState('general')
  const [statusFilter, setStatusFilter] = useState<FormStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<FormType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedForm, setSelectedForm] = useState<Form | null>(null)

  // Dialog States
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false)
  const [showQuestionTypesDialog, setShowQuestionTypesDialog] = useState(false)
  const [showThemesDialog, setShowThemesDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [showResponseDetailDialog, setShowResponseDetailDialog] = useState(false)
  const [showIntegrationDialog, setShowIntegrationDialog] = useState(false)
  const [showWebhookDialog, setShowWebhookDialog] = useState(false)
  const [showVerifyDomainDialog, setShowVerifyDomainDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showDeleteAllResponsesDialog, setShowDeleteAllResponsesDialog] = useState(false)
  const [showDeleteWorkspaceDialog, setShowDeleteWorkspaceDialog] = useState(false)
  const [showApiLogsDialog, setShowApiLogsDialog] = useState(false)
  const [showFormActionsDialog, setShowFormActionsDialog] = useState(false)
  const [showCustomThemeDialog, setShowCustomThemeDialog] = useState(false)
  const [showEditFormDialog, setShowEditFormDialog] = useState(false)
  const [showWebhookOptionsDialog, setShowWebhookOptionsDialog] = useState(false)
  const [showQRCodeDialog, setShowQRCodeDialog] = useState(false)

  // Form/Edit States
  const [editFormData, setEditFormData] = useState<{ title: string; description: string; status: FormStatus }>({ title: '', description: '', status: 'draft' })
  const [newFormTitle, setNewFormTitle] = useState('')
  const [newFormDescription, setNewFormDescription] = useState('')
  const [customDomain, setCustomDomain] = useState('')
  const [newWebhookUrl, setNewWebhookUrl] = useState('')
  const [newWebhookEvents, setNewWebhookEvents] = useState<string[]>(['submission.created'])
  const [selectedTheme, setSelectedTheme] = useState<FormTheme | null>(null)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null)
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null)

  // Local Data State (managed in component)
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [connectedIntegrations, setConnectedIntegrations] = useState<Set<string>>(new Set())
  const [formResponses, setFormResponses] = useState<FormResponse[]>([])
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([])
  const [customThemes, setCustomThemes] = useState<FormTheme[]>([])
  const [apiKey, setApiKey] = useState<string>('')

  // Export Dialog State
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx' | 'json' | 'pdf'>('csv')
  const [exportDateRange, setExportDateRange] = useState<'all' | '7d' | '30d' | '90d'>('all')
  const [exportIncludeMetadata, setExportIncludeMetadata] = useState(true)

  // Loading States
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditSubmitting, setIsEditSubmitting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isVerifyingDomain, setIsVerifyingDomain] = useState(false)
  const [isDeletingResponses, setIsDeletingResponses] = useState(false)
  const [isDeletingWorkspace, setIsDeletingWorkspace] = useState(false)
  const [isRegeneratingKey, setIsRegeneratingKey] = useState(false)
  const [isDisconnectingIntegration, setIsDisconnectingIntegration] = useState(false)
  const [isDeletingWebhook, setIsDeletingWebhook] = useState(false)
  const [isLoadingResponses, setIsLoadingResponses] = useState(false)

  // Insights Panel Hook
  const insightsPanel = useInsightsPanel(false)

  // Supabase Hook
  const { forms, loading, error, createForm, updateForm, deleteForm, mutating, refetch } = useForms({
    status: statusFilter === 'all' ? undefined : statusFilter,
    formType: typeFilter === 'all' ? undefined : typeFilter,
    limit: 50
  })

  const displayForms = forms.length > 0 ? forms : initialForms

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const stats = useMemo(() => {
    const filtered = displayForms.filter(f => statusFilter === 'all' || f.status === statusFilter)
    const total = filtered.length
    const active = filtered.filter(f => f.status === 'active').length
    const totalSubmissions = filtered.reduce((acc, f) => acc + (f.total_submissions || 0), 0)
    const totalViews = filtered.reduce((acc, f) => acc + (f.total_views || 0), 0)
    const avgCompletionRate = total > 0 ? filtered.reduce((acc, f) => acc + (f.completion_rate || 0), 0) / total : 0
    const totalQuestions = filtered.reduce((acc, f) => acc + (f.field_count || 0), 0)
    const avgTimeToComplete = 3.2
    const responsesThisWeek = Math.floor(totalSubmissions * 0.15)

    return {
      total,
      active,
      totalSubmissions,
      totalViews,
      avgCompletionRate,
      totalQuestions,
      avgTimeToComplete,
      responsesThisWeek,
      conversionRate: totalViews > 0 ? (totalSubmissions / totalViews) * 100 : 0,
    }
  }, [displayForms, statusFilter])

  const filteredForms = useMemo(() => {
    return displayForms.filter(f => {
      const matchesSearch = !searchQuery ||
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || f.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [displayForms, searchQuery, statusFilter])

  // ============================================================================
  // REAL DATA FETCHING FUNCTIONS
  // ============================================================================

  const fetchFormResponses = useCallback(async (formId: string) => {
    setIsLoadingResponses(true)
    try {
      const { data, error } = await supabase
        .from('form_submissions')
        .select('*')
        .eq('form_id', formId)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error

      const responses: FormResponse[] = (data || []).map((item: any) => ({
        id: item.id,
        formId: item.form_id,
        formTitle: selectedForm?.title || 'Unknown Form',
        respondentEmail: item.respondent_email,
        submittedAt: new Date(item.created_at),
        completionTime: item.completion_time || 0,
        answers: item.answers || {},
        metadata: {
          device: item.device || 'desktop',
          browser: item.browser || 'Unknown',
          location: item.location
        }
      }))

      setFormResponses(responses)
    } catch (err) {
      console.error('Error fetching responses:', err)
      // Return empty array on error but don't show toast - may just be no data
      setFormResponses([])
    } finally {
      setIsLoadingResponses(false)
    }
  }, [supabase, selectedForm?.title])

  const fetchWebhooks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('webhooks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const webhookData: Webhook[] = (data || []).map((item: any) => ({
        id: item.id,
        url: item.url,
        events: item.events || [],
        status: item.is_active ? 'active' : 'inactive',
        createdAt: new Date(item.created_at)
      }))

      setWebhooks(webhookData)
    } catch (err) {
      console.error('Error fetching webhooks:', err)
      setWebhooks([])
    }
  }, [supabase])

  const fetchApiLogs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('api_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      const logs: ApiLog[] = (data || []).map((item: any) => ({
        id: item.id,
        time: new Date(item.created_at),
        method: item.method,
        endpoint: item.endpoint,
        status: item.status_code,
        duration: `${item.duration_ms}ms`
      }))

      setApiLogs(logs)
    } catch (err) {
      console.error('Error fetching API logs:', err)
      setApiLogs([])
    }
  }, [supabase])

  const fetchApiKey = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_api_keys')
        .select('api_key')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      setApiKey(data?.api_key || '')
    } catch (err) {
      console.error('Error fetching API key:', err)
    }
  }, [supabase])

  // ============================================================================
  // FORM CRUD HANDLERS
  // ============================================================================

  const handleCreateForm = async () => {
    if (!newFormTitle.trim()) {
      toast.error('Please enter a form title')
      return
    }

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      await createForm({
        user_id: user.id,
        title: newFormTitle.trim(),
        description: newFormDescription.trim() || null,
        form_type: 'custom' as FormType,
        status: 'draft' as FormStatus,
        fields: [],
        field_count: 0,
        sections: [],
        allow_multiple_submissions: false,
        require_authentication: false,
        allow_save_draft: true,
        show_progress_bar: true,
        validation_rules: {},
        required_fields: [],
        total_submissions: 0,
        total_views: 0,
        total_started: 0,
        total_completed: 0,
        completion_rate: 0,
        average_completion_time: 0,
        is_public: false,
        password_protected: false,
        theme: 'default',
        analytics_enabled: true,
        track_source: true,
        track_location: false,
        tags: [],
        metadata: {},
        send_confirmation_email: false
      })

      toast.success(`Form "${newFormTitle}" created successfully`)
      setNewFormTitle('')
      setNewFormDescription('')
      setShowCreateDialog(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to create form')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePublishForm = async (form: Form) => {
    try {
      await updateForm(form.id, { status: 'active' as FormStatus })
      toast.success(`"${form.title}" is now live`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to publish form')
    }
  }

  const handleDuplicateForm = async (form: Form) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { id, created_at, updated_at, deleted_at, ...rest } = form
      await createForm({
        ...rest,
        user_id: user.id,
        title: `${form.title} (Copy)`,
        status: 'draft' as FormStatus
      })
      toast.success(`"${form.title}" duplicated successfully`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to duplicate form')
    }
  }

  const handleDeleteForm = async (form: Form) => {
    try {
      await deleteForm(form.id)
      toast.success('Form deleted successfully')
      setSelectedForm(null)
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete form')
    }
  }

  const handleOpenEditDialog = (form: Form) => {
    setSelectedForm(form)
    setEditFormData({
      title: form.title,
      description: form.description || '',
      status: form.status
    })
    setShowEditFormDialog(true)
  }

  const handleEditForm = async () => {
    if (!selectedForm || !editFormData.title.trim()) {
      toast.error('Form title is required')
      return
    }

    setIsEditSubmitting(true)
    try {
      await updateForm(selectedForm.id, {
        title: editFormData.title.trim(),
        description: editFormData.description.trim() || null,
        status: editFormData.status
      })
      toast.success(`"${editFormData.title}" updated successfully`)
      setShowEditFormDialog(false)
      setSelectedForm(null)
      setEditFormData({ title: '', description: '', status: 'draft' })
    } catch (err: any) {
      toast.error(err.message || 'Failed to update form')
    } finally {
      setIsEditSubmitting(false)
    }
  }

  // ============================================================================
  // EXPORT HANDLERS - Real CSV/JSON Generation
  // ============================================================================

  const handleExportResponses = async (form: Form) => {
    setIsExporting(true)
    try {
      // Fetch real responses from database
      const { data, error } = await supabase
        .from('form_submissions')
        .select('*')
        .eq('form_id', form.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const responses = data || []

      if (responses.length === 0) {
        toast.info('No responses to export for this form')
        return
      }

      const exportData = responses.map((r: any) => ({
        id: r.id,
        email: r.respondent_email || 'Anonymous',
        submitted_at: new Date(r.created_at).toISOString(),
        completion_time: r.completion_time ? `${r.completion_time}s` : 'N/A',
        device: r.device || 'Unknown',
        ...r.answers
      }))

      const filename = `${form.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-responses-${new Date().toISOString().split('T')[0]}`

      if (exportFormat === 'csv') {
        generateCSV(exportData, filename)
      } else {
        generateJSON({ form: { id: form.id, title: form.title }, responses: exportData, exportedAt: new Date().toISOString() }, filename)
      }

      toast.success(`Exported ${responses.length} responses`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to export responses')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      // Filter by date range
      let dateFilter: Date | null = null
      if (exportDateRange === '7d') dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      else if (exportDateRange === '30d') dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      else if (exportDateRange === '90d') dateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

      // Fetch forms
      let formsQuery = supabase.from('forms').select('*')
      if (dateFilter) {
        formsQuery = formsQuery.gte('created_at', dateFilter.toISOString())
      }
      const { data: formsData, error: formsError } = await formsQuery

      if (formsError) throw formsError

      // Fetch all responses for these forms
      const formIds = (formsData || []).map((f: any) => f.id)
      let responsesData: any[] = []

      if (formIds.length > 0) {
        let responsesQuery = supabase.from('form_submissions').select('*').in('form_id', formIds)
        if (dateFilter) {
          responsesQuery = responsesQuery.gte('created_at', dateFilter.toISOString())
        }
        const { data, error: responsesError } = await responsesQuery

        if (responsesError) throw responsesError
        responsesData = data || []
      }

      const exportPayload = {
        forms: (formsData || []).map((f: any) => ({
          id: f.id,
          title: f.title,
          status: f.status,
          form_type: f.form_type,
          total_submissions: f.total_submissions,
          total_views: f.total_views,
          completion_rate: f.completion_rate,
          created_at: f.created_at
        })),
        responses: responsesData.map((r: any) => ({
          id: r.id,
          form_id: r.form_id,
          respondent_email: r.respondent_email,
          submitted_at: r.created_at,
          completion_time: r.completion_time,
          ...(exportIncludeMetadata ? { device: r.device, browser: r.browser, location: r.location } : {}),
          answers: r.answers
        })),
        exportedAt: new Date().toISOString(),
        dateRange: exportDateRange
      }

      const filename = `forms-export-${new Date().toISOString().split('T')[0]}`

      if (exportFormat === 'csv') {
        // For CSV, export forms and responses separately
        if (exportPayload.forms.length > 0) {
          generateCSV(exportPayload.forms, `${filename}-forms`)
        }
        if (exportPayload.responses.length > 0) {
          generateCSV(exportPayload.responses.map(r => ({
            ...r,
            answers: JSON.stringify(r.answers)
          })), `${filename}-responses`)
        }
      } else {
        generateJSON(exportPayload, filename)
      }

      toast.success('Export completed')
      setShowExportDialog(false)
    } catch (err: any) {
      toast.error(err.message || 'Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportAllForms = async () => {
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const exportData = {
        forms: data || [],
        exportedAt: new Date().toISOString(),
        version: '1.0'
      }

      generateJSON(exportData, `forms-backup-${new Date().toISOString().split('T')[0]}`)
      toast.success(`Exported ${(data || []).length} forms`)
    } catch (err: any) {
      toast.error(err.message || 'Export failed')
    }
  }

  const handleExportApiLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('api_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500)

      if (error) throw error

      const logs = (data || []).map((log: any) => ({
        time: new Date(log.created_at).toISOString(),
        method: log.method,
        endpoint: log.endpoint,
        status: log.status_code,
        duration: `${log.duration_ms}ms`
      }))

      generateCSV(logs, `api-logs-${new Date().toISOString().split('T')[0]}`)
      toast.success(`Exported ${logs.length} log entries`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to export logs')
    }
  }

  // ============================================================================
  // IMPORT HANDLER
  // ============================================================================

  const handleImportForms = async (file: File) => {
    try {
      const text = await file.text()
      const data = JSON.parse(text)

      if (!data.forms || !Array.isArray(data.forms)) {
        throw new Error('Invalid import file format')
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let importedCount = 0
      for (const form of data.forms) {
        const { id, created_at, updated_at, deleted_at, user_id, ...formData } = form
        try {
          await createForm({
            ...formData,
            user_id: user.id,
            title: `${formData.title} (Imported)`,
            status: 'draft' as FormStatus
          })
          importedCount++
        } catch (e) {
          console.error('Failed to import form:', formData.title, e)
        }
      }

      toast.success(`Imported ${importedCount} of ${data.forms.length} forms`)
      setShowImportDialog(false)
      refetch()
    } catch (err: any) {
      toast.error(err.message || 'Import failed - invalid file format')
    }
  }

  // ============================================================================
  // SHARE HANDLERS
  // ============================================================================

  const handleShareForm = async (form: Form) => {
    const shareUrl = `${getOrigin()}/forms/${form.id}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Share link copied to clipboard')
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      toast.info(`Share URL: ${shareUrl}`)
    }
  }

  const handleCopyShareLink = async () => {
    if (!selectedForm) return
    const shareUrl = `${getOrigin()}/forms/${selectedForm.id}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard')
    } catch (err) {
      toast.info(`Share URL: ${shareUrl}`)
    }
  }

  // ============================================================================
  // API KEY HANDLERS
  // ============================================================================

  const handleCopyApiKey = async () => {
    if (!apiKey) {
      toast.info('No API key found. Generate one first.')
      return
    }
    try {
      await navigator.clipboard.writeText(apiKey)
      toast.success('API key copied to clipboard')
    } catch (err) {
      toast.info(`API Key: ${apiKey.slice(0, 8)}...`)
    }
  }

  const handleRegenerateApiKey = async () => {
    setIsRegeneratingKey(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Generate new API key
      const newKey = `ff_${crypto.randomUUID().replace(/-/g, '')}`

      // Upsert the key
      const { error } = await supabase
        .from('user_api_keys')
        .upsert({
          user_id: user.id,
          api_key: newKey,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })

      if (error) throw error

      setApiKey(newKey)
      await navigator.clipboard.writeText(newKey)
      toast.success('New API key generated and copied to clipboard')
    } catch (err: any) {
      toast.error(err.message || 'Failed to regenerate API key')
    } finally {
      setIsRegeneratingKey(false)
    }
  }

  // ============================================================================
  // WEBHOOK HANDLERS
  // ============================================================================

  const handleAddWebhook = async () => {
    if (!newWebhookUrl.trim()) {
      toast.error('Please enter a webhook URL')
      return
    }

    try {
      new URL(newWebhookUrl) // Validate URL
    } catch {
      toast.error('Please enter a valid URL')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('webhooks')
        .insert({
          user_id: user.id,
          form_id: selectedForm?.id || null,
          url: newWebhookUrl.trim(),
          events: newWebhookEvents,
          is_active: true
        })
        .select()
        .single()

      if (error) throw error

      const newWebhook: Webhook = {
        id: data.id,
        url: data.url,
        events: data.events,
        status: 'active',
        createdAt: new Date(data.created_at)
      }

      setWebhooks(prev => [newWebhook, ...prev])
      toast.success('Webhook added successfully')
      setNewWebhookUrl('')
      setNewWebhookEvents(['submission.created'])
      setShowWebhookDialog(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to add webhook')
    }
  }

  const handleDeleteWebhook = async () => {
    if (!selectedWebhook) return

    setIsDeletingWebhook(true)
    try {
      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', selectedWebhook.id)

      if (error) throw error

      setWebhooks(prev => prev.filter(w => w.id !== selectedWebhook.id))
      toast.success('Webhook deleted')
      setShowWebhookOptionsDialog(false)
      setSelectedWebhook(null)
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete webhook')
    } finally {
      setIsDeletingWebhook(false)
    }
  }

  const handleWebhookOptions = (webhook: Webhook) => {
    setSelectedWebhook(webhook)
    setShowWebhookOptionsDialog(true)
  }

  // ============================================================================
  // DOMAIN VERIFICATION
  // ============================================================================

  const handleVerifyDomain = async () => {
    if (!customDomain.trim()) {
      toast.error('Please enter a domain')
      return
    }

    setIsVerifyingDomain(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Store domain verification request
      const { error } = await supabase
        .from('domain_verifications')
        .insert({
          user_id: user.id,
          domain: customDomain.trim().toLowerCase(),
          status: 'pending',
          verification_token: crypto.randomUUID()
        })

      if (error) throw error

      toast.success('Domain verification initiated. Add the DNS record to verify.')
      setShowVerifyDomainDialog(false)
      setCustomDomain('')
    } catch (err: any) {
      toast.error(err.message || 'Domain verification failed')
    } finally {
      setIsVerifyingDomain(false)
    }
  }

  // ============================================================================
  // RESPONSE MANAGEMENT
  // ============================================================================

  const handleDeleteAllResponses = async () => {
    if (!selectedForm) return

    setIsDeletingResponses(true)
    try {
      const { error } = await supabase
        .from('form_submissions')
        .delete()
        .eq('form_id', selectedForm.id)

      if (error) throw error

      // Update form stats
      await updateForm(selectedForm.id, {
        total_submissions: 0,
        total_completed: 0,
        total_started: 0,
        completion_rate: 0
      })

      setFormResponses([])
      toast.success('All responses deleted')
      setShowDeleteAllResponsesDialog(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete responses')
    } finally {
      setIsDeletingResponses(false)
    }
  }

  const handleViewResponse = (response: FormResponse) => {
    setSelectedResponse(response)
    setShowResponseDetailDialog(true)
  }

  // ============================================================================
  // WORKSPACE MANAGEMENT
  // ============================================================================

  const handleDeleteWorkspace = async () => {
    setIsDeletingWorkspace(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Delete all user's forms
      const { error } = await supabase
        .from('forms')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error

      toast.success('Workspace data deleted')
      setShowDeleteWorkspaceDialog(false)
      refetch()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete workspace')
    } finally {
      setIsDeletingWorkspace(false)
    }
  }

  // ============================================================================
  // INTEGRATION HANDLERS
  // ============================================================================

  const handleConnectIntegration = async (integration: Integration) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('integrations')
        .insert({
          user_id: user.id,
          integration_name: integration.name,
          integration_id: integration.id,
          category: integration.category,
          is_connected: true,
          config: {}
        })

      if (error) throw error

      setConnectedIntegrations(prev => new Set([...prev, integration.id]))
      toast.success(`${integration.name} connected successfully`)
      setShowIntegrationDialog(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to connect integration')
    }
  }

  const handleDisconnectIntegration = async () => {
    if (!selectedIntegration) return

    setIsDisconnectingIntegration(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('integrations')
        .delete()
        .eq('user_id', user.id)
        .eq('integration_id', selectedIntegration.id)

      if (error) throw error

      setConnectedIntegrations(prev => {
        const next = new Set(prev)
        next.delete(selectedIntegration.id)
        return next
      })
      toast.success(`${selectedIntegration.name} disconnected`)
      setShowIntegrationDialog(false)
      setSelectedIntegration(null)
    } catch (err: any) {
      toast.error(err.message || 'Failed to disconnect integration')
    } finally {
      setIsDisconnectingIntegration(false)
    }
  }

  // ============================================================================
  // VISIBILITY & SETTINGS
  // ============================================================================

  const handleChangeVisibility = async () => {
    if (!selectedForm) return
    try {
      await updateForm(selectedForm.id, { is_public: !selectedForm.is_public })
      toast.success(`Form is now ${selectedForm.is_public ? 'private' : 'public'}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update visibility')
    }
  }

  const handleBrowseFiles = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/png,image/jpeg,image/svg+xml'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/logo-${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('form-assets')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('form-assets')
          .getPublicUrl(fileName)

        if (selectedForm) {
          await updateForm(selectedForm.id, { logo_url: publicUrl })
        }

        toast.success('Logo uploaded successfully')
      } catch (err: any) {
        toast.error(err.message || 'Failed to upload logo')
      }
    }
    input.click()
  }

  const handleApplyTheme = async (theme: FormTheme, context: 'settings' | 'form') => {
    try {
      if (context === 'settings') {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            default_form_theme: theme.id,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' })

        toast.success(`"${theme.name}" is now your default theme`)
      } else if (context === 'form' && selectedForm) {
        await updateForm(selectedForm.id, {
          theme: theme.id,
          primary_color: theme.primaryColor
        })
        toast.success(`"${theme.name}" applied to "${selectedForm.title}"`)
        setShowThemesDialog(false)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to apply theme')
    }
  }

  // ============================================================================
  // QR CODE HANDLERS
  // ============================================================================

  const handleGenerateQRCode = () => {
    setShowQRCodeDialog(true)
  }

  const handleCopyQRCode = async () => {
    const formUrl = `${getOrigin()}/forms/${selectedForm?.id || ''}`
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(formUrl)}`

    try {
      const response = await fetch(qrCodeUrl)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      toast.success('QR code copied to clipboard')
    } catch (err) {
      // Fallback - copy URL instead
      await navigator.clipboard.writeText(qrCodeUrl)
      toast.success('QR code URL copied')
    }
  }

  const handleDownloadQRCode = async () => {
    const formUrl = `${getOrigin()}/forms/${selectedForm?.id || ''}`
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(formUrl)}`

    try {
      const response = await fetch(qrCodeUrl)
      const blob = await response.blob()
      downloadBlob(blob, `qr-code-${selectedForm?.title?.replace(/\s+/g, '-').toLowerCase() || 'form'}.png`)
      toast.success('QR code downloaded')
    } catch (err) {
      // Fallback - open in new tab
      window.open(qrCodeUrl, '_blank')
      toast.info('QR code opened in new tab')
    }
  }

  // ============================================================================
  // DOCUMENTATION
  // ============================================================================

  const handleOpenDocumentation = (docTitle: string) => {
    const docUrls: Record<string, string> = {
      'Getting Started': 'https://docs.freeflow.io/forms/getting-started',
      'API Reference': 'https://docs.freeflow.io/forms/api-reference',
      'SDKs & Libraries': 'https://docs.freeflow.io/forms/sdks',
    }
    const url = docUrls[docTitle] || 'https://docs.freeflow.io/forms'
    window.open(url, '_blank')
  }

  // ============================================================================
  // TEMPLATE SELECTION
  // ============================================================================

  const handleSelectTemplate = async (template: FormTemplate) => {
    if (template.isPremium) {
      toast.info(`"${template.name}" is a Pro template. Upgrade to access it.`)
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create form from template
      await createForm({
        user_id: user.id,
        title: template.name,
        description: template.description,
        form_type: 'custom' as FormType,
        status: 'draft' as FormStatus,
        fields: [],
        field_count: template.questions,
        sections: [],
        allow_multiple_submissions: false,
        require_authentication: false,
        allow_save_draft: true,
        show_progress_bar: true,
        validation_rules: {},
        required_fields: [],
        total_submissions: 0,
        total_views: 0,
        total_started: 0,
        total_completed: 0,
        completion_rate: 0,
        average_completion_time: 0,
        is_public: false,
        password_protected: false,
        theme: 'default',
        analytics_enabled: true,
        track_source: true,
        track_location: false,
        tags: [template.category],
        metadata: { templateId: template.id },
        send_confirmation_email: false
      })

      toast.success(`Created form from "${template.name}" template`)
      setShowTemplatesDialog(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to create form from template')
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          Error: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:bg-none dark:bg-gray-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-[1800px] mx-auto space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <FileText className="h-8 w-8" />
                  </div>
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                    Forms
                  </Badge>
                </div>
                <h1 className="text-4xl font-bold mb-2">Form Builder</h1>
                <p className="text-white/80 max-w-xl">
                  Create beautiful, conversational forms. Logic jumps, themes, and integrations.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <InsightsToggleButton
                  isOpen={insightsPanel.isOpen}
                  onToggle={insightsPanel.toggle}
                />
                <Button variant="ghost" className="text-white hover:bg-white/20" onClick={() => setShowTemplatesDialog(true)}>
                  <Wand2 className="h-5 w-5 mr-2" />
                  Templates
                </Button>
                <Button className="bg-white text-indigo-600 hover:bg-white/90" onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Form
                </Button>
                <Button variant="ghost" className="text-white hover:bg-white/20" onClick={() => setShowSettingsDialog(true)}>
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { label: 'Total Forms', value: stats.total, icon: FileText, color: 'indigo' },
            { label: 'Active', value: stats.active, icon: Play, color: 'green' },
            { label: 'Submissions', value: stats.totalSubmissions.toLocaleString(), icon: CheckCircle, color: 'purple' },
            { label: 'Views', value: stats.totalViews.toLocaleString(), icon: Eye, color: 'blue' },
            { label: 'Completion', value: `${stats.avgCompletionRate.toFixed(1)}%`, icon: Target, color: 'emerald' },
            { label: 'Conversion', value: `${stats.conversionRate.toFixed(1)}%`, icon: TrendingUp, color: 'amber' },
            { label: 'Avg Time', value: `${stats.avgTimeToComplete}m`, icon: Timer, color: 'pink' },
            { label: 'This Week', value: stats.responsesThisWeek.toString(), icon: Activity, color: 'cyan' },
          ].map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}>
                    <stat.icon className={`h-3.5 w-3.5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  </div>
                  <span className="text-xs text-gray-500 truncate">{stat.label}</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-white dark:bg-gray-800 p-1 shadow-sm">
              <TabsTrigger value="dashboard" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="forms" className="gap-2">
                <FileText className="h-4 w-4" />
                Forms
              </TabsTrigger>
              <TabsTrigger value="responses" className="gap-2">
                <Users className="h-4 w-4" />
                Responses
              </TabsTrigger>
              <TabsTrigger value="integrations" className="gap-2">
                <Zap className="h-4 w-4" />
                Integrations
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search forms..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as FormStatus | 'all')}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => setShowExportDialog(true)}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Forms</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    </div>
                  ) : filteredForms.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No forms yet. Create your first form!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredForms.slice(0, 5).map(form => (
                        <div key={form.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                              <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                              <h4 className="font-medium">{form.title}</h4>
                              <p className="text-sm text-gray-500">{form.total_submissions || 0} responses</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={getStatusColor(form.status)}>
                              {getStatusIcon(form.status)}
                              <span className="ml-1 capitalize">{form.status}</span>
                            </Badge>
                            <Button variant="ghost" size="sm" onClick={() => handleShareForm(form)}>
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleOpenEditDialog(form)}>
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Form
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setShowTemplatesDialog(true)}>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Use Template
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setShowExportDialog(true)}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setShowImportDialog(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Forms
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Forms Tab */}
          <TabsContent value="forms" className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : filteredForms.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold mb-2">No forms found</h3>
                  <p className="text-gray-500 mb-6">Create your first form or try a different search.</p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Form
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredForms.map(form => (
                  <Card key={form.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{form.title}</CardTitle>
                            <p className="text-sm text-gray-500 line-clamp-1">{form.description || 'No description'}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(form.status)}>
                          {getStatusIcon(form.status)}
                          <span className="ml-1 capitalize">{form.status}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{form.total_submissions || 0}</p>
                          <p className="text-xs text-gray-500">Responses</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{form.total_views || 0}</p>
                          <p className="text-xs text-gray-500">Views</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{form.completion_rate?.toFixed(0) || 0}%</p>
                          <p className="text-xs text-gray-500">Completion</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {form.status === 'draft' && (
                          <Button size="sm" className="flex-1" onClick={() => handlePublishForm(form)}>
                            <Play className="h-4 w-4 mr-1" />
                            Publish
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(form)}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleShareForm(form)}>
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDuplicateForm(form)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          setSelectedForm(form)
                          handleExportResponses(form)
                        }}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDeleteForm(form)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Responses Tab */}
          <TabsContent value="responses" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Form Responses</CardTitle>
                  <Select
                    value={selectedForm?.id || ''}
                    onValueChange={(id) => {
                      const form = displayForms.find(f => f.id === id)
                      setSelectedForm(form || null)
                      if (form) fetchFormResponses(form.id)
                    }}
                  >
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Select a form" />
                    </SelectTrigger>
                    <SelectContent>
                      {displayForms.map(form => (
                        <SelectItem key={form.id} value={form.id}>{form.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {!selectedForm ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a form to view responses</p>
                  </div>
                ) : isLoadingResponses ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                  </div>
                ) : formResponses.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No responses yet for this form</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formResponses.map(response => (
                      <div key={response.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarFallback>{response.respondentEmail?.[0]?.toUpperCase() || 'A'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{response.respondentEmail || 'Anonymous'}</p>
                            <p className="text-sm text-gray-500">{formatRelativeTime(response.submittedAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{response.metadata.device}</Badge>
                          <span className="text-sm text-gray-500">{formatDuration(response.completionTime)}</span>
                          <Button variant="ghost" size="sm" onClick={() => handleViewResponse(response)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integrations.map(integration => {
                const isConnected = connectedIntegrations.has(integration.id)
                return (
                  <Card key={integration.id} className={isConnected ? 'border-green-500' : ''}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{integration.icon}</span>
                          <div>
                            <h4 className="font-semibold">{integration.name}</h4>
                            <p className="text-sm text-gray-500">{integration.description}</p>
                          </div>
                        </div>
                        {isConnected && (
                          <Badge className="bg-green-100 text-green-800">Connected</Badge>
                        )}
                      </div>
                      <Button
                        variant={isConnected ? 'outline' : 'default'}
                        className="w-full"
                        onClick={() => {
                          setSelectedIntegration(integration)
                          if (isConnected) {
                            handleDisconnectIntegration()
                          } else {
                            handleConnectIntegration(integration)
                          }
                        }}
                      >
                        {isConnected ? 'Disconnect' : 'Connect'}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Form Insights Panel - Collapsible */}
        {insightsPanel.isOpen && (
          <CollapsibleInsightsPanel
            title="Forms Intelligence & Analytics"
            defaultOpen={true}
            className="mt-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="text-sm font-medium">Completion Trend</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.avgCompletionRate.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Average completion rate</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm font-medium">This Week</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.responsesThisWeek}</p>
                  <p className="text-xs text-muted-foreground">Responses received</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-sm font-medium">Conversion Rate</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Views to submissions</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                      <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="text-sm font-medium">Avg Time</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.avgTimeToComplete}m</p>
                  <p className="text-xs text-muted-foreground">To complete form</p>
                </CardContent>
              </Card>
            </div>
            <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                AI Insights
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Your forms have a {stats.avgCompletionRate > 50 ? 'healthy' : 'below average'} completion rate. {stats.avgCompletionRate < 50 ? 'Consider reducing form fields.' : 'Great job!'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Activity className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>{stats.active} active forms generating {stats.totalSubmissions} total submissions across {stats.totalViews} views.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Average form completion time is {stats.avgTimeToComplete} minutes. {stats.avgTimeToComplete > 5 ? 'Consider shortening long forms.' : 'This is within optimal range.'}</span>
                </li>
              </ul>
            </div>
          </CollapsibleInsightsPanel>
        )}

        {/* Create Form Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Form</DialogTitle>
              <DialogDescription>Start from scratch or use a template</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Form Name</Label>
                <Input
                  placeholder="My new form"
                  className="mt-1"
                  value={newFormTitle}
                  onChange={(e) => setNewFormTitle(e.target.value)}
                />
              </div>
              <div>
                <Label>Description (optional)</Label>
                <Textarea
                  placeholder="What's this form about?"
                  className="mt-1"
                  value={newFormDescription}
                  onChange={(e) => setNewFormDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateForm} disabled={isSubmitting || mutating}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Form
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Form Dialog */}
        <Dialog open={showEditFormDialog} onOpenChange={setShowEditFormDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Form</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Form Name</Label>
                <Input
                  value={editFormData.title}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(v) => setEditFormData(prev => ({ ...prev, status: v as FormStatus }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditFormDialog(false)}>Cancel</Button>
              <Button onClick={handleEditForm} disabled={isEditSubmitting}>
                {isEditSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Templates Dialog */}
        <Dialog open={showTemplatesDialog} onOpenChange={setShowTemplatesDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Choose a Template</DialogTitle>
              <DialogDescription>Start with a pre-built form template</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[500px]">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4 pr-4">
                {formTemplates.map(template => (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden relative"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    {template.isPremium && (
                      <Badge className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 z-10">
                        <Star className="h-3 w-3 mr-1" /> Pro
                      </Badge>
                    )}
                    <div className={`h-20 bg-gradient-to-r ${template.color}`} />
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{template.icon}</span>
                        <div>
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-xs text-gray-500 line-clamp-2">{template.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary">{template.questions} questions</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Data</DialogTitle>
              <DialogDescription>Download your forms and responses</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Format</Label>
                <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as any)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date Range</Label>
                <Select value={exportDateRange} onValueChange={(v) => setExportDateRange(v as any)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                    <SelectItem value="90d">Last 90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={exportIncludeMetadata}
                  onCheckedChange={setExportIncludeMetadata}
                />
                <Label>Include metadata (device, browser, location)</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>Cancel</Button>
              <Button onClick={handleExportData} disabled={isExporting}>
                {isExporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                Export
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import Dialog */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Forms</DialogTitle>
              <DialogDescription>Upload a JSON file exported from this app</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 mb-4">Drop your JSON file here or click to browse</p>
                <Input
                  type="file"
                  accept=".json"
                  className="max-w-xs mx-auto"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImportForms(file)
                  }}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Settings Dialog */}
        <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
            </DialogHeader>
            <Tabs value={settingsTab} onValueChange={setSettingsTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="api">API</TabsTrigger>
                <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
                <TabsTrigger value="danger">Danger Zone</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <div>
                  <Label>Custom Domain</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="forms.yourdomain.com"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                    />
                    <Button onClick={handleVerifyDomain} disabled={isVerifyingDomain}>
                      {isVerifyingDomain ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Branding</Label>
                  <Button variant="outline" className="mt-1" onClick={handleBrowseFiles}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="api" className="space-y-4">
                <div>
                  <Label>API Key</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={apiKey ? `${apiKey.slice(0, 12)}...` : 'No API key generated'}
                      readOnly
                      className="font-mono"
                    />
                    <Button variant="outline" onClick={handleCopyApiKey}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button onClick={handleRegenerateApiKey} disabled={isRegeneratingKey}>
                      {isRegeneratingKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button variant="outline" onClick={handleExportApiLogs}>
                  <Download className="h-4 w-4 mr-2" />
                  Export API Logs
                </Button>
              </TabsContent>

              <TabsContent value="webhooks" className="space-y-4">
                <div>
                  <Label>Add Webhook</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="https://your-server.com/webhook"
                      value={newWebhookUrl}
                      onChange={(e) => setNewWebhookUrl(e.target.value)}
                    />
                    <Button onClick={handleAddWebhook}>Add</Button>
                  </div>
                </div>
                {webhooks.length > 0 && (
                  <div className="space-y-2">
                    <Label>Active Webhooks</Label>
                    {webhooks.map(webhook => (
                      <div key={webhook.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Webhook className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-mono truncate max-w-[300px]">{webhook.url}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="text-red-600" onClick={() => {
                          setSelectedWebhook(webhook)
                          handleDeleteWebhook()
                        }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="danger" className="space-y-4">
                <div className="p-4 border border-red-200 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <h4 className="font-semibold text-red-600 mb-2">Delete All Responses</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    This will permanently delete all responses for the selected form.
                  </p>
                  <Button variant="destructive" onClick={() => setShowDeleteAllResponsesDialog(true)}>
                    Delete All Responses
                  </Button>
                </div>
                <div className="p-4 border border-red-200 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <h4 className="font-semibold text-red-600 mb-2">Delete Workspace</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    This will permanently delete all your forms and data. This action cannot be undone.
                  </p>
                  <Button variant="destructive" onClick={() => setShowDeleteWorkspaceDialog(true)}>
                    Delete Workspace
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* Delete All Responses Confirmation */}
        <Dialog open={showDeleteAllResponsesDialog} onOpenChange={setShowDeleteAllResponsesDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete All Responses</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete all responses for "{selectedForm?.title}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteAllResponsesDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteAllResponses} disabled={isDeletingResponses}>
                {isDeletingResponses ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Delete All
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Workspace Confirmation */}
        <Dialog open={showDeleteWorkspaceDialog} onOpenChange={setShowDeleteWorkspaceDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Workspace</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete your entire workspace? All forms and responses will be permanently deleted.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteWorkspaceDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteWorkspace} disabled={isDeletingWorkspace}>
                {isDeletingWorkspace ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Delete Workspace
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Response Detail Dialog */}
        <Dialog open={showResponseDetailDialog} onOpenChange={setShowResponseDetailDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Response Details</DialogTitle>
            </DialogHeader>
            {selectedResponse && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Email</Label>
                    <p className="font-medium">{selectedResponse.respondentEmail || 'Anonymous'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Submitted</Label>
                    <p className="font-medium">{formatDate(selectedResponse.submittedAt)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Completion Time</Label>
                    <p className="font-medium">{formatDuration(selectedResponse.completionTime)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Device</Label>
                    <p className="font-medium capitalize">{selectedResponse.metadata.device}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-500">Answers</Label>
                  <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm overflow-auto max-h-64">
                    {JSON.stringify(selectedResponse.answers, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* QR Code Dialog */}
        <Dialog open={showQRCodeDialog} onOpenChange={setShowQRCodeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>QR Code</DialogTitle>
              <DialogDescription>Share your form with a QR code</DialogDescription>
            </DialogHeader>
            <div className="py-4 text-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${getOrigin()}/forms/${selectedForm?.id || ''}`)}`}
                alt="Form QR Code"
                className="mx-auto mb-4"
              />
              <p className="text-sm text-gray-500 mb-4">Scan to open form</p>
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={handleCopyQRCode}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button onClick={handleDownloadQRCode}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Themes Dialog */}
        <Dialog open={showThemesDialog} onOpenChange={setShowThemesDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Form Themes</DialogTitle>
              <DialogDescription>Choose a theme for your form</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
              {[...formThemes, ...customThemes].map(theme => (
                <Card
                  key={theme.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleApplyTheme(theme, 'form')}
                >
                  <div
                    className="h-24 rounded-t-lg"
                    style={{ backgroundColor: theme.backgroundColor }}
                  >
                    <div
                      className="h-full flex items-center justify-center"
                      style={{ color: theme.primaryColor }}
                    >
                      <Palette className="h-8 w-8" />
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <p className="font-medium text-sm">{theme.name}</p>
                    <p className="text-xs text-gray-500">{theme.fontFamily}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Share Dialog */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Form</DialogTitle>
              <DialogDescription>Share your form via link, embed, or QR code</DialogDescription>
            </DialogHeader>
            {selectedForm && (
              <div className="space-y-4 py-4">
                <div>
                  <Label>Direct Link</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={`${getOrigin()}/forms/${selectedForm.id}`}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button variant="outline" onClick={handleCopyShareLink}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Embed Code</Label>
                  <div className="mt-1">
                    <Textarea
                      readOnly
                      className="font-mono text-xs"
                      value={`<iframe src="${getOrigin()}/forms/${selectedForm.id}/embed" width="100%" height="600" frameborder="0"></iframe>`}
                    />
                    <Button
                      variant="outline"
                      className="mt-2"
                      onClick={async () => {
                        const embedCode = `<iframe src="${getOrigin()}/forms/${selectedForm.id}/embed" width="100%" height="600" frameborder="0"></iframe>`
                        await navigator.clipboard.writeText(embedCode)
                        toast.success('Embed code copied')
                      }}
                    >
                      <Code className="h-4 w-4 mr-2" />
                      Copy Embed Code
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => {
                    setShowShareDialog(false)
                    setShowQRCodeDialog(true)
                  }}>
                    <Grid3X3 className="h-4 w-4 mr-2" />
                    Generate QR Code
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Analytics Dialog */}
        <Dialog open={showAnalyticsDialog} onOpenChange={setShowAnalyticsDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Form Analytics</DialogTitle>
              <DialogDescription>{selectedForm?.title || 'Form'} Performance</DialogDescription>
            </DialogHeader>
            {selectedForm && (
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Eye className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                      <p className="text-2xl font-bold">{selectedForm.total_views || 0}</p>
                      <p className="text-xs text-gray-500">Total Views</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Play className="h-6 w-6 mx-auto mb-2 text-green-500" />
                      <p className="text-2xl font-bold">{selectedForm.total_started || 0}</p>
                      <p className="text-xs text-gray-500">Started</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                      <p className="text-2xl font-bold">{selectedForm.total_completed || 0}</p>
                      <p className="text-xs text-gray-500">Completed</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Target className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                      <p className="text-2xl font-bold">{selectedForm.completion_rate?.toFixed(1) || 0}%</p>
                      <p className="text-xs text-gray-500">Completion Rate</p>
                    </CardContent>
                  </Card>
                </div>
                <div>
                  <Label>Conversion Funnel</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-8 bg-blue-500 rounded flex items-center px-3">
                        <span className="text-white text-sm font-medium">Views: {selectedForm.total_views || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-8 bg-green-500 rounded flex items-center px-3"
                        style={{ width: `${selectedForm.total_views ? ((selectedForm.total_started || 0) / selectedForm.total_views) * 100 : 0}%`, minWidth: '100px' }}
                      >
                        <span className="text-white text-sm font-medium">Started: {selectedForm.total_started || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-8 bg-purple-500 rounded flex items-center px-3"
                        style={{ width: `${selectedForm.total_views ? ((selectedForm.total_completed || 0) / selectedForm.total_views) * 100 : 0}%`, minWidth: '100px' }}
                      >
                        <span className="text-white text-sm font-medium">Completed: {selectedForm.total_completed || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => handleExportResponses(selectedForm)}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Analytics
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Question Types Dialog */}
        <Dialog open={showQuestionTypesDialog} onOpenChange={setShowQuestionTypesDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Question Types</DialogTitle>
              <DialogDescription>Choose a question type to add to your form</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[500px]">
              <div className="space-y-6 py-4 pr-4">
                {['text', 'choice', 'rating', 'date', 'file', 'contact', 'payment', 'layout'].map(category => (
                  <div key={category}>
                    <h4 className="text-sm font-semibold mb-3 capitalize">{category}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {questionTypes.filter(q => q.category === category).map(type => (
                        <Card
                          key={type.id}
                          className={`cursor-pointer hover:shadow-md transition-shadow ${type.isPremium ? 'border-amber-200' : ''}`}
                          onClick={async () => {
                            if (type.isPremium) {
                              toast.info(`"${type.name}" is a Pro feature. Upgrade to access.`)
                              return
                            }
                            if (selectedForm) {
                              try {
                                const newField = {
                                  id: crypto.randomUUID(),
                                  type: type.id,
                                  title: type.name,
                                  required: false,
                                  order: (selectedForm.fields?.length || 0) + 1
                                }
                                await updateForm(selectedForm.id, {
                                  fields: [...(selectedForm.fields || []), newField],
                                  field_count: (selectedForm.field_count || 0) + 1
                                })
                                toast.success(`Added "${type.name}" question`)
                                setShowQuestionTypesDialog(false)
                              } catch (err: any) {
                                toast.error(err.message || 'Failed to add question')
                              }
                            }
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                {type.icon}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{type.name}</p>
                                <p className="text-xs text-gray-500">{type.description}</p>
                              </div>
                            </div>
                            {type.isPremium && (
                              <Badge className="mt-2 bg-amber-100 text-amber-800 border-0">
                                <Star className="h-3 w-3 mr-1" /> Pro
                              </Badge>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* API Logs Dialog */}
        <Dialog open={showApiLogsDialog} onOpenChange={(open) => {
          setShowApiLogsDialog(open)
          if (open) fetchApiLogs()
        }}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>API Logs</DialogTitle>
              <DialogDescription>Recent API requests</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2 py-4 pr-4">
                {apiLogs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No API logs found</p>
                  </div>
                ) : (
                  apiLogs.map(log => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant={log.status < 400 ? 'default' : 'destructive'}>
                          {log.method}
                        </Badge>
                        <span className="font-mono text-sm">{log.endpoint}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>{log.status}</span>
                        <span>{log.duration}</span>
                        <span>{formatRelativeTime(log.time)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={handleExportApiLogs}>
                <Download className="h-4 w-4 mr-2" />
                Export Logs
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Custom Theme Dialog */}
        <Dialog open={showCustomThemeDialog} onOpenChange={setShowCustomThemeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Custom Theme</DialogTitle>
              <DialogDescription>Design your own form theme</DialogDescription>
            </DialogHeader>
            <CustomThemeForm
              onSave={async (theme) => {
                try {
                  const { data: { user } } = await supabase.auth.getUser()
                  if (!user) throw new Error('Not authenticated')

                  const { data, error } = await supabase
                    .from('custom_themes')
                    .insert({
                      user_id: user.id,
                      name: theme.name,
                      primary_color: theme.primaryColor,
                      background_color: theme.backgroundColor,
                      font_family: theme.fontFamily
                    })
                    .select()
                    .single()

                  if (error) throw error

                  const newTheme: FormTheme = {
                    id: data.id,
                    name: data.name,
                    primaryColor: data.primary_color,
                    backgroundColor: data.background_color,
                    fontFamily: data.font_family,
                    isCustom: true
                  }

                  setCustomThemes(prev => [...prev, newTheme])
                  toast.success(`Theme "${theme.name}" created`)
                  setShowCustomThemeDialog(false)
                } catch (err: any) {
                  toast.error(err.message || 'Failed to create theme')
                }
              }}
              onCancel={() => setShowCustomThemeDialog(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Form Actions Dialog */}
        <Dialog open={showFormActionsDialog} onOpenChange={setShowFormActionsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Form Actions</DialogTitle>
              <DialogDescription>{selectedForm?.title || 'Form'}</DialogDescription>
            </DialogHeader>
            {selectedForm && (
              <div className="space-y-2 py-4">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setShowFormActionsDialog(false)
                    setShowAnalyticsDialog(true)
                  }}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setShowFormActionsDialog(false)
                    setShowShareDialog(true)
                  }}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Form
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setShowFormActionsDialog(false)
                    setShowThemesDialog(true)
                  }}
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Change Theme
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setShowFormActionsDialog(false)
                    setShowQuestionTypesDialog(true)
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    handleExportResponses(selectedForm)
                    setShowFormActionsDialog(false)
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Responses
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    handleDuplicateForm(selectedForm)
                    setShowFormActionsDialog(false)
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate Form
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600"
                  onClick={() => {
                    handleDeleteForm(selectedForm)
                    setShowFormActionsDialog(false)
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Form
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Webhook Options Dialog */}
        <Dialog open={showWebhookOptionsDialog} onOpenChange={setShowWebhookOptionsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Webhook Options</DialogTitle>
              <DialogDescription>{selectedWebhook?.url}</DialogDescription>
            </DialogHeader>
            {selectedWebhook && (
              <div className="space-y-4 py-4">
                <div>
                  <Label>Events</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedWebhook.events.map(event => (
                      <Badge key={event} variant="secondary">{event}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <p className="mt-1 capitalize">{selectedWebhook.status}</p>
                </div>
                <div>
                  <Label>Created</Label>
                  <p className="mt-1">{formatDate(selectedWebhook.createdAt)}</p>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        const testPayload = {
                          event: 'test',
                          timestamp: new Date().toISOString(),
                          data: { message: 'Test webhook from FreeFlow Forms' }
                        }
                        const response = await fetch(selectedWebhook.url, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(testPayload)
                        })
                        if (response.ok) {
                          toast.success('Test webhook sent successfully')
                        } else {
                          toast.error(`Webhook returned status ${response.status}`)
                        }
                      } catch (err: any) {
                        toast.error(err.message || 'Failed to send test webhook')
                      }
                    }}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Test
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteWebhook}
                    disabled={isDeletingWebhook}
                  >
                    {isDeletingWebhook ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                    Delete
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Verify Domain Dialog */}
        <Dialog open={showVerifyDomainDialog} onOpenChange={setShowVerifyDomainDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verify Domain</DialogTitle>
              <DialogDescription>Add a custom domain for your forms</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Domain</Label>
                <Input
                  placeholder="forms.yourdomain.com"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Label className="text-sm font-medium">DNS Configuration</Label>
                <p className="text-xs text-gray-500 mt-1 mb-3">
                  Add the following CNAME record to your DNS settings:
                </p>
                <div className="font-mono text-sm bg-white dark:bg-gray-900 p-3 rounded border">
                  <p><strong>Type:</strong> CNAME</p>
                  <p><strong>Name:</strong> forms</p>
                  <p><strong>Value:</strong> forms.freeflow.io</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowVerifyDomainDialog(false)}>Cancel</Button>
              <Button onClick={handleVerifyDomain} disabled={isVerifyingDomain}>
                {isVerifyingDomain ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Globe className="h-4 w-4 mr-2" />}
                Verify Domain
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Integration Dialog */}
        <Dialog open={showIntegrationDialog} onOpenChange={setShowIntegrationDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedIntegration?.name || 'Integration'}</DialogTitle>
              <DialogDescription>{selectedIntegration?.description}</DialogDescription>
            </DialogHeader>
            {selectedIntegration && (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{selectedIntegration.icon}</span>
                  <div>
                    <h4 className="font-semibold">{selectedIntegration.name}</h4>
                    <p className="text-sm text-gray-500">{selectedIntegration.category}</p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm">{selectedIntegration.description}</p>
                  {selectedIntegration.responsesSynced && (
                    <p className="text-sm text-gray-500 mt-2">
                      {selectedIntegration.responsesSynced} responses synced
                    </p>
                  )}
                </div>
                <DialogFooter>
                  {connectedIntegrations.has(selectedIntegration.id) ? (
                    <Button
                      variant="destructive"
                      onClick={handleDisconnectIntegration}
                      disabled={isDisconnectingIntegration}
                    >
                      {isDisconnectingIntegration ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Disconnect
                    </Button>
                  ) : (
                    <Button onClick={() => handleConnectIntegration(selectedIntegration)}>
                      Connect {selectedIntegration.name}
                    </Button>
                  )}
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

// Custom Theme Form Component
function CustomThemeForm({
  onSave,
  onCancel
}: {
  onSave: (theme: { name: string; primaryColor: string; backgroundColor: string; fontFamily: string }) => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#6366f1')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [fontFamily, setFontFamily] = useState('Inter')

  return (
    <div className="space-y-4 py-4">
      <div>
        <Label>Theme Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Custom Theme"
          className="mt-1"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Primary Color</Label>
          <div className="flex gap-2 mt-1">
            <Input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-12 h-10 p-1"
            />
            <Input
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="flex-1 font-mono"
            />
          </div>
        </div>
        <div>
          <Label>Background Color</Label>
          <div className="flex gap-2 mt-1">
            <Input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="w-12 h-10 p-1"
            />
            <Input
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="flex-1 font-mono"
            />
          </div>
        </div>
      </div>
      <div>
        <Label>Font Family</Label>
        <Select value={fontFamily} onValueChange={setFontFamily}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Inter">Inter</SelectItem>
            <SelectItem value="Roboto">Roboto</SelectItem>
            <SelectItem value="Poppins">Poppins</SelectItem>
            <SelectItem value="Nunito">Nunito</SelectItem>
            <SelectItem value="Open Sans">Open Sans</SelectItem>
            <SelectItem value="Lato">Lato</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor }}>
        <p style={{ color: primaryColor, fontFamily }} className="font-semibold">
          Preview Text
        </p>
        <p style={{ fontFamily }} className="text-sm text-gray-600">
          This is how your form will look
        </p>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button
          onClick={() => {
            if (!name.trim()) {
              toast.error('Please enter a theme name')
              return
            }
            onSave({ name: name.trim(), primaryColor, backgroundColor, fontFamily })
          }}
        >
          Create Theme
        </Button>
      </DialogFooter>
    </div>
  )
}
