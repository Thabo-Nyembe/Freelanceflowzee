import { test, expect } from &apos;@playwright/test&apos;;

test.describe(&apos;Basic Signup Flow Tests&apos;, () => {
  test(&apos;should load the signup page correctly&apos;, async ({ page }) => {
    // Navigate to signup page
    await page.goto(&apos;/signup&apos;);
    
    // Wait for the page to load
    await page.waitForLoadState(&apos;networkidle&apos;);
    
    // Check if the page loaded correctly
    await expect(page).toHaveTitle(/FreeflowZee|Signup|Join/);
    
    // Check if the main form elements are present
    await expect(page.locator(&apos;form&apos;)).toBeVisible();
    await expect(page.locator(&apos;#fullName&apos;)).toBeVisible();
    await expect(page.locator(&apos;#email&apos;)).toBeVisible();
    await expect(page.locator(&apos;#password&apos;)).toBeVisible();
    await expect(page.locator(&apos;#confirmPassword&apos;)).toBeVisible();
    await expect(page.locator(&apos;button[type=&quot;submit&quot;]&apos;)).toBeVisible();
    
    console.log(&apos;✅ Signup page loaded successfully with all form elements&apos;);
  });

  test(&apos;should show validation for empty form submission&apos;, async ({ page }) => {
    await page.goto(&apos;/signup&apos;);
    await page.waitForLoadState(&apos;networkidle&apos;);
    
    // Try to submit empty form
    await page.click(&apos;button[type=&quot;submit&quot;]&apos;);
    
    // Check if HTML5 validation prevents submission
    const fullNameInput = page.locator(&apos;#fullName&apos;);
    const isValid = await fullNameInput.evaluate((el: HTMLInputElement) => el.checkValidity());
    
    expect(isValid).toBe(false);
    console.log(&apos;✅ Empty form validation working correctly&apos;);
  });

  test(&apos;should toggle password visibility&apos;, async ({ page }) => {
    await page.goto(&apos;/signup&apos;);
    await page.waitForLoadState(&apos;networkidle&apos;);
    
    // Fill password field
    await page.fill(&apos;#password&apos;, &apos;testpassword&apos;);
    
    // Check initial type is password
    await expect(page.locator(&apos;#password&apos;)).toHaveAttribute(&apos;type&apos;, &apos;password&apos;);
    
    // Find and click the eye toggle button (next sibling of password input)
    const toggleButton = page.locator(&apos;#password&apos;).locator(&apos;..&apos;).locator(&apos;button&apos;).last();
    await toggleButton.click();
    
    // Check type changed to text
    await expect(page.locator(&apos;#password&apos;)).toHaveAttribute(&apos;type&apos;, &apos;text&apos;);
    
    console.log(&apos;✅ Password visibility toggle working correctly&apos;);
  });

  test(&apos;should validate short password&apos;, async ({ page }) => {
    await page.goto(&apos;/signup&apos;);
    await page.waitForLoadState(&apos;networkidle&apos;);
    
    // Fill form with short password
    await page.fill(&apos;#fullName&apos;, &apos;Test User&apos;);
    await page.fill(&apos;#email&apos;, &apos;test@example.com&apos;);
    await page.fill(&apos;#password&apos;, &apos;123&apos;);
    await page.fill(&apos;#confirmPassword&apos;, &apos;123&apos;);
    
    // Submit form
    await page.click(&apos;button[type=&quot;submit&quot;]&apos;);
    
    // Wait for any client-side validation
    await page.waitForTimeout(1000);
    
    // Check for error message about password length
    const errorMessage = page.locator(&apos;text=Password must be at least 6 characters long&apos;);
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    
    console.log(&apos;✅ Short password validation working correctly&apos;);
  });
}); 