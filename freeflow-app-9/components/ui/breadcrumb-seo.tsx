import { BreadcrumbList, WithContext, ListItem } from 'schema-dts'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export interface BreadcrumbItem {
    name: string
    url: string
}

export interface BreadcrumbProps {
    items: BreadcrumbItem[]
}

export function BreadcrumbJsonLd({ items }: BreadcrumbProps) {
    const breadcrumbList: WithContext<BreadcrumbList> = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `https://kazi.app${item.url}`
        }))
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList) }}
        />
    )
}

export function Breadcrumbs({ items }: BreadcrumbProps) {
    return (
        <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <li>
                    <Link href="/" className="hover:text-blue-600 transition-colors">
                        Home
                    </Link>
                </li>
                {items.map((item, index) => (
                    <li key={item.url} className="flex items-center">
                        <ChevronRight className="w-4 h-4 mx-1" aria-hidden="true" />
                        {index === items.length - 1 ? (
                            <span className="font-medium text-gray-900 dark:text-gray-200" aria-current="page">
                                {item.name}
                            </span>
                        ) : (
                            <Link href={item.url} className="hover:text-blue-600 transition-colors">
                                {item.name}
                            </Link>
                        )}
                    </li>
                ))}
            </ol>
            <BreadcrumbJsonLd items={items} />
        </nav>
    )
}
