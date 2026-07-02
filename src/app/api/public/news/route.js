export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

import { NextResponse } from 'next/server'

const RSS_FEEDS = [
  {
    url: 'https://www.nasaspaceflight.com/feed/',
    source: 'NASASpaceflight',
    icon: '🚀',
  },
  {
    url: 'https://spaceflightnow.com/feed/',
    source: 'Spaceflight Now',
    icon: '🛸',
  },
  {
    url: 'https://www.space.com/feeds/all',
    source: 'Space.com',
    icon: '🌌',
  },
  {
    url: 'https://electrek.co/feed/',
    source: 'Electrek',
    icon: '⚡',
  },
]

function parseRSS(xml, source, icon) {
  const items = []
  const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || []

  for (const item of itemMatches.slice(0, 5)) {
    const title = item.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1]?.trim()
    const link = item.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() ||
                 item.match(/<link[^>]+href="([^"]+)"/)?.[1]?.trim()
    const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim()

    if (!title) continue

    // Filter for SpaceX/Tesla/Starlink/Elon relevance
    const relevantKeywords = ['spacex', 'tesla', 'starlink', 'elon', 'falcon', 'starship', 'rocket', 'launch', 'dragon', 'musk', 'space', 'orbit', 'satellite', 'ipo', 'spcx']
    const titleLower = title.toLowerCase()
    const isRelevant = relevantKeywords.some(k => titleLower.includes(k))
    if (!isRelevant) continue

    const ts = pubDate ? new Date(pubDate).getTime() : Date.now()

    items.push({
      title: title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#8217;/g, "'").replace(/&#8220;/g, '"').replace(/&#8221;/g, '"'),
      link: link || '#',
      source,
      icon,
      ts,
      time_ago: timeAgo(ts),
    })
  }

  return items
}

function timeAgo(ts) {
  const secs = Math.floor((Date.now() - ts) / 1000)
  if (secs < 60) return `${secs}s ago`
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
  return `${Math.floor(secs / 86400)}d ago`
}

export async function GET() {
  try {
    const results = await Promise.allSettled(
      RSS_FEEDS.map(async feed => {
        const res = await fetch(feed.url, {
          headers: { 'User-Agent': 'Mozilla/5.0 SpaceXStocks/1.0' },
          signal: AbortSignal.timeout(5000),
        })
        const xml = await res.text()
        return parseRSS(xml, feed.source, feed.icon)
      })
    )

    const allItems = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value)
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 8)

    // Fallback items if no news fetched
    if (allItems.length === 0) {
      return NextResponse.json({
        items: [
          { title: 'Falcon 9 · Starlink Group 15-4 · Launch Successful', source: 'SpaceX', icon: '🚀', link: 'https://spacex.com', time_ago: '2h ago' },
          { title: 'Starship Flight 9 · Orbital Test · Scheduled', source: 'SpaceX', icon: '🛸', link: 'https://spacex.com', time_ago: '1d ago' },
          { title: 'Weekly returns processed for all active plans', source: 'SpaceX Stocks', icon: '💰', link: '#', time_ago: '3d ago' },
        ]
      })
    }

    return NextResponse.json({ items: allItems })
  } catch (err) {
    console.error('News feed error:', err.message)
    return NextResponse.json({ items: [] })
  }
}