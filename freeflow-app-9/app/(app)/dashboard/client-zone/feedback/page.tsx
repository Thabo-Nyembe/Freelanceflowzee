'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Star,
  Send,
  MessageSquare,
  Calendar,
  CheckCircle,
  Globe,
  Lock,
  Zap
} from 'lucide-react'
import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createSimpleLogger } from '@/lib/simple-logger'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { KAZI_CLIENT_DATA } from '@/lib/client-zone-utils'

const logger = createSimpleLogger('ClientFeedback')

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface FeedbackSubmission {
  id: number
  date: string
  overallRating: number
  communicationRating: number
  qualityRating: number
  timelinessRating: number
  professionalismRating: number
  feedback: string
  isPublic: boolean
  response?: string
  respondedBy?: string
  respondedDate?: string
}

// ============================================================================
// FEEDBACK COMPONENT
// ============================================================================

export default function FeedbackPage() {
  // A+++ UTILITIES
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // FORM STATE
  const [overallRating, setOverallRating] = useState(5)
  const [communicationRating, setCommunicationRating] = useState(5)
  const [qualityRating, setQualityRating] = useState(5)
  const [timelinessRating, setTimelinessRating] = useState(4)
  const [professionalismRating, setProfessionalismRating] = useState(5)
  const [feedbackText, setFeedbackText] = useState('')
  const [isPublic, setIsPublic] = useState(true)

  // FEEDBACK HISTORY
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackSubmission[]>([])

  // A+++ LOAD FEEDBACK DATA
  useEffect(() => {
    const loadFeedbackData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Initialize feedback history
        const history: FeedbackSubmission[] = [
          {
            id: 1,
            date: '2024-01-25',
            overallRating: 5,
            communicationRating: 5,
            qualityRating: 5,
            timelinessRating: 4,
            professionalismRating: 5,
            feedback: 'Excellent work on the brand identity redesign. The team was responsive and delivered high-quality designs that exceeded our expectations.',
            isPublic: true,
            response: 'Thank you for the wonderful feedback! We\'re thrilled that you\'re happy with the results. Looking forward to working on more projects together.',
            respondedBy: 'Sarah Johnson',
            respondedDate: '2024-01-26'
          },
          {
            id: 2,
            date: '2024-01-15',
            overallRating: 4,
            communicationRating: 4,
            qualityRating: 5,
            timelinessRating: 3,
            professionalismRating: 4,
            feedback: 'Great quality deliverables. Could improve on timeline adherence - the final version was slightly delayed but the quality made up for it.',
            isPublic: true,
            response: 'We appreciate your feedback. We\'ve reviewed our timeline management and have implemented new processes to prevent delays in future projects.',
            respondedBy: 'Michael Chen',
            respondedDate: '2024-01-16'
          },
          {
            id: 3,
            date: '2024-01-05',
            overallRating: 5,
            communicationRating: 5,
            qualityRating: 5,
            timelinessRating: 5,
            professionalismRating: 5,
            feedback: 'Outstanding service from start to finish. The team was professional, communicative, and delivered exactly what we needed. Highly recommend!',
            isPublic: true,
            response: 'Thank you so much! Your support means everything to us. We\'re excited to discuss future projects that might benefit your business.',
            respondedBy: 'John Smith',
            respondedDate: '2024-01-06'
          }
        ]

        setFeedbackHistory(history)

        // Load feedback from API
        const response = await fetch('/api/client-zone/feedback')
        if (!response.ok) throw new Error('Failed to load feedback')

        setIsLoading(false)
        announce('Feedback system loaded successfully', 'polite')
        logger.info('Feedback data loaded', {
          clientName: KAZI_CLIENT_DATA.clientInfo.name,
          feedbackCount: history.length
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load feedback')
        setIsLoading(false)
        announce('Error loading feedback', 'assertive')
        logger.error('Failed to load feedback data', { error: err })
      }
    }

    loadFeedbackData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================================
  // HANDLER 1: SUBMIT FEEDBACK
  // ============================================================================

  const handleSubmitFeedback = async () => {
    try {
      if (!feedbackText.trim()) {
        toast.error('Please enter your feedback')
        return
      }

      setIsSubmitting(true)

      logger.info('Feedback submission initiated', {
        clientName: KAZI_CLIENT_DATA.clientInfo.name,
        overallRating,
        communicationRating,
        qualityRating,
        timelinessRating,
        professionalismRating,
        isPublic
      })

      const response = await fetch('/api/collaboration/client-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: KAZI_CLIENT_DATA.clientInfo.name,
          overallRating,
          communicationRating,
          qualityRating,
          timelinessRating,
          professionalismRating,
          feedback: feedbackText,
          isPublic,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }

      const result = await response.json()

      if (result.success) {
        logger.info('Feedback submitted successfully', {
          clientName: KAZI_CLIENT_DATA.clientInfo.name
        })

        // Add to history
        const newFeedback: FeedbackSubmission = {
          id: feedbackHistory.length + 1,
          date: new Date().toISOString().split('T')[0],
          overallRating,
          communicationRating,
          qualityRating,
          timelinessRating,
          professionalismRating,
          feedback: feedbackText,
          isPublic
        }

        setFeedbackHistory([newFeedback, ...feedbackHistory])

        // Reset form
        setFeedbackText('')
        setOverallRating(5)
        setCommunicationRating(5)
        setQualityRating(5)
        setTimelinessRating(4)
        setProfessionalismRating(5)

        toast.success('Feedback submitted successfully!', {
          description: 'Thank you for your valuable input'
        })
      }
    } catch (error) {
      logger.error('Failed to submit feedback', { error })
      toast.error('Failed to submit feedback', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // ============================================================================
  // HANDLER 2: TOGGLE FEEDBACK VISIBILITY
  // ============================================================================

  const handleToggleVisibility = async (feedbackId: number) => {
    try {
      const feedback = feedbackHistory.find(f => f.id === feedbackId)

      logger.info('Feedback visibility toggle initiated', {
        feedbackId,
        currentVisibility: feedback?.isPublic
      })

      const response = await fetch('/api/collaboration/toggle-feedback-visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackId,
          isPublic: !feedback?.isPublic,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update visibility')
      }

      const result = await response.json()

      if (result.success) {
        setFeedbackHistory(feedbackHistory.map(f =>
          f.id === feedbackId ? { ...f, isPublic: !f.isPublic } : f
        ))

        logger.info('Feedback visibility updated', { feedbackId })

        toast.success('Visibility updated!', {
          description: feedback?.isPublic ? 'Feedback is now private' : 'Feedback is now public'
        })
      }
    } catch (error) {
      logger.error('Failed to update visibility', { error, feedbackId })
      toast.error('Failed to update visibility', {
        description: error.message
      })
    }
  }

  // ============================================================================
  // STAR RATING COMPONENT
  // ============================================================================

  const StarRating = ({
    rating,
    onRatingChange,
    label
  }: {
    rating: number
    onRatingChange: (rating: number) => void
    label: string
  }) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900">{label}</label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => onRatingChange(star)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={`h-6 w-6 ${
                  star <= rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm font-medium text-gray-600">{rating}.0/5.0</span>
        </div>
      </div>
    )
  }

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (error) {
    return (
      <ErrorEmptyState
        error={error}
        onRetry={() => window.location.reload()}
      />
    )
  }

  // ============================================================================
  // CALCULATE AVERAGE RATINGS
  // ============================================================================

  const avgOverall = feedbackHistory.length > 0
    ? (feedbackHistory.reduce((sum, f) => sum + f.overallRating, 0) / feedbackHistory.length).toFixed(1)
    : '5.0'

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
            <Star className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Project Feedback</h1>
            <p className="text-gray-600 mt-1">Share your experience and help us improve our services</p>
          </div>
        </div>
      </motion.div>

      {/* Feedback Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Your Overall Experience</h3>
                <p className="text-sm text-gray-600">Based on {feedbackHistory.length} feedback submission{feedbackHistory.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-500">{avgOverall}</div>
                <div className="flex gap-1 mt-1 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(parseFloat(avgOverall))
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-1">Excellent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Feedback Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Submit New Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Rating Sections */}
            <div className="space-y-6">
              <StarRating
                rating={overallRating}
                onRatingChange={setOverallRating}
                label="Overall Satisfaction"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StarRating
                  rating={communicationRating}
                  onRatingChange={setCommunicationRating}
                  label="Communication Quality"
                />
                <StarRating
                  rating={qualityRating}
                  onRatingChange={setQualityRating}
                  label="Quality of Work"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StarRating
                  rating={timelinessRating}
                  onRatingChange={setTimelinessRating}
                  label="Timeline Adherence"
                />
                <StarRating
                  rating={professionalismRating}
                  onRatingChange={setProfessionalismRating}
                  label="Professionalism"
                />
              </div>
            </div>

            {/* Feedback Textarea */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900">Your Feedback</label>
              <Textarea
                placeholder="Share your thoughts about the project, team, deliverables, or any suggestions for improvement..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="min-h-[150px]"
              />
              <p className="text-xs text-gray-600">
                You've typed {feedbackText.length} characters
              </p>
            </div>

            {/* Visibility Toggle */}
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    {isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    {isPublic ? 'Public Feedback' : 'Private Feedback'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {isPublic
                      ? 'Your feedback will be visible on the public testimonials'
                      : 'Your feedback will only be shared with the management team'
                    }
                  </p>
                </div>
                <Button
                  variant={isPublic ? 'default' : 'outline'}
                  onClick={() => setIsPublic(!isPublic)}
                >
                  {isPublic ? 'Make Private' : 'Make Public'}
                </Button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              onClick={handleSubmitFeedback}
              disabled={isSubmitting || !feedbackText.trim()}
              data-testid="submit-feedback-btn"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Feedback History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Previous Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {feedbackHistory.map((feedback) => (
              <motion.div
                key={feedback.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 rounded-lg border border-gray-200 space-y-3 hover:shadow-md transition-shadow"
              >
                {/* Feedback Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-gray-900">{new Date(feedback.date).toLocaleDateString()}</p>
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= feedback.overallRating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {feedback.overallRating === 5 ? 'Excellent' : feedback.overallRating === 4 ? 'Very Good' : 'Good'}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleVisibility(feedback.id)}
                    >
                      {feedback.isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Ratings Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="text-gray-600">Communication</p>
                    <p className="font-semibold">{feedback.communicationRating}/5</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="text-gray-600">Quality</p>
                    <p className="font-semibold">{feedback.qualityRating}/5</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="text-gray-600">Timeliness</p>
                    <p className="font-semibold">{feedback.timelinessRating}/5</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="text-gray-600">Professionalism</p>
                    <p className="font-semibold">{feedback.professionalismRating}/5</p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded">
                    <p className="text-blue-600 font-semibold">Overall</p>
                    <p className="font-bold">{feedback.overallRating}/5</p>
                  </div>
                </div>

                {/* Feedback Text */}
                <p className="text-gray-700 text-sm">{feedback.feedback}</p>

                {/* Response */}
                {feedback.response && (
                  <div className="border-t pt-3 mt-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-500 text-white text-xs">
                          {feedback.respondedBy?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">{feedback.respondedBy}</p>
                          <Badge variant="outline" className="text-xs">Team Response</Badge>
                          <span className="text-xs text-gray-500">{new Date(feedback.respondedDate!).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{feedback.response}</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Feedback Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Do's
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>Be specific about your experience</li>
                  <li>Highlight what worked well</li>
                  <li>Suggest constructive improvements</li>
                  <li>Rate each category fairly</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  Tips for Better Feedback
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>Be honest but respectful</li>
                  <li>Focus on the service and results</li>
                  <li>Include examples when possible</li>
                  <li>Share feedback within 7 days</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
