import { HeroBeam } from '@/components/marketing/hero-beam';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Check, X, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CompetitorAlternative } from '@/data/alternatives';
import { SiteFooter } from '@/components/marketing/site-footer';

interface AlternativeLandingPageProps {
    data: CompetitorAlternative;
}

export function AlternativeLandingPage({ data }: AlternativeLandingPageProps) {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            {/* SEO Header */}
            <HeroBeam className="h-[60vh] min-h-[500px]">
                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-20">
                    <Badge className="mb-6 bg-red-100 text-red-700 hover:bg-red-200 border-none px-4 py-1.5 text-sm font-medium dark:bg-red-900/30 dark:text-red-300">
                        Why settle for {data.competitorName}?
                    </Badge>
                    <h1 className="text-4xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 mb-6 tracking-tight">
                        {data.heroTitle}
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-200 max-w-3xl mx-auto font-medium">
                        {data.heroSubtitle}
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/signup">
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-8 text-lg rounded-full shadow-lg">
                                Start Your Free Trial
                            </Button>
                        </Link>
                        <Link href="/pricing">
                            <Button variant="outline" size="lg" className="h-12 px-8 text-lg rounded-full">
                                View Pricing
                            </Button>
                        </Link>
                    </div>
                </div>
            </HeroBeam>

            {/* Comparison Table */}
            <section className="py-20 px-4 max-w-7xl mx-auto -mt-20 relative z-20">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="grid grid-cols-3 bg-gray-50 dark:bg-gray-800 p-6 font-bold text-lg md:text-xl border-b border-gray-200 dark:border-gray-700">
                        <div className="text-gray-500">Feature</div>
                        <div className="text-blue-600 text-center flex items-center justify-center gap-2">
                            <Sparkles className="w-5 h-5 fill-blue-600" /> KAZI
                        </div>
                        <div className="text-gray-500 text-center">{data.competitorName}</div>
                    </div>
                    <div>
                        {data.comparison.map((item, i) => (
                            <div key={i} className="grid grid-cols-3 p-6 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors items-center">
                                <div className="font-medium text-gray-900 dark:text-white">
                                    {item.feature}
                                    <div className="text-xs font-normal text-gray-500 mt-1 md:hidden">{item.kaziDetail}</div>
                                </div>
                                <div className="text-center font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 py-2 rounded-lg mx-2 flex flex-col justify-center items-center">
                                    {item.kazi}
                                    <div className="text-xs font-normal text-blue-600/80 mt-1 hidden md:block">{item.kaziDetail}</div>
                                </div>
                                <div className="text-center text-gray-500 flex flex-col justify-center items-center">
                                    {item.competitor}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Key Benefits */}
            <section className="py-20 px-4 max-w-7xl mx-auto">
                <div className="grid md:grid-cols-3 gap-8">
                    {data.features.map((feature, idx) => (
                        <Card key={idx} className="border-none shadow-lg hover:shadow-xl transition-all bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800/50">
                            <CardHeader>
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 dark:text-gray-300">
                                    {feature.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Migration Banner */}
            <section className="py-12 px-4">
                <div className="max-w-5xl mx-auto bg-gray-900 dark:bg-blue-950 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-4">Ready to switch from {data.competitorName}?</h2>
                        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                            We'll separate your data and import your active projects so you don't miss a beat.
                        </p>
                        <Link href="/signup">
                            <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 h-14 px-10 text-lg rounded-full">
                                Make the Switch <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                        <p className="mt-4 text-sm text-gray-500">Free migration included in Pro & Enterprise plans.</p>
                    </div>
                </div>
            </section>

            {/* Architectural Footer */}
            <SiteFooter />
        </div>
    );
}
