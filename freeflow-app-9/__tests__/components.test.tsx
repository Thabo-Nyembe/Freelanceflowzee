import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FileUpload } from '@/components/file-upload'
import { DownloadButton } from '@/components/download-button'
import { SiteHeader } from '@/components/site-header'
import AICreatePage from '@/app/dashboard/ai-create/page'
import PaymentPage from '@/app/payment/page'

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

  describe('Payment Page', () => {
    it('should render payment form with all elements', () => {
      renderWithProviders(<PaymentPage />)
      
      // Check main containers
      expect(screen.getByTestId('payment-page')).toBeInTheDocument()
      expect(screen.getByTestId('payment-container')).toBeInTheDocument()
      expect(screen.getByTestId('payment-tabs')).toBeInTheDocument()
      
      // Check payment method tabs
      expect(screen.getByTestId('payment-method-card')).toBeInTheDocument()
      expect(screen.getByTestId('payment-method-password')).toBeInTheDocument()
      expect(screen.getByTestId('payment-method-code')).toBeInTheDocument()
      
      // Check card payment form
      expect(screen.getByTestId('card-payment-form')).toBeInTheDocument()
      expect(screen.getByTestId('email-input')).toBeInTheDocument()
      expect(screen.getByTestId('card-number-input')).toBeInTheDocument()
      expect(screen.getByTestId('card-expiry-input')).toBeInTheDocument()
      expect(screen.getByTestId('card-cvc-input')).toBeInTheDocument()
      expect(screen.getByTestId('submit-payment-button')).toBeInTheDocument()
    })

    it('should handle card payment submission', async () => {
      renderWithProviders(<PaymentPage />)
      
      // Fill in card payment form
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'test@example.com' }
      })
      fireEvent.change(screen.getByTestId('card-number-input'), {
        target: { value: '4242424242424242' }
      })
      fireEvent.change(screen.getByTestId('card-expiry-input'), {
        target: { value: '12/25' }
      })
      fireEvent.change(screen.getByTestId('card-cvc-input'), {
        target: { value: '123' }
      })
      
      // Submit payment
      const submitButton = screen.getByTestId('submit-payment-button')
      fireEvent.click(submitButton)
      
      // Check loading state
      expect(submitButton).toHaveTextContent('Processing...')
      expect(submitButton).toBeDisabled()
      
      // Wait for completion
      await waitFor(() => {
        expect(submitButton).toHaveTextContent('Complete Payment')
        expect(submitButton).not.toBeDisabled()
      })
    })

    it('should handle alternative access methods', async () => {
      renderWithProviders(<PaymentPage />)
      
      // Test password access
      fireEvent.click(screen.getByTestId('payment-method-password'))
      expect(screen.getByTestId('password-access-form')).toBeInTheDocument()
      
      fireEvent.change(screen.getByTestId('access-password-input'), {
        target: { value: 'test-password' }
      })
      
      const passwordButton = screen.getByTestId('submit-password-button')
      fireEvent.click(passwordButton)
      
      await waitFor(() => {
        expect(passwordButton).toHaveTextContent('Access with Password')
      })
      
      // Test code access
      fireEvent.click(screen.getByTestId('payment-method-code'))
      expect(screen.getByTestId('code-access-form')).toBeInTheDocument()
      
      fireEvent.change(screen.getByTestId('access-code-input'), {
        target: { value: 'test-code' }
      })
      
      const codeButton = screen.getByTestId('submit-code-button')
      fireEvent.click(codeButton)
      
      await waitFor(() => {
        expect(codeButton).toHaveTextContent('Access with Code')
      })
    })

    it('should handle payment errors', async () => {
      renderWithProviders(<PaymentPage />)
      
      // Trigger a payment error
      const submitButton = screen.getByTestId('submit-payment-button')
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        const error = screen.getByTestId('access-error')
        expect(error).toBeInTheDocument()
        expect(error).toHaveTextContent('Payment failed')
      })
    })
  })
})
