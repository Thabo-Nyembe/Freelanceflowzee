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
  requestFormat: (prompt: string, params: unknown) => any
  responseParser: (response: unknown) => string
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

// Context7 Pattern: AI Model Provider Configurations'
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
      max_tokens: params?.maxTokens || 1000,
      temperature: 0.7
    }),
    responseParser: (response: any) => response.choices[0]?.message?.content || 'No response generated'
  }
}

async function generateWithAI(prompt: string, modelConfig: AIModelConfig, apiKey?: string): Promise<string> {
  try {
    const headers = { ...modelConfig.headers }
    if (apiKey) {
      headers['Authorization'] = headers['Authorization'].replace('{API_KEY}', apiKey)
    }

    const requestBody = modelConfig.requestFormat(prompt, {})

    const response = await fetch(modelConfig.apiEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    return modelConfig.responseParser(data)
  } catch (error) {
    console.error('AI generation error: ', error)
    return 'AI generation temporarily unavailable'
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: AssetGenerationRequest = await request.json()
    
    const { field, assetType, parameters, advancedSettings, modelConfig } = body

    // Validate required fields
    if (!field || !assetType || !parameters?.style) {
      return NextResponse.json({ error: 'Missing required fields: field, assetType, and style' },
        { status: 400 }
      )
    }

    // Get the appropriate generator
    const fieldGenerators = ASSET_GENERATORS[field as keyof typeof ASSET_GENERATORS]
    if (!fieldGenerators) {
      return NextResponse.json(
        { error: `Unsupported field: ${field}` },
        { status: 400 }
      )
    }

    const assetGenerator = (fieldGenerators as any)[assetType]
    if (!assetGenerator) {
      return NextResponse.json(
        { error: `Unsupported asset type: ${assetType} for field: ${field}` },
        { status: 400 }
      )
    }

    // Generate base asset metadata
    const baseAsset = assetGenerator.generate(parameters)

    // Create full asset object
    const asset: GeneratedAsset = {
      id: `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: baseAsset.name,
      type: assetType,
      category: field,
      downloadUrl: `/api/assets/download/${field}/${assetType}`,
      previewUrl: `/api/assets/preview/${field}/${assetType}`,
      metadata: {
        dimensions: getDimensionsForType(assetType),
        tags: baseAsset.tags,
        description: baseAsset.description,
        format: baseAsset.format,
        size: adjustSizeForQuality(baseAsset.size, advancedSettings.quality)
      },
      createdAt: new Date().toISOString()
    }

    // If AI enhancement is requested
    if (modelConfig?.useCustomApi && modelConfig.modelId) {
      const aiConfig = AI_MODEL_CONFIGS[modelConfig.modelId]
      if (aiConfig) {
        const enhancementPrompt = `Enhance this creative asset: ${asset.name}. 
        Description: ${asset.metadata.description}
        Style: ${parameters.style}
        Additional context: ${parameters.customPrompt || 'Professional quality'}`
        
        const enhancedDescription = await generateWithAI(
          enhancementPrompt, 
          aiConfig, 
          modelConfig.customApiKey
        )
        
        if (enhancedDescription !== 'AI generation temporarily unavailable') {
          asset.metadata.description = enhancedDescription
        }
      }
    }

    return NextResponse.json({
      success: true,
      asset,
      generationMethod: modelConfig?.useCustomApi ? 'AI-Enhanced' : 'Standard',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Asset generation error: ', error)
    return NextResponse.json({ error: 'Failed to generate asset' },
      { status: 500 }
    )
  }
}

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
    audio: 'Stereo 44.1kHz',
    patterns: '512x512',
    icons: '256x256',
    fonts: 'Vector',
    mockups: '3000x2000',
    samples: 'Stereo 44.1kHz',
    midi: 'N/A',
    stems: 'Stereo 44.1kHz',
    components: 'Responsive',
    animations: 'CSS',
    themes: 'JSON',
    snippets: 'Code',
    prompts: 'Text',
    outlines: 'Markdown',
    headlines: 'Text',
    hooks: 'Text'
  }
  return dimensionMap[assetType] || 'Variable'
}

function adjustSizeForQuality(baseSize: string, quality: string): string {
  const multipliers: Record<string, number> = {
    standard: 1,
    high: 1.5,
    premium: 2.2,
    enterprise: 3.0
  }
  
  const multiplier = multipliers[quality] || 1
  const sizeMatch = baseSize.match(/(\d+\.?\d*)\s*(\w+)/)
  
  if (sizeMatch) {
    const [, size, unit] = sizeMatch
    const adjustedSize = (parseFloat(size) * multiplier).toFixed(1)
    return `${adjustedSize} ${unit}`
  }
  
  return baseSize
}

export async function GET() {
  return NextResponse.json({
    message: 'Creative Asset Generation API',
    availableFields: Object.keys(ASSET_GENERATORS),
    supportedModels: Object.keys(AI_MODEL_CONFIGS),
    version: '2.0.0'
  })
} 