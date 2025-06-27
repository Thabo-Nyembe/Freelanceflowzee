import { chromium, FullConfig } from &apos;@playwright/test&apos;;
import { promises as fs } from &apos;fs&apos;;
import path from &apos;path&apos;;

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Set test mode headers
  await page.setExtraHTTPHeaders({
    &apos;x-test-mode&apos;: &apos;true&apos;,
    &apos;user-agent&apos;: &apos;Playwright/Test Runner&apos;
  });

  try {
    // Wait for server to be ready
    let retries = 5;
    while (retries > 0) {
      try {
        await page.goto(baseURL);
        break;
      } catch (error) {
        console.log(`Waiting for server to be ready... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        retries--;
        if (retries === 0) throw error;
      }
    }

    // Navigate to login page
    await page.goto(`${baseURL}/login`);

    // Fill login form with test credentials
    await page.fill(&apos;[data-testid=&quot;email-input&quot;]&apos;, &apos;test@freeflowzee.com&apos;);
    await page.fill(&apos;[data-testid=&quot;password-input&quot;]&apos;, &apos;testpassword&apos;);
    await page.click(&apos;[data-testid=&quot;login-button&quot;]&apos;);

    // Wait for successful login and navigation
    await page.waitForURL(&apos;**/dashboard&apos;);

    // Ensure storage directory exists
    const storageDir = path.join(process.cwd(), &apos;tests&apos;, &apos;storage&apos;);
    await fs.mkdir(storageDir, { recursive: true });

    // Store authentication state
    await page.context().storageState({
      path: path.join(storageDir, &apos;storage-state.json&apos;)
    });

  } catch (error) {
    console.error(&apos;Global setup failed:&apos;, error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
