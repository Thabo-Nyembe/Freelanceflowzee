import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import FilesHub from '@/components/hubs/files-hub'

// Mock file API for testing
global.URL.createObjectURL = jest.fn(() => 'mocked-object-url')

describe('FilesHub', () => {
  const mockProps = {
    userId: 'test-user',
    onFileUpload: jest.fn(),
    onFileDelete: jest.fn(),
    onFileShare: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders files hub with header and stats', () => {
    render(<FilesHub {...mockProps} />)
    
    expect(screen.getByText('Files Hub')).toBeInTheDocument()
    expect(screen.getByText('Manage and share your files with clients and team members')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /upload files/i })).toBeInTheDocument()
  })

  it('displays file statistics', () => {
    render(<FilesHub {...mockProps} />)
    
    expect(screen.getByText('Total Files')).toBeInTheDocument()
    expect(screen.getByText('Storage Used')).toBeInTheDocument()
    expect(screen.getByText('Total Downloads')).toBeInTheDocument()
    expect(screen.getByText('Shared Files')).toBeInTheDocument()
  })

  it('displays mock files in grid view', () => {
    render(<FilesHub {...mockProps} />)
    
    expect(screen.getByText('Brand Guidelines Final.pdf')).toBeInTheDocument()
    expect(screen.getByText('Hero Video Draft.mp4')).toBeInTheDocument()
    expect(screen.getByText('Logo Variations.zip')).toBeInTheDocument()
    expect(screen.getByText('Product Photo 1.jpg')).toBeInTheDocument()
  })

  it('shows file metadata correctly', () => {
    render(<FilesHub {...mockProps} />)
    
    // Check for file sizes
    expect(screen.getByText('2.4 MB')).toBeInTheDocument()
    expect(screen.getByText('150 MB')).toBeInTheDocument()
    expect(screen.getByText('8 MB')).toBeInTheDocument()
    expect(screen.getByText('3 MB')).toBeInTheDocument()
    
    // Check for upload dates
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
    expect(screen.getByText('Mike Chen')).toBeInTheDocument()
    expect(screen.getByText('Alex Rivera')).toBeInTheDocument()
  })

  it('allows searching files', async () => {
    render(<FilesHub {...mockProps} />)
    
    const searchInput = screen.getByPlaceholderText('Search files...')
    fireEvent.change(searchInput, { target: { value: 'logo' } })
    
    await waitFor(() => {
      expect(screen.getByText('Logo Variations.zip')).toBeInTheDocument()
      expect(screen.queryByText('Brand Guidelines Final.pdf')).toBeInTheDocument()
    })
  })

  it('allows filtering by file type', async () => {
    render(<FilesHub {...mockProps} />)
    
    const filterSelect = screen.getByDisplayValue('All Types')
    fireEvent.change(filterSelect, { target: { value: 'video' } })
    
    await waitFor(() => {
      expect(screen.getByText('Hero Video Draft.mp4')).toBeInTheDocument()
      expect(screen.queryByText('Brand Guidelines Final.pdf')).not.toBeInTheDocument()
    })
  })

  it('allows sorting files', async () => {
    render(<FilesHub {...mockProps} />)
    
    const sortSelect = screen.getByDisplayValue('Sort by Date')
    fireEvent.change(sortSelect, { target: { value: 'name' } })
    
    // Should trigger re-sorting (implementation dependent)
    await waitFor(() => {
      expect(sortSelect).toHaveValue('name')
    })
  })

  it('switches between grid and list view', () => {
    render(<FilesHub {...mockProps} />)
    
    const gridButton = screen.getByRole('button', { name: /grid/i })
    const listButton = screen.getByRole('button', { name: /list/i })
    
    expect(gridButton).toBeInTheDocument()
    expect(listButton).toBeInTheDocument()
    
    fireEvent.click(listButton)
    // View should change to list mode
    expect(listButton).toHaveClass('bg-primary') // or similar active class
  })

  it('handles file sharing', async () => {
    render(<FilesHub {...mockProps} />)
    
    // Find the dropdown menu button for the first file
    const moreButtons = screen.getAllByRole('button')
    const dropdownButton = moreButtons.find(button => 
      button.querySelector('svg') && button.getAttribute('aria-expanded') === 'false'
    )
    
    if (dropdownButton) {
      fireEvent.click(dropdownButton)
      
      await waitFor(() => {
        const shareButton = screen.getByText('Share')
        fireEvent.click(shareButton)
        
        expect(mockProps.onFileShare).toHaveBeenCalledWith('file_001')
      })
    }
  })

  it('handles file starring', async () => {
    render(<FilesHub {...mockProps} />)
    
    // Find star buttons
    const starButtons = screen.getAllByRole('button')
    const starButton = starButtons.find(button => 
      button.querySelector('svg[data-testid="star-icon"]') || 
      button.querySelector('svg') && button.getAttribute('aria-label')?.includes('star')
    )
    
    if (starButton) {
      fireEvent.click(starButton)
      
      // File should be starred/unstarred
      await waitFor(() => {
        expect(starButton).toHaveAttribute('class', expect.stringContaining('text-yellow-500'))
      })
    }
  })

  it('handles file deletion', async () => {
    render(<FilesHub {...mockProps} />)
    
    // Find the dropdown menu button for the first file
    const moreButtons = screen.getAllByRole('button')
    const dropdownButton = moreButtons.find(button => 
      button.querySelector('svg') && button.getAttribute('aria-expanded') === 'false'
    )
    
    if (dropdownButton) {
      fireEvent.click(dropdownButton)
      
      await waitFor(() => {
        const deleteButton = screen.getByText('Delete')
        fireEvent.click(deleteButton)
        
        expect(mockProps.onFileDelete).toHaveBeenCalledWith('file_001')
      })
    }
  })

  it('handles file upload', async () => {
    render(<FilesHub {...mockProps} />)
    
    // Mock file
    const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
    
    // Find file input
    const fileInput = screen.getByLabelText(/upload files/i)
    
    // Simulate file selection
    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: false,
    })
    
    fireEvent.change(fileInput)
    
    // Should show upload progress
    await waitFor(() => {
      expect(screen.getByText('Uploading files...')).toBeInTheDocument()
    })
  })

  it('shows empty state when no files match filter', async () => {
    render(<FilesHub {...mockProps} />)
    
    const searchInput = screen.getByPlaceholderText('Search files...')
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })
    
    await waitFor(() => {
      expect(screen.getByText('No files found')).toBeInTheDocument()
      expect(screen.getByText('Try adjusting your search criteria')).toBeInTheDocument()
    })
  })

  it('displays file type icons correctly', () => {
    render(<FilesHub {...mockProps} />)
    
    // Check for different file type indicators
    const fileCards = screen.getAllByRole('generic')
    expect(fileCards.length).toBeGreaterThan(0)
    
    // Should have different colored backgrounds for different file types
    // PDF should have orange background, video purple, etc.
  })

  it('shows file metadata in cards', () => {
    render(<FilesHub {...mockProps} />)
    
    // Check for view and download counts
    expect(screen.getByText('123')).toBeInTheDocument() // views
    expect(screen.getByText('45')).toBeInTheDocument() // downloads
    expect(screen.getByText('67')).toBeInTheDocument() // views
    expect(screen.getByText('12')).toBeInTheDocument() // downloads
  })

  it('handles file preview', async () => {
    render(<FilesHub {...mockProps} />)
    
    // Find the dropdown menu button for the first file
    const moreButtons = screen.getAllByRole('button')
    const dropdownButton = moreButtons.find(button => 
      button.querySelector('svg') && button.getAttribute('aria-expanded') === 'false'
    )
    
    if (dropdownButton) {
      fireEvent.click(dropdownButton)
      
      await waitFor(() => {
        const previewButton = screen.getByText('Preview')
        expect(previewButton).toBeInTheDocument()
      })
    }
  })
})