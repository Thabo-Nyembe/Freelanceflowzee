'use client'

import { useState, useEffect } from 'react'
import { X, ChevronRight, ChevronLeft, Check, Trophy, Zap, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('ClientOnboarding')

interface TourStep {
  id: string
  title: string
  description: string
  target: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  action?: string
  highlight?: boolean
}

interface ClientTour {
  id: string
  title: string
  description: string
  duration: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: 'intro' | 'features' | 'advanced' | 'completion'
  steps: TourStep[]
  rewards: {
    xp: number
    badge?: string
    unlocks?: string[]
  }
}

const clientTours: ClientTour[] = [
  {
    id: 'client-welcome',
    title: 'Welcome to Your KAZI Client Portal',
    description: 'Learn how to manage your projects, track progress, and collaborate with your team',
    duration: '6 min',
    difficulty: 'beginner',
    category: 'intro',
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to KAZI! 👋',
        description: 'Your all-in-one platform for managing creative projects. Let\'s take a quick tour of your client portal.',
        target: '#client-dashboard',
        position: 'bottom'
      },
      {
        id: 'dashboard-overview',
        title: 'Your Dashboard',
        description: 'This is your command center. See all your active projects, upcoming milestones, and key metrics at a glance.',
        target: '#client-dashboard',
        position: 'bottom',
        highlight: true
      },
      {
        id: 'active-projects',
        title: 'Active Projects',
        description: 'View all your ongoing projects here. Each project shows real-time progress, next milestones, and team members.',
        target: '#projects-tab',
        position: 'bottom',
        action: 'Click to view your projects',
        highlight: true
      },
      {
        id: 'progress-tracker',
        title: 'Track Progress & Milestones',
        description: 'Monitor every phase of your project. See completed milestones, current status, and upcoming deliverables.',
        target: '#progress-tracker',
        position: 'left',
        highlight: true
      },
      {
        id: 'approval-system',
        title: 'Approve Deliverables',
        description: 'Review and approve deliverables with one click. Request revisions or provide feedback directly in the platform.',
        target: '#approval-system',
        position: 'left',
        highlight: true
      },
      {
        id: 'escrow-protection',
        title: 'Secure Payment & Escrow',
        description: 'Your payments are protected with escrow. Funds are only released when you approve deliverables. 100% money-back guarantee.',
        target: '#escrow-tab',
        position: 'top',
        highlight: true
      },
      {
        id: 'messaging',
        title: 'Message Your Team',
        description: 'Real-time communication with your project team. Get instant updates and ask questions anytime.',
        target: '#messages-tab',
        position: 'top',
        highlight: true
      },
      {
        id: 'analytics',
        title: 'View Analytics & ROI',
        description: 'Track your investment value, time savings, and project performance metrics. See the real ROI of your projects.',
        target: '#analytics-tab',
        position: 'top',
        highlight: true
      },
      {
        id: 'completion',
        title: 'You\'re All Set! 🎉',
        description: 'Congratulations! You now know how to navigate your client portal. Start by exploring your first project.',
        target: '#client-dashboard',
        position: 'bottom'
      }
    ],
    rewards: {
      xp: 100,
      badge: 'Portal Explorer',
      unlocks: ['Advanced Analytics', 'Priority Support Chat']
    }
  },
  {
    id: 'client-collaboration',
    title: 'Collaborate with Your Team',
    description: 'Master the collaboration tools to work seamlessly with your creative team',
    duration: '5 min',
    difficulty: 'beginner',
    category: 'features',
    steps: [
      {
        id: 'collaboration-intro',
        title: 'Collaboration Made Easy',
        description: 'KAZI makes it simple to work with your team. Let\'s explore the collaboration features.',
        target: '#collaboration-section',
        position: 'bottom'
      },
      {
        id: 'real-time-chat',
        title: 'Real-time Messaging',
        description: 'Chat instantly with your team members. All conversations are organized by project for easy reference.',
        target: '#chat-interface',
        position: 'right',
        highlight: true
      },
      {
        id: 'file-sharing',
        title: 'File Sharing',
        description: 'Upload files, share documents, and organize all project assets in one place. Supports all file types.',
        target: '#file-upload',
        position: 'left',
        highlight: true
      },
      {
        id: 'revision-requests',
        title: 'Request Revisions',
        description: 'Need changes? Request revisions with detailed feedback. Track all revision rounds in one place.',
        target: '#revision-button',
        position: 'top',
        highlight: true
      },
      {
        id: 'ai-collaboration',
        title: 'AI Design Options',
        description: 'Get AI-generated design alternatives and creative suggestions. Share your preferences with the team.',
        target: '#ai-collaboration',
        position: 'top',
        highlight: true
      },
      {
        id: 'collaboration-complete',
        title: 'Collaboration Mastery! 🤝',
        description: 'You\'re now ready to collaborate effectively with your team. Start a conversation or share a file!',
        target: '#collaboration-section',
        position: 'bottom'
      }
    ],
    rewards: {
      xp: 75,
      badge: 'Team Player',
      unlocks: ['AI Design Assistant']
    }
  },
  {
    id: 'client-financial',
    title: 'Manage Payments & Invoices',
    description: 'Understand how payments, invoices, and escrow protection work',
    duration: '4 min',
    difficulty: 'beginner',
    category: 'features',
    steps: [
      {
        id: 'financial-intro',
        title: 'Financial Management',
        description: 'Keep track of all your payments, invoices, and financial transactions in one secure place.',
        target: '#financial-section',
        position: 'bottom'
      },
      {
        id: 'invoices',
        title: 'View & Pay Invoices',
        description: 'All your invoices are here. View details, download PDFs, and make payments securely.',
        target: '#invoices-list',
        position: 'right',
        highlight: true
      },
      {
        id: 'escrow-explained',
        title: 'Escrow Protection',
        description: 'Your payments are held in escrow until you approve deliverables. This protects your investment.',
        target: '#escrow-info',
        position: 'left',
        highlight: true
      },
      {
        id: 'payment-methods',
        title: 'Payment Methods',
        description: 'Add credit cards, bank accounts, or use other payment methods. All transactions are encrypted.',
        target: '#payment-methods',
        position: 'top',
        highlight: true
      },
      {
        id: 'payment-history',
        title: 'Payment History',
        description: 'View all past transactions, download receipts, and export financial reports for your records.',
        target: '#payment-history',
        position: 'top',
        highlight: true
      },
      {
        id: 'financial-complete',
        title: 'Financial Security! 💰',
        description: 'You now understand how to manage payments securely. Your money is always protected.',
        target: '#financial-section',
        position: 'bottom'
      }
    ],
    rewards: {
      xp: 60,
      badge: 'Financial Guardian',
      unlocks: ['Auto-pay Feature', 'Custom Payment Terms']
    }
  },
  {
    id: 'client-analytics',
    title: 'Understand Your ROI',
    description: 'Learn how to track value, measure success, and optimize your investment',
    duration: '5 min',
    difficulty: 'intermediate',
    category: 'advanced',
    steps: [
      {
        id: 'analytics-intro',
        title: 'Analytics & Insights',
        description: 'Discover how to measure the value you\'re getting from your projects and creative investments.',
        target: '#analytics-dashboard',
        position: 'bottom'
      },
      {
        id: 'roi-calculator',
        title: 'ROI Calculator',
        description: 'See your return on investment. Compare what you spent vs. the value of deliverables you received.',
        target: '#roi-calculator',
        position: 'right',
        highlight: true
      },
      {
        id: 'time-savings',
        title: 'Time Savings Metrics',
        description: 'Track how much time you\'ve saved vs. doing projects in-house or with other providers.',
        target: '#time-savings',
        position: 'left',
        highlight: true
      },
      {
        id: 'quality-metrics',
        title: 'Quality Metrics',
        description: 'View your first-time approval rate, revision counts, and overall satisfaction scores.',
        target: '#quality-metrics',
        position: 'top',
        highlight: true
      },
      {
        id: 'benchmarking',
        title: 'Industry Benchmarking',
        description: 'Compare your project performance against industry averages and best practices.',
        target: '#benchmarking',
        position: 'top',
        highlight: true
      },
      {
        id: 'custom-reports',
        title: 'Custom Reports',
        description: 'Create custom reports, schedule automatic delivery, and export data for presentations.',
        target: '#custom-reports',
        position: 'left',
        highlight: true
      },
      {
        id: 'analytics-complete',
        title: 'Analytics Expert! 📊',
        description: 'You\'re now equipped to track and demonstrate the value of your creative investments.',
        target: '#analytics-dashboard',
        position: 'bottom'
      }
    ],
    rewards: {
      xp: 100,
      badge: 'Data-Driven Client',
      unlocks: ['Advanced Analytics Dashboard', 'Executive Reports']
    }
  }
]

interface ClientOnboardingTourProps {
  userRole?: 'client' | 'freelancer' | 'admin'
  clientId?: string
  onComplete?: (tourId: string) => void
}

export function ClientOnboardingTour({
  userRole = 'client',
  clientId,
  onComplete
}: ClientOnboardingTourProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTour, setSelectedTour] = useState<ClientTour | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedTours, setCompletedTours] = useState<string[]>([])
  const [totalXP, setTotalXP] = useState(0)
  const [badges, setBadges] = useState<string[]>([])

  useEffect(() => {
    // Auto-show welcome tour for new clients
    const hasSeenWelcome = localStorage.getItem('client_welcome_tour_completed')
    if (!hasSeenWelcome && userRole === 'client') {
      setTimeout(() => {
        startTour('client-welcome')
      }, 1000)
    }

    // Load progress from localStorage
    const savedProgress = localStorage.getItem('client_onboarding_progress')
    if (savedProgress) {
      const progress = JSON.parse(savedProgress)
      setCompletedTours(progress.completedTours || [])
      setTotalXP(progress.totalXP || 0)
      setBadges(progress.badges || [])
    }
  }, [userRole])

  const startTour = (tourId: string) => {
    const tour = clientTours.find(t => t.id === tourId)
    if (!tour) return

    logger.info('Starting client onboarding tour', {
      tourId,
      tourTitle: tour.title,
      clientId,
      userRole
    })

    setSelectedTour(tour)
    setCurrentStepIndex(0)
    setIsOpen(true)
  }

  const handleNext = () => {
    if (!selectedTour) return

    if (currentStepIndex < selectedTour.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1)
      logger.debug('Advanced to next tour step', {
        tourId: selectedTour.id,
        stepIndex: currentStepIndex + 1,
        stepTitle: selectedTour.steps[currentStepIndex + 1].title
      })
    } else {
      completeTour()
    }
  }

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
    }
  }

  const completeTour = () => {
    if (!selectedTour) return

    // Add rewards
    const newXP = totalXP + selectedTour.rewards.xp
    const newBadges = selectedTour.rewards.badge
      ? [...badges, selectedTour.rewards.badge]
      : badges
    const newCompletedTours = [...completedTours, selectedTour.id]

    setTotalXP(newXP)
    setBadges(newBadges)
    setCompletedTours(newCompletedTours)

    // Save progress
    const progress = {
      completedTours: newCompletedTours,
      totalXP: newXP,
      badges: newBadges
    }
    localStorage.setItem('client_onboarding_progress', JSON.stringify(progress))
    localStorage.setItem(`${selectedTour.id}_completed`, 'true')

    logger.info('Client onboarding tour completed', {
      tourId: selectedTour.id,
      tourTitle: selectedTour.title,
      xpEarned: selectedTour.rewards.xp,
      badgeEarned: selectedTour.rewards.badge,
      totalXP: newXP,
      clientId
    })

    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })

    // Call completion callback
    if (onComplete) {
      onComplete(selectedTour.id)
    }

    // Close tour
    setTimeout(() => {
      setIsOpen(false)
      setSelectedTour(null)
      setCurrentStepIndex(0)
    }, 3000)
  }

  const skipTour = () => {
    if (!selectedTour) return

    logger.info('Client onboarding tour skipped', {
      tourId: selectedTour.id,
      stepIndex: currentStepIndex,
      clientId
    })

    setIsOpen(false)
    setSelectedTour(null)
    setCurrentStepIndex(0)
  }

  const currentStep = selectedTour?.steps[currentStepIndex]
  const progress = selectedTour
    ? ((currentStepIndex + 1) / selectedTour.steps.length) * 100
    : 0

  const availableTours = clientTours.filter(
    tour => !completedTours.includes(tour.id)
  )

  return (
    <>
      {/* Tour Trigger Button */}
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="fixed bottom-6 right-6 z-40 shadow-lg"
      >
        <Zap className="mr-2 h-4 w-4" />
        Start Tutorial
      </Button>

      {/* Tour Selection Modal */}
      <AnimatePresence>
        {isOpen && !selectedTour && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl mx-4 bg-background rounded-lg shadow-2xl border"
            >
              {/* Header */}
              <div className="p-6 border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Client Portal Tours</h2>
                    <p className="text-muted-foreground mt-1">
                      Learn how to maximize your KAZI experience
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Progress Stats */}
                <div className="flex items-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <span className="font-semibold">{totalXP} XP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="font-semibold">
                      {completedTours.length}/{clientTours.length} Tours
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-500" />
                    <span className="font-semibold">{badges.length} Badges</span>
                  </div>
                </div>
              </div>

              {/* Tour List */}
              <div className="p-6 max-h-[600px] overflow-y-auto">
                <div className="grid gap-4">
                  {clientTours.map(tour => {
                    const isCompleted = completedTours.includes(tour.id)

                    return (
                      <div
                        key={tour.id}
                        className={`p-4 border rounded-lg ${
                          isCompleted
                            ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                            : 'bg-card hover:bg-accent cursor-pointer'
                        }`}
                        onClick={() => !isCompleted && startTour(tour.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-lg">
                                {tour.title}
                              </h3>
                              {isCompleted && (
                                <Check className="h-5 w-5 text-green-500" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {tour.description}
                            </p>

                            <div className="flex items-center gap-4 mt-3">
                              <div className="flex items-center gap-1 text-xs">
                                <Clock className="h-3 w-3" />
                                {tour.duration}
                              </div>
                              <span className="text-xs px-2 py-1 bg-primary/10 rounded">
                                {tour.difficulty}
                              </span>
                              <span className="text-xs px-2 py-1 bg-secondary rounded">
                                {tour.steps.length} steps
                              </span>
                            </div>

                            {/* Rewards */}
                            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Trophy className="h-3 w-3" />
                                +{tour.rewards.xp} XP
                              </span>
                              {tour.rewards.badge && (
                                <span>🏅 {tour.rewards.badge}</span>
                              )}
                            </div>
                          </div>

                          {!isCompleted && (
                            <Button
                              onClick={() => startTour(tour.id)}
                              className="ml-4"
                            >
                              Start Tour
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Tour Overlay */}
      <AnimatePresence>
        {isOpen && selectedTour && currentStep && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              onClick={skipTour}
            />

            {/* Tour Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg mx-4 bg-background rounded-lg shadow-2xl border"
            >
              {/* Progress Bar */}
              <Progress value={progress} className="h-1 rounded-none" />

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">
                      Step {currentStepIndex + 1} of {selectedTour.steps.length}
                    </p>
                    <h3 className="text-xl font-bold mt-1">{currentStep.title}</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={skipTour}
                    className="text-muted-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <p className="text-muted-foreground">{currentStep.description}</p>

                {currentStep.action && (
                  <div className="mt-4 p-3 bg-primary/10 rounded-md">
                    <p className="text-sm font-medium text-primary">
                      {currentStep.action}
                    </p>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStepIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  <Button onClick={handleNext}>
                    {currentStepIndex === selectedTour.steps.length - 1 ? (
                      <>
                        Complete
                        <Check className="h-4 w-4 ml-1" />
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
