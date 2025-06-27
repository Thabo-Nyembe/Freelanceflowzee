import { Page } from &apos;@playwright/test&apos;;
import { BasePage } from &apos;./BasePage&apos;;

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigateToDashboard() {
    await this.page.goto(&apos;/dashboard&apos;);
    await this.waitForPageLoad();
  }

  async openProjectsHub() {
    await this.click(&apos;[data-testid=&quot;projects-hub-button&quot;]&apos;);
    await this.waitForPageLoad();
  }

  async openCommunityHub() {
    await this.click(&apos;[data-testid=&quot;community-hub-button&quot;]&apos;);
    await this.waitForPageLoad();
  }

  async openVideoStudio() {
    await this.click(&apos;[data-testid=&quot;video-studio-button&quot;]&apos;);
    await this.waitForPageLoad();
  }

  async openMyDay() {
    await this.click(&apos;[data-testid=&quot;my-day-button&quot;]&apos;);
    await this.waitForPageLoad();
  }

  async openAIAssistant() {
    await this.click(&apos;[data-testid=&quot;ai-assistant-button&quot;]&apos;);
    await this.waitForPageLoad();
  }

  async isProjectsHubVisible(): Promise<boolean> {
    return await this.isVisible(&apos;[data-testid=&quot;projects-hub&quot;]&apos;);
  }

  async isCommunityHubVisible(): Promise<boolean> {
    return await this.isVisible(&apos;[data-testid=&quot;community-hub&quot;]&apos;);
  }

  async isVideoStudioVisible(): Promise<boolean> {
    return await this.isVisible(&apos;[data-testid=&quot;video-studio&quot;]&apos;);
  }

  async isMyDayVisible(): Promise<boolean> {
    return await this.isVisible(&apos;[data-testid=&quot;my-day&quot;]&apos;);
  }

  async isAIAssistantVisible(): Promise<boolean> {
    return await this.isVisible(&apos;[data-testid=&quot;ai-assistant&quot;]&apos;);
  }
} 