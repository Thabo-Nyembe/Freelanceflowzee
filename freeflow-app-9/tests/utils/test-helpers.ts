import { Page, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import path from 'path';

export class TestHelpers {
  constructor(private page: Page) {}

  // Authentication helpers
  async login(email = 'test@freeflowzee.com', password = 'test123') {
    await this.page.goto('/login');
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
    await this.page.click('[data-testid="login-button"]');
    await this.waitForAppReady();
  }

  // Navigation helpers
  async navigateToDashboard() {
    await this.page.goto('/dashboard');
    await this.waitForAppReady();
  }

  async navigateToFeature(feature: string) {
    await this.page.getByRole('tab', { name: feature }).click();
    await this.waitForAppReady();
  }

  // File handling helpers
  async uploadFile(selector: string, filePath: string) {
    await this.page.setInputFiles(selector, filePath);
    await this.page.waitForSelector('[data-testid="upload-progress"]');
    await this.page.waitForSelector('[data-testid="upload-success"]', { timeout: 30000 });
  }

  async downloadFile(selector: string) {
    const downloadPromise = this.page.waitForEvent('download');
    await this.page.click(selector);
    const download = await downloadPromise;
    return download;
  }

  // Video Studio helpers
  async createVideoProject(title: string) {
    await this.navigateToFeature('Video Studio');
    await this.page.click('[data-testid="new-video-project"]');
    await this.page.fill('[data-testid="video-title-input"]', title);
    await this.page.click('[data-testid="create-video-button"]');
    await this.waitForAppReady();
  }

  // AI Create helpers
  async useDesignAssistant(imageFile: string) {
    await this.navigateToFeature('AI Create');
    await this.page.click('[data-testid="design-assistant-btn"]');
    await this.uploadFile('input[type="file"]', imageFile);
    await this.page.click('[data-testid="analyze-design-btn"]');
    await this.waitForAppReady();
  }

  // Projects Hub helpers
  async createProject(details: {
    name: string;
    description: string;
    budget?: number;
    deadline?: string;
    client?: { name: string; email: string };
  }) {
    await this.navigateToFeature('Projects Hub');
    await this.page.click('[data-testid="create-project-button"]');
    await this.page.fill('[data-testid="project-name-input"]', details.name);
    await this.page.fill('[data-testid="project-description-input"]', details.description);
    if (details.budget) {
      await this.page.fill('[data-testid="project-budget-input"]', details.budget.toString());
    }
    if (details.deadline) {
      await this.page.fill('[data-testid="project-deadline-input"]', details.deadline);
    }
    if (details.client) {
      await this.page.fill('[data-testid="client-name-input"]', details.client.name);
      await this.page.fill('[data-testid="client-email-input"]', details.client.email);
    }
    await this.page.click('[data-testid="submit-project"]');
    await this.waitForAppReady();
  }

  // Files Hub helpers
  async uploadToFilesHub(filePath: string) {
    await this.navigateToFeature('Files Hub');
    await this.uploadFile('[data-testid="file-input"]', filePath);
  }

  // Community helpers
  async createPost(content: string, media?: string) {
    await this.navigateToFeature('Community');
    await this.page.click('[data-testid="create-post-btn"]');
    await this.page.fill('[data-testid="post-content"]', content);
    if (media) {
      await this.uploadFile('[data-testid="post-media-input"]', media);
    }
    await this.page.click('[data-testid="submit-post-btn"]');
    await this.waitForAppReady();
  }

  // My Day Today helpers
  async createTask(details: { title: string; priority: 'low' | 'medium' | 'high'; dueDate?: string }) {
    await this.navigateToFeature('My Day Today');
    await this.page.click('[data-testid="create-task-btn"]');
    await this.page.fill('[data-testid="task-title-input"]', details.title);
    await this.page.selectOption('[data-testid="task-priority-select"]', details.priority);
    if (details.dueDate) {
      await this.page.fill('[data-testid="task-due-date-input"]', details.dueDate);
    }
    await this.page.click('[data-testid="submit-task-btn"]');
    await this.waitForAppReady();
  }

  // Utility helpers
  async waitForAppReady() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector('[data-testid]', { timeout: 10000 });
  }

  async checkConsoleErrors() {
    const errors: string[] = [];
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    return errors;
  }

  async takeScreenshot(name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}-${timestamp}.png`,
      fullPage: true 
    });
  }

  async checkAccessibility() {
    // Basic accessibility checks
    await expect(this.page.locator('main')).toHaveAttribute('role', 'main');
    await expect(this.page.locator('button')).toHaveAttribute('aria-label');
    await expect(this.page.locator('img')).toHaveAttribute('alt');
  }
}