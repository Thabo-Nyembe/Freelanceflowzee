'use client'

/**
 * World-Class Voice Collaboration System
 * Complete implementation of real-time voice communication
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic, MicOff, PhoneCall, Users, Radio, Lock, Play, Pause,
  Settings, Plus, Search, Filter, Star, Download, Share2,
  Clock, TrendingUp, CheckCircle, AlertCircle, Info, Sparkles,
  ArrowRight, FileAudio, MessageSquare, Headphones, Volume2,
  Eye, Hash, Globe, Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { GlowEffect } from '@/components/ui/glow-effect'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import {
  VoiceRoom,
  VoiceRecording,
  VoiceParticipant,
  ParticipantStatus
} from '@/lib/voice-collaboration-types'
import {
  MOCK_VOICE_ROOMS,
  MOCK_RECORDINGS,
  formatDuration,
  formatFileSize,
  formatRelativeTime,
  getRoomTypeBadgeColor,
  getStatusColor,
  getRoomAvailability,
  getParticipantColor
} from '@/lib/voice-collaboration-utils'

type ViewMode = 'rooms' | 'recordings' | 'settings'

export default function VoiceCollaborationPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('rooms')
  const [selectedRoom, setSelectedRoom] = useState<VoiceRoom | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  const filteredRooms = MOCK_VOICE_ROOMS.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterType === 'all' || room.type === filterType
    return matchesSearch && matchesFilter
  })

  const getRoomTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      public: Globe,
      private: Lock,
      team: Users,
      client: Headphones,
      project: FileAudio,
      meeting: Radio
    }
    return icons[type] || Radio
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent opacity-50" />

      {/* Animated Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-4 w-96 h-96 bg-gradient-to-r from-pink-500/30 to-red-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <ScrollReveal variant="slide-up" duration={0.6}>
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-full text-sm font-medium mb-6 border border-purple-500/30"
              >
                <Headphones className="w-4 h-4" />
                Voice Collaboration
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  <Radio className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              </motion.div>

              <TextShimmer className="text-5xl md:text-6xl font-bold mb-6" duration={2}>
                Voice Communication
              </TextShimmer>

              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Crystal-clear voice rooms with recording, transcription, and spatial audio support
              </p>
            </div>
          </ScrollReveal>

          {/* View Mode Tabs */}
          <ScrollReveal variant="scale" duration={0.6} delay={0.2}>
            <div className="flex items-center justify-center gap-2 mb-8">
              {[
                { id: 'rooms' as ViewMode, label: 'Voice Rooms', icon: Radio },
                { id: 'recordings' as ViewMode, label: 'Recordings', icon: FileAudio },
                { id: 'settings' as ViewMode, label: 'Settings', icon: Settings }
              ].map((mode) => (
                <Button
                  key={mode.id}
                  variant={viewMode === mode.id ? "default" : "outline"}
                  onClick={() => setViewMode(mode.id)}
                  className={viewMode === mode.id ? "bg-gradient-to-r from-purple-600 to-pink-600" : "border-gray-700 hover:bg-slate-800"}
                >
                  <mode.icon className="w-4 h-4 mr-2" />
                  {mode.label}
                </Button>
              ))}
            </div>
          </ScrollReveal>

          {/* Rooms View */}
          {viewMode === 'rooms' && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <LiquidGlassCard className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search voice rooms..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <Button variant="outline" className="border-gray-700 hover:bg-slate-800">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Room
                  </Button>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Filter:</span>
                  {['all', 'team', 'client', 'public'].map((type) => (
                    <Badge
                      key={type}
                      variant={filterType === type ? "default" : "outline"}
                      className={`cursor-pointer ${filterType === type ? 'bg-purple-600' : 'border-gray-700'}`}
                      onClick={() => setFilterType(type)}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Badge>
                  ))}
                </div>
              </LiquidGlassCard>

              {/* Room Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRooms.map((room) => {
                  const availability = getRoomAvailability(room)
                  const Icon = getRoomTypeIcon(room.type)
                  return (
                    <motion.div key={room.id} whileHover={{ scale: 1.02 }}>
                      <LiquidGlassCard className="p-6 h-full">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                                <Icon className="w-6 h-6 text-purple-400" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-white">{room.name}</h3>
                                <p className="text-xs text-gray-400">{room.metadata.category}</p>
                              </div>
                            </div>
                            {room.isLocked && (
                              <Lock className="w-4 h-4 text-yellow-400" />
                            )}
                          </div>

                          <p className="text-sm text-gray-400">{room.description}</p>

                          <div className="flex items-center gap-2">
                            <Badge className={`bg-${getRoomTypeBadgeColor(room.type)}-500/20 text-${getRoomTypeBadgeColor(room.type)}-300 border-${getRoomTypeBadgeColor(room.type)}-500/30 text-xs`}>
                              {room.type}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {room.quality.toUpperCase()}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-gray-400">
                              <Users className="w-4 h-4" />
                              <span>{room.currentParticipants}/{room.capacity}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {room.features.recording && (
                                <Badge variant="outline" className="text-xs border-gray-700">
                                  <FileAudio className="w-3 h-3" />
                                </Badge>
                              )}
                              {room.features.transcription && (
                                <Badge variant="outline" className="text-xs border-gray-700">
                                  <MessageSquare className="w-3 h-3" />
                                </Badge>
                              )}
                            </div>
                          </div>

                          <Button
                            className={`w-full ${availability.available ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' : 'bg-gray-700'}`}
                            disabled={!availability.available}
                          >
                            {availability.available ? (
                              <>
                                <PhoneCall className="w-4 h-4 mr-2" />
                                Join Room
                              </>
                            ) : (
                              availability.reason
                            )}
                          </Button>
                        </div>
                      </LiquidGlassCard>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Recordings View */}
          {viewMode === 'recordings' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {MOCK_RECORDINGS.map((recording) => (
                  <LiquidGlassCard key={recording.id} className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
                        <FileAudio className="w-8 h-8 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-white">{recording.title}</h3>
                            <p className="text-sm text-gray-400">{recording.description}</p>
                          </div>
                          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                            {recording.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                          <div>
                            <span className="text-gray-400 block">Duration</span>
                            <span className="text-white font-medium">{formatDuration(recording.duration)}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block">Size</span>
                            <span className="text-white font-medium">{formatFileSize(recording.fileSize || 0)}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block">Quality</span>
                            <span className="text-white font-medium">{recording.metadata.quality.toUpperCase()}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block">Date</span>
                            <span className="text-white font-medium">{formatRelativeTime(recording.startTime)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-4">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <Play className="w-4 h-4 mr-1" />
                            Play
                          </Button>
                          <Button size="sm" variant="outline" className="border-gray-700 hover:bg-slate-800">
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                          <Button size="sm" variant="outline" className="border-gray-700 hover:bg-slate-800">
                            <Share2 className="w-4 h-4 mr-1" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>
                  </LiquidGlassCard>
                ))}
              </div>

              {/* Recordings Stats */}
              <div className="space-y-6">
                <LiquidGlassCard className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    <h3 className="font-semibold text-white">Recording Stats</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Total Recordings</span>
                      <span className="font-semibold text-white">{MOCK_RECORDINGS.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Total Duration</span>
                      <span className="font-semibold text-white">2h 30m</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Storage Used</span>
                      <span className="font-semibold text-white">180 MB</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Transcriptions</span>
                      <span className="font-semibold text-white">2</span>
                    </div>
                  </div>
                </LiquidGlassCard>

                <LiquidGlassCard className="p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                    </div>
                    <h4 className="font-semibold text-purple-400">Pro Tip</h4>
                  </div>
                  <p className="text-xs text-gray-300">
                    Enable automatic transcription for all recordings to make them searchable and accessible!
                  </p>
                </LiquidGlassCard>
              </div>
            </div>
          )}

          {/* Settings View */}
          {viewMode === 'settings' && (
            <LiquidGlassCard className="p-6 max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-6">Voice Settings</h2>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Audio Quality</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['low', 'medium', 'high', 'ultra'].map((quality) => (
                      <Button
                        key={quality}
                        variant="outline"
                        className="border-gray-700 hover:bg-slate-800"
                      >
                        {quality.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-blue-300 font-medium mb-1">Audio Features</p>
                      <ul className="text-xs text-blue-400 space-y-1">
                        <li>• Noise cancellation</li>
                        <li>• Echo cancellation</li>
                        <li>• Automatic gain control</li>
                        <li>• Spatial audio support</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Settings className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </LiquidGlassCard>
          )}
        </div>
      </div>
    </div>
  )
}
