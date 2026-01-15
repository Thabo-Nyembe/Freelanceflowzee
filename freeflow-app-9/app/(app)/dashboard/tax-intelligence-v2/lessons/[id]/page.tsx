'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, CheckCircle2, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface Quiz {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface Section {
  id: number
  title: string
  content: string
  quiz?: Quiz
}

interface Lesson {
  id: string
  title: string
  duration: string
  description: string
  category: string
  sections: Section[]
}

export default function LessonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const lessonId = params.id as string

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [completedSections, setCompletedSections] = useState<number[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    fetchLesson()
    fetchProgress()
  }, [lessonId])

  const fetchLesson = async () => {
    try {
      const response = await fetch(`/api/tax/education/lessons/${lessonId}`)
      if (!response.ok) throw new Error('Failed to fetch lesson')

      const data = await response.json()
      setLesson(data.data)
    } catch (error) {
      console.error('Error fetching lesson:', error)
      toast.error('Failed to load lesson')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/tax/education/progress')
      if (!response.ok) return

      const data = await response.json()
      const lessonProgress = data.data.find((p: any) => p.lesson_id === lessonId)

      if (lessonProgress) {
        setCompletedSections(lessonProgress.completed_sections || [])
        setCurrentSectionIndex(lessonProgress.section_id || 0)
      }
    } catch (error) {
      console.error('Error fetching progress:', error)
    }
  }

  const saveProgress = async (sectionId: number, quizScore?: number, completed?: boolean) => {
    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000)

      const response = await fetch('/api/tax/education/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lesson_id: lessonId,
          section_id: sectionId,
          completed_sections: completedSections,
          quiz_score: quizScore,
          time_spent: timeSpent,
          is_completed: completed
        })
      })

      if (!response.ok) throw new Error('Failed to save progress')
    } catch (error) {
      console.error('Error saving progress:', error)
    }
  }

  const handleQuizSubmit = () => {
    if (selectedAnswer === null) {
      toast.error('Please select an answer')
      return
    }

    const currentSection = lesson?.sections[currentSectionIndex]
    if (!currentSection?.quiz) return

    const isCorrect = selectedAnswer === currentSection.quiz.correctAnswer
    setQuizSubmitted(true)

    if (isCorrect) {
      toast.success('Correct!', {
        description: currentSection.quiz.explanation
      })

      // Mark section as completed
      const newCompletedSections = [...completedSections, currentSection.id]
      setCompletedSections(newCompletedSections)

      // Save progress
      saveProgress(currentSection.id, 100, false)
    } else {
      toast.error('Incorrect', {
        description: currentSection.quiz.explanation
      })
      saveProgress(currentSection.id, 0, false)
    }
  }

  const handleNextSection = () => {
    if (!lesson) return

    setQuizSubmitted(false)
    setSelectedAnswer(null)

    if (currentSectionIndex < lesson.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1)
    } else {
      // Lesson completed
      toast.success('Lesson completed!', {
        description: 'You\'ve finished all sections'
      })
      saveProgress(currentSectionIndex, undefined, true)
      router.push('/dashboard/tax-intelligence-v2')
    }
  }

  const progressPercentage = lesson
    ? (completedSections.length / lesson.sections.length) * 100
    : 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading lesson...</p>
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Lesson not found</h2>
          <Button onClick={() => router.push('/dashboard/tax-intelligence-v2')}>
            Back to Tax Intelligence
          </Button>
        </div>
      </div>
    )
  }

  const currentSection = lesson.sections[currentSectionIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/tax-intelligence-v2')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tax Intelligence
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
              <p className="text-muted-foreground mb-4">{lesson.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {lesson.duration}
                </div>
                <div className="capitalize">{lesson.category} level</div>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Section {currentSectionIndex + 1} of {lesson.sections.length}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progressPercentage)}% complete
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>

        {/* Section Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentSection.title}
              {completedSections.includes(currentSection.id) && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              {currentSection.content.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quiz */}
        {currentSection.quiz && (
          <Card>
            <CardHeader>
              <CardTitle>Check Your Understanding</CardTitle>
              <CardDescription>{currentSection.quiz.question}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentSection.quiz.options.map((option, idx) => {
                  const isSelected = selectedAnswer === idx
                  const isCorrect = idx === currentSection.quiz!.correctAnswer
                  const showResult = quizSubmitted

                  return (
                    <button
                      key={idx}
                      onClick={() => !quizSubmitted && setSelectedAnswer(idx)}
                      disabled={quizSubmitted}
                      className={`
                        w-full text-left p-4 rounded-lg border-2 transition-all
                        ${isSelected && !showResult ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700'}
                        ${showResult && isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}
                        ${showResult && isSelected && !isCorrect ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}
                        ${!quizSubmitted ? 'hover:border-primary/50 cursor-pointer' : 'cursor-not-allowed'}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        {showResult && isCorrect && (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              {quizSubmitted && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm font-medium mb-1">Explanation:</p>
                  <p className="text-sm text-muted-foreground">
                    {currentSection.quiz.explanation}
                  </p>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                {!quizSubmitted ? (
                  <Button onClick={handleQuizSubmit} className="flex-1">
                    Submit Answer
                  </Button>
                ) : (
                  <Button onClick={handleNextSection} className="flex-1">
                    {currentSectionIndex < lesson.sections.length - 1
                      ? 'Next Section'
                      : 'Complete Lesson'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No quiz - just next button */}
        {!currentSection.quiz && (
          <div className="flex justify-end">
            <Button onClick={handleNextSection}>
              {currentSectionIndex < lesson.sections.length - 1
                ? 'Next Section'
                : 'Complete Lesson'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
