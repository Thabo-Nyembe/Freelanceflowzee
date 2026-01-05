'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type SurveyStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived'
export type SurveyType = 'feedback' | 'nps' | 'satisfaction' | 'research' | 'poll' | 'quiz' | 'assessment'
export type QuestionType = 'multiple_choice' | 'checkbox' | 'rating' | 'scale' | 'nps' | 'text' | 'textarea' | 'dropdown' | 'matrix' | 'ranking' | 'date' | 'file_upload'

export interface Survey {
  id: string
  title: string
  description?: string
  type: SurveyType
  status: SurveyStatus
  questions: SurveyQuestion[]
  settings: SurveySettings
  branding?: SurveyBranding
  targetAudience?: SurveyAudience
  responsesCount: number
  completionRate: number
  averageTime: number
  npsScore?: number
  publishedAt?: string
  closesAt?: string
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
}

export interface SurveyQuestion {
  id: string
  type: QuestionType
  text: string
  description?: string
  required: boolean
  options?: QuestionOption[]
  settings?: QuestionSettings
  logic?: QuestionLogic[]
  order: number
}

export interface QuestionOption {
  id: string
  text: string
  value: string | number
  image?: string
  isOther?: boolean
}

export interface QuestionSettings {
  minValue?: number
  maxValue?: number
  minLabel?: string
  maxLabel?: string
  rows?: { id: string; text: string }[]
  columns?: { id: string; text: string }[]
  allowMultiple?: boolean
  maxSelections?: number
  randomize?: boolean
}

export interface QuestionLogic {
  condition: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
  value: any
  action: 'skip_to' | 'show' | 'hide' | 'end_survey'
  targetQuestionId?: string
}

export interface SurveySettings {
  allowAnonymous: boolean
  requireLogin: boolean
  oneResponsePerUser: boolean
  showProgressBar: boolean
  shuffleQuestions: boolean
  showResults: boolean
  redirectUrl?: string
  maxResponses?: number
  timeLimit?: number
}

export interface SurveyBranding {
  logo?: string
  primaryColor?: string
  backgroundColor?: string
  fontFamily?: string
  customCss?: string
}

export interface SurveyAudience {
  segments?: string[]
  roles?: string[]
  departments?: string[]
  userIds?: string[]
}

export interface SurveyResponse {
  id: string
  surveyId: string
  respondentId?: string
  respondentEmail?: string
  answers: SurveyAnswer[]
  isComplete: boolean
  completionTime: number
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, any>
  startedAt: string
  completedAt?: string
}

export interface SurveyAnswer {
  questionId: string
  questionText: string
  value: any
  textValue?: string
}

export interface SurveyAnalytics {
  totalResponses: number
  completeResponses: number
  partialResponses: number
  completionRate: number
  averageCompletionTime: number
  npsScore?: number
  responsesByDay: { date: string; count: number }[]
  questionStats: QuestionStats[]
}

export interface QuestionStats {
  questionId: string
  questionText: string
  responseCount: number
  distribution: { value: string; count: number; percentage: number }[]
  average?: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockSurveys: Survey[] = [
  { id: 'survey-1', title: 'Customer Satisfaction Survey', description: 'Help us improve our services', type: 'satisfaction', status: 'active', questions: [{ id: 'q1', type: 'nps', text: 'How likely are you to recommend us?', required: true, order: 1 }, { id: 'q2', type: 'rating', text: 'Rate your overall experience', required: true, settings: { minValue: 1, maxValue: 5 }, order: 2 }, { id: 'q3', type: 'textarea', text: 'Any additional feedback?', required: false, order: 3 }], settings: { allowAnonymous: true, requireLogin: false, oneResponsePerUser: false, showProgressBar: true, shuffleQuestions: false, showResults: false }, responsesCount: 156, completionRate: 78, averageTime: 180, npsScore: 42, publishedAt: '2024-02-01', createdBy: 'user-1', createdByName: 'Alex Chen', createdAt: '2024-01-25', updatedAt: '2024-03-15' },
  { id: 'survey-2', title: 'Employee Engagement Survey', type: 'feedback', status: 'active', questions: [{ id: 'q4', type: 'scale', text: 'How satisfied are you with your work?', required: true, settings: { minValue: 1, maxValue: 10, minLabel: 'Not at all', maxLabel: 'Extremely' }, order: 1 }], settings: { allowAnonymous: true, requireLogin: true, oneResponsePerUser: true, showProgressBar: true, shuffleQuestions: false, showResults: false }, targetAudience: { roles: ['employee'] }, responsesCount: 45, completionRate: 92, averageTime: 300, publishedAt: '2024-03-01', closesAt: '2024-03-31', createdBy: 'user-2', createdByName: 'Sarah Miller', createdAt: '2024-02-28', updatedAt: '2024-03-10' },
  { id: 'survey-3', title: 'Product Feature Poll', type: 'poll', status: 'draft', questions: [{ id: 'q5', type: 'multiple_choice', text: 'Which feature would you like next?', required: true, options: [{ id: 'o1', text: 'Dark Mode', value: 'dark_mode' }, { id: 'o2', text: 'Mobile App', value: 'mobile_app' }, { id: 'o3', text: 'API Access', value: 'api' }], order: 1 }], settings: { allowAnonymous: false, requireLogin: true, oneResponsePerUser: true, showProgressBar: false, shuffleQuestions: false, showResults: true }, responsesCount: 0, completionRate: 0, averageTime: 0, createdBy: 'user-1', createdByName: 'Alex Chen', createdAt: '2024-03-18', updatedAt: '2024-03-18' }
]

const mockResponses: SurveyResponse[] = [
  { id: 'resp-1', surveyId: 'survey-1', respondentEmail: 'john@example.com', answers: [{ questionId: 'q1', questionText: 'How likely are you to recommend us?', value: 9 }, { questionId: 'q2', questionText: 'Rate your overall experience', value: 4 }], isComplete: true, completionTime: 120, startedAt: '2024-03-20T10:00:00Z', completedAt: '2024-03-20T10:02:00Z' },
  { id: 'resp-2', surveyId: 'survey-1', answers: [{ questionId: 'q1', questionText: 'How likely are you to recommend us?', value: 7 }], isComplete: false, completionTime: 45, startedAt: '2024-03-19T15:00:00Z' }
]

// ============================================================================
// HOOK
// ============================================================================

interface UseSurveysOptions {
  
  surveyId?: string
}

export function useSurveys(options: UseSurveysOptions = {}) {
  const {  surveyId } = options

  const [surveys, setSurveys] = useState<Survey[]>([])
  const [responses, setResponses] = useState<SurveyResponse[]>([])
  const [currentSurvey, setCurrentSurvey] = useState<Survey | null>(null)
  const [analytics, setAnalytics] = useState<SurveyAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchSurveys = useCallback(async (filters?: { status?: string; type?: string; search?: string }) => {
    try {
      const params = new URLSearchParams()
      if (filters?.status) params.set('status', filters.status)
      if (filters?.type) params.set('type', filters.type)
      if (filters?.search) params.set('search', filters.search)

      const response = await fetch(`/api/surveys?${params}`)
      const result = await response.json()
      if (result.success) {
        setSurveys(Array.isArray(result.surveys) ? result.surveys : [])
        return result.surveys
      }
      setSurveys([])
      return []
    } catch (err) {
      setSurveys([])
      return []
    } finally {
      setIsLoading(false)
    }
  }, [ surveyId])

  const createSurvey = useCallback(async (data: { title: string; description?: string; type: SurveyType }) => {
    try {
      const response = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success) {
        setSurveys(prev => [result.survey, ...prev])
        return { success: true, survey: result.survey }
      }
      return { success: false, error: result.error }
    } catch (err) {
      const newSurvey: Survey = {
        id: `survey-${Date.now()}`,
        title: data.title,
        description: data.description,
        type: data.type,
        status: 'draft',
        questions: [],
        settings: {
          allowAnonymous: true,
          requireLogin: false,
          oneResponsePerUser: false,
          showProgressBar: true,
          shuffleQuestions: false,
          showResults: false
        },
        responsesCount: 0,
        completionRate: 0,
        averageTime: 0,
        createdBy: 'user-1',
        createdByName: 'You',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setSurveys(prev => [newSurvey, ...prev])
      return { success: true, survey: newSurvey }
    }
  }, [])

  const updateSurvey = useCallback(async (surveyId: string, updates: Partial<Survey>) => {
    try {
      const response = await fetch(`/api/surveys/${surveyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const result = await response.json()
      if (result.success) {
        setSurveys(prev => prev.map(s => s.id === surveyId ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s))
      }
      return result
    } catch (err) {
      setSurveys(prev => prev.map(s => s.id === surveyId ? { ...s, ...updates } : s))
      return { success: true }
    }
  }, [])

  const deleteSurvey = useCallback(async (surveyId: string) => {
    try {
      await fetch(`/api/surveys/${surveyId}`, { method: 'DELETE' })
      setSurveys(prev => prev.filter(s => s.id !== surveyId))
      return { success: true }
    } catch (err) {
      setSurveys(prev => prev.filter(s => s.id !== surveyId))
      return { success: true }
    }
  }, [])

  const publishSurvey = useCallback(async (surveyId: string) => {
    return updateSurvey(surveyId, { status: 'active', publishedAt: new Date().toISOString() })
  }, [updateSurvey])

  const pauseSurvey = useCallback(async (surveyId: string) => {
    return updateSurvey(surveyId, { status: 'paused' })
  }, [updateSurvey])

  const closeSurvey = useCallback(async (surveyId: string) => {
    return updateSurvey(surveyId, { status: 'completed', closesAt: new Date().toISOString() })
  }, [updateSurvey])

  const duplicateSurvey = useCallback(async (surveyId: string) => {
    const original = surveys.find(s => s.id === surveyId)
    if (!original) return { success: false, error: 'Survey not found' }

    const duplicate: Survey = {
      ...original,
      id: `survey-${Date.now()}`,
      title: `${original.title} (Copy)`,
      status: 'draft',
      responsesCount: 0,
      completionRate: 0,
      averageTime: 0,
      npsScore: undefined,
      publishedAt: undefined,
      closesAt: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setSurveys(prev => [duplicate, ...prev])
    return { success: true, survey: duplicate }
  }, [surveys])

  const addQuestion = useCallback(async (surveyId: string, question: Omit<SurveyQuestion, 'id' | 'order'>) => {
    const survey = surveys.find(s => s.id === surveyId)
    if (!survey) return { success: false, error: 'Survey not found' }

    const newQuestion: SurveyQuestion = {
      ...question,
      id: `q-${Date.now()}`,
      order: survey.questions.length + 1
    }
    return updateSurvey(surveyId, { questions: [...survey.questions, newQuestion] })
  }, [surveys, updateSurvey])

  const updateQuestion = useCallback(async (surveyId: string, questionId: string, updates: Partial<SurveyQuestion>) => {
    const survey = surveys.find(s => s.id === surveyId)
    if (!survey) return { success: false, error: 'Survey not found' }

    const updatedQuestions = survey.questions.map(q => q.id === questionId ? { ...q, ...updates } : q)
    return updateSurvey(surveyId, { questions: updatedQuestions })
  }, [surveys, updateSurvey])

  const removeQuestion = useCallback(async (surveyId: string, questionId: string) => {
    const survey = surveys.find(s => s.id === surveyId)
    if (!survey) return { success: false, error: 'Survey not found' }

    const updatedQuestions = survey.questions.filter(q => q.id !== questionId).map((q, i) => ({ ...q, order: i + 1 }))
    return updateSurvey(surveyId, { questions: updatedQuestions })
  }, [surveys, updateSurvey])

  const reorderQuestions = useCallback(async (surveyId: string, questionIds: string[]) => {
    const survey = surveys.find(s => s.id === surveyId)
    if (!survey) return { success: false, error: 'Survey not found' }

    const reordered = questionIds.map((id, index) => {
      const question = survey.questions.find(q => q.id === id)
      return question ? { ...question, order: index + 1 } : null
    }).filter(Boolean) as SurveyQuestion[]

    return updateSurvey(surveyId, { questions: reordered })
  }, [surveys, updateSurvey])

  const submitResponse = useCallback(async (surveyId: string, answers: SurveyAnswer[]) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/surveys/${surveyId}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      })
      const result = await response.json()
      if (result.success) {
        setSurveys(prev => prev.map(s => s.id === surveyId ? { ...s, responsesCount: s.responsesCount + 1 } : s))
        return { success: true, response: result.response }
      }
      return { success: false, error: result.error }
    } catch (err) {
      const newResponse: SurveyResponse = {
        id: `resp-${Date.now()}`,
        surveyId,
        answers,
        isComplete: true,
        completionTime: 0,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      }
      setResponses(prev => [newResponse, ...prev])
      return { success: true, response: newResponse }
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const fetchResponses = useCallback(async (surveyId: string) => {
    try {
      const response = await fetch(`/api/surveys/${surveyId}/responses`)
      const result = await response.json()
      if (result.success) {
        setResponses(result.responses || [])
        return result.responses
      }
      return []
    } catch (err) {
      const filtered = mockResponses.filter(r => r.surveyId === surveyId)
      setResponses(filtered)
      return filtered
    }
  }, [])

  const fetchAnalytics = useCallback(async (surveyId: string): Promise<SurveyAnalytics | null> => {
    try {
      const response = await fetch(`/api/surveys/${surveyId}/analytics`)
      const result = await response.json()
      if (result.success) {
        setAnalytics(result.analytics)
        return result.analytics
      }
      return null
    } catch (err) {
      return null
    }
  }, [])

  const exportResponses = useCallback(async (surveyId: string, format: 'csv' | 'xlsx' | 'json' = 'csv') => {
    const surveyResponses = responses.filter(r => r.surveyId === surveyId)
    const data = JSON.stringify(surveyResponses, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `responses-${surveyId}.${format}`
    a.click()
    return { success: true }
  }, [responses])

  const calculateNPS = useCallback((responses: SurveyResponse[], questionId: string): number => {
    const npsAnswers = responses.filter(r => r.answers.some(a => a.questionId === questionId))
      .map(r => r.answers.find(a => a.questionId === questionId)?.value as number)
      .filter(v => typeof v === 'number')

    if (npsAnswers.length === 0) return 0

    const promoters = npsAnswers.filter(v => v >= 9).length
    const detractors = npsAnswers.filter(v => v <= 6).length

    return Math.round(((promoters - detractors) / npsAnswers.length) * 100)
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchSurveys()
  }, [fetchSurveys])

  useEffect(() => { refresh() }, [refresh])

  const activeSurveys = useMemo(() => surveys.filter(s => s.status === 'active'), [surveys])
  const draftSurveys = useMemo(() => surveys.filter(s => s.status === 'draft'), [surveys])
  const completedSurveys = useMemo(() => surveys.filter(s => s.status === 'completed'), [surveys])
  const surveyTypes: SurveyType[] = ['feedback', 'nps', 'satisfaction', 'research', 'poll', 'quiz', 'assessment']
  const questionTypes: QuestionType[] = ['multiple_choice', 'checkbox', 'rating', 'scale', 'nps', 'text', 'textarea', 'dropdown', 'matrix', 'ranking', 'date', 'file_upload']

  return {
    surveys, responses, currentSurvey, analytics, activeSurveys, draftSurveys, completedSurveys, surveyTypes, questionTypes,
    isLoading, isSubmitting, error,
    refresh, fetchSurveys, createSurvey, updateSurvey, deleteSurvey, publishSurvey, pauseSurvey, closeSurvey, duplicateSurvey,
    addQuestion, updateQuestion, removeQuestion, reorderQuestions, submitResponse, fetchResponses, fetchAnalytics, exportResponses, calculateNPS,
    setCurrentSurvey
  }
}

export default useSurveys
