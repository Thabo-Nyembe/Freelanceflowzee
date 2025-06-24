'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      role: 'user',
      content: input,
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()
      
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.message,
        },
      ])
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col space-y-4 max-h-[600px] overflow-y-auto p-4">
        {messages.map((message, index) => (
          <Card key={index} className={`p-4 ${message.role === 'user' ? 'bg-primary/10' : 'bg-secondary/10'}`}>
            <p className="text-sm font-medium mb-2">{message.role === 'user' ? 'You' : 'AI'}</p>
            <p className="text-sm">{message.content}</p>
          </Card>
        ))}
      </div>

      <div className="flex space-x-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <Button onClick={sendMessage} disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </div>
  )
} 