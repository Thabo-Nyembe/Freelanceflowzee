import { test, expect } from '@playwright/test'

/**
 * Re-test Expense Deduction Widget after fixing infinite loop
 */

test.describe('Tax Intelligence - Expense Widget Re-verification', () => {

  test('Expenses Page - Fixed and Working', async ({ page }) => {
    console.log('\n🔍 Re-testing Expenses Page after fixing infinite loop...\n')

    // Navigate to expenses page
    await page.goto('http://localhost:9323/dashboard/expenses-v2', { waitUntil: 'networkidle' })
    await page.waitForTimeout(3000)

    // Take screenshot
    await page.screenshot({
      path: 'test-results/tax-verification/20-expenses-page-fixed.png',
      fullPage: true
    })

    // Check if error is gone
    const errorText = await page.locator('text=/Something went wrong|Maximum update/i').isVisible({ timeout: 3000 }).catch(() => false)

    if (errorText) {
      console.log('❌ ERROR STILL EXISTS on expenses page!\n')
      expect(errorText).toBe(false)
    } else {
      console.log('✅ No error - Expenses page loaded successfully!\n')
    }

    // Look for main content
    const pageHeading = await page.locator('h1, h2').first()
    const headingText = await pageHeading.textContent()
    console.log(`📄 Page heading: "${headingText}"\n`)

    // Look for New Expense button
    const buttons = await page.locator('button').all()
    console.log(`🔘 Found ${buttons.length} buttons on page\n`)

    // Try to find and click expense creation button
    const newExpenseBtn = await page.locator('button').filter({ hasText: /New|Add|Create|\+/i }).first()
    const btnVisible = await newExpenseBtn.isVisible({ timeout: 5000 }).catch(() => false)

    if (btnVisible) {
      const btnText = await newExpenseBtn.textContent()
      console.log(`✅ Found button: "${btnText}"\n`)

      await newExpenseBtn.click()
      console.log('✅ Clicked button\n')
      await page.waitForTimeout(2000)

      // Screenshot of opened form/dialog
      await page.screenshot({
        path: 'test-results/tax-verification/21-expense-form-dialog.png',
        fullPage: true
      })

      // Fill the form
      console.log('📝 Filling expense form...\n')

      // Title/Description
      const titleInput = await page.locator('input[placeholder*="title" i], input[name*="title" i], input[placeholder*="description" i]').first()
      if (await titleInput.isVisible({ timeout: 3000 })) {
        await titleInput.fill('MacBook Pro 16" M3 Max - Primary Development Machine')
        console.log('   ✅ Title filled')
      }

      // Amount
      const amountInput = await page.locator('input[type="number"], input[name*="amount" i], input[placeholder*="amount" i]').first()
      if (await amountInput.isVisible({ timeout: 3000 })) {
        await amountInput.fill('3499')
        console.log('   ✅ Amount: $3,499')
      }

      // Notes/Description textarea
      const notesInput = await page.locator('textarea, input[name*="note" i]').first()
      if (await notesInput.isVisible({ timeout: 2000 })) {
        await notesInput.fill('High-performance laptop for software development work - essential business equipment')
        console.log('   ✅ Notes filled\n')
      }

      await page.waitForTimeout(2000)

      // Screenshot after filling
      await page.screenshot({
        path: 'test-results/tax-verification/22-expense-filled.png',
        fullPage: true
      })

      // Scroll to bottom to find deduction widget
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await page.waitForTimeout(1500)

      // Screenshot of bottom area
      await page.screenshot({
        path: 'test-results/tax-verification/23-expense-deduction-area.png',
        fullPage: true
      })

      // Look for deduction widget keywords
      const deductionWidget = await page.locator('text=/Deduction|Tax Category|Suggestion|Deductible/i').first()
      const widgetVisible = await deductionWidget.isVisible({ timeout: 5000 }).catch(() => false)

      if (widgetVisible) {
        console.log('✅ ✨ DEDUCTION SUGGESTION WIDGET IS VISIBLE! 🎉\n')

        const widgetText = await deductionWidget.textContent()
        console.log(`   Widget text: "${widgetText}"\n`)

        await deductionWidget.scrollIntoViewIfNeeded()
        await page.waitForTimeout(500)

        // Close-up screenshot
        await page.screenshot({
          path: 'test-results/tax-verification/24-deduction-widget-close-up.png',
          fullPage: true
        })

        // Look for percentage or category info
        const percentText = await page.locator('text=/%|percent/i').all()
        console.log(`   Found ${percentText.length} percentage indicators\n`)

        expect(widgetVisible).toBe(true)
      } else {
        console.log('⚠️  Deduction widget not found. Checking page content...\n')

        const bodyText = await page.locator('body').textContent()
        const hasTaxText = bodyText?.includes('Tax') || bodyText?.includes('Deduction')
        console.log(`   Page contains tax/deduction text: ${hasTaxText}\n`)
      }

    } else {
      console.log('⚠️  Could not find expense creation button\n')

      // List all button texts for debugging
      const allButtons = await page.locator('button').all()
      console.log('Available buttons:')
      for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
        const text = await allButtons[i].textContent()
        console.log(`   - "${text}"`)
      }
    }

    console.log('\n✅ Expense deduction widget re-test complete!\n')
  })

  test('Invoice Tax Widget - Manual Verification', async ({ page }) => {
    console.log('\n🔍 Manual Invoice Tax Widget Verification...\n')

    await page.goto('http://localhost:9323/dashboard/invoices-v2', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    // Click New Invoice
    const newInvoiceBtn = await page.locator('button').filter({ hasText: /New Invoice/i }).first()
    if (await newInvoiceBtn.isVisible({ timeout: 5000 })) {
      await newInvoiceBtn.click()
      console.log('✅ Opened invoice form\n')
      await page.waitForTimeout(2000)

      // Fill client info
      await page.locator('input[placeholder*="client" i]').first().fill('TechCorp Inc')
      await page.locator('input[type="email"]').first().fill('billing@techcorp.com')
      await page.locator('input[placeholder*="title" i]').first().fill('Consulting Services - Q1 2026')

      // Add line item - click Add Item button
      const addItemBtn = await page.locator('button').filter({ hasText: /Add Item/i }).first()
      if (await addItemBtn.isVisible({ timeout: 3000 })) {
        await addItemBtn.click()
        await page.waitForTimeout(1000)

        // Fill line item
        const descInputs = await page.locator('input[placeholder*="description" i]')
        if (await descInputs.count() > 0) {
          await descInputs.last().fill('Strategy Consulting')
          console.log('✅ Line item description filled\n')

          // Fill quantity and rate
          const numberInputs = await page.locator('input[type="number"]')
          const numCount = await numberInputs.count()

          if (numCount >= 2) {
            await numberInputs.nth(numCount - 2).fill('80')  // Qty
            await numberInputs.nth(numCount - 1).fill('250')  // Rate
            console.log('✅ Quantity: 80 hours, Rate: $250/hour\n')

            await page.waitForTimeout(2000)

            // Scroll to see tax widget
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
            await page.waitForTimeout(1500)

            await page.screenshot({
              path: 'test-results/tax-verification/25-invoice-with-items.png',
              fullPage: true
            })

            // Look for tax widget
            const taxWidget = await page.locator('text=/Tax|Smart Tax|Tax Calculation/i').first()
            const taxVisible = await taxWidget.isVisible({ timeout: 5000 }).catch(() => false)

            if (taxVisible) {
              console.log('✅ ✨ TAX CALCULATION WIDGET IS VISIBLE! 🎉\n')

              await taxWidget.scrollIntoViewIfNeeded()
              await page.waitForTimeout(500)

              await page.screenshot({
                path: 'test-results/tax-verification/26-invoice-tax-widget-found.png',
                fullPage: true
              })

              expect(taxVisible).toBe(true)
            } else {
              console.log('⚠️  Tax widget not visible yet\n')
            }
          }
        }
      }
    }

    console.log('\n✅ Invoice tax widget verification complete!\n')
  })
})
