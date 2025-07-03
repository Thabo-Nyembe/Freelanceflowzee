import { test, expect } from '@playwright/test';
import { test as baseTest } from './test-config';

test.describe('FreeflowZee Files Hub', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    await page.getByRole('tab', { name: 'Files Hub' }).click();
  });

  test.describe('File Upload', () => {
    test('should upload single file', async ({ page }) => {
      // Click upload button
      await page.getByRole('button', { name: 'Upload File' }).click();
      
      // Upload file
      await page.setInputFiles('input[type="file"]', 'test-data/document.pdf');
      
      // Verify upload progress
      await expect(page.getByTestId('upload-progress')).toBeVisible();
      await expect(page.getByTestId('upload-progress')).toContainText('100%');
      
      // Verify file listed
      await expect(page.getByText('document.pdf')).toBeVisible();
      await expect(page.getByTestId('file-size')).toBeVisible();
    });

    test('should upload multiple files', async ({ page }) => {
      await page.getByRole('button', { name: 'Upload File' }).click();
      
      // Upload multiple files
      await page.setInputFiles('input[type="file"]', [
        'test-data/document1.pdf',
        'test-data/document2.jpg',
        'test-data/document3.png'
      ]);
      
      // Verify all files uploaded
      await expect(page.getByText('document1.pdf')).toBeVisible();
      await expect(page.getByText('document2.jpg')).toBeVisible();
      await expect(page.getByText('document3.png')).toBeVisible();
    });

    test('should handle invalid file types', async ({ page }) => {
      await page.getByRole('button', { name: 'Upload File' }).click();
      
      // Try uploading invalid file
      await page.setInputFiles('input[type="file"]', 'test-data/invalid.exe');
      
      // Verify error message
      await expect(page.getByText('Invalid file type')).toBeVisible();
      await expect(page.getByText('Supported formats: PDF, JPG, PNG, DOC')).toBeVisible();
    });
  });

  test.describe('File Organization', () => {
    test('should create folder', async ({ page }) => {
      // Create new folder
      await page.getByRole('button', { name: 'New Folder' }).click();
      await page.getByLabel('Folder Name').fill('Project Documents');
      await page.getByRole('button', { name: 'Create' }).click();
      
      // Verify folder created
      await expect(page.getByText('Project Documents')).toBeVisible();
      await expect(page.getByTestId('folder-icon')).toBeVisible();
    });

    test('should move files to folder', async ({ page }) => {
      // Select file and move
      await page.getByText('document.pdf').click();
      await page.getByRole('button', { name: 'Move' }).click();
      await page.getByText('Project Documents').click();
      await page.getByRole('button', { name: 'Move Here' }).click();
      
      // Verify file moved
      await page.getByText('Project Documents').dblclick();
      await expect(page.getByText('document.pdf')).toBeVisible();
    });

    test('should rename files and folders', async ({ page }) => {
      // Rename folder
      await page.getByText('Project Documents').click();
      await page.getByRole('button', { name: 'Rename' }).click();
      await page.getByLabel('New Name').fill('Client Files');
      await page.getByRole('button', { name: 'Save' }).click();
      
      // Verify rename
      await expect(page.getByText('Client Files')).toBeVisible();
    });
  });

  test.describe('File Actions', () => {
    test('should preview files', async ({ page }) => {
      // Click file to preview
      await page.getByText('document.pdf').click();
      await page.getByRole('button', { name: 'Preview' }).click();
      
      // Verify preview
      await expect(page.getByTestId('file-preview')).toBeVisible();
      await expect(page.getByTestId('preview-toolbar')).toBeVisible();
    });

    test('should download files', async ({ page }) => {
      // Download file
      await page.getByText('document.pdf').click();
      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Download' }).click();
      const download = await downloadPromise;
      
      // Verify download
      expect(download.suggestedFilename()).toBe('document.pdf');
    });

    test('should delete files', async ({ page }) => {
      // Delete file
      await page.getByText('document.pdf').click();
      await page.getByRole('button', { name: 'Delete' }).click();
      await page.getByRole('button', { name: 'Confirm' }).click();
      
      // Verify deletion
      await expect(page.getByText('document.pdf')).not.toBeVisible();
      await expect(page.getByText('File deleted')).toBeVisible();
    });
  });

  test.describe('File Sharing', () => {
    test('should share file with user', async ({ page }) => {
      // Share file
      await page.getByText('document.pdf').click();
      await page.getByRole('button', { name: 'Share' }).click();
      await page.getByLabel('Email').fill('user@example.com');
      await page.getByLabel('Permission').selectOption('view');
      await page.getByRole('button', { name: 'Share' }).click();
      
      // Verify share
      await expect(page.getByText('File shared successfully')).toBeVisible();
    });

    test('should generate share link', async ({ page }) => {
      await page.getByText('document.pdf').click();
      await page.getByRole('button', { name: 'Share' }).click();
      
      // Generate link
      await page.getByRole('tab', { name: 'Share Link' }).click();
      await page.getByRole('button', { name: 'Generate Link' }).click();
      
      // Verify link
      await expect(page.getByTestId('share-link')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Copy' })).toBeEnabled();
    });

    test('should manage share permissions', async ({ page }) => {
      await page.getByText('document.pdf').click();
      await page.getByRole('button', { name: 'Share' }).click();
      
      // Update permissions
      await page.getByRole('tab', { name: 'Shared With' }).click();
      const shareItem = page.getByTestId('share-item').first();
      await shareItem.getByRole('button', { name: 'Edit' }).click();
      await page.getByLabel('Permission').selectOption('edit');
      await page.getByRole('button', { name: 'Save' }).click();
      
      // Verify update
      await expect(page.getByText('Permissions updated')).toBeVisible();
    });
  });

  test.describe('Search and Filter', () => {
    test('should search files', async ({ page }) => {
      // Search for file
      await page.getByPlaceholder('Search files...').fill('document');
      
      // Verify search results
      const results = await page.getByTestId('file-item').all();
      for (const result of results) {
        await expect(result).toContainText('document');
      }
    });

    test('should filter by file type', async ({ page }) => {
      // Apply filter
      await page.getByRole('button', { name: 'Filter' }).click();
      await page.getByLabel('File Type').selectOption('pdf');
      await page.getByRole('button', { name: 'Apply' }).click();
      
      // Verify filtered results
      const files = await page.getByTestId('file-item').all();
      for (const file of files) {
        await expect(file.getByTestId('file-type')).toContainText('PDF');
      }
    });

    test('should sort files', async ({ page }) => {
      // Sort by name
      await page.getByRole('button', { name: 'Sort' }).click();
      await page.getByRole('option', { name: 'Name' }).click();
      
      // Verify sort order
      const fileNames = await page.getByTestId('file-name').allTextContents();
      const sortedNames = [...fileNames].sort();
      expect(fileNames).toEqual(sortedNames);
    });
  });

  test.describe('Storage Management', () => {
    test('should display storage usage', async ({ page }) => {
      // View storage info
      await page.getByRole('button', { name: 'Storage Info' }).click();
      
      // Verify storage details
      await expect(page.getByTestId('storage-used')).toBeVisible();
      await expect(page.getByTestId('storage-total')).toBeVisible();
      await expect(page.getByTestId('storage-chart')).toBeVisible();
    });

    test('should warn on storage limit', async ({ page }) => {
      // Mock storage near limit
      await page.route('**/api/storage/quota', route =>
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            used: 9500,
            total: 10000,
            unit: 'MB'
          })
        })
      );
      
      await page.reload();
      
      // Verify warning
      await expect(page.getByText('Storage almost full')).toBeVisible();
      await expect(page.getByText('95% used')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle upload errors', async ({ page }) => {
      // Simulate upload error
      await page.route('**/api/files/upload', route => route.abort());
      
      await page.getByRole('button', { name: 'Upload File' }).click();
      await page.setInputFiles('input[type="file"]', 'test-data/document.pdf');
      
      // Verify error message
      await expect(page.getByText('Upload failed')).toBeVisible();
      await expect(page.getByText('Please try again')).toBeVisible();
    });

    test('should handle network errors', async ({ page }) => {
      // Simulate network error
      await page.route('**/api/files/**', route => route.abort());
      
      // Try loading files
      await page.reload();
      
      // Verify error message
      await expect(page.getByText('Could not load files')).toBeVisible();
      await expect(page.getByText('Check your connection')).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should handle large file lists', async ({ page }) => {
      // Mock large file list
      await page.route('**/api/files', route =>
        route.fulfill({
          status: 200,
          body: JSON.stringify(Array(1000).fill().map((_, i) => ({
            id: i,
            name: `file${i}.pdf`,
            size: 1024,
            type: 'pdf',
            modified: new Date().toISOString()
          })))
        })
      );
      
      await page.reload();
      
      // Verify smooth scrolling
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await expect(page.getByTestId('file-item')).toHaveCount(50); // Virtual list
    });

    test('should optimize thumbnail loading', async ({ page }) => {
      // Check lazy loading
      const thumbnails = await page.getByTestId('file-thumbnail').all();
      for (const thumbnail of thumbnails) {
        await expect(thumbnail).toHaveAttribute('loading', 'lazy');
      }
    });
  });
});