import { test, expect } from './setup'
import { ProjectsHubPage } from './page-objects/projects-hub-page'
import { testProjects, invalidData, projectTemplates } from './fixtures/project-fixtures'

// Increase timeout for all tests in this file
test.setTimeout(60000)

test.describe('Projects Hub', () => {
  let projectsHub: ProjectsHubPage

  test.beforeEach(async ({ authenticatedPage }) => {
    projectsHub = new ProjectsHubPage(authenticatedPage)
    await projectsHub.goto()
  })

  test('should display UI elements correctly', async () => {
    // Wait for and verify key UI elements
    await expect(projectsHub.createProjectButton).toBeVisible({ timeout: 10000 })
    await expect(projectsHub.importProjectButton).toBeVisible({ timeout: 10000 })
    await expect(projectsHub.projectTemplatesSection).toBeVisible({ timeout: 10000 })
    await expect(projectsHub.projectManagementSection).toBeVisible({ timeout: 10000 })
  })

  test('should handle project creation', async () => {
    // Open create project dialog
    await projectsHub.createProjectButton.click()
    await expect(projectsHub.createProjectDialog).toBeVisible({ timeout: 10000 })

    // Fill project details
    await projectsHub.fillProjectDetails({
      name: 'Test Project',
      description: 'A test project created by Playwright',
      type: 'Brand Identity',
      budget: '5000',
      deadline: '2024-12-31'
    })

    // Submit and verify
    await projectsHub.submitProjectForm()
    await expect(projectsHub.successMessage).toBeVisible({ timeout: 10000 })
  })

  test('should handle project import', async () => {
    // Open import dialog
    await projectsHub.importProjectButton.click()
    await expect(projectsHub.importProjectDialog).toBeVisible({ timeout: 10000 })

    // Upload project file
    await projectsHub.uploadProjectFile('test-data/project.json')
    await expect(projectsHub.importSuccessMessage).toBeVisible({ timeout: 10000 })
  })

  test('should display project templates', async () => {
    // Verify template sections
    await expect(projectsHub.brandIdentityTemplate).toBeVisible({ timeout: 10000 })
    await expect(projectsHub.websiteDesignTemplate).toBeVisible({ timeout: 10000 })
    await expect(projectsHub.mobileAppTemplate).toBeVisible({ timeout: 10000 })

    // Test template selection
    await projectsHub.brandIdentityTemplate.click()
    await expect(projectsHub.templateDetailsDialog).toBeVisible({ timeout: 10000 })
  })

  test('should manage existing projects', async () => {
    // Wait for projects to load
    await expect(projectsHub.projectsList).toBeVisible({ timeout: 10000 })

    // Verify project management features
    await expect(projectsHub.projectFilters).toBeVisible()
    await expect(projectsHub.projectSortOptions).toBeVisible()
    await expect(projectsHub.projectSearchInput).toBeVisible()

    // Test project search
    await projectsHub.searchProjects('Test Project')
    await expect(projectsHub.projectsList).toContainText('Test Project', { timeout: 10000 })
  })

  test.describe('UI Elements', () => {
    test('should display all project management buttons', async ({ page }) => {
      await page.waitForSelector('[data-testid="create-project-btn"]', { state: 'visible' })
      await expect(page.getByTestId('create-project-btn')).toBeVisible()
      await expect(page.getByTestId('import-project-btn')).toBeVisible()
      await expect(page.getByTestId('quick-start-btn')).toBeVisible()
    })

    test('should display project filters and search', async ({ page }) => {
      await page.waitForSelector('[data-testid="search-input"]', { state: 'visible' })
      await expect(page.getByRole('searchbox')).toBeVisible()
      await expect(page.getByRole('combobox', { name: 'Filter by status' })).toBeVisible()
      await expect(page.getByRole('combobox', { name: 'Filter by priority' })).toBeVisible()
    })

    test('should toggle between grid and list views', async ({ page }) => {
      await page.waitForSelector('[data-testid="view-toggle"]', { state: 'visible' })
      await projectsHub.toggleView('list')
      await expect(page.locator('.grid-cols-1')).toBeVisible()
      
      await projectsHub.toggleView('grid')
      await expect(page.locator('.md\\:grid-cols-2')).toBeVisible()
    })
  })

  test.describe('Project Creation', () => {
    test('should create a new project with all fields', async ({ page }) => {
      await page.waitForSelector('[data-testid="create-project-btn"]', { state: 'visible' })
      await projectsHub.createProject(testProjects.valid)
      await page.waitForSelector('[data-testid="project-card"]', { state: 'visible' })
      await projectsHub.expectProjectVisible(testProjects.valid.title)
      await projectsHub.expectProjectDetails(testProjects.valid)
    })

    test('should validate required fields in project creation', async ({ page }) => {
      await page.getByTestId('create-project-btn').click()
      await page.getByTestId('project-submit-button').click()
      await projectsHub.expectFormValidation()
    })

    test('should validate email format in project creation', async ({ page }) => {
      await page.getByTestId('create-project-btn').click()
      await page.getByTestId('project-client-email-input').fill(invalidData.invalidEmail.clientEmail)
      await page.getByTestId('project-submit-button').click()
      await expect(page.getByText('Invalid email format')).toBeVisible()
    })

    test('should handle project creation errors gracefully', async () => {
      const result = await projectsHub.createProjectWithErrorHandling(invalidData.missingRequired)
      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    })
  })

  test.describe('Project Import', () => {
    test('should import project from JSON file', async () => {
      await projectsHub.importProject('test-data/project.json')
      await projectsHub.expectProjectVisible('Imported Project')
      await projectsHub.expectLoadingState()
    })

    test('should validate imported project data', async ({ page }) => {
      await page.getByTestId('import-project-btn').click()
      await page.setInputFiles('[data-testid="file-input"]', 'test-data/invalid-project.json')
      await expect(page.getByText('Invalid project data format')).toBeVisible()
    })
  })

  test.describe('Quick Start Templates', () => {
    test('should create project from template', async () => {
      await projectsHub.quickStartProject('brand-identity')
      await projectsHub.expectProjectVisible('Brand Identity Project')
      await projectsHub.expectProjectDetails({
        title: 'Brand Identity Project',
        description: projectTemplates.brandIdentity.description,
        clientName: '',
        status: 'active',
        priority: 'high'
      })
    })

    test('should display template previews', async ({ page }) => {
      await page.getByTestId('quick-start-btn').click()
      await expect(page.getByTestId('template-brand-identity')).toBeVisible()
      await expect(page.getByTestId('template-web-design')).toBeVisible()
      await expect(page.getByTestId('template-marketing')).toBeVisible()
    })
  })

  test.describe('Project Management', () => {
    test('should delete project with confirmation', async () => {
      await projectsHub.createProject(testProjects.valid)
      await projectsHub.deleteProject(testProjects.valid.title, true)
      await projectsHub.expectProjectNotVisible(testProjects.valid.title)
    })

    test('should cancel project deletion', async () => {
      await projectsHub.createProject(testProjects.valid)
      await projectsHub.deleteProject(testProjects.valid.title, false)
      await projectsHub.expectProjectVisible(testProjects.valid.title)
    })

    test('should update project status', async ({ page }) => {
      await projectsHub.createProject(testProjects.valid)
      await projectsHub.openProjectMenu(testProjects.valid.title)
      await page.getByRole('menuitem', { name: 'Change Status' }).click()
      await page.getByRole('option', { name: 'Completed' }).click()
      await expect(page.locator(`[data-status="completed"]`)).toBeVisible()
    })
  })

  test.describe('Search and Filtering', () => {
    test('should filter projects by status', async () => {
      await projectsHub.createProject(testProjects.valid)
      await projectsHub.filterByStatus('active')
      await projectsHub.expectProjectVisible(testProjects.valid.title)
      
      await projectsHub.filterByStatus('completed')
      await projectsHub.expectProjectNotVisible(testProjects.valid.title)
    })

    test('should filter projects by priority', async () => {
      await projectsHub.createProject(testProjects.valid)
      await projectsHub.filterByPriority(testProjects.valid.priority)
      await projectsHub.expectProjectVisible(testProjects.valid.title)
      
      await projectsHub.filterByPriority('low')
      await projectsHub.expectProjectNotVisible(testProjects.valid.title)
    })

    test('should search projects by title', async () => {
      await projectsHub.createProject(testProjects.valid)
      await projectsHub.expectSearchResults(testProjects.valid.title, 1)
      await projectsHub.expectSearchResults('nonexistent project', 0)
    })

    test('should search projects by client name', async () => {
      await projectsHub.createProject(testProjects.valid)
      await projectsHub.expectSearchResults(testProjects.valid.clientName, 1)
    })
  })

  test.describe('Empty States and Loading', () => {
    test('should display empty state when no projects exist', async () => {
      await projectsHub.expectEmptyState()
    })

    test('should display loading state during operations', async () => {
      await projectsHub.createProject(testProjects.valid)
      await projectsHub.expectLoadingState()
    })
  })
}) 