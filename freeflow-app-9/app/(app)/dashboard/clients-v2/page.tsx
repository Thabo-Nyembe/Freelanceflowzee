"use client"

import { useState } from 'react'
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
  MessageSquare
} from 'lucide-react'

/**
 * Clients V2 - Groundbreaking CRM
 * Showcases client management with modern components
 */
export default function ClientsV2() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'vip'>('all')

  const clients = [
    {
      id: '1',
      name: 'Acme Corporation',
      contact: 'John Smith',
      email: 'john@acme.com',
      phone: '+1 (555) 123-4567',
      revenue: 45000,
      projects: 8,
      status: 'active',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AC'
    },
    {
      id: '2',
      name: 'TechStart Inc',
      contact: 'Sarah Johnson',
      email: 'sarah@techstart.com',
      phone: '+1 (555) 234-5678',
      revenue: 38000,
      projects: 6,
      status: 'active',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=TI'
    },
    {
      id: '3',
      name: 'GreenLeaf Co',
      contact: 'Michael Chen',
      email: 'michael@greenleaf.com',
      phone: '+1 (555) 345-6789',
      revenue: 52000,
      projects: 10,
      status: 'vip',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=GL'
    },
    {
      id: '4',
      name: 'FinanceHub',
      contact: 'Emily Rodriguez',
      email: 'emily@financehub.com',
      phone: '+1 (555) 456-7890',
      revenue: 28000,
      projects: 4,
      status: 'active',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=FH'
    }
  ]

  const totalRevenue = clients.reduce((sum, c) => sum + c.revenue, 0)
  const totalProjects = clients.reduce((sum, c) => sum + c.projects, 0)

  const stats = [
    { label: 'Total Clients', value: '127', change: 12.5, icon: <Users className="w-5 h-5" /> },
    { label: 'Active Projects', value: totalProjects.toString(), change: 8.3, icon: <Building2 className="w-5 h-5" /> },
    { label: 'Total Revenue', value: `$${(totalRevenue / 1000).toFixed(0)}K`, change: 15.2, icon: <DollarSign className="w-5 h-5" /> },
    { label: 'Satisfaction', value: '96%', change: 5.7, icon: <Star className="w-5 h-5" /> }
  ]

  const topClients = clients
    .sort((a, b) => b.revenue - a.revenue)
    .map((client, index) => ({
      rank: index + 1,
      name: client.name,
      avatar: client.avatar,
      value: `$${(client.revenue / 1000).toFixed(1)}K`,
      change: client.projects - 5
    }))

  const recentActivity = [
    { icon: <UserPlus className="w-5 h-5" />, title: 'New client', description: 'Acme Corporation onboarded', time: '2 hours ago', status: 'success' as const },
    { icon: <MessageSquare className="w-5 h-5" />, title: 'Message received', description: 'TechStart Inc sent inquiry', time: '4 hours ago', status: 'info' as const },
    { icon: <DollarSign className="w-5 h-5" />, title: 'Payment received', description: 'GreenLeaf Co - $15,000', time: '1 day ago', status: 'success' as const },
    { icon: <Star className="w-5 h-5" />, title: 'Review received', description: 'FinanceHub left 5-star review', time: '2 days ago', status: 'success' as const }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'vip': return 'bg-purple-100 text-purple-700'
      case 'inactive': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-pink-50/40 dark:from-indigo-950 dark:via-purple-950/30 dark:to-pink-950/40 p-6">
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
            <GradientButton from="indigo" to="purple" onClick={() => console.log('Add client')}>
              <Plus className="w-5 h-5 mr-2" />
              Add Client
            </GradientButton>
          </div>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<UserPlus className="w-6 h-6" />} title="Add Client" description="New contact" onClick={() => console.log('Add')} />
          <BentoQuickAction icon={<Mail className="w-6 h-6" />} title="Send Email" description="Bulk email" onClick={() => console.log('Email')} />
          <BentoQuickAction icon={<MessageSquare className="w-6 h-6" />} title="Messages" description="Client chat" onClick={() => console.log('Messages')} />
          <BentoQuickAction icon={<Star className="w-6 h-6" />} title="Reviews" description="Feedback" onClick={() => console.log('Reviews')} />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search clients..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex items-center gap-2">
            <PillButton variant={selectedFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('all')}>All</PillButton>
            <PillButton variant={selectedFilter === 'active' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('active')}>Active</PillButton>
            <PillButton variant={selectedFilter === 'vip' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('vip')}>VIP</PillButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Client List</h3>
              <div className="space-y-4">
                {clients.map((client) => (
                  <div key={client.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <img src={client.avatar} alt={client.name} className="w-12 h-12 rounded-full" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{client.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(client.status)}`}>{client.status}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{client.contact}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1"><Mail className="w-3 h-3" />{client.email}</div>
                          <div className="flex items-center gap-1"><Phone className="w-3 h-3" />{client.phone}</div>
                          <div className="flex items-center gap-1"><DollarSign className="w-3 h-3" />${client.revenue.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ModernButton variant="outline" size="sm" onClick={() => console.log('View', client.id)}>View</ModernButton>
                        <ModernButton variant="outline" size="sm" onClick={() => console.log('Message', client.id)}><MessageSquare className="w-3 h-3 mr-1" />Message</ModernButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>
          <div className="space-y-6">
            <RankingList title="🏆 Top Clients by Revenue" items={topClients} />
            <ProgressCard title="Client Retention Goal" current={85} goal={100} unit="%" icon={<TrendingUp className="w-5 h-5" />} />
            <ActivityFeed title="Recent Activity" activities={recentActivity} />
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Avg. Client Value" value="$12.8K" change={12.5} />
                <MiniKPI label="Retention Rate" value="94%" change={5.7} />
                <MiniKPI label="Response Time" value="2.4h" change={-15.2} />
                <MiniKPI label="Satisfaction Score" value="96%" change={8.3} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
