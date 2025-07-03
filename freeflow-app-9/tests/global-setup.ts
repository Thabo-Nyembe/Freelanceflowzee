import { chromium, FullConfig } from '@playwright/test'
import path from 'path'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global test setup...')
  
  // Start the development server if not already running
  const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:3000'
  
  try {
    // Check if server is already running
    const response = await fetch(baseURL)
    if (response.ok) {
      console.log('✅ Development server is already running')
    }
  } catch (error) {
    console.log('⏳ Waiting for development server to start...')
    // The webServer config will handle starting the server
  }

  // Set up authentication state if needed
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()
  
  try {
    // Navigate to login page
    await page.goto(`${baseURL}/login`)
    await page.waitForLoadState('networkidle')
    
    // Check if demo credentials work
    const emailInput = page.getByLabel(/email/i)
    const passwordInput = page.getByLabel(/password/i)
    const loginButton = page.getByRole('button', { name: /sign in|login/i })
    
    if (await emailInput.isVisible() && await passwordInput.isVisible()) {
      await emailInput.fill('thabo@kaleidocraft.co.za')
      await passwordInput.fill('password1234')
      await loginButton.click()
      
      // Wait for potential redirect
      await page.waitForTimeout(2000)
      
      // Save authentication state if login was successful
      if (page.url().includes('/dashboard')) {
        const storageState = path.join(__dirname, 'auth.json')
        await context.storageState({ path: storageState })
        process.env.STORAGE_STATE = storageState
        console.log('✅ Authentication state saved successfully')
      } else {
        console.log('⚠️  Authentication failed, tests will run without login')
      }
    }
  } catch (error) {
    console.log('⚠️  Could not set up authentication:', error)
  }
  
  await context.close()
  await browser.close()
  
  console.log('✅ Global test setup completed')
}

export default globalSetup
