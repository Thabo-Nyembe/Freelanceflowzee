import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import { aiConfig } from '@/app/config/ai'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

describe('AI Features', () => {
  let authToken: string

  beforeAll(async () => {
    const { data: { session } } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'test123',
    })
    authToken = session?.access_token || ''
  })

  afterAll(async () => {
    await supabase.auth.signOut()
  })

  describe('Chat API', () => {
    it('should return a valid response', async () => {
      const response = await fetch('http://localhost:3000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: 'Hello, how are you?' },
          ],
        }),
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.message).toBeTruthy()
    })
  })

  describe('Analyze API', () => {
    it('should return valid analysis results', async () => {
      const response = await fetch('http://localhost:3000/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.results)).toBe(true)
      expect(data.results.length).toBeGreaterThan(0)

      const firstResult = data.results[0]
      expect(firstResult).toHaveProperty('category')
      expect(firstResult).toHaveProperty('score')
      expect(firstResult).toHaveProperty('insights')
      expect(firstResult).toHaveProperty('recommendations')
    })
  })

  describe('Generate API', () => {
    it('should generate text content', async () => {
      const response = await fetch('http://localhost:3000/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          prompt: 'Write a short story about a robot learning to paint.',
          type: 'text',
        }),
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.content).toBeTruthy()
      expect(data.model).toBe(aiConfig.models.generate)
    })

    it('should generate code content', async () => {
      const response = await fetch('http://localhost:3000/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          prompt: 'Write a React component that displays a counter.',
          type: 'code',
        }),
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.content).toBeTruthy()
      expect(data.model).toBe(aiConfig.models.generate)
    })

    it('should generate image content', async () => {
      const response = await fetch('http://localhost:3000/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          prompt: 'A beautiful sunset over a mountain landscape.',
          type: 'image',
        }),
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.content).toMatch(/^https:\/\//)
      expect(data.model).toBe('dall-e-3')
    })
  })
}) 