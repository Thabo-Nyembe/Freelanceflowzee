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
  MessageSquare,
  Calendar,
  BarChart3,
  Target
} from 'lucide-react'

/**
 * CRM V2 - Groundbreaking Customer Relationship Management
 * Showcases client relationships with modern components
 */
export default function CRMV2() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'vip' | 'new'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const stats = [
    { label: 'Total Contacts', value: '847', change: 12.5, icon: <Users className="w-5 h-5" /> },
    { label: 'Active Deals', value: '124', change: 8.3, icon: <DollarSign className="w-5 h-5" /> },
    { label: 'Pipeline Value', value: '$2.4M', change: 15.2, icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Conversion Rate', value: '24%', change: 5.7, icon: <Target className="w-5 h-5" /> }
  ]

  const contacts = [
    {
      id: '1',
      name: 'Sarah Johnson',
      company: 'Tech Innovations Inc',
      email: 'sarah@techinnovations.com',
      phone: '+1 (555) 123-4567',
      dealValue: 45000,
      status: 'active',
      lastContact: '2 days ago',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SJ'
    },
    {
      id: '2',
      name: 'Michael Chen',
      company: 'Digital Solutions',
      email: 'michael@digitalsolutions.com',
      phone: '+1 (555) 234-5678',
      dealValue: 38000,
      status: 'vip',
      lastContact: '5 hours ago',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=MC'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      company: 'StartUp Hub',
      email: 'emily@startuphub.com',
      phone: '+1 (555) 345-6789',
      dealValue: 52000,
      status: 'vip',
      lastContact: '1 day ago',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=ER'
    },
    {
      id: '4',
      name: 'David Kim',
      company: 'Growth Ventures',
      email: 'david@growthventures.com',
      phone: '+1 (555) 456-7890',
      dealValue: 28000,
      status: 'new',
      lastContact: '3 days ago',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=DK'
    }
  ]

  const topContacts = contacts
    .sort((a, b) => b.dealValue - a.dealValue)
    .slice(0, 5)
    .map((contact, index) => ({
      rank: index + 1,
      name: contact.name,
      avatar: contact.avatar,
      value: `$${(contact.dealValue / 1000).toFixed(0)}K`,
      change: Math.random() > 0.5 ? 12.5 : -8.3
    }))

  const recentActivity = [
    { icon: <UserPlus className="w-5 h-5" />, title: 'New contact added', description: 'David Kim - Growth Ventures', time: '1 hour ago', status: 'success' as const },
    { icon: <MessageSquare className="w-5 h-5" />, title: 'Email sent', description: 'Follow-up to Sarah Johnson', time: '3 hours ago', status: 'info' as const },
    { icon: <DollarSign className="w-5 h-5" />, title: 'Deal closed', description: 'Emily Rodriguez - $52K', time: '1 day ago', status: 'success' as const },
    { icon: <Calendar className="w-5 h-5" />, title: 'Meeting scheduled', description: 'Michael Chen - Tomorrow 2PM', time: '2 days ago', status: 'info' as const }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'vip': return 'bg-purple-100 text-purple-700'
      case 'new': return 'bg-blue-100 text-blue-700'
      case 'inactive': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-pink-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Users className="w-10 h-10 text-indigo-600" />
              CRM
            </h1>
            <p className="text-muted-foreground">Customer Relationship Management</p>
          </div>
          <div className="flex items-center gap-3">
            <IconButton icon={<Filter />} ariaLabel="Filter" variant="ghost" size="md" />
            <IconButton icon={<Settings />} ariaLabel="Settings" variant="ghost" size="md" />
            <GradientButton from="indigo" to="purple" onClick={() => console.log('Add contact')}>
              <Plus className="w-5 h-5 mr-2" />
              Add Contact
            </GradientButton>
          </div>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<UserPlus />} title="Add Contact" description="New lead" onClick={() => console.log('Add')} />
          <BentoQuickAction icon={<Mail />} title="Send Email" description="Bulk email" onClick={() => console.log('Email')} />
          <BentoQuickAction icon={<MessageSquare />} title="Messages" description="Chat" onClick={() => console.log('Messages')} />
          <BentoQuickAction icon={<BarChart3 />} title="Analytics" description="Reports" onClick={() => console.log('Analytics')} />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <PillButton variant={selectedFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('all')}>All</PillButton>
            <PillButton variant={selectedFilter === 'active' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('active')}>Active</PillButton>
            <PillButton variant={selectedFilter === 'vip' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('vip')}>VIP</PillButton>
            <PillButton variant={selectedFilter === 'new' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('new')}>New</PillButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Contacts</h3>
              <div className="space-y-4">
                {contacts.map((contact) => (
                  <div key={contact.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-full" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{contact.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(contact.status)}`}>
                            {contact.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{contact.company}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {contact.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {contact.phone}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            ${contact.dealValue.toLocaleString()}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Last contact: {contact.lastContact}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <ModernButton variant="outline" size="sm" onClick={() => console.log('View', contact.id)}>
                          View
                        </ModernButton>
                        <ModernButton variant="outline" size="sm" onClick={() => console.log('Message', contact.id)}>
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Message
                        </ModernButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList title="🏆 Top Contacts by Value" items={topContacts} />
            <ProgressCard
              title="Monthly Revenue Goal"
              current={185000}
              goal={250000}
              unit="$"
              icon={<Target className="w-5 h-5" />}
            />
            <ActivityFeed title="Recent Activity" activities={recentActivity} />
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Avg Deal Size" value="$38.5K" change={12.5} />
                <MiniKPI label="Win Rate" value="24%" change={5.7} />
                <MiniKPI label="Response Time" value="2.1h" change={-15.2} />
                <MiniKPI label="Customer Satisfaction" value="96%" change={8.3} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
