import { NextRequest, NextResponse } from 'next/server'

// Context7 Pattern: Enhanced request interface with model configuration
interface AssetGenerationRequest {
  field: string
  assetType: string
  parameters: {
    style: string
    colorScheme: string
    customPrompt?: string
  }
  advancedSettings: {
    quality: string
    resolution: string
  }
  modelConfig?: {
    modelId: string
    provider: string
    useCustomApi: boolean
    customApiKey?: string
    maxTokens?: number
    qualityLevel: string
  }
}

// Context7 Pattern: AI Model configuration for different providers
interface AIModelConfig {
  id: string
  provider: string
  apiEndpoint: string
  headers: Record<string, string>
  requestFormat: (prompt: string, params: any) => any
  responseParser: (response: any) => string
}

interface GeneratedAsset {
  id: string
  name: string
  type: string
  category: string
  downloadUrl: string
  previewUrl: string
  metadata: {
    dimensions?: string
    tags: string[]
    description: string
    format: string
    size: string
  }
  createdAt: string
}

// Field-specific asset generation logic
const ASSET_GENERATORS = {
  photography: {
    luts: {
      generate: (params: any) => ({
        name: `${params.style} Color Grading LUT`,
        format: '.cube',
        description: 'Professional color grading lookup table for cinematic looks',
        tags: ['color-grading', 'cinematic', params.style, params.colorScheme],
        size: '2.4 MB'
      })
    },
    presets: {
      generate: (params: any) => ({
        name: `${params.style} Lightroom Preset`,
        format: '.xmp',
        description: 'Professional photo editing preset for Adobe Lightroom',
        tags: ['lightroom', 'photo-editing', params.style],
        size: '1.2 MB'
      })
    },
    actions: {
      generate: (params: any) => ({
        name: `${params.style} Photoshop Action`,
        format: '.atn',
        description: 'Automated photo effect for Adobe Photoshop',
        tags: ['photoshop', 'automation', params.style],
        size: '3.7 MB'
      })
    },
    overlays: {
      generate: (params: any) => ({
        name: `${params.style} Photo Overlay Pack`,
        format: '.png',
        description: 'High-quality photo overlays for creative enhancement',
        tags: ['overlays', 'creative', params.style],
        size: '45.2 MB'
      })
    },
    templates: {
      generate: (params: any) => ({
        name: `${params.style} Portfolio Template`,
        format: '.psd',
        description: 'Professional portfolio layout template',
        tags: ['portfolio', 'template', params.style],
        size: '125.8 MB'
      })
    }
  },
  videography: {
    transitions: {
      generate: (params: any) => ({
        name: `${params.style} Video Transitions`,
        format: '.prproj',
        description: 'Smooth scene transitions for video editing',
        tags: ['transitions', 'video-editing', params.style],
        size: '12.5 MB'
      })
    },
    luts: {
      generate: (params: any) => ({
        name: `${params.style} Cinematic LUT`,
        format: '.cube',
        description: 'Film-style color grading for cinematic look',
        tags: ['cinematic', 'color-grading', params.style],
        size: '3.1 MB'
      })
    },
    titles: {
      generate: (params: any) => ({
        name: `${params.style} Title Templates`,
        format: '.mogrt',
        description: 'Animated text overlays for video projects',
        tags: ['titles', 'animation', params.style],
        size: '8.9 MB'
      })
    },
    effects: {
      generate: (params: any) => ({
        name: `${params.style} Visual Effects`,
        format: '.aep',
        description: 'Professional visual effects for After Effects',
        tags: ['vfx', 'after-effects', params.style],
        size: '67.3 MB'
      })
    },
    audio: {
      generate: (params: any) => ({
        name: `${params.style} Audio Track`,
        format: '.wav',
        description: 'Background music and sound effects',
        tags: ['audio', 'music', params.style],
        size: '23.7 MB'
      })
    }
  },
  design: {
    templates: {
      generate: (params: any) => ({
        name: `${params.style} Design Template`,
        format: '.ai',
        description: 'Professional design template for various projects',
        tags: ['design', 'template', params.style],
        size: '15.6 MB'
      })
    },
    patterns: {
      generate: (params: any) => ({
        name: `${params.style} Seamless Patterns`,
        format: '.pat',
        description: 'Repeating background patterns for design projects',
        tags: ['patterns', 'backgrounds', params.style],
        size: '7.2 MB'
      })
    },
    icons: {
      generate: (params: any) => ({
        name: `${params.style} Icon Set`,
        format: '.svg',
        description: 'Consistent icon collection for UI/UX projects',
        tags: ['icons', 'ui-ux', params.style],
        size: '4.8 MB'
      })
    },
    fonts: {
      generate: (params: any) => ({
        name: `${params.style} Custom Font`,
        format: '.otf',
        description: 'Brand-specific typography for design projects',
        tags: ['typography', 'fonts', params.style],
        size: '2.1 MB'
      })
    },
    mockups: {
      generate: (params: any) => ({
        name: `${params.style} Product Mockup`,
        format: '.psd',
        description: '3D product presentation mockups',
        tags: ['mockups', '3d', params.style],
        size: '89.4 MB'
      })
    }
  },
  music: {
    samples: {
      generate: (params: any) => ({
        name: `${params.style} Audio Samples`,
        format: '.wav',
        description: 'High-quality drum hits, loops, and one-shots',
        tags: ['samples', 'drums', params.style],
        size: '156.7 MB'
      })
    },
    presets: {
      generate: (params: any) => ({
        name: `${params.style} Synth Presets`,
        format: '.fxp',
        description: 'Professional synthesizer sound presets',
        tags: ['synth', 'presets', params.style],
        size: '12.3 MB'
      })
    },
    midi: {
      generate: (params: any) => ({
        name: `${params.style} MIDI Patterns`,
        format: '.mid',
        description: 'Chord progressions and melodic patterns',
        tags: ['midi', 'patterns', params.style],
        size: '0.8 MB'
      })
    },
    stems: {
      generate: (params: any) => ({
        name: `${params.style} Song Stems`,
        format: '.wav',
        description: 'Individual track elements for remixing',
        tags: ['stems', 'remix', params.style],
        size: '234.5 MB'
      })
    },
    effects: {
      generate: (params: any) => ({
        name: `${params.style} Audio Effects`,
        format: '.fxp',
        description: 'Reverb, delay, and distortion presets',
        tags: ['effects', 'audio-processing', params.style],
        size: '18.9 MB'
      })
    }
  },
  'web-development': {
    components: {
      generate: (params: any) => ({
        name: `${params.style} UI Components`,
        format: '.tsx',
        description: 'Reusable React/Vue component library',
        tags: ['react', 'components', params.style],
        size: '5.4 MB'
      })
    },
    animations: {
      generate: (params: any) => ({
        name: `${params.style} CSS Animations`,
        format: '.css',
        description: 'Smooth micro-interactions and animations',
        tags: ['css', 'animations', params.style],
        size: '1.7 MB'
      })
    },
    themes: {
      generate: (params: any) => ({
        name: `${params.style} Color Theme`,
        format: '.json',
        description: 'Complete design system with color variables',
        tags: ['themes', 'design-system', params.style],
        size: '0.3 MB'
      })
    },
    templates: {
      generate: (params: any) => ({
        name: `${params.style} Page Template`,
        format: '.html',
        description: 'Complete landing page or dashboard template',
        tags: ['templates', 'html', params.style],
        size: '8.2 MB'
      })
    },
    snippets: {
      generate: (params: any) => ({
        name: `${params.style} Code Snippets`,
        format: '.js',
        description: 'Utility functions and helper libraries',
        tags: ['javascript', 'utilities', params.style],
        size: '2.1 MB'
      })
    }
  },
  writing: {
    templates: {
      generate: (params: any) => ({
        name: `${params.style} Content Templates`,
        format: '.docx',
        description: 'Professional content templates for various formats',
        tags: ['content', 'templates', params.style],
        size: '1.5 MB'
      })
    },
    prompts: {
      generate: (params: any) => ({
        name: `${params.style} Writing Prompts`,
        format: '.txt',
        description: 'Creative inspiration starters for writers',
        tags: ['prompts', 'creative-writing', params.style],
        size: '0.2 MB'
      })
    },
    outlines: {
      generate: (params: any) => ({
        name: `${params.style} Content Outlines`,
        format: '.md',
        description: 'Structured content frameworks and outlines',
        tags: ['outlines', 'structure', params.style],
        size: '0.4 MB'
      })
    },
    headlines: {
      generate: (params: any) => ({
        name: `${params.style} Headline Variations`,
        format: '.txt',
        description: 'Compelling title options for content',
        tags: ['headlines', 'copywriting', params.style],
        size: '0.1 MB'
      })
    },
    hooks: {
      generate: (params: any) => ({
        name: `${params.style} Opening Hooks`,
        format: '.txt',
        description: 'Attention-grabbing introduction templates',
        tags: ['hooks', 'engagement', params.style],
        size: '0.3 MB'
      })
    }
  }
}

// Context7 Pattern: AI Model Provider Configurations
const AI_MODEL_CONFIGS: Record<string, AIModelConfig> = {
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    provider: 'OpenAI',
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer {API_KEY}'
    },
    requestFormat: (prompt: string, params: any) => ({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional creative asset generator. Generate detailed descriptions and metadata for creative assets.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: params.maxTokens || 1000,
      temperature: 0.7
    }),
    responseParser: (response: any) => response.choices[0]?.message?.content || ''
  },
  'gpt-3.5-turbo': {
    id: 'gpt-3.5-turbo',
    provider: 'OpenAI',
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer {API_KEY}'
    },
    requestFormat: (prompt: string, params: any) => ({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a professional creative asset generator.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: params.maxTokens || 800,
      temperature: 0.7
    }),
    responseParser: (response: any) => response.choices[0]?.message?.content || ''
  },
  'claude-3-haiku': {
    id: 'claude-3-haiku',
    provider: 'Anthropic',
    apiEndpoint: 'https://api.anthropic.com/v1/messages',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': '{API_KEY}',
      'anthropic-version': '2023-06-01'
    },
    requestFormat: (prompt: string, params: any) => ({
      model: 'claude-3-haiku-20240307',
      max_tokens: params.maxTokens || 1000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    }),
    responseParser: (response: any) => response.content[0]?.text || ''
  },
  'gemini-pro': {
    id: 'gemini-pro',
    provider: 'Google',
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    headers: {
      'Content-Type': 'application/json'
    },
    requestFormat: (prompt: string, params: any) => ({
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    }),
    responseParser: (response: any) => response.candidates[0]?.content?.parts[0]?.text || ''
  },
  'llama-2-7b': {
    id: 'llama-2-7b',
    provider: 'Hugging Face',
    apiEndpoint: 'https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer {API_KEY}'
    },
    requestFormat: (prompt: string, params: any) => ({
      inputs: prompt,
      parameters: {
        max_new_tokens: params.maxTokens || 500,
        temperature: 0.7,
        return_full_text: false
      }
    }),
    responseParser: (response: any) => response[0]?.generated_text || ''
  },
  'mistral-7b': {
    id: 'mistral-7b',
    provider: 'Hugging Face',
    apiEndpoint: 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer {API_KEY}'
    },
    requestFormat: (prompt: string, params: any) => ({
      inputs: prompt,
      parameters: {
        max_new_tokens: params.maxTokens || 500,
        temperature: 0.7,
        return_full_text: false
      }
    }),
    responseParser: (response: any) => response[0]?.generated_text || ''
  }
}

// Context7 Pattern: Enhanced AI Asset Generation with Model Selection
async function generateWithAI(prompt: string, modelConfig: AIModelConfig, apiKey?: string): Promise<string> {
  try {
    const headers = { ...modelConfig.headers }
    
    // Replace API key placeholder
    Object.keys(headers).forEach(key => {
      if (headers[key].includes('{API_KEY}') && apiKey) {
        headers[key] = headers[key].replace('{API_KEY}', apiKey)
      }
    })

    // For Google Gemini, append API key as query parameter
    let endpoint = modelConfig.apiEndpoint
    if (modelConfig.provider === 'Google' && apiKey) {
      endpoint += `?key=${apiKey}`
    }

    const requestBody = modelConfig.requestFormat(prompt, {})
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`AI API request failed: ${response.status}`)
    }

    const data = await response.json()
    return modelConfig.responseParser(data)
  } catch (error) {
    console.error('AI generation error:', error)
    return ''
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: AssetGenerationRequest = await request.json()
    const { field, assetType, parameters, advancedSettings, modelConfig } = body

    // Context7 Pattern: Extract model configuration from headers
    const modelId = request.headers.get('X-AI-Model') || modelConfig?.modelId || 'gpt-4o-mini'
    const useCustomApi = request.headers.get('X-Use-Custom-API') === 'true' || modelConfig?.useCustomApi || false
    const customApiKey = request.headers.get('X-Custom-API-Key') || modelConfig?.customApiKey

    // Validate input
    if (!field || !assetType || !parameters) {
      return NextResponse.json(
        { error: 'Missing required fields: field, assetType, parameters' },
        { status: 400 }
      )
    }

    // Context7 Pattern: Validate model configuration
    const selectedModel = AI_MODEL_CONFIGS[modelId]
    if (!selectedModel) {
      return NextResponse.json(
        { error: `Unsupported AI model: ${modelId}` },
        { status: 400 }
      )
    }

    // Context7 Pattern: Validate API key for custom API usage
    if (useCustomApi && selectedModel.provider !== 'Hugging Face' && !customApiKey) {
      return NextResponse.json(
        { 
          error: `API key required for custom ${selectedModel.provider} usage`,
          provider: selectedModel.provider 
        },
        { status: 400 }
      )
    }

    // Check if field and asset type are supported
    const fieldGenerator = ASSET_GENERATORS[field as keyof typeof ASSET_GENERATORS]
    if (!fieldGenerator) {
      return NextResponse.json(
        { error: `Unsupported field: ${field}` },
        { status: 400 }
      )
    }

    const assetGenerator = (fieldGenerator as any)[assetType]
    if (!assetGenerator) {
      return NextResponse.json(
        { error: `Unsupported asset type: ${assetType} for field: ${field}` },
        { status: 400 }
      )
    }

    // Simulate AI generation delay based on quality setting
    const qualityDelays = {
      draft: 1000,
      standard: 2000,
      professional: 3000,
      premium: 4000
    }
    
    const delay = qualityDelays[advancedSettings.quality as keyof typeof qualityDelays] || 2000
    await new Promise(resolve => setTimeout(resolve, delay))

    // Context7 Pattern: Enhanced Asset Generation with AI Integration
    const assetCount = Math.floor(Math.random() * 3) + 3 // 3-5 assets
    const generatedAssets: GeneratedAsset[] = []

    // Context7 Pattern: Build AI prompt for enhanced generation
    let aiEnhancedDescriptions: string[] = []
    if (parameters.customPrompt && useCustomApi && customApiKey) {
      try {
        const aiPrompt = `
Generate ${assetCount} creative variations for ${field} ${assetType} assets with the following requirements:
- Style: ${parameters.style}
- Color Scheme: ${parameters.colorScheme}
- Custom Requirements: ${parameters.customPrompt}
- Quality Level: ${advancedSettings.quality}

For each variation, provide:
1. A unique name
2. A detailed description
3. Relevant tags (comma-separated)
4. Style variation (e.g., Professional, Creative, Minimalist, Bold, Elegant)

Format each variation as:
Name: [name]
Description: [description]
Tags: [tags]
Style: [style]
---
`

        const aiResponse = await generateWithAI(aiPrompt, selectedModel, customApiKey)
        if (aiResponse) {
          // Parse AI response into individual descriptions
          const variations = aiResponse.split('---').filter(v => v.trim())
          aiEnhancedDescriptions = variations.map(v => v.trim())
        }
      } catch (error) {
        console.error('AI enhancement failed, falling back to standard generation:', error)
      }
    }

    for (let i = 0; i < assetCount; i++) {
      const baseAsset = assetGenerator.generate(parameters)
      const defaultVariations = ['Professional', 'Creative', 'Minimalist', 'Bold', 'Elegant']
      let variation = defaultVariations[i % defaultVariations.length]
      let assetName = `${variation} ${baseAsset.name}`
      let assetDescription = baseAsset.description
      let assetTags = [...baseAsset.tags, variation.toLowerCase()]

      // Context7 Pattern: Use AI-enhanced content if available
      if (aiEnhancedDescriptions[i]) {
        try {
          const aiVariation = aiEnhancedDescriptions[i]
          const nameMatch = aiVariation.match(/Name:\s*(.+)/i)
          const descMatch = aiVariation.match(/Description:\s*(.+)/i)
          const tagsMatch = aiVariation.match(/Tags:\s*(.+)/i)
          const styleMatch = aiVariation.match(/Style:\s*(.+)/i)

          if (nameMatch) assetName = nameMatch[1].trim()
          if (descMatch) assetDescription = descMatch[1].trim()
          if (tagsMatch) {
            const aiTags = tagsMatch[1].split(',').map(tag => tag.trim().toLowerCase())
            assetTags = [...baseAsset.tags, ...aiTags]
          }
          if (styleMatch) variation = styleMatch[1].trim()
        } catch (error) {
          console.error('Error parsing AI response, using default:', error)
        }
      }
      
      const asset: GeneratedAsset = {
        id: `${field}-${assetType}-${Date.now()}-${i}`,
        name: assetName,
        type: assetType,
        category: field,
        downloadUrl: `/api/ai/create/download/${field}-${assetType}-${Date.now()}-${i}`,
        previewUrl: '/placeholder.jpg',
        metadata: {
          dimensions: getDimensionsForType(assetType),
          tags: Array.from(new Set(assetTags)), // Remove duplicates
          description: assetDescription,
          format: baseAsset.format,
          size: adjustSizeForQuality(baseAsset.size, advancedSettings.quality)
        },
        createdAt: new Date().toISOString()
      }
      
      generatedAssets.push(asset)
    }

    return NextResponse.json({
      success: true,
      assets: generatedAssets,
      metadata: {
        field,
        assetType,
        generatedCount: generatedAssets.length,
        totalSize: calculateTotalSize(generatedAssets),
        estimatedGenerationTime: `${delay / 1000}s`,
        // Context7 Pattern: Include model information in response
        modelUsed: {
          id: selectedModel.id,
          name: selectedModel.id,
          provider: selectedModel.provider,
          customApiUsed: useCustomApi,
          aiEnhanced: aiEnhancedDescriptions.length > 0
        }
      }
    })

  } catch (error) {
    console.error('Asset generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error during asset generation' },
      { status: 500 }
    )
  }
}

// Helper functions
function getDimensionsForType(assetType: string): string {
  const dimensionMap: Record<string, string> = {
    luts: '32x32x32',
    presets: 'N/A',
    actions: 'N/A',
    overlays: '4096x4096',
    templates: '1920x1080',
    transitions: '1920x1080',
    titles: '1920x1080',
    effects: '1920x1080',
    audio: '48kHz/24bit',
    patterns: '512x512',
    icons: '512x512',
    fonts: 'Vector',
    mockups: '3000x2000',
    samples: '44.1kHz/16bit',
    midi: 'N/A',
    stems: '48kHz/24bit',
    components: 'Responsive',
    animations: 'CSS3',
    themes: 'JSON',
    snippets: 'ES6+'
  }
  
  return dimensionMap[assetType] || '1920x1080'
}

function adjustSizeForQuality(baseSize: string, quality: string): string {
  const multipliers = {
    draft: 0.5,
    standard: 1,
    professional: 1.5,
    premium: 2
  }
  
  const multiplier = multipliers[quality as keyof typeof multipliers] || 1
  const sizeNum = parseFloat(baseSize.replace(/[^\d.]/g, ''))
  const unit = baseSize.replace(/[\d.]/g, '')
  
  return `${(sizeNum * multiplier).toFixed(1)}${unit}`
}

function calculateTotalSize(assets: GeneratedAsset[]): string {
  let totalMB = 0
  
  assets.forEach(asset => {
    const sizeStr = asset.metadata.size
    const sizeNum = parseFloat(sizeStr.replace(/[^\d.]/g, ''))
    const unit = sizeStr.replace(/[\d.]/g, '').trim().toLowerCase()
    
    if (unit.includes('gb')) {
      totalMB += sizeNum * 1024
    } else if (unit.includes('mb')) {
      totalMB += sizeNum
    } else if (unit.includes('kb')) {
      totalMB += sizeNum / 1024
    }
  })
  
  if (totalMB > 1024) {
    return `${(totalMB / 1024).toFixed(1)} GB`
  } else {
    return `${totalMB.toFixed(1)} MB`
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'AI Asset Generation API',
    supportedFields: Object.keys(ASSET_GENERATORS),
    version: '1.0.0',
    features: [
      'Field-specific asset generation',
      'Quality-based generation',
      'Multiple format support',
      'Batch asset creation',
      'Professional metadata'
    ]
  })
} 