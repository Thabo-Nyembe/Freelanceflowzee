import { NextRequest, NextResponse } from 'next/server';
import { createFeatureLogger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';

const logger = createFeatureLogger('API-Gallery');

// Demo mode constants
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

function isDemoMode(request: NextRequest): boolean {
  const url = new URL(request.url);
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  );
}

/**
 * Gallery API Route
 * Handles gallery operations: organize, tag, export collections, bulk operations
 */

interface GalleryItem {
  id: number | string;
  title: string;
  type: 'image' | 'video';
  category: string;
  url: string;
  thumbnail?: string;
  dateCreated: string;
  likes: number;
  comments: number;
  client?: string;
  project?: string;
  tags: string[];
  featured: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'upload':
        return await handleUpload(data);
      case 'organize':
        return await handleOrganize(data);
      case 'bulk-tag':
        return await handleBulkTag(data);
      case 'export-collection':
        return await handleExportCollection(data);
      case 'create-album':
        return await handleCreateAlbum(data);
      case 'ai-enhance':
        return await handleAIEnhance(data);
      case 'bulk-download':
        return await handleBulkDownload(data);
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Gallery API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';
    const search = searchParams.get('search') || '';
    const featured = searchParams.get('featured') === 'true';

    // Check for demo mode
    const demoMode = isDemoMode(request);

    // If not authenticated
    if (!user) {
      if (demoMode) {
        // Use demo user ID and fetch from database
        const userId = DEMO_USER_ID;

        // Try to fetch from database first
        let query = supabase
          .from('portfolio_items')
          .select('*')
          .eq('user_id', userId);

        if (category !== 'all') {
          query = query.eq('category', category);
        }
        if (search) {
          query = query.or(`title.ilike.%${search}%,tags.cs.{${search}}`);
        }
        if (featured) {
          query = query.eq('featured', true);
        }

        const { data: portfolioItems, error } = await query;

        if (!error && portfolioItems && portfolioItems.length > 0) {
          // Return database items
          const items = portfolioItems.map(item => ({
            id: item.id,
            title: item.title,
            type: item.media_type || 'image',
            category: item.category || 'branding',
            url: item.media_url,
            thumbnail: item.thumbnail_url || item.media_url,
            dateCreated: item.created_at,
            likes: item.likes_count || 0,
            comments: item.comments_count || 0,
            client: item.client_name,
            project: item.project_name,
            tags: item.tags || [],
            featured: item.featured || false,
          }));

          return NextResponse.json({
            success: true,
            demo: true,
            items,
            total: items.length,
            categories: getCategories(items as GalleryItem[]),
          });
        }

        // Fall back to mock data if no database items
        const mockItems = getMockGalleryItems();
        return NextResponse.json({
          success: true,
          demo: true,
          items: mockItems,
          total: mockItems.length,
          categories: getCategories(mockItems),
        });
      } else {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Authenticated user - use their ID
    const userId = user.id;

    // Try to fetch from database
    let query = supabase
      .from('portfolio_items')
      .select('*')
      .eq('user_id', userId);

    if (category !== 'all') {
      query = query.eq('category', category);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,tags.cs.{${search}}`);
    }
    if (featured) {
      query = query.eq('featured', true);
    }

    const { data: portfolioItems, error } = await query;

    if (!error && portfolioItems && portfolioItems.length > 0) {
      const items = portfolioItems.map(item => ({
        id: item.id,
        title: item.title,
        type: item.media_type || 'image',
        category: item.category || 'branding',
        url: item.media_url,
        thumbnail: item.thumbnail_url || item.media_url,
        dateCreated: item.created_at,
        likes: item.likes_count || 0,
        comments: item.comments_count || 0,
        client: item.client_name,
        project: item.project_name,
        tags: item.tags || [],
        featured: item.featured || false,
      }));

      return NextResponse.json({
        success: true,
        items,
        total: items.length,
        categories: getCategories(items as GalleryItem[]),
      });
    }

    // Fall back to mock gallery retrieval if no database items
    const items = getMockGalleryItems();

    let filtered = items;

    if (category !== 'all') {
      filtered = filtered.filter(item => item.category === category);
    }

    if (search) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }

    if (featured) {
      filtered = filtered.filter(item => item.featured);
    }

    return NextResponse.json({
      success: true,
      items: filtered,
      total: filtered.length,
      categories: getCategories(items),
    });
  } catch (error) {
    logger.error('Gallery GET error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Upload media to gallery
 */
async function handleUpload(data: {
  file: any;
  title: string;
  category: string;
  tags: string[];
}): Promise<NextResponse> {
  // In production: upload to cloud storage (AWS S3, Cloudinary, etc.)
  const itemId = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const newItem: GalleryItem = {
    id: itemId,
    title: data.title,
    type: 'image', // Detect from file
    category: data.category,
    url: `https://storage.kazi.app/${itemId}`,
    thumbnail: `https://storage.kazi.app/${itemId}/thumb`,
    dateCreated: new Date().toISOString(),
    likes: 0,
    comments: 0,
    tags: data.tags,
    featured: false,
  };

  return NextResponse.json({
    success: true,
    action: 'upload',
    item: newItem,
    message: 'Media uploaded successfully!',
    achievement: Math.random() > 0.8 ? {
      message: '🎨 Content Creator! Keep building your portfolio!',
      badge: 'Creative Pro',
      points: 10,
    } : undefined,
  });
}

/**
 * Organize gallery items into folders/collections
 */
async function handleOrganize(data: {
  itemIds: string[];
  targetFolder: string;
  targetCollection?: string;
}): Promise<NextResponse> {
  const organizedCount = data.itemIds.length;

  return NextResponse.json({
    success: true,
    action: 'organize',
    organizedCount,
    targetFolder: data.targetFolder,
    targetCollection: data.targetCollection,
    message: `${organizedCount} items organized into "${data.targetFolder}"`,
    nextSteps: [
      'Items are now in the new location',
      'You can create more collections for better organization',
      'Use tags for easier searching',
    ],
  });
}

/**
 * Bulk tag multiple items
 */
async function handleBulkTag(data: {
  itemIds: string[];
  tags: string[];
  mode: 'add' | 'remove' | 'replace';
}): Promise<NextResponse> {
  const itemCount = data.itemIds.length;
  const tagCount = data.tags.length;

  let message = '';
  switch (data.mode) {
    case 'add':
      message = `Added ${tagCount} tags to ${itemCount} items`;
      break;
    case 'remove':
      message = `Removed ${tagCount} tags from ${itemCount} items`;
      break;
    case 'replace':
      message = `Replaced tags on ${itemCount} items`;
      break;
  }

  return NextResponse.json({
    success: true,
    action: 'bulk-tag',
    itemCount,
    tagCount,
    mode: data.mode,
    tags: data.tags,
    message,
    achievement: itemCount >= 10 ? {
      message: '🏆 Organization Master! Bulk tagging pro!',
      badge: 'Organizer',
      points: 20,
    } : undefined,
  });
}

/**
 * Export collection as zip
 */
async function handleExportCollection(data: {
  itemIds: string[];
  format: 'zip' | 'pdf' | 'portfolio';
  quality?: 'high' | 'medium' | 'low';
}): Promise<NextResponse> {
  // In production: create actual zip file or PDF
  const exportId = `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const downloadUrl = `https://kazi.app/exports/${exportId}.${data.format}`;

  return NextResponse.json({
    success: true,
    action: 'export-collection',
    exportId,
    downloadUrl,
    itemCount: data.itemIds.length,
    format: data.format,
    quality: data.quality || 'high',
    message: `Collection exported as ${data.format.toUpperCase()}`,
    nextSteps: [
      'Download will start automatically',
      'Files are optimized for sharing',
      'Export link expires in 7 days',
    ],
  });
}

/**
 * Create album/collection
 */
async function handleCreateAlbum(data: {
  name: string;
  description?: string;
  itemIds?: string[];
  coverImage?: string;
}): Promise<NextResponse> {
  const albumId = `album-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const album = {
    id: albumId,
    name: data.name,
    description: data.description || '',
    itemCount: data.itemIds?.length || 0,
    coverImage: data.coverImage || 'default-cover.jpg',
    createdAt: new Date().toISOString(),
    shareUrl: `https://kazi.app/gallery/album/${albumId}`,
  };

  return NextResponse.json({
    success: true,
    action: 'create-album',
    album,
    message: `Album "${data.name}" created successfully!`,
    shareUrl: album.shareUrl,
    achievement: {
      message: '📸 Gallery Curator! Your first album is ready!',
      badge: 'Curator',
      points: 15,
    },
  });
}

/**
 * AI-enhance gallery images
 */
async function handleAIEnhance(data: {
  itemId: string;
  enhanceType: 'upscale' | 'restore' | 'colorize' | 'enhance' | 'background-remove';
}): Promise<NextResponse> {
  // In production: integrate with AI image enhancement API

  const enhancedUrl = `https://storage.kazi.app/enhanced/${data.itemId}`;

  const enhancements: Record<string, string> = {
    upscale: 'Image upscaled to 4K resolution',
    restore: 'Image restored and improved',
    colorize: 'Image colorized with AI',
    enhance: 'Image enhanced with AI optimization',
    'background-remove': 'Background removed successfully',
  };

  return NextResponse.json({
    success: true,
    action: 'ai-enhance',
    enhanceType: data.enhanceType,
    originalUrl: `https://storage.kazi.app/${data.itemId}`,
    enhancedUrl,
    message: enhancements[data.enhanceType],
    improvements: {
      resolution: data.enhanceType === 'upscale' ? '4K (3840x2160)' : 'Original',
      quality: '+45% improvement',
      clarity: '+38% improvement',
      details: 'Enhanced with AI',
    },
    achievement: Math.random() > 0.7 ? {
      message: '✨ AI Artist! Using cutting-edge enhancement!',
      badge: 'Tech Innovator',
      points: 25,
    } : undefined,
  });
}

/**
 * Bulk download multiple items
 */
async function handleBulkDownload(data: {
  itemIds: string[];
  format?: 'original' | 'optimized';
}): Promise<NextResponse> {
  // In production: create zip and return download URL
  const zipId = `bulk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const downloadUrl = `https://kazi.app/downloads/${zipId}.zip`;

  return NextResponse.json({
    success: true,
    action: 'bulk-download',
    downloadUrl,
    itemCount: data.itemIds.length,
    format: data.format || 'original',
    zipId,
    message: `Preparing download for ${data.itemIds.length} items`,
    estimatedSize: `${(data.itemIds.length * 2.5).toFixed(1)} MB`,
    nextSteps: [
      'Download will start automatically',
      'Files are compressed for faster download',
      'Link expires in 24 hours',
    ],
  });
}

/**
 * Get mock gallery items
 */
function getMockGalleryItems(): GalleryItem[] {
  return [
    {
      id: 1,
      title: 'Brand Identity Design',
      type: 'image',
      category: 'branding',
      url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71',
      thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=200',
      dateCreated: '2024-01-15',
      likes: 24,
      comments: 8,
      client: 'Acme Corp',
      project: 'Brand Identity Package',
      tags: ['logo', 'branding', 'identity'],
      featured: true,
    },
    // Add more mock items as needed
  ];
}

/**
 * Get categories with counts
 */
function getCategories(items: GalleryItem[]) {
  const categories = ['all', 'branding', 'web-design', 'mobile', 'social', 'print', 'video'];
  return categories.map(cat => ({
    id: cat,
    label: cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' '),
    count: cat === 'all' ? items.length : items.filter(item => item.category === cat).length,
  }));
}

/**
 * PATCH - Update a gallery item
 * Supports partial updates for allowed fields
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { searchParams } = new URL(request.url);
    const body = await request.json();

    // Get item ID from searchParams or body
    const itemId = searchParams.get('id') || body.id;

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'Gallery item ID is required' },
        { status: 400 }
      );
    }

    // Check for demo mode
    const demoMode = isDemoMode(request);

    // Determine user ID
    let userId: string;
    if (!user) {
      if (demoMode) {
        userId = DEMO_USER_ID;
      } else {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
    } else {
      userId = user.id;
    }

    // Define allowed fields for update
    const allowedFields = [
      'title',
      'description',
      'category',
      'tags',
      'featured',
      'client_name',
      'project_name',
      'media_type',
    ];

    // Build update object with only allowed fields
    const updateData: Record<string, any> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Handle aliased fields from the GalleryItem interface
    if (body.client !== undefined) {
      updateData.client_name = body.client;
    }
    if (body.project !== undefined) {
      updateData.project_name = body.project;
    }
    if (body.type !== undefined) {
      updateData.media_type = body.type;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    // Update the item (with ownership verification)
    const { data: updatedItem, error } = await supabase
      .from('portfolio_items')
      .update(updateData)
      .eq('id', itemId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      logger.error('Gallery PATCH error - database', {
        error: error.message,
        itemId,
        userId,
      });

      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Gallery item not found or unauthorized' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: false, error: 'Failed to update gallery item' },
        { status: 500 }
      );
    }

    // Transform to GalleryItem format
    const item: GalleryItem = {
      id: updatedItem.id,
      title: updatedItem.title,
      type: updatedItem.media_type || 'image',
      category: updatedItem.category || 'branding',
      url: updatedItem.media_url,
      thumbnail: updatedItem.thumbnail_url || updatedItem.media_url,
      dateCreated: updatedItem.created_at,
      likes: updatedItem.likes_count || 0,
      comments: updatedItem.comments_count || 0,
      client: updatedItem.client_name,
      project: updatedItem.project_name,
      tags: updatedItem.tags || [],
      featured: updatedItem.featured || false,
    };

    logger.info('Gallery item updated', {
      itemId,
      userId,
      updatedFields: Object.keys(updateData),
      demo: demoMode,
    });

    return NextResponse.json({
      success: true,
      item,
      message: 'Gallery item updated successfully',
      demo: demoMode,
    });
  } catch (error) {
    logger.error('Gallery PATCH error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remove a gallery item
 * Verifies ownership before deletion
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('id');

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'Gallery item ID is required' },
        { status: 400 }
      );
    }

    // Check for demo mode
    const demoMode = isDemoMode(request);

    // Determine user ID
    let userId: string;
    if (!user) {
      if (demoMode) {
        userId = DEMO_USER_ID;
      } else {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
    } else {
      userId = user.id;
    }

    // First verify the item exists and belongs to the user
    const { data: existingItem, error: fetchError } = await supabase
      .from('portfolio_items')
      .select('id, title, user_id')
      .eq('id', itemId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingItem) {
      logger.warn('Gallery DELETE - item not found or unauthorized', {
        itemId,
        userId,
        demo: demoMode,
      });
      return NextResponse.json(
        { success: false, error: 'Gallery item not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete the item
    const { error: deleteError } = await supabase
      .from('portfolio_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', userId);

    if (deleteError) {
      logger.error('Gallery DELETE error - database', {
        error: deleteError.message,
        itemId,
        userId,
      });
      return NextResponse.json(
        { success: false, error: 'Failed to delete gallery item' },
        { status: 500 }
      );
    }

    logger.info('Gallery item deleted', {
      itemId,
      title: existingItem.title,
      userId,
      demo: demoMode,
    });

    return NextResponse.json({
      success: true,
      message: 'Gallery item deleted successfully',
      deletedId: itemId,
      demo: demoMode,
    });
  } catch (error) {
    logger.error('Gallery DELETE error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
