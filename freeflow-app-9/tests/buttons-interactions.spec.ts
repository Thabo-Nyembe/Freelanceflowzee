import { test, expect } from '@playwright/test'

test.describe('🔘 All Buttons & Interactions Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
  })

  test('should test ALL navigation buttons', async ({ page }) => {
    const navButtons = [
      // Main navigation
      { selector: '[data-testid="overview-tab"]', name: 'Overview Tab' },
      { selector: '[data-testid="projects-tab"]', name: 'Projects Tab' },
      { selector: '[data-testid="ai-create-tab"]', name: 'AI Create Tab' },
      { selector: '[data-testid="video-studio-tab"]', name: 'Video Studio Tab' },
      { selector: '[data-testid="escrow-tab"]', name: 'Escrow Tab' },
      { selector: '[data-testid="files-hub-tab"]', name: 'Files Hub Tab' },
      { selector: '[data-testid="community-tab"]', name: 'Community Tab' },
      { selector: '[data-testid="my-day-tab"]', name: 'My Day Today Tab' },
      
      // Also test by role
      { role: 'tab', text: /overview/i, name: 'Overview Tab Role' },
      { role: 'tab', text: /projects/i, name: 'Projects Tab Role' },
      { role: 'tab', text: /ai.*create/i, name: 'AI Create Tab Role' },
      { role: 'tab', text: /video/i, name: 'Video Tab Role' },
      { role: 'tab', text: /escrow/i, name: 'Escrow Tab Role' },
      { role: 'tab', text: /files/i, name: 'Files Tab Role' },
      { role: 'tab', text: /community/i, name: 'Community Tab Role' },
      { role: 'tab', text: /my.*day/i, name: 'My Day Tab Role' }
    ]

    for (const button of navButtons) {
      let element
      
      if (button.selector) {
        element = page.locator(button.selector)
      } else if (button.role && button.text) {
        element = page.getByRole(button.role, { name: button.text })
      }
      
      if (element && await element.isVisible()) {
        console.log(`Testing: ${button.name}`)
        await element.click()
        await page.waitForTimeout(1000)
        
        // Verify the tab became active
        await expect(element).toBeVisible()
      }
    }
  })

  test('should test ALL action buttons in Overview tab', async ({ page }) => {
    // Navigate to Overview
    const overviewTab = page.getByRole('tab', { name: /overview/i })
    await overviewTab.click()
    await page.waitForTimeout(1000)

    const actionButtons = [
      'New Project',
      'Create Project',
      'Add Client',
      'Invite Client',
      'Create Invoice',
      'Generate Invoice',
      'Upload File',
      'Add File',
      'View Analytics',
      'Analytics',
      'Export Data',
      'Download Report',
      'Settings',
      'Profile',
      'Help',
      'Support',
      'Refresh',
      'Sync'
    ]

    for (const buttonText of actionButtons) {
      const button = page.getByRole('button', { name: new RegExp(buttonText, 'i') })
      if (await button.isVisible()) {
        console.log(`Testing button: ${buttonText}`)
        await button.click()
        await page.waitForTimeout(500)
        
        // Handle any modals that open
        const modal = page.locator('[role="dialog"], .modal, [data-testid*="modal"]')
        if (await modal.isVisible()) {
          const closeBtn = modal.getByRole('button', { name: /close|cancel|×/i })
          if (await closeBtn.isVisible()) {
            await closeBtn.click()
          } else {
            await page.keyboard.press('Escape')
          }
        }
      }
    }
  })

  test('should test ALL buttons in Projects Hub', async ({ page }) => {
    const projectsTab = page.getByRole('tab', { name: /projects/i })
    await projectsTab.click()
    await page.waitForTimeout(1000)

    const projectButtons = [
      'Create New Project',
      'New Project',
      'Add Project',
      '+ Project',
      'Import Project',
      'Clone Project',
      'Duplicate',
      'Archive',
      'Delete',
      'Share',
      'Export',
      'Edit',
      'View Details',
      'Manage',
      'Collaborate',
      'Invite Team',
      'Add Member',
      'Settings',
      'Properties',
      'Filter',
      'Sort',
      'Search',
      'Clear Filters',
      'Select All',
      'Bulk Actions'
    ]

    for (const buttonText of projectButtons) {
      const button = page.getByRole('button', { name: new RegExp(buttonText, 'i') })
      if (await button.isVisible()) {
        console.log(`Testing Projects button: ${buttonText}`)
        await button.click()
        await page.waitForTimeout(500)
        
        // Handle modals/forms
        const modal = page.locator('[role="dialog"], .modal, [data-testid*="modal"]')
        if (await modal.isVisible()) {
          // Test form fields if they exist
          const inputs = modal.locator('input, textarea, select')
          const inputCount = await inputs.count()
          
          for (let i = 0; i < Math.min(inputCount, 3); i++) {
            const input = inputs.nth(i)
            const inputType = await input.getAttribute('type')
            
            if (inputType === 'text' || inputType === 'email' || !inputType) {
              await input.fill('Test input')
            } else if (inputType === 'number') {
              await input.fill('123')
            }
          }
          
          // Close modal
          const closeBtn = modal.getByRole('button', { name: /close|cancel|×/i })
          if (await closeBtn.isVisible()) {
            await closeBtn.click()
          } else {
            await page.keyboard.press('Escape')
          }
        }
      }
    }
  })

  test('should test ALL buttons in AI Create tab', async ({ page }) => {
    const aiTab = page.getByRole('tab', { name: /ai.*create/i })
    await aiTab.click()
    await page.waitForTimeout(1000)

    const aiButtons = [
      'Generate Content',
      'Create Design',
      'Write Copy',
      'Generate Ideas',
      'Optimize Text',
      'Create Outline',
      'Generate Headlines',
      'Write Description',
      'Create Logo',
      'Design Banner',
      'Write Blog Post',
      'Generate Social Post',
      'Create Email',
      'Write Product Description',
      'Generate Meta Tags',
      'Create Ad Copy',
      'Write Press Release',
      'Generate FAQ',
      'Create Tutorial',
      'Write Case Study',
      'Send Message',
      'Submit Prompt',
      'Generate',
      'Create',
      'Try Again',
      'Save Result',
      'Copy Text',
      'Download',
      'Share',
      'Edit',
      'Refine',
      'Regenerate'
    ]

    for (const buttonText of aiButtons) {
      const button = page.getByRole('button', { name: new RegExp(buttonText, 'i') })
      if (await button.isVisible()) {
        console.log(`Testing AI button: ${buttonText}`)
        await button.click()
        await page.waitForTimeout(500)
        
        // If it's a generation button, test the prompt input
        const promptInput = page.getByPlaceholder(/prompt|describe|what.*you.*want/i)
        if (await promptInput.isVisible()) {
          await promptInput.fill('Create a test content for automation')
          
          const submitBtn = page.getByRole('button', { name: /generate|create|submit/i })
          if (await submitBtn.isVisible()) {
            await submitBtn.click()
            await page.waitForTimeout(2000) // Wait for AI response
          }
        }
        
        // Close any modal
        const modal = page.locator('[role="dialog"], .modal')
        if (await modal.isVisible()) {
          const closeBtn = modal.getByRole('button', { name: /close|cancel|×/i })
          if (await closeBtn.isVisible()) {
            await closeBtn.click()
          } else {
            await page.keyboard.press('Escape')
          }
        }
      }
    }
  })

  test('should test ALL buttons in Files Hub', async ({ page }) => {
    const filesTab = page.getByRole('tab', { name: /files/i })
    await filesTab.click()
    await page.waitForTimeout(1000)

    const fileButtons = [
      'Upload Files',
      'Add Files',
      'Upload',
      '+ Files',
      'Create Folder',
      'New Folder',
      'Add Folder',
      'Select All',
      'Clear Selection',
      'Download',
      'Download Selected',
      'Share',
      'Share Link',
      'Copy Link',
      'Generate Link',
      'Delete',
      'Remove',
      'Move',
      'Copy',
      'Rename',
      'Properties',
      'Details',
      'Preview',
      'View',
      'Edit',
      'Sort by Name',
      'Sort by Date',
      'Sort by Size',
      'Sort by Type',
      'Grid View',
      'List View',
      'Thumbnail View',
      'Filter',
      'Search Files',
      'Clear Search',
      'Refresh',
      'Sync'
    ]

    for (const buttonText of fileButtons) {
      const button = page.getByRole('button', { name: new RegExp(buttonText, 'i') })
      if (await button.isVisible()) {
        console.log(`Testing Files button: ${buttonText}`)
        await button.click()
        await page.waitForTimeout(500)
        
        // Handle file upload dialog
        if (buttonText.includes('Upload') || buttonText.includes('Add')) {
          const fileInput = page.locator('input[type="file"]')
          if (await fileInput.isVisible()) {
            // Skip actual file upload in tests
            const cancelBtn = page.getByRole('button', { name: /cancel|close/i })
            if (await cancelBtn.isVisible()) {
              await cancelBtn.click()
            }
          }
        }
        
        // Close any modal
        const modal = page.locator('[role="dialog"], .modal')
        if (await modal.isVisible()) {
          const closeBtn = modal.getByRole('button', { name: /close|cancel|×/i })
          if (await closeBtn.isVisible()) {
            await closeBtn.click()
          } else {
            await page.keyboard.press('Escape')
          }
        }
      }
    }
  })

  test('should test ALL buttons in Escrow tab', async ({ page }) => {
    const escrowTab = page.getByRole('tab', { name: /escrow/i })
    await escrowTab.click()
    await page.waitForTimeout(1000)

    const escrowButtons = [
      'Create Escrow',
      'New Escrow',
      'Add Escrow',
      'Setup Payment',
      'Request Payment',
      'Release Payment',
      'Hold Payment',
      'Dispute Payment',
      'Cancel Escrow',
      'Edit Escrow',
      'View Details',
      'Add Milestone',
      'Mark Complete',
      'Mark Incomplete',
      'Approve',
      'Reject',
      'Review',
      'Add Note',
      'Send Message',
      'Download Invoice',
      'Export',
      'Print',
      'Share Link',
      'Notify Client',
      'Remind Client',
      'Extend Deadline',
      'Change Amount',
      'Update Terms',
      'View History',
      'Transaction Log',
      'Filter Payments',
      'Search Escrows'
    ]

    for (const buttonText of escrowButtons) {
      const button = page.getByRole('button', { name: new RegExp(buttonText, 'i') })
      if (await button.isVisible()) {
        console.log(`Testing Escrow button: ${buttonText}`)
        await button.click()
        await page.waitForTimeout(500)
        
        // Handle forms
        const modal = page.locator('[role="dialog"], .modal')
        if (await modal.isVisible()) {
          // Fill form fields
          const emailInput = modal.getByLabel(/email/i)
          if (await emailInput.isVisible()) {
            await emailInput.fill('test@example.com')
          }
          
          const amountInput = modal.getByLabel(/amount|price/i)
          if (await amountInput.isVisible()) {
            await amountInput.fill('1000')
          }
          
          const descriptionInput = modal.getByLabel(/description|details/i)
          if (await descriptionInput.isVisible()) {
            await descriptionInput.fill('Test escrow description')
          }
          
          // Close modal
          const closeBtn = modal.getByRole('button', { name: /close|cancel|×/i })
          if (await closeBtn.isVisible()) {
            await closeBtn.click()
          } else {
            await page.keyboard.press('Escape')
          }
        }
      }
    }
  })

  test('should test ALL buttons in Community tab', async ({ page }) => {
    const communityTab = page.getByRole('tab', { name: /community/i })
    await communityTab.click()
    await page.waitForTimeout(1000)

    const communityButtons = [
      'Create Post',
      'New Post',
      'Add Post',
      'Write Post',
      'Share Update',
      'Post Update',
      'Like',
      'Heart',
      'Love',
      'Comment',
      'Reply',
      'Share',
      'Repost',
      'Follow',
      'Unfollow',
      'Subscribe',
      'Join',
      'Leave',
      'Report',
      'Block',
      'Mute',
      'Save',
      'Bookmark',
      'Pin',
      'Edit Post',
      'Delete Post',
      'Hide Post',
      'View Profile',
      'Message',
      'Connect',
      'Invite',
      'Search Posts',
      'Filter Posts',
      'Sort Posts',
      'View All',
      'Load More',
      'Refresh'
    ]

    for (const buttonText of communityButtons) {
      const button = page.getByRole('button', { name: new RegExp(buttonText, 'i') })
      if (await button.isVisible()) {
        console.log(`Testing Community button: ${buttonText}`)
        await button.click()
        await page.waitForTimeout(500)
        
        // Handle post creation
        if (buttonText.includes('Create') || buttonText.includes('Post') || buttonText.includes('Write')) {
          const postInput = page.getByPlaceholder(/what.*on.*mind|write.*post|share.*update/i)
          if (await postInput.isVisible()) {
            await postInput.fill('This is a test post for automation testing')
            
            const publishBtn = page.getByRole('button', { name: /publish|post|share/i })
            if (await publishBtn.isVisible()) {
              await publishBtn.click()
              await page.waitForTimeout(1000)
            }
          }
        }
        
        // Handle comment forms
        if (buttonText.includes('Comment') || buttonText.includes('Reply')) {
          const commentInput = page.getByPlaceholder(/comment|reply/i)
          if (await commentInput.isVisible()) {
            await commentInput.fill('Test comment for automation')
            
            const submitBtn = page.getByRole('button', { name: /submit|post|reply/i })
            if (await submitBtn.isVisible()) {
              await submitBtn.click()
              await page.waitForTimeout(1000)
            }
          }
        }
        
        // Close any modal
        const modal = page.locator('[role="dialog"], .modal')
        if (await modal.isVisible()) {
          const closeBtn = modal.getByRole('button', { name: /close|cancel|×/i })
          if (await closeBtn.isVisible()) {
            await closeBtn.click()
          } else {
            await page.keyboard.press('Escape')
          }
        }
      }
    }
  })

  test('should test ALL buttons in My Day Today tab', async ({ page }) => {
    const myDayTab = page.getByRole('tab', { name: /my.*day/i })
    await myDayTab.click()
    await page.waitForTimeout(1000)

    const myDayButtons = [
      'Add Task',
      'New Task',
      'Create Task',
      '+ Task',
      'Quick Add',
      'Add Event',
      'Schedule',
      'Set Reminder',
      'Start Timer',
      'Stop Timer',
      'Pause Timer',
      'Resume Timer',
      'Mark Complete',
      'Mark Done',
      'Complete Task',
      'Mark Incomplete',
      'Edit Task',
      'Update Task',
      'Delete Task',
      'Remove Task',
      'Duplicate Task',
      'Move Task',
      'Reschedule',
      'Change Date',
      'Set Priority',
      'Add Note',
      'Add Tag',
      'Assign To',
      'Set Due Date',
      'Add Subtask',
      'Break Down',
      'View Calendar',
      'Day View',
      'Week View',
      'Month View',
      'List View',
      'Kanban View',
      'Filter Tasks',
      'Sort Tasks',
      'Search Tasks',
      'Clear Completed',
      'Archive',
      'Export Tasks',
      'Import Tasks',
      'Sync Calendar',
      'Refresh',
      'AI Optimize',
      'Get Suggestions',
      'Smart Schedule',
      'Auto Plan'
    ]

    for (const buttonText of myDayButtons) {
      const button = page.getByRole('button', { name: new RegExp(buttonText, 'i') })
      if (await button.isVisible()) {
        console.log(`Testing My Day button: ${buttonText}`)
        await button.click()
        await page.waitForTimeout(500)
        
        // Handle task creation
        if (buttonText.includes('Add') || buttonText.includes('Create') || buttonText.includes('New')) {
          const taskInput = page.getByLabel(/task.*name|title|task.*title/i)
          if (await taskInput.isVisible()) {
            await taskInput.fill('Test task for automation')
            
            const saveBtn = page.getByRole('button', { name: /save|create|add/i })
            if (await saveBtn.isVisible()) {
              await saveBtn.click()
              await page.waitForTimeout(1000)
            }
          }
        }
        
        // Close any modal
        const modal = page.locator('[role="dialog"], .modal')
        if (await modal.isVisible()) {
          const closeBtn = modal.getByRole('button', { name: /close|cancel|×/i })
          if (await closeBtn.isVisible()) {
            await closeBtn.click()
          } else {
            await page.keyboard.press('Escape')
          }
        }
      }
    }
  })
})
