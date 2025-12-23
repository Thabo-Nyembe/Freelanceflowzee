'use client'

import { useState, useCallback, useMemo } from 'react'
import { useForms, type Form, type FormStatus, type FormType } from '@/lib/hooks/use-forms'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  FileText, Plus, Search, Eye, Edit3, Copy, Trash2, Share2, Settings,
  BarChart3, Users, Clock, CheckCircle, XCircle, ChevronRight, ChevronDown,
  Type, List, Hash, Star, Calendar, Upload, ToggleLeft, AlignLeft, MessageSquare,
  Image as ImageIcon, Link2, Mail, Phone, MapPin, CreditCard, Percent, ArrowRight,
  Play, Pause, Archive, ExternalLink, Code, Zap, Bell, Download, Filter,
  TrendingUp, TrendingDown, PieChart, Activity, Target, Sparkles, Wand2, Palette,
  Layout, Grid3X3, Layers, Smartphone, Monitor, Globe, Lock, Unlock, RefreshCw
} from 'lucide-react'

interface FormsClientProps {
  initialForms: Form[]
}

// Typeform-style question types
interface QuestionType {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  category: 'text' | 'choice' | 'rating' | 'date' | 'file' | 'contact' | 'payment'
}

const questionTypes: QuestionType[] = [
  { id: 'short_text', name: 'Short Text', icon: <Type className="w-5 h-5" />, description: 'Single line answer', category: 'text' },
  { id: 'long_text', name: 'Long Text', icon: <AlignLeft className="w-5 h-5" />, description: 'Multi-line answer', category: 'text' },
  { id: 'multiple_choice', name: 'Multiple Choice', icon: <List className="w-5 h-5" />, description: 'Select one option', category: 'choice' },
  { id: 'checkboxes', name: 'Checkboxes', icon: <CheckCircle className="w-5 h-5" />, description: 'Select multiple options', category: 'choice' },
  { id: 'dropdown', name: 'Dropdown', icon: <ChevronDown className="w-5 h-5" />, description: 'Select from list', category: 'choice' },
  { id: 'opinion_scale', name: 'Opinion Scale', icon: <Hash className="w-5 h-5" />, description: '0-10 scale rating', category: 'rating' },
  { id: 'star_rating', name: 'Star Rating', icon: <Star className="w-5 h-5" />, description: '1-5 star rating', category: 'rating' },
  { id: 'nps', name: 'NPS', icon: <TrendingUp className="w-5 h-5" />, description: 'Net Promoter Score', category: 'rating' },
  { id: 'date', name: 'Date', icon: <Calendar className="w-5 h-5" />, description: 'Date picker', category: 'date' },
  { id: 'file_upload', name: 'File Upload', icon: <Upload className="w-5 h-5" />, description: 'Upload files', category: 'file' },
  { id: 'email', name: 'Email', icon: <Mail className="w-5 h-5" />, description: 'Email address', category: 'contact' },
  { id: 'phone', name: 'Phone', icon: <Phone className="w-5 h-5" />, description: 'Phone number', category: 'contact' },
  { id: 'website', name: 'Website', icon: <Globe className="w-5 h-5" />, description: 'URL input', category: 'contact' },
  { id: 'payment', name: 'Payment', icon: <CreditCard className="w-5 h-5" />, description: 'Collect payments', category: 'payment' },
]

// Mock form templates
interface FormTemplate {
  id: string
  name: string
  description: string
  icon: string
  category: string
  questions: number
  color: string
}

const formTemplates: FormTemplate[] = [
  { id: '1', name: 'Contact Form', description: 'Simple contact form', icon: '📬', category: 'Basic', questions: 5, color: 'from-blue-500 to-cyan-500' },
  { id: '2', name: 'Customer Feedback', description: 'Collect feedback', icon: '💬', category: 'Feedback', questions: 8, color: 'from-purple-500 to-pink-500' },
  { id: '3', name: 'Event Registration', description: 'Register attendees', icon: '🎫', category: 'Events', questions: 12, color: 'from-green-500 to-emerald-500' },
  { id: '4', name: 'Job Application', description: 'Hiring pipeline', icon: '💼', category: 'HR', questions: 15, color: 'from-orange-500 to-red-500' },
  { id: '5', name: 'Product Survey', description: 'Product feedback', icon: '📊', category: 'Survey', questions: 10, color: 'from-indigo-500 to-purple-500' },
  { id: '6', name: 'NPS Survey', description: 'Net Promoter Score', icon: '⭐', category: 'Survey', questions: 3, color: 'from-yellow-500 to-orange-500' },
]

// Mock integrations
interface Integration {
  id: string
  name: string
  icon: string
  description: string
  connected: boolean
}

const integrations: Integration[] = [
  { id: '1', name: 'Slack', icon: '💬', description: 'Get notified on submissions', connected: true },
  { id: '2', name: 'Google Sheets', icon: '📊', description: 'Sync responses', connected: true },
  { id: '3', name: 'Mailchimp', icon: '✉️', description: 'Add to email lists', connected: false },
  { id: '4', name: 'Zapier', icon: '⚡', description: 'Connect 5000+ apps', connected: true },
  { id: '5', name: 'Stripe', icon: '💳', description: 'Accept payments', connected: false },
  { id: '6', name: 'HubSpot', icon: '🧡', description: 'CRM integration', connected: false },
]

// Extended form with analytics
interface FormWithAnalytics extends Form {
  dropOffRate?: number
  avgTimePerQuestion?: number
  topQuestion?: string
  bounceRate?: number
  mobilePercentage?: number
  responsesByDay?: { date: string; count: number }[]
}

export default function FormsClient({ initialForms }: FormsClientProps) {
  const [statusFilter, setStatusFilter] = useState<FormStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<FormType | 'all'>('all')
  const [activeTab, setActiveTab] = useState('forms')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedForm, setSelectedForm] = useState<FormWithAnalytics | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false)
  const [showQuestionTypesDialog, setShowQuestionTypesDialog] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const { forms, loading, error } = useForms({
    status: statusFilter,
    formType: typeFilter,
    limit: 50
  })

  const displayForms = useMemo(() => {
    const allForms = forms.length > 0 ? forms : initialForms
    if (!searchQuery) return allForms.filter(f => statusFilter === 'all' || f.status === statusFilter)
    return allForms.filter(f =>
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (statusFilter === 'all' || f.status === statusFilter)
    )
  }, [forms, initialForms, searchQuery, statusFilter])

  const stats = useMemo(() => ({
    total: displayForms.length,
    active: displayForms.filter(f => f.status === 'active').length,
    totalSubmissions: displayForms.reduce((acc, f) => acc + (f.total_submissions || 0), 0),
    totalViews: displayForms.reduce((acc, f) => acc + (f.total_views || 0), 0),
    avgCompletionRate: displayForms.length > 0
      ? displayForms.reduce((acc, f) => acc + (f.completion_rate || 0), 0) / displayForms.length
      : 0
  }), [displayForms])

  const getStatusColor = (status: FormStatus) => {
    const colors: Record<string, string> = {
      'draft': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
      'active': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'paused': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      'closed': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'archived': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
    return colors[status] || colors.draft
  }

  const getStatusIcon = (status: FormStatus) => {
    switch (status) {
      case 'active': return <Play className="w-3 h-3" />
      case 'paused': return <Pause className="w-3 h-3" />
      case 'closed': return <XCircle className="w-3 h-3" />
      case 'archived': return <Archive className="w-3 h-3" />
      default: return <Edit3 className="w-3 h-3" />
    }
  }

  const handleViewAnalytics = (form: FormWithAnalytics) => {
    setSelectedForm(form)
    setShowAnalyticsDialog(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <FileText className="w-8 h-8 text-white" />
              </div>
              Forms
            </h1>
            <p className="text-muted-foreground">Typeform-style beautiful, conversational forms</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTemplatesDialog(true)}
              className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Wand2 className="w-4 h-4" />
              Templates
            </button>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg flex items-center gap-2 hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Form
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Forms</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Play className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Submissions</p>
                  <p className="text-2xl font-bold text-indigo-600">{stats.totalSubmissions.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Views</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalViews.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Eye className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completion</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.avgCompletionRate.toFixed(1)}%</p>
                </div>
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Target className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-white/50 dark:bg-gray-800/50 p-1 rounded-lg">
              <TabsTrigger value="forms" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                <FileText className="w-4 h-4 mr-2" />
                Forms
              </TabsTrigger>
              <TabsTrigger value="responses" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                <MessageSquare className="w-4 h-4 mr-2" />
                Responses
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="integrations" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                <Zap className="w-4 h-4 mr-2" />
                Integrations
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search forms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

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

            {/* Forms Grid/List */}
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
                <p className="mt-4 text-muted-foreground">Loading forms...</p>
              </div>
            ) : displayForms.length === 0 ? (
              <Card className="py-16 text-center">
                <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No forms found</h3>
                <p className="text-muted-foreground mb-6">Create your first form to get started</p>
                <button
                  onClick={() => setShowCreateDialog(true)}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg"
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  Create Form
                </button>
              </Card>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {displayForms.map((form) => (
                  <Card key={form.id} className="overflow-hidden hover:shadow-lg transition-all group">
                    {/* Form preview gradient header */}
                    <div className="h-24 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 relative">
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                        <div className="flex items-center gap-2">
                          <button className="p-2 bg-white rounded-lg text-gray-800 hover:bg-gray-100">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 bg-white rounded-lg text-gray-800 hover:bg-gray-100">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleViewAnalytics(form)}
                            className="p-2 bg-white rounded-lg text-gray-800 hover:bg-gray-100"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{form.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {form.description || 'No description'}
                          </p>
                        </div>
                        <Badge className={getStatusColor(form.status)}>
                          {getStatusIcon(form.status)}
                          <span className="ml-1">{form.status}</span>
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 py-4 border-y">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-indigo-600">{form.total_submissions}</p>
                          <p className="text-xs text-muted-foreground">Responses</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">{form.completion_rate.toFixed(0)}%</p>
                          <p className="text-xs text-muted-foreground">Completion</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{form.field_count}</p>
                          <p className="text-xs text-muted-foreground">Questions</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(form.updated_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedForm(form)
                              setShowShareDialog(true)
                            }}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                            <Copy className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
                <CardTitle>Recent Responses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <Avatar>
                        <AvatarImage src={`https://avatar.vercel.sh/user${i}`} />
                        <AvatarFallback>U{i}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">Response #{100 - i}</p>
                        <p className="text-sm text-muted-foreground">Customer Feedback Form</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{i} hours ago</p>
                        <Badge className="bg-green-100 text-green-700">Complete</Badge>
                      </div>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <Eye className="w-4 h-4" />
                      </button>
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
                  <div className="h-48 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-12 h-12 text-blue-300" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg flex items-center justify-center">
                    <PieChart className="w-12 h-12 text-purple-300" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Device Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Monitor className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Desktop</span>
                          <span className="text-sm font-medium">58%</span>
                        </div>
                        <Progress value={58} className="h-2" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-green-600" />
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Mobile</span>
                          <span className="text-sm font-medium">38%</span>
                        </div>
                        <Progress value={38} className="h-2" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Layout className="w-5 h-5 text-purple-600" />
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Tablet</span>
                          <span className="text-sm font-medium">4%</span>
                        </div>
                        <Progress value={4} className="h-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Question drop-off analysis */}
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
                      <span className="text-sm text-muted-foreground w-8">Q{i + 1}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{q.question}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={(q.completed / q.views) * 100} className="h-2 flex-1" />
                          <span className="text-xs text-muted-foreground">{q.completed}/{q.views}</span>
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
          <TabsContent value="integrations" className="space-y-6">
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
                        <p className="text-sm text-muted-foreground mt-1">{integration.description}</p>
                        <button className={`mt-4 px-4 py-2 rounded-lg text-sm ${
                          integration.connected
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                            : 'bg-indigo-600 text-white'
                        }`}>
                          {integration.connected ? 'Configure' : 'Connect'}
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Form Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Form</DialogTitle>
              <DialogDescription>Start from scratch or use a template</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Form Name</Label>
                <Input placeholder="My new form" className="mt-1" />
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
                  <p className="text-xs text-muted-foreground">Build from scratch</p>
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
                  <p className="text-xs text-muted-foreground">Pre-built forms</p>
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Templates Dialog */}
        <Dialog open={showTemplatesDialog} onOpenChange={setShowTemplatesDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Choose a Template</DialogTitle>
              <DialogDescription>Start with a pre-built form template</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
              {formTemplates.map(template => (
                <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden">
                  <div className={`h-20 bg-gradient-to-r ${template.color}`} />
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{template.icon}</span>
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                        <Badge variant="secondary" className="mt-2">{template.questions} questions</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Question Types Dialog */}
        <Dialog open={showQuestionTypesDialog} onOpenChange={setShowQuestionTypesDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Question</DialogTitle>
              <DialogDescription>Choose a question type</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-4">
              {questionTypes.map(type => (
                <button
                  key={type.id}
                  className="p-4 border rounded-lg hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-left"
                >
                  <div className="text-indigo-600 mb-2">{type.icon}</div>
                  <h4 className="font-medium text-sm">{type.name}</h4>
                  <p className="text-xs text-muted-foreground">{type.description}</p>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Share Dialog */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Share Form</DialogTitle>
              <DialogDescription>Share your form with others</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Form Link</span>
                  <button className="text-indigo-600 text-sm">Copy</button>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  https://freeflow.io/form/{selectedForm?.id || 'abc123'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-center">
                  <Link2 className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs">Link</span>
                </button>
                <button className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-center">
                  <Code className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs">Embed</span>
                </button>
                <button className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-center">
                  <Mail className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs">Email</span>
                </button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {selectedForm?.is_public ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  <span className="text-sm">{selectedForm?.is_public ? 'Public' : 'Private'}</span>
                </div>
                <button className="text-indigo-600 text-sm">Change</button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Analytics Dialog */}
        <Dialog open={showAnalyticsDialog} onOpenChange={setShowAnalyticsDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedForm?.title} - Analytics</DialogTitle>
              <DialogDescription>Form performance insights</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-4 gap-4 py-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center">
                <p className="text-3xl font-bold text-blue-600">{selectedForm?.total_views || 0}</p>
                <p className="text-sm text-muted-foreground">Views</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center">
                <p className="text-3xl font-bold text-green-600">{selectedForm?.total_started || 0}</p>
                <p className="text-sm text-muted-foreground">Started</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center">
                <p className="text-3xl font-bold text-indigo-600">{selectedForm?.total_completed || 0}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center">
                <p className="text-3xl font-bold text-purple-600">{selectedForm?.completion_rate.toFixed(0) || 0}%</p>
                <p className="text-sm text-muted-foreground">Completion</p>
              </div>
            </div>
            <div className="h-64 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg flex items-center justify-center">
              <Activity className="w-12 h-12 text-blue-300" />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
