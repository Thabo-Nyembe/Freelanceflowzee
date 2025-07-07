// import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SupabaseProvider } from '../../__mocks__/supabase-provider'
import { ThemeProvider } from '../../__mocks__/theme-provider'
import Portfolio from '../../components/portfolio/portfolio'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const Providers = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <SupabaseProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </SupabaseProvider>
  </QueryClientProvider>
)

describe('Portfolio', () => {
  it('renders without crashing', () => {
    render(
      <Providers>
        <Portfolio />
      </Providers>
    )
    expect(screen.getByText('My Portfolio')).toBeInTheDocument()
  })

  it('displays portfolio sections', () => {
    render(
      <Providers>
        <Portfolio />
      </Providers>
    )
    expect(screen.getByTestId('about-section')).toBeInTheDocument()
    expect(screen.getByTestId('skills-section')).toBeInTheDocument()
    expect(screen.getByTestId('projects-section')).toBeInTheDocument()
  })

  it('allows editing about section', async () => {
    render(
      <Providers>
        <Portfolio />
      </Providers>
    )
    
    const editButton = screen.getByTestId('edit-about-button')
    fireEvent.click(editButton)
    
    const aboutInput = screen.getByTestId('about-input')
    fireEvent.change(aboutInput, { target: { value: 'New about text' } })
    
    const saveButton = screen.getByTestId('save-about-button')
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(screen.getByText('New about text')).toBeInTheDocument()
      expect(screen.getByText('Changes saved!')).toBeInTheDocument()
    })
  })

  it('allows adding skills', async () => {
    render(
      <Providers>
        <Portfolio />
      </Providers>
    )
    
    const addSkillButton = screen.getByTestId('add-skill-button')
    fireEvent.click(addSkillButton)
    
    const skillNameInput = screen.getByTestId('skill-name-input')
    const skillLevelInput = screen.getByTestId('skill-level-input')
    
    fireEvent.change(skillNameInput, { target: { value: 'React' } })
    fireEvent.change(skillLevelInput, { target: { value: 'Expert' } })
    
    const saveSkillButton = screen.getByTestId('save-skill-button')
    fireEvent.click(saveSkillButton)
    
    await waitFor(() => {
      expect(screen.getByText('React')).toBeInTheDocument()
      expect(screen.getByText('Expert')).toBeInTheDocument()
    })
  })

  it('allows adding projects', async () => {
    render(
      <Providers>
        <Portfolio />
      </Providers>
    )
    
    const addProjectButton = screen.getByTestId('add-project-button')
    fireEvent.click(addProjectButton)
    
    const projectTitleInput = screen.getByTestId('project-title-input')
    const projectDescriptionInput = screen.getByTestId('project-description-input')
    const projectLinkInput = screen.getByTestId('project-link-input')
    
    fireEvent.change(projectTitleInput, { target: { value: 'E-commerce Site' } })
    fireEvent.change(projectDescriptionInput, { target: { value: 'A full-stack e-commerce website' } })
    fireEvent.change(projectLinkInput, { target: { value: 'https://example.com' } })
    
    const saveProjectButton = screen.getByTestId('save-project-button')
    fireEvent.click(saveProjectButton)
    
    await waitFor(() => {
      expect(screen.getByText('E-commerce Site')).toBeInTheDocument()
      expect(screen.getByText('A full-stack e-commerce website')).toBeInTheDocument()
    })
  })

  it('allows uploading portfolio images', async () => {
    render(
      <Providers>
        <Portfolio />
      </Providers>
    )
    
    const addProjectButton = screen.getByTestId('add-project-button')
    fireEvent.click(addProjectButton)
    
    const uploadButton = screen.getByTestId('upload-image-button')
    const file = new File(['test'], 'test.png', { type: 'image/png' })
    
    Object.defineProperty(uploadButton, 'files', {
      value: [file]
    })
    
    fireEvent.change(uploadButton)
    
    await waitFor(() => {
      expect(screen.getByText('Image uploaded successfully!')).toBeInTheDocument()
    })
  })

  it('allows reordering portfolio sections', async () => {
    render(
      <Providers>
        <Portfolio />
      </Providers>
    )
    
    const moveUpButton = screen.getByTestId('move-skills-up')
    fireEvent.click(moveUpButton)
    
    const sections = screen.getAllByTestId(/section$/)
    expect(sections[0]).toHaveTextContent('Skills')
  })

  it('validates form inputs', async () => {
    render(
      <Providers>
        <Portfolio />
      </Providers>
    )
    
    const addProjectButton = screen.getByTestId('add-project-button')
    fireEvent.click(addProjectButton)
    
    const saveProjectButton = screen.getByTestId('save-project-button')
    fireEvent.click(saveProjectButton)
    
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument()
      expect(screen.getByText('Description is required')).toBeInTheDocument()
    })
  })
}) 