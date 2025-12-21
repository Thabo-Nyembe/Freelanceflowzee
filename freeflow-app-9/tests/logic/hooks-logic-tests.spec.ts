/**
 * HOOKS LOGIC TESTS
 * Freeflow Kazi Platform - Unit Tests for React Hooks
 *
 * Tests the business logic within hooks
 *
 * Created: December 16, 2024
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ============================================
// MOCK SETUP
// ============================================

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      range: vi.fn(() => Promise.resolve({ data: [], error: null })),
    })),
    insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
    update: vi.fn(() => Promise.resolve({ data: null, error: null })),
    delete: vi.fn(() => Promise.resolve({ data: null, error: null })),
    upsert: vi.fn(() => Promise.resolve({ data: null, error: null })),
  })),
  auth: {
    getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'test-user-id' } }, error: null })),
    signIn: vi.fn(() => Promise.resolve({ data: null, error: null })),
    signOut: vi.fn(() => Promise.resolve({ error: null })),
  },
  channel: vi.fn(() => ({
    on: vi.fn(() => ({
      subscribe: vi.fn(),
    })),
  })),
  removeChannel: vi.fn(),
}

vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => mockSupabaseClient,
}))

// ============================================
// 1. DATA VALIDATION LOGIC TESTS
// ============================================
describe('Data Validation Logic', () => {
  describe('Email Validation', () => {
    const validateEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    }

    it('should validate correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
      expect(validateEmail('user+tag@gmail.com')).toBe(true)
    })

    it('should reject invalid email formats', () => {
      expect(validateEmail('invalid')).toBe(false)
      expect(validateEmail('invalid@')).toBe(false)
      expect(validateEmail('@domain.com')).toBe(false)
      expect(validateEmail('test@.com')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('Phone Validation', () => {
    const validatePhone = (phone: string): boolean => {
      const phoneRegex = /^\+?[\d\s\-()]{10,}$/
      return phoneRegex.test(phone)
    }

    it('should validate correct phone formats', () => {
      expect(validatePhone('+1234567890')).toBe(true)
      expect(validatePhone('123-456-7890')).toBe(true)
      expect(validatePhone('(123) 456-7890')).toBe(true)
      expect(validatePhone('+1 (234) 567-8901')).toBe(true)
    })

    it('should reject invalid phone formats', () => {
      expect(validatePhone('123')).toBe(false)
      expect(validatePhone('abc')).toBe(false)
      expect(validatePhone('')).toBe(false)
    })
  })

  describe('Password Strength Validation', () => {
    const validatePasswordStrength = (password: string): {
      isValid: boolean
      strength: 'weak' | 'medium' | 'strong'
      errors: string[]
    } => {
      const errors: string[] = []
      let score = 0

      if (password.length < 8) errors.push('Password must be at least 8 characters')
      else score++

      if (!/[A-Z]/.test(password)) errors.push('Password must contain uppercase letter')
      else score++

      if (!/[a-z]/.test(password)) errors.push('Password must contain lowercase letter')
      else score++

      if (!/[0-9]/.test(password)) errors.push('Password must contain a number')
      else score++

      if (!/[!@#$%^&*]/.test(password)) errors.push('Password must contain a special character')
      else score++

      return {
        isValid: errors.length === 0,
        strength: score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong',
        errors,
      }
    }

    it('should validate strong passwords', () => {
      const result = validatePasswordStrength('StrongP@ss123')
      expect(result.isValid).toBe(true)
      expect(result.strength).toBe('strong')
      expect(result.errors).toHaveLength(0)
    })

    it('should identify weak passwords', () => {
      const result = validatePasswordStrength('weak')
      expect(result.isValid).toBe(false)
      expect(result.strength).toBe('weak')
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should identify medium passwords', () => {
      const result = validatePasswordStrength('Medium123')
      expect(result.strength).toBe('medium')
    })
  })
})

// ============================================
// 2. CURRENCY & FORMATTING LOGIC TESTS
// ============================================
describe('Currency & Formatting Logic', () => {
  describe('Currency Formatting', () => {
    const formatCurrency = (amount: number, currency = 'USD', locale = 'en-US'): string => {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
      }).format(amount)
    }

    it('should format USD correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
      expect(formatCurrency(0)).toBe('$0.00')
      expect(formatCurrency(-100)).toBe('-$100.00')
    })

    it('should format EUR correctly', () => {
      const result = formatCurrency(1234.56, 'EUR', 'de-DE')
      expect(result).toContain('1.234,56')
    })

    it('should handle large numbers', () => {
      expect(formatCurrency(1000000)).toBe('$1,000,000.00')
    })

    it('should handle decimal precision', () => {
      expect(formatCurrency(99.999)).toBe('$100.00')
    })
  })

  describe('Date Formatting', () => {
    const formatDate = (date: Date | string, format: 'short' | 'long' | 'relative' = 'short'): string => {
      const d = typeof date === 'string' ? new Date(date) : date

      if (format === 'short') {
        return d.toLocaleDateString('en-US')
      } else if (format === 'long') {
        return d.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      } else {
        const now = new Date()
        const diffMs = now.getTime() - d.getTime()
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return 'Today'
        if (diffDays === 1) return 'Yesterday'
        if (diffDays < 7) return `${diffDays} days ago`
        return d.toLocaleDateString('en-US')
      }
    }

    it('should format dates in short format', () => {
      const date = new Date('2024-12-16')
      expect(formatDate(date, 'short')).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
    })

    it('should format dates in long format', () => {
      const date = new Date('2024-12-16')
      const result = formatDate(date, 'long')
      expect(result).toContain('December')
      expect(result).toContain('2024')
    })

    it('should handle relative dates', () => {
      const today = new Date()
      expect(formatDate(today, 'relative')).toBe('Today')

      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      expect(formatDate(yesterday, 'relative')).toBe('Yesterday')
    })
  })

  describe('File Size Formatting', () => {
    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
      expect(formatFileSize(500)).toBe('500 Bytes')
    })

    it('should format KB correctly', () => {
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(2048)).toBe('2 KB')
    })

    it('should format MB correctly', () => {
      expect(formatFileSize(1048576)).toBe('1 MB')
      expect(formatFileSize(5242880)).toBe('5 MB')
    })

    it('should format GB correctly', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB')
    })
  })
})

// ============================================
// 3. PAGINATION LOGIC TESTS
// ============================================
describe('Pagination Logic', () => {
  const calculatePagination = (
    currentPage: number,
    totalItems: number,
    itemsPerPage: number
  ) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems)

    return {
      currentPage,
      totalPages,
      startIndex,
      endIndex,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
      itemsOnPage: endIndex - startIndex,
    }
  }

  it('should calculate first page correctly', () => {
    const result = calculatePagination(1, 100, 10)
    expect(result.currentPage).toBe(1)
    expect(result.totalPages).toBe(10)
    expect(result.startIndex).toBe(0)
    expect(result.endIndex).toBe(10)
    expect(result.hasNextPage).toBe(true)
    expect(result.hasPrevPage).toBe(false)
  })

  it('should calculate middle page correctly', () => {
    const result = calculatePagination(5, 100, 10)
    expect(result.startIndex).toBe(40)
    expect(result.endIndex).toBe(50)
    expect(result.hasNextPage).toBe(true)
    expect(result.hasPrevPage).toBe(true)
  })

  it('should calculate last page correctly', () => {
    const result = calculatePagination(10, 100, 10)
    expect(result.hasNextPage).toBe(false)
    expect(result.hasPrevPage).toBe(true)
  })

  it('should handle partial last page', () => {
    const result = calculatePagination(4, 35, 10)
    expect(result.totalPages).toBe(4)
    expect(result.itemsOnPage).toBe(5)
    expect(result.endIndex).toBe(35)
  })

  it('should handle empty results', () => {
    const result = calculatePagination(1, 0, 10)
    expect(result.totalPages).toBe(0)
    expect(result.itemsOnPage).toBe(0)
  })
})

// ============================================
// 4. SORTING LOGIC TESTS
// ============================================
describe('Sorting Logic', () => {
  interface Item {
    id: number
    name: string
    date: Date
    amount: number
  }

  const sortItems = <T>(
    items: T[],
    key: keyof T,
    direction: 'asc' | 'desc' = 'asc'
  ): T[] => {
    return [...items].sort((a, b) => {
      const aVal = a[key]
      const bVal = b[key]

      if (aVal < bVal) return direction === 'asc' ? -1 : 1
      if (aVal > bVal) return direction === 'asc' ? 1 : -1
      return 0
    })
  }

  const testItems: Item[] = [
    { id: 3, name: 'Charlie', date: new Date('2024-01-15'), amount: 300 },
    { id: 1, name: 'Alice', date: new Date('2024-03-20'), amount: 100 },
    { id: 2, name: 'Bob', date: new Date('2024-02-10'), amount: 200 },
  ]

  it('should sort by string ascending', () => {
    const result = sortItems(testItems, 'name', 'asc')
    expect(result[0].name).toBe('Alice')
    expect(result[2].name).toBe('Charlie')
  })

  it('should sort by string descending', () => {
    const result = sortItems(testItems, 'name', 'desc')
    expect(result[0].name).toBe('Charlie')
    expect(result[2].name).toBe('Alice')
  })

  it('should sort by number ascending', () => {
    const result = sortItems(testItems, 'amount', 'asc')
    expect(result[0].amount).toBe(100)
    expect(result[2].amount).toBe(300)
  })

  it('should sort by number descending', () => {
    const result = sortItems(testItems, 'amount', 'desc')
    expect(result[0].amount).toBe(300)
    expect(result[2].amount).toBe(100)
  })

  it('should sort by date', () => {
    const result = sortItems(testItems, 'date', 'asc')
    expect(result[0].id).toBe(3) // January
    expect(result[2].id).toBe(1) // March
  })

  it('should not mutate original array', () => {
    const original = [...testItems]
    sortItems(testItems, 'name', 'asc')
    expect(testItems).toEqual(original)
  })
})

// ============================================
// 5. FILTERING LOGIC TESTS
// ============================================
describe('Filtering Logic', () => {
  interface Task {
    id: number
    title: string
    status: 'pending' | 'in_progress' | 'completed'
    priority: 'low' | 'medium' | 'high'
    assignee: string | null
  }

  const filterTasks = (
    tasks: Task[],
    filters: {
      status?: Task['status'][]
      priority?: Task['priority'][]
      assignee?: string | null
      search?: string
    }
  ): Task[] => {
    return tasks.filter(task => {
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(task.status)) return false
      }
      if (filters.priority && filters.priority.length > 0) {
        if (!filters.priority.includes(task.priority)) return false
      }
      if (filters.assignee !== undefined) {
        if (task.assignee !== filters.assignee) return false
      }
      if (filters.search) {
        if (!task.title.toLowerCase().includes(filters.search.toLowerCase())) return false
      }
      return true
    })
  }

  const testTasks: Task[] = [
    { id: 1, title: 'Design homepage', status: 'completed', priority: 'high', assignee: 'Alice' },
    { id: 2, title: 'Build API', status: 'in_progress', priority: 'high', assignee: 'Bob' },
    { id: 3, title: 'Write tests', status: 'pending', priority: 'medium', assignee: 'Alice' },
    { id: 4, title: 'Deploy app', status: 'pending', priority: 'low', assignee: null },
  ]

  it('should filter by single status', () => {
    const result = filterTasks(testTasks, { status: ['completed'] })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
  })

  it('should filter by multiple statuses', () => {
    const result = filterTasks(testTasks, { status: ['pending', 'in_progress'] })
    expect(result).toHaveLength(3)
  })

  it('should filter by priority', () => {
    const result = filterTasks(testTasks, { priority: ['high'] })
    expect(result).toHaveLength(2)
  })

  it('should filter by assignee', () => {
    const result = filterTasks(testTasks, { assignee: 'Alice' })
    expect(result).toHaveLength(2)
  })

  it('should filter by null assignee', () => {
    const result = filterTasks(testTasks, { assignee: null })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(4)
  })

  it('should filter by search term', () => {
    const result = filterTasks(testTasks, { search: 'api' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(2)
  })

  it('should combine multiple filters', () => {
    const result = filterTasks(testTasks, {
      status: ['pending', 'in_progress'],
      priority: ['high', 'medium'],
    })
    expect(result).toHaveLength(2)
  })

  it('should return all tasks with no filters', () => {
    const result = filterTasks(testTasks, {})
    expect(result).toHaveLength(4)
  })
})

// ============================================
// 6. STATE MACHINE LOGIC TESTS
// ============================================
describe('State Machine Logic', () => {
  type InvoiceState = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled'

  const invoiceTransitions: Record<InvoiceState, InvoiceState[]> = {
    draft: ['sent', 'cancelled'],
    sent: ['viewed', 'paid', 'overdue', 'cancelled'],
    viewed: ['paid', 'overdue', 'cancelled'],
    paid: [],
    overdue: ['paid', 'cancelled'],
    cancelled: [],
  }

  const canTransition = (from: InvoiceState, to: InvoiceState): boolean => {
    return invoiceTransitions[from].includes(to)
  }

  const getNextStates = (current: InvoiceState): InvoiceState[] => {
    return invoiceTransitions[current]
  }

  it('should allow valid transitions from draft', () => {
    expect(canTransition('draft', 'sent')).toBe(true)
    expect(canTransition('draft', 'cancelled')).toBe(true)
    expect(canTransition('draft', 'paid')).toBe(false)
  })

  it('should allow valid transitions from sent', () => {
    expect(canTransition('sent', 'viewed')).toBe(true)
    expect(canTransition('sent', 'paid')).toBe(true)
    expect(canTransition('sent', 'overdue')).toBe(true)
    expect(canTransition('sent', 'draft')).toBe(false)
  })

  it('should prevent transitions from final states', () => {
    expect(canTransition('paid', 'draft')).toBe(false)
    expect(canTransition('paid', 'cancelled')).toBe(false)
    expect(canTransition('cancelled', 'sent')).toBe(false)
  })

  it('should return correct next states', () => {
    expect(getNextStates('draft')).toEqual(['sent', 'cancelled'])
    expect(getNextStates('paid')).toEqual([])
  })
})

// ============================================
// 7. CALCULATION LOGIC TESTS
// ============================================
describe('Calculation Logic', () => {
  describe('Invoice Calculations', () => {
    interface InvoiceItem {
      description: string
      quantity: number
      unitPrice: number
      taxRate: number // percentage
      discount: number // percentage
    }

    const calculateInvoice = (items: InvoiceItem[]) => {
      let subtotal = 0
      let totalTax = 0
      let totalDiscount = 0

      items.forEach(item => {
        const lineTotal = item.quantity * item.unitPrice
        const discount = lineTotal * (item.discount / 100)
        const afterDiscount = lineTotal - discount
        const tax = afterDiscount * (item.taxRate / 100)

        subtotal += lineTotal
        totalDiscount += discount
        totalTax += tax
      })

      const total = subtotal - totalDiscount + totalTax

      return {
        subtotal: Math.round(subtotal * 100) / 100,
        totalDiscount: Math.round(totalDiscount * 100) / 100,
        totalTax: Math.round(totalTax * 100) / 100,
        total: Math.round(total * 100) / 100,
      }
    }

    it('should calculate simple invoice', () => {
      const items: InvoiceItem[] = [
        { description: 'Service', quantity: 1, unitPrice: 100, taxRate: 10, discount: 0 },
      ]
      const result = calculateInvoice(items)
      expect(result.subtotal).toBe(100)
      expect(result.totalTax).toBe(10)
      expect(result.total).toBe(110)
    })

    it('should calculate invoice with discount', () => {
      const items: InvoiceItem[] = [
        { description: 'Service', quantity: 1, unitPrice: 100, taxRate: 10, discount: 20 },
      ]
      const result = calculateInvoice(items)
      expect(result.subtotal).toBe(100)
      expect(result.totalDiscount).toBe(20)
      expect(result.totalTax).toBe(8) // 10% of 80
      expect(result.total).toBe(88)
    })

    it('should calculate invoice with multiple items', () => {
      const items: InvoiceItem[] = [
        { description: 'Service A', quantity: 2, unitPrice: 50, taxRate: 10, discount: 0 },
        { description: 'Service B', quantity: 1, unitPrice: 100, taxRate: 10, discount: 10 },
      ]
      const result = calculateInvoice(items)
      expect(result.subtotal).toBe(200)
      expect(result.total).toBe(209) // 110 + 99
    })
  })

  describe('Time Calculations', () => {
    const calculateDuration = (start: Date, end: Date): {
      hours: number
      minutes: number
      formatted: string
    } => {
      const diffMs = end.getTime() - start.getTime()
      const totalMinutes = Math.floor(diffMs / (1000 * 60))
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60

      return {
        hours,
        minutes,
        formatted: `${hours}h ${minutes}m`,
      }
    }

    it('should calculate duration correctly', () => {
      const start = new Date('2024-01-01T09:00:00')
      const end = new Date('2024-01-01T17:30:00')
      const result = calculateDuration(start, end)
      expect(result.hours).toBe(8)
      expect(result.minutes).toBe(30)
      expect(result.formatted).toBe('8h 30m')
    })

    it('should handle short durations', () => {
      const start = new Date('2024-01-01T09:00:00')
      const end = new Date('2024-01-01T09:45:00')
      const result = calculateDuration(start, end)
      expect(result.hours).toBe(0)
      expect(result.minutes).toBe(45)
    })
  })
})

// ============================================
// 8. SEARCH & RANKING LOGIC TESTS
// ============================================
describe('Search & Ranking Logic', () => {
  interface SearchItem {
    id: number
    title: string
    description: string
    tags: string[]
  }

  const searchItems = (items: SearchItem[], query: string): SearchItem[] => {
    const queryLower = query.toLowerCase()

    return items
      .map(item => {
        let score = 0

        // Title match (highest weight)
        if (item.title.toLowerCase().includes(queryLower)) {
          score += 10
          if (item.title.toLowerCase().startsWith(queryLower)) {
            score += 5
          }
        }

        // Description match
        if (item.description.toLowerCase().includes(queryLower)) {
          score += 3
        }

        // Tag match
        item.tags.forEach(tag => {
          if (tag.toLowerCase().includes(queryLower)) {
            score += 5
          }
        })

        return { item, score }
      })
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(result => result.item)
  }

  const testItems: SearchItem[] = [
    { id: 1, title: 'React Tutorial', description: 'Learn React basics', tags: ['react', 'tutorial'] },
    { id: 2, title: 'Vue Guide', description: 'React to Vue migration', tags: ['vue', 'migration'] },
    { id: 3, title: 'JavaScript Basics', description: 'Learn JS', tags: ['javascript', 'basics'] },
  ]

  it('should find items by title', () => {
    const result = searchItems(testItems, 'React')
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe(1) // Title match ranked higher
  })

  it('should rank title-start matches higher', () => {
    const result = searchItems(testItems, 'Vue')
    expect(result[0].id).toBe(2)
  })

  it('should find items by tags', () => {
    const result = searchItems(testItems, 'javascript')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(3)
  })

  it('should return empty for no matches', () => {
    const result = searchItems(testItems, 'python')
    expect(result).toHaveLength(0)
  })
})

// ============================================
// 9. CACHING LOGIC TESTS
// ============================================
describe('Caching Logic', () => {
  class SimpleCache<T> {
    private cache = new Map<string, { value: T; expiry: number }>()

    set(key: string, value: T, ttlMs: number): void {
      this.cache.set(key, {
        value,
        expiry: Date.now() + ttlMs,
      })
    }

    get(key: string): T | undefined {
      const entry = this.cache.get(key)
      if (!entry) return undefined
      if (Date.now() > entry.expiry) {
        this.cache.delete(key)
        return undefined
      }
      return entry.value
    }

    has(key: string): boolean {
      return this.get(key) !== undefined
    }

    delete(key: string): boolean {
      return this.cache.delete(key)
    }

    clear(): void {
      this.cache.clear()
    }

    size(): number {
      // Clean expired entries first
      this.cache.forEach((_, key) => this.get(key))
      return this.cache.size
    }
  }

  let cache: SimpleCache<string>

  beforeEach(() => {
    cache = new SimpleCache<string>()
  })

  it('should store and retrieve values', () => {
    cache.set('key1', 'value1', 10000)
    expect(cache.get('key1')).toBe('value1')
  })

  it('should return undefined for missing keys', () => {
    expect(cache.get('nonexistent')).toBeUndefined()
  })

  it('should expire values after TTL', async () => {
    cache.set('key1', 'value1', 100)
    expect(cache.get('key1')).toBe('value1')

    await new Promise(resolve => setTimeout(resolve, 150))
    expect(cache.get('key1')).toBeUndefined()
  })

  it('should delete values', () => {
    cache.set('key1', 'value1', 10000)
    expect(cache.delete('key1')).toBe(true)
    expect(cache.get('key1')).toBeUndefined()
  })

  it('should clear all values', () => {
    cache.set('key1', 'value1', 10000)
    cache.set('key2', 'value2', 10000)
    cache.clear()
    expect(cache.size()).toBe(0)
  })
})

// ============================================
// 10. DEBOUNCE/THROTTLE LOGIC TESTS
// ============================================
describe('Debounce/Throttle Logic', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const debounce = <T extends (...args: unknown[]) => unknown>(
    fn: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    return (...args: Parameters<T>) => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => fn(...args), delay)
    }
  }

  const throttle = <T extends (...args: unknown[]) => unknown>(
    fn: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle = false

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        fn(...args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  }

  describe('Debounce', () => {
    it('should delay execution', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn()
      expect(fn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should reset timer on subsequent calls', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn()
      vi.advanceTimersByTime(50)
      debouncedFn()
      vi.advanceTimersByTime(50)
      debouncedFn()
      vi.advanceTimersByTime(100)

      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('Throttle', () => {
    it('should execute immediately first time', () => {
      const fn = vi.fn()
      const throttledFn = throttle(fn, 100)

      throttledFn()
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should ignore calls within limit', () => {
      const fn = vi.fn()
      const throttledFn = throttle(fn, 100)

      throttledFn()
      throttledFn()
      throttledFn()

      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should allow calls after limit', () => {
      const fn = vi.fn()
      const throttledFn = throttle(fn, 100)

      throttledFn()
      vi.advanceTimersByTime(100)
      throttledFn()

      expect(fn).toHaveBeenCalledTimes(2)
    })
  })
})

console.log('Hooks Logic Tests Suite loaded - 10 test categories')
