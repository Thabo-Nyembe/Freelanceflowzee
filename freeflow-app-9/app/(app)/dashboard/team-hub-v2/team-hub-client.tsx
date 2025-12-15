'use client'

import { useState } from 'react'
import { useTeam, TeamMember, TeamStats } from '@/lib/hooks/use-team'
import {
  BentoGrid,
  BentoCard,
  BentoStat,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  RankingList,
  ActivityFeed,
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
  Users,
  Plus,
  Search,
  UserPlus,
  Mail,
  MessageSquare,
  Calendar,
  TrendingUp,
  Award,
  Target,
  Clock,
  Settings,
  BarChart3,
  CheckCircle2,
  Star,
  X,
  Loader2,
  Trash2
} from 'lucide-react'

interface TeamHubClientProps {
  initialMembers: TeamMember[]
  initialStats: TeamStats
}

export default function TeamHubClient({ initialMembers, initialStats }: TeamHubClientProps) {
  const {
    members,
    stats,
    loading,
    createMember,
    updateMember,
    deleteMember,
    updateMemberStatus,
    toggleLead,
    updatePerformance
  } = useTeam(initialMembers, initialStats)

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'leads'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: '',
    department: ''
  })

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = selectedFilter === 'all' ||
      (selectedFilter === 'active' && member.status === 'active') ||
      (selectedFilter === 'leads' && member.is_lead)
    return matchesSearch && matchesFilter
  })

  const handleAddMember = async () => {
    if (!newMember.name.trim()) return
    await createMember(newMember)
    setShowAddModal(false)
    setNewMember({ name: '', email: '', role: '', department: '' })
  }

  const displayStats = [
    {
      label: 'Team Members',
      value: stats.total.toString(),
      change: 8.3,
      icon: <Users className="w-5 h-5" />
    },
    {
      label: 'Active Members',
      value: stats.active.toString(),
      change: 12.5,
      icon: <Target className="w-5 h-5" />
    },
    {
      label: 'Team Leads',
      value: stats.leads.toString(),
      change: 15.2,
      icon: <CheckCircle2 className="w-5 h-5" />
    },
    {
      label: 'Avg Performance',
      value: `${stats.avgPerformance}%`,
      change: 5.7,
      icon: <TrendingUp className="w-5 h-5" />
    }
  ]

  const topPerformers = [...members]
    .sort((a, b) => b.performance_score - a.performance_score)
    .slice(0, 5)
    .map((member, index) => ({
      rank: index + 1,
      name: member.name,
      avatar: member.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`,
      value: `${member.performance_score}%`,
      change: member.performance_score - 80
    }))

  const recentActivity = [
    {
      icon: <UserPlus className="w-5 h-5" />,
      title: 'New team member',
      description: 'Added to the team',
      time: 'Recently',
      status: 'success' as const
    },
    {
      icon: <CheckCircle2 className="w-5 h-5" />,
      title: 'Task completed',
      description: 'Project milestone reached',
      time: '4 hours ago',
      status: 'success' as const
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: 'Team meeting scheduled',
      description: 'Weekly standup tomorrow',
      time: '5 hours ago',
      status: 'info' as const
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/30 to-teal-50/40 dark:from-green-950 dark:via-emerald-950/30 dark:to-teal-950/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Users className="w-10 h-10 text-green-600" />
              Team Hub
            </h1>
            <p className="text-muted-foreground">
              Collaborate and manage your team effectively
            </p>
          </div>

          <div className="flex items-center gap-3">
            <IconButton
              icon={<Mail />}
              ariaLabel="Messages"
              variant="ghost"
              size="md"
            />
            <IconButton
              icon={<Settings />}
              ariaLabel="Settings"
              variant="ghost"
              size="md"
            />
            <GradientButton
              from="green"
              to="emerald"
              onClick={() => setShowAddModal(true)}
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Add Member
            </GradientButton>
          </div>
        </div>

        {/* Stats */}
        <StatGrid columns={4} stats={displayStats} />

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <PillButton
              variant={selectedFilter === 'all' ? 'primary' : 'ghost'}
              onClick={() => setSelectedFilter('all')}
            >
              All Members
            </PillButton>
            <PillButton
              variant={selectedFilter === 'active' ? 'primary' : 'ghost'}
              onClick={() => setSelectedFilter('active')}
            >
              Active
            </PillButton>
            <PillButton
              variant={selectedFilter === 'leads' ? 'primary' : 'ghost'}
              onClick={() => setSelectedFilter('leads')}
            >
              Team Leads
            </PillButton>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Team Members */}
          <div className="lg:col-span-2 space-y-6">
            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Team Members ({filteredMembers.length})</h3>
              {loading && members.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No team members found</p>
                  <ModernButton
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setShowAddModal(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Member
                  </ModernButton>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={member.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`}
                          alt={member.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold truncate">{member.name}</h4>
                            {member.is_lead && (
                              <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">Lead</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{member.role || 'Team Member'}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              {member.projects_count} projects
                            </div>
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              {member.tasks_completed} tasks
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Performance</span>
                              <span className="font-semibold">{member.performance_score}%</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-green-600 to-emerald-600 rounded-full"
                                style={{ width: `${member.performance_score}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <ModernButton
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => toggleLead(member.id)}
                        >
                          <Star className="w-3 h-3 mr-1" />
                          {member.is_lead ? 'Remove Lead' : 'Make Lead'}
                        </ModernButton>
                        <ModernButton
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMember(member.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </ModernButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </BentoCard>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <BentoQuickAction
                icon={<Calendar className="w-6 h-6" />}
                title="Schedule"
                description="Team calendar"
                onClick={() => console.log('Schedule')}
              />
              <BentoQuickAction
                icon={<MessageSquare className="w-6 h-6" />}
                title="Messages"
                description="Team chat"
                onClick={() => console.log('Messages')}
              />
              <BentoQuickAction
                icon={<BarChart3 className="w-6 h-6" />}
                title="Reports"
                description="Team metrics"
                onClick={() => console.log('Reports')}
              />
              <BentoQuickAction
                icon={<Award className="w-6 h-6" />}
                title="Rewards"
                description="Recognition"
                onClick={() => console.log('Rewards')}
              />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Top Performers */}
            {topPerformers.length > 0 && (
              <RankingList
                title="🏆 Top Performers"
                items={topPerformers}
              />
            )}

            {/* Team Progress */}
            <ProgressCard
              title="Team Goals"
              current={stats.avgPerformance}
              goal={100}
              unit="%"
              icon={<Target className="w-5 h-5" />}
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Activity"
              activities={recentActivity}
            />

            {/* Quick Stats */}
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Active Members" value={stats.active.toString()} change={5.7} />
                <MiniKPI label="On Leave" value={stats.onLeave.toString()} change={-2.1} />
                <MiniKPI label="Pending" value={stats.pending.toString()} change={8.3} />
                <MiniKPI label="Inactive" value={stats.inactive.toString()} change={-15.2} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Add Team Member</h2>
              <button onClick={() => setShowAddModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <input
                  type="text"
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter role"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <input
                  type="text"
                  value={newMember.department}
                  onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter department"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <ModernButton
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </ModernButton>
                <GradientButton
                  from="green"
                  to="emerald"
                  className="flex-1"
                  onClick={handleAddMember}
                  disabled={loading || !newMember.name.trim()}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Member'}
                </GradientButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
