"use client"

import { useState } from 'react'
import { BentoCard } from '@/components/ui/bento-grid-advanced'
import { StatGrid, ActivityFeed, MiniKPI } from '@/components/ui/results-display'
import { ModernButton, GradientButton, PillButton, IconButton } from '@/components/ui/modern-buttons'
import { MessageSquare, Plus, Search, Send, Paperclip, Settings, Star, Archive, Users } from 'lucide-react'

export default function MessagesV2() {
  const [selectedConversation, setSelectedConversation] = useState('1')
  const conversations = [
    { id: '1', name: 'Acme Corp', lastMessage: 'Thanks for the update!', time: '10m ago', unread: 2, avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AC' },
    { id: '2', name: 'TechStart Inc', lastMessage: 'Can we schedule a call?', time: '1h ago', unread: 0, avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=TI' },
    { id: '3', name: 'GreenLeaf Co', lastMessage: 'Project looks great!', time: '2h ago', unread: 1, avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=GL' }
  ]

  const stats = [
    { label: 'Unread', value: '3', change: 0, icon: <MessageSquare className="w-5 h-5" /> },
    { label: 'Conversations', value: '24', change: 12.5, icon: <Users className="w-5 h-5" /> },
    { label: 'Avg Response', value: '2.4h', change: -15.2, icon: <Send className="w-5 h-5" /> },
    { label: 'Starred', value: '8', change: 8.3, icon: <Star className="w-5 h-5" /> }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-violet-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <MessageSquare className="w-10 h-10 text-blue-600" />
              Messages
            </h1>
            <p className="text-muted-foreground">Communicate with your clients</p>
          </div>
          <div className="flex items-center gap-3">
            <IconButton icon={<Settings />} ariaLabel="Settings" variant="ghost" size="md" />
            <GradientButton from="blue" to="indigo" onClick={() => console.log('New message')}>
              <Plus className="w-5 h-5 mr-2" />
              New Message
            </GradientButton>
          </div>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <BentoCard className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder="Search conversations..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <div key={conv.id} onClick={() => setSelectedConversation(conv.id)} className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedConversation === conv.id ? 'bg-blue-50 dark:bg-blue-950' : 'hover:bg-muted/50'}`}>
                    <div className="flex items-start gap-3">
                      <img src={conv.avatar} alt={conv.name} className="w-10 h-10 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-sm truncate">{conv.name}</h4>
                          {conv.unread > 0 && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">{conv.unread}</span>}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                        <p className="text-xs text-muted-foreground mt-1">{conv.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="lg:col-span-2">
            <BentoCard className="p-6 h-[600px] flex flex-col">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <img src={conversations.find(c => c.id === selectedConversation)?.avatar} className="w-10 h-10 rounded-full" />
                  <h3 className="font-semibold">{conversations.find(c => c.id === selectedConversation)?.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <IconButton icon={<Star />} ariaLabel="Star" variant="ghost" size="sm" />
                  <IconButton icon={<Archive />} ariaLabel="Archive" variant="ghost" size="sm" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto py-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <img src={conversations.find(c => c.id === selectedConversation)?.avatar} className="w-8 h-8 rounded-full" />
                    <div className="bg-muted px-4 py-2 rounded-lg max-w-md">
                      <p className="text-sm">Hi! We're excited to work with you on this project.</p>
                      <p className="text-xs text-muted-foreground mt-1">10:30 AM</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 justify-end">
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-lg max-w-md">
                      <p className="text-sm">Great! I've prepared some initial concepts for your review.</p>
                      <p className="text-xs text-blue-100 mt-1">10:35 AM</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <IconButton icon={<Paperclip />} ariaLabel="Attach" variant="ghost" size="md" />
                  <input type="text" placeholder="Type a message..." className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <ModernButton variant="primary" onClick={() => console.log('Send')}><Send className="w-4 h-4" /></ModernButton>
                </div>
              </div>
            </BentoCard>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Today's Messages" value="24" change={12.5} />
                <MiniKPI label="Response Rate" value="98%" change={5.2} />
                <MiniKPI label="Avg Length" value="145 chars" change={0} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
