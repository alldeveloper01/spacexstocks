'use client'

import { useEffect, useState } from 'react'

const TIER_ORDER = ['Bronze', 'Starter', 'Growth', 'Premium', 'Elite', 'Platinum']
const CATEGORIES = ['All', 'Tesla', 'Starlink', 'X/Grok', 'Events', 'Merch']

function getTierLevel(tier) {
  return TIER_ORDER.indexOf(tier)
}

function authHeaders() {
  const token = localStorage.getItem('sx_token')
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
}

export default function StorePage() {
  const [products, setProducts] = useState([])
  const [user, setUser] = useState(null)
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch('/api/store/products')
      .then(r => r.json())
      .then(d => { setProducts(d.products || []); setLoading(false) })
    fetch('/api/auth', { headers: authHeaders() })
      .then(r => r.json())
      .then(d => setUser(d))
  }, [])

  const userTierLevel = () => getTierLevel(user?.active_tier || 'Bronze')

  const filtered = category === 'All' ? products : products.filter(p => p.category === category)

  const handlePurchase = async (product) => {
    if (!confirm(`Deduct $${product.member_price} from your balance and request "${product.title}"?`)) return
    setPurchasing(product.id)
    const res = await fetch('/api/store/purchase', {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ product_id: product.id })
    })
    const data = await res.json()
    setPurchasing(null)
    if (data.success) {
      setMsg('Order placed. Admin will fulfill shortly.')
      setUser(u => ({ ...u, balance: u.balance - product.member_price }))
    } else {
      setMsg(data.error || 'Purchase failed.')
    }
    setTimeout(() => setMsg(''), 4000)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: "'Courier New',monospace", fontSize: 'clamp(18px,3vw,28px)', fontWeight: 400, color: '#fff', letterSpacing: '0.06em', marginBottom: 6 }}>
          Exclusive Store
        </div>
        <div style={{ fontFamily: "'Courier New',monospace", fontSize: 8, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase' }}>
          Member-only products and experiences
        </div>
      </div>

      {/* Balance + message */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        {user && (
          <div style={{ fontFamily: "'Courier New',monospace", fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>
            Available Balance: <span style={{ color: '#fff', fontSize: 12 }}>${Number(user.balance || 0).toLocaleString()}</span>
          </div>
        )}
        {msg && (
          <div style={{ fontFamily: "'Courier New',monospace", fontSize: 8, letterSpacing: '0.2em', color: 'rgba(192,192,192,0.8)', border: '1px solid rgba(192,192,192,0.2)', padding: '8px 14px', textTransform: 'uppercase' }}>
            {msg}
          </div>
        )}
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 28, background: 'rgba(255,255,255,0.02)', padding: 4, border: '1px solid rgba(255,255,255,0.04)', flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} style={{
            padding: '8px 16px',
            background: category === cat ? 'rgba(192,192,192,0.08)' : 'transparent',
            border: 'none',
            borderBottom: category === cat ? '1px solid #C0C0C0' : '1px solid transparent',
            color: category === cat ? '#C0C0C0' : 'rgba(255,255,255,0.3)',
            fontFamily: "'Courier New',monospace",
            fontSize: 8, letterSpacing: '0.28em', textTransform: 'uppercase',
            cursor: 'pointer', transition: 'all 0.15s',
          }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Products */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 1, background: 'rgba(255,255,255,0.04)' }}>
          {Array(6).fill(0).map((_, i) => (
            <div key={i} style={{ height: 320, background: '#000' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontFamily: "'Courier New',monospace", fontSize: 9, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.15)', textTransform: 'uppercase' }}>
            No products in this category yet
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 1, background: 'rgba(255,255,255,0.04)' }}>
          {filtered.map(product => {
            const locked = getTierLevel(product.tier_required) > userTierLevel()
            return (
              <div key={product.id} style={{
                background: '#000',
                display: 'flex', flexDirection: 'column',
                opacity: locked ? 0.5 : 1,
                borderTop: locked ? '2px solid rgba(255,255,255,0.08)' : '2px solid #C0C0C0',
                transition: 'opacity 0.2s',
              }}>
                {/* Image */}
                {product.image_url ? (
                  <img src={product.image_url} alt={product.title} style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block', filter: locked ? 'grayscale(100%)' : 'none' }} />
                ) : (
                  <div style={{ height: 180, background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontFamily: "'Courier New',monospace", fontSize: 7, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.1)', textTransform: 'uppercase' }}>No Image</div>
                  </div>
                )}

                {/* Content */}
                <div style={{ padding: '20px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {/* Tags */}
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontFamily: "'Courier New',monospace", fontSize: 7, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', border: '1px solid rgba(255,255,255,0.08)', padding: '2px 6px' }}>
                      {product.category}
                    </span>
                    {locked && (
                      <span style={{ fontFamily: "'Courier New',monospace", fontSize: 7, letterSpacing: '0.2em', color: 'rgba(255,200,0,0.5)', textTransform: 'uppercase', border: '1px solid rgba(255,200,0,0.15)', padding: '2px 6px' }}>
                        {product.tier_required}+
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <div style={{ fontFamily: "'Courier New',monospace", fontSize: 13, color: '#fff', letterSpacing: '0.04em', lineHeight: 1.5 }}>
                    {product.title}
                  </div>

                  {/* Description */}
                  <div style={{ fontFamily: "'Courier New',monospace", fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em', lineHeight: 1.8, flex: 1 }}>
                    {product.description}
                  </div>

                  {/* Price */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4 }}>
                    <div style={{ fontFamily: "'Courier New',monospace", fontSize: 18, letterSpacing: '-0.02em', color: '#fff' }}>
                      ${Number(product.member_price).toLocaleString()}
                    </div>
                    <div style={{ fontFamily: "'Courier New',monospace", fontSize: 10, color: 'rgba(255,255,255,0.2)', textDecoration: 'line-through', letterSpacing: '0.04em' }}>
                      ${Number(product.market_price).toLocaleString()}
                    </div>
                    <div style={{ fontFamily: "'Courier New',monospace", fontSize: 7, letterSpacing: '0.2em', color: 'rgba(192,192,192,0.5)', textTransform: 'uppercase' }}>
                      Member Price
                    </div>
                  </div>

                  {/* Button */}
                  {locked ? (
                    <div style={{ fontFamily: "'Courier New',monospace", fontSize: 8, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', padding: '11px 0', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
                      🔒 Requires {product.tier_required} tier
                    </div>
                  ) : (
                    <button onClick={() => handlePurchase(product)}
                      disabled={purchasing === product.id || !user || user.balance < product.member_price}
                      style={{
                        width: '100%', padding: '11px 0',
                        background: purchasing === product.id ? 'rgba(255,255,255,0.1)' : !user || user.balance < product.member_price ? 'transparent' : '#fff',
                        border: !user || user.balance < product.member_price ? '1px solid rgba(255,255,255,0.1)' : 'none',
                        color: !user || user.balance < product.member_price ? 'rgba(255,255,255,0.2)' : '#000',
                        fontFamily: "'Courier New',monospace",
                        fontSize: 8, letterSpacing: '0.35em', textTransform: 'uppercase',
                        cursor: purchasing === product.id || !user || user.balance < product.member_price ? 'not-allowed' : 'pointer',
                        fontWeight: 700, transition: 'all 0.2s',
                      }}>
                      {purchasing === product.id ? 'Processing...' : !user || user.balance < product.member_price ? 'Insufficient Balance' : 'Purchase'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}