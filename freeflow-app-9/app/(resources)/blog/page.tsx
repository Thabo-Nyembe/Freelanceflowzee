import { Metadata } from 'next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Blog - FreeflowZee',
  description: 'Explore insights on AI creative tools, file sharing best practices, and tips for growing your creative business.',
  keywords: 'creative business blog, AI tools, file sharing tips, freelance advice, digital collaboration',
  openGraph: {
    title: 'Blog - FreeflowZee',
    description: 'Explore insights on AI creative tools, file sharing best practices, and tips for growing your creative business.',
    type: 'website',
    url: 'https://freeflowzee.com/blog'
  }
}

export default function BlogPage() {
  return (
    <div className="min-h-screen relative bg-slate-950">
      {/* Pattern Craft Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-950 -z-10" aria-hidden="true" />
      <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" aria-hidden="true"></div>
      <div className="absolute top-1/3 -right-4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000" aria-hidden="true"></div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" aria-hidden="true" />

      <main className="container mx-auto px-4 py-8 relative" role="main">
        <header className="mb-8" aria-labelledby="blog-heading">
          <h1 id="blog-heading" className="text-4xl font-bold mb-8 text-white">Blog</h1>
        </header>

        <section aria-label="Search articles">
          <form role="search" className="flex gap-4 mb-8">
            <Input
              type="search"
              placeholder="Search articles..."
              className="max-w-md bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-400"
              aria-label="Search articles"
            />
            <Button
              type="submit"
              aria-label="Submit search"
              className="bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Search
            </Button>
          </form>
        </section>

        <section aria-labelledby="articles-heading">
          <h2 id="articles-heading" className="sr-only">Blog articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
            {/* Blog posts will be populated here */}
            <article className="p-6 border border-slate-700 rounded-lg bg-slate-800/30 backdrop-blur-sm" role="listitem">
              <h3 className="text-2xl font-semibold mb-4 text-white">Coming Soon</h3>
              <p className="text-gray-300">Stay tuned for exciting articles about AI tools, creative business tips, and more!</p>
            </article>
          </div>
        </section>
      </main>
    </div>
  )
}

