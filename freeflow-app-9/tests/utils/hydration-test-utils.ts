import { Page } from '@playwright/test'

export async function checkHydrationErrors(page: Page) {
  const errors: string[] = []
  
  page.on('console', msg => {
    if (msg.type() === 'error' && msg.text().includes('Hydration')) {
      errors.push(msg.text())
    }
  })

  return {
    getErrors: () => errors,
    hasErrors: () => errors.length > 0,
    clearErrors: () => {
      errors.length = 0
    }
  }
}

export async function waitForHydration(page: Page) {
  // Wait for client-side hydration to complete
  await page.waitForFunction(() => {
    return (window as any).__NEXT_DATA__?.props?.pageProps !== undefined
  })
}

export async function simulateUserInteraction(page: Page) {
  // Click various interactive elements
  await page.click('button')
  await page.keyboard.press('Tab')
  await page.mouse.move(100, 100)
}

export async function checkDOMConsistency(page: Page) {
  return await page.evaluate(() => {
    const checkNode = (node: Element) => {
      const issues: string[] = []
      
      // Check for duplicate IDs
      if (node.id) {
        const duplicates = document.querySelectorAll(`#${node.id}`)
        if (duplicates.length > 1) {
          issues.push(`Duplicate ID found: ${node.id}`)
        }
      }

      // Check for invalid ARIA attributes
      const ariaAttrs = Array.from(node.attributes)
        .filter(attr => attr.name.startsWith('aria-'))
      
      ariaAttrs.forEach(attr => {
        if (!attr.value) {
          issues.push(`Empty ARIA attribute: ${attr.name}`)
        }
      })

      // Recursively check children
      Array.from(node.children).forEach(child => {
        issues.push(...checkNode(child))
      })

      return issues
    }

    return checkNode(document.documentElement)
  })
}

export async function checkStateConsistency(page: Page) {
  return await page.evaluate(() => {
    const stateIssues: string[] = []
    
    // Check React component state
    const reactInstances = (window as any)._reactRootContainer?._internalRoot?.current
    if (reactInstances) {
      const checkComponent = (fiber: any) => {
        if (fiber.memoizedState !== null && fiber.memoizedState !== fiber.updateQueue?.baseState) {
          stateIssues.push(`State inconsistency in component: ${fiber.type?.name || 'Unknown'}`)
        }
        
        // Check children
        if (fiber.child) checkComponent(fiber.child)
        if (fiber.sibling) checkComponent(fiber.sibling)
      }
      
      checkComponent(reactInstances)
    }

    return stateIssues
  })
}

export async function checkEventHandlers(page: Page) {
  return await page.evaluate(() => {
    const issues: string[] = []
    
    const checkElement = (element: Element) => {
      // Check for event handlers that might have been lost during hydration
      const eventProps = ['onclick', 'onchange', 'onsubmit', 'onkeydown', 'onkeyup']
      eventProps.forEach(prop => {
        if ((element as any)[prop] && typeof (element as any)[prop] !== 'function') {
          issues.push(`Invalid event handler for ${prop} on ${element.tagName}`)
        }
      })

      // Check children
      Array.from(element.children).forEach(checkElement)
    }

    checkElement(document.documentElement)
    return issues
  })
} 