import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import HelpDocsClient from './help-docs-client'
import { HelpDoc, HelpDocsStats } from '@/lib/hooks/use-help-docs'

export const dynamic = 'force-dynamic'

export default async function HelpDocsPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  let docs: HelpDoc[] = []
  let stats: HelpDocsStats = {
    total: 0,
    published: 0,
    draft: 0,
    review: 0,
    totalViews: 0,
    avgHelpfulness: 0
  }

  if (user) {
    const { data } = await supabase
      .from('help_docs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) {
      docs = data as HelpDoc[]

      const published = docs.filter(d => d.status === 'published').length
      const draft = docs.filter(d => d.status === 'draft').length
      const review = docs.filter(d => d.status === 'review').length
      const totalViews = docs.reduce((sum, d) => sum + (d.views_count || 0), 0)
      const avgHelpfulness = docs.length > 0
        ? docs.reduce((sum, d) => {
            const total = (d.helpful_count || 0) + (d.not_helpful_count || 0)
            return sum + (total > 0 ? (d.helpful_count || 0) / total : 0)
          }, 0) / docs.length * 100
        : 0

      stats = {
        total: docs.length,
        published,
        draft,
        review,
        totalViews,
        avgHelpfulness
      }
    }
  }

  return <HelpDocsClient initialDocs={docs} initialStats={stats} />
}
