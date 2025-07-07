import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { createClient } from '@supabase/supabase-js'
import { aiConfig } from '@/app/config/ai'

describe('AI Features', () => {
  let supabase: any

  beforeAll(() => {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )
  })

  afterAll(() => {
    supabase = null
  })

  it('should have valid AI configuration', () => {
    expect(aiConfig).toBeDefined()
    expect(aiConfig.models).toBeDefined()
    expect(aiConfig.providers).toBeDefined()
    expect(aiConfig.categories).toBeDefined()
  })

  it('should have valid model configurations', () => {
    expect(Array.isArray(aiConfig.models)).toBe(true)
    expect(aiConfig.models.length).toBeGreaterThan(0)
    aiConfig.models.forEach(model => {
      expect(model.id).toBeDefined()
      expect(model.name).toBeDefined()
      expect(model.provider).toBeDefined()
    })
  })

  it('should have valid provider configurations', () => {
    expect(Array.isArray(aiConfig.providers)).toBe(true)
    expect(aiConfig.providers.length).toBeGreaterThan(0)
    aiConfig.providers.forEach(provider => {
      expect(provider.id).toBeDefined()
      expect(provider.name).toBeDefined()
    })
  })

  it('should have valid category configurations', () => {
    expect(Array.isArray(aiConfig.categories)).toBe(true)
    expect(aiConfig.categories.length).toBeGreaterThan(0)
    aiConfig.categories.forEach(category => {
      expect(category.id).toBeDefined()
      expect(category.name).toBeDefined()
      expect(category.description).toBeDefined()
    })
  })
}) 