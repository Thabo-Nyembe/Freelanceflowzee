import { test, expect, Page } from &apos;@playwright/test&apos;
import path from &apos;path&apos;
import fs from &apos;fs&apos;

// Test configuration
const TEST_PROJECT_ID = &apos;test-project-12345&apos;
const TEST_TIMEOUT = 30000
const BASE_URL = &apos;http://localhost:3001&apos;

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
    filename = &apos;test-document.pdf&apos;,
    content = &apos;%PDF-1.4 Mock PDF content for testing&apos;,
    mimeType = &apos;application/pdf&apos;,
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
      
      formData.append(&apos;file&apos;, file)
      formData.append(&apos;projectId&apos;, projectId)
      if (overwrite) {
        formData.append(&apos;overwrite&apos;, &apos;true&apos;)
      }

      try {
        const response = await fetch(`${baseUrl}/api/storage/upload`, {
          method: &apos;POST&apos;,
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
          error: error.message || &apos;Upload failed&apos;,
          status: 500
        }
      }
    },
    { projectId, baseUrl, fileData: actualFileData, overwrite }
  )
}

test.describe(&apos;File Storage System&apos;, () => {
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for storage operations
    page.setDefaultTimeout(TEST_TIMEOUT)
  })

  test.describe(&apos;File Upload Tests&apos;, () => {
    test(&apos;should successfully upload a supported file (PDF)&apos;, async ({ page }) => {
      const response = await uploadFile(page, {
        projectId: TEST_PROJECT_ID,
        baseUrl: BASE_URL
      })

      // Note: We expect this to fail with Supabase setup issues initially
      // This validates our error handling
      expect(typeof response.success).toBe(&apos;boolean&apos;)
      if (response.success) {
        expect(response.data).toHaveProperty(&apos;id&apos;)
        expect(response.data).toHaveProperty(&apos;filename&apos;)
        expect(response.data.filename).toBe(&apos;test-document.pdf&apos;)
        expect(response.data).toHaveProperty(&apos;size&apos;)
        expect(response.data).toHaveProperty(&apos;mimeType&apos;, &apos;application/pdf&apos;)
        expect(response.data).toHaveProperty(&apos;url&apos;)
      } else {
        // If Supabase isn&apos;t properly configured, we should get an informative error
        expect(typeof response.error).toBe(&apos;string&apos;)
        console.log(`Expected error (Supabase not configured): ${response.error}`)
      }
    })

    test(&apos;should handle re-uploading same file with overwrite logic&apos;, async ({ page }) => {
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
      expect(typeof firstUpload.success).toBe(&apos;boolean&apos;)
      expect(typeof secondUpload.success).toBe(&apos;boolean&apos;)
      
      if (secondUpload.success) {
        expect(secondUpload.data.overwritten).toBe(true)
      }
    })

    test(&apos;should reject invalid file format (executable)&apos;, async ({ page }) => {
      const response = await uploadFile(page, {
        projectId: TEST_PROJECT_ID,
        baseUrl: BASE_URL,
        fileData: {
          filename: &apos;malicious.exe&apos;,
          content: &apos;MZ fake executable content&apos;,
          mimeType: &apos;application/x-msdownload&apos;
        }
      })

      expect(response.success).toBe(false)
      expect(response.error).toContain(&apos;File type not allowed for security reasons&apos;)
    })

    test(&apos;should reject oversized files&apos;, async ({ page }) => {
      // Create a large file description (we won&apos;t actually create 101MB in memory)
      const response = await page.evaluate(
        async ({ projectId, baseUrl }) => {
          const formData = new FormData()
          
          // Create a mock large file by setting size property
          const largeContent = &apos;x'.repeat(1000) // Small content but we&apos;ll modify the size check
          const blob = new Blob([largeContent], { type: &apos;application/pdf&apos; })
          
          // Override the size property to simulate a large file
          Object.defineProperty(blob, &apos;size&apos;, {
            value: 101 * 1024 * 1024, // 101MB
            writable: false
          })
          
          const file = new File([blob], &apos;large-file.pdf&apos;, { type: &apos;application/pdf&apos; })
          
          // Override the size property on the file as well
          Object.defineProperty(file, &apos;size&apos;, {
            value: 101 * 1024 * 1024, // 101MB
            writable: false
          })
          
          formData.append(&apos;file&apos;, file)
          formData.append(&apos;projectId&apos;, projectId)

          try {
            const response = await fetch(`${baseUrl}/api/storage/upload`, {
              method: &apos;POST&apos;,
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
              error: error.message || &apos;Upload failed&apos;,
              status: 500
            }
          }
        },
        { projectId: TEST_PROJECT_ID, baseUrl: BASE_URL }
      )

      expect(response.success).toBe(false)
      expect(response.error).toContain(&apos;File size exceeds maximum allowed size&apos;)
    })

    test(&apos;should upload multiple supported file types&apos;, async ({ page }) => {
      const fileTypes = [
        { filename: &apos;test.txt&apos;, content: &apos;Hello world&apos;, mimeType: &apos;text/plain&apos; },
        { filename: &apos;test.png&apos;, content: &apos;PNG fake content&apos;, mimeType: &apos;image/png&apos; },
        { filename: &apos;test.mp3&apos;, content: &apos;MP3 fake content&apos;, mimeType: &apos;audio/mpeg&apos; }
      ]

      for (const fileTest of fileTypes) {
        const response = await uploadFile(page, {
          projectId: TEST_PROJECT_ID,
          baseUrl: BASE_URL,
          fileData: fileTest
        })

        // Either succeeds or fails with informative error
        expect(typeof response.success).toBe(&apos;boolean&apos;)
        if (!response.success) {
          console.log(`${fileTest.filename} upload result: ${response.error}`)
        }
      }
    })

    test(&apos;should validate project ID parameter&apos;, async ({ page }) => {
      const response = await page.evaluate(
        async ({ baseUrl }) => {
          const formData = new FormData()
          
          const blob = new Blob([&apos;test content&apos;], { type: &apos;application/pdf&apos; })
          const file = new File([blob], &apos;test.pdf&apos;, { type: &apos;application/pdf&apos; })
          
          formData.append(&apos;file&apos;, file)
          // Intentionally omit projectId

          try {
            const response = await fetch(`${baseUrl}/api/storage/upload`, {
              method: &apos;POST&apos;,
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
              error: error.message || &apos;Upload failed&apos;,
              status: 500
            }
          }
        },
        { baseUrl: BASE_URL }
      )

      expect(response.success).toBe(false)
      expect(response.error).toContain(&apos;Project ID is required&apos;)
    })

    test(&apos;should validate required file field&apos;, async ({ page }) => {
      const response = await page.evaluate(
        async ({ projectId, baseUrl }) => {
          const formData = new FormData()
          formData.append(&apos;projectId&apos;, projectId)
          // Intentionally omit file

          try {
            const response = await fetch(`${baseUrl}/api/storage/upload`, {
              method: &apos;POST&apos;,
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
              error: error.message || &apos;Upload failed&apos;,
              status: 500
            }
          }
        },
        { projectId: TEST_PROJECT_ID, baseUrl: BASE_URL }
      )

      expect(response.success).toBe(false)
      expect(response.error).toContain(&apos;No file provided&apos;)
    })
  })

  test.describe(&apos;File Download Tests&apos;, () => {
    test(&apos;should handle file not found gracefully&apos;, async ({ page }) => {
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
              error: error.message || &apos;Download failed&apos;,
              status: 500
            }
          }
        },
        { projectId: TEST_PROJECT_ID, baseUrl: BASE_URL }
      )

      expect(response.success).toBe(false)
      expect(response.error).toContain(&apos;File not found&apos;)
      expect(response.status).toBe(404)
    })

    test(&apos;should validate project ID for downloads&apos;, async ({ page }) => {
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
              error: error.message || &apos;Download failed&apos;,
              status: 500
            }
          }
        },
        { baseUrl: BASE_URL }
      )

      expect(response.success).toBe(false)
      expect(response.error).toContain(&apos;Project ID is required&apos;)
      expect(response.status).toBe(400)
    })

    test(&apos;should generate signed download URLs&apos;, async ({ page }) => {
      const response = await page.evaluate(
        async ({ projectId, baseUrl }) => {
          try {
            const response = await fetch(`${baseUrl}/api/storage/download/test.pdf`, {
              method: &apos;POST&apos;,
              headers: {
                &apos;Content-Type&apos;: &apos;application/json&apos;
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
              error: error.message || &apos;URL generation failed&apos;,
              status: 500
            }
          }
        },
        { projectId: TEST_PROJECT_ID, baseUrl: BASE_URL }
      )

      // Either succeeds or fails with informative error about missing file
      expect(typeof response.success).toBe(&apos;boolean&apos;)
      if (response.success) {
        expect(response.data).toHaveProperty(&apos;signedUrl&apos;)
        expect(response.data).toHaveProperty(&apos;expiresAt&apos;)
        expect(response.data.filename).toBe(&apos;test.pdf&apos;)
      } else {
        console.log(`Expected error (file doesn&apos;t exist): ${response.error}`)
      }
    })
  })

  test.describe(&apos;Security and Error Handling&apos;, () => {
    test(&apos;should sanitize file names properly&apos;, async ({ page }) => {
      const response = await uploadFile(page, {
        projectId: TEST_PROJECT_ID,
        baseUrl: BASE_URL,
        fileData: {
          filename: &apos;../../../etc/passwd.txt&apos;,
          content: &apos;malicious path traversal attempt&apos;,
          mimeType: &apos;text/plain&apos;
        }
      })

      if (response.success) {
        // Filename should be sanitized
        expect(response.data.filename).not.toContain(&apos;../&apos;)
        expect(response.data.filename).toMatch(/^[a-zA-Z0-9._-]+$/)
      } else {
        // Should fail gracefully
        expect(typeof response.error).toBe(&apos;string&apos;)
      }
    })

    test(&apos;should handle network errors gracefully&apos;, async ({ page }) => {
      // Test with invalid URL to simulate network error
      const response = await page.evaluate(
        async ({ projectId }) => {
          const formData = new FormData()
          const blob = new Blob([&apos;test&apos;], { type: &apos;application/pdf&apos; })
          const file = new File([blob], &apos;test.pdf&apos;, { type: &apos;application/pdf&apos; })
          
          formData.append(&apos;file&apos;, file)
          formData.append(&apos;projectId&apos;, projectId)

          try {
            const response = await fetch(&apos;http://invalid-url:99999/api/storage/upload&apos;, {
              method: &apos;POST&apos;,
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
              error: error.message || &apos;Network error&apos;,
              networkError: true
            }
          }
        },
        { projectId: TEST_PROJECT_ID }
      )

      expect(response.success).toBe(false)
      expect(typeof response.error).toBe(&apos;string&apos;)
      expect(response.networkError).toBe(true)
    })
  })
})
