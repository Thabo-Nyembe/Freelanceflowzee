import { screen, waitFor, fireEvent } from '@testing-library/react'
import { render } from '../test-utils'
import { PortfolioEnhancer } from '@/components/video/ai/portfolio-enhancer'

// Mock video processing service
jest.mock('@/lib/ai/video-processing-service', () => ({
  processVideo: jest.fn().mockResolvedValue({
    chapters: [
      { title: 'Introduction', timestamp: 0 },
      { title: 'Main Content', timestamp: 30 }
    ],
    insights: [
      { type: 'engagement', score: 0.85 },
      { type: 'quality', score: 0.92 }
    ],
    transcription: 'This is a sample transcription'
  })
}))

// Mock file upload
const mockUpload = jest.fn().mockResolvedValue({ data: { path: 'test.mp4' }, error: null })
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    storage: {
      from: jest.fn(() => ({
        upload: mockUpload
      }))
    }
  }
}))

describe('PortfolioEnhancer', () => {
  it('renders upload section', () => {
    render(<PortfolioEnhancer />)
    
    expect(screen.getByText(/Upload Video/i)).toBeInTheDocument()
    expect(screen.getByTestId('video-upload-input')).toBeInTheDocument()
  })

  it('handles video upload', async () => {
    render(<PortfolioEnhancer />)
    
    const file = new File(['test video'], 'test.mp4', { type: 'video/mp4' })
    const input = screen.getByTestId('video-upload-input')
    
    fireEvent.change(input, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(mockUpload).toHaveBeenCalledWith('test.mp4', file)
    })
  })

  it('shows processing state', async () => {
    render(<PortfolioEnhancer />)
    
    const file = new File(['test video'], 'test.mp4', { type: 'video/mp4' })
    const input = screen.getByTestId('video-upload-input')
    
    fireEvent.change(input, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(screen.getByText(/Processing/i)).toBeInTheDocument()
    })
  })

  it('displays AI-generated content', async () => {
    render(<PortfolioEnhancer />)
    
    const file = new File(['test video'], 'test.mp4', { type: 'video/mp4' })
    const input = screen.getByTestId('video-upload-input')
    
    fireEvent.change(input, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(screen.getByText('Introduction')).toBeInTheDocument()
      expect(screen.getByText('Main Content')).toBeInTheDocument()
      expect(screen.getByText(/Engagement Score: 85%/i)).toBeInTheDocument()
      expect(screen.getByText(/Quality Score: 92%/i)).toBeInTheDocument()
    })
  })

  it('shows error message on upload failure', async () => {
    mockUpload.mockRejectedValueOnce(new Error('Upload failed'))
    
    render(<PortfolioEnhancer />)
    
    const file = new File(['test video'], 'test.mp4', { type: 'video/mp4' })
    const input = screen.getByTestId('video-upload-input')
    
    fireEvent.change(input, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(screen.getByText(/Upload failed/i)).toBeInTheDocument()
    })
  })

  it('validates file type', async () => {
    render(<PortfolioEnhancer />)
    
    const file = new File(['test'], 'test.txt', { type: 'text/plain' })
    const input = screen.getByTestId('video-upload-input')
    
    fireEvent.change(input, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(screen.getByText(/Invalid file type/i)).toBeInTheDocument()
    })
  })
}) 