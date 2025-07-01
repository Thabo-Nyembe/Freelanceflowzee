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
  )
}

