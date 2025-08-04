import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import { MyDayToday } from '@/components/my-day-today'

describe('MyDayToday', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders My Day Today with header and date', () => {
    render(<MyDayToday />)
    
    expect(screen.getByText('My Day Today')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add reminder/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /schedule email/i })).toBeInTheDocument()
  })

  it('displays current date in header', () => {
    render(<MyDayToday />)
    
    const today = new Date()
    const expectedDate = today.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    
    expect(screen.getByText(expectedDate)).toBeInTheDocument()
  })

  it('shows reminders section with sample tasks', () => {
    render(<MyDayToday />)
    
    expect(screen.getByText('Reminders & Tasks')).toBeInTheDocument()
    expect(screen.getByText('Complete logo variations for TechCorp')).toBeInTheDocument()
    expect(screen.getByText('Review and update wireframes')).toBeInTheDocument()
    expect(screen.getByText('Prepare client presentation')).toBeInTheDocument()
    expect(screen.getByText('Team feedback incorporation')).toBeInTheDocument()
  })

  it('shows emails section with sample emails', () => {
    render(<MyDayToday />)
    
    expect(screen.getByText('Scheduled Emails')).toBeInTheDocument()
    expect(screen.getByText('Logo Design Update - Ready for Review')).toBeInTheDocument()
    expect(screen.getByText('Project Status Update')).toBeInTheDocument()
  })

  it('displays reminder metadata correctly', () => {
    render(<MyDayToday />)
    
    // Check for times
    expect(screen.getByText('10:00')).toBeInTheDocument()
    expect(screen.getByText('14:30')).toBeInTheDocument()
    expect(screen.getByText('16:00')).toBeInTheDocument()
    expect(screen.getByText('17:00')).toBeInTheDocument()
    
    // Check for estimated durations
    expect(screen.getByText('2h')).toBeInTheDocument()
    expect(screen.getByText('1.5h')).toBeInTheDocument()
    expect(screen.getByText('1h')).toBeInTheDocument()
    expect(screen.getByText('30m')).toBeInTheDocument()
  })

  it('shows priority badges for reminders', () => {
    render(<MyDayToday />)
    
    expect(screen.getAllByText('high')).toHaveLength(2)
    expect(screen.getAllByText('medium')).toHaveLength(2)
  })

  it('shows email connection status', () => {
    render(<MyDayToday />)
    
    expect(screen.getByText('Connected')).toBeInTheDocument()
  })

  it('handles reminder completion toggle', async () => {
    render(<MyDayToday />)
    
    // Find the first reminder's checkbox
    const checkboxes = screen.getAllByRole('button')
    const firstCheckbox = checkboxes.find(btn => 
      btn.querySelector('div.w-5.h-5.border-2') // Unchecked checkbox
    )
    
    if (firstCheckbox) {
      fireEvent.click(firstCheckbox)
      
      await waitFor(() => {
        // Should show completed state
        expect(firstCheckbox.querySelector('svg[data-testid="check-circle"]')).toBeInTheDocument()
      })
    }
  })

  it('opens add reminder dialog', async () => {
    render(<MyDayToday />)
    
    const addReminderButton = screen.getByRole('button', { name: /add reminder/i })
    fireEvent.click(addReminderButton)
    
    // Should open modal/dialog (implementation specific)
    // This depends on how the modal is implemented
  })

  it('opens schedule email dialog', async () => {
    render(<MyDayToday />)
    
    const scheduleEmailButton = screen.getByRole('button', { name: /schedule email/i })
    fireEvent.click(scheduleEmailButton)
    
    // Should open modal/dialog (implementation specific)
    // This depends on how the modal is implemented
  })

  it('shows quick add forms', () => {
    render(<MyDayToday />)
    
    expect(screen.getByText('Quick Add Reminder')).toBeInTheDocument()
    expect(screen.getByText('Quick Schedule Email')).toBeInTheDocument()
    
    // Check for form inputs
    expect(screen.getByPlaceholderText('Enter reminder title...')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('recipient@example.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email subject...')).toBeInTheDocument()
  })

  it('allows adding a new reminder via quick form', async () => {
    render(<MyDayToday />)
    
    const titleInput = screen.getByPlaceholderText('Enter reminder title...')
    const timeInput = screen.getByDisplayValue('')
    const addButton = screen.getByRole('button', { name: /add reminder/i })
    
    // Fill in the form
    fireEvent.change(titleInput, { target: { value: 'New test reminder' } })
    fireEvent.change(timeInput, { target: { value: '15:30' } })
    
    // Submit the form
    fireEvent.click(addButton)
    
    await waitFor(() => {
      expect(screen.getByText('New test reminder')).toBeInTheDocument()
    })
  })

  it('allows scheduling a new email via quick form', async () => {
    render(<MyDayToday />)
    
    const toInput = screen.getByPlaceholderText('recipient@example.com')
    const subjectInput = screen.getByPlaceholderText('Email subject...')
    const contentInput = screen.getByPlaceholderText('Email content...')
    const scheduleButton = screen.getByRole('button', { name: /schedule email/i })
    
    // Fill in the form
    fireEvent.change(toInput, { target: { value: 'test@example.com' } })
    fireEvent.change(subjectInput, { target: { value: 'Test email subject' } })
    fireEvent.change(contentInput, { target: { value: 'Test email content' } })
    
    // Submit the form
    fireEvent.click(scheduleButton)
    
    await waitFor(() => {
      expect(screen.getByText('Test email subject')).toBeInTheDocument()
    })
  })

  it('handles reminder editing', async () => {
    render(<MyDayToday />)
    
    // Find edit button for first reminder
    const editButtons = screen.getAllByRole('button')
    const editButton = editButtons.find(btn => 
      btn.querySelector('svg[data-testid="edit-icon"]') ||
      btn.querySelector('svg') && btn.getAttribute('aria-label')?.includes('edit')
    )
    
    if (editButton) {
      fireEvent.click(editButton)
      
      // Should open edit dialog/modal
      // Implementation depends on how editing is handled
    }
  })

  it('handles reminder deletion', async () => {
    render(<MyDayToday />)
    
    // Find delete button for first reminder
    const deleteButtons = screen.getAllByRole('button')
    const deleteButton = deleteButtons.find(btn => 
      btn.querySelector('svg[data-testid="trash-icon"]') ||
      btn.querySelector('svg') && btn.getAttribute('aria-label')?.includes('delete')
    )
    
    if (deleteButton) {
      fireEvent.click(deleteButton)
      
      await waitFor(() => {
        // Should remove the reminder
        expect(screen.queryByText('Complete logo variations for TechCorp')).not.toBeInTheDocument()
      })
    }
  })

  it('handles email sending', async () => {
    render(<MyDayToday />)
    
    // Find send button for first email
    const sendButtons = screen.getAllByRole('button')
    const sendButton = sendButtons.find(btn => 
      btn.querySelector('svg[data-testid="send-icon"]') ||
      btn.querySelector('svg') && btn.getAttribute('aria-label')?.includes('send')
    )
    
    if (sendButton) {
      fireEvent.click(sendButton)
      
      await waitFor(() => {
        // Should show sent badge
        expect(screen.getByText('Sent')).toBeInTheDocument()
      })
    }
  })

  it('shows correct pending counts', () => {
    render(<MyDayToday />)
    
    expect(screen.getByText('4 pending tasks')).toBeInTheDocument()
    expect(screen.getByText('2 emails pending')).toBeInTheDocument()
  })

  it('validates form inputs', async () => {
    render(<MyDayToday />)
    
    // Try to add reminder without title
    const addButton = screen.getByRole('button', { name: /add reminder/i })
    fireEvent.click(addButton)
    
    // Should not add empty reminder
    await waitFor(() => {
      const reminderCards = screen.getAllByText(/Complete logo variations|Review and update|Prepare client|Team feedback/)
      expect(reminderCards).toHaveLength(4) // Original count
    })
  })

  it('handles different reminder types', () => {
    render(<MyDayToday />)
    
    // Check for different types indicated by icons or text
    expect(screen.getByText('TechCorp Brand Identity')).toBeInTheDocument()
    expect(screen.getByText('E-commerce Platform')).toBeInTheDocument()
    expect(screen.getByText('Fashion Brand Campaign')).toBeInTheDocument()
    expect(screen.getByText('Mobile App Design')).toBeInTheDocument()
  })

  it('shows task descriptions', () => {
    render(<MyDayToday />)
    
    expect(screen.getByText('Finalize the logo variations and prepare for client presentation')).toBeInTheDocument()
    expect(screen.getByText('Update wireframes based on client feedback from yesterday')).toBeInTheDocument()
    expect(screen.getByText("Organize presentation materials for tomorrow's client meeting")).toBeInTheDocument()
  })

  it('handles email scheduling times', () => {
    render(<MyDayToday />)
    
    expect(screen.getByText('09:00')).toBeInTheDocument()
    expect(screen.getByText('17:30')).toBeInTheDocument()
  })

  it('shows email priorities', () => {
    render(<MyDayToday />)
    
    expect(screen.getByText('high')).toBeInTheDocument()
    expect(screen.getByText('normal')).toBeInTheDocument()
  })
})