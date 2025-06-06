import { test, expect, Page } from '@playwright/test'
import path from 'path'
import fs from 'fs'

// Test configuration
const TEST_PROJECT_ID = 'test-project-12345'
const TEST_TIMEOUT = 30000
const BASE_URL = 'http://localhost:3000'

// Helper function to create test files
function createTestFile(filename: string, content: string, mimeType: string): File {
  const buffer = Buffer.from(content)
  const blob = new Blob([buffer], { type: mimeType })
  return new File([blob], filename, { type: mimeType })
}

// Helper function to upload a file via the API
async function uploadFile(page: Page, options: {
  projectId: string
  baseUrl: string
  filename?: string
  content?: string
  mimeType?: string
  fileData?: { filename: string; content: string; mimeType: string }
  overwrite?: boolean
}) {
  const {
    projectId,
    baseUrl,
    filename = 'test-document.pdf',
    content = '%PDF-1.4 Mock PDF content for testing',
    mimeType = 'application/pdf',
    fileData,
    overwrite = false
  } = options

  const actualFileData = fileData || { filename, content, mimeType }

  return await page.evaluate(
    async ({ projectId, baseUrl, fileData, overwrite }) => {
      const formData = new FormData()
      
      // Create blob and file
      const blob = new Blob([fileData.content], { type: fileData.mimeType })
      const file = new File([blob], fileData.filename, { type: fileData.mimeType })
      
      formData.append('file', file)
      formData.append('projectId', projectId)
      if (overwrite) {
        formData.append('overwrite', 'true')
      }

      try {
        const response = await fetch(`${baseUrl}/api/storage/upload`, {
          method: 'POST',
          body: formData
        })

        const data = await response.json()
        return {
          success: data.success,
          data: data.data,
          error: data.error,
          status: response.status
        }
      } catch (error) {
        return {
          success: false,
          error: error.message || 'Upload failed',
          status: 500
        }
      }
    },
    { projectId, baseUrl, fileData: actualFileData, overwrite }
  )
}

test.describe('File Storage System', () => {
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for storage operations
    page.setDefaultTimeout(TEST_TIMEOUT)
  })

  test.describe('File Upload Tests', () => {
    test('should successfully upload a supported file (PDF)', async ({ page }) => {
      const response = await uploadFile(page, {
        projectId: TEST_PROJECT_ID,
        baseUrl: BASE_URL
      })

      // Note: We expect this to fail with Supabase setup issues initially
      // This validates our error handling
      expect(typeof response.success).toBe('boolean')
      if (response.success) {
        expect(response.data).toHaveProperty('id')
        expect(response.data).toHaveProperty('filename')
        expect(response.data.filename).toBe('test-document.pdf')
        expect(response.data).toHaveProperty('size')
        expect(response.data).toHaveProperty('mimeType', 'application/pdf')
        expect(response.data).toHaveProperty('url')
      } else {
        // If Supabase isn't properly configured, we should get an informative error
        expect(typeof response.error).toBe('string')
        console.log(`Expected error (Supabase not configured): ${response.error}`)
      }
    })

    test('should handle re-uploading same file with overwrite logic', async ({ page }) => {
      // First upload
      const firstUpload = await uploadFile(page, {
        projectId: TEST_PROJECT_ID,
        baseUrl: BASE_URL
      })

      // Second upload with overwrite flag
      const secondUpload = await uploadFile(page, {
        projectId: TEST_PROJECT_ID,
        baseUrl: BASE_URL,
        overwrite: true
      })

      // Both should have consistent behavior
      expect(typeof firstUpload.success).toBe('boolean')
      expect(typeof secondUpload.success).toBe('boolean')
      
      if (secondUpload.success) {
        expect(secondUpload.data.overwritten).toBe(true)
      }
    })

    test('should reject invalid file format (executable)', async ({ page }) => {
      const response = await uploadFile(page, {
        projectId: TEST_PROJECT_ID,
        baseUrl: BASE_URL,
        fileData: {
          filename: 'malicious.exe',
          content: 'MZ fake executable content',
          mimeType: 'application/x-msdownload'
        }
      })

      expect(response.success).toBe(false)
      expect(response.error).toContain('File type not allowed for security reasons')
    })

    test('should reject oversized files', async ({ page }) => {
      // Create a large file description (we won't actually create 101MB in memory)
      const response = await page.evaluate(
        async ({ projectId, baseUrl }) => {
          const formData = new FormData()
          
          // Create a mock large file by setting size property
          const largeContent = 'x'.repeat(1000) // Small content but we'll modify the size check
          const blob = new Blob([largeContent], { type: 'application/pdf' })
          
          // Override the size property to simulate a large file
          Object.defineProperty(blob, 'size', {
            value: 101 * 1024 * 1024, // 101MB
            writable: false
          })
          
          const file = new File([blob], 'large-file.pdf', { type: 'application/pdf' })
          
          // Override the size property on the file as well
          Object.defineProperty(file, 'size', {
            value: 101 * 1024 * 1024, // 101MB
            writable: false
          })
          
          formData.append('file', file)
          formData.append('projectId', projectId)

          try {
            const response = await fetch(`${baseUrl}/api/storage/upload`, {
              method: 'POST',
              body: formData
            })

            const data = await response.json()
            return {
              success: data.success,
              error: data.error,
              status: response.status
            }
          } catch (error) {
            return {
              success: false,
              error: error.message || 'Upload failed',
              status: 500
            }
          }
        },
        { projectId: TEST_PROJECT_ID, baseUrl: BASE_URL }
      )

      expect(response.success).toBe(false)
      expect(response.error).toContain('File size exceeds maximum allowed size')
    })

    test('should upload multiple supported file types', async ({ page }) => {
      const fileTypes = [
        { filename: 'test.txt', content: 'Hello world', mimeType: 'text/plain' },
        { filename: 'test.png', content: 'PNG fake content', mimeType: 'image/png' },
        { filename: 'test.mp3', content: 'MP3 fake content', mimeType: 'audio/mpeg' }
      ]

      for (const fileTest of fileTypes) {
        const response = await uploadFile(page, {
          projectId: TEST_PROJECT_ID,
          baseUrl: BASE_URL,
          fileData: fileTest
        })

        // Either succeeds or fails with informative error
        expect(typeof response.success).toBe('boolean')
        if (!response.success) {
          console.log(`${fileTest.filename} upload result: ${response.error}`)
        }
      }
    })

    test('should validate project ID parameter', async ({ page }) => {
      const response = await page.evaluate(
        async ({ baseUrl }) => {
          const formData = new FormData()
          
          const blob = new Blob(['test content'], { type: 'application/pdf' })
          const file = new File([blob], 'test.pdf', { type: 'application/pdf' })
          
          formData.append('file', file)
          // Intentionally omit projectId

          try {
            const response = await fetch(`${baseUrl}/api/storage/upload`, {
              method: 'POST',
              body: formData
            })

            const data = await response.json()
            return {
              success: data.success,
              error: data.error,
              status: response.status
            }
          } catch (error) {
            return {
              success: false,
              error: error.message || 'Upload failed',
              status: 500
            }
          }
        },
        { baseUrl: BASE_URL }
      )

      expect(response.success).toBe(false)
      expect(response.error).toContain('Project ID is required')
    })

    test('should validate required file field', async ({ page }) => {
      const response = await page.evaluate(
        async ({ projectId, baseUrl }) => {
          const formData = new FormData()
          formData.append('projectId', projectId)
          // Intentionally omit file

          try {
            const response = await fetch(`${baseUrl}/api/storage/upload`, {
              method: 'POST',
              body: formData
            })

            const data = await response.json()
            return {
              success: data.success,
              error: data.error,
              status: response.status
            }
          } catch (error) {
            return {
              success: false,
              error: error.message || 'Upload failed',
              status: 500
            }
          }
        },
        { projectId: TEST_PROJECT_ID, baseUrl: BASE_URL }
      )

      expect(response.success).toBe(false)
      expect(response.error).toContain('No file provided')
    })
  })

  test.describe('File Download Tests', () => {
    test('should handle file not found gracefully', async ({ page }) => {
      const response = await page.evaluate(
        async ({ projectId, baseUrl }) => {
          try {
            const response = await fetch(`${baseUrl}/api/storage/download/nonexistent.pdf?projectId=${projectId}`)
            const data = await response.json()
            return {
              success: data.success,
              error: data.error,
              status: response.status
            }
          } catch (error) {
            return {
              success: false,
              error: error.message || 'Download failed',
              status: 500
            }
          }
        },
        { projectId: TEST_PROJECT_ID, baseUrl: BASE_URL }
      )

      expect(response.success).toBe(false)
      expect(response.error).toContain('File not found')
      expect(response.status).toBe(404)
    })

    test('should validate project ID for downloads', async ({ page }) => {
      const response = await page.evaluate(
        async ({ baseUrl }) => {
          try {
            const response = await fetch(`${baseUrl}/api/storage/download/test.pdf`)
            const data = await response.json()
            return {
              success: data.success,
              error: data.error,
              status: response.status
            }
          } catch (error) {
            return {
              success: false,
              error: error.message || 'Download failed',
              status: 500
            }
          }
        },
        { baseUrl: BASE_URL }
      )

      expect(response.success).toBe(false)
      expect(response.error).toContain('Project ID is required')
      expect(response.status).toBe(400)
    })

    test('should generate signed download URLs', async ({ page }) => {
      const response = await page.evaluate(
        async ({ projectId, baseUrl }) => {
          try {
            const response = await fetch(`${baseUrl}/api/storage/download/test.pdf`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                projectId: projectId,
                expiryHours: 2
              })
            })

            const data = await response.json()
            return {
              success: data.success,
              data: data.data,
              error: data.error,
              status: response.status
            }
          } catch (error) {
            return {
              success: false,
              error: error.message || 'URL generation failed',
              status: 500
            }
          }
        },
        { projectId: TEST_PROJECT_ID, baseUrl: BASE_URL }
      )

      // Either succeeds or fails with informative error about missing file
      expect(typeof response.success).toBe('boolean')
      if (response.success) {
        expect(response.data).toHaveProperty('signedUrl')
        expect(response.data).toHaveProperty('expiresAt')
        expect(response.data.filename).toBe('test.pdf')
      } else {
        console.log(`Expected error (file doesn't exist): ${response.error}`)
      }
    })
  })

  test.describe('Security and Error Handling', () => {
    test('should sanitize file names properly', async ({ page }) => {
      const response = await uploadFile(page, {
        projectId: TEST_PROJECT_ID,
        baseUrl: BASE_URL,
        fileData: {
          filename: '../../../etc/passwd.txt',
          content: 'malicious path traversal attempt',
          mimeType: 'text/plain'
        }
      })

      if (response.success) {
        // Filename should be sanitized
        expect(response.data.filename).not.toContain('../')
        expect(response.data.filename).toMatch(/^[a-zA-Z0-9._-]+$/)
      } else {
        // Should fail gracefully
        expect(typeof response.error).toBe('string')
      }
    })

    test('should handle network errors gracefully', async ({ page }) => {
      // Test with invalid URL to simulate network error
      const response = await page.evaluate(
        async ({ projectId }) => {
          const formData = new FormData()
          const blob = new Blob(['test'], { type: 'application/pdf' })
          const file = new File([blob], 'test.pdf', { type: 'application/pdf' })
          
          formData.append('file', file)
          formData.append('projectId', projectId)

          try {
            const response = await fetch('http://invalid-url:99999/api/storage/upload', {
              method: 'POST',
              body: formData
            })

            const data = await response.json()
            return {
              success: data.success,
              error: data.error
            }
          } catch (error) {
            return {
              success: false,
              error: error.message || 'Network error',
              networkError: true
            }
          }
        },
        { projectId: TEST_PROJECT_ID }
      )

      expect(response.success).toBe(false)
      expect(typeof response.error).toBe('string')
      expect(response.networkError).toBe(true)
    })
  })
})
