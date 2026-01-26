import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FileUpload } from '@/components/file-upload'
import { DownloadButton } from '@/components/download-button'
import { SiteHeader } from '@/components/site-header'

/**
 * Note: AI Create and Payment page imports are intentionally omitted.
 * - AICreatePage: Moved to @/app/(app)/dashboard/ai-create/page.tsx (uses client components that require provider setup)
 * - PaymentPage: Payment flow is handled through Stripe integration, not a standalone page
 * These page-level tests should be handled via E2E tests (see e2e/ directory)
 */

// Mock fetch for download tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    blob: () => Promise.resolve(new Blob())
  })
) as jest.Mock

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url')
global.URL.revokeObjectURL = jest.fn()

// Mock document.createElement
const mockAppendChild = jest.fn()
const mockRemoveChild = jest.fn()
const mockClick = jest.fn()
const mockLink = {
  click: mockClick,
  download: '',
  href: '',
}

// Helper function for tests that need providers
function renderWithProviders(ui: React.ReactElement) {
  return render(ui)
}

describe('Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Landing Page', () => {
    it('should render site header', () => {
      render(<SiteHeader />)
      expect(screen.getByTestId('site-header')).toBeInTheDocument()
    })
  })

  describe('Navigation Links', () => {
    it('should render all navigation links', () => {
      render(<SiteHeader />)
      expect(screen.getByTestId('nav-home')).toBeInTheDocument()
      expect(screen.getByTestId('nav-features')).toBeInTheDocument()
      expect(screen.getByTestId('nav-pricing')).toBeInTheDocument()
      expect(screen.getByTestId('nav-login')).toBeInTheDocument()
      expect(screen.getByTestId('nav-signup')).toBeInTheDocument()
    })
  })

  describe('File Upload', () => {
    it('should handle file upload', async () => {
      const onUpload = jest.fn()
      render(<FileUpload onUpload={onUpload} />)
      
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      const input = screen.getByTestId('file-input')
      
      Object.defineProperty(input, 'files', {
        value: [file]
      })
      
      fireEvent.change(input, { target: { files: [file] } })
      
      await waitFor(() => {
        expect(onUpload).toHaveBeenCalledWith(file)
      })
    })

    it('should show error for oversized files', async () => {
      const onUpload = jest.fn()
      const maxSize = 5 * 1024 * 1024 // 5MB
      render(<FileUpload onUpload={onUpload} maxSize={maxSize} />)
      
      // Create a file larger than maxSize
      const largeFile = new File(['x'.repeat(maxSize + 1)], 'large.txt', { type: 'text/plain' })
      const input = screen.getByTestId('file-input')
      
      Object.defineProperty(input, 'files', {
        value: [largeFile]
      })
      
      fireEvent.change(input, { target: { files: [largeFile] } })
      
      await waitFor(() => {
        const error = screen.getByTestId('file-error')
        expect(error).toBeInTheDocument()
        expect(error).toHaveTextContent('File size exceeds 5MB limit')
        expect(onUpload).not.toHaveBeenCalled()
      })
    })
  })

  describe('Download Button', () => {
    beforeEach(() => {
      // Reset fetch mock
      (global.fetch as jest.Mock).mockReset()
    })

    it('should handle successful download', async () => {
      const onDownloadComplete = jest.fn()
      const url = 'test.txt'
      const filename = 'test.txt'
      
      render(
        <DownloadButton
          url={url}
          filename={filename}
          onDownloadComplete={onDownloadComplete}
        />
      )
      
      const button = screen.getByTestId('download-button')
      fireEvent.click(button)
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(url)
        expect(onDownloadComplete).toHaveBeenCalled()
      })
    })

    it('should handle download failure', async () => {
      // Mock fetch to return error
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Download failed'))
      
      const onError = jest.fn()
      const url = 'test.txt'
      
      renderWithProviders(
        <DownloadButton
          url={url}
          onError={onError}
        />
      )
      
      const button = screen.getByTestId('download-button')
      fireEvent.click(button)
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(url)
        expect(onError).toHaveBeenCalledWith(expect.any(Error))
      })
    })

    it('should show loading state during download', async () => {
      // Mock fetch to delay response
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        new Promise(resolve => 
          setTimeout(() => 
            resolve({
              ok: true,
              blob: () => Promise.resolve(new Blob())
            }), 100)
        )
      )
      
      renderWithProviders(
        <DownloadButton url="test.txt" />
      )
      
      const button = screen.getByTestId('download-button')
      fireEvent.click(button)
      
      // Check loading state
      expect(button).toHaveTextContent('Downloading...')
      expect(button).toBeDisabled()
      
      // Wait for download to complete
      await waitFor(() => {
        expect(button).toHaveTextContent('Download')
        expect(button).not.toBeDisabled()
      })
    })
  })

  /**
   * Payment Page Tests
   *
   * These tests are skipped because:
   * 1. Payment flow uses Stripe Elements which require special test setup
   * 2. Payment functionality is better tested via E2E tests with Stripe test mode
   * 3. See e2e/payment.spec.ts for comprehensive payment flow tests
   *
   * To run payment tests:
   * - Use Playwright E2E tests: npm run test:e2e
   * - Ensure STRIPE_TEST_MODE=true in environment
   */
  describe.skip('Payment Page (E2E only)', () => {
    it('should be tested via E2E tests', () => {
      // This is a placeholder to document that payment tests exist in e2e/
      expect(true).toBe(true)
    })
  })
})
