import { type Page, type Locator, expect } from '@playwright/test'

export class ProjectsHubPage {
  readonly page: Page
  
  // UI Elements
  readonly createProjectButton: Locator
  readonly importProjectButton: Locator
  readonly projectTemplatesSection: Locator
  readonly projectManagementSection: Locator
  readonly createProjectDialog: Locator
  readonly importProjectDialog: Locator
  readonly successMessage: Locator
  readonly importSuccessMessage: Locator
  readonly brandIdentityTemplate: Locator
  readonly websiteDesignTemplate: Locator
  readonly mobileAppTemplate: Locator
  readonly templateDetailsDialog: Locator
  readonly projectsList: Locator
  readonly projectFilters: Locator
  readonly projectSortOptions: Locator
  readonly projectSearchInput: Locator

  constructor(page: Page) {
    this.page = page

    // Initialize locators
    this.createProjectButton = page.getByTestId('create-project-button')
    this.importProjectButton = page.getByTestId('import-project-button')
    this.projectTemplatesSection = page.getByTestId('project-templates-section')
    this.projectManagementSection = page.getByTestId('project-management-section')
    this.createProjectDialog = page.getByTestId('create-project-dialog')
    this.importProjectDialog = page.getByTestId('import-project-dialog')
    this.successMessage = page.getByTestId('success-message')
    this.importSuccessMessage = page.getByTestId('import-success-message')
    this.brandIdentityTemplate = page.getByTestId('brand-identity-template')
    this.websiteDesignTemplate = page.getByTestId('website-design-template')
    this.mobileAppTemplate = page.getByTestId('mobile-app-template')
    this.templateDetailsDialog = page.getByTestId('template-details-dialog')
    this.projectsList = page.getByTestId('projects-list')
    this.projectFilters = page.getByTestId('project-filters')
    this.projectSortOptions = page.getByTestId('project-sort-options')
    this.projectSearchInput = page.getByTestId('project-search-input')
  }

  // Navigation
  async goto() {
    await this.page.goto('/dashboard/projects')
    await this.page.waitForSelector('[data-testid="projects-hub"]', { state: 'visible', timeout: 10000 })
  }

  // Selectors aligned with component implementation
  private selectors = {
    // Main container
    projectsHub: '[data-testid="projects-hub"]',
    
    // Buttons
    createProjectBtn: '[data-testid="create-project-btn"]',
    importProjectBtn: '[data-testid="import-project-btn"]',
    quickStartBtn: '[data-testid="quick-start-btn"]',
    
    // Form inputs
    projectTitleInput: '[data-testid="project-title-input"]',
    projectDescriptionInput: '[data-testid="project-description-input"]',
    projectClientNameInput: '[data-testid="project-client-name-input"]',
    projectClientEmailInput: '[data-testid="project-client-email-input"]',
    projectBudgetInput: '[data-testid="project-budget-input"]',
    projectStartDateInput: '[data-testid="project-start-date-input"]',
    projectEndDateInput: '[data-testid="project-end-date-input"]',
    projectPrioritySelect: '[data-testid="project-priority-select"]',
    projectStatusSelect: '[data-testid="project-status-select"]',
    projectSubmitButton: '[data-testid="project-submit-button"]',
    
    // Filters and search
    searchInput: '[data-testid="search-input"]',
    statusFilter: '[data-testid="status-filter"]',
    priorityFilter: '[data-testid="priority-filter"]',
    
    // View toggles
    viewToggle: '[data-testid="view-toggle"]',
    gridView: '[data-testid="grid-view"]',
    listView: '[data-testid="list-view"]',
    
    // Project card elements
    projectCard: '[data-testid="project-card"]',
    projectTitle: '[data-testid="project-title"]',
    projectDescription: '[data-testid="project-description"]',
    projectMenu: '[data-testid="project-menu"]',
    
    // Loading and empty states
    loadingSpinner: '[data-testid="loading-spinner"]',
    emptyState: '[data-testid="empty-state"]'
  }

  // Actions with proper error handling and loading state checks
  async createProject(projectData: any) {
    try {
      await this.page.click(this.selectors.createProjectBtn)
      await this.page.waitForSelector(this.selectors.projectTitleInput, { state: 'visible' })
      
      await this.page.fill(this.selectors.projectTitleInput, projectData.title)
      await this.page.fill(this.selectors.projectDescriptionInput, projectData.description)
      await this.page.fill(this.selectors.projectClientNameInput, projectData.clientName)
      await this.page.fill(this.selectors.projectClientEmailInput, projectData.clientEmail)
      await this.page.fill(this.selectors.projectBudgetInput, projectData.budget)
      await this.page.fill(this.selectors.projectStartDateInput, projectData.startDate)
      await this.page.fill(this.selectors.projectEndDateInput, projectData.endDate)
      
      await this.page.click(this.selectors.projectPrioritySelect)
      await this.page.click(`[data-value="${projectData.priority}"]`)
      
      await this.page.click(this.selectors.projectStatusSelect)
      await this.page.click(`[data-value="${projectData.status}"]`)
      
      await this.page.click(this.selectors.projectSubmitButton)
      
      // Wait for loading state to complete
      await this.page.waitForSelector(this.selectors.loadingSpinner, { state: 'hidden' })
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  async importProject(filePath: string) {
    await this.page.click(this.selectors.importProjectBtn)
    await this.page.click('[data-testid="source-json"]')
    await this.page.setInputFiles('[data-testid="file-input"]', filePath)
    await this.page.click('[data-testid="start-import-btn"]')
  }

  async quickStartProject(templateName: string) {
    await this.page.click(this.selectors.quickStartBtn)
    await this.page.click(`[data-testid="template-${templateName}"]`)
    await this.page.click('[data-testid="select-template-btn"]')
  }

  async searchProjects(searchTerm: string) {
    await this.projectSearchInput.fill(searchTerm)
    await this.page.waitForTimeout(1000) // Wait for search debounce
  }

  async filterByStatus(status: string) {
    await this.page.click(this.selectors.statusFilter)
    await this.page.click(`role=option[name="${status}"]`)
  }

  async filterByPriority(priority: string) {
    await this.page.click(this.selectors.priorityFilter)
    await this.page.click(`role=option[name="${priority}"]`)
  }

  // View toggle with proper wait conditions
  async toggleView(view: 'grid' | 'list') {
    const viewSelector = view === 'grid' ? this.selectors.gridView : this.selectors.listView
    await this.page.click(viewSelector)
    await this.page.waitForSelector(this.selectors.projectCard, { state: 'visible' })
  }

  async openProjectMenu(projectTitle: string) {
    const projectCard = this.page.locator(this.selectors.projectCard, {
      has: this.page.locator(this.selectors.projectTitle, { hasText: projectTitle })
    })
    await projectCard.locator(this.selectors.projectMenu).click()
  }

  async deleteProject(projectTitle: string, confirm = false) {
    await this.openProjectMenu(projectTitle)
    await this.page.click('role=menuitem[name="Delete Project"]')
    if (confirm) {
      await this.page.click('role=button[name="Delete"]')
    } else {
      await this.page.click('role=button[name="Cancel"]')
    }
  }

  // Assertion helpers with proper wait conditions
  async expectProjectVisible(title: string) {
    await this.page.waitForSelector(this.selectors.projectCard, { state: 'visible' })
    await expect(this.page.locator(`${this.selectors.projectTitle}:has-text("${title}")`)).toBeVisible()
  }

  async expectProjectNotVisible(title: string) {
    await expect(this.page.locator(`${this.selectors.projectTitle}:has-text("${title}")`)).not.toBeVisible()
  }

  async expectProjectDetails(projectData: any) {
    await this.page.waitForSelector(this.selectors.projectCard, { state: 'visible' })
    await expect(this.page.locator(`${this.selectors.projectTitle}:has-text("${projectData.title}")`)).toBeVisible()
    await expect(this.page.locator(`${this.selectors.projectDescription}:has-text("${projectData.description}")`)).toBeVisible()
  }

  async expectEmptyState() {
    await this.page.waitForSelector(this.selectors.emptyState, { state: 'visible' })
  }

  async expectLoadingState() {
    await this.page.waitForSelector(this.selectors.loadingSpinner, { state: 'visible' })
  }

  // Enhanced assertions
  async expectFormValidation() {
    await expect(this.page.getByTestId('project-title-input')).toHaveAttribute('aria-invalid', 'true')
    await expect(this.page.getByTestId('project-description-input')).toHaveAttribute('aria-invalid', 'true')
    await expect(this.page.getByTestId('project-client-email-input')).toHaveAttribute('aria-invalid', 'true')
  }

  async expectProjectCount(count: number) {
    await expect(this.page.locator(this.selectors.projectCard)).toHaveCount(count)
  }

  // Template handling
  async expectTemplatePreview(templateName: string) {
    await expect(this.page.locator(`[data-testid="template-${templateName}"]`)).toBeVisible()
    await expect(this.page.locator(`[data-testid="template-${templateName}-preview"]`)).toBeVisible()
  }

  // Filter validation
  async expectActiveFilters(filters: { status?: string; priority?: string }) {
    if (filters.status) {
      await expect(this.page.locator(this.selectors.statusFilter)).toHaveText(filters.status)
    }
    if (filters.priority) {
      await expect(this.page.locator(this.selectors.priorityFilter)).toHaveText(filters.priority)
    }
  }

  // Search results validation
  async expectSearchResults(searchTerm: string, expectedCount: number) {
    await this.searchProjects(searchTerm)
    await this.expectProjectCount(expectedCount)
    if (expectedCount === 0) {
      await expect(this.page.getByText(`No results found for "${searchTerm}"`)).toBeVisible()
    }
  }

  async fillProjectDetails(details: {
    name: string;
    description: string;
    type: string;
    budget: string;
    deadline: string;
  }) {
    await this.page.getByTestId('project-name-input').fill(details.name);
    await this.page.getByTestId('project-description-input').fill(details.description);
    await this.page.getByTestId('project-type-select').selectOption(details.type);
    await this.page.getByTestId('project-budget-input').fill(details.budget);
    await this.page.getByTestId('project-deadline-input').fill(details.deadline);
  }

  async submitProjectForm() {
    await this.page.getByTestId('submit-project-button').click();
    await this.page.waitForSelector('[data-testid="success-message"]', { state: 'visible', timeout: 10000 });
  }

  async uploadProjectFile(filePath: string) {
    const fileInput = this.page.getByTestId('project-file-input');
    await fileInput.setInputFiles(filePath);
    await this.page.waitForSelector('[data-testid="import-success-message"]', { state: 'visible', timeout: 10000 });
  }
} 