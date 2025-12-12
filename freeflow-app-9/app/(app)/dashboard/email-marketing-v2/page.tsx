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
  Zap
} from 'lucide-react'

/**
 * Email Marketing V2 - Groundbreaking Email Campaign Management
 * Showcases email marketing features with modern components
 */
export default function EmailMarketingV2() {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'draft' | 'scheduled' | 'sent'>('all')

  const stats = [
    { label: 'Total Sent', value: '12.4K', change: 25.3, icon: <Mail className="w-5 h-5" /> },
    { label: 'Open Rate', value: '42%', change: 8.3, icon: <Eye className="w-5 h-5" /> },
    { label: 'Click Rate', value: '12%', change: 15.2, icon: <MousePointer className="w-5 h-5" /> },
    { label: 'Subscribers', value: '8,470', change: 18.7, icon: <Users className="w-5 h-5" /> }
  ]

  const campaigns = [
    {
      id: '1',
      title: 'Weekly Newsletter #47',
      subject: 'Your weekly roundup of industry insights',
      status: 'sent',
      sentDate: '2 days ago',
      recipients: 8470,
      openRate: 42,
      clickRate: 12,
      conversions: 89
    },
    {
      id: '2',
      title: 'Product Launch Announcement',
      subject: 'Introducing our game-changing new feature',
      status: 'scheduled',
      scheduledDate: 'Tomorrow 9:00 AM',
      recipients: 8470,
      openRate: 0,
      clickRate: 0,
      conversions: 0
    },
    {
      id: '3',
      title: 'Customer Success Stories',
      subject: 'See how teams are achieving amazing results',
      status: 'draft',
      lastEdited: '5 hours ago',
      recipients: 0,
      openRate: 0,
      clickRate: 0,
      conversions: 0
    },
    {
      id: '4',
      title: 'Spring Sale Promotion',
      subject: '🌸 Limited time: 30% off all plans',
      status: 'sent',
      sentDate: '1 week ago',
      recipients: 8470,
      openRate: 56,
      clickRate: 18,
      conversions: 247
    }
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
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Send className="w-3 h-3" />
      case 'scheduled': return <Clock className="w-3 h-3" />
      case 'draft': return <Edit className="w-3 h-3" />
      default: return <Mail className="w-3 h-3" />
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
          <GradientButton from="rose" to="pink" onClick={() => console.log('New campaign')}>
            <Plus className="w-5 h-5 mr-2" />
            New Campaign
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Plus />} title="New Campaign" description="Create email" onClick={() => console.log('New')} />
          <BentoQuickAction icon={<Copy />} title="Templates" description="Pre-designed" onClick={() => console.log('Templates')} />
          <BentoQuickAction icon={<Users />} title="Subscribers" description="Manage lists" onClick={() => console.log('Subscribers')} />
          <BentoQuickAction icon={<TrendingUp />} title="Analytics" description="Performance" onClick={() => console.log('Analytics')} />
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
              <h3 className="text-xl font-semibold mb-4">Email Campaigns</h3>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
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
                                  {campaign.recipients.toLocaleString()} sent
                                </span>
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  {campaign.openRate}% opens
                                </span>
                                <span className="flex items-center gap-1">
                                  <MousePointer className="w-3 h-3" />
                                  {campaign.clickRate}% clicks
                                </span>
                                <span className="flex items-center gap-1">
                                  <Award className="w-3 h-3" />
                                  {campaign.conversions} conversions
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {campaign.sentDate}
                                </span>
                              </>
                            )}
                            {campaign.status === 'scheduled' && (
                              <>
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {campaign.recipients.toLocaleString()} recipients
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Scheduled: {campaign.scheduledDate}
                                </span>
                              </>
                            )}
                            {campaign.status === 'draft' && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Last edited {campaign.lastEdited}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t">
                        {campaign.status === 'draft' && (
                          <>
                            <ModernButton variant="outline" size="sm" onClick={() => console.log('Edit', campaign.id)}>
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </ModernButton>
                            <ModernButton variant="outline" size="sm" onClick={() => console.log('Schedule', campaign.id)}>
                              <Clock className="w-3 h-3 mr-1" />
                              Schedule
                            </ModernButton>
                          </>
                        )}
                        {campaign.status === 'scheduled' && (
                          <>
                            <ModernButton variant="outline" size="sm" onClick={() => console.log('Edit', campaign.id)}>
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </ModernButton>
                            <ModernButton variant="outline" size="sm" onClick={() => console.log('Send Now', campaign.id)}>
                              <Send className="w-3 h-3 mr-1" />
                              Send Now
                            </ModernButton>
                          </>
                        )}
                        {campaign.status === 'sent' && (
                          <>
                            <ModernButton variant="outline" size="sm" onClick={() => console.log('View', campaign.id)}>
                              <Eye className="w-3 h-3 mr-1" />
                              View Report
                            </ModernButton>
                            <ModernButton variant="outline" size="sm" onClick={() => console.log('Duplicate', campaign.id)}>
                              <Copy className="w-3 h-3 mr-1" />
                              Duplicate
                            </ModernButton>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
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
                    onClick={() => console.log('Use template', template.name)}
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
              current={{ label: 'This Month', value: 12400 }}
              previous={{ label: 'Last Month', value: 9800 }}
            />

            <ProgressCard
              title="Monthly Email Goal"
              current={12400}
              goal={15000}
              unit=""
              icon={<Mail className="w-5 h-5" />}
            />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance</h3>
              <div className="space-y-3">
                <MiniKPI label="Avg Open Rate" value="42%" change={8.3} />
                <MiniKPI label="Avg Click Rate" value="12%" change={15.2} />
                <MiniKPI label="Bounce Rate" value="2.1%" change={-12.5} />
                <MiniKPI label="Unsubscribe Rate" value="0.3%" change={-5.2} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
