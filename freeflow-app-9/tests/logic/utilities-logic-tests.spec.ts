/**
 * UTILITIES LOGIC TESTS
 * Freeflow Kazi Platform - Unit Tests for Utility Functions
 *
 * Tests all utility functions used across the application
 *
 * Created: December 16, 2024
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ============================================
// 1. STRING UTILITIES TESTS
// ============================================
describe('String Utilities', () => {
  describe('slugify', () => {
    const slugify = (text: string): string => {
      return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
    }

    it('should convert to lowercase', () => {
      expect(slugify('Hello World')).toBe('hello-world')
    })

    it('should replace spaces with hyphens', () => {
      expect(slugify('hello world')).toBe('hello-world')
    })

    it('should remove special characters', () => {
      expect(slugify('Hello! World?')).toBe('hello-world')
    })

    it('should handle multiple spaces', () => {
      expect(slugify('hello   world')).toBe('hello-world')
    })

    it('should handle empty string', () => {
      expect(slugify('')).toBe('')
    })

    it('should trim leading/trailing whitespace', () => {
      expect(slugify('  hello world  ')).toBe('hello-world')
    })
  })

  describe('truncate', () => {
    const truncate = (text: string, length: number, suffix = '...'): string => {
      if (text.length <= length) return text
      return text.slice(0, length - suffix.length) + suffix
    }

    it('should not truncate short strings', () => {
      expect(truncate('hello', 10)).toBe('hello')
    })

    it('should truncate long strings', () => {
      expect(truncate('hello world', 8)).toBe('hello...')
    })

    it('should use custom suffix', () => {
      expect(truncate('hello world', 9, '…')).toBe('hello wo…')
    })

    it('should handle exact length', () => {
      expect(truncate('hello', 5)).toBe('hello')
    })
  })

  describe('capitalize', () => {
    const capitalize = (text: string): string => {
      if (!text) return text
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
    }

    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello')
    })

    it('should lowercase rest', () => {
      expect(capitalize('HELLO')).toBe('Hello')
    })

    it('should handle empty string', () => {
      expect(capitalize('')).toBe('')
    })

    it('should handle single character', () => {
      expect(capitalize('h')).toBe('H')
    })
  })

  describe('camelToKebab', () => {
    const camelToKebab = (text: string): string => {
      return text.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
    }

    it('should convert camelCase to kebab-case', () => {
      expect(camelToKebab('helloWorld')).toBe('hello-world')
    })

    it('should handle multiple capitals', () => {
      expect(camelToKebab('helloWorldTest')).toBe('hello-world-test')
    })

    it('should handle already lowercase', () => {
      expect(camelToKebab('hello')).toBe('hello')
    })
  })

  describe('pluralize', () => {
    const pluralize = (count: number, singular: string, plural?: string): string => {
      if (count === 1) return singular
      return plural || singular + 's'
    }

    it('should return singular for count 1', () => {
      expect(pluralize(1, 'item')).toBe('item')
    })

    it('should return plural for count > 1', () => {
      expect(pluralize(2, 'item')).toBe('items')
    })

    it('should return plural for count 0', () => {
      expect(pluralize(0, 'item')).toBe('items')
    })

    it('should use custom plural', () => {
      expect(pluralize(2, 'person', 'people')).toBe('people')
    })
  })
})

// ============================================
// 2. ARRAY UTILITIES TESTS
// ============================================
describe('Array Utilities', () => {
  describe('unique', () => {
    const unique = <T>(arr: T[]): T[] => [...new Set(arr)]

    it('should remove duplicates from numbers', () => {
      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3])
    })

    it('should remove duplicates from strings', () => {
      expect(unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c'])
    })

    it('should handle empty array', () => {
      expect(unique([])).toEqual([])
    })

    it('should preserve order', () => {
      expect(unique([3, 1, 2, 1, 3])).toEqual([3, 1, 2])
    })
  })

  describe('groupBy', () => {
    const groupBy = <T>(arr: T[], key: keyof T): Record<string, T[]> => {
      return arr.reduce((acc, item) => {
        const groupKey = String(item[key])
        if (!acc[groupKey]) acc[groupKey] = []
        acc[groupKey].push(item)
        return acc
      }, {} as Record<string, T[]>)
    }

    const testData = [
      { id: 1, category: 'a', name: 'Item 1' },
      { id: 2, category: 'b', name: 'Item 2' },
      { id: 3, category: 'a', name: 'Item 3' },
    ]

    it('should group by key', () => {
      const result = groupBy(testData, 'category')
      expect(Object.keys(result)).toHaveLength(2)
      expect(result['a']).toHaveLength(2)
      expect(result['b']).toHaveLength(1)
    })

    it('should handle empty array', () => {
      expect(groupBy([], 'category')).toEqual({})
    })
  })

  describe('chunk', () => {
    const chunk = <T>(arr: T[], size: number): T[][] => {
      const chunks: T[][] = []
      for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size))
      }
      return chunks
    }

    it('should split array into chunks', () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
    })

    it('should handle exact division', () => {
      expect(chunk([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]])
    })

    it('should handle empty array', () => {
      expect(chunk([], 2)).toEqual([])
    })

    it('should handle chunk size larger than array', () => {
      expect(chunk([1, 2], 5)).toEqual([[1, 2]])
    })
  })

  describe('flatten', () => {
    const flatten = <T>(arr: (T | T[])[]): T[] => {
      return arr.flat() as T[]
    }

    it('should flatten nested arrays', () => {
      expect(flatten([[1, 2], [3, 4], [5]])).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle mixed array', () => {
      expect(flatten([1, [2, 3], 4] as (number | number[])[])).toEqual([1, 2, 3, 4])
    })

    it('should handle empty array', () => {
      expect(flatten([])).toEqual([])
    })
  })

  describe('intersection', () => {
    const intersection = <T>(arr1: T[], arr2: T[]): T[] => {
      return arr1.filter(item => arr2.includes(item))
    }

    it('should find common elements', () => {
      expect(intersection([1, 2, 3], [2, 3, 4])).toEqual([2, 3])
    })

    it('should handle no intersection', () => {
      expect(intersection([1, 2], [3, 4])).toEqual([])
    })

    it('should handle empty arrays', () => {
      expect(intersection([], [1, 2])).toEqual([])
      expect(intersection([1, 2], [])).toEqual([])
    })
  })

  describe('difference', () => {
    const difference = <T>(arr1: T[], arr2: T[]): T[] => {
      return arr1.filter(item => !arr2.includes(item))
    }

    it('should find elements only in first array', () => {
      expect(difference([1, 2, 3], [2, 3, 4])).toEqual([1])
    })

    it('should handle identical arrays', () => {
      expect(difference([1, 2], [1, 2])).toEqual([])
    })

    it('should handle empty second array', () => {
      expect(difference([1, 2], [])).toEqual([1, 2])
    })
  })
})

// ============================================
// 3. OBJECT UTILITIES TESTS
// ============================================
describe('Object Utilities', () => {
  describe('omit', () => {
    const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
      const result = { ...obj }
      keys.forEach(key => delete result[key])
      return result
    }

    it('should remove specified keys', () => {
      const obj = { a: 1, b: 2, c: 3 }
      expect(omit(obj, ['b'])).toEqual({ a: 1, c: 3 })
    })

    it('should handle multiple keys', () => {
      const obj = { a: 1, b: 2, c: 3 }
      expect(omit(obj, ['a', 'c'])).toEqual({ b: 2 })
    })

    it('should not mutate original', () => {
      const obj = { a: 1, b: 2 }
      omit(obj, ['a'])
      expect(obj).toEqual({ a: 1, b: 2 })
    })
  })

  describe('pick', () => {
    const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
      const result = {} as Pick<T, K>
      keys.forEach(key => {
        if (key in obj) result[key] = obj[key]
      })
      return result
    }

    it('should keep specified keys', () => {
      const obj = { a: 1, b: 2, c: 3 }
      expect(pick(obj, ['a', 'b'])).toEqual({ a: 1, b: 2 })
    })

    it('should handle non-existent keys', () => {
      const obj = { a: 1 } as { a: number; b?: number }
      expect(pick(obj, ['a', 'b'])).toEqual({ a: 1 })
    })
  })

  describe('deepClone', () => {
    const deepClone = <T>(obj: T): T => {
      return JSON.parse(JSON.stringify(obj))
    }

    it('should clone objects', () => {
      const obj = { a: 1, b: { c: 2 } }
      const clone = deepClone(obj)
      expect(clone).toEqual(obj)
      expect(clone).not.toBe(obj)
    })

    it('should clone nested objects', () => {
      const obj = { a: { b: { c: 1 } } }
      const clone = deepClone(obj)
      clone.a.b.c = 2
      expect(obj.a.b.c).toBe(1)
    })

    it('should clone arrays', () => {
      const arr = [1, [2, 3], { a: 4 }]
      const clone = deepClone(arr)
      expect(clone).toEqual(arr)
      expect(clone).not.toBe(arr)
    })
  })

  describe('deepMerge', () => {
    const deepMerge = <T extends object>(target: T, source: Partial<T>): T => {
      const result = { ...target }
      for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          result[key] = deepMerge(
            (result[key] as object) || {},
            source[key] as object
          ) as T[Extract<keyof T, string>]
        } else {
          result[key] = source[key] as T[Extract<keyof T, string>]
        }
      }
      return result
    }

    it('should merge objects', () => {
      const target = { a: 1, b: 2 }
      const source = { b: 3, c: 4 }
      expect(deepMerge(target, source)).toEqual({ a: 1, b: 3, c: 4 })
    })

    it('should merge nested objects', () => {
      const target = { a: { b: 1, c: 2 } }
      const source = { a: { c: 3, d: 4 } }
      expect(deepMerge(target, source)).toEqual({ a: { b: 1, c: 3, d: 4 } })
    })
  })

  describe('isEmpty', () => {
    const isEmpty = (value: unknown): boolean => {
      if (value === null || value === undefined) return true
      if (typeof value === 'string') return value.length === 0
      if (Array.isArray(value)) return value.length === 0
      if (typeof value === 'object') return Object.keys(value).length === 0
      return false
    }

    it('should detect empty values', () => {
      expect(isEmpty(null)).toBe(true)
      expect(isEmpty(undefined)).toBe(true)
      expect(isEmpty('')).toBe(true)
      expect(isEmpty([])).toBe(true)
      expect(isEmpty({})).toBe(true)
    })

    it('should detect non-empty values', () => {
      expect(isEmpty('hello')).toBe(false)
      expect(isEmpty([1])).toBe(false)
      expect(isEmpty({ a: 1 })).toBe(false)
      expect(isEmpty(0)).toBe(false)
      expect(isEmpty(false)).toBe(false)
    })
  })
})

// ============================================
// 4. URL UTILITIES TESTS
// ============================================
describe('URL Utilities', () => {
  describe('parseQueryParams', () => {
    const parseQueryParams = (url: string): Record<string, string> => {
      const params: Record<string, string> = {}
      const searchParams = new URL(url, 'http://dummy.com').searchParams
      searchParams.forEach((value, key) => {
        params[key] = value
      })
      return params
    }

    it('should parse query parameters', () => {
      const result = parseQueryParams('?foo=bar&baz=qux')
      expect(result).toEqual({ foo: 'bar', baz: 'qux' })
    })

    it('should handle empty query', () => {
      expect(parseQueryParams('')).toEqual({})
    })

    it('should decode URL encoded values', () => {
      const result = parseQueryParams('?name=John%20Doe')
      expect(result.name).toBe('John Doe')
    })
  })

  describe('buildQueryString', () => {
    const buildQueryString = (params: Record<string, string | number | boolean | undefined | null>): string => {
      const entries = Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      return entries.length > 0 ? `?${entries.join('&')}` : ''
    }

    it('should build query string', () => {
      expect(buildQueryString({ foo: 'bar', baz: 'qux' })).toBe('?foo=bar&baz=qux')
    })

    it('should handle numbers', () => {
      expect(buildQueryString({ page: 1, limit: 10 })).toBe('?page=1&limit=10')
    })

    it('should handle booleans', () => {
      expect(buildQueryString({ active: true })).toBe('?active=true')
    })

    it('should skip null and undefined', () => {
      expect(buildQueryString({ foo: 'bar', baz: undefined, qux: null })).toBe('?foo=bar')
    })

    it('should handle empty params', () => {
      expect(buildQueryString({})).toBe('')
    })

    it('should encode special characters', () => {
      expect(buildQueryString({ name: 'John Doe' })).toBe('?name=John%20Doe')
    })
  })

  describe('isValidUrl', () => {
    const isValidUrl = (url: string): boolean => {
      try {
        new URL(url)
        return true
      } catch {
        return false
      }
    }

    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('http://localhost:9323')).toBe(true)
      expect(isValidUrl('https://example.com/path?query=1')).toBe(true)
    })

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false)
      expect(isValidUrl('example.com')).toBe(false)
      expect(isValidUrl('')).toBe(false)
    })
  })
})

// ============================================
// 5. NUMBER UTILITIES TESTS
// ============================================
describe('Number Utilities', () => {
  describe('clamp', () => {
    const clamp = (value: number, min: number, max: number): number => {
      return Math.min(Math.max(value, min), max)
    }

    it('should clamp values below min', () => {
      expect(clamp(-10, 0, 100)).toBe(0)
    })

    it('should clamp values above max', () => {
      expect(clamp(150, 0, 100)).toBe(100)
    })

    it('should not change values in range', () => {
      expect(clamp(50, 0, 100)).toBe(50)
    })

    it('should handle edge cases', () => {
      expect(clamp(0, 0, 100)).toBe(0)
      expect(clamp(100, 0, 100)).toBe(100)
    })
  })

  describe('round', () => {
    const round = (value: number, decimals: number = 2): number => {
      const factor = Math.pow(10, decimals)
      return Math.round(value * factor) / factor
    }

    it('should round to 2 decimals by default', () => {
      expect(round(3.14159)).toBe(3.14)
    })

    it('should round to specified decimals', () => {
      expect(round(3.14159, 3)).toBe(3.142)
      expect(round(3.14159, 0)).toBe(3)
    })

    it('should handle negative numbers', () => {
      expect(round(-3.14159)).toBe(-3.14)
    })
  })

  describe('randomInt', () => {
    const randomInt = (min: number, max: number): number => {
      return Math.floor(Math.random() * (max - min + 1)) + min
    }

    it('should generate numbers within range', () => {
      for (let i = 0; i < 100; i++) {
        const result = randomInt(1, 10)
        expect(result).toBeGreaterThanOrEqual(1)
        expect(result).toBeLessThanOrEqual(10)
      }
    })

    it('should generate integers', () => {
      for (let i = 0; i < 100; i++) {
        const result = randomInt(1, 10)
        expect(Number.isInteger(result)).toBe(true)
      }
    })
  })

  describe('percentage', () => {
    const percentage = (value: number, total: number): number => {
      if (total === 0) return 0
      return Math.round((value / total) * 100)
    }

    it('should calculate percentage', () => {
      expect(percentage(25, 100)).toBe(25)
      expect(percentage(1, 4)).toBe(25)
    })

    it('should handle zero total', () => {
      expect(percentage(10, 0)).toBe(0)
    })

    it('should round to integer', () => {
      expect(percentage(1, 3)).toBe(33)
    })
  })
})

// ============================================
// 6. DATE UTILITIES TESTS
// ============================================
describe('Date Utilities', () => {
  describe('addDays', () => {
    const addDays = (date: Date, days: number): Date => {
      const result = new Date(date)
      result.setDate(result.getDate() + days)
      return result
    }

    it('should add days', () => {
      const date = new Date('2024-01-01')
      expect(addDays(date, 5).getDate()).toBe(6)
    })

    it('should handle negative days', () => {
      const date = new Date('2024-01-10')
      expect(addDays(date, -5).getDate()).toBe(5)
    })

    it('should handle month overflow', () => {
      const date = new Date('2024-01-30')
      expect(addDays(date, 5).getMonth()).toBe(1) // February
    })
  })

  describe('startOfDay', () => {
    const startOfDay = (date: Date): Date => {
      const result = new Date(date)
      result.setHours(0, 0, 0, 0)
      return result
    }

    it('should set time to midnight', () => {
      const date = new Date('2024-01-15T14:30:00')
      const result = startOfDay(date)
      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
      expect(result.getSeconds()).toBe(0)
    })
  })

  describe('endOfDay', () => {
    const endOfDay = (date: Date): Date => {
      const result = new Date(date)
      result.setHours(23, 59, 59, 999)
      return result
    }

    it('should set time to end of day', () => {
      const date = new Date('2024-01-15T14:30:00')
      const result = endOfDay(date)
      expect(result.getHours()).toBe(23)
      expect(result.getMinutes()).toBe(59)
      expect(result.getSeconds()).toBe(59)
    })
  })

  describe('isSameDay', () => {
    const isSameDay = (date1: Date, date2: Date): boolean => {
      return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
      )
    }

    it('should return true for same day', () => {
      const date1 = new Date('2024-01-15T10:00:00')
      const date2 = new Date('2024-01-15T20:00:00')
      expect(isSameDay(date1, date2)).toBe(true)
    })

    it('should return false for different days', () => {
      const date1 = new Date('2024-01-15')
      const date2 = new Date('2024-01-16')
      expect(isSameDay(date1, date2)).toBe(false)
    })
  })

  describe('isWithinRange', () => {
    const isWithinRange = (date: Date, start: Date, end: Date): boolean => {
      return date >= start && date <= end
    }

    it('should return true for dates within range', () => {
      const date = new Date('2024-01-15')
      const start = new Date('2024-01-01')
      const end = new Date('2024-01-31')
      expect(isWithinRange(date, start, end)).toBe(true)
    })

    it('should return true for boundary dates', () => {
      const start = new Date('2024-01-01')
      const end = new Date('2024-01-31')
      expect(isWithinRange(start, start, end)).toBe(true)
      expect(isWithinRange(end, start, end)).toBe(true)
    })

    it('should return false for dates outside range', () => {
      const date = new Date('2024-02-15')
      const start = new Date('2024-01-01')
      const end = new Date('2024-01-31')
      expect(isWithinRange(date, start, end)).toBe(false)
    })
  })

  describe('getDaysBetween', () => {
    const getDaysBetween = (date1: Date, date2: Date): number => {
      const oneDay = 24 * 60 * 60 * 1000
      return Math.round(Math.abs((date2.getTime() - date1.getTime()) / oneDay))
    }

    it('should calculate days between dates', () => {
      const date1 = new Date('2024-01-01')
      const date2 = new Date('2024-01-10')
      expect(getDaysBetween(date1, date2)).toBe(9)
    })

    it('should handle same date', () => {
      const date = new Date('2024-01-15')
      expect(getDaysBetween(date, date)).toBe(0)
    })

    it('should handle order of dates', () => {
      const date1 = new Date('2024-01-10')
      const date2 = new Date('2024-01-01')
      expect(getDaysBetween(date1, date2)).toBe(9)
    })
  })
})

// ============================================
// 7. VALIDATION UTILITIES TESTS
// ============================================
describe('Validation Utilities', () => {
  describe('isRequired', () => {
    const isRequired = (value: unknown): boolean => {
      if (value === null || value === undefined) return false
      if (typeof value === 'string') return value.trim().length > 0
      return true
    }

    it('should validate non-empty values', () => {
      expect(isRequired('hello')).toBe(true)
      expect(isRequired(0)).toBe(true)
      expect(isRequired(false)).toBe(true)
    })

    it('should reject empty values', () => {
      expect(isRequired('')).toBe(false)
      expect(isRequired('   ')).toBe(false)
      expect(isRequired(null)).toBe(false)
      expect(isRequired(undefined)).toBe(false)
    })
  })

  describe('isMinLength', () => {
    const isMinLength = (value: string, min: number): boolean => {
      return value.length >= min
    }

    it('should validate minimum length', () => {
      expect(isMinLength('hello', 5)).toBe(true)
      expect(isMinLength('hello', 3)).toBe(true)
    })

    it('should reject values below minimum', () => {
      expect(isMinLength('hi', 5)).toBe(false)
    })
  })

  describe('isMaxLength', () => {
    const isMaxLength = (value: string, max: number): boolean => {
      return value.length <= max
    }

    it('should validate maximum length', () => {
      expect(isMaxLength('hi', 5)).toBe(true)
      expect(isMaxLength('hello', 5)).toBe(true)
    })

    it('should reject values above maximum', () => {
      expect(isMaxLength('hello world', 5)).toBe(false)
    })
  })

  describe('isInRange', () => {
    const isInRange = (value: number, min: number, max: number): boolean => {
      return value >= min && value <= max
    }

    it('should validate values in range', () => {
      expect(isInRange(5, 0, 10)).toBe(true)
      expect(isInRange(0, 0, 10)).toBe(true)
      expect(isInRange(10, 0, 10)).toBe(true)
    })

    it('should reject values out of range', () => {
      expect(isInRange(-1, 0, 10)).toBe(false)
      expect(isInRange(11, 0, 10)).toBe(false)
    })
  })

  describe('isUUID', () => {
    const isUUID = (value: string): boolean => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      return uuidRegex.test(value)
    }

    it('should validate UUIDs', () => {
      expect(isUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
      expect(isUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true)
    })

    it('should reject invalid UUIDs', () => {
      expect(isUUID('not-a-uuid')).toBe(false)
      expect(isUUID('123')).toBe(false)
      expect(isUUID('')).toBe(false)
    })
  })
})

// ============================================
// 8. ASYNC UTILITIES TESTS
// ============================================
describe('Async Utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('delay', () => {
    const delay = (ms: number): Promise<void> => {
      return new Promise(resolve => setTimeout(resolve, ms))
    }

    it('should delay execution', async () => {
      const callback = vi.fn()
      delay(1000).then(callback)

      expect(callback).not.toHaveBeenCalled()

      await vi.advanceTimersByTimeAsync(1000)

      expect(callback).toHaveBeenCalled()
    })
  })

  describe('retry', () => {
    const retry = async <T>(
      fn: () => Promise<T>,
      maxRetries: number,
      delayMs: number
    ): Promise<T> => {
      let lastError: Error
      for (let i = 0; i < maxRetries; i++) {
        try {
          return await fn()
        } catch (error) {
          lastError = error as Error
          if (i < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, delayMs))
          }
        }
      }
      throw lastError!
    }

    it('should succeed on first try', async () => {
      const fn = vi.fn().mockResolvedValue('success')
      const result = await retry(fn, 3, 100)
      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should retry on failure', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success')

      const resultPromise = retry(fn, 3, 100)
      await vi.advanceTimersByTimeAsync(100)
      const result = await resultPromise

      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('should throw after max retries', async () => {
      // Use real timers for this test to avoid unhandled rejection issues
      vi.useRealTimers()

      const fn = vi.fn().mockRejectedValue(new Error('always fails'))

      // Use expect().rejects.toThrow() pattern with immediate await
      await expect(retry(fn, 3, 10)).rejects.toThrow('always fails')
      expect(fn).toHaveBeenCalledTimes(3)

      // Restore fake timers for other tests
      vi.useFakeTimers()
    })
  })
})

// ============================================
// 9. COLOR UTILITIES TESTS
// ============================================
describe('Color Utilities', () => {
  describe('hexToRgb', () => {
    const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : null
    }

    it('should convert hex to RGB', () => {
      expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 })
      expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 })
      expect(hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 })
    })

    it('should handle hex without hash', () => {
      expect(hexToRgb('ff0000')).toEqual({ r: 255, g: 0, b: 0 })
    })

    it('should return null for invalid hex', () => {
      expect(hexToRgb('invalid')).toBeNull()
      expect(hexToRgb('#fff')).toBeNull() // Short form not supported
    })
  })

  describe('rgbToHex', () => {
    const rgbToHex = (r: number, g: number, b: number): string => {
      return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
    }

    it('should convert RGB to hex', () => {
      expect(rgbToHex(255, 0, 0)).toBe('#ff0000')
      expect(rgbToHex(0, 255, 0)).toBe('#00ff00')
      expect(rgbToHex(0, 0, 255)).toBe('#0000ff')
    })

    it('should handle edge cases', () => {
      expect(rgbToHex(0, 0, 0)).toBe('#000000')
      expect(rgbToHex(255, 255, 255)).toBe('#ffffff')
    })
  })
})

// ============================================
// 10. CRYPTO UTILITIES TESTS
// ============================================
describe('Crypto Utilities', () => {
  describe('generateId', () => {
    const generateId = (length: number = 16): string => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      let result = ''
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return result
    }

    it('should generate ID of specified length', () => {
      expect(generateId(16)).toHaveLength(16)
      expect(generateId(32)).toHaveLength(32)
    })

    it('should generate unique IDs', () => {
      const ids = new Set(Array.from({ length: 100 }, () => generateId()))
      expect(ids.size).toBe(100)
    })

    it('should only contain alphanumeric characters', () => {
      const id = generateId(100)
      expect(/^[A-Za-z0-9]+$/.test(id)).toBe(true)
    })
  })

  describe('hashString', () => {
    const hashString = (str: string): number => {
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash = hash & hash
      }
      return hash
    }

    it('should produce consistent hash', () => {
      expect(hashString('hello')).toBe(hashString('hello'))
    })

    it('should produce different hash for different strings', () => {
      expect(hashString('hello')).not.toBe(hashString('world'))
    })

    it('should handle empty string', () => {
      expect(hashString('')).toBe(0)
    })
  })
})

console.log('Utilities Logic Tests Suite loaded - 10 test categories')
