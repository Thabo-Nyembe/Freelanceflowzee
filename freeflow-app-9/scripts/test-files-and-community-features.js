import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

test.describe('Files and Community Features', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in user
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email: process.env.TEST_USER_EMAIL,
      password: process.env.TEST_USER_PASSWORD,
    })

    if (error) throw error

    // Navigate to home page
    await page.goto('/')'
  })

  test('Files Hub - Create folder and upload file', async ({ page }) => {
    // Navigate to Files Hub
    await page.click('text=Files Hub')

    // Create new folder
    await page.click('[data-testid= "new-folder-btn"]')
    await page.fill('input[placeholder= "Folder name"]', 'Test Folder')
    await page.click('text=Create Folder')

    // Verify folder was created
    await expect(page.locator('text=Test Folder')).toBeVisible()

    // Upload file
    await page.click('[data-testid= "upload-file-btn"]')
    await page.setInputFiles('input[type= "file"]', path.join(__dirname, '../public/images/hero-banner.jpg'))
    await page.click('text=Upload')

    // Verify file was uploaded
    await expect(page.locator('text=hero-banner.jpg')).toBeVisible()

    // Test file actions
    await page.hover('text=hero-banner.jpg')
    await expect(page.locator('button[aria-label= "Download"]')).toBeVisible()
    await expect(page.locator('button[aria-label= "Share"]')).toBeVisible()
    await expect(page.locator('button[aria-label= "Delete"]')).toBeVisible()
  })

  test('Community Hub - Create and interact with posts', async ({ page }) => {
    // Navigate to Community Hub
    await page.click('text=Community Hub')

    // Create new post
    await page.click('[data-testid= "create-post-btn"]')
    await page.fill('input[placeholder= "Give your post a title"]', 'Test Post')
    await page.fill('textarea[placeholder= "What\'s on your mind?"]', 'This is a test post content')'
    await page.click('text=Select category')
    await page.click('text=General Discussion')

    // Add media to post
    await page.setInputFiles('input[type= "file"]', [
      path.join(__dirname, '../public/images/hero-banner.jpg')
    ])

    await page.click('text=Create Post')

    // Verify post was created
    await expect(page.locator('text=Test Post')).toBeVisible()
    await expect(page.locator('text=This is a test post content')).toBeVisible()

    // Test post interactions
    await page.click('button:has-text("0") >> nth=0') // Like button"
    await expect(page.locator('button:has-text("1") >> nth=0')).toBeVisible()"

    // Test search functionality
    await page.fill('input[placeholder= "Search posts..."]', 'Test Post')
    await expect(page.locator('text=Test Post')).toBeVisible()

    // Test different tabs
    await page.click('text=Trending')
    await expect(page.locator('text=Popular discussions')).toBeVisible()

    await page.click('text=Following')
    await expect(page.locator('text=Posts from creators you follow')).toBeVisible()

    await page.click('text=Bookmarks')
    await expect(page.locator('text=Posts you\'ve saved for later')).toBeVisible()'
  })

  test('Files Hub - File sharing and permissions', async ({ page }) => {
    // Navigate to Files Hub
    await page.click('text=Files Hub')

    // Upload a file to share
    await page.click('[data-testid= "upload-file-btn"]')
    await page.setInputFiles('input[type= "file"]', path.join(__dirname, '../public/images/hero-banner.jpg'))
    await page.click('text=Upload')

    // Share the file
    await page.hover('text=hero-banner.jpg')
    await page.click('button[aria-label= "Share"]')

    // Fill in sharing details
    await page.fill('input[placeholder= "Enter email address"]', 'test.user@example.com')
    await page.click('text=Share')

    // Verify file is marked as shared
    await page.click('text=Shared')
    await expect(page.locator('text=hero-banner.jpg')).toBeVisible()
  })

  test('Community Hub - Rich media posts', async ({ page }) => {
    // Navigate to Community Hub
    await page.click('text=Community Hub')

    // Create post with multiple media types
    await page.click('[data-testid= "create-post-btn"]')
    await page.fill('input[placeholder= "Give your post a title"]', 'Media Test Post')
    await page.fill('textarea[placeholder= "What\'s on your mind?"]', 'Testing multiple media uploads')'

    // Add image
    await page.click('text=Add Image')
    await page.setInputFiles('input[accept= "image/*"]', path.join(__dirname, '../public/images/hero-banner.jpg'))

    // Add video
    await page.click('text=Add Video')
    await page.setInputFiles('input[accept= "video/*"]', path.join(__dirname, '../public/videos/brand-animation.mp4'))

    await page.click('text=Create Post')

    // Verify media was uploaded
    await expect(page.locator('img[alt= "Post media 1"]')).toBeVisible()
    await expect(page.locator('video')).toBeVisible()
  })
}) 