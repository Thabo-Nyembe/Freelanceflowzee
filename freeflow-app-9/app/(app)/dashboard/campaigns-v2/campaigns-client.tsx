'use client'
import { useState, useMemo } from 'react'
import { useCampaigns, type Campaign, type CampaignType, type CampaignStatus } from '@/lib/hooks/use-campaigns'
import {
  Mail, Send, BarChart3, Users, Target, Zap, Clock, TrendingUp,
  Plus, Search, Filter, MoreVertical, Play, Pause, CheckCircle2,
  AlertCircle, Edit2, Copy, Trash2, Eye, Calendar, DollarSign,
  MousePointer, ArrowUpRight, Sparkles, MessageSquare, Phone,
  Globe, Settings, FileText, Layout, Layers, GitBranch, Split,
  FlaskConical, Inbox, UserPlus, Tag, Megaphone, ChevronRight,
  RefreshCw, Download, Share2, BarChart2, PieChart, Activity
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

type ViewMode = 'campaigns' | 'automations' | 'templates' | 'audiences' | 'analytics'

interface EmailTemplate {
  id: string
  name: string
  category: string
  thumbnail: string
  usageCount: number
  conversionRate: number
}

interface Audience {
  id: string
  name: string
  count: number
  growthRate: number
  tags: string[]
  lastActivity: string
}

interface AutomationWorkflow {
  id: string
  name: string
  trigger: string
  status: 'active' | 'paused' | 'draft'
  emailsSent: number
  openRate: number
  clickRate: number
}

export default function CampaignsClient({ initialCampaigns }: { initialCampaigns: Campaign[] }) {
  const [campaignTypeFilter, setCampaignTypeFilter] = useState<CampaignType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('campaigns')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [showNewCampaign, setShowNewCampaign] = useState(false)
  const { campaigns, loading, error } = useCampaigns({ campaignType: campaignTypeFilter, status: statusFilter })
  const displayCampaigns = campaigns.length > 0 ? campaigns : initialCampaigns

  // Mock templates
  const templates: EmailTemplate[] = [
    { id: '1', name: 'Welcome Series', category: 'Onboarding', thumbnail: '📧', usageCount: 234, conversionRate: 32.5 },
    { id: '2', name: 'Product Launch', category: 'Announcement', thumbnail: '🚀', usageCount: 156, conversionRate: 28.3 },
    { id: '3', name: 'Newsletter', category: 'Content', thumbnail: '📰', usageCount: 445, conversionRate: 18.7 },
    { id: '4', name: 'Cart Abandonment', category: 'E-commerce', thumbnail: '🛒', usageCount: 312, conversionRate: 45.2 },
    { id: '5', name: 'Re-engagement', category: 'Retention', thumbnail: '💫', usageCount: 189, conversionRate: 22.1 },
    { id: '6', name: 'Promotional Sale', category: 'Sales', thumbnail: '🎉', usageCount: 267, conversionRate: 35.8 }
  ]

  // Mock audiences
  const audiences: Audience[] = [
    { id: '1', name: 'All Subscribers', count: 12450, growthRate: 5.2, tags: ['active', 'engaged'], lastActivity: '2 hours ago' },
    { id: '2', name: 'High-Value Customers', count: 2340, growthRate: 8.7, tags: ['vip', 'purchasers'], lastActivity: '1 day ago' },
    { id: '3', name: 'New Signups (30 days)', count: 890, growthRate: 12.3, tags: ['new', 'onboarding'], lastActivity: '3 hours ago' },
    { id: '4', name: 'Inactive Users', count: 3210, growthRate: -2.1, tags: ['churned', 're-engage'], lastActivity: '30 days ago' },
    { id: '5', name: 'Newsletter Subscribers', count: 8900, growthRate: 3.4, tags: ['content', 'blog'], lastActivity: '5 hours ago' }
  ]

  // Mock automations
  const automations: AutomationWorkflow[] = [
    { id: '1', name: 'Welcome Email Series', trigger: 'New signup', status: 'active', emailsSent: 4532, openRate: 68.2, clickRate: 24.5 },
    { id: '2', name: 'Abandoned Cart Recovery', trigger: 'Cart abandonment', status: 'active', emailsSent: 1234, openRate: 52.1, clickRate: 31.2 },
    { id: '3', name: 'Post-Purchase Follow-up', trigger: 'Order completed', status: 'active', emailsSent: 2890, openRate: 71.4, clickRate: 18.9 },
    { id: '4', name: 'Re-engagement Campaign', trigger: '30 days inactive', status: 'paused', emailsSent: 890, openRate: 28.3, clickRate: 8.7 },
    { id: '5', name: 'Birthday Discount', trigger: 'Birthday', status: 'active', emailsSent: 456, openRate: 82.5, clickRate: 45.2 }
  ]

  const stats = useMemo(() => ({
    total: displayCampaigns.length,
    running: displayCampaigns.filter(c => c.status === 'running').length,
    totalRevenue: displayCampaigns.reduce((sum, c) => sum + c.revenue_generated, 0),
    avgROI: displayCampaigns.length > 0
      ? (displayCampaigns.reduce((sum, c) => sum + (c.roi_percentage || 0), 0) / displayCampaigns.length)
      : 0,
    totalImpressions: displayCampaigns.reduce((sum, c) => sum + c.impressions, 0),
    avgOpenRate: 42.3,
    avgClickRate: 12.8,
    totalSubscribers: 12450
  }), [displayCampaigns])

  const filteredCampaigns = useMemo(() => {
    let filtered = displayCampaigns
    if (campaignTypeFilter !== 'all') {
      filtered = filtered.filter(c => c.campaign_type === campaignTypeFilter)
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter)
    }
    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.campaign_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    return filtered
  }, [displayCampaigns, campaignTypeFilter, statusFilter, searchQuery])

  const getCampaignIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />
      case 'sms': return <MessageSquare className="h-4 w-4" />
      case 'social': return <Globe className="h-4 w-4" />
      case 'multi_channel': return <Layers className="h-4 w-4" />
      default: return <Megaphone className="h-4 w-4" />
    }
  }

  if (error) return <div className="p-8"><div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 text-white">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Megaphone className="h-8 w-8" />
                <h1 className="text-3xl font-bold">Marketing Hub</h1>
              </div>
              <p className="text-rose-100">Create, automate, and analyze your marketing campaigns</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm">AI-Powered</span>
              </div>
              <button
                onClick={() => setShowNewCampaign(true)}
                className="flex items-center gap-2 bg-white text-rose-600 px-4 py-2 rounded-lg font-medium hover:bg-rose-50 transition-colors"
              >
                <Plus className="h-4 w-4" />
                New Campaign
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="h-4 w-4 text-rose-200" />
                <span className="text-rose-200 text-sm">Campaigns</span>
              </div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Play className="h-4 w-4 text-rose-200" />
                <span className="text-rose-200 text-sm">Active</span>
              </div>
              <div className="text-2xl font-bold">{stats.running}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-rose-200" />
                <span className="text-rose-200 text-sm">Subscribers</span>
              </div>
              <div className="text-2xl font-bold">{stats.totalSubscribers.toLocaleString()}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="h-4 w-4 text-rose-200" />
                <span className="text-rose-200 text-sm">Impressions</span>
              </div>
              <div className="text-2xl font-bold">{(stats.totalImpressions / 1000).toFixed(1)}K</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Send className="h-4 w-4 text-rose-200" />
                <span className="text-rose-200 text-sm">Open Rate</span>
              </div>
              <div className="text-2xl font-bold">{stats.avgOpenRate}%</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <MousePointer className="h-4 w-4 text-rose-200" />
                <span className="text-rose-200 text-sm">Click Rate</span>
              </div>
              <div className="text-2xl font-bold">{stats.avgClickRate}%</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-rose-200" />
                <span className="text-rose-200 text-sm">Revenue</span>
              </div>
              <div className="text-2xl font-bold">${(stats.totalRevenue / 1000).toFixed(1)}K</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-rose-200" />
                <span className="text-rose-200 text-sm">Avg ROI</span>
              </div>
              <div className="text-2xl font-bold">{stats.avgROI.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* View Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
            {([
              { key: 'campaigns', label: 'Campaigns', icon: Mail },
              { key: 'automations', label: 'Automations', icon: Zap },
              { key: 'templates', label: 'Templates', icon: Layout },
              { key: 'audiences', label: 'Audiences', icon: Users },
              { key: 'analytics', label: 'Analytics', icon: BarChart3 }
            ] as { key: ViewMode, label: string, icon: any }[]).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setViewMode(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === key
                    ? 'bg-rose-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-64"
              />
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-rose-600 border-r-transparent"></div>
          </div>
        )}

        {/* Campaigns View */}
        {viewMode === 'campaigns' && !loading && (
          <>
            <div className="flex items-center gap-4 mb-6">
              <select
                value={campaignTypeFilter}
                onChange={(e) => setCampaignTypeFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="social">Social</option>
                <option value="multi_channel">Multi-Channel</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="running">Running</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
              </select>
            </div>

            {filteredCampaigns.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No campaigns found</p>
                <button
                  onClick={() => setShowNewCampaign(true)}
                  className="mt-4 inline-flex items-center gap-2 text-rose-600 dark:text-rose-400 font-medium hover:underline"
                >
                  <Plus className="h-4 w-4" />
                  Create your first campaign
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCampaigns.map(campaign => (
                  <div
                    key={campaign.id}
                    onClick={() => setSelectedCampaign(campaign)}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${
                          campaign.status === 'running'
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : campaign.status === 'completed'
                              ? 'bg-blue-100 dark:bg-blue-900/30'
                              : campaign.status === 'paused'
                                ? 'bg-yellow-100 dark:bg-yellow-900/30'
                                : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          {getCampaignIcon(campaign.campaign_type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{campaign.campaign_name}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              campaign.status === 'running' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              campaign.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                              campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {campaign.status}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-xs bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                              {campaign.campaign_type}
                            </span>
                            {campaign.is_automated && (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                Automated
                              </span>
                            )}
                          </div>
                          {campaign.description && <p className="text-sm text-gray-600 dark:text-gray-400">{campaign.description}</p>}
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500 mt-2">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {campaign.audience_size.toLocaleString()} audience
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {campaign.impressions.toLocaleString()} impressions
                            </span>
                            <span className="flex items-center gap-1">
                              <MousePointer className="h-3 w-3" />
                              {campaign.clicks.toLocaleString()} clicks
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-4">
                          {campaign.roi_percentage && (
                            <div>
                              <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{campaign.roi_percentage.toFixed(1)}%</div>
                              <div className="text-xs text-gray-500 dark:text-gray-500">ROI</div>
                            </div>
                          )}
                          {campaign.revenue_generated > 0 && (
                            <div>
                              <div className="text-2xl font-bold text-green-600 dark:text-green-400">${campaign.revenue_generated.toLocaleString()}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-500">Revenue</div>
                            </div>
                          )}
                        </div>
                        {campaign.conversion_rate && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            {campaign.conversion_rate.toFixed(1)}% conversion rate
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      {campaign.status === 'running' ? (
                        <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg">
                          <Pause className="h-3 w-3" />
                          Pause
                        </button>
                      ) : campaign.status === 'paused' ? (
                        <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg">
                          <Play className="h-3 w-3" />
                          Resume
                        </button>
                      ) : null}
                      <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <Edit2 className="h-3 w-3" />
                        Edit
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <Copy className="h-3 w-3" />
                        Duplicate
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <BarChart3 className="h-3 w-3" />
                        Analytics
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Automations View */}
        {viewMode === 'automations' && !loading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600 dark:text-gray-400">Automate your marketing with powerful workflows</p>
              <button className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors">
                <Plus className="h-4 w-4" />
                New Automation
              </button>
            </div>

            {automations.map(automation => (
              <div key={automation.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      automation.status === 'active'
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : automation.status === 'paused'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30'
                          : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <Zap className={`h-5 w-5 ${
                        automation.status === 'active' ? 'text-green-600 dark:text-green-400' :
                        automation.status === 'paused' ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-gray-600 dark:text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{automation.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          automation.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          automation.status === 'paused' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {automation.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Trigger: {automation.trigger}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{automation.emailsSent.toLocaleString()}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">Emails Sent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">{automation.openRate}%</div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">Open Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{automation.clickRate}%</div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">Click Rate</div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Templates View */}
        {viewMode === 'templates' && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map(template => (
              <div key={template.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all cursor-pointer group">
                <div className="h-32 bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 flex items-center justify-center">
                  <span className="text-5xl">{template.thumbnail}</span>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
                      {template.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Used {template.usageCount} times</span>
                    <span className="text-green-600 dark:text-green-400">{template.conversionRate}% CVR</span>
                  </div>
                  <button className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 border border-rose-600 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 opacity-0 group-hover:opacity-100 transition-all">
                    Use Template
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Audiences View */}
        {viewMode === 'audiences' && !loading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600 dark:text-gray-400">Segment and manage your subscriber lists</p>
              <button className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors">
                <Plus className="h-4 w-4" />
                Create Segment
              </button>
            </div>

            {audiences.map(audience => (
              <div key={audience.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                      <Users className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{audience.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {audience.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{audience.count.toLocaleString()}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">Subscribers</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold ${audience.growthRate >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {audience.growthRate >= 0 ? '+' : ''}{audience.growthRate}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">Growth</div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-500">
                      Last active: {audience.lastActivity}
                    </div>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Analytics View */}
        {viewMode === 'analytics' && !loading && (
          <div className="space-y-6">
            {/* Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Email Performance</h3>
                  <Mail className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Open Rate</span>
                    <span className="font-medium text-gray-900 dark:text-white">42.3%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                    <div className="h-full bg-rose-600 rounded-full" style={{ width: '42.3%' }}></div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Click Rate</span>
                    <span className="font-medium text-gray-900 dark:text-white">12.8%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '12.8%' }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Subscriber Growth</h3>
                  <UserPlus className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">+1,234</div>
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <TrendingUp className="h-4 w-4" />
                  <span>12.5% from last month</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Revenue Attribution</h3>
                  <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">${(stats.totalRevenue / 1000).toFixed(1)}K</div>
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <TrendingUp className="h-4 w-4" />
                  <span>8.3% from last month</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">A/B Test Results</h3>
                  <FlaskConical className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">3 Active</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Winner determined in 2 tests
                </div>
              </div>
            </div>

            {/* Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Campaign Performance Over Time</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-center">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">Performance chart</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Channel Breakdown</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">Channel distribution</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Campaign Detail Modal */}
      <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {getCampaignIcon(selectedCampaign?.campaign_type || 'email')}
              {selectedCampaign?.campaign_name}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="audience">Audience</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 mt-4">
              <TabsContent value="overview" className="mt-0 space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCampaign?.audience_size.toLocaleString()}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Audience</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCampaign?.impressions.toLocaleString()}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Impressions</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCampaign?.clicks.toLocaleString()}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Clicks</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{selectedCampaign?.conversions}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Conversions</div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Campaign Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Type:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{selectedCampaign?.campaign_type}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Phase:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{selectedCampaign?.phase}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{selectedCampaign?.status}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Automated:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{selectedCampaign?.is_automated ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="mt-0">
                <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">Campaign analytics</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="audience" className="mt-0">
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Audience insights and segmentation data
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Campaign settings and configuration
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* New Campaign Modal */}
      <Dialog open={showNewCampaign} onOpenChange={setShowNewCampaign}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Plus className="h-6 w-6 text-rose-600" />
              Create New Campaign
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-rose-400 dark:hover:border-rose-500 transition-colors group">
                <Mail className="h-8 w-8 text-gray-400 group-hover:text-rose-600 transition-colors" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Email Campaign</span>
                <span className="text-xs text-gray-500">Send email to your list</span>
              </button>
              <button className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-rose-400 dark:hover:border-rose-500 transition-colors group">
                <Zap className="h-8 w-8 text-gray-400 group-hover:text-rose-600 transition-colors" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Automation</span>
                <span className="text-xs text-gray-500">Create automated workflow</span>
              </button>
              <button className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-rose-400 dark:hover:border-rose-500 transition-colors group">
                <Split className="h-8 w-8 text-gray-400 group-hover:text-rose-600 transition-colors" />
                <span className="font-medium text-gray-700 dark:text-gray-300">A/B Test</span>
                <span className="text-xs text-gray-500">Test and optimize</span>
              </button>
              <button className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-rose-400 dark:hover:border-rose-500 transition-colors group">
                <Layers className="h-8 w-8 text-gray-400 group-hover:text-rose-600 transition-colors" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Multi-Channel</span>
                <span className="text-xs text-gray-500">Email + SMS + Social</span>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
