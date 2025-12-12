"use client"

import { useState } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  ActivityFeed,
  MiniKPI,
  ProgressCard
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  Target,
  Plus,
  Search,
  Users,
  TrendingUp,
  Mail,
  Phone,
  CheckCircle,
  Clock,
  Award,
  Zap
} from 'lucide-react'

/**
 * Lead Generation V2 - Groundbreaking Lead Management
 * Showcases lead pipeline with modern components
 */
export default function LeadGenerationV2() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'new' | 'qualified' | 'contacted'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const stats = [
    { label: 'Total Leads', value: '1,247', change: 25.3, icon: <Target className="w-5 h-5" /> },
    { label: 'Qualified', value: '342', change: 18.7, icon: <CheckCircle className="w-5 h-5" /> },
    { label: 'Conversion Rate', value: '28%', change: 12.5, icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Pipeline Value', value: '$847K', change: 32.1, icon: <Award className="w-5 h-5" /> }
  ]

  const leads = [
    {
      id: '1',
      name: 'Sarah Johnson',
      company: 'Tech Innovations',
      email: 'sarah@techinnovations.com',
      phone: '+1 (555) 123-4567',
      status: 'qualified',
      score: 92,
      source: 'Website',
      createdAt: '2 hours ago'
    },
    {
      id: '2',
      name: 'Michael Chen',
      company: 'Digital Solutions',
      email: 'michael@digitalsolutions.com',
      phone: '+1 (555) 234-5678',
      status: 'new',
      score: 78,
      source: 'LinkedIn',
      createdAt: '5 hours ago'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      company: 'StartUp Hub',
      email: 'emily@startuphub.com',
      phone: '+1 (555) 345-6789',
      status: 'contacted',
      score: 85,
      source: 'Referral',
      createdAt: '1 day ago'
    }
  ]

  const recentActivity = [
    { icon: <Plus className="w-5 h-5" />, title: 'New lead captured', description: 'Sarah Johnson via website form', time: '2 hours ago', status: 'success' as const },
    { icon: <Mail className="w-5 h-5" />, title: 'Email sent', description: 'Follow-up to Michael Chen', time: '4 hours ago', status: 'info' as const },
    { icon: <CheckCircle className="w-5 h-5" />, title: 'Lead qualified', description: 'Emily Rodriguez marked as qualified', time: '1 day ago', status: 'success' as const },
    { icon: <Phone className="w-5 h-5" />, title: 'Call scheduled', description: 'Discovery call with David Kim', time: '2 days ago', status: 'info' as const }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700'
      case 'qualified': return 'bg-green-100 text-green-700'
      case 'contacted': return 'bg-purple-100 text-purple-700'
      case 'converted': return 'bg-emerald-100 text-emerald-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-gray-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50/30 to-red-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Target className="w-10 h-10 text-pink-600" />
              Lead Generation
            </h1>
            <p className="text-muted-foreground">Capture and convert high-quality leads</p>
          </div>
          <GradientButton from="pink" to="rose" onClick={() => console.log('Add lead')}>
            <Plus className="w-5 h-5 mr-2" />
            Add Lead
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Plus />} title="Add Lead" description="Manual entry" onClick={() => console.log('Add')} />
          <BentoQuickAction icon={<Mail />} title="Email Campaign" description="Outreach" onClick={() => console.log('Email')} />
          <BentoQuickAction icon={<Zap />} title="Auto-Qualify" description="AI scoring" onClick={() => console.log('Qualify')} />
          <BentoQuickAction icon={<Award />} title="Reports" description="Analytics" onClick={() => console.log('Reports')} />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <PillButton variant={selectedFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('all')}>All</PillButton>
            <PillButton variant={selectedFilter === 'new' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('new')}>New</PillButton>
            <PillButton variant={selectedFilter === 'qualified' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('qualified')}>Qualified</PillButton>
            <PillButton variant={selectedFilter === 'contacted' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('contacted')}>Contacted</PillButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Leads Pipeline</h3>
              <div className="space-y-4">
                {leads.map((lead) => (
                  <div key={lead.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-950 flex items-center justify-center">
                        <Users className="w-6 h-6 text-pink-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{lead.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(lead.status)}`}>
                            {lead.status}
                          </span>
                          <span className={`text-xs font-bold ${getScoreColor(lead.score)}`}>
                            Score: {lead.score}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{lead.company}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {lead.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {lead.phone}
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {lead.source}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {lead.createdAt}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ModernButton variant="outline" size="sm" onClick={() => console.log('View', lead.id)}>
                          View
                        </ModernButton>
                        <ModernButton variant="outline" size="sm" onClick={() => console.log('Contact', lead.id)}>
                          <Mail className="w-3 h-3 mr-1" />
                          Contact
                        </ModernButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <ProgressCard
              title="Monthly Lead Goal"
              current={1247}
              goal={1500}
              unit=""
              icon={<Target className="w-5 h-5" />}
            />

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Lead Sources</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium">Website</span>
                  <span className="text-sm font-bold">487</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium">LinkedIn</span>
                  <span className="text-sm font-bold">342</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium">Referral</span>
                  <span className="text-sm font-bold">245</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium">Email</span>
                  <span className="text-sm font-bold">173</span>
                </div>
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance</h3>
              <div className="space-y-3">
                <MiniKPI label="Avg Lead Score" value="82" change={12.5} />
                <MiniKPI label="Response Time" value="2.4h" change={-15.2} />
                <MiniKPI label="Qualification Rate" value="27%" change={8.3} />
                <MiniKPI label="Cost per Lead" value="$42" change={-12.5} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
