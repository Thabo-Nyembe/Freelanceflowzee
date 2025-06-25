export const testProjects = {
  valid: {
    title: 'Test Project',
    description: 'Test project description',
    clientName: 'Test Client',
    clientEmail: 'client@test.com',
    budget: '1000',
    startDate: '2024-03-20',
    endDate: '2024-04-20',
    priority: 'High',
    status: 'Active'
  },
  highPriority: {
    title: 'High Priority Project',
    description: 'Test description',
    clientName: 'Test Client',
    clientEmail: 'client@test.com',
    budget: '1000',
    startDate: '2024-03-20',
    endDate: '2024-04-20',
    priority: 'High',
    status: 'Active'
  },
  lowPriority: {
    title: 'Low Priority Project',
    description: 'Test description',
    clientName: 'Test Client',
    clientEmail: 'client@test.com',
    budget: '1000',
    startDate: '2024-03-20',
    endDate: '2024-04-20',
    priority: 'Low',
    status: 'Draft'
  },
  forDeletion: {
    title: 'Project to Delete',
    description: 'Test description',
    clientName: 'Test Client',
    clientEmail: 'client@test.com',
    budget: '1000',
    startDate: '2024-03-20',
    endDate: '2024-04-20',
    priority: 'Medium',
    status: 'Active'
  },
  forNavigation: {
    title: 'Navigation Test Project',
    description: 'Test description',
    clientName: 'Test Client',
    clientEmail: 'client@test.com',
    budget: '1000',
    startDate: '2024-03-20',
    endDate: '2024-04-20',
    priority: 'Medium',
    status: 'Active'
  }
}

export const projectTemplates = {
  brandIdentity: {
    title: 'Brand Identity Design',
    description: 'Complete brand identity package including logo, color palette, typography, and brand guidelines',
    clientName: '',
    clientEmail: '',
    budget: '2500',
    startDate: '',
    endDate: '',
    priority: 'High',
    status: 'Draft'
  },
  webDesign: {
    title: 'Website Redesign',
    description: 'Modern website redesign with responsive layouts and improved user experience',
    clientName: '',
    clientEmail: '',
    budget: '5000',
    startDate: '',
    endDate: '',
    priority: 'Medium',
    status: 'Draft'
  },
  marketing: {
    title: 'Digital Marketing Campaign',
    description: 'Comprehensive digital marketing campaign including social media, email, and content strategy',
    clientName: '',
    clientEmail: '',
    budget: '3000',
    startDate: '',
    endDate: '',
    priority: 'Medium',
    status: 'Draft'
  }
}

export const invalidData = {
  missingRequired: {
    title: '',
    description: '',
    clientName: 'Test Client',
    clientEmail: 'client@test.com',
    budget: '1000',
    startDate: '2024-03-20',
    endDate: '2024-04-20',
    priority: 'Medium',
    status: 'Active'
  },
  invalidEmail: {
    title: 'Test Project',
    description: 'Test description',
    clientName: 'Test Client',
    clientEmail: 'invalid-email',
    budget: '1000',
    startDate: '2024-03-20',
    endDate: '2024-04-20',
    priority: 'Medium',
    status: 'Active'
  },
  invalidDates: {
    title: 'Test Project',
    description: 'Test description',
    clientName: 'Test Client',
    clientEmail: 'client@test.com',
    budget: '1000',
    startDate: '2024-04-20',
    endDate: '2024-03-20', // End date before start date
    priority: 'Medium',
    status: 'Active'
  }
} 