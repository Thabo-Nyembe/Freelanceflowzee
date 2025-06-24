import { createClient } from '@supabase/supabase-js'
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command, GetObjectCommandOutput } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { NodeHttpHandler } from '@smithy/node-http-handler'
import { Agent } from 'https'

// STARTUP MODE: Aggressive cost optimization
const STARTUP_MODE = process.env.STARTUP_MODE === 'true';
const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER || 'wasabi-first';

// Startup-optimized thresholds (much more aggressive)
const LARGE_FILE_THRESHOLD = STARTUP_MODE ? 1048576 : 10485760; // 1MB vs 10MB
const SUPABASE_MAX_SIZE = STARTUP_MODE ? 524288 : 1048576; // 512KB vs 1MB

// Storage provider types
export type StorageProvider = 'supabase' | 'wasabi' | 'hybrid';

// Add missing ListOptions interface
export interface ListOptions {
  provider?: StorageProvider;
  folder?: string;
  project_id?: string;
  user_id?: string;
  limit?: number;
  offset?: number;
}

// File metadata interface
export interface FileMetadata {
  id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  size: number;
  mimeType: string;
  provider: StorageProvider;
  bucket: string;
  key: string;
  url: string;
  signed_url?: string;
  access_count: number;
  is_public: boolean;
  folder?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  project_id?: string;
  uploaded_by?: string;
  uploadedAt: Date;
  expires_at?: Date;
}

// Upload options interface
export interface UploadOptions {
  folder?: string;
  publicRead?: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
  cacheControl?: string;
  project_id?: string;
  user_id?: string;
}

// Storage analytics interface
export interface StorageAnalytics {
  totalFiles: number;
  totalSize: number;
  supabaseFiles: number;
  supabaseSize: number;
  wasabiFiles: number;
  wasabiSize: number;
  monthlyCost: number;
  potentialSavings: number;
  costBreakdown: {
    supabaseCost: number;
    wasabiCost: number;
    transferCost: number;
  };
}

// Storage configuration
interface StorageConfig {
  provider: StorageProvider;
  largeFileThreshold: number; // Files larger than this go to Wasabi
  archiveThreshold: number;   // Files older than this may be moved to Wasabi
  supabase: {
    url: string;
    serviceKey: string;
    bucket: string;
  };
  wasabi: {
    accessKeyId: string;
    secretAccessKey: string;
    endpoint: string;
    region: string;
    bucket: string;
  };
}

class MultiCloudStorage {
  private config: StorageConfig;
  private supabaseClient: ReturnType<typeof createClient>;
  private wasabiClient: S3Client;

  constructor() {
    this.config = {
      provider: (process.env.STORAGE_PROVIDER as StorageProvider) || 'hybrid',
      largeFileThreshold: parseInt(process.env.STORAGE_LARGE_FILE_THRESHOLD || '10485760'), // 10MB
      archiveThreshold: parseInt(process.env.STORAGE_ARCHIVE_THRESHOLD || '2629746000'), // 30 days
      supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        bucket: 'uploads'
      },
      wasabi: {
        accessKeyId: process.env.WASABI_ACCESS_KEY_ID!,
        secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY!,
        endpoint: process.env.WASABI_ENDPOINT || 'https://s3.wasabisys.com',
        region: process.env.WASABI_REGION || 'us-east-1',
        bucket: process.env.WASABI_BUCKET_NAME || 'freeflowzee-storage'
      }
    };

    // Initialize Supabase client
    this.supabaseClient = createClient(
      this.config.supabase.url,
      this.config.supabase.serviceKey
    );

    // Initialize Wasabi S3 client with Context7 best practices
    this.wasabiClient = new S3Client({
      endpoint: this.config.wasabi.endpoint,
      region: this.config.wasabi.region,
      credentials: {
        accessKeyId: this.config.wasabi.accessKeyId,
        secretAccessKey: this.config.wasabi.secretAccessKey,
      },
      forcePathStyle: true, // Required for Wasabi compatibility
      
      // Context7 performance optimizations
      requestHandler: new NodeHttpHandler({
        httpsAgent: new Agent({
          keepAlive: true, // Essential for connection reuse
          maxSockets: 50,  // Optimize for parallel workloads
        }),
        requestTimeout: 15_000,    // 15 second request timeout
        connectionTimeout: 6_000,  // 6 second connection timeout
      }),
    });
  }

  /**
   * Context7 optimized provider selection logic
   */
  private shouldUseWasabi(fileSize: number, mimeType: string, metadata?: Record<string, any>): boolean {
    // Always use Wasabi for large files (cost optimization)
    if (fileSize > this.config.largeFileThreshold) return true;
    
    // Use Wasabi for archives and backups
    if (['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'].includes(mimeType)) return true;
    
    // Use Wasabi for video files (typically large and accessed less frequently)
    if (mimeType.startsWith('video/')) return true;
    
    // Use Supabase for frequently accessed small files
    if (fileSize < 1024 * 1024 && mimeType.startsWith('image/')) return false; // < 1MB images
    
    // Default to hybrid approach based on configuration
    return this.config.provider === 'wasabi' || this.config.provider === 'hybrid';
  }

  /**
   * STARTUP-OPTIMIZED: Upload with intelligent cost-saving routing and database storage
   */
  async uploadFile(
    file: Buffer | Uint8Array,
    fileName: string,
    mimeType: string,
    options: UploadOptions = {}
  ): Promise<{
    success: boolean;
    url?: string;
    provider: 'wasabi' | 'supabase';
    size: number;
    cost_per_month: number;
    savings?: string;
    file_id?: string;
  }> {
    const fileSize = file.length;
    const useWasabi = this.shouldUseWasabi(fileSize, mimeType, options.metadata);
    const timestamp = Date.now();
    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileKey = options.folder ? `${options.folder}/${timestamp}-${safeFileName}` : `uploads/${timestamp}-${safeFileName}`;
    
    try {
      let url: string;
      let provider: 'wasabi' | 'supabase';
      let bucket: string;

      if (useWasabi) {
        // Upload to Wasabi for cost savings
        const uploadCommand = new PutObjectCommand({
          Bucket: this.config.wasabi.bucket,
          Key: fileKey,
          Body: file,
          ContentType: mimeType,
          Metadata: options.metadata || {},
        });

        await this.wasabiClient.send(uploadCommand);
        
        url = `${this.config.wasabi.endpoint}/${this.config.wasabi.bucket}/${fileKey}`;
        provider = 'wasabi';
        bucket = this.config.wasabi.bucket;
        
        // Calculate cost savings for startup
        const wasabiCost = (fileSize / 1e9) * 0.0059; // $0.0059/GB/month
        const supabaseCost = (fileSize / 1e9) * 0.021; // $0.021/GB/month
        const savings = `Saves $${(supabaseCost - wasabiCost).toFixed(4)}/month (${Math.round(((supabaseCost - wasabiCost) / supabaseCost) * 100)}% cheaper)`;
        
        // Store metadata in database
        const fileRecord = await this.storeFileMetadata({
          filename: safeFileName,
          original_filename: fileName,
          file_path: fileKey,
          size: fileSize,
          mimeType,
          provider: 'wasabi',
          bucket,
          key: fileKey,
          url,
          access_count: 0,
          is_public: options.publicRead || false,
          folder: options.folder,
          tags: options.tags,
          metadata: options.metadata,
          project_id: options.project_id,
          uploaded_by: options.user_id,
          uploadedAt: new Date()
        });
        
        return {
          success: true,
          url,
          provider: 'wasabi',
          size: fileSize,
          cost_per_month: wasabiCost,
          savings,
          file_id: fileRecord.id
        };
      } else {
        // Upload to Supabase for speed (small/critical files only)
        const { data, error } = await this.supabaseClient.storage
          .from(this.config.supabase.bucket)
          .upload(fileKey, file, {
            contentType: mimeType,
            metadata: options.metadata,
            cacheControl: options.cacheControl || '3600'
          });

        if (error) throw error;

        const { data: urlData } = this.supabaseClient.storage
          .from(this.config.supabase.bucket)
          .getPublicUrl(data.path);

        url = urlData.publicUrl;
        provider = 'supabase';
        bucket = this.config.supabase.bucket;
        
        const supabaseCost = (fileSize / 1e9) * 0.021;

        // Store metadata in database
        const fileRecord = await this.storeFileMetadata({
          filename: safeFileName,
          original_filename: fileName,
          file_path: data.path,
          size: fileSize,
          mimeType,
          provider: 'supabase',
          bucket,
          key: data.path,
          url,
          access_count: 0,
          is_public: options.publicRead || false,
          folder: options.folder,
          tags: options.tags,
          metadata: options.metadata,
          project_id: options.project_id,
          uploaded_by: options.user_id,
          uploadedAt: new Date()
        });
        
        return {
          success: true,
          url,
          provider: 'supabase',
          size: fileSize,
          cost_per_month: supabaseCost,
          file_id: fileRecord.id
        };
      }
    } catch (error) {
      console.error('Upload failed:', error);
      return {
        success: false,
        provider: useWasabi ? 'wasabi' : 'supabase',
        size: fileSize,
        cost_per_month: 0
      };
    }
  }

  /**
   * Store file metadata in database
   */
  private async storeFileMetadata(metadata: Omit<FileMetadata, 'id'>): Promise<FileMetadata> {
    const { data, error } = await this.supabaseClient
      .from('file_storage')
      .insert([{
        filename: metadata.filename,
        original_filename: metadata.original_filename,
        file_path: metadata.file_path,
        file_size: metadata.size,
        mime_type: metadata.mimeType,
        provider: metadata.provider,
        bucket: metadata.bucket,
        key: metadata.key,
        url: metadata.url,
        access_count: metadata.access_count,
        is_public: metadata.is_public,
        folder: metadata.folder,
        tags: metadata.tags,
        metadata: metadata.metadata,
        project_id: metadata.project_id,
        uploaded_by: metadata.uploaded_by
      }])
      .select()
      .single();

    if (error) {
      console.error('Database insert error:', error);
      throw new Error(`Failed to store file metadata: ${error.message}`);
    }

    return {
      id: data.id as string,
      filename: data.filename as string,
      original_filename: data.original_filename as string,
      file_path: data.file_path as string,
      size: data.file_size as number,
      mimeType: data.mime_type as string,
      provider: data.provider as StorageProvider,
      bucket: data.bucket as string,
      key: data.key as string,
      url: data.url as string,
      access_count: data.access_count as number,
      is_public: data.is_public as boolean,
      folder: data.folder as string,
      tags: data.tags as string[],
      metadata: data.metadata as Record<string, any>,
      project_id: data.project_id as string,
      uploaded_by: data.uploaded_by as string,
      uploadedAt: new Date(data.created_at as string)
    };
  }

  /**
   * Download file with access tracking
   */
  async downloadFile(fileId: string): Promise<{ buffer: Buffer; metadata: FileMetadata }> {
    // Get file metadata from database
    const { data, error } = await this.supabaseClient
      .from('file_storage')
      .select('*')
      .eq('id', fileId)
      .single();

    if (error || !data) {
      throw new Error('File not found');
    }

    const metadata: FileMetadata = {
      id: data.id as string,
      filename: data.filename as string,
      original_filename: data.original_filename as string,
      file_path: data.file_path as string,
      size: data.file_size as number,
      mimeType: data.mime_type as string,
      provider: data.provider as StorageProvider,
      bucket: data.bucket as string,
      key: data.key as string,
      url: data.url as string,
      access_count: data.access_count as number,
      is_public: data.is_public as boolean,
      folder: data.folder as string,
      tags: data.tags as string[],
      metadata: data.metadata as Record<string, any>,
      project_id: data.project_id as string,
      uploaded_by: data.uploaded_by as string,
      uploadedAt: new Date(data.created_at as string)
    };

    let buffer: Buffer;

    try {
      if (metadata.provider === 'wasabi') {
        const command = new GetObjectCommand({
          Bucket: metadata.bucket,
          Key: metadata.key
        });
        
        const response = await this.wasabiClient.send(command);
        if (!response.Body) throw new Error('Empty response body');
        buffer = Buffer.from(await response.Body.transformToByteArray());
      } else {
        const { data: fileData, error: downloadError } = await this.supabaseClient.storage
          .from(metadata.bucket)
          .download(metadata.key);

        if (downloadError) throw new Error(`Download failed: ${downloadError.message}`);
        buffer = Buffer.from(await fileData.arrayBuffer());
      }

      // Update access count
      await this.updateAccessCount(fileId);

      return { buffer, metadata };
    } catch (error) {
      console.error(`Download failed for ${fileId}:`, error);
      throw new Error(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update access count for analytics
   */
  private async updateAccessCount(fileId: string): Promise<void> {
    // First get the current access count
    const { data } = await this.supabaseClient
      .from('file_storage')
      .select('access_count')
      .eq('id', fileId)
      .single();
    
    const currentCount = (data?.access_count as number) || 0;
    
    // Update with incremented count
    await this.supabaseClient
      .from('file_storage')
      .update({ access_count: currentCount + 1 })
      .eq('id', fileId);
  }

  /**
   * Generate signed URL for secure downloads
   */
  async getSignedUrl(fileId: string, expiresIn: number = 3600): Promise<string> {
    // Get file metadata
    const { data, error } = await this.supabaseClient
      .from('file_storage')
      .select('provider, bucket, key')
      .eq('id', fileId)
      .single();

    if (error || !data) {
      throw new Error('File not found');
    }

    if (data.provider === 'wasabi') {
      const command = new GetObjectCommand({
        Bucket: data.bucket as string,
        Key: data.key as string
      });
      
      return await getSignedUrl(this.wasabiClient, command, { expiresIn });
    } else {
      const { data: signedData, error: signError } = await this.supabaseClient.storage
        .from(data.bucket as string)
        .createSignedUrl(data.key as string, expiresIn);

      if (signError) throw new Error(`Failed to create signed URL: ${signError.message}`);
      return signedData.signedUrl;
    }
  }

  /**
   * List files with database filtering
   */
  async listFiles(options: ListOptions = {}): Promise<FileMetadata[]> {
    let query = this.supabaseClient
      .from('file_storage')
      .select('*')
      .order('created_at', { ascending: false });

    if (options.provider) {
      query = query.eq('provider', options.provider);
    }

    if (options.folder) {
      query = query.eq('folder', options.folder);
    }

    if (options.project_id) {
      query = query.eq('project_id', options.project_id);
    }

    if (options.user_id) {
      query = query.eq('uploaded_by', options.user_id);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }

    return data.map(item => ({
      id: item.id as string,
      filename: item.filename as string,
      original_filename: item.original_filename as string,
      file_path: item.file_path as string,
      size: item.file_size as number,
      mimeType: item.mime_type as string,
      provider: item.provider as StorageProvider,
      bucket: item.bucket as string,
      key: item.key as string,
      url: item.url as string,
      access_count: item.access_count as number,
      is_public: item.is_public as boolean,
      folder: item.folder as string,
      tags: item.tags as string[],
      metadata: item.metadata as Record<string, any>,
      project_id: item.project_id as string,
      uploaded_by: item.uploaded_by as string,
      uploadedAt: new Date(item.created_at as string)
    }));
  }

  /**
   * Delete file from storage and database
   */
  async deleteFile(fileId: string): Promise<boolean> {
    // Get file metadata
    const { data, error } = await this.supabaseClient
      .from('file_storage')
      .select('*')
      .eq('id', fileId)
      .single();

    if (error || !data) {
      throw new Error('File not found');
    }

    try {
      // Delete from storage provider
      if (data.provider === 'wasabi') {
        const command = new DeleteObjectCommand({
          Bucket: data.bucket as string,
          Key: data.key as string
        });
        await this.wasabiClient.send(command);
      } else {
        const { error: deleteError } = await this.supabaseClient.storage
          .from(data.bucket as string)
          .remove([data.key as string]);

        if (deleteError) throw deleteError;
      }

      // Delete from database
      const { error: dbError } = await this.supabaseClient
        .from('file_storage')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      return true;
    } catch (error) {
      console.error(`Delete failed for ${fileId}:`, error);
      throw new Error(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get storage analytics
   */
  async getStorageAnalytics(): Promise<any> {
    const { data, error } = await this.supabaseClient
      .from('storage_analytics')
      .select('*')
      .order('date', { ascending: false })
      .limit(30);

    if (error) {
      console.error('Analytics fetch error:', error);
      return null;
    }

    return data;
  }

  /**
   * Legacy compatibility methods
   */
  async upload(
    file: Buffer | Uint8Array | File,
    filename: string,
    mimeType: string,
    options: UploadOptions = {}
  ): Promise<FileMetadata> {
    const buffer = file instanceof File ? Buffer.from(await file.arrayBuffer()) : Buffer.from(file);
    const result = await this.uploadFile(buffer, filename, mimeType, options);
    
    if (!result.success || !result.file_id) {
      throw new Error('Upload failed');
    }

    // Get the stored metadata
    const { data, error } = await this.supabaseClient
      .from('file_storage')
      .select('*')
      .eq('id', result.file_id)
      .single();

    if (error || !data) {
      throw new Error('Failed to retrieve uploaded file metadata');
    }

    return {
      id: data.id as string,
      filename: data.filename as string,
      original_filename: data.original_filename as string,
      file_path: data.file_path as string,
      size: data.file_size as number,
      mimeType: data.mime_type as string,
      provider: data.provider as StorageProvider,
      bucket: data.bucket as string,
      key: data.key as string,
      url: data.url as string,
      access_count: data.access_count as number,
      is_public: data.is_public as boolean,
      folder: data.folder as string,
      tags: data.tags as string[],
      metadata: data.metadata as Record<string, any>,
      project_id: data.project_id as string,
      uploaded_by: data.uploaded_by as string,
      uploadedAt: new Date(data.created_at as string)
    };
  }

  async download(fileId: string): Promise<{ buffer: Buffer; metadata: FileMetadata }> {
    return this.downloadFile(fileId);
  }
}

// Export singleton instance
export const multiCloudStorage = new MultiCloudStorage();

// Convenience functions
export async function uploadFile(
  file: Buffer | Uint8Array | File,
  filename: string,
  mimeType: string,
  options?: UploadOptions
) {
  return multiCloudStorage.upload(file, filename, mimeType, options);
}

export async function downloadFile(fileId: string) {
  return multiCloudStorage.download(fileId);
}

export async function deleteFile(fileId: string) {
  return multiCloudStorage.deleteFile(fileId);
}

export async function getFileUrl(provider: StorageProvider, key: string, expiresIn?: number) {
  return multiCloudStorage.getSignedUrl(key, expiresIn);
}

export async function optimizeStorageCosts() {
  // Implementation needed
}

export async function getStorageAnalytics() {
  return multiCloudStorage.getStorageAnalytics();
}

export async function checkStorageHealth() {
  // Implementation needed
} 