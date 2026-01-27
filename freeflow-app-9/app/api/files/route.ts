import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { createFeatureLogger } from '@/lib/logger';

const logger = createFeatureLogger('API-Files');

// ============================================================================
// TYPES
// ============================================================================

type FileType = 'document' | 'image' | 'video' | 'audio' | 'archive' | 'code' | 'other';
type FileStatus = 'active' | 'archived' | 'deleted' | 'processing' | 'failed';
type AccessLevel = 'private' | 'team' | 'public' | 'restricted';
type StorageProvider = 'supabase' | 'wasabi' | 'aws-s3' | 'google-cloud' | 'azure';
type SharePermission = 'view' | 'comment' | 'edit' | 'admin';

interface FileItem {
  id: string;
  user_id: string;
  folder_id: string | null;
  name: string;
  original_name: string;
  type: FileType;
  extension: string;
  size: number;
  url: string;
  storage_provider: StorageProvider;
  storage_path: string;
  checksum: string;
  mime_type: string;
  description: string | null;
  thumbnail_url: string | null;
  preview_url: string | null;
  status: FileStatus;
  access_level: AccessLevel;
  is_starred: boolean;
  is_shared: boolean;
  is_locked: boolean;
  is_archived: boolean;
  downloads: number;
  views: number;
  version: number;
  width?: number;
  height?: number;
  duration?: number;
  uploaded_at: string;
  modified_at: string;
  created_at: string;
  updated_at: string;
}

interface Folder {
  id: string;
  user_id: string;
  parent_id: string | null;
  name: string;
  path: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  file_count: number;
  total_size: number;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// DEMO DATA (for unauthenticated users)
// ============================================================================

function getDemoFiles(): Partial<FileItem>[] {
  return [
    {
      id: 'demo-file-1',
      name: 'Project Proposal.pdf',
      type: 'document',
      extension: 'pdf',
      size: 2457600,
      url: 'https://storage.kazi.app/demo/proposal.pdf',
      thumbnail_url: 'https://storage.kazi.app/demo/proposal-thumb.png',
      status: 'active',
      access_level: 'private',
      is_starred: true,
      is_shared: false,
      downloads: 12,
      views: 45,
      version: 2,
      uploaded_at: new Date(Date.now() - 86400000).toISOString(),
      modified_at: new Date(Date.now() - 43200000).toISOString(),
    },
    {
      id: 'demo-file-2',
      name: 'Brand Guidelines.ai',
      type: 'image',
      extension: 'ai',
      size: 15728640,
      url: 'https://storage.kazi.app/demo/brand.ai',
      thumbnail_url: 'https://storage.kazi.app/demo/brand-thumb.png',
      status: 'active',
      access_level: 'team',
      is_starred: false,
      is_shared: true,
      downloads: 8,
      views: 23,
      version: 3,
      uploaded_at: new Date(Date.now() - 172800000).toISOString(),
      modified_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'demo-file-3',
      name: 'Client Presentation.pptx',
      type: 'document',
      extension: 'pptx',
      size: 8388608,
      url: 'https://storage.kazi.app/demo/presentation.pptx',
      thumbnail_url: 'https://storage.kazi.app/demo/presentation-thumb.png',
      status: 'active',
      access_level: 'private',
      is_starred: true,
      is_shared: true,
      downloads: 5,
      views: 18,
      version: 1,
      uploaded_at: new Date(Date.now() - 259200000).toISOString(),
      modified_at: new Date(Date.now() - 259200000).toISOString(),
    },
    {
      id: 'demo-file-4',
      name: 'Product Demo.mp4',
      type: 'video',
      extension: 'mp4',
      size: 104857600,
      url: 'https://storage.kazi.app/demo/video.mp4',
      thumbnail_url: 'https://storage.kazi.app/demo/video-thumb.png',
      status: 'active',
      access_level: 'public',
      is_starred: false,
      is_shared: true,
      downloads: 156,
      views: 892,
      version: 1,
      duration: 180,
      uploaded_at: new Date(Date.now() - 604800000).toISOString(),
      modified_at: new Date(Date.now() - 604800000).toISOString(),
    },
  ];
}

function getDemoFolders(): Partial<Folder>[] {
  return [
    {
      id: 'demo-folder-1',
      name: 'Client Projects',
      path: '/Client Projects',
      icon: 'folder',
      color: 'blue',
      file_count: 24,
      total_size: 125000000,
      is_shared: true,
      created_at: new Date(Date.now() - 2592000000).toISOString(),
    },
    {
      id: 'demo-folder-2',
      name: 'Brand Assets',
      path: '/Brand Assets',
      icon: 'folder',
      color: 'purple',
      file_count: 56,
      total_size: 450000000,
      is_shared: false,
      created_at: new Date(Date.now() - 5184000000).toISOString(),
    },
    {
      id: 'demo-folder-3',
      name: 'Marketing',
      path: '/Marketing',
      icon: 'folder',
      color: 'green',
      file_count: 18,
      total_size: 89000000,
      is_shared: true,
      created_at: new Date(Date.now() - 7776000000).toISOString(),
    },
  ];
}

// ============================================================================
// GET - Retrieve files and folders
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);

    // Query parameters
    const folderId = searchParams.get('folderId');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const status = searchParams.get('status') || 'active';
    const sortBy = searchParams.get('sortBy') || 'uploaded_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const starred = searchParams.get('starred');
    const shared = searchParams.get('shared');

    // Unauthenticated users get empty data
    if (!session?.user?.id) {
      return NextResponse.json({
        success: true,
        files: [],
        folders: [],
        storage: {
          used: 0,
          total: 100 * 1024 * 1024 * 1024,
          percentage: 0,
        },
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          totalPages: 0,
        },
      });
    }

    const supabase = await createClient();
    const userId = (session.user as any).authId || session.user.id;
    const userEmail = session.user.email;

    // Demo mode ONLY for demo account (test@kazi.dev)
    const isDemoAccount = userEmail === 'test@kazi.dev' || userEmail === 'demo@kazi.io';

    if (isDemoAccount) {
      let demoFiles = getDemoFiles();
      const demoFolders = getDemoFolders();

      if (type && type !== 'all') {
        demoFiles = demoFiles.filter(f => f.type === type);
      }

      if (search) {
        demoFiles = demoFiles.filter(f =>
          f.name?.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (starred === 'true') {
        demoFiles = demoFiles.filter(f => f.is_starred);
      }

      return NextResponse.json({
        success: true,
        demo: true,
        files: demoFiles,
        folders: demoFolders,
        storage: {
          used: 45.7 * 1024 * 1024 * 1024,
          total: 100 * 1024 * 1024 * 1024,
          percentage: 45.7,
        },
        pagination: {
          page: 1,
          limit: 50,
          total: demoFiles.length,
          totalPages: 1,
        },
      });
    }

    // Build files query
    let filesQuery = supabase
      .from('files')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('status', status);

    // Apply folder filter
    if (folderId && folderId !== 'root') {
      filesQuery = filesQuery.eq('folder_id', folderId);
    } else if (folderId === 'root') {
      filesQuery = filesQuery.is('folder_id', null);
    }

    // Apply type filter
    if (type && type !== 'all') {
      filesQuery = filesQuery.eq('type', type);
    }

    // Apply search
    if (search) {
      filesQuery = filesQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply starred filter
    if (starred === 'true') {
      filesQuery = filesQuery.eq('is_starred', true);
    }

    // Apply shared filter
    if (shared === 'true') {
      filesQuery = filesQuery.eq('is_shared', true);
    }

    // Apply sorting
    const ascending = sortOrder === 'asc';
    filesQuery = filesQuery.order(sortBy, { ascending });

    // Apply pagination
    const offset = (page - 1) * limit;
    filesQuery = filesQuery.range(offset, offset + limit - 1);

    // Execute files query
    const { data: files, error: filesError, count: filesCount } = await filesQuery;

    if (filesError) {
      logger.error('Files query error', { error: filesError });
      throw new Error(filesError.message);
    }

    // Build folders query
    let foldersQuery = supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId);

    if (folderId && folderId !== 'root') {
      foldersQuery = foldersQuery.eq('parent_id', folderId);
    } else {
      foldersQuery = foldersQuery.is('parent_id', null);
    }

    foldersQuery = foldersQuery.order('name', { ascending: true });

    const { data: folders, error: foldersError } = await foldersQuery;

    if (foldersError) {
      logger.error('Folders query error', { error: foldersError });
    }

    // Calculate storage usage
    const { data: storageData } = await supabase
      .from('files')
      .select('size')
      .eq('user_id', userId)
      .neq('status', 'deleted');

    const usedStorage = storageData?.reduce((acc, file) => acc + (file.size || 0), 0) || 0;
    const totalStorage = 100 * 1024 * 1024 * 1024; // 100 GB default

    return NextResponse.json({
      success: true,
      files: files || [],
      folders: folders || [],
      storage: {
        used: usedStorage,
        total: totalStorage,
        percentage: (usedStorage / totalStorage) * 100,
      },
      pagination: {
        page,
        limit,
        total: filesCount || 0,
        totalPages: Math.ceil((filesCount || 0) / limit),
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Files GET error', { error: errorMessage });
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - File and folder operations
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { action, data } = body;

    // Demo mode returns simulated responses
    if (!session?.user?.id) {
      return handleDemoAction(action, data);
    }

    const supabase = await createClient();
    const userId = (session.user as any).authId || session.user.id;

    switch (action) {
      case 'create-folder':
        return await handleCreateFolder(supabase, userId, data);
      case 'upload-file':
        return await handleUploadFile(supabase, userId, data);
      case 'download-file':
        return await handleDownloadFile(supabase, userId, data);
      case 'share-file':
        return await handleShareFile(supabase, userId, data);
      case 'move-files':
        return await handleMoveFiles(supabase, userId, data);
      case 'delete-files':
        return await handleDeleteFiles(supabase, userId, data);
      case 'restore-files':
        return await handleRestoreFiles(supabase, userId, data);
      case 'create-version':
        return await handleCreateVersion(supabase, userId, data);
      case 'generate-link':
        return await handleGenerateLink(supabase, userId, data);
      case 'star-files':
        return await handleStarFiles(supabase, userId, data);
      case 'lock-file':
        return await handleLockFile(supabase, userId, data);
      case 'rename':
        return await handleRename(supabase, userId, data);
      case 'update-metadata':
        return await handleUpdateMetadata(supabase, userId, data);
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Files POST error', { error: errorMessage });
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// ============================================================================
// DEMO ACTION HANDLER
// ============================================================================

function handleDemoAction(action: string, data: Record<string, unknown>): NextResponse {
  const demoId = `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  switch (action) {
    case 'create-folder':
      return NextResponse.json({
        success: true,
        demo: true,
        action: 'create-folder',
        folder: {
          id: demoId,
          name: data.name,
          path: `/${data.name}`,
          file_count: 0,
          total_size: 0,
          created_at: new Date().toISOString(),
        },
        message: `Demo: Folder "${data.name}" would be created`,
      });

    case 'upload-file':
      return NextResponse.json({
        success: true,
        demo: true,
        action: 'upload-file',
        file: {
          id: demoId,
          name: data.name,
          size: data.size,
          uploaded_at: new Date().toISOString(),
        },
        message: `Demo: File "${data.name}" would be uploaded`,
      });

    default:
      return NextResponse.json({
        success: true,
        demo: true,
        action,
        message: `Demo: Action "${action}" would be performed`,
      });
  }
}

// ============================================================================
// ACTION HANDLERS
// ============================================================================

async function handleCreateFolder(
  supabase: any,
  userId: string,
  data: { name: string; parentId?: string; color?: string; icon?: string; description?: string }
): Promise<NextResponse> {
  // Get parent folder path
  let parentPath = '';
  if (data.parentId) {
    const { data: parent } = await supabase
      .from('folders')
      .select('path')
      .eq('id', data.parentId)
      .single();
    parentPath = parent?.path || '';
  }

  const folderPath = `${parentPath}/${data.name}`;

  const { data: folder, error } = await supabase
    .from('folders')
    .insert({
      user_id: userId,
      parent_id: data.parentId || null,
      name: data.name,
      path: folderPath,
      color: data.color || 'blue',
      icon: data.icon || 'folder',
      description: data.description || null,
      file_count: 0,
      total_size: 0,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Log activity
  await logActivity(supabase, userId, folder.id, 'folder', 'create', {
    name: data.name,
    path: folderPath,
  });

  return NextResponse.json({
    success: true,
    action: 'create-folder',
    folder,
    message: `Folder "${data.name}" created successfully`,
  });
}

async function handleUploadFile(
  supabase: any,
  userId: string,
  data: {
    name: string;
    type: string;
    size: number;
    url: string;
    storagePath?: string;
    folderId?: string;
    tags?: string[];
    description?: string;
    checksum?: string;
    width?: number;
    height?: number;
    duration?: number;
  }
): Promise<NextResponse> {
  const fileType = determineFileType(data.type);
  const extension = data.name.split('.').pop() || '';

  const { data: file, error } = await supabase
    .from('files')
    .insert({
      user_id: userId,
      folder_id: data.folderId || null,
      name: data.name,
      original_name: data.name,
      type: fileType,
      extension,
      size: data.size,
      url: data.url,
      storage_path: data.storagePath || `files/${userId}/${data.name}`,
      storage_provider: (process.env.STORAGE_PROVIDER as StorageProvider) || 'supabase',
      mime_type: data.type,
      description: data.description || null,
      checksum: data.checksum || null,
      width: data.width,
      height: data.height,
      duration: data.duration,
      status: 'active',
      access_level: 'private',
      version: 1,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Update folder file count
  if (data.folderId) {
    await supabase.rpc('increment_folder_file_count', { folder_id: data.folderId });
  }

  // Log activity
  await logActivity(supabase, userId, file.id, 'file', 'upload', {
    name: data.name,
    size: data.size,
    type: fileType,
  });

  return NextResponse.json({
    success: true,
    action: 'upload-file',
    file,
    message: `File "${data.name}" uploaded successfully`,
  });
}

async function handleDownloadFile(
  supabase: any,
  userId: string,
  data: { fileId: string }
): Promise<NextResponse> {
  // Get file details
  const { data: file, error } = await supabase
    .from('files')
    .select('*')
    .eq('id', data.fileId)
    .single();

  if (error || !file) {
    return NextResponse.json(
      { success: false, error: 'File not found' },
      { status: 404 }
    );
  }

  // Increment download count
  await supabase
    .from('files')
    .update({
      downloads: (file.downloads || 0) + 1,
      last_accessed_at: new Date().toISOString()
    })
    .eq('id', data.fileId);

  // Log activity
  await logActivity(supabase, userId, data.fileId, 'file', 'download', {
    name: file.name,
  });

  // Generate signed URL if using Wasabi/S3
  const downloadUrl = file.url; // In production, generate signed URL

  return NextResponse.json({
    success: true,
    action: 'download-file',
    downloadUrl,
    file: {
      id: file.id,
      name: file.name,
      size: file.size,
      type: file.type,
    },
    expiresIn: '1 hour',
    message: 'Download ready',
  });
}

async function handleShareFile(
  supabase: any,
  userId: string,
  data: {
    fileIds: string[];
    recipients?: string[];
    permission: SharePermission;
    expiresIn?: string;
    password?: string;
  }
): Promise<NextResponse> {
  const shareToken = generateToken();
  const expiresAt = data.expiresIn ? calculateExpiry(data.expiresIn) : null;

  // Create share records for each file
  const shares = await Promise.all(
    data.fileIds.map(async (fileId) => {
      const { data: share, error } = await supabase
        .from('file_shares')
        .insert({
          file_id: fileId,
          shared_by: userId,
          share_token: `${shareToken}-${fileId.slice(0, 8)}`,
          permission: data.permission,
          expires_at: expiresAt,
          password_protected: !!data.password,
          is_active: true,
        })
        .select()
        .single();

      if (!error) {
        // Update file is_shared flag
        await supabase
          .from('files')
          .update({ is_shared: true })
          .eq('id', fileId);
      }

      return share;
    })
  );

  // Create share link
  const shareUrl = `https://kazi.app/share/${shareToken}`;

  // Log activity
  await logActivity(supabase, userId, data.fileIds[0], 'file', 'share', {
    fileCount: data.fileIds.length,
    permission: data.permission,
  });

  return NextResponse.json({
    success: true,
    action: 'share-file',
    shareToken,
    shareUrl,
    shares: shares.filter(Boolean),
    shareLinks: {
      direct: shareUrl,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareUrl)}`,
      email: `mailto:?subject=Shared Files&body=Access files here: ${shareUrl}`,
    },
    expiresAt,
    fileCount: data.fileIds.length,
    message: `${data.fileIds.length} file(s) shared successfully`,
  });
}

async function handleMoveFiles(
  supabase: any,
  userId: string,
  data: { fileIds: string[]; targetFolderId: string | null }
): Promise<NextResponse> {
  // Get current folder IDs for activity logging
  const { data: files } = await supabase
    .from('files')
    .select('id, folder_id, name')
    .in('id', data.fileIds)
    .eq('user_id', userId);

  // Update files to new folder
  const { error } = await supabase
    .from('files')
    .update({
      folder_id: data.targetFolderId,
      modified_at: new Date().toISOString()
    })
    .in('id', data.fileIds)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  // Update folder file counts
  // Decrease old folder counts
  const oldFolderIds = [...new Set(files?.map(f => f.folder_id).filter(Boolean))];
  for (const folderId of oldFolderIds) {
    if (folderId) {
      await updateFolderCounts(supabase, folderId as string);
    }
  }

  // Increase new folder count
  if (data.targetFolderId) {
    await updateFolderCounts(supabase, data.targetFolderId);
  }

  // Log activity
  await logActivity(supabase, userId, data.fileIds[0], 'file', 'move', {
    fileCount: data.fileIds.length,
    targetFolderId: data.targetFolderId,
  });

  return NextResponse.json({
    success: true,
    action: 'move-files',
    fileCount: data.fileIds.length,
    targetFolderId: data.targetFolderId,
    message: `${data.fileIds.length} file(s) moved successfully`,
  });
}

async function handleDeleteFiles(
  supabase: any,
  userId: string,
  data: { fileIds: string[]; permanent?: boolean }
): Promise<NextResponse> {
  if (data.permanent) {
    // Permanent delete
    const { error } = await supabase
      .from('files')
      .delete()
      .in('id', data.fileIds)
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }
  } else {
    // Soft delete (move to trash)
    const { error } = await supabase
      .from('files')
      .update({
        status: 'deleted',
        deleted_at: new Date().toISOString()
      })
      .in('id', data.fileIds)
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }
  }

  // Log activity
  await logActivity(supabase, userId, data.fileIds[0], 'file', 'delete', {
    fileCount: data.fileIds.length,
    permanent: data.permanent,
  });

  return NextResponse.json({
    success: true,
    action: 'delete-files',
    fileCount: data.fileIds.length,
    permanent: data.permanent || false,
    message: `${data.fileIds.length} file(s) ${data.permanent ? 'permanently deleted' : 'moved to trash'}`,
    undoAvailable: !data.permanent,
  });
}

async function handleRestoreFiles(
  supabase: any,
  userId: string,
  data: { fileIds: string[] }
): Promise<NextResponse> {
  const { error } = await supabase
    .from('files')
    .update({
      status: 'active',
      deleted_at: null
    })
    .in('id', data.fileIds)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  // Log activity
  await logActivity(supabase, userId, data.fileIds[0], 'file', 'restore', {
    fileCount: data.fileIds.length,
  });

  return NextResponse.json({
    success: true,
    action: 'restore-files',
    fileCount: data.fileIds.length,
    message: `${data.fileIds.length} file(s) restored successfully`,
  });
}

async function handleCreateVersion(
  supabase: any,
  userId: string,
  data: { fileId: string; url: string; size: number; changes?: string }
): Promise<NextResponse> {
  // Get current file
  const { data: file, error: fileError } = await supabase
    .from('files')
    .select('*')
    .eq('id', data.fileId)
    .eq('user_id', userId)
    .single();

  if (fileError || !file) {
    return NextResponse.json(
      { success: false, error: 'File not found' },
      { status: 404 }
    );
  }

  const newVersion = (file.version || 1) + 1;

  // Create version record
  const { data: version, error: versionError } = await supabase
    .from('file_versions')
    .insert({
      file_id: data.fileId,
      user_id: userId,
      version_number: newVersion,
      name: file.name,
      size: data.size,
      url: data.url,
      storage_path: `files/${userId}/versions/${data.fileId}/v${newVersion}`,
      mime_type: file.mime_type,
      change_description: data.changes || null,
    })
    .select()
    .single();

  if (versionError) {
    throw new Error(versionError.message);
  }

  // Update file with new version
  await supabase
    .from('files')
    .update({
      version: newVersion,
      url: data.url,
      size: data.size,
      modified_at: new Date().toISOString()
    })
    .eq('id', data.fileId);

  // Log activity
  await logActivity(supabase, userId, data.fileId, 'file', 'edit', {
    version: newVersion,
    changes: data.changes,
  });

  return NextResponse.json({
    success: true,
    action: 'create-version',
    fileId: data.fileId,
    version: newVersion,
    versionRecord: version,
    message: `Version ${newVersion} created successfully`,
  });
}

async function handleGenerateLink(
  supabase: any,
  userId: string,
  data: { fileId: string; permission: SharePermission; expiresIn?: string; password?: string }
): Promise<NextResponse> {
  const linkToken = generateToken();
  const expiresAt = data.expiresIn ? calculateExpiry(data.expiresIn) : null;

  const { data: share, error } = await supabase
    .from('file_shares')
    .insert({
      file_id: data.fileId,
      shared_by: userId,
      share_token: linkToken,
      permission: data.permission,
      expires_at: expiresAt,
      password_protected: !!data.password,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const shareUrl = `https://kazi.app/f/${linkToken}`;

  return NextResponse.json({
    success: true,
    action: 'generate-link',
    linkId: share.id,
    shareUrl,
    permission: data.permission,
    expiresAt,
    passwordProtected: !!data.password,
    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareUrl)}`,
    message: 'Share link generated',
  });
}

async function handleStarFiles(
  supabase: any,
  userId: string,
  data: { fileIds: string[]; starred: boolean }
): Promise<NextResponse> {
  const { error } = await supabase
    .from('files')
    .update({ is_starred: data.starred })
    .in('id', data.fileIds)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  return NextResponse.json({
    success: true,
    action: 'star-files',
    fileCount: data.fileIds.length,
    starred: data.starred,
    message: `${data.fileIds.length} file(s) ${data.starred ? 'starred' : 'unstarred'}`,
  });
}

async function handleLockFile(
  supabase: any,
  userId: string,
  data: { fileId: string; locked: boolean }
): Promise<NextResponse> {
  const { error } = await supabase
    .from('files')
    .update({ is_locked: data.locked })
    .eq('id', data.fileId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  // Log activity
  await logActivity(supabase, userId, data.fileId, 'file', data.locked ? 'lock' : 'unlock', {});

  return NextResponse.json({
    success: true,
    action: 'lock-file',
    fileId: data.fileId,
    locked: data.locked,
    message: `File ${data.locked ? 'locked' : 'unlocked'} successfully`,
  });
}

async function handleRename(
  supabase: any,
  userId: string,
  data: { id: string; name: string; type: 'file' | 'folder' }
): Promise<NextResponse> {
  const table = data.type === 'file' ? 'files' : 'folders';

  const { error } = await supabase
    .from(table)
    .update({
      name: data.name,
      ...(data.type === 'file' ? { modified_at: new Date().toISOString() } : {})
    })
    .eq('id', data.id)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  // Log activity
  await logActivity(supabase, userId, data.id, data.type, 'rename', { newName: data.name });

  return NextResponse.json({
    success: true,
    action: 'rename',
    id: data.id,
    name: data.name,
    type: data.type,
    message: `${data.type === 'file' ? 'File' : 'Folder'} renamed to "${data.name}"`,
  });
}

async function handleUpdateMetadata(
  supabase: any,
  userId: string,
  data: { fileId: string; description?: string; tags?: string[]; accessLevel?: AccessLevel }
): Promise<NextResponse> {
  const updates: Record<string, unknown> = {
    modified_at: new Date().toISOString(),
  };

  if (data.description !== undefined) {
    updates.description = data.description;
  }

  if (data.accessLevel) {
    updates.access_level = data.accessLevel;
  }

  const { error } = await supabase
    .from('files')
    .update(updates)
    .eq('id', data.fileId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  return NextResponse.json({
    success: true,
    action: 'update-metadata',
    fileId: data.fileId,
    message: 'File metadata updated successfully',
  });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function determineFileType(mimeType: string): FileType {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('word') || mimeType.includes('text')) return 'document';
  if (mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('compressed') || mimeType.includes('tar') || mimeType.includes('rar')) return 'archive';
  if (mimeType.includes('javascript') || mimeType.includes('typescript') || mimeType.includes('json') || mimeType.includes('xml') || mimeType.includes('html') || mimeType.includes('css')) return 'code';
  return 'other';
}

function generateToken(): string {
  return Math.random().toString(36).substr(2, 32) + Date.now().toString(36);
}

function calculateExpiry(duration: string): string {
  const now = new Date();
  const match = duration.match(/(\d+)\s*(hour|day|week|month)/i);

  if (!match) return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(); // Default 30 days

  const amount = parseInt(match[1]);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case 'hour':
      now.setHours(now.getHours() + amount);
      break;
    case 'day':
      now.setDate(now.getDate() + amount);
      break;
    case 'week':
      now.setDate(now.getDate() + amount * 7);
      break;
    case 'month':
      now.setMonth(now.getMonth() + amount);
      break;
  }

  return now.toISOString();
}

async function logActivity(
  supabase: any,
  userId: string,
  resourceId: string,
  resourceType: 'file' | 'folder',
  action: string,
  details: Record<string, unknown>
): Promise<void> {
  try {
    await supabase.from('file_activities').insert({
      user_id: userId,
      file_id: resourceType === 'file' ? resourceId : null,
      activity_type: action,
      details: JSON.stringify(details),
    });
  } catch {
    // Silently fail activity logging
    logger.warn('Failed to log file activity', { resourceId, action });
  }
}

async function updateFolderCounts(
  supabase: any,
  folderId: string
): Promise<void> {
  const { data: files } = await supabase
    .from('files')
    .select('size')
    .eq('folder_id', folderId)
    .eq('status', 'active');

  const fileCount = files?.length || 0;
  const totalSize = files?.reduce((acc, f) => acc + (f.size || 0), 0) || 0;

  await supabase
    .from('folders')
    .update({ file_count: fileCount, total_size: totalSize })
    .eq('id', folderId);
}
