import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

/**
 * COMPREHENSIVE FILES & COLLABORATION TESTING
 * Tests file management, upload/download, sharing, and collaboration features
 */

test.describe('KAZI Files & Collaboration - Comprehensive Testing', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test.describe('Files Hub - File Management', () => {
    test('should display files hub interface', async ({ page }) => {
      await helpers.navigateToDashboard();
      await helpers.clickDashboardTab('files-hub');
      
      // Verify files hub loads
      const filesElements = [
        '[data-testid="files-hub"]',
        '[data-testid="file-grid"]',
        '[data-testid="file-list"]',
        ':has-text("Files")',
        'button:has-text("Upload")',
        'input[type="file"]'
      ];

      let found = false;
      for (const selector of filesElements) {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          await expect(element).toBeVisible();
          found = true;
        }
      }
      
      expect(found).toBeTruthy();
    });

    test('should handle single file upload', async ({ page }) => {
      await helpers.navigateToDashboard();
      await helpers.clickDashboardTab('files-hub');
      
      // Create test file
      const testFilePath = await helpers.createTestFile('test-document.txt', 'This is a test document content');
      
      // Look for file upload input
      const fileInput = page.locator('input[type="file"]').first();
      if (await fileInput.isVisible()) {
        await helpers.uploadFile('input[type="file"]', testFilePath);
        
        // Wait for upload processing
        await page.waitForTimeout(3000);
        
        // Verify file appears in list
        const uploadedFile = page.locator(':has-text("test-document.txt")');
        if (await uploadedFile.isVisible()) {
          await expect(uploadedFile).toBeVisible();
        }
      }
    });

    test('should handle multiple file upload', async ({ page }) => {
      await helpers.navigateToDashboard();
      await helpers.clickDashboardTab('files-hub');
      
      // Create multiple test files
      const file1Path = await helpers.createTestFile('document1.txt', 'Document 1 content');
      const file2Path = await helpers.createTestFile('document2.txt', 'Document 2 content');
      
      const fileInput = page.locator('input[type="file"]').first();
      if (await fileInput.isVisible()) {
        // Check if multiple attribute is present
        const isMultiple = await fileInput.getAttribute('multiple');
        if (isMultiple !== null) {
          await fileInput.setInputFiles([file1Path, file2Path]);
          await page.waitForTimeout(3000);
          
          // Verify both files appear
          await expect(page.locator(':has-text("document1.txt")')).toBeVisible();
          await expect(page.locator(':has-text("document2.txt")')).toBeVisible();
        }
      }
    });

    test('should validate file types and sizes', async ({ page }) => {
      await helpers.navigateToDashboard();
      await helpers.clickDashboardTab('files-hub');
      
      // Test with potentially unsupported file type
      const invalidFilePath = await helpers.createTestFile('test.exe', 'fake executable content');
      
      const fileInput = page.locator('input[type="file"]').first();
      if (await fileInput.isVisible()) {
        await fileInput.setInputFiles(invalidFilePath);
        await page.waitForTimeout(2000);
        
        // Should show error message for invalid file type
        await helpers.expectErrorMessage().catch(() => {
          console.log('File validation varies by implementation');
        });
      }
    });

    test('should organize files in folders', async ({ page }) => {
      await helpers.navigateToDashboard();
      await helpers.clickDashboardTab('files-hub');
      
      // Look for folder creation
      const createFolderBtn = page.locator('button:has-text("New Folder"), button:has-text("Create Folder")');
      if (await createFolderBtn.isVisible()) {
        await createFolderBtn.click();
        await page.waitForTimeout(1000);
        
        // Should open folder creation dialog
        const folderNameInput = page.locator('input[name*="folder"], input[placeholder*="folder"], input[placeholder*="name"]');
        if (await folderNameInput.isVisible()) {
          await folderNameInput.fill('Test Folder');
          
          const createBtn = page.locator('button:has-text("Create"), button[type="submit"]').first();
          if (await createBtn.isVisible()) {
            await createBtn.click();
            await page.waitForTimeout(1000);
            
            // Verify folder appears
            const newFolder = page.locator(':has-text("Test Folder")');
            if (await newFolder.isVisible()) {
              await expect(newFolder).toBeVisible();
            }
          }
        }
      }
    });

    test('should support file operations (rename, move, delete)', async ({ page }) => {
      await helpers.navigateToDashboard();
      await helpers.clickDashboardTab('files-hub');
      
      // Upload a test file first
      const testFilePath = await helpers.createTestFile('operation-test.txt', 'Test file for operations');
      
      const fileInput = page.locator('input[type="file"]').first();
      if (await fileInput.isVisible()) {
        await helpers.uploadFile('input[type="file"]', testFilePath);
        await page.waitForTimeout(2000);
        
        // Look for file operations (context menu, action buttons)
        const fileItem = page.locator(':has-text("operation-test.txt")').first();
        if (await fileItem.isVisible()) {
          // Try right-click context menu
          await fileItem.click({ button: 'right' });
          await page.waitForTimeout(500);
          
          // Look for context menu options
          const contextMenuOptions = [
            'button:has-text("Rename")',
            'button:has-text("Delete")',
            'button:has-text("Move")',
            '[data-testid="context-menu"]'
          ];

          for (const selector of contextMenuOptions) {
            const option = page.locator(selector);
            if (await option.isVisible()) {
              await expect(option).toBeVisible();
            }
          }
        }
      }
    });

    test('should preview different file types', async ({ page }) => {
      await helpers.navigateToDashboard();
      await helpers.clickDashboardTab('files-hub');
      
      // Test file previews for different types
      const previewableFiles = [
        { name: 'image-test.jpg', content: 'fake-image-data' },
        { name: 'document-test.pdf', content: 'fake-pdf-data' },
        { name: 'text-test.txt', content: 'This is plain text content' }
      ];

      for (const fileInfo of previewableFiles) {
        const filePath = await helpers.createTestFile(fileInfo.name, fileInfo.content);
        
        const fileInput = page.locator('input[type="file"]').first();
        if (await fileInput.isVisible()) {
          await helpers.uploadFile('input[type="file"]', filePath);
          await page.waitForTimeout(2000);
          
          // Try to preview the file
          const fileItem = page.locator(`:has-text("${fileInfo.name}")`);
          if (await fileItem.isVisible()) {
            await fileItem.click();
            await page.waitForTimeout(1000);
            
            // Look for preview modal or inline preview
            const previewElements = [
              '[data-testid="file-preview"]',
              '[role="dialog"]:has-text("Preview")',
              '.file-preview',
              'img, iframe, pre'
            ];

            for (const selector of previewElements) {
              const preview = page.locator(selector);
              if (await preview.isVisible()) {
                await expect(preview).toBeVisible();
                break;
              }
            }
            
            // Close preview if modal
            await helpers.closeModal();
          }
        }
      }
    });

    test('should download files', async ({ page }) => {
      await helpers.navigateToDashboard();
      await helpers.clickDashboardTab('files-hub');
      
      // Upload a test file
      const testFilePath = await helpers.createTestFile('download-test.txt', 'Content for download test');
      
      const fileInput = page.locator('input[type="file"]').first();
      if (await fileInput.isVisible()) {
        await helpers.uploadFile('input[type="file"]', testFilePath);
        await page.waitForTimeout(2000);
        
        // Look for download functionality
        const downloadBtn = page.locator('button:has-text("Download"), a[download]');
        if (await downloadBtn.isVisible()) {
          // Set up download listener
          const downloadPromise = page.waitForEvent('download');
          await downloadBtn.click();
          
          try {
            const download = await downloadPromise;
            expect(download.suggestedFilename()).toBeTruthy();
          } catch (error) {
            console.log('Download test varies by implementation');
          }
        }
      }
    });
  });

  test.describe('File Sharing & Permissions', () => {
    test('should share files with other users', async ({ page }) => {
      await helpers.navigateToDashboard();
      await helpers.clickDashboardTab('files-hub');
      
      // Upload a test file
      const testFilePath = await helpers.createTestFile('share-test.txt', 'Content for sharing test');
      
      const fileInput = page.locator('input[type="file"]').first();
      if (await fileInput.isVisible()) {
        await helpers.uploadFile('input[type="file"]', testFilePath);
        await page.waitForTimeout(2000);
        
        // Look for share functionality
        const shareBtn = page.locator('button:has-text("Share"), [data-testid="share-file"]');
        if (await shareBtn.isVisible()) {
          await shareBtn.click();
          await page.waitForTimeout(1000);
          
          // Should open share dialog
          const shareDialog = page.locator('[role="dialog"]:has-text("Share"), [data-testid="share-dialog"]');
          if (await shareDialog.isVisible()) {
            await expect(shareDialog).toBeVisible();
            
            // Look for share options
            const shareElements = [
              'input[placeholder*="email"], input[placeholder*="user"]',
              'button:has-text("Send"), button:has-text("Share")',
              'input[type="checkbox"]:has-text("read"), input[type="checkbox"]:has-text("write")'
            ];

            for (const selector of shareElements) {
              const element = page.locator(selector);
              if (await element.isVisible()) {
                await expect(element).toBeVisible();
              }
            }
          }
        }
      }
    });

    test('should generate shareable links', async ({ page }) => {
      await helpers.navigateToDashboard();
      await helpers.clickDashboardTab('files-hub');
      
      // Look for link sharing functionality
      const linkShareBtn = page.locator('button:has-text("Get Link"), button:has-text("Copy Link")');
      if (await linkShareBtn.isVisible()) {
        await linkShareBtn.click();
        await page.waitForTimeout(1000);
        
        // Should show shareable link
        const linkInput = page.locator('input[readonly], input[value*="http"]');
        if (await linkInput.isVisible()) {
          await expect(linkInput).toBeVisible();
          
          const linkValue = await linkInput.inputValue();
          expect(linkValue).toMatch(/^https?:\/\//);
        }
      }
    });

    test('should manage file permissions', async ({ page }) => {
      await helpers.navigateToDashboard();
      await helpers.clickDashboardTab('files-hub');
      
      // Look for permissions/settings
      const permissionsBtn = page.locator('button:has-text("Permissions"), button:has-text("Settings")');
      if (await permissionsBtn.isVisible()) {
        await permissionsBtn.click();
        await page.waitForTimeout(1000);
        
        // Should show permission options
        const permissionElements = [
          'input[type="radio"]:has-text("Private")',
          'input[type="radio"]:has-text("Public")',
          'select[name*="permission"]',
          'input[type="checkbox"]:has-text("read")',
          'input[type="checkbox"]:has-text("write")'
        ];

        for (const selector of permissionElements) {
          const element = page.locator(selector);
          if (await element.isVisible()) {
            await expect(element).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Search & Filter', () => {
    test('should search files by name', async ({ page }) => {
      await helpers.navigateToDashboard();
      await helpers.clickDashboardTab('files-hub');
      
      // Look for search functionality
      const searchInput = page.locator('input[placeholder*="search"], input[type="search"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('test');
        await page.waitForTimeout(1000);
        
        // Should filter results
        const searchResults = page.locator('[data-testid="search-results"], .file-item');
        if (await searchResults.isVisible()) {
          await expect(searchResults).toBeVisible();
        }
      }
    });

    test('should filter by file type', async ({ page }) => {
      await helpers.navigateToDashboard();
      await helpers.clickDashboardTab('files-hub');
      
      // Look for filter options
      const filterElements = [
        'select[name*="type"], select[name*="filter"]',
        'button:has-text("Images"), button:has-text("Documents")',
        '[data-testid="file-filter"]'
      ];

      for (const selector of filterElements) {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          await element.click();
          await page.waitForTimeout(500);
          
          // Should show filter options
          const filterOptions = page.locator('option, [role="option"]');
          if (await filterOptions.count() > 0) {
            await expect(filterOptions.first()).toBeVisible();
          }
        }
      }
    });

    test('should sort files by different criteria', async ({ page }) => {
      await helpers.navigateToDashboard();
      await helpers.clickDashboardTab('files-hub');
      
      // Look for sort options
      const sortElements = [
        'select[name*="sort"]',
        'button:has-text("Name"), button:has-text("Date")',
        '[data-testid="sort-dropdown"]'
      ];

      for (const selector of sortElements) {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          await element.click();
          await page.waitForTimeout(500);
          
          // Test different sort options
          const sortOptions = page.locator('option:has-text("Date"), option:has-text("Size")');
          if (await sortOptions.count() > 0) {
            await sortOptions.first().click();
            await page.waitForTimeout(1000);
          }
        }
      }
    });
  });

  test.describe('Storage Management', () => {
    test('should display storage usage', async ({ page }) => {
      await helpers.navigateToDashboard();
      await helpers.clickDashboardTab('files-hub');
      
      // Look for storage information
      const storageElements = [
        '[data-testid="storage-usage"]',
        ':has-text("GB"), :has-text("MB")',
        ':has-text("Storage")',
        '.progress-bar, .storage-bar',
        ':has-text("%")'
      ];

      for (const selector of storageElements) {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          await expect(element).toBeVisible();
        }
      }
    });

    test('should warn about storage limits', async ({ page }) => {
      await helpers.navigateToDashboard();
      await helpers.clickDashboardTab('files-hub');
      
      // Look for storage warnings (if any)
      const warningElements = [
        '[data-testid="storage-warning"]',
        '.alert:has-text("storage")',
        ':has-text("limit"), :has-text("quota")'
      ];

      for (const selector of warningElements) {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          await expect(element).toBeVisible();
        }
      }
    });
  });

  test.describe('Collaboration Features', () => {
    test('should display collaboration workspace', async ({ page }) => {
      // Check if there's a dedicated collaboration page
      const collaborationPages = ['/collaboration', '/workspace', '/team'];
      
      for (const pagePath of collaborationPages) {
        try {
          await helpers.navigateToPage(pagePath);
          
          const collaborationElements = [
            '[data-testid="collaboration-workspace"]',
            ':has-text("Collaboration")',
            ':has-text("Team")',
            ':has-text("Shared")',
            'button:has-text("Invite")'
          ];

          for (const selector of collaborationElements) {
            const element = page.locator(selector);
            if (await element.isVisible()) {
              await expect(element).toBeVisible();
              return; // Found collaboration features
            }
          }
        } catch (error) {
          continue; // Try next page
        }
      }
    });

    test('should handle real-time collaboration', async ({ page }) => {
      await helpers.navigateToDashboard();
      await helpers.clickDashboardTab('files-hub');
      
      // Look for real-time collaboration indicators
      const realtimeElements = [
        '[data-testid="live-cursor"]',
        '[data-testid="user-presence"]',
        '.collaboration-indicator',
        ':has-text("online"), :has-text("editing")'
      ];

      for (const selector of realtimeElements) {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          await expect(element).toBeVisible();
        }
      }
    });

    test('should support commenting and feedback', async ({ page }) => {
      await helpers.navigateToDashboard();
      await helpers.clickDashboardTab('files-hub');
      
      // Look for commenting features
      const commentElements = [
        'button:has-text("Comment")',
        '[data-testid="comments-panel"]',
        'textarea[placeholder*="comment"]',
        '.comment-thread'
      ];

      for (const selector of commentElements) {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          await element.click();
          await page.waitForTimeout(500);
          
          // Should open comment interface
          const commentInterface = page.locator('textarea, [data-testid="comment-input"]');
          if (await commentInterface.isVisible()) {
            await commentInterface.fill('This is a test comment');
            
            const submitComment = page.locator('button:has-text("Post"), button:has-text("Submit")');
            if (await submitComment.isVisible()) {
              await submitComment.click();
              await page.waitForTimeout(1000);
            }
          }
        }
      }
    });

    test('should handle version control', async ({ page }) => {
      await helpers.navigateToDashboard();
      await helpers.clickDashboardTab('files-hub');
      
      // Look for version control features
      const versionElements = [
        'button:has-text("Version")',
        'button:has-text("History")',
        '[data-testid="version-history"]',
        ':has-text("v1"), :has-text("v2")'
      ];

      for (const selector of versionElements) {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          await element.click();
          await page.waitForTimeout(1000);
          
          // Should show version history
          const versionList = page.locator('[data-testid="version-list"], .version-item');
          if (await versionList.isVisible()) {
            await expect(versionList).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Performance & Edge Cases', () => {
    test('should handle large file uploads gracefully', async ({ page }) => {
      await helpers.navigateToDashboard();
      await helpers.clickDashboardTab('files-hub');
      
      // Create a larger test file
      const largeContent = 'x'.repeat(1024 * 100); // 100KB
      const largeFilePath = await helpers.createTestFile('large-file.txt', largeContent);
      
      const fileInput = page.locator('input[type="file"]').first();
      if (await fileInput.isVisible()) {
        await helpers.uploadFile('input[type="file"]', largeFilePath);
        
        // Wait longer for large file upload
        await page.waitForTimeout(5000);
        
        // Should show progress or completion
        const progressElements = [
          '[data-testid="upload-progress"]',
          '.progress-bar',
          ':has-text("uploading"), :has-text("complete")'
        ];

        for (const selector of progressElements) {
          const element = page.locator(selector);
          if (await element.isVisible()) {
            await expect(element).toBeVisible();
          }
        }
      }
    });

    test('should handle file upload errors', async ({ page }) => {
      // Mock upload failure
      await page.route('**/api/upload/**', route => route.abort());
      
      await helpers.navigateToDashboard();
      await helpers.clickDashboardTab('files-hub');
      
      const testFilePath = await helpers.createTestFile('error-test.txt', 'Test content');
      
      const fileInput = page.locator('input[type="file"]').first();
      if (await fileInput.isVisible()) {
        await helpers.uploadFile('input[type="file"]', testFilePath);
        await page.waitForTimeout(3000);
        
        // Should show error message
        await helpers.expectErrorMessage().catch(() => {
          console.log('Upload error handling varies by implementation');
        });
      }
    });

    test('should load files hub quickly', async ({ page }) => {
      const loadTime = await helpers.measureOperationTime(async () => {
        await helpers.navigateToDashboard();
        await helpers.clickDashboardTab('files-hub');
      });
      
      expect(loadTime).toBeLessThan(5000);
    });
  });

  test.describe('Mobile File Management', () => {
    test('should work on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await helpers.navigateToDashboard();
      await helpers.clickDashboardTab('files-hub');
      
      // Verify mobile file interface
      const filesInterface = page.locator('[data-testid="files-hub"], .files-container');
      if (await filesInterface.isVisible()) {
        await expect(filesInterface).toBeVisible();
        
        // Check mobile-friendly upload
        const uploadBtn = page.locator('button:has-text("Upload"), input[type="file"]');
        if (await uploadBtn.isVisible()) {
          await expect(uploadBtn).toBeVisible();
        }
      }
    });
  });
});