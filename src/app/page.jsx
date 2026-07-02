import { readFileSync } from 'fs'
import { join } from 'path'

export const metadata = {
  title: 'SpaceX Stocks — Private Investment Access',
  description: 'A private managed investment platform trading SpaceX, Tesla, Starlink and X Corp. Weekly returns paid out. Exclusive member perks. Invitation only.',
  metadataBase: new URL('https://www.spacestocks.finance'),
  openGraph: {
    title: 'SpaceX Stocks — Private Investment Access',
    description: 'Weekly returns. Exclusive perks. Invitation only.',
    url: 'https://www.spacestocks.finance',
    siteName: 'SpaceX Stocks',
    type: 'website',
    images: [{ url: 'https://www.spacestocks.finance/spacex_stocks_og_image.jpg', width: 1200, height: 630, alt: 'SpaceX Stocks — Private Investment Access' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SpaceX Stocks — Private Investment Access',
    description: 'Private SpaceX investment access. Weekly returns. Invitation only.',
    creator: '@spacexstocks',
    images: ['https://www.spacestocks.finance/spacex_stocks_og_image.jpg'],
  },
  alternates: {
    canonical: 'https://www.spacestocks.finance',
  },
  other: {
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:image:type': 'image/jpeg',
    'og:locale': 'en_US',
    'og:site_name': 'SpaceX Stocks',
    'linkedin:owner': 'spacexstocks',
    'pinterest:description': 'Private SpaceX investment platform. Weekly returns. Exclusive member perks. Invitation only.',
    'pinterest:image': 'https://www.spacestocks.finance/spacex_stocks_og_image.jpg',
    'whatsapp:title': 'SpaceX Stocks — Private Investment Access',
    'whatsapp:description': 'Weekly returns. Exclusive perks. Invitation only.',
    'whatsapp:image': 'https://www.spacestocks.finance/spacex_stocks_og_image.jpg',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export default function LandingPage() {
  const html = readFileSync(join(process.cwd(), 'public', 'landing.html'), 'utf-8')
  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] || ''
  const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1]).join('\n')
  const scripts = [...html.matchAll(/<script[^>]*src="([^"]+)"[^>]*>/gi)].map(m => m[1])
  const inlineScripts = [...html.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div dangerouslySetInnerHTML={{ __html: body }} />
      {scripts.map((src, i) => (
        <script key={i} src={src} />
      ))}
      {inlineScripts.map((code, i) => (
        <script key={`inline-${i}`} dangerouslySetInnerHTML={{ __html: code }} />
      ))}
    </>
  )
}