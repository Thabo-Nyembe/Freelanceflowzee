import { FullConfig } from '@playwright/test'
import { promises as fs } from 'fs'
import path from 'path'

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global test teardown...')
  
  try {
    // Clean up authentication state files
    const authFilePath = path.join(__dirname, 'auth.json')
    try {
      await fs.unlink(authFilePath)
      console.log('🗑️  Cleaned up authentication state file')
    } catch (error) {
      // File doesn't exist, which is fine
    }
    
    // Clean up any test artifacts
    const testArtifacts = [
      'test-results.json',
      'test-results.xml'
    ]
    
    for (const artifact of testArtifacts) {
      try {
        await fs.unlink(path.join(process.cwd(), artifact))
        console.log(`🗑️  Cleaned up ${artifact}`)
      } catch (error) {
        // File doesn't exist, which is fine
      }
    }
    
    console.log('✅ Global test teardown completed successfully')
  } catch (error) {
    console.error('❌ Error during global teardown:', error)
  }
}

export default globalTeardown
