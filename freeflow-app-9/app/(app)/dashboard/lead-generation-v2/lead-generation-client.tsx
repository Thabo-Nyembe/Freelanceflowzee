'use client'

import { useState } from 'react'
import { useLeads, Lead, LeadStats } from '@/lib/hooks/use-leads'
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
  Zap,
  X,
  Loader2,
  Trash2,
  Star
} from 'lucide-react'

interface LeadGenerationClientProps {
  initialLeads: Lead[]
  initialStats: LeadStats
}

export default function LeadGenerationClient({ initialLeads, initialStats }: LeadGenerationClientProps) {
  const {
    leads,
    stats,
    loading,
    createLead,
    deleteLead,
    qualifyLead,
    contactLead,
    convertLead,
    updateScore
  } = useLeads(initialLeads, initialStats)

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'new' | 'qualified' | 'contacted'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: 'website',
    score: 50,
    value_estimate: 0,
    notes: ''
  })

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = selectedFilter === 'all' || lead.status === selectedFilter
    return matchesSearch && matchesFilter
  })

  const handleCreateLead = async () => {
    if (!newLead.name.trim()) return
    await createLead(newLead)
    setShowCreateModal(false)
    setNewLead({ name: '', email: '', phone: '', company: '', source: 'website', score: 50, value_estimate: 0, notes: '' })
  }

  const displayStats = [
    { label: 'Total Leads', value: stats.total.toLocaleString(), change: 25.3, icon: <Target className="w-5 h-5" /> },
    { label: 'Qualified', value: stats.qualified.toString(), change: 18.7, icon: <CheckCircle className="w-5 h-5" /> },
    { label: 'Conversion Rate', value: `${stats.conversionRate.toFixed(1)}%`, change: 12.5, icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Pipeline Value', value: `$${(stats.pipelineValue / 1000).toFixed(0)}K`, change: 32.1, icon: <Award className="w-5 h-5" /> }
  ]

  const leadSources = [
    { name: 'Website', count: leads.filter(l => l.source === 'website').length },
    { name: 'LinkedIn', count: leads.filter(l => l.source === 'linkedin').length },
    { name: 'Referral', count: leads.filter(l => l.source === 'referral').length },
    { name: 'Email', count: leads.filter(l => l.source === 'email').length }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
      case 'qualified': return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
      case 'contacted': return 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
      case 'converted': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
      case 'lost': return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-gray-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50/30 to-red-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Target className="w-10 h-10 text-pink-600" />
              Lead Generation
            </h1>
            <p className="text-muted-foreground">Capture and convert high-quality leads</p>
          </div>
          <GradientButton from="pink" to="rose" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Add Lead
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={displayStats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Plus />} title="Add Lead" description="Manual entry" onClick={() => setShowCreateModal(true)} />
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
              {loading && leads.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
                </div>
              ) : filteredLeads.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No leads found</p>
                  <ModernButton variant="outline" size="sm" className="mt-4" onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Lead
                  </ModernButton>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredLeads.map((lead) => (
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
                          {lead.company && <p className="text-sm text-muted-foreground mb-2">{lead.company}</p>}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {lead.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {lead.email}
                              </div>
                            )}
                            {lead.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {lead.phone}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              {lead.source}
                            </div>
                            {lead.value_estimate > 0 && (
                              <div className="flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                ${lead.value_estimate.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {lead.status === 'new' && (
                            <ModernButton variant="outline" size="sm" onClick={() => contactLead(lead.id)}>
                              <Mail className="w-3 h-3 mr-1" />
                              Contact
                            </ModernButton>
                          )}
                          {lead.status === 'contacted' && (
                            <ModernButton variant="outline" size="sm" onClick={() => qualifyLead(lead.id)}>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Qualify
                            </ModernButton>
                          )}
                          {lead.status === 'qualified' && (
                            <ModernButton variant="primary" size="sm" onClick={() => convertLead(lead.id)}>
                              <Star className="w-3 h-3 mr-1" />
                              Convert
                            </ModernButton>
                          )}
                          <ModernButton variant="outline" size="sm" onClick={() => deleteLead(lead.id)}>
                            <Trash2 className="w-3 h-3" />
                          </ModernButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </BentoCard>
          </div>

          <div className="space-y-6">
            <ProgressCard
              title="Monthly Lead Goal"
              current={stats.total}
              goal={1500}
              unit=""
              icon={<Target className="w-5 h-5" />}
            />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Lead Sources</h3>
              <div className="space-y-3">
                {leadSources.map((source) => (
                  <div key={source.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium">{source.name}</span>
                    <span className="text-sm font-bold">{source.count}</span>
                  </div>
                ))}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance</h3>
              <div className="space-y-3">
                <MiniKPI label="Avg Lead Score" value={stats.avgScore.toFixed(0)} change={12.5} />
                <MiniKPI label="New Leads" value={stats.new.toString()} change={25.3} />
                <MiniKPI label="Conversion Rate" value={`${stats.conversionRate.toFixed(1)}%`} change={8.3} />
                <MiniKPI label="Pipeline Value" value={`$${(stats.pipelineValue / 1000).toFixed(0)}K`} change={32.1} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Add New Lead</h2>
              <button onClick={() => setShowCreateModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Full name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Company</label>
                <input
                  type="text"
                  value={newLead.company}
                  onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Company name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Source</label>
                  <select
                    value={newLead.source}
                    onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="website">Website</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="referral">Referral</option>
                    <option value="email">Email</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Lead Score</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newLead.score}
                    onChange={(e) => setNewLead({ ...newLead, score: parseInt(e.target.value) || 50 })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estimated Value ($)</label>
                <input
                  type="number"
                  value={newLead.value_estimate}
                  onChange={(e) => setNewLead({ ...newLead, value_estimate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="0"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <ModernButton variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>Cancel</ModernButton>
                <GradientButton from="pink" to="rose" className="flex-1" onClick={handleCreateLead} disabled={loading || !newLead.name.trim()}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Lead'}
                </GradientButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
