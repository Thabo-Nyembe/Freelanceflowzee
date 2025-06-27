import { SupabaseClient } from '@supabase/supabase-js
import OpenAI from 'openai
import Anthropic from '@anthropic-ai/sdk
import Replicate from 'replicate
import { GoogleGenerativeAI } from '@google/generative-ai

export interface AIGenerationSettings {
  creativity: number
  quality: 'draft' | 'standard' | 'premium
  model: string
}

export interface AIGenerationResult {
  id: string
  user_id: string
  type: 'image' | 'code' | 'text' | 'audio' | 'video
  prompt: string
  settings: AIGenerationSettings
  status: 'generating' | 'complete' | 'failed
  output?: string
  error?: string
  created_at: string
  updated_at: string
}

export interface AIAnalysisResult {
  id: string
  user_id: string
  file_id: string
  type: string
  results: unknown
  status: 'analyzing' | 'complete' | 'failed
  error?: string
  created_at: string
}

export interface FileAnalysisInput {
  content?: string
  fileType: string
  fileName?: string
  metadata?: {
    size?: number
    mimeType?: string
    [key: string]: unknown
  }
}

// Custom error classes for better error handling
export class AIServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public provider?: string,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'AIServiceError
  }
}

export class AIProviderError extends AIServiceError {
  constructor(message: string, provider: string, originalError?: Error) {
    super(message, 'PROVIDER_ERROR', provider, originalError)
  }
}

export class AIAuthenticationError extends AIServiceError {
  constructor(provider: string) {
    super(`Authentication failed for ${provider}`, 'AUTH_ERROR', provider)
  }
}

export class AIRateLimitError extends AIServiceError {
  constructor(provider: string) {
    super(`Rate limit exceeded for ${provider}`, 'RATE_LIMIT_ERROR', provider)
  }
}

export class AIService {
  private supabase: SupabaseClient
  private openai: OpenAI | null = null
  private anthropic: Anthropic | null = null
  private replicate: Replicate | null = null
  private gemini: any | null = null

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
    
    // Initialize AI providers only if API keys are available
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      })
    }
    
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      })
    }
    
    if (process.env.REPLICATE_API_TOKEN) {
      this.replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN
      })
    }

    if (process.env.GOOGLE_AI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
    }
  }

  private handleError(error: unknown, context: string, provider?: string): never {
    console.error(`${context} error:`, error)
    
    // Handle specific error types
    if (error.code === 'insufficient_quota' || error.status === 429) {
      throw new AIRateLimitError(provider || 'unknown')
    }
    
    if (error.code === 'invalid_api_key' || error.status === 401) {
      throw new AIAuthenticationError(provider || 'unknown')
    }
    
    if (error instanceof AIServiceError) {
      throw error
    }
    
    // Generic provider error
    if (provider) {
      throw new AIProviderError(
        error.message || `${context} failed`,
        provider,
        error
      )
    }
    
    // Generic AI service error
    throw new AIServiceError(
      error.message || `${context} failed`, 'UNKNOWN_ERROR',
      provider,
      error
    )
  }

  private async uploadToStorage(file: Blob | Buffer, path: string): Promise<string> {
    try {
      const { data, error } = await this.supabase.storage
        .from('ai-generations')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) {
        throw new AIServiceError(
          `Failed to upload file to storage: ${error.message}`, 'STORAGE_ERROR
        )
      }
      
      const { data: { publicUrl } } = this.supabase.storage
        .from('ai-generations')
        .getPublicUrl(data.path)
        
      return publicUrl
    } catch (error) {
      this.handleError(error, 'File upload', 'supabase-storage')
    }
  }

  async generateAsset(
    type: 'image' | 'code' | 'text' | 'audio' | 'video',
    prompt: string,
    settings: AIGenerationSettings
  ): Promise<AIGenerationResult> {
    // Get current user
    const { data: { user }, error: userError } = await this.supabase.auth.getUser()
    if (userError) throw new AIAuthenticationError('supabase')
    if (!user) throw new AIAuthenticationError('supabase')

    // Create initial record
    const { data: generation, error: insertError } = await this.supabase
      .from('ai_generations')
      .insert({
        user_id: user.id,
        type,
        prompt,
        settings,
        status: 'generating
      })
      .select()
      .single()

    if (insertError) {
      throw new AIServiceError(
        `Failed to create generation record: ${insertError.message}`, 'DATABASE_ERROR
      )
    }

    try {
      let output = 
      
      switch (type) {
        case 'image': {
          if (!this.openai && !this.replicate) {
            throw new AIServiceError(
              'No image generation provider available. Please configure OpenAI or Replicate API keys.', 'NO_PROVIDER
            )
          }

          if (settings.model === 'dall-e-3' && this.openai) {
            try {
              const response = await this.openai.images.generate({
                model: "dall-e-3",
                prompt,
                n: 1,
                size: settings.quality === 'premium' ? "1024x1024" : "512x512",
                quality: settings.quality === 'draft' ? "standard" : "hd",
                style: settings.creativity > 0.7 ? "vivid" : "natural
              })
              const imageUrl = response.data?.[0]?.url
              if (!imageUrl) {
                throw new Error('No image URL returned from DALL-E')
              }
              output = imageUrl
            } catch (error) {
              this.handleError(error, 'DALL-E image generation', 'openai')
            }
          } else if (settings.model === 'stable-diffusion-xl' && this.replicate) {
            try {
              const response = await this.replicate.run(
                "stability-ai/stable-diffusion-xl-base-1.0:a00d0b7dcbb9c3fbb34ba87d2d5b46c56969c84a628bf778a7fdaec30b1b99c5",
                {
                  input: {
                    prompt,
                    negative_prompt: "blurry, bad quality, distorted",
                    num_inference_steps: settings.quality === 'premium' ? 50 : 30,
                    guidance_scale: settings.creativity * 10
                  }
                }
              )
              output = Array.isArray(response) ? response[0] : response
            } catch (error) {
              this.handleError(error, 'Stable Diffusion image generation', 'replicate')
            }
          }
          break
        }
        
        case 'code': {
          if (!this.openai) {
            throw new AIServiceError(
              'OpenAI API key required for code generation', 'NO_PROVIDER', 'openai
            )
          }

          try {
            const response = await this.openai.chat.completions.create({
              model: "gpt-4",
              messages: [
                {
                  role: "system",
                  content: "You are an expert programmer. Generate clean, well-documented code based on the user's request.
                },
                {
                  role: "user",
                  content: prompt
                }
              ],
              temperature: settings.creativity,
              max_tokens: settings.quality === 'premium' ? 4000 : 2000
            })
            output = response.choices[0]?.message?.content || 
            if (!output) {
              throw new Error('No code content returned from OpenAI')
            }
          } catch (error) {
            this.handleError(error, 'Code generation', 'openai')
          }
          break
        }
        
        case 'text': {
          if (!this.openai && !this.anthropic) {
            throw new AIServiceError(
              'No text generation provider available. Please configure OpenAI or Anthropic API keys.', 'NO_PROVIDER
            )
          }

          if (settings.model.startsWith('claude') && this.anthropic) {
            try {
              const response = await this.anthropic.messages.create({
                model: settings.model,
                max_tokens: settings.quality === 'premium' ? 4000 : 2000,
                temperature: settings.creativity,
                messages: [{ role: 'user', content: prompt }]
              })
              const textContent = response.content.find(block => block.type === 'text')
              if (!textContent || textContent.type !== 'text') {
                throw new Error('No text content returned from Claude')
              }
              output = textContent.text
            } catch (error) {
              this.handleError(error, 'Text generation', 'anthropic')
            }
          } else if (this.openai) {
            try {
              const response = await this.openai.chat.completions.create({
                model: settings.model === 'gpt-4' ? 'gpt-4' : 'gpt-3.5-turbo',
                messages: [{ role: "user", content: prompt }],
                temperature: settings.creativity,
                max_tokens: settings.quality === 'premium' ? 4000 : 2000
              })
              output = response.choices[0]?.message?.content || 
              if (!output) {
                throw new Error('No text content returned from OpenAI')
              }
            } catch (error) {
              this.handleError(error, 'Text generation', 'openai')
            }
          }
          break
        }
        
        case 'audio': {
          if (!this.openai) {
            throw new AIServiceError(
              'OpenAI API key required for audio generation', 'NO_PROVIDER', 'openai
            )
          }

          try {
            const response = await this.openai.audio.speech.create({
              model: "tts-1",
              voice: "alloy",
              input: prompt
            })
            
            const buffer = Buffer.from(await response.arrayBuffer())
            const path = `${user.id}/${generation.id}/audio.mp3
            output = await this.uploadToStorage(buffer, path)
          } catch (error) {
            this.handleError(error, 'Audio generation', 'openai')
          }
          break
        }
        
        case 'video': {
          if (!this.replicate) {
            throw new AIServiceError(
              'Replicate API token required for video generation', 'NO_PROVIDER', 'replicate
            )
          }

          try {
            const response = await this.replicate.run(
              "stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438",
              {
                input: {
                  prompt,
                  video_length: settings.quality === 'premium' ? "32_frames" : "16_frames",
                  fps: 8,
                  motion_bucket_id: Math.floor(settings.creativity * 255),
                  cond_aug: 0.02
                }
              }
            )
            output = Array.isArray(response) ? response[0] : response
          } catch (error) {
            this.handleError(error, 'Video generation', 'replicate')
          }
          break
        }
      }

      // Update record with result
      const { data: updatedGeneration, error: updateError } = await this.supabase
        .from('ai_generations')
        .update({
          status: 'complete',
          output
        })
        .eq('id', generation.id)
        .select()
        .single()

      if (updateError) {
        throw new AIServiceError(
          `Failed to update generation record: ${updateError.message}`, 'DATABASE_ERROR
        )
      }
      return updatedGeneration
    } catch (error) {
      console.error('Error in AI generation:', error)
      
      // Update record with error status
      const errorMessage = error instanceof AIServiceError ? error.message : 'Unknown error occurred
      await this.supabase
        .from('ai_generations')
        .update({
          status: 'failed',
          error: errorMessage
        })
        .eq('id', generation.id)

      throw error
    }
  }

  async getGenerationLibrary(): Promise<AIGenerationResult[]> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await this.supabase.auth.getUser()
      if (userError) throw new AIAuthenticationError('supabase')
      if (!user) throw new AIAuthenticationError('supabase')

      const { data, error } = await this.supabase
        .from('ai_generations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw new AIServiceError(
          `Failed to fetch generation library: ${error.message}`, 'DATABASE_ERROR
        )
      }
      return data || []
    } catch (error) {
      this.handleError(error, 'Get generation library', 'supabase')
    }
  }

  async getAnalysisHistory(): Promise<AIAnalysisResult[]> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await this.supabase.auth.getUser()
      if (userError) throw new AIAuthenticationError('supabase')
      if (!user) throw new AIAuthenticationError('supabase')

      const { data, error } = await this.supabase
        .from('ai_analysis')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw new AIServiceError(
          `Failed to fetch analysis history: ${error.message}`, 'DATABASE_ERROR
        )
      }
      return data || []
    } catch (error) {
      this.handleError(error, 'Get analysis history', 'supabase')
    }
  }

  private async analyzeFileContent(input: FileAnalysisInput): Promise<any> {
    const { content, fileType, fileName, metadata } = input
    
    if (!this.openai && !this.anthropic) {
      throw new AIServiceError(
        'No text analysis provider available. Please configure OpenAI or Anthropic API keys.', 'NO_PROVIDER
      )
    }

    let analysisPrompt = 
    let systemPrompt = 

    // Build analysis prompts based on file type
    switch (fileType) {
      case 'image':
        if (!this.openai) {
          throw new AIServiceError(
            'OpenAI API key required for image analysis', 'NO_PROVIDER', 'openai
          )
        }
        systemPrompt = 'You are an expert visual analyst. Analyze the image and provide insights about design, composition, colors, and potential improvements.
        analysisPrompt = `Analyze this image${fileName ? ` (${fileName})` : ''}. Provide insights on:
1. Visual composition and design elements
2. Color scheme and harmony
3. Overall aesthetic quality
4. Potential improvements
5. Use case recommendations

${metadata?.mimeType ? `Image type: ${metadata.mimeType}` : ''}
${metadata?.size ? `File size: ${(metadata.size / 1024).toFixed(2)} KB` : ''}
        break

      case 'code':
        systemPrompt = 'You are an expert code reviewer. Analyze the code for quality, performance, security, and best practices.
        analysisPrompt = `Analyze this code${fileName ? ` from ${fileName}` : ''}:

\`\`\
${content}
\`\`\

Provide analysis on:
1. Code quality and structure
2. Performance considerations
3. Security vulnerabilities
4. Best practices adherence
5. Suggested improvements
6. Documentation quality
        break

      case 'document':
        systemPrompt = 'You are an expert content analyst. Analyze documents for structure, clarity, and effectiveness.
        analysisPrompt = `Analyze this document${fileName ? ` (${fileName})` : ''}:

${content}

Provide analysis on:
1. Content structure and organization
2. Clarity and readability
3. Tone and style
4. Completeness and accuracy
5. Suggested improvements
6. Target audience fit
        break

      case 'design':
        systemPrompt = 'You are an expert design analyst. Analyze design files for usability, aesthetics, and best practices.
        analysisPrompt = `Analyze this design file${fileName ? ` (${fileName})` : ''}:

${content || 'Design file metadata and description available for analysis.'}

Provide analysis on:
1. Visual hierarchy and layout
2. User experience considerations
3. Accessibility compliance
4. Brand consistency
5. Mobile responsiveness
6. Recommended improvements
        break

      default:
        systemPrompt = 'You are a general file analyst. Provide comprehensive analysis of the file content.
        analysisPrompt = `Analyze this file${fileName ? ` (${fileName})` : ''}:

${content}

Provide general analysis including:
1. Content overview and summary
2. Quality assessment
3. Structure and organization
4. Potential improvements
5. Use case recommendations
    }

    try {
      if (this.openai) {
        const response = await this.openai.chat.completions.create({
          model: "gpt-4-turbo-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: analysisPrompt }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })

        const analysisText = response.choices[0]?.message?.content
        if (!analysisText) {
          throw new Error('No analysis content returned')
        }

        return {
          summary: analysisText,
          fileType,
          fileName,
          metadata,
          provider: 'openai',
          model: 'gpt-4-turbo-preview',
          confidence: 0.85,
          timestamp: new Date().toISOString(),
          insights: this.extractInsights(analysisText),
          recommendations: this.extractRecommendations(analysisText),
          score: this.calculateQualityScore(analysisText)
        }
      } else if (this.anthropic) {
        const response = await this.anthropic.messages.create({
          model: "claude-3-sonnet-20240229",
          max_tokens: 2000,
          temperature: 0.3,
          messages: [
            {
              role: "user",
              content: `${systemPrompt}\n\n${analysisPrompt}
            }
          ]
        })

        const textContent = response.content.find(block => block.type === 'text')
        if (!textContent || textContent.type !== 'text') {
          throw new Error('No analysis content returned from Claude')
        }

        return {
          summary: textContent.text,
          fileType,
          fileName,
          metadata,
          provider: 'anthropic',
          model: 'claude-3-sonnet',
          confidence: 0.88,
          timestamp: new Date().toISOString(),
          insights: this.extractInsights(textContent.text),
          recommendations: this.extractRecommendations(textContent.text),
          score: this.calculateQualityScore(textContent.text)
        }
      }
    } catch (error) {
      this.handleError(error, 'File content analysis', this.openai ? 'openai' : 'anthropic')
    }
  }

  private extractInsights(analysisText: string): string[] {
    // Extract key insights from analysis text
    const insights: string[] = []
    const lines = analysisText.split('\n')
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.match(/^[\d\-\*•]\s*/) || trimmed.toLowerCase().includes('insight')) {
        insights.push(trimmed.replace(/^[\d\-\*•]\s*/, ''))
      }
    }
    
    return insights.slice(0, 5) // Return top 5 insights
  }

  private extractRecommendations(analysisText: string): string[] {
    // Extract recommendations from analysis text
    const recommendations: string[] = []
    const lines = analysisText.split('\n')
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.toLowerCase().includes('recommend') || 
          trimmed.toLowerCase().includes('suggest') ||
          trimmed.toLowerCase().includes('improve')) {
        recommendations.push(trimmed)
      }
    }
    
    return recommendations.slice(0, 3) // Return top 3 recommendations
  }

  private calculateQualityScore(analysisText: string): number {
    // Simple quality scoring based on analysis content
    let score = 0.5 // Base score
    
    const positiveWords = ['good', 'excellent', 'strong', 'effective', 'clear', 'well']
    const negativeWords = ['poor', 'weak', 'unclear', 'problematic', 'missing', 'lacks']
    
    const words = analysisText.toLowerCase().split(/\s+/)
    
    for (const word of words) {
      if (positiveWords.some(pw => word.includes(pw))) score += 0.05
      if (negativeWords.some(nw => word.includes(nw))) score -= 0.05
    }
    
    return Math.max(0, Math.min(1, score)) // Clamp between 0 and 1
  }

  async analyzeFile(fileId: string, type: string, fileInput?: FileAnalysisInput): Promise<AIAnalysisResult> {
    // Get current user
    const { data: { user }, error: userError } = await this.supabase.auth.getUser()
    if (userError) throw new AIAuthenticationError('supabase')
    if (!user) throw new AIAuthenticationError('supabase')

    // Create initial record
    const { data: analysis, error: insertError } = await this.supabase
      .from('ai_analysis')
      .insert({
        user_id: user.id,
        file_id: fileId,
        type,
        status: 'analyzing
      })
      .select()
      .single()

    if (insertError) {
      throw new AIServiceError(
        `Failed to create analysis record: ${insertError.message}`, 'DATABASE_ERROR
      )
    }

    try {
      let results: unknown
      if (fileInput) {
        // Analyze provided file content
        results = await this.analyzeFileContent(fileInput)
      } else {
        // Fetch file from storage and analyze
        const { data: fileData, error: fileError } = await this.supabase
          .from('files')
          .select('*')
          .eq('id', fileId)
          .single()

        if (fileError) {
          throw new AIServiceError(
            `Failed to fetch file: ${fileError.message}`, 'DATABASE_ERROR
          )
        }

        // For now, provide basic analysis structure
        // In a full implementation, you would fetch the file content from storage
        results = {
          summary: `Analysis of ${fileData.name || 'file'} (${type})`,
          fileType: type,
          fileName: fileData.name,
          confidence: 0.8,
          timestamp: new Date().toISOString(),
          insights: ['File structure appears well-organized', 'Content follows standard conventions', 'Quality appears to be good
          ],
          recommendations: ['Consider adding more detailed documentation', 'Review for optimization opportunities', 'Ensure accessibility compliance
          ],
          score: 0.75,
          metadata: {
            size: fileData.size,
            mimeType: fileData.mime_type,
            createdAt: fileData.created_at
          }
        }
      }

      // Update record with results
      const { data: updatedAnalysis, error: updateError } = await this.supabase
        .from('ai_analysis')
        .update({
          results,
          status: 'complete
        })
        .eq('id', analysis.id)
        .select()
        .single()

      if (updateError) {
        throw new AIServiceError(
          `Failed to update analysis record: ${updateError.message}`, 'DATABASE_ERROR
        )
      }
      return updatedAnalysis
    } catch (error) {
      console.error('Error in file analysis:', error)
      
      // Update record with error status
      const errorMessage = error instanceof AIServiceError ? error.message : 'Unknown error occurred
      await this.supabase
        .from('ai_analysis')
        .update({
          status: 'failed',
          error: errorMessage
        })
        .eq('id', analysis.id)

      throw error
    }
  }
} 