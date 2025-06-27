export const testProjects = {
  valid: {
    title: &apos;Test Project&apos;,
    description: &apos;Test project description&apos;,
    clientName: &apos;Test Client&apos;,
    clientEmail: &apos;client@test.com&apos;,
    budget: &apos;1000&apos;,
    startDate: &apos;2024-03-20&apos;,
    endDate: &apos;2024-04-20&apos;,
    priority: &apos;High&apos;,
    status: &apos;Active&apos;
  },
  highPriority: {
    title: &apos;High Priority Project&apos;,
    description: &apos;Test description&apos;,
    clientName: &apos;Test Client&apos;,
    clientEmail: &apos;client@test.com&apos;,
    budget: &apos;1000&apos;,
    startDate: &apos;2024-03-20&apos;,
    endDate: &apos;2024-04-20&apos;,
    priority: &apos;High&apos;,
    status: &apos;Active&apos;
  },
  lowPriority: {
    title: &apos;Low Priority Project&apos;,
    description: &apos;Test description&apos;,
    clientName: &apos;Test Client&apos;,
    clientEmail: &apos;client@test.com&apos;,
    budget: &apos;1000&apos;,
    startDate: &apos;2024-03-20&apos;,
    endDate: &apos;2024-04-20&apos;,
    priority: &apos;Low&apos;,
    status: &apos;Draft&apos;
  },
  forDeletion: {
    title: &apos;Project to Delete&apos;,
    description: &apos;Test description&apos;,
    clientName: &apos;Test Client&apos;,
    clientEmail: &apos;client@test.com&apos;,
    budget: &apos;1000&apos;,
    startDate: &apos;2024-03-20&apos;,
    endDate: &apos;2024-04-20&apos;,
    priority: &apos;Medium&apos;,
    status: &apos;Active&apos;
  },
  forNavigation: {
    title: &apos;Navigation Test Project&apos;,
    description: &apos;Test description&apos;,
    clientName: &apos;Test Client&apos;,
    clientEmail: &apos;client@test.com&apos;,
    budget: &apos;1000&apos;,
    startDate: &apos;2024-03-20&apos;,
    endDate: &apos;2024-04-20&apos;,
    priority: &apos;Medium&apos;,
    status: &apos;Active&apos;
  }
}

export const projectTemplates = {
  brandIdentity: {
    title: &apos;Brand Identity Design&apos;,
    description: &apos;Complete brand identity package including logo, color palette, typography, and brand guidelines&apos;,
    clientName: '&apos;,'
    clientEmail: '&apos;,'
    budget: &apos;2500&apos;,
    startDate: '&apos;,'
    endDate: '&apos;,'
    priority: &apos;High&apos;,
    status: &apos;Draft&apos;
  },
  webDesign: {
    title: &apos;Website Redesign&apos;,
    description: &apos;Modern website redesign with responsive layouts and improved user experience&apos;,
    clientName: '&apos;,'
    clientEmail: '&apos;,'
    budget: &apos;5000&apos;,
    startDate: '&apos;,'
    endDate: '&apos;,'
    priority: &apos;Medium&apos;,
    status: &apos;Draft&apos;
  },
  marketing: {
    title: &apos;Digital Marketing Campaign&apos;,
    description: &apos;Comprehensive digital marketing campaign including social media, email, and content strategy&apos;,
    clientName: '&apos;,'
    clientEmail: '&apos;,'
    budget: &apos;3000&apos;,
    startDate: '&apos;,'
    endDate: '&apos;,'
    priority: &apos;Medium&apos;,
    status: &apos;Draft&apos;
  }
}

export const invalidData = {
  missingRequired: {
    title: '&apos;,'
    description: '&apos;,'
    clientName: &apos;Test Client&apos;,
    clientEmail: &apos;client@test.com&apos;,
    budget: &apos;1000&apos;,
    startDate: &apos;2024-03-20&apos;,
    endDate: &apos;2024-04-20&apos;,
    priority: &apos;Medium&apos;,
    status: &apos;Active&apos;
  },
  invalidEmail: {
    title: &apos;Test Project&apos;,
    description: &apos;Test description&apos;,
    clientName: &apos;Test Client&apos;,
    clientEmail: &apos;invalid-email&apos;,
    budget: &apos;1000&apos;,
    startDate: &apos;2024-03-20&apos;,
    endDate: &apos;2024-04-20&apos;,
    priority: &apos;Medium&apos;,
    status: &apos;Active&apos;
  },
  invalidDates: {
    title: &apos;Test Project&apos;,
    description: &apos;Test description&apos;,
    clientName: &apos;Test Client&apos;,
    clientEmail: &apos;client@test.com&apos;,
    budget: &apos;1000&apos;,
    startDate: &apos;2024-04-20&apos;,
    endDate: &apos;2024-03-20&apos;, // End date before start date
    priority: &apos;Medium&apos;,
    status: &apos;Active&apos;
  }
} 