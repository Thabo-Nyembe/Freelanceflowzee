import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { FreelancerDashboard } from '../components/freelancer/freelancer-dashboard'
import { PortfolioEnhancer } from '../components/video/ai/portfolio-enhancer'
import { ClientReviewEnhancer } from '../components/video/ai/client-review-enhancer'
import { _FreelancerAnalytics as FreelancerAnalytics } from '../components/freelancer/freelancer-analytics'

// Mock the Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ data: [], error: null })
    }))
  }))
}))

// Mock the AI services
jest.mock('../lib/ai/video-processing-service', () => ({
  processVideo: jest.fn().mockResolvedValue({
    chapters: [],
    insights: [],
    transcription: ''
  })
}))

describe('Freelancer Features', () => {
  describe('FreelancerDashboard', () => {
    it('renders dashboard components', () => {
      render(<FreelancerDashboard />)
      
      expect(screen.getByText(/Portfolio/i)).toBeInTheDocument()
      expect(screen.getByText(/Analytics/i)).toBeInTheDocument()
      expect(screen.getByText(/Reviews/i)).toBeInTheDocument()
    })
  })

  describe('PortfolioEnhancer', () => {
    it('handles video upload', async () => {
      render(<PortfolioEnhancer />)
      
      const uploadButton = screen.getByText(/Upload Video/i)
      expect(uploadButton).toBeInTheDocument()

      const file = new File(['test video'], 'test.mp4', { type: 'video/mp4' })
      const input = screen.getByTestId('video-upload-input')
      
      fireEvent.change(input, { target: { files: [file] } })
      
      await waitFor(() => {
        expect(screen.getByText(/Processing/i)).toBeInTheDocument()
      })
    })

    it('displays AI-generated content', async () => {
      render(<PortfolioEnhancer />)
      
      // Simulate video processed state
      await waitFor(() => {
        expect(screen.getByText(/Chapters/i)).toBeInTheDocument()
        expect(screen.getByText(/Insights/i)).toBeInTheDocument()
      })
    })
  })

  describe('ClientReviewEnhancer', () => {
    it('initializes recording session', () => {
      render(<ClientReviewEnhancer />)
      
      expect(screen.getByText(/Start Recording/i)).toBeInTheDocument()
      expect(screen.getByText(/AI Analysis/i)).toBeInTheDocument()
    })

    it('handles recording controls', async () => {
      render(<ClientReviewEnhancer />)
      
      const startButton = screen.getByText(/Start Recording/i)
      fireEvent.click(startButton)
      
      await waitFor(() => {
        expect(screen.getByText(/Stop Recording/i)).toBeInTheDocument()
      })
    })
  })

  describe('FreelancerAnalytics', () => {
    it('displays analytics sections', () => {
      render(<FreelancerAnalytics />)
      
      expect(screen.getByText(/Earnings/i)).toBeInTheDocument()
      expect(screen.getByText(/Projects/i)).toBeInTheDocument()
      expect(screen.getByText(/Client Satisfaction/i)).toBeInTheDocument()
    })

    it('loads analytics data', async () => {
      render(<FreelancerAnalytics />)
      
      await waitFor(() => {
        expect(screen.getByTestId('earnings-chart')).toBeInTheDocument()
        expect(screen.getByTestId('projects-chart')).toBeInTheDocument()
        expect(screen.getByTestId('satisfaction-chart')).toBeInTheDocument()
      })
    })
  })
}) 