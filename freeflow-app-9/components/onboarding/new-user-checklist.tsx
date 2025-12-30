'use client'

/**
 * New User Onboarding Checklist
 *
 * A world-class onboarding experience with:
 * - Persistent progress tracking
 * - Interactive project creation wizard
 * - Gamification (confetti, badges, progress)
 * - Contextual tooltips
 * - Smart task recommendations
 */

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Trophy,
  Star,
  Target,
  User,
  Briefcase,
  FolderPlus,
  Users,
  Zap,
  Play,
  Gift,
  Rocket,
  X,
  Plus,
  Calendar,
  DollarSign,
  Palette,
  MessageSquare,
  Video,
  Clock,
  TrendingUp,
  Award
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { createClient } from '@/lib/supabase/client'
import { createFeatureLogger } from '@/lib/logger'
import { cn } from '@/lib/utils'

const logger = createFeatureLogger('NewUserChecklist')

// ============================================================================
// TYPES
// ============================================================================

interface OnboardingTask {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  category: 'setup' | 'explore' | 'create' | 'advanced'
  xpReward: number
  estimatedTime: string
  action?: () => void
  isComplete: boolean
  priority: 'required' | 'recommended' | 'optional'
  unlocks?: string[]
}

interface OnboardingProgress {
  completedTasks: string[]
  totalXP: number
  level: number
  badges: string[]
  startedAt: string
  lastActivityAt: string
  projectCreated: boolean
  profileCompleted: boolean
  firstClientAdded: boolean
}

// ============================================================================
// CONSTANTS
// ============================================================================

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 5000]
const LEVEL_NAMES = ['Newcomer', 'Explorer', 'Creator', 'Professional', 'Expert', 'Master', 'Legend']

const BADGE_DEFINITIONS = {
  'first-login': { name: 'First Steps', icon: '👋', description: 'Logged in for the first time' },
  'profile-complete': { name: 'Identity Established', icon: '🎭', description: 'Completed your profile' },
  'first-project': { name: 'Project Pioneer', icon: '🚀', description: 'Created your first project' },
  'first-client': { name: 'Networker', icon: '🤝', description: 'Added your first client' },
  'explorer': { name: 'Feature Explorer', icon: '🔍', description: 'Explored 5 different features' },
  'quick-start': { name: 'Quick Starter', icon: '⚡', description: 'Completed onboarding in under 10 minutes' },
  'all-complete': { name: 'Onboarding Champion', icon: '🏆', description: 'Completed all onboarding tasks' }
}

// ============================================================================
// PROJECT CREATION WIZARD
// ============================================================================

interface ProjectWizardProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (project: any) => void
}

function ProjectCreationWizard({ isOpen, onClose, onComplete }: ProjectWizardProps) {
  const [step, setStep] = useState(1)
  const [isCreating, setIsCreating] = useState(false)
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    client_name: '',
    budget: '',
    deadline: '',
    category: 'design',
    priority: 'medium'
  })

  const handleCreate = async () => {
    if (!projectData.name) {
      toast.error('Please enter a project name')
      return
    }

    setIsCreating(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Not authenticated')
      }

      // Create the project
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: projectData.name,
          description: projectData.description,
          budget: projectData.budget ? parseFloat(projectData.budget) : null,
          deadline: projectData.deadline || null,
          category: projectData.category,
          priority: projectData.priority,
          status: 'active',
          progress: 0,
          user_id: user.id
        })
        .select()
        .single()

      if (error) throw error

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })

      toast.success('Project created successfully!', {
        description: 'Your first project is ready to go!'
      })

      onComplete(data)
      onClose()

      // Reset form
      setStep(1)
      setProjectData({
        name: '',
        description: '',
        client_name: '',
        budget: '',
        deadline: '',
        category: 'design',
        priority: 'medium'
      })

    } catch (error: any) {
      logger.error('Failed to create project', { error: error.message })
      toast.error('Failed to create project', {
        description: error.message
      })
    } finally {
      setIsCreating(false)
    }
  }

  const totalSteps = 3

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <FolderPlus className="w-5 h-5 text-white" />
            </div>
            Create Your First Project
          </DialogTitle>
          <DialogDescription>
            Let's set up your first project in just 3 simple steps
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all",
                step >= s
                  ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
                  : "bg-gray-100 text-gray-400"
              )}>
                {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div className={cn(
                  "flex-1 h-1 mx-2 rounded transition-all",
                  step > s ? "bg-gradient-to-r from-blue-500 to-purple-600" : "bg-gray-200"
                )} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold">Step 1: Project Basics</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Website Redesign, Brand Identity, App Development"
                    value={projectData.name}
                    onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Briefly describe what this project is about..."
                    value={projectData.description}
                    onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client">Client Name (Optional)</Label>
                  <Input
                    id="client"
                    placeholder="e.g., Acme Corp, John Smith"
                    value={projectData.client_name}
                    onChange={(e) => setProjectData({ ...projectData, client_name: e.target.value })}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold">Step 2: Project Details</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={projectData.category}
                    onValueChange={(v) => setProjectData({ ...projectData, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="design">
                        <div className="flex items-center gap-2">
                          <Palette className="w-4 h-4" />
                          Design
                        </div>
                      </SelectItem>
                      <SelectItem value="development">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Development
                        </div>
                      </SelectItem>
                      <SelectItem value="marketing">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Marketing
                        </div>
                      </SelectItem>
                      <SelectItem value="video">
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4" />
                          Video/Media
                        </div>
                      </SelectItem>
                      <SelectItem value="consulting">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Consulting
                        </div>
                      </SelectItem>
                      <SelectItem value="other">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          Other
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={projectData.priority}
                    onValueChange={(v) => setProjectData({ ...projectData, priority: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget ($)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="e.g., 5000"
                    value={projectData.budget}
                    onChange={(e) => setProjectData({ ...projectData, budget: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={projectData.deadline}
                    onChange={(e) => setProjectData({ ...projectData, deadline: e.target.value })}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold">Step 3: Review & Create</h3>

              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <FolderPlus className="w-8 h-8 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <h4 className="text-xl font-bold">{projectData.name || 'Untitled Project'}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {projectData.description || 'No description provided'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4 text-gray-500" />
                      <span className="capitalize">{projectData.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-gray-500" />
                      <span className="capitalize">{projectData.priority} Priority</span>
                    </div>
                    {projectData.budget && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span>${Number(projectData.budget).toLocaleString()}</span>
                      </div>
                    )}
                    {projectData.deadline && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>{new Date(projectData.deadline).toLocaleDateString()}</span>
                      </div>
                    )}
                    {projectData.client_name && (
                      <div className="flex items-center gap-2 col-span-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span>{projectData.client_name}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Gift className="w-6 h-6 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-green-800 dark:text-green-200">You'll earn rewards!</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      +50 XP and "Project Pioneer" badge for creating your first project
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <DialogFooter className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>

          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && !projectData.name}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleCreate}
              disabled={isCreating || !projectData.name}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  Create Project
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface NewUserChecklistProps {
  userId?: string
  onDismiss?: () => void
  minimized?: boolean
}

export function NewUserChecklist({ userId, onDismiss, minimized: initialMinimized = false }: NewUserChecklistProps) {
  const [minimized, setMinimized] = useState(initialMinimized)
  const [showProjectWizard, setShowProjectWizard] = useState(false)
  const [progress, setProgress] = useState<OnboardingProgress>({
    completedTasks: [],
    totalXP: 0,
    level: 0,
    badges: ['first-login'],
    startedAt: new Date().toISOString(),
    lastActivityAt: new Date().toISOString(),
    projectCreated: false,
    profileCompleted: false,
    firstClientAdded: false
  })

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem(`kazi_onboarding_progress_${userId || 'default'}`)
    if (savedProgress) {
      try {
        setProgress(JSON.parse(savedProgress))
      } catch (e) {
        logger.error('Failed to parse onboarding progress', { error: e })
      }
    }
  }, [userId])

  // Save progress to localStorage
  const saveProgress = useCallback((newProgress: OnboardingProgress) => {
    setProgress(newProgress)
    localStorage.setItem(`kazi_onboarding_progress_${userId || 'default'}`, JSON.stringify(newProgress))
  }, [userId])

  // Complete a task
  const completeTask = useCallback((taskId: string, xpReward: number) => {
    if (progress.completedTasks.includes(taskId)) return

    const newCompletedTasks = [...progress.completedTasks, taskId]
    const newTotalXP = progress.totalXP + xpReward
    const newLevel = LEVEL_THRESHOLDS.findIndex(threshold => newTotalXP < threshold) - 1

    // Check for new badges
    const newBadges = [...progress.badges]

    if (taskId === 'create-project' && !newBadges.includes('first-project')) {
      newBadges.push('first-project')
      toast.success('Badge Earned!', {
        description: '🚀 Project Pioneer - Created your first project',
        duration: 5000
      })
    }

    if (taskId === 'complete-profile' && !newBadges.includes('profile-complete')) {
      newBadges.push('profile-complete')
      toast.success('Badge Earned!', {
        description: '🎭 Identity Established - Completed your profile',
        duration: 5000
      })
    }

    if (newCompletedTasks.length >= 5 && !newBadges.includes('explorer')) {
      newBadges.push('explorer')
      toast.success('Badge Earned!', {
        description: '🔍 Feature Explorer - Explored 5 different features',
        duration: 5000
      })
    }

    const newProgress = {
      ...progress,
      completedTasks: newCompletedTasks,
      totalXP: newTotalXP,
      level: Math.max(0, newLevel),
      badges: newBadges,
      lastActivityAt: new Date().toISOString(),
      projectCreated: taskId === 'create-project' ? true : progress.projectCreated,
      profileCompleted: taskId === 'complete-profile' ? true : progress.profileCompleted
    }

    saveProgress(newProgress)

    // Show confetti for major milestones
    if (['create-project', 'complete-profile', 'first-client'].includes(taskId)) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      })
    }

    // Check if all tasks complete
    if (newCompletedTasks.length === tasks.length && !newBadges.includes('all-complete')) {
      newBadges.push('all-complete')
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.5 }
      })
      toast.success('Congratulations!', {
        description: '🏆 You\'ve completed all onboarding tasks! You\'re now a KAZI expert.',
        duration: 8000
      })
    }

    logger.info('Onboarding task completed', { taskId, xpReward, newTotalXP, level: newLevel })
  }, [progress, saveProgress])

  // Handle project creation
  const handleProjectCreated = useCallback((project: any) => {
    completeTask('create-project', 50)
    logger.info('First project created during onboarding', { projectId: project?.id })
  }, [completeTask])

  // Define tasks
  const tasks: OnboardingTask[] = [
    {
      id: 'complete-profile',
      title: 'Complete Your Profile',
      description: 'Add your photo, bio, and contact info',
      icon: <User className="w-5 h-5" />,
      category: 'setup',
      xpReward: 30,
      estimatedTime: '2 min',
      priority: 'required',
      isComplete: progress.completedTasks.includes('complete-profile'),
      action: () => {
        window.location.href = '/dashboard/settings?tab=profile'
      }
    },
    {
      id: 'create-project',
      title: 'Create Your First Project',
      description: 'Start tracking your first client project',
      icon: <FolderPlus className="w-5 h-5" />,
      category: 'create',
      xpReward: 50,
      estimatedTime: '3 min',
      priority: 'required',
      isComplete: progress.completedTasks.includes('create-project'),
      action: () => setShowProjectWizard(true)
    },
    {
      id: 'explore-dashboard',
      title: 'Explore Your Dashboard',
      description: 'Learn about the key features available',
      icon: <Target className="w-5 h-5" />,
      category: 'explore',
      xpReward: 20,
      estimatedTime: '5 min',
      priority: 'recommended',
      isComplete: progress.completedTasks.includes('explore-dashboard'),
      action: () => {
        completeTask('explore-dashboard', 20)
        toast.success('Dashboard explored!', { description: '+20 XP earned' })
      }
    },
    {
      id: 'try-ai-create',
      title: 'Try AI Create',
      description: 'Generate content with AI assistance',
      icon: <Sparkles className="w-5 h-5" />,
      category: 'explore',
      xpReward: 25,
      estimatedTime: '3 min',
      priority: 'recommended',
      isComplete: progress.completedTasks.includes('try-ai-create'),
      action: () => {
        window.location.href = '/dashboard/ai-create'
      }
    },
    {
      id: 'view-calendar',
      title: 'Check Your Calendar',
      description: 'View and manage your schedule',
      icon: <Calendar className="w-5 h-5" />,
      category: 'explore',
      xpReward: 15,
      estimatedTime: '2 min',
      priority: 'optional',
      isComplete: progress.completedTasks.includes('view-calendar'),
      action: () => {
        completeTask('view-calendar', 15)
        window.location.href = '/dashboard/calendar'
      }
    },
    {
      id: 'take-tour',
      title: 'Take an Interactive Tour',
      description: 'Watch guided tours of key features',
      icon: <Play className="w-5 h-5" />,
      category: 'explore',
      xpReward: 30,
      estimatedTime: '5 min',
      priority: 'recommended',
      isComplete: progress.completedTasks.includes('take-tour'),
      action: () => {
        completeTask('take-tour', 30)
        // Trigger tour launcher
      }
    }
  ]

  const completedCount = progress.completedTasks.length
  const totalCount = tasks.length
  const progressPercentage = (completedCount / totalCount) * 100
  const currentLevelName = LEVEL_NAMES[progress.level] || LEVEL_NAMES[0]
  const nextLevelXP = LEVEL_THRESHOLDS[progress.level + 1] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  const xpToNextLevel = nextLevelXP - progress.totalXP

  // Check if all tasks are complete
  if (progress.completedTasks.length === tasks.length) {
    return null // Hide checklist when complete
  }

  return (
    <>
      <ProjectCreationWizard
        isOpen={showProjectWizard}
        onClose={() => setShowProjectWizard(false)}
        onComplete={handleProjectCreated}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Card className="overflow-hidden border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950 dark:via-gray-900 dark:to-purple-950">
          {/* Header */}
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    Getting Started
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      {completedCount}/{totalCount}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    Level {progress.level + 1}: {currentLevelName} • {progress.totalXP} XP
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMinimized(!minimized)}
                >
                  {minimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </Button>
                {onDismiss && (
                  <Button variant="ghost" size="sm" onClick={onDismiss}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{progress.totalXP} XP</span>
                <span>{xpToNextLevel > 0 ? `${xpToNextLevel} XP to next level` : 'Max Level!'}</span>
              </div>
            </div>
          </CardHeader>

          {/* Tasks List - Collapsible */}
          <AnimatePresence>
            {!minimized && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <CardContent className="pt-0">
                  <div className="space-y-2 mt-4">
                    {tasks.map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                          task.isComplete
                            ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950"
                        )}
                        onClick={() => !task.isComplete && task.action?.()}
                      >
                        {/* Status Icon */}
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                          task.isComplete
                            ? "bg-green-500 text-white"
                            : task.priority === 'required'
                            ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        )}>
                          {task.isComplete ? <CheckCircle2 className="w-5 h-5" /> : task.icon}
                        </div>

                        {/* Task Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "font-medium",
                              task.isComplete && "line-through text-muted-foreground"
                            )}>
                              {task.title}
                            </span>
                            {task.priority === 'required' && !task.isComplete && (
                              <Badge variant="destructive" className="text-xs">Required</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {task.description}
                          </p>
                        </div>

                        {/* Rewards */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="font-medium">{task.xpReward}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {task.estimatedTime}
                          </Badge>
                          {!task.isComplete && (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Badges Section */}
                  {progress.badges.length > 0 && (
                    <div className="mt-6 pt-4 border-t">
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4 text-yellow-500" />
                        Your Badges
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {progress.badges.map((badgeId) => {
                          const badge = BADGE_DEFINITIONS[badgeId as keyof typeof BADGE_DEFINITIONS]
                          if (!badge) return null
                          return (
                            <div
                              key={badgeId}
                              className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-full"
                              title={badge.description}
                            >
                              <span>{badge.icon}</span>
                              <span className="text-sm font-medium">{badge.name}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="mt-4 flex items-center gap-3">
                    <Button
                      onClick={() => setShowProjectWizard(true)}
                      disabled={progress.projectCreated}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Project
                    </Button>
                    <Button variant="outline" onClick={() => window.location.href = '/dashboard/settings?tab=profile'}>
                      <User className="w-4 h-4 mr-2" />
                      Complete Profile
                    </Button>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </>
  )
}

export default NewUserChecklist
