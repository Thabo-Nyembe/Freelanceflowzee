import { test, expect } from '@playwright/test';
import { test as baseTest } from './test-config';

test.describe('FreeflowZee My Day Today', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    await page.getByRole('tab', { name: 'My Day Today' }).click();
  });

  test.describe('Daily Overview', () => {
    test('should display today\'s schedule', async ({ page }) => {
      // Verify schedule components
      await expect(page.getByTestId('calendar-view')).toBeVisible();
      await expect(page.getByTestId('task-list')).toBeVisible();
      await expect(page.getByTestId('meeting-list')).toBeVisible();
      await expect(page.getByTestId('deadline-list')).toBeVisible();
    });

    test('should show time blocks', async ({ page }) => {
      // Check time blocks
      const timeBlocks = await page.getByTestId('time-block').all();
      expect(timeBlocks.length).toBeGreaterThan(0);
      
      // Verify time format
      for (const block of timeBlocks) {
        await expect(block.getByTestId('time-label')).toMatch(/^\d{2}:\d{2}$/);
      }
    });
  });

  test.describe('Task Management', () => {
    test('should add new task', async ({ page }) => {
      // Add task
      await page.getByRole('button', { name: 'Add Task' }).click();
      await page.getByLabel('Task Title').fill('Review Project Proposal');
      await page.getByLabel('Priority').selectOption('high');
      await page.getByLabel('Due Time').fill('14:00');
      await page.getByRole('button', { name: 'Create' }).click();
      
      // Verify task added
      await expect(page.getByText('Review Project Proposal')).toBeVisible();
      await expect(page.getByTestId('task-priority')).toContainText('High');
      await expect(page.getByTestId('task-time')).toContainText('14:00');
    });

    test('should complete task', async ({ page }) => {
      // Complete task
      const task = page.getByTestId('task-item').first();
      await task.getByRole('checkbox').check();
      
      // Verify completion
      await expect(task).toHaveClass(/completed/);
      await expect(task.getByTestId('completion-time')).toBeVisible();
    });

    test('should edit task', async ({ page }) => {
      // Edit task
      const task = page.getByTestId('task-item').first();
      await task.getByRole('button', { name: 'Edit' }).click();
      await page.getByLabel('Task Title').fill('Updated Task Title');
      await page.getByLabel('Priority').selectOption('medium');
      await page.getByRole('button', { name: 'Save' }).click();
      
      // Verify changes
      await expect(task).toContainText('Updated Task Title');
      await expect(task.getByTestId('task-priority')).toContainText('Medium');
    });
  });

  test.describe('Meeting Management', () => {
    test('should schedule meeting', async ({ page }) => {
      // Schedule meeting
      await page.getByRole('button', { name: 'Schedule Meeting' }).click();
      await page.getByLabel('Title').fill('Team Sync');
      await page.getByLabel('Start Time').fill('10:00');
      await page.getByLabel('Duration').fill('60');
      await page.getByLabel('Participants').fill('team@freeflowzee.com');
      await page.getByRole('button', { name: 'Schedule' }).click();
      
      // Verify meeting scheduled
      await expect(page.getByText('Team Sync')).toBeVisible();
      await expect(page.getByTestId('meeting-time')).toContainText('10:00');
      await expect(page.getByTestId('meeting-duration')).toContainText('60 min');
    });

    test('should join virtual meeting', async ({ page }) => {
      // Join meeting
      const meeting = page.getByTestId('meeting-item').first();
      await meeting.getByRole('button', { name: 'Join' }).click();
      
      // Verify meeting interface
      await expect(page.getByTestId('video-conference')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Leave' })).toBeEnabled();
    });

    test('should reschedule meeting', async ({ page }) => {
      // Reschedule meeting
      const meeting = page.getByTestId('meeting-item').first();
      await meeting.getByRole('button', { name: 'Reschedule' }).click();
      await page.getByLabel('Start Time').fill('15:00');
      await page.getByRole('button', { name: 'Save' }).click();
      
      // Verify rescheduled
      await expect(meeting.getByTestId('meeting-time')).toContainText('15:00');
      await expect(page.getByText('Meeting rescheduled')).toBeVisible();
    });
  });

  test.describe('Deadline Tracking', () => {
    test('should display upcoming deadlines', async ({ page }) => {
      // Check deadline list
      const deadlines = await page.getByTestId('deadline-item').all();
      expect(deadlines.length).toBeGreaterThan(0);
      
      // Verify deadline format
      for (const deadline of deadlines) {
        await expect(deadline.getByTestId('deadline-time')).toMatch(/^\d{2}:\d{2}$/);
        await expect(deadline.getByTestId('deadline-project')).toBeVisible();
      }
    });

    test('should mark deadline complete', async ({ page }) => {
      // Complete deadline
      const deadline = page.getByTestId('deadline-item').first();
      await deadline.getByRole('button', { name: 'Mark Complete' }).click();
      await page.getByRole('button', { name: 'Confirm' }).click();
      
      // Verify completion
      await expect(deadline).toHaveClass(/completed/);
      await expect(page.getByText('Deadline marked as complete')).toBeVisible();
    });
  });

  test.describe('Time Tracking', () => {
    test('should start time tracking', async ({ page }) => {
      // Start tracking
      const task = page.getByTestId('task-item').first();
      await task.getByRole('button', { name: 'Track Time' }).click();
      
      // Verify tracking started
      await expect(task.getByTestId('timer')).toBeVisible();
      await expect(task.getByRole('button', { name: 'Stop' })).toBeEnabled();
    });

    test('should pause and resume tracking', async ({ page }) => {
      const task = page.getByTestId('task-item').first();
      await task.getByRole('button', { name: 'Track Time' }).click();
      
      // Pause tracking
      await task.getByRole('button', { name: 'Pause' }).click();
      const pausedTime = await task.getByTestId('timer').textContent();
      
      // Wait and verify time stopped
      await page.waitForTimeout(1000);
      await expect(task.getByTestId('timer')).toHaveText(pausedTime);
      
      // Resume tracking
      await task.getByRole('button', { name: 'Resume' }).click();
      await expect(task.getByTestId('timer')).not.toHaveText(pausedTime);
    });
  });

  test.describe('Daily Summary', () => {
    test('should generate daily report', async ({ page }) => {
      // Generate report
      await page.getByRole('button', { name: 'Generate Report' }).click();
      
      // Verify report sections
      await expect(page.getByTestId('completed-tasks')).toBeVisible();
      await expect(page.getByTestId('time-tracked')).toBeVisible();
      await expect(page.getByTestId('meetings-attended')).toBeVisible();
      await expect(page.getByTestId('deadlines-met')).toBeVisible();
    });

    test('should export daily summary', async ({ page }) => {
      await page.getByRole('button', { name: 'Generate Report' }).click();
      
      // Export report
      await page.getByRole('button', { name: 'Export' }).click();
      await page.getByLabel('Format').selectOption('pdf');
      await page.getByRole('button', { name: 'Download' }).click();
      
      // Verify export
      await expect(page.getByText('Report exported successfully')).toBeVisible();
    });
  });

  test.describe('Notifications', () => {
    test('should show task reminders', async ({ page }) => {
      // Mock upcoming task
      await page.evaluate(() => {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 5);
        localStorage.setItem('next_task', JSON.stringify({
          title: 'Upcoming Task',
          time: now.toISOString()
        }));
      });
      
      await page.reload();
      
      // Verify reminder
      await expect(page.getByText('Upcoming Task in 5 minutes')).toBeVisible();
    });

    test('should show meeting reminders', async ({ page }) => {
      // Mock upcoming meeting
      await page.evaluate(() => {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 10);
        localStorage.setItem('next_meeting', JSON.stringify({
          title: 'Team Meeting',
          time: now.toISOString()
        }));
      });
      
      await page.reload();
      
      // Verify reminder
      await expect(page.getByText('Team Meeting starts in 10 minutes')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle scheduling conflicts', async ({ page }) => {
      // Schedule overlapping meetings
      await page.getByRole('button', { name: 'Schedule Meeting' }).click();
      await page.getByLabel('Title').fill('Meeting 1');
      await page.getByLabel('Start Time').fill('10:00');
      await page.getByLabel('Duration').fill('60');
      await page.getByRole('button', { name: 'Schedule' }).click();
      
      await page.getByRole('button', { name: 'Schedule Meeting' }).click();
      await page.getByLabel('Title').fill('Meeting 2');
      await page.getByLabel('Start Time').fill('10:30');
      await page.getByLabel('Duration').fill('60');
      await page.getByRole('button', { name: 'Schedule' }).click();
      
      // Verify conflict warning
      await expect(page.getByText('Schedule Conflict')).toBeVisible();
      await expect(page.getByText('Overlaps with existing meeting')).toBeVisible();
    });

    test('should handle sync errors', async ({ page }) => {
      // Simulate sync error
      await page.route('**/api/sync', route => route.abort());
      
      await page.getByRole('button', { name: 'Sync' }).click();
      
      // Verify error message
      await expect(page.getByText('Sync Failed')).toBeVisible();
      await expect(page.getByText('Changes will be saved locally')).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should handle many tasks efficiently', async ({ page }) => {
      // Add many tasks
      for (let i = 0; i < 100; i++) {
        await page.getByRole('button', { name: 'Add Task' }).click();
        await page.getByLabel('Task Title').fill(`Task ${i}`);
        await page.getByRole('button', { name: 'Create' }).click();
      }
      
      // Verify smooth scrolling
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await expect(page.getByTestId('task-item')).toHaveCount(50); // Virtual list
    });

    test('should optimize calendar rendering', async ({ page }) => {
      // Check calendar optimization
      const timeBlocks = await page.getByTestId('time-block').all();
      for (const block of timeBlocks) {
        await expect(block).toHaveAttribute('loading', 'lazy');
      }
    });
  });
});