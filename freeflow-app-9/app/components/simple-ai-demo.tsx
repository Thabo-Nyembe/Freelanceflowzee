'use client'

import { useState } from 'react'

interface AIResponse {
  content: string
  suggestions: string[]
  actionItems: Array<{
    title: string
    action: string
    priority: string
    estimatedTime: string
    impact: string
  }>
  confidence: number
}

export function SimpleAIDemo() {
  const [input, setInput] = useState('')
  const [response, setResponse] = useState<AIResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: input }]
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await res.json()
      setResponse(data)
      setInput('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  const quickPrompts = [
    "Help me optimize my freelance revenue",
    "Analyze my project management workflow",
    "Suggest client communication improvements",
    "Create a productivity plan for this week"
  ]

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px',
        borderRadius: '20px',
        color: 'white',
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '32px' }}>
          🤖 FreeflowZee AI Assistant
        </h1>
        <p style={{ margin: '0', fontSize: '18px', opacity: 0.9 }}>
          AI SDK v5 Integration • Business Optimization • Smart Analytics
        </p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '15px' }}>💡 Quick Actions</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '10px',
          marginBottom: '20px'
        }}>
          {quickPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => setInput(prompt)}
              style={{
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: '10px',
                background: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#667eea'
                e.currentTarget.style.background = '#f8f9ff'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0'
                e.currentTarget.style.background = 'white'
              }}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about optimizing your freelance business..."
            style={{
              flex: 1,
              padding: '15px',
              border: '2px solid #e0e0e0',
              borderRadius: '10px',
              fontSize: '16px',
              outline: 'none'
            }}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            style={{
              padding: '15px 25px',
              background: isLoading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {isLoading ? '⏳' : 'Ask AI'}
          </button>
        </div>
      </form>

      {error && (
        <div style={{
          padding: '15px',
          background: '#fee',
          border: '1px solid #fcc',
          borderRadius: '10px',
          color: '#c00',
          marginBottom: '20px'
        }}>
          ❌ Error: {error}
        </div>
      )}

      {response && (
        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '15px',
          border: '1px solid #e0e0e0',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#333', marginBottom: '15px' }}>🎯 AI Response</h3>
            <div style={{ 
              lineHeight: '1.6', 
              color: '#555',
              whiteSpace: 'pre-wrap'
            }}>
              {response.content}
            </div>
          </div>

          {response.suggestions && response.suggestions.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#667eea', marginBottom: '10px' }}>💡 Suggestions</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {response.suggestions.map((suggestion, index) => (
                  <span
                    key={index}
                    style={{
                      background: '#f0f2ff',
                      color: '#667eea',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      border: '1px solid #e0e6ff'
                    }}
                  >
                    {suggestion}
                  </span>
                ))}
              </div>
            </div>
          )}

          {response.actionItems && response.actionItems.length > 0 && (
            <div style={{ marginBottom: '15px' }}>
              <h4 style={{ color: '#667eea', marginBottom: '10px' }}>⚡ Action Items</h4>
              <div style={{ display: 'grid', gap: '10px' }}>
                {response.actionItems.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      background: '#f8f9ff',
                      padding: '15px',
                      borderRadius: '10px',
                      border: '1px solid #e0e6ff'
                    }}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                      {item.title}
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#666',
                      display: 'flex',
                      gap: '15px',
                      flexWrap: 'wrap'
                    }}>
                      <span>⏱️ {item.estimatedTime}</span>
                      <span>🎯 {item.priority} priority</span>
                      <span>📈 {item.impact} impact</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {response.confidence !== undefined && (
            <div style={{ 
              fontSize: '14px', 
              color: '#888',
              textAlign: 'right'
            }}>
              ✨ Confidence: {Math.round(response.confidence * 100)}%
            </div>
          )}
        </div>
      )}
    </div>
  )
} 