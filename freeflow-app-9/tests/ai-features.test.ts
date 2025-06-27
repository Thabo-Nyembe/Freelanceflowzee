import { describe, it, expect, beforeAll, afterAll } from &apos;vitest&apos;
import { createClient } from &apos;@supabase/supabase-js&apos;
import { aiConfig } from &apos;@/app/config/ai&apos;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

describe(&apos;AI Features&apos;, () => {
  let authToken: string

  beforeAll(async () => {
    const { data: { session } } = await supabase.auth.signInWithPassword({
      email: &apos;test@example.com&apos;,
      password: &apos;test123&apos;,
    })
    authToken = session?.access_token || '&apos;'
  })

  afterAll(async () => {
    await supabase.auth.signOut()
  })

  describe(&apos;Chat API&apos;, () => {
    it(&apos;should return a valid response&apos;, async () => {
      const response = await fetch(&apos;http://localhost:3000/api/ai/chat&apos;, {
        method: &apos;POST&apos;,
        headers: {
          &apos;Content-Type&apos;: &apos;application/json&apos;,
          &apos;Authorization&apos;: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          messages: [
            { role: &apos;user&apos;, content: &apos;Hello, how are you?&apos; },
          ],
        }),
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.message).toBeTruthy()
    })
  })

  describe(&apos;Analyze API&apos;, () => {
    it(&apos;should return valid analysis results&apos;, async () => {
      const response = await fetch(&apos;http://localhost:3000/api/ai/analyze&apos;, {
        method: &apos;POST&apos;,
        headers: {
          &apos;Content-Type&apos;: &apos;application/json&apos;,
          &apos;Authorization&apos;: `Bearer ${authToken}`,
        },
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.results)).toBe(true)
      expect(data.results.length).toBeGreaterThan(0)

      const firstResult = data.results[0]
      expect(firstResult).toHaveProperty(&apos;category&apos;)
      expect(firstResult).toHaveProperty(&apos;score&apos;)
      expect(firstResult).toHaveProperty(&apos;insights&apos;)
      expect(firstResult).toHaveProperty(&apos;recommendations&apos;)
    })
  })

  describe(&apos;Generate API&apos;, () => {
    it(&apos;should generate text content&apos;, async () => {
      const response = await fetch(&apos;http://localhost:3000/api/ai/generate&apos;, {
        method: &apos;POST&apos;,
        headers: {
          &apos;Content-Type&apos;: &apos;application/json&apos;,
          &apos;Authorization&apos;: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          prompt: &apos;Write a short story about a robot learning to paint.&apos;,
          type: &apos;text&apos;,
        }),
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.content).toBeTruthy()
      expect(data.model).toBe(aiConfig.models.generate)
    })

    it(&apos;should generate code content&apos;, async () => {
      const response = await fetch(&apos;http://localhost:3000/api/ai/generate&apos;, {
        method: &apos;POST&apos;,
        headers: {
          &apos;Content-Type&apos;: &apos;application/json&apos;,
          &apos;Authorization&apos;: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          prompt: &apos;Write a React component that displays a counter.&apos;,
          type: &apos;code&apos;,
        }),
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.content).toBeTruthy()
      expect(data.model).toBe(aiConfig.models.generate)
    })

    it(&apos;should generate image content&apos;, async () => {
      const response = await fetch(&apos;http://localhost:3000/api/ai/generate&apos;, {
        method: &apos;POST&apos;,
        headers: {
          &apos;Content-Type&apos;: &apos;application/json&apos;,
          &apos;Authorization&apos;: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          prompt: &apos;A beautiful sunset over a mountain landscape.&apos;,
          type: &apos;image&apos;,
        }),
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.content).toMatch(/^https:\/\//)
      expect(data.model).toBe(&apos;dall-e-3&apos;)
    })
  })
}) 