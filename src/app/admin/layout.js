'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLayout({ children }) {
  const router = useRouter()
  const [checked, setChecked] = useState(false)
  const token = typeof window !== 'undefined' ? localStorage.getItem('sx_token') : null

  useEffect(() => {
    if (!token) { router.push('/login'); return }
    fetch('/api/auth', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.error || d.role !== 'admin') {
          router.push('/dashboard')
        } else {
          setChecked(true)
        }
      })
  }, [])

  if (!checked) return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: "'Courier New',monospace", fontSize: 9, letterSpacing: '0.4em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>
        Verifying Access...
      </div>
    </div>
  )

  return children
}