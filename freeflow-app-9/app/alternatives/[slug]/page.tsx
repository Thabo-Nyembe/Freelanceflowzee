import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { alternatives, CompetitorSlug } from '@/data/alternatives';
import { AlternativeLandingPage } from '@/components/templates/alternative-landing-page';

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateStaticParams() {
    return Object.keys(alternatives).map((slug) => ({
        slug,
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const data = alternatives[slug as CompetitorSlug];

    if (!data) {
        return {
            title: 'Alternative Not Found | KAZI',
        };
    }

    return {
        title: data.title,
        description: data.description,
    };
}

export default async function AlternativePage({ params }: PageProps) {
    const { slug } = await params;
    const data = alternatives[slug as CompetitorSlug];

    if (!data) {
        notFound();
    }

    return <AlternativeLandingPage data={data} />;
}
