import { test, expect } from '@playwright/test';

test.describe('Chat Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/messages');
    await page.waitForLoadState('networkidle');
  });

  test('displays chat list and can select a chat', async ({ page }) => {
    // Verify chat list is visible
    const chatList = page.getByTestId('chat-list');
    await expect(chatList).toBeVisible();

    // Click on first chat item
    const firstChat = page.getByTestId('chat-item-1');
    await firstChat.click();

    // Verify chat messages and input are visible
    await expect(page.getByTestId('chat-messages')).toBeVisible();
    await expect(page.getByTestId('message-input')).toBeVisible();
  });

  test('can send a message', async ({ page }) => {
    // Select a chat
    await page.getByTestId('chat-item-1').click();

    // Type and send a message
    const messageInput = page.getByTestId('message-input');
    await messageInput.fill('Hello, this is a test message!');
    await page.getByTestId('send-button').click();

    // Verify message appears in chat
    await expect(page.getByText('Hello, this is a test message!')).toBeVisible();
  });

  test('shows typing indicator', async ({ page }) => {
    // Select a chat
    await page.getByTestId('chat-item-1').click();

    // Type in message input
    const messageInput = page.getByTestId('message-input');
    await messageInput.type('Hello', { delay: 100 }); // Slow typing to trigger indicator

    // Verify typing indicator appears
    await expect(page.getByTestId('typing-indicator')).toBeVisible();
  });

  test('can filter chats', async ({ page }) => {
    // Type in search input
    const searchInput = page.getByTestId('chat-search');
    await searchInput.fill('John');

    // Verify filtered results
    const chatList = page.getByTestId('chat-list');
    await expect(chatList).toHaveAttribute('data-filter', 'John');
  });

  test('handles empty chat list state', async ({ page }) => {
    // Search for non-existent chat
    const searchInput = page.getByTestId('chat-search');
    await searchInput.fill('NonExistentUser123');

    // Verify empty state message
    await expect(page.getByText(/No chats found/i)).toBeVisible();
  });

  test('can start a new chat', async ({ page }) => {
    // Click new chat button
    await page.getByTestId('new-chat-btn').click();

    // Verify new chat modal/form appears
    await expect(page.getByTestId('new-chat-form')).toBeVisible();

    // Fill in recipient
    await page.getByTestId('recipient-input').fill('Jane Smith');
    await page.getByTestId('start-chat-btn').click();

    // Verify new chat is created and selected
    await expect(page.getByText('Jane Smith')).toBeVisible();
    await expect(page.getByTestId('message-input')).toBeVisible();
  });

  test('preserves chat history on navigation', async ({ page }) => {
    // Select a chat and send a message
    await page.getByTestId('chat-item-1').click();
    await page.getByTestId('message-input').fill('Test message before navigation');
    await page.getByTestId('send-button').click();

    // Navigate to another page and back
    await page.goto('/dashboard');
    await page.goto('/dashboard/messages');

    // Verify message still exists
    await page.getByTestId('chat-item-1').click();
    await expect(page.getByText('Test message before navigation')).toBeVisible();
  });
}); 