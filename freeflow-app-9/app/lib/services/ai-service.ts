import { SupabaseClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import Replicate from 'replicate'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('AI-Service')

export interface AIGenerationSettings {
  creativity: number
  quality: 'draft' | 'standard' | 'premium'
  model: string
}

export interface AIGenerationResult {
  id: string
  user_id: string
  type: 'image' | 'code' | 'text' | 'audio' | 'video'
  prompt: string
  settings: AIGenerationSettings
  status: 'generating' | 'complete' | 'failed'
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
  status: 'analyzing' | 'complete' | 'failed'
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
    this.name = 'AIServiceError'
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
  private gemini: GoogleGenerativeAI | null = null

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

  private handleError(error, context: string, provider?: string): never {
    logger.error(`${context} error`, {
      context,
      provider,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })

    if (typeof error === 'object' && error !== null) {
      const err = error as Record<string, unknown>
      if (err.code === 'insufficient_quota' || err.status === 429) {
        throw new AIRateLimitError(provider || 'unknown')
      }
      
      if (err.code === 'invalid_api_key' || err.status === 401) {
        throw new AIAuthenticationError(provider || 'unknown')
      }
    }
    
    if (error instanceof AIServiceError) {
      throw error
    }

    const message = error instanceof Error ? error.message : `${context} failed`
    const originalError = error instanceof Error ? error : new Error(message)
    
    // Generic provider error
    if (provider) {
      throw new AIProviderError(
        message,
        provider,
        originalError
      )
    }
    
    // Generic AI service error
    throw new AIServiceError(
      message, 'UNKNOWN_ERROR',
      provider,
      originalError
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
          `Failed to upload file to storage: ${error.message}`, 'STORAGE_ERROR'
        )
      }
      
      const { data: { publicUrl } } = this.supabase.storage
        .from('ai-generations')
        .getPublicUrl(data!.path)
        
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
        status: 'generating'
      })
      .select()
      .single()

    if (insertError) {
      throw new AIServiceError(
        `Failed to create generation record: ${insertError.message}`, 'DATABASE_ERROR'
      )
    }

    try {
      let output = ''
      
      switch (type) {
        case 'image': {
          if (!this.openai && !this.replicate) {
            throw new AIServiceError(
              'No image generation provider available. Please configure OpenAI or Replicate API keys.', 'NO_PROVIDER'
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
                style: settings.creativity > 0.7 ? 'vivid' : 'natural'
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
              if (Array.isArray(response) && typeof response[0] === 'string') {
                output = response[0]
              } else if (typeof response === 'string') {
                output = response
              } else {
                throw new AIProviderError(
                  `Unexpected image generation output format from Replicate: ${JSON.stringify(response)}`, 'replicate'
                )
              }
            } catch (error) {
              this.handleError(error, 'Stable Diffusion image generation', 'replicate')
            }
          }
          break
        }
        
        case 'code': {
          if (!this.anthropic && !this.openai && !this.gemini) {
            throw new AIServiceError(
              'No code generation provider available. Please configure Anthropic, OpenAI, or Gemini API keys.', 'NO_PROVIDER'
            )
          }

          if (settings.model.startsWith('claude') && this.anthropic) {
            try {
              const response = await this.anthropic.messages.create({
                model: settings.model,
                max_tokens: 2048,
                messages: [{ role: 'user', content: prompt }],
                temperature: settings.creativity,
              })
              if (response.content[0].type === 'text') {
                output = response.content[0].text
              }
            } catch (error) {
              this.handleError(error, 'Anthropic code generation', 'anthropic')
            }
          } else if (settings.model.startsWith('gpt') && this.openai) {
            try {
              const response = await this.openai.chat.completions.create({
                model: "gpt-4-turbo-preview",
                messages: [
                  {
                    role: "system",
                    content: "You are an expert programmer. Generate clean, well-documented code based on the user's request."
                  },
                  {
                    role: "user",
                    content: prompt,
                  },
                ],
              })
              output = response.choices[0].message?.content || ''
            } catch (error) {
              this.handleError(error, 'OpenAI code generation', 'openai')
            }
          } else if (settings.model.startsWith('gemini') && this.gemini) {
            try {
              const model = this.gemini.getGenerativeModel({ model: settings.model })
              const result = await model.generateContent(prompt)
              const response = await result.response
              output = response.text()
            } catch (error) {
              this.handleError(error, 'Gemini code generation', 'gemini')
            }
          }
          break
        }
        
        case 'text': {
          if (!this.anthropic && !this.openai && !this.gemini) {
            throw new AIServiceError(
              'No text generation provider available. Please configure Anthropic, OpenAI, or Gemini API keys.', 'NO_PROVIDER'
            )
          }

          if (settings.model.startsWith('gemini') && this.gemini) {
            try {
              const model = this.gemini.getGenerativeModel({ model: settings.model })
              const result = await model.generateContent(prompt)
              const response = await result.response
              output = response.text()
            } catch (error) {
              this.handleError(error, 'Gemini text generation', 'gemini')
            }
          } else if (settings.model.startsWith('claude') && this.anthropic) {
            try {
              const msg = await this.anthropic.messages.create({
                model: settings.model,
                max_tokens: 1024,
                messages: [{ role: "user", content: prompt }],
              });
              const contentBlock = msg.content[0];
              if (contentBlock.type === 'text') {
                output = contentBlock.text;
              }
            } catch (error) {
              this.handleError(error, 'Text generation', 'anthropic')
            }
          } else if (this.openai) {
            try {
              const response = await this.openai.chat.completions.create({
                model: "gpt-4-turbo-preview",
                messages: [{ role: 'user', content: prompt }],
                temperature: settings.creativity,
              })
              output = response.choices[0].message?.content || ''
            } catch (error) {
              this.handleError(error, 'Text generation', 'openai')
            }
          }
          break
        }
        
        case 'audio': {
          if (!this.replicate) {
            throw new AIServiceError(
              'Replicate API token required for audio generation', 'NO_PROVIDER', 'replicate'
            )
          }
          try {
            const response = await this.replicate.run(
              "anotherjesse/musicgen:8b1e32e389d3d33560f1b40283c48a7d656096538051a82910772183181a179b",
              {
                input: {
                  model_version: "stereo-large",
                  prompt,
                  duration: settings.quality === 'premium' ? 15 : 8,
                },
              }
            );
            if (typeof response === 'string') {
              output = response
            } else {
               throw new AIProviderError(
                `Unexpected audio generation output format from Replicate: ${JSON.stringify(response)}`, 'replicate'
              )
            }
          } catch (error) {
            this.handleError(error, 'Audio generation', 'replicate')
          }
          break
        }
        
        case 'video': {
          if (!this.replicate) {
            throw new AIServiceError(
              'Replicate API token required for video generation', 'NO_PROVIDER', 'replicate'
            )
          }
          try {
            const response = await this.replicate.run(
              "anotherjesse/zeroscope-v2-xl:9f747673945c62801b13b84704378c1273730437d645a90963ad5c4656963162",
              {
                input: {
                  prompt,
                  num_frames: 24,
                  fps: 24,
                },
              }
            )
            if (Array.isArray(response) && typeof response[0] === 'string') {
              output = response[0]
            } else if (typeof response === 'string') {
              output = response
            } else {
              throw new AIProviderError(
                `Unexpected video generation output format from Replicate: ${JSON.stringify(
                  response
                )}`,
                'replicate'
              )
            }
          } catch (error) {
            this.handleError(error, 'Video generation', 'replicate')
          }
          break
        }
      }

      // Update record with completed status and output
      const { data: updatedGeneration, error: updateError } = await this.supabase
        .from('ai_generations')
        .update({
          status: 'complete',
          output: output,
          updated_at: new Date().toISOString()
        })
        .eq('id', generation.id)
        .select()
        .single()

      if (updateError) {
        throw new AIServiceError(
          `Failed to update generation record: ${updateError.message}`, 'DATABASE_ERROR'
        )
      }
      return updatedGeneration
    } catch (error) {
      logger.error('Error in AI generation', {
        generationId: generation.id,
        type,
        prompt: prompt.substring(0, 100),
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })

      // Update record with error status
      await this.supabase
        .from('ai_generations')
        .update({
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          updated_at: new Date().toISOString()
        })
        .eq('id', generation.id)

      this.handleError(error, 'AI Generation')
    }
  }

  async getGenerationLibrary(): Promise<AIGenerationResult[]> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new AIAuthenticationError('supabase')

    const { data, error } = await this.supabase
      .from('ai_generations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      throw new AIServiceError(
        `Failed to fetch generation library: ${error.message}`, 'DATABASE_ERROR'
      )
    }

    return data
  }

  async getAnalysisHistory(): Promise<AIAnalysisResult[]> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new AIAuthenticationError('supabase')
    
    const { data, error } = await this.supabase
      .from('file_analysis')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
      
    if (error) {
      throw new AIServiceError(
        `Failed to fetch analysis history: ${error.message}`, 'DATABASE_ERROR'
      )
    }

    return data
  }

  private async analyzeFileContent(input: FileAnalysisInput): Promise<string> {
    const { content, fileType, fileName } = input;
    
    if (!this.openai && !this.anthropic) {
      throw new AIServiceError(
        'No text analysis provider available. Please configure OpenAI or Anthropic API keys.', 'NO_PROVIDER'
      )
    }

    let analysisPrompt = ''
    let systemPrompt = ''

    // Build analysis prompts based on file type
    switch (fileType) {
      case 'image':
        {
          if (!this.openai) {
            throw new AIServiceError(
              'OpenAI API key required for image analysis', 'NO_PROVIDER', 'openai'
            )
          }
          systemPrompt = 'You are an expert visual analyst. Analyze the image and provide insights about design, composition, colors, and potential improvements.'
          analysisPrompt = `Analyze this image${fileName ? ` (${fileName})` : ''}. Provide insights on:
  1. Visual composition and design elements
  2. Color palette and usage
  3. Emotional tone and messaging
  4. Potential improvements
`
        }
        break;

      case 'code':
        systemPrompt = 'You are an expert code reviewer. Analyze the code for quality, performance, security, and best practices.'
        analysisPrompt = `Analyze this code${fileName ? ` from ${fileName}` : ''}:

\`\`\`
${content}
\`\`\`

Provide analysis on:
  1. Code quality and readability
  2. Performance considerations
  3. Potential security vulnerabilities
  4. Adherence to best practices
`
        break;

      case 'document':
        systemPrompt = 'You are an expert content analyst. Analyze documents for structure, clarity, and effectiveness.'
        analysisPrompt = `Analyze this document${fileName ? ` (${fileName})` : ''}:

${content}

Provide analysis on:
  1. Clarity and conciseness
  2. Grammatical correctness
  3. Overall structure and flow
  4. Tone and voice
  5. Key takeaways and summary
`
        break;

      case 'design':
        systemPrompt = 'You are an expert design analyst. Analyze design files for usability, aesthetics, and best practices.'
        analysisPrompt = `Analyze this design file${fileName ? ` (${fileName})` : ''}:

${content}

Provide analysis on:
  1. User experience and usability
  2. Visual hierarchy and layout
  3. Color theory and typography
  4. Consistency and design system adherence
`
        break;

      default:
        systemPrompt = 'You are a general file analyst. Provide comprehensive analysis of the file content.'
        analysisPrompt = `Analyze this file${fileName ? ` (${fileName})` : ''}:

${content}

Provide general analysis including:
1. Content overview and summary
2. Quality assessment
3. Key information or data points
4. Potential improvements
5. Use case recommendations
`
    }

    try {
      if (this.openai) {
        try {
          const response = await this.openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
              {
                role: "user",
                content: analysisPrompt 
              }
            ]
          });
          return response.choices[0].message?.content || ''
        } catch (error) {
          this.handleError(error, 'OpenAI analysis', 'openai')
        }
      } else if (this.anthropic) {
        try {
          const msg = await this.anthropic.messages.create({
            model: "claude-3-haiku-20240307",
            max_tokens: 4096,
            system: systemPrompt,
            messages: [{
              role: 'user',
              content: analysisPrompt
            }]
          });
          const contentBlock = msg.content[0];
          if (contentBlock.type === 'text') {
            return contentBlock.text;
          }
          return '';
        } catch (error) {
          this.handleError(error, 'Anthropic analysis', 'anthropic')
        }
      }
    } catch (error) {
      this.handleError(error, 'Content analysis', 'AI Provider');
    }

    throw new AIServiceError('No suitable provider for file analysis', 'NO_PROVIDER');
  }

  async analyzeFile(
    fileId: string,
    fileType: string,
    content: string,
    fileName: string,
    metadata: { size?: number, mimeType?: string }
  ): Promise<AIAnalysisResult> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new AIAuthenticationError('supabase');

    const { data: analysis, error: insertError } = await this.supabase
      .from('file_analysis')
      .insert({
        user_id: user.id,
        file_id: fileId,
        type: fileType,
        status: 'analyzing',
        metadata: metadata
      })
      .select()
      .single();

    if (insertError) {
      throw new AIServiceError(
        `Failed to create analysis record: ${insertError.message}`, 'DATABASE_ERROR'
      )
    }

    try {
      // Fetch file info from storage if needed
      if (!content) {
        const { data: file, error: fileError } = await this.supabase
          .from('files')
          .select('*, projects(name)')
          .eq('id', fileId)
          .single();

        if (fileError) {
          throw new AIServiceError(
            `Failed to fetch file: ${fileError.message}`, 'DATABASE_ERROR'
          )
        }
        
        // This is a placeholder for getting file content.
        // In a real app, this would involve downloading from storage.
        content = `File content for ${(file as { name: string }).name}`;
        fileName = (file as { name: string }).name;
      }
      
      const analysisResult = await this.analyzeFileContent({
        content,
        fileType,
        fileName,
        metadata
      });

      // Mock analysis for demonstration
      const mockResults = {
        summary: 'This is a mock analysis of the file.',
        keywords: ['mock', 'analysis', 'file'],
        sentiment: 'neutral',
        confidence: 0.8,
        timestamp: new Date().toISOString(),
        insights: ['File structure appears well-organized', 'Content follows standard conventions', 'Quality appears to be good'],
        recommendations: ['Consider adding more detailed documentation', 'Review for optimization opportunities', 'Ensure accessibility compliance'],
        score: 0.75,
        metadata: {
          wordCount: content.split(/\s+/).length,
          charCount: content.length
        }
      };

      const { data: updatedAnalysis, error: updateError } = await this.supabase
        .from('file_analysis')
        .update({
          status: 'complete',
          results: analysisResult ? { result: analysisResult } : mockResults,
          updated_at: new Date().toISOString()
        })
        .eq('id', analysis.id)
        .select()
        .single();
      
      if (updateError) {
        throw new AIServiceError(
          `Failed to update analysis record: ${updateError.message}`, 'DATABASE_ERROR'
        )
      }
      return updatedAnalysis;
    } catch (error) {
      logger.error('Error in file analysis', {
        analysisId: analysis.id,
        fileId,
        fileType,
        fileName,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })

      // Update record with error status
      await this.supabase
        .from('file_analysis')
        .update({
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          updated_at: new Date().toISOString()
        })
        .eq('id', analysis.id);

      this.handleError(error, 'File Analysis');
    }
  }
} 