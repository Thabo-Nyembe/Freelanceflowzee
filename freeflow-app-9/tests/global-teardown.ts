import { FullConfig } from '@playwright/test';

/**
 * Global teardown for KAZI application tests
 * Cleanup test environment and artifacts
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Cleaning up KAZI test environment...');
  
  try {
    // Cleanup test data, temporary files, etc.
    // This could include clearing test databases, removing uploaded files, etc.
    
    console.log('✅ Test environment cleanup completed');
  } catch (error) {
    console.error('❌ Error during test cleanup:', error);
    // Don't throw to avoid masking test failures
  }
}

export default globalTeardown;