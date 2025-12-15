import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import SocialMediaClient from './social-media-client'

export const dynamic = 'force-dynamic'

export default async function SocialMediaV2Page() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  let posts: any[] = []
  let accounts: any[] = []

  if (user) {
    const [postsResult, accountsResult] = await Promise.all([
      supabase
        .from('social_posts')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
    ])

    posts = postsResult.data || []
    accounts = accountsResult.data || []
  }

  return <SocialMediaClient initialPosts={posts} initialAccounts={accounts} />
}
