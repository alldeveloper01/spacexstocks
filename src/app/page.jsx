import { readFileSync } from 'fs'
import { join } from 'path'

export const metadata = {
  title: 'SpaceX Stocks — Private Investment Access',
  description: 'A private managed fund trading SpaceX, Tesla and the world\'s most transformative companies. Weekly returns. Exclusive member perks. Invitation only.',
  metadataBase: new URL('https://spacexstocks.finance'),
  openGraph: {
    title: 'SpaceX Stocks — Private Investment Access',
    description: 'Weekly returns. Exclusive perks. Invitation only.',
    url: 'https://spacexstocks.finance',
    siteName: 'SpaceX Stocks',
    type: 'website',
    images: [{ url: 'https://spacexstocks.finance/og-image.jpg', width: 1200, height: 630, alt: 'SpaceX Stocks — Private Investment Access' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SpaceX Stocks',
    description: 'Private SpaceX investment access. Weekly returns.',
    images: ['https://spacexstocks.finance/og-image.jpg'],
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