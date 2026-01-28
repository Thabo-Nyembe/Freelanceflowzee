import { Metadata } from 'next';
import { HeroBeam } from '@/components/marketing/hero-beam';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import { MagneticButton } from '@/components/ui/magnetic-button';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
    Zap,
    Shield,
    Video,
    Globe,
    DollarSign,
    Palette,
    Briefcase,
    Layout,
    Users,
    Cpu,
    Lock,
    Cloud
} from 'lucide-react';

export const metadata: Metadata = {
    title: "Features | KAZI - All-in-One Freelance Platform",
    description: "Explore the powerful features that make KAZI the ultimate workspace for freelancers: AI content creation, secure escrow payments, client portals, and more.",
};

const features = [
    {
        title: "AI Content Studio",
        description: "Access GPT-4o, Claude 3.5, and DALL-E 3 in one integrated workspace. Generate blogs, emails, and images without switching tabs.",
        header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100 items-center justify-center text-6xl">🤖</div>,
        icon: <Cpu className="h-4 w-4 text-neutral-500" />,
        className: "md:col-span-2",
    },
    {
        title: "Secure Escrow Payments",
        description: "Get paid safely. Funds are held in escrow until milestones are met. No more chasing invoices or non-paying clients.",
        header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-green-100 dark:from-green-900/20 dark:to-neutral-800 to-neutral-100 items-center justify-center text-6xl">🛡️</div>,
        icon: <Shield className="h-4 w-4 text-neutral-500" />,
        className: "md:col-span-1",
    },
    {
        title: "Professional Client Portals",
        description: "Impress clients with white-labeled portals. Share files, get approvals, and showcase your work in a branded environment.",
        header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-blue-100 dark:from-blue-900/20 dark:to-neutral-800 to-neutral-100 items-center justify-center text-6xl">💼</div>,
        icon: <Layout className="h-4 w-4 text-neutral-500" />,
        className: "md:col-span-1",
    },
    {
        title: "Video Collaboration",
        description: "Record screen & camera, get frame-accurate feedback, and transcribe meetings automatically with AI.",
        header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-purple-100 dark:from-purple-900/20 dark:to-neutral-800 to-neutral-100 items-center justify-center text-6xl">🎥</div>,
        icon: <Video className="h-4 w-4 text-neutral-500" />,
        className: "md:col-span-2",
    },
    {
        title: "Global Payments",
        description: "Accept payments in 135+ currencies. KAZI handles the compliance and payout logic for you.",
        header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-yellow-100 dark:from-yellow-900/20 dark:to-neutral-800 to-neutral-100 items-center justify-center text-6xl">🌍</div>,
        icon: <Globe className="h-4 w-4 text-neutral-500" />,
        className: "md:col-span-1",
    },
    {
        title: "100GB Cloud Storage",
        description: "Store all your project files securely. Cheaper (and smarter) than Dropbox or Google Drive.",
        header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-gray-100 dark:from-gray-800 dark:to-neutral-800 to-neutral-100 items-center justify-center text-6xl">☁️</div>,
        icon: <Cloud className="h-4 w-4 text-neutral-500" />,
        className: "md:col-span-1",
    },
    {
        title: "Universal Feedback",
        description: "Pinpoint comments on images, PDFs, videos, and live websites. Stop the 'make the logo bigger' email chains.",
        header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-red-100 dark:from-red-900/20 dark:to-neutral-800 to-neutral-100 items-center justify-center text-6xl">💬</div>,
        icon: <Users className="h-4 w-4 text-neutral-500" />,
        className: "md:col-span-1",
    },
    {
        title: "Project Management",
        description: "Tasks, Kanban boards, and timelines. Everything you need to manage complex projects without the clutter.",
        header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-indigo-100 dark:from-indigo-900/20 dark:to-neutral-800 to-neutral-100 items-center justify-center text-6xl">📊</div>,
        icon: <Briefcase className="h-4 w-4 text-neutral-500" />,
        className: "md:col-span-1",
    },
];

import { ScrollProgress } from '@/components/ui/scroll-progress';
import { SiteFooter } from '@/components/marketing/site-footer';

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <ScrollProgress className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

            {/* Hero Section */}
            <HeroBeam className="h-[60vh] min-h-[500px]">
                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-20">
                    <Badge className="mb-6 bg-purple-100 text-purple-700 hover:bg-purple-200 border-none px-4 py-1.5 text-sm font-medium dark:bg-purple-900/30 dark:text-purple-300">
                        Feature Rich. Wallet Friendly.
                    </Badge>
                    <h1 className="text-4xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-300 mb-8 tracking-tight">
                        More Features. Less Cost. <br /> Zero Compromises.
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed mb-10">
                        Stop paying for Monday.com, Jasper, Loom, and Dropbox separately. KAZI handles your entire freelance workflow in one premium workspace.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/signup">
                            <MagneticButton>
                                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white h-12 px-8 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all">
                                    Start Free Trial
                                </Button>
                            </MagneticButton>
                        </Link>
                        <Link href="/demo-features">
                            <Button variant="outline" size="lg" className="h-12 px-8 text-lg rounded-full border-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                                See Live Demo
                            </Button>
                        </Link>
                    </div>
                </div>
            </HeroBeam>

            {/* Main Features Grid */}
            <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto -mt-20 relative z-20">
                <BentoGrid className="mx-auto">
                    {features.map((item, i) => (
                        <BentoGridItem
                            key={i}
                            title={item.title}
                            description={item.description}
                            header={item.header}
                            icon={item.icon}
                            className={item.className}
                        />
                    ))}
                </BentoGrid>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to upgrade your workflow?</h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                        Join thousands of freelancers who have switched to KAZI.
                    </p>
                    <Link href="/signup">
                        <Button size="lg" className="bg-gray-900 text-white dark:bg-white dark:text-gray-900 h-14 px-10 text-xl rounded-full">
                            Get Started for Free
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Architectural Footer */}
            <SiteFooter />
        </div>
    );
}
