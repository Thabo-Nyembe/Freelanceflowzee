import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { useCases, UseCaseSlug } from '@/data/use-cases';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateStaticParams() {
    return Object.keys(useCases).map((slug) => ({
        slug,
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const data = useCases[slug as UseCaseSlug];

    if (!data) {
        return {
            title: 'Use Case Not Found | KAZI',
        };
    }

    return {
        title: data.title,
        description: data.description,
    };
}

export default async function UseCasePage({ params }: PageProps) {
    const { slug } = await params;
    const data = useCases[slug as UseCaseSlug];

    if (!data) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            <AuroraBackground className="min-h-[70vh]">
                <div className="container relative z-10 px-4 md:px-6 pt-20">
                    <Link href="/features" className="inline-flex items-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-8 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Features
                    </Link>

                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <Badge className="mb-6 bg-blue-100 text-blue-700 border-none px-4 py-1.5 hover:bg-blue-200">
                                For {data.targetAudience}
                            </Badge>
                            <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white mb-6 leading-tight tracking-tight">
                                {data.heroTitle}
                            </h1>
                            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8 max-w-lg">
                                {data.heroSubtitle}
                            </p>
                            <div className="flex gap-4">
                                <Link href="/signup">
                                    <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30">
                                        Get Started
                                    </Button>
                                </Link>
                                <Link href="/demo-features">
                                    <Button variant="ghost" size="lg" className="h-14 px-8 text-lg rounded-full">
                                        Watch Demo
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Feature Stack */}
                        <div className="space-y-6">
                            {data.features.map((feature, idx) => (
                                <Card key={idx} className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl">
                                    <CardContent className="p-6 flex gap-4">
                                        <div className="shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white shadow-md">
                                            <feature.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </AuroraBackground>

            {/* Social Proof / Bottom Content */}
            <section className="py-24 bg-gray-50 dark:bg-gray-900">
                <div className="container px-4 text-center">
                    <h2 className="text-3xl font-bold mb-8">Why {data.targetAudience} Choose KAZI</h2>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Placeholder Logos */}
                        <span className="text-2xl font-bold">ACME Corp</span>
                        <span className="text-2xl font-bold">GlobalDesign</span>
                        <span className="text-2xl font-bold">VideoFlow</span>
                        <span className="text-2xl font-bold">WriteNow</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
