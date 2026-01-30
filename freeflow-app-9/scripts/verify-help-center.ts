/**
 * Verify Help Center data in database
 */
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verify() {
  const { data: categories } = await supabase
    .from('help_categories')
    .select('name, slug, status')
    .order('sort_order')

  const { data: articles } = await supabase
    .from('help_articles')
    .select('title, slug, category, status')
    .order('created_at')

  console.log('=== Help Center Data Verification ===\n')

  console.log('Categories:', categories?.length || 0)
  categories?.forEach(c => console.log('  -', c.name, '(' + c.slug + ')'))

  console.log('\nArticles:', articles?.length || 0)
  articles?.forEach(a => console.log('  -', a.title, '[' + a.category + ']'))
}

verify()
