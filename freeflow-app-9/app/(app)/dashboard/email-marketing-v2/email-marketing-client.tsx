"use client"

import { useState } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  MiniKPI,
  ProgressCard,
  ComparisonCard
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  Mail,
  Plus,
  Send,
  Users,
  TrendingUp,
  Eye,
  MousePointer,
  Award,
  Clock,
  Edit,
  Copy,
  Trash2,
  Zap,
  RefreshCw
} from 'lucide-react'
import { useEmailCampaigns, useEmailSubscribers, useEmailTemplates, EmailCampaign, EmailSubscriber, EmailTemplate } from '@/lib/hooks/use-email-marketing'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface EmailMarketingClientProps {
  initialCampaigns: EmailCampaign[]
  initialSubscribers: EmailSubscriber[]
  initialTemplates: EmailTemplate[]
}

export default function EmailMarketingClient({
  initialCampaigns,
  initialSubscribers,
  initialTemplates
}: EmailMarketingClientProps) {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'draft' | 'scheduled' | 'sent'>('all')
  const [showNewCampaign, setShowNewCampaign] = useState(false)
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    subject: '',
    preview_text: '',
    campaign_type: 'newsletter'
  })

  const {
    campaigns,
    loading: campaignsLoading,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    scheduleCampaign,
    sendCampaign,
    getStats
  } = useEmailCampaigns()
  const { subscribers } = useEmailSubscribers()
  const { templates } = useEmailTemplates()

  const displayCampaigns = campaigns.length > 0 ? campaigns : initialCampaigns
  const displaySubscribers = subscribers.length > 0 ? subscribers : initialSubscribers
  const displayTemplates = templates.length > 0 ? templates : initialTemplates
  const stats = getStats()

  const totalSent = displayCampaigns.filter(c => c.status === 'sent').reduce((sum, c) => sum + c.sent_count, 0)
  const avgOpenRate = displayCampaigns.filter(c => c.status === 'sent').length > 0
    ? displayCampaigns.filter(c => c.status === 'sent').reduce((sum, c) => sum + c.open_rate, 0) / displayCampaigns.filter(c => c.status === 'sent').length
    : 0

  const statCards = [
    { label: 'Total Sent', value: totalSent > 1000 ? `${(totalSent / 1000).toFixed(1)}K` : totalSent.toString(), change: 25.3, icon: <Mail className="w-5 h-5" /> },
    { label: 'Open Rate', value: `${avgOpenRate.toFixed(0)}%`, change: 8.3, icon: <Eye className="w-5 h-5" /> },
    { label: 'Click Rate', value: `${stats.avgClickRate.toFixed(0)}%`, change: 15.2, icon: <MousePointer className="w-5 h-5" /> },
    { label: 'Subscribers', value: displaySubscribers.filter(s => s.status === 'subscribed').length.toLocaleString(), change: 18.7, icon: <Users className="w-5 h-5" /> }
  ]

  const emailTemplates = [
    { name: 'Newsletter', description: 'Weekly content roundup', color: 'from-blue-500 to-cyan-500' },
    { name: 'Product Update', description: 'Feature announcements', color: 'from-purple-500 to-pink-500' },
    { name: 'Promotion', description: 'Sales & discounts', color: 'from-orange-500 to-red-500' },
    { name: 'Onboarding', description: 'Welcome series', color: 'from-green-500 to-emerald-500' }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-700'
      case 'scheduled': return 'bg-blue-100 text-blue-700'
      case 'draft': return 'bg-gray-100 text-gray-700'
      case 'sending': return 'bg-yellow-100 text-yellow-700'
      case 'paused': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Send className="w-3 h-3" />
      case 'scheduled': return <Clock className="w-3 h-3" />
      case 'draft': return <Edit className="w-3 h-3" />
      case 'sending': return <RefreshCw className="w-3 h-3 animate-spin" />
      default: return <Mail className="w-3 h-3" />
    }
  }

  const filteredCampaigns = selectedStatus === 'all'
    ? displayCampaigns
    : displayCampaigns.filter(c => c.status === selectedStatus)

  const handleCreateCampaign = async () => {
    if (!newCampaign.title || !newCampaign.subject) return
    try {
      await createCampaign(newCampaign)
      setShowNewCampaign(false)
      setNewCampaign({ title: '', subject: '', preview_text: '', campaign_type: 'newsletter' })
    } catch (error) {
      console.error('Failed to create campaign:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50/30 to-purple-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Mail className="w-10 h-10 text-rose-600" />
              Email Marketing
            </h1>
            <p className="text-muted-foreground">Create and manage email campaigns</p>
          </div>
          <GradientButton from="rose" to="pink" onClick={() => setShowNewCampaign(true)}>
            <Plus className="w-5 h-5 mr-2" />
            New Campaign
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={statCards} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Plus />} title="New Campaign" description="Create email" onClick={() => setShowNewCampaign(true)} />
          <BentoQuickAction icon={<Copy />} title="Templates" description={`${displayTemplates.length} available`} onClick={() => {}} />
          <BentoQuickAction icon={<Users />} title="Subscribers" description={`${displaySubscribers.length} total`} onClick={() => {}} />
          <BentoQuickAction icon={<TrendingUp />} title="Analytics" description="Performance" onClick={() => {}} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedStatus === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('all')}>
            All Campaigns
          </PillButton>
          <PillButton variant={selectedStatus === 'draft' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('draft')}>
            <Edit className="w-4 h-4 mr-2" />
            Drafts
          </PillButton>
          <PillButton variant={selectedStatus === 'scheduled' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('scheduled')}>
            <Clock className="w-4 h-4 mr-2" />
            Scheduled
          </PillButton>
          <PillButton variant={selectedStatus === 'sent' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('sent')}>
            <Send className="w-4 h-4 mr-2" />
            Sent
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Email Campaigns</h3>
                {campaignsLoading && <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />}
              </div>
              <div className="space-y-4">
                {filteredCampaigns.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No campaigns yet. Create your first campaign!</p>
                  </div>
                ) : (
                  filteredCampaigns.map((campaign) => (
                    <div key={campaign.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{campaign.title}</h4>
                              <span className={`text-xs px-2 py-1 rounded-md flex items-center gap-1 ${getStatusColor(campaign.status)}`}>
                                {getStatusIcon(campaign.status)}
                                {campaign.status}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{campaign.subject}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {campaign.status === 'sent' && (
                                <>
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {campaign.sent_count.toLocaleString()} sent
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    {campaign.open_rate.toFixed(0)}% opens
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MousePointer className="w-3 h-3" />
                                    {campaign.click_rate.toFixed(0)}% clicks
                                  </span>
                                </>
                              )}
                              {campaign.status === 'scheduled' && campaign.scheduled_at && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Scheduled: {new Date(campaign.scheduled_at).toLocaleDateString()}
                                </span>
                              )}
                              {campaign.status === 'draft' && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Last edited {new Date(campaign.updated_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t">
                          {campaign.status === 'draft' && (
                            <>
                              <ModernButton variant="outline" size="sm" onClick={() => {}}>
                                <Edit className="w-3 h-3 mr-1" />
                                Edit
                              </ModernButton>
                              <ModernButton variant="outline" size="sm" onClick={() => scheduleCampaign(campaign.id, new Date(Date.now() + 86400000).toISOString())}>
                                <Clock className="w-3 h-3 mr-1" />
                                Schedule
                              </ModernButton>
                              <ModernButton variant="outline" size="sm" onClick={() => sendCampaign(campaign.id)}>
                                <Send className="w-3 h-3 mr-1" />
                                Send Now
                              </ModernButton>
                            </>
                          )}
                          {campaign.status === 'scheduled' && (
                            <>
                              <ModernButton variant="outline" size="sm" onClick={() => {}}>
                                <Edit className="w-3 h-3 mr-1" />
                                Edit
                              </ModernButton>
                              <ModernButton variant="outline" size="sm" onClick={() => sendCampaign(campaign.id)}>
                                <Send className="w-3 h-3 mr-1" />
                                Send Now
                              </ModernButton>
                            </>
                          )}
                          {campaign.status === 'sent' && (
                            <>
                              <ModernButton variant="outline" size="sm" onClick={() => {}}>
                                <Eye className="w-3 h-3 mr-1" />
                                View Report
                              </ModernButton>
                              <ModernButton variant="outline" size="sm" onClick={() => {}}>
                                <Copy className="w-3 h-3 mr-1" />
                                Duplicate
                              </ModernButton>
                            </>
                          )}
                          <ModernButton variant="ghost" size="sm" onClick={() => deleteCampaign(campaign.id)}>
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </ModernButton>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Email Templates</h3>
              <div className="space-y-3">
                {emailTemplates.map((template) => (
                  <button
                    key={template.name}
                    onClick={() => {}}
                    className="w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${template.color} flex items-center justify-center`}>
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{template.name}</p>
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </BentoCard>

            <ComparisonCard
              title="This Month vs Last Month"
              current={{ label: 'This Month', value: totalSent }}
              previous={{ label: 'Last Month', value: Math.floor(totalSent * 0.8) }}
            />

            <ProgressCard
              title="Monthly Email Goal"
              current={totalSent}
              goal={15000}
              unit=""
              icon={<Mail className="w-5 h-5" />}
            />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance</h3>
              <div className="space-y-3">
                <MiniKPI label="Avg Open Rate" value={`${avgOpenRate.toFixed(0)}%`} change={8.3} />
                <MiniKPI label="Avg Click Rate" value={`${stats.avgClickRate.toFixed(0)}%`} change={15.2} />
                <MiniKPI label="Bounce Rate" value="2.1%" change={-12.5} />
                <MiniKPI label="Unsubscribe Rate" value="0.3%" change={-5.2} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>

      <Dialog open={showNewCampaign} onOpenChange={setShowNewCampaign}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Email Campaign</DialogTitle>
            <DialogDescription>
              Set up a new email campaign to reach your subscribers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Campaign Title</Label>
              <Input
                id="title"
                value={newCampaign.title}
                onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                placeholder="Weekly Newsletter #48"
              />
            </div>
            <div>
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                value={newCampaign.subject}
                onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                placeholder="Your weekly roundup of insights"
              />
            </div>
            <div>
              <Label htmlFor="preview">Preview Text</Label>
              <Textarea
                id="preview"
                value={newCampaign.preview_text}
                onChange={(e) => setNewCampaign({ ...newCampaign, preview_text: e.target.value })}
                placeholder="This text appears after the subject line..."
              />
            </div>
          </div>
          <DialogFooter>
            <ModernButton variant="outline" onClick={() => setShowNewCampaign(false)}>
              Cancel
            </ModernButton>
            <GradientButton from="rose" to="pink" onClick={handleCreateCampaign}>
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </GradientButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
