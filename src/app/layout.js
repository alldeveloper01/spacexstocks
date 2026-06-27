export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'SpaceX Stocks — Private Investment Access',
  description: 'Managed SpaceX portfolio. Weekly returns. Exclusive member perks. Invitation only.',
  metadataBase: new URL('https://www.spacestocks.finance'),
  openGraph: {
    title: 'SpaceX Stocks — Private Investment Access',
    description: 'Managed SpaceX portfolio. Weekly returns. Exclusive member perks.',
    url: 'https://www.spacestocks.finance',
    siteName: 'SpaceX Stocks',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SpaceX Stocks',
    description: 'Private SpaceX investment access. Weekly returns.',
    images: ['/og-image.jpg'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FinancialService',
              name: 'SpaceX Stocks',
              url: 'https://www.spacestocks.finance',
              description: 'Private managed SpaceX investment platform with weekly returns.',
              email: 'invest@spacestocks.finance',
            }),
          }}
        />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#000', color: '#fff', fontFamily: "'Courier New', monospace" }}>
        {children}
      </body>
    </html>
  )
}
