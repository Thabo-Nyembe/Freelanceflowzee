import { SoftwareApplication, WithContext } from 'schema-dts'

export function OrganizationJsonLd() {
    const jsonLd: WithContext<SoftwareApplication> = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'KAZI',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web application',
        url: 'https://kazi.app',
        image: 'https://kazi.app/kazi-brand/glyph-dark.png',
        description: 'All-in-one freelance management platform with AI content creation, video studio, and secure escrow payments.',
        offers: {
            '@type': 'Offer',
            price: '29.00',
            priceCurrency: 'USD',
            priceValidUntil: '2025-12-31',
            availability: 'https://schema.org/InStock'
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.9',
            ratingCount: '25000'
        },
        author: {
            '@type': 'Organization',
            name: 'KAZI',
            url: 'https://kazi.app'
        }
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    )
}
