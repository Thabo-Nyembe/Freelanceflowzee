import { Page, expect } from '@playwright/test'

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
      return document.documentElement.hasAttribute('data-hydrated')
    }, { timeout: 5000 })
  }

  async getHydrationErrors(): Promise<string[]> {
    return await this.page.evaluate(() => {
      const errors: string[] = []
      document.querySelectorAll('[data-hydration-error]').forEach(el => {
        const error = el.getAttribute('data-hydration-error')
        if (error) errors.push(error)
      })
      return errors
    })
  }

  async checkComponentRendering(selector: string) {
    await this.page.waitForSelector(selector, { state: 'attached' })
    const isVisible = await this.page.isVisible(selector)
    expect(isVisible).toBe(true, `Component ${selector} should be visible`)
  }

  async checkHydrationWarnings() {
    const warnings: string[] = []
    this.page.on('console', msg => {
      if (msg.type() === 'warning' && msg.text().includes('Hydration')) {
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
          const serverHTML = element.getAttribute('data-server-html')
          const clientHTML = element.innerHTML.trim()
          
          if (serverHTML && serverHTML !== clientHTML) {
            console.warn('Hydration mismatch detected:', {
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
      const stateElements = document.querySelectorAll('[data-state]')
      const inconsistencies: any[] = []
      
      stateElements.forEach(element => {
        const serverState = element.getAttribute('data-server-state')
        const clientState = element.getAttribute('data-state')
        
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
      const interactiveElements = document.querySelectorAll('button, a, input, select')
      const missingHandlers: string[] = []
      
      interactiveElements.forEach(element => {
        if (element.hasAttribute('data-action') && !element.onclick) {
          missingHandlers.push(`${element.tagName} with data-action=${element.getAttribute('data-action')}`)
        }
      })
      
      return missingHandlers
    })
  }

  async refreshAndCheckHydration() {
    await this.page.reload()
    await this.waitForHydration()
    const errors = await this.getHydrationErrors()
    expect(errors).toHaveLength(0, 'Should have no hydration errors after refresh')
  }
} 