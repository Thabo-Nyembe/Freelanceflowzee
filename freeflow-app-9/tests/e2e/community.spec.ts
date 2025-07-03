import { test, expect } from '@playwright/test';
import { test as baseTest } from './test-config';

test.describe('FreeflowZee Community', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    await page.getByRole('tab', { name: 'Community' }).click();
  });

  test.describe('Social Wall', () => {
    test('should create post', async ({ page }) => {
      // Create post
      await page.getByRole('button', { name: 'Create Post' }).click();
      await page.getByLabel('Content').fill('Testing the social wall feature #test');
      await page.setInputFiles('input[type="file"]', 'test-data/image.jpg');
      await page.getByRole('button', { name: 'Post' }).click();
      
      // Verify post
      await expect(page.getByText('Testing the social wall feature')).toBeVisible();
      await expect(page.getByTestId('post-image')).toBeVisible();
      await expect(page.getByText('#test')).toHaveClass(/hashtag/);
    });

    test('should interact with posts', async ({ page }) => {
      const post = page.getByTestId('post-item').first();
      
      // Like post
      await post.getByRole('button', { name: 'Like' }).click();
      await expect(post.getByTestId('like-count')).toContainText('1');
      
      // Comment on post
      await post.getByRole('button', { name: 'Comment' }).click();
      await page.getByLabel('Comment').fill('Great post!');
      await page.getByRole('button', { name: 'Submit' }).click();
      await expect(post.getByText('Great post!')).toBeVisible();
      
      // Share post
      await post.getByRole('button', { name: 'Share' }).click();
      await expect(page.getByText('Post shared successfully')).toBeVisible();
    });

    test('should filter feed', async ({ page }) => {
      // Apply filters
      await page.getByRole('button', { name: 'Filter' }).click();
      await page.getByLabel('Content Type').selectOption('images');
      await page.getByRole('button', { name: 'Apply' }).click();
      
      // Verify filtered posts
      const posts = await page.getByTestId('post-item').all();
      for (const post of posts) {
        await expect(post.getByTestId('post-image')).toBeVisible();
      }
    });
  });

  test.describe('Creator Marketplace', () => {
    test('should list services', async ({ page }) => {
      // Navigate to marketplace
      await page.getByRole('tab', { name: 'Marketplace' }).click();
      
      // Verify service listings
      const services = await page.getByTestId('service-card').all();
      expect(services.length).toBeGreaterThan(0);
      
      // Check service details
      const firstService = services[0];
      await expect(firstService.getByTestId('service-title')).toBeVisible();
      await expect(firstService.getByTestId('service-price')).toBeVisible();
      await expect(firstService.getByTestId('service-rating')).toBeVisible();
    });

    test('should search services', async ({ page }) => {
      await page.getByRole('tab', { name: 'Marketplace' }).click();
      
      // Search for service
      await page.getByPlaceholder('Search services...').fill('logo design');
      await page.keyboard.press('Enter');
      
      // Verify search results
      const results = await page.getByTestId('service-card').all();
      for (const result of results) {
        await expect(result).toContainText(/logo|design/i);
      }
    });

    test('should filter services', async ({ page }) => {
      await page.getByRole('tab', { name: 'Marketplace' }).click();
      
      // Apply filters
      await page.getByRole('button', { name: 'Filter' }).click();
      await page.getByLabel('Category').selectOption('design');
      await page.getByLabel('Price Range').selectOption('100-500');
      await page.getByLabel('Rating').selectOption('4+');
      await page.getByRole('button', { name: 'Apply' }).click();
      
      // Verify filtered results
      const services = await page.getByTestId('service-card').all();
      for (const service of services) {
        await expect(service.getByTestId('service-category')).toContainText('Design');
        await expect(service.getByTestId('service-price')).toMatch(/^\$[1-4]\d{2}$/);
        await expect(service.getByTestId('service-rating')).toMatch(/^[4-5]\.\d$/);
      }
    });
  });

  test.describe('Service Management', () => {
    test('should create service listing', async ({ page }) => {
      await page.getByRole('tab', { name: 'Marketplace' }).click();
      
      // Create service
      await page.getByRole('button', { name: 'Create Service' }).click();
      await page.getByLabel('Title').fill('Professional Logo Design');
      await page.getByLabel('Description').fill('Custom logo design with unlimited revisions');
      await page.getByLabel('Category').selectOption('design');
      await page.getByLabel('Price').fill('299');
      await page.setInputFiles('input[type="file"]', ['test-data/portfolio1.jpg', 'test-data/portfolio2.jpg']);
      await page.getByRole('button', { name: 'Create' }).click();
      
      // Verify service created
      await expect(page.getByText('Service created successfully')).toBeVisible();
      await expect(page.getByText('Professional Logo Design')).toBeVisible();
    });

    test('should manage service orders', async ({ page }) => {
      await page.getByRole('tab', { name: 'Marketplace' }).click();
      
      // View orders
      await page.getByRole('button', { name: 'My Orders' }).click();
      
      // Check order management
      await expect(page.getByTestId('active-orders')).toBeVisible();
      await expect(page.getByTestId('completed-orders')).toBeVisible();
      await expect(page.getByTestId('order-history')).toBeVisible();
    });

    test('should handle service reviews', async ({ page }) => {
      await page.getByRole('tab', { name: 'Marketplace' }).click();
      
      // Submit review
      const service = page.getByTestId('service-card').first();
      await service.getByRole('button', { name: 'Review' }).click();
      await page.getByLabel('Rating').fill('5');
      await page.getByLabel('Review').fill('Excellent service and communication');
      await page.getByRole('button', { name: 'Submit Review' }).click();
      
      // Verify review posted
      await expect(page.getByText('Review submitted')).toBeVisible();
      await expect(service.getByTestId('service-rating')).toContainText('5.0');
    });
  });

  test.describe('Messaging', () => {
    test('should send direct message', async ({ page }) => {
      // Open messages
      await page.getByRole('button', { name: 'Messages' }).click();
      await page.getByRole('button', { name: 'New Message' }).click();
      
      // Send message
      await page.getByLabel('Recipient').fill('creator@example.com');
      await page.getByLabel('Message').fill('Interested in your services');
      await page.getByRole('button', { name: 'Send' }).click();
      
      // Verify message sent
      await expect(page.getByText('Message sent')).toBeVisible();
      await expect(page.getByTestId('message-status')).toContainText('Delivered');
    });

    test('should handle attachments', async ({ page }) => {
      await page.getByRole('button', { name: 'Messages' }).click();
      
      // Send message with attachment
      await page.getByTestId('conversation-item').first().click();
      await page.getByRole('button', { name: 'Attach' }).click();
      await page.setInputFiles('input[type="file"]', 'test-data/document.pdf');
      await page.getByRole('button', { name: 'Send' }).click();
      
      // Verify attachment
      await expect(page.getByTestId('attachment-preview')).toBeVisible();
      await expect(page.getByText('document.pdf')).toBeVisible();
    });
  });

  test.describe('Profile Management', () => {
    test('should edit profile', async ({ page }) => {
      // Edit profile
      await page.getByRole('button', { name: 'Profile' }).click();
      await page.getByRole('button', { name: 'Edit' }).click();
      await page.getByLabel('Bio').fill('Professional designer with 5+ years experience');
      await page.setInputFiles('input[type="file"]', 'test-data/avatar.jpg');
      await page.getByRole('button', { name: 'Save' }).click();
      
      // Verify changes
      await expect(page.getByText('Profile updated')).toBeVisible();
      await expect(page.getByTestId('profile-bio')).toContainText('Professional designer');
      await expect(page.getByTestId('profile-avatar')).toBeVisible();
    });

    test('should manage portfolio', async ({ page }) => {
      await page.getByRole('button', { name: 'Profile' }).click();
      
      // Add portfolio item
      await page.getByRole('button', { name: 'Add Portfolio' }).click();
      await page.getByLabel('Title').fill('Brand Identity Project');
      await page.getByLabel('Description').fill('Complete brand identity design');
      await page.setInputFiles('input[type="file"]', ['test-data/work1.jpg', 'test-data/work2.jpg']);
      await page.getByRole('button', { name: 'Add' }).click();
      
      // Verify portfolio
      await expect(page.getByText('Portfolio updated')).toBeVisible();
      await expect(page.getByText('Brand Identity Project')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle upload errors', async ({ page }) => {
      // Simulate upload error
      await page.route('**/api/upload', route => route.abort());
      
      await page.getByRole('button', { name: 'Create Post' }).click();
      await page.setInputFiles('input[type="file"]', 'test-data/large-image.jpg');
      
      // Verify error message
      await expect(page.getByText('Upload failed')).toBeVisible();
      await expect(page.getByText('Please try again')).toBeVisible();
    });

    test('should handle messaging errors', async ({ page }) => {
      // Simulate message error
      await page.route('**/api/messages', route => route.abort());
      
      await page.getByRole('button', { name: 'Messages' }).click();
      await page.getByRole('button', { name: 'New Message' }).click();
      await page.getByLabel('Message').fill('Test message');
      await page.getByRole('button', { name: 'Send' }).click();
      
      // Verify error handling
      await expect(page.getByText('Failed to send message')).toBeVisible();
      await expect(page.getByText('Message saved as draft')).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should handle infinite scroll', async ({ page }) => {
      // Scroll through feed
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      
      // Verify more posts loaded
      await expect(page.getByTestId('post-item')).toHaveCount(20);
      
      // Scroll again
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await expect(page.getByTestId('post-item')).toHaveCount(40);
    });

    test('should optimize image loading', async ({ page }) => {
      // Check lazy loading
      const images = await page.getByTestId('post-image').all();
      for (const image of images) {
        await expect(image).toHaveAttribute('loading', 'lazy');
      }
    });
  });
});