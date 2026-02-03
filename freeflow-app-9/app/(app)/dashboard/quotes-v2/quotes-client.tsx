'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { FileText, Plus, Search, DollarSign, Clock, CheckCircle, XCircle, Send, Eye, Download, MoreHorizontal, Calendar } from 'lucide-react'

const quotes = [
  { id: 'Q-001', client: 'TechCorp Inc', project: 'Website Redesign', amount: 15000, status: 'pending', createdAt: '2024-01-15', validUntil: '2024-02-15' },
  { id: 'Q-002', client: 'Global Systems', project: 'API Integration', amount: 45000, status: 'accepted', createdAt: '2024-01-12', validUntil: '2024-02-12' },
  { id: 'Q-003', client: 'StartupXYZ', project: 'Mobile App MVP', amount: 80000, status: 'sent', createdAt: '2024-01-10', validUntil: '2024-02-10' },
  { id: 'Q-004', client: 'FinanceHub', project: 'Security Audit', amount: 25000, status: 'declined', createdAt: '2024-01-08', validUntil: '2024-02-08' },
  { id: 'Q-005', client: 'DataFlow', project: 'Cloud Migration', amount: 120000, status: 'draft', createdAt: '2024-01-05', validUntil: '2024-02-05' },
]

export default function QuotesClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const stats = useMemo(() => ({
    total: quotes.length,
    pending: quotes.filter(q => q.status === 'pending' || q.status === 'sent').length,
    accepted: quotes.filter(q => q.status === 'accepted').length,
    totalValue: quotes.reduce((sum, q) => sum + q.amount, 0),
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      sent: 'bg-blue-100 text-blue-700',
      pending: 'bg-yellow-100 text-yellow-700',
      accepted: 'bg-green-100 text-green-700',
      declined: 'bg-red-100 text-red-700',
    }
    return <Badge className={styles[status]}>{status}</Badge>
  }

  const filteredQuotes = useMemo(() => quotes.filter(q =>
    (activeTab === 'all' || q.status === activeTab) &&
    (q.client.toLowerCase().includes(searchQuery.toLowerCase()) || q.project.toLowerCase().includes(searchQuery.toLowerCase()))
  ), [searchQuery, activeTab])

  const insights = [
    { icon: FileText, title: `${stats.total}`, description: 'Total quotes' },
    { icon: DollarSign, title: `$${(stats.totalValue / 1000).toFixed(0)}K`, description: 'Total value' },
    { icon: CheckCircle, title: `${stats.accepted}`, description: 'Accepted' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Quotes
          </h1>
          <p className="text-muted-foreground mt-1">Create and manage client quotes</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />New Quote</Button>
      </div>

      <CollapsibleInsightsPanel title="Quote Stats" insights={insights} defaultExpanded={true} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
            <TabsTrigger value="declined">Declined</TabsTrigger>
          </TabsList>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search quotes..." className="pl-9 w-64" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredQuotes.map((quote) => (
                  <div key={quote.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-muted-foreground">{quote.id}</span>
                          {getStatusBadge(quote.status)}
                        </div>
                        <h4 className="font-semibold">{quote.project}</h4>
                        <p className="text-sm text-muted-foreground">{quote.client}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-bold">${quote.amount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground flex items-center justify-end"><Calendar className="h-3 w-3 mr-1" />Valid until {quote.validUntil}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon"><Send className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
