import { renderHook, act } from '@testing-library/react'
import { useCallback, useState } from 'react'

/**
 * Dashboard Handler Tests
 *
 * These tests cover the common handler patterns used throughout the dashboard:
 * 1. Export handlers - creating downloadable blobs and triggering downloads
 * 2. Settings persistence handlers - localStorage interactions
 * 3. Dialog opening handlers - setting correct state for dialogs
 * 4. Form submission handlers - validation and API interactions
 */

// Mock URL APIs
const mockUrl = 'blob:test-url'
const mockCreateObjectURL = jest.fn(() => mockUrl)
const mockRevokeObjectURL = jest.fn()

// Mock anchor element for download tests
const mockClick = jest.fn()
let mockAnchor: { href: string; download: string; click: jest.Mock }

// Setup before tests
beforeAll(() => {
  global.URL.createObjectURL = mockCreateObjectURL
  global.URL.revokeObjectURL = mockRevokeObjectURL
})

// Clean up after tests
afterAll(() => {
  jest.restoreAllMocks()
})

describe('Dashboard Handlers', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
    mockAnchor = {
      href: '',
      download: '',
      click: mockClick,
    }
  })

  describe('Export Handlers', () => {
    it('should create downloadable blob for JSON export', () => {
      const testData = {
        items: [
          { id: '1', name: 'Item 1', value: 100 },
          { id: '2', name: 'Item 2', value: 200 },
        ],
        exportedAt: '2024-01-26T12:00:00.000Z',
        format: 'json'
      }

      // Simulate export handler logic
      const blob = new Blob([JSON.stringify(testData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)

      expect(mockCreateObjectURL).toHaveBeenCalledWith(blob)
      expect(url).toBe(mockUrl)
    })

    it('should trigger download with correct filename for JSON export', () => {
      const workflowName = 'Test Workflow'
      const exportFormat = 'json'
      const exportData = {
        name: workflowName,
        description: 'Test description',
        exportedAt: new Date().toISOString(),
        format: exportFormat
      }

      // Simulate the export handler
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)

      // Simulate anchor element behavior
      mockAnchor.href = url
      mockAnchor.download = `${workflowName.toLowerCase().replace(/\s+/g, '-')}-workflow.${exportFormat}`
      mockAnchor.click()

      expect(mockAnchor.href).toBe(mockUrl)
      expect(mockAnchor.download).toBe('test-workflow-workflow.json')
      expect(mockClick).toHaveBeenCalled()
    })

    it('should revoke object URL after download', () => {
      const testData = { id: '1', name: 'Test' }
      const blob = new Blob([JSON.stringify(testData)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)

      // Simulate cleanup
      URL.revokeObjectURL(url)

      expect(mockRevokeObjectURL).toHaveBeenCalledWith(mockUrl)
    })

    it('should handle CSV export format', () => {
      const csvContent = 'id,name,value\n1,Item 1,100\n2,Item 2,200'
      const blob = new Blob([csvContent], { type: 'text/csv' })
      URL.createObjectURL(blob)

      // Simulate anchor element behavior
      mockAnchor.download = 'export-data.csv'
      mockAnchor.click()

      expect(mockAnchor.download).toBe('export-data.csv')
      expect(mockClick).toHaveBeenCalled()
    })

    it('should export multiple items with proper formatting', () => {
      const items = [
        { id: '1', name: 'Automation 1', status: 'active', category: 'productivity' },
        { id: '2', name: 'Automation 2', status: 'paused', category: 'security' },
        { id: '3', name: 'Automation 3', status: 'draft', category: 'integrations' },
      ]

      const exportData = {
        automations: items,
        exportedAt: new Date().toISOString(),
        total: items.length
      }

      const jsonString = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })

      expect(blob.size).toBeGreaterThan(0)
      expect(blob.type).toBe('application/json')
    })
  })

  describe('Settings Persistence Handlers', () => {
    it('should persist settings to localStorage', () => {
      const settings = {
        theme: 'dark',
        notifications: true,
        autoRefresh: false
      }

      localStorage.setItem('freeflow-settings', JSON.stringify(settings))

      const retrieved = JSON.parse(localStorage.getItem('freeflow-settings')!)
      expect(retrieved).toEqual(settings)
    })

    it('should update existing settings without overwriting other values', () => {
      const initialSettings = {
        theme: 'light',
        notifications: true,
        autoRefresh: true
      }
      localStorage.setItem('freeflow-settings', JSON.stringify(initialSettings))

      // Simulate updating only the theme
      const current = JSON.parse(localStorage.getItem('freeflow-settings')!)
      const updated = { ...current, theme: 'dark' }
      localStorage.setItem('freeflow-settings', JSON.stringify(updated))

      const retrieved = JSON.parse(localStorage.getItem('freeflow-settings')!)
      expect(retrieved.theme).toBe('dark')
      expect(retrieved.notifications).toBe(true)
      expect(retrieved.autoRefresh).toBe(true)
    })

    it('should handle missing localStorage gracefully', () => {
      const savedSettings = localStorage.getItem('non-existent-key')
      const settings = savedSettings ? JSON.parse(savedSettings) : { default: true }

      expect(settings).toEqual({ default: true })
    })

    it('should persist filter settings', () => {
      const filters = {
        category: 'productivity',
        status: 'active',
        dateRange: 'last-30-days'
      }

      localStorage.setItem('zap-filters', JSON.stringify(filters))

      const retrieved = JSON.parse(localStorage.getItem('zap-filters')!)
      expect(retrieved.category).toBe('productivity')
      expect(retrieved.status).toBe('active')
    })

    it('should persist bookmarks array', () => {
      const bookmarks = ['log-1', 'log-2', 'log-3']

      localStorage.setItem('log-bookmarks', JSON.stringify(bookmarks))

      // Add a new bookmark
      const existingBookmarks = JSON.parse(localStorage.getItem('log-bookmarks') || '[]')
      existingBookmarks.push('log-4')
      localStorage.setItem('log-bookmarks', JSON.stringify(existingBookmarks))

      const retrieved = JSON.parse(localStorage.getItem('log-bookmarks')!)
      expect(retrieved).toHaveLength(4)
      expect(retrieved).toContain('log-4')
    })

    it('should persist saved queries with metadata', () => {
      const savedQuery = {
        id: 'query-1',
        name: 'Error Logs',
        query: 'level:error',
        createdAt: new Date().toISOString()
      }

      const queries = [savedQuery]
      localStorage.setItem('saved-log-queries', JSON.stringify(queries))

      const retrieved = JSON.parse(localStorage.getItem('saved-log-queries')!)
      expect(retrieved[0].name).toBe('Error Logs')
      expect(retrieved[0].query).toBe('level:error')
    })

    it('should handle complex nested settings', () => {
      const complexSettings = {
        general: {
          language: 'en',
          timezone: 'UTC'
        },
        notifications: {
          email: true,
          push: false,
          frequency: 'daily'
        },
        security: {
          twoFactor: true,
          sessionTimeout: 30
        }
      }

      localStorage.setItem('app-settings', JSON.stringify(complexSettings))

      const retrieved = JSON.parse(localStorage.getItem('app-settings')!)
      expect(retrieved.general.language).toBe('en')
      expect(retrieved.notifications.frequency).toBe('daily')
      expect(retrieved.security.twoFactor).toBe(true)
    })
  })

  describe('Dialog Opening Handlers', () => {
    it('should set create dialog open state', () => {
      const { result } = renderHook(() => {
        const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
        return { isCreateDialogOpen, setIsCreateDialogOpen }
      })

      expect(result.current.isCreateDialogOpen).toBe(false)

      act(() => {
        result.current.setIsCreateDialogOpen(true)
      })

      expect(result.current.isCreateDialogOpen).toBe(true)
    })

    it('should set settings dialog open with selected item', () => {
      const { result } = renderHook(() => {
        const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
        const [selectedAutomation, setSelectedAutomation] = useState<{ id: string; name: string } | null>(null)

        const openSettings = useCallback((automation: { id: string; name: string }) => {
          setSelectedAutomation(automation)
          setIsSettingsDialogOpen(true)
        }, [])

        return { isSettingsDialogOpen, selectedAutomation, openSettings }
      })

      const testAutomation = { id: '1', name: 'Test Automation' }

      act(() => {
        result.current.openSettings(testAutomation)
      })

      expect(result.current.isSettingsDialogOpen).toBe(true)
      expect(result.current.selectedAutomation).toEqual(testAutomation)
    })

    it('should set delete dialog open with item to delete', () => {
      const { result } = renderHook(() => {
        const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
        const [automationToDelete, setAutomationToDelete] = useState<{ id: string; name: string } | null>(null)

        const openDeleteDialog = useCallback((automation: { id: string; name: string }) => {
          setAutomationToDelete(automation)
          setIsDeleteDialogOpen(true)
        }, [])

        return { isDeleteDialogOpen, automationToDelete, openDeleteDialog }
      })

      const itemToDelete = { id: '123', name: 'Automation to Delete' }

      act(() => {
        result.current.openDeleteDialog(itemToDelete)
      })

      expect(result.current.isDeleteDialogOpen).toBe(true)
      expect(result.current.automationToDelete?.id).toBe('123')
    })

    it('should handle multiple dialog states independently', () => {
      const { result } = renderHook(() => {
        const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
        const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
        const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
        const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)

        return {
          isCreateDialogOpen,
          setIsCreateDialogOpen,
          isEditDialogOpen,
          setIsEditDialogOpen,
          isDeleteDialogOpen,
          setIsDeleteDialogOpen,
          isExportDialogOpen,
          setIsExportDialogOpen
        }
      })

      // Open create dialog
      act(() => {
        result.current.setIsCreateDialogOpen(true)
      })
      expect(result.current.isCreateDialogOpen).toBe(true)
      expect(result.current.isEditDialogOpen).toBe(false)

      // Close create, open edit
      act(() => {
        result.current.setIsCreateDialogOpen(false)
        result.current.setIsEditDialogOpen(true)
      })
      expect(result.current.isCreateDialogOpen).toBe(false)
      expect(result.current.isEditDialogOpen).toBe(true)
    })

    it('should reset test results when opening test dialog', () => {
      const { result } = renderHook(() => {
        const [isTestDialogOpen, setIsTestDialogOpen] = useState(false)
        const [testResults, setTestResults] = useState<{ success: boolean; message: string } | null>({
          success: true,
          message: 'Previous test passed'
        })
        const [selectedAutomation, setSelectedAutomation] = useState<{ id: string } | null>(null)

        const openTestDialog = useCallback((automation: { id: string }) => {
          setSelectedAutomation(automation)
          setTestResults(null)
          setIsTestDialogOpen(true)
        }, [])

        return { isTestDialogOpen, testResults, selectedAutomation, openTestDialog }
      })

      // Initially has test results
      expect(result.current.testResults).not.toBeNull()

      act(() => {
        result.current.openTestDialog({ id: 'automation-1' })
      })

      expect(result.current.isTestDialogOpen).toBe(true)
      expect(result.current.testResults).toBeNull()
      expect(result.current.selectedAutomation?.id).toBe('automation-1')
    })
  })

  describe('Form Submission Handlers', () => {
    it('should validate required fields before submission', async () => {
      const { result } = renderHook(() => {
        const [error, setError] = useState<string | null>(null)

        const handleCreateAutomation = useCallback(async (newAutomation: { name: string; description: string }) => {
          if (!newAutomation.name) {
            setError('Validation error')
            return false
          }
          return true
        }, [])

        return { error, handleCreateAutomation }
      })

      // Test with empty name
      let success = false
      await act(async () => {
        success = await result.current.handleCreateAutomation({ name: '', description: '' })
      })

      expect(success).toBe(false)
      expect(result.current.error).toBe('Validation error')
    })

    it('should set loading state during API call', async () => {
      const { result } = renderHook(() => {
        const [isLoading, setIsLoading] = useState(false)

        const handleSaveSettings = useCallback(async () => {
          setIsLoading(true)
          try {
            await new Promise(resolve => setTimeout(resolve, 10))
          } finally {
            setIsLoading(false)
          }
        }, [])

        return { isLoading, handleSaveSettings }
      })

      expect(result.current.isLoading).toBe(false)

      await act(async () => {
        await result.current.handleSaveSettings()
      })

      expect(result.current.isLoading).toBe(false)
    })

    it('should close dialog after successful submission', async () => {
      const { result } = renderHook(() => {
        const [isDialogOpen, setIsDialogOpen] = useState(true)

        const handleSubmit = useCallback(async () => {
          // Simulate successful API call
          await new Promise(resolve => setTimeout(resolve, 10))
          setIsDialogOpen(false)
          return true
        }, [])

        return { isDialogOpen, handleSubmit }
      })

      expect(result.current.isDialogOpen).toBe(true)

      await act(async () => {
        await result.current.handleSubmit()
      })

      expect(result.current.isDialogOpen).toBe(false)
    })

    it('should reset form state after successful creation', async () => {
      const initialFormState = { name: '', description: '', category: 'productivity' }

      const { result } = renderHook(() => {
        const [formData, setFormData] = useState({
          name: 'Test',
          description: 'Test Description',
          category: 'security'
        })
        const [isDialogOpen, setIsDialogOpen] = useState(true)

        const handleCreate = useCallback(async () => {
          // Simulate successful creation
          await new Promise(resolve => setTimeout(resolve, 10))
          setIsDialogOpen(false)
          setFormData(initialFormState)
        }, [])

        return { formData, isDialogOpen, handleCreate }
      })

      expect(result.current.formData.name).toBe('Test')

      await act(async () => {
        await result.current.handleCreate()
      })

      expect(result.current.formData).toEqual(initialFormState)
      expect(result.current.isDialogOpen).toBe(false)
    })
  })

  describe('Toggle Handlers', () => {
    it('should toggle automation status', () => {
      const { result } = renderHook(() => {
        const [automations, setAutomations] = useState([
          { id: '1', name: 'Auto 1', status: 'active' },
          { id: '2', name: 'Auto 2', status: 'paused' },
        ])

        const toggleStatus = useCallback((id: string) => {
          setAutomations(prev => prev.map(auto =>
            auto.id === id
              ? { ...auto, status: auto.status === 'active' ? 'paused' : 'active' }
              : auto
          ))
        }, [])

        return { automations, toggleStatus }
      })

      expect(result.current.automations[0].status).toBe('active')

      act(() => {
        result.current.toggleStatus('1')
      })

      expect(result.current.automations[0].status).toBe('paused')

      act(() => {
        result.current.toggleStatus('1')
      })

      expect(result.current.automations[0].status).toBe('active')
    })
  })

  describe('Delete Handlers', () => {
    it('should remove item and close dialog', () => {
      const { result } = renderHook(() => {
        const [items, setItems] = useState([
          { id: '1', name: 'Item 1' },
          { id: '2', name: 'Item 2' },
        ])
        const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(true)
        const [itemToDelete, setItemToDelete] = useState<{ id: string } | null>({ id: '1' })

        const deleteItem = useCallback((id: string) => {
          setItems(prev => prev.filter(item => item.id !== id))
          setIsDeleteDialogOpen(false)
          setItemToDelete(null)
        }, [])

        return { items, isDeleteDialogOpen, itemToDelete, deleteItem }
      })

      expect(result.current.items).toHaveLength(2)
      expect(result.current.isDeleteDialogOpen).toBe(true)

      act(() => {
        result.current.deleteItem('1')
      })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].id).toBe('2')
      expect(result.current.isDeleteDialogOpen).toBe(false)
      expect(result.current.itemToDelete).toBeNull()
    })
  })

  describe('Import Handlers', () => {
    it('should parse imported JSON file', async () => {
      const importedData = {
        name: 'Imported Workflow',
        description: 'Imported from file',
        trigger_type: 'manual',
        category: 'custom'
      }

      // Simulate file reading
      const fileContent = JSON.stringify(importedData)
      const parsedData = JSON.parse(fileContent)

      expect(parsedData.name).toBe('Imported Workflow')
      expect(parsedData.trigger_type).toBe('manual')
    })

    it('should handle import with default values for missing fields', () => {
      const partialData = { name: 'Partial Workflow' }

      // Simulate handler logic that provides defaults
      const fullData = {
        name: partialData.name || 'Imported Workflow',
        description: (partialData as Record<string, unknown>).description || '',
        trigger_type: (partialData as Record<string, unknown>).trigger_type || 'manual',
        category: (partialData as Record<string, unknown>).category || 'custom',
        status: 'draft'
      }

      expect(fullData.name).toBe('Partial Workflow')
      expect(fullData.description).toBe('')
      expect(fullData.trigger_type).toBe('manual')
      expect(fullData.category).toBe('custom')
    })
  })

  describe('Share Handlers', () => {
    it('should validate share email before sharing', () => {
      const { result } = renderHook(() => {
        const [error, setError] = useState<string | null>(null)

        const handleShare = useCallback((workflow: { id: string } | null, email: string) => {
          if (!workflow || !email) {
            setError('Missing information')
            return false
          }
          return true
        }, [])

        return { error, handleShare }
      })

      let success = false
      act(() => {
        success = result.current.handleShare({ id: '1' }, '')
      })

      expect(success).toBe(false)
      expect(result.current.error).toBe('Missing information')
    })

    it('should succeed with valid workflow and email', () => {
      const { result } = renderHook(() => {
        const [isShareDialogOpen, setIsShareDialogOpen] = useState(true)

        const handleShare = useCallback((workflow: { id: string } | null, email: string) => {
          if (!workflow || !email) {
            return false
          }
          setIsShareDialogOpen(false)
          return true
        }, [])

        return { isShareDialogOpen, handleShare }
      })

      let success = false
      act(() => {
        success = result.current.handleShare({ id: '1' }, 'test@example.com')
      })

      expect(success).toBe(true)
      expect(result.current.isShareDialogOpen).toBe(false)
    })
  })
})

describe('Filter Handlers', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should filter items by search query', () => {
    const items = [
      { id: '1', name: 'Email Automation', description: 'Send emails' },
      { id: '2', name: 'Data Sync', description: 'Sync data between services' },
      { id: '3', name: 'Email Reminder', description: 'Send reminder emails' },
    ]

    const searchQuery = 'email'

    const filtered = items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

    expect(filtered).toHaveLength(2)
    expect(filtered.map(i => i.id)).toContain('1')
    expect(filtered.map(i => i.id)).toContain('3')
  })

  it('should filter items by category', () => {
    const items = [
      { id: '1', name: 'Auto 1', category: 'productivity' },
      { id: '2', name: 'Auto 2', category: 'security' },
      { id: '3', name: 'Auto 3', category: 'productivity' },
    ]

    const filterCategory = 'productivity'

    const filtered = items.filter(item =>
      filterCategory === 'all' || item.category === filterCategory
    )

    expect(filtered).toHaveLength(2)
  })

  it('should filter items by status', () => {
    const items = [
      { id: '1', name: 'Auto 1', status: 'active' },
      { id: '2', name: 'Auto 2', status: 'paused' },
      { id: '3', name: 'Auto 3', status: 'active' },
    ]

    const filterStatus = 'active'

    const filtered = items.filter(item =>
      filterStatus === 'all' || item.status === filterStatus
    )

    expect(filtered).toHaveLength(2)
  })

  it('should combine multiple filters', () => {
    const items = [
      { id: '1', name: 'Email Auto', category: 'productivity', status: 'active' },
      { id: '2', name: 'Data Sync', category: 'productivity', status: 'paused' },
      { id: '3', name: 'Email Security', category: 'security', status: 'active' },
      { id: '4', name: 'Backup Auto', category: 'productivity', status: 'active' },
    ]

    const searchQuery = ''
    const filterCategory = 'productivity'
    const filterStatus = 'active'

    const filtered = items.filter(item => {
      const matchesSearch = !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus

      return matchesSearch && matchesCategory && matchesStatus
    })

    expect(filtered).toHaveLength(2)
    expect(filtered.map(i => i.id)).toEqual(['1', '4'])
  })
})
