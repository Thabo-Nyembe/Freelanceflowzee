/**
 * AI CREATE A++++ - STREAMING GENERATION UTILITY
 *
 * Provides real-time token streaming for AI content generation.
 * Enhances user experience with immediate feedback and progressive rendering.
 *
 * Features:
 * - Server-Sent Events (SSE) support
 * - Progressive content buffering
 * - Streaming metrics tracking
 * - Cancellation support
 * - Token-by-token rendering
 * - Error recovery during streaming
 *
 * @example
 * ```typescript
 * const stream = await startStreamingGeneration({
 *   model: 'gpt-4o-mini',
 *   prompt: 'Write a blog post...',
 *   onToken: (token) => setContent(prev => prev + token),
 *   onComplete: (final) => console.log('Done:', final),
 *   onError: (error) => console.error(error)
 * })
 *
 * // Later, if needed:
 * stream.cancel()
 * ```
 */

// ============================================================================
// TYPES
// ============================================================================

export interface StreamingConfig {
  model: string
  prompt: string
  temperature?: number
  maxTokens?: number
  onToken?: (token: string, metrics: StreamingMetrics) => void
  onComplete?: (content: string, metrics: StreamingMetrics) => void
  onError?: (error: Error) => void
  onProgress?: (progress: StreamingProgress) => void
}

export interface StreamingMetrics {
  tokensGenerated: number
  tokensPerSecond: number
  elapsedTime: number
  estimatedCompletion: number
}

export interface StreamingProgress {
  percentage: number
  stage: 'connecting' | 'streaming' | 'completing' | 'done' | 'error'
  currentSpeed: number
}

export interface StreamingController {
  cancel: () => void
  pause: () => void
  resume: () => void
  getMetrics: () => StreamingMetrics
}

interface StreamChunk {
  type: 'token' | 'complete' | 'error' | 'metadata'
  content?: string
  data?: any
  error?: string
}

// ============================================================================
// STREAMING ENGINE
// ============================================================================

/**
 * Starts a streaming generation session
 *
 * @param config - Streaming configuration
 * @returns Controller for managing the stream
 */
export async function startStreamingGeneration(
  config: StreamingConfig
): Promise<StreamingController> {
  const abortController = new AbortController()
  let isPaused = false
  let pauseBuffer: string[] = []

  const metrics: StreamingMetrics = {
    tokensGenerated: 0,
    tokensPerSecond: 0,
    elapsedTime: 0,
    estimatedCompletion: 0
  }

  const startTime = Date.now()
  let fullContent = ''

  // Start the streaming request
  const streamPromise = fetch('/api/ai/generate-stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      prompt: config.prompt,
      temperature: config.temperature || 0.7,
      maxTokens: config.maxTokens || 2000,
      stream: true
    }),
    signal: abortController.signal
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    if (!response.body) {
      throw new Error('Response body is null')
    }

    // Update progress: connected
    config.onProgress?.({
      percentage: 5,
      stage: 'streaming',
      currentSpeed: 0
    })

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          // Update progress: completing
          config.onProgress?.({
            percentage: 95,
            stage: 'completing',
            currentSpeed: metrics.tokensPerSecond
          })
          break
        }

        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(line => line.trim())

        for (const line of lines) {
          // Parse SSE format
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6)

            if (jsonStr === '[DONE]') {
              continue
            }

            try {
              const parsed: StreamChunk = JSON.parse(jsonStr)

              if (parsed.type === 'token' && parsed.content) {
                // Handle pause
                if (isPaused) {
                  pauseBuffer.push(parsed.content)
                  continue
                }

                // Update metrics
                metrics.tokensGenerated++
                metrics.elapsedTime = Date.now() - startTime
                metrics.tokensPerSecond = metrics.tokensGenerated / (metrics.elapsedTime / 1000)

                if (config.maxTokens && metrics.tokensPerSecond > 0) {
                  const remainingTokens = config.maxTokens - metrics.tokensGenerated
                  metrics.estimatedCompletion = remainingTokens / metrics.tokensPerSecond
                }

                // Accumulate content
                fullContent += parsed.content

                // Notify callback
                config.onToken?.(parsed.content, { ...metrics })

                // Update progress
                if (config.maxTokens) {
                  const percentage = Math.min(90, (metrics.tokensGenerated / config.maxTokens) * 100)
                  config.onProgress?.({
                    percentage,
                    stage: 'streaming',
                    currentSpeed: metrics.tokensPerSecond
                  })
                }
              } else if (parsed.type === 'complete') {
                // Final update
                config.onProgress?.({
                  percentage: 100,
                  stage: 'done',
                  currentSpeed: metrics.tokensPerSecond
                })
                config.onComplete?.(fullContent, { ...metrics })
              } else if (parsed.type === 'error') {
                throw new Error(parsed.error || 'Unknown streaming error')
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE chunk:', parseError)
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // User cancelled - not an error
        return
      }
      throw error
    } finally {
      reader.releaseLock()
    }
  }).catch((error) => {
    config.onProgress?.({
      percentage: 0,
      stage: 'error',
      currentSpeed: 0
    })
    config.onError?.(error)
  })

  // Return controller
  return {
    cancel: () => {
      abortController.abort()
    },
    pause: () => {
      isPaused = true
    },
    resume: () => {
      isPaused = false
      // Flush pause buffer
      if (pauseBuffer.length > 0) {
        const buffered = pauseBuffer.join('')
        pauseBuffer = []
        fullContent += buffered
        config.onToken?.(buffered, { ...metrics })
      }
    },
    getMetrics: () => ({ ...metrics })
  }
}

// ============================================================================
// SIMULATED STREAMING (FOR DEVELOPMENT/FALLBACK)
// ============================================================================

/**
 * Simulates streaming for testing or when real streaming is unavailable
 * Splits content into tokens and emits them progressively
 *
 * @param content - Full content to simulate streaming
 * @param config - Streaming configuration
 * @returns Controller for managing the simulated stream
 */
export async function simulateStreaming(
  content: string,
  config: Omit<StreamingConfig, 'prompt' | 'model'>
): Promise<StreamingController> {
  let isCancelled = false
  let isPaused = false

  const metrics: StreamingMetrics = {
    tokensGenerated: 0,
    tokensPerSecond: 0,
    elapsedTime: 0,
    estimatedCompletion: 0
  }

  const startTime = Date.now()

  // Split content into "tokens" (words and punctuation)
  const tokens = tokenizeContent(content)
  const totalTokens = tokens.length
  const tokensPerBatch = 3 // Emit 3 tokens at a time
  const delayMs = 50 // 50ms between batches = ~60 tokens/sec

  // Start simulation
  const simulatePromise = (async () => {
    config.onProgress?.({
      percentage: 5,
      stage: 'streaming',
      currentSpeed: 0
    })

    for (let i = 0; i < tokens.length; i += tokensPerBatch) {
      if (isCancelled) break

      // Wait if paused
      while (isPaused && !isCancelled) {
        await sleep(100)
      }

      if (isCancelled) break

      // Get batch of tokens
      const batch = tokens.slice(i, i + tokensPerBatch).join('')

      // Update metrics
      metrics.tokensGenerated = Math.min(i + tokensPerBatch, totalTokens)
      metrics.elapsedTime = Date.now() - startTime
      metrics.tokensPerSecond = metrics.tokensGenerated / (metrics.elapsedTime / 1000)

      const remainingTokens = totalTokens - metrics.tokensGenerated
      metrics.estimatedCompletion = remainingTokens / (metrics.tokensPerSecond || 1)

      // Emit batch
      config.onToken?.(batch, { ...metrics })

      // Update progress
      const percentage = Math.min(90, (metrics.tokensGenerated / totalTokens) * 90)
      config.onProgress?.({
        percentage,
        stage: 'streaming',
        currentSpeed: metrics.tokensPerSecond
      })

      // Wait before next batch
      await sleep(delayMs)
    }

    if (!isCancelled) {
      // Complete
      config.onProgress?.({
        percentage: 100,
        stage: 'done',
        currentSpeed: metrics.tokensPerSecond
      })
      config.onComplete?.(content, { ...metrics })
    }
  })()

  return {
    cancel: () => {
      isCancelled = true
    },
    pause: () => {
      isPaused = true
    },
    resume: () => {
      isPaused = false
    },
    getMetrics: () => ({ ...metrics })
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Tokenizes content into words and punctuation for simulation
 */
function tokenizeContent(content: string): string[] {
  // Split on word boundaries and punctuation
  const tokens: string[] = []
  let current = ''

  for (const char of content) {
    if (/\s/.test(char)) {
      if (current) {
        tokens.push(current)
        current = ''
      }
      tokens.push(char)
    } else if (/[.,!?;:]/.test(char)) {
      if (current) {
        tokens.push(current)
        current = ''
      }
      tokens.push(char)
    } else {
      current += char
    }
  }

  if (current) {
    tokens.push(current)
  }

  return tokens
}

/**
 * Sleep utility for delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ============================================================================
// STREAMING BUFFER MANAGER
// ============================================================================

/**
 * Manages buffering for smooth rendering
 * Prevents UI jank by batching rapid token updates
 */
export class StreamingBuffer {
  private buffer: string = ''
  private lastFlush: number = Date.now()
  private flushInterval: number = 50 // Flush every 50ms
  private onFlush: (content: string) => void
  private timerId: NodeJS.Timeout | null = null

  constructor(onFlush: (content: string) => void, flushInterval: number = 50) {
    this.onFlush = onFlush
    this.flushInterval = flushInterval
  }

  /**
   * Add token to buffer
   */
  add(token: string): void {
    this.buffer += token

    // Auto-flush if interval elapsed
    if (Date.now() - this.lastFlush >= this.flushInterval) {
      this.flush()
    } else if (!this.timerId) {
      // Schedule flush
      this.timerId = setTimeout(() => {
        this.flush()
      }, this.flushInterval)
    }
  }

  /**
   * Force flush buffer
   */
  flush(): void {
    if (this.buffer) {
      this.onFlush(this.buffer)
      this.buffer = ''
      this.lastFlush = Date.now()
    }
    if (this.timerId) {
      clearTimeout(this.timerId)
      this.timerId = null
    }
  }

  /**
   * Clear buffer without flushing
   */
  clear(): void {
    this.buffer = ''
    if (this.timerId) {
      clearTimeout(this.timerId)
      this.timerId = null
    }
  }
}

// ============================================================================
// EXPORT DEFAULTS
// ============================================================================

export const DEFAULT_STREAMING_CONFIG = {
  temperature: 0.7,
  maxTokens: 2000,
  tokensPerBatch: 3,
  delayMs: 50,
  bufferInterval: 50
}
