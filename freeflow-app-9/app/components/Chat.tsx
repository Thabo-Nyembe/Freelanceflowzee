import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useRef, useEffect } from 'react'

// Example Weather component for tool part rendering
function Weather({ city, weather, status }: { city: string; weather?: { temp: number; condition: string }; status: string }) {
  if (status === 'loading') {
    return <div>Fetching weather for <b>{city}</b>...</div>
  }
  if (status === 'success' && weather) {
    return <div>Weather in <b>{city}</b>: {weather.temp}°C, {weather.condition}</div>
  }
  return null
}

export function Chat() {
  const {
    messages,
    sendMessage,
    isLoading,
    input,
    handleInputChange,
    error,
  } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    maxSteps: 5,
  })

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isLoading])

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'assistant' ? 'justify-start' : 'justify-end'
            }`}
          >
            <div
              className={`rounded-lg px-4 py-2 max-w-[80%] ${
                message.role === 'assistant'
                  ? 'bg-gray-100'
                  : 'bg-blue-500 text-white'
              }`}
            >
              {/* Render main content */}
              {message.content && <div>{message.content}</div>}

              {/* Render tool parts (e.g., weather) */}
              {message.parts &&
                message.parts
                  .filter((part) => part.type === 'data-weather')
                  .map((part, idx) => (
                    <Weather
                      key={idx}
                      city={part.data.city}
                      weather={part.data.weather}
                      status={part.data.status}
                    />
                  ))}

              {/* Render other custom parts (e.g., citations) */}
              {message.parts &&
                message.parts
                  .filter((part) => part.type === 'source-url')
                  .map((part, idx) => (
                    <div key={idx} className="mt-2 text-xs text-blue-700 underline">
                      <a href={part.url} target="_blank" rel="noopener noreferrer">
                        {part.title || part.url}
                      </a>
                    </div>
                  ))}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          if (input.trim()) {
            await sendMessage({ content: input })
          }
        }}
        className="flex gap-2 mt-4"
      >
        <input
          ref={inputRef}
          className="flex-1 border rounded px-3 py-2"
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={isLoading || !input.trim()}
        >
          Send
        </button>
      </form>
      {error && <div className="text-red-500 text-sm">{error.message}</div>}
    </div>
  )
} 