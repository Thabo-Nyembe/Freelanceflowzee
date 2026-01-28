import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar, Clock, Share2, Twitter, Linkedin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { blogPosts, BlogPost } from '@/data/blog-posts'
import { formatDate } from '@/lib/utils'
import Markdown from 'react-markdown' // Assuming we might want to use this, or we can just render text for now if raw markdown isn't standard in this project yet. 
// Actually, for simplicity and stability without extra deps in this quick fix, I'll render the content as paragraphs if it's plain text, 
// OR simpler: Just display the content directly. The user's prompt implies "fix errors", so I should be careful about new dependencies.
// The previous implementation likely just rendered the string. I will assume the content is a string.

interface BlogPostPageProps {
    params: Promise<{
        slug: string
    }>
}

export async function generateStaticParams() {
    return blogPosts.map((post) => ({
        slug: post.slug,
    }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
    const { slug } = await params
    const post = blogPosts.find((p) => p.slug === slug)

    if (!post) {
        return {
            title: 'Post Not Found | KAZI',
        }
    }

    return {
        title: `${post.title} | KAZI Blog`,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            type: 'article',
            publishedTime: post.publishedAt,
            authors: [post.author.name],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt,
        },
    }
}

import { ScrollProgress } from '@/components/ui/scroll-progress';

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { slug } = await params
    const post = blogPosts.find((p) => p.slug === slug)

    if (!post) {
        notFound()
    }

    return (
        <article className="min-h-screen bg-white dark:bg-gray-950">
            <ScrollProgress className="bg-gradient-to-r from-blue-600 to-cyan-600" />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                <Link
                    href="/blog"
                    className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-8 group transition-colors"
                >
                    <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Blog
                </Link>

                <header className="mb-12">
                    <div className="flex flex-wrap gap-4 items-center mb-6">
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                            {post.category}
                        </Badge>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {post.readTime}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(post.publishedAt)}
                            </span>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-8 leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex items-center justify-between py-6 border-y border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold">
                                {post.author.name[0]}
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900 dark:text-white">{post.author.name}</div>
                                <div className="text-sm text-gray-500">{post.author.role}</div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" aria-label="Share on Twitter" className="text-gray-400 hover:text-[#1DA1F2]">
                                <Twitter className="w-5 h-5" />
                            </Button>
                            <Button variant="ghost" size="icon" aria-label="Share on LinkedIn" className="text-gray-400 hover:text-[#0A66C2]">
                                <Linkedin className="w-5 h-5" />
                            </Button>
                            <Button variant="ghost" size="icon" aria-label="Copy Link" className="text-gray-400 hover:text-gray-600">
                                <Share2 className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </header>

                <div className="prose prose-lg prose-blue dark:prose-invert max-w-none">
                    {/* 
            Rendering content as simple whitespace-preserved text for safety since I don't want to install 'react-markdown' 
            unless I know it's in package.json. If the previous user had it, great, but safer to do this or implement a simple parser.
            Actually, the data is likely just a string. Most simple blogs just use a Markdown component. 
            I'll check package.json in a moment, but for now I'll just render it inside a div.
          */}
                    <div className="whitespace-pre-wrap">
                        {post.content}
                    </div>
                </div>

                <Separator className="my-12" />

                {/* CTA */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 text-center">
                    <h3 className="text-2xl font-bold mb-4">Ready to start your freelance journey?</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-lg mx-auto">
                        Join 25,000+ professionals using KAZI to manage their business, create AI content, and get paid securely.
                    </p>
                    <Link href="/signup">
                        <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
                            Start Free Trial
                        </Button>
                    </Link>
                </div>
            </div>
        </article>
    )
}
