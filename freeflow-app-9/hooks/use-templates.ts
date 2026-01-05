'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type TemplateCategory = 'project' | 'invoice' | 'contract' | 'proposal' | 'email' | 'document' | 'task' | 'workflow'

export interface Template {
  id: string
  name: string
  description: string
  category: TemplateCategory
  thumbnail: string
  content: Record<string, any>
  variables: TemplateVariable[]
  tags: string[]
  isPublic: boolean
  isFavorite: boolean
  usageCount: number
  rating: number
  createdAt: string
  updatedAt: string
  createdBy: string
  version: number
}

export interface TemplateVariable {
  name: string
  label: string
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean'
  required: boolean
  defaultValue?: any
  options?: string[]
  placeholder?: string
}

export interface TemplateUsage {
  templateId: string
  usedAt: string
  usedFor: string
  variables: Record<string, any>
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockTemplates: Template[] = [
  { id: 'tpl-1', name: 'Standard Project', description: 'Basic project template with milestones', category: 'project', thumbnail: '/templates/project.png', content: { phases: ['Discovery', 'Design', 'Development', 'Testing', 'Launch'] }, variables: [{ name: 'projectName', label: 'Project Name', type: 'text', required: true }, { name: 'clientName', label: 'Client Name', type: 'text', required: true }], tags: ['project', 'standard'], isPublic: true, isFavorite: true, usageCount: 156, rating: 4.8, createdAt: '2024-01-01', updatedAt: '2024-03-01', createdBy: 'system', version: 2 },
  { id: 'tpl-2', name: 'Freelance Invoice', description: 'Professional invoice for freelance work', category: 'invoice', thumbnail: '/templates/invoice.png', content: { currency: 'USD', paymentTerms: 'Net 30' }, variables: [{ name: 'clientName', label: 'Client Name', type: 'text', required: true }, { name: 'amount', label: 'Amount', type: 'number', required: true }], tags: ['invoice', 'freelance'], isPublic: true, isFavorite: false, usageCount: 423, rating: 4.9, createdAt: '2024-01-15', updatedAt: '2024-02-15', createdBy: 'system', version: 3 },
  { id: 'tpl-3', name: 'Service Agreement', description: 'Standard service contract template', category: 'contract', thumbnail: '/templates/contract.png', content: { sections: ['Scope', 'Payment', 'Terms', 'Confidentiality'] }, variables: [{ name: 'clientName', label: 'Client Name', type: 'text', required: true }, { name: 'startDate', label: 'Start Date', type: 'date', required: true }], tags: ['contract', 'service'], isPublic: true, isFavorite: true, usageCount: 89, rating: 4.7, createdAt: '2024-02-01', updatedAt: '2024-03-10', createdBy: 'system', version: 1 },
  { id: 'tpl-4', name: 'Project Proposal', description: 'Comprehensive project proposal', category: 'proposal', thumbnail: '/templates/proposal.png', content: { sections: ['Overview', 'Approach', 'Timeline', 'Pricing'] }, variables: [{ name: 'projectTitle', label: 'Project Title', type: 'text', required: true }], tags: ['proposal', 'project'], isPublic: true, isFavorite: false, usageCount: 67, rating: 4.6, createdAt: '2024-02-15', updatedAt: '2024-03-05', createdBy: 'system', version: 1 },
  { id: 'tpl-5', name: 'Follow-up Email', description: 'Professional follow-up email template', category: 'email', thumbnail: '/templates/email.png', content: { subject: 'Following up on our conversation' }, variables: [{ name: 'recipientName', label: 'Recipient Name', type: 'text', required: true }], tags: ['email', 'follow-up'], isPublic: true, isFavorite: true, usageCount: 234, rating: 4.5, createdAt: '2024-03-01', updatedAt: '2024-03-15', createdBy: 'system', version: 1 }
]

// ============================================================================
// HOOK
// ============================================================================

interface UseTemplatesOptions {
  
  category?: TemplateCategory
}

export function useTemplates(options: UseTemplatesOptions = {}) {
  const {  category } = options

  const [templates, setTemplates] = useState<Template[]>([])
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null)
  const [usageHistory, setUsageHistory] = useState<TemplateUsage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchTemplates = useCallback(async (filters?: { category?: string; search?: string; favorites?: boolean }) => {
    try {
      const params = new URLSearchParams()
      if (filters?.category) params.set('category', filters.category)
      if (filters?.search) params.set('search', filters.search)
      if (filters?.favorites) params.set('favorites', 'true')

      const response = await fetch(`/api/templates?${params}`)
      const result = await response.json()
      if (result.success) {
        setTemplates(Array.isArray(result.templates) ? result.templates : [])
        return result.templates
      }
      setTemplates([])
      return []
    } catch (err) {
      setTemplates([])
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createTemplate = useCallback(async (data: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'rating' | 'version'>) => {
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success) {
        await fetchTemplates({ category })
        return { success: true, template: result.template }
      }
      return { success: false, error: result.error }
    } catch (err) {
      const newTemplate: Template = { ...data as any, id: `tpl-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), usageCount: 0, rating: 0, version: 1 }
      setTemplates(prev => [newTemplate, ...prev])
      return { success: true, template: newTemplate }
    }
  }, [fetchTemplates, category])

  const updateTemplate = useCallback(async (templateId: string, updates: Partial<Template>) => {
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const result = await response.json()
      if (result.success) {
        setTemplates(prev => prev.map(t => t.id === templateId ? { ...t, ...updates, updatedAt: new Date().toISOString(), version: t.version + 1 } : t))
      }
      return result
    } catch (err) {
      setTemplates(prev => prev.map(t => t.id === templateId ? { ...t, ...updates } : t))
      return { success: true }
    }
  }, [])

  const deleteTemplate = useCallback(async (templateId: string) => {
    try {
      await fetch(`/api/templates/${templateId}`, { method: 'DELETE' })
      setTemplates(prev => prev.filter(t => t.id !== templateId))
      return { success: true }
    } catch (err) {
      setTemplates(prev => prev.filter(t => t.id !== templateId))
      return { success: true }
    }
  }, [])

  const duplicateTemplate = useCallback(async (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      const newTemplate: Template = { ...template, id: `tpl-${Date.now()}`, name: `${template.name} (Copy)`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), usageCount: 0, version: 1 }
      setTemplates(prev => [newTemplate, ...prev])
      return { success: true, template: newTemplate }
    }
    return { success: false, error: 'Template not found' }
  }, [templates])

  const toggleFavorite = useCallback(async (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      await updateTemplate(templateId, { isFavorite: !template.isFavorite })
    }
  }, [templates, updateTemplate])

  const useTemplate = useCallback(async (templateId: string, variables: Record<string, any>) => {
    try {
      const response = await fetch(`/api/templates/${templateId}/use`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variables })
      })
      const result = await response.json()
      if (result.success) {
        setTemplates(prev => prev.map(t => t.id === templateId ? { ...t, usageCount: t.usageCount + 1 } : t))
        return { success: true, result: result.result }
      }
      return { success: false, error: result.error }
    } catch (err) {
      const template = templates.find(t => t.id === templateId)
      if (template) {
        setTemplates(prev => prev.map(t => t.id === templateId ? { ...t, usageCount: t.usageCount + 1 } : t))
        return { success: true, result: { ...template.content, ...variables } }
      }
      return { success: false, error: 'Template not found' }
    }
  }, [templates])

  const search = useCallback((query: string) => {
    setSearchQuery(query)
    fetchTemplates({ search: query, category })
  }, [fetchTemplates, category])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchTemplates({ category })
  }, [fetchTemplates, category])

  useEffect(() => { refresh() }, [refresh])

  const favoriteTemplates = useMemo(() => templates.filter(t => t.isFavorite), [templates])
  const popularTemplates = useMemo(() => [...templates].sort((a, b) => b.usageCount - a.usageCount).slice(0, 5), [templates])
  const recentTemplates = useMemo(() => [...templates].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5), [templates])
  const templatesByCategory = useMemo(() => {
    const grouped: Record<string, Template[]> = {}
    templates.forEach(t => {
      if (!grouped[t.category]) grouped[t.category] = []
      grouped[t.category].push(t)
    })
    return grouped
  }, [templates])
  const categories = useMemo(() => ['project', 'invoice', 'contract', 'proposal', 'email', 'document', 'task', 'workflow'] as TemplateCategory[], [])

  return {
    templates, currentTemplate, usageHistory, favoriteTemplates, popularTemplates, recentTemplates, templatesByCategory, categories,
    isLoading, error, searchQuery,
    refresh, fetchTemplates, createTemplate, updateTemplate, deleteTemplate, duplicateTemplate, toggleFavorite, useTemplate, search,
    setCurrentTemplate
  }
}

export default useTemplates
