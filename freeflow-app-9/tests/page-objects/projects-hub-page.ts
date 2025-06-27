import { type Page, type Locator, expect } from &apos;@playwright/test&apos;

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
    this.createProjectButton = page.getByTestId(&apos;create-project-button&apos;)
    this.importProjectButton = page.getByTestId(&apos;import-project-button&apos;)
    this.projectTemplatesSection = page.getByTestId(&apos;project-templates-section&apos;)
    this.projectManagementSection = page.getByTestId(&apos;project-management-section&apos;)
    this.createProjectDialog = page.getByTestId(&apos;create-project-dialog&apos;)
    this.importProjectDialog = page.getByTestId(&apos;import-project-dialog&apos;)
    this.successMessage = page.getByTestId(&apos;success-message&apos;)
    this.importSuccessMessage = page.getByTestId(&apos;import-success-message&apos;)
    this.brandIdentityTemplate = page.getByTestId(&apos;brand-identity-template&apos;)
    this.websiteDesignTemplate = page.getByTestId(&apos;website-design-template&apos;)
    this.mobileAppTemplate = page.getByTestId(&apos;mobile-app-template&apos;)
    this.templateDetailsDialog = page.getByTestId(&apos;template-details-dialog&apos;)
    this.projectsList = page.getByTestId(&apos;projects-list&apos;)
    this.projectFilters = page.getByTestId(&apos;project-filters&apos;)
    this.projectSortOptions = page.getByTestId(&apos;project-sort-options&apos;)
    this.projectSearchInput = page.getByTestId(&apos;project-search-input&apos;)
  }

  // Navigation
  async goto() {
    await this.page.goto(&apos;/dashboard/projects&apos;)
    await this.page.waitForSelector(&apos;[data-testid=&quot;projects-hub&quot;]&apos;, { state: &apos;visible&apos;, timeout: 10000 })
  }

  // Selectors aligned with component implementation
  private selectors = {
    // Main container
    projectsHub: &apos;[data-testid=&quot;projects-hub&quot;]&apos;,
    
    // Buttons
    createProjectBtn: &apos;[data-testid=&quot;create-project-btn&quot;]&apos;,
    importProjectBtn: &apos;[data-testid=&quot;import-project-btn&quot;]&apos;,
    quickStartBtn: &apos;[data-testid=&quot;quick-start-btn&quot;]&apos;,
    
    // Form inputs
    projectTitleInput: &apos;[data-testid=&quot;project-title-input&quot;]&apos;,
    projectDescriptionInput: &apos;[data-testid=&quot;project-description-input&quot;]&apos;,
    projectClientNameInput: &apos;[data-testid=&quot;project-client-name-input&quot;]&apos;,
    projectClientEmailInput: &apos;[data-testid=&quot;project-client-email-input&quot;]&apos;,
    projectBudgetInput: &apos;[data-testid=&quot;project-budget-input&quot;]&apos;,
    projectStartDateInput: &apos;[data-testid=&quot;project-start-date-input&quot;]&apos;,
    projectEndDateInput: &apos;[data-testid=&quot;project-end-date-input&quot;]&apos;,
    projectPrioritySelect: &apos;[data-testid=&quot;project-priority-select&quot;]&apos;,
    projectStatusSelect: &apos;[data-testid=&quot;project-status-select&quot;]&apos;,
    projectSubmitButton: &apos;[data-testid=&quot;project-submit-button&quot;]&apos;,
    
    // Filters and search
    searchInput: &apos;[data-testid=&quot;search-input&quot;]&apos;,
    statusFilter: &apos;[data-testid=&quot;status-filter&quot;]&apos;,
    priorityFilter: &apos;[data-testid=&quot;priority-filter&quot;]&apos;,
    
    // View toggles
    viewToggle: &apos;[data-testid=&quot;view-toggle&quot;]&apos;,
    gridView: &apos;[data-testid=&quot;grid-view&quot;]&apos;,
    listView: &apos;[data-testid=&quot;list-view&quot;]&apos;,
    
    // Project card elements
    projectCard: &apos;[data-testid=&quot;project-card&quot;]&apos;,
    projectTitle: &apos;[data-testid=&quot;project-title&quot;]&apos;,
    projectDescription: &apos;[data-testid=&quot;project-description&quot;]&apos;,
    projectMenu: &apos;[data-testid=&quot;project-menu&quot;]&apos;,
    
    // Loading and empty states
    loadingSpinner: &apos;[data-testid=&quot;loading-spinner&quot;]&apos;,
    emptyState: &apos;[data-testid=&quot;empty-state&quot;]&apos;
  }

  // Actions with proper error handling and loading state checks
  async createProject(projectData: unknown) {
    try {
      await this.page.click(this.selectors.createProjectBtn)
      await this.page.waitForSelector(this.selectors.projectTitleInput, { state: &apos;visible&apos; })
      
      await this.page.fill(this.selectors.projectTitleInput, projectData.title)
      await this.page.fill(this.selectors.projectDescriptionInput, projectData.description)
      await this.page.fill(this.selectors.projectClientNameInput, projectData.clientName)
      await this.page.fill(this.selectors.projectClientEmailInput, projectData.clientEmail)
      await this.page.fill(this.selectors.projectBudgetInput, projectData.budget)
      await this.page.fill(this.selectors.projectStartDateInput, projectData.startDate)
      await this.page.fill(this.selectors.projectEndDateInput, projectData.endDate)
      
      await this.page.click(this.selectors.projectPrioritySelect)
      await this.page.click(`[data-value=&quot;${projectData.priority}&quot;]`)
      
      await this.page.click(this.selectors.projectStatusSelect)
      await this.page.click(`[data-value=&quot;${projectData.status}&quot;]`)
      
      await this.page.click(this.selectors.projectSubmitButton)
      
      // Wait for loading state to complete
      await this.page.waitForSelector(this.selectors.loadingSpinner, { state: &apos;hidden&apos; })
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : &apos;Unknown error occurred&apos;
      }
    }
  }

  async importProject(filePath: string) {
    await this.page.click(this.selectors.importProjectBtn)
    await this.page.click(&apos;[data-testid=&quot;source-json&quot;]&apos;)
    await this.page.setInputFiles(&apos;[data-testid=&quot;file-input&quot;]&apos;, filePath)
    await this.page.click(&apos;[data-testid=&quot;start-import-btn&quot;]&apos;)
  }

  async quickStartProject(templateName: string) {
    await this.page.click(this.selectors.quickStartBtn)
    await this.page.click(`[data-testid=&quot;template-${templateName}&quot;]`)
    await this.page.click(&apos;[data-testid=&quot;select-template-btn&quot;]&apos;)
  }

  async searchProjects(searchTerm: string) {
    await this.projectSearchInput.fill(searchTerm)
    await this.page.waitForTimeout(1000) // Wait for search debounce
  }

  async filterByStatus(status: string) {
    await this.page.click(this.selectors.statusFilter)
    await this.page.click(`role=option[name=&quot;${status}&quot;]`)
  }

  async filterByPriority(priority: string) {
    await this.page.click(this.selectors.priorityFilter)
    await this.page.click(`role=option[name=&quot;${priority}&quot;]`)
  }

  // View toggle with proper wait conditions
  async toggleView(view: &apos;grid&apos; | &apos;list&apos;) {
    const viewSelector = view === &apos;grid&apos; ? this.selectors.gridView : this.selectors.listView
    await this.page.click(viewSelector)
    await this.page.waitForSelector(this.selectors.projectCard, { state: &apos;visible&apos; })
  }

  async openProjectMenu(projectTitle: string) {
    const projectCard = this.page.locator(this.selectors.projectCard, {
      has: this.page.locator(this.selectors.projectTitle, { hasText: projectTitle })
    })
    await projectCard.locator(this.selectors.projectMenu).click()
  }

  async deleteProject(projectTitle: string, confirm = false) {
    await this.openProjectMenu(projectTitle)
    await this.page.click(&apos;role=menuitem[name=&quot;Delete Project&quot;]&apos;)
    if (confirm) {
      await this.page.click(&apos;role=button[name=&quot;Delete&quot;]&apos;)
    } else {
      await this.page.click(&apos;role=button[name=&quot;Cancel&quot;]&apos;)
    }
  }

  // Assertion helpers with proper wait conditions
  async expectProjectVisible(title: string) {
    await this.page.waitForSelector(this.selectors.projectCard, { state: &apos;visible&apos; })
    await expect(this.page.locator(`${this.selectors.projectTitle}:has-text(&quot;${title}&quot;)`)).toBeVisible()
  }

  async expectProjectNotVisible(title: string) {
    await expect(this.page.locator(`${this.selectors.projectTitle}:has-text(&quot;${title}&quot;)`)).not.toBeVisible()
  }

  async expectProjectDetails(projectData: unknown) {
    await this.page.waitForSelector(this.selectors.projectCard, { state: &apos;visible&apos; })
    await expect(this.page.locator(`${this.selectors.projectTitle}:has-text(&quot;${projectData.title}&quot;)`)).toBeVisible()
    await expect(this.page.locator(`${this.selectors.projectDescription}:has-text(&quot;${projectData.description}&quot;)`)).toBeVisible()
  }

  async expectEmptyState() {
    await this.page.waitForSelector(this.selectors.emptyState, { state: &apos;visible&apos; })
  }

  async expectLoadingState() {
    await this.page.waitForSelector(this.selectors.loadingSpinner, { state: &apos;visible&apos; })
  }

  // Enhanced assertions
  async expectFormValidation() {
    await expect(this.page.getByTestId(&apos;project-title-input&apos;)).toHaveAttribute(&apos;aria-invalid&apos;, &apos;true&apos;)
    await expect(this.page.getByTestId(&apos;project-description-input&apos;)).toHaveAttribute(&apos;aria-invalid&apos;, &apos;true&apos;)
    await expect(this.page.getByTestId(&apos;project-client-email-input&apos;)).toHaveAttribute(&apos;aria-invalid&apos;, &apos;true&apos;)
  }

  async expectProjectCount(count: number) {
    await expect(this.page.locator(this.selectors.projectCard)).toHaveCount(count)
  }

  // Template handling
  async expectTemplatePreview(templateName: string) {
    await expect(this.page.locator(`[data-testid=&quot;template-${templateName}&quot;]`)).toBeVisible()
    await expect(this.page.locator(`[data-testid=&quot;template-${templateName}-preview&quot;]`)).toBeVisible()
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
      await expect(this.page.getByText(`No results found for &quot;${searchTerm}&quot;`)).toBeVisible()
    }
  }

  async fillProjectDetails(details: {
    name: string;
    description: string;
    type: string;
    budget: string;
    deadline: string;
  }) {
    await this.page.getByTestId(&apos;project-name-input&apos;).fill(details.name);
    await this.page.getByTestId(&apos;project-description-input&apos;).fill(details.description);
    await this.page.getByTestId(&apos;project-type-select&apos;).selectOption(details.type);
    await this.page.getByTestId(&apos;project-budget-input&apos;).fill(details.budget);
    await this.page.getByTestId(&apos;project-deadline-input&apos;).fill(details.deadline);
  }

  async submitProjectForm() {
    await this.page.getByTestId(&apos;submit-project-button&apos;).click();
    await this.page.waitForSelector(&apos;[data-testid=&quot;success-message&quot;]&apos;, { state: &apos;visible&apos;, timeout: 10000 });
  }

  async uploadProjectFile(filePath: string) {
    const fileInput = this.page.getByTestId(&apos;project-file-input&apos;);
    await fileInput.setInputFiles(filePath);
    await this.page.waitForSelector(&apos;[data-testid=&quot;import-success-message&quot;]&apos;, { state: &apos;visible&apos;, timeout: 10000 });
  }
} 