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
  RankingList,
  ComparisonCard
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  DollarSign,
  TrendingUp,
  Users,
  Target,
  Award,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  Clock,
  BarChart3,
  Sparkles,
  Plus,
  ArrowRight,
  XCircle,
  RefreshCw
} from 'lucide-react'
import { useSalesDeals, usePipelineStages, SalesDeal, PipelineStage } from '@/lib/hooks/use-sales'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SalesClientProps {
  initialDeals: SalesDeal[]
  initialStages: PipelineStage[]
}

export default function SalesClient({ initialDeals, initialStages }: SalesClientProps) {
  const [selectedStage, setSelectedStage] = useState<'all' | 'lead' | 'qualified' | 'proposal' | 'closed'>('all')
  const [showNewDeal, setShowNewDeal] = useState(false)
  const [showLostDialog, setShowLostDialog] = useState<string | null>(null)
  const [lostReason, setLostReason] = useState('')
  const [newDeal, setNewDeal] = useState({
    title: '',
    company_name: '',
    contact_name: '',
    contact_email: '',
    deal_value: 0,
    stage: 'lead' as const,
    notes: ''
  })

  const {
    deals,
    loading: dealsLoading,
    createDeal,
    updateDeal,
    moveDealToStage,
    winDeal,
    loseDeal,
    logActivity,
    getStats
  } = useSalesDeals()
  const { stages, loading: stagesLoading } = usePipelineStages()

  const displayDeals = (deals && deals.length > 0) ? deals : (initialDeals || [])
  const displayStages = (stages && stages.length > 0) ? stages : (initialStages || [])
  const stats = getStats()

  const statCards = [
    { label: 'Pipeline Value', value: `$${(stats.pipelineValue / 1000).toFixed(0)}K`, change: 42.1, icon: <DollarSign className="w-5 h-5" /> },
    { label: 'Deals Closed', value: stats.wonDeals.toString(), change: 28.5, icon: <CheckCircle className="w-5 h-5" /> },
    { label: 'Win Rate', value: `${stats.winRate.toFixed(0)}%`, change: 15.3, icon: <Award className="w-5 h-5" /> },
    { label: 'Avg Deal Size', value: `$${(stats.avgDealSize / 1000).toFixed(1)}K`, change: 22.7, icon: <TrendingUp className="w-5 h-5" /> }
  ]

  const pipelineStages = [
    { stage: 'Lead', count: displayDeals.filter(d => d.stage === 'lead').length, value: displayDeals.filter(d => d.stage === 'lead').reduce((s, d) => s + d.deal_value, 0), color: 'from-blue-500 to-cyan-500' },
    { stage: 'Qualified', count: displayDeals.filter(d => d.stage === 'qualified').length, value: displayDeals.filter(d => d.stage === 'qualified').reduce((s, d) => s + d.deal_value, 0), color: 'from-purple-500 to-pink-500' },
    { stage: 'Proposal', count: displayDeals.filter(d => d.stage === 'proposal').length, value: displayDeals.filter(d => d.stage === 'proposal').reduce((s, d) => s + d.deal_value, 0), color: 'from-orange-500 to-red-500' },
    { stage: 'Negotiation', count: displayDeals.filter(d => d.stage === 'negotiation').length, value: displayDeals.filter(d => d.stage === 'negotiation').reduce((s, d) => s + d.deal_value, 0), color: 'from-yellow-500 to-amber-500' },
    { stage: 'Closed Won', count: displayDeals.filter(d => d.stage === 'closed_won').length, value: stats.wonValue, color: 'from-green-500 to-emerald-500' }
  ]

  const topSalesReps = displayDeals
    .filter(d => d.stage === 'closed_won' && d.assigned_to)
    .reduce((acc, deal) => {
      const rep = deal.contact_name || 'Unassigned'
      if (!acc[rep]) acc[rep] = 0
      acc[rep] += deal.deal_value
      return acc
    }, {} as Record<string, number>)

  const topRepsArray = Object.entries(topSalesReps)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value], i) => ({
      rank: i + 1,
      name,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${name.replace(' ', '')}`,
      value: `$${(value / 1000).toFixed(0)}K`,
      change: 20 + Math.random() * 20
    }))

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'lead': return 'bg-blue-100 text-blue-700'
      case 'qualified': return 'bg-purple-100 text-purple-700'
      case 'proposal': return 'bg-orange-100 text-orange-700'
      case 'negotiation': return 'bg-yellow-100 text-yellow-700'
      case 'closed_won': return 'bg-green-100 text-green-700'
      case 'closed_lost': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getProbabilityColor = (probability: number) => {
    if (probability >= 75) return 'text-green-600'
    if (probability >= 50) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const maxValue = Math.max(...pipelineStages.map(s => s.value), 1)

  const handleCreateDeal = async () => {
    if (!newDeal.title || !newDeal.deal_value) return
    try {
      await createDeal(newDeal)
      setShowNewDeal(false)
      setNewDeal({ title: '', company_name: '', contact_name: '', contact_email: '', deal_value: 0, stage: 'lead', notes: '' })
    } catch (error) {
      console.error('Failed to create deal:', error)
    }
  }

  const handleLoseDeal = async (id: string) => {
    try {
      await loseDeal(id, lostReason)
      setShowLostDialog(null)
      setLostReason('')
    } catch (error) {
      console.error('Failed to lose deal:', error)
    }
  }

  const filteredDeals = selectedStage === 'all'
    ? displayDeals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage))
    : selectedStage === 'closed'
    ? displayDeals.filter(d => ['closed_won', 'closed_lost'].includes(d.stage))
    : displayDeals.filter(d => d.stage === selectedStage)

  const getNextStage = (current: string): SalesDeal['stage'] | null => {
    const flow: Record<string, SalesDeal['stage']> = {
      lead: 'qualified',
      qualified: 'proposal',
      proposal: 'negotiation',
      negotiation: 'closed_won'
    }
    return flow[current] || null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/30 to-teal-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <TrendingUp className="w-10 h-10 text-green-600" />
              Sales Dashboard
            </h1>
            <p className="text-muted-foreground">Manage pipeline and track revenue performance</p>
          </div>
          <GradientButton from="green" to="emerald" onClick={() => setShowNewDeal(true)}>
            <Sparkles className="w-5 h-5 mr-2" />
            Add Deal
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={statCards} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Target />} title="Pipeline" description={`${displayDeals.length} deals`} onClick={() => {}} />
          <BentoQuickAction icon={<Users />} title="Contacts" description="CRM" onClick={() => {}} />
          <BentoQuickAction icon={<BarChart3 />} title="Analytics" description="Reports" onClick={() => {}} />
          <BentoQuickAction icon={<Award />} title="Leaderboard" description="Top reps" onClick={() => {}} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedStage === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedStage('all')}>
            All Deals
          </PillButton>
          <PillButton variant={selectedStage === 'lead' ? 'primary' : 'ghost'} onClick={() => setSelectedStage('lead')}>
            Leads
          </PillButton>
          <PillButton variant={selectedStage === 'qualified' ? 'primary' : 'ghost'} onClick={() => setSelectedStage('qualified')}>
            Qualified
          </PillButton>
          <PillButton variant={selectedStage === 'proposal' ? 'primary' : 'ghost'} onClick={() => setSelectedStage('proposal')}>
            Proposal
          </PillButton>
          <PillButton variant={selectedStage === 'closed' ? 'primary' : 'ghost'} onClick={() => setSelectedStage('closed')}>
            Closed
          </PillButton>
        </div>

        <BentoCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Sales Pipeline</h3>
            {(dealsLoading || stagesLoading) && <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />}
          </div>
          <div className="space-y-4">
            {pipelineStages.map((stage) => {
              const valuePercent = (stage.value / maxValue) * 100

              return (
                <div key={stage.stage} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stage.color} flex items-center justify-center text-white font-bold`}>
                        {stage.count}
                      </div>
                      <span className="font-semibold">{stage.stage}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">{stage.count} deals</span>
                      <span className="font-bold">${(stage.value / 1000).toFixed(0)}K</span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${stage.color} transition-all duration-300`}
                      style={{ width: `${valuePercent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </BentoCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Active Deals</h3>
              <div className="space-y-3">
                {filteredDeals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No deals in this stage. Add a new deal to get started!</p>
                  </div>
                ) : (
                  filteredDeals.map((deal) => (
                    <div key={deal.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{deal.title}</h4>
                            <span className={`text-xs px-2 py-1 rounded-md ${getStageColor(deal.stage)}`}>
                              {deal.stage.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{deal.company_name || deal.contact_name || 'No contact'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Deal Value</p>
                          <p className="text-xl font-bold text-green-600">${(deal.deal_value / 1000).toFixed(1)}K</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                        <div>
                          <p className="text-muted-foreground">Probability</p>
                          <p className={`font-semibold ${getProbabilityColor(deal.probability)}`}>
                            {deal.probability}%
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Expected Close</p>
                          <p className="font-semibold">{deal.expected_close_date || 'TBD'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last Contact</p>
                          <p className="font-semibold">{deal.last_contact_at ? new Date(deal.last_contact_at).toLocaleDateString() : 'Never'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <ModernButton variant="outline" size="sm" onClick={() => {
                          const next = getNextStage(deal.stage)
                          if (next) moveDealToStage(deal.id, next)
                        }} disabled={!getNextStage(deal.stage)}>
                          <ArrowRight className="w-3 h-3 mr-1" />
                          Advance
                        </ModernButton>
                        {!['closed_won', 'closed_lost'].includes(deal.stage) && (
                          <>
                            <ModernButton variant="outline" size="sm" onClick={() => winDeal(deal.id)}>
                              <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                              Won
                            </ModernButton>
                            <ModernButton variant="outline" size="sm" onClick={() => setShowLostDialog(deal.id)}>
                              <XCircle className="w-3 h-3 mr-1 text-red-600" />
                              Lost
                            </ModernButton>
                          </>
                        )}
                        <ModernButton variant="outline" size="sm" onClick={() => logActivity(deal.id, { activity_type: 'email', subject: 'Follow up' })}>
                          <Mail className="w-3 h-3 mr-1" />
                          Email
                        </ModernButton>
                        <ModernButton variant="outline" size="sm" onClick={() => logActivity(deal.id, { activity_type: 'call', subject: 'Call' })}>
                          <Phone className="w-3 h-3 mr-1" />
                          Call
                        </ModernButton>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList title="🏆 Top Sales Reps" items={topRepsArray.length > 0 ? topRepsArray : [
              { rank: 1, name: 'Close some deals!', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=NA', value: '$0', change: 0 }
            ]} />

            <div className="grid grid-cols-1 gap-6">
              <ComparisonCard
                title="Revenue Comparison"
                current={{ label: 'This Month', value: stats.wonValue }}
                previous={{ label: 'Last Month', value: stats.wonValue * 0.8 }}
              />
            </div>

            <ProgressCard
              title="Quarterly Revenue Goal"
              current={stats.wonValue}
              goal={2000000}
              unit="$"
              icon={<Target className="w-5 h-5" />}
            />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Sales Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Total Deals" value={stats.totalDeals.toString()} change={15.3} />
                <MiniKPI label="Pipeline Value" value={`$${(stats.pipelineValue / 1000).toFixed(0)}K`} change={22.7} />
                <MiniKPI label="Win Rate" value={`${stats.winRate.toFixed(0)}%`} change={stats.winRate > 50 ? 15.3 : -5.2} />
                <MiniKPI label="Avg Probability" value={`${stats.avgProbability.toFixed(0)}%`} change={8.2} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>

      <Dialog open={showNewDeal} onOpenChange={setShowNewDeal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Deal</DialogTitle>
            <DialogDescription>
              Create a new sales opportunity in your pipeline.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Deal Title</Label>
              <Input
                id="title"
                value={newDeal.title}
                onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })}
                placeholder="Enterprise Software License"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={newDeal.company_name}
                  onChange={(e) => setNewDeal({ ...newDeal, company_name: e.target.value })}
                  placeholder="Acme Corp"
                />
              </div>
              <div>
                <Label htmlFor="contact">Contact Name</Label>
                <Input
                  id="contact"
                  value={newDeal.contact_name}
                  onChange={(e) => setNewDeal({ ...newDeal, contact_name: e.target.value })}
                  placeholder="John Smith"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newDeal.contact_email}
                  onChange={(e) => setNewDeal({ ...newDeal, contact_email: e.target.value })}
                  placeholder="john@acme.com"
                />
              </div>
              <div>
                <Label htmlFor="value">Deal Value ($)</Label>
                <Input
                  id="value"
                  type="number"
                  value={newDeal.deal_value || ''}
                  onChange={(e) => setNewDeal({ ...newDeal, deal_value: parseInt(e.target.value) || 0 })}
                  placeholder="50000"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="stage">Stage</Label>
              <Select value={newDeal.stage} onValueChange={(v: any) => setNewDeal({ ...newDeal, stage: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newDeal.notes}
                onChange={(e) => setNewDeal({ ...newDeal, notes: e.target.value })}
                placeholder="Additional notes about this deal..."
              />
            </div>
          </div>
          <DialogFooter>
            <ModernButton variant="outline" onClick={() => setShowNewDeal(false)}>
              Cancel
            </ModernButton>
            <GradientButton from="green" to="emerald" onClick={handleCreateDeal}>
              <Plus className="w-4 h-4 mr-2" />
              Create Deal
            </GradientButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!showLostDialog} onOpenChange={() => setShowLostDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Deal as Lost</DialogTitle>
            <DialogDescription>
              Why was this deal lost? This helps improve future sales.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Loss Reason</Label>
              <Textarea
                id="reason"
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
                placeholder="e.g., Budget constraints, chose competitor, timing..."
              />
            </div>
          </div>
          <DialogFooter>
            <ModernButton variant="outline" onClick={() => setShowLostDialog(null)}>
              Cancel
            </ModernButton>
            <ModernButton variant="destructive" onClick={() => showLostDialog && handleLoseDeal(showLostDialog)}>
              <XCircle className="w-4 h-4 mr-2" />
              Mark as Lost
            </ModernButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
