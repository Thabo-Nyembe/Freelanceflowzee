'use client'
import { useState, useMemo } from 'react'
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
import {
  FileText, Plus, Search, Eye, Edit3, Copy, Trash2, Share2, Settings,
  BarChart3, Users, Clock, CheckCircle, XCircle, ChevronRight, ChevronDown,
  Type, List, Hash, Star, Calendar, Upload, ToggleLeft, AlignLeft, MessageSquare,
  Image as ImageIcon, Link2, Mail, Phone, MapPin, CreditCard, Percent, ArrowRight,
  Play, Pause, Archive, ExternalLink, Code, Zap, Bell, Download, Filter,
  TrendingUp, TrendingDown, PieChart, Activity, Target, Sparkles, Wand2, Palette,
  Layout, Grid3X3, Layers, Smartphone, Monitor, Globe, Lock, Unlock, RefreshCw,
  MousePointer, FileQuestion, CircleDot, Square, ChevronUp, Minus, MoreVertical,
  ArrowDownRight, ArrowUpRight, Send, Webhook, Database, GitBranch, Shuffle,
  Timer, Gauge, ThumbsUp, ThumbsDown, Sliders, ListChecks, FileUp, Save
} from 'lucide-react'

// ============================================================================
// TYPE DEFINITIONS - Typeform Level Form Builder
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

// ============================================================================
// MOCK DATA
// ============================================================================

const questionTypes: QuestionType[] = [
  // Text
  { id: 'short_text', name: 'Short Text', icon: <Type className="w-5 h-5" />, description: 'Single line answer', category: 'text', isPremium: false },
  { id: 'long_text', name: 'Long Text', icon: <AlignLeft className="w-5 h-5" />, description: 'Multi-line answer', category: 'text', isPremium: false },
  { id: 'email', name: 'Email', icon: <Mail className="w-5 h-5" />, description: 'Email address', category: 'contact', isPremium: false },
  { id: 'phone', name: 'Phone', icon: <Phone className="w-5 h-5" />, description: 'Phone number', category: 'contact', isPremium: false },
  { id: 'website', name: 'Website', icon: <Globe className="w-5 h-5" />, description: 'URL input', category: 'contact', isPremium: false },
  // Choice
  { id: 'multiple_choice', name: 'Multiple Choice', icon: <CircleDot className="w-5 h-5" />, description: 'Select one option', category: 'choice', isPremium: false },
  { id: 'checkboxes', name: 'Checkboxes', icon: <ListChecks className="w-5 h-5" />, description: 'Select multiple', category: 'choice', isPremium: false },
  { id: 'dropdown', name: 'Dropdown', icon: <ChevronDown className="w-5 h-5" />, description: 'Select from list', category: 'choice', isPremium: false },
  { id: 'picture_choice', name: 'Picture Choice', icon: <ImageIcon className="w-5 h-5" />, description: 'Visual options', category: 'choice', isPremium: true },
  { id: 'yes_no', name: 'Yes/No', icon: <ToggleLeft className="w-5 h-5" />, description: 'Binary choice', category: 'choice', isPremium: false },
  // Rating
  { id: 'opinion_scale', name: 'Opinion Scale', icon: <Sliders className="w-5 h-5" />, description: '0-10 scale', category: 'rating', isPremium: false },
  { id: 'star_rating', name: 'Star Rating', icon: <Star className="w-5 h-5" />, description: '1-5 stars', category: 'rating', isPremium: false },
  { id: 'nps', name: 'NPS', icon: <TrendingUp className="w-5 h-5" />, description: 'Net Promoter Score', category: 'rating', isPremium: false },
  { id: 'ranking', name: 'Ranking', icon: <ListChecks className="w-5 h-5" />, description: 'Order items', category: 'rating', isPremium: true },
  // Date & File
  { id: 'date', name: 'Date', icon: <Calendar className="w-5 h-5" />, description: 'Date picker', category: 'date', isPremium: false },
  { id: 'file_upload', name: 'File Upload', icon: <FileUp className="w-5 h-5" />, description: 'Upload files', category: 'file', isPremium: false },
  // Payment & Layout
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

const mockResponses: FormResponse[] = [
  { id: '1', formId: '1', formTitle: 'Customer Feedback', respondentEmail: 'john@example.com', submittedAt: new Date(Date.now() - 1000 * 60 * 30), completionTime: 245, answers: {}, metadata: { device: 'desktop', browser: 'Chrome' } },
  { id: '2', formId: '1', formTitle: 'Customer Feedback', respondentEmail: 'sarah@example.com', submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), completionTime: 180, answers: {}, metadata: { device: 'mobile', browser: 'Safari' } },
  { id: '3', formId: '2', formTitle: 'Event Registration', respondentEmail: 'mike@example.com', submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 5), completionTime: 320, answers: {}, metadata: { device: 'desktop', browser: 'Firefox' } },
  { id: '4', formId: '1', formTitle: 'Customer Feedback', submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 8), completionTime: 156, answers: {}, metadata: { device: 'tablet', browser: 'Safari' } },
  { id: '5', formId: '3', formTitle: 'NPS Survey', respondentEmail: 'emily@example.com', submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), completionTime: 45, answers: {}, metadata: { device: 'mobile', browser: 'Chrome' } },
]

const integrations: Integration[] = [
  { id: '1', name: 'Slack', icon: '💬', description: 'Get notified on submissions', connected: true, category: 'notification', responsesSynced: 1250 },
  { id: '2', name: 'Google Sheets', icon: '📊', description: 'Sync responses to sheets', connected: true, category: 'storage', responsesSynced: 4500 },
  { id: '3', name: 'Mailchimp', icon: '✉️', description: 'Add to email lists', connected: false, category: 'crm' },
  { id: '4', name: 'Zapier', icon: '⚡', description: 'Connect 5000+ apps', connected: true, category: 'automation', responsesSynced: 890 },
  { id: '5', name: 'Stripe', icon: '💳', description: 'Accept payments', connected: false, category: 'payment' },
  { id: '6', name: 'HubSpot', icon: '🧡', description: 'CRM integration', connected: false, category: 'crm' },
  { id: '7', name: 'Webhooks', icon: '🔗', description: 'Custom integrations', connected: true, category: 'automation' },
  { id: '8', name: 'Notion', icon: '📝', description: 'Sync to databases', connected: false, category: 'storage' },
  { id: '9', name: 'Airtable', icon: '📋', description: 'Powerful spreadsheets', connected: true, category: 'storage', responsesSynced: 2100 },
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function FormsClient({ initialForms }: { initialForms: Form[] }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [statusFilter, setStatusFilter] = useState<FormStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<FormType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedForm, setSelectedForm] = useState<Form | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false)
  const [showQuestionTypesDialog, setShowQuestionTypesDialog] = useState(false)
  const [showThemesDialog, setShowThemesDialog] = useState(false)

  const { forms, loading, error } = useForms({ status: statusFilter, formType: typeFilter, limit: 50 })
  const displayForms = forms.length > 0 ? forms : initialForms

  // Calculate comprehensive stats
  const stats = useMemo(() => {
    const filtered = displayForms.filter(f => statusFilter === 'all' || f.status === statusFilter)
    const total = filtered.length
    const active = filtered.filter(f => f.status === 'active').length
    const totalSubmissions = filtered.reduce((acc, f) => acc + (f.total_submissions || 0), 0)
    const totalViews = filtered.reduce((acc, f) => acc + (f.total_views || 0), 0)
    const avgCompletionRate = total > 0 ? filtered.reduce((acc, f) => acc + (f.completion_rate || 0), 0) / total : 0
    const totalQuestions = filtered.reduce((acc, f) => acc + (f.field_count || 0), 0)
    const avgTimeToComplete = 3.2 // minutes
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

  // Filter forms
  const filteredForms = useMemo(() => {
    return displayForms.filter(f => {
      const matchesSearch = !searchQuery ||
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || f.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [displayForms, searchQuery, statusFilter])

  if (error) return (
    <div className="p-8">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
        Error: {error.message}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-[1800px] mx-auto space-y-8">
        {/* Premium Header */}
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
                    Forms Pro
                  </Badge>
                  <Badge className="bg-indigo-500/30 text-white border-0 backdrop-blur-sm">
                    Typeform Level
                  </Badge>
                </div>
                <h1 className="text-4xl font-bold mb-2">Form Builder</h1>
                <p className="text-white/80 max-w-xl">
                  Create beautiful, conversational forms that feel like a chat. Logic jumps, themes, and integrations.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Dialog open={showTemplatesDialog} onOpenChange={setShowTemplatesDialog}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="text-white hover:bg-white/20">
                      <Wand2 className="h-5 w-5 mr-2" />
                      Templates
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                    <DialogHeader>
                      <DialogTitle>Choose a Template</DialogTitle>
                      <DialogDescription>Start with a pre-built form template</DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-[500px]">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4 pr-4">
                        {formTemplates.map(template => (
                          <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden relative">
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
                                    <span className="text-xs text-gray-400">{template.uses.toLocaleString()} uses</span>
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
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-white text-indigo-600 hover:bg-white/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Form
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Form</DialogTitle>
                      <DialogDescription>Start from scratch or use a template</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Form Name</Label>
                        <Input placeholder="My new form" className="mt-1" />
                      </div>
                      <div>
                        <Label>Description (optional)</Label>
                        <Input placeholder="What's this form about?" className="mt-1" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => {
                            setShowCreateDialog(false)
                            setShowQuestionTypesDialog(true)
                          }}
                          className="p-4 border rounded-lg hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-left"
                        >
                          <Plus className="w-6 h-6 text-indigo-600 mb-2" />
                          <h4 className="font-medium">Start Blank</h4>
                          <p className="text-xs text-gray-500">Build from scratch</p>
                        </button>
                        <button
                          onClick={() => {
                            setShowCreateDialog(false)
                            setShowTemplatesDialog(true)
                          }}
                          className="p-4 border rounded-lg hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-left"
                        >
                          <Wand2 className="w-6 h-6 text-indigo-600 mb-2" />
                          <h4 className="font-medium">Use Template</h4>
                          <p className="text-xs text-gray-500">Pre-built forms</p>
                        </button>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                      <Button className="bg-indigo-600 hover:bg-indigo-700">Create Form</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button variant="ghost" className="text-white hover:bg-white/20">
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - 8 Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { label: 'Total Forms', value: stats.total, icon: FileText, color: 'indigo', change: '+3' },
            { label: 'Active', value: stats.active, icon: Play, color: 'green', change: '' },
            { label: 'Submissions', value: stats.totalSubmissions.toLocaleString(), icon: CheckCircle, color: 'purple', change: '+12%' },
            { label: 'Views', value: stats.totalViews.toLocaleString(), icon: Eye, color: 'blue', change: '+8%' },
            { label: 'Completion', value: `${stats.avgCompletionRate.toFixed(1)}%`, icon: Target, color: 'emerald', change: '+2.3%' },
            { label: 'Conversion', value: `${stats.conversionRate.toFixed(1)}%`, icon: TrendingUp, color: 'amber', change: '+1.5%' },
            { label: 'Avg Time', value: `${stats.avgTimeToComplete}m`, icon: Timer, color: 'pink', change: '-8s' },
            { label: 'This Week', value: stats.responsesThisWeek.toString(), icon: Activity, color: 'cyan', change: '+24' },
          ].map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-lg bg-gradient-to-br from-${stat.color}-400 to-${stat.color}-600`}>
                    <stat.icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-xs text-gray-500 truncate">{stat.label}</span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
                  {stat.change && (
                    <span className={`text-xs ${stat.change.startsWith('+') ? 'text-green-600' : stat.change.startsWith('-') ? 'text-red-600' : 'text-gray-500'}`}>
                      {stat.change}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
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
                <MessageSquare className="h-4 w-4" />
                Responses
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <Activity className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="integrations" className="gap-2">
                <Zap className="h-4 w-4" />
                Integrations
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search forms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <div className="flex items-center border rounded-lg bg-white dark:bg-gray-800">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Forms */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold">Recent Forms</CardTitle>
                  <Button variant="ghost" size="sm">View All</Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {filteredForms.slice(0, 5).map(form => (
                    <div key={form.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer" onClick={() => setSelectedForm(form)}>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{form.title}</p>
                          <p className="text-xs text-gray-500">{form.field_count} questions • Updated {new Date(form.updated_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-semibold text-indigo-600">{form.total_submissions}</p>
                          <p className="text-xs text-gray-500">responses</p>
                        </div>
                        <Badge className={getStatusColor(form.status)}>
                          {getStatusIcon(form.status)}
                          <span className="ml-1">{form.status}</span>
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Responses */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold">Recent Responses</CardTitle>
                  <Button variant="ghost" size="sm">View All</Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockResponses.slice(0, 5).map(response => (
                    <div key={response.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://avatar.vercel.sh/${response.respondentEmail || response.id}`} />
                        <AvatarFallback>{response.respondentEmail?.slice(0, 2).toUpperCase() || 'AN'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{response.respondentEmail || 'Anonymous'}</p>
                        <p className="text-xs text-gray-500 truncate">{response.formTitle}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{formatDuration(response.completionTime)}</p>
                        <Badge variant="outline" className="text-xs">{response.metadata.device}</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Performance Overview */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl text-center">
                      <TrendingUp className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-indigo-600">{stats.conversionRate.toFixed(1)}%</p>
                      <p className="text-sm text-gray-500">Conversion Rate</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl text-center">
                      <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-600">{stats.avgCompletionRate.toFixed(0)}%</p>
                      <p className="text-sm text-gray-500">Completion Rate</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl text-center">
                      <Timer className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-amber-600">{stats.avgTimeToComplete}m</p>
                      <p className="text-sm text-gray-500">Avg Completion</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Form
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setShowTemplatesDialog(true)}>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Browse Templates
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setShowThemesDialog(true)}>
                    <Palette className="h-4 w-4 mr-2" />
                    Customize Theme
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Export Responses
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Forms Tab */}
          <TabsContent value="forms" className="space-y-6">
            {/* Status Filter Pills */}
            <div className="flex items-center gap-2">
              {(['all', 'active', 'draft', 'paused', 'closed'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    statusFilter === status
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {status === 'all' ? 'All Forms' : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-indigo-600" />
                <p className="mt-4 text-gray-500">Loading forms...</p>
              </div>
            ) : filteredForms.length === 0 ? (
              <Card className="py-16 text-center">
                <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No forms found</h3>
                <p className="text-gray-500 mb-6">Create your first form to get started</p>
                <Button onClick={() => setShowCreateDialog(true)} className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Form
                </Button>
              </Card>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredForms.map(form => (
                  <Card key={form.id} className="overflow-hidden hover:shadow-lg transition-all group cursor-pointer" onClick={() => setSelectedForm(form)}>
                    <div className="h-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                        <div className="flex items-center gap-2">
                          <button className="p-2 bg-white rounded-lg text-gray-800 hover:bg-gray-100">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-2 bg-white rounded-lg text-gray-800 hover:bg-gray-100">
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button className="p-2 bg-white rounded-lg text-gray-800 hover:bg-gray-100" onClick={(e) => { e.stopPropagation(); setSelectedForm(form); setShowAnalyticsDialog(true); }}>
                            <BarChart3 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{form.title}</h3>
                          <p className="text-sm text-gray-500 line-clamp-1">{form.description || 'No description'}</p>
                        </div>
                        <Badge className={getStatusColor(form.status)}>
                          {getStatusIcon(form.status)}
                          <span className="ml-1">{form.status}</span>
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 py-4 border-y dark:border-gray-700">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-indigo-600">{form.total_submissions}</p>
                          <p className="text-xs text-gray-500">Responses</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">{form.completion_rate?.toFixed(0) || 0}%</p>
                          <p className="text-xs text-gray-500">Completion</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-pink-600">{form.field_count}</p>
                          <p className="text-xs text-gray-500">Questions</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(form.updated_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={(e) => { e.stopPropagation(); setSelectedForm(form); setShowShareDialog(true); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                            <Share2 className="h-4 w-4" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                            <Copy className="h-4 w-4" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredForms.map(form => (
                  <Card key={form.id} className="hover:shadow-md transition-all cursor-pointer" onClick={() => setSelectedForm(form)}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{form.title}</h3>
                          <p className="text-sm text-gray-500">{form.field_count} questions • {new Date(form.updated_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="font-semibold text-indigo-600">{form.total_submissions}</p>
                          <p className="text-xs text-gray-500">responses</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-purple-600">{form.completion_rate?.toFixed(0) || 0}%</p>
                          <p className="text-xs text-gray-500">completion</p>
                        </div>
                        <Badge className={getStatusColor(form.status)}>{form.status}</Badge>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Responses Tab */}
          <TabsContent value="responses">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>All Responses</CardTitle>
                <div className="flex items-center gap-3">
                  <select className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                    <option value="all">All Forms</option>
                    {displayForms.map(form => (
                      <option key={form.id} value={form.id}>{form.title}</option>
                    ))}
                  </select>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockResponses.map(response => (
                    <div key={response.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer">
                      <Avatar>
                        <AvatarImage src={`https://avatar.vercel.sh/${response.respondentEmail || response.id}`} />
                        <AvatarFallback>{response.respondentEmail?.slice(0, 2).toUpperCase() || 'AN'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{response.respondentEmail || 'Anonymous'}</p>
                        <p className="text-sm text-gray-500">{response.formTitle}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Timer className="h-4 w-4" />
                          {formatDuration(response.completionTime)}
                        </div>
                        <Badge variant="outline" className="gap-1">
                          {response.metadata.device === 'desktop' && <Monitor className="h-3 w-3" />}
                          {response.metadata.device === 'mobile' && <Smartphone className="h-3 w-3" />}
                          {response.metadata.device}
                        </Badge>
                        <span className="text-sm text-gray-500">{response.submittedAt.toLocaleString()}</span>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Response Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-12 w-12 text-indigo-300" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg flex items-center justify-center">
                    <PieChart className="h-12 w-12 text-purple-300" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Device Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { device: 'Desktop', icon: <Monitor className="h-5 w-5 text-blue-600" />, percentage: 58 },
                    { device: 'Mobile', icon: <Smartphone className="h-5 w-5 text-green-600" />, percentage: 38 },
                    { device: 'Tablet', icon: <Layout className="h-5 w-5 text-purple-600" />, percentage: 4 },
                  ].map(item => (
                    <div key={item.device} className="flex items-center gap-3">
                      {item.icon}
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">{item.device}</span>
                          <span className="text-sm font-medium">{item.percentage}%</span>
                        </div>
                        <Progress value={item.percentage} className="h-2" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Question Drop-off Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { question: 'What is your name?', views: 1000, completed: 980, dropOff: 2 },
                    { question: 'What is your email?', views: 980, completed: 920, dropOff: 6 },
                    { question: 'How did you hear about us?', views: 920, completed: 890, dropOff: 3 },
                    { question: 'Rate your experience', views: 890, completed: 850, dropOff: 4 },
                    { question: 'Any additional feedback?', views: 850, completed: 800, dropOff: 6 },
                  ].map((q, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <span className="text-sm text-gray-500 w-8">Q{i + 1}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{q.question}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={(q.completed / q.views) * 100} className="h-2 flex-1" />
                          <span className="text-xs text-gray-500">{q.completed}/{q.views}</span>
                        </div>
                      </div>
                      <Badge className={q.dropOff > 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                        -{q.dropOff}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integrations.map(integration => (
                <Card key={integration.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <span className="text-4xl">{integration.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{integration.name}</h3>
                          <Badge className={integration.connected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                            {integration.connected ? 'Connected' : 'Not connected'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{integration.description}</p>
                        {integration.responsesSynced && (
                          <p className="text-xs text-indigo-600 mt-2">{integration.responsesSynced.toLocaleString()} responses synced</p>
                        )}
                        <Button variant={integration.connected ? 'outline' : 'default'} size="sm" className="mt-4">
                          {integration.connected ? 'Configure' : 'Connect'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Form Defaults</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Show progress bar', desc: 'Display completion progress to respondents', enabled: true },
                    { label: 'One question at a time', desc: 'Typeform-style focused experience', enabled: true },
                    { label: 'Save partial responses', desc: 'Allow respondents to continue later', enabled: false },
                    { label: 'Email notifications', desc: 'Get notified on new submissions', enabled: true },
                  ].map((setting, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium">{setting.label}</p>
                        <p className="text-sm text-gray-500">{setting.desc}</p>
                      </div>
                      <Switch defaultChecked={setting.enabled} />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Themes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {formThemes.map(theme => (
                      <button key={theme.id} className="p-3 border rounded-lg hover:border-indigo-500 transition-colors text-left">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.primaryColor }}></div>
                          <span className="font-medium text-sm">{theme.name}</span>
                        </div>
                        <div className="h-8 rounded" style={{ backgroundColor: theme.backgroundColor, border: '1px solid #e5e7eb' }}></div>
                      </button>
                    ))}
                    <button className="p-3 border-2 border-dashed rounded-lg hover:border-indigo-500 transition-colors text-center">
                      <Palette className="h-5 w-5 mx-auto text-gray-400 mb-1" />
                      <span className="text-sm text-gray-500">Custom Theme</span>
                    </button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Branding</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Logo</Label>
                    <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Upload your logo</p>
                      <Button variant="outline" size="sm" className="mt-2">Browse</Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium">Remove Freeflow branding</p>
                      <p className="text-sm text-gray-500">Show only your brand on forms</p>
                    </div>
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">Pro</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Custom Domain</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Domain</Label>
                    <div className="flex gap-2 mt-1">
                      <Input placeholder="forms.yourcompany.com" />
                      <Button>Verify</Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Point your domain's CNAME to forms.freeflow.io</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Share Dialog */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Form</DialogTitle>
              <DialogDescription>Share your form with others</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Form Link</span>
                  <Button variant="ghost" size="sm">Copy</Button>
                </div>
                <p className="text-sm text-gray-500 truncate font-mono">
                  https://freeflow.io/form/{selectedForm?.id || 'abc123'}
                </p>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <button className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-center">
                  <Link2 className="h-5 w-5 mx-auto mb-1" />
                  <span className="text-xs">Link</span>
                </button>
                <button className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-center">
                  <Code className="h-5 w-5 mx-auto mb-1" />
                  <span className="text-xs">Embed</span>
                </button>
                <button className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-center">
                  <Mail className="h-5 w-5 mx-auto mb-1" />
                  <span className="text-xs">Email</span>
                </button>
                <button className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-center">
                  <ExternalLink className="h-5 w-5 mx-auto mb-1" />
                  <span className="text-xs">QR Code</span>
                </button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {selectedForm?.is_public ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  <span className="text-sm">{selectedForm?.is_public ? 'Public' : 'Private'}</span>
                </div>
                <Button variant="ghost" size="sm">Change</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Question Types Dialog */}
        <Dialog open={showQuestionTypesDialog} onOpenChange={setShowQuestionTypesDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Add Question</DialogTitle>
              <DialogDescription>Choose a question type</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[400px]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-4 pr-4">
                {questionTypes.map(type => (
                  <button key={type.id} className="p-4 border rounded-lg hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-left relative">
                    {type.isPremium && (
                      <Badge className="absolute top-1 right-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs">
                        Pro
                      </Badge>
                    )}
                    <div className="text-indigo-600 mb-2">{type.icon}</div>
                    <h4 className="font-medium text-sm">{type.name}</h4>
                    <p className="text-xs text-gray-500">{type.description}</p>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Themes Dialog */}
        <Dialog open={showThemesDialog} onOpenChange={setShowThemesDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Choose Theme</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              {formThemes.map(theme => (
                <button key={theme.id} className="p-4 border rounded-lg hover:border-indigo-500 transition-colors text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-full" style={{ backgroundColor: theme.primaryColor }}></div>
                    <span className="font-medium">{theme.name}</span>
                  </div>
                  <div className="h-16 rounded-lg" style={{ backgroundColor: theme.backgroundColor, border: '1px solid #e5e7eb' }}></div>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Analytics Dialog */}
        <Dialog open={showAnalyticsDialog} onOpenChange={setShowAnalyticsDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedForm?.title} - Analytics</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-4 gap-4 py-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                <p className="text-3xl font-bold text-blue-600">{selectedForm?.total_views || 0}</p>
                <p className="text-sm text-gray-500">Views</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                <p className="text-3xl font-bold text-green-600">{selectedForm?.total_started || 0}</p>
                <p className="text-sm text-gray-500">Started</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                <p className="text-3xl font-bold text-indigo-600">{selectedForm?.total_completed || 0}</p>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                <p className="text-3xl font-bold text-purple-600">{selectedForm?.completion_rate?.toFixed(0) || 0}%</p>
                <p className="text-sm text-gray-500">Completion</p>
              </div>
            </div>
            <div className="h-64 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center">
              <Activity className="h-12 w-12 text-indigo-300" />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
