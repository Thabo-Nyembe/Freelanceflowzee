import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { blogPosts } from "@/data/blog-posts";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
    title: "Blog | KAZI - Freelancing Tips & Industry Insights",
    description: "Expert advice on freelancing, AI tools, project management, and growing your agency business.",
};

export default function BlogListingPage() {
    const featuredPost = blogPosts[0];
    const regularPosts = blogPosts.slice(1);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Hero Section */}
            <AuroraBackground className="h-[50vh] min-h-[400px]">
                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-20">
                    <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200 border-none px-4 py-1.5 text-sm font-medium">
                        KAZI Blog
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 mb-6 tracking-tight">
                        Insights for the Modern Builder
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                        Resources, guides, and strategies to help you scale your freelance business with AI and automation.
                    </p>
                </div>
            </AuroraBackground>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 -mt-20 relative z-20">
                {/* Featured Post */}
                {featuredPost && (
                    <Link href={`/blog/${featuredPost.slug}`} className="block group mb-16">
                        <Card className="overflow-hidden border-2 border-transparent hover:border-blue-500/20 transition-all duration-300 shadow-2xl bg-white dark:bg-gray-900">
                            <div className="grid md:grid-cols-2 gap-8 p-8 items-center">
                                <div className="aspect-video relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                                    <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10`} />
                                    {/* Placeholder for actual image integration later */}
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                        <span className="text-4xl">📝</span>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                                            {featuredPost.category}
                                        </Badge>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {featuredPost.readTime}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {formatDate(featuredPost.publishedAt)}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                        {featuredPost.title}
                                    </h2>
                                    <p className="text-lg text-gray-600 dark:text-gray-300 line-clamp-3">
                                        {featuredPost.excerpt}
                                    </p>
                                    <div className="flex items-center justify-between pt-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                                {featuredPost.author.name[0]}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">{featuredPost.author.name}</p>
                                                <p className="text-sm text-gray-500">{featuredPost.author.role}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" className="group-hover:translate-x-1 transition-transform">
                                            Read Article <ArrowRight className="ml-2 w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Link>
                )}

                {/* Regular Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {regularPosts.map((post) => (
                        <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
                            <Card className="h-full hover:shadow-xl transition-all duration-300 border-gray-200 dark:border-gray-800 hover:border-blue-500/50">
                                <CardHeader>
                                    <div className="flex items-center justify-between mb-4">
                                        <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                                            {post.category}
                                        </Badge>
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {post.readTime}
                                        </span>
                                    </div>
                                    <CardTitle className="text-xl font-bold group-hover:text-blue-600 transition-colors">
                                        {post.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="line-clamp-3 mb-6">
                                        {post.excerpt}
                                    </CardDescription>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 pb-4">
                                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                                            {post.author.name[0]}
                                        </div>
                                        <span>{post.author.name}</span>
                                        <span className="mx-1">•</span>
                                        <span>{formatDate(post.publishedAt)}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
