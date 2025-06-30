import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = jest.fn()
  unobserve = jest.fn()
  disconnect = jest.fn()
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
})

// Mock ResizeObserver
class MockResizeObserver {
  observe = jest.fn()
  unobserve = jest.fn()
  disconnect = jest.fn()
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
})

// Mock document.createElement
const mockLink = {
  click: jest.fn(),
  download: '',
  href: '',
}

Object.defineProperty(document, 'createElement', {
  writable: true,
  value: jest.fn((tag) => {
    if (tag === 'a') return mockLink
    const element = document.createElement(tag)
    element.setAttribute = jest.fn()
    element.getAttribute = jest.fn()
    element.removeAttribute = jest.fn()
    element.appendChild = jest.fn()
    element.removeChild = jest.fn()
    element.style = {}
    element.click = jest.fn()
    return element
  }),
}) 