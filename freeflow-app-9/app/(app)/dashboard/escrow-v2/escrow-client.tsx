'use client'

import { useState, useEffect } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  ProgressCard,
  MiniKPI
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton,
  IconButton
} from '@/components/ui/modern-buttons'
import {
  Shield,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Lock,
  Unlock,
  Download,
  FileText,
  Eye,
  Plus,
  Search,
  Target,
  TrendingUp,
  Trash2
} from 'lucide-react'
import { useEscrow, EscrowDeposit } from '@/lib/hooks/use-escrow'
import { createEscrowDeposit, deleteEscrowDeposit, activateEscrow, completeEscrow, releaseFunds, completeMilestone } from '@/app/actions/escrow'

interface EscrowClientProps {
  initialDeposits: EscrowDeposit[]
  initialStats: {
    total: number
    pending: number
    active: number
    completed: number
    totalInEscrow: number
    totalReleased: number
  }
}

export default function EscrowClient({ initialDeposits, initialStats }: EscrowClientProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'completed' | 'pending'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddEscrow, setShowAddEscrow] = useState(false)
  const [newEscrow, setNewEscrow] = useState({
    project_title: '',
    client_name: '',
    client_email: '',
    amount: ''
  })

  const { deposits, stats, fetchDeposits } = useEscrow(initialDeposits)
  const displayDeposits = deposits.length > 0 ? deposits : initialDeposits
  const displayStats = stats.total > 0 ? stats : initialStats

  const filteredDeposits = displayDeposits.filter(deposit => {
    const matchesFilter = selectedFilter === 'all' ||
      deposit.status === selectedFilter
    const matchesSearch = deposit.project_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deposit.client_name?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const statsDisplay = [
    { label: 'Total in Escrow', value: `$${displayStats.totalInEscrow.toLocaleString()}`, change: 15.2, icon: <Shield className="w-5 h-5" /> },
    { label: 'Active Deposits', value: String(displayStats.active), change: 8.3, icon: <Clock className="w-5 h-5" /> },
    { label: 'Completed', value: String(displayStats.completed), change: 12.5, icon: <CheckCircle className="w-5 h-5" /> },
    { label: 'Total Released', value: `$${displayStats.totalReleased.toLocaleString()}`, change: 22.7, icon: <DollarSign className="w-5 h-5" /> }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-700'
      case 'completed': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'disputed': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'active': return 'bg-blue-100 text-blue-700'
      case 'pending': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const handleCreateEscrow = async () => {
    if (!newEscrow.project_title.trim() || !newEscrow.amount) return
    try {
      await createEscrowDeposit({
        project_title: newEscrow.project_title,
        client_name: newEscrow.client_name || undefined,
        client_email: newEscrow.client_email || undefined,
        amount: parseFloat(newEscrow.amount),
        status: 'pending'
      })
      setNewEscrow({ project_title: '', client_name: '', client_email: '', amount: '' })
      setShowAddEscrow(false)
      fetchDeposits()
    } catch (error) {
      console.error('Error creating escrow:', error)
    }
  }

  const handleDeleteEscrow = async (id: string) => {
    try {
      await deleteEscrowDeposit(id)
      fetchDeposits()
    } catch (error) {
      console.error('Error deleting escrow:', error)
    }
  }

  const handleActivate = async (id: string) => {
    try {
      await activateEscrow(id)
      fetchDeposits()
    } catch (error) {
      console.error('Error activating escrow:', error)
    }
  }

  const handleComplete = async (id: string) => {
    try {
      await completeEscrow(id)
      fetchDeposits()
    } catch (error) {
      console.error('Error completing escrow:', error)
    }
  }

  const handleCompleteMilestone = async (id: string) => {
    try {
      await completeMilestone(id)
      fetchDeposits()
    } catch (error) {
      console.error('Error completing milestone:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/30 to-cyan-50/40 dark:from-emerald-950 dark:via-teal-950/30 dark:to-cyan-950/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Shield className="w-10 h-10 text-emerald-600" />
              Escrow Management
            </h1>
            <p className="text-muted-foreground">Secure payment protection for all projects</p>
          </div>
          <GradientButton from="emerald" to="teal" onClick={() => setShowAddEscrow(true)}>
            <Plus className="w-5 h-5 mr-2" />
            New Escrow
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={statsDisplay} />

        {/* Add Escrow Form */}
        {showAddEscrow && (
          <BentoCard className="p-6">
            <h3 className="text-xl font-semibold mb-4">Create New Escrow Deposit</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                value={newEscrow.project_title}
                onChange={(e) => setNewEscrow(prev => ({ ...prev, project_title: e.target.value }))}
                placeholder="Project title *"
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
              <input
                type="text"
                value={newEscrow.client_name}
                onChange={(e) => setNewEscrow(prev => ({ ...prev, client_name: e.target.value }))}
                placeholder="Client name"
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="number"
                value={newEscrow.amount}
                onChange={(e) => setNewEscrow(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="Amount *"
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex gap-2">
                <ModernButton variant="primary" onClick={handleCreateEscrow}>Create</ModernButton>
                <ModernButton variant="ghost" onClick={() => setShowAddEscrow(false)}>Cancel</ModernButton>
              </div>
            </div>
          </BentoCard>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Plus />} title="New Deposit" description="Create escrow" onClick={() => setShowAddEscrow(true)} />
          <BentoQuickAction icon={<FileText />} title="Contracts" description="View all" onClick={() => window.location.href = '/dashboard/contracts-v2'} />
          <BentoQuickAction icon={<Target />} title="Milestones" description="Track progress" onClick={() => console.log('Milestones')} />
          <BentoQuickAction icon={<Download />} title="Reports" description="Export data" onClick={() => window.location.href = '/dashboard/reports-v2'} />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search deposits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <PillButton variant={selectedFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('all')}>All</PillButton>
            <PillButton variant={selectedFilter === 'active' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('active')}>Active</PillButton>
            <PillButton variant={selectedFilter === 'completed' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('completed')}>Completed</PillButton>
            <PillButton variant={selectedFilter === 'pending' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('pending')}>Pending</PillButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {filteredDeposits.length === 0 ? (
              <BentoCard className="p-12 text-center">
                <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No escrow deposits yet</h3>
                <p className="text-muted-foreground mb-4">Create your first escrow deposit to protect payments</p>
                <ModernButton variant="primary" onClick={() => setShowAddEscrow(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Escrow
                </ModernButton>
              </BentoCard>
            ) : (
              filteredDeposits.map((deposit) => (
                <BentoCard key={deposit.id} className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <img
                          src={deposit.client_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${deposit.client_name || deposit.project_title}`}
                          alt={deposit.client_name || deposit.project_title}
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <h3 className="font-semibold text-lg">{deposit.project_title}</h3>
                          {deposit.client_name && (
                            <p className="text-sm text-muted-foreground">{deposit.client_name}</p>
                          )}
                          {deposit.client_email && (
                            <p className="text-xs text-muted-foreground">{deposit.client_email}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-600">
                          ${deposit.amount.toLocaleString()}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(deposit.status)}`}>
                          {deposit.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold">{deposit.progress_percentage}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-600 to-teal-600"
                          style={{ width: `${deposit.progress_percentage}%` }}
                        />
                      </div>
                    </div>

                    {deposit.milestones && deposit.milestones.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Milestones ({deposit.milestones.length})</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {deposit.milestones.map((milestone) => (
                            <div key={milestone.id} className="p-3 rounded-lg border border-border bg-background">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">{milestone.title}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-md ${getMilestoneStatusColor(milestone.status)}`}>
                                  {milestone.status}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">${milestone.amount.toLocaleString()}</p>
                                {milestone.status !== 'completed' && (
                                  <button
                                    onClick={() => handleCompleteMilestone(milestone.id)}
                                    className="text-xs text-emerald-600 hover:underline"
                                  >
                                    Complete
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-4 border-t">
                      <ModernButton variant="outline" size="sm">
                        <Eye className="w-3 h-3 mr-1" />
                        View Details
                      </ModernButton>
                      {deposit.status === 'pending' && (
                        <ModernButton variant="outline" size="sm" onClick={() => handleActivate(deposit.id)}>
                          <Lock className="w-3 h-3 mr-1" />
                          Activate
                        </ModernButton>
                      )}
                      {deposit.status === 'active' && (
                        <ModernButton variant="outline" size="sm" onClick={() => handleComplete(deposit.id)}>
                          <Unlock className="w-3 h-3 mr-1" />
                          Release All
                        </ModernButton>
                      )}
                      <ModernButton variant="outline" size="sm">
                        <FileText className="w-3 h-3 mr-1" />
                        Contract
                      </ModernButton>
                      <IconButton
                        icon={<Trash2 className="w-4 h-4" />}
                        ariaLabel="Delete"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEscrow(deposit.id)}
                      />
                    </div>
                  </div>
                </BentoCard>
              ))
            )}
          </div>

          <div className="space-y-6">
            <ProgressCard
              title="Monthly Escrow Goal"
              current={displayStats.totalInEscrow}
              goal={50000}
              unit="$"
              icon={<Target className="w-5 h-5" />}
            />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Security Features</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Lock className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-medium">Encrypted Storage</p>
                    <p className="text-xs text-muted-foreground">Bank-grade security</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-medium">Payment Protection</p>
                    <p className="text-xs text-muted-foreground">Secure transactions</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <AlertCircle className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-medium">Dispute Resolution</p>
                    <p className="text-xs text-muted-foreground">Fair mediation</p>
                  </div>
                </div>
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Avg Project Value" value={displayStats.total > 0 ? `$${((displayStats.totalInEscrow + displayStats.totalReleased) / displayStats.total / 1000).toFixed(1)}K` : '$0'} change={12.5} />
                <MiniKPI label="Success Rate" value="98%" change={5.7} />
                <MiniKPI label="Dispute Rate" value="2%" change={-15.2} />
                <MiniKPI label="Release Time" value="3.2 days" change={-8.3} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
