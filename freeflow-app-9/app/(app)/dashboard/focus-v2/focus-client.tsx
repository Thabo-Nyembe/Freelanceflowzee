'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import {
  Focus, Play, Pause, RotateCcw, Volume2, VolumeX, Clock,
  Target, CheckCircle, Coffee, Zap, Moon, Sun, Music,
  Bell, BellOff, BarChart3, Settings, Flame, Trophy,
  Timer, Brain, Headphones, Maximize2
} from 'lucide-react'

const focusSessions = [
  { id: 1, task: 'Design Review', duration: 45, completed: true, date: '2024-01-15', focusScore: 92 },
  { id: 2, task: 'Code Implementation', duration: 60, completed: true, date: '2024-01-15', focusScore: 88 },
  { id: 3, task: 'Documentation', duration: 30, completed: true, date: '2024-01-15', focusScore: 95 },
  { id: 4, task: 'Client Meeting Prep', duration: 25, completed: false, date: '2024-01-14', focusScore: 75 },
  { id: 5, task: 'Research', duration: 45, completed: true, date: '2024-01-14', focusScore: 85 },
]

const ambientSounds = [
  { id: 'rain', name: 'Rain', icon: '🌧️' },
  { id: 'forest', name: 'Forest', icon: '🌲' },
  { id: 'cafe', name: 'Café', icon: '☕' },
  { id: 'ocean', name: 'Ocean', icon: '🌊' },
  { id: 'fire', name: 'Fireplace', icon: '🔥' },
  { id: 'white', name: 'White Noise', icon: '📻' },
]

export default function FocusClient() {
  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [sessionType, setSessionType] = useState('focus')
  const [focusDuration, setFocusDuration] = useState(25)
  const [breakDuration, setBreakDuration] = useState(5)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [selectedSound, setSelectedSound] = useState('rain')
  const [volume, setVolume] = useState([50])
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)

  const stats = useMemo(() => ({
    todaySessions: focusSessions.filter(s => s.date === '2024-01-15').length,
    todayMinutes: focusSessions.filter(s => s.date === '2024-01-15').reduce((sum, s) => sum + s.duration, 0),
    weeklyStreak: 5,
    avgFocusScore: Math.round(focusSessions.reduce((sum, s) => sum + s.focusScore, 0) / focusSessions.length),
  }), [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(sessionType === 'focus' ? focusDuration * 60 : breakDuration * 60)
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const switchSession = (type: string) => {
    setSessionType(type)
    setIsRunning(false)
    setTimeLeft(type === 'focus' ? focusDuration * 60 : breakDuration * 60)
  }

  const insights = [
    { icon: Clock, title: `${stats.todayMinutes} min`, description: 'Focused today' },
    { icon: Target, title: `${stats.todaySessions}`, description: 'Sessions' },
    { icon: Flame, title: `${stats.weeklyStreak}`, description: 'Day streak' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Focus className="h-8 w-8 text-primary" />
            Focus Mode
          </h1>
          <p className="text-muted-foreground mt-1">Deep work sessions with ambient sounds</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Statistics
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <CollapsibleInsightsPanel
        title="Focus Stats"
        insights={insights}
        defaultExpanded={true}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className={`p-12 text-center transition-colors ${
                sessionType === 'focus'
                  ? 'bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/30 dark:to-background'
                  : 'bg-gradient-to-b from-green-50 to-white dark:from-green-950/30 dark:to-background'
              }`}>
                <div className="mb-6">
                  <Tabs value={sessionType} onValueChange={switchSession} className="inline-flex">
                    <TabsList>
                      <TabsTrigger value="focus" className="px-6">
                        <Brain className="h-4 w-4 mr-2" />
                        Focus
                      </TabsTrigger>
                      <TabsTrigger value="break" className="px-6">
                        <Coffee className="h-4 w-4 mr-2" />
                        Break
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="relative inline-flex items-center justify-center mb-8">
                  <div className="absolute inset-0 rounded-full border-8 border-muted" />
                  <div
                    className="absolute inset-0 rounded-full border-8 border-primary transition-all"
                    style={{
                      clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin(2 * Math.PI * (1 - timeLeft / (sessionType === 'focus' ? focusDuration * 60 : breakDuration * 60)))}% ${50 - 50 * Math.cos(2 * Math.PI * (1 - timeLeft / (sessionType === 'focus' ? focusDuration * 60 : breakDuration * 60)))}%, 50% 50%)`
                    }}
                  />
                  <div className="w-64 h-64 flex flex-col items-center justify-center">
                    <span className="text-6xl font-bold font-mono">{formatTime(timeLeft)}</span>
                    <span className="text-muted-foreground mt-2 capitalize">{sessionType} Session</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <Button variant="outline" size="icon" onClick={resetTimer}>
                    <RotateCcw className="h-5 w-5" />
                  </Button>
                  <Button size="lg" className="w-32" onClick={toggleTimer}>
                    {isRunning ? (
                      <>
                        <Pause className="h-5 w-5 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5 mr-2" />
                        Start
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setFullscreen(!fullscreen)}>
                    <Maximize2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="p-6 border-t">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center">
                    <Headphones className="h-4 w-4 mr-2" />
                    Ambient Sounds
                  </h3>
                  <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                </div>
                {soundEnabled && (
                  <>
                    <div className="grid grid-cols-6 gap-2 mb-4">
                      {ambientSounds.map((sound) => (
                        <button
                          key={sound.id}
                          onClick={() => setSelectedSound(sound.id)}
                          className={`p-3 rounded-lg border transition-all ${
                            selectedSound === sound.id
                              ? 'border-primary bg-primary/10'
                              : 'border-muted hover:border-primary/50'
                          }`}
                        >
                          <span className="text-2xl block mb-1">{sound.icon}</span>
                          <span className="text-xs">{sound.name}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-4">
                      <VolumeX className="h-4 w-4 text-muted-foreground" />
                      <Slider value={volume} onValueChange={setVolume} max={100} className="flex-1" />
                      <Volume2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Timer Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Focus Duration: {focusDuration} min</label>
                <Slider
                  value={[focusDuration]}
                  onValueChange={(v) => setFocusDuration(v[0])}
                  min={15}
                  max={90}
                  step={5}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Break Duration: {breakDuration} min</label>
                <Slider
                  value={[breakDuration]}
                  onValueChange={(v) => setBreakDuration(v[0])}
                  min={5}
                  max={30}
                  step={5}
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                  <span className="text-sm">Notifications</span>
                </div>
                <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Today&apos;s Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {focusSessions.filter(s => s.date === '2024-01-15').map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      {session.completed ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm">{session.task}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{session.duration}m</span>
                      <Badge variant="outline" className="text-xs">
                        {session.focusScore}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-muted/50">
                  <Flame className="h-6 w-6 mx-auto text-orange-500 mb-1" />
                  <p className="text-xs font-medium">5 Day Streak</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <Clock className="h-6 w-6 mx-auto text-blue-500 mb-1" />
                  <p className="text-xs font-medium">100+ Hours</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <Zap className="h-6 w-6 mx-auto text-purple-500 mb-1" />
                  <p className="text-xs font-medium">Early Bird</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
