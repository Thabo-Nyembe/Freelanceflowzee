import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import DocumentationClient from './documentation-client'

export const dynamic = 'force-dynamic'

async function getDocumentation() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { docs: [], stats: { total: 0, published: 0, draft: 0, review: 0, totalViews: 0, avgHelpfulRate: 0 } }
  }

  const { data: docs, error } = await supabase
    .from('documentation')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching documentation:', error)
    return { docs: [], stats: { total: 0, published: 0, draft: 0, review: 0, totalViews: 0, avgHelpfulRate: 0 } }
  }

  const docList = docs || []
  const totalHelpful = docList.reduce((sum, d) => sum + (d.helpful_count || 0), 0)
  const totalNotHelpful = docList.reduce((sum, d) => sum + (d.not_helpful_count || 0), 0)

  const stats = {
    total: docList.length,
    published: docList.filter(d => d.status === 'published').length,
    draft: docList.filter(d => d.status === 'draft').length,
    review: docList.filter(d => d.status === 'review').length,
    totalViews: docList.reduce((sum, d) => sum + (d.views_count || 0), 0),
    avgHelpfulRate: (totalHelpful + totalNotHelpful) > 0
      ? (totalHelpful / (totalHelpful + totalNotHelpful)) * 100
      : 0
  }

  return { docs: docList, stats }
}

export default async function DocumentationPage() {
  const { docs, stats } = await getDocumentation()
  return <DocumentationClient initialDocs={docs} initialStats={stats} />
}
