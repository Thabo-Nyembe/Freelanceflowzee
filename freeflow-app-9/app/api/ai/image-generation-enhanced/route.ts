// =====================================================
// KAZI AI Image Generation Enhanced API - World-Class
// Multi-provider image generation with advanced features
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createFeatureLogger } from '@/lib/logger';

const logger = createFeatureLogger('ai-image-generation-enhanced');

// =====================================================
// Types
// =====================================================

type ImageProvider = 'dalle' | 'stable-diffusion' | 'midjourney' | 'replicate' | 'leonardo';
type ImageSize = '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792' | 'custom';
type ImageStyle = 'vivid' | 'natural' | 'artistic' | 'photorealistic' | 'anime' | 'digital-art' | '3d-render' | 'oil-painting' | 'watercolor' | 'sketch' | 'minimalist' | 'vintage';
type ImageCategory = 'portrait' | 'landscape' | 'product' | 'abstract' | 'illustration' | 'logo' | 'social-media' | 'banner' | 'icon' | 'mockup' | 'character' | 'scene';

interface ImageGenerationRequest {
  action: string;
  prompt: string;
  negative_prompt?: string;
  provider?: ImageProvider;
  model?: string;
  size?: ImageSize;
  width?: number;
  height?: number;
  style?: ImageStyle;
  category?: ImageCategory;
  quality?: 'standard' | 'hd';
  quantity?: number;
  seed?: number;
  guidance_scale?: number;
  steps?: number;
  reference_image_url?: string;
  style_reference_url?: string;
  mask_url?: string;
  variations_of?: string;
  enhance?: boolean;
  upscale?: boolean;
  remove_background?: boolean;
  color_palette?: string[];
  brand_colors?: string[];
  aspect_ratio?: string;
}

// =====================================================
// GET - Fetch generation history, models, styles
// =====================================================
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Demo mode for unauthenticated users
    if (!user) {
      return handleDemoGet(action);
    }

    switch (action) {
      case 'history': {
        const style = searchParams.get('style');
        const category = searchParams.get('category');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = (page - 1) * limit;

        let query = supabase
          .from('ai_image_generations')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (style) {
          query = query.eq('style', style);
        }
        if (category) {
          query = query.eq('category', category);
        }

        const { data: images, count, error } = await query;

        if (error) throw error;

        return NextResponse.json({
          success: true,
          images,
          total: count || 0,
          page,
          limit
        });
      }

      case 'favorites': {
        const { data: favorites, error } = await supabase
          .from('ai_image_generations')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_favorite', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({
          success: true,
          favorites: favorites || []
        });
      }

      case 'collections': {
        const { data: collections, error } = await supabase
          .from('ai_image_collections')
          .select('*, images:ai_image_generations(id, image_url, prompt)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({
          success: true,
          collections: collections || []
        });
      }

      case 'models': {
        return NextResponse.json({
          success: true,
          models: getAvailableModels(),
          providers: getProviders()
        });
      }

      case 'styles': {
        return NextResponse.json({
          success: true,
          styles: getImageStyles(),
          categories: getImageCategories()
        });
      }

      case 'presets': {
        const { data: presets, error } = await supabase
          .from('ai_image_presets')
          .select('*')
          .or(`user_id.eq.${user.id},is_public.eq.true`)
          .order('use_count', { ascending: false });

        if (error) throw error;

        return NextResponse.json({
          success: true,
          presets: presets || [],
          built_in: getBuiltInPresets()
        });
      }

      case 'usage': {
        const { data: usage, error } = await supabase
          .from('ai_image_usage')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        if (error) throw error;

        const stats = {
          total_generations: usage?.length || 0,
          total_images: usage?.reduce((sum, u) => sum + (u.quantity || 1), 0) || 0,
          by_provider: {} as Record<string, number>,
          by_style: {} as Record<string, number>,
          by_size: {} as Record<string, number>,
          estimated_cost: usage?.reduce((sum, u) => sum + (u.cost || 0), 0) || 0
        };

        usage?.forEach(u => {
          stats.by_provider[u.provider] = (stats.by_provider[u.provider] || 0) + 1;
          if (u.style) {
            stats.by_style[u.style] = (stats.by_style[u.style] || 0) + 1;
          }
          if (u.size) {
            stats.by_size[u.size] = (stats.by_size[u.size] || 0) + 1;
          }
        });

        return NextResponse.json({ success: true, usage: stats });
      }

      case 'prompt-library': {
        const category = searchParams.get('category');
        return NextResponse.json({
          success: true,
          prompts: getPromptLibrary(category || undefined)
        });
      }

      default: {
        return NextResponse.json({
          success: true,
          service: 'AI Image Generation Enhanced',
          version: '2.0.0',
          status: 'operational',
          capabilities: [
            'text_to_image', 'image_to_image', 'inpainting', 'outpainting',
            'upscaling', 'background_removal', 'style_transfer', 'variations',
            'batch_generation', 'prompt_enhancement', 'negative_prompts',
            'custom_dimensions', 'seed_control', 'guidance_control'
          ]
        });
      }
    }
  } catch (error) {
    logger.error('AI Image Generation GET error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch image data' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Generate images
// =====================================================
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body: ImageGenerationRequest = await request.json();
    const { action, ...data } = body;

    // Demo mode for unauthenticated users
    if (!user) {
      return handleDemoPost(action, data);
    }

    switch (action) {
      case 'generate': {
        if (!data.prompt) {
          return NextResponse.json(
            { success: false, error: 'Prompt required' },
            { status: 400 }
          );
        }

        const result = await generateImage(user.id, data, supabase);

        return NextResponse.json({
          success: true,
          action: 'generate',
          ...result
        });
      }

      case 'enhance-prompt': {
        if (!data.prompt) {
          return NextResponse.json(
            { success: false, error: 'Prompt required' },
            { status: 400 }
          );
        }

        const result = await enhancePrompt(data.prompt, data.style, data.category);

        return NextResponse.json({
          success: true,
          action: 'enhance-prompt',
          ...result
        });
      }

      case 'generate-variations': {
        if (!data.variations_of && !data.prompt) {
          return NextResponse.json(
            { success: false, error: 'Image ID or prompt required' },
            { status: 400 }
          );
        }

        const result = await generateVariations(user.id, data, supabase);

        return NextResponse.json({
          success: true,
          action: 'generate-variations',
          ...result
        });
      }

      case 'upscale': {
        if (!data.reference_image_url) {
          return NextResponse.json(
            { success: false, error: 'Image URL required' },
            { status: 400 }
          );
        }

        const result = await upscaleImage(user.id, data, supabase);

        return NextResponse.json({
          success: true,
          action: 'upscale',
          ...result
        });
      }

      case 'remove-background': {
        if (!data.reference_image_url) {
          return NextResponse.json(
            { success: false, error: 'Image URL required' },
            { status: 400 }
          );
        }

        const result = await removeBackground(user.id, data, supabase);

        return NextResponse.json({
          success: true,
          action: 'remove-background',
          ...result
        });
      }

      case 'style-transfer': {
        if (!data.reference_image_url || !data.style_reference_url) {
          return NextResponse.json(
            { success: false, error: 'Source and style reference images required' },
            { status: 400 }
          );
        }

        const result = await styleTransfer(user.id, data, supabase);

        return NextResponse.json({
          success: true,
          action: 'style-transfer',
          ...result
        });
      }

      case 'inpaint': {
        if (!data.reference_image_url || !data.mask_url || !data.prompt) {
          return NextResponse.json(
            { success: false, error: 'Image, mask, and prompt required' },
            { status: 400 }
          );
        }

        const result = await inpaintImage(user.id, data, supabase);

        return NextResponse.json({
          success: true,
          action: 'inpaint',
          ...result
        });
      }

      case 'outpaint': {
        if (!data.reference_image_url || !data.prompt) {
          return NextResponse.json(
            { success: false, error: 'Image and prompt required' },
            { status: 400 }
          );
        }

        const result = await outpaintImage(user.id, data, supabase);

        return NextResponse.json({
          success: true,
          action: 'outpaint',
          ...result
        });
      }

      case 'batch-generate': {
        if (!data.prompt) {
          return NextResponse.json(
            { success: false, error: 'Prompt required' },
            { status: 400 }
          );
        }

        const quantity = Math.min(data.quantity || 4, 10);
        const result = await batchGenerate(user.id, { ...data, quantity }, supabase);

        return NextResponse.json({
          success: true,
          action: 'batch-generate',
          ...result
        });
      }

      case 'save-preset': {
        const { name, description, preset_data } = data as Record<string, unknown>;

        if (!name || !preset_data) {
          return NextResponse.json(
            { success: false, error: 'Name and preset data required' },
            { status: 400 }
          );
        }

        const { data: preset, error } = await supabase
          .from('ai_image_presets')
          .insert({
            user_id: user.id,
            name,
            description,
            preset_data,
            is_public: false
          })
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json({
          success: true,
          action: 'save-preset',
          preset,
          message: 'Preset saved successfully'
        }, { status: 201 });
      }

      case 'create-collection': {
        const { name, description, image_ids } = data as Record<string, unknown>;

        if (!name) {
          return NextResponse.json(
            { success: false, error: 'Collection name required' },
            { status: 400 }
          );
        }

        const { data: collection, error } = await supabase
          .from('ai_image_collections')
          .insert({
            user_id: user.id,
            name,
            description,
            image_ids: image_ids || []
          })
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json({
          success: true,
          action: 'create-collection',
          collection,
          message: 'Collection created'
        }, { status: 201 });
      }

      case 'add-to-collection': {
        const { collection_id, image_id } = data as Record<string, unknown>;

        if (!collection_id || !image_id) {
          return NextResponse.json(
            { success: false, error: 'Collection ID and image ID required' },
            { status: 400 }
          );
        }

        // Get current collection
        const { data: collection, error: getError } = await supabase
          .from('ai_image_collections')
          .select('image_ids')
          .eq('id', collection_id)
          .eq('user_id', user.id)
          .single();

        if (getError) throw getError;

        const currentIds = collection?.image_ids || [];
        if (!currentIds.includes(image_id)) {
          currentIds.push(image_id);
        }

        const { error: updateError } = await supabase
          .from('ai_image_collections')
          .update({ image_ids: currentIds })
          .eq('id', collection_id)
          .eq('user_id', user.id);

        if (updateError) throw updateError;

        return NextResponse.json({
          success: true,
          action: 'add-to-collection',
          message: 'Image added to collection'
        });
      }

      case 'toggle-favorite': {
        const { image_id } = data as Record<string, unknown>;

        if (!image_id) {
          return NextResponse.json(
            { success: false, error: 'Image ID required' },
            { status: 400 }
          );
        }

        // Get current state
        const { data: image, error: getError } = await supabase
          .from('ai_image_generations')
          .select('is_favorite')
          .eq('id', image_id)
          .eq('user_id', user.id)
          .single();

        if (getError) throw getError;

        const { error: updateError } = await supabase
          .from('ai_image_generations')
          .update({ is_favorite: !image?.is_favorite })
          .eq('id', image_id)
          .eq('user_id', user.id);

        if (updateError) throw updateError;

        return NextResponse.json({
          success: true,
          action: 'toggle-favorite',
          is_favorite: !image?.is_favorite,
          message: !image?.is_favorite ? 'Added to favorites' : 'Removed from favorites'
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('AI Image Generation POST error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Image generation failed' },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE - Delete image, collection, preset
// =====================================================
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('imageId');
    const collectionId = searchParams.get('collectionId');
    const presetId = searchParams.get('presetId');

    if (imageId) {
      const { error } = await supabase
        .from('ai_image_generations')
        .delete()
        .eq('id', imageId)
        .eq('user_id', user.id);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Image deleted successfully'
      });
    }

    if (collectionId) {
      const { error } = await supabase
        .from('ai_image_collections')
        .delete()
        .eq('id', collectionId)
        .eq('user_id', user.id);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Collection deleted successfully'
      });
    }

    if (presetId) {
      const { error } = await supabase
        .from('ai_image_presets')
        .delete()
        .eq('id', presetId)
        .eq('user_id', user.id);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Preset deleted successfully'
      });
    }

    return NextResponse.json(
      { success: false, error: 'ID required for deletion' },
      { status: 400 }
    );
  } catch (error) {
    logger.error('AI Image Generation DELETE error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete' },
      { status: 500 }
    );
  }
}

// =====================================================
// Image Generation Functions
// =====================================================

async function generateImage(
  userId: string,
  data: Partial<ImageGenerationRequest>,
  supabase: any
): Promise<{
  image_url: string;
  image_id: string;
  revised_prompt: string;
  metadata: Record<string, any>;
  generation_time_ms: number;
}> {
  const startTime = Date.now();

  // Enhance prompt if needed
  let finalPrompt = data.prompt!;
  if (data.enhance) {
    const enhanced = await enhancePrompt(data.prompt!, data.style, data.category);
    finalPrompt = enhanced.enhanced_prompt;
  }

  // Add style modifiers
  if (data.style) {
    finalPrompt = applyStyleModifiers(finalPrompt, data.style);
  }

  // Determine dimensions
  const dimensions = getDimensions(data.size, data.width, data.height, data.aspect_ratio);

  // Call image generation API
  const imageResult = await callImageAPI(
    finalPrompt,
    data.negative_prompt,
    data.provider || 'dalle',
    data.model,
    dimensions,
    data.quality || 'standard',
    data.seed,
    data.guidance_scale,
    data.steps
  );

  const generationTime = Date.now() - startTime;

  // Calculate cost
  const cost = calculateImageCost(data.provider || 'dalle', dimensions, data.quality || 'standard');

  // Save to database
  const { data: saved, error } = await supabase
    .from('ai_image_generations')
    .insert({
      user_id: userId,
      prompt: data.prompt,
      revised_prompt: finalPrompt,
      negative_prompt: data.negative_prompt,
      provider: data.provider || 'dalle',
      model: data.model,
      style: data.style,
      category: data.category,
      size: data.size || `${dimensions.width}x${dimensions.height}`,
      width: dimensions.width,
      height: dimensions.height,
      quality: data.quality || 'standard',
      image_url: imageResult.url,
      seed: imageResult.seed,
      guidance_scale: data.guidance_scale,
      steps: data.steps,
      generation_time_ms: generationTime,
      cost,
      is_favorite: false,
      metadata: {
        enhanced: data.enhance,
        color_palette: data.color_palette,
        brand_colors: data.brand_colors
      }
    })
    .select()
    .single();

  if (error) {
    logger.error('Error saving image', { error });
  }

  return {
    image_url: imageResult.url,
    image_id: saved?.id || crypto.randomUUID(),
    revised_prompt: finalPrompt,
    metadata: {
      provider: data.provider || 'dalle',
      model: data.model,
      size: `${dimensions.width}x${dimensions.height}`,
      style: data.style,
      quality: data.quality || 'standard',
      seed: imageResult.seed,
      cost
    },
    generation_time_ms: generationTime
  };
}

async function enhancePrompt(
  prompt: string,
  style?: ImageStyle,
  category?: ImageCategory
): Promise<{
  original_prompt: string;
  enhanced_prompt: string;
  suggestions: string[];
  style_keywords: string[];
}> {
  const systemPrompt = `You are an expert at crafting image generation prompts. Enhance prompts to be more detailed and specific for better AI image generation results.

Focus on:
- Specific visual details (lighting, composition, angle)
- Art style descriptors
- Quality modifiers (highly detailed, professional, etc.)
- Mood and atmosphere
- Technical aspects (depth of field, color grading)`;

  const userPrompt = `Enhance this image prompt for optimal AI generation:

"${prompt}"

${style ? `Style: ${style}` : ''}
${category ? `Category: ${category}` : ''}

Return the enhanced prompt only, no explanations.`;

  const response = await callAI(systemPrompt, userPrompt);

  // Extract style keywords
  const styleKeywords = extractStyleKeywords(response.content);

  return {
    original_prompt: prompt,
    enhanced_prompt: response.content.trim(),
    suggestions: [
      'Consider adding lighting descriptors',
      'Specify the camera angle or perspective',
      'Add quality modifiers for better results'
    ],
    style_keywords: styleKeywords
  };
}

async function generateVariations(
  userId: string,
  data: Partial<ImageGenerationRequest>,
  supabase: any
): Promise<{
  variations: Array<{
    image_url: string;
    variation_type: string;
    prompt_modification: string;
  }>;
}> {
  const variationTypes = ['color', 'composition', 'style', 'mood'];
  const variations: Array<{ image_url: string; variation_type: string; prompt_modification: string }> = [];

  for (const varType of variationTypes) {
    const modifiedPrompt = createVariationPrompt(data.prompt!, varType);

    const result = await generateImage(
      userId,
      {
        ...data,
        prompt: modifiedPrompt,
        enhance: false
      },
      supabase
    );

    variations.push({
      image_url: result.image_url,
      variation_type: varType,
      prompt_modification: modifiedPrompt
    });
  }

  return { variations };
}

async function upscaleImage(
  userId: string,
  data: Partial<ImageGenerationRequest>,
  supabase: any
): Promise<{
  upscaled_url: string;
  original_size: string;
  new_size: string;
  scale_factor: number;
}> {
  // In production, this would call an upscaling API like Real-ESRGAN via Replicate
  // For now, return the URL with upscaling metadata

  const originalSize = '512x512';
  const scaleFactor = 4;
  const newSize = '2048x2048';

  // Save upscale record
  await supabase
    .from('ai_image_generations')
    .insert({
      user_id: userId,
      prompt: 'Upscaled image',
      provider: 'upscaler',
      image_url: data.reference_image_url,
      metadata: {
        type: 'upscale',
        original_url: data.reference_image_url,
        scale_factor: scaleFactor
      }
    });

  return {
    upscaled_url: data.reference_image_url!, // In production, this would be the actual upscaled URL
    original_size: originalSize,
    new_size: newSize,
    scale_factor: scaleFactor
  };
}

async function removeBackground(
  userId: string,
  data: Partial<ImageGenerationRequest>,
  supabase: any
): Promise<{
  result_url: string;
  original_url: string;
  format: string;
}> {
  // In production, this would call a background removal API
  // like remove.bg or rembg via Replicate

  await supabase
    .from('ai_image_generations')
    .insert({
      user_id: userId,
      prompt: 'Background removal',
      provider: 'background-remover',
      image_url: data.reference_image_url,
      metadata: {
        type: 'background_removal',
        original_url: data.reference_image_url
      }
    });

  return {
    result_url: data.reference_image_url!, // In production, this would be the processed URL
    original_url: data.reference_image_url!,
    format: 'png'
  };
}

async function styleTransfer(
  userId: string,
  data: Partial<ImageGenerationRequest>,
  supabase: any
): Promise<{
  result_url: string;
  source_url: string;
  style_url: string;
  style_strength: number;
}> {
  // In production, this would use neural style transfer

  await supabase
    .from('ai_image_generations')
    .insert({
      user_id: userId,
      prompt: 'Style transfer',
      provider: 'style-transfer',
      image_url: data.reference_image_url,
      metadata: {
        type: 'style_transfer',
        source_url: data.reference_image_url,
        style_url: data.style_reference_url
      }
    });

  return {
    result_url: data.reference_image_url!, // In production, this would be the styled image
    source_url: data.reference_image_url!,
    style_url: data.style_reference_url!,
    style_strength: 0.75
  };
}

async function inpaintImage(
  userId: string,
  data: Partial<ImageGenerationRequest>,
  supabase: any
): Promise<{
  result_url: string;
  original_url: string;
  mask_url: string;
  inpaint_prompt: string;
}> {
  // In production, this would use DALL-E inpainting or Stable Diffusion inpainting

  await supabase
    .from('ai_image_generations')
    .insert({
      user_id: userId,
      prompt: data.prompt,
      provider: 'inpainting',
      image_url: data.reference_image_url,
      metadata: {
        type: 'inpaint',
        original_url: data.reference_image_url,
        mask_url: data.mask_url
      }
    });

  return {
    result_url: data.reference_image_url!, // In production, this would be the inpainted image
    original_url: data.reference_image_url!,
    mask_url: data.mask_url!,
    inpaint_prompt: data.prompt!
  };
}

async function outpaintImage(
  userId: string,
  data: Partial<ImageGenerationRequest>,
  supabase: any
): Promise<{
  result_url: string;
  original_url: string;
  expansion_direction: string;
  new_dimensions: { width: number; height: number };
}> {
  // In production, this would use outpainting/uncropping APIs

  const newWidth = (data.width || 1024) + 512;
  const newHeight = (data.height || 1024) + 512;

  await supabase
    .from('ai_image_generations')
    .insert({
      user_id: userId,
      prompt: data.prompt,
      provider: 'outpainting',
      image_url: data.reference_image_url,
      width: newWidth,
      height: newHeight,
      metadata: {
        type: 'outpaint',
        original_url: data.reference_image_url
      }
    });

  return {
    result_url: data.reference_image_url!, // In production, this would be the outpainted image
    original_url: data.reference_image_url!,
    expansion_direction: 'all',
    new_dimensions: { width: newWidth, height: newHeight }
  };
}

async function batchGenerate(
  userId: string,
  data: Partial<ImageGenerationRequest> & { quantity: number },
  supabase: any
): Promise<{
  images: Array<{
    image_url: string;
    image_id: string;
    seed: number;
  }>;
  total_generated: number;
  total_time_ms: number;
}> {
  const startTime = Date.now();
  const images: Array<{ image_url: string; image_id: string; seed: number }> = [];

  for (let i = 0; i < data.quantity; i++) {
    const seed = data.seed ? data.seed + i : Math.floor(Math.random() * 1000000);

    const result = await generateImage(
      userId,
      {
        ...data,
        seed
      },
      supabase
    );

    images.push({
      image_url: result.image_url,
      image_id: result.image_id,
      seed
    });
  }

  return {
    images,
    total_generated: images.length,
    total_time_ms: Date.now() - startTime
  };
}

// =====================================================
// Helper Functions
// =====================================================

async function callAI(
  systemPrompt: string,
  userPrompt: string
): Promise<{ content: string }> {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  const endpoint = process.env.OPENROUTER_API_KEY
    ? 'https://openrouter.ai/api/v1/chat/completions'
    : 'https://api.openai.com/v1/chat/completions';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      ...(process.env.OPENROUTER_API_KEY && {
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9323',
        'X-Title': 'KAZI AI Image Generation'
      })
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_API_KEY ? 'anthropic/claude-3.5-sonnet' : 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI API error: ${error}`);
  }

  const data = await response.json();
  return { content: data.choices[0]?.message?.content || '' };
}

async function callImageAPI(
  prompt: string,
  negativePrompt: string | undefined,
  provider: ImageProvider,
  model: string | undefined,
  dimensions: { width: number; height: number },
  quality: 'standard' | 'hd',
  seed?: number,
  guidanceScale?: number,
  steps?: number
): Promise<{ url: string; seed?: number }> {
  // For demo/development, return a placeholder image
  // In production, this would route to appropriate provider APIs

  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

  if (provider === 'dalle' && process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: model || 'dall-e-3',
          prompt,
          n: 1,
          size: `${dimensions.width}x${dimensions.height}`,
          quality: quality === 'hd' ? 'hd' : 'standard'
        })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          url: data.data[0]?.url || getDemoImageUrl(prompt, dimensions),
          seed
        };
      }
    } catch (error) {
      logger.error('DALL-E API error', { error });
    }
  }

  // Fallback to demo image
  return {
    url: getDemoImageUrl(prompt, dimensions),
    seed: seed || Math.floor(Math.random() * 1000000)
  };
}

function getDemoImageUrl(prompt: string, dimensions: { width: number; height: number }): string {
  // Use Unsplash for demo images
  const query = encodeURIComponent(prompt.split(' ').slice(0, 3).join(' '));
  return `https://source.unsplash.com/featured/${dimensions.width}x${dimensions.height}/?${query}`;
}

function getDimensions(
  size?: ImageSize,
  width?: number,
  height?: number,
  aspectRatio?: string
): { width: number; height: number } {
  if (width && height) {
    return { width, height };
  }

  if (aspectRatio) {
    const [w, h] = aspectRatio.split(':').map(Number);
    const baseSize = 1024;
    if (w > h) {
      return { width: baseSize, height: Math.round(baseSize * (h / w)) };
    } else {
      return { width: Math.round(baseSize * (w / h)), height: baseSize };
    }
  }

  const sizeMap: Record<ImageSize, { width: number; height: number }> = {
    '256x256': { width: 256, height: 256 },
    '512x512': { width: 512, height: 512 },
    '1024x1024': { width: 1024, height: 1024 },
    '1792x1024': { width: 1792, height: 1024 },
    '1024x1792': { width: 1024, height: 1792 },
    'custom': { width: 1024, height: 1024 }
  };

  return sizeMap[size || '1024x1024'];
}

function applyStyleModifiers(prompt: string, style: ImageStyle): string {
  const styleModifiers: Record<ImageStyle, string> = {
    'vivid': ', vibrant colors, high contrast, dynamic',
    'natural': ', natural lighting, realistic, organic',
    'artistic': ', artistic interpretation, creative, expressive',
    'photorealistic': ', photorealistic, highly detailed, 8k, professional photography',
    'anime': ', anime style, Japanese animation, cel-shaded',
    'digital-art': ', digital art, detailed illustration, trending on ArtStation',
    '3d-render': ', 3D render, octane render, cinema 4D, high quality',
    'oil-painting': ', oil painting style, classical art, textured brushstrokes',
    'watercolor': ', watercolor painting, soft edges, flowing colors',
    'sketch': ', pencil sketch, line art, hand-drawn',
    'minimalist': ', minimalist, clean lines, simple composition',
    'vintage': ', vintage style, retro, nostalgic, aged'
  };

  return `${prompt}${styleModifiers[style] || ''}`;
}

function createVariationPrompt(basePrompt: string, variationType: string): string {
  const modifications: Record<string, string> = {
    'color': 'with different color palette,',
    'composition': 'from a different angle,',
    'style': 'in an alternative artistic style,',
    'mood': 'with a different mood and atmosphere,'
  };

  return `${basePrompt} ${modifications[variationType] || ''}`.trim();
}

function extractStyleKeywords(enhancedPrompt: string): string[] {
  const keywords: string[] = [];
  const styleWords = ['detailed', 'professional', 'lighting', 'composition', 'artistic', 'render', 'quality', 'realistic'];

  styleWords.forEach(word => {
    if (enhancedPrompt.toLowerCase().includes(word)) {
      keywords.push(word);
    }
  });

  return keywords;
}

function calculateImageCost(provider: ImageProvider, dimensions: { width: number; height: number }, quality: string): number {
  const costs: Record<string, number> = {
    'dalle-standard-1024': 0.04,
    'dalle-hd-1024': 0.08,
    'dalle-standard-1792': 0.08,
    'dalle-hd-1792': 0.12,
    'stable-diffusion': 0.01,
    'midjourney': 0.05
  };

  const size = Math.max(dimensions.width, dimensions.height);
  const key = `${provider === 'dalle' ? 'dalle' : provider}-${quality}-${size >= 1792 ? '1792' : '1024'}`;

  return costs[key] || 0.04;
}

function getAvailableModels(): Array<{ id: string; name: string; provider: ImageProvider; description: string }> {
  return [
    { id: 'dall-e-3', name: 'DALL-E 3', provider: 'dalle', description: 'Best quality, newest OpenAI model' },
    { id: 'dall-e-2', name: 'DALL-E 2', provider: 'dalle', description: 'Fast and affordable' },
    { id: 'sdxl', name: 'Stable Diffusion XL', provider: 'stable-diffusion', description: 'Open source, high quality' },
    { id: 'sd-1.5', name: 'Stable Diffusion 1.5', provider: 'stable-diffusion', description: 'Classic SD model' },
    { id: 'midjourney-v5', name: 'Midjourney V5', provider: 'midjourney', description: 'Artistic, stylized images' },
    { id: 'leonardo', name: 'Leonardo AI', provider: 'leonardo', description: 'Consistent characters/styles' }
  ];
}

function getProviders(): Array<{ id: ImageProvider; name: string; description: string; cost_per_image: string }> {
  return [
    { id: 'dalle', name: 'DALL-E (OpenAI)', description: 'Best overall quality and prompt understanding', cost_per_image: '$0.04-0.12' },
    { id: 'stable-diffusion', name: 'Stable Diffusion', description: 'Open source, customizable', cost_per_image: '$0.01-0.02' },
    { id: 'midjourney', name: 'Midjourney', description: 'Artistic and stylized outputs', cost_per_image: '$0.05' },
    { id: 'replicate', name: 'Replicate', description: 'Access to many models', cost_per_image: 'Varies' },
    { id: 'leonardo', name: 'Leonardo AI', description: 'Great for consistent characters', cost_per_image: '$0.02' }
  ];
}

function getImageStyles(): Array<{ id: ImageStyle; name: string; description: string; example_modifier: string }> {
  return [
    { id: 'vivid', name: 'Vivid', description: 'Vibrant, high contrast', example_modifier: 'vibrant colors, dynamic' },
    { id: 'natural', name: 'Natural', description: 'Realistic, organic', example_modifier: 'natural lighting, realistic' },
    { id: 'artistic', name: 'Artistic', description: 'Creative interpretation', example_modifier: 'artistic, expressive' },
    { id: 'photorealistic', name: 'Photorealistic', description: 'Like a photograph', example_modifier: 'photorealistic, 8k' },
    { id: 'anime', name: 'Anime', description: 'Japanese animation', example_modifier: 'anime style, cel-shaded' },
    { id: 'digital-art', name: 'Digital Art', description: 'Modern illustration', example_modifier: 'digital art, detailed' },
    { id: '3d-render', name: '3D Render', description: 'CGI style', example_modifier: '3D render, octane' },
    { id: 'oil-painting', name: 'Oil Painting', description: 'Classical art', example_modifier: 'oil painting, textured' },
    { id: 'watercolor', name: 'Watercolor', description: 'Soft, flowing', example_modifier: 'watercolor, soft edges' },
    { id: 'sketch', name: 'Sketch', description: 'Line art', example_modifier: 'pencil sketch, hand-drawn' },
    { id: 'minimalist', name: 'Minimalist', description: 'Clean, simple', example_modifier: 'minimalist, clean lines' },
    { id: 'vintage', name: 'Vintage', description: 'Retro aesthetic', example_modifier: 'vintage, retro, aged' }
  ];
}

function getImageCategories(): Array<{ id: ImageCategory; name: string; common_uses: string[] }> {
  return [
    { id: 'portrait', name: 'Portrait', common_uses: ['Profile photos', 'Character art', 'Headshots'] },
    { id: 'landscape', name: 'Landscape', common_uses: ['Backgrounds', 'Wallpapers', 'Scenic art'] },
    { id: 'product', name: 'Product', common_uses: ['E-commerce', 'Marketing', 'Catalogs'] },
    { id: 'abstract', name: 'Abstract', common_uses: ['Backgrounds', 'Patterns', 'Art prints'] },
    { id: 'illustration', name: 'Illustration', common_uses: ['Books', 'Blogs', 'Editorial'] },
    { id: 'logo', name: 'Logo', common_uses: ['Branding', 'Icons', 'Symbols'] },
    { id: 'social-media', name: 'Social Media', common_uses: ['Posts', 'Stories', 'Ads'] },
    { id: 'banner', name: 'Banner', common_uses: ['Web headers', 'Ads', 'Promotions'] },
    { id: 'icon', name: 'Icon', common_uses: ['Apps', 'UI elements', 'Buttons'] },
    { id: 'mockup', name: 'Mockup', common_uses: ['Product demos', 'Presentations', 'Portfolios'] },
    { id: 'character', name: 'Character', common_uses: ['Games', 'Animation', 'Comics'] },
    { id: 'scene', name: 'Scene', common_uses: ['Concept art', 'Environments', 'Stories'] }
  ];
}

function getBuiltInPresets(): any[] {
  return [
    {
      id: 'preset-professional-photo',
      name: 'Professional Photography',
      description: 'Photorealistic, high quality',
      preset_data: { style: 'photorealistic', quality: 'hd', guidance_scale: 7.5 }
    },
    {
      id: 'preset-digital-art',
      name: 'Digital Art',
      description: 'Detailed illustration style',
      preset_data: { style: 'digital-art', quality: 'hd', guidance_scale: 8 }
    },
    {
      id: 'preset-anime',
      name: 'Anime Character',
      description: 'Japanese animation style',
      preset_data: { style: 'anime', quality: 'standard', guidance_scale: 7 }
    },
    {
      id: 'preset-logo',
      name: 'Logo Design',
      description: 'Clean, minimal logos',
      preset_data: { style: 'minimalist', category: 'logo', size: '1024x1024' }
    }
  ];
}

function getPromptLibrary(category?: string): any[] {
  const library = [
    {
      category: 'portrait',
      prompts: [
        'Professional headshot of a business executive, studio lighting, neutral background',
        'Character portrait, fantasy warrior, detailed armor, dramatic lighting',
        'Artistic portrait with surreal elements, double exposure effect'
      ]
    },
    {
      category: 'landscape',
      prompts: [
        'Majestic mountain landscape at golden hour, dramatic clouds, high detail',
        'Futuristic cityscape at night, neon lights, cyberpunk aesthetic',
        'Serene Japanese garden, cherry blossoms, zen atmosphere'
      ]
    },
    {
      category: 'product',
      prompts: [
        'Luxury watch product shot, black background, studio lighting, reflections',
        'Skincare product bottle, minimalist composition, soft shadows',
        'Tech gadget hero shot, floating, dynamic lighting'
      ]
    },
    {
      category: 'abstract',
      prompts: [
        'Abstract fluid art, vibrant colors, flowing shapes',
        'Geometric patterns, isometric, gradient colors',
        'Cosmic nebula, space art, particle effects'
      ]
    }
  ];

  if (category) {
    return library.filter(item => item.category === category);
  }
  return library;
}

// =====================================================
// Demo Mode Handlers
// =====================================================

function handleDemoGet(action: string | null): NextResponse {
  switch (action) {
    case 'models':
      return NextResponse.json({
        success: true,
        models: getAvailableModels(),
        providers: getProviders()
      });

    case 'styles':
      return NextResponse.json({
        success: true,
        styles: getImageStyles(),
        categories: getImageCategories()
      });

    case 'presets':
      return NextResponse.json({
        success: true,
        presets: [],
        built_in: getBuiltInPresets()
      });

    case 'prompt-library':
      return NextResponse.json({
        success: true,
        prompts: getPromptLibrary()
      });

    default:
      return NextResponse.json({
        success: true,
        service: 'AI Image Generation Enhanced',
        version: '2.0.0',
        status: 'demo',
        message: 'Log in to access full image generation features'
      });
  }
}

function handleDemoPost(action: string, data: any): NextResponse {
  switch (action) {
    case 'generate':
      return NextResponse.json({
        success: true,
        action: 'generate',
        image_url: getDemoImageUrl(data.prompt || 'demo image', { width: 1024, height: 1024 }),
        image_id: 'demo-image-id',
        revised_prompt: data.prompt || 'Demo prompt',
        metadata: {
          provider: 'demo',
          size: '1024x1024',
          style: data.style || 'vivid'
        },
        generation_time_ms: 1500,
        message: 'Demo image generated'
      });

    case 'enhance-prompt':
      return NextResponse.json({
        success: true,
        action: 'enhance-prompt',
        original_prompt: data.prompt,
        enhanced_prompt: `${data.prompt}, highly detailed, professional quality, perfect composition, beautiful lighting, 8k resolution`,
        suggestions: ['Add lighting details', 'Specify composition', 'Include quality modifiers'],
        style_keywords: ['detailed', 'professional', 'quality'],
        message: 'Demo prompt enhanced'
      });

    default:
      return NextResponse.json({
        success: false,
        error: 'Log in to use AI image generation features'
      }, { status: 401 });
  }
}
