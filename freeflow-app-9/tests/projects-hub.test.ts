import { test, expect } from &apos;./setup&apos;
import { ProjectsHubPage } from &apos;./page-objects/projects-hub-page&apos;
import { testProjects, invalidData, projectTemplates } from &apos;./fixtures/project-fixtures&apos;

// Increase timeout for all tests in this file
test.setTimeout(60000)

test.describe(&apos;Projects Hub&apos;, () => {
  let projectsHub: ProjectsHubPage

  test.beforeEach(async ({ authenticatedPage }) => {
    projectsHub = new ProjectsHubPage(authenticatedPage)
    await projectsHub.goto()
  })

  test(&apos;should display UI elements correctly&apos;, async () => {
    // Wait for and verify key UI elements
    await expect(projectsHub.createProjectButton).toBeVisible({ timeout: 10000 })
    await expect(projectsHub.importProjectButton).toBeVisible({ timeout: 10000 })
    await expect(projectsHub.projectTemplatesSection).toBeVisible({ timeout: 10000 })
    await expect(projectsHub.projectManagementSection).toBeVisible({ timeout: 10000 })
  })

  test(&apos;should handle project creation&apos;, async () => {
    // Open create project dialog
    await projectsHub.createProjectButton.click()
    await expect(projectsHub.createProjectDialog).toBeVisible({ timeout: 10000 })

    // Fill project details
    await projectsHub.fillProjectDetails({
      name: &apos;Test Project&apos;,
      description: &apos;A test project created by Playwright&apos;,
      type: &apos;Brand Identity&apos;,
      budget: &apos;5000&apos;,
      deadline: &apos;2024-12-31&apos;
    })

    // Submit and verify
    await projectsHub.submitProjectForm()
    await expect(projectsHub.successMessage).toBeVisible({ timeout: 10000 })
  })

  test(&apos;should handle project import&apos;, async () => {
    // Open import dialog
    await projectsHub.importProjectButton.click()
    await expect(projectsHub.importProjectDialog).toBeVisible({ timeout: 10000 })

    // Upload project file
    await projectsHub.uploadProjectFile(&apos;test-data/project.json&apos;)
    await expect(projectsHub.importSuccessMessage).toBeVisible({ timeout: 10000 })
  })

  test(&apos;should display project templates&apos;, async () => {
    // Verify template sections
    await expect(projectsHub.brandIdentityTemplate).toBeVisible({ timeout: 10000 })
    await expect(projectsHub.websiteDesignTemplate).toBeVisible({ timeout: 10000 })
    await expect(projectsHub.mobileAppTemplate).toBeVisible({ timeout: 10000 })

    // Test template selection
    await projectsHub.brandIdentityTemplate.click()
    await expect(projectsHub.templateDetailsDialog).toBeVisible({ timeout: 10000 })
  })

  test(&apos;should manage existing projects&apos;, async () => {
    // Wait for projects to load
    await expect(projectsHub.projectsList).toBeVisible({ timeout: 10000 })

    // Verify project management features
    await expect(projectsHub.projectFilters).toBeVisible()
    await expect(projectsHub.projectSortOptions).toBeVisible()
    await expect(projectsHub.projectSearchInput).toBeVisible()

    // Test project search
    await projectsHub.searchProjects(&apos;Test Project&apos;)
    await expect(projectsHub.projectsList).toContainText(&apos;Test Project&apos;, { timeout: 10000 })
  })

  test.describe(&apos;UI Elements&apos;, () => {
    test(&apos;should display all project management buttons&apos;, async ({ page }) => {
      await page.waitForSelector(&apos;[data-testid=&quot;create-project-btn&quot;]&apos;, { state: &apos;visible&apos; })
      await expect(page.getByTestId(&apos;create-project-btn&apos;)).toBeVisible()
      await expect(page.getByTestId(&apos;import-project-btn&apos;)).toBeVisible()
      await expect(page.getByTestId(&apos;quick-start-btn&apos;)).toBeVisible()
    })

    test(&apos;should display project filters and search&apos;, async ({ page }) => {
      await page.waitForSelector(&apos;[data-testid=&quot;search-input&quot;]&apos;, { state: &apos;visible&apos; })
      await expect(page.getByRole(&apos;searchbox&apos;)).toBeVisible()
      await expect(page.getByRole(&apos;combobox&apos;, { name: &apos;Filter by status&apos; })).toBeVisible()
      await expect(page.getByRole(&apos;combobox&apos;, { name: &apos;Filter by priority&apos; })).toBeVisible()
    })

    test(&apos;should toggle between grid and list views&apos;, async ({ page }) => {
      await page.waitForSelector(&apos;[data-testid=&quot;view-toggle&quot;]&apos;, { state: &apos;visible&apos; })
      await projectsHub.toggleView(&apos;list&apos;)
      await expect(page.locator(&apos;.grid-cols-1&apos;)).toBeVisible()
      
      await projectsHub.toggleView(&apos;grid&apos;)
      await expect(page.locator(&apos;.md\\:grid-cols-2&apos;)).toBeVisible()
    })
  })

  test.describe(&apos;Project Creation&apos;, () => {
    test(&apos;should create a new project with all fields&apos;, async ({ page }) => {
      await page.waitForSelector(&apos;[data-testid=&quot;create-project-btn&quot;]&apos;, { state: &apos;visible&apos; })
      await projectsHub.createProject(testProjects.valid)
      await page.waitForSelector(&apos;[data-testid=&quot;project-card&quot;]&apos;, { state: &apos;visible&apos; })
      await projectsHub.expectProjectVisible(testProjects.valid.title)
      await projectsHub.expectProjectDetails(testProjects.valid)
    })

    test(&apos;should validate required fields in project creation&apos;, async ({ page }) => {
      await page.getByTestId(&apos;create-project-btn&apos;).click()
      await page.getByTestId(&apos;project-submit-button&apos;).click()
      await projectsHub.expectFormValidation()
    })

    test(&apos;should validate email format in project creation&apos;, async ({ page }) => {
      await page.getByTestId(&apos;create-project-btn&apos;).click()
      await page.getByTestId(&apos;project-client-email-input&apos;).fill(invalidData.invalidEmail.clientEmail)
      await page.getByTestId(&apos;project-submit-button&apos;).click()
      await expect(page.getByText(&apos;Invalid email format&apos;)).toBeVisible()
    })

    test(&apos;should handle project creation errors gracefully&apos;, async () => {
      const result = await projectsHub.createProjectWithErrorHandling(invalidData.missingRequired)
      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    })
  })

  test.describe(&apos;Project Import&apos;, () => {
    test(&apos;should import project from JSON file&apos;, async () => {
      await projectsHub.importProject(&apos;test-data/project.json&apos;)
      await projectsHub.expectProjectVisible(&apos;Imported Project&apos;)
      await projectsHub.expectLoadingState()
    })

    test(&apos;should validate imported project data&apos;, async ({ page }) => {
      await page.getByTestId(&apos;import-project-btn&apos;).click()
      await page.setInputFiles(&apos;[data-testid=&quot;file-input&quot;]&apos;, &apos;test-data/invalid-project.json&apos;)
      await expect(page.getByText(&apos;Invalid project data format&apos;)).toBeVisible()
    })
  })

  test.describe(&apos;Quick Start Templates&apos;, () => {
    test(&apos;should create project from template&apos;, async () => {
      await projectsHub.quickStartProject(&apos;brand-identity&apos;)
      await projectsHub.expectProjectVisible(&apos;Brand Identity Project&apos;)
      await projectsHub.expectProjectDetails({
        title: &apos;Brand Identity Project&apos;,
        description: projectTemplates.brandIdentity.description,
        clientName: '&apos;,
        status: &apos;active&apos;,
        priority: &apos;high&apos;
      })
    })

    test(&apos;should display template previews&apos;, async ({ page }) => {
      await page.getByTestId(&apos;quick-start-btn&apos;).click()
      await expect(page.getByTestId(&apos;template-brand-identity&apos;)).toBeVisible()
      await expect(page.getByTestId(&apos;template-web-design&apos;)).toBeVisible()
      await expect(page.getByTestId(&apos;template-marketing&apos;)).toBeVisible()
    })
  })

  test.describe(&apos;Project Management&apos;, () => {
    test(&apos;should delete project with confirmation&apos;, async () => {
      await projectsHub.createProject(testProjects.valid)
      await projectsHub.deleteProject(testProjects.valid.title, true)
      await projectsHub.expectProjectNotVisible(testProjects.valid.title)
    })

    test(&apos;should cancel project deletion&apos;, async () => {
      await projectsHub.createProject(testProjects.valid)
      await projectsHub.deleteProject(testProjects.valid.title, false)
      await projectsHub.expectProjectVisible(testProjects.valid.title)
    })

    test(&apos;should update project status&apos;, async ({ page }) => {
      await projectsHub.createProject(testProjects.valid)
      await projectsHub.openProjectMenu(testProjects.valid.title)
      await page.getByRole(&apos;menuitem&apos;, { name: &apos;Change Status&apos; }).click()
      await page.getByRole(&apos;option&apos;, { name: &apos;Completed&apos; }).click()
      await expect(page.locator(`[data-status=&quot;completed&quot;]`)).toBeVisible()
    })
  })

  test.describe(&apos;Search and Filtering&apos;, () => {
    test(&apos;should filter projects by status&apos;, async () => {
      await projectsHub.createProject(testProjects.valid)
      await projectsHub.filterByStatus(&apos;active&apos;)
      await projectsHub.expectProjectVisible(testProjects.valid.title)
      
      await projectsHub.filterByStatus(&apos;completed&apos;)
      await projectsHub.expectProjectNotVisible(testProjects.valid.title)
    })

    test(&apos;should filter projects by priority&apos;, async () => {
      await projectsHub.createProject(testProjects.valid)
      await projectsHub.filterByPriority(testProjects.valid.priority)
      await projectsHub.expectProjectVisible(testProjects.valid.title)
      
      await projectsHub.filterByPriority(&apos;low&apos;)
      await projectsHub.expectProjectNotVisible(testProjects.valid.title)
    })

    test(&apos;should search projects by title&apos;, async () => {
      await projectsHub.createProject(testProjects.valid)
      await projectsHub.expectSearchResults(testProjects.valid.title, 1)
      await projectsHub.expectSearchResults(&apos;nonexistent project&apos;, 0)
    })

    test(&apos;should search projects by client name&apos;, async () => {
      await projectsHub.createProject(testProjects.valid)
      await projectsHub.expectSearchResults(testProjects.valid.clientName, 1)
    })
  })

  test.describe(&apos;Empty States and Loading&apos;, () => {
    test(&apos;should display empty state when no projects exist&apos;, async () => {
      await projectsHub.expectEmptyState()
    })

    test(&apos;should display loading state during operations&apos;, async () => {
      await projectsHub.createProject(testProjects.valid)
      await projectsHub.expectLoadingState()
    })
  })
}) 