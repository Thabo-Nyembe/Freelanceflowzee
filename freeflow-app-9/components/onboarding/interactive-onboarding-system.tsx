'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import {
  Play,
  Pause,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle,
  Star,
  Zap,
  Brain,
  Users,
  Palette,
  Settings,
  Sparkles,
  Eye,
  Lightbulb,
  Target,
  Award,
  Rocket
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useContext7GUI } from '@/components/ui/enhanced-gui-2025'

interface OnboardingStep {
  id: string
  title: string
  description: string
  content: React.ReactNode
  duration: number
  icon: React.ReactNode
  category: 'intro' | 'features' | 'advanced' | 'completion'
  optional?: boolean
  interactive?: boolean
  selector?: string // CSS selector for highlighting elements
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
}

interface OnboardingTour {
  id: string
  title: string
  description: string
  estimatedTime: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  icon: React.ReactNode
  steps: OnboardingStep[]
  rewards: {
    xp: number
    badges: string[]
    features: string[]
  }
}

const ONBOARDING_TOURS: OnboardingTour[] = [
  {
    id: 'welcome',
    title: 'Welcome to KAZI',
    description: 'Get started with the quantum-powered creative platform',
    estimatedTime: '5 min',
    difficulty: 'beginner',
    icon: <Rocket className="w-6 h-6" />,
    rewards: {
      xp: 100,
      badges: ['Welcome Aboard', 'First Steps'],
      features: ['Basic Dashboard', 'Profile Setup']
    },
    steps: [
      {
        id: 'welcome-intro',
        title: 'Welcome to the Future',
        description: 'KAZI revolutionizes creative workflows with AI-powered tools',
        duration: 30,
        icon: <Sparkles className="w-5 h-5" />,
        category: 'intro',
        content: (
          <div className="space-y-4">
            <div className="text-center">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center"
              >
                <Brain className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2">Welcome to KAZI</h3>
              <p className="text-gray-600">
                The world's first quantum-powered creative platform designed for modern creators and teams.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-sm font-medium">AI-Powered</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-sm font-medium">Collaborative</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-green-100 flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-sm font-medium">Results-Driven</p>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'dashboard-overview',
        title: 'Your Command Center',
        description: 'Explore your personalized dashboard',
        duration: 45,
        icon: <Settings className="w-5 h-5" />,
        category: 'features',
        selector: '[data-testid="dashboard-tabs"]',
        position: 'bottom',
        content: (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dashboard Overview</h3>
            <p className="text-gray-600">
              Your dashboard is your mission control. Here you can monitor projects, track analytics, and access all KAZI features.
            </p>
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-purple-800">Pro Tip</span>
              </div>
              <p className="text-sm text-purple-700">
                Click on any tab to explore different areas of your workspace.
              </p>
            </div>
          </div>
        )
      },
      {
        id: 'ai-features-preview',
        title: 'AI Arsenal Preview',
        description: 'Discover powerful AI tools at your fingertips',
        duration: 60,
        icon: <Brain className="w-5 h-5" />,
        category: 'features',
        content: (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">AI-Powered Features</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Brain className="w-6 h-6 text-purple-600 mb-2" />
                <h4 className="font-medium text-sm">AI Create</h4>
                <p className="text-xs text-gray-600">Generate content with multiple AI models</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Palette className="w-6 h-6 text-blue-600 mb-2" />
                <h4 className="font-medium text-sm">AI Design</h4>
                <p className="text-xs text-gray-600">Intelligent design analysis and suggestions</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Users className="w-6 h-6 text-green-600 mb-2" />
                <h4 className="font-medium text-sm">Smart Collaboration</h4>
                <p className="text-xs text-gray-600">AI-enhanced team coordination</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Target className="w-6 h-6 text-orange-600 mb-2" />
                <h4 className="font-medium text-sm">Predictive Analytics</h4>
                <p className="text-xs text-gray-600">Data-driven insights and forecasting</p>
              </div>
            </div>
          </div>
        )
      }
    ]
  },
  {
    id: 'ai-features',
    title: 'AI Features Mastery',
    description: 'Master the power of AI in your creative workflow',
    estimatedTime: '8 min',
    difficulty: 'intermediate',
    icon: <Brain className="w-6 h-6" />,
    rewards: {
      xp: 200,
      badges: ['AI Explorer', 'Innovation Pioneer'],
      features: ['AI Create', 'AI Design', 'Smart Analytics']
    },
    steps: [
      {
        id: 'ai-create-intro',
        title: 'AI Create Studio',
        description: 'Generate content with multiple AI models',
        duration: 90,
        icon: <Zap className="w-5 h-5" />,
        category: 'features',
        interactive: true,
        content: (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">AI Create Studio</h3>
            <p className="text-gray-600">
              Access 7 premium AI models including GPT-4o, Claude, and DALL-E for content generation.
            </p>
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Try it now:</h4>
              <p className="text-sm text-gray-600 mb-3">Ask the AI to help you brainstorm ideas for your next project</p>
              <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
                Open AI Create
              </Button>
            </div>
          </div>
        )
      },
      {
        id: 'ai-design-analysis',
        title: 'AI Design Assistant',
        description: 'Get intelligent feedback on your designs',
        duration: 75,
        icon: <Palette className="w-5 h-5" />,
        category: 'features',
        content: (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">AI Design Analysis</h3>
            <p className="text-gray-600">
              Upload any design and get intelligent feedback on layout, color, typography, and accessibility.
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Color harmony analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Layout optimization</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Typography suggestions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Accessibility scoring</span>
              </div>
            </div>
          </div>
        )
      }
    ]
  },
  {
    id: 'collaboration',
    title: 'Team Collaboration',
    description: 'Work seamlessly with your team using quantum sync',
    estimatedTime: '7 min',
    difficulty: 'intermediate',
    icon: <Users className="w-6 h-6" />,
    rewards: {
      xp: 150,
      badges: ['Team Player', 'Collaboration Expert'],
      features: ['Universal Pinpoint System', 'Real-time Sync', 'Team Analytics']
    },
    steps: [
      {
        id: 'ups-introduction',
        title: 'Universal Pinpoint System',
        description: 'Revolutionary feedback and collaboration tool',
        duration: 120,
        icon: <Target className="w-5 h-5" />,
        category: 'features',
        content: (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Universal Pinpoint System (UPS)</h3>
            <p className="text-gray-600">
              Give and receive precise feedback on any element of your projects with pixel-perfect annotations.
            </p>
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium mb-2 text-blue-800">Key Features:</h4>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• Pixel-perfect annotations</li>
                <li>• Frame-by-frame video comments</li>
                <li>• AI-powered sentiment analysis</li>
                <li>• Cross-platform compatibility</li>
              </ul>
            </div>
          </div>
        )
      }
    ]
  }
]

interface InteractiveOnboardingSystemProps {
  userId?: string
  onComplete?: (tourId: string) => void
  autoStart?: boolean
  skipEnabled?: boolean
}

export default function InteractiveOnboardingSystem({
  userId,
  onComplete,
  autoStart = false,
  skipEnabled = true
}: InteractiveOnboardingSystemProps) {
  const [isOpen, setIsOpen] = useState(autoStart)
  const [selectedTour, setSelectedTour] = useState<OnboardingTour | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [completedTours, setCompletedTours] = useState<Set<string>>(new Set())
  const [showRewards, setShowRewards] = useState(false)
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null)

  const controls = useAnimation()
  const progressRef = useRef<NodeJS.Timeout>()
  const { features, updateFeatures } = useContext7GUI()

  useEffect(() => {
    if (autoStart && ONBOARDING_TOURS.length > 0) {
      setSelectedTour(ONBOARDING_TOURS[0])
    }
  }, [autoStart])

  useEffect(() => {
    if (selectedTour && isPlaying) {
      const step = selectedTour.steps[currentStepIndex]
      if (step) {
        progressRef.current = setTimeout(() => {
          handleNextStep()
        }, step.duration * 1000)
      }
    }

    return () => {
      if (progressRef.current) {
        clearTimeout(progressRef.current)
      }
    }
  }, [selectedTour, currentStepIndex, isPlaying])

  useEffect(() => {
    if (selectedTour) {
      const step = selectedTour.steps[currentStepIndex]
      if (step?.selector) {
        highlightElement(step.selector)
      } else {
        clearHighlight()
      }
    }

    return () => clearHighlight()
  }, [selectedTour, currentStepIndex])

  const highlightElement = (selector: string) => {
    try {
      const element = document.querySelector(selector) as HTMLElement
      if (element) {
        setHighlightedElement(element)
        element.style.position = 'relative'
        element.style.zIndex = '1000'
        element.style.boxShadow = '0 0 0 4px rgba(147, 51, 234, 0.4), 0 0 20px rgba(147, 51, 234, 0.3)'
        element.style.borderRadius = '8px'
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    } catch (error) {
      console.log('Element not found:', selector)
    }
  }

  const clearHighlight = () => {
    if (highlightedElement) {
      highlightedElement.style.boxShadow = ''
      highlightedElement.style.zIndex = ''
      setHighlightedElement(null)
    }
  }

  const startTour = (tour: OnboardingTour) => {
    setSelectedTour(tour)
    setCurrentStepIndex(0)
    setIsPlaying(true)

    // Enable advanced UI features for better onboarding experience
    updateFeatures({
      microInteractions: true,
      spatialMode: true,
      adaptiveTheme: 'premium'
    })
  }

  const handleNextStep = () => {
    if (!selectedTour) return

    const currentStep = selectedTour.steps[currentStepIndex]
    setCompletedSteps(prev => new Set([...prev, currentStep.id]))

    if (currentStepIndex < selectedTour.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    } else {
      completeTour()
    }
  }

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const completeTour = () => {
    if (!selectedTour) return

    setCompletedTours(prev => new Set([...prev, selectedTour.id]))
    setShowRewards(true)
    setIsPlaying(false)
    clearHighlight()

    if (onComplete) {
      onComplete(selectedTour.id)
    }
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const skipTour = () => {
    setSelectedTour(null)
    setIsOpen(false)
    clearHighlight()
  }

  const getCurrentProgress = () => {
    if (!selectedTour) return 0
    return ((currentStepIndex + 1) / selectedTour.steps.length) * 100
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
        size="lg"
      >
        <Lightbulb className="w-5 h-5 mr-2" />
        Take a Tour
      </Button>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
        >
          {!selectedTour ? (
            <TourSelector
              tours={ONBOARDING_TOURS}
              completedTours={completedTours}
              onSelectTour={startTour}
              onClose={() => setIsOpen(false)}
            />
          ) : showRewards ? (
            <RewardsScreen
              tour={selectedTour}
              onContinue={() => {
                setShowRewards(false)
                setSelectedTour(null)
              }}
              onClose={() => setIsOpen(false)}
            />
          ) : (
            <TourPlayer
              tour={selectedTour}
              currentStepIndex={currentStepIndex}
              isPlaying={isPlaying}
              progress={getCurrentProgress()}
              completedSteps={completedSteps}
              onNext={handleNextStep}
              onPrevious={handlePreviousStep}
              onTogglePlayPause={togglePlayPause}
              onSkip={skipEnabled ? skipTour : undefined}
              onClose={() => {
                setSelectedTour(null)
                setIsOpen(false)
                clearHighlight()
              }}
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

interface TourSelectorProps {
  tours: OnboardingTour[]
  completedTours: Set<string>
  onSelectTour: (tour: OnboardingTour) => void
  onClose: () => void
}

function TourSelector({ tours, completedTours, onSelectTour, onClose }: TourSelectorProps) {
  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Choose Your Journey</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Interactive tours to master KAZI
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {tours.map((tour) => {
          const isCompleted = completedTours.has(tour.id)
          const difficultyColor = {
            beginner: 'bg-green-100 text-green-700',
            intermediate: 'bg-yellow-100 text-yellow-700',
            advanced: 'bg-red-100 text-red-700'
          }[tour.difficulty]

          return (
            <motion.div
              key={tour.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                isCompleted
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
              }`}
              onClick={() => !isCompleted && onSelectTour(tour)}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isCompleted ? 'bg-green-500' : 'bg-gradient-to-br from-purple-600 to-blue-600'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <div className="text-white">
                      {tour.icon}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{tour.title}</h3>
                    {isCompleted && (
                      <Badge className="bg-green-500 text-white">Completed</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{tour.description}</p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {tour.estimatedTime}
                    </span>
                    <Badge className={`${difficultyColor} text-xs`}>
                      {tour.difficulty}
                    </Badge>
                    <span className="flex items-center gap-1 text-purple-600">
                      <Star className="w-3 h-3" />
                      +{tour.rewards.xp} XP
                    </span>
                  </div>
                </div>

                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </motion.div>
          )
        })}

        <div className="text-center pt-4 border-t">
          <p className="text-sm text-gray-500">
            Complete tours to unlock advanced features and earn rewards! 🎉
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

interface TourPlayerProps {
  tour: OnboardingTour
  currentStepIndex: number
  isPlaying: boolean
  progress: number
  completedSteps: Set<string>
  onNext: () => void
  onPrevious: () => void
  onTogglePlayPause: () => void
  onSkip?: () => void
  onClose: () => void
}

function TourPlayer({
  tour,
  currentStepIndex,
  isPlaying,
  progress,
  completedSteps,
  onNext,
  onPrevious,
  onTogglePlayPause,
  onSkip,
  onClose
}: TourPlayerProps) {
  const currentStep = tour.steps[currentStepIndex]

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white">
              {currentStep.icon}
            </div>
            <div>
              <CardTitle className="text-lg">{currentStep.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Step {currentStepIndex + 1} of {tour.steps.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onSkip && (
              <Button variant="ghost" size="sm" onClick={onSkip}>
                Skip Tour
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Progress value={progress} className="mt-4" />
      </CardHeader>

      <CardContent className="p-6">
        <div className="mb-6">
          {currentStep.content}
        </div>

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={currentStepIndex === 0}
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onTogglePlayPause}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>

            <Button onClick={onNext} size="sm">
              {currentStepIndex === tour.steps.length - 1 ? 'Complete' : 'Next'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface RewardsScreenProps {
  tour: OnboardingTour
  onContinue: () => void
  onClose: () => void
}

function RewardsScreen({ tour, onContinue, onClose }: RewardsScreenProps) {
  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center"
        >
          <Award className="w-10 h-10 text-white" />
        </motion.div>

        <h2 className="text-2xl font-bold mb-2">Congratulations! 🎉</h2>
        <p className="text-gray-600 mb-6">
          You've completed the <strong>{tour.title}</strong> tour
        </p>

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold">+{tour.rewards.xp} XP earned</span>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {tour.rewards.badges.map((badge) => (
              <Badge key={badge} className="bg-purple-100 text-purple-700">
                {badge}
              </Badge>
            ))}
          </div>

          <div className="text-sm text-gray-600">
            <strong>Unlocked Features:</strong>
            <div className="flex flex-wrap gap-1 justify-center mt-1">
              {tour.rewards.features.map((feature) => (
                <Badge key={feature} variant="outline">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
          <Button onClick={onContinue} className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600">
            Continue Exploring
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}