'use client'

import Head from 'next/head'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function BlogPage() {
  return (
    <>
      <Head>
        <title>Blog - FreeflowZee</title>
        <meta name="description" content="Explore insights on AI creative tools, file sharing best practices, and tips for growing your creative business." />
        <meta name="keywords" content="creative business blog, AI tools, file sharing tips, freelance advice, digital collaboration" />
        <meta property="og:title" content="Blog - FreeflowZee" />
        <meta property="og:description" content="Explore insights on AI creative tools, file sharing best practices, and tips for growing your creative business." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://freeflowzee.com/blog" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "FreeflowZee Blog",
            "description": "Explore insights on AI creative tools, file sharing best practices, and tips for growing your creative business.",
            "url": "https://freeflowzee.com/blog"
          })
        }} />
      </Head>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Blog</h1>
        <div className="flex gap-4 mb-8">
          <Input 
            type="search" 
            placeholder="Search articles..." 
            className="max-w-md"
          />
          <Button>Search</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Blog posts will be populated here */}
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
            <p className="text-gray-600">Stay tuned for exciting articles about AI tools, creative business tips, and more!</p>
          </div>
        </div>
      </main>
    </>
  )
}

