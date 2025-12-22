'use client'

import { useState, useEffect } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  RankingList,
  ActivityFeed,
  MiniKPI,
  ProgressCard
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
  Mail,
  Phone,
  DollarSign,
  TrendingUp,
  Star,
  Settings,
  Filter,
  Building2,
  UserPlus,
  MessageSquare,
  Trash2,
  Edit
} from 'lucide-react'
import { useClients, Client } from '@/lib/hooks/use-clients'
import { createClient, updateClient, deleteClient } from '@/app/actions/clients'

interface ClientsClientProps {
  initialClients: Client[]
  initialStats: {
    total: number
    active: number
    prospects: number
    totalRevenue: number
    totalProjects: number
  }
}

export default function ClientsClient({ initialClients, initialStats }: ClientsClientProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'prospect'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddClient, setShowAddClient] = useState(false)
  const [newClient, setNewClient] = useState({ name: '', email: '', company: '', phone: '' })

  const { clients, stats, fetchClients } = useClients(initialClients)

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const displayStats = stats.total > 0 ? stats : initialStats

  const filteredClients = clients.filter(client => {
    const matchesFilter = selectedFilter === 'all' ||
      (selectedFilter === 'active' && client.status === 'active') ||
      (selectedFilter === 'prospect' && client.status === 'prospect')
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const statsDisplay = [
    { label: 'Total Clients', value: String(displayStats.total), change: 12.5, icon: <Users className="w-5 h-5" /> },
    { label: 'Active Clients', value: String(displayStats.active), change: 8.3, icon: <Building2 className="w-5 h-5" /> },
    { label: 'Total Revenue', value: `$${(displayStats.totalRevenue / 1000).toFixed(0)}K`, change: 15.2, icon: <DollarSign className="w-5 h-5" /> },
    { label: 'Projects', value: String(displayStats.totalProjects), change: 5.7, icon: <Star className="w-5 h-5" /> }
  ]

  const topClients = [...clients]
    .sort((a, b) => (b.total_revenue || 0) - (a.total_revenue || 0))
    .slice(0, 5)
    .map((client, index) => ({
      rank: index + 1,
      name: client.name,
      avatar: client.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${client.name}`,
      value: `$${((client.total_revenue || 0) / 1000).toFixed(1)}K`,
      change: (client.total_projects || 0) - 5
    }))

  const recentActivity = clients.slice(0, 4).map(c => ({
    icon: <UserPlus className="w-5 h-5" />,
    title: c.name,
    description: `${c.status} - ${c.total_projects || 0} projects`,
    time: new Date(c.updated_at).toLocaleDateString(),
    status: c.status === 'active' ? 'success' as const : 'info' as const
  }))

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'prospect': return 'bg-blue-100 text-blue-700'
      case 'inactive': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const handleAddClient = async () => {
    if (!newClient.name.trim()) return
    try {
      await createClient({
        name: newClient.name,
        email: newClient.email || undefined,
        company: newClient.company || undefined,
        phone: newClient.phone || undefined,
        status: 'prospect'
      })
      setNewClient({ name: '', email: '', company: '', phone: '' })
      setShowAddClient(false)
      fetchClients()
    } catch (error) {
      console.error('Error creating client:', error)
    }
  }

  const handleDeleteClient = async (id: string) => {
    try {
      await deleteClient(id)
      fetchClients()
    } catch (error) {
      console.error('Error deleting client:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-pink-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Users className="w-10 h-10 text-indigo-600" />
              Clients
            </h1>
            <p className="text-muted-foreground">Manage your client relationships</p>
          </div>
          <div className="flex items-center gap-3">
            <IconButton icon={<Filter />} ariaLabel="Filter" variant="ghost" size="md" />
            <IconButton icon={<Settings />} ariaLabel="Settings" variant="ghost" size="md" />
            <GradientButton from="indigo" to="purple" onClick={() => setShowAddClient(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Add Client
            </GradientButton>
          </div>
        </div>

        <StatGrid columns={4} stats={statsDisplay} />

        {/* Add Client Form */}
        {showAddClient && (
          <BentoCard className="p-6">
            <h3 className="text-xl font-semibold mb-4">Add New Client</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                value={newClient.name}
                onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Client name *"
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              <input
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Email"
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                value={newClient.company}
                onChange={(e) => setNewClient(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Company"
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="tel"
                value={newClient.phone}
                onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Phone"
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <ModernButton variant="primary" onClick={handleAddClient}>Add Client</ModernButton>
              <ModernButton variant="ghost" onClick={() => setShowAddClient(false)}>Cancel</ModernButton>
            </div>
          </BentoCard>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<UserPlus className="w-6 h-6" />} title="Add Client" description="New contact" onClick={() => setShowAddClient(true)} />
          <BentoQuickAction icon={<Mail className="w-6 h-6" />} title="Send Email" description="Bulk email" onClick={() => window.location.href = '/dashboard/messages-v2'} />
          <BentoQuickAction icon={<MessageSquare className="w-6 h-6" />} title="Messages" description="Client chat" onClick={() => window.location.href = '/dashboard/messages-v2'} />
          <BentoQuickAction icon={<Star className="w-6 h-6" />} title="Reviews" description="Feedback" onClick={() => window.location.href = '/dashboard/feedback-v2'} />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <PillButton variant={selectedFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('all')}>All</PillButton>
            <PillButton variant={selectedFilter === 'active' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('active')}>Active</PillButton>
            <PillButton variant={selectedFilter === 'prospect' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('prospect')}>Prospects</PillButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Client List</h3>
              {filteredClients.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No clients yet</h3>
                  <p className="text-muted-foreground mb-4">Add your first client to get started</p>
                  <ModernButton variant="primary" onClick={() => setShowAddClient(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Client
                  </ModernButton>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredClients.map((client) => (
                    <div key={client.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <img
                          src={client.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${client.name}`}
                          alt={client.name}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{client.name}</h4>
                            <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(client.status)}`}>
                              {client.status}
                            </span>
                          </div>
                          {client.company && (
                            <p className="text-sm text-muted-foreground mb-2">{client.company}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                            {client.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />{client.email}
                              </div>
                            )}
                            {client.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />{client.phone}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />${(client.total_revenue || 0).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <ModernButton variant="outline" size="sm">View</ModernButton>
                          <ModernButton variant="outline" size="sm">
                            <MessageSquare className="w-3 h-3 mr-1" />Message
                          </ModernButton>
                          <IconButton
                            icon={<Trash2 className="w-4 h-4" />}
                            ariaLabel="Delete"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClient(client.id)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </BentoCard>
          </div>
          <div className="space-y-6">
            {topClients.length > 0 && (
              <RankingList title="Top Clients by Revenue" items={topClients} />
            )}
            <ProgressCard
              title="Client Retention Goal"
              current={displayStats.active}
              goal={Math.max(displayStats.total, 1)}
              unit="%"
              icon={<TrendingUp className="w-5 h-5" />}
            />
            {recentActivity.length > 0 && (
              <ActivityFeed title="Recent Activity" activities={recentActivity} />
            )}
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Avg. Client Value" value={`$${displayStats.total > 0 ? ((displayStats.totalRevenue / displayStats.total) / 1000).toFixed(1) : '0'}K`} change={12.5} />
                <MiniKPI label="Retention Rate" value="94%" change={5.7} />
                <MiniKPI label="Active Rate" value={`${displayStats.total > 0 ? Math.round((displayStats.active / displayStats.total) * 100) : 0}%`} change={8.3} />
                <MiniKPI label="Total Projects" value={String(displayStats.totalProjects)} change={15.2} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
