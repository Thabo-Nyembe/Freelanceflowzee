import type { Page, Locator } from &apos;@playwright/test&apos;;

export class DashboardPage {
  readonly page: Page;
  
  // Navigation elements
  readonly sidebar: Locator;
  readonly header: Locator;
  readonly userAvatar: Locator;
  readonly notificationsBell: Locator;
  readonly searchBar: Locator;

  // Sidebar navigation
  readonly dashboardLink: Locator;
  readonly projectsLink: Locator;
  readonly teamLink: Locator;
  readonly communityLink: Locator;
  readonly analyticsLink: Locator;
  readonly settingsLink: Locator;

  // Main content area
  readonly mainContent: Locator;
  readonly welcomeMessage: Locator;
  readonly quickActions: Locator;
  readonly recentProjects: Locator;
  readonly projectCards: Locator;

  // Stats and metrics
  readonly statsCards: Locator;
  readonly revenueCard: Locator;
  readonly projectsCard: Locator;
  readonly clientsCard: Locator;
  readonly earningsCard: Locator;

  // Quick action buttons
  readonly newProjectButton: Locator;
  readonly uploadFileButton: Locator;
  readonly inviteTeamButton: Locator;
  readonly createInvoiceButton: Locator;

  // Project Hub
  readonly projectsHub: Locator;
  readonly projectsList: Locator;
  readonly projectSearchInput: Locator;
  readonly filterButtons: Locator;
  readonly sortDropdown: Locator;

  // Team Hub
  readonly teamHub: Locator;
  readonly teamMembers: Locator;
  readonly memberAvatars: Locator;
  readonly addMemberButton: Locator;

  // Community Tab
  readonly communityTab: Locator;
  readonly communityPosts: Locator;
  readonly newPostButton: Locator;

  // Analytics Dashboard
  readonly analyticsSection: Locator;
  readonly chartsContainer: Locator;
  readonly performanceMetrics: Locator;

  // Modals and overlays
  readonly modal: Locator;
  readonly confirmationModal: Locator;
  readonly loadingSpinner: Locator;

  // Project form elements
  readonly projectTitleInput: Locator;
  readonly projectDescriptionInput: Locator;
  readonly projectClientNameInput: Locator;
  readonly projectClientEmailInput: Locator;
  readonly projectBudgetInput: Locator;
  readonly projectStartDateInput: Locator;
  readonly projectEndDateInput: Locator;
  readonly projectPrioritySelect: Locator;
  readonly projectStatusSelect: Locator;
  readonly projectSubmitButton: Locator;
  readonly projectErrorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Navigation elements
    this.sidebar = page.locator(&apos;[data-testid=&quot;sidebar&quot;]&apos;);
    this.header = page.locator(&apos;[data-testid=&quot;header&quot;]&apos;);
    this.userAvatar = page.locator(&apos;[data-testid=&quot;user-avatar&quot;]&apos;);
    this.notificationsBell = page.locator(&apos;[data-testid=&quot;notifications&quot;]&apos;);
    this.searchBar = page.locator(&apos;[data-testid=&quot;search-bar&quot;]&apos;);

    // Sidebar navigation
    this.dashboardLink = page.getByRole(&apos;link&apos;, { name: &apos;Dashboard&apos; });
    this.projectsLink = page.getByRole(&apos;link&apos;, { name: &apos;Projects&apos; });
    this.teamLink = page.getByRole(&apos;link&apos;, { name: &apos;Team&apos; });
    this.communityLink = page.getByRole(&apos;link&apos;, { name: &apos;Community&apos; });
    this.analyticsLink = page.getByRole(&apos;link&apos;, { name: &apos;Analytics&apos; });
    this.settingsLink = page.getByRole(&apos;link&apos;, { name: &apos;Settings&apos; });

    // Main content area
    this.mainContent = page.locator(&apos;main&apos;);
    this.welcomeMessage = page.locator(&apos;[data-testid=&quot;welcome-message&quot;]&apos;);
    this.quickActions = page.locator(&apos;[data-testid=&quot;quick-actions&quot;]&apos;);
    this.recentProjects = page.locator(&apos;[data-testid=&quot;recent-projects&quot;]&apos;);
    this.projectCards = page.locator(&apos;[data-testid=&quot;project-card&quot;]&apos;);

    // Stats and metrics
    this.statsCards = page.locator(&apos;[data-testid=&quot;stats-card&quot;]&apos;);
    this.revenueCard = page.locator(&apos;[data-testid=&quot;revenue-card&quot;]&apos;);
    this.projectsCard = page.locator(&apos;[data-testid=&quot;projects-card&quot;]&apos;);
    this.clientsCard = page.locator(&apos;[data-testid=&quot;clients-card&quot;]&apos;);
    this.earningsCard = page.locator(&apos;[data-testid=&quot;earnings-card&quot;]&apos;);

    // Quick action buttons
    this.newProjectButton = page.getByRole(&apos;button&apos;, { name: &apos;New Project&apos; });
    this.uploadFileButton = page.getByRole(&apos;button&apos;, { name: &apos;Upload File&apos; });
    this.inviteTeamButton = page.getByRole(&apos;button&apos;, { name: &apos;Invite Team&apos; });
    this.createInvoiceButton = page.getByRole(&apos;button&apos;, { name: &apos;Create Invoice&apos; });

    // Project Hub
    this.projectsHub = page.locator(&apos;[data-testid=&quot;projects-hub&quot;]&apos;);
    this.projectsList = page.locator(&apos;[data-testid=&quot;projects-list&quot;]&apos;);
    this.projectSearchInput = page.locator(&apos;[data-testid=&quot;project-search&quot;]&apos;);
    this.filterButtons = page.locator(&apos;[data-testid=&quot;filter-button&quot;]&apos;);
    this.sortDropdown = page.locator(&apos;[data-testid=&quot;sort-dropdown&quot;]&apos;);

    // Team Hub
    this.teamHub = page.locator(&apos;[data-testid=&quot;team-hub&quot;]&apos;);
    this.teamMembers = page.locator(&apos;[data-testid=&quot;team-member&quot;]&apos;);
    this.memberAvatars = page.locator(&apos;[data-testid=&quot;member-avatar&quot;]&apos;);
    this.addMemberButton = page.getByRole(&apos;button&apos;, { name: &apos;Add Member&apos; });

    // Community Tab
    this.communityTab = page.locator(&apos;[data-testid=&quot;community-tab&quot;]&apos;);
    this.communityPosts = page.locator(&apos;[data-testid=&quot;community-post&quot;]&apos;);
    this.newPostButton = page.getByRole(&apos;button&apos;, { name: &apos;New Post&apos; });

    // Analytics Dashboard
    this.analyticsSection = page.locator(&apos;[data-testid=&quot;analytics-section&quot;]&apos;);
    this.chartsContainer = page.locator(&apos;[data-testid=&quot;charts-container&quot;]&apos;);
    this.performanceMetrics = page.locator(&apos;[data-testid=&quot;performance-metrics&quot;]&apos;);

    // Modals and overlays
    this.modal = page.locator(&apos;[role=&quot;dialog&quot;]&apos;);
    this.confirmationModal = page.locator(&apos;[data-testid=&quot;confirmation-modal&quot;]&apos;);
    this.loadingSpinner = page.locator(&apos;[data-testid=&quot;loading-spinner&quot;]&apos;);

    // Project form elements
    this.projectTitleInput = page.locator(&apos;input[name=&quot;title&quot;], input[id=&quot;title&quot;], input[placeholder*=&quot;title&quot; i]&apos;).first();
    this.projectDescriptionInput = page.locator(&apos;textarea[name=&quot;description&quot;], textarea[id=&quot;description&quot;], textarea[placeholder*=&quot;description&quot; i]&apos;).first();
    this.projectClientNameInput = page.locator(&apos;input[name=&quot;clientName&quot;], input[id=&quot;clientName&quot;], input[placeholder*=&quot;client name&quot; i]&apos;).first();
    this.projectClientEmailInput = page.locator(&apos;input[name=&quot;clientEmail&quot;], input[id=&quot;clientEmail&quot;], input[placeholder*=&quot;client email&quot; i]&apos;).first();
    this.projectBudgetInput = page.locator(&apos;input[name=&quot;budget&quot;], input[id=&quot;budget&quot;], input[placeholder*=&quot;budget&quot; i]&apos;).first();
    this.projectStartDateInput = page.locator(&apos;input[name=&quot;startDate&quot;], input[id=&quot;startDate&quot;], input[placeholder*=&quot;start date&quot; i]&apos;).first();
    this.projectEndDateInput = page.locator(&apos;input[name=&quot;endDate&quot;], input[id=&quot;endDate&quot;], input[placeholder*=&quot;end date&quot; i]&apos;).first();
    this.projectPrioritySelect = page.locator(&apos;select[name=&quot;priority&quot;], select[id=&quot;priority&quot;]&apos;).first();
    this.projectStatusSelect = page.locator(&apos;select[name=&quot;status&quot;], select[id=&quot;status&quot;]&apos;).first();
    this.projectSubmitButton = page.locator(&apos;button[type=&quot;submit&quot;]&apos;);
    this.projectErrorMessage = page.locator(&apos;[data-testid=&quot;error-message&quot;]&apos;);
  }

  async goto() {
    await this.page.goto(&apos;/dashboard&apos;);
    await this.page.waitForLoadState(&apos;networkidle&apos;);
    await this.waitForDashboardToLoad();
  }

  async waitForDashboardToLoad() {
    await this.mainContent.waitFor({ state: &apos;visible&apos; });
    await this.page.waitForTimeout(1000); // Wait for animations
  }

  // Navigation methods
  async navigateToProjects() {
    await this.projectsLink.click();
    await this.page.waitForURL(&apos;**/projects**&apos;);
  }

  async navigateToTeam() {
    await this.teamLink.click();
    await this.page.waitForURL(&apos;**/team**&apos;);
  }

  async navigateToCommunity() {
    await this.communityLink.click();
    await this.page.waitForURL(&apos;**/community**&apos;);
  }

  async navigateToAnalytics() {
    await this.analyticsLink.click();
    await this.page.waitForURL(&apos;**/analytics**&apos;);
  }

  async navigateToSettings() {
    await this.settingsLink.click();
    await this.page.waitForURL(&apos;**/settings**&apos;);
  }

  // Quick actions
  async createNewProject() {
    await this.newProjectButton.click();
    await this.modal.waitFor({ state: &apos;visible&apos; });
  }

  async uploadFile() {
    await this.uploadFileButton.click();
    await this.modal.waitFor({ state: &apos;visible&apos; });
  }

  async inviteTeamMember() {
    await this.inviteTeamButton.click();
    await this.modal.waitFor({ state: &apos;visible&apos; });
  }

  async createInvoice() {
    await this.createInvoiceButton.click();
    await this.page.waitForURL(&apos;**/invoice**&apos;);
  }

  // Project operations
  async searchProjects(query: string) {
    await this.projectSearchInput.fill(query);
    await this.page.waitForTimeout(500); // Debounce search
  }

  async filterProjectsByStatus(status: string) {
    await this.filterButtons.filter({ hasText: status }).click();
  }

  async sortProjects(sortBy: string) {
    await this.sortDropdown.click();
    await this.page.getByRole(&apos;option&apos;, { name: sortBy }).click();
  }

  async selectProject(projectName: string) {
    await this.projectCards.filter({ hasText: projectName }).click();
  }

  async deleteProject(projectName: string) {
    const projectCard = this.projectCards.filter({ hasText: projectName });
    await projectCard.hover();
    await projectCard.getByRole(&apos;button&apos;, { name: &apos;Delete&apos; }).click();
    await this.confirmationModal.waitFor({ state: &apos;visible&apos; });
    await this.page.getByRole(&apos;button&apos;, { name: &apos;Confirm&apos; }).click();
  }

  // Team operations
  async addTeamMember(email: string, role: string) {
    await this.addMemberButton.click();
    await this.modal.waitFor({ state: &apos;visible&apos; });
    await this.page.getByLabel(&apos;Email&apos;).fill(email);
    await this.page.getByLabel(&apos;Role&apos;).selectOption(role);
    await this.page.getByRole(&apos;button&apos;, { name: &apos;Send Invite&apos; }).click();
  }

  async removeTeamMember(memberName: string) {
    const member = this.teamMembers.filter({ hasText: memberName });
    await member.hover();
    await member.getByRole(&apos;button&apos;, { name: &apos;Remove&apos; }).click();
    await this.confirmationModal.waitFor({ state: &apos;visible&apos; });
    await this.page.getByRole(&apos;button&apos;, { name: &apos;Confirm&apos; }).click();
  }

  // Community operations
  async createPost(content: string) {
    await this.newPostButton.click();
    await this.modal.waitFor({ state: &apos;visible&apos; });
    await this.page.getByLabel(&apos;Post content&apos;).fill(content);
    await this.page.getByRole(&apos;button&apos;, { name: &apos;Post&apos; }).click();
  }

  async likePost(postId: string) {
    await this.page.locator(`[data-testid=&quot;post-${postId}&quot;]`).getByRole(&apos;button&apos;, { name: &apos;Like&apos; }).click();
  }

  async commentOnPost(postId: string, comment: string) {
    await this.page.locator(`[data-testid=&quot;post-${postId}&quot;]`).getByRole(&apos;button&apos;, { name: &apos;Comment&apos; }).click();
    await this.page.getByLabel(&apos;Comment&apos;).fill(comment);
    await this.page.getByRole(&apos;button&apos;, { name: &apos;Submit&apos; }).click();
  }

  // Verification methods
  async verifyDashboardLoaded() {
    return {
      sidebar: await this.sidebar.isVisible(),
      header: await this.header.isVisible(),
      mainContent: await this.mainContent.isVisible(),
      quickActions: await this.quickActions.isVisible()
    };
  }

  async verifyStatsCards() {
    const statsCount = await this.statsCards.count();
    const cards = await this.statsCards.all();
    const cardData = [];
    
    for (const card of cards) {
      const text = await card.textContent();
      cardData.push(text?.trim());
    }
    
    return {
      count: statsCount,
      data: cardData
    };
  }

  async verifyProjectsHub() {
    await this.navigateToProjects();
    return {
      hub: await this.projectsHub.isVisible(),
      list: await this.projectsList.isVisible(),
      search: await this.projectSearchInput.isVisible(),
      filters: await this.filterButtons.first().isVisible()
    };
  }

  async verifyTeamHub() {
    await this.navigateToTeam();
    return {
      hub: await this.teamHub.isVisible(),
      members: await this.teamMembers.count(),
      addButton: await this.addMemberButton.isVisible()
    };
  }

  async verifyUserProfile() {
    return {
      avatar: await this.userAvatar.isVisible(),
      notifications: await this.notificationsBell.isVisible()
    };
  }

  // Data extraction methods
  async getProjectCount() {
    await this.navigateToProjects();
    return await this.projectCards.count();
  }

  async getTeamMemberCount() {
    await this.navigateToTeam();
    return await this.teamMembers.count();
  }

  async getProjectNames() {
    await this.navigateToProjects();
    const projects = await this.projectCards.all();
    const names = [];
    
    for (const project of projects) {
      const title = await project.locator(&apos;h3, h4&apos;).first().textContent();
      if (title) names.push(title.trim());
    }
    
    return names;
  }

  async getTeamMemberNames() {
    await this.navigateToTeam();
    const members = await this.teamMembers.all();
    const names = [];
    
    for (const member of members) {
      const name = await member.locator(&apos;[data-testid=&quot;member-name&quot;]&apos;).textContent();
      if (name) names.push(name.trim());
    }
    
    return names;
  }

  // Performance methods
  async measureDashboardLoadTime() {
    const startTime = Date.now();
    await this.goto();
    const endTime = Date.now();
    return endTime - startTime;
  }

  async checkResponsiveness() {
    // Test mobile viewport
    await this.page.setViewportSize({ width: 375, height: 812 });
    await this.page.waitForTimeout(500);
    const mobileLayout = {
      sidebar: await this.sidebar.isVisible(),
      header: await this.header.isVisible(),
      mainContent: await this.mainContent.isVisible()
    };

    // Test tablet viewport
    await this.page.setViewportSize({ width: 768, height: 1024 });
    await this.page.waitForTimeout(500);
    const tabletLayout = {
      sidebar: await this.sidebar.isVisible(),
      header: await this.header.isVisible(),
      mainContent: await this.mainContent.isVisible()
    };

    // Test desktop viewport
    await this.page.setViewportSize({ width: 1200, height: 800 });
    await this.page.waitForTimeout(500);
    const desktopLayout = {
      sidebar: await this.sidebar.isVisible(),
      header: await this.header.isVisible(),
      mainContent: await this.mainContent.isVisible()
    };

    return {
      mobile: mobileLayout,
      tablet: tabletLayout,
      desktop: desktopLayout
    };
  }

  // Error handling
  async handleError() {
    const errorMessage = this.page.locator(&apos;[data-testid=&quot;error-message&quot;]&apos;);
    if (await errorMessage.isVisible()) {
      return await errorMessage.textContent();
    }
    return null;
  }

  async dismissModal() {
    if (await this.modal.isVisible()) {
      await this.page.keyboard.press(&apos;Escape&apos;);
      await this.modal.waitFor({ state: &apos;hidden&apos; });
    }
  }

  async logout() {
    await this.userAvatar.click();
    await this.page.getByRole(&apos;menuitem&apos;, { name: &apos;Logout&apos; }).click();
    await this.page.waitForURL(&apos;**/login&apos;);
  }

  async openProjectCreationForm() {
    await this.newProjectButton.click();
    await this.modal.waitFor({ state: &apos;visible&apos; });
    await this.projectTitleInput.waitFor({ state: &apos;visible&apos; });
  }

  async createProject(data: {
    title: string;
    description: string;
    clientName?: string;
    clientEmail?: string;
    budget?: string;
    startDate?: string;
    endDate?: string;
    priority?: string;
    status?: string;
  }) {
    await this.projectTitleInput.fill(data.title);
    await this.projectDescriptionInput.fill(data.description);

    if (data.clientName) {
      await this.projectClientNameInput.fill(data.clientName);
    }
    if (data.clientEmail) {
      await this.projectClientEmailInput.fill(data.clientEmail);
    }
    if (data.budget) {
      await this.projectBudgetInput.fill(data.budget);
    }
    if (data.startDate) {
      await this.projectStartDateInput.fill(data.startDate);
    }
    if (data.endDate) {
      await this.projectEndDateInput.fill(data.endDate);
    }
    if (data.priority) {
      await this.page.selectOption(&apos;select[name=&quot;priority&quot;], select[id=&quot;priority&quot;]&apos;, data.priority);
    }
    if (data.status) {
      await this.page.selectOption(&apos;select[name=&quot;status&quot;], select[id=&quot;status&quot;]&apos;, data.status);
    }

    await this.projectSubmitButton.click();
  }

  async getProjectByTitle(title: string) {
    return this.projectCards.filter({ hasText: title }).first();
  }

  async getErrorMessage(): Promise<string | null> {
    try {
      return await this.projectErrorMessage.textContent();
    } catch (error) {
      return null;
    }
  }
} 