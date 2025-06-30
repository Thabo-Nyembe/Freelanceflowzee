import '@testing-library/jest-dom

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn()
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
})
window.IntersectionObserver = mockIntersectionObserver

// Mock ResizeObserver
const mockResizeObserver = jest.fn()
mockResizeObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
})
window.ResizeObserver = mockResizeObserver

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock scrollTo
window.scrollTo = jest.fn()

// Mock TextEncoder/TextDecoder
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = class {
    encoding = 'utf-8
    encode(str: string): Uint8Array {
      const arr = new Uint8Array(str.length)
      for (let i = 0; i < str.length; i++) {
        arr[i] = str.charCodeAt(i)
      }
      return arr
    }
    encodeInto(str: string, dest: Uint8Array): { read: number; written: number } {
      const encoded = this.encode(str)
      dest.set(encoded)
      return { read: str.length, written: encoded.length }
    }
  } as unknown as typeof TextEncoder
}

if (typeof TextDecoder === 'undefined') {
  global.TextDecoder = class {
    encoding = 'utf-8
    fatal = false
    ignoreBOM = false
    constructor(label?: string, options?: TextDecoderOptions) {
      this.encoding = label || 'utf-8
      this.fatal = options?.fatal || false
      this.ignoreBOM = options?.ignoreBOM || false
    }
    decode(input?: ArrayBuffer | ArrayBufferView | null, options?: { stream?: boolean }): string {
      if (!input) return 
      const arr = input instanceof Uint8Array ? input : new Uint8Array(input as ArrayBuffer)
      return String.fromCharCode.apply(null, Array.from(arr))
    }
  } as unknown as typeof TextDecoder
}

// Mock fetch
global.fetch = jest.fn()

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
  length: 0,
  key: jest.fn(),
}
global.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
  length: 0,
  key: jest.fn(),
}
global.sessionStorage = sessionStorageMock

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn()
global.URL.revokeObjectURL = jest.fn()

// Mock crypto
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: jest.fn().mockImplementation(arr => {
      return arr.map(() => Math.floor(Math.random() * 256))
    }),
    subtle: {
      digest: jest.fn(),
      encrypt: jest.fn(),
      decrypt: jest.fn(),
      sign: jest.fn(),
      verify: jest.fn(),
    },
  },
})

// Suppress console errors during tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

// Set up environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key
process.env.STRIPE_PUBLISHABLE_KEY = 'test-key

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn()
    }
  })
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/'
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams()
})) 