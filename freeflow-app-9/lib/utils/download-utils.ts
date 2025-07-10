export interface DownloadableFile {
  id?: string
  name: string
  url?: string
  downloadUrl?: string
  signedUrl?: string
  provider?: 'supabase' | 'wasabi'
  key?: string
  mimeType?: string
  size?: number
}

/**
 * Universal download handler for files across the application
 * Supports multiple download methods: direct URLs, signed URLs, API generation
 */
export async function downloadFile(file: DownloadableFile): Promise<void> {
  try {
    console.log(`Initiating download for: ${file.name}`)

    // Method 1: Direct download URL
    if (file.downloadUrl) {
      window.open(file.downloadUrl, '_blank')
      return
    }

    // Method 2: Pre-signed URL
    if (file.signedUrl) {
      window.open(file.signedUrl, '_blank')
      return
    }

    // Method 3: Direct URL
    if (file.url) {
      window.open(file.url, '_blank')
      return
    }

    // Method 4: Generate signed URL via API (if file ID exists)
    if (file.id) {
      const response = await fetch(`/api/storage/download?fileId=${file.id}`)
      
      if (response.ok) {
        const result = await response.json()
        if (result.signedUrl) {
          window.open(result.signedUrl, '_blank')
          return
        }
      }
    }

    // Method 5: Generate signed URL via provider and key
    if (file.provider && file.key) {
      const response = await fetch(`/api/storage/download?provider=${file.provider}&key=${file.key}`)
      
      if (response.ok) {
        const result = await response.json()
        if (result.signedUrl) {
          window.open(result.signedUrl, '_blank')
          return
        }
      }
    }

    // If no method works, throw error
    throw new Error('No valid download method available')

  } catch (error) {
    console.error('Download failed: ', error);
    throw error
  }
}

/**
 * Download multiple files as a batch with progress tracking
 */
export async function downloadFiles(files: DownloadableFile[], onProgress?: (completed: number, total: number) => void): Promise<void> {
  let completed = 0
  const total = files.length

  const results = await Promise.allSettled(
    files.map(async (file) => {
      try {
        await downloadFile(file)
        completed++
        onProgress?.(completed, total)
        return { success: true, file: file.name }
      } catch (error) {
        completed++
        onProgress?.(completed, total)
        return { success: false, file: file.name, error: error instanceof Error ? error.message : 'Unknown error' }
      }
    })
  )

  const failed = results.filter(result => result.status === 'rejected' || !result.value.success).length
  
  if (failed > 0) {
    console.warn(`${failed} out of ${files.length} downloads failed`)
    throw new Error(`${failed} downloads failed`)
  }
}

/**
 * Enhanced document generation with support for different types
 */
export async function downloadDocument(type: string, data: Record<string, unknown>: unknown, filename: string): Promise<void> {
  try {
    const response = await fetch(`/api/documents/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        data,
        filename
      }),
    })

    if (response.ok) {
      const blob = await response.blob()
      triggerDownload(blob, filename)
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Document generation failed' }))
      throw new Error(errorData.error || 'Document generation failed')
    }
  } catch (error) {
    console.error('Document download failed: ', error);
    throw error
  }
}

/**
 * Download analytics/reports with enhanced error handling
 */
export async function downloadReport(type: 'csv' | 'json' | 'pdf', endpoint: string, filename: string): Promise<void> {
  try {
    const response = await fetch(`${endpoint}?format=${type}`)
    
    if (response.ok) {
      const blob = await response.blob()
      triggerDownload(blob, filename)
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Report generation failed' }))
      throw new Error(errorData.error || 'Report generation failed')
    }
  } catch (error) {
    console.error('Report download failed: ', error);
    throw error
  }
}

/**
 * Enhanced invoice PDF download with receipt generation
 */
export async function downloadInvoice(invoiceId: string, invoiceData: Record<string, unknown>: unknown): Promise<void> {
  try {
    const response = await fetch('/api/invoices/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invoiceId,
        data: invoiceData
      }),
    })

    if (response.ok) {
      const blob = await response.blob()
      const filename = `invoice-${invoiceId}-${new Date().toISOString().split('T')[0]}.pdf`
      triggerDownload(blob, filename)
    } else {
      throw new Error('Invoice PDF generation failed')
    }
  } catch (error) {
    console.error('Invoice download failed: ', error);
    throw error
  }
}

/**
 * Gallery item download with license support
 */
export async function downloadGalleryItem(itemId: string, license: 'digital' | 'print' | 'commercial' = 'digital', galleryId?: string): Promise<void> {
  try {
    const response = await fetch('/api/gallery/download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        itemId,
        license,
        galleryId
      }),
    })

    if (response.ok) {
      const result = await response.json()
      if (result.downloadUrl) {
        window.open(result.downloadUrl, '_blank')
      } else if (result.blob) {
        const blob = new Blob([result.blob], { type: result.mimeType })
        triggerDownload(blob, result.filename)
      }
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Download failed' }))
      throw new Error(errorData.error || 'Gallery item download failed')
    }
  } catch (error) {
    console.error('Gallery download failed: ', error);
    throw error
  }
}

/**
 * Enhanced copy download link with fallback mechanisms
 */
export async function copyDownloadLink(file: DownloadableFile): Promise<string> {
  try {
    let link = ''

    if (file.downloadUrl) {
      link = file.downloadUrl
    } else if (file.signedUrl) {
      link = file.signedUrl
    } else if (file.url) {
      link = file.url
    } else if (file.id) {
      const response = await fetch(`/api/storage/download?fileId=${file.id}`)
      if (response.ok) {
        const result = await response.json()
        link = result.signedUrl || ''
      }
    } else if (file.provider && file.key) {
      const response = await fetch(`/api/storage/download?provider=${file.provider}&key=${file.key}`)
      if (response.ok) {
        const result = await response.json()
        link = result.signedUrl || ''
      }
    }

    if (link) {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(link)
      } else {
        // Fallback for non-secure contexts
        const textArea = document.createElement('textarea')
        textArea.value = link
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      return link
    } else {
      throw new Error('No download link available')
    }
  } catch (error) {
    console.error('Copy link failed: ', error)
    throw error
  }
}

/**
 * Enhanced file sharing with multiple options
 */
export async function shareFile(file: DownloadableFile, method: 'link' | 'email' | 'social' = 'link'): Promise<void> {
  try {
    const link = await copyDownloadLink(file)
    
    switch (method) {
      case 'link':
        if (navigator.share) {
          await navigator.share({
            title: file.name,
            text: `Download ${file.name}`,
            url: link,
          })
        } else {
          // Already copied to clipboard in copyDownloadLink
          alert(`Download link copied to clipboard: ${link}`)
        }
        break
        
      case 'email':
        const emailSubject = encodeURIComponent(`Download: ${file.name}`)
        const emailBody = encodeURIComponent(`Please download the file using this link: ${link}`)
        window.open(`mailto:?subject=${emailSubject}&body=${emailBody}`)
        break
        
      case 'social':
        const tweetText = encodeURIComponent(`Check out this file: ${file.name}`)
        window.open(`https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(link)}`)
        break
    }
  } catch (error) {
    console.error('Share failed: ', error)
    throw error
  }
}

/**
 * Helper function to trigger download of blob data
 */
function triggerDownload(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

/**
 * Bulk download with ZIP compression
 */
export async function downloadAsZip(files: DownloadableFile[], zipName: string = 'download.zip'): Promise<void> {
  try {
    const response = await fetch('/api/storage/zip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: files.map(f => ({ id: f.id, name: f.name, url: f.url || f.downloadUrl })),
        zipName
      }),
    })

    if (response.ok) {
      const blob = await response.blob()
      triggerDownload(blob, zipName)
    } else {
      throw new Error('ZIP generation failed')
    }
  } catch (error) {
    console.error('ZIP download failed: ', error)
    // Fallback to individual downloads
    await downloadFiles(files)
  }
}

/**
 * Download with password protection
 */
export async function downloadWithPassword(fileId: string, password: string): Promise<void> {
  try {
    const response = await fetch('/api/storage/protected-download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileId,
        password
      }),
    })

    if (response.ok) {
      const result = await response.json()
      if (result.downloadUrl) {
        window.open(result.downloadUrl, '_blank')
      }
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Invalid password' }))
      throw new Error(errorData.error || 'Access denied')
    }
  } catch (error) {
    console.error('Protected download failed: ', error)
    throw error
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Get file type icon component name
 */
export function getFileTypeIcon(mimeType: string | undefined): string {
  if (!mimeType) return 'FileText'
  
  if (mimeType.startsWith('image/')) return 'Image'
  if (mimeType.startsWith('video/')) return 'Video'
  if (mimeType.startsWith('audio/')) return 'Music'
  if (mimeType.includes('pdf')) return 'FileText'
  if (mimeType.includes('zip') || mimeType.includes('archive')) return 'Archive'
  if (mimeType.includes('doc') || mimeType.includes('word')) return 'FileText'
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'Grid'
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'Presentation'
  
  return 'FileText'
}

/**
 * Validate download permissions
 */
export function validateDownloadPermissions(_file: DownloadableFile, _userRole: string): boolean {
  // Add your permission logic here
  // For now, allow all downloads
  return true
}

/**
 * Universal download handler to simplify various download types
 */
export async function handleUniversalDownload(file: DownloadableFile | string, options: {
    type?: 'file' | 'invoice' | 'report' | 'gallery'
    license?: 'digital' | 'print' | 'commercial'
    password?: string
    onSuccess?: () => void
    onError?: (error: Error) => void
  } = {}
): Promise<void> {
  try {
    const { type = 'file', license, password, onSuccess } = options

    if (typeof file === 'string') {
      // It's an ID or endpoint
      switch (type) {
        case 'invoice':
          await downloadInvoice(file, {}) // TODO: fetch actual invoice data
          break
        case 'report':
          await downloadReport('pdf', file, `${file}.pdf`)
          break
        case 'gallery':
          await downloadGalleryItem(file, license)
          break
        default:
          await downloadFile({ id: file, name: 'downloaded-file' })
      }
    } else {
      // It's a DownloadableFile object
      if (password) {
        await downloadWithPassword(file.id!, password)
      } else {
        await downloadFile(file)
      }
    }
    onSuccess?.()
  } catch (error) {
    const err = error instanceof Error ? error : new Error('An unknown error occurred')
    console.error('Universal download failed:', err)
    options.onError?.(err)
  }
} 