import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CommunityHub from '@/components/hubs/community-hub'

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}))

describe('CommunityHub', () => {
  const mockProps = {
    currentUserId: 'test-user',
    onPostCreate: jest.fn(),
    onMemberConnect: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders community hub with all main sections', () => {
    render(<CommunityHub {...mockProps} />)
    
    expect(screen.getByText('Community Hub')).toBeInTheDocument()
    expect(screen.getByText('Connect, collaborate, and grow with fellow freelancers and creators')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create post/i })).toBeInTheDocument()
  })

  it('displays community statistics', () => {
    render(<CommunityHub {...mockProps} />)
    
    expect(screen.getByText('Total Members')).toBeInTheDocument()
    expect(screen.getByText('25,847')).toBeInTheDocument()
    expect(screen.getByText('Active Today')).toBeInTheDocument()
    expect(screen.getByText('1,234')).toBeInTheDocument()
    expect(screen.getByText('Posts Today')).toBeInTheDocument()
    expect(screen.getByText('89')).toBeInTheDocument()
    expect(screen.getByText('Connections Made')).toBeInTheDocument()
    expect(screen.getByText('156')).toBeInTheDocument()
  })

  it('has three main tabs: Community Feed, Members, and Events', () => {
    render(<CommunityHub {...mockProps} />)
    
    expect(screen.getByRole('tab', { name: 'Community Feed' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Members' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Events' })).toBeInTheDocument()
  })

  it('displays mock posts in the feed', () => {
    render(<CommunityHub {...mockProps} />)
    
    // Check for mock post content
    expect(screen.getByText(/Just completed a mobile app redesign project/)).toBeInTheDocument()
    expect(screen.getByText(/Question for the community/)).toBeInTheDocument()
    expect(screen.getByText(/Hosting a virtual workshop next week/)).toBeInTheDocument()
  })

  it('allows searching posts', async () => {
    render(<CommunityHub {...mockProps} />)
    
    const searchInput = screen.getByPlaceholderText('Search posts...')
    fireEvent.change(searchInput, { target: { value: 'mobile' } })
    
    // Should filter posts containing 'mobile'
    await waitFor(() => {
      expect(screen.getByText(/mobile app redesign project/)).toBeInTheDocument()
    })
  })

  it('allows filtering posts by type', async () => {
    render(<CommunityHub {...mockProps} />)
    
    const filterSelect = screen.getByDisplayValue('All Posts')
    fireEvent.change(filterSelect, { target: { value: 'projects' } })
    
    await waitFor(() => {
      // Should show only project posts
      expect(screen.getByText(/mobile app redesign project/)).toBeInTheDocument()
    })
  })

  it('opens create post dialog when Create Post button is clicked', async () => {
    render(<CommunityHub {...mockProps} />)
    
    const createButton = screen.getByRole('button', { name: /create post/i })
    fireEvent.click(createButton)
    
    await waitFor(() => {
      expect(screen.getByText('Create a New Post')).toBeInTheDocument()
      expect(screen.getByText('Post Type')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })

  it('displays member profiles in Members tab', async () => {
    render(<CommunityHub {...mockProps} />)
    
    const membersTab = screen.getByRole('tab', { name: 'Members' })
    fireEvent.click(membersTab)
    
    await waitFor(() => {
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
      expect(screen.getByText('Marcus Chen')).toBeInTheDocument()
      expect(screen.getByText('Elena Rodriguez')).toBeInTheDocument()
    })
  })

  it('displays events in Events tab', async () => {
    render(<CommunityHub {...mockProps} />)
    
    const eventsTab = screen.getByRole('tab', { name: 'Events' })
    fireEvent.click(eventsTab)
    
    await waitFor(() => {
      expect(screen.getByText('Building Brand Voice in the Digital Age')).toBeInTheDocument()
      expect(screen.getByText('Freelancer Networking Mixer')).toBeInTheDocument()
      expect(screen.getByText('Advanced React Patterns Webinar')).toBeInTheDocument()
    })
  })

  it('handles post likes', async () => {
    render(<CommunityHub {...mockProps} />)
    
    // Find a like button (heart icon)
    const likeButtons = screen.getAllByRole('button')
    const likeButton = likeButtons.find(button => 
      button.querySelector('svg') && button.textContent?.includes('24')
    )
    
    if (likeButton) {
      fireEvent.click(likeButton)
      
      await waitFor(() => {
        // Like count should change
        expect(likeButton.textContent).toContain('25')
      })
    }
  })

  it('handles member connections', async () => {
    render(<CommunityHub {...mockProps} />)
    
    // Switch to Members tab
    const membersTab = screen.getByRole('tab', { name: 'Members' })
    fireEvent.click(membersTab)
    
    await waitFor(() => {
      const connectButtons = screen.getAllByRole('button', { name: /connect/i })
      if (connectButtons.length > 0) {
        fireEvent.click(connectButtons[0])
        expect(mockProps.onMemberConnect).toHaveBeenCalledWith('member_001')
      }
    })
  })

  it('handles post creation', async () => {
    render(<CommunityHub {...mockProps} />)
    
    // Open create post dialog
    const createButton = screen.getByRole('button', { name: /create post/i })
    fireEvent.click(createButton)
    
    await waitFor(() => {
      // Fill in the form
      const contentTextarea = screen.getByPlaceholderText(/Share your thoughts/i)
      fireEvent.change(contentTextarea, { target: { value: 'Test post content' } })
      
      const tagsInput = screen.getByPlaceholderText(/design, development, freelance/i)
      fireEvent.change(tagsInput, { target: { value: 'test, automation' } })
      
      // Submit the form
      const postButton = screen.getByRole('button', { name: /^Post$/i })
      fireEvent.click(postButton)
      
      expect(mockProps.onPostCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Test post content',
          tags: ['test', 'automation']
        })
      )
    })
  })

  it('handles event creation', async () => {
    render(<CommunityHub {...mockProps} />)
    
    // Switch to Events tab
    const eventsTab = screen.getByRole('tab', { name: 'Events' })
    fireEvent.click(eventsTab)
    
    await waitFor(() => {
      const createEventButton = screen.getByRole('button', { name: /create event/i })
      fireEvent.click(createEventButton)
      
      expect(screen.getByText('Create Community Event')).toBeInTheDocument()
      expect(screen.getByText('Event Title')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
      expect(screen.getByText('Date & Time')).toBeInTheDocument()
      expect(screen.getByText('Location')).toBeInTheDocument()
      expect(screen.getByText('Event Type')).toBeInTheDocument()
    })
  })
})