'use client'

import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { MessageCircle, Users, Clock, CheckCircle, TrendingUp } from 'lucide-react'

const chats = [
  { id: 'CHT-001', customer: 'John Smith', agent: 'Sarah M.', status: 'active', duration: '5:23', messages: 12, satisfaction: 5 },
  { id: 'CHT-002', customer: 'Emma Wilson', agent: 'Mike C.', status: 'active', duration: '2:45', messages: 8, satisfaction: null },
  { id: 'CHT-003', customer: 'Alex Johnson', agent: 'Lisa B.', status: 'closed', duration: '8:12', messages: 18, satisfaction: 4 },
]

const agents = [
  { name: 'Sarah M.', status: 'available', activeChats: 2, resolved: 45, avgTime: '6:20', satisfaction: 4.8 },
  { name: 'Mike C.', status: 'busy', activeChats: 3, resolved: 38, avgTime: '7:15', satisfaction: 4.6 },
  { name: 'Lisa B.', status: 'available', activeChats: 1, resolved: 52, avgTime: '5:45', satisfaction: 4.9 },
]

export default function LiveChatClient() {
  const stats = useMemo(() => ({
    activeChats: chats.filter(c => c.status === 'active').length,
    availableAgents: agents.filter(a => a.status === 'available').length,
    avgResponseTime: '45s',
    satisfaction: 4.7,
  }), [])

  const insights = [
    { icon: MessageCircle, title: `${stats.activeChats}`, description: 'Active chats' },
    { icon: Users, title: `${stats.availableAgents}`, description: 'Available agents' },
    { icon: Clock, title: stats.avgResponseTime, description: 'Avg response' },
    { icon: TrendingUp, title: `${stats.satisfaction}`, description: 'Satisfaction' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><MessageCircle className="h-8 w-8 text-primary" />Live Chat</h1>
          <p className="text-muted-foreground mt-1">Manage real-time customer conversations</p>
        </div>
      </div>

      <CollapsibleInsightsPanel title="Chat Overview" insights={insights} defaultExpanded={true} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Active Conversations</h3>
            <div className="space-y-3">
              {chats.filter(c => c.status === 'active').map((chat) => (
                <div key={chat.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{chat.customer[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{chat.customer}</p>
                        <p className="text-xs text-muted-foreground">with {chat.agent}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-medium">{chat.duration}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Messages</p>
                      <p className="font-medium">{chat.messages}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Agent Status</h3>
            <div className="space-y-3">
              {agents.map((agent, i) => (
                <div key={i} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{agent.name[0]}</AvatarFallback>
                      </Avatar>
                      <p className="font-semibold">{agent.name}</p>
                    </div>
                    <Badge className={agent.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                      {agent.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Active</p>
                      <p className="font-medium">{agent.activeChats}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Resolved</p>
                      <p className="font-medium">{agent.resolved}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Rating</p>
                      <p className="font-medium">{agent.satisfaction}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
