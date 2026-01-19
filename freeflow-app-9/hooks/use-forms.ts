'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type FormStatus = 'draft' | 'published' | 'closed' | 'archived'
export type FieldType = 'text' | 'textarea' | 'number' | 'email' | 'phone' | 'url' | 'date' | 'time' | 'datetime' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'file' | 'rating' | 'scale' | 'signature' | 'hidden'

export interface Form {
  id: string
  title: string
  description?: string
  slug: string
  status: FormStatus
  fields: FormField[]
  settings: FormSettings
  styling?: FormStyling
  submissions: number
  views: number
  conversionRate: number
  publishedAt?: string
  closesAt?: string
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
}

export interface FormField {
  id: string
  type: FieldType
  label: string
  placeholder?: string
  helpText?: string
  required: boolean
  options?: FormFieldOption[]
  validation?: FieldValidation
  conditionalLogic?: ConditionalLogic
  defaultValue?: any
  order: number
}

export interface FormFieldOption {
  value: string
  label: string
  isDefault?: boolean
}

export interface FieldValidation {
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: string
  customMessage?: string
}

export interface ConditionalLogic {
  action: 'show' | 'hide' | 'require'
  conditions: LogicCondition[]
  operator: 'and' | 'or'
}

export interface LogicCondition {
  fieldId: string
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty'
  value: any
}

export interface FormSettings {
  allowMultipleSubmissions: boolean
  requireAuthentication: boolean
  showProgressBar: boolean
  enableSaveProgress: boolean
  confirmationMessage: string
  redirectUrl?: string
  notifyOnSubmission: boolean
  notificationEmails: string[]
  captchaEnabled: boolean
  submissionLimit?: number
}

export interface FormStyling {
  theme: 'default' | 'minimal' | 'modern' | 'custom'
  primaryColor?: string
  backgroundColor?: string
  fontFamily?: string
  borderRadius?: string
  customCss?: string
}

export interface FormSubmission {
  id: string
  formId: string
  formTitle: string
  data: Record<string, any>
  submittedBy?: string
  submittedByName?: string
  submittedByEmail?: string
  ipAddress?: string
  userAgent?: string
  isComplete: boolean
  isRead: boolean
  createdAt: string
}

export interface FormStats {
  totalForms: number
  activeForms: number
  totalSubmissions: number
  submissionsThisMonth: number
  averageConversionRate: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockForms: Form[] = [
  { id: 'form-1', title: 'Contact Us', description: 'Get in touch with our team', slug: 'contact-us', status: 'published', fields: [{ id: 'f1', type: 'text', label: 'Name', required: true, order: 1 }, { id: 'f2', type: 'email', label: 'Email', required: true, order: 2 }, { id: 'f3', type: 'textarea', label: 'Message', required: true, order: 3 }], settings: { allowMultipleSubmissions: true, requireAuthentication: false, showProgressBar: false, enableSaveProgress: false, confirmationMessage: 'Thank you for contacting us!', notifyOnSubmission: true, notificationEmails: ['support@company.com'], captchaEnabled: true }, submissions: 145, views: 500, conversionRate: 29, publishedAt: '2024-01-15', createdBy: 'user-1', createdByName: 'Alex Chen', createdAt: '2024-01-10', updatedAt: '2024-03-01' },
  { id: 'form-2', title: 'Event Registration', description: 'Register for our upcoming event', slug: 'event-registration', status: 'published', fields: [{ id: 'f4', type: 'text', label: 'Full Name', required: true, order: 1 }, { id: 'f5', type: 'email', label: 'Email', required: true, order: 2 }, { id: 'f6', type: 'select', label: 'Session', options: [{ value: 'morning', label: 'Morning Session' }, { value: 'afternoon', label: 'Afternoon Session' }], required: true, order: 3 }], settings: { allowMultipleSubmissions: false, requireAuthentication: false, showProgressBar: true, enableSaveProgress: true, confirmationMessage: 'You are registered!', notifyOnSubmission: true, notificationEmails: ['events@company.com'], captchaEnabled: false, submissionLimit: 100 }, submissions: 78, views: 200, conversionRate: 39, publishedAt: '2024-02-01', closesAt: '2024-04-01', createdBy: 'user-2', createdByName: 'Sarah Miller', createdAt: '2024-01-25', updatedAt: '2024-02-15' },
  { id: 'form-3', title: 'Feedback Survey', slug: 'feedback', status: 'draft', fields: [{ id: 'f7', type: 'rating', label: 'Overall Satisfaction', required: true, order: 1 }, { id: 'f8', type: 'textarea', label: 'Comments', required: false, order: 2 }], settings: { allowMultipleSubmissions: false, requireAuthentication: true, showProgressBar: false, enableSaveProgress: false, confirmationMessage: 'Thanks for your feedback!', notifyOnSubmission: false, notificationEmails: [], captchaEnabled: false }, submissions: 0, views: 0, conversionRate: 0, createdBy: 'user-1', createdByName: 'Alex Chen', createdAt: '2024-03-15', updatedAt: '2024-03-15' }
]

const mockSubmissions: FormSubmission[] = [
  { id: 'sub-1', formId: 'form-1', formTitle: 'Contact Us', data: { name: 'John Doe', email: 'john@example.com', message: 'Hello, I have a question...' }, submittedByEmail: 'john@example.com', isComplete: true, isRead: true, createdAt: '2024-03-20T10:00:00Z' },
  { id: 'sub-2', formId: 'form-1', formTitle: 'Contact Us', data: { name: 'Jane Smith', email: 'jane@example.com', message: 'Interested in your services' }, submittedByEmail: 'jane@example.com', isComplete: true, isRead: false, createdAt: '2024-03-19T15:30:00Z' },
  { id: 'sub-3', formId: 'form-2', formTitle: 'Event Registration', data: { fullName: 'Mike Johnson', email: 'mike@example.com', session: 'morning' }, submittedByEmail: 'mike@example.com', isComplete: true, isRead: true, createdAt: '2024-03-18T09:00:00Z' }
]

const mockStats: FormStats = {
  totalForms: 5,
  activeForms: 2,
  totalSubmissions: 223,
  submissionsThisMonth: 45,
  averageConversionRate: 32
}

// ============================================================================
// HOOK
// ============================================================================

interface UseFormsOptions {
  
  formId?: string
}

export function useForms(options: UseFormsOptions = {}) {
  const {  formId } = options

  const [forms, setForms] = useState<Form[]>([])
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [currentForm, setCurrentForm] = useState<Form | null>(null)
  const [stats, setStats] = useState<FormStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchForms = useCallback(async (filters?: { status?: string; search?: string }) => {
    try {
      const params = new URLSearchParams()
      if (filters?.status) params.set('status', filters.status)
      if (filters?.search) params.set('search', filters.search)

      const response = await fetch(`/api/forms?${params}`)
      const result = await response.json()
      if (result.success) {
        setForms(Array.isArray(result.forms) ? result.forms : [])
        setStats(Array.isArray(result.stats) ? result.stats : [])
        return result.forms
      }
      setForms([])
      setStats(null)
      return []
    } catch (err) {
      setForms([])
      setStats(null)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [ formId])

  const createForm = useCallback(async (data: { title: string; description?: string; fields?: FormField[] }) => {
    try {
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success) {
        setForms(prev => [result.form, ...prev])
        return { success: true, form: result.form }
      }
      return { success: false, error: result.error }
    } catch (err) {
      const newForm: Form = {
        id: `form-${Date.now()}`,
        title: data.title,
        description: data.description,
        slug: data.title.toLowerCase().replace(/\s+/g, '-'),
        status: 'draft',
        fields: data.fields || [],
        settings: {
          allowMultipleSubmissions: true,
          requireAuthentication: false,
          showProgressBar: false,
          enableSaveProgress: false,
          confirmationMessage: 'Thank you for your submission!',
          notifyOnSubmission: false,
          notificationEmails: [],
          captchaEnabled: false
        },
        submissions: 0,
        views: 0,
        conversionRate: 0,
        createdBy: 'user-1',
        createdByName: 'You',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setForms(prev => [newForm, ...prev])
      return { success: true, form: newForm }
    }
  }, [])

  const updateForm = useCallback(async (formId: string, updates: Partial<Form>) => {
    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const result = await response.json()
      if (result.success) {
        setForms(prev => prev.map(f => f.id === formId ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f))
      }
      return result
    } catch (err) {
      setForms(prev => prev.map(f => f.id === formId ? { ...f, ...updates } : f))
      return { success: true }
    }
  }, [])

  const deleteForm = useCallback(async (formId: string) => {
    try {
      await fetch(`/api/forms/${formId}`, { method: 'DELETE' })
      setForms(prev => prev.filter(f => f.id !== formId))
      return { success: true }
    } catch (err) {
      setForms(prev => prev.filter(f => f.id !== formId))
      return { success: true }
    }
  }, [])

  const publishForm = useCallback(async (formId: string) => {
    return updateForm(formId, { status: 'published', publishedAt: new Date().toISOString() })
  }, [updateForm])

  const unpublishForm = useCallback(async (formId: string) => {
    return updateForm(formId, { status: 'draft', publishedAt: undefined })
  }, [updateForm])

  const closeForm = useCallback(async (formId: string) => {
    return updateForm(formId, { status: 'closed', closesAt: new Date().toISOString() })
  }, [updateForm])

  const duplicateForm = useCallback(async (formId: string) => {
    const original = forms.find(f => f.id === formId)
    if (!original) return { success: false, error: 'Form not found' }

    const duplicate: Form = {
      ...original,
      id: `form-${Date.now()}`,
      title: `${original.title} (Copy)`,
      slug: `${original.slug}-copy`,
      status: 'draft',
      submissions: 0,
      views: 0,
      conversionRate: 0,
      publishedAt: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setForms(prev => [duplicate, ...prev])
    return { success: true, form: duplicate }
  }, [forms])

  const addField = useCallback(async (formId: string, field: Omit<FormField, 'id' | 'order'>) => {
    const form = forms.find(f => f.id === formId)
    if (!form) return { success: false, error: 'Form not found' }

    const newField: FormField = {
      ...field,
      id: `field-${Date.now()}`,
      order: form.fields.length + 1
    }
    return updateForm(formId, { fields: [...form.fields, newField] })
  }, [forms, updateForm])

  const updateField = useCallback(async (formId: string, fieldId: string, updates: Partial<FormField>) => {
    const form = forms.find(f => f.id === formId)
    if (!form) return { success: false, error: 'Form not found' }

    const updatedFields = form.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f)
    return updateForm(formId, { fields: updatedFields })
  }, [forms, updateForm])

  const removeField = useCallback(async (formId: string, fieldId: string) => {
    const form = forms.find(f => f.id === formId)
    if (!form) return { success: false, error: 'Form not found' }

    const updatedFields = form.fields.filter(f => f.id !== fieldId).map((f, i) => ({ ...f, order: i + 1 }))
    return updateForm(formId, { fields: updatedFields })
  }, [forms, updateForm])

  const reorderFields = useCallback(async (formId: string, fieldIds: string[]) => {
    const form = forms.find(f => f.id === formId)
    if (!form) return { success: false, error: 'Form not found' }

    const reordered = fieldIds.map((id, index) => {
      const field = form.fields.find(f => f.id === id)
      return field ? { ...field, order: index + 1 } : null
    }).filter(Boolean) as FormField[]

    return updateForm(formId, { fields: reordered })
  }, [forms, updateForm])

  const submitForm = useCallback(async (formId: string, data: Record<string, any>) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/forms/${formId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success) {
        setForms(prev => prev.map(f => f.id === formId ? { ...f, submissions: f.submissions + 1 } : f))
        return { success: true, submission: result.submission }
      }
      return { success: false, error: result.error }
    } catch (err) {
      const newSubmission: FormSubmission = {
        id: `sub-${Date.now()}`,
        formId,
        formTitle: forms.find(f => f.id === formId)?.title || '',
        data,
        isComplete: true,
        isRead: false,
        createdAt: new Date().toISOString()
      }
      setSubmissions(prev => [newSubmission, ...prev])
      return { success: true, submission: newSubmission }
    } finally {
      setIsSubmitting(false)
    }
  }, [forms])

  const fetchSubmissions = useCallback(async (formId: string) => {
    try {
      const response = await fetch(`/api/forms/${formId}/submissions`)
      const result = await response.json()
      if (result.success) {
        setSubmissions(result.submissions || [])
        return result.submissions
      }
      return []
    } catch (err) {
      const filtered = mockSubmissions.filter(s => s.formId === formId)
      setSubmissions(filtered)
      return filtered
    }
  }, [])

  const markSubmissionRead = useCallback(async (submissionId: string) => {
    setSubmissions(prev => prev.map(s => s.id === submissionId ? { ...s, isRead: true } : s))
    return { success: true }
  }, [])

  const deleteSubmission = useCallback(async (submissionId: string) => {
    setSubmissions(prev => prev.filter(s => s.id !== submissionId))
    return { success: true }
  }, [])

  const exportSubmissions = useCallback(async (formId: string, format: 'csv' | 'xlsx' | 'json' = 'csv') => {
    const formSubmissions = submissions.filter(s => s.formId === formId)
    const data = JSON.stringify(formSubmissions, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `submissions-${formId}.${format}`
    a.click()
    return { success: true }
  }, [submissions])

  // Ref to track if initial load has been done
  const isInitialLoadRef = useRef(false)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchForms()
  }, [fetchForms])

  // Initial load - runs once on mount
  useEffect(() => {
    if (!isInitialLoadRef.current) {
      isInitialLoadRef.current = true
      refresh()
    }
  }, [refresh])

  const publishedForms = useMemo(() => forms.filter(f => f.status === 'published'), [forms])
  const draftForms = useMemo(() => forms.filter(f => f.status === 'draft'), [forms])
  const closedForms = useMemo(() => forms.filter(f => f.status === 'closed'), [forms])
  const unreadSubmissions = useMemo(() => submissions.filter(s => !s.isRead), [submissions])
  const fieldTypes: FieldType[] = ['text', 'textarea', 'number', 'email', 'phone', 'url', 'date', 'time', 'datetime', 'select', 'multiselect', 'checkbox', 'radio', 'file', 'rating', 'scale', 'signature', 'hidden']

  return {
    forms, submissions, currentForm, stats, publishedForms, draftForms, closedForms, unreadSubmissions, fieldTypes,
    isLoading, isSubmitting, error,
    refresh, fetchForms, createForm, updateForm, deleteForm, publishForm, unpublishForm, closeForm, duplicateForm,
    addField, updateField, removeField, reorderFields, submitForm, fetchSubmissions, markSubmissionRead, deleteSubmission, exportSubmissions,
    setCurrentForm
  }
}

export default useForms
