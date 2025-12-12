"use client"

import { useState } from 'react'
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
  User,
  Calendar,
  Lock,
  Unlock,
  Download,
  FileText,
  Eye,
  Plus,
  Search,
  Target,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'

/**
 * Escrow V2 - Groundbreaking Payment Protection
 * Showcases escrow management with modern components
 */
export default function EscrowV2() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'completed' | 'pending'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const deposits = [
    {
      id: 'esc_001',
      projectTitle: 'E-commerce Website Redesign',
      clientName: 'Sarah Johnson',
      clientEmail: 'sarah@techcorp.com',
      amount: 12000,
      currency: 'USD',
      status: 'active',
      createdAt: '2024-01-15',
      progressPercentage: 75,
      clientAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SJ',
      milestones: [
        { id: 'ms_001', title: 'Design System', amount: 3000, status: 'completed' },
        { id: 'ms_002', title: 'Frontend Development', amount: 4500, status: 'completed' },
        { id: 'ms_003', title: 'Backend Integration', amount: 3000, status: 'active' },
        { id: 'ms_004', title: 'Testing & Launch', amount: 1500, status: 'pending' }
      ]
    },
    {
      id: 'esc_002',
      projectTitle: 'Mobile App Development',
      clientName: 'Michael Chen',
      clientEmail: 'michael@startupxyz.com',
      amount: 18000,
      currency: 'USD',
      status: 'active',
      createdAt: '2024-01-20',
      progressPercentage: 40,
      clientAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=MC',
      milestones: [
        { id: 'ms_005', title: 'UI/UX Design', amount: 5000, status: 'completed' },
        { id: 'ms_006', title: 'iOS Development', amount: 6500, status: 'active' },
        { id: 'ms_007', title: 'Android Development', amount: 6500, status: 'pending' }
      ]
    },
    {
      id: 'esc_003',
      projectTitle: 'Brand Identity Package',
      clientName: 'Emily Rodriguez',
      clientEmail: 'emily@brandco.com',
      amount: 8000,
      currency: 'USD',
      status: 'completed',
      createdAt: '2023-12-10',
      progressPercentage: 100,
      clientAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=ER',
      milestones: [
        { id: 'ms_008', title: 'Logo Design', amount: 3000, status: 'completed' },
        { id: 'ms_009', title: 'Brand Guidelines', amount: 3000, status: 'completed' },
        { id: 'ms_010', title: 'Marketing Materials', amount: 2000, status: 'completed' }
      ]
    },
    {
      id: 'esc_004',
      projectTitle: 'SaaS Platform Development',
      clientName: 'David Kim',
      clientEmail: 'david@techventures.com',
      amount: 25000,
      currency: 'USD',
      status: 'pending',
      createdAt: '2024-02-01',
      progressPercentage: 0,
      clientAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=DK',
      milestones: [
        { id: 'ms_011', title: 'Architecture Planning', amount: 5000, status: 'pending' },
        { id: 'ms_012', title: 'Core Features', amount: 12000, status: 'pending' },
        { id: 'ms_013', title: 'Security & Testing', amount: 5000, status: 'pending' },
        { id: 'ms_014', title: 'Deployment', amount: 3000, status: 'pending' }
      ]
    }
  ]

  const totalEscrow = deposits.reduce((sum, d) => sum + d.amount, 0)
  const activeDeposits = deposits.filter(d => d.status === 'active').length
  const completedDeposits = deposits.filter(d => d.status === 'completed').length
  const totalReleased = deposits.filter(d => d.status === 'completed').reduce((sum, d) => sum + d.amount, 0)

  const stats = [
    { label: 'Total in Escrow', value: `$${totalEscrow.toLocaleString()}`, change: 15.2, icon: <Shield className="w-5 h-5" /> },
    { label: 'Active Deposits', value: activeDeposits.toString(), change: 8.3, icon: <Clock className="w-5 h-5" /> },
    { label: 'Completed', value: completedDeposits.toString(), change: 12.5, icon: <CheckCircle className="w-5 h-5" /> },
    { label: 'Total Released', value: `$${totalReleased.toLocaleString()}`, change: 22.7, icon: <DollarSign className="w-5 h-5" /> }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/30 to-cyan-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Shield className="w-10 h-10 text-emerald-600" />
              Escrow Management
            </h1>
            <p className="text-muted-foreground">Secure payment protection for all projects</p>
          </div>
          <GradientButton from="emerald" to="teal" onClick={() => console.log('Create escrow')}>
            <Plus className="w-5 h-5 mr-2" />
            New Escrow
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Plus />} title="New Deposit" description="Create escrow" onClick={() => console.log('New')} />
          <BentoQuickAction icon={<FileText />} title="Contracts" description="View all" onClick={() => console.log('Contracts')} />
          <BentoQuickAction icon={<Target />} title="Milestones" description="Track progress" onClick={() => console.log('Milestones')} />
          <BentoQuickAction icon={<Download />} title="Reports" description="Export data" onClick={() => console.log('Reports')} />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search deposits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
            {deposits.map((deposit) => (
              <BentoCard key={deposit.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <img src={deposit.clientAvatar} alt={deposit.clientName} className="w-12 h-12 rounded-full" />
                      <div>
                        <h3 className="font-semibold text-lg">{deposit.projectTitle}</h3>
                        <p className="text-sm text-muted-foreground">{deposit.clientName}</p>
                        <p className="text-xs text-muted-foreground">{deposit.clientEmail}</p>
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
                      <span className="font-semibold">{deposit.progressPercentage}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-600 to-teal-600"
                        style={{ width: `${deposit.progressPercentage}%` }}
                      />
                    </div>
                  </div>

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
                          <p className="text-xs text-muted-foreground">${milestone.amount.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t">
                    <ModernButton variant="outline" size="sm" onClick={() => console.log('View', deposit.id)}>
                      <Eye className="w-3 h-3 mr-1" />
                      View Details
                    </ModernButton>
                    {deposit.status === 'active' && (
                      <ModernButton variant="outline" size="sm" onClick={() => console.log('Release', deposit.id)}>
                        <Unlock className="w-3 h-3 mr-1" />
                        Release Funds
                      </ModernButton>
                    )}
                    <ModernButton variant="outline" size="sm" onClick={() => console.log('Contract', deposit.id)}>
                      <FileText className="w-3 h-3 mr-1" />
                      Contract
                    </ModernButton>
                  </div>
                </div>
              </BentoCard>
            ))}
          </div>

          <div className="space-y-6">
            <ProgressCard
              title="Monthly Escrow Goal"
              current={totalEscrow}
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
                <MiniKPI label="Avg Project Value" value="$15.8K" change={12.5} />
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
