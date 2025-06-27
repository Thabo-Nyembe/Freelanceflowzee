import { Page, expect } from &apos;@playwright/test&apos;

export class HydrationTestPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async goto(path: string) {
    await this.page.goto(path)
    await this.waitForHydration()
  }

  async waitForHydration() {
    await this.page.waitForFunction(() => {
      return document.documentElement.hasAttribute(&apos;data-hydrated&apos;)
    }, { timeout: 5000 })
  }

  async getHydrationErrors(): Promise<string[]> {
    return await this.page.evaluate(() => {
      const errors: string[] = []
      document.querySelectorAll(&apos;[data-hydration-error]&apos;).forEach(el => {
        const error = el.getAttribute(&apos;data-hydration-error&apos;)
        if (error) errors.push(error)
      })
      return errors
    })
  }

  async checkComponentRendering(selector: string) {
    await this.page.waitForSelector(selector, { state: &apos;attached&apos; })
    const isVisible = await this.page.isVisible(selector)
    expect(isVisible).toBe(true, `Component ${selector} should be visible`)
  }

  async checkHydrationWarnings() {
    const warnings: string[] = []
    this.page.on(&apos;console&apos;, msg => {
      if (msg.type() === &apos;warning&apos; && msg.text().includes(&apos;Hydration&apos;)) {
        warnings.push(msg.text())
      }
    })
    return warnings
  }

  async waitForClientSideNavigation() {
    await this.page.waitForFunction(() => {
      return (window as any).__NEXT_HAS_NAVIGATED === true
    })
  }

  async checkDOMConsistency() {
    return await this.page.evaluate(() => {
      const checkNode = (node: Node): boolean => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element
          const serverHTML = element.getAttribute(&apos;data-server-html&apos;)
          const clientHTML = element.innerHTML.trim()
          
          if (serverHTML && serverHTML !== clientHTML) {
            console.warn(&apos;Hydration mismatch detected:&apos;, {
              element,
              serverHTML,
              clientHTML
            })
            return false
          }
        }
        
        for (const child of Array.from(node.childNodes)) {
          if (!checkNode(child)) return false
        }
        
        return true
      }
      
      return checkNode(document.body)
    })
  }

  async checkStateConsistency() {
    return await this.page.evaluate(() => {
      const stateElements = document.querySelectorAll(&apos;[data-state]&apos;)
      const inconsistencies: unknown[] = []
      
      stateElements.forEach(element => {
        const serverState = element.getAttribute(&apos;data-server-state&apos;)
        const clientState = element.getAttribute(&apos;data-state&apos;)
        
        if (serverState && clientState && serverState !== clientState) {
          inconsistencies.push({
            element: element.tagName,
            serverState,
            clientState
          })
        }
      })
      
      return inconsistencies
    })
  }

  async checkEventHandlers() {
    return await this.page.evaluate(() => {
      const interactiveElements = document.querySelectorAll(&apos;button, a, input, select&apos;)
      const missingHandlers: string[] = []
      
      interactiveElements.forEach(element => {
        if (element.hasAttribute(&apos;data-action&apos;) && !element.onclick) {
          missingHandlers.push(`${element.tagName} with data-action=${element.getAttribute(&apos;data-action&apos;)}`)
        }
      })
      
      return missingHandlers
    })
  }

  async refreshAndCheckHydration() {
    await this.page.reload()
    await this.waitForHydration()
    const errors = await this.getHydrationErrors()
    expect(errors).toHaveLength(0, &apos;Should have no hydration errors after refresh&apos;)
  }
} 