import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigateToDashboard() {
    await this.page.goto('/dashboard');
    await this.waitForPageLoad();
  }

  async openProjectsHub() {
    await this.click('[data-testid="projects-hub-button"]');
    await this.waitForPageLoad();
  }

  async openCommunityHub() {
    await this.click('[data-testid="community-hub-button"]');
    await this.waitForPageLoad();
  }

  async openVideoStudio() {
    await this.click('[data-testid="video-studio-button"]');
    await this.waitForPageLoad();
  }

  async openMyDay() {
    await this.click('[data-testid="my-day-button"]');
    await this.waitForPageLoad();
  }

  async openAIAssistant() {
    await this.click('[data-testid="ai-assistant-button"]');
    await this.waitForPageLoad();
  }

  async isProjectsHubVisible(): Promise<boolean> {
    return await this.isVisible('[data-testid="projects-hub"]');
  }

  async isCommunityHubVisible(): Promise<boolean> {
    return await this.isVisible('[data-testid="community-hub"]');
  }

  async isVideoStudioVisible(): Promise<boolean> {
    return await this.isVisible('[data-testid="video-studio"]');
  }

  async isMyDayVisible(): Promise<boolean> {
    return await this.isVisible('[data-testid="my-day"]');
  }

  async isAIAssistantVisible(): Promise<boolean> {
    return await this.isVisible('[data-testid="ai-assistant"]');
  }
} 