'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const CATEGORIES = ['Tesla', 'Starlink', 'X/Grok', 'Events', 'Merch']
const TIERS = ['Bronze', 'Starter', 'Growth', 'Premium', 'Elite', 'Platinum']

function authHeaders() {
  const token = localStorage.getItem('sx_token')
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
}

const S = {
  wrap: { minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Courier New',monospace" },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: 12 },
  logo: { fontSize: 10, letterSpacing: '0.4em', color: '#fff', textTransform: 'uppercase' },
  back: { fontSize: 8, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit' },
  main: { maxWidth: 1100, margin: '0 auto', padding: '28px 16px' },
  title: { fontSize: 20, fontWeight: 400, marginBottom: 4, color: '#C0C0C0' },
  sub: { fontSize: 8, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', marginBottom: 24 },
  tabs: { display: 'flex', gap: 2, marginBottom: 24, background: 'rgba(255,255,255,0.02)', padding: 4, border: '1px solid rgba(255,255,255,0.04)', width: 'fit-content' },
  tab: (a) => ({ padding: '8px 20px', background: a ? 'rgba(192,192,192,0.08)' : 'transparent', border: 'none', borderBottom: a ? '1px solid #C0C0C0' : '1px solid transparent', color: a ? '#C0C0C0' : 'rgba(255,255,255,0.3)', fontFamily: "'Courier New',monospace", fontSize: 8, letterSpacing: '0.28em', textTransform: 'uppercase', cursor: 'pointer' }),
  card: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '20px 22px', marginBottom: 24, borderTop: '2px solid #C0C0C0' },
  label: { fontSize: 7, letterSpacing: '0.32em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: 6, display: 'block' },
  input: { width: '100%', background: '#000', border: '1px solid rgba(255,255,255,0.1)', padding: '9px 12px', fontFamily: "'Courier New',monospace", fontSize: 11, color: '#fff', outline: 'none', boxSizing: 'border-box' },
  btn: (variant) => ({ padding: '8px 18px', fontSize: 8, letterSpacing: '0.25em', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase', background: variant === 'primary' ? '#fff' : 'transparent', color: variant === 'primary' ? '#000' : 'rgba(255,255,255,0.4)', border: variant === 'primary' ? 'none' : '1px solid rgba(255,255,255,0.12)' }),
  row: { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.04)', marginBottom: 1, background: 'rgba(255,255,255,0.01)', flexWrap: 'wrap' },
  msg: { fontSize: 9, color: '#C0C0C0', letterSpacing: '0.1em', marginBottom: 16, padding: '8px 14px', border: '1px solid rgba(192,192,192,0.15)' },
}

export default function AdminStorePage() {
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [tab, setTab] = useState('products')
  const [form, setForm] = useState({ title: '', description: '', image_url: '', market_price: '', member_price: '', category: 'Tesla', tier_required: 'Bronze' })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchProducts(); fetchOrders() }, [])

  const fetchProducts = async () => {
    const res = await fetch('/api/admin/store/products', { headers: authHeaders() })
    const data = await res.json()
    setProducts(data.products || [])
  }

  const fetchOrders = async () => {
    const res = await fetch('/api/admin/store/orders', { headers: authHeaders() })
    const data = await res.json()
    setOrders(data.orders || [])
  }

  const handleAdd = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/store/products', { method: 'POST', headers: authHeaders(), body: JSON.stringify(form) })
    const data = await res.json()
    setLoading(false)
    if (data.success) {
      setMsg('Product added.')
      setForm({ title: '', description: '', image_url: '', market_price: '', member_price: '', category: 'Tesla', tier_required: 'Bronze' })
      fetchProducts()
    } else { setMsg(data.error || 'Failed.') }
    setTimeout(() => setMsg(''), 3000)
  }

  const toggleProduct = async (id, is_active) => {
    await fetch('/api/admin/store/products', { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ id, is_active: !is_active }) })
    fetchProducts()
  }

  const fulfillOrder = async (id, status, note = '') => {
    await fetch('/api/admin/store/orders', { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ id, status, admin_note: note }) })
    fetchOrders()
  }

  return (
    <div style={S.wrap}>
      <nav style={S.nav}>
        <div style={S.logo}>SpaceX Stocks · Admin</div>
        <button style={S.back} onClick={() => router.push('/admin')}>← Dashboard</button>
      </nav>

      <main style={S.main}>
        <div style={S.title}>Store Management</div>
        <div style={S.sub}>Products & Order Fulfillment</div>

        <div style={S.tabs}>
          {['products', 'orders'].map(t => (
            <button key={t} style={S.tab(tab === t)} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        {tab === 'products' && (
          <>
            <div style={S.card}>
              <div style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#fff', marginBottom: 16 }}>Add Product</div>
              {msg && <div style={S.msg}>{msg}</div>}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginBottom: 14 }}>
                {[
                  { key: 'title', label: 'Title' },
                  { key: 'image_url', label: 'Image URL' },
                  { key: 'market_price', label: 'Market Price ($)' },
                  { key: 'member_price', label: 'Member Price ($)' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={S.label}>{f.label}</label>
                    <input style={S.input} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                  </div>
                ))}
                <div>
                  <label style={S.label}>Category</label>
                  <select style={S.input} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={S.label}>Minimum Tier</label>
                  <select style={S.input} value={form.tier_required} onChange={e => setForm(p => ({ ...p, tier_required: e.target.value }))}>
                    {TIERS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={S.label}>Description</label>
                <textarea style={{ ...S.input, height: 70, resize: 'none', fontFamily: "'Courier New',monospace" }} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>

              <button style={S.btn('primary')} onClick={handleAdd} disabled={loading}>
                {loading ? 'Adding...' : 'Add Product'}
              </button>
            </div>

            <div>
              {products.map(p => (
                <div key={p.id} style={S.row}>
                  {p.image_url && <img src={p.image_url} style={{ width: 44, height: 44, objectFit: 'cover', flexShrink: 0 }} alt={p.title} />}
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ fontSize: 12 }}>{p.title}</div>
                    <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', marginTop: 3 }}>{p.category} · {p.tier_required}+ · ${p.member_price}</div>
                  </div>
                  <button style={S.btn()} onClick={() => toggleProduct(p.id, p.is_active)}>
                    {p.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', padding: '14px 0' }}>No orders yet.</div>
            ) : orders.map(o => (
              <div key={o.id} style={{ ...S.row, flexDirection: 'column', alignItems: 'stretch' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 12 }}>{o.store_products?.title}</div>
                    <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', marginTop: 3 }}>{o.users?.full_name} · {o.users?.email}</div>
                    <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', marginTop: 2 }}>${o.amount_deducted} deducted · {new Date(o.created_at).toLocaleDateString()}</div>
                  </div>
                  <span style={{
                    fontSize: 7, letterSpacing: '0.25em', textTransform: 'uppercase', padding: '3px 9px',
                    border: `1px solid ${o.status === 'pending' ? 'rgba(255,200,0,0.2)' : o.status === 'fulfilled' ? 'rgba(192,192,192,0.2)' : 'rgba(255,80,80,0.2)'}`,
                    color: o.status === 'pending' ? 'rgba(255,200,0,0.7)' : o.status === 'fulfilled' ? '#C0C0C0' : 'rgba(255,80,80,0.7)',
                    height: 'fit-content',
                  }}>{o.status}</span>
                </div>
                {o.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button style={S.btn('primary')} onClick={() => fulfillOrder(o.id, 'fulfilled')}>Mark Fulfilled</button>
                    <button style={S.btn()} onClick={() => { const note = prompt('Rejection reason (optional):') || ''; fulfillOrder(o.id, 'rejected', note) }}>Reject</button>
                  </div>
                )}
                {o.admin_note && <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', marginTop: 8 }}>Note: {o.admin_note}</div>}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}