"use client"

import { BentoCard, BentoQuickAction } from '@/components/ui/bento-grid-advanced'
import { StatGrid, MiniKPI } from '@/components/ui/results-display'
import { ModernButton, GradientButton, PillButton } from '@/components/ui/modern-buttons'
import { Calendar, Plus, ChevronLeft, ChevronRight, Clock, Users } from 'lucide-react'
import { useState } from 'react'

export default function CalendarV2() {
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')
  const stats = [
    { label: 'This Week', value: '12', change: 8.3, icon: <Calendar className="w-5 h-5" /> },
    { label: 'Today', value: '3', change: 0, icon: <Clock className="w-5 h-5" /> },
    { label: 'Meetings', value: '24', change: 12.5, icon: <Users className="w-5 h-5" /> },
    { label: 'Utilization', value: '76%', change: 5.7, icon: <Calendar className="w-5 h-5" /> }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50/30 to-sky-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Calendar className="w-10 h-10 text-teal-600" />
              Calendar
            </h1>
            <p className="text-muted-foreground">Manage your schedule and meetings</p>
          </div>
          <GradientButton from="teal" to="cyan" onClick={() => console.log('New event')}>
            <Plus className="w-5 h-5 mr-2" />
            New Event
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <BentoCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <ModernButton variant="ghost" size="sm"><ChevronLeft className="w-4 h-4" /></ModernButton>
                  <h3 className="text-xl font-semibold">January 2025</h3>
                  <ModernButton variant="ghost" size="sm"><ChevronRight className="w-4 h-4" /></ModernButton>
                </div>
                <div className="flex items-center gap-2">
                  <PillButton variant={view === 'day' ? 'primary' : 'ghost'} size="sm" onClick={() => setView('day')}>Day</PillButton>
                  <PillButton variant={view === 'week' ? 'primary' : 'ghost'} size="sm" onClick={() => setView('week')}>Week</PillButton>
                  <PillButton variant={view === 'month' ? 'primary' : 'ghost'} size="sm" onClick={() => setView('month')}>Month</PillButton>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">{day}</div>
                ))}
                {Array.from({ length: 35 }, (_, i) => (
                  <div key={i} className="aspect-square p-2 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
                    <div className="text-sm">{((i % 31) + 1)}</div>
                    {(i + 1) % 7 === 3 && <div className="mt-1 text-xs bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 px-1 py-0.5 rounded truncate">Meeting</div>}
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <BentoQuickAction icon={<Plus />} title="New Event" description="Schedule" onClick={() => console.log('New event')} />
              <BentoQuickAction icon={<Users />} title="Meetings" description="View all" onClick={() => console.log('Meetings')} />
            </div>
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Today's Events</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="font-medium text-sm">Team Standup</p>
                  <p className="text-xs text-muted-foreground">10:00 AM - 10:30 AM</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="font-medium text-sm">Client Review</p>
                  <p className="text-xs text-muted-foreground">2:00 PM - 3:00 PM</p>
                </div>
              </div>
            </BentoCard>
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Meetings Today" value="3" change={0} />
                <MiniKPI label="Hours Scheduled" value="6.5h" change={12.5} />
                <MiniKPI label="Free Time" value="38%" change={-8.3} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
