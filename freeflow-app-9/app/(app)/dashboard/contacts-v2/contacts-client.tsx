'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import {
  Users, UserPlus, Search, Filter, MoreHorizontal, Mail,
  Phone, MapPin, Building2, Star, Tag, Calendar, MessageSquare
} from 'lucide-react'

const contacts = [
  { id: 1, name: 'Sarah Chen', email: 'sarah@techcorp.com', phone: '+1 555-0123', company: 'TechCorp', role: 'Product Manager', type: 'customer', starred: true, lastContact: '2024-01-15' },
  { id: 2, name: 'Mike Johnson', email: 'mike@globalsys.io', phone: '+1 555-0456', company: 'Global Systems', role: 'CTO', type: 'lead', starred: false, lastContact: '2024-01-12' },
  { id: 3, name: 'Emily Davis', email: 'emily@design.co', phone: '+1 555-0789', company: 'Design Co', role: 'Creative Director', type: 'partner', starred: true, lastContact: '2024-01-10' },
  { id: 4, name: 'Tom Wilson', email: 'tom@startup.xyz', phone: '+1 555-0147', company: 'StartupXYZ', role: 'Founder', type: 'customer', starred: false, lastContact: '2024-01-08' },
  { id: 5, name: 'Lisa Park', email: 'lisa@finance.hub', phone: '+1 555-0258', company: 'FinanceHub', role: 'VP Sales', type: 'lead', starred: false, lastContact: '2024-01-05' },
  { id: 6, name: 'James Brown', email: 'james@agency.co', phone: '+1 555-0369', company: 'The Agency', role: 'Account Manager', type: 'partner', starred: true, lastContact: '2024-01-14' },
]

export default function ContactsClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [selectedContact, setSelectedContact] = useState<typeof contacts[0] | null>(null)

  const stats = useMemo(() => ({
    total: contacts.length,
    customers: contacts.filter(c => c.type === 'customer').length,
    leads: contacts.filter(c => c.type === 'lead').length,
    partners: contacts.filter(c => c.type === 'partner').length,
  }), [])

  const filteredContacts = useMemo(() => contacts.filter(c =>
    (activeTab === 'all' || c.type === activeTab) &&
    (c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.company.toLowerCase().includes(searchQuery.toLowerCase()))
  ), [searchQuery, activeTab])

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      customer: 'bg-green-100 text-green-700',
      lead: 'bg-blue-100 text-blue-700',
      partner: 'bg-purple-100 text-purple-700',
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  const insights = [
    { icon: Users, title: `${stats.total}`, description: 'Total contacts' },
    { icon: Star, title: `${stats.customers}`, description: 'Customers' },
    { icon: UserPlus, title: `${stats.leads}`, description: 'Leads' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Contacts
          </h1>
          <p className="text-muted-foreground mt-1">Manage your contacts and relationships</p>
        </div>
        <Button><UserPlus className="h-4 w-4 mr-2" />Add Contact</Button>
      </div>

      <CollapsibleInsightsPanel title="Contact Stats" insights={insights} defaultExpanded={true} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                    <TabsTrigger value="customer">Customers ({stats.customers})</TabsTrigger>
                    <TabsTrigger value="lead">Leads ({stats.leads})</TabsTrigger>
                    <TabsTrigger value="partner">Partners ({stats.partners})</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search contacts..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredContacts.map((contact) => (
                  <div key={contact.id} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50 ${selectedContact?.id === contact.id ? 'border-primary bg-primary/5' : ''}`} onClick={() => setSelectedContact(contact)}>
                    <div className="flex items-center gap-3">
                      <Avatar><AvatarFallback>{contact.name.charAt(0)}</AvatarFallback></Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{contact.name}</span>
                          {contact.starred && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                        </div>
                        <p className="text-sm text-muted-foreground">{contact.role} at {contact.company}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getTypeColor(contact.type)}>{contact.type}</Badge>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          {selectedContact ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <Avatar className="h-20 w-20 mx-auto mb-3"><AvatarFallback className="text-2xl">{selectedContact.name.charAt(0)}</AvatarFallback></Avatar>
                  <h3 className="text-xl font-semibold">{selectedContact.name}</h3>
                  <p className="text-muted-foreground">{selectedContact.role}</p>
                  <Badge className={`mt-2 ${getTypeColor(selectedContact.type)}`}>{selectedContact.type}</Badge>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3"><Building2 className="h-4 w-4 text-muted-foreground" /><span>{selectedContact.company}</span></div>
                  <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground" /><span>{selectedContact.email}</span></div>
                  <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-muted-foreground" /><span>{selectedContact.phone}</span></div>
                  <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-muted-foreground" /><span>Last contact: {selectedContact.lastContact}</span></div>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button className="flex-1"><Mail className="h-4 w-4 mr-2" />Email</Button>
                  <Button variant="outline" className="flex-1"><Phone className="h-4 w-4 mr-2" />Call</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="flex items-center justify-center h-64">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Select a contact to view details</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
