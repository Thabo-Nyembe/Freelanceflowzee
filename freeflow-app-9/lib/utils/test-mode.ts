import { headers } from 'next/headers'

/**
 * Checks if the current request is in test mode
 * Used to bypass authentication and other restrictions during E2E testing
 */
export async function isTestMode(): Promise<boolean> {
  try {
    const headersList = await headers()
    const testMode = headersList.get('x-test-mode')
    const userAgent = headersList.get('user-agent')
    
    // Check for explicit test mode header
    if (testMode === 'true') {
      return true
    }
    
    // Check for Playwright user agent
    if (userAgent?.includes('Playwright')) {
      return true
    }
    
    // Check for other common test runners
    if (userAgent?.includes('Test Runner')) {
      return true
    }
    
    return false
  } catch (error) {
    // If headers() fails (e.g., not in a request context), assume not test mode
    console.warn('Failed to check test mode headers:', error)
    return false
  }
}

/**
 * Mock user data for test mode
 */
export const mockTestUser = {
  id: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'authenticated'
} 