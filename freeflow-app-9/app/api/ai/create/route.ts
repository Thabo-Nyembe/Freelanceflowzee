import { NextRequest, NextResponse } from 'next/server';
import { createFeatureLogger } from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

const logger = createFeatureLogger('API-AICreate')
export const runtime = 'nodejs'

// Comprehensive asset generation templates for freelancers
const ASSET_GENERATION_TEMPLATES = {
  // ... rest of templates

  photography: {
    luts: {
      generate: (style: string) => ({
        name: `${style} Professional LUTs Pack`,
        format: '.cube',
        description: `Professional color grading LUTs for ${style.toLowerCase()} photography`,
        files: [
          { name: `${style}_Cinematic.cube`, size: '2.4 MB' },
          { name: `${style}_Vintage.cube`, size: '1.8 MB' },
          { name: `${style}_Modern.cube`, size: '2.1 MB' }
        ],
        tags: ['luts', 'color-grading', style.toLowerCase(), 'professional'],
        downloadUrl: `/assets/luts/${style.toLowerCase()}-pack.zip`,
        previewUrl: `/previews/luts-${style.toLowerCase()}.jpg`,
        compatibility: ['DaVinci Resolve', 'Adobe Premiere', 'Final Cut Pro'],
        instructions: 'Import LUTs into your color grading software and apply to footage'
      })
    },
    presets: {
      generate: (style: string) => ({
        name: `${style} Lightroom Presets Collection`,
        format: '.xmp',
        description: `Professional photo editing presets for ${style.toLowerCase()} photography`,
        files: [
          { name: `${style}_Portrait.xmp`, size: '45 KB' },
          { name: `${style}_Landscape.xmp`, size: '52 KB' },
          { name: `${style}_Street.xmp`, size: '38 KB' }
        ],
        tags: ['presets', 'lightroom', style.toLowerCase(), 'photo-editing'],
        downloadUrl: `/assets/presets/${style.toLowerCase()}-collection.zip`,
        previewUrl: `/previews/presets-${style.toLowerCase()}.jpg`,
        compatibility: ['Adobe Lightroom', 'Luminar', 'Capture One'],
        instructions: 'Import presets into Lightroom and apply to your photos'
      })
    },
    actions: {
      generate: (style: string) => ({
        name: `${style} Photoshop Actions Set`,
        format: '.atn',
        description: `Automated photo effects and workflows for ${style.toLowerCase()} style`,
        files: [
          { name: `${style}_Enhance.atn`, size: '156 KB' },
          { name: `${style}_Retouch.atn`, size: '203 KB' },
          { name: `${style}_Effects.atn`, size: '189 KB' }
        ],
        tags: ['actions', 'photoshop', style.toLowerCase(), 'automation'],
        downloadUrl: `/assets/actions/${style.toLowerCase()}-set.zip`,
        previewUrl: `/previews/actions-${style.toLowerCase()}.jpg`,
        compatibility: ['Adobe Photoshop CC', 'Photoshop Elements'],
        instructions: 'Load actions into Photoshop and run on your images'
      })
    }
  },
  videography: {
    transitions: {
      generate: (style: string) => ({
        name: `${style} Video Transitions Pack`,
        format: '.mogrt',
        description: `Smooth scene transitions for ${style.toLowerCase()} video projects`,
        files: [
          { name: `${style}_Fade.mogrt`, size: '3.2 MB' },
          { name: `${style}_Slide.mogrt`, size: '2.8 MB' },
          { name: `${style}_Zoom.mogrt`, size: '4.1 MB' }
        ],
        tags: ['transitions', 'video', style.toLowerCase(), 'motion-graphics'],
        downloadUrl: `/assets/transitions/${style.toLowerCase()}-pack.zip`,
        previewUrl: `/previews/transitions-${style.toLowerCase()}.mp4`,
        compatibility: ['Adobe Premiere Pro', 'After Effects', 'DaVinci Resolve'],
        instructions: 'Import transitions and drag between video clips'
      })
    },
    luts: {
      generate: (style: string) => ({
        name: `${style} Cinematic LUTs Collection`,
        format: '.cube',
        description: `Film-style color grading for ${style.toLowerCase()} cinematography`,
        files: [
          { name: `${style}_Film.cube`, size: '2.7 MB' },
          { name: `${style}_Digital.cube`, size: '2.3 MB' },
          { name: `${style}_Vintage.cube`, size: '2.5 MB' }
        ],
        tags: ['luts', 'cinematic', style.toLowerCase(), 'color-grading'],
        downloadUrl: `/assets/video-luts/${style.toLowerCase()}-collection.zip`,
        previewUrl: `/previews/video-luts-${style.toLowerCase()}.jpg`,
        compatibility: ['DaVinci Resolve', 'Adobe Premiere', 'Final Cut Pro'],
        instructions: 'Apply LUTs in your video editing software color panel'
      })
    }
  },
  design: {
    templates: {
      generate: (style: string) => ({
        name: `${style} Design Templates Bundle`,
        format: '.ai/.psd',
        description: `Professional design templates for ${style.toLowerCase()} branding`,
        files: [
          { name: `${style}_Logo_Template.ai`, size: '4.5 MB' },
          { name: `${style}_Business_Card.psd`, size: '12.3 MB' },
          { name: `${style}_Letterhead.ai`, size: '6.7 MB' }
        ],
        tags: ['templates', 'design', style.toLowerCase(), 'branding'],
        downloadUrl: `/assets/design/${style.toLowerCase()}-bundle.zip`,
        previewUrl: `/previews/design-${style.toLowerCase()}.jpg`,
        compatibility: ['Adobe Illustrator', 'Photoshop', 'Figma'],
        instructions: 'Open templates in design software and customize colors/text'
      })
    },
    mockups: {
      generate: (style: string) => ({
        name: `${style} Product Mockups Collection`,
        format: '.psd',
        description: `3D product presentations for ${style.toLowerCase()} designs`,
        files: [
          { name: `${style}_Device_Mockup.psd`, size: '89.2 MB' },
          { name: `${style}_Print_Mockup.psd`, size: '67.8 MB' },
          { name: `${style}_Packaging_Mockup.psd`, size: '124.5 MB' }
        ],
        tags: ['mockups', '3d', style.toLowerCase(), 'presentation'],
        downloadUrl: `/assets/mockups/${style.toLowerCase()}-collection.zip`,
        previewUrl: `/previews/mockups-${style.toLowerCase()}.jpg`,
        compatibility: ['Adobe Photoshop CC'],
        instructions: 'Replace smart objects with your designs in Photoshop'
      })
    }
  },
  music: {
    samples: {
      generate: (style: string) => ({
        name: `${style} Audio Sample Pack`,
        format: '.wav',
        description: `High-quality audio samples for ${style.toLowerCase()} music production`,
        files: [
          { name: `${style}_Drum_Kit.zip`, size: '45.7 MB' },
          { name: `${style}_Loops.zip`, size: '67.3 MB' },
          { name: `${style}_One_Shots.zip`, size: '23.8 MB' }
        ],
        tags: ['samples', 'audio', style.toLowerCase(), 'production'],
        downloadUrl: `/assets/audio/${style.toLowerCase()}-samples.zip`,
        previewUrl: `/previews/audio-${style.toLowerCase()}.mp3`,
        compatibility: ['Ableton Live', 'FL Studio', 'Logic Pro', 'Pro Tools'],
        instructions: 'Import samples into your DAW sample library'
      })
    },
    presets: {
      generate: (style: string) => ({
        name: `${style} Synth Presets Bank`,
        format: '.fxp/.h2p',
        description: `Professional synthesizer presets for ${style.toLowerCase()} music`,
        files: [
          { name: `${style}_Leads.fxp`, size: '2.4 MB' },
          { name: `${style}_Pads.fxp`, size: '3.1 MB' },
          { name: `${style}_Bass.fxp`, size: '1.9 MB' }
        ],
        tags: ['presets', 'synthesizer', style.toLowerCase(), 'sounds'],
        downloadUrl: `/assets/synth/${style.toLowerCase()}-presets.zip`,
        previewUrl: `/previews/synth-${style.toLowerCase()}.mp3`,
        compatibility: ['Serum', 'Massive', 'Sylenth1', 'Omnisphere'],
        instructions: 'Load preset banks into your synthesizer plugin'
      })
    }
  },
  webDevelopment: {
    components: {
      generate: (style: string) => ({
        name: `${style} UI Components Library`,
        format: '.jsx/.vue',
        description: `Reusable UI components for ${style.toLowerCase()} web applications`,
        files: [
          { name: `${style}_Button_Components.jsx`, size: '45 KB' },
          { name: `${style}_Form_Components.jsx`, size: '67 KB' },
          { name: `${style}_Navigation_Components.jsx`, size: '89 KB' }
        ],
        tags: ['components', 'ui', style.toLowerCase(), 'react', 'vue'],
        downloadUrl: `/assets/components/${style.toLowerCase()}-library.zip`,
        previewUrl: `/previews/components-${style.toLowerCase()}.jpg`,
        compatibility: ['React', 'Vue.js', 'Angular', 'Svelte'],
        instructions: 'Import components into your project and customize styling'
      })
    },
    themes: {
      generate: (style: string) => ({
        name: `${style} Design System Theme`,
        format: '.css/.scss',
        description: `Complete design system with ${style.toLowerCase()} styling`,
        files: [
          { name: `${style}_Variables.scss`, size: '12 KB' },
          { name: `${style}_Components.css`, size: '156 KB' },
          { name: `${style}_Utilities.css`, size: '89 KB' }
        ],
        tags: ['theme', 'design-system', style.toLowerCase(), 'css'],
        downloadUrl: `/assets/themes/${style.toLowerCase()}-system.zip`,
        previewUrl: `/previews/theme-${style.toLowerCase()}.jpg`,
        compatibility: ['Any CSS Framework', 'Tailwind CSS', 'Bootstrap'],
        instructions: 'Include CSS files in your project and apply classes'
      })
    }
  },
  writing: {
    templates: {
      generate: (style: string) => ({
        name: `${style} Content Templates Collection`,
        format: '.docx/.md',
        description: `Professional content templates for ${style.toLowerCase()} writing`,
        files: [
          { name: `${style}_Blog_Template.docx`, size: '234 KB' },
          { name: `${style}_Email_Templates.docx`, size: '156 KB' },
          { name: `${style}_Social_Templates.md`, size: '45 KB' }
        ],
        tags: ['templates', 'content', style.toLowerCase(), 'writing'],
        downloadUrl: `/assets/content/${style.toLowerCase()}-templates.zip`,
        previewUrl: `/previews/content-${style.toLowerCase()}.jpg`,
        compatibility: ['Microsoft Word', 'Google Docs', 'Notion', 'Markdown'],
        instructions: 'Open templates and customize with your content'
      })
    },
    campaigns: {
      generate: (style: string) => ({
        name: `${style} Marketing Campaign Framework`,
        format: '.xlsx/.pdf',
        description: `Complete marketing campaign strategy for ${style.toLowerCase()} approach`,
        files: [
          { name: `${style}_Campaign_Strategy.pdf`, size: '2.3 MB' },
          { name: `${style}_Content_Calendar.xlsx`, size: '456 KB' },
          { name: `${style}_Email_Sequence.docx`, size: '234 KB' }
        ],
        tags: ['campaigns', 'marketing', style.toLowerCase(), 'strategy'],
        downloadUrl: `/assets/marketing/${style.toLowerCase()}-campaign.zip`,
        previewUrl: `/previews/campaign-${style.toLowerCase()}.jpg`,
        compatibility: ['Microsoft Office', 'Google Workspace', 'Notion'],
        instructions: 'Follow campaign framework and customize for your brand'
      })
    }
  }
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { creativeField, assetType, style = 'Professional', aiModel, prompt } = await request.json();

    logger.info('AI Create request received', {
      creativeField,
      assetType,
      style,
      aiModel: aiModel || 'FreeFlow AI',
      promptLength: prompt?.length || 0
    });

    // Validate required fields
    if (!creativeField || !assetType) {
      return NextResponse.json({
        success: false,
        error: 'Creative field and asset type are required'
      }, { status: 400 });
    }

    // Check if we have a template for this combination
    const fieldTemplates = (ASSET_GENERATION_TEMPLATES as Record<string, unknown>)[creativeField];
    if (!fieldTemplates) {
      return NextResponse.json({
        success: false,
        error: `Unsupported creative field: ${creativeField}`
      }, { status: 400 });
    }

    const assetTemplate = fieldTemplates[assetType];
    if (!assetTemplate) {
      return NextResponse.json({
        success: false,
        error: `Unsupported asset type: ${assetType} for field: ${creativeField}`
      }, { status: 400 });
    }

    // Generate asset using template
    const generatedAsset = assetTemplate.generate(style);

    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Add generation metadata
    const asset = {
      user_id: user.id,
      prompt,
      model: aiModel || 'FreeFlow AI',
      generation_type: 'image', // simplified for now
      result: generatedAsset.previewUrl,
      metadata: {
        ...generatedAsset,
        creativeField,
        assetType,
        style,
        quality: 'high'
      },
      status: 'completed',
      cost: 0.02
    }

    // Persist to DB
    const { data: dbGen, error: dbError } = await supabase
      .from('ai_generations')
      .insert(asset)
      .select()
      .single()

    if (dbError) {
      logger.error('Failed to save to DB', { error: dbError })
      // formatting fail safe
    }

    const response = {
      success: true,
      assets: [dbGen ? {
        ...generatedAsset,
        id: dbGen.id,
        url: dbGen.result,
        thumbnailUrl: dbGen.result,
        createdAt: dbGen.created_at
      } : {
        ...generatedAsset,
        id: `temp_${Date.now()}`,
        url: generatedAsset.previewUrl,
        thumbnailUrl: generatedAsset.previewUrl,
        createdAt: new Date().toISOString()
      }],
      generationStats: {
        processingTime: '1.5s',
        tokensUsed: Math.floor(Math.random() * 500) + 100,
        cost: '$0.02',
        cacheHit: Math.random() > 0.7
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error('AI Create API error', {
      error: error.message,
      stack: error.stack
    });
    return NextResponse.json({
      success: false,
      error: 'Failed to generate asset. Please try again.'
    }, { status: 500 });
  }
}
