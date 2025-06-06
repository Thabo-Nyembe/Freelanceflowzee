import type { Page, Locator } from '@playwright/test';

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

  constructor(page: Page) {
    this.page = page;
    
    // Navigation elements
    this.sidebar = page.locator('[data-testid="sidebar"]');
    this.header = page.locator('[data-testid="header"]');
    this.userAvatar = page.locator('[data-testid="user-avatar"]');
    this.notificationsBell = page.locator('[data-testid="notifications"]');
    this.searchBar = page.locator('[data-testid="search-bar"]');

    // Sidebar navigation
    this.dashboardLink = page.getByRole('link', { name: 'Dashboard' });
    this.projectsLink = page.getByRole('link', { name: 'Projects' });
    this.teamLink = page.getByRole('link', { name: 'Team' });
    this.communityLink = page.getByRole('link', { name: 'Community' });
    this.analyticsLink = page.getByRole('link', { name: 'Analytics' });
    this.settingsLink = page.getByRole('link', { name: 'Settings' });

    // Main content area
    this.mainContent = page.locator('main');
    this.welcomeMessage = page.locator('[data-testid="welcome-message"]');
    this.quickActions = page.locator('[data-testid="quick-actions"]');
    this.recentProjects = page.locator('[data-testid="recent-projects"]');
    this.projectCards = page.locator('[data-testid="project-card"]');

    // Stats and metrics
    this.statsCards = page.locator('[data-testid="stats-card"]');
    this.revenueCard = page.locator('[data-testid="revenue-card"]');
    this.projectsCard = page.locator('[data-testid="projects-card"]');
    this.clientsCard = page.locator('[data-testid="clients-card"]');
    this.earningsCard = page.locator('[data-testid="earnings-card"]');

    // Quick action buttons
    this.newProjectButton = page.getByRole('button', { name: 'New Project' });
    this.uploadFileButton = page.getByRole('button', { name: 'Upload File' });
    this.inviteTeamButton = page.getByRole('button', { name: 'Invite Team' });
    this.createInvoiceButton = page.getByRole('button', { name: 'Create Invoice' });

    // Project Hub
    this.projectsHub = page.locator('[data-testid="projects-hub"]');
    this.projectsList = page.locator('[data-testid="projects-list"]');
    this.projectSearchInput = page.locator('[data-testid="project-search"]');
    this.filterButtons = page.locator('[data-testid="filter-button"]');
    this.sortDropdown = page.locator('[data-testid="sort-dropdown"]');

    // Team Hub
    this.teamHub = page.locator('[data-testid="team-hub"]');
    this.teamMembers = page.locator('[data-testid="team-member"]');
    this.memberAvatars = page.locator('[data-testid="member-avatar"]');
    this.addMemberButton = page.getByRole('button', { name: 'Add Member' });

    // Community Tab
    this.communityTab = page.locator('[data-testid="community-tab"]');
    this.communityPosts = page.locator('[data-testid="community-post"]');
    this.newPostButton = page.getByRole('button', { name: 'New Post' });

    // Analytics Dashboard
    this.analyticsSection = page.locator('[data-testid="analytics-section"]');
    this.chartsContainer = page.locator('[data-testid="charts-container"]');
    this.performanceMetrics = page.locator('[data-testid="performance-metrics"]');

    // Modals and overlays
    this.modal = page.locator('[role="dialog"]');
    this.confirmationModal = page.locator('[data-testid="confirmation-modal"]');
    this.loadingSpinner = page.locator('[data-testid="loading-spinner"]');
  }

  async goto() {
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('networkidle');
    await this.waitForDashboardToLoad();
  }

  async waitForDashboardToLoad() {
    await this.mainContent.waitFor({ state: 'visible' });
    await this.page.waitForTimeout(1000); // Wait for animations
  }

  // Navigation methods
  async navigateToProjects() {
    await this.projectsLink.click();
    await this.page.waitForURL('**/projects**');
  }

  async navigateToTeam() {
    await this.teamLink.click();
    await this.page.waitForURL('**/team**');
  }

  async navigateToCommunity() {
    await this.communityLink.click();
    await this.page.waitForURL('**/community**');
  }

  async navigateToAnalytics() {
    await this.analyticsLink.click();
    await this.page.waitForURL('**/analytics**');
  }

  async navigateToSettings() {
    await this.settingsLink.click();
    await this.page.waitForURL('**/settings**');
  }

  // Quick actions
  async createNewProject() {
    await this.newProjectButton.click();
    await this.modal.waitFor({ state: 'visible' });
  }

  async uploadFile() {
    await this.uploadFileButton.click();
    await this.modal.waitFor({ state: 'visible' });
  }

  async inviteTeamMember() {
    await this.inviteTeamButton.click();
    await this.modal.waitFor({ state: 'visible' });
  }

  async createInvoice() {
    await this.createInvoiceButton.click();
    await this.page.waitForURL('**/invoice**');
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
    await this.page.getByRole('option', { name: sortBy }).click();
  }

  async selectProject(projectName: string) {
    await this.projectCards.filter({ hasText: projectName }).click();
  }

  async deleteProject(projectName: string) {
    const projectCard = this.projectCards.filter({ hasText: projectName });
    await projectCard.hover();
    await projectCard.getByRole('button', { name: 'Delete' }).click();
    await this.confirmationModal.waitFor({ state: 'visible' });
    await this.page.getByRole('button', { name: 'Confirm' }).click();
  }

  // Team operations
  async addTeamMember(email: string, role: string) {
    await this.addMemberButton.click();
    await this.modal.waitFor({ state: 'visible' });
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Role').selectOption(role);
    await this.page.getByRole('button', { name: 'Send Invite' }).click();
  }

  async removeTeamMember(memberName: string) {
    const member = this.teamMembers.filter({ hasText: memberName });
    await member.hover();
    await member.getByRole('button', { name: 'Remove' }).click();
    await this.confirmationModal.waitFor({ state: 'visible' });
    await this.page.getByRole('button', { name: 'Confirm' }).click();
  }

  // Community operations
  async createPost(content: string) {
    await this.newPostButton.click();
    await this.modal.waitFor({ state: 'visible' });
    await this.page.getByLabel('Post content').fill(content);
    await this.page.getByRole('button', { name: 'Post' }).click();
  }

  async likePost(postId: string) {
    await this.page.locator(`[data-testid="post-${postId}"]`).getByRole('button', { name: 'Like' }).click();
  }

  async commentOnPost(postId: string, comment: string) {
    await this.page.locator(`[data-testid="post-${postId}"]`).getByRole('button', { name: 'Comment' }).click();
    await this.page.getByLabel('Comment').fill(comment);
    await this.page.getByRole('button', { name: 'Submit' }).click();
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
      const title = await project.locator('h3, h4').first().textContent();
      if (title) names.push(title.trim());
    }
    
    return names;
  }

  async getTeamMemberNames() {
    await this.navigateToTeam();
    const members = await this.teamMembers.all();
    const names = [];
    
    for (const member of members) {
      const name = await member.locator('[data-testid="member-name"]').textContent();
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
    const errorMessage = this.page.locator('[data-testid="error-message"]');
    if (await errorMessage.isVisible()) {
      return await errorMessage.textContent();
    }
    return null;
  }

  async dismissModal() {
    if (await this.modal.isVisible()) {
      await this.page.keyboard.press('Escape');
      await this.modal.waitFor({ state: 'hidden' });
    }
  }

  async logout() {
    await this.userAvatar.click();
    await this.page.getByRole('menuitem', { name: 'Logout' }).click();
    await this.page.waitForURL('**/login');
  }
} 