import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import FAQClient from './faq-client'

export const dynamic = 'force-dynamic'

export default async function FAQPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  let faqs: any[] = []
  let stats = {
    total: 0,
    published: 0,
    draft: 0,
    review: 0,
    archived: 0,
    totalViews: 0,
    totalHelpful: 0,
    avgHelpfulness: 0
  }

  if (user) {
    const { data: faqsData } = await supabase
      .from('faqs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (faqsData) {
      faqs = faqsData

      const totalHelpful = faqsData.reduce((sum, f) => sum + (f.helpful_count || 0), 0)
      const totalNotHelpful = faqsData.reduce((sum, f) => sum + (f.not_helpful_count || 0), 0)
      const total = totalHelpful + totalNotHelpful

      stats = {
        total: faqsData.length,
        published: faqsData.filter(f => f.status === 'published').length,
        draft: faqsData.filter(f => f.status === 'draft').length,
        review: faqsData.filter(f => f.status === 'review').length,
        archived: faqsData.filter(f => f.status === 'archived').length,
        totalViews: faqsData.reduce((sum, f) => sum + (f.views_count || 0), 0),
        totalHelpful,
        avgHelpfulness: total > 0 ? Math.round((totalHelpful / total) * 100) : 0
      }
    }
  }

  return <FAQClient initialFAQs={faqs} initialStats={stats} />
}
