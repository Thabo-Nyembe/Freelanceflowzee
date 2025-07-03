import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProjectView from '@/components/projects/project-view'

type ProjectPageProps = {
  params: {
    slug: string
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const supabase = await createClient()

  if (!supabase) {
    // TODO: Handle this case more gracefully
    return <div>Database connection error.</div>
  }

  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.slug)
    .single()

  if (error || !project) {
    notFound()
  }

  return <ProjectView project={project} />
}
