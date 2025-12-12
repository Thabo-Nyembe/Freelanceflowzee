"use client"

import { useState } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  ProgressCard,
  MiniKPI
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  Clock,
  Play,
  Pause,
  Square,
  TrendingUp,
  Calendar,
  BarChart3,
  Plus,
  Download,
  Target,
  Zap
} from 'lucide-react'

/**
 * Time Tracking V2 - Groundbreaking Time Management
 * Showcases time tracking with modern components
 */
export default function TimeTrackingV2() {
  const [isTracking, setIsTracking] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(3847) // seconds

  const stats = [
    { label: 'Today', value: '6.4h', change: 12.5, icon: <Clock className="w-5 h-5" /> },
    { label: 'This Week', value: '34.2h', change: 8.3, icon: <Calendar className="w-5 h-5" /> },
    { label: 'Productivity', value: '94%', change: 5.7, icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Billable', value: '28.5h', change: 15.2, icon: <BarChart3 className="w-5 h-5" /> }
  ]

  const timeEntries = [
    {
      id: 1,
      project: 'E-commerce Website',
      task: 'Frontend Development',
      duration: 7200, // seconds
      billable: true,
      date: '2024-02-12'
    },
    {
      id: 2,
      project: 'Mobile App Design',
      task: 'UI Prototyping',
      duration: 5400,
      billable: true,
      date: '2024-02-12'
    },
    {
      id: 3,
      project: 'Brand Identity',
      task: 'Logo Design',
      duration: 3600,
      billable: true,
      date: '2024-02-11'
    }
  ]

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/30 to-yellow-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Clock className="w-10 h-10 text-amber-600" />
              Time Tracking
            </h1>
            <p className="text-muted-foreground">Track your time and boost productivity</p>
          </div>
          <GradientButton from="amber" to="orange" onClick={() => console.log('Reports')}>
            <Download className="w-5 h-5 mr-2" />
            Export Reports
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        {/* Active Timer Card */}
        <BentoCard gradient="orange" className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold text-lg">Active Timer</h3>
                <p className="text-white/80 text-sm">E-commerce Website - Backend Integration</p>
              </div>
              <div className="text-white text-4xl font-bold font-mono">
                {formatTime(elapsedTime)}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!isTracking ? (
                <ModernButton variant="primary" size="lg" onClick={() => setIsTracking(true)}>
                  <Play className="w-5 h-5 mr-2" />
                  Start Timer
                </ModernButton>
              ) : (
                <>
                  <ModernButton variant="outline" size="lg" onClick={() => setIsTracking(false)}>
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </ModernButton>
                  <ModernButton variant="outline" size="lg" onClick={() => { setIsTracking(false); setElapsedTime(0) }}>
                    <Square className="w-5 h-5 mr-2" />
                    Stop
                  </ModernButton>
                </>
              )}
            </div>
          </div>
        </BentoCard>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Plus />} title="New Entry" description="Manual log" onClick={() => console.log('New')} />
          <BentoQuickAction icon={<Calendar />} title="Weekly Report" description="View summary" onClick={() => console.log('Weekly')} />
          <BentoQuickAction icon={<BarChart3 />} title="Analytics" description="Insights" onClick={() => console.log('Analytics')} />
          <BentoQuickAction icon={<Download />} title="Export" description="Download CSV" onClick={() => console.log('Export')} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Recent Time Entries</h3>
              <div className="space-y-4">
                {timeEntries.map((entry) => (
                  <div key={entry.id} className="p-4 rounded-lg border border-border bg-background">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{entry.project}</h4>
                        <p className="text-sm text-muted-foreground">{entry.task}</p>
                        <p className="text-xs text-muted-foreground mt-1">{entry.date}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-amber-600">{formatDuration(entry.duration)}</div>
                        {entry.billable && (
                          <span className="text-xs bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 px-2 py-1 rounded-md">
                            Billable
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <ModernButton variant="outline" size="sm" onClick={() => console.log('Edit', entry.id)}>
                        Edit
                      </ModernButton>
                      <ModernButton variant="outline" size="sm" onClick={() => console.log('Continue', entry.id)}>
                        <Play className="w-3 h-3 mr-1" />
                        Continue
                      </ModernButton>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <ProgressCard
              title="Weekly Goal"
              current={34.2}
              goal={40}
              unit="h"
              icon={<Target className="w-5 h-5" />}
            />
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Avg Daily Hours" value="6.8h" change={12.5} />
                <MiniKPI label="Billable Ratio" value="83%" change={5.7} />
                <MiniKPI label="Projects Active" value="8" change={8.3} />
                <MiniKPI label="This Month" value="142h" change={15.2} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
