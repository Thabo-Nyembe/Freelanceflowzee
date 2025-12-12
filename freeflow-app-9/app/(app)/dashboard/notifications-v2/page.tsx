"use client"

import { BentoCard } from '@/components/ui/bento-grid-advanced'
import { StatGrid, ActivityFeed } from '@/components/ui/results-display'
import { ModernButton, PillButton } from '@/components/ui/modern-buttons'
import { Bell, CheckCircle2, AlertCircle, Info, Settings } from 'lucide-react'
import { useState } from 'react'

export default function NotificationsV2() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const stats = [
    { label: 'Unread', value: '12', change: 0, icon: <Bell className="w-5 h-5" /> },
    { label: 'This Week', value: '45', change: 25.3, icon: <Info className="w-5 h-5" /> },
    { label: 'Important', value: '3', change: 0, icon: <AlertCircle className="w-5 h-5" /> },
    { label: 'Read Rate', value: '94%', change: 5.7, icon: <CheckCircle2 className="w-5 h-5" /> }
  ]

  const notifications = [
    { icon: <CheckCircle2 className="w-5 h-5" />, title: 'Payment received', description: '$12,500 from Acme Corp', time: '10 minutes ago', status: 'success' as const, unread: true },
    { icon: <AlertCircle className="w-5 h-5" />, title: 'Project deadline approaching', description: 'Website Redesign due in 3 days', time: '1 hour ago', status: 'warning' as const, unread: true },
    { icon: <Info className="w-5 h-5" />, title: 'New message from client', description: 'TechStart Inc sent you a message', time: '2 hours ago', status: 'info' as const, unread: false }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50/30 to-fuchsia-50/40 p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Bell className="w-10 h-10 text-violet-600" />
              Notifications
            </h1>
            <p className="text-muted-foreground">Stay updated with important alerts</p>
          </div>
          <ModernButton variant="outline" onClick={() => console.log('Settings')}><Settings className="w-4 h-4 mr-2" />Settings</ModernButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="flex items-center gap-3">
          <PillButton variant={filter === 'all' ? 'primary' : 'ghost'} onClick={() => setFilter('all')}>All</PillButton>
          <PillButton variant={filter === 'unread' ? 'primary' : 'ghost'} onClick={() => setFilter('unread')}>Unread</PillButton>
          <ModernButton variant="ghost" size="sm" onClick={() => console.log('Mark all read')}>Mark All as Read</ModernButton>
        </div>

        <BentoCard className="p-6">
          <div className="space-y-4">
            {notifications.map((notif, i) => (
              <div key={i} className={`p-4 rounded-xl border transition-colors ${notif.unread ? 'bg-violet-50 dark:bg-violet-950/20 border-violet-200' : 'bg-background border-border hover:bg-muted/50'}`}>
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-background">{notif.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold">{notif.title}</h4>
                      {notif.unread && <div className="w-2 h-2 rounded-full bg-violet-600" />}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{notif.description}</p>
                    <p className="text-xs text-muted-foreground">{notif.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </BentoCard>
      </div>
    </div>
  )
}
