interface Project {
  id: string
  title: string
  description: string
  status: &apos;active&apos; | &apos;completed&apos; | &apos;archived&apos; | &apos;draft&apos;
  priority: &apos;low&apos; | &apos;medium&apos; | &apos;high&apos;
  budget: number
  spent: number
  client_name: string
  client_email: string
  start_date: string
  end_date: string
  progress: number
  team_members: {
    id: string
    name: string
    avatar: string
  }[]
  attachments: {
    id: string
    name: string
    url: string
  }[]
  comments_count: number
  created_at: string
  updated_at: string
}

declare global {
  interface Window {
    __TEST_PROJECTS__: Project[]
    __TEST_PROJECT_UPDATE__: {
      id: string
      progress: number
      status: Project[&apos;status&apos;]
    }
    __TEST_HYDRATION_MISMATCH__: {
      server: Project[]
      client: Project[]
    }
    __HYDRATION_TEST_COMPONENT__: string
  }
} 