'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Headset, Play, Users, Settings, Globe, Box, Zap, Clock,
  Wifi, Signal, Mic, MicOff, Hand, Video, VideoOff, Share2,
  Grid, Layers, Sparkles, Map, Compass, Activity, BarChart,
  User, Crown, MessageSquare, Camera, Layout, Monitor, Smartphone,
  Tablet, Plus, Search, Filter, TrendingUp, Award, Radio
} from 'lucide-react'

import {
  AR_ENVIRONMENTS,
  AR_TEMPLATES,
  MOCK_AR_SESSIONS,
  MOCK_AR_PARTICIPANTS,
  MOCK_AR_STATS,
  formatDuration,
  getDeviceIcon,
  getDeviceName,
  getLatencyColor,
  getLatencyLabel,
  getEnvironmentIcon
} from '@/lib/ar-collaboration-utils'

type ViewMode = 'lobby' | 'sessions' | 'environments' | 'analytics'

export default function ARCollaborationPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('lobby')
  const [selectedEnvironment, setSelectedEnvironment] = useState(AR_ENVIRONMENTS[0])
  const [sessionName, setSessionName] = useState('')
  const [maxParticipants, setMaxParticipants] = useState('10')

  return (
    <div className="min-h-screen p-6 pb-20 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <ScrollReveal>
        <div className="mb-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full mb-4">
            <Headset className="w-4 h-4 text-cyan-500" />
            <span className="text-sm font-medium">AR Collaboration</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <TextShimmer>Immersive Workspace</TextShimmer>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Step into the future of team collaboration with augmented reality
          </p>
        </div>
      </ScrollReveal>

      {/* View Mode Tabs */}
      <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
        {[
          { id: 'lobby', label: 'Lobby', icon: Globe },
          { id: 'sessions', label: 'Active Sessions', icon: Radio },
          { id: 'environments', label: 'Environments', icon: Map },
          { id: 'analytics', label: 'Analytics', icon: BarChart }
        ].map((mode) => {
          const Icon = mode.icon
          return (
            <Button
              key={mode.id}
              variant={viewMode === mode.id ? 'default' : 'outline'}
              onClick={() => setViewMode(mode.id as ViewMode)}
              className="gap-2"
            >
              <Icon className="w-4 h-4" />
              {mode.label}
            </Button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* Lobby View */}
        {viewMode === 'lobby' && (
          <motion.div
            key="lobby"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Create Session */}
            <div className="lg:col-span-2 space-y-6">
              <LiquidGlassCard>
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-semibold flex items-center gap-2">
                      <Plus className="w-6 h-6 text-cyan-500" />
                      Create AR Session
                    </h3>
                    <Badge variant="secondary" className="gap-2">
                      <Sparkles className="w-3 h-3" />
                      New
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Session Name</label>
                      <Input
                        placeholder="e.g., Product Design Review"
                        value={sessionName}
                        onChange={(e) => setSessionName(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Max Participants</label>
                        <Select value={maxParticipants} onValueChange={setMaxParticipants}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="4">4 participants</SelectItem>
                            <SelectItem value="8">8 participants</SelectItem>
                            <SelectItem value="10">10 participants</SelectItem>
                            <SelectItem value="20">20 participants</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Environment</label>
                        <Select value={selectedEnvironment.id} onValueChange={(id) => {
                          const env = AR_ENVIRONMENTS.find(e => e.id === id)
                          if (env) setSelectedEnvironment(env)
                        }}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {AR_ENVIRONMENTS.map((env) => (
                              <SelectItem key={env.id} value={env.id}>
                                {getEnvironmentIcon(env.type)} {env.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-3">Session Features</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="rounded" defaultChecked />
                          <span className="text-sm">Spatial Audio</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="rounded" defaultChecked />
                          <span className="text-sm">Whiteboard</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="rounded" defaultChecked />
                          <span className="text-sm">Screen Share</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">Recording</span>
                        </label>
                      </div>
                    </div>

                    <Button className="w-full gap-2" size="lg">
                      <Headset className="w-5 h-5" />
                      Launch AR Session
                    </Button>
                  </div>
                </div>
              </LiquidGlassCard>

              {/* Templates */}
              <LiquidGlassCard>
                <div className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Layout className="w-5 h-5 text-cyan-500" />
                    Quick Start Templates
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {AR_TEMPLATES.map((template) => (
                      <Card key={template.id} className="p-4 hover:shadow-lg transition-all cursor-pointer">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold">{template.name}</h4>
                              <p className="text-xs text-muted-foreground">{template.description}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">{template.category}</Badge>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <TrendingUp className="w-3 h-3" />
                              {template.popularity}% popularity
                            </div>
                            <Button size="sm" variant="ghost">Use Template</Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </LiquidGlassCard>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Device Support */}
              <LiquidGlassCard>
                <div className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-cyan-500" />
                    Supported Devices
                  </h3>

                  <div className="space-y-3">
                    {(['hololens', 'quest', 'arkit', 'arcore', 'webxr'] as const).map((device) => (
                      <div key={device} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getDeviceIcon(device)}</span>
                          <span className="text-sm font-medium">{getDeviceName(device)}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {MOCK_AR_STATS.activeDevices[device]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </LiquidGlassCard>

              {/* Quick Stats */}
              <LiquidGlassCard>
                <div className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-500" />
                    Platform Stats
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Radio className="w-4 h-4 text-cyan-500" />
                        <span className="text-sm">Active Sessions</span>
                      </div>
                      <span className="font-semibold">{MOCK_AR_SESSIONS.length}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-cyan-500" />
                        <span className="text-sm">Total Users</span>
                      </div>
                      <span className="font-semibold">{MOCK_AR_STATS.totalParticipants}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-cyan-500" />
                        <span className="text-sm">Avg Duration</span>
                      </div>
                      <span className="font-semibold">{formatDuration(MOCK_AR_STATS.averageSessionDuration)}</span>
                    </div>
                  </div>
                </div>
              </LiquidGlassCard>
            </div>
          </motion.div>
        )}

        {/* Active Sessions View */}
        {viewMode === 'sessions' && (
          <motion.div
            key="sessions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <LiquidGlassCard>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search sessions..." className="pl-10" />
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>

                <div className="space-y-4">
                  {MOCK_AR_SESSIONS.map((session) => (
                    <Card key={session.id} className="p-6 hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{session.name}</h3>
                            <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                              {session.status}
                            </Badge>
                            {session.isRecording && (
                              <Badge variant="destructive" className="gap-1">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                Recording
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">{session.description}</p>

                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {formatDuration(session.duration!)}
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              0/{session.maxParticipants} participants
                            </div>
                          </div>
                        </div>

                        <Button className="gap-2">
                          <Headset className="w-4 h-4" />
                          Join Session
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </LiquidGlassCard>
          </motion.div>
        )}

        {/* Environments View */}
        {viewMode === 'environments' && (
          <motion.div
            key="environments"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {AR_ENVIRONMENTS.map((env) => (
              <LiquidGlassCard key={env.id}>
                <div className="p-6 space-y-4">
                  <div className="text-center">
                    <div className="text-6xl mb-4">{getEnvironmentIcon(env.type)}</div>
                    <h3 className="text-lg font-semibold mb-2">{env.name}</h3>
                    <Badge variant="outline">{env.type}</Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant={selectedEnvironment.id === env.id ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedEnvironment(env)}
                    >
                      {selectedEnvironment.id === env.id ? 'Selected' : 'Select'}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </LiquidGlassCard>
            ))}
          </motion.div>
        )}

        {/* Analytics View */}
        {viewMode === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <LiquidGlassCard>
              <div className="p-6 text-center">
                <Radio className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">{MOCK_AR_STATS.totalSessions}</div>
                <div className="text-sm text-muted-foreground">Total Sessions</div>
              </div>
            </LiquidGlassCard>

            <LiquidGlassCard>
              <div className="p-6 text-center">
                <Users className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">{MOCK_AR_STATS.totalParticipants}</div>
                <div className="text-sm text-muted-foreground">Total Participants</div>
              </div>
            </LiquidGlassCard>

            <LiquidGlassCard>
              <div className="p-6 text-center">
                <Clock className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">{formatDuration(MOCK_AR_STATS.totalSessionTime)}</div>
                <div className="text-sm text-muted-foreground">Total Time</div>
              </div>
            </LiquidGlassCard>

            <LiquidGlassCard>
              <div className="p-6 text-center">
                <Award className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">{formatDuration(MOCK_AR_STATS.averageSessionDuration)}</div>
                <div className="text-sm text-muted-foreground">Avg Duration</div>
              </div>
            </LiquidGlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
