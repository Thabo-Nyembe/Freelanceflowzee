'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import {
  Timer, Play, Pause, RotateCcw, SkipForward, Settings,
  Coffee, Target, CheckCircle, Plus, Trash2, Clock,
  Flame, Trophy, BarChart3, Bell, Volume2, Zap
} from 'lucide-react'

const tasks = [
  { id: 1, title: 'Complete project proposal', pomodoros: 4, completed: 2, priority: 'high' },
  { id: 2, title: 'Review code changes', pomodoros: 2, completed: 2, priority: 'medium' },
  { id: 3, title: 'Update documentation', pomodoros: 3, completed: 1, priority: 'low' },
  { id: 4, title: 'Team sync meeting prep', pomodoros: 1, completed: 0, priority: 'medium' },
  { id: 5, title: 'Research new features', pomodoros: 3, completed: 0, priority: 'low' },
]

const completedPomodoros = [
  { id: 1, task: 'Project proposal', time: '09:00 AM', duration: 25 },
  { id: 2, task: 'Project proposal', time: '09:30 AM', duration: 25 },
  { id: 3, task: 'Code review', time: '10:00 AM', duration: 25 },
  { id: 4, task: 'Code review', time: '10:30 AM', duration: 25 },
  { id: 5, task: 'Documentation', time: '11:00 AM', duration: 25 },
]

export default function PomodoroClient() {
  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [currentPhase, setCurrentPhase] = useState<'work' | 'short-break' | 'long-break'>('work')
  const [completedCycles, setCompletedCycles] = useState(4)
  const [selectedTask, setSelectedTask] = useState<number | null>(1)
  const [autoStart, setAutoStart] = useState(true)
  const [newTask, setNewTask] = useState('')

  const stats = useMemo(() => ({
    todayPomodoros: 5,
    todayMinutes: 125,
    streak: 7,
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.completed >= t.pomodoros).length,
  }), [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getPhaseConfig = () => {
    switch (currentPhase) {
      case 'work':
        return { duration: 25, label: 'Focus Time', color: 'bg-red-500', icon: Timer }
      case 'short-break':
        return { duration: 5, label: 'Short Break', color: 'bg-green-500', icon: Coffee }
      case 'long-break':
        return { duration: 15, label: 'Long Break', color: 'bg-blue-500', icon: Coffee }
    }
  }

  const phaseConfig = getPhaseConfig()

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'low': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const insights = [
    { icon: Timer, title: `${stats.todayPomodoros}`, description: 'Pomodoros today' },
    { icon: Clock, title: `${stats.todayMinutes}m`, description: 'Focused time' },
    { icon: Flame, title: `${stats.streak}`, description: 'Day streak' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Timer className="h-8 w-8 text-primary" />
            Pomodoro Timer
          </h1>
          <p className="text-muted-foreground mt-1">Stay productive with focused work sessions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <CollapsibleInsightsPanel
        title="Today's Progress"
        insights={insights}
        defaultExpanded={true}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col items-center">
                <div className="flex gap-2 mb-8">
                  <Button
                    variant={currentPhase === 'work' ? 'default' : 'outline'}
                    onClick={() => setCurrentPhase('work')}
                  >
                    <Timer className="h-4 w-4 mr-2" />
                    Focus
                  </Button>
                  <Button
                    variant={currentPhase === 'short-break' ? 'default' : 'outline'}
                    onClick={() => setCurrentPhase('short-break')}
                  >
                    <Coffee className="h-4 w-4 mr-2" />
                    Short Break
                  </Button>
                  <Button
                    variant={currentPhase === 'long-break' ? 'default' : 'outline'}
                    onClick={() => setCurrentPhase('long-break')}
                  >
                    <Coffee className="h-4 w-4 mr-2" />
                    Long Break
                  </Button>
                </div>

                <div className={`relative w-64 h-64 rounded-full flex items-center justify-center mb-8 ${phaseConfig.color}/10`}>
                  <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-muted/30"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      className={phaseConfig.color.replace('bg-', 'text-')}
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - timeLeft / (phaseConfig.duration * 60))}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="text-center z-10">
                    <span className="text-5xl font-bold font-mono">{formatTime(timeLeft)}</span>
                    <p className="text-muted-foreground mt-2">{phaseConfig.label}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Button variant="outline" size="icon" onClick={() => setTimeLeft(phaseConfig.duration * 60)}>
                    <RotateCcw className="h-5 w-5" />
                  </Button>
                  <Button size="lg" className="w-32" onClick={() => setIsRunning(!isRunning)}>
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
                  <Button variant="outline" size="icon">
                    <SkipForward className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 mt-6">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full ${
                        i < completedCycles % 4
                          ? 'bg-red-500'
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">
                    {completedCycles} pomodoros completed
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Task Queue</CardTitle>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Add a task..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    className="w-48"
                  />
                  <Button size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                      selectedTask === task.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedTask(task.id)}
                  >
                    <div className="flex items-center gap-3">
                      {task.completed >= task.pomodoros ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-muted" />
                      )}
                      <div>
                        <p className={`font-medium ${task.completed >= task.pomodoros ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">
                            {[...Array(task.pomodoros)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full mr-0.5 ${
                                  i < task.completed ? 'bg-red-500' : 'bg-muted'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {task.completed}/{task.pomodoros}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-start breaks</p>
                  <p className="text-xs text-muted-foreground">Automatically start break after focus</p>
                </div>
                <Switch checked={autoStart} onCheckedChange={setAutoStart} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sound notifications</p>
                  <p className="text-xs text-muted-foreground">Play sound when timer ends</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Desktop notifications</p>
                  <p className="text-xs text-muted-foreground">Show browser notifications</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Today&apos;s Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {completedPomodoros.map((pomo) => (
                  <div key={pomo.id} className="flex items-center justify-between text-sm p-2 rounded bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-red-500" />
                      <span>{pomo.task}</span>
                    </div>
                    <span className="text-muted-foreground">{pomo.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Weekly Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pomodoros</span>
                  <span className="font-bold">32</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Focus Time</span>
                  <span className="font-bold">13.3 hrs</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tasks Completed</span>
                  <span className="font-bold">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Avg Daily</span>
                  <span className="font-bold">4.6 pomodoros</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
