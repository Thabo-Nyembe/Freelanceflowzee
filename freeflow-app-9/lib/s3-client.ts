import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// S3 Client Configuration for Supabase Storage
const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT || process.env.AWS_S3_ENDPOINT,
  region: process.env.S3_REGION || process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: true, // Required for Supabase S3 compatibility
})

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'freeflowzee-storage'

export interface UploadResult {
  key: string
  url: string
  bucket: string
}

export interface FileUploadOptions {
  folder?: string
  filename?: string
  contentType?: string
  metadata?: Record<string, string>
}

/**
 * Upload a file to S3-compatible storage
 */
export async function uploadFile(
  file: Buffer | Uint8Array | string,
  options: FileUploadOptions = {}
): Promise<UploadResult> {
  const {
    folder = 'uploads',
    filename = `file-${Date.now()}`,
    contentType = 'application/octet-stream',
    metadata = {}
  } = options

  const key = folder ? `${folder}/${filename}` : filename

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
      Metadata: metadata,
    })

    await s3Client.send(command)

    return {
      key,
      url: `${process.env.S3_ENDPOINT}/${BUCKET_NAME}/${key}`,
      bucket: BUCKET_NAME,
    }
  } catch (error) {
    console.error('Failed to upload file:', error)
    throw new Error('File upload failed')
  }
}

/**
 * Generate a presigned URL for file upload
 */
export async function getUploadPresignedUrl(
  key: string,
  contentType: string = 'application/octet-stream',
  expiresIn: number = 3600 // 1 hour
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    })

    return await getSignedUrl(s3Client, command, { expiresIn })
  } catch (error) {
    console.error('Failed to generate upload presigned URL:', error)
    throw new Error('Presigned URL generation failed')
  }
}

/**
 * Generate a presigned URL for file download
 */
export async function getDownloadPresignedUrl(
  key: string,
  expiresIn: number = 3600 // 1 hour
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    return await getSignedUrl(s3Client, command, { expiresIn })
  } catch (error) {
    console.error('Failed to generate download presigned URL:', error)
    throw new Error('Presigned URL generation failed')
  }
}

/**
 * Delete a file from S3-compatible storage
 */
export async function deleteFile(key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    await s3Client.send(command)
    return true
  } catch (error) {
    console.error('Failed to delete file:', error)
    return false
  }
}

/**
 * List files in a folder
 */
export async function listFiles(
  prefix: string = '',
  maxKeys: number = 100
): Promise<Array<{ key: string; size: number; lastModified: Date }>> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      MaxKeys: maxKeys,
    })

    const response = await s3Client.send(command)
    
    return (response.Contents || []).map(object => ({
      key: object.Key || '',
      size: object.Size || 0,
      lastModified: object.LastModified || new Date(),
    }))
  } catch (error) {
    console.error('Failed to list files:', error)
    throw new Error('File listing failed')
  }
}

/**
 * Check if S3 connection is working
 */
export async function testConnection(): Promise<boolean> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      MaxKeys: 1,
    })

    await s3Client.send(command)
    return true
  } catch (error) {
    console.error('S3 connection test failed:', error)
    return false
  }
}

export { s3Client, BUCKET_NAME } 