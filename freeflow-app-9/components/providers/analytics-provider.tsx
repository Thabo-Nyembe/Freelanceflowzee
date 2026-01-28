'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'
import Script from 'next/script'

type Props = {
  children: React.ReactNode
}

function AnalyticsTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname) {
      // Logic to track page view
      console.log(`[Analytics] Page viewed: ${pathname}`)

      // Example: window.gtag('config', 'GA_MEASUREMENT_ID', { page_path: pathname })
    }
  }, [pathname, searchParams])

  return null
}

export function AnalyticsProvider({ children }: Props) {
  return (
    <>
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>

      {/* Google Analytics 4 */}
      {/* 
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      */}

      {/* Microsoft Clarity - only load if ID is configured */}
      {process.env.NEXT_PUBLIC_CLARITY_ID && (
        <Script id="clarity-script" strategy="afterInteractive">
          {`
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_ID}");
          `}
        </Script>
      )}

      {children}
    </>
  )
}