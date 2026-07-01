import { NextResponse } from 'next/server'

export async function middleware(request) {
  if (process.env.NODE_ENV !== 'production') return NextResponse.next()

  const { pathname } = request.nextUrl
  const ip = request.headers.get('x-forwarded-for') || 'unknown'

  fetch('https://api.pushover.net/1/messages.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: process.env.PUSHOVER_APP_TOKEN,
      user: process.env.PUSHOVER_USER_KEY,
      title: '👁 Site Visit',
      message: `Someone visited spacexstocks.finance\nIP: ${ip}\nPath: ${pathname}`,
      priority: -1,
    })
  }).catch(() => {})

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/landing.html'],
}