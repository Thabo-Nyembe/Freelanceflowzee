import { test, expect } from '@playwright/test';
import { test as baseTest } from './test-config';

test.describe('FreeflowZee Projects Hub', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    await page.getByRole('tab', { name: 'Projects Hub' }).click();
  });

  test.describe('Project Creation', () => {
    test('should create new project', async ({ page }) => {
      // Click create button
      await page.getByRole('button', { name: 'Create Project' }).click();
      
      // Fill project details
      await page.getByLabel('Project Name').fill('E-commerce Website');
      await page.getByLabel('Description').fill('Modern e-commerce platform with AI features');
      await page.getByLabel('Budget').fill('15000');
      await page.getByLabel('Deadline').fill('2024-12-31');
      await page.getByLabel('Client Name').fill('Tech Solutions Inc');
      await page.getByLabel('Client Email').fill('client@techsolutions.com');
      
      // Select project type
      await page.getByLabel('Project Type').selectOption('web-development');
      
      // Add team members
      await page.getByRole('button', { name: 'Add Team Member' }).click();
      await page.getByLabel('Email').fill('developer@freeflowzee.com');
      await page.getByLabel('Role').selectOption('developer');
      await page.getByRole('button', { name: 'Add' }).click();
      
      // Create project
      await page.getByRole('button', { name: 'Create' }).click();
      
      // Verify project created
      await expect(page.getByText('Project created successfully')).toBeVisible();
      await expect(page.getByText('E-commerce Website')).toBeVisible();
    });

    test('should validate project form', async ({ page }) => {
      await page.getByRole('button', { name: 'Create Project' }).click();
      
      // Submit empty form
      await page.getByRole('button', { name: 'Create' }).click();
      
      // Verify validation messages
      await expect(page.getByText('Project Name is required')).toBeVisible();
      await expect(page.getByText('Budget is required')).toBeVisible();
      await expect(page.getByText('Deadline is required')).toBeVisible();
    });
  });

  test.describe('Project List', () => {
    test('should display project grid', async ({ page }) => {
      // Verify project elements
      const projects = await page.getByTestId('project-card').all();
      expect(projects.length).toBeGreaterThan(0);
      
      // Verify project details
      const firstProject = projects[0];
      await expect(firstProject.getByTestId('project-name')).toBeVisible();
      await expect(firstProject.getByTestId('project-status')).toBeVisible();
      await expect(firstProject.getByTestId('project-progress')).toBeVisible();
    });

    test('should filter projects', async ({ page }) => {
      // Apply filters
      await page.getByRole('button', { name: 'Filter' }).click();
      await page.getByLabel('Status').selectOption('in_progress');
      await page.getByLabel('Type').selectOption('web-development');
      await page.getByRole('button', { name: 'Apply' }).click();
      
      // Verify filtered results
      const projects = await page.getByTestId('project-card').all();
      for (const project of projects) {
        await expect(project.getByTestId('project-status')).toHaveText('In Progress');
        await expect(project.getByTestId('project-type')).toHaveText('Web Development');
      }
    });

    test('should sort projects', async ({ page }) => {
      // Sort by deadline
      await page.getByRole('button', { name: 'Sort' }).click();
      await page.getByRole('option', { name: 'Deadline' }).click();
      
      // Verify sort order
      const deadlines = await page.getByTestId('project-deadline').allTextContents();
      const sortedDeadlines = [...deadlines].sort();
      expect(deadlines).toEqual(sortedDeadlines);
    });
  });

  test.describe('Project Details', () => {
    test('should display project overview', async ({ page }) => {
      // Select project
      await page.getByTestId('project-card').first().click();
      
      // Verify project details
      await expect(page.getByTestId('project-overview')).toBeVisible();
      await expect(page.getByTestId('project-timeline')).toBeVisible();
      await expect(page.getByTestId('project-budget')).toBeVisible();
      await expect(page.getByTestId('project-team')).toBeVisible();
    });

    test('should edit project details', async ({ page }) => {
      await page.getByTestId('project-card').first().click();
      
      // Edit project
      await page.getByRole('button', { name: 'Edit' }).click();
      await page.getByLabel('Project Name').fill('Updated Project Name');
      await page.getByLabel('Budget').fill('20000');
      await page.getByRole('button', { name: 'Save' }).click();
      
      // Verify changes
      await expect(page.getByText('Project updated successfully')).toBeVisible();
      await expect(page.getByTestId('project-name')).toHaveText('Updated Project Name');
      await expect(page.getByTestId('project-budget')).toContainText('20,000');
    });
  });

  test.describe('Task Management', () => {
    test('should create project task', async ({ page }) => {
      await page.getByTestId('project-card').first().click();
      
      // Create task
      await page.getByRole('button', { name: 'Add Task' }).click();
      await page.getByLabel('Task Name').fill('Implement User Authentication');
      await page.getByLabel('Description').fill('Set up JWT authentication system');
      await page.getByLabel('Due Date').fill('2024-07-15');
      await page.getByLabel('Assignee').selectOption('developer@freeflowzee.com');
      await page.getByRole('button', { name: 'Create Task' }).click();
      
      // Verify task created
      await expect(page.getByText('Task created successfully')).toBeVisible();
      await expect(page.getByText('Implement User Authentication')).toBeVisible();
    });

    test('should update task status', async ({ page }) => {
      await page.getByTestId('project-card').first().click();
      
      // Update task status
      const task = page.getByTestId('task-item').first();
      await task.getByRole('button', { name: 'Status' }).click();
      await page.getByRole('option', { name: 'Completed' }).click();
      
      // Verify status update
      await expect(task.getByTestId('task-status')).toHaveText('Completed');
      await expect(page.getByText('Task status updated')).toBeVisible();
    });
  });

  test.describe('File Management', () => {
    test('should upload project files', async ({ page }) => {
      await page.getByTestId('project-card').first().click();
      
      // Upload file
      await page.getByRole('button', { name: 'Upload Files' }).click();
      await page.setInputFiles('input[type="file"]', 'test-data/document.pdf');
      
      // Verify upload
      await expect(page.getByText('File uploaded successfully')).toBeVisible();
      await expect(page.getByText('document.pdf')).toBeVisible();
    });

    test('should manage file permissions', async ({ page }) => {
      await page.getByTestId('project-card').first().click();
      
      // Set file permissions
      const file = page.getByTestId('file-item').first();
      await file.getByRole('button', { name: 'More' }).click();
      await page.getByRole('menuitem', { name: 'Permissions' }).click();
      await page.getByLabel('Client Access').check();
      await page.getByRole('button', { name: 'Save' }).click();
      
      // Verify permissions
      await expect(page.getByText('Permissions updated')).toBeVisible();
      await expect(file.getByTestId('client-access')).toBeVisible();
    });
  });

  test.describe('Team Collaboration', () => {
    test('should add team member', async ({ page }) => {
      await page.getByTestId('project-card').first().click();
      
      // Add team member
      await page.getByRole('button', { name: 'Manage Team' }).click();
      await page.getByRole('button', { name: 'Add Member' }).click();
      await page.getByLabel('Email').fill('designer@freeflowzee.com');
      await page.getByLabel('Role').selectOption('designer');
      await page.getByRole('button', { name: 'Add' }).click();
      
      // Verify member added
      await expect(page.getByText('Team member added')).toBeVisible();
      await expect(page.getByText('designer@freeflowzee.com')).toBeVisible();
    });

    test('should manage team roles', async ({ page }) => {
      await page.getByTestId('project-card').first().click();
      
      // Update role
      await page.getByRole('button', { name: 'Manage Team' }).click();
      const member = page.getByTestId('team-member').first();
      await member.getByRole('button', { name: 'Edit Role' }).click();
      await page.getByLabel('Role').selectOption('project_manager');
      await page.getByRole('button', { name: 'Save' }).click();
      
      // Verify role update
      await expect(page.getByText('Role updated')).toBeVisible();
      await expect(member.getByTestId('member-role')).toHaveText('Project Manager');
    });
  });

  test.describe('Client Portal', () => {
    test('should generate client access', async ({ page }) => {
      await page.getByTestId('project-card').first().click();
      
      // Generate client access
      await page.getByRole('button', { name: 'Client Access' }).click();
      await page.getByRole('button', { name: 'Generate Link' }).click();
      
      // Verify access link
      await expect(page.getByTestId('access-link')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Copy Link' })).toBeEnabled();
    });

    test('should customize client permissions', async ({ page }) => {
      await page.getByTestId('project-card').first().click();
      
      // Set permissions
      await page.getByRole('button', { name: 'Client Access' }).click();
      await page.getByLabel('View Files').check();
      await page.getByLabel('Comment').check();
      await page.getByLabel('Approve Milestones').check();
      await page.getByRole('button', { name: 'Save Permissions' }).click();
      
      // Verify permissions
      await expect(page.getByText('Permissions saved')).toBeVisible();
    });
  });

  test.describe('Analytics', () => {
    test('should display project metrics', async ({ page }) => {
      await page.getByTestId('project-card').first().click();
      
      // View analytics
      await page.getByRole('tab', { name: 'Analytics' }).click();
      
      // Verify metrics
      await expect(page.getByTestId('time-tracking')).toBeVisible();
      await expect(page.getByTestId('budget-usage')).toBeVisible();
      await expect(page.getByTestId('task-completion')).toBeVisible();
      await expect(page.getByTestId('team-performance')).toBeVisible();
    });

    test('should export analytics report', async ({ page }) => {
      await page.getByTestId('project-card').first().click();
      await page.getByRole('tab', { name: 'Analytics' }).click();
      
      // Export report
      await page.getByRole('button', { name: 'Export Report' }).click();
      await page.getByLabel('Format').selectOption('pdf');
      await page.getByRole('button', { name: 'Download' }).click();
      
      // Verify download
      await expect(page.getByText('Report generated')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors', async ({ page }) => {
      // Simulate network error
      await page.route('**/api/projects/**', route => route.abort());
      
      await page.getByRole('button', { name: 'Create Project' }).click();
      await page.getByRole('button', { name: 'Create' }).click();
      
      // Verify error message
      await expect(page.getByText('Connection Error')).toBeVisible();
      await expect(page.getByText('Please check your connection')).toBeVisible();
    });

    test('should handle concurrent edits', async ({ page }) => {
      await page.getByTestId('project-card').first().click();
      
      // Simulate concurrent edit
      await page.evaluate(() => {
        localStorage.setItem('project_lock', 'true');
      });
      
      await page.getByRole('button', { name: 'Edit' }).click();
      
      // Verify warning
      await expect(page.getByText('Project is being edited by another user')).toBeVisible();
    });
  });
});