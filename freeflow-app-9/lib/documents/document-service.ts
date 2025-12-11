// =====================================================
// KAZI Document Management Service
// World-class document handling, versioning & sharing
// =====================================================

import { createClient } from '@/lib/supabase/client';

// =====================================================
// Types
// =====================================================

export interface Folder {
  id: string;
  user_id: string;
  parent_id: string | null;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  is_shared: boolean;
  shared_with: string[];
  path: string;
  depth: number;
  document_count: number;
  total_size: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  folder_id: string | null;
  name: string;
  description?: string;
  file_type: string;
  mime_type: string;
  file_size: number;
  storage_path: string;
  storage_provider: string;
  thumbnail_url?: string;
  preview_url?: string;
  current_version: number;
  is_locked: boolean;
  locked_by?: string;
  locked_at?: string;
  is_template: boolean;
  template_category?: string;
  is_archived: boolean;
  is_starred: boolean;
  is_shared: boolean;
  share_settings: ShareSettings;
  tags: string[];
  ai_tags: string[];
  ai_summary?: string;
  extracted_text?: string;
  metadata: Record<string, any>;
  client_id?: string;
  project_id?: string;
  invoice_id?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ShareSettings {
  public_link?: string;
  allow_download?: boolean;
  allow_comments?: boolean;
  require_password?: boolean;
  password_hash?: string;
  expire_date?: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  file_size: number;
  storage_path: string;
  change_summary?: string;
  created_by: string;
  created_at: string;
}

export interface DocumentShare {
  id: string;
  document_id: string;
  folder_id?: string;
  shared_by: string;
  shared_with_user_id?: string;
  shared_with_email?: string;
  permission_level: 'view' | 'comment' | 'edit' | 'admin';
  public_link?: string;
  link_password?: string;
  allow_download: boolean;
  expires_at?: string;
  access_count: number;
  last_accessed_at?: string;
  is_active: boolean;
  created_at: string;
}

export interface DocumentComment {
  id: string;
  document_id: string;
  user_id: string;
  parent_id?: string;
  content: string;
  position_data?: Record<string, any>;
  is_resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentActivity {
  id: string;
  document_id: string;
  folder_id?: string;
  user_id: string;
  action: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface DocumentTemplate {
  id: string;
  user_id?: string;
  name: string;
  description?: string;
  category: string;
  file_type: string;
  storage_path: string;
  thumbnail_url?: string;
  variables: TemplateVariable[];
  is_public: boolean;
  use_count: number;
  created_at: string;
  updated_at: string;
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'date' | 'select';
  label: string;
  required: boolean;
  default?: string;
  options?: string[];
}

export interface DocumentRequest {
  id: string;
  user_id: string;
  client_id?: string;
  project_id?: string;
  title: string;
  description?: string;
  requested_documents: RequestedDocument[];
  status: 'pending' | 'partial' | 'completed' | 'expired';
  due_date?: string;
  reminder_sent_at?: string;
  upload_link?: string;
  upload_password?: string;
  uploaded_documents: string[];
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RequestedDocument {
  name: string;
  description?: string;
  required: boolean;
  file_types?: string[];
}

export interface StorageQuota {
  id: string;
  user_id: string;
  total_bytes: number;
  used_bytes: number;
  file_count: number;
  tier: 'free' | 'pro' | 'business' | 'enterprise';
  custom_limit_bytes?: number;
  last_calculated_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFolderInput {
  name: string;
  parent_id?: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface CreateDocumentInput {
  name: string;
  folder_id?: string;
  description?: string;
  file_type: string;
  mime_type: string;
  file_size: number;
  storage_path: string;
  storage_provider?: string;
  thumbnail_url?: string;
  tags?: string[];
  client_id?: string;
  project_id?: string;
  invoice_id?: string;
  metadata?: Record<string, any>;
}

export interface ShareDocumentInput {
  document_id?: string;
  folder_id?: string;
  shared_with_user_id?: string;
  shared_with_email?: string;
  permission_level: 'view' | 'comment' | 'edit' | 'admin';
  allow_download?: boolean;
  expires_at?: string;
  create_public_link?: boolean;
  link_password?: string;
}

export interface DocumentSearchParams {
  query?: string;
  folder_id?: string;
  file_types?: string[];
  tags?: string[];
  is_starred?: boolean;
  is_archived?: boolean;
  is_shared?: boolean;
  client_id?: string;
  project_id?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: 'name' | 'created_at' | 'updated_at' | 'file_size';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// =====================================================
// Document Service Class
// =====================================================

class DocumentService {
  private static instance: DocumentService;
  private supabase = createClient();

  private constructor() {}

  public static getInstance(): DocumentService {
    if (!DocumentService.instance) {
      DocumentService.instance = new DocumentService();
    }
    return DocumentService.instance;
  }

  // =====================================================
  // Folder Operations
  // =====================================================

  async createFolder(userId: string, input: CreateFolderInput): Promise<Folder> {
    let path = input.name;
    let depth = 0;

    if (input.parent_id) {
      const parent = await this.getFolder(input.parent_id);
      if (parent) {
        path = `${parent.path}/${input.name}`;
        depth = parent.depth + 1;
      }
    }

    const { data, error } = await this.supabase
      .from('folders')
      .insert({
        user_id: userId,
        parent_id: input.parent_id || null,
        name: input.name,
        description: input.description,
        color: input.color,
        icon: input.icon,
        path,
        depth,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create folder: ${error.message}`);

    await this.logActivity(null, data.id, userId, 'folder_created', { name: input.name });

    return data;
  }

  async getFolder(folderId: string): Promise<Folder | null> {
    const { data, error } = await this.supabase
      .from('folders')
      .select('*')
      .eq('id', folderId)
      .single();

    if (error) return null;
    return data;
  }

  async getFolders(userId: string, parentId?: string | null): Promise<Folder[]> {
    let query = this.supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId)
      .order('name');

    if (parentId === null) {
      query = query.is('parent_id', null);
    } else if (parentId) {
      query = query.eq('parent_id', parentId);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to get folders: ${error.message}`);
    return data || [];
  }

  async getFolderTree(userId: string): Promise<Folder[]> {
    const { data, error } = await this.supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId)
      .order('path');

    if (error) throw new Error(`Failed to get folder tree: ${error.message}`);
    return data || [];
  }

  async updateFolder(folderId: string, updates: Partial<CreateFolderInput>): Promise<Folder> {
    const { data, error } = await this.supabase
      .from('folders')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', folderId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update folder: ${error.message}`);
    return data;
  }

  async deleteFolder(folderId: string, userId: string): Promise<void> {
    const folder = await this.getFolder(folderId);

    const { error } = await this.supabase
      .from('folders')
      .delete()
      .eq('id', folderId);

    if (error) throw new Error(`Failed to delete folder: ${error.message}`);

    if (folder) {
      await this.logActivity(null, null, userId, 'folder_deleted', { name: folder.name });
    }
  }

  async moveFolder(folderId: string, newParentId: string | null, userId: string): Promise<Folder> {
    const folder = await this.getFolder(folderId);
    if (!folder) throw new Error('Folder not found');

    let newPath = folder.name;
    let newDepth = 0;

    if (newParentId) {
      const newParent = await this.getFolder(newParentId);
      if (newParent) {
        newPath = `${newParent.path}/${folder.name}`;
        newDepth = newParent.depth + 1;
      }
    }

    const { data, error } = await this.supabase
      .from('folders')
      .update({
        parent_id: newParentId,
        path: newPath,
        depth: newDepth,
        updated_at: new Date().toISOString(),
      })
      .eq('id', folderId)
      .select()
      .single();

    if (error) throw new Error(`Failed to move folder: ${error.message}`);

    await this.logActivity(null, folderId, userId, 'folder_moved', {
      name: folder.name,
      new_parent_id: newParentId,
    });

    return data;
  }

  // =====================================================
  // Document Operations
  // =====================================================

  async createDocument(userId: string, input: CreateDocumentInput): Promise<Document> {
    const { data, error } = await this.supabase
      .from('documents')
      .insert({
        user_id: userId,
        folder_id: input.folder_id || null,
        name: input.name,
        description: input.description,
        file_type: input.file_type,
        mime_type: input.mime_type,
        file_size: input.file_size,
        storage_path: input.storage_path,
        storage_provider: input.storage_provider || 'supabase',
        thumbnail_url: input.thumbnail_url,
        tags: input.tags || [],
        client_id: input.client_id,
        project_id: input.project_id,
        invoice_id: input.invoice_id,
        metadata: input.metadata || {},
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create document: ${error.message}`);

    // Create initial version
    await this.createVersion(data.id, userId, {
      file_size: input.file_size,
      storage_path: input.storage_path,
      change_summary: 'Initial upload',
    });

    await this.logActivity(data.id, input.folder_id || null, userId, 'document_uploaded', {
      name: input.name,
      file_size: input.file_size,
    });

    return data;
  }

  async getDocument(documentId: string): Promise<Document | null> {
    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error) return null;
    return data;
  }

  async getDocuments(userId: string, params: DocumentSearchParams = {}): Promise<{ documents: Document[]; total: number }> {
    let query = this.supabase
      .from('documents')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    if (params.folder_id) {
      query = query.eq('folder_id', params.folder_id);
    }

    if (params.file_types && params.file_types.length > 0) {
      query = query.in('file_type', params.file_types);
    }

    if (params.tags && params.tags.length > 0) {
      query = query.overlaps('tags', params.tags);
    }

    if (params.is_starred !== undefined) {
      query = query.eq('is_starred', params.is_starred);
    }

    if (params.is_archived !== undefined) {
      query = query.eq('is_archived', params.is_archived);
    } else {
      query = query.eq('is_archived', false);
    }

    if (params.is_shared !== undefined) {
      query = query.eq('is_shared', params.is_shared);
    }

    if (params.client_id) {
      query = query.eq('client_id', params.client_id);
    }

    if (params.project_id) {
      query = query.eq('project_id', params.project_id);
    }

    if (params.date_from) {
      query = query.gte('created_at', params.date_from);
    }

    if (params.date_to) {
      query = query.lte('created_at', params.date_to);
    }

    if (params.query) {
      query = query.or(`name.ilike.%${params.query}%,description.ilike.%${params.query}%`);
    }

    const sortBy = params.sort_by || 'created_at';
    const sortOrder = params.sort_order === 'asc' ? true : false;
    query = query.order(sortBy, { ascending: sortOrder });

    if (params.limit) {
      query = query.limit(params.limit);
    }

    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 50) - 1);
    }

    const { data, error, count } = await query;

    if (error) throw new Error(`Failed to get documents: ${error.message}`);
    return { documents: data || [], total: count || 0 };
  }

  async searchDocuments(userId: string, searchQuery: string, limit: number = 50): Promise<Document[]> {
    // Use the database search function for full-text search
    const { data, error } = await this.supabase
      .rpc('search_documents', {
        p_user_id: userId,
        p_search_query: searchQuery,
        p_limit: limit,
      });

    if (error) {
      // Fallback to basic search if function doesn't exist
      const { data: fallbackData } = await this.supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,extracted_text.ilike.%${searchQuery}%`)
        .limit(limit);

      return fallbackData || [];
    }

    return data || [];
  }

  async updateDocument(documentId: string, userId: string, updates: Partial<Document>): Promise<Document> {
    const { data, error } = await this.supabase
      .from('documents')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update document: ${error.message}`);

    await this.logActivity(documentId, data.folder_id, userId, 'document_updated', {
      updates: Object.keys(updates),
    });

    return data;
  }

  async deleteDocument(documentId: string, userId: string): Promise<void> {
    const doc = await this.getDocument(documentId);

    const { error } = await this.supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (error) throw new Error(`Failed to delete document: ${error.message}`);

    if (doc) {
      await this.logActivity(null, doc.folder_id, userId, 'document_deleted', {
        name: doc.name,
      });
    }
  }

  async moveDocument(documentId: string, folderId: string | null, userId: string): Promise<Document> {
    const doc = await this.getDocument(documentId);
    if (!doc) throw new Error('Document not found');

    const { data, error } = await this.supabase
      .from('documents')
      .update({
        folder_id: folderId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId)
      .select()
      .single();

    if (error) throw new Error(`Failed to move document: ${error.message}`);

    await this.logActivity(documentId, folderId, userId, 'document_moved', {
      name: doc.name,
      from_folder: doc.folder_id,
      to_folder: folderId,
    });

    return data;
  }

  async toggleStar(documentId: string, userId: string): Promise<Document> {
    const doc = await this.getDocument(documentId);
    if (!doc) throw new Error('Document not found');

    return this.updateDocument(documentId, userId, { is_starred: !doc.is_starred });
  }

  async archiveDocument(documentId: string, userId: string): Promise<Document> {
    return this.updateDocument(documentId, userId, { is_archived: true });
  }

  async restoreDocument(documentId: string, userId: string): Promise<Document> {
    return this.updateDocument(documentId, userId, { is_archived: false });
  }

  async lockDocument(documentId: string, userId: string): Promise<Document> {
    return this.updateDocument(documentId, userId, {
      is_locked: true,
      locked_by: userId,
      locked_at: new Date().toISOString(),
    });
  }

  async unlockDocument(documentId: string, userId: string): Promise<Document> {
    const doc = await this.getDocument(documentId);
    if (!doc) throw new Error('Document not found');
    if (doc.locked_by !== userId) throw new Error('Document locked by another user');

    return this.updateDocument(documentId, userId, {
      is_locked: false,
      locked_by: undefined,
      locked_at: undefined,
    });
  }

  // =====================================================
  // Version Operations
  // =====================================================

  async createVersion(
    documentId: string,
    userId: string,
    input: { file_size: number; storage_path: string; change_summary?: string }
  ): Promise<DocumentVersion> {
    const doc = await this.getDocument(documentId);
    if (!doc) throw new Error('Document not found');

    const newVersionNumber = doc.current_version + 1;

    const { data, error } = await this.supabase
      .from('document_versions')
      .insert({
        document_id: documentId,
        version_number: newVersionNumber,
        file_size: input.file_size,
        storage_path: input.storage_path,
        change_summary: input.change_summary,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create version: ${error.message}`);

    // Update document with new version
    await this.supabase
      .from('documents')
      .update({
        current_version: newVersionNumber,
        file_size: input.file_size,
        storage_path: input.storage_path,
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId);

    await this.logActivity(documentId, doc.folder_id, userId, 'version_created', {
      version: newVersionNumber,
      change_summary: input.change_summary,
    });

    return data;
  }

  async getVersions(documentId: string): Promise<DocumentVersion[]> {
    const { data, error } = await this.supabase
      .from('document_versions')
      .select('*')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false });

    if (error) throw new Error(`Failed to get versions: ${error.message}`);
    return data || [];
  }

  async getVersion(versionId: string): Promise<DocumentVersion | null> {
    const { data, error } = await this.supabase
      .from('document_versions')
      .select('*')
      .eq('id', versionId)
      .single();

    if (error) return null;
    return data;
  }

  async restoreVersion(documentId: string, versionId: string, userId: string): Promise<Document> {
    const version = await this.getVersion(versionId);
    if (!version) throw new Error('Version not found');
    if (version.document_id !== documentId) throw new Error('Version does not belong to document');

    // Create new version from restored version
    await this.createVersion(documentId, userId, {
      file_size: version.file_size,
      storage_path: version.storage_path,
      change_summary: `Restored from version ${version.version_number}`,
    });

    const doc = await this.getDocument(documentId);
    if (!doc) throw new Error('Document not found');

    return doc;
  }

  // =====================================================
  // Sharing Operations
  // =====================================================

  async shareDocument(userId: string, input: ShareDocumentInput): Promise<DocumentShare> {
    const shareData: any = {
      document_id: input.document_id || null,
      folder_id: input.folder_id || null,
      shared_by: userId,
      shared_with_user_id: input.shared_with_user_id,
      shared_with_email: input.shared_with_email,
      permission_level: input.permission_level,
      allow_download: input.allow_download ?? true,
      expires_at: input.expires_at,
    };

    if (input.create_public_link) {
      shareData.public_link = this.generatePublicLink();
      shareData.link_password = input.link_password;
    }

    const { data, error } = await this.supabase
      .from('document_shares')
      .insert(shareData)
      .select()
      .single();

    if (error) throw new Error(`Failed to share document: ${error.message}`);

    // Update document is_shared flag
    if (input.document_id) {
      await this.supabase
        .from('documents')
        .update({ is_shared: true })
        .eq('id', input.document_id);

      await this.logActivity(input.document_id, null, userId, 'document_shared', {
        shared_with: input.shared_with_email || input.shared_with_user_id,
        permission: input.permission_level,
      });
    }

    return data;
  }

  async getShares(documentId: string): Promise<DocumentShare[]> {
    const { data, error } = await this.supabase
      .from('document_shares')
      .select('*')
      .eq('document_id', documentId)
      .eq('is_active', true);

    if (error) throw new Error(`Failed to get shares: ${error.message}`);
    return data || [];
  }

  async getSharedWithMe(userId: string): Promise<Document[]> {
    const { data: shares, error: sharesError } = await this.supabase
      .from('document_shares')
      .select('document_id')
      .eq('shared_with_user_id', userId)
      .eq('is_active', true);

    if (sharesError) throw new Error(`Failed to get shared documents: ${sharesError.message}`);

    if (!shares || shares.length === 0) return [];

    const documentIds = shares.map(s => s.document_id).filter(Boolean);

    const { data: documents, error: docsError } = await this.supabase
      .from('documents')
      .select('*')
      .in('id', documentIds);

    if (docsError) throw new Error(`Failed to get documents: ${docsError.message}`);
    return documents || [];
  }

  async updateShare(shareId: string, updates: Partial<DocumentShare>): Promise<DocumentShare> {
    const { data, error } = await this.supabase
      .from('document_shares')
      .update(updates)
      .eq('id', shareId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update share: ${error.message}`);
    return data;
  }

  async revokeShare(shareId: string): Promise<void> {
    const { error } = await this.supabase
      .from('document_shares')
      .update({ is_active: false })
      .eq('id', shareId);

    if (error) throw new Error(`Failed to revoke share: ${error.message}`);
  }

  async getByPublicLink(publicLink: string): Promise<{ document: Document; share: DocumentShare } | null> {
    const { data: share, error } = await this.supabase
      .from('document_shares')
      .select('*')
      .eq('public_link', publicLink)
      .eq('is_active', true)
      .single();

    if (error || !share) return null;

    // Check expiration
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return null;
    }

    const document = await this.getDocument(share.document_id);
    if (!document) return null;

    // Update access count
    await this.supabase
      .from('document_shares')
      .update({
        access_count: share.access_count + 1,
        last_accessed_at: new Date().toISOString(),
      })
      .eq('id', share.id);

    return { document, share };
  }

  private generatePublicLink(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let link = '';
    for (let i = 0; i < 32; i++) {
      link += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return link;
  }

  // =====================================================
  // Comments
  // =====================================================

  async addComment(
    documentId: string,
    userId: string,
    content: string,
    parentId?: string,
    positionData?: Record<string, any>
  ): Promise<DocumentComment> {
    const { data, error } = await this.supabase
      .from('document_comments')
      .insert({
        document_id: documentId,
        user_id: userId,
        parent_id: parentId || null,
        content,
        position_data: positionData,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to add comment: ${error.message}`);

    await this.logActivity(documentId, null, userId, 'comment_added', {
      comment_id: data.id,
    });

    return data;
  }

  async getComments(documentId: string): Promise<DocumentComment[]> {
    const { data, error } = await this.supabase
      .from('document_comments')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Failed to get comments: ${error.message}`);
    return data || [];
  }

  async resolveComment(commentId: string, userId: string): Promise<DocumentComment> {
    const { data, error } = await this.supabase
      .from('document_comments')
      .update({
        is_resolved: true,
        resolved_by: userId,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', commentId)
      .select()
      .single();

    if (error) throw new Error(`Failed to resolve comment: ${error.message}`);
    return data;
  }

  async deleteComment(commentId: string): Promise<void> {
    const { error } = await this.supabase
      .from('document_comments')
      .delete()
      .eq('id', commentId);

    if (error) throw new Error(`Failed to delete comment: ${error.message}`);
  }

  // =====================================================
  // Templates
  // =====================================================

  async getTemplates(userId?: string, category?: string): Promise<DocumentTemplate[]> {
    let query = this.supabase
      .from('document_templates')
      .select('*')
      .eq('is_public', true);

    if (userId) {
      query = this.supabase
        .from('document_templates')
        .select('*')
        .or(`is_public.eq.true,user_id.eq.${userId}`);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query.order('use_count', { ascending: false });

    if (error) throw new Error(`Failed to get templates: ${error.message}`);
    return data || [];
  }

  async createFromTemplate(
    templateId: string,
    userId: string,
    name: string,
    variables: Record<string, any>,
    folderId?: string
  ): Promise<Document> {
    const { data: template, error: templateError } = await this.supabase
      .from('document_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError || !template) throw new Error('Template not found');

    // Create document from template
    const document = await this.createDocument(userId, {
      name,
      folder_id: folderId,
      file_type: template.file_type,
      mime_type: 'application/octet-stream',
      file_size: 0,
      storage_path: template.storage_path, // Would be copied in real implementation
      metadata: { template_id: templateId, variables },
    });

    // Increment template use count
    await this.supabase
      .from('document_templates')
      .update({ use_count: template.use_count + 1 })
      .eq('id', templateId);

    return document;
  }

  // =====================================================
  // Document Requests
  // =====================================================

  async createRequest(
    userId: string,
    input: {
      title: string;
      description?: string;
      requested_documents: RequestedDocument[];
      client_id?: string;
      project_id?: string;
      due_date?: string;
      expires_at?: string;
    }
  ): Promise<DocumentRequest> {
    const { data, error } = await this.supabase
      .from('document_requests')
      .insert({
        user_id: userId,
        title: input.title,
        description: input.description,
        requested_documents: input.requested_documents,
        client_id: input.client_id,
        project_id: input.project_id,
        due_date: input.due_date,
        expires_at: input.expires_at,
        upload_link: this.generatePublicLink(),
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create request: ${error.message}`);
    return data;
  }

  async getRequests(userId: string, status?: string): Promise<DocumentRequest[]> {
    let query = this.supabase
      .from('document_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to get requests: ${error.message}`);
    return data || [];
  }

  async getRequestByUploadLink(uploadLink: string): Promise<DocumentRequest | null> {
    const { data, error } = await this.supabase
      .from('document_requests')
      .select('*')
      .eq('upload_link', uploadLink)
      .single();

    if (error) return null;
    return data;
  }

  async fulfillRequest(requestId: string, documentIds: string[]): Promise<DocumentRequest> {
    const request = await this.getRequest(requestId);
    if (!request) throw new Error('Request not found');

    const uploadedDocs = [...(request.uploaded_documents || []), ...documentIds];
    const allFulfilled = request.requested_documents.every(rd =>
      uploadedDocs.some(docId => rd.name) // Simplified check
    );

    const { data, error } = await this.supabase
      .from('document_requests')
      .update({
        uploaded_documents: uploadedDocs,
        status: allFulfilled ? 'completed' : 'partial',
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw new Error(`Failed to fulfill request: ${error.message}`);
    return data;
  }

  async getRequest(requestId: string): Promise<DocumentRequest | null> {
    const { data, error } = await this.supabase
      .from('document_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (error) return null;
    return data;
  }

  // =====================================================
  // Storage & Quota
  // =====================================================

  async getStorageStats(userId: string): Promise<StorageQuota | null> {
    const { data, error } = await this.supabase
      .from('storage_quotas')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return data;
  }

  async checkStorageQuota(userId: string, additionalBytes: number): Promise<{ allowed: boolean; remaining: number }> {
    const quota = await this.getStorageStats(userId);

    if (!quota) {
      // No quota record, create default
      const { data: newQuota } = await this.supabase
        .from('storage_quotas')
        .insert({
          user_id: userId,
          total_bytes: 5 * 1024 * 1024 * 1024, // 5GB default
          used_bytes: 0,
          file_count: 0,
          tier: 'free',
        })
        .select()
        .single();

      return {
        allowed: true,
        remaining: (newQuota?.total_bytes || 5368709120) - additionalBytes,
      };
    }

    const effectiveLimit = quota.custom_limit_bytes || quota.total_bytes;
    const remaining = effectiveLimit - quota.used_bytes;

    return {
      allowed: remaining >= additionalBytes,
      remaining: remaining - additionalBytes,
    };
  }

  // =====================================================
  // Activity Logging
  // =====================================================

  async logActivity(
    documentId: string | null,
    folderId: string | null,
    userId: string,
    action: string,
    details: Record<string, any> = {}
  ): Promise<void> {
    await this.supabase.from('document_activity').insert({
      document_id: documentId,
      folder_id: folderId,
      user_id: userId,
      action,
      details,
    });
  }

  async getActivity(
    params: { documentId?: string; folderId?: string; userId?: string; limit?: number }
  ): Promise<DocumentActivity[]> {
    let query = this.supabase
      .from('document_activity')
      .select('*')
      .order('created_at', { ascending: false });

    if (params.documentId) {
      query = query.eq('document_id', params.documentId);
    }

    if (params.folderId) {
      query = query.eq('folder_id', params.folderId);
    }

    if (params.userId) {
      query = query.eq('user_id', params.userId);
    }

    if (params.limit) {
      query = query.limit(params.limit);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to get activity: ${error.message}`);
    return data || [];
  }

  // =====================================================
  // Bulk Operations
  // =====================================================

  async bulkMove(documentIds: string[], folderId: string | null, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('documents')
      .update({
        folder_id: folderId,
        updated_at: new Date().toISOString(),
      })
      .in('id', documentIds);

    if (error) throw new Error(`Failed to bulk move: ${error.message}`);

    await this.logActivity(null, folderId, userId, 'bulk_move', {
      document_count: documentIds.length,
    });
  }

  async bulkDelete(documentIds: string[], userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('documents')
      .delete()
      .in('id', documentIds);

    if (error) throw new Error(`Failed to bulk delete: ${error.message}`);

    await this.logActivity(null, null, userId, 'bulk_delete', {
      document_count: documentIds.length,
    });
  }

  async bulkArchive(documentIds: string[], userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('documents')
      .update({
        is_archived: true,
        updated_at: new Date().toISOString(),
      })
      .in('id', documentIds);

    if (error) throw new Error(`Failed to bulk archive: ${error.message}`);

    await this.logActivity(null, null, userId, 'bulk_archive', {
      document_count: documentIds.length,
    });
  }

  async bulkTag(documentIds: string[], tags: string[], userId: string): Promise<void> {
    // Get existing documents
    const { data: docs } = await this.supabase
      .from('documents')
      .select('id, tags')
      .in('id', documentIds);

    if (!docs) return;

    // Update each document with merged tags
    for (const doc of docs) {
      const mergedTags = [...new Set([...(doc.tags || []), ...tags])];
      await this.supabase
        .from('documents')
        .update({ tags: mergedTags })
        .eq('id', doc.id);
    }

    await this.logActivity(null, null, userId, 'bulk_tag', {
      document_count: documentIds.length,
      tags,
    });
  }

  // =====================================================
  // Recent & Favorites
  // =====================================================

  async getRecentDocuments(userId: string, limit: number = 10): Promise<Document[]> {
    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to get recent documents: ${error.message}`);
    return data || [];
  }

  async getStarredDocuments(userId: string): Promise<Document[]> {
    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .eq('is_starred', true)
      .eq('is_archived', false)
      .order('updated_at', { ascending: false });

    if (error) throw new Error(`Failed to get starred documents: ${error.message}`);
    return data || [];
  }
}

// Export singleton instance
export const documentService = DocumentService.getInstance();

// Export convenience functions
export const createFolder = (userId: string, input: CreateFolderInput) =>
  documentService.createFolder(userId, input);

export const createDocument = (userId: string, input: CreateDocumentInput) =>
  documentService.createDocument(userId, input);

export const shareDocument = (userId: string, input: ShareDocumentInput) =>
  documentService.shareDocument(userId, input);

export const searchDocuments = (userId: string, query: string, limit?: number) =>
  documentService.searchDocuments(userId, query, limit);

export const getStorageStats = (userId: string) =>
  documentService.getStorageStats(userId);
