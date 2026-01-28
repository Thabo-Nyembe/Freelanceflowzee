import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { alternatives, CompetitorSlug } from '@/data/alternatives';
import { AlternativeLandingPage } from '@/components/templates/alternative-landing-page';

// Mapping from "kazi-vs-competitor" (URL) to "competitor-alternative" (Data Key)
const slugMapping: Record<string, CompetitorSlug> = {
    'kazi-vs-upwork': 'upwork-alternative',
    'kazi-vs-fiverr': 'fiverr-alternative',
    'kazi-vs-monday': 'monday-alternative',
    'kazi-vs-clickup': 'clickup-alternative',
    'kazi-vs-jasper': 'jasper-alternative',
};

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateStaticParams() {
    return Object.keys(slugMapping).map((slug) => ({
        slug,
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const dataKey = slugMapping[slug];
    const data = alternatives[dataKey];

    if (!data) {
        return {
            title: 'Comparison Not Found | KAZI',
        };
    }

    return {
        title: `KAZI vs ${data.competitorName} | The Better Choice`,
        description: data.description,
    };
}

export default async function ComparePage({ params }: PageProps) {
    const { slug } = await params;

    // Transform the slug
    const dataKey = slugMapping[slug];

    if (!dataKey) {
        notFound();
    }

    const data = alternatives[dataKey];

    if (!data) {
        notFound();
    }

    return <AlternativeLandingPage data={data} />;
}
