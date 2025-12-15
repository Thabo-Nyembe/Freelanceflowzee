'use client'

import { useState } from 'react'
import { useCrmContacts, type CrmContact, type ContactType, type ContactStatus, type DealStage } from '@/lib/hooks/use-crm-contacts'
import { BentoCard, BentoQuickAction } from '@/components/ui/bento-grid-advanced'
import { StatGrid, ActivityFeed, MiniKPI, RankingList } from '@/components/ui/results-display'
import { ModernButton, GradientButton, PillButton } from '@/components/ui/modern-buttons'
import { Users, Plus, Mail, Phone, DollarSign, TrendingUp, MessageSquare, UserPlus, Building2, Target } from 'lucide-react'

export default function CrmClient({ initialContacts }: { initialContacts: CrmContact[] }) {
  const [contactTypeFilter, setContactTypeFilter] = useState<ContactType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<ContactStatus | 'all'>('all')
  const { contacts, loading, error } = useCrmContacts({ contactType: contactTypeFilter, status: statusFilter })

  const displayContacts = contacts.length > 0 ? contacts : initialContacts

  const stats = [
    {
      label: 'Total Contacts',
      value: displayContacts.length.toString(),
      change: 12.5,
      icon: <Users className="w-5 h-5" />
    },
    {
      label: 'Active Deals',
      value: displayContacts.filter(c => c.deal_stage && !['closed_won', 'closed_lost'].includes(c.deal_stage)).length.toString(),
      change: 8.3,
      icon: <DollarSign className="w-5 h-5" />
    },
    {
      label: 'Pipeline Value',
      value: `$${(displayContacts.reduce((sum, c) => sum + c.deal_value, 0) / 1000000).toFixed(1)}M`,
      change: 15.2,
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      label: 'Conversion Rate',
      value: displayContacts.length > 0
        ? `${((displayContacts.filter(c => c.contact_type === 'customer').length / displayContacts.length) * 100).toFixed(0)}%`
        : '0%',
      change: 5.7,
      icon: <Target className="w-5 h-5" />
    }
  ]

  const getStatusColor = (status: ContactStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'vip': return 'bg-purple-100 text-purple-700'
      case 'new': return 'bg-blue-100 text-blue-700'
      case 'qualified': return 'bg-cyan-100 text-cyan-700'
      case 'inactive': return 'bg-gray-100 text-gray-700'
      case 'churned': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getDealStageColor = (stage?: DealStage) => {
    if (!stage) return 'bg-gray-100 text-gray-700'
    switch (stage) {
      case 'prospecting': return 'bg-blue-100 text-blue-700'
      case 'qualification': return 'bg-cyan-100 text-cyan-700'
      case 'proposal': return 'bg-yellow-100 text-yellow-700'
      case 'negotiation': return 'bg-orange-100 text-orange-700'
      case 'closed_won': return 'bg-green-100 text-green-700'
      case 'closed_lost': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const topContactsByValue = displayContacts
    .sort((a, b) => b.deal_value - a.deal_value)
    .slice(0, 5)
    .map((contact, index) => ({
      rank: index + 1,
      label: contact.contact_name,
      value: `$${(contact.deal_value / 1000).toFixed(0)}K`,
      change: contact.probability_percentage
    }))

  const recentActivity = displayContacts.slice(0, 4).map((c, idx) => ({
    icon: <UserPlus className="w-5 h-5" />,
    title: c.contact_type === 'customer' ? 'Customer' : 'Lead',
    description: c.contact_name,
    time: new Date(c.created_at).toLocaleDateString(),
    status: c.status === 'active' ? 'success' as const : 'info' as const
  }))

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
          <GradientButton from="indigo" to="purple" onClick={() => console.log('Add contact')}>
            <Plus className="w-5 h-5 mr-2" />
            Add Contact
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<UserPlus />} title="Add Contact" description="New lead" onClick={() => console.log('Add')} />
          <BentoQuickAction icon={<Mail />} title="Send Email" description="Bulk email" onClick={() => console.log('Email')} />
          <BentoQuickAction icon={<MessageSquare />} title="Messages" description="Chat" onClick={() => console.log('Messages')} />
          <BentoQuickAction icon={<Target />} title="Pipeline" description="View deals" onClick={() => console.log('Pipeline')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={statusFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('all')}>
            All Status
          </PillButton>
          <PillButton variant={statusFilter === 'active' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('active')}>
            Active
          </PillButton>
          <PillButton variant={statusFilter === 'vip' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('vip')}>
            VIP
          </PillButton>
          <PillButton variant={statusFilter === 'new' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('new')}>
            New
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Contacts</h3>
              <div className="space-y-4">
                {displayContacts.map((contact) => (
                  <div key={contact.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-lg font-semibold">
                          {contact.contact_name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold">{contact.contact_name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(contact.status)}`}>
                              {contact.status}
                            </span>
                            {contact.deal_stage && (
                              <span className={`text-xs px-2 py-1 rounded-md ${getDealStageColor(contact.deal_stage)}`}>
                                {contact.deal_stage.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                          {contact.company_name && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <Building2 className="w-3 h-3" />
                              {contact.company_name}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">${contact.deal_value.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Deal Value</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground mb-3">
                      {contact.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {contact.email}
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {contact.phone}
                        </div>
                      )}
                      <div>Lead Score: <span className="font-semibold">{contact.lead_score}</span></div>
                    </div>

                    <div className="flex items-center gap-4 text-sm pt-3 border-t border-border">
                      <div>
                        <span className="text-muted-foreground">Emails:</span> <span className="font-medium">{contact.email_count}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Calls:</span> <span className="font-medium">{contact.call_count}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Meetings:</span> <span className="font-medium">{contact.meeting_count}</span>
                      </div>
                      {contact.last_contact_date && (
                        <div className="ml-auto text-muted-foreground">
                          Last contact: {new Date(contact.last_contact_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-border mt-3">
                      <ModernButton variant="outline" size="sm">View</ModernButton>
                      <ModernButton variant="outline" size="sm">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Message
                      </ModernButton>
                    </div>
                  </div>
                ))}

                {displayContacts.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Contacts</h3>
                    <p className="text-muted-foreground">Add your first contact</p>
                  </div>
                )}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList title="Top Contacts by Value" items={topContactsByValue} />

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Avg Deal Size" value={`$${(displayContacts.reduce((sum, c) => sum + c.deal_value, 0) / Math.max(displayContacts.length, 1) / 1000).toFixed(1)}K`} change={12.5} />
                <MiniKPI label="Customers" value={displayContacts.filter(c => c.contact_type === 'customer').length.toString()} change={24.7} />
                <MiniKPI label="Qualified Leads" value={displayContacts.filter(c => c.qualification_status === 'qualified').length.toString()} change={18.2} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
