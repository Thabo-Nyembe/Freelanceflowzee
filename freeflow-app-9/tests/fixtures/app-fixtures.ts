import { test as base, type Page } from &apos;@playwright/test&apos;;

type TestFixtures = {
  authenticatedPage: Page;
};

const testUser = {
  email: &apos;thabo@kaleidocraft.co.za&apos;,
  password: &apos;password1234&apos;,
};

export const test = base.extend<TestFixtures>({
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto(&apos;/login&apos;);
    
    // Perform login using data-testid selectors
    await page.fill(&apos;[data-testid=&quot;email-input&quot;]&apos;, testUser.email);
    await page.fill(&apos;[data-testid=&quot;password-input&quot;]&apos;, testUser.password);
    await page.click(&apos;[data-testid=&quot;login-button&quot;]&apos;);
    
    // Wait for dashboard to load
    await page.waitForURL(&apos;/dashboard&apos;);
    
    await use(page);
    await context.close();
  },
});

export { expect } from &apos;@playwright/test&apos;; 