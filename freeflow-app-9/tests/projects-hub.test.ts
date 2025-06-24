import { test, expect } from '@playwright/test'

test.describe('Projects Hub', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to projects hub
    await page.goto('/dashboard/projects-hub')
  })

  test('should display all project management buttons', async ({ page }) => {
    // Check header buttons
    await expect(page.getByTestId('create-project-btn')).toBeVisible()
    await expect(page.getByTestId('import-project-btn')).toBeVisible()
    await expect(page.getByTestId('quick-start-btn')).toBeVisible()
  })

  test('should open and close create project dialog', async ({ page }) => {
    // Open create dialog
    await page.getByTestId('create-project-btn').click()
    await expect(page.getByRole('dialog')).toBeVisible()
    
    // Fill form
    await page.getByTestId('project-name-input').fill('Test Project')
    await page.getByTestId('project-type-freelance').click()
    await page.getByTestId('project-description-input').fill('Test project description')
    
    // Submit form
    await page.getByTestId('create-project-btn').click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
    
    // Verify project was created
    await expect(page.getByText('Test Project')).toBeVisible()
  })

  test('should open and close import project dialog', async ({ page }) => {
    // Open import dialog
    await page.getByTestId('import-project-btn').click()
    await expect(page.getByRole('dialog')).toBeVisible()
    
    // Select import source
    await page.getByTestId('source-json').click()
    
    // Upload file
    await page.getByTestId('file-input').setInputFiles('test-data/project.json')
    
    // Start import
    await page.getByTestId('start-import-btn').click()
    
    // Wait for import to complete
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('should open and close quick start dialog', async ({ page }) => {
    // Open quick start dialog
    await page.getByTestId('quick-start-btn').click()
    await expect(page.getByRole('dialog')).toBeVisible()
    
    // Select template
    await page.getByTestId('template-brand-identity').click()
    
    // Start project from template
    await page.getByTestId('select-template-btn').click()
    
    // Verify dialog closed
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('should filter projects', async ({ page }) => {
    // Search
    await page.getByTestId('search-input').fill('Test')
    await expect(page.getByText('No projects found')).not.toBeVisible()
    
    // Filter by status
    await page.getByRole('combobox', { name: 'Filter by status' }).click()
    await page.getByRole('option', { name: 'Active' }).click()
    
    // Filter by priority
    await page.getByRole('combobox', { name: 'Filter by priority' }).click()
    await page.getByRole('option', { name: 'High' }).click()
  })

  test('should toggle view mode', async ({ page }) => {
    // Switch to list view
    await page.getByRole('button', { name: 'List view' }).click()
    await expect(page.locator('.grid-cols-1')).toBeVisible()
    
    // Switch back to grid view
    await page.getByRole('button', { name: 'Grid view' }).click()
    await expect(page.locator('.md\\:grid-cols-2')).toBeVisible()
  })

  test('should handle project actions', async ({ page }) => {
    // Open project menu
    await page.getByRole('button', { name: 'Project actions' }).first().click()
    
    // View details
    await page.getByRole('menuitem', { name: 'View Details' }).click()
    await expect(page.url()).toContain('/projects/')
    await page.goBack()
    
    // Edit project
    await page.getByRole('button', { name: 'Project actions' }).first().click()
    await page.getByRole('menuitem', { name: 'Edit Project' }).click()
    await expect(page.url()).toContain('/edit')
    await page.goBack()
    
    // Delete project
    await page.getByRole('button', { name: 'Project actions' }).first().click()
    await page.getByRole('menuitem', { name: 'Delete Project' }).click()
    await expect(page.getByRole('dialog', { name: 'Delete Project' })).toBeVisible()
    await page.getByRole('button', { name: 'Cancel' }).click()
  })

  test('should handle project navigation buttons', async ({ page }) => {
    // Track button
    await page.getByRole('button', { name: 'Track' }).first().click()
    await expect(page.url()).toContain('/track')
    await page.goBack()
    
    // Collaborate button
    await page.getByRole('button', { name: 'Collaborate' }).first().click()
    await expect(page.url()).toContain('/collaborate')
    await page.goBack()
    
    // Gallery button
    await page.getByRole('button', { name: 'Gallery' }).first().click()
    await expect(page.url()).toContain('/gallery')
    await page.goBack()
  })
}) 